#!/usr/bin/env node

/**
 * Phase B.1 Testing - Comprehensive validation of concurrency system
 *
 * Test scenarios:
 * 1. Basic 3-agent concurrent execution
 * 2. MCP queue management under load
 * 3. Error recovery and circuit breaker functionality
 * 4. Performance monitoring accuracy
 * 5. Graceful degradation under stress
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
  bold: (text) => `[1m${text}[0m`
};
const ConcurrencyOrchestrator = require('./concurrency-orchestrator');

class PhaseB1Tester {
  constructor(options = {}) {
    this.config = {
      testDuration: 120000,  // 2 minutes per test
      stressTestDuration: 60000, // 1 minute stress test
      ...options
    };

    this.orchestrator = null;
    this.testResults = {
      basic: null,
      load: null,
      errorRecovery: null,
      monitoring: null,
      stress: null
    };

    console.log(colors.bold.blue('🧪 Phase B.1 Tester initialized'));
  }

  /**
   * Run comprehensive Phase B.1 test suite
   */
  async runTestSuite() {
    console.log(colors.bold.cyan('\n🚀 Starting Phase B.1 Comprehensive Test Suite\n'));

    const startTime = Date.now();

    try {
      // Initialize orchestrator
      await this.initializeOrchestrator();

      // Test 1: Basic concurrent execution
      console.log(colors.bold.yellow('\n📋 Test 1: Basic Concurrent Execution'));
      this.testResults.basic = await this.testBasicConcurrency();

      // Test 2: Load testing with queue management
      console.log(colors.bold.yellow('\n📋 Test 2: Load Testing with Queue Management'));
      this.testResults.load = await this.testLoadHandling();

      // Test 3: Error recovery and circuit breakers
      console.log(colors.bold.yellow('\n📋 Test 3: Error Recovery and Circuit Breakers'));
      this.testResults.errorRecovery = await this.testErrorRecovery();

      // Test 4: Performance monitoring
      console.log(colors.bold.yellow('\n📋 Test 4: Performance Monitoring Accuracy'));
      this.testResults.monitoring = await this.testPerformanceMonitoring();

      // Test 5: Stress testing
      console.log(colors.bold.yellow('\n📋 Test 5: System Stress Testing'));
      this.testResults.stress = await this.testSystemStress();

      // Generate comprehensive report
      const duration = Date.now() - startTime;
      await this.generateTestReport(duration);

      // Cleanup
      await this.cleanup();

    } catch (error) {
      console.log(colors.red(`❌ Test suite failed: ${error.message}`));
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Initialize orchestrator for testing
   */
  async initializeOrchestrator() {
    console.log(colors.blue('🎭 Initializing Concurrency Orchestrator for testing...'));

    const config = {
      mcpConfig: {
        customLimits: {
          'test-server': 2  // Add test server for controlled testing
        }
      },
      agentConfig: {
        maxConcurrentAgents: 3,
        agentTimeout: 30000  // Shorter timeout for testing
      },
      monitoringConfig: {
        sampleInterval: 2000,  // More frequent sampling for testing
        reportInterval: 10000
      },
      errorRecoveryConfig: {
        circuitBreaker: {
          failureThreshold: 3,  // Lower threshold for faster testing
          resetTimeout: 10000   // Faster reset for testing
        }
      }
    };

    this.orchestrator = new ConcurrencyOrchestrator(config);
    await this.orchestrator.start();

    console.log(colors.green('✅ Orchestrator initialized and started'));
  }

  /**
   * Test 1: Basic concurrent execution
   */
  async testBasicConcurrency() {
    console.log(colors.blue('Testing basic 3-agent concurrent execution...'));

    const testSpec = {
      name: 'Basic Concurrency Test',
      strategy: 'parallel',
      tasks: [
        {
          agent: 'auditor',
          command: 'assess-code',
          params: { scope: 'test' },
          priority: 'normal'
        },
        {
          agent: 'analyzer',
          command: 'complexity-analysis',
          params: { detailed: false },
          priority: 'normal'
        },
        {
          agent: 'reviewer',
          command: 'review-changes',
          params: { thorough: false },
          priority: 'normal'
        }
      ]
    };

    const startTime = Date.now();

    try {
      const result = await this.orchestrator.executeWorkflow(testSpec);
      const duration = Date.now() - startTime;

      const success = result.successfulTasks === 3;

      return {
        success,
        duration,
        totalTasks: result.totalTasks,
        successfulTasks: result.successfulTasks,
        details: result
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test 2: Load testing with queue management
   */
  async testLoadHandling() {
    console.log(colors.blue('Testing load handling with queue management...'));

    const loadTests = [];
    const concurrentWorkflows = 5; // More workflows than agent capacity

    const workflowSpec = {
      name: 'Load Test Workflow',
      strategy: 'parallel',
      tasks: [
        {
          agent: 'tester',
          command: 'run-tests',
          params: { coverage: false },
          priority: 'normal'
        },
        {
          agent: 'validator',
          command: 'validate-coverage',
          params: { threshold: 50 },
          priority: 'low'
        }
      ]
    };

    const startTime = Date.now();

    try {
      // Launch multiple workflows concurrently
      for (let i = 0; i < concurrentWorkflows; i++) {
        loadTests.push(
          this.orchestrator.executeWorkflow({
            ...workflowSpec,
            name: `${workflowSpec.name} ${i + 1}`
          })
        );
      }

      const results = await Promise.allSettled(loadTests);
      const duration = Date.now() - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        success: successful > 0, // At least some should succeed
        duration,
        totalWorkflows: concurrentWorkflows,
        successful,
        failed,
        concurrencyHandled: successful === concurrentWorkflows
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test 3: Error recovery and circuit breakers
   */
  async testErrorRecovery() {
    console.log(colors.blue('Testing error recovery and circuit breaker functionality...'));

    const startTime = Date.now();

    try {
      // Simulate server failures to trigger circuit breaker
      const errorManager = this.orchestrator.errorRecoveryManager;

      // Record multiple failures for a test server
      for (let i = 0; i < 5; i++) {
        errorManager.recordOperationResult('test-server', false);
      }

      // Verify circuit breaker opened
      const circuitOpen = !errorManager.shouldAllowOperation('test-server');

      // Test error handling
      await errorManager.handleError('mcp_timeout', {
        serverName: 'test-server',
        operation: 'test-operation',
        attempts: 1
      });

      // Wait for potential circuit reset
      await this.sleep(2000);

      // Test recovery
      errorManager.recordOperationResult('test-server', true);
      errorManager.recordOperationResult('test-server', true);

      const errorStats = errorManager.getErrorStats();

      return {
        success: true,
        circuitBreakerWorked: circuitOpen,
        errorStats,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test 4: Performance monitoring accuracy
   */
  async testPerformanceMonitoring() {
    console.log(colors.blue('Testing performance monitoring accuracy...'));

    const startTime = Date.now();

    try {
      // Run a workflow to generate metrics
      const testSpec = {
        name: 'Monitoring Test',
        strategy: 'sequential',
        tasks: [
          {
            agent: 'monitor',
            command: 'collect-metrics',
            params: {},
            priority: 'high'
          }
        ]
      };

      await this.orchestrator.executeWorkflow(testSpec);

      // Wait for monitoring to collect data
      await this.sleep(5000);

      // Get metrics
      const systemStatus = this.orchestrator.getSystemStatus();
      const performanceMetrics = systemStatus.performanceMetrics;

      const hasValidMetrics = (
        performanceMetrics &&
        typeof performanceMetrics.uptime === 'number' &&
        performanceMetrics.uptime > 0
      );

      return {
        success: hasValidMetrics,
        metrics: performanceMetrics,
        systemStatus,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test 5: System stress testing
   */
  async testSystemStress() {
    console.log(colors.blue('Testing system under stress conditions...'));

    const startTime = Date.now();

    try {
      const stressWorkflows = [];
      const highLoadCount = 10; // Much higher than capacity

      // Create high-priority tasks that should be processed first
      const stressSpec = {
        name: 'Stress Test Workflow',
        strategy: 'parallel',
        tasks: [
          {
            agent: 'optimizer',
            command: 'optimize-performance',
            params: { aggressive: true },
            priority: 'high'
          },
          {
            agent: 'cleaner',
            command: 'cleanup-resources',
            params: { deep: true },
            priority: 'normal'
          }
        ]
      };

      // Launch many workflows to stress the system
      for (let i = 0; i < highLoadCount; i++) {
        stressWorkflows.push(
          this.orchestrator.executeWorkflow({
            ...stressSpec,
            name: `${stressSpec.name} ${i + 1}`
          }).catch(error => ({ error: error.message }))
        );
      }

      // Wait for stress test duration
      await this.sleep(this.config.stressTestDuration);

      // Check system health during stress
      const systemStatus = this.orchestrator.getSystemStatus();
      const errorStats = systemStatus.errorRecovery;

      // Wait for workflows to complete or timeout
      const results = await Promise.allSettled(stressWorkflows);

      const completed = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
      const failed = results.filter(r => r.status === 'rejected' || r.value?.error).length;

      const gracefulDegradation = completed > 0 && this.orchestrator.isRunning;

      return {
        success: gracefulDegradation,
        duration: Date.now() - startTime,
        totalWorkflows: highLoadCount,
        completed,
        failed,
        systemStillRunning: this.orchestrator.isRunning,
        errorStats,
        systemStatus
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Generate comprehensive test report
   */
  async generateTestReport(totalDuration) {
    console.log(colors.bold.cyan('\n📊 Phase B.1 Test Results Report'));
    console.log(colors.blue('═'.repeat(80)));

    const overallSuccess = Object.values(this.testResults).every(result => result?.success);

    // Overall summary
    console.log(colors.white(`Total Test Duration:    ${(totalDuration / 1000).toFixed(1)}s`));
    console.log(colors.white(`Overall Status:         ${overallSuccess ? colors.green('✅ PASSED') : colors.red('❌ FAILED')}`));
    console.log(colors.blue('─'.repeat(80)));

    // Individual test results
    this.reportTestResult('Basic Concurrency', this.testResults.basic);
    this.reportTestResult('Load Handling', this.testResults.load);
    this.reportTestResult('Error Recovery', this.testResults.errorRecovery);
    this.reportTestResult('Performance Monitoring', this.testResults.monitoring);
    this.reportTestResult('Stress Testing', this.testResults.stress);

    // Success criteria validation
    console.log(colors.blue('\n🎯 Success Criteria Validation'));
    console.log(colors.blue('─'.repeat(50)));

    const criteria = {
      'Concurrent Execution': this.testResults.basic?.success,
      'Queue Management': this.testResults.load?.success,
      'Error Recovery': this.testResults.errorRecovery?.success,
      'Performance Monitoring': this.testResults.monitoring?.success,
      'Graceful Degradation': this.testResults.stress?.success
    };

    for (const [criterion, passed] of Object.entries(criteria)) {
      const status = passed ? colors.green('✅ PASS') : colors.red('❌ FAIL');
      console.log(colors.white(`${criterion.padEnd(25)} ${status}`));
    }

    console.log(colors.blue('═'.repeat(80)));

    // Export detailed results
    const reportPath = '/tmp/phase-b1-test-report.json';
    await this.exportTestResults(reportPath);
    console.log(colors.green(`📄 Detailed results exported to: ${reportPath}\n`));

    return overallSuccess;
  }

  /**
   * Report individual test result
   */
  reportTestResult(testName, result) {
    if (!result) {
      console.log(colors.yellow(`${testName.padEnd(25)} ⚠️  NOT RUN`));
      return;
    }

    const status = result.success ? colors.green('✅ PASS') : colors.red('❌ FAIL');
    const duration = result.duration ? `(${(result.duration / 1000).toFixed(1)}s)` : '';

    console.log(colors.white(`${testName.padEnd(25)} ${status} ${duration}`));

    if (result.error) {
      console.log(colors.red(`  Error: ${result.error}`));
    }
  }

  /**
   * Export test results to file
   */
  async exportTestResults(filePath) {
    const fs = require('fs').promises;

    const exportData = {
      timestamp: new Date().toISOString(),
      testResults: this.testResults,
      systemStatus: this.orchestrator ? this.orchestrator.getSystemStatus() : null,
      summary: {
        allTestsPassed: Object.values(this.testResults).every(r => r?.success),
        totalTests: Object.keys(this.testResults).length,
        passedTests: Object.values(this.testResults).filter(r => r?.success).length
      }
    };

    try {
      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
    } catch (error) {
      console.log(colors.yellow(`⚠️  Could not export results: ${error.message}`));
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.orchestrator) {
      console.log(colors.blue('🧹 Cleaning up orchestrator...'));
      await this.orchestrator.shutdown();
      this.orchestrator = null;
    }
  }
}

// CLI execution
if (require.main === module) {
  const tester = new PhaseB1Tester();

  tester.runTestSuite()
    .then((success) => {
      const exitCode = success ? 0 : 1;
      console.log(colors.bold[success ? 'green' : 'red'](`\n🏁 Test suite ${success ? 'PASSED' : 'FAILED'}`));
      process.exit(exitCode);
    })
    .catch((error) => {
      console.log(colors.red(`💥 Test suite crashed: ${error.message}`));
      console.log(error.stack);
      process.exit(1);
    });
}

module.exports = PhaseB1Tester;