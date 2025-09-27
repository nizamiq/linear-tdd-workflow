# Coordinate Agents

Synchronize the activities of all agents and rebalance their workloads.

## Usage
```
/coordinate-agents [--report=<json|markdown>]
```

## Description
This command instructs the **STRATEGIST** agent to orchestrate the current tasks, resolve dependencies, and ensure optimal agent utilization. It produces a report summarizing agent activity and resource allocation.

## Parameters
- `--report`: Output format for the coordination summary (default: markdown)

## Output
- List of ongoing tasks grouped by agent
- Detected bottlenecks or conflicts and actions taken
- Updated task priorities or assignments

## Example
```
/coordinate-agents --report=json
```
