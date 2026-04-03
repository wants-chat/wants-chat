/**
 * Catering Component Generator for React Native
 *
 * Generates catering-specific components:
 * - CateringStats: Dashboard stats for catering operations
 * - CateringMenuGrid: Catering packages/menus grid
 * - EventList: Upcoming catering events list
 */

export interface CateringOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate catering stats dashboard component
 */
export function generateCateringStats(options: CateringOptions = {}): string {
  const { componentName = 'CateringStats', endpoint = '/catering/stats' } = options;

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
  { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: 'cash', color: '#16A34A', type: 'currency' },
  { key: 'upcomingEvents', label: 'Upcoming Events', icon: 'calendar', color: '#3B82F6', type: 'number' },
  { key: 'pendingQuotes', label: 'Pending Quotes', icon: 'document-text', color: '#F59E0B', type: 'number' },
  { key: 'totalGuests', label: 'Total Guests (Month)', icon: 'people', color: '#8B5CF6', type: 'number' },
  { key: 'avgEventSize', label: 'Avg Event Size', icon: 'analytics', color: '#06B6D4', type: 'number' },
  { key: 'repeatClients', label: 'Repeat Clients', icon: 'heart', color: '#EC4899', type: 'percentage' },
];

function ${componentName}() {
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['catering-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch catering stats:', err);
        return {};
      }
    },
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    if (type === 'percentage') return value + '%';
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
        <Text style={styles.title}>Catering Dashboard</Text>
        <View style={styles.dateRow}>
          <Ionicons name="restaurant" size={16} color="#F97316" />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
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
              <Text style={styles.statValue}>{formatValue(value, stat.type)}</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
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
    fontSize: 24,
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
 * Generate catering menu/packages grid component
 */
export function generateCateringMenuGrid(options: CateringOptions = {}): string {
  const { componentName = 'CateringMenuGrid', endpoint = '/catering/packages' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface CateringPackage {
  id: string;
  name: string;
  description?: string;
  price_per_person: number;
  min_guests: number;
  max_guests?: number;
  image_url?: string;
  includes?: string[];
  is_popular?: boolean;
  category?: string;
}

interface ${componentName}Props {
  category?: string;
  onSelectPackage?: (pkg: CateringPackage) => void;
}

function ${componentName}({ category, onSelectPackage }: ${componentName}Props) {
  const navigation = useNavigation();

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['catering-packages', category],
    queryFn: async () => {
      try {
        const url = category
          ? '${endpoint}?category=' + encodeURIComponent(category)
          : '${endpoint}';
        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch catering packages:', err);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: CateringPackage }) => (
    <TouchableOpacity
      style={styles.packageCard}
      onPress={() => onSelectPackage ? onSelectPackage(item) : navigation.navigate('PackageDetail' as never, { id: item.id } as never)}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.packageImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="restaurant" size={32} color="#9CA3AF" />
          </View>
        )}
        {item.is_popular && (
          <View style={styles.popularBadge}>
            <Ionicons name="star" size={12} color="#FFFFFF" />
            <Text style={styles.popularBadgeText}>Popular</Text>
          </View>
        )}
      </View>
      <View style={styles.packageInfo}>
        <Text style={styles.packageName}>{item.name}</Text>
        {item.category && (
          <Text style={styles.packageCategory}>{item.category}</Text>
        )}
        {item.description && (
          <Text style={styles.packageDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.detailsRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>\${item.price_per_person}</Text>
            <Text style={styles.priceLabel}>per person</Text>
          </View>
          <View style={styles.guestsContainer}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.guestsText}>
              {item.min_guests}{item.max_guests ? \`-\${item.max_guests}\` : '+'} guests
            </Text>
          </View>
        </View>
        {item.includes && item.includes.length > 0 && (
          <View style={styles.includesContainer}>
            {item.includes.slice(0, 3).map((inc, i) => (
              <View key={i} style={styles.includeItem}>
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text style={styles.includeText} numberOfLines={1}>{inc}</Text>
              </View>
            ))}
            {item.includes.length > 3 && (
              <Text style={styles.moreIncludes}>
                +{item.includes.length - 3} more
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (packages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="restaurant-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No catering packages available</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={packages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  packageImage: {
    width: '100%',
    height: 160,
  },
  placeholderImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  packageInfo: {
    padding: 16,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  packageCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  packageDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F97316',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  guestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guestsText: {
    fontSize: 13,
    color: '#6B7280',
  },
  includesContainer: {
    marginTop: 12,
    gap: 6,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  includeText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  moreIncludes: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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

/**
 * Generate upcoming events list component
 */
export function generateEventList(options: CateringOptions = {}): string {
  const { componentName = 'EventList', endpoint = '/catering/events' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface CateringEvent {
  id: string;
  event_name: string;
  client_name?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  guest_count: number;
  package_name?: string;
  total: number;
  status: string;
  notes?: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  confirmed: { color: '#DCFCE7', icon: 'checkmark-circle', label: 'Confirmed' },
  pending: { color: '#FEF3C7', icon: 'time', label: 'Pending' },
  in_progress: { color: '#DBEAFE', icon: 'restaurant', label: 'In Progress' },
  completed: { color: '#E9D5FF', icon: 'checkmark-done', label: 'Completed' },
  cancelled: { color: '#FEE2E2', icon: 'close-circle', label: 'Cancelled' },
};

interface ${componentName}Props {
  limit?: number;
  showPast?: boolean;
}

function ${componentName}({ limit = 10, showPast = false }: ${componentName}Props) {
  const navigation = useNavigation();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['catering-events', limit, showPast],
    queryFn: async () => {
      try {
        const url = showPast
          ? '${endpoint}?limit=' + limit
          : '${endpoint}?limit=' + limit + '&upcoming=true';
        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: CateringEvent }) => {
    const status = STATUS_CONFIG[item.status?.toLowerCase()] || STATUS_CONFIG.pending;
    const eventDate = new Date(item.event_date);

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetail' as never, { id: item.id } as never)}
      >
        <View style={styles.dateColumn}>
          <Text style={styles.dateMonth}>
            {eventDate.toLocaleDateString('en-US', { month: 'short' })}
          </Text>
          <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
          <Text style={styles.dateWeekday}>
            {eventDate.toLocaleDateString('en-US', { weekday: 'short' })}
          </Text>
        </View>
        <View style={styles.eventInfo}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventName}>{item.event_name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Ionicons name={status.icon as any} size={12} color="#374151" />
              <Text style={styles.statusText}>{status.label}</Text>
            </View>
          </View>
          {item.client_name && (
            <Text style={styles.clientName}>{item.client_name}</Text>
          )}
          <View style={styles.eventDetails}>
            {item.event_time && (
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.detailText}>{item.event_time}</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{item.guest_count} guests</Text>
            </View>
            {item.location && (
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
              </View>
            )}
          </View>
          <View style={styles.eventFooter}>
            {item.package_name && (
              <View style={styles.packageBadge}>
                <Text style={styles.packageText}>{item.package_name}</Text>
              </View>
            )}
            <Text style={styles.totalValue}>\${(item.total || 0).toLocaleString()}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>
          {showPast ? 'No past events' : 'No upcoming events'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar" size={20} color="#F97316" />
          <Text style={styles.title}>
            {showPast ? 'Past Events' : 'Upcoming Events'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Events' as never)}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={events}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  listContent: {
    padding: 8,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  dateColumn: {
    width: 50,
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
  eventInfo: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  clientName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  packageBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  packageText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#F97316',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
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
