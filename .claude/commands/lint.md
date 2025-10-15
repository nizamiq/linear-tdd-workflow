---
title: Intelligent Project Linting
command: /lint
description: Auto-detect project type and run appropriate modern linters with framework-specific rules
version: 1.0.0
agent: LINTER
priority: high
parameters:
  - name: scope
    type: string
    required: false
    description: Directory or file path to lint (default: entire project)
  - name: mode
    type: string
    required: false
    default: check
    options: [check, fix]
    description: check = report issues, fix = auto-fix where possible
  - name: framework
    type: string
    required: false
    description: Override framework detection (django, fastapi, pydantic, react, nextjs, vue)
---

# 🚀 Intelligent Project Linting

Automatically detect project type (Python/JS/TS) and frameworks, then run appropriate modern linters with framework-specific rules.

## Purpose

Provide intelligent, context-aware linting that:
- **Auto-detects** project languages (Python, JavaScript, TypeScript)
- **Auto-detects** frameworks (Django, FastAPI, Pydantic, React, Next.js, Vue, etc.)
- **Runs modern linters** (ruff, black, mypy, eslint, prettier, tsc)
- **Applies framework-specific rules** automatically
- **Executes in parallel** for maximum speed
- **Supports fix mode** for auto-remediation

## Modern Linters Used

### Python
- **ruff** - Ultra-fast Python linter (replaces flake8, isort, pyupgrade, etc.)
- **black** - Uncompromising code formatter
- **mypy** - Static type checker with framework plugins

### JavaScript/TypeScript
- **eslint** - Pluggable linting utility
- **prettier** - Opinionated code formatter
- **tsc** - TypeScript compiler type checking

### Markdown
- **markdownlint** - Markdown style and syntax checker
- **prettier** - Also formats markdown files

### YAML
- **yamllint** - YAML linter for syntax and style issues
- **prettier** - Also formats YAML files

## Framework Detection

The system automatically detects frameworks by analyzing:

**Python:**
- `requirements.txt`, `pyproject.toml`, `Pipfile` for dependencies
- `manage.py` for Django
- `__init__.py` with FastAPI imports
- Pydantic models in codebase

**JavaScript/TypeScript:**
- `package.json` dependencies
- `next.config.js` for Next.js
- React imports in files
- Vue single-file components

## Framework-Specific Rules

### Django
```bash
# Python linters with Django support
ruff check --select=DJ  # Django-specific rules
mypy --config-file=pyproject.toml  # Uses django-stubs
```

### FastAPI
```bash
# Strict type checking for FastAPI
mypy --strict --check-untyped-defs
ruff check --select=ASYNC  # Async/await rules
```

### Pydantic
```bash
# Pydantic-aware type checking
mypy --plugins pydantic.mypy
ruff check --select=PD  # Pydantic-specific rules
```

### React
```javascript
// ESLint with React hooks rules
{
  "extends": ["react-app", "plugin:react-hooks/recommended"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Next.js
```javascript
// ESLint with Next.js config
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@next/next/no-html-link-for-pages": "error"
  }
}
```

## Command Usage

### Basic Usage

```bash
# Lint entire project (auto-detect everything)
/lint

# Lint specific directory
/lint --scope=src/api

# Lint and auto-fix issues
/lint --mode=fix

# Lint with framework override
/lint --framework=django
```

### Advanced Usage

```bash
# Lint specific file types
/lint --scope="**/*.py"

# Fix mode with scope
/lint --scope=src --mode=fix

# Multiple frameworks (mixed project)
/lint  # Auto-detects all frameworks
```

## Execution Flow

```mermaid
graph TD
    A[/lint command invoked] --> B[Phase 1: Project Detection]
    B --> C{Detect Languages}
    C -->|Python| D[Detect Python Frameworks]
    C -->|JS/TS| E[Detect JS/TS Frameworks]
    C -->|Both| F[Multi-language Project]

    D --> G[Phase 2: Configure Linters]
    E --> G
    F --> G

    G --> H{Mode?}
    H -->|check| I[Phase 3: Run Linters in Check Mode]
    H -->|fix| J[Phase 3: Run Linters in Fix Mode]

    I --> K[Phase 4: Aggregate Results]
    J --> K

    K --> L[Phase 5: Generate Report]
    L --> M[Return Results to User]
