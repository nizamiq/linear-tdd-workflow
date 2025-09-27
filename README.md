# Linear TDD Workflow System

## Agentic AI Coding Agent - Autonomous Clean Code Development with Test-Driven Excellence

[![TDD Compliant](https://img.shields.io/badge/TDD-Strict-brightgreen.svg)](docs/AI%20Coding%20Assistant%20Development%20Protocol.md)
[![Linear Integrated](https://img.shields.io/badge/Linear-Connected-blue.svg)](docs/Linear%20Setup.md)
[![Clean Code](https://img.shields.io/badge/Clean%20Code-Enforced-green.svg)](docs/Clean%20code%20AI%20(Linear).md)
[![GitFlow](https://img.shields.io/badge/GitFlow-Enabled-orange.svg)](docs/gitflow.md)
[![MCP Enabled](https://img.shields.io/badge/MCP-Integrated-purple.svg)](https://modelcontextprotocol.org)
[![Pipeline Status](https://img.shields.io/badge/Pipeline-99.5%25-success.svg)](https://github.com)

## 🎯 Overview

The Linear TDD Workflow System is an enterprise-grade multi-agent AI development framework that autonomously manages code quality through continuous assessment, prioritized execution, and rigorous validation. This system reduces engineering time on maintenance by 40%, achieves 50% faster MTTR, and delivers 30-35% improvement in PR cycle time.

### Problem Statement
Engineering teams spend ~40% of their development time on code maintenance, refactoring, and technical debt management. Inconsistent code quality standards across teams lead to increased defects and slower delivery.

### Solution Value
- **Mean Time to Recovery (MTTR)**: ↓ 50%
- **PR Cycle Time**: ↓ 30-35%
- **Test Coverage on Touched Code**: ↑ 20+ percentage points
- **Technical Debt Reduction**: Monthly reduction of hotspots

## 📊 Business Requirements (SMART)

### FR-01: Continuous Assessment
- **Specific**: Analyze repositories for architecture, readability, performance, security, testing, and documentation issues
- **Measurable**: ≥80% actionable items with file/line specificity, ≤10% false-positive rate
- **Achievable**: AST/CFG analysis, complexity metrics, dependency graphs
- **Relevant**: Prioritized Linear backlog with severity and effort estimates
- **Timely**: JS/TS ≤12min p95, Python ≤15min p95 (150k LOC, 4-core)

### FR-02: Automated Fix Implementation (Fix Packs)
- **Specific**: Implement XS/S improvements autonomously with atomic commits
- **Measurable**: ≥8 accepted Fix Pack PRs/day, ≤0.3% rollback rate (7-day)
- **Achievable**: TDD cycle enforcement, diff coverage ≥80%, mutation smoke ≥30%
- **Relevant**: Each fix includes documentation and rollback plan
- **Timely**: Average XS/S task ≤15min p50 compute time

### FR-03: TDD Enforcement
- **Specific**: Every agent PR follows red-green-refactor cycle
- **Measurable**: Diff coverage ≥80%, mutation threshold ≥30% on changed files
- **Achievable**: CI blocks non-compliant PRs, enforces [RED]→[GREEN]→[REFACTOR]
- **Relevant**: Green pipeline ≥95% uptime
- **Timely**: GUARDIAN restores broken pipeline ≤10min p95

## 🚀 Fix Pack Specifications

### Approved Fix Pack Tasks
Fix Packs are pre-approved, low-risk improvements that agents can implement autonomously:

1. **Linting & Formatting**: Auto-fix ESLint/Prettier violations
2. **Dead Code Removal**: Remove unused variables, functions, imports
3. **Documentation**: Add/update JSDoc, Python docstrings, README sections
4. **Small Pure Refactors**: Extract constants, simplify conditionals, rename variables
5. **Dependency Updates**: Non-breaking minor/patch bumps with passing tests
6. **Logging Normalization**: Standardize log formats and levels
7. **Test Scaffolds**: Add missing test files with basic structure

### Fix Pack Constraints
- Maximum 300 LOC per PR
- Diff coverage ≥80% required
- Mutation testing ≥30% on changed files
- Full rollback plan required
- No breaking changes allowed
- Human approval required for merge

## 🔒 Feature Impact Level (FIL) Classification

| Level | Description | Examples | Approval Required |
|-------|-------------|----------|-------------------|
| **FIL-0** | Chore/maintenance | Formatting, dead code removal | None |
| **FIL-1** | Low-risk refactor | Variable rename, extract constant | None |
| **FIL-2** | Medium impact | New utility functions, config changes | Tech Lead |
| **FIL-3** | High impact/feature | New APIs, DB migrations, UI routes | Tech Lead + Product Owner |

**Policy**: 100% of FIL-2/FIL-3 changes require `FEAT-APPROVED` label before implementation.

## 🏗️ Multi-Agent Architecture

### Five Specialized Agents

#### 1. AUDITOR - Code Quality Assessment
- **Purpose**: Continuous code quality scanning and issue identification
- **Tools**: `code_search`, `analyze_complexity`, `detect_patterns`, `create_linear_task`
- **SLA**: First scan ≤12min p95 (JS/TS), ≤15min p95 (Python)
- **Success Metrics**: ≥80% actionable items, ≤10% false positives

#### 2. EXECUTOR - Implementation Engine
- **Purpose**: Implement approved improvements with full test coverage
- **Tools**: `code_patch`, `run_tests`, `commit_changes`, `create_pr`
- **Constraints**: Fix Packs only, ≤300 LOC, diff coverage ≥80%
- **Success Metrics**: ≥8 accepted PRs/day, ≤0.3% rollback rate

#### 3. GUARDIAN - Pipeline SRE
- **Purpose**: Monitor and auto-recover CI/CD pipeline failures
- **Tools**: `analyze_failure`, `generate_fix`, `run_local_tests`, `trigger_pipeline`
- **SLA**: Detection ≤5min, recovery ≤10min p95
- **Success Metrics**: Pipeline uptime ≥95%, auto-fix success ≥90%

#### 4. STRATEGIST - Orchestrator
- **Purpose**: Coordinate multi-agent activities and optimize resource allocation
- **Tools**: `assign_task`, `update_linear`, `coordinate_agents`, `generate_report`
- **Performance**: Resource utilization ≥75%, context switches ≤3/agent/day
- **Success Metrics**: On-time delivery ≥90%, orchestration overhead ≤5%

#### 5. SCHOLAR - Learning Engine
- **Purpose**: Extract patterns from successful fixes and improve system efficiency
- **Tools**: `extract_patterns`, `update_knowledge_base`, `train_agents`, `generate_insights`
- **Targets**: ≥2 validated patterns/month, ≥25% pattern reuse by Phase 3
- **Success Metrics**: Efficiency gains ≥10% month-over-month

## 🔧 Technical Specifications

### Performance SLAs

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Code Assessment (150k LOC) | ≤12min p95 | JS/TS repositories |
| Code Assessment (150k LOC) | ≤15min p95 | Python repositories |
| Incremental Scan | ≤3min p95 | Changed files only |
| XS/S Task Execution | ≤15min p50 | Compute time only |
| Pipeline Recovery | ≤10min p95 | Detection to green |
| Linear Sync | ≤2s p95 | Update latency |
| Control API | ≤300ms median | Response time |
| Feature Classification | ≤2s p95 | FIL determination |

### Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| **Availability** | 99.0% beta, 99.5% GA | Monthly uptime |
| **Cost per Fix** | ≤$3 median, ≤$5 p95 | Per accepted PR |
| **Repository Limit** | 3 concurrent (v1) | Up to 200k LOC each |
| **Observability** | 100% instrumented | OpenTelemetry traces |
| **Audit Retention** | 90 days | Immutable event log |
| **Security** | Zero critical vulns | Continuous scanning |

## 🛡️ RBAC & Multi-Tenancy

### Permission Matrix

| Role | Repository Scope | Can Read | Can Write | Can Merge | Can Admin |
|------|-----------------|----------|-----------|-----------|-----------|
| **Admin** | Organization | ✓ | ✓ | ✓ | ✓ |
| **Developer** | Repository | ✓ | PR only | ✓ | - |
| **Agent** | Repository | ✓ | PR only | - | - |
| **Viewer** | Repository | ✓ | - | - | - |

### Tenant Isolation
- Repository-scoped data isolation
- Linear workspace-level separation
- GitHub team-based permissions inherited
- Complete audit trail per tenant

## 📋 TDD Policy & Gates

### Red-Green-Refactor Enforcement
Every change must progress through:
1. **[RED]**: Write failing test first
2. **[GREEN]**: Minimal code to pass test
3. **[REFACTOR]**: Improve with test safety

### Quality Gates
- **Diff Coverage**: ≥80% on changed lines
- **Mutation Testing**: ≥30% on changed files (StrykerJS/mutmut)
- **Test Reference**: At least one test must reference changed code
- **CI Blocking**: Non-compliant PRs automatically rejected

## 🚦 Development Roadmap

### Phase 0 - Foundation (Weeks 1-4)
- Orchestrator setup
- MCP tool integration
- GitHub/Linear connectors
- Evidence store
- **DoD**: Agents can read code and create Linear tasks

### Phase 1 - Assessment (Weeks 5-8)
- AUDITOR implementation
- JS/TS full rules
- Python core rules
- Incremental scanning
- **DoD**: ≥80% actionable items, SLAs met

### Phase 2 - Execution (Weeks 9-12)
- EXECUTOR with Fix Packs
- GUARDIAN pipeline protection
- TDD enforcement
- **DoD**: ≥8 PRs/day, coverage targets met

### Phase 3 - Orchestration (Weeks 13-16)
- STRATEGIST coordination
- SCHOLAR pattern extraction
- Auto-rebase capability
- **DoD**: ≥25% pattern reuse, ≥80% auto-rebase success

### Phase 4 - Scale (Weeks 17-20)
- Multi-repo support (3)
- Dashboard refinement
- Budget throttles
- **DoD**: Beta SLOs achieved for 30 days

## 🔌 MCP Tool Integration

### Available Tools

| Tool | Purpose | Key Operations | SLA |
|------|---------|----------------|-----|
| **Sequential Thinking** | Complex problem solving | `think()`, `reason()`, `solve()` | <30s |
| **Context7 Search** | Code understanding | `search()`, `analyze()`, `explain()` | <5s |
| **Kubernetes** | Container orchestration | `deploy()`, `scale()`, `monitor()` | <10s |
| **Playwright Test** | E2E test automation | `test()`, `screenshot()`, `trace()` | <60s |
| **Linear Tasks** | Task management | `create()`, `update()`, `transition()` | <2s |

## 📈 Success Metrics & KPIs

### Quality Metrics
- **Code Maintainability**: +25% improvement
- **Test Coverage**: +20pp on touched code
- **Cyclomatic Complexity**: <10 average
- **Security Vulnerabilities**: 0 critical
- **Technical Debt**: -15% monthly

### Operational Metrics
- **Pipeline Uptime**: ≥95%
- **Auto-fix Success**: ≥90%
- **PR Velocity**: ≥8 Fix Pack PRs/day
- **Pattern Reuse**: ≥25% by Phase 3
- **Rollback Rate**: ≤0.3%

### Business Impact
- **Developer Time Saved**: 40% on maintenance
- **MTTR Reduction**: 50%
- **PR Cycle Time**: -30-35%
- **Developer Satisfaction**: ≥4.5/5

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Python 3.10+
- Git with GitFlow extension
- Linear.app account with API access
- GitHub account with appropriate permissions
- Docker for containerized agents

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd linear-tdd-workflow

# Initialize GitFlow
git flow init

# Set up environment
cp .env.example .env
# Configure your Linear API key and other settings

# Install dependencies
npm install

# Run initial setup
npm run setup

# Initialize agent system
npm run agents:init
```

### Configuration

```bash
# Linear.app Configuration
LINEAR_API_KEY=your_api_key
LINEAR_TEAM_ID=your_team_id
LINEAR_PROJECT_ID=your_project_id

# GitHub Configuration
GITHUB_TOKEN=your_github_token
GITHUB_ORG=your_organization

# Agent Configuration
ENABLE_AUTO_FIX=true
ENABLE_TDD_ENFORCEMENT=true
ENABLE_GITFLOW=true
MAX_FIX_PACK_SIZE=300
MIN_DIFF_COVERAGE=80
MIN_MUTATION_SCORE=30

# Resource Limits
MAX_CONCURRENT_REPOS=3
REPO_SIZE_LIMIT=200000
MONTHLY_BUDGET_LIMIT=10000
PER_REPO_BUDGET=2500
```

## 📖 Documentation Index

### Core Protocols
- [AI Development Protocol](docs/AI%20Coding%20Assistant%20Development%20Protocol.md) - Complete methodology
- [PRD](docs/PRD.md) - Product requirements document
- [Coding Rules](docs/coding%20rules.md) - Standards and conventions

### Agent Documentation
- [AUDITOR Specification](.claude/agents/auditor.md)
- [EXECUTOR Specification](.claude/agents/executor.md)
- [GUARDIAN Specification](.claude/agents/guardian.md)
- [STRATEGIST Specification](.claude/agents/strategist.md)
- [SCHOLAR Specification](.claude/agents/scholar.md)

### Workflow Guides
- [Agent Workflow](.claude/docs/AGENT_WORKFLOW.md)
- [MCP Tools Guide](.claude/docs/mcp-tools.md)
- [Agent Permissions](.claude/docs/agent-permissions.md)

### Linear Integration
- [Linear Setup](docs/Linear%20Setup.md)
- [Linear Cycle Planning](docs/Linear%20Cycle%20Planning.md)
- [Linear AI Integration](docs/Linear%20AI.md)

## 🔒 Security & Compliance

### Security Measures
- **Code Access**: Read-only by default, PR-only writes
- **Secret Management**: HashiCorp Vault integration
- **Audit Trail**: Immutable 90-day retention
- **SBOM Generation**: All agent images signed with Cosign
- **Vulnerability Scanning**: CodeQL + Semgrep continuous scanning

### Compliance
- **SLSA**: Supply chain security compliance
- **SOC2**: Audit trail and access controls
- **GDPR**: PII detection and masking
- **ISO 27001**: Security controls alignment

## 🤝 Contributing

### TDD Workflow
1. Create feature branch from `develop`
2. Write failing test first ([RED])
3. Implement minimal code ([GREEN])
4. Refactor with test safety ([REFACTOR])
5. Ensure diff coverage ≥80%
6. Submit PR with full documentation

### PR Requirements
- All CI checks passing
- Test coverage maintained/improved
- Documentation updated
- Linear ticket linked
- FIL classification complete
- Required approvals obtained

## 📞 Support

- **Documentation**: Review [docs index](#documentation-index)
- **Issues**: Submit via Linear.app integration
- **Security**: Report to security@example.com
- **Community**: Join our Slack workspace

## 📄 License

[Specify your license here]

## 🙏 Acknowledgments

Built with Claude Code AI and integrated with Linear.app for maximum development efficiency. Special thanks to the Model Context Protocol community for enabling advanced tool integrations.