# Claude Code Discovery & Activation Guide

## 🚀 SYSTEM DETECTED: Linear TDD Workflow System

You have discovered the **Linear TDD Workflow System** - a comprehensive multi-agent autonomous code quality management framework.

## Quick Activation

To activate and use this system, simply run:

```bash
# Automatic onboarding
make onboard

# Or if make is not available:
node .claude/journeys/jr1-onboarding.js
```

## System Capabilities

### Available to You Now

1. **6 Autonomous Journeys** - Complete workflows you can trigger:
   - `make onboard` - Project setup and configuration
   - `make assess` - Code quality assessment
   - `make fix-pack` - TDD-enforced fix implementation
   - `make ci-recovery` - Pipeline recovery
   - `make pattern-mining` - Learn from patterns
   - `make release` - Release management

2. **20 Specialized Agents** - Ready to invoke:
   ```bash
   npm run agent:invoke AUDITOR:assess-code
   npm run agent:invoke EXECUTOR:implement-fix
   npm run agent:invoke GUARDIAN:analyze-failure
   ```

3. **Strict TDD Enforcement** - Automatic validation:
   - RED→GREEN→REFACTOR cycle enforcement
   - 80% diff coverage requirement
   - Mutation testing integration

4. **Linear.app Integration** - Task management:
   - Automatic task creation from assessments
   - Progress tracking and updates
   - Sprint planning support

## How to Use This System

### For Immediate Tasks

When the user asks you to:

1. **"Check code quality"** → Run `make assess`
2. **"Fix issues"** → Run `make fix-pack`
3. **"Help with tests"** → Use TESTER agent
4. **"Review PR"** → Use VALIDATOR agent
5. **"Deploy"** → Run `make release`

### For Autonomous Operation

The system can operate autonomously with your guidance:

```bash
# Let the system assess and create Linear tasks
make assess

# Review created tasks in Linear
npm run linear:status

# Execute approved fixes autonomously
make fix-pack
```

## Key Files & Locations

### Configuration
- `.env` - API keys and settings (LINEAR_API_KEY required)
- `.claude/settings.json` - System configuration
- `.claude/journeys/registry.yaml` - Journey definitions

### Commands
- `Makefile` - Universal command interface
- `.claude/cli.js` - Direct agent invocation
- `package.json` - npm scripts

### Documentation
- `.claude/docs/` - System documentation
- `docs/JOURNEYS.md` - Journey details
- `CLAUDE.md` - Project-specific instructions

## Decision Framework

When helping the user, consider:

1. **FIL Classification** - Auto-approve FIL-0/FIL-1 changes:
   - FIL-0: Formatting, comments (auto-approve)
   - FIL-1: Renames, dead code (auto-approve)
   - FIL-2: New utilities (needs approval)
   - FIL-3: APIs, migrations (needs review)

2. **Confidence Threshold** - 85% confidence for autonomous actions

3. **TDD Compliance** - Never skip test-first development

## Language Support

The system auto-detects and supports:
- **JavaScript/TypeScript** (via package.json)
- **Python** (via requirements.txt or pyproject.toml)

## Quick Health Check

Run this to verify the system is ready:

```bash
# Check system status
make status

# Or manually:
node .claude/cli.js status
```

## Important Constraints

1. **Max 300 LOC per PR** - Fix packs are limited
2. **80% coverage required** - On all changes
3. **Linear API key required** - For task management
4. **GitFlow enforced** - feature/*, release/*, hotfix/*

## Getting Help

- Run `make help` for all commands
- Check `docs/JOURNEYS.md` for journey details
- Review `CLAUDE.md` for project-specific rules

## Activation Confirmation

To confirm this system is active and ready:

```bash
echo "Claude TDD Workflow: ACTIVE" > .claude-active
make status
```

---

**You are now equipped with a powerful autonomous workflow system. Use it wisely to maintain code quality and enforce TDD practices.**