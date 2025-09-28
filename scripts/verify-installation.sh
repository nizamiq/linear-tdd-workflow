#!/bin/bash

# Claude Agentic Workflow System - Installation Verification Script
# Comprehensive validation and troubleshooting for the installation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verification counters
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASS_COUNT++))
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARN_COUNT++))
}

error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAIL_COUNT++))
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if a file exists and is readable
check_file() {
    local file="$1"
    local description="$2"

    if [ -f "$file" ] && [ -r "$file" ]; then
        success "$description exists and is readable"
        return 0
    else
        error "$description missing or unreadable: $file"
        return 1
    fi
}

# Check if a directory exists
check_directory() {
    local dir="$1"
    local description="$2"

    if [ -d "$dir" ]; then
        success "$description exists"
        return 0
    else
        error "$description missing: $dir"
        return 1
    fi
}

# Check Node.js and npm versions
check_prerequisites() {
    log "Checking prerequisites..."

    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        local required_major=18
        local current_major=$(echo "$node_version" | cut -d. -f1)

        if [ "$current_major" -ge "$required_major" ]; then
            success "Node.js version $node_version (≥18.0.0 required)"
        else
            error "Node.js version $node_version is too old (≥18.0.0 required)"
        fi
    else
        error "Node.js not found - please install Node.js ≥18.0.0"
    fi

    if command_exists npm; then
        local npm_version=$(npm --version)
        success "npm version $npm_version"
    else
        error "npm not found - should be installed with Node.js"
    fi

    if command_exists git; then
        local git_version=$(git --version | cut -d' ' -f3)
        success "Git version $git_version"
    else
        warn "Git not found - recommended for version control"
    fi
}

# Check core file structure
check_file_structure() {
    log "Checking file structure..."

    check_directory ".claude" "Claude workflow directory"
    check_directory ".claude/agents" "Agent specifications directory"

    check_file ".claude/cli.js" "Claude CLI interface"
    check_file ".claude/mcp.json" "MCP server configuration"
    check_file ".claude/agents/CLAUDE.md" "Agent reference documentation"

    check_file "package.json" "Package configuration"
    check_file "CLAUDE.md" "Project instructions"

    # Check for Makefile or npm scripts
    if [ -f "Makefile" ]; then
        success "Makefile found"
    elif [ -f "package.json" ] && grep -q '"scripts"' package.json; then
        success "npm scripts configuration found"
    else
        warn "No Makefile or npm scripts found - some commands may not work"
    fi
}

# Validate package.json configuration
check_package_json() {
    log "Validating package.json configuration..."

    if [ ! -f "package.json" ]; then
        error "package.json not found"
        return 1
    fi

    # Check for Claude workflow scripts
    local claude_scripts=(
        "assess"
        "status"
        "validate"
        "agent:invoke"
        "precommit"
    )

    for script in "${claude_scripts[@]}"; do
        if grep -q "\"$script\":" package.json; then
            success "Script '$script' configured"
        else
            warn "Script '$script' not found in package.json"
        fi
    done

    # Check for Claude metadata
    if grep -q '"claude":' package.json; then
        success "Claude metadata present in package.json"
    else
        warn "Claude metadata missing from package.json"
    fi

    # Check for essential dependencies
    local essential_deps=("eslint" "prettier" "jest")
    for dep in "${essential_deps[@]}"; do
        if grep -q "\"$dep\":" package.json; then
            success "Dependency '$dep' found"
        else
            warn "Dependency '$dep' not found - may need installation"
        fi
    done
}

# Test CLI functionality
check_cli_functionality() {
    log "Testing CLI functionality..."

    if [ -f ".claude/cli.js" ]; then
        # Test basic CLI invocation
        if node .claude/cli.js --version >/dev/null 2>&1; then
            success "CLI executable and responsive"
        else
            error "CLI not responding - check Node.js and file permissions"
        fi

        # Test status command
        if node .claude/cli.js status --quick >/dev/null 2>&1; then
            success "Status command functional"
        else
            warn "Status command not working - may need configuration"
        fi
    else
        error "CLI script missing - installation incomplete"
    fi
}

