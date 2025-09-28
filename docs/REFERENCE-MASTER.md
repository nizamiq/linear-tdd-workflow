---
title: REFERENCE-MASTER
version: 2.0.0
last_updated: 2024-11-27
owner: Engineering Excellence Team
tags: [reference, index, glossary, commands, standards, navigation]
---

# Master Reference Guide & Documentation Hub

This is the complete reference guide for the Linear TDD Workflow System, consolidating all quick references, navigation, and documentation standards in one place.

## Table of Contents

1. [Quick Start Guide](#1-quick-start-guide)
2. [Documentation Navigation](#2-documentation-navigation)
3. [Command Reference](#3-command-reference)
4. [Documentation Standards](#4-documentation-standards)
5. [Glossary](#5-glossary)
6. [API Reference](#6-api-reference)
7. [Resources & Links](#7-resources--links)
8. [FAQ](#8-faq)

---

# 1. Quick Start Guide

## Getting Started in 5 Minutes

```bash
# 1. Clone the repository
git clone https://github.com/your-org/linear-tdd-workflow.git
cd linear-tdd-workflow

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys:
# LINEAR_API_KEY=your_key_here
# LINEAR_TEAM_ID=a-coders
# LINEAR_PROJECT_ID=ai-coding

# 4. Initialize the system
npm run setup
npm run agents:init

# 5. Run first assessment
npm run assess

# 6. Check Linear for created tasks
# Tasks will appear with CLEAN-XXX format
```

## Essential First Steps

1. **Understand the Vision**: Read [WORKFLOW-PRODUCT-REQUIREMENTS.md](WORKFLOW-PRODUCT-REQUIREMENTS.md)
2. **Learn TDD Process**: Review [WORKFLOW-TDD-PROTOCOL.md](WORKFLOW-TDD-PROTOCOL.md)
3. **Setup Integrations**: Configure [INTEGRATION-LINEAR.md](INTEGRATION-LINEAR.md)
4. **Explore Agents**: Study [ARCHITECTURE-AGENTS.md](ARCHITECTURE-AGENTS.md)

---

# 2. Documentation Navigation

## Core Documentation Map

### 🎯 Workflows (Process & Methodology)
| Document | Purpose | Reading Time |
|----------|---------|--------------|
| [WORKFLOW-TDD-PROTOCOL.md](WORKFLOW-TDD-PROTOCOL.md) | Complete TDD methodology and testing standards | 15 min |
| [WORKFLOW-PRODUCT-REQUIREMENTS.md](WORKFLOW-PRODUCT-REQUIREMENTS.md) | Product vision, requirements, success metrics | 20 min |
| [WORKFLOW-CLEAN-CODE-ASSESSMENT.md](WORKFLOW-CLEAN-CODE-ASSESSMENT.md) | Code quality assessment framework | 20 min |

### 🏗️ Architecture (System Design)
| Document | Purpose | Reading Time |
|----------|---------|--------------|
| [ARCHITECTURE-AGENTS.md](ARCHITECTURE-AGENTS.md) | Complete 20-agent system specification | 30 min |
| [Agent System Reference](../.claude/agents/CLAUDE.md) | Agent quick reference and MCP matrix | 10 min |
| [Agent Selection Guide](../.claude/agents/AGENT-SELECTION-GUIDE.md) | Decision trees for choosing agents | 5 min |
| [Linear Operations Guide](../.claude/agents/LINEAR-OPERATIONS-GUIDE.md) | Linear task management clarity | 5 min |

### 🔌 Integrations (External Systems)
| Document | Purpose | Reading Time |
|----------|---------|--------------|
| [INTEGRATION-LINEAR.md](INTEGRATION-LINEAR.md) | Linear.app task management integration | 25 min |
| [INTEGRATION-GITFLOW.md](INTEGRATION-GITFLOW.md) | GitFlow branching and version control | 10 min |
| [INTEGRATION-MCP-TOOLS.md](INTEGRATION-MCP-TOOLS.md) | Model Context Protocol tools | 10 min |

### 📚 Reference (Guides & History)
| Document | Purpose | Reading Time |
|----------|---------|--------------|
| **REFERENCE-MASTER.md** (this doc) | Complete reference hub and navigation | 10 min |
| [PROJECT-HISTORY.md](PROJECT-HISTORY.md) | Project evolution and optimization history | 15 min |

## Developer Journey Maps

### Journey 1: "Getting Started"
1. Start here → Quick Start Guide (above)
2. Understand vision → [WORKFLOW-PRODUCT-REQUIREMENTS.md](WORKFLOW-PRODUCT-REQUIREMENTS.md)
3. Learn methodology → [WORKFLOW-TDD-PROTOCOL.md](WORKFLOW-TDD-PROTOCOL.md)
4. Setup tools → [INTEGRATION-LINEAR.md](INTEGRATION-LINEAR.md)

### Journey 2: "Contributing Code"
1. Setup Git → [INTEGRATION-GITFLOW.md](INTEGRATION-GITFLOW.md)
2. Write tests → [WORKFLOW-TDD-PROTOCOL.md](WORKFLOW-TDD-PROTOCOL.md)
3. Meet standards → [WORKFLOW-CLEAN-CODE-ASSESSMENT.md](WORKFLOW-CLEAN-CODE-ASSESSMENT.md)
4. Use agents → [Agent Selection Guide](../.claude/agents/AGENT-SELECTION-GUIDE.md)

### Journey 3: "Working with AI Agents"
1. Understand system → [ARCHITECTURE-AGENTS.md](ARCHITECTURE-AGENTS.md)
2. Choose agents → [Agent Selection Guide](../.claude/agents/AGENT-SELECTION-GUIDE.md)
3. Manage tasks → [Linear Operations Guide](../.claude/agents/LINEAR-OPERATIONS-GUIDE.md)
4. Use tools → [INTEGRATION-MCP-TOOLS.md](INTEGRATION-MCP-TOOLS.md)

---

# 3. Command Reference

## Development Commands

### Testing
```bash
npm test                          # Run all tests with coverage
npm test:unit                     # Unit tests only
npm test:integration              # Integration tests
npm test:e2e                      # End-to-end tests
npm test:watch                    # TDD watch mode
npm test -- path/to/test.spec.ts # Run specific test
```

### Code Quality
```bash
npm run lint                      # Lint and auto-fix
npm run lint:check                # Check without fixing
npm run format                    # Format with Prettier
npm run typecheck                 # TypeScript checking
npm run precommit                 # All pre-commit checks
```

### Building
```bash
npm run build                     # Compile TypeScript
npm run build:watch               # Watch mode compilation
npm run clean                     # Clean build artifacts
```

## Agent Operations

### Core Operations
```bash
npm run assess                    # Run code assessment
npm run execute:fixpack           # Execute approved fixes
npm run linear:sync               # Sync with Linear
npm run agents:init               # Initialize agents
npm run agents:status             # Check agent status
```

### Agent Invocation
```bash
# Standard pattern
npm run agent:invoke <AGENT>:<COMMAND> -- [parameters]

# Examples
npm run agent:invoke AUDITOR:assess-code -- --scope full
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123
npm run agent:invoke STRATEGIST:manage-backlog -- --team a-coders
npm run agent:invoke GUARDIAN:analyze-failure -- --auto-fix
```

## Linear Task Management

### Task Operations (STRATEGIST only)
```bash
npm run linear:create-sprint      # Create new sprint
npm run linear:assign-tasks       # Assign tasks to agents
npm run linear:update-status      # Update task status
npm run linear:close-cycle        # Close current cycle
```

### Task Creation by Type
```bash
# Quality issues (AUDITOR)
npm run agent:invoke AUDITOR:create-backlog -- --team ACO

# Incidents (MONITOR)
npm run agent:invoke MONITOR:create-incident -- --severity high

# General tasks (STRATEGIST)
npm run agent:invoke STRATEGIST:create-task -- --type feature
```

---

# 4. Documentation Standards

## Writing Guidelines

### Document Structure
```markdown
---
title: CATEGORY-NAME
version: X.Y.Z
last_updated: YYYY-MM-DD
owner: Team Name
tags: [relevant, tags]
---

# Document Title

## Table of Contents
[Generated TOC]

## Section 1
Content...
```

### Naming Conventions
- **WORKFLOW-*.md**: Process and methodology documents
- **ARCHITECTURE-*.md**: System design documents
- **INTEGRATION-*.md**: External system integrations
- **REFERENCE-*.md**: Reference materials

### Content Standards

#### Clarity Rules
1. **One concept per paragraph**
2. **Examples for every complex concept**
3. **Clear headings hierarchy** (H1 → H2 → H3)
4. **Bullet points for lists** > 3 items
5. **Tables for comparisons**

#### Code Examples
```language
# Always include:
# 1. Context comment
# 2. Working example
# 3. Expected output
```

#### Cross-References
- Use relative paths: `[Link Text](../path/to/doc.md)`
- Include section anchors: `[Link Text](doc.md#section-name)`
- Verify links before commit

### Maintenance Schedule

| Document Type | Review Frequency | Owner |
|--------------|------------------|-------|
| Workflows | Monthly | Product Team |
| Architecture | Quarterly | Tech Leads |
| Integrations | On change | DevOps |
| Reference | Weekly | All |

---

# 5. Glossary

## A-F

**Agent**: Specialized AI component with specific responsibilities
**AUDITOR**: Agent responsible for code quality assessment
**Clean Code**: Code that follows established quality standards
**CLEAN-XXX**: Issue ID format for quality improvements
**Cycle**: Sprint/iteration in Linear.app
**Diff Coverage**: Test coverage on changed lines
**EXECUTOR**: Agent that implements Fix Packs
**FIL**: Feature Impact Level (0-3 classification)
**Fix Pack**: Pre-approved code improvement ≤300 LOC

## G-M

**GitFlow**: Branching strategy for version control
**GUARDIAN**: Agent monitoring CI/CD pipeline
**INCIDENT-XXX**: Issue ID format for production incidents
**Linear**: Task management platform (Linear.app)
**MCP**: Model Context Protocol
**MONITOR**: Agent creating incident tasks
**Mutation Testing**: Testing test quality

## N-S

**Pipeline**: CI/CD automation workflow
**RED-GREEN-REFACTOR**: TDD cycle phases
**REFACTORER**: Agent for large code restructuring
**SCHOLAR**: Agent for pattern learning
**SLA**: Service Level Agreement
**STRATEGIST**: Primary Linear task manager

## T-Z

**TDD**: Test-Driven Development
**TESTER**: Agent creating test files
**VALIDATOR**: Agent running tests
**Workflow**: Defined process for specific tasks

---

# 6. API Reference

## REST Endpoints

### Assessment API
```bash
POST /api/assess
  Body: { scope: "full|incremental", depth: "shallow|deep" }
  Response: { tasks: [...], metrics: {...} }

GET /api/assessment/:id
  Response: { status, results, recommendations }
```

### Task Management API
```bash
POST /api/tasks
  Body: { type, title, description, priority }
  Response: { taskId, linearId, status }

PUT /api/tasks/:id
  Body: { status, assignee, notes }
  Response: { updated: true, task: {...} }
```

### Agent Control API
```bash
POST /api/agents/:name/invoke
  Body: { command, parameters }
  Response: { success, output, duration }

GET /api/agents/status
  Response: { agents: [...], health: "green|yellow|red" }
```

## MCP Tool Specifications

### Available Tools
- **sequential-thinking**: Complex reasoning chains
- **context7**: Code context understanding
- **playwright**: Browser automation for E2E testing
- **kubernetes**: Container orchestration
- **linear-server**: Linear.app integration

See [INTEGRATION-MCP-TOOLS.md](INTEGRATION-MCP-TOOLS.md) for detailed specifications.

---

# 7. Resources & Links

## External Resources

### Official Documentation
- [Linear.app API](https://developers.linear.app)
- [MCP Specification](https://modelcontextprotocol.org)
- [GitFlow Guide](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Claude Code](https://claude.ai/code)

### Community Resources
- [GitHub Repository](https://github.com/your-org/linear-tdd-workflow)
- [Issue Tracker](https://github.com/your-org/linear-tdd-workflow/issues)
- [Discussions](https://github.com/your-org/linear-tdd-workflow/discussions)

### Training Materials
- TDD Workshop Materials
- Clean Code Principles Guide
- Agent System Tutorial Videos

## Internal Resources

### Configuration Files
- `.env.example` - Environment template
- `.claude/agents/` - Agent specifications
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

### Key Directories
```
/docs         # Documentation
/.claude      # Agent configurations
/tests        # Test suites
/scripts      # Automation scripts
```

---

# 8. FAQ

## General Questions

**Q: What is the Linear TDD Workflow System?**
A: An autonomous multi-agent system that enforces Test-Driven Development while continuously improving code quality through AI-powered assessment and fixes.

**Q: How many agents are in the system?**
A: 20 specialized agents, each with specific responsibilities and no overlapping roles.

**Q: Who manages Linear tasks?**
A: STRATEGIST is the primary Linear manager with full CRUD permissions. Other agents have limited, specific permissions.

## Technical Questions

**Q: What's the difference between TESTER and VALIDATOR?**
A: TESTER creates new test files, VALIDATOR runs existing tests. They never overlap.

**Q: How do Fix Packs work?**
A: Pre-approved code improvements ≤300 LOC that agents can implement autonomously, following strict TDD practices.

**Q: What's the test coverage requirement?**
A: Minimum 80% diff coverage on changed lines, with 90% target for critical paths.

## Troubleshooting

**Q: Pipeline keeps failing?**
A: Check GUARDIAN agent logs, ensure tests run in correct order (unit → integration → E2E).

**Q: Tasks not appearing in Linear?**
A: Verify LINEAR_API_KEY in .env, check STRATEGIST agent permissions.

**Q: Agent confusion about roles?**
A: Consult [Agent Selection Guide](../.claude/agents/AGENT-SELECTION-GUIDE.md) for clear decision trees.

## Best Practices

**Q: How to start a new feature?**
A: Follow TDD cycle: Write failing test → Implement minimal code → Refactor with safety.

**Q: When to use which agent?**
A: Check "NOT For" column in agent reference table, use decision trees in selection guide.

**Q: How to maintain documentation?**
A: Follow standards in Section 4, review on schedule, treat docs as code.

---

## Quick Links

- [Back to Top](#master-reference-guide--documentation-hub)
- [Project README](../README.md)
- [Agent System](../.claude/agents/CLAUDE.md)
- [Project History](PROJECT-HISTORY.md)

---

*Last Updated: November 27, 2024 | Version 2.0.0 | Consolidated Reference*