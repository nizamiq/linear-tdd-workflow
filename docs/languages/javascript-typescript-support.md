# JavaScript/TypeScript Language Support

## Overview

The Linear TDD Workflow System provides comprehensive support for JavaScript and TypeScript projects, with all 20 agents capable of analyzing, testing, and improving JS/TS code following strict TDD principles.

## Version Support

### JavaScript
- **ES2020+** (Full modern JavaScript support)
- **Node.js 18+** (Recommended: Node.js 20 LTS)
- **ESM and CommonJS modules**
- **async/await and Promises**

### TypeScript
- **TypeScript 5.0+**
- **Strict type checking**
- **Decorators and experimental features**
- **JSX/TSX support for React**

## Tooling Integration

### Testing Frameworks

#### Jest (Primary)
```bash
# Installation
npm install --save-dev jest @types/jest ts-jest

# Configuration (jest.config.js)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Mocha (Alternative)
```bash
# Installation
npm install --save-dev mocha @types/mocha chai @types/chai ts-node

# Configuration (mocharc.json)
{
  "require": ["ts-node/register"],
  "extensions": ["ts"],
  "spec": ["tests/**/*.test.ts"],
  "timeout": 5000
}
```

#### Vitest (Modern Alternative)
```bash
# Installation
npm install --save-dev vitest @vitest/ui

# Configuration (vite.config.ts)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'html', 'lcov']
    }
  }
});
```

### Code Quality Tools

#### ESLint (Linting)
```bash
# Installation
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Configuration (.eslintrc.json)
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

#### Prettier (Formatting)
```bash
# Installation
npm install --save-dev prettier eslint-config-prettier

# Configuration (.prettierrc)
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

#### TypeScript Compiler
```bash
# Configuration (tsconfig.json)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Coverage Analysis

#### NYC/C8
```bash
# Installation
npm install --save-dev nyc
# or
npm install --save-dev c8

# Configuration (.nycrc.json)
{
  "all": true,
  "include": ["src/**/*.ts"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts"],
  "reporter": ["text", "lcov", "html"],
  "lines": 80,
  "functions": 80,
  "branches": 80,
  "statements": 80
}
```

## Agent-Specific JS/TS Support

### AUDITOR
- Analyzes JavaScript/TypeScript using AST
- Detects ESLint violations
- Identifies TypeScript type issues
- Checks for unused dependencies

```bash
npm run agent:invoke AUDITOR:assess-code -- --language typescript --scope src/
```

### EXECUTOR
- Implements fixes following JS/TS best practices
- Generates Jest/Mocha tests first (TDD)
- Uses Prettier for formatting
- Ensures TypeScript types are correct

```bash
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-456 --language javascript
```

### GUARDIAN
- Monitors Node.js CI/CD pipelines
- Detects Jest/Mocha failures
- Handles npm/yarn dependency issues
- Manages TypeScript compilation errors

```bash
npm run agent:invoke GUARDIAN:analyze-failure -- --language javascript --auto-fix
```

### VALIDATOR
- Runs Jest/Mocha/Vitest suites
- Performs mutation testing with Stryker
- Validates coverage thresholds
- Checks TypeScript types

```bash
npm run agent:invoke VALIDATOR:run-tests -- --suite jest --coverage --parallel
```

### OPTIMIZER
- Profiles JavaScript performance
- Optimizes bundle sizes with webpack/rollup
- Reduces memory leaks
- Improves load times

```bash
npm run agent:invoke OPTIMIZER:optimize-bundle -- --target-size 500 --split-chunks
```

## TDD Workflow for JavaScript/TypeScript

### 1. RED Phase - Write Failing Test
```typescript
// calculator.test.ts
import { Calculator } from './calculator';

describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    const calc = new Calculator();
    expect(calc.add(2, 3)).toBe(5);
  });
});
```

### 2. GREEN Phase - Minimal Implementation
```typescript
// calculator.ts
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}
```

### 3. REFACTOR Phase - Improve Code
```typescript
// calculator.ts
/**
 * A calculator class for basic arithmetic operations
 */
export class Calculator {
  /**
   * Adds two numbers together
   * @param a - First number
   * @param b - Second number
   * @returns The sum of a and b
   */
  public add(a: number, b: number): number {
    this.validateNumbers(a, b);
    return a + b;
  }

  private validateNumbers(...numbers: number[]): void {
    numbers.forEach(num => {
      if (!Number.isFinite(num)) {
        throw new Error('Invalid number provided');
      }
    });
  }
}
```

## Fix Pack Examples for JavaScript/TypeScript

### 1. Linting & Formatting
```javascript
// Before
const  calculate = function(items,taxRate){
  let total=0
  for(let i=0;i<items.length;i++){
    total+=items[i].price}
  return total*taxRate
}

// After (ESLint + Prettier applied)
const calculate = (items: Item[], taxRate: number): number => {
  let total = 0;
  for (const item of items) {
    total += item.price;
  }
  return total * taxRate;
};
```

### 2. TypeScript Types Addition
```typescript
// Before
function processData(data, config) {
  const results = [];
  for (const item of data) {
    if (validate(item, config)) {
      results.push(transform(item));
    }
  }
  return results;
}

// After
interface DataItem {
  id: string;
  value: unknown;
}

interface Config {
  threshold: number;
  enabled: boolean;
}

function processData(data: DataItem[], config: Config): DataItem[] {
  const results: DataItem[] = [];
  for (const item of data) {
    if (validate(item, config)) {
      results.push(transform(item));
    }
  }
  return results;
}
```

