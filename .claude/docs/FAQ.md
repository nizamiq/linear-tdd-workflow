# Frequently Asked Questions - Claude Agentic Workflow System

Common questions and answers about the Claude Agentic Workflow System.

## Table of Contents

1. [General Questions](#general-questions)
2. [Getting Started](#getting-started)
3. [Agent System](#agent-system)
4. [TDD Workflow](#tdd-workflow)
5. [Quality Gates](#quality-gates)
6. [Linear Integration](#linear-integration)
7. [Performance](#performance)
8. [Configuration](#configuration)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Usage](#advanced-usage)

## General Questions

### What is the Claude Agentic Workflow System?

The Claude Agentic Workflow System is a production-ready, autonomous code quality management system that combines 20 specialized AI agents with strict Test-Driven Development (TDD) enforcement. It automatically monitors code quality, creates improvement tasks, implements fixes, and protects CI/CD pipelines.

### How is this different from traditional code quality tools?

Traditional tools are reactive - they report issues after you write code. Our system is proactive and autonomous:

- **20 AI Agents** work continuously to improve code quality
- **Automatic Fix Implementation** via strict TDD cycles
- **Linear Integration** for seamless task management
- **Pipeline Protection** with auto-recovery
- **Continuous Learning** that adapts to your codebase

### What languages are supported?

Currently supported:
- **JavaScript** (full support)
- **TypeScript** (full support)
- **Python** (full support)

**Planned**: Java, Go, Rust, C#

### Is this system safe for production use?

Yes! The system includes multiple safety mechanisms:
- **Human approval required** for all changes
- **≤300 LOC limit** per Fix Pack
- **Automatic rollback** capability
- **Quality gates** prevent regressions
- **Read-only mode** for assessment
- **Comprehensive backup** system

## Getting Started

### How do I know if the system is working?

Run these quick checks:
```bash
npm run status          # Should show all systems operational
npm run assess          # Should complete within 12 minutes
npm run validate        # Should pass all checks
npm test               # Should pass with ≥80% coverage
```

### What if I have an existing test suite?

The system enhances your existing tests rather than replacing them:
- **Preserves existing tests** and configurations
- **Adds TDD enforcement** for new code
- **Improves coverage** incrementally
- **Maintains compatibility** with your test frameworks

### Can I use this with my existing CI/CD pipeline?

Absolutely! The system integrates with your existing pipeline:
- **Enhances** existing GitHub Actions/GitLab CI
- **Adds quality gates** without breaking workflows
- **Provides auto-recovery** for pipeline failures
- **Works alongside** existing tools

### How long does initial setup take?

- **New project**: 5-10 minutes
- **Existing project**: 10-30 minutes (depending on size)
- **Quick evaluation**: 5 minutes

## Agent System

### What do the 20 agents do?

**Core Agents (Always Active):**
- **AUDITOR**: Finds code quality issues, creates Linear tasks
- **EXECUTOR**: Implements fixes using strict TDD (≤300 LOC)
- **GUARDIAN**: Monitors CI/CD, provides auto-recovery
- **STRATEGIST**: Orchestrates workflows, manages Linear integration
- **SCHOLAR**: Learns patterns, optimizes system performance

**Specialized Agents (Context-Activated):**
- **Testing**: TESTER, VALIDATOR
- **Quality**: ANALYZER, OPTIMIZER, CLEANER, REVIEWER
- **Infrastructure**: DEPLOYER, MONITOR, MIGRATOR
- **Architecture**: ARCHITECT, REFACTORER, RESEARCHER
- **Security**: SECURITYGUARD
- **Documentation**: DOCUMENTER
- **Integration**: INTEGRATOR

### How do I know which agent to use?

Most operations are handled automatically, but for manual invocation:

```bash
# Code quality issues
npm run agent:invoke AUDITOR:assess-code

# Implement specific fix
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123

# Pipeline problems
npm run agent:invoke GUARDIAN:check-pipelines

# Workflow coordination
npm run agent:invoke STRATEGIST:plan-sprint

# System optimization
npm run agent:invoke SCHOLAR:optimize-performance
```

### Can agents make changes without my approval?

**No.** By default, all agents require human approval:
- **AUDITOR**: Only creates assessment reports and Linear tasks
- **EXECUTOR**: Requires explicit approval to implement fixes
- **GUARDIAN**: Can monitor and alert, but changes require approval
- **All agents**: Operate in development/staging only (no production access)

### How do I disable a problematic agent?

```bash
# Disable specific agent
npm run agent:disable -- --agent SECURITYGUARD

# Re-enable agent
npm run agent:enable -- --agent SECURITYGUARD

# Check agent status
npm run agents:status
```

## TDD Workflow

### What exactly is enforced by TDD?

Every code change must follow the **RED→GREEN→REFACTOR** cycle:
1. **RED**: Write a failing test first
2. **GREEN**: Write minimal code to pass the test
3. **REFACTOR**: Improve code while keeping tests green

### What if I need to make a quick hotfix?

For emergencies, you can temporarily bypass TDD enforcement:
```bash
# Emergency mode (use sparingly)
export CLAUDE_TDD_ENFORCEMENT=false
# Make your changes
# Re-enable immediately after
export CLAUDE_TDD_ENFORCEMENT=true
```

**Important**: Emergency bypasses are logged and must be justified.

### How strict are the coverage requirements?

Default requirements:
- **80% minimum** for all code
- **95% for critical paths** (payment, security, core business logic)
- **80% diff coverage** for new changes

You can adjust these in configuration if needed.

### Can I exclude files from TDD enforcement?

Yes, configure exemptions in `.claude/settings.json`:
```json
{
  "tdd": {
    "exemptions": {
      "file_patterns": [
        "**/*.config.{js,ts}",
        "**/scripts/**",
        "**/docs/**"
      ],
      "directories": [
        "vendor/",
        "third-party/"
      ]
    }
  }
}
```

## Quality Gates

### Why are my commits being blocked?

Quality gates enforce minimum standards:
- **Test coverage** below 80%
- **Linting errors** present
- **TypeScript errors** present
- **TDD cycle** not followed
- **Security vulnerabilities** detected

Fix with:
```bash
npm run precommit      # Runs all quality checks
npm run lint           # Fix linting issues
npm test -- --coverage # Check coverage
npm run typecheck      # Fix TypeScript issues
```

### Can I temporarily lower quality thresholds?

For legacy projects, you can start with lower thresholds and increase over time:
```json
{
  "quality_gates": {
    "coverage": {
      "thresholds": {
        "global": {
          "lines": 60  // Start lower, increase gradually
        }
      }
    }
  }
}
```

### What is mutation testing and why is it required?

Mutation testing validates test quality by introducing small code changes ("mutations") and checking if tests catch them. A 30% mutation score means your tests catch 30% of introduced bugs.

**Benefits:**
- **Validates test effectiveness**
- **Finds weak tests**
- **Improves overall quality**

**Disable if needed:**
```json
{
  "quality_gates": {
    "mutation_testing": {
      "enabled": false
    }
  }
}
```

## Linear Integration

### Do I need Linear to use this system?

**No.** Linear integration is optional but recommended:
- **Without Linear**: Assessment results shown in console/files
- **With Linear**: Automatic task creation, progress tracking, sprint planning

### How do I set up Linear integration?

1. **Get Linear API key**: Linear Settings → API → Personal API Keys
2. **Find team ID**: Your team URL slug
3. **Configure environment**:
   ```bash
   export CLAUDE_LINEAR_API_KEY=your_api_key
   export CLAUDE_LINEAR_TEAM_ID=your_team_id
   ```
4. **Test connection**:
   ```bash
   npm run linear:test-connection
   ```

### Why aren't tasks being created in Linear?

Common issues:
1. **API key invalid**: `npm run linear:validate-credentials`
2. **Wrong team ID**: Check team URL slug
3. **Permission issues**: Ensure API key has write permissions
4. **Auto-creation disabled**: Check `auto_create_tasks: true` in config

### Can I customize how tasks are created?

Yes, configure task creation in `.claude/settings.json`:
```json
{
  "linear": {
    "task_configuration": {
      "prefixes": {
        "quality": "CLEAN",
        "security": "SEC"
      },
      "priority_mapping": {
        "critical": 1,
        "high": 2
      },
      "default_labels": ["automated", "claude"]
    }
  }
}
```

## Performance

### Why are assessments taking so long?

For large codebases (>150k LOC), assessments might exceed the 12-minute SLA:

**Optimizations:**
```bash
# Run incremental assessment
npm run assess -- --scope incremental

# Exclude large directories
npm run assess -- --exclude "node_modules,dist,build"

# Reduce concurrency for memory-constrained systems
export CLAUDE_MAX_CONCURRENT_AGENTS=2
```

### Why is the system using so much memory?

Large codebases require more memory:

**Solutions:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Reduce concurrent operations
export CLAUDE_MCP_OPERATION_LIMIT=1

# Enable memory optimization
npm run config:set performance.memory_optimization true
```

### How can I improve system performance?

**Performance tuning:**
1. **Adjust concurrency**: Lower concurrent agents for slower systems
2. **Exclude unnecessary files**: Update ignore patterns
3. **Optimize cache**: Clear caches regularly with `npm run cache:clear`
4. **Monitor resources**: Use `npm run monitor:resources`

## Configuration

### Where are configuration files located?

```
.claude/
├── settings.json              # Main configuration
├── settings.local.json        # Local overrides (gitignored)
├── agents/                    # Agent-specific configuration
│   ├── auditor.json
│   └── ...
└── quality-gates/             # Quality gate configuration
    ├── coverage.json
    └── ...
```

### How do I override configuration locally?

Create `.claude/settings.local.json` for local overrides:
```json
{
  "quality_gates": {
    "coverage": {
      "thresholds": {
        "global": {
          "lines": 70
        }
      }
    }
  }
}
```

This file is gitignored and won't affect other team members.

### Can I have different settings for different environments?

Yes, use environment variables:
```bash
# Development
export CLAUDE_MODE=development
export CLAUDE_COVERAGE_THRESHOLD=70

# Production
export CLAUDE_MODE=production
export CLAUDE_COVERAGE_THRESHOLD=90
```

## Troubleshooting

### The system isn't working at all. What should I do?

**Emergency diagnostic procedure:**
```bash
# 1. Check system status
npm run doctor

# 2. Validate configuration
npm run validate

# 3. Check logs for errors
npm run logs:view

# 4. Reset if necessary
npm run reset

# 5. Re-initialize
npm run setup
```

### How do I get detailed error information?

**Enable debug logging:**
```bash
export CLAUDE_LOG_LEVEL=debug
npm run status
npm run logs:view -- --level debug
```

### Tests are failing but they work locally. Why?

**Common causes:**
1. **Environment differences**: Node.js version, dependencies
2. **Timing issues**: Increase test timeouts
3. **Resource constraints**: CI environment has less memory/CPU
4. **File system differences**: Path separators, case sensitivity

**Debug steps:**
```bash
# Compare environments
npm run diagnose:environment

# Run tests with verbose output
npm test -- --verbose

# Check for flaky tests
npm run test:flaky-detection
```

### How do I completely remove the system?

**Complete removal:**
```bash
# Remove all system files
rm -rf .claude/

# Remove from package.json
npm uninstall <claude-packages>

# Remove environment variables
unset CLAUDE_LINEAR_API_KEY
unset CLAUDE_LINEAR_TEAM_ID

# Remove git hooks (if installed)
rm -rf .git/hooks/pre-commit
```

## Advanced Usage

### Can I create custom agents?

**Yes!** The system supports custom agent development:
```bash
# Create new agent
npm run agent:create -- --name CustomAgent --template specialized

# Test agent
npm run agent:test -- --agent CustomAgent

# Deploy agent
npm run agent:deploy -- --agent CustomAgent
```

See the [User Guide](USER-GUIDE.md) for detailed custom agent development instructions.

### How do I extend the system for new languages?

**Language extension process:**
1. **Define language configuration** in `.claude/languages/`
2. **Create tool configurations** (linter, formatter, test framework)
3. **Add agent extensions** for language-specific operations
4. **Test thoroughly** with sample projects

### Can I integrate with tools other than Linear?

**Current integrations:**
- **Linear**: Full task management integration
- **GitHub Actions**: CI/CD integration
- **GitLab CI**: CI/CD integration

**Planned integrations:**
- **Jira**: Task management
- **Azure DevOps**: CI/CD and task management
- **Jenkins**: CI/CD integration

### How do I contribute to the system?

**Contribution areas:**
1. **Custom agents** for specific use cases
2. **Language support** for new programming languages
3. **Tool integrations** for additional services
4. **Documentation improvements**
5. **Bug reports and feature requests**

### What's the roadmap for new features?

**Upcoming features:**
- **AI pair programming** mode
- **Predictive testing** based on code changes
- **Auto-refactoring** for architectural improvements
- **Multi-repository** coordination
- **Advanced security** scanning with auto-remediation

---

## Still Have Questions?

### Quick Help Commands
```bash
npm run help                    # General help
npm run doctor                  # System diagnostics
npm run agent:invoke AGENT:help # Agent-specific help
```

### Documentation Resources
- **[User Guide](USER-GUIDE.md)** - Complete system overview
- **[Troubleshooting](TROUBLESHOOTING.md)** - Problem resolution
- **[Configuration](CONFIGURATION.md)** - System setup and customization
- **[Commands Reference](COMMANDS.md)** - Complete CLI documentation

### Getting Support
1. **Run diagnostics**: `npm run doctor`
2. **Check troubleshooting guide**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. **Search existing issues**: Check GitHub issues/team knowledge base
4. **Collect diagnostic info**: `npm run diagnose:full-report`
5. **Create detailed issue**: Include system info, error messages, steps to reproduce

**The Claude Agentic Workflow System is designed to be self-healing and helpful. Most issues can be resolved with built-in diagnostic and recovery tools! 🚀**