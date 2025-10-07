# Decision Matrix: When to Use What Approach

## Overview

Following Anthropic's "Building Effective Agents" guidance, this matrix helps you choose the **simplest approach** that achieves your quality targets. Always prefer simplicity over complexity.

## The Fundamental Principle

```
Direct Tool Call  →  Workflow  →  Autonomous Agent
   (simplest)        (when needed)     (last resort)
```

**Cost Impact**:
- Direct call: ~1x baseline cost
- Workflow: ~2-5x baseline cost
- Agent: ~10-20x baseline cost

**Reliability**:
- Direct call: 100% deterministic
- Workflow: 100% deterministic (if well-specified)
- Agent: 70-95% (depends on task complexity)

---

## Decision Tree

### Start Here: What's Your Goal?

```
Is the task deterministic with a known sequence of steps?
├─ YES → Can it be done in a single tool call?
│        ├─ YES → Use Direct Tool Call
│        └─ NO  → Use Workflow (orchestrate multiple tools)
│
└─ NO  → Does it require judgment/creativity/adaptation?
         └─ YES → Use Autonomous Agent
```

---

## Approach 1: Direct Tool Call (Simplest)

**When to Use**:
- Single, well-defined operation
- No branching logic required
- Deterministic output
- Can be specified in clear instructions

**Examples**:

### ✅ Linting Code
```bash
# GOOD: Direct tool call via hook
pre-commit:
  command: "npm run lint"

# BAD: Using LINTER agent
/invoke LINTER:lint
```

### ✅ Type Checking
```bash
# GOOD: Direct tool call in CI
npm run typecheck

# BAD: Using TYPECHECKER agent
/invoke TYPECHECKER:check
```

### ✅ Running Tests
```bash
# GOOD: Direct command
npm test

# BAD: Using TESTER agent for simple execution
/invoke TESTER:run-tests
```

### ✅ Formatting Code
```bash
# GOOD: Post-write hook
on-file-write:
  command: "prettier --write ${file}"

# BAD: Using agent
/invoke FORMATTER:format
```

**Cost Savings**: 95% compared to agent approach
**Reliability**: 100% deterministic
**Speed**: Instant (no LLM latency)

---

## Approach 2: Workflow (Deterministic Orchestration)

**When to Use**:
- Multiple sequential steps
- Clear branching logic
- Deterministic decision points
- Can be expressed as a state machine

**Workflow Patterns Available**:

### 1. **Prompt Chaining** (Sequential Steps)

**Use Case**: Multi-stage process where each step feeds the next

**Example: TDD Cycle**
```yaml
# .claude/workflows/tdd-cycle.yaml
name: RED-GREEN-REFACTOR
steps:
  - name: RED
    action: write_failing_test
    verify: test_fails
    max_attempts: 2

  - name: GREEN
    action: implement_minimal_code
    verify: test_passes
    max_attempts: 3

  - name: REFACTOR
    action: improve_design
    verify: tests_still_pass
    max_attempts: 2
```

**When NOT to Use Agent**: If you can specify exact steps upfront

### 2. **Routing** (Conditional Branching)

**Use Case**: Different paths based on objective criteria

**Example: PR Review Routing**
```yaml
# .claude/workflows/pr-review-router.yaml
name: PR_REVIEW_ROUTING
conditions:
  - if: lines_changed < 100
    then: fast_review_workflow

  - if: lines_changed >= 100 AND lines_changed < 500
    then: standard_review_workflow

  - if: lines_changed >= 500
    then: comprehensive_review_workflow
```

**When NOT to Use Agent**: If routing criteria are objective (file count, complexity score, etc.)

### 3. **Parallelization** (Independent Work)

**Use Case**: Multiple independent operations that can run concurrently

**Example: Multi-Directory Assessment**
```yaml
# .claude/workflows/parallel-assessment.yaml
name: CODEBASE_ASSESSMENT
parallel:
  - assess: src/backend/**
  - assess: src/frontend/**
  - assess: tests/**
merge:
  strategy: union
  output: unified_quality_report.json
```

