# Formal Action Plan Generation from Clean Code Assessment
## Objective
Transform all assessment findings into a formal, executable action plan with prioritized tasks, clear definitions of done, effort estimates, and direct Linear cycle integration for systematic issue resolution.

## Execution Parameters
```yaml
plan_config:
  project_name: "[PROJECT_NAME]"
  linear_project: "[LINEAR_PROJECT_NAME]"
  team_name: "[TEAM_NAME]"
  team_velocity: "[POINTS_PER_CYCLE]"
  cycle_length: "[WEEKS]" # Linear default is 2 weeks
  
prioritization:
  method: "risk_impact_effort"
  risk_weight: 0.4
  impact_weight: 0.4
  effort_weight: 0.2
  
linear_planning:
  auto_assign_cycles: true
  respect_cycle_capacity: true
  create_project_milestones: true
  use_triage_for_backlog: true
  flag_quick_wins: true
```

## Phase 1: Linear Cycle Management

### 1.1 Cycle Analysis and Setup
```python
def analyze_linear_cycles():
    """
    Analyze current and upcoming Linear cycles for planning
    """
    # Get team information
    team = Linear:get_team(query=team_name)
    
    # Get cycle information
    current_cycle = Linear:list_cycles(teamId=team.id, type="current")[0]
    next_cycle = Linear:list_cycles(teamId=team.id, type="next")[0]
    
    # Analyze cycle capacity
    cycle_analysis = {
        "current_cycle": {
            "id": current_cycle.id,
            "name": current_cycle.name,
            "start_date": current_cycle.startDate,
            "end_date": current_cycle.endDate,
            "days_remaining": calculate_working_days_remaining(current_cycle.endDate),
            "committed_points": get_committed_points(current_cycle.id),
            "available_capacity": team_velocity - get_committed_points(current_cycle.id),
            "can_add_work": True if days_remaining > 3 else False
        },
        "next_cycle": {
            "id": next_cycle.id,
            "name": next_cycle.name,
            "start_date": next_cycle.startDate,
            "end_date": next_cycle.endDate,
            "available_capacity": team_velocity,
            "planned_points": 0
        },
        "future_cycles": generate_future_cycle_projections(team_velocity, cycle_length)
    }
    
    return cycle_analysis
```

### 1.2 Create Project Roadmap in Linear
```python
def create_linear_roadmap():
    """
    Create project milestones that align with Linear cycles
    """
    milestones = [
        {
            "name": "Security & Critical Fixes",
            "description": "Address all high-risk security vulnerabilities and critical bugs",
            "targetDate": current_cycle.endDate,
            "sortOrder": 1
        },
        {
            "name": "Performance Optimization",
            "description": "Achieve performance targets and optimize bottlenecks",
            "targetDate": add_cycles(current_cycle.endDate, 1),
            "sortOrder": 2
        },
        {
            "name": "Test Coverage Goals",
            "description": "Reach 80% coverage with comprehensive E2E suite",
            "targetDate": add_cycles(current_cycle.endDate, 2),
            "sortOrder": 3
        },
        {
            "name": "Technical Debt Reduction",
            "description": "Refactor complex modules and eliminate duplication",
            "targetDate": add_cycles(current_cycle.endDate, 3),
            "sortOrder": 4
        }
    ]
    
    # Create project if needed
    project = Linear:create_project(
        name=f"Clean Code Improvements - {project_name}",
        description="Systematic improvement of code quality based on assessment findings",
        team=team_name,
        state="started",
        targetDate=add_cycles(current_cycle.endDate, 4)
    )
    
    return project
```

## Phase 2: Task Creation with Linear Integration

### 2.1 Linear-Optimized Task Structure
```python
def create_linear_task(finding):
    """
    Create Linear issue with all proper metadata
    """
    task = {
        "team": team_name,
        "title": generate_linear_title(finding),
        "description": generate_linear_description(finding),
        "priority": map_to_linear_priority(finding),  # 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low
        "estimate": calculate_linear_points(finding),
        "labels": generate_linear_labels(finding),
        "project": project_name,
        "state": determine_initial_state(finding),
        "cycle": assign_to_cycle(finding),
        "assignee": None,  # Will be assigned during cycle planning
        "links": gather_reference_links(finding),
        "parentId": find_parent_epic(finding) if has_parent else None
    }
    
    # Create the issue
    issue = Linear:create_issue(**task)
    
    # Add detailed implementation plan as comment
    Linear:create_comment(
        issueId=issue.id,
        body=generate_implementation_comment(finding)
    )
    
    return issue
```

