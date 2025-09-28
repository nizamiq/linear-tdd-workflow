#!/bin/bash

# Script to rename documentation files to follow consistent naming convention

cd /Users/cnross/code/linear-tdd-workflow

# Rename files with spaces and special characters
mv "docs/Agentic Workflow Design_ A Framework for Autonomous Code Quality.md" "docs/agentic-workflow-design.md" 2>/dev/null
mv "docs/Agentic Workflow_ Objectives and Success Metrics.md" "docs/agentic-workflow-objectives.md" 2>/dev/null
mv "docs/AI Coding Assistant Development Protocol.md" "docs/ai-development-protocol.md" 2>/dev/null
mv "docs/Autonomous AI SRE - Test-Driven Development Executor.md" "docs/autonomous-ai-sre-tdd.md" 2>/dev/null
mv "docs/Claude Directory Scaffolding Guide for Agentic Workflow.md" "docs/claude-directory-scaffolding.md" 2>/dev/null
mv "docs/Clean code AI (Linear).md" "docs/clean-code-ai-linear.md" 2>/dev/null
mv "docs/Command Tasks and Performance Metrics.md" "docs/command-tasks-metrics.md" 2>/dev/null
mv "docs/coding rules.md" "docs/coding-rules.md" 2>/dev/null
mv "docs/docs maintenance.md" "docs/docs-maintenance.md" 2>/dev/null
mv "docs/get it done, GO! Linear.md" "docs/get-it-done-linear.md" 2>/dev/null
mv "docs/let's go Linear.md" "docs/lets-go-linear.md" 2>/dev/null
mv "docs/Linear AI.md" "docs/linear-ai.md" 2>/dev/null
mv "docs/Linear Alignment.md" "docs/linear-alignment.md" 2>/dev/null
mv "docs/Linear Cycle Planning.md" "docs/linear-cycle-planning.md" 2>/dev/null
mv "docs/Linear kickoff existing.md" "docs/linear-kickoff-existing.md" 2>/dev/null
mv "docs/Linear Setup.md" "docs/linear-setup.md" 2>/dev/null
mv "docs/MCP Research Findings.md" "docs/mcp-research-findings.md" 2>/dev/null
mv "docs/PRD Template.md" "docs/prd-template.md" 2>/dev/null
mv "docs/relentless linear.md" "docs/relentless-linear.md" 2>/dev/null
mv "docs/Repeatability and Continuous Optimization Strategies.md" "docs/repeatability-optimization-strategies.md" 2>/dev/null
mv "docs/Subagent Roles and Responsibilities.md" "docs/subagent-roles-responsibilities.md" 2>/dev/null
mv "docs/execution linear.py" "docs/execution-linear.py" 2>/dev/null
mv "docs/Action Plan Generation from Clean Code Assessment  (Linear).md" "docs/action-plan-generation-linear.md" 2>/dev/null

echo "File renaming complete!"