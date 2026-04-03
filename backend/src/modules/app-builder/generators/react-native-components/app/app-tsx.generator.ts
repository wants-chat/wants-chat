import { AppBlueprint } from '../../../interfaces/app-builder.types';

/**
 * Generate App.tsx - Main application component
 *
 * This is the root React component that sets up the application shell with:
 * - QueryClientProvider for data fetching and caching
 * - AuthProvider (if authentication is required)
 * - NavigationContainer for React Navigation
 * - StatusBar configuration
 *
 * @param blueprint The application blueprint containing metadata and configuration
 * @param appTypeRequiresAuth Function to determine if app requires authentication
 * @returns Generated App.tsx code as string
 */
export function generateAppTsx(
  blueprint: AppBlueprint,
  appTypeRequiresAuth: (appType: string) => boolean,
): string {
  const requiresAuth = appTypeRequiresAuth(blueprint.metadata.appType);

  return `import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
${requiresAuth ? `import { AuthProvider } from './contexts/AuthContext';` : ''}
import RootNavigator from './navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      ${requiresAuth ? `<AuthProvider>` : ''}
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <RootNavigator />
        </NavigationContainer>
      ${requiresAuth ? `</AuthProvider>` : ''}
    </QueryClientProvider>
  );
}`;
}
