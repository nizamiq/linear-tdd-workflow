# Clean Code Assessment Framework for Claude Code

## Objective
Perform a comprehensive clean code assessment of the entire project, producing actionable Linear issues with clear remediation paths, effort estimates, and priority rankings aligned to industry best practices and project standards.

## Assessment Scope & Methodology

### Execution Parameters
```yaml
assessment_config:
  project_name: "[PROJECT_NAME]"
  codebase_path: "[ROOT_PATH]"
  linear_project: "[LINEAR_PROJECT_NAME]"
  assessment_depth: "comprehensive" # quick|standard|comprehensive
  create_issues: true
  issue_prefix: "[CCA]" # Clean Code Assessment
  batch_size: 10 # Issues to create at once
  priority_threshold: "medium" # minimum priority to create issues
  
output_config:
  generate_report: true
  create_linear_issues: true
  create_pr_templates: true
  estimate_remediation_effort: true
  suggest_quick_wins: true
```

## Phase 1: Multi-Dimensional Code Analysis

### 1.1 Code Quality Metrics Assessment
```python
def assess_code_quality():
    """
    Analyze code against quality metrics and create issues for violations
    """
    metrics_to_evaluate = {
        "complexity": {
            "cyclomatic": {"threshold": 10, "critical": 20},
            "cognitive": {"threshold": 15, "critical": 30},
            "nesting_depth": {"threshold": 4, "critical": 6}
        },
        "maintainability": {
            "file_length": {"threshold": 300, "critical": 500},
            "function_length": {"threshold": 50, "critical": 100},
            "parameter_count": {"threshold": 5, "critical": 7},
            "class_cohesion": {"threshold": 0.5, "critical": 0.3}
        },
        "duplication": {
            "duplicate_blocks": {"threshold": 3, "critical": 5},
            "similar_functions": {"threshold": 0.8, "critical": 0.9}
        },
        "coupling": {
            "afferent_coupling": {"threshold": 20, "critical": 40},
            "efferent_coupling": {"threshold": 20, "critical": 40},
            "instability": {"threshold": 0.8, "critical": 0.9}
        }
    }
    
    for file in project_files:
        violations = analyze_file(file, metrics_to_evaluate)
        if violations:
            create_quality_issue(file, violations)
```

**Linear Issue Template for Quality Violations:**
```markdown
Title: [CCA-Quality] High complexity in {module_name}

Description:
## Code Quality Violations Found

### Location
- **File**: `{file_path}`
- **Lines**: {start_line}-{end_line}
- **Module**: {module_name}

### Violations
| Metric | Current | Threshold | Severity |
|--------|---------|-----------|----------|
| Cyclomatic Complexity | {value} | {threshold} | {severity} |
| Cognitive Complexity | {value} | {threshold} | {severity} |
| Function Length | {value} lines | {threshold} | {severity} |

### Impact Analysis
- **Maintainability Risk**: {risk_level}
- **Bug Probability**: {percentage}%
- **Test Difficulty**: {difficulty}
- **Understanding Time**: ~{minutes} minutes for new developer

### Remediation Strategy
1. **Extract Method**: Break down into smaller functions
2. **Simplify Conditionals**: Use early returns, guard clauses
3. **Introduce Abstractions**: Create helper classes/modules
4. **Apply Design Patterns**: {suggested_patterns}

### Code Example
```{language}
// Current problematic code
{current_code}
```

```{language}
// Suggested refactored version
{suggested_refactor}
```

Labels: ["cca", "quality", "complexity", "{severity}"]
Estimate: {story_points} points
Priority: {priority_level}
```

### 1.2 SOLID Principles Compliance
```python
def assess_solid_principles():
    """
    Evaluate adherence to SOLID principles
    """
    solid_checks = {
        "single_responsibility": check_srp_violations,
        "open_closed": check_ocp_violations,
        "liskov_substitution": check_lsp_violations,
        "interface_segregation": check_isp_violations,
        "dependency_inversion": check_dip_violations
    }
    
    for principle, check_function in solid_checks.items():
        violations = check_function(codebase)
        for violation in violations:
            create_solid_violation_issue(principle, violation)
```

