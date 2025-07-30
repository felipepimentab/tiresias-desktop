# Versioning and Release System

## Version Format

This project follows [Semantic Versioning](https://semver.org/) (SemVer) with the format `MAJOR.MINOR.PATCH`:

- **MAJOR**: Incremented for incompatible API changes
- **MINOR**: Incremented for backward-compatible functionality additions
- **PATCH**: Incremented for backward-compatible bug fixes

Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

## Version Management

### Local Development

The application version is defined in the root `package.json` file. During development, you should update this version according to the changes you're making:

```json
{
  "version": "3.1.0"
}
```

### CI/CD Process

In the CI/CD pipeline, the version is enhanced with additional information:

- The base version is taken from `package.json`
- A distribution channel identifier is added (e.g., `beta`, `alpha`, `stable`)
- A timestamp is appended to ensure uniqueness

The resulting format is: `VERSION-CHANNEL.TIMESTAMP`

For example: `3.1.0-beta.1700000000`

## Release Process

### Creating a New Release

1. Update the version in `package.json` according to SemVer principles
2. Update the `CHANGELOG.md` file with details of the changes
3. Commit these changes with a message like "Bump version to X.Y.Z"
4. Push to the main branch

The CI/CD pipeline will automatically:
- Build the application with the new version
- Create a GitHub release with the appropriate tag
- Generate update files for the auto-updater

### Distribution Channels

The application supports multiple distribution channels:

- **stable**: Production-ready releases
- **beta**: Pre-release versions for testing new features
- **alpha**: Early development versions

## Auto-Update System

The application uses `electron-updater` to provide automatic updates. The update channel is controlled by the `VITE_DISTRIBUTION_CHANNEL` environment variable, which is set during the build process.

Users on the stable channel will only receive stable updates, while users on beta or alpha channels will receive updates for their respective channels.

## Version Display

The application version is exposed to the renderer process through the preload script and can be accessed via the `versions` object.