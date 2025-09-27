# Linear Integration Principles

## Core Philosophy
Claude Code operates as an autonomous team member who proactively manages its work queue, maintains transparency through Linear, and self-organizes task execution while keeping human stakeholders informed.

## 1. Project Initialization Principles

### 1.1 Workspace Setup Protocol
```yaml
ON_PROJECT_START:
  1. Verify Linear connection and permissions
  2. Identify or create project in Linear
  3. Establish team context and cycle information
  4. Create "Claude-Code" label for self-assigned work
  5. Set up integration checkpoints
  
FIRST_ACTIONS:
  - Create meta-issue: "Project Setup and Architecture Planning"
  - Create discovery issue: "Codebase Analysis and Technical Debt Assessment"
  - Create tracking issue: "Claude Code Work Log and Decisions"
```

### 1.2 Self-Assignment Convention
```python
# Claude Code should create and assign issues to itself using:
Linear:create_issue(
    title="[CC] {task_description}",  # [CC] prefix for Claude Code tasks
    assignee="me",  # Self-assignment
    labels=["claude-code", "automated", {appropriate_type}],
    description="""
    ## Automated Task
    This task is being handled by Claude Code.
    
    ## Objective
    {clear_objective}
    
    ## Success Criteria
    - [ ] {measurable_outcome_1}
    - [ ] {measurable_outcome_2}
    
    ## Execution Log
    Starting: {timestamp}
    """
)
```

## 2. Task Management Principles

### 2.1 Proactive Task Creation
```markdown
WHEN_TO_CREATE_ISSUES:
- Before starting any significant work (>15 min estimated)
- When discovering technical debt or bugs
- When identifying missing features from analysis
- When planning refactoring or improvements
- For documentation needs

GRANULARITY_RULES:
- Break down work into 1-4 hour chunks
- Create sub-tasks for complex features
- Separate research/spike from implementation
- Distinguish setup from execution tasks
```

### 2.2 Real-time Status Updates
```python
# Update issue status as work progresses
WORKFLOW_STATES = {
    "discovered": "backlog",      # Just identified
    "analyzing": "in_progress",   # Currently investigating
    "implementing": "in_progress", # Actively coding
    "testing": "in_review",        # Running tests
    "blocked": "blocked",          # Waiting on input
    "complete": "done"             # Finished
}

# Add progress comments every significant milestone
Linear:create_comment(
    issueId=current_issue_id,
    body=f"""
    ### Progress Update - {timestamp}
    
    **Status**: {status}
    **Completed**:
    - ✅ {completed_item_1}
    - ✅ {completed_item_2}
    
    **In Progress**:
    - 🔄 {current_work}
    
    **Next Steps**:
    - ⏭️ {next_action}
    
    **Blockers**: {blockers or "None"}
    **Code Changes**: {files_modified}
    """
)
```

### 2.3 Decision Documentation
```markdown
CREATE_DECISION_ISSUES:
For significant technical decisions, create a dedicated issue:

Title: "[Decision] {Technology/Approach Choice}"
Description:
## Context
{problem_requiring_decision}

## Options Considered
1. **Option A**: {description}
   - Pros: {benefits}
   - Cons: {drawbacks}
   
2. **Option B**: {description}
   - Pros: {benefits}
   - Cons: {drawbacks}

## Recommendation
{chosen_option} because {reasoning}

## Implementation Impact
- Timeline: {impact}
- Dependencies: {affected_components}
- Risks: {potential_issues}

Labels: ["claude-code", "decision", "architecture"]
```

## 3. Work Organization Principles

### 3.1 Daily Standup Protocol
```python
def daily_standup():
    """
    Claude Code's automated daily status update
    """
    yesterday_issues = Linear:list_issues(
        assignee="me",
        updatedAt="-P1D",  # Past day
        state="done"
    )
    
    today_issues = Linear:list_issues(
        assignee="me",
        state="in_progress"
    )
    
    blocked_issues = Linear:list_issues(
        assignee="me",
        state="blocked"
    )
    
    # Create daily standup comment in project
    Linear:create_comment(
        issueId=project_tracking_issue_id,
        body=f"""
        ## Daily Standup - {today_date}
        
        ### ✅ Completed Yesterday
        {format_issue_list(yesterday_issues)}
        
        ### 🎯 Today's Focus
        {format_issue_list(today_issues)}
        
        ### 🚫 Blockers
        {format_issue_list(blocked_issues)}
        
        ### 📊 Metrics
        - Issues completed: {len(yesterday_issues)}
        - Story points delivered: {sum_story_points(yesterday_issues)}
        - Current WIP: {len(today_issues)}
        """
    )
```

