# Workflow Execution Guide

This guide explains how to run deterministic workflows using the **Workflow Engine** - a lightweight, fast, and cost-effective alternative to agents for algorithmic tasks.

## Quick Start

```bash
# List all available workflows
scripts/claude-workflow list

# Describe a specific workflow
scripts/claude-workflow describe lint-and-format

# Run a workflow
scripts/claude-workflow run lint-and-format --param file_paths="src/**/*.py"

# Validate a workflow file
scripts/claude-workflow validate .claude/workflows/tdd-cycle.yaml
```

## Installation

### Requirements

```bash
# Python 3.8+ required
python3 --version

# Install dependencies
pip install PyYAML

# Or use requirements file
pip install -r requirements.txt
```

### Make CLI Accessible Globally (Optional)

```bash
# Add to your PATH (in ~/.bashrc or ~/.zshrc)
export PATH="$PATH:/path/to/linear-tdd-workflow/scripts"

# Then use directly
claude-workflow list
```

## Available Workflows

### 1. TDD Cycle (`tdd-cycle`)

**Purpose**: Enforce strict RED→GREEN→REFACTOR TDD cycle
**SLA**: 5 minutes
**Cost**: Minimal (no LLM overhead)

**Usage**:

```bash
scripts/claude-workflow run tdd-cycle \
  --param test_file_path="tests/test_calculator.py" \
  --param implementation_file_path="src/calculator.py" \
  --param coverage_target=80 \
  --verbose
```

**What it does**:

1. **RED Phase**: Write failing test (max 2 attempts)
2. **GREEN Phase**: Minimal code to pass (max 3 attempts)
3. **REFACTOR Phase**: Improve design (max 2 attempts)
4. Validates coverage ≥80%
5. Runs linting

**Escalation**: Auto-escalates to EXECUTOR agent if phases fail

---

### 2. Lint and Format (`lint-and-format`)

**Purpose**: Deterministic code linting and auto-formatting
**SLA**: 1 minute
**Cost**: 75% cheaper than LINTER agent

**Usage**:

```bash
# Format Python files
scripts/claude-workflow run lint-and-format \
  --param file_paths="src/**/*.py" \
  --param auto_fix=true

# Format JS/TS files
scripts/claude-workflow run lint-and-format \
  --param file_paths="src/**/*.{ts,tsx,js,jsx}" \
  --param auto_fix=true

# Check only (no fixes)
scripts/claude-workflow run lint-and-format \
  --param file_paths="src/" \
  --param auto_fix=false
```

**Tools used**:

- Python: `ruff format`, `ruff check`
- JavaScript/TypeScript: `prettier`, `eslint`

---

### 3. Type Check (`type-check`)

**Purpose**: Fast, incremental type checking
**SLA**: 2 minutes
**Cost**: 80% cheaper than TYPECHECKER agent

**Usage**:

```bash
# Incremental check (changed files only)
scripts/claude-workflow run type-check \
  --param changed_files="src/api/auth.py,src/utils/validator.py"

# Full check
scripts/claude-workflow run type-check \
  --param full_check=true

# TypeScript files
scripts/claude-workflow run type-check \
  --param changed_files="src/components/*.tsx"
```

**Tools used**:

- Python: `mypy`
- TypeScript: `tsc --noEmit`

**Escalation**: Escalates to TYPESCRIPT-PRO or PYTHON-PRO if >10 errors found

---

### 4. PR Review Checklist (`pr-review-checklist`)

**Purpose**: Automated PR readiness validation
**SLA**: 5 minutes
**Cost**: 70% cheaper than VALIDATOR agent

**Usage**:

```bash
scripts/claude-workflow run pr-review-checklist \
  --param pr_number=123 \
  --param base_branch=develop \
  --param head_branch=feature/auth-improvement

# With coverage enforcement
scripts/claude-workflow run pr-review-checklist \
  --param pr_number=456 \
  --param enforce_coverage=true \
  --param require_tests=true
```

**Validates**:

- ✅ Tests pass
- ✅ Coverage ≥80%
- ✅ Linting passes
- ✅ Type checking passes
- ✅ Conventional commits
- ✅ No merge conflicts
- ✅ No security vulnerabilities
- ✅ PR description complete

---

### 5. Deployment Gates (`deployment-gates`)

**Purpose**: Pre-deployment validation and safety checks
**SLA**: 10 minutes
**Cost**: Minimal

**Usage**:

```bash
# Staging deployment
scripts/claude-workflow run deployment-gates \
  --param environment=staging \
  --param commit_sha=$GITHUB_SHA \
  --param deployment_type=release

# Production deployment
scripts/claude-workflow run deployment-gates \
  --param environment=production \
  --param commit_sha=$GITHUB_SHA \
  --param deployment_type=release

# Emergency override (requires approval)
scripts/claude-workflow run deployment-gates \
  --param environment=production \
  --param force_deploy=true
```

**Validates**:

- **Pre-flight**: CI status, branch protection, coverage
- **Security**: Vulnerability scan, secret scan, dependencies
- **Performance**: Smoke tests, migration dry-run
- **Operational**: Rollback plan, monitoring, backups

