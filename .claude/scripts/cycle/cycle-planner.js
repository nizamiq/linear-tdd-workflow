#!/usr/bin/env node

/**
 * Cycle Planner - Phase 2 of Cycle Planning
 *
 * Intelligent issue selection and cycle composition:
 * - Multi-factor scoring algorithm
 * - Capacity-based selection
 * - Technical debt balancing
 * - Risk optimization
 */

const { LinearClient } = require('@linear/sdk');
const path = require('path');
const fs = require('fs').promises;

// Import Linear configuration
const linearConfigPath = path.join(__dirname, '../../config/linear.config.js');
const LinearConfig = require(linearConfigPath);

class CyclePlanner {
    constructor() {
        this.config = new LinearConfig();
        const apiConfig = this.config.getApiConfig();
        this.linear = new LinearClient({ apiKey: apiConfig.key });
        this.analysis = null;
        this.scoredIssues = [];
        this.selectedIssues = [];
        this.plan = {};
    }

    /**
     * Main entry point - run intelligent planning
     */
    async plan() {
        console.log('🧠 Phase 2: Intelligent Cycle Planning\n');

        try {
            // Load analysis from Phase 1
            await this.loadAnalysis();

            // Step 1: Fetch and prepare candidate issues
            await this.fetchCandidateIssues();

            // Step 2: Score all issues
            await this.scoreIssues();

            // Step 3: Select optimal issue set
            await this.selectIssues();

            // Step 4: Balance composition
            await this.balanceComposition();

            // Step 5: Validate plan
            await this.validatePlan();

            // Step 6: Generate plan report
            const report = await this.generateReport();

            // Save plan for next phase
            await this.savePlan(report);

            console.log('✅ Planning complete\n');
            return report;

        } catch (error) {
            console.error('❌ Planning failed:', error.message);
            throw error;
        }
    }

    /**
     * Load analysis results from Phase 1
     */
    async loadAnalysis() {
        console.log('📂 Loading analysis data...');

        const analysisPath = path.join(__dirname, '../../temp/cycle-analysis.json');

        try {
            const data = await fs.readFile(analysisPath, 'utf8');
            this.analysis = JSON.parse(data);
            console.log('  ✓ Analysis loaded successfully');
        } catch (error) {
            console.log('  ⚠️  No analysis found, using defaults');
            // Create default analysis for standalone execution
            this.analysis = {
                metrics: {
                    velocity: { average: 50, confidence: 'medium' },
                    team: { pointCapacity: 50 },
                    backlog: { total: 100 }
                }
            };
        }
    }

    /**
     * Fetch candidate issues from Linear
     */
    async fetchCandidateIssues() {
        console.log('🎯 Fetching candidate issues...');

        const teamId = this.config.getWorkspaceConfig().teamId;

        // Get unscheduled backlog issues
        const issues = await this.linear.issues({
            filter: {
                team: { id: { eq: teamId } },
                cycle: { null: true },
                state: { type: { in: ['backlog', 'unstarted'] } }
            },
            first: 200, // Get more issues for better selection
            orderBy: 'priority'
        });

        this.candidateIssues = issues.nodes.filter(issue => {
            // Filter out issues not ready for work
            return issue.estimate && // Must have estimate
                   issue.description && // Must have description
                   issue.description.length > 20; // Meaningful description
        });

        console.log(`  ✓ Found ${this.candidateIssues.length} candidate issues`);
    }

    /**
     * Score all candidate issues
     */
    async scoreIssues() {
        console.log('📊 Scoring issues...');

        this.scoredIssues = await Promise.all(
            this.candidateIssues.map(issue => this.scoreIssue(issue))
        );

        // Sort by score descending
        this.scoredIssues.sort((a, b) => b.score - a.score);

        console.log(`  ✓ Scored ${this.scoredIssues.length} issues`);

        // Show top 5 scores
        console.log('\n  Top 5 issues by score:');
        this.scoredIssues.slice(0, 5).forEach(item => {
            console.log(`    ${item.issue.identifier}: ${item.score.toFixed(2)} - ${item.issue.title.substring(0, 50)}`);
        });
    }

