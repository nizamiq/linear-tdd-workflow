# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## 🚀 Linear TDD Workflow System Detected

**Version:** 1.5.0 - Multi-agent autonomous code quality with immediate execution

📚 **Complete system documentation:** `.claude/CLAUDE.md`

**Quick start:** `make onboard` or read `.claude/README.md`

## Project Context

This is the **Linear TDD Workflow System** itself - a self-contained multi-agent framework that can be installed in any project.

**Repository purpose:** Development and maintenance of the workflow system
**Key features:** 23 agents, 7 journeys, autonomous execution, functional release gates, TDD enforcement
**Installation:** Copy `.claude/` directory to target project and run `.claude/install.sh`

### For Development

```bash
# Run tests
npm test

# Functional release validation
npm run release:validate-functional

# View system documentation
cat .claude/CLAUDE.md
```

### Configuration

Linear integration:
- Team: Configured via `LINEAR_TEAM_ID` environment variable
- Project: Configured via `LINEAR_PROJECT_ID` environment variable (optional)
- Task Prefix: Configured via `LINEAR_TASK_PREFIX` environment variable (optional)

Testing:
- Framework: Jest with TypeScript
- Coverage: 80% minimum
- Organization: `tests/unit/`, `tests/integration/`, `tests/e2e/`

GitFlow:
- `main` - Production releases
- `develop` - Integration branch
- `feature/*` - New features
- `hotfix/*` - Emergency fixes
