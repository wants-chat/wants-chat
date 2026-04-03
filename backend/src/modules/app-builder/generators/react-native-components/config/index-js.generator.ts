/**
 * Generate index.js entry point for React Native Expo project
 * @returns Stringified index.js content
 */
export function generateIndexJs(): string {
  return `import { registerRootComponent } from 'expo';
import App from './src/App';

registerRootComponent(App);`;
}
