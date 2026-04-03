/**
 * Coworking Space Management Component Generators (React Native)
 *
 * Generates components for coworking space management including:
 * - CoworkingStats, BookingCalendarCoworking, BookingListCoworking
 * - MemberProfileCoworking, SpaceCalendar
 */

export interface CoworkingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCoworkingStats(options: CoworkingOptions = {}): string {
  const { componentName = 'CoworkingStats', endpoint = '/coworking/stats' } = options;

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
    queryKey: ['coworking-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch coworking stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const statItems = [
    { key: 'activeMembers', label: 'Active Members', icon: 'people-outline', color: '#3B82F6', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'occupancyRate', label: 'Occupancy Rate', icon: 'business-outline', color: '#10B981', format: (v: number) => \`\${v || 0}%\` },
    { key: 'availableDesks', label: 'Available Desks', icon: 'cafe-outline', color: '#8B5CF6', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'bookingsToday', label: 'Bookings Today', icon: 'calendar-outline', color: '#059669', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'meetingRoomsInUse', label: 'Meeting Rooms in Use', icon: 'people-outline', color: '#F97316', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'checkInsToday', label: 'Check-ins Today', icon: 'time-outline', color: '#EAB308', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: 'cash-outline', color: '#6366F1', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
    { key: 'newMembersThisMonth', label: 'New Members', icon: 'trending-up-outline', color: '#EF4444', format: (v: number) => (v || 0).toLocaleString() },
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

export function generateBookingCalendarCoworking(options: CoworkingOptions = {}): string {
  const { componentName = 'BookingCalendarCoworking', endpoint = '/coworking/bookings/calendar' } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  spaceId?: string;
  onBookingClick?: (booking: any) => void;
  onDateSelect?: (date: Date) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ spaceId, onBookingClick, onDateSelect }) => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['coworking-bookings', spaceId, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
          ...(spaceId ? { space_id: spaceId } : {}),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
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

  const getBookingsForDate = (date: Date) => {
    return bookings?.filter((booking: any) => {
      const bookingDate = new Date(booking.date || booking.start_date || booking.booking_date);
      return bookingDate.getFullYear() === date.getFullYear() &&
             bookingDate.getMonth() === date.getMonth() &&
             bookingDate.getDate() === date.getDate();
    }) || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const getBookingTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      desk: { bg: '#DBEAFE', text: '#2563EB' },
      meeting_room: { bg: '#F3E8FF', text: '#7C3AED' },
      private_office: { bg: '#D1FAE5', text: '#059669' },
      event_space: { bg: '#FFEDD5', text: '#EA580C' },
    };
    return colors[type?.toLowerCase()] || colors.desk;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="business-outline" size={20} color="#8B5CF6" />
          <Text style={styles.title}>Booking Calendar</Text>
        </View>

        <View style={styles.headerControls}>
          <View style={styles.navigation}>
            <TouchableOpacity
              onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              style={styles.navButton}
            >
              <Ionicons name="chevron-back" size={20} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              style={styles.navButton}
            >
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CoworkingBookingNew' as never)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
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
            const dayBookings = getBookingsForDate(day.date);
            const hasBookings = dayBookings.length > 0;
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.dayCellInactive,
                  isToday(day.date) && styles.dayCellToday,
                  isSelected && styles.dayCellSelected,
                  isWeekend(day.date) && day.isCurrentMonth && styles.dayCellWeekend,
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
                {hasBookings && (
                  <View style={styles.bookingsContainer}>
                    {dayBookings.slice(0, 2).map((booking: any, i: number) => {
                      const colors = getBookingTypeColor(booking.space_type || booking.type);
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[styles.bookingDot, { backgroundColor: colors.bg }]}
                          onPress={() => onBookingClick?.(booking)}
                        />
                      );
                    })}
                    {dayBookings.length > 2 && (
                      <Text style={styles.moreCount}>+{dayBookings.length - 2}</Text>
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
          <Text style={styles.legendText}>Hot Desk</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F3E8FF' }]} />
          <Text style={styles.legendText}>Meeting Room</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D1FAE5' }]} />
          <Text style={styles.legendText}>Private Office</Text>
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
  titleRow: {
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
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    minWidth: 120,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: '#8B5CF6',
  },
  dayCellSelected: {
    backgroundColor: '#F3E8FF',
  },
  dayCellWeekend: {
    backgroundColor: '#F9FAFB',
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
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  bookingsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  bookingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreCount: {
    fontSize: 8,
    color: '#6B7280',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
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

export function generateBookingListCoworking(options: CoworkingOptions = {}): string {
  const { componentName = 'BookingListCoworking', endpoint = '/coworking/bookings' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
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
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('today');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['coworking-bookings-list', filter, searchTerm],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.set('filter', filter);
        if (searchTerm) params.set('search', searchTerm);
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        return [];
      }
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      confirmed: { bg: '#D1FAE5', text: '#059669' },
      pending: { bg: '#FEF3C7', text: '#D97706' },
      checked_in: { bg: '#DBEAFE', text: '#2563EB' },
      completed: { bg: '#F3F4F6', text: '#6B7280' },
      cancelled: { bg: '#FEE2E2', text: '#DC2626' },
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const getSpaceTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'meeting_room':
        return 'people-outline';
      case 'private_office':
        return 'business-outline';
      default:
        return 'desktop-outline';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const renderBookingItem = ({ item }: { item: any }) => {
    const statusColors = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => navigation.navigate('CoworkingBookingDetail' as never, { id: item.id } as never)}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.spaceIconContainer}>
            <Ionicons name={getSpaceTypeIcon(item.space_type || item.type) as any} size={24} color="#8B5CF6" />
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.spaceName}>{item.space_name || item.spaceName || 'Workspace'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>{item.status}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.member_name || item.memberName || item.booked_by}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {new Date(item.date || item.booking_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.start_time} - {item.end_time}</Text>
          </View>
        </View>

        {item.amount && (
          <Text style={styles.amount}>\${item.amount}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
          <Text style={styles.title}>Bookings</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bookings..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.filterTabs}>
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
              onPress={() => setFilter(tab.key as any)}
            >
              <Text style={[styles.filterTabText, filter === tab.key && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#8B5CF6',
  },
  filterTabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  spaceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    textAlign: 'right',
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

export function generateMemberProfileCoworking(options: CoworkingOptions = {}): string {
  const { componentName = 'MemberProfileCoworking', endpoint = '/coworking/members' } = options;

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
  memberId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ memberId: propMemberId }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const memberId = propMemberId || (route.params as any)?.id;

  const { data: member, isLoading } = useQuery({
    queryKey: ['coworking-member', memberId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${memberId}\`);
      return response?.data || response;
    },
    enabled: !!memberId,
  });

  const getMembershipColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      basic: { bg: '#F3F4F6', text: '#6B7280' },
      professional: { bg: '#DBEAFE', text: '#2563EB' },
      premium: { bg: '#F3E8FF', text: '#7C3AED' },
      enterprise: { bg: '#FEF3C7', text: '#D97706' },
    };
    return colors[type?.toLowerCase()] || colors.basic;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Member not found</Text>
      </View>
    );
  }

  const membershipColors = getMembershipColor(member.membership_type);
  const recentBookings = member.recent_bookings || member.recentBookings || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#6B7280" />
        <Text style={styles.backText}>Back to Members</Text>
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {member.avatar_url || member.photo ? (
              <Image source={{ uri: member.avatar_url || member.photo }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={40} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.memberName}>
              {member.name || \`\${member.first_name || ''} \${member.last_name || ''}\`.trim()}
            </Text>
            {member.company && (
              <View style={styles.companyRow}>
                <Ionicons name="briefcase-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.companyText}>{member.company}</Text>
              </View>
            )}
            <View style={styles.badgeRow}>
              <View style={[styles.membershipBadge, { backgroundColor: membershipColors.bg }]}>
                <Text style={[styles.membershipText, { color: membershipColors.text }]}>
                  {member.membership_type || 'Basic'} Member
                </Text>
              </View>
              {member.is_active && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>Active</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Contact Information</Text>
        </View>
        {member.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{member.email}</Text>
          </View>
        )}
        {member.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{member.phone}</Text>
          </View>
        )}
        {member.member_since && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              Member since {new Date(member.member_since).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="business-outline" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Workspace Details</Text>
        </View>
        {member.assigned_desk && (
          <View style={styles.infoRow}>
            <Ionicons name="desktop-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>Assigned Desk: {member.assigned_desk}</Text>
          </View>
        )}
        {member.preferred_location && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{member.preferred_location}</Text>
          </View>
        )}
        {member.access_hours && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{member.access_hours} Access</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star-outline" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Membership Benefits</Text>
        </View>
        <View style={styles.benefitsRow}>
          {(member.benefits || ['WiFi', 'Coffee', 'Meeting Room Credits', 'Printing']).map((benefit: string, idx: number) => (
            <View key={idx} style={styles.benefitTag}>
              {benefit.toLowerCase().includes('wifi') && <Ionicons name="wifi-outline" size={14} color="#8B5CF6" />}
              {benefit.toLowerCase().includes('coffee') && <Ionicons name="cafe-outline" size={14} color="#8B5CF6" />}
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
          <Text style={[styles.statValue, { color: '#7C3AED' }]}>{member.total_bookings || 0}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
          <Text style={[styles.statValue, { color: '#2563EB' }]}>{member.total_hours || 0}h</Text>
          <Text style={styles.statLabel}>Hours Used</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: '#059669' }]}>{member.meeting_room_hours || 0}h</Text>
          <Text style={styles.statLabel}>Meeting Room</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFEDD5' }]}>
          <Text style={[styles.statValue, { color: '#EA580C' }]}>{member.credits_remaining || 0}</Text>
          <Text style={styles.statLabel}>Credits Left</Text>
        </View>
      </View>

      {recentBookings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
          </View>
          {recentBookings.slice(0, 5).map((booking: any, idx: number) => (
            <View key={idx} style={styles.bookingRow}>
              <View style={styles.bookingIcon}>
                <Ionicons name="business-outline" size={18} color="#8B5CF6" />
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingName}>{booking.space_name || booking.spaceName}</Text>
                <Text style={styles.bookingDate}>
                  {new Date(booking.date).toLocaleDateString()} | {booking.start_time} - {booking.end_time}
                </Text>
              </View>
              <View style={[styles.bookingStatus, { backgroundColor: booking.status === 'completed' ? '#D1FAE5' : '#DBEAFE' }]}>
                <Text style={[styles.bookingStatusText, { color: booking.status === 'completed' ? '#059669' : '#2563EB' }]}>
                  {booking.status}
                </Text>
              </View>
            </View>
          ))}
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
    backgroundColor: '#8B5CF6',
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
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  companyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  membershipBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
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
  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benefitTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#7C3AED',
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
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bookingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bookingDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  bookingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookingStatusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default ${componentName};
`;
}

export function generateSpaceCalendar(options: CoworkingOptions = {}): string {
  const { componentName = 'SpaceCalendar', endpoint = '/coworking/spaces/calendar' } = options;

  return `import React, { useState } from 'react';
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
  onSlotClick?: (space: any, time: string, date: Date) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSlotClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSpace, setSelectedSpace] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['space-calendar', currentDate.toISOString().split('T')[0], selectedSpace],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          date: currentDate.toISOString().split('T')[0],
          ...(selectedSpace !== 'all' ? { space_id: selectedSpace } : {}),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return response?.data || response || { spaces: [], bookings: [] };
      } catch (err) {
        console.error('Failed to fetch space calendar:', err);
        return { spaces: [], bookings: [] };
      }
    },
  });

  const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formatHour = (hour: number) => {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return \`\${displayHour} \${suffix}\`;
  };

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isSlotBooked = (spaceId: string, hour: number) => {
    return data?.bookings?.some((booking: any) => {
      if ((booking.space_id || booking.spaceId) !== spaceId) return false;
      const startHour = parseInt(booking.start_time?.split(':')[0] || '0');
      const endHour = parseInt(booking.end_time?.split(':')[0] || '0');
      return hour >= startHour && hour < endHour;
    });
  };

  const getBookingForSlot = (spaceId: string, hour: number) => {
    return data?.bookings?.find((booking: any) => {
      if ((booking.space_id || booking.spaceId) !== spaceId) return false;
      const startHour = parseInt(booking.start_time?.split(':')[0] || '0');
      return hour === startHour;
    });
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  const spaces = data?.spaces || [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="business-outline" size={20} color="#8B5CF6" />
          <Text style={styles.title}>Space Availability</Text>
        </View>

        <View style={styles.controls}>
          <View style={styles.navigation}>
            <TouchableOpacity onPress={navigatePrev} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToToday}
              style={[styles.todayButton, isToday && styles.todayButtonActive]}
            >
              <Text style={[styles.todayButtonText, isToday && styles.todayButtonTextActive]}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={navigateNext} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.dateText}>
            {WEEKDAYS[currentDate.getDay()]}, {currentDate.toLocaleDateString()}
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.hoursRow}>
            <View style={styles.spaceNameColumn}>
              <Text style={styles.headerLabel}>Space</Text>
            </View>
            {HOURS.map((hour) => (
              <View key={hour} style={styles.hourColumn}>
                <Text style={styles.hourText}>{formatHour(hour)}</Text>
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {spaces.map((space: any) => (
              <View key={space.id} style={styles.spaceRow}>
                <View style={styles.spaceNameColumn}>
                  <View style={styles.spaceInfo}>
                    <Ionicons name="business-outline" size={14} color="#8B5CF6" />
                    <Text style={styles.spaceName}>{space.name}</Text>
                  </View>
                  <View style={styles.capacityRow}>
                    <Ionicons name="people-outline" size={12} color="#9CA3AF" />
                    <Text style={styles.capacityText}>{space.capacity} people</Text>
                  </View>
                </View>

                {HOURS.map((hour) => {
                  const booked = isSlotBooked(space.id, hour);
                  const booking = getBookingForSlot(space.id, hour);

                  return (
                    <TouchableOpacity
                      key={hour}
                      style={[styles.hourColumn, booked && styles.hourColumnBooked]}
                      onPress={() => !booked && onSlotClick?.(space, formatHour(hour), currentDate)}
                      disabled={booked}
                    >
                      {booking && (
                        <View style={styles.bookingSlot}>
                          <Text style={styles.bookingMember} numberOfLines={1}>
                            {booking.member_name || booking.booked_by || 'Booked'}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F3E8FF' }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D1FAE5', borderWidth: 1, borderColor: '#10B981' }]} />
          <Text style={styles.legendText}>Available</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 8,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  todayButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  todayButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  todayButtonTextActive: {
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  hoursRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  spaceNameColumn: {
    width: 120,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  hourColumn: {
    width: 60,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  hourColumnBooked: {
    backgroundColor: '#F3E8FF',
  },
  hourText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
  },
  spaceRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  spaceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spaceName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  capacityText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  bookingSlot: {
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  bookingMember: {
    fontSize: 8,
    color: '#FFFFFF',
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
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
