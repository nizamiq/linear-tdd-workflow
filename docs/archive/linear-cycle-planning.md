# Linear Cycle Planning & Work Alignment

## Objective
Examine all existing Linear items, analyze project state, intelligently plan the next cycle based on capacity and priorities, then synchronize Claude Code's internal work queue to ensure perfect alignment before beginning execution.

## Execution Parameters
```yaml
planning_config:
  project_name: "meridian-prime"
  team_name: "Meridian Prime"
  analyze_depth: "comprehensive" # quick|standard|comprehensive
  planning_method: "value_complexity_risk" # value_complexity_risk|technical_dependencies|user_impact
  
cycle_config:
  respect_velocity: true
  velocity_buffer: 0.85 # Plan for 85% of capacity to handle unknowns
  include_carry_over: true # Account for incomplete items from current cycle
  balance_tech_debt: true # Ensure 20-30% allocation to tech debt
  
claude_code_config:
  create_work_log: true
  track_decisions: true
  update_frequency: "daily"
  self_assign: true
```

## Phase 1: Comprehensive Linear State Analysis

### 1.1 Current Cycle Health Check
```python
def analyze_current_cycle():
    """
    Deep analysis of current cycle to inform next cycle planning
    """
    print("🔍 Analyzing current cycle health...")
    
    team = Linear:get_team(query=team_name)
    current_cycle = Linear:list_cycles(teamId=team.id, type="current")[0]
    
    # Get all issues in current cycle
    current_issues = Linear:list_issues(
        team=team_name,
        cycle=current_cycle.id
    )
    
    analysis = {
        "cycle_info": {
            "name": current_cycle.name,
            "days_remaining": calculate_working_days(current_cycle.endDate),
            "progress_percentage": calculate_progress(current_issues)
        },
        "issue_analysis": {
            "total": len(current_issues),
            "completed": len([i for i in current_issues if i.state == "done"]),
            "in_progress": len([i for i in current_issues if i.state == "in_progress"]),
            "not_started": len([i for i in current_issues if i.state in ["todo", "backlog"]]),
            "blocked": len([i for i in current_issues if i.state == "blocked"]),
            "at_risk": identify_at_risk_issues(current_issues)
        },
        "velocity_analysis": {
            "planned_points": sum(i.estimate for i in current_issues if i.estimate),
            "completed_points": sum(i.estimate for i in current_issues if i.state == "done" and i.estimate),
            "likely_carryover": calculate_carryover(current_issues, days_remaining),
            "velocity_trend": calculate_velocity_trend(team.id)
        },
        "patterns": {
            "common_blockers": identify_blocker_patterns(current_issues),
            "estimation_accuracy": calculate_estimation_accuracy(current_issues),
            "completion_rate": calculate_completion_rate_by_category(current_issues)
        }
    }
    
    # Create insight comment
    Linear:create_comment(
        issueId=get_cycle_tracking_issue().id,
        body=f"""
        ### 📊 Current Cycle Analysis
        
        **Health Score**: {calculate_health_score(analysis)}/100
        
        **Key Insights**:
        - Velocity tracking at {analysis['velocity_analysis']['completed_points']}/{analysis['velocity_analysis']['planned_points']} points
        - {len(analysis['issue_analysis']['at_risk'])} issues at risk of not completing
        - Likely carryover: {analysis['velocity_analysis']['likely_carryover']} points
        
        **Patterns Detected**:
        {format_patterns(analysis['patterns'])}
        
        **Recommendations for Next Cycle**:
        {generate_recommendations(analysis)}
        """
    )
    
    return analysis
```

