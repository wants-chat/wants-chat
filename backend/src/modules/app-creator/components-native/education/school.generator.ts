/**
 * React Native School Component Generators
 *
 * Generates school-wide components for education mobile applications.
 * Components: SchoolStats, SchoolEvents, ExamCalendar, ExamListToday, TestListUpcoming
 */

export interface SchoolStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSchoolStats(options: SchoolStatsOptions = {}): string {
  const { componentName = 'SchoolStats', endpoint = '/school/stats' } = options;

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

interface ${componentName}Props {
  style?: object;
}

const ${componentName}: React.FC<${componentName}Props> = ({ style }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['school-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={[style, styles.loadingContainer]}>
        <View style={styles.statsGrid}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonValue} />
              <View style={styles.skeletonLabel} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  const statCards = [
    {
      label: 'Total Students',
      value: stats?.total_students || 0,
      icon: 'people-outline',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      change: stats?.students_change,
    },
    {
      label: 'Total Teachers',
      value: stats?.total_teachers || 0,
      icon: 'school-outline',
      color: '#16A34A',
      bgColor: '#DCFCE7',
      change: stats?.teachers_change,
    },
    {
      label: 'Active Classes',
      value: stats?.total_classes || 0,
      icon: 'book-outline',
      color: '#D97706',
      bgColor: '#FEF3C7',
      change: stats?.classes_change,
    },
    {
      label: 'Courses',
      value: stats?.total_courses || 0,
      icon: 'business-outline',
      color: '#9333EA',
      bgColor: '#F3E8FF',
      change: stats?.courses_change,
    },
  ];

  return (
    <View style={style}>
      {/* Main Stats */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              {stat.change !== undefined && stat.change !== 0 && (
                <View style={[
                  styles.changeBadge,
                  { backgroundColor: stat.change > 0 ? '#DCFCE7' : '#FEE2E2' }
                ]}>
                  <Ionicons
                    name={stat.change > 0 ? 'trending-up' : 'trending-down'}
                    size={12}
                    color={stat.change > 0 ? '#16A34A' : '#DC2626'}
                  />
                  <Text style={[
                    styles.changeText,
                    { color: stat.change > 0 ? '#16A34A' : '#DC2626' }
                  ]}>
                    {Math.abs(stat.change)}%
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.statValue}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Additional Stats Row */}
      <View style={styles.additionalStats}>
        <View style={[styles.gradientCard, { backgroundColor: '#3B82F6' }]}>
          <View style={styles.gradientHeader}>
            <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.gradientLabel}>Attendance Rate</Text>
          </View>
          <Text style={styles.gradientValue}>{stats?.attendance_rate || 0}%</Text>
        </View>
        <View style={[styles.gradientCard, { backgroundColor: '#16A34A' }]}>
          <View style={styles.gradientHeader}>
            <Ionicons name="ribbon-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.gradientLabel}>Average GPA</Text>
          </View>
          <Text style={styles.gradientValue}>{stats?.average_gpa || 'N/A'}</Text>
        </View>
        <View style={[styles.gradientCard, { backgroundColor: '#9333EA' }]}>
          <View style={styles.gradientHeader}>
            <Ionicons name="school-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.gradientLabel}>Graduation Rate</Text>
          </View>
          <Text style={styles.gradientValue}>{stats?.graduation_rate || 0}%</Text>
        </View>
        <View style={[styles.gradientCard, { backgroundColor: '#EA580C' }]}>
          <View style={styles.gradientHeader}>
            <Ionicons name="people-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.gradientLabel}>Student:Teacher</Text>
          </View>
          <Text style={styles.gradientValue}>{stats?.student_teacher_ratio || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    opacity: 0.7,
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
  skeletonCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  skeletonValue: {
    width: 60,
    height: 28,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLabel: {
    width: 80,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '500',
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
    flexWrap: 'wrap',
    gap: 8,
  },
  gradientCard: {
    width: '48%',
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
});

export default ${componentName};
`;
}

export interface SchoolEventsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSchoolEvents(options: SchoolEventsOptions = {}): string {
  const { componentName = 'SchoolEvents', endpoint = '/school/events' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  showViewAll?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 5, showViewAll = true }) => {
  const navigation = useNavigation();

  const { data: events, isLoading } = useQuery({
    queryKey: ['school-events', limit],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?limit=\${limit}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      academic: { bg: '#DBEAFE', text: '#3B82F6' },
      sports: { bg: '#DCFCE7', text: '#16A34A' },
      cultural: { bg: '#F3E8FF', text: '#9333EA' },
      holiday: { bg: '#FEE2E2', text: '#DC2626' },
      meeting: { bg: '#FEF3C7', text: '#D97706' },
      exam: { bg: '#FFEDD5', text: '#EA580C' },
    };
    return colors[type?.toLowerCase()] || colors.academic;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingInner}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
          <Text style={styles.title}>Upcoming Events</Text>
        </View>
        {showViewAll && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Events' as never)}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>

      {events && events.length > 0 ? (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item: event }) => {
            const typeColors = getEventTypeColor(event.type);
            return (
              <TouchableOpacity
                style={styles.eventItem}
                onPress={() => navigation.navigate('EventDetail' as never, { id: event.id } as never)}
              >
                {/* Date Box */}
                <View style={styles.dateBox}>
                  <View style={styles.dateMonth}>
                    <Text style={styles.dateMonthText}>
                      {new Date(event.date || event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.dateDay}>
                    <Text style={styles.dateDayText}>
                      {new Date(event.date || event.start_date).getDate()}
                    </Text>
                  </View>
                </View>

                {/* Event Details */}
                <View style={styles.eventDetails}>
                  <View style={styles.eventTitleRow}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                    {event.is_important && (
                      <Ionicons name="star" size={14} color="#EAB308" />
                    )}
                  </View>
                  {event.type && (
                    <View style={[styles.typeBadge, { backgroundColor: typeColors.bg }]}>
                      <Text style={[styles.typeText, { color: typeColors.text }]}>{event.type}</Text>
                    </View>
                  )}
                  <View style={styles.eventMeta}>
                    {event.time && (
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={12} color="#6B7280" />
                        <Text style={styles.metaText}>{event.time}</Text>
                      </View>
                    )}
                    {event.location && (
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={12} color="#6B7280" />
                        <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No upcoming events</Text>
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
  loadingInner: {
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
    color: '#3B82F6',
  },
  eventItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateBox: {
    width: 52,
    marginRight: 12,
  },
  dateMonth: {
    backgroundColor: '#3B82F6',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },
  dateMonthText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dateDay: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dateDayText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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

export interface ExamCalendarOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateExamCalendar(options: ExamCalendarOptions = {}): string {
  const { componentName = 'ExamCalendar', endpoint = '/exams' } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface ${componentName}Props {
  classId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ classId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedExam, setSelectedExam] = useState<any | null>(null);

  const { data: exams, isLoading } = useQuery({
    queryKey: ['exam-calendar', currentMonth.getMonth(), currentMonth.getFullYear(), classId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('month', String(currentMonth.getMonth() + 1));
      params.append('year', String(currentMonth.getFullYear()));
      if (classId) params.append('class_id', classId);
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

  const getExamsForDate = (date: Date) => {
    if (!exams) return [];
    return exams.filter((exam: any) => {
      const examDate = new Date(exam.date || exam.exam_date);
      return (
        examDate.getFullYear() === date.getFullYear() &&
        examDate.getMonth() === date.getMonth() &&
        examDate.getDate() === date.getDate()
      );
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getExamTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      midterm: { bg: '#DBEAFE', border: '#3B82F6', text: '#3B82F6' },
      final: { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' },
      quiz: { bg: '#DCFCE7', border: '#16A34A', text: '#16A34A' },
      test: { bg: '#FEF3C7', border: '#D97706', text: '#D97706' },
      practical: { bg: '#F3E8FF', border: '#9333EA', text: '#9333EA' },
    };
    return colors[type?.toLowerCase()] || { bg: '#F3F4F6', border: '#6B7280', text: '#6B7280' };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
            <Text style={styles.title}>Exam Schedule</Text>
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

        {/* Weekday Headers */}
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map(day => (
            <Text key={day} style={styles.weekday}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, idx) => {
            const dayExams = getExamsForDate(day.date);
            return (
              <View
                key={idx}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.dayCellDisabled,
                ]}
              >
                <Text style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.dayTextDisabled,
                  isToday(day.date) && styles.dayTextToday,
                ]}>
                  {day.date.getDate()}
                </Text>
                <View style={styles.examList}>
                  {dayExams.slice(0, 2).map((exam: any, i: number) => {
                    const colors = getExamTypeColor(exam.type);
                    return (
                      <TouchableOpacity
                        key={exam.id || i}
                        onPress={() => setSelectedExam(exam)}
                        style={[
                          styles.examBadge,
                          { backgroundColor: colors.bg, borderLeftColor: colors.border }
                        ]}
                      >
                        <Text style={[styles.examBadgeText, { color: colors.text }]} numberOfLines={1}>
                          {exam.subject || exam.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {dayExams.length > 2 && (
                    <Text style={styles.moreText}>+{dayExams.length - 2} more</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Types:</Text>
          <View style={[styles.legendItem, { backgroundColor: '#FEE2E2' }]}>
            <Text style={{ color: '#DC2626', fontSize: 10 }}>Final</Text>
          </View>
          <View style={[styles.legendItem, { backgroundColor: '#DBEAFE' }]}>
            <Text style={{ color: '#3B82F6', fontSize: 10 }}>Midterm</Text>
          </View>
          <View style={[styles.legendItem, { backgroundColor: '#DCFCE7' }]}>
            <Text style={{ color: '#16A34A', fontSize: 10 }}>Quiz</Text>
          </View>
        </View>
      </View>

      {/* Exam Detail Modal */}
      <Modal visible={!!selectedExam} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSelectedExam(null)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedExam?.subject || selectedExam?.title}</Text>
            <View style={styles.modalInfo}>
              <View style={styles.modalRow}>
                <Ionicons name="document-text-outline" size={16} color="#6B7280" />
                <Text style={styles.modalText}>{selectedExam?.type || 'Exam'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.modalText}>
                  {new Date(selectedExam?.date || selectedExam?.exam_date).toLocaleDateString()}
                  {selectedExam?.time && \` at \${selectedExam.time}\`}
                </Text>
              </View>
              {selectedExam?.duration && (
                <View style={styles.modalRow}>
                  <Ionicons name="hourglass-outline" size={16} color="#6B7280" />
                  <Text style={styles.modalText}>Duration: {selectedExam.duration}</Text>
                </View>
              )}
              {selectedExam?.room && (
                <View style={styles.modalRow}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                  <Text style={styles.modalText}>Room: {selectedExam.room}</Text>
                </View>
              )}
              {selectedExam?.topics && (
                <View style={styles.topicsSection}>
                  <Text style={styles.topicsTitle}>Topics Covered:</Text>
                  <Text style={styles.topicsText}>{selectedExam.topics}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedExam(null)}>
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
    minHeight: 80,
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
    marginBottom: 4,
  },
  dayTextDisabled: {
    color: '#D1D5DB',
  },
  dayTextToday: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  examList: {
    gap: 2,
  },
  examBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    borderLeftWidth: 2,
  },
  examBadgeText: {
    fontSize: 9,
  },
  moreText: {
    fontSize: 9,
    color: '#3B82F6',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
    backgroundColor: '#F9FAFB',
  },
  legendTitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  legendItem: {
    paddingHorizontal: 6,
    paddingVertical: 2,
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
  topicsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  topicsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  topicsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    marginTop: 24,
    backgroundColor: '#3B82F6',
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

export interface ExamListTodayOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateExamListToday(options: ExamListTodayOptions = {}): string {
  const { componentName = 'ExamListToday', endpoint = '/exams/today' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
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
    queryKey: ['exams-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingInner}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      </View>
    );
  }

  const exams = data?.exams || data || [];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Ionicons name="document-text-outline" size={20} color="#EA580C" />
            <Text style={styles.title}>Today's Exams</Text>
          </View>
          <Text style={styles.dateText}>{today}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Exams' as never)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {exams.length > 0 ? (
        <FlatList
          data={exams}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item: exam }) => (
            <View style={styles.examItem}>
              <View style={styles.examInfo}>
                <View style={styles.examTitleRow}>
                  <Text style={styles.examTitle}>{exam.subject || exam.title}</Text>
                  {exam.is_mandatory && (
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  )}
                </View>
                <View style={[
                  styles.typeBadge,
                  { backgroundColor: exam.type === 'final' ? '#FEE2E2' : exam.type === 'midterm' ? '#DBEAFE' : '#F3F4F6' }
                ]}>
                  <Text style={[
                    styles.typeText,
                    { color: exam.type === 'final' ? '#DC2626' : exam.type === 'midterm' ? '#3B82F6' : '#6B7280' }
                  ]}>
                    {exam.type || 'Exam'}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text style={styles.metaText}>
                      {exam.time || exam.start_time}
                      {exam.duration && \` (\${exam.duration})\`}
                    </Text>
                  </View>
                  {exam.room && (
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={14} color="#6B7280" />
                      <Text style={styles.metaText}>Room {exam.room}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: exam.status === 'ongoing' ? '#DCFCE7' :
                    exam.status === 'completed' ? '#F3F4F6' : '#FEF3C7'
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  {
                    color: exam.status === 'ongoing' ? '#16A34A' :
                      exam.status === 'completed' ? '#6B7280' : '#D97706'
                  }
                ]}>
                  {exam.status || 'Scheduled'}
                </Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No exams scheduled for today</Text>
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
  loadingInner: {
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
    color: '#3B82F6',
  },
  examItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  examInfo: {
    flex: 1,
  },
  examTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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

export interface TestListUpcomingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTestListUpcoming(options: TestListUpcomingOptions = {}): string {
  const { componentName = 'TestListUpcoming', endpoint = '/exams/upcoming' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  classId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 5, classId }) => {
  const navigation = useNavigation();

  const { data, isLoading } = useQuery({
    queryKey: ['tests-upcoming', limit, classId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', String(limit));
      if (classId) params.append('class_id', classId);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getDaysUntil = (date: string) => {
    const examDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return \`In \${diffDays} days\`;
  };

  const getUrgencyColor = (date: string) => {
    const examDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return { bg: '#FEE2E2', text: '#DC2626' };
    if (diffDays <= 3) return { bg: '#FFEDD5', text: '#EA580C' };
    if (diffDays <= 7) return { bg: '#FEF3C7', text: '#D97706' };
    return { bg: '#DCFCE7', text: '#16A34A' };
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingInner}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="book-outline" size={20} color="#9333EA" />
          <Text style={styles.title}>Upcoming Tests & Exams</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Exams' as never)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {data && data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item: exam }) => {
            const urgencyColors = getUrgencyColor(exam.date || exam.exam_date);
            return (
              <TouchableOpacity
                style={styles.examItem}
                onPress={() => navigation.navigate('ExamDetail' as never, { id: exam.id } as never)}
              >
                {/* Date Badge */}
                <View style={styles.dateBadge}>
                  <Text style={styles.dateMonth}>
                    {new Date(exam.date || exam.exam_date).toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                  <Text style={styles.dateDay}>
                    {new Date(exam.date || exam.exam_date).getDate()}
                  </Text>
                </View>

                {/* Exam Info */}
                <View style={styles.examInfo}>
                  <Text style={styles.examTitle} numberOfLines={1}>
                    {exam.subject || exam.title}
                  </Text>
                  <View style={styles.metaRow}>
                    {exam.class_name && (
                      <View style={styles.metaItem}>
                        <Ionicons name="book-outline" size={12} color="#6B7280" />
                        <Text style={styles.metaText}>{exam.class_name}</Text>
                      </View>
                    )}
                    {exam.time && (
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={12} color="#6B7280" />
                        <Text style={styles.metaText}>{exam.time}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Days Until */}
                <View style={[styles.urgencyBadge, { backgroundColor: urgencyColors.bg }]}>
                  <Text style={[styles.urgencyText, { color: urgencyColors.text }]}>
                    {getDaysUntil(exam.date || exam.exam_date)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No upcoming tests or exams</Text>
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
  loadingInner: {
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
    color: '#3B82F6',
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateBadge: {
    width: 48,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 8,
    marginRight: 12,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '500',
    color: '#3B82F6',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  metaRow: {
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
    fontSize: 12,
    color: '#6B7280',
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '500',
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
