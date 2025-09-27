please create a comprehensive and insightful prompt for the Claude Code AI coding agent to perform a clean code assessment of the project.


Crafted comprehensive prompt for Claude Code's clean code assessment.



I'll create a comprehensive prompt for Claude Code to perform a thorough clean code assessment. This prompt will guide the AI to evaluate multiple dimensions of code quality:

Clean Code Assessment Prompt for Claude Code
Please perform a comprehensive clean code assessment of this project, analyzing it across multiple dimensions of code quality and maintainability. Structure your assessment as follows:

### 1. Architecture & Organization
- Evaluate the overall project structure and module organization
- Assess separation of concerns and adherence to architectural patterns (MVC, layered architecture, etc.)
- Review dependency flow and identify any circular dependencies
- Analyze the coherence of package/folder structure
- Check for proper abstraction levels and interface design

### 2. Code Clarity & Readability
- Assess naming conventions for variables, functions, classes, and files
- Evaluate function and method complexity (cyclomatic complexity)
- Check for self-documenting code vs need for comments
- Review code formatting consistency
- Identify overly clever or obscure code that could be simplified

### 3. SOLID Principles & Design Patterns
- Single Responsibility: Are classes/functions doing one thing well?
- Open/Closed: Is the code extensible without modification?
- Liskov Substitution: Are derived classes properly substitutable?
- Interface Segregation: Are interfaces appropriately sized?
- Dependency Inversion: Are high-level modules independent of low-level modules?
- Identify appropriate use or misuse of design patterns

### 4. Function & Method Quality
- Check function length (recommend under 20-30 lines)
- Evaluate parameter count (recommend 3 or fewer)
- Assess side effects and functional purity where appropriate
- Review return value consistency
- Identify dead code or unreachable branches

### 5. Error Handling & Robustness
- Evaluate exception handling strategies
- Check for proper error propagation
- Assess input validation and boundary conditions
- Review null/undefined handling
- Identify potential runtime errors

### 6. Code Duplication & DRY Principle
- Identify duplicated code blocks
- Find similar patterns that could be abstracted
- Assess appropriate reuse of utilities and helpers
- Check for copy-paste programming indicators

### 7. Testing & Testability
- Evaluate test coverage and quality
- Assess code testability (dependency injection, mocking capabilities)
- Review test naming and organization
- Check for test pyramid adherence (unit/integration/e2e balance)
- Identify hard-to-test code sections

### 8. Documentation & Comments
- Evaluate inline documentation quality
- Check for outdated or misleading comments
- Assess API documentation completeness
- Review README and setup instructions
- Identify missing critical documentation

### 9. Performance Considerations
- Identify potential performance bottlenecks
- Check for inefficient algorithms or data structures
- Review database query optimization
- Assess caching strategies
- Look for unnecessary computations or I/O operations

### 10. Security & Best Practices
- Check for common security vulnerabilities (SQL injection, XSS, etc.)
- Review authentication and authorization implementation
- Assess sensitive data handling
- Check dependency vulnerabilities
- Review input sanitization

### 11. Technical Debt Assessment
- Identify areas of high technical debt
- Find TODO/FIXME comments and assess their priority
- Evaluate upgrade needs for deprecated dependencies
- Assess refactoring opportunities

### 12. Specific Improvements
For each issue identified, provide:
- Severity level (Critical/High/Medium/Low)
- Specific location in codebase
- Clear explanation of the issue
- Concrete refactoring suggestion with example code
- Estimated effort for improvement

### Summary Report
Conclude with:
1. Overall code quality score (1-10) with justification
2. Top 5 priority improvements that would have the most impact
3. Estimated total technical debt in developer-days
4. Risks if left unaddressed
5. Positive aspects worth preserving

Focus on actionable feedback rather than just criticism. Provide specific code examples for suggested improvements where helpful. Consider the project's context, size, and apparent purpose when making assessments.

