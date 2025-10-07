# Contributing to Linear TDD Workflow System

First off, thank you for considering contributing to the Linear TDD Workflow System! It's people like you that make this project such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How Can I Contribute?](#how-can-i-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Documentation Standards](#documentation-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/linear-tdd-workflow.git
   cd linear-tdd-workflow
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-org/linear-tdd-workflow.git
   ```

## Development Setup

### Prerequisites

- Node.js 18+
- npm 8+
- Git with GitFlow extension
- Linear.app account (for integration testing)

### Installation Steps

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize GitFlow**:

   ```bash
   git flow init -d
   ```

4. **Run tests to verify setup**:
   ```bash
   npm test
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **System information** (OS, Node version, etc.)
- **Relevant logs or error messages**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** explaining why this enhancement would be useful
- **Possible implementation** approach (if you have ideas)
- **Alternative solutions** you've considered

### Contributing Code

1. **Pick an issue** labeled `good first issue` or `help wanted`
2. **Comment on the issue** to claim it
3. **Create a feature branch** using GitFlow
4. **Implement your changes** following TDD principles
5. **Submit a pull request**

## Pull Request Process

### Before Submitting

1. **Follow TDD**: Write tests first ([RED]), implement ([GREEN]), refactor ([REFACTOR])
2. **Ensure all tests pass**: `npm test`
3. **Meet coverage requirements**: Diff coverage ≥80%
4. **Run linting**: `npm run lint:check`
5. **Format code**: `npm run format`
6. **Update documentation** if needed

### PR Requirements

Your pull request must:

- [ ] Have a clear, descriptive title
- [ ] Reference the issue it addresses (Fixes #123)
- [ ] Include test coverage for changes
- [ ] Pass all CI checks
- [ ] Have no merge conflicts with develop branch
- [ ] Include updated documentation if applicable

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Test written first ([RED])
- [ ] Implementation complete ([GREEN])
- [ ] Code refactored ([REFACTOR])
- [ ] All tests passing
- [ ] Coverage ≥80%

## Checklist

- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings

Fixes #(issue number)
```

## Coding Standards

### TypeScript/JavaScript

```typescript
// Use clear, descriptive names
const calculateTotalPrice = (items: Item[]): number => {
  // Implementation
};

// Not: const calc = (i) => { ... }

// Use early returns for clarity
function processData(data: Data): Result {
  if (!data) {
    return null;
  }

  if (data.invalid) {
    throw new Error('Invalid data');
  }

  // Process valid data
  return result;
}

// Document complex logic
/**
 * Calculates the priority score for a task based on multiple factors
 * @param task - The task to evaluate
 * @returns Priority score between 0-100
 */
function calculatePriority(task: Task): number {
  // Complex calculation logic
}
```

### Python

```python
def calculate_total_price(items: List[Item]) -> float:
    """Calculate the total price of items.

    Args:
        items: List of items to price

    Returns:
        Total price as float

    Raises:
        ValueError: If items list is empty
    """
    if not items:
        raise ValueError("Items list cannot be empty")

    return sum(item.price for item in items)
```

## Documentation Standards

### File Naming

- Use **kebab-case** for all documentation files
- Example: `my-new-feature.md`, not `My New Feature.md`

### Document Structure

```markdown
# Document Title

## Overview

Brief introduction (2-3 sentences)

## Table of Contents (if > 500 words)

- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1

Content with clear, concise writing

### Subsection

More detailed information

## Code Examples

\`\`\`typescript
// Complete, runnable example
const example = new Example();
example.run();
// Expected output: Success
\`\`\`

## Next Steps

- Link to related documentation
- Suggested follow-up actions
```

### Writing Style

- Use **active voice**: "The system processes requests" not "Requests are processed by the system"
- Keep sentences **under 25 words** when possible
- Use **present tense** for descriptions
- Use **imperative mood** for instructions

## Testing Requirements

### Test Structure

```typescript
describe('ComponentName', () => {
  let component: Component;

  beforeEach(() => {
    component = new Component();
  });

  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = component.method(input);

      // Assert
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      // Test edge cases
    });

    it('should handle error case', () => {
      // Test error handling
    });
  });
});
```

### Coverage Requirements

- **Unit tests**: ≥90% coverage
- **Integration tests**: Key workflows covered
- **E2E tests**: Critical user paths
- **Diff coverage**: ≥80% for PR changes

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting, no code change
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding missing tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```bash
# Feature
feat(agents): add SCHOLAR agent for pattern learning

# Bug fix
fix(executor): handle null task IDs correctly

# Documentation
docs(readme): update installation instructions

# With breaking change
feat(api): change response format

BREAKING CHANGE: Response now returns array instead of object
```

### TDD Commit Pattern

When following TDD, use these tags:

```bash
# Red phase - failing test
test(calculator): [RED] add test for division by zero

# Green phase - make test pass
feat(calculator): [GREEN] implement division by zero handling

# Refactor phase - improve code
refactor(calculator): [REFACTOR] extract validation logic
```

## Branch Naming

Follow GitFlow conventions:

- `feature/ticket-id-description` - New features
- `bugfix/ticket-id-description` - Bug fixes
- `hotfix/ticket-id-description` - Urgent production fixes
- `release/version-number` - Release preparation

Examples:

- `feature/LIN-123-add-authentication`
- `bugfix/LIN-456-fix-memory-leak`
- `release/1.2.0`

## Review Process

### For Contributors

1. **Self-review** your PR first
2. **Respond to feedback** constructively
3. **Update your PR** based on review comments
4. **Re-request review** after making changes

### For Reviewers

1. **Be constructive** and specific
2. **Suggest improvements** with examples
3. **Approve** when requirements are met
4. **Request changes** with clear explanations

## Getting Help

- **Discord**: Join our [Discord server](https://discord.gg/example)
- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Check existing issues or create new ones
- **Documentation**: Refer to [docs/REFERENCE-MASTER.md](docs/REFERENCE-MASTER.md)

## Recognition

Contributors are recognized in:

- The project README
- Release notes
- Our contributors page

Thank you for contributing to Linear TDD Workflow System! 🎉

---

_Last updated: 2024_
_Version: 1.2.0_
