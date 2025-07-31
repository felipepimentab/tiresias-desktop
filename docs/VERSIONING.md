# Version Management

This project uses semantic versioning. You can use the version script to bump the version:

```sh
npm run version [bump-type] [prerelease-type] [prerelease-number] [--dry-run]
```

Where:
- `[bump-type]`: One of: major, minor, patch, alpha, beta, rc
- `[prerelease-type]`: Optional: alpha, beta, or rc (only when used with major, minor, patch)
- `[prerelease-number]`: Optional: a number to append to the prerelease tag
- `--dry-run`: Show what would be done without making changes

Examples:
```sh
# Bump patch version (0.1.0 -> 0.1.1)
npm run version patch

# Bump patch version and add alpha tag (0.1.0 -> 0.1.1-alpha)
npm run version patch alpha

# Preview changes without applying them
npm run version patch alpha --dry-run
```
