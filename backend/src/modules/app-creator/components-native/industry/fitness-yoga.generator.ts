/**
 * Fitness & Yoga Component Generators (React Native)
 *
 * Generates React Native components for yoga studios, dance studios,
 * and fitness centers.
 */

export interface FitnessYogaOptions {
  title?: string;
  componentName?: string;
  endpoint?: string;
}

/**
 * Generates ClassCalendarYoga component for React Native
 */
export function generateClassCalendarYoga(options: FitnessYogaOptions = {}): string {
  const { componentName = 'ClassCalendarYoga', endpoint = '/yoga-classes' } = options;

  return `import React, { useState, useCallback } from 'react';
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

interface YogaClass {
  id: string;
  name: string;
  instructor: string;
  time: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  spotsAvailable: number;
  maxSpots: number;
  room: string;
}

const ${componentName}: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: classes, isLoading } = useQuery({
    queryKey: ['yoga-classes', selectedDate],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?date=' + selectedDate);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const levelColors: Record<string, { bg: string; text: string }> = {
    'beginner': { bg: '#DCFCE7', text: '#166534' },
    'intermediate': { bg: '#DBEAFE', text: '#1E40AF' },
    'advanced': { bg: '#F3E8FF', text: '#7E22CE' },
    'all-levels': { bg: '#F3F4F6', text: '#374151' },
  };

  const renderClassItem = useCallback(({ item }: { item: YogaClass }) => {
    const levelStyle = levelColors[item.level] || levelColors['all-levels'];
    const isFull = item.spotsAvailable === 0;

    return (
      <View style={styles.classCard}>
        <View style={styles.classHeader}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{item.time}</Text>
            <Text style={styles.durationText}>{item.duration} min</Text>
          </View>
          <View style={styles.classInfo}>
            <Text style={styles.className}>{item.name}</Text>
            <Text style={styles.instructorName}>with {item.instructor}</Text>
            <View style={styles.metaContainer}>
              <View style={[styles.levelBadge, { backgroundColor: levelStyle.bg }]}>
                <Text style={[styles.levelText, { color: levelStyle.text }]}>
                  {item.level.replace('-', ' ')}
                </Text>
              </View>
              <Text style={styles.roomText}>{item.room}</Text>
            </View>
          </View>
        </View>
        <View style={styles.classFooter}>
          <Text style={[styles.spotsText, isFull && styles.spotsTextFull]}>
            {isFull ? 'Full' : \`\${item.spotsAvailable} spots left\`}
          </Text>
          <TouchableOpacity
            style={[styles.bookButton, isFull && styles.bookButtonDisabled]}
            disabled={isFull}
            activeOpacity={0.7}
          >
            <Text style={[styles.bookButtonText, isFull && styles.bookButtonTextDisabled]}>
              {isFull ? 'Join Waitlist' : 'Book Class'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, []);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="fitness-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No classes scheduled for this date</Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: YogaClass) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Class Schedule</Text>
        <TouchableOpacity style={styles.datePickerButton} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={18} color="#6B7280" />
          <Text style={styles.dateText}>{selectedDate}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={classes}
        renderItem={renderClassItem}
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
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 14,
    color: '#374151',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  instructorName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  roomText: {
    fontSize: 12,
    color: '#6B7280',
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  spotsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  spotsTextFull: {
    color: '#DC2626',
  },
  bookButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bookButtonTextDisabled: {
    color: '#6B7280',
  },
  emptyContainer: {
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
 * Generates ClassListTodayYoga component for React Native
 */
export function generateClassListTodayYoga(options: FitnessYogaOptions = {}): string {
  const { componentName = 'ClassListTodayYoga', endpoint = '/yoga-classes/today' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface TodayClass {
  id: string;
  time: string;
  name: string;
  instructor: string;
  enrolled: number;
  capacity: number;
  status: 'upcoming' | 'in-progress' | 'completed';
}

const ${componentName}: React.FC = () => {
  const { data: classes, isLoading } = useQuery({
    queryKey: ['yoga-classes-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
    'upcoming': { bg: '#EFF6FF', text: '#1E40AF', dot: '#3B82F6' },
    'in-progress': { bg: '#ECFDF5', text: '#166534', dot: '#10B981' },
    'completed': { bg: '#F9FAFB', text: '#6B7280', dot: '#9CA3AF' },
  };

  const renderClassItem = useCallback(({ item }: { item: TodayClass }) => {
    const style = statusStyles[item.status] || statusStyles['upcoming'];
    const progress = (item.enrolled / item.capacity) * 100;

    return (
      <View style={[styles.classItem, { backgroundColor: style.bg }]}>
        <View style={styles.classContent}>
          <View style={[styles.statusDot, { backgroundColor: style.dot }]} />
          <View style={styles.classInfo}>
            <Text style={styles.classTime}>{item.time} - {item.name}</Text>
            <Text style={styles.instructorText}>Instructor: {item.instructor}</Text>
          </View>
        </View>
        <View style={styles.enrollmentContainer}>
          <Text style={[styles.enrollmentText, { color: style.text }]}>
            {item.enrolled}/{item.capacity} enrolled
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
          </View>
        </View>
      </View>
    );
  }, []);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No classes scheduled for today</Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: TodayClass) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Classes</Text>
      </View>
      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />
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
    overflow: 'hidden',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  classItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  classContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  classInfo: {
    flex: 1,
  },
  classTime: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  instructorText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  enrollmentContainer: {
    marginTop: 12,
    paddingLeft: 20,
  },
  enrollmentText: {
    fontSize: 13,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  emptyContainer: {
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
 * Generates InstructorProfileYoga component for React Native
 */
export function generateInstructorProfileYoga(options: FitnessYogaOptions = {}): string {
  const { componentName = 'InstructorProfileYoga', endpoint = '/yoga-instructors' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface InstructorProfileYogaProps {
  instructorId?: string;
}

const ${componentName}: React.FC<InstructorProfileYogaProps> = ({ instructorId }) => {
  const { data: instructor, isLoading } = useQuery({
    queryKey: ['yoga-instructor', instructorId],
    queryFn: async () => {
      if (instructorId) {
        const response = await api.get<any>('${endpoint}/' + instructorId);
        return response?.data || response;
      }
      return {
        id: '1',
        name: 'Sarah Johnson',
        avatar: null,
        bio: 'Certified yoga instructor with a passion for helping students find balance and inner peace.',
        specialties: ['Vinyasa Flow', 'Restorative Yoga', 'Prenatal Yoga', 'Meditation'],
        certifications: ['RYT-500', 'Prenatal Yoga Certified', 'Meditation Teacher Training'],
        yearsExperience: 8,
        rating: 4.9,
        reviewCount: 127,
        upcomingClasses: [
          { name: 'Morning Flow', day: 'Mon/Wed/Fri', time: '6:00 AM' },
          { name: 'Restorative', day: 'Tue/Thu', time: '5:00 PM' },
        ],
      };
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          {instructor?.avatar ? (
            <Image source={{ uri: instructor.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarEmoji}>🧘‍♀️</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{instructor?.name}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.statValue}>{instructor?.rating}</Text>
                <Text style={styles.statLabel}>({instructor?.reviewCount} reviews)</Text>
              </View>
              <Text style={styles.statDivider}>•</Text>
              <Text style={styles.experienceText}>{instructor?.yearsExperience} years experience</Text>
            </View>
            <Text style={styles.bio}>{instructor?.bio}</Text>
          </View>
        </View>
      </View>

      {/* Specialties */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.tagsContainer}>
          {instructor?.specialties.map((specialty: string, index: number) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Certifications */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        {instructor?.certifications.map((cert: string, index: number) => (
          <View key={index} style={styles.certItem}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.certText}>{cert}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Classes */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Upcoming Classes</Text>
        <View style={styles.classesGrid}>
          {instructor?.upcomingClasses.map((cls: any, index: number) => (
            <View key={index} style={styles.classItem}>
              <Text style={styles.classItemName}>{cls.name}</Text>
              <Text style={styles.classItemDay}>{cls.day}</Text>
              <Text style={styles.classItemTime}>{cls.time}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
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
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statDivider: {
    color: '#9CA3AF',
  },
  experienceText: {
    fontSize: 13,
    color: '#6B7280',
  },
  bio: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 12,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 13,
    color: '#7E22CE',
    fontWeight: '500',
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  certText: {
    fontSize: 14,
    color: '#374151',
  },
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  classItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: '45%',
  },
  classItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  classItemDay: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  classItemTime: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}

/**
 * Generates InstructorScheduleYoga component
 */
export function generateInstructorScheduleYoga(options: FitnessYogaOptions = {}): string {
  const { componentName = 'InstructorScheduleYoga' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ScheduleSlot {
  id: string;
  day: string;
  time: string;
  className: string;
  room: string;
  enrolled: number;
  capacity: number;
}

const ${componentName}: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);

  const schedule: ScheduleSlot[] = [
    { id: '1', day: 'Monday', time: '06:00 AM', className: 'Morning Flow', room: 'Studio A', enrolled: 18, capacity: 20 },
    { id: '2', day: 'Monday', time: '05:00 PM', className: 'Restorative', room: 'Studio B', enrolled: 12, capacity: 15 },
    { id: '3', day: 'Wednesday', time: '06:00 AM', className: 'Morning Flow', room: 'Studio A', enrolled: 20, capacity: 20 },
    { id: '4', day: 'Wednesday', time: '07:00 PM', className: 'Evening Vinyasa', room: 'Studio A', enrolled: 15, capacity: 20 },
    { id: '5', day: 'Friday', time: '06:00 AM', className: 'Morning Flow', room: 'Studio A', enrolled: 16, capacity: 20 },
    { id: '6', day: 'Saturday', time: '09:00 AM', className: 'Weekend Workshop', room: 'Studio B', enrolled: 10, capacity: 12 },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getClassesForDay = useCallback((day: string) => {
    return schedule.filter(s => s.day === day);
  }, [schedule]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Schedule</Text>
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setSelectedWeek(w => w - 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.currentWeekButton}
            onPress={() => setSelectedWeek(0)}
            activeOpacity={0.7}
          >
            <Text style={styles.currentWeekText}>This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setSelectedWeek(w => w + 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleScroll}>
        <View style={styles.scheduleGrid}>
          {days.map(day => {
            const dayClasses = getClassesForDay(day);
            return (
              <View key={day} style={styles.dayColumn}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayHeaderText}>{day.slice(0, 3)}</Text>
                </View>
                <View style={styles.dayContent}>
                  {dayClasses.length > 0 ? (
                    dayClasses.map(slot => (
                      <View key={slot.id} style={styles.slotCard}>
                        <Text style={styles.slotTime}>{slot.time}</Text>
                        <Text style={styles.slotClass}>{slot.className}</Text>
                        <Text style={styles.slotEnrollment}>{slot.enrolled}/{slot.capacity}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noClassesText}>No classes</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  currentWeekButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  currentWeekText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleScroll: {
    flex: 1,
  },
  scheduleGrid: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  dayColumn: {
    width: 120,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  dayHeader: {
    backgroundColor: '#F3E8FF',
    padding: 8,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7E22CE',
  },
  dayContent: {
    padding: 8,
    minHeight: 200,
  },
  slotCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  slotTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  slotClass: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  slotEnrollment: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
    marginTop: 4,
  },
  noClassesText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default ${componentName};
`;
}

