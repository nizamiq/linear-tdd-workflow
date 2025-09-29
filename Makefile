# Universal Makefile for Claude Agentic TDD Workflow System
# Drop-in configuration for Python and JavaScript/TypeScript projects
#
# Auto-detects project type and uses appropriate commands
# Place this in your project root after running .claude installation
#
# Usage:
#   make <command> [ARGS="arguments"]

.PHONY: help init onboard assess fix recover learn release validate monitor status clean

# Detect project type
HAS_PACKAGE_JSON := $(shell test -f package.json && echo "yes")
HAS_REQUIREMENTS := $(shell test -f requirements.txt && echo "yes")
HAS_PYPROJECT := $(shell test -f pyproject.toml && echo "yes")
HAS_PIPFILE := $(shell test -f Pipfile && echo "yes")

# Determine project type
ifeq ($(HAS_PACKAGE_JSON),yes)
    PROJECT_TYPE := javascript
    TEST_CMD := npm test
    LINT_CMD := npm run lint
    BUILD_CMD := npm run build
    INSTALL_CMD := npm install
    RUN_PREFIX := npm run
else ifeq ($(HAS_REQUIREMENTS),yes)
    PROJECT_TYPE := python
    TEST_CMD := pytest --cov
    LINT_CMD := pylint src/ && black --check .
    BUILD_CMD := python setup.py build
    INSTALL_CMD := pip install -r requirements.txt
    RUN_PREFIX := python -m
else ifeq ($(HAS_PYPROJECT),yes)
    PROJECT_TYPE := python
    TEST_CMD := pytest --cov
    LINT_CMD := ruff check . && black --check .
    BUILD_CMD := poetry build
    INSTALL_CMD := poetry install
    RUN_PREFIX := poetry run
else ifeq ($(HAS_PIPFILE),yes)
    PROJECT_TYPE := python
    TEST_CMD := pipenv run pytest --cov
    LINT_CMD := pipenv run pylint src/
    BUILD_CMD := pipenv run python setup.py build
    INSTALL_CMD := pipenv install
    RUN_PREFIX := pipenv run
else
    PROJECT_TYPE := unknown
    TEST_CMD := echo "No test command detected"
    LINT_CMD := echo "No lint command detected"
    BUILD_CMD := echo "No build command detected"
    INSTALL_CMD := echo "No install command detected"
    RUN_PREFIX := echo "No run prefix detected"
endif

# Default target - show help
help:
	@echo "Claude Agentic TDD Workflow System"
	@echo "==================================="
	@echo "Detected project type: $(PROJECT_TYPE)"
	@echo ""
	@echo "Core Journey Commands:"
	@echo "  make onboard      - JR-1: Initialize new project with agents"
	@echo "  make assess       - JR-2: Run clean-code assessment"
	@echo "  make fix TASK=xxx - JR-3: Implement TDD fix pack"
	@echo "  make recover      - JR-4: CI break diagnosis and recovery"
	@echo "  make learn        - JR-5: Pattern mining and insights"
	@echo "  make release      - JR-6: UAT and production release"
	@echo ""
	@echo "Workflow Commands:"
	@echo "  make init         - Install .claude directory and dependencies"
	@echo "  make validate     - Run all quality gates"
	@echo "  make monitor      - Start monitoring dashboards"
	@echo "  make status       - Show workflow and agent status"
	@echo ""
	@echo "Development Commands:"
	@echo "  make test         - Run test suite with coverage"
	@echo "  make lint         - Run linting and formatting"
	@echo "  make build        - Build the project"
	@echo "  make clean        - Clean generated files"

# ============================================================================
# CORE INFRASTRUCTURE - Language Agnostic
# ============================================================================

# Initialize Claude agent system (drop-in installation)
init:
	@echo "🚀 Initializing Claude Agentic Workflow System..."
	@echo "   Project type: $(PROJECT_TYPE)"
	@if [ ! -d ".claude" ]; then \
		echo "📦 Installing .claude directory..."; \
		if [ -f ".claude-installer.sh" ]; then \
			bash .claude-installer.sh; \
		else \
			curl -sSL https://claude.ai/install | bash; \
		fi; \
	else \
		echo "✅ .claude directory already exists"; \
	fi
	@echo "🔧 Verifying prerequisites..."
	@node .claude/scripts/validate-prerequisites.js || python .claude/scripts/validate-prerequisites.py
	@echo "📦 Installing language-specific dependencies..."
	@$(INSTALL_CMD)
	@echo "✅ Initialization complete!"

# ============================================================================
# JOURNEY COMMANDS - Work with any language
# ============================================================================

# JR-1: New Project Onboarding
onboard:
	@echo "🎯 Starting JR-1: New Project Onboarding..."
	@echo "   Project type: $(PROJECT_TYPE)"
	@node .claude/cli.js journey start JR-1 --project-type $(PROJECT_TYPE)
	@echo "📊 Running initial assessment..."
	@$(MAKE) assess SCOPE=full
	@echo "🔨 Ready to implement first Fix Pack!"

# JR-2: Clean-Code Assessment (language-aware)
SCOPE ?= changed
assess:
	@echo "🔍 Starting JR-2: Clean-Code Assessment..."
	@echo "   Project type: $(PROJECT_TYPE)"
	@echo "   Scope: $(SCOPE)"
	@node .claude/cli.js assess \
		--project-type $(PROJECT_TYPE) \
		--scope $(SCOPE) \
		--output reports/assessment-$$(date +%Y%m%d-%H%M%S).json

