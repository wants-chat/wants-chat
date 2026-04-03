import { AppBlueprint } from '../../../interfaces/app-builder.types';

/**
 * Get icon emoji for a section based on name
 *
 * Maps section names to appropriate emoji icons for tab navigation.
 * Uses smart matching based on section name keywords across ALL domains.
 * Follows the same prompt-based approach as the React frontend generator.
 *
 * @param sectionName - The name of the section from the blueprint
 * @param index - The index of the section in the list (for generic fallback only)
 * @returns Quoted emoji string for use in React Native Text component
 */
function getSectionIcon(sectionName: string, index: number): string {
  const nameLower = sectionName.toLowerCase();

  // General/Common sections (works for all app types)
  if (nameLower.includes('home') || nameLower.includes('main') || nameLower.includes('dashboard')) {
    return "'🏠'";
  }
  if (nameLower.includes('profile') || nameLower.includes('account') || nameLower.includes('user')) {
    return "'👤'";
  }
  if (nameLower.includes('setting') || nameLower.includes('config')) {
    return "'⚙️'";
  }
  if (nameLower.includes('search') || nameLower.includes('explore')) {
    return "'🔍'";
  }
  if (nameLower.includes('notification') || nameLower.includes('alert') || nameLower.includes('message')) {
    return "'🔔'";
  }
  if (nameLower.includes('analytics') || nameLower.includes('report') || nameLower.includes('stat')) {
    return "'📊'";
  }
  if (nameLower.includes('calendar') || nameLower.includes('schedule')) {
    return "'📅'";
  }

  // E-commerce specific
  if (nameLower.includes('product') || nameLower.includes('storefront') || nameLower.includes('catalog')) {
    return "'🛍️'";
  }
  if (nameLower.includes('cart') || nameLower.includes('basket') || nameLower.includes('bag')) {
    return "'🛒'";
  }
  if (nameLower.includes('order') || nameLower.includes('purchase')) {
    return "'📦'";
  }
  if (nameLower.includes('favorite') || nameLower.includes('wishlist')) {
    return "'❤️'";
  }

  // Healthcare specific
  if (nameLower.includes('patient') || nameLower.includes('medical')) {
    return "'🏥'";
  }
  if (nameLower.includes('appointment') || nameLower.includes('booking')) {
    return "'📋'";
  }
  if (nameLower.includes('prescription') || nameLower.includes('medication')) {
    return "'💊'";
  }
  if (nameLower.includes('doctor') || nameLower.includes('physician')) {
    return "'👨‍⚕️'";
  }

  // Blog/Content specific
  if (nameLower.includes('post') || nameLower.includes('article') || nameLower.includes('blog')) {
    return "'📝'";
  }
  if (nameLower.includes('category') || nameLower.includes('tag')) {
    return "'📁'";
  }
  if (nameLower.includes('comment') || nameLower.includes('discussion')) {
    return "'💬'";
  }

  // Social Media specific
  if (nameLower.includes('feed') || nameLower.includes('timeline')) {
    return "'📰'";
  }
  if (nameLower.includes('friend') || nameLower.includes('connection')) {
    return "'👥'";
  }
  if (nameLower.includes('photo') || nameLower.includes('gallery') || nameLower.includes('media')) {
    return "'📷'";
  }

  // Education specific
  if (nameLower.includes('course') || nameLower.includes('class')) {
    return "'📚'";
  }
  if (nameLower.includes('lesson') || nameLower.includes('lecture')) {
    return "'📖'";
  }
  if (nameLower.includes('student') || nameLower.includes('learner')) {
    return "'🎓'";
  }

  // Task/Project Management
  if (nameLower.includes('task') || nameLower.includes('todo')) {
    return "'✅'";
  }
  if (nameLower.includes('project')) {
    return "'📂'";
  }
  if (nameLower.includes('team') || nameLower.includes('member')) {
    return "'👥'";
  }

  // Generic fallback - neutral icons suitable for ANY app type
  const genericIcons = [
    "'🏠'",  // Home
    "'📋'",  // List/Content
    "'➕'",  // Create/Add
    "'👤'",  // Profile/User
    "'⚙️'",  // Settings
  ];
  return genericIcons[index % genericIcons.length];
}

