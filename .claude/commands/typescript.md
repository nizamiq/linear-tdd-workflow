---
name: typescript
description: TypeScript development with advanced type system, React/Next.js, and end-to-end type safety. Use PROACTIVELY for TypeScript migration, type system design, or React architecture.
agent: TYPESCRIPT-PRO
usage: "/typescript [--task=<types|react|api|migration|testing>] [--strict] [--monorepo]"
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash, mcp__context7__*]
argument-hint: "[--task=types|react|api|migration|testing|optimization|all] [--strict] [--monorepo]"
parameters:
  - name: task
    description: TypeScript task type
    type: string
    options: [types, react, api, migration, testing, optimization, all]
    default: all
  - name: strict
    description: Enable strictest type checking
    type: boolean
    default: true
  - name: monorepo
    description: Configure for monorepo
    type: boolean
    default: false
---

# /typescript - TypeScript & Type Safety Excellence

Expert TypeScript 5.x development with the TYPESCRIPT-PRO agent, specializing in advanced type systems and React/Next.js architectures.

## Usage
```
/typescript [--task=<types|react|api|migration|testing>] [--strict] [--monorepo]
```

## Parameters
- `--task`: Development focus - types, react, api, migration, testing, optimization, or all (default: all)
- `--strict`: Enable strictest TypeScript settings (default: true)
- `--monorepo`: Configure for monorepo with Turborepo (default: false)

## What This Command Does
The TYPESCRIPT-PRO agent will:
1. Design advanced type systems with branded types
2. Implement React/Next.js with full type safety
3. Create end-to-end type safe APIs with tRPC
4. Add runtime validation with Zod
5. Configure Prisma for database type safety
6. Set up Vitest for type-safe testing
7. Optimize build with Vite/esbuild
8. Migrate JavaScript to strict TypeScript

## Expected Output
- **Type Definitions**: Comprehensive type system
- **React Components**: Type-safe, polymorphic components
- **API Types**: tRPC routers with full inference
- **Validation Schemas**: Zod schemas for runtime safety
- **Test Suite**: Vitest tests with type safety
- **Build Configuration**: Optimized tsconfig and Vite
- **Migration Plan**: JS to TS conversion guide
- **Documentation**: Type utilities and patterns

## Examples
```bash
# Full TypeScript setup
/typescript --strict

# Advanced type system design
/typescript --task=types

# React/Next.js architecture
/typescript --task=react

# Type-safe API with tRPC
/typescript --task=api

# JavaScript to TypeScript migration
/typescript --task=migration --strict

# Monorepo setup
/typescript --monorepo

# Testing with Vitest
/typescript --task=testing
```

## TypeScript Patterns

### Type System
- Branded types for domain modeling
- Template literal types
- Conditional types
- Mapped types
- Discriminated unions

### React Patterns
- Polymorphic components
- Type-safe context
- Server components
- Hook patterns
- Compound components

### API Safety
- tRPC for end-to-end types
- Zod for validation
- Prisma for database
- GraphQL codegen
- OpenAPI types

### Testing
- Vitest framework
- Type-safe mocks
- Testing Library
- Snapshot testing
- E2E with Playwright

## Build Tools
- **Vite**: Fast bundling
- **esbuild**: Lightning-fast transpilation
- **SWC**: Rust-based compiler
- **Turborepo**: Monorepo builds
- **tsup**: Library bundling

## Best Practices
- No explicit any types
- Strict null checks
- Exhaustive switches
- Const assertions
- Type inference over annotation

## Integration
- **Next.js**: Full-stack React
- **Prisma**: Type-safe ORM
- **tRPC**: End-to-end types
- **Zod**: Runtime validation
- **Tailwind**: Type-safe styles

## Performance Targets
- Type coverage: 100%
- Bundle size: <200KB gzipped
- Build time: <10s
- HMR: <50ms
- Type checking: <5s

## SLAs
- Type system design: ≤15 minutes
- Component creation: ≤10 minutes
- API setup: ≤20 minutes
- Full migration: ≤45 minutes