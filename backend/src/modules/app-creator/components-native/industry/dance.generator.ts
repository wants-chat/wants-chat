/**
 * Dance Studio Component Generators (React Native)
 *
 * Generates React Native components for dance studios
 */

export interface DanceOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generates ClassFiltersDance component
 */
export function generateClassFiltersDance(options: DanceOptions = {}): string {
  const { componentName = 'ClassFiltersDance' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DanceFilters {
  style: string;
  level: string;
  instructor: string;
  dayOfWeek: string;
  timeSlot: string;
}

interface ${componentName}Props {
  onFilter?: (filters: DanceFilters) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilter }) => {
  const [filters, setFilters] = useState<DanceFilters>({
    style: 'all',
    level: 'all',
    instructor: 'all',
    dayOfWeek: 'all',
    timeSlot: 'all',
  });

  const styles_list = ['all', 'ballet', 'hip-hop', 'contemporary', 'jazz', 'tap', 'ballroom'];
  const levels = ['all', 'beginner', 'intermediate', 'advanced', 'professional'];
  const timeSlots = ['all', 'morning', 'afternoon', 'evening'];

  const handleChange = useCallback((key: keyof DanceFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  }, [filters, onFilter]);

  const handleReset = useCallback(() => {
    const reset = { style: 'all', level: 'all', instructor: 'all', dayOfWeek: 'all', timeSlot: 'all' };
    setFilters(reset);
    onFilter?.(reset);
  }, [onFilter]);

  const renderPillSelector = (
    options: string[],
    selected: string,
    onSelect: (value: string) => void,
    formatLabel?: (value: string) => string
  ) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={localStyles.pillContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[localStyles.pill, selected === option && localStyles.pillSelected]}
          onPress={() => onSelect(option)}
          activeOpacity={0.7}
        >
          <Text style={[localStyles.pillText, selected === option && localStyles.pillTextSelected]}>
            {formatLabel ? formatLabel(option) : option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={localStyles.container}>
      <View style={localStyles.header}>
        <Text style={localStyles.title}>Filter Classes</Text>
        <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
          <Text style={localStyles.resetText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <View style={localStyles.filterSection}>
        <Text style={localStyles.filterLabel}>Dance Style</Text>
        {renderPillSelector(styles_list, filters.style, (v) => handleChange('style', v))}
      </View>

      <View style={localStyles.filterSection}>
        <Text style={localStyles.filterLabel}>Level</Text>
        {renderPillSelector(levels, filters.level, (v) => handleChange('level', v))}
      </View>

      <View style={localStyles.filterSection}>
        <Text style={localStyles.filterLabel}>Time of Day</Text>
        {renderPillSelector(timeSlots, filters.timeSlot, (v) => handleChange('timeSlot', v))}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  resetText: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  pillSelected: {
    backgroundColor: '#EC4899',
  },
  pillText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

/**
 * Generates InstructorProfileDance component
 */
export function generateInstructorProfileDance(options: DanceOptions = {}): string {
  const { componentName = 'InstructorProfileDance' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ${componentName}: React.FC = () => {
  const instructor = {
    id: '1',
    name: 'Maria Rodriguez',
    styles: ['Ballet', 'Contemporary', 'Jazz'],
    bio: 'Professional dancer with over 15 years of experience performing and teaching. Former principal dancer with the City Ballet Company.',
    experience: 15,
    achievements: ['City Ballet Principal Dancer (2010-2018)', 'Dance Teacher of the Year 2022', 'Choreographed 20+ productions'],
    upcomingClasses: [
      { name: 'Ballet Fundamentals', time: '10:00 AM', day: 'Mon/Wed/Fri' },
      { name: 'Contemporary Fusion', time: '2:00 PM', day: 'Tue/Thu' },
      { name: 'Jazz Technique', time: '6:00 PM', day: 'Mon/Wed' },
    ],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>💃</Text>
        </View>
        <Text style={styles.name}>{instructor.name}</Text>
        <View style={styles.stylesContainer}>
          {instructor.styles.map((style, index) => (
            <View key={index} style={styles.styleBadge}>
              <Text style={styles.styleBadgeText}>{style}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.bio}>{instructor.bio}</Text>
        <Text style={styles.experience}>{instructor.experience} years of experience</Text>
      </View>

      {/* Achievements */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {instructor.achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>🏆</Text>
            <Text style={styles.achievementText}>{achievement}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Classes */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Upcoming Classes</Text>
        {instructor.upcomingClasses.map((cls, index) => (
          <View key={index} style={styles.classItem}>
            <Text style={styles.className}>{cls.name}</Text>
            <Text style={styles.classSchedule}>{cls.day} at {cls.time}</Text>
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
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  stylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  styleBadge: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  styleBadgeText: {
    fontSize: 13,
    color: '#BE185D',
    fontWeight: '500',
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  experience: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
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
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 16,
  },
  achievementText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  classItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  className: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  classSchedule: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

/**
 * Generates StudentProfileDance component
 */
export function generateStudentProfileDance(options: DanceOptions = {}): string {
  const { componentName = 'StudentProfileDance' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

const ${componentName}: React.FC = () => {
  const student = {
    id: '1',
    name: 'Sophie Anderson',
    email: 'sophie@email.com',
    phone: '555-0123',
    enrolledSince: '2022-09-01',
    styles: ['Ballet', 'Jazz'],
    level: 'Intermediate',
    currentClasses: [
      { name: 'Ballet Level 2', instructor: 'Maria Rodriguez', schedule: 'Mon/Wed 4:00 PM' },
      { name: 'Jazz Technique', instructor: 'James Wilson', schedule: 'Tue/Thu 5:00 PM' },
    ],
    attendance: 92,
    upcomingRecitals: [
      { name: 'Spring Showcase', date: '2024-03-15', role: 'Corps de Ballet' },
      { name: 'Summer Gala', date: '2024-06-20', role: 'Featured Soloist' },
    ],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.contactInfo}>{student.email} • {student.phone}</Text>
            <View style={styles.stylesContainer}>
              {student.styles.map((style, index) => (
                <View key={index} style={styles.styleBadge}>
                  <Text style={styles.styleBadgeText}>{style}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{student.level}</Text>
          </View>
        </View>
        <Text style={styles.enrolledSince}>
          Student since {new Date(student.enrolledSince).toLocaleDateString()}
        </Text>

        {/* Attendance */}
        <View style={styles.attendanceContainer}>
          <Text style={styles.attendanceValue}>{student.attendance}%</Text>
          <Text style={styles.attendanceLabel}>Attendance Rate</Text>
        </View>
      </View>

      {/* Current Classes */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Current Classes</Text>
        {student.currentClasses.map((cls, index) => (
          <View key={index} style={styles.classItem}>
            <Text style={styles.className}>{cls.name}</Text>
            <Text style={styles.classInstructor}>with {cls.instructor}</Text>
            <Text style={styles.classSchedule}>{cls.schedule}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Recitals */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Upcoming Recitals</Text>
        {student.upcomingRecitals.map((recital, index) => (
          <View key={index} style={styles.recitalItem}>
            <Text style={styles.recitalName}>{recital.name}</Text>
            <Text style={styles.recitalDate}>{new Date(recital.date).toLocaleDateString()}</Text>
            <Text style={styles.recitalRole}>Role: {recital.role}</Text>
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
  stylesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  styleBadge: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  styleBadgeText: {
    fontSize: 12,
    color: '#BE185D',
    fontWeight: '500',
  },
  levelBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 13,
    color: '#7E22CE',
    fontWeight: '600',
  },
  enrolledSince: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 12,
  },
  attendanceContainer: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  attendanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
  },
  attendanceLabel: {
    fontSize: 13,
    color: '#047857',
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
    marginBottom: 16,
  },
  classItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  className: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  classInstructor: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  classSchedule: {
    fontSize: 13,
    color: '#EC4899',
    fontWeight: '500',
    marginTop: 4,
  },
  recitalItem: {
    backgroundColor: '#FCE7F3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recitalName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  recitalDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  recitalRole: {
    fontSize: 13,
    color: '#BE185D',
    fontWeight: '500',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}

/**
 * Generates ScheduleCalendarDance component
 */
export function generateScheduleCalendarDance(options: DanceOptions = {}): string {
  const { componentName = 'ScheduleCalendarDance' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface DanceClass {
  id: string;
  name: string;
  style: string;
  instructor: string;
  time: string;
  duration: number;
  room: string;
  level: string;
  enrolled: number;
  capacity: number;
}

const ${componentName}: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const classes: DanceClass[] = [
    { id: '1', name: 'Ballet Beginners', style: 'Ballet', instructor: 'Maria', time: '09:00', duration: 60, room: 'Studio 1', level: 'Beginner', enrolled: 12, capacity: 15 },
    { id: '2', name: 'Hip Hop Crew', style: 'Hip Hop', instructor: 'James', time: '10:30', duration: 75, room: 'Studio 2', level: 'Intermediate', enrolled: 18, capacity: 20 },
    { id: '3', name: 'Contemporary Flow', style: 'Contemporary', instructor: 'Emma', time: '12:00', duration: 60, room: 'Studio 1', level: 'All Levels', enrolled: 10, capacity: 15 },
    { id: '4', name: 'Jazz Technique', style: 'Jazz', instructor: 'Lisa', time: '14:00', duration: 60, room: 'Studio 2', level: 'Intermediate', enrolled: 14, capacity: 15 },
    { id: '5', name: 'Ballet Advanced', style: 'Ballet', instructor: 'Maria', time: '16:00', duration: 90, room: 'Studio 1', level: 'Advanced', enrolled: 8, capacity: 12 },
  ];

  const styleColors: Record<string, { bg: string; border: string }> = {
    'Ballet': { bg: '#FCE7F3', border: '#EC4899' },
    'Hip Hop': { bg: '#F3E8FF', border: '#A855F7' },
    'Contemporary': { bg: '#DBEAFE', border: '#3B82F6' },
    'Jazz': { bg: '#FEF3C7', border: '#F59E0B' },
    'Tap': { bg: '#FFEDD5', border: '#F97316' },
  };

  const renderClassItem = useCallback(({ item }: { item: DanceClass }) => {
    const colorScheme = styleColors[item.style] || { bg: '#F3F4F6', border: '#9CA3AF' };

    return (
      <View style={[styles.classCard, { backgroundColor: colorScheme.bg, borderLeftColor: colorScheme.border }]}>
        <View style={styles.classHeader}>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{item.time}</Text>
            <Text style={styles.durationText}>{item.duration} min</Text>
          </View>
          <View style={styles.classDetails}>
            <Text style={styles.className}>{item.name}</Text>
            <Text style={styles.instructorText}>with {item.instructor} • {item.room}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{item.level}</Text>
            </View>
          </View>
        </View>
        <View style={styles.classFooter}>
          <Text style={styles.enrollmentText}>{item.enrolled}/{item.capacity}</Text>
          <TouchableOpacity style={styles.enrollButton} activeOpacity={0.7}>
            <Text style={styles.enrollButtonText}>Enroll</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daySelector}
      >
        {days.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, selectedDay === index && styles.dayButtonSelected]}
            onPress={() => setSelectedDay(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayButtonText, selectedDay === index && styles.dayButtonTextSelected]}>
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
  },
  daySelector: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  dayButtonSelected: {
    backgroundColor: '#EC4899',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  classCard: {
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  classHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInfo: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  classDetails: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  instructorText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 8,
  },
  levelText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  enrollmentText: {
    fontSize: 14,
    color: '#6B7280',
  },
  enrollButton: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  enrollButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
