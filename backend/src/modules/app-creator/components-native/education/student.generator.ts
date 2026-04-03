/**
 * React Native Student Component Generators
 *
 * Generates student-related components for education/school mobile applications.
 * Components: StudentProfile, StudentFilters, StudentAttendance, StudentGrades, StudentProgress
 */

export interface StudentProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProfile(options: StudentProfileOptions = {}): string {
  const { componentName = 'StudentProfile', endpoint = '/students' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          {student.avatar_url ? (
            <Image source={{ uri: student.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#3B82F6" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.studentId}>Student ID: {student.student_id || student.id}</Text>
            {student.grade_level && (
              <View style={styles.gradeRow}>
                <Ionicons name="school-outline" size={16} color="#6B7280" />
                <Text style={styles.gradeText}>Grade {student.grade_level}</Text>
              </View>
            )}
            {student.class_name && (
              <View style={styles.classBadge}>
                <Text style={styles.classText}>{student.class_name}</Text>
              </View>
            )}
          </View>
          {student.status && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: student.status === 'active' ? '#DCFCE7' : '#F3F4F6' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: student.status === 'active' ? '#16A34A' : '#6B7280' }
              ]}>
                {student.status}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactGrid}>
          {student.email && (
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <Text style={styles.contactText}>{student.email}</Text>
            </View>
          )}
          {student.phone && (
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <Text style={styles.contactText}>{student.phone}</Text>
            </View>
          )}
          {student.date_of_birth && (
            <View style={styles.contactItem}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.contactText}>DOB: {new Date(student.date_of_birth).toLocaleDateString()}</Text>
            </View>
          )}
          {student.address && (
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.contactText}>{student.address}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Guardian Information */}
      {student.guardian && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Guardian Information</Text>
          <View style={styles.guardianInfo}>
            <Text style={styles.guardianName}>{student.guardian.name}</Text>
            <Text style={styles.guardianRelation}>{student.guardian.relationship}</Text>
            {student.guardian.phone && (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={16} color="#6B7280" />
                <Text style={styles.contactText}>{student.guardian.phone}</Text>
              </View>
            )}
            {student.guardian.email && (
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={16} color="#6B7280" />
                <Text style={styles.contactText}>{student.guardian.email}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Academic Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="book-outline" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{student.courses_count || 0}</Text>
          <Text style={styles.statLabel}>Enrolled Courses</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="school-outline" size={24} color="#16A34A" />
          </View>
          <Text style={styles.statValue}>{student.gpa || 'N/A'}</Text>
          <Text style={styles.statLabel}>Current GPA</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="ribbon-outline" size={24} color="#D97706" />
          </View>
          <Text style={styles.statValue}>{student.attendance_rate || 0}%</Text>
          <Text style={styles.statLabel}>Attendance Rate</Text>
        </View>
      </View>
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
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  studentId: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  gradeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  classBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  classText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
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
    marginBottom: 16,
  },
  contactGrid: {
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
  guardianInfo: {
    gap: 8,
  },
  guardianName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  guardianRelation: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export interface StudentFiltersOptions {
  componentName?: string;
}

export function generateStudentFilters(options: StudentFiltersOptions = {}): string {
  const componentName = options.componentName || 'StudentFilters';

  return `import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  gradeLevel: string;
  onGradeLevelChange: (value: string) => void;
  className?: string;
  onClassChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  gradeLevels?: string[];
  classes?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  gradeLevel,
  onGradeLevelChange,
  className,
  onClassChange,
  status,
  onStatusChange,
  gradeLevels = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  classes = [],
}) => {
  const [showGradeModal, setShowGradeModal] = React.useState(false);
  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [showClassModal, setShowClassModal] = React.useState(false);

  const statuses = ['All', 'Active', 'Inactive', 'Graduated', 'Transferred'];

  const renderPicker = (
    visible: boolean,
    onClose: () => void,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    title: string
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  selectedValue === (option === 'All' ? '' : option) && styles.optionSelected
                ]}
                onPress={() => {
                  onSelect(option === 'All' ? '' : option);
                  onClose();
                }}
              >
                <Text style={[
                  styles.optionText,
                  selectedValue === (option === 'All' ? '' : option) && styles.optionTextSelected
                ]}>
                  {option === 'All' ? \`All \${title}\` : option}
                </Text>
                {selectedValue === (option === 'All' ? '' : option) && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          placeholder="Search students by name or ID..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={onSearchChange}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowGradeModal(true)}>
          <Text style={styles.filterButtonText}>
            {gradeLevel ? \`Grade \${gradeLevel}\` : 'All Grades'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>

        {classes.length > 0 && (
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowClassModal(true)}>
            <Text style={styles.filterButtonText}>
              {className || 'All Classes'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.filterButton} onPress={() => setShowStatusModal(true)}>
          <Text style={styles.filterButtonText}>
            {status || 'All Status'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
      </ScrollView>

      {/* Picker Modals */}
      {renderPicker(showGradeModal, () => setShowGradeModal(false), gradeLevels, gradeLevel, onGradeLevelChange, 'Grades')}
      {renderPicker(showStatusModal, () => setShowStatusModal(false), statuses, status, onStatusChange, 'Status')}
      {classes.length > 0 && renderPicker(showClassModal, () => setShowClassModal(false), ['All', ...classes], className || '', onClassChange, 'Classes')}
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
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  filtersRow: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export interface StudentAttendanceOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentAttendance(options: StudentAttendanceOptions = {}): string {
  const { componentName = 'StudentAttendance', endpoint = '/attendance' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['student-attendance', id, currentMonth.getMonth(), currentMonth.getFullYear()],
    queryFn: async () => {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const response = await api.get<any>(\`${endpoint}?student_id=\${id}&month=\${month}&year=\${year}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <Ionicons name="checkmark-circle" size={20} color="#16A34A" />;
      case 'absent':
        return <Ionicons name="close-circle" size={20} color="#DC2626" />;
      case 'late':
        return <Ionicons name="time" size={20} color="#D97706" />;
      case 'excused':
        return <Ionicons name="information-circle" size={20} color="#3B82F6" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return { bg: '#DCFCE7', text: '#16A34A' };
      case 'absent':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'late':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'excused':
        return { bg: '#DBEAFE', text: '#3B82F6' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  // Calculate summary stats
  const summary = attendance?.reduce(
    (acc: any, record: any) => {
      const status = record.status?.toLowerCase();
      if (status === 'present') acc.present++;
      else if (status === 'absent') acc.absent++;
      else if (status === 'late') acc.late++;
      else if (status === 'excused') acc.excused++;
      acc.total++;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
  ) || { present: 0, absent: 0, late: 0, excused: 0, total: 0 };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Record</Text>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { backgroundColor: '#DCFCE7' }]}>
          <Text style={[styles.summaryValue, { color: '#16A34A' }]}>{summary.present}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.summaryValue, { color: '#DC2626' }]}>{summary.absent}</Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.summaryValue, { color: '#D97706' }]}>{summary.late}</Text>
          <Text style={styles.summaryLabel}>Late</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#DBEAFE' }]}>
          <Text style={[styles.summaryValue, { color: '#3B82F6' }]}>{summary.excused}</Text>
          <Text style={styles.summaryLabel}>Excused</Text>
        </View>
      </View>

      {/* Attendance List */}
      <FlatList
        data={attendance || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const colors = getStatusColor(item.status);
          return (
            <View style={styles.recordItem}>
              <View style={styles.recordInfo}>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                {item.class_name && (
                  <Text style={styles.className}>{item.class_name}</Text>
                )}
              </View>
              <View style={styles.recordStatus}>
                {getStatusIcon(item.status)}
                <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No attendance records for this month</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    minWidth: 120,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recordInfo: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#374151',
  },
  className: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  recordStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface StudentGradesOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentGrades(options: StudentGradesOptions = {}): string {
  const { componentName = 'StudentGrades', endpoint = '/grades' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [selectedTerm, setSelectedTerm] = useState('current');
  const [showTermPicker, setShowTermPicker] = useState(false);

  const terms = [
    { value: 'current', label: 'Current Term' },
    { value: 'fall2024', label: 'Fall 2024' },
    { value: 'spring2024', label: 'Spring 2024' },
    { value: 'fall2023', label: 'Fall 2023' },
  ];

  const { data: grades, isLoading } = useQuery({
    queryKey: ['student-grades', id, selectedTerm],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?student_id=\${id}&term=\${selectedTerm}\`);
      return response?.data || response;
    },
  });

  const getGradeColor = (grade: string | number) => {
    const numGrade = typeof grade === 'string' ? parseFloat(grade) : grade;
    if (numGrade >= 90) return '#16A34A';
    if (numGrade >= 80) return '#3B82F6';
    if (numGrade >= 70) return '#D97706';
    if (numGrade >= 60) return '#EA580C';
    return '#DC2626';
  };

  const getLetterGrade = (grade: number) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <Ionicons name="trending-up" size={16} color="#16A34A" />;
    if (trend === 'down') return <Ionicons name="trending-down" size={16} color="#DC2626" />;
    return <Ionicons name="remove" size={16} color="#9CA3AF" />;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const courses = grades?.courses || grades || [];
  const overallGpa = grades?.gpa;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Grades & Performance</Text>
        <TouchableOpacity style={styles.termButton} onPress={() => setShowTermPicker(true)}>
          <Text style={styles.termButtonText}>
            {terms.find(t => t.value === selectedTerm)?.label}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Overall GPA */}
      {overallGpa && (
        <View style={styles.gpaCard}>
          <Text style={styles.gpaLabel}>Overall GPA</Text>
          <Text style={styles.gpaValue}>{overallGpa}</Text>
        </View>
      )}

      {/* Grades List */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.courseItem}>
            <View style={styles.courseIcon}>
              <Ionicons name="book-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>{item.name}</Text>
              <Text style={styles.courseTeacher}>{item.teacher}</Text>
            </View>
            <View style={styles.gradeInfo}>
              <Text style={[styles.gradeValue, { color: getGradeColor(item.grade) }]}>
                {item.grade}%
              </Text>
              <View style={styles.letterRow}>
                <View style={[
                  styles.letterBadge,
                  { backgroundColor: getGradeColor(item.grade) + '20' }
                ]}>
                  <Text style={[styles.letterText, { color: getGradeColor(item.grade) }]}>
                    {getLetterGrade(item.grade)}
                  </Text>
                </View>
                {getTrendIcon(item.trend)}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No grade records found</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Term Picker Modal */}
      <Modal visible={showTermPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowTermPicker(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Term</Text>
              <TouchableOpacity onPress={() => setShowTermPicker(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {terms.map((term) => (
                <TouchableOpacity
                  key={term.value}
                  style={[styles.optionItem, selectedTerm === term.value && styles.optionSelected]}
                  onPress={() => {
                    setSelectedTerm(term.value);
                    setShowTermPicker(false);
                  }}
                >
                  <Text style={[styles.optionText, selectedTerm === term.value && styles.optionTextSelected]}>
                    {term.label}
                  </Text>
                  {selectedTerm === term.value && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  termButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  termButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  gpaCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  gpaLabel: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  gpaValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  courseTeacher: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  gradeInfo: {
    alignItems: 'flex-end',
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  letterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  letterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  letterText: {
    fontSize: 12,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export interface StudentProgressOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProgress(options: StudentProgressOptions = {}): string {
  const { componentName = 'StudentProgress', endpoint = '/progress' } = options;

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

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: progress, isLoading } = useQuery({
    queryKey: ['student-progress', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?student_id=\${id}\`);
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overall Progress */}
      <View style={styles.overallCard}>
        <Text style={styles.sectionTitle}>Overall Progress</Text>
        <View style={styles.progressInfo}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Academic Year Completion</Text>
            <Text style={styles.progressPercent}>{progress?.overall_completion || 0}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: \`\${progress?.overall_completion || 0}%\` }]} />
          </View>
        </View>
      </View>

      {/* Progress Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="book-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{progress?.courses_completed || 0}</Text>
          <Text style={styles.statLabel}>Courses Completed</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A" />
          </View>
          <Text style={styles.statValue}>{progress?.assignments_completed || 0}</Text>
          <Text style={styles.statLabel}>Assignments Done</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="ribbon-outline" size={20} color="#D97706" />
          </View>
          <Text style={styles.statValue}>{progress?.achievements || 0}</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="time-outline" size={20} color="#9333EA" />
          </View>
          <Text style={styles.statValue}>{progress?.study_hours || 0}h</Text>
          <Text style={styles.statLabel}>Study Hours</Text>
        </View>
      </View>

      {/* Course Progress */}
      <View style={styles.courseProgressCard}>
        <Text style={styles.sectionTitle}>Course Progress</Text>
        {progress?.courses && progress.courses.length > 0 ? (
          progress.courses.map((course: any) => (
            <View key={course.id} style={styles.courseItem}>
              <View style={styles.courseHeader}>
                <View style={styles.courseIconRow}>
                  <View style={styles.courseIcon}>
                    <Ionicons name="book-outline" size={16} color="#3B82F6" />
                  </View>
                  <Text style={styles.courseName}>{course.name}</Text>
                </View>
                <Text style={styles.coursePercent}>{course.progress}%</Text>
              </View>
              <View style={styles.courseProgressBarBg}>
                <View style={[
                  styles.courseProgressBarFill,
                  {
                    width: \`\${Math.min(course.progress, 100)}%\`,
                    backgroundColor: course.progress >= 100 ? '#16A34A' : course.progress >= 50 ? '#3B82F6' : '#EAB308',
                  }
                ]} />
              </View>
              <View style={styles.courseMeta}>
                <Text style={styles.courseMetaText}>
                  {course.completed_lessons || 0}/{course.total_lessons || 0} lessons
                </Text>
                {course.next_deadline && (
                  <View style={styles.deadlineRow}>
                    <Ionicons name="time-outline" size={12} color="#6B7280" />
                    <Text style={styles.deadlineText}>
                      Due: {new Date(course.next_deadline).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No course progress data available</Text>
        )}
      </View>

      {/* Goals */}
      {progress?.goals && progress.goals.length > 0 && (
        <View style={styles.goalsCard}>
          <Text style={styles.sectionTitle}>Learning Goals</Text>
          {progress.goals.map((goal: any, index: number) => (
            <View key={index} style={styles.goalItem}>
              <View style={[
                styles.goalIcon,
                { backgroundColor: goal.completed ? '#DCFCE7' : '#F3F4F6' }
              ]}>
                {goal.completed ? (
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                ) : (
                  <Ionicons name="flag-outline" size={20} color="#9CA3AF" />
                )}
              </View>
              <View style={styles.goalInfo}>
                <Text style={[
                  styles.goalTitle,
                  goal.completed && styles.goalCompleted
                ]}>
                  {goal.title}
                </Text>
                {goal.deadline && !goal.completed && (
                  <Text style={styles.goalDeadline}>Due: {new Date(goal.deadline).toLocaleDateString()}</Text>
                )}
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
  overallCard: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
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
    color: '#111827',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  courseProgressCard: {
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
  courseItem: {
    marginBottom: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  coursePercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  courseProgressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 40,
  },
  courseProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 40,
    marginTop: 8,
  },
  courseMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 32,
  },
  goalsCard: {
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
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default ${componentName};
`;
}
