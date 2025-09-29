# Agent Registry

This file serves as the central registry for all agents in the Linear TDD Workflow System.

## Core Agents

### AUDITOR
- **Role**: Code Quality Assessment & Standards Enforcer
- **Capabilities**: code_analysis, quality_assessment, technical_debt_detection, clean_code_principles, linear_integration
- **Primary Command**: `/assess`

### EXECUTOR
- **Role**: TDD Implementation Engine
- **Capabilities**: tdd_implementation, test_driven_development, code_implementation, fix_pack_execution, linear_integration
- **Primary Command**: `/fix`

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