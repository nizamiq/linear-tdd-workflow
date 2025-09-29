#!/usr/bin/env node

/**
 * Linear Task Templates
 *
 * Standardized templates for creating Linear tasks that follow
 * project conventions and ensure data quality.
 */

class TaskTemplates {
  constructor() {
    this.actionVerbs = {
      coverage: "Implement",
      bug: "Fix",
      feature: "Add",
      improvement: "Improve",
      spike: "Investigate",
      refactor: "Refactor",
      documentation: "Document",
      test: "Test",
      security: "Secure"
    };

    this.priorityLabels = {
      HIGH: "p1-high",
      MEDIUM: "p2-medium",
      LOW: "p3-low",
      URGENT: "p0-urgent"
    };

    this.areaLabels = {
      frontend: "area-frontend",
      backend: "area-backend",
      api: "area-api",
      database: "area-database",
      infrastructure: "area-infrastructure",
      testing: "area-testing",
      security: "area-security",
      documentation: "area-docs"
    };
  }

  /**
   * Generate standardized task for coverage gap
   */
  generateCoverageTask(gap, options = {}) {
    const {
      threshold = 80,
      module = "unknown",
      component = "unknown"
    } = options;

    const title = this.formatTitle("coverage", gap.specification, gap.description);
    const description = this.formatCoverageDescription(gap, threshold, module, component);
    const labels = this.generateCoverageLabels(gap);
    const estimate = this.estimateCoverageTask(gap);
    const priority = this.mapPriorityToLinear(gap.priority);

    return {
      title,
      description,
      labels,
      estimate,
      priority,
      metadata: {
        type: "coverage-gap",
        specification: gap.specification,
        originalGap: gap
      }
    };
  }

  /**
   * Generate standardized task for TDD violation
   */
  generateTDDTask(violation, options = {}) {
    const title = this.formatTitle("test", "TDD compliance", `Fix TDD violation in ${violation.commit?.substring(0, 8)}`);
    const description = this.formatTDDDescription(violation);
    const labels = ["tdd", "process", "technical-debt", this.priorityLabels.MEDIUM];
    const estimate = this.estimateTDDTask(violation);

    return {
      title,
      description,
      labels,
      estimate,
      priority: 2, // Medium priority
      metadata: {
        type: "tdd-violation",
        commit: violation.commit,
        originalViolation: violation
      }
    };
  }

  /**
   * Generate standardized task for orphaned test
   */
  generateOrphanedTestTask(orphan, options = {}) {
    const title = this.formatTitle("improvement", "test cleanup", `Review orphaned test: ${orphan.file}`);
    const description = this.formatOrphanedTestDescription(orphan);
    const labels = ["testing", "maintenance", "technical-debt", this.priorityLabels.LOW];
    const estimate = 1; // Usually small task

    return {
      title,
      description,
      labels,
      estimate,
      priority: 3, // Low priority
      metadata: {
        type: "orphaned-test",
        file: orphan.file,
        originalOrphan: orphan
      }
    };
  }

  /**
   * Generate standardized task for unmapped specification
   */
  generateUnmappedSpecTask(spec, options = {}) {
    const title = this.formatTitle("test", "specification coverage", `Create tests for ${spec.id}`);
    const description = this.formatUnmappedSpecDescription(spec);
    const labels = this.generateSpecLabels(spec);
    const estimate = this.estimateSpecTask(spec);
    const priority = this.mapPriorityToLinear(spec.priority);

    return {
      title,
      description,
      labels,
      estimate,
      priority,
      metadata: {
        type: "unmapped-spec",
        specification: spec.id,
        originalSpec: spec
      }
    };
  }

  /**
   * Format title according to standards
   */
  formatTitle(type, category, description) {
    const verb = this.actionVerbs[type] || "Handle";
    let title = `${verb} ${description}`;

    // Ensure first letter is capitalized
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // Truncate if too long (max 60 characters)
    if (title.length > 60) {
      title = title.substring(0, 57) + "...";
    }

    return title;
  }

