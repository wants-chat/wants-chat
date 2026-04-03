/**
 * Cleaning Service Component Generators (React Native)
 *
 * Generates components for cleaning service management:
 * - CleaningStats: Dashboard statistics
 * - BookingCalendarCleaning: Calendar view of cleaning bookings
 * - CleanerProfile: Cleaner profile and performance
 * - CleanerSchedule: Cleaner's daily/weekly schedule
 * - CustomerProfileCleaning: Customer profile with booking history
 */

export interface CleaningStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCleaningStats(options: CleaningStatsOptions = {}): string {
  const { componentName = 'CleaningStats', endpoint = '/cleaning/stats' } = options;

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
    queryKey: ['cleaning-stats'],
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
    { key: 'todayBookings', label: "Today's Bookings", icon: 'calendar', color: '#3B82F6' },
    { key: 'activeCleaners', label: 'Active Cleaners', icon: 'people', color: '#10B981' },
    { key: 'completedToday', label: 'Completed Today', icon: 'checkmark-circle', color: '#059669' },
    { key: 'recurringCustomers', label: 'Recurring Customers', icon: 'refresh', color: '#8B5CF6' },
    { key: 'avgRating', label: 'Avg Rating', icon: 'star', color: '#F59E0B', suffix: '/5' },
    { key: 'homesServiced', label: 'Homes Serviced', icon: 'home', color: '#6366F1' },
    { key: 'revenueToday', label: "Today's Revenue", icon: 'cash', color: '#10B981', type: 'currency' },
    { key: 'avgCleaningTime', label: 'Avg Cleaning Time', icon: 'time', color: '#F97316', suffix: ' hrs' },
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

export interface BookingCalendarCleaningOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateBookingCalendarCleaning(options: BookingCalendarCleaningOptions = {}): string {
  const { componentName = 'BookingCalendarCleaning', endpoint = '/cleaning/bookings' } = options;

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
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['cleaning-bookings', currentDate.getMonth(), currentDate.getFullYear()],
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

  const getBookingsForDate = (date: Date) => {
    return (bookings || []).filter((booking: any) => {
      const bookingDate = new Date(booking.scheduled_date || booking.date);
      return (
        bookingDate.getFullYear() === date.getFullYear() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getDate() === date.getDate()
      );
    });
  };

