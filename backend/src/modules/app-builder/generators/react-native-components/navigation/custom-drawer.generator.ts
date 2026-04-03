import { AppBlueprint, Section } from '../../../interfaces/app-builder.types';

/**
 * Generate Custom Drawer Component for React Native
 * Creates a collapsible menu with sections matching the web frontend
 */
export function generateCustomDrawer(blueprint: AppBlueprint): string {
  const sections = blueprint.sections || [];

  // Track route names to detect duplicates (same logic as AppNavigator)
  const routeNameCounts = new Map<string, number>();

  // Build menu sections from blueprint
  const menuSections = sections.map(section => {
    const sectionId = section.id || section.name.toLowerCase().replace(/\s+/g, '-');
    const pages = section.pages || [];

    // Filter out detail/edit pages that should not appear in the drawer menu
    const shouldShowInMenu = (pageName: string): boolean => {
      const nameLower = pageName.toLowerCase();

      // Exclude generic detail/view pages (without "My" prefix)
      if (nameLower.includes('detail') && !nameLower.includes('my')) return false;
      if (nameLower === 'playlist' && !nameLower.includes('my') && !nameLower.includes('create')) return false;
      if (nameLower === 'artist' && !nameLower.includes('my') && !nameLower.includes('manage')) return false;
      if (nameLower === 'album' && !nameLower.includes('my') && !nameLower.includes('create') && !nameLower.includes('manage')) return false;
      if (nameLower === 'genre') return false;
      if (nameLower === 'track' && !nameLower.includes('create') && !nameLower.includes('manage') && !nameLower.includes('my')) return false;

      // Exclude edit pages from menu (they should be accessed from list/detail pages)
      if (nameLower.includes('edit')) return false;

      // Exclude entity list/detail/create/edit generic pages
      if (nameLower.includes('entity list')) return false;
      if (nameLower.includes('entity detail')) return false;
      if (nameLower.includes('entity page')) return false;

      return true;
    };

    const filteredPages = pages.filter(page => shouldShowInMenu(page.name));

    const items = filteredPages.map(page => {
      let routeName = page.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');

      // Check if route name already exists, if so, prefix with section name
      if (routeNameCounts.has(routeName)) {
        const sectionPrefix = section.name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        routeName = `${sectionPrefix}${routeName}`;
      }
      routeNameCounts.set(routeName, (routeNameCounts.get(routeName) || 0) + 1);

      const isCreatePage = page.name.toLowerCase().includes('create');

      return {
        id: page.id || routeName.toLowerCase(),
        label: page.name,
        icon: getIconForPage(page.name),
        route: routeName,
        highlighted: isCreatePage,
      };
    });

    return {
      id: sectionId,
      title: section.name,
      items,
    };
  });

  const menuSectionsJson = JSON.stringify(menuSections, null, 2)
    .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
    .replace(/: "([^"]+)"/g, ": '$1'"); // Use single quotes for strings

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CustomDrawerProps {
  navigation: any;
  state: any;
  descriptors: any;
  data?: any;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  highlighted?: boolean;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

const defaultMenuSections: MenuSection[] = ${menuSectionsJson};

export default function CustomDrawer({
  navigation,
  state,
  descriptors,
  data: propData,
}: CustomDrawerProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/navigation/menu\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const menuSections = data?.sections || data?.menuSections || defaultMenuSections;

  const [expandedSections, setExpandedSections] = useState<string[]>([
    menuSections[0]?.id || 'listener',
  ]);

  const toggleSection = (sectionId: string) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter((id) => id !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  const navigateToScreen = (route: string) => {
    navigation.navigate(route);
  };

  const handleLogout = async () => {
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
              await AsyncStorage.removeItem('auth_token');
              await AsyncStorage.removeItem('user_data');
              // Navigate to auth screen or reset navigation
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const currentRoute = state.routes[state.index].name;

  if (loading && !propData) {
    return (
      <DrawerContentScrollView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </DrawerContentScrollView>
    );
  }

  return (
    <DrawerContentScrollView style={styles.container}>
      <ScrollView>
        {menuSections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);

          return (
            <View key={section.id} style={styles.section}>
              {/* Section Header */}
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(section.id)}
              >
                <View style={styles.sectionHeaderLeft}>
                  <View
                    style={[
                      styles.sectionIndicator,
                      isExpanded && styles.sectionIndicatorExpanded,
                    ]}
                  />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {/* Section Items */}
              {isExpanded && (
                <View style={styles.itemsContainer}>
                  {section.items.map((item) => {
                    const isActive = currentRoute === item.route;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.menuItem,
                          isActive && styles.menuItemActive,
                          item.highlighted && styles.menuItemHighlighted,
                        ]}
                        onPress={() => navigateToScreen(item.route)}
                      >
                        <View style={styles.menuItemLeft}>
                          <Text
                            style={[
                              styles.menuIcon,
                              item.highlighted && styles.menuIconHighlighted,
                            ]}
                          >
                            {item.icon}
                          </Text>
                          <Text
                            style={[
                              styles.menuLabel,
                              isActive && styles.menuLabelActive,
                              item.highlighted && styles.menuLabelHighlighted,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutLabel}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
    marginRight: 12,
  },
  sectionIndicatorExpanded: {
    backgroundColor: '#3b82f6',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  chevron: {
    fontSize: 10,
    color: '#9ca3af',
  },
  itemsContainer: {
    paddingLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingLeft: 40,
    borderRadius: 8,
    marginVertical: 2,
    marginHorizontal: 8,
  },
  menuItemActive: {
    backgroundColor: '#eff6ff',
  },
  menuItemHighlighted: {
    backgroundColor: '#f97316',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  menuIconHighlighted: {
    fontSize: 14,
  },
  menuLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  menuLabelHighlighted: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  logoutIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  logoutLabel: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
});
`;
}

/**
 * Get appropriate icon for a page based on its name
 */
function getIconForPage(pageName: string): string {
  const name = pageName.toLowerCase();

  if (name.includes('home')) return '🏠';
  if (name.includes('browse')) return '🔍';
  if (name.includes('library')) return '📚';
  if (name.includes('playlist')) return '📝';
  if (name.includes('dashboard')) return '📊';
  if (name.includes('music')) return '🎵';
  if (name.includes('track')) return '🎵';
  if (name.includes('album')) return '💿';
  if (name.includes('artist')) return '🎤';
  if (name.includes('user')) return '👥';
  if (name.includes('content')) return '📁';
  if (name.includes('analytics')) return '📈';
  if (name.includes('report')) return '📋';
  if (name.includes('create')) return '➕';

  return '📄';
}
