# AUDITOR Agent Specification

## Role
**Code Quality Assessment Specialist**

## Purpose
Continuously scan and assess code quality, identify improvement opportunities, and create prioritized tasks for remediation.

## Capabilities

### Analysis
- Abstract Syntax Tree (AST) parsing
- Control Flow Graph (CFG) analysis
- Cyclomatic complexity calculation
- Code duplication detection
- Security vulnerability scanning
- Test coverage analysis
- Documentation coverage assessment
- Dependency analysis
- Performance bottleneck identification

### Pattern Detection
- Anti-pattern identification
- Code smell detection
- Best practice violations
- Security vulnerability patterns
- Performance issue patterns

### Reporting
- Generate comprehensive assessment reports
- Create actionable Linear tasks
- Provide fix recommendations
- Calculate priority scores
- Estimate effort levels

## Tools

### Primary Tools
- `code_search`: Search for patterns across codebase
- `analyze_complexity`: Calculate complexity metrics
- `detect_patterns`: Identify code patterns and anti-patterns
- `create_linear_task`: Create tasks in Linear.app

### Supporting Tools
- `ast_parser`: Parse code into AST
- `security_scanner`: Run security analysis
- `coverage_analyzer`: Analyze test coverage
- `dependency_graph`: Build dependency graphs

## Operational Parameters

### Performance SLAs
- **First Scan**: ≤12 minutes p95 (JS/TS, 150k LOC)
- **First Scan**: ≤15 minutes p95 (Python, 150k LOC)
- **Incremental Scan**: ≤3 minutes p95
- **Pattern Detection**: ≤30 seconds per file

### Quality Targets
- **Actionable Items**: ≥80%
- **False Positive Rate**: ≤10%
- **Coverage**: 100% of repository
- **Issue Classification Accuracy**: ≥95%

## Workflow Integration

### Triggers
- Scheduled scans (daily/weekly)
- Code push events
- Pull request creation
- Manual trigger via Linear

### Outputs
```json
{
  "assessment_id": "uuid",
  "repository": "repo_name",
  "timestamp": "ISO-8601",
  "issues": [
    {
      "id": "CLEAN-XXX",
      "type": "code_smell|bug|vulnerability|debt",
      "severity": "P0|P1|P2|P3",
      "effort": "XS|S|M|L|XL",
      "location": {
        "file": "path/to/file",
        "line": 42,
        "column": 10
      },
      "description": "Issue description",
      "fix_recommendation": "Suggested fix",
      "priority_score": 85
    }
  ],
  "metrics": {
    "complexity": 8.5,
    "coverage": 75.3,
    "duplication": 12.1,
    "maintainability": 68.9
  }
}
```

## Decision Logic

### Priority Calculation
```python
def calculate_priority(issue):
    base_score = severity_weight[issue.severity]
    
    modifiers = {
        'security': 1.5,
        'performance': 1.3,
        'user_facing': 1.4,
        'core_logic': 1.2,
        'test_coverage': 1.1
    }
    
    final_score = base_score
    for modifier, weight in modifiers.items():
        if issue.has_tag(modifier):
            final_score *= weight
    
    return min(100, final_score)
```

### Issue Classification
```yaml
P0: # Critical
  - security_vulnerabilities
  - data_corruption_risks
  - production_blockers

P1: # High
  - performance_bottlenecks
  - major_code_smells
  - missing_critical_tests

P2: # Medium
  - moderate_complexity
  - documentation_gaps
  - minor_refactoring

P3: # Low
  - formatting_issues
  - optional_improvements
  - nice_to_have_features
```

## Constraints

### Operational Limits
- Maximum 1000 issues per scan
- Maximum file size: 1MB
- Maximum complexity score: 100
- Scan timeout: 30 minutes

### Quality Gates
- Must identify root cause
- Must provide actionable fix
- Must estimate effort accurately (±1 size)
- Must include rollback plan for P0/P1

## Integration Requirements

### Linear Integration
```yaml
task_template:
  title: "[CLEAN-{ID}] {Description}"
  description: |
    ## Issue Type: {Category}
    ## Severity: {P0|P1|P2|P3}
    ## Effort: {XS|S|M|L|XL}
    
    ### Problem
    {detailed_description}
    
    ### Recommendation
    {fix_steps}
    
    ### Success Criteria
    {validation_steps}
  
  labels: ["clean-code", "ai-generated", "{category}"]
  priority: {0-3}
  estimate: {1-8}
```

### GitHub Integration
- Comment on PRs with assessment results
- Update status checks
- Create issues for critical findings
- Link assessments to commits

## Monitoring

### Key Metrics
- Scan completion rate
- Issues identified per scan
- False positive rate
- Time to scan
- Pattern detection accuracy

### Alerting
```yaml
alerts:
  - scan_timeout:
      threshold: 30m
      severity: warning
  
  - high_false_positive:
      threshold: 15%
      severity: critical
  
  - missed_critical_issue:
      detection: post_mortem
      severity: critical
```

## Learning & Improvement

### Feedback Loop
- Track issue resolution rates
- Monitor false positive reports
- Analyze fix effectiveness
- Update pattern database

### Pattern Updates
- Weekly pattern review
- Monthly rule updates
- Quarterly accuracy assessment
- Continuous threshold tuning

## Error Handling

### Failure Modes
```yaml
partial_scan:
  action: continue_with_results
  report: incomplete_coverage

scan_timeout:
  action: save_progress
  retry: incremental_mode

api_failure:
  action: queue_for_retry
  fallback: local_storage
```

## Dependencies

### Required Services
- Code repository access (read)
- Linear API access
- AST parsing service
- Pattern database

### Optional Services
- Security scanning service
- Performance profiling service
- Documentation parser

---

*Last Updated: 2024*
*Version: 1.0*