/**
 * React Native KPI Card Generator
 * Generates a Key Performance Indicator card component
 */

export function generateRNKpiCard(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface KpiCardProps {
  title?: string;
  value?: string | number;
  change?: number;
  icon?: string;
  color?: string;
  endpoint?: string;
  entity?: string;
  data?: any;
  [key: string]: any;
}

export default function KpiCard({
  title = 'Metric',
  value,
  change,
  icon = 'analytics',
  color = '#3b82f6',
  endpoint,
  entity = 'metrics',
  data: propData,
  ...props
}: KpiCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData || value) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const fetchEndpoint = endpoint || entity;
        const response = await fetch(\`\${apiUrl}/\${fetchEndpoint}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, endpoint, propData, value]);

  const data = propData || fetchedData;

  if (loading && !propData && !value) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }

  // If data is provided, try to extract meaningful stats
  let displayValue = value;
  let displayTitle = title;

  if (data && !value) {
    // If data is an array, show count
    if (Array.isArray(data)) {
      displayValue = data.length;
      if (!title || title === 'Metric') {
        displayTitle = 'Total Items';
      }
    } else if (typeof data === 'object') {
      // If data has a value property, use it
      if (data.value !== undefined) {
        displayValue = data.value;
      }
      if (data.title) {
        displayTitle = data.title;
      }
    }
  }

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: \`\${color}20\` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.value}>{displayValue || '0'}</Text>
        {change !== undefined && (
          <View style={styles.changeContainer}>
            <Ionicons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={16}
              color={isPositive ? '#10b981' : '#ef4444'}
            />
            <Text style={[
              styles.change,
              { color: isPositive ? '#10b981' : '#ef4444' }
            ]}>
              {Math.abs(change)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: 80,
  },
});`;

  return { code, imports };
}
