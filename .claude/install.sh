#!/bin/bash

# Linear TDD Workflow System - Installation Script
# This script installs the .claude workflow system into any project

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
CLAUDE_VERSION="1.4.0"
SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)/.claude"
TARGET_DIR="${1:-$(pwd)}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Linear TDD Workflow System Installer v${CLAUDE_VERSION}      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo

# Check if trying to install into the same directory
if [ "$(cd "$TARGET_DIR" && pwd)" = "$(cd "$SOURCE_DIR/.." && pwd)" ]; then
    echo -e "${YELLOW}⚠ Already in a project with Linear TDD Workflow System installed${NC}"
    echo -e "${YELLOW}⚠ Skipping installation to prevent overwriting existing system${NC}"
    echo -e "${BLUE}To install in a different project, specify target directory:${NC}"
    echo -e "${BLUE}  .claude/install.sh /path/to/other/project${NC}"
    echo
    exit 0
fi

# Function to detect project type
detect_project_type() {
    if [ -f "$TARGET_DIR/package.json" ]; then
        echo "javascript"
    elif [ -f "$TARGET_DIR/requirements.txt" ] || [ -f "$TARGET_DIR/pyproject.toml" ]; then
        echo "python"
    else
        echo "unknown"
    fi
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}📋 Checking prerequisites...${NC}"

    local has_git=$(command -v git &> /dev/null && echo "yes" || echo "no")
    local has_make=$(command -v make &> /dev/null && echo "yes" || echo "no")
    local has_node=$(command -v node &> /dev/null && echo "yes" || echo "no")

    if [ "$has_git" = "no" ]; then
        echo -e "${RED}✗ Git not found. Please install git first.${NC}"
        exit 1
    fi

    if [ "$has_make" = "no" ]; then
        echo -e "${YELLOW}⚠ Make not found. Some commands may not work.${NC}"
    fi

    echo -e "${GREEN}✓ Prerequisites checked${NC}"
}

# Function to backup existing files
backup_existing() {
    if [ -d "$TARGET_DIR/.claude" ]; then
        echo -e "${YELLOW}⚠ Existing .claude directory found. Creating backup...${NC}"
        mv "$TARGET_DIR/.claude" "$TARGET_DIR/.claude.backup.$(date +%Y%m%d-%H%M%S)"
    fi

    if [ -f "$TARGET_DIR/CLAUDE.md" ]; then
        echo -e "${YELLOW}⚠ Existing CLAUDE.md found. Creating backup...${NC}"
        cp "$TARGET_DIR/CLAUDE.md" "$TARGET_DIR/CLAUDE.md.backup.$(date +%Y%m%d-%H%M%S)"
    fi
}

# Function to install core files
install_core_files() {
    echo -e "${BLUE}📦 Installing core workflow system...${NC}"

    # Copy .claude directory
    cp -r "$SOURCE_DIR" "$TARGET_DIR/.claude"
    echo -e "${GREEN}✓ Copied .claude directory${NC}"

    # Copy Makefile if it doesn't exist
    if [ ! -f "$TARGET_DIR/Makefile" ]; then
        cp "$SOURCE_DIR/../Makefile" "$TARGET_DIR/Makefile"
        echo -e "${GREEN}✓ Installed Makefile${NC}"
    else
        echo -e "${YELLOW}⚠ Makefile exists, skipping${NC}"
    fi

    # Add minimal hook to CLAUDE.md if it exists, or create minimal file
    if [ ! -f "$TARGET_DIR/CLAUDE.md" ]; then
        cat > "$TARGET_DIR/CLAUDE.md" << 'EOF'
# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## 🚀 Linear TDD Workflow System Detected

**Version:** 1.4.0 - Multi-agent autonomous code quality with functional release gates

📚 **Complete system documentation:** `.claude/CLAUDE.md`

**Quick start:** `make onboard` or read `.claude/README.md`

## Project Context

[Add your project-specific context here]
EOF
        echo -e "${GREEN}✓ Created CLAUDE.md with workflow system hook${NC}"
    else
        # Check if hook already exists
        if grep -q "Linear TDD Workflow System" "$TARGET_DIR/CLAUDE.md"; then
            echo -e "${YELLOW}⚠ CLAUDE.md already has workflow system hook${NC}"
        else
            # Append hook to existing CLAUDE.md
            cat >> "$TARGET_DIR/CLAUDE.md" << 'EOF'

## 🚀 Linear TDD Workflow System Detected

**Version:** 1.4.0 - Multi-agent autonomous code quality with functional release gates

📚 **Complete system documentation:** `.claude/CLAUDE.md`

**Quick start:** `make onboard` or read `.claude/README.md`
EOF
            echo -e "${GREEN}✓ Added workflow system hook to existing CLAUDE.md${NC}"
        fi
    fi
}

