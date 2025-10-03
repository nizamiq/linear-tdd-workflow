# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Linear TDD Workflow System Detected

This project has the **Linear TDD Workflow System v1.4.0** installed - a multi-agent autonomous code quality management system with functional release gates.

### Quick Start

```bash
# Verify system is active
test -d .claude && echo "✅ System Available" || echo "❌ Not found"

# View complete documentation
cat .claude/CLAUDE.md

# Get started
make onboard
```

### Primary Commands

**Core Workflow:**
- `/assess` - Scan code quality and generate task definitions
- `/linear` - Create Linear tasks from assessment
- `/fix <TASK-ID>` - Implement fix with TDD enforcement
- `/release <version>` - Manage production release with functional gate
- `/status` - Current workflow and Linear status

**Specialized:**
- `/recover` - Auto-fix broken CI/CD pipeline
- `/cycle plan` - Sprint planning
- `/docs` - Documentation validation
- `/python` - Python optimization
- `/typescript` - TypeScript development
- `/deploy` - Progressive deployment

**Alternative access:** `make assess`, `make fix TASK=CLEAN-123`, `make release`

### Critical Constraints

⚠️ **Test-Driven Development is NON-NEGOTIABLE**
- Every change follows RED→GREEN→REFACTOR cycle
- ≥80% diff coverage required
- ≥30% mutation score required
- EXECUTOR agent enforces automatically

🎯 **Functional Release Gate**
- Only features with passing E2E tests can be released
- Registry tracks: `implemented` (✅ allows), `partial` (❌ blocks), `planned` (⚪ neutral)
- Check readiness: `npm run release:validate-functional`
- Gate runs automatically in release journey Phase 2.5

### Essential Commands

```bash
# Testing
npm test                     # All tests with coverage
npm test:watch              # Watch mode for TDD
npm test:e2e                # End-to-end tests

# Quality
npm run lint                # Lint and auto-fix
npm run typecheck           # Type checking
npm run precommit           # Pre-commit checks

# Functional Release
npm run release:validate-functional   # Check release readiness
npm run release:user-stories          # View E2E coverage
npm run release:add-story             # Add feature to registry

# Cycle Planning
npm run cycle:full          # Complete sprint planning

# Agent Operations
npm run assess              # Code assessment
npm run execute:fixpack     # Execute approved fixes
```

## Complete Documentation

📚 **Full system guide:** `.claude/CLAUDE.md` (comprehensive reference)

**Key documentation:**
- `.claude/docs/FUNCTIONAL-RELEASE.md` - Functional release complete guide
- `.claude/docs/TDD-REMINDER.md` - TDD reference card
- `.claude/docs/DECISION-MATRIX.md` - When to use agents vs workflows
- `.claude/docs/PARALLEL-EXECUTION.md` - Parallel execution patterns
- `.claude/agents/` - All 23 agent specifications
- `.claude/commands/` - All slash command definitions

## Project Context

**[Add your project-specific context below]**

Linear Configuration:
- Team: Configured via `LINEAR_TEAM_ID` environment variable
- Project: Configured via `LINEAR_PROJECT_ID` environment variable (optional)
- Task Prefix: Configured via `LINEAR_TASK_PREFIX` environment variable (optional)

Testing Framework:
- Jest with TypeScript
- Coverage: 80% minimum
- Organization: `tests/unit/`, `tests/integration/`, `tests/e2e/`

GitFlow Branches:
- `main` - Production releases only
- `develop` - Integration branch
- `feature/*` - New features
- `hotfix/*` - Emergency fixes

## System Information

**Version:** 1.4.0
**Agents:** 23 specialized agents
**Journeys:** 7 autonomous workflows
**MCP Servers:** linear-server, playwright, kubernetes, context7, sequential-thinking

For complete details, see `.claude/CLAUDE.md`
