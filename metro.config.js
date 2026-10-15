const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force metro to only resolve modules from this project's node_modules
config.resolver.nodeModulesPaths = [
  require('path').resolve(__dirname, 'node_modules'),
];

// Ensure project-local resolution for all modules
config.watchFolders = [__dirname];

module.exports = config;
