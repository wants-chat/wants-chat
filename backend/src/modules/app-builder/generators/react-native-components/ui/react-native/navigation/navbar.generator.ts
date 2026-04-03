/**
 * React Native Navbar Generator
 * Generates a mobile navigation bar component
 */

export function generateRNNavbar(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface NavbarProps {
  data?: any;
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightAction?: React.ReactNode;
  [key: string]: any;
}

export default function Navbar({
  data: propData,
  title: propTitle = 'App',
  showBack = false,
  onBackPress,
  onMenuPress,
  rightAction
}: NavbarProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/settings\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const title = propTitle || data?.title || data?.appName || 'App';

  if (loading && !propData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          {showBack && onBackPress ? (
            <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
          ) : onMenuPress ? (
            <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
              <Ionicons name="menu" size={24} color="#111827" />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.rightSection}>
          {rightAction}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: 56,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  iconButton: {
    padding: 4,
  },
});`;

  return { code, imports };
}
