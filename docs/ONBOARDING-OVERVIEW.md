# Claude Agentic Workflow System - Onboarding Overview

The Claude Agentic Workflow System is a production-ready, autonomous code quality management system that enforces strict Test-Driven Development while providing 20 specialized AI agents for comprehensive codebase maintenance.

## 🎯 Choose Your Onboarding Path

### 🆕 [New Project](ONBOARDING-NEW-PROJECT.md)

**Best for**: Starting a fresh project from scratch

- **Time**: 5-10 minutes
- **Effort**: Minimal
- **Impact**: Full system integration from day one
- **Perfect for**: Greenfield projects, prototypes, new teams

```bash
mkdir my-project && cd my-project
node .claude/setup.js
```

### 🔧 [Existing Project](ONBOARDING-EXISTING-PROJECT.md)

**Best for**: Integrating into established codebases

- **Time**: 10-30 minutes
- **Effort**: Moderate (requires review)
- **Impact**: Gradual enhancement without disruption
- **Perfect for**: Production systems, legacy code, large teams

```bash
cd existing-project
node .claude/setup.js
```

### ⚡ [Quick Start](ONBOARDING-QUICKSTART.md)

**Best for**: Immediate evaluation or demo

- **Time**: 5 minutes
- **Effort**: Minimal
- **Impact**: Core functionality only
- **Perfect for**: Evaluation, demos, proof of concept

```bash
# One-liner setup
curl -sSL https://get-claude-workflow.sh | bash
```

## 🚀 What You Get

### Core Features (All Paths)

- **TDD Enforcement**: Mandatory RED→GREEN→REFACTOR cycle
- **20 AI Agents**: Specialized autonomous quality management
- **Universal Commands**: Consistent interface across all project types
- **Quality Gates**: 80% coverage, mutation testing, comprehensive linting
- **Multi-Language Support**: JavaScript, TypeScript, Python with plans for more

### Advanced Features

- **Linear Integration**: Automatic task management and issue tracking
- **CI/CD Templates**: Ready-to-use GitHub Actions, GitLab CI configurations
- **Performance Monitoring**: Real-time metrics and SLA tracking
- **Concurrency Management**: Evidence-based multi-agent orchestration
- **Security Scanning**: Automated vulnerability detection and remediation

## 📊 System Architecture

```
Project Root
├── .claude/                    # Self-contained workflow system
│   ├── agents/                # 20 specialized agents
│   │   ├── auditor.md         # Code quality assessment
│   │   ├── executor.md        # Fix implementation
│   │   ├── guardian.md        # CI/CD protection
│   │   └── ...                # 17 more specialized agents
│   ├── cli.js                 # Universal CLI interface
│   ├── setup.js               # Automated setup/enhancement
│   ├── templates/             # Project templates
│   └── scripts/               # Operational automation
├── Makefile                    # Universal commands
├── CLAUDE.md                   # Claude Code instructions
└── Your Project Files...       # Existing/new source code
```

## 🎯 Agent System Overview

### Core Agents (Always Active)

- **AUDITOR**: Code quality assessment and issue detection
- **EXECUTOR**: Fix implementation with strict TDD enforcement
- **GUARDIAN**: CI/CD pipeline protection and recovery
- **STRATEGIST**: Workflow orchestration and resource management
- **SCHOLAR**: Pattern recognition and continuous learning

### Specialized Agents (Context-Activated)

- **Testing**: TESTER, VALIDATOR
- **Quality**: ANALYZER, OPTIMIZER, CLEANER, REVIEWER
- **Infrastructure**: DEPLOYER, MONITOR, MIGRATOR
- **Architecture**: ARCHITECT, REFACTORER, RESEARCHER
- **Security**: SECURITYGUARD
- **Documentation**: DOCUMENTER
- **Integration**: INTEGRATOR

## 📋 Prerequisites

### Required (All Paths)

- **Node.js** ≥18.0.0
- **Git** for version control
- **Text Editor** or IDE

### Optional (Language-Specific)

- **Python** ≥3.8 (for Python projects)
- **Docker** (for containerized projects)
- **Make** (automatically detected, fallbacks available)

### Recommended

- **Linear Account** (for task management integration)
- **GitHub/GitLab** (for CI/CD templates)
- **Anthropic API Key** (for advanced agent features)

## 🎯 Onboarding Decision Matrix

| Scenario                 | Recommended Path                                   | Setup Time | Integration Level |
| ------------------------ | -------------------------------------------------- | ---------- | ----------------- |
| **New startup project**  | [New Project](ONBOARDING-NEW-PROJECT.md)           | 5 min      | Complete          |
| **Open source project**  | [New Project](ONBOARDING-NEW-PROJECT.md)           | 5 min      | Complete          |
| **Corporate greenfield** | [New Project](ONBOARDING-NEW-PROJECT.md)           | 10 min     | Complete          |
| **Production system**    | [Existing Project](ONBOARDING-EXISTING-PROJECT.md) | 20 min     | Gradual           |
| **Legacy codebase**      | [Existing Project](ONBOARDING-EXISTING-PROJECT.md) | 30 min     | Incremental       |
| **Quick evaluation**     | [Quick Start](ONBOARDING-QUICKSTART.md)            | 5 min      | Demo              |
| **Team demo**            | [Quick Start](ONBOARDING-QUICKSTART.md)            | 5 min      | Demo              |