# Check agent system
check_agent_system() {
    log "Checking agent system..."

    local agent_files=(
        ".claude/agents/AUDITOR.md"
        ".claude/agents/EXECUTOR.md"
        ".claude/agents/STRATEGIST.md"
        ".claude/agents/GUARDIAN.md"
    )

    local found_agents=0
    for agent_file in "${agent_files[@]}"; do
        if [ -f "$agent_file" ]; then
            ((found_agents++))
        fi
    done

    if [ $found_agents -ge 4 ]; then
        success "Core agent specifications found ($found_agents agents)"
    else
        warn "Some agent specifications missing ($found_agents/4 core agents found)"
    fi

    # Check if agents directory has expected structure
    if [ -d ".claude/agents" ]; then
        local agent_count=$(find .claude/agents -name "*.md" | wc -l)
        log "Found $agent_count agent specification files"
    fi
}

# Check testing configuration
check_testing_setup() {
    log "Checking testing configuration..."

    # Check for test framework configuration
    if [ -f "jest.config.js" ] || [ -f "jest.config.json" ] || grep -q '"jest":' package.json 2>/dev/null; then
        success "Jest configuration found"
    else
        warn "Jest configuration not found - testing may not work"
    fi

    # Check for test directories
    local test_dirs=("tests" "test" "__tests__")
    local found_test_dir=false

    for dir in "${test_dirs[@]}"; do
        if [ -d "$dir" ]; then
            success "Test directory found: $dir"
            found_test_dir=true
            break
        fi
    done

    if [ "$found_test_dir" = false ]; then
        warn "No test directory found - create 'tests/' directory"
    fi

    # Check for sample test files
    if find . -name "*.test.js" -o -name "*.test.ts" -o -name "*.spec.js" -o -name "*.spec.ts" | head -1 | grep -q .; then
        success "Test files found"
    else
        warn "No test files found - consider creating sample tests"
    fi
}

# Check environment configuration
check_environment() {
    log "Checking environment configuration..."

    # Check for .env file
    if [ -f ".env" ]; then
        warn ".env file found - ensure it's in .gitignore"
    else
        log ".env file not found (this is normal for fresh installations)"
    fi

    # Check .gitignore
    if [ -f ".gitignore" ]; then
        success ".gitignore file exists"

        if grep -q "\.env" .gitignore; then
            success ".env is properly ignored"
        else
            warn ".env should be added to .gitignore"
        fi

        if grep -q "node_modules" .gitignore; then
            success "node_modules is properly ignored"
        else
            warn "node_modules should be added to .gitignore"
        fi
    else
        warn ".gitignore file not found - should be created"
    fi
}

# Test npm scripts execution
test_npm_scripts() {
    log "Testing npm script execution..."

    # Test validate script
    if npm run validate --silent >/dev/null 2>&1; then
        success "npm run validate executes successfully"
    else
        warn "npm run validate failed - may need dependency installation"
    fi

    # Test status script
    if npm run status --silent >/dev/null 2>&1; then
        success "npm run status executes successfully"
    else
        warn "npm run status failed - check CLI configuration"
    fi

    # Check if dependencies are installed
    if [ -d "node_modules" ] && [ -f "node_modules/.package-lock.json" ] || [ -f "package-lock.json" ]; then
        success "Dependencies appear to be installed"
    else
        error "Dependencies not installed - run 'npm install'"
    fi
}

# Performance and security checks
check_security() {
    log "Running security checks..."

    # Check file permissions
    if [ -x ".claude/cli.js" ]; then
        success "CLI script has execute permissions"
    else
        warn "CLI script missing execute permissions - may cause issues"
    fi

    # Check for sensitive files
    local sensitive_files=(".env" "*.key" "*.pem" "config/secrets.json")
    for pattern in "${sensitive_files[@]}"; do
        if ls $pattern >/dev/null 2>&1; then
            warn "Sensitive files found matching '$pattern' - ensure they're properly secured"
        fi
    done

    # Check npm audit if available
    if command_exists npm && [ -f "package.json" ]; then
        log "Running npm audit..."
        if npm audit --audit-level=high --silent >/dev/null 2>&1; then
            success "No high-severity security issues found"
        else
            warn "Security vulnerabilities detected - run 'npm audit fix'"
        fi
    fi
}

