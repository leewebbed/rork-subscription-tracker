const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Force Metro to disable the problematic file watcher (THIS IS THE KEY LINE)
config.watchFolders = [__dirname]; // Restrict watching to the project folder
config.watchman = {
  enabled: false,
};

// 2. Keep the blockList in case it's needed (for nested Babel node_modules)
config.resolver.blockList = [
  /@babel\/.*\/node_modules\//, 
];


module.exports = config;