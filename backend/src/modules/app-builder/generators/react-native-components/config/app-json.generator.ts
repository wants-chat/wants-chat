import { AppBlueprint } from '../../../interfaces/app-builder.types';

/**
 * Generate app.json for Expo configuration
 * @param blueprint - The app blueprint containing metadata
 * @returns Stringified app.json content
 */
export function generateAppJson(blueprint: AppBlueprint): string {
  const appName = blueprint.metadata.name;
  const slug = appName.toLowerCase().replace(/\s+/g, '-');
  const androidPackage = `com.${slug.replace(/-/g, '.')}`;

  return JSON.stringify({
    expo: {
      name: appName,
      slug: slug,
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'light',
      splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
      assetBundlePatterns: ['**/*'],
      ios: {
        supportsTablet: true,
        bundleIdentifier: androidPackage,
      },
      android: {
        package: androidPackage,
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#ffffff',
        },
      },
      web: {
        favicon: './assets/favicon.png',
      },
    },
  }, null, 2);
}