### 1.3 Security Vulnerability Scanning
```python
def security_assessment():
    """
    Comprehensive security analysis
    """
    security_patterns = {
        "critical": {
            "sql_injection": r'(SELECT|INSERT|UPDATE|DELETE).*\+.*input',
            "command_injection": r'(exec|system|eval|Process).*\+.*input',
            "path_traversal": r'\.\./.*file.*operation',
            "hardcoded_secrets": r'(api_key|password|secret|token)\s*=\s*["\']',
            "weak_crypto": r'(MD5|SHA1|DES|RC4)',
        },
        "high": {
            "xss_vulnerable": r'innerHTML.*=.*user.*input',
            "csrf_missing": r'form.*post.*without.*csrf',
            "insecure_random": r'Math\.random.*security',
            "weak_tls": r'TLS(1\.0|1\.1)',
            "unvalidated_redirect": r'redirect.*\+.*params',
        },
        "medium": {
            "verbose_errors": r'stack.*trace.*production',
            "missing_auth": r'(admin|api).*route.*without.*auth',
            "session_fixation": r'session.*id.*from.*request',
            "clickjacking": r'missing.*X-Frame-Options',
        }
    }
    
    for severity, patterns in security_patterns.items():
        for pattern_name, regex in patterns.items():
            matches = scan_pattern(regex)
            if matches:
                create_security_issue(pattern_name, matches, severity)
```

### 1.4 Performance Analysis
```python
def performance_assessment():
    """
    Identify performance bottlenecks and inefficiencies
    """
    performance_checks = {
        "database": {
            "n_plus_one": detect_n_plus_one_queries,
            "missing_indexes": analyze_query_patterns,
            "connection_leaks": check_connection_management,
            "transaction_scope": analyze_transaction_boundaries,
        },
        "memory": {
            "memory_leaks": detect_memory_leaks,
            "large_objects": find_large_object_allocations,
            "cache_misuse": analyze_cache_efficiency,
        },
        "algorithms": {
            "nested_loops": find_nested_iterations,
            "inefficient_sorts": detect_suboptimal_sorting,
            "recursive_depth": check_recursion_depth,
        },
        "io_operations": {
            "sync_in_async": find_blocking_io_in_async,
            "unbuffered_io": detect_unbuffered_operations,
            "resource_cleanup": verify_resource_disposal,
        }
    }
```

## Phase 2: Architecture & Design Assessment

### 2.1 Architectural Patterns Evaluation
```python
def assess_architecture():
    """
    Evaluate architectural integrity and patterns
    """
    architecture_checks = {
        "layer_violations": check_layer_boundaries,
        "circular_dependencies": detect_circular_deps,
        "god_objects": find_god_classes,
        "feature_envy": detect_feature_envy,
        "inappropriate_intimacy": find_inappropriate_coupling,
        "primitive_obsession": detect_primitive_obsession,
        "data_clumps": find_data_clumps,
    }
    
    # Create architectural debt issue
    Linear:create_issue(
        title="[CCA-Arch] Architectural violations detected",
        description=f"""
        ## Architectural Assessment Results
        
        ### Dependency Graph Analysis
        {generate_dependency_graph()}
        
        ### Layer Violations
        {list_layer_violations()}
        
        ### Circular Dependencies
        {list_circular_dependencies()}
        
        ### Recommended Refactoring
        1. **Introduce Facade**: {facades_needed}
        2. **Apply Dependency Injection**: {di_opportunities}
        3. **Extract Interfaces**: {interface_candidates}
        4. **Create Bounded Contexts**: {context_boundaries}
        
        ### Migration Path
        Phase 1: {immediate_fixes}
        Phase 2: {structural_changes}
        Phase 3: {long_term_improvements}
        """,
        labels=["cca", "architecture", "technical-debt"],
        estimate=calculate_refactoring_effort()
    )
```

### 2.2 Design Pattern Opportunities
```python
def identify_pattern_opportunities():
    """
    Identify where design patterns could improve code
    """
    pattern_detectors = {
        "factory": detect_factory_opportunities,
        "strategy": detect_strategy_opportunities,
        "observer": detect_observer_opportunities,
        "decorator": detect_decorator_opportunities,
        "repository": detect_repository_opportunities,
        "unit_of_work": detect_uow_opportunities,
    }
    
    for pattern, detector in pattern_detectors.items():
        opportunities = detector(codebase)
        if opportunities:
            create_pattern_improvement_issue(pattern, opportunities)
```

## Phase 3: Testing & Quality Assurance Assessment

