/**
 * Generate babel.config.js for React Native Expo project
 * @returns Stringified babel.config.js content
 */
export function generateBabelConfig(): string {
  return `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};`;
}
