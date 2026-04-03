/**
 * Generate metro.config.js for React Native Expo project
 * @returns Stringified metro.config.js content
 */
export function generateMetroConfig(): string {
  return `const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);`;
}