**When NOT to Use Agent**: If tasks are truly independent with no adaptive decisions needed

### 4. **Orchestrator-Workers** (Dynamic Subtasking)

**Use Case**: Main controller delegates to specialized workers

**Example: Fix Pack Implementation**
```yaml
# .claude/workflows/fix-pack-orchestration.yaml
orchestrator: STRATEGIST
workers:
  - EXECUTOR  # Implements fixes
  - CODE-REVIEWER  # Reviews quality
  - TESTER  # Validates tests
coordination:
  type: sequential_with_gates
  gates:
    - after: EXECUTOR
      check: tests_pass
    - after: CODE-REVIEWER
      check: quality_score >= 4
```

**When to Use Agent**: Orchestrator needs judgment on which workers to invoke and when

### 5. **Generator-Critic** (Self-Correction Loop)

**Use Case**: Generate solution, critique, improve until threshold met

**Example: Code Implementation with Review**
```yaml
# .claude/workflows/generator-critic.yaml
generator: EXECUTOR
critic: CODE-REVIEWER
rubric:
  - correctness: 1-5
  - completeness: 1-5
  - style: 1-5
  - safety: 1-5
  - evidence: 1-5
threshold: avg_score >= 4.0
max_iterations: 3
```

**When to Use Agent**: Generator step requires creativity; critic can use objective rubrics

---

## Approach 3: Autonomous Agent (Last Resort)

**When to Use**:
- Unpredictable task complexity
- Requires adaptive planning
- Needs judgment calls
- Cannot specify exact steps upfront

**Examples**:

### ✅ Code Quality Assessment (AUDITOR)
**Why Agent**:
- Requires judgment on severity
- Needs adaptive depth (shallow vs deep)
- Must prioritize findings by business impact
- Unknown number of issues to find

```bash
/assess --depth=deep --scope=src/
# Agent explores codebase, makes judgment calls, prioritizes findings
```

### ✅ Fix Implementation (EXECUTOR)
**Why Agent**:
- Creative problem-solving (multiple valid solutions)
- Adaptive TDD cycle (might need multiple attempts)
- Unknown complexity upfront
- Requires refactoring judgment

```bash
/fix CLEAN-123
# Agent determines best implementation approach, adapts to test failures
```

### ✅ Pipeline Recovery (GUARDIAN)
**Why Agent**:
- Unpredictable failure modes
- Requires root cause analysis
- Adaptive fix strategies
- May need multi-step debugging

```bash
/recover
# Agent diagnoses unknown CI/CD failure, adapts recovery strategy
```

### ✅ Pattern Learning (SCHOLAR)
**Why Agent**:
- Requires pattern recognition
- Needs synthesis from multiple PRs
- Adaptive extraction (what patterns are worth capturing)
- Unknown insights upfront

```bash
/learn
# Agent mines patterns from successful PRs, determines what's valuable
```

### ❌ Simple Linting (Don't Use Agent)
**Why NOT Agent**:
- Deterministic rules
- No judgment required
- Known output format
- Can be hook or direct call

```bash
# WRONG: /invoke LINTER:lint
# RIGHT: npm run lint (hook or direct)
```

---

## Cost-Complexity-Quality Tradeoffs

| Approach | Cost | Complexity | Speed | Quality Ceiling | Use When |
|----------|------|------------|-------|-----------------|----------|
| **Direct Call** | 1x | Low | Instant | 100% (deterministic) | Known single operation |
| **Workflow** | 2-5x | Medium | Fast | 100% (if well-specified) | Multi-step deterministic |
| **Agent** | 10-20x | High | Slow | 70-95% (varies) | Unpredictable/creative |

---

## Real-World Scenarios

