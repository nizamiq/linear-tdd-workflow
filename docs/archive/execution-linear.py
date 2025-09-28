# Next Actions Execution

## Core Philosophy
Every action must be tracked, visible, and reversible. Claude Code's TodoRead/TodoWrite tools are the single source of truth, with Linear as the external mirror for team visibility.

## Mandatory Configuration
```yaml
execution_mode: "strict_bidirectional"
todo_location: "~/.claude/todos/{uuid}/"
linear_sync: "continuous"
decision_log: "CLAUDE.md"  # In project root
failure_mode: "stop_and_report"
```

## THE ONLY WAY TO WORK

### Rule 1: No Action Without a Todo Entry
```python
# BEFORE doing ANYTHING:
todo = TodoRead()
if action not in todo.items:
    TodoWrite(action, status="pending", linear_id=None)
    raise Exception("Action not planned. Added to queue. Review before proceeding.")
```

### Rule 2: Todo Structure is Sacred
```markdown
## Todo Entry Format (NON-NEGOTIABLE)
ID: {uuid}
LINEAR_ID: {linear_issue_id or 'PENDING'}
TITLE: {verb} {target} {outcome}
STATUS: pending|active|blocked|done|failed
STARTED: {iso_timestamp or null}
COMPLETED: {iso_timestamp or null}
ACTUAL_TIME: {minutes or null}
BRANCH: {git_branch or null}
COMMITS: [{sha1}, {sha2}]
METRICS_BEFORE: {json}
METRICS_AFTER: {json}
DECISION_LOG: [{timestamp: decision}]
BLOCKERS: [{description: reason}]
```

## EXECUTION PROTOCOL

### Phase 0: Initialization (ALWAYS FIRST)
```python
def initialize_session():
    """
    NO EXCEPTIONS - This runs before ANY work begins
    """
    # 1. Read existing todos
    todos = TodoRead()
    
    # 2. Sync with Linear to catch external changes
    linear_issues = Linear:list_issues(
        assignee="me",
        state=["todo", "in_progress"]
    )
    
    # 3. Reconcile differences
    for issue in linear_issues:
        if issue.id not in todos.get_linear_ids():
            # New issue from Linear - add to todos
            TodoWrite({
                "id": generate_uuid(),
                "linear_id": issue.id,
                "title": issue.title,
                "status": "pending",
                "priority": issue.priority
            })
            print(f"📥 Imported from Linear: {issue.identifier}")
    
    # 4. Create session tracking
    session = {
        "id": generate_session_id(),
        "started": datetime.now(),
        "todo_snapshot": todos.snapshot(),
        "linear_sync_point": datetime.now()
    }
    
    # 5. Create CLAUDE.md if not exists
    if not exists("CLAUDE.md"):
        create_claude_md()
    
    return session
```

### Phase 1: Task Selection (OPINIONATED ORDER)
```python
def get_next_task():
    """
    STRICT PRIORITY ORDER - No discretion allowed
    """
    todos = TodoRead()
    
    # Priority hierarchy (NO DEVIATION)
    priority_order = [
        lambda t: t.status == "blocked" and can_unblock(t),  # Unblock first
        lambda t: t.linear_priority == "urgent",              # P0/Urgent
        lambda t: t.is_security_issue,                        # Security always high
        lambda t: t.is_breaking_prod,                         # Production issues
        lambda t: t.blocks_others,                            # Unblock team
        lambda t: t.effort == "XS" and t.priority == "high",  # Quick wins
        lambda t: t.status == "active",                       # Finish started work
        lambda t: t.linear_priority == "high",                # P1/High
        lambda t: t.is_tech_debt and t.roi > 2.0,            # High ROI debt
        lambda t: True                                        # Everything else
    ]
    
    for criteria in priority_order:
        matching = [t for t in todos.items if criteria(t) and t.status != "done"]
        if matching:
            selected = matching[0]
            print(f"🎯 Selected: {selected.title}")
            print(f"   Reason: {get_selection_reason(criteria)}")
            return selected
    
    return None  # Nothing to do
```