### 1.2 Backlog Deep Dive
```python
def analyze_backlog():
    """
    Comprehensive analysis of backlog items for cycle planning
    """
    print("📚 Analyzing backlog for next cycle candidates...")
    
    # Get all backlog items
    backlog_items = Linear:list_issues(
        team=team_name,
        project=project_name,
        state=["backlog", "todo"],
        cycle=None,  # Not assigned to any cycle
        limit=500
    )
    
    # Categorize and score items
    categorized_backlog = {
        "critical_bugs": [],
        "security_issues": [],
        "performance_issues": [],
        "user_features": [],
        "tech_debt": [],
        "improvements": [],
        "investigations": []
    }
    
    for item in backlog_items:
        # Calculate value score
        value_score = calculate_value_score(item)
        
        # Analyze dependencies
        dependencies = analyze_dependencies(item)
        
        # Estimate complexity beyond points
        complexity_analysis = {
            "technical_complexity": assess_technical_complexity(item),
            "integration_points": count_integration_points(item),
            "risk_level": assess_implementation_risk(item),
            "knowledge_gaps": identify_knowledge_gaps(item)
        }
        
        # Add enhanced metadata
        item.enhanced_metadata = {
            "value_score": value_score,
            "dependencies": dependencies,
            "complexity": complexity_analysis,
            "ready_for_development": check_ready_status(item),
            "estimated_duration": estimate_actual_duration(item),
            "ideal_assignee": suggest_assignee(item),
            "business_impact": calculate_business_impact(item)
        }
        
        # Categorize
        category = determine_category(item)
        categorized_backlog[category].append(item)
    
    # Sort each category by value score
    for category in categorized_backlog:
        categorized_backlog[category].sort(
            key=lambda x: x.enhanced_metadata["value_score"], 
            reverse=True
        )
    
    return categorized_backlog
```

### 1.3 Dependency and Risk Analysis
```python
def analyze_dependencies_and_risks():
    """
    Map dependencies and identify risks for cycle planning
    """
    print("🔗 Analyzing dependencies and risks...")
    
    all_issues = Linear:list_issues(
        team=team_name,
        project=project_name,
        includeArchived=false
    )
    
    dependency_graph = {}
    risk_matrix = {}
    
    for issue in all_issues:
        # Build dependency graph
        dependencies = {
            "blocks": get_blocked_issues(issue),
            "blocked_by": get_blocking_issues(issue),
            "related": get_related_issues(issue),
            "parent": issue.parent,
            "children": get_child_issues(issue)
        }
        
        dependency_graph[issue.id] = dependencies
        
        # Risk assessment
        risks = {
            "technical_risk": assess_technical_risk(issue),
            "schedule_risk": assess_schedule_risk(issue),
            "resource_risk": assess_resource_risk(issue),
            "dependency_risk": calculate_dependency_risk(dependencies),
            "scope_risk": assess_scope_creep_risk(issue)
        }
        
        risk_matrix[issue.id] = {
            "overall_risk": calculate_overall_risk(risks),
            "mitigation_needed": risks["overall_risk"] > 0.6,
            "risk_factors": risks
        }
    
    # Identify critical paths
    critical_paths = find_critical_paths(dependency_graph)
    
    return {
        "dependency_graph": dependency_graph,
        "risk_matrix": risk_matrix,
        "critical_paths": critical_paths,
        "high_risk_items": [id for id, risk in risk_matrix.items() if risk["overall_risk"] > 0.7]
    }
```

## Phase 2: Intelligent Cycle Planning

### 2.1 Cycle Composition Strategy
```python
def plan_next_cycle():
    """
    Intelligently compose the next cycle based on all analysis
    """
    print("🎯 Planning next cycle composition...")
    
    # Get analyses
    current_analysis = analyze_current_cycle()
    backlog_analysis = analyze_backlog()
    dependency_analysis = analyze_dependencies_and_risks()
    
    # Get next cycle
    next_cycle = Linear:list_cycles(teamId=team.id, type="next")[0]
    
    # Calculate available capacity
    available_capacity = calculate_available_capacity(
        base_velocity=team_velocity,
        carryover=current_analysis["velocity_analysis"]["likely_carryover"],
        buffer_percentage=15  # Keep 15% buffer
    )
    
    # Build cycle composition
    cycle_plan = {
        "cycle": next_cycle,
        "theme": determine_cycle_theme(backlog_analysis),
        "capacity": {
            "total": team_velocity,
            "carryover": current_analysis["velocity_analysis"]["likely_carryover"],
            "available_new": available_capacity,
            "allocated": 0
        },
        "composition": {
            "must_have": [],
            "should_have": [],
            "could_have": [],
            "quick_wins": []
        },
        "balance": {
            "feature_work": 0,
            "tech_debt": 0,
            "bugs": 0,
            "improvements": 0
        }
    }
    
    # Intelligent selection algorithm
    selected_issues = select_issues_for_cycle(
        backlog=backlog_analysis,
        capacity=available_capacity,
        dependencies=dependency_analysis,
        strategy="balanced"  # balanced|feature_focused|debt_focused|bug_bash
    )
    
    return cycle_plan, selected_issues
```

