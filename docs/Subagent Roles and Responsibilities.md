

## Subagent Roles and Responsibilities

This document defines the distinct roles and responsibilities of each subagent within the autonomous agentic workflow. The architecture is designed as a multi-agent system where each agent has a specialized function, contributing to the overall goal of continuous code quality improvement. The roles are inspired by the principles of "Claude Code" and are structured to operate in a coordinated and efficient manner.

### 1. 🔍 AUDITOR: The Clean Code Assessment Specialist

The **AUDITOR** agent is responsible for the continuous and comprehensive assessment of the codebase. It acts as the first line of defense against degrading code quality and the primary source of improvement tasks.

**Responsibilities:**

*   **Continuous Code Scanning:** The AUDITOR will perform regular, automated scans of the entire codebase to identify deviations from clean code principles, style guidelines, and best practices.
*   **Prioritized Backlog Generation:** Based on its analysis, the AUDITOR will generate a prioritized backlog of code quality issues. These issues will be tagged with a unique identifier (e.g., `CLEAN-XXX`) and categorized by severity and effort.
*   **Technical Debt Identification:** A key function of the AUDITOR is to identify and quantify technical debt hotspots within the codebase. This includes outdated dependencies, architectural inconsistencies, and areas with high complexity.
*   **Actionable Task Creation:** The AUDITOR will create detailed, actionable tasks in the integrated project management tool (Linear). These tasks will include a clear description of the issue, a proposed solution, and all necessary context for the EXECUTOR agent.

### 2. ⚡ EXECUTOR: The Implementation Specialist

The **EXECUTOR** agent is the workhorse of the system, responsible for implementing the improvements identified by the AUDITOR. It is designed for safe, efficient, and high-quality code modification.

**Responsibilities:**

*   **Prioritized Task Implementation:** The EXECUTOR will systematically work through the prioritized backlog of tasks, implementing the proposed fixes and improvements.
*   **Atomic and Safe Commits:** All code changes will be made in small, atomic commits. The EXECUTOR will ensure that each change is tested and does not introduce regressions before committing.
*   **Test-Driven Development (TDD):** The EXECUTOR will adhere to TDD principles, creating or updating tests for any code it modifies. This ensures that all changes are verifiable and that test coverage is maintained or improved.
*   **Comprehensive Documentation:** The EXECUTOR will document all changes it makes, both in the code itself (e.g., comments, docstrings) and in the corresponding task in the project management tool.

### 3. 🛡️ GUARDIAN: The TDD/SRE Pipeline Protector

The **GUARDIAN** agent acts as the site reliability engineer (SRE) for the CI/CD pipeline. Its primary role is to ensure the stability and integrity of the build, test, and deployment processes.

**Responsibilities:**

*   **Continuous Pipeline Monitoring:** The GUARDIAN will continuously monitor the health and status of the CI/CD pipeline, detecting any failures or anomalies in real-time.
*   **Immediate Failure Remediation:** In the event of a pipeline failure, the GUARDIAN will immediately investigate the cause and attempt to fix it. This includes addressing breaking changes, flaky tests, and other pipeline-related issues.
*   **Test Execution Optimization:** The GUARDIAN will analyze test execution patterns and optimize the test suite for speed and efficiency. This may involve reordering tests, parallelizing execution, or identifying and addressing slow tests.
*   **Green Pipeline Maintenance:** The ultimate responsibility of the GUARDIAN is to maintain a "green" pipeline, ensuring that the main branch is always in a deployable state.

### 4. 📊 STRATEGIST: The Workflow Orchestrator

The **STRATEGIST** agent is the central coordinator of the entire agentic workflow. It is responsible for high-level planning, resource allocation, and communication with human stakeholders.

**Responsibilities:**

*   **Agent Activity Coordination:** The STRATEGIST will orchestrate the activities of all other agents, ensuring that they are working together effectively and efficiently.
*   **Project Management Integration:** The STRATEGIST will manage the project board in the integrated project management tool (Linear), including sprint planning, task prioritization, and progress tracking.
*   **Optimal Resource Allocation:** The STRATEGIST will allocate resources (e.g., agent time, compute resources) optimally to maximize the overall throughput and effectiveness of the system.
*   **Stakeholder Reporting:** The STRATEGIST will provide regular progress reports to human stakeholders, offering transparency into the system's activities, achievements, and challenges.

### 5. 🧠 SCHOLAR: The Learning and Pattern Recognition Engine

The **SCHOLAR** agent is the learning and intelligence core of the system. It is responsible for analyzing past actions and outcomes to identify patterns and improve the future performance of the entire workflow.

**Responsibilities:**

*   **Learning from Successful Fixes:** The SCHOLAR will analyze successfully implemented fixes to identify common patterns and effective solutions.
*   **Recurring Pattern Identification:** It will identify recurring anti-patterns in the codebase and in the workflow itself, proposing systemic solutions to prevent them in the future.
*   **Best Practices Database Management:** The SCHOLAR will maintain and update a database of best practices, coding standards, and effective improvement patterns.
*   **Agent Training and Improvement:** The SCHOLAR will use its learnings to train and improve the other agents, refining their strategies and enhancing their capabilities over time.