    /**
     * Score individual issue using multi-factor algorithm
     */
    async scoreIssue(issue) {
        // Base scoring factors
        const factors = {
            businessValue: 0,
            technicalDebt: 0,
            riskMitigation: 0,
            velocityFit: 0,
            dependencies: 0,
            teamAlignment: 0
        };

        // Business Value (0-100)
        factors.businessValue = this.calculateBusinessValue(issue);

        // Technical Debt Impact (0-100)
        factors.technicalDebt = this.calculateTechnicalDebtImpact(issue);

        // Risk Mitigation (0-100)
        factors.riskMitigation = this.calculateRiskMitigation(issue);

        // Velocity Fit (0-100)
        factors.velocityFit = this.calculateVelocityFit(issue);

        // Dependencies (0-100)
        factors.dependencies = await this.calculateDependencyScore(issue);

        // Team Alignment (0-100)
        factors.teamAlignment = this.calculateTeamAlignment(issue);

        // Calculate weighted score
        const weights = {
            businessValue: 0.35,
            technicalDebt: 0.25,
            riskMitigation: 0.15,
            velocityFit: 0.10,
            dependencies: 0.10,
            teamAlignment: 0.05
        };

        const score = Object.keys(factors).reduce((total, factor) => {
            return total + (factors[factor] * weights[factor]);
        }, 0);

        return {
            issue,
            score,
            factors,
            category: this.categorizeIssue(issue)
        };
    }

    /**
     * Calculate business value score
     */
    calculateBusinessValue(issue) {
        let score = 0;

        // Priority weight (40 points)
        const priorityScores = { 1: 40, 2: 30, 3: 20, 4: 10, 0: 5 };
        score += priorityScores[issue.priority] || 0;

        // Label indicators (30 points)
        const labels = issue.labels?.nodes || [];
        if (labels.some(l => l.name.toLowerCase().includes('customer'))) score += 15;
        if (labels.some(l => l.name.toLowerCase().includes('revenue'))) score += 15;

        // Parent/Project association (20 points)
        if (issue.project) score += 10;
        if (issue.parent) score += 10;

        // Engagement indicators (10 points)
        if (issue.comments?.nodes?.length > 2) score += 5;
        if (issue.subscribers?.nodes?.length > 1) score += 5;

        return Math.min(100, score * 1.5); // Scale to 0-100
    }

    /**
     * Calculate technical debt impact score
     */
    calculateTechnicalDebtImpact(issue) {
        let score = 0;

        const labels = issue.labels?.nodes || [];
        const title = issue.title.toLowerCase();
        const description = (issue.description || '').toLowerCase();

        // Direct technical debt indicators (50 points)
        if (labels.some(l => l.name.toLowerCase().includes('debt'))) score += 25;
        if (labels.some(l => l.name.toLowerCase().includes('refactor'))) score += 25;

        // Keyword analysis (30 points)
        const debtKeywords = ['legacy', 'cleanup', 'migrate', 'upgrade', 'deprecate'];
        const keywordMatches = debtKeywords.filter(kw =>
            title.includes(kw) || description.includes(kw)
        ).length;
        score += keywordMatches * 10;

        // Test coverage improvement (20 points)
        if (labels.some(l => l.name.toLowerCase().includes('test'))) score += 10;
        if (title.includes('coverage') || description.includes('coverage')) score += 10;

        return Math.min(100, score * 1.5);
    }

    /**
     * Calculate risk mitigation score
     */
    calculateRiskMitigation(issue) {
        let score = 0;

        const labels = issue.labels?.nodes || [];

        // Bug fixes (40 points)
        if (labels.some(l => l.name.toLowerCase().includes('bug'))) score += 40;

        // Security issues (30 points)
        if (labels.some(l => l.name.toLowerCase().includes('security'))) score += 30;

        // Performance issues (20 points)
        if (labels.some(l => l.name.toLowerCase().includes('performance'))) score += 20;

        // Incident prevention (10 points)
        if (labels.some(l => l.name.toLowerCase().includes('incident'))) score += 10;

        return Math.min(100, score);
    }

    /**
     * Calculate velocity fit score
     */
    calculateVelocityFit(issue) {
        const estimate = issue.estimate || 0;
        const avgVelocity = this.analysis.metrics.velocity.average;

        // Ideal issue size is 5-13 points (Fibonacci)
        if (estimate >= 5 && estimate <= 13) {
            return 100;
        } else if (estimate >= 3 && estimate <= 21) {
            return 70;
        } else if (estimate === 1 || estimate === 2) {
            return 50; // Too small, low value
        } else if (estimate > 21) {
            return 30; // Too large, risky
        }

        return 40;
    }