### 2.2 Issue Selection Algorithm
```python
def select_issues_for_cycle(backlog, capacity, dependencies, strategy):
    """
    Smart algorithm to select optimal set of issues for cycle
    """
    selected = []
    remaining_capacity = capacity
    
    # Priority rules based on strategy
    if strategy == "balanced":
        allocation_targets = {
            "critical_bugs": 0.15,      # 15% for critical bugs
            "security_issues": 0.10,     # 10% for security
            "user_features": 0.40,       # 40% for features
            "tech_debt": 0.20,           # 20% for tech debt
            "improvements": 0.10,        # 10% for improvements
            "buffer": 0.05               # 5% buffer
        }
    
    # Step 1: Add must-have items (critical bugs, security)
    for issue in backlog["critical_bugs"] + backlog["security_issues"]:
        if issue.estimate <= remaining_capacity:
            if is_ready_for_development(issue):
                selected.append({
                    "issue": issue,
                    "reason": "Critical priority",
                    "value_score": issue.enhanced_metadata["value_score"]
                })
                remaining_capacity -= issue.estimate
    
    # Step 2: Add items that unblock others
    blocking_issues = find_issues_that_unblock_many(dependencies)
    for issue in blocking_issues:
        if issue.estimate <= remaining_capacity:
            selected.append({
                "issue": issue,
                "reason": f"Unblocks {len(issue.blocks)} other issues",
                "value_score": issue.enhanced_metadata["value_score"]
            })
            remaining_capacity -= issue.estimate
    
    # Step 3: Balance remaining capacity
    for category, target_percentage in allocation_targets.items():
        if category in ["buffer", "critical_bugs", "security_issues"]:
            continue  # Already handled or not a category
        
        target_points = capacity * target_percentage
        allocated_points = 0
        
        for issue in backlog[category]:
            if allocated_points >= target_points:
                break
            if issue.estimate <= remaining_capacity:
                if passes_selection_criteria(issue):
                    selected.append({
                        "issue": issue,
                        "reason": f"{category} - Value score: {issue.enhanced_metadata['value_score']}",
                        "value_score": issue.enhanced_metadata["value_score"]
                    })
                    remaining_capacity -= issue.estimate
                    allocated_points += issue.estimate
    
    # Step 4: Fill with quick wins if capacity remains
    quick_wins = find_quick_wins(backlog, max_points=2)
    for issue in quick_wins:
        if remaining_capacity >= issue.estimate:
            selected.append({
                "issue": issue,
                "reason": "Quick win - High value, low effort",
                "value_score": issue.enhanced_metadata["value_score"]
            })
            remaining_capacity -= issue.estimate
    
    return selected

def passes_selection_criteria(issue):
    """
    Check if issue meets criteria for inclusion in cycle
    """
    criteria = {
        "has_clear_requirements": check_requirements_clarity(issue),
        "no_blocking_dependencies": not has_unresolved_blockers(issue),
        "estimated": issue.estimate is not None,
        "not_too_large": issue.estimate <= 13,  # Break down larger items
        "has_acceptance_criteria": check_acceptance_criteria(issue),
        "risk_acceptable": issue.enhanced_metadata["complexity"]["risk_level"] < 0.8
    }
    
    # Must pass all criteria
    return all(criteria.values())
```

