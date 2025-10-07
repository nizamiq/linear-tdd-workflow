# User Story Registry

## Purpose

Track which features are implemented and which have E2E test coverage to ensure **functional releases** where every shipped feature has been validated end-to-end.

## Registry Location

`.claude/user-stories/registry.yaml`

## Feature Status

| Status        | Meaning               | Blocks Release?        |
| ------------- | --------------------- | ---------------------- |
| `implemented` | Has code + E2E test   | ❌ No - green light    |
| `partial`     | Has code, NO E2E test | ✅ Yes - must add test |
| `planned`     | Not yet built         | ❌ No - future work    |

## Registry Format

```yaml
features:
  feature-slug:
    name: "User-facing description"
    status: implemented|partial|planned
    e2e_test: "path/to/test.js::test-name" or null
    notes: "Optional details"
```

## Quick Commands

```bash
# View all features and their status
npm run release:user-stories

# Add new feature to registry
npm run release:add-story -- \
  --name "my-feature" \
  --status implemented \
  --test "tests/e2e/my-feature.test.js"

# Validate functional release readiness
npm run release:validate-functional

# Check E2E test coverage
node .claude/scripts/user-stories/registry-helper.js coverage
```

## Workflow

### When Implementing a New Feature

1. **Implement the feature** (with TDD: unit + integration tests)
2. **Write E2E test** covering the full user workflow
3. **Add to registry:**
   ```bash
   node .claude/scripts/user-stories/registry-helper.js add \
     --name "feature-name" \
     --status implemented \
     --test "tests/e2e/feature.test.js"
   ```
4. **Validate:** `npm run release:validate-functional`
5. **Release:** `/release 1.x.0` (functional gate passes automatically)

### When Feature is Partially Done

If you've implemented a feature but haven't written E2E test yet:

```yaml
features:
  my-feature:
    name: 'Description'
    status: partial # Blocks release!
    e2e_test: null
```

**This will block release until E2E test is added.**

### When Planning Future Work

```yaml
features:
  future-feature:
    name: 'Description'
    status: planned # Doesn't block release
    e2e_test: null
```

## Integration with Release Journey

When you run `/release 1.x.0`, Phase 2.5 automatically:

1. Reads this registry
2. Finds all `implemented` features
3. Verifies each has `e2e_test` specified
4. Runs those E2E tests
5. **Blocks release** if any:
   - Have `status: partial` (no E2E test)
   - Have E2E tests that fail

## Best Practices

1. **Update registry immediately** after adding E2E test
2. **Never merge PRs** with `status: partial` for new features
3. **Use descriptive slugs**: `feature-name`, not `feat1`
4. **Keep notes updated** with implementation details
5. **Review registry** before starting releases

## Examples

### Good: Implemented with E2E Test

```yaml
user-authentication:
  name: 'User can log in with email and password'
  status: implemented
  e2e_test: 'tests/e2e/auth.test.js::login-workflow'
  notes: 'Covers login, token refresh, logout'
```

### Bad: Partial (Blocks Release)

```yaml
user-authentication:
  name: 'User can log in with email and password'
  status: partial # ❌ Will block release
  e2e_test: null
```

### Good: Planned (Future Work)

```yaml
oauth-integration:
  name: 'User can log in with Google OAuth'
  status: planned # ✅ Won't block release
  e2e_test: null
  notes: 'Planned for Sprint 12'
```

## Validation

Run validation before release:

```bash
npm run release:validate-functional
```

Output shows:

- ✅ Implemented features with E2E coverage
- ❌ Partial features blocking release
- ⏳ Planned features (informational)

## See Also

- `.claude/docs/FUNCTIONAL-RELEASE.md` - Complete functional release guide
- `.claude/scripts/release/functional-gate.js` - Validation implementation
- `tests/e2e/` - E2E test suite