### 2.2 Linear State Management
```python
def determine_initial_state(finding):
    """
    Set appropriate Linear workflow state
    """
    if finding.is_blocked:
        return "blocked"
    elif finding.needs_triage:
        return "triage"
    elif finding.is_ready:
        return "backlog"
    elif finding.needs_design:
        return "needs-design"
    else:
        return "backlog"
```

### 2.3 Cycle Assignment Logic
```python
def assign_to_cycle(finding):
    """
    Intelligently assign findings to Linear cycles
    """
    cycles = analyze_linear_cycles()
    
    if finding.priority == "critical":
        # Try current cycle if capacity exists
        if cycles["current_cycle"]["available_capacity"] >= finding.estimate:
            return cycles["current_cycle"]["id"]
        else:
            return cycles["next_cycle"]["id"]
    
    elif finding.priority == "high":
        # Target next cycle
        return cycles["next_cycle"]["id"]
    
    elif finding.is_quick_win:
        # Quick wins go to current cycle if space available
        if cycles["current_cycle"]["available_capacity"] >= finding.estimate:
            return cycles["current_cycle"]["id"]
    
    # Medium and low priority go to backlog (no cycle)
    return None
```

## Phase 3: Structured Action Plan with Linear Cycles

### 3.1 Cycle-Based Action Plan
```python
def generate_cycle_based_action_plan():
    """
    Create action plan organized by Linear cycles
    """
    plan = f"""
# Formal Action Plan - {project_name}
**Generated**: {datetime.now().isoformat()}
**Linear Project**: [{project.name}]({project.url})
**Team**: {team_name}
**Team Velocity**: {team_velocity} points per cycle

## Executive Summary
{executive_summary}

## Cycle Allocation Overview
| Cycle | Theme | Points | Issues | Status |
|-------|-------|--------|--------|--------|
| {current_cycle.name} | Critical Fixes | {current_points} | {current_issues} | In Progress |
| {next_cycle.name} | Performance & Stability | {next_points} | {next_issues} | Planned |
| Cycle +2 | Test Coverage | {cycle2_points} | {cycle2_issues} | Projected |
| Cycle +3 | Tech Debt | {cycle3_points} | {cycle3_issues} | Projected |
| Backlog | Future Improvements | {backlog_points} | {backlog_issues} | Triage |

---

# CURRENT CYCLE: {current_cycle.name}
**Dates**: {current_cycle.startDate} - {current_cycle.endDate}
**Focus**: Critical Security Vulnerabilities & Production Bugs
**Capacity**: {team_velocity} points | **Allocated**: {current_allocated} points

## High Priority Tasks for Current Cycle

{for task in current_cycle_tasks:}
### 🔴 [{task.identifier}] {task.title}

**Linear Issue**: [{task.identifier}]({task.url})
**Priority**: Urgent (P{task.priority})
**Estimate**: {task.estimate} points
**Labels**: {', '.join(task.labels)}
**State**: {task.state}

#### Task Description
{task.description}

#### Implementation Approach
{task.implementation_approach}

#### Definition of Done
{for criterion in task.done_criteria:}
- [ ] {criterion}

#### Quick Actions
```bash
# Create branch
git checkout -b {task.identifier}-{slugify(task.title)}

# Link to Linear
git commit -m "[{task.identifier}] Initial commit

