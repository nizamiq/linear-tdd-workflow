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
CLAUDE_VERSION="1.3.0"
SOURCE_DIR="$(dirname "$0")"
TARGET_DIR="${1:-$(pwd)}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Linear TDD Workflow System Installer v${CLAUDE_VERSION}      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo

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

    # Create or update CLAUDE.md
    if [ ! -f "$TARGET_DIR/CLAUDE.md" ]; then
        cat > "$TARGET_DIR/CLAUDE.md" << 'EOF'
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 IMPORTANT: Autonomous Workflow System Detected

This project has the **Linear TDD Workflow System** installed. You have access to powerful autonomous capabilities:

### Quick Discovery
```bash
# Check if system is active
test -d .claude && echo "✅ TDD Workflow System Available" || echo "❌ System not found"

# View system capabilities
cat .claude/README.md

# Activate if needed
make onboard
```

### Primary Commands Available to You
- `make assess` - Scan code quality and create Linear tasks
- `make fix-pack` - Implement fixes with TDD enforcement
- `make test` - Run comprehensive test suite
- `make ci-recovery` - Fix broken pipelines
- `make release` - Manage releases

**For detailed instructions:** See `.claude/DISCOVERY.md`

## Project Context

[Add your project-specific context here]
EOF
        echo -e "${GREEN}✓ Created CLAUDE.md${NC}"
    else
        echo -e "${YELLOW}⚠ CLAUDE.md exists, please update manually${NC}"
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
JOURNEY_COUNT=6
AGENT_COUNT=20

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
    fi

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