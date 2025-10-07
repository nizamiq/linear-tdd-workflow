---
name: commit
description: Create a new git commit with Conventional Commits format. Stages files, runs pre-commit validation, suggests commit messages, and creates commit after confirmation.
agent: STRATEGIST
usage: '/commit [--staged-only] [--skip-validation]'
parameters:
  - name: staged-only
    description: Use only pre-staged files instead of staging all changes
    type: boolean
    required: false
    default: false
  - name: skip-validation
    description: Skip pre-commit validation checks (not recommended)
    type: boolean
    required: false
    default: false
---

# /commit - Git Commit Task

Create a new git commit following Conventional Commits format with automated validation and intelligent commit message suggestions.

## Overview

This command automates the commit workflow with strict quality gates and commit message standards. It:

- Stages changes (all or pre-staged only)
- Runs pre-commit validation (lint, format, tests)
- Suggests commit messages following Conventional Commits
- Creates commit only after explicit confirmation
- Optionally pushes to remote

## Usage

### Standard Usage (stages all changes)

```
/commit
```

This will:

1. Check repository status
2. Show all unstaged files
3. Stage all changes with `git add -A`
4. Run pre-commit validation
5. Suggest 5+ commit messages
6. Create commit after confirmation

### Selective Staging Usage

```
# Stage files manually first
git add src/specific-file.ts tests/specific-test.spec.ts

# Then use command with --staged-only flag
/commit --staged-only
```

This will skip the `git add -A` step and use only your pre-staged files.

### Skip Validation (Not Recommended)

```
/commit --skip-validation
```

**Warning**: This bypasses all pre-commit checks. Only use for emergency commits or when checks are broken.

## Commit Message Format

### Conventional Commits Structure

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Supported Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring (no feature change)
- `test`: Adding or updating tests
- `chore`: Build process, auxiliary tools, dependencies
- `perf`: Performance improvements
- `ci`: CI/CD configuration changes
- `build`: Build system changes
- `revert`: Revert previous commit

### Scope Detection Rules

The scope is automatically determined from changed files:

#### Project-Specific Scopes

- **`.claude/**`** → `[claude]` - Claude system files
- **`scripts/**`** → `[scripts]` - Build/utility scripts
- **`tests/**`** → `[test]` - Test files
- **`.github/**`** → `[ci]` - GitHub Actions/CI
- **`docs/**`** → `[docs]` - Documentation
- **`.claude/agents/**`** → `[agents]` - Agent definitions
- **`.claude/commands/**`** → `[commands]` - Slash commands
- **`.claude/workflows/**`** → `[workflows]` - Workflow definitions

#### Configuration File Scopes

- **`package.json`** → `[deps]` - Dependencies
- **`tsconfig.json`** → `[typescript]` - TypeScript config
- **`.eslintrc.*`** → `[eslint]` - ESLint config
- **`.prettierrc.*`** → `[prettier]` - Prettier config
- **`jest.config.*`** → `[test]` - Jest config
- **`.github/workflows/**`** → `[ci]` - CI/CD workflows
- **`Dockerfile`** → `[docker]` - Docker config
- **`.gitignore`, `.gitattributes`** → `[git]` - Git config

#### Multi-Scope Logic

- If 80%+ changes in one scope → use that scope
- If changes span multiple scopes → use `[multi]` or most dominant scope
- For related changes (e.g., agent + tests) → use primary scope

### Commit Message Examples

#### Feature Addition

```
feat(agents): add CODE-REVIEWER agent with security analysis
feat(commands): add /commit slash command for automated commits
feat(workflows): implement TDD workflow engine
```

#### Bug Fixes

```
fix(scripts): resolve TypeScript compilation errors in validator
fix(agents): correct Linear API integration in STRATEGIST
fix(ci): update GitHub Actions workflow for Node 18
```

#### Documentation

```
docs: update README with new /commit command
docs(agents): add comprehensive DOC-KEEPER documentation
docs: fix broken links in integration guide
```

#### Refactoring

```
refactor(agents): simplify EXECUTOR workflow logic
refactor(scripts): extract common validation utilities
refactor: convert remaining agents to YAML frontmatter
```

#### Tests

```
test(agents): add unit tests for AUDITOR assessment logic
test: increase coverage for Linear integration
test(e2e): add workflow execution validation tests
```

#### Chores

```
chore(deps): update @linear/sdk to v28.0.0
chore: update .gitignore for new temp directories
chore(build): optimize TypeScript compilation
```

## Workflow Steps

### 1. Check Repository Status

```bash
git status
```

- Abort if no changes (staged or unstaged)
- Display current branch and status

