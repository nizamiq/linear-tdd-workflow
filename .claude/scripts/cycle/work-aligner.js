#!/usr/bin/env node

/**
 * Work Aligner - Phase 3 of Cycle Planning
 *
 * Aligns selected issues with Claude Code agents:
 * - Creates work queues for agents
 * - Maps issues to appropriate agents
 * - Generates pre-implementation analysis
 * - Prepares test requirements
 */

const path = require('path');
const fs = require('fs').promises;
const { execSync } = require('child_process');

class WorkAligner {
    constructor() {
        this.plan = null;
        this.workQueues = {};
        this.assignments = {};
        this.preAnalysis = {};
    }

    /**
     * Main entry point - align work with Claude Code
     */
    async align() {
        console.log('🔄 Phase 3: Claude Code Work Alignment\n');

        try {
            // Load plan from Phase 2
            await this.loadPlan();

            // Step 1: Analyze code areas
            await this.analyzeCodeAreas();

            // Step 2: Create work queues
            await this.createWorkQueues();

            // Step 3: Map to agents
            await this.mapToAgents();

            // Step 4: Generate pre-analysis
            await this.generatePreAnalysis();

            // Step 5: Prepare test requirements
            await this.prepareTestRequirements();

            // Step 6: Generate alignment report
            const report = await this.generateReport();

            // Save alignment for next phase
            await this.saveAlignment(report);

            console.log('✅ Alignment complete\n');
            return report;

        } catch (error) {
            console.error('❌ Alignment failed:', error.message);
            throw error;
        }
    }

    /**
     * Load plan from Phase 2
     */
    async loadPlan() {
        console.log('📂 Loading plan data...');

        const planPath = path.join(__dirname, '../../temp/cycle-plan.json');

        try {
            const data = await fs.readFile(planPath, 'utf8');
            this.plan = JSON.parse(data);
            console.log(`  ✓ Loaded ${this.plan.issues.length} planned issues`);
        } catch (error) {
            console.log('  ⚠️  No plan found, using sample data');
            // Create sample plan for standalone execution
            this.plan = {
                issues: [
                    {
                        identifier: 'TASK-123',
                        title: 'Refactor authentication module',
                        category: 'tech_debt',
                        estimate: 13
                    },
                    {
                        identifier: 'BUG-456',
                        title: 'Fix payment processing error',
                        category: 'bug',
                        estimate: 8
                    }
                ]
            };
        }
    }

    /**
     * Analyze code areas affected by planned issues
     */
    async analyzeCodeAreas() {
        console.log('🔍 Analyzing code areas...');

        this.codeAnalysis = {};

        for (const issue of this.plan.issues) {
            console.log(`  Analyzing ${issue.identifier}...`);

            // Extract keywords from issue title and description
            const keywords = this.extractKeywords(issue);

            // Search codebase for related files
            const relatedFiles = await this.findRelatedFiles(keywords);

            // Analyze complexity and coverage
            const complexity = await this.analyzeComplexity(relatedFiles);
            const coverage = await this.analyzeCoverage(relatedFiles);

            this.codeAnalysis[issue.identifier] = {
                keywords,
                relatedFiles: relatedFiles.slice(0, 10), // Top 10 files
                complexity,
                coverage,
                riskLevel: this.calculateRisk(complexity, coverage)
            };
        }

        console.log(`  ✓ Analyzed ${Object.keys(this.codeAnalysis).length} issue areas`);
    }

    /**
     * Extract keywords from issue for code search
     */
    extractKeywords(issue) {
        const title = issue.title.toLowerCase();

        // Common code-related terms to extract
        const keywords = [];

        // Extract module/component names
        const modulePattern = /(auth|payment|user|api|database|cache|queue|service|controller|model)/gi;
        const modules = title.match(modulePattern) || [];
        keywords.push(...modules);

        // Extract technical terms
        const techPattern = /(refactor|fix|update|migrate|optimize|implement)/gi;
        const techTerms = title.match(techPattern) || [];
        keywords.push(...techTerms);

        // Category-specific keywords
        if (issue.category === 'bug') {
            keywords.push('error', 'exception', 'fix');
        } else if (issue.category === 'tech_debt') {
            keywords.push('refactor', 'cleanup', 'improve');
        } else if (issue.category === 'feature') {
            keywords.push('new', 'add', 'implement');
        }

        return [...new Set(keywords)]; // Remove duplicates
    }

