# Migration Guide: Subprocess Execution Patterns

**Version:** 1.4.0
**Date:** 2025-10-06
**Target Audience:** Agent developers, command creators, workflow engineers

---

## Purpose

This guide helps you migrate existing agents and commands to use the correct subprocess execution patterns introduced in v1.4.0 to prevent the subprocess isolation bug.

**What Changed:** Agents must now explicitly document their execution patterns and verify state changes persist.

---

## Quick Migration Checklist

For each command/agent you're migrating:

- [ ] Determine if agent makes state changes (files, git, PRs, Linear)
- [ ] Choose execution pattern (Direct, Orchestrator-Workers, or Validation-Then-Action)
- [ ] Add YAML frontmatter with `execution_mode` and `subprocess_usage`
- [ ] Add subprocess warning section to documentation
- [ ] Add ground truth verification (if state-changing)
- [ ] Test with actual invocation
- [ ] Verify operations persist

---

## Step-by-Step Migration

### Step 1: Analyze Your Agent/Command

**Questions to Ask:**

1. Does it write files?
2. Does it create git commits or branches?
3. Does it create PRs?
4. Does it create/update Linear tasks?
5. Does it modify any persistent state?

**Decision:**

- **Any YES** → Use Direct Execution pattern
- **All NO** → Use Orchestrator-Workers (if parallel analysis) or Direct (if simple)

---

### Step 2: Add YAML Frontmatter

#### Example for State-Changing Command (`/fix`)

```yaml
---
name: fix
agent: EXECUTOR
execution_mode: DIRECT # ⚠️ CRITICAL: Runs in main context
subprocess_usage: NONE # No subprocesses for state changes
usage: '/fix <TASK-ID> [--branch=<branch-name>]'
parameters:
  - name: TASK-ID
    description: The Linear task ID
    type: string
    required: true
---
```

#### Example for Read-Only Command (`/status`)

```yaml
---
name: status
agent: STRATEGIST
execution_mode: ORCHESTRATOR # May spawn parallel workers
subprocess_usage: READ_ONLY_ANALYSIS # Subprocesses fetch data
usage: '/status [--detailed]'
parameters:
  - name: detailed
    description: Include detailed metrics
    type: boolean
    required: false
---
```

#### Example for Hybrid Command (`/release`)

```yaml
---
name: release
agent: STRATEGIST
execution_mode: DIRECT # Must run in main context
subprocess_usage: VALIDATION_THEN_ACTION # Read-only validation, then action
usage: '/release <version>'
parameters:
  - name: version
    description: Version number
    type: string
    required: true
---
```

---

### Step 3: Add Subprocess Warning Section

#### For Direct Execution (State-Changing)

```markdown
## ⚠️ IMPORTANT: Direct Execution Required

This command performs **STATE-CHANGING operations** and must run in main context:

- **Analysis phase** may use subprocesses (read-only analysis)
- **Action phase** MUST run in main context (creates files/commits/PRs)
- **NO subprocess writes** - all state changes in main context

**Action phase operations (MUST be in main context):**

- ⚠️ Creating files
- ⚠️ Making git commits
- ⚠️ Creating PRs
- ⚠️ Creating/updating Linear tasks

**Architecture:**
```

Main Context (AGENT)
└─> Main Context: Execute actions (files, git, PRs, Linear)

```

**Rule:** ALL state-changing operations must execute in main context.
```

#### For Orchestrator-Workers (Read-Only)

```markdown
## ⚠️ IMPORTANT: Read-Only Analysis Pattern

This command performs **READ-ONLY operations** using parallel workers:

- **Main agent** orchestrates workflow and displays results
- **Worker subprocesses** fetch data and calculate metrics in parallel
- **NO writes** - purely analytical command

**Safe subprocess operations (READ-ONLY):**

- ✅ Querying APIs
- ✅ Reading files
- ✅ Calculating metrics
- ✅ Generating reports

**Must happen in main context:**

- ⚠️ Displaying results (if file output)
- ⚠️ Storing data (if caching)

**Rule:** Subprocesses return DATA, main context displays/stores results.
```

#### For Validation-Then-Action (Hybrid)

```markdown
## ⚠️ IMPORTANT: Validation-Then-Action Pattern

This command uses a **two-phase approach**:

- **Phase 1 (Validation)**: Subprocess checks prerequisites (read-only)
- **Phase 2 (Action)**: Main context performs state changes

**Validation phase (safe for subprocess):**

- ✅ Running tests
- ✅ Checking coverage
- ✅ Validating configuration
- ✅ Querying APIs

**Action phase (MUST be in main context):**

- ⚠️ Creating branches
- ⚠️ Writing files
- ⚠️ Making commits
- ⚠️ Creating PRs

**Architecture:**
```

Main Context (AGENT)
├─> Subprocess: Validate prerequisites → Return validation results
└─> Main Context: Execute actions using validation results

