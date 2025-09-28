# Troubleshooting Guide

This guide helps you resolve common issues with the Linear TDD Workflow System.

## 🚨 Common Issues

### Installation Issues

#### Problem: npm install fails with permission errors

**Symptoms**:
```
npm ERR! code EACCES
npm ERR! syscall access
```

**Solution**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Use a Node version manager (nvm):
   ```bash
   nvm use 18
   npm install
   ```
3. If on macOS/Linux, avoid using sudo. Instead, fix npm permissions:
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   ```

---

#### Problem: GitFlow commands not found

**Symptoms**:
```bash
git: 'flow' is not a git command
```

**Solution**:
1. Install git-flow:
   ```bash
   # macOS
   brew install git-flow-avh

   # Ubuntu/Debian
   apt-get install git-flow

   # Windows
   # Use Git for Windows which includes git-flow
   ```

2. Initialize GitFlow:
   ```bash
   git flow init -d
   ```

---

### Linear Integration Issues

#### Problem: Linear API connection fails

**Symptoms**:
```
Error: Failed to connect to Linear API
401 Unauthorized
```

**Solution**:
1. Verify API key in `.env`:
   ```bash
   LINEAR_API_KEY=lin_api_xxxxxxxxxxxx
   ```

2. Check API key permissions in Linear:
   - Go to Linear Settings → API → Personal API keys
   - Ensure key has necessary scopes

3. Test connection:
   ```bash
   npm run linear:sync
   ```

---

#### Problem: Linear tasks not syncing

**Symptoms**:
- Tasks created locally don't appear in Linear
- Status updates not reflected

**Solution**:
1. Check team and project IDs:
   ```bash
   LINEAR_TEAM_ID=your_team_uuid
   LINEAR_PROJECT_ID=your_project_uuid
   ```

2. Verify webhook configuration:
   - Linear Settings → API → Webhooks
   - Ensure webhook URL is correct

3. Check network connectivity:
   ```bash
   curl -H "Authorization: Bearer $LINEAR_API_KEY" \
        https://api.linear.app/graphql \
        -d '{"query":"{ viewer { id email }}"}'
   ```

---

### Testing Issues

#### Problem: Tests fail with coverage below threshold

**Symptoms**:
```
Jest: "global" coverage threshold for lines (80%) not met: 75.5%
```

**Solution**:
1. Check which files lack coverage:
   ```bash
   npm test -- --coverage --coverageReporters=text
   ```

2. Add missing tests for uncovered code

3. For legacy code, temporarily adjust threshold:
   ```json
   // jest.config.js
   "coverageThreshold": {
     "global": {
       "lines": 75  // Temporarily lower, then gradually increase
     }
   }
   ```

---

#### Problem: Mutation tests timeout

**Symptoms**:
```
Stryker timeout: Test run timed out
```

**Solution**:
1. Increase timeout in `stryker.conf.js`:
   ```javascript
   module.exports = {
     timeoutMS: 10000,  // Increase from default 5000
     timeoutFactor: 2    // Multiply timeout by 2
   };
   ```

2. Run mutation tests on subset:
   ```bash
   npm run test:mutation -- --files "src/services/*.ts"
   ```

---

### Agent Issues

#### Problem: AUDITOR agent takes too long

**Symptoms**:
- Assessment exceeds 15-minute timeout
- Process hangs during scanning

**Solution**:
1. Run incremental scan instead:
   ```bash
   npm run assess:incremental
   ```

2. Limit scope to specific directories:
   ```bash
   npm run assess -- --path src/services
   ```

3. Check for infinite loops in code being analyzed

---

#### Problem: EXECUTOR creates PRs with failing tests

**Symptoms**:
- PR created but CI fails
- Tests pass locally but fail in CI

**Solution**:
1. Ensure environment parity:
   ```bash
   # Run tests in CI mode locally
   npm run test:ci
   ```

2. Check for timing issues:
   ```javascript
   // Add explicit waits in tests
   await new Promise(resolve => setTimeout(resolve, 100));
   ```

3. Verify all dependencies are committed:
   ```bash
   git status
   npm ci  # Use ci instead of install
   ```

---

### Pipeline Issues

#### Problem: GitHub Actions workflow fails

**Symptoms**:
```
Error: Process completed with exit code 1
```

**Solution**:
1. Check workflow syntax:
   ```bash
   # Validate workflow files
   npm install -g @action-validator/cli
   action-validator .github/workflows/*.yml
   ```

2. Review workflow logs:
   - Go to Actions tab in GitHub
   - Click on failed workflow
   - Expand failed step for details

3. Run workflow locally with act:
   ```bash
   npm install -g act
   act -j test
   ```

---

#### Problem: GUARDIAN doesn't auto-recover pipeline

**Symptoms**:
- Pipeline failures not detected
- Recovery attempts fail

**Solution**:
1. Check GUARDIAN agent status:
   ```bash
   npm run agents:status
   ```

2. Verify webhook configuration in GitHub:
   - Settings → Webhooks
   - Ensure workflow_run events are enabled

3. Review GUARDIAN logs:
   ```bash
   tail -f logs/guardian.log
   ```

---

### Performance Issues

#### Problem: System runs slowly

**Symptoms**:
- Commands take excessive time
- High CPU/memory usage

**Solution**:
1. Check resource usage:
   ```bash
   # macOS/Linux
   top -p $(pgrep -f "node")

   # Windows
   tasklist | findstr node
   ```

2. Clear caches:
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm ci
   ```

3. Limit concurrent operations:
   ```javascript
   // .claude/settings.json
   {
     "resource": {
       "limits": {
         "concurrent": {
           "repos": 1,  // Reduce from 3
           "tasks": 5   // Reduce from 10
         }
       }
     }
   }
   ```

---

## 🔍 Debugging Techniques

### Enable Debug Logging

```bash
# Set debug environment variable
export DEBUG=linear-tdd:*

# Run with verbose logging
npm run assess -- --verbose

# Check logs
tail -f logs/*.log
```

### Use Node Inspector

```bash
# Run with inspector
node --inspect npm run assess

# Open Chrome DevTools
# Navigate to chrome://inspect
```

### Trace Agent Communication

```bash
# Enable agent message logging
export AGENT_LOG_LEVEL=trace

# Monitor agent messages
npm run monitor:agents
```

---

## 📊 Error Codes Reference

| Code | Description | Solution |
|------|-------------|----------|
| E001 | Invalid configuration | Check .env file |
| E002 | API authentication failed | Verify API keys |
| E003 | Repository access denied | Check permissions |
| E004 | Test coverage below threshold | Add more tests |
| E005 | Mutation score too low | Improve test quality |
| E006 | Pipeline timeout | Optimize long-running tasks |
| E007 | Agent communication failure | Check agent status |
| E008 | Linear sync failed | Verify Linear configuration |
| E009 | GitFlow not initialized | Run `git flow init` |
| E010 | Invalid Fix Pack | Review Fix Pack constraints |

---

## 🆘 Getting Help

If you can't resolve an issue:

1. **Search existing issues**:
   ```bash
   gh issue list --search "your error message"
   ```

2. **Check documentation**:
   - [FAQ](faq.md)
   - [API Reference](../api-reference/README.md)
   - [Agent Specs](../../.claude/agents/)

3. **Create detailed issue**:
   ```bash
   gh issue create --title "Brief description" \
                   --body "Full error details"
   ```

   Include:
   - Error messages
   - Steps to reproduce
   - System information (`npm run diagnostics`)
   - Relevant logs

4. **Community support**:
   - Discord: [Join our server](https://discord.gg/example)
   - Discussions: GitHub Discussions
   - Stack Overflow: Tag with `linear-tdd-workflow`

---

## 🔧 Diagnostic Commands

Run these commands to gather system information for bug reports:

```bash
# System diagnostics
npm run diagnostics

# Check versions
node --version
npm --version
git --version

# Verify configuration
npm run config:validate

# Test connections
npm run test:connections

# Generate debug report
npm run debug:report > debug-report.txt
```

---

*Last updated: 2024*
*Version: 1.2.0*