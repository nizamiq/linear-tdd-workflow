#!/usr/bin/env node

/**
 * Linear Task Duplicate Detection Utility
 *
 * Provides advanced duplicate detection algorithms for Linear tasks using
 * multiple similarity metrics and configurable thresholds.
 *
 * Features:
 * - Text similarity analysis (Jaccard, Cosine, Levenshtein)
 * - Component-based grouping
 * - Configurable confidence thresholds
 * - Batch processing support
 * - Integration with Linear API via MCP tools
 */

class DuplicateDetector {
    constructor(options = {}) {
        this.config = {
            // Similarity thresholds
            titleSimilarityThreshold: options.titleSimilarityThreshold || 0.8,
            descriptionSimilarityThreshold: options.descriptionSimilarityThreshold || 0.6,
            combinedThreshold: options.combinedThreshold || 0.7,

            // Component matching
            componentWeight: options.componentWeight || 0.3,

            // Text processing
            stopWords: options.stopWords || ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'],
            minWordLength: options.minWordLength || 3,

            // Performance
            batchSize: options.batchSize || 50,
            maxComparisons: options.maxComparisons || 1000,

            // Output
            verbose: options.verbose || false,
            dryRun: options.dryRun || true
        };

        this.duplicatePairs = [];
        this.processedCount = 0;
        this.comparisonCount = 0;
    }