    /**
     * Find files related to keywords
     */
    async findRelatedFiles(keywords) {
        const files = [];

        for (const keyword of keywords) {
            try {
                // Use grep to find files containing keyword
                const command = `grep -r -l "${keyword}" --include="*.js" --include="*.ts" --include="*.py" . 2>/dev/null | head -20`;
                const result = execSync(command, {
                    cwd: process.cwd(),
                    encoding: 'utf8',
                    stdio: 'pipe'
                });

                const foundFiles = result.split('\n').filter(f => f.length > 0);
                files.push(...foundFiles);
            } catch (error) {
                // Grep returns error if no matches, that's ok
            }
        }

        // Count occurrences and sort by relevance
        const fileCount = {};
        files.forEach(file => {
            fileCount[file] = (fileCount[file] || 0) + 1;
        });

        return Object.entries(fileCount)
            .sort((a, b) => b[1] - a[1])
            .map(([file, count]) => ({ file, relevance: count }));
    }

    /**
     * Analyze code complexity for files
     */
    async analyzeComplexity(files) {
        // Simplified complexity analysis
        // In real implementation, would use AST parsing
        return {
            average: 5,
            max: 15,
            level: 'medium'
        };
    }

    /**
     * Analyze test coverage for files
     */
    async analyzeCoverage(files) {
        // Simplified coverage analysis
        // In real implementation, would read from coverage reports
        return {
            line: 75,
            branch: 65,
            function: 80,
            level: 'moderate'
        };
    }

    /**
     * Calculate risk level based on complexity and coverage
     */
    calculateRisk(complexity, coverage) {
        const complexityScore = complexity.average > 10 ? 3 : complexity.average > 5 ? 2 : 1;
        const coverageScore = coverage.line < 60 ? 3 : coverage.line < 80 ? 2 : 1;

        const totalScore = complexityScore + coverageScore;

        if (totalScore >= 5) return 'high';
        if (totalScore >= 3) return 'medium';
        return 'low';
    }

    /**
     * Create work queues organized by type
     */
    async createWorkQueues() {
        console.log('\n📝 Creating work queues...');

        this.workQueues = {
            immediate: [],    // Blockers and critical bugs
            standard: [],     // Normal priority work
            background: [],   // Tech debt and improvements
            review: []        // Code review and validation
        };

        for (const issue of this.plan.issues) {
            const analysis = this.codeAnalysis[issue.identifier];

            // Determine queue based on category and risk
            let queue = 'standard';

            if (issue.category === 'bug' && issue.priority <= 2) {
                queue = 'immediate';
            } else if (issue.category === 'tech_debt' && analysis.riskLevel === 'low') {
                queue = 'background';
            } else if (analysis.coverage.line > 90) {
                queue = 'review'; // Well-tested code needs careful review
            }

            this.workQueues[queue].push({
                issue: issue.identifier,
                title: issue.title,
                category: issue.category,
                estimate: issue.estimate,
                risk: analysis.riskLevel,
                files: analysis.relatedFiles.slice(0, 5).map(f => f.file)
            });
        }

        // Log queue distribution
        Object.entries(this.workQueues).forEach(([queue, items]) => {
            console.log(`  ${queue}: ${items.length} issues`);
        });
    }

    /**
     * Map issues to appropriate agents
     */
    async mapToAgents() {
        console.log('\n🤖 Mapping to agents...');

        this.assignments = {};

        for (const [queue, items] of Object.entries(this.workQueues)) {
            for (const item of items) {
                const agents = this.selectAgents(item, queue);

                this.assignments[item.issue] = {
                    primary: agents.primary,
                    supporting: agents.supporting,
                    sequence: agents.sequence,
                    strategy: this.determineStrategy(item, agents)
                };

                console.log(`  ${item.issue} → ${agents.primary} (${agents.supporting.join(', ')})`);
            }
        }
    }