### 3.2 Work In Progress Limits
```yaml
WIP_RULES:
  max_concurrent_issues: 3
  max_in_progress_points: 13
  
BEFORE_STARTING_NEW_WORK:
  - Check current WIP count
  - If at limit, complete or park existing work
  - Update Linear status before context switching
  - Add checkpoint comment to paused work
```

### 3.3 Context Preservation
```markdown
WHEN_SWITCHING_TASKS:
Create a checkpoint comment with:

### Context Checkpoint - {timestamp}
**Current State**: {what_was_completed}
**Local Changes**: {uncommitted_files}
**Next Action**: {what_to_do_when_resuming}
**Dependencies**: {waiting_on_what}
**Branch**: {git_branch_name}
**Key Decisions**: {important_context}
**Resume Command**: `{exact_command_to_continue}`
```

## 4. Code-to-Issue Synchronization

### 4.1 Commit Message Standards
```bash
# Link all commits to Linear issues
git commit -m "[{LINEAR_ISSUE_ID}] {verb} {what_changed}

{optional_details}

Linear: {LINEAR_ISSUE_ID}"

# Examples:
git commit -m "[ENG-123] Implement user authentication

- Added JWT token generation
- Created login/logout endpoints
- Added password hashing

Linear: ENG-123"
```

### 4.2 Pull Request Integration
```markdown
PR_DESCRIPTION_TEMPLATE:
## Linear Issue
Closes #{LINEAR_ISSUE_ID}

## Changes
{list_of_changes}

## Testing
{how_to_test}

## Checklist
- [ ] Code follows project standards
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Linear issue updated with PR link
```

### 4.3 Code Progress Tracking
```python
# Update Linear when significant code milestones reached
def track_code_progress(issue_id, milestone):
    milestones = {
        "scaffold": "Created project structure",
        "models": "Defined data models",
        "api": "Implemented API endpoints",
        "frontend": "Built UI components",
        "tests": "Added test coverage",
        "docs": "Updated documentation"
    }
    
    Linear:create_comment(
        issueId=issue_id,
        body=f"""
        ### 🎯 Milestone Reached: {milestone}
        {milestones[milestone]}
        
        Files affected:
        {list_changed_files()}
        
        Progress: {calculate_progress()}%
        """
    )
```

## 5. Intelligence Principles

### 5.1 Proactive Issue Discovery
```python
def scan_for_issues():
    """
    Regularly scan codebase and create issues for discovered problems
    """
    findings = {
        "security": scan_security_vulnerabilities(),
        "performance": identify_performance_bottlenecks(),
        "debt": find_technical_debt(),
        "bugs": detect_potential_bugs(),
        "improvements": suggest_improvements()
    }
    
    for category, items in findings.items():
        for item in items:
            # Check if issue already exists
            existing = Linear:list_issues(query=item['title'])
            if not existing:
                Linear:create_issue(
                    title=f"[CC-{category}] {item['title']}",
                    description=f"""
                    ## Automated Discovery
                    Found by Claude Code during routine scanning.
                    
                    ## Issue Details
                    {item['description']}
                    
                    ## Location
                    {item['file_location']}
                    
                    ## Suggested Fix
                    {item['suggestion']}
                    
                    ## Priority Reasoning
                    {item['priority_rationale']}
                    """,
                    labels=["claude-code", category, "discovered"],
                    priority=item['priority']
                )
```

### 5.2 Dependency Management
```python
def track_dependencies():
    """
    Proactively manage and update dependency issues
    """
    # Check for blocking dependencies
    my_blocked_issues = Linear:list_issues(
        assignee="me",
        state="blocked"
    )
    
    for issue in my_blocked_issues:
        # Check if blocker is resolved
        if check_if_unblocked(issue):
            Linear:update_issue(
                id=issue.id,
                state="todo"
            )
            Linear:create_comment(
                issueId=issue.id,
                body="♻️ Automatically unblocked - dependency resolved"
            )
```

### 5.3 Sprint/Cycle Awareness
```python
def manage_cycle_work():
    """
    Be aware of sprint/cycle boundaries and manage work accordingly
    """
    current_cycle = Linear:list_cycles(type="current")[0]
    days_remaining = calculate_days_remaining(current_cycle.endDate)
    
    if days_remaining < 2:
        # Near end of cycle - focus on completion
        in_progress = Linear:list_issues(
            assignee="me",
            cycle=current_cycle.id,
            state="in_progress"
        )
        
        for issue in in_progress:
            if estimate_completion_time(issue) > days_remaining:
                # Won't complete in time - move to next cycle
                next_cycle = Linear:list_cycles(type="next")[0]
                Linear:update_issue(
                    id=issue.id,
                    cycle=next_cycle.id
                )
                Linear:create_comment(
                    issueId=issue.id,
                    body=f"""
                    ⏭️ Automatically moved to next cycle
                    Reason: Insufficient time remaining ({days_remaining} days)
                    Estimated time needed: {estimate_completion_time(issue)} days
                    """
                )
```

