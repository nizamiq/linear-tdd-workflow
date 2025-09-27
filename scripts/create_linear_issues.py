#!/usr/bin/env python3
"""
Linear Issue Creation Script for AI Coding Agent Project
Creates comprehensive issue hierarchy in Linear based on PRD v1.2
"""

import os
import sys
import json
import requests
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# Configuration
LINEAR_API_KEY = os.getenv('LINEAR_API_KEY', os.getenv('LINEAR_API_KEY'))
LINEAR_API_URL = "https://api.linear.app/graphql"
PROJECT_NAME = "ai-coiding"
TEAM_NAME = "a-coders"

# Headers for Linear API
headers = {
    "Authorization": LINEAR_API_KEY,
    "Content-Type": "application/json"
}

class LinearIssueCreator:
    def __init__(self):
        self.created_issues = []
        self.team_id = None
        self.project_id = None
        self.label_map = {}
        self.state_map = {}
        self.cycle_id = None
        
    def graphql_request(self, query: str, variables: Dict = None) -> Dict:
        """Execute a GraphQL query against Linear API"""
        response = requests.post(
            LINEAR_API_URL,
            headers=headers,
            json={"query": query, "variables": variables or {}}
        )
        
        if response.status_code != 200:
            print(f"Error: {response.status_code} - {response.text}")
            return None
            
        result = response.json()
        if "errors" in result:
            print(f"GraphQL Error: {result['errors']}")
            return None
            
        return result.get("data")
    
    def get_or_create_team(self) -> str:
        """Get team ID or create if doesn't exist"""
        query = """
        query {
            teams {
                nodes {
                    id
                    key
                    name
                }
            }
        }
        """
        
        data = self.graphql_request(query)
        if data:
            for team in data["teams"]["nodes"]:
                if team["key"].lower() == TEAM_NAME.lower():
                    self.team_id = team["id"]
                    print(f"✓ Found team '{team['name']}' with ID: {team['id']}")
                    return self.team_id
        
        # If team not found, use first available team
        if data and data["teams"]["nodes"]:
            self.team_id = data["teams"]["nodes"][0]["id"]
            print(f"✓ Using team '{data['teams']['nodes'][0]['name']}' with ID: {self.team_id}")
            return self.team_id
            
        print("❌ No teams found in workspace")
        return None
    
    def get_or_create_project(self) -> str:
        """Get project ID or create if doesn't exist"""
        query = """
        query($name: String) {
            projects(filter: { name: { containsIgnoreCase: $name } }) {
                nodes {
                    id
                    name
                    description
                }
            }
        }
        """
        
        variables = {"name": PROJECT_NAME}
        data = self.graphql_request(query, variables)
        
        if data and data["projects"]["nodes"]:
            self.project_id = data["projects"]["nodes"][0]["id"]
            print(f"✓ Found project '{data['projects']['nodes'][0]['name']}' with ID: {self.project_id}")
            return self.project_id
        
        # Create new project
        create_mutation = """
        mutation CreateProject($input: ProjectCreateInput!) {
            projectCreate(input: $input) {
                success
                project {
                    id
                    name
                }
            }
        }
        """
        
        variables = {
            "input": {
                "name": PROJECT_NAME,
                "description": "AI-powered autonomous code quality improvement system with TDD enforcement",
                "teamIds": [self.team_id]
            }
        }
        
        data = self.graphql_request(create_mutation, variables)
        if data and data["projectCreate"]["success"]:
            self.project_id = data["projectCreate"]["project"]["id"]
            print(f"✓ Created project '{PROJECT_NAME}' with ID: {self.project_id}")
            return self.project_id
        
        print("❌ Failed to create project")
        return None
    
    def setup_labels(self):
        """Create or get all required labels"""
        labels_to_create = [
            # Type labels
            ("feature", "#5E6AD2"),
            ("bug", "#F2994A"),
            ("task", "#26B5CE"),
            ("improvement", "#4CB782"),
            ("spike", "#B5A4DB"),
            ("epic", "#9333EA"),
            
            # Priority labels
            ("p0-critical", "#F2453D"),
            ("p1-high", "#F2994A"),
            ("p2-medium", "#F7CE45"),
            ("p3-low", "#5E6AD2"),
            
            # Component labels
            ("auditor", "#0EA5E9"),
            ("executor", "#10B981"),
            ("guardian", "#EF4444"),
            ("strategist", "#F59E0B"),
            ("scholar", "#8B5CF6"),
            
            # Stage labels
            ("mvp", "#F2453D"),
            ("phase-0", "#9333EA"),
            ("phase-1", "#7C3AED"),
            ("phase-2", "#6366F1"),
            ("phase-3", "#3B82F6"),
            ("phase-4", "#0EA5E9"),
            
            # Area labels
            ("frontend", "#26B5CE"),
            ("backend", "#4CB782"),
            ("api", "#5E6AD2"),
            ("infrastructure", "#B5A4DB"),
            ("testing", "#F7CE45"),
            ("documentation", "#94A3B8"),
            ("mcp", "#EC4899"),
            ("tdd", "#EF4444"),
            ("clean-code", "#10B981"),
            ("pipeline", "#F97316"),
        ]
        
        # Get existing labels
        query = """
        query {
            issueLabels {
                nodes {
                    id
                    name
                    color
                }
            }
        }
        """
        
        data = self.graphql_request(query)
        existing_labels = {}
        if data:
            for label in data["issueLabels"]["nodes"]:
                existing_labels[label["name"]] = label["id"]
                self.label_map[label["name"]] = label["id"]
        
        # Create missing labels
        for label_name, color in labels_to_create:
            if label_name not in existing_labels:
                mutation = """
                mutation CreateLabel($input: IssueLabelCreateInput!) {
                    issueLabelCreate(input: $input) {
                        success
                        issueLabel {
                            id
                            name
                        }
                    }
                }
                """
                
                variables = {
                    "input": {
                        "name": label_name,
                        "color": color,
                        "teamId": self.team_id
                    }
                }
                
                data = self.graphql_request(mutation, variables)
                if data and data["issueLabelCreate"]["success"]:
                    self.label_map[label_name] = data["issueLabelCreate"]["issueLabel"]["id"]
                    print(f"✓ Created label '{label_name}'")
            else:
                print(f"✓ Found existing label '{label_name}'")
    
    def get_workflow_states(self):
        """Get workflow states for the team"""
        query = """
        query GetStates($teamId: String!) {
            team(id: $teamId) {
                states {
                    nodes {
                        id
                        name
                        type
                    }
                }
            }
        }
        """
        
        data = self.graphql_request(query, {"teamId": self.team_id})
        if data:
            for state in data["team"]["states"]["nodes"]:
                self.state_map[state["type"]] = state["id"]
                print(f"✓ Found state '{state['name']}' ({state['type']})")
    
    def get_current_cycle(self):
        """Get the current cycle if any"""
        query = """
        query {
            cycles(filter: { isActive: { eq: true } }) {
                nodes {
                    id
                    name
                    startsAt
                    endsAt
                }
            }
        }
        """
        
        data = self.graphql_request(query)
        if data and data["cycles"]["nodes"]:
            self.cycle_id = data["cycles"]["nodes"][0]["id"]
            print(f"✓ Found current cycle: {data['cycles']['nodes'][0]['name']}")
    
    def create_issue(
        self,
        title: str,
        description: str,
        labels: List[str],
        priority: int = 2,
        estimate: int = None,
        parent_id: str = None,
        is_mvp: bool = False,
        dependencies: List[str] = None
    ) -> Optional[str]:
        """Create a single issue in Linear"""
        
        mutation = """
        mutation CreateIssue($input: IssueCreateInput!) {
            issueCreate(input: $input) {
                success
                issue {
                    id
                    identifier
                    title
                    url
                }
            }
        }
        """
        
        # Map label names to IDs
        label_ids = []
        for label in labels:
            if label in self.label_map:
                label_ids.append(self.label_map[label])
        
        # Build the input
        issue_input = {
            "teamId": self.team_id,
            "title": title,
            "description": description,
            "priority": priority,
            "stateId": self.state_map.get("backlog", self.state_map.get("unstarted")),
            "labelIds": label_ids,
        }
        
        if self.project_id:
            issue_input["projectId"] = self.project_id
        
        if parent_id:
            issue_input["parentId"] = parent_id
        
        if estimate:
            issue_input["estimate"] = estimate
        
        if is_mvp and self.cycle_id:
            issue_input["cycleId"] = self.cycle_id
        
        variables = {"input": issue_input}
        data = self.graphql_request(mutation, variables)
        
        if data and data["issueCreate"]["success"]:
            issue = data["issueCreate"]["issue"]
            print(f"✓ Created issue [{issue['identifier']}]: {issue['title']}")
            self.created_issues.append({
                "id": issue["id"],
                "identifier": issue["identifier"],
                "title": issue["title"],
                "url": issue["url"]
            })
            return issue["id"]
        
        print(f"❌ Failed to create issue: {title}")
        return None