  const getBookingColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'deep_clean':
        return '#8B5CF6';
      case 'move_out':
        return '#F97316';
      case 'recurring':
        return '#10B981';
      default:
        return '#3B82F6';
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
        <View style={styles.titleRow}>
          <Text style={styles.title}>
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
              <Text style={styles.todayText}>Today</Text>
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
          onPress={() => navigation.navigate('NewBooking' as never)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>New Booking</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Standard</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>Deep Clean</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Recurring</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
          <Text style={styles.legendText}>Move Out</Text>
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, idx) => {
            const dayBookings = getBookingsForDate(day.date);
            return (
              <View
                key={idx}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.otherMonthCell,
                ]}
              >
                <View style={[
                  styles.dayNumber,
                  isToday(day.date) && styles.todayNumber,
                ]}>
                  <Text style={[
                    styles.dayText,
                    isToday(day.date) && styles.todayDayText,
                    !day.isCurrentMonth && styles.otherMonthText,
                  ]}>
                    {day.date.getDate()}
                  </Text>
                </View>
                {dayBookings.slice(0, 2).map((booking: any) => (
                  <TouchableOpacity
                    key={booking.id}
                    style={[styles.bookingItem, { borderLeftColor: getBookingColor(booking.cleaning_type || booking.type) }]}
                    onPress={() => setSelectedBooking(booking)}
                  >
                    <Text style={styles.bookingText} numberOfLines={1}>
                      {booking.scheduled_time || booking.time}
                    </Text>
                  </TouchableOpacity>
                ))}
                {dayBookings.length > 2 && (
                  <Text style={styles.moreText}>+{dayBookings.length - 2} more</Text>
                )}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {selectedBooking && (
              <View style={styles.modalBody}>
                <View style={styles.modalRow}>
                  <Ionicons name="person" size={20} color="#6B7280" />
                  <View style={styles.modalRowContent}>
                    <Text style={styles.modalLabel}>{selectedBooking.customer_name}</Text>
                    <Text style={styles.modalSubtext}>{selectedBooking.customer_phone}</Text>
                  </View>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="home" size={20} color="#6B7280" />
                  <View style={styles.modalRowContent}>
                    <Text style={styles.modalLabel}>{selectedBooking.address}</Text>
                    <Text style={styles.modalSubtext}>
                      {selectedBooking.property_size || 'Standard'} | {selectedBooking.bedrooms || 0} bed, {selectedBooking.bathrooms || 0} bath
                    </Text>
                  </View>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="calendar" size={20} color="#6B7280" />
                  <Text style={styles.modalLabel}>
                    {new Date(selectedBooking.scheduled_date || selectedBooking.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="time" size={20} color="#6B7280" />
                  <Text style={styles.modalLabel}>
                    {selectedBooking.scheduled_time || selectedBooking.time} ({selectedBooking.duration || 2} hours)
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => {
                  setSelectedBooking(null);
                  navigation.navigate('BookingDetail' as never, { id: selectedBooking?.id } as never);
                }}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedBooking(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
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
    padding: 16,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
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
  },
  todayText: {
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
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  weekdayRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekdayCell: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  dayNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  todayNumber: {
    backgroundColor: '#3B82F6',
  },
  dayText: {
    fontSize: 12,
    color: '#111827',
  },
  todayDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  otherMonthText: {
    color: '#9CA3AF',
  },
  bookingItem: {
    backgroundColor: '#F3F4F6',
    borderLeftWidth: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 2,
    borderRadius: 2,
  },
  bookingText: {
    fontSize: 10,
    color: '#374151',
  },
  moreText: {
    fontSize: 10,
    color: '#6B7280',
    paddingLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    gap: 16,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  modalRowContent: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 15,
    color: '#111827',
  },
  modalSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  closeButtonText: {
    color: '#374151',
  },
});

export default ${componentName};
`;
}

export interface CleanerProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCleanerProfile(options: CleanerProfileOptions = {}): string {
  const { componentName = 'CleanerProfile', endpoint = '/cleaning/cleaners' } = options;

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
  cleanerId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ cleanerId: propId }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const cleanerId = propId || (route.params as any)?.id;

  const { data: cleaner, isLoading } = useQuery({
    queryKey: ['cleaner', cleanerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${cleanerId}\`);
      return response?.data || response;
    },
    enabled: !!cleanerId,
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['cleaner-bookings', cleanerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${cleanerId}/bookings?limit=5\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!cleanerId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['cleaner-reviews', cleanerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${cleanerId}/reviews?limit=3\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!cleanerId,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!cleaner) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Cleaner not found</Text>
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
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#10B981" />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{cleaner.name}</Text>
              {cleaner.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={styles.ratingText}>{cleaner.rating || 0}</Text>
              <Text style={styles.reviewCount}>({cleaner.review_count || 0} reviews)</Text>
            </View>
          </View>
        </View>

        <View style={styles.contactInfo}>
          <View style={styles.contactRow}>
            <Ionicons name="call" size={16} color="#6B7280" />
            <Text style={styles.contactText}>{cleaner.phone || 'No phone'}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="mail" size={16} color="#6B7280" />
            <Text style={styles.contactText}>{cleaner.email || 'No email'}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="location" size={16} color="#6B7280" />
            <Text style={styles.contactText}>{cleaner.service_area || 'All areas'}</Text>
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{cleaner.total_cleanings || 0}</Text>
            <Text style={styles.statLabel}>Total Cleanings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{cleaner.this_month || 0}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{cleaner.on_time_rate || 100}%</Text>
            <Text style={styles.statLabel}>On-Time Rate</Text>
          </View>
        </View>
      </View>

      {/* Specialties */}
      {cleaner.specialties && cleaner.specialties.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.tagsContainer}>
            {cleaner.specialties.map((specialty: string, i: number) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Bookings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentBookings && recentBookings.length > 0 ? (
          recentBookings.map((booking: any) => (
            <View key={booking.id} style={styles.bookingItem}>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingName}>{booking.customer_name}</Text>
                <Text style={styles.bookingDate}>
                  {new Date(booking.date).toLocaleDateString()} at {booking.time}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: booking.status === 'completed' ? '#D1FAE5' : '#DBEAFE' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: booking.status === 'completed' ? '#065F46' : '#1E40AF' }
                ]}>
                  {booking.status}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>No recent bookings</Text>
          </View>
        )}
      </View>

      {/* Recent Reviews */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {reviews && reviews.length > 0 ? (
          reviews.map((review: any) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.customer_name}</Text>
                <View style={styles.starsRow}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < review.rating ? 'star' : 'star-outline'}
                      size={14}
                      color={i < review.rating ? '#F59E0B' : '#D1D5DB'}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>No reviews yet</Text>
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
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
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#065F46',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactInfo: {
    marginTop: 16,
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#1E40AF',
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  bookingDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
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
  reviewItem: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptySectionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}

export interface CleanerScheduleOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCleanerSchedule(options: CleanerScheduleOptions = {}): string {
  const { componentName = 'CleanerSchedule', endpoint = '/cleaning/cleaners' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  cleanerId?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

const ${componentName}: React.FC<${componentName}Props> = ({ cleanerId: propId }) => {
  const route = useRoute();
  const cleanerId = propId || (route.params as any)?.id;
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['cleaner-schedule', cleanerId, weekStart.toISOString()],
    queryFn: async () => {
      const start = weekStart.toISOString();
      const end = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const response = await api.get<any>(\`${endpoint}/\${cleanerId}/schedule?start=\${start}&end=\${end}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!cleanerId,
  });

  const getBookingsForDateTime = (date: Date, hour: number) => {
    return (schedule || []).filter((booking: any) => {
      const bookingDate = new Date(booking.scheduled_date || booking.date);
      const bookingHour = parseInt(booking.scheduled_time?.split(':')[0] || booking.start_hour || '0');
      return (
        bookingDate.toDateString() === date.toDateString() &&
        bookingHour === hour
      );
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const formatHour = (hour: number) => {
    return hour > 12 ? \`\${hour - 12}:00 PM\` : \`\${hour}:00 AM\`;
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
        <Text style={styles.title}>Weekly Schedule</Text>
        <View style={styles.navButtons}>
          <TouchableOpacity
            onPress={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentDate(new Date())}
            style={styles.thisWeekButton}
          >
            <Text style={styles.thisWeekText}>This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Day Headers */}
          <View style={styles.dayHeaderRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Time</Text>
            </View>
            {weekDays.map((day, i) => (
              <View
                key={i}
                style={[styles.dayHeader, isToday(day) && styles.todayHeader]}
              >
                <Text style={styles.dayName}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dayDate, isToday(day) && styles.todayDate]}>
                  {day.getDate()}
                </Text>
              </View>
            ))}
          </View>

          {/* Time Slots */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {HOURS.map((hour) => (
              <View key={hour} style={styles.timeSlotRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{formatHour(hour)}</Text>
                </View>
                {weekDays.map((day, i) => {
                  const bookings = getBookingsForDateTime(day, hour);
                  return (
                    <View
                      key={i}
                      style={[styles.slotCell, isToday(day) && styles.todayCell]}
                    >
                      {bookings.map((booking: any) => (
                        <View key={booking.id} style={styles.bookingCard}>
                          <Text style={styles.bookingCustomer} numberOfLines={1}>
                            {booking.customer_name}
                          </Text>
                          <View style={styles.bookingMeta}>
                            <Ionicons name="time" size={10} color="#10B981" />
                            <Text style={styles.bookingDuration}>{booking.duration || 2}h</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButton: {
    padding: 8,
  },
  thisWeekButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  thisWeekText: {
    fontSize: 14,
    color: '#374151',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeColumn: {
    width: 70,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    justifyContent: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  dayHeader: {
    width: 100,
    padding: 8,
    alignItems: 'center',
  },
  todayHeader: {
    backgroundColor: '#EFF6FF',
  },
  dayName: {
    fontSize: 12,
    color: '#6B7280',
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  todayDate: {
    color: '#3B82F6',
  },
  timeSlotRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  slotCell: {
    width: 100,
    minHeight: 60,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  todayCell: {
    backgroundColor: '#EFF6FF50',
  },
  bookingCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 4,
    padding: 4,
    marginBottom: 2,
  },
  bookingCustomer: {
    fontSize: 11,
    fontWeight: '500',
    color: '#065F46',
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  bookingDuration: {
    fontSize: 10,
    color: '#10B981',
  },
});

export default ${componentName};
`;
}

export interface CustomerProfileCleaningOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileCleaning(options: CustomerProfileCleaningOptions = {}): string {
  const { componentName = 'CustomerProfileCleaning', endpoint = '/cleaning/customers' } = options;

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
    queryKey: ['cleaning-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: bookingHistory } = useQuery({
    queryKey: ['cleaning-customer-bookings', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/bookings\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

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

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: '#D1FAE5', text: '#065F46' };
      default:
        return { bg: '#DBEAFE', text: '#1E40AF' };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewBooking' as never, { customer: customerId } as never)}
            style={styles.bookButton}
          >
            <Ionicons name="calendar" size={18} color="#3B82F6" />
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create" size={20} color="#FFFFFF" />
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
            <View style={styles.nameRow}>
              <Text style={styles.name}>{customer.name}</Text>
              {customer.recurring && (
                <View style={styles.recurringBadge}>
                  <Ionicons name="refresh" size={14} color="#10B981" />
                  <Text style={styles.recurringText}>Recurring</Text>
                </View>
              )}
            </View>
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="call" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{customer.phone || 'No phone'}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{customer.email || 'No email'}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="location" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{customer.address || 'No address'}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="home" size={14} color="#6B7280" />
                <Text style={styles.contactText}>
                  {customer.property_size || 'Standard'} | {customer.bedrooms || 0} bed, {customer.bathrooms || 0} bath
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.total_bookings || 0}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              \${(customer.total_spent || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.ratingValue}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.statValue}>{customer.avg_rating || '-'}</Text>
            </View>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      </View>

      {/* Preferences */}
      {customer.preferences && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferencesGrid}>
            {customer.preferences.preferred_day && (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Preferred Day</Text>
                <Text style={styles.preferenceValue}>{customer.preferences.preferred_day}</Text>
              </View>
            )}
            {customer.preferences.preferred_time && (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Preferred Time</Text>
                <Text style={styles.preferenceValue}>{customer.preferences.preferred_time}</Text>
              </View>
            )}
            {customer.preferences.cleaning_products && (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Products</Text>
                <Text style={styles.preferenceValue}>{customer.preferences.cleaning_products}</Text>
              </View>
            )}
            {customer.preferences.preferred_cleaner && (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Preferred Cleaner</Text>
                <Text style={styles.preferenceValue}>{customer.preferences.preferred_cleaner}</Text>
              </View>
            )}
          </View>
          {customer.preferences.special_instructions && (
            <View style={styles.specialInstructions}>
              <Text style={styles.preferenceLabel}>Special Instructions</Text>
              <Text style={styles.instructionsText}>{customer.preferences.special_instructions}</Text>
            </View>
          )}
        </View>
      )}

