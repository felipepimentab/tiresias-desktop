#!/usr/bin/env node

/**
 * This script updates the version in package.json and ensures it's properly exposed to the renderer
 * Usage: node scripts/set-version.js <version>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Get the version from command line arguments
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Error: No version specified');
  console.log('Usage: node scripts/set-version.js <version>');
  process.exit(1);
}

// Validate version format (basic check for semver)
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/.test(newVersion)) {
  console.error('Error: Version must follow semantic versioning (e.g., 3.2.0)');
  process.exit(1);
}

// Update version in package.json
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// Create or update types/env.d.ts to ensure VITE_APP_VERSION is properly typed
const envDtsPath = path.join(rootDir, 'types', 'env.d.ts');
let envDtsContent = fs.readFileSync(envDtsPath, 'utf8');

// Check if VITE_APP_VERSION is already defined
if (!envDtsContent.includes('VITE_APP_VERSION')) {
  // Add VITE_APP_VERSION to the ImportMetaEnv interface
  envDtsContent = envDtsContent.replace(
    'interface ImportMetaEnv {',
    'interface ImportMetaEnv {\n  /** Current app version */\n  readonly VITE_APP_VERSION: string;'
  );
  fs.writeFileSync(envDtsPath, envDtsContent);
}

console.log(`Version updated to ${newVersion} in package.json`);
console.log('Remember to update CHANGELOG.md with the changes for this version');