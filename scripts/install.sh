#!/bin/bash

# Claude Agentic Workflow System - Installation Script
# Intelligently installs the workflow system into target projects

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_ROOT="$(dirname "$SCRIPT_DIR")"
AUTO_CONFIRM=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --auto-confirm)
            AUTO_CONFIRM=true
            shift
            ;;
        --help)
            echo "Usage: $0 [TARGET_DIR] [--auto-confirm] [--help]"
            echo ""
            echo "Arguments:"
            echo "  TARGET_DIR      Directory to install into (default: current directory)"
            echo "  --auto-confirm  Skip confirmation prompts (useful for testing)"
            echo "  --help          Show this help message"
            exit 0
            ;;
        -*)
            echo "Unknown option $1"
            exit 1
            ;;
        *)
            TARGET_DIR="$1"
            shift
            ;;
    esac
done

TARGET_DIR="${TARGET_DIR:-.}"
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        exit 1
    fi

    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"

    # Simple version comparison without external dependencies
    local node_major=$(echo "$node_version" | cut -d. -f1)
    local required_major=$(echo "$required_version" | cut -d. -f1)

    if [ "$node_major" -lt "$required_major" ]; then
        log_error "Node.js version $required_version or higher is required (found: $node_version)"
        exit 1
    fi

    log_success "Node.js version $node_version detected"

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is required but not installed"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Detect project type and characteristics
detect_project() {
    log_info "Analyzing target project: $TARGET_DIR"

    local project_type="unknown"
    local languages=()
    local package_manager="npm"

    # Detect languages and frameworks
    if [[ -f "$TARGET_DIR/package.json" ]]; then
        languages+=("javascript")
        if [[ -f "$TARGET_DIR/tsconfig.json" ]] || find "$TARGET_DIR" -name "*.ts" -o -name "*.tsx" | head -1 | grep -q .; then
            languages+=("typescript")
        fi
        project_type="nodejs"
    fi

    if [[ -f "$TARGET_DIR/pyproject.toml" ]] || [[ -f "$TARGET_DIR/setup.py" ]] || [[ -f "$TARGET_DIR/requirements.txt" ]]; then
        languages+=("python")
        if [[ "$project_type" == "nodejs" ]]; then
            project_type="polyglot"
        else
            project_type="python"
        fi

        if [[ -f "$TARGET_DIR/pyproject.toml" ]]; then
            package_manager="poetry"
        else
            package_manager="pip"
        fi
    fi

    # Detect package manager for Node.js projects
    if [[ "$project_type" == "nodejs" ]] || [[ "$project_type" == "polyglot" ]]; then
        if [[ -f "$TARGET_DIR/yarn.lock" ]]; then
            package_manager="yarn"
        elif [[ -f "$TARGET_DIR/pnpm-lock.yaml" ]]; then
            package_manager="pnpm"
        fi
    fi

    log_info "Project type: $project_type"
    log_info "Languages: ${languages[*]:-none}"
    log_info "Package manager: $package_manager"

    # Export for use in other functions
    export DETECTED_PROJECT_TYPE="$project_type"
    export DETECTED_LANGUAGES="${languages[*]:-}"
    export DETECTED_PACKAGE_MANAGER="$package_manager"
}

# Backup existing files
create_backup() {
    log_info "Creating backup of existing files..."

    local backup_dir="$TARGET_DIR/.claude-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"

    # Backup files that will be modified
    local files_to_backup=("package.json" "tsconfig.json" "pyproject.toml" "Makefile" "CLAUDE.md")

    for file in "${files_to_backup[@]}"; do
        if [[ -f "$TARGET_DIR/$file" ]]; then
            cp "$TARGET_DIR/$file" "$backup_dir/$file.bak"
            log_info "Backed up $file"
        fi
    done

    log_success "Backup created at $backup_dir"
    export BACKUP_DIR="$backup_dir"
}

# Install .claude directory
install_claude_directory() {
    log_info "Installing .claude directory..."

    if [[ -d "$TARGET_DIR/.claude" ]]; then
        log_warning ".claude directory already exists"

        # Check if it's our workflow system
        if [[ -f "$TARGET_DIR/.claude/mcp.json" ]]; then
            log_info "Existing Claude workflow detected, updating..."
            rm -rf "$TARGET_DIR/.claude"
        else
            log_error "Existing .claude directory is not a Claude workflow system"
            log_error "Please remove or rename the existing .claude directory"
            exit 1
        fi
    fi

    # Copy .claude directory
    cp -r "$WORKFLOW_ROOT/.claude" "$TARGET_DIR/"

    # Make CLI executable
    chmod +x "$TARGET_DIR/.claude/cli.js"

    log_success ".claude directory installed"
}

