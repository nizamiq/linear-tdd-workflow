# Frequently Asked Questions (FAQ)

## General Questions

### What is the Linear TDD Workflow System?

The Linear TDD Workflow System is an enterprise-grade multi-agent AI development framework that autonomously manages code quality through continuous assessment, prioritized execution, and rigorous Test-Driven Development validation. It integrates with Linear.app for project management and GitHub for version control.

### Who should use this system?

This system is designed for:

- **Engineering teams** looking to reduce technical debt
- **Development teams** wanting to enforce TDD practices
- **Organizations** seeking to improve code quality metrics
- **Projects** using Linear.app for task management

### What are the main benefits?

- **40% reduction** in engineering maintenance time
- **50% faster** Mean Time to Recovery (MTTR)
- **30-35% improvement** in PR cycle time
- **20+ percentage points increase** in test coverage

---

## Setup and Installation

### What are the system requirements?

**Minimum Requirements**:

- Node.js 18+
- npm 8+
- Git 2.30+
- 4GB RAM
- 10GB disk space

**Recommended**:

- Node.js 20+
- 8GB RAM
- SSD storage
- Multi-core processor

### How do I get started quickly?

```bash
# Clone the repository
git clone <repository-url>
cd linear-tdd-workflow

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run initial setup
npm run setup

# Start the system
npm run agents:init
```

### Do I need a Linear.app account?

Yes, a Linear.app account is required for full functionality. You'll need:

- Linear API key
- Team ID
- Project ID (optional)

You can run the system in limited mode without Linear, but task management features will be disabled.

---

## Agents and Workflow

### What are the five agents and what do they do?

1. **AUDITOR**: Scans code for quality issues and creates tasks
2. **EXECUTOR**: Implements approved fixes following TDD
3. **GUARDIAN**: Monitors and recovers failed pipelines
4. **STRATEGIST**: Orchestrates multi-agent activities
5. **SCHOLAR**: Learns patterns from successful fixes

### What is a Fix Pack?

Fix Packs are pre-approved, low-risk improvements that agents can implement autonomously:

- Linting and formatting fixes
- Dead code removal
- Documentation updates
- Simple refactors
- Non-breaking dependency updates
- Logging standardization
- Test scaffolding

### What is FIL classification?

FIL (Feature Impact Level) classifies changes by risk:

- **FIL-0**: No risk (formatting, comments)
- **FIL-1**: Low risk (variable renames)
- **FIL-2**: Medium risk (requires Tech Lead approval)
- **FIL-3**: High risk (requires Tech Lead + Product Owner approval)

### How does TDD enforcement work?

Every change must follow the red-green-refactor cycle:

1. **[RED]**: Write a failing test first
2. **[GREEN]**: Write minimal code to pass the test
3. **[REFACTOR]**: Improve code while maintaining passing tests

The system enforces:

- Diff coverage ≥80%
- Mutation testing ≥30%
- All commits must include tests

---

## Configuration

### How do I configure Linear integration?

Add these to your `.env` file:

```bash
LINEAR_API_KEY=lin_api_xxxxxxxxxxxx
LINEAR_TEAM_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
LINEAR_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Get these values from Linear:

- Settings → API → Personal API keys
- Team settings → General → Team ID
- Project settings → General → Project ID

### How do I adjust agent limits?

Edit `.claude/settings.json`:

```json
{
  "agents": {
    "executor": {
      "constraints": {
        "maxLOC": 300, // Max lines per PR
        "minCoverage": 80, // Min coverage %
        "minMutation": 30 // Min mutation score %
      }
    }
  }
}
```

### Can I disable certain agents?

Yes, in `.claude/settings.json`:

```json
{
  "agents": {
    "roster": {
      "scholar": {
        "active": false // Disable SCHOLAR agent
      }
    }
  }
}
```

---

## Testing

### What testing frameworks are supported?

**JavaScript/TypeScript**:

- Jest (primary)
- Mocha (compatible)
- Vitest (experimental)

**Python**:

- pytest (primary)
- unittest (compatible)

### How do I run specific test types?

```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Mutation testing
npm run test:mutation