### Phase 2: Execution Wrapper (MANDATORY)
```python
def execute_task(task_id):
    """
    EVERY task goes through this - NO DIRECT EXECUTION ALLOWED
    """
    # Pre-execution
    task = TodoRead().get(task_id)
    if not task:
        raise Exception(f"Task {task_id} not in todo list. STOP.")
    
    # Update todo - STARTING
    TodoWrite(task_id, {
        "status": "active",
        "started": datetime.now(),
        "branch": f"{task.linear_id}-{slugify(task.title)}"
    })
    
    # Update Linear - STARTING
    if task.linear_id:
        Linear:update_issue(
            id=task.linear_id,
            state="in_progress"
        )
        Linear:create_comment(
            issueId=task.linear_id,
            body=f"🤖 Claude Code starting work at {datetime.now()}"
        )
    
    # Capture before state
    metrics_before = capture_all_metrics()
    TodoWrite(task_id, {"metrics_before": metrics_before})
    
    try:
        # Create branch
        git_checkout_b(task.branch)
        
        # EXECUTE THE ACTUAL WORK
        result = do_work(task)
        
        # Test immediately
        test_result = run_tests()
        if not test_result.passed:
            raise TestFailure(test_result)
        
        # Commit with Linear reference
        commit_sha = git_commit(
            f"[{task.linear_id or 'LOCAL'}] {task.title}\n\n"
            f"Linear: {task.linear_id or 'No Linear issue'}"
        )
        
        # Capture after state
        metrics_after = capture_all_metrics()
        
        # Update todo - COMPLETED
        TodoWrite(task_id, {
            "status": "done",
            "completed": datetime.now(),
            "actual_time": calculate_duration(task.started),
            "commits": append(commit_sha),
            "metrics_after": metrics_after
        })
        
        # Update Linear - COMPLETED
        if task.linear_id:
            Linear:update_issue(
                id=task.linear_id,
                state="done"
            )
            Linear:create_comment(
                issueId=task.linear_id,
                body=format_completion_report(result, metrics_before, metrics_after)
            )
        
        # Update CLAUDE.md
        append_to_claude_md(f"""
        ## ✅ {task.title}
        - Completed: {datetime.now()}
        - Duration: {task.actual_time}min
        - Commit: {commit_sha}
        - Metrics Impact: {calculate_impact(metrics_before, metrics_after)}
        """)
        
        return result
        
    except Exception as e:
        # FAILURE HANDLING
        handle_task_failure(task_id, e)
        raise  # Re-raise after handling
```

### Phase 3: Continuous Sync (EVERY 5 ACTIONS)
```python
def sync_checkpoint():
    """
    MANDATORY after every 5 completed tasks or 30 minutes
    """
    todos = TodoRead()
    
    # Push to Linear
    for task in todos.get_modified_since_last_sync():
        if task.linear_id:
            Linear:update_issue(
                id=task.linear_id,
                state=map_todo_status_to_linear(task.status)
            )
    
    # Pull from Linear
    linear_updates = Linear:list_issues(
        assignee="me",
        updatedSince=last_sync_time
    )
    
    for update in linear_updates:
        if update.id in todos.get_linear_ids():
            todo = todos.get_by_linear_id(update.id)
            if update.state == "canceled":
                TodoWrite(todo.id, {"status": "canceled"})
            elif update.priority != todo.linear_priority:
                TodoWrite(todo.id, {"linear_priority": update.priority})
    
    # Report progress
    create_progress_report()
```

## OPINIONATED WORKFLOW RULES

### 1. Work Batching
```python
# ALWAYS batch by type - context switching is expensive
BATCH_ORDER = [
    "security_fixes",      # Always first
    "breaking_bugs",       # Then fixes
    "quick_wins",          # Then easy value
    "feature_work",        # Then features
    "tech_debt",          # Then cleanup
    "documentation"        # Last
]

# Process ENTIRE batch before moving to next type
for batch_type in BATCH_ORDER:
    tasks = todos.filter(type=batch_type)
    for task in tasks:
        execute_task(task.id)
```

### 2. Decision Documentation
```python
# EVERY technical decision goes in CLAUDE.md
def document_decision(context, options, choice, rationale):
    """
    NO EXCEPTIONS - Every choice must be documented
    """
    decision = f"""
    ## Decision: {context}
    **Time**: {datetime.now()}
    **Options Considered**: {options}
    **Choice**: {choice}
    **Rationale**: {rationale}
    **Impact**: {assess_impact(choice)}
    """
    
    append_to_claude_md(decision)
    
    # Also track in todo if task-specific
    if current_task:
        TodoWrite(current_task.id, {
            "decision_log": append({
                "time": datetime.now(),
                "decision": choice
            })
        })
```