  /**
   * Format coverage task description
   */
  formatCoverageDescription(gap, threshold, module, component) {
    return `## User Story
As a developer
I want comprehensive test coverage for ${gap.specification}
So that I can ensure code quality and prevent regressions

## Description
${gap.description}

**Current Status**: ${gap.testStatus}
**Target Coverage**: ${threshold}%
${gap.currentCoverage ? `**Current Coverage**: ${gap.currentCoverage}%` : ''}

## Acceptance Criteria
- [ ] Test coverage ≥${threshold}% for the specified functionality
- [ ] All edge cases and error scenarios covered
- [ ] Tests follow TDD patterns (RED-GREEN-REFACTOR)
- [ ] Test descriptions clearly explain the behavior being tested
- [ ] Tests are properly organized and maintainable
- [ ] Documentation updated if needed

## Technical Details
**Component**: ${component}
**Module**: ${module}
**Priority**: ${gap.priority}
**Impact Score**: ${gap.impact || 'Unknown'}

## Implementation Notes
${gap.recommendation}

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Code review completed
- [ ] Tests pass in CI/CD pipeline
- [ ] Coverage metrics updated
- [ ] No regressions introduced`;
  }

  /**
   * Format TDD violation task description
   */
  formatTDDDescription(violation) {
    return `## Issue Description
TDD compliance violation detected in commit ${violation.commit?.substring(0, 8)}

**Violation Type**: ${violation.reason}
**Author**: ${violation.author}
**Date**: ${violation.date}
**Files Affected**: ${violation.files?.join(', ') || 'Unknown'}

## Root Cause
${violation.reason}

## Acceptance Criteria
- [ ] Review the commit and understand the violation
- [ ] Ensure tests exist for the implemented functionality
- [ ] Verify tests follow TDD patterns
- [ ] Add missing tests if needed
- [ ] Document TDD best practices for team reference

## TDD Best Practices Reminder
1. **RED**: Write a failing test first
2. **GREEN**: Write minimal code to make the test pass
3. **REFACTOR**: Improve code while keeping tests green

## Implementation Steps
1. Analyze the violating commit
2. Identify missing or inadequate tests
3. Implement proper test coverage
4. Ensure TDD cycle compliance
5. Update team documentation if needed

## Definition of Done
- [ ] All affected functionality has proper test coverage
- [ ] Tests follow TDD patterns
- [ ] Code review completed
- [ ] Team informed of resolution`;
  }

  /**
   * Format orphaned test task description
   */
  formatOrphanedTestDescription(orphan) {
    return `## Issue Description
Test file appears to be orphaned and doesn't map to any documented specifications.

**File**: ${orphan.file}
**Test Count**: ${orphan.tests || 'Unknown'}
**Reason**: ${orphan.reason}

## Analysis Required
1. Review the test file purpose and scope
2. Determine if tests are still relevant
3. Map tests to specifications or requirements
4. Decide whether to update specs or refactor/remove tests

## Possible Actions
- [ ] Update project specifications to include test scenarios
- [ ] Refactor tests to align with documented requirements
- [ ] Consolidate with other test files if applicable
- [ ] Remove if tests are obsolete or redundant

## Acceptance Criteria
- [ ] Test purpose clearly understood
- [ ] Tests mapped to specifications or removed
- [ ] Documentation updated if needed
- [ ] No test coverage gaps introduced

## Recommendation
${orphan.recommendation}

## Definition of Done
- [ ] Test file either properly mapped or removed
- [ ] Specifications updated if needed
- [ ] Test coverage maintained or improved
- [ ] Team consensus on resolution`;
  }