/**
 * Get display title for a section based on name
 *
 * Uses the actual section name from the blueprint for tab labels.
 * Follows the same prompt-based approach as the React frontend generator.
 * NO hardcoded e-commerce labels - uses what the user specified in their prompt.
 *
 * @param sectionName - The name of the section from the blueprint
 * @returns Display title for the tab (uses actual section name)
 */
function getSectionTitle(sectionName: string): string {
  // ALWAYS return the actual section name from the blueprint
  // This ensures the mobile app reflects exactly what the user requested
  // Just like the React frontend generator does
  return sectionName;
}

/**
 * Generate AppNavigator - Main application navigation using drawer
 *
 * Creates a drawer navigator that displays all sections and pages:
 * - Drawer menu with collapsible sections
 * - All pages accessible from drawer
 * - Handles screen deduplication to avoid duplicate imports
 *
 * @param blueprint - The app blueprint containing sections and pages
 * @returns Generated AppNavigator component code as string
 */
export function generateAppNavigator(blueprint: AppBlueprint): string {
  const sections = blueprint.sections.filter(s => s.pages.length > 0);

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

  // Get route name (no Screen suffix)
  const getRouteName = (pageName: string): string => {
    return pageName
      // First, insert hyphens before uppercase letters to split camelCase
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      // Then split on hyphens, underscores, and spaces
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  };

  // Collect all unique screens from all pages
  const uniqueScreens = new Map<string, string>();
  const drawerScreens: string[] = [];
  const seenRouteNames = new Set<string>();

  sections.forEach(section => {
    section.pages.forEach(page => {
      const screenName = getScreenComponentName(page.name);
      const baseRouteName = getRouteName(page.name);
      let routeName = baseRouteName;

      // If route name already exists, prefix with section name to ensure uniqueness
      if (seenRouteNames.has(routeName)) {
        const sectionPrefix = section.name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        routeName = `${sectionPrefix}${baseRouteName}`;

        // If still duplicate after section prefix, add counter
        let counter = 2;
        while (seenRouteNames.has(routeName)) {
          routeName = `${sectionPrefix}${baseRouteName}${counter}`;
          counter++;
        }
      }

      seenRouteNames.add(routeName);

      // Add import if not already added
      if (!uniqueScreens.has(screenName)) {
        uniqueScreens.set(screenName, `import ${screenName} from '../screens/${screenName}';`);
      }

      // Add drawer screen entry
      drawerScreens.push(`      <Drawer.Screen
        name="${routeName}"
        component={${screenName}}
        options={{ title: '${page.name}', headerRight: () => null }}
      />`);
    });
  });

  const screenImports = Array.from(uniqueScreens.values()).join('\n');
  const allDrawerScreens = drawerScreens.join('\n');

  // Get initial route from app-type definition (passed via blueprint)
  // NO GUESSING - must be defined in app-type
  const initialRoute = (blueprint as any).defaultRoute
    ? Array.from(seenRouteNames).find(r =>
        r.toLowerCase() === (blueprint as any).defaultRoute.replace('/', '').toLowerCase() ||
        r.toLowerCase().includes((blueprint as any).defaultRoute.replace('/', '').toLowerCase())
      ) || Array.from(seenRouteNames)[0] || 'Home'
    : Array.from(seenRouteNames)[0] || 'Home';

  // Add default HomeScreen import if no sections
  const defaultImport = sections.length === 0 ? `
import { View, Text as RNText, StyleSheet, SafeAreaView } from 'react-native';

function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={styles.container}>
        <RNText style={styles.text}>Welcome to your app</RNText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: { fontSize: 16, color: '#6b7280' },
});
` : '';

  const defaultScreen = sections.length === 0 ? `      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home', headerRight: () => null }}
      />` : '';

  return `import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../components/CustomDrawer';
${screenImports}${defaultImport}

const Drawer = createDrawerNavigator();

export default function AppNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="${initialRoute}"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => null,
        drawerStyle: {
          width: 280,
        },
      }}
    >
${allDrawerScreens || defaultScreen}
    </Drawer.Navigator>
  );
}`;
}
