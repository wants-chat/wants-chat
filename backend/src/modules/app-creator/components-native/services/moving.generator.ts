/**
 * Moving Service Component Generators (React Native)
 *
 * Generates components for moving service management:
 * - MovingStats: Dashboard statistics
 * - MoveCalendar: Calendar view of scheduled moves
 * - UpcomingMoves: List of upcoming moves
 * - CustomerProfileMoving: Customer profile with move history
 */

export interface MovingStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMovingStats(options: MovingStatsOptions = {}): string {
  const { componentName = 'MovingStats', endpoint = '/moving/stats' } = options;

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

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['moving-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
  });

  const statCards = [
    { key: 'todayMoves', label: "Today's Moves", icon: 'car', color: '#3B82F6' },
    { key: 'scheduledThisWeek', label: 'Scheduled This Week', icon: 'calendar', color: '#8B5CF6' },
    { key: 'completedToday', label: 'Completed Today', icon: 'checkmark-circle', color: '#10B981' },
    { key: 'pendingQuotes', label: 'Pending Quotes', icon: 'warning', color: '#F59E0B' },
    { key: 'activeCrews', label: 'Active Crews', icon: 'people', color: '#6366F1' },
    { key: 'trucksInUse', label: 'Trucks In Use', icon: 'car', color: '#F97316' },
    { key: 'revenueToday', label: "Today's Revenue", icon: 'cash', color: '#10B981', type: 'currency' },
    { key: 'avgMoveTime', label: 'Avg Move Time', icon: 'time', color: '#EF4444', suffix: ' hrs' },
  ];

  const formatValue = (value: any, type?: string, suffix?: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    return Number(value).toLocaleString() + (suffix || '');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statCards.map((stat) => (
          <View key={stat.key} style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.value}>
              {formatValue(stats?.[stat.key], stat.type, stat.suffix)}
            </Text>
            <Text style={styles.label}>{stat.label}</Text>
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
    padding: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    width: '50%',
    padding: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface MoveCalendarOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMoveCalendar(options: MoveCalendarOptions = {}): string {
  const { componentName = 'MoveCalendar', endpoint = '/moving/jobs' } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ${componentName}: React.FC<${componentName}Props> = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMove, setSelectedMove] = useState<any | null>(null);

  const { data: moves, isLoading } = useQuery({
    queryKey: ['moving-jobs', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
      const response = await api.get<any>(\`${endpoint}?start=\${startDate}&end=\${endDate}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  const getMovesForDate = (date: Date) => {
    return (moves || []).filter((move: any) => {
      const moveDate = new Date(move.move_date || move.scheduled_date);
      return (
        moveDate.getFullYear() === date.getFullYear() &&
        moveDate.getMonth() === date.getMonth() &&
        moveDate.getDate() === date.getDate()
      );
    });
  };

  const getMoveTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'local':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'long_distance':
        return { bg: '#E9D5FF', text: '#7C3AED' };
      case 'commercial':
        return { bg: '#FFEDD5', text: '#C2410C' };
      case 'packing_only':
        return { bg: '#D1FAE5', text: '#065F46' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.monthNav}>
          <Text style={styles.monthTitle}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <View style={styles.navButtons}>
            <TouchableOpacity
              onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              style={styles.navButton}
            >
              <Ionicons name="chevron-back" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentDate(new Date())}
              style={styles.todayButton}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              style={styles.navButton}
            >
              <Ionicons name="chevron-forward" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('NewMove' as never)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Schedule Move</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Local</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>Long Distance</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
          <Text style={styles.legendText}>Commercial</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Packing Only</Text>
        </View>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map(day => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarScroll}>
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, idx) => {
            const dayMoves = getMovesForDate(day.date);
            return (
              <View
                key={idx}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.otherMonthCell,
                ]}
              >
                <View style={[
                  styles.dateNumber,
                  isToday(day.date) && styles.todayDate,
                ]}>
                  <Text style={[
                    styles.dateText,
                    isToday(day.date) && styles.todayDateText,
                    !day.isCurrentMonth && styles.otherMonthText,
                  ]}>
                    {day.date.getDate()}
                  </Text>
                </View>
                <View style={styles.movesContainer}>
                  {dayMoves.slice(0, 2).map((move: any) => {
                    const typeColor = getMoveTypeColor(move.move_type || move.type);
                    return (
                      <TouchableOpacity
                        key={move.id}
                        onPress={() => setSelectedMove(move)}
                        style={[styles.moveItem, { backgroundColor: typeColor.bg }]}
                      >
                        <Text style={[styles.moveText, { color: typeColor.text }]} numberOfLines={1}>
                          {move.customer_name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {dayMoves.length > 2 && (
                    <Text style={styles.moreText}>+{dayMoves.length - 2} more</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Move Detail Modal */}
      <Modal
        visible={selectedMove !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMove(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedMove(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Move Details</Text>
              <TouchableOpacity onPress={() => setSelectedMove(null)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedMove && (
              <View style={styles.modalBody}>
                <View style={styles.modalRow}>
                  <Ionicons name="person" size={20} color="#6B7280" />
                  <View style={styles.modalRowContent}>
                    <Text style={styles.modalLabel}>Customer</Text>
                    <Text style={styles.modalValue}>{selectedMove.customer_name}</Text>
                    {selectedMove.customer_phone && (
                      <Text style={styles.modalSubValue}>{selectedMove.customer_phone}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.modalRow}>
                  <Ionicons name="location" size={20} color="#EF4444" />
                  <View style={styles.modalRowContent}>
                    <Text style={styles.modalLabel}>From</Text>
                    <Text style={styles.modalValue}>{selectedMove.origin_address}</Text>
                  </View>
                </View>

                <View style={styles.modalRow}>
                  <Ionicons name="location" size={20} color="#10B981" />
                  <View style={styles.modalRowContent}>
                    <Text style={styles.modalLabel}>To</Text>
                    <Text style={styles.modalValue}>{selectedMove.destination_address}</Text>
                  </View>
                </View>

                <View style={styles.modalInfoGrid}>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalLabel}>Date</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedMove.move_date || selectedMove.scheduled_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalLabel}>Time</Text>
                    <Text style={styles.modalValue}>{selectedMove.start_time || '8:00 AM'}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalLabel}>Crew Size</Text>
                    <Text style={styles.modalValue}>{selectedMove.crew_size || 2} movers</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalLabel}>Truck</Text>
                    <Text style={styles.modalValue}>{selectedMove.truck_size || '26ft'}</Text>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('MoveDetail' as never, { id: selectedMove.id } as never);
                      setSelectedMove(null);
                    }}
                    style={styles.viewDetailsButton}
                  >
                    <Text style={styles.viewDetailsButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedMove(null)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
    padding: 16,
    gap: 12,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButton: {
    padding: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  todayButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  weekdaysRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  weekdayCell: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  calendarScroll: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
  },
  dayCell: {
    width: '14.28%',
    minHeight: 90,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  otherMonthCell: {
    backgroundColor: '#F9FAFB',
  },
  dateNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  todayDate: {
    backgroundColor: '#3B82F6',
  },
  dateText: {
    fontSize: 13,
    color: '#111827',
  },
  todayDateText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  otherMonthText: {
    color: '#9CA3AF',
  },
  movesContainer: {
    gap: 2,
  },
  moveItem: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moveText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalBody: {
    padding: 16,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalRowContent: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  modalValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  modalSubValue: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  modalInfoItem: {
    width: '50%',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  closeButtonText: {
    color: '#374151',
  },
});

export default ${componentName};
`;
}

export interface UpcomingMovesOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateUpcomingMoves(options: UpcomingMovesOptions = {}): string {
  const { componentName = 'UpcomingMoves', endpoint = '/moving/jobs/upcoming' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 10 }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: moves, isLoading, refetch } = useQuery({
    queryKey: ['upcoming-moves', limit],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?limit=\${limit}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'in_progress':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const getMoveTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'local':
        return '#3B82F6';
      case 'long_distance':
        return '#8B5CF6';
      case 'commercial':
        return '#F97316';
      default:
        return '#6B7280';
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.moveItem}
        onPress={() => navigation.navigate('MoveDetail' as never, { id: item.id } as never)}
        activeOpacity={0.7}
      >
        <View style={styles.moveIconContainer}>
          <View style={styles.moveIcon}>
            <Ionicons name="car" size={24} color="#3B82F6" />
          </View>
          <View style={[styles.typeDot, { backgroundColor: getMoveTypeColor(item.move_type || item.type) }]} />
        </View>

        <View style={styles.moveContent}>
          <View style={styles.moveHeader}>
            <Text style={styles.customerName}>{item.customer_name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item.status}
              </Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location" size={14} color="#EF4444" />
            <Text style={styles.addressText} numberOfLines={1}>{item.origin_address}</Text>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={14} color="#10B981" />
            <Text style={styles.addressText} numberOfLines={1}>{item.destination_address}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                {new Date(item.move_date || item.scheduled_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.start_time || '8:00 AM'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.crew_size || 2} movers</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash" size={14} color="#10B981" />
              <Text style={[styles.metaText, { color: '#10B981', fontWeight: '600' }]}>
                \${(item.estimated_cost || item.price || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  }, [navigation]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Moves</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllMoves' as never)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {moves && moves.length > 0 ? (
        <FlatList
          data={moves}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="car" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No upcoming moves scheduled</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  moveItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  moveIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  moveIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moveContent: {
    flex: 1,
  },
  moveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export interface CustomerProfileMovingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileMoving(options: CustomerProfileMovingOptions = {}): string {
  const { componentName = 'CustomerProfileMoving', endpoint = '/moving/customers' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const customerId = propId || (route.params as any)?.id;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['moving-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: moveHistory } = useQuery({
    queryKey: ['customer-moves', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/moves\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const getMoveStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'in_progress':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'scheduled':
        return { bg: '#E9D5FF', text: '#7C3AED' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Customer not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewQuote' as never, { customerId } as never)}
            style={styles.quoteButton}
          >
            <Ionicons name="car" size={18} color="#3B82F6" />
            <Text style={styles.quoteButtonText}>New Quote</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditCustomer' as never, { id: customerId } as never)}
            style={styles.editButton}
          >
            <Ionicons name="create" size={18} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer Info Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#3B82F6" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{customer.name}</Text>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{customer.phone || 'No phone'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{customer.email || 'No email'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{customer.current_address || customer.address || 'No address'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="calendar" size={16} color="#6B7280" />
              <Text style={styles.contactText}>
                Customer since {new Date(customer.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.total_moves || 0}</Text>
            <Text style={styles.statLabel}>Total Moves</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              \${(customer.total_spent || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.referrals || 0}</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {customer.last_move ? new Date(customer.last_move).toLocaleDateString() : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Last Move</Text>
          </View>
        </View>
      </View>

      {/* Move History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Move History</Text>
        </View>
        {moveHistory && moveHistory.length > 0 ? (
          moveHistory.map((move: any) => {
            const statusStyle = getMoveStatusStyle(move.status);
            return (
              <TouchableOpacity
                key={move.id}
                style={styles.moveItem}
                onPress={() => navigation.navigate('MoveDetail' as never, { id: move.id } as never)}
              >
                <View style={[
                  styles.moveIcon,
                  { backgroundColor: move.status === 'completed' ? '#D1FAE5' : '#DBEAFE' }
                ]}>
                  {move.status === 'completed' ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  ) : (
                    <Ionicons name="car" size={24} color="#3B82F6" />
                  )}
                </View>
                <View style={styles.moveInfo}>
                  <Text style={styles.moveType}>
                    {move.move_type || 'Local'} Move
                  </Text>
                  <View style={styles.addressRow}>
                    <Ionicons name="location" size={12} color="#EF4444" />
                    <Text style={styles.addressText} numberOfLines={1}>{move.origin_address}</Text>
                  </View>
                  <View style={styles.addressRow}>
                    <Ionicons name="location" size={12} color="#10B981" />
                    <Text style={styles.addressText} numberOfLines={1}>{move.destination_address}</Text>
                  </View>
                  <View style={styles.moveMeta}>
                    <Text style={styles.moveMetaText}>
                      {new Date(move.move_date).toLocaleDateString()}
                    </Text>
                    {move.crew_size && (
                      <Text style={styles.moveMetaText}>{move.crew_size} movers</Text>
                    )}
                  </View>
                </View>
                <View style={styles.moveRight}>
                  <Text style={styles.moveCost}>
                    \${(move.total_cost || move.price || 0).toLocaleString()}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {move.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="car" size={48} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No move history</Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {customer.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{customer.notes}</Text>
        </View>
      )}
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 6,
  },
  quoteButtonText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  moveItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  moveIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moveInfo: {
    flex: 1,
  },
  moveType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  moveMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  moveMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  moveRight: {
    alignItems: 'flex-end',
  },
  moveCost: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySectionText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default ${componentName};
`;
}
