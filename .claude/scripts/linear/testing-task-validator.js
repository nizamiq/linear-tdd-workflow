#!/usr/bin/env node

/**
 * Testing Task Validator
 *
 * Specialized validation rules for testing and coverage-related Linear tasks.
 * Ensures tasks follow project-specific conventions and quality standards.
 */

class TestingTaskValidator {
  constructor() {
    this.validationRules = {
      coverage: this.getCoverageTaskRules(),
      tdd: this.getTDDTaskRules(),
      testing: this.getGeneralTestingRules(),
      specification: this.getSpecificationTaskRules(),
    };

    this.requiredLabels = {
      coverage: ['testing', 'coverage'],
      tdd: ['tdd', 'process'],
      security: ['security', 'testing'],
      performance: ['performance', 'testing'],
      integration: ['integration', 'testing'],
    };

    this.estimationGuidelines = {
      unitTest: { min: 1, max: 3, typical: 2 },
      integrationTest: { min: 2, max: 5, typical: 3 },
      e2eTest: { min: 3, max: 8, typical: 5 },
      securityTest: { min: 3, max: 8, typical: 5 },
      performanceTest: { min: 5, max: 13, typical: 8 },
      tddViolationFix: { min: 1, max: 5, typical: 2 },
    };
  }

  /**
   * Validate a testing-related task
   */
  validateTestingTask(task, options = {}) {
    const { strict = false, project = 'default', enforceEstimation = true } = options;

    const violations = [];
    const taskType = this.inferTaskType(task);

    // Apply general task validation first
    violations.push(...this.validateBasicRequirements(task));

    // Apply type-specific validation
    if (this.validationRules[taskType]) {
      violations.push(...this.validationRules[taskType](task, { strict, project }));
    }

    // Validate estimation guidelines
    if (enforceEstimation) {
      violations.push(...this.validateEstimation(task, taskType));
    }

    // Validate testing-specific requirements
    violations.push(...this.validateTestingSpecificRules(task, taskType));

    // Validate against project standards
    violations.push(...this.validateProjectStandards(task, project));

    return {
      isValid: violations.length === 0,
      violations,
      taskType,
      recommendations: this.generateRecommendations(task, violations, taskType),
    };
  }

  /**
   * Infer task type from task content
   */
  inferTaskType(task) {
    const title = task.title?.toLowerCase() || '';
    const description = task.description?.toLowerCase() || '';
    const labels = task.labels || [];

    // Check labels first (most reliable)
    if (labels.includes('coverage')) return 'coverage';
    if (labels.includes('tdd')) return 'tdd';
    if (labels.includes('specification')) return 'specification';
    if (labels.includes('security') && labels.includes('testing')) return 'security';
    if (labels.includes('performance') && labels.includes('testing')) return 'performance';

    // Check title and description
    if (title.includes('coverage') || description.includes('coverage')) return 'coverage';
    if (title.includes('tdd') || description.includes('tdd')) return 'tdd';
    if (title.includes('specification') || description.includes('specification'))
      return 'specification';
    if (title.includes('security test') || description.includes('security test')) return 'security';
    if (title.includes('performance test') || description.includes('performance test'))
      return 'performance';

    return 'testing'; // Default fallback
  }

