/**
 * React Native Card Generator
 * Generates a reusable card container component
 */

export function generateRNCard(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, StyleSheet, ViewStyle, ActivityIndicator, Text } from 'react-native';`,
  ];

  const code = `${imports.join('\n')}

interface CardProps {
  data?: any;
  children?: React.ReactNode;
  style?: ViewStyle;
  [key: string]: any;
}

export default function Card({ data: propData, children, style }: CardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData || children) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/cards\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch card data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};

  if (loading && !propData && !children) {
    return (
      <View style={[styles.card, styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }

  // If children are provided, render them; otherwise render fetched data
  const content = children || (data?.content ? <Text>{data.content}</Text> : null);

  return (
    <View style={[styles.card, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
});`;

  return { code, imports };
}
