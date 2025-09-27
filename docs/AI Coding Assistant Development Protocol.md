**AI Coding Assistant Development Protocol

1. Core Principle: Strict Test-Driven Development (TDD)**

All development **must** follow a strict Test-Driven Development (TDD) workflow. This is non-negotiable. The cycle is:
	**1	Red:** Write a single, small, failing test for a specific piece of functionality. The test should define what the code *should* do. Run the test and confirm that it fails for the expected reason.
	**2	Green:** Write the absolute minimum amount of production code necessary to make the failing test pass. Do not add extra logic or handle edge cases not covered by the current test.
	**3	Refactor:** With the safety of a passing test suite, refactor both the production and test code to improve clarity, remove duplication, and enhance design. Ensure all tests continue to pass after refactoring.

Every new feature or bug fix must begin with a failing test.

**2. Code Quality and Style

Guiding Philosophy**
	•	**Clean Code:** Adhere to the principles of clean code. Code should be readable, simple, and self-documenting. Prioritize clarity over cleverness.
	•	**Single Responsibility Principle (SRP):** Every function, class, or module should have one, and only one, reason to change.
	•	**Don't Repeat Yourself (DRY):** Avoid duplication by abstracting shared logic into reusable components.
	•	**Keep It Simple, Stupid (KISS):** Favor simple, straightforward solutions over complex ones.

**Style and Formatting**
	•	**Consistency is Key:** Adhere to a community-accepted, industry-standard style guide for the target language (e.g., PEP 8 for Python, Google Style Guides for Java/C++, Prettier for JavaScript/TypeScript).
	•	**Automated Formatting:** All code must be automatically formatted using a standard tool for the language (e.g., Prettier, Black, gofmt). This should be enforced via pre-commit hooks.
	•	**Linting:** Use a static analysis tool (linter) to catch common errors, style issues, and code smells before they are committed.

**Naming Conventions**
	•	Use descriptive and unambiguous names for variables, functions, classes, and modules.
	•	Follow the idiomatic naming conventions of the target language (e.g., snake_case in Python/Rust, camelCase in JavaScript/Java, PascalCase for classes).

**3. Project Structure and Architecture

Modularity and Separation of Concerns**
	•	**Logical Grouping:** Group related functionality into cohesive modules, packages, or directories.
	•	**Clear Boundaries:** Maintain a clear separation between different layers of the application, such as:
		◦	**Presentation/API Layer:** The interface to the outside world (e.g., REST API, CLI).
		◦	**Business Logic/Domain Layer:** Core application logic and rules.
		◦	**Data Access/Persistence Layer:** Code responsible for interacting with databases or other data stores.
	•	**Dependency Inversion:** High-level modules should not depend on low-level modules. Both should depend on abstractions (e.g., interfaces, traits).
	•	**Avoid Circular Dependencies:** Structure the project to ensure a clear, directed graph of dependencies.

**API Design**
	•	**Public vs. Private:** Clearly define the public API of each module. Avoid exposing implementation details.
	•	**Contracts:** Design interfaces and functions that are easy to understand and hard to misuse.

**4. Comprehensive Testing Strategy

Unit Testing**
	•	**Focus:** Tests should be small, fast, and isolated. They test a single unit (function or method) in isolation from its dependencies.
	•	**Mocking and Stubbing:** Aggressively mock or stub all external dependencies, including databases, network calls, file systems, and third-party APIs. This ensures tests are deterministic and fast.
	•	**Edge Cases:** Write dedicated tests for edge cases, invalid inputs, and error-handling paths.
	•	**Descriptive Naming:** Test names should clearly describe the behavior being tested (e.g., test_calculates_tax_for_high_income_bracket).

**Integration Testing**
	•	**Purpose:** Verify that different components (units) of the system work together correctly.
	•	**Scope:** These tests should cover key interactions and user workflows, replacing mocks with real implementations where practical (e.g., interacting with a test database instance).
	•	**Separation:** Keep integration tests in a separate directory or test suite, as they are typically slower to run.

**End-to-End (E2E) Testing**
	•	**Objective:** Simulate a full user journey through the application from start to finish.
	•	**Environment:** These tests should run against a deployed, production-like environment.
	•	**Validation:** Validate that entire workflows produce the correct output and side effects (e.g., database records, file outputs).

**5. Version Control (Git) with GitFlow