### 2. Show Unstaged Changes

Display all files that will be staged:

```
The following files will be staged:
  M  src/agents/executor.ts (modified)
  M  tests/agents/executor.spec.ts (modified)
  A  .claude/commands/commit.md (new file)
  ?? temp/draft.md (untracked)
```

### 3. Confirm Staging

Prompt: **"Stage all these files? (yes/no)"**

- If `no` → abort with message
- If `yes` → proceed to staging

### 4. Stage All Changes

```bash
git add -A
```

- Stage all modified, deleted, and untracked files
- Respect `.gitignore` rules
- Show what was staged

### 5. Safety Checks

#### Sensitive Files Warning

Check for potentially sensitive files:

- `.env`, `.env.*` (except `.env.example`)
- `*.key`, `*.pem`, `*.p12`
- `secrets.*`, `credentials.*`
- `**/config/production.*`

**Warning**: "⚠️ Sensitive file detected: .env - Are you sure you want to commit this?"

#### Large Changeset Warning

If >20 files staged:
**Warning**: "⚠️ Large changeset (25 files) - Consider breaking into smaller commits"

#### Untracked Files Highlight

Highlight new files being added:

```
New files being added:
  + .claude/commands/commit.md
  + scripts/commit-validator.js
```

### 6. Pre-commit Validation

Run automated checks (unless `--skip-validation`):

#### TypeScript/JavaScript Validation

```bash
npm run precommit
```

This runs:

- ESLint with auto-fix disabled
- Prettier format check
- Jest unit tests
- TypeScript type checking (if applicable)

**Expected Checks**:

- ✓ ESLint: All files pass linting rules
- ✓ Prettier: All files properly formatted
- ✓ Jest: Unit tests pass (≥80% coverage)
- ✓ TypeScript: No type errors

#### Validation Failure Handling

If ANY check fails:

```
❌ Pre-commit validation failed!

ESLint errors:
  src/agents/executor.ts:45:12 - Unexpected console.log statement

Fix issues and run /commit again.
COMMIT ABORTED
```

**Action**: Abort immediately, display detailed errors, do NOT proceed

#### Validation Success

```
✅ All pre-commit checks passed
```

### 7. Display Staged Files

Show clear list of what will be committed:

```
Files staged for commit:
  modified:   .claude/agents/strategist.md
  modified:   .claude/commands/index.md
  new file:   .claude/commands/commit.md
  modified:   CLAUDE.md
  modified:   README.md
```

### 8. Analyze Git History

```bash
git log -n 50 --oneline
```

Review recent commits for:

- Common commit message patterns
- Preferred scope naming
- Description style (verb tense, capitalization)

### 9. Suggest Commit Messages

Generate 5+ message options based on:

- Changed files → determine scope
- Nature of changes → determine type
- Git history → match style patterns

**Format all suggestions in a numbered list**:

```
Suggested commit messages:

1. feat(commands): add /commit command for automated git workflows
2. feat(commands): implement automated commit creation with validation
3. feat(commands): add git commit automation with Conventional Commits
4. feat(commands): create /commit slash command with pre-commit checks
5. feat(commands): implement intelligent commit message generation
6. feat(commands): add comprehensive git commit workflow automation

Choose a number (1-6) or provide your own message:
```

**Rules for Suggestions**:

- All use same scope (consistent across options)
- All use same type (based on change analysis)
- Description varies in wording/emphasis
- Start description with lowercase letter
- Be concise and specific
- Follow Conventional Commits format exactly

### 10. Wait for User Confirmation

**User options**:

- Choose a number: `2`
- Modify message: `feat(commands): add commit automation with TDD validation`
- Provide completely custom: `fix(agents): resolve Linear sync timing issue`

**Do NOT proceed** without explicit confirmation.

### 11. Create Commit

Only after user confirms:

```bash
git commit -m "feat(commands): implement automated commit creation with validation"
```

Display result:

```
✅ Commit created successfully
[main abc1234] feat(commands): implement automated commit creation with validation
 5 files changed, 847 insertions(+), 12 deletions(-)
 create mode 100644 .claude/commands/commit.md
```

### 12. Optional Push

If user requests push:

```bash
git push
```

**User can say**: "you can push" or "push to remote"
**Do NOT push** without explicit request.

## Pre-commit Checks Detail

### TypeScript/JavaScript Quality

**Trigger**: Any `.ts`, `.tsx`, `.js`, `.jsx` file modified

**Checks**:

1. **ESLint**: `npm run lint:check`
   - Verify code style compliance
   - Check for common errors
   - Ensure no disabled tests
   - Max complexity: 10
   - Max function params: 4