### 2.3 Create Next Cycle in Linear
```python
def create_next_cycle_issues():
    """
    Create and configure the next cycle in Linear
    """
    print("📝 Creating next cycle in Linear...")
    
    cycle_plan, selected_issues = plan_next_cycle()
    
    # Create cycle planning issue
    planning_issue = Linear:create_issue(
        team=team_name,
        title=f"[Cycle Planning] {cycle_plan['cycle'].name} - {cycle_plan['theme']}",
        description=f"""
        # Cycle Planning: {cycle_plan['cycle'].name}
        
        ## 🎯 Cycle Theme
        **{cycle_plan['theme']}**
        
        ## 📊 Capacity Planning
        | Metric | Points |
        |--------|--------|
        | Team Velocity | {cycle_plan['capacity']['total']} |
        | Carryover from Current | {cycle_plan['capacity']['carryover']} |
        | Available for New Work | {cycle_plan['capacity']['available_new']} |
        | Allocated | {cycle_plan['capacity']['allocated']} |
        | Buffer | {cycle_plan['capacity']['total'] - cycle_plan['capacity']['allocated']} |
        
        ## 📋 Selected Issues ({len(selected_issues)} items)
        
        ### Must Have (Committed)
        {format_selected_issues(selected_issues, "must_have")}
        
        ### Should Have (Likely)
        {format_selected_issues(selected_issues, "should_have")}
        
        ### Could Have (Stretch)
        {format_selected_issues(selected_issues, "could_have")}
        
        ## ⚖️ Work Balance
        | Category | Points | Percentage |
        |----------|--------|------------|
        | Features | {cycle_plan['balance']['feature_work']} | {calculate_percentage('feature_work')}% |
        | Tech Debt | {cycle_plan['balance']['tech_debt']} | {calculate_percentage('tech_debt')}% |
        | Bugs | {cycle_plan['balance']['bugs']} | {calculate_percentage('bugs')}% |
        | Improvements | {cycle_plan['balance']['improvements']} | {calculate_percentage('improvements')}% |
        
        ## 🎯 Success Criteria
        {generate_cycle_success_criteria(cycle_plan)}
        
        ## 📝 Key Decisions
        {document_planning_decisions(selected_issues)}
        
        ## ⚠️ Risks & Mitigations
        {identify_cycle_risks(selected_issues)}
        
        ## 👥 Team Assignments
        {suggest_team_assignments(selected_issues)}
        """,
        labels=["cycle-planning", "claude-code"],
        cycle=cycle_plan['cycle'].id,
        priority=1
    )
    
    # Assign selected issues to cycle
    for item in selected_issues:
        Linear:update_issue(
            id=item['issue'].id,
            cycle=cycle_plan['cycle'].id,
            state="todo" if item['issue'].state in ["backlog", "triage"] else item['issue'].state
        )
        
        # Add planning note
        Linear:create_comment(
            issueId=item['issue'].id,
            body=f"""
            ### 📅 Added to {cycle_plan['cycle'].name}
            **Reason**: {item['reason']}
            **Value Score**: {item['value_score']}/100
            **Priority**: {determine_cycle_priority(item)}
            **Suggested Assignee**: {item['issue'].enhanced_metadata['ideal_assignee']}
            """
        )
    
    return planning_issue, selected_issues
```

## Phase 3: Claude Code Work Alignment

