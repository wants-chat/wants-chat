/**
 * Survey Component Generators (React Native)
 *
 * Generates survey and feedback components including:
 * - SurveyBuilder: Create and edit surveys with question management
 * - SurveyFilters: Filter surveys by status, date, type
 * - SurveyForm: Render and submit survey responses
 * - SurveyHeader: Display survey info and controls
 * - SurveyStats: Overview statistics for surveys
 */

export interface SurveyOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

/**
 * Generate a SurveyBuilder component for creating and editing surveys
 */
export function generateSurveyBuilder(options: SurveyOptions = {}): string {
  const {
    componentName = 'SurveyBuilder',
    endpoint = '/surveys',
    title = 'Create Survey',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'single-choice' | 'multiple-choice' | 'rating' | 'scale' | 'date' | 'number';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

interface Survey {
  id?: string;
  title: string;
  description?: string;
  questions: Question[];
  status: 'draft' | 'active' | 'closed';
  startsAt?: string;
  endsAt?: string;
}

interface ${componentName}Props {
  surveyId?: string;
  onSave?: (survey: Survey) => void;
  onPreview?: (survey: Survey) => void;
}

const questionTypes = [
  { type: 'text', label: 'Short Text', icon: 'text' as const },
  { type: 'textarea', label: 'Long Text', icon: 'document-text' as const },
  { type: 'single-choice', label: 'Single Choice', icon: 'radio-button-on' as const },
  { type: 'multiple-choice', label: 'Multiple Choice', icon: 'checkbox' as const },
  { type: 'rating', label: 'Star Rating', icon: 'star' as const },
  { type: 'scale', label: 'Number Scale', icon: 'analytics' as const },
  { type: 'date', label: 'Date', icon: 'calendar' as const },
  { type: 'number', label: 'Number', icon: 'keypad' as const },
];

const ${componentName}: React.FC<${componentName}Props> = ({ surveyId, onSave, onPreview }) => {
  const queryClient = useQueryClient();
  const [survey, setSurvey] = useState<Survey>({
    title: '',
    description: '',
    questions: [],
    status: 'draft',
  });
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      if (!surveyId) return null;
      const response = await api.get<any>(\`${endpoint}/\${surveyId}\`);
      const data = response?.data || response;
      if (data) setSurvey(data);
      return data;
    },
    enabled: !!surveyId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Survey) => {
      if (surveyId) {
        return api.put<any>(\`${endpoint}/\${surveyId}\`, data);
      }
      return api.post<any>('${endpoint}', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      if (onSave) onSave(survey);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save survey. Please try again.');
    },
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addQuestion = useCallback((type: Question['type']) => {
    const newQuestion: Question = {
      id: generateId(),
      type,
      title: '',
      required: false,
      options: type.includes('choice') ? ['Option 1', 'Option 2'] : undefined,
      min: type === 'scale' ? 1 : undefined,
      max: type === 'scale' ? 10 : undefined,
    };
    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setExpandedQuestion(newQuestion.id);
    setShowTypeSelector(false);
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, ...updates } : q),
    }));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    Alert.alert('Delete Question', 'Are you sure you want to delete this question?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setSurvey(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== id),
          }));
        },
      },
    ]);
  }, []);

  const moveQuestion = useCallback((id: string, direction: 'up' | 'down') => {
    setSurvey(prev => {
      const index = prev.questions.findIndex(q => q.id === id);
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === prev.questions.length - 1)) {
        return prev;
      }
      const questions = [...prev.questions];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
      return { ...prev, questions };
    });
  }, []);

  const addOption = useCallback((questionId: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        return { ...q, options: [...(q.options || []), \`Option \${(q.options?.length || 0) + 1}\`] };
      }),
    }));
  }, []);

  const updateOption = useCallback((questionId: string, index: number, value: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        const options = [...(q.options || [])];
        options[index] = value;
        return { ...q, options };
      }),
    }));
  }, []);

  const removeOption = useCallback((questionId: string, index: number) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        const options = (q.options || []).filter((_, i) => i !== index);
        return { ...q, options };
      }),
    }));
  }, []);

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
        <Text style={styles.headerTitle}>${title}</Text>
        <View style={styles.headerActions}>
          {onPreview && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => onPreview(survey)}
            >
              <Ionicons name="eye-outline" size={18} color="#374151" />
              <Text style={styles.secondaryButtonText}>Preview</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.primaryButton, saveMutation.isPending && styles.disabledButton]}
            onPress={() => saveMutation.mutate(survey)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="save-outline" size={18} color="#FFFFFF" />
            )}
            <Text style={styles.primaryButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Survey Details */}
      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Survey Title</Text>
          <TextInput
            style={styles.input}
            value={survey.title}
            onChangeText={(text) => setSurvey(prev => ({ ...prev, title: text }))}
            placeholder="Enter survey title..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={survey.description || ''}
            onChangeText={(text) => setSurvey(prev => ({ ...prev, description: text }))}
            placeholder="Describe the purpose of this survey..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            {['draft', 'active', 'closed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  survey.status === status && styles.statusOptionActive,
                ]}
                onPress={() => setSurvey(prev => ({ ...prev, status: status as Survey['status'] }))}
              >
                <Text
                  style={[
                    styles.statusText,
                    survey.status === status && styles.statusTextActive,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Questions */}
      <View style={styles.questionsHeader}>
        <Text style={styles.sectionTitle}>Questions</Text>
        <Text style={styles.questionCount}>{survey.questions.length} questions</Text>
      </View>

      {survey.questions.map((question, index) => {
        const typeConfig = questionTypes.find(t => t.type === question.type);
        const isExpanded = expandedQuestion === question.id;

        return (
          <View key={question.id} style={styles.questionCard}>
            <TouchableOpacity
              style={styles.questionHeader}
              onPress={() => setExpandedQuestion(isExpanded ? null : question.id)}
            >
              <View style={styles.questionIcon}>
                <Ionicons name={typeConfig?.icon || 'help'} size={18} color="#3B82F6" />
              </View>
              <View style={styles.questionInfo}>
                <Text style={styles.questionTitle} numberOfLines={1}>
                  {question.title || \`Question \${index + 1}\`}
                  {question.required && <Text style={styles.required}> *</Text>}
                </Text>
                <Text style={styles.questionType}>{typeConfig?.label}</Text>
              </View>
              <View style={styles.questionActions}>
                <TouchableOpacity
                  onPress={() => moveQuestion(question.id, 'up')}
                  disabled={index === 0}
                  style={styles.actionButton}
                >
                  <Ionicons name="chevron-up" size={20} color={index === 0 ? '#D1D5DB' : '#6B7280'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => moveQuestion(question.id, 'down')}
                  disabled={index === survey.questions.length - 1}
                  style={styles.actionButton}
                >
                  <Ionicons name="chevron-down" size={20} color={index === survey.questions.length - 1 ? '#D1D5DB' : '#6B7280'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteQuestion(question.id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.questionEditor}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Question</Text>
                  <TextInput
                    style={styles.input}
                    value={question.title}
                    onChangeText={(text) => updateQuestion(question.id, { title: text })}
                    placeholder="Enter your question..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description (optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={question.description || ''}
                    onChangeText={(text) => updateQuestion(question.id, { description: text })}
                    placeholder="Add helper text..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {question.type.includes('choice') && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Options</Text>
                    {question.options?.map((option, optIndex) => (
                      <View key={optIndex} style={styles.optionRow}>
                        <TextInput
                          style={[styles.input, styles.optionInput]}
                          value={option}
                          onChangeText={(text) => updateOption(question.id, optIndex, text)}
                        />
                        <TouchableOpacity
                          onPress={() => removeOption(question.id, optIndex)}
                          disabled={(question.options?.length || 0) <= 2}
                          style={styles.removeOption}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color={(question.options?.length || 0) <= 2 ? '#D1D5DB' : '#EF4444'}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.addOptionButton}
                      onPress={() => addOption(question.id)}
                    >
                      <Ionicons name="add" size={18} color="#3B82F6" />
                      <Text style={styles.addOptionText}>Add Option</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {question.type === 'scale' && (
                  <View style={styles.scaleSettings}>
                    <View style={styles.scaleInput}>
                      <Text style={styles.label}>Min Value</Text>
                      <TextInput
                        style={styles.input}
                        value={String(question.min || 1)}
                        onChangeText={(text) => updateQuestion(question.id, { min: parseInt(text) || 1 })}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.scaleInput}>
                      <Text style={styles.label}>Max Value</Text>
                      <TextInput
                        style={styles.input}
                        value={String(question.max || 10)}
                        onChangeText={(text) => updateQuestion(question.id, { max: parseInt(text) || 10 })}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.requiredToggle}
                  onPress={() => updateQuestion(question.id, { required: !question.required })}
                >
                  <Ionicons
                    name={question.required ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={question.required ? '#3B82F6' : '#9CA3AF'}
                  />
                  <Text style={styles.requiredText}>Required question</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      {/* Add Question */}
      <TouchableOpacity
        style={styles.addQuestionButton}
        onPress={() => setShowTypeSelector(!showTypeSelector)}
      >
        <Ionicons name="add" size={24} color="#3B82F6" />
        <Text style={styles.addQuestionText}>Add Question</Text>
      </TouchableOpacity>

      {showTypeSelector && (
        <View style={styles.typeSelector}>
          {questionTypes.map(({ type, label, icon }) => (
            <TouchableOpacity
              key={type}
              style={styles.typeOption}
              onPress={() => addQuestion(type as Question['type'])}
            >
              <Ionicons name={icon} size={24} color="#3B82F6" />
              <Text style={styles.typeLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  statusOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  statusTextActive: {
    color: '#3B82F6',
  },
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  questionCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  questionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionInfo: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  required: {
    color: '#EF4444',
  },
  questionType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  questionActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 6,
  },
  questionEditor: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    marginRight: 8,
  },
  removeOption: {
    padding: 4,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  addOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  scaleSettings: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  scaleInput: {
    flex: 1,
  },
  requiredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
  },
  requiredText: {
    fontSize: 14,
    color: '#374151',
  },
  addQuestionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  addQuestionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3B82F6',
  },
  typeSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeOption: {
    width: '25%',
    alignItems: 'center',
    padding: 12,
  },
  typeLabel: {
    fontSize: 12,
    color: '#374151',
    marginTop: 6,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ${componentName};
`;
}

/**
 * Generate a SurveyFilters component for filtering surveys
 */
export function generateSurveyFilters(options: SurveyOptions = {}): string {
  const { componentName = 'SurveyFilters' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterValues {
  search: string;
  status: string;
  type: string;
  dateFrom: string;
  dateTo: string;
}

interface ${componentName}Props {
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  type: '',
  dateFrom: '',
  dateTo: '',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: string) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
    setShowFilters(false);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = currentFilters.status || currentFilters.type || currentFilters.dateFrom || currentFilters.dateTo;
  const activeFilterCount = [currentFilters.status, currentFilters.type, currentFilters.dateFrom, currentFilters.dateTo].filter(Boolean).length;

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'poll', label: 'Poll' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'research', label: 'Research' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={currentFilters.search}
            onChangeText={(text) => updateFilter('search', text)}
            placeholder="Search surveys..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {currentFilters.search ? (
            <TouchableOpacity onPress={() => updateFilter('search', '')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={20} color={hasActiveFilters ? '#3B82F6' : '#6B7280'} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.optionsContainer}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      currentFilters.status === option.value && styles.filterOptionActive,
                    ]}
                    onPress={() => updateFilter('status', option.value)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        currentFilters.status === option.value && styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Type</Text>
              <View style={styles.optionsContainer}>
                {typeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      currentFilters.type === option.value && styles.filterOptionActive,
                    ]}
                    onPress={() => updateFilter('type', option.value)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        currentFilters.type === option.value && styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateInput}>
                  <Text style={styles.dateInputLabel}>From</Text>
                  <TextInput
                    style={styles.input}
                    value={currentFilters.dateFrom}
                    onChangeText={(text) => updateFilter('dateFrom', text)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.dateInput}>
                  <Text style={styles.dateInputLabel}>To</Text>
                  <TextInput
                    style={styles.input}
                    value={currentFilters.dateTo}
                    onChangeText={(text) => updateFilter('dateTo', text)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleSearch}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#EFF6FF',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  clearText: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterOptionActive: {
    backgroundColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

/**
 * Generate a SurveyForm component for rendering and submitting surveys
 */
export function generateSurveyForm(options: SurveyOptions = {}): string {
  const {
    componentName = 'SurveyForm',
    endpoint = '/surveys',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'single-choice' | 'multiple-choice' | 'rating' | 'scale' | 'date' | 'number';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface ${componentName}Props {
  surveyId: string;
  onComplete?: (responses: Record<string, any>) => void;
  showProgress?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  surveyId,
  onComplete,
  showProgress = true,
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${surveyId}\`);
      return response?.data || response;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return api.post<any>(\`${endpoint}/\${surveyId}/responses\`, { responses: data });
    },
    onSuccess: () => {
      setSubmitted(true);
      if (onComplete) onComplete(responses);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit survey. Please try again.');
    },
  });

  const updateResponse = useCallback((questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  }, []);

  const toggleMultipleChoice = useCallback((questionId: string, option: string) => {
    setResponses(prev => {
      const current = prev[questionId] || [];
      const updated = current.includes(option)
        ? current.filter((o: string) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  }, []);

  const validateStep = useCallback(() => {
    if (!survey) return false;
    const question = survey.questions[currentStep];
    if (!question) return true;

    if (question.required) {
      const value = responses[question.id];
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        setErrors(prev => ({ ...prev, [question.id]: 'This question is required' }));
        return false;
      }
    }
    return true;
  }, [survey, currentStep, responses]);

  const handleNext = useCallback(() => {
    if (validateStep() && survey) {
      if (currentStep < survey.questions.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        submitMutation.mutate(responses);
      }
    }
  }, [validateStep, survey, currentStep, responses, submitMutation]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!survey) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>Survey not found</Text>
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        </View>
        <Text style={styles.successTitle}>Thank You!</Text>
        <Text style={styles.successText}>Your response has been recorded successfully.</Text>
      </View>
    );
  }

  const question = survey.questions[currentStep];
  const progress = ((currentStep + 1) / survey.questions.length) * 100;
  const value = responses[question?.id];
  const error = errors[question?.id];

  const renderQuestion = () => {
    if (!question) return null;

    switch (question.type) {
      case 'text':
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value || ''}
            onChangeText={(text) => updateResponse(question.id, text)}
            placeholder="Your answer..."
            placeholderTextColor="#9CA3AF"
          />
        );

      case 'textarea':
        return (
          <TextInput
            style={[styles.input, styles.textArea, error && styles.inputError]}
            value={value || ''}
            onChangeText={(text) => updateResponse(question.id, text)}
            placeholder="Your answer..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />
        );

      case 'single-choice':
        return (
          <View style={styles.optionsContainer}>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, value === option && styles.optionButtonActive]}
                onPress={() => updateResponse(question.id, option)}
              >
                <View style={[styles.radio, value === option && styles.radioActive]}>
                  {value === option && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.optionText, value === option && styles.optionTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'multiple-choice':
        return (
          <View style={styles.optionsContainer}>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  (value || []).includes(option) && styles.optionButtonActive,
                ]}
                onPress={() => toggleMultipleChoice(question.id, option)}
              >
                <Ionicons
                  name={(value || []).includes(option) ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={(value || []).includes(option) ? '#3B82F6' : '#9CA3AF'}
                />
                <Text
                  style={[
                    styles.optionText,
                    (value || []).includes(option) && styles.optionTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'rating':
        return (
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => updateResponse(question.id, star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={(value || 0) >= star ? 'star' : 'star-outline'}
                  size={36}
                  color={(value || 0) >= star ? '#F59E0B' : '#D1D5DB'}
                />
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'scale':
        const min = question.min || 1;
        const max = question.max || 10;
        return (
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scaleContainer}
            >
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => updateResponse(question.id, num)}
                  style={[styles.scaleButton, value === num && styles.scaleButtonActive]}
                >
                  <Text style={[styles.scaleText, value === num && styles.scaleTextActive]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>Not at all likely</Text>
              <Text style={styles.scaleLabel}>Extremely likely</Text>
            </View>
          </View>
        );

      case 'date':
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value || ''}
            onChangeText={(text) => updateResponse(question.id, text)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
        );

      case 'number':
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value?.toString() || ''}
            onChangeText={(text) => updateResponse(question.id, text)}
            placeholder="Enter a number..."
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.surveyTitle}>{survey.title}</Text>
        {survey.description && (
          <Text style={styles.surveyDescription}>{survey.description}</Text>
        )}
      </View>

      {/* Progress */}
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Question {currentStep + 1} of {survey.questions.length}
            </Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
          </View>
        </View>
      )}

      {/* Question */}
      <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>
            {question?.title}
            {question?.required && <Text style={styles.required}> *</Text>}
          </Text>
          {question?.description && (
            <Text style={styles.questionDescription}>{question.description}</Text>
          )}

          <View style={styles.answerContainer}>
            {renderQuestion()}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={handleBack}
          disabled={currentStep === 0}
          style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
        >
          <Ionicons name="chevron-back" size={20} color={currentStep === 0 ? '#D1D5DB' : '#374151'} />
          <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          disabled={submitMutation.isPending}
          style={styles.nextButton}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === survey.questions.length - 1 ? 'Submit' : 'Next'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  surveyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  surveyDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 26,
  },
  required: {
    color: '#EF4444',
  },
  questionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  answerContainer: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  optionButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  optionTextActive: {
    color: '#1D4ED8',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 8,
  },
  scaleContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  scaleButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  scaleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  scaleTextActive: {
    color: '#FFFFFF',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  scaleLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: '#D1D5DB',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 4,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

/**
 * Generate a SurveyHeader component for displaying survey info
 */
export function generateSurveyHeader(options: SurveyOptions = {}): string {
  const {
    componentName = 'SurveyHeader',
    endpoint = '/surveys',
  } = options;

  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  surveyId: string;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onViewResponses?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  surveyId,
  onEdit,
  onShare,
  onDelete,
  onViewResponses,
}) => {
  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${surveyId}\`);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  if (!survey) {
    return null;
  }

  const statusConfig: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
    draft: { label: 'Draft', icon: 'alert-circle', color: '#F59E0B', bgColor: '#FEF3C7' },
    active: { label: 'Active', icon: 'checkmark-circle', color: '#10B981', bgColor: '#D1FAE5' },
    closed: { label: 'Closed', icon: 'close-circle', color: '#6B7280', bgColor: '#F3F4F6' },
  };

  const status = statusConfig[survey.status] || statusConfig.draft;

  const formatDate = (date: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Main Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>{survey.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
              <Ionicons name={status.icon} size={14} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
        </View>

        {survey.description && (
          <Text style={styles.description} numberOfLines={2}>{survey.description}</Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Ionicons name="create-outline" size={18} color="#374151" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
              <Ionicons name="share-social-outline" size={18} color="#374151" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          )}
          {onViewResponses && (
            <TouchableOpacity style={styles.primaryAction} onPress={onViewResponses}>
              <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Responses</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="list" size={18} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.statValue}>
              {survey.questionsCount || survey.questions?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="people" size={18} color="#10B981" />
          </View>
          <View>
            <Text style={styles.statValue}>{survey.responsesCount || 0}</Text>
            <Text style={styles.statLabel}>Responses</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="calendar" size={18} color="#8B5CF6" />
          </View>
          <View>
            <Text style={styles.statValue} numberOfLines={1}>{formatDate(survey.startsAt)}</Text>
            <Text style={styles.statLabel}>Start Date</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={18} color="#F59E0B" />
          </View>
          <View>
            <Text style={styles.statValue} numberOfLines={1}>{formatDate(survey.endsAt)}</Text>
            <Text style={styles.statLabel}>End Date</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    gap: 6,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  statsBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generate a SurveyStats component for displaying survey statistics
 */
export function generateSurveyStats(options: SurveyOptions = {}): string {
  const {
    componentName = 'SurveyStats',
    endpoint = '/surveys/stats',
    title = 'Survey Overview',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface StatsData {
  totalSurveys?: number;
  activeSurveys?: number;
  totalResponses?: number;
  averageCompletionRate?: number;
  averageResponseTime?: string;
  recentActivity?: Array<{
    id: string;
    surveyTitle: string;
    responseCount: number;
    date: string;
  }>;
}

interface ${componentName}Props {
  onActivityPress?: (activityId: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onActivityPress }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['survey-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {};
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const statCards = [
    {
      label: 'Total Surveys',
      value: stats?.totalSurveys || 0,
      icon: 'document-text' as const,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      label: 'Active Surveys',
      value: stats?.activeSurveys || 0,
      icon: 'checkmark-circle' as const,
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      label: 'Total Responses',
      value: stats?.totalResponses || 0,
      icon: 'people' as const,
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
    },
    {
      label: 'Avg. Completion',
      value: \`\${(stats?.averageCompletionRate || 0).toFixed(1)}%\`,
      icon: 'trending-up' as const,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
  ];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderActivityItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => onActivityPress?.(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle} numberOfLines={1}>{item.surveyTitle}</Text>
        <Text style={styles.activitySubtitle}>{item.responseCount} new responses</Text>
      </View>
      <View style={styles.activityDate}>
        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
        <Text style={styles.activityDateText}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>${title}</Text>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
              <Ionicons name={stat.icon} size={22} color={stat.color} />
            </View>
            <Text style={styles.statValue}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Charts Placeholder */}
      <View style={styles.chartsRow}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Response Trend</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={32} color="#D1D5DB" />
            <Text style={styles.chartPlaceholderText}>Chart placeholder</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Status Distribution</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="pie-chart" size={32} color="#D1D5DB" />
            <Text style={styles.chartPlaceholderText}>Chart placeholder</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Ionicons name="pulse" size={18} color="#111827" />
            <Text style={styles.activityHeaderText}>Recent Activity</Text>
          </View>
          <FlatList
            data={stats.recentActivity}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.activitySeparator} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3B82F6"
                colors={['#3B82F6']}
              />
            }
          />
        </View>
      )}
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
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
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
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  chartsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 12,
    marginTop: 16,
  },
  chartCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  activitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  activityHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  activitySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  activityDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityDateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activitySeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 16,
  },
});

export default ${componentName};
`;
}
