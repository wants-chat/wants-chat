/**
 * Class Grid Component Generator (React Native)
 *
 * Generates fitness class components including grid views, schedules, details, and filters.
 * Features: FlatList for class cards, day/time schedule picker, class booking functionality.
 */

export interface ClassGridOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
  numColumns?: number;
}

export function generateClassGrid(options: ClassGridOptions = {}): string {
  const {
    componentName = 'ClassGrid',
    endpoint = '/classes',
    title = 'Fitness Classes',
    numColumns = 2,
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
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface FitnessClass {
  id: string;
  name: string;
  category?: string;
  instructor_name?: string;
  image_url?: string;
  duration?: number;
  capacity?: number;
  spots_left?: number;
  location?: string;
  next_session?: string;
}

interface ${componentName}Props {
  title?: string;
  category?: string;
  date?: string;
  onClassPress?: (cls: FitnessClass) => void;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const NUM_COLUMNS = ${numColumns};
const CARD_WIDTH = (width - (CARD_MARGIN * (NUM_COLUMNS + 1) * 2)) / NUM_COLUMNS;

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  category,
  date,
  onClassPress,
}) => {
  const navigation = useNavigation();

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes', category, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (date) params.append('date', date);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleClassPress = useCallback((cls: FitnessClass) => {
    if (onClassPress) {
      onClassPress(cls);
    } else {
      navigation.navigate('ClassDetail' as never, { classId: cls.id } as never);
    }
  }, [onClassPress, navigation]);

  const renderClassItem = useCallback(({ item }: { item: FitnessClass }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleClassPress(item)}
      activeOpacity={0.7}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="fitness-outline" size={32} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.cardContent}>
        {item.category && (
          <Text style={styles.categoryBadge}>{item.category.toUpperCase()}</Text>
        )}
        <Text style={styles.className} numberOfLines={1}>
          {item.name}
        </Text>
        {item.instructor_name && (
          <Text style={styles.instructorName}>with {item.instructor_name}</Text>
        )}
        <View style={styles.metaContainer}>
          {item.duration && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.duration} min</Text>
            </View>
          )}
          {(item.spots_left !== undefined || item.capacity) && (
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                {item.spots_left ?? item.capacity} spots
              </Text>
            </View>
          )}
        </View>
        {item.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        )}
        {item.next_session && (
          <View style={styles.nextSessionContainer}>
            <Ionicons name="calendar-outline" size={14} color="#10B981" />
            <Text style={styles.nextSessionText}>Next: {item.next_session}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [handleClassPress]);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="fitness-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No classes found</Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: FitnessClass) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: CARD_MARGIN,
    marginBottom: CARD_MARGIN * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  instructorName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  metaContainer: {
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  nextSessionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextSessionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
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

export function generateClassSchedule(
  options: { componentName?: string; endpoint?: string } = {}
): string {
  const { componentName = 'ClassSchedule', endpoint = '/class-schedule' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ScheduledClass {
  id: string;
  class_id?: string;
  name?: string;
  class_name?: string;
  time?: string;
  start_time?: string;
  duration?: number;
  instructor_name?: string;
  location?: string;
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['class-schedule', selectedDate],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?date=' + selectedDate);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleClassPress = useCallback((cls: ScheduledClass) => {
    const classId = cls.class_id || cls.id;
    navigation.navigate('ClassDetail' as never, { classId } as never);
  }, [navigation]);

  const renderDateButton = useCallback((date: string) => {
    const d = new Date(date);
    const isSelected = date === selectedDate;

    return (
      <TouchableOpacity
        key={date}
        style={[
          styles.dateButton,
          isSelected && styles.dateButtonSelected,
        ]}
        onPress={() => setSelectedDate(date)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
          {dayNames[d.getDay()]}
        </Text>
        <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
          {d.getDate()}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedDate]);

  const renderClassItem = useCallback(({ item }: { item: ScheduledClass }) => (
    <TouchableOpacity
      style={styles.classItem}
      onPress={() => handleClassPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{item.time || item.start_time}</Text>
        <Text style={styles.durationText}>{item.duration} min</Text>
      </View>
      <View style={styles.classInfo}>
        <Text style={styles.classNameText}>{item.name || item.class_name}</Text>
        <View style={styles.classMetaContainer}>
          {item.instructor_name && (
            <View style={styles.classMeta}>
              <Ionicons name="person-outline" size={12} color="#6B7280" />
              <Text style={styles.classMetaText}>{item.instructor_name}</Text>
            </View>
          )}
          {item.location && (
            <View style={styles.classMeta}>
              <Ionicons name="location-outline" size={12} color="#6B7280" />
              <Text style={styles.classMetaText}>{item.location}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.bookButton} activeOpacity={0.7}>
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleClassPress]);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No classes scheduled for this day</Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: ScheduledClass) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.datePickerContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datePickerContent}
        >
          {weekDates.map(renderDateButton)}
        </ScrollView>
      </View>
      <FlatList
        data={schedule}
        renderItem={renderClassItem}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
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
    paddingVertical: 48,
  },
  datePickerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  datePickerContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  dateButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    minWidth: 60,
  },
  dateButtonSelected: {
    backgroundColor: '#3B82F6',
  },
  dayName: {
    fontSize: 12,
    color: '#6B7280',
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  timeContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  classInfo: {
    flex: 1,
    marginLeft: 16,
  },
  classNameText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  classMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  classMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
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

export function generateClassDetail(
  options: { componentName?: string; endpoint?: string } = {}
): string {
  const { componentName = 'ClassDetail', endpoint = '/classes' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

type RouteParams = {
  ClassDetail: { classId: string };
};

interface ClassDetailData {
  id: string;
  name: string;
  description?: string;
  category?: string;
  image_url?: string;
  instructor_name?: string;
  duration?: number;
  capacity?: number;
  spots_left?: number;
  location?: string;
  is_booked?: boolean;
}

const ${componentName}: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'ClassDetail'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { classId } = route.params;

  const { data: classItem, isLoading } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + classId);
      return response?.data || response;
    },
  });

  const bookMutation = useMutation({
    mutationFn: () => api.post('/bookings', { class_id: classId }),
    onSuccess: () => {
      showToast('success', 'Class booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
    },
    onError: () => {
      showToast('error', 'Failed to book class');
    },
  });

  const handleBookClass = () => {
    Alert.alert(
      'Book Class',
      'Are you sure you want to book this class?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book', onPress: () => bookMutation.mutate() },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!classItem) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="fitness-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Class not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {classItem.image_url ? (
        <Image source={{ uri: classItem.image_url }} style={styles.headerImage} />
      ) : (
        <View style={styles.headerImagePlaceholder}>
          <Ionicons name="fitness-outline" size={64} color="#9CA3AF" />
        </View>
      )}

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#3B82F6" />
          <Text style={styles.backButtonText}>Back to Classes</Text>
        </TouchableOpacity>

        <Text style={styles.className}>{classItem.name}</Text>

        {classItem.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {classItem.category.toUpperCase()}
            </Text>
          </View>
        )}

        {classItem.description && (
          <Text style={styles.description}>{classItem.description}</Text>
        )}

        <View style={styles.detailsGrid}>
          {classItem.instructor_name && (
            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Instructor</Text>
                <Text style={styles.detailValue}>{classItem.instructor_name}</Text>
              </View>
            </View>
          )}

          {classItem.duration && (
            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{classItem.duration} minutes</Text>
              </View>
            </View>
          )}

          {classItem.location && (
            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="location-outline" size={20} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{classItem.location}</Text>
              </View>
            </View>
          )}

          {classItem.capacity && (
            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="people-outline" size={20} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Spots Available</Text>
                <Text style={styles.detailValue}>
                  {classItem.spots_left ?? classItem.capacity} / {classItem.capacity}
                </Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            (bookMutation.isPending || classItem.is_booked) && styles.bookButtonDisabled,
          ]}
          onPress={handleBookClass}
          disabled={bookMutation.isPending || classItem.is_booked}
          activeOpacity={0.7}
        >
          {bookMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : classItem.is_booked ? (
            <Text style={styles.bookButtonText}>Already Booked</Text>
          ) : (
            <>
              <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
              <Text style={styles.bookButtonText}>Book This Class</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  headerImagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 4,
  },
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    gap: 12,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

export function generateClassFilters(
  options: { componentName?: string } = {}
): string {
  const componentName = options.componentName || 'ClassFilters';

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ${componentName}Props {
  category: string;
  onCategoryChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  categories?: string[];
  showDatePicker?: boolean;
  onToggleDatePicker?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  category,
  onCategoryChange,
  date,
  onDateChange,
  categories = ['All', 'Yoga', 'HIIT', 'Strength', 'Cardio', 'Pilates', 'Dance', 'Cycling'],
  showDatePicker = false,
  onToggleDatePicker,
}) => {
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      onToggleDatePicker?.();
    }
    if (selectedDate) {
      onDateChange(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((cat) => {
          const isSelected = (cat === 'All' && !category) || category === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                isSelected && styles.categoryButtonSelected,
              ]}
              onPress={() => onCategoryChange(cat === 'All' ? '' : cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  isSelected && styles.categoryButtonTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={onToggleDatePicker}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={18} color="#6B7280" />
        <Text style={styles.dateButtonText}>
          {date || 'Select Date'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date ? new Date(date) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  categoryButtonSelected: {
    backgroundColor: '#3B82F6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#4B5563',
  },
});

export default ${componentName};
`;
}
