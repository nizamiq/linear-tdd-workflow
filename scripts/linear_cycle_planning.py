#!/usr/bin/env python3
"""
Linear Cycle Planning & Work Alignment Script
Comprehensive analysis and intelligent planning for the next cycle
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import math

# Configuration
LINEAR_API_KEY = os.getenv('LINEAR_API_KEY', os.getenv('LINEAR_API_KEY'))
LINEAR_API_URL = "https://api.linear.app/graphql"
PROJECT_NAME = "ai-coding"  # Fixed typo
TEAM_KEY = "ACO"  # Using the actual team key from Linear
TEAM_NAME = "a-coders"

# Headers for Linear API
headers = {
    "Authorization": LINEAR_API_KEY,
    "Content-Type": "application/json"
}

class LinearCyclePlanner:
    def __init__(self):
        self.team_id = None
        self.project_id = None
        self.current_cycle = None
        self.next_cycle = None
        self.all_issues = []
        self.backlog_issues = []
        self.cycle_issues = []
        self.team_velocity = 0
        self.label_map = {}
        self.state_map = {}
        
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
    
    def get_team_and_project(self):
        """Get team and project IDs"""
        print("🔍 Finding team and project...")
        
        # Get team
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
                if team["key"].lower() == TEAM_KEY.lower():
                    self.team_id = team["id"]
                    print(f"  ✓ Found team '{team['name']}' (ID: {team['id'][:8]}...)")
                    break
        
        # Get project
        query = """
        query($name: String) {
            projects(filter: { name: { containsIgnoreCase: $name } }) {
                nodes {
                    id
                    name
                    description
                    progress
                    startedAt
                }
            }
        }
        """
        
        data = self.graphql_request(query, {"name": PROJECT_NAME})
        if data and data["projects"]["nodes"]:
            project = data["projects"]["nodes"][0]
            self.project_id = project["id"]
            print(f"  ✓ Found project '{project['name']}'")
            print(f"    Progress: {project['progress']*100:.1f}%")
    
    def analyze_current_cycle(self):
        """Analyze current cycle health and progress"""
        print("\n" + "="*60)
        print("📊 PHASE 1: Current Cycle Analysis")
        print("="*60)
        
        # Get current and upcoming cycles
        query = """
        query GetCycles($teamId: String!) {
            team(id: $teamId) {
                activeCycle {
                    id
                    name
                    number
                    startsAt
                    endsAt
                    progress
                    completedScopeHistory
                    scopeHistory
                    completedIssueCountHistory
                    issueCountHistory
                }
                upcomingCycle {
                    id
                    name
                    number
                    startsAt
                    endsAt
                }
                cycles(first: 5, filter: { isActive: { eq: false }, isPast: { eq: true } }) {
                    nodes {
                        id
                        name
                        completedScopeHistory
                        scopeHistory
                    }
                }
            }
        }
        """
        
        data = self.graphql_request(query, {"teamId": self.team_id})
        if not data:
            print("❌ Could not fetch cycles")
            return
        
        team_data = data["team"]
        self.current_cycle = team_data.get("activeCycle")
        self.next_cycle = team_data.get("upcomingCycle")
        
        # Calculate velocity from past cycles
        past_cycles = team_data["cycles"]["nodes"] if "cycles" in team_data else []
        velocities = []
        for cycle in past_cycles:
            if cycle["scopeHistory"] and cycle["completedScopeHistory"]:
                completed = cycle["completedScopeHistory"][-1] if cycle["completedScopeHistory"] else 0
                velocities.append(completed)
        
        self.team_velocity = sum(velocities) / len(velocities) if velocities else 20
        
        if self.current_cycle:
            print(f"\n📅 Current Cycle: {self.current_cycle['name']}")
            print("-"*40)
            
            # Calculate days remaining
            end_date = datetime.fromisoformat(self.current_cycle['endsAt'].replace('Z', '+00:00'))
            days_remaining = (end_date - datetime.now(end_date.tzinfo)).days
            
            # Get scope and completion
            scope = self.current_cycle['scopeHistory'][-1] if self.current_cycle['scopeHistory'] else 0
            completed = self.current_cycle['completedScopeHistory'][-1] if self.current_cycle['completedScopeHistory'] else 0
            
            print(f"  Progress: {self.current_cycle['progress']*100:.1f}%")
            print(f"  Days Remaining: {days_remaining}")
            print(f"  Scope: {scope} points")
            print(f"  Completed: {completed} points")
            print(f"  Velocity Rate: {completed/max(1, scope)*100:.1f}%")
            
            # Get issues in current cycle
            self.get_cycle_issues()
            
            # Analyze at-risk items
            at_risk = self.analyze_at_risk_issues(days_remaining)
            
            print(f"\n📊 Issue Breakdown:")
            print(f"  Total Issues: {len(self.cycle_issues)}")
            print(f"  At Risk: {len(at_risk)}")
            
            # Calculate likely carryover
            carryover_points = self.calculate_carryover(days_remaining)
            print(f"  Likely Carryover: {carryover_points} points")
        
        print(f"\n📈 Team Metrics:")
        print(f"  Average Velocity: {self.team_velocity:.1f} points/cycle")
        print(f"  Historical Velocities: {', '.join([str(int(v)) for v in velocities[-3:]])}")
    
    def get_cycle_issues(self):
        """Get all issues in current cycle"""
        if not self.current_cycle:
            return
        
        query = """
        query GetCycleIssues($cycleId: String!) {
            issues(filter: { cycle: { id: { eq: $cycleId } } }) {
                nodes {
                    id
                    identifier
                    title
                    state {
                        name
                        type
                    }
                    priority
                    estimate
                    assignee {
                        name
                        email
                    }
                    labels {
                        nodes {
                            name
                        }
                    }
                    parent {
                        id
                        title
                    }
                    children {
                        nodes {
                            id
                            state {
                                type
                            }
                        }
                    }
                    completedAt
                    startedAt
                    createdAt
                }
            }
        }
        """
        
        data = self.graphql_request(query, {"cycleId": self.current_cycle['id']})
        if data:
            self.cycle_issues = data["issues"]["nodes"]
            
            # Categorize by state
            states = {}
            for issue in self.cycle_issues:
                state = issue["state"]["type"]
                states[state] = states.get(state, 0) + 1
            
            print("\n  State Distribution:")
            for state, count in sorted(states.items()):
                print(f"    {state}: {count}")
    
    def analyze_at_risk_issues(self, days_remaining):
        """Identify issues at risk of not completing"""
        at_risk = []
        
        for issue in self.cycle_issues:
            if issue["state"]["type"] in ["unstarted", "backlog"]:
                # Not started with less than 3 days
                if days_remaining < 3:
                    at_risk.append(issue)
            elif issue["state"]["type"] == "started":
                # Started but not progressing
                if issue.get("startedAt"):
                    started = datetime.fromisoformat(issue["startedAt"].replace('Z', '+00:00'))
                    days_in_progress = (datetime.now(started.tzinfo) - started).days
                    if days_in_progress > 5:  # Stuck for more than 5 days
                        at_risk.append(issue)
        
        return at_risk
    
    def calculate_carryover(self, days_remaining):
        """Calculate likely carryover points"""
        carryover = 0
        daily_velocity = self.team_velocity / 10  # Assume 10 working days per cycle
        
        for issue in self.cycle_issues:
            if issue["state"]["type"] in ["unstarted", "backlog", "started"]:
                estimate = issue.get("estimate", 0)
                if issue["state"]["type"] == "started":
                    # Assume 50% complete for started issues
                    estimate = estimate * 0.5
                
                # Check if can complete in remaining days
                if estimate > daily_velocity * days_remaining:
                    carryover += estimate
        
        return carryover
    
    def analyze_backlog(self):
        """Comprehensive backlog analysis"""
        print("\n" + "="*60)
        print("📚 PHASE 2: Backlog Analysis")
        print("="*60)
        
        # Get all backlog issues
        query = """
        query GetBacklog($teamId: String!) {
            issues(
                filter: {
                    team: { id: { eq: $teamId } }
                    state: { type: { in: ["backlog", "unstarted", "triage"] } }
                    cycle: { null: true }
                }
                first: 200
            ) {
                nodes {
                    id
                    identifier
                    title
                    description
                    priority
                    estimate
                    labels {
                        nodes {
                            name
                        }
                    }
                    parent {
                        id
                        title
                    }
                    children {
                        nodes {
                            id
                        }
                    }
                    relations {
                        nodes {
                            type
                            relatedIssue {
                                id
                                identifier
                                state {
                                    type
                                }
                            }
                        }
                    }
                    createdAt
                }
            }
        }
        """
        
        data = self.graphql_request(query, {"teamId": self.team_id})
        if data:
            self.backlog_issues = data["issues"]["nodes"]
            print(f"\n📋 Total Backlog Items: {len(self.backlog_issues)}")
            
            # Categorize backlog
            categories = {
                "critical_bugs": [],
                "security_issues": [],
                "features": [],
                "improvements": [],
                "tech_debt": [],
                "documentation": [],
                "other": []
            }
            
            for issue in self.backlog_issues:
                labels = [label["name"] for label in issue["labels"]["nodes"]]
                
                # Calculate value score
                value_score = self.calculate_value_score(issue)
                issue["value_score"] = value_score
                
                # Check dependencies
                issue["blocked_by"] = self.get_blocking_issues(issue)
                issue["blocks"] = self.get_blocked_issues(issue)
                
                # Categorize
                if "bug" in labels and issue["priority"] <= 1:
                    categories["critical_bugs"].append(issue)
                elif "security" in labels:
                    categories["security_issues"].append(issue)
                elif "feature" in labels:
                    categories["features"].append(issue)
                elif "improvement" in labels:
                    categories["improvements"].append(issue)
                elif "tech-debt" in labels or "tdd" in labels:
                    categories["tech_debt"].append(issue)
                elif "documentation" in labels:
                    categories["documentation"].append(issue)
                else:
                    categories["other"].append(issue)
            
            # Sort each category by value score
            for category in categories:
                categories[category].sort(key=lambda x: x["value_score"], reverse=True)
            
            # Print analysis
            print("\n📊 Backlog Breakdown:")
            print("-"*40)
            for category, issues in categories.items():
                if issues:
                    total_points = sum(i.get("estimate", 0) for i in issues)
                    print(f"  {category.replace('_', ' ').title()}: {len(issues)} issues ({total_points} points)")
                    
                    # Show top 3 by value
                    if len(issues) > 0:
                        print(f"    Top priority items:")
                        for issue in issues[:3]:
                            print(f"      • [{issue['identifier']}] {issue['title'][:50]}... (score: {issue['value_score']}/100)")
            
            self.backlog_categories = categories
            return categories
    
    def calculate_value_score(self, issue):
        """Calculate value score for an issue (0-100)"""
        score = 50  # Base score
        
        # Priority boost
        priority_scores = {0: 30, 1: 20, 2: 10, 3: 5, 4: 0}
        score += priority_scores.get(issue.get("priority", 2), 5)
        
        # Label boost
        labels = [label["name"] for label in issue["labels"]["nodes"]]
        if "mvp" in labels:
            score += 20
        if "security" in labels:
            score += 15
        if "bug" in labels:
            score += 10
        if "tdd" in labels or "clean-code" in labels:
            score += 10
        
        # Size penalty (prefer smaller items)
        estimate = issue.get("estimate", 0)
        if estimate > 0:
            if estimate <= 3:
                score += 10  # Quick win
            elif estimate >= 8:
                score -= 10  # Large item
        
        # Age boost (older items get priority)
        created = datetime.fromisoformat(issue["createdAt"].replace('Z', '+00:00'))
        age_days = (datetime.now(created.tzinfo) - created).days
        if age_days > 30:
            score += 10
        elif age_days > 14:
            score += 5
        
        # Parent/child relationships
        if issue.get("parent"):
            score -= 5  # Subtasks slightly lower priority
        if issue.get("children") and issue["children"]["nodes"]:
            score += 5  # Parent tasks with subtasks
        
        return min(100, max(0, score))
    
    def get_blocking_issues(self, issue):
        """Get issues that block this issue"""
        blocking = []
        if "relations" in issue:
            for relation in issue["relations"]["nodes"]:
                if relation["type"] == "blocks":
                    blocking.append(relation["relatedIssue"])
        return blocking
    
    def get_blocked_issues(self, issue):
        """Get issues blocked by this issue"""
        blocked = []
        if "relations" in issue:
            for relation in issue["relations"]["nodes"]:
                if relation["type"] == "blocked":
                    blocked.append(relation["relatedIssue"])
        return blocked
    
    def plan_next_cycle(self):
        """Intelligently compose the next cycle"""
        print("\n" + "="*60)
        print("🎯 PHASE 3: Next Cycle Planning")
        print("="*60)
        
        if not self.next_cycle:
            print("❌ No upcoming cycle found. Please create one in Linear.")
            return None, None
        
        print(f"\n📅 Planning for: {self.next_cycle['name']}")
        print("-"*40)
        
        # Calculate available capacity
        carryover = self.calculate_carryover(5) if self.current_cycle else 0
        buffer = self.team_velocity * 0.15  # 15% buffer
        available_capacity = self.team_velocity - carryover - buffer
        
        print(f"\n📊 Capacity Planning:")
        print(f"  Team Velocity: {self.team_velocity:.0f} points")
        print(f"  Carryover: {carryover:.0f} points")
        print(f"  Buffer (15%): {buffer:.0f} points")
        print(f"  Available for New: {available_capacity:.0f} points")
        
        # Select issues for cycle
        selected_issues = self.select_issues_for_cycle(available_capacity)
        
        # Calculate composition
        composition = {
            "must_have": [],
            "should_have": [],
            "could_have": []
        }
        
        allocated = 0
        for issue in selected_issues:
            estimate = issue["issue"].get("estimate", 0)
            if allocated + estimate <= available_capacity * 0.7:
                composition["must_have"].append(issue)
            elif allocated + estimate <= available_capacity * 0.9:
                composition["should_have"].append(issue)
            else:
                composition["could_have"].append(issue)
            allocated += estimate
        
        print(f"\n📋 Selected Issues: {len(selected_issues)}")
        print(f"  Must Have: {len(composition['must_have'])} issues")
        print(f"  Should Have: {len(composition['should_have'])} issues")
        print(f"  Could Have: {len(composition['could_have'])} issues")
        print(f"  Total Points Allocated: {allocated:.0f}")
        
        # Work type balance
        balance = self.calculate_work_balance(selected_issues)
        print(f"\n⚖️ Work Balance:")
        for work_type, points in balance.items():
            percentage = (points / max(1, allocated)) * 100
            print(f"  {work_type}: {points:.0f} points ({percentage:.0f}%)")
        
        return composition, selected_issues
    
    def select_issues_for_cycle(self, capacity):
        """Smart algorithm to select optimal set of issues"""
        selected = []
        remaining_capacity = capacity
        
        # Priority 1: Critical bugs and security issues
        for issue in self.backlog_categories.get("critical_bugs", []) + self.backlog_categories.get("security_issues", []):
            estimate = issue.get("estimate", 3)
            if estimate <= remaining_capacity:
                if not self.has_unresolved_blockers(issue):
                    selected.append({
                        "issue": issue,
                        "reason": "Critical priority",
                        "value_score": issue["value_score"]
                    })
                    remaining_capacity -= estimate
        
        # Priority 2: High-value unblocking issues
        for category in ["features", "improvements", "tech_debt"]:
            for issue in self.backlog_categories.get(category, []):
                if issue.get("blocks"):
                    estimate = issue.get("estimate", 3)
                    if estimate <= remaining_capacity:
                        selected.append({
                            "issue": issue,
                            "reason": f"Unblocks {len(issue['blocks'])} issues",
                            "value_score": issue["value_score"]
                        })
                        remaining_capacity -= estimate
        
        # Priority 3: Balanced allocation
        allocation_targets = {
            "features": 0.40 * capacity,
            "tech_debt": 0.20 * capacity,
            "improvements": 0.20 * capacity,
            "documentation": 0.10 * capacity
        }
        
        for category, target_points in allocation_targets.items():
            allocated = 0
            for issue in self.backlog_categories.get(category, []):
                if allocated >= target_points:
                    break
                
                estimate = issue.get("estimate", 3)
                if estimate <= remaining_capacity:
                    if not self.has_unresolved_blockers(issue):
                        selected.append({
                            "issue": issue,
                            "reason": f"{category.title()} - Value: {issue['value_score']}",
                            "value_score": issue["value_score"]
                        })
                        remaining_capacity -= estimate
                        allocated += estimate
        
        # Priority 4: Quick wins to fill remaining capacity
        for category in self.backlog_categories:
            for issue in self.backlog_categories[category]:
                estimate = issue.get("estimate", 3)
                if estimate <= 2 and estimate <= remaining_capacity:  # Quick wins (1-2 points)
                    if not any(s["issue"]["id"] == issue["id"] for s in selected):
                        selected.append({
                            "issue": issue,
                            "reason": "Quick win",
                            "value_score": issue["value_score"]
                        })
                        remaining_capacity -= estimate
        
        return selected
    
    def has_unresolved_blockers(self, issue):
        """Check if issue has unresolved blocking dependencies"""
        if issue.get("blocked_by"):
            for blocker in issue["blocked_by"]:
                if blocker["state"]["type"] not in ["completed", "canceled"]:
                    return True
        return False
    
    def calculate_work_balance(self, selected_issues):
        """Calculate work type balance"""
        balance = {
            "Features": 0,
            "Tech Debt": 0,
            "Bugs": 0,
            "Improvements": 0,
            "Documentation": 0
        }
        
        for item in selected_issues:
            issue = item["issue"]
            labels = [label["name"] for label in issue["labels"]["nodes"]]
            estimate = issue.get("estimate", 0)
            
            if "feature" in labels:
                balance["Features"] += estimate
            elif "bug" in labels:
                balance["Bugs"] += estimate
            elif "tech-debt" in labels or "tdd" in labels:
                balance["Tech Debt"] += estimate
            elif "documentation" in labels:
                balance["Documentation"] += estimate
            else:
                balance["Improvements"] += estimate
        
        return balance
    
    def create_cycle_planning_issue(self, composition, selected_issues):
        """Create comprehensive cycle planning issue in Linear"""
        print("\n" + "="*60)
        print("📝 PHASE 4: Creating Planning Documentation")
        print("="*60)
        
        # Build description
        description = f"""# Cycle Planning: {self.next_cycle['name']}