  /**
   * Validate basic requirements for all testing tasks
   */
  validateBasicRequirements(task) {
    const violations = [];

    // Title requirements
    if (!task.title || task.title.length < 10) {
      violations.push({
        field: 'title',
        severity: 'error',
        rule: 'minimum-length',
        message: 'Task title must be at least 10 characters',
      });
    }

    if (task.title && task.title.length > 60) {
      violations.push({
        field: 'title',
        severity: 'warning',
        rule: 'maximum-length',
        message: 'Task title should be under 60 characters for readability',
      });
    }

    // Description requirements
    if (!task.description || task.description.length < 50) {
      violations.push({
        field: 'description',
        severity: 'error',
        rule: 'minimum-content',
        message: 'Task description must be at least 50 characters and provide clear context',
      });
    }

    // Required testing labels
    if (!task.labels || !task.labels.includes('testing')) {
      violations.push({
        field: 'labels',
        severity: 'error',
        rule: 'required-testing-label',
        message: 'All testing tasks must have the "testing" label',
      });
    }

    // Estimate requirements
    if (!task.estimate) {
      violations.push({
        field: 'estimate',
        severity: 'error',
        rule: 'required-estimate',
        message: 'Testing tasks must have story point estimates',
      });
    }

    // Priority requirements
    if (!task.priority) {
      violations.push({
        field: 'priority',
        severity: 'warning',
        rule: 'missing-priority',
        message: 'Testing tasks should have explicit priority',
      });
    }

    return violations;
  }

  /**
   * Coverage task validation rules
   */
  getCoverageTaskRules() {
    return (task, options) => {
      const violations = [];
      const { strict } = options;

      // Must have coverage label
      if (!task.labels?.includes('coverage')) {
        violations.push({
          field: 'labels',
          severity: 'error',
          rule: 'coverage-label-required',
          message: 'Coverage tasks must have "coverage" label',
        });
      }

      // Description must mention specific coverage target
      if (!task.description?.includes('%') && !task.description?.includes('coverage')) {
        violations.push({
          field: 'description',
          severity: 'warning',
          rule: 'coverage-target-missing',
          message: 'Coverage tasks should specify target coverage percentage',
        });
      }

      // Should have acceptance criteria
      if (
        !task.description?.includes('Acceptance Criteria') &&
        !task.description?.includes('- [ ]')
      ) {
        violations.push({
          field: 'description',
          severity: 'warning',
          rule: 'missing-acceptance-criteria',
          message: 'Coverage tasks should include acceptance criteria checklist',
        });
      }

      // Strict mode validations
      if (strict) {
        // Must reference specific module or component
        if (!task.description?.includes('Module:') && !task.description?.includes('Component:')) {
          violations.push({
            field: 'description',
            severity: 'error',
            rule: 'missing-component-reference',
            message: 'Coverage tasks must specify the module or component being tested',
          });
        }

        // Must have technical-debt label for gaps
        if (task.title?.includes('gap') && !task.labels?.includes('technical-debt')) {
          violations.push({
            field: 'labels',
            severity: 'error',
            rule: 'missing-technical-debt-label',
            message: 'Coverage gap tasks must be labeled as technical debt',
          });
        }
      }

      return violations;
    };
  }

  /**
   * TDD task validation rules
   */
  getTDDTaskRules() {
    return (task, options) => {
      const violations = [];
      const { strict } = options;

      // Must have TDD-related labels
      if (!task.labels?.includes('tdd') && !task.labels?.includes('process')) {
        violations.push({
          field: 'labels',
          severity: 'error',
          rule: 'tdd-label-required',
          message: 'TDD tasks must have "tdd" or "process" label',
        });
      }

      // Description must mention RED-GREEN-REFACTOR or TDD cycle
      const tddKeywords = ['red-green-refactor', 'tdd', 'test-driven', 'failing test'];
      const hasKeyword = tddKeywords.some((keyword) =>
        task.description?.toLowerCase().includes(keyword),
      );

      if (!hasKeyword) {
        violations.push({
          field: 'description',
          severity: 'warning',
          rule: 'missing-tdd-context',
          message: 'TDD tasks should reference TDD methodology or cycle',
        });
      }

      // Should reference specific commit or violation
      if (task.title?.includes('violation') && !task.description?.includes('commit')) {
        violations.push({
          field: 'description',
          severity: 'warning',
          rule: 'missing-commit-reference',
          message: 'TDD violation tasks should reference the specific commit',
        });
      }

      return violations;
    };
  }