# Handle CLAUDE.md file intelligently
handle_claude_md() {
    log_info "Handling CLAUDE.md file..."

    local claude_md="$TARGET_DIR/CLAUDE.md"
    local workflow_marker="## Claude Agentic Workflow System"

    if [[ -f "$claude_md" ]]; then
        if grep -q "$workflow_marker" "$claude_md"; then
            log_info "CLAUDE.md already contains workflow instructions"

            # Check if we should update
            read -p "Update existing workflow instructions? [y/N]: " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                # Remove existing workflow section and re-add
                local temp_file=$(mktemp)
                awk "/$workflow_marker/,/^---$|EOF/ { if (/^---$/) found_end=1; if (!found_end) next } 1" "$claude_md" > "$temp_file"
                mv "$temp_file" "$claude_md"

                # Append updated workflow instructions
                echo -e "\n---\n" >> "$claude_md"
                cat "$WORKFLOW_ROOT/.claude/templates/claude-md-append.template" >> "$claude_md"

                log_success "Updated workflow instructions in CLAUDE.md"
            else
                log_info "Skipping CLAUDE.md update"
            fi
        else
            log_info "Appending workflow instructions to existing CLAUDE.md"

            # Preserve existing content and append workflow instructions
            echo -e "\n---\n" >> "$claude_md"
            cat "$WORKFLOW_ROOT/.claude/templates/claude-md-append.template" >> "$claude_md"

            log_success "Appended workflow instructions to CLAUDE.md"
        fi
    else
        log_info "Creating new CLAUDE.md with workflow instructions"

        # Create project-specific CLAUDE.md from template
        cat > "$claude_md" << EOF
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Enhanced with Claude Agentic Workflow System** - Multi-agent autonomous code quality management system that enforces strict Test-Driven Development.

$(cat "$WORKFLOW_ROOT/.claude/templates/claude-md-append.template")
EOF

        log_success "Created new CLAUDE.md with workflow instructions"
    fi
}

# Enhance package.json with workflow scripts
enhance_package_json() {
    log_info "Enhancing package.json with workflow scripts..."

    local package_json="$TARGET_DIR/package.json"

    if [[ -f "$package_json" ]]; then
        # Use Node.js script to enhance package.json
        node "$WORKFLOW_ROOT/scripts/enhance-package-json.js" "$package_json"
        log_success "Enhanced existing package.json with workflow scripts"
    else
        log_info "No package.json found, creating from template..."
        cp "$WORKFLOW_ROOT/.claude/templates/package.json.template" "$package_json"

        # Customize template with project details
        local project_name=$(basename "$TARGET_DIR")
        sed -i.bak "s/\"name\": \".*\"/\"name\": \"$project_name\"/" "$package_json"
        rm -f "$package_json.bak"

        log_success "Created new package.json with workflow scripts"
    fi
}

# Install Makefile if needed
install_makefile() {
    log_info "Installing/updating Makefile..."

    local makefile="$TARGET_DIR/Makefile"

    if [[ -f "$makefile" ]]; then
        # Check if it already has workflow commands
        if grep -q "# Claude Agentic Workflow" "$makefile"; then
            log_info "Makefile already contains workflow commands"
        else
            log_info "Appending workflow commands to existing Makefile"
            echo -e "\n# Claude Agentic Workflow System Commands" >> "$makefile"
            cat "$WORKFLOW_ROOT/.claude/templates/Makefile.template" >> "$makefile"
            log_success "Enhanced existing Makefile with workflow commands"
        fi
    else
        log_info "Creating new Makefile with workflow commands"
        cp "$WORKFLOW_ROOT/.claude/templates/Makefile.template" "$makefile"
        log_success "Created new Makefile with workflow commands"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing workflow dependencies..."

    cd "$TARGET_DIR"

    case "$DETECTED_PACKAGE_MANAGER" in
        "yarn")
            yarn install
            ;;
        "pnpm")
            pnpm install
            ;;
        *)
            npm install
            ;;
    esac

    log_success "Dependencies installed successfully"
}

