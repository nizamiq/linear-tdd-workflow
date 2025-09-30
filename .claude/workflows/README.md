# Workflows Directory

This directory contains **deterministic workflow YAML files** that replace autonomous agents for simple, predictable tasks. Following Anthropic's best practices, workflows are preferred over agents when tasks have clear, algorithmic solutions.

## Philosophy: Simplest Approach Principle

```
Direct Tool Call → Workflow → Autonomous Agent
   (best)           (good)       (necessary)
```

- **Direct Tool Call**: Single tool execution (e.g., `Bash: npm test`)
- **Workflow**: Multi-step deterministic process with clear decision tree
- **Autonomous Agent**: Complex reasoning required, unpredictable paths

## Available Workflows

### 1. TDD Cycle (`tdd-cycle.yaml`)
**Purpose**: Enforce strict RED→GREEN→REFACTOR TDD cycle
**Replaces**: Part of EXECUTOR agent's deterministic logic
**Cost Profile**: Minimal (no LLM overhead)
**SLA**: 5 minutes

**Phases**:
- **RED**: Write failing test (max 2 attempts)
- **GREEN**: Minimal implementation (max 3 attempts)
- **REFACTOR**: Improve design (max 2 attempts)

**Quality Gates**:
- Test coverage ≥80%
- All tests pass
- Linting passes

**Escalation**: EXECUTOR agent after max attempts exceeded

**Usage**:
```bash
# Via Claude Code
Execute tdd-cycle workflow with:
  test_file_path: tests/test_calculator.py
  implementation_file_path: src/calculator.py
  coverage_target: 80

# Manual invocation (when workflow runner available)
workflow run tdd-cycle --test=tests/test_calculator.py --impl=src/calculator.py
```

---

### 2. Lint and Format (`lint-and-format.yaml`)
**Purpose**: Deterministic code linting and auto-formatting
**Replaces**: LINTER agent for FIL-0/1 changes
**Cost Profile**: Minimal
**SLA**: 1 minute

**Actions**:
- Auto-detect language (Python, JS/TS)
- Run ruff format/check (Python) or prettier/eslint (JS/TS)
- Verify no syntax errors introduced
- Optional: Run tests if `fail_on_error=true`

**Quality Gates**:
- All files formatted
- No syntax errors
- Style compliant

**Escalation**: EXECUTOR for non-auto-fixable issues

**Usage**:
```bash
# Via hook (automatic on file write)
# Triggered by .claude/hooks.json on-file-write

# Manual
workflow run lint-and-format --files=src/**/*.py --auto-fix
```

---

### 3. Type Check (`type-check.yaml`)
**Purpose**: Fast, incremental type checking
**Replaces**: TYPECHECKER agent
**Cost Profile**: Minimal
**SLA**: 2 minutes

**Actions**:
- Incremental type checking (default)
- TypeScript: `tsc --noEmit` on changed files
- Python: `mypy` on changed files
- Full check available via flag

**Quality Gates**:
- No type errors (strict)
- OR no NEW type errors (incremental)

**Escalation**: TYPESCRIPT-PRO or PYTHON-PRO for complex errors (>10 errors)

**Usage**:
```bash
# Via PR check
workflow run type-check --changed-files=$(git diff --name-only)

# Full check
workflow run type-check --full-check
```

---

### 4. PR Review Checklist (`pr-review-checklist.yaml`)
**Purpose**: Automated PR readiness validation
**Replaces**: Part of VALIDATOR agent
**Cost Profile**: Minimal
**SLA**: 5 minutes

**Validates**:
- ✅ Tests pass
- ✅ Coverage ≥80%
- ✅ Linting passes
- ✅ Type checking passes
- ✅ Conventional commits
- ✅ No merge conflicts
- ✅ No security vulnerabilities
- ✅ PR description complete

**Quality Checklist**:
- Code quality (automated)
- Git hygiene (automated)
- Security (automated)
- Documentation (automated)
- Human review (manual gate)

**Escalation**: CODE-REVIEWER for complex review needs

**Usage**:
```bash
# Via GitHub Actions
workflow run pr-review-checklist --pr-number=123

# Manual validation
gh pr view 123 | workflow run pr-review-checklist
```

---

### 5. Deployment Gates (`deployment-gates.yaml`)
**Purpose**: Pre-deployment validation and safety checks
**Replaces**: Part of VALIDATOR agent
**Cost Profile**: Minimal
**SLA**: 10 minutes

**Gates**:
- **Pre-flight**: CI status, test coverage, branch protection
- **Security**: Vulnerability scan, secret scan, dependency check
- **Performance**: Smoke tests, migration dry-run, bundle size
- **Operational**: Rollback plan, monitoring, database backup

**Go/No-Go Decision**:
- All critical gates pass: ✅ Proceed
- Any critical gate fails: ❌ Block
- High warnings: ⚠️ Manual approval required

