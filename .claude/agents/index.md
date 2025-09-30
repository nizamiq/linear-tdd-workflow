# Agent Registry

This file serves as the central registry for all agents in the Linear TDD Workflow System.

## Core Agents

### AUDITOR
- **Role**: Code Quality Assessment & Standards Enforcer
- **Model**: sonnet
- **Capabilities**: clean_code_principles, solid_architecture_analysis, technical_debt_detection, security_vulnerability_scanning, performance_bottleneck_identification
- **Primary Command**: `/assess`
- **Use Proactively**: Before releases, after major changes, weekly for continuous improvement

### EXECUTOR
- **Role**: TDD Implementation Engine
- **Model**: opus
- **Capabilities**: strict_tdd_enforcement, red_green_refactor_cycle, test_driven_development, fix_pack_implementation, mutation_testing
- **Primary Command**: `/fix`
- **Use Proactively**: Any code implementation, bug fixes, or refactoring tasks

### GUARDIAN
- **Role**: CI/CD Pipeline Recovery Specialist
- **Capabilities**: pipeline_recovery, ci_cd_monitoring, deployment_safety, incident_response, linear_integration
- **Primary Command**: `/recover`

### STRATEGIST
- **Role**: Workflow Orchestrator & Linear Mediator
- **Capabilities**: workflow_orchestration, multi_agent_coordination, linear_management, gitflow_management, release_coordination
- **Primary Commands**: `/release`, `/status`

### SCHOLAR
- **Role**: Learning & Pattern Recognition Engine
- **Capabilities**: pattern_recognition, success_analysis, knowledge_extraction, learning_optimization, linear_integration
- **Primary Command**: `/learn`

### PLANNER
- **Role**: Cycle Planning Orchestrator
- **Capabilities**: cycle_planning, sprint_orchestration, capacity_planning, backlog_analysis, linear_integration
- **Primary Command**: `/cycle`

## Supporting Agents

### TESTER
- **Role**: Test-First Engineering Specialist
- **Capabilities**: test_creation, tdd_enforcement, test_automation, quality_assurance, playwright_integration

### LINTER
- **Role**: Code Style & Format Enforcement
- **Capabilities**: code_formatting, style_enforcement, autofix_generation, safe_transformations

### TYPECHECKER
- **Role**: Type Safety Validation Specialist
- **Capabilities**: type_checking, static_analysis, type_safety_enforcement, typescript_validation

### VALIDATOR
- **Role**: Quality Gate & Deployment Readiness Enforcer
- **Capabilities**: quality_validation, deployment_readiness, acceptance_testing, final_review, playwright_integration

### SECURITY
- **Role**: Security & Vulnerability Scanner
- **Capabilities**: security_scanning, vulnerability_detection, static_analysis, dependency_auditing

## Specialized Agents

### CODE-REVIEWER
- **Role**: Elite Code Review & Analysis Expert
- **Model**: opus
- **Capabilities**: ai_powered_code_analysis, security_vulnerability_detection, performance_optimization_review, production_reliability_assessment
- **Use Proactively**: Pull request reviews, security audits, code quality assessments

### TEST-AUTOMATOR
- **Role**: Test Automation & TDD Excellence Expert
- **Model**: sonnet
- **Capabilities**: strict_tdd_enforcement, ai_powered_test_generation, self_healing_test_automation, property_based_testing, mutation_testing
- **Use Proactively**: Test creation, TDD enforcement, quality automation

### LEGACY-MODERNIZER
- **Role**: Legacy Code Modernization Specialist
- **Model**: sonnet
- **Capabilities**: legacy_code_refactoring, framework_migration, technical_debt_reduction, monolith_decomposition, incremental_migration
- **Use Proactively**: Legacy system updates, dependency upgrades, monolith decomposition

## Infrastructure & Deployment Agents

### KUBERNETES-ARCHITECT
- **Role**: Cloud-Native Infrastructure & Kubernetes Expert
- **Model**: opus
- **Capabilities**: kubernetes_orchestration, gitops_workflows, multi_cloud_architecture, service_mesh_istio_linkerd, cost_optimization
- **Primary Command**: `/deploy` (shared with DEPLOYMENT-ENGINEER)
- **Use Proactively**: K8s manifests, deployment strategies, cloud-native architecture

### DEPLOYMENT-ENGINEER
- **Role**: CI/CD Pipeline & Deployment Automation Expert
- **Model**: sonnet
- **Capabilities**: github_actions_mastery, gitops_workflows, progressive_delivery, zero_downtime_deployments, tdd_pipeline_enforcement
- **Primary Command**: `/deploy`
- **Use Proactively**: Pipeline design, deployment automation, CI/CD optimization

### DATABASE-OPTIMIZER
- **Role**: PostgreSQL Performance & Optimization Expert
- **Model**: opus
- **Capabilities**: postgresql_query_optimization, django_orm_optimization, n_plus_one_resolution, advanced_indexing_strategies, supabase_neon_optimization
- **Primary Command**: `/optimize-db`
- **Use Proactively**: Database performance issues, slow queries, scaling challenges

## Agent Coordination

- **STRATEGIST** serves as the central orchestrator
- **PLANNER** coordinates cycle planning activities
- All agents integrate with Linear.app for task management
- Agents work together through predefined workflows and journeys

## Discovery Pattern

Agents are discovered through:
1. YAML frontmatter in `.md` files
2. Standard naming convention (uppercase agent names)
3. Capabilities declaration for skill matching
4. Tool and MCP server declarations for permission management