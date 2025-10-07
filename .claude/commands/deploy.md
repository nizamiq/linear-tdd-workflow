---
name: deploy
description: Orchestrate production deployments with progressive delivery, rollback automation, and multi-cloud support. Use PROACTIVELY for any production deployment, release coordination, or deployment automation needs.
agent: DEPLOYMENT-ENGINEER
usage: '/deploy [--environment=<env>] [--strategy=<canary|blue-green|rolling>] [--target=<gke|aks|eks|fly>]'
parameters:
  - name: environment
    description: Target environment (development, staging, production)
    type: string
    options: [development, staging, production]
    default: staging
  - name: strategy
    description: Deployment strategy to use
    type: string
    options: [canary, blue-green, rolling]
    default: rolling
  - name: target
    description: Target cloud platform
    type: string
    options: [gke, aks, eks, fly, all]
    default: gke
---

# /deploy - Production Deployment Orchestration

Orchestrate production deployments with the DEPLOYMENT-ENGINEER agent, implementing progressive delivery strategies and automated rollback capabilities.

## Usage

```
/deploy [--environment=<env>] [--strategy=<canary|blue-green|rolling>] [--target=<gke|aks|eks|fly>]
```

## Parameters

- `--environment`: Target deployment environment (default: staging)
- `--strategy`: Deployment strategy - canary, blue-green, or rolling (default: rolling)
- `--target`: Target cloud platform (default: gke)

## What This Command Does

The DEPLOYMENT-ENGINEER agent will:

1. Validate deployment readiness (tests, coverage, security scans)
2. Create deployment artifacts (containers, manifests)
3. Execute chosen deployment strategy
4. Monitor deployment health and metrics
5. Perform smoke tests and validation
6. Execute automatic rollback if needed
7. Update Linear tasks with deployment status

## Expected Output

- **Deployment Plan**: Step-by-step execution plan with rollback points
- **GitHub Actions Workflow**: Automated deployment pipeline
- **Kubernetes Manifests**: Generated deployment configurations
- **Monitoring Dashboard**: Real-time deployment metrics
- **Rollback Procedure**: Automated rollback triggers and manual procedures
- **Deployment Report**: Success metrics, performance impact, cost analysis

## Examples

```bash
# Standard rolling deployment to staging
/deploy

# Canary deployment to production on GKE
/deploy --environment=production --strategy=canary --target=gke

# Blue-green deployment to Fly.io
/deploy --environment=production --strategy=blue-green --target=fly

# Multi-cloud deployment
/deploy --environment=production --target=all
```

## Deployment Strategies

### Canary (Progressive)

- 10% traffic → validation → 50% → validation → 100%
- Automatic rollback on error rate increase
- A/B testing capabilities

### Blue-Green (Zero-downtime)

- Full environment swap
- Instant rollback capability
- Database migration coordination

### Rolling (Standard)

- Gradual pod replacement
- Resource-efficient
- Minimal disruption

## SLAs

- Deployment execution: ≤15 minutes
- Rollback time: ≤2 minutes
- Health check validation: ≤5 minutes
- Zero-downtime guarantee for blue-green