```

## Phase 1: Project Detection

Auto-detect project characteristics:

**Detection Steps:**

1. **Scan for language indicators:**
   ```bash
   # Python indicators
   test -f requirements.txt || test -f pyproject.toml || test -f setup.py

   # JS/TS indicators
   test -f package.json || test -f tsconfig.json
   ```

2. **Analyze dependency files:**
   ```bash
   # Python frameworks
   grep -E "(django|fastapi|pydantic)" requirements.txt pyproject.toml

   # JS/TS frameworks
   grep -E "(react|next|vue|@angular)" package.json
   ```

3. **Scan codebase for framework patterns:**
   ```bash
   # Django patterns
   find . -name "manage.py" -o -name "settings.py"

   # React patterns
   grep -r "import.*React" --include="*.tsx" --include="*.jsx"
   ```

**Output:**
```json
{
  "languages": ["python", "typescript"],
  "frameworks": {
    "python": ["django", "pydantic"],
    "javascript": ["react", "nextjs"]
  },
  "linters": {
    "python": ["ruff", "black", "mypy"],
    "javascript": ["eslint", "prettier", "tsc"]
  }
}
```

## Phase 2: Configure Linters

Apply framework-specific configurations:

### Python Configuration

**Django Project:**
```toml
# pyproject.toml
[tool.ruff]
select = ["E", "F", "W", "DJ", "I", "N"]  # Include Django rules
extend-ignore = ["DJ01"]  # Customize as needed

[tool.mypy]
plugins = ["mypy_django_plugin.main"]
django_settings_module = "myproject.settings"
```

**FastAPI Project:**
```toml
# pyproject.toml
[tool.ruff]
select = ["E", "F", "W", "ASYNC", "B", "I"]
target-version = "py311"

[tool.mypy]
strict = true
warn_return_any = true
disallow_untyped_defs = true
```

**Pydantic Project:**
```toml
# pyproject.toml
[tool.mypy]
plugins = ["pydantic.mypy"]

[tool.pydantic-mypy]
init_forbid_extra = true
init_typed = true
warn_required_dynamic_aliases = true
```

### JavaScript/TypeScript Configuration

**React Project:**
```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Next.js Project:**
```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "@next/next/no-html-link-for-pages": "error",
    "@next/next/no-img-element": "warn"
  }
}
```

## Phase 3: Execute Linters

Run linters in parallel for speed:

### Check Mode (Default)

**Python:**
```bash
# Run in parallel
ruff check . &
black --check . &
mypy . &
wait

# Collect exit codes
RUFF_EXIT=$?
BLACK_EXIT=$?
MYPY_EXIT=$?
```

**JavaScript/TypeScript:**
```bash
# Run in parallel
eslint . &
prettier --check . &
tsc --noEmit &
wait

# Collect exit codes
ESLINT_EXIT=$?
PRETTIER_EXIT=$?
TSC_EXIT=$?
```

### Fix Mode

**Python:**
```bash
# Auto-fix where possible
ruff check --fix .
black .
# mypy is check-only (no auto-fix)
mypy .
```

**JavaScript/TypeScript:**
```bash
# Auto-fix where possible
eslint --fix .
prettier --write .
# tsc is check-only (no auto-fix)
tsc --noEmit
```

## Phase 4: Aggregate Results

Collect and categorize issues:

**Issue Categories:**
- **Critical** - Type errors, undefined variables, syntax errors
- **High** - Security issues, bad practices, performance problems
- **Medium** - Style violations, complexity issues
- **Low** - Formatting, import order, whitespace

**Aggregation:**
```javascript
{
  "summary": {
    "total_files": 247,
    "linted_files": 245,
    "errors": 12,
    "warnings": 34,
    "fixed": 56  // Only in fix mode
  },
  "by_linter": {
    "ruff": { "errors": 5, "warnings": 15 },
    "mypy": { "errors": 7, "warnings": 0 },
    "eslint": { "errors": 0, "warnings": 19 }
  },
  "by_category": {
    "critical": 7,
    "high": 5,
    "medium": 19,
    "low": 15
  }
}
```

## Phase 5: Generate Report

Create comprehensive linting report:

