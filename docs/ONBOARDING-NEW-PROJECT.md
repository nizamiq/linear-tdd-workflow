# Onboarding New Project - Claude Agentic Workflow System

This guide walks you through setting up the Claude Agentic Workflow System for a brand new project from scratch.

## Prerequisites

- **Node.js** ≥18.0.0
- **Python** ≥3.8 (for polyglot projects)
- **Git** for version control
- **Text editor** or IDE of choice

## Quick Start (5 minutes)

```bash
# 1. Clone workflow system to your workspace
cd ~/workspace  # or your projects directory
git clone https://github.com/your-org/claude-workflow

# 2. Create new project directory
mkdir my-new-project
cd my-new-project

# 3. Install workflow system using smart installer
../claude-workflow/scripts/install.sh

# 4. Initialize git repository
git init
git add .
git commit -m "feat: initialize project with Claude Agentic Workflow"
```

## Detailed Setup Process

### Step 1: Project Initialization

The setup script will guide you through project creation:

```bash
node .claude/setup.js
```

**Setup Process:**

1. **Project Detection** - Automatically detects this is a new project
2. **Language Selection** - Choose your primary language(s):
   - JavaScript only
   - TypeScript only
   - Python only
   - JavaScript + Python (polyglot)
3. **Framework Detection** - Optionally select a framework:
   - React, Vue, Angular (frontend)
   - Express, Fastify (Node.js backend)
   - FastAPI, Flask, Django (Python backend)
4. **Dependency Installation** - Automatically installs required tools
5. **Project Structure Creation** - Creates standardized directory structure

### Step 2: Generated Project Structure

After setup, your project will have:

```
my-new-project/
├── .claude/                    # Claude workflow system (self-contained)
│   ├── agents/                # 20 specialized agents
│   ├── cli.js                 # Universal CLI interface
│   ├── setup.js              # Setup script
│   └── templates/             # Project templates
├── src/                       # Source code
├── tests/                     # Test files
├── docs/                      # Documentation
├── .github/workflows/         # CI/CD (if enabled)
├── package.json              # Node.js dependencies & scripts
├── pyproject.toml            # Python dependencies (if Python)
├── tsconfig.json             # TypeScript config (if TypeScript)
├── .eslintrc.js              # Linting configuration
├── .prettierrc.json          # Code formatting
├── Makefile                  # Universal commands
├── CLAUDE.md                 # Claude Code instructions
└── README.md                 # Project documentation
```

### Step 3: Language-Specific Configuration

#### JavaScript/TypeScript Projects

**Generated `package.json`:**

```json
{
  "name": "my-new-project",
  "version": "1.0.0",
  "scripts": {
    "test": "jest --coverage --verbose",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:mutation": "stryker run",
    "lint": "eslint . --ext .js,.ts --fix",
    "lint:check": "eslint . --ext .js,.ts",
    "format": "prettier --write \"**/*.{js,ts,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,ts,json,md}\"",
    "typecheck": "tsc --noEmit",
    "build": "tsc",
    "assess": "node .claude/cli.js assess",
    "fix": "node .claude/cli.js fix",
    "validate": "node .claude/cli.js validate",
    "status": "node .claude/cli.js status"
  },
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "@types/node": "^20.11.30",
    "eslint": "^8.57.0",
    "jest": "^29.7.0",
    "prettier": "^3.2.5",
    "typescript": "^5.4.2"
  }
}
```

**Jest Configuration:**

- Coverage threshold: 80% (lines, functions, branches, statements)
- Test patterns: `**/*.test.{js,ts}`, `**/*.spec.{js,ts}`
- Setup for TypeScript with ts-jest

#### Python Projects

**Generated `pyproject.toml`:**

```toml
[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

[tool.poetry]
name = "my-new-project"
version = "0.1.0"
description = "Project with Claude Agentic Workflow"

[tool.poetry.dependencies]
python = "^3.8"

[tool.poetry.group.dev.dependencies]
pytest = "^7.0"
pytest-cov = "^4.0"
black = "^23.0"
ruff = "^0.1.0"
mypy = "^1.0"

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
addopts = "--cov=src --cov-report=term-missing --cov-fail-under=80"

[tool.black]
line-length = 88
target-version = ['py38']

[tool.ruff]
line-length = 88
target-version = "py38"
select = ["E", "W", "F", "I", "B", "C4", "UP"]

[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

### Step 4: TDD Setup and First Test

The system enforces Test-Driven Development from day one.

#### Create Your First Test (RED Phase)

**JavaScript/TypeScript:**

```bash
# Create initial failing test
cat > tests/unit/calculator.test.ts << 'EOF'
import { Calculator } from '../../src/calculator';

describe('Calculator', () => {
  it('should add two numbers', () => {
    const calc = new Calculator();
    expect(calc.add(2, 3)).toBe(5);
  });
});
EOF
```

**Python:**

```bash
# Create initial failing test
cat > tests/test_calculator.py << 'EOF'
from src.calculator import Calculator

def test_add_two_numbers():
    calc = Calculator()
    assert calc.add(2, 3) == 5