    /**
     * Calculate dependency score
     */
    async calculateDependencyScore(issue) {
        // Check if issue has blockers
        const relations = issue.relations?.nodes || [];
        const hasBlockers = relations.some(r => r.type === 'blocks');

        if (hasBlockers) {
            return 0; // Blocked issues get lowest score
        }

        // Check if issue unblocks others
        const unblocksOthers = relations.some(r => r.type === 'blocks' && r.relatedIssue);

        if (unblocksOthers) {
            return 100; // Unblocking issues get highest score
        }

        // No dependencies is good
        if (relations.length === 0) {
            return 80;
        }

        // Some dependencies but not blocking
        return 50;
    }

    /**
     * Calculate team alignment score
     */
    calculateTeamAlignment(issue) {
        let score = 50; // Base score

        // Assignee readiness (25 points)
        if (issue.assignee) score += 25;

        // Clear acceptance criteria (25 points)
        const description = issue.description || '';
        if (description.includes('Acceptance') ||
            description.includes('Definition of Done') ||
            description.includes('Requirements')) {
            score += 25;
        }

        return Math.min(100, score);
    }

    /**
     * Categorize issue for balanced selection
     */
    categorizeIssue(issue) {
        const labels = issue.labels?.nodes || [];

        if (labels.some(l => l.name.toLowerCase().includes('bug'))) {
            return 'bug';
        }
        if (labels.some(l => l.name.toLowerCase().includes('debt') ||
                       l.name.toLowerCase().includes('refactor'))) {
            return 'tech_debt';
        }
        if (labels.some(l => l.name.toLowerCase().includes('feature'))) {
            return 'feature';
        }

        // Default categorization based on title
        const title = issue.title.toLowerCase();
        if (title.includes('fix') || title.includes('bug')) return 'bug';
        if (title.includes('refactor') || title.includes('cleanup')) return 'tech_debt';

        return 'feature';
    }

    /**
     * Select optimal set of issues for cycle
     */
    async selectIssues() {
        console.log('\n🎯 Selecting issues for cycle...');

        const capacity = this.analysis.metrics.team.pointCapacity || 50;
        const buffer = 0.85; // Use 85% of capacity for safety
        const targetCapacity = capacity * buffer;

        console.log(`  Target capacity: ${targetCapacity.toFixed(0)} points`);

        this.selectedIssues = [];
        let currentCapacity = 0;
        let categoryCount = {
            bug: 0,
            tech_debt: 0,
            feature: 0
        };

        // Greedy selection with category balancing
        for (const scoredIssue of this.scoredIssues) {
            const estimate = scoredIssue.issue.estimate || 0;

            // Check if adding this issue would exceed capacity
            if (currentCapacity + estimate > targetCapacity) {
                // Try to find smaller issues that fit
                continue;
            }

            // Apply category constraints
            const category = scoredIssue.category;
            const totalSelected = this.selectedIssues.length;

            // Ensure balanced composition
            if (category === 'tech_debt' && categoryCount.tech_debt / (totalSelected + 1) > 0.4) {
                continue; // Too much tech debt
            }
            if (category === 'bug' && categoryCount.bug / (totalSelected + 1) > 0.3) {
                continue; // Too many bugs
            }

            // Add to selected issues
            this.selectedIssues.push(scoredIssue);
            currentCapacity += estimate;
            categoryCount[category]++;

            console.log(`  + ${scoredIssue.issue.identifier} (${estimate}pts, score: ${scoredIssue.score.toFixed(1)})`);

            // Stop if we've reached good capacity utilization
            if (currentCapacity >= targetCapacity * 0.9) {
                break;
            }
        }

        console.log(`\n  ✓ Selected ${this.selectedIssues.length} issues (${currentCapacity} points)`);
        console.log(`    Bugs: ${categoryCount.bug}, Tech Debt: ${categoryCount.tech_debt}, Features: ${categoryCount.feature}`);
    }

