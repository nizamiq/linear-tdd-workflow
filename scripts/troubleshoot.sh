#!/bin/bash

# Claude Agentic Workflow System - Troubleshooting Script
# Automated diagnosis and common issue resolution

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[FIXED]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

action() {
    echo -e "${CYAN}[ACTION]${NC} $1"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Prompt for user confirmation
confirm() {
    local message="$1"
    local default="${2:-n}"

    if [ "$default" = "y" ]; then
        local prompt="[Y/n]"
    else
        local prompt="[y/N]"
    fi

    echo -n -e "${CYAN}$message $prompt: ${NC}"
    read -r response

    response=${response:-$default}
    case "$response" in
        [yY][eE][sS]|[yY]) return 0 ;;
        *) return 1 ;;
    esac
}

# Common Issue 1: Missing dependencies
fix_missing_dependencies() {
    log "Checking for missing dependencies..."

    if [ ! -f "package.json" ]; then
        error "package.json not found - this doesn't appear to be a Node.js project"
        return 1
    fi

    if [ ! -d "node_modules" ]; then
        warn "node_modules directory missing"
        if confirm "Install dependencies with npm install?" "y"; then
            action "Running npm install..."
            npm install
            success "Dependencies installed"
        fi
    fi

    # Check for lock file consistency
    if [ -f "package-lock.json" ] && [ -f "yarn.lock" ]; then
        warn "Both package-lock.json and yarn.lock found - this can cause issues"
        if confirm "Remove yarn.lock to use npm consistently?" "y"; then
            rm yarn.lock
            success "Removed yarn.lock"
        fi
    fi

    # Check for outdated packages
    if command_exists npm; then
        log "Checking for outdated packages..."
        if npm outdated --silent >/dev/null 2>&1; then
            log "All packages are up to date"
        else
            warn "Some packages are outdated"
            if confirm "Update packages with npm update?" "n"; then
                action "Running npm update..."
                npm update
                success "Packages updated"
            fi
        fi
    fi
}

# Common Issue 2: File permissions
fix_file_permissions() {
    log "Checking file permissions..."

    local files_to_check=(
        ".claude/cli.js"
        "scripts/install.sh"
        "scripts/verify-installation.sh"
        "scripts/troubleshoot.sh"
    )

    for file in "${files_to_check[@]}"; do
        if [ -f "$file" ] && [ ! -x "$file" ]; then
            warn "File $file is not executable"
            if confirm "Make $file executable?" "y"; then
                chmod +x "$file"
                success "Made $file executable"
            fi
        fi
    done

    # Check .claude directory permissions
    if [ -d ".claude" ]; then
        if [ ! -r ".claude" ] || [ ! -w ".claude" ]; then
            warn ".claude directory has permission issues"
            if confirm "Fix .claude directory permissions?" "y"; then
                chmod -R u+rw .claude/
                success "Fixed .claude directory permissions"
            fi
        fi
    fi
}

# Common Issue 3: CLI not responding
fix_cli_issues() {
    log "Diagnosing CLI issues..."

    if [ ! -f ".claude/cli.js" ]; then
        error "CLI script missing - installation may be incomplete"
        if confirm "Re-run installation script?" "y"; then
            if [ -f "../claude-workflow/scripts/install.sh" ]; then
                action "Re-running installation..."
                ../claude-workflow/scripts/install.sh
                success "Installation completed"
            else
                error "Installation script not found at ../claude-workflow/scripts/install.sh"
                return 1
            fi
        fi
        return 0
    fi

    # Test basic CLI functionality
    if ! node .claude/cli.js --version >/dev/null 2>&1; then
        warn "CLI not responding to basic commands"

        # Check Node.js version
        if ! command_exists node; then
            error "Node.js not found - please install Node.js ≥18.0.0"
            return 1
        fi

        local node_version=$(node --version | sed 's/v//')
        local required_major=18
        local current_major=$(echo "$node_version" | cut -d. -f1)

        if [ "$current_major" -lt "$required_major" ]; then
            error "Node.js version $node_version is too old (≥18.0.0 required)"
            action "Please update Node.js to version 18 or higher"
            return 1
        fi

        # Check for syntax errors in CLI
        if ! node -c .claude/cli.js >/dev/null 2>&1; then
            error "Syntax error in CLI script"
            if confirm "Restore CLI from backup?" "y"; then
                if [ -f ".claude-backup/cli.js" ]; then
                    cp .claude-backup/cli.js .claude/cli.js
                    success "Restored CLI from backup"
                else
                    error "No backup found - re-installation may be needed"
                fi
            fi
        fi
    else
        success "CLI is responsive"
    fi
}

