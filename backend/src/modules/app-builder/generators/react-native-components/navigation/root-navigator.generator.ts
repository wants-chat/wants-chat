import { AppBlueprint } from '../../../interfaces/app-builder.types';

/**
 * Generate RootNavigator - Top-level navigation component
 *
 * Creates the root navigator that handles authentication flow:
 * - If requiresAuth is false: Simple stack with AppNavigator
 * - If requiresAuth is true: Conditional rendering based on auth state
 *
 * @param blueprint - The app blueprint containing configuration
 * @param requiresAuth - Whether the app requires authentication
 * @returns Generated RootNavigator component code as string
 */
export function generateRootNavigator(blueprint: AppBlueprint, requiresAuth: boolean): string {
  // Helper function to get screen component name from page
  const getScreenComponentName = (pageName: string): string => {
    // Convert page name to PascalCase screen name
    // Handle hyphen-case, underscore_case, spaces, and camelCase
    const pascalName = pageName
      // First, insert hyphens before uppercase letters to split camelCase
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      // Then split on hyphens, underscores, and spaces
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    return `${pascalName}Screen`;
  };

  // Get all pages from all sections
  const allPages = blueprint.sections.flatMap(section => section.pages);

  // Get tab pages (first page of each section)
  const tabPageNames = new Set(blueprint.sections.map(s => s.pages[0]?.name).filter(Boolean));

  // Get detail/modal pages (pages not shown in tabs)
  const detailPages = allPages.filter(page => !tabPageNames.has(page.name));

  // Deduplicate detail pages by screen component name
  const uniqueDetailPages = Array.from(
    new Map(detailPages.map(page => [getScreenComponentName(page.name), page])).values()
  );

  // Generate imports and screens for detail pages
  const detailScreenImports = uniqueDetailPages.map(page => {
    const screenName = getScreenComponentName(page.name);
    return `import ${screenName} from '../screens/${screenName}';`;
  }).join('\n');

  const detailScreenComponents = uniqueDetailPages.map(page => {
    const screenName = getScreenComponentName(page.name);
    return `      <Stack.Screen name="${page.name.split(' ').map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1)).join('')}" component={${screenName}} options={{ headerShown: true }} />`;
  }).join('\n');

  if (!requiresAuth) {
    return `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
${detailScreenImports}

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="App" component={AppNavigator} />
${detailScreenComponents}
    </Stack.Navigator>
  );
}`;
  }

  return `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { ActivityIndicator, View } from 'react-native';
${detailScreenImports}

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="App" component={AppNavigator} />
${detailScreenComponents}
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}`;
}
