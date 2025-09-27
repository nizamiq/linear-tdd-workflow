# CLAUDE.md - Agent Workflow Specification

## Repository Metadata

**Project**: Linear TDD Workflow System
**Version**: 1.2
**Status**: Active Development - Phase 0
**Owner**: Engineering Excellence Team
**Last Updated**: 2024

## Purpose

This document provides machine-readable workflow specifications for the autonomous multi-agent system that manages code quality through continuous assessment, prioritized execution, and rigorous TDD validation. It serves as the authoritative guide for all agent operations within this repository.

## Core Objectives

1. **Reduce engineering maintenance time by 40%**
2. **Achieve 50% faster MTTR (Mean Time to Recovery)**
3. **Improve PR cycle time by 30-35%**
4. **Increase test coverage on touched code by 20+ percentage points**
5. **Reduce technical debt hotspots monthly**

## Guardrails & Constraints

### Mandatory Guardrails

1. **TDD Enforcement**: Every change MUST follow [RED]→[GREEN]→[REFACTOR] cycle
2. **Fix Pack Limits**: Maximum 300 LOC per PR
3. **Coverage Requirements**: Diff coverage ≥80%, mutation testing ≥30%
4. **Human Approval**: All agent PRs require human review before merge
5. **Feature Control**: FIL-2/FIL-3 changes require FEAT-APPROVED label
6. **Repository Limits**: Max 3 concurrent repos, each ≤200k LOC
7. **Budget Controls**: $2.5k per repo monthly, $10k global monthly limit

### Operational Constraints

- **Languages**: JavaScript/TypeScript, Python only (v1)
- **Environments**: Development & Staging only (no direct production)
- **Access**: Read-only by default, PR-only writes
- **Rollback**: ≤0.3% rollback rate tolerance
- **Pipeline**: ≥95% uptime requirement

## Agent Roles & Responsibilities

### AUDITOR
**Purpose**: Continuous code quality assessment
**Capabilities**:
- AST/CFG analysis for code complexity
- Pattern detection and anti-pattern identification
- Security vulnerability scanning
- Documentation coverage assessment
- Test coverage analysis

**Tools**: `code_search`, `analyze_complexity`, `detect_patterns`, `create_linear_task`
**SLAs**: First scan ≤12min (JS/TS), ≤15min (Python) for 150k LOC
**Success Criteria**: ≥80% actionable items, ≤10% false positives

### EXECUTOR
**Purpose**: Implementation of approved improvements
**Capabilities**:
- Fix Pack implementation (pre-approved changes only)
- Test-first development enforcement
- Atomic commit generation
- PR creation with full documentation

**Tools**: `code_patch`, `run_tests`, `commit_changes`, `create_pr`
**Constraints**: Fix Packs only, ≤300 LOC, diff coverage ≥80%
**Success Criteria**: ≥8 accepted PRs/day, ≤0.3% rollback rate

### GUARDIAN
**Purpose**: CI/CD pipeline protection and recovery
**Capabilities**:
- Pipeline failure detection and analysis
- Automated fix generation for common failures
- Rollback orchestration when needed
- Test flakiness detection and mitigation

**Tools**: `analyze_failure`, `generate_fix`, `run_local_tests`, `trigger_pipeline`
**SLAs**: Detection ≤5min, recovery ≤10min p95
**Success Criteria**: Pipeline uptime ≥95%, auto-fix success ≥90%

### STRATEGIST
**Purpose**: Multi-agent orchestration and planning
**Capabilities**:
- Task prioritization and assignment
- Resource allocation optimization
- Dependency resolution
- Conflict prevention and resolution

**Tools**: `assign_task`, `update_linear`, `coordinate_agents`, `generate_report`
**Performance**: Resource utilization ≥75%, context switches ≤3/agent/day
**Success Criteria**: On-time delivery ≥90%, orchestration overhead ≤5%

### SCHOLAR
**Purpose**: Continuous learning and pattern extraction
**Capabilities**:
- Pattern extraction from successful fixes
- Knowledge base maintenance
- Efficiency optimization recommendations
- Anti-pattern detection and prevention

**Tools**: `extract_patterns`, `update_knowledge_base`, `train_agents`, `generate_insights`
**Targets**: ≥2 validated patterns/month, ≥25% pattern reuse
**Success Criteria**: Efficiency gains ≥10% month-over-month

## Workflow Steps

