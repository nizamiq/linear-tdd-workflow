#!/usr/bin/env bash
#
# Intelligent Project Linting Script
# Auto-detects project type and frameworks, runs appropriate modern linters
#
# Usage:
#   ./scripts/intelligent-lint.sh [scope] [mode]
#
# Arguments:
#   scope - Directory or glob pattern (default: .)
#   mode  - check|fix (default: check)
#
# Modern tools used:
#   Python: ruff (replaces flake8, isort, etc.), black, mypy
#   JS/TS: eslint, prettier, tsc
#

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCOPE="${1:-.}"
MODE="${2:-check}"
PROJECT_ROOT="$(pwd)"
START_TIME=$(date +%s)

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Result tracking
declare -A LINTER_RESULTS
declare -A LINTER_ERRORS
declare -A LINTER_WARNINGS
TOTAL_ERRORS=0
TOTAL_WARNINGS=0
TOTAL_FIXED=0

# ============================================================================
# Phase 1: Project Detection
# ============================================================================

echo -e "${BLUE}🔍 Phase 1: Detecting Project Type and Frameworks${NC}"
echo ""

# Detect languages
HAS_PYTHON=false
HAS_JAVASCRIPT=false
HAS_TYPESCRIPT=false
HAS_MARKDOWN=false
HAS_YAML=false

# Python detection
if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "setup.py" ] || [ -f "Pipfile" ]; then
    HAS_PYTHON=true
    echo -e "${GREEN}✓${NC} Python project detected"
fi

# JavaScript detection
if [ -f "package.json" ]; then
    HAS_JAVASCRIPT=true
    echo -e "${GREEN}✓${NC} JavaScript project detected"
fi

# TypeScript detection
if [ -f "tsconfig.json" ] || grep -q "typescript" package.json 2>/dev/null; then
    HAS_TYPESCRIPT=true
    echo -e "${GREEN}✓${NC} TypeScript project detected"
fi

# Markdown detection
if find . -name "*.md" -type f -print -quit 2>/dev/null | grep -q .; then
    HAS_MARKDOWN=true
    echo -e "${GREEN}✓${NC} Markdown files detected"
fi

# YAML detection
if find . -name "*.yaml" -o -name "*.yml" -type f -print -quit 2>/dev/null | grep -q .; then
    HAS_YAML=true
    echo -e "${GREEN}✓${NC} YAML files detected"
fi

# Detect other common languages (informational only, graceful degradation)
echo ""
echo -e "${BLUE}  Detecting additional languages...${NC}"

OTHER_LANGUAGES=()

# Go detection
if [ -f "go.mod" ] || find . -name "*.go" -type f -print -quit 2>/dev/null | grep -q .; then
    OTHER_LANGUAGES+=("Go:golangci-lint,gofmt")
    echo -e "  ${YELLOW}ℹ${NC}  Go files detected - install golangci-lint for linting"
fi

# Rust detection
if [ -f "Cargo.toml" ] || find . -name "*.rs" -type f -print -quit 2>/dev/null | grep -q .; then
    OTHER_LANGUAGES+=("Rust:clippy,rustfmt")
    echo -e "  ${YELLOW}ℹ${NC}  Rust files detected - install clippy and rustfmt for linting"
fi

# Java detection
if [ -f "pom.xml" ] || [ -f "build.gradle" ] || find . -name "*.java" -type f -print -quit 2>/dev/null | grep -q .; then
    OTHER_LANGUAGES+=("Java:checkstyle,spotbugs")
    echo -e "  ${YELLOW}ℹ${NC}  Java files detected - install checkstyle or spotbugs for linting"
fi

# Ruby detection
if [ -f "Gemfile" ] || find . -name "*.rb" -type f -print -quit 2>/dev/null | grep -q .; then
    OTHER_LANGUAGES+=("Ruby:rubocop")
    echo -e "  ${YELLOW}ℹ${NC}  Ruby files detected - install rubocop for linting"
fi

# PHP detection
if [ -f "composer.json" ] || find . -name "*.php" -type f -print -quit 2>/dev/null | grep -q .; then
    OTHER_LANGUAGES+=("PHP:phpcs,psalm")
    echo -e "  ${YELLOW}ℹ${NC}  PHP files detected - install phpcs or psalm for linting"
fi

