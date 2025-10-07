/**
 * Agent Linear Integration Module
 *
 * Integrates all agents with Linear via MCP server for real task management
 */

const LinearMCPIntegration = require('./linear-mcp-integration.js');

class AgentLinearIntegration {
  constructor() {
    this.linearMCP = new LinearMCPIntegration();
  }

  /**
   * AUDITOR → Linear Integration
   * Creates Linear tasks from AUDITOR findings
   */
  async processAuditorFindings(auditResult) {
    console.log('🔍 AUDITOR → Linear: Processing code quality findings...');

    if (!auditResult.success || !auditResult.patterns) {
      console.log('⚠️ No findings to process');
      return { success: true, tasksCreated: 0 };
    }

    // Filter findings that warrant Linear tasks
    const taskableFindings = auditResult.patterns.filter(
      (finding) => finding.type !== 'comment' || finding.severity === 'high',
    );

    if (taskableFindings.length === 0) {
      console.log('✅ No findings require Linear tasks');
      return { success: true, tasksCreated: 0 };
    }

    // Create Linear tasks via MCP
    const taskResults = await this.linearMCP.createTasksFromFindings(taskableFindings);

    console.log(
      `📋 AUDITOR → Linear: ${taskResults.created.length} tasks created, ${taskResults.failed.length} failed`,
    );

    return {
      success: true,
      tasksCreated: taskResults.created.length,
      tasksFailed: taskResults.failed.length,
      createdTasks: taskResults.created,
      method: 'MCP Linear',
    };
  }

  /**
   * EXECUTOR → Linear Integration
   * Updates Linear tasks as EXECUTOR works on them
   */
  async processExecutorWork(executorResult) {
    console.log('🔧 EXECUTOR → Linear: Syncing completed work...');

    if (!executorResult.success) {
      console.log('⚠️ EXECUTOR work was not successful, skipping Linear sync');
      return { success: false, reason: 'executor_failed' };
    }

    // Get EXECUTOR's assigned tasks
    const issuesResult = await this.linearMCP.getAgentIssues('EXECUTOR');

    if (!issuesResult.success) {
      console.error('❌ Failed to get EXECUTOR issues from Linear');
      return { success: false, error: issuesResult.error };
    }

    let updatedTasks = 0;

    // Update task statuses based on EXECUTOR work
    for (const issue of issuesResult.issues) {
      try {
        // Mark tasks as in progress if EXECUTOR is working on them
        if (executorResult.tasksInProgress?.includes(issue.identifier)) {
          await this.linearMCP.updateIssueStatus(
            issue.id,
            'In Progress',
            `🔧 EXECUTOR is implementing this fix using TDD cycle.\n\nCurrent phase: ${executorResult.currentPhase || 'Implementation'}`,
          );
          updatedTasks++;
        }

        // Mark tasks as completed if EXECUTOR finished them
        if (executorResult.completedTasks?.includes(issue.identifier)) {
          await this.linearMCP.updateIssueStatus(
            issue.id,
            'Done',
            `✅ EXECUTOR completed this task successfully.\n\n**TDD Cycle:** ${executorResult.tddCycle ? 'RED → GREEN → REFACTOR' : 'Standard'}\n**Files Modified:** ${executorResult.filesModified?.length || 0}\n**Tests Added:** ${executorResult.testsAdded?.length || 0}`,
          );
          updatedTasks++;
        }
      } catch (error) {
        console.error(`❌ Failed to update task ${issue.identifier}:`, error.message);
      }
    }

    console.log(`✅ EXECUTOR → Linear: Updated ${updatedTasks} tasks`);

    return {
      success: true,
      tasksUpdated: updatedTasks,
      totalTasks: issuesResult.issues.length,
      method: 'MCP Linear',
    };
  }