EOF
```

#### Run Tests (Should Fail - RED Phase)

```bash
make test
# OR
npm test  # For JS/TS
pytest    # For Python
```

#### Implement Minimal Code (GREEN Phase)

**JavaScript/TypeScript:**

```bash
mkdir -p src
cat > src/calculator.ts << 'EOF'
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}
EOF
```

**Python:**

```bash
mkdir -p src
cat > src/calculator.py << 'EOF'
class Calculator:
    def add(self, a: int, b: int) -> int:
        return a + b
EOF
```

#### Verify Tests Pass (GREEN Phase)

```bash
make test
```

### Step 5: Multi-Agent System Validation

Verify the agent system is working:

```bash
# Check agent status
make status

# Run first assessment
make assess

# Validate TDD compliance
make validate-tdd
```

### Step 6: CI/CD Setup

The setup script can automatically configure GitHub Actions:

```yaml
# .github/workflows/ci.yml (auto-generated)
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: make ci-test
      - name: Run assessment
        run: make assess
```

## Universal Commands (Any Project Type)

```bash
# Core workflow commands
make assess              # Run code quality assessment
make fix TASK=CLEAN-123  # Implement fix pack
make test               # Run TDD cycle
make status             # Show system status
make validate           # Validate configuration

# Development commands
make lint               # Lint all code
make format             # Format all code
make test-coverage      # Run tests with coverage
make test-mutation      # Run mutation testing

# Diagnostic commands
make doctor             # Diagnose issues
make validate-tdd       # Check TDD compliance
make agents-status      # Check agent health
```

## Advanced Configuration

### Custom Configuration

Create `.claude/settings.local.json`:

```json
{
  "project": {
    "name": "my-new-project",
    "type": "application",
    "languages": ["typescript", "python"]
  },
  "agents": {
    "auditor": {
      "enabled": true,
      "autoAssess": true,
      "schedule": "0 9 * * 1"
    },
    "executor": {
      "maxConcurrentFixes": 3,
      "autoCommit": false
    }
  },
  "tdd": {
    "coverageThreshold": 80,
    "mutationThreshold": 30,
    "enforceTestFirst": true
  },
  "linear": {
    "teamId": "your-team-id",
    "autoCreateTasks": true
  }
}
```

### Environment Variables

Create `.env` (never commit this):

```bash
# Linear integration
LINEAR_API_KEY=your_api_key_here
LINEAR_TEAM_ID=your_team_id

# Optional: Anthropic API for advanced features
ANTHROPIC_API_KEY=your_anthropic_key
```

## Project Types and Templates

### Web Application (React/TypeScript)

```bash
# Initialize React TypeScript project
node .claude/setup.js --template react-ts
```

Generates:

- React + TypeScript configuration
- Jest + React Testing Library
- ESLint + Prettier for React
- Component testing patterns

### API Server (Express/TypeScript)

```bash
# Initialize Express TypeScript API
node .claude/setup.js --template express-ts
```

Generates:

- Express.js with TypeScript
- API testing with Supertest
- Swagger/OpenAPI documentation
- Database migration patterns

### Python Web API (FastAPI)

```bash
# Initialize FastAPI project
node .claude/setup.js --template fastapi
```

Generates:

- FastAPI with async support
- Pytest with async testing
- Pydantic models
- Alembic migrations

### CLI Application

```bash
# Initialize CLI project
node .claude/setup.js --template cli
```

Generates:

- Commander.js (Node.js) or Click (Python)
- CLI testing patterns
- Distribution packaging

## Verification Checklist

After setup, verify everything is working:

```bash
# 1. Run full validation
make validate

# 2. Test TDD workflow
make test

# 3. Check agent system
make agents-status

# 4. Run code assessment
make assess

# 5. Verify linting
make lint

# 6. Check formatting
make format

# 7. Run comprehensive test
make ci-test
```

Expected output:

- ✅ All tests pass
- ✅ Code coverage ≥80%
- ✅ Linting passes
- ✅ Agent system operational
- ✅ TDD gates enforced

## Next Steps

1. **Configure Linear Integration**: Add your Linear API key and team ID
2. **Set up Git Hooks**: Install pre-commit hooks for TDD enforcement
3. **Customize Agents**: Configure agent behavior in `.claude/settings.local.json`
4. **Add Team Members**: Share setup instructions with your team
5. **Create First Feature**: Follow TDD workflow to build your first feature

## Troubleshooting

### Common Issues

**Setup fails with dependency errors:**

```bash
# Check Node.js version
node --version  # Should be ≥18.0.0

# Clear npm cache
npm cache clean --force

# Retry setup
node .claude/setup.js
```

**Tests not running:**

```bash
# Diagnose issues
make doctor

# Check test configuration
make validate-tdd
```

**Agent system not responding:**

```bash
# Check agent status
make agents-status

# Validate permissions
make validate-permissions

# Reset agent configuration
node .claude/setup.js --reset-agents
```

## Support

- **Documentation**: See `.claude/docs/` for detailed guides
- **Agent Reference**: Check `.claude/agents/CLAUDE.md`
- **CLI Help**: Run `node .claude/cli.js --help`
- **Diagnostics**: Use `make doctor` for automated troubleshooting

Your new project is now ready with enterprise-grade autonomous code quality management! 🚀