    /**
     * Select appropriate agents for an issue
     */
    selectAgents(item, queue) {
        const agents = {
            primary: 'EXECUTOR',  // Default to executor
            supporting: [],
            sequence: []
        };

        // Immediate queue needs GUARDIAN for CI/CD
        if (queue === 'immediate') {
            agents.supporting.push('GUARDIAN');
            agents.sequence = ['GUARDIAN', 'EXECUTOR', 'VALIDATOR'];
        }

        // Category-specific agent selection
        if (item.category === 'bug') {
            agents.supporting.push('TESTER');
            agents.sequence = ['TESTER', 'EXECUTOR', 'VALIDATOR'];
        } else if (item.category === 'tech_debt') {
            agents.supporting.push('AUDITOR', 'LINTER');
            agents.sequence = ['AUDITOR', 'EXECUTOR', 'LINTER', 'VALIDATOR'];
        } else if (item.category === 'feature') {
            agents.supporting.push('TESTER', 'VALIDATOR');
            agents.sequence = ['EXECUTOR', 'TESTER', 'VALIDATOR'];
        }

        // High risk needs extra validation
        if (item.risk === 'high') {
            agents.supporting.push('SECURITY');
            agents.sequence.push('SECURITY');
        }

        // Remove duplicates
        agents.supporting = [...new Set(agents.supporting)];
        agents.sequence = [...new Set(agents.sequence)];

        return agents;
    }

    /**
     * Determine execution strategy for issue
     */
    determineStrategy(item, agents) {
        const strategies = [];

        // TDD strategy for all issues
        strategies.push('tdd_required');

        // Risk-based strategies
        if (item.risk === 'high') {
            strategies.push('incremental_changes');
            strategies.push('extensive_testing');
        }

        // Coverage strategies
        const analysis = this.codeAnalysis[item.issue];
        if (analysis && analysis.coverage.line < 70) {
            strategies.push('improve_coverage');
        }

        // Category strategies
        if (item.category === 'bug') {
            strategies.push('regression_prevention');
        } else if (item.category === 'tech_debt') {
            strategies.push('refactor_safely');
        }

        return strategies;
    }

    /**
     * Generate pre-implementation analysis
     */
    async generatePreAnalysis() {
        console.log('\n🔬 Generating pre-implementation analysis...');

        for (const issue of this.plan.issues) {
            const analysis = this.codeAnalysis[issue.identifier];
            const assignment = this.assignments[issue.identifier];

            this.preAnalysis[issue.identifier] = {
                summary: `${issue.category} - ${issue.title}`,
                impact: {
                    files: analysis.relatedFiles.length,
                    risk: analysis.riskLevel,
                    complexity: analysis.complexity.level
                },
                approach: this.recommendApproach(issue, analysis),
                testStrategy: this.defineTestStrategy(issue, analysis),
                checkpoints: this.defineCheckpoints(issue, assignment),
                estimatedSteps: Math.ceil(issue.estimate / 2),
                dependencies: this.identifyDependencies(analysis)
            };
        }

        console.log(`  ✓ Generated analysis for ${Object.keys(this.preAnalysis).length} issues`);
    }

    /**
     * Recommend implementation approach
     */
    recommendApproach(issue, analysis) {
        const approaches = [];

        if (issue.category === 'bug') {
            approaches.push('1. Write failing test that reproduces bug');
            approaches.push('2. Implement minimal fix');
            approaches.push('3. Add regression tests');
        } else if (issue.category === 'tech_debt') {
            approaches.push('1. Create comprehensive test suite for current behavior');
            approaches.push('2. Refactor incrementally with tests passing');
            approaches.push('3. Optimize and clean up');
        } else {
            approaches.push('1. Define acceptance tests');
            approaches.push('2. Implement feature with TDD');
            approaches.push('3. Integration testing');
        }

        if (analysis.riskLevel === 'high') {
            approaches.push('4. Extensive validation and review');
        }

        return approaches;
    }

