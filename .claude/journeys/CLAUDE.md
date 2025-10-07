# 🚀 Autonomous Journeys - Claude Code Guide

## What Are Journeys?

Journeys are complete, self-coordinating workflows that combine multiple agents to accomplish complex tasks autonomously. Think of them as "macros" or "recipes" that Claude Code can execute.

## Available Journeys

### JR-1: Onboarding Journey (`jr1-onboarding.js`)

**Command:** `make onboard`
**Purpose:** Automatic project setup and configuration
**When to use:** First time setup or when user asks to "set up the project"

### JR-2: Assessment Journey (`jr2-assessment.js`)

**Command:** `make assess`
**Purpose:** Comprehensive code quality scan
**When to use:** User asks to "check code quality", "find issues", or "assess codebase"

### JR-3: Fix Pack Journey (`jr3-fix-pack.js`)

**Command:** `make fix-pack`
**Purpose:** Implement fixes with TDD enforcement
**When to use:** User wants to "fix issues", "clean up code", or after assessment

### JR-4: CI Recovery Journey (`jr4-ci-recovery.js`)

**Command:** `make ci-recovery`
**Purpose:** Diagnose and fix CI/CD failures
**When to use:** "Tests failing", "pipeline broken", "CI issues"

### JR-5: Pattern Mining Journey (`jr5-pattern-mining.js`)

**Command:** `make pattern-mining`
**Purpose:** Learn from successful patterns
**When to use:** "Improve code patterns", "learn from PRs", periodic improvement

### JR-6: Release Journey (`jr6-release.js`)

**Command:** `make release`
**Purpose:** Manage releases and deployments
**When to use:** "Deploy", "create release", "bump version"

## Journey Registry (`registry.yaml`)

The registry defines:

- Trigger conditions for each journey
- Required agents
- Confidence thresholds
- Auto-approval rules

Key settings:

```yaml
confidence_threshold: 0.85 # 85% confidence required
fil_auto_approve: [0, 1] # Auto-approve FIL-0 and FIL-1
```

## How to Use Journeys

### Direct Execution

```bash
# Run directly
node .claude/journeys/jr2-assessment.js

# With options
node .claude/journeys/jr3-fix-pack.js --task-id CLEAN-123
```

### Via Makefile (Recommended)

```bash
make assess
make fix-pack
make ci-recovery
```

### Via npm Scripts

```bash
npm run journey:assess
npm run journey:fix-pack
npm run journey:release
```

## Journey Capabilities

Each journey can:

- Make autonomous decisions (with confidence thresholds)
- Coordinate multiple agents
- Create Linear tasks
- Generate PRs
- Run tests and validations
- Self-correct on failures

## Decision Framework

Journeys make decisions based on:

1. **FIL Classification** - Feature Impact Level
2. **Confidence Score** - Must exceed 85%
3. **Safety Checks** - Rollback plans required
4. **Human Checkpoints** - For FIL-2+ changes

## Creating Custom Journeys

To add a new journey:

1. Create `jr[N]-[name].js` in this directory
2. Register in `registry.yaml`
3. Add Makefile target
4. Update package.json scripts

## Important Notes

- Journeys are stateless - each run is independent
- All journeys enforce TDD (RED→GREEN→REFACTOR)
- Maximum 300 LOC per PR
- 80% diff coverage required
- Linear API key must be configured

## Quick Reference

| User Says              | Use Journey | Command            |
| ---------------------- | ----------- | ------------------ |
| "Check my code"        | Assessment  | `make assess`      |
| "Fix the issues"       | Fix Pack    | `make fix-pack`    |
| "Tests are failing"    | CI Recovery | `make ci-recovery` |
| "Deploy to production" | Release     | `make release`     |
| "Set up the project"   | Onboarding  | `make onboard`     |
