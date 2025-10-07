# Onboarding Existing Project - Claude Agentic Workflow System

This guide walks you through integrating the Claude Agentic Workflow System into an existing codebase without disrupting your current development workflow.

## Prerequisites

- **Existing project** with source code
- **Node.js** ≥18.0.0
- **Python** ≥3.8 (if Python code exists)
- **Git** repository (recommended)
- **Backup** of your project (safety first!)

## Quick Start (10 minutes)

```bash
# 1. Clone workflow system (parallel to your project)
cd /path/to/your/projects/parent/directory
git clone https://github.com/your-org/claude-workflow

# 2. Navigate to your existing project
cd your/existing/project

# 3. Backup current state
git stash push -m "Before Claude workflow integration"
# OR create a backup branch
git checkout -b backup-pre-claude

# 4. Install workflow system using smart installer
../claude-workflow/scripts/install.sh

# 5. Review and commit changes
git add .
git commit -m "feat: integrate Claude Agentic Workflow System"
```

## Pre-Integration Assessment

Before starting, assess your existing project:

```bash
# Run project analysis
node .claude/setup.js --analyze-only

# Check compatibility
node .claude/scripts/compatibility-check.js
```

The analysis will show:

- **Languages detected**: JavaScript, TypeScript, Python, etc.
- **Test frameworks**: Jest, Mocha, pytest, etc.
- **Build tools**: npm, yarn, poetry, etc.
- **CI/CD systems**: GitHub Actions, GitLab CI, etc.
- **Potential conflicts**: Configuration files that might need merging

## Step-by-Step Integration

### Step 1: Project Detection and Backup

The setup script automatically detects your project characteristics:

```bash
node .claude/setup.js
```

**Automated Detection:**

- **Project Type**: Existing project (has source files)
- **Languages**: Scans for `.js`, `.ts`, `.py`, etc.
- **Package Managers**: Detects `package.json`, `pyproject.toml`, etc.
- **Test Frameworks**: Identifies Jest, pytest, Mocha, etc.
- **CI/CD**: Finds GitHub Actions, GitLab CI workflows
- **Framework**: React, Express, FastAPI, Django, etc.

**Automatic Backup:**

```
.claude-backup/          # Created automatically
├── package.json.bak     # Original package.json
├── tsconfig.json.bak    # Original TypeScript config
├── .eslintrc.bak        # Original ESLint config
└── pytest.ini.bak      # Original pytest config
```

### Step 2: Configuration Enhancement (Non-Destructive)

The system enhances existing configurations without breaking them:

#### JavaScript/TypeScript Projects

**package.json Enhancement:**

```json
{
  "name": "your-existing-project",
  "version": "1.2.3",
  "scripts": {
    // Existing scripts preserved
    "start": "node server.js",
    "build": "webpack --mode production",

    // New Claude workflow scripts added
    "assess": "node .claude/cli.js assess",
    "fix": "node .claude/cli.js fix",
    "test:tdd": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:mutation": "stryker run",
    "lint:claude": "eslint . --ext .js,.ts --fix",
    "format:claude": "prettier --write \"**/*.{js,ts,json,md}\"",
    "validate": "node .claude/cli.js validate",
    "status": "node .claude/cli.js status"
  },
  "devDependencies": {
    // Existing dependencies preserved
    "webpack": "^5.0.0",

    // New dependencies added only if missing
    "@types/jest": "^29.5.12",
    "eslint": "^8.57.0",
    "prettier": "^3.2.5"
  }
}
```

**Configuration Merging Strategy:**

- **Preserve existing**: Never overwrites working configurations
- **Extend, don't replace**: Adds new rules alongside existing ones
- **Smart merging**: Combines compatible configurations
- **Fallback options**: Creates alternative commands if conflicts exist

#### Python Projects

**pyproject.toml Enhancement:**