Linear: {task.identifier}"
```

---

# NEXT CYCLE: {next_cycle.name}
**Dates**: {next_cycle.startDate} - {next_cycle.endDate}
**Focus**: Performance Optimization & System Stability
**Planned Capacity**: {team_velocity} points | **Allocated**: {next_allocated} points

{for task in next_cycle_tasks:}
### 🟡 [{task.identifier}] {task.title}

**Linear Issue**: [{task.identifier}]({task.url})
**Priority**: High (P{task.priority})
**Estimate**: {task.estimate} points
**Labels**: {', '.join(task.labels)}

#### Task Description
{task.description}

#### Definition of Done
{for criterion in task.done_criteria:}
- [ ] {criterion}

---

# BACKLOG (Triage Required)
**Review During**: Cycle planning sessions
**Total Items**: {backlog_count}
**Total Points**: {backlog_points}

## Quick Wins (< 2 points each)
*Consider pulling into cycle if capacity becomes available*

{for task in quick_wins:}
- **[{task.identifier}]** {task.title} ({task.estimate} points) - {task.benefit}

## Medium Priority Items
{for task in medium_priority_backlog:}
- **[{task.identifier}]** {task.title} ({task.estimate} points)

## Low Priority Items
{for task in low_priority_backlog:}
- **[{task.identifier}]** {task.title} ({task.estimate} points)
"""
    return plan
```

### 3.2 Linear-Specific Task Templates

#### High Priority Security Task
```python
security_task_template = {
    "title": "[Security] Patch {vulnerability_name} in {component}",
    "description": """
## Security Vulnerability Details
- **CVE**: {cve_id}
- **CVSS Score**: {cvss_score}
- **Severity**: {severity}
- **Component**: {affected_component}
- **Discovered**: {discovery_date}

## Impact Assessment
{impact_description}

## Remediation Steps
1. {step_1}
2. {step_2}
3. {step_3}

## Verification
- [ ] Dependency updated to safe version
- [ ] Security scan shows vulnerability resolved
- [ ] No regression in functionality
- [ ] All tests passing

## References
- [CVE Details]({cve_url})
- [Fix Documentation]({fix_docs})
""",
    "priority": 1,  # Urgent
    "labels": ["security", "critical", "cca"],
    "state": "todo",
    "cycle": current_cycle_id
}
```

#### Test Coverage Task
```python
test_coverage_template = {
    "title": "Add {test_type} tests for {module} to reach {target}% coverage",
    "description": """
## Current State
- **Module**: `{module_path}`
- **Current Coverage**: {current_coverage}%
- **Target Coverage**: {target_coverage}%
- **Gap**: {coverage_gap}%

## Test Requirements

### Unit Tests Needed
{list_uncovered_functions}

### Test Scenarios
{list_test_scenarios}

## Implementation Plan
1. Create test file: `{test_file_path}`
2. Mock dependencies: {dependencies_to_mock}
3. Write tests for happy paths
4. Add edge case tests
5. Add error scenario tests

## Definition of Done
- [ ] Coverage for {module} ≥ {target_coverage}%
- [ ] All tests passing in CI
- [ ] No flaky tests (verified with 10 runs)
- [ ] Tests follow team conventions
- [ ] Tests are properly isolated

## Example Test Structure
```javascript
{example_test_code}
```
""",
    "priority": 2,  # High
    "labels": ["testing", "coverage", "cca"],
    "estimate": estimate_test_effort(module),
    "project": project_name
}
```

## Phase 4: Linear Automation and Tracking

### 4.1 Cycle Progress Tracking
```python
def create_cycle_tracker():
    """
    Create tracking issue for cycle progress
    """
    tracker_issue = Linear:create_issue(
        team=team_name,
        title=f"[CCA Tracker] Action Plan Progress - {current_cycle.name}",
        description=f"""
        ## 📊 Action Plan Cycle Tracking
        
        ### Current Cycle: {current_cycle.name}
        **Progress**: {calculate_cycle_progress()}%
        **Health**: {determine_cycle_health()}
        
        ### Burndown
        | Day | Remaining Points | Completed | At Risk |
        |-----|-----------------|-----------|----------|
        {generate_burndown_table()}
        
        ### Issue Status
        - ✅ Completed: {completed_issues}
        - 🔄 In Progress: {in_progress_issues}
        - 📋 Todo: {todo_issues}
        - 🚫 Blocked: {blocked_issues}
        
        ### Key Metrics This Cycle
        | Metric | Start | Current | Target | Trend |
        |--------|-------|---------|--------|--------|
        | Coverage | {start_coverage}% | {current_coverage}% | {target_coverage}% | {trend} |
        | Complexity | {start_complexity} | {current_complexity} | <10 | {trend} |
        | Security Issues | {start_security} | {current_security} | 0 | {trend} |
        
        ### Daily Standup Notes
        {generate_standup_template()}
        
        ### Risks & Blockers
        {list_cycle_risks()}
        
        ### Next Cycle Preview
        - Planned Issues: {next_cycle_issue_count}
        - Estimated Points: {next_cycle_points}
        - Available Capacity: {next_cycle_capacity}
        """,
        labels=["cca", "tracking", "cycle-management"],
        cycle=current_cycle.id,
        state="in_progress"
    )
    
    return tracker_issue
```