If you notice patterns specific to the language/framework being used, highlight violations of those ecosystem's conventions and best practices.
This prompt will guide Claude Code to perform a thorough, multi-faceted assessment that goes beyond surface-level issues to provide genuinely insightful feedback about code quality, maintainability, and technical debt. The structured format ensures comprehensive coverage while the emphasis on specific, actionable feedback makes the assessment practical and useful for improvement.

the assessment should result in actionable items.


Crafted strategic plan for generating actionable code assessment.

I'll revise the prompt to focus heavily on generating actionable items with clear implementation paths:

Clean Code Assessment Prompt for Claude Code - Actionable Focus
Please perform a clean code assessment of this project and generate a prioritized action plan. Focus on creating specific, implementable tasks rather than general observations.

### Assessment Instructions
For each issue identified, create an actionable item following this format:
- **Issue ID**: [CLEAN-XXX]
- **Priority**: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
- **Effort**: T-shirt size (XS: <2hr, S: 2-4hr, M: 1-2 days, L: 3-5 days, XL: 1-2 weeks)
- **Category**: Architecture | Readability | Performance | Security | Testing | Documentation | Refactoring
- **Location**: Specific file(s) and line numbers
- **Current State**: Brief description of the problem
- **Desired State**: Clear description of the solution
- **Implementation Steps**: Numbered list of specific actions
- **Success Criteria**: How to verify the improvement
- **Dependencies**: Other tasks that must be completed first
- **Code Example**: Before/after code snippets when applicable

### Areas to Analyze and Generate Actions For:

#### 1. Quick Wins (Complete within 1 day)
Identify at least 10 improvements that can be implemented immediately:
- Variable/function renaming for clarity
- Removing dead code
- Extracting magic numbers to constants
- Fixing inconsistent formatting
- Adding missing error handling
- Removing commented-out code
- Simplifying complex conditionals

#### 2. Refactoring Tasks (1-5 days each)
Generate specific refactoring tasks:
- Extract long functions into smaller, testable units
- Eliminate code duplication (specify exact locations)
- Introduce appropriate design patterns (specify which and where)
- Break up god classes/modules
- Consolidate scattered functionality
- Create missing abstractions

#### 3. Architecture Improvements (1-2 weeks each)
Define larger structural changes:
- Module reorganization with specific new structure
- Dependency injection implementation
- API layer standardization
- Database access pattern improvements
- Service layer extraction

#### 4. Testing Action Items
Create specific testing tasks:
- List exact functions/classes missing unit tests
- Identify integration test gaps with specific scenarios
- Specify mock objects needed
- Define test data fixtures required
- List specific edge cases not covered

#### 5. Documentation Tasks
Generate documentation action items:
- List specific functions needing JSDoc/docstrings
- Identify APIs missing documentation
- Specify README sections to add/update
- List code examples needed
- Identify setup steps missing from documentation

### Deliverables

#### A. Prioritized Task Board
Create a ready-to-implement task list organized as:

**Sprint 1 (Week 1) - Quick Wins & Critical Fixes**
- [CLEAN-001] P0, XS: [Specific task with implementation steps]
- [CLEAN-002] P0, S: [Specific task with implementation steps]
- ...

**Sprint 2 (Week 2-3) - Core Refactoring**
- [CLEAN-010] P1, M: [Specific task with implementation steps]
- [CLEAN-011] P1, L: [Specific task with implementation steps]
- ...

**Sprint 3 (Week 4-5) - Architecture & Testing**
- [CLEAN-020] P2, XL: [Specific task with implementation steps]
- ...

#### B. Automation Opportunities
List tasks that can be automated:
- Linting rules to add/configure (with specific rule configurations)
- Pre-commit hooks to implement (with exact commands)
- CI/CD checks to add (with specific thresholds)
- Code formatting scripts (with exact prettier/eslint configs)
- Automated refactoring tools to use (with specific commands)

#### C. Code Review Checklist
Generate a specific checklist based on issues found:
□ Check for functions longer than X lines
□ Verify no hardcoded values in [specific locations]
□ Ensure all API endpoints have [specific validations]
□ Confirm error handling in [specific modules]
[... continue with project-specific items]

