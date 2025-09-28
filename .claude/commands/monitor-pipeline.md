# Monitor Pipeline

Continuously monitor CI/CD pipeline health and automatically recover from failures.

## Usage
```
/monitor-pipeline [--auto-fix] [--alert-threshold=<minutes>] [--language=<all|js|python>]
```

## Description
This command activates the GUARDIAN agent to monitor pipeline health, detect failures, and attempt automatic recovery for both JavaScript/TypeScript and Python projects.

## Parameters
- `--auto-fix`: Automatically attempt to fix failures (default: true)
- `--alert-threshold`: Time before escalating to humans (default: 10 minutes)
- `--language`: Filter monitoring by language (default: all)

## Agents Involved
- **Primary**: GUARDIAN - Monitors and fixes pipeline
- **Support**: MONITOR - Tracks metrics and alerts
- **Escalation**: STRATEGIST - Coordinates recovery

## Monitoring Scope

### JavaScript/TypeScript Pipelines
- npm/yarn build processes
- Jest/Mocha test suites
- ESLint/Prettier checks
- TypeScript compilation
- Bundle size validation

### Python Pipelines
- pip/poetry dependency installation
- pytest/unittest execution
- Black/Ruff formatting
- mypy type checking
- Coverage requirements

## Common Fixes
1. **Dependency Issues**
   - JS: npm ci, clear cache, update lockfile
   - Python: pip install --force-reinstall, clear pip cache

2. **Test Failures**
   - Identify flaky tests
   - Update snapshots (JS)
   - Fix timing issues
   - Adjust test data

3. **Linting Errors**
   - Auto-fix where possible
   - Update ignore patterns
   - Adjust rule severity

4. **Build Failures**
   - Clear build artifacts
   - Fix import paths
   - Resolve version conflicts

## Alert Levels
- **Info**: Pipeline slow but passing
- **Warning**: Non-critical failures
- **Error**: Build or test failures
- **Critical**: Complete pipeline failure

## Examples
```bash
# Monitor all pipelines with auto-fix
/monitor-pipeline

# Monitor Python only, alert after 5 minutes
/monitor-pipeline --language=python --alert-threshold=5

# Monitor without auto-fix
/monitor-pipeline --auto-fix=false
```

## Recovery Strategies
1. Retry with cleared cache
2. Fix known issues automatically
3. Rollback problematic changes
4. Escalate to human operators

## SLAs
- Detection: ≤5 minutes
- Auto-fix attempt: ≤10 minutes
- Recovery or escalation: ≤15 minutes