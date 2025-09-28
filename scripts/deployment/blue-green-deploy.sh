#!/bin/bash

###############################################################################
# Blue-Green Deployment Script for Claude Agentic Workflow System
#
# This script implements a zero-downtime blue-green deployment strategy:
# 1. Deploy to inactive environment (green if blue is live, blue if green is live)
# 2. Run health checks on new deployment
# 3. Switch traffic to new environment
# 4. Keep old environment as rollback option
###############################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Default values
ENVIRONMENT="production"
DEPLOYMENT_PACKAGE=""
HEALTH_CHECK_TIMEOUT=300  # 5 minutes
HEALTH_CHECK_INTERVAL=10  # 10 seconds
ROLLBACK_TIMEOUT=600      # 10 minutes

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# Usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Blue-Green Deployment Script for Claude Agentic Workflow System

OPTIONS:
    -e, --environment ENV      Target environment (staging|production) [default: production]
    -p, --package PATH         Path to deployment package
    -t, --timeout SECONDS     Health check timeout [default: 300]
    -h, --help                Show this help message

EXAMPLES:
    $0 --environment production --package /path/to/package.tar.gz
    $0 -e staging -p ./linear-tdd-workflow.tar.gz

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -p|--package)
                DEPLOYMENT_PACKAGE="$2"
                shift 2
                ;;
            -t|--timeout)
                HEALTH_CHECK_TIMEOUT="$2"
                shift 2
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done

    # Validate required arguments
    if [[ -z "$DEPLOYMENT_PACKAGE" ]]; then
        log_error "Deployment package is required"
        usage
        exit 1
    fi

    if [[ ! -f "$DEPLOYMENT_PACKAGE" ]]; then
        log_error "Deployment package not found: $DEPLOYMENT_PACKAGE"
        exit 1
    fi
}

# Get current active environment (blue or green)
get_active_environment() {
    local load_balancer_config="/etc/nginx/sites-enabled/linear-tdd-workflow"

    if [[ -f "$load_balancer_config" ]]; then
        if grep -q "upstream.*blue" "$load_balancer_config"; then
            echo "blue"
        elif grep -q "upstream.*green" "$load_balancer_config"; then
            echo "green"
        else
            echo "none"
        fi
    else
        echo "none"
    fi
}

# Get inactive environment (opposite of active)
get_inactive_environment() {
    local active=$(get_active_environment)

    case $active in
        blue)
            echo "green"
            ;;
        green)
            echo "blue"
            ;;
        none|*)
            echo "blue"  # Default to blue if none is active
            ;;
    esac
}

# Deploy to target environment
deploy_to_environment() {
    local target_env="$1"
    local package_path="$2"

    log_info "Deploying to $target_env environment..."

    # Environment-specific paths
    local app_dir="/opt/linear-tdd-workflow-$target_env"
    local service_name="linear-tdd-workflow-$target_env"

    # Stop the target environment service
    log_info "Stopping $service_name service..."
    sudo systemctl stop "$service_name" || true

    # Backup current deployment
    if [[ -d "$app_dir" ]]; then
        log_info "Backing up current $target_env deployment..."
        sudo mv "$app_dir" "${app_dir}.backup.$(date +%s)"
    fi

    # Create application directory
    sudo mkdir -p "$app_dir"

    # Extract deployment package
    log_info "Extracting deployment package to $app_dir..."
    sudo tar -xzf "$package_path" -C "$app_dir" --strip-components=1

    # Set proper permissions
    sudo chown -R app:app "$app_dir"
    sudo chmod +x "$app_dir/scripts/start.sh"

    # Install dependencies
    log_info "Installing dependencies in $target_env..."
    cd "$app_dir"
    sudo -u app npm ci --production

    # Update environment configuration
    log_info "Configuring environment for $target_env..."
    sudo -u app cp "config/environments/$ENVIRONMENT.env" "$app_dir/.env"

    # Update port configuration (blue=3001, green=3002)
    local port
    if [[ "$target_env" == "blue" ]]; then
        port=3001
    else
        port=3002
    fi

    echo "PORT=$port" | sudo -u app tee -a "$app_dir/.env"

    # Start the service
    log_info "Starting $service_name service..."
    sudo systemctl start "$service_name"
    sudo systemctl enable "$service_name"

    log_success "Deployment to $target_env completed"
}

# Run health checks on target environment
run_health_checks() {
    local target_env="$1"
    local port

    if [[ "$target_env" == "blue" ]]; then
        port=3001
    else
        port=3002
    fi

    local health_url="http://localhost:$port/health"
    local start_time=$(date +%s)
    local end_time=$((start_time + HEALTH_CHECK_TIMEOUT))

    log_info "Running health checks on $target_env environment (port $port)..."

    while [[ $(date +%s) -lt $end_time ]]; do
        if curl -f -s "$health_url" > /dev/null; then
            # Additional comprehensive health checks
            local memory_check=$(curl -s "$health_url/memory" | jq -r '.withinLimits // false')
            local agents_check=$(curl -s "$health_url/agents" | jq -r '.allHealthy // false')
            local db_check=$(curl -s "$health_url/database" | jq -r '.connected // false')

            if [[ "$memory_check" == "true" && "$agents_check" == "true" && "$db_check" == "true" ]]; then
                log_success "Health checks passed for $target_env environment"
                return 0
            else
                log_warning "Health check details - Memory: $memory_check, Agents: $agents_check, DB: $db_check"
            fi
        else
            log_info "Health check failed, retrying in $HEALTH_CHECK_INTERVAL seconds..."
        fi

        sleep $HEALTH_CHECK_INTERVAL
    done

    log_error "Health checks failed for $target_env environment after $HEALTH_CHECK_TIMEOUT seconds"
    return 1
}

