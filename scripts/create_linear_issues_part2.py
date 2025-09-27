{
                "title": "Implement budget controls and throttling",
                "description": """
## Task: Cost Management System

### Requirements
- Per-repo budget limits ($2.5k/month)
- Global budget limit ($10k/month)
- Cost tracking per fix
- Automatic throttling

### Implementation
- Track AI API costs
- Monitor compute resources
- Implement backpressure
- Generate cost reports

### Acceptance Criteria
- [ ] Cost tracking accurate
- [ ] Budget limits enforced
- [ ] Throttling works
- [ ] Reports generated
""",
                "labels": ["feature", "infrastructure", "phase-4"],
                "priority": 2,
                "estimate": 3,
            },
            {
                "title": "Security hardening and compliance",
                "description": """
## Task: Security Implementation

### Requirements
- Secrets management (Vault)
- RBAC enforcement
- Audit trail compliance
- SBOM generation

### Security Features
- Secret scanning
- Signed artifacts
- PII detection
- SIEM integration

### Acceptance Criteria
- [ ] No secrets in code
- [ ] RBAC working
- [ ] Audit trail complete
- [ ] SBOM generated
""",
                "labels": ["feature", "infrastructure", "phase-4"],
                "priority": 1,
                "estimate": 3,
            }
        ]
    })
    
    # Additional Core Features
    issues.append({
        "title": "Documentation and API Contracts",
        "description": """
## Documentation and Machine-Readable Contracts

### Objective
Create comprehensive documentation and API contracts.

### Requirements
- OpenAPI 3.1 specifications
- GraphQL SDL schemas
- MCP tool manifests
- AsyncAPI event schemas

### Deliverables
- [ ] API documentation auto-generated
- [ ] Agent workflow specifications
- [ ] Runbooks for operations
- [ ] Architecture diagrams
""",
        "labels": ["task", "documentation"],
        "priority": 2,
        "estimate": 5,
        "children": [
            {
                "title": "Create OpenAPI specifications",
                "description": """
## Task: REST API Documentation

### Requirements
- Define all endpoints
- Version management
- Request/response schemas
- Authentication flows

### Acceptance Criteria
- [ ] OpenAPI 3.1 compliant
- [ ] All endpoints documented
- [ ] Examples provided
- [ ] Auto-generated docs
""",
                "labels": ["task", "documentation", "api"],
                "priority": 2,
                "estimate": 2,
            },
            {
                "title": "Create AGENT_WORKFLOW.md specification",
                "description": """
## Task: Machine-Readable Workflow

### Requirements
- Repository metadata
- Guardrails definition
- Agent roles specification
- Change control rules

### Acceptance Criteria
- [ ] Complete workflow spec
- [ ] Machine-readable format
- [ ] Version controlled
- [ ] Validated by system
""",
                "labels": ["task", "documentation"],
                "priority": 2,
                "estimate": 2,
            }
        ]
    })
    
    # Performance and Testing
    issues.append({
        "title": "Performance Testing and Optimization",
        "description": """
## Performance Testing Suite

### Objective
Ensure system meets performance SLAs.

### Scope
- Load testing
- Stress testing
- Performance profiling
- Optimization

### Success Criteria
- [ ] All SLAs validated
- [ ] Bottlenecks identified
- [ ] Optimizations implemented
- [ ] Performance baselines established
""",
        "labels": ["task", "testing"],
        "priority": 2,
        "estimate": 5,
        "children": [
            {
                "title": "Implement load testing suite",
                "description": """
## Task: Load Testing

### Requirements
- Simulate 10+ concurrent repos
- Test throughput limits
- Measure latencies
- Validate resource usage

### Test Scenarios
- Normal load (3 repos)
- Peak load (10 repos)
- Sustained load (24h)
- Burst scenarios

### Acceptance Criteria
- [ ] Test suite automated
- [ ] Metrics collected
- [ ] Reports generated
- [ ] SLAs validated
""",
                "labels": ["task", "testing"],
                "priority": 2,
                "estimate": 3,
            }
        ]
    })
    
    # Observability
    issues.append({
        "title": "Observability and Monitoring",
        "description": """
## Observability Implementation

### Objective
Complete observability stack with OpenTelemetry.

### Scope
- Distributed tracing
- Metrics collection
- Log aggregation
- Dashboard creation

### Success Criteria
- [ ] 100% instrumentation
- [ ] Traces correlated
- [ ] Dashboards operational
- [ ] Alerts configured
""",
        "labels": ["feature", "infrastructure"],
        "priority": 1,
        "estimate": 8,
        "children": [
            {
                "title": "Implement OpenTelemetry instrumentation",
                "description": """
## Task: Tracing Implementation

### Requirements
- Instrument all agents
- Trace tool invocations
- Correlate requests
- Export to collectors

### Instrumentation Points
- Agent decisions
- Tool executions
- API calls
- Database queries

### Acceptance Criteria
- [ ] Full instrumentation
- [ ] Traces exported
- [ ] Context propagation
- [ ] Performance overhead < 5%
""",
                "labels": ["feature", "infrastructure"],
                "priority": 1,
                "estimate": 5,
            },
            {
                "title": "Create Grafana dashboards",
                "description": """
## Task: Dashboard Creation

### Requirements
- Agent status dashboard
- Performance metrics
- Cost analysis
- Error tracking

### Dashboard Features
- Real-time updates
- Historical trends
- Alert integration
- Export capabilities

### Acceptance Criteria
- [ ] All metrics visible
- [ ] Auto-refresh working
- [ ] Alerts configured
- [ ] Mobile responsive
""",
                "labels": ["task", "frontend"],
                "priority": 2,
                "estimate": 3,
            }
        ]
    })
    
    return issues

