# 🤖 Claude Code Workflow System

## System Active: Linear TDD Workflow v1.3.0

This directory contains an autonomous multi-agent workflow system designed to help Claude Code maintain code quality through strict Test-Driven Development.

## 🎯 Quick Start for Claude Code

### First Time Setup
```bash
# 1. Check if system is installed
test -f .claude-installed && echo "✓ System ready" || echo "✗ Need setup"

# 2. If not installed, run onboarding
make onboard

# 3. Verify activation
make status
```

### Primary Commands You Should Know

**Native Claude Code Slash Commands:**
| Command | Purpose | Agent Used |
|---------|---------|------------|
| `/assess` | Scan code quality | AUDITOR |
| `/fix <TASK-ID>` | Fix problems with TDD | EXECUTOR |
| `/recover` | Fix CI/CD issues | GUARDIAN |
| `/learn` | Extract patterns | SCHOLAR |
| `/release <version>` | Manage release | STRATEGIST |
| `/status` | Check workflow status | STRATEGIST |

**Alternative Makefile Commands:**
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `make assess` | Scan code quality | If slash commands unavailable |
| `make fix-pack` | Fix problems with TDD | Batch processing |
| `make test` | Run test suite | Direct test execution |
| `make ci-recovery` | Fix CI/CD issues | Pipeline recovery |
| `make release` | Manage release | Deployment process |

## 📂 Directory Structure

```
.claude/
├── journeys/        # 6 autonomous workflows
│   ├── jr1-onboarding.js
│   ├── jr2-assessment.js
│   ├── jr3-fix-pack.js
│   ├── jr4-ci-recovery.js
│   ├── jr5-pattern-mining.js
│   ├── jr6-release.js
│   └── registry.yaml
├── agents/          # Specialized agents (Markdown with frontmatter)
├── commands/        # Slash command definitions
├── docs/           # Documentation
├── scripts/        # Utility scripts
├── cli.js          # Direct agent control
├── DISCOVERY.md    # This activation guide
└── README.md       # You are here
```

## 🔄 Autonomous Journeys

The system provides 6 self-coordinating journeys:

### JR-1: Onboarding
```bash
make onboard
```
- Auto-detects project type
- Sets up TDD structure
- Configures Linear integration

### JR-2: Assessment
```bash
make assess
```
- Scans entire codebase
- Creates Linear tasks
- Generates fix recommendations

### JR-3: Fix Pack
```bash
make fix-pack
```
- Implements approved fixes
- Enforces TDD cycle
- Creates atomic PRs

### JR-4: CI Recovery
```bash
make ci-recovery
```
- Detects pipeline failures
- Implements fixes
- Validates recovery

### JR-5: Pattern Mining
```bash
make pattern-mining
```
- Learns from successful PRs
- Updates knowledge base
- Improves decisions

### JR-6: Release
```bash
make release
```
- Manages version bumps
- Generates changelogs
- Handles deployment

## 🤝 Working with Agents

### Claude Code Native Integration
Agents are now natively discoverable by Claude Code through:
- **Slash Commands**: `/assess`, `/fix`, `/recover`, `/learn`, `/release`, `/status`
- **Agent Definitions**: `.claude/agents/*.md` files with YAML frontmatter
- **Automatic Selection**: Claude Code selects appropriate agents based on task

### Available Agents
- **AUDITOR** (`auditor.md`) - Code quality scanner
- **EXECUTOR** (`executor.md`) - Fix implementation with TDD
- **GUARDIAN** (`guardian.md`) - CI/CD monitoring and recovery
- **STRATEGIST** (`strategist.md`) - Workflow orchestration
- **SCHOLAR** (`scholar.md`) - Pattern learning and mining
- **TESTER** (`tester.md`) - Test creation and validation
- **VALIDATOR** (`validator.md`) - Code review and quality gates
- **LINTER** (`linter.md`) - Code style enforcement
- **TYPECHECKER** (`typechecker.md`) - Type safety validation
- **SECURITY** (`security.md`) - Security scanning

## 🔧 Configuration

### Required Environment Variables
```bash
# .env file must contain:
LINEAR_API_KEY=lin_api_xxxxx  # Required for Linear integration
LINEAR_TEAM_ID=team-id        # Your Linear team
LINEAR_PROJECT_ID=project-id  # Your Linear project
```

### System Settings
- **Location**: `.claude/settings.json`
- **FIL Auto-approval**: 0 and 1 (formatting, renames)
- **Confidence threshold**: 85%
- **Max LOC per PR**: 300

## 📊 Decision Logic

### When to Act Autonomously

1. **Auto-approve** (no human review):
   - FIL-0: Formatting, comments
   - FIL-1: Variable renames, dead code
   - Confidence ≥ 85%

2. **Require approval**:
   - FIL-2: New utilities, configs
   - FIL-3: APIs, migrations
   - Production deployments

### TDD Enforcement

Every code change MUST follow:
1. **RED** - Write failing test
2. **GREEN** - Minimal code to pass
3. **REFACTOR** - Improve with tests

## 🚨 Important Constraints

- **Coverage**: ≥80% diff coverage required
- **PR Size**: ≤300 LOC per PR
- **Branches**: GitFlow required (feature/*, release/*)
- **Tests**: Test-first development mandatory

## 💡 Usage Examples

### When user says "check my code"
```bash
make assess
# This will scan code and create Linear tasks
```

### When user says "fix the linting issues"
```bash
make fix-pack
# This will implement fixes with TDD
```

### When user says "why are tests failing"
```bash
make ci-recovery
# This will diagnose and fix CI issues
```

## 📚 Additional Resources

- **Full Documentation**: `/docs/JOURNEYS.md`
- **Agent Reference**: `/docs/ARCHITECTURE-AGENTS.md`
- **Project Instructions**: `/CLAUDE.md`
- **Troubleshooting**: `/docs/TROUBLESHOOTING.md`

## 🔍 System Detection

Claude Code should automatically detect this system by:
1. Presence of `.claude/` directory
2. Existence of `Makefile` with journey commands
3. `.claude-installed` marker file
4. `CLAUDE.md` in project root

## 📞 Getting Help

```bash
# Show all available commands
make help

# Check system status
make status

# View journey details
npm run journey:list
```

---

**This system is ready to help you maintain code quality through autonomous, TDD-enforced workflows.**