def get_all_issues() -> List[Dict]:
    """Define all issues based on the PRD"""
    issues = []
    
    # Phase 0 - Foundation (Weeks 1-4)
    issues.append({
        "title": "[PHASE-0] Foundation Setup",
        "description": """
## Phase 0: Foundation Setup (Weeks 1-4)

### Objective
Establish the core infrastructure for the autonomous code quality system.

### Scope
- Set up Orchestrator framework
- Implement MCP tool integration
- Establish GitHub/Linear connectors
- Create Evidence Store

### Success Criteria
- [ ] Agents can read code from repositories
- [ ] Linear task creation works
- [ ] PR comments can be posted
- [ ] Works with both JS/TS and Python repos

### Technical Requirements
- Node.js 20 with TypeScript
- XState for state management
- PostgreSQL for Evidence Store
- BullMQ for job processing
""",
        "labels": ["epic", "phase-0", "mvp", "infrastructure"],
        "priority": 0,
        "estimate": 13,
        "is_mvp": True,
        "children": [
            {
                "title": "Set up project structure and development environment",
                "description": """
## Task: Initialize Project Structure

### Requirements
- Create TypeScript/Node.js 20 project
- Set up monorepo structure for agents
- Configure build and development tools
- Set up testing framework (Vitest)

### Implementation Details
```
/
├── agents/          # Agent implementations
├── core/           # Shared framework
├── integrations/   # External service connectors
├── api/           # REST/GraphQL endpoints
├── tests/         # Test suites
└── .claude/       # Workflow configuration
```

### Acceptance Criteria
- [ ] TypeScript compilation working
- [ ] ESLint and Prettier configured
- [ ] Pre-commit hooks installed
- [ ] CI/CD pipeline template ready
""",
                "labels": ["task", "infrastructure", "phase-0"],
                "priority": 0,
                "estimate": 3,
            },
            {
                "title": "Implement Orchestrator with XState",
                "description": """
## Task: Build Core Orchestrator

### Requirements
- Implement agent lifecycle management
- Create task distribution system
- Build dependency resolution
- Set up resource allocation

### Technical Specifications
- Use XState for state machines
- Implement agent communication protocol
- Create task queue management
- Build resource monitoring

### Acceptance Criteria
- [ ] Agent state machines defined
- [ ] Task queue operational
- [ ] Resource allocation working
- [ ] Inter-agent communication tested
""",
                "labels": ["feature", "infrastructure", "phase-0"],
                "priority": 0,
                "estimate": 5,
            },
            {
                "title": "Integrate MCP tools framework",
                "description": """
## Task: MCP Tool Integration

### Requirements
- Set up MCP gateway proxy
- Implement tool contracts
- Create tool wrappers for:
  - sequential_thinking
  - context_search
  - playwright_test
  - linear_task
  - time_schedule

### Technical Details
```typescript
interface MCPTool {
  name: string;
  execute(params: any): Promise<Result>;
  validate(params: any): boolean;
}
```

### Acceptance Criteria
- [ ] MCP gateway operational
- [ ] All tool contracts defined
- [ ] Tool execution working
- [ ] Error handling implemented
""",
                "labels": ["feature", "mcp", "phase-0"],
                "priority": 0,
                "estimate": 5,
            },
            {
                "title": "Create GitHub integration module",
                "description": """
## Task: GitHub API Integration

### Requirements
- Implement GitHub App authentication
- Create webhook handlers
- Build PR automation
- Set up Actions orchestration

### Features
- Repository reading
- PR creation and management
- Comment posting
- Webhook event handling
- Branch protection checks

### Acceptance Criteria
- [ ] GitHub App configured
- [ ] Can read repository code
- [ ] Can create and update PRs
- [ ] Webhook events processed
""",
                "labels": ["feature", "api", "phase-0"],
                "priority": 0,
                "estimate": 3,
            },
            {
                "title": "Create Linear integration module",
                "description": """
## Task: Linear API Integration

### Requirements
- Implement Linear API client
- Create bi-directional sync
- Build task management
- Set up webhook handlers

### Features
- Task creation with templates
- Status synchronization
- Sprint tracking
- Progress reporting

### Acceptance Criteria
- [ ] Linear authentication working
- [ ] Can create tasks
- [ ] Status sync operational
- [ ] Webhook handling tested
""",
                "labels": ["feature", "api", "phase-0"],
                "priority": 0,
                "estimate": 3,
            },
            {
                "title": "Implement Evidence Store with PostgreSQL",
                "description": """
## Task: Build Evidence Store

### Requirements
- Design database schema
- Implement immutable audit logging
- Create data access layer
- Set up retention policies

### Database Schema
```sql
-- Core tables
assessments
issues
tasks
fixes
patterns
agents
audit_logs
```

### Acceptance Criteria
- [ ] Database schema created
- [ ] Migrations working
- [ ] Audit logging operational
- [ ] 90-day retention policy
""",
                "labels": ["feature", "backend", "phase-0"],
                "priority": 0,
                "estimate": 3,
            }
        ]
    })
    
    # Phase 1 - Assessment & Planning (Weeks 5-8)
    issues.append({
        "title": "[PHASE-1] AUDITOR Agent - Assessment & Planning",
        "description": """
## Phase 1: AUDITOR Implementation (Weeks 5-8)

### Objective
Build the AUDITOR agent for comprehensive code assessment.

### Scope
- Implement code quality scanning for JS/TS
- Add Python support with core rules
- Create incremental scanning with cache
- Generate prioritized backlogs

### Success Criteria
- [ ] Actionability ≥ 80% of identified issues
- [ ] False positive rate ≤ 10%
- [ ] JS/TS scan ≤ 12 min p95 (150k LOC)
- [ ] Python scan ≤ 15 min p95 (150k LOC)
- [ ] Incremental scan ≤ 3 min p95
""",
        "labels": ["epic", "auditor", "phase-1", "mvp"],
        "priority": 0,
        "estimate": 13,
        "is_mvp": True,
        "children": [
            {
                "title": "Build AUDITOR agent base class",
                "description": """
## Task: AUDITOR Base Implementation

### Requirements
- Create agent framework integration
- Implement state management
- Build MCP tool usage
- Set up inter-agent communication

### Core Features
- State machine with XState
- Task queue integration
- Evidence Store connection
- Performance monitoring

### Acceptance Criteria
- [ ] Agent lifecycle working
- [ ] State transitions tested
- [ ] Tool usage operational
- [ ] Metrics collection active
""",
                "labels": ["feature", "auditor", "phase-1"],
                "priority": 0,
                "estimate": 3,
            },
            {
                "title": "Implement JavaScript/TypeScript code analysis",
                "description": """
## Task: JS/TS Analysis Engine

### Requirements
- AST parsing with babel/typescript
- Complexity metrics (cyclomatic, cognitive)
- Dependency graph analysis
- Style guide violations
- Security scanning

### Analysis Rules
- Clean code principles
- SOLID violations
- Performance anti-patterns
- Security vulnerabilities
- Documentation coverage

### Acceptance Criteria
- [ ] AST parsing working
- [ ] All metrics calculated
- [ ] 100+ rules implemented
- [ ] Performance SLAs met
""",
                "labels": ["feature", "auditor", "phase-1"],
                "priority": 0,
                "estimate": 5,
            },
            {
                "title": "Implement Python code analysis",
                "description": """
## Task: Python Analysis Engine

### Requirements
- AST parsing with Python ast module
- Core complexity metrics
- Import analysis
- PEP8 compliance checking
- Type hint analysis

### Core Rules
- Function complexity
- Class cohesion
- Import organization
- Documentation standards
- Type safety

### Acceptance Criteria
- [ ] Python AST parsing working
- [ ] Core metrics implemented
- [ ] 50+ rules active
- [ ] Performance targets met
""",
                "labels": ["feature", "auditor", "phase-1"],
                "priority": 0,
                "estimate": 5,
            },
            {
                "title": "Create incremental scanning with caching",
                "description": """
## Task: Incremental Scan System

### Requirements
- File change detection
- Cache management
- Dependency tracking
- Partial scan execution

### Implementation
- Use git diff for changes
- PostgreSQL for cache storage
- Invalidation strategies
- Performance optimization

### Acceptance Criteria
- [ ] Change detection working
- [ ] Cache hit rate > 80%
- [ ] Incremental scan < 3 min
- [ ] Cache invalidation correct
""",
                "labels": ["feature", "auditor", "phase-1"],
                "priority": 1,
                "estimate": 3,
            },
            {
                "title": "Build prioritized backlog generation",
                "description": """
## Task: Backlog Prioritization System

### Requirements
- Severity scoring algorithm
- Effort estimation
- Impact analysis
- Linear task creation

### Prioritization Factors
- Security severity (P0-P3)
- Technical debt impact
- Code hotspot analysis
- Dependency criticality
- Fix complexity

### Acceptance Criteria
- [ ] Scoring algorithm tested
- [ ] Linear tasks created
- [ ] Priority accuracy > 85%
- [ ] Task descriptions clear
""",
                "labels": ["feature", "auditor", "phase-1"],
                "priority": 1,
                "estimate": 3,
            }
        ]
    })
    
    # Phase 2 - Execution & TDD (Weeks 9-12)
    issues.append({
        "title": "[PHASE-2] EXECUTOR & GUARDIAN - Execution & TDD",
        "description": """
## Phase 2: Execution & TDD Implementation (Weeks 9-12)

### Objective
Build EXECUTOR for Fix Pack implementation and GUARDIAN for pipeline protection.

### Scope
- Implement safe code modification with Fix Packs
- Enforce TDD with red-green-refactor cycle
- Build pipeline monitoring and auto-recovery
- Achieve diff coverage ≥ 80%

### Success Criteria
- [ ] ≥ 8 accepted Fix Pack PRs/day
- [ ] Rollback rate ≤ 0.3%
- [ ] Diff coverage ≥ 80%
- [ ] Mutation smoke ≥ 30%
- [ ] Pipeline uptime ≥ 95%
- [ ] GUARDIAN recovery ≤ 10 min p95
""",
        "labels": ["epic", "phase-2", "mvp"],
        "priority": 0,
        "estimate": 13,
        "is_mvp": True,
        "children": [
            {
                "title": "Build EXECUTOR agent for Fix Pack implementation",
                "description": """
## Task: EXECUTOR Agent Core

### Requirements
- Task execution from Linear
- Code transformation engine
- Test generation system
- Commit management

### Fix Pack Types
- Lint/format fixes
- Dead code removal
- Docstring additions
- Small refactors
- Dependency updates (patch)
- Logging normalization
- Test scaffolds

### Acceptance Criteria
- [ ] Fix Pack types implemented
- [ ] Atomic commits working
- [ ] Test generation active
- [ ] PR creation automated
""",
                "labels": ["feature", "executor", "phase-2"],
                "priority": 0,
                "estimate": 5,
            },
            {
                "title": "Implement TDD enforcement system",
                "description": """
## Task: TDD Pipeline Gates

### Requirements
- Red-Green-Refactor enforcement
- Test coverage analysis
- Mutation testing integration
- CI/CD gate configuration

### Implementation
```
[RED] → Write failing test
[GREEN] → Minimal fix
[REFACTOR] → Improve code
```

### Acceptance Criteria
- [ ] TDD cycle enforced
- [ ] Coverage gates working
- [ ] Mutation testing active
- [ ] PR templates updated
""",
                "labels": ["feature", "tdd", "executor", "phase-2"],
                "priority": 0,
                "estimate": 3,
            },
            {
                "title": "Create code transformation engine",
                "description": """
## Task: Safe Code Modification

### Requirements
- AST-based transformations
- Preserve formatting
- Maintain semantics
- Rollback capability

### Transformation Types
- Variable renaming
- Function extraction
- Import optimization
- Dead code removal
- Pattern application

### Acceptance Criteria
- [ ] AST transformations working
- [ ] Formatting preserved
- [ ] Semantics maintained
- [ ] Rollback tested
""",
                "labels": ["feature", "executor", "phase-2"],
                "priority": 0,
                "estimate": 5,
            },
            {
                "title": "Build GUARDIAN agent for pipeline monitoring",
                "description": """
## Task: GUARDIAN Pipeline Protector

### Requirements
- CI/CD event monitoring
- Failure detection
- Root cause analysis
- Auto-remediation

### Monitoring Scope
- Build failures
- Test failures
- Flaky tests
- Performance degradation
- Security violations

### Acceptance Criteria
- [ ] Event monitoring active
- [ ] Detection < 1 min
- [ ] RCA accuracy > 80%
- [ ] Auto-fix success > 90%
""",
                "labels": ["feature", "guardian", "pipeline", "phase-2"],
                "priority": 0,
                "estimate": 5,
            },
            {
                "title": "Implement mutation testing integration",
                "description": """
## Task: Mutation Testing Setup

### Requirements
- StrykerJS for JS/TS
- mutmut for Python
- Time-boxed execution (3-5 min)
- Threshold configuration

### Configuration
```javascript
// Mutation threshold ≥ 30%
// Time limit: 5 minutes
// Changed files only
```

### Acceptance Criteria
- [ ] StrykerJS configured
- [ ] mutmut configured
- [ ] Time limits enforced
- [ ] Reports generated
""",
                "labels": ["feature", "testing", "tdd", "phase-2"],
                "priority": 1,
                "estimate": 3,
            }
        ]
    })
    
    # Phase 3 - Orchestration & Learning (Weeks 13-16)
    issues.append({
        "title": "[PHASE-3] STRATEGIST & SCHOLAR - Orchestration & Learning",
        "description": """
## Phase 3: Orchestration & Learning (Weeks 13-16)

### Objective
Implement intelligent orchestration and continuous learning capabilities.

### Scope
- Build STRATEGIST for multi-agent coordination
- Implement SCHOLAR for pattern learning
- Create validated pattern catalog
- Optimize resource allocation

### Success Criteria
- [ ] ≥ 25% fixes use validated patterns
- [ ] Auto-rebase success ≥ 80%
- [ ] Resource utilization ≥ 75%
- [ ] 2+ new patterns/month
- [ ] Efficiency gain ≥ 10% month-over-month
""",
        "labels": ["epic", "phase-3"],
        "priority": 1,
        "estimate": 13,
        "children": [
            {
                "title": "Build STRATEGIST orchestration agent",
                "description": """
## Task: STRATEGIST Coordinator

### Requirements
- Multi-agent coordination
- Task scheduling algorithms
- Resource allocation
- Progress tracking

### Coordination Features
- Task dependencies
- Agent availability
- Priority management
- Conflict resolution
- Load balancing

### Acceptance Criteria
- [ ] Scheduling algorithm working
- [ ] Resource allocation optimal
- [ ] No agent deadlocks
- [ ] Progress tracking accurate
""",
                "labels": ["feature", "strategist", "phase-3"],
                "priority": 1,
                "estimate": 5,
            },
            {
                "title": "Implement SCHOLAR learning engine",
                "description": """
## Task: SCHOLAR Pattern Learning

### Requirements
- Fix analysis system
- Pattern extraction
- Validation framework
- Knowledge base management

### Learning Process
1. Analyze successful fixes
2. Extract common patterns
3. Validate effectiveness
4. Update knowledge base
5. Train other agents

### Acceptance Criteria
- [ ] Pattern extraction working
- [ ] Validation metrics defined
- [ ] Knowledge base operational
- [ ] Agent training functional
""",
                "labels": ["feature", "scholar", "phase-3"],
                "priority": 1,
                "estimate": 5,
            },
            {
                "title": "Create pattern catalog and validation",
                "description": """
## Task: Pattern Management System

### Requirements
- Pattern storage schema
- Confidence scoring
- A/B testing framework
- Expiration policies

### Pattern Types
- Code transformations
- Test patterns
- Fix strategies
- Anti-pattern detection
- Performance optimizations

### Acceptance Criteria
- [ ] Catalog schema defined
- [ ] Confidence scores calculated
- [ ] A/B testing operational
- [ ] 25+ patterns cataloged
""",
                "labels": ["feature", "scholar", "phase-3"],
                "priority": 1,
                "estimate": 3,
            },
            {
                "title": "Build resource allocation optimizer",
                "description": """
## Task: Resource Optimization

### Requirements
- CPU/memory monitoring
- Cost tracking
- Throughput optimization
- Budget enforcement

### Optimization Strategies
- Dynamic agent scaling
- Priority-based allocation
- Cost-aware scheduling
- Performance prediction

### Acceptance Criteria
- [ ] Resource monitoring active
- [ ] Cost tracking accurate
- [ ] Utilization ≥ 75%
- [ ] Budget limits enforced
""",
                "labels": ["feature", "strategist", "phase-3"],
                "priority": 2,
                "estimate": 3,
            }
        ]
    })
    
    # Phase 4 - Scale & Polish (Weeks 17-20)
    issues.append({
        "title": "[PHASE-4] Scale & Polish - Production Readiness",
        "description": """
## Phase 4: Scale & Polish (Weeks 17-20)

### Objective
Prepare system for production deployment and GA rollout.

### Scope
- Multi-repository support (up to 3)
- Dashboard implementation
- Budget controls
- Security hardening

### Success Criteria
- [ ] Beta SLOs achieved for 30 days
- [ ] 99.5% availability
- [ ] Cost per fix ≤ $3 median
- [ ] All guardrails enforced
- [ ] Ready for GA rollout
""",
        "labels": ["epic", "phase-4"],
        "priority": 2,
        "estimate": 13,
        "children": [
            {
                "title": "Implement multi-repository support",
                "description": """
## Task: Multi-Repo Scaling

### Requirements
- Repository isolation
- Concurrent processing
- Resource partitioning
- Cross-repo reporting

### Scaling Target
- 3 repos concurrently
- Up to 200k LOC each
- Isolated data/processing
- Unified dashboard

### Acceptance Criteria
- [ ] 3 repos processing
- [ ] No cross-contamination
- [ ] Performance maintained
- [ ] Reporting unified
""",
                "labels": ["feature", "infrastructure", "phase-4"],
                "priority": 2,
                "estimate": 5,
            },
            {
                "title": "Build monitoring dashboard",
                "description": """
## Task: Web Dashboard UI

### Requirements
- Real-time monitoring
- Agent status display
- Metrics visualization
- Progress tracking

### Dashboard Features
- Agent health status
- Task throughput graphs
- Cost analysis
- Pattern usage stats
- Error logs

### Acceptance Criteria
- [ ] Real-time updates working
- [ ] All metrics displayed
- [ ] Responsive design
- [ ] Export capabilities
""",
                "labels": ["feature", "frontend", "phase-4"],
                "priority": 2,
                "estimate": 5,
            },
            {
                "title": "Implement budget controls and throttling",
                "description": """
## Task: Cost Management System

### Requirements
- Per-repo budget limits
