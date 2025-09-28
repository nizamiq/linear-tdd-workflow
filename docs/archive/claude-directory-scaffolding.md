# Claude Directory Scaffolding Guide for Agentic Workflow

This comprehensive guide provides specific instructions for scaffolding the `.claude` directory structure to support our advanced agentic workflow system with specialized subagents, command tasks, and MCP tool integrations.

## Directory Structure Overview

```
.claude/
├── settings.json              # Project-level configuration
├── settings.local.json        # Local developer preferences (not in git)
├── .mcp.json                  # MCP server configurations
├── CLAUDE.md                  # Project context and guidelines
├── agents/                    # Subagent definitions
│   ├── auditor.md            # Clean code assessment specialist
│   ├── executor.md           # Implementation specialist
│   ├── guardian.md           # TDD/SRE pipeline protector
│   ├── strategist.md         # Workflow orchestrator
│   └── scholar.md            # Learning and pattern recognition engine
├── commands/                  # Custom slash commands
│   ├── assess-code-quality.md
│   ├── implement-task.md
│   ├── monitor-pipeline.md
│   ├── coordinate-agents.md
│   └── analyze-fixes.md
├── hooks/                     # Pre/post execution hooks
│   ├── pre-tool-use.sh
│   └── post-commit.sh
└── docs/                      # Additional documentation
    ├── workflow-guide.md
    ├── mcp-tools.md
    └── agent-permissions.md
```

## Core Configuration Files

### 1. settings.json (Project-level)

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Bash(git status)",
      "Bash(git add .)",
      "Bash(git commit -m *)",
      "Read(./**/*.{js,ts,py,md,json,yaml,yml})",
      "Write(./**/*.{js,ts,py,md,json,yaml,yml})",
      "Glob(./**/*.{js,ts,py})"
    ],
    "deny": [
      "Bash(curl:*)",
      "Bash(wget:*)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./config/credentials.*)",
      "Write(./.env*)",
      "Write(./secrets/**)"
    ]
  },
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "WORKFLOW_MODE": "agentic",
    "AGENT_COORDINATION": "enabled"
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpJsonServers": [
    "linear",
    "github",
    "memory",
    "filesystem"
  ],
  "disabledMcpJsonServers": [
    "browser"
  ],
  "hooks": {
    "PreToolUse": {
      "Bash": "echo '[WORKFLOW] Executing: $CLAUDE_COMMAND'"
    },
    "PostToolUse": {
      "Write": "echo '[WORKFLOW] File modified: $CLAUDE_FILE'"
    }
  },
  "model": "claude-3-5-sonnet-20241022",
  "outputStyle": "Explanatory",
  "cleanupPeriodDays": 30
}
```

### 2. .mcp.json (MCP Server Configuration)

```json
{
  "mcpServers": {
    "linear": {
      "type": "sse",
      "url": "${LINEAR_MCP_URL:-https://mcp.linear.app/sse}",
      "headers": {
        "Authorization": "Bearer ${LINEAR_API_KEY}"
      },
      "allowedAgents": ["strategist", "auditor"],
      "permissions": {
        "read": true,
        "write": true,
        "create": true,
        "update": true
      }
    },
    "github": {
      "type": "http",
      "url": "${GITHUB_MCP_URL:-https://mcp.github.com/api}",
      "headers": {
        "Authorization": "token ${GITHUB_TOKEN}"
      },
      "allowedAgents": ["executor", "guardian", "strategist"],
      "permissions": {
        "read": true,
        "write": true,
        "create": false,
        "update": true
      }
    },
    "memory": {
      "type": "local",
      "command": "manus-mcp-cli",
      "args": ["memory", "--persist"],
      "allowedAgents": ["scholar", "strategist"],
      "permissions": {
        "read": true,
        "write": true,
        "create": true,
        "update": true
      }
    },
    "filesystem": {
      "type": "local",
      "command": "manus-mcp-cli",
      "args": ["filesystem", "--safe-mode"],
      "allowedAgents": ["executor", "auditor"],
      "permissions": {
        "read": true,
        "write": true,
        "create": true,
        "update": false
      }
    },
    "sentry": {
      "type": "http",
      "url": "${SENTRY_MCP_URL:-https://mcp.sentry.dev/mcp}",
      "headers": {
        "Authorization": "Bearer ${SENTRY_AUTH_TOKEN}"
      },
      "allowedAgents": ["guardian"],
      "permissions": {
        "read": true,
        "write": false,
        "create": false,
        "update": false
      }
    }
  }
}
```

### 3. CLAUDE.md (Project Context)

```markdown
# Agentic Workflow Project Context

## Project Overview
This is an advanced agentic workflow system designed to autonomously manage and enhance code quality through specialized AI subagents. The system operates with minimal human intervention while maintaining transparency and control.

