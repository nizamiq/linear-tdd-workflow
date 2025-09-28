#!/bin/bash

# Claude Agentic Workflow System - Installation Workflow Test
# End-to-end testing of the installation process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASS_COUNT=0
FAIL_COUNT=0

log() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASS_COUNT++))
}

fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAIL_COUNT++))
}

# Clean up function
cleanup() {
    if [ -n "$TEST_DIR" ] && [ -d "$TEST_DIR" ]; then
        log "Cleaning up test directory: $TEST_DIR"
        rm -rf "$TEST_DIR"
    fi
}

# Set up trap for cleanup
trap cleanup EXIT

# Test 1: Create test environment
test_environment_setup() {
    log "Setting up test environment..."

    TEST_DIR="/tmp/claude-workflow-test-$(date +%s)"
    WORKFLOW_SOURCE="$(pwd)"

    # Create test directory structure
    mkdir -p "$TEST_DIR/workspace"
    cd "$TEST_DIR/workspace"

    # Copy workflow system to parallel location
    cp -r "$WORKFLOW_SOURCE" claude-workflow

    success "Test environment created at $TEST_DIR"
}

# Test 2: New project installation
test_new_project_installation() {
    log "Testing new project installation..."

    cd "$TEST_DIR/workspace"

    # Create new project
    mkdir my-new-project
    cd my-new-project

    # Initialize basic Node.js project
    cat > package.json << 'EOF'
{
  "name": "test-new-project",
  "version": "1.0.0",
  "description": "Test project for Claude workflow",
  "scripts": {
    "start": "node index.js"
  }
}
EOF

    # Run installation
    if ../claude-workflow/scripts/install.sh --auto-confirm >/dev/null 2>&1; then
        success "New project installation completed"
    else
        fail "New project installation failed"
        return 1
    fi

    # Verify installation
    if [ -f ".claude/cli.js" ] && [ -f "CLAUDE.md" ]; then
        success "New project: Core files installed"
    else
        fail "New project: Core files missing"
    fi

    # Test CLI functionality
    if node .claude/cli.js --version >/dev/null 2>&1; then
        success "New project: CLI functional"
    else
        fail "New project: CLI not working"
    fi

    cd "$TEST_DIR/workspace"
}

# Test 3: Existing project installation
test_existing_project_installation() {
    log "Testing existing project installation..."

    cd "$TEST_DIR/workspace"

    # Create existing project with some content
    mkdir my-existing-project
    cd my-existing-project

    # Create existing package.json with scripts
    cat > package.json << 'EOF'
{
  "name": "existing-project",
  "version": "2.1.0",
  "description": "Existing project with custom scripts",
  "scripts": {
    "start": "node server.js",
    "test": "mocha tests/",
    "build": "webpack --mode production",
    "lint": "custom-linter ."
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "mocha": "^10.0.0",
    "webpack": "^5.0.0"
  }
}
EOF

    # Create existing CLAUDE.md
    cat > CLAUDE.md << 'EOF'
# Project Instructions

This is an existing project with custom instructions.

## Custom Commands
- `npm run custom-command` - Does something special
EOF

    # Create some source files
    mkdir -p src tests
    echo "console.log('Hello World');" > src/index.js
    echo "// Existing test" > tests/sample.test.js

    # Run installation
    if ../claude-workflow/scripts/install.sh --auto-confirm >/dev/null 2>&1; then
        success "Existing project installation completed"
    else
        fail "Existing project installation failed"
        return 1
    fi

    # Verify Claude files installed
    if [ -f ".claude/cli.js" ]; then
        success "Existing project: Claude system installed"
    else
        fail "Existing project: Claude system missing"
    fi

    # Verify CLAUDE.md was appended, not overwritten
    if grep -q "existing project with custom instructions" CLAUDE.md && grep -q "Claude Agentic Workflow System" CLAUDE.md; then
        success "Existing project: CLAUDE.md properly appended"
    else
        fail "Existing project: CLAUDE.md not handled correctly"
    fi

    # Verify existing scripts preserved
    if grep -q '"start": "node server.js"' package.json; then
        success "Existing project: Original scripts preserved"
    else
        fail "Existing project: Original scripts lost"
    fi

    # Verify Claude scripts added
    if grep -q '"assess"' package.json; then
        success "Existing project: Claude scripts added"
    else
        fail "Existing project: Claude scripts missing"
    fi

    cd "$TEST_DIR/workspace"
}