## 🔄 Migration Strategies

### For Existing Projects

#### Conservative (Recommended)

1. **Week 1**: Assessment only, no enforcement
2. **Week 2-4**: TDD for new features only
3. **Month 2**: Gradual legacy code improvement
4. **Month 3+**: Full system adoption

#### Aggressive (Advanced Teams)

1. **Day 1**: Full TDD enforcement for new code
2. **Week 1**: Legacy code assessment and planning
3. **Week 2-4**: Rapid legacy improvement
4. **Month 2**: Full system adoption

#### Ultra-Conservative (Large Enterprises)

1. **Month 1**: Parallel system (no changes to existing workflow)
2. **Month 2**: Optional TDD for volunteers
3. **Month 3-6**: Gradual team adoption
4. **Month 6+**: Organization-wide rollout

## 🎭 Agent Behavior Modes

### Development Mode (Default)

- Human oversight required for all changes
- Agents create detailed recommendations
- Manual approval needed for implementations
- Full audit trail maintained

### CI/CD Mode

- Automated quality gates
- Agents can block problematic changes
- Automatic assessment and reporting
- Integration with existing CI systems

### Production Mode (Advanced)

- Agents can auto-fix certain issue categories
- Immediate rollback capabilities
- Enhanced monitoring and alerting
- Strict change management integration

## 📊 Success Metrics

Track these metrics during onboarding:

### Technical Metrics

- **Test Coverage**: Target ≥80% diff coverage
- **Mutation Score**: Target ≥30% for critical paths
- **Code Quality**: Complexity, duplication, maintainability
- **Security**: Vulnerability count and resolution time

### Process Metrics

- **TDD Adoption**: Percentage of changes following TDD
- **Agent Utilization**: Usage statistics per agent
- **Fix Pack Velocity**: Average implementation time
- **Pipeline Health**: Success rate and recovery time

### Team Metrics

- **Developer Satisfaction**: Survey scores
- **Training Completion**: Onboarding success rate
- **Knowledge Sharing**: Cross-team agent usage
- **Productivity**: Feature delivery velocity

## 🛡️ Safety and Rollback

### Automatic Backups

- **Configuration files** backed up before modification
- **Git stash** created for uncommitted changes
- **Agent logs** maintained for audit trail
- **Rollback scripts** generated during setup

### Rollback Options

```bash
# Quick rollback (emergency)
make rollback-emergency

# Gradual rollback (planned)
make rollback-gradual

# Selective rollback (specific features)
make rollback-agents
make rollback-tdd
make rollback-config
```

### Safety Features

- **Read-only mode** for initial assessment
- **Staged rollout** with per-feature toggles
- **Human approval gates** for critical changes
- **Automatic conflict detection** and resolution

## 🎯 Next Steps

After choosing your onboarding path:

1. **Complete Setup**: Follow your chosen guide
2. **Verify Installation**: Run validation commands
3. **Configure Integration**: Set up Linear, CI/CD
4. **Train Team**: Share documentation and best practices
5. **Monitor Adoption**: Track metrics and gather feedback
6. **Iterate and Improve**: Refine configuration based on usage

## 📚 Additional Resources

### Documentation

- **Complete Agent Reference**: [.claude/agents/CLAUDE.md](.claude/agents/CLAUDE.md)
- **CLI Reference**: Run `node .claude/cli.js --help`
- **Troubleshooting**: Use `make doctor` for automated diagnosis

### Support Channels

- **GitHub Issues**: Report bugs and feature requests
- **Team Chat**: Internal support for teams
- **Documentation Wiki**: Community-maintained guides
- **Video Tutorials**: Step-by-step walkthroughs

### Community

- **Best Practices**: Shared team configurations
- **Use Cases**: Real-world implementation stories
- **Extensions**: Custom agents and integrations
- **Contributing**: How to improve the system

## 🎉 Welcome to Autonomous Code Quality

The Claude Agentic Workflow System represents the future of software development—where AI agents work alongside developers to maintain the highest quality standards while enforcing best practices like TDD.

**Choose your path and start your journey to autonomous code quality management!**

---

**Ready to begin?** Pick your onboarding path:

- **[New Project](ONBOARDING-NEW-PROJECT.md)** - Start fresh with complete integration
- **[Existing Project](ONBOARDING-EXISTING-PROJECT.md)** - Enhance your current codebase
- **[Quick Start](ONBOARDING-QUICKSTART.md)** - Immediate evaluation and demo
