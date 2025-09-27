# Direct Linear Integration: Automated Issue Creation Framework

## Objective
Analyze the provided project materials and automatically create a comprehensive set of issues directly in Linear using the integrated MCP tools. All issues will be created under the specified project with proper hierarchy, labels, and metadata.

## Execution Parameters
```yaml
project_name: "document-processor"
team_name: "NizamIQ"
create_new_project: false
assign_to_project: true
cycle_assignment: 
```

## Phase 1: Linear Workspace Setup

### Step 1.1: Project Verification/Creation
```
1. Search for existing project using Linear:list_projects with query: {project_name}
2. If not found and create_new_project is true:
   - Create project using Linear:create_project
   - Set project description based on vision statement
   - Configure project settings
3. Store project ID for issue creation
```

### Step 1.2: Team Detection
```
1. List teams using Linear:list_teams
2. If team_name provided, verify it exists
3. If not provided, select team based on project ownership
4. Store team ID for issue creation
```

### Step 1.3: Label Setup
```
Check and create required labels using Linear:list_issue_labels and Linear:create_issue_label:

Type Labels:
- feature (color: #5E6AD2)
- bug (color: #F2994A) 
- task (color: #26B5CE)
- improvement (color: #4CB782)
- spike (color: #B5A4DB)

Priority Labels:
- p0-urgent (color: #F2453D)
- p1-high (color: #F2994A)
- p2-medium (color: #F7CE45)
- p3-low (color: #5E6AD2)

Stage Labels:
- mvp (color: #F2453D)
- post-mvp (color: #5E6AD2)
- tech-debt (color: #B0A090)
- blocked (color: #95918C)

Area Labels:
- frontend (color: #26B5CE)
- backend (color: #4CB782)
- api (color: #5E6AD2)
- database (color: #F7CE45)
- infrastructure (color: #B5A4DB)
```

### Step 1.4: Cycle Detection
```
1. Get current cycle using Linear:list_cycles with type: "current"
2. Get next cycle using Linear:list_cycles with type: "next"
3. Store cycle IDs for MVP assignment
```

## Phase 2: Issue Analysis and Structuring

### Step 2.1: Material Analysis
Analyze provided materials to extract:
```
For each identified work item:
{
  title: "Concise action-oriented title",
  description: "Full description with user story format when applicable",
  type: "feature|bug|task|improvement|spike",
  priority: 0-4 (Linear scale),
  estimate: points (1,2,3,5,8,13),
  area: "component/area of codebase",
  is_mvp: boolean,
  acceptance_criteria: ["criterion 1", "criterion 2"],
  technical_notes: "Implementation details",
  dependencies: ["titles of blocking issues"],
  parent_feature: "parent issue title if applicable"
}
```

### Step 2.2: Hierarchy Mapping
```
Build parent-child relationships:
1. Identify epics/parent features
2. Group related tasks under features
3. Map dependencies between issues
4. Create ordered creation list (parents first)
```

## Phase 3: Direct Linear Creation

### Step 3.1: Create Parent Issues (Epics/Features)
```python
for each parent_issue in identified_epics:
    response = Linear:create_issue(
        team=team_name,
        title=parent_issue.title,
        description=format_description(parent_issue),
        project=project_name,
        priority=parent_issue.priority,
        estimate=parent_issue.estimate,
        labels=[parent_issue.type, parent_issue.priority_label, "epic"],
        state="backlog",
        cycle=cycle_id if parent_issue.is_mvp else None
    )
    store_mapping(parent_issue.title, response.id)
```

### Step 3.2: Create Child Issues with Relationships
```python
for each child_issue in identified_tasks:
    parent_id = get_stored_id(child_issue.parent_feature)
    
    response = Linear:create_issue(
        team=team_name,
        title=child_issue.title,
        description=format_description_with_ac(child_issue),
        project=project_name,
        parentId=parent_id,
        priority=child_issue.priority,
        estimate=child_issue.estimate,
        labels=build_label_array(child_issue),
        state="backlog",
        cycle=cycle_id if child_issue.is_mvp else None,
        links=format_links(child_issue.references)
    )
    store_mapping(child_issue.title, response.id)
```

### Step 3.3: Create Dependency Links
```python
for each issue with dependencies:
    # After all issues are created, update with dependencies
    blocking_ids = [get_stored_id(dep) for dep in issue.dependencies]
    # Note: Linear API may handle this differently
    # Update issue with blocking relationships
```

### Step 3.4: Batch Operations for Efficiency
```python
# Use Linear:batch_add_items for bulk creation when appropriate
batch_items = prepare_batch_format(issues_list)
Linear:batch_add_items(items=batch_items)
```

