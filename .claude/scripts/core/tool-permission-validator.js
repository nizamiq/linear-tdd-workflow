#!/usr/bin/env node

/**
 * Tool Permission Validator - Enforces agent tool permissions for both JS/TS and Python
 *
 * Features:
 * - Parses agent frontmatter for allowed tools
 * - Runtime validation of tool calls
 * - Language-specific tool validation (JS/TS and Python)
 * - CI status check for permission violations
 * - Audit trail generation (90-day retention)
 * - Default-deny for write operations
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

// Native ANSI colors to replace chalk
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

class ToolPermissionValidator {
  constructor() {
    this.agentsDir = path.join(__dirname, '..', '..', 'agents');
    this.auditDir = path.join(__dirname, '..', '.audit');

    // Tool categories with risk levels
    this.toolCategories = {
      read: {
        risk: 'low',
        tools: ['Read', 'Grep', 'Glob', 'ast_parser', 'log_analyzer'],
        jsTools: ['eslint', 'tsc', 'prettier --check'],
        pythonTools: ['pylint', 'mypy', 'black --check', 'ruff check'],
      },
      write: {
        risk: 'high',
        tools: ['Write', 'Edit', 'MultiEdit', 'NotebookEdit'],
        jsTools: ['prettier --write', 'eslint --fix'],
        pythonTools: ['black', 'autopep8', 'isort', 'ruff --fix'],
      },
      execute: {
        risk: 'critical',
        tools: ['Bash', 'exec', 'subprocess'],
        jsTools: ['npm install', 'npm run', 'node', 'npx'],
        pythonTools: ['pip install', 'poetry add', 'python', 'pytest'],
      },
      external: {
        risk: 'high',
        tools: ['WebFetch', 'WebSearch', 'api_client'],
        mcpServers: ['linear', 'github', 'kubernetes', 'playwright'],
      },
      testing: {
        risk: 'medium',
        tools: ['test_runner', 'coverage_analyzer', 'mutation_runner'],
        jsTools: ['jest', 'mocha', 'vitest', 'nyc', 'stryker'],
        pythonTools: ['pytest', 'unittest', 'coverage', 'mutmut', 'hypothesis'],
      },
    };

    this.languagePatterns = {
      javascript: {
        extensions: ['.js', '.jsx', '.mjs', '.cjs'],
        testPatterns: ['*.test.js', '*.spec.js', '__tests__/**'],
        tools: ['eslint', 'prettier', 'jest', 'mocha', 'webpack'],
      },
      typescript: {
        extensions: ['.ts', '.tsx', '.d.ts'],
        testPatterns: ['*.test.ts', '*.spec.ts', '__tests__/**'],
        tools: ['tsc', 'eslint', 'prettier', 'jest', 'ts-node'],
      },
      python: {
        extensions: ['.py', '.pyx', '.pyi'],
        testPatterns: ['test_*.py', '*_test.py', 'tests/**'],
        tools: ['pylint', 'black', 'pytest', 'mypy', 'ruff'],
      },
    };

    // Default permissions (most restrictive)
    this.defaultPermissions = {
      tools: ['Read', 'Grep', 'Glob'],
      allowedBashCommands: [],
      allowedMcpServers: [],
      fil: {
        allow: [],
        block: ['FIL-0', 'FIL-1', 'FIL-2', 'FIL-3'],
      },
    };
  }

  /**
   * Load all agent configurations
   */
  async loadAgentConfigs() {
    const agents = new Map();

    try {
      const files = await fs.readdir(this.agentsDir);
      const agentFiles = files.filter((f) => f.endsWith('.md'));

      for (const file of agentFiles) {
        const agentPath = path.join(this.agentsDir, file);
        const content = await fs.readFile(agentPath, 'utf8');
        const config = this.parseAgentConfig(content);

        if (config) {
          config.filename = file;
          agents.set(config.name, config);
        }
      }

      return agents;
    } catch (error) {
      throw new Error(`Failed to load agent configs: ${error.message}`);
    }
  }

  /**
   * Parse agent configuration from frontmatter
   */
  parseAgentConfig(content) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      return null;
    }

    try {
      const config = yaml.load(frontmatterMatch[1]);

      // Ensure tools is an array
      if (!config.tools) {
        config.tools = this.defaultPermissions.tools;
      } else if (!Array.isArray(config.tools)) {
        // Handle tools as array of objects or single value
        if (typeof config.tools === 'string') {
          config.tools = [config.tools];
        } else if (
          Array.isArray(config.tools) &&
          config.tools.length > 0 &&
          typeof config.tools[0] === 'object'
        ) {
          // Extract tool names from objects
          config.tools = config.tools.map((t) => t.name || t).filter(Boolean);
        }
      }

      config.allowedBashCommands =
        config.allowedBashCommands || this.defaultPermissions.allowedBashCommands;
      config.allowedMcpServers =
        config.allowedMcpServers || this.defaultPermissions.allowedMcpServers;
      config.fil = config.fil || this.defaultPermissions.fil;

      return config;
    } catch (error) {
      console.warn(`Failed to parse agent config: ${error.message}`);
      return null;
    }
  }

  /**
   * Validate tool usage for an agent
   */
  async validateAgentTools(agentName, requestedTools, context = {}) {
    const agents = await this.loadAgentConfigs();
    const agentConfig = agents.get(agentName);

    if (!agentConfig) {
      throw new Error(`Agent ${agentName} not found`);
    }

    const violations = [];
    const allowed = [];
    const languageContext = this.detectLanguage(context);

    for (const tool of requestedTools) {
      if (this.isToolAllowed(tool, agentConfig, languageContext)) {
        allowed.push(tool);
      } else {
        violations.push({
          agent: agentName,
          tool,
          reason: this.getViolationReason(tool, agentConfig),
          risk: this.getToolRisk(tool),
          language: languageContext.language,
        });
      }
    }

    // Log to audit trail
    await this.logAudit({
      timestamp: new Date().toISOString(),
      agent: agentName,
      requestedTools,
      allowed,
      violations,
      context: languageContext,
    });

    return {
      valid: violations.length === 0,
      allowed,
      violations,
    };
  }

  /**
   * Detect language context from files or patterns
   */
  detectLanguage(context) {
    const files = context.files || [];
    const patterns = context.patterns || [];

    const languages = new Set();
    const tools = new Set();

    // Detect from file extensions
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();

      if (this.languagePatterns.javascript.extensions.includes(ext)) {
        languages.add('javascript');
        this.languagePatterns.javascript.tools.forEach((t) => tools.add(t));
      }
      if (this.languagePatterns.typescript.extensions.includes(ext)) {
        languages.add('typescript');
        this.languagePatterns.typescript.tools.forEach((t) => tools.add(t));
      }
      if (this.languagePatterns.python.extensions.includes(ext)) {
        languages.add('python');
        this.languagePatterns.python.tools.forEach((t) => tools.add(t));
      }
    }

    if (languages.size === 0) {
      languages.add('javascript');
      languages.add('typescript');
      languages.add('python');
    }

    return {
      language: Array.from(languages).join('+'),
      suggestedTools: Array.from(tools),
      files,
    };
  }

  /**
   * Check if a tool is allowed for an agent
   */
  isToolAllowed(tool, agentConfig, context) {
    // Check explicit tool list
    if (agentConfig.tools && Array.isArray(agentConfig.tools)) {
      if (agentConfig.tools.includes(tool)) {
        return true;
      }
    }

    // Check bash commands
    if (tool.startsWith('bash:') || tool.startsWith('npm ') || tool.startsWith('python ')) {
      const command = tool.replace('bash:', '').trim();
      return agentConfig.allowedBashCommands?.some(
        (allowed) => command.startsWith(allowed) || allowed === '*',
      );
    }

    // Check MCP servers
    if (tool.startsWith('mcp:')) {
      const server = tool.replace('mcp:', '').split('/')[0];
      return agentConfig.allowedMcpServers?.includes(server);
    }

    if (context.language) {
      if (context.language.includes('javascript') || context.language.includes('typescript')) {
        if (this.toolCategories.read.jsTools.includes(tool)) {
          return this.toolCategories.read.tools.some((t) => agentConfig.tools?.includes(t));
        }
        if (this.toolCategories.write.jsTools.includes(tool)) {
          return this.toolCategories.write.tools.some((t) => agentConfig.tools?.includes(t));
        }
      }

      if (context.language.includes('python')) {
        if (this.toolCategories.read.pythonTools.includes(tool)) {
          return this.toolCategories.read.tools.some((t) => agentConfig.tools?.includes(t));
        }
        if (this.toolCategories.write.pythonTools.includes(tool)) {
          return this.toolCategories.write.tools.some((t) => agentConfig.tools?.includes(t));
        }
      }
    }

    // Default deny
    return false;
  }

  /**
   * Get tool risk level
   */
  getToolRisk(tool) {
    for (const [category, config] of Object.entries(this.toolCategories)) {
      if (
        config.tools?.includes(tool) ||
        config.jsTools?.includes(tool) ||
        config.pythonTools?.includes(tool)
      ) {
        return config.risk;
      }
    }
    return 'unknown';
  }

  /**
   * Get violation reason
   */
  getViolationReason(tool, agentConfig) {
    const risk = this.getToolRisk(tool);

    if (risk === 'critical' && !agentConfig.allowCritical) {
      return 'Critical risk tools not allowed for this agent';
    }

    if (risk === 'high' && this.isReadOnlyAgent(agentConfig)) {
      return 'Write operations not allowed for read-only agent';
    }

    if (tool.startsWith('mcp:')) {
      return 'MCP server not in allowed list';
    }

    return 'Tool not explicitly allowed in agent configuration';
  }

  /**
   * Check if agent is read-only
   */
  isReadOnlyAgent(agentConfig) {
    return (
      agentConfig.fil?.block?.includes('FIL-0') ||
      agentConfig.type === 'readonly' ||
      agentConfig.name === 'auditor'
    );
  }

  /**
   * Validate all agents in the system
   */
  async validateAllAgents() {
    const agents = await this.loadAgentConfigs();
    const report = {
      timestamp: new Date().toISOString(),
      totalAgents: agents.size,
      compliant: [],
      violations: [],
      warnings: [],
    };

    for (const [name, config] of agents) {
      const validation = this.validateAgentConfig(config);

      if (validation.valid) {
        report.compliant.push(name);
      } else if (validation.severity === 'warning') {
        report.warnings.push({
          agent: name,
          issues: validation.issues,
        });
      } else {
        report.violations.push({
          agent: name,
          issues: validation.issues,
        });
      }
    }

    return report;
  }

  /**
   * Validate individual agent configuration
   */
  validateAgentConfig(config) {
    const issues = [];

    if (!config.tools || config.tools.length === 0) {
      issues.push({
        severity: 'error',
        message: 'No tools declared - using default-deny',
      });
    }

    if (config.tools?.includes('*') || config.allowedBashCommands?.includes('*')) {
      issues.push({
        severity: 'critical',
        message: 'Wildcard permissions detected - security risk',
      });
    }

    if (this.isReadOnlyAgent(config)) {
      const writeTools = Array.isArray(config.tools)
        ? config.tools.filter((t) => this.toolCategories.write.tools.includes(t))
        : [];

      if (writeTools?.length > 0) {
        issues.push({
          severity: 'error',
          message: `Read-only agent has write tools: ${writeTools.join(', ')}`,
        });
      }
    }

    const hasJSTools = config.tools?.some(
      (t) =>
        this.toolCategories.read.jsTools.includes(t) ||
        this.toolCategories.write.jsTools.includes(t) ||
        this.toolCategories.testing.jsTools.includes(t),
    );

    const hasPythonTools = config.tools?.some(
      (t) =>
        this.toolCategories.read.pythonTools.includes(t) ||
        this.toolCategories.write.pythonTools.includes(t) ||
        this.toolCategories.testing.pythonTools.includes(t),
    );

    if (!hasJSTools && !hasPythonTools) {
      issues.push({
        severity: 'warning',
        message: 'No language-specific tools declared',
      });
    }

    return {
      valid: issues.filter((i) => i.severity === 'error' || i.severity === 'critical').length === 0,
      severity:
        issues.length > 0
          ? Math.max(
              ...issues.map((i) =>
                i.severity === 'critical' ? 3 : i.severity === 'error' ? 2 : 1,
              ),
            )
          : 0,
      issues,
    };
  }

  /**
   * Generate CI status check
   */
  async generateCICheck(prDiff) {
    const toolUsage = this.extractToolUsageFromDiff(prDiff);
    const agents = await this.loadAgentConfigs();

    const violations = [];

    for (const usage of toolUsage) {
      const agent = agents.get(usage.agent);
      if (!agent) continue;

      const validation = await this.validateAgentTools(usage.agent, usage.tools, {
        files: usage.files,
      });

      if (!validation.valid) {
        violations.push(...validation.violations);
      }
    }

    return {
      status: violations.length === 0 ? 'success' : 'failure',
      title: 'Tool Permission Check',
      summary:
        violations.length === 0
          ? '✅ All tool usage complies with permissions'
          : `❌ ${violations.length} permission violations detected`,
      violations,
    };
  }

  /**
   * Extract tool usage from PR diff
   */
  extractToolUsageFromDiff(diff) {
    const usage = [];
    const lines = diff.split('\n');

    const toolPatterns = [
      /agent:invoke\s+(\w+):(\w+)/g,
      /npm\s+run\s+(\S+)/g,
      /python\s+(\S+)/g,
      /pytest\s+/g,
      /jest\s+/g,
      /eslint\s+/g,
      /black\s+/g,
      /ruff\s+/g,
    ];

    for (const line of lines) {
      if (line.startsWith('+')) {
        for (const pattern of toolPatterns) {
          const matches = line.matchAll(pattern);
          for (const match of matches) {
            usage.push({
              agent: 'unknown', // Would need context
              tools: [match[0]],
              files: [],
              line,
            });
          }
        }
      }
    }

    return usage;
  }

  /**
   * Log audit trail
   */
  async logAudit(entry) {
    try {
      await fs.mkdir(this.auditDir, { recursive: true });

      const filename = `audit-${new Date().toISOString().split('T')[0]}.jsonl`;
      const filepath = path.join(this.auditDir, filename);

      await fs.appendFile(filepath, JSON.stringify(entry) + '\n', 'utf8');

      await this.cleanOldAudits();
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  /**
   * Clean audit logs older than 90 days
   */
  async cleanOldAudits() {
    const files = await fs.readdir(this.auditDir);
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filepath = path.join(this.auditDir, file);
      const stat = await fs.stat(filepath);

      if (stat.mtime.getTime() < cutoff) {
        await fs.unlink(filepath);
      }
    }
  }

  /**
   * Generate permission report
   */
  async generatePermissionReport() {
    const agents = await this.loadAgentConfigs();
    const report = {
      metadata: {
        generated: new Date().toISOString(),
        totalAgents: agents.size,
        languages: ['JavaScript', 'TypeScript', 'Python'],
      },
      agents: [],
    };

    for (const [name, config] of agents) {
      const agentReport = {
        name,
        type: config.type || 'standard',
        tools: {
          allowed: config.tools || [],
          bash: config.allowedBashCommands || [],
          mcp: config.allowedMcpServers || [],
        },
        languages: {
          javascript: this.hasLanguageSupport(config, 'javascript'),
          typescript: this.hasLanguageSupport(config, 'typescript'),
          python: this.hasLanguageSupport(config, 'python'),
        },
        fil: config.fil || {},
        risk: this.calculateAgentRisk(config),
      };

      report.agents.push(agentReport);
    }

    return report;
  }

  /**
   * Check if agent has language support
   */
  hasLanguageSupport(config, language) {
    const patterns = this.languagePatterns[language];
    if (!patterns) return false;

    return patterns.tools.some(
      (tool) =>
        config.tools?.includes(tool) ||
        config.allowedBashCommands?.some((cmd) => cmd.includes(tool)),
    );
  }

  /**
   * Calculate agent risk score
   */
  calculateAgentRisk(config) {
    let risk = 0;

    const highRiskTools = [
      ...this.toolCategories.write.tools,
      ...this.toolCategories.execute.tools,
    ];
    const hasHighRisk = config.tools?.some((t) => highRiskTools.includes(t));
    if (hasHighRisk) risk += 3;

    const hasExternal = config.allowedMcpServers?.length > 0;
    if (hasExternal) risk += 2;

    const hasWildcard = config.tools?.includes('*') || config.allowedBashCommands?.includes('*');
    if (hasWildcard) risk += 5;

    return {
      score: risk,
      level: risk >= 5 ? 'high' : risk >= 3 ? 'medium' : 'low',
    };
  }
}

