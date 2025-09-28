/**
 * Linear Webhook Handler
 *
 * Handles real-time Linear webhooks for bidirectional integration
 * between Linear.app and the Claude Agentic Workflow System
 */

const crypto = require('crypto');
const { getCurrentEnvironment } = require('../config/environments.js');

class LinearWebhookHandler {
  constructor() {
    this.config = getCurrentEnvironment().linear;
    this.webhookSecret = this.config.webhookSecret;

    // Event handlers registry
    this.eventHandlers = new Map();

    // Register default event handlers
    this.registerDefaultHandlers();
  }

  /**
   * Verify webhook signature from Linear
   */
  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret || this.config.mockMode) {
      console.log('⚠️ Webhook signature verification disabled (mock mode or no secret)');
      return true;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      const providedSignature = signature.replace('sha256=', '');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );

      if (!isValid) {
        console.error('❌ Invalid webhook signature');
      }

      return isValid;

    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error.message);
      return false;
    }
  }

  /**
   * Handle incoming Linear webhook
   */
  async handleWebhook(payload, signature) {
    // Verify signature
    if (!this.verifyWebhookSignature(payload, signature)) {
      return {
        success: false,
        error: 'Invalid signature',
        status: 401
      };
    }

    try {
      const webhookData = JSON.parse(payload);
      const { action, type, data } = webhookData;

      console.log(`📥 Linear webhook received: ${type}.${action}`);

      // Route to appropriate handler
      const eventKey = `${type}.${action}`;
      const handler = this.eventHandlers.get(eventKey);

      if (handler) {
        const result = await handler(data, webhookData);
        console.log(`✅ Webhook ${eventKey} processed successfully`);
        return {
          success: true,
          eventType: eventKey,
          result
        };
      } else {
        console.log(`ℹ️ No handler for webhook event: ${eventKey}`);
        return {
          success: true,
          eventType: eventKey,
          message: 'No handler registered for this event type'
        };
      }

    } catch (error) {
      console.error('❌ Webhook processing failed:', error.message);
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  /**
   * Register default event handlers
   */
  registerDefaultHandlers() {
    // Issue events
    this.registerHandler('Issue.create', this.handleIssueCreated.bind(this));
    this.registerHandler('Issue.update', this.handleIssueUpdated.bind(this));
    this.registerHandler('Issue.remove', this.handleIssueRemoved.bind(this));

    // Comment events
    this.registerHandler('Comment.create', this.handleCommentCreated.bind(this));

    // Project events
    this.registerHandler('Project.update', this.handleProjectUpdated.bind(this));

    // Team events
    this.registerHandler('Team.update', this.handleTeamUpdated.bind(this));
  }

  /**
   * Register custom event handler
   */
  registerHandler(eventType, handler) {
    this.eventHandlers.set(eventType, handler);
    console.log(`📝 Registered webhook handler for ${eventType}`);
  }

  /**
   * Handle Issue.create webhook
   */
  async handleIssueCreated(issueData, webhookData) {
    console.log(`📋 New issue created: ${issueData.identifier} - ${issueData.title}`);

    // Check if this is an automated issue created by our system
    if (issueData.description?.includes('Claude Agentic Workflow System')) {
      console.log('🤖 Skipping processing of our own automated issue');
      return { processed: false, reason: 'automated_issue' };
    }

    // Notify relevant agents about new issue
    await this.notifyAgentsOfNewIssue(issueData);

    // Check if issue requires immediate agent attention
    if (issueData.priority <= 2) { // High or urgent priority
      await this.triggerHighPriorityResponse(issueData);
    }

    return {
      processed: true,
      issueId: issueData.id,
      identifier: issueData.identifier,
      actions: ['notified_agents', issueData.priority <= 2 ? 'triggered_high_priority' : null].filter(Boolean)
    };
  }

  /**
   * Handle Issue.update webhook
   */
  async handleIssueUpdated(issueData, webhookData) {
    console.log(`📝 Issue updated: ${issueData.identifier} - ${issueData.title}`);

    const updatedAt = new Date(issueData.updatedAt);
    const now = new Date();
    const timeDiff = now - updatedAt;

    // Ignore updates from our own system (within last 30 seconds)
    if (timeDiff < 30000) {
      console.log('🤖 Skipping processing of recent automated update');
      return { processed: false, reason: 'recent_automated_update' };
    }

    // Handle state changes
    if (webhookData.data.state) {
      await this.handleIssueStateChange(issueData, webhookData.data.state);
    }

    // Handle assignment changes
    if (webhookData.data.assignee) {
      await this.handleIssueAssignmentChange(issueData, webhookData.data.assignee);
    }

    // Handle priority changes
    if (webhookData.data.priority !== undefined) {
      await this.handleIssuePriorityChange(issueData, webhookData.data.priority);
    }

    return {
      processed: true,
      issueId: issueData.id,
      identifier: issueData.identifier,
      changes: Object.keys(webhookData.data)
    };
  }

  /**
   * Handle Issue.remove webhook
   */
  async handleIssueRemoved(issueData, webhookData) {
    console.log(`🗑️ Issue removed: ${issueData.identifier}`);

    // Clean up any local tracking of this issue
    await this.cleanupRemovedIssue(issueData);

    return {
      processed: true,
      issueId: issueData.id,
      identifier: issueData.identifier,
      action: 'cleanup_completed'
    };
  }

  /**
   * Handle Comment.create webhook
   */
  async handleCommentCreated(commentData, webhookData) {
    console.log(`💬 New comment on issue ${commentData.issue?.identifier}`);

    // Skip our own automated comments
    if (commentData.body?.includes('Claude Agentic Workflow System')) {
      return { processed: false, reason: 'automated_comment' };
    }

    // Check if comment contains agent mentions or commands
    const agentMentions = this.extractAgentMentions(commentData.body);
    const commands = this.extractCommands(commentData.body);

    if (agentMentions.length > 0) {
      await this.notifyMentionedAgents(agentMentions, commentData);
    }

    if (commands.length > 0) {
      await this.processCommands(commands, commentData);
    }

    return {
      processed: true,
      commentId: commentData.id,
      issueId: commentData.issue?.id,
      agentMentions,
      commands
    };
  }

  /**
   * Handle Project.update webhook
   */
  async handleProjectUpdated(projectData, webhookData) {
    console.log(`📊 Project updated: ${projectData.name}`);

    // Update our project configuration if needed
    if (projectData.id === this.config.projectId) {
      await this.updateProjectConfiguration(projectData);
    }

    return {
      processed: true,
      projectId: projectData.id,
      projectName: projectData.name
    };
  }

  /**
   * Handle Team.update webhook
   */
  async handleTeamUpdated(teamData, webhookData) {
    console.log(`👥 Team updated: ${teamData.name}`);

    // Update our team configuration if needed
    if (teamData.id === this.config.teamId) {
      await this.updateTeamConfiguration(teamData);
    }

    return {
      processed: true,
      teamId: teamData.id,
      teamName: teamData.name
    };
  }

  /**
   * Notify agents of new issue
   */
  async notifyAgentsOfNewIssue(issueData) {
    console.log(`📢 Notifying agents of new issue: ${issueData.identifier}`);

    // This would integrate with the agent system to notify relevant agents
    // For now, log the notification
    const relevantAgents = this.determineRelevantAgents(issueData);

    for (const agent of relevantAgents) {
      console.log(`🔔 Notifying ${agent} of new issue ${issueData.identifier}`);
      // In production, this would send actual notifications to agents
    }

    return relevantAgents;
  }

  /**
   * Determine which agents are relevant for an issue
   */
  determineRelevantAgents(issueData) {
    const agents = [];

    // AUDITOR for code quality issues
    if (issueData.labels?.some(label => ['bug', 'code-quality', 'performance'].includes(label.name))) {
      agents.push('AUDITOR');
    }

    // EXECUTOR for implementation tasks
    if (issueData.labels?.some(label => ['enhancement', 'feature', 'fix'].includes(label.name))) {
      agents.push('EXECUTOR');
    }

    // GUARDIAN for security and monitoring issues
    if (issueData.labels?.some(label => ['security', 'monitoring', 'incident'].includes(label.name))) {
      agents.push('GUARDIAN');
    }

    // STRATEGIST for high-priority or complex issues
    if (issueData.priority <= 2 || issueData.estimate >= 8) {
      agents.push('STRATEGIST');
    }

    // Default to STRATEGIST if no specific agent determined
    if (agents.length === 0) {
      agents.push('STRATEGIST');
    }

    return agents;
  }

  /**
   * Trigger high priority response
   */
  async triggerHighPriorityResponse(issueData) {
    console.log(`🚨 Triggering high priority response for ${issueData.identifier}`);

    // This would trigger immediate agent attention for high-priority issues
    // For now, log the trigger
    console.log(`⚡ High priority issue requires immediate attention: ${issueData.title}`);

    return {
      triggered: true,
      priority: issueData.priority,
      responseTime: 'immediate'
    };
  }

  /**
   * Handle issue state change
   */
  async handleIssueStateChange(issueData, newState) {
    console.log(`🔄 Issue ${issueData.identifier} state changed to: ${newState.name}`);

    // If moved to "In Progress", ensure assigned agent is notified
    if (newState.name === 'In Progress' && issueData.assignee) {
      await this.notifyAgentOfAssignment(issueData.assignee, issueData);
    }

    // If moved to "Done", trigger completion workflow
    if (newState.name === 'Done') {
      await this.handleIssueCompletion(issueData);
    }

    return {
      stateChanged: true,
      newState: newState.name,
      issueId: issueData.id
    };
  }

  /**
   * Handle issue assignment change
   */
  async handleIssueAssignmentChange(issueData, newAssignee) {
    console.log(`👤 Issue ${issueData.identifier} assigned to: ${newAssignee?.name || 'unassigned'}`);

    if (newAssignee) {
      await this.notifyAgentOfAssignment(newAssignee, issueData);
    }

    return {
      assignmentChanged: true,
      newAssignee: newAssignee?.name,
      issueId: issueData.id
    };
  }

  /**
   * Handle issue priority change
   */
  async handleIssuePriorityChange(issueData, newPriority) {
    console.log(`🔥 Issue ${issueData.identifier} priority changed to: ${newPriority}`);

    // If escalated to high priority, trigger urgent response
    if (newPriority <= 2) {
      await this.triggerHighPriorityResponse(issueData);
    }

    return {
      priorityChanged: true,
      newPriority,
      issueId: issueData.id
    };
  }

  /**
   * Extract agent mentions from comment text
   */
  extractAgentMentions(text) {
    const agentPattern = /@(AUDITOR|EXECUTOR|GUARDIAN|SCHOLAR|STRATEGIST|ANALYZER|RESEARCHER)/gi;
    const matches = text.match(agentPattern) || [];
    return matches.map(match => match.replace('@', '').toUpperCase());
  }

  /**
   * Extract commands from comment text
   */
  extractCommands(text) {
    const commandPattern = /\/(\w+)(?:\s+(.+))?/g;
    const commands = [];
    let match;

    while ((match = commandPattern.exec(text)) !== null) {
      commands.push({
        command: match[1],
        args: match[2]?.trim().split(/\s+/) || []
      });
    }

    return commands;
  }

  /**
   * Notify mentioned agents
   */
  async notifyMentionedAgents(agentMentions, commentData) {
    for (const agent of agentMentions) {
      console.log(`🔔 ${agent} mentioned in comment on ${commentData.issue?.identifier}`);
      // In production, this would send actual notifications
    }
  }

  /**
   * Process commands from comments
   */
  async processCommands(commands, commentData) {
    for (const cmd of commands) {
      console.log(`⚡ Processing command: /${cmd.command} ${cmd.args.join(' ')}`);
      // In production, this would execute actual commands
    }
  }

  /**
   * Cleanup removed issue
   */
  async cleanupRemovedIssue(issueData) {
    console.log(`🧹 Cleaning up removed issue: ${issueData.identifier}`);
    // Clean up any local tracking, caches, etc.
  }

  /**
   * Update project configuration
   */
  async updateProjectConfiguration(projectData) {
    console.log(`⚙️ Updating project configuration: ${projectData.name}`);
    // Update local project settings if needed
  }

  /**
   * Update team configuration
   */
  async updateTeamConfiguration(teamData) {
    console.log(`⚙️ Updating team configuration: ${teamData.name}`);
    // Update local team settings if needed
  }

  /**
   * Notify agent of assignment
   */
  async notifyAgentOfAssignment(assignee, issueData) {
    console.log(`📬 Notifying ${assignee.name} of assignment: ${issueData.identifier}`);
    // In production, this would send actual assignment notifications
  }

  /**
   * Handle issue completion
   */
  async handleIssueCompletion(issueData) {
    console.log(`🎉 Issue completed: ${issueData.identifier}`);
    // Trigger completion workflows, metrics collection, etc.
  }

  /**
   * Get webhook statistics
   */
  getWebhookStats() {
    return {
      handlersRegistered: this.eventHandlers.size,
      handlers: Array.from(this.eventHandlers.keys()),
      config: {
        webhookUrl: this.config.webhookUrl,
        hasSecret: !!this.webhookSecret,
        mockMode: this.config.mockMode
      }
    };
  }
}

module.exports = LinearWebhookHandler;