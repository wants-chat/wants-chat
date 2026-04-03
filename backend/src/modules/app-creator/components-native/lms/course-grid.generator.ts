/**
 * Course Grid Generator for React Native App Creator
 *
 * Generates course listing components with:
 * - FlatList with numColumns=2 for course cards
 * - Course cards with thumbnail, title, instructor, progress
 * - Filter chips for categories
 * - Enrolled courses with progress bars
 */

export interface CourseGridOptions {
  componentName?: string;
  endpoint?: string;
  columns?: 2 | 3;
  showRatings?: boolean;
  showPrice?: boolean;
}

export interface CourseFiltersOptions {
  componentName?: string;
  categories?: string[];
}

export interface EnrolledCoursesOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate a course grid component for React Native
 */
export function generateCourseGrid(options: CourseGridOptions = {}): string {
  const {
    componentName = 'CourseGrid',
    endpoint = '/courses',
    columns = 2,
    showRatings = true,
    showPrice = true,
  } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * (${columns} + 1)) / ${columns};

interface ${componentName}Props {
  category?: string;
  search?: string;
  onCoursePress?: (course: any) => void;
  style?: any;
}

interface CourseCardProps {
  course: any;
  onPress: () => void;
  showRatings: boolean;
  showPrice: boolean;
}