# C/C++ detection
if find . -name "*.c" -o -name "*.cpp" -o -name "*.h" -o -name "*.hpp" -type f -print -quit 2>/dev/null | grep -q .; then
    OTHER_LANGUAGES+=("C/C++:clang-tidy,cppcheck")
    echo -e "  ${YELLOW}ℹ${NC}  C/C++ files detected - install clang-tidy or cppcheck for linting"
fi

# Shell scripts detection
if find . -name "*.sh" -o -name "*.bash" -type f -print -quit 2>/dev/null | grep -q .; then
    OTHER_LANGUAGES+=("Shell:shellcheck")
    echo -e "  ${YELLOW}ℹ${NC}  Shell scripts detected - install shellcheck for linting"
fi

# Detect Python frameworks
if [ "$HAS_PYTHON" = true ]; then
    echo ""
    echo -e "${BLUE}  Detecting Python frameworks...${NC}"

    HAS_DJANGO=false
    HAS_FASTAPI=false
    HAS_PYDANTIC=false
    HAS_FLASK=false

    if grep -qE "django[>=<]|django$" requirements.txt pyproject.toml setup.py 2>/dev/null || \
       [ -f "manage.py" ]; then
        HAS_DJANGO=true
        echo -e "  ${GREEN}✓${NC} Django detected"
    fi

    if grep -qE "fastapi[>=<]|fastapi$" requirements.txt pyproject.toml setup.py 2>/dev/null; then
        HAS_FASTAPI=true
        echo -e "  ${GREEN}✓${NC} FastAPI detected"
    fi

    if grep -qE "pydantic[>=<]|pydantic$" requirements.txt pyproject.toml setup.py 2>/dev/null; then
        HAS_PYDANTIC=true
        echo -e "  ${GREEN}✓${NC} Pydantic detected"
    fi

    if grep -qE "flask[>=<]|flask$" requirements.txt pyproject.toml setup.py 2>/dev/null; then
        HAS_FLASK=true
        echo -e "  ${GREEN}✓${NC} Flask detected"
    fi
fi

# Detect JavaScript/TypeScript frameworks
if [ "$HAS_JAVASCRIPT" = true ] || [ "$HAS_TYPESCRIPT" = true ]; then
    echo ""
    echo -e "${BLUE}  Detecting JavaScript/TypeScript frameworks...${NC}"

    HAS_REACT=false
    HAS_NEXTJS=false
    HAS_VUE=false
    HAS_ANGULAR=false
    HAS_NESTJS=false

    if grep -qE "\"react\":|'react':" package.json 2>/dev/null; then
        HAS_REACT=true
        echo -e "  ${GREEN}✓${NC} React detected"
    fi

    if grep -qE "\"next\":|'next':" package.json 2>/dev/null || [ -f "next.config.js" ]; then
        HAS_NEXTJS=true
        echo -e "  ${GREEN}✓${NC} Next.js detected"
    fi

    if grep -qE "\"vue\":|'vue':" package.json 2>/dev/null; then
        HAS_VUE=true
        echo -e "  ${GREEN}✓${NC} Vue detected"
    fi

    if grep -qE "\"@angular/core\":|'@angular/core':" package.json 2>/dev/null; then
        HAS_ANGULAR=true
        echo -e "  ${GREEN}✓${NC} Angular detected"
    fi

    if grep -qE "\"@nestjs/core\":|'@nestjs/core':" package.json 2>/dev/null; then
        HAS_NESTJS=true
        echo -e "  ${GREEN}✓${NC} NestJS detected"
    fi
fi

echo ""

# ============================================================================
# Phase 2: Check Linter Installation
# ============================================================================

echo -e "${BLUE}🔧 Phase 2: Checking Linter Availability${NC}"
echo ""

declare -A LINTERS_AVAILABLE

# Check Python linters
if [ "$HAS_PYTHON" = true ]; then
    if command -v ruff &> /dev/null; then
        echo -e "${GREEN}✓${NC} ruff available ($(ruff --version))"
        LINTERS_AVAILABLE[ruff]=true
    else
        echo -e "${YELLOW}⚠${NC}  ruff not installed - install with: pip install ruff"
        LINTERS_AVAILABLE[ruff]=false
    fi

    if command -v black &> /dev/null; then
        echo -e "${GREEN}✓${NC} black available ($(black --version | head -n1))"
        LINTERS_AVAILABLE[black]=true
    else
        echo -e "${YELLOW}⚠${NC}  black not installed - install with: pip install black"
        LINTERS_AVAILABLE[black]=false
    fi

    if command -v mypy &> /dev/null; then
        echo -e "${GREEN}✓${NC} mypy available ($(mypy --version))"
        LINTERS_AVAILABLE[mypy]=true
    else
        echo -e "${YELLOW}⚠${NC}  mypy not installed - install with: pip install mypy"
        LINTERS_AVAILABLE[mypy]=false
    fi