### 1. Assessment Workflow
```yaml
trigger: scheduled | manual | webhook
steps:
  - agent: AUDITOR
    action: scan_repository
    inputs:
      - repository_url
      - branch
      - scope (full | incremental)
    outputs:
      - issues[]
      - metrics{}
      - priority_score
  - agent: AUDITOR
    action: create_linear_tasks
    condition: issues.length > 0
    inputs:
      - issues[]
      - team_id
    outputs:
      - task_ids[]
```

### 2. Fix Implementation Workflow
```yaml
trigger: linear_task_assigned
steps:
  - agent: EXECUTOR
    action: validate_fix_pack
    inputs:
      - task_details
    outputs:
      - is_fix_pack: boolean
      - estimated_loc: number
  - agent: EXECUTOR
    action: write_failing_test
    condition: is_fix_pack == true
    tag: "[RED]"
  - agent: EXECUTOR
    action: implement_fix
    tag: "[GREEN]"
  - agent: EXECUTOR
    action: refactor_code
    condition: tests_passing == true
    tag: "[REFACTOR]"
  - agent: EXECUTOR
    action: create_pr
    validations:
      - diff_coverage >= 80
      - mutation_score >= 30
      - all_tests_passing
```

### 3. Pipeline Recovery Workflow
```yaml
trigger: pipeline_failure
steps:
  - agent: GUARDIAN
    action: analyze_failure
    timeout: 5min
    outputs:
      - failure_type
      - can_auto_fix: boolean
  - agent: GUARDIAN
    action: generate_fix
    condition: can_auto_fix == true
    max_attempts: 3
  - agent: GUARDIAN
    action: trigger_rollback
    condition: fix_attempts >= 3
  - agent: GUARDIAN
    action: notify_humans
    condition: auto_fix_failed == true
```

## Change Control Rules

### Feature Impact Level (FIL) Classification

```yaml
FIL-0:  # No approval needed
  - formatting_changes
  - dead_code_removal
  - comment_updates

FIL-1:  # No approval needed
  - variable_renames
  - constant_extraction
  - small_refactors (<50 LOC)

FIL-2:  # Tech Lead approval required
  - new_utility_functions
  - config_changes
  - test_framework_updates

FIL-3:  # Tech Lead + Product Owner approval
  - new_apis
  - database_migrations
  - ui_routes
  - breaking_changes
```

### Approval Workflow
```yaml
classification:
  - tool: fil_classifier
    timeout: 2s

approval_rules:
  FIL-0|FIL-1: auto_approved
  FIL-2:
    required: [tech_lead]
    timeout: 24h
  FIL-3:
    required: [tech_lead, product_owner]
    timeout: 48h

enforcement:
  - block_merge_without_approval: true
  - require_feat_approved_label: true
```

## MCP Tool Specifications

### Sequential Thinking
```yaml
purpose: Complex problem solving and reasoning
operations:
  - think(problem, constraints)
  - reason(context, goals)
  - solve(problem, approach)
sla: <30s p95
usage: Complex refactoring, architecture decisions
```

### Context7 Search
```yaml
purpose: Code and documentation understanding
operations:
  - search(query, scope)
  - analyze(code, patterns)
  - explain(concept, level)
sla: <5s p95
usage: Code comprehension, pattern matching
```

### Linear Tasks
```yaml
purpose: Task management and tracking
operations:
  - create(title, description, team_id)
  - update(task_id, status, fields)
  - transition(task_id, state)
sla: <2s p95
usage: Issue tracking, progress updates
```

### Playwright Test
```yaml
purpose: End-to-end test automation
operations:
  - test(spec, url)
  - screenshot(page, selector)
  - trace(actions, timeout)
sla: <60s p95
usage: E2E validation, visual regression
```

## Communication Protocols

### Agent Message Format
```json
{
  "id": "uuid-v4",
  "timestamp": "ISO-8601",
  "from_agent": "AGENT_NAME",
  "to_agent": "AGENT_NAME | BROADCAST",
  "type": "request | response | event",
  "priority": "low | normal | high | critical",
  "payload": {
    "action": "string",
    "params": {},
    "context": {
      "repository": "string",
      "branch": "string",
      "task_id": "string",
      "correlation_id": "uuid-v4"
    }
  },
  "timeout_ms": 30000
}
```

### Event Types
```yaml
assessment_complete:
  emitted_by: AUDITOR
  consumed_by: [STRATEGIST, LINEAR]

fix_pack_ready:
  emitted_by: STRATEGIST
  consumed_by: [EXECUTOR]

pipeline_failure:
  emitted_by: CI_SYSTEM
  consumed_by: [GUARDIAN]

pr_created:
  emitted_by: EXECUTOR
  consumed_by: [LINEAR, STRATEGIST]

pattern_identified:
  emitted_by: SCHOLAR
  consumed_by: [STRATEGIST, EXECUTOR]
```

