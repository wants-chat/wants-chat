/**
 * React Native Footer Generator
 * Generates a mobile footer/tab bar component
 */

export function generateRNFooter(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface TabItem {
  icon: string;
  label: string;
  onPress: () => void;
}

interface FooterProps {
  data?: any;
  tabs?: TabItem[];
  activeTab?: number;
  [key: string]: any;
}

export default function Footer({ data: propData, tabs: propTabs, activeTab = 0 }: FooterProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData || propTabs) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/navigation\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch navigation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const tabs = propTabs || data?.tabs || data?.items || [];

  if (loading && !propData && !propTabs) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = index === activeTab;
        return (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={tab.onPress}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={isActive ? '#3b82f6' : '#6b7280'}
            />
            <Text style={[
              styles.label,
              { color: isActive ? '#3b82f6' : '#6b7280' }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
    paddingBottom: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 16,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});`;

  return { code, imports };
}