## 🎯 Cycle Theme
**Balanced Sprint: Features, Tech Debt & Quality**

## 📊 Capacity Planning
| Metric | Points |
|--------|--------|
| Team Velocity | {self.team_velocity:.0f} |
| Carryover from Current | {self.calculate_carryover(5):.0f} |
| Available for New Work | {self.team_velocity - self.calculate_carryover(5) - self.team_velocity * 0.15:.0f} |
| Buffer | {self.team_velocity * 0.15:.0f} |

## 📋 Selected Issues

### ✅ Must Have (Committed)
"""
        
        for item in composition["must_have"]:
            issue = item["issue"]
            description += f"- [{issue['identifier']}] {issue['title']} ({issue.get('estimate', 0)} pts) - {item['reason']}\n"
        
        description += "\n### 🎯 Should Have (Likely)\n"
        for item in composition["should_have"]:
            issue = item["issue"]
            description += f"- [{issue['identifier']}] {issue['title']} ({issue.get('estimate', 0)} pts) - {item['reason']}\n"
        
        description += "\n### 🚀 Could Have (Stretch)\n"
        for item in composition["could_have"]:
            issue = item["issue"]
            description += f"- [{issue['identifier']}] {issue['title']} ({issue.get('estimate', 0)} pts) - {item['reason']}\n"
        
        balance = self.calculate_work_balance(selected_issues)
        total_points = sum(balance.values())
        
        description += f"""