### 3. Failure Handling
```python
def handle_failure(task_id, error):
    """
    STOP IMMEDIATELY - Don't try to be clever
    """
    # Update todo
    TodoWrite(task_id, {
        "status": "blocked",
        "blockers": append({
            "error": str(error),
            "time": datetime.now(),
            "attempted_fixes": []
        })
    })
    
    # Update Linear
    if task.linear_id:
        Linear:update_issue(
            id=task.linear_id,
            state="blocked"
        )
        Linear:create_comment(
            issueId=task.linear_id,
            body=f"""
            ⚠️ BLOCKED
            
            Error: {error}
            Stack: {traceback}
            
            Attempted at: {datetime.now()}
            Working directory state preserved in branch: {task.branch}
            
            Human intervention required.
            """
        )
    
    # Create checkpoint
    git_stash_save(f"blocked-{task_id}")
    
    # STOP - Don't continue
    raise WorkflowBlocked(task_id, error)
```

### 4. Progress Reporting
```python
def report_progress():
    """
    AUTOMATICALLY every 5 tasks or 30 minutes
    """
    todos = TodoRead()
    stats = todos.calculate_stats()
    
    report = f"""
    # Progress Report - {datetime.now()}
    
    ## Completed This Session
    {format_completed_tasks(stats.completed)}
    
    ## Currently Active
    {stats.active.title if stats.active else "None"}
    
    ## Blocked Items
    {format_blocked_with_reasons(stats.blocked)}
    
    ## Velocity
    - Tasks/Hour: {stats.velocity}
    - Est. Completion: {stats.estimated_completion}
    
    ## Quality Impact
    - Coverage: {stats.coverage_delta:+.1f}%
    - Complexity: {stats.complexity_delta:+d}
    - Tech Debt: {stats.debt_delta:+.1f}h
    
    ## Next 5 Tasks
    {format_upcoming(todos.get_next(5))}
    """
    
    # Save locally
    append_to_claude_md(report)
    
    # Update Linear dashboard
    update_linear_dashboard(report)
    
    return report
```

## ENFORCEMENT MECHANISMS

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check if commit message references a todo or Linear issue
if ! grep -q "\[.*\]" "$1"; then
    echo "ERROR: Commit must reference [TODO_ID] or [LINEAR_ID]"
    exit 1
fi

# Verify todo status
todo_id=$(grep -o '\[.*\]' "$1")
if ! TodoRead --verify-active "$todo_id"; then
    echo "ERROR: Todo $todo_id is not in active status"
    exit 1
fi
```

### Continuous Validation
```python
# Runs in background during all work
def validation_loop():
    while True:
        todos = TodoRead()
        
        # Check for orphaned branches
        for branch in git_branches():
            if not todos.has_branch(branch):
                alert(f"Orphaned branch: {branch}")
        
        # Check for stale active tasks
        for task in todos.filter(status="active"):
            if age(task.started) > 2_hours:
                alert(f"Task active too long: {task.id}")
                TodoWrite(task.id, {"status": "blocked"})
        
        # Check Linear sync lag
        if time_since_last_sync() > 30_minutes:
            force_sync()
        
        sleep(5_minutes)
```

## START EXECUTION

```python
# THIS IS THE ONLY ENTRY POINT
def main():
    """
    The one and only way to start work
    """
    print("🚀 Claude Code Execution Engine")
    print("=" * 40)
    
    # Initialize (no options - it's mandatory)
    session = initialize_session()
    
    # Work until no more tasks
    while task := get_next_task():
        try:
            execute_task(task.id)
            
            # Checkpoint every 5 tasks
            if session.completed_count % 5 == 0:
                sync_checkpoint()
                
        except WorkflowBlocked as e:
            print(f"❌ Blocked: {e}")
            break  # STOP - don't try to continue
            
        except KeyboardInterrupt:
            print("⚠️ Interrupted - creating checkpoint...")
            create_checkpoint()
            break
    
    # Final report (always)
    create_final_report()
    
    print("✅ Execution complete")

# RUN IT
if __name__ == "__main__":
    main()
```

## NON-NEGOTIABLE RULES

1. **NEVER** execute code without a todo entry
2. **NEVER** skip the priority order
3. **NEVER** continue after a test failure
4. **NEVER** commit without a task reference
5. **NEVER** work longer than 2 hours on a single task
6. **ALWAYS** sync with Linear every 5 tasks
7. **ALWAYS** document decisions in CLAUDE.md
8. **ALWAYS** create branches with task IDs
9. **ALWAYS** capture metrics before and after
10. **ALWAYS** stop and report when blocked

This is THE WAY. No exceptions. No creativity. Just execution.

START NOW. 🚀