### 3.1 Create Claude Code Work Queue
```python
def align_claude_code_work():
    """
    Create and align Claude Code's personal work queue with Linear cycle
    """
    print("🤖 Aligning Claude Code work queue...")
    
    # Get Claude Code assigned issues for next cycle
    next_cycle = Linear:list_cycles(teamId=team.id, type="next")[0]
    
    claude_assigned = Linear:list_issues(
        team=team_name,
        cycle=next_cycle.id,
        assignee="me"
    )
    
    # Create Claude Code work tracking issue
    work_log = Linear:create_issue(
        team=team_name,
        title=f"[CC Work Log] {next_cycle.name} - Claude Code Task Queue",
        description=f"""
        # Claude Code Work Queue - {next_cycle.name}
        
        ## 🤖 Assigned Tasks ({len(claude_assigned)})
        
        ### Execution Order (by priority and dependencies)
        {for idx, task in enumerate(order_tasks_by_dependencies(claude_assigned)):}
        {idx + 1}. **[{task.identifier}]** {task.title}
           - Status: {task.state}
           - Estimate: {task.estimate} points
           - Dependencies: {list_dependencies(task)}
           - Approach: {determine_approach(task)}
        
        ## 📊 Personal Metrics
        - Total Points: {sum(t.estimate for t in claude_assigned if t.estimate)}
        - Estimated Days: {estimate_working_days(claude_assigned)}
        - Daily Velocity Target: {calculate_daily_velocity(claude_assigned, cycle_days)}
        
        ## 🎯 Daily Plan
        {generate_daily_plan(claude_assigned, next_cycle)}
        
        ## 🔧 Technical Preparation
        ### Tools & Setup Required
        {identify_required_tools(claude_assigned)}
        
        ### Knowledge Gaps to Address
        {identify_knowledge_requirements(claude_assigned)}
        
        ### Pre-work Research
        {list_research_tasks(claude_assigned)}
        
        ## 📝 Work Patterns
        - **Deep Work Blocks**: {identify_deep_work_tasks(claude_assigned)}
        - **Quick Tasks**: {identify_quick_tasks(claude_assigned)}
        - **Collaborative Items**: {identify_collaboration_needs(claude_assigned)}
        
        ## 🔄 Self-Management Rules
        1. Update this log daily with progress
        2. Move issues through states as work progresses
        3. Document blockers immediately
        4. Create checkpoint comments when context switching
        5. Track actual vs estimated time
        
        ## 📈 Progress Tracking
        | Day | Planned | Completed | Blockers | Notes |
        |-----|---------|-----------|----------|--------|
        | Day 1 | {day1_plan} | - | - | - |
        | Day 2 | {day2_plan} | - | - | - |
        | Day 3 | {day3_plan} | - | - | - |
        ...
        """,
        labels=["claude-code", "work-log", "self-management"],
        assignee="me",
        cycle=next_cycle.id
    )
    
    return work_log, claude_assigned
```

### 3.2 Pre-Cycle Preparation
```python
def prepare_for_cycle_execution():
    """
    Comprehensive preparation before starting cycle work
    """
    print("🛠️ Preparing for cycle execution...")
    
    preparation_tasks = []
    
    # 1. Technical environment setup
    env_setup = {
        "verify_dependencies": check_all_dependencies(),
        "update_tools": update_development_tools(),
        "setup_testing": configure_test_environment(),
        "branch_strategy": setup_git_branches()
    }
    
    # 2. Knowledge preparation
    knowledge_prep = {
        "documentation_review": review_relevant_docs(),
        "codebase_familiarization": analyze_affected_modules(),
        "pattern_identification": identify_similar_past_work(),
        "best_practices": load_relevant_guidelines()
    }
    
    # 3. Create pre-work checklist
    checklist = Linear:create_issue(
        team=team_name,
        title=f"[CC Prep] Pre-cycle Preparation Checklist",
        description=f"""
        ## Pre-Cycle Preparation Checklist
        
        ### 🔧 Environment Setup
        - [ ] All dependencies installed and up to date
        - [ ] Test suite running successfully
        - [ ] Development environment configured
        - [ ] Git branches created for planned work
        - [ ] IDE configured with proper linting/formatting
        
        ### 📚 Knowledge Preparation
        - [ ] Reviewed all assigned issue descriptions
        - [ ] Understood acceptance criteria for each task
        - [ ] Identified knowledge gaps and researched solutions
        - [ ] Reviewed similar past implementations
        - [ ] Documented technical approaches
        
        ### 🔗 Dependency Check
        - [ ] All blocking issues identified
        - [ ] Dependencies mapped and understood
        - [ ] External team dependencies communicated
        - [ ] API/Service dependencies verified
        
        ### 📊 Work Planning
        - [ ] Tasks ordered by priority and dependency
        - [ ] Daily work plan created
        - [ ] Time estimates validated
        - [ ] Risk mitigation strategies defined
        
        ### 🤝 Collaboration Setup
        - [ ] Identified items needing collaboration
        - [ ] Scheduled pairing sessions if needed
        - [ ] Review requirements clarified
        - [ ] Communication channels established
        
        ### 📈 Tracking Setup
        - [ ] Work log issue created
        - [ ] Progress tracking established
        - [ ] Metrics baseline recorded
        - [ ] Success criteria understood
        """,
        labels=["claude-code", "preparation"],
        assignee="me",
        state="in_progress"
    )
    
    return checklist
```