### 4.2 Linear Views and Filters
```python
def setup_linear_views():
    """
    Create helpful Linear views for the action plan
    """
    views = {
        "current_cycle_cca": {
            "name": "CCA - Current Cycle",
            "filters": {
                "cycle": current_cycle.id,
                "labels": ["cca"],
                "state": ["todo", "in_progress", "in_review"]
            },
            "groupBy": "priority",
            "orderBy": "priority"
        },
        "cca_blocked": {
            "name": "CCA - Blocked Items",
            "filters": {
                "labels": ["cca"],
                "state": ["blocked"]
            },
            "groupBy": "assignee"
        },
        "cca_quick_wins": {
            "name": "CCA - Quick Wins",
            "filters": {
                "labels": ["cca", "quick-win"],
                "estimate": {"lte": 2}
            },
            "orderBy": "estimate"
        },
        "cca_backlog": {
            "name": "CCA - Backlog",
            "filters": {
                "labels": ["cca"],
                "state": ["backlog", "triage"],
                "cycle": None
            },
            "groupBy": "priority"
        }
    }
    
    # Note: Linear views are created in UI, but we can document them
    return f"""
    ## Recommended Linear Views
    
    Create these views in Linear for easy tracking:
    
    1. **Current Cycle CCA**: All CCA items in current cycle
    2. **Blocked Items**: Items needing attention
    3. **Quick Wins**: Low-effort, high-value items
    4. **CCA Backlog**: Future work to be triaged
    """
```

### 4.3 Cycle Completion Criteria
```python
def define_cycle_success_criteria():
    """
    Define what success looks like for each cycle
    """
    cycle_goals = {
        "current_cycle": {
            "must_have": [
                "Zero critical security vulnerabilities",
                "All P0 bugs fixed",
                "Security scanning enabled in CI"
            ],
            "should_have": [
                "Initial performance benchmarks established",
                "Test framework configured"
            ],
            "success_metrics": {
                "security_issues": 0,
                "p0_bugs": 0,
                "ci_security": True
            }
        },
        "next_cycle": {
            "must_have": [
                "P95 latency < 300ms",
                "Memory leaks fixed",
                "Database queries optimized"
            ],
            "should_have": [
                "API response caching implemented",
                "Load testing completed"
            ],
            "success_metrics": {
                "p95_latency": 300,
                "memory_stable": True,
                "slow_queries": 0
            }
        }
    }
    
    for cycle_name, goals in cycle_goals.items():
        Linear:create_issue(
            team=team_name,
            title=f"[Cycle Goals] {cycle_name} - Success Criteria",
            description=format_cycle_goals(goals),
            labels=["cycle-goals", "cca"],
            cycle=get_cycle_id(cycle_name)
        )
```

## Phase 5: Team Integration

