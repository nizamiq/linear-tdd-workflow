#!/usr/bin/env node

/**
 * Cycle Analyzer - Phase 1 of Cycle Planning
 *
 * Performs comprehensive analysis of Linear state including:
 * - Current cycle health metrics
 * - Backlog composition analysis
 * - Dependency mapping
 * - Team capacity calculation
 */

const { LinearClient } = require('@linear/sdk');
const path = require('path');
const fs = require('fs').promises;

// Import Linear configuration
const linearConfigPath = path.join(__dirname, '../../config/linear.config.js');
const LinearConfig = require(linearConfigPath);

class CycleAnalyzer {
    constructor() {
        this.config = new LinearConfig();
        const apiConfig = this.config.getApiConfig();
        this.linear = new LinearClient({ apiKey: apiConfig.key });
        this.metrics = {
            cycle: {},
            backlog: {},
            team: {},
            dependencies: {}
        };
    }

    /**
     * Main entry point - run complete analysis
     */
    async analyze() {
        console.log('🔍 Phase 1: Comprehensive Linear State Analysis\n');

        try {
            // Step 1: Analyze current cycle
            await this.analyzeCurrentCycle();

            // Step 2: Calculate velocity
            await this.calculateVelocity();

            // Step 3: Analyze backlog
            await this.analyzeBacklog();

            // Step 4: Map dependencies
            await this.mapDependencies();

            // Step 5: Calculate team capacity
            await this.calculateCapacity();

            // Step 6: Generate analysis report
            const report = await this.generateReport();

            // Save report for next phase
            await this.saveAnalysis(report);

            console.log('✅ Analysis complete\n');
            return report;

        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            throw error;
        }
    }

    /**
     * Analyze current cycle health and progress
     */
    async analyzeCurrentCycle() {
        console.log('📊 Analyzing current cycle...');

        const teamId = this.config.getWorkspaceConfig().teamId;
        const team = await this.linear.team(teamId);
        const cycles = await team.cycles();

        // Find active cycle
        const activeCycle = cycles.nodes.find(c => c.startsAt <= new Date() && c.endsAt >= new Date());

        if (!activeCycle) {
            this.metrics.cycle = { status: 'no_active_cycle' };
            console.log('  ⚠️  No active cycle found');
            return;
        }

        // Get cycle issues
        const cycleIssues = await activeCycle.issues();
        const issues = cycleIssues.nodes;

        // Calculate metrics
        const completed = issues.filter(i => i.state.type === 'completed').length;
        const inProgress = issues.filter(i => i.state.type === 'started').length;
        const blocked = issues.filter(i => i.state.type === 'blocked').length;
        const total = issues.length;

        this.metrics.cycle = {
            id: activeCycle.id,
            number: activeCycle.number,
            name: activeCycle.name,
            progress: total > 0 ? (completed / total) * 100 : 0,
            stats: {
                total,
                completed,
                inProgress,
                blocked,
                remaining: total - completed
            },
            daysRemaining: Math.ceil((activeCycle.endsAt - new Date()) / (1000 * 60 * 60 * 24)),
            health: this.assessCycleHealth(completed, total, activeCycle)
        };

        console.log(`  ✓ Cycle ${activeCycle.number}: ${completed}/${total} issues (${this.metrics.cycle.progress.toFixed(1)}%)`);
    }

    /**
     * Calculate velocity from historical cycles
     */
    async calculateVelocity() {
        console.log('📈 Calculating velocity...');

        const teamId = this.config.getWorkspaceConfig().teamId;
        const team = await this.linear.team(teamId);
        const cycles = await team.cycles({ first: 4 }); // Get last 3 completed + current

        const completedCycles = cycles.nodes
            .filter(c => c.endsAt < new Date())
            .slice(0, 3); // Last 3 completed

        if (completedCycles.length === 0) {
            this.metrics.velocity = { average: 0, trend: 'unknown' };
            console.log('  ⚠️  No completed cycles for velocity calculation');
            return;
        }

        // Calculate points completed per cycle
        const velocities = await Promise.all(completedCycles.map(async (cycle) => {
            const issues = await cycle.issues();
            const completed = issues.nodes.filter(i => i.state.type === 'completed');
            return completed.reduce((sum, issue) => sum + (issue.estimate || 0), 0);
        }));

        const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
        const trend = velocities[0] > velocities[velocities.length - 1] ? 'increasing' :
                     velocities[0] < velocities[velocities.length - 1] ? 'decreasing' : 'stable';

        this.metrics.velocity = {
            average: avgVelocity,
            trend,
            historical: velocities,
            confidence: this.calculateConfidence(velocities)
        };

        console.log(`  ✓ Average velocity: ${avgVelocity.toFixed(1)} points (${trend})`);
    }

