#!/usr/bin/env node

/**
 * Project Detector
 *
 * Auto-detects Linear workspace configuration and provides
 * intelligent setup assistance. NO HARDCODED VALUES.
 */

const fs = require('fs');
const path = require('path');

class ProjectDetector {
  constructor() {
    this.projectRoot = process.cwd();
    this.cache = new Map();
  }

  /**
   * Detect Linear workspace information via API
   */
  async detectLinearWorkspace() {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      return {
        configured: false,
        error: 'LINEAR_API_KEY not set',
        recommendations: ['Set LINEAR_API_KEY environment variable'],
      };
    }

    try {
      // Query Linear API for workspace information
      const query = `
                query {
                    viewer {
                        organization {
                            name
                            urlKey
                        }
                    }
                    teams {
                        nodes {
                            id
                            name
                            key
                            description
                        }
                    }
                    projects {
                        nodes {
                            id
                            name
                            description
                            teams {
                                nodes {
                                    id
                                    name
                                }
                            }
                        }
                    }
                }
            `;

      const response = await this.queryLinearAPI(query);

      if (response.errors) {
        return {
          configured: false,
          error: 'Linear API error: ' + response.errors[0].message,
          recommendations: ['Check your LINEAR_API_KEY is valid'],
        };
      }

      return {
        configured: true,
        organization: response.data.viewer.organization,
        teams: response.data.teams.nodes,
        projects: response.data.projects.nodes,
        recommendations: this.generateWorkspaceRecommendations(response.data),
      };
    } catch (error) {
      return {
        configured: false,
        error: error.message,
        recommendations: ['Check network connectivity and API key validity'],
      };
    }
  }

  /**
   * Query Linear GraphQL API
   */
  async queryLinearAPI(query, variables = {}) {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINEAR_API_KEY}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Generate recommendations based on workspace data
   */
  generateWorkspaceRecommendations(data) {
    const recommendations = [];

    // Team recommendations
    if (data.teams.nodes.length === 1) {
      recommendations.push(
        `Auto-detected team: ${data.teams.nodes[0].name} (${data.teams.nodes[0].key})`,
      );
      recommendations.push(`Set LINEAR_TEAM_ID=${data.teams.nodes[0].id}`);
    } else if (data.teams.nodes.length > 1) {
      recommendations.push('Multiple teams found. Choose one:');
      data.teams.nodes.forEach((team) => {
        recommendations.push(`  - ${team.name} (${team.key}): LINEAR_TEAM_ID=${team.id}`);
      });
    }

    // Project recommendations
    if (data.projects.nodes.length > 0) {
      recommendations.push('Available projects:');
      data.projects.nodes.forEach((project) => {
        const teamNames = project.teams.nodes.map((t) => t.name).join(', ');
        recommendations.push(
          `  - ${project.name} (Teams: ${teamNames}): LINEAR_PROJECT_ID=${project.id}`,
        );
      });
    }

    return recommendations;
  }

  /**
   * Detect task prefix from existing Linear tasks
   */
  async detectTaskPrefix(teamId) {
    if (!teamId) {
      throw new Error('Team ID required for task prefix detection');
    }

    try {
      const query = `
                query($teamId: String!) {
                    team(id: $teamId) {
                        issues(first: 50, orderBy: createdAt) {
                            nodes {
                                identifier
                                title
                            }
                        }
                    }
                }
            `;

      const response = await this.queryLinearAPI(query, { teamId });

      if (response.errors) {
        throw new Error('Failed to fetch team issues: ' + response.errors[0].message);
      }

      const issues = response.data.team.issues.nodes;
      const prefixes = new Map();

      // Analyze existing issue identifiers
      issues.forEach((issue) => {
        const match = issue.identifier.match(/^([A-Z]+)-/);
        if (match) {
          const prefix = match[1] + '-';
          prefixes.set(prefix, (prefixes.get(prefix) || 0) + 1);
        }
      });

      if (prefixes.size === 0) {
        return {
          detected: false,
          recommendation: 'No existing tasks found. Consider using: TASK-, DEV-, or PROJECT-',
        };
      }

      // Find most common prefix
      const mostCommon = Array.from(prefixes.entries()).sort((a, b) => b[1] - a[1])[0];

      return {
        detected: true,
        prefix: mostCommon[0],
        confidence: mostCommon[1] / issues.length,
        alternatives: Array.from(prefixes.keys()).filter((p) => p !== mostCommon[0]),
        recommendation: `Detected common prefix: ${mostCommon[0]} (used in ${mostCommon[1]}/${issues.length} tasks)`,
      };
    } catch (error) {
      return {
        detected: false,
        error: error.message,
        recommendation: 'Unable to detect prefix. Use default: TASK-',
      };
    }
  }

  /**
   * Detect project type and characteristics
   */
  detectProjectType() {
    const characteristics = {
      languages: [],
      frameworks: [],
      testFrameworks: [],
      buildTools: [],
      hasCI: false,
      hasTests: false,
      projectSize: 'small',
    };

    // Language detection
    if (fs.existsSync(path.join(this.projectRoot, 'package.json'))) {
      characteristics.languages.push('javascript');
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'),
      );

      // Framework detection
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (deps.react) characteristics.frameworks.push('react');
      if (deps.vue) characteristics.frameworks.push('vue');
      if (deps.angular || deps['@angular/core']) characteristics.frameworks.push('angular');
      if (deps.express) characteristics.frameworks.push('express');
      if (deps.next) characteristics.frameworks.push('next');

      // Test framework detection
      if (deps.jest) characteristics.testFrameworks.push('jest');
      if (deps.mocha) characteristics.testFrameworks.push('mocha');
      if (deps.vitest) characteristics.testFrameworks.push('vitest');
      if (deps.cypress) characteristics.testFrameworks.push('cypress');
      if (deps.playwright) characteristics.testFrameworks.push('playwright');

      // TypeScript detection
      if (deps.typescript || fs.existsSync(path.join(this.projectRoot, 'tsconfig.json'))) {
        characteristics.languages.push('typescript');
      }
    }

    if (
      fs.existsSync(path.join(this.projectRoot, 'pyproject.toml')) ||
      fs.existsSync(path.join(this.projectRoot, 'requirements.txt')) ||
      fs.existsSync(path.join(this.projectRoot, 'setup.py'))
    ) {
      characteristics.languages.push('python');

      // Python framework detection
      if (fs.existsSync(path.join(this.projectRoot, 'manage.py'))) {
        characteristics.frameworks.push('django');
      }

      try {
        const requirementsFiles = ['requirements.txt', 'pyproject.toml'];
        for (const file of requirementsFiles) {
          const filePath = path.join(this.projectRoot, file);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('fastapi')) characteristics.frameworks.push('fastapi');
            if (content.includes('flask')) characteristics.frameworks.push('flask');
            if (content.includes('pytest')) characteristics.testFrameworks.push('pytest');
            if (content.includes('unittest')) characteristics.testFrameworks.push('unittest');
          }
        }
      } catch (error) {
        // Ignore file read errors
      }
    }

    // CI detection
    const ciFiles = [
      '.github/workflows',
      '.gitlab-ci.yml',
      'Jenkinsfile',
      '.circleci/config.yml',
      '.travis.yml',
    ];
    characteristics.hasCI = ciFiles.some((file) =>
      fs.existsSync(path.join(this.projectRoot, file)),
    );

    // Test detection
    const testDirs = ['test', 'tests', '__tests__', 'spec'];
    characteristics.hasTests =
      testDirs.some((dir) => fs.existsSync(path.join(this.projectRoot, dir))) ||
      characteristics.testFrameworks.length > 0;

    // Project size estimation
    try {
      const srcFiles = this.countSourceFiles();
      if (srcFiles > 1000) characteristics.projectSize = 'large';
      else if (srcFiles > 100) characteristics.projectSize = 'medium';
      else characteristics.projectSize = 'small';
    } catch (error) {
      // Keep default 'small'
    }

    return characteristics;
  }

  /**
   * Count source files for project size estimation
   */
  countSourceFiles() {
    const extensions = ['.js', '.ts', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.cs'];
    let count = 0;

    function walk(dir) {
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            walk(filePath);
          } else if (extensions.some((ext) => file.endsWith(ext))) {
            count++;
          }
        }
      } catch (error) {
        // Ignore permission errors
      }
    }

    walk(this.projectRoot);
    return count;
  }

  /**
   * Generate recommended Linear configuration based on project analysis
   */
  async generateRecommendedConfig() {
    const projectType = this.detectProjectType();
    const linearInfo = await this.detectLinearWorkspace();

    const recommendations = {
      project: projectType,
      linear: linearInfo,
      config: {
        taskPrefix: this.recommendTaskPrefix(projectType),
        labels: this.recommendLabels(projectType),
        templates: this.recommendTemplates(projectType),
        qualitySettings: this.recommendQualitySettings(projectType),
      },
    };

    // Add task prefix detection if Linear is configured
    if (linearInfo.configured && linearInfo.teams.length === 1) {
      const prefixInfo = await this.detectTaskPrefix(linearInfo.teams[0].id);
      recommendations.taskPrefix = prefixInfo;
    }

    return recommendations;
  }

  /**
   * Recommend task prefix based on project characteristics
   */
  recommendTaskPrefix(projectType) {
    if (projectType.frameworks.includes('react') || projectType.frameworks.includes('vue')) {
      return 'UI-';
    } else if (
      projectType.frameworks.includes('express') ||
      projectType.frameworks.includes('fastapi')
    ) {
      return 'API-';
    } else if (projectType.languages.includes('python')) {
      return 'PY-';
    } else if (
      projectType.languages.includes('javascript') ||
      projectType.languages.includes('typescript')
    ) {
      return 'JS-';
    } else {
      return 'TASK-';
    }
  }

  /**
   * Recommend labels based on project characteristics
   */
  recommendLabels(projectType) {
    const labels = ['tdd', 'automated'];

    // Add language-specific labels
    labels.push(...projectType.languages);

    // Add framework-specific labels
    if (projectType.frameworks.length > 0) {
      labels.push(projectType.frameworks[0]); // Primary framework
    }

    // Add testing labels
    if (projectType.hasTests) {
      labels.push('testing');
    }

    if (projectType.hasCI) {
      labels.push('ci-cd');
    }

    return labels;
  }

  /**
   * Recommend templates based on project characteristics
   */
  recommendTemplates(projectType) {
    const templates = {
      coverage: 'coverage-gap',
      tdd: 'tdd-violation',
      bug: 'bug-fix',
      default: 'generic',
    };

    // Customize based on project type
    if (projectType.frameworks.includes('react')) {
      templates.component = 'react-component';
    } else if (projectType.frameworks.includes('fastapi')) {
      templates.endpoint = 'api-endpoint';
    }

    return templates;
  }

  /**
   * Recommend quality settings based on project characteristics
   */
  recommendQualitySettings(projectType) {
    return {
      duplicateThreshold: projectType.projectSize === 'large' ? 0.8 : 0.7,
      titleSimilarity: 0.8,
      autoMerge: false, // Always false for safety
      requireDescription: true,
      minDescriptionLength: projectType.projectSize === 'large' ? 100 : 50,
    };
  }

  /**
   * Interactive setup wizard
   */
  async runSetupWizard() {
    console.log('🔍 Analyzing project and Linear workspace...\n');

    const recommendations = await this.generateRecommendedConfig();

    console.log('📊 Project Analysis:');
    console.log(`  Languages: ${recommendations.project.languages.join(', ') || 'None detected'}`);
    console.log(
      `  Frameworks: ${recommendations.project.frameworks.join(', ') || 'None detected'}`,
    );
    console.log(
      `  Test Frameworks: ${recommendations.project.testFrameworks.join(', ') || 'None detected'}`,
    );
    console.log(`  Has CI/CD: ${recommendations.project.hasCI ? 'Yes' : 'No'}`);
    console.log(`  Project Size: ${recommendations.project.projectSize}`);

    console.log('\n📋 Linear Integration:');
    if (recommendations.linear.configured) {
      console.log(`  Organization: ${recommendations.linear.organization.name}`);
      console.log(`  Teams: ${recommendations.linear.teams.length}`);
      console.log(`  Projects: ${recommendations.linear.projects.length}`);
    } else {
      console.log(`  Status: Not configured - ${recommendations.linear.error}`);
    }

    console.log('\n💡 Recommendations:');
    console.log(`  Task Prefix: ${recommendations.config.taskPrefix}`);
    console.log(`  Labels: ${recommendations.config.labels.join(', ')}`);
    console.log(
      `  Quality Threshold: ${recommendations.config.qualitySettings.duplicateThreshold}`,
    );

    if (recommendations.linear.recommendations) {
      console.log('\n🔧 Linear Setup:');
      recommendations.linear.recommendations.forEach((rec) => {
        console.log(`  ${rec}`);
      });
    }

    return recommendations;
  }
}

