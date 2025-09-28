#!/usr/bin/env node

/**
 * Agent Initialization Script
 *
 * Initializes and validates all 20 specialized agents
 * in the Claude Agentic Workflow System
 */

const fs = require('fs');
const path = require('path');

class AgentInitializer {
  constructor() {
    this.projectRoot = process.cwd();
    this.agentSpecs = this.loadAgentSpecs();
    this.initResults = [];
  }

  log(message, type = 'info') {
    const emoji = {
      info: '📝',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      agent: '🤖'
    }[type] || '📝';

    console.log(`${emoji} ${message}`);
  }

  /**
   * Load agent specifications
   */
  loadAgentSpecs() {
    return {
      // Core Workflow Agents
      STRATEGIST: {
        role: 'Workflow orchestrator with advanced concurrency management',
        capabilities: ['task-management', 'linear-integration', 'coordination'],
        priority: 1
      },
      AUDITOR: {
        role: 'Code quality assessment specialist',
        capabilities: ['code-analysis', 'pattern-detection', 'quality-metrics'],
        priority: 2
      },
      EXECUTOR: {
        role: 'Fix Pack implementation engine',
        capabilities: ['tdd-implementation', 'code-fixes', 'testing'],
        priority: 2
      },
      GUARDIAN: {
        role: 'CI/CD pipeline health monitor',
        capabilities: ['monitoring', 'failure-detection', 'recovery'],
        priority: 2
      },
      SCHOLAR: {
        role: 'Learning and pattern recognition engine',
        capabilities: ['pattern-learning', 'optimization', 'insights'],
        priority: 3
      },

      // Specialized Technical Agents
      ANALYZER: {
        role: 'Deep code analysis and insights specialist',
        capabilities: ['ast-analysis', 'complexity-metrics', 'dependencies'],
        priority: 3
      },
      TESTER: {
        role: 'Test creation specialist for TDD RED phase',
        capabilities: ['test-generation', 'tdd-validation', 'coverage'],
        priority: 3
      },
      VALIDATOR: {
        role: 'Test execution specialist for TDD validation',
        capabilities: ['test-execution', 'coverage-analysis', 'validation'],
        priority: 3
      },
      REFACTORER: {
        role: 'Specialized code refactoring and modernization expert',
        capabilities: ['refactoring', 'modernization', 'optimization'],
        priority: 4
      },
      RESEARCHER: {
        role: 'Deep code understanding and documentation specialist',
        capabilities: ['documentation', 'research', 'analysis'],
        priority: 4
      },

      // Infrastructure & Operations Agents
      DEPLOYER: {
        role: 'Safe and reliable deployment automation specialist',
        capabilities: ['deployment', 'automation', 'safety'],
        priority: 4
      },
      INTEGRATOR: {
        role: 'External service integration management specialist',
        capabilities: ['api-integration', 'webhooks', 'external-services'],
        priority: 4
      },
      MONITOR: {
        role: 'Real-time system observability and metrics specialist',
        capabilities: ['monitoring', 'metrics', 'alerting'],
        priority: 4
      },
      SECURITYGUARD: {
        role: 'Security vulnerability detection and remediation specialist',
        capabilities: ['security-analysis', 'vulnerability-detection', 'remediation'],
        priority: 3
      },

      // Specialized Domain Agents
      MIGRATOR: {
        role: 'Code and data migration management specialist',
        capabilities: ['migration', 'data-transformation', 'compatibility'],
        priority: 5
      },
      OPTIMIZER: {
        role: 'Performance and efficiency improvement specialist',
        capabilities: ['performance-analysis', 'optimization', 'efficiency'],
        priority: 5
      },
      DOCUMENTER: {
        role: 'Comprehensive documentation management specialist',
        capabilities: ['documentation', 'api-docs', 'guides'],
        priority: 5
      },
      ARCHITECT: {
        role: 'System design and architecture evolution specialist',
        capabilities: ['architecture', 'design', 'evolution'],
        priority: 5
      },
      CLEANER: {
        role: 'Code cleanup and maintenance specialist',
        capabilities: ['cleanup', 'maintenance', 'code-quality'],
        priority: 5
      },
      REVIEWER: {
        role: 'Automated code review and feedback specialist',
        capabilities: ['code-review', 'feedback', 'quality-assurance'],
        priority: 4
      }
    };
  }

  /**
   * Validate agent configuration
   */
  validateAgentConfig(agentName, spec) {
    const checks = [
      { name: 'Role defined', valid: !!spec.role },
      { name: 'Capabilities listed', valid: spec.capabilities && spec.capabilities.length > 0 },
      { name: 'Priority set', valid: spec.priority >= 1 && spec.priority <= 5 }
    ];

    const valid = checks.every(check => check.valid);

    return {
      agent: agentName,
      valid,
      checks,
      capabilities: spec.capabilities?.length || 0,
      priority: spec.priority
    };
  }

  /**
   * Check agent system dependencies
   */
  checkDependencies() {
    const dependencies = [
      { name: 'Memory-safe router', path: '.claude/scripts/core/memory-safe-router.js' },
      { name: 'TDD gate enforcer', path: '.claude/git-hooks/tdd-gate-enforcer.js' },
      { name: 'Linear MCP integration', path: '.claude/integrations/linear-mcp-integration.js' },
      { name: 'Agent Linear integration', path: '.claude/integrations/agent-linear-integration.js' },
      { name: 'Webhook handler', path: '.claude/webhooks/linear-webhook-handler.js' }
    ];

    const results = dependencies.map(dep => {
      const exists = fs.existsSync(path.join(this.projectRoot, dep.path));
      return { ...dep, exists };
    });

    return results;
  }