    /**
     * Analyze backlog composition and readiness
     */
    async analyzeBacklog() {
        console.log('📋 Analyzing backlog...');

        const teamId = this.config.getWorkspaceConfig().teamId;

        // Get all backlog issues (not in current cycle)
        const issues = await this.linear.issues({
            filter: {
                team: { id: { eq: teamId } },
                cycle: { null: true },
                state: { type: { in: ['backlog', 'unstarted'] } }
            },
            first: 100
        });

        const backlogIssues = issues.nodes;

        // Categorize issues
        const byPriority = {
            urgent: backlogIssues.filter(i => i.priority === 1).length,
            high: backlogIssues.filter(i => i.priority === 2).length,
            medium: backlogIssues.filter(i => i.priority === 3).length,
            low: backlogIssues.filter(i => i.priority === 4).length,
            noPriority: backlogIssues.filter(i => i.priority === 0).length
        };

        const byType = {
            bug: backlogIssues.filter(i => i.labels?.nodes.some(l => l.name.toLowerCase().includes('bug'))).length,
            feature: backlogIssues.filter(i => i.labels?.nodes.some(l => l.name.toLowerCase().includes('feature'))).length,
            techDebt: backlogIssues.filter(i => i.labels?.nodes.some(l => l.name.toLowerCase().includes('debt') || l.name.toLowerCase().includes('refactor'))).length,
            other: 0
        };
        byType.other = backlogIssues.length - byType.bug - byType.feature - byType.techDebt;

        // Calculate readiness
        const ready = backlogIssues.filter(i =>
            i.estimate &&
            i.description &&
            i.description.length > 50
        ).length;

        this.metrics.backlog = {
            total: backlogIssues.length,
            readyForWork: ready,
            byPriority,
            byType,
            estimatedPoints: backlogIssues.reduce((sum, i) => sum + (i.estimate || 0), 0),
            readinessScore: (ready / backlogIssues.length) * 100
        };

        console.log(`  ✓ Backlog: ${backlogIssues.length} issues (${ready} ready)`);
    }

    /**
     * Map issue dependencies and blockers
     */
    async mapDependencies() {
        console.log('🔗 Mapping dependencies...');

        const teamId = this.config.getWorkspaceConfig().teamId;

        // Get issues with dependencies
        const issues = await this.linear.issues({
            filter: {
                team: { id: { eq: teamId } },
                state: { type: { nin: ['completed', 'canceled'] } },
                hasRelatedRelations: { eq: true }
            },
            first: 50
        });

        const dependencies = [];
        const blockers = [];

        for (const issue of issues.nodes) {
            const relations = await issue.relations();

            for (const relation of relations.nodes) {
                if (relation.type === 'blocks') {
                    blockers.push({
                        blocker: issue.identifier,
                        blocked: relation.relatedIssue.identifier,
                        impact: relation.relatedIssue.priority
                    });
                } else if (relation.type === 'duplicate' || relation.type === 'related') {
                    dependencies.push({
                        from: issue.identifier,
                        to: relation.relatedIssue.identifier,
                        type: relation.type
                    });
                }
            }
        }

        this.metrics.dependencies = {
            total: dependencies.length,
            blockers: blockers.length,
            criticalBlockers: blockers.filter(b => b.impact <= 2).length,
            chains: this.findDependencyChains(dependencies),
            riskScore: this.calculateDependencyRisk(blockers, dependencies)
        };

        console.log(`  ✓ Found ${blockers.length} blockers, ${dependencies.length} dependencies`);
    }