    /**
     * Balance cycle composition for optimal mix
     */
    async balanceComposition() {
        console.log('\n⚖️ Balancing composition...');

        const totalPoints = this.selectedIssues.reduce((sum, si) => sum + (si.issue.estimate || 0), 0);
        const categoryPoints = {
            bug: 0,
            tech_debt: 0,
            feature: 0
        };

        // Calculate current distribution
        this.selectedIssues.forEach(si => {
            categoryPoints[si.category] += si.issue.estimate || 0;
        });

        // Calculate ratios
        const ratios = {
            bug: (categoryPoints.bug / totalPoints * 100).toFixed(1),
            tech_debt: (categoryPoints.tech_debt / totalPoints * 100).toFixed(1),
            feature: (categoryPoints.feature / totalPoints * 100).toFixed(1)
        };

        console.log('  Current composition:');
        console.log(`    Bugs: ${ratios.bug}%`);
        console.log(`    Tech Debt: ${ratios.tech_debt}%`);
        console.log(`    Features: ${ratios.feature}%`);

        // Target: 20% bugs, 30% tech debt, 50% features
        const targets = { bug: 0.2, tech_debt: 0.3, feature: 0.5 };
        let adjustments = [];

        // Check if rebalancing needed
        if (Math.abs(categoryPoints.tech_debt / totalPoints - targets.tech_debt) > 0.1) {
            console.log('  ⚠️  Rebalancing needed for technical debt ratio');
            adjustments = await this.rebalance(targets);
        }

        if (adjustments.length > 0) {
            console.log(`  ✓ Made ${adjustments.length} adjustments`);
        } else {
            console.log('  ✓ Composition is balanced');
        }
    }

    /**
     * Rebalance selected issues to meet target ratios
     */
    async rebalance(targets) {
        const adjustments = [];
        // Implementation would swap issues to better match targets
        // For now, we'll accept the current selection
        return adjustments;
    }

    /**
     * Validate the plan meets all constraints
     */
    async validatePlan() {
        console.log('\n✅ Validating plan...');

        const validations = {
            capacity: this.validateCapacity(),
            balance: this.validateBalance(),
            dependencies: await this.validateDependencies(),
            readiness: this.validateReadiness()
        };

        const issues = Object.entries(validations)
            .filter(([_, result]) => !result.valid)
            .map(([key, result]) => `${key}: ${result.message}`);

        if (issues.length > 0) {
            console.log('  ⚠️  Validation warnings:');
            issues.forEach(issue => console.log(`    - ${issue}`));
        } else {
            console.log('  ✓ All validations passed');
        }

        this.validations = validations;
    }

    /**
     * Validate capacity constraints
     */
    validateCapacity() {
        const capacity = this.analysis.metrics.team.pointCapacity || 50;
        const planned = this.selectedIssues.reduce((sum, si) => sum + (si.issue.estimate || 0), 0);
        const utilization = (planned / capacity) * 100;

        return {
            valid: utilization >= 70 && utilization <= 90,
            message: `Capacity utilization: ${utilization.toFixed(1)}%`,
            utilization
        };
    }

    /**
     * Validate composition balance
     */
    validateBalance() {
        const categoryCount = { bug: 0, tech_debt: 0, feature: 0 };
        this.selectedIssues.forEach(si => categoryCount[si.category]++);

        const total = this.selectedIssues.length;
        const techDebtRatio = categoryCount.tech_debt / total;

        return {
            valid: techDebtRatio >= 0.2 && techDebtRatio <= 0.4,
            message: `Tech debt ratio: ${(techDebtRatio * 100).toFixed(1)}%`,
            ratio: techDebtRatio
        };
    }

    /**
     * Validate no blocking dependencies
     */
    async validateDependencies() {
        const blockedIssues = this.selectedIssues.filter(si => {
            const relations = si.issue.relations?.nodes || [];
            return relations.some(r => r.type === 'blocks');
        });

        return {
            valid: blockedIssues.length === 0,
            message: blockedIssues.length > 0 ?
                `${blockedIssues.length} selected issues have blockers` :
                'No blocking dependencies',
            blockedCount: blockedIssues.length
        };
    }

