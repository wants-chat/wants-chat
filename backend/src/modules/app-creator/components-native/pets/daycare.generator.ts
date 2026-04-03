/**
 * Pet Daycare Component Generators (React Native)
 *
 * Generates components for pet daycare facilities:
 * - DaycareStats: Dashboard statistics for daycare
 * - ActivityCalendarDaycare: Activity and event calendar
 * - CheckinListToday: Today's check-in/check-out list
 * - ChildProfile: Pet profile in daycare context
 */

export interface DaycareStatsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface ActivityCalendarOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface CheckinListOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface ChildProfileOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate DaycareStats component (React Native)
 */
export function generateDaycareStats(options: DaycareStatsOptions = {}): string {
  const {
    componentName = 'DaycareStats',
    endpoint = '/daycare/stats',
    queryKey = 'daycare-stats',
  } = options;

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

interface StatsData {
  checkedInToday: number;
  checkedInChange?: number;
  expectedToday: number;
  totalCapacity: number;
  capacityUtilization: number;
  capacityChange?: number;
  weeklyVisits: number;
  weeklyVisitsChange?: number;
  monthlyRevenue: number;
  revenueChange?: number;
  pendingCheckins: number;
  pendingCheckouts: number;
  activePackages: number;
  averageRating: number;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<StatsData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch daycare stats:', err);
        return {};
      }
    },
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    if (type === 'percentage') return value + '%';
    return Number(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const statsConfig = [
    { key: 'checkedInToday', label: 'Checked In Today', icon: 'paw', color: '#3B82F6', type: 'number', changeKey: 'checkedInChange' },
    { key: 'capacityUtilization', label: 'Capacity Utilization', icon: 'people', color: '#10B981', type: 'percentage', changeKey: 'capacityChange' },
    { key: 'weeklyVisits', label: 'Weekly Visits', icon: 'calendar', color: '#8B5CF6', type: 'number', changeKey: 'weeklyVisitsChange' },
    { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: 'cash', color: '#059669', type: 'currency', changeKey: 'revenueChange' },
  ];

  const capacityPercent = Math.min(stats?.capacityUtilization || 0, 100);
  const capacityColor = capacityPercent >= 90 ? '#EF4444' : capacityPercent >= 70 ? '#F59E0B' : '#10B981';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {statsConfig.map((stat) => {
          const value = stats?.[stat.key as keyof StatsData];
          const change = stat.changeKey ? stats?.[stat.changeKey as keyof StatsData] : undefined;

          return (
            <View key={stat.key} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                {change !== undefined && (
                  <View style={styles.changeContainer}>
                    <Ionicons
                      name={Number(change) >= 0 ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={Number(change) >= 0 ? '#10B981' : '#EF4444'}
                    />
                    <Text style={[
                      styles.changeText,
                      { color: Number(change) >= 0 ? '#10B981' : '#EF4444' }
                    ]}>
                      {Math.abs(Number(change))}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.statValue}>{formatValue(value, stat.type)}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Quick Status Cards */}
      <View style={styles.quickCardsContainer}>
        <View style={styles.quickCard}>
          <View style={[styles.quickIconBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="time-outline" size={20} color="#2563EB" />
          </View>
          <View style={styles.quickCardContent}>
            <Text style={styles.quickCardLabel}>Expected Today</Text>
            <Text style={styles.quickCardValue}>{stats?.expectedToday || 0}</Text>
          </View>
        </View>

        <View style={styles.quickCard}>
          <View style={[styles.quickIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="alert-circle-outline" size={20} color="#D97706" />
          </View>
          <View style={styles.quickCardContent}>
            <Text style={styles.quickCardLabel}>Pending Check-ins</Text>
            <Text style={styles.quickCardValue}>{stats?.pendingCheckins || 0}</Text>
          </View>
        </View>

        <View style={styles.quickCard}>
          <View style={[styles.quickIconBox, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#059669" />
          </View>
          <View style={styles.quickCardContent}>
            <Text style={styles.quickCardLabel}>Pending Checkouts</Text>
            <Text style={styles.quickCardValue}>{stats?.pendingCheckouts || 0}</Text>
          </View>
        </View>

        <View style={styles.quickCard}>
          <View style={[styles.quickIconBox, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="star" size={20} color="#EA580C" />
          </View>
          <View style={styles.quickCardContent}>
            <Text style={styles.quickCardLabel}>Average Rating</Text>
            <Text style={styles.quickCardValue}>
              {stats?.averageRating?.toFixed(1) || '-'} / 5
            </Text>
          </View>
        </View>
      </View>

      {/* Capacity Progress */}
      <View style={styles.capacityCard}>
        <View style={styles.capacityHeader}>
          <Text style={styles.capacityTitle}>Today's Capacity</Text>
          <Text style={styles.capacityStats}>
            {stats?.checkedInToday || 0} / {stats?.totalCapacity || 0} spots filled
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: capacityPercent + '%', backgroundColor: capacityColor }
            ]}
          />
        </View>
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
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  quickCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  quickCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickCardContent: {
    flex: 1,
  },
  quickCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  quickCardValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  capacityCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  capacityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  capacityStats: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressBarBg: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 8,
  },
});

export default ${componentName};
`;
}

/**
 * Generate ActivityCalendarDaycare component (React Native)
 */
export function generateActivityCalendarDaycare(options: ActivityCalendarOptions = {}): string {
  const {
    componentName = 'ActivityCalendarDaycare',
    endpoint = '/daycare/activities',
    queryKey = 'daycare-activities',
  } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface DaycareActivity {
  id: string;
  title: string;
  type: 'playtime' | 'feeding' | 'rest' | 'training' | 'group_activity' | 'individual';
  start_time: string;
  end_time: string;
  date: string;
  location?: string;
  staff_assigned?: string;
  participants?: { id: string; name: string }[];
  description?: string;
  recurring?: boolean;
}

interface ${componentName}Props {
  data?: DaycareActivity[];
  onActivityClick?: (activity: DaycareActivity) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7);

const activityConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  playtime: { icon: 'game-controller', color: '#16A34A', bgColor: '#DCFCE7' },
  feeding: { icon: 'restaurant', color: '#EA580C', bgColor: '#FFEDD5' },
  rest: { icon: 'moon', color: '#4F46E5', bgColor: '#E0E7FF' },
  training: { icon: 'fitness', color: '#7C3AED', bgColor: '#EDE9FE' },
  group_activity: { icon: 'people', color: '#2563EB', bgColor: '#DBEAFE' },
  individual: { icon: 'person', color: '#EC4899', bgColor: '#FCE7F3' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ data: propData, onActivityClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<DaycareActivity | null>(null);

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${queryKey}', currentDate.toISOString()],
    queryFn: async () => {
      try {
        const response = await api.get<DaycareActivity[]>('${endpoint}?date=' + currentDate.toISOString());
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const activities = propData || fetchedData || [];

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const start = new Date(currentDate);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const getActivitiesForDateAndHour = (date: Date, hour: number) => {
    return activities.filter((activity: DaycareActivity) => {
      const activityDate = new Date(activity.date);
      const [activityHour] = activity.start_time.split(':').map(Number);
      return (
        activityDate.getFullYear() === date.getFullYear() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getDate() === date.getDate() &&
        activityHour === hour
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const handleActivityPress = (activity: DaycareActivity) => {
    if (onActivityClick) onActivityClick(activity);
    else setSelectedActivity(activity);
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
        <Text style={styles.headerTitle}>Activity Schedule</Text>
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => navigateWeek('prev')} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentDate(new Date())} style={styles.todayButton}>
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateWeek('next')} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Week Header */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.weekHeader}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeHeaderText}>Time</Text>
            </View>
            {weekDays.map((day, idx) => (
              <View key={idx} style={[styles.dayColumn, isToday(day) && styles.todayColumn]}>
                <Text style={[styles.dayText, isToday(day) && styles.todayText]}>
                  {WEEKDAYS[day.getDay()]}
                </Text>
                <Text style={[styles.dateText, isToday(day) && styles.todayText]}>
                  {day.getMonth() + 1}/{day.getDate()}
                </Text>
              </View>
            ))}
          </View>

          {/* Schedule Grid */}
          <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
            {HOURS.map((hour) => (
              <View key={hour} style={styles.hourRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>
                    {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                  </Text>
                </View>
                {weekDays.map((day, idx) => {
                  const hourActivities = getActivitiesForDateAndHour(day, hour);
                  return (
                    <View key={idx} style={[styles.dayColumn, styles.activityCell, isToday(day) && styles.todayCellBg]}>
                      {hourActivities.map((activity: DaycareActivity) => {
                        const config = activityConfig[activity.type] || activityConfig.individual;
                        return (
                          <TouchableOpacity
                            key={activity.id}
                            style={[styles.activityChip, { backgroundColor: config.bgColor }]}
                            onPress={() => handleActivityPress(activity)}
                          >
                            <Ionicons name={config.icon as any} size={10} color={config.color} />
                            <Text style={[styles.activityText, { color: config.color }]} numberOfLines={1}>
                              {activity.title}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(activityConfig).map(([type, { color, bgColor }]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: bgColor, borderColor: color }]} />
            <Text style={styles.legendText}>{type.replace('_', ' ')}</Text>
          </View>
        ))}
      </View>

      {/* Activity Detail Modal */}
      <Modal
        visible={!!selectedActivity}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedActivity(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedActivity(null)}
        >
          <View style={styles.modalContent}>
            {selectedActivity && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>{selectedActivity.title}</Text>
                    <Text style={styles.modalType}>{selectedActivity.type.replace('_', ' ')}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedActivity(null)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text style={styles.modalRowText}>
                      {selectedActivity.start_time} - {selectedActivity.end_time}
                    </Text>
                  </View>
                  {selectedActivity.location && (
                    <View style={styles.modalRow}>
                      <Ionicons name="location-outline" size={16} color="#6B7280" />
                      <Text style={styles.modalRowText}>{selectedActivity.location}</Text>
                    </View>
                  )}
                  {selectedActivity.staff_assigned && (
                    <View style={styles.modalRow}>
                      <Ionicons name="person-outline" size={16} color="#6B7280" />
                      <Text style={styles.modalRowText}>{selectedActivity.staff_assigned}</Text>
                    </View>
                  )}
                  {selectedActivity.description && (
                    <Text style={styles.modalDescription}>{selectedActivity.description}</Text>
                  )}
                  {selectedActivity.participants && selectedActivity.participants.length > 0 && (
                    <View style={styles.participantsSection}>
                      <Text style={styles.participantsLabel}>
                        Participants ({selectedActivity.participants.length})
                      </Text>
                      <View style={styles.participantsList}>
                        {selectedActivity.participants.map((pet) => (
                          <View key={pet.id} style={styles.participantTag}>
                            <Text style={styles.participantName}>{pet.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setSelectedActivity(null)}
                >
                  <Text style={styles.closeModalButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    color: '#3B82F6',
    fontWeight: '600',
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeColumn: {
    width: 60,
    padding: 8,
    justifyContent: 'center',
  },
  timeHeaderText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  dayColumn: {
    width: 80,
    padding: 8,
    alignItems: 'center',
  },
  todayColumn: {
    backgroundColor: '#EFF6FF',
  },
  todayCellBg: {
    backgroundColor: '#EFF6FF',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  dateText: {
    fontSize: 11,
    color: '#6B7280',
  },
  gridScroll: {
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 60,
  },
  timeText: {
    fontSize: 10,
    color: '#6B7280',
  },
  activityCell: {
    paddingVertical: 4,
    gap: 4,
    alignItems: 'stretch',
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activityText: {
    fontSize: 9,
    fontWeight: '500',
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalType: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'capitalize',
    marginTop: 4,
  },
  modalBody: {
    gap: 12,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalRowText: {
    fontSize: 14,
    color: '#374151',
  },
  modalDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
  },
  participantsSection: {
    marginTop: 12,
  },
  participantsLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantName: {
    fontSize: 12,
    color: '#374151',
  },
  closeModalButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate CheckinListToday component (React Native)
 */
export function generateCheckinListToday(options: CheckinListOptions = {}): string {
  const {
    componentName = 'CheckinListToday',
    endpoint = '/daycare/checkins/today',
    queryKey = 'daycare-checkins-today',
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface CheckinEntry {
  id: string;
  pet_id: string;
  pet_name: string;
  pet_type: 'dog' | 'cat' | 'other';
  breed: string;
  avatar_url?: string;
  owner_name: string;
  owner_phone: string;
  scheduled_checkin: string;
  scheduled_checkout: string;
  actual_checkin?: string;
  actual_checkout?: string;
  status: 'expected' | 'checked_in' | 'checked_out' | 'no_show';
  package_type?: string;
  special_notes?: string;
  pickup_authorized?: string[];
}

interface ${componentName}Props {
  onPetClick?: (entry: CheckinEntry) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onPetClick }) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'expected' | 'checked_in' | 'checked_out'>('all');

  const { data: entries, isLoading, refetch } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<CheckinEntry[]>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch checkins:', err);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const checkinMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return api.post('${endpoint.replace('/today', '')}/' + entryId + '/checkin', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return api.post('${endpoint.replace('/today', '')}/' + entryId + '/checkout', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const filteredEntries = (entries || []).filter((entry: CheckinEntry) => {
    const matchesSearch =
      entry.pet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.owner_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      expected: { bg: '#FEF3C7', text: '#D97706' },
      checked_in: { bg: '#D1FAE5', text: '#059669' },
      checked_out: { bg: '#E5E7EB', text: '#6B7280' },
      no_show: { bg: '#FEE2E2', text: '#DC2626' },
    };
    return colors[status] || colors.expected;
  };

  const formatTime = (time: string) => {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handlePetPress = (entry: CheckinEntry) => {
    if (onPetClick) onPetClick(entry);
    else navigation.navigate('ChildProfile' as never, { id: entry.pet_id } as never);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL('tel:' + phone);
  };

  const stats = {
    expected: (entries || []).filter((e: CheckinEntry) => e.status === 'expected').length,
    checkedIn: (entries || []).filter((e: CheckinEntry) => e.status === 'checked_in').length,
    checkedOut: (entries || []).filter((e: CheckinEntry) => e.status === 'checked_out').length,
  };

  const renderEntry = ({ item }: { item: CheckinEntry }) => {
    const statusColors = getStatusColor(item.status);

    return (
      <TouchableOpacity style={styles.entryCard} onPress={() => handlePetPress(item)} activeOpacity={0.7}>
        <View style={styles.entryHeader}>
          <View style={styles.petInfoRow}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.petAvatar} />
            ) : (
              <View style={styles.petAvatarPlaceholder}>
                <Ionicons name="paw" size={20} color="#3B82F6" />
              </View>
            )}
            <View style={styles.petDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.petName}>{item.pet_name}</Text>
                {item.special_notes && (
                  <Ionicons name="alert-circle" size={14} color="#F59E0B" />
                )}
              </View>
              <Text style={styles.petBreed}>{item.breed}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.entryBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{item.owner_name}</Text>
            </View>
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => handlePhonePress(item.owner_phone)}
            >
              <Ionicons name="call-outline" size={14} color="#3B82F6" />
              <Text style={styles.phoneText}>{item.owner_phone}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Ionicons name="log-in-outline" size={14} color="#10B981" />
              <Text style={styles.timeText}>{formatTime(item.scheduled_checkin)}</Text>
            </View>
            <View style={styles.timeItem}>
              <Ionicons name="log-out-outline" size={14} color="#EF4444" />
              <Text style={styles.timeText}>{formatTime(item.scheduled_checkout)}</Text>
            </View>
            {item.package_type && (
              <View style={styles.packageBadge}>
                <Text style={styles.packageText}>{item.package_type}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.entryFooter}>
          {item.status === 'expected' && (
            <TouchableOpacity
              style={styles.checkinButton}
              onPress={() => checkinMutation.mutate(item.id)}
              disabled={checkinMutation.isPending}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.checkinButtonText}>Check In</Text>
            </TouchableOpacity>
          )}
          {item.status === 'checked_in' && (
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => checkoutMutation.mutate(item.id)}
              disabled={checkoutMutation.isPending}
            >
              <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
              <Text style={styles.checkoutButtonText}>Check Out</Text>
            </TouchableOpacity>
          )}
          {item.status === 'checked_out' && item.actual_checkout && (
            <Text style={styles.checkoutTimeText}>Out: {formatTime(item.actual_checkout)}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="paw-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No check-ins found</Text>
    </View>
  );

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
        <View>
          <View style={styles.headerTitleRow}>
            <Ionicons name="time-outline" size={20} color="#111827" />
            <Text style={styles.headerTitle}>Today's Check-ins</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {stats.expected} expected, {stats.checkedIn} checked in, {stats.checkedOut} checked out
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pets or owners..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.statusFilters}>
          {(['all', 'expected', 'checked_in', 'checked_out'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, statusFilter === status && styles.filterButtonActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[
                styles.filterButtonText,
                statusFilter === status && styles.filterButtonTextActive
              ]}>
                {status === 'checked_in' ? 'In' : status === 'checked_out' ? 'Out' : status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </View>
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
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  petInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  petAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  petAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  petBreed: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  entryBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#374151',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 13,
    color: '#3B82F6',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#374151',
  },
  packageBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  packageText: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '500',
  },
  entryFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  checkinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  checkoutTimeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
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

/**
 * Generate ChildProfile component (React Native) - Pet profile in daycare context
 */
export function generateChildProfile(options: ChildProfileOptions = {}): string {
  const {
    componentName = 'ChildProfile',
    endpoint = '/daycare/pets',
  } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface DaycarePetData {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight?: number;
  size?: 'small' | 'medium' | 'large';
  color: string;
  gender: 'male' | 'female';
  avatar_url?: string;
  is_neutered?: boolean;
  allergies?: string[];
  medical_notes?: string;
  dietary_requirements?: string;
  temperament?: string;
  socialization_level?: 'great' | 'good' | 'needs_work' | 'prefers_alone';
  play_style?: string;
  favorite_activities?: string[];
  fears_triggers?: string[];
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  emergency_contact?: { name: string; phone: string; relationship: string };
  pickup_authorized?: { name: string; phone: string; relationship: string }[];
  special_instructions?: string;
  membership?: {
    type: string;
    visits_remaining?: number;
    expires_at?: string;
  };
  stats?: {
    total_visits: number;
    current_streak: number;
    favorite_playmate?: string;
    avg_rating?: number;
  };
  recent_visits?: {
    date: string;
    duration: string;
    notes?: string;
    rating?: number;
  }[];
}

interface ${componentName}Props {
  petId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ petId: propPetId }) => {
  const route = useRoute();
  const routePetId = (route.params as { id?: string })?.id;
  const petId = propPetId || routePetId;

  const { data: pet, isLoading } = useQuery({
    queryKey: ['daycare-pet', petId],
    queryFn: async () => {
      const response = await api.get<DaycarePetData>('${endpoint}/' + petId);
      return response?.data || response;
    },
    enabled: !!petId,
  });

  const handlePhonePress = (phone: string) => {
    Linking.openURL('tel:' + phone);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL('mailto:' + email);
  };

  const getSocializationColor = (level?: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      great: { bg: '#D1FAE5', text: '#059669' },
      good: { bg: '#DBEAFE', text: '#2563EB' },
      needs_work: { bg: '#FEF3C7', text: '#D97706' },
      prefers_alone: { bg: '#FFEDD5', text: '#EA580C' },
    };
    return colors[level || 'good'] || colors.good;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Pet not found</Text>
      </View>
    );
  }

  const socializationColors = getSocializationColor(pet.socialization_level);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Pet Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.petHeaderRow}>
          {pet.avatar_url ? (
            <Image source={{ uri: pet.avatar_url }} style={styles.petAvatar} />
          ) : (
            <View style={styles.petAvatarPlaceholder}>
              <Ionicons name="paw" size={48} color="#3B82F6" />
            </View>
          )}
          <View style={styles.petHeaderInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.petName}>{pet.name}</Text>
              <View style={[
                styles.genderBadge,
                { backgroundColor: pet.gender === 'male' ? '#DBEAFE' : '#FCE7F3' }
              ]}>
                <Text style={[
                  styles.genderText,
                  { color: pet.gender === 'male' ? '#1D4ED8' : '#DB2777' }
                ]}>
                  {pet.gender}
                </Text>
              </View>
              {pet.socialization_level && (
                <View style={[styles.socializationBadge, { backgroundColor: socializationColors.bg }]}>
                  <Text style={[styles.socializationText, { color: socializationColors.text }]}>
                    {pet.socialization_level.replace('_', ' ')}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.petBreed}>{pet.breed} - {pet.age} years old</Text>
            <View style={styles.petMeta}>
              {pet.weight && <Text style={styles.metaText}>Weight: {pet.weight} lbs</Text>}
              {pet.size && <Text style={styles.metaText}>Size: {pet.size}</Text>}
              <Text style={styles.metaText}>Color: {pet.color}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        {pet.stats && (
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Ionicons name="analytics-outline" size={18} color="#3B82F6" />
              <Text style={styles.statValue}>{pet.stats.total_visits}</Text>
              <Text style={styles.statLabel}>visits</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={18} color="#10B981" />
              <Text style={styles.statValue}>{pet.stats.current_streak}</Text>
              <Text style={styles.statLabel}>day streak</Text>
            </View>
            {pet.stats.avg_rating && (
              <View style={styles.statItem}>
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text style={styles.statValue}>{pet.stats.avg_rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>avg rating</Text>
              </View>
            )}
          </View>
        )}

        {/* Membership Card */}
        {pet.membership && (
          <View style={styles.membershipCard}>
            <View style={styles.membershipHeader}>
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              <Text style={styles.membershipType}>{pet.membership.type}</Text>
            </View>
            {pet.membership.visits_remaining !== undefined && (
              <Text style={styles.membershipInfo}>{pet.membership.visits_remaining} visits remaining</Text>
            )}
            {pet.membership.expires_at && (
              <Text style={styles.membershipExpiry}>
                Expires: {new Date(pet.membership.expires_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Behavior & Preferences */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="heart" size={20} color="#EC4899" />
          <Text style={styles.sectionTitle}>Behavior & Preferences</Text>
        </View>

        {pet.temperament && (
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Temperament</Text>
            <Text style={styles.infoText}>{pet.temperament}</Text>
          </View>
        )}

        {pet.play_style && (
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Play Style</Text>
            <Text style={styles.infoText}>{pet.play_style}</Text>
          </View>
        )}

        {pet.favorite_activities && pet.favorite_activities.length > 0 && (
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Favorite Activities</Text>
            <View style={styles.tagList}>
              {pet.favorite_activities.map((activity, i) => (
                <View key={i} style={styles.activityTag}>
                  <Text style={styles.activityTagText}>{activity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {pet.fears_triggers && pet.fears_triggers.length > 0 && (
          <View style={styles.warningBox}>
            <View style={styles.warningHeader}>
              <Ionicons name="alert-circle" size={16} color="#D97706" />
              <Text style={styles.warningTitle}>Fears / Triggers</Text>
            </View>
            <View style={styles.tagList}>
              {pet.fears_triggers.map((trigger, i) => (
                <View key={i} style={styles.triggerTag}>
                  <Text style={styles.triggerTagText}>{trigger}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {pet.stats?.favorite_playmate && (
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Best Buddy</Text>
            <Text style={styles.infoText}>{pet.stats.favorite_playmate}</Text>
          </View>
        )}
      </View>

      {/* Health & Care */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="medkit" size={20} color="#EF4444" />
          <Text style={styles.sectionTitle}>Health & Care</Text>
        </View>

        {pet.allergies && pet.allergies.length > 0 && (
          <View style={styles.alertBox}>
            <View style={styles.alertHeader}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.alertTitle}>Allergies</Text>
            </View>
            <View style={styles.tagList}>
              {pet.allergies.map((allergy, i) => (
                <View key={i} style={styles.allergyTag}>
                  <Text style={styles.allergyTagText}>{allergy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {pet.medical_notes && (
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Medical Notes</Text>
            <Text style={styles.infoText}>{pet.medical_notes}</Text>
          </View>
        )}

        {pet.dietary_requirements && (
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Dietary Requirements</Text>
            <Text style={styles.infoText}>{pet.dietary_requirements}</Text>
          </View>
        )}

        {pet.special_instructions && (
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsLabel}>Special Instructions</Text>
            <Text style={styles.instructionsText}>{pet.special_instructions}</Text>
          </View>
        )}
      </View>

      {/* Owner & Contacts */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Owner</Text>
        </View>
        <Text style={styles.ownerName}>{pet.owner.name}</Text>
        <TouchableOpacity style={styles.contactRow} onPress={() => handleEmailPress(pet.owner.email)}>
          <Ionicons name="mail-outline" size={16} color="#6B7280" />
          <Text style={styles.contactText}>{pet.owner.email}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow} onPress={() => handlePhonePress(pet.owner.phone)}>
          <Ionicons name="call-outline" size={16} color="#6B7280" />
          <Text style={styles.contactText}>{pet.owner.phone}</Text>
        </TouchableOpacity>
      </View>

      {/* Authorized Pickup */}
      {pet.pickup_authorized && pet.pickup_authorized.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Authorized Pickup</Text>
          {pet.pickup_authorized.map((person, i) => (
            <View key={i} style={styles.authorizedPerson}>
              <View>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personRelation}>{person.relationship}</Text>
              </View>
              <TouchableOpacity onPress={() => handlePhonePress(person.phone)}>
                <Text style={styles.personPhone}>{person.phone}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Recent Visits */}
      {pet.recent_visits && pet.recent_visits.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Recent Visits</Text>
          </View>
          {pet.recent_visits.map((visit, i) => (
            <View key={i} style={styles.visitItem}>
              <View style={styles.visitInfo}>
                <Text style={styles.visitDate}>
                  {new Date(visit.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.visitDuration}>{visit.duration}</Text>
                {visit.notes && <Text style={styles.visitNotes}>{visit.notes}</Text>}
              </View>
              {visit.rating && (
                <View style={styles.visitRating}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{visit.rating}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.bottomPadding} />
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
  petHeaderRow: {
    flexDirection: 'row',
    gap: 16,
  },
  petAvatar: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  petAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petHeaderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  petName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  genderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genderText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  socializationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  socializationText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  petBreed: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  petMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  membershipCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  membershipType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  membershipInfo: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  membershipExpiry: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
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
  infoGroup: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityTagText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  triggerTag: {
    backgroundColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  triggerTagText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  alertBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  allergyTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  allergyTagText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  instructionsBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  instructionsLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1E40AF',
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
  },
  authorizedPerson: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  personName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  personRelation: {
    fontSize: 12,
    color: '#6B7280',
  },
  personPhone: {
    fontSize: 13,
    color: '#3B82F6',
  },
  visitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  visitInfo: {
    flex: 1,
  },
  visitDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  visitDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  visitNotes: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  visitRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bottomPadding: {
    height: 24,
  },
});

export default ${componentName};
`;
}