  /**
   * General testing task validation rules
   */
  getGeneralTestingRules() {
    return (task, options) => {
      const violations = [];

      // Should specify test type
      const testTypes = ['unit', 'integration', 'e2e', 'end-to-end', 'performance', 'security'];
      const hasTestType = testTypes.some(
        (type) =>
          task.title?.toLowerCase().includes(type) ||
          task.description?.toLowerCase().includes(type),
      );

      if (!hasTestType) {
        violations.push({
          field: 'description',
          severity: 'info',
          rule: 'test-type-clarification',
          message: 'Consider specifying test type (unit, integration, e2e, etc.)',
        });
      }

      // Should mention testing framework or tools
      const frameworks = ['jest', 'pytest', 'mocha', 'jasmine', 'cypress', 'playwright'];
      const mentionsFramework = frameworks.some((framework) =>
        task.description?.toLowerCase().includes(framework),
      );

      if (!mentionsFramework && task.estimate > 3) {
        violations.push({
          field: 'description',
          severity: 'info',
          rule: 'framework-suggestion',
          message: 'Consider mentioning testing framework or tools for larger tasks',
        });
      }

      return violations;
    };
  }

  /**
   * Specification task validation rules
   */
  getSpecificationTaskRules() {
    return (task, options) => {
      const violations = [];
      const { strict } = options;

      // Must have specification label
      if (!task.labels?.includes('specification')) {
        violations.push({
          field: 'labels',
          severity: 'error',
          rule: 'specification-label-required',
          message: 'Specification tasks must have "specification" label',
        });
      }

      // Should reference specification ID
      const hasSpecId = /SPEC-\d+|REQ-\d+|US-\d+/.test(task.description || '');
      if (!hasSpecId && strict) {
        violations.push({
          field: 'description',
          severity: 'warning',
          rule: 'missing-specification-id',
          message: 'Specification tasks should reference specific requirement ID',
        });
      }

      // Should have user story format for user-facing features
      if (task.labels?.includes('feature') && !task.description?.includes('As a')) {
        violations.push({
          field: 'description',
          severity: 'info',
          rule: 'user-story-format-suggestion',
          message: 'User-facing features should include user story format',
        });
      }

      return violations;
    };
  }

  /**
   * Validate estimation against guidelines
   */
  validateEstimation(task, taskType) {
    const violations = [];

    if (!task.estimate) {
      return violations; // Already caught in basic validation
    }

    // Get estimation guidelines for task type
    const guidelines = this.getEstimationGuidelines(task, taskType);

    if (guidelines) {
      if (task.estimate < guidelines.min) {
        violations.push({
          field: 'estimate',
          severity: 'warning',
          rule: 'estimate-too-low',
          message: `Estimate of ${task.estimate} seems low for ${taskType} tasks (typical: ${guidelines.typical} points)`,
        });
      }

      if (task.estimate > guidelines.max) {
        violations.push({
          field: 'estimate',
          severity: 'warning',
          rule: 'estimate-too-high',
          message: `Estimate of ${task.estimate} seems high for ${taskType} tasks (consider breaking down, typical: ${guidelines.typical} points)`,
        });
      }
    }

    // Fibonacci sequence validation
    const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21];
    if (!fibonacciNumbers.includes(task.estimate)) {
      violations.push({
        field: 'estimate',
        severity: 'info',
        rule: 'non-fibonacci-estimate',
        message: 'Consider using Fibonacci numbers for estimates (1, 2, 3, 5, 8, 13)',
      });
    }