fi

# Check JavaScript/TypeScript linters
if [ "$HAS_JAVASCRIPT" = true ] || [ "$HAS_TYPESCRIPT" = true ]; then
    if command -v eslint &> /dev/null || [ -f "node_modules/.bin/eslint" ]; then
        echo -e "${GREEN}✓${NC} eslint available"
        LINTERS_AVAILABLE[eslint]=true
    else
        echo -e "${YELLOW}⚠${NC}  eslint not installed - install with: npm install eslint"
        LINTERS_AVAILABLE[eslint]=false
    fi

    if command -v prettier &> /dev/null || [ -f "node_modules/.bin/prettier" ]; then
        echo -e "${GREEN}✓${NC} prettier available"
        LINTERS_AVAILABLE[prettier]=true
    else
        echo -e "${YELLOW}⚠${NC}  prettier not installed - install with: npm install prettier"
        LINTERS_AVAILABLE[prettier]=false
    fi

    if [ "$HAS_TYPESCRIPT" = true ]; then
        if command -v tsc &> /dev/null || [ -f "node_modules/.bin/tsc" ]; then
            echo -e "${GREEN}✓${NC} tsc available"
            LINTERS_AVAILABLE[tsc]=true
        else
            echo -e "${YELLOW}⚠${NC}  tsc not installed - install with: npm install typescript"
            LINTERS_AVAILABLE[tsc]=false
        fi
    fi
fi

# Check markdown linters
if [ "$HAS_MARKDOWN" = true ]; then
    if command -v markdownlint &> /dev/null || [ -f "node_modules/.bin/markdownlint" ]; then
        echo -e "${GREEN}✓${NC} markdownlint available"
        LINTERS_AVAILABLE[markdownlint]=true
    else
        echo -e "${YELLOW}⚠${NC}  markdownlint not installed - install with: npm install -g markdownlint-cli"
        LINTERS_AVAILABLE[markdownlint]=false
    fi

    # Prettier can also lint markdown
    if [ "${LINTERS_AVAILABLE[prettier]}" != true ]; then
        if command -v prettier &> /dev/null || [ -f "node_modules/.bin/prettier" ]; then
            echo -e "${GREEN}✓${NC} prettier available (for markdown)"
            LINTERS_AVAILABLE[prettier]=true
        fi
    fi
fi

# Check YAML linters
if [ "$HAS_YAML" = true ]; then
    if command -v yamllint &> /dev/null; then
        echo -e "${GREEN}✓${NC} yamllint available ($(yamllint --version))"
        LINTERS_AVAILABLE[yamllint]=true
    else
        echo -e "${YELLOW}⚠${NC}  yamllint not installed - install with: pip install yamllint"
        LINTERS_AVAILABLE[yamllint]=false
    fi

    # Prettier can also lint YAML
    if [ "${LINTERS_AVAILABLE[prettier]}" != true ]; then
        if command -v prettier &> /dev/null || [ -f "node_modules/.bin/prettier" ]; then
            echo -e "${GREEN}✓${NC} prettier available (for YAML)"
            LINTERS_AVAILABLE[prettier]=true
        fi
    fi
fi

echo ""

# ============================================================================
# Phase 3: Execute Linters
# ============================================================================

echo -e "${BLUE}🚀 Phase 3: Running Linters (${MODE} mode)${NC}"
echo ""

# Create temp directory for logs
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