## Phase 4: Creation Workflow

### Execution Order:
1. **Setup Phase**
   ```
   - Verify/create project
   - Setup labels
   - Get team and cycle info
   ```

2. **Analysis Phase**
   ```
   - Parse provided materials
   - Build issue hierarchy
   - Assign metadata
   ```

3. **Creation Phase**
   ```
   - Create labels if missing
   - Create parent issues (epics)
   - Create child issues with parentId
   - Add cross-issue dependencies
   - Assign to cycles
   ```

4. **Verification Phase**
   ```
   - Query created issues: Linear:list_issues(project=project_name)
   - Verify hierarchy and relationships
   - Report creation statistics
   ```

## Phase 5: Description Templates

### Feature Description Template:
```markdown
## User Story
As a {persona}
I want {capability}
So that {value}

## Context
{background_information}

## Acceptance Criteria
- [ ] {criterion_1}
- [ ] {criterion_2}
- [ ] {criterion_3}

## Technical Considerations
{technical_notes}

## References
- Documentation: {doc_links}
- Design: {design_links}
- Related Code: {code_references}
```

### Bug Description Template:
```markdown
## Issue Description
{what_is_broken}

## Steps to Reproduce
1. {step_1}
2. {step_2}
3. {step_3}

## Expected Behavior
{what_should_happen}

## Actual Behavior
{what_actually_happens}

## Impact
- Severity: {critical|high|medium|low}
- Affected Users: {scope}

## Technical Details
{stack_trace_or_logs}
```

## Phase 6: Progress Reporting

### Real-time Updates:
```python
print(f"Setting up Linear workspace...")
print(f"✓ Project '{project_name}' found/created with ID: {project_id}")
print(f"✓ Team '{team_name}' configured")
print(f"✓ Created {n} labels")

print(f"\nCreating issues...")
for issue in issues:
    result = create_issue(issue)
    print(f"✓ Created: [{result.identifier}] {issue.title}")

print(f"\nSummary:")
print(f"- Total issues created: {total}")
print(f"- MVP issues: {mvp_count}")
print(f"- Assigned to current cycle: {cycle_count}")
```

## Error Handling

### Rollback Strategy:
```python
created_issues = []
try:
    for issue in issues_to_create:
        result = Linear:create_issue(...)
        created_issues.append(result.id)
except Exception as e:
    print(f"Error creating issue: {e}")
    if prompt_user("Rollback created issues?"):
        for issue_id in created_issues:
            Linear:update_issue(id=issue_id, state="canceled")
```

### Duplicate Detection:
```python
# Before creating, check for existing issues
existing = Linear:list_issues(
    project=project_name,
    query=issue.title
)
if existing and similarity(existing[0].title, issue.title) > 0.9:
    print(f"⚠️ Possible duplicate found: {existing[0].title}")
    # Skip or update instead of create
```

---

## Input Section

```yaml
PROJECT_CONFIGURATION:
  project_name: "[REQUIRED - Linear project name]"
  team_name: "[OPTIONAL - Linear team name]"
  create_new_project: [true/false]
  cycle_assignment: "[current/next/none]"
  
PROJECT_VISION:
"""
[Insert project vision, goals, and success metrics]
"""

CODEBASE_ANALYSIS:
"""
[Insert repository structure, tech stack, current implementation]
"""

DOCUMENTATION:
"""
[Insert PRDs, technical specs, API docs, user guides]
"""

SPECIAL_INSTRUCTIONS:
"""
[Any specific labeling conventions, team preferences, or workflow requirements]
"""
```

## Execution Instructions for Claude

1. **Start with workspace setup** - Verify project exists or create it
2. **Analyze materials thoroughly** - Extract all possible work items
3. **Create issues systematically** - Parents first, then children
4. **Provide progress updates** - Report each creation with issue ID
5. **Handle errors gracefully** - Report failures and continue
6. **Summarize results** - Provide statistics and Linear links

## Success Criteria
- ✅ All issues created in correct project
- ✅ Hierarchy properly established (parent-child)
- ✅ Labels applied consistently
- ✅ MVP items assigned to appropriate cycle
- ✅ Estimates provided for all stories
- ✅ No duplicate issues created
- ✅ Dependencies mapped where applicable

## Post-Creation Actions
```
1. Generate Linear URL for project view
2. Suggest Linear views to create:
   - MVP board (filtered by mvp label)
   - Sprint board (current cycle)
   - Backlog view (all unstarted)
3. Recommend automation rules
4. Suggest team workflow
```