const StarRating: React.FC<{ rating: number; reviewCount?: number }> = ({ rating, reviewCount }) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalf = (rating || 0) % 1 >= 0.5;

  return (
    <View style={styles.ratingContainer}>
      <View style={styles.starsRow}>
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return <Ionicons key={i} name="star" size={12} color="#FBBF24" />;
          }
          if (i === fullStars && hasHalf) {
            return <Ionicons key={i} name="star-half" size={12} color="#FBBF24" />;
          }
          return <Ionicons key={i} name="star-outline" size={12} color="#D1D5DB" />;
        })}
      </View>
      {reviewCount !== undefined && (
        <Text style={styles.reviewCount}>({reviewCount})</Text>
      )}
    </View>
  );
};

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPress,
  showRatings,
  showPrice,
}) => {
  const courseId = course.id || course._id;
  const title = course.title || course.name || 'Untitled Course';
  const instructorName = course.instructor_name || course.instructor?.name;
  const thumbnailUrl = course.thumbnail_url || course.thumbnail || course.image_url;
  const category = course.category;
  const duration = course.duration;
  const lessonsCount = course.lessons_count || course.lessons?.length;
  const studentsCount = course.students_count || course.enrollments_count;
  const rating = course.rating || course.average_rating;
  const reviewsCount = course.reviews_count;
  const price = course.price;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.courseImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="book-outline" size={40} color="#9CA3AF" />
          </View>
        )}
        {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{category}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {title}
        </Text>

        {instructorName && (
          <Text style={styles.instructorName} numberOfLines={1}>
            by {instructorName}
          </Text>
        )}

        <View style={styles.metaRow}>
          {duration && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{duration}</Text>
            </View>
          )}
          {lessonsCount !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{lessonsCount}</Text>
            </View>
          )}
          {studentsCount !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{studentsCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.footerRow}>
          {showRatings && rating !== undefined && (
            <StarRating rating={rating} reviewCount={reviewsCount} />
          )}
          {showPrice && price !== undefined && (
            <Text style={styles.price}>
              {price === 0 ? 'Free' : \`$\${parseFloat(price).toFixed(2)}\`}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({
  category,
  search,
  onCoursePress,
  style,
}) => {
  const navigation = useNavigation();

  // Build API endpoint with query params
  const buildEndpoint = () => {
    let url = '${endpoint}';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (params.toString()) url += '?' + params.toString();
    return url;
  };

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses', category, search],
    queryFn: async () => {
      try {
        const response = await api.get<any>(buildEndpoint());
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        return [];
      }
    },
  });

  const handleCoursePress = useCallback((course: any) => {
    if (onCoursePress) {
      onCoursePress(course);
    } else {
      const courseId = course.id || course._id;
      navigation.navigate('CourseDetail' as never, { id: courseId } as never);
    }
  }, [onCoursePress, navigation]);

  const renderCourse = useCallback(({ item }: { item: any }) => (
    <CourseCard
      course={item}
      onPress={() => handleCoursePress(item)}
      showRatings={${showRatings}}
      showPrice={${showPrice}}
    />
  ), [handleCoursePress]);

  const keyExtractor = useCallback((item: any) => (item.id || item._id)?.toString(), []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Text style={styles.errorText}>Failed to load courses.</Text>
      </View>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="book-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No courses found</Text>
        <Text style={styles.emptySubtitle}>Check back later for new courses.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={keyExtractor}
        numColumns={${columns}}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN / 2,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: CARD_MARGIN / 2,
    marginVertical: CARD_MARGIN / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.6,
    backgroundColor: '#F3F4F6',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardContent: {
    padding: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 20,
  },
  instructorName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
  },
  reviewCount: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

/**
 * Generate course filter chips component for React Native
 */
export function generateCourseFilters(options: CourseFiltersOptions = {}): string {
  const {
    componentName = 'CourseFilters',
    categories = ['All', 'Development', 'Design', 'Business', 'Marketing', 'Personal Development'],
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories = ${JSON.stringify(categories)},
}) => {
  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={onSearchChange}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {categories.map((cat) => {
          const isActive = (cat === 'All' && !category) || category === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                isActive && styles.chipActive,
              ]}
              onPress={() => onCategoryChange(cat === 'All' ? '' : cat)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                isActive && styles.chipTextActive,
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#3B82F6',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

/**
 * Generate enrolled courses list with progress bars for React Native
 */
export function generateEnrolledCourses(options: EnrolledCoursesOptions = {}): string {
  const {
    componentName = 'EnrolledCourses',
    endpoint = '/enrollments',
  } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onCoursePress?: (enrollment: any) => void;
  style?: any;
}

interface EnrollmentCardProps {
  enrollment: any;
  onPress: () => void;
}

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: \`\${progress}%\` }]} />
      </View>
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );
};

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ enrollment, onPress }) => {
  const course = enrollment.course || enrollment;
  const title = course.title || course.name || 'Untitled Course';
  const instructorName = course.instructor_name || course.instructor?.name;
  const thumbnailUrl = course.thumbnail_url || course.thumbnail || course.image_url;
  const progress = enrollment.progress || 0;
  const isCompleted = progress === 100;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Ionicons name="book-outline" size={24} color="#9CA3AF" />
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {title}
        </Text>
        {instructorName && (
          <Text style={styles.instructorName} numberOfLines={1}>
            by {instructorName}
          </Text>
        )}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Progress</Text>
          <ProgressBar progress={progress} />
        </View>
      </View>

      <View style={styles.actionContainer}>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
          </View>
        ) : (
          <View style={styles.playButton}>
            <Ionicons name="play" size={20} color="#3B82F6" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({
  onCoursePress,
  style,
}) => {
  const navigation = useNavigation();

  const { data: enrollments, isLoading, error } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch enrollments:', err);
        return [];
      }
    },
  });

  const handleCoursePress = useCallback((enrollment: any) => {
    if (onCoursePress) {
      onCoursePress(enrollment);
    } else {
      const courseId = enrollment.course_id || enrollment.course?.id;
      navigation.navigate('CourseLearn' as never, { id: courseId } as never);
    }
  }, [onCoursePress, navigation]);

  const renderEnrollment = useCallback(({ item }: { item: any }) => (
    <EnrollmentCard
      enrollment={item}
      onPress={() => handleCoursePress(item)}
    />
  ), [handleCoursePress]);

  const keyExtractor = useCallback((item: any) => (item.id || item._id)?.toString(), []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Text style={styles.errorText}>Failed to load enrollments.</Text>
      </View>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="book-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No enrolled courses</Text>
        <Text style={styles.emptySubtitle}>
          You haven't enrolled in any courses yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={enrollments}
        renderItem={renderEnrollment}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  instructorName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressSection: {
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    width: 36,
    textAlign: 'right',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  completedBadge: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}