    /**
     * Define test strategy for issue
     */
    defineTestStrategy(issue, analysis) {
        return {
            unitTests: {
                required: true,
                coverage: issue.category === 'bug' ? 95 : 85,
                focus: 'Edge cases and error paths'
            },
            integrationTests: {
                required: analysis.riskLevel !== 'low',
                scope: 'Component interactions'
            },
            e2eTests: {
                required: issue.category === 'feature',
                scenarios: 'Critical user paths'
            },
            performanceTests: {
                required: issue.title.includes('optimize') || issue.title.includes('performance'),
                baseline: 'Current metrics'
            }
        };
    }

    /**
     * Define execution checkpoints
     */
    defineCheckpoints(issue, assignment) {
        const checkpoints = [];

        // Standard checkpoints
        checkpoints.push({
            stage: 'start',
            action: 'Review requirements and acceptance criteria',
            agent: assignment.primary
        });

        checkpoints.push({
            stage: 'tests_written',
            action: 'Verify all tests written and failing',
            agent: 'TESTER'
        });

        checkpoints.push({
            stage: 'implementation_complete',
            action: 'Verify tests passing and coverage met',
            agent: assignment.primary
        });

        // Risk-based checkpoints
        if (issue.category === 'bug') {
            checkpoints.push({
                stage: 'regression_check',
                action: 'Verify no new regressions introduced',
                agent: 'GUARDIAN'
            });
        }

        checkpoints.push({
            stage: 'final_validation',
            action: 'Complete quality gate checks',
            agent: 'VALIDATOR'
        });

        return checkpoints;
    }

    /**
     * Identify implementation dependencies
     */
    identifyDependencies(analysis) {
        const deps = [];

        // File dependencies
        if (analysis.relatedFiles.length > 10) {
            deps.push('Multiple modules affected - coordinate changes');
        }

        // Coverage dependencies
        if (analysis.coverage.line < 60) {
            deps.push('Low test coverage - write tests first');
        }

        // Complexity dependencies
        if (analysis.complexity.max > 15) {
            deps.push('High complexity - consider breaking down');
        }

        return deps;
    }

    /**
     * Prepare test requirements for all issues
     */
    async prepareTestRequirements() {
        console.log('\n🧪 Preparing test requirements...');

        this.testRequirements = {};

        for (const issue of this.plan.issues) {
            const analysis = this.codeAnalysis[issue.identifier];
            const preAnalysis = this.preAnalysis[issue.identifier];

            this.testRequirements[issue.identifier] = {
                minimumCoverage: {
                    line: 85,
                    branch: 80,
                    function: 90
                },
                requiredTypes: this.determineRequiredTestTypes(issue),
                testCount: {
                    unit: Math.ceil(issue.estimate * 3), // 3 unit tests per point
                    integration: Math.ceil(issue.estimate * 0.5),
                    e2e: issue.category === 'feature' ? 2 : 0
                },
                focusAreas: this.identifyTestFocusAreas(issue, analysis),
                acceptanceCriteria: this.generateAcceptanceCriteria(issue)
            };
        }

        console.log(`  ✓ Prepared test requirements for ${Object.keys(this.testRequirements).length} issues`);
    }

    /**
     * Determine required test types
     */
    determineRequiredTestTypes(issue) {
        const types = ['unit']; // Always require unit tests

        if (issue.category === 'feature') {
            types.push('integration', 'e2e');
        } else if (issue.category === 'bug') {
            types.push('regression', 'integration');
        } else if (issue.category === 'tech_debt') {
            types.push('integration');
        }

        return types;
    }

    /**
     * Identify test focus areas
     */
    identifyTestFocusAreas(issue, analysis) {
        const areas = [];

        // Category-based focus
        if (issue.category === 'bug') {
            areas.push('Bug reproduction scenario');
            areas.push('Edge cases around bug');
            areas.push('Regression prevention');
        } else if (issue.category === 'tech_debt') {
            areas.push('Behavior preservation');
            areas.push('Performance comparison');
            areas.push('Code quality metrics');
        } else {
            areas.push('Happy path scenarios');
            areas.push('Error handling');
            areas.push('Input validation');
        }

        // Risk-based focus
        if (analysis.riskLevel === 'high') {
            areas.push('Security validation');
            areas.push('Performance impact');
            areas.push('Backward compatibility');
        }

        return areas;
    }

