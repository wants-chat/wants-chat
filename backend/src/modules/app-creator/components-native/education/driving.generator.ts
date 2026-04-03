/**
 * React Native Driving School Component Generators
 *
 * Generates driving school-related components for mobile applications.
 * Components: LessonCalendarDriving, LessonListTodayDriving, StudentProfileDriving, DrivingStats
 */

export interface LessonCalendarDrivingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLessonCalendarDriving(options: LessonCalendarDrivingOptions = {}): string {
  const { componentName = 'LessonCalendarDriving', endpoint = '/driving/lessons' } = options;

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
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['driving-lessons-calendar', currentMonth.getMonth(), currentMonth.getFullYear(), studentId, instructorId],
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

  const getLessonsForDate = (date: Date) => {
    if (!lessons) return [];
    return lessons.filter((lesson: any) => {
      const lessonDate = new Date(lesson.date);
      return lessonDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const getLessonTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      road: { bg: '#DBEAFE', text: '#3B82F6' },
      parking: { bg: '#FEF3C7', text: '#D97706' },
      highway: { bg: '#F3E8FF', text: '#9333EA' },
      test: { bg: '#FEE2E2', text: '#DC2626' },
      theory: { bg: '#DCFCE7', text: '#16A34A' },
    };
    return colors[type?.toLowerCase()] || colors.road;
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
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="car-outline" size={20} color="#3B82F6" />
            <Text style={styles.title}>Lesson Calendar</Text>
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
            const dayLessons = getLessonsForDate(day.date);
            return (
              <View key={idx} style={[styles.dayCell, !day.isCurrentMonth && styles.dayCellDisabled]}>
                <Text style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.dayTextDisabled,
                  isToday(day.date) && styles.dayTextToday,
                ]}>
                  {day.date.getDate()}
                </Text>
                <View style={styles.lessonList}>
                  {dayLessons.slice(0, 2).map((lesson: any, i: number) => {
                    const colors = getLessonTypeColor(lesson.type);
                    return (
                      <TouchableOpacity
                        key={lesson.id || i}
                        onPress={() => setSelectedLesson(lesson)}
                        style={[styles.lessonBadge, { backgroundColor: colors.bg }]}
                      >
                        <Text style={[styles.lessonText, { color: colors.text }]} numberOfLines={1}>
                          {lesson.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {dayLessons.length > 2 && (
                    <Text style={styles.moreText}>+{dayLessons.length - 2}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={[styles.legendItem, { backgroundColor: '#DBEAFE' }]}>
            <Text style={{ color: '#3B82F6', fontSize: 10 }}>Road</Text>
          </View>
          <View style={[styles.legendItem, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ color: '#D97706', fontSize: 10 }}>Parking</Text>
          </View>
          <View style={[styles.legendItem, { backgroundColor: '#F3E8FF' }]}>
            <Text style={{ color: '#9333EA', fontSize: 10 }}>Highway</Text>
          </View>
          <View style={[styles.legendItem, { backgroundColor: '#FEE2E2' }]}>
            <Text style={{ color: '#DC2626', fontSize: 10 }}>Test</Text>
          </View>
        </View>
      </View>

      {/* Lesson Detail Modal */}
      <Modal visible={!!selectedLesson} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSelectedLesson(null)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedLesson?.type || 'Driving'} Lesson</Text>
            <View style={styles.modalInfo}>
              <View style={styles.modalRow}>
                <Ionicons name="person-outline" size={16} color="#6B7280" />
                <Text style={styles.modalText}>{selectedLesson?.instructor_name || selectedLesson?.student_name}</Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.modalText}>
                  {selectedLesson && new Date(selectedLesson.date).toLocaleDateString()} at {selectedLesson?.time}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.modalText}>Duration: {selectedLesson?.duration || 60} minutes</Text>
              </View>
              {selectedLesson?.vehicle && (
                <View style={styles.modalRow}>
                  <Ionicons name="car-outline" size={16} color="#6B7280" />
                  <Text style={styles.modalText}>Vehicle: {selectedLesson.vehicle}</Text>
                </View>
              )}
              {selectedLesson?.route && (
                <View style={styles.modalRow}>
                  <Ionicons name="map-outline" size={16} color="#6B7280" />
                  <Text style={styles.modalText}>Route: {selectedLesson.route}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedLesson(null)}>
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
    color: '#3B82F6',
    fontWeight: '700',
  },
  lessonList: {
    gap: 2,
  },
  lessonBadge: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  lessonText: {
    fontSize: 9,
  },
  moreText: {
    fontSize: 9,
    color: '#3B82F6',
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

export interface LessonListTodayDrivingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLessonListTodayDriving(options: LessonListTodayDrivingOptions = {}): string {
  const { componentName = 'LessonListTodayDriving', endpoint = '/driving/lessons/today' } = options;

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
    queryKey: ['driving-lessons-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  const getLessonTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      road: { bg: '#DBEAFE', text: '#3B82F6', icon: 'car-outline' },
      parking: { bg: '#FEF3C7', text: '#D97706', icon: 'locate-outline' },
      highway: { bg: '#F3E8FF', text: '#9333EA', icon: 'speedometer-outline' },
      test: { bg: '#FEE2E2', text: '#DC2626', icon: 'document-text-outline' },
      theory: { bg: '#DCFCE7', text: '#16A34A', icon: 'book-outline' },
    };
    return colors[type?.toLowerCase()] || colors.road;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  const lessons = data?.lessons || data || [];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Ionicons name="car-outline" size={20} color="#3B82F6" />
            <Text style={styles.title}>Today's Lessons</Text>
          </View>
          <Text style={styles.dateText}>{today}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('DrivingLessons' as never)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {lessons.length > 0 ? (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item: lesson }) => {
            const colors = getLessonTypeColor(lesson.type);
            return (
              <View style={styles.lessonItem}>
                <View style={[styles.lessonIcon, { backgroundColor: colors.bg }]}>
                  <Ionicons name={colors.icon as any} size={20} color={colors.text} />
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonType}>{lesson.type || 'Driving'} Lesson</Text>
                  <View style={styles.lessonMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.metaText}>{lesson.time}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="person-outline" size={14} color="#6B7280" />
                      <Text style={styles.metaText}>{lesson.student_name || lesson.instructor_name}</Text>
                    </View>
                  </View>
                  {lesson.vehicle && (
                    <View style={styles.metaItem}>
                      <Ionicons name="car-outline" size={14} color="#6B7280" />
                      <Text style={styles.metaText}>{lesson.vehicle}</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    {lesson.duration || 60} min
                  </Text>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No lessons scheduled for today</Text>
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
    color: '#3B82F6',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lessonIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  lessonType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  lessonMeta: {
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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

export interface StudentProfileDrivingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProfileDriving(options: StudentProfileDrivingOptions = {}): string {
  const { componentName = 'StudentProfileDriving', endpoint = '/driving/students' } = options;

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
    queryKey: ['driving-student', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#16A34A';
    if (progress >= 50) return '#3B82F6';
    if (progress >= 25) return '#D97706';
    return '#DC2626';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          {student.avatar_url ? (
            <Image source={{ uri: student.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={32} color="#3B82F6" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{student.name}</Text>
            {student.license_type && (
              <View style={styles.licenseBadge}>
                <Text style={styles.licenseText}>{student.license_type} License</Text>
              </View>
            )}
            <View style={styles.contactRow}>
              {student.phone && (
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={14} color="#6B7280" />
                  <Text style={styles.contactText}>{student.phone}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => navigation.navigate('ScheduleDrivingLesson' as never, { studentId: student.id } as never)}
        >
          <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
          <Text style={styles.scheduleButtonText}>Schedule Lesson</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Training Progress</Text>
        <View style={styles.progressInfo}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Completion</Text>
            <Text style={[styles.progressPercent, { color: getProgressColor(student.progress || 0) }]}>
              {student.progress || 0}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: \`\${student.progress || 0}%\`, backgroundColor: getProgressColor(student.progress || 0) }
            ]} />
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="car-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{student.total_lessons || 0}</Text>
          <Text style={styles.statLabel}>Total Lessons</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="time-outline" size={20} color="#16A34A" />
          </View>
          <Text style={styles.statValue}>{student.driving_hours || 0}h</Text>
          <Text style={styles.statLabel}>Driving Hours</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="map-outline" size={20} color="#D97706" />
          </View>
          <Text style={styles.statValue}>{student.miles_driven || 0}</Text>
          <Text style={styles.statLabel}>Miles Driven</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#9333EA" />
          </View>
          <Text style={styles.statValue}>{student.skills_passed || 0}</Text>
          <Text style={styles.statLabel}>Skills Passed</Text>
        </View>
      </View>

      {/* Skills Progress */}
      {student.skills && student.skills.length > 0 && (
        <View style={styles.skillsCard}>
          <Text style={styles.sectionTitle}>Skill Assessment</Text>
          {student.skills.map((skill: any, i: number) => (
            <View key={i} style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <View style={[
                  styles.skillBadge,
                  { backgroundColor: skill.passed ? '#DCFCE7' : '#FEF3C7' }
                ]}>
                  <Text style={[
                    styles.skillBadgeText,
                    { color: skill.passed ? '#16A34A' : '#D97706' }
                  ]}>
                    {skill.passed ? 'Passed' : 'In Progress'}
                  </Text>
                </View>
              </View>
              <View style={styles.skillProgressBar}>
                <View style={[
                  styles.skillProgressFill,
                  {
                    width: \`\${skill.score || 0}%\`,
                    backgroundColor: skill.passed ? '#16A34A' : '#D97706'
                  }
                ]} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Upcoming Test */}
      {student.upcoming_test && (
        <View style={styles.testCard}>
          <View style={styles.testIcon}>
            <Ionicons name="document-text-outline" size={24} color="#DC2626" />
          </View>
          <View style={styles.testInfo}>
            <Text style={styles.testTitle}>Upcoming Road Test</Text>
            <Text style={styles.testDate}>
              {new Date(student.upcoming_test.date).toLocaleDateString()} at {student.upcoming_test.time}
            </Text>
            {student.upcoming_test.location && (
              <Text style={styles.testLocation}>{student.upcoming_test.location}</Text>
            )}
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
    backgroundColor: '#DBEAFE',
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
  licenseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  licenseText: {
    fontSize: 12,
    color: '#3B82F6',
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
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressCard: {
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
  progressInfo: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
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
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  skillsCard: {
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
  skillItem: {
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  skillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  skillBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  skillProgressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  testCard: {
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
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testInfo: {
    flex: 1,
    marginLeft: 12,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  testDate: {
    fontSize: 14,
    color: '#991B1B',
    marginTop: 4,
  },
  testLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}

export interface DrivingStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDrivingStats(options: DrivingStatsOptions = {}): string {
  const { componentName = 'DrivingStats', endpoint = '/driving/stats' } = options;

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
  style?: object;
}

const ${componentName}: React.FC<${componentName}Props> = ({ style }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['driving-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={[style, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={style}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="people-outline" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{stats?.total_students || 0}</Text>
          <Text style={styles.statLabel}>Active Students</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="car-outline" size={24} color="#16A34A" />
          </View>
          <Text style={styles.statValue}>{stats?.total_instructors || 0}</Text>
          <Text style={styles.statLabel}>Instructors</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="calendar-outline" size={24} color="#D97706" />
          </View>
          <Text style={styles.statValue}>{stats?.lessons_this_month || 0}</Text>
          <Text style={styles.statLabel}>Lessons This Month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="ribbon-outline" size={24} color="#9333EA" />
          </View>
          <Text style={styles.statValue}>{stats?.pass_rate || 0}%</Text>
          <Text style={styles.statLabel}>Test Pass Rate</Text>
        </View>
      </View>

      {/* Additional Stats */}
      <View style={styles.additionalStats}>
        <View style={[styles.gradientCard, { backgroundColor: '#3B82F6' }]}>
          <View style={styles.gradientHeader}>
            <Ionicons name="car-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.gradientLabel}>Vehicles</Text>
          </View>
          <Text style={styles.gradientValue}>{stats?.total_vehicles || 0}</Text>
        </View>
        <View style={[styles.gradientCard, { backgroundColor: '#16A34A' }]}>
          <View style={styles.gradientHeader}>
            <Ionicons name="checkmark-circle-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.gradientLabel}>Tests This Month</Text>
          </View>
          <Text style={styles.gradientValue}>{stats?.tests_this_month || 0}</Text>
        </View>
      </View>
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
});

export default ${componentName};
`;
}