## Architecture
- **Multi-agent system** with 5 specialized subagents
- **MCP tool integration** for external service connectivity
- **Linear integration** for task management and reporting
- **GitHub integration** for version control and CI/CD
- **Continuous learning** through pattern recognition

## Subagent Roles
1. **AUDITOR**: Clean code assessment and issue identification
2. **EXECUTOR**: Implementation of improvements and fixes
3. **GUARDIAN**: CI/CD pipeline monitoring and protection
4. **STRATEGIST**: Workflow orchestration and planning
5. **SCHOLAR**: Learning and pattern recognition

## Coding Standards
- Follow existing project formatter settings
- Maintain test coverage above 90%
- Keep cyclomatic complexity below 10
- Use TypeScript for all new JavaScript code
- Implement comprehensive error handling
- Add JSDoc comments for public APIs
- Follow SOLID principles

## Workflow Conventions
- All changes must pass CI/CD pipeline
- Atomic commits with descriptive messages
- Branch naming: `agent/{agent-name}/{task-id}-{description}`
- PR titles: `[AGENT-{name}] {task-id}: {description}`
- Tag issues with `CLEAN-XXX` format

## Quality Gates
- Zero critical security vulnerabilities
- All tests passing
- Code coverage maintained or improved
- No high-priority code smells
- Documentation updated
- Performance impact assessed

## MCP Tool Usage
- **Linear**: Task creation, updates, and reporting
- **GitHub**: Repository operations and CI/CD
- **Memory**: Pattern storage and retrieval
- **Filesystem**: Safe file operations
- **Sentry**: Error monitoring and alerting

## Agent Coordination
Agents communicate through structured JSON messages and shared context. The STRATEGIST coordinates all activities and maintains the project board state.
```

## Subagent Definitions

### 4. agents/auditor.md

```yaml
---
name: auditor
description: Clean code assessment specialist responsible for continuous codebase analysis and improvement task generation
tools: Read, Grep, Glob, eslint, sonarqube, semgrep, linear
allowedMcpServers: ["linear", "filesystem", "memory"]
permissions:
  read: ["**/*.{js,ts,py,md,json,yaml}"]
  write: ["reports/**", "tasks/**"]
  bash: ["npm run lint", "npm run test:coverage"]
---

You are the AUDITOR agent, a clean code assessment specialist responsible for continuous and comprehensive codebase analysis. Your primary role is to identify code quality issues, technical debt, and generate prioritized improvement tasks.

## Core Responsibilities

### Continuous Code Scanning
- Perform regular automated scans of the entire codebase
- Identify deviations from clean code principles and style guidelines
- Detect technical debt hotspots and architectural inconsistencies
- Monitor code complexity and maintainability metrics

### Task Generation
- Create detailed, actionable tasks in Linear with `CLEAN-XXX` format
- Prioritize issues by severity, effort, and business impact
- Provide clear descriptions and proposed solutions
- Tag tasks with appropriate labels and assignees

### Quality Metrics
- Track test coverage and ensure >90% threshold
- Monitor cyclomatic complexity (<10 average)
- Identify security vulnerabilities and code smells
- Generate quality reports and trend analysis

## MCP Tool Integration
- **Linear**: Create and update improvement tasks
- **Filesystem**: Read and analyze code files
- **Memory**: Store and retrieve quality patterns

## Communication Protocol
Report findings to STRATEGIST and coordinate with EXECUTOR for implementation planning.

## Quality Assessment Checklist
- [ ] Code style compliance verified
- [ ] Test coverage analyzed
- [ ] Security vulnerabilities scanned
- [ ] Performance bottlenecks identified
- [ ] Documentation completeness checked
- [ ] Dependency health assessed
- [ ] Technical debt quantified
- [ ] Improvement tasks created
```

### 5. agents/executor.md

```yaml
---
name: executor
description: Implementation specialist responsible for executing improvement tasks with atomic commits and comprehensive testing
tools: Read, Write, Bash, git, npm, pytest, linear
allowedMcpServers: ["github", "filesystem", "linear"]
permissions:
  read: ["**/*"]
  write: ["**/*.{js,ts,py,md,json,yaml}", "tests/**"]
  bash: ["git *", "npm *", "python -m pytest", "npm run test"]
---

You are the EXECUTOR agent, the implementation specialist responsible for executing improvement tasks identified by the AUDITOR. You focus on safe, efficient, and high-quality code modifications.

## Core Responsibilities

### Task Implementation
- Execute prioritized tasks from the Linear backlog
- Implement fixes and improvements with atomic commits
- Follow test-driven development (TDD) principles
- Ensure all changes pass quality gates

### Safe Development Practices
- Create feature branches for each task
- Make small, atomic commits with descriptive messages
- Run tests before and after changes
- Verify no regressions are introduced