/**
 * Generates MemberProfileYoga component
 */
export function generateMemberProfileYoga(options: FitnessYogaOptions = {}): string {
  const { componentName = 'MemberProfileYoga' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

const ${componentName}: React.FC = () => {
  const { data: member } = useQuery({
    queryKey: ['yoga-member-profile'],
    queryFn: async () => ({
      id: '1',
      name: 'Emily Chen',
      email: 'emily@email.com',
      phone: '555-0123',
      memberSince: '2023-03-15',
      membershipType: 'annual',
      renewalDate: '2025-03-15',
      totalClasses: 87,
      favoriteClasses: ['Morning Flow', 'Restorative', 'Hot Yoga'],
      recentClasses: [
        { name: 'Morning Flow', date: '2024-01-18', instructor: 'Sarah' },
        { name: 'Hot Yoga', date: '2024-01-17', instructor: 'Alex' },
        { name: 'Restorative', date: '2024-01-15', instructor: 'Emma' },
      ],
    }),
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View>
            <Text style={styles.name}>{member?.name}</Text>
            <Text style={styles.contactInfo}>{member?.email} • {member?.phone}</Text>
            <Text style={styles.memberSince}>
              Member since {new Date(member?.memberSince || '').toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.membershipBadge}>
            <Text style={styles.membershipType}>{member?.membershipType}</Text>
          </View>
        </View>
        <Text style={styles.renewalDate}>
          Renews {new Date(member?.renewalDate || '').toLocaleDateString()}
        </Text>

        {/* Total Classes */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsValue}>{member?.totalClasses}</Text>
          <Text style={styles.statsLabel}>Total Classes Attended</Text>
        </View>
      </View>

      {/* Favorite Classes */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Favorite Classes</Text>
        <View style={styles.tagsContainer}>
          {member?.favoriteClasses.map((cls, index) => (
            <View key={index} style={styles.classTag}>
              <Text style={styles.classTagText}>{cls}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Classes */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Classes</Text>
        {member?.recentClasses.map((cls, index) => (
          <View key={index} style={styles.recentClassItem}>
            <Text style={styles.recentClassName}>{cls.name} with {cls.instructor}</Text>
            <Text style={styles.recentClassDate}>
              {new Date(cls.date).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  contactInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  memberSince: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  membershipBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  membershipType: {
    fontSize: 13,
    color: '#7E22CE',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  renewalDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },
  statsContainer: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  statsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#7E22CE',
  },
  statsLabel: {
    fontSize: 14,
    color: '#8B5CF6',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  classTagText: {
    fontSize: 13,
    color: '#7E22CE',
    fontWeight: '500',
  },
  recentClassItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recentClassName: {
    fontSize: 14,
    color: '#374151',
  },
  recentClassDate: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generates PublicScheduleYoga component
 */
export function generatePublicScheduleYoga(options: FitnessYogaOptions = {}): string {
  const { componentName = 'PublicScheduleYoga' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PublicClass {
  id: string;
  name: string;
  instructor: string;
  time: string;
  duration: number;
  level: string;
  spotsAvailable: number;
  description: string;
}

const ${componentName}: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const classes: PublicClass[] = [
    { id: '1', name: 'Sunrise Flow', instructor: 'Sarah', time: '6:00 AM', duration: 60, level: 'All Levels', spotsAvailable: 8, description: 'Start your day with an energizing flow sequence.' },
    { id: '2', name: 'Power Vinyasa', instructor: 'Mike', time: '8:00 AM', duration: 75, level: 'Intermediate', spotsAvailable: 3, description: 'Build strength and flexibility with dynamic sequences.' },
    { id: '3', name: 'Gentle Yoga', instructor: 'Emma', time: '10:00 AM', duration: 60, level: 'Beginner', spotsAvailable: 12, description: 'Perfect for beginners or those seeking a gentle practice.' },
    { id: '4', name: 'Hot Yoga', instructor: 'Alex', time: '12:00 PM', duration: 90, level: 'Advanced', spotsAvailable: 0, description: 'Challenge yourself in our heated studio.' },
  ];

  const renderClassItem = useCallback(({ item }: { item: PublicClass }) => {
    const isFull = item.spotsAvailable === 0;

    return (
      <View style={styles.classCard}>
        <View style={styles.classHeader}>
          <View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{item.time}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.durationText}>{item.duration} min</Text>
            </View>
            <Text style={styles.className}>{item.name}</Text>
            <Text style={styles.instructorName}>with {item.instructor}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{item.level}</Text>
            </View>
          </View>
          <View style={styles.bookingContainer}>
            <Text style={[styles.spotsText, isFull && styles.spotsTextFull]}>
              {isFull ? 'Class Full' : \`\${item.spotsAvailable} spots available\`}
            </Text>
            <TouchableOpacity
              style={[styles.bookButton, isFull && styles.bookButtonDisabled]}
              activeOpacity={0.7}
            >
              <Text style={[styles.bookButtonText, isFull && styles.bookButtonTextDisabled]}>
                {isFull ? 'Join Waitlist' : 'Book Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Class Schedule</Text>
        <Text style={styles.subtitle}>Find the perfect class for your practice</Text>
      </View>

      {/* Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daySelector}
      >
        {days.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === index && styles.dayButtonSelected,
            ]}
            onPress={() => setSelectedDay(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDay === index && styles.dayButtonTextSelected,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Classes List */}
      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  dayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#8B5CF6',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 24,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  separator: {
    color: '#9CA3AF',
  },
  durationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  instructorName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
    lineHeight: 18,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  levelText: {
    fontSize: 13,
    color: '#7E22CE',
    fontWeight: '500',
  },
  bookingContainer: {
    alignItems: 'flex-end',
  },
  spotsText: {
    fontSize: 13,
    color: '#10B981',
    marginBottom: 8,
  },
  spotsTextFull: {
    color: '#DC2626',
  },
  bookButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bookButtonTextDisabled: {
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generates DanceStudioStatsView component
 */
export function generateDanceStudioStatsView(options: FitnessYogaOptions = {}): string {
  const { componentName = 'DanceStudioStats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ${componentName}: React.FC = () => {
  const stats = {
    totalStudents: 245,
    activeClasses: 18,
    monthlyRevenue: 28500,
    classesToday: 8,
    retention: 94,
    popularStyles: [
      { name: 'Ballet', students: 68 },
      { name: 'Hip Hop', students: 54 },
      { name: 'Contemporary', students: 42 },
      { name: 'Jazz', students: 38 },
    ],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Studio Overview</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{stats.activeClasses}</Text>
          <Text style={styles.statLabel}>Active Classes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>\${stats.monthlyRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Monthly Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>{stats.retention}%</Text>
          <Text style={styles.statLabel}>Retention Rate</Text>
        </View>
      </View>

      {/* Today's Schedule */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <View style={styles.todayStats}>
          <Text style={styles.todayValue}>{stats.classesToday}</Text>
          <Text style={styles.todayLabel}>Classes Today</Text>
        </View>
      </View>

      {/* Popular Dance Styles */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Popular Dance Styles</Text>
        {stats.popularStyles.map((style, index) => (
          <View key={index} style={styles.styleRow}>
            <Text style={styles.styleName}>{style.name}</Text>
            <View style={styles.styleBarContainer}>
              <View
                style={[
                  styles.styleBar,
                  { width: \`\${(style.students / stats.totalStudents) * 100}%\` },
                ]}
              />
            </View>
            <Text style={styles.styleCount}>{style.students}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EC4899',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  todayStats: {
    alignItems: 'center',
  },
  todayValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#EC4899',
  },
  todayLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  styleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  styleName: {
    width: 100,
    fontSize: 14,
    color: '#374151',
  },
  styleBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  styleBar: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 4,
  },
  styleCount: {
    width: 40,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
});

export default ${componentName};
`;
}

// Additional dance-related generators
export { generateClassFiltersDance } from './dance.generator';
export { generateInstructorProfileDance } from './dance.generator';
export { generateStudentProfileDance } from './dance.generator';
export { generateScheduleCalendarDance } from './dance.generator';
