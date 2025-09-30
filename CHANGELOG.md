# Changelog

All notable changes to the Linear TDD Workflow System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **DOC-KEEPER Agent**: 23rd agent for comprehensive documentation management
  - Documentation validation (links, code examples, cross-references)
  - Content generation (API docs, tutorials, changelogs)
  - Quality assurance (formatting, completeness, accuracy)
  - Knowledge organization (search, index, cross-reference)
  - Automated fixes for common documentation issues
- **`/docs` Slash Command**: Full documentation operations
  - validate, generate, audit, update, coverage, fix, search operations
  - Integration with Linear for DOC-* task creation
  - CI/CD ready with GitHub Actions workflow
- **Documentation Validation Scripts**: Automated quality checking
  - `scripts/validate-docs.sh` - Link, example, and xref validation
  - `scripts/generate-api-docs.js` - Auto-generate API reference from agent YAML
  - GitHub Actions workflow for continuous validation
- **npm Scripts**: Documentation workflow commands
  - `npm run docs:validate` - Full documentation validation
  - `npm run docs:generate-api` - Generate API documentation
  - `npm run docs:audit` - Comprehensive documentation audit

### Changed
- **Agent Count**: Increased from 22 to 23 specialized agents
- **Documentation Coverage**: Now targeting 95%+ with automated tracking
- **README.md**: Updated agent count and capabilities
- **CLAUDE.md**: Added `/docs` command and DOC-KEEPER references
- **.claude/README.md**: Updated to reflect 23 agents
- **.claude/DISCOVERY.md**: Added documentation validation workflow

## [1.3.0] - 2024-11-27

### Added
- **20 Specialized Agents**: Expanded from 5 to 20 comprehensive agents with specific roles
  - Core agents: AUDITOR, EXECUTOR, GUARDIAN, STRATEGIST, SCHOLAR
  - Testing agents: VALIDATOR, TESTER, REVIEWER
  - Development agents: OPTIMIZER, REFACTORER, CLEANER
  - Infrastructure agents: DEPLOYER, MONITOR, MIGRATOR
  - Architecture agents: ARCHITECT, RESEARCHER, DOCUMENTER
  - Security/Integration agents: SECURITYGUARD, INTEGRATOR, ANALYZER
- **Agent Invocation CLI**: New standardized CLI tool for invoking agents (via npm scripts)
- **Enhanced Agent Definitions**: Each agent now has 8-9 specific commands with full documentation
- **Enhanced Prompt Generation**: Agent-specific prompts with validation and scoring
- **Comprehensive Agent Documentation**: Complete specifications for all 20 agents
- **Python Language Support**: Full support for Python across all agents
  - pytest for testing
  - Black/Ruff for formatting and linting
  - mypy for type checking
  - coverage.py for coverage analysis
- **MCP Server Specialization**: Agents assigned to appropriate MCP servers
  - linear-server for task management
  - playwright for testing
  - sequential-thinking for complex reasoning
  - context7 for documentation and research
  - kubernetes for deployment
  - timeserver for monitoring
- **Comprehensive Command System**: Over 180 agent commands documented
- **Agent Documentation**: Complete agent catalog in `.claude/agents/`

### Changed
- **README.md**: Updated to reflect 20-agent system with invocation examples
- **Agent Architecture**: Expanded from monolithic to specialized agent system
- **Language Support**: All agents now support both JavaScript/TypeScript and Python
- **Command Structure**: Standardized command format `AGENT:COMMAND`
- **Documentation Structure**: Reorganized agent docs into `.claude/agents/`

### Enhanced
- **Test Coverage**: Agents now enforce language-specific testing frameworks
- **Code Quality**: Language-specific linting and formatting tools
- **Pattern Learning**: SCHOLAR agent enhanced with pattern extraction algorithms
- **Security Scanning**: SECURITYGUARD with comprehensive vulnerability detection
- **Performance Optimization**: OPTIMIZER with profiling and benchmarking

## [1.2.0] - 2024-11-27