  /**
   * Format unmapped specification task description
   */
  formatUnmappedSpecDescription(spec) {
    return `## User Story
As a developer
I want tests for specification ${spec.id}
So that I can ensure the requirement is properly implemented and validated

## Specification Details
**ID**: ${spec.id}
**Description**: ${spec.description}
**Priority**: ${spec.priority}
**Type**: ${spec.type || 'Unknown'}
${spec.keywords ? `**Keywords**: ${spec.keywords.join(', ')}` : ''}

## Acceptance Criteria
- [ ] Comprehensive test coverage for all aspects of the specification
- [ ] Tests cover happy path scenarios
- [ ] Tests cover edge cases and error conditions
- [ ] Tests follow project testing patterns
- [ ] Tests are properly documented and maintainable

## Test Requirements
Based on the specification type and content, consider:
- Unit tests for core functionality
- Integration tests for component interactions
- End-to-end tests for user-facing features
- Performance tests if applicable
- Security tests for sensitive functionality

## Implementation Approach
1. Analyze the specification requirements
2. Design test scenarios covering all aspects
3. Implement tests following TDD methodology
4. Ensure tests are comprehensive and maintainable
5. Update documentation as needed

## Definition of Done
- [ ] All specification requirements have test coverage
- [ ] Tests pass consistently
- [ ] Code review completed
- [ ] Specification marked as covered
- [ ] Coverage metrics updated`;
  }

  /**
   * Generate labels for coverage tasks
   */
  generateCoverageLabels(gap) {
    const labels = ["testing", "coverage"];

    // Add priority label
    labels.push(this.priorityLabels[gap.priority] || this.priorityLabels.MEDIUM);

    // Add type-specific labels
    if (gap.type === "missing") {
      labels.push("technical-debt");
    } else if (gap.type === "partial") {
      labels.push("improvement");
    } else if (gap.type === "quality-gate") {
      labels.push("critical");
    }

    // Add area labels based on keywords
    if (gap.specification) {
      const spec = gap.specification.toLowerCase();
      if (spec.includes("api") || spec.includes("endpoint")) {
        labels.push(this.areaLabels.api);
      } else if (spec.includes("database") || spec.includes("data")) {
        labels.push(this.areaLabels.database);
      } else if (spec.includes("frontend") || spec.includes("ui")) {
        labels.push(this.areaLabels.frontend);
      } else if (spec.includes("backend") || spec.includes("server")) {
        labels.push(this.areaLabels.backend);
      } else if (spec.includes("security") || spec.includes("auth")) {
        labels.push(this.areaLabels.security);
      }
    }

    return [...new Set(labels)]; // Remove duplicates
  }

  /**
   * Generate labels for specification tasks
   */
  generateSpecLabels(spec) {
    const labels = ["testing", "specification"];

    // Add priority label
    labels.push(this.priorityLabels[spec.priority] || this.priorityLabels.MEDIUM);

    // Add type-specific labels
    if (spec.type) {
      switch (spec.type) {
        case "security":
        case "authentication":
          labels.push(this.areaLabels.security);
          break;
        case "functional":
          labels.push("feature");
          break;
        case "performance":
          labels.push("performance");
          break;
        case "quality":
          labels.push("quality-assurance");
          break;
      }
    }

    // Add keyword-based labels
    if (spec.keywords) {
      for (const keyword of spec.keywords) {
        const keywordLower = keyword.toLowerCase();
        if (keywordLower.includes("api")) {
          labels.push(this.areaLabels.api);
        } else if (keywordLower.includes("database")) {
          labels.push(this.areaLabels.database);
        } else if (keywordLower.includes("frontend")) {
          labels.push(this.areaLabels.frontend);
        } else if (keywordLower.includes("backend")) {
          labels.push(this.areaLabels.backend);
        }
      }
    }

    return [...new Set(labels)]; // Remove duplicates
  }

  /**
   * Estimate coverage task effort
   */
  estimateCoverageTask(gap) {
    let baseEstimate = 3; // Default medium effort

    // Adjust based on gap type
    switch (gap.type) {
      case "missing":
        baseEstimate = 5; // New tests require more effort
        break;
      case "partial":
        const coverageIncrease = gap.targetCoverage - (gap.currentCoverage || 0);
        if (coverageIncrease > 50) {
          baseEstimate = 8;
        } else if (coverageIncrease > 20) {
          baseEstimate = 3;
        } else {
          baseEstimate = 2;
        }
        break;
      case "quality-gate":
        baseEstimate = 5; // Critical path requires thorough testing
        break;
    }

    // Adjust based on impact score
    if (gap.impact && gap.impact >= 8) {
      baseEstimate = Math.min(13, baseEstimate * 1.5);
    }

    // Round to Fibonacci numbers
    const fibonacci = [1, 2, 3, 5, 8, 13];
    return fibonacci.find(f => f >= baseEstimate) || 13;
  }

