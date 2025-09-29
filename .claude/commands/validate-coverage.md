# validate-coverage

Verify test coverage against documented specifications and requirements.

## Usage

```bash
# Validate coverage against all specifications
/validate-coverage

# Validate specific module
/validate-coverage --module authentication

# Generate detailed report
/validate-coverage --detailed

# Check against specific threshold
/validate-coverage --threshold 90
```

## Description

This command analyzes project documentation to extract testable requirements and validates them against actual test coverage reports. It ensures that all documented specifications have corresponding test coverage.

## Features

- **Specification Parsing**: Extracts requirements from documentation
- **Coverage Analysis**: Analyzes test coverage reports
- **Gap Detection**: Identifies untested specifications
- **Compliance Scoring**: Generates coverage compliance score
- **Linear Integration**: Creates tasks for coverage gaps

## Quality Gates

```yaml
coverage:
  diff: 80%         # Minimum diff coverage
  overall: 80%      # Overall project coverage
  critical: 95%     # Critical path coverage
  newFeatures: 90%  # New feature coverage

mutation:
  minimum: 30%      # Mutation score threshold
  criticalCode: 50% # Higher for critical sections
```

## Output Format

```json
{
  "timestamp": "2024-12-29T...",
  "summary": {
    "specificationsCovered": 85,
    "specificationsTotal": 100,
    "coveragePercentage": 85,
    "complianceStatus": "PASS"
  },
  "gaps": [
    {
      "specification": "REQ-123",
      "description": "User authentication must support MFA",
      "testStatus": "MISSING",
      "priority": "HIGH"
    }
  ],
  "recommendations": [
    "Add tests for MFA flow",
    "Increase mutation testing coverage"
  ],
  "linearTasks": ["CLEAN-456", "CLEAN-457"]
}
```

## Options

- `--module <name>`: Validate specific module
- `--threshold <number>`: Custom coverage threshold (default: 80)
- `--detailed`: Generate detailed report with line-by-line analysis
- `--output <format>`: Output format (json|html|markdown)
- `--create-tasks`: Auto-create Linear tasks for gaps
- `--dry-run`: Preview validation without creating tasks

## Examples

### Basic Validation
```bash
/validate-coverage
```

### Module-Specific Validation
```bash
/validate-coverage --module authentication --threshold 95
```

### Full Report with Task Creation
```bash
/validate-coverage --detailed --create-tasks --output markdown
```

## Related Commands

- `/audit-test-mapping` - Map tests to specifications
- `/check-tdd-compliance` - Verify TDD principles
- `/journey-coverage` - Run full coverage verification journey

## Implementation

- **Script**: `.claude/scripts/coverage/spec-validator.js`
- **Parser**: `.claude/scripts/coverage/requirement-parser.js`
- **Analyzer**: `.claude/scripts/coverage/coverage-analyzer.js`