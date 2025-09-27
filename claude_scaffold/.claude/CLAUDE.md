# Agentic Workflow Project Context

## Project Overview
This is an advanced agentic workflow system designed to autonomously manage and enhance code quality through specialized AI subagents. The system operates with minimal human intervention while maintaining transparency and control.

## Architecture
- **Multi-agent system** with 5 specialized subagents
- **MCP tool integration** for external service connectivity
- **Linear integration** for task management and reporting
- **GitHub integration** for version control and CI/CD
- **Continuous learning** through pattern recognition

## Subagent Roles
1. **AUDITOR**: Clean code assessment and issue identification
2. **EXECUTOR**: Implementation of improvements and fixes
3. **GUARDIAN**: CI/CD pipeline monitoring and protection
4. **STRATEGIST**: Workflow orchestration and planning
5. **SCHOLAR**: Learning and pattern recognition

## Coding Standards
- Follow existing project formatter settings
- Maintain test coverage above 90%
- Keep cyclomatic complexity below 10
- Use TypeScript for all new JavaScript code
- Implement comprehensive error handling
- Add JSDoc comments for public APIs
- Follow SOLID principles

## Workflow Conventions
- All changes must pass CI/CD pipeline
- Atomic commits with descriptive messages
- Branch naming: `agent/{agent-name}/{task-id}-{description}`
- PR titles: `[AGENT-{name}] {task-id}: {description}`
- Tag issues with `CLEAN-XXX` format

## Quality Gates
- Zero critical security vulnerabilities
- All tests passing
- Code coverage maintained or improved
- No high-priority code smells
- Documentation updated
- Performance impact assessed

## MCP Tool Usage
- **Linear**: Task creation, updates, and reporting
- **GitHub**: Repository operations and CI/CD
- **Memory**: Pattern storage and retrieval
- **Filesystem**: Safe file operations
- **Sentry**: Error monitoring and alerting

## Agent Coordination
Agents communicate through structured JSON messages and shared context. The STRATEGIST coordinates all activities and maintains the project board state.
