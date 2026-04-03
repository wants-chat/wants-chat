/**
 * Job Search Component Generators for React Native
 *
 * Provides generators for React Native job search components:
 * - Job Search with keyword, location, and type filters
 * - Job List with FlatList and job cards
 * - Job Filters with experience level, salary range, and remote options
 */

export interface JobSearchOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate a job search component for React Native
 */
export function generateJobSearch(options: JobSearchOptions = {}): string {
  const componentName = options.componentName || 'JobSearch';

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  onSearch?: (filters: JobFilters) => void;
  style?: any;
}

interface JobFilters {
  keyword: string;
  location: string;
  type: string;
}

const JOB_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Internship', value: 'internship' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ onSearch, style }) => {
  const [filters, setFilters] = useState<JobFilters>({
    keyword: '',
    location: '',
    type: '',
  });
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const handleSearch = () => {
    onSearch?.(filters);
  };

  const selectedTypeLabel = JOB_TYPES.find(t => t.value === filters.type)?.label || 'All Types';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, styles.keywordInput]}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Job title, skills, or company"
            placeholderTextColor="#9CA3AF"
            value={filters.keyword}
            onChangeText={(text) => setFilters({ ...filters, keyword: text })}
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, styles.locationInput]}>
          <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="City or Remote"
            placeholderTextColor="#9CA3AF"
            value={filters.location}
            onChangeText={(text) => setFilters({ ...filters, location: text })}
          />
        </View>

        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={styles.typeButton}
            onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            activeOpacity={0.7}
          >
            <Ionicons name="briefcase-outline" size={20} color="#6B7280" />
            <Text style={styles.typeButtonText} numberOfLines={1}>
              {selectedTypeLabel}
            </Text>
            <Ionicons
              name={showTypeDropdown ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showTypeDropdown && (
            <View style={styles.dropdown}>
              {JOB_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.dropdownItem,
                    filters.type === type.value && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setFilters({ ...filters, type: type.value });
                    setShowTypeDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      filters.type === type.value && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleSearch}
        activeOpacity={0.7}
      >
        <Ionicons name="search" size={20} color="#FFFFFF" />
        <Text style={styles.searchButtonText}>Search Jobs</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  keywordInput: {
    flex: 1,
  },
  locationInput: {
    flex: 1,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  typeContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  typeButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
  },
  dropdownItemTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

/**
 * Generate a job list component for React Native
 */
export function generateJobList(options: JobSearchOptions = {}): string {
  const { componentName = 'JobList', endpoint = '/jobs' } = options;

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
  filters?: any;
  onJobPress?: (job: any) => void;
  style?: any;
}

interface JobCardProps {
  job: any;
  onPress: () => void;
  onBookmark?: () => void;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  'full-time': { bg: '#DCFCE7', text: '#166534' },
  'part-time': { bg: '#DBEAFE', text: '#1E40AF' },
  'contract': { bg: '#F3E8FF', text: '#6B21A8' },
  'freelance': { bg: '#FFEDD5', text: '#C2410C' },
  'internship': { bg: '#CFFAFE', text: '#0E7490' },
};

const JobCard: React.FC<JobCardProps> = ({ job, onPress, onBookmark }) => {
  const typeStyle = TYPE_COLORS[job.type] || TYPE_COLORS['full-time'];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.companyInfo}>
          {job.company_logo ? (
            <Image
              source={{ uri: job.company_logo }}
              style={styles.companyLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.companyLogoPlaceholder}>
              <Ionicons name="business-outline" size={24} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle} numberOfLines={2}>
              {job.title}
            </Text>
            <Text style={styles.companyName}>{job.company_name}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {job.type && (
            <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
              <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>
                {job.type}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={onBookmark}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="bookmark-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metaRow}>
        {job.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{job.location}</Text>
          </View>
        )}
        {job.salary_range && (
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{job.salary_range}</Text>
          </View>
        )}
        {job.posted_at && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{job.posted_at}</Text>
          </View>
        )}
      </View>

      {job.skills && job.skills.length > 0 && (
        <View style={styles.skillsRow}>
          {job.skills.slice(0, 5).map((skill: string, index: number) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({
  filters,
  onJobPress,
  style,
}) => {
  const navigation = useNavigation();

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleJobPress = useCallback((job: any) => {
    if (onJobPress) {
      onJobPress(job);
    } else {
      navigation.navigate('JobDetail' as never, { id: job.id } as never);
    }
  }, [onJobPress, navigation]);

  const handleBookmark = useCallback((job: any) => {
    // TODO: Implement bookmark functionality
    console.log('Bookmark job:', job.id);
  }, []);

  const renderJob = useCallback(({ item }: { item: any }) => (
    <JobCard
      job={item}
      onPress={() => handleJobPress(item)}
      onBookmark={() => handleBookmark(item)}
    />
  ), [handleJobPress, handleBookmark]);

  const keyExtractor = useCallback((item: any) => item.id?.toString(), []);

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
        <Text style={styles.errorText}>Failed to load jobs.</Text>
      </View>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No jobs found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your search criteria</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      renderItem={renderJob}
      keyExtractor={keyExtractor}
      contentContainerStyle={[styles.listContent, style]}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  companyInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  companyLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookmarkButton: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  skillBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillText: {
    fontSize: 12,
    color: '#4B5563',
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
 * Generate a job filters component for React Native
 */
export function generateJobFilters(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'JobFilters';

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  filters: any;
  onChange: (filters: any) => void;
  onClose?: () => void;
  style?: any;
}

const EXPERIENCE_LEVELS = [
  'Entry Level',
  'Mid Level',
  'Senior Level',
  'Director',
  'Executive',
];

const SALARY_RANGES = [
  '$0 - $50k',
  '$50k - $80k',
  '$80k - $120k',
  '$120k - $150k',
  '$150k+',
];

const DATE_POSTED_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  filters,
  onChange,
  onClose,
  style,
}) => {
  const toggleExperience = (level: string) => {
    const current = filters.experience || [];
    const updated = current.includes(level)
      ? current.filter((l: string) => l !== level)
      : [...current, level];
    onChange({ ...filters, experience: updated });
  };

  const toggleSalary = (range: string) => {
    const current = filters.salary || [];
    const updated = current.includes(range)
      ? current.filter((r: string) => r !== range)
      : [...current, range];
    onChange({ ...filters, salary: updated });
  };

  const clearAll = () => {
    onChange({});
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Ionicons name="options-outline" size={20} color="#111827" />
          <Text style={styles.title}>Filters</Text>
        </View>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Posted */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Posted</Text>
          <View style={styles.optionsRow}>
            {DATE_POSTED_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dateOption,
                  (filters.posted || '') === option.value && styles.dateOptionSelected,
                ]}
                onPress={() => onChange({ ...filters, posted: option.value })}
              >
                <Text
                  style={[
                    styles.dateOptionText,
                    (filters.posted || '') === option.value && styles.dateOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Experience Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience Level</Text>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              style={styles.checkboxRow}
              onPress={() => toggleExperience(level)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  (filters.experience || []).includes(level) && styles.checkboxChecked,
                ]}
              >
                {(filters.experience || []).includes(level) && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Salary Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Salary Range</Text>
          {SALARY_RANGES.map((range) => (
            <TouchableOpacity
              key={range}
              style={styles.checkboxRow}
              onPress={() => toggleSalary(range)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  (filters.salary || []).includes(range) && styles.checkboxChecked,
                ]}
              >
                {(filters.salary || []).includes(range) && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{range}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Remote Only */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Remote Only</Text>
            <Switch
              value={filters.remote || false}
              onValueChange={(value) => onChange({ ...filters, remote: value })}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={filters.remote ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
        </View>
      </ScrollView>

      {onClose && (
        <TouchableOpacity style={styles.applyButton} onPress={onClose}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  clearText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  dateOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  dateOptionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  dateOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 15,
    color: '#374151',
  },
  applyButton: {
    backgroundColor: '#3B82F6',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
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
