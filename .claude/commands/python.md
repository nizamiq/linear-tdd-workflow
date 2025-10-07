---
name: python
description: Modern Python development with Python 3.12+ features, uv package management, and advanced patterns. Use PROACTIVELY for Python optimization, async programming, or modern tooling setup.
agent: PYTHON-PRO
usage: '/python [--task=<async|typing|optimization|testing|packaging>] [--modern-tools]'
parameters:
  - name: task
    description: Python task type
    type: string
    options: [async, typing, optimization, testing, packaging, refactor, all]
    default: all
  - name: modern-tools
    description: Use modern tooling (uv, ruff, mypy)
    type: boolean
    default: true
---

# /python - Modern Python Excellence

Expert Python 3.12+ development with the PYTHON-PRO agent, featuring cutting-edge tooling and advanced patterns.

## Usage

```
/python [--task=<async|typing|optimization|testing|packaging>] [--modern-tools]
```

## Parameters

- `--task`: Development focus - async, typing, optimization, testing, packaging, refactor, or all (default: all)
- `--modern-tools`: Configure uv, ruff, and mypy (default: true)

## What This Command Does

The PYTHON-PRO agent will:

1. Implement Python 3.12+ features (pattern matching, type aliases)
2. Set up modern tooling (uv package manager, ruff linter, mypy)
3. Design async/await patterns for I/O operations
4. Add comprehensive type hints for safety
5. Create property-based tests with Hypothesis
6. Optimize performance with profiling
7. Configure packaging with pyproject.toml
8. Implement functional programming patterns

## Expected Output

- **Python Code**: Type-annotated, modern Python
- **Configuration Files**: pyproject.toml, ruff.toml
- **Test Suite**: pytest with Hypothesis tests
- **Type Stubs**: .pyi files for complex types
- **Performance Report**: Profiling results
- **Package Setup**: uv.lock for reproducibility
- **CI Configuration**: GitHub Actions with modern tools
- **Documentation**: Type hints and docstrings

## Examples

```bash
# Full Python modernization
/python --modern-tools

# Async programming patterns
/python --task=async

# Type system implementation
/python --task=typing

# Performance optimization
/python --task=optimization

# Testing with Hypothesis
/python --task=testing

# Package with uv
/python --task=packaging --modern-tools
```

## Modern Python Features

### Python 3.12+ Patterns

- Pattern matching (match/case)
- Type aliases (type keyword)
- Generic types
- Structural pattern matching
- Exception groups

### Tooling Stack

- **uv**: Fast package manager (10-100x faster than pip)
- **ruff**: Fast linter and formatter
- **mypy**: Static type checking
- **pytest**: Testing framework
- **Hypothesis**: Property-based testing

### Async Patterns

- AsyncIO primitives
- Async context managers
- Async generators
- TaskGroup (3.11+)
- Exception groups

### Type Safety

- Protocols for duck typing
- TypeGuard for narrowing
- ParamSpec for decorators
- Generic types
- Literal types

## Performance

- Profiling with cProfile
- Memory optimization
- Caching strategies (lru_cache)
- Dataclasses with slots
- Vectorization with NumPy

## Best Practices

- Type hints everywhere
- Async for I/O operations
- Functional patterns
- Immutable data structures
- Comprehensive testing

## Integration

- **FastAPI**: Modern web APIs
- **Pydantic**: Data validation
- **SQLAlchemy**: Async ORM
- **Celery**: Task processing
- **OpenTelemetry**: Observability

## Performance Targets

- Type coverage: 100%
- Test coverage: >90%
- Lint score: 0 errors
- Import time: <100ms
- Memory efficiency: <50MB baseline

## SLAs

- Tool setup: ≤5 minutes
- Code optimization: ≤15 minutes
- Full refactor: ≤30 minutes
