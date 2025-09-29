# /recover - CI/CD Pipeline Recovery

Automatically diagnose and fix broken CI/CD pipelines.

## Usage
```
/recover [--auto-fix] [--create-incident]
```

## Script Entrypoints
```bash
# Via Makefile (recommended)
make recover

# Direct journey execution
node .claude/journeys/jr4-ci-recovery.js

# Via CLI
npm run agent:invoke GUARDIAN:analyze-failure -- --auto-fix
```

## Parameters
- `--auto-fix`: Automatically apply fixes (default: true)
- `--create-incident`: Create Linear incident for tracking

## Diagnostic Capabilities
Automatically detects and fixes:
1. **Test failures** - Identifies flaky tests, fixes assertions
2. **Build errors** - Resolves dependency issues
3. **Linting violations** - Auto-formats code
4. **Type errors** - Fixes TypeScript/type issues
5. **Coverage drops** - Adds missing tests
6. **Security issues** - Patches vulnerabilities

## Linear Integration
- **Creates**: INCIDENT-XXX for pipeline breaks
- **Updates**: Related CLEAN-XXX tasks
- **Links**: PR to incident resolution
- **Notifies**: Team via Linear comments

## MCP Tools Used
- `gh run list` - Check workflow status
- `gh run view` - Get failure details
- `mcp__linear-server__create_issue` - Create incident
- `mcp__linear-server__update_issue` - Update status

## Recovery Strategy
```
1. Identify failure type
   ↓
2. Determine root cause
   ↓
3. Generate fix approach
   ↓
4. Apply fix (TDD if code change)
   ↓
5. Verify pipeline green
   ↓
6. Document resolution
```

## Common Fixes

### Test Failures
```javascript
// Detected: Timeout in async test
// Fix: Increase timeout, add proper await
- it('should fetch data', () => {
+ it('should fetch data', async () => {
+   jest.setTimeout(10000);
-   getData();
+   await getData();
```

### Build Errors
```javascript
// Detected: Missing dependency
// Fix: Install and add to package.json
npm install missing-package
```

### Coverage Drops
```javascript
// Detected: Function lacks tests
// Fix: Generate test with TESTER agent
/fix COVERAGE-FIX --generate-tests
```

## Agents Involved
- **Primary**: GUARDIAN - Pipeline monitoring
- **Support**: EXECUTOR - Applies fixes
- **Analysis**: SCHOLAR - Identifies patterns

## Output
1. **Diagnosis Report**: Root cause analysis
2. **Fix Branch**: `hotfix/pipeline-recovery-YYYYMMDD`
3. **Recovery PR**: With fix and prevention steps
4. **Linear Incident**: INCIDENT-XXX with timeline
5. **Prevention Guide**: Avoid future breaks

## SLAs
- Detection: ≤2 minutes
- Diagnosis: ≤5 minutes
- Auto-fix: ≤10 minutes (p95)
- Manual fix: ≤30 minutes

## Example Workflow
```bash
# Pipeline fails
/recover

# Output:
# 🔍 Analyzing pipeline failure...
# ❌ Found: 3 test failures in auth.test.js
# 🔧 Root cause: API mock timeout
# ✨ Applying fix...
# ✅ Tests passing locally
# 🚀 Creating PR #457
# ✅ Pipeline recovered!
#
# Linear: INCIDENT-042 created and resolved
```

## Auto-Fix Patterns

### Flaky Test Fix
- Adds proper async/await
- Increases timeouts
- Stabilizes random data
- Mocks external APIs

### Dependency Fix
- Updates lock files
- Resolves version conflicts
- Adds missing packages
- Removes unused deps

### Type Error Fix
- Adds type annotations
- Fixes interface mismatches
- Updates type definitions

## Prevention Measures
After recovery, automatically:
1. Adds regression test
2. Updates CI configuration
3. Documents fix pattern
4. Shares learning with SCHOLAR

## Manual Override
If auto-fix fails:
```bash
# Create incident and alert team
/recover --auto-fix=false --create-incident

# Provides:
# - Detailed failure analysis
# - Suggested manual steps
# - Expert agent recommendations
```

## Notes
- Maintains audit trail in Linear
- Never force-pushes to main
- Creates hotfix branches
- Validates fix in staging first