## 6. Communication Principles

### 6.1 Human Handoff Protocol
```markdown
WHEN_HUMAN_INPUT_NEEDED:
1. Update issue state to "blocked"
2. Create detailed comment with:
   - What is needed
   - Why it's needed
   - What was tried
   - Suggested solutions
   - Impact of delay
3. Tag relevant team members
4. Set reminder for follow-up

TEMPLATE:
### 🤚 Human Input Required

**Blocking Issue**: {specific_problem}
**What I Need**: {specific_request}
**Why**: {context_and_importance}
**What I've Tried**: 
- {attempt_1}
- {attempt_2}

**Suggested Options**:
1. {option_1}
2. {option_2}

**Impact if Delayed**: {consequences}
**Can Continue With**: {other_work_available}

@{team_member} - Please advise when convenient.
```

### 6.2 Error Recovery Documentation
```python
def document_error_recovery(issue_id, error):
    """
    Document how errors were handled for future reference
    """
    Linear:create_comment(
        issueId=issue_id,
        body=f"""
        ### ⚠️ Error Encountered and Resolved
        
        **Error**: {error.message}
        **Type**: {error.type}
        **Occurred At**: {timestamp}
        
        **Root Cause**: {analyze_root_cause(error)}
        
        **Resolution Steps**:
        1. {step_1}
        2. {step_2}
        
        **Prevention**: {how_to_prevent_recurrence}
        
        **Time Impact**: {time_spent_resolving} minutes
        """
    )
```

## 7. Self-Improvement Principles

### 7.1 Retrospective Creation
```markdown
AFTER_COMPLETING_MAJOR_FEATURE:
Create retrospective issue:

Title: "[Retro] {Feature Name} Implementation"
Description:
## What Went Well
- {success_1}
- {success_2}

## What Could Be Improved
- {improvement_1}
- {improvement_2}

## Lessons Learned
- {lesson_1}
- {lesson_2}

## Action Items
- [ ] {future_improvement_1}
- [ ] {future_improvement_2}

## Metrics
- Estimated: {original_estimate} points
- Actual: {actual_time} 
- Velocity: {points_per_day}
- Rework: {percentage_rework}
```

### 7.2 Pattern Recognition
```python
def identify_patterns():
    """
    Learn from past issues to prevent future ones
    """
    recent_bugs = Linear:list_issues(
        labels=["bug"],
        createdAt="-P30D"  # Last 30 days
    )
    
    patterns = analyze_common_patterns(recent_bugs)
    
    if patterns:
        Linear:create_issue(
            title="[CC-Learning] Identified Pattern: {pattern_name}",
            description=f"""
            ## Pattern Detected
            {pattern_description}
            
            ## Occurrences
            {list_similar_issues}
            
            ## Proposed Prevention
            {prevention_strategy}
            
            ## Implementation Plan
            {how_to_implement_prevention}
            """,
            labels=["claude-code", "improvement", "pattern"]
        )
```

## 8. Execution Priorities

### 8.1 Task Prioritization Algorithm
```yaml
PRIORITY_MATRIX:
  URGENT_IMPORTANT:
    - Security vulnerabilities
    - Production bugs
    - Blocking issues for team
    - Customer-reported issues
  
  NOT_URGENT_IMPORTANT:
    - Feature development
    - Technical debt
    - Documentation
    - Test coverage
  
  URGENT_NOT_IMPORTANT:
    - Quick fixes
    - Minor UI issues
    - Non-blocking requests
  
  NOT_URGENT_NOT_IMPORTANT:
    - Nice-to-have features
    - Cosmetic improvements
    - Experimental features

SELECTION_CRITERIA:
  1. Blocked team members (highest)
  2. Security/critical bugs
  3. MVP features
  4. Current cycle commitments
  5. Technical debt (if time allows)
  6. Improvements (lowest)
```

## Summary Checklist for Claude Code

### Starting a Project
- [ ] Create project in Linear if needed
- [ ] Set up Claude Code label and tracking issue
- [ ] Create initial discovery and setup tasks
- [ ] Establish daily standup routine

### During Development
- [ ] Create issue before starting work
- [ ] Update status when switching states
- [ ] Add progress comments at milestones
- [ ] Document decisions in Linear
- [ ] Link commits to issues
- [ ] Respect WIP limits

### On Completion
- [ ] Mark issues as done
- [ ] Document lessons learned
- [ ] Create follow-up issues if needed
- [ ] Update project tracking metrics

### Continuous
- [ ] Scan for technical debt
- [ ] Proactively create improvement issues
- [ ] Maintain cycle awareness
- [ ] Document blockers immediately
- [ ] Keep humans informed of progress
