# `/audit-test-mapping` Command

Audits the mapping between test files and project specifications, identifying orphaned tests and unmapped requirements.

## Purpose

The test mapping auditor provides comprehensive analysis of how well your test suite covers your documented specifications and requirements. It helps identify:

- Tests that don't map to any specifications (orphaned tests)
- Specifications that lack test coverage (unmapped specs)
- Coverage gaps and quality issues
- Opportunities for test suite optimization

## Usage

```bash
# Basic audit
/audit-test-mapping

# Detailed audit with recommendations
/audit-test-mapping --detailed

# Focus on specific module
/audit-test-mapping --module auth

# Generate markdown report
/audit-test-mapping --output markdown

# Include coverage data
/audit-test-mapping --with-coverage
```

### Parameters

- `--module <name>` - Focus audit on specific module or component
- `--detailed` - Include detailed analysis and recommendations
- `--output <format>` - Output format: `json`, `markdown`, or `console` (default)
- `--with-coverage` - Include coverage metrics in the analysis
- `--threshold <number>` - Coverage threshold for gap detection (default: 80)

## What It Analyzes

### 1. Test Discovery
- Finds all test files in the project
- Extracts test cases and descriptions
- Identifies tested modules from imports and file structure

### 2. Specification Mapping
- Parses documentation for requirements
- Maps test descriptions to specifications
- Identifies confidence levels for mappings

### 3. Coverage Analysis
- Loads coverage data from Jest, pytest, or other tools
- Calculates coverage percentages per module
- Identifies low-coverage areas

### 4. Gap Detection
- Finds orphaned tests (no matching specs)
- Identifies unmapped specifications (no tests)
- Prioritizes gaps by criticality

## Example Output

### Console Format
```
🗺️  Test-to-Specification Mapping Audit

📊 Summary
─────────
Total Test Files: 45
Total Test Cases: 312
Mapped Specifications: 78
Orphaned Tests: 3
Unmapped Specifications: 12

🔍 Analysis by Language
─────────────────────
JavaScript/TypeScript: 38 files
Python: 7 files

📈 Coverage Distribution
──────────────────────
Excellent (≥90%): 15 files
Good (80-89%): 20 files
Fair (60-79%): 8 files
Poor (<60%): 2 files

⚠️  Issues Found
──────────────
1. Orphaned test: auth.test.js (no matching specs)
2. Unmapped spec: USER-AUTHENTICATION-001
3. Low coverage: payment.js (45%)
```

### JSON Format
```json
{
  "tests": [
    {
      "file": "src/auth/auth.test.js",
      "language": "javascript",
      "tests": [
        {"name": "should authenticate valid user", "line": 15},
        {"name": "should reject invalid credentials", "line": 25}
      ],
      "testedModule": "../auth.js",
      "specifications": [
        {"id": "AUTH-001", "description": "User authentication", "matched": true}
      ]
    }
  ],
  "orphanedTests": [
    {
      "file": "src/utils/helper.test.js",
      "reason": "No matching specifications found",
      "recommendation": "Review test purpose or update specifications"
    }
  ],
  "unmappedSpecs": [
    {
      "id": "SEC-001",
      "description": "Password encryption requirements",
      "priority": "HIGH",
      "recommendation": "Create tests for this requirement"
    }
  ]
}
```

### Markdown Format
```markdown
# Test-to-Specification Mapping Report

## Summary
- **Total Test Files**: 45
- **Total Test Cases**: 312
- **Mapped Specifications**: 78
- **Orphaned Tests**: 3
- **Unmapped Specifications**: 12

## Orphaned Tests
These test files do not map to any specifications:

- **helper.test.js** (3 tests)
  - Reason: No matching specifications found
  - Action: Review test purpose or update specifications

## Unmapped Specifications
These specifications lack test coverage:

### HIGH Priority
- **SEC-001**: Password encryption requirements
- **AUTH-002**: Multi-factor authentication

### MEDIUM Priority
- **USER-003**: Profile update validation
```

## Integration

### With Coverage Analysis
When run with `--with-coverage`, the command:
- Loads coverage data from standard locations
- Maps coverage percentages to test files
- Identifies modules with insufficient coverage
- Correlates coverage gaps with specification gaps

### With Linear Tasks
The audit can be integrated with Linear task creation:
- Unmapped specifications become test creation tasks
- Orphaned tests become review/cleanup tasks
- Coverage gaps become improvement tasks

### CI/CD Integration
Add to your pipeline:
```yaml
- name: Audit Test Mapping
  run: npm run coverage:audit
  continue-on-error: true

- name: Generate Mapping Report
  run: npm run coverage:audit -- --output markdown > test-mapping-report.md
```

## Quality Gates

The audit enforces these quality standards:

### Coverage Thresholds
- Overall coverage ≥80%
- Critical path coverage ≥95%
- New feature coverage ≥90%

### Mapping Requirements
- All HIGH priority specs must have tests
- Maximum 5 orphaned test files allowed
- All security-related specs must be tested

### Recommendations
Based on analysis, the tool suggests:
- Test creation priorities
- Test cleanup opportunities
- Documentation improvements
- Coverage improvement strategies

## Best Practices

### Regular Auditing
- Run before major releases
- Include in sprint planning
- Use for technical debt assessment

### Specification Management
- Keep specifications up-to-date
- Use clear, testable language
- Include priority indicators

### Test Organization
- Follow consistent naming conventions
- Group related tests logically
- Document test purposes clearly

## Troubleshooting

### Common Issues

**No tests found**
- Check test file patterns
- Verify ignore patterns aren't too broad
- Ensure test files follow naming conventions

**Poor mapping quality**
- Improve test descriptions
- Use clearer specification language
- Check keyword matching patterns

**Coverage data missing**
- Run tests with coverage first
- Check coverage output location
- Verify coverage tool configuration

**High orphaned test count**
- Review test purposes
- Update specifications
- Consider test consolidation

## Related Commands

- [`/validate-coverage`](./validate-coverage.md) - Validate coverage against specs
- [`/tdd-check`](./tdd-check.md) - Check TDD compliance
- [`/coverage-journey`](./coverage-journey.md) - Full coverage verification journey

## Files Generated

- `reports/test-mapping-audit-YYYYMMDD-HHMMSS.json` - Detailed audit results
- `reports/test-mapping-audit-YYYYMMDD-HHMMSS.md` - Human-readable report
- `.coverage-audit-cache.json` - Cache for faster subsequent runs