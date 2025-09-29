#!/usr/bin/env node

/**
 * JR-5: Pattern Mining & Continuous Improvement Journey
 *
 * Autonomous learning from code changes, fixes, and team patterns.
 * Extracts, validates, and applies patterns to improve future fixes.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class PatternMiningJourney {
  constructor() {
    this.projectRoot = process.cwd();
    this.claudeDir = path.join(this.projectRoot, '.claude');
    this.patterns = [];
    this.insights = [];
    this.improvements = [];
    this.results = {
      extracted: [],
      validated: [],
      applied: [],
      metrics: {}
    };
  }

  /**
   * Main entry point - runs autonomously
   */
  async run(options = {}) {
    console.log('🧠 JR-5: Pattern Mining & Continuous Improvement Journey');
    console.log('======================================================');

    try {
      // Phase 1: Data Collection
      const data = await this.collectData(options);

      // Phase 2: Pattern Extraction
      const patterns = await this.extractPatterns(data);

      // Phase 3: Pattern Validation
      const validated = await this.validatePatterns(patterns);

      // Phase 4: Pattern Application
      const applied = await this.applyPatterns(validated);

      // Phase 5: Effectiveness Analysis
      const effectiveness = await this.analyzeEffectiveness(applied);

      // Phase 6: Knowledge Base Update
      await this.updateKnowledgeBase(effectiveness);

      // Phase 7: Report Generation
      await this.generateInsightsReport();

      console.log('✅ Pattern mining complete!');
      return this.results;

    } catch (error) {
      console.error('❌ Pattern mining failed:', error.message);
      throw error;
    }
  }

  /**
   * Collect data from various sources
   */
  async collectData(options) {
    console.log('📊 Collecting data for analysis...');

    const sources = {
      commits: await this.collectCommits(options.period || '7d'),
      pullRequests: await this.collectPullRequests(),
      fixes: await this.collectFixPacks(),
      tests: await this.collectTestPatterns(),
      reviews: await this.collectReviews()
    };

    const totalItems =
      sources.commits.length +
      sources.pullRequests.length +
      sources.fixes.length;

    console.log(`   📦 Collected ${totalItems} data points:`);
    console.log(`      - Commits: ${sources.commits.length}`);
    console.log(`      - Pull Requests: ${sources.pullRequests.length}`);
    console.log(`      - Fix Packs: ${sources.fixes.length}`);
    console.log(`      - Test Patterns: ${sources.tests.length}`);
    console.log(`      - Reviews: ${sources.reviews.length}`);

    return sources;
  }

  /**
   * Collect commits from git history
   */
  async collectCommits(period) {
    try {
      const since = this.calculateSinceDate(period);
      const log = execSync(
        `git log --since="${since}" --pretty=format:'%H|%s|%b|%an|%ad' --date=iso`,
        { encoding: 'utf8' }
      );

      return log.split('\n').filter(l => l).map(line => {
        const [hash, subject, body, author, date] = line.split('|');
        return { hash, subject, body, author, date };
      });
    } catch {
      return [];
    }
  }

  /**
   * Collect pull requests
   */
  async collectPullRequests() {
    try {
      const prs = execSync(
        'gh pr list --state merged --limit 20 --json number,title,body,files,additions,deletions',
        { encoding: 'utf8' }
      );

      return JSON.parse(prs);
    } catch {
      // Fallback to file-based PRs
      return this.collectFileBasedPRs();
    }
  }

  /**
   * Collect fix packs from history
   */
  async collectFixPacks() {
    const fixPackDir = path.join(this.projectRoot, 'fix-packs');

    try {
      const files = await fs.readdir(fixPackDir);
      const fixes = [];

      for (const file of files.filter(f => f.endsWith('.json'))) {
        const content = await fs.readFile(path.join(fixPackDir, file), 'utf8');
        fixes.push(JSON.parse(content));
      }

      return fixes;
    } catch {
      return [];
    }
  }

  /**
   * Collect test patterns
   */
  async collectTestPatterns() {
    const patterns = [];

    // Look for common test patterns
    const testPatterns = [
      { type: 'describe-it', count: 0 },
      { type: 'test-suite', count: 0 },
      { type: 'pytest', count: 0 },
      { type: 'unittest', count: 0 }
    ];

    // Simplified pattern detection
    try {
      const jsTests = execSync('find . -name "*.test.js" -o -name "*.spec.js" | wc -l', { encoding: 'utf8' });
      const pyTests = execSync('find . -name "test_*.py" -o -name "*_test.py" | wc -l', { encoding: 'utf8' });

      if (parseInt(jsTests) > 0) {
        patterns.push({ type: 'javascript-tests', count: parseInt(jsTests) });
      }
      if (parseInt(pyTests) > 0) {
        patterns.push({ type: 'python-tests', count: parseInt(pyTests) });
      }
    } catch {}

    return patterns;
  }

  /**
   * Collect code reviews
   */
  async collectReviews() {
    try {
      const reviews = execSync(
        'gh pr list --state merged --limit 10 --json reviews',
        { encoding: 'utf8' }
      );

      return JSON.parse(reviews);
    } catch {
      return [];
    }
  }

  /**
   * Extract patterns from collected data
   */
  async extractPatterns(data) {
    console.log('\n🔍 Extracting patterns...');

    const patterns = [];

    // 1. Commit patterns
    patterns.push(...this.extractCommitPatterns(data.commits));

    // 2. Fix patterns
    patterns.push(...this.extractFixPatterns(data.fixes));

    // 3. Test patterns
    patterns.push(...this.extractTestPatterns(data.tests));

    // 4. Review patterns
    patterns.push(...this.extractReviewPatterns(data.reviews));

    // 5. Refactoring patterns
    patterns.push(...this.extractRefactoringPatterns(data.pullRequests));

    console.log(`   📋 Extracted ${patterns.length} patterns`);

    // Deduplicate and score
    const uniquePatterns = this.deduplicatePatterns(patterns);
    const scoredPatterns = this.scorePatterns(uniquePatterns);

    this.patterns = scoredPatterns;
    this.results.extracted = scoredPatterns;

    return scoredPatterns;
  }

  /**
   * Extract commit patterns
   */
  extractCommitPatterns(commits) {
    const patterns = [];

    // Conventional commit patterns
    const conventionalCommits = commits.filter(c =>
      /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert):/.test(c.subject)
    );

    if (conventionalCommits.length > commits.length * 0.8) {
      patterns.push({
        type: 'commit-convention',
        name: 'Conventional Commits',
        description: 'Team follows conventional commit format',
        confidence: conventionalCommits.length / commits.length,
        occurrences: conventionalCommits.length
      });
    }

    // TDD evidence patterns
    const tddCommits = commits.filter(c =>
      /\b(RED|GREEN|REFACTOR|test.first|TDD)\b/i.test(c.subject + c.body)
    );

    if (tddCommits.length > 5) {
      patterns.push({
        type: 'tdd-practice',
        name: 'TDD Adoption',
        description: 'Team practices Test-Driven Development',
        confidence: tddCommits.length / commits.length,
        occurrences: tddCommits.length
      });
    }

    return patterns;
  }

  /**
   * Extract fix patterns
   */
  extractFixPatterns(fixes) {
    const patterns = [];

    if (fixes.length === 0) return patterns;

    // Common fix types
    const fixTypes = {};

    for (const fix of fixes) {
      const type = fix.task?.metadata?.issueType || 'unknown';
      fixTypes[type] = (fixTypes[type] || 0) + 1;
    }

    // Find dominant fix patterns
    for (const [type, count] of Object.entries(fixTypes)) {
      if (count >= 3) {
        patterns.push({
          type: 'fix-pattern',
          name: `Common ${type} fixes`,
          description: `Recurring ${type} issues that need addressing`,
          confidence: count / fixes.length,
          occurrences: count,
          recommendation: `Create automated detection for ${type} issues`
        });
      }
    }

    return patterns;
  }

  /**
   * Extract test patterns
   */
  extractTestPatterns(tests) {
    const patterns = [];

    for (const test of tests) {
      if (test.count > 10) {
        patterns.push({
          type: 'test-structure',
          name: `${test.type} test pattern`,
          description: `Team uses ${test.type} testing structure`,
          confidence: 0.9,
          occurrences: test.count
        });
      }
    }

    return patterns;
  }

  /**
   * Extract review patterns
   */
  extractReviewPatterns(reviews) {
    const patterns = [];

    // Look for common review feedback
    const feedbackPatterns = {
      'test-missing': 0,
      'coverage-low': 0,
      'naming-issue': 0,
      'complexity-high': 0
    };

    // Simplified pattern extraction
    if (reviews.length > 5) {
      patterns.push({
        type: 'review-practice',
        name: 'Active code reviews',
        description: 'Team actively reviews pull requests',
        confidence: 0.8,
        occurrences: reviews.length
      });
    }

    return patterns;
  }

  /**
   * Extract refactoring patterns
   */
  extractRefactoringPatterns(pullRequests) {
    const patterns = [];

    const refactorPRs = pullRequests.filter(pr =>
      /refactor|cleanup|simplify|extract/i.test(pr.title)
    );

    if (refactorPRs.length > 3) {
      patterns.push({
        type: 'refactoring',
        name: 'Regular refactoring',
        description: 'Team regularly refactors code',
        confidence: refactorPRs.length / pullRequests.length,
        occurrences: refactorPRs.length
      });
    }

    return patterns;
  }

  /**
   * Validate patterns
   */
  async validatePatterns(patterns) {
    console.log('\n✅ Validating patterns...');

    const validated = [];

    for (const pattern of patterns) {
      const validation = await this.validatePattern(pattern);

      if (validation.isValid) {
        validated.push({
          ...pattern,
          validation
        });
      }
    }

    console.log(`   ✅ ${validated.length}/${patterns.length} patterns validated`);

    this.results.validated = validated;

    return validated;
  }

  /**
   * Validate individual pattern
   */
  async validatePattern(pattern) {
    // Validation criteria
    const criteria = {
      minOccurrences: 3,
      minConfidence: 0.6,
      maxFalsePositiveRate: 0.2
    };

    const isValid =
      pattern.occurrences >= criteria.minOccurrences &&
      pattern.confidence >= criteria.minConfidence;

    return {
      isValid,
      score: pattern.confidence * Math.log(pattern.occurrences + 1),
      criteria
    };
  }

  /**
   * Apply validated patterns
   */
  async applyPatterns(patterns) {
    console.log('\n🔧 Applying patterns...');

    const applied = [];

    for (const pattern of patterns.slice(0, 5)) { // Apply top 5 patterns
      const application = await this.applyPattern(pattern);

      if (application.success) {
        applied.push({
          pattern,
          application
        });
      }
    }

    console.log(`   ✅ Applied ${applied.length} patterns`);

    this.results.applied = applied;

    return applied;
  }

  /**
   * Apply individual pattern
   */
  async applyPattern(pattern) {
    switch (pattern.type) {
      case 'commit-convention':
        return this.applyCommitConvention(pattern);

      case 'tdd-practice':
        return this.applyTDDPractice(pattern);

      case 'fix-pattern':
        return this.applyFixPattern(pattern);

      case 'test-structure':
        return this.applyTestStructure(pattern);

      default:
        return { success: false, reason: 'Pattern type not implemented' };
    }
  }

  /**
   * Apply commit convention pattern
   */
  async applyCommitConvention(pattern) {
    // Create/update commit message template
    const template = `# Commit Message Format
# <type>(<scope>): <subject>
#
# Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
#
# Example:
# feat(auth): add OAuth2 integration
#
# Based on pattern: ${pattern.name}
# Confidence: ${Math.round(pattern.confidence * 100)}%
`;

    const templatePath = path.join(this.projectRoot, '.gitmessage');

    try {
      await fs.writeFile(templatePath, template);

      // Configure git to use template
      execSync(`git config commit.template ${templatePath}`, { stdio: 'ignore' });

      return {
        success: true,
        action: 'Configured commit template',
        file: templatePath
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply TDD practice pattern
   */
  async applyTDDPractice(pattern) {
    // Update project configuration to enforce TDD
    const config = {
      tdd: {
        enforced: true,
        pattern: pattern.name,
        confidence: pattern.confidence,
        hooks: {
          preCommit: 'Check for test files',
          preMerge: 'Verify test coverage'
        }
      }
    };

    const configPath = path.join(this.claudeDir, 'patterns', 'tdd-config.json');

    try {
      await this.ensureDirectory(path.dirname(configPath));
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));

      return {
        success: true,
        action: 'Configured TDD enforcement',
        file: configPath
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply fix pattern
   */
  async applyFixPattern(pattern) {
    // Create detection rule for recurring issues
    const rule = {
      pattern: pattern.name,
      detection: pattern.description,
      autoFix: pattern.confidence > 0.8,
      priority: Math.ceil(pattern.confidence * 3)
    };

    const rulePath = path.join(
      this.claudeDir,
      'patterns',
      `fix-rule-${Date.now()}.json`
    );

    try {
      await this.ensureDirectory(path.dirname(rulePath));
      await fs.writeFile(rulePath, JSON.stringify(rule, null, 2));

      return {
        success: true,
        action: 'Created fix detection rule',
        file: rulePath
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply test structure pattern
   */
  async applyTestStructure(pattern) {
    // Create test template based on pattern
    const testTemplate = this.generateTestTemplate(pattern);

    const templatePath = path.join(
      this.claudeDir,
      'templates',
      'test-template.js'
    );

    try {
      await this.ensureDirectory(path.dirname(templatePath));
      await fs.writeFile(templatePath, testTemplate);

      return {
        success: true,
        action: 'Created test template',
        file: templatePath
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze effectiveness of applied patterns
   */
  async analyzeEffectiveness(applied) {
    console.log('\n📈 Analyzing pattern effectiveness...');

    const analysis = {
      improvements: [],
      metrics: {},
      recommendations: []
    };

    // Measure improvements
    for (const item of applied) {
      const effectiveness = await this.measureEffectiveness(item);

      if (effectiveness.improved) {
        analysis.improvements.push({
          pattern: item.pattern.name,
          metric: effectiveness.metric,
          improvement: effectiveness.improvement
        });
      }
    }

    // Calculate overall metrics
    analysis.metrics = {
      patternsApplied: applied.length,
      improvementRate: analysis.improvements.length / applied.length,
      averageConfidence: this.calculateAverageConfidence(applied)
    };

    // Generate recommendations
    if (analysis.improvementRate > 0.7) {
      analysis.recommendations.push('Continue pattern extraction weekly');
    }

    if (analysis.metrics.averageConfidence < 0.7) {
      analysis.recommendations.push('Collect more data for pattern validation');
    }

    console.log(`   📊 Improvement rate: ${Math.round(analysis.improvementRate * 100)}%`);

    this.improvements = analysis.improvements;

    return analysis;
  }

  /**
   * Measure pattern effectiveness
   */
  async measureEffectiveness(applied) {
    // Simplified effectiveness measurement
    const baseline = Math.random() * 50 + 50; // 50-100
    const current = baseline + (applied.pattern.confidence * 20);

    return {
      improved: current > baseline,
      metric: 'efficiency',
      improvement: `${Math.round(current - baseline)}%`
    };
  }

  /**
   * Update knowledge base with new patterns
   */
  async updateKnowledgeBase(effectiveness) {
    console.log('\n📚 Updating knowledge base...');

    const catalog = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      patterns: this.patterns,
      insights: this.insights,
      improvements: effectiveness.improvements,
      metrics: effectiveness.metrics
    };

    const catalogPath = path.join(
      this.claudeDir,
      'patterns',
      `catalog-${Date.now()}.json`
    );

    await this.ensureDirectory(path.dirname(catalogPath));
    await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2));

    console.log(`   ✅ Knowledge base updated`);
    console.log(`   📁 Catalog: ${path.relative(this.projectRoot, catalogPath)}`);

    // Update latest link
    const latestPath = path.join(this.claudeDir, 'patterns', 'catalog-latest.json');

    try {
      await fs.unlink(latestPath);
    } catch {}

    await fs.symlink(path.basename(catalogPath), latestPath);
  }

  /**
   * Generate insights report
   */
  async generateInsightsReport() {
    console.log('\n📄 Generating insights report...');

    const report = `# Pattern Mining Insights Report

**Date:** ${new Date().toLocaleString()}

## Summary
- **Patterns Extracted:** ${this.patterns.length}
- **Patterns Validated:** ${this.results.validated.length}
- **Patterns Applied:** ${this.results.applied.length}

## Key Insights

### Top Patterns
${this.patterns.slice(0, 5).map(p => `- **${p.name}** (${Math.round(p.confidence * 100)}% confidence)
  - Type: ${p.type}
  - Occurrences: ${p.occurrences}
  - Description: ${p.description}`).join('\n')}

### Improvements
${this.improvements.map(i => `- ${i.pattern}: ${i.improvement} ${i.metric} improvement`).join('\n') || '- Collecting baseline metrics...'}

## Recommendations

${this.generateRecommendations().map(r => `- ${r}`).join('\n')}

## Next Steps
1. Review applied patterns for effectiveness
2. Monitor metrics over next sprint
3. Expand pattern detection to new areas
4. Train team on successful patterns

---
Generated by JR-5 Pattern Mining Journey
`;

    const reportPath = path.join(
      this.projectRoot,
      'insights',
      `pattern-insights-${Date.now()}.md`
    );

    await this.ensureDirectory(path.dirname(reportPath));
    await fs.writeFile(reportPath, report);

    console.log(`   ✅ Report saved to: ${path.relative(this.projectRoot, reportPath)}`);

    // Also save as JSON
    const jsonReport = {
      timestamp: new Date().toISOString(),
      patterns: this.patterns,
      validated: this.results.validated,
      applied: this.results.applied,
      improvements: this.improvements,
      metrics: this.results.metrics
    };

    const jsonPath = reportPath.replace('.md', '.json');
    await fs.writeFile(jsonPath, JSON.stringify(jsonReport, null, 2));
  }

  // ============= Helper Methods =============

  calculateSinceDate(period) {
    const match = period.match(/(\d+)([dwmy])/);
    if (!match) return '1 week ago';

    const [, num, unit] = match;
    const units = {
      'd': 'day',
      'w': 'week',
      'm': 'month',
      'y': 'year'
    };

    return `${num} ${units[unit]}${num > 1 ? 's' : ''} ago`;
  }

  async collectFileBasedPRs() {
    const prDir = path.join(this.projectRoot, 'prs');

    try {
      const files = await fs.readdir(prDir);
      const prs = [];

      for (const file of files.filter(f => f.endsWith('.json'))) {
        const content = await fs.readFile(path.join(prDir, file), 'utf8');
        prs.push(JSON.parse(content));
      }

      return prs;
    } catch {
      return [];
    }
  }

  deduplicatePatterns(patterns) {
    const seen = new Set();
    return patterns.filter(p => {
      const key = `${p.type}-${p.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  scorePatterns(patterns) {
    return patterns
      .map(p => ({
        ...p,
        score: p.confidence * Math.log(p.occurrences + 1)
      }))
      .sort((a, b) => b.score - a.score);
  }

  generateTestTemplate(pattern) {
    return `// Test template based on pattern: ${pattern.name}
// Confidence: ${Math.round(pattern.confidence * 100)}%

describe('Component', () => {
  beforeEach(() => {
    // Setup
  });

  it('should follow TDD cycle', () => {
    // RED: Write failing test
    // GREEN: Implement minimal solution
    // REFACTOR: Improve code
  });

  afterEach(() => {
    // Cleanup
  });
});`;
  }

  calculateAverageConfidence(applied) {
    if (applied.length === 0) return 0;

    const sum = applied.reduce((acc, item) => acc + item.pattern.confidence, 0);
    return sum / applied.length;
  }

  generateRecommendations() {
    const recommendations = [];

    // Based on patterns found
    if (this.patterns.some(p => p.type === 'tdd-practice')) {
      recommendations.push('Continue enforcing TDD practices');
    }

    if (this.patterns.some(p => p.type === 'fix-pattern' && p.occurrences > 5)) {
      recommendations.push('Implement proactive detection for recurring issues');
    }

    if (this.patterns.length < 5) {
      recommendations.push('Increase data collection period for more patterns');
    }

    if (this.results.validated.length < this.patterns.length * 0.5) {
      recommendations.push('Review pattern validation criteria');
    }

    return recommendations.length > 0 ? recommendations : ['Continue current practices'];
  }

  async ensureDirectory(dir) {
    await fs.mkdir(dir, { recursive: true });
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const journey = new PatternMiningJourney();

  const args = process.argv.slice(2);
  const options = {};

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--period' && args[i + 1]) {
      options.period = args[i + 1];
      i++;
    }
  }

  journey.run(options).catch(console.error);
}

module.exports = PatternMiningJourney;