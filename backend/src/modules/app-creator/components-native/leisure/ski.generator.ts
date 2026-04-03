/**
 * Ski Resort Component Generators (React Native)
 *
 * Generates ski resort-specific components including:
 * - SkiResortStats: Key resort statistics and conditions
 * - LessonCalendarSki: Ski/snowboard lessons scheduling calendar
 * - TrailStatusOverview: Trail conditions and status overview
 */

export interface SkiResortStatsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface LessonCalendarSkiOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface TrailStatusOverviewOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate Ski Resort Stats component (React Native)
 */
export function generateSkiResortStats(options: SkiResortStatsOptions = {}): string {
  const {
    componentName = 'SkiResortStats',
    endpoint = '/ski/resort/stats',
    queryKey = 'ski-resort-stats',
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
  resortId?: string;
}

interface ResortStats {
  resort_name?: string;
  last_updated?: string;
  weather?: {
    temperature?: number;
    wind_speed?: number;
    wind_direction?: string;
    conditions?: string;
    visibility?: string;
    snow_last_24h?: number;
    snow_last_48h?: number;
    snow_last_7d?: number;
    base_depth?: number;
    summit_depth?: number;
  };
  lifts?: {
    total?: number;
    open?: number;
    scheduled?: number;
    on_hold?: number;
    closed?: number;
  };
  trails?: {
    total?: number;
    open?: number;
    groomed?: number;
    beginner?: { open: number; total: number };
    intermediate?: { open: number; total: number };
    advanced?: { open: number; total: number };
    expert?: { open: number; total: number };
  };
  terrain_parks?: {
    total?: number;
    open?: number;
  };
  hours?: {
    opens?: string;
    closes?: string;
    night_skiing?: boolean;
    night_closes?: string;
  };
  avalanche_danger?: 'low' | 'moderate' | 'considerable' | 'high' | 'extreme';
}

const ${componentName}: React.FC<${componentName}Props> = ({ resortId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}', resortId],
    queryFn: async () => {
      try {
        const url = resortId ? \`${endpoint}?resortId=\${resortId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return (response?.data || response || {}) as ResortStats;
      } catch (err) {
        console.error('Failed to fetch resort stats:', err);
        return {} as ResortStats;
      }
    },
  });

  const getAvalancheDangerStyle = (danger?: string) => {
    const config: Record<string, { bg: string; color: string }> = {
      low: { bg: '#DCFCE7', color: '#16A34A' },
      moderate: { bg: '#FEF3C7', color: '#D97706' },
      considerable: { bg: '#FFEDD5', color: '#EA580C' },
      high: { bg: '#FEE2E2', color: '#DC2626' },
      extreme: { bg: '#FEE2E2', color: '#991B1B' },
    };
    return config[danger || ''] || config.low;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const liftsOpenPercent = stats?.lifts?.total
    ? Math.round(((stats.lifts.open || 0) / stats.lifts.total) * 100)
    : 0;
  const trailsOpenPercent = stats?.trails?.total
    ? Math.round(((stats.trails.open || 0) / stats.trails.total) * 100)
    : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="snow" size={28} color="#3B82F6" />
          <View>
            <Text style={styles.resortName}>{stats?.resort_name || 'Resort Conditions'}</Text>
            {stats?.last_updated && (
              <Text style={styles.lastUpdated}>
                Updated: {new Date(stats.last_updated).toLocaleString()}
              </Text>
            )}
          </View>
        </View>

        {stats?.avalanche_danger && (
          <View style={[
            styles.avalancheBadge,
            { backgroundColor: getAvalancheDangerStyle(stats.avalanche_danger).bg }
          ]}>
            <Ionicons
              name="warning"
              size={16}
              color={getAvalancheDangerStyle(stats.avalanche_danger).color}
            />
            <Text style={[
              styles.avalancheText,
              { color: getAvalancheDangerStyle(stats.avalanche_danger).color }
            ]}>
              {stats.avalanche_danger}
            </Text>
          </View>
        )}
      </View>

      {/* Weather Conditions */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherHeader}>
          <Ionicons name="cloud-outline" size={20} color="#FFFFFF" />
          <Text style={styles.weatherTitle}>Current Conditions</Text>
        </View>

        <View style={styles.weatherGrid}>
          <View style={styles.weatherItem}>
            <Ionicons name="thermometer-outline" size={28} color="rgba(255,255,255,0.8)" />
            <Text style={styles.weatherValue}>{stats?.weather?.temperature ?? '--'}°F</Text>
            <Text style={styles.weatherLabel}>Temperature</Text>
          </View>

          <View style={styles.weatherItem}>
            <Ionicons name="navigate-outline" size={28} color="rgba(255,255,255,0.8)" />
            <Text style={styles.weatherValue}>{stats?.weather?.wind_speed ?? '--'} mph</Text>
            <Text style={styles.weatherLabel}>Wind {stats?.weather?.wind_direction || ''}</Text>
          </View>

          <View style={styles.weatherItem}>
            <Ionicons name="snow-outline" size={28} color="rgba(255,255,255,0.8)" />
            <Text style={styles.weatherValue}>{stats?.weather?.snow_last_24h ?? '--}"</Text>
            <Text style={styles.weatherLabel}>New Snow (24h)</Text>
          </View>

          <View style={styles.weatherItem}>
            <Ionicons name="layers-outline" size={28} color="rgba(255,255,255,0.8)" />
            <Text style={styles.weatherValue}>{stats?.weather?.base_depth ?? '--}"</Text>
            <Text style={styles.weatherLabel}>Base Depth</Text>
          </View>
        </View>

        <View style={styles.weatherStats}>
          <View style={styles.weatherStatItem}>
            <Text style={styles.weatherStatLabel}>48hr Snow:</Text>
            <Text style={styles.weatherStatValue}>{stats?.weather?.snow_last_48h ?? '--}"</Text>
          </View>
          <View style={styles.weatherStatItem}>
            <Text style={styles.weatherStatLabel}>7-day Snow:</Text>
            <Text style={styles.weatherStatValue}>{stats?.weather?.snow_last_7d ?? '--}"</Text>
          </View>
          <View style={styles.weatherStatItem}>
            <Text style={styles.weatherStatLabel}>Summit:</Text>
            <Text style={styles.weatherStatValue}>{stats?.weather?.summit_depth ?? '--}"</Text>
          </View>
        </View>
      </View>

      {/* Lifts and Trails */}
      <View style={styles.statusRow}>
        {/* Lifts Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusCardTitle}>Lift Status</Text>
          <View style={styles.percentCircle}>
            <Text style={styles.percentValue}>{liftsOpenPercent}%</Text>
          </View>
          <View style={styles.statusDetails}>
            <View style={styles.statusDetailRow}>
              <Text style={styles.statusDetailLabel}>Open</Text>
              <Text style={styles.statusDetailValueGreen}>{stats?.lifts?.open || 0}</Text>
            </View>
            <View style={styles.statusDetailRow}>
              <Text style={styles.statusDetailLabel}>Scheduled</Text>
              <Text style={styles.statusDetailValueBlue}>{stats?.lifts?.scheduled || 0}</Text>
            </View>
            <View style={styles.statusDetailRow}>
              <Text style={styles.statusDetailLabel}>On Hold</Text>
              <Text style={styles.statusDetailValueYellow}>{stats?.lifts?.on_hold || 0}</Text>
            </View>
            <View style={styles.statusDetailRow}>
              <Text style={styles.statusDetailLabel}>Closed</Text>
              <Text style={styles.statusDetailValueGray}>{stats?.lifts?.closed || 0}</Text>
            </View>
          </View>
          <Text style={styles.statusFooter}>
            {stats?.lifts?.open || 0} of {stats?.lifts?.total || 0} lifts
          </Text>
        </View>

        {/* Trails Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusCardTitle}>Trail Status</Text>
          <View style={styles.percentCircle}>
            <Text style={styles.percentValue}>{trailsOpenPercent}%</Text>
          </View>
          <View style={styles.statusDetails}>
            <View style={styles.statusDetailRow}>
              <View style={[styles.trailDot, { backgroundColor: '#16A34A' }]} />
              <Text style={styles.statusDetailLabel}>Beginner</Text>
              <Text style={styles.statusDetailValue}>
                {stats?.trails?.beginner?.open || 0}/{stats?.trails?.beginner?.total || 0}
              </Text>
            </View>
            <View style={styles.statusDetailRow}>
              <View style={[styles.trailDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.statusDetailLabel}>Intermediate</Text>
              <Text style={styles.statusDetailValue}>
                {stats?.trails?.intermediate?.open || 0}/{stats?.trails?.intermediate?.total || 0}
              </Text>
            </View>
            <View style={styles.statusDetailRow}>
              <View style={[styles.trailDot, { backgroundColor: '#111827' }]} />
              <Text style={styles.statusDetailLabel}>Advanced</Text>
              <Text style={styles.statusDetailValue}>
                {stats?.trails?.advanced?.open || 0}/{stats?.trails?.advanced?.total || 0}
              </Text>
            </View>
            <View style={styles.statusDetailRow}>
              <View style={[styles.trailDot, { backgroundColor: '#EAB308' }]} />
              <Text style={styles.statusDetailLabel}>Expert</Text>
              <Text style={styles.statusDetailValue}>
                {stats?.trails?.expert?.open || 0}/{stats?.trails?.expert?.total || 0}
              </Text>
            </View>
          </View>
          <Text style={styles.statusFooter}>
            {stats?.trails?.groomed || 0} groomed
          </Text>
        </View>
      </View>

      {/* Hours and Terrain Parks */}
      <View style={styles.infoRow}>
        {/* Hours */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="time-outline" size={20} color="#374151" />
            <Text style={styles.infoCardTitle}>Operating Hours</Text>
          </View>
          <View style={styles.hoursContent}>
            <View style={styles.hoursRow}>
              <Ionicons name="sunny-outline" size={18} color="#EAB308" />
              <Text style={styles.hoursLabel}>Opens</Text>
              <Text style={styles.hoursValue}>{stats?.hours?.opens || '--'}</Text>
            </View>
            <View style={styles.hoursRow}>
              <Ionicons name="moon-outline" size={18} color="#F97316" />
              <Text style={styles.hoursLabel}>Closes</Text>
              <Text style={styles.hoursValue}>{stats?.hours?.closes || '--'}</Text>
            </View>
            {stats?.hours?.night_skiing && (
              <View style={styles.hoursRow}>
                <Ionicons name="snow-outline" size={18} color="#3B82F6" />
                <Text style={styles.hoursLabel}>Night Skiing</Text>
                <Text style={styles.hoursValue}>Until {stats.hours.night_closes || '--'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Terrain Parks */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="trending-up" size={20} color="#374151" />
            <Text style={styles.infoCardTitle}>Terrain Parks</Text>
          </View>
          <View style={styles.terrainContent}>
            <Text style={styles.terrainValue}>
              {stats?.terrain_parks?.open || 0}
              <Text style={styles.terrainTotal}>/{stats?.terrain_parks?.total || 0}</Text>
            </Text>
            <Text style={styles.terrainLabel}>parks open</Text>
            {stats?.terrain_parks?.open && stats.terrain_parks.open > 0 && (
              <View style={styles.terrainBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text style={styles.terrainBadgeText}>Parks are open</Text>
              </View>
            )}
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
    alignItems: 'flex-start',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  resortName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  avalancheBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  avalancheText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  weatherCard: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weatherItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  weatherLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
    marginTop: 8,
  },
  weatherStatItem: {
    alignItems: 'center',
  },
  weatherStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  weatherStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  percentCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  percentValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusDetails: {
    gap: 6,
  },
  statusDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusDetailLabel: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  statusDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  statusDetailValueGreen: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
  },
  statusDetailValueBlue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  statusDetailValueYellow: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
  statusDetailValueGray: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  trailDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusFooter: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  hoursContent: {
    gap: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hoursLabel: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  hoursValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  terrainContent: {
    alignItems: 'center',
  },
  terrainValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  terrainTotal: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#6B7280',
  },
  terrainLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  terrainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  terrainBadgeText: {
    fontSize: 12,
    color: '#16A34A',
  },
});

export default ${componentName};
`;
}

/**
 * Generate Ski Lesson Calendar component (React Native)
 */
export function generateLessonCalendarSki(options: LessonCalendarSkiOptions = {}): string {
  const {
    componentName = 'LessonCalendarSki',
    endpoint = '/ski/lessons',
    queryKey = 'ski-lessons',
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
  resortId?: string;
}

interface SkiLesson {
  id: string;
  title: string;
  instructor_name: string;
  instructor_id?: string;
  instructor_avatar?: string;
  instructor_certifications?: string[];
  date: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  meeting_location?: string;
  lesson_type?: 'private' | 'group' | 'semi-private';
  sport?: 'ski' | 'snowboard' | 'both';
  skill_level?: 'first-timer' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  age_group?: 'kids' | 'teens' | 'adults' | 'all';
  specialty?: string;
  max_students?: number;
  current_students?: number;
  price?: number;
  status?: 'available' | 'booked' | 'waitlist' | 'cancelled';
  description?: string;
  equipment_included?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ${componentName}: React.FC<${componentName}Props> = ({ instructorId, resortId }) => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<SkiLesson | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [filterSport, setFilterSport] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['${queryKey}', currentDate.getMonth(), currentDate.getFullYear(), instructorId, resortId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
        });
        if (instructorId) params.append('instructorId', instructorId);
        if (resortId) params.append('resortId', resortId);
        const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
        return (Array.isArray(response) ? response : (response?.data || [])) as SkiLesson[];
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
        return [];
      }
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return api.post('/ski/lessons/book', { lesson_id: lessonId });
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

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    return lessons.filter((lesson) => {
      if (filterSport !== 'all' && lesson.sport !== filterSport) return false;
      if (filterLevel !== 'all' && lesson.skill_level !== filterLevel) return false;
      return true;
    });
  }, [lessons, filterSport, filterLevel]);

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
    return filteredLessons.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return (
        lessonDate.getFullYear() === date.getFullYear() &&
        lessonDate.getMonth() === date.getMonth() &&
        lessonDate.getDate() === date.getDate()
      );
    });
  }, [filteredLessons]);

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

  const getSportColor = (sport?: string) => {
    switch (sport) {
      case 'ski':
        return '#3B82F6';
      case 'snowboard':
        return '#8B5CF6';
      case 'both':
        return '#14B8A6';
      default:
        return '#6B7280';
    }
  };

  const getLevelStyle = (level?: string) => {
    const config: Record<string, { bg: string; color: string }> = {
      'first-timer': { bg: '#DCFCE7', color: '#16A34A' },
      beginner: { bg: '#DCFCE7', color: '#16A34A' },
      intermediate: { bg: '#DBEAFE', color: '#3B82F6' },
      advanced: { bg: '#1F2937', color: '#FFFFFF' },
      expert: { bg: '#FEF3C7', color: '#D97706' },
    };
    return config[level || ''] || config.beginner;
  };

  const getLessonTypeStyle = (type?: string) => {
    const config: Record<string, { bg: string; color: string }> = {
      private: { bg: '#F3E8FF', color: '#7C3AED' },
      group: { bg: '#DBEAFE', color: '#3B82F6' },
      'semi-private': { bg: '#CCFBF1', color: '#0D9488' },
    };
    return config[type || ''] || config.group;
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
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="snow" size={24} color="#3B82F6" />
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

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filterSport === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterSport('all')}
          >
            <Text style={[styles.filterText, filterSport === 'all' && styles.filterTextActive]}>All Sports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterSport === 'ski' && styles.filterButtonActive]}
            onPress={() => setFilterSport('ski')}
          >
            <Text style={[styles.filterText, filterSport === 'ski' && styles.filterTextActive]}>Ski</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterSport === 'snowboard' && styles.filterButtonActive]}
            onPress={() => setFilterSport('snowboard')}
          >
            <Text style={[styles.filterText, filterSport === 'snowboard' && styles.filterTextActive]}>Snowboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterSport === 'both' && styles.filterButtonActive]}
            onPress={() => setFilterSport('both')}
          >
            <Text style={[styles.filterText, filterSport === 'both' && styles.filterTextActive]}>Both</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Ski</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>Snowboard</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#14B8A6' }]} />
          <Text style={styles.legendText}>Both</Text>
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
                    <Text style={styles.availableText}>{availableCount} avail</Text>
                  )}

                  {dayLessons.slice(0, 2).map((lesson) => (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[
                        styles.lessonItem,
                        { borderLeftColor: getSportColor(lesson.sport) },
                      ]}
                      onPress={() => {
                        setSelectedLesson(lesson);
                        if (lesson.status === 'available') {
                          setShowBookingModal(true);
                        }
                      }}
                    >
                      <Text style={styles.lessonText} numberOfLines={1}>
                        {lesson.start_time} {lesson.sport}
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
              <Text style={styles.modalTitle}>Book Ski Lesson</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedLesson && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.lessonTitle}>{selectedLesson.title}</Text>

                <View style={styles.lessonBadges}>
                  {selectedLesson.sport && (
                    <View style={[styles.typeBadge, { backgroundColor: getSportColor(selectedLesson.sport) + '20' }]}>
                      <Text style={[styles.typeBadgeText, { color: getSportColor(selectedLesson.sport) }]}>
                        {selectedLesson.sport}
                      </Text>
                    </View>
                  )}
                  {selectedLesson.lesson_type && (
                    <View style={[styles.typeBadge, { backgroundColor: getLessonTypeStyle(selectedLesson.lesson_type).bg }]}>
                      <Text style={[styles.typeBadgeText, { color: getLessonTypeStyle(selectedLesson.lesson_type).color }]}>
                        {selectedLesson.lesson_type}
                      </Text>
                    </View>
                  )}
                  {selectedLesson.skill_level && (
                    <View style={[styles.typeBadge, { backgroundColor: getLevelStyle(selectedLesson.skill_level).bg }]}>
                      <Text style={[styles.typeBadgeText, { color: getLevelStyle(selectedLesson.skill_level).color }]}>
                        {selectedLesson.skill_level}
                      </Text>
                    </View>
                  )}
                  {selectedLesson.age_group && (
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{selectedLesson.age_group}</Text>
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

                {selectedLesson.instructor_certifications && selectedLesson.instructor_certifications.length > 0 && (
                  <View style={styles.certifications}>
                    {selectedLesson.instructor_certifications.map((cert, i) => (
                      <View key={i} style={styles.certBadge}>
                        <Text style={styles.certText}>{cert}</Text>
                      </View>
                    ))}
                  </View>
                )}

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
                    {selectedLesson.duration && \` (\${selectedLesson.duration} hrs)\`}
                  </Text>
                </View>

                {selectedLesson.meeting_location && (
                  <View style={styles.modalRow}>
                    <Ionicons name="location-outline" size={20} color="#6B7280" />
                    <Text style={styles.modalText}>Meet at: {selectedLesson.meeting_location}</Text>
                  </View>
                )}

                {selectedLesson.lesson_type !== 'private' && (
                  <View style={styles.modalRow}>
                    <Ionicons name="people-outline" size={20} color="#6B7280" />
                    <Text style={styles.modalText}>
                      {selectedLesson.current_students || 0} / {selectedLesson.max_students || 6} students
                    </Text>
                  </View>
                )}

                {selectedLesson.specialty && (
                  <View style={styles.modalRow}>
                    <Ionicons name="snow-outline" size={20} color="#6B7280" />
                    <Text style={styles.modalText}>Focus: {selectedLesson.specialty}</Text>
                  </View>
                )}

                {selectedLesson.equipment_included && (
                  <View style={styles.equipmentBadge}>
                    <Ionicons name="snow-outline" size={16} color="#16A34A" />
                    <Text style={styles.equipmentText}>Equipment included</Text>
                  </View>
                )}

                {selectedLesson.price && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>\${selectedLesson.price}</Text>
                    {selectedLesson.lesson_type === 'group' && (
                      <Text style={styles.priceNote}>per person</Text>
                    )}
                  </View>
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
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 13,
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
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
    backgroundColor: '#3B82F6',
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
    backgroundColor: '#EFF6FF',
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
    maxHeight: '85%',
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
    gap: 6,
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
    color: '#6B7280',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
  certifications: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  certBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  certText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '500',
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#374151',
  },
  equipmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 13,
    color: '#16A34A',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
  },
  priceNote: {
    fontSize: 13,
    color: '#6B7280',
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
    backgroundColor: '#3B82F6',
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
 * Generate Trail Status Overview component (React Native)
 */
export function generateTrailStatusOverview(options: TrailStatusOverviewOptions = {}): string {
  const {
    componentName = 'TrailStatusOverview',
    endpoint = '/ski/trails',
    queryKey = 'ski-trails',
  } = options;

  return `import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  resortId?: string;
}

interface Trail {
  id: string;
  name: string;
  difficulty: 'green' | 'blue' | 'black' | 'double-black' | 'terrain-park';
  status: 'open' | 'closed' | 'grooming' | 'on-hold';
  groomed?: boolean;
  snowmaking?: boolean;
  conditions?: string;
  last_groomed?: string;
  vertical_drop?: number;
  length?: number;
  exposure?: string;
  features?: string[];
  lifts?: string[];
  area?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ resortId }) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: trails, isLoading } = useQuery({
    queryKey: ['${queryKey}', resortId],
    queryFn: async () => {
      try {
        const url = resortId ? \`${endpoint}?resortId=\${resortId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return (Array.isArray(response) ? response : (response?.data || [])) as Trail[];
      } catch (err) {
        console.error('Failed to fetch trails:', err);
        return [];
      }
    },
  });

  const filteredTrails = useMemo(() => {
    if (!trails) return [];
    return trails.filter((trail) => {
      if (searchQuery && !trail.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterDifficulty !== 'all' && trail.difficulty !== filterDifficulty) {
        return false;
      }
      if (filterStatus !== 'all' && trail.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [trails, searchQuery, filterDifficulty, filterStatus]);

  const groupedTrails = useMemo(() => {
    const groups: { title: string; data: Trail[] }[] = [];
    const areas: Record<string, Trail[]> = {};

    filteredTrails.forEach((trail) => {
      const area = trail.area || 'Main Mountain';
      if (!areas[area]) areas[area] = [];
      areas[area].push(trail);
    });

    Object.entries(areas).forEach(([title, data]) => {
      groups.push({ title, data });
    });

    return groups;
  }, [filteredTrails]);

  const stats = useMemo(() => {
    if (!trails) return { open: 0, total: 0, groomed: 0 };
    return {
      open: trails.filter((t) => t.status === 'open').length,
      total: trails.length,
      groomed: trails.filter((t) => t.groomed).length,
    };
  }, [trails]);

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'green':
        return <View style={[styles.difficultyDot, styles.difficultyGreen]} />;
      case 'blue':
        return <View style={[styles.difficultySquare, styles.difficultyBlue]} />;
      case 'black':
        return <View style={[styles.difficultySquare, styles.difficultyBlack]} />;
      case 'double-black':
        return (
          <View style={styles.doubleBlack}>
            <View style={[styles.difficultySquareSmall, styles.difficultyBlack]} />
            <View style={[styles.difficultySquareSmall, styles.difficultyBlack]} />
          </View>
        );
      case 'terrain-park':
        return (
          <View style={styles.terrainParkIcon}>
            <Text style={styles.terrainParkText}>TP</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; color: string; icon: string; text: string }> = {
      open: { bg: '#DCFCE7', color: '#16A34A', icon: 'checkmark-circle', text: 'Open' },
      closed: { bg: '#FEE2E2', color: '#DC2626', icon: 'close-circle', text: 'Closed' },
      grooming: { bg: '#FEF3C7', color: '#D97706', icon: 'time', text: 'Grooming' },
      'on-hold': { bg: '#FFEDD5', color: '#EA580C', icon: 'warning', text: 'On Hold' },
    };
    const c = config[status] || config.closed;
    return (
      <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
        <Ionicons name={c.icon as any} size={12} color={c.color} />
        <Text style={[styles.statusText, { color: c.color }]}>{c.text}</Text>
      </View>
    );
  };

  const renderTrailItem = useCallback(({ item }: { item: Trail }) => (
    <TouchableOpacity
      style={styles.trailCard}
      onPress={() => navigation.navigate('TrailDetail' as never, { trailId: item.id } as never)}
      activeOpacity={0.7}
    >
      <View style={styles.trailIconContainer}>
        {getDifficultyIcon(item.difficulty)}
      </View>

      <View style={styles.trailInfo}>
        <View style={styles.trailHeader}>
          <Text style={styles.trailName}>{item.name}</Text>
          {getStatusBadge(item.status)}
        </View>

        <View style={styles.trailMeta}>
          {item.groomed && (
            <View style={styles.metaItem}>
              <Ionicons name="snow-outline" size={12} color="#3B82F6" />
              <Text style={styles.metaText}>Groomed</Text>
            </View>
          )}
          {item.snowmaking && (
            <View style={styles.metaItem}>
              <Ionicons name="snow-outline" size={12} color="#06B6D4" />
              <Text style={styles.metaText}>Snowmaking</Text>
            </View>
          )}
          {item.conditions && (
            <Text style={styles.metaText}>{item.conditions}</Text>
          )}
          {item.vertical_drop && (
            <Text style={styles.metaText}>{item.vertical_drop}' vertical</Text>
          )}
        </View>

        {item.features && item.features.length > 0 && (
          <View style={styles.featuresList}>
            {item.features.slice(0, 3).map((feature, i) => (
              <View key={i} style={styles.featureBadge}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
            {item.features.length > 3 && (
              <Text style={styles.moreFeatures}>+{item.features.length - 3}</Text>
            )}
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  ), [navigation]);

  const renderSectionHeader = useCallback(({ section }: { section: { title: string; data: Trail[] } }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name="location-outline" size={16} color="#6B7280" />
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>
        ({section.data.filter((t) => t.status === 'open').length}/{section.data.length} open)
      </Text>
    </View>
  ), []);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="snow-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No trails match your filters</Text>
    </View>
  ), []);

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
          <Ionicons name="snow" size={24} color="#3B82F6" />
          <View>
            <Text style={styles.title}>Trail Status</Text>
            <Text style={styles.subtitle}>
              {stats.open} of {stats.total} trails open | {stats.groomed} groomed
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <View style={[styles.difficultyDot, styles.difficultyGreen]} />
          <Text style={styles.quickStatText}>
            {trails?.filter((t) => t.difficulty === 'green' && t.status === 'open').length || 0} Beginner
          </Text>
        </View>
        <View style={styles.quickStatItem}>
          <View style={[styles.difficultySquareSmall, styles.difficultyBlue]} />
          <Text style={styles.quickStatText}>
            {trails?.filter((t) => t.difficulty === 'blue' && t.status === 'open').length || 0} Intermediate
          </Text>
        </View>
        <View style={styles.quickStatItem}>
          <View style={[styles.difficultySquareSmall, styles.difficultyBlack]} />
          <Text style={styles.quickStatText}>
            {trails?.filter((t) => (t.difficulty === 'black' || t.difficulty === 'double-black') && t.status === 'open').length || 0} Expert
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search trails..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filterDifficulty === 'all' && styles.filterChipActive]}
            onPress={() => setFilterDifficulty('all')}
          >
            <Text style={[styles.filterChipText, filterDifficulty === 'all' && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterDifficulty === 'green' && styles.filterChipActive]}
            onPress={() => setFilterDifficulty('green')}
          >
            <View style={[styles.difficultyDotSmall, styles.difficultyGreen]} />
            <Text style={[styles.filterChipText, filterDifficulty === 'green' && styles.filterChipTextActive]}>Beginner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterDifficulty === 'blue' && styles.filterChipActive]}
            onPress={() => setFilterDifficulty('blue')}
          >
            <View style={[styles.difficultySquareTiny, styles.difficultyBlue]} />
            <Text style={[styles.filterChipText, filterDifficulty === 'blue' && styles.filterChipTextActive]}>Intermediate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterDifficulty === 'black' && styles.filterChipActive]}
            onPress={() => setFilterDifficulty('black')}
          >
            <View style={[styles.difficultySquareTiny, styles.difficultyBlack]} />
            <Text style={[styles.filterChipText, filterDifficulty === 'black' && styles.filterChipTextActive]}>Advanced</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'all' && styles.filterChipTextActive]}>All Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'open' && styles.filterChipActive]}
            onPress={() => setFilterStatus('open')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'open' && styles.filterChipTextActive]}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'closed' && styles.filterChipActive]}
            onPress={() => setFilterStatus('closed')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'closed' && styles.filterChipTextActive]}>Closed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trail List */}
      <FlatList
        data={filteredTrails}
        renderItem={renderTrailItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Trail Difficulty</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.difficultyDotSmall, styles.difficultyGreen]} />
            <Text style={styles.legendText}>Beginner</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.difficultySquareTiny, styles.difficultyBlue]} />
            <Text style={styles.legendText}>Intermediate</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.difficultySquareTiny, styles.difficultyBlack]} />
            <Text style={styles.legendText}>Advanced</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.doubleBlackSmall}>
              <View style={[styles.difficultySquareTiny, styles.difficultyBlack]} />
              <View style={[styles.difficultySquareTiny, styles.difficultyBlack]} />
            </View>
            <Text style={styles.legendText}>Expert</Text>
          </View>
        </View>
      </View>
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
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quickStatText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sectionCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  trailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trailIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  difficultyDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  difficultyDotSmall: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  difficultySquare: {
    width: 16,
    height: 16,
    transform: [{ rotate: '45deg' }],
  },
  difficultySquareSmall: {
    width: 12,
    height: 12,
    transform: [{ rotate: '45deg' }],
  },
  difficultySquareTiny: {
    width: 10,
    height: 10,
    transform: [{ rotate: '45deg' }],
  },
  difficultyGreen: {
    backgroundColor: '#16A34A',
  },
  difficultyBlue: {
    backgroundColor: '#3B82F6',
  },
  difficultyBlack: {
    backgroundColor: '#111827',
  },
  doubleBlack: {
    flexDirection: 'row',
    gap: 2,
  },
  doubleBlackSmall: {
    flexDirection: 'row',
    gap: 1,
  },
  terrainParkIcon: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#F97316',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  terrainParkText: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#F97316',
  },
  trailInfo: {
    flex: 1,
  },
  trailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  trailName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  trailMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  featureBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 10,
    color: '#6B7280',
  },
  moreFeatures: {
    fontSize: 10,
    color: '#9CA3AF',
    alignSelf: 'center',
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
  legend: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
