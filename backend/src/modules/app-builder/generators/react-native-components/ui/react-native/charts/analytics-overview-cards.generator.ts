import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateAnalyticsOverviewCards = (resolved: ResolvedComponent) => {
  const code = `
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

interface AnalyticsCardData {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

interface AnalyticsOverviewCardsProps {
  data?: AnalyticsCardData[];
  cards?: AnalyticsCardData[];
  entity?: string;
  [key: string]: any;
}

export default function AnalyticsOverviewCards({
  data: propData,
  cards,
  entity = 'analytics',
}: AnalyticsOverviewCardsProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData || cards) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
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
  }, [entity, propData, cards]);

  const sourceData = propData || fetchedData || {};

  if (loading && !propData && !cards) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const cardData = cards || propData || (Array.isArray(sourceData) ? sourceData : sourceData?.cards || sourceData?.data || []);

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getTrendSymbol = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '';
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {cardData.map((card, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.value}>{card.value}</Text>
          {card.change && (
            <View style={styles.changeContainer}>
              <Text style={[
                styles.changeText,
                { color: getTrendColor(card.trend) }
              ]}>
                {getTrendSymbol(card.trend)} {card.change}
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: 160,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});
`;

  return {
    code,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, ScrollView } from 'react-native';",
    ],
  };
};
