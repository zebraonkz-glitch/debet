const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-worklets') {
    return {
      filePath: path.resolve(
        __dirname,
        'node_modules/react-native-worklets/lib/module/index.js',
      ),
      type: 'sourceFile',
    };
  }

  if (moduleName === 'react-native-worklets/plugin') {
    return {
      filePath: path.resolve(
        __dirname,
        'node_modules/react-native-worklets/plugin/index.js',
      ),
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
