/**
 * Tutoring Component Generators (React Native)
 *
 * Generates tutoring-related components for education applications.
 * Components: TutorProfile, TutorFilters, TutorSchedule, TutoringStats, StudentProfileTutoring
 */

export interface TutorProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTutorProfile(options: TutorProfileOptions = {}): string {
  const { componentName = 'TutorProfile', endpoint = '/tutors' } = options;

  return `import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const { data: tutor, isLoading } = useQuery({
    queryKey: ['tutor', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!tutor) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Tutor not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          {tutor.avatar_url ? (
            <Image source={{ uri: tutor.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#3b82f6" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{tutor.name}</Text>
                <Text style={styles.title}>{tutor.title || 'Professional Tutor'}</Text>
              </View>
              {tutor.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="ribbon" size={14} color="#16a34a" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            {/* Rating */}
            {tutor.rating && (
              <View style={styles.ratingRow}>
                <View style={styles.starsContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < Math.floor(tutor.rating) ? 'star' : 'star-outline'}
                      size={18}
                      color={i < Math.floor(tutor.rating) ? '#facc15' : '#d1d5db'}
                    />
                  ))}
                </View>
                <Text style={styles.ratingValue}>{tutor.rating}</Text>
                {tutor.reviews_count && (
                  <Text style={styles.reviewsCount}>({tutor.reviews_count} reviews)</Text>
                )}
              </View>
            )}

            {/* Subjects */}
            {tutor.subjects && tutor.subjects.length > 0 && (
              <View style={styles.subjectsContainer}>
                {tutor.subjects.map((subject: string, i: number) => (
                  <View key={i} style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{subject}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          {tutor.hourly_rate && (
            <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={16} color="#6b7280" />
              <Text style={styles.statText}>\${tutor.hourly_rate}/hr</Text>
            </View>
          )}
          {tutor.experience_years && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.statText}>{tutor.experience_years} years exp.</Text>
            </View>
          )}
          {tutor.sessions_completed && (
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={16} color="#6b7280" />
              <Text style={styles.statText}>{tutor.sessions_completed} sessions</Text>
            </View>
          )}
          {tutor.location && (
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.statText}>{tutor.location}</Text>
            </View>
          )}
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookTutor' as never, { tutorId: tutor.id } as never)}
        >
          <Text style={styles.bookButtonText}>Book Session</Text>
        </TouchableOpacity>
        {tutor.offers_online && (
          <View style={styles.onlineTag}>
            <Ionicons name="videocam-outline" size={14} color="#6b7280" />
            <Text style={styles.onlineText}>Online available</Text>
          </View>
        )}
      </View>

      {/* About */}
      {tutor.bio && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{tutor.bio}</Text>
        </View>
      )}

      {/* Education */}
      {tutor.education && tutor.education.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Education</Text>
          {tutor.education.map((edu: any, index: number) => (
            <View key={index} style={styles.educationItem}>
              <View style={styles.educationIcon}>
                <Ionicons name="ribbon" size={20} color="#3b82f6" />
              </View>
              <View style={styles.educationInfo}>
                <Text style={styles.educationDegree}>{edu.degree}</Text>
                <Text style={styles.educationInstitution}>{edu.institution}</Text>
                {edu.year && <Text style={styles.educationYear}>{edu.year}</Text>}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {tutor.certifications && tutor.certifications.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {tutor.certifications.map((cert: any, index: number) => (
            <View key={index} style={styles.certItem}>
              <Ionicons name="ribbon" size={18} color="#ca8a04" />
              <Text style={styles.certText}>{cert.name || cert}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Availability */}
      {tutor.availability && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.availabilityGrid}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
              const dayAvail = tutor.availability[day.toLowerCase()];
              return (
                <View key={day} style={styles.dayColumn}>
                  <Text style={styles.dayLabel}>{day}</Text>
                  {dayAvail ? (
                    dayAvail.map((slot: string, i: number) => (
                      <View key={i} style={styles.availSlot}>
                        <Text style={styles.availSlotText}>{slot}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.unavailSlot}>
                      <Text style={styles.unavailSlotText}>N/A</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Reviews */}
      {tutor.reviews && tutor.reviews.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {tutor.reviews.map((review: any, index: number) => (
            <View key={index} style={[styles.reviewItem, index < tutor.reviews.length - 1 && styles.reviewBorder]}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerAvatar}>
                  <Text style={styles.reviewerInitial}>{review.student_name?.charAt(0) || 'S'}</Text>
                </View>
                <View style={styles.reviewInfo}>
                  <View style={styles.reviewNameRow}>
                    <Text style={styles.reviewerName}>{review.student_name}</Text>
                    <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? 'star' : 'star-outline'}
                        size={14}
                        color={i < review.rating ? '#facc15' : '#d1d5db'}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
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
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 16,
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
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#16a34a',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewsCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  subjectBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 12,
    color: '#1d4ed8',
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#6b7280',
  },
  bookButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  onlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  onlineText: {
    fontSize: 13,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  educationItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  educationIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  educationInfo: {
    flex: 1,
  },
  educationDegree: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  educationInstitution: {
    fontSize: 13,
    color: '#6b7280',
  },
  educationYear: {
    fontSize: 12,
    color: '#9ca3af',
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  certText: {
    fontSize: 14,
    color: '#111827',
  },
  availabilityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  availSlot: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  availSlotText: {
    fontSize: 10,
    color: '#16a34a',
  },
  unavailSlot: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unavailSlotText: {
    fontSize: 10,
    color: '#6b7280',
  },
  reviewItem: {
    paddingVertical: 12,
  },
  reviewBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  reviewStars: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    marginLeft: 52,
  },
});

export default ${componentName};
`;
}

