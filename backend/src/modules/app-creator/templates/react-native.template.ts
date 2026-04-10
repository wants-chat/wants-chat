import {
  GeneratedFile,
  DatabaseSchema,
  EnhancedAppAnalysis,
  EnhancedEntityDefinition,
  GeneratedKeys,
} from '../dto/create-app.dto';
import { snakeCase, camelCase, pascalCase, kebabCase } from 'change-case';
import * as pluralize from 'pluralize';

// Import component generators from components-native
import {
  // Auth components
  generateLoginScreen,
  generateRegisterScreen,
  generateForgotPasswordScreen,
  generateAuthContext,
  generateProfileScreen,
  // UI components
  generateButton,
  generateCard,
  generateInput,
  generateAvatar,
  generateEmptyStateComponent,
  generateLoadingSpinner,
  generateModal,
  generateToast,
  generateConfirmDialog,
  generateActionSheet,
  generateProgressBar,
  // Data components
  generateDataGridComponent,
  generateDataTableComponent,
  generateDataList,
  generateSearchBar,
  generateBadgeComponent,
  // Form components
  generateSelect,
  generateDatePickerComponent,
  generateTimePicker,
  generateTextarea,
  generateCheckbox,
  generateRadioGroup,
  // Media components
  generateImageGallery,
  generateImagePicker,
  generateMediaPlayer,
  generateFilePicker,
  generateCachedImage,
  // Layout components
  generateDivider,
  generateAccordion,
  generateTabs,
  generateChip,
  generateHeader,
  generateBottomSheet,
  // Hooks
  generateUseDebounce,
  generateUseKeyboard,
  generateUseRefresh,
  generateUseStorage,
} from '../components-native';

/**
 * React Native / Expo Template Generator
 *
 * Generates a complete React Native mobile app using Expo SDK 54,
 * React Native 0.81, React 19, and React Navigation 7.
 */
