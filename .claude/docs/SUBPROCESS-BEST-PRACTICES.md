# Subprocess Best Practices - Agent Execution Patterns

**Version:** 1.0.0
**Last Updated:** 2025-10-06
**Status:** Mandatory for all agents

---

## Executive Summary

**Critical Issue:** Agents spawned via the Task tool run in isolated subprocesses where state changes (file writes, git commits, PR creation) **do not persist** to the parent workspace.

**Solution:** Follow execution patterns below to ensure work persists to user's workspace.

---

## The Subprocess Isolation Problem

### What Happens

```
User Workspace (Main Context)
    ↓
Task Tool Invokes Agent
    ↓
Isolated Subprocess Created
    ↓
Agent works in subprocess:
  - Writes files ❌ (disappear when subprocess exits)
  - Creates git commits ❌ (disappear when subprocess exits)
  - Creates PRs ❌ (reference ephemeral branches)
  - Reports success ✅ (but nothing persisted!)
    ↓
Subprocess Exits
    ↓
User Workspace: NO CHANGES PERSISTED ❌
```

### Real-World Impact

**Reported Issue:**
> "The EXECUTOR agent's subprocess work never persisted, and I was reporting imaginary results."

**What Users See:**
- Agent reports "Created PR #123"
- User checks GitHub: No PR exists
- Agent reports "Committed changes"
- User checks git log: No new commits

**Root Cause:** Agent ran in subprocess, all state changes were in isolated context.

---

## Execution Patterns (Mandatory)

### Pattern 1: Direct Execution (State-Changing Operations)

**Use When:** Agent needs to write files, make git commits, create PRs, or modify Linear tasks.

**Commands Using This Pattern:**
- `/fix` - EXECUTOR implements fixes
- `/recover` - GUARDIAN creates reverts and PRs
- `/release` - STRATEGIST creates branches, tags, PRs
- `/docs fix` - DOC-KEEPER modifies documentation files

**How It Works:**
```yaml
---
name: fix
execution_mode: DIRECT  # ⚠️ Agent runs in main context
subprocess_usage: NONE  # No subprocesses for state changes
---
```

**Implementation:**
```markdown
## ⚠️ IMPORTANT: Direct Execution (No Subprocess)

This command invokes EXECUTOR **directly in the main context** - NOT via the Task tool.

This ensures:
- ✅ File writes **persist** to your actual workspace
- ✅ Git commits **persist** to your actual repository
- ✅ PRs reference **real branches** in your repo
- ✅ All changes are **immediately verifiable** by you

**Architecture:**
User → EXECUTOR in main context → Work persists directly ✅
```

**Ground Truth Verification (Mandatory):**
```markdown
After completing work, agent MUST verify using actual tool calls:

1. Verify files exist:
   ```bash
   ls -la path/to/file.ts
   ```

2. Verify commits persisted:
   ```bash
   git log --oneline -5
   ```

3. Verify PR created:
   ```bash
   gh pr list --state open | grep TASK-ID
   ```

If ANY verification fails → DO NOT report success.
```

---

### Pattern 2: Orchestrator-Workers (Parallel Read-Only Analysis)

**Use When:** Agent needs to analyze large datasets in parallel but doesn't modify state.

**Commands Using This Pattern:**
- `/cycle plan` - PLANNER analyzes Linear state via parallel workers
- `/assess` - AUDITOR scans code in parallel
- `/learn` - SCHOLAR analyzes git history in parallel
- `/status` - STRATEGIST fetches metrics in parallel

**How It Works:**
```yaml
---
name: cycle
execution_mode: ORCHESTRATOR  # Main agent spawns workers
subprocess_usage: READ_ONLY_ANALYSIS  # Workers only read
---
```

**Implementation:**
```markdown
## ⚠️ IMPORTANT: Subprocess Architecture

This command uses the **orchestrator-workers pattern**:
- **Main agent (YOU)** orchestrates workflow and makes decisions
- **Worker subprocesses** perform READ-ONLY analysis (fetch data, calculate metrics)
- **NO subprocess writes** - all Linear updates happen in main context

**Safe subprocess usage (READ-ONLY):**
- ✅ Fetching Linear issues
- ✅ Analyzing git history
- ✅ Calculating metrics
- ✅ Generating reports

**Prohibited in subprocesses (WRITE operations):**
- ❌ Creating Linear tasks
- ❌ Updating issue states
- ❌ Making git commits
- ❌ Creating PRs

**Rule:** Subprocesses return DATA, main context makes CHANGES.
```