      {/* Booking History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Booking History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {bookingHistory && bookingHistory.length > 0 ? (
          bookingHistory.slice(0, 5).map((booking: any) => {
            const statusStyle = getStatusStyle(booking.status);
            return (
              <TouchableOpacity key={booking.id} style={styles.bookingItem}>
                <View style={[
                  styles.bookingIcon,
                  { backgroundColor: booking.status === 'completed' ? '#D1FAE5' : '#DBEAFE' }
                ]}>
                  <Ionicons
                    name={booking.status === 'completed' ? 'checkmark-circle' : 'calendar'}
                    size={20}
                    color={booking.status === 'completed' ? '#10B981' : '#3B82F6'}
                  />
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingType}>
                    {booking.cleaning_type || 'Standard Cleaning'}
                  </Text>
                  <Text style={styles.bookingMeta}>
                    {new Date(booking.date).toLocaleDateString()} at {booking.time}
                    {booking.cleaner_name && \` - by \${booking.cleaner_name}\`}
                  </Text>
                </View>
                <View style={styles.bookingRight}>
                  <Text style={styles.bookingPrice}>\${booking.price || 0}</Text>
                  {booking.rating && (
                    <View style={styles.bookingRating}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.bookingRatingText}>{booking.rating}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="calendar" size={48} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No booking history</Text>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  bookButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  recurringText: {
    fontSize: 12,
    color: '#065F46',
  },
  contactInfo: {
    marginTop: 12,
    gap: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
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
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceItem: {
    width: '50%',
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  specialInstructions: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  instructionsText: {
    fontSize: 14,
    color: '#111827',
    marginTop: 4,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  bookingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingType: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  bookingMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  bookingRight: {
    alignItems: 'flex-end',
  },
  bookingPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  bookingRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bookingRatingText: {
    fontSize: 12,
    color: '#6B7280',
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