**Escalation**: DEPLOYMENT-ENGINEER for gate failures

**Usage**:
```bash
# Via deployment pipeline
workflow run deployment-gates \
  --environment=production \
  --commit-sha=$GITHUB_SHA \
  --deployment-type=release

# Emergency override (requires approval)
workflow run deployment-gates --force-deploy
```

---

### 6. Fix Pack Generation (`fix-pack-generation.yaml`)
**Purpose**: Generate atomic fix packs from assessment findings
**Replaces**: Part of AUDITOR agent
**Cost Profile**: Minimal
**SLA**: 5 minutes

**Process**:
1. Load assessment report JSON
2. Filter FIL-0/1 issues only
3. Group related issues (<300 LOC combined)
4. Generate fix pack specs with acceptance criteria
5. Create Linear tasks automatically

**Fix Pack Templates**:
- Lint/format fixes
- Dead code removal
- Simple refactoring
- Type annotations
- Test coverage

**Quality Validation**:
- ✅ Atomic (single responsibility)
- ✅ Reversible (rollback plan)
- ✅ Testable (clear acceptance criteria)
- ✅ Estimated (<300 LOC)

**Escalation**: AUDITOR for validation, EXECUTOR for implementation

**Usage**:
```bash
# After assessment
workflow run fix-pack-generation \
  --assessment-report=.claude/reports/assessment-2025-01-30.json \
  --linear-team-id=$LINEAR_TEAM_ID \
  --max-fix-packs=10
```

---

## Workflow vs Agent Decision Matrix

| Task Type | Complexity | Deterministic? | Recommendation |
|-----------|-----------|----------------|----------------|
| Lint/format files | Low | Yes | **Workflow** |
| Type check | Low | Yes | **Workflow** |
| Run test suite | Low | Yes | **Direct tool** |
| TDD cycle enforcement | Medium | Yes | **Workflow** |
| PR validation checklist | Medium | Yes | **Workflow** |
| Code assessment | High | Partially | **Agent** (AUDITOR) |
| Fix implementation | High | No | **Agent** (EXECUTOR) |
| Architectural review | Very high | No | **Agent** (CODE-REVIEWER) |
| Pattern learning | Very high | No | **Agent** (SCHOLAR) |

## Integration with Agents

Workflows complement agents, not replace them entirely:

```
STRATEGIST (orchestrator)
    ↓
    ├─→ Workflow: tdd-cycle (deterministic TDD)
    │   └─→ Escalate to EXECUTOR (if complex)
    │
    ├─→ Workflow: pr-review-checklist (objective validation)
    │   └─→ Escalate to CODE-REVIEWER (if subjective analysis needed)
    │
    └─→ AUDITOR agent (complex assessment)
        └─→ Workflow: fix-pack-generation (deterministic task creation)
            └─→ EXECUTOR agent (implementation)
```

## Benefits of Workflows

### Cost Reduction
- **75% cost savings** on deterministic tasks
- No LLM inference needed for clear algorithmic processes
- Token usage reduced from thousands to zero

### Speed Improvement
- **10x faster** than agent reasoning
- Direct tool execution without planning overhead
- Parallel execution where possible

### Reliability Enhancement
- **100% consistent** behavior (no LLM variability)
- Clear success/failure conditions
- Deterministic error handling

### Maintainability
- Human-readable YAML specifications
- Version controlled alongside code
- Easy to test and validate

## Workflow Execution (Future)

Currently workflows are documentation/specifications. Full workflow runner planned for Phase 3:

```bash
# Future workflow CLI
claude-workflow run <workflow-name> [options]
claude-workflow validate <workflow-file>
claude-workflow list
claude-workflow describe <workflow-name>
```

For now, workflows serve as:
1. **Documentation** of deterministic processes
2. **Specifications** for tool orchestration
3. **Templates** for agent behavior
4. **Foundation** for future workflow engine

## Adding New Workflows

When creating new workflows:

1. **Identify deterministic tasks** - Clear inputs, predictable outputs
2. **Define clear phases** - Sequential steps with validation
3. **Set quality gates** - Objective pass/fail criteria
4. **Specify escalation** - Which agent handles exceptions
5. **Document SLAs** - Time and cost expectations

Template structure:
```yaml
---
name: workflow-name
description: Brief description
version: 1.0.0
type: workflow
metadata:
  owner: AGENT_NAME
  cost_profile: minimal
  deterministic: true
  sla_seconds: 300
inputs:
  required: []
  optional: []
steps: []
quality_gates: []
outputs: []
success_criteria: {}
failure_handling: {}
```

## References

- Anthropic Best Practices: Simplest approach principle
- `.claude/agents/` - Agent specifications that workflows support
- `.claude/hooks.json` - Automatic workflow triggers
- `.claude/agents/success-criteria.yaml` - Quality metrics

---

**Workflows are the foundation of deterministic automation in the Linear TDD Workflow System.**