# Function to create environment template
create_env_template() {
    if [ ! -f "$TARGET_DIR/.env.example" ]; then
        cat > "$TARGET_DIR/.env.example" << 'EOF'
# Linear.app Configuration (Required)
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
LINEAR_TEAM_ID=your-team-id
LINEAR_PROJECT_ID=your-project-id

# GitHub Configuration (Optional)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_ORG=your-organization

# Agent Settings (Optional)
ENABLE_AUTO_FIX=true
MAX_FIX_PACK_SIZE=300
MIN_DIFF_COVERAGE=80
MIN_MUTATION_SCORE=30
EOF
        echo -e "${GREEN}✓ Created .env.example${NC}"
    fi
}

# Function to update gitignore
update_gitignore() {
    if [ -f "$TARGET_DIR/.gitignore" ]; then
        # Check if already has .claude entries
        if ! grep -q "^# Claude workflow" "$TARGET_DIR/.gitignore"; then
            cat >> "$TARGET_DIR/.gitignore" << 'EOF'

# Claude workflow temporary files
.claude/logs/
.claude/reports/
.claude-backup/
.claude-active
archive/
EOF
            echo -e "${GREEN}✓ Updated .gitignore${NC}"
        fi
    fi
}

# Function to create installation marker
create_marker() {
    local project_type=$(detect_project_type)

    cat > "$TARGET_DIR/.claude-installed" << EOF
# Linear TDD Workflow System Installation Marker
# Version: $CLAUDE_VERSION
# Installed: $(date +%Y-%m-%d)
# Project Type: $project_type

SYSTEM_VERSION=$CLAUDE_VERSION
INSTALL_DATE=$(date +%Y-%m-%d)
INSTALL_TYPE=full
PROJECT_TYPE=$project_type
JOURNEY_COUNT=7
AGENT_COUNT=23
FEATURES=functional_release_gate,user_story_registry,e2e_validation

# To verify installation:
# make status

# To get started:
# make onboard
EOF
    echo -e "${GREEN}✓ Created installation marker${NC}"
}

# Function to initialize npm dependencies
init_npm_deps() {
    if [ -f "$TARGET_DIR/package.json" ]; then
        echo -e "${BLUE}📦 Installing npm dependencies...${NC}"
        cd "$TARGET_DIR"

        # Check if dependencies are needed
        local needs_commander=$(grep -q '"commander"' package.json && echo "no" || echo "yes")
        local needs_yaml=$(grep -q '"js-yaml"' package.json && echo "no" || echo "yes")

        if [ "$needs_commander" = "yes" ] || [ "$needs_yaml" = "yes" ]; then
            npm install --save-dev commander js-yaml dotenv
            echo -e "${GREEN}✓ Installed required npm packages${NC}"
        fi
    fi
}

