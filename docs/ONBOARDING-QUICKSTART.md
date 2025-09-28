# Quick Start Guide - Claude Agentic Workflow System

This is the fastest way to get started with the Claude Agentic Workflow System. Choose your path:

## 🚀 New Project (5 minutes)

```bash
# Clone workflow system to your workspace
cd ~/workspace  # or your projects directory
git clone https://github.com/your-org/claude-workflow

# Create new project and install workflow
mkdir my-project && cd my-project
../claude-workflow/scripts/install.sh
```

**Done!** Your project now has:
- ✅ TDD enforcement
- ✅ 20-agent quality management
- ✅ Universal commands via Makefile
- ✅ CI/CD templates

## 🔧 Existing Project (10 minutes)

```bash
# Clone workflow system (parallel to your projects)
cd ~/workspace  # or parent directory of existing project
git clone https://github.com/your-org/claude-workflow

# Navigate to existing project
cd my-existing-project

# Backup current state
git stash push -m "Before Claude integration"

# Install workflow system
../claude-workflow/scripts/install.sh

# Verify integration
make validate
```

**Done!** Your existing project is now enhanced with autonomous code quality management.

## 📋 Essential Commands

```bash
# Core workflow
make assess              # Run code quality assessment
make fix TASK=CLEAN-123  # Implement fix pack
make test               # Run TDD cycle
make status             # Show system status

# Development
make lint               # Lint all code
make format             # Format all code
make validate           # Validate configuration

# Diagnostics
make doctor             # Diagnose issues
make help               # Show all commands
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