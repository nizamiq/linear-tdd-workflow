# 🪝 Git Hooks Directory - Claude Code Guide

## Purpose

This directory contains Git hooks that enforce code quality standards and TDD practices at the version control level. These hooks act as gatekeepers, ensuring only quality code enters the repository.

## Available Hooks

### TDD Gate Enforcer (`tdd-gate-enforcer.js`)
**Purpose:** Enforces Test-Driven Development cycle
**Triggers:** Pre-commit and pre-push
**Validates:**
- Tests exist for new code
- Tests pass (GREEN phase)
- Coverage meets thresholds (≥80%)
- Mutation testing passes (≥30%)

**Usage:**
```bash
# Manual validation
node .claude/git-hooks/tdd-gate-enforcer.js validate

# With verbose output
node .claude/git-hooks/tdd-gate-enforcer.js --verbose
```

### Install Hooks (`install-hooks.js`)
**Purpose:** Installs Git hooks in the repository
**Features:**
- Symlinks hooks to .git/hooks
- Preserves existing hooks
- Makes hooks executable
- Validates installation

**Usage:**
```bash
# Install all hooks
node .claude/git-hooks/install-hooks.js

# Verify installation
node .claude/git-hooks/install-hooks.js --verify
```

## Hook Enforcement Rules

### Pre-Commit Checks
1. **Test Coverage**
   - Diff coverage ≥80%
   - Overall coverage maintained
   - No coverage regression

2. **Test Existence**
   - New functions have tests
   - Modified functions have updated tests
   - Test files match source files

3. **Code Quality**
   - Linting passes
   - Type checking succeeds
   - No console.logs in production code

### Pre-Push Checks
1. **Full Test Suite**
   - All tests pass
   - Integration tests pass
   - E2E tests pass (if configured)

2. **Mutation Testing**
   - Mutation score ≥30%
   - Critical paths tested
   - No surviving mutants in new code

## TDD Cycle Validation

The enforcer validates proper TDD cycle:

```javascript
// RED Phase - Test must fail first
if (!testExistsBeforeCode()) {
  reject("Write test first (RED phase)");
}

// GREEN Phase - Minimal code to pass
if (!minimalCodeToPass()) {
  reject("Too much code - write minimal implementation");
}

// REFACTOR Phase - Maintain passing tests
if (!testsStillPass()) {
  reject("Tests broken during refactoring");
}
```

## Configuration

### Settings in `.claude/settings.json`
```json
{
  "hooks": {
    "tdd": {
      "enabled": true,
      "strict": true,
      "diffCoverage": 80,
      "mutationScore": 30,
      "blockOnFailure": true
    }
  }
}
```

### Bypass Options (Use Sparingly!)
```bash
# Emergency bypass (logged and reported)
git commit --no-verify -m "EMERGENCY: Description"

# Skip hooks for WIP
git commit --no-verify -m "WIP: Not ready for validation"
```

## Hook Installation

### Automatic Installation
Hooks are installed automatically during:
- `make onboard`
- `npm run setup`
- First commit attempt

### Manual Installation
```bash
# Install hooks
node .claude/git-hooks/install-hooks.js

# Or via npm
npm run hooks:install
```

### Verify Installation
```bash
# Check hooks are installed
ls -la .git/hooks/

# Test hook execution
node .claude/git-hooks/tdd-gate-enforcer.js validate
```

## Error Messages and Solutions

### "No tests found for new code"
**Solution:** Write tests first (RED phase)
```bash
# Create test file
touch tests/feature.test.js
# Write failing test
# Then implement feature
```

### "Coverage below threshold"
**Solution:** Add more test cases
```bash
# Check coverage report
npm test -- --coverage
# Add tests for uncovered lines
```

### "Mutation testing failed"
**Solution:** Improve test quality
```bash
# Run mutation testing
npm run test:mutation
# Add assertions for surviving mutants
```

## Disabling Hooks (Not Recommended)

### Temporarily Disable
```bash
# Set environment variable
SKIP_HOOKS=true git commit -m "Message"
```

### Permanently Disable (Project)
```json
// .claude/settings.json
{
  "hooks": {
    "enabled": false
  }
}
```

## Custom Hooks

To add custom hooks:
1. Create hook file in this directory
2. Add to `install-hooks.js` manifest
3. Implement validation logic
4. Document in this file

## Important Notes

- Hooks run automatically on git operations
- Bypass is logged and reported to Linear
- Hooks are required for CI/CD pipeline
- Repeated bypasses trigger alerts
- Hooks ensure code quality standards

## Quick Reference

| Hook Event | Validation | Threshold |
|------------|------------|-----------|
| pre-commit | Diff coverage | ≥80% |
| pre-commit | Linting | Pass |
| pre-commit | Types | Valid |
| pre-push | All tests | Pass |
| pre-push | Mutation | ≥30% |
| pre-push | Integration | Pass |

## Troubleshooting

### Hooks Not Running
```bash
# Reinstall hooks
node .claude/git-hooks/install-hooks.js --force

# Check permissions
chmod +x .git/hooks/*
```

### Hook Errors
```bash
# Run validation manually
node .claude/git-hooks/tdd-gate-enforcer.js --debug

# Check configuration
cat .claude/settings.json | grep hooks
```