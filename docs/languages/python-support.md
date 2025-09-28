# Python Language Support

## Overview

The Linear TDD Workflow System provides comprehensive support for Python projects, with all 20 agents capable of analyzing, testing, and improving Python code following strict TDD principles.

## Version Support

- **Python 3.8+** (Recommended: Python 3.10+)
- **Full async/await support**
- **Type hints and annotations**
- **Modern Python features**

## Tooling Integration

### Testing Frameworks

#### pytest (Primary)
```bash
# Installation
pip install pytest pytest-cov pytest-mock pytest-asyncio

# Configuration (pytest.ini)
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = --cov=src --cov-report=html --cov-report=term
```

#### unittest (Alternative)
```bash
# Built into Python standard library
python -m unittest discover -s tests -p "test_*.py"
```

### Code Quality Tools

#### Black (Formatting)
```bash
# Installation
pip install black

# Configuration (pyproject.toml)
[tool.black]
line-length = 88
target-version = ['py310']
include = '\.pyi?$'
```

#### Ruff (Linting)
```bash
# Installation
pip install ruff

# Configuration (ruff.toml)
[tool.ruff]
line-length = 88
select = ["E", "F", "B", "W", "I", "N", "UP"]
ignore = ["E501"]
target-version = "py310"
```

#### mypy (Type Checking)
```bash
# Installation
pip install mypy

# Configuration (mypy.ini)
[mypy]
python_version = 3.10
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
```

### Coverage Analysis

#### coverage.py
```bash
# Installation
pip install coverage

# Usage
coverage run -m pytest
coverage report
coverage html
```

## Agent-Specific Python Support

### AUDITOR
- Analyzes Python code using AST parsing
- Detects Python-specific anti-patterns
- Checks PEP 8 compliance
- Identifies type hint issues

```bash
npm run agent:invoke AUDITOR:assess-code -- --language python --scope src/
```

### EXECUTOR
- Implements fixes following Python best practices
- Generates pytest tests first (TDD)
- Uses Black for formatting
- Ensures type hints are maintained

```bash
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123 --language python
```

### GUARDIAN
- Monitors Python CI/CD pipelines
- Detects pytest failures
- Handles pip dependency issues
- Manages virtual environment problems

```bash
npm run agent:invoke GUARDIAN:analyze-failure -- --language python --auto-fix
```

### VALIDATOR
- Runs pytest suites
- Performs mutation testing with mutmut
- Validates coverage thresholds
- Checks type annotations

```bash
npm run agent:invoke VALIDATOR:run-tests -- --suite pytest --coverage
```

### OPTIMIZER
- Profiles Python code with cProfile
- Optimizes algorithm complexity
- Reduces memory usage
- Improves import times

```bash
npm run agent:invoke OPTIMIZER:profile-performance -- --language python --type memory
```

## TDD Workflow for Python

### 1. RED Phase - Write Failing Test
```python
# test_calculator.py
import pytest
from src.calculator import Calculator

def test_add_two_numbers():
    calc = Calculator()
    result = calc.add(2, 3)
    assert result == 5
```

### 2. GREEN Phase - Minimal Implementation
```python
# src/calculator.py
class Calculator:
    def add(self, a: int, b: int) -> int:
        return a + b
```

### 3. REFACTOR Phase - Improve Code
```python
# src/calculator.py
from typing import Union

Number = Union[int, float]

class Calculator:
    """A simple calculator class for basic arithmetic operations."""

    def add(self, a: Number, b: Number) -> Number:
        """
        Add two numbers together.

        Args:
            a: First number
            b: Second number

        Returns:
            Sum of a and b
        """
        return a + b
```

## Fix Pack Examples for Python

### 1. Linting & Formatting
```python
# Before
def calculate_total(items,tax_rate):
    total=0
    for item in items:
        total+=item.price
    return total*tax_rate

# After (Black + Ruff applied)
def calculate_total(items: list, tax_rate: float) -> float:
    """Calculate total price including tax."""
    total = 0
    for item in items:
        total += item.price
    return total * tax_rate
```

### 2. Type Hints Addition
```python
# Before
def process_data(data, config):
    results = []
    for item in data:
        if validate(item, config):
            results.append(transform(item))
    return results

# After
from typing import List, Dict, Any

def process_data(
    data: List[Dict[str, Any]],
    config: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Process and transform valid data items."""
    results: List[Dict[str, Any]] = []
    for item in data:
        if validate(item, config):
            results.append(transform(item))
    return results
```

