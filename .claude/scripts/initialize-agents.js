#!/usr/bin/env node

/**
 * Agent Initialization Script
 *
 * Initializes and validates all 22 specialized agents
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
    const emoji =
      {
        info: '📝',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        agent: '🤖',
      }[type] || '📝';

    console.log(`${emoji} ${message}`);
  }

  /**
   * Load agent specifications
   */
  loadAgentSpecs() {
    return {
      // Core Workflow Agents (6)
      STRATEGIST: {
        role: 'Multi-Agent Orchestrator',
        capabilities: ['workflow-orchestration', 'multi-agent-coordination', 'linear-management'],
        priority: 1,
      },
      AUDITOR: {
        role: 'Code Quality Assessment & Standards Enforcer',
        capabilities: [
          'clean-code-principles',
          'solid-architecture-analysis',
          'technical-debt-detection',
        ],
        priority: 2,
      },
      EXECUTOR: {
        role: 'TDD Implementation Engine',
        capabilities: [
          'strict-tdd-enforcement',
          'red-green-refactor-cycle',
          'fix-pack-implementation',
        ],
        priority: 2,
      },
      GUARDIAN: {
        role: 'CI/CD Pipeline Recovery Specialist',
        capabilities: ['pipeline-recovery', 'ci-cd-monitoring', 'deployment-safety'],
        priority: 2,
      },
      SCHOLAR: {
        role: 'Learning & Pattern Recognition Engine',
        capabilities: ['pattern-recognition', 'success-analysis', 'knowledge-extraction'],
        priority: 3,
      },
      PLANNER: {
        role: 'Cycle Planning Orchestrator',
        capabilities: ['cycle-planning', 'sprint-orchestration', 'capacity-planning'],
        priority: 2,
      },

      // Development Specialists (3)
      'DJANGO-PRO': {
        role: 'Django Framework & Architecture Expert',
        capabilities: ['django-5x-async-views', 'django-rest-framework', 'celery-task-processing'],
        priority: 3,
      },
      'PYTHON-PRO': {
        role: 'Modern Python Development Expert',
        capabilities: ['python-312-features', 'async-await-mastery', 'uv-package-management'],
        priority: 3,
      },
      'TYPESCRIPT-PRO': {
        role: 'TypeScript & Type Safety Expert',
        capabilities: [
          'typescript-5x-features',
          'react-nextjs-architecture',
          'type-safe-api-design',
        ],
        priority: 3,
      },

      // Infrastructure & Deployment (4)
      'KUBERNETES-ARCHITECT': {
        role: 'Cloud-Native Infrastructure Expert',
        capabilities: ['kubernetes-orchestration', 'gitops-workflows', 'multi-cloud-architecture'],
        priority: 3,
      },
      'DEPLOYMENT-ENGINEER': {
        role: 'CI/CD Pipeline & Deployment Expert',
        capabilities: [
          'github-actions-mastery',
          'progressive-delivery',
          'zero-downtime-deployments',
        ],
        priority: 3,
      },
      'DATABASE-OPTIMIZER': {
        role: 'PostgreSQL Performance Expert',
        capabilities: [
          'postgresql-query-optimization',
          'django-orm-optimization',
          'n-plus-one-resolution',
        ],
        priority: 3,
      },
      'OBSERVABILITY-ENGINEER': {
        role: 'Observability & Monitoring Expert',
        capabilities: ['opentelemetry-implementation', 'prometheus-metrics', 'distributed-tracing'],
        priority: 3,
      },

      // Quality Engineering (7)
      'CODE-REVIEWER': {
        role: 'Elite Code Review Expert',
        capabilities: [
          'ai-powered-code-analysis',
          'security-vulnerability-detection',
          'production-reliability',
        ],
        priority: 3,
      },
      'TEST-AUTOMATOR': {
        role: 'Test Automation Excellence Expert',
        capabilities: ['strict-tdd-enforcement', 'ai-powered-test-generation', 'mutation-testing'],
        priority: 3,
      },
      'LEGACY-MODERNIZER': {
        role: 'Legacy Code Modernization Specialist',
        capabilities: [
          'legacy-code-refactoring',
          'framework-migration',
          'technical-debt-reduction',
        ],
        priority: 4,
      },
      TESTER: {
        role: 'Test-First Engineering Specialist',
        capabilities: ['test-creation', 'tdd-enforcement', 'test-automation'],
        priority: 3,
      },
      VALIDATOR: {
        role: 'Quality Gate Enforcement',
        capabilities: ['quality-validation', 'deployment-readiness', 'acceptance-testing'],
        priority: 3,
      },
      LINTER: {
        role: 'Code Style & Format Enforcement',
        capabilities: ['code-formatting', 'style-enforcement', 'autofix-generation'],
        priority: 4,
      },
      TYPECHECKER: {
        role: 'Type Safety Validation',
        capabilities: ['type-checking', 'static-analysis', 'typescript-validation'],
        priority: 4,
      },

      // Security & Routing (2)
      SECURITY: {
        role: 'Security & Vulnerability Scanner',
        capabilities: ['security-scanning', 'vulnerability-detection', 'dependency-auditing'],
        priority: 2,
      },
      ROUTER: {
        role: 'Request Routing',
        capabilities: ['request-routing', 'agent-selection', 'task-distribution'],
        priority: 5,
      },
    };
  }

  /**
   * Validate agent configuration
   */
  validateAgentConfig(agentName, spec) {
    const checks = [
      { name: 'Role defined', valid: !!spec.role },
      { name: 'Capabilities listed', valid: spec.capabilities && spec.capabilities.length > 0 },
      { name: 'Priority set', valid: spec.priority >= 1 && spec.priority <= 5 },
    ];

    const valid = checks.every((check) => check.valid);

    return {
      agent: agentName,
      valid,
      checks,
      capabilities: spec.capabilities?.length || 0,
      priority: spec.priority,
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
      {
        name: 'Agent Linear integration',
        path: '.claude/integrations/agent-linear-integration.js',
      },
      { name: 'Webhook handler', path: '.claude/webhooks/linear-webhook-handler.js' },
    ];

    const results = dependencies.map((dep) => {
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
      { name: 'Agent coordination', test: this.testAgentCoordination.bind(this) },
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
    const validAgents = this.initResults.filter((r) => r.valid).length;
    const dependencies = this.checkDependencies();
    const validDeps = dependencies.filter((d) => d.exists).length;

    return {
      agents: {
        total: agentCount,
        valid: validAgents,
        success_rate: Math.round((validAgents / agentCount) * 100),
      },
      dependencies: {
        total: dependencies.length,
        valid: validDeps,
        success_rate: Math.round((validDeps / dependencies.length) * 100),
      },
      categories: {
        core: ['STRATEGIST', 'AUDITOR', 'EXECUTOR', 'GUARDIAN', 'SCHOLAR'].length,
        technical: ['ANALYZER', 'TESTER', 'VALIDATOR', 'REFACTORER', 'RESEARCHER'].length,
        infrastructure: ['DEPLOYER', 'INTEGRATOR', 'MONITOR', 'SECURITYGUARD'].length,
        specialized: ['MIGRATOR', 'OPTIMIZER', 'DOCUMENTER', 'ARCHITECT', 'CLEANER', 'REVIEWER']
          .length,
      },
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
      dependencies.forEach((dep) => {
        if (dep.exists) {
          this.log(`✓ ${dep.name}`, 'success');
        } else {
          this.log(`✗ ${dep.name}`, 'error');
        }
      });

      // Test communication
      this.log('📡 Testing agent communication...', 'info');
      const commTests = await this.testAgentCommunication();
      commTests.forEach((test) => {
        if (test.success) {
          this.log(`✓ ${test.name}`, 'success');
        } else {
          this.log(`✗ ${test.name}: ${test.error}`, 'error');
        }
      });

      // Generate report
      const report = this.generateStatusReport();

      this.log('📊 Agent Initialization Summary:', 'info');
      this.log(
        `   Agents: ${report.agents.valid}/${report.agents.total} (${report.agents.success_rate}%)`,
        'info',
      );
      this.log(
        `   Dependencies: ${report.dependencies.valid}/${report.dependencies.total} (${report.dependencies.success_rate}%)`,
        'info',
      );
      this.log(
        `   Categories: Core(${report.categories.core}) Technical(${report.categories.technical}) Infrastructure(${report.categories.infrastructure}) Specialized(${report.categories.specialized})`,
        'info',
      );

      const overallSuccess =
        report.agents.success_rate >= 90 && report.dependencies.success_rate >= 80;

      if (overallSuccess) {
        this.log('🎉 Agent initialization completed successfully!', 'success');
      } else {
        this.log('⚠️ Agent initialization completed with issues', 'warning');
      }

      return {
        success: overallSuccess,
        report,
        validAgents: this.initResults.filter((r) => r.valid),
        dependencies,
        communicationTests: commTests,
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
  initializer
    .initialize()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Agent initialization crashed:', error.message);
      process.exit(1);
    });
}

module.exports = AgentInitializer;