export class ReactNativeTemplateGenerator {
  /**
   * Main generation method - returns all files needed for the React Native app
   */
  generate(
    analysis: EnhancedAppAnalysis,
    schema: DatabaseSchema,
    appName: string,
    keys?: GeneratedKeys,
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const requiresAuth = analysis.requiresAuth;

    // ============================================
    // 1. CONFIGURATION FILES
    // ============================================
    files.push(this.generatePackageJson(appName));
    files.push(this.generateAppJson(appName));
    files.push(this.generateTsConfig());
    files.push(this.generateBabelConfig());
    files.push(this.generateMetroConfig());
    files.push(this.generateEnvFile(appName, keys));
    files.push(this.generateGitignore());
    files.push(this.generateEasJson(appName));
    files.push(this.generateIndexJs());

    // ============================================
    // 2. APP SHELL
    // ============================================
    files.push(this.generateAppTsx(analysis, appName));

    // Navigation structure
    files.push(this.generateRootNavigator(analysis));
    files.push(this.generateAppNavigator(analysis, schema));
    files.push(this.generateCustomDrawer(analysis));

    // Auth navigator (always generated, used when requiresAuth is true)
    if (requiresAuth) {
      files.push(this.generateAuthNavigator());
    }

    // ============================================
    // 3. AUTHENTICATION (if required)
    // ============================================
    if (requiresAuth) {
      // AuthContext - using imported generator
      files.push({
        path: 'src/contexts/AuthContext.tsx',
        content: generateAuthContext({ appName }),
        language: 'tsx',
      });

      // Auth screens - using imported generators
      files.push({
        path: 'src/screens/auth/LoginScreen.tsx',
        content: generateLoginScreen({ appName, enablePasswordReset: true }),
        language: 'tsx',
      });

      files.push({
        path: 'src/screens/auth/RegisterScreen.tsx',
        content: generateRegisterScreen({ appName }),
        language: 'tsx',
      });

      files.push({
        path: 'src/screens/auth/ForgotPasswordScreen.tsx',
        content: generateForgotPasswordScreen({ appName }),
        language: 'tsx',
      });

      // Profile screen - using imported generator
      files.push({
        path: 'src/screens/ProfileScreen.tsx',
        content: generateProfileScreen({ appName }),
        language: 'tsx',
      });
    }

    // ============================================
    // 4. UTILITIES & SERVICES
    // ============================================
    files.push(this.generateApiClient(keys));
    files.push(this.generateTypes(analysis, schema));
    files.push(this.generateUtils());
    files.push(this.generateTheme());
    files.push(this.generateConstants(appName));

    // Custom hooks - using imported generators
    files.push({ path: 'src/hooks/useDebounce.ts', content: generateUseDebounce(), language: 'typescript' });
    files.push({ path: 'src/hooks/useKeyboard.ts', content: generateUseKeyboard(), language: 'typescript' });
    files.push({ path: 'src/hooks/useRefresh.ts', content: generateUseRefresh(), language: 'typescript' });
    files.push({ path: 'src/hooks/useStorage.ts', content: generateUseStorage(), language: 'typescript' });
    // Note: Query hooks are entity-specific and generated in generateQueryHooks() method below

    // ============================================
    // 5. UI COMPONENTS - using imported generators
    // ============================================
    files.push({ path: 'src/components/ui/Button.tsx', content: generateButton(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Card.tsx', content: generateCard(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Input.tsx', content: generateInput(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Avatar.tsx', content: generateAvatar(), language: 'tsx' });
    files.push({ path: 'src/components/ui/EmptyState.tsx', content: generateEmptyStateComponent(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Loading.tsx', content: generateLoadingSpinner(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Modal.tsx', content: generateModal(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Toast.tsx', content: generateToast(), language: 'tsx' });
    files.push({ path: 'src/components/ui/ConfirmDialog.tsx', content: generateConfirmDialog(), language: 'tsx' });
    files.push({ path: 'src/components/ui/ActionSheet.tsx', content: generateActionSheet(), language: 'tsx' });
    files.push({ path: 'src/components/ui/ProgressBar.tsx', content: generateProgressBar(), language: 'tsx' });

    // Data display components - using imported generators
    files.push({ path: 'src/components/ui/DataGrid.tsx', content: generateDataGridComponent(), language: 'tsx' });
    files.push({ path: 'src/components/ui/DataTable.tsx', content: generateDataTableComponent(), language: 'tsx' });
    files.push({ path: 'src/components/ui/DataList.tsx', content: generateDataList(), language: 'tsx' });
    files.push({ path: 'src/components/ui/SearchBar.tsx', content: generateSearchBar(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Badge.tsx', content: generateBadgeComponent(), language: 'tsx' });

    // Form components - using imported generators
    files.push({ path: 'src/components/ui/Select.tsx', content: generateSelect(), language: 'tsx' });
    files.push({ path: 'src/components/ui/DatePicker.tsx', content: generateDatePickerComponent(), language: 'tsx' });
    files.push({ path: 'src/components/ui/TimePicker.tsx', content: generateTimePicker(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Textarea.tsx', content: generateTextarea(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Checkbox.tsx', content: generateCheckbox(), language: 'tsx' });
    files.push({ path: 'src/components/ui/RadioGroup.tsx', content: generateRadioGroup(), language: 'tsx' });

    // Media components - using imported generators
    files.push({ path: 'src/components/ui/ImageGallery.tsx', content: generateImageGallery(), language: 'tsx' });
    files.push({ path: 'src/components/ui/ImagePicker.tsx', content: generateImagePicker(), language: 'tsx' });
    files.push({ path: 'src/components/ui/MediaPlayer.tsx', content: generateMediaPlayer(), language: 'tsx' });
    files.push({ path: 'src/components/ui/FilePicker.tsx', content: generateFilePicker(), language: 'tsx' });
    files.push({ path: 'src/components/ui/CachedImage.tsx', content: generateCachedImage(), language: 'tsx' });

    // Layout components - using imported generators
    files.push({ path: 'src/components/ui/Divider.tsx', content: generateDivider(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Accordion.tsx', content: generateAccordion(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Tabs.tsx', content: generateTabs(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Chip.tsx', content: generateChip(), language: 'tsx' });
    files.push({ path: 'src/components/ui/Header.tsx', content: generateHeader(), language: 'tsx' });
    files.push({ path: 'src/components/ui/BottomSheet.tsx', content: generateBottomSheet(), language: 'tsx' });

    // ============================================
    // 6. ENTITY SCREENS
    // ============================================
    const screenFiles = this.generateScreens(analysis, schema, { appName });
    files.push(...screenFiles);

    return files;
  }

  /**
   * Generate all entity screens (List, Detail, Form) for each entity in the schema
   */
  generateScreens(
    analysis: EnhancedAppAnalysis,
    schema: DatabaseSchema,
    options: { appName?: string } = {},
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const entities = analysis.entities || [];

    // Generate HomeScreen first
    files.push(this.generateHomeScreen(analysis, schema, options));

    // Generate screens for each entity
    for (const entity of entities) {
      // List screen
      files.push(
        this.generateEntityListScreen(entity, schema, {
          enableSearch: true,
          enableFAB: true,
        }),
      );

      // Detail screen
      files.push(
        this.generateEntityDetailScreen(entity, schema, {
          enableEdit: true,
          enableDelete: true,
        }),
      );

      // Form screen (handles both create and edit)
      files.push(this.generateEntityFormScreen(entity, schema));
    }

    return files;
  }

  // ============================================
  // APP SHELL GENERATORS
  // ============================================

  /**
   * Generate the main App.tsx with all providers
   * Includes: QueryClientProvider, NavigationContainer, AuthProvider (if auth required), SafeAreaProvider
   */
  generateAppTsx(analysis: EnhancedAppAnalysis, appName: string): GeneratedFile {
    const requiresAuth = analysis.requiresAuth;
    const displayName = this.toDisplayName(appName);

    const authImport = requiresAuth
      ? `import { AuthProvider } from '@/contexts/AuthContext';`
      : '';

    const authProviderOpen = requiresAuth ? '          <AuthProvider>' : '';
    const authProviderClose = requiresAuth ? '          </AuthProvider>' : '';

    // Adjust indentation based on whether AuthProvider is present
    const navContainerIndent = requiresAuth ? '            ' : '          ';

    return {
      path: 'App.tsx',
      content: `import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
${authImport}
import RootNavigator from '@/navigation/RootNavigator';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create a client for React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Navigation theme configuration
const navigationTheme = {
  dark: false,
  colors: {
    primary: '#3B82F6',
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    border: '#E5E7EB',
    notification: '#EF4444',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        await Font.loadAsync({
          // Add custom fonts here if needed
        });
      } catch (e) {
        console.warn('Error loading app resources:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide the splash screen once the app is ready
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
${authProviderOpen}
${navContainerIndent}<NavigationContainer theme={navigationTheme}>
${navContainerIndent}  <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
${navContainerIndent}  <RootNavigator />
${navContainerIndent}</NavigationContainer>
${authProviderClose}
        </SafeAreaProvider>
      </QueryClientProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
`,
      language: 'typescript',
    };
  }

  /**
   * Generate the root navigator that handles authenticated vs unauthenticated states
   * Shows AppNavigator when authenticated, AuthNavigator when not
   */
  generateRootNavigator(analysis: EnhancedAppAnalysis): GeneratedFile {
    const requiresAuth = analysis.requiresAuth;

    if (!requiresAuth) {
      // No auth required - just render AppNavigator directly
      return {
        path: 'src/navigation/RootNavigator.tsx',
        content: `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';

export type RootStackParamList = {
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="App" component={AppNavigator} />
    </Stack.Navigator>
  );
}
`,
        language: 'typescript',
      };
    }

    // With authentication - conditionally render based on auth state
    return {
      path: 'src/navigation/RootNavigator.tsx',
      content: `import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

export type RootStackParamList = {
  App: undefined;
  Auth: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, isLoading, isInitialized } = useAuth();

  // Show loading spinner while checking auth state
  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}
    >
      {user ? (
        // User is authenticated - show main app navigator
        <Stack.Screen
          name="App"
          component={AppNavigator}
          options={{ animationTypeForReplace: 'push' }}
        />
      ) : (
        // User is not authenticated - show auth flow
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ animationTypeForReplace: 'pop' }}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});
`,
      language: 'typescript',
    };
  }

  /**
   * Generate the main app navigator with bottom tabs based on entities
   * Includes tab icons using Ionicons with smart icon matching
   */
  generateAppNavigator(analysis: EnhancedAppAnalysis, schema: DatabaseSchema): GeneratedFile {
    const entities = analysis.entities || [];
    const requiresAuth = analysis.requiresAuth;

    // Limit to 4 main tabs for bottom navigation (5th will be Profile or More)
    const mainEntities = entities.slice(0, 4);
    const hasMoreEntities = entities.length > 4;

    // Generate imports for list screens
    const screenImports = mainEntities
      .map((entity) => {
        const pascalName = this.toPascalCase(entity.name);
        return `import ${pascalName}ListScreen from '@/screens/${pascalName}ListScreen';`;
      })
      .join('\n');

    // Generate imports for detail and form screens
    const detailScreenImports = entities
      .map((entity) => {
        const pascalName = this.toPascalCase(entity.name);
        return `import ${pascalName}DetailScreen from '@/screens/${pascalName}DetailScreen';
import ${pascalName}FormScreen from '@/screens/${pascalName}FormScreen';`;
      })
      .join('\n');

    // Generate tab screens with icons
    const tabScreens = mainEntities
      .map((entity) => {
        const pascalName = this.toPascalCase(entity.name);
        const pluralName = this.pluralize(entity.displayName || entity.name);
        const iconName = this.getEntityIcon(entity.name);
        const focusedIcon = iconName.replace('-outline', '');

        return `        <Tab.Screen
          name="${pascalName}Tab"
          component={${pascalName}ListScreen}
          options={{
            title: '${pluralName}',
            tabBarLabel: '${pluralName}',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? '${focusedIcon}' : '${iconName}'}
                size={size}
                color={color}
              />
            ),
          }}
        />`;
      })
      .join('\n');

    // Add Profile or More tab
    const additionalTab = requiresAuth
      ? `        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            title: 'Profile',
            tabBarLabel: 'Profile',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />`
      : hasMoreEntities
        ? `        <Tab.Screen
          name="MoreTab"
          component={MoreScreen}
          options={{
            title: 'More',
            tabBarLabel: 'More',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'menu' : 'menu-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />`
        : '';

    const additionalScreenImport = requiresAuth
      ? `import ProfileScreen from '@/screens/ProfileScreen';`
      : hasMoreEntities
        ? `import MoreScreen from '@/screens/MoreScreen';`
        : '';

    // Generate stack screens for detail and form pages
    const detailStackScreens = entities
      .map((entity) => {
        const pascalName = this.toPascalCase(entity.name);
        const displayName = entity.displayName || entity.name;
        return `        <Stack.Screen
          name="${pascalName}Detail"
          component={${pascalName}DetailScreen}
          options={{
            title: '${displayName} Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="${pascalName}Form"
          component={${pascalName}FormScreen}
          options={({ route }) => ({
            title: route.params?.mode === 'edit' ? 'Edit ${displayName}' : 'New ${displayName}',
            headerBackTitle: 'Back',
          })}
        />`;
      })
      .join('\n');

    // Generate type definitions for navigation
    const tabParamListTypes = mainEntities
      .map((e) => `  ${this.toPascalCase(e.name)}Tab: undefined;`)
      .join('\n');

    const stackParamListTypes = entities
      .map((e) => {
        const pascalName = this.toPascalCase(e.name);
        return `  ${pascalName}Detail: { id: string };
  ${pascalName}Form: { mode: 'create' | 'edit'; id?: string };`;
      })
      .join('\n');

    return {
      path: 'src/navigation/AppNavigator.tsx',
      content: `import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

// List Screens
${screenImports}

// Detail Screens
${detailScreenImports}

${additionalScreenImport}

// Navigation type definitions
export type TabParamList = {
${tabParamListTypes}
${requiresAuth ? '  ProfileTab: undefined;' : hasMoreEntities ? '  MoreTab: undefined;' : ''}
};

export type AppStackParamList = {
  MainTabs: undefined;
${stackParamListTypes}
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

// Tab Navigator Component
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTintColor: '#FFFFFF',
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}
    >
${tabScreens}
${additionalTab}
    </Tab.Navigator>
  );
}

// Main App Navigator with Stack for detail screens
export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: '#FFFFFF',
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
${detailStackScreens}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    height: Platform.OS === 'ios' ? 88 : 64,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  header: {
    backgroundColor: '#3B82F6',
    elevation: 0,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 18,
  },
});
`,
      language: 'typescript',
    };
  }

  /**
   * Generate a custom drawer component with user profile section and menu items
   * Includes: User avatar, name, email, menu items based on entities, logout button
   */
  generateCustomDrawer(analysis: EnhancedAppAnalysis): GeneratedFile {
    const entities = analysis.entities || [];

    // Generate menu items based on entities
    const menuItems = entities
      .map((entity) => {
        const pascalName = this.toPascalCase(entity.name);
        const pluralName = this.pluralize(entity.displayName || entity.name);
        const iconName = this.getEntityIcon(entity.name);

        return `        <DrawerItem
          icon={({ color, size }) => (
            <Ionicons name="${iconName}" size={size} color={color} />
          )}
          label="${pluralName}"
          onPress={() => {
            navigation.closeDrawer();
            navigation.navigate('${pascalName}Tab' as any);
          }}
          style={styles.drawerItem}
          labelStyle={styles.drawerLabel}
        />`;
      })
      .join('\n');

    return {
      path: 'src/components/CustomDrawer.tsx',
      content: `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/contexts/AuthContext';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();
  const { navigation } = props;
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {getInitials(user?.name || 'User')}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => {
              navigation.closeDrawer();
              navigation.navigate('ProfileTab' as any);
            }}
          >
            <Ionicons name="create-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Menu Items based on entities */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Navigation</Text>
${menuItems}
        </View>

        {/* Settings Section */}
        <View style={styles.divider} />
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Settings</Text>
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            )}
            label="Settings"
            onPress={() => {
              navigation.closeDrawer();
              // navigation.navigate('Settings');
            }}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="help-circle-outline" size={size} color={color} />
            )}
            label="Help & Support"
            onPress={() => {
              navigation.closeDrawer();
              // navigation.navigate('Help');
            }}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          />
        </View>
      </DrawerContentScrollView>

      {/* Logout Button - Fixed at bottom */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 0,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3B82F6',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#60A5FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#DBEAFE',
  },
  editProfileButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  menuSection: {
    paddingVertical: 8,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  drawerItem: {
    marginHorizontal: 8,
    borderRadius: 8,
  },
  drawerLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
`,
      language: 'typescript',
    };
  }

  /**
   * Generate the authentication navigator with Login, Register, and ForgotPassword screens
   */
  generateAuthNavigator(): GeneratedFile {
    return {
      path: 'src/navigation/AuthNavigator.tsx',
      content: `import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#FFFFFF',
        },
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Sign In',
          // Prevent going back from login screen
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
`,
      language: 'typescript',
    };
  }

  /**
   * Generate package.json with Expo 54, React Native 0.81, and React 19
   */
  private generatePackageJson(appName: string): GeneratedFile {
    const slug = this.toSlug(appName);

    const pkg = {
      name: slug,
      version: '1.0.0',
      main: 'index.js',
      scripts: {
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
        web: 'expo start --web',
        build: 'eas build',
        'build:preview': 'eas build --profile preview',
        'build:production': 'eas build --profile production',
        submit: 'eas submit',
        lint: 'eslint .',
        'type-check': 'tsc --noEmit',
        test: 'jest',
      },
      dependencies: {
        // Core React & React Native - Expo SDK 54 compatible versions
        'react': '18.3.1',
        'react-native': '0.76.7',
        'expo': '~54.0.0',
        'expo-status-bar': '~2.0.0',

        // Navigation - React Navigation 7.x for Expo 54
        '@react-navigation/native': '^7.0.0',
        '@react-navigation/native-stack': '^7.0.0',
        '@react-navigation/bottom-tabs': '^7.0.0',
        '@react-navigation/drawer': '^7.0.0',
        'react-native-screens': '~4.4.0',
        'react-native-safe-area-context': '~4.14.0',

        // State & Data Fetching
        '@tanstack/react-query': '^5.0.0',
        'zustand': '^5.0.0',

        // Storage
        '@react-native-async-storage/async-storage': '~2.1.0',
        'expo-secure-store': '~14.0.0',

        // Animations & Gestures
        'react-native-gesture-handler': '~2.20.0',
        'react-native-reanimated': '~3.16.0',

        // Icons & UI
        '@expo/vector-icons': '^14.0.0',
        'expo-font': '~13.0.0',
        'expo-splash-screen': '~0.29.0',

        // Utilities - use npm:expo-router@sdk-52 for SDK 54 compatibility
        'expo-constants': '~17.0.0',
        'expo-linking': '~7.0.0',
        'expo-router': '4.0.22',
        'expo-image': '~2.0.0',

        // Media & Pickers
        'expo-av': '~15.0.0',
        'expo-image-picker': '~16.0.0',
        'expo-document-picker': '~13.0.0',
        '@react-native-community/datetimepicker': '^8.0.0',

        // Form handling
        'react-hook-form': '^7.54.0',
        'zod': '^3.24.0',
        '@hookform/resolvers': '^3.9.0',

        // Date handling
        'date-fns': '^4.1.0',

        // Utilities
        'clsx': '^2.1.0',
        'nativewind': '^4.1.0',
      },
      devDependencies: {
        // TypeScript
        'typescript': '^5.7.0',
        '@types/react': '~18.3.0',

        // Babel
        '@babel/core': '^7.26.0',
        '@babel/preset-env': '^7.26.0',
        '@babel/runtime': '^7.26.0',

        // ESLint
        'eslint': '^9.0.0',
        'eslint-config-expo': '~9.0.0',
        '@typescript-eslint/eslint-plugin': '^8.0.0',
        '@typescript-eslint/parser': '^8.0.0',

        // Testing
        'jest': '^29.0.0',
        'jest-expo': '~52.0.0',
        '@testing-library/react-native': '^12.0.0',

        // Tailwind/NativeWind
        'tailwindcss': '^3.4.0',

        // Expo CLI
        'expo-dev-client': '~5.1.0',
      },
      private: true,
    };

    return {
      path: 'package.json',
      content: JSON.stringify(pkg, null, 2),
      language: 'json',
    };
  }

  /**
   * Generate app.json - Expo app configuration
   */
  private generateAppJson(appName: string): GeneratedFile {
    const slug = this.toSlug(appName);
    const displayName = this.toDisplayName(appName);

    const appConfig = {
      expo: {
        name: displayName,
        slug: slug,
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        splash: {
          image: './assets/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
        assetBundlePatterns: ['**/*'],
        ios: {
          supportsTablet: true,
          bundleIdentifier: `com.${slug.replace(/-/g, '')}.app`,
          buildNumber: '1',
        },
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff',
          },
          package: `com.${slug.replace(/-/g, '')}.app`,
          versionCode: 1,
        },
        web: {
          favicon: './assets/favicon.png',
          bundler: 'metro',
        },
        plugins: [
          'expo-router',
          'expo-font',
          'expo-secure-store',
          [
            'expo-splash-screen',
            {
              backgroundColor: '#ffffff',
              image: './assets/splash-icon.png',
              imageWidth: 200,
            },
          ],
        ],
        experiments: {
          typedRoutes: true,
        },
        extra: {
          eas: {
            projectId: 'your-project-id',
          },
        },
        owner: 'your-expo-username',
      },
    };

    return {
      path: 'app.json',
      content: JSON.stringify(appConfig, null, 2),
      language: 'json',
    };
  }

  /**
   * Generate tsconfig.json for React Native with TypeScript
   */
  private generateTsConfig(): GeneratedFile {
    const config = {
      extends: 'expo/tsconfig.base',
      compilerOptions: {
        target: 'ESNext',
        lib: ['ES2022', 'DOM'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-native',
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
          '@/components/*': ['./src/components/*'],
          '@/screens/*': ['./src/screens/*'],
          '@/hooks/*': ['./src/hooks/*'],
          '@/services/*': ['./src/services/*'],
          '@/types/*': ['./src/types/*'],
          '@/utils/*': ['./src/utils/*'],
          '@/constants/*': ['./src/constants/*'],
          '@/theme/*': ['./src/theme/*'],
        },
      },
      include: [
        '**/*.ts',
        '**/*.tsx',
        '.expo/types/**/*.ts',
        'expo-env.d.ts',
      ],
      exclude: [
        'node_modules',
        'babel.config.js',
        'metro.config.js',
        'jest.config.js',
      ],
    };

    return {
      path: 'tsconfig.json',
      content: JSON.stringify(config, null, 2),
      language: 'json',
    };
  }

  /**
   * Generate babel.config.js for Expo with Reanimated support
   */
  private generateBabelConfig(): GeneratedFile {
    return {
      path: 'babel.config.js',
      content: `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // NativeWind
      'nativewind/babel',
      // React Native Reanimated must be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
`,
      language: 'javascript',
    };
  }

  /**
   * Generate metro.config.js for Metro bundler
   */
  private generateMetroConfig(): GeneratedFile {
    return {
      path: 'metro.config.js',
      content: `const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add any custom configuration here
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = withNativeWind(config, { input: './global.css' });
`,
      language: 'javascript',
    };
  }

  /**
   * Generate .env file with API configuration
   */
  private generateEnvFile(appName: string, keys?: GeneratedKeys): GeneratedFile {
    const slug = this.toSlug(appName);

    return {
      path: '.env',
      content: `# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:4000/api

# App Configuration
EXPO_PUBLIC_APP_NAME=${slug}
EXPO_PUBLIC_APP_ENV=development
`,
      language: 'env',
    };
  }

  /**
   * Generate .gitignore for React Native / Expo projects
   */
  private generateGitignore(): GeneratedFile {
    return {
      path: '.gitignore',
      content: `# Dependencies
node_modules/

# Expo
.expo/
dist/
web-build/

# Native builds
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# Local environment files
.env
.env.local
.env.*.local

# TypeScript
*.tsbuildinfo

# Testing
coverage/

# IDE
.idea/
.vscode/
*.swp
*.swo

# EAS
.eas/

# Temporary files
*.log
tmp/
temp/

# Android
android/app/build/
android/.gradle/

# iOS
ios/Pods/
ios/build/
*.xcworkspace
*.xcuserdata
`,
      language: 'gitignore',
    };
  }

  /**
   * Generate eas.json for EAS Build configuration
   */
  private generateEasJson(appName: string): GeneratedFile {
    const slug = this.toSlug(appName);

    const easConfig = {
      cli: {
        version: '>= 14.0.0',
        appVersionSource: 'remote',
      },
      build: {
        development: {
          developmentClient: true,
          distribution: 'internal',
          ios: {
            resourceClass: 'medium',
          },
          android: {
            buildType: 'apk',
          },
          env: {
            EXPO_PUBLIC_APP_ENV: 'development',
          },
        },
        preview: {
          distribution: 'internal',
          ios: {
            resourceClass: 'medium',
          },
          android: {
            buildType: 'apk',
          },
          env: {
            EXPO_PUBLIC_APP_ENV: 'preview',
          },
        },
        production: {
          ios: {
            resourceClass: 'medium',
          },
          android: {
            buildType: 'app-bundle',
          },
          env: {
            EXPO_PUBLIC_APP_ENV: 'production',
          },
          autoIncrement: true,
        },
      },
      submit: {
        production: {
          ios: {
            appleId: 'your-apple-id@example.com',
            ascAppId: 'your-app-store-connect-app-id',
            appleTeamId: 'YOUR_TEAM_ID',
          },
          android: {
            serviceAccountKeyPath: './google-service-account.json',
            track: 'internal',
          },
        },
      },
    };

    return {
      path: 'eas.json',
      content: JSON.stringify(easConfig, null, 2),
      language: 'json',
    };
  }

  /**
   * Generate index.js - Entry point for React Native
   */
  private generateIndexJs(): GeneratedFile {
    return {
      path: 'index.js',
      content: `import 'expo-router/entry';
`,
      language: 'javascript',
    };
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Convert app name to URL-friendly slug
   */
  private toSlug(name: string): string {
    return kebabCase(name.toLowerCase().replace(/[^a-zA-Z0-9\s-]/g, ''));
  }

  /**
   * Convert app name to display-friendly format
   */
  private toDisplayName(name: string): string {
    return name
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Convert name to PascalCase for component names
   */
  private toPascalCase(name: string): string {
    return pascalCase(name);
  }

  /**
   * Convert name to camelCase for variable names
   */
  private toCamelCase(name: string): string {
    return camelCase(name);
  }

  /**
   * Convert name to snake_case for database fields
   */
  private toSnakeCase(name: string): string {
    return snakeCase(name);
  }

  /**
   * Get plural form of a name
   */
  private pluralize(name: string): string {
    return pluralize.plural(name);
  }

  /**
   * Get singular form of a name
   */
  private singularize(name: string): string {
    return pluralize.singular(name);
  }

  /**
   * Get an appropriate Ionicons icon name for an entity
   * Uses smart matching to find the best icon based on entity name
   */
  private getEntityIcon(entityName: string): string {
    const name = entityName.toLowerCase();

    // Icon mapping for common entity types
    const iconMap: Record<string, string> = {
      // Users & Profiles
      user: 'people-outline',
      users: 'people-outline',
      profile: 'person-outline',
      profiles: 'person-outline',
      account: 'person-circle-outline',
      member: 'people-outline',
      customer: 'people-outline',
      client: 'briefcase-outline',
      contact: 'call-outline',

      // Content & Posts
      post: 'document-text-outline',
      posts: 'documents-outline',
      article: 'newspaper-outline',
      blog: 'reader-outline',
      news: 'newspaper-outline',
      comment: 'chatbubble-outline',
      message: 'mail-outline',
      chat: 'chatbubbles-outline',
      notification: 'notifications-outline',

      // E-commerce
      product: 'cube-outline',
      products: 'grid-outline',
      item: 'cube-outline',
      order: 'receipt-outline',
      orders: 'receipt-outline',
      cart: 'cart-outline',
      category: 'pricetag-outline',
      categories: 'pricetags-outline',
      payment: 'card-outline',
      invoice: 'document-outline',
      transaction: 'swap-horizontal-outline',

      // Business & Work
      project: 'folder-outline',
      projects: 'folder-open-outline',
      task: 'checkbox-outline',
      tasks: 'list-outline',
      job: 'briefcase-outline',
      company: 'business-outline',
      team: 'people-outline',
      department: 'git-branch-outline',
      employee: 'person-outline',

      // Calendar & Events
      event: 'calendar-outline',
      events: 'calendar-outline',
      appointment: 'time-outline',
      booking: 'bookmark-outline',
      schedule: 'calendar-number-outline',
      reservation: 'calendar-outline',
      meeting: 'videocam-outline',

      // Media & Files
      image: 'image-outline',
      photo: 'images-outline',
      gallery: 'images-outline',
      video: 'videocam-outline',
      file: 'document-attach-outline',
      document: 'document-outline',
      attachment: 'attach-outline',
      media: 'play-outline',

      // Location & Places
      location: 'location-outline',
      address: 'map-outline',
      venue: 'business-outline',
      place: 'pin-outline',
      store: 'storefront-outline',
      shop: 'storefront-outline',
      branch: 'git-network-outline',

      // Settings & Preferences
      setting: 'settings-outline',
      settings: 'settings-outline',
      preference: 'options-outline',
      config: 'cog-outline',
      option: 'toggle-outline',

      // Analytics & Reports
      report: 'analytics-outline',
      analytics: 'bar-chart-outline',
      stat: 'stats-chart-outline',
      dashboard: 'speedometer-outline',
      metric: 'trending-up-outline',

      // Education & Learning
      course: 'book-outline',
      lesson: 'school-outline',
      class: 'school-outline',
      student: 'person-outline',
      teacher: 'people-outline',
      quiz: 'help-outline',
      exam: 'clipboard-outline',

      // Healthcare
      patient: 'person-outline',
      doctor: 'medkit-outline',
      prescription: 'medical-outline',
      health: 'heart-outline',
      medical: 'medkit-outline',

      // Finance
      budget: 'wallet-outline',
      expense: 'cash-outline',
      income: 'trending-up-outline',
      bankAccount: 'card-outline',
      bank: 'business-outline',

      // Social
      friend: 'people-outline',
      follower: 'person-add-outline',
      like: 'heart-outline',
      share: 'share-social-outline',
      review: 'star-outline',
      rating: 'star-half-outline',

      // Misc
      note: 'create-outline',
      tag: 'pricetag-outline',
      label: 'bookmark-outline',
      log: 'time-outline',
      history: 'time-outline',
      activity: 'pulse-outline',
      status: 'radio-button-on-outline',
      type: 'layers-outline',
    };

    // Check for exact match first
    if (iconMap[name]) {
      return iconMap[name];
    }

    // Check if entity name contains any of the keys (partial match)
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key) || key.includes(name)) {
        return icon;
      }
    }

    // Default icon for unknown entities
    return 'list-outline';
  }

  /**
   * Map field type to TypeScript type
   */
  private mapFieldTypeToTs(type: string): string {
    const mapping: Record<string, string> = {
      string: 'string',
      text: 'string',
      number: 'number',
      integer: 'number',
      decimal: 'number',
      boolean: 'boolean',
      date: 'string',
      datetime: 'string',
      email: 'string',
      url: 'string',
      phone: 'string',
      image: 'string',
      file: 'string',
      enum: 'string',
      json: 'Record<string, unknown>',
      array: 'unknown[]',
      object: 'Record<string, unknown>',
      uuid: 'string',
    };
    return mapping[type] || 'string';
  }

  // Note: Auth component generators (generateAuthContext, generateLoginScreen, etc.)
  // are now imported from ../components-native

  // ============================================
  // Entity Screen Generators
  // ============================================

  /**
   * Generate Entity List Screen
   *
   * Features:
   * - FlatList for rendering items
   * - Pull-to-refresh
   * - Loading and error states
   * - Empty state
   * - useQuery from @tanstack/react-query
   * - Navigation to detail screen on item press
   * - FAB (floating action button) for create (if user can create)
   * - Search bar (optional)
   */
  generateEntityListScreen(
    entity: EnhancedEntityDefinition,
    schema: DatabaseSchema,
    options: { enableSearch?: boolean; enableFAB?: boolean } = {},
  ): GeneratedFile {
    const { enableSearch = true, enableFAB = true } = options;
    const pascalName = this.toPascalCase(entity.name);
    const camelName = this.toCamelCase(entity.name);
    const pluralName = this.pluralize(entity.displayName || entity.name);
    const singularName = entity.displayName || entity.name;
    const snakeName = this.toSnakeCase(entity.name);
    const pluralCamelName = this.toCamelCase(this.pluralize(entity.name));

    // Determine the primary display field for list items
    const displayField = this.getPrimaryDisplayField(entity);
    const secondaryField = this.getSecondaryDisplayField(entity);

    const searchBarCode = enableSearch
      ? `
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ${pluralName.toLowerCase()}..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>`
      : '';

    const searchState = enableSearch
      ? `const [searchQuery, setSearchQuery] = useState('');`
      : '';

    const searchFilter = enableSearch
      ? `
  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return data || [];
    const query = searchQuery.toLowerCase();
    return (data || []).filter((item) =>
      item.${displayField}?.toLowerCase().includes(query)${secondaryField ? ` ||
      item.${secondaryField}?.toLowerCase().includes(query)` : ''}
    );
  }, [data, searchQuery]);`
      : `
  const filteredItems = data || [];`;

    const fabCode = enableFAB
      ? `
        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('${pascalName}Form' as any, { mode: 'create' })}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>`
      : '';

    const fabStyles = enableFAB
      ? `
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },`
      : '';

    const searchStyles = enableSearch
      ? `
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },`
      : '';

    const entityIcon = this.getEntityIcon(entity.name);
    const searchQueryDep = enableSearch ? ', searchQuery' : '';
    const emptyMessage = enableSearch
      ? `\${searchQuery ? 'No results found. Try a different search.' : 'Get started by adding your first ${singularName.toLowerCase()}.'}`
      : `Get started by adding your first ${singularName.toLowerCase()}.`;

    const emptyButtonCode = enableFAB
      ? `
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('${pascalName}Form' as any, { mode: 'create' })}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.emptyButtonText}>Add ${singularName}</Text>
        </TouchableOpacity>`
      : '';

    const secondaryFieldDisplay = secondaryField
      ? `
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {item.${secondaryField} || ''}
        </Text>`
      : '';

    return {
      path: `src/screens/${pascalName}ListScreen.tsx`,
      content: `import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '@/services/api';
import type { ${pascalName} } from '@/types';
import type { AppStackParamList } from '@/navigation/AppNavigator';

type ${pascalName}ListScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function ${pascalName}ListScreen() {
  const navigation = useNavigation<${pascalName}ListScreenNavigationProp>();
  ${searchState}

  // Fetch ${pluralName.toLowerCase()}
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['${pluralCamelName}'],
    queryFn: () => api.get<${pascalName}[]>('/${snakeName}s'),
  });
  ${searchFilter}

  const handleItemPress = useCallback((item: ${pascalName}) => {
    navigation.navigate('${pascalName}Detail', { id: item.id });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: ${pascalName} }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.${displayField} || 'Untitled'}
        </Text>${secondaryFieldDisplay}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  ), [handleItemPress]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="${entityIcon}" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No ${pluralName}</Text>
        <Text style={styles.emptyMessage}>
          ${emptyMessage}
        </Text>${emptyButtonCode}
      </View>
    );
  }, [isLoading${searchQueryDep}, navigation]);

  const keyExtractor = useCallback((item: ${pascalName}) => item.id, []);

  // Loading state
  if (isLoading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading ${pluralName.toLowerCase()}...</Text>
      </View>
    );
  }

  // Error state
  if (isError && !data) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Failed to load</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'Something went wrong'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>${searchBarCode}

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          filteredItems.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />${fabCode}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },${searchStyles}
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptyMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },${fabStyles}
});
`,
      language: 'typescript',
    };
  }

  /**
   * Generate Entity Detail Screen
   *
   * Features:
   * - Entity data display
   * - Loading state
   * - Edit and Delete buttons (if owner)
   * - Related data sections
   * - Back navigation
   * - useQuery for fetching
   */
  generateEntityDetailScreen(
    entity: EnhancedEntityDefinition,
    schema: DatabaseSchema,
    options: { enableEdit?: boolean; enableDelete?: boolean } = {},
  ): GeneratedFile {
    const { enableEdit = true, enableDelete = true } = options;
    const pascalName = this.toPascalCase(entity.name);
    const camelName = this.toCamelCase(entity.name);
    const singularName = entity.displayName || entity.name;
    const snakeName = this.toSnakeCase(entity.name);
    const pluralCamelName = this.toCamelCase(this.pluralize(entity.name));

    // Get fields for display
    const displayFields = (entity.fields || []).filter(
      (f) => !['id', 'user_id', 'created_at', 'updated_at'].includes(f.name),
    );

    // Generate field display components
    const fieldDisplays = displayFields
      .map((field) => {
        const fieldLabel = this.toDisplayName(field.name);
        const fieldCamel = this.toCamelCase(field.name);
        const fieldType = field.type || 'string';

        if (fieldType === 'boolean') {
          return `
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>${fieldLabel}</Text>
            <View style={[styles.badge, data?.${fieldCamel} ? styles.badgeSuccess : styles.badgeDefault]}>
              <Text style={[styles.badgeText, data?.${fieldCamel} ? styles.badgeTextSuccess : styles.badgeTextDefault]}>
                {data?.${fieldCamel} ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>`;
        }

        if (fieldType === 'date' || fieldType === 'datetime') {
          return `
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>${fieldLabel}</Text>
            <Text style={styles.fieldValue}>
              {data?.${fieldCamel} ? new Date(data.${fieldCamel}).toLocaleDateString() : '-'}
            </Text>
          </View>`;
        }

        if (fieldType === 'text') {
          return `
          <View style={styles.fieldColumn}>
            <Text style={styles.fieldLabel}>${fieldLabel}</Text>
            <Text style={styles.fieldValueMultiline}>
              {data?.${fieldCamel} || '-'}
            </Text>
          </View>`;
        }

        // Handle JSON/object fields - stringify for display
        if (fieldType === 'json' || fieldType === 'array') {
          return `
          <View style={styles.fieldColumn}>
            <Text style={styles.fieldLabel}>${fieldLabel}</Text>
            <Text style={styles.fieldValueMultiline}>
              {data?.${fieldCamel} ? JSON.stringify(data.${fieldCamel}, null, 2) : '-'}
            </Text>
          </View>`;
        }

        return `
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>${fieldLabel}</Text>
            <Text style={styles.fieldValue}>{data?.${fieldCamel} ?? '-'}</Text>
          </View>`;
      })
      .join('\n');

    const displayField = this.getPrimaryDisplayField(entity);
    const entityIcon = this.getEntityIcon(entity.name).replace('-outline', '');

    const editButtonCode = enableEdit
      ? `
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('${pascalName}Form' as any, { mode: 'edit', id: route.params.id })}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>`
      : '';

    const deleteButtonCode = enableDelete
      ? `
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>`
      : '';

    const actionButtons =
      enableEdit || enableDelete
        ? `
        <View style={styles.actionsContainer}>${editButtonCode}${deleteButtonCode}
        </View>`
        : '';

    const deleteLogic = enableDelete
      ? `
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(\`/${snakeName}s/\${route.params.id}\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${pluralCamelName}'] });
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to delete ${singularName.toLowerCase()}',
      );
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete ${singularName}',
      'Are you sure you want to delete this ${singularName.toLowerCase()}? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            deleteMutation.mutate();
          },
        },
      ],
    );
  };`
      : '';

    const deleteImports = enableDelete ? `, useMutation, useQueryClient` : '';
    const queryClientInit = enableDelete ? `
  const queryClient = useQueryClient();` : '';
    const useStateImport = enableDelete ? ', { useState }' : '';

    const actionStyles =
      enableEdit || enableDelete
        ? `
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },`
        : '';

    return {
      path: `src/screens/${pascalName}DetailScreen.tsx`,
      content: `import React${useStateImport} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery${deleteImports} } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '@/services/api';
import type { ${pascalName} } from '@/types';
import type { AppStackParamList } from '@/navigation/AppNavigator';

type ${pascalName}DetailScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, '${pascalName}Detail'>;
type ${pascalName}DetailScreenRouteProp = RouteProp<AppStackParamList, '${pascalName}Detail'>;

export default function ${pascalName}DetailScreen() {
  const navigation = useNavigation<${pascalName}DetailScreenNavigationProp>();
  const route = useRoute<${pascalName}DetailScreenRouteProp>();${queryClientInit}

  // Fetch ${singularName.toLowerCase()} details
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['${camelName}', route.params.id],
    queryFn: () => api.get<${pascalName}>(\`/${snakeName}s/\${route.params.id}\`),
    enabled: !!route.params.id,
  });
  ${deleteLogic}

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Failed to load</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'Something went wrong'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="${entityIcon}" size={32} color="#3B82F6" />
          </View>
          <Text style={styles.title}>{data?.${displayField} || '${singularName}'}</Text>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.card}>
${fieldDisplays}
          </View>
        </View>

        {/* Metadata Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metadata</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Created</Text>
              <Text style={styles.fieldValue}>
                {data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-'}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Last Updated</Text>
              <Text style={styles.fieldValue}>
                {data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : '-'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>${actionButtons}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fieldColumn: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'right',
    flex: 1,
  },
  fieldValueMultiline: {
    fontSize: 14,
    color: '#111827',
    marginTop: 8,
    lineHeight: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
  },
  badgeDefault: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextSuccess: {
    color: '#059669',
  },
  badgeTextDefault: {
    color: '#6B7280',
  },${actionStyles}
});
`,
      language: 'typescript',
    };
  }

  /**
   * Generate Entity Form Screen (Create/Edit)
   *
   * Features:
   * - Dynamic form fields based on entity schema
   * - TextInput for strings
   * - Switch for booleans
   * - Picker for enums/relations
   * - DatePicker for dates
   * - Form validation
   * - useMutation for submit
   * - Loading state on submit
   */
  generateEntityFormScreen(
    entity: EnhancedEntityDefinition,
    schema: DatabaseSchema,
    options: { mode?: 'create' | 'edit' } = {},
  ): GeneratedFile {
    const pascalName = this.toPascalCase(entity.name);
    const camelName = this.toCamelCase(entity.name);
    const singularName = entity.displayName || entity.name;
    const snakeName = this.toSnakeCase(entity.name);
    const pluralCamelName = this.toCamelCase(this.pluralize(entity.name));

    // Get editable fields (exclude system fields)
    const editableFields = (entity.fields || []).filter(
      (f) =>
        !['id', 'user_id', 'created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(f.name),
    );

    // Generate initial form state
    const initialFormState = editableFields
      .map((field) => {
        const fieldCamel = this.toCamelCase(field.name);
        const fieldType = field.type || 'string';
        const defaultValue =
          fieldType === 'boolean'
            ? 'false'
            : fieldType === 'number' || fieldType === 'integer' || fieldType === 'decimal'
              ? '0'
              : "''";
        return `    ${fieldCamel}: ${defaultValue},`;
      })
      .join('\n');

    // Generate form field components
    const formFields = editableFields
      .map((field) => {
        const fieldLabel = this.toDisplayName(field.name);
        const fieldCamel = this.toCamelCase(field.name);
        const fieldType = field.type || 'string';
        const isRequired = field.required || false;
        const requiredMark = isRequired ? ' *' : '';

        if (fieldType === 'boolean') {
          return `
        {/* ${fieldLabel} */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>${fieldLabel}</Text>
          <Switch
            value={formData.${fieldCamel}}
            onValueChange={(value) => updateField('${fieldCamel}', value)}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={formData.${fieldCamel} ? '#3B82F6' : '#F9FAFB'}
            disabled={isSubmitting}
          />
        </View>`;
        }

        if (fieldType === 'text') {
          return `
        {/* ${fieldLabel} */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            ${fieldLabel}${requiredMark}
          </Text>
          <TextInput
            style={[styles.textArea, errors.${fieldCamel} && styles.inputError]}
            value={formData.${fieldCamel}}
            onChangeText={(value) => updateField('${fieldCamel}', value)}
            placeholder="Enter ${fieldLabel.toLowerCase()}"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
          {errors.${fieldCamel} && (
            <Text style={styles.errorText}>{errors.${fieldCamel}}</Text>
          )}
        </View>`;
        }

        if (fieldType === 'number' || fieldType === 'integer' || fieldType === 'decimal') {
          return `
        {/* ${fieldLabel} */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            ${fieldLabel}${requiredMark}
          </Text>
          <TextInput
            style={[styles.input, errors.${fieldCamel} && styles.inputError]}
            value={String(formData.${fieldCamel})}
            onChangeText={(value) => updateField('${fieldCamel}', parseFloat(value) || 0)}
            placeholder="Enter ${fieldLabel.toLowerCase()}"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            editable={!isSubmitting}
          />
          {errors.${fieldCamel} && (
            <Text style={styles.errorText}>{errors.${fieldCamel}}</Text>
          )}
        </View>`;
        }

        if (fieldType === 'email') {
          return `
        {/* ${fieldLabel} */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            ${fieldLabel}${requiredMark}
          </Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputIconized, errors.${fieldCamel} && styles.inputError]}
              value={formData.${fieldCamel}}
              onChangeText={(value) => updateField('${fieldCamel}', value)}
              placeholder="Enter ${fieldLabel.toLowerCase()}"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
          </View>
          {errors.${fieldCamel} && (
            <Text style={styles.errorText}>{errors.${fieldCamel}}</Text>
          )}
        </View>`;
        }

        if (fieldType === 'url') {
          return `
        {/* ${fieldLabel} */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            ${fieldLabel}${requiredMark}
          </Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="link-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputIconized, errors.${fieldCamel} && styles.inputError]}
              value={formData.${fieldCamel}}
              onChangeText={(value) => updateField('${fieldCamel}', value)}
              placeholder="Enter ${fieldLabel.toLowerCase()}"
              placeholderTextColor="#9CA3AF"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
          </View>
          {errors.${fieldCamel} && (
            <Text style={styles.errorText}>{errors.${fieldCamel}}</Text>
          )}
        </View>`;
        }

        if (fieldType === 'phone') {
          return `
        {/* ${fieldLabel} */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            ${fieldLabel}${requiredMark}
          </Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputIconized, errors.${fieldCamel} && styles.inputError]}
              value={formData.${fieldCamel}}
              onChangeText={(value) => updateField('${fieldCamel}', value)}
              placeholder="Enter ${fieldLabel.toLowerCase()}"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              editable={!isSubmitting}
            />
          </View>
          {errors.${fieldCamel} && (
            <Text style={styles.errorText}>{errors.${fieldCamel}}</Text>
          )}
        </View>`;
        }

        // JSON/Object fields - use textarea with JSON editing
        if (fieldType === 'json' || fieldType === 'array') {
          return `
        {/* ${fieldLabel} */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            ${fieldLabel}${requiredMark} (JSON)
          </Text>
          <TextInput
            style={[styles.textArea, errors.${fieldCamel} && styles.inputError]}
            value={formData.${fieldCamel}}
            onChangeText={(value) => updateField('${fieldCamel}', value)}
            placeholder='{"key": "value"}'
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
          {errors.${fieldCamel} && (
            <Text style={styles.errorText}>{errors.${fieldCamel}}</Text>
          )}
        </View>`;
        }

        // Default: string input
        return `
        {/* ${fieldLabel} */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            ${fieldLabel}${requiredMark}
          </Text>
          <TextInput
            style={[styles.input, errors.${fieldCamel} && styles.inputError]}
            value={formData.${fieldCamel}}
            onChangeText={(value) => updateField('${fieldCamel}', value)}
            placeholder="Enter ${fieldLabel.toLowerCase()}"
            placeholderTextColor="#9CA3AF"
            editable={!isSubmitting}
          />
          {errors.${fieldCamel} && (
            <Text style={styles.errorText}>{errors.${fieldCamel}}</Text>
          )}
        </View>`;
      })
      .join('\n');

    // Generate validation logic
    const validationFields = editableFields
      .filter((f) => f.required)
      .map((field) => {
        const fieldLabel = this.toDisplayName(field.name);
        const fieldCamel = this.toCamelCase(field.name);
        const fieldType = field.type || 'string';

        if (fieldType === 'boolean') {
          return ''; // Booleans don't need required validation
        }

        if (fieldType === 'email') {
          return `
    if (!formData.${fieldCamel}?.trim()) {
      newErrors.${fieldCamel} = '${fieldLabel} is required';
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.${fieldCamel})) {
      newErrors.${fieldCamel} = 'Please enter a valid email address';
    }`;
        }

        if (fieldType === 'number' || fieldType === 'integer' || fieldType === 'decimal') {
          return `
    if (formData.${fieldCamel} === undefined || formData.${fieldCamel} === null) {
      newErrors.${fieldCamel} = '${fieldLabel} is required';
    }`;
        }

        return `
    if (!formData.${fieldCamel}?.trim()) {
      newErrors.${fieldCamel} = '${fieldLabel} is required';
    }`;
      })
      .filter(Boolean)
      .join('');

    // Generate TypeScript interface for form data
    const formDataInterface = editableFields
      .map((field) => {
        const fieldCamel = this.toCamelCase(field.name);
        const fieldType = field.type || 'string';
        const tsType =
          fieldType === 'boolean'
            ? 'boolean'
            : fieldType === 'number' || fieldType === 'integer' || fieldType === 'decimal'
              ? 'number'
              : 'string';
        return `  ${fieldCamel}: ${tsType};`;
      })
      .join('\n');

    // Generate errors interface
    const errorsInterface = editableFields
      .map((field) => {
        const fieldCamel = this.toCamelCase(field.name);
        return `  ${fieldCamel}?: string;`;
      })
      .join('\n');

    // Generate existing data mapping
    const existingDataMapping = editableFields
      .map((field) => {
        const fieldCamel = this.toCamelCase(field.name);
        const fieldType = field.type || 'string';
        const defaultValue =
          fieldType === 'boolean'
            ? 'false'
            : fieldType === 'number' || fieldType === 'integer' || fieldType === 'decimal'
              ? '0'
              : "''";
        // For JSON fields, stringify the object for form editing
        if (fieldType === 'json' || fieldType === 'array') {
          return `        ${fieldCamel}: existingData.${fieldCamel} ? JSON.stringify(existingData.${fieldCamel}, null, 2) : ${defaultValue},`;
        }
        return `        ${fieldCamel}: existingData.${fieldCamel} ?? ${defaultValue},`;
      })
      .join('\n');

    return {
      path: `src/screens/${pascalName}FormScreen.tsx`,
      content: `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '@/services/api';
import type { ${pascalName} } from '@/types';
import type { AppStackParamList } from '@/navigation/AppNavigator';

// Extend the param list for form screen
type FormParamList = AppStackParamList & {
  ${pascalName}Form: { mode: 'create' | 'edit'; id?: string };
};

type ${pascalName}FormScreenNavigationProp = NativeStackNavigationProp<FormParamList, '${pascalName}Form'>;
type ${pascalName}FormScreenRouteProp = RouteProp<FormParamList, '${pascalName}Form'>;

interface FormData {
${formDataInterface}
}

interface FormErrors {
${errorsInterface}
}

export default function ${pascalName}FormScreen() {
  const navigation = useNavigation<${pascalName}FormScreenNavigationProp>();
  const route = useRoute<${pascalName}FormScreenRouteProp>();
  const queryClient = useQueryClient();

  const isEditMode = route.params?.mode === 'edit';
  const itemId = route.params?.id;

  const [formData, setFormData] = useState<FormData>({
${initialFormState}
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing data for edit mode
  const { data: existingData, isLoading: isLoadingData } = useQuery({
    queryKey: ['${camelName}', itemId],
    queryFn: () => api.get<${pascalName}>(\`/${snakeName}s/\${itemId}\`),
    enabled: isEditMode && !!itemId,
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingData && isEditMode) {
      setFormData({
${existingDataMapping}
      });
    }
  }, [existingData, isEditMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post<${pascalName}>('/${snakeName}s', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${pluralCamelName}'] });
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create ${singularName.toLowerCase()}',
      );
      setIsSubmitting(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: FormData) => api.put<${pascalName}>(\`/${snakeName}s/\${itemId}\`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${pluralCamelName}'] });
      queryClient.invalidateQueries({ queryKey: ['${camelName}', itemId] });
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update ${singularName.toLowerCase()}',
      );
      setIsSubmitting(false);
    },
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
${validationFields}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  // Loading state for edit mode
  if (isEditMode && isLoadingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditMode ? 'Edit ${singularName}' : 'Create ${singularName}'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditMode
              ? 'Update the details below'
              : 'Fill in the details to create a new ${singularName.toLowerCase()}'}
          </Text>
        </View>

        <View style={styles.form}>
${formFields}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name={isEditMode ? 'checkmark' : 'add'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Save Changes' : 'Create'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputIconized: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
`,
      language: 'typescript',
    };
  }

  /**
   * Generate Home/Dashboard Screen
   *
   * Features:
   * - Welcome header
   * - Quick stats cards
   * - Recent items sections
   * - Quick action buttons
   */
  generateHomeScreen(
    analysis: EnhancedAppAnalysis,
    schema: DatabaseSchema,
    options: { appName?: string } = {},
  ): GeneratedFile {
    const entities = analysis.entities || [];
    const appName = options.appName || 'App';

    // Take top 3 entities for quick stats
    const statEntities = entities.slice(0, 3);

    // Generate stat cards
    const statCards = statEntities
      .map((entity, index) => {
        const pascalName = this.toPascalCase(entity.name);
        const pluralName = this.pluralize(entity.displayName || entity.name);
        const pluralCamelName = this.toCamelCase(this.pluralize(entity.name));
        const iconName = this.getEntityIcon(entity.name);
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
        const color = colors[index % colors.length];
        const bgColors = ['#EFF6FF', '#D1FAE5', '#FEF3C7', '#EDE9FE'];
        const bgColor = bgColors[index % bgColors.length];

        return `
      <TouchableOpacity
        style={styles.statCard}
        onPress={() => navigation.navigate('${pascalName}Tab' as any)}
        activeOpacity={0.7}
      >
        <View style={[styles.statIcon, { backgroundColor: '${bgColor}' }]}>
          <Ionicons name="${iconName}" size={24} color="${color}" />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>
            {${pluralCamelName}Query.data?.length ?? '-'}
          </Text>
          <Text style={styles.statLabel}>${pluralName}</Text>
        </View>
      </TouchableOpacity>`;
      })
      .join('\n');

    // Generate useQuery hooks for stats
    const statQueries = statEntities
      .map((entity) => {
        const pluralCamelName = this.toCamelCase(this.pluralize(entity.name));
        const snakeName = this.toSnakeCase(entity.name);
        const pascalName = this.toPascalCase(entity.name);

        return `
  const ${pluralCamelName}Query = useQuery({
    queryKey: ['${pluralCamelName}'],
    queryFn: () => api.get<${pascalName}[]>('/${snakeName}s'),
  });`;
      })
      .join('\n');

    // Generate combined type imports for stat entities
    const typeNames = statEntities.map((entity) => this.toPascalCase(entity.name));
    const typeImports = typeNames.length > 0
      ? `import type { ${typeNames.join(', ')} } from '@/types';`
      : '';

    // Generate quick action buttons
    const quickActions = entities
      .slice(0, 4)
      .map((entity) => {
        const pascalName = this.toPascalCase(entity.name);
        const singularName = entity.displayName || entity.name;
        const iconName = this.getEntityIcon(entity.name);

        return `
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('${pascalName}Form' as any, { mode: 'create' })}
          activeOpacity={0.7}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="${iconName}" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.quickActionText}>Add ${singularName}</Text>
        </TouchableOpacity>`;
      })
      .join('\n');

    // Generate recent items section for first entity
    const primaryEntity = entities[0];
    const primaryPascalName = primaryEntity ? this.toPascalCase(primaryEntity.name) : 'Item';
    const primaryPluralName = primaryEntity
      ? this.pluralize(primaryEntity.displayName || primaryEntity.name)
      : 'Items';
    const primaryPluralCamelName = primaryEntity
      ? this.toCamelCase(this.pluralize(primaryEntity.name))
      : 'items';
    const primaryDisplayField = primaryEntity
      ? this.getPrimaryDisplayField(primaryEntity)
      : 'title';

    const recentItemsSection = primaryEntity
      ? `
        {/* Recent ${primaryPluralName} */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent ${primaryPluralName}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('${primaryPascalName}Tab' as any)}>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>
          {${primaryPluralCamelName}Query.isLoading ? (
            <ActivityIndicator size="small" color="#3B82F6" style={styles.loader} />
          ) : ${primaryPluralCamelName}Query.data?.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>No ${primaryPluralName.toLowerCase()} yet</Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {(${primaryPluralCamelName}Query.data || []).slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentItem}
                  onPress={() => navigation.navigate('${primaryPascalName}Detail', { id: item.id })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.recentItemTitle} numberOfLines={1}>
                    {item.${primaryDisplayField} || 'Untitled'}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>`
      : '';

    const isRefreshingExpr =
      statEntities.length > 0
        ? statEntities
            .map((e) => `${this.toCamelCase(this.pluralize(e.name))}Query.isRefetching`)
            .join(' || ')
        : 'false';

    const refreshCalls =
      statEntities.length > 0
        ? statEntities
            .map((e) => `${this.toCamelCase(this.pluralize(e.name))}Query.refetch();`)
            .join('\n    ')
        : '';

    return {
      path: 'src/screens/HomeScreen.tsx',
      content: `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
${typeImports}
import type { AppStackParamList } from '@/navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
${statQueries}

  const isRefreshing = ${isRefreshingExpr};

  const handleRefresh = () => {
    ${refreshCalls}
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || 'Welcome'}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('ProfileTab' as any)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
${statCards}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
${quickActions}
        </View>
      </View>

      ${recentItemsSection}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quickActionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  loader: {
    padding: 24,
  },
  emptySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  recentList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recentItemTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginRight: 12,
  },
});
`,
      language: 'typescript',
    };
  }

  // ============================================
  // Helper Methods for Entity Screens
  // ============================================

  /**
   * Get the primary display field for an entity (used in list items and titles)
   */
  private getPrimaryDisplayField(entity: EnhancedEntityDefinition): string {
    const fields = entity.fields || [];
    const priorityFields = ['name', 'title', 'label', 'displayName', 'subject', 'headline'];

    for (const pf of priorityFields) {
      const found = fields.find(
        (f) =>
          f.name.toLowerCase() === pf.toLowerCase() ||
          this.toCamelCase(f.name).toLowerCase() === pf.toLowerCase(),
      );
      if (found) {
        return this.toCamelCase(found.name);
      }
    }

    // Fallback to first string field
    const stringField = fields.find((f) => f.type === 'string' || !f.type);
    if (stringField) {
      return this.toCamelCase(stringField.name);
    }

    return 'id';
  }

  /**
   * Get the secondary display field for an entity (used as subtitle in list items)
   */
  private getSecondaryDisplayField(entity: EnhancedEntityDefinition): string | null {
    const fields = entity.fields || [];
    const primaryField = this.getPrimaryDisplayField(entity);
    const priorityFields = [
      'description',
      'subtitle',
      'summary',
      'email',
      'status',
      'category',
      'type',
    ];

    for (const pf of priorityFields) {
      const found = fields.find(
        (f) =>
          (f.name.toLowerCase() === pf.toLowerCase() ||
            this.toCamelCase(f.name).toLowerCase() === pf.toLowerCase()) &&
          this.toCamelCase(f.name) !== primaryField,
      );
      if (found) {
        return this.toCamelCase(found.name);
      }
    }

    return null;
  }

  // Note: UI component generators (generateButton, generateCard, generateInput, etc.)
  // are now imported from ../components-native

  // ============================================
  // UTILITY GENERATORS
  // ============================================

  /**
   * Generate API Client (src/lib/api.ts)
   *
   * Features:
   * - Base URL from environment variable (EXPO_PUBLIC_API_URL)
   * - Bearer token authentication from AsyncStorage
   * - GET, POST, PUT, DELETE methods
   * - Error handling with proper types
   * - Query string support
   * - Automatic JSON parsing
   */
  generateApiClient(keys?: GeneratedKeys): GeneratedFile {
    return {
      path: 'src/services/api.ts',
      content: `import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = '@auth_token';

/**
 * API Error class for typed error handling
 */
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * API Response type
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Request options
 */
interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  skipAuth?: boolean;
}

/**
 * Build query string from params object
 */
function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? \`?\${queryString}\` : '';
}

/**
 * Get auth token from AsyncStorage
 */
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Make an API request
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, body, skipAuth = false, ...fetchOptions } = options;

  // Build URL with query params
  const queryString = params ? buildQueryString(params) : '';
  const url = \`\${API_BASE_URL}\${endpoint}\${queryString}\`;

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add auth token if available and not skipped
  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = \`Bearer \${token}\`;
    }
  }

  // Make request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse response
  let data: unknown;
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Handle errors
  if (!response.ok) {
    const errorMessage =
      (data as { message?: string })?.message ||
      (data as { error?: string })?.error ||
      \`Request failed with status \${response.status}\`;

    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

/**
 * API client with typed methods
 */
export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  /**
   * PUT request
   */
  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
`,
      language: 'typescript',
    };
  }

  /**
   * Generate Type Definitions (src/types/index.ts)
   *
   * Features:
   * - Entity interfaces based on schema (e.g., Post, Comment, Category)
   * - API response types
   * - Navigation param types
   */
  generateTypes(analysis: EnhancedAppAnalysis, schema: DatabaseSchema): GeneratedFile {
    const entities = analysis.entities || [];

    // Generate entity interfaces
    const entityInterfaces = entities.map((entity) => {
      const pascalName = this.toPascalCase(entity.name);
      const fields = entity.fields || [];

      const fieldDefinitions = fields.map((field) => {
        const tsType = this.mapFieldTypeToTs(field.type);
        const optional = field.required === false ? '?' : '';
        return `  ${this.toCamelCase(field.name)}${optional}: ${tsType};`;
      }).join('\n');

      return `/**
 * ${entity.displayName || pascalName} entity
 */
export interface ${pascalName} {
  id: string;
${fieldDefinitions}
  createdAt: string;
  updatedAt: string;
}`;
    }).join('\n\n');

    // Generate create/update input types for each entity
    const inputTypes = entities.map((entity) => {
      const pascalName = this.toPascalCase(entity.name);
      const fields = entity.fields || [];

      const createFields = fields
        .filter(f => f.name !== 'id' && !['createdAt', 'updatedAt', 'created_at', 'updated_at'].includes(f.name))
        .map((field) => {
          const tsType = this.mapFieldTypeToTs(field.type);
          const optional = field.required === false ? '?' : '';
          return `  ${this.toCamelCase(field.name)}${optional}: ${tsType};`;
        }).join('\n');

      const updateFields = fields
        .filter(f => f.name !== 'id' && !['createdAt', 'updatedAt', 'created_at', 'updated_at'].includes(f.name))
        .map((field) => {
          const tsType = this.mapFieldTypeToTs(field.type);
          return `  ${this.toCamelCase(field.name)}?: ${tsType};`;
        }).join('\n');

      return `/**
 * Create ${pascalName} input
 */
export interface Create${pascalName}Input {
${createFields}
}

/**
 * Update ${pascalName} input
 */
export interface Update${pascalName}Input {
${updateFields}
}`;
    }).join('\n\n');

    // Generate navigation param types
    const stackParamTypes = entities.map((entity) => {
      const pascalName = this.toPascalCase(entity.name);
      return `  ${pascalName}Detail: { id: string };
  ${pascalName}Create: undefined;
  ${pascalName}Edit: { id: string };`;
    }).join('\n');

    return {
      path: 'src/types/index.ts',
      content: `/**
 * Auto-generated type definitions
 */

// ============================================
// AUTH TYPES
// ============================================

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auth response from login/register
 */
export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  refresh_token?: string;
  message?: string;
}

/**
 * Login input
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Register input
 */
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

// ============================================
// ENTITY TYPES
// ============================================

${entityInterfaces}

// ============================================
// INPUT TYPES
// ============================================

${inputTypes}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * List response (non-paginated)
 */
export interface ListResponse<T> {
  success: boolean;
  data: T[];
  count: number;
}

// ============================================
// NAVIGATION TYPES
// ============================================

/**
 * Root stack param list
 */
export type RootStackParamList = {
  App: undefined;
  Auth: undefined;
};

/**
 * Auth stack param list
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

/**
 * App stack param list
 */
export type AppStackParamList = {
  MainTabs: undefined;
${stackParamTypes}
};

/**
 * Tab param list
 */
export type TabParamList = {
${entities.slice(0, 4).map((e) => `  ${this.toPascalCase(e.name)}Tab: undefined;`).join('\n')}
  ProfileTab: undefined;
};
`,
      language: 'typescript',
    };
  }

  /**
   * Generate Utility Functions (src/lib/utils.ts)
   *
   * Features:
   * - formatDate, formatCurrency, formatNumber
   * - truncateText
   * - cn (classNames utility for NativeWind)
   * - generateId
   */
  generateUtils(): GeneratedFile {
    return {
      path: 'src/lib/utils.ts',
      content: `import { clsx, type ClassValue } from 'clsx';

/**
 * Combine class names for NativeWind
 * Similar to tailwind-merge but for React Native
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format a date string or Date object
 */
export function formatDate(
  date: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Invalid date:', date);
    return '';
  }
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date | undefined | null): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return \`\${diffInMinutes} minute\${diffInMinutes === 1 ? '' : 's'} ago\`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return \`\${diffInHours} hour\${diffInHours === 1 ? '' : 's'} ago\`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return \`\${diffInDays} day\${diffInDays === 1 ? '' : 's'} ago\`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return \`\${diffInWeeks} week\${diffInWeeks === 1 ? '' : 's'} ago\`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return \`\${diffInMonths} month\${diffInMonths === 1 ? '' : 's'} ago\`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return \`\${diffInYears} year\${diffInYears === 1 ? '' : 's'} ago\`;
  } catch (error) {
    console.error('Invalid date:', date);
    return '';
  }
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number | undefined | null,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (amount === undefined || amount === null) return '';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Invalid currency format:', amount, currency);
    return String(amount);
  }
}

/**
 * Format a number with locale-specific formatting
 */
export function formatNumber(
  value: number | undefined | null,
  options: Intl.NumberFormatOptions = {},
  locale: string = 'en-US'
): string {
  if (value === undefined || value === null) return '';

  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    console.error('Invalid number:', value);
    return String(value);
  }
}

/**
 * Format a number in compact notation (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(value: number | undefined | null): string {
  return formatNumber(value, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });
}

/**
 * Format a percentage
 */
export function formatPercent(
  value: number | undefined | null,
  decimals: number = 0
): string {
  if (value === undefined || value === null) return '';

  return formatNumber(value / 100, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Truncate text to a specified length
 */
export function truncateText(
  text: string | undefined | null,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength - ellipsis.length).trim() + ellipsis;
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return prefix ? \`\${prefix}_\${timestamp}\${randomPart}\` : \`\${timestamp}\${randomPart}\`;
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(text: string | undefined | null): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert a string to title case
 */
export function toTitleCase(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string | undefined | null, maxLength: number = 2): string {
  if (!name) return '';

  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('');
}

/**
 * Pluralize a word based on count
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural || \`\${word}s\`;
}
`,
      language: 'typescript',
    };
  }

  /**
   * Generate Theme Configuration (src/theme/index.ts)
   *
   * Features:
   * - Colors (primary, secondary, background, text, border, error, success)
   * - Spacing scale
   * - Border radius values
   * - Typography (font sizes, weights)
   */
  generateTheme(): GeneratedFile {
    return {
      path: 'src/theme/index.ts',
      content: `/**
 * Theme configuration for the app
 * Provides a consistent design system across all components
 */

// ============================================
// COLORS
// ============================================

export const colors = {
  // Primary brand colors
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main primary color
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary colors
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B', // Main secondary color
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    inverse: '#111827',
  },

  // Text colors
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#3B82F6',
  },

  // Border colors
  border: {
    light: '#F3F4F6',
    default: '#E5E7EB',
    dark: '#D1D5DB',
    focus: '#3B82F6',
  },

  // Status colors
  success: {
    light: '#D1FAE5',
    default: '#10B981',
    dark: '#059669',
    text: '#065F46',
  },

  error: {
    light: '#FEE2E2',
    default: '#EF4444',
    dark: '#DC2626',
    text: '#991B1B',
  },

  warning: {
    light: '#FEF3C7',
    default: '#F59E0B',
    dark: '#D97706',
    text: '#92400E',
  },

  info: {
    light: '#DBEAFE',
    default: '#3B82F6',
    dark: '#2563EB',
    text: '#1E40AF',
  },

  // Common colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ============================================
// SPACING
// ============================================

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  none: 0,
  sm: 4,
  default: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

export const fontWeights = {
  thin: '100' as const,
  extralight: '200' as const,
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
} as const;

// ============================================
// Z-INDEX
// ============================================

export const zIndex = {
  hide: -1,
  auto: 'auto' as const,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

// ============================================
// ANIMATION DURATIONS
// ============================================

export const durations = {
  fastest: 50,
  fast: 100,
  normal: 200,
  slow: 300,
  slower: 500,
  slowest: 1000,
} as const;

// ============================================
// BREAKPOINTS (for responsive design)
// ============================================

export const breakpoints = {
  xs: 0,
  sm: 375,
  md: 428,
  lg: 768,
  xl: 1024,
} as const;

// ============================================
// THEME OBJECT
// ============================================

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSizes,
  fontWeights,
  lineHeights,
  shadows,
  zIndex,
  durations,
  breakpoints,
} as const;

export type Theme = typeof theme;

export default theme;
`,
      language: 'typescript',
    };
  }

  /**
   * Generate App Constants (src/constants/index.ts)
   *
   * Features:
   * - APP_NAME
   * - API endpoints map
   * - Storage keys
   */
  generateConstants(appName: string): GeneratedFile {
    const displayName = this.toDisplayName(appName);
    const slug = this.toSlug(appName);

    return {
      path: 'src/constants/index.ts',
      content: `/**
 * Application constants
 */

// ============================================
// APP INFO
// ============================================

export const APP_NAME = '${displayName}';
export const APP_SLUG = '${slug}';
export const APP_VERSION = '1.0.0';

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => \`/users/\${id}\`,
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
  },

  // Common entity patterns
  // Add your entity endpoints here
  /*
  POSTS: {
    BASE: '/posts',
    BY_ID: (id: string) => \`/posts/\${id}\`,
    BY_USER: (userId: string) => \`/users/\${userId}/posts\`,
  },
  */
} as const;

// ============================================
// STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@auth_refresh_token',
  USER: '@auth_user',

  // App state
  ONBOARDING_COMPLETE: '@onboarding_complete',
  THEME_MODE: '@theme_mode',
  LANGUAGE: '@language',

  // Cache
  CACHE_PREFIX: '@cache_',

  // User preferences
  NOTIFICATIONS_ENABLED: '@notifications_enabled',
  BIOMETRICS_ENABLED: '@biometrics_enabled',

  // Misc
  LAST_SYNC: '@last_sync',
  DEVICE_ID: '@device_id',
} as const;

// ============================================
// QUERY KEYS (for React Query)
// ============================================

export const QUERY_KEYS = {
  // Auth
  USER: ['user'],

  // Common patterns
  // Add your query keys here
  /*
  POSTS: ['posts'],
  POST: (id: string) => ['posts', id],
  USER_POSTS: (userId: string) => ['users', userId, 'posts'],
  */
} as const;

// ============================================
// PAGINATION
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ============================================
// VALIDATION
// ============================================

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  BIO_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
} as const;

// ============================================
// FILE UPLOAD
// ============================================

export const FILE_UPLOAD = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/webm'],
  ALLOWED_FILE_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  // Network
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',

  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',

  // Validation
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: \`Password must be at least \${VALIDATION.PASSWORD_MIN_LENGTH} characters.\`,
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',

  // Generic
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  FORBIDDEN: 'You do not have permission to access this resource.',
} as const;

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'You have been logged out.',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent. Check your inbox.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully. You can now log in.',

  // Profile
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  AVATAR_UPLOADED: 'Profile photo updated.',

  // Generic
  SAVED: 'Changes saved.',
  DELETED: 'Deleted successfully.',
  CREATED: 'Created successfully.',
} as const;

// ============================================
// REGEX PATTERNS
// ============================================

export const REGEX = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
  PHONE: /^\\+?[1-9]\\d{1,14}$/,
  URL: /^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

export default {
  APP_NAME,
  APP_SLUG,
  APP_VERSION,
  API_ENDPOINTS,
  STORAGE_KEYS,
  QUERY_KEYS,
  PAGINATION,
  VALIDATION,
  FILE_UPLOAD,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX,
};
`,
      language: 'typescript',
    };
  }
}