### 3. Docstring Addition
```python
# Before
def calculate_metrics(data):
    mean = sum(data) / len(data)
    variance = sum((x - mean) ** 2 for x in data) / len(data)
    return mean, variance

# After
def calculate_metrics(data: List[float]) -> Tuple[float, float]:
    """
    Calculate statistical metrics for the given data.

    Args:
        data: List of numerical values

    Returns:
        Tuple containing (mean, variance)

    Raises:
        ValueError: If data is empty
    """
    if not data:
        raise ValueError("Data cannot be empty")

    mean = sum(data) / len(data)
    variance = sum((x - mean) ** 2 for x in data) / len(data)
    return mean, variance
```

## Project Structure

```
python-project/
├── src/
│   ├── __init__.py
│   ├── main.py
│   └── modules/
│       ├── __init__.py
│       └── calculator.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   └── test_calculator.py
│   └── integration/
│       └── test_main.py
├── pyproject.toml
├── requirements.txt
├── requirements-dev.txt
├── pytest.ini
├── mypy.ini
├── .ruff.toml
└── .coverage.rc
```

## Configuration Files

### pyproject.toml
```toml
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "linear-tdd-python"
version = "1.3.0"
requires-python = ">=3.8"
dependencies = []

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "pytest-cov>=4.0",
    "black>=23.0",
    "ruff>=0.1.0",
    "mypy>=1.0",
]

[tool.black]
line-length = 88
target-version = ['py310']

[tool.ruff]
line-length = 88
select = ["E", "F", "B", "W", "I", "N", "UP"]
```

### requirements-dev.txt
```
pytest>=7.4.0
pytest-cov>=4.1.0
pytest-mock>=3.11.1
pytest-asyncio>=0.21.1
black>=23.7.0
ruff>=0.1.0
mypy>=1.5.0
coverage>=7.3.0
mutmut>=2.4.3
```

## CI/CD Integration

### GitHub Actions for Python
```yaml
name: Python CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.8, 3.9, 3.10, 3.11]

    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements-dev.txt

    - name: Format check with Black
      run: black --check src tests

    - name: Lint with Ruff
      run: ruff check src tests

    - name: Type check with mypy
      run: mypy src

    - name: Test with pytest
      run: pytest --cov=src --cov-report=xml

    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## Common Python Patterns

### Dependency Injection
```python
from typing import Protocol

class DatabaseProtocol(Protocol):
    def query(self, sql: str) -> list:
        ...

class Service:
    def __init__(self, db: DatabaseProtocol):
        self.db = db

    def get_users(self) -> list:
        return self.db.query("SELECT * FROM users")
```

### Context Managers
```python
from contextlib import contextmanager

@contextmanager
def database_connection():
    conn = create_connection()
    try:
        yield conn
    finally:
        conn.close()
```

### Decorators
```python
import functools
import time

def timing_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.2f} seconds")
        return result
    return wrapper
```

## Performance Optimization

### Profiling
```bash
# Using cProfile
python -m cProfile -o profile.stats src/main.py

# Using line_profiler
pip install line_profiler
kernprof -l -v src/main.py
```

### Memory Optimization
```python
# Use generators for large datasets
def read_large_file(file_path):
    with open(file_path) as f:
        for line in f:
            yield line.strip()

# Use slots for classes
class Point:
    __slots__ = ['x', 'y']

    def __init__(self, x, y):
        self.x = x
        self.y = y
```

## Security Best Practices

### Input Validation
```python
from typing import Optional
import re

def validate_email(email: str) -> Optional[str]:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(pattern, email):
        return email
    return None
```

### Safe File Operations
```python
import os
from pathlib import Path

def safe_file_read(file_path: str) -> str:
    safe_path = Path(file_path).resolve()
    base_path = Path.cwd()

    if not safe_path.is_relative_to(base_path):
        raise ValueError("Path traversal attempt detected")

    with open(safe_path) as f:
        return f.read()
```

## Troubleshooting

### Common Issues

1. **Import errors**
   - Check PYTHONPATH
   - Verify virtual environment activation
   - Ensure __init__.py files exist

2. **Type checking failures**
   - Install type stubs: `pip install types-requests`
   - Use `# type: ignore` sparingly
   - Check mypy configuration

3. **Test discovery issues**
   - Follow naming conventions (test_*.py)
   - Check pytest.ini configuration
   - Verify test directory structure

4. **Coverage gaps**
   - Exclude generated code in .coveragerc
   - Use `# pragma: no cover` for unreachable code
   - Check for missing test files

## Resources

- [Python Testing 101](https://realpython.com/python-testing/)
- [Black Documentation](https://black.readthedocs.io/)
- [Ruff Documentation](https://docs.astral.sh/ruff/)
- [mypy Documentation](https://mypy.readthedocs.io/)
- [pytest Documentation](https://docs.pytest.org/)