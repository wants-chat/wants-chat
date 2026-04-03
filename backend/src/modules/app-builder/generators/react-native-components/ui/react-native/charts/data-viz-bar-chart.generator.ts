import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRNDataVizBarChart = (
  resolved: ResolvedComponent,
  variant: 'vertical' | 'horizontal' = 'vertical'
) => {
  const dataSource = resolved.dataSource;

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Extract props from resolved component
  const props = resolved.props || {};
  const categoryField = props.categoryField || 'category';
  const valueField = props.valueField || 'amount';
  const title = resolved.title || 'Bar Chart';

  // Get API route from serverFunction
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource}`;
  };

  const apiRoute = getApiRoute();

  const code = `
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { apiClient } from '@/lib/api';

interface BarChartProps {
  ${dataName}?: any[];
  title?: string;
  categoryField?: string;
  valueField?: string;
  [key: string]: any;
}

export default function BarChart({
  ${dataName}: propData = [],
  title = '${title}',
  categoryField = '${categoryField}',
  valueField = '${valueField}'
}: BarChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      if (propData && propData.length > 0) {
        setChartData(propData);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('${apiRoute}');
        const data = Array.isArray(response) ? response : (response?.data || []);
        setChartData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setError('Failed to load chart data');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propData]);

  // Group data by category and sum values
  const barChartProcessedData = React.useMemo(() => {
    const grouped: Record<string, number> = {};

    chartData.forEach(item => {
      const category = item[categoryField] || 'Other';
      const value = Number(item[valueField]) || 0;
      grouped[category] = (grouped[category] || 0) + value;
    });

    // Convert to array and sort by value descending
    return Object.entries(grouped)
      .map(([label, value]) => ({ label: label, value: value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10
  }, [chartData, categoryField, valueField]);

  const barChartMaxValue = Math.max(...barChartProcessedData.map(d => d.value), 1);
  const barChartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (barChartProcessedData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartContainer}>
            {barChartProcessedData.map((item: any, index: number) => {
              const barHeight = (item.value / barChartMaxValue) * 200;
              const color = barChartColors[index % barChartColors.length];

              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <Text style={styles.barValueTop}>\${item.value.toFixed(2)}</Text>
                    <View
                      style={[
                        styles.bar,
                        { height: barHeight, backgroundColor: color }
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel} numberOfLines={2}>
                    {item.label.length > 12 ? item.label.substring(0, 12) + '...' : item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    padding: 32,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 20,
    paddingHorizontal: 10,
    gap: 16,
    minHeight: 280,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 60,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 220,
    marginBottom: 8,
  },
  bar: {
    width: 48,
    borderRadius: 6,
    minHeight: 20,
  },
  barValueTop: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  barLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    width: 60,
    height: 32,
  },
});`;

  return {
    code,
    fileName: 'BarChart.tsx',
    imports: []
  };
};