    /**
     * Calculate team capacity for next cycle
     */
    async calculateCapacity() {
        console.log('👥 Calculating team capacity...');

        const teamId = this.config.getWorkspaceConfig().teamId;
        const team = await this.linear.team(teamId);
        const members = await team.members();

        // Base capacity calculation (2 week sprint assumption)
        const sprintDays = 10; // Business days
        const hoursPerDay = 6; // Focused work hours
        const focusFactor = 0.7; // Account for meetings, context switching

        const teamSize = members.nodes.filter(m => m.active).length;
        const rawCapacity = teamSize * sprintDays * hoursPerDay;
        const effectiveCapacity = rawCapacity * focusFactor;

        // Convert to story points using historical data
        const hoursPerPoint = 3; // Default, should be calculated from historicals
        const pointCapacity = effectiveCapacity / hoursPerPoint;

        this.metrics.team = {
            size: teamSize,
            rawCapacity,
            effectiveCapacity,
            pointCapacity,
            focusFactor,
            availability: this.calculateAvailability(members.nodes)
        };

        console.log(`  ✓ Team capacity: ${pointCapacity.toFixed(0)} points (${teamSize} members)`);
    }

    /**
     * Helper: Assess cycle health
     */
    assessCycleHealth(completed, total, cycle) {
        const progress = total > 0 ? (completed / total) : 0;
        const daysElapsed = Math.ceil((new Date() - cycle.startsAt) / (1000 * 60 * 60 * 24));
        const totalDays = Math.ceil((cycle.endsAt - cycle.startsAt) / (1000 * 60 * 60 * 24));
        const expectedProgress = daysElapsed / totalDays;

        if (progress >= expectedProgress) return 'healthy';
        if (progress >= expectedProgress * 0.8) return 'at_risk';
        return 'unhealthy';
    }

    /**
     * Helper: Calculate velocity confidence
     */
    calculateConfidence(velocities) {
        if (velocities.length < 2) return 'low';

        const mean = velocities.reduce((a, b) => a + b, 0) / velocities.length;
        const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / mean;

        if (coefficientOfVariation < 0.2) return 'high';
        if (coefficientOfVariation < 0.4) return 'medium';
        return 'low';
    }

    /**
     * Helper: Find dependency chains
     */
    findDependencyChains(dependencies) {
        // Simple chain detection - could be enhanced with graph algorithms
        const chains = [];
        const visited = new Set();

        for (const dep of dependencies) {
            if (visited.has(dep.from)) continue;

            const chain = [dep.from];
            let current = dep.to;
            visited.add(dep.from);

            while (current) {
                chain.push(current);
                visited.add(current);
                const next = dependencies.find(d => d.from === current && !visited.has(d.to));
                current = next ? next.to : null;
            }

            if (chain.length > 1) {
                chains.push(chain);
            }
        }

        return chains;
    }

    /**
     * Helper: Calculate dependency risk score
     */
    calculateDependencyRisk(blockers, dependencies) {
        const blockerScore = blockers.length * 10 +
                           blockers.filter(b => b.impact <= 2).length * 20;
        const dependencyScore = dependencies.length * 2;

        const totalScore = blockerScore + dependencyScore;

        if (totalScore < 20) return 'low';
        if (totalScore < 50) return 'medium';
        return 'high';
    }

    /**
     * Helper: Calculate team availability
     */
    calculateAvailability(members) {
        // In real implementation, would check calendars, PTO, etc.
        // For now, assume 90% availability
        return members.filter(m => m.active).length * 0.9;
    }

