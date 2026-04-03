/**
 * React Native Gradebook Component Generators
 *
 * Generates gradebook-related components for education/school mobile applications.
 * Components: Gradebook, GradeFilters, ReportCardGenerator
 */

export interface GradebookOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateGradebook(options: GradebookOptions = {}): string {
  const { componentName = 'Gradebook', endpoint = '/gradebook' } = options;

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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  classId?: string;
  studentId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ classId, studentId }) => {
  const [selectedTerm, setSelectedTerm] = useState('current');
  const [showTermPicker, setShowTermPicker] = useState(false);

  const terms = [
    { value: 'current', label: 'Current Term' },
    { value: 'fall2024', label: 'Fall 2024' },
    { value: 'spring2024', label: 'Spring 2024' },
    { value: 'fall2023', label: 'Fall 2023' },
  ];

  const { data: grades, isLoading } = useQuery({
    queryKey: ['gradebook', classId, studentId, selectedTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (classId) params.append('class_id', classId);
      if (studentId) params.append('student_id', studentId);
      params.append('term', selectedTerm);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return response?.data || response;
    },
  });

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return '#16A34A';
    if (grade >= 80) return '#3B82F6';
    if (grade >= 70) return '#D97706';
    if (grade >= 60) return '#EA580C';
    return '#DC2626';
  };

  const getLetterGrade = (grade: number) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const entries = grades?.entries || grades || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gradebook</Text>
        <TouchableOpacity style={styles.termButton} onPress={() => setShowTermPicker(true)}>
          <Text style={styles.termButtonText}>
            {terms.find(t => t.value === selectedTerm)?.label}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      {grades?.summary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{grades.summary.gpa || 'N/A'}</Text>
            <Text style={styles.summaryLabel}>GPA</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{grades.summary.average || 0}%</Text>
            <Text style={styles.summaryLabel}>Average</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{grades.summary.rank || '-'}</Text>
            <Text style={styles.summaryLabel}>Class Rank</Text>
          </View>
        </View>
      )}

      {/* Grades List */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id || item.subject}
        renderItem={({ item }) => {
          const gradeColor = getGradeColor(item.grade);
          return (
            <View style={styles.gradeItem}>
              <View style={styles.gradeIcon}>
                <Ionicons name="book-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.gradeInfo}>
                <Text style={styles.subjectName}>{item.subject || item.course_name}</Text>
                <Text style={styles.teacherName}>{item.teacher || item.instructor}</Text>
              </View>
              <View style={styles.gradeValues}>
                <Text style={[styles.gradePercent, { color: gradeColor }]}>{item.grade}%</Text>
                <View style={[styles.letterBadge, { backgroundColor: gradeColor + '20' }]}>
                  <Text style={[styles.letterText, { color: gradeColor }]}>
                    {getLetterGrade(item.grade)}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No grades available</Text>
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
    fontSize: 20,
    fontWeight: '700',
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  gradeItem: {
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
  gradeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  teacherName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  gradeValues: {
    alignItems: 'flex-end',
  },
  gradePercent: {
    fontSize: 18,
    fontWeight: '700',
  },
  letterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
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

export interface GradeFiltersOptions {
  componentName?: string;
}

export function generateGradeFilters(options: GradeFiltersOptions = {}): string {
  const componentName = options.componentName || 'GradeFilters';

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
  subject: string;
  onSubjectChange: (value: string) => void;
  gradeRange: string;
  onGradeRangeChange: (value: string) => void;
  subjects?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  subject,
  onSubjectChange,
  gradeRange,
  onGradeRangeChange,
  subjects = ['All', 'Math', 'Science', 'English', 'History', 'Art', 'Music', 'PE'],
}) => {
  const [showSubjectModal, setShowSubjectModal] = React.useState(false);
  const [showGradeModal, setShowGradeModal] = React.useState(false);

  const gradeRanges = [
    { value: '', label: 'All Grades' },
    { value: '90-100', label: 'A (90-100%)' },
    { value: '80-89', label: 'B (80-89%)' },
    { value: '70-79', label: 'C (70-79%)' },
    { value: '60-69', label: 'D (60-69%)' },
    { value: '0-59', label: 'F (Below 60%)' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          placeholder="Search by subject or student..."
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowSubjectModal(true)}>
          <Ionicons name="book-outline" size={16} color="#6B7280" />
          <Text style={styles.filterButtonText}>{subject || 'All Subjects'}</Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterButton} onPress={() => setShowGradeModal(true)}>
          <Ionicons name="ribbon-outline" size={16} color="#6B7280" />
          <Text style={styles.filterButtonText}>
            {gradeRanges.find(r => r.value === gradeRange)?.label || 'All Grades'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
      </ScrollView>

      {/* Subject Modal */}
      <Modal visible={showSubjectModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSubjectModal(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subject</Text>
              <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {subjects.map((subj) => (
                <TouchableOpacity
                  key={subj}
                  style={[styles.optionItem, subject === (subj === 'All' ? '' : subj) && styles.optionSelected]}
                  onPress={() => {
                    onSubjectChange(subj === 'All' ? '' : subj);
                    setShowSubjectModal(false);
                  }}
                >
                  <Text style={[styles.optionText, subject === (subj === 'All' ? '' : subj) && styles.optionTextSelected]}>
                    {subj}
                  </Text>
                  {subject === (subj === 'All' ? '' : subj) && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Grade Range Modal */}
      <Modal visible={showGradeModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowGradeModal(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Grade Range</Text>
              <TouchableOpacity onPress={() => setShowGradeModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {gradeRanges.map((range) => (
                <TouchableOpacity
                  key={range.value}
                  style={[styles.optionItem, gradeRange === range.value && styles.optionSelected]}
                  onPress={() => {
                    onGradeRangeChange(range.value);
                    setShowGradeModal(false);
                  }}
                >
                  <Text style={[styles.optionText, gradeRange === range.value && styles.optionTextSelected]}>
                    {range.label}
                  </Text>
                  {gradeRange === range.value && (
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

export interface ReportCardGeneratorOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateReportCardGenerator(options: ReportCardGeneratorOptions = {}): string {
  const { componentName = 'ReportCardGenerator', endpoint = '/report-cards' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  studentId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ studentId }) => {
  const [selectedTerm, setSelectedTerm] = useState('current');
  const [showTermPicker, setShowTermPicker] = useState(false);

  const terms = [
    { value: 'current', label: 'Current Term' },
    { value: 'q1', label: 'Quarter 1' },
    { value: 'q2', label: 'Quarter 2' },
    { value: 'midyear', label: 'Mid-Year' },
    { value: 'q3', label: 'Quarter 3' },
    { value: 'q4', label: 'Quarter 4' },
    { value: 'final', label: 'Final' },
  ];

  const { data: reportCard, isLoading } = useQuery({
    queryKey: ['report-card', studentId, selectedTerm],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?student_id=\${studentId}&term=\${selectedTerm}\`);
      return response?.data || response;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return api.post<any>(\`${endpoint}/generate\`, { student_id: studentId, term: selectedTerm });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      return api.post<any>(\`${endpoint}/download\`, { student_id: studentId, term: selectedTerm });
    },
  });

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return '#16A34A';
    if (grade >= 80) return '#3B82F6';
    if (grade >= 70) return '#D97706';
    if (grade >= 60) return '#EA580C';
    return '#DC2626';
  };

  const getLetterGrade = (grade: number) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Report Card</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.termButton} onPress={() => setShowTermPicker(true)}>
            <Text style={styles.termButtonText}>
              {terms.find(t => t.value === selectedTerm)?.label}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Student Info */}
      {reportCard?.student && (
        <View style={styles.studentCard}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{reportCard.student.name}</Text>
            <Text style={styles.studentMeta}>
              Grade {reportCard.student.grade_level} | {reportCard.student.class_name}
            </Text>
          </View>
          <View style={styles.gpaCard}>
            <Text style={styles.gpaLabel}>GPA</Text>
            <Text style={styles.gpaValue}>{reportCard.gpa || 'N/A'}</Text>
          </View>
        </View>
      )}

      {/* Grades Table */}
      <View style={styles.gradesCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Subject</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Grade</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Letter</Text>
        </View>
        {reportCard?.grades?.map((grade: any, index: number) => {
          const gradeColor = getGradeColor(grade.score);
          return (
            <View key={index} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.subjectName}>{grade.subject}</Text>
                <Text style={styles.teacherName}>{grade.teacher}</Text>
              </View>
              <Text style={[styles.gradeScore, { flex: 1, textAlign: 'center', color: gradeColor }]}>
                {grade.score}%
              </Text>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={[styles.letterBadge, { backgroundColor: gradeColor + '20' }]}>
                  <Text style={[styles.letterText, { color: gradeColor }]}>
                    {getLetterGrade(grade.score)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Comments */}
      {reportCard?.comments && (
        <View style={styles.commentsCard}>
          <Text style={styles.sectionTitle}>Teacher Comments</Text>
          <Text style={styles.commentText}>{reportCard.comments}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.generateButton]}
          onPress={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Generate PDF</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={() => downloadMutation.mutate()}
          disabled={downloadMutation.isPending}
        >
          {downloadMutation.isPending ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color="#3B82F6" />
              <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Download</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
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
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  studentMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  gpaCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  gpaLabel: {
    fontSize: 12,
    color: '#BFDBFE',
  },
  gpaValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gradesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  teacherName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  gradeScore: {
    fontSize: 16,
    fontWeight: '600',
  },
  letterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  letterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  commentsCard: {
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
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButton: {
    backgroundColor: '#3B82F6',
  },
  downloadButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