  /**
   * GUARDIAN → Linear Integration
   * Creates incident reports and alerts in Linear
   */
  async processGuardianAlerts(guardianResult) {
    console.log('🛡️ GUARDIAN → Linear: Processing alerts and incidents...');

    if (!guardianResult.analyzed || guardianResult.success !== false) {
      console.log('✅ No incidents to report');
      return { success: true, incidentsCreated: 0 };
    }

    // Create incident report in Linear
    const incidentData = {
      title: `🚨 GUARDIAN Alert: ${guardianResult.type || 'System Issue'}`,
      description: this.generateIncidentDescription(guardianResult),
      priority: this.mapSeverityToPriority(guardianResult.severity || 'medium'),
      labels: ['incident', 'guardian', guardianResult.type].filter(Boolean),
      assignee: 'STRATEGIST', // STRATEGIST handles incidents
    };

    const incidentResult = await this.linearMCP.createIssue(incidentData);

    if (incidentResult.success) {
      console.log(`🚨 GUARDIAN → Linear: Created incident ${incidentResult.identifier}`);
      return {
        success: true,
        incidentsCreated: 1,
        incidentId: incidentResult.id,
        method: 'MCP Linear',
      };
    } else {
      console.error('❌ Failed to create incident in Linear:', incidentResult.error);
      return {
        success: false,
        error: incidentResult.error,
      };
    }
  }

  /**
   * SCHOLAR → Linear Integration
   * Updates tasks with learned insights and patterns
   */
  async processScholarInsights(scholarResult) {
    console.log('🎓 SCHOLAR → Linear: Sharing insights and patterns...');

    if (!scholarResult.patternsLearned || scholarResult.insights?.length === 0) {
      console.log('✅ No new insights to share');
      return { success: true, insightsShared: 0 };
    }

    // Create improvement suggestions based on learned patterns
    const improvementTasks = scholarResult.insights.map((insight) => ({
      title: `💡 SCHOLAR Insight: ${insight.pattern}`,
      description: this.generateInsightDescription(insight),
      priority: this.mapConfidenceToPriority(insight.confidence),
      labels: ['insight', 'scholar', 'improvement'],
      assignee: 'STRATEGIST', // STRATEGIST evaluates insights
    }));

    const results = await this.linearMCP.createTasksFromFindings(improvementTasks);

    console.log(`🎓 SCHOLAR → Linear: Shared ${results.created.length} insights`);

    return {
      success: true,
      insightsShared: results.created.length,
      method: 'MCP Linear',
    };
  }

  /**
   * Get agent workload from Linear
   */
  async getAgentWorkload(agentName) {
    const issuesResult = await this.linearMCP.getAgentIssues(agentName);

    if (!issuesResult.success) {
      return { success: false, error: issuesResult.error };
    }

    const issues = issuesResult.issues;
    const workload = {
      total: issues.length,
      todo: issues.filter((i) => i.status === 'Todo').length,
      inProgress: issues.filter((i) => i.status === 'In Progress').length,
      blocked: issues.filter((i) => i.status === 'Blocked').length,
      high_priority: issues.filter((i) => i.priority <= 2).length,
    };

    return {
      success: true,
      agent: agentName,
      workload,
      issues,
      method: 'MCP Linear',
    };
  }

  /**
   * Generate incident description for GUARDIAN alerts
   */
  generateIncidentDescription(guardianResult) {
    let description = `## Incident Report\n\n`;
    description += `**Type:** ${guardianResult.type || 'Unknown'}\n`;
    description += `**Severity:** ${guardianResult.severity || 'Medium'}\n`;
    description += `**Detected:** ${new Date().toISOString()}\n\n`;

    description += `## Details\n\n`;
    if (guardianResult.error) {
      description += `**Error:** ${guardianResult.error}\n`;
    }
    if (guardianResult.component) {
      description += `**Component:** ${guardianResult.component}\n`;
    }
    if (guardianResult.memoryUsage) {
      description += `**Memory Usage:** ${guardianResult.memoryUsage}MB\n`;
    }

    description += `\n## Analysis\n\n`;
    description += `${guardianResult.analysis || 'GUARDIAN detected an issue requiring attention.'}\n\n`;

    description += `## Recommended Actions\n\n`;
    if (guardianResult.recoveryPlan) {
      guardianResult.recoveryPlan.forEach((action, index) => {
        description += `${index + 1}. ${action}\n`;
      });
    } else {
      description += `1. Investigate the issue\n`;
      description += `2. Implement fix\n`;
      description += `3. Test resolution\n`;
      description += `4. Monitor for recurrence\n`;
    }

    description += `\n---\n`;
    description += `🛡️ **Automatically generated by GUARDIAN via MCP Linear**\n`;

    return description;
  }

