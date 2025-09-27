**AI Coding Assistant Development Protocol
1. Core Principle: Strict Test-Driven Development (TDD)**
All development **must** follow a strict Test-Driven Development (TDD) workflow. This is non-negotiable. The cycle is:
	**1	Red:** Write a single, small, failing test for a specific piece of functionality. The test should define what the code *should* do. Run the test and confirm that it fails for the expected reason.
	**2	Green:** Write the absolute minimum amount of production code necessary to make the failing test pass. Do not add extra logic or handle edge cases not covered by the current test.
	**3	Refactor:** With the safety of a passing test suite, refactor both the production and test code to improve clarity, remove duplication, and enhance design. Ensure all tests continue to pass after refactoring.
Every new feature or bug fix must begin with a failing test.
**2. Code Quality and Style
Guiding Philosophy
	•	Clean Code:** Adhere to the principles of clean code. Code should be readable, simple, and self-documenting. Prioritize clarity over cleverness.
	**•	Single Responsibility Principle (SRP):** Every function, class, or module should have one, and only one, reason to change.
	**•	Don't Repeat Yourself (DRY):** Avoid duplication by abstracting shared logic into reusable components.
	**•	Keep It Simple, Stupid (KISS):** Favor simple, straightforward solutions over complex ones.
**Style and Formatting
	•	Consistency is Key:** Adhere to a community-accepted, industry-standard style guide for the target language (e.g., PEP 8 for Python, Google Style Guides for Java/C++, Prettier for JavaScript/TypeScript).
	**•	Automated Formatting:** All code must be automatically formatted using a standard tool for the language (e.g., Prettier, Black, gofmt). This should be enforced via pre-commit hooks.
	**•	Linting:** Use a static analysis tool (linter) to catch common errors, style issues, and code smells before they are committed.
**Naming Conventions**
	•	Use descriptive and unambiguous names for variables, functions, classes, and modules.
	•	Follow the idiomatic naming conventions of the target language (e.g., snake_case in Python/Rust, camelCase in JavaScript/Java, PascalCase for classes).
**3. Project Structure and Architecture
Modularity and Separation of Concerns
	•	Logical Grouping:** Group related functionality into cohesive modules, packages, or directories.
	**•	Clear Boundaries:** Maintain a clear separation between different layers of the application, such as:
	**◦	Presentation/API Layer:** The interface to the outside world (e.g., REST API, CLI).
	**◦	Business Logic/Domain Layer:** Core application logic and rules.
	**◦	Data Access/Persistence Layer:** Code responsible for interacting with databases or other data stores.
	**•	Dependency Inversion:** High-level modules should not depend on low-level modules. Both should depend on abstractions (e.g., interfaces, traits).
	**•	Avoid Circular Dependencies:** Structure the project to ensure a clear, directed graph of dependencies.
**API Design
	•	Public vs. Private:** Clearly define the public API of each module. Avoid exposing implementation details.
	**•	Contracts:** Design interfaces and functions that are easy to understand and hard to misuse.
**4. Comprehensive Testing Strategy
Unit Testing
	•	Focus:** Tests should be small, fast, and isolated. They test a single unit (function or method) in isolation from its dependencies.
	**•	Mocking and Stubbing:** Aggressively mock or stub all external dependencies, including databases, network calls, file systems, and third-party APIs. This ensures tests are deterministic and fast.
	**•	Edge Cases:** Write dedicated tests for edge cases, invalid inputs, and error-handling paths.
	**•	Descriptive Naming:** Test names should clearly describe the behavior being tested (e.g., test_calculates_tax_for_high_income_bracket).
**Integration Testing
	•	Purpose:** Verify that different components (units) of the system work together correctly.
	**•	Scope:** These tests should cover key interactions and user workflows, replacing mocks with real implementations where practical (e.g., interacting with a test database instance).
	**•	Separation:** Keep integration tests in a separate directory or test suite, as they are typically slower to run.
**End-to-End (E2E) Testing
	•	Objective:** Simulate a full user journey through the application from start to finish.
	**•	Environment:** These tests should run against a deployed, production-like environment.
	**•	Validation:** Validate that entire workflows produce the correct output and side effects (e.g., database records, file outputs).
**5. Version Control (Git)
	•	Branching Strategy:** Use a standardized workflow like GitFlow or a simpler feature-branch model (e.g., create feature branches from a main or develop branch).
	**•	Commit Hygiene:**
	◦	Commits should be atomic, representing a single logical change.
	◦	Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This provides a clear history and facilitates automated versioning.
	**•	Pull/Merge Requests (PRs/MRs):**
	◦	Every PR must have a clear description of the changes, the problem it solves, and instructions for testing.
	◦	PRs should be small and focused.
	◦	All automated checks (CI builds, tests, linters) must pass before a PR can be merged.
	**•	Automated Hooks:** Use pre-commit/pre-push hooks to automatically run formatters, linters, and fast unit tests to provide immediate feedback.
**6. Documentation
	•	In-Code Documentation:**
	◦	Write clear, concise comments for complex, non-obvious, or business-critical logic. The code itself should be the primary source of documentation.
	◦	Use a standard documentation format for the language (e.g., JSDoc, JavaDoc, Google-style Python docstrings) for all public functions, classes, and modules.
	**•	Project Documentation:** Maintain a README.md file with project setup, build, test, and deployment instructions.
	**•	Architectural Decisions:** Keep a log of significant architectural decisions in a designated location (e.g., docs/adr).
**7. Environment and Configuration
	•	Centralized Configuration:** All configuration loading logic should be centralized in a single module.
	**•	Environment Variables:** Use environment variables for configuration that varies between environments (development, staging, production), such as database credentials, API keys, and hostnames.
	**•	Validation:** The application must validate critical configuration on startup and fail fast if required values are missing or invalid.
	**•	Secrets Management:** Never commit secrets (API keys, passwords) directly to version control. Use a secrets management system or environment-specific files (like .env) that are listed in .gitignore.
