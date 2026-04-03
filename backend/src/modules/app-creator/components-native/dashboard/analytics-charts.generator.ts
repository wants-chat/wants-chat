/**
 * Analytics Charts Component Generator (React Native)
 *
 * Generates analytics dashboard with stats cards and simple chart visualizations.
 * Uses basic Views for charts (no external chart library) with bar/line representations.
 */

export interface AnalyticsChartsOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateAnalyticsCharts(options: AnalyticsChartsOptions = {}): string {
  const {
    componentName = 'AnalyticsCharts',
    endpoint = '/analytics',
    title = 'Analytics Overview',
  } = options;

  return `import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface AnalyticsData {
  totalRevenue?: number;
  totalOrders?: number;
  totalUsers?: number;
  conversionRate?: number;
  revenueChange?: number;
  ordersChange?: number;
  chartData?: {
    labels: string[];
    values: number[];
  };
  categoryData?: {
    name: string;
    value: number;
  }[];
}

const { width: screenWidth } = Dimensions.get('window');

// Stats Card Component
interface StatsCardProps {
  label: string;
  value: string;
  change?: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, change, icon, color }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statsCard, { opacity: animatedValue }]}>
      <View style={styles.statsCardHeader}>
        <View style={styles.statsCardInfo}>
          <Text style={styles.statsLabel}>{label}</Text>
          <Text style={styles.statsValue}>{value}</Text>
        </View>
        <View style={[styles.statsIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
      </View>
      {change !== undefined && change !== 0 && (
        <View style={styles.changeContainer}>
          <Ionicons
            name={change > 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={change > 0 ? '#10B981' : '#EF4444'}
          />
          <Text style={[styles.changeText, { color: change > 0 ? '#10B981' : '#EF4444' }]}>
            {Math.abs(change)}% from last month
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

// Simple Bar Chart Component (using Views)
interface BarChartProps {
  title: string;
  data: { label: string; value: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ title, data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const animatedWidths = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = data.map((item, index) => {
      return Animated.timing(animatedWidths[index], {
        toValue: (item.value / maxValue) * 100,
        duration: 800,
        delay: index * 100,
        useNativeDriver: false,
      });
    });
    Animated.parallel(animations).start();
  }, [data]);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.barChartContent}>
        {data.map((item, index) => (
          <View key={index} style={styles.barRow}>
            <Text style={styles.barLabel} numberOfLines={1}>{item.label}</Text>
            <View style={styles.barTrack}>
              <Animated.View
                style={[
                  styles.barFill,
                  {
                    width: animatedWidths[index].interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.barValue}>{item.value.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Simple Line Chart Component (using Views)
interface LineChartProps {
  title: string;
  labels: string[];
  values: number[];
}

const LineChart: React.FC<LineChartProps> = ({ title, labels, values }) => {
  const maxValue = Math.max(...values, 1);
  const chartHeight = 120;
  const animatedHeights = useRef(values.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = values.map((value, index) => {
      return Animated.timing(animatedHeights[index], {
        toValue: (value / maxValue) * chartHeight,
        duration: 800,
        delay: index * 50,
        useNativeDriver: false,
      });
    });
    Animated.parallel(animations).start();
  }, [values]);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={[styles.lineChartContent, { height: chartHeight + 40 }]}>
        <View style={styles.lineChartBars}>
          {values.map((value, index) => (
            <View key={index} style={styles.lineChartColumn}>
              <View style={[styles.lineChartBarContainer, { height: chartHeight }]}>
                <Animated.View
                  style={[
                    styles.lineChartBar,
                    { height: animatedHeights[index] },
                  ]}
                />
              </View>
              <Text style={styles.lineChartLabel} numberOfLines={1}>
                {labels[index]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {};
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const stats: StatsCardProps[] = [
    {
      label: 'Total Revenue',
      value: analytics?.totalRevenue ? '$' + analytics.totalRevenue.toLocaleString() : '$0',
      change: analytics?.revenueChange,
      icon: 'bar-chart',
      color: '#3B82F6',
    },
    {
      label: 'Total Orders',
      value: analytics?.totalOrders?.toLocaleString() || '0',
      change: analytics?.ordersChange,
      icon: 'cart',
      color: '#8B5CF6',
    },
    {
      label: 'Total Users',
      value: analytics?.totalUsers?.toLocaleString() || '0',
      icon: 'people',
      color: '#10B981',
    },
    {
      label: 'Conversion Rate',
      value: (analytics?.conversionRate || 0).toFixed(1) + '%',
      icon: 'trending-up',
      color: '#F59E0B',
    },
  ];

  // Sample chart data (replace with actual data from API)
  const revenueChartData = analytics?.chartData || {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [1200, 1900, 1500, 2400, 2100, 2800],
  };

  const categoryChartData = analytics?.categoryData || [
    { name: 'Electronics', value: 4500 },
    { name: 'Clothing', value: 3200 },
    { name: 'Home', value: 2800 },
    { name: 'Sports', value: 1900 },
    { name: 'Books', value: 1200 },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
    >
      <Text style={styles.title}>${title}</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </View>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        <LineChart
          title="Revenue Over Time"
          labels={revenueChartData.labels}
          values={revenueChartData.values}
        />

        <BarChart
          title="Sales by Category"
          data={categoryChartData.map(item => ({
            label: item.name,
            value: item.value,
          }))}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statsCard: {
    width: (screenWidth - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsCardInfo: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  statsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  changeText: {
    fontSize: 12,
    marginLeft: 4,
  },

  // Charts
  chartsSection: {
    marginTop: 16,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },

  // Bar Chart
  barChartContent: {
    gap: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    width: 80,
    fontSize: 12,
    color: '#6B7280',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  barValue: {
    width: 50,
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
  },

  // Line Chart (using bars)
  lineChartContent: {
    justifyContent: 'flex-end',
  },
  lineChartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  lineChartColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  lineChartBarContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  lineChartBar: {
    width: 24,
    backgroundColor: '#3B82F6',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  lineChartLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default ${componentName};
`;
}
