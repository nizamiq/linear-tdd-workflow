---
name: monitor
description: Set up comprehensive observability with OpenTelemetry, Prometheus, and Grafana. Use PROACTIVELY when deploying new services, experiencing performance issues, or needing visibility into production systems.
agent: OBSERVABILITY-ENGINEER
usage: "/monitor [--scope=<metrics|traces|logs|all>] [--target=<local|kubernetes|cloud>] [--slo]"
allowed-tools: [Read, Write, Edit, Bash, mcp__kubernetes__*]
argument-hint: "[--scope=metrics|traces|logs|dashboards|alerts|all] [--target=local|kubernetes|cloud] [--slo]"
parameters:
  - name: scope
    description: Observability scope
    type: string
    options: [metrics, traces, logs, dashboards, alerts, all]
    default: all
  - name: target
    description: Target environment
    type: string
    options: [local, kubernetes, cloud]
    default: kubernetes
  - name: slo
    description: Include SLI/SLO definitions
    type: boolean
    default: false
---

# /monitor - Production Observability Setup

Configure comprehensive observability with the OBSERVABILITY-ENGINEER agent, implementing OpenTelemetry instrumentation, metrics collection, and intelligent alerting.

## Usage
```
/monitor [--scope=<metrics|traces|logs|all>] [--target=<local|kubernetes|cloud>] [--slo]
```

## Parameters
- `--scope`: Focus area - metrics, traces, logs, dashboards, alerts, or all (default: all)
- `--target`: Environment - local, kubernetes, or cloud deployment (default: kubernetes)
- `--slo`: Include SLI/SLO definitions with error budgets (default: false)

## What This Command Does
The OBSERVABILITY-ENGINEER agent will:
1. Instrument code with OpenTelemetry
2. Configure Prometheus metrics collection
3. Create Grafana dashboards
4. Set up distributed tracing with Jaeger
5. Implement log aggregation and correlation
6. Define SLI/SLO with error budgets
7. Create intelligent alerting rules
8. Generate runbooks for incidents

## Expected Output
- **Instrumentation Code**: OpenTelemetry setup for metrics, traces, logs
- **Metric Definitions**: Prometheus recording rules and scrapers
- **Dashboard JSON**: Production-ready Grafana dashboards
- **Alert Configuration**: Intelligent alerts with severity levels
- **SLO Definitions**: Service level objectives with error budgets
- **Trace Configuration**: Distributed tracing setup
- **Log Pipeline**: Structured logging with correlation
- **Documentation**: Observability guide and runbooks

## Examples
```bash
# Full observability stack setup
/monitor

# Focus on metrics and dashboards
/monitor --scope=metrics

# Set up tracing for Kubernetes
/monitor --scope=traces --target=kubernetes

# Define SLIs and SLOs
/monitor --slo

# Cloud-native monitoring setup
/monitor --target=cloud --slo
```

## Observability Components

### Metrics Collection
- Application metrics (RED method)
- Infrastructure metrics
- Business KPIs
- Custom metrics

### Distributed Tracing
- Request flow visualization
- Latency analysis
- Dependency mapping
- Error propagation

### Log Aggregation
- Structured logging
- Log correlation with traces
- Search and analytics
- Retention policies

### Alerting Strategy
- Symptom-based alerts
- Multi-window alerts
- Alert routing
- Escalation policies

## Integration Points
- **Django/Python**: Django middleware, Celery instrumentation
- **TypeScript/Node**: Express middleware, async tracing
- **Kubernetes**: ServiceMonitor, PrometheusRule
- **Cloud Providers**: GCP Monitoring, Azure Monitor, AWS CloudWatch

## Performance Impact
- Instrumentation overhead: <2% CPU
- Memory usage: ~50MB per service
- Network overhead: <1% bandwidth
- Storage: ~5GB/million spans

## SLAs
- Dashboard creation: ≤10 minutes
- Alert setup: ≤5 minutes
- Full instrumentation: ≤30 minutes