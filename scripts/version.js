#!/usr/bin/env node

/**
 * Version management script for Tiresias Desktop
 *
 * This script handles version bumping according to semantic versioning rules.
 * Usage: node scripts/version.js [major|minor|patch|alpha|beta|rc] [optional-identifier]
 * Examples:
 *   node scripts/version.js patch         # 0.1.0 -> 0.1.1
 *   node scripts/version.js minor         # 0.1.0 -> 0.2.0
 *   node scripts/version.js major         # 0.1.0 -> 1.0.0
 *   node scripts/version.js alpha         # 0.1.0 -> 0.1.0-alpha
 *   node scripts/version.js alpha 1       # 0.1.0 -> 0.1.0-alpha.1
 *   node scripts/version.js beta 2        # 0.1.0 -> 0.1.0-beta.2
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read package.json
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Read renderer package.json
const rendererPackageJsonPath = path.join(rootDir, 'packages', 'renderer', 'package.json');
const rendererPackageJson = JSON.parse(fs.readFileSync(rendererPackageJsonPath, 'utf8'));

// Get current version
const currentVersion = packageJson.version || '0.0.0';
let [currentBase, currentPrerelease] = currentVersion.split('-');
let [major, minor, patch] = currentBase.split('.').map(Number);

// Handle command line arguments
const args = process.argv.slice(2).filter(arg => arg !== '--dry-run' && arg !== '-d');
const bumpType = args[0] || 'patch';
const prereleaseType = args[1] || '';
const prereleaseIdentifier = args[2] || '';
const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

// Show help if requested
if (bumpType === '--help' || bumpType === '-h') {
  console.log('Tiresias Desktop Version Management');
  console.log('\nUsage: node scripts/version.js [bump-type] [prerelease-type] [prerelease-number] [--dry-run]');
  console.log('\nWhere:');
  console.log('  [bump-type]        One of: major, minor, patch, alpha, beta, rc');
  console.log('  [prerelease-type]  Optional: alpha, beta, or rc (only when used with major, minor, patch)');
  console.log('  [prerelease-number] Optional: a number to append to the prerelease tag');
  console.log('\nOptions:');
  console.log('  --dry-run, -d    Show what would be done without making changes');
  console.log('\nExamples:');
  console.log('  node scripts/version.js patch         # 0.1.0 -> 0.1.1');
  console.log('  node scripts/version.js minor         # 0.1.0 -> 0.2.0');
  console.log('  node scripts/version.js major         # 0.1.0 -> 1.0.0');
  console.log('  node scripts/version.js alpha         # 0.1.0 -> 0.1.0-alpha');
  console.log('  node scripts/version.js alpha 1       # 0.1.0 -> 0.1.0-alpha.1');
  console.log('  node scripts/version.js beta 2        # 0.1.0 -> 0.1.0-beta.2');
  console.log('  node scripts/version.js patch alpha   # 0.1.0 -> 0.1.1-alpha');
  console.log('  node scripts/version.js minor beta    # 0.1.0 -> 0.2.0-beta');
  console.log('  node scripts/version.js patch --dry-run  # Show changes without applying them');
  process.exit(0);
}

// Calculate new version
let newVersion;
let newBase;

// Validate bump type
if (!['major', 'minor', 'patch', 'alpha', 'beta', 'rc'].includes(bumpType)) {
  console.error(`Invalid bump type: ${bumpType}. Use 'major', 'minor', 'patch', 'alpha', 'beta', or 'rc'.`);
  process.exit(1);
}

// First, determine the base version number
switch (bumpType) {
  case 'major':
    newBase = `${major + 1}.0.0`;
    break;
  case 'minor':
    newBase = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newBase = `${major}.${minor}.${patch + 1}`;
    break;
  case 'alpha':
  case 'beta':
  case 'rc':
    // For prerelease versions, keep the current version number but update the prerelease identifier
    newBase = currentBase;
    break;
}

// Then, handle prerelease tag if specified
if (prereleaseType && ['alpha', 'beta', 'rc'].includes(prereleaseType)) {
  // If we have both a bump type and a prerelease type, apply both
  newVersion = `${newBase}-${prereleaseType}${prereleaseIdentifier ? `.${prereleaseIdentifier}` : ''}`;
} else if (['alpha', 'beta', 'rc'].includes(bumpType)) {
  // If only the bump type is a prerelease type
  newVersion = `${newBase}-${bumpType}${prereleaseIdentifier ? `.${prereleaseIdentifier}` : ''}`;
} else {
  // No prerelease tag
  newVersion = newBase;
}

// If dry run, just show what would be done
if (dryRun) {
  console.log(`\nDRY RUN: Would bump version from ${currentVersion} to ${newVersion}`);
  console.log('\nFiles that would be updated:');
  console.log(`- package.json: ${currentVersion} -> ${newVersion}`);
  console.log(`- packages/renderer/package.json: ${rendererPackageJson.version} -> ${newVersion}`);
  console.log('\nGit operations that would be performed:');
  console.log('- git add package.json packages/renderer/package.json');
  console.log(`- git commit -m "chore: bump version to ${newVersion}"`);
  console.log(`- git tag v${newVersion}`);
  process.exit(0);
}

// Update main package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`Updated version in package.json to ${newVersion}`);

// Update renderer package.json
rendererPackageJson.version = newVersion;
fs.writeFileSync(rendererPackageJsonPath, JSON.stringify(rendererPackageJson, null, 2) + '\n');
console.log(`Updated version in packages/renderer/package.json to ${newVersion}`);

// Create version commit and tag
try {
  // Stage package.json files
  execSync('git add package.json packages/renderer/package.json', { stdio: 'inherit' });
  
  // Commit with version message
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
  
  // Create version tag
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
  
  console.log(`\n✅ Version bumped to ${newVersion}`);
  console.log('\nTo push the changes and tag:');
  console.log('  git push && git push --tags');
} catch (error) {
  console.error('\n❌ Error creating version commit:', error.message);
  process.exit(1);
}