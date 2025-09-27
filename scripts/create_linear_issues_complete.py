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
    """Define all issues based on the PRD - Part 1 of 2"""
    issues = []
    
    # Phase 0 - Foundation (Weeks 1-4)
    phase0 = {
        "title": "[PHASE-0] Foundation Setup",
        "description": """## Phase 0: Foundation Setup (Weeks 1-4)

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
- [ ] Works with both JS/TS and Python repos""",
        "labels": ["epic", "phase-0", "mvp", "infrastructure"],
        "priority": 0,
        "estimate": 13,
        "is_mvp": True,
        "children": [
            {
                "title": "Set up project structure and development environment",
                "description": """## Task: Initialize Project Structure

### Requirements
- Create TypeScript/Node.js 20 project
- Set up monorepo structure for agents
- Configure build and development tools
- Set up testing framework (Vitest)

### Acceptance Criteria
- [ ] TypeScript compilation working
- [ ] ESLint and Prettier configured
- [ ] Pre-commit hooks installed
- [ ] CI/CD pipeline template ready""",
                "labels": ["task", "infrastructure", "phase-0"],
                "priority": 0,
                "estimate": 3,
            }
        ]
    }
    issues.append(phase0)
    
    # Phase 1 - Assessment
    phase1 = {
        "title": "[PHASE-1] AUDITOR Agent - Assessment & Planning",
        "description": """## Phase 1: AUDITOR Implementation (Weeks 5-8)

### Objective
Build the AUDITOR agent for comprehensive code assessment.

### Success Criteria
- [ ] Actionability ≥ 80% of identified issues
- [ ] False positive rate ≤ 10%
- [ ] JS/TS scan ≤ 12 min p95 (150k LOC)
- [ ] Python scan ≤ 15 min p95 (150k LOC)
- [ ] Incremental scan ≤ 3 min p95""",
        "labels": ["epic", "auditor", "phase-1", "mvp"],
        "priority": 0,
        "estimate": 13,
        "is_mvp": True,
        "children": []
    }
    issues.append(phase1)
    
    # Phase 2 - Execution
    phase2 = {
        "title": "[PHASE-2] EXECUTOR & GUARDIAN - Execution & TDD",
        "description": """## Phase 2: Execution & TDD Implementation (Weeks 9-12)

### Objective
Build EXECUTOR for Fix Pack implementation and GUARDIAN for pipeline protection.

### Success Criteria
- [ ] ≥ 8 accepted Fix Pack PRs/day
- [ ] Rollback rate ≤ 0.3%
- [ ] Diff coverage ≥ 80%
- [ ] Mutation smoke ≥ 30%
- [ ] Pipeline uptime ≥ 95%""",
        "labels": ["epic", "phase-2", "mvp"],
        "priority": 0,
        "estimate": 13,
        "is_mvp": True,
        "children": []
    }
    issues.append(phase2)
    
    # Phase 3 - Learning
    phase3 = {
        "title": "[PHASE-3] STRATEGIST & SCHOLAR - Orchestration & Learning",
        "description": """## Phase 3: Orchestration & Learning (Weeks 13-16)

### Objective
Implement intelligent orchestration and continuous learning capabilities.

### Success Criteria
- [ ] ≥ 25% fixes use validated patterns
- [ ] Auto-rebase success ≥ 80%
- [ ] Resource utilization ≥ 75%
- [ ] 2+ new patterns/month""",
        "labels": ["epic", "phase-3"],
        "priority": 1,
        "estimate": 13,
        "children": []
    }
    issues.append(phase3)
    
    # Phase 4 - Scale
    phase4 = {
        "title": "[PHASE-4] Scale & Polish - Production Readiness",
        "description": """## Phase 4: Scale & Polish (Weeks 17-20)

### Objective
Prepare system for production deployment and GA rollout.

### Success Criteria
- [ ] Beta SLOs achieved for 30 days
- [ ] 99.5% availability
- [ ] Cost per fix ≤ $3 median
- [ ] All guardrails enforced""",
        "labels": ["epic", "phase-4"],
        "priority": 2,
        "estimate": 13,
        "children": []
    }
    issues.append(phase4)
    
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
        output_file = "created_linear_issues.json"
        with open(output_file, "w") as f:
            json.dump(creator.created_issues, f, indent=2)
        print(f"\n💾 Issue list saved to: {output_file}")

if __name__ == "__main__":
    main()