  /**
   * Generate insight description for SCHOLAR patterns
   */
  generateInsightDescription(insight) {
    let description = `## Pattern Insight\n\n`;
    description += `**Pattern:** ${insight.pattern}\n`;
    description += `**Confidence:** ${(insight.confidence * 100).toFixed(1)}%\n`;
    description += `**Discovered:** ${new Date().toISOString()}\n\n`;

    description += `## Description\n\n`;
    description += `${insight.description || 'SCHOLAR has identified a pattern that could improve system performance or quality.'}\n\n`;

    description += `## Recommended Implementation\n\n`;
    if (insight.recommendations) {
      insight.recommendations.forEach((rec, index) => {
        description += `${index + 1}. ${rec}\n`;
      });
    } else {
      description += `1. Evaluate the pattern applicability\n`;
      description += `2. Design implementation approach\n`;
      description += `3. Implement with TDD cycle\n`;
      description += `4. Measure improvement impact\n`;
    }

    description += `\n## Success Metrics\n\n`;
    description += `- [ ] Pattern successfully implemented\n`;
    description += `- [ ] Performance/quality improvement measured\n`;
    description += `- [ ] No regressions introduced\n`;
    description += `- [ ] Documentation updated\n\n`;

    description += `---\n`;
    description += `🎓 **Automatically generated by SCHOLAR via MCP Linear**\n`;

    return description;
  }

  /**
   * Helper: Map severity to priority
   */
  mapSeverityToPriority(severity) {
    const severityMap = {
      critical: 'urgent',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };
    return severityMap[severity] || 'medium';
  }

  /**
   * Helper: Map confidence to priority
   */
  mapConfidenceToPriority(confidence) {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  }

  /**
   * Complete workflow integration test
   */
  async testWorkflowIntegration() {
    console.log('🧪 Testing complete agent → Linear MCP integration...');

    const testResults = {
      auditor: false,
      executor: false,
      guardian: false,
      scholar: false,
    };

    try {
      // Test AUDITOR integration
      const mockAuditResult = {
        success: true,
        patterns: [
          {
            type: 'test',
            category: 'integration',
            message: 'Test finding for MCP integration',
            severity: 'low',
            path: 'test.js',
            line: 1,
          },
        ],
      };

      const auditorResult = await this.processAuditorFindings(mockAuditResult);
      testResults.auditor = auditorResult.success;

      // Test EXECUTOR integration
      const mockExecutorResult = {
        success: true,
        completedTasks: ['CLEAN-TEST-001'],
        tddCycle: true,
        filesModified: ['test.js'],
        testsAdded: ['test.test.js'],
      };

      const executorResult = await this.processExecutorWork(mockExecutorResult);
      testResults.executor = executorResult.success;

      // Test GUARDIAN integration
      const mockGuardianResult = {
        analyzed: true,
        success: false,
        type: 'test_failure',
        severity: 'medium',
        error: 'Test failure for integration testing',
      };

      const guardianResult = await this.processGuardianAlerts(mockGuardianResult);
      testResults.guardian = guardianResult.success;

      // Test SCHOLAR integration
      const mockScholarResult = {
        patternsLearned: 1,
        insights: [
          {
            pattern: 'test-pattern',
            confidence: 0.95,
            description: 'Test pattern for MCP integration',
          },
        ],
      };

      const scholarResult = await this.processScholarInsights(mockScholarResult);
      testResults.scholar = scholarResult.success;

      const allPassed = Object.values(testResults).every((result) => result === true);

      console.log('🧪 Agent → Linear MCP Integration Test Results:');
      console.log(`   AUDITOR: ${testResults.auditor ? '✅' : '❌'}`);
      console.log(`   EXECUTOR: ${testResults.executor ? '✅' : '❌'}`);
      console.log(`   GUARDIAN: ${testResults.guardian ? '✅' : '❌'}`);
      console.log(`   SCHOLAR: ${testResults.scholar ? '✅' : '❌'}`);
      console.log(`   Overall: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);

      return {
        success: allPassed,
        results: testResults,
        method: 'MCP Linear Integration',
      };
    } catch (error) {
      console.error('❌ Integration test failed:', error.message);
      return {
        success: false,
        error: error.message,
        results: testResults,
      };
    }
  }
}

module.exports = AgentLinearIntegration;
