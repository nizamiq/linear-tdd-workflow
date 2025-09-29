# 📚 Claude Code Commands - TDD + Linear Workflow

## Quick Reference

This directory contains the **focused command palette** for the Linear TDD Workflow System. Only 6 core commands aligned to the journey system - not dozens of scattered commands.

## Core Commands (Journey-Aligned)

| Command | Purpose | Journey | Entry Point | SLA |
|---------|---------|---------|-------------|-----|
| `/assess` | Code quality scan → Linear tasks | JR-2 | `make assess` | ≤12min |
| `/fix` | TDD fix implementation | JR-3 | `make fix TASK=XXX` | ≤30min |
| `/recover` | CI/CD pipeline recovery | JR-4 | `make recover` | ≤10min |
| `/learn` | Pattern mining from PRs | JR-5 | `make learn` | Weekly |
| `/release` | Production deployment | JR-6 | `make release` | ≤2hr |
| `/status` | Current workflow status | - | `make status` | Real-time |

## Why Only 6 Commands?

**Focus over Features** - These 6 commands cover the entire TDD + Linear workflow:
1. **Assess** quality issues
2. **Fix** them with TDD
3. **Recover** from failures
4. **Learn** from successes
5. **Release** to production
6. **Monitor** status

Everything else is handled by the 20-agent system working behind the scenes.

## Command Discovery

```bash
# List all commands (human-readable)
node .claude/cli.js commands:list

# Get commands in JSON (for parsing)
node .claude/cli.js commands:list --json

# Get specific command help
cat .claude/commands/journey-assess.md
```

## Script Entrypoints

Each command has multiple entry points for flexibility:

### Makefile (Recommended)
```bash
make assess              # Cleanest syntax
make fix TASK=CLEAN-123
make recover
```

### Direct Journey Execution
```bash
node .claude/journeys/jr2-assessment.js
node .claude/journeys/jr3-fix-pack.js --task-id CLEAN-123
```

### Agent Invocation
```bash
npm run agent:invoke AUDITOR:assess-code
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123
```

## Command Documentation

Each command has comprehensive documentation:
- `journey-assess.md` - Assessment details
- `journey-fix.md` - TDD fix process
- `journey-recover.md` - Pipeline recovery
- `journey-learn.md` - Pattern learning
- `journey-release.md` - Release management
- `workflow-status.md` - Status monitoring

## Integration with Claude Code

Claude Code can discover and execute these commands via:
1. **Slash commands** - `/assess`, `/fix CLEAN-123`, etc.
2. **Make targets** - `make assess`, `make fix TASK=XXX`
3. **Direct scripts** - Entry points in each command file

## Linear Integration

All commands integrate with Linear.app:
- `/assess` → Creates CLEAN-XXX issues
- `/fix` → Updates task status
- `/recover` → Creates INCIDENT-XXX
- `/learn` → Analyzes completed tasks
- `/release` → Updates milestones
- `/status` → Shows sprint progress

## TDD Enforcement

The `/fix` command enforces strict TDD:
1. **RED** - Write failing test first
2. **GREEN** - Minimal code to pass
3. **REFACTOR** - Improve with tests passing

No exceptions. Every fix follows this cycle.

## Quick Start

```bash
# 1. Assess code quality
/assess

# 2. Review Linear tasks created
# (CLEAN-001, CLEAN-002, etc.)

# 3. Fix issues with TDD
/fix CLEAN-001

# 4. Check status
/status

# 5. Learn from merged PRs
/learn

# 6. Release when ready
/release
```

## Performance SLAs

| Operation | Target | Actual |
|-----------|--------|--------|
| Assessment | ≤12min | ~8min |
| Fix (simple) | ≤15min | ~12min |
| Fix (complex) | ≤30min | ~25min |
| Recovery | ≤10min | ~7min |
| Release | ≤2hr | ~90min |

## Notes

- Commands are journey-based, not agent-based
- Each command coordinates multiple agents
- All operations update Linear automatically
- MCP tools provide real-time integration
- No webhook infrastructure needed

This focused command set provides maximum efficiency for the TDD + Linear workflow.