**Go/No-Go Decision**:

- ✅ All critical gates pass → Proceed
- ❌ Any critical gate fails → Block
- ⚠️ High warnings → Manual approval required

---

### 6. Fix Pack Generation (`fix-pack-generation`)

**Purpose**: Generate atomic fix packs from assessment findings
**SLA**: 5 minutes
**Cost**: Minimal

**Usage**:

```bash
scripts/claude-workflow run fix-pack-generation \
  --param assessment_report_path=".claude/reports/assessment-2025-01-30.json" \
  --param linear_team_id=$LINEAR_TEAM_ID \
  --param max_fix_packs=10 \
  --param priority_filter=critical,high
```

**Process**:

1. Load assessment JSON
2. Filter FIL-0/1 issues only
3. Group related issues (<300 LOC)
4. Generate fix pack specs
5. Create Linear tasks automatically

---

## CLI Commands

### `run` - Execute a Workflow

```bash
scripts/claude-workflow run <workflow-name> [options]

Options:
  --param key=value        Parameter (can be used multiple times)
  --workflow-dir PATH      Workflow directory (default: .claude/workflows)
  --verbose, -v            Verbose output
  --json                   Output results as JSON
```

**Examples**:

```bash
# Basic run
scripts/claude-workflow run test-simple --param message="Hello World"

# Multiple parameters
scripts/claude-workflow run tdd-cycle \
  --param test_file="tests/test.py" \
  --param impl_file="src/main.py" \
  --param coverage=85

# Verbose output
scripts/claude-workflow run lint-and-format \
  --param file_paths="src/" \
  --verbose

# JSON output (for CI/CD)
scripts/claude-workflow run type-check \
  --param changed_files="src/api/" \
  --json
```

### `list` - List All Workflows

```bash
scripts/claude-workflow list [options]

Options:
  --workflow-dir PATH      Workflow directory (default: .claude/workflows)
```

**Output**:

```
📋 Available Workflows (6)
============================================================

  lint-and-format
  Deterministic code linting and formatting workflow
  SLA: 60s (1.0 min)

  type-check
  Fast, targeted type checking workflow for changed files
  SLA: 120s (2.0 min)
  ...
```

### `describe` - Describe a Workflow

```bash
scripts/claude-workflow describe <workflow-name> [options]

Options:
  --workflow-dir PATH      Workflow directory (default: .claude/workflows)
```

**Output**:

```
============================================================
Workflow: lint-and-format
============================================================

Description:
  Deterministic code linting and formatting workflow

Type: workflow
Version: 1.0.0

Metadata:
  Owner: LINTER
  Cost Profile: minimal
  Deterministic: True
  SLA: 60s

Inputs:
  Required: file_paths
  Optional: auto_fix, fail_on_error, format_only
  ...
```

### `validate` - Validate a Workflow

```bash
scripts/claude-workflow validate <workflow-file>
```

**Output**:

```
Validating: .claude/workflows/lint-and-format.yaml
Workflow: lint-and-format

✅ Validation Passed

Warnings (1):
  • Consider adding error handling for network failures
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Lint and Format

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install PyYAML

      - name: Run Lint Workflow
        run: |
          scripts/claude-workflow run lint-and-format \
            --param file_paths="src/**/*.py" \
            --param auto_fix=false \
            --param fail_on_error=true \
            --json
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run lint workflow before commit
scripts/claude-workflow run lint-and-format \
  --param file_paths="$(git diff --cached --name-only --diff-filter=ACM | grep '\\.py$' | tr '\n' ',')" \
  --param auto_fix=true

if [ $? -ne 0 ]; then
  echo "❌ Lint check failed. Please fix the issues and try again."
  exit 1
fi

# Run type check
scripts/claude-workflow run type-check \
  --param changed_files="$(git diff --cached --name-only --diff-filter=ACM | grep '\\.py$' | tr '\n' ',')"

if [ $? -ne 0 ]; then
  echo "❌ Type check failed. Please fix the issues and try again."
  exit 1
fi

echo "✅ Pre-commit checks passed"
```

### Pre-push Hook

```bash
#!/bin/bash
# .git/hooks/pre-push

# Run full test suite workflow
scripts/claude-workflow run pr-review-checklist \
  --param pr_number=$(git rev-parse --abbrev-ref HEAD | sed 's/.*\///' | grep -o '[0-9]*') \
  --param base_branch=$(git rev-parse --abbrev-ref HEAD@{upstream} | cut -d'/' -f2) \
  --param head_branch=$(git rev-parse --abbrev-ref HEAD)

if [ $? -ne 0 ]; then
  echo "❌ PR readiness checks failed"
  exit 1
fi
```

---

## Workflow vs Agent Decision

