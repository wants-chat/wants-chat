/**
 * Recruitment Jobs Component Generators (React Native)
 *
 * Generates components for managing active jobs, job filters, and job timelines
 * in recruitment/HR applications.
 */

export interface JobsRecruitmentOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate ActiveJobsRecruitment component (React Native)
 * Displays active job postings with status, applicants count, and actions
 */
export function generateActiveJobsRecruitment(options: JobsRecruitmentOptions = {}): string {
  const { componentName = 'ActiveJobsRecruitment', endpoint = '/recruitment/jobs' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onJobSelect?: (job: any) => void;
  onAddJob?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onJobSelect, onAddJob }) => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['recruitment-jobs', selectedStatus],
    queryFn: async () => {
      const params = selectedStatus !== 'all' ? \`?status=\${selectedStatus}\` : '';
      const response = await api.get<any>('${endpoint}' + params);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-jobs'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'closed', label: 'Closed' },
    { value: 'draft', label: 'Drafts' },
  ];

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    active: { label: 'Active', color: '#10B981', icon: 'checkmark-circle' },
    paused: { label: 'Paused', color: '#F59E0B', icon: 'pause-circle' },
    closed: { label: 'Closed', color: '#6B7280', icon: 'close-circle' },
    draft: { label: 'Draft', color: '#3B82F6', icon: 'create' },
  };

  const handleDeleteJob = (job: any) => {
    Alert.alert(
      'Delete Job',
      \`Are you sure you want to delete "\${job.title}"?\`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteJobMutation.mutate(job.id),
        },
      ]
    );
  };

  const renderJob = ({ item }: { item: any }) => {
    const status = statusConfig[item.status] || statusConfig.active;

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => onJobSelect?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.jobHeader}>
          <View style={styles.jobIcon}>
            <Ionicons name="briefcase" size={24} color="#3B82F6" />
          </View>
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.jobDepartment} numberOfLines={1}>
              {item.department || 'No Department'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => handleDeleteJob(item)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.jobMeta}>
          {item.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          )}
          {item.employment_type && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.employment_type}</Text>
            </View>
          )}
          {item.salary_range && (
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.salary_range}</Text>
            </View>
          )}
        </View>

        <View style={styles.jobFooter}>
          <View style={styles.applicantsBadge}>
            <Ionicons name="people" size={14} color="#7C3AED" />
            <Text style={styles.applicantsText}>
              {item.applicants_count || 0} applicants
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Ionicons name={status.icon as any} size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Active Jobs</Text>
          <Text style={styles.subtitle}>Manage your job postings</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddJob}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Post Job</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={statusFilters}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedStatus === item.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(item.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedStatus === item.value && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No jobs found</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={onAddJob}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Post Your First Job</Text>
            </TouchableOpacity>
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersList: {
    paddingHorizontal: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  jobDepartment: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  applicantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  applicantsText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7C3AED',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
});

export default ${componentName};
`;
}

/**
 * Generate JobFiltersRecruitment component (React Native)
 * Filters for recruitment job listings
 */