### 3.1 Test Coverage Analysis
```python
def assess_test_coverage():
    """
    Comprehensive test coverage and quality assessment
    """
    coverage_report = {
        "line_coverage": calculate_line_coverage(),
        "branch_coverage": calculate_branch_coverage(),
        "function_coverage": calculate_function_coverage(),
        "mutation_coverage": run_mutation_testing(),
    }
    
    test_quality = {
        "test_pyramid": analyze_test_distribution(),
        "test_isolation": check_test_independence(),
        "test_speed": measure_test_execution_time(),
        "flaky_tests": identify_flaky_tests(),
        "test_readability": assess_test_clarity(),
        "assertion_quality": evaluate_assertions(),
    }
    
    # Create comprehensive testing issue
    Linear:create_issue(
        title="[CCA-Testing] Test coverage gaps identified",
        description=f"""
        ## Test Coverage Assessment
        
        ### Current Coverage
        | Type | Current | Target | Gap |
        |------|---------|--------|-----|
        | Line Coverage | {line}% | 80% | {gap}% |
        | Branch Coverage | {branch}% | 70% | {gap}% |
        | Mutation Score | {mutation}% | 60% | {gap}% |
        
        ### Critical Untested Paths
        {list_untested_critical_paths()}
        
        ### Test Quality Issues
        - Flaky Tests: {flaky_count}
        - Slow Tests (>1s): {slow_count}
        - Tests without assertions: {no_assertion_count}
        - Coupled tests: {coupled_count}
        
        ### Priority Areas for Testing
        1. {critical_untested_module_1}
        2. {critical_untested_module_2}
        3. {critical_untested_module_3}
        
        ### Testing Strategy Recommendation
        {testing_improvement_plan}
        """,
        labels=["cca", "testing", "coverage"],
        priority=calculate_testing_priority()
    )
```

### 3.2 Test Quality Patterns
```python
def assess_test_patterns():
    """
    Evaluate test quality and patterns
    """
    test_smells = {
        "mystery_guest": find_external_dependencies_in_tests,
        "eager_test": find_tests_checking_too_much,
        "lazy_test": find_tests_with_weak_assertions,
        "conditional_logic": find_conditionals_in_tests,
        "duplicate_test_code": find_test_duplication,
        "test_without_assertion": find_assertion_free_tests,
    }
```

## Phase 4: Documentation & Maintainability Assessment

### 4.1 Documentation Coverage
```python
def assess_documentation():
    """
    Evaluate documentation completeness and quality
    """
    doc_requirements = {
        "api_documentation": {
            "openapi_spec": check_openapi_completeness,
            "endpoint_docs": verify_all_endpoints_documented,
            "response_examples": check_example_coverage,
        },
        "code_documentation": {
            "public_api_docs": check_public_method_docs,
            "complex_logic_docs": check_complex_function_docs,
            "inline_comments": assess_comment_quality,
        },
        "architecture_docs": {
            "system_design": check_architecture_docs,
            "data_flow": verify_data_flow_docs,
            "deployment": check_deployment_docs,
        },
        "operational_docs": {
            "runbooks": check_runbook_existence,
            "monitoring": verify_monitoring_docs,
            "troubleshooting": check_troubleshooting_guides,
        }
    }
```

### 4.2 Code Readability Assessment
```python
def assess_readability():
    """
    Evaluate code readability and naming conventions
    """
    readability_checks = {
        "naming_conventions": {
            "variable_names": check_variable_naming,
            "function_names": check_function_naming,
            "class_names": check_class_naming,
            "consistency": check_naming_consistency,
        },
        "code_structure": {
            "indentation": check_indentation_consistency,
            "line_length": check_line_length,
            "file_organization": check_file_structure,
        },
        "cognitive_load": {
            "abbreviations": find_unclear_abbreviations,
            "magic_numbers": find_magic_numbers,
            "complex_expressions": find_complex_boolean_expressions,
        }
    }
```

## Phase 5: Dependency & Technical Debt Assessment

### 5.1 Dependency Analysis
```python
def assess_dependencies():
    """
    Analyze project dependencies for issues
    """
    dependency_checks = {
        "outdated": find_outdated_dependencies,
        "vulnerable": scan_vulnerable_dependencies,
        "unused": find_unused_dependencies,
        "duplicates": find_duplicate_dependencies,
        "license_compliance": check_license_compatibility,
        "size_impact": analyze_bundle_size_impact,
    }
    
    Linear:create_issue(
        title="[CCA-Deps] Dependency updates and security patches needed",
        description=f"""
        ## Dependency Assessment
        
        ### Critical Security Updates
        {list_security_vulnerabilities()}
        
        ### Outdated Dependencies
        | Package | Current | Latest | Breaking Changes |
        |---------|---------|--------|------------------|
        {dependency_table}
        
        ### Unused Dependencies
        {list_unused_deps()}
        
        ### Bundle Size Impact
        {bundle_analysis}
        
        ### Update Strategy
        1. **Immediate**: Security patches
        2. **This Sprint**: Minor updates
        3. **Next Sprint**: Major version updates
        4. **Evaluate**: Consider alternatives for {heavy_deps}
        """,
        labels=["cca", "dependencies", "security"],
        priority=1  # High priority for security
    )
```