run_linter() {
    local name=$1
    local command=$2
    local log_file="$TEMP_DIR/${name}.log"

    echo -e "${BLUE}  Running ${name}...${NC}"

    if eval "$command" > "$log_file" 2>&1; then
        LINTER_RESULTS[$name]="success"
        LINTER_ERRORS[$name]=0
        LINTER_WARNINGS[$name]=0
        echo -e "${GREEN}  ✓ ${name} - no issues${NC}"
    else
        local exit_code=$?
        LINTER_RESULTS[$name]="failed"

        # Parse output to count errors and warnings
        local errors=0
        local warnings=0

        case $name in
            ruff)
                errors=$(grep -c "error:" "$log_file" 2>/dev/null || echo "0")
                warnings=$(grep -c "warning:" "$log_file" 2>/dev/null || echo "0")
                ;;
            mypy)
                errors=$(grep -c "error:" "$log_file" 2>/dev/null || echo "0")
                warnings=$(grep -c "note:" "$log_file" 2>/dev/null || echo "0")
                ;;
            eslint)
                errors=$(grep -c "error" "$log_file" 2>/dev/null || echo "0")
                warnings=$(grep -c "warning" "$log_file" 2>/dev/null || echo "0")
                ;;
            tsc)
                errors=$(grep -c "error TS" "$log_file" 2>/dev/null || echo "0")
                ;;
            markdownlint)
                errors=$(grep -c "MD[0-9]" "$log_file" 2>/dev/null || echo "0")
                warnings=0
                ;;
            yamllint)
                errors=$(grep -c "error" "$log_file" 2>/dev/null || echo "0")
                warnings=$(grep -c "warning" "$log_file" 2>/dev/null || echo "0")
                ;;
        esac

        LINTER_ERRORS[$name]=$errors
        LINTER_WARNINGS[$name]=$warnings
        TOTAL_ERRORS=$((TOTAL_ERRORS + errors))
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + warnings))

        if [ $errors -gt 0 ]; then
            echo -e "${RED}  ✗ ${name} - ${errors} errors, ${warnings} warnings${NC}"
        else
            echo -e "${YELLOW}  ⚠ ${name} - ${warnings} warnings${NC}"
        fi
    fi
}

# Python linters
if [ "$HAS_PYTHON" = true ]; then
    echo -e "${BLUE}Python Linters:${NC}"

    # ruff - modern, fast linter
    if [ "${LINTERS_AVAILABLE[ruff]}" = true ]; then
        if [ "$MODE" = "fix" ]; then
            # Build ruff command with framework-specific rules
            RUFF_SELECT="E,F,W,I,N,B,A,C4,DTZ,T10,T20,RET,SIM,ARG,PTH,PL,RUF"

            # Add framework-specific rules
            if [ "$HAS_DJANGO" = true ]; then
                RUFF_SELECT="${RUFF_SELECT},DJ"
            fi
            if [ "$HAS_FASTAPI" = true ] || [ "$HAS_PYDANTIC" = true ]; then
                RUFF_SELECT="${RUFF_SELECT},ASYNC,PD"
            fi

            run_linter "ruff" "ruff check --select=$RUFF_SELECT --fix '$SCOPE'"
        else
            RUFF_SELECT="E,F,W,I,N,B,A,C4,DTZ,T10,T20,RET,SIM,ARG,PTH,PL,RUF"

            if [ "$HAS_DJANGO" = true ]; then
                RUFF_SELECT="${RUFF_SELECT},DJ"
            fi
            if [ "$HAS_FASTAPI" = true ] || [ "$HAS_PYDANTIC" = true ]; then
                RUFF_SELECT="${RUFF_SELECT},ASYNC,PD"
            fi

            run_linter "ruff" "ruff check --select=$RUFF_SELECT '$SCOPE'"
        fi
    fi

    # black - code formatter
    if [ "${LINTERS_AVAILABLE[black]}" = true ]; then
        if [ "$MODE" = "fix" ]; then
            run_linter "black" "black --quiet '$SCOPE'"
            # Count formatted files
            TOTAL_FIXED=$((TOTAL_FIXED + $(grep -c "reformatted" "$TEMP_DIR/black.log" 2>/dev/null || echo "0")))
        else
            run_linter "black" "black --check --quiet '$SCOPE'"
        fi
    fi

    # mypy - type checker
    if [ "${LINTERS_AVAILABLE[mypy]}" = true ]; then
        MYPY_ARGS=""

        # Add framework-specific mypy plugins
        if [ "$HAS_DJANGO" = true ]; then
            MYPY_ARGS="$MYPY_ARGS --config-file=pyproject.toml"
        fi
        if [ "$HAS_PYDANTIC" = true ]; then
            MYPY_ARGS="$MYPY_ARGS --plugins pydantic.mypy"
        fi

        run_linter "mypy" "mypy $MYPY_ARGS '$SCOPE'"
    fi

    echo ""
fi

