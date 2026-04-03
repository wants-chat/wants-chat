/**
 * Security Industry Component Generators (React Native)
 *
 * Generates React Native components for security companies, guard management, and incident tracking.
 */

export interface SecurityOptions {
  componentName?: string;
  title?: string;
  endpoint?: string;
}

/**
 * Generates GuardFilters component
 */
export function generateGuardFilters(options: SecurityOptions = {}): string {
  const { componentName = 'GuardFilters' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GuardFiltersState {
  search: string;
  status: string;
  site: string;
  shift: string;
  certification: string;
}

interface ${componentName}Props {
  onFilter?: (filters: GuardFiltersState) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilter }) => {
  const [filters, setFilters] = useState<GuardFiltersState>({
    search: '',
    status: 'all',
    site: 'all',
    shift: 'all',
    certification: 'all',
  });

  const statuses = ['all', 'on-duty', 'off-duty', 'on-break', 'unavailable'];
  const sites = ['all', 'corporate-hq', 'warehouse-a', 'retail-mall', 'residential'];
  const shifts = ['all', 'day', 'evening', 'night'];
  const certifications = ['all', 'armed', 'unarmed', 'supervisor', 'k9'];

  const handleChange = useCallback((key: keyof GuardFiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  }, [filters, onFilter]);

  const renderPillSelector = (
    options: string[],
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.pill, selected === option && styles.pillSelected]}
          onPress={() => onSelect(option)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, selected === option && styles.pillTextSelected]}>
            {option === 'all' ? 'All' : option.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search guards..."
          placeholderTextColor="#9CA3AF"
          value={filters.search}
          onChangeText={(text) => handleChange('search', text)}
        />
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Status</Text>
        {renderPillSelector(statuses, filters.status, (v) => handleChange('status', v))}
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Site</Text>
        {renderPillSelector(sites, filters.site, (v) => handleChange('site', v))}
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Shift</Text>
        {renderPillSelector(shifts, filters.shift, (v) => handleChange('shift', v))}
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Certification</Text>
        {renderPillSelector(certifications, filters.certification, (v) => handleChange('certification', v))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  pillSelected: {
    backgroundColor: '#3B82F6',
  },
  pillText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

/**
 * Generates GuardListActive component
 */
export function generateGuardListActive(options: SecurityOptions = {}): string {
  const { componentName = 'GuardListActive', endpoint = '/guards/active' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Guard {
  id: string;
  name: string;
  badge: string;
  site: string;
  position: string;
  shift: string;
  checkInTime: string;
  status: 'on-duty' | 'on-break' | 'patrolling' | 'responding';
  phone: string;
  lastCheckpoint?: string;
}

const ${componentName}: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const { data: guards, isLoading } = useQuery({
    queryKey: ['guards-active', filter],
    queryFn: async () => {
      const url = filter === 'all' ? '${endpoint}' : '${endpoint}?status=' + filter;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const statusColors: Record<string, { bg: string; text: string }> = {
    'on-duty': { bg: '#DCFCE7', text: '#166534' },
    'on-break': { bg: '#FEF9C3', text: '#854D0E' },
    'patrolling': { bg: '#DBEAFE', text: '#1E40AF' },
    'responding': { bg: '#FEE2E2', text: '#991B1B' },
  };

  const renderGuardItem = useCallback(({ item }: { item: Guard }) => {
    const statusStyle = statusColors[item.status] || statusColors['on-duty'];

    return (
      <View style={styles.guardCard}>
        <View style={styles.guardHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="shield" size={24} color="#3B82F6" />
          </View>
          <View style={styles.guardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.guardName}>{item.name}</Text>
              <Text style={styles.badgeText}>#{item.badge}</Text>
            </View>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="location" size={12} color="#6B7280" />
                <Text style={styles.detailText}>{item.site} - {item.position}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={12} color="#6B7280" />
                <Text style={styles.detailText}>Since {item.checkInTime}</Text>
              </View>
            </View>
            {item.lastCheckpoint && (
              <Text style={styles.checkpointText}>Last checkpoint: {item.lastCheckpoint}</Text>
            )}
          </View>
        </View>
        <View style={styles.guardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status.replace('-', ' ')}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Ionicons name="call-outline" size={18} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Ionicons name="radio-outline" size={18} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, []);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="shield-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No active guards found</Text>
    </View>
  ), []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="shield" size={24} color="#3B82F6" />
          <Text style={styles.title}>Active Guards</Text>
        </View>
        <TouchableOpacity style={styles.filterDropdown} activeOpacity={0.7}>
          <Text style={styles.filterDropdownText}>
            {filter === 'all' ? 'All Status' : filter.replace('-', ' ')}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={guards}
        renderItem={renderGuardItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
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
    marginVertical: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterDropdownText: {
    fontSize: 13,
    color: '#374151',
    textTransform: 'capitalize',
  },
  listContent: {
    paddingBottom: 16,
  },
  guardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  badgeText: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
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
  checkpointText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  guardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

/**
 * Generates GuardProfile component
 */
export function generateGuardProfile(options: SecurityOptions = {}): string {
  const { componentName = 'GuardProfile', endpoint = '/guards' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

type RouteParams = {
  GuardProfile: { guardId?: string };
};

const ${componentName}: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'GuardProfile'>>();
  const guardId = route.params?.guardId;

  const { data: guard, isLoading } = useQuery({
    queryKey: ['guard-profile', guardId],
    queryFn: async () => {
      if (guardId) {
        const response = await api.get<any>('${endpoint}/' + guardId);
        return response?.data || response;
      }
      return {
        id: '1',
        name: 'John Martinez',
        badge: 'G-001',
        email: 'j.martinez@security.com',
        phone: '555-0101',
        hireDate: '2022-03-15',
        status: 'active',
        certifications: ['Armed Guard License', 'First Aid/CPR', 'Fire Safety'],
        sites: ['Corporate HQ', 'Warehouse A'],
        currentAssignment: 'Corporate HQ - Main Entrance',
        shift: 'Day Shift (6AM - 2PM)',
        supervisor: 'Captain Robert Brown',
        hoursThisWeek: 32,
        incidentsReported: 3,
        commendations: 5,
      };
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="shield" size={48} color="#3B82F6" />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{guard?.name}</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>
            <Text style={styles.badgeNumber}>Badge #{guard?.badge}</Text>
            <View style={styles.contactRow}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{guard?.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{guard?.phone}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.contactText}>Since {guard?.hireDate}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
          <Text style={[styles.statValue, { color: '#1E40AF' }]}>{guard?.hoursThisWeek}h</Text>
          <Text style={styles.statLabel}>Hours This Week</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEF9C3' }]}>
          <Text style={[styles.statValue, { color: '#854D0E' }]}>{guard?.incidentsReported}</Text>
          <Text style={styles.statLabel}>Incidents</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
          <Text style={[styles.statValue, { color: '#166534' }]}>{guard?.commendations}</Text>
          <Text style={styles.statLabel}>Commendations</Text>
        </View>
      </View>

      {/* Current Assignment */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location" size={18} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Current Assignment</Text>
        </View>
        <Text style={styles.assignmentText}>{guard?.currentAssignment}</Text>
        <Text style={styles.shiftText}>{guard?.shift}</Text>
      </View>

      {/* Certifications */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon" size={18} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Certifications</Text>
        </View>
        <View style={styles.certContainer}>
          {guard?.certifications.map((cert: string, index: number) => (
            <View key={index} style={styles.certBadge}>
              <Text style={styles.certText}>{cert}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Assigned Sites */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="business" size={18} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Assigned Sites</Text>
        </View>
        {guard?.sites.map((site: string, index: number) => (
          <View key={index} style={styles.siteItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.siteText}>{site}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '500',
  },
  badgeNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  assignmentText: {
    fontSize: 15,
    color: '#374151',
  },
  shiftText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  certContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  certBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  certText: {
    fontSize: 13,
    color: '#374151',
  },
  siteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  siteText: {
    fontSize: 14,
    color: '#374151',
  },
});

export default ${componentName};
`;
}

/**
 * Generates GuardSchedule component
 */
export function generateGuardSchedule(options: SecurityOptions = {}): string {
  const { componentName = 'GuardSchedule' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ScheduleEntry {
  id: string;
  date: string;
  shift: 'day' | 'evening' | 'night';
  site: string;
  position: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed';
}

const ${componentName}: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const schedule: ScheduleEntry[] = [
    { id: '1', date: '2024-01-22', shift: 'day', site: 'Corporate HQ', position: 'Main Entrance', startTime: '06:00', endTime: '14:00', status: 'completed' },
    { id: '2', date: '2024-01-23', shift: 'day', site: 'Corporate HQ', position: 'Main Entrance', startTime: '06:00', endTime: '14:00', status: 'confirmed' },
    { id: '3', date: '2024-01-24', shift: 'evening', site: 'Warehouse A', position: 'Perimeter Patrol', startTime: '14:00', endTime: '22:00', status: 'scheduled' },
    { id: '4', date: '2024-01-25', shift: 'day', site: 'Corporate HQ', position: 'Main Entrance', startTime: '06:00', endTime: '14:00', status: 'scheduled' },
  ];

  const shiftColors: Record<string, { bg: string; border: string }> = {
    day: { bg: '#FEF9C3', border: '#EAB308' },
    evening: { bg: '#FFEDD5', border: '#F97316' },
    night: { bg: '#E0E7FF', border: '#6366F1' },
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    scheduled: { bg: '#F3F4F6', text: '#4B5563' },
    confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
    completed: { bg: '#DCFCE7', text: '#166534' },
  };

  const navigateWeek = useCallback((direction: number) => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + direction * 7);
      return newDate;
    });
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderScheduleItem = useCallback(({ item }: { item: ScheduleEntry }) => {
    const shiftStyle = shiftColors[item.shift];
    const statusStyle = statusColors[item.status];

    return (
      <View style={[styles.scheduleCard, { borderLeftColor: shiftStyle.border, backgroundColor: shiftStyle.bg }]}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.scheduleDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{item.startTime} - {item.endTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{item.site}</Text>
          </View>
        </View>
        <Text style={styles.positionText}>Position: {item.position}</Text>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar" size={24} color="#3B82F6" />
          <Text style={styles.title}>Weekly Schedule</Text>
        </View>
        <View style={styles.navigationRow}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateWeek(-1)} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.todayButton}
            onPress={() => setCurrentWeek(new Date())}
            activeOpacity={0.7}
          >
            <Text style={styles.todayButtonText}>This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateWeek(1)} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={schedule}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No shifts scheduled this week</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginVertical: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 16,
  },
  scheduleCard: {
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  scheduleDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  positionText: {
    fontSize: 13,
    color: '#374151',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generates IncidentFilters component
 */
export function generateIncidentFilters(options: SecurityOptions = {}): string {
  const { componentName = 'IncidentFilters' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IncidentFiltersState {
  search: string;
  type: string;
  severity: string;
  site: string;
  status: string;
}

interface ${componentName}Props {
  onFilter?: (filters: IncidentFiltersState) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilter }) => {
  const [filters, setFilters] = useState<IncidentFiltersState>({
    search: '',
    type: 'all',
    severity: 'all',
    site: 'all',
    status: 'all',
  });

  const types = ['all', 'theft', 'trespass', 'vandalism', 'assault', 'fire', 'medical', 'other'];
  const severities = ['all', 'low', 'medium', 'high', 'critical'];
  const sites = ['all', 'corporate-hq', 'warehouse-a', 'retail-mall'];
  const statuses = ['all', 'open', 'investigating', 'resolved', 'closed'];

  const handleChange = useCallback((key: keyof IncidentFiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  }, [filters, onFilter]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search incidents..."
          placeholderTextColor="#9CA3AF"
          value={filters.search}
          onChangeText={(text) => handleChange('search', text)}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {types.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.pill, filters.type === type && styles.pillSelected]}
                onPress={() => handleChange('type', type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, filters.type === type && styles.pillTextSelected]}>
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Severity</Text>
        <View style={styles.severityRow}>
          {severities.map((sev) => (
            <TouchableOpacity
              key={sev}
              style={[styles.severityPill, filters.severity === sev && styles.severityPillSelected]}
              onPress={() => handleChange('severity', sev)}
              activeOpacity={0.7}
            >
              <Text style={[styles.severityText, filters.severity === sev && styles.severityTextSelected]}>
                {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  filtersRow: {
    paddingBottom: 12,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  pillSelected: {
    backgroundColor: '#F97316',
  },
  pillText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  severityPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  severityPillSelected: {
    backgroundColor: '#3B82F6',
  },
  severityText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  severityTextSelected: {
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

/**
 * Generates IncidentListRecent component
 */
export function generateIncidentListRecent(options: SecurityOptions = {}): string {
  const { componentName = 'IncidentListRecent', endpoint = '/incidents/recent' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Incident {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  site: string;
  location: string;
  reportedBy: string;
  reportedAt: string;
  status: 'open' | 'investigating' | 'resolved';
  description: string;
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents-recent'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const severityColors: Record<string, { bg: string; icon: string }> = {
    low: { bg: '#DCFCE7', icon: '#22C55E' },
    medium: { bg: '#FEF9C3', icon: '#EAB308' },
    high: { bg: '#FFEDD5', icon: '#F97316' },
    critical: { bg: '#FEE2E2', icon: '#EF4444' },
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    open: { bg: '#FEE2E2', text: '#991B1B' },
    investigating: { bg: '#FEF9C3', text: '#854D0E' },
    resolved: { bg: '#DCFCE7', text: '#166534' },
  };

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }, []);

  const renderIncidentItem = useCallback(({ item }: { item: Incident }) => {
    const sevStyle = severityColors[item.severity] || severityColors.medium;
    const statStyle = statusColors[item.status] || statusColors.open;

    return (
      <TouchableOpacity
        style={styles.incidentCard}
        onPress={() => navigation.navigate('IncidentDetail' as never, { incidentId: item.id } as never)}
        activeOpacity={0.7}
      >
        <View style={styles.incidentHeader}>
          <View style={[styles.severityIcon, { backgroundColor: sevStyle.bg }]}>
            <Ionicons name="warning" size={20} color={sevStyle.icon} />
          </View>
          <View style={styles.incidentInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.incidentTitle} numberOfLines={1}>{item.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statStyle.bg }]}>
                <Text style={[styles.statusText, { color: statStyle.text }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                <Text style={styles.metaText}>{item.site} - {item.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                <Text style={styles.metaText}>{formatTime(item.reportedAt)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={12} color="#9CA3AF" />
                <Text style={styles.metaText}>{item.reportedBy}</Text>
              </View>
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  }, [navigation, formatTime]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="warning" size={24} color="#F97316" />
          <Text style={styles.title}>Recent Incidents</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={incidents}
        renderItem={renderIncidentItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
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
    marginVertical: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
  incidentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  severityIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incidentInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  incidentTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 18,
  },
});

export default ${componentName};
`;
}

/**
 * Generates ScheduleCalendarSecurity component
 */
export function generateScheduleCalendarSecurity(options: SecurityOptions = {}): string {
  const { componentName = 'ScheduleCalendarSecurity' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Shift {
  id: string;
  guardName: string;
  site: string;
  position: string;
  startTime: string;
  endTime: string;
  type: 'day' | 'evening' | 'night';
}

const ${componentName}: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const shiftColors = {
    day: '#FEF9C3',
    evening: '#FFEDD5',
    night: '#E0E7FF',
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const shifts: Shift[] = [
    { id: '1', guardName: 'John M.', site: 'HQ', position: 'Main Gate', startTime: '06:00', endTime: '14:00', type: 'day' },
    { id: '2', guardName: 'Sarah J.', site: 'HQ', position: 'Patrol', startTime: '14:00', endTime: '22:00', type: 'evening' },
    { id: '3', guardName: 'Mike C.', site: 'Warehouse', position: 'Loading', startTime: '22:00', endTime: '06:00', type: 'night' },
  ];

  const navigateMonth = useCallback((direction: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  }, []);

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar" size={24} color="#3B82F6" />
          <Text style={styles.title}>Security Schedule</Text>
        </View>
        <View style={styles.navigationRow}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth(-1)} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth(1)} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Day Headers */}
        <View style={styles.dayHeaderRow}>
          {dayNames.map(day => (
            <View key={day} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.daysGrid}>
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <View key={\`empty-\${i}\`} style={styles.dayCell} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isToday(day) && styles.dayCellToday,
                  isSelected(day) && styles.dayCellSelected,
                ]}
                onPress={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayNumber,
                  isToday(day) && styles.dayNumberToday,
                  isSelected(day) && styles.dayNumberSelected,
                ]}>
                  {day}
                </Text>
                {day % 3 === 0 && (
                  <View style={styles.shiftIndicators}>
                    <View style={[styles.shiftDot, { backgroundColor: shiftColors.day }]} />
                    <View style={[styles.shiftDot, { backgroundColor: shiftColors.evening }]} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Day Details */}
      {selectedDate && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>
            Shifts for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          {shifts.map(shift => (
            <View key={shift.id} style={styles.shiftItem}>
              <View style={[styles.shiftColorBar, { backgroundColor: shiftColors[shift.type] }]} />
              <Text style={styles.shiftGuard}>{shift.guardName}</Text>
              <Text style={styles.shiftTime}>{shift.startTime} - {shift.endTime}</Text>
              <Text style={styles.shiftLocation}>{shift.site} - {shift.position}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    minWidth: 160,
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellToday: {
    backgroundColor: '#DBEAFE',
  },
  dayCellSelected: {
    backgroundColor: '#3B82F6',
  },
  dayNumber: {
    fontSize: 14,
    color: '#374151',
  },
  dayNumberToday: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shiftIndicators: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  shiftDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  detailsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  shiftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  shiftColorBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  shiftGuard: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  shiftTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  shiftLocation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}