Branching Strategy: GitFlow**

All projects **must** use the GitFlow branching model to ensure organized, predictable releases and clear separation between production-ready code and work in progress.

**Core Branches (Permanent)**
	•	**main (or master):** Contains production-ready code only. Every commit on main represents a production release.
	•	**develop:** The integration branch for features. Contains the latest delivered development changes for the next release.

**Supporting Branches (Temporary)**
	•	**Feature Branches (feature/*):**
		◦	Branch from: `develop`
		◦	Merge back into: `develop`
		◦	Naming convention: `feature/ticket-id-brief-description` (e.g., `feature/JIRA-123-user-authentication`)
		◦	Purpose: Develop new features for the upcoming release
		◦	Lifespan: Deleted after merging to develop
	
	•	**Release Branches (release/*):**
		◦	Branch from: `develop`
		◦	Merge back into: `main` AND `develop`
		◦	Naming convention: `release/version-number` (e.g., `release/1.2.0`)
		◦	Purpose: Prepare for a new production release (minor bug fixes, metadata updates)
		◦	Lifespan: Deleted after merging to main and develop
	
	•	**Hotfix Branches (hotfix/*):**
		◦	Branch from: `main`
		◦	Merge back into: `main` AND `develop`
		◦	Naming convention: `hotfix/version-number` (e.g., `hotfix/1.2.1`)
		◦	Purpose: Quick fixes for critical production issues
		◦	Lifespan: Deleted after merging to main and develop

**GitFlow Workflow Commands**

```bash
# Initialize GitFlow in repository
git flow init

# Start a new feature
git flow feature start FEATURE_NAME

# Finish a feature (merges to develop)
git flow feature finish FEATURE_NAME

# Start a release
git flow release start VERSION

# Finish a release (merges to main and develop, creates tag)
git flow release finish VERSION

# Start a hotfix
git flow hotfix start VERSION

# Finish a hotfix (merges to main and develop, creates tag)
git flow hotfix finish VERSION
```

**Branch Protection Rules**
	•	**main branch:**
		◦	Require pull request reviews (minimum 2 reviewers)
		◦	Require status checks to pass (CI/CD pipeline)
		◦	Require branches to be up to date before merging
		◦	Include administrators in restrictions
		◦	Restrict who can push to main (only release managers)
	
	•	**develop branch:**
		◦	Require pull request reviews (minimum 1 reviewer)
		◦	Require status checks to pass
		◦	Require branches to be up to date before merging

**Commit Hygiene**
	•	Commits should be atomic, representing a single logical change.
	•	Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This provides a clear history and facilitates automated versioning.
	•	Format: `<type>(<scope>): <subject>`
		◦	Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
		◦	Example: `feat(auth): add OAuth2 integration for Google login`

**Pull/Merge Requests (PRs/MRs)**
	•	Every PR must have a clear description of the changes, the problem it solves, and instructions for testing.
	•	PRs should be small and focused (ideally under 400 lines of changes).
	•	All automated checks (CI builds, tests, linters) must pass before a PR can be merged.
	•	Feature branches must be up-to-date with develop before merging.
	•	Use squash merging for feature branches to maintain a clean history.

**Release Management**
	•	Version numbers follow [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH).
	•	Each release to main must be tagged with the version number.
	•	Maintain a CHANGELOG.md file documenting all changes per release.
	•	Release branches allow for release preparation without blocking new feature development on develop.

**Automated Hooks**
	•	Use pre-commit/pre-push hooks to automatically run formatters, linters, and fast unit tests to provide immediate feedback.
	•	Configure hooks to enforce branch naming conventions and commit message formats.

**6. Documentation**
	•	**In-Code Documentation:**
		◦	Write clear, concise comments for complex, non-obvious, or business-critical logic. The code itself should be the primary source of documentation.
		◦	Use a standard documentation format for the language (e.g., JSDoc, JavaDoc, Google-style Python docstrings) for all public functions, classes, and modules.
	•	**Project Documentation:** Maintain a README.md file with project setup, build, test, and deployment instructions.
	•	**Architectural Decisions:** Keep a log of significant architectural decisions in a designated location (e.g., docs/adr).

**7. Environment and Configuration**
	•	**Centralized Configuration:** All configuration loading logic should be centralized in a single module.
	•	**Environment Variables:** Use environment variables for configuration that varies between environments (development, staging, production), such as database credentials, API keys, and hostnames.
	•	**Validation:** The application must validate critical configuration on startup and fail fast if required values are missing or invalid.
	•	**Secrets Management:** Never commit secrets (API keys, passwords) directly to version control. Use a secrets management system or environment-specific files (like .env) that are listed in .gitignore.

**8. Pre-Flight Deployment Checklist**

A comprehensive manual verification process **must** be executed before any production deployment. This checklist ensures system readiness and mitigates deployment risks. All items must be verified and signed off by the responsible team members.

**Code Review Verification**
	□ All code changes in the release have been reviewed by at least two team members
	□ All review comments have been addressed and resolved
	□ Code has been merged following GitFlow procedures (via release or hotfix branch)
	□ No unapproved or experimental code exists in the deployment branch

**Testing Validation**
	□ **Automated Testing:**
		- All unit tests pass with 100% success rate
		- All integration tests pass successfully
		- Code coverage meets or exceeds project minimums (typically ≥80%)
		- No critical or high-severity issues from static analysis tools
	□ **Manual Testing:**
		- User acceptance testing (UAT) completed and signed off
		- All critical user journeys tested end-to-end
		- Edge cases and error scenarios validated
		- Cross-browser/platform compatibility verified (if applicable)
	□ **Regression Testing:**
		- Existing functionality verified to ensure no breakage
		- Previous bug fixes confirmed as still resolved

**Configuration Audit**
	□ **Environment Variables:**
		- All required environment variables documented and set
		- Environment-specific values verified for target deployment (staging/production)
		- No hardcoded values or development settings in code
	□ **API Keys and Credentials:**
		- All API keys rotated if compromised or outdated
		- Service account permissions reviewed and minimized
		- Third-party service configurations verified
	□ **Deployment Scripts:**
		- Migration scripts tested and reversible
		- Deployment automation scripts updated and tested
		- Infrastructure-as-Code templates reviewed and validated

**Security Assessment**
	□ **Vulnerability Scanning:**
		- Security scan completed with no critical/high vulnerabilities
		- All dependencies scanned for known CVEs
		- Container images (if used) scanned and validated
	□ **Dependency Management:**
		- All dependencies updated to latest stable versions
		- No deprecated or end-of-life dependencies
		- License compliance verified for all third-party libraries
	□ **Access Control:**
		- Production environment access limited to authorized personnel
		- Multi-factor authentication (MFA) enforced
		- Audit logging enabled and tested
		- Secrets properly stored in vault/secret management system

**Performance Validation**
	□ **Benchmarking:**
		- Performance benchmarks meet or exceed requirements
		- Response time SLAs validated
		- Database query performance optimized
		- Memory and CPU usage within acceptable limits
	□ **Load Testing:**
		- Application tested under expected peak load
		- Stress testing completed to identify breaking points
		- Auto-scaling policies (if applicable) tested and validated
		- Performance monitoring and alerting configured

**Documentation Review**
	□ **Deployment Documentation:**
		- Step-by-step deployment procedure documented and current
		- Rollback procedure documented and tested
		- Deployment timeline and responsibilities defined
		- Communication plan established for stakeholders
	□ **Operational Documentation:**
		- Runbook updated with latest troubleshooting procedures
		- System architecture diagrams current
		- API documentation updated and published
		- Release notes prepared and reviewed
	□ **Team Access:**
		- All documentation accessible to deployment team
		- Emergency contact list updated
		- Escalation procedures documented

**Data Protection and Recovery**
	□ **Backup Verification:**
		- Recent backup completed successfully (within 24 hours)
		- Backup restoration tested and validated
		- Database migration rollback scripts prepared and tested
	□ **Data Integrity:**
		- Data migration scripts (if any) tested on staging data
		- No destructive operations without confirmation
		- Audit trail for data changes implemented

**Final Pre-Deployment Checklist**
	□ **Communication:**
		- Deployment window communicated to all stakeholders
		- Maintenance window scheduled if downtime required
		- Status page or user notifications prepared
	□ **Monitoring:**
		- Application monitoring configured and tested
		- Alert thresholds set appropriately
		- Dashboard prepared for deployment monitoring
		- On-call personnel notified and available
	□ **Approval:**
		- Technical lead approval obtained
		- Product owner sign-off received
		- Change advisory board (if applicable) approval documented

**Deployment Go/No-Go Decision**
	□ All checklist items completed and verified
	□ Risk assessment completed with acceptable risk level
	□ Rollback plan confirmed and resources available
	□ Final deployment approval from designated authority

**Post-Deployment Validation** (Execute immediately after deployment)
	□ Application health checks passing
	□ Critical functionality smoke tests completed
	□ No critical errors in logs
	□ Performance metrics within expected ranges
	□ User traffic successfully routing to new deployment

This checklist must be completed in full for every production deployment. Any unchecked items require explicit risk acceptance from the project lead and must be documented in the deployment record.

**9. Advanced Testing Principles and Practices**

These principles establish a comprehensive testing culture that treats tests as first-class citizens in the development process, ensuring quality, maintainability, and continuous validation.

**Test Infrastructure and Documentation**

**1. Codify the Testing Framework in Documentation**
	•	Maintain a single, machine-readable testing guide (`testing-standards.yaml` or `testing-config.json`)
	•	Define test structure, execution commands, shared utilities, and quality targets
	•	Ensure all contributors, including AI agents, adhere to the same standards from the start
	•	Version control this documentation alongside the codebase

**2. Enforce Development Methodology in Configuration**
	•	Integrate methodology enforcement directly into tooling and framework configurations
	•	Use settings to require strict validation, parallel execution, and automated quality gates
	•	Make best practices non-negotiable through automated enforcement
	•	Configure IDE settings and linters to flag violations immediately

**Test Organization and Architecture**

**3. Segment Test Suites by System Architecture**
	•	Organize test suites to mirror the application's architecture (component/service/domain)
	•	Establish clear ownership boundaries for test maintenance
	•	Enable targeted test runs for specific architectural components
	•	Align tests with the capabilities they validate

**4. Pair Tests with Narrative Context**
	•	Include descriptive summaries at the top of each test suite explaining business purpose
	•	Document the "why" behind test scenarios, not just the "what"
	•	Accelerate onboarding for new contributors through contextual understanding
	•	Example: `// This suite validates that our pricing engine correctly applies tiered discounts during checkout`

**Business Value and Requirements Testing**

**5. Express Tests as Executable Acceptance Criteria**
	•	Codify business requirements directly into test assertions
	•	Include performance benchmarks, data validation rules, and operational constraints
	•	Ensure code can only pass when it verifiably delivers intended value
	•	Use behavior-driven development (BDD) patterns where appropriate

**6. Make Aspirational Goals Explicit with Failing Tests**
	•	Maintain dedicated test suites for future goals (marked as `@skip` or `@pending`)
	•	Keep non-functional requirements and roadmap items visible
	•	Track progress toward service-level objectives through test evolution
	•	Example: Performance tests that fail until optimization targets are met

**Technical Debt and Migration Management**

**7. Use Technical Debt Markers During Migration**
	•	Tag outdated test suites with markers (`@legacy`, `@refactor_needed`, `@deprecated`)
	•	Quantify and prioritize technical debt for systematic improvement
	•	Maintain parallel test suites during migration periods
	•	Generate automated reports on technical debt metrics

**Security and Compliance Testing**

**8. Embed Security and Compliance Tests as First-Class Citizens**
	•	Create dedicated test suites for security requirements
	•	Include access control verification, vulnerability checks, and injection prevention
	•	Continuously verify security posture throughout development
	•	Example suites: `security/`, `compliance/`, `audit/`

**9. Automate Regulatory and Compliance Validation**
	•	Implement automated tests for industry-specific regulations (GDPR, HIPAA, PCI-DSS)
	•	Verify audit trails, data retention policies, and privacy controls
	•	Transform compliance from manual audits to automated checks
	•	Generate compliance reports automatically from test results

**Cross-Cutting Concerns and System-Wide Testing**

**10. Treat Cross-Cutting Requirements as a Regression Contract**
	•	Create dedicated test suites for system-wide concerns:
		- Localization and internationalization
		- Accessibility (WCAG compliance)
		- Theming and branding consistency
		- Error handling and recovery
	•	Protect critical user-facing functionality from regressions

**11. Validate Core Business Logic Through Dedicated Tests**
	•	Isolate complex or critical business logic in targeted test suites
	•	Test algorithmic correctness independent of infrastructure
	•	Maintain property-based tests for mathematical operations
	•	Example: `tests/core/pricing/`, `tests/core/inventory/`

**Data Integrity and Quality**

**12. Write Acceptance Tests for Data Integrity and Lineage**
	•	Create critical-path tests for data accuracy and traceability
	•	Verify data transformations at every integration point
	•	Test data migration and synchronization processes
	•	Include tests for:
		- Schema validation
		- Data type consistency
		- Referential integrity
		- Business rule enforcement

**Test Automation and Orchestration**

**13. Orchestrate Test Suites with Automated Runners**
	•	Develop scripts to automate the entire test execution workflow:
		- Environment setup and teardown
		- Sequential or parallel test execution
		- Report collection and aggregation
		- Resource cleanup
	•	Enforce consistent behavior in CI/CD environments
	•	Example: `scripts/test-runner.sh --suite=integration --parallel=4`

**14. Expose Test Infrastructure via Machine-Readable Specifications**
	•	Provide OpenAPI/GraphQL schemas for all interfaces
	•	Document data structures and error codes in machine-readable format
	•	Enable AI agents and automated tools to participate in test creation
	•	Generate test stubs from specifications automatically

**Test Quality and Coverage Management**

**15. Design Coverage Goals with Precision**
	•	Set tiered coverage targets:
		- Baseline: 80% overall coverage
		- Critical paths: 95% coverage
		- New features: 90% coverage before merge
	•	Use coverage gates in CI/CD pipelines
	•	Track coverage trends over time
	•	Exclude generated code and vendor libraries from metrics

**16. Organize Non-Functional Tests as Code**
	•	Store performance, load, and chaos engineering scenarios in version control
	•	Treat resilience and performance as testable disciplines
	•	Include:
		- Load testing scenarios (`tests/load/`)
		- Stress testing configurations (`tests/stress/`)
		- Chaos engineering experiments (`tests/chaos/`)
		- Performance benchmarks (`tests/performance/`)

**Test Maintainability and Reusability**

**17. Maximize Reuse of Test Helpers and Data Factories**
	•	Develop comprehensive test utility libraries:
		- Data factories for consistent test data generation
		- Mock builders for external service simulation
		- Custom assertions for domain-specific validation
		- Test fixtures for common scenarios
	•	Keep tests concise and focused on unique behavior
	•	Example: `TestDataFactory.createUser()`, `MockServiceBuilder.withError()`

**18. Document Test Environment Setup and Execution**
	•	Provide clear documentation including:
		- Environment setup scripts (`scripts/setup-test-env.sh`)
		- Command reference guide (`docs/testing-commands.md`)
		- Test data preparation instructions
		- Troubleshooting guide for common issues
	•	Lower barriers to entry for test-driven development

**Test Classification and Execution Strategy**

**19. Segment Tests by Type and Scope with Markers**
	•	Use consistent tagging system:
		- `@unit` - Isolated component tests
		- `@integration` - Component interaction tests
		- `@e2e` - End-to-end user journey tests
		- `@security` - Security validation tests
		- `@performance` - Performance benchmark tests
		- `@smoke` - Critical path validation
		- `@regression` - Previous bug prevention
	•	Enable targeted execution: `npm test --tags=@smoke,@security`
	•	Configure different test strategies for different pipeline stages

**Metrics and Continuous Improvement**

**20. Track Methodology Adoption with Explicit Metrics**
	•	Configure automated reporting for key metrics:
		- Code coverage trends (line, branch, function)
		- Test execution times and performance
		- Flaky test identification and rates
		- Test-to-code ratio
		- Mean time to test failure detection
	•	Generate dashboards for test health visibility
	•	Set up alerts for metric degradation
	•	Conduct regular test suite health reviews

**Implementation Priority**

Phase 1 (Immediate):
- Principles 1, 2, 3, 13, 15, 19 (Foundation)

Phase 2 (Short-term):
- Principles 4, 5, 10, 17, 18 (Developer experience)

Phase 3 (Medium-term):
- Principles 6, 7, 8, 11, 12, 14, 16 (Advanced capabilities)

Phase 4 (Long-term):
- Principles 9, 20 (Maturity and optimization)

These principles work synergistically with the TDD approach defined in Section 1, creating a comprehensive testing ecosystem that ensures quality at every level of the application.