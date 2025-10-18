---
name: ship
description: Fast-track deployment of low-risk features with minimal validation. Bypasses heavy gates for immediate user value delivery.
model: opus
role: Rapid Deployment Engine
capabilities:
  - quick_deployment
  - minimal_validation
  - instant_release
  - rollback_safety
  - feature_shipping
priority: critical
tech_stack:
  - javascript
  - typescript
  - python
  - node.js
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
mcp_servers:
  - context7
tags:
  - deployment
  - fast-track
  - user-value
  - immediate-release
---

# /ship - Instant Feature Deployment

**Ship low-risk features immediately with minimal validation and built-in rollback safety.**

## Overview

The `/ship` command enables rapid deployment of features by:
- Skipping heavy validation for low-risk changes
- Performing essential checks only
- Providing instant rollback capability
- Enabling immediate user value delivery

## Usage

```bash
# Ship a feature immediately
/ship "user profile card component"

# Ship with specific tier
/ship "CSS style improvements" --tier=fast

# Ship with rollback plan
/ship "API documentation update" --with-rollback

# Ship to specific environment
/ship "bug fix for login form" --env=staging

# Ship with custom validation
/ship "data export feature" --validate=tests
```

## Risk Tiers

### Fast Track (Safest)
- Documentation changes
- CSS/style updates
- Text content changes
- Configuration updates
- **No rollback needed**

### Standard Tier
- UI components
- API endpoints (non-critical)
- Utility functions
- Test improvements
- **Automatic rollback if tests fail**

### Cautious Tier
- Database migrations
- Authentication changes
- Payment processing
- Critical business logic
- **Manual approval required**

## Pre-Ship Checklist

### Fast Track
- [ ] Changes are non-breaking
- [ ] No critical functionality affected
- [ ] Can be easily reverted
- [ ] No sensitive data involved

### Standard Tier
- [ ] Tests pass locally
- [ ] No linting errors
- [ ] Basic functionality verified
- [ ] Rollback plan exists

### Cautious Tier
- [ ] Full test suite passes
- [ ] Code review completed
- [ ] Staging environment tested
- [ ] Monitoring in place

## Quick Validation Commands

### Syntax Check
```bash
# JavaScript/TypeScript
npm run lint:check && npm run typecheck

# Python
python -m flake8 && python -m mypy

# All files
npm run format:check
```

### Basic Tests
```bash
# Run relevant tests only
npm test -- --testPathPattern="feature-name"

# Quick smoke test
npm run test:smoke
```

### Build Check
```bash
# Verify build works
npm run build

# Check for build errors
npm run build:check
```

## Deployment Process

### 1. Quick Validation
```bash
/ship "feature description" --validate
```

### 2. Create Release Commit
```bash
git add .
git commit -m "feat: ship(feature-name): description"
```

### 3. Deploy
```bash
# Automatic deployment
npm run deploy:fast

# Or manual deployment
git push origin main
```

### 4. Verify
```bash
# Health check
npm run health:check

# Feature verification
curl http://localhost:3000/api/feature-endpoint
```

## Rollback Strategies

### Automatic Rollback
Triggers rollback if:
- Health checks fail
- Error rate >5%
- Response time >2x baseline

### Manual Rollback
```bash
# Quick rollback
/ship rollback "feature-name"

# Rollback to specific commit
/ship rollback --to=commit-hash

# Emergency rollback
/ship rollback --emergency
```

### Rollback Verification
```bash
# Verify rollback successful
npm run health:check

# Check feature is removed
curl -f http://localhost:3000/api/removed-feature || echo "Feature removed"
```

## Examples

### 1. Documentation Update
```bash
/ship "update API documentation with new endpoints" --tier=fast
```

**Process:**
1. Validate documentation syntax
2. Commit changes
3. Deploy to documentation site
4. Verify updates visible

**Time:** <2 minutes

### 2. CSS Style Fix
```bash
/ship "fix button alignment on mobile devices" --tier=fast
```

**Process:**
1. Check CSS syntax
2. Run visual regression tests
3. Deploy static assets
4. Verify on mobile

**Time:** <5 minutes

### 3. UI Component
```bash
/ship "add loading spinner to data tables" --tier=standard
```