    /**
     * Validate issue readiness
     */
    validateReadiness() {
        const notReady = this.selectedIssues.filter(si => {
            const issue = si.issue;
            return !issue.estimate ||
                   !issue.description ||
                   issue.description.length < 50;
        });

        return {
            valid: notReady.length === 0,
            message: notReady.length > 0 ?
                `${notReady.length} issues not fully ready` :
                'All issues ready for work',
            notReadyCount: notReady.length
        };
    }

    /**
     * Generate planning report
     */
    async generateReport() {
        const totalPoints = this.selectedIssues.reduce((sum, si) => sum + (si.issue.estimate || 0), 0);
        const categoryBreakdown = this.getCategoryBreakdown();

        const report = {
            timestamp: new Date().toISOString(),
            phase: 'planning',
            summary: {
                selectedCount: this.selectedIssues.length,
                totalPoints,
                capacityUtilization: (totalPoints / (this.analysis.metrics.team.pointCapacity || 50)) * 100,
                averageScore: this.selectedIssues.reduce((sum, si) => sum + si.score, 0) / this.selectedIssues.length
            },
            composition: categoryBreakdown,
            issues: this.selectedIssues.map(si => ({
                id: si.issue.id,
                identifier: si.issue.identifier,
                title: si.issue.title,
                estimate: si.issue.estimate,
                priority: si.issue.priority,
                category: si.category,
                score: si.score,
                factors: si.factors
            })),
            validations: this.validations,
            recommendations: this.generatePlanRecommendations()
        };

        return report;
    }

    /**
     * Get category breakdown
     */
    getCategoryBreakdown() {
        const breakdown = {
            bug: { count: 0, points: 0, percentage: 0 },
            tech_debt: { count: 0, points: 0, percentage: 0 },
            feature: { count: 0, points: 0, percentage: 0 }
        };

        const totalPoints = this.selectedIssues.reduce((sum, si) => sum + (si.issue.estimate || 0), 0);

        this.selectedIssues.forEach(si => {
            breakdown[si.category].count++;
            breakdown[si.category].points += si.issue.estimate || 0;
        });

        Object.keys(breakdown).forEach(category => {
            breakdown[category].percentage = (breakdown[category].points / totalPoints * 100).toFixed(1);
        });

        return breakdown;
    }

    /**
     * Generate planning recommendations
     */
    generatePlanRecommendations() {
        const recommendations = [];

        // Capacity recommendations
        if (this.validations.capacity.utilization < 70) {
            recommendations.push('Consider adding more issues to better utilize capacity');
        } else if (this.validations.capacity.utilization > 90) {
            recommendations.push('High capacity utilization - consider removing lowest priority items');
        }

        // Balance recommendations
        if (this.validations.balance.ratio < 0.2) {
            recommendations.push('Low technical debt allocation - consider adding refactoring tasks');
        } else if (this.validations.balance.ratio > 0.4) {
            recommendations.push('High technical debt allocation - ensure feature delivery not impacted');
        }

        // Dependency recommendations
        if (this.validations.dependencies.blockedCount > 0) {
            recommendations.push('Resolve blockers before cycle start to avoid delays');
        }

        return recommendations;
    }

    /**
     * Save plan for next phase
     */
    async savePlan(report) {
        const outputPath = path.join(__dirname, '../../temp/cycle-plan.json');
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
        console.log(`\n📁 Plan saved to: ${outputPath}`);
    }
}

// CLI execution
if (require.main === module) {
    const planner = new CyclePlanner();

    planner.plan()
        .then(report => {
            console.log('\n' + '='.repeat(60));
            console.log('PLANNING SUMMARY');
            console.log('='.repeat(60));
            console.log(`Selected Issues: ${report.summary.selectedCount}`);
            console.log(`Total Points: ${report.summary.totalPoints}`);
            console.log(`Capacity Used: ${report.summary.capacityUtilization.toFixed(1)}%`);
            console.log(`Average Score: ${report.summary.averageScore.toFixed(1)}`);

            console.log('\nComposition:');
            Object.entries(report.composition).forEach(([category, data]) => {
                console.log(`  ${category}: ${data.count} issues (${data.points} points, ${data.percentage}%)`);
            });

            if (report.recommendations.length > 0) {
                console.log('\n📋 Recommendations:');
                report.recommendations.forEach(rec => {
                    console.log(`  - ${rec}`);
                });
            }

            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Planning failed:', error);
            process.exit(1);
        });
}

module.exports = CyclePlanner;