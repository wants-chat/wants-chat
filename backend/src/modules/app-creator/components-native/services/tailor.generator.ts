/**
 * Tailor Service Component Generators (React Native)
 *
 * Generates components for tailor/alteration service management:
 * - TailorStats: Dashboard statistics
 * - FittingCalendar: Calendar view of fitting appointments
 * - FittingListToday: Today's fitting appointments
 * - CustomerProfileTailor: Customer profile with measurements
 */

export interface TailorStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTailorStats(options: TailorStatsOptions = {}): string {
  const { componentName = 'TailorStats', endpoint = '/tailor/stats' } = options;

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
    queryKey: ['tailor-stats'],
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
    { key: 'fittingsToday', label: "Today's Fittings", icon: 'calendar', color: '#3B82F6' },
    { key: 'ordersInProgress', label: 'Orders In Progress', icon: 'cut', color: '#F59E0B' },
    { key: 'readyForPickup', label: 'Ready for Pickup', icon: 'checkmark-circle', color: '#10B981' },
    { key: 'rushOrders', label: 'Rush Orders', icon: 'warning', color: '#EF4444' },
    { key: 'customOrders', label: 'Custom Orders', icon: 'shirt', color: '#8B5CF6' },
    { key: 'activeCustomers', label: 'Active Customers', icon: 'people', color: '#6366F1' },
    { key: 'revenueToday', label: "Today's Revenue", icon: 'cash', color: '#10B981', type: 'currency' },
    { key: 'avgCompletionTime', label: 'Avg Completion', icon: 'time', color: '#F97316', suffix: ' days' },
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

export interface FittingCalendarOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFittingCalendar(options: FittingCalendarOptions = {}): string {
  const { componentName = 'FittingCalendar', endpoint = '/tailor/fittings' } = options;

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
  const [selectedFitting, setSelectedFitting] = useState<any | null>(null);