### Scenario 1: "Format all Python files"
```
❌ Agent approach: Invoke PYTHON-PRO agent
✅ Workflow approach: For each *.py file, run ruff format
✅✅ Direct call: ruff format . (hook or CI gate)

Savings: 95% cost reduction
```

### Scenario 2: "Implement TDD fix for CLEAN-123"
```
❌ Direct call: Can't specify exact implementation upfront
❌ Simple workflow: Implementation requires creativity
✅ Agent approach: EXECUTOR with TDD enforcement

Rationale: Unknown complexity, needs adaptive problem-solving
```

### Scenario 3: "Assess code quality and create Linear tasks"
```
❌ Direct call: Can't specify all issues upfront
✅ Hybrid workflow + agent:
   1. Workflow: Run linters, collect metrics (deterministic)
   2. Agent (AUDITOR): Analyze results, prioritize, create tasks (judgment)

Savings: 50% cost reduction by doing deterministic parts as workflow
```

### Scenario 4: "Run all tests and report failures"
```
❌ Agent approach: Invoke TESTER agent
✅✅ Direct call: npm test > test-results.json

Savings: 98% cost reduction
```

### Scenario 5: "Plan sprint cycle with velocity analysis"
```
❌ Direct call: Requires judgment on issue selection
⚠️ Simple workflow: Can do data gathering, but prioritization needs judgment
✅ Hybrid:
   Phase 1: Workflow (parallel data gathering - velocity, backlog, blockers)
   Phase 2: Agent (PLANNER - scoring, prioritization, selection)
   Phase 3: Workflow (validation gates)
   Phase 4: Workflow (parallel validation)

Approach: Use workflows for 75% of work, agent for 25% that needs judgment
Savings: 60% cost reduction
```

---

## Migration Strategy

### Step 1: Identify Current Agent Usage
```bash
# Find all agent invocations
grep -r "/invoke" .claude/
grep -r "Task tool" .claude/agents/
```

### Step 2: Classify by Decision Matrix
For each agent invocation, ask:
1. Is this deterministic? → Workflow or direct call
2. Does this need judgment? → Keep as agent
3. Can this be a hook? → Move to hooks.json

### Step 3: Refactor Incrementally
Priority order:
1. **High-frequency, deterministic** → Direct calls/hooks (biggest savings)
2. **Multi-step deterministic** → Workflows
3. **Complex with some deterministic parts** → Hybrid (workflow + agent)
4. **Truly unpredictable** → Keep as agent

### Example: LINTER Agent Migration
```yaml
# BEFORE: .claude/agents/linter.md (400 lines)
name: LINTER
description: Code style enforcement
tools: [Bash, Read, Edit]
# ... 400 lines of agent logic

# AFTER: .claude/hooks.json (5 lines)
"pre-commit": {
  "command": "npm run lint",
  "on_failure": "block"
}

Cost reduction: 95%
Reliability increase: 100% deterministic
Speed improvement: No LLM latency
```

---

## Checklist: Before Creating a New Agent

Ask yourself:

- [ ] Can this be a single tool call? → Use direct call
- [ ] Can I specify exact steps? → Use workflow
- [ ] Is this triggered by an event? → Use hook
- [ ] Does this run on every file? → Use hook
- [ ] Is success measurable objectively? → Use workflow with gates
- [ ] Does this need creativity/judgment? → Only then use agent

**If you answered "no" to the last question, you don't need an agent.**

---

## References

- [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) - Original guidance
- [Hooks Guide](.claude/docs/HOOKS-GUIDE.md) - Using hooks for deterministic enforcement
- [Workflows Guide](.claude/workflows/README.md) - Creating deterministic workflows
- [Parallel Execution](.claude/docs/PARALLEL-EXECUTION.md) - Orchestrator-workers pattern
- [Anthropic Best Practices](.claude/ANTHROPIC-BEST-PRACTICES.md) - System-wide implementation

---

**Last Updated**: 2025-10-01
**Version**: 1.0.0
**Status**: Active - use for all new development