**Success Report (No Issues):**
```
✅ Linting Complete - No Issues Found

📊 Project Analysis:
  Languages: Python, TypeScript
  Frameworks: Django, React, Next.js

🔍 Linters Executed:
  ✅ ruff (Python) - 0 issues
  ✅ black (Python) - 0 issues
  ✅ mypy (Python) - 0 issues
  ✅ eslint (JS/TS) - 0 issues
  ✅ prettier (JS/TS) - 0 issues
  ✅ tsc (TypeScript) - 0 issues

📁 Files Analyzed: 245/247
⏱️  Duration: 3.2s
```

**Issues Found Report:**
```
⚠️  Linting Complete - 46 Issues Found

📊 Project Analysis:
  Languages: Python, TypeScript
  Frameworks: Django, React, Next.js

🔍 Issues by Severity:
  🔴 Critical: 7
  🟠 High: 5
  🟡 Medium: 19
  🟢 Low: 15

📋 Issues by Linter:
  ruff: 20 issues (5 errors, 15 warnings)
    - src/api/views.py:45 - Undefined name 'request'
    - src/utils/helpers.py:12 - Unused import 'os'

  mypy: 7 issues (7 errors)
    - src/models/user.py:23 - Missing return statement
    - src/api/serializers.py:56 - Incompatible types

  eslint: 19 issues (19 warnings)
    - src/components/Button.tsx:12 - React Hook useEffect has missing dependency

📁 Files Analyzed: 245/247
⏱️  Duration: 3.2s

💡 Tip: Run '/lint --mode=fix' to auto-fix 34 of these issues
```

**Fix Mode Report:**
```
✅ Auto-Fix Complete

📊 Changes Applied:
  Fixed: 34 issues
  Remaining: 12 issues (require manual fix)

🔧 Auto-Fixed Issues:
  ruff: 15 issues
    ✅ Fixed import order in 8 files
    ✅ Removed unused imports in 5 files
    ✅ Fixed line length in 12 files

  black: 10 issues
    ✅ Formatted 10 files

  prettier: 9 issues
    ✅ Formatted 9 files

⚠️  Manual Fixes Required:
  mypy: 7 type errors (see details above)
  eslint: 5 logic errors (see details above)

📁 Files Modified: 27
⏱️  Duration: 4.1s
```

## Error Handling

**Missing Linters:**
```
⚠️  Some linters not installed:

Python:
  ❌ ruff - Install: pip install ruff
  ✅ black - Available
  ❌ mypy - Install: pip install mypy

JavaScript/TypeScript:
  ✅ eslint - Available
  ✅ prettier - Available
  ❌ tsc - Install: npm install -g typescript

Would you like me to install missing linters? (y/n)
```

**Configuration Issues:**
```
⚠️  Configuration files missing or invalid:

Python:
  ⚠️  No pyproject.toml found - using default ruff config
  ⚠️  No mypy.ini or pyproject.toml [tool.mypy] - using strict mode

JavaScript/TypeScript:
  ✅ .eslintrc.json found
  ⚠️  No .prettierrc found - using defaults

Proceed with default configurations? (y/n)
```

## Performance Optimization

**Parallel Execution:**
- Run all linters concurrently using background processes
- Typical speedup: 3-5x vs sequential

**Incremental Linting:**
```bash
# Only lint changed files (git mode)
/lint --scope="$(git diff --name-only HEAD)"

# Only lint staged files
/lint --scope="$(git diff --cached --name-only)"
```

**Caching:**
- ruff: Native cache support
- mypy: Uses `.mypy_cache/`
- eslint: Uses `.eslintcache`

**Typical Performance:**
- Small project (<100 files): 1-2s
- Medium project (100-500 files): 2-5s
- Large project (500-2000 files): 5-15s

## Integration with System

**TDD Workflow:**
```bash
# Before running tests
/lint --mode=fix
npm test
```

**Pre-commit Hook:**
```bash
# In .git/hooks/pre-commit
/lint --scope="$(git diff --cached --name-only)" --mode=check
```

**CI/CD Integration:**
```yaml
# .github/workflows/lint.yml
- name: Lint codebase
  run: /lint --mode=check
```

**IDE Integration:**
- Configure IDE to use same linters
- Results match local `/lint` output
- Consistent across team

