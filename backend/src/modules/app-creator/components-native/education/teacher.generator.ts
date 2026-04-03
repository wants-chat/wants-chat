/**
 * React Native Teacher Component Generators
 *
 * Generates teacher-related components for education/school mobile applications.
 * Components: TeacherProfile, TeacherClasses
 */

export interface TeacherProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTeacherProfile(options: TeacherProfileOptions = {}): string {
  const { componentName = 'TeacherProfile', endpoint = '/teachers' } = options;

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

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher', id],
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

  if (!teacher) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Teacher not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          {teacher.avatar_url ? (
            <Image source={{ uri: teacher.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#3B82F6" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{teacher.name}</Text>
              {teacher.status && (
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: teacher.status === 'active' ? '#DCFCE7' : '#F3F4F6' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: teacher.status === 'active' ? '#16A34A' : '#6B7280' }
                  ]}>
                    {teacher.status}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>{teacher.title || 'Teacher'}</Text>
            {teacher.department && (
              <View style={styles.departmentRow}>
                <Ionicons name="briefcase-outline" size={14} color="#6B7280" />
                <Text style={styles.departmentText}>{teacher.department}</Text>
              </View>
            )}
            {/* Subjects */}
            {teacher.subjects && teacher.subjects.length > 0 && (
              <View style={styles.subjectsRow}>
                {teacher.subjects.map((subject: string, i: number) => (
                  <View key={i} style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{subject}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Contact & Stats Grid */}
      <View style={styles.gridRow}>
        {/* Contact Information */}
        <View style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactList}>
            {teacher.email && (
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
                <Text style={styles.contactText} numberOfLines={1}>{teacher.email}</Text>
              </View>
            )}
            {teacher.phone && (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={18} color="#6B7280" />
                <Text style={styles.contactText}>{teacher.phone}</Text>
              </View>
            )}
            {teacher.office && (
              <View style={styles.contactItem}>
                <Ionicons name="briefcase-outline" size={18} color="#6B7280" />
                <Text style={styles.contactText}>Office: {teacher.office}</Text>
              </View>
            )}
            {teacher.office_hours && (
              <View style={styles.contactItem}>
                <Ionicons name="time-outline" size={18} color="#6B7280" />
                <Text style={styles.contactText}>{teacher.office_hours}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="book-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{teacher.classes_count || 0}</Text>
          <Text style={styles.statLabel}>Classes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="people-outline" size={20} color="#16A34A" />
          </View>
          <Text style={styles.statValue}>{teacher.students_count || 0}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFFBEB' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="calendar-outline" size={20} color="#D97706" />
          </View>
          <Text style={styles.statValue}>{teacher.years_experience || 0}</Text>
          <Text style={styles.statLabel}>Years Exp.</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FAF5FF' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="star-outline" size={20} color="#9333EA" />
          </View>
          <Text style={styles.statValue}>{teacher.rating || 'N/A'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Bio */}
      {teacher.bio && (
        <View style={styles.bioCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{teacher.bio}</Text>
        </View>
      )}

      {/* Education & Qualifications */}
      {teacher.qualifications && teacher.qualifications.length > 0 && (
        <View style={styles.qualificationsCard}>
          <Text style={styles.sectionTitle}>Qualifications</Text>
          {teacher.qualifications.map((qual: any, index: number) => (
            <View key={index} style={styles.qualItem}>
              <View style={styles.qualIcon}>
                <Ionicons name="ribbon-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.qualInfo}>
                <Text style={styles.qualDegree}>{qual.degree || qual}</Text>
                {qual.institution && <Text style={styles.qualInstitution}>{qual.institution}</Text>}
                {qual.year && <Text style={styles.qualYear}>{qual.year}</Text>}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Current Classes */}
      {teacher.classes && teacher.classes.length > 0 && (
        <View style={styles.classesCard}>
          <Text style={styles.sectionTitle}>Current Classes</Text>
          {teacher.classes.map((cls: any) => (
            <TouchableOpacity
              key={cls.id}
              style={styles.classItem}
              onPress={() => navigation.navigate('ClassDetail' as never, { id: cls.id } as never)}
            >
              <View style={styles.classIcon}>
                <Ionicons name="book-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{cls.name}</Text>
                <Text style={styles.classSchedule}>{cls.schedule || cls.time}</Text>
              </View>
              <View style={styles.classStudents}>
                <Ionicons name="people-outline" size={16} color="#6B7280" />
                <Text style={styles.studentsCount}>{cls.students_count || 0}</Text>
              </View>
            </TouchableOpacity>
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
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  departmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  departmentText: {
    fontSize: 14,
    color: '#6B7280',
  },
  subjectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  subjectBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  gridRow: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
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
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
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
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  bioCard: {
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
  bioText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  qualificationsCard: {
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
  qualItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  qualIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualInfo: {
    flex: 1,
    marginLeft: 12,
  },
  qualDegree: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  qualInstitution: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  qualYear: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  classesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  classIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classInfo: {
    flex: 1,
    marginLeft: 12,
  },
  className: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  classSchedule: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  classStudents: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  studentsCount: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface TeacherClassesOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTeacherClasses(options: TeacherClassesOptions = {}): string {
  const { componentName = 'TeacherClasses', endpoint = '/classes' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  teacherId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ teacherId: propTeacherId }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id?: string };
  const teacherId = propTeacherId || id;

  const { data: classes, isLoading } = useQuery({
    queryKey: ['teacher-classes', teacherId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?teacher_id=\${teacherId}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getDayColor = (day: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      monday: { bg: '#DBEAFE', text: '#3B82F6' },
      tuesday: { bg: '#DCFCE7', text: '#16A34A' },
      wednesday: { bg: '#FEF3C7', text: '#D97706' },
      thursday: { bg: '#F3E8FF', text: '#9333EA' },
      friday: { bg: '#FEE2E2', text: '#DC2626' },
      saturday: { bg: '#FFEDD5', text: '#EA580C' },
      sunday: { bg: '#F3F4F6', text: '#6B7280' },
    };
    return colors[day?.toLowerCase()] || colors.monday;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderClassCard = ({ item: cls }: { item: any }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() => navigation.navigate('ClassDetail' as never, { id: cls.id } as never)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.classIconContainer}>
          <Ionicons name="book-outline" size={24} color="#3B82F6" />
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>

      <Text style={styles.className}>{cls.name}</Text>
      <Text style={styles.classSubject}>{cls.subject || cls.code}</Text>

      <View style={styles.classMetaList}>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{cls.students_count || 0} students</Text>
        </View>
        {cls.schedule && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{cls.schedule}</Text>
          </View>
        )}
        {cls.room && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>Room {cls.room}</Text>
          </View>
        )}
      </View>

      {cls.days && cls.days.length > 0 && (
        <View style={styles.daysRow}>
          {cls.days.map((day: string, i: number) => {
            const colors = getDayColor(day);
            return (
              <View key={i} style={[styles.dayBadge, { backgroundColor: colors.bg }]}>
                <Text style={[styles.dayText, { color: colors.text }]}>{day.slice(0, 3)}</Text>
              </View>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Classes</Text>
        <Text style={styles.count}>{classes?.length || 0} classes</Text>
      </View>

      <FlatList
        data={classes || []}
        keyExtractor={(item) => item.id}
        renderItem={renderClassCard}
        numColumns={1}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No classes assigned</Text>
          </View>
        }
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  count: {
    fontSize: 14,
    color: '#6B7280',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  classIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  classSubject: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  classMetaList: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}