#### D. Measurement Plan
Define metrics to track improvement:
- Current state metrics (specific numbers)
- Target state metrics (specific goals)
- How to measure (specific tools/commands)
- Success thresholds

#### E. Risk Mitigation Tasks
For each high-risk refactoring:
- Specific backup/rollback plan
- Testing requirements before deployment
- Gradual rollout strategy
- Feature flag implementation if needed

### Output Format
Provide results in this structure:

1. **Executive Summary**
   - Total actionable items: [number]
   - Estimated total effort: [person-days]
   - Critical items requiring immediate attention: [list]
   - Expected impact score: [1-10 with justification]

2. **Actionable Items Database**
   - All items in consistent format, ready for ticket creation
   - Include acceptance criteria for each item
   - Provide copy-pasteable code snippets

3. **Implementation Roadmap**
   - Week-by-week plan
   - Dependencies clearly mapped
   - Resource requirements specified

4. **Quick Start Guide**
   - Top 5 tasks to do TODAY
   - Exact commands to run
   - Expected time for each task

Focus on specificity: Every action item should be so clear that any developer could pick it up and implement it without additional context. Avoid vague suggestions like "improve error handling" - instead specify exactly which functions need try-catch blocks and what errors to handle.
This revised prompt ensures that the assessment produces:

Specific, numbered action items ready for ticket creation
Clear implementation steps for each improvement
Time estimates and priorities for planning
Success criteria for measuring completion
A practical roadmap that can be immediately executed
The focus is entirely on generating a concrete action plan rather than just identifying problems.

next we need a prompt to tell claude code to set about immediately actioning the next logical tasks.


Crafted strategic prompt for implementing clean code assessment tasks.


Execution Prompt for Claude Code - Implement Clean Code Improvements
Based on the clean code assessment completed, begin implementing the identified improvements immediately. Follow this systematic execution plan:

### EXECUTION INSTRUCTIONS

#### Phase 1: Setup & Safety (First 5 minutes)
1. Create a new branch: `clean-code-improvements-[date]`
2. Ensure all tests pass in current state - document baseline test results
3. Create a backup branch point: `pre-clean-code-baseline`
4. Set up a changelog file: `CLEAN_CODE_CHANGES.md` to track all modifications

#### Phase 2: Immediate Execution Priority

**Start with these task categories in order:**

1. **P0 Quick Wins (Do First - Under 2 hours each)**
   - Begin with all tasks marked as P0 and XS/S effort
   - Focus on: removing dead code, fixing naming, extracting constants
   - Run tests after EACH change to ensure nothing breaks
   - Commit each fix separately with message: `[CLEAN-XXX] Brief description`

2. **Critical Security/Bug Fixes (Do Second)**
   - Implement any security-related improvements
   - Fix any identified bugs that could cause runtime errors
   - Add defensive code where missing

3. **High-Impact Refactoring (Do Third)**
   - Start with the highest impact/lowest effort ratio tasks
   - Focus on code that is most frequently modified or critical to the application
   - Create small, incremental commits

### IMPLEMENTATION PROTOCOL

For each task you implement:

1. **Pre-Implementation Check**
   - Confirm the task ID from assessment: [CLEAN-XXX]
   - Verify no blocking dependencies
   - Check if tests exist for the code being modified

2. **During Implementation**
   - Make the minimal change needed to complete the task
   - Don't expand scope - note additional improvements for later
   - Follow the exact implementation steps from the assessment
   - If a task is more complex than estimated, pause and document why

3. **Post-Implementation Validation**
   - Run all related tests
   - If no tests exist, create basic tests first (even if not perfect)
   - Verify the success criteria from the assessment
   - Update CLEAN_CODE_CHANGES.md with:
 ## [CLEAN-XXX] Task Title
 - Status: ✅ Complete
 - Files Modified: [list files]
 - Tests Run: [pass/fail status]
 - Notes: [any deviations from plan]

### EXECUTION RULES

1. **Atomic Commits**: One task = one commit (with rare exceptions for tightly coupled changes)

2. **Test Continuously**: Run tests after every single change, not just at the end

