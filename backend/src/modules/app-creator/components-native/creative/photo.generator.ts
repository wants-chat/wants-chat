/**
 * Photo Component Generators for React Native Creative/Design Apps
 *
 * Generates photography-related components including:
 * - PhotoStats - Statistics dashboard for photographers
 * - BookingCalendarPhoto - Booking calendar for photo sessions
 * - ClientProfilePhoto - Client profile for photography business
 */

export interface PhotoGeneratorOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate PhotoStats component for React Native
 */
export function generatePhotoStats(options: PhotoGeneratorOptions = {}): string {
  const {
    componentName = 'PhotoStats',
    endpoint = '/photography/stats',
    queryKey = 'photo-stats',
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  photographerId?: string;
  style?: any;
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ photographerId, style }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', photographerId, timeRange],
    queryFn: async () => {
      let url = '${endpoint}?period=' + timeRange;
      if (photographerId) url += '&photographer_id=' + photographerId;
      const response = await api.get<any>(url);
      return response?.data || response || {};
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Text style={styles.errorText}>Failed to load statistics</Text>
      </View>
    );
  }

  const mainStats = [
    {
      label: 'Total Sessions',
      value: stats?.totalSessions || 0,
      change: stats?.sessionsChange,
      icon: 'camera-outline' as const,
      color: '#2563EB',
      bgColor: '#DBEAFE',
    },
    {
      label: 'Total Clients',
      value: stats?.totalClients || 0,
      change: stats?.clientsChange,
      icon: 'people-outline' as const,
      color: '#7C3AED',
      bgColor: '#EDE9FE',
    },
    {
      label: 'Photos Delivered',
      value: (stats?.photosDelivered || 0).toLocaleString(),
      change: stats?.photosChange,
      icon: 'images-outline' as const,
      color: '#059669',
      bgColor: '#D1FAE5',
    },
    {
      label: 'Revenue',
      value: '$' + (stats?.revenue || 0).toLocaleString(),
      change: stats?.revenueChange,
      icon: 'cash-outline' as const,
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
  ];

  const secondaryStats = [
    {
      label: 'Upcoming Sessions',
      value: stats?.upcomingSessions || 0,
      icon: 'calendar-outline' as const,
      color: '#F97316',
    },
    {
      label: 'Avg. Rating',
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : '-',
      icon: 'star-outline' as const,
      color: '#EAB308',
    },
    {
      label: 'Avg. Duration',
      value: stats?.avgDuration ? stats.avgDuration + ' hrs' : '-',
      icon: 'time-outline' as const,
      color: '#6366F1',
    },
    {
      label: 'Repeat Clients',
      value: stats?.repeatClients ? stats.repeatClients + '%' : '-',
      icon: 'trending-up-outline' as const,
      color: '#EC4899',
    },
  ];

  const portfolioStats = [
    { label: 'Total Views', value: stats?.portfolioViews || 0, icon: 'eye-outline' as const },
    { label: 'Total Likes', value: stats?.portfolioLikes || 0, icon: 'heart-outline' as const },
    { label: 'Downloads', value: stats?.portfolioDownloads || 0, icon: 'download-outline' as const },
  ];

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Photography Dashboard</Text>
          <Text style={styles.subtitle}>Track your photography business performance</Text>
        </View>
      </View>

      {/* Time Range Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timeRangeContainer}
        contentContainerStyle={styles.timeRangeContent}
      >
        {timeRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timeRangeButton,
              timeRange === option.value && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange(option.value)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === option.value && styles.timeRangeTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Stats */}
      <View style={styles.mainStatsGrid}>
        {mainStats.map((stat, index) => (
          <View key={index} style={styles.mainStatCard}>
            <View style={styles.mainStatHeader}>
              <View style={[styles.mainStatIcon, { backgroundColor: stat.bgColor }]}>
                <Ionicons name={stat.icon} size={24} color={stat.color} />
              </View>
              {stat.change !== undefined && (
                <View style={styles.changeContainer}>
                  <Ionicons
                    name={stat.change >= 0 ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={stat.change >= 0 ? '#059669' : '#DC2626'}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      { color: stat.change >= 0 ? '#059669' : '#DC2626' },
                    ]}
                  >
                    {Math.abs(stat.change)}%
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.mainStatValue}>{stat.value}</Text>
            <Text style={styles.mainStatLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Secondary Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Metrics</Text>
        <View style={styles.secondaryStatsGrid}>
          {secondaryStats.map((stat, index) => (
            <View key={index} style={styles.secondaryStatCard}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <View style={styles.secondaryStatInfo}>
                <Text style={styles.secondaryStatValue}>{stat.value}</Text>
                <Text style={styles.secondaryStatLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Portfolio Engagement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio Engagement</Text>
        {portfolioStats.map((stat, index) => {
          const maxValue = stats?.portfolioViews || 1;
          const percentage = Math.min((stat.value / maxValue) * 100, 100);
          return (
            <View key={index} style={styles.portfolioStatRow}>
              <View style={styles.portfolioStatHeader}>
                <View style={styles.portfolioStatLeft}>
                  <Ionicons name={stat.icon} size={16} color="#6B7280" />
                  <Text style={styles.portfolioStatLabel}>{stat.label}</Text>
                </View>
                <Text style={styles.portfolioStatValue}>{stat.value.toLocaleString()}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: percentage + '%' }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Recent Sessions */}
      {stats?.recentSessions && stats.recentSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {stats.recentSessions.slice(0, 5).map((session: any, index: number) => (
            <View key={session.id || index} style={styles.sessionItem}>
              <View style={styles.sessionLeft}>
                <View style={styles.sessionAvatar}>
                  {session.client_avatar ? (
                    <Image source={{ uri: session.client_avatar }} style={styles.sessionAvatarImage} />
                  ) : (
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                  )}
                </View>
                <View>
                  <Text style={styles.sessionClientName}>{session.client_name || 'Client'}</Text>
                  <Text style={styles.sessionType}>{session.session_type || 'Photo Session'}</Text>
                </View>
              </View>
              <View style={styles.sessionRight}>
                <Text style={styles.sessionDate}>
                  {session.date ? new Date(session.date).toLocaleDateString() : ''}
                </Text>
                {session.status && (
                  <View
                    style={[
                      styles.sessionStatusBadge,
                      {
                        backgroundColor:
                          session.status === 'completed'
                            ? '#D1FAE5'
                            : session.status === 'upcoming'
                            ? '#DBEAFE'
                            : '#F3F4F6',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sessionStatusText,
                        {
                          color:
                            session.status === 'completed'
                              ? '#059669'
                              : session.status === 'upcoming'
                              ? '#2563EB'
                              : '#6B7280',
                        },
                      ]}
                    >
                      {session.status}
                    </Text>
                  </View>
                )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  timeRangeContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  timeRangeContent: {
    paddingHorizontal: 16,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: '#2563EB',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  mainStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  mainStatCard: {
    width: '50%',
    padding: 8,
  },
  mainStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mainStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
  mainStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  secondaryStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  secondaryStatCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  secondaryStatInfo: {
    flex: 1,
  },
  secondaryStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  secondaryStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  portfolioStatRow: {
    marginBottom: 16,
  },
  portfolioStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  portfolioStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portfolioStatLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  portfolioStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sessionAvatarImage: {
    width: '100%',
    height: '100%',
  },
  sessionClientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  sessionType: {
    fontSize: 12,
    color: '#6B7280',
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  sessionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  sessionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  sessionStatusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default ${componentName};
`;
}

/**
 * Generate BookingCalendarPhoto component for React Native
 */
export function generateBookingCalendarPhoto(options: PhotoGeneratorOptions = {}): string {
  const {
    componentName = 'BookingCalendarPhoto',
    endpoint = '/photography/bookings',
    queryKey = 'photo-bookings',
  } = options;

  return `import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Booking {
  id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  session_type: string;
  date: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  location?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price?: number;
}

interface ${componentName}Props {
  photographerId?: string;
  onBookingPress?: (booking: Booking) => void;
  onNewBooking?: (date: Date) => void;
  style?: any;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  photographerId,
  onBookingPress,
  onNewBooking,
  style,
}) => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['${queryKey}', photographerId, year, month],
    queryFn: async () => {
      let url = '${endpoint}?year=' + year + '&month=' + (month + 1);
      if (photographerId) url += '&photographer_id=' + photographerId;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const confirmBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await api.put('${endpoint}/' + bookingId, { status: 'confirmed' });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
      setShowBookingDetail(false);
    },
  });

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfWeek }, () => null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    bookings.forEach((booking: Booking) => {
      const dateKey = new Date(booking.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(booking);
    });
    return grouped;
  }, [bookings]);

  const getDateKey = (day: number) => {
    return new Date(year, month, day).toISOString().split('T')[0];
  };

  const getDayBookings = (day: number) => {
    return bookingsByDate[getDateKey(day)] || [];
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const handleDayPress = useCallback((day: number) => {
    setSelectedDate(new Date(year, month, day));
  }, [year, month]);

  const handleBookingPress = useCallback((booking: Booking) => {
    if (onBookingPress) {
      onBookingPress(booking);
    } else {
      setSelectedBooking(booking);
      setShowBookingDetail(true);
    }
  }, [onBookingPress]);

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
    confirmed: { bg: '#D1FAE5', text: '#059669', dot: '#10B981' },
    completed: { bg: '#DBEAFE', text: '#2563EB', dot: '#3B82F6' },
    cancelled: { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Calendar Header */}
      <View style={styles.calendarHeader}>
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentDate(new Date(year, month - 1, 1))}
          >
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthNames[month]} {year}</Text>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentDate(new Date(year, month + 1, 1))}
          >
            <Ionicons name="chevron-forward" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.todayButton}
            onPress={() => setCurrentDate(new Date())}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
          {onNewBooking && (
            <TouchableOpacity
              style={styles.newBookingButton}
              onPress={() => onNewBooking(selectedDate || new Date())}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Week Day Headers */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {[...paddingDays, ...days].map((day, index) => {
          if (!day) {
            return <View key={'pad-' + index} style={styles.dayCell} />;
          }

          const dayBookings = getDayBookings(day);
          const hasBookings = dayBookings.length > 0;

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayCell,
                isSelected(day) && styles.dayCellSelected,
                isToday(day) && styles.dayCellToday,
              ]}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayNumber,
                  isSelected(day) && styles.dayNumberSelected,
                  isToday(day) && styles.dayNumberToday,
                ]}
              >
                {day}
              </Text>
              {hasBookings && (
                <View style={styles.bookingIndicators}>
                  {dayBookings.slice(0, 3).map((booking, i) => (
                    <View
                      key={i}
                      style={[
                        styles.bookingDot,
                        { backgroundColor: statusColors[booking.status]?.dot || '#9CA3AF' },
                      ]}
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Day Bookings */}
      {selectedDate && (
        <View style={styles.selectedDaySection}>
          <Text style={styles.selectedDateTitle}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <ScrollView style={styles.bookingsList} showsVerticalScrollIndicator={false}>
            {getDayBookings(selectedDate.getDate()).length > 0 ? (
              getDayBookings(selectedDate.getDate()).map((booking) => (
                <TouchableOpacity
                  key={booking.id}
                  style={styles.bookingCard}
                  onPress={() => handleBookingPress(booking)}
                  activeOpacity={0.7}
                >
                  <View style={styles.bookingCardLeft}>
                    <View style={styles.bookingIcon}>
                      <Ionicons name="camera" size={20} color="#6B7280" />
                    </View>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingClientName}>{booking.client_name}</Text>
                      <Text style={styles.bookingSessionType}>{booking.session_type}</Text>
                      <View style={styles.bookingMeta}>
                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                        <Text style={styles.bookingMetaText}>
                          {booking.start_time}
                          {booking.end_time && ' - ' + booking.end_time}
                        </Text>
                      </View>
                      {booking.location && (
                        <View style={styles.bookingMeta}>
                          <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                          <Text style={styles.bookingMetaText}>{booking.location}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.bookingCardRight}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColors[booking.status]?.bg || '#F3F4F6' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: statusColors[booking.status]?.text || '#6B7280' },
                        ]}
                      >
                        {booking.status}
                      </Text>
                    </View>
                    {booking.price !== undefined && (
                      <Text style={styles.bookingPrice}>\${booking.price}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyDay}>
                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyDayText}>No bookings for this day</Text>
                {onNewBooking && (
                  <TouchableOpacity
                    style={styles.createBookingButton}
                    onPress={() => onNewBooking(selectedDate)}
                  >
                    <Text style={styles.createBookingText}>Create Booking</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Status:</Text>
        {Object.entries(statusColors).map(([status, colors]) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.dot }]} />
            <Text style={styles.legendText}>{status}</Text>
          </View>
        ))}
      </View>

      {/* Booking Detail Modal */}
      <Modal
        visible={showBookingDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookingDetail(false)}
      >
        {selectedBooking && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowBookingDetail(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Client</Text>
                <Text style={styles.detailValue}>{selectedBooking.client_name}</Text>
                {selectedBooking.client_email && (
                  <Text style={styles.detailSubValue}>{selectedBooking.client_email}</Text>
                )}
                {selectedBooking.client_phone && (
                  <Text style={styles.detailSubValue}>{selectedBooking.client_phone}</Text>
                )}
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Session Type</Text>
                <Text style={styles.detailValue}>{selectedBooking.session_type}</Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedBooking.date).toLocaleDateString()}
                </Text>
                <Text style={styles.detailSubValue}>
                  {selectedBooking.start_time}
                  {selectedBooking.end_time && ' - ' + selectedBooking.end_time}
                </Text>
              </View>
              {selectedBooking.location && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{selectedBooking.location}</Text>
                </View>
              )}
              {selectedBooking.price !== undefined && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Price</Text>
                  <Text style={styles.detailValue}>\${selectedBooking.price}</Text>
                </View>
              )}
              {selectedBooking.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.detailValue}>{selectedBooking.notes}</Text>
                </View>
              )}
              {selectedBooking.status === 'pending' && (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => confirmBooking.mutate(selectedBooking.id)}
                    disabled={confirmBooking.isPending}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineButton}>
                    <Ionicons name="close" size={20} color="#DC2626" />
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    minWidth: 150,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
  },
  todayButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  newBookingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
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
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayCellSelected: {
    backgroundColor: '#DBEAFE',
  },
  dayCellToday: {
    backgroundColor: '#F0F9FF',
  },
  dayNumber: {
    fontSize: 14,
    color: '#111827',
  },
  dayNumberSelected: {
    fontWeight: '700',
    color: '#2563EB',
  },
  dayNumberToday: {
    fontWeight: '600',
    color: '#2563EB',
  },
  bookingIndicators: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  bookingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  selectedDaySection: {
    flex: 1,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  bookingsList: {
    flex: 1,
  },
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  bookingCardLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  bookingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingClientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bookingSessionType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bookingCardRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  bookingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyDayText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  createBookingButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  createBookingText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
  },
  detailSubValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  modalActions: {
    marginTop: 24,
    gap: 12,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  declineButtonText: {
    color: '#DC2626',
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate ClientProfilePhoto component for React Native
 */
export function generateClientProfilePhoto(options: PhotoGeneratorOptions = {}): string {
  const {
    componentName = 'ClientProfilePhoto',
    endpoint = '/photography/clients',
    queryKey = 'photo-client',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Session {
  id: string;
  session_type: string;
  date: string;
  status: string;
  photos_count?: number;
  price?: number;
}

interface Gallery {
  id: string;
  name: string;
  thumbnail_url?: string;
  photos_count: number;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  address?: string;
  notes?: string;
  created_at?: string;
  stats?: {
    totalSessions: number;
    totalPhotos: number;
    totalSpent: number;
    lastSession?: string;
  };
  sessions?: Session[];
  galleries?: Gallery[];
  preferences?: {
    preferred_style?: string;
    preferred_locations?: string[];
    special_requests?: string;
  };
}

interface ${componentName}Props {
  clientId?: string;
  style?: any;
}

type TabType = 'overview' | 'sessions' | 'galleries' | 'preferences';

const ${componentName}: React.FC<${componentName}Props> = ({ clientId: propClientId, style }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id: paramId } = (route.params as { id?: string }) || {};
  const clientId = propClientId || paramId;

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', clientId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + clientId);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  const handleSessionPress = useCallback((sessionId: string) => {
    navigation.navigate('SessionDetail' as never, { id: sessionId } as never);
  }, [navigation]);

  const handleGalleryPress = useCallback((galleryId: string) => {
    navigation.navigate('GalleryDetail' as never, { id: galleryId } as never);
  }, [navigation]);

  const handleEmailPress = useCallback(() => {
    if (client?.email) {
      Linking.openURL('mailto:' + client.email);
    }
  }, [client?.email]);

  const handlePhonePress = useCallback(() => {
    if (client?.phone) {
      Linking.openURL('tel:' + client.phone);
    }
  }, [client?.phone]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'sessions', label: 'Sessions', count: client?.sessions?.length },
    { id: 'galleries', label: 'Galleries', count: client?.galleries?.length },
    { id: 'preferences', label: 'Preferences' },
  ];

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#FEF3C7', text: '#D97706' },
    confirmed: { bg: '#DBEAFE', text: '#2563EB' },
    completed: { bg: '#D1FAE5', text: '#059669' },
    cancelled: { bg: '#FEE2E2', text: '#DC2626' },
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !client) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
        <Text style={styles.errorText}>Client not found</Text>
      </View>
    );
  }

  const renderSession = ({ item }: { item: Session }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => handleSessionPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.sessionIcon}>
        <Ionicons name="camera" size={24} color="#2563EB" />
      </View>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionType}>{item.session_type}</Text>
        <Text style={styles.sessionDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.sessionRight}>
        {item.photos_count !== undefined && (
          <View style={styles.photoCount}>
            <Ionicons name="images-outline" size={14} color="#6B7280" />
            <Text style={styles.photoCountText}>{item.photos_count}</Text>
          </View>
        )}
        {item.price !== undefined && (
          <Text style={styles.sessionPrice}>\${item.price}</Text>
        )}
        <View
          style={[
            styles.sessionStatusBadge,
            { backgroundColor: statusColors[item.status]?.bg || '#F3F4F6' },
          ]}
        >
          <Text
            style={[
              styles.sessionStatusText,
              { color: statusColors[item.status]?.text || '#6B7280' },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGallery = ({ item }: { item: Gallery }) => (
    <TouchableOpacity
      style={styles.galleryCard}
      onPress={() => handleGalleryPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.galleryThumbnail}>
        {item.thumbnail_url ? (
          <Image source={{ uri: item.thumbnail_url }} style={styles.galleryImage} />
        ) : (
          <Ionicons name="folder-outline" size={32} color="#9CA3AF" />
        )}
      </View>
      <Text style={styles.galleryName}>{item.name}</Text>
      <View style={styles.galleryMeta}>
        <View style={styles.galleryMetaItem}>
          <Ionicons name="images-outline" size={12} color="#6B7280" />
          <Text style={styles.galleryMetaText}>{item.photos_count}</Text>
        </View>
        <Text style={styles.galleryDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileTop}>
          <View style={styles.avatarContainer}>
            {client.avatar_url ? (
              <Image source={{ uri: client.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(client.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.clientName}>{client.name}</Text>
            {client.email && (
              <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
                <Ionicons name="mail-outline" size={16} color="#6B7280" />
                <Text style={styles.contactText}>{client.email}</Text>
              </TouchableOpacity>
            )}
            {client.phone && (
              <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
                <Ionicons name="call-outline" size={16} color="#6B7280" />
                <Text style={styles.contactText}>{client.phone}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {client.address && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.addressText}>{client.address}</Text>
          </View>
        )}

        {client.created_at && (
          <Text style={styles.clientSince}>
            Client since {formatDate(client.created_at)}
          </Text>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Book Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="create-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      {client.stats && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="camera" size={20} color="#2563EB" />
            <Text style={styles.statValue}>{client.stats.totalSessions || 0}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="images" size={20} color="#7C3AED" />
            <Text style={styles.statValue}>{client.stats.totalPhotos || 0}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={20} color="#059669" />
            <Text style={styles.statValue}>\${(client.stats.totalSpent || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={20} color="#F97316" />
            <Text style={styles.statValue}>
              {client.stats.lastSession
                ? new Date(client.stats.lastSession).toLocaleDateString()
                : '-'}
            </Text>
            <Text style={styles.statLabel}>Last Session</Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.count !== undefined && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'overview' && (
          <View>
            {client.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{client.notes}</Text>
                </View>
              </View>
            )}
            {client.sessions && client.sessions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Sessions</Text>
                {client.sessions.slice(0, 3).map((session) => renderSession({ item: session }))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'sessions' && (
          <View>
            {client.sessions && client.sessions.length > 0 ? (
              <FlatList
                data={client.sessions}
                renderItem={renderSession}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="camera-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No sessions yet</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'galleries' && (
          <View>
            {client.galleries && client.galleries.length > 0 ? (
              <FlatList
                data={client.galleries}
                renderItem={renderGallery}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.galleryRow}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No galleries yet</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'preferences' && (
          <View>
            {client.preferences ? (
              <View style={styles.preferencesContent}>
                {client.preferences.preferred_style && (
                  <View style={styles.preferenceSection}>
                    <Text style={styles.preferenceLabel}>Preferred Style</Text>
                    <Text style={styles.preferenceValue}>{client.preferences.preferred_style}</Text>
                  </View>
                )}
                {client.preferences.preferred_locations &&
                  client.preferences.preferred_locations.length > 0 && (
                    <View style={styles.preferenceSection}>
                      <Text style={styles.preferenceLabel}>Preferred Locations</Text>
                      <View style={styles.locationTags}>
                        {client.preferences.preferred_locations.map((location, index) => (
                          <View key={index} style={styles.locationTag}>
                            <Text style={styles.locationTagText}>{location}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                {client.preferences.special_requests && (
                  <View style={styles.preferenceSection}>
                    <Text style={styles.preferenceLabel}>Special Requests</Text>
                    <View style={styles.notesBox}>
                      <Text style={styles.notesText}>{client.preferences.special_requests}</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="person-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No preferences recorded</Text>
              </View>
            )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#DC2626',
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileTop: {
    flexDirection: 'row',
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  clientSince: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  tabActive: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#2563EB',
  },
  tabBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  notesBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  sessionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  photoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoCountText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sessionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  sessionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  sessionStatusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  galleryRow: {
    justifyContent: 'space-between',
  },
  galleryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  galleryThumbnail: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    padding: 12,
    paddingBottom: 4,
  },
  galleryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  galleryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  galleryMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  galleryDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  preferencesContent: {
    gap: 20,
  },
  preferenceSection: {
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  preferenceValue: {
    fontSize: 16,
    color: '#111827',
  },
  locationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationTagText: {
    fontSize: 14,
    color: '#2563EB',
  },
  emptyState: {
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
