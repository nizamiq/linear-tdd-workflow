# Parallel Subagent Execution Guide

## Overview

The Linear TDD Workflow System leverages Claude Code's parallel subagent execution capabilities to achieve **5-10x faster** workflow execution for independent tasks. This guide provides comprehensive patterns, examples, and best practices for parallel orchestration.

## Core Concepts

### Parallel vs Sequential Execution

**Sequential Execution** (default):

- One task completes before the next begins
- Simple but slow
- Total time = Sum of all task times

**Parallel Execution** (optimized):

- Multiple tasks run concurrently
- Fast and efficient
- Total time = Longest single task time

### The Critical Rule

**To execute subagents in parallel, send a SINGLE message with MULTIPLE Task tool calls.**

- Single message with 5 Task calls = All 5 run in parallel
- 5 separate messages with 1 Task each = All 5 run sequentially

### Isolation and Independence

Each parallel subagent operates in complete isolation:

✅ **Safe for parallel execution:**

- Reading different files
- Analyzing separate directories
- Running independent validations
- Processing separate issues

❌ **NOT safe for parallel:**

- Writing to the same file
- Tasks with dependencies (A needs B's output)
- Shared state modifications
- Sequential workflows (must be ordered)

---

## Task Tool Usage Patterns

### Pattern 1: Batch Assessment

**Use Case**: Assess multiple directories independently

**Implementation**:

```
User: "Assess the entire codebase"

Agent: I'll assess 3 areas in parallel:
[In ONE message, invoke Task tool 3 times]

Task 1: Assess src/backend/** (10 min)
Task 2: Assess src/frontend/** (10 min)
Task 3: Assess tests/** (10 min)

Total time: ~10 minutes (vs 30 minutes sequential)
```

### Pattern 2: Parallel Fix Implementation

**Use Case**: Implement multiple independent fix packs

**Implementation**:

```
User: "Implement CLEAN-123 through CLEAN-127"

Agent: I'll implement all 5 fixes in parallel:
[In ONE message, invoke Task tool 5 times]

Task 1: Fix CLEAN-123 (15 min)
Task 2: Fix CLEAN-124 (12 min)
Task 3: Fix CLEAN-125 (18 min)
Task 4: Fix CLEAN-126 (10 min)
Task 5: Fix CLEAN-127 (14 min)

Total time: ~18 minutes (vs 69 minutes sequential)
```

### Pattern 3: Multi-Layer Code Review

**Use Case**: Run different types of validation simultaneously

**Implementation**:

```
User: "Review PR #456"

Agent: I'll run 4 parallel reviews:
[In ONE message, invoke Task tool 4 times]

Task 1: Security audit (8 min)
Task 2: Type checking (5 min)
Task 3: Test coverage (6 min)
Task 4: Code style (4 min)

Total time: ~8 minutes (vs 23 minutes sequential)
```

### Pattern 4: Batch File Processing

**Use Case**: Process multiple files independently

**Implementation**:

```
User: "Refactor all 8 controller files"

Agent: I'll refactor all 8 in parallel:
[In ONE message, invoke Task tool 8 times]

Task 1-8: Each handles one controller file

Total time: ~15 minutes (vs 120 minutes sequential)
```

---

## Performance Optimization

### Concurrency Limits

**Claude Code Limits**:

- Maximum 10 concurrent subagents
- Each subagent gets isolated context
- Total token budget shared across all subagents

**Optimal Batching Strategy**:

- For ≤10 tasks: Launch all in parallel (let Claude Code handle batching)
- For >10 tasks: Let Claude Code decide batching automatically OR manually batch into groups
- Prioritize critical-path tasks first

**Recommended Approach**: Don't specify batch sizes explicitly - Claude Code will intelligently batch and execute based on available resources.

**Manual Batching (If Needed)**:

```
For 25 tasks, Claude Code will automatically:
- Determine optimal batch size (may use 10, 8, or adaptive sizing)
- Execute batches sequentially
- Monitor resource availability
- Adjust batch sizes dynamically

Manual override only if needed:
Batch 1: Tasks 1-10 (parallel)
Wait for completion
Batch 2: Tasks 11-20 (parallel)
Wait for completion
Batch 3: Tasks 21-25 (parallel)
```

### Task Granularity

**Too Fine-Grained** (inefficient):

- Overhead of launching subagent > task execution time
- Example: Analyzing single 50-line file

**Too Coarse-Grained** (no benefit):

- Task cannot be parallelized
- Example: Single large monolithic operation

**Optimal Granularity**:

- Task execution time: 5-30 minutes
- Clear input/output boundaries
- Minimal dependencies

---

## Error Handling in Parallel Execution

### Failure Strategies

**Strategy 1: Fail-Fast**

- Abort all parallel tasks on first failure
- Use when tasks are interdependent
- Quick feedback for critical errors

**Strategy 2: Continue-On-Error**

- Let all tasks complete, collect errors
- Use when tasks are independent
- Useful for batch operations

**Strategy 3: Retry-Failed**

- Identify failed tasks
- Retry only failures in next batch
- Use for transient errors

### Result Validation

After parallel execution completes:

1. **Check Completeness**: Did all subagents finish?
2. **Verify Success**: Did any report errors?
3. **Validate Output**: Are results consistent?
4. **Merge Results**: Combine into final output

**Example**:

```
Launched 5 parallel fix implementations
Results: 4 succeeded, 1 failed

Analysis:
- CLEAN-123: ✓ PR #456 merged
- CLEAN-124: ✓ PR #457 merged
- CLEAN-125: ✗ Tests failing
- CLEAN-126: ✓ PR #458 merged
- CLEAN-127: ✓ PR #459 merged

Action: Retry CLEAN-125 with sequential execution for debugging
```

---

## Best Practices

### 1. **Always Assess Parallelizability First**

Before launching parallel tasks, ask:

- Are tasks truly independent?
- Do they share any resources?
- Is there a natural ordering?
- Would parallel execution cause conflicts?

### 2. **Provide Clear, Isolated Scopes**

Each subagent prompt should:

- Specify exact files/directories to process
- Define clear success criteria
- Include all necessary context
- Avoid references to other parallel tasks

### 3. **Design for Result Aggregation**

Plan how you'll merge results:

- Consistent output format across subagents
- Clear success/failure indicators
- Structured data for easy parsing
- Comprehensive error messages

### 4. **Monitor Token Budget**

- Each subagent consumes tokens independently
- 10 parallel agents = high token usage
- Balance parallelism with cost
- Use cheaper models (haiku/sonnet) for simple tasks

### 5. **Handle Failures Gracefully**

- Expect some subagents to fail
- Design retry strategies
- Provide clear error reporting
- Don't let one failure block everything

---

## Common Pitfalls

### Pitfall 1: Parallel File Writes

**Problem**:

```
Task 1: Edit src/utils.ts
Task 2: Edit src/utils.ts
Result: Merge conflict!
```

**Solution**: Never write to same file in parallel

### Pitfall 2: Dependent Tasks

**Problem**:

```
Task 1: Assess code (generates report)
Task 2: Create fix packs (needs report)
Launched in parallel → Task 2 fails!
```

**Solution**: Run dependent tasks sequentially

### Pitfall 3: Shared State

**Problem**:

```
Task 1: Update issue CLEAN-123
Task 2: Update issue CLEAN-123
Result: Race condition!
```

**Solution**: Assign unique resources to each task

### Pitfall 4: Resource Exhaustion

**Problem**:

```
Launch 10 agents, each analyzing 100k LOC
Result: OOM or timeout
```

**Solution**: Right-size tasks, monitor resource usage

---

## Conflict Detection

### Pre-Flight Conflict Check

Before launching parallel agents, perform these checks to prevent race conditions:

#### File-Level Conflict Detection

```bash
#!/bin/bash
# Pre-flight conflict checker

# Get files each agent will modify
AGENT1_FILES="src/utils.ts src/helpers.ts"
AGENT2_FILES="src/config.ts src/utils.ts"  # ⚠️ CONFLICT: utils.ts
AGENT3_FILES="src/api.ts"

# Check for overlaps
if [ overlaps detected ]; then
  echo "❌ CONFLICT: Multiple agents will modify utils.ts"
  echo "Resolution: Run sequentially or assign different files"
  exit 1
fi
```

#### Automated Conflict Detection

```javascript
// conflict-detector.js
function detectFileConflicts(agentTasks) {
  const fileMap = new Map();

  agentTasks.forEach((task, agentId) => {
    task.files.forEach((file) => {
      if (fileMap.has(file)) {
        console.error(`CONFLICT: ${file} assigned to both ${fileMap.get(file)} and ${agentId}`);
        return false;
      }
      fileMap.set(file, agentId);
    });
  });

  return true; // No conflicts
}

// Usage
const tasks = [
  { agent: 'EXECUTOR-1', files: ['src/a.ts', 'src/b.ts'] },
  { agent: 'EXECUTOR-2', files: ['src/c.ts', 'src/d.ts'] }, // ✓ No overlap
  { agent: 'EXECUTOR-3', files: ['src/e.ts'] },
];

if (detectFileConflicts(tasks)) {
  // Safe to run in parallel
}
```

### Conflict Detection Checklist

**Before Parallel Execution**:

- [ ] List all files each agent will read
- [ ] List all files each agent will write/edit
- [ ] Check for write-write conflicts (same file modified by 2+ agents)
- [ ] Check for read-write conflicts (if critical - e.g., config files)
- [ ] Verify Linear task assignments are unique per agent
- [ ] Confirm no shared state/database modifications

**Conflict Resolution Strategies**:

1. **File Separation** (Preferred)

   ```
   Agent 1: src/backend/**
   Agent 2: src/frontend/**
   Agent 3: tests/**
   ```

2. **Sequential Execution**

   ```
   If conflict detected:
     Run Agent 1 → Complete
     Run Agent 2 → Complete
   ```

3. **Git Worktrees** (Advanced)

   ```bash
   # Create isolated workspaces
   git worktree add ../workspace-1 -b agent-1
   git worktree add ../workspace-2 -b agent-2

   # Agents work in separate directories
   # Merge changes after completion
   ```

4. **Resource Locking** (Complex)
   ```yaml
   enhancements:
     fix-123:
       locked_files: ['src/utils.ts']
       locked_by: 'EXECUTOR-1'
       expires: '2025-10-01T12:00:00Z'
   ```

### Detection Tools

#### Simple CLI Checker

```bash
#!/bin/bash
# .claude/scripts/check-conflicts.sh

TASKS_FILE=".claude/tmp/parallel-tasks.json"

# Extract files from task definitions
jq -r '.tasks[] | {agent: .agent, files: .files}' "$TASKS_FILE" | \
  # Find duplicates
  jq -s 'map(.files) | flatten | group_by(.) | map(select(length > 1)) | .[]'

# Exit 1 if conflicts found
```

#### Integration with STRATEGIST

```yaml
STRATEGIST orchestration:

Step 1: Decompose into tasks
Step 2: Run conflict detection
  - Tool: Bash
    Command: .claude/scripts/check-conflicts.sh
  - If conflicts: Adjust task assignments
  - If no conflicts: Proceed to parallel launch

Step 3: Launch parallel agents
```

### Real-World Example

**Scenario**: Fix 5 issues across codebase

**Naive Approach** (Risky):

```
EXECUTOR-1: Fix CLEAN-123 (touches src/utils.ts)
EXECUTOR-2: Fix CLEAN-124 (touches src/utils.ts)  ⚠️ CONFLICT
```

**Safe Approach** (With Detection):

```
Pre-flight check:
  - CLEAN-123 files: [src/utils.ts, src/api.ts]
  - CLEAN-124 files: [src/utils.ts, tests/unit.ts]
  - CONFLICT DETECTED: src/utils.ts

Resolution:
  Option A: Sequential (CLEAN-123 → CLEAN-124)
  Option B: Merge tasks (single agent handles both)
  Option C: Split utils.ts changes into separate commits
```

### Monitoring for Conflicts

Even with pre-flight checks, monitor for runtime conflicts:

```bash
# Monitor file modifications during parallel execution
fswatch src/ | while read file; do
  echo "[$AGENT_ID] Modified: $file at $(date)"
done
```

### Best Practices

1. **Prefer Disjoint File Sets**: Assign completely separate files to each agent
2. **Use Read-Only Agents When Possible**: Assessment agents don't conflict
3. **Sequence Write Operations**: If conflicts unavoidable, run sequentially
4. **Document Conflict Resolution**: Log how conflicts were resolved
5. **Automate Detection**: Integrate conflict checker into STRATEGIST workflow

---

### Pitfall 5: Sequential Dependencies in Parallel

**Problem**:

```
RED phase requires failing test
GREEN phase requires passing test
Launched both in parallel → Violation of TDD!
```

**Solution**: Respect sequential workflows (RED→GREEN→REFACTOR)

---

## Performance Benchmarks

### Real-World Examples

**Scenario 1: Codebase Assessment (150k LOC)**

Sequential:

- Backend (50k LOC): 15 min
- Frontend (70k LOC): 18 min
- Tests (30k LOC): 10 min
- **Total: 43 minutes**

Parallel (3 agents):

- All three areas simultaneously
- **Total: 18 minutes (2.4x faster)**

**Scenario 2: Fix Pack Implementation (5 fixes)**

Sequential:

- CLEAN-123: 15 min
- CLEAN-124: 12 min
- CLEAN-125: 18 min
- CLEAN-126: 10 min
- CLEAN-127: 14 min
- **Total: 69 minutes**

Parallel (5 agents):

- All five fixes simultaneously
- **Total: 18 minutes (3.8x faster)**

**Scenario 3: PR Review (Multiple Aspects)**

Sequential:

- Security audit: 8 min
- Type checking: 5 min
- Test coverage: 6 min
- Code style: 4 min
- Performance: 7 min
- **Total: 30 minutes**

Parallel (5 agents):

- All checks simultaneously
- **Total: 8 minutes (3.75x faster)**

### Speedup Formula

```
Speedup = Sequential Time / Parallel Time
Efficiency = Speedup / Number of Agents

Example:
Sequential: 60 min
Parallel (5 agents): 15 min
Speedup: 60/15 = 4x
Efficiency: 4/5 = 80%
```

**Ideal efficiency**: 100% (perfect parallelization)
**Good efficiency**: >70%
**Poor efficiency**: <50% (overhead too high)

---

## Integration with Workflow System

### STRATEGIST Orchestration

The STRATEGIST agent is responsible for:

1. Decomposing complex requests into parallel tasks
2. Launching appropriate worker agents
3. Monitoring progress
4. Aggregating results
5. Reporting to user

### Agent Selection for Parallel Execution

**Best agents for parallel work:**

- AUDITOR (code assessment)
- EXECUTOR (fix implementation)
- CODE-REVIEWER (PR reviews)
- TESTER (test validation)
- LINTER (style checking)
- TYPECHECKER (type validation)
- SECURITY (security audits)

**Sequential-only agents:**

- STRATEGIST (orchestration)
- GUARDIAN (recovery - needs full context)
- SCHOLAR (learning - needs complete history)

### Workflow Integration

**Example: Assessment → Fix Pack → PR Workflow**

```
Phase 1: Parallel Assessment (3 agents, 18 min)
  └─ Task 1: Backend assessment
  └─ Task 2: Frontend assessment
  └─ Task 3: Test coverage

Phase 2: Sequential Planning (STRATEGIST, 3 min)
  └─ Generate fix packs from assessments

Phase 3: Parallel Implementation (5 agents, 18 min)
  └─ Task 1: Implement CLEAN-123
  └─ Task 2: Implement CLEAN-124
  └─ Task 3: Implement CLEAN-125
  └─ Task 4: Implement CLEAN-126
  └─ Task 5: Implement CLEAN-127

Phase 4: Parallel Validation (4 agents, 8 min)
  └─ Task 1: Security review
  └─ Task 2: Type check
  └─ Task 3: Test coverage
  └─ Task 4: Code style

Total: 47 minutes
Sequential equivalent: 150+ minutes
Speedup: 3.2x
```

---

## Advanced Techniques

### Dynamic Agent Allocation

Adjust parallelism based on workload:

```
Small codebase (<50k LOC): 2-3 agents
Medium codebase (50-200k LOC): 4-6 agents
Large codebase (>200k LOC): 8-10 agents
```

### Priority-Based Scheduling

Process high-priority tasks first:

```
Batch 1 (Critical): 3 agents on P0 issues
Batch 2 (High): 5 agents on P1 issues
Batch 3 (Medium): 7 agents on P2 issues
```

### Adaptive Batching

Monitor completion times and adjust:

```
If agents finish quickly: Increase batch size
If agents timeout: Decrease batch size
If high failure rate: Switch to sequential
```

---

## Scratchpad Communication Pattern

### When Coordination Is Necessary

While subagents run in **isolated contexts with no shared state**, they can coordinate through **scratchpad files** when result aggregation is needed.

### Pattern: Scratchpad-Based Result Aggregation

**Use Case**: Multiple agents need to report results to orchestrator without breaking isolation

**Implementation**:

```
STRATEGIST: I'll coordinate 5 parallel assessments using scratchpads

Step 1: Create result collection structure
[Create .claude/tmp/assessment-results.json]

Step 2: Launch 5 AUDITOR agents in parallel
[Each agent instructed to write results to dedicated section]

Task 1: AUDITOR for backend
  → Write results to: .claude/tmp/assessment-results.json#backend

Task 2: AUDITOR for frontend
  → Write results to: .claude/tmp/assessment-results.json#frontend

Task 3: AUDITOR for tests
  → Write results to: .claude/tmp/assessment-results.json#tests

Task 4: AUDITOR for infrastructure
  → Write results to: .claude/tmp/assessment-results.json#infrastructure

Task 5: AUDITOR for documentation
  → Write results to: .claude/tmp/assessment-results.json#docs

Step 3: Aggregate results after completion
[Read .claude/tmp/assessment-results.json]
[Merge and synthesize final report]
```

### Scratchpad Output Format

**Standardized JSON structure for aggregation**:

```json
{
  "backend": {
    "agent_id": "auditor-001",
    "status": "completed",
    "issues_found": 12,
    "severity_breakdown": {
      "critical": 2,
      "high": 5,
      "medium": 5
    },
    "execution_time_seconds": 180,
    "linear_tasks_created": ["CLEAN-123", "CLEAN-124"]
  },
  "frontend": {
    "agent_id": "auditor-002",
    "status": "completed",
    "issues_found": 8,
    "severity_breakdown": {
      "critical": 0,
      "high": 3,
      "medium": 5
    },
    "execution_time_seconds": 240,
    "linear_tasks_created": ["CLEAN-125", "CLEAN-126"]
  }
}
```

### Benefits of Scratchpad Pattern

1. **Maintains Isolation**: No direct agent-to-agent communication
2. **Structured Output**: Consistent format for aggregation
3. **Debuggable**: Scratchpad persists for troubleshooting
4. **Scalable**: Works with 2-10 parallel agents
5. **Non-Blocking**: Agents complete independently

### Best Practices

- **Unique Sections**: Each agent writes to dedicated JSON key/file section
- **Atomic Writes**: Write complete results in single operation
- **Status Indicators**: Include completion status for verification
- **Timestamp Results**: Track execution times for performance analysis
- **Clean Up**: Remove scratchpads after aggregation (or keep for debugging)

---

## Monitoring & Debugging Parallel Execution

### Execution Visibility Limitations

**Important**: Claude Code provides **limited monitoring during execution**. You cannot see real-time progress of parallel subagents.

**What You CAN Monitor**:

- Initial launch confirmation (agents started)
- Final completion status (all agents finished)
- Aggregate results after completion

**What You CANNOT Monitor**:

- Real-time progress updates
- Intermediate outputs during execution
- Individual agent status while running

### Debugging Strategies

#### Strategy 1: Post-Execution Analysis

```
After parallel execution completes:
1. Review scratchpad outputs
2. Check for partial completions
3. Identify which agents failed
4. Analyze failure patterns
```

#### Strategy 2: Sequential Fallback

```
If parallel execution fails mysteriously:
1. Switch to sequential execution
2. Run same tasks one-by-one
3. Identify specific failure point
4. Debug in isolation
```

#### Strategy 3: Smaller Batch Sizes

```
If 10 agents = too many failures:
1. Reduce to 5 agents per batch
2. Monitor completion rate
3. Gradually increase if stable
```

#### Strategy 4: Scratchpad Logging

```
Instruct each agent to log progress:
- Start time
- Key milestones
- Completion time
- Errors encountered

Aggregated logs provide execution visibility
```

### Common Debugging Scenarios

**Scenario 1: Silent Failures**

```
Problem: Some agents complete, others produce no output
Diagnosis: Check scratchpad for partial results
Solution: Re-run failed tasks sequentially
```

**Scenario 2: Timeout Issues**

```
Problem: Parallel execution never completes
Diagnosis: One or more agents hung/timed out
Solution: Reduce task complexity, increase timeout limits
```

**Scenario 3: Inconsistent Results**

```
Problem: Same parallel execution produces different results
Diagnosis: Race condition or shared resource conflict
Solution: Review task independence, ensure no overlapping file writes
```

### Debugging Checklist

Before launching parallel execution:

- [ ] Tasks are truly independent (no dependencies)
- [ ] No shared file writes across agents
- [ ] Each agent has clear, isolated scope
- [ ] Scratchpad structure defined for result aggregation
- [ ] Fallback plan for sequential execution
- [ ] Timeout limits appropriate for task complexity

---

## Token Usage & Cost Management

### ⚠️ Token Accumulation Warning

**Critical**: Parallel subagent execution can significantly increase token usage because **all subagent outputs are included in the main agent's context**.

### Token Cost Formula

```
Total Tokens = Base Context + Σ(Subagent Outputs)

Example with 5 parallel agents:
- Base context: 10,000 tokens
- Subagent 1 output: 5,000 tokens
- Subagent 2 output: 4,500 tokens
- Subagent 3 output: 6,000 tokens
- Subagent 4 output: 5,500 tokens
- Subagent 5 output: 4,000 tokens
Total: 35,000 tokens (3.5x base)
```

### Cost Optimization Strategies

#### Strategy 1: Constrain Subagent Output

```
Instruction to each subagent:
"Return only structured JSON results, no explanatory text.
Maximum output: 2000 tokens."

Result: 5 agents × 2000 tokens = 10,000 tokens (vs 25,000)
```

#### Strategy 2: Use Cheaper Models for Simple Tasks

```
Simple tasks (linting, formatting):
  Model: claude-3-haiku-20240307
  Cost: ~1/10th of opus

Complex tasks (assessment, fix implementation):
  Model: claude-opus-4-20250514
  Cost: Full price but necessary
```

#### Strategy 3: Sequential Batching for Large Outputs

```
Instead of 10 agents in parallel (10× output accumulation):
  Batch 1: 5 agents → Aggregate → Clear context
  Batch 2: 5 agents → Aggregate → Clear context
Result: 5× accumulation per batch (50% reduction)
```

#### Strategy 4: Scratchpad Offloading

```
Instead of returning full results in context:
1. Subagents write detailed results to scratchpad
2. Subagents return only summary (< 500 tokens)
3. Orchestrator reads scratchpad for full details

Context accumulation: 5 × 500 = 2,500 tokens (vs 25,000)
```

### Cost-Benefit Analysis

**When Parallel Execution Is Worth the Cost**:

- Time-sensitive operations (deployment, incident response)
- High-value workflows (release preparation, security audits)
- Large codebases where speed justifies cost

**When Sequential Is Better**:

- Budget-constrained environments
- Low-priority batch operations
- Tasks with large outputs per agent
- Learning/experimentation phases

### Monitoring Token Usage

Track these metrics:

- Tokens per subagent
- Total context accumulation
- Cost per parallel workflow
- Efficiency ratio (speedup / cost increase)

**Target Efficiency**: Speedup should exceed cost increase

```
Good: 5x speedup with 3x cost = 1.67 efficiency ratio
Poor: 2x speedup with 4x cost = 0.5 efficiency ratio
```

---

## Conclusion

Parallel subagent execution is a powerful capability that can dramatically improve workflow performance. Key takeaways:

1. **Single message = Parallel** - Multiple Task calls in one message
2. **Independent tasks only** - No shared state or dependencies
3. **Right-size granularity** - 5-30 minute tasks optimal
4. **Handle failures gracefully** - Expect some to fail
5. **Monitor resources** - Balance speed with cost
6. **Use scratchpads for coordination** - Maintain isolation while aggregating results
7. **Limited runtime monitoring** - Debug post-execution via scratchpads
8. **Watch token accumulation** - Outputs add up quickly in parallel

When used correctly, parallel execution can achieve **5-10x speedup** for batch operations, making the Linear TDD Workflow System highly efficient for large codebases and high-volume workflows.

---

## Quick Reference

### Checklist: Can I Parallelize This?

- [ ] Tasks are independent (no dependencies)
- [ ] No shared file writes
- [ ] Clear input/output boundaries
- [ ] Each task takes >5 minutes
- [ ] Total tasks ≤10 (or can batch)
- [ ] No sequential workflow requirements
- [ ] Failure of one task doesn't block others

If all checked: ✅ Good candidate for parallel execution

If any unchecked: ⚠️ Consider sequential or hybrid approach

---

**Last Updated**: 2025-10-01
**Related Docs**:

- [Agent Overview](AGENT-OVERVIEW.md)
- [STRATEGIST Agent](.claude/agents/strategist.md)
- [Workflow Patterns](WORKFLOWS.md)