# JavaScript/TypeScript linters
if [ "$HAS_JAVASCRIPT" = true ] || [ "$HAS_TYPESCRIPT" = true ]; then
    echo -e "${BLUE}JavaScript/TypeScript Linters:${NC}"

    # eslint
    if [ "${LINTERS_AVAILABLE[eslint]}" = true ]; then
        ESLINT_CMD="eslint"
        [ -f "node_modules/.bin/eslint" ] && ESLINT_CMD="node_modules/.bin/eslint"

        if [ "$MODE" = "fix" ]; then
            run_linter "eslint" "$ESLINT_CMD --fix '$SCOPE'"
            TOTAL_FIXED=$((TOTAL_FIXED + $(grep -c "fixed" "$TEMP_DIR/eslint.log" 2>/dev/null || echo "0")))
        else
            run_linter "eslint" "$ESLINT_CMD '$SCOPE'"
        fi
    fi

    # prettier
    if [ "${LINTERS_AVAILABLE[prettier]}" = true ]; then
        PRETTIER_CMD="prettier"
        [ -f "node_modules/.bin/prettier" ] && PRETTIER_CMD="node_modules/.bin/prettier"

        if [ "$MODE" = "fix" ]; then
            run_linter "prettier" "$PRETTIER_CMD --write '$SCOPE'"
            TOTAL_FIXED=$((TOTAL_FIXED + $(wc -l < "$TEMP_DIR/prettier.log" 2>/dev/null || echo "0")))
        else
            run_linter "prettier" "$PRETTIER_CMD --check '$SCOPE'"
        fi
    fi

    # tsc (TypeScript only, check mode only)
    if [ "$HAS_TYPESCRIPT" = true ] && [ "${LINTERS_AVAILABLE[tsc]}" = true ]; then
        TSC_CMD="tsc"
        [ -f "node_modules/.bin/tsc" ] && TSC_CMD="node_modules/.bin/tsc"

        run_linter "tsc" "$TSC_CMD --noEmit"
    fi

    echo ""
fi

# Markdown linters
if [ "$HAS_MARKDOWN" = true ]; then
    echo -e "${BLUE}Markdown Linters:${NC}"

    # markdownlint
    if [ "${LINTERS_AVAILABLE[markdownlint]}" = true ]; then
        MDLINT_CMD="markdownlint"
        [ -f "node_modules/.bin/markdownlint" ] && MDLINT_CMD="node_modules/.bin/markdownlint"

        if [ "$MODE" = "fix" ]; then
            run_linter "markdownlint" "$MDLINT_CMD --fix '$SCOPE/**/*.md'"
        else
            run_linter "markdownlint" "$MDLINT_CMD '$SCOPE/**/*.md'"
        fi
    fi

    # prettier for markdown (if markdownlint not available or as additional formatter)
    if [ "${LINTERS_AVAILABLE[prettier]}" = true ]; then
        PRETTIER_CMD="prettier"
        [ -f "node_modules/.bin/prettier" ] && PRETTIER_CMD="node_modules/.bin/prettier"

        if [ "$MODE" = "fix" ]; then
            run_linter "prettier-md" "$PRETTIER_CMD --write '$SCOPE/**/*.md'"
        else
            run_linter "prettier-md" "$PRETTIER_CMD --check '$SCOPE/**/*.md'"
        fi
    fi

    echo ""
fi

# YAML linters
if [ "$HAS_YAML" = true ]; then
    echo -e "${BLUE}YAML Linters:${NC}"

    # yamllint
    if [ "${LINTERS_AVAILABLE[yamllint]}" = true ]; then
        if [ "$MODE" = "fix" ]; then
            # yamllint doesn't have auto-fix, just check
            run_linter "yamllint" "yamllint -f parsable '$SCOPE'"
        else
            run_linter "yamllint" "yamllint -f parsable '$SCOPE'"
        fi
    fi

    # prettier for YAML (for formatting)
    if [ "${LINTERS_AVAILABLE[prettier]}" = true ]; then
        PRETTIER_CMD="prettier"
        [ -f "node_modules/.bin/prettier" ] && PRETTIER_CMD="node_modules/.bin/prettier"

        if [ "$MODE" = "fix" ]; then
            run_linter "prettier-yaml" "$PRETTIER_CMD --write '$SCOPE/**/*.{yaml,yml}'"
        else
            run_linter "prettier-yaml" "$PRETTIER_CMD --check '$SCOPE/**/*.{yaml,yml}'"
        fi
    fi

    echo ""
fi

# ============================================================================
# Phase 4: Generate Report
# ============================================================================

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "========================================================================"
echo ""

