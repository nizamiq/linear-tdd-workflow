---
name: feature
description: Rapid feature prototyping with generated stubs and templates. Bypasses heavy validation for fast iteration.
model: opus
role: Feature Prototyping Engine
capabilities:
  - rapid_prototyping
  - stub_generation
  - template_creation
  - quick_validation
  - feature scaffolding
priority: critical
tech_stack:
  - javascript
  - typescript
  - python
  - django
  - node.js
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
mcp_servers:
  - context7
tags:
  - feature-development
  - rapid-prototyping
  - user-value
  - fast-track
---

# /feature - Rapid Feature Prototyping

**Fast-track feature development without the overhead of full TDD process.**

## Overview

The `/feature` command enables rapid prototyping and feature development by:
- Generating stub code from simple descriptions
- Creating minimal test files
- Setting up basic file structure
- Providing quick validation
- Enabling immediate iteration

## Usage

```bash
# Basic feature prototyping
/feature add "user authentication with email login"

# Generate with specific type
/feature add "API endpoint for user profile" --type=api

# Create feature in specific directory
/feature add "admin dashboard" --path=src/admin

# Quick prototype with tests
/feature add "data export functionality" --with-tests

# Generate from template
/feature add "payment processing" --template=ecommerce
```

## Quality Tiers

### Fast Track (Default)
- Single implementation file
- Basic test stub
- Minimal validation
- Ready in minutes

### Standard Tier (--standard)
- Full file structure
- Complete test suite
- Integration examples
- Ready in hours

### Production Tier (--production)
- Full TDD cycle
- Documentation
- Error handling
- Ready for deployment

## Examples

### 1. Quick API Endpoint
```bash
/feature add "get user by ID API endpoint" --type=api
```

**Generates:**
- `src/api/users.js` - Express route implementation
- `tests/api/users.test.js` - Basic test stub
- API documentation stub
- Example usage

### 2. UI Component
```bash
/feature add "user profile card component" --type=ui
```

**Generates:**
- `src/components/UserProfileCard.jsx` - React component
- `src/components/UserProfileCard.css` - Basic styling
- `stories/UserProfileCard.stories.js` - Storybook stub
- Test file with basic assertions

### 3. Data Processing
```bash
/feature add "CSV data importer" --type=data
```

**Generates:**
- `src/importers/csvImporter.js` - CSV parsing logic
- `tests/importers/csvImporter.test.js` - Test with sample data
- Example usage and validation

## Generated File Structure

### API Features
```
src/api/
├── {featureName}.js      # Main implementation
├── {featureName}.test.js # Test stub
└── README.md             # Usage documentation
```

### UI Features
```
src/components/
├── {ComponentName}.jsx    # React component
├── {ComponentName}.css    # Styles
├── {ComponentName}.test.js # Test stub
└── stories/
    └── {ComponentName}.stories.js # Storybook
```

### Service Features
```
src/services/
├── {serviceName}.js      # Service implementation
├── {serviceName}.test.js # Test stub
└── mocks/
    └── {serviceName}Mock.js # Test mocks
```

## Quick Templates

### API Route Template
```javascript
// Generated API route
const express = require('express');
const router = express.Router();

router.get('/{endpoint}', async (req, res) => {
  try {
    // TODO: Implement logic
    res.json({ message: '{featureName} endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### React Component Template
```jsx
// Generated React component
import React from 'react';
import './{ComponentName}.css';

function {ComponentName}({ /* props */ }) {
  return (
    <div className="{component-name}">
      <h2>{ComponentName}</h2>
      {/* TODO: Implement component */}
    </div>
  );
}

export default {ComponentName};
```

### Test Stub Template
```javascript
// Generated test stub
const { {functionName} } = require('./{fileName}');

describe('{functionName}', () => {
  test('should handle basic functionality', () => {
    // TODO: Add test cases
    expect(true).toBe(true);
  });

  test('should handle error cases', () => {
    // TODO: Add error handling tests
    expect(true).toBe(true);
  });
});
```

## Available Templates

| Template | Use Case | Files Generated |
|----------|----------|----------------|
| `api` | REST endpoints | route, tests, docs |
| `ui` | React components | component, styles, stories |
| `service` | Business logic | service, tests, mocks |
| `data` | Data processing | processor, tests, samples |
| `auth` | Authentication | auth logic, middleware, tests |
| `ecommerce` | E-commerce features | cart, payment, inventory |
| `admin` | Admin panels | dashboard, CRUD, permissions |
| `analytics` | Analytics features | tracking, reports, dashboard |

## Workflow

### 1. Feature Generation
```bash
/feature add "user login functionality" --type=auth
```

### 2. Quick Implementation
Edit generated files to implement core logic
```javascript
// Edit src/auth/login.js
function loginUser(email, password) {
  // Your implementation here
}
```

### 3. Run Tests
```bash
npm test -- --testPathPattern=login
```

### 4. Quick Validation
```bash
/feature validate "user login functionality"
```

### 5. Ship (if ready)
```bash
/ship "user login functionality" --tier=fast
```

## Integration with Other Commands

### Full TDD (if needed later)
```bash
# Convert prototype to full TDD implementation
/feature convert "user login" --to-tdd
```

### Add to Release
```bash
# Include feature in next release
/release add-feature "user login functionality"
```

### Create Documentation
```bash
# Generate full documentation
/docs generate --feature="user login"
```

## Best Practices

### DO ✅
- Use for rapid prototyping and MVPs
- Generate working code quickly
- Iterate based on user feedback
- Convert to full TDD when stability needed

### DON'T ❌
- Ship critical production features without proper testing
- Use for complex system changes
- Skip validation entirely
- Leave TODO items in production code

## Success Metrics

- **Time to prototype**: <10 minutes
- **Working code**: 100% of generated code runs
- **Test coverage**: Basic tests included
- **Documentation**: Usage examples provided

## 🚀 Execution Instructions for Claude Code

When `/feature add` command is invoked:

1. **Parse Feature Description**
   - Extract main functionality
   - Identify feature type
   - Determine appropriate template

2. **Generate File Structure**
   - Create necessary directories
   - Generate stub files from templates
   - Add basic test cases

3. **Create Implementation Guide**
   - Provide step-by-step instructions
   - Include example usage
   - Suggest next steps

4. **Validate Generation**
   - Check files are created
   - Run basic syntax checks
   - Verify test structure

5. **Provide Quick Start**
   - Show generated files
   - Give implementation steps
   - Suggest validation approach

## Example Session

```bash
User: /feature add "product search API" --type=api

AI: I'll generate a product search API feature for you.

**Generated Files:**
✅ src/api/products.js - Express route implementation
✅ tests/api/products.test.js - Test stub with search examples
✅ docs/api-products.md - API documentation

**Quick Implementation:**
1. Edit src/api/products.js to implement search logic
2. Run: npm test -- --testPathPattern=products
3. Test endpoint: GET /api/products?q=searchterm

**Next Steps:**
- Implement search functionality in products.js
- Add pagination if needed
- Test with sample data
- Ready for integration testing

Your product search API stub is ready for implementation!
```

---

**Version**: 1.0
**Focus**: Rapid feature delivery
**Quality Tier**: Fast Track enabled