### 3. JSDoc Documentation
```javascript
// Before
function calculateMetrics(data) {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
  return { mean, variance };
}

// After
/**
 * Calculate statistical metrics for a dataset
 * @param {number[]} data - Array of numerical values
 * @returns {{mean: number, variance: number}} Statistical metrics
 * @throws {Error} If data array is empty
 * @example
 * const metrics = calculateMetrics([1, 2, 3, 4, 5]);
 * console.log(metrics); // { mean: 3, variance: 2 }
 */
function calculateMetrics(data) {
  if (!data.length) {
    throw new Error('Data array cannot be empty');
  }

  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
  return { mean, variance };
}
```

## Project Structure

### JavaScript Project
```
js-project/
├── src/
│   ├── index.js
│   ├── modules/
│   │   └── calculator.js
│   └── utils/
│       └── helpers.js
├── tests/
│   ├── unit/
│   │   └── calculator.test.js
│   └── integration/
│       └── app.test.js
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── package.json
└── README.md
```

### TypeScript Project
```
ts-project/
├── src/
│   ├── index.ts
│   ├── types/
│   │   └── index.d.ts
│   ├── modules/
│   │   └── calculator.ts
│   └── utils/
│       └── helpers.ts
├── tests/
│   ├── unit/
│   │   └── calculator.test.ts
│   └── integration/
│       └── app.test.ts
├── dist/
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## Configuration Files

### package.json Scripts
```json
{
  "scripts": {
    "build": "tsc",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:mutation": "stryker run",
    "lint": "eslint . --ext .js,.ts",
    "lint:fix": "eslint . --ext .js,.ts --fix",
    "format": "prettier --write \"**/*.{js,ts,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,ts,json,md}\"",
    "typecheck": "tsc --noEmit",
    "precommit": "npm run lint && npm run format:check && npm run test"
  }
}
```

### Stryker Mutation Testing
```javascript
// stryker.config.js
module.exports = {
  mutate: ['src/**/*.ts', '!src/**/*.test.ts'],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js'
  },
  coverageAnalysis: 'perTest',
  thresholds: { high: 80, low: 60, break: 30 }
};
```

## CI/CD Integration

### GitHub Actions for Node.js
```yaml
name: Node.js CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Lint code
      run: npm run lint

    - name: Check formatting
      run: npm run format:check

    - name: Type check
      run: npm run typecheck

    - name: Run tests
      run: npm test

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info

    - name: Mutation testing
      run: npm run test:mutation
```

## Common JavaScript/TypeScript Patterns

### Dependency Injection
```typescript
interface Logger {
  log(message: string): void;
}

class Service {
  constructor(private logger: Logger) {}

  doSomething(): void {
    this.logger.log('Doing something');
    // Business logic here
  }
}
```

### Factory Pattern
```typescript
interface Product {
  name: string;
  price: number;
}

class ProductFactory {
  static create(type: 'book' | 'electronics', name: string, price: number): Product {
    switch (type) {
      case 'book':
        return new Book(name, price);
      case 'electronics':
        return new Electronics(name, price);
      default:
        throw new Error(`Unknown product type: ${type}`);
    }
  }
}
```

### Async/Await Error Handling
```typescript
async function fetchData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
```

## Performance Optimization

### Bundle Size Optimization
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }
};
```

### Memory Leak Prevention
```typescript
class EventManager {
  private listeners = new WeakMap<object, Function[]>();

  on(target: object, callback: Function): void {
    const callbacks = this.listeners.get(target) || [];
    callbacks.push(callback);
    this.listeners.set(target, callbacks);
  }

  off(target: object, callback: Function): void {
    const callbacks = this.listeners.get(target) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }
}
```

## Security Best Practices

### Input Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeUserInput(input: string): string {
  // Remove any HTML tags and scripts
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### Environment Variables
```typescript
// config.ts
import dotenv from 'dotenv';

dotenv.config();

interface Config {
  apiKey: string;
  dbUrl: string;
  port: number;
}

const config: Config = {
  apiKey: process.env.API_KEY || '',
  dbUrl: process.env.DATABASE_URL || '',
  port: parseInt(process.env.PORT || '3000', 10)
};

// Validate required config
if (!config.apiKey) {
  throw new Error('API_KEY environment variable is required');
}

export default config;
```

## React/Vue/Angular Support

### React with TypeScript
```tsx
// Component.tsx
import React, { FC, useState } from 'react';

interface Props {
  title: string;
  onSubmit: (value: string) => void;
}

const Component: FC<Props> = ({ title, onSubmit }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default Component;
```

### Testing React Components
```tsx
// Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('should call onSubmit with input value', () => {
    const onSubmit = jest.fn();
    render(<Component title="Test" onSubmit={onSubmit} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'test value' } });
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalledWith('test value');
  });
});
```

## Troubleshooting

### Common Issues

1. **Module resolution errors**
   - Check tsconfig.json paths
   - Verify node_modules installation
   - Clear TypeScript cache

2. **Type errors**
   - Install @types packages
   - Check tsconfig strict settings
   - Use type assertions carefully

3. **Test failures**
   - Check test environment setup
   - Verify mock implementations
   - Review async test handling

4. **Coverage gaps**
   - Exclude generated files
   - Check branch coverage
   - Add edge case tests

## Resources

- [Jest Documentation](https://jestjs.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Testing Library](https://testing-library.com/)
- [Stryker Mutator](https://stryker-mutator.io/)