### Added
- Complete PRD alignment in README.md
- CLAUDE.md agent workflow specifications
- .claude directory structure with agent specifications
- GitHub Actions workflows for CI/CD automation
- MCP (Model Context Protocol) integration
- Fix Pack specifications and constraints
- FIL (Feature Impact Level) classification system

### Changed
- Enhanced README.md with SMART requirements
- Updated package.json with comprehensive scripts
- Improved agent documentation structure

### Security
- Added security scanning workflows
- Implemented RBAC permission matrix
- Added audit trail requirements

## [1.1.0] - 2024-11-20

### Added
- Multi-agent architecture (AUDITOR, EXECUTOR, GUARDIAN, STRATEGIST, SCHOLAR)
- Linear.app integration for task management
- TDD enforcement with red-green-refactor cycle
- Pipeline monitoring and auto-recovery

### Changed
- Improved test coverage requirements (≥80% diff coverage)
- Enhanced mutation testing (≥30% threshold)

## [1.0.0] - 2024-11-15

### Added
- Initial project structure with TDD workflow
- Basic Jest testing framework setup
- TypeScript configuration
- ESLint and Prettier setup
- GitFlow initialization
- Environment configuration system

### Security
- Secret management via environment variables
- No hardcoded credentials policy

## [0.1.0] - 2024-11-01

### Added
- Initial project scaffolding
- Basic documentation structure
- Linear.app connectivity testing
- Core agent concept documentation

---

## Migration Guides

### Migrating from 1.2.x to 1.3.0

1. **Update agent invocation**: Use the new CLI tool for agent commands:
   ```bash
   # Old way
   npm run assess

   # New way
   npm run agent:invoke AUDITOR:assess-code -- --scope full
   ```

2. **Python support**: Ensure Python tooling is installed if working with Python code:
   ```bash
   pip install black ruff mypy pytest coverage
   ```

3. **New agent commands**: Familiarize yourself with the expanded agent commands:
   - Each agent now has 8-9 specific commands
   - Use `npm run agent:invoke --help` for command list
   - See `.claude/agents/CLAUDE.md` for complete documentation

4. **MCP server configuration**: Update `.claude/mcp.json` if customizing MCP servers

### Migrating from 1.1.x to 1.2.0

1. **Update file references**: All documentation files have been renamed to use kebab-case. Update any links or references in your code:
   ```diff
   - docs/AI Coding Assistant Development Protocol.md
   + docs/ai-development-protocol.md
   ```

2. **Update package.json scripts**: New scripts have been added for agent operations:
   ```bash
   npm run agents:init    # Initialize agents
   npm run pattern:extract # Extract patterns
   npm run fil:classify   # Classify changes
   ```

3. **New environment variables**: Add these to your `.env` file:
   ```bash
   MAX_FIX_PACK_SIZE=300
   MIN_DIFF_COVERAGE=80
   MIN_MUTATION_SCORE=30
   ```

### Migrating from 1.0.x to 1.1.0

1. **Enable multi-agent system**: Configure agent roles in `.claude/settings.json`

2. **Set up Linear integration**: Add Linear API credentials to `.env`:
   ```bash
   LINEAR_API_KEY=your_key
   LINEAR_TEAM_ID=your_team
   LINEAR_PROJECT_ID=your_project
   ```

3. **Update CI/CD**: Add new GitHub Actions workflows from `.github/workflows/`

---

## Version Support

| Version | Status | End of Support |
|---------|--------|----------------|
| 1.3.x | Current | Active |
| 1.2.x | Maintenance | 2025-04-01 |
| 1.1.x | Maintenance | 2025-03-01 |
| 1.0.x | EOL | 2024-12-31 |
| 0.x.x | Deprecated | 2024-11-15 |

---

## Release Schedule

- **Major releases** (x.0.0): Annually in Q1
- **Minor releases** (1.x.0): Quarterly
- **Patch releases** (1.2.x): As needed for critical fixes

---

[Unreleased]: https://github.com/your-org/linear-tdd-workflow/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/your-org/linear-tdd-workflow/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/your-org/linear-tdd-workflow/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/your-org/linear-tdd-workflow/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/your-org/linear-tdd-workflow/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/your-org/linear-tdd-workflow/releases/tag/v0.1.0