| Task                    | Use Workflow | Use Agent        | Reason                     |
| ----------------------- | ------------ | ---------------- | -------------------------- |
| Lint/format files       | ✅           | ❌               | Deterministic, 75% cheaper |
| Type check              | ✅           | ❌               | Deterministic, 80% cheaper |
| Run tests               | ✅           | ❌               | Deterministic, fast        |
| TDD cycle enforcement   | ✅           | ❌               | Clear phases, retry logic  |
| PR validation checklist | ✅           | ❌               | Objective criteria         |
| Code assessment         | ❌           | ✅ AUDITOR       | Complex analysis required  |
| Fix implementation      | ❌           | ✅ EXECUTOR      | Requires reasoning         |
| Architectural review    | ❌           | ✅ CODE-REVIEWER | Subjective judgment        |

**Rule of Thumb**: If the task is **algorithmic** with clear steps and validation → Use Workflow. If it requires **reasoning** or **creativity** → Use Agent.

---

## Performance & Cost

### Speed Comparison

| Task          | Agent Time | Workflow Time | Speedup        |
| ------------- | ---------- | ------------- | -------------- |
| Lint & Format | 60s        | 6s            | **10x faster** |
| Type Check    | 45s        | 4s            | **11x faster** |
| Run Tests     | 30s        | 3s            | **10x faster** |
| TDD Cycle     | 180s       | 20s           | **9x faster**  |

### Cost Comparison

| Task          | Agent Cost | Workflow Cost | Savings |
| ------------- | ---------- | ------------- | ------- |
| Lint & Format | $0.10      | $0.025        | **75%** |
| Type Check    | $0.08      | $0.016        | **80%** |
| Run Tests     | $0.05      | $0.01         | **80%** |
| TDD Cycle     | $0.30      | $0.09         | **70%** |

**Total Projected Savings**: **~60% cost reduction** on deterministic tasks

---

## Troubleshooting

### Workflow Not Found

```bash
Error: Workflow not found: .claude/workflows/my-workflow.yaml
```

**Solution**: Check workflow name (without `.yaml`) and ensure file exists:

```bash
ls .claude/workflows/
scripts/claude-workflow list
```

### Missing Required Parameter

```bash
Error: Missing required parameter: test_file_path
```

**Solution**: Check required parameters:

```bash
scripts/claude-workflow describe tdd-cycle
# Look for "Inputs: Required:" section

# Then provide all required parameters
scripts/claude-workflow run tdd-cycle \
  --param test_file_path="tests/test.py" \
  --param implementation_file_path="src/main.py"
```

### Tool Execution Failed

```bash
❌ Step failed: run_linter - Command 'ruff check' failed
```

**Solution**: Check tool is installed:

```bash
# For Python workflows
pip install ruff mypy pytest

# For JS/TS workflows
npm install -g prettier eslint typescript
```

### Permission Denied

```bash
bash: scripts/claude-workflow: Permission denied
```

**Solution**: Make script executable:

```bash
chmod +x scripts/claude-workflow
```

### PyYAML Not Found

```bash
Error: PyYAML is required. Install with: pip install PyYAML
```

**Solution**: Install PyYAML:

```bash
pip install PyYAML
# Or install all requirements
pip install -r requirements.txt
```

---

## Creating Custom Workflows

### Basic Template

```yaml
---
name: my-custom-workflow
description: Brief description of what this workflow does
version: 1.0.0
type: workflow

metadata:
  owner: AGENT_NAME
  cost_profile: minimal
  deterministic: true
  sla_seconds: 300

inputs:
  required:
    - param1
  optional:
    - param2

steps:
  - name: step1
    action: do_something
    tool: Bash
    params:
      command: "echo 'Step 1: {{ param1 }}'"
    validation:
      - exit_code_equals_0

  - name: step2
    action: do_something_else
    tool: Bash
    params:
      command: "echo 'Step 2 complete'"

outputs:
  - step1_result
  - step2_result

success_criteria:
  all_of:
    - all_steps_completed
    - no_errors
```

### Testing Your Workflow

```bash
# 1. Validate structure
scripts/claude-workflow validate .claude/workflows/my-custom-workflow.yaml

# 2. Test execution
scripts/claude-workflow run my-custom-workflow \
  --param param1="test value" \
  --verbose

# 3. Check output
echo "Success!"
```

---

## Best Practices

1. **Use Workflows for Deterministic Tasks**
   - Clear inputs and outputs
   - Repeatable results
   - No reasoning required

2. **Set Appropriate SLAs**
   - Simple tasks: <60s
   - Medium tasks: 60-300s
   - Complex tasks: 300-600s

3. **Add Validation**
   - Check exit codes
   - Validate outputs
   - Verify no syntax errors

4. **Include Retry Logic**
   - Set max_attempts for flaky operations
   - Add conditional execution
   - Implement escalation

5. **Verbose Logging in Development**
   - Use `--verbose` flag during development
   - Remove for production CI/CD
   - Use `--json` for programmatic parsing

6. **Test Locally Before CI/CD**
   - Run workflows on your machine first
   - Validate all parameters work
   - Check execution time and output

---

## Next Steps

- **Integrate with hooks**: See `.claude/hooks.json` for automatic workflow triggers
- **Add to CI/CD**: Use GitHub Actions examples above
- **Create custom workflows**: Follow template and best practices
- **Monitor performance**: Track execution times and optimize
- **Expand coverage**: Convert more agent tasks to workflows

For questions or issues, see the main repository documentation or open an issue.
