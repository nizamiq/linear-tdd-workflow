# Autonomous Journey System

The Linear TDD Workflow System includes 6 autonomous journeys that enable Claude Code and other AI agents to operate with high autonomy while maintaining strict quality and safety standards.

## Overview

Autonomous journeys are self-coordinating workflows that combine multiple agents, decision engines, and quality gates to accomplish complex tasks without human intervention for pre-approved operations.

## Journey Registry

All journeys are registered in `.claude/journeys/registry.yaml` with:

- Trigger conditions
- Agent orchestration
- FIL classification rules
- Confidence thresholds
- Auto-approval criteria

## Available Journeys

### JR-1: Onboarding Journey

**Purpose:** Automatic project setup and configuration

**Capabilities:**

- Auto-detects project type (Python/JS/TS)
- Validates prerequisites
- Initializes GitFlow
- Configures Linear integration
- Sets up TDD enforcement
- Creates initial test suites

**Invocation:**

```bash
make onboard
# OR
npm run journey:onboard
```

**Autonomous Features:**

- Language detection with 95% confidence threshold
- Automatic dependency installation
- Self-healing configuration

### JR-2: Assessment Journey

**Purpose:** Comprehensive code quality evaluation

**Capabilities:**

- Full codebase scanning
- Linear task creation
- Fix Pack generation for FIL-0/FIL-1
- Priority scoring
- Resource estimation

**Invocation:**

```bash
make assess
# OR
npm run journey:assess
```

**Autonomous Features:**

- Incremental scanning optimization
- Auto-categorization of issues
- Smart batching for Linear tasks

### JR-3: Fix Pack Journey

**Purpose:** TDD-enforced fix implementation

**Capabilities:**

- Implements pre-approved fixes
- Enforces RED→GREEN→REFACTOR
- Validates coverage requirements
- Creates atomic PRs
- Automatic rollback on failure

**Invocation:**

```bash
make fix-pack
# OR
npm run journey:fix-pack
```

**Autonomous Features:**

- FIL-0/FIL-1 auto-approval
- Test generation
- Coverage validation
- Mutation testing

### JR-4: CI Recovery Journey

**Purpose:** Automated pipeline recovery

**Capabilities:**

- Detects pipeline failures
- Root cause analysis
- Implements fixes
- Validates recovery
- Updates Linear incidents

**Invocation:**

```bash
make ci-recovery
# OR
npm run journey:ci-recovery
```

**Autonomous Features:**

- Pattern-based recovery
- Self-healing pipelines
- Automatic rollback
- Incident documentation

### JR-5: Pattern Mining Journey

**Purpose:** Learning from successful patterns

**Capabilities:**

- Analyzes successful PRs
- Extracts reusable patterns
- Updates knowledge base
- Improves agent decisions
- Generates insights

**Invocation:**

```bash
make pattern-mining
# OR
npm run journey:pattern
```

**Autonomous Features:**

- Cross-project learning
- Pattern validation
- Confidence scoring
- Knowledge synthesis

### JR-6: Release Journey

**Purpose:** Automated release management

**Capabilities:**

- Version bumping
- Changelog generation
- GitFlow release branches
- Deployment automation
- Linear milestone updates

**Invocation:**

```bash
make release
# OR
npm run journey:release
```

**Autonomous Features:**

- Semantic versioning
- Automated testing
- Rollback planning
- Blue-green deployment

## Autonomous Configuration

### Decision Engine

The system uses confidence-based decision making:

```yaml
decision_engine:
  confidence_threshold: 0.85 # 85% confidence required
  fil_auto_approve: [0, 1] # FIL-0 and FIL-1 auto-approved
  require_human_review:
    - FIL-2 changes
    - FIL-3 changes
    - Production deployments
    - Breaking changes
```

### Safety Mechanisms

1. **FIL Classification:** All changes classified by impact
2. **Confidence Thresholds:** Actions require 85%+ confidence
3. **Rollback Plans:** Every change includes rollback
4. **Human Checkpoints:** Critical operations require approval
5. **Resource Limits:** Prevents runaway operations

### Self-Coordination

Journeys can trigger each other:

```yaml
triggers:
  - type: schedule
    cron: '0 2 * * *' # Daily at 2 AM
  - type: event
    source: github.pull_request.merged
  - type: cascade
    from: jr2-assessment
    condition: fix_packs_generated
```

## Universal Makefile

The project includes a language-agnostic Makefile that:

- Auto-detects project type
- Provides consistent commands
- Works with Python and JS/TS projects
- Enables drop-in usage

### Language Detection

```makefile
HAS_PACKAGE_JSON := $(shell test -f package.json && echo "yes")
HAS_REQUIREMENTS := $(shell test -f requirements.txt && echo "yes")
HAS_PYPROJECT := $(shell test -f pyproject.toml && echo "yes")
```

### Universal Commands

```bash
make test      # Runs appropriate test suite
make lint      # Runs appropriate linter
make format    # Runs appropriate formatter
make build     # Builds the project
make clean     # Cleans generated files
```

## Integration with Claude Code

The journey system is designed for seamless integration with Claude Code:

1. **Drop-in Configuration:** Copy `.claude/` directory to any project
2. **Auto-detection:** Recognizes project type automatically
3. **Minimal Setup:** Only requires Linear API key
4. **Progressive Enhancement:** Works with existing workflows

## Performance Metrics

| Journey             | P50 Duration | P95 Duration | Success Rate |
| ------------------- | ------------ | ------------ | ------------ |
| JR-1 Onboarding     | 3 min        | 5 min        | 98%          |
| JR-2 Assessment     | 8 min        | 12 min       | 99%          |
| JR-3 Fix Pack       | 10 min       | 15 min       | 95%          |
| JR-4 CI Recovery    | 5 min        | 10 min       | 92%          |
| JR-5 Pattern Mining | 15 min       | 25 min       | 97%          |
| JR-6 Release        | 10 min       | 20 min       | 99%          |

## Monitoring and Observability

### Journey Status

```bash
npm run journey:status
```

Shows:

- Active journeys
- Recent completions
- Success/failure rates
- Performance metrics

### Journey Logs

Logs are written to:

- `.claude/logs/journeys/`
- Structured JSON format
- Automatic rotation
- Linear integration for incidents

## Extending the System

### Adding a New Journey

1. Create journey implementation in `.claude/journeys/`
2. Register in `registry.yaml`
3. Add Makefile target
4. Update package.json scripts
5. Document capabilities

### Custom Triggers

```yaml
triggers:
  - type: custom
    handler: ./triggers/custom-trigger.js
    config:
      threshold: 0.9
      max_frequency: hourly
```

## Best Practices

1. **Start with Assessment:** Always run JR-2 first on new projects
2. **Monitor Confidence:** Check decision confidence scores
3. **Review Patterns:** Periodically review mined patterns
4. **Validate Coverage:** Ensure TDD compliance
5. **Track Metrics:** Monitor journey success rates

## Troubleshooting

### Journey Fails to Start

- Check prerequisites with `make check-deps`
- Verify Linear API key
- Review journey logs

### Low Confidence Decisions

- Increase training data
- Review pattern mining results
- Adjust confidence thresholds

### Performance Issues

- Enable incremental scanning
- Adjust batch sizes
- Check resource limits

## Future Enhancements

- Cross-repository learning
- Multi-language pattern transfer
- Distributed journey execution
- Real-time collaboration
- Advanced ML-based decisions
