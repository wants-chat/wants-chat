/**
 * Pet Boarding Component Generators (React Native)
 *
 * Generates components for pet boarding facilities:
 * - PetboardingStats: Dashboard statistics for boarding facility
 * - CalendarPetboarding: Booking calendar for pet boarding
 * - StaffScheduleBoarding: Staff scheduling for boarding facility
 * - PetProfileBoarding: Pet profile view for boarding context
 * - CurrentPets: List of currently boarded pets
 * - PetActivities: Activity tracking for boarded pets
 * - FeedingSchedule: Feeding schedule management
 */

export interface BoardingStatsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface CalendarBoardingOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  createRoute?: string;
  detailRoute?: string;
}

export interface StaffScheduleOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface PetProfileBoardingOptions {
  componentName?: string;
  endpoint?: string;
}

export interface CurrentPetsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showActions?: boolean;
}

export interface PetActivitiesOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface FeedingScheduleOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate PetboardingStats component (React Native)
 */
export function generatePetboardingStats(options: BoardingStatsOptions = {}): string {
  const {
    componentName = 'PetboardingStats',
    endpoint = '/boarding/stats',
    queryKey = 'boarding-stats',
  } = options;

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

interface StatsData {
  currentPets: number;
  currentPetsChange?: number;
  totalCapacity: number;
  occupancyRate: number;
  occupancyChange?: number;
  weeklyBookings: number;
  weeklyBookingsChange?: number;
  monthlyRevenue: number;
  revenueChange?: number;
  avgStayDuration: number;
  upcomingCheckouts: number;
  upcomingCheckins: number;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<StatsData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch boarding stats:', err);
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
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const statsConfig = [
    { key: 'currentPets', label: 'Current Pets', icon: 'paw', color: '#3B82F6', type: 'number', changeKey: 'currentPetsChange' },
    { key: 'occupancyRate', label: 'Occupancy Rate', icon: 'bed', color: '#10B981', type: 'percentage', changeKey: 'occupancyChange' },
    { key: 'weeklyBookings', label: 'Weekly Bookings', icon: 'calendar', color: '#8B5CF6', type: 'number', changeKey: 'weeklyBookingsChange' },
    { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: 'cash', color: '#059669', type: 'currency', changeKey: 'revenueChange' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {statsConfig.map((stat) => {
          const value = stats?.[stat.key as keyof StatsData];
          const change = stat.changeKey ? stats?.[stat.changeKey as keyof StatsData] : undefined;

          return (
            <View key={stat.key} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                {change !== undefined && (
                  <View style={styles.changeContainer}>
                    <Ionicons
                      name={Number(change) >= 0 ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={Number(change) >= 0 ? '#10B981' : '#EF4444'}
                    />
                    <Text style={[
                      styles.changeText,
                      { color: Number(change) >= 0 ? '#10B981' : '#EF4444' }
                    ]}>
                      {Math.abs(Number(change))}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.statValue}>{formatValue(value, stat.type)}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Quick Info Cards */}
      <View style={styles.quickInfoContainer}>
        <View style={styles.quickInfoCard}>
          <View style={[styles.quickIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
          </View>
          <View style={styles.quickInfoContent}>
            <Text style={styles.quickInfoLabel}>Avg Stay Duration</Text>
            <Text style={styles.quickInfoValue}>{stats?.avgStayDuration || 0} days</Text>
          </View>
        </View>

        <View style={styles.quickInfoCard}>
          <View style={[styles.quickIconContainer, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="arrow-up-circle-outline" size={20} color="#10B981" />
          </View>
          <View style={styles.quickInfoContent}>
            <Text style={styles.quickInfoLabel}>Upcoming Check-ins</Text>
            <Text style={styles.quickInfoValue}>{stats?.upcomingCheckins || 0}</Text>
          </View>
        </View>

        <View style={styles.quickInfoCard}>
          <View style={[styles.quickIconContainer, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="arrow-down-circle-outline" size={20} color="#EF4444" />
          </View>
          <View style={styles.quickInfoContent}>
            <Text style={styles.quickInfoLabel}>Upcoming Check-outs</Text>
            <Text style={styles.quickInfoValue}>{stats?.upcomingCheckouts || 0}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
    fontSize: 13,
    color: '#6B7280',
  },
  quickInfoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  quickInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickInfoContent: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});

export default ${componentName};
`;
}

/**
 * Generate CalendarPetboarding component (React Native)
 */
export function generateCalendarPetboarding(options: CalendarBoardingOptions = {}): string {
  const {
    componentName = 'CalendarPetboarding',
    endpoint = '/boarding/bookings',
    queryKey = 'boarding-bookings',
    detailRoute = 'BoardingDetail',
  } = options;

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
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Booking {
  id: string;
  pet_name: string;
  pet_type: 'dog' | 'cat' | 'other';
  owner_name: string;
  check_in: string;
  check_out: string;
  status: 'confirmed' | 'pending' | 'checked_in' | 'completed' | 'cancelled';
  room_number?: string;
  special_instructions?: string;
}

interface ${componentName}Props {
  data?: Booking[];
  onEventClick?: (booking: Booking) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ${componentName}: React.FC<${componentName}Props> = ({ data: propData, onEventClick }) => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<Booking[]>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const bookings = propData || fetchedData || [];

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
    return bookings.filter((booking: Booking) => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      return checkIn <= dateEnd && checkOut >= dateStart;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: '#3B82F6',
      pending: '#F59E0B',
      checked_in: '#10B981',
      completed: '#6B7280',
      cancelled: '#EF4444',
    };
    return colors[status] || colors.pending;
  };

  const handleBookingPress = (booking: Booking) => {
    if (onEventClick) onEventClick(booking);
    else setSelectedBooking(booking);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
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
        <Text style={styles.headerTitle}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentDate(new Date())} style={styles.todayButton}>
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarScroll}>
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, idx) => {
            const dayBookings = getBookingsForDate(day.date);
            return (
              <View key={idx} style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.dayCellInactive,
              ]}>
                <View style={[
                  styles.dayNumber,
                  isToday(day.date) && styles.todayNumber,
                ]}>
                  <Text style={[
                    styles.dayNumberText,
                    isToday(day.date) && styles.todayNumberText,
                    !day.isCurrentMonth && styles.dayNumberInactive,
                  ]}>
                    {day.date.getDate()}
                  </Text>
                </View>
                <View style={styles.bookingsList}>
                  {dayBookings.slice(0, 2).map((booking: Booking, i: number) => (
                    <TouchableOpacity
                      key={booking.id || i}
                      style={[styles.bookingItem, { borderLeftColor: getStatusColor(booking.status) }]}
                      onPress={() => handleBookingPress(booking)}
                    >
                      <Ionicons
                        name={booking.pet_type === 'dog' ? 'paw' : 'paw-outline'}
                        size={10}
                        color={getStatusColor(booking.status)}
                      />
                      <Text style={styles.bookingName} numberOfLines={1}>{booking.pet_name}</Text>
                    </TouchableOpacity>
                  ))}
                  {dayBookings.length > 2 && (
                    <Text style={styles.moreText}>+{dayBookings.length - 2} more</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Booking Detail Modal */}
      <Modal
        visible={!!selectedBooking}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBooking(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedBooking(null)}
        >
          <View style={styles.modalContent}>
            {selectedBooking && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIcon, { backgroundColor: '#DBEAFE' }]}>
                    <Ionicons
                      name={selectedBooking.pet_type === 'dog' ? 'paw' : 'paw-outline'}
                      size={24}
                      color="#3B82F6"
                    />
                  </View>
                  <View style={styles.modalHeaderInfo}>
                    <Text style={styles.modalTitle}>{selectedBooking.pet_name}</Text>
                    <Text style={styles.modalSubtitle}>Owner: {selectedBooking.owner_name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.modalRowText}>
                      Check-in: {new Date(selectedBooking.check_in).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text style={styles.modalRowText}>
                      Check-out: {new Date(selectedBooking.check_out).toLocaleDateString()}
                    </Text>
                  </View>
                  {selectedBooking.room_number && (
                    <View style={styles.modalRow}>
                      <Ionicons name="bed-outline" size={16} color="#6B7280" />
                      <Text style={styles.modalRowText}>Room: {selectedBooking.room_number}</Text>
                    </View>
                  )}
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedBooking.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedBooking.status) }]}>
                      {selectedBooking.status.replace('_', ' ')}
                    </Text>
                  </View>
                  {selectedBooking.special_instructions && (
                    <View style={styles.instructionsBox}>
                      <Text style={styles.instructionsLabel}>Special Instructions:</Text>
                      <Text style={styles.instructionsText}>{selectedBooking.special_instructions}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                      setSelectedBooking(null);
                      navigation.navigate('${detailRoute}' as never, { id: selectedBooking.id } as never);
                    }}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedBooking(null)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
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
    backgroundColor: '#FFFFFF',
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  todayText: {
    fontSize: 14,
    color: '#374151',
  },
  weekdayRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekdayCell: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  calendarScroll: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    minHeight: 80,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
  },
  dayCellInactive: {
    backgroundColor: '#F9FAFB',
  },
  dayNumber: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  todayNumber: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  dayNumberText: {
    fontSize: 12,
    color: '#111827',
  },
  todayNumberText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayNumberInactive: {
    color: '#9CA3AF',
  },
  bookingsList: {
    gap: 2,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    borderLeftWidth: 2,
  },
  bookingName: {
    fontSize: 9,
    color: '#374151',
    flex: 1,
  },
  moreText: {
    fontSize: 9,
    color: '#6B7280',
    paddingLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalHeaderInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalBody: {
    gap: 12,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalRowText: {
    fontSize: 14,
    color: '#374151',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  instructionsBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  instructionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 13,
    color: '#92400E',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate StaffScheduleBoarding component (React Native)
 */
export function generateStaffScheduleBoarding(options: StaffScheduleOptions = {}): string {
  const {
    componentName = 'StaffScheduleBoarding',
    endpoint = '/boarding/staff-schedule',
    queryKey = 'boarding-staff-schedule',
  } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
}

interface Shift {
  id: string;
  staff_id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface ScheduleData {
  staff: StaffMember[];
  shifts: Shift[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const shiftColors: Record<string, { bg: string; text: string }> = {
  morning: { bg: '#FEF3C7', text: '#92400E' },
  afternoon: { bg: '#DBEAFE', text: '#1D4ED8' },
  evening: { bg: '#E9D5FF', text: '#7C3AED' },
  night: { bg: '#C7D2FE', text: '#4338CA' },
};

const ${componentName}: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    return new Date(today.setDate(diff));
  });

  const { data, isLoading } = useQuery({
    queryKey: ['${queryKey}', currentWeekStart.toISOString()],
    queryFn: async () => {
      try {
        const response = await api.get<ScheduleData>(
          '${endpoint}?week_start=' + currentWeekStart.toISOString()
        );
        return response?.data || response || { staff: [], shifts: [] };
      } catch (err) {
        console.error('Failed to fetch staff schedule:', err);
        return { staff: [], shifts: [] };
      }
    },
  });

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekStart]);

  const getShiftsForStaffAndDate = (staffId: string, date: Date) => {
    return (data?.shifts || []).filter((shift: Shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shift.staff_id === staffId &&
        shiftDate.getFullYear() === date.getFullYear() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getDate() === date.getDate()
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
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
        <View style={styles.headerTitleRow}>
          <Ionicons name="calendar-outline" size={20} color="#111827" />
          <Text style={styles.headerTitle}>Staff Schedule</Text>
        </View>
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => navigateWeek('prev')} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.weekRange}>
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateWeek('next')} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Weekday Headers */}
          <View style={styles.tableHeader}>
            <View style={styles.staffColumn}>
              <Text style={styles.columnHeader}>Staff Member</Text>
            </View>
            {weekDays.map((day, idx) => (
              <View
                key={idx}
                style={[styles.dayColumn, isToday(day) && styles.todayColumn]}
              >
                <Text style={[styles.dayLabel, isToday(day) && styles.todayLabel]}>
                  {WEEKDAYS[day.getDay()]}
                </Text>
                <Text style={[styles.dateLabel, isToday(day) && styles.todayLabel]}>
                  {day.getDate()}
                </Text>
              </View>
            ))}
          </View>

          {/* Staff Rows */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {(data?.staff || []).map((staff: StaffMember) => (
              <View key={staff.id} style={styles.staffRow}>
                <View style={styles.staffColumn}>
                  <View style={styles.staffInfo}>
                    {staff.avatar_url ? (
                      <Image source={{ uri: staff.avatar_url }} style={styles.staffAvatar} />
                    ) : (
                      <View style={styles.staffAvatarPlaceholder}>
                        <Ionicons name="person" size={16} color="#6B7280" />
                      </View>
                    )}
                    <View>
                      <Text style={styles.staffName}>{staff.name}</Text>
                      <Text style={styles.staffRole}>{staff.role}</Text>
                    </View>
                  </View>
                </View>
                {weekDays.map((day, idx) => {
                  const shifts = getShiftsForStaffAndDate(staff.id, day);
                  return (
                    <View
                      key={idx}
                      style={[styles.dayColumn, isToday(day) && styles.todayColumnBg]}
                    >
                      {shifts.length > 0 ? (
                        shifts.map((shift: Shift) => {
                          const colors = shiftColors[shift.type] || shiftColors.morning;
                          return (
                            <View
                              key={shift.id}
                              style={[styles.shiftBadge, { backgroundColor: colors.bg }]}
                            >
                              <Ionicons name="time-outline" size={10} color={colors.text} />
                              <Text style={[styles.shiftTime, { color: colors.text }]}>
                                {shift.start_time}-{shift.end_time}
                              </Text>
                            </View>
                          );
                        })
                      ) : (
                        <Text style={styles.noShift}>-</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(shiftColors).map(([type, colors]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.bg }]} />
            <Text style={styles.legendText}>{type}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  weekRange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  staffColumn: {
    width: 150,
    padding: 12,
    justifyContent: 'center',
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  dayColumn: {
    width: 80,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayColumn: {
    backgroundColor: '#EFF6FF',
  },
  todayColumnBg: {
    backgroundColor: '#EFF6FF',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  dateLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  todayLabel: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  staffRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  staffAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  staffAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  staffRole: {
    fontSize: 11,
    color: '#6B7280',
  },
  shiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginVertical: 2,
  },
  shiftTime: {
    fontSize: 10,
    fontWeight: '500',
  },
  noShift: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
});

export default ${componentName};
`;
}

/**
 * Generate PetProfileBoarding component (React Native)
 */
export function generatePetProfileBoarding(options: PetProfileBoardingOptions = {}): string {
  const {
    componentName = 'PetProfileBoarding',
    endpoint = '/boarding/pets',
  } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface PetData {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight?: number;
  size?: 'small' | 'medium' | 'large';
  color: string;
  gender: 'male' | 'female';
  avatar_url?: string;
  microchip_id?: string;
  is_neutered?: boolean;
  allergies?: string[];
  medical_conditions?: string[];
  medications?: string[];
  dietary_requirements?: string;
  vaccinations?: { name: string; date: string; expiry?: string }[];
  vet_info?: { name: string; phone: string; address?: string };
  emergency_contact?: { name: string; phone: string; relationship: string };
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  special_instructions?: string;
  temperament?: string;
  favorite_activities?: string[];
}

interface ${componentName}Props {
  petId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ petId: propPetId }) => {
  const route = useRoute();
  const routePetId = (route.params as { id?: string })?.id;
  const petId = propPetId || routePetId;

  const { data: pet, isLoading } = useQuery({
    queryKey: ['boarding-pet', petId],
    queryFn: async () => {
      const response = await api.get<PetData>('${endpoint}/' + petId);
      return response?.data || response;
    },
    enabled: !!petId,
  });

  const handlePhonePress = (phone: string) => {
    Linking.openURL('tel:' + phone);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL('mailto:' + email);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Pet not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Pet Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.petHeader}>
          {pet.avatar_url ? (
            <Image source={{ uri: pet.avatar_url }} style={styles.petAvatar} />
          ) : (
            <View style={styles.petAvatarPlaceholder}>
              <Ionicons name="paw" size={48} color="#3B82F6" />
            </View>
          )}
          <View style={styles.petInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.petName}>{pet.name}</Text>
              <View style={[
                styles.genderBadge,
                { backgroundColor: pet.gender === 'male' ? '#DBEAFE' : '#FCE7F3' }
              ]}>
                <Text style={[
                  styles.genderText,
                  { color: pet.gender === 'male' ? '#1D4ED8' : '#DB2777' }
                ]}>
                  {pet.gender}
                </Text>
              </View>
            </View>
            <Text style={styles.petBreed}>{pet.breed}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{pet.age} years old</Text>
              </View>
              {pet.weight && (
                <View style={styles.metaItem}>
                  <Ionicons name="fitness-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{pet.weight} lbs</Text>
                </View>
              )}
              {pet.size && (
                <View style={styles.metaItem}>
                  <Ionicons name="resize-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{pet.size}</Text>
                </View>
              )}
            </View>
            <Text style={styles.colorText}>Color: {pet.color}</Text>
            {pet.microchip_id && (
              <Text style={styles.microchipText}>Microchip: {pet.microchip_id}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Medical Information */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="heart" size={20} color="#EF4444" />
          <Text style={styles.sectionTitle}>Medical Information</Text>
        </View>

        {pet.allergies && pet.allergies.length > 0 && (
          <View style={styles.alertBox}>
            <View style={styles.alertHeader}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.alertTitle}>Allergies</Text>
            </View>
            <View style={styles.tagList}>
              {pet.allergies.map((allergy, i) => (
                <View key={i} style={styles.allergyTag}>
                  <Text style={styles.allergyTagText}>{allergy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {pet.medical_conditions && pet.medical_conditions.length > 0 && (
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Medical Conditions</Text>
            <View style={styles.tagList}>
              {pet.medical_conditions.map((condition, i) => (
                <View key={i} style={styles.conditionTag}>
                  <Text style={styles.conditionTagText}>{condition}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {pet.medications && pet.medications.length > 0 && (
          <View style={styles.infoGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="medkit-outline" size={14} color="#6B7280" />
              <Text style={styles.infoLabel}>Current Medications</Text>
            </View>
            {pet.medications.map((med, i) => (
              <Text key={i} style={styles.listItem}>- {med}</Text>
            ))}
          </View>
        )}

        {pet.dietary_requirements && (
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Dietary Requirements</Text>
            <Text style={styles.infoText}>{pet.dietary_requirements}</Text>
          </View>
        )}

        {pet.vaccinations && pet.vaccinations.length > 0 && (
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Vaccinations</Text>
            {pet.vaccinations.map((vax, i) => (
              <View key={i} style={styles.vaccineRow}>
                <Text style={styles.vaccineName}>{vax.name}</Text>
                <Text style={styles.vaccineDate}>
                  {new Date(vax.date).toLocaleDateString()}
                  {vax.expiry && ' (Exp: ' + new Date(vax.expiry).toLocaleDateString() + ')'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Owner Information */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Owner Information</Text>
        </View>
        <Text style={styles.ownerName}>{pet.owner.name}</Text>
        <TouchableOpacity style={styles.contactRow} onPress={() => handleEmailPress(pet.owner.email)}>
          <Ionicons name="mail-outline" size={16} color="#6B7280" />
          <Text style={styles.contactText}>{pet.owner.email}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow} onPress={() => handlePhonePress(pet.owner.phone)}>
          <Ionicons name="call-outline" size={16} color="#6B7280" />
          <Text style={styles.contactText}>{pet.owner.phone}</Text>
        </TouchableOpacity>
        {pet.owner.address && (
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.contactText}>{pet.owner.address}</Text>
          </View>
        )}
      </View>

      {/* Emergency Contact */}
      {pet.emergency_contact && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <Text style={styles.ownerName}>{pet.emergency_contact.name}</Text>
          <Text style={styles.relationshipText}>{pet.emergency_contact.relationship}</Text>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => handlePhonePress(pet.emergency_contact!.phone)}
          >
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text style={styles.contactText}>{pet.emergency_contact.phone}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Vet Information */}
      {pet.vet_info && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Veterinarian</Text>
          <Text style={styles.ownerName}>{pet.vet_info.name}</Text>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => handlePhonePress(pet.vet_info!.phone)}
          >
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text style={styles.contactText}>{pet.vet_info.phone}</Text>
          </TouchableOpacity>
          {pet.vet_info.address && (
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{pet.vet_info.address}</Text>
            </View>
          )}
        </View>
      )}

      {/* Care Notes */}
      {(pet.special_instructions || pet.temperament || pet.favorite_activities) && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Care Notes</Text>

          {pet.temperament && (
            <View style={styles.infoGroup}>
              <Text style={styles.infoLabel}>Temperament</Text>
              <Text style={styles.infoText}>{pet.temperament}</Text>
            </View>
          )}

          {pet.favorite_activities && pet.favorite_activities.length > 0 && (
            <View style={styles.infoGroup}>
              <Text style={styles.infoLabel}>Favorite Activities</Text>
              <View style={styles.tagList}>
                {pet.favorite_activities.map((activity, i) => (
                  <View key={i} style={styles.activityTag}>
                    <Text style={styles.activityTagText}>{activity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {pet.special_instructions && (
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsLabel}>Special Instructions</Text>
              <Text style={styles.instructionsText}>{pet.special_instructions}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
  headerCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  petHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  petAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  petAvatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  petName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  genderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  petBreed: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
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
  colorText: {
    fontSize: 13,
    color: '#6B7280',
  },
  microchipText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  alertBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  allergyTagText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  conditionTag: {
    backgroundColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionTagText: {
    fontSize: 12,
    color: '#C2410C',
    fontWeight: '500',
  },
  activityTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityTagText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  infoGroup: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  listItem: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  vaccineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  vaccineName: {
    fontSize: 14,
    color: '#374151',
  },
  vaccineDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  relationshipText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
  },
  instructionsBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  instructionsLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#92400E',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#92400E',
  },
  bottomPadding: {
    height: 24,
  },
});

export default ${componentName};
`;
}

/**
 * Generate CurrentPets component (React Native)
 */
export function generateCurrentPets(options: CurrentPetsOptions = {}): string {
  const {
    componentName = 'CurrentPets',
    endpoint = '/boarding/current-pets',
    queryKey = 'current-pets',
    showActions = true,
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface BoardedPet {
  id: string;
  pet_name: string;
  pet_type: 'dog' | 'cat' | 'other';
  breed: string;
  avatar_url?: string;
  owner_name: string;
  room_number: string;
  check_in: string;
  check_out: string;
  days_remaining: number;
  status: 'checked_in' | 'needs_attention' | 'ready_for_checkout';
  last_activity?: string;
  feeding_status?: 'fed' | 'pending' | 'overdue';
}

interface ${componentName}Props {
  onPetClick?: (pet: BoardedPet) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onPetClick }) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: pets, isLoading, refetch } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<BoardedPet[]>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch current pets:', err);
        return [];
      }
    },
  });

  const filteredPets = (pets || []).filter((pet: BoardedPet) =>
    pet.pet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      checked_in: { bg: '#D1FAE5', text: '#059669' },
      needs_attention: { bg: '#FEF3C7', text: '#D97706' },
      ready_for_checkout: { bg: '#DBEAFE', text: '#2563EB' },
    };
    return colors[status] || colors.checked_in;
  };

  const getFeedingStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      fed: '#10B981',
      pending: '#F59E0B',
      overdue: '#EF4444',
    };
    return colors[status || 'pending'] || colors.pending;
  };

  const handlePetPress = (pet: BoardedPet) => {
    if (onPetClick) onPetClick(pet);
    else navigation.navigate('PetProfileBoarding' as never, { id: pet.id } as never);
  };

  const renderPetCard = ({ item }: { item: BoardedPet }) => {
    const statusColors = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.petCard}
        onPress={() => handlePetPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.petInfoRow}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.petAvatar} />
            ) : (
              <View style={styles.petAvatarPlaceholder}>
                <Ionicons name="paw" size={24} color="#3B82F6" />
              </View>
            )}
            <View style={styles.petDetails}>
              <Text style={styles.petName}>{item.pet_name}</Text>
              <Text style={styles.petBreed}>{item.breed}</Text>
            </View>
          </View>
          ${showActions ? `<TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
          </TouchableOpacity>` : ''}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{item.owner_name}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="bed-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>Room {item.room_number}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={[
                styles.infoText,
                item.days_remaining <= 1 && { color: '#EF4444', fontWeight: '600' }
              ]}>
                {item.days_remaining} days left
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
          {item.feeding_status && (
            <Text style={[styles.feedingStatus, { color: getFeedingStatusColor(item.feeding_status) }]}>
              Feeding: {item.feeding_status}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="paw-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No pets currently boarded</Text>
    </View>
  );

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
        <View style={styles.headerTitleRow}>
          <Ionicons name="bed-outline" size={20} color="#111827" />
          <Text style={styles.headerTitle}>Current Pets ({filteredPets.length})</Text>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pets, owners, rooms..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Pet List */}
      <FlatList
        data={filteredPets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        numColumns={1}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
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
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  petInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  petAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  petBreed: {
    fontSize: 13,
    color: '#6B7280',
  },
  menuButton: {
    padding: 4,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#374151',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
  feedingStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
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

/**
 * Generate PetActivities component (React Native)
 */
export function generatePetActivities(options: PetActivitiesOptions = {}): string {
  const {
    componentName = 'PetActivities',
    endpoint = '/boarding/activities',
    queryKey = 'pet-activities',
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { api } from '@/lib/api';

interface ActivityLog {
  id: string;
  pet_id: string;
  pet_name: string;
  activity_type: 'feeding' | 'medication' | 'exercise' | 'grooming' | 'health_check' | 'playtime' | 'rest';
  description: string;
  staff_name: string;
  timestamp: string;
  notes?: string;
}

interface ${componentName}Props {
  petId?: string;
}

const activityConfig: Record<string, { icon: string; color: string; bgColor: string; label: string }> = {
  feeding: { icon: 'restaurant', color: '#EA580C', bgColor: '#FFEDD5', label: 'Feeding' },
  medication: { icon: 'medkit', color: '#DC2626', bgColor: '#FEE2E2', label: 'Medication' },
  exercise: { icon: 'fitness', color: '#16A34A', bgColor: '#DCFCE7', label: 'Exercise' },
  grooming: { icon: 'heart', color: '#EC4899', bgColor: '#FCE7F3', label: 'Grooming' },
  health_check: { icon: 'pulse', color: '#2563EB', bgColor: '#DBEAFE', label: 'Health Check' },
  playtime: { icon: 'game-controller', color: '#7C3AED', bgColor: '#EDE9FE', label: 'Playtime' },
  rest: { icon: 'moon', color: '#4F46E5', bgColor: '#E0E7FF', label: 'Rest' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ petId }) => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activity_type: 'feeding',
    description: '',
    notes: '',
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ['${queryKey}', petId],
    queryFn: async () => {
      try {
        const url = petId ? '${endpoint}?pet_id=' + petId : '${endpoint}';
        const response = await api.get<ActivityLog[]>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        return [];
      }
    },
  });

  const addActivityMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('${endpoint}', { ...data, pet_id: petId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}', petId] });
      setShowAddModal(false);
      setNewActivity({ activity_type: 'feeding', description: '', notes: '' });
    },
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return minutes + 'm ago';
    if (hours < 24) return hours + 'h ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderActivity = ({ item }: { item: ActivityLog }) => {
    const config = activityConfig[item.activity_type] || activityConfig.feeding;

    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: config.bgColor }]}>
          <Ionicons name={config.icon as any} size={20} color={config.color} />
        </View>
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <View>
              <Text style={styles.activityLabel}>
                {config.label}
                {item.pet_name && !petId && (
                  <Text style={styles.petNameText}> - {item.pet_name}</Text>
                )}
              </Text>
              <Text style={styles.activityDescription}>{item.description}</Text>
              {item.notes && (
                <Text style={styles.activityNotes}>Note: {item.notes}</Text>
              )}
            </View>
            <Text style={styles.activityTime}>{formatTimestamp(item.timestamp)}</Text>
          </View>
          <View style={styles.staffRow}>
            <Ionicons name="person-outline" size={12} color="#6B7280" />
            <Text style={styles.staffName}>{item.staff_name}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No activities logged yet</Text>
    </View>
  );

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
        <View style={styles.headerTitleRow}>
          <Ionicons name="list" size={20} color="#111827" />
          <Text style={styles.headerTitle}>Activity Log</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Log Activity</Text>
        </TouchableOpacity>
      </View>

      {/* Activity List */}
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Activity Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Activity</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Activity Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newActivity.activity_type}
                  onValueChange={(value) => setNewActivity({ ...newActivity, activity_type: value })}
                  style={styles.picker}
                >
                  {Object.entries(activityConfig).map(([key, { label }]) => (
                    <Picker.Item key={key} label={label} value={key} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Morning meal - 1 cup dry food"
                placeholderTextColor="#9CA3AF"
                value={newActivity.description}
                onChangeText={(text) => setNewActivity({ ...newActivity, description: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Any additional notes..."
                placeholderTextColor="#9CA3AF"
                value={newActivity.notes}
                onChangeText={(text) => setNewActivity({ ...newActivity, notes: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, addActivityMutation.isPending && styles.disabledButton]}
                onPress={() => addActivityMutation.mutate(newActivity)}
                disabled={addActivityMutation.isPending || !newActivity.description}
              >
                <Text style={styles.saveButtonText}>
                  {addActivityMutation.isPending ? 'Saving...' : 'Save Activity'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  petNameText: {
    fontWeight: '400',
    color: '#6B7280',
  },
  activityDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  activityNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  staffName: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate FeedingSchedule component (React Native)
 */
export function generateFeedingSchedule(options: FeedingScheduleOptions = {}): string {
  const {
    componentName = 'FeedingSchedule',
    endpoint = '/boarding/feeding-schedule',
    queryKey = 'feeding-schedule',
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface FeedingEntry {
  id: string;
  pet_id: string;
  pet_name: string;
  pet_type: 'dog' | 'cat' | 'other';
  room_number: string;
  scheduled_time: string;
  food_type: string;
  portion: string;
  dietary_notes?: string;
  status: 'pending' | 'completed' | 'skipped';
  completed_at?: string;
  completed_by?: string;
}

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<FeedingEntry[]>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch feeding schedule:', err);
        return [];
      }
    },
    refetchInterval: 60000,
  });

  const markFedMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return api.post('${endpoint}/' + entryId + '/complete', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const filteredSchedule = (schedule || []).filter((entry: FeedingEntry) => {
    if (filterStatus === 'all') return true;
    return entry.status === filterStatus;
  });

  const groupedByTime = filteredSchedule.reduce((acc: Record<string, FeedingEntry[]>, entry: FeedingEntry) => {
    const time = entry.scheduled_time;
    if (!acc[time]) acc[time] = [];
    acc[time].push(entry);
    return acc;
  }, {});

  const sections = Object.keys(groupedByTime).sort().map((time) => ({
    title: time,
    data: groupedByTime[time],
    hasOverdue: groupedByTime[time].some((e) => {
      if (e.status !== 'pending') return false;
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      return now > scheduledTime;
    }),
  }));

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      pending: { bg: '#FEF3C7', text: '#D97706' },
      completed: { bg: '#D1FAE5', text: '#059669' },
      skipped: { bg: '#E5E7EB', text: '#6B7280' },
    };
    return colors[status] || colors.pending;
  };

  const pendingCount = (schedule || []).filter((e: FeedingEntry) => e.status === 'pending').length;
  const completedCount = (schedule || []).filter((e: FeedingEntry) => e.status === 'completed').length;

  const renderSectionHeader = ({ section }: { section: { title: string; hasOverdue: boolean } }) => (
    <View style={[styles.sectionHeader, section.hasOverdue && styles.overdueHeader]}>
      <View style={styles.timeRow}>
        <Ionicons name="time-outline" size={18} color={section.hasOverdue ? '#DC2626' : '#6B7280'} />
        <Text style={[styles.timeText, section.hasOverdue && styles.overdueText]}>{section.title}</Text>
        {section.hasOverdue && (
          <View style={styles.overdueBadge}>
            <Ionicons name="alert-circle" size={14} color="#DC2626" />
            <Text style={styles.overdueLabel}>Overdue</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: FeedingEntry }) => {
    const statusColors = getStatusColor(item.status);
    const isExpanded = expandedId === item.id;
    const isOverdue = item.status === 'pending' && (() => {
      const now = new Date();
      const [hours, minutes] = item.scheduled_time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      return now > scheduledTime;
    })();

    return (
      <View style={[styles.feedingCard, isOverdue && styles.overdueCard]}>
        <View style={styles.cardContent}>
          <View style={[
            styles.petIcon,
            { backgroundColor: item.status === 'completed' ? '#D1FAE5' : '#DBEAFE' }
          ]}>
            <Ionicons
              name="paw"
              size={20}
              color={item.status === 'completed' ? '#059669' : '#3B82F6'}
            />
          </View>

          <View style={styles.petInfo}>
            <View style={styles.petRow}>
              <Text style={styles.petName}>{item.pet_name}</Text>
              <Text style={styles.roomText}>Room {item.room_number}</Text>
            </View>
            <Text style={styles.foodText}>{item.food_type} - {item.portion}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{item.status}</Text>
          </View>

          {item.status === 'pending' && (
            <TouchableOpacity
              style={styles.checkButton}
              onPress={() => markFedMutation.mutate(item.id)}
              disabled={markFedMutation.isPending}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {item.dietary_notes && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {isExpanded && item.dietary_notes && (
          <View style={styles.notesContainer}>
            <View style={styles.notesRow}>
              <Ionicons name="document-text-outline" size={14} color="#92400E" />
              <Text style={styles.notesText}>{item.dietary_notes}</Text>
            </View>
          </View>
        )}

        {item.status === 'completed' && item.completed_by && (
          <Text style={styles.completedByText}>
            Completed by {item.completed_by} at {item.completed_at && new Date(item.completed_at).toLocaleTimeString()}
          </Text>
        )}
      </View>
    );
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
        <View>
          <View style={styles.headerTitleRow}>
            <Ionicons name="restaurant-outline" size={20} color="#111827" />
            <Text style={styles.headerTitle}>Feeding Schedule</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {pendingCount} pending, {completedCount} completed
          </Text>
        </View>
        <View style={styles.filterButtons}>
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, filterStatus === status && styles.filterButtonActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Schedule List */}
      <SectionList
        sections={sections}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No feeding entries found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#374151',
    textTransform: 'capitalize',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 12,
  },
  overdueHeader: {
    backgroundColor: '#FEF2F2',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  overdueText: {
    color: '#DC2626',
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  overdueLabel: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  feedingCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  overdueCard: {
    backgroundColor: '#FEF2F2',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  petIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    flex: 1,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  petName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  roomText: {
    fontSize: 12,
    color: '#6B7280',
  },
  foodText: {
    fontSize: 13,
    color: '#4B5563',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandButton: {
    padding: 8,
  },
  notesContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginLeft: 52,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  completedByText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
    marginLeft: 52,
  },
  emptyContainer: {
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
