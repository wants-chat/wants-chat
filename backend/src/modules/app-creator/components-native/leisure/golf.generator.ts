/**
 * Golf Component Generators (React Native)
 *
 * Generates golf-specific components including:
 * - GolfStats: Key performance metrics and statistics
 * - TeeTimeCalendar: Calendar view for tee time scheduling
 * - TeeTimeListToday: Today's tee time schedule list
 * - MemberProfileGolf: Member profile with golf-specific data
 * - TournamentListUpcoming: Upcoming tournaments list
 * - LessonCalendarGolf: Golf lessons scheduling calendar
 */

export interface GolfStatsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface TeeTimeCalendarOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface TeeTimeListOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface MemberProfileGolfOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface TournamentListOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface LessonCalendarGolfOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate Golf Stats component (React Native)
 */
export function generateGolfStats(options: GolfStatsOptions = {}): string {
  const {
    componentName = 'GolfStats',
    endpoint = '/golf/stats',
    queryKey = 'golf-stats',
  } = options;

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

interface ${componentName}Props {
  memberId?: string;
}

interface GolfStatsData {
  handicap?: number;
  handicapChange?: number;
  roundsPlayed?: number;
  roundsPlayedChange?: number;
  averageScore?: number;
  averageScoreChange?: number;
  bestScore?: number;
  fairwayHitPercent?: number;
  greensInRegulationPercent?: number;
  puttsPerRound?: number;
  birdies?: number;
  pars?: number;
  eagles?: number;
  coursesPlayed?: number;
  tournamentsWon?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ memberId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}', memberId],
    queryFn: async () => {
      try {
        const url = memberId ? \`${endpoint}?memberId=\${memberId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return (response?.data || response || {}) as GolfStatsData;
      } catch (err) {
        console.error('Failed to fetch golf stats:', err);
        return {} as GolfStatsData;
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const statCards = [
    {
      key: 'handicap',
      label: 'Handicap Index',
      value: stats?.handicap ?? '-',
      change: stats?.handicapChange,
      icon: 'golf-outline',
      color: '#16A34A',
      inverseChange: true,
    },
    {
      key: 'roundsPlayed',
      label: 'Rounds Played',
      value: stats?.roundsPlayed ?? 0,
      change: stats?.roundsPlayedChange,
      icon: 'flag-outline',
      color: '#3B82F6',
    },
    {
      key: 'averageScore',
      label: 'Average Score',
      value: stats?.averageScore ?? '-',
      change: stats?.averageScoreChange,
      icon: 'trending-up-outline',
      color: '#8B5CF6',
      inverseChange: true,
    },
    {
      key: 'bestScore',
      label: 'Best Score',
      value: stats?.bestScore ?? '-',
      icon: 'trophy-outline',
      color: '#EAB308',
    },
    {
      key: 'fairwayHit',
      label: 'Fairways Hit',
      value: stats?.fairwayHitPercent ? \`\${stats.fairwayHitPercent}%\` : '-',
      icon: 'navigate-outline',
      color: '#10B981',
    },
    {
      key: 'gir',
      label: 'Greens in Regulation',
      value: stats?.greensInRegulationPercent ? \`\${stats.greensInRegulationPercent}%\` : '-',
      icon: 'golf-outline',
      color: '#14B8A6',
    },
    {
      key: 'putts',
      label: 'Putts per Round',
      value: stats?.puttsPerRound ?? '-',
      icon: 'flag-outline',
      color: '#6366F1',
    },
    {
      key: 'birdies',
      label: 'Total Birdies',
      value: stats?.birdies ?? 0,
      icon: 'ribbon-outline',
      color: '#F97316',
    },
  ];

  const renderTrendIcon = (change?: number, inverseChange?: boolean) => {
    if (change === undefined || change === null) return null;
    const isPositive = inverseChange ? change < 0 : change > 0;
    return (
      <View style={[styles.trendBadge, isPositive ? styles.trendPositive : styles.trendNegative]}>
        <Ionicons
          name={isPositive ? 'trending-up-outline' : 'trending-down-outline'}
          size={12}
          color={isPositive ? '#16A34A' : '#DC2626'}
        />
        <Text style={[styles.trendText, isPositive ? styles.trendTextPositive : styles.trendTextNegative]}>
          {Math.abs(change)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Golf Statistics</Text>
        <View style={styles.seasonBadge}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.seasonText}>This Season</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((stat) => (
          <View key={stat.key} style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              {renderTrendIcon(stat.change, stat.inverseChange)}
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.additionalStats}>
        <View style={styles.additionalStatCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#16A34A20' }]}>
            <Ionicons name="location-outline" size={24} color="#16A34A" />
          </View>
          <View style={styles.additionalStatContent}>
            <Text style={styles.additionalStatValue}>{stats?.coursesPlayed ?? 0}</Text>
            <Text style={styles.additionalStatLabel}>Courses Played</Text>
          </View>
        </View>

        <View style={styles.additionalStatCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#EAB30820' }]}>
            <Ionicons name="trophy-outline" size={24} color="#EAB308" />
          </View>
          <View style={styles.additionalStatContent}>
            <Text style={styles.additionalStatValue}>{stats?.tournamentsWon ?? 0}</Text>
            <Text style={styles.additionalStatLabel}>Tournaments Won</Text>
          </View>
        </View>

        <View style={styles.additionalStatCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#8B5CF620' }]}>
            <Ionicons name="star-outline" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.additionalStatContent}>
            <Text style={styles.additionalStatValue}>{stats?.eagles ?? 0}</Text>
            <Text style={styles.additionalStatLabel}>Eagles</Text>
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seasonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
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
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendPositive: {
    backgroundColor: '#DCFCE7',
  },
  trendNegative: {
    backgroundColor: '#FEE2E2',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendTextPositive: {
    color: '#16A34A',
  },
  trendTextNegative: {
    color: '#DC2626',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  additionalStats: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  additionalStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  additionalStatContent: {
    flex: 1,
  },
  additionalStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  additionalStatLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generate Tee Time Calendar component (React Native)
 */
export function generateTeeTimeCalendar(options: TeeTimeCalendarOptions = {}): string {
  const {
    componentName = 'TeeTimeCalendar',
    endpoint = '/golf/tee-times',
    queryKey = 'golf-tee-times',
  } = options;

  return `import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface ${componentName}Props {
  courseId?: string;
}

interface TeeTime {
  id: string;
  time: string;
  date: string;
  course_name?: string;
  course_id?: string;
  holes?: number;
  players?: number;
  max_players?: number;
  status?: 'available' | 'booked' | 'pending';
  price?: number;
  member_names?: string[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ${componentName}: React.FC<${componentName}Props> = ({ courseId }) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTeeTime, setSelectedTeeTime] = useState<TeeTime | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: teeTimes, isLoading } = useQuery({
    queryKey: ['${queryKey}', currentDate.getMonth(), currentDate.getFullYear(), courseId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
        });
        if (courseId) params.append('courseId', courseId);
        const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
        return (Array.isArray(response) ? response : (response?.data || [])) as TeeTime[];
      } catch (err) {
        console.error('Failed to fetch tee times:', err);
        return [];
      }
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (teeTimeId: string) => {
      return api.post('/golf/bookings', { tee_time_id: teeTimeId });
    },
    onSuccess: () => {
      showToast('success', 'Tee time booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
      setShowBookingModal(false);
      setSelectedTeeTime(null);
    },
    onError: () => {
      showToast('error', 'Failed to book tee time');
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

  const getTeeTimesForDate = useCallback((date: Date) => {
    if (!teeTimes) return [];
    return teeTimes.filter((tt) => {
      const teeDate = new Date(tt.date);
      return (
        teeDate.getFullYear() === date.getFullYear() &&
        teeDate.getMonth() === date.getMonth() &&
        teeDate.getDate() === date.getDate()
      );
    });
  }, [teeTimes]);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const navigatePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return '#16A34A';
      case 'booked':
        return '#6B7280';
      case 'pending':
        return '#EAB308';
      default:
        return '#3B82F6';
    }
  };

  const handleBookTeeTime = () => {
    if (selectedTeeTime) {
      Alert.alert(
        'Confirm Booking',
        'Are you sure you want to book this tee time?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Book', onPress: () => bookMutation.mutate(selectedTeeTime.id) },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <View style={styles.navButtons}>
            <TouchableOpacity onPress={navigatePrev} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={navigateNext} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookTeeTime' as never)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Weekday Headers */}
        <View style={styles.weekdayHeader}>
          {WEEKDAYS.map((day) => (
            <Text key={day} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>

        {/* Days Grid */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.daysGrid}>
            {calendarDays.map((day, idx) => {
              const dayTeeTimes = getTeeTimesForDate(day.date);
              const availableCount = dayTeeTimes.filter((t) => t.status === 'available').length;

              return (
                <View
                  key={idx}
                  style={[
                    styles.dayCell,
                    !day.isCurrentMonth && styles.dayCellOtherMonth,
                  ]}
                >
                  <View style={[
                    styles.dayNumber,
                    isToday(day.date) && styles.dayNumberToday,
                  ]}>
                    <Text style={[
                      styles.dayNumberText,
                      isToday(day.date) && styles.dayNumberTextToday,
                      !day.isCurrentMonth && styles.dayNumberTextOther,
                    ]}>
                      {day.date.getDate()}
                    </Text>
                  </View>

                  {availableCount > 0 && day.isCurrentMonth && (
                    <Text style={styles.availableText}>{availableCount} avail</Text>
                  )}

                  {dayTeeTimes.slice(0, 2).map((teeTime) => (
                    <TouchableOpacity
                      key={teeTime.id}
                      style={[
                        styles.teeTimeItem,
                        { borderLeftColor: getStatusColor(teeTime.status) },
                      ]}
                      onPress={() => {
                        setSelectedTeeTime(teeTime);
                        if (teeTime.status === 'available') {
                          setShowBookingModal(true);
                        }
                      }}
                    >
                      <Text style={styles.teeTimeText} numberOfLines={1}>
                        {teeTime.time} - {teeTime.holes || 18}H
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {dayTeeTimes.length > 2 && (
                    <Text style={styles.moreText}>+{dayTeeTimes.length - 2} more</Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
      </View>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Tee Time</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedTeeTime && (
              <View style={styles.modalBody}>
                <View style={styles.modalRow}>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                  <Text style={styles.modalText}>
                    {new Date(selectedTeeTime.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                  <Text style={styles.modalText}>{selectedTeeTime.time}</Text>
                </View>
                {selectedTeeTime.course_name && (
                  <View style={styles.modalRow}>
                    <Ionicons name="location-outline" size={20} color="#6B7280" />
                    <Text style={styles.modalText}>{selectedTeeTime.course_name}</Text>
                  </View>
                )}
                <View style={styles.modalRow}>
                  <Ionicons name="flag-outline" size={20} color="#6B7280" />
                  <Text style={styles.modalText}>{selectedTeeTime.holes || 18} Holes</Text>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="people-outline" size={20} color="#6B7280" />
                  <Text style={styles.modalText}>
                    {selectedTeeTime.players || 0} / {selectedTeeTime.max_players || 4} Players
                  </Text>
                </View>
                {selectedTeeTime.price && (
                  <Text style={styles.priceText}>\${selectedTeeTime.price} per player</Text>
                )}
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleBookTeeTime}
                disabled={bookMutation.isPending}
              >
                {bookMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
    backgroundColor: '#F9FAFB',
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
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekdayHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 12,
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
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayCellOtherMonth: {
    backgroundColor: '#F9FAFB',
  },
  dayNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  dayNumberToday: {
    backgroundColor: '#16A34A',
  },
  dayNumberText: {
    fontSize: 12,
    color: '#374151',
  },
  dayNumberTextToday: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayNumberTextOther: {
    color: '#9CA3AF',
  },
  availableText: {
    fontSize: 8,
    color: '#16A34A',
    marginBottom: 2,
  },
  teeTimeItem: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 2,
  },
  teeTimeText: {
    fontSize: 8,
    color: '#374151',
  },
  moreText: {
    fontSize: 8,
    color: '#6B7280',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  modalBody: {
    gap: 12,
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#374151',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  modalActions: {
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
  },
});

export default ${componentName};
`;
}

/**
 * Generate Tee Time List Today component (React Native)
 */
export function generateTeeTimeListToday(options: TeeTimeListOptions = {}): string {
  const {
    componentName = 'TeeTimeListToday',
    endpoint = '/golf/tee-times/today',
    queryKey = 'golf-tee-times-today',
  } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  courseId?: string;
  limit?: number;
}

interface TeeTime {
  id: string;
  time: string;
  date: string;
  course_name?: string;
  course_id?: string;
  holes?: number;
  players?: Array<{
    id: string;
    name: string;
    avatar_url?: string;
    handicap?: number;
  }>;
  max_players?: number;
  status?: 'available' | 'booked' | 'in_progress' | 'completed';
  weather?: {
    temp?: number;
    condition?: string;
  };
  starting_hole?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ courseId, limit = 10 }) => {
  const navigation = useNavigation();

  const { data: teeTimes, isLoading } = useQuery({
    queryKey: ['${queryKey}', courseId, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (courseId) params.append('courseId', courseId);
        const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
        return (Array.isArray(response) ? response : (response?.data || [])) as TeeTime[];
      } catch (err) {
        console.error('Failed to fetch today tee times:', err);
        return [];
      }
    },
  });

  const getStatusBadge = (status?: string) => {
    const statusConfig: Record<string, { bg: string; color: string; text: string }> = {
      available: { bg: '#DCFCE7', color: '#16A34A', text: 'Available' },
      booked: { bg: '#DBEAFE', color: '#3B82F6', text: 'Booked' },
      in_progress: { bg: '#FEF3C7', color: '#D97706', text: 'In Progress' },
      completed: { bg: '#F3F4F6', color: '#6B7280', text: 'Completed' },
    };
    const config = statusConfig[status || ''] || statusConfig.available;
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
      </View>
    );
  };

  const renderTeeTimeItem = useCallback(({ item }: { item: TeeTime }) => (
    <TouchableOpacity
      style={styles.teeTimeCard}
      onPress={() => navigation.navigate('TeeTimeDetail' as never, { teeTimeId: item.id } as never)}
      activeOpacity={0.7}
    >
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{item.time}</Text>
        <Text style={styles.holeText}>Hole {item.starting_hole || 1}</Text>
      </View>

      <View style={styles.infoColumn}>
        <View style={styles.infoRow}>
          {item.course_name && (
            <Text style={styles.courseName}>{item.course_name}</Text>
          )}
          {getStatusBadge(item.status)}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="flag-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{item.holes || 18} holes</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {item.players?.length || 0}/{item.max_players || 4}
            </Text>
          </View>
          {item.weather && (
            <View style={styles.metaItem}>
              <Ionicons
                name={item.weather.condition === 'sunny' ? 'sunny-outline' : 'cloud-outline'}
                size={14}
                color={item.weather.condition === 'sunny' ? '#EAB308' : '#6B7280'}
              />
              <Text style={styles.metaText}>{item.weather.temp}F</Text>
            </View>
          )}
        </View>

        {item.players && item.players.length > 0 && (
          <View style={styles.playersRow}>
            <View style={styles.avatarStack}>
              {item.players.slice(0, 4).map((player, index) => (
                <View key={player.id} style={[styles.avatarContainer, { marginLeft: index > 0 ? -8 : 0 }]}>
                  {player.avatar_url ? (
                    <Image source={{ uri: player.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>{player.name.charAt(0)}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            <Text style={styles.playerNames} numberOfLines={1}>
              {item.players.map((p) => p.name).join(', ')}
            </Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  ), [navigation]);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="golf-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No tee times scheduled for today</Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: TeeTime) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Tee Times</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('TeeTimeCalendar' as never)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#16A34A" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={teeTimes}
        renderItem={renderTeeTimeItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#16A34A',
  },
  teeTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeColumn: {
    alignItems: 'center',
    minWidth: 60,
    marginRight: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  holeText: {
    fontSize: 11,
    color: '#6B7280',
  },
  infoColumn: {
    flex: 1,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  playerNames: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  separator: {
    height: 8,
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

/**
 * Generate Member Profile Golf component (React Native)
 */
export function generateMemberProfileGolf(options: MemberProfileGolfOptions = {}): string {
  const {
    componentName = 'MemberProfileGolf',
    endpoint = '/golf/members',
    queryKey = 'golf-member',
  } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

type RouteParams = {
  MemberProfile: { memberId: string };
};

interface ${componentName}Props {
  memberId?: string;
}

interface MemberProfile {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  member_since?: string;
  membership_type?: string;
  home_course?: string;
  handicap?: number;
  handicap_trend?: 'up' | 'down' | 'stable';
  stats?: {
    rounds_played?: number;
    average_score?: number;
    best_score?: number;
    tournaments_played?: number;
    tournaments_won?: number;
    birdies?: number;
    eagles?: number;
    holes_in_one?: number;
  };
  recent_rounds?: Array<{
    id: string;
    date: string;
    course_name: string;
    score: number;
    par: number;
  }>;
  achievements?: Array<{
    id: string;
    title: string;
    description?: string;
    earned_at: string;
    icon?: string;
  }>;
}

const ${componentName}: React.FC<${componentName}Props> = ({ memberId: propMemberId }) => {
  const route = useRoute<RouteProp<RouteParams, 'MemberProfile'>>();
  const navigation = useNavigation();
  const memberId = propMemberId || route.params?.memberId;

  const { data: member, isLoading } = useQuery({
    queryKey: ['${queryKey}', memberId],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/\${memberId}\`);
        return (response?.data || response) as MemberProfile;
      } catch (err) {
        console.error('Failed to fetch member:', err);
        return null;
      }
    },
    enabled: !!memberId,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Member not found</Text>
      </View>
    );
  }

  const getHandicapTrend = () => {
    if (member.handicap_trend === 'up') {
      return <Ionicons name="trending-up" size={16} color="#DC2626" />;
    }
    if (member.handicap_trend === 'down') {
      return <Ionicons name="trending-down" size={16} color="#16A34A" />;
    }
    return null;
  };

  const getScoreDiff = (score: number, par: number) => {
    const diff = score - par;
    if (diff === 0) return { text: 'Even', color: '#6B7280' };
    if (diff > 0) return { text: \`+\${diff}\`, color: '#DC2626' };
    return { text: \`\${diff}\`, color: '#16A34A' };
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={20} color="#16A34A" />
        <Text style={styles.backButtonText}>Back to Members</Text>
      </TouchableOpacity>

      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.profileInfo}>
          {member.avatar_url ? (
            <Image source={{ uri: member.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#9CA3AF" />
            </View>
          )}

          <View style={styles.profileDetails}>
            <Text style={styles.memberName}>{member.name}</Text>
            {member.membership_type && (
              <View style={styles.membershipBadge}>
                <Text style={styles.membershipText}>{member.membership_type}</Text>
              </View>
            )}
            {member.home_course && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{member.home_course}</Text>
              </View>
            )}
            {member.member_since && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  Member since {new Date(member.member_since).getFullYear()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Handicap Card */}
        <View style={styles.handicapCard}>
          <Text style={styles.handicapLabel}>Handicap</Text>
          <View style={styles.handicapValue}>
            <Text style={styles.handicapNumber}>{member.handicap ?? '-'}</Text>
            {getHandicapTrend()}
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="flag-outline" size={20} color="#6B7280" />
          <Text style={styles.statValue}>{member.stats?.rounds_played ?? 0}</Text>
          <Text style={styles.statLabel}>Rounds</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="golf-outline" size={20} color="#6B7280" />
          <Text style={styles.statValue}>{member.stats?.average_score ?? '-'}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy-outline" size={20} color="#6B7280" />
          <Text style={styles.statValue}>{member.stats?.best_score ?? '-'}</Text>
          <Text style={styles.statLabel}>Best Score</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="ribbon-outline" size={20} color="#6B7280" />
          <Text style={styles.statValue}>{member.stats?.birdies ?? 0}</Text>
          <Text style={styles.statLabel}>Birdies</Text>
        </View>
      </View>

      {/* Recent Rounds */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Rounds</Text>
        {member.recent_rounds && member.recent_rounds.length > 0 ? (
          member.recent_rounds.map((round) => {
            const scoreDiff = getScoreDiff(round.score, round.par);
            return (
              <View key={round.id} style={styles.roundItem}>
                <View style={styles.roundInfo}>
                  <Text style={styles.roundCourse}>{round.course_name}</Text>
                  <Text style={styles.roundDate}>
                    {new Date(round.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.roundScore}>
                  <Text style={styles.scoreValue}>{round.score}</Text>
                  <Text style={[styles.scoreDiff, { color: scoreDiff.color }]}>
                    {scoreDiff.text}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No recent rounds</Text>
        )}
      </View>

      {/* Achievements */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {member.achievements && member.achievements.length > 0 ? (
          member.achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Ionicons name="ribbon-outline" size={20} color="#EAB308" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                {achievement.description && (
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                )}
                <Text style={styles.achievementDate}>
                  {new Date(achievement.earned_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No achievements yet</Text>
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
    marginTop: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 4,
  },
  backButtonText: {
    fontSize: 14,
    color: '#16A34A',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  membershipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#16A34A',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  handicapCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  handicapLabel: {
    fontSize: 14,
    color: '#16A34A',
    marginBottom: 4,
  },
  handicapValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  handicapNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#166534',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  roundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  roundInfo: {
    flex: 1,
  },
  roundCourse: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  roundDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  roundScore: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  scoreDiff: {
    fontSize: 13,
    fontWeight: '500',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  achievementDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  achievementDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    padding: 16,
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}

/**
 * Generate Tournament List Upcoming component (React Native)
 */
export function generateTournamentListUpcoming(options: TournamentListOptions = {}): string {
  const {
    componentName = 'TournamentListUpcoming',
    endpoint = '/golf/tournaments/upcoming',
    queryKey = 'golf-tournaments-upcoming',
  } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface ${componentName}Props {
  limit?: number;
}

interface Tournament {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  course_name?: string;
  course_id?: string;
  format?: string;
  entry_fee?: number;
  prize_pool?: number;
  max_participants?: number;
  current_participants?: number;
  registration_deadline?: string;
  status?: 'open' | 'closed' | 'in_progress' | 'completed';
  image_url?: string;
  is_registered?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 6 }) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['${queryKey}', limit],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?limit=\${limit}\`);
        return (Array.isArray(response) ? response : (response?.data || [])) as Tournament[];
      } catch (err) {
        console.error('Failed to fetch tournaments:', err);
        return [];
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      return api.post('/golf/tournaments/register', { tournament_id: tournamentId });
    },
    onSuccess: () => {
      showToast('success', 'Successfully registered for tournament!');
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
    onError: () => {
      showToast('error', 'Failed to register for tournament');
    },
  });

  const handleRegister = (tournament: Tournament) => {
    Alert.alert(
      'Register for Tournament',
      \`Do you want to register for \${tournament.name}?\`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Register', onPress: () => registerMutation.mutate(tournament.id) },
      ]
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return 'Started';
    return \`\${days} days\`;
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig: Record<string, { bg: string; color: string; text: string }> = {
      open: { bg: '#DCFCE7', color: '#16A34A', text: 'Registration Open' },
      closed: { bg: '#FEE2E2', color: '#DC2626', text: 'Closed' },
      in_progress: { bg: '#FEF3C7', color: '#D97706', text: 'In Progress' },
      completed: { bg: '#F3F4F6', color: '#6B7280', text: 'Completed' },
    };
    const config = statusConfig[status || ''] || statusConfig.open;
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
      </View>
    );
  };

  const renderTournamentItem = useCallback(({ item }: { item: Tournament }) => (
    <View style={styles.tournamentCard}>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.tournamentImage} />
      )}

      <View style={styles.tournamentContent}>
        <View style={styles.tournamentHeader}>
          <Text style={styles.tournamentName} numberOfLines={1}>{item.name}</Text>
          {getStatusBadge(item.status)}
        </View>

        {item.format && (
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>{item.format}</Text>
          </View>
        )}

        <View style={styles.tournamentMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{formatDate(item.start_date)}</Text>
            <Text style={styles.daysUntil}>({getDaysUntil(item.start_date)})</Text>
          </View>

          {item.course_name && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.course_name}</Text>
            </View>
          )}

          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {item.current_participants || 0} / {item.max_participants || 'unlimited'} registered
            </Text>
          </View>

          {item.prize_pool && (
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>\${item.prize_pool.toLocaleString()} prize pool</Text>
            </View>
          )}
        </View>

        <View style={styles.tournamentActions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate('TournamentDetail' as never, { tournamentId: item.id } as never)}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>

          {item.status === 'open' && !item.is_registered && (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => handleRegister(item)}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Register</Text>
              )}
            </TouchableOpacity>
          )}

          {item.is_registered && (
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredText}>Registered</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  ), [navigation, registerMutation]);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trophy-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No upcoming tournaments</Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: Tournament) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="trophy" size={24} color="#EAB308" />
          <Text style={styles.title}>Upcoming Tournaments</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Tournaments' as never)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#16A34A" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tournaments}
        renderItem={renderTournamentItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#16A34A',
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 16,
  },
  tournamentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tournamentImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  tournamentContent: {
    padding: 16,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  formatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 12,
  },
  formatText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
  },
  tournamentMeta: {
    gap: 8,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  daysUntil: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
  },
  tournamentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  registeredBadge: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  registeredText: {
    fontSize: 14,
    color: '#6B7280',
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

/**
 * Generate Lesson Calendar Golf component (React Native)
 */
export function generateLessonCalendarGolf(options: LessonCalendarGolfOptions = {}): string {
  const {
    componentName = 'LessonCalendarGolf',
    endpoint = '/golf/lessons',
    queryKey = 'golf-lessons',
  } = options;

  return `import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface ${componentName}Props {
  instructorId?: string;
}

interface GolfLesson {
  id: string;
  title: string;
  instructor_name: string;
  instructor_id?: string;
  instructor_avatar?: string;
  date: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  location?: string;
  lesson_type?: 'private' | 'group' | 'playing';
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  focus_area?: string;
  price?: number;
  spots_available?: number;
  max_spots?: number;
  status?: 'available' | 'booked' | 'completed' | 'cancelled';
  description?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ${componentName}: React.FC<${componentName}Props> = ({ instructorId }) => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<GolfLesson | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['${queryKey}', currentDate.getMonth(), currentDate.getFullYear(), instructorId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
        });
        if (instructorId) params.append('instructorId', instructorId);
        const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
        return (Array.isArray(response) ? response : (response?.data || [])) as GolfLesson[];
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
        return [];
      }
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return api.post('/golf/lessons/book', { lesson_id: lessonId });
    },
    onSuccess: () => {
      showToast('success', 'Lesson booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
      setShowBookingModal(false);
      setSelectedLesson(null);
    },
    onError: () => {
      showToast('error', 'Failed to book lesson');
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

  const getLessonsForDate = useCallback((date: Date) => {
    if (!lessons) return [];
    return lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return (
        lessonDate.getFullYear() === date.getFullYear() &&
        lessonDate.getMonth() === date.getMonth() &&
        lessonDate.getDate() === date.getDate()
      );
    });
  }, [lessons]);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const navigatePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const getLessonTypeColor = (type?: string) => {
    switch (type) {
      case 'private':
        return '#8B5CF6';
      case 'group':
        return '#3B82F6';
      case 'playing':
        return '#16A34A';
      default:
        return '#6B7280';
    }
  };

  const getSkillLevelBadge = (level?: string) => {
    const config: Record<string, { bg: string; color: string }> = {
      beginner: { bg: '#DCFCE7', color: '#16A34A' },
      intermediate: { bg: '#FEF3C7', color: '#D97706' },
      advanced: { bg: '#FEE2E2', color: '#DC2626' },
    };
    return config[level || ''] || config.beginner;
  };

  const handleBookLesson = () => {
    if (selectedLesson) {
      Alert.alert(
        'Confirm Booking',
        'Are you sure you want to book this lesson?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Book', onPress: () => bookMutation.mutate(selectedLesson.id) },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="golf" size={24} color="#16A34A" />
          <Text style={styles.title}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
        </View>
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={navigatePrev} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateNext} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>Private</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Group</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
          <Text style={styles.legendText}>Playing</Text>
        </View>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        <View style={styles.weekdayHeader}>
          {WEEKDAYS.map((day) => (
            <Text key={day} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.daysGrid}>
            {calendarDays.map((day, idx) => {
              const dayLessons = getLessonsForDate(day.date);
              const availableCount = dayLessons.filter((l) => l.status === 'available').length;

              return (
                <View
                  key={idx}
                  style={[
                    styles.dayCell,
                    !day.isCurrentMonth && styles.dayCellOtherMonth,
                  ]}
                >
                  <View style={[
                    styles.dayNumber,
                    isToday(day.date) && styles.dayNumberToday,
                  ]}>
                    <Text style={[
                      styles.dayNumberText,
                      isToday(day.date) && styles.dayNumberTextToday,
                      !day.isCurrentMonth && styles.dayNumberTextOther,
                    ]}>
                      {day.date.getDate()}
                    </Text>
                  </View>

                  {availableCount > 0 && day.isCurrentMonth && (
                    <Text style={styles.availableText}>{availableCount} lesson{availableCount > 1 ? 's' : ''}</Text>
                  )}

                  {dayLessons.slice(0, 2).map((lesson) => (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[
                        styles.lessonItem,
                        { borderLeftColor: getLessonTypeColor(lesson.lesson_type) },
                      ]}
                      onPress={() => {
                        setSelectedLesson(lesson);
                        if (lesson.status === 'available') {
                          setShowBookingModal(true);
                        }
                      }}
                    >
                      <Text style={styles.lessonText} numberOfLines={1}>
                        {lesson.start_time} - {lesson.instructor_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {dayLessons.length > 2 && (
                    <Text style={styles.moreText}>+{dayLessons.length - 2} more</Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Golf Lesson</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedLesson && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.lessonTitle}>{selectedLesson.title}</Text>

                <View style={styles.lessonBadges}>
                  {selectedLesson.lesson_type && (
                    <View style={[styles.typeBadge, { backgroundColor: getLessonTypeColor(selectedLesson.lesson_type) + '20' }]}>
                      <Text style={[styles.typeBadgeText, { color: getLessonTypeColor(selectedLesson.lesson_type) }]}>
                        {selectedLesson.lesson_type}
                      </Text>
                    </View>
                  )}
                  {selectedLesson.skill_level && (
                    <View style={[styles.typeBadge, { backgroundColor: getSkillLevelBadge(selectedLesson.skill_level).bg }]}>
                      <Text style={[styles.typeBadgeText, { color: getSkillLevelBadge(selectedLesson.skill_level).color }]}>
                        {selectedLesson.skill_level}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.instructorRow}>
                  {selectedLesson.instructor_avatar ? (
                    <Image source={{ uri: selectedLesson.instructor_avatar }} style={styles.instructorAvatar} />
                  ) : (
                    <View style={styles.instructorAvatarPlaceholder}>
                      <Ionicons name="person" size={16} color="#6B7280" />
                    </View>
                  )}
                  <Text style={styles.instructorName}>{selectedLesson.instructor_name}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                  <Text style={styles.modalText}>
                    {new Date(selectedLesson.date).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                  <Text style={styles.modalText}>
                    {selectedLesson.start_time}
                    {selectedLesson.end_time && \` - \${selectedLesson.end_time}\`}
                    {selectedLesson.duration && \` (\${selectedLesson.duration} min)\`}
                  </Text>
                </View>

                {selectedLesson.location && (
                  <View style={styles.modalRow}>
                    <Ionicons name="location-outline" size={20} color="#6B7280" />
                    <Text style={styles.modalText}>{selectedLesson.location}</Text>
                  </View>
                )}

                {selectedLesson.focus_area && (
                  <View style={styles.modalRow}>
                    <Ionicons name="golf-outline" size={20} color="#6B7280" />
                    <Text style={styles.modalText}>Focus: {selectedLesson.focus_area}</Text>
                  </View>
                )}

                {selectedLesson.price && (
                  <Text style={styles.priceText}>\${selectedLesson.price}</Text>
                )}

                {selectedLesson.description && (
                  <Text style={styles.descriptionText}>{selectedLesson.description}</Text>
                )}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleBookLesson}
                disabled={bookMutation.isPending}
              >
                {bookMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Book Lesson</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
    backgroundColor: '#F9FAFB',
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
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  calendarContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekdayHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 12,
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
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayCellOtherMonth: {
    backgroundColor: '#F9FAFB',
  },
  dayNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  dayNumberToday: {
    backgroundColor: '#16A34A',
  },
  dayNumberText: {
    fontSize: 12,
    color: '#374151',
  },
  dayNumberTextToday: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayNumberTextOther: {
    color: '#9CA3AF',
  },
  availableText: {
    fontSize: 8,
    color: '#16A34A',
    marginBottom: 2,
  },
  lessonItem: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 2,
  },
  lessonText: {
    fontSize: 8,
    color: '#374151',
  },
  moreText: {
    fontSize: 8,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalBody: {
    marginBottom: 20,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  lessonBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  instructorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  instructorAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructorName: {
    fontSize: 15,
    color: '#374151',
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: '#374151',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    lineHeight: 20,
  },
  modalActions: {
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
  },
});

export default ${componentName};
`;
}
