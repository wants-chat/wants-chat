/**
 * Marina Management Component Generators (React Native)
 *
 * Generates components for marina/boat slip management including:
 * - MarinaStats, ReservationCalendarMarina, ReservationListTodayMarina
 * - SlipAvailability, CustomerProfileMarina
 */

export interface MarinaOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMarinaStats(options: MarinaOptions = {}): string {
  const { componentName = 'MarinaStats', endpoint = '/marina/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['marina-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch marina stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  const statItems = [
    { key: 'occupiedSlips', label: 'Occupied Slips', icon: 'boat-outline', color: '#0EA5E9', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'availableSlips', label: 'Available Slips', icon: 'water-outline', color: '#10B981', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'totalBoats', label: 'Total Boats', icon: 'boat', color: '#8B5CF6', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'activeCustomers', label: 'Active Customers', icon: 'people-outline', color: '#059669', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'arrivalsToday', label: 'Arrivals Today', icon: 'calendar-outline', color: '#F59E0B', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'departuresToday', label: 'Departures Today', icon: 'calendar-outline', color: '#F97316', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'fuelSalesToday', label: 'Fuel Sales Today', icon: 'flash-outline', color: '#EF4444', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
    { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: 'cash-outline', color: '#6366F1', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statItems.map((stat) => {
          const value = stats?.[stat.key];
          const change = stats?.[stat.key + 'Change'];

          return (
            <View key={stat.key} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                {change !== undefined && (
                  <View style={styles.changeContainer}>
                    <Ionicons
                      name={change >= 0 ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={change >= 0 ? '#10B981' : '#EF4444'}
                    />
                    <Text style={[styles.changeText, { color: change >= 0 ? '#10B981' : '#EF4444' }]}>
                      {Math.abs(change)}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.statValue}>{stat.format(value)}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
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
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateReservationCalendarMarina(options: MarinaOptions = {}): string {
  const { componentName = 'ReservationCalendarMarina', endpoint = '/marina/reservations/calendar' } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  slipId?: string;
  onReservationClick?: (reservation: any) => void;
  onDateSelect?: (date: Date) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ slipId, onReservationClick, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['marina-reservations', slipId, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
          ...(slipId ? { slip_id: slipId } : {}),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch marina reservations:', err);
        return [];
      }
    },
  });

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

  const getReservationsForDate = (date: Date) => {
    return reservations?.filter((res: any) => {
      const arrival = new Date(res.arrival_date || res.arrivalDate || res.start_date);
      const departure = new Date(res.departure_date || res.departureDate || res.end_date);
      return date >= arrival && date <= departure;
    }) || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="boat-outline" size={20} color="#0EA5E9" />
          <Text style={styles.title}>Marina Reservations</Text>
        </View>
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.daysGrid}>
          {calendarDays.map((day, idx) => {
            const dayReservations = getReservationsForDate(day.date);
            const hasReservations = dayReservations.length > 0;
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.dayCellInactive,
                  isToday(day.date) && styles.dayCellToday,
                  isSelected && styles.dayCellSelected,
                  hasReservations && styles.dayCellReserved,
                ]}
                onPress={() => handleDateClick(day.date)}
              >
                <Text style={[
                  styles.dayNumber,
                  !day.isCurrentMonth && styles.dayNumberInactive,
                  isToday(day.date) && styles.dayNumberToday,
                ]}>
                  {day.date.getDate()}
                </Text>
                {hasReservations && (
                  <View style={styles.reservationsContainer}>
                    {dayReservations.slice(0, 2).map((res: any, i: number) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.reservationDot}
                        onPress={() => onReservationClick?.(res)}
                      />
                    ))}
                    {dayReservations.length > 2 && (
                      <Text style={styles.moreCount}>+{dayReservations.length - 2}</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#DBEAFE' }]} />
          <Text style={styles.legendText}>Reserved</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { borderWidth: 2, borderColor: '#0EA5E9' }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 150,
    textAlign: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    borderRadius: 8,
  },
  dayCellInactive: {
    opacity: 0.4,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  dayCellSelected: {
    backgroundColor: '#DBEAFE',
  },
  dayCellReserved: {
    backgroundColor: '#E0F2FE',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dayNumberInactive: {
    color: '#9CA3AF',
  },
  dayNumberToday: {
    color: '#0EA5E9',
    fontWeight: 'bold',
  },
  reservationsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  reservationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0EA5E9',
  },
  moreCount: {
    fontSize: 8,
    color: '#6B7280',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateReservationListTodayMarina(options: MarinaOptions = {}): string {
  const { componentName = 'ReservationListTodayMarina', endpoint = '/marina/reservations/today' } = options;

  return `import React from 'react';
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

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const navigation = useNavigation();

  const { data, isLoading } = useQuery({
    queryKey: ['marina-reservations-today'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || { arrivals: [], departures: [] };
      } catch (err) {
        console.error('Failed to fetch today reservations:', err);
        return { arrivals: [], departures: [] };
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  const arrivals = data?.arrivals || [];
  const departures = data?.departures || [];

  const renderArrivalItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.reservationCard}
      onPress={() => navigation.navigate('MarinaReservationDetail' as never, { id: item.id } as never)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.boatInfo}>
          <Ionicons name="boat" size={20} color="#0EA5E9" />
          <Text style={styles.boatName}>{item.boat_name || item.boatName || 'Unnamed Boat'}</Text>
        </View>
        <Text style={styles.slipNumber}>Slip {item.slip_number || item.slipNumber}</Text>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{item.customer_name || item.customerName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{item.arrival_time || item.arrivalTime || 'TBD'}</Text>
        </View>
      </View>
      {item.boat_length && (
        <Text style={styles.boatDetails}>{item.boat_length}ft {item.boat_type || ''}</Text>
      )}
    </TouchableOpacity>
  );

  const renderDepartureItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.reservationCard}
      onPress={() => navigation.navigate('MarinaReservationDetail' as never, { id: item.id } as never)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.boatInfo}>
          <Ionicons name="boat" size={20} color="#F97316" />
          <Text style={styles.boatName}>{item.boat_name || item.boatName || 'Unnamed Boat'}</Text>
        </View>
        <Text style={styles.slipNumber}>Slip {item.slip_number || item.slipNumber}</Text>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{item.customer_name || item.customerName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{item.departure_time || item.departureTime || 'TBD'}</Text>
        </View>
      </View>
      {item.balance_due !== undefined && item.balance_due > 0 && (
        <Text style={styles.balanceDue}>Balance Due: \${item.balance_due.toLocaleString()}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="arrow-forward-circle" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Arrivals Today</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{arrivals.length}</Text>
          </View>
        </View>
        <FlatList
          data={arrivals}
          renderItem={renderArrivalItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No arrivals scheduled today</Text>
          }
        />
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="arrow-back-circle" size={20} color="#F97316" />
            <Text style={styles.sectionTitle}>Departures Today</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: '#FFEDD5' }]}>
            <Text style={[styles.countText, { color: '#F97316' }]}>{departures.length}</Text>
          </View>
        </View>
        <FlatList
          data={departures}
          renderItem={renderDepartureItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No departures scheduled today</Text>
          }
        />
      </View>
    </View>
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
    paddingVertical: 48,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  reservationCard: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  boatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  boatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  slipNumber: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  boatDetails: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  balanceDue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingVertical: 24,
  },
});

export default ${componentName};
`;
}

export function generateSlipAvailability(options: MarinaOptions = {}): string {
  const { componentName = 'SlipAvailability', endpoint = '/marina/slips/availability' } = options;

  return `import React, { useState } from 'react';
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

interface ${componentName}Props {
  onSlipClick?: (slip: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSlipClick }) => {
  const [filterSize, setFilterSize] = useState<string>('');
  const [filterDock, setFilterDock] = useState<string>('');

  const { data: slips, isLoading } = useQuery({
    queryKey: ['marina-slips', filterSize, filterDock],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filterSize) params.set('size', filterSize);
        if (filterDock) params.set('dock', filterDock);
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch slip availability:', err);
        return [];
      }
    },
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: string; bgColor: string; textColor: string; label: string }> = {
      available: { icon: 'checkmark-circle', bgColor: '#D1FAE5', textColor: '#059669', label: 'Available' },
      occupied: { icon: 'boat', bgColor: '#DBEAFE', textColor: '#2563EB', label: 'Occupied' },
      reserved: { icon: 'time', bgColor: '#FEF3C7', textColor: '#D97706', label: 'Reserved' },
      maintenance: { icon: 'construct', bgColor: '#F3F4F6', textColor: '#6B7280', label: 'Maintenance' },
    };
    return configs[status?.toLowerCase()] || configs.available;
  };

  const slipSizes = ['small', 'medium', 'large', 'xlarge'];
  const docks = ['A', 'B', 'C', 'D', 'E', 'F'];

  const statusCounts = slips?.reduce((acc: Record<string, number>, slip: any) => {
    const status = slip.status?.toLowerCase() || 'available';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  // Group slips by dock
  const slipsByDock = slips?.reduce((acc: Record<string, any[]>, slip: any) => {
    const dock = slip.dock || slip.dock_id || 'A';
    if (!acc[dock]) acc[dock] = [];
    acc[dock].push(slip);
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  const renderStatusSummary = () => (
    <View style={styles.summaryContainer}>
      {['available', 'occupied', 'reserved', 'maintenance'].map((status) => {
        const config = getStatusConfig(status);
        return (
          <View key={status} style={[styles.summaryCard, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon as any} size={18} color={config.textColor} />
            <Text style={[styles.summaryCount, { color: config.textColor }]}>
              {statusCounts[status] || 0}
            </Text>
            <Text style={[styles.summaryLabel, { color: config.textColor }]}>
              {config.label}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderSlipItem = ({ item }: { item: any }) => {
    const config = getStatusConfig(item.status);
    return (
      <TouchableOpacity
        style={[styles.slipCard, { backgroundColor: config.bgColor, borderColor: config.textColor }]}
        onPress={() => onSlipClick?.(item)}
      >
        <View style={styles.slipHeader}>
          <Text style={[styles.slipNumber, { color: config.textColor }]}>
            {item.slip_number || item.number}
          </Text>
          <Ionicons name={config.icon as any} size={16} color={config.textColor} />
        </View>
        <Text style={[styles.slipLength, { color: config.textColor }]}>
          {item.max_length || item.length}ft
        </Text>
        <View style={styles.amenitiesRow}>
          {item.power && <Ionicons name="flash" size={12} color="#F59E0B" />}
          {item.water && <Ionicons name="water" size={12} color="#3B82F6" />}
        </View>
        {item.boat_name && (
          <Text style={styles.boatName} numberOfLines={1}>{item.boat_name}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderStatusSummary()}

      <View style={styles.filtersContainer}>
        <Ionicons name="filter-outline" size={18} color="#6B7280" />
        <TouchableOpacity
          style={[styles.filterChip, !filterSize && styles.filterChipActive]}
          onPress={() => setFilterSize('')}
        >
          <Text style={[styles.filterText, !filterSize && styles.filterTextActive]}>All Sizes</Text>
        </TouchableOpacity>
        {slipSizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.filterChip, filterSize === size && styles.filterChipActive]}
            onPress={() => setFilterSize(size === filterSize ? '' : size)}
          >
            <Text style={[styles.filterText, filterSize === size && styles.filterTextActive]}>
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {Object.entries(slipsByDock).map(([dock, dockSlips]) => (
        <View key={dock} style={styles.dockSection}>
          <View style={styles.dockHeader}>
            <Ionicons name="water-outline" size={18} color="#0EA5E9" />
            <Text style={styles.dockTitle}>Dock {dock}</Text>
          </View>
          <FlatList
            data={dockSlips as any[]}
            renderItem={renderSlipItem}
            keyExtractor={(item) => item.id || item.slip_number}
            numColumns={4}
            contentContainerStyle={styles.gridContent}
          />
        </View>
      ))}

      {(!slips || slips.length === 0) && (
        <View style={styles.emptyContainer}>
          <Ionicons name="boat-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No slips found</Text>
        </View>
      )}
    </View>
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
    paddingVertical: 48,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#0EA5E9',
  },
  filterText: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dockSection: {
    marginBottom: 20,
  },
  dockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  gridContent: {
    paddingHorizontal: 12,
  },
  slipCard: {
    flex: 1,
    margin: 4,
    padding: 10,
    borderRadius: 10,
    maxWidth: '23%',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  slipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  slipNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  slipLength: {
    fontSize: 10,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  boatName: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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

export function generateCustomerProfileMarina(options: MarinaOptions = {}): string {
  const { componentName = 'CustomerProfileMarina', endpoint = '/marina/customers' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propCustomerId }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const customerId = propCustomerId || (route.params as any)?.id;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['marina-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
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

  const boats = customer.boats || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#6B7280" />
        <Text style={styles.backText}>Back to Customers</Text>
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {customer.avatar_url || customer.photo ? (
              <Image source={{ uri: customer.avatar_url || customer.photo }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={40} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.customerName}>
              {customer.name || \`\${customer.first_name || ''} \${customer.last_name || ''}\`.trim()}
            </Text>
            {customer.membership_type && (
              <View style={styles.membershipBadge}>
                <Ionicons name="star" size={12} color="#D97706" />
                <Text style={styles.membershipText}>{customer.membership_type}</Text>
              </View>
            )}
            {customer.member_since && (
              <Text style={styles.memberSince}>Member since {new Date(customer.member_since).getFullYear()}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Contact Information</Text>
        </View>
        {customer.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{customer.email}</Text>
          </View>
        )}
        {customer.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{customer.phone}</Text>
          </View>
        )}
        {(customer.address || customer.city || customer.state) && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              {[customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="boat-outline" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Current Slip</Text>
        </View>
        {customer.current_slip ? (
          <>
            <View style={styles.infoRow}>
              <Ionicons name="water-outline" size={18} color="#6B7280" />
              <Text style={styles.infoText}>Slip {customer.current_slip} (Dock {customer.current_dock || 'A'})</Text>
            </View>
            {customer.slip_start_date && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>Since {new Date(customer.slip_start_date).toLocaleDateString()}</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.noSlipText}>No current slip assigned</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="boat" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Registered Boats</Text>
        </View>
        {boats.length > 0 ? (
          boats.map((boat: any, idx: number) => (
            <View key={idx} style={styles.boatCard}>
              <View style={styles.boatHeader}>
                <Ionicons name="boat" size={20} color="#0EA5E9" />
                <Text style={styles.boatName}>{boat.name}</Text>
              </View>
              <View style={styles.boatDetails}>
                {boat.make && <Text style={styles.boatDetail}>Make: {boat.make}</Text>}
                {boat.model && <Text style={styles.boatDetail}>Model: {boat.model}</Text>}
                {boat.year && <Text style={styles.boatDetail}>Year: {boat.year}</Text>}
                {boat.length && <Text style={styles.boatDetail}>Length: {boat.length}ft</Text>}
                {boat.registration && <Text style={styles.boatDetail}>Reg: {boat.registration}</Text>}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noBoatsText}>No boats registered</Text>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
          <Text style={[styles.statValue, { color: '#2563EB' }]}>{customer.total_visits || 0}</Text>
          <Text style={styles.statLabel}>Total Visits</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: '#059669' }]}>{customer.total_nights || 0}</Text>
          <Text style={styles.statLabel}>Total Nights</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
          <Text style={[styles.statValue, { color: '#7C3AED' }]}>\${(customer.total_spent || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statValue, { color: '#D97706' }]}>{customer.loyalty_points || 0}</Text>
          <Text style={styles.statLabel}>Loyalty Points</Text>
        </View>
      </View>

      {customer.balance_due !== undefined && customer.balance_due > 0 && (
        <View style={styles.balanceCard}>
          <View style={styles.balanceInfo}>
            <Ionicons name="card-outline" size={24} color="#DC2626" />
            <View>
              <Text style={styles.balanceLabel}>Outstanding Balance</Text>
              <Text style={styles.balanceAmount}>\${customer.balance_due.toLocaleString()}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.payButton}>
            <Text style={styles.payButtonText}>Process Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      {customer.notes && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  backText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerCard: {
    background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
    backgroundColor: '#0EA5E9',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  membershipText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  noSlipText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  boatCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  boatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  boatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  boatDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  boatDetail: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  noBoatsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  balanceCard: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#111827',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  payButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
