#!/usr/bin/env node

/**
 * Test Linear MCP Integration
 *
 * Validates the Linear MCP integration works correctly with both
 * mock mode and real Linear API calls
 */

const LinearMCPIntegration = require('./linear-mcp-integration.js');
const AgentLinearIntegration = require('./agent-linear-integration.js');

class LinearMCPTester {
  constructor() {
    // Force real mode since Linear MCP is authenticated
    this.linearMCP = new LinearMCPIntegration({ mockMode: false });
    this.agentLinear = new AgentLinearIntegration();
    this.testResults = [];
  }

  log(message, type = 'info') {
    const emoji = {
      info: '📝',
      success: '✅',
      error: '❌',
      test: '🧪'
    }[type] || '📝';

    console.log(`${emoji} ${message}`);
  }

  async runTest(testName, testFunction) {
    this.log(`Testing: ${testName}`, 'test');

    try {
      const result = await testFunction();
      this.testResults.push({ name: testName, success: true, result });
      this.log(`PASSED: ${testName}`, 'success');
      return result;
    } catch (error) {
      this.testResults.push({ name: testName, success: false, error: error.message });
      this.log(`FAILED: ${testName} - ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Test basic Linear MCP integration
   */
  async testBasicLinearMCP() {
    return this.runTest('Basic Linear MCP Integration', async () => {
      // Test issue creation
      const issueData = {
        title: 'Test MCP Integration Issue',
        description: 'Testing Linear MCP integration from Claude Agentic Workflow System',
        priority: 'medium',
        labels: ['test', 'mcp-integration'],
        assignee: 'STRATEGIST'
      };

      const result = await this.linearMCP.createIssue(issueData);

      if (!result.success) {
        throw new Error('Failed to create issue via MCP');
      }

      return {
        created: true,
        issueId: result.id,
        identifier: result.identifier
      };
    });
  }

  /**
   * Test agent Linear integration
   */
  async testAgentLinearIntegration() {
    return this.runTest('Agent Linear Integration', async () => {
      // Test AUDITOR findings processing
      const auditResult = {
        success: true,
        patterns: [
          {
            type: 'test-finding',
            category: 'code-quality',
            message: 'Test finding for MCP integration',
            severity: 'low',
            path: 'test.js',
            line: 1
          }
        ]
      };

      const result = await this.agentLinear.processAuditorFindings(auditResult);

      if (!result.success) {
        throw new Error('Failed to process AUDITOR findings');
      }

      return {
        processed: true,
        tasksCreated: result.tasksCreated,
        method: result.method
      };
    });
  }

  /**
   * Test issue status updates
   */
  async testIssueStatusUpdate() {
    return this.runTest('Issue Status Update', async () => {
      // First create an issue
      const issueResult = await this.linearMCP.createIssue({
        title: 'Test Status Update Issue',
        description: 'Testing status updates via MCP',
        priority: 'low'
      });

      // Then update its status
      const updateResult = await this.linearMCP.updateIssueStatus(
        issueResult.id,
        'In Progress',
        'Testing MCP status update functionality'
      );

      if (!updateResult.success) {
        throw new Error('Failed to update issue status');
      }

      return {
        issueCreated: issueResult.success,
        statusUpdated: updateResult.success,
        newStatus: updateResult.status
      };
    });
  }

  /**
   * Test workflow integration test
   */
  async testWorkflowIntegration() {
    return this.runTest('Complete Workflow Integration', async () => {
      const result = await this.agentLinear.testWorkflowIntegration();

      if (!result.success) {
        throw new Error('Workflow integration test failed');
      }

      return {
        workflowTested: true,
        results: result.results,
        method: result.method
      };
    });
  }

  /**
   * Test Linear task management
   */
  async testLinearTaskManagement() {
    return this.runTest('Linear Task Management', async () => {
      // Test creating tasks from findings
      const findings = [
        {
          type: 'performance',
          severity: 'medium',
          message: 'Optimize database query',
          path: 'src/db.js',
          line: 45
        },
        {
          type: 'security',
          severity: 'high',
          message: 'Validate user input',
          path: 'src/auth.js',
          line: 12
        }
      ];

      const result = await this.linearMCP.createTasksFromFindings(findings);

      if (!result.success) {
        throw new Error('Failed to create tasks from findings');
      }

      return {
        tasksCreated: result.created.length,
        tasksFailed: result.failed.length,
        success: result.success
      };
    });
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.log('🚀 Starting Linear MCP Integration Tests', 'test');

    try {
      const results = {
        basicMCP: await this.testBasicLinearMCP(),
        agentIntegration: await this.testAgentLinearIntegration(),
        statusUpdate: await this.testIssueStatusUpdate(),
        workflowIntegration: await this.testWorkflowIntegration(),
        taskManagement: await this.testLinearTaskManagement()
      };

      const passed = this.testResults.filter(t => t.success).length;
      const total = this.testResults.length;

      this.log(`📊 Test Results: ${passed}/${total} passed`, 'info');

      if (passed === total) {
        this.log('🎉 All Linear MCP integration tests passed!', 'success');
        return { success: true, results };
      } else {
        this.log(`❌ ${total - passed} tests failed`, 'error');
        return { success: false, results };
      }

    } catch (error) {
      this.log(`💥 Test suite failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new LinearMCPTester();

  tester.runAllTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Linear MCP test failed:', error.message);
      process.exit(1);
    });
}

module.exports = LinearMCPTester;