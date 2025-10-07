# 🧪 TDD Reminder Card

**Quick Reference for Test-Driven Development**

## The Sacred TDD Cycle

Before running `/fix`, remember these non-negotiable steps:

### 1. [RED] - Write Failing Test First

```javascript
// ❌ WRONG: Writing production code first
function calculateTax(income) {
  return income * 0.25;
}

// ✅ CORRECT: Write the test FIRST
test('calculates tax for high income bracket', () => {
  expect(calculateTax(100000)).toBe(25000);
});
// This test FAILS because calculateTax() doesn't exist yet
```

**Why**: The failing test defines what the code should do before you write it.

### 2. [GREEN] - Minimal Code to Pass

```javascript
// Write the SIMPLEST code that makes the test pass
function calculateTax(income) {
  return income * 0.25; // Minimal implementation
}
// Now the test PASSES
```

**Why**: Minimal code prevents over-engineering and keeps focus on current requirement.

### 3. [REFACTOR] - Improve Design

```javascript
// Now improve the design while keeping tests green
const TAX_RATE = 0.25;

function calculateTax(income) {
  validateIncome(income);
  return income * TAX_RATE;
}

function validateIncome(income) {
  if (income < 0) throw new Error('Income cannot be negative');
}
```

**Why**: Refactoring with passing tests ensures you don't break functionality.

## Non-Negotiable Requirements

### Coverage Gates (BLOCKING)

- **≥80% diff coverage** on all changed lines
- **≥30% mutation score** (tests must actually validate behavior)
- **NO production code** without a failing test first

### Quality Standards

- All tests must pass before commit
- Tests must be isolated (no dependencies between tests)
- Tests must be fast (<1 second per test)
- Tests must have descriptive names

## Why This Matters

### 1. **Tests as Documentation**

Tests explain what the code should do better than comments:

```javascript
// Instead of this comment:
// This function calculates tax based on income

// Write this test:
test('calculates 25% tax for income over $50k', () => {
  expect(calculateTax(60000)).toBe(15000);
});
```

### 2. **Confidence to Change Code**

With comprehensive tests, you can refactor without fear:

```javascript
// Before: Spaghetti code, afraid to touch
function processOrder(order) {
  // 200 lines of tangled logic
}

// After TDD: Clean code with tests backing every behavior
function processOrder(order) {
  validateOrder(order);
  calculateTotal(order);
  applyDiscounts(order);
  processPayment(order);
}
// Each function has 5+ tests validating behavior
```

### 3. **Better Design**

TDD forces you to write testable code, which is usually better designed:

```javascript
// ❌ Hard to test (tight coupling)
class OrderProcessor {
  process() {
    const db = new Database(); // Hardcoded dependency
    db.save(this.order);
  }
}

// ✅ Easy to test (dependency injection)
class OrderProcessor {
  constructor(database) {
    this.database = database; // Injected dependency
  }

  process() {
    this.database.save(this.order);
  }
}
// Can easily mock database in tests
```

### 4. **Automatic High Coverage**

TDD gives you ≥80% coverage for free because you can't write production code without a test.

## The EXECUTOR Agent Enforces This

When you run `/fix CLEAN-123`, the EXECUTOR agent will:

1. ✅ Refuse to write production code before tests
2. ✅ Verify each phase of the TDD cycle (RED → GREEN → REFACTOR)
3. ✅ Check coverage: ≥80% diff coverage
4. ✅ Check mutation score: ≥30%
5. ✅ Block commits that don't meet quality gates
6. ✅ Label commits with TDD phase: [RED], [GREEN], [REFACTOR]

**You cannot bypass this. It's built into the system.**

## Common Mistakes to Avoid

### ❌ Writing Tests After Code

```javascript
// Wrong: Code first, then tests
function calculateTax(income) {
  return income * 0.25;
}
test('tax calculation', () => {
  expect(calculateTax(100)).toBe(25);
});
```

**Problem**: Test doesn't drive design, becomes an afterthought.

### ❌ Skipping RED Phase

```javascript
// Wrong: Test passes immediately (no RED phase)
test('returns empty array', () => {
  expect([]).toEqual([]); // This always passes!
});
```

**Problem**: You didn't verify the test can fail, so it might not be testing anything.

### ❌ Over-Engineering in GREEN Phase

```javascript
// Wrong: Adding features not covered by current test
function calculateTax(income) {
  if (income < 0) throw new Error('Invalid'); // Not tested yet!
  if (income > 1000000) return income * 0.35; // Not tested yet!
  return income * 0.25;
}
```

**Problem**: Writing code without tests = untested code = bugs.

### ❌ Refactoring Without Passing Tests

```javascript
// Wrong: Refactoring while tests are failing
test('calculates tax', () => {
  expect(calculateTax(100)).toBe(25); // ❌ FAILING
});

// Don't refactor now! Fix the test first.
```

**Problem**: Can't tell if refactoring broke something if tests are already failing.

## TDD Cycle Examples

### Example 1: String Utility

**[RED]** - Failing test:

```javascript
test('capitalizes first letter of each word', () => {
  expect(capitalize('hello world')).toBe('Hello World');
});
// ❌ FAILS: capitalize is not defined
```

**[GREEN]** - Minimal code:

```javascript
function capitalize(str) {
  return str
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
// ✅ PASSES
```

**[REFACTOR]** - Improve:

```javascript
function capitalize(str) {
  if (!str) return '';
  return str.split(' ').map(capitalizeWord).join(' ');
}

function capitalizeWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
// ✅ STILL PASSES (refactored with safety net)
```

### Example 2: API Client

**[RED]** - Failing test:

```javascript
test('fetches user by id', async () => {
  const api = new ApiClient();
  const user = await api.getUser(123);
  expect(user.id).toBe(123);
});
// ❌ FAILS: ApiClient not implemented
```

**[GREEN]** - Minimal code:

```javascript
class ApiClient {
  async getUser(id) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
}
// ✅ PASSES
```

**[REFACTOR]** - Improve:

```javascript
class ApiClient {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async getUser(id) {
    return this.get(`users/${id}`);
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseUrl}/${endpoint}`);
    if (!response.ok) throw new Error('API Error');
    return response.json();
  }
}
// ✅ STILL PASSES (better design, testable)
```

## Quick Checklist

Before running `/fix CLEAN-XXX`, verify:

- [ ] I understand the requirement from the Linear task
- [ ] I will write a FAILING test FIRST
- [ ] I will write MINIMAL code to pass the test
- [ ] I will REFACTOR with passing tests
- [ ] I will achieve ≥80% diff coverage
- [ ] I will achieve ≥30% mutation score
- [ ] I will NOT write production code without a failing test

## Resources

- **EXECUTOR Agent**: `.claude/agents/executor.md` - Full TDD enforcement rules
- **User's CLAUDE.md**: Global TDD protocol and principles
- **TDD Workflow**: `.claude/docs/TDD-WORKFLOW.md` - Comprehensive guide
- **Testing Strategy**: See agents for framework-specific testing patterns

## Remember

> "TDD is not about testing. It's about design, confidence, and documentation through executable specifications."
> — Kent Beck (creator of TDD)

**The `/fix` command makes TDD automatic. Trust the process.**
