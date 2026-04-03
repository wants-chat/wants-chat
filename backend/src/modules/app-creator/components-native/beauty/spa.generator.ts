/**
 * Spa Component Generators (React Native)
 *
 * Generates spa/wellness components including:
 * - AppointmentCalendarSpa: Calendar view for spa appointments with treatment details
 * - SpaStats: Statistics dashboard for spa metrics
 * - SpaSchedule: Spa operating hours and treatment room availability
 * - TherapistProfileSpa: Individual therapist profile display
 * - ClientProfileSpa: Client profile with wellness history and preferences
 */

export interface SpaOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate an appointment calendar component for spa (React Native)
 */
export function generateAppointmentCalendarSpa(options: SpaOptions = {}): string {
  const { componentName = 'AppointmentCalendarSpa', endpoint = '/appointments' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface SpaAppointment {
  id: string;
  date: string;
  time: string;
  client_name: string;
  therapist_name: string;
  treatment: string;
  room: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  duration: number;
  package_name?: string;
}

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['spa-appointments', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get<SpaAppointment[]>(\`${endpoint}?year=\${year}&month=\${month}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, () => null);
  const calendarDays = [...padding, ...days];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getAppointmentsForDay = (day: number) => {
    return appointments?.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate.getDate() === day && aptDate.getMonth() === month && aptDate.getFullYear() === year;
    }) || [];
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#D1FAE5', text: '#059669' };
      case 'in_progress': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'cancelled': return { bg: '#FEE2E2', text: '#DC2626' };
      case 'no_show': return { bg: '#FEF3C7', text: '#D97706' };
      default: return { bg: '#CCFBF1', text: '#0D9488' };
    }
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
    setSelectedDay(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  const selectedDayAppointments = selectedDay ? getAppointmentsForDay(selectedDay) : [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Ionicons name="sparkles" size={20} color="#14B8A6" />
            <Text style={styles.headerText}>{monthNames[month]} {year}</Text>
          </View>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Week Days */}
        <View style={styles.weekRow}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDay}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            const dayAppointments = day ? getAppointmentsForDay(day) : [];
            const today = new Date();
            const isToday = day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const isSelected = day === selectedDay;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isToday && styles.todayCell,
                  isSelected && styles.selectedCell,
                ]}
                onPress={() => day && setSelectedDay(day === selectedDay ? null : day)}
                disabled={!day}
              >
                {day && (
                  <>
                    <Text style={[styles.dayText, isToday && styles.todayText]}>
                      {day}
                    </Text>
                    {dayAppointments.length > 0 && (
                      <View style={styles.dotContainer}>
                        {dayAppointments.slice(0, 3).map((_, i) => (
                          <View key={i} style={styles.appointmentDot} />
                        ))}
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Day Details */}
      {selectedDay && (
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>
            Treatments for {monthNames[month]} {selectedDay}
          </Text>
          {selectedDayAppointments.length > 0 ? (
            selectedDayAppointments.map((apt) => {
              const statusStyle = getStatusStyle(apt.status);
              return (
                <View key={apt.id} style={styles.appointmentItem}>
                  <View style={styles.appointmentAvatar}>
                    <Ionicons name="water" size={20} color="#14B8A6" />
                  </View>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentClient}>{apt.client_name}</Text>
                    <Text style={styles.appointmentService}>
                      {apt.treatment} ({apt.duration} min)
                    </Text>
                    <Text style={styles.appointmentMeta}>
                      Room: {apt.room} | Therapist: {apt.therapist_name}
                    </Text>
                  </View>
                  <View style={styles.appointmentRight}>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.timeText}>{apt.time}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {apt.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No treatments scheduled</Text>
          )}
        </View>
      )}
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
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    padding: 8,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  weekDay: {
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
    padding: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  todayCell: {
    backgroundColor: '#CCFBF1',
    borderRadius: 8,
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#14B8A6',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  todayText: {
    color: '#0D9488',
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  appointmentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#14B8A6',
  },
  detailsCard: {
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
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 8,
  },
  appointmentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentClient: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  appointmentService: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  appointmentMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  appointmentRight: {
    alignItems: 'flex-end',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 16,
  },
});

export default ${componentName};
`;
}

/**
 * Generate spa statistics dashboard (React Native)
 */
export function generateSpaStats(options: SpaOptions = {}): string {
  const { componentName = 'SpaStats', endpoint = '/spa/stats' } = options;

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

interface SpaStatsData {
  total_clients: number;
  total_treatments: number;
  revenue_today: number;
  revenue_month: number;
  treatments_today: number;
  treatments_week: number;
  average_rating: number;
  room_utilization: number;
  popular_treatments: Array<{ name: string; count: number; category: string }>;
  top_therapists: Array<{ name: string; treatments: number; rating: number; specialty: string }>;
  package_sales: number;
  membership_renewals: number;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['spa-stats'],
    queryFn: async () => {
      const response = await api.get<SpaStatsData>('${endpoint}');
      return response?.data || response;
    },
  });

  const getTreatmentIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'massage': return 'heart';
      case 'facial': return 'sparkles';
      case 'body': return 'leaf';
      default: return 'water';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  const statCards = [
    {
      title: 'Total Clients',
      value: stats?.total_clients?.toLocaleString() || '0',
      icon: 'people',
      color: '#14B8A6',
    },
    {
      title: 'Treatments Today',
      value: stats?.treatments_today?.toString() || '0',
      icon: 'sparkles',
      color: '#8B5CF6',
    },
    {
      title: "Today's Revenue",
      value: \`$\${stats?.revenue_today?.toLocaleString() || '0'}\`,
      icon: 'cash',
      color: '#10B981',
    },
    {
      title: 'Monthly Revenue',
      value: \`$\${stats?.revenue_month?.toLocaleString() || '0'}\`,
      icon: 'trending-up',
      color: '#3B82F6',
    },
    {
      title: 'Average Rating',
      value: stats?.average_rating?.toFixed(1) || '0.0',
      icon: 'star',
      color: '#F59E0B',
    },
    {
      title: 'Room Utilization',
      value: \`\${stats?.room_utilization || 0}%\`,
      icon: 'time',
      color: '#F43F5E',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((stat) => (
          <View key={stat.title} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
              <Ionicons name={stat.icon as any} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      {/* Additional Stats */}
      <View style={styles.highlightRow}>
        <View style={[styles.highlightCard, { backgroundColor: '#14B8A6' }]}>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightLabel}>Package Sales</Text>
            <Text style={styles.highlightValue}>{stats?.package_sales || 0}</Text>
          </View>
          <Ionicons name="sparkles" size={40} color="rgba(255,255,255,0.3)" />
        </View>
        <View style={[styles.highlightCard, { backgroundColor: '#8B5CF6' }]}>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightLabel}>Renewals</Text>
            <Text style={styles.highlightValue}>{stats?.membership_renewals || 0}</Text>
          </View>
          <Ionicons name="heart" size={40} color="rgba(255,255,255,0.3)" />
        </View>
      </View>

      {/* Popular Treatments */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="water" size={20} color="#14B8A6" />
          <Text style={styles.sectionTitle}>Popular Treatments</Text>
        </View>
        {stats?.popular_treatments?.length ? (
          stats.popular_treatments.map((treatment, index) => (
            <View key={treatment.name} style={styles.listItem}>
              <View style={styles.treatmentIcon}>
                <Ionicons name={getTreatmentIcon(treatment.category) as any} size={18} color="#14B8A6" />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemText}>{treatment.name}</Text>
                <Text style={styles.listItemSub}>{treatment.category}</Text>
              </View>
              <Text style={styles.listItemMeta}>{treatment.count} bookings</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No data available</Text>
        )}
      </View>

      {/* Top Therapists */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Top Therapists</Text>
        </View>
        {stats?.top_therapists?.length ? (
          stats.top_therapists.map((therapist, index) => (
            <View key={therapist.name} style={styles.listItem}>
              <View style={[styles.rankBadge, { backgroundColor: '#EDE9FE' }]}>
                <Text style={[styles.rankText, { color: '#7C3AED' }]}>{index + 1}</Text>
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemText}>{therapist.name}</Text>
                <Text style={styles.listItemSub}>{therapist.specialty}</Text>
              </View>
              <View style={styles.therapistMeta}>
                <Text style={styles.sessionsText}>{therapist.treatments} sessions</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{therapist.rating.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No data available</Text>
        )}
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  highlightRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  highlightCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
  },
  highlightContent: {
    flex: 1,
  },
  highlightLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  treatmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listItemContent: {
    flex: 1,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  listItemSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  listItemMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  therapistMeta: {
    alignItems: 'flex-end',
  },
  sessionsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 16,
  },
});

export default ${componentName};
`;
}

/**
 * Generate spa schedule and room availability component (React Native)
 */
export function generateSpaSchedule(options: SpaOptions = {}): string {
  const { componentName = 'SpaSchedule', endpoint = '/spa/schedule' } = options;

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
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface RoomSchedule {
  room_id: string;
  room_name: string;
  room_type: string;
  time_slots: Array<{
    time: string;
    available: boolean;
    treatment?: string;
    therapist?: string;
    client?: string;
  }>;
}

interface OperatingHours {
  day: string;
  open: boolean;
  open_time?: string;
  close_time?: string;
}

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: roomSchedules, isLoading: roomsLoading } = useQuery({
    queryKey: ['spa-room-schedule', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const date = selectedDate.toISOString().split('T')[0];
      const response = await api.get<RoomSchedule[]>(\`${endpoint}/rooms?date=\${date}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: operatingHours, isLoading: hoursLoading } = useQuery({
    queryKey: ['spa-hours'],
    queryFn: async () => {
      const response = await api.get<OperatingHours[]>('${endpoint}/hours');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const changeDate = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    setSelectedDate(newDate);
  };

  const isLoading = roomsLoading || hoursLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Operating Hours */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={20} color="#14B8A6" />
          <Text style={styles.cardTitle}>Operating Hours</Text>
        </View>
        <View style={styles.hoursGrid}>
          {days.map((day) => {
            const hours = operatingHours?.find((h) => h.day === day);
            const isOpen = hours?.open !== false;

            return (
              <View key={day} style={styles.dayRow}>
                <Text style={styles.dayName}>{day.slice(0, 3)}</Text>
                {isOpen ? (
                  <View style={styles.openIndicator}>
                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                    <Text style={styles.hoursText}>
                      {hours?.open_time || '9 AM'} - {hours?.close_time || '9 PM'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.closedIndicator}>
                    <Ionicons name="close-circle" size={14} color="#9CA3AF" />
                    <Text style={styles.closedText}>Closed</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Room Availability */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={20} color="#8B5CF6" />
          <Text style={styles.cardTitle}>Room Availability</Text>
        </View>

        {/* Date Navigation */}
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <TouchableOpacity onPress={() => changeDate(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Rooms */}
        {roomSchedules?.length ? (
          roomSchedules.map((room) => (
            <View key={room.room_id} style={styles.roomCard}>
              <View style={styles.roomHeader}>
                <View style={styles.roomIcon}>
                  <Ionicons name="sparkles" size={18} color="#8B5CF6" />
                </View>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{room.room_name}</Text>
                  <Text style={styles.roomType}>{room.room_type}</Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsScroll}>
                <View style={styles.slotsRow}>
                  {room.time_slots.map((slot, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.timeSlot,
                        slot.available ? styles.availableSlot : styles.bookedSlot,
                      ]}
                      disabled={!slot.available}
                    >
                      <Text
                        style={[
                          styles.slotTime,
                          slot.available ? styles.availableText : styles.bookedText,
                        ]}
                      >
                        {slot.time}
                      </Text>
                      {!slot.available && slot.treatment && (
                        <Text style={styles.slotTreatment} numberOfLines={1}>
                          {slot.treatment}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No room data available</Text>
        )}
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
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  hoursGrid: {
    gap: 8,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    width: 50,
  },
  openIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hoursText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  closedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  closedText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  roomCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  roomType: {
    fontSize: 12,
    color: '#6B7280',
  },
  slotsScroll: {
    marginHorizontal: -4,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  timeSlot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  availableSlot: {
    backgroundColor: '#D1FAE5',
  },
  bookedSlot: {
    backgroundColor: '#E5E7EB',
  },
  slotTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  availableText: {
    color: '#059669',
  },
  bookedText: {
    color: '#6B7280',
  },
  slotTreatment: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
    maxWidth: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 24,
  },
});

export default ${componentName};
`;
}

/**
 * Generate therapist profile component for spa (React Native)
 */
export function generateTherapistProfileSpa(options: SpaOptions = {}): string {
  const { componentName = 'TherapistProfileSpa', endpoint = '/therapists' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Therapist {
  id: string;
  name: string;
  avatar_url?: string;
  title: string;
  specialty: string[];
  bio?: string;
  experience_years: number;
  rating: number;
  reviews_count: number;
  treatments: string[];
  certifications?: string[];
  phone?: string;
  email?: string;
  languages?: string[];
  availability?: string;
}

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const { data: therapist, isLoading } = useQuery({
    queryKey: ['spa-therapist', id],
    queryFn: async () => {
      const response = await api.get<Therapist>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const handleCall = () => {
    if (therapist?.phone) Linking.openURL(\`tel:\${therapist.phone}\`);
  };

  const handleEmail = () => {
    if (therapist?.email) Linking.openURL(\`mailto:\${therapist.email}\`);
  };

  const handleBooking = () => {
    navigation.navigate('BookTreatment' as never, { therapist_id: therapist?.id } as never);
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty?.toLowerCase()) {
      case 'massage': return 'heart';
      case 'facial': return 'sparkles';
      case 'body treatment': return 'leaf';
      case 'aromatherapy': return 'water';
      default: return 'sparkles';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  if (!therapist) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Therapist not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {therapist.avatar_url ? (
            <Image source={{ uri: therapist.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={styles.name}>{therapist.name}</Text>
        <Text style={styles.title}>{therapist.title}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={18} color="#FCD34D" />
            <Text style={styles.statValue}>{therapist.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>({therapist.reviews_count})</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time" size={18} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>{therapist.experience_years}</Text>
            <Text style={styles.statLabel}>years</Text>
          </View>
        </View>
      </View>

      {/* Specialties */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Specialties</Text>
        <View style={styles.specialtyContainer}>
          {therapist.specialty?.map((spec) => (
            <View key={spec} style={styles.specialtyTag}>
              <Ionicons name={getSpecialtyIcon(spec) as any} size={16} color="#14B8A6" />
              <Text style={styles.specialtyText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Information</Text>
        <View style={styles.contactList}>
          {therapist.email && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <Ionicons name="mail-outline" size={20} color="#14B8A6" />
              <Text style={styles.contactText}>{therapist.email}</Text>
            </TouchableOpacity>
          )}
          {therapist.phone && (
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <Ionicons name="call-outline" size={20} color="#14B8A6" />
              <Text style={styles.contactText}>{therapist.phone}</Text>
            </TouchableOpacity>
          )}
          {therapist.languages && therapist.languages.length > 0 && (
            <View style={styles.contactItem}>
              <Ionicons name="globe-outline" size={20} color="#14B8A6" />
              <Text style={styles.contactText}>{therapist.languages.join(', ')}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Treatments */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Treatments Offered</Text>
        <View style={styles.tagContainer}>
          {therapist.treatments?.map((treatment) => (
            <View key={treatment} style={styles.treatmentTag}>
              <Text style={styles.treatmentTagText}>{treatment}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bio */}
      {therapist.bio && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.bioText}>{therapist.bio}</Text>
        </View>
      )}

      {/* Certifications */}
      {therapist.certifications && therapist.certifications.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Certifications & Training</Text>
          {therapist.certifications.map((cert) => (
            <View key={cert} style={styles.certItem}>
              <Ionicons name="ribbon" size={18} color="#8B5CF6" />
              <Text style={styles.certText}>{cert}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Book Button */}
      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Ionicons name="calendar" size={20} color="#FFFFFF" />
        <Text style={styles.bookButtonText}>Book Treatment</Text>
      </TouchableOpacity>
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
  header: {
    backgroundColor: '#14B8A6',
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specialtyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  specialtyText: {
    fontSize: 14,
    color: '#0D9488',
    fontWeight: '500',
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  treatmentTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  treatmentTagText: {
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '500',
  },
  bioText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  certText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#14B8A6',
    margin: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

/**
 * Generate client profile component for spa (React Native)
 */
export function generateClientProfileSpa(options: SpaOptions = {}): string {
  const { componentName = 'ClientProfileSpa', endpoint = '/clients' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface WellnessVisit {
  id: string;
  date: string;
  treatment: string;
  therapist_name: string;
  duration: number;
  amount: number;
  rating?: number;
  notes?: string;
}

interface WellnessGoal {
  id: string;
  goal: string;
  progress: number;
  target_date?: string;
}

interface SpaClient {
  id: string;
  name: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  joined_at: string;
  membership_type?: string;
  membership_expiry?: string;
  total_visits: number;
  total_spent: number;
  wellness_points: number;
  preferred_therapist?: string;
  preferred_treatments?: string[];
  health_conditions?: string[];
  allergies?: string[];
  pressure_preference?: 'light' | 'medium' | 'firm' | 'deep';
  aromatherapy_preferences?: string[];
  notes?: string;
  upcoming_appointment?: {
    date: string;
    time: string;
    treatment: string;
    therapist: string;
    room: string;
  };
  wellness_goals?: WellnessGoal[];
  visit_history: WellnessVisit[];
}

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const { data: client, isLoading } = useQuery({
    queryKey: ['spa-client', id],
    queryFn: async () => {
      const response = await api.get<SpaClient>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const handleCall = () => {
    if (client?.phone) Linking.openURL(\`tel:\${client.phone}\`);
  };

  const handleEmail = () => {
    if (client?.email) Linking.openURL(\`mailto:\${client.email}\`);
  };

  const handleBooking = () => {
    navigation.navigate('BookTreatment' as never, { client_id: client?.id } as never);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPressureStyle = (pressure?: string) => {
    switch (pressure) {
      case 'light': return { bg: '#D1FAE5', text: '#059669' };
      case 'medium': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'firm': return { bg: '#FFEDD5', text: '#EA580C' };
      case 'deep': return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Client not found</Text>
      </View>
    );
  }

  const pressureStyle = getPressureStyle(client.pressure_preference);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          {client.avatar_url ? (
            <Image source={{ uri: client.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#FFFFFF" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.memberSince}>
              Member since {formatDate(client.joined_at)}
            </Text>
            {client.membership_type && (
              <View style={styles.membershipBadge}>
                <Text style={styles.membershipText}>{client.membership_type} Member</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="sparkles" size={22} color="#14B8A6" />
            <Text style={styles.statValue}>{client.total_visits}</Text>
            <Text style={styles.statLabel}>Visits</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="card" size={22} color="#10B981" />
            <Text style={styles.statValue}>\${client.total_spent}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="ribbon" size={22} color="#8B5CF6" />
            <Text style={styles.statValue}>{client.wellness_points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Information</Text>
        <View style={styles.contactList}>
          {client.email && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <Ionicons name="mail-outline" size={20} color="#14B8A6" />
              <Text style={styles.contactText}>{client.email}</Text>
            </TouchableOpacity>
          )}
          {client.phone && (
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <Ionicons name="call-outline" size={20} color="#14B8A6" />
              <Text style={styles.contactText}>{client.phone}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Treatment Preferences */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="water" size={18} color="#14B8A6" />
          <Text style={styles.cardTitle}>Treatment Preferences</Text>
        </View>

        {/* Pressure Preference */}
        {client.pressure_preference && (
          <View style={styles.prefSection}>
            <Text style={styles.prefLabel}>Pressure Preference</Text>
            <View style={[styles.prefBadge, { backgroundColor: pressureStyle.bg }]}>
              <Text style={[styles.prefBadgeText, { color: pressureStyle.text }]}>
                {client.pressure_preference}
              </Text>
            </View>
          </View>
        )}

        {/* Favorite Treatments */}
        {client.preferred_treatments && client.preferred_treatments.length > 0 && (
          <View style={styles.prefSection}>
            <Text style={styles.prefLabel}>Favorite Treatments</Text>
            <View style={styles.tagContainer}>
              {client.preferred_treatments.map((treatment) => (
                <View key={treatment} style={styles.tag}>
                  <Text style={styles.tagText}>{treatment}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Aromatherapy */}
        {client.aromatherapy_preferences && client.aromatherapy_preferences.length > 0 && (
          <View style={styles.prefSection}>
            <View style={styles.prefLabelRow}>
              <Ionicons name="leaf" size={14} color="#10B981" />
              <Text style={styles.prefLabel}>Aromatherapy</Text>
            </View>
            <View style={styles.tagContainer}>
              {client.aromatherapy_preferences.map((scent) => (
                <View key={scent} style={styles.aromaTag}>
                  <Text style={styles.aromaTagText}>{scent}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Health Information */}
      {(client.health_conditions?.length || client.allergies?.length) && (
        <View style={[styles.card, styles.alertCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle" size={18} color="#F59E0B" />
            <Text style={[styles.cardTitle, { color: '#B45309' }]}>Health Information</Text>
          </View>

          {client.health_conditions && client.health_conditions.length > 0 && (
            <View style={styles.prefSection}>
              <Text style={styles.alertLabel}>Health Conditions</Text>
              <View style={styles.tagContainer}>
                {client.health_conditions.map((condition) => (
                  <View key={condition} style={styles.conditionTag}>
                    <Text style={styles.conditionTagText}>{condition}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {client.allergies && client.allergies.length > 0 && (
            <View style={styles.prefSection}>
              <Text style={styles.alertLabel}>Allergies</Text>
              <View style={styles.tagContainer}>
                {client.allergies.map((allergy) => (
                  <View key={allergy} style={styles.allergyTag}>
                    <Text style={styles.allergyTagText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Upcoming Appointment */}
      {client.upcoming_appointment && (
        <View style={styles.upcomingCard}>
          <Text style={styles.upcomingTitle}>Next Wellness Session</Text>
          <View style={styles.upcomingContent}>
            <View>
              <Text style={styles.upcomingService}>{client.upcoming_appointment.treatment}</Text>
              <Text style={styles.upcomingSub}>with {client.upcoming_appointment.therapist}</Text>
              <Text style={styles.upcomingRoom}>Room: {client.upcoming_appointment.room}</Text>
            </View>
            <View style={styles.upcomingMeta}>
              <Text style={styles.upcomingDate}>{formatDate(client.upcoming_appointment.date)}</Text>
              <Text style={styles.upcomingTime}>{client.upcoming_appointment.time}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Wellness Goals */}
      {client.wellness_goals && client.wellness_goals.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="heart" size={18} color="#EC4899" />
            <Text style={styles.cardTitle}>Wellness Goals</Text>
          </View>
          {client.wellness_goals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalText}>{goal.goal}</Text>
                <Text style={styles.goalProgress}>{goal.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: \`\${goal.progress}%\` }]} />
              </View>
              {goal.target_date && (
                <Text style={styles.goalTarget}>Target: {formatDate(goal.target_date)}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Visit History */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={18} color="#8B5CF6" />
          <Text style={styles.cardTitle}>Wellness Journey</Text>
        </View>
        {client.visit_history?.length > 0 ? (
          client.visit_history.map((visit) => (
            <View key={visit.id} style={styles.visitItem}>
              <View style={styles.visitIcon}>
                <Ionicons name="sparkles" size={18} color="#14B8A6" />
              </View>
              <View style={styles.visitInfo}>
                <Text style={styles.visitService}>{visit.treatment}</Text>
                <Text style={styles.visitSub}>with {visit.therapist_name} ({visit.duration} min)</Text>
                <Text style={styles.visitDate}>{formatDate(visit.date)}</Text>
              </View>
              <View style={styles.visitMeta}>
                <Text style={styles.visitAmount}>\${visit.amount}</Text>
                {visit.rating && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.ratingValue}>{visit.rating}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyListText}>No visit history</Text>
        )}
      </View>

      {/* Book Button */}
      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Ionicons name="calendar" size={20} color="#FFFFFF" />
        <Text style={styles.bookButtonText}>Book New Treatment</Text>
      </TouchableOpacity>
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
    backgroundColor: '#14B8A6',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  clientName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberSince: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  membershipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  membershipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
  },
  prefSection: {
    marginBottom: 16,
  },
  prefLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  prefLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  alertLabel: {
    fontSize: 13,
    color: '#92400E',
    marginBottom: 8,
  },
  prefBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  prefBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '500',
  },
  aromaTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aromaTagText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
  },
  conditionTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  conditionTagText: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '500',
  },
  allergyTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allergyTagText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  upcomingCard: {
    backgroundColor: '#14B8A6',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  upcomingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  upcomingService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  upcomingSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  upcomingRoom: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  upcomingMeta: {
    alignItems: 'flex-end',
  },
  upcomingDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  upcomingTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  goalItem: {
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 10,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14B8A6',
    borderRadius: 3,
  },
  goalTarget: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  visitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 8,
  },
  visitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  visitInfo: {
    flex: 1,
  },
  visitService: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  visitSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  visitDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  visitMeta: {
    alignItems: 'flex-end',
  },
  visitAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingValue: {
    fontSize: 12,
    color: '#374151',
  },
  emptyListText: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 16,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#14B8A6',
    margin: 16,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