## ⚖️ Work Balance
| Category | Points | Percentage |
|----------|--------|------------|
"""
        
        for work_type, points in balance.items():
            percentage = (points / max(1, total_points)) * 100
            description += f"| {work_type} | {points:.0f} | {percentage:.0f}% |\n"
        
        description += f"""

## 🎯 Success Criteria
- Complete all Must Have items
- Maintain test coverage above 80%
- Zero critical bugs introduced
- All PRs reviewed within 24 hours
- Sprint velocity within 10% of target

## 📈 Key Metrics to Track
- Daily velocity (target: {self.team_velocity / 10:.1f} points/day)
- PR merge rate
- Test coverage delta
- Bug discovery rate
- Cycle time per issue

## ⚠️ Risks & Mitigations
1. **Carryover from current cycle** - Front-load quick wins to build momentum
2. **Tech debt complexity** - Pair programming on complex refactoring
3. **Dependencies between issues** - Clear sequencing in daily standups

## 📅 Important Dates
- Cycle Start: {self.next_cycle['startsAt'][:10]}
- Mid-Cycle Review: TBD
- Cycle End: {self.next_cycle['endsAt'][:10]}

Generated by Claude Code Cycle Planner
"""
        
        # Create the issue
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
        
        variables = {
            "input": {
                "teamId": self.team_id,
                "title": f"[Cycle Planning] {self.next_cycle['name']} - Planning & Tracking",
                "description": description,
                "priority": 1,
                "cycleId": self.next_cycle["id"]
            }
        }
        
        data = self.graphql_request(mutation, variables)
        if data and data["issueCreate"]["success"]:
            issue = data["issueCreate"]["issue"]
            print(f"\n✅ Created planning issue: [{issue['identifier']}]")
            print(f"   URL: {issue['url']}")
            return issue
        
        return None
    
    def create_claude_work_log(self):
        """Create Claude Code work tracking issue"""
        print("\n📝 Creating Claude Code Work Log...")
        
        description = f"""# Claude Code Work Queue - {self.next_cycle['name']}

