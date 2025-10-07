# Linear Integration Guide - Claude Agentic Workflow System

Complete guide to integrating the Claude Agentic Workflow System with Linear for seamless task management and workflow automation.

## Table of Contents

1. [Linear Integration Overview](#linear-integration-overview)
2. [Initial Setup](#initial-setup)
3. [Authentication & Configuration](#authentication--configuration)
4. [Task Management Workflow](#task-management-workflow)
5. [Agent-Linear Interactions](#agent-linear-interactions)
6. [Sprint Planning & Management](#sprint-planning--management)
7. [Automation Features](#automation-features)
8. [Custom Workflows](#custom-workflows)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

## Linear Integration Overview

### What is Linear Integration?

The Claude Agentic Workflow System integrates deeply with Linear.app to provide seamless task management, automated issue creation, progress tracking, and sprint coordination. This integration transforms code quality findings into actionable Linear tasks with full lifecycle management.

### Integration Benefits

**Automated Task Management:**

- **Automatic Issue Creation**: AUDITOR creates Linear tasks for quality findings
- **Progress Tracking**: Real-time updates as agents work on tasks
- **Sprint Coordination**: STRATEGIST manages sprint planning and execution
- **Team Collaboration**: Seamless handoff between agents and human developers

**Workflow Automation:**

- **Task Assignment**: Intelligent assignment based on issue type and team expertise
- **Status Updates**: Automatic status transitions based on work progress
- **Priority Management**: Dynamic priority adjustment based on impact and urgency
- **Effort Estimation**: Automated story point estimation using historical data

**Quality Management:**

- **Technical Debt Tracking**: Quantified technical debt with improvement roadmaps
- **Quality Metrics**: Integration with code quality metrics and trends
- **Fix Pack Management**: Structured approach to implementing improvements
- **Impact Assessment**: Business impact analysis for quality issues

### Architecture Overview

```
Claude Agentic Workflow System
            ↓
    Linear.app Integration
            ↓
┌─────────────────────────────────────────────┐
│              STRATEGIST                     │
│         (Primary Linear Manager)            │
│                                             │
│  • Full CRUD operations                     │
│  • Sprint planning                          │
│  • Task assignment                          │
│  • Progress coordination                    │
└─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────┐
│           Specialized Agents                │
│                                             │
│  AUDITOR    → CREATE quality tasks (CLEAN-) │
│  MONITOR    → CREATE incident tasks (INC-)  │
│  SCHOLAR    → READ ONLY (pattern analysis)  │
│  Others     → UPDATE status only            │
└─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────┐
│              Linear Workspace               │
│                                             │
│  • Tasks & Issues                           │
│  • Projects & Teams                         │
│  • Sprints & Cycles                         │
│  • Labels & Priorities                      │
└─────────────────────────────────────────────┘
```

## Initial Setup

### Prerequisites

1. **Linear Account**: Active Linear workspace
2. **Team Access**: Write permissions to create and manage issues
3. **API Access**: Ability to generate API keys
4. **Project Setup**: Existing Linear project or permission to create one

### Quick Setup

```bash
# 1. Get Linear API key from Linear Settings → API
# 2. Set environment variables
export CLAUDE_LINEAR_API_KEY=your_api_key_here
export CLAUDE_LINEAR_TEAM_ID=your_team_id
export CLAUDE_LINEAR_PROJECT_ID=your_project_id  # Optional

# 3. Test connection
npm run linear:test-connection

# 4. Initialize integration
npm run linear:setup

# 5. Validate configuration
npm run validate -- --linear
```

### Detailed Setup Process

#### Step 1: Linear API Key Generation

1. **Navigate to Linear Settings**:
   - Go to your Linear workspace
   - Click on Settings (gear icon)
   - Select "API" from the left sidebar

2. **Create Personal API Key**:
   - Click "Create new API key"
   - Name: "Claude Agentic Workflow System"
   - Scopes: Select "Write" permissions
   - Copy the generated API key

3. **Store Securely**:
   ```bash
   # Add to environment variables
   echo 'export CLAUDE_LINEAR_API_KEY=lin_api_...' >> ~/.bashrc
   source ~/.bashrc
   ```

#### Step 2: Team and Project Identification

1. **Find Team ID**:

   ```bash
   # List available teams
   npm run linear:list-teams

   # Or extract from team URL
   # https://linear.app/your-workspace/team/DEV → Team ID: "DEV"
   ```

2. **Find Project ID** (Optional):

   ```bash
   # List projects in team
   npm run linear:list-projects -- --team DEV

   # Or create new project
   npm run linear:create-project -- --name "Code Quality" --team DEV
   ```

#### Step 3: Configuration

Create `.claude/settings.local.json` with Linear configuration:

```json
{
  "linear": {
    "enabled": true,
    "api_key": "${CLAUDE_LINEAR_API_KEY}",
    "team_id": "DEV",
    "project_id": "PRJ_123",
    "workspace_id": "your-workspace-id",
    "settings": {
      "auto_create_tasks": true,
      "auto_update_status": true,
      "auto_assign_tasks": true,
      "sync_interval": 300000
    }
  }
}
```

## Authentication & Configuration

### Environment Variables

```bash
# Required
export CLAUDE_LINEAR_API_KEY=lin_api_...     # Personal API key
export CLAUDE_LINEAR_TEAM_ID=DEV             # Team identifier

# Optional
export CLAUDE_LINEAR_PROJECT_ID=PRJ_123      # Specific project
export CLAUDE_LINEAR_WORKSPACE_ID=WS_456     # Workspace identifier
export CLAUDE_LINEAR_SYNC_INTERVAL=300000    # Sync frequency (5 min)
```

### Configuration Options

#### Basic Configuration

```json
{
  "linear": {
    "enabled": true,
    "api_key": "${CLAUDE_LINEAR_API_KEY}",
    "team_id": "${CLAUDE_LINEAR_TEAM_ID}",
    "project_id": "${CLAUDE_LINEAR_PROJECT_ID}",
    "settings": {
      "auto_create_tasks": true,
      "auto_update_status": true,
      "auto_assign_tasks": false,
      "sync_interval": 300000,
      "max_tasks_per_sync": 100
    }
  }
}
```

#### Advanced Configuration

```json
{
  "linear": {
    "task_configuration": {
      "prefixes": {
        "quality": "CLEAN",
        "security": "SEC",
        "performance": "PERF",
        "incident": "INCIDENT",
        "feature": "FEAT",
        "bug": "BUG",
        "debt": "DEBT"
      },
      "priority_mapping": {
        "critical": 1,
        "high": 2,
        "normal": 3,
        "low": 4
      },
      "default_assignee": null,
      "default_labels": ["automated", "claude-generated"],
      "estimate_mapping": {
        "FIL-0": 1,   # Cosmetic changes
        "FIL-1": 2,   # Safe refactoring
        "FIL-2": 5,   # Utility additions
        "FIL-3": 8    # API changes
      }
    },
    "sprint_configuration": {
      "auto_plan_sprints": false,
      "sprint_length_weeks": 2,
      "capacity_per_agent": {
        "AUDITOR": 20,
        "EXECUTOR": 15,
        "GUARDIAN": 10,
        "STRATEGIST": 25,
        "SCHOLAR": 12
      }
    }
  }
}
```

### Validation Commands

```bash
# Test API connectivity
npm run linear:test-connection

# Validate credentials
npm run linear:validate-credentials

# Check permissions
npm run linear:check-permissions

# Test task creation
npm run linear:create-test-task

# Full integration test
npm run linear:integration-test
```

## Task Management Workflow

### Automated Task Creation

The system automatically creates Linear tasks based on agent findings:

#### AUDITOR Task Creation Flow

```
1. AUDITOR scans codebase
2. Identifies quality issues
3. Classifies by severity/type
4. Creates Linear tasks with:
   - Descriptive title
   - Detailed description
   - Appropriate labels
   - Estimated effort
   - Priority level
```

#### Task Types and Prefixes

| Agent    | Task Type       | Prefix    | Description                  |
| -------- | --------------- | --------- | ---------------------------- |
| AUDITOR  | Code Quality    | CLEAN-XXX | General quality improvements |
| AUDITOR  | Performance     | PERF-XXX  | Performance optimizations    |
| AUDITOR  | Security        | SEC-XXX   | Security vulnerabilities     |
| AUDITOR  | Technical Debt  | DEBT-XXX  | Technical debt reduction     |
| MONITOR  | Incidents       | INC-XXX   | System incidents             |
| GUARDIAN | Pipeline Issues | PIPE-XXX  | CI/CD problems               |

#### Example Task Creation

When AUDITOR finds a complex function:

```json
{
  "title": "CLEAN-247: Reduce complexity in UserService.validateCredentials",
  "description": "## Issue\nFunction `validateCredentials` has cyclomatic complexity of 15 (threshold: 10)\n\n## Location\n- File: `src/services/user-service.js`\n- Lines: 45-78\n\n## Suggested Fix\n- Extract validation logic into separate methods\n- Use early returns to reduce nesting\n- Consider strategy pattern for validation rules\n\n## Impact\n- **Maintainability**: High\n- **Test Coverage**: Currently 65%, target 80%\n- **Fix Pack Size**: Estimated 25 LOC\n\n---\n*Generated by AUDITOR agent*",
  "priority": 3,
  "estimate": 2,
  "labels": ["code-quality", "refactoring", "automated"],
  "assignee": null
}
```

### Task Lifecycle Management

#### Status Transitions

The system manages task status automatically:

```
Backlog → Todo → In Progress → In Review → Done
   ↑        ↑         ↑           ↑        ↑
   │        │         │           │        │
Created  Planned   Started     Fixed   Validated
by       by        by          by      by
AUDITOR  STRATEGIST EXECUTOR   EXECUTOR REVIEWER
```

#### Automated Status Updates

```bash
# Agent starts work
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-247
# → Status: "Todo" → "In Progress"
# → Comment: "🤖 EXECUTOR has started working on this task"

# Agent completes work
# → Status: "In Progress" → "In Review"
# → Comment: "🤖 EXECUTOR has completed this task. Ready for review."

# Tests pass
npm test
# → Status: "In Review" → "Done"
# → Comment: "✅ All tests are passing. Task completed successfully."
```

### Manual Task Management

While the system automates most task management, you can also manage tasks manually:

```bash
# Create task manually
npm run linear:create-task -- --title "Manual cleanup task" --type quality

# Update task status
npm run linear:update-task -- --task-id CLEAN-247 --status "In Progress"

# Assign task to agent
npm run agent:invoke STRATEGIST:assign-task -- --task-id CLEAN-247 --agent EXECUTOR

# Add comment to task
npm run linear:comment -- --task-id CLEAN-247 --comment "Additional context..."

# List team tasks
npm run linear:list-tasks -- --team DEV --status "Todo"
```

## Agent-Linear Interactions

### Agent Permissions and Roles

Different agents have different levels of Linear access:

#### STRATEGIST (Full Access)

- **CREATE**: All task types
- **READ**: All tasks and projects
- **UPDATE**: All task properties
- **DELETE**: Tasks and comments
- **MANAGE**: Sprints and assignments

```bash
# Full task management
npm run agent:invoke STRATEGIST:create-linear-task
npm run agent:invoke STRATEGIST:update-linear-task
npm run agent:invoke STRATEGIST:delete-linear-task
npm run agent:invoke STRATEGIST:manage-sprint
```

#### AUDITOR (Create Only)

- **CREATE**: Quality improvement tasks (CLEAN-_, PERF-_, SEC-_, DEBT-_)
- **READ**: Task status for assessment planning
- **UPDATE**: Limited to adding assessment details

```bash
# Quality task creation
npm run agent:invoke AUDITOR:create-quality-task
npm run agent:invoke AUDITOR:assess-and-create-tasks
npm run agent:invoke AUDITOR:update-task-details
```

#### MONITOR (Create Only)

- **CREATE**: Incident tasks (INC-\*)
- **READ**: Incident history
- **UPDATE**: Incident status and resolution details

```bash
# Incident management
npm run agent:invoke MONITOR:create-incident
npm run agent:invoke MONITOR:update-incident-status
npm run agent:invoke MONITOR:resolve-incident
```

#### SCHOLAR (Read Only)

- **READ**: All tasks for pattern analysis
- **ANALYZE**: Task completion patterns, velocity trends

```bash
# Analysis operations
npm run agent:invoke SCHOLAR:analyze-task-patterns
npm run agent:invoke SCHOLAR:velocity-analysis
npm run agent:invoke SCHOLAR:completion-trends
```

#### Other Agents (Update Only)

- **UPDATE**: Status changes related to their work
- **COMMENT**: Progress updates and completion notes

```bash
# Status updates
npm run agent:invoke EXECUTOR:update-task-progress
npm run agent:invoke REVIEWER:add-review-comments
npm run agent:invoke TESTER:update-test-status
```

### Agent Workflow Examples

#### Quality Improvement Workflow

```bash
# 1. AUDITOR finds issues and creates tasks
npm run agent:invoke AUDITOR:assess-code -- --scope full
# → Creates CLEAN-247, CLEAN-248, PERF-249

# 2. STRATEGIST prioritizes and assigns
npm run agent:invoke STRATEGIST:prioritize-tasks
npm run agent:invoke STRATEGIST:assign-tasks

# 3. EXECUTOR implements fixes
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-247
# → Status: Todo → In Progress → In Review

# 4. REVIEWER validates changes
npm run agent:invoke REVIEWER:review-changes -- --task-id CLEAN-247
# → Adds review comments, validates quality

# 5. SCHOLAR learns from completion
npm run agent:invoke SCHOLAR:analyze-completion -- --task-id CLEAN-247
# → Updates patterns and improves future estimates
```

#### Incident Response Workflow

```bash
# 1. MONITOR detects issue
npm run agent:invoke MONITOR:detect-issues
# → Creates INC-123: "High CPU usage detected"

# 2. GUARDIAN analyzes impact
npm run agent:invoke GUARDIAN:analyze-incident -- --incident-id INC-123
# → Updates task with analysis and severity

# 3. STRATEGIST coordinates response
npm run agent:invoke STRATEGIST:coordinate-incident-response -- --incident-id INC-123
# → Assigns appropriate agents, sets priorities

# 4. Multiple agents work on resolution
npm run agent:invoke OPTIMIZER:address-performance -- --incident-id INC-123
npm run agent:invoke MONITOR:track-resolution -- --incident-id INC-123

# 5. GUARDIAN validates resolution
npm run agent:invoke GUARDIAN:validate-resolution -- --incident-id INC-123
# → Confirms issue resolved, closes incident
```

## Sprint Planning & Management

### Automated Sprint Planning

The STRATEGIST agent can automate sprint planning:

```bash
# Plan next sprint
npm run agent:invoke STRATEGIST:plan-sprint

# Generate sprint recommendations
npm run agent:invoke STRATEGIST:sprint-recommendations

# Optimize sprint workload
npm run agent:invoke STRATEGIST:optimize-sprint-workload

# Generate sprint report
npm run agent:invoke STRATEGIST:sprint-report
```

### Sprint Configuration

Configure sprint planning in `.claude/settings.json`:

```json
{
  "linear": {
    "sprint_configuration": {
      "auto_plan_sprints": true,
      "sprint_length_weeks": 2,
      "planning_horizon_weeks": 4,
      "capacity_planning": {
        "team_velocity": 40,
        "agent_capacity": {
          "AUDITOR": 20,
          "EXECUTOR": 15,
          "GUARDIAN": 10,
          "STRATEGIST": 25,
          "SCHOLAR": 12
        }
      },
      "prioritization_criteria": {
        "business_impact": 0.4,
        "technical_debt": 0.3,
        "risk_level": 0.2,
        "effort_estimate": 0.1
      }
    }
  }
}
```

### Sprint Metrics and Tracking

```bash
# Current sprint status
npm run agent:invoke STRATEGIST:sprint-status

# Sprint velocity tracking
npm run agent:invoke SCHOLAR:sprint-velocity

# Burndown analysis
npm run agent:invoke STRATEGIST:burndown-analysis

# Sprint retrospective
npm run agent:invoke STRATEGIST:sprint-retrospective
```

## Automation Features

### Automated Workflows

The system provides several automated workflows:

#### Quality Gate Integration

```json
{
  "linear_workflow": {
    "quality_gates": {
      "on_pr_created": {
        "action": "create_review_task",
        "assign_to": "REVIEWER",
        "priority": "normal"
      },
      "on_test_failure": {
        "action": "create_fix_task",
        "assign_to": "EXECUTOR",
        "priority": "high"
      },
      "on_coverage_drop": {
        "action": "create_test_task",
        "assign_to": "TESTER",
        "priority": "medium"
      }
    }
  }
}
```

#### Incident Management

```json
{
  "linear_workflow": {
    "incident_management": {
      "auto_create_incidents": true,
      "escalation_rules": {
        "critical": {
          "immediate_assignment": true,
          "notify_team": true,
          "create_war_room": true
        },
        "high": {
          "assignment_timeout": "30m",
          "notify_team": false
        }
      }
    }
  }
}
```

### Custom Automation Rules

Create custom automation rules:

```bash
# Create custom workflow
npm run linear:create-workflow -- --name "Security Response" --trigger "security_issue"

# Configure automation rule
npm run linear:configure-automation -- --rule "auto_assign_security" --config security-config.json

# Test automation
npm run linear:test-automation -- --workflow "Security Response"
```

### Webhook Integration

Set up webhooks for real-time updates:

```bash
# Configure webhook endpoint
npm run linear:setup-webhook -- --endpoint "https://your-app.com/webhooks/linear"

# List active webhooks
npm run linear:list-webhooks

# Test webhook
npm run linear:test-webhook -- --webhook-id "webhook_123"
```

## Custom Workflows

### Workflow Definition

Define custom workflows in `.claude/workflows/`:

```json
// .claude/workflows/security-response.json
{
  "name": "Security Response",
  "trigger": {
    "type": "task_created",
    "conditions": {
      "labels": ["security"],
      "priority": [1, 2]
    }
  },
  "steps": [
    {
      "agent": "SECURITYGUARD",
      "action": "assess_vulnerability",
      "timeout": 300
    },
    {
      "agent": "STRATEGIST",
      "action": "coordinate_response",
      "depends_on": "assess_vulnerability"
    },
    {
      "agent": "EXECUTOR",
      "action": "implement_fix",
      "depends_on": "coordinate_response"
    }
  ],
  "notifications": {
    "on_start": ["security-team@company.com"],
    "on_completion": ["tech-lead@company.com"],
    "on_failure": ["security-team@company.com", "tech-lead@company.com"]
  }
}
```

### Workflow Execution

```bash
# Execute custom workflow
npm run workflow:execute -- --name "Security Response" --task-id SEC-456

# Monitor workflow progress
npm run workflow:status -- --execution-id exec_789

# List available workflows
npm run workflow:list

# Validate workflow definition
npm run workflow:validate -- --workflow security-response.json
```

### Workflow Templates

Common workflow templates:

#### Code Review Workflow

```json
{
  "name": "Code Review",
  "trigger": {
    "type": "pr_created"
  },
  "steps": [
    {
      "agent": "REVIEWER",
      "action": "automated_review"
    },
    {
      "agent": "TESTER",
      "action": "validate_tests"
    },
    {
      "agent": "SECURITYGUARD",
      "action": "security_scan"
    }
  ]
}
```

#### Performance Optimization Workflow

```json
{
  "name": "Performance Optimization",
  "trigger": {
    "type": "performance_issue"
  },
  "steps": [
    {
      "agent": "MONITOR",
      "action": "collect_metrics"
    },
    {
      "agent": "ANALYZER",
      "action": "identify_bottlenecks"
    },
    {
      "agent": "OPTIMIZER",
      "action": "implement_optimizations"
    }
  ]
}
```

## Troubleshooting

### Common Issues

#### Connection Problems

**Issue**: "Linear API connection failed"

```bash
# Diagnose connection
npm run linear:diagnose-connection

# Check API key validity
curl -H "Authorization: lin_api_YOUR_KEY" https://api.linear.app/graphql

# Validate configuration
npm run validate -- --linear --verbose
```

**Solutions**:

1. **Verify API Key**: Ensure key is valid and has correct permissions
2. **Check Network**: Verify firewall/proxy settings
3. **Update Configuration**: Refresh team/project IDs

#### Authentication Errors

**Issue**: "Insufficient permissions"

```bash
# Check current permissions
npm run linear:check-permissions

# List accessible teams
npm run linear:list-teams

# Verify API key scopes
npm run linear:api-key-info
```

**Solutions**:

1. **Regenerate API Key**: Create new key with correct scopes
2. **Update Team Membership**: Ensure account has team access
3. **Check Workspace Access**: Verify workspace permissions

#### Task Creation Failures

**Issue**: "Failed to create Linear task"

```bash
# Test task creation
npm run linear:create-test-task

# Check task creation logs
npm run agent:logs -- --agent AUDITOR --filter "linear"

# Validate task template
npm run linear:validate-task-template
```

**Solutions**:

1. **Check Required Fields**: Ensure all required fields are provided
2. **Validate Labels**: Verify labels exist in Linear workspace
3. **Check Project Access**: Ensure project exists and is accessible

### Debugging Commands

```bash
# Enable debug logging
export CLAUDE_LOG_LEVEL=debug
export CLAUDE_LINEAR_DEBUG=true

# Linear operation tracing
npm run linear:trace-operations

# Agent-Linear interaction logs
npm run agent:logs -- --filter linear

# Linear webhook logs
npm run linear:webhook-logs
```

### Recovery Procedures

#### Sync Issues

```bash
# Force sync with Linear
npm run linear:force-sync

# Rebuild task mapping
npm run linear:rebuild-mapping

# Reset Linear integration
npm run linear:reset-integration
```

#### Data Corruption

```bash
# Validate data integrity
npm run linear:validate-data

# Recover from backup
npm run linear:recover-from-backup -- --date "2024-01-01"

# Rebuild task history
npm run linear:rebuild-history
```

## Best Practices

### Configuration Best Practices

1. **Use Environment Variables**: Keep sensitive data in environment variables
2. **Team-Specific Configuration**: Customize for your team's workflow
3. **Regular Backups**: Backup configuration and task mappings
4. **Access Control**: Use minimal required permissions

### Task Management Best Practices

1. **Clear Naming**: Use descriptive task titles and consistent prefixes
2. **Proper Labeling**: Use meaningful labels for categorization
3. **Effort Estimation**: Provide accurate effort estimates
4. **Regular Review**: Review and update task priorities regularly

### Workflow Optimization

1. **Monitor Performance**: Track task completion velocity
2. **Adjust Automation**: Fine-tune automation rules based on usage
3. **Team Feedback**: Collect feedback from team members
4. **Continuous Improvement**: Regularly review and improve processes

### Security Considerations

1. **API Key Security**: Store API keys securely, rotate regularly
2. **Access Logging**: Monitor API access and unusual patterns
3. **Permission Review**: Regularly review and audit permissions
4. **Data Privacy**: Ensure compliance with data privacy requirements

### Performance Optimization

1. **Sync Frequency**: Adjust sync interval based on team size
2. **Batch Operations**: Use batch operations for bulk updates
3. **Caching**: Enable caching for frequently accessed data
4. **Resource Limits**: Set appropriate limits for API calls

### Team Adoption

1. **Gradual Rollout**: Start with small team, expand gradually
2. **Training**: Provide training on Linear integration features
3. **Documentation**: Maintain up-to-date documentation
4. **Support**: Provide ongoing support and troubleshooting

---

**The Linear integration transforms the Claude Agentic Workflow System from a code quality tool into a comprehensive development workflow orchestrator. Master this integration to unlock the full potential of autonomous task management! 🚀**

**For additional Linear integration help:**

- [User Guide](USER-GUIDE.md) - Complete system overview
- [FAQ](FAQ.md) - Linear integration questions
- [Troubleshooting](TROUBLESHOOTING.md) - Integration problem resolution
- [Configuration](CONFIGURATION.md) - Linear configuration details