  /**
   * Estimate TDD violation task effort
   */
  estimateTDDTask(violation) {
    let estimate = 2; // Default small effort

    // Adjust based on number of affected files
    if (violation.files && violation.files.length > 3) {
      estimate = 3;
    }

    // Adjust based on violation reason
    if (violation.reason?.includes("no tests")) {
      estimate = 5; // Creating tests from scratch
    }

    return estimate;
  }

  /**
   * Estimate specification task effort
   */
  estimateSpecTask(spec) {
    let baseEstimate = 3;

    // Adjust based on priority (high priority often more complex)
    if (spec.priority === "HIGH") {
      baseEstimate = 5;
    } else if (spec.priority === "LOW") {
      baseEstimate = 2;
    }

    // Adjust based on type
    switch (spec.type) {
      case "security":
      case "authentication":
        baseEstimate = 8; // Security tests are comprehensive
        break;
      case "performance":
        baseEstimate = 5; // Performance tests need setup
        break;
      case "functional":
        baseEstimate = 3; // Standard functional tests
        break;
    }

    // Round to Fibonacci
    const fibonacci = [1, 2, 3, 5, 8, 13];
    return fibonacci.find(f => f >= baseEstimate) || 13;
  }

  /**
   * Map priority to Linear priority number
   */
  mapPriorityToLinear(priority) {
    const mapping = {
      "HIGH": 2,
      "MEDIUM": 3,
      "LOW": 4,
      "URGENT": 1
    };
    return mapping[priority] || 3;
  }

  /**
   * Validate task against standards
   */
  validateTask(task) {
    const violations = [];

    // Title validation
    if (!task.title || task.title.length === 0) {
      violations.push({ field: "title", issue: "missing" });
    } else if (task.title.length > 60) {
      violations.push({ field: "title", issue: "too_long" });
    } else if (!task.title[0].match(/[A-Z]/)) {
      violations.push({ field: "title", issue: "not_capitalized" });
    }

    // Description validation
    if (!task.description || task.description.length < 50) {
      violations.push({ field: "description", issue: "too_short" });
    }

    // Labels validation
    if (!task.labels || task.labels.length === 0) {
      violations.push({ field: "labels", issue: "missing" });
    } else {
      const hasTypeLabel = task.labels.some(label =>
        ["testing", "bug", "feature", "improvement", "spike"].includes(label)
      );
      if (!hasTypeLabel) {
        violations.push({ field: "labels", issue: "missing_type_label" });
      }

      const hasPriorityLabel = task.labels.some(label =>
        label.startsWith("p0-") || label.startsWith("p1-") ||
        label.startsWith("p2-") || label.startsWith("p3-")
      );
      if (!hasPriorityLabel) {
        violations.push({ field: "labels", issue: "missing_priority_label" });
      }
    }

    // Estimate validation
    if (!task.estimate) {
      violations.push({ field: "estimate", issue: "missing" });
    } else if (task.estimate > 13) {
      violations.push({ field: "estimate", issue: "too_large" });
    }

    // Priority validation
    if (!task.priority || ![1, 2, 3, 4].includes(task.priority)) {
      violations.push({ field: "priority", issue: "invalid" });
    }

    return violations;
  }

  /**
   * Generate standardized task from any gap type
   */
  generateStandardizedTask(item, type, options = {}) {
    switch (type) {
      case "coverage-gap":
        return this.generateCoverageTask(item, options);
      case "tdd-violation":
        return this.generateTDDTask(item, options);
      case "orphaned-test":
        return this.generateOrphanedTestTask(item, options);
      case "unmapped-spec":
        return this.generateUnmappedSpecTask(item, options);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }
}

module.exports = TaskTemplates;