### 5.1 Linear Team Workflow Integration
```python
def integrate_with_team_workflow():
    """
    Ensure CCA tasks integrate with existing team processes
    """
    # Add CCA items to team's triage process
    triage_items = Linear:list_issues(
        team=team_name,
        state="triage",
        labels=["cca"]
    )
    
    for item in triage_items:
        Linear:update_issue(
            id=item.id,
            labels=item.labels + ["needs-estimation", "needs-assignment"]
        )
    
    # Create team notification
    Linear:create_issue(
        team=team_name,
        title="[Team] Clean Code Assessment Action Items Ready for Planning",
        description=f"""
        ## Clean Code Assessment Complete
        
        The automated assessment has identified {total_issues} improvement opportunities.
        
        ### For This Cycle
        - {current_cycle_count} critical items added to current cycle
        - {current_cycle_points} points allocated
        - Remaining capacity: {remaining_capacity} points
        
        ### For Next Cycle
        - {next_cycle_count} items staged for next cycle
        - {next_cycle_points} points planned
        
        ### Backlog
        - {backlog_count} items in backlog for future cycles
        
        ### Action Required
        1. Review items in [CCA - Current Cycle view]({view_url})
        2. Assign owners to unassigned items
        3. Adjust estimates if needed
        4. Flag any blockers
        
        ### Resources
        - [Full Action Plan]({action_plan_url})
        - [Implementation Guides]({guides_url})
        - [Success Metrics]({metrics_url})
        """,
        priority=1,
        assignee="team_lead"
    )
```

### 5.2 Cycle Planning Integration
```python
def generate_cycle_planning_checklist():
    """
    Create checklist for cycle planning meetings
    """
    return f"""
    ## Cycle Planning Checklist - CCA Items
    
    ### Pre-Planning
    - [ ] Review CCA items in triage
    - [ ] Verify estimates are accurate
    - [ ] Check dependencies between items
    - [ ] Identify required expertise
    
    ### During Planning
    - [ ] Discuss high-priority CCA items first
    - [ ] Balance CCA work with feature work (aim for 20-30% capacity)
    - [ ] Assign owners based on expertise
    - [ ] Identify pairing opportunities
    
    ### Post-Planning
    - [ ] All cycle items have assignees
    - [ ] Blocked items have resolution plans
    - [ ] Success criteria are clear
    - [ ] Team understands Definition of Done
    
    ### Quick Win Opportunities
    Consider pulling these in if capacity allows:
    {list_quick_wins_with_benefits()}
    """
```

## Final Execution Summary

```python
def execute_action_plan_generation():
    """
    Main execution flow for action plan generation
    """
    print("🚀 Starting Action Plan Generation...")
    
    # 1. Connect to Linear and analyze cycles
    print("📅 Analyzing Linear cycles...")
    cycles = analyze_linear_cycles()
    
    # 2. Create project and milestones
    print("🎯 Setting up Linear project...")
    project = create_linear_roadmap()
    
    # 3. Transform findings to Linear issues
    print("📝 Creating Linear issues...")
    issues_created = []
    for finding in assessment_findings:
        issue = create_linear_task(finding)
        issues_created.append(issue)
        print(f"  ✓ Created: [{issue.identifier}] {issue.title}")
    
    # 4. Generate action plan document
    print("📄 Generating action plan...")
    action_plan = generate_cycle_based_action_plan()
    
    # 5. Setup tracking
    print("📊 Setting up progress tracking...")
    tracker = create_cycle_tracker()
    
    # 6. Create team notifications
    print("💬 Notifying team...")
    integrate_with_team_workflow()
    
    print(f"""
    
    ✅ Action Plan Generation Complete!
    
    📈 Summary:
    - Total Issues Created: {len(issues_created)}
    - Current Cycle Items: {current_cycle_count} ({current_cycle_points} points)
    - Next Cycle Items: {next_cycle_count} ({next_cycle_points} points)
    - Backlog Items: {backlog_count} ({backlog_points} points)
    
    🔗 Linear Links:
    - Project: {project.url}
    - Current Cycle Board: {current_cycle_board_url}
    - Progress Tracker: {tracker.url}
    
    📚 Documentation:
    - Action Plan: {action_plan_url}
    - Implementation Guides: {guides_url}
    
    🎯 Next Steps:
    1. Review with team lead
    2. Adjust cycle allocations if needed
    3. Assign team members to issues
    4. Begin execution in current cycle
    """)
```

## Success Criteria

✅ All findings mapped to Linear issues
✅ Issues properly allocated to cycles respecting capacity
✅ Clear Definition of Done for each issue
✅ Proper Linear labels and metadata applied
✅ Project milestones align with cycle boundaries
✅ Quick wins identified and flagged
✅ Progress tracking established
✅ Team workflow integrated
✅ Cycle success criteria defined
✅ Action plan document generated
