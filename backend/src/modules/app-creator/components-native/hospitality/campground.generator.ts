/**
 * Campground Management Component Generators (React Native)
 *
 * Generates components for campground/RV park management including:
 * - CampgroundStats, ReservationCalendarCampground, ActivityCalendarCampground
 * - SiteAvailability, SiteSchedule
 */

export interface CampgroundOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCampgroundStats(options: CampgroundOptions = {}): string {
  const { componentName = 'CampgroundStats', endpoint = '/campground/stats' } = options;

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
    queryKey: ['campground-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch campground stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const statItems = [
    { key: 'occupiedSites', label: 'Occupied Sites', icon: 'bonfire-outline', color: '#10B981', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'availableSites', label: 'Available Sites', icon: 'location-outline', color: '#3B82F6', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'checkInsToday', label: 'Check-ins Today', icon: 'sunny-outline', color: '#F59E0B', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'checkOutsToday', label: 'Check-outs Today', icon: 'moon-outline', color: '#8B5CF6', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'totalGuests', label: 'Total Guests', icon: 'people-outline', color: '#059669', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'upcomingReservations', label: 'Upcoming Reservations', icon: 'calendar-outline', color: '#F97316', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'todayRevenue', label: "Today's Revenue", icon: 'cash-outline', color: '#6366F1', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
    { key: 'occupancyRate', label: 'Occupancy Rate', icon: 'trending-up-outline', color: '#EF4444', format: (v: number) => \`\${v || 0}%\` },
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

export function generateReservationCalendarCampground(options: CampgroundOptions = {}): string {
  const { componentName = 'ReservationCalendarCampground', endpoint = '/campground/reservations/calendar' } = options;

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
  siteId?: string;
  onReservationClick?: (reservation: any) => void;
  onDateSelect?: (date: Date) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ siteId, onReservationClick, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['campground-reservations', siteId, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
          ...(siteId ? { site_id: siteId } : {}),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
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
      const checkIn = new Date(res.check_in || res.checkIn || res.start_date || res.arrival);
      const checkOut = new Date(res.check_out || res.checkOut || res.end_date || res.departure);
      return date >= checkIn && date <= checkOut;
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="bonfire-outline" size={20} color="#10B981" />
          <Text style={styles.title}>Reservation Calendar</Text>
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
                        style={[styles.reservationDot, { backgroundColor: getStatusColor(res.status) }]}
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
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Confirmed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Checked In</Text>
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
    borderColor: '#10B981',
  },
  dayCellSelected: {
    backgroundColor: '#D1FAE5',
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
    color: '#10B981',
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

export function generateActivityCalendarCampground(options: CampgroundOptions = {}): string {
  const { componentName = 'ActivityCalendarCampground', endpoint = '/campground/activities' } = options;

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
  onActivityClick?: (activity: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onActivityClick }) => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: activities, isLoading } = useQuery({
    queryKey: ['campground-activities', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        return [];
      }
    },
  });

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const getActivitiesForDate = (date: Date) => {
    return activities?.filter((activity: any) => {
      const activityDate = new Date(activity.date || activity.start_date || activity.scheduled_at);
      return activityDate.getFullYear() === date.getFullYear() &&
             activityDate.getMonth() === date.getMonth() &&
             activityDate.getDate() === date.getDate();
    }) || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      hiking: { bg: '#D1FAE5', text: '#059669' },
      swimming: { bg: '#DBEAFE', text: '#2563EB' },
      campfire: { bg: '#FFEDD5', text: '#EA580C' },
      fishing: { bg: '#CFFAFE', text: '#0891B2' },
      workshop: { bg: '#F3E8FF', text: '#7C3AED' },
      kids: { bg: '#FCE7F3', text: '#DB2777' },
      tour: { bg: '#FEF3C7', text: '#D97706' },
    };
    return colors[type?.toLowerCase()] || { bg: '#F3F4F6', text: '#374151' };
  };

  const navigatePrev = () => {
    setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const navigateNext = () => {
    setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar-outline" size={20} color="#10B981" />
          <Text style={styles.title}>Activity Calendar</Text>
        </View>

        <View style={styles.headerControls}>
          <View style={styles.navigation}>
            <TouchableOpacity onPress={navigatePrev} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={navigateNext} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CampgroundActivityNew' as never)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.weekContainer}>
          {weekDays.map((day, idx) => {
            const dayActivities = getActivitiesForDate(day);

            return (
              <View key={idx} style={styles.dayColumn}>
                <View style={[styles.dayHeader, isToday(day) && styles.dayHeaderToday]}>
                  <Text style={[styles.dayName, isToday(day) && styles.dayNameToday]}>
                    {WEEKDAYS[day.getDay()]}
                  </Text>
                  <Text style={[styles.dayDate, isToday(day) && styles.dayDateToday]}>
                    {day.getDate()}
                  </Text>
                </View>

                <View style={styles.activitiesContainer}>
                  {dayActivities.map((activity: any, i: number) => {
                    const colors = getActivityTypeColor(activity.type || activity.activity_type);
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.activityCard, { backgroundColor: colors.bg }]}
                        onPress={() => onActivityClick?.(activity)}
                      >
                        <Text style={[styles.activityName, { color: colors.text }]} numberOfLines={1}>
                          {activity.name || activity.title}
                        </Text>
                        <View style={styles.activityTime}>
                          <Ionicons name="time-outline" size={12} color={colors.text} />
                          <Text style={[styles.activityTimeText, { color: colors.text }]}>
                            {activity.time || activity.start_time || '9:00 AM'}
                          </Text>
                        </View>
                        {activity.location && (
                          <View style={styles.activityLocation}>
                            <Ionicons name="location-outline" size={12} color={colors.text} />
                            <Text style={[styles.activityLocationText, { color: colors.text }]} numberOfLines={1}>
                              {activity.location}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  {dayActivities.length === 0 && (
                    <Text style={styles.noActivities}>No activities</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        {['hiking', 'swimming', 'campfire', 'fishing', 'workshop', 'kids', 'tour'].map((type) => {
          const colors = getActivityTypeColor(type);
          return (
            <View key={type} style={[styles.legendItem, { backgroundColor: colors.bg }]}>
              <Text style={[styles.legendText, { color: colors.text }]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </View>
          );
        })}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  weekContainer: {
    flexDirection: 'row',
    padding: 8,
  },
  dayColumn: {
    width: 120,
    marginHorizontal: 4,
  },
  dayHeader: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  dayHeaderToday: {
    backgroundColor: '#10B981',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  dayNameToday: {
    color: '#FFFFFF',
  },
  dayDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  dayDateToday: {
    color: '#FFFFFF',
  },
  activitiesContainer: {
    minHeight: 150,
  },
  activityCard: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityTimeText: {
    fontSize: 10,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  activityLocationText: {
    fontSize: 10,
  },
  noActivities: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export function generateSiteAvailability(options: CampgroundOptions = {}): string {
  const { componentName = 'SiteAvailability', endpoint = '/campground/sites/availability' } = options;

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
  onSiteClick?: (site: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSiteClick }) => {
  const [filterType, setFilterType] = useState<string>('');

  const { data: sites, isLoading } = useQuery({
    queryKey: ['campground-sites', filterType],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filterType) params.set('type', filterType);
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch site availability:', err);
        return [];
      }
    },
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: string; bgColor: string; textColor: string; label: string }> = {
      available: { icon: 'checkmark-circle', bgColor: '#D1FAE5', textColor: '#059669', label: 'Available' },
      occupied: { icon: 'bonfire', bgColor: '#FEE2E2', textColor: '#DC2626', label: 'Occupied' },
      reserved: { icon: 'time', bgColor: '#FEF3C7', textColor: '#D97706', label: 'Reserved' },
      maintenance: { icon: 'construct', bgColor: '#F3F4F6', textColor: '#6B7280', label: 'Maintenance' },
    };
    return configs[status?.toLowerCase()] || configs.available;
  };

  const siteTypes = ['tent', 'rv', 'cabin', 'glamping', 'group'];

  const statusCounts = sites?.reduce((acc: Record<string, number>, site: any) => {
    const status = site.status?.toLowerCase() || 'available';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const renderStatusSummary = () => (
    <View style={styles.summaryContainer}>
      {['available', 'occupied', 'reserved', 'maintenance'].map((status) => {
        const config = getStatusConfig(status);
        return (
          <View key={status} style={[styles.summaryCard, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon as any} size={20} color={config.textColor} />
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

  const renderTypeFilters = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={[styles.filterChip, !filterType && styles.filterChipActive]}
        onPress={() => setFilterType('')}
      >
        <Text style={[styles.filterChipText, !filterType && styles.filterChipTextActive]}>All</Text>
      </TouchableOpacity>
      {siteTypes.map((type) => (
        <TouchableOpacity
          key={type}
          style={[styles.filterChip, filterType === type && styles.filterChipActive]}
          onPress={() => setFilterType(type)}
        >
          <Text style={[styles.filterChipText, filterType === type && styles.filterChipTextActive]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSiteItem = ({ item }: { item: any }) => {
    const config = getStatusConfig(item.status);
    return (
      <TouchableOpacity
        style={[styles.siteCard, { backgroundColor: config.bgColor }]}
        onPress={() => onSiteClick?.(item)}
      >
        <View style={styles.siteHeader}>
          <Text style={[styles.siteNumber, { color: config.textColor }]}>
            {item.site_number || item.number || item.name}
          </Text>
          <Ionicons name={config.icon as any} size={18} color={config.textColor} />
        </View>
        <Text style={[styles.siteType, { color: config.textColor }]}>
          {item.site_type || item.type || 'Standard'}
        </Text>
        <View style={styles.amenitiesRow}>
          {item.electric && <Ionicons name="flash" size={14} color="#F59E0B" />}
          {item.water && <Ionicons name="water" size={14} color="#3B82F6" />}
          {item.wifi && <Ionicons name="wifi" size={14} color="#8B5CF6" />}
        </View>
        {item.guest_name && (
          <Text style={styles.guestName} numberOfLines={1}>{item.guest_name}</Text>
        )}
        {item.price && (
          <Text style={[styles.sitePrice, { color: config.textColor }]}>\${item.price}/night</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderStatusSummary()}
      {renderTypeFilters()}

      <FlatList
        data={sites}
        renderItem={renderSiteItem}
        keyExtractor={(item) => item.id || item.site_number}
        numColumns={3}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bonfire-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No sites found</Text>
          </View>
        }
      />
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
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#10B981',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  gridContent: {
    padding: 8,
  },
  siteCard: {
    flex: 1,
    margin: 4,
    padding: 12,
    borderRadius: 12,
    maxWidth: '31%',
  },
  siteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  siteNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  siteType: {
    fontSize: 10,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  guestName: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  sitePrice: {
    fontSize: 12,
    fontWeight: '600',
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

export function generateSiteSchedule(options: CampgroundOptions = {}): string {
  const { componentName = 'SiteSchedule', endpoint = '/campground/sites/schedule' } = options;

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
  onReservationClick?: (reservation: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onReservationClick }) => {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay());
    return today;
  });

  const { data, isLoading } = useQuery({
    queryKey: ['site-schedule', startDate.toISOString()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          start_date: startDate.toISOString().split('T')[0],
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return response?.data || response || { sites: [], reservations: [] };
      } catch (err) {
        console.error('Failed to fetch site schedule:', err);
        return { sites: [], reservations: [] };
      }
    },
  });

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      result.push(day);
    }
    return result;
  }, [startDate]);

  const getReservationsForSiteAndDate = (siteId: string, date: Date) => {
    return data?.reservations?.filter((res: any) => {
      if ((res.site_id || res.siteId) !== siteId) return false;
      const checkIn = new Date(res.check_in || res.checkIn || res.start_date);
      const checkOut = new Date(res.check_out || res.checkOut || res.end_date);
      return date >= checkIn && date < checkOut;
    }) || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  const formatDateHeader = (date: Date) => {
    return \`\${WEEKDAYS[date.getDay()]} \${date.getDate()}\`;
  };

  const navigatePrev = () => {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() - 7);
    setStartDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + 7);
    setStartDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return { bg: '#D1FAE5', text: '#059669' };
      case 'checked_in': return { bg: '#DBEAFE', text: '#2563EB' };
      default: return { bg: '#FEF3C7', text: '#D97706' };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const sites = data?.sites || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar-outline" size={20} color="#10B981" />
          <Text style={styles.title}>Site Schedule (2 Weeks)</Text>
        </View>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={navigatePrev} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.dateRange}>
            {days[0].toLocaleDateString()} - {days[days.length - 1].toLocaleDateString()}
          </Text>
          <TouchableOpacity onPress={navigateNext} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <View style={styles.siteColumn}>
              <Text style={styles.headerText}>Site</Text>
            </View>
            {days.map((day, idx) => (
              <View
                key={idx}
                style={[styles.dayColumn, isToday(day) && styles.dayColumnToday]}
              >
                <Text style={[styles.dayText, isToday(day) && styles.dayTextToday]}>
                  {formatDateHeader(day)}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {sites.map((site: any) => (
              <View key={site.id || site.site_number} style={styles.siteRow}>
                <View style={styles.siteColumn}>
                  <View style={styles.siteInfo}>
                    <Ionicons name="bonfire-outline" size={14} color="#10B981" />
                    <Text style={styles.siteNumber}>{site.site_number || site.number}</Text>
                  </View>
                  <Text style={styles.siteType}>{site.site_type || site.type}</Text>
                </View>
                {days.map((day, idx) => {
                  const reservations = getReservationsForSiteAndDate(site.id || site.site_number, day);
                  const hasReservation = reservations.length > 0;
                  const reservation = reservations[0];
                  const colors = hasReservation ? getStatusColor(reservation?.status) : null;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.dayColumn,
                        isToday(day) && styles.dayColumnToday,
                      ]}
                      onPress={() => hasReservation && onReservationClick?.(reservation)}
                      disabled={!hasReservation}
                    >
                      {hasReservation ? (
                        <View style={[styles.reservationCell, { backgroundColor: colors?.bg }]}>
                          <Text style={[styles.reservationGuest, { color: colors?.text }]} numberOfLines={1}>
                            {reservation.guest_name || reservation.guestName || 'Reserved'}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.emptyCell} />
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
          <View style={[styles.legendDot, { backgroundColor: '#D1FAE5' }]} />
          <Text style={styles.legendText}>Confirmed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#DBEAFE' }]} />
          <Text style={styles.legendText}>Checked In</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FEF3C7' }]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F3F4F6' }]} />
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
    gap: 8,
  },
  navButton: {
    padding: 8,
  },
  dateRange: {
    fontSize: 14,
    color: '#374151',
    minWidth: 180,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  siteColumn: {
    width: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  dayColumn: {
    width: 70,
    paddingVertical: 8,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  dayColumnToday: {
    backgroundColor: '#D1FAE5',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  dayText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
  },
  dayTextToday: {
    color: '#059669',
    fontWeight: '700',
  },
  siteRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  siteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  siteNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  siteType: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  reservationCell: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reservationGuest: {
    fontSize: 10,
  },
  emptyCell: {
    width: 50,
    height: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
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