```

**Rule:** Validation can be delegated, ACTIONS must be in main context.
```

---

### Step 4: Add Ground Truth Verification (State-Changing Commands Only)

**Template:**

````markdown
## Ground Truth Verification (Mandatory)

After completing [operation], [AGENT] **MUST** verify using actual tool calls:

### Required Verification Steps:

1. **Verify [Thing 1]:**
   ```bash
   [actual verification command]
   ```
````

Expected: [specific output]

2. **Verify [Thing 2]:**

   ```bash
   [actual verification command]
   ```

   Expected: [specific output]

3. **Verify [Thing 3]:**
   ```bash
   [actual verification command]
   ```
   Expected: [specific output]

### If ANY Verification Fails:

```markdown
❌ GROUND TRUTH VERIFICATION FAILED

Expected: [what should have happened]
Actual: [what tool output shows]

[OPERATION] INCOMPLETE - DO NOT REPORT SUCCESS
[Instructions for user]
```

**Rule:** NEVER report success without verified evidence.

````

**Example Verification Commands:**

| What to Verify | Command | Expected Output |
|----------------|---------|-----------------|
| Git branch created | `git branch --list feature/*` | Branch name visible |
| Git commit made | `git log --oneline -5` | Commit visible in log |
| PR created | `gh pr list --state open` | PR number and URL |
| Linear task created | `mcp__linear__search_issues "identifier:TASK-ID"` | Task visible |
| File created | `ls -la path/to/file` | File exists with content |
| Tests passing | `npm test` | Exit code 0 |
| Coverage met | `npm run coverage:check` | Coverage ≥ threshold |

---

### Step 5: Test Your Migration

#### Manual Testing Checklist

**For State-Changing Commands:**
- [ ] Run command with actual parameters
- [ ] Wait for completion
- [ ] Execute all ground truth verification commands
- [ ] Verify each verification passes
- [ ] Check actual workspace for changes (git log, gh pr list, file system)
- [ ] Ensure no "imaginary" results reported

**For Read-Only Commands:**
- [ ] Run command with various parameters
- [ ] Verify output is correct
- [ ] Confirm no unintended state changes (git status clean, no new files)
- [ ] Test parallel execution (if applicable)

**For Hybrid Commands:**
- [ ] Test validation phase independently
- [ ] Test action phase after validation
- [ ] Verify validation results passed to action phase
- [ ] Execute ground truth verification for actions

---

### Step 6: Update Agent Behavior

If your agent is invoked via subprocess (Task tool), it must detect this and change behavior:

**Add to Agent Documentation:**

```markdown
## ⚠️ Subprocess Detection Protocol

**If invoked via Task tool (subprocess):**

1. **IMMEDIATELY DETECT** subprocess execution
2. **DO NOT perform state-changing operations**
3. **Instead, return detailed implementation plan:**
   - All file paths and exact content
   - All git commands to run
   - All PR details
   - All Linear API calls
4. **EXPLICITLY WARN** user that you cannot persist changes

**Implementation Plan Format:**
```json
{
  "subprocess_mode": true,
  "warning": "Cannot persist changes - running as subprocess",
  "implementation_plan": {
    "files_to_write": [
      {"path": "src/foo.ts", "content": "..."}
    ],
    "git_commands": [
      "git checkout -b feature/TASK-123",
      "git add src/foo.ts",
      "git commit -m \"fix: ...\"",
      "gh pr create --title \"...\""
    ],
    "linear_updates": [
      {"task": "TASK-123", "status": "in_progress"}
    ]
  }
}
````

````

---

## Migration Examples

### Example 1: Custom Assessment Command

**Before (No Subprocess Awareness):**

```yaml
---
name: custom-assess
agent: CUSTOM-AUDITOR
usage: "/custom-assess [--scope=<directory>]"
---

# Custom Assessment

Performs code quality assessment and creates Linear tasks.
````

**After (Migrated):**

````yaml
---
name: custom-assess
agent: CUSTOM-AUDITOR
execution_mode: ORCHESTRATOR
subprocess_usage: READ_ONLY_ANALYSIS
usage: "/custom-assess [--scope=<directory>]"
---

# Custom Assessment

Performs code quality assessment and creates Linear tasks.

## ⚠️ IMPORTANT: Orchestrator-Workers Pattern

This command uses parallel workers for analysis:
- **Main agent** orchestrates analysis and creates Linear tasks
- **Worker subprocesses** scan code in parallel (read-only)
- **NO subprocess writes** - Linear task creation in main context

**Safe subprocess operations:**
- ✅ Reading code files
- ✅ Running linters
- ✅ Calculating metrics

**Must happen in main context:**
- ⚠️ Creating Linear CLEAN tasks
- ⚠️ Writing assessment report

**Rule:** Subprocesses analyze code, main context creates tasks.

## Ground Truth Verification (Mandatory)

After assessment, CUSTOM-AUDITOR **MUST** verify:

1. **Verify Linear Tasks Created:**
   ```bash
   mcp__linear__search_issues "identifier:CLEAN"