### 5.2 Technical Debt Quantification
```python
def quantify_technical_debt():
    """
    Calculate and prioritize technical debt
    """
    debt_categories = {
        "code_debt": calculate_code_debt_hours,
        "design_debt": calculate_design_debt_hours,
        "test_debt": calculate_test_debt_hours,
        "documentation_debt": calculate_doc_debt_hours,
        "infrastructure_debt": calculate_infra_debt_hours,
    }
    
    total_debt_hours = sum(debt_categories.values())
    debt_ratio = total_debt_hours / total_development_hours
    
    # Create technical debt summary
    Linear:create_issue(
        title="[CCA-Debt] Technical Debt Assessment Summary",
        description=f"""
        ## Technical Debt Quantification
        
        ### Total Debt: {total_debt_hours} hours
        ### Debt Ratio: {debt_ratio:.1%}
        
        ### Debt by Category
        {generate_debt_chart()}
        
        ### High-Impact Quick Wins (< 2 hours each)
        1. {quick_win_1}
        2. {quick_win_2}
        3. {quick_win_3}
        
        ### Debt Reduction Roadmap
        **Sprint 1**: {sprint_1_targets} (-{hours} hours debt)
        **Sprint 2**: {sprint_2_targets} (-{hours} hours debt)
        **Sprint 3**: {sprint_3_targets} (-{hours} hours debt)
        
        ### ROI Analysis
        {calculate_debt_reduction_roi()}
        """,
        labels=["cca", "technical-debt", "summary"],
        estimate=8  # Review and planning
    )
```

## Phase 6: Actionable Output Generation

### 6.1 Issue Prioritization Matrix
```python
def create_prioritized_issue_list():
    """
    Create prioritized list of all identified issues
    """
    priority_matrix = {
        "immediate": {  # Do now
            "criteria": "security_critical OR blocking_bugs OR data_loss_risk",
            "sla": "24 hours",
            "labels": ["cca", "critical", "immediate"]
        },
        "high": {  # This sprint
            "criteria": "performance_critical OR user_facing_bugs OR high_complexity",
            "sla": "1 sprint",
            "labels": ["cca", "high-priority", "current-sprint"]
        },
        "medium": {  # Next sprint
            "criteria": "code_quality OR test_coverage OR documentation",
            "sla": "2 sprints",
            "labels": ["cca", "medium-priority", "next-sprint"]
        },
        "low": {  # Backlog
            "criteria": "nice_to_have OR cosmetic OR minor_refactoring",
            "sla": "backlog",
            "labels": ["cca", "low-priority", "backlog"]
        }
    }
```

### 6.2 Remediation Templates
```python
def generate_remediation_templates():
    """
    Create PR templates for common fixes
    """
    templates = {
        "refactoring": generate_refactoring_pr_template,
        "security_fix": generate_security_pr_template,
        "performance": generate_performance_pr_template,
        "test_addition": generate_test_pr_template,
    }
    
    for template_type, generator in templates.items():
        template = generator()
        save_to_repo(f".github/pull_request_template_{template_type}.md", template)
```

### 6.3 Executive Summary Generation
```python
def create_executive_summary():
    """
    Create high-level summary for stakeholders
    """
    Linear:create_issue(
        title="[CCA] Clean Code Assessment - Executive Summary",
        description=f"""
        # Clean Code Assessment Report
        **Date**: {assessment_date}
        **Project**: {project_name}
        **Assessment Type**: {assessment_depth}
        
        ## 🎯 Key Findings
        
        ### Overall Health Score: {score}/100
        
        | Category | Score | Status |
        |----------|-------|--------|
        | Code Quality | {quality_score}/100 | {status_emoji} |
        | Security | {security_score}/100 | {status_emoji} |
        | Performance | {perf_score}/100 | {status_emoji} |
        | Testing | {test_score}/100 | {status_emoji} |
        | Documentation | {doc_score}/100 | {status_emoji} |
        
        ## 🚨 Critical Issues (Immediate Action Required)
        1. {critical_issue_1} - {impact}
        2. {critical_issue_2} - {impact}
        3. {critical_issue_3} - {impact}
        
        ## 📊 Technical Debt Summary
        - **Total Debt**: {total_hours} hours ({total_days} days)
        - **Monthly Interest**: {monthly_interest_hours} hours
        - **Break-even Point**: {break_even_sprints} sprints
        
        ## 🎯 Recommended Action Plan
        
        ### Week 1: Critical Security & Bugs
        - [ ] {critical_action_1} (8 hours)
        - [ ] {critical_action_2} (4 hours)
        - [ ] {critical_action_3} (6 hours)
        
        ### Week 2-3: High-Impact Improvements
        - [ ] {improvement_1} (16 hours)
        - [ ] {improvement_2} (12 hours)
        
        ### Week 4: Testing & Documentation
        - [ ] {test_improvement} (20 hours)
        - [ ] {doc_improvement} (8 hours)
        
        ## 📈 Expected Outcomes
        - **Bug Reduction**: {bug_reduction}% fewer production issues
        - **Performance Gain**: {perf_gain}% faster response times
        - **Development Velocity**: {velocity_gain}% increase after debt reduction
        - **Maintenance Cost**: {cost_reduction}% reduction
        
        ## 🔗 Detailed Reports
        - [Full Technical Report]({link_to_detailed_report})
        - [Issue List]({linear_filter_link})
        - [Remediation Playbook]({playbook_link})
        
        ## 💰 Investment Required
        - **Total Effort**: {total_story_points} points
        - **Team Days**: {team_days}
        - **Recommended Allocation**: {allocation}% of sprint capacity
        
        ## ✅ Success Metrics
        Track these KPIs over next 3 sprints:
        1. Code coverage increase to {target_coverage}%
        2. Cyclomatic complexity < {target_complexity}
        3. Zero critical security vulnerabilities
        4. Performance budget adherence
        5. Documentation coverage > {target_docs}%
        """,
        labels=["cca", "summary", "executive"],
        priority=1
    )
```

