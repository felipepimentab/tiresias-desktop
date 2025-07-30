# Tiresias Desktop Companion

Desktop application for the Tiresias Project.

## Version Management

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

### CI/CD Integration

The version script automatically detects CI environments (like GitHub Actions) and skips Git operations when running in CI. This prevents errors related to Git user configuration in CI pipelines.

In CI workflows, the version is managed by the GitHub Actions workflow, which sets the version based on the distribution channel and commit timestamp.

For more details, see the [scripts README](./scripts/README.md).

### NPM Scripts

```sh
npm install
```
Install dependencies

```sh
npm start
```
Start application in development more with hot-reload.

---
```sh
npm run build
```
Runs the `build` command in all workspaces if present.

---
```sh
npm run compile
```
First runs the `build` script,
then compiles the project into executable using `electron-builder` with the specified configuration.

---
```sh
npm run compile -- --dir -c.asar=false
```
Same as `npm run compile` but pass to `electron-builder` additional parameters to disable asar archive and installer
creating.
Useful for debugging compiled application.

---
```sh
npm run test
```
Executes end-to-end tests on **compiled app** using Playwright.

---
```sh
npm run typecheck
```
Runs the `typecheck` command in all workspaces if present.