  const { data: fittings, isLoading } = useQuery({
    queryKey: ['fittings', currentDate.getMonth(), currentDate.getFullYear()],
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

  const getFittingsForDate = (date: Date) => {
    return (fittings || []).filter((fitting: any) => {
      const fittingDate = new Date(fitting.appointment_date || fitting.date);
      return (
        fittingDate.getFullYear() === date.getFullYear() &&
        fittingDate.getMonth() === date.getMonth() &&
        fittingDate.getDate() === date.getDate()
      );
    });
  };

  const getFittingTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'initial':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'follow_up':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'final':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'pickup':
        return { bg: '#E9D5FF', text: '#7C3AED' };
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
          onPress={() => navigation.navigate('NewFitting' as never)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Schedule Fitting</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Initial</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Follow-up</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Final</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>Pickup</Text>
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
            const dayFittings = getFittingsForDate(day.date);
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
                <View style={styles.fittingsContainer}>
                  {dayFittings.slice(0, 3).map((fitting: any) => {
                    const typeColor = getFittingTypeColor(fitting.fitting_type || fitting.type);
                    return (
                      <TouchableOpacity
                        key={fitting.id}
                        onPress={() => setSelectedFitting(fitting)}
                        style={[styles.fittingItem, { backgroundColor: typeColor.bg }]}
                      >
                        <Text style={[styles.fittingText, { color: typeColor.text }]} numberOfLines={1}>
                          {fitting.time} - {fitting.customer_name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {dayFittings.length > 3 && (
                    <Text style={styles.moreText}>+{dayFittings.length - 3} more</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Fitting Detail Modal */}
      <Modal
        visible={selectedFitting !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedFitting(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedFitting(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fitting Details</Text>
              <TouchableOpacity onPress={() => setSelectedFitting(null)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedFitting && (
              <View style={styles.modalBody}>
                <View style={styles.modalRow}>
                  <Ionicons name="person" size={20} color="#6B7280" />
                  <View style={styles.modalRowContent}>
                    <Text style={styles.modalValue}>{selectedFitting.customer_name}</Text>
                    {selectedFitting.customer_phone && (
                      <Text style={styles.modalSubValue}>{selectedFitting.customer_phone}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.modalRow}>
                  <Ionicons name="time" size={20} color="#6B7280" />
                  <View style={styles.modalRowContent}>
                    <Text style={styles.modalValue}>
                      {new Date(selectedFitting.appointment_date || selectedFitting.date).toLocaleDateString()} at {selectedFitting.time}
                    </Text>
                    <Text style={styles.modalSubValue}>{selectedFitting.duration || 30} minutes</Text>
                  </View>
                </View>

                <View style={styles.modalRow}>
                  <Ionicons name="resize" size={20} color="#6B7280" />
                  <View style={styles.modalRowContent}>
                    <Text style={styles.modalValue}>
                      {selectedFitting.fitting_type || selectedFitting.type} Fitting
                    </Text>
                  </View>
                </View>

                {selectedFitting.garment_type && (
                  <View style={styles.modalRow}>
                    <Ionicons name="cut" size={20} color="#6B7280" />
                    <View style={styles.modalRowContent}>
                      <Text style={styles.modalValue}>{selectedFitting.garment_type}</Text>
                    </View>
                  </View>
                )}

                {selectedFitting.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Notes</Text>
                    <Text style={styles.notesText}>{selectedFitting.notes}</Text>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('FittingDetail' as never, { id: selectedFitting.id } as never);
                      setSelectedFitting(null);
                    }}
                    style={styles.viewDetailsButton}
                  >
                    <Text style={styles.viewDetailsButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedFitting(null)}
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
    minHeight: 80,
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
  fittingsContainer: {
    gap: 2,
  },
  fittingItem: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fittingText: {
    fontSize: 9,
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
  modalValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  modalSubValue: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  notesSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#111827',
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

export interface FittingListTodayOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFittingListToday(options: FittingListTodayOptions = {}): string {
  const { componentName = 'FittingListToday', endpoint = '/tailor/fittings/today' } = options;

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
  onItemClick?: (item: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onItemClick }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: fittings, isLoading, refetch } = useQuery({
    queryKey: ['today-fittings'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
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
      case 'completed':
        return { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle' };
      case 'in_progress':
        return { bg: '#FEF3C7', text: '#92400E', icon: 'resize' };
      case 'scheduled':
        return { bg: '#DBEAFE', text: '#1E40AF', icon: 'time' };
      case 'no_show':
        return { bg: '#FEE2E2', text: '#991B1B', icon: 'alert-circle' };
      default:
        return { bg: '#F3F4F6', text: '#374151', icon: 'time' };
    }
  };

  const getFittingTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'initial':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'follow_up':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'final':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'pickup':
        return { bg: '#E9D5FF', text: '#7C3AED' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const handleClick = (fitting: any) => {
    if (onItemClick) {
      onItemClick(fitting);
    } else {
      navigation.navigate('FittingDetail' as never, { id: fitting.id } as never);
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    const typeBadge = getFittingTypeBadge(item.fitting_type || item.type);

    return (
      <TouchableOpacity
        style={styles.fittingItem}
        onPress={() => handleClick(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.statusIcon, { backgroundColor: statusStyle.bg }]}>
          <Ionicons name={statusStyle.icon as any} size={20} color={statusStyle.text} />
        </View>

        <View style={styles.fittingContent}>
          <View style={styles.fittingHeader}>
            <Text style={styles.customerName}>{item.customer_name}</Text>
            <View style={[styles.typeBadge, { backgroundColor: typeBadge.bg }]}>
              <Text style={[styles.typeText, { color: typeBadge.text }]}>
                {item.fitting_type || item.type}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.time}</Text>
            </View>
            {item.garment_type && (
              <View style={styles.metaItem}>
                <Ionicons name="cut" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{item.garment_type}</Text>
              </View>
            )}
            {item.order_number && (
              <Text style={styles.orderNumber}>Order #{item.order_number}</Text>
            )}
          </View>

          {item.notes && (
            <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text>
          )}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, onItemClick]);

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
        <Text style={styles.title}>Today's Fittings</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{fittings?.length || 0} appointments</Text>
        </View>
      </View>

      {fittings && fittings.length > 0 ? (
        <FlatList
          data={fittings}
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
          <Ionicons name="resize" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No fittings scheduled for today</Text>
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
  countBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E40AF',
  },
  fittingItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fittingContent: {
    flex: 1,
  },
  fittingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
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
    fontSize: 13,
    color: '#6B7280',
  },
  orderNumber: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  notes: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
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

export interface CustomerProfileTailorOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileTailor(options: CustomerProfileTailorOptions = {}): string {
  const { componentName = 'CustomerProfileTailor', endpoint = '/tailor/customers' } = options;

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
    queryKey: ['tailor-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: orderHistory } = useQuery({
    queryKey: ['tailor-customer-orders', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/orders\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const getOrderStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'in_progress':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'ready':
        return { bg: '#DBEAFE', text: '#1E40AF' };
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
            onPress={() => navigation.navigate('NewOrder' as never, { customerId } as never)}
            style={styles.orderButton}
          >
            <Ionicons name="cut" size={18} color="#8B5CF6" />
            <Text style={styles.orderButtonText}>New Order</Text>
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
            <Ionicons name="person" size={40} color="#8B5CF6" />
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
            <Text style={styles.statValue}>{customer.total_orders || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              \${(customer.total_spent || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.garments_made || 0}</Text>
            <Text style={styles.statLabel}>Garments Made</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Last Visit</Text>
          </View>
        </View>
      </View>

      {/* Measurements */}
      {customer.measurements && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Measurements</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('UpdateMeasurements' as never, { customerId } as never)}
            >
              <Text style={styles.updateText}>Update</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.measurementsGrid}>
            {Object.entries(customer.measurements).map(([key, value]) => (
              <View key={key} style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>{key.replace(/_/g, ' ')}</Text>
                <Text style={styles.measurementValue}>{value as string}"</Text>
              </View>
            ))}
          </View>
          {customer.measurements_updated_at && (
            <Text style={styles.measurementsDate}>
              Last updated: {new Date(customer.measurements_updated_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Style Preferences */}
      {customer.preferences && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Preferences</Text>
          <View style={styles.preferencesGrid}>
            {customer.preferences.preferred_fabrics && (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Preferred Fabrics</Text>
                <View style={styles.tagsRow}>
                  {customer.preferences.preferred_fabrics.map((fabric: string, i: number) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>{fabric}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {customer.preferences.fit_preference && (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Fit Preference</Text>
                <Text style={styles.preferenceValue}>{customer.preferences.fit_preference}</Text>
              </View>
            )}
            {customer.preferences.collar_style && (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Collar Style</Text>
                <Text style={styles.preferenceValue}>{customer.preferences.collar_style}</Text>
              </View>
            )}
          </View>
          {customer.preferences.notes && (
            <View style={styles.preferencesNotes}>
              <Text style={styles.preferencesNotesLabel}>Special Notes</Text>
              <Text style={styles.preferencesNotesText}>{customer.preferences.notes}</Text>
            </View>
          )}
        </View>
      )}

      {/* Order History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Order History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {orderHistory && orderHistory.length > 0 ? (
          orderHistory.slice(0, 5).map((order: any) => {
            const statusStyle = getOrderStatusStyle(order.status);
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderItem}
                onPress={() => navigation.navigate('OrderDetail' as never, { id: order.id } as never)}
              >
                <View style={[
                  styles.orderIcon,
                  { backgroundColor: order.status === 'completed' ? '#D1FAE5' : '#E9D5FF' }
                ]}>
                  {order.status === 'completed' ? (
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  ) : (
                    <Ionicons name="cut" size={20} color="#8B5CF6" />
                  )}
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderType}>
                    {order.garment_type} - {order.service_type || 'Custom'}
                  </Text>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderMetaText}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                    {order.fabric && (
                      <Text style={styles.orderMetaText}>{order.fabric}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderPrice}>\${(order.price || 0).toLocaleString()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="cube" size={48} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No order history</Text>
          </View>
        )}
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
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 6,
  },
  orderButtonText: {
    color: '#8B5CF6',
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
    backgroundColor: '#E9D5FF',
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
  updateText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  measurementItem: {
    width: '33.33%',
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    marginRight: '0.5%',
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  measurementsDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 12,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  preferenceItem: {
    width: '45%',
  },
  preferenceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
  },
  preferencesNotes: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  preferencesNotesLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  preferencesNotesText: {
    fontSize: 14,
    color: '#111827',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  orderMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  orderMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderPrice: {
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
});

export default ${componentName};
`;
}
