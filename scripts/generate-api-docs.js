#!/usr/bin/env node

/**
 * API Documentation Generator
 *
 * Generates comprehensive API documentation from agent YAML specifications
 * Used by DOC-KEEPER agent
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const PROJECT_ROOT = path.join(__dirname, '..');
const AGENTS_DIR = path.join(PROJECT_ROOT, '.claude/agents');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'docs/api-reference');

// Ensure output directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Parse agent markdown file and extract YAML frontmatter
function parseAgentFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error(`No frontmatter found in ${filePath}`);
  }

  const frontmatter = yaml.parse(frontmatterMatch[1]);
  const description = content.substring(frontmatterMatch[0].length).trim();

  return { ...frontmatter, description };
}

// Generate agent API documentation
function generateAgentDocs(agent) {
  const { name, description, role, capabilities, tools, mcp_servers, loop_controls } = agent;

  let doc = `# ${name} API Reference\n\n`;
  doc += `## Overview\n\n`;
  doc += `**Role**: ${role || 'Not specified'}\n\n`;
  doc += `**Description**: ${description}\n\n`;

  // Capabilities
  if (capabilities && capabilities.length > 0) {
    doc += `## Capabilities\n\n`;
    capabilities.forEach((cap) => {
      doc += `- ${cap.replace(/_/g, ' ')}\n`;
    });
    doc += `\n`;
  }

  // Tools
  if (tools && tools.length > 0) {
    doc += `## Tools Available\n\n`;
    doc += `This agent has access to the following Claude Code tools:\n\n`;
    tools.forEach((tool) => {
      doc += `- **${tool}**: `;
      switch (tool) {
        case 'Read':
          doc += 'Read files from the filesystem\n';
          break;
        case 'Write':
          doc += 'Write files to the filesystem\n';
          break;
        case 'Edit':
          doc += 'Edit existing files\n';
          break;
        case 'Bash':
          doc += 'Execute bash commands\n';
          break;
        case 'Grep':
          doc += 'Search for patterns in files\n';
          break;
        case 'Glob':
          doc += 'Find files matching patterns\n';
          break;
        default:
          doc += 'Specialized tool\n';
      }
    });
    doc += `\n`;
  }

  // MCP Servers
  if (mcp_servers && mcp_servers.length > 0) {
    doc += `## MCP Server Integration\n\n`;
    doc += `This agent integrates with the following MCP servers:\n\n`;
    mcp_servers.forEach((server) => {
      doc += `- **${server}**: `;
      switch (server) {
        case 'linear-server':
          doc += 'Linear.app task management\n';
          break;
        case 'sequential-thinking':
          doc += 'Complex reasoning and planning\n';
          break;
        case 'context7':
          doc += 'Documentation and code understanding\n';
          break;
        case 'playwright':
          doc += 'Browser automation and E2E testing\n';
          break;
        case 'kubernetes':
          doc += 'Kubernetes cluster management\n';
          break;
        case 'timeserver':
          doc += 'Time and scheduling operations\n';
          break;
        default:
          doc += 'MCP server integration\n';
      }
    });
    doc += `\n`;
  }

  // Loop Controls
  if (loop_controls) {
    doc += `## Loop Controls & Limits\n\n`;
    doc += `This agent operates with the following constraints:\n\n`;

    if (loop_controls.max_iterations) {
      doc += `- **Max Iterations**: ${loop_controls.max_iterations}\n`;
    }
    if (loop_controls.max_time_seconds) {
      doc += `- **Max Time**: ${loop_controls.max_time_seconds} seconds (${Math.round(loop_controls.max_time_seconds / 60)} minutes)\n`;
    }
    if (loop_controls.max_cost_tokens) {
      doc += `- **Max Tokens**: ${loop_controls.max_cost_tokens.toLocaleString()}\n`;
    }

    if (loop_controls.success_criteria && loop_controls.success_criteria.length > 0) {
      doc += `\n**Success Criteria**:\n\n`;
      loop_controls.success_criteria.forEach((criterion) => {
        doc += `- ${criterion}\n`;
      });
    }

    if (loop_controls.ground_truth_checks && loop_controls.ground_truth_checks.length > 0) {
      doc += `\n**Ground Truth Validation**:\n\n`;
      loop_controls.ground_truth_checks.forEach((check) => {
        doc += `- Verify via **${check.tool}**: ${check.verify || check.command || check.file}\n`;
      });
    }

    doc += `\n`;
  }

  // Usage examples
  doc += `## Usage\n\n`;
  doc += `### Via Slash Command\n\n`;
  doc += `\`\`\`bash\n`;
  doc += `/${name.toLowerCase().replace(/_/g, '-')} <operation> [options]\n`;
  doc += `\`\`\`\n\n`;

  doc += `### Via Makefile\n\n`;
  doc += `\`\`\`bash\n`;
  doc += `make ${name.toLowerCase().replace(/_/g, '-')}\n`;
  doc += `\`\`\`\n\n`;

  doc += `### Via Agent CLI\n\n`;
  doc += `\`\`\`bash\n`;
  doc += `node .claude/cli.js invoke ${name} <command> [args]\n`;
  doc += `\`\`\`\n\n`;

  // Related documentation
  doc += `## Related Documentation\n\n`;
  doc += `- [Agent Specification](./.claude/agents/${name.toLowerCase().replace(/_/g, '-')}.md)\n`;
  doc += `- [System Architecture](./docs/ARCHITECTURE-AGENTS.md)\n`;
  doc += `- [Complete Agent Catalog](./.claude/agents/CLAUDE.md)\n\n`;

  return doc;
}

// Generate index page
function generateIndexDocs(agents) {
  let doc = `# API Reference\n\n`;
  doc += `Complete API documentation for all ${agents.length} agents in the Linear TDD Workflow System.\n\n`;

  doc += `## Quick Navigation\n\n`;

  // Group agents by category
  const categories = {
    'Core Workflow': [],
    Development: [],
    Infrastructure: [],
    'Quality Engineering': [],
    'Monitoring & Security': [],
  };

  agents.forEach((agent) => {
    const name = agent.name;
    if (['AUDITOR', 'EXECUTOR', 'GUARDIAN', 'STRATEGIST', 'SCHOLAR', 'PLANNER'].includes(name)) {
      categories['Core Workflow'].push(agent);
    } else if (['DJANGO-PRO', 'PYTHON-PRO', 'TYPESCRIPT-PRO'].includes(name)) {
      categories['Development'].push(agent);
    } else if (
      ['KUBERNETES-ARCHITECT', 'DEPLOYMENT-ENGINEER', 'DATABASE-OPTIMIZER'].includes(name)
    ) {
      categories['Infrastructure'].push(agent);
    } else if (
      [
        'CODE-REVIEWER',
        'TEST-AUTOMATOR',
        'LEGACY-MODERNIZER',
        'TESTER',
        'VALIDATOR',
        'LINTER',
        'TYPECHECKER',
      ].includes(name)
    ) {
      categories['Quality Engineering'].push(agent);
    } else {
      categories['Monitoring & Security'].push(agent);
    }
  });

  Object.entries(categories).forEach(([category, agentList]) => {
    if (agentList.length === 0) return;

    doc += `### ${category}\n\n`;
    agentList.forEach((agent) => {
      const filename = agent.name.toLowerCase().replace(/_/g, '-');
      doc += `- [**${agent.name}**](./agents/${filename}.md) - ${agent.role || agent.description?.split('.')[0]}\n`;
    });
    doc += `\n`;
  });

  // Tool matrix
  doc += `## Tool Usage Matrix\n\n`;
  doc += `This matrix shows which tools each agent uses:\n\n`;
  doc += `| Agent | Read | Write | Edit | Bash | Grep | Glob |\n`;
  doc += `|-------|------|-------|------|------|------|------|\n`;

  agents.forEach((agent) => {
    const filename = agent.name.toLowerCase().replace(/_/g, '-');
    doc += `| [${agent.name}](./agents/${filename}.md) `;
    ['Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob'].forEach((tool) => {
      doc += `| ${agent.tools?.includes(tool) ? '✓' : ''} `;
    });
    doc += `|\n`;
  });

  doc += `\n## MCP Server Integration Matrix\n\n`;
  doc += `This matrix shows which MCP servers each agent uses:\n\n`;

  const allMcpServers = [...new Set(agents.flatMap((a) => a.mcp_servers || []))].sort();
  doc += `| Agent | ${allMcpServers.join(' | ')} |\n`;
  doc += `|-------|${allMcpServers.map(() => '---').join('|')}|\n`;

  agents.forEach((agent) => {
    const filename = agent.name.toLowerCase().replace(/_/g, '-');
    doc += `| [${agent.name}](./agents/${filename}.md) `;
    allMcpServers.forEach((server) => {
      doc += `| ${agent.mcp_servers?.includes(server) ? '✓' : ''} `;
    });
    doc += `|\n`;
  });

  doc += `\n## Performance Characteristics\n\n`;
  doc += `| Agent | Max Iterations | Max Time | Max Tokens |\n`;
  doc += `|-------|----------------|----------|------------|\n`;

  agents.forEach((agent) => {
    const filename = agent.name.toLowerCase().replace(/_/g, '-');
    const lc = agent.loop_controls || {};
    doc += `| [${agent.name}](./agents/${filename}.md) `;
    doc += `| ${lc.max_iterations || 'N/A'} `;
    doc += `| ${lc.max_time_seconds ? Math.round(lc.max_time_seconds / 60) + ' min' : 'N/A'} `;
    doc += `| ${lc.max_cost_tokens ? lc.max_cost_tokens / 1000 + 'k' : 'N/A'} |\n`;
  });

  return doc;
}

// Main execution
function main() {
  console.log('🔨 Generating API documentation from agent specifications...\n');

  // Ensure output directories exist
  ensureDir(OUTPUT_DIR);
  ensureDir(path.join(OUTPUT_DIR, 'agents'));

  // Find all agent files
  const agentFiles = fs
    .readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith('.md') && f !== 'index.md' && f !== 'CLAUDE.md' && !f.startsWith('.'))
    .map((f) => path.join(AGENTS_DIR, f));

  console.log(`Found ${agentFiles.length} agent specification files\n`);

  // Parse all agents
  const agents = agentFiles
    .map((file) => {
      try {
        const agent = parseAgentFile(file);
        console.log(`✓ Parsed ${agent.name}`);
        return agent;
      } catch (error) {
        console.error(`✗ Error parsing ${file}:`, error.message);
        return null;
      }
    })
    .filter(Boolean);

  console.log(`\n📝 Generating documentation for ${agents.length} agents...\n`);

  // Generate individual agent docs
  agents.forEach((agent) => {
    const filename = agent.name.toLowerCase().replace(/_/g, '-');
    const outputPath = path.join(OUTPUT_DIR, 'agents', `${filename}.md`);
    const doc = generateAgentDocs(agent);
    fs.writeFileSync(outputPath, doc, 'utf8');
    console.log(`✓ Generated ${outputPath}`);
  });

  // Generate index
  const indexPath = path.join(OUTPUT_DIR, 'index.md');
  const indexDoc = generateIndexDocs(agents);
  fs.writeFileSync(indexPath, indexDoc, 'utf8');
  console.log(`✓ Generated ${indexPath}`);

  console.log(`\n✅ API documentation generation complete!`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log(`   Files: ${agents.length + 1} (${agents.length} agents + index)`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { parseAgentFile, generateAgentDocs, generateIndexDocs };