    /**
     * Generate acceptance criteria
     */
    generateAcceptanceCriteria(issue) {
        const criteria = [];

        // Standard criteria
        criteria.push(`All tests pass with ${issue.category === 'bug' ? '95%' : '85%'} coverage`);
        criteria.push('No regression in existing functionality');
        criteria.push('Code follows project standards');

        // Category-specific criteria
        if (issue.category === 'bug') {
            criteria.push('Bug can no longer be reproduced');
            criteria.push('Root cause documented');
        } else if (issue.category === 'tech_debt') {
            criteria.push('Code complexity reduced');
            criteria.push('Performance maintained or improved');
        } else {
            criteria.push('Feature works as specified');
            criteria.push('User documentation updated');
        }

        return criteria;
    }

    /**
     * Generate alignment report
     */
    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            phase: 'alignment',
            summary: {
                issuesAligned: Object.keys(this.assignments).length,
                agentsInvolved: this.countUniqueAgents(),
                testRequirements: Object.keys(this.testRequirements).length,
                highRiskItems: this.countHighRiskItems()
            },
            workQueues: this.workQueues,
            assignments: this.assignments,
            preAnalysis: this.preAnalysis,
            testRequirements: this.testRequirements,
            executionPlan: this.generateExecutionPlan()
        };

        return report;
    }

    /**
     * Count unique agents involved
     */
    countUniqueAgents() {
        const agents = new Set();

        Object.values(this.assignments).forEach(assignment => {
            agents.add(assignment.primary);
            assignment.supporting.forEach(agent => agents.add(agent));
        });

        return agents.size;
    }

    /**
     * Count high risk items
     */
    countHighRiskItems() {
        return Object.values(this.codeAnalysis).filter(a => a.riskLevel === 'high').length;
    }

    /**
     * Generate execution plan
     */
    generateExecutionPlan() {
        return {
            phases: [
                {
                    name: 'Immediate',
                    items: this.workQueues.immediate.length,
                    duration: '1-2 days',
                    focus: 'Critical bugs and blockers'
                },
                {
                    name: 'Standard',
                    items: this.workQueues.standard.length,
                    duration: '5-7 days',
                    focus: 'Core feature work'
                },
                {
                    name: 'Background',
                    items: this.workQueues.background.length,
                    duration: 'Throughout sprint',
                    focus: 'Tech debt and improvements'
                },
                {
                    name: 'Review',
                    items: this.workQueues.review.length,
                    duration: 'Final 2 days',
                    focus: 'Code review and validation'
                }
            ],
            parallelization: 'Up to 3 agents working simultaneously',
            coordination: 'STRATEGIST orchestrates daily sync'
        };
    }

    /**
     * Save alignment for next phase
     */
    async saveAlignment(report) {
        const outputPath = path.join(__dirname, '../../temp/cycle-alignment.json');
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
        console.log(`\n📁 Alignment saved to: ${outputPath}`);
    }
}

// CLI execution
if (require.main === module) {
    const aligner = new WorkAligner();

    aligner.align()
        .then(report => {
            console.log('\n' + '='.repeat(60));
            console.log('ALIGNMENT SUMMARY');
            console.log('='.repeat(60));
            console.log(`Issues Aligned: ${report.summary.issuesAligned}`);
            console.log(`Agents Involved: ${report.summary.agentsInvolved}`);
            console.log(`Test Requirements: ${report.summary.testRequirements}`);
            console.log(`High Risk Items: ${report.summary.highRiskItems}`);

            console.log('\nWork Distribution:');
            Object.entries(report.workQueues).forEach(([queue, items]) => {
                console.log(`  ${queue}: ${items.length} issues`);
            });

            console.log('\nExecution Phases:');
            report.executionPlan.phases.forEach(phase => {
                console.log(`  ${phase.name}: ${phase.items} items (${phase.duration})`);
            });

            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Alignment failed:', error);
            process.exit(1);
        });
}

module.exports = WorkAligner;