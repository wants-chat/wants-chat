/**
 * Food Truck Component Generator for React Native
 *
 * Generates food truck-specific components:
 * - FoodTruckStats: Dashboard stats for food truck operations
 * - LocationSchedule: Food truck location schedule
 * - FoodTruckMap: Map showing current location
 */

export interface FoodTruckOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate food truck stats dashboard component
 */
export function generateFoodTruckStats(options: FoodTruckOptions = {}): string {
  const { componentName = 'FoodTruckStats', endpoint = '/foodtruck/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const STATS_CONFIG = [
  { key: 'todaySales', label: "Today's Sales", icon: 'cash', color: '#16A34A', type: 'currency' },
  { key: 'ordersToday', label: 'Orders Today', icon: 'receipt', color: '#3B82F6', type: 'number' },
  { key: 'avgOrderValue', label: 'Avg Order', icon: 'trending-up', color: '#8B5CF6', type: 'currency' },
  { key: 'waitTime', label: 'Avg Wait Time', icon: 'time', color: '#F59E0B', type: 'time' },
  { key: 'customersServed', label: 'Customers', icon: 'people', color: '#06B6D4', type: 'number' },
  { key: 'topItem', label: 'Top Seller', icon: 'star', color: '#EC4899', type: 'text' },
];

function ${componentName}() {
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['foodtruck-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch food truck stats:', err);
        return {};
      }
    },
    refetchInterval: 60000,
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    if (type === 'time') return value + ' min';
    if (type === 'text') return value;
    return Number(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="bus" size={24} color="#F97316" />
          <Text style={styles.title}>Today's Dashboard</Text>
        </View>
        {stats.currentLocation && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#16A34A" />
            <Text style={styles.locationText}>{stats.currentLocation}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        {STATS_CONFIG.map((stat) => {
          const value = stats[stat.key];
          const change = stats[stat.key + 'Change'];

          return (
            <View key={stat.key} style={styles.statCard}>
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue} numberOfLines={1}>
                {formatValue(value, stat.type)}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {change !== undefined && (
                <View style={styles.changeRow}>
                  <Ionicons
                    name={change >= 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={change >= 0 ? '#16A34A' : '#EF4444'}
                  />
                  <Text style={[
                    styles.changeText,
                    { color: change >= 0 ? '#16A34A' : '#EF4444' },
                  ]}>
                    {Math.abs(change)}%
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate location schedule component
 */
export function generateLocationSchedule(options: FoodTruckOptions = {}): string {
  const { componentName = 'LocationSchedule', endpoint = '/foodtruck/schedule' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ScheduleEntry {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  address: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  is_current?: boolean;
  notes?: string;
}

interface ${componentName}Props {
  days?: number;
}

function ${componentName}({ days = 7 }: ${componentName}Props) {
  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ['foodtruck-schedule', days],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?days=\${days}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
        return [];
      }
    },
  });

  const handleOpenMaps = (entry: ScheduleEntry) => {
    if (entry.latitude && entry.longitude) {
      const url = \`maps://?ll=\${entry.latitude},\${entry.longitude}&q=\${encodeURIComponent(entry.location_name)}\`;
      Linking.openURL(url);
    } else if (entry.address) {
      const url = \`maps://?q=\${encodeURIComponent(entry.address)}\`;
      Linking.openURL(url);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: ScheduleEntry }) => {
    const date = new Date(item.date);
    const isToday = new Date().toDateString() === date.toDateString();

    return (
      <View style={[styles.scheduleCard, item.is_current && styles.currentCard]}>
        <View style={styles.dateColumn}>
          <Text style={[styles.dateMonth, item.is_current && styles.currentText]}>
            {date.toLocaleDateString('en-US', { month: 'short' })}
          </Text>
          <Text style={[styles.dateDay, item.is_current && styles.currentText]}>
            {date.getDate()}
          </Text>
          <Text style={[styles.dateWeekday, item.is_current && styles.currentText]}>
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </Text>
          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          )}
        </View>
        <View style={styles.scheduleInfo}>
          <View style={styles.locationHeader}>
            <View style={styles.locationNameRow}>
              <Ionicons
                name={item.is_current ? 'location' : 'location-outline'}
                size={16}
                color={item.is_current ? '#16A34A' : '#6B7280'}
              />
              <Text style={[styles.locationName, item.is_current && styles.currentLocationName]}>
                {item.location_name}
              </Text>
            </View>
            {item.is_current && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            )}
          </View>
          <Text style={styles.address}>{item.address}</Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.timeText}>
              {item.start_time} - {item.end_time}
            </Text>
          </View>
          {item.notes && (
            <Text style={styles.notes}>{item.notes}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={() => handleOpenMaps(item)}
        >
          <Ionicons name="navigate" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    );
  };

  if (schedule.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No scheduled locations</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar" size={20} color="#F97316" />
        <Text style={styles.title}>Schedule</Text>
      </View>
      <FlatList
        data={schedule}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    padding: 8,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  currentCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  dateColumn: {
    width: 56,
    alignItems: 'center',
    marginRight: 12,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F97316',
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 28,
  },
  dateWeekday: {
    fontSize: 11,
    color: '#6B7280',
  },
  currentText: {
    color: '#16A34A',
  },
  todayBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  todayText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  scheduleInfo: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  currentLocationName: {
    color: '#16A34A',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  address: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
  },
  notes: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  directionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}
