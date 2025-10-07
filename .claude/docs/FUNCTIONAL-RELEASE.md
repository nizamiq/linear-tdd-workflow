# Functional Release Guide

## Overview

A **functional release** ensures that what has been implemented is fully functional and validated through E2E tests, even if the entire product isn't complete. This approach prioritizes shipping working software over shipping comprehensive software.

## Core Principle

> "The project does not have to be fully implemented, but it is critical that what HAS been implemented is functional and passes E2E testing simulating real user stories."

## How It Works

### 1. User Story Registry

The system tracks features in `.claude/user-stories/registry.yaml`:

```yaml
features:
  feature-slug:
    name: 'User-facing feature description'
    status: implemented | partial | planned
    e2e_test: 'path/to/test.js::test-name'
    notes: 'Optional implementation notes'
```

**Status Meanings:**

- **`implemented`**: Feature is built AND has passing E2E test → ✅ Allows release
- **`partial`**: Feature is built but NO E2E test → ❌ **BLOCKS RELEASE**
- **`planned`**: Feature not yet built → ⚪ Doesn't affect release

### 2. E2E Test Metadata

E2E tests link to user stories via `@feature` tags:

```javascript
/**
 * E2E Test: Complete Workflow Validation
 * @feature assess-code-quality
 * @user-story User runs /assess to scan code quality and generate Linear tasks
 */
test('should complete full assessment workflow', async () => {
  // Test implementation
});
```

### 3. Functional Release Gate

An automated validator that runs during releases:

- ✅ Checks all `implemented` features have E2E tests
- ✅ Runs all E2E tests to verify they pass
- ❌ **BLOCKS** release if any failures or missing tests
- ❌ **BLOCKS** release if any `partial` status features exist

## Quick Start

### Check Current Status

```bash
# View coverage report
npm run release:user-stories

# Output:
# ✅ Implemented Features: 2
#    With E2E tests: 2
# ⚠️  Partial Features (block release): 2
# ❌ RELEASE BLOCKED
```

### Validate Release Readiness

```bash
# Run functional gate manually
npm run release:validate-functional

# Or via make
make release-check
```

### Add New Feature to Registry

```bash
# Interactive mode
npm run release:add-story

# Or directly
node .claude/scripts/user-stories/registry-helper.js add \
  --name "User can export data" \
  --status planned
```

### Validate E2E Test Coverage

```bash
# Check all @feature tags match registry
npm run e2e:validate

# Generate coverage report
npm run e2e:report
```

## Release Workflow

### Phase 1: Feature Development

1. Build feature with TDD (RED→GREEN→REFACTOR)
2. Add feature to registry with `status: planned`
3. Merge feature to `develop`

### Phase 2: E2E Test Creation

1. Write E2E test simulating user story
2. Add `@feature feature-slug` tag to test
3. Update registry: `status: implemented`, `e2e_test: "path::name"`
4. Verify test passes: `npm test:e2e`

### Phase 3: Release Attempt

1. Run `/release 1.2.0` or `make release`
2. Gate runs automatically in Phase 2.5
3. **If blocked:** Fix missing E2E tests, re-run
4. **If passed:** Continue to UAT and deployment

## Example: Complete Feature Lifecycle

### Step 1: Add Feature to Registry (Planned)

```yaml
features:
  export-json-data:
    name: 'User can export assessment data as JSON'
    status: planned
    e2e_test: null
    notes: 'Requested in FEATURE-456'
```

### Step 2: Implement Feature with Unit Tests

```bash
# TDD cycle
git checkout -b feature/export-json
# ... implement with RED→GREEN→REFACTOR ...
git push origin feature/export-json
# ... PR review & merge to develop ...
```

### Step 3: Create E2E Test

```javascript
// tests/e2e/export-features.test.js
/**
 * E2E Test: Data Export Functionality
 * @feature export-json-data
 * @user-story User exports assessment results as downloadable JSON file
 */
test('should export assessment data as JSON', async () => {
  // Arrange: Run assessment
  const result = await runAssessment('./sample-code');

  // Act: Export data
  const jsonFile = await exportAsJSON(result);

  // Assert: Valid JSON with expected structure
  expect(jsonFile).toExist();
  const data = JSON.parse(jsonFile);
  expect(data.assessment).toBeDefined();
  expect(data.issues).toBeArray();
});
```

### Step 4: Update Registry (Implemented)