export interface TutorFiltersOptions {
  componentName?: string;
}

export function generateTutorFilters(options: TutorFiltersOptions = {}): string {
  const componentName = options.componentName || 'TutorFilters';

  return `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  subject: string;
  onSubjectChange: (value: string) => void;
  priceRange: string;
  onPriceRangeChange: (value: string) => void;
  rating: string;
  onRatingChange: (value: string) => void;
  availability: string;
  onAvailabilityChange: (value: string) => void;
  subjects?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  subject,
  onSubjectChange,
  priceRange,
  onPriceRangeChange,
  rating,
  onRatingChange,
  availability,
  onAvailabilityChange,
  subjects = ['All', 'Math', 'English', 'Science', 'History', 'Physics', 'Chemistry', 'Biology', 'Programming'],
}) => {
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showPricePicker, setShowPricePicker] = useState(false);
  const [showRatingPicker, setShowRatingPicker] = useState(false);
  const [showAvailPicker, setShowAvailPicker] = useState(false);

  const priceOptions = [
    { label: 'Any Price', value: '' },
    { label: '$0 - $25/hr', value: '0-25' },
    { label: '$25 - $50/hr', value: '25-50' },
    { label: '$50 - $100/hr', value: '50-100' },
    { label: '$100+/hr', value: '100+' },
  ];

  const ratingOptions = [
    { label: 'Any Rating', value: '' },
    { label: '4.5+ Stars', value: '4.5' },
    { label: '4+ Stars', value: '4' },
    { label: '3.5+ Stars', value: '3.5' },
  ];

  const availOptions = [
    { label: 'Any Time', value: '' },
    { label: 'Morning', value: 'morning' },
    { label: 'Afternoon', value: 'afternoon' },
    { label: 'Evening', value: 'evening' },
    { label: 'Weekends', value: 'weekend' },
  ];

  const renderPicker = (
    visible: boolean,
    onClose: () => void,
    options: { label: string; value: string }[],
    selectedValue: string,
    onSelect: (value: string) => void,
    title: string
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionItem, selectedValue === option.value && styles.optionItemSelected]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text style={[styles.optionText, selectedValue === option.value && styles.optionTextSelected]}>
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Ionicons name="checkmark" size={20} color="#3b82f6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tutors..."
          value={search}
          onChangeText={onSearchChange}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        {/* Subject Filter */}
        <TouchableOpacity style={styles.filterChip} onPress={() => setShowSubjectPicker(true)}>
          <Text style={styles.filterChipText}>{subject || 'Subject'}</Text>
          <Ionicons name="chevron-down" size={16} color="#6b7280" />
        </TouchableOpacity>

        {/* Price Filter */}
        <TouchableOpacity style={styles.filterChip} onPress={() => setShowPricePicker(true)}>
          <Ionicons name="cash-outline" size={16} color="#6b7280" />
          <Text style={styles.filterChipText}>
            {priceOptions.find((p) => p.value === priceRange)?.label || 'Price'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6b7280" />
        </TouchableOpacity>

        {/* Rating Filter */}
        <TouchableOpacity style={styles.filterChip} onPress={() => setShowRatingPicker(true)}>
          <Ionicons name="star-outline" size={16} color="#6b7280" />
          <Text style={styles.filterChipText}>
            {ratingOptions.find((r) => r.value === rating)?.label || 'Rating'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6b7280" />
        </TouchableOpacity>

        {/* Availability Filter */}
        <TouchableOpacity style={styles.filterChip} onPress={() => setShowAvailPicker(true)}>
          <Text style={styles.filterChipText}>
            {availOptions.find((a) => a.value === availability)?.label || 'Time'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6b7280" />
        </TouchableOpacity>
      </ScrollView>

      {/* Subject Picker Modal */}
      {renderPicker(
        showSubjectPicker,
        () => setShowSubjectPicker(false),
        subjects.map((s) => ({ label: s, value: s === 'All' ? '' : s })),
        subject,
        onSubjectChange,
        'Select Subject'
      )}

      {/* Price Picker Modal */}
      {renderPicker(showPricePicker, () => setShowPricePicker(false), priceOptions, priceRange, onPriceRangeChange, 'Select Price Range')}

      {/* Rating Picker Modal */}
      {renderPicker(showRatingPicker, () => setShowRatingPicker(false), ratingOptions, rating, onRatingChange, 'Select Rating')}

      {/* Availability Picker Modal */}
      {renderPicker(showAvailPicker, () => setShowAvailPicker(false), availOptions, availability, onAvailabilityChange, 'Select Availability')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#111827',
  },
  filtersRow: {
    marginTop: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 13,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionItemSelected: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#3b82f6',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export interface TutorScheduleOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTutorSchedule(options: TutorScheduleOptions = {}): string {
  const { componentName = 'TutorSchedule', endpoint = '/tutors' } = options;

  return `import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  tutorId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ tutorId: propTutorId }) => {
  const route = useRoute();
  const { id } = (route.params as { id?: string }) || {};
  const tutorId = propTutorId || id;
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
    queryKey: ['tutor-schedule', tutorId, currentWeek.toISOString()],
    queryFn: async () => {
      const weekStart = getWeekDates()[0].toISOString().split('T')[0];
      const weekEnd = getWeekDates()[6].toISOString().split('T')[0];
      const response = await api.get<any>(\`${endpoint}/\${tutorId}/schedule?start=\${weekStart}&end=\${weekEnd}\`);
      return response?.data || response;
    },
  });

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const weekDates = getWeekDates();
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

  const getSessionForSlot = (date: Date, time: string) => {
    if (!schedule?.sessions) return null;
    const dateStr = date.toISOString().split('T')[0];
    return schedule.sessions.find((s: any) => s.date === dateStr && s.time === time);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={() => navigateWeek(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.weekRange}>
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateWeek(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Days Header */}
      <View style={styles.daysHeader}>
        <View style={styles.timeColumn} />
        {weekDates.map((date, i) => (
          <View key={i} style={[styles.dayColumn, isToday(date) && styles.todayColumn]}>
            <Text style={styles.dayName}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
            <Text style={[styles.dayNumber, isToday(date) && styles.todayNumber]}>{date.getDate()}</Text>
          </View>
        ))}
      </View>

      {/* Schedule Grid */}
      <ScrollView style={styles.gridScroll}>
        {timeSlots.map((time) => (
          <View key={time} style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeText}>{time}</Text>
            </View>
            {weekDates.map((date, dateIndex) => {
              const session = getSessionForSlot(date, time);
              return (
                <View key={dateIndex} style={[styles.slotColumn, isToday(date) && styles.todaySlot]}>
                  {session ? (
                    <View style={[styles.sessionCard, session.type === 'booked' ? styles.bookedCard : styles.availableCard]}>
                      <View style={styles.sessionInfo}>
                        <Ionicons name="person-outline" size={12} color="#374151" />
                        <Text style={styles.sessionName} numberOfLines={1}>{session.student_name || 'Session'}</Text>
                      </View>
                      <View style={styles.sessionType}>
                        <Ionicons name={session.is_online ? 'videocam-outline' : 'location-outline'} size={10} color="#6b7280" />
                        <Text style={styles.sessionTypeText}>{session.is_online ? 'Online' : 'In-person'}</Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#dbeafe' }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f3f4f6' }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  weekRange: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    minWidth: 140,
    textAlign: 'center',
  },
  daysHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timeColumn: {
    width: 60,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  todayColumn: {
    backgroundColor: '#eff6ff',
  },
  dayName: {
    fontSize: 11,
    color: '#6b7280',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  todayNumber: {
    color: '#3b82f6',
  },
  gridScroll: {
    maxHeight: 400,
  },
  timeRow: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  timeText: {
    fontSize: 11,
    color: '#6b7280',
  },
  slotColumn: {
    flex: 1,
    padding: 2,
  },
  todaySlot: {
    backgroundColor: '#eff6ff',
  },
  sessionCard: {
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  bookedCard: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
  },
  availableCard: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  sessionType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  sessionTypeText: {
    fontSize: 9,
    color: '#6b7280',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default ${componentName};
`;
}

export interface TutoringStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTutoringStats(options: TutoringStatsOptions = {}): string {
  const { componentName = 'TutoringStats', endpoint = '/tutoring/stats' } = options;

  return `import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  tutorId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ tutorId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['tutoring-stats', tutorId],
    queryFn: async () => {
      let url = '${endpoint}';
      if (tutorId) url += \`?tutor_id=\${tutorId}\`;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.grid}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonValue} />
              <View style={styles.skeletonLabel} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Primary Stats */}
      <View style={styles.grid}>
        <View style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="people" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.value}>{stats?.total_students || 0}</Text>
          <Text style={styles.label}>Active Students</Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="calendar" size={24} color="#16a34a" />
          </View>
          <Text style={styles.value}>{stats?.sessions_completed || 0}</Text>
          <Text style={styles.label}>Sessions</Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="time" size={24} color="#ca8a04" />
          </View>
          <Text style={styles.value}>{stats?.total_hours || 0}h</Text>
          <Text style={styles.label}>Total Hours</Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
            <Ionicons name="star" size={24} color="#9333ea" />
          </View>
          <Text style={styles.value}>{stats?.average_rating || 'N/A'}</Text>
          <Text style={styles.label}>Avg Rating</Text>
        </View>
      </View>

      {/* Secondary Stats */}
      <View style={styles.secondaryGrid}>
        <View style={[styles.secondaryCard, { backgroundColor: '#3b82f6' }]}>
          <View style={styles.secondaryHeader}>
            <Ionicons name="cash-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.secondaryLabel}>Revenue</Text>
          </View>
          <Text style={styles.secondaryValue}>\${stats?.total_revenue || 0}</Text>
        </View>

        <View style={[styles.secondaryCard, { backgroundColor: '#16a34a' }]}>
          <View style={styles.secondaryHeader}>
            <Ionicons name="trending-up" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.secondaryLabel}>Completion</Text>
          </View>
          <Text style={styles.secondaryValue}>{stats?.completion_rate || 0}%</Text>
        </View>

        <View style={[styles.secondaryCard, { backgroundColor: '#f97316' }]}>
          <View style={styles.secondaryHeader}>
            <Ionicons name="book-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.secondaryLabel}>Subjects</Text>
          </View>
          <Text style={styles.secondaryValue}>{stats?.subjects_taught || 0}</Text>
        </View>

        <View style={[styles.secondaryCard, { backgroundColor: '#9333ea' }]}>
          <View style={styles.secondaryHeader}>
            <Ionicons name="ribbon-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.secondaryLabel}>Repeat Rate</Text>
          </View>
          <Text style={styles.secondaryValue}>{stats?.repeat_student_rate || 0}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
  },
  skeletonValue: {
    width: 60,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  skeletonLabel: {
    width: 80,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  secondaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  secondaryCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
  },
  secondaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  secondaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  secondaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default ${componentName};
`;
}

export interface StudentProfileTutoringOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProfileTutoring(options: StudentProfileTutoringOptions = {}): string {
  const { componentName = 'StudentProfileTutoring', endpoint = '/tutoring/students' } = options;

  return `import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const { data: student, isLoading } = useQuery({
    queryKey: ['tutoring-student', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          {student.avatar_url ? (
            <Image source={{ uri: student.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#3b82f6" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{student.name}</Text>
            {student.grade_level && <Text style={styles.grade}>Grade {student.grade_level}</Text>}
            <View style={styles.contactRow}>
              {student.email && (
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={14} color="#6b7280" />
                  <Text style={styles.contactText}>{student.email}</Text>
                </View>
              )}
              {student.phone && (
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={14} color="#6b7280" />
                  <Text style={styles.contactText}>{student.phone}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => navigation.navigate('NewSession' as never, { studentId: student.id } as never)}
        >
          <Text style={styles.scheduleButtonText}>Schedule Session</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="calendar" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{student.total_sessions || 0}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="time" size={24} color="#16a34a" />
          </View>
          <Text style={styles.statValue}>{student.total_hours || 0}h</Text>
          <Text style={styles.statLabel}>Hours Studied</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="trending-up" size={24} color="#ca8a04" />
          </View>
          <Text style={styles.statValue}>{student.improvement_rate || 0}%</Text>
          <Text style={styles.statLabel}>Improvement</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
            <Ionicons name="ribbon" size={24} color="#9333ea" />
          </View>
          <Text style={styles.statValue}>{student.goals_completed || 0}</Text>
          <Text style={styles.statLabel}>Goals Met</Text>
        </View>
      </View>

      {/* Subjects & Progress */}
      {student.subjects && student.subjects.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Subject Progress</Text>
          {student.subjects.map((subject: any, index: number) => (
            <View key={index} style={styles.subjectItem}>
              <View style={styles.subjectHeader}>
                <View style={styles.subjectName}>
                  <Ionicons name="book-outline" size={16} color="#3b82f6" />
                  <Text style={styles.subjectNameText}>{subject.name}</Text>
                </View>
                <Text style={styles.subjectProgress}>{subject.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: \`\${subject.progress}%\`,
                      backgroundColor:
                        subject.progress >= 80 ? '#22c55e' : subject.progress >= 50 ? '#3b82f6' : '#eab308',
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Learning Goals */}
      {student.goals && student.goals.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Learning Goals</Text>
          {student.goals.map((goal: any, index: number) => (
            <View key={index} style={styles.goalItem}>
              <View style={[styles.goalIcon, goal.completed ? styles.goalCompleted : styles.goalPending]}>
                <Ionicons name="flag" size={16} color={goal.completed ? '#16a34a' : '#9ca3af'} />
              </View>
              <View style={styles.goalInfo}>
                <Text style={[styles.goalTitle, goal.completed && styles.goalTitleCompleted]}>{goal.title}</Text>
                {goal.target_date && !goal.completed && (
                  <Text style={styles.goalDate}>Target: {new Date(goal.target_date).toLocaleDateString()}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Sessions */}
      {student.recent_sessions && student.recent_sessions.length > 0 && (
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StudentSessions' as never, { studentId: student.id } as never)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {student.recent_sessions.map((session: any, index: number) => (
            <View
              key={index}
              style={[styles.sessionItem, index < student.recent_sessions.length - 1 && styles.sessionBorder]}
            >
              <View>
                <Text style={styles.sessionSubject}>{session.subject}</Text>
                <Text style={styles.sessionMeta}>
                  {new Date(session.date).toLocaleDateString()} - {session.duration} min
                </Text>
              </View>
              {session.notes && <Text style={styles.sessionNotes} numberOfLines={1}>{session.notes}</Text>}
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
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
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
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  grade: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  contactRow: {
    marginTop: 8,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 13,
    color: '#6b7280',
  },
  scheduleButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  scheduleButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    color: '#3b82f6',
  },
  subjectItem: {
    marginBottom: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectNameText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  subjectProgress: {
    fontSize: 13,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  goalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCompleted: {
    backgroundColor: '#dcfce7',
  },
  goalPending: {
    backgroundColor: '#f3f4f6',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  goalTitleCompleted: {
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  goalDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sessionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sessionSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  sessionMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  sessionNotes: {
    fontSize: 12,
    color: '#6b7280',
    maxWidth: 150,
  },
});

export default ${componentName};
`;
}
