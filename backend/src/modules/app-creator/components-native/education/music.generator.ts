/**
 * React Native Music School Component Generators
 *
 * Generates music education-related components for mobile applications.
 * Components: InstructorProfileMusic, InstructorScheduleMusic, LessonCalendarMusic,
 *             StudentProfileMusic, StudentProgressMusic, MusicSchoolStats, SearchResultsMusic
 */

export interface InstructorProfileMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateInstructorProfileMusic(options: InstructorProfileMusicOptions = {}): string {
  const { componentName = 'InstructorProfileMusic', endpoint = '/music/instructors' } = options;

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

  const { data: instructor, isLoading } = useQuery({
    queryKey: ['music-instructor', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  if (!instructor) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Instructor not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          {instructor.avatar_url ? (
            <Image source={{ uri: instructor.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="musical-notes" size={48} color="#9333EA" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{instructor.name}</Text>
            <Text style={styles.title}>{instructor.title || 'Music Instructor'}</Text>

            {instructor.rating && (
              <View style={styles.ratingRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < Math.floor(instructor.rating) ? 'star' : 'star-outline'}
                    size={16}
                    color="#EAB308"
                  />
                ))}
                <Text style={styles.ratingText}>{instructor.rating}</Text>
                {instructor.reviews_count && (
                  <Text style={styles.reviewsText}>({instructor.reviews_count} reviews)</Text>
                )}
              </View>
            )}

            {instructor.instruments && instructor.instruments.length > 0 && (
              <View style={styles.instrumentsRow}>
                {instructor.instruments.map((inst: string, i: number) => (
                  <View key={i} style={styles.instrumentBadge}>
                    <Text style={styles.instrumentText}>{inst}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.quickInfo}>
              {instructor.experience_years && (
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{instructor.experience_years} years exp.</Text>
                </View>
              )}
              {instructor.students_count && (
                <View style={styles.infoItem}>
                  <Ionicons name="people-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{instructor.students_count} students</Text>
                </View>
              )}
              {instructor.offers_online && (
                <View style={styles.infoItem}>
                  <Ionicons name="videocam-outline" size={14} color="#16A34A" />
                  <Text style={[styles.infoText, { color: '#16A34A' }]}>Online available</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.bookSection}>
          <Text style={styles.priceText}>\${instructor.hourly_rate || 50}/hour</Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('BookLesson' as never, { instructorId: instructor.id } as never)}
          >
            <Text style={styles.bookButtonText}>Book Lesson</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bio */}
      {instructor.bio && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{instructor.bio}</Text>
        </View>
      )}

      {/* Teaching Style & Genres */}
      <View style={styles.gridRow}>
        {instructor.teaching_style && (
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Teaching Style</Text>
            <Text style={styles.bioText}>{instructor.teaching_style}</Text>
          </View>
        )}
      </View>

      {instructor.genres && instructor.genres.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Genres</Text>
          <View style={styles.genresRow}>
            {instructor.genres.map((genre: string, i: number) => (
              <View key={i} style={styles.genreBadge}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Qualifications */}
      {instructor.qualifications && instructor.qualifications.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Qualifications</Text>
          {instructor.qualifications.map((qual: any, i: number) => (
            <View key={i} style={styles.qualItem}>
              <View style={styles.qualIcon}>
                <Ionicons name="ribbon-outline" size={20} color="#EAB308" />
              </View>
              <View>
                <Text style={styles.qualTitle}>{qual.title || qual}</Text>
                {qual.institution && <Text style={styles.qualInstitution}>{qual.institution}</Text>}
              </View>
            </View>
          ))}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
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
  title: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 6,
  },
  reviewsText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  instrumentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  instrumentBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  instrumentText: {
    fontSize: 12,
    color: '#9333EA',
    fontWeight: '500',
  },
  quickInfo: {
    marginTop: 12,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  bookSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  bookButton: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  genreText: {
    fontSize: 14,
    color: '#374151',
  },
  qualItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  qualIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  qualTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  qualInstitution: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}

export interface InstructorScheduleMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateInstructorScheduleMusic(options: InstructorScheduleMusicOptions = {}): string {
  const { componentName = 'InstructorScheduleMusic', endpoint = '/music/instructors' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  instructorId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ instructorId: propId }) => {
  const route = useRoute();
  const { id } = route.params as { id?: string };
  const instructorId = propId || id;
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['music-instructor-schedule', instructorId, currentWeek.toISOString()],
    queryFn: async () => {
      const weekStart = getWeekDates()[0].toISOString().split('T')[0];
      const weekEnd = getWeekDates()[6].toISOString().split('T')[0];
      const response = await api.get<any>(\`${endpoint}/\${instructorId}/schedule?start=\${weekStart}&end=\${weekEnd}\`);
      return response?.data || response;
    },
  });

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const weekDates = getWeekDates();
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];

  const getLessonForSlot = (date: Date, time: string) => {
    if (!schedule?.lessons) return null;
    const dateStr = date.toISOString().split('T')[0];
    return schedule.lessons.find((l: any) => l.date === dateStr && l.time === time);
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="musical-notes" size={20} color="#9333EA" />
          <Text style={styles.title}>Lesson Schedule</Text>
        </View>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => navigateWeek(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.weekText}>
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateWeek(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Day Headers */}
          <View style={styles.dayHeaderRow}>
            <View style={styles.timeColumn} />
            {weekDates.map((date, i) => (
              <View key={i} style={[styles.dayHeader, isToday(date) && styles.todayHeader]}>
                <Text style={styles.dayName}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                <Text style={[styles.dayNumber, isToday(date) && styles.todayNumber]}>{date.getDate()}</Text>
              </View>
            ))}
          </View>

          {/* Time Slots */}
          <ScrollView>
            {timeSlots.map((time) => (
              <View key={time} style={styles.timeRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{time}</Text>
                </View>
                {weekDates.map((date, i) => {
                  const lesson = getLessonForSlot(date, time);
                  return (
                    <View key={i} style={[styles.slotCell, isToday(date) && styles.todayCell]}>
                      {lesson ? (
                        <View style={styles.lessonCard}>
                          <View style={styles.lessonRow}>
                            <Ionicons name="person-outline" size={12} color="#9333EA" />
                            <Text style={styles.lessonStudent} numberOfLines={1}>{lesson.student_name}</Text>
                          </View>
                          <Text style={styles.lessonInstrument}>{lesson.instrument}</Text>
                          <Text style={styles.lessonDuration}>{lesson.duration || 60} min</Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
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
  weekText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    minWidth: 140,
    textAlign: 'center',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeColumn: {
    width: 70,
    padding: 8,
    justifyContent: 'center',
  },
  dayHeader: {
    width: 100,
    padding: 12,
    alignItems: 'center',
  },
  todayHeader: {
    backgroundColor: '#F3E8FF',
  },
  dayName: {
    fontSize: 12,
    color: '#6B7280',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  todayNumber: {
    color: '#9333EA',
  },
  timeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  slotCell: {
    width: 100,
    minHeight: 60,
    padding: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  todayCell: {
    backgroundColor: '#FAF5FF',
  },
  lessonCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 6,
    padding: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#9333EA',
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonStudent: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9333EA',
    flex: 1,
  },
  lessonInstrument: {
    fontSize: 10,
    color: '#7C3AED',
    marginTop: 2,
  },
  lessonDuration: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}

export interface LessonCalendarMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLessonCalendarMusic(options: LessonCalendarMusicOptions = {}): string {
  const { componentName = 'LessonCalendarMusic', endpoint = '/music/lessons' } = options;

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
    queryKey: ['music-lessons-calendar', currentMonth.getMonth(), currentMonth.getFullYear(), studentId, instructorId],
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="musical-notes" size={20} color="#9333EA" />
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
                  {dayLessons.slice(0, 2).map((lesson: any, i: number) => (
                    <TouchableOpacity
                      key={lesson.id || i}
                      onPress={() => setSelectedLesson(lesson)}
                      style={styles.lessonDot}
                    >
                      <Text style={styles.lessonDotText} numberOfLines={1}>
                        {lesson.time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {dayLessons.length > 2 && (
                    <Text style={styles.moreText}>+{dayLessons.length - 2}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Lesson Detail Modal */}
      <Modal visible={!!selectedLesson} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSelectedLesson(null)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="musical-notes" size={20} color="#9333EA" />
              <Text style={styles.modalTitle}>{selectedLesson?.instrument} Lesson</Text>
            </View>
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
              {selectedLesson?.notes && (
                <Text style={styles.notesText}>{selectedLesson.notes}</Text>
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
    color: '#9333EA',
    fontWeight: '700',
  },
  lessonList: {
    gap: 2,
  },
  lessonDot: {
    backgroundColor: '#F3E8FF',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  lessonDotText: {
    fontSize: 9,
    color: '#9333EA',
  },
  moreText: {
    fontSize: 9,
    color: '#9333EA',
    textAlign: 'center',
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closeButton: {
    marginTop: 24,
    backgroundColor: '#9333EA',
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

export interface StudentProfileMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProfileMusic(options: StudentProfileMusicOptions = {}): string {
  const { componentName = 'StudentProfileMusic', endpoint = '/music/students' } = options;

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
    queryKey: ['music-student', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
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
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          {student.avatar_url ? (
            <Image source={{ uri: student.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={32} color="#9333EA" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.level}>{student.level || 'Beginner'} Level</Text>
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
          onPress={() => navigation.navigate('ScheduleLesson' as never, { studentId: student.id } as never)}
        >
          <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
          <Text style={styles.scheduleButtonText}>Schedule Lesson</Text>
        </TouchableOpacity>
      </View>

      {/* Instruments */}
      {student.instruments && student.instruments.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Instruments</Text>
          <View style={styles.instrumentsRow}>
            {student.instruments.map((inst: any, i: number) => (
              <View key={i} style={styles.instrumentCard}>
                <Ionicons name="musical-notes" size={20} color="#9333EA" />
                <Text style={styles.instrumentName}>{inst.name || inst}</Text>
                {inst.level && <Text style={styles.instrumentLevel}>{inst.level}</Text>}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="calendar-outline" size={20} color="#9333EA" />
          </View>
          <Text style={styles.statValue}>{student.total_lessons || 0}</Text>
          <Text style={styles.statLabel}>Total Lessons</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="time-outline" size={20} color="#16A34A" />
          </View>
          <Text style={styles.statValue}>{student.practice_hours || 0}h</Text>
          <Text style={styles.statLabel}>Practice Hours</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="ribbon-outline" size={20} color="#D97706" />
          </View>
          <Text style={styles.statValue}>{student.pieces_learned || 0}</Text>
          <Text style={styles.statLabel}>Pieces Learned</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="trending-up-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{student.skill_level || 1}</Text>
          <Text style={styles.statLabel}>Skill Level</Text>
        </View>
      </View>

      {/* Current Pieces */}
      {student.current_pieces && student.current_pieces.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Currently Learning</Text>
          {student.current_pieces.map((piece: any, i: number) => (
            <View key={i} style={styles.pieceItem}>
              <View style={styles.pieceInfo}>
                <Text style={styles.pieceTitle}>{piece.title}</Text>
                <Text style={styles.pieceComposer}>{piece.composer}</Text>
              </View>
              <View style={styles.pieceProgress}>
                <Text style={styles.pieceProgressText}>{piece.progress || 0}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: \`\${piece.progress || 0}%\` }]} />
                </View>
              </View>
            </View>
          ))}
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
    backgroundColor: '#F3E8FF',
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
  level: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
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
    backgroundColor: '#9333EA',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  instrumentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  instrumentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  instrumentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  instrumentLevel: {
    fontSize: 12,
    color: '#6B7280',
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
  pieceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pieceInfo: {
    flex: 1,
  },
  pieceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  pieceComposer: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  pieceProgress: {
    alignItems: 'flex-end',
    width: 80,
  },
  pieceProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9333EA',
    marginBottom: 4,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9333EA',
    borderRadius: 3,
  },
});

export default ${componentName};
`;
}

export interface StudentProgressMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProgressMusic(options: StudentProgressMusicOptions = {}): string {
  const { componentName = 'StudentProgressMusic', endpoint = '/music/students' } = options;

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

interface ${componentName}Props {
  studentId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ studentId: propId }) => {
  const route = useRoute();
  const { id } = route.params as { id?: string };
  const studentId = propId || id;

  const { data: progress, isLoading } = useQuery({
    queryKey: ['music-student-progress', studentId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${studentId}/progress\`);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Skill Progress */}
      {progress?.skills && progress.skills.length > 0 && (
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Ionicons name="trending-up-outline" size={20} color="#9333EA" />
            <Text style={styles.sectionTitle}>Skill Development</Text>
          </View>
          {progress.skills.map((skill: any, i: number) => (
            <View key={i} style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillLevel}>{skill.level}/10</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: \`\${(skill.level / 10) * 100}%\` }]} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Achievements */}
      {progress?.achievements && progress.achievements.length > 0 && (
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Ionicons name="ribbon-outline" size={20} color="#EAB308" />
            <Text style={styles.sectionTitle}>Achievements</Text>
          </View>
          <View style={styles.achievementsGrid}>
            {progress.achievements.map((achievement: any, i: number) => (
              <View key={i} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="ribbon" size={20} color="#EAB308" />
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDate}>
                  {new Date(achievement.earned_date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Goals */}
      {progress?.goals && progress.goals.length > 0 && (
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Ionicons name="flag-outline" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Learning Goals</Text>
          </View>
          {progress.goals.map((goal: any, i: number) => (
            <View key={i} style={styles.goalItem}>
              <View style={[styles.goalIcon, goal.completed && styles.goalIconCompleted]}>
                {goal.completed ? (
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                ) : (
                  <Ionicons name="flag-outline" size={20} color="#9CA3AF" />
                )}
              </View>
              <View style={styles.goalInfo}>
                <Text style={[styles.goalTitle, goal.completed && styles.goalCompleted]}>
                  {goal.title}
                </Text>
                {!goal.completed && goal.target_date && (
                  <Text style={styles.goalDeadline}>
                    Target: {new Date(goal.target_date).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Practice Log */}
      {progress?.practice_log && progress.practice_log.length > 0 && (
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Ionicons name="time-outline" size={20} color="#16A34A" />
            <Text style={styles.sectionTitle}>Recent Practice</Text>
          </View>
          {progress.practice_log.slice(0, 5).map((log: any, i: number) => (
            <View key={i} style={styles.logItem}>
              <View style={styles.logInfo}>
                <Text style={styles.logTitle}>{log.piece || log.activity}</Text>
                <Text style={styles.logDate}>{new Date(log.date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.logDuration}>{log.duration} min</Text>
            </View>
          ))}
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
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleRow: {
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
  skillItem: {
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  skillLevel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9333EA',
    borderRadius: 4,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  achievementDate: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalIconCompleted: {
    backgroundColor: '#DCFCE7',
  },
  goalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  goalCompleted: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  goalDeadline: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logInfo: {
    flex: 1,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  logDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  logDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9333EA',
  },
});

export default ${componentName};
`;
}

export interface MusicSchoolStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMusicSchoolStats(options: MusicSchoolStatsOptions = {}): string {
  const { componentName = 'MusicSchoolStats', endpoint = '/music/stats' } = options;

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
    queryKey: ['music-school-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={[style, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#9333EA" />
      </View>
    );
  }

  return (
    <View style={style}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="people-outline" size={24} color="#9333EA" />
          </View>
          <Text style={styles.statValue}>{stats?.total_students || 0}</Text>
          <Text style={styles.statLabel}>Active Students</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="musical-notes-outline" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{stats?.total_instructors || 0}</Text>
          <Text style={styles.statLabel}>Instructors</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="calendar-outline" size={24} color="#16A34A" />
          </View>
          <Text style={styles.statValue}>{stats?.lessons_this_month || 0}</Text>
          <Text style={styles.statLabel}>Lessons This Month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="ribbon-outline" size={24} color="#D97706" />
          </View>
          <Text style={styles.statValue}>{stats?.instruments_offered || 0}</Text>
          <Text style={styles.statLabel}>Instruments</Text>
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
});

export default ${componentName};
`;
}

export interface SearchResultsMusicOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSearchResultsMusic(options: SearchResultsMusicOptions = {}): string {
  const { componentName = 'SearchResultsMusic', endpoint = '/music/search' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  query: string;
  instrument?: string;
  priceRange?: string;
  availability?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ query, instrument, priceRange, availability }) => {
  const navigation = useNavigation();

  const { data, isLoading } = useQuery({
    queryKey: ['music-search', query, instrument, priceRange, availability],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (instrument) params.append('instrument', instrument);
      if (priceRange) params.append('price_range', priceRange);
      if (availability) params.append('availability', availability);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return response?.data || response;
    },
    enabled: !!query || !!instrument,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  const instructors = data?.instructors || data || [];

  if (instructors.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="musical-notes-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No instructors found matching your criteria</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.resultCount}>{instructors.length} instructor(s) found</Text>

      <FlatList
        data={instructors}
        keyExtractor={(item) => item.id}
        renderItem={({ item: instructor }) => (
          <TouchableOpacity
            style={styles.instructorCard}
            onPress={() => navigation.navigate('InstructorDetail' as never, { id: instructor.id } as never)}
          >
            <View style={styles.cardRow}>
              {instructor.avatar_url ? (
                <Image source={{ uri: instructor.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="musical-notes" size={24} color="#9333EA" />
                </View>
              )}
              <View style={styles.cardInfo}>
                <Text style={styles.instructorName}>{instructor.name}</Text>
                {instructor.rating && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#EAB308" />
                    <Text style={styles.ratingText}>{instructor.rating}</Text>
                    {instructor.reviews_count && (
                      <Text style={styles.reviewsText}>({instructor.reviews_count})</Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            {instructor.instruments && (
              <View style={styles.instrumentsRow}>
                {instructor.instruments.slice(0, 3).map((inst: string, i: number) => (
                  <View key={i} style={styles.instrumentBadge}>
                    <Text style={styles.instrumentText}>{inst}</Text>
                  </View>
                ))}
                {instructor.instruments.length > 3 && (
                  <Text style={styles.moreText}>+{instructor.instruments.length - 3}</Text>
                )}
              </View>
            )}

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="cash-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>\${instructor.hourly_rate || 50}/hr</Text>
              </View>
              {instructor.experience_years && (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{instructor.experience_years} yrs</Text>
                </View>
              )}
              {instructor.offers_online && (
                <View style={styles.metaItem}>
                  <Ionicons name="videocam-outline" size={14} color="#16A34A" />
                  <Text style={[styles.metaText, { color: '#16A34A' }]}>Online</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
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
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  resultCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  listContent: {
    gap: 12,
  },
  instructorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  reviewsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  instrumentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  instrumentBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  instrumentText: {
    fontSize: 12,
    color: '#9333EA',
  },
  moreText: {
    fontSize: 12,
    color: '#6B7280',
    alignSelf: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
