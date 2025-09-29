---
name: release
description: Manage production release with comprehensive validation
subagent: strategist
---

# /release - Production Release Management

Orchestrate a production release with comprehensive validation and deployment checklist using the STRATEGIST agent.

## Usage
```
/release <version> [--type=<major|minor|patch>] [--skip-uat]
```

## Parameters
- `version`: Required. Version number (e.g., 1.2.0)
- `--type`: Release type for automatic versioning (default: patch)
- `--skip-uat`: Skip UAT phase (NOT recommended, requires approval)

## What This Command Does
The STRATEGIST agent will:
1. Create release branch following GitFlow
2. Coordinate comprehensive pre-flight checklist
3. Orchestrate UAT preparation and execution
4. Manage quality gate validation
5. Execute deployment procedures
6. Perform post-deployment validation

## Expected Output
- **Release Branch**: Properly created release/version branch
- **Deployment Checklist**: Complete pre-flight validation
- **UAT Report**: Testing results and stakeholder sign-off
- **Quality Gates**: All gates passed with evidence
- **Deployment Status**: Successful deployment confirmation
- **Post-Deployment Report**: Health checks and monitoring

## Examples
```bash
# Standard patch release
/release 1.2.1

# Major version release
/release 2.0.0 --type=major

# Emergency hotfix (skip UAT with approval)
/release 1.2.2 --type=patch --skip-uat
```

## Release Process
1. **Preparation**: Create release branch, version bump, changelog
2. **Validation**: Run comprehensive quality gates
3. **UAT**: Execute user acceptance testing
4. **Approval**: Obtain stakeholder sign-offs
5. **Deployment**: Execute production deployment
6. **Verification**: Post-deployment validation

## Checklist Categories
- Code Review & Testing
- Configuration & Security
- Performance & Documentation
- Data Protection & Recovery
- Communication & Monitoring

## Required Approvals
- Technical Lead
- Product Owner
- Change Advisory Board (if applicable)