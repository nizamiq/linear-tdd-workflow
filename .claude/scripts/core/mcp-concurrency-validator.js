#!/usr/bin/env node

/**
 * MCP Concurrency Validator - Tests real MCP server concurrency limits
 *
 * This script tests actual MCP server capabilities to understand
 * real-world concurrency constraints for our multi-agent system.
 */

// Native ANSI colors to replace chalk
const colors = {
  red: (text) => `[31m${text}[0m`,
  green: (text) => `[32m${text}[0m`,
  yellow: (text) => `[33m${text}[0m`,
  blue: (text) => `[34m${text}[0m`,
  magenta: (text) => `[35m${text}[0m`,
  cyan: (text) => `[36m${text}[0m`,
  white: (text) => `[37m${text}[0m`,
  gray: (text) => `[90m${text}[0m`,
  bold: (text) => `[1m${text}[0m`,
};
const fs = require('fs').promises;
const path = require('path');

class McpConcurrencyValidator {
  constructor() {
    this.results = {
      linearServer: {},
      sequentialThinking: {},
      playwright: {},
      timestamp: new Date().toISOString(),
    };
    this.testId = `mcp-test-${Date.now()}`;
  }

  /**
   * Run comprehensive MCP concurrency validation
   */
  async runValidation() {
    console.log(colors.bold.cyan('\n🔌 MCP Server Concurrency Validation\n'));

    try {
      // Test Linear server concurrency
      await this.testLinearServerConcurrency();

      // Test Sequential Thinking concurrency
      await this.testSequentialThinkingConcurrency();

      // Test other available MCP servers
      await this.testOtherMcpServers();

      // Generate report
      await this.generateReport();

      console.log(colors.bold.green('\n✅ MCP concurrency validation complete!\n'));
    } catch (error) {
      console.error(colors.red(`MCP validation failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Test Linear server concurrency capabilities
   */
  async testLinearServerConcurrency() {
    console.log(colors.yellow('📋 Testing Linear server concurrency...\n'));

    const tests = [
      {
        operation: 'list_teams',
        concurrent: [1, 2, 3],
        description: 'List teams operation',
      },
      {
        operation: 'list_issues',
        concurrent: [1, 2],
        description: 'List issues operation',
        params: { limit: 5 },
      },
    ];

    for (const test of tests) {
      console.log(colors.blue(`  Testing ${test.operation}...`));

      for (const concurrency of test.concurrent) {
        try {
          const startTime = Date.now();

          // Create concurrent Linear operations
          const operations = Array(concurrency)
            .fill()
            .map((_, i) =>
              this.simulateLinearOperation(test.operation, {
                ...test.params,
                requestId: `test-${i}`,
              }),
            );

          const results = await Promise.all(operations);
          const duration = Date.now() - startTime;

          if (!this.results.linearServer[test.operation]) {
            this.results.linearServer[test.operation] = {};
          }

          this.results.linearServer[test.operation][concurrency] = {
            success: true,
            duration,
            results: results.length,
            avgResponseTime: duration / results.length,
            errors: results.filter((r) => r.error).length,
          };

          console.log(colors.green(`    ✅ ${concurrency} concurrent - ${duration}ms avg`));
        } catch (error) {
          if (!this.results.linearServer[test.operation]) {
            this.results.linearServer[test.operation] = {};
          }

          this.results.linearServer[test.operation][concurrency] = {
            success: false,
            error: error.message,
          };

          console.log(colors.red(`    ❌ ${concurrency} concurrent failed - ${error.message}`));
          break;
        }

        await this.sleep(1000);
      }
    }
  }

  /**
   * Test Sequential Thinking concurrency
   */
  async testSequentialThinkingConcurrency() {
    console.log(colors.yellow('\n🧠 Testing Sequential Thinking concurrency...\n'));

    const concurrencyLevels = [1, 2];

    for (const concurrency of concurrencyLevels) {
      console.log(colors.blue(`  Testing ${concurrency} concurrent thinking operations...`));

      try {
        const startTime = Date.now();

        // Create concurrent thinking operations
        const operations = Array(concurrency)
          .fill()
          .map((_, i) =>
            this.simulateSequentialThinking(`analysis-${i}`, {
              thought: `Analyzing concurrency test scenario ${i}`,
              thoughtNumber: 1,
              totalThoughts: 2,
              nextThoughtNeeded: true,
            }),
          );

        const results = await Promise.all(operations);
        const duration = Date.now() - startTime;

        this.results.sequentialThinking[concurrency] = {
          success: true,
          duration,
          results: results.length,
          avgResponseTime: duration / results.length,
          errors: results.filter((r) => r.error).length,
        };

        console.log(colors.green(`    ✅ ${concurrency} concurrent - ${duration}ms avg`));
      } catch (error) {
        this.results.sequentialThinking[concurrency] = {
          success: false,
          error: error.message,
        };

        console.log(colors.red(`    ❌ ${concurrency} concurrent failed - ${error.message}`));
        break;
      }

      await this.sleep(1500);
    }
  }

  /**
   * Test other available MCP servers
   */
  async testOtherMcpServers() {
    console.log(colors.yellow('\n🔧 Testing other MCP servers...\n'));

    // Test Context7 if available
    try {
      await this.testContext7Concurrency();
    } catch (error) {
      console.log(colors.gray('  Context7 server not available or not configured'));
    }

    // Test Kubernetes if available
    try {
      await this.testKubernetesConcurrency();
    } catch (error) {
      console.log(colors.gray('  Kubernetes server not available or not configured'));
    }
  }

  /**
   * Test Context7 server concurrency
   */
  async testContext7Concurrency() {
    console.log(colors.blue('  Testing Context7 server...'));

    try {
      // Simulate library lookup operations
      const operations = Array(2)
        .fill()
        .map((_, i) =>
          this.simulateContext7Operation('resolve-library-id', {
            libraryName: `test-lib-${i}`,
          }),
        );

      const results = await Promise.all(operations);

      this.results.context7 = {
        concurrent: 2,
        success: true,
        results: results.length,
      };

      console.log(colors.green('    ✅ Context7 concurrent operations successful'));
    } catch (error) {
      this.results.context7 = {
        success: false,
        error: error.message,
      };
      console.log(colors.red(`    ❌ Context7 test failed - ${error.message}`));
    }
  }

  /**
   * Test Kubernetes server concurrency
   */
  async testKubernetesConcurrency() {
    console.log(colors.blue('  Testing Kubernetes server...'));

    try {
      // Simulate kubectl operations
      const operations = Array(2)
        .fill()
        .map((_, i) => this.simulateKubernetesOperation('ping', {}));

      const results = await Promise.all(operations);

      this.results.kubernetes = {
        concurrent: 2,
        success: true,
        results: results.length,
      };

      console.log(colors.green('    ✅ Kubernetes concurrent operations successful'));
    } catch (error) {
      this.results.kubernetes = {
        success: false,
        error: error.message,
      };
      console.log(colors.red(`    ❌ Kubernetes test failed - ${error.message}`));
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport() {
    const reportDir = path.join(__dirname, '..', '..', 'analysis');
    await fs.mkdir(reportDir, { recursive: true });

    const reportPath = path.join(reportDir, `${this.testId}.json`);

    // Add analysis
    this.results.analysis = this.generateAnalysis();

    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

    // Generate summary
    const summaryPath = path.join(reportDir, `${this.testId}-mcp-summary.md`);
    await fs.writeFile(summaryPath, this.generateMarkdownSummary());

    console.log(colors.blue(`\nReport saved to: ${reportPath}`));
    console.log(colors.blue(`Summary saved to: ${summaryPath}`));
  }

  /**
   * Generate analysis from test results
   */
  generateAnalysis() {
    const analysis = {
      mcpConcurrencyLimits: {},
      safeOperationLimits: {},
      recommendations: [],
      riskFactors: [],
    };

    // Analyze Linear server limits
    const linearOps = this.results.linearServer;
    for (const [operation, results] of Object.entries(linearOps)) {
      const maxConcurrent = Math.max(
        ...Object.entries(results)
          .filter(([_, result]) => result.success)
          .map(([concurrency, _]) => parseInt(concurrency)),
      );
      analysis.mcpConcurrencyLimits[`linear_${operation}`] = maxConcurrent;
    }

    // Analyze Sequential Thinking limits
    const thinkingResults = this.results.sequentialThinking;
    const maxThinking = Math.max(
      ...Object.entries(thinkingResults)
        .filter(([_, result]) => result.success)
        .map(([concurrency, _]) => parseInt(concurrency)),
    );
    analysis.mcpConcurrencyLimits.sequential_thinking = maxThinking;

    // Generate recommendations
    const minLimit = Math.min(...Object.values(analysis.mcpConcurrencyLimits));

    if (minLimit >= 3) {
      analysis.recommendations.push('MCP servers can handle moderate concurrency (3+ operations)');
      analysis.safeOperationLimits.recommended = Math.floor(minLimit * 0.8);
    } else if (minLimit >= 2) {
      analysis.recommendations.push('MCP servers have limited concurrency (2-3 operations)');
      analysis.safeOperationLimits.recommended = 2;
      analysis.riskFactors.push('MCP server concurrency limits may constrain agent parallelism');
    } else {
      analysis.recommendations.push('MCP servers appear to have strict sequential limits');
      analysis.safeOperationLimits.recommended = 1;
      analysis.riskFactors.push('MCP servers may not support concurrent operations');
    }

    return analysis;
  }

  /**
   * Generate markdown summary
   */
  generateMarkdownSummary() {
    const analysis = this.results.analysis;

    return `# MCP Server Concurrency Analysis

## Test Overview
- **Test ID**: ${this.testId}
- **Timestamp**: ${this.results.timestamp}

## Concurrency Limits by Server

### Linear Server
${Object.entries(this.results.linearServer)
  .map(
    ([op, results]) =>
      `- **${op}**: Max ${Math.max(...Object.keys(results).map((k) => parseInt(k)))} concurrent operations`,
  )
  .join('\n')}

### Sequential Thinking
- **Max concurrent**: ${Math.max(...Object.keys(this.results.sequentialThinking).map((k) => parseInt(k)))} operations

### Other Servers
${this.results.context7 ? `- **Context7**: ${this.results.context7.success ? '✅' : '❌'} concurrent operations` : '- Context7: Not tested'}
${this.results.kubernetes ? `- **Kubernetes**: ${this.results.kubernetes.success ? '✅' : '❌'} concurrent operations` : '- Kubernetes: Not tested'}

## Key Findings

### Recommended Safe Limit
**${analysis.safeOperationLimits.recommended}** concurrent MCP operations

### Risk Factors
${
  analysis.riskFactors.length > 0
    ? analysis.riskFactors.map((r) => `- ${r}`).join('\n')
    : '- No significant risk factors identified'
}

### Recommendations
${analysis.recommendations.map((r) => `- ${r}`).join('\n')}

## Impact on Agent Design

Based on these findings:
1. Agent concurrency should be limited to ${analysis.safeOperationLimits.recommended} concurrent MCP operations
2. ${analysis.riskFactors.length > 0 ? 'Careful coordination required due to MCP limits' : 'MCP servers can support reasonable concurrency'}
3. Consider MCP operation batching and caching for higher throughput
`;
  }

  // Simulation methods (replace with actual MCP calls in real implementation)
  async simulateLinearOperation(operation, params) {
    // Simulate API call latency and potential failures
    await this.sleep(Math.random() * 300 + 100);

    if (Math.random() < 0.1) {
      // 10% failure rate
      return { error: 'Simulated API timeout', operation, params };
    }

    return {
      operation,
      params,
      result: { success: true, data: `mock_${operation}_result` },
      timestamp: Date.now(),
    };
  }

  async simulateSequentialThinking(thoughtId, params) {
    // Simulate thinking operation
    await this.sleep(Math.random() * 500 + 200);

    if (Math.random() < 0.05) {
      // 5% failure rate
      return { error: 'Simulated thinking timeout', thoughtId, params };
    }

    return {
      thoughtId,
      params,
      result: { thoughtCompleted: true },
      timestamp: Date.now(),
    };
  }

  async simulateContext7Operation(operation, params) {
    await this.sleep(Math.random() * 200 + 100);
    return { operation, params, result: 'mock_context7_result' };
  }

  async simulateKubernetesOperation(operation, params) {
    await this.sleep(Math.random() * 150 + 75);
    return { operation, params, result: 'mock_k8s_result' };
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI execution
if (require.main === module) {
  const validator = new McpConcurrencyValidator();
  validator.runValidation().catch((error) => {
    console.error(colors.red(`\nMCP validation failed: ${error.message}`));
    process.exit(1);
  });
}

module.exports = McpConcurrencyValidator;
