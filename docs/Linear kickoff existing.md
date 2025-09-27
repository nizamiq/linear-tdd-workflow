
# Linear.app User Story & Issue Extraction Framework

## Objective
Extract and structure a comprehensive set of issues from the provided project vision, codebase, and documentation in a format optimized for Linear.app import and workflow management.

## Instructions

### Phase 1: Analysis and Discovery
1. **Context Analysis**: Examine provided materials to identify:
   - Core objectives and deliverables
   - User personas and teams involved
   - Technical architecture and system boundaries
   - Existing implementation status
   - Integration points and dependencies
   - Linear workspace structure (teams, projects, cycles)

2. **Issue Identification**: Extract issues covering:
   - **Features**: User-facing functionality
   - **Tasks**: Technical work and enablers
   - **Bugs**: Defects and issues to fix
   - **Improvements**: Performance, UX, and technical debt
   - **Spikes**: Research and investigation tasks

### Phase 2: Linear-Optimized Structure
Format each issue with Linear-specific fields:

```
TITLE: [Concise, action-oriented title]
DESCRIPTION:
  User Story Format (when applicable):
  As a [persona/role]
  I want [functionality]
  So that [value/outcome]

  Context: [Additional background]
  
ACCEPTANCE CRITERIA:
  - [ ] Criterion 1
  - [ ] Criterion 2
  - [ ] Criterion 3
```

### Phase 3: Linear Metadata Assignment
Assign Linear-compatible metadata:

1. **Priority Levels** (Linear standard):
   - 🔴 Urgent (P0): Blocking/Critical
   - 🟠 High (P1): Important, do soon
   - 🟡 Medium (P2): Important, not urgent
   - 🔵 Low (P3): Nice to have
   - ⚪ None (P4): Backlog

2. **Estimates** (Linear points):
   - 1 point: Few hours
   - 2 points: Half day
   - 3 points: Full day
   - 5 points: 2-3 days
   - 8 points: Week
   - 13+ points: Should be broken down

3. **Labels** (organize with):
   - Type: `feature`, `bug`, `task`, `improvement`, `spike`
   - Area: `frontend`, `backend`, `api`, `database`, `infrastructure`
   - State: `mvp`, `post-mvp`, `tech-debt`, `blocked`
   - Team: `engineering`, `design`, `product`, `devops`

### Phase 4: Output Generation

#### Linear API JSON Format
```json
{
  "export_version": "1.0",
  "workspace": {
    "name": "string",
    "teams": ["string"]
  },
  "projects": [
    {
      "id": "project_identifier",
      "name": "string",
      "description": "string",
      "state": "planned|started|paused|completed|canceled",
      "targetDate": "ISO-8601",
      "milestones": [
        {
          "name": "string",
          "description": "string",
          "targetDate": "ISO-8601"
        }
      ]
    }
  ],
  "issues": [
    {
      "identifier": "string",
      "title": "string",
      "description": "string",
      "priority": 0-4,
      "estimate": number,
      "type": "feature|bug|task|improvement|spike",
      "state": "backlog|todo|in_progress|in_review|done|canceled",
      "labels": [
        {
          "name": "string",
          "color": "#hexcolor"
        }
      ],
      "project": "project_identifier",
      "milestone": "milestone_name",
      "parent": "parent_issue_identifier",
      "children": ["child_issue_identifier"],
      "dependencies": {
        "blocks": ["issue_identifier"],
        "blocked_by": ["issue_identifier"]
      },
      "acceptance_criteria": [
        {
          "text": "string",
          "completed": boolean
        }
      ],
      "comments": [
        {
          "body": "string",
          "type": "comment|technical_note|assumption"
        }
      ],
      "custom_fields": {
        "story_points": number,
        "mvp": boolean,
        "epic": "string",
        "component": "string"
      },
      "github": {
        "branch_name": "string",
        "pr_template": "string"
      }
    }
  ],
  "cycles": [
    {
      "name": "string",
      "start_date": "ISO-8601",
      "end_date": "ISO-8601",
      "issues": ["issue_identifier"]
    }
  ]
}
```

### Phase 5: Linear Workflow Optimization

#### Issue Hierarchy
Structure for Linear's parent-child relationships:
```
Epic (Parent Issue)
├── Feature Story 1
│   ├── Task 1.1
│   ├── Task 1.2
│   └── Bug Fix 1.3
├── Feature Story 2
│   └── Task 2.1
└── Technical Debt Item
```

#### Cycle Planning
Group issues by suggested cycles:
- **Cycle 1 (MVP)**: Critical path items
- **Cycle 2-3**: Core features
- **Cycle 4+**: Enhancements and optimizations
- **Backlog**: Future considerations

#### Team Assignment Suggestions
Based on issue type and area:
- Frontend Team: UI/UX issues
- Backend Team: API and data issues
- Platform Team: Infrastructure and DevOps
- QA Team: Testing and validation tasks

## Quality Criteria for Linear
- ✓ Titles are concise (<60 chars) and start with verbs
- ✓ Descriptions use Linear's markdown (checkboxes, code blocks, tables)
- ✓ Estimates follow Linear's point scale
- ✓ Labels follow team's naming conventions
- ✓ Issues are sized for single cycle completion
- ✓ Dependencies are explicitly mapped
- ✓ Includes Linear-compatible branch naming suggestions

## Special Linear Features to Utilize
- **Triage**: Mark issues needing review with `needs-triage` label
- **SLAs**: Flag customer-impacting issues with `sla:urgent`
- **Roadmap**: Tag strategic initiatives with `roadmap` label
- **Templates**: Suggest issue templates for common patterns
- **Automations**: Note workflow triggers (e.g., "When moved to In Review, notify QA")
- **Integrations**: Include GitHub branch names and PR templates

---

## Input Section
Insert your project materials below:

```
PROJECT VISION:
"""
[Insert project vision, goals, and success metrics]
"""

CODEBASE ANALYSIS:
"""
[Insert repository structure, tech stack, current implementation status]
"""

DOCUMENTATION:
"""
[Insert PRDs, technical specs, API docs, user guides]
"""

LINEAR WORKSPACE CONTEXT:
"""
[Insert team structure, existing projects, label conventions, workflow states]
"""

CONSTRAINTS & REQUIREMENTS:
"""
[Insert deadlines, resource limits, compliance needs, technical constraints]
"""
```

## Execution Guidelines
1. Generate identifiers using pattern: `[TEAM]-[TYPE]-[NUMBER]` (e.g., `ENG-FEAT-001`)
2. Include Linear magic keywords in descriptions:
   - "Fixes #123" for bug links
   - "Closes #456" for completion triggers
   - "@mention" for team notifications
3. Format dates as ISO-8601 for Linear compatibility
4. Suggest Linear views:
   - Kanban board by status
   - Timeline by milestone
   - List by priority
5. Include cycle velocity calculations based on estimates

## Output

- **JSON**: For API-based import or automation

## Validation Checklist
- [ ] All required Linear fields populated
- [ ] No circular dependencies
- [ ] Estimates total reasonable for team capacity
- [ ] MVP subset clearly identified
- [ ] Labels match workspace conventions
- [ ] Parent-child relationships properly nested
- [ ] Milestones align with project timeline