    return violations;
  }

  /**
   * Get estimation guidelines based on task content
   */
  getEstimationGuidelines(task, taskType) {
    const title = task.title?.toLowerCase() || '';
    const description = task.description?.toLowerCase() || '';

    // Specific test type guidelines
    if (title.includes('unit test') || description.includes('unit test')) {
      return this.estimationGuidelines.unitTest;
    }
    if (title.includes('integration') || description.includes('integration')) {
      return this.estimationGuidelines.integrationTest;
    }
    if (title.includes('e2e') || title.includes('end-to-end')) {
      return this.estimationGuidelines.e2eTest;
    }
    if (title.includes('security') || description.includes('security')) {
      return this.estimationGuidelines.securityTest;
    }
    if (title.includes('performance') || description.includes('performance')) {
      return this.estimationGuidelines.performanceTest;
    }
    if (taskType === 'tdd') {
      return this.estimationGuidelines.tddViolationFix;
    }

    // Default guidelines based on task type
    return this.estimationGuidelines[taskType];
  }

  /**
   * Validate testing-specific rules
   */
  validateTestingSpecificRules(task, taskType) {
    const violations = [];

    // Test files should be mentioned for implementation tasks
    if (
      (task.title?.includes('implement') || task.title?.includes('create')) &&
      !task.description?.includes('.test.') &&
      !task.description?.includes('.spec.')
    ) {
      violations.push({
        field: 'description',
        severity: 'info',
        rule: 'test-file-mention',
        message: 'Consider mentioning specific test files to be created or modified',
      });
    }

    // Coverage tasks should mention coverage tools
    if (taskType === 'coverage' && task.estimate > 3) {
      const coverageTools = ['jest', 'nyc', 'istanbul', 'pytest-cov', 'coverage.py'];
      const mentionsTool = coverageTools.some((tool) =>
        task.description?.toLowerCase().includes(tool),
      );

      if (!mentionsTool) {
        violations.push({
          field: 'description',
          severity: 'info',
          rule: 'coverage-tool-suggestion',
          message: 'Consider mentioning coverage tools to be used',
        });
      }
    }

    // Tasks touching critical paths should have higher priority
    const criticalKeywords = [
      'authentication',
      'authorization',
      'payment',
      'security',
      'data validation',
    ];
    const touchesCriticalPath = criticalKeywords.some(
      (keyword) =>
        task.title?.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword),
    );

    if (touchesCriticalPath && task.priority > 2) {
      violations.push({
        field: 'priority',
        severity: 'warning',
        rule: 'critical-path-priority',
        message: 'Tasks touching critical paths should have high priority',
      });
    }

    return violations;
  }

  /**
   * Validate against project-specific standards
   */
  validateProjectStandards(task, project) {
    const violations = [];

    // Project-specific label requirements
    const projectStandards = this.getProjectStandards(project);

    // Check required labels for project
    if (projectStandards.requiredLabels) {
      for (const requiredLabel of projectStandards.requiredLabels) {
        if (!task.labels?.includes(requiredLabel)) {
          violations.push({
            field: 'labels',
            severity: 'warning',
            rule: 'project-required-label',
            message: `Project ${project} requires "${requiredLabel}" label for testing tasks`,
          });
        }
      }
    }

    // Check estimation ranges for project
    if (projectStandards.estimationLimits && task.estimate) {
      if (task.estimate > projectStandards.estimationLimits.max) {
        violations.push({
          field: 'estimate',
          severity: 'error',
          rule: 'project-estimation-limit',
          message: `Project ${project} limits task estimates to ${projectStandards.estimationLimits.max} points`,
        });
      }
    }

    return violations;
  }

  /**
   * Get project-specific standards
   */
  getProjectStandards(project) {
    const standards = {
      default: {
        requiredLabels: [],
        estimationLimits: { max: 13 },
      },
      'linear-tdd-workflow': {
        requiredLabels: ['testing'],
        estimationLimits: { max: 8 }, // Smaller tasks preferred
        requiresAcceptanceCriteria: true,
      },
      enterprise: {
        requiredLabels: ['testing', 'compliance'],
        estimationLimits: { max: 13 },
        requiresSecurityReview: true,
      },
    };

    return standards[project] || standards.default;
  }

  /**
   * Generate recommendations based on violations
   */
  generateRecommendations(task, violations, taskType) {
    const recommendations = [];

    // Group violations by type
    const errorViolations = violations.filter((v) => v.severity === 'error');
    const warningViolations = violations.filter((v) => v.severity === 'warning');
    const infoViolations = violations.filter((v) => v.severity === 'info');

    // High priority recommendations for errors
    if (errorViolations.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Required Fixes',
        message: `Fix ${errorViolations.length} critical validation errors before task creation`,
        actions: errorViolations.map((v) => v.message),
      });
    }

    // Medium priority for warnings
    if (warningViolations.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Quality Improvements',
        message: `Address ${warningViolations.length} quality issues for better task clarity`,
        actions: warningViolations.map((v) => v.message),
      });
    }

    // Task type specific recommendations
    const typeRecommendations = this.getTypeSpecificRecommendations(task, taskType);
    if (typeRecommendations.length > 0) {
      recommendations.push({
        priority: 'LOW',
        category: `${taskType} Best Practices`,
        message: `Consider these ${taskType}-specific improvements`,
        actions: typeRecommendations,
      });
    }

    // Info suggestions
    if (infoViolations.length > 0) {
      recommendations.push({
        priority: 'INFO',
        category: 'Suggestions',
        message: `Optional improvements for enhanced task quality`,
        actions: infoViolations.map((v) => v.message),
      });
    }

    return recommendations;
  }

  /**
   * Get type-specific recommendations
   */
  getTypeSpecificRecommendations(task, taskType) {
    const recommendations = [];

    switch (taskType) {
      case 'coverage':
        recommendations.push('Include current coverage percentage and target');
        recommendations.push('Specify which test types will be added (unit, integration, e2e)');
        recommendations.push('Reference specific files or modules to be tested');
        break;

      case 'tdd':
        recommendations.push('Include steps for RED-GREEN-REFACTOR cycle');
        recommendations.push('Reference specific TDD patterns or practices');
        recommendations.push('Mention how to verify TDD compliance');
        break;

      case 'specification':
        recommendations.push('Link to original specification or requirement document');
        recommendations.push('Include user story format for user-facing features');
        recommendations.push('Specify which test scenarios need to be covered');
        break;

      case 'security':
        recommendations.push('Include security test checklist');
        recommendations.push('Reference OWASP guidelines if applicable');
        recommendations.push('Specify threat models to be tested');
        break;

      case 'performance':
        recommendations.push('Define performance benchmarks and SLAs');
        recommendations.push('Specify load testing scenarios');
        recommendations.push('Include monitoring and alerting requirements');
        break;
    }

    return recommendations;
  }

  /**
   * Generate a compliance report for multiple tasks
   */
  generateComplianceReport(tasks, options = {}) {
    const report = {
      summary: {
        total: tasks.length,
        compliant: 0,
        violations: 0,
        warnings: 0,
        errors: 0,
      },
      byType: {},
      violations: [],
      recommendations: [],
    };

    for (const task of tasks) {
      const validation = this.validateTestingTask(task, options);
      const taskType = validation.taskType;

      // Update summary
      if (validation.isValid) {
        report.summary.compliant++;
      } else {
        report.summary.violations++;
      }

      // Count violation severities
      const errors = validation.violations.filter((v) => v.severity === 'error').length;
      const warnings = validation.violations.filter((v) => v.severity === 'warning').length;

      report.summary.errors += errors;
      report.summary.warnings += warnings;

      // Group by type
      if (!report.byType[taskType]) {
        report.byType[taskType] = {
          total: 0,
          compliant: 0,
          violations: 0,
        };
      }

      report.byType[taskType].total++;
      if (validation.isValid) {
        report.byType[taskType].compliant++;
      } else {
        report.byType[taskType].violations++;
      }

      // Store detailed violations
      if (!validation.isValid) {
        report.violations.push({
          task: task.title,
          taskType,
          violations: validation.violations,
          recommendations: validation.recommendations,
        });
      }
    }

    // Calculate compliance rate
    report.summary.complianceRate = Math.round(
      (report.summary.compliant / report.summary.total) * 100,
    );

    return report;
  }
}

module.exports = TestingTaskValidator;
