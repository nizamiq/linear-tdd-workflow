# Monitor Pipeline

Check the health of the CI/CD pipeline and attempt automatic remediation.

## Usage
```
/monitor-pipeline [--full] [--report=<json|markdown>]
```

## Description
This command triggers the **GUARDIAN** agent to monitor the current state of the pipeline, detect failures or anomalies, and, if possible, apply automatic fixes. It returns a summary of the pipeline health.

## Parameters
- `--full`: Perform a complete pipeline check, including performance metrics. Without this flag, the agent runs a lightweight status check.
- `--report`: Format of the output report (default: markdown).

## Output
- Pipeline status (green/red)
- Summary of failures and attempted fixes
- Recommendations or tasks created in Linear

## Example
```
/monitor-pipeline --full --report=json
```