# JR-3: TDD Fix Pack (adapts to language)
TASK ?=
fix:
	@if [ -z "$(TASK)" ]; then \
		echo "❌ Error: TASK is required. Usage: make fix TASK=CLEAN-123"; \
		exit 1; \
	fi
	@echo "🔧 Starting JR-3: TDD Fix Pack for $(TASK)..."
	@echo "   Project type: $(PROJECT_TYPE)"
	@node .claude/cli.js journey start JR-3 \
		--task $(TASK) \
		--project-type $(PROJECT_TYPE) \
		--test-runner "$(TEST_CMD)"

# JR-4: CI Break Recovery (CI-agnostic)
recover:
	@echo "🚨 Starting JR-4: CI Break Diagnosis & Recovery..."
	@node .claude/cli.js guardian monitor-pipeline \
		--project-type $(PROJECT_TYPE) \
		--auto-fix

# JR-5: Pattern Mining (language-aware patterns)
learn:
	@echo "🧠 Starting JR-5: Pattern Mining..."
	@node .claude/cli.js scholar extract-patterns \
		--project-type $(PROJECT_TYPE) \
		--languages $(PROJECT_TYPE)

# JR-6: Release Management
VERSION ?= $(shell cat VERSION 2>/dev/null || echo "0.1.0")
release:
	@echo "🚀 Starting JR-6: Release v$(VERSION)..."
	@node .claude/cli.js release prepare \
		--version $(VERSION) \
		--project-type $(PROJECT_TYPE)

# ============================================================================
# LANGUAGE-ADAPTIVE COMMANDS
# ============================================================================

# Run tests based on detected project type
test:
	@echo "🧪 Running tests for $(PROJECT_TYPE) project..."
	@$(TEST_CMD)

# Run linting based on project type
lint:
	@echo "🎨 Running linting for $(PROJECT_TYPE) project..."
	@$(LINT_CMD)

# Build based on project type
build:
	@echo "🔨 Building $(PROJECT_TYPE) project..."
	@$(BUILD_CMD)

# Language-specific TDD validation
tdd-validate:
ifeq ($(PROJECT_TYPE),javascript)
	@npm run test:tdd:js 2>/dev/null || node .claude/scripts/tdd-validator.js
else ifeq ($(PROJECT_TYPE),python)
	@python .claude/scripts/tdd-validator.py
else
	@echo "⚠️  TDD validation not configured for $(PROJECT_TYPE)"
endif

# ============================================================================
# UNIVERSAL COMMANDS - Work everywhere
# ============================================================================

# Validate quality gates (adapts to project)
validate:
	@echo "✅ Running quality gates for $(PROJECT_TYPE)..."
	@node .claude/cli.js validator check-gates \
		--project-type $(PROJECT_TYPE) \
		--test-cmd "$(TEST_CMD)" \
		--lint-cmd "$(LINT_CMD)"

# Monitor (universal dashboard)
monitor:
	@echo "📊 Starting monitoring dashboard..."
	@node .claude/monitoring/dashboard.js \
		--project-type $(PROJECT_TYPE) &
	@echo "✅ Dashboard at http://localhost:3001"

# Status (shows all agents and journeys)
status:
	@echo "📊 System Status"
	@echo "=================="
	@echo "Project Type: $(PROJECT_TYPE)"
	@echo ""
	@node .claude/cli.js status --detailed

# Clean (universal)
clean:
	@echo "🧹 Cleaning generated files..."
	@rm -rf coverage/ reports/ assessments/ proposals/
	@rm -rf .coverage htmlcov/ .pytest_cache/ __pycache__/
	@rm -rf node_modules/.cache .next/ dist/ build/
	@echo "✅ Clean complete"

# ============================================================================
# QUICK COMMANDS - Shortcuts for common tasks
# ============================================================================

# Quick assessment
qa: assess

# Quick fix with most recent task
qf:
	@TASK=$$(node .claude/cli.js linear recent --limit 1 --format id); \
	$(MAKE) fix TASK=$$TASK

# Quick validation
qv: validate

# Quick status
qs: status

# ============================================================================
# INSTALLATION HELPERS
# ============================================================================

# Check if .claude is properly installed
check-install:
	@if [ ! -d ".claude" ]; then \
		echo "❌ .claude directory not found!"; \
		echo "   Run: make init"; \
		exit 1; \
	fi
	@echo "✅ .claude directory found"
	@echo "Checking components:"
	@test -f .claude/cli.js && echo "  ✅ CLI installed" || echo "  ❌ CLI missing"
	@test -d .claude/agents && echo "  ✅ Agents installed" || echo "  ❌ Agents missing"
	@test -d .claude/scripts && echo "  ✅ Scripts installed" || echo "  ❌ Scripts missing"
	@test -f .claude/mcp.json && echo "  ✅ MCP configured" || echo "  ❌ MCP missing"

# Install for specific language
install-python:
	@echo "🐍 Installing Python-specific components..."
	@pip install pytest pytest-cov black ruff pylint 2>/dev/null || true
	@pip install mutmut hypothesis 2>/dev/null || true
	@echo "✅ Python tools installed"

install-javascript:
	@echo "📦 Installing JavaScript-specific components..."
	@npm install --save-dev jest @types/jest eslint prettier 2>/dev/null || true
	@npm install --save-dev @stryker-mutator/core 2>/dev/null || true
	@echo "✅ JavaScript tools installed"

# Auto-install based on detection
install-tools: check-install
ifeq ($(PROJECT_TYPE),python)
	@$(MAKE) install-python
else ifeq ($(PROJECT_TYPE),javascript)
	@$(MAKE) install-javascript
endif

.SILENT: help status check-install