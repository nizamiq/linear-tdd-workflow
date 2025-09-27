# Analyze Fixes

Review recently completed tasks to identify patterns and improve future performance.

## Usage
```
/analyze-fixes [--window=<days>] [--format=<json|markdown>]
```

## Description
This command triggers the **SCHOLAR** agent to analyze the outcomes of recently completed tasks (within a specified time window), extract common patterns, highlight anti-patterns, and update the knowledge base. It outputs a summary of insights and suggestions.

## Parameters
- `--window`: Time window in days to analyze (default: 7)
- `--format`: Output format for the analysis report (default: markdown)

## Output
- Identified positive patterns and anti-patterns
- Suggested improvements for future tasks
- Updated patterns catalog and metric trends

## Example
```
/analyze-fixes --window=14 --format=json
```