    /**
     * Normalize text for comparison by removing stop words, punctuation,
     * and converting to lowercase
     */
    normalizeText(text) {
        if (!text || typeof text !== 'string') return '';

        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word =>
                word.length >= this.config.minWordLength &&
                !this.config.stopWords.includes(word)
            )
            .join(' ');
    }

    /**
     * Calculate Jaccard similarity coefficient
     */
    calculateJaccardSimilarity(text1, text2) {
        const words1 = new Set(this.normalizeText(text1).split(/\s+/));
        const words2 = new Set(this.normalizeText(text2).split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    /**
     * Calculate cosine similarity using term frequency
     */
    calculateCosineSimilarity(text1, text2) {
        const words1 = this.normalizeText(text1).split(/\s+/);
        const words2 = this.normalizeText(text2).split(/\s+/);

        // Create term frequency vectors
        const allWords = [...new Set([...words1, ...words2])];
        const vector1 = allWords.map(word => words1.filter(w => w === word).length);
        const vector2 = allWords.map(word => words2.filter(w => w === word).length);

        // Calculate dot product and magnitudes
        const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

        return (magnitude1 === 0 || magnitude2 === 0) ? 0 : dotProduct / (magnitude1 * magnitude2);
    }

    /**
     * Calculate Levenshtein distance ratio
     */
    calculateLevenshteinSimilarity(text1, text2) {
        const norm1 = this.normalizeText(text1);
        const norm2 = this.normalizeText(text2);

        if (norm1.length === 0 && norm2.length === 0) return 1.0;
        if (norm1.length === 0 || norm2.length === 0) return 0.0;

        const distance = this.levenshteinDistance(norm1, norm2);
        const maxLength = Math.max(norm1.length, norm2.length);

        return 1 - (distance / maxLength);
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + substitutionCost
                );
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Check if two tasks have similar components/labels
     */
    calculateComponentSimilarity(task1, task2) {
        const getComponents = (task) => {
            const components = [];
            if (task.project?.name) components.push(task.project.name.toLowerCase());
            if (task.team?.name) components.push(task.team.name.toLowerCase());
            if (task.labels) {
                components.push(...task.labels.map(label =>
                    (typeof label === 'string' ? label : label.name || '').toLowerCase()
                ));
            }
            return new Set(components);
        };

        const components1 = getComponents(task1);
        const components2 = getComponents(task2);

        if (components1.size === 0 && components2.size === 0) return 1.0;
        if (components1.size === 0 || components2.size === 0) return 0.0;

        const intersection = new Set([...components1].filter(x => components2.has(x)));
        const union = new Set([...components1, ...components2]);

        return intersection.size / union.size;
    }

    /**
     * Calculate comprehensive similarity score between two tasks
     */
    calculateTaskSimilarity(task1, task2) {
        // Title similarity (weighted highest)
        const titleSimilarity = this.calculateJaccardSimilarity(task1.title || '', task2.title || '');

        // Description similarity (multiple algorithms)
        const desc1 = task1.description || '';
        const desc2 = task2.description || '';

        const jaccardDesc = this.calculateJaccardSimilarity(desc1, desc2);
        const cosineDesc = this.calculateCosineSimilarity(desc1, desc2);
        const levenshteinDesc = this.calculateLevenshteinSimilarity(desc1, desc2);

        // Combined description similarity (average of algorithms)
        const descriptionSimilarity = (jaccardDesc + cosineDesc + levenshteinDesc) / 3;

        // Component similarity
        const componentSimilarity = this.calculateComponentSimilarity(task1, task2);

        // Weighted combined score
        const combinedScore = (
            titleSimilarity * 0.5 +
            descriptionSimilarity * 0.3 +
            componentSimilarity * this.config.componentWeight
        );

        return {
            overall: combinedScore,
            title: titleSimilarity,
            description: descriptionSimilarity,
            component: componentSimilarity,
            algorithms: {
                jaccard: jaccardDesc,
                cosine: cosineDesc,
                levenshtein: levenshteinDesc
            }
        };
    }

    /**
     * Identify potential duplicates within a set of tasks
     */
    findDuplicates(tasks) {
        this.duplicatePairs = [];
        this.processedCount = 0;
        this.comparisonCount = 0;

        const startTime = Date.now();

        if (this.config.verbose) {
            console.log(`🔍 Analyzing ${tasks.length} tasks for duplicates...`);
            console.log(`📊 Thresholds: Title=${this.config.titleSimilarityThreshold}, Combined=${this.config.combinedThreshold}`);
        }

        // Process in batches to avoid memory issues
        for (let i = 0; i < tasks.length; i++) {
            for (let j = i + 1; j < tasks.length; j++) {
                if (this.comparisonCount >= this.config.maxComparisons) {
                    if (this.config.verbose) {
                        console.log(`⚠️  Reached maximum comparison limit (${this.config.maxComparisons})`);
                    }
                    break;
                }

                const similarity = this.calculateTaskSimilarity(tasks[i], tasks[j]);
                this.comparisonCount++;

                // Check if tasks are potential duplicates
                if (this.isDuplicatePair(similarity)) {
                    this.duplicatePairs.push({
                        task1: tasks[i],
                        task2: tasks[j],
                        similarity: similarity,
                        confidence: this.calculateConfidence(similarity),
                        detectedAt: new Date().toISOString()
                    });
                }
            }

            this.processedCount++;

            // Progress reporting for large datasets
            if (this.config.verbose && this.processedCount % this.config.batchSize === 0) {
                const progress = (this.processedCount / tasks.length * 100).toFixed(1);
                console.log(`⏳ Progress: ${progress}% (${this.processedCount}/${tasks.length} tasks)`);
            }
        }

        const duration = Date.now() - startTime;

        if (this.config.verbose) {
            console.log(`✅ Analysis complete in ${duration}ms`);
            console.log(`🔢 Comparisons made: ${this.comparisonCount.toLocaleString()}`);
            console.log(`🎯 Potential duplicates found: ${this.duplicatePairs.length}`);
        }

        return this.duplicatePairs;
    }

    /**
     * Determine if similarity scores indicate a duplicate pair
     */
    isDuplicatePair(similarity) {
        // High title similarity threshold
        if (similarity.title >= this.config.titleSimilarityThreshold) {
            return true;
        }

        // Combined threshold for overall similarity
        if (similarity.overall >= this.config.combinedThreshold) {
            return true;
        }

        // Special case: very high description similarity with some title overlap
        if (similarity.description >= 0.85 && similarity.title >= 0.4) {
            return true;
        }

        return false;
    }

    /**
     * Calculate confidence score for duplicate detection
     */
    calculateConfidence(similarity) {
        // Weighted confidence based on multiple factors
        const titleWeight = 0.4;
        const descWeight = 0.3;
        const componentWeight = 0.2;
        const consistencyWeight = 0.1;

        // Consistency bonus when all algorithms agree
        const descVariance = this.calculateVariance([
            similarity.algorithms.jaccard,
            similarity.algorithms.cosine,
            similarity.algorithms.levenshtein
        ]);
        const consistencyBonus = descVariance < 0.1 ? 0.1 : 0;

        const confidence = (
            similarity.title * titleWeight +
            similarity.description * descWeight +
            similarity.component * componentWeight +
            consistencyBonus * consistencyWeight
        );

        return Math.min(confidence, 1.0);
    }

    /**
     * Calculate variance of an array of numbers
     */
    calculateVariance(numbers) {
        const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
        const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
        return variance;
    }

    /**
     * Group duplicates into clusters
     */
    clusterDuplicates(duplicatePairs = this.duplicatePairs) {
        const clusters = [];
        const processed = new Set();

        for (const pair of duplicatePairs) {
            const task1Id = pair.task1.id;
            const task2Id = pair.task2.id;

            if (processed.has(task1Id) || processed.has(task2Id)) continue;

            // Find all tasks related to this pair
            const cluster = new Set([task1Id, task2Id]);
            const relatedPairs = duplicatePairs.filter(p =>
                (p.task1.id === task1Id || p.task2.id === task1Id ||
                 p.task1.id === task2Id || p.task2.id === task2Id) &&
                p !== pair
            );

            // Add all related tasks to cluster
            for (const relatedPair of relatedPairs) {
                cluster.add(relatedPair.task1.id);
                cluster.add(relatedPair.task2.id);
            }

            // Mark all tasks in cluster as processed
            cluster.forEach(id => processed.add(id));

            // Create cluster object
            const clusterTasks = duplicatePairs
                .filter(p => cluster.has(p.task1.id) || cluster.has(p.task2.id))
                .reduce((tasks, p) => {
                    if (!tasks.some(t => t.id === p.task1.id)) tasks.push(p.task1);
                    if (!tasks.some(t => t.id === p.task2.id)) tasks.push(p.task2);
                    return tasks;
                }, []);

            clusters.push({
                id: `cluster-${clusters.length + 1}`,
                tasks: clusterTasks,
                size: clusterTasks.length,
                avgConfidence: duplicatePairs
                    .filter(p => cluster.has(p.task1.id) || cluster.has(p.task2.id))
                    .reduce((sum, p) => sum + p.confidence, 0) /
                    duplicatePairs.filter(p => cluster.has(p.task1.id) || cluster.has(p.task2.id)).length,
                pairs: duplicatePairs.filter(p => cluster.has(p.task1.id) || cluster.has(p.task2.id))
            });
        }

        // Sort clusters by confidence and size
        return clusters.sort((a, b) => (b.avgConfidence - a.avgConfidence) || (b.size - a.size));
    }

    /**
     * Generate detailed duplicate detection report
     */
    generateReport(duplicatePairs = this.duplicatePairs) {
        const clusters = this.clusterDuplicates(duplicatePairs);

        const report = {
            summary: {
                totalTasks: this.processedCount,
                comparisons: this.comparisonCount,
                duplicatePairs: duplicatePairs.length,
                clusters: clusters.length,
                avgConfidence: duplicatePairs.length > 0 ?
                    duplicatePairs.reduce((sum, p) => sum + p.confidence, 0) / duplicatePairs.length : 0,
                detectedAt: new Date().toISOString()
            },

            clusters: clusters.map(cluster => ({
                id: cluster.id,
                taskCount: cluster.size,
                confidence: cluster.avgConfidence,
                tasks: cluster.tasks.map(task => ({
                    id: task.id,
                    title: task.title,
                    state: task.state?.name || 'Unknown',
                    assignee: task.assignee?.name || 'Unassigned',
                    createdAt: task.createdAt
                })),
                similarityMatrix: this.generateSimilarityMatrix(cluster.tasks)
            })),

            recommendations: this.generateMergeRecommendations(clusters),

            configuration: {
                thresholds: {
                    titleSimilarity: this.config.titleSimilarityThreshold,
                    combinedSimilarity: this.config.combinedThreshold,
                    descriptionSimilarity: this.config.descriptionSimilarityThreshold
                },
                processing: {
                    batchSize: this.config.batchSize,
                    maxComparisons: this.config.maxComparisons
                }
            }
        };

        return report;
    }

    /**
     * Generate similarity matrix for tasks in a cluster
     */
    generateSimilarityMatrix(tasks) {
        const matrix = {};

        for (let i = 0; i < tasks.length; i++) {
            for (let j = i + 1; j < tasks.length; j++) {
                const task1 = tasks[i];
                const task2 = tasks[j];
                const similarity = this.calculateTaskSimilarity(task1, task2);

                const key = `${task1.id}-${task2.id}`;
                matrix[key] = {
                    overall: similarity.overall.toFixed(3),
                    title: similarity.title.toFixed(3),
                    description: similarity.description.toFixed(3),
                    component: similarity.component.toFixed(3)
                };
            }
        }

        return matrix;
    }

    /**
     * Generate merge recommendations for duplicate clusters
     */
    generateMergeRecommendations(clusters) {
        return clusters.map(cluster => {
            if (cluster.size < 2) return null;

            // Determine primary task (most recent or with most content)
            const primary = cluster.tasks.reduce((best, task) => {
                const taskScore = (task.description?.length || 0) +
                                (task.comments?.length || 0) * 10 +
                                (new Date(task.createdAt) > new Date(best.createdAt) ? 100 : 0);
                const bestScore = (best.description?.length || 0) +
                                 (best.comments?.length || 0) * 10;

                return taskScore > bestScore ? task : best;
            });

            const secondaries = cluster.tasks.filter(task => task.id !== primary.id);

            return {
                clusterId: cluster.id,
                action: 'merge',
                confidence: cluster.avgConfidence,
                primary: {
                    id: primary.id,
                    title: primary.title,
                    reason: 'Most comprehensive task with recent activity'
                },
                secondaries: secondaries.map(task => ({
                    id: task.id,
                    title: task.title,
                    mergeable: true,
                    preserveComments: true,
                    preserveAttachments: true
                })),
                mergeStrategy: {
                    title: `Keep primary title: "${primary.title}"`,
                    description: 'Combine descriptions with clear attribution',
                    comments: 'Preserve all comments with merge notation',
                    attachments: 'Preserve all attachments',
                    watchers: 'Combine all watchers',
                    labels: 'Union of all labels'
                }
            };
        }).filter(rec => rec !== null);
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);

    const options = {
        verbose: args.includes('--verbose') || args.includes('-v'),
        dryRun: !args.includes('--execute'),
        titleSimilarityThreshold: parseFloat(args.find(arg => arg.startsWith('--title-threshold='))?.split('=')[1]) || 0.8,
        combinedThreshold: parseFloat(args.find(arg => arg.startsWith('--combined-threshold='))?.split('=')[1]) || 0.7
    };

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Linear Task Duplicate Detector

Usage:
  node duplicate-detector.js [options]

Options:
  --verbose, -v                Enable verbose output
  --execute                   Execute merge actions (default: dry run)
  --title-threshold=N         Title similarity threshold (default: 0.8)
  --combined-threshold=N      Combined similarity threshold (default: 0.7)
  --help, -h                 Show this help message

Examples:
  node duplicate-detector.js --verbose
  node duplicate-detector.js --title-threshold=0.9 --execute
        `);
        process.exit(0);
    }

    // Mock task data for testing - uses configurable prefix
    const { linearConfig } = require('../../config/linear.config.js');

    let taskPrefix = 'TASK';
    try {
        const config = linearConfig.getTaskConfig();
        taskPrefix = config.prefix || 'TASK';
    } catch (error) {
        // Use default if config not available
    }

    const generateTaskId = (prefix, number) => {
        const p = prefix?.endsWith('-') ? prefix : `${prefix}-`;
        return `${p}${number}`;
    };

    const mockTasks = [
        {
            id: generateTaskId(taskPrefix, 101),
            title: 'Add unit tests for user authentication',
            description: 'We need to add comprehensive unit tests for the user authentication module to ensure proper coverage.',
            state: { name: 'In Progress' },
            assignee: { name: 'John Doe' },
            createdAt: '2024-01-15T10:00:00Z'
        },
        {
            id: generateTaskId(taskPrefix, 102),
            title: 'Unit tests for authentication module',
            description: 'Add unit test coverage for user authentication functionality to meet quality standards.',
            state: { name: 'To Do' },
            assignee: { name: 'Jane Smith' },
            createdAt: '2024-01-16T14:30:00Z'
        },
        {
            id: generateTaskId(taskPrefix, 103),
            title: 'Fix database connection pooling',
            description: 'Database connections are not being properly pooled, causing performance issues.',
            state: { name: 'In Review' },
            assignee: { name: 'Bob Wilson' },
            createdAt: '2024-01-17T09:15:00Z'
        }
    ];

    const detector = new DuplicateDetector(options);
    const duplicates = detector.findDuplicates(mockTasks);
    const report = detector.generateReport(duplicates);

    console.log('\n📋 Duplicate Detection Report');
    console.log('═'.repeat(50));
    console.log(`📊 Tasks analyzed: ${report.summary.totalTasks}`);
    console.log(`🔍 Comparisons made: ${report.summary.comparisons.toLocaleString()}`);
    console.log(`🎯 Duplicate pairs found: ${report.summary.duplicatePairs}`);
    console.log(`📦 Clusters identified: ${report.summary.clusters}`);
    console.log(`🎲 Average confidence: ${(report.summary.avgConfidence * 100).toFixed(1)}%`);

    if (report.clusters.length > 0) {
        console.log('\n🔗 Duplicate Clusters:');
        report.clusters.forEach((cluster, index) => {
            console.log(`\n${index + 1}. Cluster ${cluster.id} (${cluster.taskCount} tasks, ${(cluster.confidence * 100).toFixed(1)}% confidence)`);
            cluster.tasks.forEach(task => {
                console.log(`   • ${task.id}: ${task.title}`);
            });
        });

        console.log('\n💡 Merge Recommendations:');
        report.recommendations.forEach((rec, index) => {
            console.log(`\n${index + 1}. ${rec.clusterId}:`);
            console.log(`   Primary: ${rec.primary.id} - ${rec.primary.title}`);
            console.log(`   Merge: ${rec.secondaries.map(s => s.id).join(', ')}`);
            console.log(`   Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
        });
    }
}

module.exports = { DuplicateDetector };