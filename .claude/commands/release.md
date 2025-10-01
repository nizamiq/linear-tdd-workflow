---
name: release
description: Manage production release with comprehensive validation
agent: STRATEGIST
usage: "/release <version> [--dry-run] [--force]"
parameters:
  - name: version
    description: Version number (semver format, e.g., 1.2.3)
    type: string
    required: true
  - name: dry-run
    description: Preview release without executing
    type: boolean
    required: false
  - name: force
    description: Skip some validation checks
    type: boolean
    required: false
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
2. **Pre-Flight Checks**: Run comprehensive quality gates
3. **🎯 Functional Readiness Gate (Phase 2.5)**: Validate all implemented features have passing E2E tests
4. **UAT**: Execute user acceptance testing
5. **Approval**: Obtain stakeholder sign-offs
6. **Deployment**: Execute production deployment
7. **Verification**: Post-deployment validation

### Phase 2.5: Functional Release Gate
**Automated validation that ensures functional release quality:**
- All features marked as `implemented` in user story registry must have E2E tests
- All E2E tests must pass
- Features with `partial` status (implemented but no E2E test) **block the release**
- Features with `planned` status do not block

**Manual validation:** Run the functional gate manually anytime:
```bash
npm run release:validate-functional
# or
make release-check
```

**Registry management:**
```bash
# Check current coverage status
npm run release:user-stories

# Add new feature to registry
npm run release:add-story

# Validate E2E test metadata
npm run e2e:validate
```

**What blocks a release:**
- Any implemented feature without E2E test specified
- Any E2E test failure
- Any feature with `partial` status (implemented but lacks E2E coverage)

**Registry location:** `.claude/user-stories/registry.yaml`

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