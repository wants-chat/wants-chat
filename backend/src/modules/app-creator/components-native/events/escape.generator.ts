/**
 * Escape Room Component Generators for React Native
 *
 * Generates escape room components with:
 * - Stats dashboard
 * - Booking calendar
 * - Today's bookings
 * - Room schedule
 */

export interface EscapeRoomOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateEscapeRoomStats(options: EscapeRoomOptions = {}): string {
  const { componentName = 'EscapeRoomStats', endpoint = '/escape-room/stats' } = options;

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
    queryKey: ['escape-room-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const statCards = [
    { label: 'Active Rooms', value: stats?.active_rooms || 0, icon: 'key', color: '#6366F1', bg: '#E0E7FF' },
    { label: 'Players Today', value: stats?.players_today || 0, icon: 'people', color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'Escapes Today', value: stats?.escapes_today || 0, icon: 'trophy', color: '#10B981', bg: '#D1FAE5' },
    { label: 'Avg. Escape Time', value: stats?.avg_escape_time ? \`\${stats.avg_escape_time} min\` : 'N/A', icon: 'time', color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Bookings Today', value: stats?.bookings_today || 0, icon: 'calendar', color: '#8B5CF6', bg: '#F3E8FF' },
    { label: 'Escape Rate', value: stats?.escape_rate ? \`\${stats.escape_rate}%\` : 'N/A', icon: 'stats-chart', color: '#EC4899', bg: '#FCE7F3' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statCards.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.bg }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          </View>
        ))}
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
    minHeight: 200,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  statContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    paddingLeft: 80,
    minHeight: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
});

export default ${componentName};
`;
}

export function generateBookingCalendarEscape(options: EscapeRoomOptions = {}): string {
  const { componentName = 'BookingCalendarEscape', endpoint = '/escape-room/bookings' } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['escape-bookings', currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: currentDate.getFullYear().toString(),
        month: (currentDate.getMonth() + 1).toString(),
      });
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  }, [currentDate]);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getBookingsForDay = (day: number) => {
    if (!bookings) return [];
    return bookings.filter((booking: any) => {
      const bookingDate = new Date(booking.date || booking.booking_date);
      return bookingDate.getDate() === day;
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706' };
      default:
        return { bg: '#E0E7FF', text: '#6366F1' };
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="key" size={20} color="#6366F1" />
          <Text style={styles.headerTitle}>Booking Calendar</Text>
        </View>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthName}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarSection}>
        <View style={styles.weekdaysRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {Array.from({ length: calendarData.firstDayOfMonth }).map((_, i) => (
            <View key={\`empty-\${i}\`} style={styles.dayCell} />
          ))}
          {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayBookings = getBookingsForDay(day);
            const isToday = new Date().toDateString() ===
              new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <View
                key={day}
                style={[styles.dayCell, isToday && styles.dayCellToday]}
              >
                <Text style={[styles.dayText, isToday && styles.dayTextToday]}>{day}</Text>
                {dayBookings.slice(0, 2).map((booking: any, idx: number) => {
                  const statusStyle = getStatusStyle(booking.status);
                  return (
                    <View key={booking.id || idx} style={[styles.bookingDot, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.bookingDotText, { color: statusStyle.text }]} numberOfLines={1}>
                        {booking.time || booking.start_time} - {booking.room_name || booking.room}
                      </Text>
                    </View>
                  );
                })}
                {dayBookings.length > 2 && (
                  <Text style={styles.moreText}>+{dayBookings.length - 2}</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.legendSection}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D1FAE5' }]} />
          <Text style={styles.legendText}>Confirmed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FEF3C7' }]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E0E7FF' }]} />
          <Text style={styles.legendText}>In Progress</Text>
        </View>
      </View>
    </ScrollView>
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
    margin: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  calendarSection: {
    padding: 16,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
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
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
  },
  dayCellToday: {
    backgroundColor: '#E0E7FF',
    borderColor: '#6366F1',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  dayTextToday: {
    color: '#6366F1',
  },
  bookingDot: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 2,
  },
  bookingDotText: {
    fontSize: 7,
  },
  moreText: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2,
  },
  legendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateBookingListTodayEscape(options: EscapeRoomOptions = {}): string {
  const { componentName = 'BookingListTodayEscape', endpoint = '/escape-room/bookings/today' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['escape-bookings-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'in_progress':
        return { icon: 'hourglass', color: '#3B82F6', bg: '#DBEAFE', label: 'In Progress' };
      case 'completed':
      case 'escaped':
        return { icon: 'checkmark-circle', color: '#059669', bg: '#D1FAE5', label: status === 'escaped' ? 'Escaped!' : 'Completed' };
      case 'failed':
        return { icon: 'alert-circle', color: '#DC2626', bg: '#FEE2E2', label: 'Failed' };
      case 'confirmed':
        return { icon: 'key', color: '#6366F1', bg: '#E0E7FF', label: 'Confirmed' };
      default:
        return { icon: 'time', color: '#D97706', bg: '#FEF3C7', label: status || 'Pending' };
    }
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'hard':
      case 'expert':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'medium':
        return { bg: '#FEF3C7', text: '#D97706' };
      default:
        return { bg: '#D1FAE5', text: '#059669' };
    }
  };

  const handleBookingPress = useCallback((booking: any) => {
    navigation.navigate('BookingDetail' as never, { id: booking.id } as never);
  }, [navigation]);

  const renderBooking = useCallback(({ item: booking }: { item: any }) => {
    const statusConfig = getStatusConfig(booking.status);
    const difficultyStyle = booking.difficulty ? getDifficultyStyle(booking.difficulty) : null;

    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => handleBookingPress(booking)}
        activeOpacity={0.7}
      >
        <View style={styles.timeColumn}>
          <View style={[styles.timeBadge, { backgroundColor: '#E0E7FF' }]}>
            <Text style={styles.timeText}>{booking.time || booking.start_time}</Text>
            {booking.duration && (
              <Text style={styles.durationText}>{booking.duration} min</Text>
            )}
          </View>
        </View>
        <View style={styles.bookingContent}>
          <View style={styles.bookingHeader}>
            <View style={styles.roomInfo}>
              <View style={styles.roomTitle}>
                <Ionicons name="key" size={16} color="#6366F1" />
                <Text style={styles.roomName}>{booking.room_name || booking.room}</Text>
              </View>
              {booking.customer_name && (
                <Text style={styles.customerName}>Booked by {booking.customer_name}</Text>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          <View style={styles.bookingMeta}>
            {booking.players !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{booking.players} players</Text>
              </View>
            )}
            {difficultyStyle && (
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyStyle.bg }]}>
                <Text style={[styles.difficultyText, { color: difficultyStyle.text }]}>
                  {booking.difficulty}
                </Text>
              </View>
            )}
            {booking.escape_time && (
              <View style={styles.metaItem}>
                <Ionicons name="timer-outline" size={14} color="#059669" />
                <Text style={[styles.metaText, { color: '#059669' }]}>
                  Escaped in {booking.escape_time} min
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleBookingPress]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="key-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No bookings today</Text>
        <Text style={styles.emptySubtitle}>No escape room bookings for today</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time" size={20} color="#6366F1" />
        <Text style={styles.headerTitle}>Today's Bookings</Text>
      </View>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    margin: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  bookingCard: {
    flexDirection: 'row',
  },
  timeColumn: {
    marginRight: 12,
  },
  timeBadge: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
  durationText: {
    fontSize: 10,
    color: '#6366F1',
    marginTop: 2,
  },
  bookingContent: {
    flex: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomInfo: {
    flex: 1,
    marginRight: 8,
  },
  roomTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 6,
  },
  customerName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  bookingMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 16,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateRoomScheduleEscape(options: EscapeRoomOptions = {}): string {
  const { componentName = 'RoomScheduleEscape', endpoint = '/escape-room/rooms/schedule' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['escape-room-schedule', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?date=\${selectedDate.toISOString().split('T')[0]}\`);
      return response?.data || response;
    },
  });

  const rooms = schedule?.rooms || [];
  const timeSlots = schedule?.time_slots || [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
  ];

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const getSlotStatus = useCallback((roomId: string, time: string) => {
    if (!schedule?.bookings) return 'available';
    const booking = schedule.bookings.find((b: any) =>
      (b.room_id === roomId || b.room === roomId) &&
      (b.time === time || b.start_time === time)
    );
    if (!booking) return 'available';
    return booking.status || 'booked';
  }, [schedule]);

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'hard':
      case 'expert':
        return { bg: '#FEE2E2', color: '#DC2626' };
      case 'medium':
        return { bg: '#FEF3C7', color: '#D97706' };
      default:
        return { bg: '#D1FAE5', color: '#059669' };
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="key" size={20} color="#6366F1" />
          <Text style={styles.headerTitle}>Room Schedule</Text>
        </View>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={goToNextDay} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          <View style={styles.headerRow}>
            <View style={styles.roomHeaderCell}>
              <Text style={styles.cellHeaderText}>Room</Text>
            </View>
            {timeSlots.map((time) => (
              <View key={time} style={styles.timeHeaderCell}>
                <Text style={styles.timeHeaderText}>{time}</Text>
              </View>
            ))}
          </View>

          {rooms.length > 0 ? (
            rooms.map((room: any) => {
              const difficultyStyle = getDifficultyStyle(room.difficulty);
              return (
                <View key={room.id} style={styles.roomRow}>
                  <View style={styles.roomInfoCell}>
                    <View style={[styles.roomIcon, { backgroundColor: difficultyStyle.bg }]}>
                      <Ionicons name="key" size={16} color={difficultyStyle.color} />
                    </View>
                    <View style={styles.roomDetails}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      <View style={styles.roomMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="people-outline" size={12} color="#6B7280" />
                          <Text style={styles.metaText}>{room.min_players}-{room.max_players}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={12} color="#6B7280" />
                          <Text style={styles.metaText}>{room.duration || 60} min</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {timeSlots.map((time) => {
                    const status = getSlotStatus(room.id, time);
                    return (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.slotCell,
                          status === 'available' && styles.slotAvailable,
                          status === 'in_progress' && styles.slotInProgress,
                          status !== 'available' && status !== 'in_progress' && styles.slotBooked,
                        ]}
                        disabled={status !== 'available'}
                      >
                        <Ionicons
                          name={
                            status === 'available' ? 'lock-open-outline' :
                            status === 'in_progress' ? 'hourglass-outline' :
                            'lock-closed-outline'
                          }
                          size={16}
                          color={
                            status === 'available' ? '#059669' :
                            status === 'in_progress' ? '#3B82F6' :
                            '#9CA3AF'
                          }
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No rooms available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.legendSection}>
        <View style={styles.legendItem}>
          <Ionicons name="lock-open-outline" size={16} color="#059669" />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="hourglass-outline" size={16} color="#3B82F6" />
          <Text style={styles.legendText}>In Progress</Text>
        </View>
      </View>
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
    margin: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  roomHeaderCell: {
    width: 160,
    padding: 12,
    justifyContent: 'center',
  },
  cellHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeHeaderCell: {
    width: 50,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeHeaderText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
  },
  roomRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  roomInfoCell: {
    width: 160,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  roomIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  roomDetails: {
    flex: 1,
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  roomMeta: {
    flexDirection: 'row',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  metaText: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 2,
  },
  slotCell: {
    width: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 4,
  },
  slotAvailable: {
    backgroundColor: '#D1FAE5',
  },
  slotBooked: {
    backgroundColor: '#F3F4F6',
  },
  slotInProgress: {
    backgroundColor: '#DBEAFE',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  legendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
});

export default ${componentName};
`;
}