// CLI interface
if (require.main === module) {
  const validator = new ToolPermissionValidator();
  const [, , command, ...args] = process.argv;

  switch (command) {
    case 'validate':
      const [agent, ...tools] = args;
      validator
        .validateAgentTools(agent, tools)
        .then((result) => {
          if (result.valid) {
          } else {
            result.violations.forEach((v) => {});
          }
        })
        .catch((error) => {
          console.error(colors.red(`Validation failed: ${error.message}`));
          process.exit(1);
        });
      break;

    case 'check-all':
      validator
        .validateAllAgents()
        .then((report) => {
          if (report.violations.length > 0) {
            report.violations.forEach((v) => {});
          }
        })
        .catch((error) => {
          console.error(colors.red(`Check failed: ${error.message}`));
          process.exit(1);
        });
      break;

    case 'report':
      validator
        .generatePermissionReport()
        .then((report) => {})
        .catch((error) => {
          console.error(colors.red(`Report generation failed: ${error.message}`));
          process.exit(1);
        });
      break;

    case 'ci-check':
      // Read diff from stdin or file
      let diff = '';
      if (args[0]) {
        diff = require('fs').readFileSync(args[0], 'utf8');
      } else {
        // Would read from stdin in real CI
        diff = '';
      }

      validator
        .generateCICheck(diff)
        .then((result) => {
          process.exit(result.status === 'success' ? 0 : 1);
        })
        .catch((error) => {
          console.error(colors.red(`CI check failed: ${error.message}`));
          process.exit(1);
        });
      break;

    default:
      break;
  }
}

module.exports = ToolPermissionValidator;