# Common Issue 4: Test configuration problems
fix_test_configuration() {
    log "Checking test configuration..."

    # Check for Jest configuration
    local jest_config_found=false
    local jest_configs=("jest.config.js" "jest.config.json" "jest.config.ts")

    for config in "${jest_configs[@]}"; do
        if [ -f "$config" ]; then
            jest_config_found=true
            log "Found Jest configuration: $config"
            break
        fi
    done

    if [ "$jest_config_found" = false ] && ! grep -q '"jest":' package.json 2>/dev/null; then
        warn "No Jest configuration found"
        if confirm "Create basic Jest configuration?" "y"; then
            action "Creating jest.config.js..."
            cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
EOF
            success "Created jest.config.js"
        fi
    fi

    # Check for test directory
    local test_dirs=("tests" "test" "__tests__")
    local test_dir_found=false

    for dir in "${test_dirs[@]}"; do
        if [ -d "$dir" ]; then
            test_dir_found=true
            break
        fi
    done

    if [ "$test_dir_found" = false ]; then
        warn "No test directory found"
        if confirm "Create tests directory with sample test?" "y"; then
            action "Creating tests directory..."
            mkdir -p tests/unit tests/integration tests/e2e

            # Create sample test
            cat > tests/unit/sample.test.js << 'EOF'
// Sample test to verify Jest configuration
describe('Sample Test Suite', () => {
  test('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  test('should demonstrate async testing', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});
EOF
            success "Created tests directory with sample test"
        fi
    fi

    # Test Jest installation
    if ! npm test --silent >/dev/null 2>&1; then
        warn "Tests not running properly"
        if confirm "Install Jest and related dependencies?" "y"; then
            action "Installing test dependencies..."
            npm install --save-dev jest @types/jest ts-jest
            success "Test dependencies installed"
        fi
    fi
}

# Common Issue 5: Git configuration problems
fix_git_configuration() {
    log "Checking Git configuration..."

    if ! command_exists git; then
        warn "Git not installed - version control features will not work"
        action "Please install Git: https://git-scm.com/downloads"
        return 0
    fi

    # Check if we're in a Git repository
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        warn "Not in a Git repository"
        if confirm "Initialize Git repository?" "y"; then
            action "Initializing Git repository..."
            git init
            success "Git repository initialized"
        fi
    fi

    # Check .gitignore
    if [ ! -f ".gitignore" ]; then
        warn ".gitignore file missing"
        if confirm "Create .gitignore file?" "y"; then
            action "Creating .gitignore..."
            cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.tsbuildinfo

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Test coverage
coverage/
.nyc_output/

# Logs
logs/
*.log

# Claude workflow temporary files
.claude/reports/
.claude/logs/
.claude-backup/
EOF
            success "Created .gitignore file"
        fi
    else
        # Check if important entries are in .gitignore
        local important_ignores=("node_modules" ".env" "coverage")
        for ignore in "${important_ignores[@]}"; do
            if ! grep -q "$ignore" .gitignore; then
                warn "$ignore not found in .gitignore"
                if confirm "Add $ignore to .gitignore?" "y"; then
                    echo "$ignore" >> .gitignore
                    success "Added $ignore to .gitignore"
                fi
            fi
        done
    fi
}

# Common Issue 6: Environment configuration
fix_environment_configuration() {
    log "Checking environment configuration..."

    # Check for .env file exposure
    if [ -f ".env" ] && git ls-files --error-unmatch .env >/dev/null 2>&1; then
        error ".env file is tracked by Git - this is a security risk!"
        if confirm "Remove .env from Git tracking?" "y"; then
            git rm --cached .env
            success "Removed .env from Git tracking"
        fi
    fi

    # Check for example environment file
    if [ ! -f ".env.example" ] && [ -f ".env" ]; then
        warn "No .env.example file found"
        if confirm "Create .env.example template?" "y"; then
            action "Creating .env.example..."
            # Create sanitized version of .env
            sed 's/=.*/=/' .env > .env.example
            success "Created .env.example"
        fi
    fi
}

# System diagnostics
run_system_diagnostics() {
    log "Running system diagnostics..."

    echo ""
    echo "=== SYSTEM INFORMATION ==="
    echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
    echo "npm: $(npm --version 2>/dev/null || echo 'Not installed')"
    echo "Git: $(git --version 2>/dev/null || echo 'Not installed')"
    echo "Operating System: $(uname -s) $(uname -r)"
    echo "Current Directory: $(pwd)"
    echo "User: $(whoami)"

    echo ""
    echo "=== PROJECT INFORMATION ==="
    if [ -f "package.json" ]; then
        echo "Project Name: $(grep '"name"' package.json | cut -d'"' -f4 2>/dev/null || echo 'Unknown')"
        echo "Project Version: $(grep '"version"' package.json | cut -d'"' -f4 2>/dev/null || echo 'Unknown')"
    else
        echo "No package.json found"
    fi

    echo ""
    echo "=== CLAUDE WORKFLOW STATUS ==="
    if [ -f ".claude/cli.js" ]; then
        echo "CLI Status: Available"
        if node .claude/cli.js --version >/dev/null 2>&1; then
            echo "CLI Test: ✅ Responsive"
        else
            echo "CLI Test: ❌ Not responding"
        fi
    else
        echo "CLI Status: ❌ Missing"
    fi

    if [ -d ".claude/agents" ]; then
        local agent_count=$(find .claude/agents -name "*.md" | wc -l)
        echo "Agent Specifications: $agent_count files found"
    else
        echo "Agent Specifications: ❌ Directory missing"
    fi

    echo ""
    echo "=== DISK SPACE ==="
    df -h . | tail -1 | awk '{print "Available Space: " $4 " (" $5 " used)"}'

    echo ""
    echo "=== RECENT ERRORS ==="
    if [ -f ".claude/logs/errors.log" ]; then
        echo "Recent errors from .claude/logs/errors.log:"
        tail -5 .claude/logs/errors.log 2>/dev/null || echo "No recent errors"
    else
        echo "No error log found"
    fi
}

# Interactive troubleshooting menu
interactive_menu() {
    while true; do
        echo ""
        echo -e "${CYAN}🔧 Claude Workflow Troubleshooting Menu${NC}"
        echo "========================================"
        echo "1. Fix missing dependencies"
        echo "2. Fix file permissions"
        echo "3. Fix CLI issues"
        echo "4. Fix test configuration"
        echo "5. Fix Git configuration"
        echo "6. Fix environment configuration"
        echo "7. Run system diagnostics"
        echo "8. Run full verification"
        echo "9. Exit"
        echo ""
        echo -n "Select option [1-9]: "

        read -r choice
        case $choice in
            1) fix_missing_dependencies ;;
            2) fix_file_permissions ;;
            3) fix_cli_issues ;;
            4) fix_test_configuration ;;
            5) fix_git_configuration ;;
            6) fix_environment_configuration ;;
            7) run_system_diagnostics ;;
            8)
                if [ -f "scripts/verify-installation.sh" ]; then
                    action "Running verification script..."
                    ./scripts/verify-installation.sh
                else
                    error "Verification script not found"
                fi
                ;;
            9) break ;;
            *) warn "Invalid option. Please select 1-9." ;;
        esac

        echo ""
        echo "Press Enter to continue..."
        read -r
    done
}

