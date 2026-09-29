const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

let projectRoot = __dirname;
// Normalize drive letter casing for Windows to avoid Metro resolution bugs
if (projectRoot.match(/^[a-z]:/)) {
  projectRoot = projectRoot.charAt(0).toUpperCase() + projectRoot.slice(1);
}

let workspaceRoot = path.resolve(projectRoot, '..');
if (workspaceRoot.match(/^[a-z]:/)) {
  workspaceRoot = workspaceRoot.charAt(0).toUpperCase() + workspaceRoot.slice(1);
}

const config = getDefaultConfig(projectRoot);

// Shift projectRoot to the workspace root to include both mobile/ and shared/ inside the project boundary
config.projectRoot = workspaceRoot;
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;