```yaml
features:
  export-json-data:
    name: 'User can export assessment data as JSON'
    status: implemented
    e2e_test: 'tests/e2e/export-features.test.js::should export assessment data as JSON'
    notes: 'Completed in FEATURE-456'
```

### Step 5: Verify and Release

```bash
# Verify E2E test passes
npm run test:e2e

# Check functional readiness
npm run release:validate-functional
# ✅ All 3 implemented features have E2E coverage

# Proceed with release
make release VERSION=1.2.0
```

## Common Scenarios

### Scenario 1: Feature Built, No E2E Test Yet

**Status:** `partial`
**Effect:** ❌ Blocks release
**Fix:** Either:

- Write E2E test and update to `implemented`
- Mark as `planned` if not ready for release

### Scenario 2: E2E Test Fails

**Status:** `implemented` with failing test
**Effect:** ❌ Blocks release
**Fix:** Debug and fix E2E test until it passes

### Scenario 3: Half-Built Feature

**Status:** Should be `planned`
**Effect:** ⚪ Doesn't block release
**Action:** Leave as `planned` until ready for E2E testing

### Scenario 4: All Features Have E2E Tests

**Status:** All `implemented` with passing tests
**Effect:** ✅ Release proceeds
**Action:** Continue with UAT and deployment

## Registry Management

### List All Features

```bash
node .claude/scripts/user-stories/registry-helper.js list

# Output:
# ✅ assess-code-quality (implemented)
# ✅ create-linear-tasks (implemented)
# ⚠️  implement-tdd-fix (partial)
# ⏳ production-release (planned)
```

### Show Coverage Report

```bash
node .claude/scripts/user-stories/registry-helper.js coverage

# Output:
# 📊 User Story Coverage Report
# ✅ Implemented Features: 2
#    With E2E tests: 2
# ⚠️  Partial Features: 1
# 📈 E2E Coverage: 100%
# ✅ READY FOR RELEASE
```

### Add New Feature

```bash
node .claude/scripts/user-stories/registry-helper.js add \
  --name "User can schedule assessments" \
  --status planned \
  --notes "Roadmap Q2 2025"
```

### Validate Registry Format

```bash
node .claude/scripts/user-stories/registry-helper.js validate

# Output:
# ✅ Registry YAML format valid
# ✅ All feature slugs valid (lowercase, kebab-case)
# ✅ All statuses valid (implemented/partial/planned)
```

## E2E Test Parser

### Validate Test Coverage

```bash
node .claude/scripts/testing/e2e-parser.js validate

# Checks:
# - All implemented features have @feature tags in tests
# - All @feature tags match registry entries
# - Registry e2e_test paths are accurate
```

### Generate Coverage Report

```bash
node .claude/scripts/testing/e2e-parser.js report

# Output:
# 📊 E2E Test Coverage Report
# 📝 Total Features: 7
#    Implemented: 2
#    With E2E Tests: 2
# 📈 E2E Coverage: 100%
# 🧪 Test Files Found:
#    - tests/e2e/comprehensive-workflow-e2e.test.js
#    - tests/e2e/linear-integration.test.js
```

### List @feature Tags

```bash
node .claude/scripts/testing/e2e-parser.js list

# Output:
# 📋 Features Found in E2E Tests
# ✅ assess-code-quality
#    → tests/e2e/comprehensive-workflow-e2e.test.js
# ✅ create-linear-tasks
#    → tests/e2e/linear-integration.test.js
```

## Functional Gate Details

### What the Gate Checks

**Phase 1: Partial Feature Detection**

- Scans registry for `status: partial`
- **Blocks immediately** if any found
- Reason: Feature is built but not validated

**Phase 2: Implemented Feature Validation**

- Finds all `status: implemented` features
- Checks each has `e2e_test` specified
- **Blocks** if any missing test paths

**Phase 3: E2E Test Execution**

- Runs full E2E test suite: `npm run test:e2e`
- **Blocks** if any test fails

**Phase 4: Final Report**

- Passes ✅ only if all checks pass
- Provides detailed failure reasons if blocked

### Running the Gate

**Automatic:** Runs during `/release` command in Phase 2.5

```bash
/release 1.2.0
# ... Phase 1: Preparation
# ... Phase 2: Pre-flight checks
# ... Phase 2.5: 🎯 Functional Readiness Gate ← RUNS HERE
# ... Phase 3: UAT (only if gate passes)
```