def main():
    """Main execution function"""
    print("\n" + "="*60)
    print("Linear Issue Creation for AI Coding Agent Project")
    print("="*60 + "\n")
    
    creator = LinearIssueCreator()
    
    # Phase 1: Setup
    print("Phase 1: Setting up Linear workspace...")
    print("-"*40)
    
    if not creator.get_or_create_team():
        print("❌ Failed to set up team. Exiting.")
        return
    
    if not creator.get_or_create_project():
        print("❌ Failed to set up project. Exiting.")
        return
    
    creator.setup_labels()
    creator.get_workflow_states()
    creator.get_current_cycle()
    
    print("\n" + "="*60)
    print("Phase 2: Creating Issues")
    print("="*60 + "\n")
    
    # Get all issues to create
    all_issues = get_all_issues()
    
    # Statistics
    total_epics = 0
    total_tasks = 0
    
    # Create issues
    for epic in all_issues:
        # Create parent epic
        parent_id = creator.create_issue(
            title=epic["title"],
            description=epic["description"],
            labels=epic["labels"],
            priority=epic.get("priority", 2),
            estimate=epic.get("estimate"),
            is_mvp=epic.get("is_mvp", False)
        )
        
        if parent_id:
            total_epics += 1
            
            # Create child tasks
            if "children" in epic:
                for task in epic["children"]:
                    child_id = creator.create_issue(
                        title=task["title"],
                        description=task["description"],
                        labels=task["labels"],
                        priority=task.get("priority", 2),
                        estimate=task.get("estimate"),
                        parent_id=parent_id,
                        is_mvp=epic.get("is_mvp", False)
                    )
                    if child_id:
                        total_tasks += 1
    
    # Print summary
    print("\n" + "="*60)
    print("Summary")
    print("="*60)
    print(f"\n✓ Total epics created: {total_epics}")
    print(f"✓ Total tasks created: {total_tasks}")
    print(f"✓ Total issues created: {len(creator.created_issues)}")
    
    if creator.created_issues:
        print("\n📋 Created Issues:")
        print("-"*40)
        for issue in creator.created_issues:
            print(f"[{issue['identifier']}] {issue['title']}")
            print(f"   URL: {issue['url']}")
    
    print("\n" + "="*60)
    print("✅ Issue creation complete!")
    print("="*60)
    
    # Generate project URL
    if creator.project_id:
        print(f"\n🔗 View project in Linear:")
        print(f"   https://linear.app/team/{TEAM_NAME}/project/{PROJECT_NAME}")
    
    # Suggest next steps
    print("\n📝 Suggested Next Steps:")
    print("-"*40)
    print("1. Review created issues in Linear")
    print("2. Adjust priorities and estimates as needed")
    print("3. Assign team members to tasks")
    print("4. Create sprint/cycle planning")
    print("5. Set up automation rules in Linear")
    print("6. Configure GitHub integration")
    
    # Save created issues to file
    if creator.created_issues:
        output_file = "scripts/created_linear_issues.json"
        with open(output_file, "w") as f:
            json.dump(creator.created_issues, f, indent=2)
        print(f"\n💾 Issue list saved to: {output_file}")

if __name__ == "__main__":
    main()