```toml
[build-system]
# Existing build system preserved
requires = ["setuptools", "wheel"]
build-backend = "setuptools.build_meta"

[tool.poetry]
# Existing poetry config preserved
name = "your-existing-project"
version = "2.1.0"

[tool.poetry.dependencies]
# Existing dependencies preserved
python = "^3.9"
fastapi = "^0.104.0"

[tool.poetry.group.dev.dependencies]
# Existing dev dependencies preserved
pytest = "^7.0"

# New Claude workflow dependencies added
pytest-cov = "^4.0"
black = "^23.0"
ruff = "^0.1.0"

# New Claude workflow tool configurations
[tool.claude]
project_type = "existing"
enhanced_date = "2024-01-01"

[tool.pytest.ini_options]
# Enhanced with coverage requirements
testpaths = ["tests"]
addopts = "--cov=src --cov-report=term-missing --cov-fail-under=80"

[tool.black]
# Added only if not already configured
line-length = 88
```

### Step 3: TDD Integration (Gradual Adoption)

The system integrates TDD enforcement gradually:

#### Existing Code Assessment

```bash
# Run initial assessment
make assess

# Check TDD compliance for new code only
make validate-tdd --new-code-only

# Generate TDD adoption roadmap
make tdd-roadmap
```

**TDD Integration Modes:**

1. **New Code Only** (Default for existing projects):

   ```bash
   # Only new changes require TDD
   make validate-tdd --mode=new-only
   ```

2. **Gradual Adoption**:

   ```bash
   # Gradually add tests to existing code
   make tdd-adopt --target=10  # 10% per sprint
   ```

3. **Full Enforcement** (when ready):
   ```bash
   # Enforce TDD for all code
   make validate-tdd --mode=full
   ```

#### Test Framework Integration

**If you have Jest:**

```javascript
// jest.config.js - Enhanced, not replaced
module.exports = {
  // Your existing Jest config preserved
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  // Claude enhancements added
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // TDD mode for watch
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
```

**If you have pytest:**

```toml
# pyproject.toml - Enhanced pytest config
[tool.pytest.ini_options]
# Your existing config preserved
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]

# Claude enhancements added
addopts = [
    "--cov=src",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-fail-under=80",
    "--strict-markers",
    "--strict-config",
]
markers = [
    "integration: marks tests as integration tests",
    "unit: marks tests as unit tests",
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
]
```

### Step 4: Agent System Integration

The 20-agent system integrates with your existing workflow:

#### Agent Configuration for Existing Projects

```json
// .claude/settings.local.json
{
  "project": {
    "type": "existing",
    "migration_mode": true,
    "preserve_existing": true
  },
  "agents": {
    "auditor": {
      "enabled": true,
      "scope": "incremental", // Only assess changed files
      "respect_gitignore": true,
      "exclude_patterns": ["legacy/*", "vendor/*", "node_modules/*"]
    },
    "executor": {
      "enabled": true,
      "max_file_changes": 300, // Fix Pack limit
      "auto_commit": false, // Human review required
      "preserve_style": true // Match existing code style
    },
    "guardian": {
      "enabled": true,
      "protect_existing_ci": true,
      "enhance_ci": false // Don't modify existing CI initially
    }
  },
  "tdd": {
    "enforcement_mode": "new_code_only",
    "coverage_baseline": 60, // Current coverage level
    "coverage_target": 80, // Target coverage
    "gradual_adoption": true
  }
}
```

#### Legacy Code Handling

**Smart Legacy Detection:**

```bash
# Mark legacy directories (excluded from strict TDD)
node .claude/cli.js mark-legacy src/legacy/
node .claude/cli.js mark-legacy vendor/

# Create improvement roadmap for legacy code
node .claude/cli.js legacy-roadmap
```

**Generated `.claudeignore`:**

```
# Legacy code (gradually migrate to TDD)
src/legacy/
vendor/
third-party/

# Generated files
dist/
build/
*.min.js

# Temporary exclusions (remove as you add tests)
src/utils/old-helpers.js
src/modules/deprecated/
```

### Step 5: CI/CD Integration (Non-Disruptive)

#### Existing GitHub Actions

**If you have existing workflows**, Claude enhances them:

```yaml
# .github/workflows/ci.yml - Enhanced, not replaced
name: CI
on: [push, pull_request]

jobs:
  # Your existing jobs preserved
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      # Your existing steps preserved
      - name: Install dependencies
        run: npm install
      - name: Run existing tests
        run: npm test

      # Claude enhancements added
      - name: Run Claude validation
        run: make validate
      - name: Check TDD compliance (new code only)
        run: make validate-tdd --new-only
      - name: Run assessment
        run: make assess
        continue-on-error: true # Don't fail build initially
```

#### New CI/CD Features

**Optional parallel workflow** (doesn't interfere with existing):

```yaml
# .github/workflows/claude-quality.yml - New optional workflow
name: Claude Quality Checks
on: [pull_request]

jobs:
  claude-assessment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Claude workflow
        uses: ./.claude/actions/setup
      - name: Run comprehensive assessment
        run: make assess-full
      - name: Comment on PR
        uses: ./.claude/actions/pr-comment
        with:
          assessment-results: assessment-results.json
```

### Step 6: Team Adoption Strategy

#### Gradual Team Integration

**Phase 1: Assessment Only (Week 1)**

```bash
# Team members run assessments (no enforcement)
make assess
make status
```

**Phase 2: New Code TDD (Week 2-4)**

```bash
# New features must follow TDD
make validate-tdd --new-only
```

**Phase 3: Legacy Improvement (Month 2+)**

```bash
# Gradually improve legacy code
make tdd-adopt --target=25  # 25% coverage increase
```

**Phase 4: Full Integration (Month 3+)**

```bash
# Full Claude workflow adoption
make validate-tdd --full
```

#### Training Materials

**Generated for your team:**

```
.claude/docs/team/
├── QUICK-START.md           # 5-minute onboarding
├── TDD-MIGRATION-GUIDE.md   # TDD adoption strategy
├── AGENT-OVERVIEW.md        # Understanding the 20 agents
├── COMMON-WORKFLOWS.md      # Daily development patterns
└── TROUBLESHOOTING.md       # Common issues and solutions
```

## Universal Commands (Existing Projects)

```bash
# Assessment and validation
make assess              # Assess code quality (incremental)
make assess-full         # Full codebase assessment
make validate            # Validate current state
make validate-tdd        # Check TDD compliance

# Gradual improvement
make tdd-adopt           # Adopt TDD for more code
make legacy-improve      # Improve legacy code incrementally
make coverage-report     # Generate coverage report

# Daily workflow
make test               # Run tests (existing + new)
make lint               # Lint with existing + Claude rules
make format             # Format with existing + Claude style
make status             # Show system status

# Migration helpers
make migration-status   # Show migration progress
make rollback          # Rollback Claude integration
make reset-config      # Reset to default configuration
```

## Handling Common Existing Project Scenarios

### Scenario 1: Large Legacy Codebase

**Challenge**: 100k+ lines, low test coverage, multiple contributors

**Solution**:

```bash
# Configure for large legacy projects
node .claude/setup.js --legacy-mode

# Focus on new code and critical paths
make assess --scope=critical-paths
make validate-tdd --new-only

# Gradual improvement
make legacy-roadmap --timeline=6months
```

### Scenario 2: Existing Test Suite

**Challenge**: You have 500+ existing tests

**Solution**:

```bash
# Preserve existing tests
node .claude/setup.js --preserve-tests

# Enhance existing test configuration
make enhance-testing --preserve-existing

# Add TDD for new features only
make validate-tdd --mode=additive
```

### Scenario 3: Multiple Package Managers

**Challenge**: You use both npm and poetry

**Solution**:

```bash
# Polyglot project setup
node .claude/setup.js --languages=javascript,python

# Dual package manager support
make install-deps-js   # npm/yarn operations
make install-deps-py   # poetry/pip operations
make test-js          # JavaScript tests
make test-py          # Python tests
```

### Scenario 4: Custom Build Pipeline

**Challenge**: Complex webpack/Docker build process

**Solution**:

```bash
# Preserve existing build
node .claude/setup.js --preserve-build

# Add Claude commands alongside existing
make build             # Your existing build
make claude-build      # Claude-enhanced build
make validate-build    # Validate build quality
```

### Scenario 5: Strict Corporate Policies

**Challenge**: Cannot modify certain files

**Solution**:

```json
// .claude/settings.local.json
{
  "protection": {
    "immutable_files": ["package.json", "tsconfig.json", ".eslintrc.js"],
    "read_only_dirs": ["vendor/", "third-party/"]
  },
  "integration": {
    "mode": "additive",
    "respect_locks": true,
    "create_alternatives": true
  }
}
```

## Migration Verification

### Pre-Integration Checklist

```bash
# Before running setup
☐ Project backed up
☐ Clean git status
☐ Dependencies up to date
☐ Tests currently passing
☐ Team notified
```

### Post-Integration Verification

```bash
# After setup completion
make migration-verify

# Check everything still works
npm test          # Existing tests pass
npm run build     # Existing build works
npm start         # Application starts

# Check Claude integration
make status       # Agents operational
make assess       # Quality assessment works
make validate     # Validation passes
```

Expected results:

- ✅ Existing functionality unchanged
- ✅ All original tests pass
- ✅ Build process unaffected
- ✅ Claude agents operational
- ✅ New TDD workflow available

## Rollback Strategy

If integration causes issues:

```bash
# Quick rollback
make rollback

# Manual rollback
git checkout HEAD~1  # If you committed changes
git stash pop        # If you stashed changes

# Restore from backup
cp .claude-backup/* .

# Remove Claude system
rm -rf .claude/
```

## Advanced Integration Options

### Custom Agent Configuration

```bash
# Configure agents for your workflow
node .claude/cli.js configure-agents

# Enable specific agents only
node .claude/cli.js enable-agent auditor,executor

# Disable problematic agents
node .claude/cli.js disable-agent securityguard
```

### Integration with Existing Tools

**ESLint Integration:**

```javascript
// .eslintrc.js - Extended configuration
module.exports = {
  extends: [
    // Your existing configs
    '@your-company/eslint-config',

    // Claude additions (optional)
    './.claude/configs/eslint-tdd.js',
  ],
  rules: {
    // Your existing rules preserved
    'no-console': 'warn',

    // Claude rules added conditionally
    ...(process.env.CLAUDE_TDD === 'true' && {
      'jest/expect-expect': 'error',
      'jest/no-disabled-tests': 'warn',
    }),
  },
};
```

**Prettier Integration:**

```json
{
  "extends": ["./.claude/configs/prettier-base.json"],
  "overrides": [
    {
      "files": ["src/legacy/**/*"],
      "options": {
        "tabWidth": 4,
        "useTabs": true
      }
    }
  ]
}
```

## Troubleshooting Common Issues

### Issue: Dependency Conflicts

```bash
# Check for conflicts
make diagnose-deps

# Resolve conflicts
make resolve-conflicts

# Manual resolution
npm ls | grep conflicted-package
```

### Issue: Test Failures After Integration

```bash
# Identify cause
make diagnose-tests

# Restore original test config
cp .claude-backup/jest.config.js .

# Gradual integration
make enhance-tests --minimal
```

### Issue: Build Process Changes

```bash
# Restore original build
cp .claude-backup/webpack.config.js .

# Alternative build commands
make build-original  # Your original build
make build-enhanced  # Claude-enhanced build
```

## Best Practices for Existing Projects

1. **Start Small**: Enable assessment only initially
2. **Gradual Adoption**: Introduce TDD for new features first
3. **Team Training**: Ensure team understands new workflow
4. **Monitor Impact**: Track metrics before/after integration
5. **Iterative Improvement**: Gradually increase TDD enforcement
6. **Preserve What Works**: Don't fix what isn't broken
7. **Document Changes**: Keep changelog of modifications

## Success Metrics

Track these metrics during integration:

**Code Quality:**

- Test coverage percentage
- Bug discovery rate
- Code complexity scores
- Technical debt reduction

**Development Velocity:**

- Time to implement features
- Code review turnaround
- Deployment frequency
- Mean time to recovery

**Team Adoption:**

- Agent usage statistics
- TDD compliance rate
- Developer satisfaction scores
- Training completion rate

Your existing project is now enhanced with enterprise-grade autonomous code quality management while preserving your existing workflows! 🚀