## Related Commands

- `/fix` - Implement fixes with TDD
- `/assess` - Deep code quality analysis
- `/typecheck` - Type checking only (deprecated, use /lint)
- `/format` - Formatting only (deprecated, use /lint --mode=fix)

## 🤖 Execution Instructions for Claude Code

**When user invokes `/lint [options]`:**

1. **Parse command options:**
   ```javascript
   const options = {
     scope: args.scope || '.',
     mode: args.mode || 'check',
     framework: args.framework || null
   };
   ```

2. **Execute the intelligent lint script immediately:**
   ```bash
   # Run the intelligent linting script
   ./.claude/scripts/intelligent-lint.sh "$scope" "$mode"
   ```

3. **Alternative: Manual execution (if script unavailable):**

**Phase 1: Auto-detect project:**
   ```bash
   # Detect languages
   HAS_PYTHON=$(test -f requirements.txt -o -f pyproject.toml && echo "true" || echo "false")
   HAS_JS=$(test -f package.json && echo "true" || echo "false")
   HAS_TS=$(test -f tsconfig.json && echo "true" || echo "false")

   # Detect Python frameworks
   if [ "$HAS_PYTHON" = "true" ]; then
     HAS_DJANGO=$(grep -q "django" requirements.txt pyproject.toml 2>/dev/null && echo "true" || echo "false")
     HAS_FASTAPI=$(grep -q "fastapi" requirements.txt pyproject.toml 2>/dev/null && echo "true" || echo "false")
     HAS_PYDANTIC=$(grep -q "pydantic" requirements.txt pyproject.toml 2>/dev/null && echo "true" || echo "false")
   fi

   # Detect JS/TS frameworks
   if [ "$HAS_JS" = "true" ]; then
     HAS_REACT=$(grep -q "react" package.json && echo "true" || echo "false")
     HAS_NEXTJS=$(grep -q "next" package.json && echo "true" || echo "false")
     HAS_VUE=$(grep -q "vue" package.json && echo "true" || echo "false")
   fi
   ```

4. **Phase 2: Configure linters:**
   - Use existing config files if present
   - Generate temporary configs for detected frameworks if needed
   - Validate linters are installed

5. **Phase 3: Execute linters in parallel:**
   ```bash
   if [ "$mode" = "check" ]; then
     # Check mode
     if [ "$HAS_PYTHON" = "true" ]; then
       ruff check "$scope" 2>&1 | tee /tmp/ruff.log &
       black --check "$scope" 2>&1 | tee /tmp/black.log &
       mypy "$scope" 2>&1 | tee /tmp/mypy.log &
     fi

     if [ "$HAS_JS" = "true" ] || [ "$HAS_TS" = "true" ]; then
       eslint "$scope" 2>&1 | tee /tmp/eslint.log &
       prettier --check "$scope" 2>&1 | tee /tmp/prettier.log &
       [ "$HAS_TS" = "true" ] && tsc --noEmit 2>&1 | tee /tmp/tsc.log &
     fi

     wait
   else
     # Fix mode
     if [ "$HAS_PYTHON" = "true" ]; then
       ruff check --fix "$scope"
       black "$scope"
       mypy "$scope"  # Check only, no fix
     fi

     if [ "$HAS_JS" = "true" ] || [ "$HAS_TS" = "true" ]; then
       eslint --fix "$scope"
       prettier --write "$scope"
       [ "$HAS_TS" = "true" ] && tsc --noEmit  # Check only, no fix
     fi
   fi
   ```

6. **Phase 4: Aggregate results:**
   - Parse linter outputs
   - Categorize by severity
   - Count issues and fixes

7. **Phase 5: Generate and return report:**
   - Show project detection summary
   - Show issues by linter and severity
   - Provide actionable recommendations
   - Show performance metrics

**Critical Rules:**
- ✅ Execute immediately without confirmation
- ✅ Use parallel execution for speed
- ✅ Auto-detect frameworks accurately
- ✅ Provide clear, actionable reports
- ✅ Handle missing linters gracefully
- ❌ Never skip framework detection
- ❌ Never modify code without user seeing report first (in fix mode, show report after)

**Performance Target:**
- Small projects: <2s
- Medium projects: <5s
- Large projects: <15s