# Function to add npm scripts for functional release
add_npm_scripts() {
    if [ -f "$TARGET_DIR/package.json" ]; then
        echo -e "${BLUE}📝 Adding functional release npm scripts...${NC}"

        # Check if scripts already exist
        if grep -q "release:validate-functional" "$TARGET_DIR/package.json"; then
            echo -e "${YELLOW}⚠ Functional release scripts already exist, skipping${NC}"
            return
        fi

        # Use Node.js to safely inject scripts into package.json
        node -e "
        const fs = require('fs');
        const path = '$TARGET_DIR/package.json';
        const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));

        pkg.scripts = pkg.scripts || {};

        // Add functional release scripts
        pkg.scripts['release:validate-functional'] = 'node .claude/scripts/release/functional-gate.js';
        pkg.scripts['release:user-stories'] = 'node .claude/scripts/user-stories/registry-helper.js coverage';
        pkg.scripts['release:add-story'] = 'node .claude/scripts/user-stories/registry-helper.js add';
        pkg.scripts['e2e:validate'] = 'node .claude/scripts/testing/e2e-parser.js validate';
        pkg.scripts['e2e:report'] = 'node .claude/scripts/testing/e2e-parser.js report';

        fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
        " 2>/dev/null

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Added 5 functional release npm scripts${NC}"
        else
            echo -e "${YELLOW}⚠ Could not add npm scripts automatically${NC}"
            echo -e "${YELLOW}  Add these manually to package.json:${NC}"
            echo -e '    "release:validate-functional": "node .claude/scripts/release/functional-gate.js",'
            echo -e '    "release:user-stories": "node .claude/scripts/user-stories/registry-helper.js coverage",'
            echo -e '    "release:add-story": "node .claude/scripts/user-stories/registry-helper.js add",'
            echo -e '    "e2e:validate": "node .claude/scripts/testing/e2e-parser.js validate",'
            echo -e '    "e2e:report": "node .claude/scripts/testing/e2e-parser.js report"'
        fi
    fi
}

# Function to add make targets for functional release
add_make_targets() {
    if [ -f "$TARGET_DIR/Makefile" ]; then
        echo -e "${BLUE}📝 Adding functional release make targets...${NC}"

        # Check if targets already exist
        if grep -q "release-check:" "$TARGET_DIR/Makefile"; then
            echo -e "${YELLOW}⚠ Functional release targets already exist, skipping${NC}"
            return
        fi

        # Append functional release targets to Makefile
        cat >> "$TARGET_DIR/Makefile" << 'EOF'

# ========================================
# Functional Release Management
# ========================================

# Validate functional release readiness
release-check:
	@echo "🎯 Validating functional release readiness..."
	@node .claude/scripts/release/functional-gate.js

# Show user story coverage report
release-stories:
	@echo "📊 User Story Coverage Report"
	@node .claude/scripts/user-stories/registry-helper.js coverage

# Run E2E test suite
release-e2e:
	@echo "🧪 Running E2E test suite..."
	@$(RUN_PREFIX) test:e2e

# Add new user story to registry
add-story:
	@node .claude/scripts/user-stories/registry-helper.js add

# Validate E2E test metadata
validate-e2e:
	@node .claude/scripts/testing/e2e-parser.js validate

# Generate E2E coverage report
report-e2e:
	@node .claude/scripts/testing/e2e-parser.js report

EOF
        echo -e "${GREEN}✓ Added 6 functional release make targets${NC}"
    fi
}

# Main installation flow
main() {
    echo -e "${BLUE}📍 Installing to: $TARGET_DIR${NC}"
    echo

    # Check prerequisites
    check_prerequisites

    # Detect project type
    local project_type=$(detect_project_type)
    echo -e "${BLUE}🔍 Detected project type: ${GREEN}$project_type${NC}"
    echo

    # Backup existing files
    backup_existing

    # Install core files
    install_core_files

    # Create environment template
    create_env_template

    # Update gitignore
    update_gitignore

    # Create installation marker
    create_marker

    # Initialize dependencies if needed
    if [ "$project_type" = "javascript" ]; then
        init_npm_deps
        add_npm_scripts
    fi

    # Add make targets
    add_make_targets

    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║        Installation Complete! 🎉                      ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "1. ${YELLOW}cp .env.example .env${NC} and add your LINEAR_API_KEY"
    echo -e "2. ${YELLOW}make onboard${NC} to run automatic onboarding"
    echo -e "3. ${YELLOW}make assess${NC} to scan your codebase"
    echo
    echo -e "${BLUE}For help:${NC} ${YELLOW}make help${NC}"
    echo -e "${BLUE}Documentation:${NC} ${YELLOW}cat .claude/README.md${NC}"
}

# Run main function
main "$@"