## 🤖 Assigned Tasks
*Tasks will be populated when cycle begins*

## 📊 Personal Metrics
- Sprint Capacity: TBD
- Daily Velocity Target: TBD

## 🎯 Daily Plan
| Day | Planned | Completed | Blockers | Notes |
|-----|---------|-----------|----------|--------|
| Day 1 | - | - | - | - |
| Day 2 | - | - | - | - |
| Day 3 | - | - | - | - |
| Day 4 | - | - | - | - |
| Day 5 | - | - | - | - |
| Day 6 | - | - | - | - |
| Day 7 | - | - | - | - |
| Day 8 | - | - | - | - |
| Day 9 | - | - | - | - |
| Day 10 | - | - | - | - |

## 🔧 Technical Preparation
- [ ] Development environment ready
- [ ] All dependencies installed
- [ ] Test suite passing
- [ ] Git branches created
- [ ] Access to all required systems

## 📝 Decision Log
*Technical decisions will be documented here during the sprint*

## 🔄 Self-Management Rules
1. Update this log daily with progress
2. Move issues through workflow states as work progresses
3. Document blockers immediately
4. Create checkpoint comments when context switching
5. Track actual vs estimated time
6. Update task estimates if significantly off

## 📈 Progress Tracking
*Daily updates will be added below*

