/**
 * React Native Flight School Component Generators
 *
 * Generates flight training-related components for mobile applications.
 * Components: FlightCalendar, FlightListToday, FlightStats, StudentProfileFlight, AircraftStatusOverview
 */

export interface FlightCalendarOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFlightCalendar(options: FlightCalendarOptions = {}): string {
  const { componentName = 'FlightCalendar', endpoint = '/flight/lessons' } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface ${componentName}Props {
  studentId?: string;
  instructorId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ studentId, instructorId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  const { data: flights, isLoading } = useQuery({
    queryKey: ['flight-calendar', currentMonth.getMonth(), currentMonth.getFullYear(), studentId, instructorId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('month', String(currentMonth.getMonth() + 1));
      params.append('year', String(currentMonth.getFullYear()));
      if (studentId) params.append('student_id', studentId);
      if (instructorId) params.append('instructor_id', instructorId);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
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
  }, [currentMonth]);

  const getFlightsForDate = (date: Date) => {
    if (!flights) return [];
    return flights.filter((flight: any) => {
      const flightDate = new Date(flight.date);
      return flightDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const getFlightTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      training: { bg: '#DBEAFE', text: '#3B82F6' },
      solo: { bg: '#DCFCE7', text: '#16A34A' },
      checkride: { bg: '#FEE2E2', text: '#DC2626' },
      cross_country: { bg: '#F3E8FF', text: '#9333EA' },
      ground: { bg: '#FEF3C7', text: '#D97706' },
    };
    return colors[type?.toLowerCase()] || colors.training;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="airplane-outline" size={20} color="#0EA5E9" />
            <Text style={styles.title}>Flight Schedule</Text>
          </View>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAYS.map(day => (
            <Text key={day} style={styles.weekday}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarDays.map((day, idx) => {
            const dayFlights = getFlightsForDate(day.date);
            return (
              <View key={idx} style={[styles.dayCell, !day.isCurrentMonth && styles.dayCellDisabled]}>
                <Text style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.dayTextDisabled,
                  isToday(day.date) && styles.dayTextToday,
                ]}>
                  {day.date.getDate()}
                </Text>
                <View style={styles.flightList}>
                  {dayFlights.slice(0, 2).map((flight: any, i: number) => {
                    const colors = getFlightTypeColor(flight.type);
                    return (
                      <TouchableOpacity
                        key={flight.id || i}
                        onPress={() => setSelectedFlight(flight)}
                        style={[styles.flightBadge, { backgroundColor: colors.bg }]}
                      >
                        <Text style={[styles.flightText, { color: colors.text }]} numberOfLines={1}>
                          {flight.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {dayFlights.length > 2 && (
                    <Text style={styles.moreText}>+{dayFlights.length - 2}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={[styles.legendItem, { backgroundColor: '#DBEAFE' }]}>
            <Text style={{ color: '#3B82F6', fontSize: 10 }}>Training</Text>
          </View>
          <View style={[styles.legendItem, { backgroundColor: '#DCFCE7' }]}>
            <Text style={{ color: '#16A34A', fontSize: 10 }}>Solo</Text>
          </View>
          <View style={[styles.legendItem, { backgroundColor: '#FEE2E2' }]}>
            <Text style={{ color: '#DC2626', fontSize: 10 }}>Checkride</Text>
          </View>
          <View style={[styles.legendItem, { backgroundColor: '#F3E8FF' }]}>
            <Text style={{ color: '#9333EA', fontSize: 10 }}>X-Country</Text>
          </View>
        </View>
      </View>

      {/* Flight Detail Modal */}
      <Modal visible={!!selectedFlight} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSelectedFlight(null)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedFlight?.type || 'Flight'} Lesson</Text>
            <View style={styles.modalInfo}>
              <View style={styles.modalRow}>
                <Ionicons name="person-outline" size={16} color="#6B7280" />
                <Text style={styles.modalText}>{selectedFlight?.instructor_name || selectedFlight?.student_name}</Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.modalText}>
                  {selectedFlight && new Date(selectedFlight.date).toLocaleDateString()} at {selectedFlight?.time}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.modalText}>Duration: {selectedFlight?.duration || 1.5} hours</Text>
              </View>
              {selectedFlight?.aircraft && (
                <View style={styles.modalRow}>
                  <Ionicons name="airplane-outline" size={16} color="#6B7280" />
                  <Text style={styles.modalText}>Aircraft: {selectedFlight.aircraft}</Text>
                </View>
              )}
              {selectedFlight?.route && (
                <View style={styles.modalRow}>
                  <Ionicons name="navigate-outline" size={16} color="#6B7280" />
                  <Text style={styles.modalText}>Route: {selectedFlight.route}</Text>
                </View>
              )}
              {selectedFlight?.maneuvers && (
                <View style={styles.maneuversSection}>
                  <Text style={styles.maneuversTitle}>Maneuvers:</Text>
                  <Text style={styles.maneuversText}>{selectedFlight.maneuvers.join(', ')}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedFlight(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 48,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 4,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    minWidth: 120,
    textAlign: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    minHeight: 70,
    padding: 4,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayCellDisabled: {
    backgroundColor: '#F9FAFB',
  },
  dayText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  dayTextDisabled: {
    color: '#D1D5DB',
  },
  dayTextToday: {
    color: '#0EA5E9',
    fontWeight: '700',
  },
  flightList: {
    gap: 2,
  },
  flightBadge: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  flightText: {
    fontSize: 9,
  },
  moreText: {
    fontSize: 9,
    color: '#0EA5E9',
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  legendItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  modalInfo: {
    gap: 12,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#6B7280',
  },
  maneuversSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  maneuversTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  maneuversText: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    marginTop: 24,
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

export interface FlightListTodayOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFlightListToday(options: FlightListTodayOptions = {}): string {
  const { componentName = 'FlightListToday', endpoint = '/flight/lessons/today' } = options;

  return `import React from 'react';
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

  const { data, isLoading } = useQuery({
    queryKey: ['flights-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  const getFlightTypeStyle = (type: string) => {
    const styles: Record<string, { bg: string; text: string; icon: string }> = {
      training: { bg: '#DBEAFE', text: '#3B82F6', icon: 'school-outline' },
      solo: { bg: '#DCFCE7', text: '#16A34A', icon: 'person-outline' },
      checkride: { bg: '#FEE2E2', text: '#DC2626', icon: 'document-text-outline' },
      cross_country: { bg: '#F3E8FF', text: '#9333EA', icon: 'navigate-outline' },
      ground: { bg: '#FEF3C7', text: '#D97706', icon: 'book-outline' },
    };
    return styles[type?.toLowerCase()] || styles.training;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0EA5E9" />
      </View>
    );
  }

  const flights = data?.flights || data || [];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Ionicons name="airplane-outline" size={20} color="#0EA5E9" />
            <Text style={styles.title}>Today's Flights</Text>
          </View>
          <Text style={styles.dateText}>{today}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('FlightSchedule' as never)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#0EA5E9" />
        </TouchableOpacity>
      </View>

      {flights.length > 0 ? (
        <FlatList
          data={flights}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item: flight }) => {
            const typeStyle = getFlightTypeStyle(flight.type);
            return (
              <View style={styles.flightItem}>
                <View style={[styles.flightIcon, { backgroundColor: typeStyle.bg }]}>
                  <Ionicons name={typeStyle.icon as any} size={20} color={typeStyle.text} />
                </View>
                <View style={styles.flightInfo}>
                  <Text style={styles.flightType}>{flight.type || 'Training'} Flight</Text>
                  <View style={styles.flightMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.metaText}>{flight.time}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="person-outline" size={14} color="#6B7280" />
                      <Text style={styles.metaText}>{flight.student_name || flight.instructor_name}</Text>
                    </View>
                  </View>
                  <View style={styles.flightMeta}>
                    {flight.aircraft && (
                      <View style={styles.metaItem}>
                        <Ionicons name="airplane-outline" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{flight.aircraft}</Text>
                      </View>
                    )}
                    {flight.route && (
                      <View style={styles.metaItem}>
                        <Ionicons name="navigate-outline" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{flight.route}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={[styles.durationBadge, { backgroundColor: typeStyle.bg }]}>
                  <Text style={[styles.durationText, { color: typeStyle.text }]}>
                    {flight.duration || 1.5}h
                  </Text>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="airplane-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No flights scheduled for today</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0EA5E9',
  },
  flightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  flightIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flightInfo: {
    flex: 1,
    marginLeft: 12,
  },
  flightType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  flightMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  durationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default ${componentName};
`;
}

export interface FlightStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFlightStats(options: FlightStatsOptions = {}): string {
  const { componentName = 'FlightStats', endpoint = '/flight/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  studentId?: string;
  style?: object;
}

const ${componentName}: React.FC<${componentName}Props> = ({ studentId, style }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['flight-stats', studentId],
    queryFn: async () => {
      let url = '${endpoint}';
      if (studentId) url += \`?student_id=\${studentId}\`;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={[style, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <View style={style}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="time-outline" size={24} color="#0EA5E9" />
          </View>
          <Text style={styles.statValue}>{stats?.total_hours || 0}</Text>
          <Text style={styles.statLabel}>Flight Hours</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="airplane-outline" size={24} color="#16A34A" />
          </View>
          <Text style={styles.statValue}>{stats?.total_flights || 0}</Text>
          <Text style={styles.statLabel}>Total Flights</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="person-outline" size={24} color="#D97706" />
          </View>
          <Text style={styles.statValue}>{stats?.solo_hours || 0}</Text>
          <Text style={styles.statLabel}>Solo Hours</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="navigate-outline" size={24} color="#9333EA" />
          </View>
          <Text style={styles.statValue}>{stats?.cross_country_hours || 0}</Text>
          <Text style={styles.statLabel}>X-Country Hours</Text>
        </View>
      </View>

      {/* Additional Stats */}
      <View style={styles.additionalStats}>
        <View style={[styles.gradientCard, { backgroundColor: '#0EA5E9' }]}>
          <View style={styles.gradientHeader}>
            <Ionicons name="cloudy-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.gradientLabel}>Night Hours</Text>
          </View>
          <Text style={styles.gradientValue}>{stats?.night_hours || 0}</Text>
        </View>
        <View style={[styles.gradientCard, { backgroundColor: '#7C3AED' }]}>
          <View style={styles.gradientHeader}>
            <Ionicons name="cloud-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.gradientLabel}>Instrument Hours</Text>
          </View>
          <Text style={styles.gradientValue}>{stats?.instrument_hours || 0}</Text>
        </View>
      </View>

      {/* Progress to Certificate */}
      {stats?.certificate_progress && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Progress to {stats.certificate_name || 'Private Pilot'}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: \`\${stats.certificate_progress}%\` }]} />
          </View>
          <Text style={styles.progressText}>{stats.certificate_progress}% complete</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  additionalStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gradientCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
  },
  gradientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  gradientLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  gradientValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'right',
  },
});

export default ${componentName};
`;
}

export interface StudentProfileFlightOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProfileFlight(options: StudentProfileFlightOptions = {}): string {
  const { componentName = 'StudentProfileFlight', endpoint = '/flight/students' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: student, isLoading } = useQuery({
    queryKey: ['flight-student', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Student not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          {student.avatar_url ? (
            <Image source={{ uri: student.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={32} color="#0EA5E9" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{student.name}</Text>
            {student.certificate_goal && (
              <View style={styles.goalBadge}>
                <Text style={styles.goalText}>{student.certificate_goal}</Text>
              </View>
            )}
            <View style={styles.contactRow}>
              {student.email && (
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={14} color="#6B7280" />
                  <Text style={styles.contactText}>{student.email}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => navigation.navigate('ScheduleFlight' as never, { studentId: student.id } as never)}
        >
          <Ionicons name="airplane-outline" size={18} color="#FFFFFF" />
          <Text style={styles.scheduleButtonText}>Schedule Flight</Text>
        </TouchableOpacity>
      </View>

      {/* Medical & Certificates */}
      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Ionicons name="medical-outline" size={24} color="#DC2626" />
          <Text style={styles.infoLabel}>Medical</Text>
          <Text style={styles.infoValue}>{student.medical_class || 'Class 3'}</Text>
          {student.medical_expires && (
            <Text style={styles.infoExpiry}>
              Exp: {new Date(student.medical_expires).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="document-text-outline" size={24} color="#0EA5E9" />
          <Text style={styles.infoLabel}>Student Cert</Text>
          <Text style={styles.infoValue}>{student.student_cert_number || 'N/A'}</Text>
          {student.student_cert_expires && (
            <Text style={styles.infoExpiry}>
              Exp: {new Date(student.student_cert_expires).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {/* Flight Hours Summary */}
      <View style={styles.hoursCard}>
        <Text style={styles.sectionTitle}>Flight Hours</Text>
        <View style={styles.hoursGrid}>
          <View style={styles.hourItem}>
            <Text style={styles.hourValue}>{student.total_hours || 0}</Text>
            <Text style={styles.hourLabel}>Total</Text>
          </View>
          <View style={styles.hourItem}>
            <Text style={styles.hourValue}>{student.dual_hours || 0}</Text>
            <Text style={styles.hourLabel}>Dual</Text>
          </View>
          <View style={styles.hourItem}>
            <Text style={styles.hourValue}>{student.solo_hours || 0}</Text>
            <Text style={styles.hourLabel}>Solo</Text>
          </View>
          <View style={styles.hourItem}>
            <Text style={styles.hourValue}>{student.cross_country_hours || 0}</Text>
            <Text style={styles.hourLabel}>X-Country</Text>
          </View>
          <View style={styles.hourItem}>
            <Text style={styles.hourValue}>{student.night_hours || 0}</Text>
            <Text style={styles.hourLabel}>Night</Text>
          </View>
          <View style={styles.hourItem}>
            <Text style={styles.hourValue}>{student.instrument_hours || 0}</Text>
            <Text style={styles.hourLabel}>Instrument</Text>
          </View>
        </View>
      </View>

      {/* Endorsements */}
      {student.endorsements && student.endorsements.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Endorsements</Text>
          {student.endorsements.map((endorsement: any, i: number) => (
            <View key={i} style={styles.endorsementItem}>
              <View style={styles.endorsementIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              </View>
              <View style={styles.endorsementInfo}>
                <Text style={styles.endorsementName}>{endorsement.name}</Text>
                <Text style={styles.endorsementDate}>
                  {new Date(endorsement.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Upcoming Checkride */}
      {student.upcoming_checkride && (
        <View style={styles.checkrideCard}>
          <View style={styles.checkrideIcon}>
            <Ionicons name="ribbon-outline" size={24} color="#DC2626" />
          </View>
          <View style={styles.checkrideInfo}>
            <Text style={styles.checkrideTitle}>Upcoming Checkride</Text>
            <Text style={styles.checkrideType}>{student.upcoming_checkride.type}</Text>
            <Text style={styles.checkrideDate}>
              {new Date(student.upcoming_checkride.date).toLocaleDateString()} at {student.upcoming_checkride.time}
            </Text>
          </View>
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
  headerCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  goalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  goalText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  contactRow: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 13,
    color: '#6B7280',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  infoExpiry: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  hoursCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hourItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  hourValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  hourLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  endorsementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  endorsementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endorsementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  endorsementName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  endorsementDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  checkrideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  checkrideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkrideInfo: {
    flex: 1,
    marginLeft: 12,
  },
  checkrideTitle: {
    fontSize: 12,
    color: '#991B1B',
  },
  checkrideType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 2,
  },
  checkrideDate: {
    fontSize: 14,
    color: '#991B1B',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export interface AircraftStatusOverviewOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAircraftStatusOverview(options: AircraftStatusOverviewOptions = {}): string {
  const { componentName = 'AircraftStatusOverview', endpoint = '/flight/aircraft' } = options;

  return `import React from 'react';
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

  const { data, isLoading } = useQuery({
    queryKey: ['aircraft-status'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: string }> = {
      available: { bg: '#DCFCE7', text: '#16A34A', icon: 'checkmark-circle-outline' },
      in_flight: { bg: '#DBEAFE', text: '#3B82F6', icon: 'airplane' },
      maintenance: { bg: '#FEF3C7', text: '#D97706', icon: 'construct-outline' },
      grounded: { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle-outline' },
    };
    return styles[status?.toLowerCase()] || styles.available;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0EA5E9" />
      </View>
    );
  }

  const aircraft = data?.aircraft || data || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="airplane-outline" size={20} color="#0EA5E9" />
          <Text style={styles.title}>Aircraft Status</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Aircraft' as never)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#0EA5E9" />
        </TouchableOpacity>
      </View>

      {aircraft.length > 0 ? (
        <FlatList
          data={aircraft}
          keyExtractor={(item) => item.id || item.tail_number}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <TouchableOpacity
                style={styles.aircraftItem}
                onPress={() => navigation.navigate('AircraftDetail' as never, { id: item.id } as never)}
              >
                <View style={styles.aircraftIcon}>
                  <Ionicons name="airplane" size={24} color="#0EA5E9" />
                </View>
                <View style={styles.aircraftInfo}>
                  <Text style={styles.tailNumber}>{item.tail_number}</Text>
                  <Text style={styles.aircraftModel}>{item.model || item.type}</Text>
                  <View style={styles.aircraftMeta}>
                    {item.hobbs_hours && (
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={12} color="#6B7280" />
                        <Text style={styles.metaText}>{item.hobbs_hours} Hobbs</Text>
                      </View>
                    )}
                    {item.next_due && (
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                        <Text style={styles.metaText}>Due: {item.next_due}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text} />
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {item.status?.replace('_', ' ')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="airplane-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No aircraft available</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 32,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0EA5E9',
  },
  aircraftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  aircraftIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aircraftInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tailNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  aircraftModel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  aircraftMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default ${componentName};
`;
}