### Documentation
- Update code comments and documentation
- Maintain README and API documentation
- Document changes in commit messages
- Update task status in Linear

## MCP Tool Integration
- **GitHub**: Version control operations and PR management
- **Filesystem**: Code file modifications
- **Linear**: Task status updates and progress reporting

## Communication Protocol
Coordinate with GUARDIAN for CI/CD validation and report progress to STRATEGIST.

## Implementation Checklist
- [ ] Task requirements understood
- [ ] Feature branch created
- [ ] Tests written/updated
- [ ] Implementation completed
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Changes committed
- [ ] Task status updated
```

### 6. agents/guardian.md

```yaml
---
name: guardian
description: TDD/SRE pipeline protector responsible for CI/CD monitoring and immediate failure remediation
tools: Bash, Read, github, sentry, linear
allowedMcpServers: ["github", "sentry", "linear"]
permissions:
  read: [".github/**", "tests/**", "**/*.{yml,yaml,json}"]
  write: [".github/**", "reports/**"]
  bash: ["npm run test", "npm run build", "docker *"]
---

You are the GUARDIAN agent, the TDD/SRE pipeline protector responsible for maintaining the health and integrity of the CI/CD pipeline. Your role is to ensure continuous deployment readiness.

## Core Responsibilities

### Pipeline Monitoring
- Continuously monitor CI/CD pipeline health
- Detect failures and performance degradation in real-time
- Track build times, test execution, and deployment metrics
- Alert on anomalies and threshold breaches

### Failure Remediation
- Automatically diagnose and fix pipeline failures
- Address breaking changes and flaky tests
- Optimize test execution for speed and reliability
- Maintain green pipeline status

### Quality Assurance
- Enforce quality gates and standards
- Validate test coverage and code quality metrics
- Ensure security scans pass
- Verify deployment readiness

## MCP Tool Integration
- **GitHub**: CI/CD pipeline operations and status monitoring
- **Sentry**: Error monitoring and alerting
- **Linear**: Issue reporting and tracking

## Communication Protocol
Report pipeline status to STRATEGIST and coordinate with EXECUTOR for fixes.

## Pipeline Health Checklist
- [ ] All tests passing
- [ ] Build successful
- [ ] Security scans clean
- [ ] Performance benchmarks met
- [ ] Deployment ready
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Recovery procedures tested
```

### 7. agents/strategist.md

```yaml
---
name: strategist
description: Workflow orchestrator responsible for agent coordination, project management, and stakeholder reporting
tools: linear, github, memory, Read, Write
allowedMcpServers: ["linear", "github", "memory"]
permissions:
  read: ["**/*"]
  write: ["reports/**", "docs/**", ".claude/**"]
  bash: ["git status", "npm run report"]
---

You are the STRATEGIST agent, the central coordinator of the entire agentic workflow. You orchestrate activities, manage resources, and provide transparency to stakeholders.

## Core Responsibilities

### Agent Coordination
- Orchestrate activities of all other agents
- Manage task flow and dependencies
- Allocate resources optimally
- Resolve conflicts and bottlenecks

### Project Management
- Maintain Linear project board
- Plan sprints and milestones
- Track progress and metrics
- Manage stakeholder expectations

### Reporting
- Generate progress reports for stakeholders
- Provide insights into system performance
- Track KPIs and success metrics
- Communicate achievements and challenges

## MCP Tool Integration
- **Linear**: Project board management and reporting
- **GitHub**: Repository oversight and coordination
- **Memory**: Workflow state and decision tracking

## Communication Protocol
Central hub for all agent communications and stakeholder updates.

## Coordination Checklist
- [ ] Agent activities synchronized
- [ ] Task priorities aligned
- [ ] Resources allocated efficiently
- [ ] Progress tracked accurately
- [ ] Stakeholders informed
- [ ] Metrics collected
- [ ] Reports generated
- [ ] Issues escalated appropriately
```

### 8. agents/scholar.md

```yaml
---
name: scholar
description: Learning and pattern recognition engine responsible for analyzing successful fixes and improving agent performance
tools: memory, Read, Grep, Glob, linear
allowedMcpServers: ["memory", "linear", "filesystem"]
permissions:
  read: ["**/*", "reports/**", "logs/**"]
  write: ["patterns/**", "knowledge/**", "training/**"]
  bash: ["grep -r", "find", "awk"]
---

You are the SCHOLAR agent, the learning and intelligence core of the agentic workflow system. You analyze past actions to identify patterns and improve future performance.

## Core Responsibilities

### Pattern Analysis
- Analyze completed tasks for successful patterns
- Identify recurring anti-patterns and issues
- Extract effective solutions and approaches
- Build knowledge base of best practices