---
Generated by Claude Code Cycle Planner
"""
        
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
        
        variables = {
            "input": {
                "teamId": self.team_id,
                "title": f"[CC Work Log] {self.next_cycle['name']} - Claude Code Task Queue",
                "description": description,
                "priority": 2,
                "cycleId": self.next_cycle["id"]
            }
        }
        
        data = self.graphql_request(mutation, variables)
        if data and data["issueCreate"]["success"]:
            issue = data["issueCreate"]["issue"]
            print(f"✅ Created work log: [{issue['identifier']}]")
            print(f"   URL: {issue['url']}")
            return issue
        
        return None
    
    def assign_issues_to_cycle(self, selected_issues):
        """Assign selected issues to the next cycle"""
        print("\n🔄 Assigning issues to next cycle...")
        
        assigned_count = 0
        failed_count = 0
        
        mutation = """
        mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
            issueUpdate(id: $id, input: $input) {
                success
                issue {
                    id
                    identifier
                    cycle {
                        name
                    }
                }
            }
        }
        """
        
        for item in selected_issues:
            issue = item["issue"]
            variables = {
                "id": issue["id"],
                "input": {
                    "cycleId": self.next_cycle["id"],
                    "stateId": self.get_todo_state()
                }
            }
            
            data = self.graphql_request(mutation, variables)
            if data and data["issueUpdate"]["success"]:
                assigned_count += 1
                print(f"  ✓ Assigned [{issue['identifier']}] to cycle")
            else:
                failed_count += 1
                print(f"  ❌ Failed to assign [{issue['identifier']}]")
        
        print(f"\nAssignment Summary:")
        print(f"  ✅ Successfully assigned: {assigned_count}")
        print(f"  ❌ Failed: {failed_count}")
    
    def get_todo_state(self):
        """Get the TODO state ID for the team"""
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
                if state["type"] in ["unstarted", "backlog"]:
                    return state["id"]
        return None
    
    def create_kickoff_issue(self):
        """Create cycle kickoff announcement"""
        print("\n🚀 Creating cycle kickoff materials...")
        
        description = f"""# 🚀 Cycle {self.next_cycle['name']} Kickoff

