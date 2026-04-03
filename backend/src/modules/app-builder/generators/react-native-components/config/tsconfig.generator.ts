/**
 * Generate tsconfig.json for React Native Expo project
 * @returns Stringified tsconfig.json content
 */
export function generateTsConfig(): string {
  return JSON.stringify({
    extends: 'expo/tsconfig.base',
    compilerOptions: {
      strict: true,
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
      },
    },
  }, null, 2);
}
