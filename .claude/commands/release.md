---
name: release
description: Manage production release with comprehensive validation
agent: STRATEGIST
execution_mode: DIRECT  # ⚠️ CRITICAL: STRATEGIST runs in main context for state changes
subprocess_usage: VALIDATION_THEN_ACTION  # Read-only validation, then direct action in main context
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

## ⚠️ IMPORTANT: Direct Execution Required

This command performs **STATE-CHANGING operations** and must run in main context:
- **Validation phase** may use subprocesses to check quality gates (read-only)
- **Release phase** MUST run in main context (creates branches, tags, PRs, deployments)
- **NO subprocess writes** - all git/deployment operations in main context

**Validation phase (safe for subprocess):**
- ✅ Running test suites
- ✅ Checking code coverage
- ✅ Validating configuration
- ✅ Querying Linear for release readiness
- ✅ Checking deployment prerequisites

**Release phase (MUST be in main context):**
- ⚠️ Creating release branch (git)
- ⚠️ Bumping version numbers (file writes)
- ⚠️ Generating changelog (file write)
- ⚠️ Creating git tags
- ⚠️ Creating release PR
- ⚠️ Triggering deployments
- ⚠️ Updating Linear tasks

**Architecture:**
```
Main Context (STRATEGIST)
  ├─> Subprocess: Run validation checks (read-only) → Return validation results
  └─> Main Context: Execute release (git, files, PRs, deployments, Linear)
```

**Rule:** Validation can be delegated, RELEASE ACTIONS must be in main context.

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

## Ground Truth Verification (Mandatory)

After completing release, STRATEGIST **MUST** verify actions persisted using actual tool calls:

### Required Verification Steps:

1. **Verify Release Branch Created:**
   ```bash
   git branch --list release/*
   ```
   Expected: release/X.Y.Z branch visible

2. **Verify Version Bumped:**
   ```bash
   cat package.json | jq -r '.version'
   ```
   Expected: Version matches release number

3. **Verify Git Tag Created:**
   ```bash
   git tag --list v*
   ```
   Expected: vX.Y.Z tag visible

4. **Verify Release PR Created:**
   ```bash
   gh pr list --state open | grep release
   ```
   Expected: PR number and URL for release branch

5. **Verify Changelog Updated:**
   ```bash
   head -20 CHANGELOG.md | grep -i "version $(cat package.json | jq -r '.version')"
   ```
   Expected: New version entry in CHANGELOG

6. **Verify Deployment Triggered (if not --dry-run):**
   ```bash
   gh run list --workflow=deploy --limit 1
   ```
   Expected: Recent deployment workflow run

### If ANY Verification Fails:

```markdown
❌ GROUND TRUTH VERIFICATION FAILED

Expected: Release branch release/1.2.3 with PR and git tag
Actual: git branch shows no release branch, gh pr list shows no PRs

RELEASE INCOMPLETE - DO NOT REPORT SUCCESS
Manual intervention required: User must manually create release or investigate.
```

**Rule:** NEVER report successful release without verified evidence of all actions.