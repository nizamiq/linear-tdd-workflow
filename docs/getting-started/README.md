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

### 4. Initialize the System

```bash
npm run setup
```

This command will:
- Verify your environment
- Initialize GitFlow
- Set up agent configurations
- Create necessary directories

### 5. Run Your First Assessment

```bash
npm run assess
```

The AUDITOR agent will scan your code and create Linear tasks for improvements.

## Core Concepts

### Test-Driven Development (TDD)

Every change follows the RED-GREEN-REFACTOR cycle:

1. **[RED]**: Write a failing test first
2. **[GREEN]**: Write minimal code to pass the test
3. **[REFACTOR]**: Improve code while maintaining passing tests

### Multi-Agent Architecture

The system uses five specialized agents:

1. **AUDITOR** - Scans code for quality issues
2. **EXECUTOR** - Implements approved fixes
3. **GUARDIAN** - Monitors and recovers pipelines
4. **STRATEGIST** - Orchestrates agent activities
5. **SCHOLAR** - Learns from successful patterns

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

### Code Assessment

```bash
# Full repository scan
npm run assess

# Incremental scan (changed files only)
npm run assess:incremental
```

### Working with Agents

```bash
# Initialize agents
npm run agents:init

# Check agent status
npm run agents:status

# Execute Fix Packs
npm run execute:fixpack
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
│   ├── agents/          # Agent specifications
│   ├── docs/            # Agent documentation
│   └── settings.json    # System settings
├── .github/             # GitHub Actions workflows
├── docs/                # Documentation
├── scripts/             # Utility scripts
├── src/                 # Source code
├── tests/               # Test suites
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

*Ready to start? Run `npm run assess` to begin improving your code!*