if [ $TOTAL_ERRORS -eq 0 ] && [ $TOTAL_WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Linting Complete - No Issues Found${NC}"
else
    echo -e "${YELLOW}⚠️  Linting Complete - Issues Found${NC}"
fi

echo ""
echo -e "${BLUE}📊 Summary:${NC}"

# Build languages list
LANG_LIST=""
[ "$HAS_PYTHON" = true ] && LANG_LIST="${LANG_LIST}Python "
[ "$HAS_JAVASCRIPT" = true ] && LANG_LIST="${LANG_LIST}JavaScript "
[ "$HAS_TYPESCRIPT" = true ] && LANG_LIST="${LANG_LIST}TypeScript "
[ "$HAS_MARKDOWN" = true ] && LANG_LIST="${LANG_LIST}Markdown "
[ "$HAS_YAML" = true ] && LANG_LIST="${LANG_LIST}YAML "
[ ${#OTHER_LANGUAGES[@]} -gt 0 ] && for lang in "${OTHER_LANGUAGES[@]}"; do
    LANG_LIST="${LANG_LIST}${lang%%:*} "
done

echo "  Languages: ${LANG_LIST:-None}"

# Build frameworks list
FRAMEWORK_LIST=""
[ "$HAS_DJANGO" = true ] && FRAMEWORK_LIST="${FRAMEWORK_LIST}Django "
[ "$HAS_FASTAPI" = true ] && FRAMEWORK_LIST="${FRAMEWORK_LIST}FastAPI "
[ "$HAS_PYDANTIC" = true ] && FRAMEWORK_LIST="${FRAMEWORK_LIST}Pydantic "
[ "$HAS_FLASK" = true ] && FRAMEWORK_LIST="${FRAMEWORK_LIST}Flask "
[ "$HAS_REACT" = true ] && FRAMEWORK_LIST="${FRAMEWORK_LIST}React "
[ "$HAS_NEXTJS" = true ] && FRAMEWORK_LIST="${FRAMEWORK_LIST}Next.js "
[ "$HAS_VUE" = true ] && FRAMEWORK_LIST="${FRAMEWORK_LIST}Vue "
[ "$HAS_ANGULAR" = true ] && FRAMEWORK_LIST="${FRAMEWORK_LIST}Angular "
[ "$HAS_NESTJS" = true ] && FRAMEWORK_LIST="${FRAMEWORK_LIST}NestJS "

echo "  Frameworks: ${FRAMEWORK_LIST:-None}"
echo ""

if [ $TOTAL_ERRORS -gt 0 ] || [ $TOTAL_WARNINGS -gt 0 ]; then
    echo -e "${BLUE}🔍 Issues by Severity:${NC}"
    echo -e "  ${RED}Errors:${NC}   $TOTAL_ERRORS"
    echo -e "  ${YELLOW}Warnings:${NC} $TOTAL_WARNINGS"
    echo ""

    echo -e "${BLUE}📋 Issues by Linter:${NC}"
    for linter in "${!LINTER_RESULTS[@]}"; do
        if [ "${LINTER_RESULTS[$linter]}" = "failed" ]; then
            errors=${LINTER_ERRORS[$linter]}
            warnings=${LINTER_WARNINGS[$linter]}

            if [ $errors -gt 0 ]; then
                echo -e "  ${RED}✗${NC} $linter: $errors errors, $warnings warnings"
            else
                echo -e "  ${YELLOW}⚠${NC} $linter: $warnings warnings"
            fi

            # Show top 5 issues from log
            echo "    $(head -5 "$TEMP_DIR/${linter}.log" | sed 's/^/    /')"
        else
            echo -e "  ${GREEN}✓${NC} $linter: no issues"
        fi
    done
    echo ""
fi

if [ "$MODE" = "fix" ] && [ $TOTAL_FIXED -gt 0 ]; then
    echo -e "${GREEN}🔧 Auto-fixed: $TOTAL_FIXED issues${NC}"
    echo ""
fi

echo -e "${BLUE}⏱️  Duration:${NC} ${DURATION}s"
echo ""

# Exit with error if issues found
if [ $TOTAL_ERRORS -gt 0 ]; then
    echo -e "${YELLOW}💡 Tip: Run with 'fix' mode to auto-fix some issues:${NC}"
    echo "   ./scripts/intelligent-lint.sh . fix"
    exit 1
elif [ $TOTAL_WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}💡 Some warnings found. Consider addressing them.${NC}"
    exit 0
else
    exit 0
fi