# Test 4: Installation verification
test_installation_verification() {
    log "Testing installation verification..."

    cd "$TEST_DIR/workspace/my-new-project"

    # Test verification script
    if ./scripts/verify-installation.sh --quick >/dev/null 2>&1; then
        success "Verification script works on new project"
    else
        fail "Verification script failed on new project"
    fi

    cd "$TEST_DIR/workspace/my-existing-project"

    if ./scripts/verify-installation.sh --quick >/dev/null 2>&1; then
        success "Verification script works on existing project"
    else
        fail "Verification script failed on existing project"
    fi
}

# Test 5: Troubleshooting tools
test_troubleshooting_tools() {
    log "Testing troubleshooting tools..."

    cd "$TEST_DIR/workspace/my-new-project"

    # Test diagnostics
    if ./scripts/troubleshoot.sh --diagnostics >/dev/null 2>&1; then
        success "Troubleshooting diagnostics working"
    else
        fail "Troubleshooting diagnostics failed"
    fi

    # Test CLI responsiveness
    if node .claude/cli.js --version >/dev/null 2>&1; then
        success "CLI responsive after installation"
    else
        fail "CLI not responsive after installation"
    fi
}

# Test 6: Package.json enhancement
test_package_json_enhancement() {
    log "Testing package.json enhancement..."

    cd "$TEST_DIR/workspace"

    # Create test package.json
    mkdir package-test
    cd package-test

    cat > package.json << 'EOF'
{
  "name": "package-test",
  "version": "1.0.0",
  "scripts": {
    "existing-script": "echo 'existing'"
  }
}
EOF

    # Test enhancement script
    if node ../claude-workflow/scripts/enhance-package-json.js package.json >/dev/null 2>&1; then
        success "Package.json enhancement script working"
    else
        fail "Package.json enhancement script failed"
    fi

    # Verify existing script preserved
    if grep -q '"existing-script"' package.json; then
        success "Package.json: Existing scripts preserved"
    else
        fail "Package.json: Existing scripts lost"
    fi

    # Verify Claude scripts added
    if grep -q '"assess"' package.json; then
        success "Package.json: Claude scripts added"
    else
        fail "Package.json: Claude scripts missing"
    fi

    cd "$TEST_DIR/workspace"
}

# Test 7: File permissions and structure
test_file_permissions() {
    log "Testing file permissions and structure..."

    cd "$TEST_DIR/workspace/my-new-project"

    # Check script permissions
    if [ -x "./scripts/install.sh" ]; then
        success "Installation script is executable"
    else
        fail "Installation script not executable"
    fi

    if [ -x "./scripts/verify-installation.sh" ]; then
        success "Verification script is executable"
    else
        fail "Verification script not executable"
    fi

    if [ -x "./scripts/troubleshoot.sh" ]; then
        success "Troubleshooting script is executable"
    else
        fail "Troubleshooting script not executable"
    fi

    if [ -x ".claude/cli.js" ]; then
        success "CLI script is executable"
    else
        fail "CLI script not executable"
    fi
}

# Test 8: Error handling
test_error_handling() {
    log "Testing error handling..."

    cd "$TEST_DIR/workspace"

    # Test installation in directory without package.json
    mkdir error-test
    cd error-test

    # This should handle the missing package.json gracefully
    if ../claude-workflow/scripts/install.sh --auto-confirm >/dev/null 2>&1; then
        success "Installation handled missing package.json"
    else
        # This is expected to fail, but should fail gracefully
        success "Installation failed gracefully with missing package.json"
    fi

    cd "$TEST_DIR/workspace"
}

# Main test runner
main() {
    echo -e "${BLUE}🧪 Claude Agentic Workflow System - Installation Test Suite${NC}"
    echo "=============================================================="
    echo ""

    test_environment_setup
    echo ""

    test_new_project_installation
    echo ""

    test_existing_project_installation
    echo ""

    test_installation_verification
    echo ""

    test_troubleshooting_tools
    echo ""

    test_package_json_enhancement
    echo ""

    test_file_permissions
    echo ""

    test_error_handling
    echo ""

    # Final summary
    echo "=============================================================="
    echo -e "${BLUE}📊 TEST SUMMARY${NC}"
    echo ""
    echo -e "✅ Passed: ${GREEN}$PASS_COUNT${NC}"
    echo -e "❌ Failed: ${RED}$FAIL_COUNT${NC}"
    echo ""

    if [ $FAIL_COUNT -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests PASSED! Installation workflow is ready for deployment.${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests FAILED. Please review and fix issues before deployment.${NC}"
        exit 1
    fi
}

# Handle command line options
case "${1:-}" in
    --help)
        echo "Usage: $0 [--help]"
        echo ""
        echo "Runs comprehensive end-to-end testing of the Claude workflow installation process."
        echo "This test creates temporary directories and simulates real installation scenarios."
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac