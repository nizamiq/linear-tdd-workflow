I need you to implement a complete gitflow workflow for this project. Please analyze whether this is a new or existing project and adapt accordingly.

## Core Requirements:

### 1. Branch Structure Setup
- Create and configure the main branches:
  - `main` (or `master`) - production-ready code only
  - `develop` - integration branch for features
- Set `develop` as the default branch for pull requests
- Ensure proper branch protection rules are documented

### 2. Initialize Gitflow
If the project already has commits:
- Create `develop` branch from current main/master
- Preserve existing commit history
- Create a migration plan if branches need reorganization

If it's a new project:
- Initialize git repository if needed
- Create initial commit with basic project structure
- Set up both main and develop branches

### 3. Create Template Branches and Examples
Create example branches to demonstrate the workflow:
- `feature/example-feature` - branched from develop
- `release/1.0.0` - example release branch structure
- `hotfix/example-fix` - example hotfix branch structure
Document when to delete these examples

### 4. Configuration Files
Create the following configuration files:

#### .gitmessage (commit message template)
With conventional commit format:
- feat: (new feature)
- fix: (bug fix)
- docs: (documentation)
- style: (formatting)
- refactor: (code restructuring)
- test: (test additions)
- chore: (maintenance)

#### .gitflow (configuration file)
Define:
- Branch naming conventions
- Version tag formats (e.g., v1.0.0)
- Merge strategies for each branch type

#### .github/pull_request_template.md (if using GitHub)
Include:
- Change type checkboxes
- Description section
- Testing checklist
- Related issues section

### 5. Create Git Hooks (in .githooks/ directory)
- **pre-commit**: Validate commit message format
- **pre-push**: Run basic checks (linting, tests if configured)
- **prepare-commit-msg**: Add branch name to commit if relevant

Include a setup script to install these hooks locally.

### 6. Documentation
Create a GITFLOW.md file that includes:

#### Workflow Overview
- Visual ASCII diagram of the gitflow model
- Branch purposes and lifecycles
- When to use each branch type

#### Step-by-Step Processes
Document commands for:
1. Starting a new feature
2. Finishing a feature
3. Creating a release
4. Deploying a hotfix
5. Tagging versions

#### Team Guidelines
- Code review requirements
- Merge vs rebase strategies
- Conflict resolution procedures
- Who can merge to main/develop

#### Quick Reference
Create a cheatsheet section with common git commands for:
- Feature development
- Release preparation
- Hotfix deployment
- Syncing branches

### 7. CI/CD Integration Preparation
Create example workflow files (choose based on platform):
- `.github/workflows/gitflow.yml` for GitHub Actions
- `.gitlab-ci.yml` for GitLab

These should include:
- Automated branch protection
- Build validation for PRs
- Deployment triggers for main branch
- Version tagging automation

### 8. Version Management
- Create a VERSION file or update package.json
- Set initial version (0.1.0 for new, maintain current for existing)
- Document versioning strategy (semantic versioning)

### 9. Migration Plan (for existing projects)
If this is an existing project:
- Analyze current branch structure
- Create a MIGRATION.md with:
  - Current state assessment
  - Step-by-step migration process
  - Rollback procedures
  - Team communication template

### 10. Utility Scripts
Create a `scripts/` directory with:
- `setup-gitflow.sh` - Initialize gitflow in the repository
- `new-feature.sh` - Streamline feature branch creation
- `prepare-release.sh` - Automate release branch preparation
- `emergency-hotfix.sh` - Quick hotfix deployment script

## Additional Considerations:
- Ensure all text files use consistent line endings
- Add .gitattributes if needed for the project type
- Consider the team size and adjust complexity accordingly
- Make scripts executable and cross-platform when possible
- Include rollback procedures for each major operation

Please implement all of these components, creating actual files with working content, not just placeholders. Adapt the implementation based on:
- The project's programming language
- Existing tool configurations (package.json, pom.xml, etc.)
- Team size indicators in existing documentation
- Current repository state and history

After implementation, provide a summary of:
1. What was created/modified
2. Next steps for the team
3. Any potential issues detected in the current setup
4. Recommended customizations based on the project type