# Switch traffic to new environment
switch_traffic() {
    local new_env="$1"
    local old_env="$2"

    log_info "Switching traffic from $old_env to $new_env..."

    # Update load balancer configuration
    local nginx_config="/etc/nginx/sites-available/linear-tdd-workflow"
    local nginx_enabled="/etc/nginx/sites-enabled/linear-tdd-workflow"

    # Backup current config
    sudo cp "$nginx_enabled" "/tmp/nginx-config.backup.$(date +%s)"

    # Generate new configuration
    cat << EOF | sudo tee "$nginx_config"
upstream linear_tdd_workflow {
    server localhost:$([ "$new_env" == "blue" ] && echo "3001" || echo "3002");
}

server {
    listen 80;
    server_name linear-tdd-workflow.com;

    location / {
        proxy_pass http://linear_tdd_workflow;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        proxy_pass http://linear_tdd_workflow/health;
        access_log off;
    }
}
EOF

    # Test nginx configuration
    if sudo nginx -t; then
        sudo systemctl reload nginx
        log_success "Traffic switched to $new_env environment"
    else
        log_error "Nginx configuration test failed"
        return 1
    fi
}

# Rollback to previous environment
rollback_deployment() {
    local current_env="$1"
    local rollback_env="$2"

    log_warning "Rolling back from $current_env to $rollback_env..."

    # Switch traffic back
    if switch_traffic "$rollback_env" "$current_env"; then
        log_success "Rollback completed successfully"

        # Stop the failed deployment
        sudo systemctl stop "linear-tdd-workflow-$current_env" || true

        return 0
    else
        log_error "Rollback failed"
        return 1
    fi
}

# Run deployment smoke tests
run_smoke_tests() {
    local target_env="$1"

    log_info "Running smoke tests on $target_env environment..."

    # Run E2E tests against the new deployment
    cd "$PROJECT_ROOT"

    # Set environment variables for testing
    export NODE_ENV="$ENVIRONMENT"
    export TEST_TARGET_ENV="$target_env"

    # Run smoke tests
    if npm run test:smoke; then
        log_success "Smoke tests passed"
        return 0
    else
        log_error "Smoke tests failed"
        return 1
    fi
}

# Main deployment function
main() {
    log_info "Starting blue-green deployment for $ENVIRONMENT environment"
    log_info "Package: $DEPLOYMENT_PACKAGE"

    # Get current state
    local active_env=$(get_active_environment)
    local target_env=$(get_inactive_environment)

    log_info "Current active environment: $active_env"
    log_info "Target deployment environment: $target_env"

    # Deploy to inactive environment
    if ! deploy_to_environment "$target_env" "$DEPLOYMENT_PACKAGE"; then
        log_error "Deployment to $target_env failed"
        exit 1
    fi

    # Run health checks
    if ! run_health_checks "$target_env"; then
        log_error "Health checks failed for $target_env"
        exit 1
    fi

    # Run smoke tests
    if ! run_smoke_tests "$target_env"; then
        log_error "Smoke tests failed for $target_env"
        exit 1
    fi

    # Switch traffic
    if ! switch_traffic "$target_env" "$active_env"; then
        log_error "Traffic switch failed"
        exit 1
    fi

    # Verify new deployment is working
    sleep 30  # Allow time for connections to settle

    if ! run_health_checks "$target_env"; then
        log_error "Post-switch health checks failed, rolling back..."
        rollback_deployment "$target_env" "$active_env"
        exit 1
    fi

    # Stop old environment (keep as rollback option)
    if [[ "$active_env" != "none" ]]; then
        log_info "Stopping old $active_env environment (keeping as rollback option)..."
        sudo systemctl stop "linear-tdd-workflow-$active_env"
    fi

    log_success "Blue-green deployment completed successfully!"
    log_info "Active environment: $target_env"
    log_info "Rollback environment: $active_env (stopped)"
}

# Cleanup function for graceful exit
cleanup() {
    local exit_code=$?

    if [[ $exit_code -ne 0 ]]; then
        log_error "Deployment failed with exit code $exit_code"

        # Attempt rollback if we're in the middle of deployment
        local active_env=$(get_active_environment)
        local target_env=$(get_inactive_environment)

        if [[ "$active_env" != "none" ]]; then
            log_warning "Attempting emergency rollback..."
            rollback_deployment "$target_env" "$active_env" || true
        fi
    fi

    exit $exit_code
}

# Set up signal handlers
trap cleanup EXIT
trap cleanup INT
trap cleanup TERM

# Parse arguments and run main function
parse_args "$@"
main