### 3.3 Decision Documentation System
```python
def setup_decision_tracking():
    """
    Create system for tracking technical decisions during cycle
    """
    decision_log = Linear:create_issue(
        team=team_name,
        title=f"[CC Decisions] Technical Decision Log - {next_cycle.name}",
        description=f"""
        # Technical Decision Log
        
        This issue tracks all technical decisions made during {next_cycle.name}.
        
        ## Decision Template
        Each decision should be documented with:
        - Context and problem
        - Options considered
        - Decision made
        - Rationale
        - Impact and trade-offs
        
        ## Decisions
        
        <!-- Decisions will be added as comments below -->
        """,
        labels=["claude-code", "decisions", "documentation"],
        assignee="me",
        cycle=next_cycle.id
    )
    
    return decision_log
```

## Phase 4: Execution Readiness

### 4.1 Final Validation
```python
def validate_cycle_readiness():
    """
    Final validation before cycle begins
    """
    print("✅ Validating cycle readiness...")
    
    validation_checks = {
        "capacity_valid": validate_capacity_allocation(),
        "dependencies_clear": validate_no_circular_dependencies(),
        "requirements_complete": validate_requirements_clarity(),
        "team_availability": check_team_availability(),
        "tools_ready": validate_tools_configured(),
        "risks_identified": validate_risks_documented(),
        "success_criteria_defined": validate_success_metrics()
    }
    
    issues_found = []
    for check, result in validation_checks.items():
        if not result['passed']:
            issues_found.append({
                "check": check,
                "issue": result['issue'],
                "severity": result['severity'],
                "action": result['recommended_action']
            })
    
    if issues_found:
        # Create issue for problems
        Linear:create_issue(
            team=team_name,
            title=f"[Warning] Cycle Planning Issues Found",
            description=format_validation_issues(issues_found),
            priority=1,
            labels=["cycle-planning", "needs-attention"]
        )
    
    return len(issues_found) == 0
```

### 4.2 Cycle Kickoff
```python
def initiate_cycle_kickoff():
    """
    Create cycle kickoff materials and notifications
    """
    print("🚀 Initiating cycle kickoff...")
    
    # Create kickoff announcement
    kickoff = Linear:create_issue(
        team=team_name,
        title=f"🚀 [Kickoff] {next_cycle.name} - Ready to Start",
        description=f"""
        # Cycle {next_cycle.name} Kickoff
        
        ## 🎯 Cycle Theme: {cycle_theme}
        
        ## 📊 Key Metrics
        - **Total Points**: {total_points}
        - **Issues**: {issue_count}
        - **Team Members**: {team_size}
        - **Duration**: {cycle_duration} days
        
        ## 🏆 Goals for This Cycle
        1. {goal_1}
        2. {goal_2}
        3. {goal_3}
        
        ## 📋 Top Priority Items
        {list_top_priorities()}
        
        ## 🤖 Claude Code Assignments
        {list_claude_code_tasks()}
        
        ## 📅 Key Dates
        - **Start**: {start_date}
        - **Mid-cycle Check**: {mid_date}
        - **End**: {end_date}
        - **Retrospective**: {retro_date}
        
        ## 🔄 Daily Standups
        Claude Code will post daily updates in the tracking issue.
        
        ## 📈 Success Metrics
        {list_success_metrics()}
        
        ## 🎬 Ready to Start!
        All planning complete. Claude Code work queue aligned.
        Beginning execution on {start_date}.
        """,
        labels=["kickoff", "cycle-management"],
        cycle=next_cycle.id,
        priority=1
    )
    
    return kickoff
```

## Main Execution Flow

