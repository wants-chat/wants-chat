/**
 * Salon Component Generators (React Native)
 *
 * Generates salon/beauty shop components including:
 * - AppointmentCalendarSalon: Calendar view for salon appointments
 * - SalonStats: Statistics dashboard for salon metrics
 * - StylistProfile: Individual stylist profile display
 * - StylistSchedule: Working hours and availability for stylists
 * - ClientProfileSalon: Client profile with visit history
 */

export interface SalonOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate an appointment calendar component for salon (React Native)
 */
export function generateAppointmentCalendarSalon(options: SalonOptions = {}): string {
  const { componentName = 'AppointmentCalendarSalon', endpoint = '/appointments' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  date: string;
  time: string;
  client_name: string;
  stylist_name: string;
  service: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  duration: number;
}

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['salon-appointments', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get<Appointment[]>(\`${endpoint}?year=\${year}&month=\${month}\`);
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
      case 'cancelled': return { bg: '#FEE2E2', text: '#DC2626' };
      case 'no_show': return { bg: '#FEF3C7', text: '#D97706' };
      default: return { bg: '#FCE7F3', text: '#DB2777' };
    }
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
    setSelectedDay(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
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
            <Ionicons name="cut" size={20} color="#EC4899" />
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
            {monthNames[month]} {selectedDay} Appointments
          </Text>
          {selectedDayAppointments.length > 0 ? (
            selectedDayAppointments.map((apt) => {
              const statusStyle = getStatusStyle(apt.status);
              return (
                <View key={apt.id} style={styles.appointmentItem}>
                  <View style={styles.appointmentAvatar}>
                    <Ionicons name="person" size={20} color="#EC4899" />
                  </View>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentClient}>{apt.client_name}</Text>
                    <Text style={styles.appointmentService}>
                      {apt.service} with {apt.stylist_name}
                    </Text>
                  </View>
                  <View style={styles.appointmentMeta}>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.timeText}>{apt.time}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {apt.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No appointments scheduled</Text>
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
    backgroundColor: '#FCE7F3',
    borderRadius: 8,
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#EC4899',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  todayText: {
    color: '#DB2777',
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
    backgroundColor: '#EC4899',
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
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 8,
  },
  appointmentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FCE7F3',
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
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  appointmentMeta: {
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
 * Generate salon statistics dashboard (React Native)
 */
export function generateSalonStats(options: SalonOptions = {}): string {
  const { componentName = 'SalonStats', endpoint = '/salon/stats' } = options;

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

interface SalonStatsData {
  total_clients: number;
  total_appointments: number;
  revenue_today: number;
  revenue_month: number;
  appointments_today: number;
  appointments_week: number;
  average_rating: number;
  returning_clients_rate: number;
  popular_services: Array<{ name: string; count: number }>;
  top_stylists: Array<{ name: string; appointments: number; rating: number }>;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['salon-stats'],
    queryFn: async () => {
      const response = await api.get<SalonStatsData>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  const statCards = [
    {
      title: 'Total Clients',
      value: stats?.total_clients?.toLocaleString() || '0',
      icon: 'people',
      colors: ['#EC4899', '#F472B6'],
    },
    {
      title: 'Appointments Today',
      value: stats?.appointments_today?.toString() || '0',
      icon: 'calendar',
      colors: ['#8B5CF6', '#A78BFA'],
    },
    {
      title: "Today's Revenue",
      value: \`$\${stats?.revenue_today?.toLocaleString() || '0'}\`,
      icon: 'cash',
      colors: ['#10B981', '#34D399'],
    },
    {
      title: 'Monthly Revenue',
      value: \`$\${stats?.revenue_month?.toLocaleString() || '0'}\`,
      icon: 'trending-up',
      colors: ['#3B82F6', '#60A5FA'],
    },
    {
      title: 'Average Rating',
      value: stats?.average_rating?.toFixed(1) || '0.0',
      icon: 'star',
      colors: ['#F59E0B', '#FBBF24'],
    },
    {
      title: 'Returning Clients',
      value: \`\${stats?.returning_clients_rate || 0}%\`,
      icon: 'repeat',
      colors: ['#14B8A6', '#2DD4BF'],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((stat) => (
          <View key={stat.title} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.colors[0] }]}>
              <Ionicons name={stat.icon as any} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      {/* Popular Services */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cut" size={20} color="#EC4899" />
          <Text style={styles.sectionTitle}>Popular Services</Text>
        </View>
        {stats?.popular_services?.length ? (
          stats.popular_services.map((service, index) => (
            <View key={service.name} style={styles.listItem}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.listItemText}>{service.name}</Text>
              <Text style={styles.listItemMeta}>{service.count} bookings</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No data available</Text>
        )}
      </View>

      {/* Top Stylists */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Top Stylists</Text>
        </View>
        {stats?.top_stylists?.length ? (
          stats.top_stylists.map((stylist, index) => (
            <View key={stylist.name} style={styles.listItem}>
              <View style={[styles.rankBadge, { backgroundColor: '#EDE9FE' }]}>
                <Text style={[styles.rankText, { color: '#7C3AED' }]}>{index + 1}</Text>
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemText}>{stylist.name}</Text>
                <Text style={styles.listItemSub}>{stylist.appointments} appointments</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{stylist.rating.toFixed(1)}</Text>
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
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DB2777',
  },
  listItemContent: {
    flex: 1,
  },
  listItemText: {
    flex: 1,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
 * Generate stylist profile component (React Native)
 */
export function generateStylistProfile(options: SalonOptions = {}): string {
  const { componentName = 'StylistProfile', endpoint = '/stylists' } = options;

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

interface Stylist {
  id: string;
  name: string;
  avatar_url?: string;
  specialty: string;
  bio?: string;
  experience_years: number;
  rating: number;
  reviews_count: number;
  services: string[];
  certifications?: string[];
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  availability?: string;
  price_range?: string;
}

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const { data: stylist, isLoading } = useQuery({
    queryKey: ['stylist', id],
    queryFn: async () => {
      const response = await api.get<Stylist>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const handleCall = () => {
    if (stylist?.phone) Linking.openURL(\`tel:\${stylist.phone}\`);
  };

  const handleEmail = () => {
    if (stylist?.email) Linking.openURL(\`mailto:\${stylist.email}\`);
  };

  const handleInstagram = () => {
    if (stylist?.instagram) Linking.openURL(\`https://instagram.com/\${stylist.instagram}\`);
  };

  const handleBooking = () => {
    navigation.navigate('BookAppointment' as never, { stylist_id: stylist?.id } as never);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  if (!stylist) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Stylist not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {stylist.avatar_url ? (
            <Image source={{ uri: stylist.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={styles.name}>{stylist.name}</Text>
        <View style={styles.specialtyRow}>
          <Ionicons name="cut" size={16} color="rgba(255,255,255,0.9)" />
          <Text style={styles.specialty}>{stylist.specialty}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={18} color="#FCD34D" />
            <Text style={styles.statValue}>{stylist.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>({stylist.reviews_count})</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time" size={18} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>{stylist.experience_years}</Text>
            <Text style={styles.statLabel}>years</Text>
          </View>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Information</Text>
        <View style={styles.contactList}>
          {stylist.email && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <Ionicons name="mail-outline" size={20} color="#EC4899" />
              <Text style={styles.contactText}>{stylist.email}</Text>
            </TouchableOpacity>
          )}
          {stylist.phone && (
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <Ionicons name="call-outline" size={20} color="#EC4899" />
              <Text style={styles.contactText}>{stylist.phone}</Text>
            </TouchableOpacity>
          )}
          {stylist.instagram && (
            <TouchableOpacity style={styles.contactItem} onPress={handleInstagram}>
              <Ionicons name="logo-instagram" size={20} color="#EC4899" />
              <Text style={styles.contactText}>@{stylist.instagram}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Services */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Services</Text>
        <View style={styles.tagContainer}>
          {stylist.services?.map((service) => (
            <View key={service} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bio */}
      {stylist.bio && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.bioText}>{stylist.bio}</Text>
        </View>
      )}

      {/* Certifications */}
      {stylist.certifications && stylist.certifications.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Certifications</Text>
          {stylist.certifications.map((cert) => (
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
        <Text style={styles.bookButtonText}>Book Appointment</Text>
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
    backgroundColor: '#EC4899',
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
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  specialty: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
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
  serviceTag: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  serviceTagText: {
    fontSize: 13,
    color: '#DB2777',
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
  },
  certText: {
    fontSize: 14,
    color: '#374151',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EC4899',
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
 * Generate stylist schedule component (React Native)
 */
export function generateStylistSchedule(options: SalonOptions = {}): string {
  const { componentName = 'StylistSchedule', endpoint = '/schedules' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface DaySchedule {
  day: string;
  available: boolean;
  start_time?: string;
  end_time?: string;
  break_start?: string;
  break_end?: string;
}

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['stylist-schedule', id],
    queryFn: async () => {
      const response = await api.get<DaySchedule[]>('${endpoint}?stylist_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getScheduleForDay = (day: string): DaySchedule | undefined => {
    if (Array.isArray(schedule)) {
      return schedule.find((s) => s.day === day);
    }
    return undefined;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="time" size={20} color="#EC4899" />
          <Text style={styles.title}>Working Hours</Text>
        </View>

        {days.map((day) => {
          const daySchedule = getScheduleForDay(day);
          const isAvailable = daySchedule?.available !== false;

          return (
            <View key={day} style={styles.dayRow}>
              <Text style={styles.dayName}>{day}</Text>
              {isAvailable && daySchedule ? (
                <View style={styles.scheduleInfo}>
                  <View style={styles.timeContainer}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.timeText}>
                      {daySchedule.start_time || '9:00 AM'} - {daySchedule.end_time || '6:00 PM'}
                    </Text>
                  </View>
                  {daySchedule.break_start && daySchedule.break_end && (
                    <View style={styles.breakContainer}>
                      <Ionicons name="cafe" size={12} color="#F59E0B" />
                      <Text style={styles.breakText}>
                        Break: {daySchedule.break_start} - {daySchedule.break_end}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.closedContainer}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                  <Text style={styles.closedText}>Closed</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
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
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  scheduleInfo: {
    alignItems: 'flex-end',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  breakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  breakText: {
    fontSize: 12,
    color: '#F59E0B',
  },
  closedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  closedText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}

/**
 * Generate client profile component for salon (React Native)
 */
export function generateClientProfileSalon(options: SalonOptions = {}): string {
  const { componentName = 'ClientProfileSalon', endpoint = '/clients' } = options;

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
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ClientVisit {
  id: string;
  date: string;
  service: string;
  stylist_name: string;
  amount: number;
  rating?: number;
  notes?: string;
}

interface Client {
  id: string;
  name: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  joined_at: string;
  total_visits: number;
  total_spent: number;
  average_rating?: number;
  preferred_stylist?: string;
  preferred_services?: string[];
  allergies?: string[];
  notes?: string;
  upcoming_appointment?: {
    date: string;
    time: string;
    service: string;
    stylist: string;
  };
  visit_history: ClientVisit[];
}

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const { data: client, isLoading } = useQuery({
    queryKey: ['salon-client', id],
    queryFn: async () => {
      const response = await api.get<Client>('${endpoint}/' + id);
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
    navigation.navigate('BookAppointment' as never, { client_id: client?.id } as never);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
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
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="calendar" size={24} color="#EC4899" />
            <Text style={styles.statValue}>{client.total_visits}</Text>
            <Text style={styles.statLabel}>Visits</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="card" size={24} color="#10B981" />
            <Text style={styles.statValue}>\${client.total_spent}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="star" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{client.average_rating?.toFixed(1) || 'N/A'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="heart" size={24} color="#8B5CF6" />
            <Text style={styles.statValue} numberOfLines={1}>
              {client.preferred_stylist || '-'}
            </Text>
            <Text style={styles.statLabel}>Stylist</Text>
          </View>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Information</Text>
        <View style={styles.contactList}>
          {client.email && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <Ionicons name="mail-outline" size={20} color="#EC4899" />
              <Text style={styles.contactText}>{client.email}</Text>
            </TouchableOpacity>
          )}
          {client.phone && (
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <Ionicons name="call-outline" size={20} color="#EC4899" />
              <Text style={styles.contactText}>{client.phone}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Preferred Services */}
      {client.preferred_services && client.preferred_services.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cut" size={18} color="#EC4899" />
            <Text style={styles.cardTitle}>Preferred Services</Text>
          </View>
          <View style={styles.tagContainer}>
            {client.preferred_services.map((service) => (
              <View key={service} style={styles.tag}>
                <Text style={styles.tagText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Allergies */}
      {client.allergies && client.allergies.length > 0 && (
        <View style={[styles.card, styles.alertCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={[styles.cardTitle, { color: '#DC2626' }]}>Allergies & Sensitivities</Text>
          </View>
          <View style={styles.tagContainer}>
            {client.allergies.map((allergy) => (
              <View key={allergy} style={styles.alertTag}>
                <Text style={styles.alertTagText}>{allergy}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Upcoming Appointment */}
      {client.upcoming_appointment && (
        <View style={styles.upcomingCard}>
          <Text style={styles.upcomingTitle}>Upcoming Appointment</Text>
          <View style={styles.upcomingContent}>
            <View>
              <Text style={styles.upcomingService}>{client.upcoming_appointment.service}</Text>
              <Text style={styles.upcomingStylist}>with {client.upcoming_appointment.stylist}</Text>
            </View>
            <View style={styles.upcomingMeta}>
              <Text style={styles.upcomingDate}>{formatDate(client.upcoming_appointment.date)}</Text>
              <Text style={styles.upcomingTime}>{client.upcoming_appointment.time}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Visit History */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={18} color="#8B5CF6" />
          <Text style={styles.cardTitle}>Visit History</Text>
        </View>
        {client.visit_history?.length > 0 ? (
          client.visit_history.map((visit) => (
            <View key={visit.id} style={styles.visitItem}>
              <View style={styles.visitInfo}>
                <Text style={styles.visitService}>{visit.service}</Text>
                <Text style={styles.visitStylist}>with {visit.stylist_name}</Text>
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
        <Text style={styles.bookButtonText}>Book New Appointment</Text>
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
    backgroundColor: '#EC4899',
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
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#DB2777',
    fontWeight: '500',
  },
  alertTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  alertTagText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  upcomingCard: {
    backgroundColor: '#8B5CF6',
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
    alignItems: 'center',
  },
  upcomingService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  upcomingStylist: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
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
  visitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 8,
  },
  visitInfo: {
    flex: 1,
  },
  visitService: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  visitStylist: {
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
    backgroundColor: '#EC4899',
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