# Automated fix routine
auto_fix() {
    log "Running automated troubleshooting..."

    fix_missing_dependencies
    echo ""

    fix_file_permissions
    echo ""

    fix_cli_issues
    echo ""

    fix_test_configuration
    echo ""

    fix_git_configuration
    echo ""

    fix_environment_configuration
    echo ""

    success "Automated troubleshooting completed"

    if [ -f "scripts/verify-installation.sh" ]; then
        log "Running verification to check if issues are resolved..."
        ./scripts/verify-installation.sh --quick
    fi
}

# Main function
main() {
    echo -e "${BLUE}🔧 Claude Agentic Workflow System - Troubleshooting${NC}"
    echo "====================================================="
    echo ""

    case "${1:-}" in
        --auto)
            auto_fix
            ;;
        --diagnostics)
            run_system_diagnostics
            ;;
        --help)
            echo "Usage: $0 [--auto|--diagnostics|--interactive|--help]"
            echo ""
            echo "Options:"
            echo "  --auto         Run automated troubleshooting"
            echo "  --diagnostics  Show system diagnostics only"
            echo "  --interactive  Interactive troubleshooting menu (default)"
            echo "  --help         Show this help message"
            exit 0
            ;;
        *)
            interactive_menu
            ;;
    esac
}

main "$@"