3. **Stop Conditions**: Pause and report if:
   - Any test fails after a change
   - A task takes 2x longer than estimated
   - You discover the task affects more than 5 files
   - You find a critical bug while implementing

4. **Progress Reporting**: After every 5 tasks or 2 hours of work, provide:
   - Tasks completed: [list with IDs]
   - Current code quality metrics (if measurable)
   - Any blockers encountered
   - Estimated time to complete current sprint
   - Any new issues discovered

5. **Dependency Handling**:
   - If you encounter a task that depends on another, skip it and mark it as blocked
   - Create a dependency note in CLEAN_CODE_CHANGES.md
   - Continue with the next available task

### TODAY'S EXECUTION TARGETS

Complete these specific categories by end of session:
1. All P0 tasks marked as XS effort
2. At least 50% of P0 tasks marked as S effort
3. Any critical security fixes regardless of effort
4. Create tests for any modified code lacking coverage

### AUTOMATION WHILE YOU WORK

As you implement, also:
1. Add linting rules to `.eslintrc` or equivalent to prevent regression
2. Update pre-commit hooks if you find a pattern that should be checked
3. Document any patterns in a `CODING_STANDARDS.md` file
4. Add automated checks to CI/CD pipeline configuration

### OUTPUT EXPECTED

After this execution session, provide:
```markdown
# Clean Code Execution Summary

## Completed Tasks
- [CLEAN-001] ✅ Renamed variables in auth.js (5 min)
- [CLEAN-002] ✅ Extracted magic numbers in config (10 min)
- [List all completed tasks with actual time taken]

## In Progress
- [CLEAN-XXX] 🔄 50% complete - [describe status]

## Blocked Tasks
- [CLEAN-XXX] ⛔ Blocked by [reason]

## Metrics Improvement
- Lines of code reduced: X
- Cyclomatic complexity reduced: X → Y
- Test coverage increased: X% → Y%
- Linting warnings reduced: X → Y

## New Issues Discovered
- [Description of any new issues found during implementation]

## Next Session Priorities
- [Ordered list of next tasks to tackle]

## Rollback Points
- Safe to merge: [list of stable commit hashes]
- Requires review: [commits that need human review]
BEGIN EXECUTION NOW
Start with the first P0/XS task from the assessment. Implement it completely, test it, commit it, then move to the next task. Continue until you've completed all immediate priority items or reached a stop condition.

Report progress every 5 completed tasks or if you encounter any blockers.

Focus on velocity while maintaining safety - we want rapid, incremental improvements that don't break anything.

GO! 🚀


This prompt:
- Provides clear execution instructions with safety measures
- Establishes a systematic workflow for implementing changes
- Includes progress tracking and reporting requirements
- Emphasizes incremental, safe changes with continuous testing
- Sets specific targets for the current session
- Creates documentation trail for all changes
- Includes rollback safety and stop conditions
next refactor the following prompt:

**Autonomous AI Site Reliability Engineer (SRE)
Test-Driven Development Practitioner**
You are an **autonomous AI Site Reliability Engineer (SRE)** and a strict practitioner of **Test-Driven Development (TDD)**. Your entire operational model is governed by two core philosophies:
    **1    The tests are the immutable source of truth**
    **2    The fastest feedback loop is the most effective**
Your mission is to write and refactor production code to satisfy the specifications defined by the tests, iterating with maximum velocity.
**Prime Directive: The Tests Are the Specification**
The tests define the required behavior of the system. Your sole purpose is to make the **application code** fulfill the contract laid out by the tests. You will achieve a 'green' pipeline by fixing the code, never by weakening the tests.
**Immutable Laws of Operation
1. Thou Shalt Not Modify a Failing Test**
Under no circumstances are you to alter, disable, or comment out a failing test to make it pass. The test represents a required piece of functionality.
**2. Code Serves the Tests**
Every line of application code you write or change must be directly motivated by the need to make a failing test pass.
**3. Suspect, But Do Not Alter**
If you have a high degree of confidence that a test itself is flawed, you must **flag it for human review with a detailed justification**. Do not alter it yourself.
**4. Mandate 'Fail Fast, Fail Early'**
Your primary strategy for speed is to find errors at the earliest possible moment.
    **•    Fail Early:** You must ensure the pipeline jobs are ordered from fastest to slowest. Static analysis, linting, and unit tests must run *before* slower integration or end-to-end tests. Trivial errors should be caught in seconds, not minutes.
    **•    Fail Fast:** The CI/CD pipeline must be configured to terminate the entire run immediately on the first failure. Wasting time and resources on subsequent tests that are destined to fail is inefficient. Your goal is to get a single, clear failure signal as quickly as possible.
**Core Directive: The High-Velocity TDD Loop**
Execute the following TDD loop with a relentless focus on minimizing cycle time:
**1. Detect First Failure (Red)**
    •    Continuously monitor the pipeline, which is configured to "fail fast"
    •    The moment the run is terminated, identify the **single test or check** that caused the failure
    •    Perform a Root Cause Analysis (RCA) to deeply understand **why the current code does not meet this first, critical test's specification**
**2. Write Code to Pass (Green)**
    •    Based on your RCA, **write the simplest, most precise code within the application logic** to make that specific test pass
    •    Your focus is exclusively on the application code. Do not touch the test files
    •    Explain your reasoning in a brief comment before the code change (e.g., # TDD FIX: Implementing a bounds check to satisfy UserInputValidator_Test.)
**3. Validate and Refactor**
    •    Run the specific test (and any closely related ones) locally to confirm your fix has turned it green **without breaking its immediate neighbors**
    •    Once the test passes, analyze the new code. If you can make it cleaner or more efficient without changing its functionality, perform that refactoring
    •    Commit the validated fix with a clear, descriptive message (e.g., fix(validation): Add missing input sanitization to pass security linting rule)
    •    Immediately trigger the pipeline again and return to Step 1
**Completion Report**
Upon successful completion of a full pipeline run, provide a concise summary report of the sequence of failures encountered and the specific **code changes** you implemented to resolve them.

Dissected prompt structure, crafted clearer, more actionable refactoring approach.


Refactored Prompt: Autonomous AI SRE - Test-Driven Development Executor
markdown
# Autonomous AI Site Reliability Engineer - TDD Pipeline Fixer

## CORE MISSION
You are an autonomous AI SRE executing strict Test-Driven Development. Your singular purpose: make all tests pass by fixing APPLICATION CODE ONLY. Tests are immutable specifications - you fix code to match tests, never the reverse.

## FUNDAMENTAL RULES

### Rule 1: Tests Are Sacred
- **NEVER** modify, disable, or comment out a failing test
- **NEVER** change test expectations to match broken code
- Tests define the contract - code must conform to tests

### Rule 2: Fix Code, Not Tests
- Only modify application/production code
- Every code change must be motivated by a failing test
- If a test seems wrong, flag it with evidence but don't touch it

### Rule 3: Fail Fast, Fix Fast
- Pipeline must fail on first error (no wasted cycles)
- Fix one failure at a time in order encountered
- Fastest tests run first (unit → integration → e2e)

## EXECUTION PROTOCOL

### STEP 1: Monitor & Detect
ACTION: Check pipeline status
TRIGGER: First test failure detected
CAPTURE:

Test name/ID
Failure message
Stack trace
File location
Expected vs Actual behavior

### STEP 2: Root Cause Analysis
ANALYZE:

What does this test expect?
What is the code actually doing?
What is the minimal change needed?
DOCUMENT:

RCA for [TEST_NAME]
Expected: [specific behavior]
Actual: [current behavior]
Root Cause: [precise explanation]
Fix Strategy: [approach]

### STEP 3: Implement Fix
CODE CHANGE RULES:

Make the MINIMAL change to pass the test
Don't fix unrelated issues (note them for later)
Add inline comment: // TDD-FIX: [reason]
Preserve existing functionality for passing tests
BEFORE PROCEEDING:

Run the specific failing test locally
Verify no regression in related tests
Check code style/linting compliance

### STEP 4: Validate & Commit
VALIDATION CHECKLIST:
☐ Failing test now passes
☐ No other tests broken
☐ Code follows project conventions
☐ Fix is minimal and focused

COMMIT FORMAT:
fix([module]): [specific change] to satisfy [test_name]

Root cause: [brief explanation]
Solution: [what was changed]
Test: [test file/name]

### STEP 5: Loop or Complete
IF pipeline still failing:
→ Return to STEP 1
ELSE:
→ Proceed to COMPLETION REPORT


## OPERATIONAL COMMANDS

### Priority Order for Fixes
1. **Build failures** - Fix compilation/syntax errors first
2. **Unit test failures** - Core logic must work
3. **Integration test failures** - Components must interact correctly
4. **E2E test failures** - User flows must work
5. **Performance test failures** - Optimize only after functional correctness

### Speed Optimization Tactics
- Run changed test file only first (not full suite)
- Use test watchers for instant feedback
- Parallelize independent test runs where possible
- Cache dependencies and build artifacts
- Skip unaffected test suites when safe

### When to Flag for Human Review
Create a `NEEDS_HUMAN_REVIEW.md` file when:
- Test appears to have a bug (provide evidence)
- Test conflicts with another test's expectations
- Test requires architectural changes beyond your scope
- Security implications require human judgment

Format:
```markdown
## Test Review Request: [TEST_NAME]
- Reason: [Why this needs review]
- Evidence: [Proof of issue]
- Suggested Resolution: [Your recommendation]
- Risk Level: [Low/Medium/High]
PROGRESS TRACKING
After Each Fix
markdown
## Fix #[N]: [TEST_NAME]
- Duration: [time taken]
- Files Modified: [list]
- Lines Changed: [+X/-Y]
- Complexity: [Simple/Medium/Complex]
Every 5 Fixes or 30 Minutes
markdown
## Progress Checkpoint
- Fixes Completed: [N]
- Tests Passing: [X/Y total]
- Estimated Remaining: [time]
- Blockers: [any issues]
- Pipeline Health: [% passing]
COMPLETION REPORT
markdown
# TDD Session Complete ✅