## Audit & Compliance Requirements

### Audit Trail
```yaml
retention: 90 days
storage: immutable
fields:
  - timestamp
  - agent_id
  - action
  - repository
  - task_id
  - user_approval
  - fil_classification
  - outcome
  - duration_ms

export:
  formats: [json, csv]
  destinations: [siem, s3, elasticsearch]
```

### Compliance Checks
```yaml
pre_execution:
  - rbac_validation
  - budget_check
  - repository_access
  - fil_classification

post_execution:
  - coverage_validation
  - security_scan
  - dependency_check
  - documentation_update
```

## Performance SLAs

### Critical Operations
| Operation | Target | Alerting Threshold |
|-----------|--------|-------------------|
| Code Assessment | ≤12min p95 | >15min |
| Fix Implementation | ≤15min p50 | >20min |
| Pipeline Recovery | ≤10min p95 | >15min |
| Linear Sync | ≤2s p95 | >5s |
| FIL Classification | ≤2s p95 | >3s |

### System Metrics
| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Agent Availability | 99.0% | <95% |
| Task Success Rate | 90% | <80% |
| Pattern Reuse | 25% | <15% |
| Cost per Fix | ≤$3 | >$5 |

## Error Handling

### Retry Strategy
```yaml
transient_errors:
  max_retries: 3
  backoff: exponential
  base_delay: 1s
  max_delay: 30s

permanent_errors:
  max_retries: 0
  action: escalate_to_human

timeout_errors:
  max_retries: 1
  action: reassign_task
```

### Escalation Path
```yaml
levels:
  L1: agent_retry
  L2: strategist_intervention
  L3: human_operator
  L4: engineering_lead

triggers:
  - repeated_failures > 3
  - pipeline_down > 10min
  - budget_exceeded
  - security_violation
```

## Integration Points

### GitHub
- Webhook events: push, pull_request, workflow_run
- API operations: create_pr, update_status, add_comment
- Branch protection: enforce policies, require reviews

### Linear
- Webhook events: issue_create, issue_update, comment_added
- API operations: create_issue, update_status, add_attachment
- Sync frequency: real-time for updates, batch for creation

### CI/CD
- GitHub Actions integration
- Status checks enforcement
- Artifact management
- Secret management via HashiCorp Vault

## Security Controls

### Access Management
```yaml
authentication:
  method: oauth2
  provider: github
  token_rotation: 24h

authorization:
  model: rbac
  inheritance: github_teams
  audit: all_operations

secrets:
  storage: hashicorp_vault
  rotation: 30d
  encryption: aes-256-gcm
```

### Code Security
```yaml
scanning:
  - static_analysis: codeql, semgrep
  - dependency_check: snyk, dependabot
  - secret_detection: trufflehog, gitleaks

policies:
  - no_hardcoded_secrets
  - no_vulnerable_dependencies
  - signed_commits_required
  - sbom_generation_required
```

## Maintenance Windows

### Scheduled Maintenance
```yaml
pattern_extraction:
  schedule: "0 2 * * 0"  # Weekly Sunday 2 AM
  duration: 2h

knowledge_base_update:
  schedule: "0 3 * * *"  # Daily 3 AM
  duration: 30min

metrics_aggregation:
  schedule: "0 * * * *"  # Hourly
  duration: 5min
```

## Success Criteria

### Phase 0 (Current)
- [ ] Agents can read code
- [ ] Linear tasks created automatically
- [ ] Basic PR comments functional

### Phase 1
- [ ] ≥80% actionable assessment items
- [ ] ≤10% false positive rate
- [ ] SLAs consistently met

### Phase 2
- [ ] ≥8 Fix Pack PRs/day
- [ ] Diff coverage ≥80% achieved
- [ ] GUARDIAN auto-recovery operational

### Phase 3
- [ ] ≥25% pattern reuse
- [ ] ≥80% auto-rebase success
- [ ] Efficiency gains documented

### Phase 4
- [ ] 3 concurrent repositories
- [ ] Beta SLOs met for 30 days
- [ ] Ready for GA rollout

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2 | 2024 | Added FIL classification, Fix Pack specs |
| 1.1 | 2024 | Enhanced guardrails, RBAC matrix |
| 1.0 | 2024 | Initial specification |

---

*This document is machine-readable and should be parsed by the agent system for operational guidance. Updates require approval from the Engineering Excellence team.*