    /**
     * Generate analysis report
     */
    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            phase: 'analysis',
            metrics: this.metrics,
            recommendations: this.generateRecommendations(),
            risks: this.identifyRisks(),
            summary: this.generateSummary()
        };

        return report;
    }

    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations() {
        const recommendations = [];

        // Velocity recommendations
        if (this.metrics.velocity.confidence === 'low') {
            recommendations.push({
                type: 'planning',
                priority: 'high',
                message: 'Low velocity confidence - consider more conservative planning'
            });
        }

        // Backlog recommendations
        if (this.metrics.backlog.readinessScore < 50) {
            recommendations.push({
                type: 'grooming',
                priority: 'high',
                message: 'Low backlog readiness - schedule grooming session'
            });
        }

        // Dependency recommendations
        if (this.metrics.dependencies.riskScore === 'high') {
            recommendations.push({
                type: 'dependencies',
                priority: 'critical',
                message: 'High dependency risk - prioritize blocker resolution'
            });
        }

        // Capacity recommendations
        if (this.metrics.team.availability < this.metrics.team.size * 0.8) {
            recommendations.push({
                type: 'capacity',
                priority: 'medium',
                message: 'Reduced team availability - adjust sprint scope'
            });
        }

        return recommendations;
    }

    /**
     * Identify risks for the upcoming cycle
     */
    identifyRisks() {
        const risks = [];

        // Cycle health risk
        if (this.metrics.cycle.health === 'unhealthy') {
            risks.push({
                category: 'execution',
                level: 'high',
                description: 'Current cycle at risk - may impact next cycle planning'
            });
        }

        // Velocity risk
        if (this.metrics.velocity.trend === 'decreasing') {
            risks.push({
                category: 'planning',
                level: 'medium',
                description: 'Decreasing velocity trend - estimates may be optimistic'
            });
        }

        // Blocker risk
        if (this.metrics.dependencies.criticalBlockers > 0) {
            risks.push({
                category: 'dependencies',
                level: 'high',
                description: `${this.metrics.dependencies.criticalBlockers} critical blockers need resolution`
            });
        }

        return risks;
    }

    /**
     * Generate executive summary
     */
    generateSummary() {
        return {
            cycleReady: this.metrics.cycle.health !== 'unhealthy',
            backlogReady: this.metrics.backlog.readinessScore > 60,
            teamReady: this.metrics.team.availability > this.metrics.team.size * 0.7,
            overallReadiness: this.calculateOverallReadiness(),
            keyMessage: this.generateKeyMessage()
        };
    }

    /**
     * Calculate overall readiness score
     */
    calculateOverallReadiness() {
        let score = 0;
        let weight = 0;

        // Cycle health (30% weight)
        if (this.metrics.cycle.health === 'healthy') score += 30;
        else if (this.metrics.cycle.health === 'at_risk') score += 15;
        weight += 30;

        // Backlog readiness (25% weight)
        score += (this.metrics.backlog.readinessScore / 100) * 25;
        weight += 25;

        // Velocity confidence (20% weight)
        if (this.metrics.velocity.confidence === 'high') score += 20;
        else if (this.metrics.velocity.confidence === 'medium') score += 10;
        weight += 20;

        // Dependency risk (25% weight)
        if (this.metrics.dependencies.riskScore === 'low') score += 25;
        else if (this.metrics.dependencies.riskScore === 'medium') score += 12;
        weight += 25;

        return Math.round((score / weight) * 100);
    }

    /**
     * Generate key message for stakeholders
     */
    generateKeyMessage() {
        const readiness = this.calculateOverallReadiness();

        if (readiness > 80) {
            return '✅ Team is well-positioned for next cycle planning';
        } else if (readiness > 60) {
            return '⚠️ Some preparation needed before cycle planning';
        } else {
            return '❌ Significant issues need resolution before planning';
        }
    }

    /**
     * Save analysis results for next phase
     */
    async saveAnalysis(report) {
        const outputPath = path.join(__dirname, '../../temp/cycle-analysis.json');
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
        console.log(`\n📁 Analysis saved to: ${outputPath}`);
    }
}

// CLI execution
if (require.main === module) {
    const analyzer = new CycleAnalyzer();

    analyzer.analyze()
        .then(report => {
            console.log('\n' + '='.repeat(60));
            console.log('ANALYSIS SUMMARY');
            console.log('='.repeat(60));
            console.log(`Overall Readiness: ${report.summary.overallReadiness}%`);
            console.log(`Key Message: ${report.summary.keyMessage}`);

            if (report.recommendations.length > 0) {
                console.log('\n📋 Recommendations:');
                report.recommendations.forEach(rec => {
                    console.log(`  [${rec.priority.toUpperCase()}] ${rec.message}`);
                });
            }

            if (report.risks.length > 0) {
                console.log('\n⚠️ Risks:');
                report.risks.forEach(risk => {
                    console.log(`  [${risk.level.toUpperCase()}] ${risk.description}`);
                });
            }

            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Analysis failed:', error);
            process.exit(1);
        });
}

module.exports = CycleAnalyzer;