# Initialize and validate system
initialize_system() {
    log_info "Initializing Claude workflow system..."

    cd "$TARGET_DIR"

    # Run setup script
    if [[ -f ".claude/setup.js" ]]; then
        node .claude/setup.js --auto-detect
    fi

    # Validate installation
    if command -v make &> /dev/null; then
        make validate 2>/dev/null || log_warning "Validation had some issues (this might be normal for new projects)"
    else
        npm run validate 2>/dev/null || log_warning "Validation had some issues (this might be normal for new projects)"
    fi

    log_success "System initialization completed"
}

# Display next steps
show_next_steps() {
    log_success "🎉 Claude Agentic Workflow System installed successfully!"

    echo
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo
    echo "1. Verify installation:"
    echo "   ${GREEN}make status${NC}     # or: npm run status"
    echo
    echo "2. Run first assessment:"
    echo "   ${GREEN}make assess${NC}     # or: npm run assess"
    echo
    echo "3. Start TDD workflow:"
    echo "   ${GREEN}make test${NC}       # or: npm test"
    echo "   ${GREEN}npm test:watch${NC}  # For TDD watch mode"
    echo
    echo "4. Check system health:"
    echo "   ${GREEN}make doctor${NC}     # or: npm run doctor"
    echo "   ${GREEN}./scripts/verify-installation.sh${NC}  # Comprehensive verification"
    echo
    echo "5. Troubleshooting (if needed):"
    echo "   ${GREEN}./scripts/troubleshoot.sh${NC}  # Interactive troubleshooting"
    echo "   ${GREEN}./scripts/troubleshoot.sh --auto${NC}  # Automated fixes"
    echo
    echo -e "${BLUE}📚 Documentation:${NC}"
    echo "   • Quick Start: ${GREEN}.claude/docs/QUICK-START.md${NC}"
    echo "   • Complete Guide: ${GREEN}.claude/docs/USER-GUIDE.md${NC}"
    echo "   • All Commands: ${GREEN}.claude/docs/COMMANDS.md${NC}"
    echo
    echo -e "${BLUE}🤖 Agent System:${NC}"
    echo "   • 20 specialized agents ready for autonomous code quality management"
    echo "   • TDD enforcement with 80% coverage requirement"
    echo "   • Linear integration for task management"
    echo "   • CI/CD pipeline protection"
    echo
    echo -e "${YELLOW}⚠️  Backup Location:${NC}"
    echo "   Original files backed up to: ${GREEN}$BACKUP_DIR${NC}"
    echo
}

# Final validation and summary
validate_installation() {
    log "Validating installation..."

    local validation_errors=0

    # Check essential files
    if [ ! -f ".claude/cli.js" ]; then
        log_error "CLI script missing"
        ((validation_errors++))
    fi

    if [ ! -f "CLAUDE.md" ]; then
        log_error "CLAUDE.md missing"
        ((validation_errors++))
    fi

    if [ ! -f "package.json" ]; then
        log_error "package.json missing"
        ((validation_errors++))
    fi

    # Test CLI functionality
    if ! node .claude/cli.js --version >/dev/null 2>&1; then
        log_error "CLI not functional - check Node.js version"
        ((validation_errors++))
    fi

    # Check agent directory
    if [ ! -d ".claude/agents" ]; then
        log_error "Agent specifications missing"
        ((validation_errors++))
    fi

    if [ $validation_errors -eq 0 ]; then
        log_success "Installation validation passed"

        # Run comprehensive verification if available
        if [ -f "scripts/verify-installation.sh" ]; then
            log "Running comprehensive verification..."
            if ./scripts/verify-installation.sh --quick >/dev/null 2>&1; then
                log_success "Comprehensive verification passed"
            else
                log_warning "Some verification checks failed - run './scripts/verify-installation.sh' for details"
            fi
        fi
    else
        log_error "Installation validation failed with $validation_errors errors"

        # Suggest troubleshooting
        if [ -f "scripts/troubleshoot.sh" ]; then
            log_warning "Run './scripts/troubleshoot.sh --auto' to fix common issues"
        fi

        exit 1
    fi
}

# Main installation function
main() {
    echo -e "${BLUE}🚀 Claude Agentic Workflow System Installer${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo
    echo "Installing into: $TARGET_DIR"
    echo "Source location: $WORKFLOW_ROOT"
    echo

    check_prerequisites
    detect_project
    create_backup
    install_claude_directory
    handle_claude_md
    enhance_package_json
    install_makefile
    install_dependencies
    initialize_system
    validate_installation
    show_next_steps

    echo
    log_success "Installation completed successfully! 🎉"
}

# Run main function
main "$@"