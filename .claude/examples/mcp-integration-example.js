/**
 * Example: Using Linear MCP Tools Instead of Webhooks
 *
 * This demonstrates how Claude Code can interact with Linear
 * directly using MCP tools, without needing any webhook infrastructure.
 */

// Note: In Claude Code, these functions are available as MCP tools
// This is a demonstration of the pattern

async function demonstrateMCPIntegration() {
  console.log('🚀 Demonstrating MCP-based Linear Integration\n');

  // Example 1: Get current user
  console.log('1️⃣ Getting current user:');
  console.log('   mcp__linear-server__get_user({ query: "me" })');
  console.log('   → Returns user details directly\n');

  // Example 2: List active issues
  console.log('2️⃣ Listing active issues:');
  console.log('   mcp__linear-server__list_issues({');
  console.log('     assignee: "me",');
  console.log('     state: "In Progress",');
  console.log('     limit: 10');
  console.log('   })');
  console.log('   → Returns issues immediately\n');

  // Example 3: Create a new issue
  console.log('3️⃣ Creating a new issue:');
  console.log('   mcp__linear-server__create_issue({');
  console.log('     title: "Fix authentication bug",');
  console.log('     team: "engineering",');
  console.log('     labels: ["bug", "high-priority"],');
  console.log('     description: "Found during code assessment"');
  console.log('   })');
  console.log('   → Creates issue and returns details\n');

  // Example 4: Update issue status
  console.log('4️⃣ Updating issue status:');
  console.log('   mcp__linear-server__update_issue({');
  console.log('     id: "ISSUE-123",');
  console.log('     state: "Done"');
  console.log('   })');
  console.log('   → Updates immediately\n');

  // Example 5: Add a comment
  console.log('5️⃣ Adding a comment:');
  console.log('   mcp__linear-server__create_comment({');
  console.log('     issueId: "ISSUE-123",');
  console.log('     body: "Fixed in PR #456"');
  console.log('   })');
  console.log('   → Comment posted instantly\n');

  console.log('✅ Benefits over webhooks:');
  console.log('   • No server infrastructure needed');
  console.log('   • Works immediately in Claude Code');
  console.log('   • Synchronous operations (easier debugging)');
  console.log('   • No webhook signature validation');
  console.log('   • No missed events or retries');
  console.log('   • Direct error handling\n');

  console.log('📚 See .claude/INTEGRATION-GUIDE.md for more details');
}

// GitHub CLI examples
async function demonstrateGitHubCLI() {
  console.log('\n🐙 GitHub CLI Integration Examples:\n');

  console.log('1️⃣ Create a PR:');
  console.log('   gh pr create --title "Fix auth" --body "Fixes #123"');

  console.log('\n2️⃣ List open PRs:');
  console.log('   gh pr list --state open --assignee @me');

  console.log('\n3️⃣ Review a PR:');
  console.log('   gh pr review 456 --approve --body "LGTM"');

  console.log('\n4️⃣ Check workflow status:');
  console.log('   gh run list --workflow=ci.yml');

  console.log('\n✅ No GitHub webhooks needed!');
}

// Run demonstrations
if (require.main === module) {
  demonstrateMCPIntegration();
  demonstrateGitHubCLI();
}

module.exports = { demonstrateMCPIntegration, demonstrateGitHubCLI };