**Architecture Diagram:**
```
Main Context (PLANNER)
  ├─> Subprocess Worker 1: Fetch Linear backlog → Return issues
  ├─> Subprocess Worker 2: Analyze velocity → Return metrics
  ├─> Subprocess Worker 3: Calculate scoring → Return recommendations
  └─> Main Context: Create cycle in Linear using worker data
```

**Ground Truth Verification:**
```markdown
After orchestration, main agent MUST verify state changes:

1. Verify Linear cycle created:
   ```bash
   mcp__linear__search_cycles "status:active"
   ```

2. Verify issues assigned to cycle:
   ```bash
   mcp__linear__search_issues "cycle:<cycle-id>"
   ```

If verification fails → Report incomplete orchestration.
```

---

### Pattern 3: Validation-Then-Action (Hybrid)

**Use When:** Agent needs to validate state (read-only) before taking actions (write).

**Commands Using This Pattern:**
- `/release` - Validate quality gates → Create release
- `/recover` - Analyze logs → Create revert
- `/docs validate` - Check links → Fix broken links

**How It Works:**
```yaml
---
name: release
execution_mode: DIRECT
subprocess_usage: VALIDATION_THEN_ACTION
---
```

**Implementation:**
```markdown
## ⚠️ IMPORTANT: Direct Execution Required

This command performs **STATE-CHANGING operations**:
- **Validation phase** may use subprocesses (read-only)
- **Action phase** MUST run in main context (writes)

**Validation phase (safe for subprocess):**
- ✅ Running test suites
- ✅ Checking coverage
- ✅ Querying Linear

**Action phase (MUST be in main context):**
- ⚠️ Creating branches
- ⚠️ Writing files
- ⚠️ Creating PRs

**Rule:** Validation can be delegated, ACTIONS must be in main context.
```

**Architecture:**
```
Main Context (STRATEGIST)
  ├─> Subprocess: Run validation checks → Return results
  └─> Main Context: Execute release actions using validation results
```

---

## Decision Tree: Which Pattern to Use?

```
Does the agent need to write files, commit code, create PRs, or modify Linear?
│
├─ YES → Use Pattern 1: Direct Execution
│         - Agent runs in main context
│         - No subprocesses for state changes
│         - Mandatory ground truth verification
│
└─ NO → Agent only reads/analyzes?
    │
    ├─ YES, pure read-only → Use Pattern 2: Orchestrator-Workers
    │                         - Main agent spawns parallel workers
    │                         - Workers return data only
    │                         - Main context displays/stores results
    │
    └─ Hybrid (read then write)? → Use Pattern 3: Validation-Then-Action
                                    - Subprocess for validation
                                    - Main context for actions
                                    - Clear phase separation
```

---

## Mandatory Verification Protocol

**All agents performing state changes MUST verify using ground truth.**

### Ground Truth = Actual Tool Output

**DO NOT:**
- ❌ Trust agent's memory of what it did
- ❌ Assume operations succeeded
- ❌ Report success without verification

**DO:**
- ✅ Use actual tool calls (git, gh, ls, Linear MCP)
- ✅ Check exit codes and output
- ✅ Verify timestamped evidence
- ✅ Report failures immediately

### Verification Template

```markdown
## Ground Truth Verification (Mandatory)

After completing [operation], [AGENT] **MUST** verify using actual tool calls:

### Required Verification Steps:

1. **Verify [Thing 1]:**
   ```bash
   [actual command to check]
   ```
   Expected: [specific verifiable output]

2. **Verify [Thing 2]:**
   ```bash
   [actual command to check]
   ```
   Expected: [specific verifiable output]

### If ANY Verification Fails:

```markdown
❌ GROUND TRUTH VERIFICATION FAILED

Expected: [what should have happened]
Actual: [what actually happened based on tool output]

[OPERATION] INCOMPLETE - DO NOT REPORT SUCCESS
[What user should do manually]
```

**Rule:** NEVER report success without verified evidence.
```

---

## YAML Frontmatter Standards

**All command files MUST include:**

```yaml
---
name: command-name
agent: AGENT-NAME
execution_mode: DIRECT | ORCHESTRATOR  # How agent runs
subprocess_usage: NONE | READ_ONLY_ANALYSIS | VALIDATION_THEN_ACTION  # Subprocess role
---
```

### Execution Modes

| Mode | Meaning | When to Use |
|------|---------|-------------|
| `DIRECT` | Agent runs in main context | State-changing operations |
| `ORCHESTRATOR` | Agent spawns read-only workers | Parallel analysis |

### Subprocess Usage

