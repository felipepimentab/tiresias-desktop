# CI/CD Integration

The version script automatically detects CI environments (like GitHub Actions) and skips Git operations when running in CI. This prevents errors related to Git user configuration in CI pipelines.

In CI workflows, the version is managed by the GitHub Actions workflow, which sets the version based on the distribution channel and commit timestamp.

For more details, see the [scripts README](../scripts/README.md).
