# Quick Start Guide - Claude Agentic Workflow System

This is the fastest way to get started with the Claude Agentic Workflow System using our autonomous journey system.

## 🚀 Automatic Onboarding (3 minutes)

The system now includes a fully autonomous onboarding journey (JR-1) that handles all setup:

```bash
# Clone the workflow system
git clone https://github.com/your-org/linear-tdd-workflow
cd linear-tdd-workflow

# Install dependencies
npm install

# Configure Linear API key
cp .env.example .env
# Edit .env with your LINEAR_API_KEY

# Run autonomous onboarding
make onboard
```

**The onboarding journey automatically:**

- ✅ Detects project type (Python/JS/TS)
- ✅ Validates prerequisites
- ✅ Initializes GitFlow
- ✅ Configures 20-agent system
- ✅ Sets up Linear integration
- ✅ Creates TDD structure
- ✅ Runs initial validation

## 🔧 For Existing Projects

```bash
# Copy .claude directory to your project
cp -r linear-tdd-workflow/.claude your-project/
cp linear-tdd-workflow/Makefile your-project/

# Navigate to your project
cd your-project

# Run autonomous onboarding
make onboard
```

**The system will:**

- Auto-detect your project type
- Preserve existing structure
- Enhance with TDD workflow
- Configure agents appropriately

## 📋 Essential Commands

```bash
# Autonomous Journeys
make onboard            # Run onboarding journey (JR-1)
make assess             # Run assessment journey (JR-2)
make fix-pack           # Execute TDD fix pack (JR-3)
make ci-recovery        # Recover CI/CD pipeline (JR-4)
make pattern-mining     # Mine successful patterns (JR-5)
make release           # Manage release (JR-6)

# Development
make test              # Run TDD tests
make lint              # Lint all code
make format            # Format all code
make build             # Build the project

# Status & Help
make status            # Show system status
make help              # Show all commands
```

## 🎯 First TDD Cycle

### 1. Write Failing Test (RED)

```bash
# JavaScript/TypeScript
echo 'import { add } from "../src/math"; test("add", () => expect(add(2, 3)).toBe(5));' > tests/math.test.js

# Python
echo 'from src.math import add\ndef test_add(): assert add(2, 3) == 5' > tests/test_math.py
```

### 2. Run Tests (Should Fail)

```bash
make test  # RED phase - test should fail
```

### 3. Write Minimal Code (GREEN)

```bash
# JavaScript/TypeScript
mkdir -p src && echo 'export const add = (a, b) => a + b;' > src/math.js

# Python
mkdir -p src && echo 'def add(a, b): return a + b' > src/math.py
```

### 4. Verify Tests Pass

```bash
make test  # GREEN phase - test should pass
```

### 5. Refactor (if needed)

```bash
# Improve code while keeping tests green
make test  # Ensure tests still pass after refactoring
```

## 🤖 Agent Quick Start

The system includes 20 specialized agents managed through autonomous journeys:

```bash
# Run assessment with AUDITOR agent
make assess

# Check agent status
npm run agents:status

# Direct agent invocation
npm run agent:invoke AUDITOR:assess-code -- --scope full
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123
npm run agent:invoke GUARDIAN:analyze-failure -- --auto-fix
```

## 🔄 Autonomous Journeys

The system operates through 6 autonomous journeys:

| Journey  | Purpose              | Command               |
| -------- | -------------------- | --------------------- |
| **JR-1** | Automatic onboarding | `make onboard`        |
| **JR-2** | Code assessment      | `make assess`         |
| **JR-3** | Fix implementation   | `make fix-pack`       |
| **JR-4** | CI/CD recovery       | `make ci-recovery`    |
| **JR-5** | Pattern mining       | `make pattern-mining` |
| **JR-6** | Release management   | `make release`        |

Each journey combines multiple agents with decision engines for autonomous operation.

```bash
# Check agent status
make agents-status

# Run first assessment
make assess

# Show detailed system status
make status-detailed

# Validate everything is working
make validate-tdd
```

## 🔧 Language-Specific Setup

### JavaScript/TypeScript

```bash
node .claude/setup.js --language typescript
make test-js
make lint-js
```

### Python

```bash
node .claude/setup.js --language python
make test-py
make lint-py
```

### Polyglot (JS + Python)

```bash
node .claude/setup.js --language javascript,python
make test      # Tests both languages
make lint      # Lints both languages
```

## 📊 Verify Installation

```bash
# Run comprehensive validation
make ci-test

# Expected output:
# ✅ Dependencies installed
# ✅ Configuration valid
# ✅ Agents operational
# ✅ TDD gates active
# ✅ Tests passing
# ✅ Coverage ≥80%
```

## 🎯 Next Steps

1. **Configure Linear**: Add Linear API key for task management
2. **Setup CI/CD**: Configure GitHub Actions or your CI system
3. **Train Team**: Share onboarding docs with team members
4. **Run First Assessment**: Let agents analyze your codebase
5. **Implement First Fix**: Use TDD to implement improvements

## 📚 Documentation Paths

- **New Project**: [Complete New Project Guide](ONBOARDING-NEW-PROJECT.md)
- **Existing Project**: [Complete Existing Project Guide](ONBOARDING-EXISTING-PROJECT.md)
- **Agent System**: [Agent Reference](.claude/agents/CLAUDE.md)
- **Troubleshooting**: Use `make doctor` for automated diagnostics

## 🆘 Quick Troubleshooting

```bash
# Issue: Setup fails
make check-deps         # Check prerequisites
node --version          # Ensure Node.js ≥18.0.0

# Issue: Tests not running
make doctor             # Automated diagnosis
make validate-tdd       # Check TDD configuration

# Issue: Agents not working
make agents-status      # Check agent health
make validate-permissions # Verify tool permissions

# Issue: Need help
make help               # Show all commands
node .claude/cli.js --help # Detailed CLI help
```

## 🎉 Success!

You now have a production-ready autonomous code quality management system with:

- **TDD Enforcement**: Strict RED→GREEN→REFACTOR workflow
- **20 Specialized Agents**: Autonomous quality management
- **Universal Commands**: Works with any project type
- **Quality Gates**: 80% coverage, mutation testing, linting
- **CI/CD Integration**: Automated pipeline validation

Start developing with confidence! 🚀

---

**Questions?** Run `make doctor` for diagnostics or check the detailed guides for your project type.