| Value | Meaning | Safe Operations |
|-------|---------|-----------------|
| `NONE` | No subprocesses used | All work in main context |
| `READ_ONLY_ANALYSIS` | Subprocesses only read | Fetch data, calculate metrics |
| `VALIDATION_THEN_ACTION` | Read validation, write action | Validate → Act pattern |

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Using Task Tool for State Changes

```python
# WRONG - Subprocess writes won't persist
Task(
    subagent_type="EXECUTOR",
    prompt="Implement fix and create PR"  # ❌ PR won't exist!
)
```

**Fix:** Run EXECUTOR in main context directly.

---

### ❌ Mistake 2: No Ground Truth Verification

```markdown
# WRONG
I created PR #123 and committed the changes.  # ❌ No verification!
```

**Fix:** Actually verify with tool calls.

```markdown
# CORRECT
Let me verify the PR was created:
```bash
gh pr list --state open
```
✅ PR #123 confirmed: https://github.com/user/repo/pull/123
```

---

### ❌ Mistake 3: Subprocess Creating Linear Tasks

```python
# WRONG - Linear task won't persist
Task(
    subagent_type="AUDITOR",
    prompt="Scan code and create CLEAN tasks"  # ❌ Tasks won't exist!
)
```

**Fix:** Subprocess returns findings, main context creates tasks.

```python
# CORRECT
findings = Task(
    subagent_type="AUDITOR",
    prompt="Scan code and return findings as JSON"  # ✅ Read-only
)
# Main context creates Linear tasks using findings
create_linear_tasks(findings)
```

---

### ❌ Mistake 4: Assuming Subprocess Git Operations Persist

```markdown
# WRONG
I created feature branch and committed changes in subprocess.  # ❌ Git state lost!
```

**Fix:** Git operations MUST be in main context.

---

## Testing Your Implementation

### Checklist for New Commands

- [ ] YAML frontmatter includes `execution_mode` and `subprocess_usage`
- [ ] Warning section explains subprocess architecture
- [ ] Clear list of safe vs prohibited operations
- [ ] Ground truth verification section (if state-changing)
- [ ] Verification includes actual tool commands
- [ ] Failure protocol documented

### Integration Test

Create test command that:
1. Spawns subprocess to analyze (read-only) ✅
2. Returns data to main context ✅
3. Main context creates file/commit ✅
4. Verifies file exists with actual tool ✅
5. Reports success only if verified ✅

---

## Migration Checklist for Existing Commands

For each command file:

1. **Add execution metadata to YAML:**
   ```yaml
   execution_mode: DIRECT | ORCHESTRATOR
   subprocess_usage: NONE | READ_ONLY_ANALYSIS | VALIDATION_THEN_ACTION
   ```

2. **Add subprocess warning section** (copy from `/fix.md` or `/cycle.md`)

3. **Add ground truth verification** (if state-changing operations)

4. **Test with actual invocation** and verify outputs

5. **Document in changelog**

---

## Examples by Command Type

### Pure Read-Only (No Persistence Needed)
- `/status` - Query state, display info
- Pattern: Orchestrator-Workers
- Verification: Not needed (read-only)

### State-Changing (Persistence Critical)
- `/fix` - Implement code, create PR
- Pattern: Direct Execution
- Verification: **Mandatory** (git log, gh pr list, etc.)

### Hybrid (Validate Then Act)
- `/release` - Check quality gates → Create release
- Pattern: Validation-Then-Action
- Verification: **Mandatory** for action phase

---

## Key Principles

1. **Subprocess Isolation is Real** - Don't ignore it
2. **State Changes MUST Be in Main Context** - No exceptions
3. **Ground Truth Over Estimation** - Verify with tools
4. **Document Execution Pattern** - In YAML and prose
5. **Test Before Shipping** - Ensure persistence works

---

## Related Documentation

- [Ground Truth Verification Protocol](./GROUND-TRUTH.md)
- [Agent Success Criteria](./../agents/success-criteria.yaml)
- [Task Tool Usage Guidelines](./TASK-TOOL.md)
- [Command Template](./../commands/TEMPLATE.md)

---

## Questions?

**Issue:** Agent reporting success but nothing persisted?
**Answer:** Agent ran in subprocess. Use Direct Execution pattern.

**Issue:** Need parallel analysis performance?
**Answer:** Use Orchestrator-Workers for read-only, Direct Execution for writes.

**Issue:** How to verify operations succeeded?
**Answer:** Use actual tool calls (git, gh, Linear MCP), check output.

---

**Last Updated:** 2025-10-06
**Status:** Mandatory for all agents
**Version:** 1.0.0
