# Linear TDD Workflow System

## Autonomous Clean Code Development with Test-Driven Excellence

[![TDD Compliant](https://img.shields.io/badge/TDD-Strict-brightgreen.svg)](docs/AI%20Coding%20Assistant%20Development%20Protocol.md)
[![Linear Integrated](https://img.shields.io/badge/Linear-Connected-blue.svg)](docs/Linear%20Setup.md)
[![Clean Code](https://img.shields.io/badge/Clean%20Code-Enforced-green.svg)](docs/Clean%20code%20AI%20(Linear).md)
[![GitFlow](https://img.shields.io/badge/GitFlow-Enabled-orange.svg)](docs/gitflow.md)

## Overview

The Linear TDD Workflow System is an advanced multi-agent AI development framework that enforces strict Test-Driven Development (TDD) practices while maintaining continuous code quality through autonomous assessment, prioritized execution, and rigorous validation. This system integrates directly with Linear.app for project management and follows GitFlow for version control.

### Core Principles

- **Strict TDD Enforcement**: Every change follows the Red-Green-Refactor cycle
- **Autonomous Quality Improvement**: AI agents continuously elevate code standards
- **Linear.app Integration**: Direct task management and progress tracking
- **Clean Code Standards**: Enforced through automated assessment and improvement
- **GitFlow Methodology**: Structured branching and release management

## Quick Start

### Prerequisites

- Node.js 18+ or Python 3.10+
- Git with GitFlow extension
- Linear.app account and API access
- CI/CD pipeline (GitHub Actions/GitLab CI)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd linear-tdd-workflow

# Initialize GitFlow
git flow init

# Set up environment
cp .env.example .env
# Configure your Linear API key and other settings

# Install dependencies (example for Node.js projects)
npm install

# Run initial setup
npm run setup
```

## Documentation Index

### Core Development Protocols

| Document | Description | Key Topics |
|----------|-------------|------------|
| [AI Coding Assistant Development Protocol](docs/AI%20Coding%20Assistant%20Development%20Protocol.md) | Complete development methodology | TDD, Clean Code, Testing Strategy, GitFlow, Pre-flight Checklist |
| [PRD](docs/PRD.md) | Product Requirements Document | Business requirements, Technical specs, Success metrics |
| [Coding Rules](docs/coding%20rules.md) | Essential coding standards | Style guides, Best practices, Convention enforcement |

### Linear.app Integration

| Document | Description | Key Topics |
|----------|-------------|------------|
| [Linear Setup](docs/Linear%20Setup.md) | Linear.app integration guide | Workspace setup, Self-assignment, Issue management |
| [Linear Cycle Planning](docs/Linear%20Cycle%20Planning.md) | Sprint and cycle management | Planning, Execution, Retrospectives |
| [Linear Alignment](docs/Linear%20Alignment.md) | Team alignment strategies | Goals, Metrics, Communication |
| [Linear AI](docs/Linear%20AI.md) | AI agent Linear integration | Automation, Task creation, Progress tracking |

### Workflow & Execution

| Document | Description | Key Topics |
|----------|-------------|------------|
| [Clean Code AI (Linear)](docs/Clean%20code%20AI%20(Linear).md) | Clean code assessment system | Code analysis, Quality metrics, Improvement strategies |
| [Action Plan Generation](docs/Action%20Plan%20Generation%20from%20Clean%20Code%20Assessment%20%20(Linear).md) | Automated planning from assessments | Priority calculation, Task generation, Execution planning |
| [Get it done, GO! Linear](docs/get%20it%20done,%20GO!%20Linear.md) | Rapid execution framework | Quick wins, Momentum building, Delivery focus |
| [Relentless Linear](docs/relentless%20linear.md) | Continuous improvement mindset | Persistence, Quality gates, Success tracking |

### Advanced Topics

| Document | Description | Key Topics |
|----------|-------------|------------|
| [Autonomous AI SRE](docs/Autonomous%20AI%20SRE%20-%20Test-Driven%20Development%20Executor.md) | AI SRE agent specification | Pipeline management, Auto-recovery, TDD enforcement |
| [GitFlow](docs/gitflow.md) | Version control workflow | Branching strategy, Release management, Hotfixes |
| [Docs Maintenance](docs/docs%20maintenance.md) | Documentation standards | Update procedures, Quality checks, Automation |
| [PRD Template](docs/PRD%20Template.md) | Product requirement template | Structure, Sections, Best practices |

### Implementation Resources

| Document | Description | Key Topics |
|----------|-------------|------------|
| [Linear Kickoff Existing](docs/Linear%20kickoff%20existing.md) | Onboarding existing projects | Migration strategy, Initial setup, Quick wins |
| [Let's Go Linear](docs/let's%20go%20Linear.md) | Getting started guide | First steps, Common patterns, Tips |
| [Workflow Discussion](docs/workflow-discussion.txt) | Development workflow notes | Process insights, Decision rationale |
| [Execution Linear](docs/execution%20linear.py) | Python execution script | Automation, Task runner, Integration |

### System Documentation

| Document | Description |
|----------|-------------|
| [System README](docs/README.md) | Detailed system architecture and MCP tools integration |

## Key Features

### Test-Driven Development (TDD)

All development follows strict TDD principles:
1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code with safety of tests

### Multi-Agent Architecture

Five specialized AI agents working in concert:
- **AUDITOR**: Code quality assessment
- **STRATEGIST**: Task orchestration
- **EXECUTOR**: Implementation
- **GUARDIAN**: Pipeline SRE
- **SCHOLAR**: Learning engine

### Linear.app Integration

- Automatic issue creation and management
- Sprint planning and tracking
- Progress metrics and reporting
- Team collaboration features

### Clean Code Enforcement

- Continuous code assessment
- Automated improvement execution
- Quality metrics tracking
- Technical debt reduction

## Configuration

### Environment Variables

```bash
# Linear.app Configuration
LINEAR_API_KEY=your_api_key
LINEAR_TEAM_ID=your_team_id
LINEAR_PROJECT_ID=your_project_id

# CI/CD Configuration
CI_PIPELINE_URL=your_pipeline_url
GITHUB_TOKEN=your_github_token

# Feature Flags
ENABLE_AUTO_FIX=true
ENABLE_TDD_ENFORCEMENT=true
ENABLE_GITFLOW=true
```

## Usage

### Running Code Assessment

```bash
# Run clean code assessment
npm run assess

# Generate action plan
npm run plan

# Execute improvements
npm run execute
```

### Working with Linear

```bash
# Sync with Linear
npm run linear:sync

# Create issues from assessment
npm run linear:create-issues

# Update progress
npm run linear:update
```

## CI/CD Integration

The system integrates with your CI/CD pipeline to:
- Enforce TDD practices
- Run automated tests
- Perform code quality checks
- Deploy approved changes

## Contributing

Please follow our strict TDD workflow:

1. Create a feature branch from `develop`
2. Write failing tests first
3. Implement minimal code to pass tests
4. Refactor with test safety
5. Submit PR with full test coverage
6. Ensure all CI checks pass

## Metrics & Monitoring

| Metric | Target | Description |
|--------|--------|-------------|
| Test Coverage | >90% | Code covered by tests |
| Cyclomatic Complexity | <10 | Average complexity per function |
| Pipeline Uptime | 99.9% | CI/CD availability |
| Auto-fix Success | 95% | Successful automated fixes |
| Tech Debt Reduction | 15%/month | Monthly improvement rate |

## Support

- Review [documentation index](#documentation-index) for detailed guides
- Check [workflow discussion](docs/workflow-discussion.txt) for insights
- Follow [coding rules](docs/coding%20rules.md) for standards

## License

[Specify your license here]

## Acknowledgments

Built with Claude Code AI and integrated with Linear.app for maximum development efficiency.