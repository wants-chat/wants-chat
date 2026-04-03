/**
 * Wedding Venue Component Generators (React Native)
 *
 * Generates venue-related components for wedding planning including calendar, stats, filters, and client profiles.
 * Uses React Native patterns with ScrollView, TouchableOpacity, and Modal interactions.
 */

export interface VenueOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateVenueCalendar(options: VenueOptions = {}): string {
  const { componentName = 'VenueCalendar', endpoint = '/venues/bookings' } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  venueId?: string;
  onBookingPress?: (booking: Booking) => void;
}

interface Booking {
  id: string;
  clientName?: string;
  title?: string;
  name?: string;
  date?: string;
  eventDate?: string;
  startDate?: string;
  time?: string;
  type?: string;
  eventType?: string;
  guestCount?: number;
  venue?: string;
  notes?: string;
  status?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BOOKING_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  wedding: { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3' },
  reception: { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE' },
  ceremony: { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE' },
  rehearsal: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  tasting: { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' },
  tour: { bg: '#CFFAFE', text: '#0891B2', border: '#A5F3FC' },
  default: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ venueId, onBookingPress }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['venue-bookings', venueId, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (venueId) params.append('venueId', venueId);
      params.append('month', String(currentDate.getMonth() + 1));
      params.append('year', String(currentDate.getFullYear()));
      const url = '${endpoint}?' + params.toString();
      const response = await api.get<any>(url);
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
      days.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const getBookingsForDate = (date: Date): Booking[] => {
    return (bookings || []).filter((booking: Booking) => {
      const bookingDate = new Date(booking.date || booking.eventDate || booking.startDate || '');
      return (
        bookingDate.getFullYear() === date.getFullYear() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getDate() === date.getDate()
      );
    });
  };

  const navigatePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const getBookingColor = (type?: string) => {
    return BOOKING_TYPE_COLORS[type?.toLowerCase() || ''] || BOOKING_TYPE_COLORS.default;
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
        <View style={styles.headerTop}>
          <Text style={styles.monthYear}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <View style={styles.navButtons}>
            <TouchableOpacity style={styles.navButton} onPress={navigatePrev}>
              <Ionicons name="chevron-back" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
              <Text style={styles.todayText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={navigateNext}>
              <Ionicons name="chevron-forward" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legend */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legend}>
          {Object.entries(BOOKING_TYPE_COLORS)
            .filter(([key]) => key !== 'default')
            .map(([type, colors]) => (
              <View key={type} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.bg }]} />
                <Text style={styles.legendText}>{type}</Text>
              </View>
            ))}
        </ScrollView>
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
      <ScrollView style={styles.calendarScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, idx) => {
            const dayBookings = getBookingsForDate(day.date);
            return (
              <View
                key={idx}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.dayCellInactive,
                ]}
              >
                <View
                  style={[
                    styles.dayNumber,
                    isToday(day.date) && styles.dayNumberToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !day.isCurrentMonth && styles.dayTextInactive,
                      isToday(day.date) && styles.dayTextToday,
                    ]}
                  >
                    {day.date.getDate()}
                  </Text>
                </View>
                <View style={styles.bookingsList}>
                  {dayBookings.slice(0, 2).map((booking, i) => {
                    const colors = getBookingColor(booking.type || booking.eventType);
                    return (
                      <TouchableOpacity
                        key={booking.id || i}
                        style={[
                          styles.bookingItem,
                          { backgroundColor: colors.bg, borderLeftColor: colors.text },
                        ]}
                        onPress={() => setSelectedBooking(booking)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[styles.bookingText, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {booking.clientName || booking.title || booking.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBooking && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <View
                      style={[
                        styles.modalTypeBadge,
                        {
                          backgroundColor: getBookingColor(
                            selectedBooking.type || selectedBooking.eventType
                          ).bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalTypeText,
                          {
                            color: getBookingColor(
                              selectedBooking.type || selectedBooking.eventType
                            ).text,
                          },
                        ]}
                      >
                        {selectedBooking.type || selectedBooking.eventType || 'Event'}
                      </Text>
                    </View>
                    <Text style={styles.modalTitle}>
                      {selectedBooking.clientName || selectedBooking.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedBooking(null)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.modalRowText}>
                      {new Date(
                        selectedBooking.date || selectedBooking.eventDate || ''
                      ).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  {selectedBooking.time && (
                    <View style={styles.modalRow}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text style={styles.modalRowText}>{selectedBooking.time}</Text>
                    </View>
                  )}
                  {selectedBooking.guestCount && (
                    <View style={styles.modalRow}>
                      <Ionicons name="people-outline" size={16} color="#6B7280" />
                      <Text style={styles.modalRowText}>
                        {selectedBooking.guestCount} guests
                      </Text>
                    </View>
                  )}
                  {selectedBooking.venue && (
                    <View style={styles.modalRow}>
                      <Ionicons name="location-outline" size={16} color="#6B7280" />
                      <Text style={styles.modalRowText}>{selectedBooking.venue}</Text>
                    </View>
                  )}
                  {selectedBooking.notes && (
                    <Text style={styles.modalNotes}>{selectedBooking.notes}</Text>
                  )}
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => {
                      setSelectedBooking(null);
                      onBookingPress?.(selectedBooking);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeModalButton}
                    onPress={() => setSelectedBooking(null)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.closeModalText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthYear: {
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
    borderRadius: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  todayText: {
    fontSize: 13,
    color: '#374151',
  },
  legend: {
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'capitalize',
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
    fontWeight: '600',
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
    width: \`\${100 / 7}%\`,
    minHeight: 80,
    padding: 4,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayCellInactive: {
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
  dayNumberToday: {
    backgroundColor: '#F43F5E',
  },
  dayText: {
    fontSize: 12,
    color: '#111827',
  },
  dayTextInactive: {
    color: '#9CA3AF',
  },
  dayTextToday: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookingsList: {
    gap: 2,
  },
  bookingItem: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderLeftWidth: 2,
  },
  bookingText: {
    fontSize: 10,
    fontWeight: '500',
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
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  modalTypeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    gap: 12,
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalRowText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalNotes: {
    fontSize: 14,
    color: '#6B7280',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#F43F5E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  closeModalText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export function generateVenueStats(options: VenueOptions = {}): string {
  const { componentName = 'VenueStats', endpoint = '/venues/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  venueId?: string;
}

interface StatItem {
  label: string;
  value: string | number;
  subtext: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  trend?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ venueId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['venue-stats', venueId],
    queryFn: async () => {
      const url = venueId ? '${endpoint}?venueId=' + venueId : '${endpoint}';
      const response = await api.get<any>(url);
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

  const statItems: StatItem[] = [
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      subtext: \`\${stats?.upcomingBookings || 0} upcoming\`,
      icon: 'calendar-outline',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      label: 'Revenue This Month',
      value: \`$\${(stats?.monthlyRevenue || 0).toLocaleString()}\`,
      subtext: stats?.revenueChange
        ? \`\${stats.revenueChange > 0 ? '+' : ''}\${stats.revenueChange}% vs last month\`
        : 'No data',
      icon: 'cash-outline',
      color: '#10B981',
      bgColor: '#D1FAE5',
      trend: stats?.revenueChange,
    },
    {
      label: 'Average Rating',
      value: stats?.averageRating?.toFixed(1) || '--',
      subtext: \`\${stats?.totalReviews || 0} reviews\`,
      icon: 'star-outline',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      label: 'Confirmed Events',
      value: stats?.confirmedEvents || 0,
      subtext: \`\${stats?.pendingEvents || 0} pending\`,
      icon: 'checkmark-circle-outline',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },
  ];

  return (
    <View style={styles.container}>
      {statItems.map((stat, index) => (
        <View key={index} style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
            <Ionicons name={stat.icon} size={24} color={stat.color} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <View style={styles.subtextRow}>
              {stat.trend !== undefined && (
                <Ionicons
                  name={stat.trend >= 0 ? 'trending-up-outline' : 'trending-down-outline'}
                  size={12}
                  color={stat.trend >= 0 ? '#10B981' : '#EF4444'}
                />
              )}
              <Text
                style={[
                  styles.statSubtext,
                  stat.trend !== undefined && {
                    color: stat.trend >= 0 ? '#10B981' : '#EF4444',
                  },
                ]}
              >
                {stat.subtext}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 2,
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}

export function generateBookingFiltersVenue(options: VenueOptions = {}): string {
  const { componentName = 'BookingFiltersVenue', endpoint = '/venues' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  search: string;
  venueId: string;
  eventType: string;
  status: string;
}

const EVENT_TYPES = [
  'All Types',
  'Wedding',
  'Reception',
  'Ceremony',
  'Rehearsal',
  'Tasting',
  'Tour',
];

const STATUS_OPTIONS = ['All Status', 'Confirmed', 'Pending', 'Cancelled', 'Completed'];

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    venueId: '',
    eventType: '',
    status: '',
  });

  const { data: venues } = useQuery({
    queryKey: ['venues-list'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      venueId: '',
      eventType: '',
      status: '',
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by client name, event..."
            placeholderTextColor="#9CA3AF"
            value={filters.search}
            onChangeText={(text) => updateFilter('search', text)}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterToggle, hasActiveFilters && styles.filterToggleActive]}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={hasActiveFilters ? '#F43F5E' : '#374151'}
          />
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={hasActiveFilters ? '#F43F5E' : '#374151'}
          />
        </TouchableOpacity>
      </View>

      {/* Expanded Filters */}
      {isExpanded && (
        <View style={styles.filtersContainer}>
          {/* Venue Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Venue</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterOptions}
            >
              <TouchableOpacity
                style={[styles.filterChip, !filters.venueId && styles.filterChipActive]}
                onPress={() => updateFilter('venueId', '')}
              >
                <Text
                  style={[styles.filterChipText, !filters.venueId && styles.filterChipTextActive]}
                >
                  All Venues
                </Text>
              </TouchableOpacity>
              {(venues || []).map((venue: any) => (
                <TouchableOpacity
                  key={venue.id}
                  style={[
                    styles.filterChip,
                    filters.venueId === venue.id && styles.filterChipActive,
                  ]}
                  onPress={() => updateFilter('venueId', venue.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.venueId === venue.id && styles.filterChipTextActive,
                    ]}
                  >
                    {venue.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Event Type Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Event Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterOptions}
            >
              {EVENT_TYPES.map((type) => {
                const value = type === 'All Types' ? '' : type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterChip,
                      filters.eventType === value && styles.filterChipActive,
                    ]}
                    onPress={() => updateFilter('eventType', value)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.eventType === value && styles.filterChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Status Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterOptions}
            >
              {STATUS_OPTIONS.map((status) => {
                const value = status === 'All Status' ? '' : status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      filters.status === value && styles.filterChipActive,
                    ]}
                    onPress={() => updateFilter('status', value)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.status === value && styles.filterChipTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={16} color="#6B7280" />
              <Text style={styles.clearButtonText}>Clear all filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#111827',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterToggleActive: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
  },
  filtersContainer: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#F43F5E',
  },
  filterChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateClientProfileVenue(options: VenueOptions = {}): string {
  const { componentName = 'ClientProfileVenue', endpoint = '/venues/clients' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  clientId: string;
  onEditPress?: () => void;
}

interface ClientEvent {
  id: string;
  title?: string;
  type?: string;
  date: string;
  time?: string;
  status?: string;
}

interface Client {
  id: string;
  name: string;
  partnerName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  weddingDate?: string;
  totalSpend?: number;
  guestCount?: number;
  events?: ClientEvent[];
  notes?: string;
  preferences?: string;
  createdAt?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ clientId, onEditPress }) => {
  const { data: client, isLoading } = useQuery({
    queryKey: ['venue-client', clientId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + clientId);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Client not found</Text>
      </View>
    );
  }

  const upcomingEvents = (client.events || []).filter(
    (e: ClientEvent) => new Date(e.date) >= new Date()
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerBanner} />
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {client.avatar ? (
              <Image source={{ uri: client.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color="#9CA3AF" />
              </View>
            )}
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <View>
                <Text style={styles.clientName}>{client.name}</Text>
                <View style={styles.partnerRow}>
                  <Ionicons name="heart" size={14} color="#F43F5E" />
                  <Text style={styles.partnerText}>
                    {client.partnerName ? \`& \${client.partnerName}\` : 'Wedding Planning'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={onEditPress}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactGrid}>
            <View style={styles.contactItem}>
              <View style={[styles.contactIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="mail-outline" size={18} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{client.email}</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <View style={[styles.contactIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="call-outline" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{client.phone || 'Not provided'}</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <View style={[styles.contactIcon, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="calendar-outline" size={18} color="#8B5CF6" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Wedding Date</Text>
                <Text style={styles.contactValue}>
                  {client.weddingDate
                    ? new Date(client.weddingDate).toLocaleDateString()
                    : 'TBD'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FFE4E6' }]}>
            <Ionicons name="cash-outline" size={20} color="#F43F5E" />
          </View>
          <Text style={styles.statLabel}>Total Spend</Text>
          <Text style={styles.statValue}>
            \${(client.totalSpend || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="people-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statLabel}>Guest Count</Text>
          <Text style={styles.statValue}>{client.guestCount || '--'}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="document-text-outline" size={20} color="#10B981" />
          </View>
          <Text style={styles.statLabel}>Bookings</Text>
          <Text style={styles.statValue}>{client.events?.length || 0}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.statLabel}>Client Since</Text>
          <Text style={styles.statValue}>
            {client.createdAt
              ? new Date(client.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : '--'}
          </Text>
        </View>
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={18} color="#F43F5E" />
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
        </View>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event: ClientEvent) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title || event.type}</Text>
                <View style={styles.eventMeta}>
                  <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                  <Text style={styles.eventMetaText}>
                    {new Date(event.date).toLocaleDateString()}
                    {event.time && \` at \${event.time}\`}
                  </Text>
                </View>
              </View>
              <View style={styles.eventStatus}>
                <Text style={styles.eventStatusText}>{event.status || 'Confirmed'}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>No upcoming events</Text>
          </View>
        )}
      </View>

      {/* Notes & Preferences */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="chatbox-ellipses-outline" size={18} color="#F43F5E" />
          <Text style={styles.sectionTitle}>Notes & Preferences</Text>
        </View>
        {client.notes ? (
          <Text style={styles.notesText}>{client.notes}</Text>
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>No notes yet</Text>
          </View>
        )}

        {client.preferences && (
          <View style={styles.preferencesContainer}>
            <Text style={styles.preferencesTitle}>Preferences</Text>
            <View style={styles.preferencesTags}>
              {client.preferences.split(',').map((pref: string, i: number) => (
                <View key={i} style={styles.preferenceTag}>
                  <Text style={styles.preferenceTagText}>{pref.trim()}</Text>
                </View>
              ))}
            </View>
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
    paddingVertical: 48,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerBanner: {
    height: 80,
    backgroundColor: '#F43F5E',
  },
  headerContent: {
    padding: 16,
    marginTop: -40,
  },
  avatarContainer: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  partnerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F43F5E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  contactGrid: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventStatus: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  eventStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#059669',
  },
  emptySection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 13,
    color: '#6B7280',
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  preferencesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  preferencesTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  preferencesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  preferenceTagText: {
    fontSize: 12,
    color: '#F43F5E',
  },
});

export default ${componentName};
`;
}
