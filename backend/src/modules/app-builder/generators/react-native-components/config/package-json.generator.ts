import { AppBlueprint } from '../../../interfaces/app-builder.types';

/**
 * Generate package.json for React Native Expo project
 * @param blueprint - The app blueprint containing metadata
 * @returns Stringified package.json content
 */
export function generatePackageJson(blueprint: AppBlueprint): string {
  const appName = blueprint.metadata.name.toLowerCase().replace(/\s+/g, '-');

  return JSON.stringify({
    name: appName,
    version: '0.1.0',
    private: true,
    main: 'index.js',
    scripts: {
      'start': 'expo start',
      'android': 'expo start --android',
      'ios': 'expo start --ios',
      'web': 'expo start --web',
      'build': 'tsc --noEmit',
    },
    dependencies: {
      'react': '19.1.0',
      'react-dom': '19.1.0',
      'react-native': '0.81.5',
      'react-native-web': '^0.21.0',
      'expo': '~54.0.0',
      'expo-status-bar': '~3.0.8',
      'expo-linear-gradient': '~14.0.1',
      'expo-av': '~15.0.1',
      'expo-document-picker': '~13.0.2',
      'expo-image-picker': '~16.0.2',
      'babel-preset-expo': '~11.0.0',
      '@react-navigation/native': '^7.0.0',
      '@react-navigation/native-stack': '^7.0.0',
      '@react-navigation/bottom-tabs': '^7.0.0',
      '@react-navigation/drawer': '^7.0.0',
      'react-native-gesture-handler': '^2.29.1',
      'react-native-reanimated': '^4.1.5',
      'react-native-svg': '^15.15.1',
      '@tanstack/react-query': '^5.0.0',
      '@react-native-async-storage/async-storage': '2.2.0',
      'react-native-safe-area-context': '~5.6.0',
      'react-native-screens': '~4.16.0',
    },
    devDependencies: {
      '@babel/core': '^7.25.0',
      '@types/react': '~19.1.10',
      'typescript': '^5.3.0',
    },
  }, null, 2);
}