```python
async def execute_cycle_planning():
    """
    Main execution flow for comprehensive cycle planning
    """
    print("""
    ╔══════════════════════════════════════════╗
    ║   Linear Cycle Planning & Alignment       ║
    ║          Claude Code v2.0                 ║
    ╚══════════════════════════════════════════╝
    """)
    
    try:
        # Phase 1: Analysis
        print("\n📊 PHASE 1: Comprehensive Analysis")
        print("=" * 40)
        current_analysis = analyze_current_cycle()
        backlog_analysis = analyze_backlog()
        dependency_analysis = analyze_dependencies_and_risks()
        
        print(f"✓ Analyzed {len(backlog_analysis)} backlog items")
        print(f"✓ Identified {len(dependency_analysis['high_risk_items'])} high-risk items")
        print(f"✓ Found {current_analysis['velocity_analysis']['likely_carryover']} points likely carryover")
        
        # Phase 2: Planning
        print("\n🎯 PHASE 2: Intelligent Cycle Planning")
        print("=" * 40)
        planning_issue, selected_issues = create_next_cycle_issues()
        print(f"✓ Selected {len(selected_issues)} issues for next cycle")
        print(f"✓ Allocated {sum(i['issue'].estimate for i in selected_issues if i['issue'].estimate)} points")
        
        # Phase 3: Claude Code Alignment
        print("\n🤖 PHASE 3: Claude Code Work Alignment")
        print("=" * 40)
        work_log, claude_tasks = align_claude_code_work()
        print(f"✓ Created work log with {len(claude_tasks)} assigned tasks")
        
        checklist = prepare_for_cycle_execution()
        print("✓ Pre-cycle preparation checklist created")
        
        decision_log = setup_decision_tracking()
        print("✓ Decision tracking system initialized")
        
        # Phase 4: Validation
        print("\n✅ PHASE 4: Validation & Kickoff")
        print("=" * 40)
        is_ready = validate_cycle_readiness()
        
        if is_ready:
            print("✓ All validation checks passed")
            kickoff = initiate_cycle_kickoff()
            print("✓ Cycle kickoff materials created")
        else:
            print("⚠️ Validation issues found - review required")
        
        # Summary
        print(f"""
        
        ╔══════════════════════════════════════════╗
        ║         Planning Complete! 🎉             ║
        ╚══════════════════════════════════════════╝
        
        📊 Cycle Planning Summary:
        ├─ Cycle: {next_cycle.name}
        ├─ Theme: {cycle_theme}
        ├─ Duration: {cycle_duration} days
        ├─ Total Points: {total_points}
        ├─ Issues Selected: {len(selected_issues)}
        └─ Claude Code Tasks: {len(claude_tasks)}
        
        📈 Work Distribution:
        ├─ Features: {feature_percentage}%
        ├─ Tech Debt: {tech_debt_percentage}%
        ├─ Bugs: {bug_percentage}%
        └─ Improvements: {improvement_percentage}%
        
        🔗 Key Linear Links:
        ├─ Planning Issue: {planning_issue.url}
        ├─ Work Log: {work_log.url}
        ├─ Decision Log: {decision_log.url}
        └─ Cycle Board: {cycle_board_url}
        
        🚀 Next Steps:
        1. Review selected issues with team
        2. Assign team members to issues
        3. Complete pre-cycle checklist
        4. Begin execution on {start_date}
        
        🤖 Claude Code Status: READY
        ├─ Work queue aligned ✓
        ├─ Environment prepared ✓
        ├─ Tracking initialized ✓
        └─ Awaiting cycle start
        """)
        
    except Exception as e:
        print(f"❌ Error during cycle planning: {e}")
        # Create error issue
        Linear:create_issue(
            team=team_name,
            title=f"[Error] Cycle Planning Failed - {e}",
            description=f"Error details: {traceback.format_exc()}",
            priority=1,
            labels=["error", "cycle-planning"]
        )
        raise
```

## Success Criteria

✅ Comprehensive analysis of current cycle and backlog completed  
✅ Intelligent selection of issues based on value, complexity, and risk  
✅ Next cycle properly composed with balanced work types  
✅ Capacity constraints respected with appropriate buffer  
✅ Dependencies identified and sequenced correctly  
✅ All selected issues assigned to next cycle in Linear  
✅ Claude Code work queue created and aligned  
✅ Pre-cycle preparation checklist established  
✅ Decision tracking system initialized  
✅ Validation checks passed  
✅ Cycle kickoff materials ready  
✅ Team notified and ready to begin  

## Post-Planning Actions

1. **Team Review**: Schedule review of cycle plan with team
2. **Assignment Session**: Assign team members to issues
3. **Risk Review**: Deep dive on high-risk items
4. **Dependency Coordination**: Align with other teams on dependencies
5. **Tool Verification**: Ensure all tools and access ready
6. **Knowledge Transfer**: Share context on complex items
7. **Success Metrics**: Confirm measurement approach
