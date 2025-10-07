# Subprocess Quick Reference Card

**⚠️ READ THIS FIRST:** Subprocesses cannot persist state changes!

---

## The Golden Rule

> **Subprocesses return DATA, main context makes CHANGES.**

---

## Quick Decision Matrix

| Does the agent need to...  | Execution Pattern    | Subprocess OK? |
| -------------------------- | -------------------- | -------------- |
| Write files                | Direct Execution     | ❌ NO          |
| Create git commits         | Direct Execution     | ❌ NO          |
| Create PRs                 | Direct Execution     | ❌ NO          |
| Create/update Linear tasks | Direct Execution     | ❌ NO          |
| Read files                 | Orchestrator-Workers | ✅ YES         |
| Analyze code               | Orchestrator-Workers | ✅ YES         |
| Calculate metrics          | Orchestrator-Workers | ✅ YES         |
| Query APIs (read-only)     | Orchestrator-Workers | ✅ YES         |

---

## 3 Execution Patterns

### 1. Direct Execution (for state changes)

```yaml
execution_mode: DIRECT
subprocess_usage: NONE
```

**Use for:** `/fix`, `/recover`, `/release`, `/docs fix`

**Example:**

```
User → EXECUTOR in main context → File writes persist ✅
```

---

### 2. Orchestrator-Workers (for parallel read-only)

```yaml
execution_mode: ORCHESTRATOR
subprocess_usage: READ_ONLY_ANALYSIS
```

**Use for:** `/cycle`, `/assess`, `/learn`, `/status`

**Example:**

```
Main Context → Subprocesses fetch data → Main context acts on data ✅
```

---

### 3. Validation-Then-Action (hybrid)

```yaml
execution_mode: DIRECT
subprocess_usage: VALIDATION_THEN_ACTION
```

**Use for:** `/release`, `/recover`, `/docs validate`

**Example:**

```
Subprocess validates → Main context takes action ✅
```

---

## Verification Checklist

**After ANY state change, verify with actual tools:**

```bash
# Files created?
ls -la path/to/file

# Git commits persisted?
git log --oneline -5

# PR created?
gh pr list --state open

# Linear task created?
mcp__linear__search_issues "identifier:TASK-ID"

# Branch exists?
git branch --list feature/*
```

**Rule:** If verification fails → Don't report success!

---

## YAML Template

```yaml
---
name: command-name
agent: AGENT-NAME
execution_mode: DIRECT | ORCHESTRATOR
subprocess_usage: NONE | READ_ONLY_ANALYSIS | VALIDATION_THEN_ACTION
---
```

---

## Red Flags 🚩

- Agent reports "Created PR" but `gh pr list` shows nothing → **Subprocess isolation bug**
- Agent reports "Committed changes" but `git log` shows nothing → **Subprocess isolation bug**
- Agent reports "Created Linear task" but Linear shows nothing → **Subprocess isolation bug**

**Fix:** Use Direct Execution pattern, not subprocess.

---

## See Full Guide

📖 [SUBPROCESS-BEST-PRACTICES.md](./SUBPROCESS-BEST-PRACTICES.md)
