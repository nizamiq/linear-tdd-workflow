# Assess Code Quality

Perform a comprehensive code quality assessment of the current codebase.

## Usage
```
/assess-code-quality [--scope=<directory>] [--format=<json|markdown>]
```

## Description
This command triggers the **AUDITOR** agent to perform a thorough analysis of the codebase, identifying code quality issues, technical debt, and improvement opportunities.

## Parameters
- `--scope`: Limit assessment to a specific directory (default: entire project)
- `--format`: Output format for the report (default: markdown)

## Output
- Detailed quality report
- Prioritized list of issues
- Improvement recommendations
- Linear tasks created for high-priority items

## Example
```
/assess-code-quality --scope=src/components --format=json
```
