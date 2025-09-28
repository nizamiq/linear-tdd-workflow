---
title: WORKFLOW-TDD-PROTOCOL
version: 1.0.0
last_updated: 2024-11-27
owner: Engineering Excellence Team
tags: [tdd, testing, development, workflow, quality]
---

# WORKFLOW-TDD-PROTOCOL

## Executive Summary

- **Purpose**: Define the mandatory Test-Driven Development workflow and quality standards for all code development
- **Audience**: All developers, AI agents, tech leads, and QA engineers
- **Scope**: Covers TDD methodology, code quality standards, testing strategies, and deployment protocols
- **Prerequisites**: Understanding of basic programming concepts and version control

## Table of Contents

1. [Core Concepts](#1-core-concepts)
   - 1.1 [RED-GREEN-REFACTOR Cycle](#11-red-green-refactor-cycle)
   - 1.2 [Clean Code Principles](#12-clean-code-principles)
   - 1.3 [Testing Strategy](#13-testing-strategy)
   - 1.4 [Code Quality Gates](#14-code-quality-gates)
2. [Implementation](#2-implementation)
   - 2.1 [Language-Specific Guidelines](#21-language-specific-guidelines)
   - 2.2 [Pre-commit Hooks Configuration](#22-pre-commit-hooks-configuration)
   - 2.3 [Pipeline Integration](#23-pipeline-integration)
3. [Reference](#3-reference)
   - 3.1 [Checklist Templates](#31-checklist-templates)
   - 3.2 [Metrics & Thresholds](#32-metrics--thresholds)
   - 3.3 [Common Patterns](#33-common-patterns)
4. [Related Documents](#4-related-documents)

## 1. Core Concepts

### 1.1 RED-GREEN-REFACTOR Cycle

The fundamental TDD cycle is **non-negotiable** for all development:

#### Phase 1: RED - Write Failing Test
```typescript
// ALWAYS start with a failing test
describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    const result = calculator.add(2, 3);
    expect(result).toBe(5); // This MUST fail initially
  });
});
```

**Requirements:**
- Write a single, small, focused test
- Test defines what the code *should* do
- Confirm test fails for the expected reason
- Never write production code without a failing test

#### Phase 2: GREEN - Minimal Implementation
```typescript
// Write ONLY enough code to pass the test
class Calculator {
  add(a: number, b: number): number {
    return a + b; // Minimal implementation
  }
}
```

**Requirements:**
- Write absolute minimum code to pass
- Do not add extra logic or edge cases
- Focus only on making the test green
- Resist temptation to over-engineer

#### Phase 3: REFACTOR - Improve with Safety
```typescript
// Refactor ONLY with passing tests
class Calculator {
  private validateNumbers(...nums: number[]): void {
    nums.forEach(num => {
      if (typeof num !== 'number' || isNaN(num)) {
        throw new TypeError('Invalid number provided');
      }
    });
  }

  add(a: number, b: number): number {
    this.validateNumbers(a, b);
    return a + b; // Now with validation
  }
}
```

**Requirements:**
- All tests must remain green
- Improve code clarity and design
- Remove duplication
- Enhance maintainability

### 1.2 Clean Code Principles

#### Single Responsibility Principle (SRP)
Every function, class, or module has **one reason to change**:

```typescript
// BAD: Multiple responsibilities
class UserService {
  validateEmail(email: string) { /* ... */ }
  sendEmail(email: string) { /* ... */ }
  saveToDatabase(user: User) { /* ... */ }
}

// GOOD: Single responsibility
class EmailValidator {
  validate(email: string): boolean { /* ... */ }
}

class EmailSender {
  send(email: string): void { /* ... */ }
}

class UserRepository {
  save(user: User): void { /* ... */ }
}
```

#### Don't Repeat Yourself (DRY)
Abstract shared logic into reusable components:

```typescript
// BAD: Duplication
function calculateTax1(amount: number): number {
  const taxRate = 0.2;
  return amount * taxRate;
}

function calculateTax2(amount: number): number {
  const taxRate = 0.2;
  return amount * taxRate;
}

// GOOD: Reusable
const TAX_RATE = 0.2;

function calculateTax(amount: number, rate: number = TAX_RATE): number {
  return amount * rate;
}
```

#### Keep It Simple, Stupid (KISS)
Favor simple, straightforward solutions:

```typescript
// BAD: Over-engineered
class AbstractFactoryBuilderSingletonProxy {
  // 200 lines of unnecessary complexity
}

// GOOD: Simple and clear
class UserFactory {
  create(data: UserData): User {
    return new User(data);
  }
}
```

### 1.3 Testing Strategy

#### Test Pyramid Structure

```
        /\
       /E2E\      <- 10% - Full user journeys
      /______\
     /Integration\ <- 20% - Component interactions
    /______________\
   /     Unit      \ <- 70% - Isolated functions
  /__________________\
```

#### Unit Testing Requirements

**Characteristics:**
- Small, fast, isolated
- Test single units in isolation
- Mock all external dependencies
- Run in milliseconds

**Example:**
```typescript
describe('UserValidator', () => {
  let validator: UserValidator;
  let mockDatabase: jest.Mocked<Database>;

  beforeEach(() => {
    mockDatabase = createMockDatabase();
    validator = new UserValidator(mockDatabase);
  });

  test('validates email format', () => {
    expect(validator.isValidEmail('user@example.com')).toBe(true);
    expect(validator.isValidEmail('invalid')).toBe(false);
  });

  test('checks email uniqueness', async () => {
    mockDatabase.findByEmail.mockResolvedValue(null);

    const isUnique = await validator.isEmailUnique('new@example.com');

    expect(isUnique).toBe(true);
    expect(mockDatabase.findByEmail).toHaveBeenCalledWith('new@example.com');
  });
});
```

#### Integration Testing Requirements

**Characteristics:**
- Test component interactions
- Use real implementations where practical
- Test database transactions
- Verify API contracts

**Example:**
```typescript
describe('User Registration Flow', () => {
  let app: Application;
  let database: TestDatabase;

  beforeAll(async () => {
    database = await TestDatabase.create();
    app = createApp(database);
  });

  afterAll(async () => {
    await database.cleanup();
  });

  test('complete registration flow', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        email: 'newuser@example.com',
        password: 'SecurePass123!'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('userId');

    const user = await database.users.findByEmail('newuser@example.com');
    expect(user).toBeDefined();
    expect(user.isVerified).toBe(false);
  });
});
```

#### End-to-End Testing Requirements

**Characteristics:**
- Simulate complete user journeys
- Run against production-like environment
- Validate entire workflows
- Include UI interactions

**Example:**
```typescript
describe('User Purchase Flow', () => {
  test('complete purchase journey', async () => {
    await page.goto('https://staging.example.com');

    // Login
    await page.fill('[data-test="email"]', 'user@example.com');
    await page.fill('[data-test="password"]', 'password');
    await page.click('[data-test="login-button"]');

    // Add to cart
    await page.click('[data-test="product-1"]');
    await page.click('[data-test="add-to-cart"]');

    // Checkout
    await page.click('[data-test="checkout"]');
    await page.fill('[data-test="card-number"]', '4242424242424242');
    await page.click('[data-test="purchase"]');

    // Verify
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('[data-test="order-id"]')).toBeVisible();
  });
});
```

### 1.4 Code Quality Gates

#### Coverage Requirements

| Metric | Minimum | Target | Critical Path |
|--------|---------|--------|---------------|
| Line Coverage | 80% | 90% | 95% |
| Branch Coverage | 75% | 85% | 90% |
| Function Coverage | 80% | 90% | 95% |
| Diff Coverage | 80% | 90% | 95% |

#### Mutation Testing Thresholds

```yaml
stryker_config:
  mutationScoreThreshold: 30  # Minimum
  targetMutationScore: 50     # Goal
  criticalPathScore: 70       # Critical code
```

#### Quality Metrics

| Metric | Threshold | Action if Exceeded |
|--------|-----------|-------------------|
| Cyclomatic Complexity | >10 | Refactor required |
| Function Length | >50 lines | Split function |
| File Length | >300 lines | Split file |
| Class Cohesion | <0.5 | Restructure class |
| Coupling | >5 | Reduce dependencies |

## 2. Implementation

### 2.1 Language-Specific Guidelines

#### JavaScript/TypeScript

**Testing Framework:** Jest
```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

**Linting:** ESLint + Prettier
```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "complexity": ["error", 10],
    "max-lines-per-function": ["error", 50],
    "max-depth": ["error", 3]
  }
}
```

**Formatting:** Prettier
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

#### Python

**Testing Framework:** pytest
```ini
# pytest.ini
[tool.pytest.ini_options]
minversion = "6.0"
addopts = "-ra -q --strict-markers --cov=src --cov-report=term-missing"
testpaths = ["tests"]
python_files = "test_*.py"
```

**Linting:** Ruff
```toml
# ruff.toml
[tool.ruff]
line-length = 88
target-version = "py310"
select = ["E", "F", "W", "C90", "I", "N"]

[tool.ruff.mccabe]
max-complexity = 10
```

**Formatting:** Black
```toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py310']
include = '\.pyi?$'
```

### 2.2 Pre-commit Hooks Configuration

```yaml
# .pre-commit-config.yaml
repos:
  # JavaScript/TypeScript
  - repo: local
    hooks:
      - id: eslint
        name: ESLint
        entry: npx eslint --fix
        language: system
        files: \.(js|jsx|ts|tsx)$

      - id: prettier
        name: Prettier
        entry: npx prettier --write
        language: system
        files: \.(js|jsx|ts|tsx|json|md)$

      - id: jest
        name: Jest Tests
        entry: npm test -- --coverage --passWithNoTests
        language: system
        pass_filenames: false

  # Python
  - repo: https://github.com/psf/black
    rev: 23.1.0
    hooks:
      - id: black

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.0.261
    hooks:
      - id: ruff
        args: [--fix]

  # General
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict
      - id: detect-private-key
```

### 2.3 Pipeline Integration

#### GitHub Actions Configuration

```yaml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint:check

      - name: Run type checking
        run: npm run typecheck

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Run mutation tests
        run: npm run test:mutation

      - name: Check coverage thresholds
        run: |
          coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$coverage < 80" | bc -l) )); then
            echo "Coverage is below 80%"
            exit 1
          fi

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

#### Quality Gate Enforcement

```typescript
// quality-gates.ts
export const QualityGates = {
  coverage: {
    lines: 80,
    branches: 75,
    functions: 80,
    statements: 80
  },
  complexity: {
    cyclomatic: 10,
    cognitive: 15
  },
  duplication: {
    threshold: 3 // Max 3% duplication
  },
  security: {
    critical: 0,
    high: 0,
    medium: 3 // Max 3 medium issues
  }
};

// Enforce in CI
export async function enforceQualityGates(metrics: Metrics): Promise<void> {
  const violations = [];

  if (metrics.coverage.lines < QualityGates.coverage.lines) {
    violations.push(`Line coverage ${metrics.coverage.lines}% below threshold ${QualityGates.coverage.lines}%`);
  }

  if (metrics.complexity.cyclomatic > QualityGates.complexity.cyclomatic) {
    violations.push(`Cyclomatic complexity ${metrics.complexity.cyclomatic} exceeds threshold ${QualityGates.complexity.cyclomatic}`);
  }

  if (violations.length > 0) {
    throw new Error(`Quality gates failed:\n${violations.join('\n')}`);
  }
}
```

## 3. Reference

### 3.1 Checklist Templates

#### Pre-Deployment Checklist

**Code Review**
- [ ] All changes reviewed by 2+ developers
- [ ] Review comments addressed
- [ ] No experimental code in production branch
- [ ] Follows TDD methodology

**Testing**
- [ ] All unit tests passing (100%)
- [ ] Integration tests passing
- [ ] E2E tests passing for critical paths
- [ ] Coverage meets thresholds (≥80%)
- [ ] Mutation testing ≥30%
- [ ] No critical security vulnerabilities

**Documentation**
- [ ] API documentation updated
- [ ] README updated if needed
- [ ] CHANGELOG entry added
- [ ] Architecture decisions documented

**Configuration**
- [ ] Environment variables documented
- [ ] No hardcoded secrets
- [ ] Configuration validated
- [ ] Feature flags configured

**Performance**
- [ ] Load testing completed
- [ ] Response time SLAs met
- [ ] Database queries optimized
- [ ] Memory usage acceptable

#### TDD Checklist

**RED Phase**
- [ ] Test written before code
- [ ] Test is focused and small
- [ ] Test clearly describes expected behavior
- [ ] Test fails for the right reason
- [ ] No production code written yet

**GREEN Phase**
- [ ] Minimal code to pass test
- [ ] No extra functionality added
- [ ] All existing tests still pass
- [ ] No optimization attempted
- [ ] Code is simplest solution

**REFACTOR Phase**
- [ ] All tests remain green
- [ ] Code duplication removed
- [ ] Names are clear and meaningful
- [ ] Functions are small and focused
- [ ] Design patterns applied where appropriate

### 3.2 Metrics & Thresholds

#### Test Execution Metrics

| Test Type | Max Duration | Parallelization | Retry Policy |
|-----------|--------------|-----------------|--------------|
| Unit | <100ms per test | Yes (4 workers) | No retry |
| Integration | <5s per test | Yes (2 workers) | 1 retry |
| E2E | <30s per test | No | 2 retries |
| Smoke | <2min total | No | No retry |

#### Code Quality Metrics

| Metric | Excellent | Good | Acceptable | Poor |
|--------|-----------|------|------------|------|
| Test Coverage | >95% | 85-95% | 80-85% | <80% |
| Cyclomatic Complexity | <5 | 5-10 | 10-15 | >15 |
| Code Duplication | <1% | 1-3% | 3-5% | >5% |
| Technical Debt Ratio | <5% | 5-10% | 10-20% | >20% |
| Maintainability Index | >85 | 65-85 | 50-65 | <50 |

#### Performance Benchmarks

| Operation | P50 | P95 | P99 | Max |
|-----------|-----|-----|-----|-----|
| API Response | 100ms | 300ms | 500ms | 1s |
| Database Query | 10ms | 50ms | 100ms | 500ms |
| Page Load | 1s | 2s | 3s | 5s |
| Background Job | 30s | 2min | 5min | 10min |

### 3.3 Common Patterns

#### Test Data Builders

```typescript
// Pattern: Builder for complex test data
class UserBuilder {
  private user: Partial<User> = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User'
  };

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withRole(role: Role): this {
    this.user.role = role;
    return this;
  }

  build(): User {
    return new User(this.user);
  }
}

// Usage
const adminUser = new UserBuilder()
  .withEmail('admin@example.com')
  .withRole('admin')
  .build();
```

#### Mock Factories

```typescript
// Pattern: Factory for consistent mocks
export class MockFactory {
  static createDatabase(): jest.Mocked<Database> {
    return {
      query: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      transaction: jest.fn()
    };
  }

  static createLogger(): jest.Mocked<Logger> {
    return {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };
  }
}
```

#### Custom Assertions

```typescript
// Pattern: Domain-specific assertions
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid email`
          : `Expected ${received} to be a valid email`
    };
  }
});

// Usage
expect('user@example.com').toBeValidEmail();
```

#### Test Fixtures

```typescript
// Pattern: Reusable test fixtures
export const fixtures = {
  users: {
    valid: {
      email: 'valid@example.com',
      password: 'SecurePass123!',
      name: 'Valid User'
    },
    invalid: {
      email: 'invalid-email',
      password: '123',
      name: ''
    }
  },

  products: {
    laptop: {
      id: 'prod-1',
      name: 'Laptop',
      price: 999.99,
      stock: 10
    }
  }
};
```

## 4. Related Documents

- [WORKFLOW-PRODUCT-REQUIREMENTS.md](./WORKFLOW-PRODUCT-REQUIREMENTS.md) - Business requirements and success metrics
- [ARCHITECTURE-AGENTS.md](./ARCHITECTURE-AGENTS.md) - Agent system architecture and roles
- [INTEGRATION-GITFLOW.md](./INTEGRATION-GITFLOW.md) - Git workflow and branching strategy
- [WORKFLOW-CLEAN-CODE-ASSESSMENT.md](./WORKFLOW-CLEAN-CODE-ASSESSMENT.md) - Code quality assessment framework
- [REFERENCE-MASTER.md](./REFERENCE-MASTER.md) - Complete reference guide

## Appendices

### Appendix A: Testing Philosophy

The Linear TDD Workflow System treats **tests as the source of truth**. Production code exists to satisfy tests, not the other way around. This fundamental principle ensures:

1. **Requirements are executable** - Tests define behavior
2. **Quality is measurable** - Coverage and mutation scores
3. **Regressions are preventable** - Tests catch breaking changes
4. **Refactoring is safe** - Tests provide safety net
5. **Documentation is accurate** - Tests show usage

### Appendix B: Anti-Patterns to Avoid

**Testing Anti-Patterns:**
- Writing tests after code
- Testing implementation details
- Excessive mocking
- Slow, flaky tests
- Test code duplication

**Code Anti-Patterns:**
- God classes/functions
- Deep nesting (>3 levels)
- Magic numbers/strings
- Premature optimization
- Copy-paste programming

### Appendix C: Migration Path

For existing codebases without TDD:

1. **Phase 1**: Add tests for new features only
2. **Phase 2**: Add tests when fixing bugs
3. **Phase 3**: Add tests when refactoring
4. **Phase 4**: Backfill critical path tests
5. **Phase 5**: Achieve 80% coverage target

---

*This document represents the mandatory TDD workflow for all development. Non-compliance will result in PR rejection and pipeline failure.*