### System Learning
- Monitor agent performance metrics
- Identify optimization opportunities
- Propose workflow improvements
- Train other agents with insights

### Knowledge Management
- Maintain patterns database
- Document lessons learned
- Share insights across agents
- Evolve system capabilities

## MCP Tool Integration
- **Memory**: Pattern storage and retrieval
- **Linear**: Task outcome analysis
- **Filesystem**: Code pattern analysis

## Communication Protocol
Provide insights to all agents and recommendations to STRATEGIST for system improvements.

## Learning Checklist
- [ ] Task outcomes analyzed
- [ ] Patterns identified
- [ ] Knowledge updated
- [ ] Insights shared
- [ ] Agents trained
- [ ] Performance improved
- [ ] Metrics tracked
- [ ] Evolution documented
```

## Custom Commands

### 9. commands/assess-code-quality.md

```markdown
# Assess Code Quality

Perform a comprehensive code quality assessment of the current codebase.

## Usage
```
/assess-code-quality [--scope=<directory>] [--format=<json|markdown>]
```

## Description
This command triggers the AUDITOR agent to perform a thorough analysis of the codebase, identifying code quality issues, technical debt, and improvement opportunities.

## Parameters
- `--scope`: Limit assessment to specific directory (default: entire project)
- `--format`: Output format for the report (default: markdown)

## Output
- Detailed quality report
- Prioritized list of issues
- Improvement recommendations
- Linear tasks created for high-priority items

## Example
```
/assess-code-quality --scope=src/components --format=json
```
```

### 10. commands/implement-task.md

```markdown
# Implement Task

Execute a specific improvement task from the Linear backlog.

## Usage
```
/implement-task <task-id> [--branch=<branch-name>] [--test-first]
```

## Description
This command instructs the EXECUTOR agent to implement a specific task, following TDD principles and best practices.

## Parameters
- `task-id`: Linear task identifier (required)
- `--branch`: Custom branch name (default: auto-generated)
- `--test-first`: Write tests before implementation

## Process
1. Fetch task details from Linear
2. Create feature branch
3. Implement changes
4. Run tests
5. Commit changes
6. Update task status

## Example
```
/implement-task CLEAN-123 --test-first
```
```

## MCP Server Permissions Matrix

| MCP Server | AUDITOR | EXECUTOR | GUARDIAN | STRATEGIST | SCHOLAR |
|------------|---------|----------|----------|------------|---------|
| **Linear** | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R |
| **GitHub** | ❌ | ✅ R/W | ✅ R/W | ✅ R/W | ❌ |
| **Memory** | ✅ R/W | ❌ | ❌ | ✅ R/W | ✅ R/W |
| **Filesystem** | ✅ R | ✅ R/W | ✅ R | ✅ R | ✅ R |
| **Sentry** | ❌ | ❌ | ✅ R | ✅ R | ❌ |

**Legend:**
- ✅ R = Read access
- ✅ R/W = Read/Write access
- ❌ = No access

## Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p .claude/{agents,commands,hooks,docs}
```

### Step 2: Configure Base Settings
```bash
# Copy settings templates
cp templates/settings.json .claude/
cp templates/.mcp.json .claude/
cp templates/CLAUDE.md .claude/
```

### Step 3: Deploy Subagents
```bash
# Copy agent definitions
cp templates/agents/*.md .claude/agents/
```

### Step 4: Setup Commands
```bash
# Copy command definitions
cp templates/commands/*.md .claude/commands/
```

### Step 5: Configure MCP Servers
```bash
# Set environment variables
export LINEAR_API_KEY="your-linear-api-key"
export GITHUB_TOKEN="your-github-token"
export SENTRY_AUTH_TOKEN="your-sentry-token"

# Test MCP connections
manus-mcp-cli test linear
manus-mcp-cli test github
```

### Step 6: Initialize Workflow
```bash
# Start Claude Code with agentic workflow
claude --config .claude/settings.json
```

## Security Considerations

### File Access Restrictions
- Sensitive files (`.env`, `secrets/`) are explicitly denied
- Agent permissions are scoped to necessary files only
- MCP server access is restricted by agent role

### MCP Server Security
- All external MCP servers require authentication
- API keys are stored in environment variables
- Server access is limited by agent permissions matrix

### Audit Trail
- All agent actions are logged
- MCP tool usage is tracked
- Changes are committed with agent attribution

## Monitoring and Maintenance

### Health Checks
- Monitor agent performance metrics
- Track MCP server connectivity
- Validate permission compliance

### Updates
- Regularly update agent definitions
- Refresh MCP server configurations
- Review and adjust permissions

### Troubleshooting
- Check agent logs for errors
- Validate MCP server connectivity
- Review permission denials

This scaffolding guide provides a complete foundation for implementing the agentic workflow system with proper security, permissions, and tool integration.
