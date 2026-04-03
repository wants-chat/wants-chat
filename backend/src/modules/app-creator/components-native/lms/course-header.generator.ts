/**
 * Course Header Generator for React Native App Creator
 *
 * Generates course detail header, curriculum list, and progress tracking:
 * - Course detail header with enroll button
 * - Curriculum sections with lessons
 * - Progress tracking UI
 */

export interface CourseHeaderOptions {
  componentName?: string;
  endpoint?: string;
}

export interface CurriculumListOptions {
  componentName?: string;
  endpoint?: string;
}

export interface ProgressTrackerOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate a course header component for React Native
 */
export function generateCourseHeader(options: CourseHeaderOptions = {}): string {
  const {
    componentName = 'CourseHeader',
    endpoint = '/courses',
  } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ${componentName}Props {
  courseId?: string;
  style?: any;
}

const StarRating: React.FC<{ rating: number; reviewCount?: number }> = ({ rating, reviewCount }) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalf = (rating || 0) % 1 >= 0.5;

  return (
    <View style={styles.ratingContainer}>
      <View style={styles.starsRow}>
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return <Ionicons key={i} name="star" size={14} color="#FBBF24" />;
          }
          if (i === fullStars && hasHalf) {
            return <Ionicons key={i} name="star-half" size={14} color="#FBBF24" />;
          }
          return <Ionicons key={i} name="star-outline" size={14} color="rgba(255,255,255,0.6)" />;
        })}
      </View>
      {reviewCount !== undefined && (
        <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
      )}
    </View>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({ courseId: propCourseId, style }) => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const courseId = propCourseId || route.params?.id;

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + courseId);
      return response?.data || response;
    },
    enabled: !!courseId,
  });

  const enrollMutation = useMutation({
    mutationFn: () => api.post('/enrollments', { course_id: courseId }),
    onSuccess: () => {
      showToast('success', 'Successfully enrolled!');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
    onError: () => showToast('error', 'Failed to enroll'),
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Text style={styles.errorText}>Course not found</Text>
      </View>
    );
  }

  const thumbnailUrl = course.thumbnail_url || course.thumbnail || course.image_url;
  const title = course.title || course.name || 'Untitled Course';
  const description = course.description || course.short_description;
  const instructorName = course.instructor_name || course.instructor?.name;
  const category = course.category;
  const rating = course.rating || course.average_rating;
  const reviewsCount = course.reviews_count;
  const studentsCount = course.students_count || course.enrollments_count;
  const duration = course.duration;
  const lessonsCount = course.lessons_count || course.lessons?.length;
  const price = course.price;
  const isEnrolled = course.is_enrolled;

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#3B82F6', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {thumbnailUrl && (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.backgroundImage}
            resizeMode="cover"
            blurRadius={3}
          />
        )}
        <View style={styles.overlay} />

        <View style={styles.content}>
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}

          <Text style={styles.title}>{title}</Text>

          {description && (
            <Text style={styles.description} numberOfLines={3}>
              {description}
            </Text>
          )}

          <View style={styles.metaContainer}>
            {instructorName && (
              <Text style={styles.instructorText}>
                by <Text style={styles.instructorName}>{instructorName}</Text>
              </Text>
            )}

            {rating !== undefined && (
              <StarRating rating={rating} reviewCount={reviewsCount} />
            )}

            <View style={styles.statsRow}>
              {studentsCount !== undefined && (
                <View style={styles.statItem}>
                  <Ionicons name="people-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.statText}>{studentsCount} students</Text>
                </View>
              )}
              {duration && (
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.statText}>{duration}</Text>
                </View>
              )}
              {lessonsCount !== undefined && (
                <View style={styles.statItem}>
                  <Ionicons name="book-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.statText}>{lessonsCount} lessons</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionContainer}>
            {isEnrolled ? (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => navigation.navigate('CourseLearn' as never, { id: courseId } as never)}
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={20} color="#3B82F6" />
                <Text style={styles.continueButtonText}>Continue Learning</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.enrollButton, enrollMutation.isPending && styles.buttonDisabled]}
                onPress={() => enrollMutation.mutate()}
                disabled={enrollMutation.isPending}
                activeOpacity={0.8}
              >
                {enrollMutation.isPending ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#3B82F6" />
                    <Text style={styles.enrollButtonText}>
                      {price === 0 ? 'Enroll for Free' : \`Enroll - $\${parseFloat(price).toFixed(2)}\`}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  gradient: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaContainer: {
    marginBottom: 20,
  },
  instructorText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  instructorName: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  actionContainer: {
    marginTop: 8,
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ${componentName};
`;
}

/**
 * Generate a curriculum list component for React Native
 */
export function generateCurriculumList(options: CurriculumListOptions = {}): string {
  const {
    componentName = 'CurriculumList',
    endpoint = '/lessons',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  courseId?: string;
  style?: any;
}

interface ModuleData {
  id: string;
  name: string;
  lessons: any[];
}

interface LessonItemProps {
  lesson: any;
  courseId: string;
  onPress: () => void;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, courseId, onPress }) => {
  const isLocked = lesson.is_locked;
  const isCompleted = lesson.is_completed;
  const isVideo = lesson.type === 'video';

  const getIcon = () => {
    if (isCompleted) return { name: 'checkmark-circle', color: '#10B981' };
    if (isLocked) return { name: 'lock-closed', color: '#9CA3AF' };
    if (isVideo) return { name: 'play-circle', color: '#3B82F6' };
    return { name: 'document-text', color: '#6B7280' };
  };

  const icon = getIcon();

  return (
    <TouchableOpacity
      style={[
        styles.lessonItem,
        isLocked && styles.lessonLocked,
      ]}
      onPress={isLocked ? undefined : onPress}
      activeOpacity={isLocked ? 1 : 0.7}
      disabled={isLocked}
    >
      <Ionicons name={icon.name as any} size={20} color={icon.color} />
      <View style={styles.lessonContent}>
        <Text style={[
          styles.lessonTitle,
          isLocked && styles.lessonTitleLocked,
        ]} numberOfLines={2}>
          {lesson.title}
        </Text>
      </View>
      {lesson.duration && (
        <Text style={styles.lessonDuration}>{lesson.duration}</Text>
      )}
    </TouchableOpacity>
  );
};

interface ModuleSectionProps {
  module: ModuleData;
  courseId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onLessonPress: (lesson: any) => void;
}

const ModuleSection: React.FC<ModuleSectionProps> = ({
  module,
  courseId,
  isExpanded,
  onToggle,
  onLessonPress,
}) => {
  return (
    <View style={styles.moduleContainer}>
      <TouchableOpacity
        style={styles.moduleHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.moduleHeaderLeft}>
          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-forward'}
            size={20}
            color="#6B7280"
          />
          <Text style={styles.moduleName}>{module.name}</Text>
        </View>
        <Text style={styles.lessonCount}>{module.lessons.length} lessons</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.lessonsList}>
          {module.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              onPress={() => onLessonPress(lesson)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({ courseId: propCourseId, style }) => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const courseId = propCourseId || route.params?.id;
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const { data: curriculum, isLoading } = useQuery({
    queryKey: ['curriculum', courseId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?course_id=' + courseId);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!courseId,
  });

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  }, []);

  const handleLessonPress = useCallback((lesson: any) => {
    navigation.navigate(
      'LessonPlayer' as never,
      { courseId, lessonId: lesson.id } as never
    );
  }, [navigation, courseId]);

  // Group lessons by module
  const modules: ModuleData[] = React.useMemo(() => {
    if (!curriculum) return [];
    return curriculum.reduce((acc: ModuleData[], lesson: any) => {
      const moduleName = lesson.module_name || 'Course Content';
      let module = acc.find((m) => m.name === moduleName);
      if (!module) {
        module = { id: moduleName, name: moduleName, lessons: [] };
        acc.push(module);
      }
      module.lessons.push(lesson);
      return acc;
    }, []);
  }, [curriculum]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Course Curriculum</Text>
      </View>
      {modules.map((module) => (
        <ModuleSection
          key={module.id}
          module={module}
          courseId={courseId}
          isExpanded={expandedModules.includes(module.id)}
          onToggle={() => toggleModule(module.id)}
          onLessonPress={handleLessonPress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  moduleContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  moduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  lessonCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  lessonsList: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 12,
  },
  lessonLocked: {
    backgroundColor: '#F3F4F6',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    color: '#111827',
  },
  lessonTitleLocked: {
    color: '#9CA3AF',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generate a progress tracker component for React Native
 */
export function generateProgressTracker(options: ProgressTrackerOptions = {}): string {
  const {
    componentName = 'ProgressTracker',
    endpoint = '/enrollments',
  } = options;

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  courseId?: string;
  style?: any;
}

const ${componentName}: React.FC<${componentName}Props> = ({ courseId: propCourseId, style }) => {
  const route = useRoute<any>();
  const courseId = propCourseId || route.params?.id;

  const { data: enrollment, isLoading } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?course_id=' + courseId);
      const data = Array.isArray(response) ? response[0] : (response?.data?.[0] || response);
      return data;
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!enrollment) {
    return null;
  }

  const progress = enrollment.progress || 0;
  const completedLessons = enrollment.completed_lessons || 0;
  const totalLessons = enrollment.total_lessons || 0;
  const timeSpent = enrollment.time_spent || '0h';
  const isCompleted = progress === 100;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Your Progress</Text>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Course Progress</Text>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: \`\${progress}%\` }]} />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>
            {completedLessons}
            <Text style={styles.statTotal}> / {totalLessons}</Text>
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="time-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statLabel}>Time Spent</Text>
          <Text style={styles.statValue}>{timeSpent}</Text>
        </View>
      </View>

      {/* Completion Badge */}
      {isCompleted && (
        <View style={styles.completionBanner}>
          <View style={styles.completionIconContainer}>
            <Ionicons name="trophy" size={32} color="#10B981" />
          </View>
          <View style={styles.completionTextContainer}>
            <Text style={styles.completionTitle}>Congratulations!</Text>
            <Text style={styles.completionSubtitle}>You've completed this course</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statTotal: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  completionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionTextContainer: {
    flex: 1,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  completionSubtitle: {
    fontSize: 14,
    color: '#047857',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}