2. **Prettier**: `npm run format:check`
   - Verify consistent formatting
   - Check all JS/TS/JSON/MD files

3. **TypeScript**: `npm run typecheck`
   - Verify type correctness
   - No implicit any
   - Strict mode compliance

4. **Jest Unit Tests**: `npm run test:unit`
   - All unit tests must pass
   - Coverage ≥80% (lines, branches, functions, statements)

**On Failure**: Abort commit, display specific errors

### Test Coverage Validation

**Trigger**: Source code files modified

**Checks**:

- Run `npm run test:unit`
- Verify coverage thresholds:
  - Branches: ≥80%
  - Functions: ≥80%
  - Lines: ≥80%
  - Statements: ≥80%

**On Failure**:

```
❌ Test coverage below threshold

Coverage summary:
  Lines      : 75.3% (target: 80%)
  Branches   : 78.1% (target: 80%)
  Functions  : 82.5% (target: 80%)
  Statements : 75.3% (target: 80%)

Add tests to increase coverage.
COMMIT ABORTED
```

### Format Validation

**Trigger**: Any file that Prettier can format

**Checks**:

- Run `npm run format:check`
- Verify all files match Prettier rules

**On Failure**:

```
❌ Code formatting issues detected

.claude/commands/commit.md
src/agents/strategist.ts

Run 'npm run format' to fix automatically.
COMMIT ABORTED
```

**Suggestion**: "Run `npm run format` to fix automatically, then retry commit"

### Linting Validation

**Trigger**: Any `.ts`, `.tsx`, `.js`, `.jsx` file

**Checks**:

- Run `npm run lint:check`
- Verify ESLint rules compliance
- No console.log (except console.warn/error)
- Proper error handling
- No unused variables

**On Failure**:

```
❌ ESLint errors detected

src/agents/executor.ts
  45:12  error  Unexpected console.log statement  no-console
  67:8   error  'unused' is assigned but never used  @typescript-eslint/no-unused-vars

Fix errors and retry commit.
COMMIT ABORTED
```

## Safety Features

### Sensitive Files Detection

Check for common sensitive file patterns:

- `.env` (except `.env.example`)
- `*.key`, `*.pem`, `*.cert`
- `credentials.*`, `secrets.*`
- `*password*`, `*secret*`, `*token*`
- `id_rsa`, `id_dsa`, `*.ppk`

**Action**: Warn user, require explicit confirmation

### Large Changeset Warning

If >20 files staged:

```
⚠️ Large changeset detected (37 files)

Consider breaking into smaller, focused commits for easier review.

Proceed anyway? (yes/no):
```

### Binary Files Warning

If binary files detected (images, PDFs, etc.):

```
⚠️ Binary files detected:
  docs/architecture-diagram.png (245KB)
  assets/logo.svg (12KB)

Are these intentional additions? (yes/no):
```

### Ignored Files Check

Verify no ignored files are accidentally staged:

```bash
git ls-files --ignored --exclude-standard
```

If found:

```
⚠️ Warning: Some ignored files may be staged
Check .gitignore configuration
```

### Branch Protection Check

If on `main` or `develop`:

```
⚠️ You are committing directly to 'main'

This project uses GitFlow. Consider:
1. Create feature branch: git flow feature start <name>
2. Commit to feature branch
3. Merge via PR after review

Proceed anyway? (yes/no):
```

## Error Handling

### No Changes to Commit

```
❌ No changes to commit. Aborting.

Working tree is clean.
```

### Staging Failed

```
❌ Failed to stage files

Error: pathspec 'nonexistent.ts' did not match any files
```

### Pre-commit Checks Failed

```
❌ Pre-commit validation failed

Fix the following issues:
  - ESLint errors in 3 files
  - TypeScript compilation errors
  - 2 failing unit tests

COMMIT ABORTED
```

### Commit Creation Failed

```
❌ Commit failed

Error: gpg failed to sign the data
fatal: failed to write commit object

Check your git configuration.
```

## Integration with Project

### package.json Scripts Used

- `npm run precommit` - Runs lint, format check, unit tests
- `npm run lint:check` - ESLint validation
- `npm run format:check` - Prettier validation
- `npm run typecheck` - TypeScript validation
- `npm run test:unit` - Jest unit tests with coverage

### Git Configuration Respected

- `.gitignore` - File exclusions
- `.git/config` - User name, email, signing config
- Git hooks (if configured)

### Project Standards Enforced

- Conventional Commits format
- 80% code coverage minimum
- ESLint rules compliance
- TypeScript strict mode
- Prettier formatting

## Examples

### Example 1: Standard Commit Flow

```
User: /commit
```