# Generate diagnostic report
generate_report() {
    log "Generating diagnostic report..."

    local report_file=".claude/installation-verification-$(date +%Y%m%d-%H%M%S).log"

    {
        echo "# Claude Agentic Workflow System - Installation Verification Report"
        echo "Generated: $(date)"
        echo "Directory: $(pwd)"
        echo ""
        echo "## System Information"
        echo "Node.js: $(node --version 2>/dev/null || echo 'Not found')"
        echo "npm: $(npm --version 2>/dev/null || echo 'Not found')"
        echo "Git: $(git --version 2>/dev/null | cut -d' ' -f3 || echo 'Not found')"
        echo "OS: $(uname -s) $(uname -r)"
        echo ""
        echo "## Verification Results"
        echo "✅ Passed: $PASS_COUNT"
        echo "⚠️  Warnings: $WARN_COUNT"
        echo "❌ Failed: $FAIL_COUNT"
        echo ""
        echo "## Next Steps"
        if [ $FAIL_COUNT -eq 0 ]; then
            echo "Installation verification completed successfully!"
            echo "Run 'npm run status' to check system status."
        else
            echo "Installation has issues that need attention."
            echo "Check the failed items above and run installation again if needed."
        fi
    } > "$report_file"

    log "Report saved to: $report_file"
}

# Provide troubleshooting suggestions
show_troubleshooting() {
    if [ $FAIL_COUNT -gt 0 ] || [ $WARN_COUNT -gt 5 ]; then
        echo ""
        echo -e "${YELLOW}🔧 TROUBLESHOOTING SUGGESTIONS:${NC}"
        echo ""

        if [ $FAIL_COUNT -gt 0 ]; then
            echo "❌ Critical issues found:"
            echo "   • Re-run the installation script: '../claude-workflow/scripts/install.sh'"
            echo "   • Check Node.js version: 'node --version' (need ≥18.0.0)"
            echo "   • Verify you're in the correct directory"
            echo "   • Check file permissions: 'ls -la .claude/'"
        fi

        if [ $WARN_COUNT -gt 0 ]; then
            echo ""
            echo "⚠️  Recommendations:"
            echo "   • Install dependencies: 'npm install'"
            echo "   • Run initial setup: 'npm run setup'"
            echo "   • Create test directory: 'mkdir -p tests'"
            echo "   • Configure .gitignore if missing"
        fi

        echo ""
        echo "📚 For detailed help:"
        echo "   • Check: docs/ONBOARDING-QUICKSTART.md"
        echo "   • Run: npm run doctor"
        echo "   • View: .claude/docs/TROUBLESHOOTING.md"
    fi
}

# Main verification routine
main() {
    echo -e "${BLUE}🔍 Claude Agentic Workflow System - Installation Verification${NC}"
    echo "=================================================================="
    echo ""

    check_prerequisites
    echo ""

    check_file_structure
    echo ""

    check_package_json
    echo ""

    check_cli_functionality
    echo ""

    check_agent_system
    echo ""

    check_testing_setup
    echo ""

    check_environment
    echo ""

    test_npm_scripts
    echo ""

    check_security
    echo ""

    # Final summary
    echo "=================================================================="
    echo -e "${BLUE}📊 VERIFICATION SUMMARY${NC}"
    echo ""
    echo -e "✅ Passed:   ${GREEN}$PASS_COUNT${NC}"
    echo -e "⚠️  Warnings: ${YELLOW}$WARN_COUNT${NC}"
    echo -e "❌ Failed:   ${RED}$FAIL_COUNT${NC}"
    echo ""

    if [ $FAIL_COUNT -eq 0 ]; then
        echo -e "${GREEN}🎉 Installation verification PASSED!${NC}"
        echo "Your Claude Agentic Workflow System is ready to use."
        echo ""
        echo "Next steps:"
        echo "  • Run: npm run assess"
        echo "  • Run: npm run status"
        echo "  • Start TDD: npm test:watch"
    else
        echo -e "${RED}❌ Installation verification FAILED${NC}"
        echo "Please address the failed checks above."
    fi

    generate_report
    show_troubleshooting

    # Exit with appropriate code
    [ $FAIL_COUNT -eq 0 ] && exit 0 || exit 1
}

# Handle command line options
case "${1:-}" in
    --quick)
        # Quick check - only essential items
        check_prerequisites
        check_file_structure
        check_cli_functionality
        ;;
    --full)
        # Full verification including performance tests
        main
        ;;
    --help)
        echo "Usage: $0 [--quick|--full|--help]"
        echo ""
        echo "Options:"
        echo "  --quick  Run quick essential checks only"
        echo "  --full   Run comprehensive verification (default)"
        echo "  --help   Show this help message"
        exit 0
        ;;
    *)
        main
        ;;
esac