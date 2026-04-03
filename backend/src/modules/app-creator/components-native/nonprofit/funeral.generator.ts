/**
 * Funeral Component Generators (React Native)
 *
 * Generates funeral home management and arrangement components for React Native.
 */

export interface FuneralOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFuneralStats(options: FuneralOptions = {}): string {
  const { componentName = 'FuneralStats', endpoint = '/funeral' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['funeral-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/stats');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const statItems = [
    {
      label: 'Active Arrangements',
      value: stats?.active_arrangements || 0,
      icon: 'document-text',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      subtext: 'Currently in progress',
    },
    {
      label: 'Upcoming Services',
      value: stats?.upcoming_services || 0,
      icon: 'calendar',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
      subtext: 'Next 7 days',
    },
    {
      label: 'Families Served',
      value: stats?.families_served_this_month || 0,
      icon: 'people',
      color: '#10B981',
      bgColor: '#D1FAE5',
      subtext: 'This month',
    },
    {
      label: 'Pending Tasks',
      value: stats?.pending_tasks || 0,
      icon: 'time',
      color: '#F97316',
      bgColor: '#FFEDD5',
      subtext: 'Requires attention',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Funeral Home Dashboard</Text>
            <Text style={styles.bannerValue}>
              {stats?.total_arrangements_this_year || 0} arrangements this year
            </Text>
            <Text style={styles.bannerSubtext}>
              {stats?.comparison_text || 'Thank you for your service to families'}
            </Text>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons name="business" size={32} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statItems.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statSubtext}>{stat.subtext}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Today's Schedule */}
      <View style={styles.scheduleSection}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {stats?.todays_events?.length > 0 ? (
          stats.todays_events.map((event: any, i: number) => (
            <View key={i} style={styles.eventCard}>
              <View style={styles.eventTime}>
                <Text style={styles.timeText}>{event.time}</Text>
                <Text style={styles.typeText}>{event.type}</Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.familyName}>{event.family_name}</Text>
                <Text style={styles.location}>{event.location}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySchedule}>
            <Text style={styles.emptyText}>No events scheduled today</Text>
          </View>
        )}
      </View>

      {/* Service Breakdown */}
      <View style={styles.breakdownSection}>
        <Text style={styles.sectionTitle}>Service Breakdown</Text>
        {[
          { label: 'Traditional Services', value: stats?.traditional_services || 0, color: '#3B82F6' },
          { label: 'Cremation Services', value: stats?.cremation_services || 0, color: '#8B5CF6' },
          { label: 'Memorial Services', value: stats?.memorial_services || 0, color: '#10B981' },
          { label: 'Direct Services', value: stats?.direct_services || 0, color: '#F97316' },
        ].map((item, i) => {
          const total = (stats?.traditional_services || 0) +
                       (stats?.cremation_services || 0) +
                       (stats?.memorial_services || 0) +
                       (stats?.direct_services || 0);
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <View key={i} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={styles.breakdownValue}>{item.value}</Text>
              </View>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownFill,
                    { width: \`\${percentage}%\`, backgroundColor: item.color },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  headerBanner: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#475569',
    overflow: 'hidden',
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  bannerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  bannerSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  bannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  scheduleSection: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    gap: 16,
  },
  eventTime: {
    minWidth: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  typeText: {
    fontSize: 11,
    color: '#6B7280',
  },
  eventInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  location: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  emptySchedule: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  breakdownSection: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  breakdownBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default ${componentName};
`;
}

export function generateArrangementList(options: FuneralOptions = {}): string {
  const { componentName = 'ArrangementList', endpoint = '/arrangements' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  showFilters?: boolean;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ showFilters = true, limit }) => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const { data: arrangements, isLoading } = useQuery({
    queryKey: ['arrangements', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (limit) params.append('limit', limit.toString());
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredArrangements = arrangements?.filter((arr: any) =>
    arr.deceased_name?.toLowerCase().includes(search.toLowerCase()) ||
    arr.family_contact?.toLowerCase().includes(search.toLowerCase()) ||
    arr.case_number?.toLowerCase().includes(search.toLowerCase())
  );

  const handleArrangementPress = (id: string) => {
    navigation.navigate('ArrangementDetail' as never, { id } as never);
  };

  const getStatusStyle = (arrStatus: string) => {
    switch (arrStatus) {
      case 'pending':
        return { bg: '#FEF3C7', color: '#D97706' };
      case 'in-progress':
        return { bg: '#DBEAFE', color: '#2563EB' };
      case 'scheduled':
        return { bg: '#EDE9FE', color: '#7C3AED' };
      case 'completed':
        return { bg: '#D1FAE5', color: '#059669' };
      case 'cancelled':
        return { bg: '#FEE2E2', color: '#DC2626' };
      default:
        return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderArrangement = ({ item: arrangement }: { item: any }) => {
    const statusStyle = getStatusStyle(arrangement.status);

    return (
      <TouchableOpacity
        style={styles.arrangementCard}
        onPress={() => handleArrangementPress(arrangement.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={24} color="#475569" />
          </View>

          <View style={styles.mainInfo}>
            <View style={styles.headerRow}>
              <View style={styles.nameContainer}>
                <Text style={styles.deceasedName}>{arrangement.deceased_name}</Text>
                <Text style={styles.caseNumber}>Case #{arrangement.case_number}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                  {arrangement.status?.replace('-', ' ')}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              {arrangement.service_date && (
                <View style={styles.detailItem}>
                  <Ionicons name="calendar" size={14} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {formatDate(arrangement.service_date)}
                  </Text>
                </View>
              )}
              {arrangement.service_time && (
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={14} color="#6B7280" />
                  <Text style={styles.detailText}>{arrangement.service_time}</Text>
                </View>
              )}
              {arrangement.service_type && (
                <View style={styles.detailItem}>
                  <Ionicons name="document-text" size={14} color="#6B7280" />
                  <Text style={styles.detailText}>{arrangement.service_type}</Text>
                </View>
              )}
            </View>

            {arrangement.family_contact && (
              <View style={styles.contactRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="person" size={14} color="#6B7280" />
                  <Text style={styles.contactText}>{arrangement.family_contact}</Text>
                </View>
                {arrangement.family_phone && (
                  <View style={styles.detailItem}>
                    <Ionicons name="call" size={14} color="#6B7280" />
                    <Text style={styles.contactText}>{arrangement.family_phone}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Arrangements</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('NewArrangement' as never)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or case number..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <View style={styles.statusFilters}>
            {['all', 'pending', 'in-progress', 'scheduled', 'completed'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.filterChip, status === s && styles.activeFilterChip]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.filterText, status === s && styles.activeFilterText]}>
                  {s === 'all' ? 'All' : s.replace('-', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {filteredArrangements && filteredArrangements.length > 0 ? (
        <FlatList
          data={filteredArrangements}
          renderItem={renderArrangement}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No arrangements found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  activeFilterChip: {
    backgroundColor: '#475569',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  arrangementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
  },
  deceasedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  caseNumber: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 16,
  },
  contactText: {
    fontSize: 13,
    color: '#4B5563',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateArrangementListUpcoming(options: FuneralOptions = {}): string {
  const { componentName = 'ArrangementListUpcoming', endpoint = '/arrangements' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  days?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 5, days = 7 }) => {
  const navigation = useNavigation();

  const { data: arrangements, isLoading } = useQuery({
    queryKey: ['upcoming-arrangements', limit, days],
    queryFn: async () => {
      const response = await api.get<any>(
        \`${endpoint}/upcoming?limit=\${limit}&days=\${days}\`
      );
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleArrangementPress = (id: string) => {
    navigation.navigate('ArrangementDetail' as never, { id } as never);
  };

  const formatDateHeader = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Group arrangements by date
  const groupedData = React.useMemo(() => {
    if (!arrangements) return [];

    const groups: { [key: string]: any[] } = {};
    arrangements.forEach((arr: any) => {
      const dateKey = new Date(arr.service_date).toISOString().split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(arr);
    });

    return Object.entries(groups).map(([date, data]) => ({
      title: formatDateHeader(date),
      data,
    }));
  }, [arrangements]);

  const renderItem = ({ item: arrangement }: { item: any }) => (
    <TouchableOpacity
      style={styles.arrangementItem}
      onPress={() => handleArrangementPress(arrangement.id)}
      activeOpacity={0.7}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{arrangement.service_time}</Text>
        <Text style={styles.typeText}>{arrangement.service_type}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{arrangement.deceased_name}</Text>
        <View style={styles.metaRow}>
          {arrangement.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location" size={12} color="#6B7280" />
              <Text style={styles.metaText} numberOfLines={1}>
                {arrangement.location}
              </Text>
            </View>
          )}
          {arrangement.expected_attendees && (
            <View style={styles.metaItem}>
              <Ionicons name="people" size={12} color="#6B7280" />
              <Text style={styles.metaText}>~{arrangement.expected_attendees}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar" size={20} color="#475569" />
          <Text style={styles.title}>Upcoming Services</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Arrangements' as never, { status: 'scheduled' } as never)
          }
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {groupedData.length > 0 ? (
        <SectionList
          sections={groupedData}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            No upcoming services in the next {days} days
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  sectionHeader: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  arrangementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  timeContainer: {
    minWidth: 64,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  typeText: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}

export function generateObituaryListRecent(options: FuneralOptions = {}): string {
  const { componentName = 'ObituaryListRecent', endpoint = '/obituaries' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  showSearch?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 10, showSearch = true }) => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const { data: obituaries, isLoading } = useQuery({
    queryKey: ['recent-obituaries', limit],
    queryFn: async () => {
      const response = await api.get<any>(
        \`${endpoint}?limit=\${limit}&sort=created_at:desc\`
      );
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredObituaries = obituaries?.filter((obit: any) =>
    obit.name?.toLowerCase().includes(search.toLowerCase()) ||
    obit.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleObituaryPress = (id: string) => {
    navigation.navigate('ObituaryDetail' as never, { id } as never);
  };

  const handleShare = async (obituary: any) => {
    try {
      await Share.share({
        message: \`In loving memory of \${obituary.name}\\n\\n\${obituary.summary || ''}\`,
        title: obituary.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderObituary = ({ item: obituary }: { item: any }) => (
    <View style={styles.obituaryCard}>
      <View style={styles.cardContent}>
        {obituary.photo_url ? (
          <Image source={{ uri: obituary.photo_url }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="book" size={32} color="#94A3B8" />
          </View>
        )}

        <View style={styles.infoSection}>
          <TouchableOpacity onPress={() => handleObituaryPress(obituary.id)}>
            <Text style={styles.name}>{obituary.name}</Text>
          </TouchableOpacity>
          {(obituary.birth_date || obituary.death_date) && (
            <Text style={styles.dates}>
              {obituary.birth_date && formatDate(obituary.birth_date)}
              {obituary.birth_date && obituary.death_date && ' - '}
              {obituary.death_date && formatDate(obituary.death_date)}
            </Text>
          )}
          {obituary.location && (
            <Text style={styles.location}>{obituary.location}</Text>
          )}
          {obituary.summary && (
            <Text style={styles.summary} numberOfLines={2}>
              {obituary.summary}
            </Text>
          )}
          {obituary.service_info && (
            <View style={styles.serviceInfo}>
              <Ionicons name="calendar" size={14} color="#6B7280" />
              <Text style={styles.serviceText}>{obituary.service_info}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.statButtons}>
          <TouchableOpacity style={styles.statButton}>
            <Ionicons name="heart-outline" size={18} color="#6B7280" />
            <Text style={styles.statText}>{obituary.tribute_count || 0} Tributes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statButton}>
            <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
            <Text style={styles.statText}>{obituary.memory_count || 0} Memories</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statButton}>
            <Ionicons name="flower-outline" size={18} color="#6B7280" />
            <Text style={styles.statText}>{obituary.flower_count || 0} Flowers</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleShare(obituary)}
          >
            <Ionicons name="share-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => handleObituaryPress(obituary.id)}
          >
            <Text style={styles.readMoreText}>Read More</Text>
            <Ionicons name="chevron-forward" size={16} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search obituaries..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      )}

      {filteredObituaries && filteredObituaries.length > 0 ? (
        <FlatList
          data={filteredObituaries}
          renderItem={renderObituary}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No obituaries found</Text>
        </View>
      )}

      {obituaries && obituaries.length >= limit && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Obituaries' as never)}
        >
          <Text style={styles.viewAllText}>View All Obituaries</Text>
          <Ionicons name="chevron-forward" size={16} color="#475569" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 16,
  },
  obituaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  photo: {
    width: 72,
    height: 88,
    borderRadius: 8,
  },
  photoPlaceholder: {
    width: 72,
    height: 88,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dates: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  location: {
    fontSize: 13,
    color: '#6B7280',
  },
  summary: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  serviceText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 16,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#475569',
  },
});

export default ${componentName};
`;
}