// CLI interface
if (require.main === module) {
  const detector = new ProjectDetector();
  const args = process.argv.slice(2);
  const command = args[0];

  async function run() {
    try {
      switch (command) {
        case 'analyze':
          const analysis = detector.detectProjectType();
          console.log(JSON.stringify(analysis, null, 2));
          break;

        case 'linear':
          const linearInfo = await detector.detectLinearWorkspace();
          console.log(JSON.stringify(linearInfo, null, 2));
          break;

        case 'prefix':
          const teamId = args[1];
          if (!teamId) {
            console.error('Team ID required: node project-detector.js prefix TEAM_ID');
            process.exit(1);
          }
          const prefixInfo = await detector.detectTaskPrefix(teamId);
          console.log(JSON.stringify(prefixInfo, null, 2));
          break;

        case 'wizard':
          await detector.runSetupWizard();
          break;

        case 'recommend':
          const recommendations = await detector.generateRecommendedConfig();
          console.log(JSON.stringify(recommendations, null, 2));
          break;

        default:
          console.log(`
Project Detector - Auto-configuration for Linear TDD Workflow

Usage:
  node project-detector.js analyze    - Analyze current project
  node project-detector.js linear     - Check Linear workspace
  node project-detector.js prefix ID  - Detect task prefix for team
  node project-detector.js wizard     - Run interactive setup
  node project-detector.js recommend  - Generate recommended config

Examples:
  node project-detector.js wizard
  node project-detector.js prefix team_abc123
                    `);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  run();
}

module.exports = { ProjectDetector };