## Phase 7: Continuous Monitoring Setup

### 7.1 Create Monitoring Issues
```python
def setup_continuous_monitoring():
    """
    Create issues for setting up continuous monitoring
    """
    monitoring_tasks = [
        {
            "title": "[CCA-Monitor] Set up automated code quality checks",
            "description": "Implement pre-commit hooks and CI/CD quality gates",
            "estimate": 5
        },
        {
            "title": "[CCA-Monitor] Configure security scanning in CI",
            "description": "Add SAST, DAST, and dependency scanning",
            "estimate": 8
        },
        {
            "title": "[CCA-Monitor] Implement performance monitoring",
            "description": "Set up APM and performance budgets",
            "estimate": 13
        },
    ]
    
    for task in monitoring_tasks:
        Linear:create_issue(**task, labels=["cca", "monitoring", "automation"])
```

## Execution Instructions for Claude Code

### Pre-Assessment Setup
```bash
# 1. Verify Linear connection
linear_status = check_linear_connection()

# 2. Create assessment tracking issue
tracking_issue = Linear:create_issue(
    title="[CCA] Clean Code Assessment in Progress",
    description="Tracking issue for automated assessment"
)

# 3. Install analysis tools
install_tools(["eslint", "sonarjs", "jest", "dependency-check"])
```

### Assessment Execution Flow
```python
def execute_assessment():
    print("Starting Clean Code Assessment...")
    
    # Phase 1: Analysis
    print("Phase 1/7: Analyzing code quality...")
    quality_issues = assess_code_quality()
    
    print("Phase 2/7: Checking security...")
    security_issues = security_assessment()
    
    print("Phase 3/7: Evaluating architecture...")
    architecture_issues = assess_architecture()
    
    print("Phase 4/7: Analyzing tests...")
    test_issues = assess_test_coverage()
    
    print("Phase 5/7: Reviewing documentation...")
    doc_issues = assess_documentation()
    
    print("Phase 6/7: Calculating technical debt...")
    debt_summary = quantify_technical_debt()
    
    print("Phase 7/7: Generating reports...")
    create_executive_summary()
    
    # Create issues in batches
    all_issues = quality_issues + security_issues + architecture_issues + test_issues + doc_issues
    create_issues_in_batches(all_issues, batch_size=10)
    
    print(f"""
    ✅ Assessment Complete!
    - Total Issues Created: {len(all_issues)}
    - Critical Issues: {count_critical}
    - Total Debt: {total_debt_hours} hours
    - Linear Project: {linear_project_link}
    """)
```

## Success Criteria

✅ Assessment completes without errors
✅ All findings have Linear issues created
✅ Issues are properly labeled and prioritized
✅ Each issue has clear remediation steps
✅ Executive summary provides actionable insights
✅ Technical debt is quantified in hours
✅ Quick wins are identified and highlighted
✅ ROI analysis justifies remediation effort
✅ Continuous monitoring tasks are created

## Post-Assessment Actions

1. **Review Meeting**: Schedule review of executive summary
2. **Sprint Planning**: Incorporate high-priority issues
3. **Team Training**: Address knowledge gaps identified
4. **Tool Setup**: Implement recommended automation
5. **Progress Tracking**: Monitor debt reduction velocity
