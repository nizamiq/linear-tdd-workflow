# /release - Production Release Management

Orchestrate safe production releases with automated validation.

## Usage
```
/release [version] [--type=patch|minor|major] [--dry-run]
```

## Script Entrypoints
```bash
# Via Makefile (recommended)
make release

# Direct journey execution
node .claude/journeys/jr6-release.js

# Via CLI
npm run agent:invoke STRATEGIST:coordinate-release
```

## Parameters
- `[version]`: Explicit version or auto-increment
- `--type`: Version bump type (default: patch)
  - `patch`: 1.2.3 → 1.2.4 (bug fixes)
  - `minor`: 1.2.3 → 1.3.0 (features)
  - `major`: 1.2.3 → 2.0.0 (breaking changes)
- `--dry-run`: Simulate without deploying

## Release Pipeline
```
Pre-flight Checks → UAT → Staging → Production
       ↓              ↓        ↓          ↓
  All Tests Pass   Approve  Validate   Deploy
```

## Pre-flight Checklist
Automated verification before release:
- ✅ All tests passing
- ✅ Coverage ≥80%
- ✅ No security vulnerabilities
- ✅ No open P0/P1 issues
- ✅ Documentation updated
- ✅ CHANGELOG current
- ✅ Linear milestone ready

## Linear Integration
- **Reads**: Sprint/milestone issues
- **Validates**: All DONE status
- **Creates**: Release notes from completed tasks
- **Updates**: Milestone to released
- **Notifies**: Team of release status

## MCP Tools Used
- `mcp__linear-server__list_issues` - Check sprint completion
- `gh release create` - Create GitHub release
- `gh workflow run` - Trigger deployment
- `mcp__linear-server__update_issue` - Update task status

## Release Validation

### UAT Phase
```bash
# Automated UAT tests
- User journey tests
- Integration tests
- Performance benchmarks
- Security scan
```

### Staging Deployment
```bash
# Deploy to staging
- Database migrations
- Feature flags
- Smoke tests
- Rollback test
```

### Production Deployment
```bash
# Blue-green deployment
- Health checks
- Gradual rollout
- Monitoring alerts
- Rollback ready
```

## Agents Involved
- **Primary**: STRATEGIST - Orchestrates release
- **Validation**: VALIDATOR - Quality gates
- **Monitoring**: GUARDIAN - Deployment health
- **Documentation**: SCHOLAR - Release notes

## Output
1. **Version Bump**: Updated version files
2. **CHANGELOG**: Generated from Linear tasks
3. **Release Branch**: `release/v1.2.3`
4. **GitHub Release**: With assets and notes
5. **Linear Update**: Milestone marked complete
6. **Deployment Status**: Real-time monitoring

## Release Notes Generation
Automatically generated from Linear:
```markdown
## v1.2.3 - 2024-01-15

### Features
- FEAT-123: Add user authentication
- FEAT-124: Implement search functionality

### Bug Fixes
- CLEAN-456: Fix memory leak in cache
- CLEAN-457: Resolve timezone issues

### Performance
- PERF-789: Optimize database queries
```

## Rollback Plan
Every release includes:
```bash
# Instant rollback command
make rollback VERSION=1.2.2

# Automated:
- Reverts deployments
- Restores database
- Updates feature flags
- Notifies team
```

## SLAs
- Pre-flight checks: ≤5 minutes
- UAT validation: ≤15 minutes
- Staging deploy: ≤10 minutes
- Production deploy: ≤10 minutes
- Rollback: ≤2 minutes

## Example Workflow
```bash
# Start release
/release --type=minor

# Output:
# 📋 Pre-flight Checks:
# ✅ 342 tests passing
# ✅ Coverage: 87%
# ✅ No vulnerabilities
# ✅ All P0/P1 resolved
#
# 🏷️ Version: 1.2.3 → 1.3.0
#
# 📝 Release Notes:
# - 5 features
# - 12 bug fixes
# - 3 improvements
#
# 🚀 Deployment Pipeline:
# [=====>    ] UAT: Passed
# [========> ] Staging: Deploying...
# [          ] Production: Waiting
#
# Linear: Milestone "v1.3.0" ready for release
```

## Feature Flags
Supports gradual rollout:
```javascript
{
  "new-feature": {
    "enabled": true,
    "rollout": 10,  // 10% of users
    "groups": ["beta-testers"]
  }
}
```

## Monitoring
Post-deployment monitoring:
- Error rate threshold: <1%
- Response time: p95 <200ms
- CPU/Memory: <80% utilization
- Auto-rollback triggers

## Approval Gates
- **Minor/Patch**: Auto-approved if checks pass
- **Major**: Requires manual approval
- **Hotfix**: Expedited process

## Notes
- Never deploys on Fridays (configurable)
- Maintains deployment history
- Integrates with monitoring tools
- Supports multiple environments