## 🎯 Cycle Theme
**Balanced Sprint: Features, Tech Debt & Quality**

## 📊 Key Metrics
- **Total Points**: {self.team_velocity:.0f}
- **Duration**: 10 working days
- **Team Velocity Target**: {self.team_velocity / 10:.1f} points/day

## 🏆 Goals for This Cycle
1. Complete all Must Have items
2. Improve test coverage by 10%
3. Zero critical bugs in production
4. Reduce technical debt backlog
5. Ship at least one major feature

## 📅 Key Dates
- **Start**: {self.next_cycle['startsAt'][:10]}
- **Mid-Cycle Check**: TBD
- **End**: {self.next_cycle['endsAt'][:10]}
- **Retrospective**: Day after cycle end

## 🔄 Daily Standups
- Time: 10:00 AM (or async updates)
- Focus: Blockers, progress, and dependencies
- Claude Code will post daily updates in work log

## 📈 Success Metrics
- Sprint velocity within 10% of target
- All Must Have items completed
- Test coverage ≥ 80%
- Customer satisfaction maintained
- Zero P0/P1 bugs introduced

## 🎬 Ready to Start!
All planning complete. Let's make this cycle a success!

---
Generated by Claude Code Cycle Planner
"""
        
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
        
        variables = {
            "input": {
                "teamId": self.team_id,
                "title": f"🚀 [Kickoff] {self.next_cycle['name']} - Ready to Start",
                "description": description,
                "priority": 1,
                "cycleId": self.next_cycle["id"]
            }
        }
        
        data = self.graphql_request(mutation, variables)
        if data and data["issueCreate"]["success"]:
            issue = data["issueCreate"]["issue"]
            print(f"✅ Created kickoff issue: [{issue['identifier']}]")
            print(f"   URL: {issue['url']}")
            return issue
        
        return None


def main():
    """Main execution function"""
    print("""
    ╔══════════════════════════════════════════╗
    ║   Linear Cycle Planning & Alignment       ║
    ║          Claude Code v2.0                 ║
    ╚══════════════════════════════════════════╝
    """)
    
    try:
        planner = LinearCyclePlanner()
        
        # Get team and project
        planner.get_team_and_project()
        
        if not planner.team_id:
            print("\n❌ Could not find team. Please check configuration.")
            return
        
        # Phase 1: Analyze current cycle
        planner.analyze_current_cycle()
        
        # Phase 2: Analyze backlog
        planner.analyze_backlog()
        
        # Phase 3: Plan next cycle
        composition, selected_issues = planner.plan_next_cycle()
        
        if not composition or not selected_issues:
            print("\n⚠️ Could not create cycle plan. Please ensure you have an upcoming cycle in Linear.")
            return
        
        # Phase 4: Create planning documentation
        planning_issue = planner.create_cycle_planning_issue(composition, selected_issues)
        work_log = planner.create_claude_work_log()
        
        # Phase 5: Assign issues to cycle (optional - can be done manually)
        print("\n" + "="*60)
        print("📝 PHASE 5: Issue Assignment")
        print("="*60)
        
        assign_choice = input("\nDo you want to automatically assign selected issues to the next cycle? (y/n): ")
        if assign_choice.lower() == 'y':
            planner.assign_issues_to_cycle(selected_issues)
        else:
            print("ℹ️ Skipping automatic assignment. You can assign issues manually in Linear.")
        
        # Phase 6: Create kickoff materials
        kickoff = planner.create_kickoff_issue()
        
        # Final summary
        print(f"""
        
        ╔══════════════════════════════════════════╗
        ║         Planning Complete! 🎉             ║
        ╚══════════════════════════════════════════╝
        
        📊 Cycle Planning Summary:
        ├─ Cycle: {planner.next_cycle['name']}
        ├─ Duration: 10 days
        ├─ Total Points: {planner.team_velocity:.0f}
        ├─ Issues Selected: {len(selected_issues)}
        └─ Categories: Features, Tech Debt, Bugs
        
        📈 Work Distribution:
        ├─ Features: ~40%
        ├─ Tech Debt: ~20%
        ├─ Bugs: ~20%
        └─ Improvements: ~20%
        
        🔗 Key Linear Links:
        ├─ Planning Issue: {planning_issue['url'] if planning_issue else 'Not created'}
        ├─ Work Log: {work_log['url'] if work_log else 'Not created'}
        └─ Kickoff Issue: {kickoff['url'] if kickoff else 'Not created'}
        
        🚀 Next Steps:
        1. Review selected issues in Linear
        2. Adjust priorities if needed
        3. Assign team members to issues
        4. Complete pre-cycle checklist
        5. Begin execution on {planner.next_cycle['startsAt'][:10]}
        
        🤖 Claude Code Status: READY
        ├─ Work queue aligned ✓
        ├─ Tracking initialized ✓
        └─ Awaiting cycle start
        """)
        
        # Save planning data
        planning_data = {
            "cycle": {
                "id": planner.next_cycle["id"],
                "name": planner.next_cycle["name"],
                "start": planner.next_cycle["startsAt"],
                "end": planner.next_cycle["endsAt"]
            },
            "selected_issues": [
                {
                    "id": item["issue"]["id"],
                    "identifier": item["issue"]["identifier"],
                    "title": item["issue"]["title"],
                    "estimate": item["issue"].get("estimate", 0),
                    "value_score": item["value_score"],
                    "reason": item["reason"]
                }
                for item in selected_issues
            ],
            "planning_issue": planning_issue["url"] if planning_issue else None,
            "work_log": work_log["url"] if work_log else None,
            "kickoff": kickoff["url"] if kickoff else None,
            "timestamp": datetime.now().isoformat()
        }
        
        with open("cycle_planning_results.json", "w") as f:
            json.dump(planning_data, f, indent=2)
        
        print("\n💾 Planning data saved to: cycle_planning_results.json")
        
    except Exception as e:
        print(f"\n❌ Error during cycle planning: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