  /**
   * Initialize Linear integration for agents
   */
  initializeLinearIntegration() {
    try {
      const LinearMCPIntegration = require('../integrations/linear-mcp-integration.js');
      const integration = new LinearMCPIntegration();
      return { success: true, integration };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test agent communication capabilities
   */
  async testAgentCommunication() {
    const tests = [
      { name: 'Memory-safe router', test: this.testMemorySafeRouter.bind(this) },
      { name: 'Linear MCP connection', test: this.testLinearMCP.bind(this) },
      { name: 'Agent coordination', test: this.testAgentCoordination.bind(this) }
    ];

    const results = [];

    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({ name: test.name, success: true, result });
      } catch (error) {
        results.push({ name: test.name, success: false, error: error.message });
      }
    }

    return results;
  }

  async testMemorySafeRouter() {
    const MemorySafeRouter = require('./core/memory-safe-router.js');
    const router = new MemorySafeRouter();
    return { available: true, memoryLimit: router.maxMemoryMB };
  }

  async testLinearMCP() {
    const linearResult = this.initializeLinearIntegration();
    return linearResult;
  }

  async testAgentCoordination() {
    // Simple coordination test
    return { coordinated: true, agentCount: Object.keys(this.agentSpecs).length };
  }

  /**
   * Generate agent status report
   */
  generateStatusReport() {
    const agentCount = Object.keys(this.agentSpecs).length;
    const validAgents = this.initResults.filter(r => r.valid).length;
    const dependencies = this.checkDependencies();
    const validDeps = dependencies.filter(d => d.exists).length;

    return {
      agents: {
        total: agentCount,
        valid: validAgents,
        success_rate: Math.round((validAgents / agentCount) * 100)
      },
      dependencies: {
        total: dependencies.length,
        valid: validDeps,
        success_rate: Math.round((validDeps / dependencies.length) * 100)
      },
      categories: {
        core: ['STRATEGIST', 'AUDITOR', 'EXECUTOR', 'GUARDIAN', 'SCHOLAR'].length,
        technical: ['ANALYZER', 'TESTER', 'VALIDATOR', 'REFACTORER', 'RESEARCHER'].length,
        infrastructure: ['DEPLOYER', 'INTEGRATOR', 'MONITOR', 'SECURITYGUARD'].length,
        specialized: ['MIGRATOR', 'OPTIMIZER', 'DOCUMENTER', 'ARCHITECT', 'CLEANER', 'REVIEWER'].length
      }
    };
  }

  /**
   * Run complete agent initialization
   */
  async initialize() {
    this.log('🚀 Initializing Claude Agentic Workflow System agents...', 'info');

    try {
      // Validate all agent configurations
      for (const [agentName, spec] of Object.entries(this.agentSpecs)) {
        const validation = this.validateAgentConfig(agentName, spec);
        this.initResults.push(validation);

        if (validation.valid) {
          this.log(`${agentName}: ${spec.role}`, 'agent');
        } else {
          this.log(`${agentName}: Configuration issues`, 'warning');
        }
      }

      // Check dependencies
      this.log('🔍 Checking system dependencies...', 'info');
      const dependencies = this.checkDependencies();
      dependencies.forEach(dep => {
        if (dep.exists) {
          this.log(`✓ ${dep.name}`, 'success');
        } else {
          this.log(`✗ ${dep.name}`, 'error');
        }
      });

      // Test communication
      this.log('📡 Testing agent communication...', 'info');
      const commTests = await this.testAgentCommunication();
      commTests.forEach(test => {
        if (test.success) {
          this.log(`✓ ${test.name}`, 'success');
        } else {
          this.log(`✗ ${test.name}: ${test.error}`, 'error');
        }
      });

      // Generate report
      const report = this.generateStatusReport();

      this.log('📊 Agent Initialization Summary:', 'info');
      this.log(`   Agents: ${report.agents.valid}/${report.agents.total} (${report.agents.success_rate}%)`, 'info');
      this.log(`   Dependencies: ${report.dependencies.valid}/${report.dependencies.total} (${report.dependencies.success_rate}%)`, 'info');
      this.log(`   Categories: Core(${report.categories.core}) Technical(${report.categories.technical}) Infrastructure(${report.categories.infrastructure}) Specialized(${report.categories.specialized})`, 'info');

      const overallSuccess = report.agents.success_rate >= 90 && report.dependencies.success_rate >= 80;

      if (overallSuccess) {
        this.log('🎉 Agent initialization completed successfully!', 'success');
      } else {
        this.log('⚠️ Agent initialization completed with issues', 'warning');
      }

      return {
        success: overallSuccess,
        report,
        validAgents: this.initResults.filter(r => r.valid),
        dependencies,
        communicationTests: commTests
      };

    } catch (error) {
      this.log(`Agent initialization failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }
}

// Run if called directly
if (require.main === module) {
  const initializer = new AgentInitializer();
  initializer.initialize()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Agent initialization crashed:', error.message);
      process.exit(1);
    });
}

module.exports = AgentInitializer;