**Process:**
1. Run component tests
2. Check accessibility
3. Deploy to staging first
4. Promote to production
5. Monitor for issues

**Time:** <15 minutes

### 4. Bug Fix
```bash
/ship "fix null pointer in user profile" --tier=standard --with-rollback
```

**Process:**
1. Run targeted tests
2. Deploy with monitoring
3. Verify fix works
4. Keep rollback ready

**Time:** <10 minutes

## Safety Features

### Health Monitoring
```bash
# Continuous health checks
while true; do
  npm run health:check
  sleep 30
done
```

### Error Detection
```bash
# Monitor error rates
npm run monitor:errors --threshold=5% --duration=5m

# Check response times
npm run monitor:performance --threshold=2x
```

### Automatic Safeguards
- Rollback on critical errors
- Pause deployment on warnings
- Alert team on issues
- Maintain deployment log

## Integration with CI/CD

### GitHub Actions
```yaml
name: Fast Ship
on:
  push:
    branches: [main]

jobs:
  ship:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Quick Validation
        run: npm run validate:fast
      - name: Deploy
        run: npm run deploy:fast
      - name: Health Check
        run: npm run health:check
```

### Environment Variables
```bash
# Enable fast shipping
export FAST_SHIP=true
export ROLLBACK_ENABLED=true
export MONITORING_ENABLED=true
```

## Success Metrics

### Deployment Speed
- **Fast Track**: <2 minutes
- **Standard Tier**: <15 minutes
- **Cautious Tier**: <1 hour

### Success Rate
- **Target**: >95% successful deployments
- **Rollback Rate**: <5%
- **User Impact**: <1% affected users

### Quality Metrics
- **Error Rate**: <1% increase
- **Performance**: <10% degradation
- **User Satisfaction**: >4.5/5

## 🚀 Execution Instructions for Claude Code

When `/ship` command is invoked:

1. **Analyze Changes**
   - Check git diff for risk level
   - Identify affected functionality
   - Determine appropriate tier

2. **Run Validation**
   - Perform tier-specific checks
   - Run syntax validation
   - Execute basic tests if needed

3. **Create Release**
   - Stage all changes
   - Create descriptive commit
   - Tag release if needed

4. **Deploy**
   - Push to remote repository
   - Trigger deployment pipeline
   - Monitor deployment progress

5. **Verify**
   - Run health checks
   - Test functionality
   - Monitor for issues

6. **Report Results**
   - Show deployment status
   - Provide verification results
   - Include rollback instructions

## Example Session

```bash
User: /ship "fix responsive navigation on mobile"

AI: I'll ship the responsive navigation fix for mobile devices.

**Risk Assessment**: Fast Track (CSS changes only)
**Validation**: Syntax check ✅
**Rollback**: Not needed (can revert CSS)

**Deployment Process:**
1. ✅ CSS syntax validated
2. ✅ Changes committed: "feat(ship): fix responsive navigation on mobile"
3. ✅ Deploying static assets...
4. ✅ Health check passed
5. ✅ Mobile navigation verified

**Results:**
✅ Successfully deployed to production
✅ Mobile navigation now responsive
✅ No issues detected
✅ Users can now navigate properly on mobile devices

Your navigation fix is live and working!
```

## Best Practices

### DO ✅
- Use for low-risk, high-value changes
- Test on staging when possible
- Monitor after deployment
- Have rollback plans ready

### DON'T ❌
- Ship untested critical changes
- Skip all validation
- Ignore monitoring alerts
- Ship during peak traffic without testing

## Troubleshooting

### Deployment Failed
```bash
# Check what went wrong
/ship status --last-deployment

# Fix issues and retry
/ship retry "feature description"

# Or rollback
/ship rollback --last
```

### Health Check Failed
```bash
# Investigate issues
/ship diagnose --health

# Quick rollback if needed
/ship rollback --emergency
```

### Users Reporting Issues
```bash
# Check recent deployments
/ship list --recent

# Rollback if necessary
/ship rollback --to=before-issue
```

---

**Version**: 1.0
**Focus**: Immediate user value delivery
**Safety**: Built-in rollback and monitoring