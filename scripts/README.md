# Tiresias Desktop Scripts

This directory contains utility scripts for the Tiresias Desktop project.

## Version Management

### `version.js`

This script handles version bumping according to semantic versioning rules.

#### Usage

```bash
node scripts/version.js [bump-type] [prerelease-type] [prerelease-number] [--dry-run]
# or
npm run version [bump-type] [prerelease-type] [prerelease-number] [--dry-run]
```

Where:
- `[bump-type]`: One of: major, minor, patch, alpha, beta, rc
- `[prerelease-type]`: Optional: alpha, beta, or rc (only when used with major, minor, patch)
- `[prerelease-number]`: Optional: a number to append to the prerelease tag

#### Options

- `--dry-run`, `-d`: Show what would be done without making changes

#### Examples

```bash
# Bump patch version (0.1.0 -> 0.1.1)
node scripts/version.js patch

# Bump minor version (0.1.0 -> 0.2.0)
node scripts/version.js minor

# Bump major version (0.1.0 -> 1.0.0)
node scripts/version.js major

# Create alpha version (0.1.0 -> 0.1.0-alpha)
node scripts/version.js alpha

# Create alpha version with identifier (0.1.0 -> 0.1.0-alpha.1)
node scripts/version.js alpha 1

# Create beta version with identifier (0.1.0 -> 0.1.0-beta.2)
node scripts/version.js beta 2

# Bump patch version and add alpha tag (0.1.0 -> 0.1.1-alpha)
node scripts/version.js patch alpha

# Bump minor version and add beta tag (0.1.0 -> 0.2.0-beta)
node scripts/version.js minor beta

# Dry run to see what would happen without making changes
node scripts/version.js patch --dry-run

# Dry run with combined version bump and prerelease tag
node scripts/version.js patch alpha --dry-run
```

#### What it does

1. Updates the version in the main `package.json`
2. Updates the version in `packages/renderer/package.json`
3. Creates a Git commit with the version change (skipped in CI environments)
4. Creates a Git tag for the new version (skipped in CI environments)

#### CI Environment Behavior

When running in CI environments (like GitHub Actions), the script automatically detects this and skips Git operations (commit and tag creation). This prevents errors related to Git user configuration in CI pipelines.

#### Local Development

When running locally, after executing the script, you can push the changes and tag with:

```bash
git push && git push --tags
```

Or use the provided npm script:

```bash
npm run release
```