````

Expected: Tasks visible in Linear

2. **Verify Assessment Report:**
   ```bash
   ls -la assessments/report-*.json
   ```
   Expected: Report file exists with findings

````

---

### Example 2: Custom Fix Command

**Before:**

```yaml
---
name: hotfix
agent: QUICK-FIXER
usage: "/hotfix <issue>"
---

# Quick Hotfix

Implements urgent fixes quickly.
````

**After:**

````yaml
---
name: hotfix
agent: QUICK-FIXER
execution_mode: DIRECT
subprocess_usage: NONE
usage: "/hotfix <issue>"
---

# Quick Hotfix

Implements urgent fixes quickly.

## ⚠️ IMPORTANT: Direct Execution Required

This command performs **STATE-CHANGING operations**:
- Creates git branch
- Writes code changes
- Makes git commits
- Creates PR
- Updates Linear

**All operations MUST run in main context.**

## Ground Truth Verification (Mandatory)

After hotfix, QUICK-FIXER **MUST** verify:

1. **Verify Branch Created:**
   ```bash
   git branch --list hotfix/*
````

2. **Verify Commits Made:**

   ```bash
   git log --oneline -3
   ```

3. **Verify PR Created:**

   ```bash
   gh pr list --state open | grep hotfix
   ```

4. **Verify Tests Pass:**
   ```bash
   npm test
   ```

If ANY verification fails → DO NOT report success.

````

---

## Common Migration Mistakes

### ❌ Mistake 1: Forgetting Ground Truth Verification

**Wrong:**
```markdown
I created the PR and committed the changes.
````

**Right:**

````markdown
Let me verify the PR was created:

```bash
gh pr list --state open
```
````

✅ PR #123 confirmed: https://github.com/user/repo/pull/123

````

---

### ❌ Mistake 2: Using Subprocess for State Changes

**Wrong:**
```yaml
execution_mode: ORCHESTRATOR
subprocess_usage: READ_ONLY_ANALYSIS  # But then creates Linear tasks in subprocess
````

**Right:**

```yaml
execution_mode: ORCHESTRATOR
subprocess_usage: READ_ONLY_ANALYSIS
# Subprocess analyzes, main context creates tasks
```

---

### ❌ Mistake 3: Missing YAML Frontmatter

**Wrong:**

```yaml
---
name: mycommand
agent: MYAGENT
---
```

**Right:**

```yaml
---
name: mycommand
agent: MYAGENT
execution_mode: DIRECT
subprocess_usage: NONE
---
```

---

## Testing Your Migration

### Automated Testing

Create a test script:

```bash
#!/bin/bash
# test-subprocess-migration.sh

echo "Testing migrated command..."

# Run command
/mycommand arg1 arg2

# Verify operations
if git log --oneline -1 | grep -q "expected commit message"; then
  echo "✅ Git commit verified"
else
  echo "❌ Git commit missing"
  exit 1
fi

if gh pr list --state open | grep -q "PR-IDENTIFIER"; then
  echo "✅ PR verified"
else
  echo "❌ PR missing"
  exit 1
fi

echo "✅ All verifications passed"
```

---

## Validation Script

Use the validation script to check your migration:

```bash
# scripts/validate-subprocess-patterns.js
node .claude/scripts/validate-subprocess-patterns.js --command=/mycommand
```

This will check:

- ✅ YAML frontmatter present
- ✅ Execution mode specified
- ✅ Subprocess warning section present
- ✅ Ground truth verification (if state-changing)

---

## Getting Help

**Documentation:**

- Full Guide: `.claude/docs/SUBPROCESS-BEST-PRACTICES.md`
- Quick Reference: `.claude/docs/SUBPROCESS-QUICK-REFERENCE.md`
- Examples: `.claude/commands/fix.md`, `.claude/commands/cycle.md`

**Common Issues:**

- Subprocess isolation: See best practices guide
- Ground truth verification: See verification template
- Pattern selection: See decision tree in best practices

---

## Summary

**Migration Steps:**

1. Analyze agent/command for state changes
2. Choose execution pattern
3. Add YAML frontmatter
4. Add subprocess warning section
5. Add ground truth verification (if state-changing)
6. Test with actual invocation
7. Verify operations persist

**Key Principle:** Subprocesses analyze, main context acts.

**Rule:** Ground truth over estimation - always verify with actual tool calls.

---

**Migration Checklist Completed?**

- [ ] YAML frontmatter with execution metadata
- [ ] Subprocess warning section
- [ ] Ground truth verification (if state-changing)
- [ ] Manual testing completed
- [ ] All verifications pass
- [ ] No imaginary results reported

✅ **Migration Complete!**

---

**Version:** 1.4.0
**Last Updated:** 2025-10-06
**Status:** Production-ready
