# TDD Workflow Guide - Claude Agentic Workflow System

Complete guide to mastering Test-Driven Development (TDD) with strict enforcement in the Claude Agentic Workflow System.

## Table of Contents

1. [TDD Fundamentals](#tdd-fundamentals)
2. [The Sacred Cycle](#the-sacred-cycle)
3. [TDD Enforcement Mechanisms](#tdd-enforcement-mechanisms)
4. [Practical TDD Workflow](#practical-tdd-workflow)
5. [Quality Gates Integration](#quality-gates-integration)
6. [Common TDD Patterns](#common-tdd-patterns)
7. [Advanced TDD Techniques](#advanced-tdd-techniques)
8. [Troubleshooting TDD Issues](#troubleshooting-tdd-issues)
9. [Team TDD Adoption](#team-tdd-adoption)
10. [TDD Best Practices](#tdd-best-practices)

## TDD Fundamentals

### What is Test-Driven Development?

Test-Driven Development (TDD) is a software development methodology where you write tests **before** writing the production code. The Claude Agentic Workflow System enforces this methodology strictly to ensure high code quality.

### Core TDD Principles

1. **Test First**: Always write failing tests before implementation
2. **Minimal Implementation**: Write only enough code to pass tests
3. **Continuous Refactoring**: Improve design while maintaining green tests
4. **No Code Without Tests**: Every line of production code must have corresponding tests
5. **Fast Feedback**: Run tests frequently to catch issues early

### Benefits of TDD

**Code Quality Benefits:**

- **Higher test coverage** (typically 90%+)
- **Better design** through interface-first thinking
- **Fewer bugs** due to comprehensive testing
- **Refactoring confidence** with safety net of tests

**Development Benefits:**

- **Clear requirements** expressed as executable tests
- **Faster debugging** with pinpoint failure location
- **Documentation** through living test examples
- **Reduced fear** of making changes

## The Sacred Cycle

The Claude Agentic Workflow System enforces the classic TDD cycle: **RED → GREEN → REFACTOR**

### Phase 1: RED - Write Failing Test

**Objective**: Define what the code should do by writing a test that fails

**Steps:**

1. Start TDD watch mode: `npm test:watch`
2. Write a small, focused test
3. Run the test and verify it fails for the right reason
4. Commit to the RED phase

**Example:**

```javascript
// tests/calculator.test.js
import { Calculator } from '../src/calculator';

describe('Calculator', () => {
  test('should add two numbers correctly', () => {
    const calculator = new Calculator();
    const result = calculator.add(2, 3);
    expect(result).toBe(5);
  });
});
```

**Expected Result**: Test fails because `Calculator` class doesn't exist

### Phase 2: GREEN - Make Test Pass

**Objective**: Write minimal code to make the test pass

**Steps:**

1. Write the absolute minimum code needed
2. Run tests to verify they pass
3. Resist the urge to add extra functionality
4. Commit to the GREEN phase

**Example:**

```javascript
// src/calculator.js
export class Calculator {
  add(a, b) {
    return a + b; // Minimal implementation
  }
}
```

**Expected Result**: Test passes with minimal implementation

### Phase 3: REFACTOR - Improve Design

**Objective**: Improve code quality while keeping tests green

**Steps:**

1. Identify code smells or design improvements
2. Refactor code while running tests continuously
3. Ensure all tests remain green
4. Commit to the REFACTOR phase

**Example:**

```javascript
// src/calculator.js
/**
 * Calculator utility for mathematical operations
 */
export class Calculator {
  /**
   * Adds two numbers together
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} Sum of a and b
   */
  add(a: number, b: number): number {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers');
    }
    return a + b;
  }
}
```

**Expected Result**: Tests still pass with improved implementation

## TDD Enforcement Mechanisms

### System-Level Enforcement

The Claude Agentic Workflow System enforces TDD through multiple layers:

#### 1. Pre-commit Hooks

```bash
# Automatically runs before every commit
npm run precommit

# Checks:
# - Tests exist for new/modified code
# - All tests pass
# - Coverage meets thresholds
# - No linting errors
```

#### 2. CI/CD Quality Gates

```yaml
# .github/workflows/ci.yml
- name: TDD Compliance Check
  run: npm run validate-tdd

- name: Coverage Gate
  run: npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'

- name: Mutation Testing
  run: npm run test:mutation -- --threshold 30
```

#### 3. Agent Monitoring

- **AUDITOR**: Continuously scans for untested code
- **GUARDIAN**: Blocks PRs that violate TDD principles
- **EXECUTOR**: Only implements fixes using TDD cycle
- **SCHOLAR**: Learns and improves TDD patterns

### Enforcement Configuration

Configure TDD enforcement in `.claude/settings.json`:

```json
{
  "tdd": {
    "enforcement_mode": "strict",
    "require_tests_for_new_code": true,
    "require_tests_for_modifications": true,
    "coverage_requirements": {
      "new_code": 80,
      "modified_code": 80,
      "critical_paths": 95
    },
    "exemptions": {
      "file_patterns": ["**/*.config.{js,ts}", "**/*.spec.{js,ts}", "**/scripts/**"]
    }
  }
}
```

## Practical TDD Workflow

### Daily TDD Development

#### Morning Setup

```bash
# Start your day with TDD readiness
npm test:watch              # Start TDD watch mode
npm run status             # Check system health
npm run assess             # Get quality baseline
```

#### Feature Development Loop

**1. Understand Requirements**

```bash
# Review Linear task or requirements
npm run linear:sync
# Read task description: FEAT-123
```

**2. Start with Failing Test**

```javascript
// tests/user-authentication.test.js
describe('User Authentication', () => {
  test('should validate user credentials successfully', () => {
    const auth = new UserAuthentication();
    const result = auth.validateCredentials('user@example.com', 'password123');

    expect(result).toEqual({
      success: true,
      user: {
        email: 'user@example.com',
        id: expect.any(String),
      },
    });
  });
});
```

**3. Watch Test Fail (RED)**

```bash
# In watch mode, test should fail
# Error: Cannot find module '../src/user-authentication'
```

**4. Minimal Implementation (GREEN)**

```javascript
// src/user-authentication.js
export class UserAuthentication {
  validateCredentials(email, password) {
    // Minimal hard-coded implementation
    if (email === 'user@example.com' && password === 'password123') {
      return {
        success: true,
        user: {
          email: 'user@example.com',
          id: '12345',
        },
      };
    }
    return { success: false };
  }
}
```

**5. Watch Test Pass (GREEN)**

```bash
# Test should now pass
# ✓ should validate user credentials successfully
```

**6. Add More Test Cases**

```javascript
test('should reject invalid credentials', () => {
  const auth = new UserAuthentication();
  const result = auth.validateCredentials('wrong@example.com', 'wrongpass');

  expect(result).toEqual({
    success: false,
    error: 'Invalid credentials',
  });
});

test('should reject empty credentials', () => {
  const auth = new UserAuthentication();
  const result = auth.validateCredentials('', '');

  expect(result).toEqual({
    success: false,
    error: 'Email and password are required',
  });
});
```

**7. Improve Implementation**

```javascript
// src/user-authentication.js
export class UserAuthentication {
  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  validateCredentials(email, password) {
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    const user = this.userRepository.findByEmail(email);
    if (!user || !this.verifyPassword(password, user.hashedPassword)) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    return {
      success: true,
      user: {
        email: user.email,
        id: user.id
      }
    };
  }

  private verifyPassword(password, hashedPassword) {
    // Implement actual password verification
    return hashPassword(password) === hashedPassword;
  }
}
```

**8. Refactor and Clean Up (REFACTOR)**

```javascript
// Extract interface
export interface AuthenticationResult {
  success: boolean;
  user?: {
    email: string;
    id: string;
  };
  error?: string;
}

// Add comprehensive error handling
// Add input validation
// Add logging
// Add documentation
```

### TDD with Different Testing Frameworks

#### Jest (JavaScript/TypeScript)

```javascript
// Setup in jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
```

#### pytest (Python)

```python
# tests/test_calculator.py
import pytest
from src.calculator import Calculator

class TestCalculator:
    def test_add_two_positive_numbers(self):
        calc = Calculator()
        result = calc.add(2, 3)
        assert result == 5

    def test_add_negative_numbers(self):
        calc = Calculator()
        result = calc.add(-2, -3)
        assert result == -5

    def test_add_with_zero(self):
        calc = Calculator()
        result = calc.add(5, 0)
        assert result == 5
```

```python
# src/calculator.py
class Calculator:
    def add(self, a: float, b: float) -> float:
        """Add two numbers together."""
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
            raise TypeError("Both arguments must be numbers")
        return a + b
```

## Quality Gates Integration

### Coverage Requirements

The system enforces coverage at multiple levels:

#### Line Coverage

```bash
# Check current coverage
npm test -- --coverage

# Coverage requirements:
# - New code: 80% minimum
# - Modified code: 80% minimum
# - Critical paths: 95% minimum
```

#### Branch Coverage

```javascript
// Example: Testing all branches
test('should handle all payment types', () => {
  const processor = new PaymentProcessor();

  // Test credit card branch
  expect(processor.process({ type: 'credit', amount: 100 })).toBeDefined();

  // Test debit card branch
  expect(processor.process({ type: 'debit', amount: 100 })).toBeDefined();

  // Test PayPal branch
  expect(processor.process({ type: 'paypal', amount: 100 })).toBeDefined();

  // Test invalid type branch
  expect(() => processor.process({ type: 'crypto', amount: 100 })).toThrow(
    'Unsupported payment type',
  );
});
```

### Mutation Testing

Validates test quality by introducing code mutations:

```bash
# Run mutation testing
npm run test:mutation

# Configuration in stryker.conf.js
module.exports = {
  mutator: 'typescript',
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  thresholds: {
    high: 80,
    low: 60,
    break: 30  // Minimum required score
  }
};
```

### Performance Testing Integration

```javascript
// tests/performance/api-performance.test.js
describe('API Performance', () => {
  test('should respond within 200ms', async () => {
    const start = Date.now();

    const response = await apiClient.get('/users');

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200);
    expect(response.status).toBe(200);
  });
});
```

## Common TDD Patterns

### Test Organization Patterns

#### AAA Pattern (Arrange-Act-Assert)

```javascript
test('should calculate tax correctly', () => {
  // Arrange
  const calculator = new TaxCalculator();
  const income = 50000;
  const taxRate = 0.2;

  // Act
  const tax = calculator.calculate(income, taxRate);

  // Assert
  expect(tax).toBe(10000);
});
```

#### Given-When-Then Pattern

```javascript
describe('User Registration', () => {
  test('given valid user data, when registering, then user should be created', async () => {
    // Given
    const userData = {
      email: 'user@example.com',
      password: 'securePassword123',
    };
    const userService = new UserService();

    // When
    const result = await userService.register(userData);

    // Then
    expect(result.success).toBe(true);
    expect(result.user.email).toBe(userData.email);
    expect(result.user.id).toBeDefined();
  });
});
```

### Mocking and Stubbing Patterns

#### Dependency Injection for Testability

```javascript
// src/user-service.js
export class UserService {
  constructor(userRepository = new UserRepository(), emailService = new EmailService()) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async register(userData) {
    const user = await this.userRepository.create(userData);
    await this.emailService.sendWelcomeEmail(user);
    return user;
  }
}

// tests/user-service.test.js
test('should send welcome email after registration', async () => {
  // Arrange
  const mockRepository = {
    create: jest.fn().mockResolvedValue({ id: '123', email: 'user@example.com' }),
  };
  const mockEmailService = {
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  };
  const userService = new UserService(mockRepository, mockEmailService);

  // Act
  await userService.register({ email: 'user@example.com', password: 'pass' });

  // Assert
  expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalled();
});
```

### Error Handling Patterns

#### Testing Exception Scenarios

```javascript
test('should throw error for invalid input', () => {
  const calculator = new Calculator();

  expect(() => calculator.divide(10, 0)).toThrow('Division by zero is not allowed');
});

test('should handle async errors', async () => {
  const apiClient = new ApiClient();

  await expect(apiClient.fetchUser('invalid-id')).rejects.toThrow('User not found');
});
```

## Advanced TDD Techniques

### Property-Based Testing

```javascript
// tests/calculator.property.test.js
import fc from 'fast-check';

test('addition should be commutative', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (a, b) => {
      const calc = new Calculator();
      expect(calc.add(a, b)).toBe(calc.add(b, a));
    }),
  );
});

test('addition should be associative', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), fc.integer(), (a, b, c) => {
      const calc = new Calculator();
      const result1 = calc.add(calc.add(a, b), c);
      const result2 = calc.add(a, calc.add(b, c));
      expect(result1).toBe(result2);
    }),
  );
});
```

### Test Data Builders

```javascript
// tests/builders/user-builder.js
export class UserBuilder {
  constructor() {
    this.user = {
      email: 'default@example.com',
      name: 'Default User',
      age: 25,
      active: true,
    };
  }

  withEmail(email) {
    this.user.email = email;
    return this;
  }

  withAge(age) {
    this.user.age = age;
    return this;
  }

  inactive() {
    this.user.active = false;
    return this;
  }

  build() {
    return { ...this.user };
  }
}

// Usage in tests
test('should validate adult users', () => {
  const user = new UserBuilder().withAge(21).withEmail('adult@example.com').build();

  const validator = new UserValidator();
  const result = validator.validateAge(user);

  expect(result.valid).toBe(true);
});
```

### Parameterized Tests

```javascript
// Jest parameterized tests
describe.each([
  [2, 3, 5],
  [1, 1, 2],
  [0, 5, 5],
  [-1, 1, 0],
  [-2, -3, -5],
])('Calculator.add(%i, %i)', (a, b, expected) => {
  test(`should return ${expected}`, () => {
    const calc = new Calculator();
    expect(calc.add(a, b)).toBe(expected);
  });
});
```

### Contract Testing

```javascript
// tests/contracts/api-contract.test.js
describe('User API Contract', () => {
  test('GET /users/:id should return user with required fields', async () => {
    const response = await api.get('/users/123');

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      id: expect.any(String),
      email: expect.any(String),
      name: expect.any(String),
      createdAt: expect.any(String),
    });
  });
});
```

## Troubleshooting TDD Issues

### Common TDD Problems

#### Problem: "Tests are too slow"

**Symptoms:**

- Test suite takes >30 seconds to run
- TDD cycle becomes sluggish
- Developers avoid running tests

**Solutions:**

```bash
# Run specific test files
npm test -- user-service.test.js

# Use test patterns
npm test -- --testNamePattern="should validate"

# Parallel test execution
npm test -- --maxWorkers=4

# Optimize test setup/teardown
# Use beforeAll instead of beforeEach where possible
```

#### Problem: "Coverage requirements too strict"

**Symptoms:**

- Cannot commit changes due to coverage failures
- Spending too much time writing trivial tests
- Team resistance to TDD

**Solutions:**

```json
// Temporarily lower thresholds
{
  "quality_gates": {
    "coverage": {
      "thresholds": {
        "global": {
          "lines": 70 // Gradually increase over time
        }
      }
    }
  }
}
```

#### Problem: "TDD blocking urgent fixes"

**Symptoms:**

- Production issue needs immediate fix
- TDD enforcement preventing deployment
- Time pressure conflicts with test-first approach

**Solutions:**

```bash
# Emergency bypass (use sparingly)
export CLAUDE_TDD_ENFORCEMENT=false
# Make critical fix
# Write tests immediately after
# Re-enable enforcement
export CLAUDE_TDD_ENFORCEMENT=true
```

### Debugging Test Failures

#### Analyzing Test Output

```bash
# Verbose test output
npm test -- --verbose

# Debug specific test
npm test -- --testNamePattern="user authentication" --verbose

# Run single test file with debugging
node --inspect-brk node_modules/.bin/jest --runInBand user.test.js
```

#### Common Test Anti-patterns

**❌ Testing Implementation Details**

```javascript
// Bad: Testing internal method
test('should call validateInput method', () => {
  const service = new UserService();
  const spy = jest.spyOn(service, 'validateInput');

  service.createUser({});

  expect(spy).toHaveBeenCalled(); // Testing implementation
});

// Good: Testing behavior
test('should reject invalid user data', () => {
  const service = new UserService();

  expect(() => service.createUser({})).toThrow('Invalid user data'); // Testing behavior
});
```

**❌ Overly Complex Tests**

```javascript
// Bad: Complex setup
test('should process complex user workflow', () => {
  // 50 lines of setup
  // Multiple services
  // Complex mocking
  // Testing too much at once
});

// Good: Simple, focused tests
test('should create user with valid data', () => {
  const service = new UserService();
  const userData = { email: 'test@example.com' };

  const result = service.createUser(userData);

  expect(result.success).toBe(true);
});
```

## Team TDD Adoption

### Gradual TDD Introduction

#### Phase 1: Assessment and Training (Week 1-2)

```bash
# Team assessment
npm run assess
npm run agent:invoke SCHOLAR:team-readiness-assessment

# Training resources
npm run generate:tdd-training-materials
npm run agent:invoke DOCUMENTER:tdd-best-practices
```

#### Phase 2: TDD for New Features (Week 3-6)

```json
{
  "tdd": {
    "enforcement_mode": "new_code_only",
    "coverage_requirements": {
      "new_code": 75 // Start lower
    }
  }
}
```

#### Phase 3: Legacy Code Improvement (Month 2-3)

```bash
# Identify legacy code for improvement
npm run agent:invoke AUDITOR:legacy-analysis

# Gradual test coverage increase
npm run agent:invoke STRATEGIST:plan-legacy-improvement

# Add tests to existing code
npm run generate:test-stubs -- --legacy-coverage
```

#### Phase 4: Full TDD Adoption (Month 3+)

```json
{
  "tdd": {
    "enforcement_mode": "strict",
    "coverage_requirements": {
      "new_code": 80,
      "modified_code": 80,
      "critical_paths": 95
    }
  }
}
```

### Team TDD Metrics

#### Track TDD Adoption

```bash
# TDD compliance metrics
npm run agent:invoke SCHOLAR:tdd-metrics

# Coverage trends
npm run agent:invoke ANALYZER:coverage-trends

# Team performance
npm run agent:invoke STRATEGIST:team-tdd-performance
```

**Key Metrics:**

- **TDD Compliance Rate**: % of changes following TDD cycle
- **Test Coverage Trend**: Coverage over time
- **Test Quality Score**: Mutation testing results
- **Bug Detection Rate**: Tests catching issues
- **Development Velocity**: Features delivered with TDD

## TDD Best Practices

### Golden Rules of TDD

1. **Red First**: Always write failing test before implementation
2. **Green Fast**: Write minimal code to make test pass quickly
3. **Refactor Fearlessly**: Improve code with test safety net
4. **One Test at a Time**: Focus on single behavior per test
5. **Simple Tests**: Easy to understand and maintain

### Test Quality Guidelines

#### Good Test Characteristics

- **Fast**: Runs quickly (< 100ms per test)
- **Isolated**: Independent of other tests
- **Repeatable**: Same result every time
- **Self-Validating**: Clear pass/fail result
- **Timely**: Written just before production code

#### Test Naming Conventions

```javascript
// Pattern: should_ExpectedBehavior_When_StateUnderTest
test('should_ReturnSum_When_AddingTwoPositiveNumbers', () => {
  // Test implementation
});

// Pattern: Given_Preconditions_When_StateUnderTest_Then_ExpectedBehavior
test('Given_ValidUser_When_Authenticating_Then_ReturnsSuccessResult', () => {
  // Test implementation
});

// Simple descriptive pattern
test('should calculate total price including tax', () => {
  // Test implementation
});
```

### TDD Code Review Checklist

#### Reviewing TDD Implementation

- [ ] Tests written before implementation
- [ ] Tests fail for right reasons (RED phase)
- [ ] Minimal implementation makes tests pass (GREEN phase)
- [ ] Code improved through refactoring (REFACTOR phase)
- [ ] Test coverage meets requirements
- [ ] Tests are readable and maintainable
- [ ] No testing implementation details
- [ ] Appropriate use of mocks and stubs

#### Agent-Assisted Review

```bash
# Automated TDD compliance check
npm run agent:invoke REVIEWER:tdd-compliance -- --pr-number 123

# Test quality analysis
npm run agent:invoke VALIDATOR:analyze-test-quality

# Coverage analysis
npm run agent:invoke ANALYZER:coverage-analysis
```

---

**TDD Mastery takes practice, but the Claude Agentic Workflow System provides the structure and enforcement to make it successful. Embrace the cycle, trust the process, and enjoy the benefits of higher quality code! 🚀**

**For additional TDD resources:**

- [User Guide](USER-GUIDE.md) - Complete system overview
- [FAQ](FAQ.md) - Common TDD questions
- [Troubleshooting](TROUBLESHOOTING.md) - TDD issue resolution
- [Commands Reference](COMMANDS.md) - TDD-related commands
