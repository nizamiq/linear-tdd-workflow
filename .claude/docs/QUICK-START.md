# Quick Start Guide - Claude Agentic Workflow System

Get the Claude Agentic Workflow System running in your project in 5 minutes.

## Prerequisites

- **Node.js** ≥18.0.0
- **npm** or **yarn**
- **Git** repository (recommended)

## 0. Installation (First Time Only)

### New Project
```bash
# Clone workflow system to your workspace
cd ~/workspace  # or your projects directory
git clone https://github.com/your-org/claude-workflow

# Create new project and install workflow
mkdir my-project && cd my-project
../claude-workflow/scripts/install.sh
```

### Existing Project
```bash
# Clone workflow system (parallel to your projects)
cd ~/workspace  # or parent directory of existing project
git clone https://github.com/your-org/claude-workflow

# Navigate to existing project
cd my-existing-project

# Backup current state (recommended)
git stash push -m "Before Claude integration"

# Install workflow system
../claude-workflow/scripts/install.sh
```

**Installation Complete!** The workflow system is now integrated into your project.

## 1. Verify System Installation

```bash
# Check if system is already integrated
ls -la .claude/

# If .claude/ directory exists, verify status
npm run status
```

## 2. First System Health Check

```bash
# Comprehensive system validation
npm run validate

# Check agent system
npm run agent:invoke AUDITOR:health-check

# View current metrics
npm run status
```

Expected output:
```
✅ Claude Agentic Workflow System - Status Report
✅ MCP Tools: 5 servers operational
✅ Agent System: 23 agents ready
✅ TDD Gates: Active
✅ Linear Integration: Connected
✅ Quality Metrics: Coverage 85%, Mutation 32%
```

## 3. Run Your First Assessment

```bash
# Assess entire codebase
npm run assess

# View assessment results
cat .claude/reports/latest-assessment.json
```

The AUDITOR agent will:
- Scan all source files for quality issues
- Generate improvement recommendations
- Create Linear tasks for fixes (if Linear is configured)
- Provide actionable Fix Pack candidates

## 4. Test TDD Workflow

Create a simple test to verify the TDD enforcement system:

```bash
# Start TDD watch mode
npm test:watch
```

In another terminal, create a failing test:

```javascript
// tests/quick-start-demo.test.js
describe('Quick Start Demo', () => {
  test('should demonstrate TDD workflow', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });
});
```

**RED Phase**: Test fails (function doesn't exist)

Create minimal implementation:

```javascript
// src/demo.js
export function add(a, b) {
  return a + b;
}
```

Update test to import:

```javascript
// tests/quick-start-demo.test.js
import { add } from '../src/demo.js';

describe('Quick Start Demo', () => {
  test('should demonstrate TDD workflow', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });
});
```

**GREEN Phase**: Test passes

**REFACTOR Phase**: Improve code quality:

```javascript
// src/demo.js
/**
 * Adds two numbers together
 * @param {number} a First number
 * @param {number} b Second number
 * @returns {number} Sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

## 5. Validate Quality Gates

```bash
# Run all quality checks
npm run precommit

# Should pass with:
# ✅ Linting passed
# ✅ Formatting passed
# ✅ Type checking passed
# ✅ Unit tests passed
# ✅ Coverage ≥80%
```

## 6. Execute Your First Fix Pack

If the assessment found issues:

```bash
# List available Fix Packs
npm run agent:invoke AUDITOR:list-fixes

# Execute a Fix Pack (replace CLEAN-123 with actual task ID)
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123

# Review the changes
git diff
```

## 7. Essential Commands Reference

```bash
# Daily Development
npm test:watch              # TDD mode with hot reload
npm run lint               # Lint and auto-fix issues
npm run format             # Format all code
npm run precommit          # Pre-commit quality gates

# System Operations
npm run assess             # Full codebase assessment
npm run status             # System health and metrics
npm run validate           # Configuration validation
npm run doctor             # Comprehensive diagnostics

# Agent System
npm run agent:invoke AGENT:COMMAND  # Invoke specific agent
npm run execute:fixpack    # Execute approved fixes
npm run linear:sync        # Sync with Linear tasks

# Maintenance
npm run setup              # Re-run system setup
npm run reset              # Reset to clean state
npm run rollback           # Emergency rollback
```

## 8. Key Concepts

### TDD Enforcement
Every code change must follow RED→GREEN→REFACTOR:
- **RED**: Write failing test first
- **GREEN**: Minimal code to pass
- **REFACTOR**: Improve while keeping tests green

### Agent System
20 specialized agents handle different aspects:
- **AUDITOR**: Finds quality issues
- **EXECUTOR**: Implements fixes (≤300 LOC)
- **GUARDIAN**: Protects CI/CD pipelines
- **STRATEGIST**: Orchestrates workflows
- **+16 others**: Specialized capabilities

### Fix Packs
Atomic improvements with constraints:
- Maximum 300 lines of code
- Pre-approved change types only
- Strict TDD implementation
- Automatic rollback capability

### Quality Gates
Enforced automatically:
- 80% minimum test coverage
- 30% mutation testing for critical paths
- Zero linting errors
- Type safety validation

## 9. Next Steps

### Immediate (5 minutes)
- Review assessment results: `cat .claude/reports/latest-assessment.json`
- Configure Linear integration: [LINEAR-INTEGRATION.md](LINEAR-INTEGRATION.md)
- Set up CI/CD hooks: [CI-CD-INTEGRATION.md](CI-CD-INTEGRATION.md)

### Short-term (30 minutes)
- Read complete [User Guide](USER-GUIDE.md)
- Explore [Agent Overview](AGENT-OVERVIEW.md)
- Customize [Configuration](CONFIGURATION.md)

### Medium-term (1 hour)
- Implement first Fix Pack
- Set up team workflow
- Configure quality metrics dashboards

## 🚨 Troubleshooting Quick Fixes

### System Not Responding
```bash
npm run doctor              # Comprehensive diagnostics
npm run validate            # Check configuration
npm run reset               # Reset to clean state
```

### Tests Failing
```bash
npm test -- --verbose       # Detailed test output
npm run lint               # Check for code issues
npm run typecheck          # Verify TypeScript
```

### Agent Errors
```bash
npm run agent:invoke AUDITOR:health-check
npm run status             # Check system health
```

### Linear Integration Issues
```bash
npm run linear:sync        # Re-sync with Linear
npm run validate           # Check API configuration
```

## ✅ Success Checklist

After completing this quick start, you should have:

- [ ] System health check passing
- [ ] First assessment completed
- [ ] TDD workflow demonstrated
- [ ] Quality gates passing
- [ ] Agent system operational
- [ ] Basic understanding of Fix Packs

## 🎯 What's Next?

You now have a functional Claude Agentic Workflow System! The system will:

1. **Continuously monitor** your code quality
2. **Enforce TDD** for all changes
3. **Generate Fix Packs** for improvements
4. **Protect your pipelines** from failures
5. **Learn and adapt** to your codebase patterns

For deeper understanding, continue to:
- **[User Guide](USER-GUIDE.md)** - Complete system overview
- **[TDD Workflow](TDD-WORKFLOW.md)** - Master the enforcement system
- **[Agent Overview](AGENT-OVERVIEW.md)** - Understand the 20-agent architecture

**Welcome to autonomous code quality management! 🚀**