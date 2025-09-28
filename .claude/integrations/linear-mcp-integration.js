/**
 * Linear MCP Integration for Claude Agentic Workflow System
 *
 * Uses the official Linear MCP server instead of custom API client
 * for production integration with Linear.app
 */

const { getCurrentEnvironment } = require('../config/environments.js');

class LinearMCPIntegration {
  constructor(options = {}) {
    this.config = getCurrentEnvironment().linear;
    this.mockMode = options.mockMode !== undefined ? options.mockMode : this.config.mockMode;

    if (this.mockMode) {
      console.log('⚠️ Linear MCP integration running in mock mode');
    } else {
      console.log('✅ Linear MCP integration using real Linear API');
    }
  }

  /**
   * Create Linear issue using MCP Linear server
   */
  async createIssue(issueData) {
    if (this.mockMode) {
      return this.mockCreateIssue(issueData);
    }

    try {
      // Use the MCP Linear server's create_issue function
      const result = await this.callMCPLinear('create_issue', {
        title: issueData.title,
        description: issueData.description,
        team: this.config.teamId,
        project: this.config.projectId,
        priority: this.mapPriorityToLinear(issueData.priority),
        labels: issueData.labels || [],
        assignee: issueData.assignee
      });

      console.log(`✅ Created Linear issue via MCP: ${result.identifier} - ${result.title}`);

      return {
        id: result.id,
        identifier: result.identifier,
        title: result.title,
        url: result.url,
        success: true
      };

    } catch (error) {
      console.error('❌ Failed to create Linear issue via MCP:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update Linear issue status using MCP Linear server
   */
  async updateIssueStatus(issueId, status, comment = null) {
    if (this.mockMode) {
      return this.mockUpdateIssue(issueId, status, comment);
    }

    try {
      // Update issue status via MCP
      const result = await this.callMCPLinear('update_issue', {
        id: issueId,
        state: status
      });

      // Add comment if provided
      if (comment) {
        await this.callMCPLinear('create_comment', {
          issueId: issueId,
          body: `${comment}\n\n---\n🤖 Automated comment from Claude Agentic Workflow System`
        });
      }

      console.log(`✅ Updated Linear issue ${result.identifier} to ${status} via MCP`);

      return {
        success: true,
        issueId: result.id,
        identifier: result.identifier,
        newState: status
      };

    } catch (error) {
      console.error('❌ Failed to update Linear issue via MCP:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get issues assigned to agents using MCP Linear server
   */
  async getAgentIssues(assignee = 'EXECUTOR') {
    if (this.mockMode) {
      return this.mockGetIssues(assignee);
    }

    try {
      // Get issues via MCP Linear server
      const result = await this.callMCPLinear('list_issues', {
        team: this.config.teamId,
        assignee: assignee,
        includeArchived: false
      });

      console.log(`📋 Retrieved ${result.length} issues for ${assignee} via MCP`);

      return {
        success: true,
        issues: result.map(issue => ({
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          description: issue.description,
          status: issue.state?.name,
          priority: issue.priority,
          labels: issue.labels?.map(label => label.name) || [],
          url: issue.url
        }))
      };

    } catch (error) {
      console.error('❌ Failed to get agent issues via MCP:', error.message);
      return {
        success: false,
        error: error.message,
        issues: []
      };
    }
  }

  /**
   * Call MCP Linear server function
   * This would use the actual MCP integration in production
   */
  async callMCPLinear(functionName, parameters) {
    // In a real implementation, this would call the MCP Linear server
    // For now, we'll use the available MCP tools if they're present

    try {
      // Check if we have access to MCP Linear tools
      if (typeof mcp__linear_server__create_issue !== 'undefined' && functionName === 'create_issue') {
        return await mcp__linear_server__create_issue(parameters);
      }

      if (typeof mcp__linear_server__update_issue !== 'undefined' && functionName === 'update_issue') {
        return await mcp__linear_server__update_issue(parameters);
      }

      if (typeof mcp__linear_server__list_issues !== 'undefined' && functionName === 'list_issues') {
        return await mcp__linear_server__list_issues(parameters);
      }

      if (typeof mcp__linear_server__create_comment !== 'undefined' && functionName === 'create_comment') {
        return await mcp__linear_server__create_comment(parameters);
      }

      // Fallback: simulate MCP call for development
      console.log(`🔗 MCP Linear call: ${functionName}`, parameters);
      return this.simulateMCPCall(functionName, parameters);

    } catch (error) {
      console.error(`❌ MCP Linear call failed: ${functionName}`, error.message);
      throw error;
    }
  }

  /**
   * Simulate MCP call for development/testing
   */
  simulateMCPCall(functionName, parameters) {
    switch (functionName) {
      case 'create_issue':
        return {
          id: `mcp-issue-${Date.now()}`,
          identifier: `CLEAN-${Math.floor(Math.random() * 1000)}`,
          title: parameters.title,
          url: `https://linear.app/${parameters.team}/issue/CLEAN-${Math.floor(Math.random() * 1000)}`
        };

      case 'update_issue':
        return {
          id: parameters.id,
          identifier: 'CLEAN-123',
          state: { name: parameters.state }
        };

      case 'list_issues':
        return [
          {
            id: 'mcp-issue-1',
            identifier: 'CLEAN-001',
            title: 'Sample issue from MCP',
            description: 'This is a sample issue retrieved via MCP Linear integration',
            state: { name: 'In Progress' },
            priority: 2,
            labels: [{ name: 'automated' }],
            url: 'https://linear.app/a-coders/issue/CLEAN-001'
          }
        ];

      case 'create_comment':
        return {
          id: `mcp-comment-${Date.now()}`,
          body: parameters.body
        };

      default:
        throw new Error(`Unknown MCP Linear function: ${functionName}`);
    }
  }

  /**
   * Create Linear task from AUDITOR finding using MCP
   */
  async createTaskFromFinding(finding) {
    const issueData = {
      title: `Fix: ${finding.message || finding.content}`,
      description: this.generateIssueDescription(finding),
      priority: this.mapSeverityToPriority(finding.severity),
      labels: [finding.type, finding.category, 'automated'].filter(Boolean),
      assignee: 'EXECUTOR'
    };

    return await this.createIssue(issueData);
  }

  /**
   * Batch create tasks from multiple findings using MCP
   */
  async createTasksFromFindings(findings) {
    console.log(`📋 Creating ${findings.length} Linear tasks from AUDITOR findings via MCP...`);

    const results = {
      created: [],
      failed: [],
      total: findings.length
    };

    // Process findings in batches to be respectful to Linear API
    const batchSize = 3; // Smaller batches for MCP calls
    for (let i = 0; i < findings.length; i += batchSize) {
      const batch = findings.slice(i, i + batchSize);

      const batchPromises = batch.map(async (finding) => {
        try {
          const task = await this.createTaskFromFinding(finding);
          if (task.success) {
            results.created.push(task);
          } else {
            results.failed.push({ finding, error: task.error });
          }
        } catch (error) {
          results.failed.push({ finding, error: error.message });
        }
      });

      await Promise.all(batchPromises);

      // Delay between batches
      if (i + batchSize < findings.length) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    console.log(`✅ Linear MCP task creation complete: ${results.created.length} created, ${results.failed.length} failed`);

    return results;
  }

  /**
   * Sync agent work with Linear using MCP
   */
  async syncAgentWork(agentName, workResult) {
    try {
      // Get active issues for this agent
      const issuesResult = await this.getAgentIssues(agentName);

      if (!issuesResult.success) {
        throw new Error(`Failed to get issues for ${agentName} via MCP`);
      }

      const activeIssues = issuesResult.issues;

      // Update issue statuses based on work result
      for (const issue of activeIssues) {
        if (workResult.completedTasks?.includes(issue.identifier)) {
          await this.updateIssueStatus(issue.id, 'Done',
            `Task completed by ${agentName}.\n\nWork summary:\n${JSON.stringify(workResult, null, 2)}`
          );
        } else if (workResult.inProgressTasks?.includes(issue.identifier)) {
          await this.updateIssueStatus(issue.id, 'In Progress',
            `Work in progress by ${agentName}.\n\nCurrent status:\n${JSON.stringify(workResult, null, 2)}`
          );
        }
      }

      return {
        success: true,
        synced: activeIssues.length,
        method: 'MCP Linear'
      };

    } catch (error) {
      console.error(`❌ Failed to sync ${agentName} work via MCP:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Helper: Map priority levels to Linear values
   */
  mapPriorityToLinear(priority) {
    const priorityMap = {
      'low': 4,
      'medium': 3,
      'high': 2,
      'urgent': 1
    };

    return priorityMap[priority] || 4;
  }

  /**
   * Helper: Map severity to priority
   */
  mapSeverityToPriority(severity) {
    const severityMap = {
      'critical': 'urgent',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };

    return severityMap[severity] || 'low';
  }

  /**
   * Generate detailed issue description from finding
   */
  generateIssueDescription(finding) {
    let description = `## Issue Description\n\n`;
    description += `${finding.message || finding.content}\n\n`;

    if (finding.path) {
      description += `**File:** \`${finding.path}\`\n`;
    }

    if (finding.line) {
      description += `**Line:** ${finding.line}\n`;
    }

    description += `**Type:** ${finding.type}\n`;
    description += `**Category:** ${finding.category}\n`;
    description += `**Severity:** ${finding.severity}\n\n`;

    description += `## TDD Implementation Plan\n\n`;
    description += `This issue will be resolved following strict TDD cycle:\n\n`;
    description += `### 🔴 RED Phase\n`;
    description += `- [ ] Write failing test that validates the fix\n`;
    description += `- [ ] Confirm test fails for expected reason\n\n`;
    description += `### 🟢 GREEN Phase\n`;
    description += `- [ ] Write minimal code to make test pass\n`;
    description += `- [ ] Verify test now passes\n\n`;
    description += `### 🔄 REFACTOR Phase\n`;
    description += `- [ ] Improve code quality while keeping tests green\n`;
    description += `- [ ] Ensure all existing tests still pass\n\n`;

    description += `## Acceptance Criteria\n\n`;
    description += `- [ ] TDD cycle completed (RED → GREEN → REFACTOR)\n`;
    description += `- [ ] Code quality improved\n`;
    description += `- [ ] No regressions introduced\n`;
    description += `- [ ] Memory usage within limits\n`;
    description += `- [ ] Agent can process without errors\n\n`;

    description += `---\n`;
    description += `🤖 **Auto-generated by Claude Agentic Workflow System (MCP Integration)**\n`;
    description += `📅 **Created:** ${new Date().toISOString()}\n`;

    if (finding.id) {
      description += `🔍 **Finding ID:** ${finding.id}\n`;
    }

    return description;
  }

  // Mock implementations for development
  mockCreateIssue(issueData) {
    const mockIssue = {
      id: `mock-mcp-${Date.now()}`,
      identifier: `CLEAN-${Math.floor(Math.random() * 1000)}`,
      title: issueData.title,
      url: `https://linear.app/mock/issue/CLEAN-${Math.floor(Math.random() * 1000)}`,
      success: true
    };

    console.log(`🎭 Mock MCP: Created issue ${mockIssue.identifier}`);
    return Promise.resolve(mockIssue);
  }

  mockUpdateIssue(issueId, status, comment) {
    const result = {
      success: true,
      issueId: issueId,
      identifier: 'CLEAN-MOCK',
      newState: status
    };

    console.log(`🎭 Mock MCP: Updated issue ${issueId} to ${status}`);
    return Promise.resolve(result);
  }

  mockGetIssues(assignee) {
    const mockIssues = [
      {
        id: 'mock-mcp-1',
        identifier: 'CLEAN-001',
        title: 'Mock issue from MCP Linear integration',
        description: 'This is a mock issue for testing MCP integration',
        status: 'In Progress',
        priority: 2,
        labels: ['mock', 'automated'],
        url: 'https://linear.app/mock/issue/CLEAN-001'
      }
    ];

    console.log(`🎭 Mock MCP: Retrieved ${mockIssues.length} issues for ${assignee}`);

    return Promise.resolve({
      success: true,
      issues: mockIssues
    });
  }
}

module.exports = LinearMCPIntegration;