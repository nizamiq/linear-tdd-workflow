## Command Tasks and Performance Metrics

This document outlines the specific command tasks for each subagent in the autonomous agentic workflow, along with the key performance metrics used to evaluate their execution. These tasks are designed to be precise, actionable, and directly aligned with the roles and responsibilities of each agent.

### 1. 🔍 AUDITOR: Command Tasks and Metrics

The AUDITOR's tasks are focused on analysis and identification of code quality issues.

| Command Task | Description | Expected Outcome | Performance Metrics |
|---|---|---|---|
| `assess-code-quality` | Perform a comprehensive scan of the codebase to identify violations of coding standards, style guides, and best practices. | A detailed report of all identified code quality issues, including file locations and severity levels. | - **Scan Completion Time:** Time taken to complete a full codebase scan.<br>- **Issue Detection Accuracy:** Percentage of actual code quality issues correctly identified.<br>- **False Positive Rate:** Percentage of identified issues that are not actual violations. |
| `generate-improvement-backlog` | Analyze the assessment report and generate a prioritized backlog of improvement tasks. | A list of actionable tasks created in the project management tool (Linear), with appropriate titles, descriptions, priorities, and effort estimates. | - **Backlog Generation Time:** Time taken to create the complete backlog after an assessment.<br>- **Task Prioritization Accuracy:** Correlation between the agent's priority and human-expert priority.<br>- **Task Clarity Score:** A qualitative score based on the clarity and completeness of the generated task descriptions. |
| `identify-technical-debt` | Specifically scan for and quantify technical debt, including outdated dependencies, architectural smells, and complex code. | A report quantifying the identified technical debt, with specific recommendations for remediation. | - **Debt Identification Accuracy:** Percentage of actual technical debt correctly identified.<br>- **Debt Quantification Accuracy:** Accuracy of the estimated effort to remediate the identified debt. |

### 2. ⚡ EXECUTOR: Command Tasks and Metrics

The EXECUTOR's tasks are focused on the implementation of code improvements.

| Command Task | Description | Expected Outcome | Performance Metrics |
|---|---|---|---|
| `implement-task` | Execute a specific improvement task from the backlog, including writing or modifying code and tests. | A successful commit with the implemented changes, passing all tests. | - **Task Completion Time:** Average time taken to complete a task from start to commit.<br>- **Commit Atomicity:** Adherence to the one-task-per-commit rule.<br>- **Code Quality of Fix:** A measure of the quality of the code produced by the agent. |
| `run-tests` | Run all relevant tests before and after making code changes to ensure no regressions are introduced. | A successful test run with all tests passing. | - **Test Execution Time:** Time taken to run the relevant test suite.<br>- **Regression Rate:** Percentage of commits that introduce new bugs or break existing functionality. |
| `document-changes` | Add or update documentation related to the code changes, including in-code comments and task updates. | Clear and comprehensive documentation of the changes made. | - **Documentation Quality Score:** A qualitative score of the clarity and completeness of the documentation. |

### 3. 🛡️ GUARDIAN: Command Tasks and Metrics

The GUARDIAN's tasks are focused on maintaining the health of the CI/CD pipeline.

| Command Task | Description | Expected Outcome | Performance Metrics |
|---|---|---|---|
| `monitor-pipeline` | Continuously monitor the CI/CD pipeline for failures, performance degradation, or other anomalies. | Real-time detection and alerting of any pipeline issues. | - **Time to Detect Failure:** The time between a pipeline failure and its detection by the agent.<br>- **Pipeline Uptime:** The percentage of time the pipeline is operational. |
| `remediate-failure` | Automatically diagnose and fix pipeline failures. | A successful pipeline run after the remediation. | - **Mean Time to Recovery (MTTR):** The average time taken to fix a pipeline failure.<br>- **Auto-remediation Success Rate:** The percentage of pipeline failures that are fixed without human intervention. |
| `optimize-tests` | Analyze test execution and optimize for speed and efficiency. | A reduction in the overall test execution time. | - **Test Execution Time Reduction:** The percentage reduction in test suite run time.<br>- **Flaky Test Detection Rate:** The percentage of flaky tests correctly identified. |

### 4. 📊 STRATEGIST: Command Tasks and Metrics

The STRATEGIST's tasks are focused on workflow orchestration and planning.

| Command Task | Description | Expected Outcome | Performance Metrics |
|---|---|---|---|
| `coordinate-agents` | Manage the flow of tasks between the other agents. | A smooth and efficient workflow with no bottlenecks. | - **Task Throughput:** The number of tasks completed by the system per day.<br>- **Agent Idle Time:** The amount of time agents are idle, waiting for tasks. |
| `manage-project-board` | Update and maintain the project management board (Linear), including sprint planning and progress tracking. | An up-to-date and accurate project board that reflects the current state of the workflow. | - **Board Accuracy:** The correlation between the project board and the actual state of the work.<br>- **Sprint Goal Completion Rate:** The percentage of sprint goals that are achieved. |
| `generate-reports` | Generate and deliver regular progress reports to stakeholders. | Clear and informative reports that provide insights into the system's performance. | - **Report Accuracy and Timeliness:** The accuracy of the data in the reports and their timely delivery. |

### 5. 🧠 SCHOLAR: Command Tasks and Metrics

The SCHOLAR's tasks are focused on learning and system improvement.

| Command Task | Description | Expected Outcome | Performance Metrics |
|---|---|---|---|
| `analyze-fixes` | Analyze completed tasks to identify successful patterns and solutions. | A database of effective improvement patterns. | - **Pattern Discovery Rate:** The number of new, effective patterns identified per week.<br>- **Pattern Quality Score:** A qualitative score of the effectiveness of the identified patterns. |
| `identify-recurring-patterns` | Identify recurring anti-patterns in the codebase and workflow. | A list of systemic issues with proposals for their resolution. | - **Anti-pattern Detection Rate:** The percentage of recurring anti-patterns correctly identified. |
| `train-agents` | Use the learned patterns to train and improve the other agents. | An improvement in the performance of the other agents. | - **Improvement in Agent Metrics:** A measurable improvement in the performance metrics of the other agents over time. |