export function generateJobFiltersRecruitment(options: JobsRecruitmentOptions = {}): string {
  const { componentName = 'JobFiltersRecruitment' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterState {
  search: string;
  department: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  status: string;
  experience: string[];
}

interface ${componentName}Props {
  filters: Partial<FilterState>;
  onChange: (filters: Partial<FilterState>) => void;
  onClose?: () => void;
  visible?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ filters, onChange, onClose, visible = true }) => {
  const [localFilters, setLocalFilters] = useState<Partial<FilterState>>(filters);

  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product'];
  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'];
  const salaryRanges = ['$0 - $50k', '$50k - $80k', '$80k - $120k', '$120k - $150k', '$150k - $200k', '$200k+'];
  const experienceLevels = ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Lead', 'Manager', 'Director'];
  const statuses = ['Active', 'Paused', 'Closed', 'Draft'];

  const handleClearAll = () => {
    const clearedFilters = {
      search: '',
      department: '',
      location: '',
      employmentType: '',
      salaryRange: '',
      status: '',
      experience: [],
    };
    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
  };

  const handleApply = () => {
    onChange(localFilters);
    onClose?.();
  };

  const toggleExperience = (level: string) => {
    const current = localFilters.experience || [];
    const updated = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];
    setLocalFilters({ ...localFilters, experience: updated });
  };

  const activeFiltersCount = Object.entries(localFilters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value && value !== '';
  }).length;

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="options" size={20} color="#6B7280" />
          <Text style={styles.title}>Filters</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {activeFiltersCount > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={localFilters.search || ''}
            onChangeText={(text) => setLocalFilters({ ...localFilters, search: text })}
            placeholder="Search jobs..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Department</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={[
                    styles.chip,
                    localFilters.department === dept && styles.chipActive,
                  ]}
                  onPress={() => setLocalFilters({
                    ...localFilters,
                    department: localFilters.department === dept ? '' : dept,
                  })}
                >
                  <Text style={[
                    styles.chipText,
                    localFilters.department === dept && styles.chipTextActive,
                  ]}>
                    {dept}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            style={styles.input}
            value={localFilters.location || ''}
            onChangeText={(text) => setLocalFilters({ ...localFilters, location: text })}
            placeholder="City or Remote"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employment Type</Text>
          <View style={styles.chipsWrap}>
            {employmentTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  localFilters.employmentType === type && styles.chipActive,
                ]}
                onPress={() => setLocalFilters({
                  ...localFilters,
                  employmentType: localFilters.employmentType === type ? '' : type,
                })}
              >
                <Text style={[
                  styles.chipText,
                  localFilters.employmentType === type && styles.chipTextActive,
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Salary Range</Text>
          <View style={styles.chipsWrap}>
            {salaryRanges.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.chip,
                  localFilters.salaryRange === range && styles.chipActive,
                ]}
                onPress={() => setLocalFilters({
                  ...localFilters,
                  salaryRange: localFilters.salaryRange === range ? '' : range,
                })}
              >
                <Text style={[
                  styles.chipText,
                  localFilters.salaryRange === range && styles.chipTextActive,
                ]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.chipsWrap}>
            {statuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.chip,
                  localFilters.status === status && styles.chipActive,
                ]}
                onPress={() => setLocalFilters({
                  ...localFilters,
                  status: localFilters.status === status ? '' : status,
                })}
              >
                <Text style={[
                  styles.chipText,
                  localFilters.status === status && styles.chipTextActive,
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience Level</Text>
          <View style={styles.chipsWrap}>
            {experienceLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.chip,
                  (localFilters.experience || []).includes(level) && styles.chipActive,
                ]}
                onPress={() => toggleExperience(level)}
              >
                <Text style={[
                  styles.chipText,
                  (localFilters.experience || []).includes(level) && styles.chipTextActive,
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (onClose) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  clearText: {
    fontSize: 14,
    color: '#EF4444',
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  chipRow: {
    flexDirection: 'row',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#3B82F6',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate JobTimeline component (React Native)
 * Timeline view showing job lifecycle and milestones
 */
export function generateJobTimeline(options: JobsRecruitmentOptions = {}): string {
  const { componentName = 'JobTimeline', endpoint = '/recruitment/jobs' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  jobId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ jobId }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: timeline, isLoading, refetch } = useQuery({
    queryKey: ['job-timeline', jobId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${jobId}/timeline\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!jobId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const iconMap: Record<string, string> = {
    created: 'document-text',
    published: 'send',
    application: 'person-add',
    screening: 'people',
    interview: 'chatbubbles',
    assessment: 'clipboard',
    offer: 'ribbon',
    hired: 'checkmark-circle',
    scheduled: 'calendar',
    default: 'time',
  };

  const colorMap: Record<string, { bg: string; icon: string }> = {
    created: { bg: '#F3F4F6', icon: '#6B7280' },
    published: { bg: '#DBEAFE', icon: '#3B82F6' },
    application: { bg: '#F3E8FF', icon: '#A855F7' },
    screening: { bg: '#FEF9C3', icon: '#F59E0B' },
    interview: { bg: '#FFEDD5', icon: '#F97316' },
    assessment: { bg: '#E0E7FF', icon: '#6366F1' },
    offer: { bg: '#D1FAE5', icon: '#10B981' },
    hired: { bg: '#DCFCE7', icon: '#22C55E' },
    scheduled: { bg: '#CFFAFE', icon: '#06B6D4' },
    default: { bg: '#F3F4F6', icon: '#6B7280' },
  };

  const events = timeline?.length > 0 ? timeline : [
    { id: '1', type: 'created', title: 'Job Created', description: 'Job posting was created', date: '2024-01-15', user: 'John Doe' },
    { id: '2', type: 'published', title: 'Job Published', description: 'Job is now live', date: '2024-01-16', user: 'John Doe' },
    { id: '3', type: 'application', title: 'First Application', description: '15 applications received', date: '2024-01-18', user: null },
    { id: '4', type: 'screening', title: 'Screening Started', description: '8 candidates moved to screening', date: '2024-01-20', user: 'Jane Smith' },
    { id: '5', type: 'interview', title: 'Interviews Scheduled', description: '5 candidates scheduled', date: '2024-01-22', user: 'Jane Smith' },
  ];

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="git-branch-outline" size={20} color="#6B7280" />
        <Text style={styles.title}>Job Timeline</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {events.map((event: any, index: number) => {
          const iconName = iconMap[event.type] || iconMap.default;
          const colors = colorMap[event.type] || colorMap.default;
          const isLast = index === events.length - 1;

          return (
            <View key={event.id} style={styles.eventRow}>
              <View style={styles.timelineColumn}>
                <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
                  <Ionicons name={iconName as any} size={16} color={colors.icon} />
                </View>
                {!isLast && <View style={styles.line} />}
              </View>
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
                <Text style={styles.eventDescription}>{event.description}</Text>
                {event.user && (
                  <View style={styles.userRow}>
                    <Ionicons name="person-outline" size={12} color="#9CA3AF" />
                    <Text style={styles.userName}>by {event.user}</Text>
                  </View>
                )}
              </View>
            </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  eventRow: {
    flexDirection: 'row',
  },
  timelineColumn: {
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  eventContent: {
    flex: 1,
    paddingBottom: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  eventDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  eventDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  userName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
});

export default ${componentName};
`;
}
