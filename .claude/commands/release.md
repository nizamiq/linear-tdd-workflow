---
name: release
description: Manage production release with comprehensive validation
agent: STRATEGIST
usage: "/release <version> [--dry-run] [--force]"
allowed-tools: [Read, Bash, mcp__linear-server__*, mcp__playwright__*]
argument-hint: "<version> [--dry-run] [--force]"
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

## 🤖 Execution Instructions for Claude Code

**When user invokes `/release <version>`, execute comprehensive release management workflow.**

### Step 1: Invoke STRATEGIST Agent for Release Management
```
Use Task tool with:
- subagent_type: "STRATEGIST"
- description: "Manage production release v[version]"
- prompt: "You are the STRATEGIST agent. Execute comprehensive release management for version [version]:

Version: [user-provided version]
Type: [user-provided --type or patch]
Skip UAT: [user-provided --skip-uat or false]

Execute release workflow autonomously:

**Phase 1: Preparation**
1. Create release branch: git checkout -b release/[version] develop
2. Bump version in package.json / version files
3. Generate changelog from git log and Linear tasks
4. Commit changes: git commit -m 'chore: prepare release [version]'

**Phase 2: Pre-Flight Checks**
5. Run quality gates:
   - All tests passing: npm test
   - Linting clean: npm run lint
   - Type checking: npm run typecheck
   - Build succeeds: npm run build
   - Security scan: npm audit

**Phase 2.5: Functional Release Gate** 🎯
6. Validate functional readiness:
   - Run: node .claude/scripts/release/functional-gate.js
   - Check: All implemented features have E2E tests
   - Verify: All E2E tests pass
   - Block: If any 'partial' status features exist
   - Report: User story coverage percentage

**Phase 3: UAT Preparation** (unless --skip-uat)
7. Deploy to staging environment
8. Generate UAT test plan
9. Notify stakeholders for UAT execution

**Phase 4: Approval Gate** (PAUSE FOR HUMAN)
10. Return to parent with release readiness report
11. Wait for user approval before proceeding to deployment

**Phase 5: Deployment** (after approval)
12. Merge release branch to main
13. Tag release: git tag v[version]
14. Push to production: git push origin main --tags
15. Trigger deployment pipeline

**Phase 6: Post-Deployment Validation**
16. Run smoke tests against production
17. Verify health checks
18. Monitor error rates
19. Update Linear issues to 'Released'

**Phase 7: Cleanup**
20. Merge release branch back to develop
21. Delete release branch
22. Generate release notes

Return comprehensive release report at each phase. Pause only at Phase 4 for deployment approval."
```

### Step 2: Present Pre-Deployment Report
After STRATEGIST completes Phase 1-3:
- Show version preparation status
- Display pre-flight check results
- **Present functional release gate results** (Phase 2.5):
  - User story coverage percentage
  - Implemented features with E2E tests
  - Any blocking partial features
  - E2E test pass/fail status
- Show UAT readiness (if not skipped)

### Step 3: Pause for Deployment Approval (CRITICAL Human Intervention Point)
Ask user: "Release v[version] is ready for deployment. Pre-flight checks passed, functional release gate validated [N] features. Proceed with production deployment?"

**If functional gate FAILED**, inform user:
"⚠️ Functional release gate BLOCKED the release. [N] implemented features lack E2E tests. Fix these issues before proceeding:
- [List of partial features]

To fix: Update .claude/user-stories/registry.yaml with E2E test paths, then re-run /release."

If user confirms deployment:
- STRATEGIST continues with Phase 5-7
- Returns deployment status and post-deployment report

### Completion Criteria
- ✅ Release branch created and versioned
- ✅ All pre-flight checks passed
- ✅ **Functional release gate passed** (no partial features)
- ✅ UAT completed (or skipped with approval)
- ✅ Deployment approved by user
- ✅ Production deployment successful
- ✅ Post-deployment validation passed
- ✅ Linear issues updated to Released status

### Expected Timeline
- Preparation: 5 minutes
- Pre-flight checks: 8 minutes
- **Functional gate validation: 3-5 minutes**
- UAT prep: 10 minutes (if enabled)
- Deployment: 10-15 minutes
- Post-deployment: 5 minutes
- Total: 35-50 minutes (excluding UAT execution time)

### Critical Constraints
- **Functional release gate BLOCKS deployment** if validation fails
- UAT cannot be skipped without explicit --skip-uat flag
- Deployment requires explicit user approval at Phase 4
- Post-deployment validation must pass before marking complete

**DO NOT:**
- Ask "should I create release branch?" - execute preparation immediately
- Skip functional release gate (Phase 2.5) - always run
- Proceed to deployment without user approval - always pause at Phase 4
- Skip post-deployment validation - always verify

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