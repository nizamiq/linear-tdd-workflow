# CI/CD Integration Guide - Claude Agentic Workflow System

Complete guide to integrating the Claude Agentic Workflow System with CI/CD pipelines for automated quality gates, pipeline protection, and intelligent recovery.

## Table of Contents

1. [CI/CD Integration Overview](#cicd-integration-overview)
2. [Pipeline Architecture](#pipeline-architecture)
3. [Quality Gates Integration](#quality-gates-integration)
4. [GUARDIAN Agent Pipeline Protection](#guardian-agent-pipeline-protection)
5. [GitHub Actions Integration](#github-actions-integration)
6. [GitLab CI Integration](#gitlab-ci-integration)
7. [Jenkins Integration](#jenkins-integration)
8. [Auto-Recovery Mechanisms](#auto-recovery-mechanisms)
9. [Performance Monitoring](#performance-monitoring)
10. [Custom Pipeline Integration](#custom-pipeline-integration)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

## CI/CD Integration Overview

### What is CI/CD Integration?

The Claude Agentic Workflow System integrates deeply with CI/CD pipelines to provide automated quality enforcement, intelligent failure recovery, and comprehensive pipeline protection. The GUARDIAN agent serves as the primary pipeline protector, maintaining >90% pipeline success rates through proactive monitoring and auto-recovery.

### Integration Benefits

**Automated Quality Enforcement:**
- **Quality Gates**: Enforced TDD compliance, coverage thresholds, and code quality standards
- **Security Scanning**: Automated vulnerability detection and remediation
- **Performance Validation**: Automated performance regression detection
- **Dependency Checking**: Automated security and license compliance

**Intelligent Pipeline Protection:**
- **Failure Prediction**: Proactive identification of potential pipeline issues
- **Auto-Recovery**: Intelligent recovery strategies for common failure patterns
- **Resource Optimization**: Dynamic resource allocation and optimization
- **Rollback Management**: Automated rollback on critical failures

**Comprehensive Monitoring:**
- **Real-time Metrics**: Pipeline performance and health monitoring
- **SLA Tracking**: Automated SLA compliance monitoring and alerting
- **Trend Analysis**: Historical analysis and predictive insights
- **Team Notifications**: Intelligent alerting and escalation

### Supported CI/CD Platforms

- **GitHub Actions** ✅ Full support with templates
- **GitLab CI** ✅ Full support with templates
- **Jenkins** ✅ Full support with plugins
- **Azure DevOps** 🔄 Planned support
- **CircleCI** 🔄 Planned support
- **Buildkite** 🔄 Planned support

## Pipeline Architecture

### Integration Architecture

```
Developer Push
      ↓
┌─────────────────────────────────────────────────────────────┐
│                  CI/CD Pipeline                             │
│                                                             │
│  Pre-Quality Gates     Quality Gates      Post-Quality     │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ • Code Checkout │  │ • TDD Check  │  │ • Deploy     │   │
│  │ • Dep Install   │  │ • Coverage   │  │ • Monitor    │   │
│  │ • Build         │  │ • Linting    │  │ • Validate   │   │
│  └─────────────────┘  │ • Security   │  └──────────────┘   │
│                       │ • Performance│                     │
│                       └──────────────┘                     │
└─────────────────────────────────────────────────────────────┘
      ↓                        ↓                        ↓
┌─────────────────────────────────────────────────────────────┐
│              Claude Agentic Workflow System                │
│                                                             │
│  GUARDIAN Agent Pipeline Protection                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ • Real-time Monitoring                                  │ │
│  │ • Failure Detection & Analysis                          │ │
│  │ • Auto-Recovery Strategies                              │ │
│  │ • Performance Optimization                              │ │
│  │ • SLA Compliance Tracking                               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  Agent Coordination                                         │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │   AUDITOR   │  EXECUTOR   │ SECURITYGUARD│   MONITOR   │ │
│  │ Quality     │ Fix Impl.   │ Security    │ Performance │ │
│  │ Assessment  │ Pipeline    │ Scanning    │ Tracking    │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│                    Linear Integration                       │
│  • Task Creation for Pipeline Issues                       │
│  • Progress Tracking and Status Updates                    │
│  • Incident Management and Resolution                      │
└─────────────────────────────────────────────────────────────┘
```

### Quality Gate Enforcement

The system enforces quality gates at multiple pipeline stages:

1. **Pre-Build Gates**: Code quality, security scanning
2. **Build Gates**: Compilation, dependency validation
3. **Test Gates**: TDD compliance, coverage thresholds
4. **Post-Build Gates**: Performance validation, deployment readiness
5. **Deployment Gates**: Production readiness, rollback preparation

## Quality Gates Integration

### Core Quality Gates

#### TDD Compliance Gate

```yaml
# Quality Gate: TDD Compliance
- name: TDD Compliance Check
  run: |
    npm run validate-tdd
    if [ $? -ne 0 ]; then
      echo "❌ TDD compliance failed"
      npm run agent:invoke GUARDIAN:handle-tdd-failure
      exit 1
    fi
    echo "✅ TDD compliance passed"
```

#### Coverage Gate

```yaml
# Quality Gate: Test Coverage
- name: Coverage Gate
  run: |
    npm test -- --coverage --coverageThreshold='{"global":{"lines":80,"branches":80,"functions":80,"statements":80}}'
    if [ $? -ne 0 ]; then
      echo "❌ Coverage threshold not met"
      npm run agent:invoke AUDITOR:create-coverage-task
      exit 1
    fi
    echo "✅ Coverage gate passed"
```

#### Security Gate

```yaml
# Quality Gate: Security Scan
- name: Security Gate
  run: |
    npm run agent:invoke SECURITYGUARD:security-scan
    SECURITY_SCORE=$(npm run agent:invoke SECURITYGUARD:get-security-score --silent)
    if [ "$SECURITY_SCORE" -lt "80" ]; then
      echo "❌ Security scan failed (Score: $SECURITY_SCORE)"
      npm run agent:invoke GUARDIAN:handle-security-failure
      exit 1
    fi
    echo "✅ Security gate passed (Score: $SECURITY_SCORE)"
```

#### Performance Gate

```yaml
# Quality Gate: Performance Validation
- name: Performance Gate
  run: |
    npm run test:performance
    if [ $? -ne 0 ]; then
      echo "❌ Performance regression detected"
      npm run agent:invoke MONITOR:create-performance-incident
      exit 1
    fi
    echo "✅ Performance gate passed"
```

### Configurable Quality Thresholds

Configure quality gates in `.claude/quality-gates/`:

```json
// .claude/quality-gates/ci-cd-gates.json
{
  "gates": {
    "tdd_compliance": {
      "enabled": true,
      "enforcement_level": "strict",
      "exemptions": ["scripts/", "docs/"]
    },
    "coverage": {
      "enabled": true,
      "thresholds": {
        "lines": 80,
        "branches": 80,
        "functions": 80,
        "statements": 80
      },
      "diff_coverage": 80
    },
    "security": {
      "enabled": true,
      "min_score": 80,
      "block_critical": true,
      "block_high": false
    },
    "performance": {
      "enabled": true,
      "max_regression": "10%",
      "timeout_threshold": "5s"
    },
    "linting": {
      "enabled": true,
      "max_warnings": 0,
      "allow_fixable": true
    }
  }
}
```

## GUARDIAN Agent Pipeline Protection

### Pipeline Monitoring

The GUARDIAN agent provides continuous pipeline monitoring:

```bash
# Enable pipeline monitoring
npm run agent:invoke GUARDIAN:enable-monitoring -- --pipeline main

# Check pipeline health
npm run agent:invoke GUARDIAN:check-pipelines

# Get pipeline status
npm run agent:invoke GUARDIAN:pipeline-status -- --pipeline main

# Monitor specific build
npm run agent:invoke GUARDIAN:monitor-build -- --build-id 12345
```

### Failure Detection and Analysis

GUARDIAN analyzes pipeline failures and categorizes them:

```bash
# Analyze recent failure
npm run agent:invoke GUARDIAN:analyze-failure -- --build-id 12345

# Get failure patterns
npm run agent:invoke GUARDIAN:failure-patterns

# Predict potential failures
npm run agent:invoke GUARDIAN:predict-failures
```

#### Failure Categories

| Category | Description | Auto-Recovery | Escalation |
|----------|-------------|---------------|------------|
| **Transient** | Network timeouts, resource limits | ✅ Automatic | None |
| **Environment** | Dependency issues, config problems | ✅ Automatic | Low |
| **Code Quality** | Test failures, linting errors | ❌ Manual | Medium |
| **Security** | Vulnerability detection | ❌ Manual | High |
| **Infrastructure** | Platform issues, outages | ⚠️ Limited | High |

### Auto-Recovery Strategies

#### Transient Failure Recovery

```yaml
# Auto-recovery for transient failures
- name: GUARDIAN Auto-Recovery
  if: failure()
  run: |
    FAILURE_TYPE=$(npm run agent:invoke GUARDIAN:classify-failure --build-id ${{ github.run_id }} --silent)

    if [ "$FAILURE_TYPE" = "transient" ]; then
      echo "🔄 Attempting auto-recovery for transient failure"
      npm run agent:invoke GUARDIAN:auto-recover -- --build-id ${{ github.run_id }}

      # Retry the failed step
      if [ $? -eq 0 ]; then
        echo "✅ Auto-recovery successful"
        # Re-run the pipeline stage
        npm run ci:retry-stage
      else
        echo "❌ Auto-recovery failed, escalating"
        npm run agent:invoke GUARDIAN:escalate-failure
        exit 1
      fi
    else
      echo "⚠️ Non-transient failure, requires manual intervention"
      npm run agent:invoke GUARDIAN:create-incident
      exit 1
    fi
```

#### Environment Recovery

```bash
# Environment recovery strategies
npm run agent:invoke GUARDIAN:recover-environment -- --strategy clean_rebuild
npm run agent:invoke GUARDIAN:recover-environment -- --strategy dependency_refresh
npm run agent:invoke GUARDIAN:recover-environment -- --strategy cache_clear
```

#### Resource Optimization

```bash
# Dynamic resource allocation
npm run agent:invoke GUARDIAN:optimize-resources -- --pipeline main
npm run agent:invoke GUARDIAN:scale-resources -- --factor 1.5
npm run agent:invoke GUARDIAN:balance-load
```

## GitHub Actions Integration

### Complete GitHub Actions Workflow

```yaml
# .github/workflows/claude-workflow.yml
name: Claude Agentic Workflow

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  CLAUDE_MODE: 'ci'
  CLAUDE_LINEAR_TEAM_ID: ${{ secrets.CLAUDE_LINEAR_TEAM_ID }}
  CLAUDE_LINEAR_API_KEY: ${{ secrets.CLAUDE_LINEAR_API_KEY }}

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      cache-key: ${{ steps.cache-key.outputs.key }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Generate Cache Key
        id: cache-key
        run: echo "key=node-modules-${{ hashFiles('package-lock.json') }}" >> $GITHUB_OUTPUT

      - name: Cache Dependencies
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ steps.cache-key.outputs.key }}

      - name: Install Dependencies
        run: npm ci

      - name: Initialize Claude System
        run: |
          npm run setup -- --ci-mode
          npm run validate

  quality-gates:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Restore Dependencies
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ needs.setup.outputs.cache-key }}

      - name: GUARDIAN Pipeline Monitor Start
        run: npm run agent:invoke GUARDIAN:start-monitoring -- --build-id ${{ github.run_id }}

      - name: TDD Compliance Gate
        run: |
          npm run validate-tdd
          if [ $? -ne 0 ]; then
            npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate tdd --build-id ${{ github.run_id }}
            exit 1
          fi

      - name: Linting Gate
        run: |
          npm run lint -- --max-warnings 0
          if [ $? -ne 0 ]; then
            npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate linting --build-id ${{ github.run_id }}
            exit 1
          fi

      - name: Type Checking Gate
        run: |
          npm run typecheck
          if [ $? -ne 0 ]; then
            npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate typecheck --build-id ${{ github.run_id }}
            exit 1
          fi

  testing:
    needs: [setup, quality-gates]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Restore Dependencies
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ needs.setup.outputs.cache-key }}

      - name: Unit Tests with Coverage
        run: |
          npm test -- --coverage --coverageReporters=json-summary

      - name: Coverage Gate
        run: |
          npm run validate:coverage-gate
          if [ $? -ne 0 ]; then
            npm run agent:invoke AUDITOR:create-coverage-task -- --build-id ${{ github.run_id }}
            npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate coverage --build-id ${{ github.run_id }}
            exit 1
          fi

      - name: Integration Tests
        run: npm run test:integration

      - name: Mutation Testing (Critical Paths)
        run: |
          npm run test:mutation -- --threshold 30
          if [ $? -ne 0 ]; then
            npm run agent:invoke TESTER:improve-test-quality -- --build-id ${{ github.run_id }}
            exit 1
          fi

  security:
    needs: [setup, quality-gates]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Restore Dependencies
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ needs.setup.outputs.cache-key }}

      - name: Security Scan
        run: |
          npm run agent:invoke SECURITYGUARD:security-scan
          SECURITY_SCORE=$(npm run agent:invoke SECURITYGUARD:get-security-score --silent)
          if [ "$SECURITY_SCORE" -lt "80" ]; then
            npm run agent:invoke GUARDIAN:handle-security-failure -- --score $SECURITY_SCORE --build-id ${{ github.run_id }}
            exit 1
          fi

      - name: Dependency Vulnerability Check
        run: |
          npm audit --audit-level=moderate
          if [ $? -ne 0 ]; then
            npm run agent:invoke SECURITYGUARD:create-vulnerability-tasks
            exit 1
          fi

  performance:
    needs: [setup, quality-gates, testing]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Restore Dependencies
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ needs.setup.outputs.cache-key }}

      - name: Build Application
        run: npm run build

      - name: Performance Tests
        run: |
          npm run test:performance
          if [ $? -ne 0 ]; then
            npm run agent:invoke MONITOR:create-performance-incident -- --build-id ${{ github.run_id }}
            exit 1
          fi

      - name: Bundle Size Analysis
        run: |
          npm run analyze:bundle-size
          if [ $? -ne 0 ]; then
            npm run agent:invoke OPTIMIZER:create-optimization-task -- --type bundle-size
          fi

  deployment-readiness:
    needs: [testing, security, performance]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Deployment Readiness Check
        run: |
          npm run agent:invoke GUARDIAN:deployment-readiness-check
          if [ $? -ne 0 ]; then
            npm run agent:invoke GUARDIAN:block-deployment -- --reason "Readiness check failed"
            exit 1
          fi

      - name: Generate Deployment Report
        run: npm run agent:invoke STRATEGIST:deployment-report -- --build-id ${{ github.run_id }}

  pipeline-completion:
    needs: [testing, security, performance]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - uses: actions/checkout@v4

      - name: Pipeline Success Notification
        if: needs.testing.result == 'success' && needs.security.result == 'success' && needs.performance.result == 'success'
        run: |
          npm run agent:invoke GUARDIAN:pipeline-success -- --build-id ${{ github.run_id }}
          npm run agent:invoke STRATEGIST:update-linear-tasks -- --status completed

      - name: Pipeline Failure Handling
        if: needs.testing.result == 'failure' || needs.security.result == 'failure' || needs.performance.result == 'failure'
        run: |
          npm run agent:invoke GUARDIAN:pipeline-failure -- --build-id ${{ github.run_id }}
          npm run agent:invoke GUARDIAN:attempt-recovery -- --build-id ${{ github.run_id }}

      - name: Pipeline Metrics Update
        run: |
          npm run agent:invoke MONITOR:update-pipeline-metrics -- --build-id ${{ github.run_id }}
          npm run agent:invoke SCHOLAR:learn-from-pipeline -- --build-id ${{ github.run_id }}
```

### GitHub Actions Secrets Configuration

Required secrets in GitHub repository settings:

```bash
# Linear Integration
CLAUDE_LINEAR_API_KEY=lin_api_...
CLAUDE_LINEAR_TEAM_ID=your-team-id
CLAUDE_LINEAR_PROJECT_ID=your-project-id

# Optional: Custom Configuration
CLAUDE_MODE=ci
CLAUDE_MAX_CONCURRENT_AGENTS=2
CLAUDE_PIPELINE_TIMEOUT=1800
```

## GitLab CI Integration

### Complete GitLab CI Configuration

```yaml
# .gitlab-ci.yml
stages:
  - setup
  - quality-gates
  - testing
  - security
  - performance
  - deployment-readiness

variables:
  NODE_VERSION: "18"
  CLAUDE_MODE: "ci"
  CLAUDE_LINEAR_TEAM_ID: $CLAUDE_LINEAR_TEAM_ID
  CLAUDE_LINEAR_API_KEY: $CLAUDE_LINEAR_API_KEY

.node-template: &node-template
  image: node:18-alpine
  before_script:
    - npm ci
    - npm run setup -- --ci-mode

setup:
  <<: *node-template
  stage: setup
  script:
    - npm run validate
    - npm run agent:invoke GUARDIAN:start-monitoring -- --build-id $CI_PIPELINE_ID
  cache:
    key: $CI_COMMIT_REF_SLUG-$CI_COMMIT_SHA
    paths:
      - node_modules/
      - .claude/cache/

quality-gates:
  <<: *node-template
  stage: quality-gates
  script:
    # TDD Compliance
    - |
      npm run validate-tdd || {
        npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate tdd --build-id $CI_PIPELINE_ID
        exit 1
      }
    # Linting
    - |
      npm run lint -- --max-warnings 0 || {
        npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate linting --build-id $CI_PIPELINE_ID
        exit 1
      }
    # Type Checking
    - |
      npm run typecheck || {
        npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate typecheck --build-id $CI_PIPELINE_ID
        exit 1
      }
  cache:
    key: $CI_COMMIT_REF_SLUG-$CI_COMMIT_SHA
    paths:
      - node_modules/
      - .claude/cache/
    policy: pull

testing:
  <<: *node-template
  stage: testing
  script:
    # Unit Tests with Coverage
    - npm test -- --coverage --coverageReporters=json-summary
    # Coverage Gate
    - |
      npm run validate:coverage-gate || {
        npm run agent:invoke AUDITOR:create-coverage-task -- --build-id $CI_PIPELINE_ID
        npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate coverage --build-id $CI_PIPELINE_ID
        exit 1
      }
    # Integration Tests
    - npm run test:integration
    # Mutation Testing
    - |
      npm run test:mutation -- --threshold 30 || {
        npm run agent:invoke TESTER:improve-test-quality -- --build-id $CI_PIPELINE_ID
        exit 1
      }
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
  cache:
    key: $CI_COMMIT_REF_SLUG-$CI_COMMIT_SHA
    paths:
      - node_modules/
      - .claude/cache/
    policy: pull

security:
  <<: *node-template
  stage: security
  script:
    # Security Scan
    - |
      npm run agent:invoke SECURITYGUARD:security-scan
      SECURITY_SCORE=$(npm run agent:invoke SECURITYGUARD:get-security-score --silent)
      if [ "$SECURITY_SCORE" -lt "80" ]; then
        npm run agent:invoke GUARDIAN:handle-security-failure -- --score $SECURITY_SCORE --build-id $CI_PIPELINE_ID
        exit 1
      fi
    # Dependency Check
    - |
      npm audit --audit-level=moderate || {
        npm run agent:invoke SECURITYGUARD:create-vulnerability-tasks
        exit 1
      }
  cache:
    key: $CI_COMMIT_REF_SLUG-$CI_COMMIT_SHA
    paths:
      - node_modules/
      - .claude/cache/
    policy: pull

performance:
  <<: *node-template
  stage: performance
  script:
    - npm run build
    # Performance Tests
    - |
      npm run test:performance || {
        npm run agent:invoke MONITOR:create-performance-incident -- --build-id $CI_PIPELINE_ID
        exit 1
      }
    # Bundle Analysis
    - |
      npm run analyze:bundle-size || {
        npm run agent:invoke OPTIMIZER:create-optimization-task -- --type bundle-size
      }
  cache:
    key: $CI_COMMIT_REF_SLUG-$CI_COMMIT_SHA
    paths:
      - node_modules/
      - .claude/cache/
    policy: pull

deployment-readiness:
  <<: *node-template
  stage: deployment-readiness
  script:
    - |
      npm run agent:invoke GUARDIAN:deployment-readiness-check || {
        npm run agent:invoke GUARDIAN:block-deployment -- --reason "Readiness check failed"
        exit 1
      }
    - npm run agent:invoke STRATEGIST:deployment-report -- --build-id $CI_PIPELINE_ID
  only:
    - main
  cache:
    key: $CI_COMMIT_REF_SLUG-$CI_COMMIT_SHA
    paths:
      - node_modules/
      - .claude/cache/
    policy: pull

pipeline-completion:
  <<: *node-template
  stage: .post
  script:
    - |
      if [ "$CI_PIPELINE_STATUS" = "success" ]; then
        npm run agent:invoke GUARDIAN:pipeline-success -- --build-id $CI_PIPELINE_ID
        npm run agent:invoke STRATEGIST:update-linear-tasks -- --status completed
      else
        npm run agent:invoke GUARDIAN:pipeline-failure -- --build-id $CI_PIPELINE_ID
        npm run agent:invoke GUARDIAN:attempt-recovery -- --build-id $CI_PIPELINE_ID
      fi
    - npm run agent:invoke MONITOR:update-pipeline-metrics -- --build-id $CI_PIPELINE_ID
    - npm run agent:invoke SCHOLAR:learn-from-pipeline -- --build-id $CI_PIPELINE_ID
  when: always
  cache:
    key: $CI_COMMIT_REF_SLUG-$CI_COMMIT_SHA
    paths:
      - node_modules/
      - .claude/cache/
    policy: pull
```

## Jenkins Integration

### Jenkins Pipeline Configuration

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        CLAUDE_MODE = 'ci'
        CLAUDE_LINEAR_TEAM_ID = credentials('claude-linear-team-id')
        CLAUDE_LINEAR_API_KEY = credentials('claude-linear-api-key')
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    // Setup Node.js
                    sh """
                        nvm use ${NODE_VERSION}
                        npm ci
                        npm run setup -- --ci-mode
                        npm run validate
                    """

                    // Start GUARDIAN monitoring
                    sh "npm run agent:invoke GUARDIAN:start-monitoring -- --build-id ${BUILD_ID}"
                }
            }
        }

        stage('Quality Gates') {
            parallel {
                stage('TDD Compliance') {
                    steps {
                        script {
                            try {
                                sh 'npm run validate-tdd'
                            } catch (Exception e) {
                                sh "npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate tdd --build-id ${BUILD_ID}"
                                error("TDD compliance failed")
                            }
                        }
                    }
                }

                stage('Linting') {
                    steps {
                        script {
                            try {
                                sh 'npm run lint -- --max-warnings 0'
                            } catch (Exception e) {
                                sh "npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate linting --build-id ${BUILD_ID}"
                                error("Linting failed")
                            }
                        }
                    }
                }

                stage('Type Checking') {
                    steps {
                        script {
                            try {
                                sh 'npm run typecheck'
                            } catch (Exception e) {
                                sh "npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate typecheck --build-id ${BUILD_ID}"
                                error("Type checking failed")
                            }
                        }
                    }
                }
            }
        }

        stage('Testing') {
            steps {
                script {
                    // Unit Tests with Coverage
                    sh 'npm test -- --coverage --coverageReporters=json-summary'

                    // Coverage Gate
                    try {
                        sh 'npm run validate:coverage-gate'
                    } catch (Exception e) {
                        sh "npm run agent:invoke AUDITOR:create-coverage-task -- --build-id ${BUILD_ID}"
                        sh "npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate coverage --build-id ${BUILD_ID}"
                        error("Coverage gate failed")
                    }

                    // Integration Tests
                    sh 'npm run test:integration'

                    // Mutation Testing
                    try {
                        sh 'npm run test:mutation -- --threshold 30'
                    } catch (Exception e) {
                        sh "npm run agent:invoke TESTER:improve-test-quality -- --build-id ${BUILD_ID}"
                        error("Mutation testing failed")
                    }
                }
            }

            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }

        stage('Security') {
            steps {
                script {
                    // Security Scan
                    def securityScore = sh(
                        script: "npm run agent:invoke SECURITYGUARD:security-scan && npm run agent:invoke SECURITYGUARD:get-security-score --silent",
                        returnStdout: true
                    ).trim()

                    if (securityScore.toInteger() < 80) {
                        sh "npm run agent:invoke GUARDIAN:handle-security-failure -- --score ${securityScore} --build-id ${BUILD_ID}"
                        error("Security scan failed with score: ${securityScore}")
                    }

                    // Dependency Check
                    try {
                        sh 'npm audit --audit-level=moderate'
                    } catch (Exception e) {
                        sh "npm run agent:invoke SECURITYGUARD:create-vulnerability-tasks"
                        error("Dependency vulnerabilities found")
                    }
                }
            }
        }

        stage('Performance') {
            steps {
                script {
                    // Build Application
                    sh 'npm run build'

                    // Performance Tests
                    try {
                        sh 'npm run test:performance'
                    } catch (Exception e) {
                        sh "npm run agent:invoke MONITOR:create-performance-incident -- --build-id ${BUILD_ID}"
                        error("Performance tests failed")
                    }

                    // Bundle Analysis
                    try {
                        sh 'npm run analyze:bundle-size'
                    } catch (Exception e) {
                        sh "npm run agent:invoke OPTIMIZER:create-optimization-task -- --type bundle-size"
                        // Non-blocking for bundle size
                    }
                }
            }
        }

        stage('Deployment Readiness') {
            when {
                branch 'main'
            }
            steps {
                script {
                    try {
                        sh 'npm run agent:invoke GUARDIAN:deployment-readiness-check'
                    } catch (Exception e) {
                        sh "npm run agent:invoke GUARDIAN:block-deployment -- --reason 'Readiness check failed'"
                        error("Deployment readiness check failed")
                    }

                    sh "npm run agent:invoke STRATEGIST:deployment-report -- --build-id ${BUILD_ID}"
                }
            }
        }
    }

    post {
        success {
            script {
                sh "npm run agent:invoke GUARDIAN:pipeline-success -- --build-id ${BUILD_ID}"
                sh "npm run agent:invoke STRATEGIST:update-linear-tasks -- --status completed"
            }
        }

        failure {
            script {
                sh "npm run agent:invoke GUARDIAN:pipeline-failure -- --build-id ${BUILD_ID}"
                sh "npm run agent:invoke GUARDIAN:attempt-recovery -- --build-id ${BUILD_ID}"
            }
        }

        always {
            script {
                sh "npm run agent:invoke MONITOR:update-pipeline-metrics -- --build-id ${BUILD_ID}"
                sh "npm run agent:invoke SCHOLAR:learn-from-pipeline -- --build-id ${BUILD_ID}"
            }
        }
    }
}
```

## Auto-Recovery Mechanisms

### Intelligent Recovery Strategies

The GUARDIAN agent implements multiple recovery strategies:

#### 1. Transient Failure Recovery

```bash
# Automatic retry with exponential backoff
npm run agent:invoke GUARDIAN:auto-recover -- --strategy retry --max-attempts 3

# Resource cleanup and retry
npm run agent:invoke GUARDIAN:auto-recover -- --strategy clean-retry

# Environment reset and retry
npm run agent:invoke GUARDIAN:auto-recover -- --strategy reset-retry
```

#### 2. Environment Recovery

```bash
# Dependency refresh
npm run agent:invoke GUARDIAN:recover-environment -- --strategy dependency-refresh

# Cache invalidation
npm run agent:invoke GUARDIAN:recover-environment -- --strategy cache-clear

# Clean rebuild
npm run agent:invoke GUARDIAN:recover-environment -- --strategy clean-rebuild
```

#### 3. Resource Optimization

```bash
# Memory optimization
npm run agent:invoke GUARDIAN:optimize-resources -- --type memory

# CPU optimization
npm run agent:invoke GUARDIAN:optimize-resources -- --type cpu

# Network optimization
npm run agent:invoke GUARDIAN:optimize-resources -- --type network
```

### Recovery Configuration

Configure recovery strategies in `.claude/agents/guardian.json`:

```json
{
  "auto_recovery": {
    "enabled": true,
    "strategies": {
      "transient_failures": {
        "max_attempts": 3,
        "backoff_strategy": "exponential",
        "base_delay": 30
      },
      "environment_issues": {
        "cleanup_before_retry": true,
        "rebuild_threshold": 2,
        "cache_invalidation": true
      },
      "resource_constraints": {
        "auto_scaling": true,
        "memory_optimization": true,
        "parallel_optimization": true
      }
    },
    "escalation": {
      "max_recovery_attempts": 5,
      "escalation_timeout": 1800,
      "human_intervention_threshold": 3
    }
  }
}
```

## Performance Monitoring

### Pipeline Performance Metrics

The system tracks comprehensive pipeline performance:

```bash
# Real-time pipeline metrics
npm run agent:invoke MONITOR:pipeline-metrics

# Performance trends
npm run agent:invoke ANALYZER:pipeline-performance-trends

# SLA compliance
npm run agent:invoke MONITOR:sla-compliance-report

# Bottleneck analysis
npm run agent:invoke ANALYZER:pipeline-bottlenecks
```

### Key Performance Indicators

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **Pipeline Success Rate** | ≥95% | <90% | <85% |
| **Average Build Time** | ≤10min | >15min | >20min |
| **Recovery Success Rate** | ≥90% | <80% | <70% |
| **Quality Gate Pass Rate** | ≥98% | <95% | <90% |
| **Security Scan Time** | ≤2min | >3min | >5min |

### Performance Optimization

```bash
# Optimize pipeline performance
npm run agent:invoke OPTIMIZER:optimize-pipeline

# Parallel execution optimization
npm run agent:invoke STRATEGIST:optimize-parallelism

# Resource allocation optimization
npm run agent:invoke GUARDIAN:optimize-resource-allocation

# Cache optimization
npm run agent:invoke OPTIMIZER:optimize-caching
```

## Custom Pipeline Integration

### Creating Custom Pipeline Integration

For platforms not directly supported, create custom integration:

```bash
# Generate pipeline template
npm run pipeline:generate-template -- --platform custom --name "MyPlatform"

# Configure custom integration
npm run pipeline:configure -- --platform custom --config custom-config.json

# Test custom integration
npm run pipeline:test -- --platform custom --dry-run
```

### Custom Integration Template

```yaml
# .claude/pipelines/custom-template.yml
name: Claude Custom Pipeline
description: Template for custom CI/CD platform integration

stages:
  setup:
    description: Initialize Claude system
    commands:
      - npm run setup -- --ci-mode
      - npm run validate
      - npm run agent:invoke GUARDIAN:start-monitoring -- --build-id ${BUILD_ID}

  quality-gates:
    description: Run quality gates
    parallel: true
    gates:
      - name: tdd-compliance
        command: npm run validate-tdd
        on_failure: npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate tdd
      - name: linting
        command: npm run lint -- --max-warnings 0
        on_failure: npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate linting
      - name: typecheck
        command: npm run typecheck
        on_failure: npm run agent:invoke GUARDIAN:handle-gate-failure -- --gate typecheck

  testing:
    description: Run comprehensive tests
    commands:
      - npm test -- --coverage
      - npm run validate:coverage-gate
      - npm run test:integration
      - npm run test:mutation -- --threshold 30

  security:
    description: Security validation
    commands:
      - npm run agent:invoke SECURITYGUARD:security-scan
      - npm audit --audit-level=moderate

  performance:
    description: Performance validation
    commands:
      - npm run build
      - npm run test:performance
      - npm run analyze:bundle-size

  completion:
    description: Pipeline completion handling
    commands:
      - npm run agent:invoke GUARDIAN:pipeline-completion
      - npm run agent:invoke MONITOR:update-pipeline-metrics
      - npm run agent:invoke SCHOLAR:learn-from-pipeline
```

## Troubleshooting

### Common CI/CD Issues

#### Pipeline Hanging

**Symptoms**: Pipeline gets stuck, no progress for extended periods

```bash
# Diagnose hanging pipeline
npm run agent:invoke GUARDIAN:diagnose-hang -- --build-id 12345

# Force timeout and recovery
npm run agent:invoke GUARDIAN:force-timeout -- --build-id 12345

# Analyze resource usage
npm run agent:invoke MONITOR:analyze-resource-usage -- --build-id 12345
```

#### Quality Gate Failures

**Symptoms**: Specific quality gates consistently failing

```bash
# Analyze gate failure patterns
npm run agent:invoke GUARDIAN:analyze-gate-failures

# Adjust gate thresholds temporarily
npm run agent:invoke GUARDIAN:adjust-gate-thresholds -- --gate coverage --threshold 75

# Create improvement plan
npm run agent:invoke STRATEGIST:create-improvement-plan -- --gate coverage
```

#### Auto-Recovery Failures

**Symptoms**: GUARDIAN unable to recover failed pipelines

```bash
# Check recovery capability
npm run agent:invoke GUARDIAN:recovery-capability-check

# Manual recovery attempt
npm run agent:invoke GUARDIAN:manual-recovery -- --build-id 12345

# Reset recovery state
npm run agent:invoke GUARDIAN:reset-recovery-state
```

### Debugging Commands

```bash
# Enable pipeline debugging
export CLAUDE_PIPELINE_DEBUG=true
export CLAUDE_LOG_LEVEL=debug

# Pipeline execution tracing
npm run pipeline:trace -- --build-id 12345

# Agent interaction logs
npm run agent:logs -- --filter pipeline

# Performance profiling
npm run pipeline:profile -- --build-id 12345
```

## Best Practices

### Pipeline Design

1. **Fail Fast**: Put quality gates early in pipeline
2. **Parallel Execution**: Run independent stages in parallel
3. **Caching Strategy**: Implement effective caching for dependencies
4. **Resource Optimization**: Right-size resources for workload
5. **Monitoring**: Comprehensive monitoring and alerting

### Quality Gate Strategy

1. **Graduated Enforcement**: Start lenient, tighten over time
2. **Context-Aware**: Different thresholds for different contexts
3. **Performance Balance**: Balance quality vs pipeline speed
4. **Team Training**: Ensure team understands quality requirements
5. **Continuous Improvement**: Regular review and adjustment

### Recovery Strategy

1. **Proactive Monitoring**: Monitor for issues before they cause failures
2. **Intelligent Classification**: Accurately classify failure types
3. **Appropriate Response**: Match recovery strategy to failure type
4. **Human Escalation**: Know when to escalate to humans
5. **Learning Loop**: Learn from failures to improve recovery

### Performance Optimization

1. **Baseline Measurement**: Establish performance baselines
2. **Continuous Monitoring**: Monitor performance trends
3. **Bottleneck Identification**: Regularly identify and address bottlenecks
4. **Resource Right-sizing**: Optimize resource allocation
5. **Caching Optimization**: Implement effective caching strategies

### Security Integration

1. **Security by Default**: Integrate security from the start
2. **Automated Scanning**: Comprehensive automated security scanning
3. **Vulnerability Management**: Systematic vulnerability management
4. **Compliance Checking**: Automated compliance validation
5. **Incident Response**: Rapid security incident response

---

**The CI/CD integration transforms your pipeline from a basic automation tool into an intelligent, self-healing development workflow. With GUARDIAN protection and agent coordination, achieve >95% pipeline success rates while maintaining the highest quality standards! 🚀**

**For additional CI/CD integration help:**
- [User Guide](USER-GUIDE.md) - Complete system overview
- [Agent Overview](AGENT-OVERVIEW.md) - Understanding GUARDIAN agent
- [Configuration](CONFIGURATION.md) - Pipeline configuration details
- [Troubleshooting](TROUBLESHOOTING.md) - Pipeline issue resolution