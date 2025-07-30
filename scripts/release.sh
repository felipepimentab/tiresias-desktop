#!/bin/bash

# This script helps with creating a new release

set -e

# Check if version is provided
if [ -z "$1" ]; then
  echo "Error: No version specified"
  echo "Usage: ./scripts/release.sh <version> [channel]"
  echo "Example: ./scripts/release.sh 3.2.0 beta"
  exit 1
fi

# Set variables
VERSION=$1
CHANNEL=${2:-stable}

# Validate version format (basic check for semver)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$ ]]; then
  echo "Error: Version must follow semantic versioning (e.g., 3.2.0)"
  exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory is not clean. Please commit or stash changes first."
  exit 1
fi

# Update version in package.json
npm version $VERSION --no-git-tag-version

# Get current date in YYYY-MM-DD format
DATE=$(date +"%Y-%m-%d")

# Update CHANGELOG.md
sed -i '' "s/## \[Unreleased\]/## \[Unreleased\]\n\n## \[$VERSION\] - $DATE/" CHANGELOG.md

# Commit changes
git add package.json CHANGELOG.md
git commit -m "Bump version to $VERSION"

# Create tag
git tag -a "v$VERSION" -m "Release $VERSION"

# Push changes
echo "Changes committed and tagged. Ready to push."
echo "Run the following commands to push:"
echo "  git push origin main"
echo "  git push origin v$VERSION"

echo "\nTo trigger a CI build with the $CHANNEL channel, create a workflow dispatch event with:"
echo "  distribution-channel: $CHANNEL"