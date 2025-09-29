# /learn - Pattern Mining & Learning

Analyze successful patterns from merged PRs to improve future fixes.

## Usage
```
/learn [--period=7d] [--focus=area]
```

## Script Entrypoints
```bash
# Via Makefile (recommended)
make learn

# Direct journey execution
node .claude/journeys/jr5-pattern-mining.js

# Via CLI
npm run agent:invoke SCHOLAR:mine-patterns -- --period 7d
```

## Parameters
- `--period`: Analysis time window (default: 7d)
  - `1d`, `7d`, `30d`, `90d`, `all`
- `--focus`: Specific area to analyze
  - `tests`, `refactoring`, `performance`, `security`

## Learning Sources
1. **Merged PRs** - Successful code patterns
2. **Code Reviews** - Feedback and improvements
3. **Test Patterns** - Effective test strategies
4. **Fix Success** - What worked vs what didn't
5. **Performance Wins** - Optimizations that worked

## Pattern Categories

### Code Patterns
- Refactoring techniques that improved readability
- Design patterns successfully applied
- Anti-patterns that were removed

### Test Patterns
- Test structures that caught bugs
- Mock strategies that worked
- Coverage improvements

### Fix Patterns
- Common fix approaches for issue types
- TDD cycles that were most effective
- Rollback strategies that worked

## Linear Integration
- **Reads**: Completed tasks and their PRs
- **Analyzes**: Time to completion, rework rate
- **Creates**: IMPROVE-XXX for systemic improvements
- **Updates**: Knowledge base for agents

## MCP Tools Used
- `gh pr list --state merged` - Get merged PRs
- `gh pr view` - Analyze PR details
- `mcp__linear-server__list_issues` - Get completed tasks
- `context7` - Library best practices
- `sequential-thinking` - Pattern analysis

## Learning Pipeline
```
Merged PRs → Pattern Extraction → Validation → Knowledge Update
     ↓              ↓                ↓              ↓
 Code Diff    Identify Success   Test Pattern   Update Agents
```

## Agents Involved
- **Primary**: SCHOLAR - Pattern analysis
- **Support**: All agents provide context
- **Updates**: All agents receive learnings

## Output
1. **Pattern Report** (`reports/patterns-YYYYMMDD.json`)
2. **Agent Updates** - Improved decision rules
3. **Best Practices** - Documentation updates
4. **Linear Tasks** - IMPROVE-XXX for systemic changes
5. **Metrics** - Success rate improvements

## Discovered Patterns Example
```json
{
  "pattern": "Early Return Refactoring",
  "frequency": 23,
  "success_rate": 0.95,
  "example": {
    "before": "if (condition) { ... nested code ... }",
    "after": "if (!condition) return; ... flat code ...",
    "benefit": "Reduced complexity by 30%"
  },
  "recommendation": "Apply to functions with 3+ nesting levels"
}
```

## Knowledge Updates
Automatically updates agent configurations:
```yaml
# Added to executor.yaml
patterns:
  - name: "early-return"
    confidence: 0.95
    when: "nesting_level > 3"
    apply: "refactor_early_return"
```

## Success Metrics
- **Pattern Discovery Rate**: New patterns/week
- **Application Success**: % of patterns that improve code
- **Agent Improvement**: Reduction in fix time
- **Rework Reduction**: Less PR revisions needed

## Example Workflow
```bash
# Weekly learning session
/learn --period=7d

# Output:
# 📚 Analyzing 47 merged PRs from last 7 days...
#
# ✨ Discovered Patterns:
# 1. "Async Test Stabilization" (used 12 times, 100% success)
# 2. "Error Boundary Pattern" (used 8 times, 95% success)
# 3. "Memoization for Perf" (used 5 times, 90% success)
#
# 🎯 Agent Updates:
# - EXECUTOR: Added 3 new fix patterns
# - TESTER: Improved test generation for async
# - GUARDIAN: New pipeline recovery pattern
#
# 📈 Improvements:
# - Fix success rate: 78% → 85%
# - Average fix time: 25min → 18min
# - Test stability: 92% → 97%
```

## Continuous Learning
- Runs automatically weekly
- Cumulative knowledge building
- Shares patterns across projects
- Prevents repeated mistakes

## Pattern Validation
Before adopting a pattern:
1. Minimum 3 successful uses
2. >85% success rate
3. Measurable improvement
4. No negative side effects

## Export/Import
```bash
# Export successful patterns
/learn --export patterns.json

# Import patterns to new project
/learn --import patterns.json
```

## Notes
- Privacy: Never shares proprietary code
- Focuses on patterns, not specifics
- Improves over time
- Can be configured per team preferences