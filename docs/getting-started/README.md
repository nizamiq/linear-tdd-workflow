# Getting Started Guide

Welcome to the Linear TDD Workflow System! This guide will help you get up and running in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm 8+** - Comes with Node.js
- **Git 2.30+** - [Download](https://git-scm.com/)
- **GitFlow extension** - [Installation guide](https://github.com/nvie/gitflow/wiki/Installation)

## Quick Start (5 Minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/linear-tdd-workflow.git
cd linear-tdd-workflow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```bash
# Linear.app Configuration
LINEAR_API_KEY=lin_api_xxxxxxxxxxxx
LINEAR_TEAM_ID=your_team_id
LINEAR_PROJECT_ID=your_project_id

# GitHub Configuration
GITHUB_TOKEN=your_github_token
GITHUB_ORG=your_organization

# Agent Settings
ENABLE_AUTO_FIX=true
ENABLE_TDD_ENFORCEMENT=true
```

### 4. Run Automatic Onboarding (Autonomous Journey JR-1)

```bash
make onboard
# OR using npm:
# npm run journey:onboard
```

This autonomous journey will:

- Detect your project type (Python/JS/TS)
- Verify prerequisites
- Initialize GitFlow
- Set up agent configurations
- Create necessary directories
- Configure Linear integration
- Run initial TDD validation

### 5. Run Your First Assessment (Autonomous Journey JR-2)

```bash
make assess
# OR using npm:
# npm run journey:assess
```

The assessment journey will autonomously:

- Scan your codebase with AUDITOR
- Create Linear tasks for improvements
- Generate Fix Packs for FIL-0/FIL-1 issues
- Provide actionable recommendations

## Core Concepts

### Test-Driven Development (TDD)

Every change follows the RED-GREEN-REFACTOR cycle:

1. **[RED]**: Write a failing test first
2. **[GREEN]**: Write minimal code to pass the test
3. **[REFACTOR]**: Improve code while maintaining passing tests

### Multi-Agent Architecture

The system uses 20 specialized agents coordinated through autonomous journeys:

**Core Agents:**

1. **AUDITOR** - Scans code for quality issues
2. **EXECUTOR** - Implements approved fixes
3. **GUARDIAN** - Monitors and recovers pipelines
4. **STRATEGIST** - Orchestrates agent activities
5. **SCHOLAR** - Learns from successful patterns

**Autonomous Journeys:**

- **JR-1 Onboarding** - Automatic project setup and configuration
- **JR-2 Assessment** - Comprehensive code quality evaluation
- **JR-3 Fix Pack** - TDD-enforced fix implementation
- **JR-4 CI Recovery** - Automated pipeline recovery
- **JR-5 Pattern Mining** - Learning from successful patterns
- **JR-6 Release** - Automated release management

### Fix Packs

Pre-approved, low-risk improvements that agents can implement autonomously:

- Linting and formatting fixes
- Dead code removal
- Documentation updates
- Simple refactors
- Dependency updates

### FIL Classification

Feature Impact Levels categorize changes by risk:

- **FIL-0**: No risk (formatting)
- **FIL-1**: Low risk (variable renames)
- **FIL-2**: Medium risk (needs Tech Lead approval)
- **FIL-3**: High risk (needs Tech Lead + Product Owner approval)

## Common Operations

### Using the Universal Makefile

The project includes a universal Makefile that auto-detects your project type:

```bash
# Autonomous Journeys
make onboard          # Run onboarding journey (JR-1)
make assess           # Run assessment journey (JR-2)
make fix-pack         # Execute TDD fix pack (JR-3)
make ci-recovery      # Recover CI/CD pipeline (JR-4)
make pattern-mining   # Mine successful patterns (JR-5)
make release          # Manage release (JR-6)

# Development Commands
make test             # Run tests with coverage
make lint             # Lint and format code
make build            # Build the project
make clean            # Clean generated files
```

### Running Tests

```bash
# All tests with coverage
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Mutation testing
npm run test:mutation
```

### Working with Autonomous Journeys

```bash
# Run specific journey
npm run journey:onboard      # JR-1: Onboarding
npm run journey:assess        # JR-2: Assessment
npm run journey:fix-pack      # JR-3: Fix Pack
npm run journey:ci-recovery   # JR-4: CI Recovery
npm run journey:pattern       # JR-5: Pattern Mining
npm run journey:release       # JR-6: Release

# List available journeys
npm run journey:list

# View journey status
npm run journey:status
```

### Working with Agents

```bash
# Initialize agents
npm run agents:init

# Check agent status
npm run agents:status

# Invoke specific agent
npm run agent:invoke AUDITOR:assess-code -- --scope full
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123
```

### Linear Integration

```bash
# Sync with Linear
npm run linear:sync

# Create issues from assessment
npm run linear:create-issues

# Update task progress
npm run linear:update
```

## Project Structure

```
linear-tdd-workflow/
├── .claude/              # Agent configurations
│   ├── agents/          # 20 agent specifications
│   ├── journeys/        # Autonomous journey implementations
│   │   ├── jr1-onboarding.js
│   │   ├── jr2-assessment.js
│   │   ├── jr3-fix-pack.js
│   │   ├── jr4-ci-recovery.js
│   │   ├── jr5-pattern-mining.js
│   │   ├── jr6-release.js
│   │   └── registry.yaml
│   ├── cli.js           # Enhanced CLI interface
│   └── settings.json    # System settings
├── .github/             # GitHub Actions workflows
├── docs/                # Documentation
├── scripts/             # Utility scripts
├── src/                 # Source code
├── tests/               # Test suites
├── Makefile             # Universal command interface
├── .env                 # Environment configuration
├── package.json         # Project dependencies
└── README.md           # Project overview
```

## Next Steps

1. **Review Documentation**
   - [AI Development Protocol](../ai-development-protocol.md)
   - [Coding Rules](../coding-rules.md)
   - [Linear Setup Guide](../linear-setup.md)

2. **Run Your First Assessment**

   ```bash
   npm run assess
   ```

3. **Configure Linear Integration**
   - Get your API key from Linear Settings
   - Update `.env` with your credentials
   - Test connection: `npm run linear:sync`

4. **Set Up CI/CD**
   - GitHub Actions workflows are pre-configured
   - Ensure repository secrets are set
   - Enable branch protection rules

## Troubleshooting

### Common Issues

**npm install fails**

```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules
npm install
```

**Linear connection fails**

- Verify API key in `.env`
- Check network connectivity
- Ensure Linear workspace access

**Tests fail with coverage errors**

- Run `npm test` to see coverage report
- Add tests for uncovered code
- Check coverage thresholds in `jest.config.js`

For more issues, see the [Troubleshooting Guide](../reference/troubleshooting.md).

## Getting Help

- 📖 [Documentation Index](../index.md)
- ❓ [FAQ](../reference/faq.md)
- 🐛 [Issue Tracker](https://github.com/your-org/linear-tdd-workflow/issues)
- 💬 [Community Support](https://discord.gg/example)

---

_Ready to start? Run `npm run assess` to begin improving your code!_