# All tests with coverage
npm test
```

### What if my tests don't meet coverage requirements?

Options:

1. **Add more tests** (recommended)
2. **Exclude files** from coverage (use sparingly):
   ```javascript
   // jest.config.js
   coveragePathIgnorePatterns: ['legacy-code.js'];
   ```
3. **Temporarily lower threshold** (not recommended):
   ```javascript
   coverageThreshold: {
     global: {
       lines: 75; // Lower from 80
     }
   }
   ```

---

## Troubleshooting

### Why are my PRs being rejected?

Common reasons:

1. **No tests**: Every PR needs tests
2. **Low coverage**: Diff coverage must be ≥80%
3. **No TDD tags**: Commits need [RED], [GREEN], [REFACTOR] tags
4. **FIL-2/3 without approval**: High-impact changes need approval
5. **Exceeds Fix Pack limits**: PRs limited to 300 LOC

### Why isn't the GUARDIAN recovering my pipeline?

Check:

1. GUARDIAN agent is active: `npm run agents:status`
2. GitHub webhooks configured correctly
3. Recovery attempts haven't exceeded limit (3)
4. Failure type is recoverable (not syntax errors)

### How do I debug agent issues?

Enable debug logging:

```bash
export DEBUG=linear-tdd:*
export AGENT_LOG_LEVEL=trace
npm run agents:status
```

Check logs:

```bash
tail -f logs/auditor.log
tail -f logs/executor.log
```

---

## Best Practices

### How often should I run assessments?

- **Daily**: Incremental scans on changed files
- **Weekly**: Full repository scan
- **Per PR**: Automatic assessment on pull requests

### Should I auto-merge agent PRs?

No, always require human review. Agents create PRs but humans must:

- Review code changes
- Verify business logic
- Approve for merge

### How do I handle legacy code?

1. **Start with tests**: Add tests before refactoring
2. **Incremental improvement**: Use Fix Packs for small changes
3. **Gradual coverage increase**: Set realistic targets
4. **Document technical debt**: Use Linear for tracking

---

## Performance

### How can I speed up assessments?

- Use incremental scanning: `npm run assess:incremental`
- Limit scope: `npm run assess -- --path src/services`
- Increase worker threads in settings
- Use SSD storage for better I/O

### What are typical processing times?

| Operation                  | Time      |
| -------------------------- | --------- |
| Code assessment (150k LOC) | 10-15 min |
| Fix Pack implementation    | 5-15 min  |
| Pipeline recovery          | 5-10 min  |
| Pattern extraction         | 30-60 min |

### How much does it cost to run?

Estimated costs:

- **Per Fix**: $3 median, $5 p95
- **Per Repository**: $2,500/month limit
- **Total Monthly**: $10,000 global limit

---

## Integration

### Can I use this without Linear?

Yes, but with limitations:

- No automatic task creation
- No sprint planning features
- Manual issue tracking required
- Reduced automation capabilities

### Does it work with GitLab/Bitbucket?

Currently, only GitHub is fully supported. GitLab/Bitbucket support is planned for v2.0.

### Can I integrate with other tools?

Yes, through:

- MCP (Model Context Protocol) for tool integration
- Webhook system for external notifications
- REST/GraphQL APIs for custom integrations
- Plugin architecture (coming in v2.0)

---

## Security

### How are credentials stored?

- Environment variables for local development
- HashiCorp Vault for production
- Never committed to repository
- Encrypted in transit and at rest

### What security scanning is performed?

- CodeQL for static analysis
- Semgrep for pattern matching
- Dependency vulnerability scanning
- Secret detection (Trufflehog)
- RBAC enforcement

### Is my code sent to external services?

Only if explicitly configured:

- Linear API for task management
- GitHub for version control
- Optional: External MCP tools
- All communication is encrypted

---

## Updates and Support

### How do I update the system?

```bash
# Pull latest changes
git pull upstream main

# Update dependencies
npm update

# Run migrations
npm run migrate

# Verify setup
npm test
```

### Where can I get help?

- 📖 [Documentation](../index.md)
- 🐛 [Issue Tracker](https://github.com/your-org/linear-tdd-workflow/issues)
- 💬 [Discord Community](https://discord.gg/example)
- 📧 Email: support@example.com

### How do I report bugs?

1. Check [Troubleshooting Guide](troubleshooting.md)
2. Search existing issues
3. Create detailed bug report with:
   - Error messages
   - Steps to reproduce
   - System information
   - Relevant logs

---

_Last updated: 2024_
_Version: 1.2.0_
_Have a question not answered here? [Open an issue](https://github.com/your-org/linear-tdd-workflow/issues/new)_
