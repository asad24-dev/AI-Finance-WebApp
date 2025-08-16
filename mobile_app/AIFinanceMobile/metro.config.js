const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force Metro to only look in this project's node_modules, not parent directories
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules')
];

// Configure platform resolution to prefer web over native
// This should prevent loading of React Native specific implementations
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Add resolver to completely skip .native.js files for AWS Amplify
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Block .native.js files from being resolved
config.resolver.blockList = [
  /.*\/node_modules\/@aws-amplify\/.*\.native\.js$/,
];

module.exports = config;