**Manual:** Run anytime to check status

```bash
npm run release:validate-functional

# Output if blocked:
# ❌ FUNCTIONAL RELEASE GATE: BLOCKED
# ❌ 2 issue(s) blocking release:
#    Feature: implement-tdd-fix
#    Reason: Partial status - implemented but no E2E test
```

**Via Make:** Same as npm script

```bash
make release-check
```

## Integration with Release Journey

The functional gate is integrated into JR-6 (Release Journey):

```javascript
// .claude/journeys/jr6-release.js
async run(options = {}) {
  await this.prepareRelease(options.version);
  await this.runPreflightChecks();
  await this.validateFunctionalReadiness(); // ← Phase 2.5
  await this.prepareUAT();
  await this.obtainApprovals();
  await this.executeDeployment();
  await this.performPostDeployment();
}
```

**If gate fails:**

- Release process halts
- Clear error messages displayed
- Must fix blocking issues before proceeding

## Best Practices

### 1. Add Features to Registry Early

Add features with `status: planned` during sprint planning.

### 2. Update Status Progressively

- `planned` → Feature exists in registry, not built yet
- `partial` → Feature built, needs E2E test (temporary state)
- `implemented` → Feature built AND E2E test passing

### 3. Never Leave Features as `partial`

This status should be transient. If a feature is built, immediately:

- Write E2E test
- Update to `implemented`

### 4. Write E2E Tests from User Perspective

Tests should simulate actual user workflows:

```javascript
// ✅ Good: Simulates user journey
test('user assesses code and creates Linear task', async () => {
  await runCommand('/assess');
  await expectLinearTaskCreated();
});

// ❌ Bad: Tests internal implementation
test('AUDITOR agent executes successfully', async () => {
  const agent = new AUDITOR();
  expect(agent.execute()).toResolve();
});
```

### 5. Link Tests to Features Explicitly

Always add `@feature` tag:

```javascript
/**
 * @feature feature-slug
 * @user-story User-facing description of what this validates
 */
```

### 6. Run Gate Before Creating Release PR

Check readiness before starting release process:

```bash
npm run release:validate-functional
# Only proceed if ✅ PASSED
```

## Troubleshooting

### Problem: Gate blocks with "partial" status

**Solution:** Write E2E test for the feature or mark as `planned` if not ready.

### Problem: E2E test fails during gate

**Solution:** Debug test, fix implementation, or fix test. All E2E tests must pass.

### Problem: Feature not found in registry

**Solution:** Add feature to registry with appropriate status.

### Problem: @feature tag doesn't match registry

**Solution:** Update either the tag or registry to match. Run `npm run e2e:validate`.

### Problem: Registry YAML format invalid

**Solution:** Run `npm run release:user-stories` to see validation errors. Fix YAML syntax.

## Files and Locations

| File                                              | Purpose                              |
| ------------------------------------------------- | ------------------------------------ |
| `.claude/user-stories/registry.yaml`              | Central feature registry             |
| `.claude/scripts/user-stories/registry-helper.js` | CLI tool for registry management     |
| `.claude/scripts/testing/e2e-parser.js`           | E2E test metadata parser             |
| `.claude/scripts/release/functional-gate.js`      | Gate validator (runs during release) |
| `.claude/journeys/jr6-release.js`                 | Release journey (integrates gate)    |
| `tests/e2e/**/*.test.js`                          | E2E test files with @feature tags    |

## Command Reference

| Command                               | Purpose                               |
| ------------------------------------- | ------------------------------------- |
| `npm run release:validate-functional` | Run functional gate manually          |
| `npm run release:user-stories`        | Show coverage report                  |
| `npm run release:add-story`           | Add feature to registry interactively |
| `npm run e2e:validate`                | Validate @feature tags match registry |
| `npm run e2e:report`                  | Generate E2E coverage report          |
| `make release-check`                  | Run functional gate (via Make)        |
| `make release VERSION=x.y.z`          | Full release with gate                |

## Summary

The functional release concept ensures:

1. ✅ Only working, validated features are released
2. ✅ E2E tests prove features work from user perspective
3. ✅ Partial implementations are caught before release
4. ✅ Clear status tracking via registry
5. ✅ Automated enforcement via functional gate

**Result:** Ship confidently knowing every released feature is functional and validated.