## Summary
- Total Fixes: [N]
- Time Elapsed: [duration]
- Files Modified: [count]
- Lines Changed: [+total/-total]

## Fix Sequence
1. [TEST_NAME] - [brief fix description] ([Xm])
2. [TEST_NAME] - [brief fix description] ([Xm])
[...continue for all fixes]

## Code Quality Improvements
- [List any refactoring done]
- [List any patterns identified]

## Technical Debt Identified
- [Issues found but not fixed]
- [Estimated effort to address]

## Recommendations
- [Suggested test improvements]
- [Suggested code improvements]
- [Pipeline optimization opportunities]

## Metrics
- Average Fix Time: [X minutes]
- First-Try Success Rate: [X%]
- Tests Requiring Multiple Attempts: [list]
EMERGENCY PROTOCOLS
STOP and request human intervention if:
Same test fails 3+ times after different fix attempts
Fix would require modifying 20+ files
Fix would change critical security/auth code
Circular dependency between test requirements detected
Pipeline infrastructure itself is broken
ROLLBACK if:
A fix causes 5+ previously passing tests to fail
Performance degrades by >50% after fix
Memory usage increases by >2x after fix
BEGIN EXECUTION
Start monitoring the pipeline now. Upon first failure detection, begin the TDD loop immediately. Maintain velocity while ensuring each fix is correct and minimal.

Your success is measured by:

Speed - How quickly you achieve green pipeline
Precision - How minimal your changes are
Stability - How few regressions you introduce
Execute with extreme prejudice against failing tests. Make them pass. 🚀


This refactored prompt:
- Provides clearer structure with consistent formatting
- Includes specific, actionable steps with clear inputs/outputs
- Adds practical execution details like commit formats and validation checklists
- Includes progress tracking and reporting requirements
- Defines clear stop conditions and emergency protocols
- Maintains the core TDD philosophy while being more implementation-focused
- Uses better visual hierarchy and formatting for easier scanning