/**
 * Recruitment Candidates Component Generators (React Native)
 *
 * Generates components for candidate management including filters,
 * placement pipeline, and interview scheduling.
 */

export interface CandidatesRecruitmentOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate CandidateFilters component (React Native)
 * Advanced filtering for candidate search and management
 */
export function generateCandidateFilters(options: CandidatesRecruitmentOptions = {}): string {
  const { componentName = 'CandidateFilters' } = options;

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
  status: string[];
  stage: string[];
  location: string;
  experience: string;
  education: string;
  skills: string[];
  rating: number | null;
  source: string;
  jobId: string;
}

interface ${componentName}Props {
  filters: Partial<FilterState>;
  onChange: (filters: Partial<FilterState>) => void;
  jobs?: Array<{ id: string; title: string }>;
  onClose?: () => void;
  visible?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  filters,
  onChange,
  jobs = [],
  onClose,
  visible = true,
}) => {
  const [localFilters, setLocalFilters] = useState<Partial<FilterState>>(filters);
  const [skillInput, setSkillInput] = useState('');

  const statusOptions = [
    { value: 'new', label: 'New', color: '#3B82F6' },
    { value: 'screening', label: 'Screening', color: '#F59E0B' },
    { value: 'interviewing', label: 'Interviewing', color: '#A855F7' },
    { value: 'offered', label: 'Offered', color: '#10B981' },
    { value: 'hired', label: 'Hired', color: '#22C55E' },
    { value: 'rejected', label: 'Rejected', color: '#EF4444' },
  ];

  const stageOptions = [
    'Application Review',
    'Phone Screen',
    'Technical Interview',
    'Hiring Manager Interview',
    'Panel Interview',
    'Final Interview',
    'Reference Check',
    'Offer',
  ];

  const experienceOptions = [
    { value: '0-1', label: '0-1 years' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' },
  ];

  const educationOptions = [
    'High School',
    "Associate's",
    "Bachelor's",
    "Master's",
    'PhD',
    'Other',
  ];

  const sourceOptions = ['LinkedIn', 'Indeed', 'Company Website', 'Referral', 'Job Board', 'Recruiter', 'Other'];

  const toggleStatus = (value: string) => {
    const current = localFilters.status || [];
    const updated = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    setLocalFilters({ ...localFilters, status: updated });
  };

  const toggleStage = (stage: string) => {
    const current = localFilters.stage || [];
    const updated = current.includes(stage)
      ? current.filter((s) => s !== stage)
      : [...current, stage];
    setLocalFilters({ ...localFilters, stage: updated });
  };

  const addSkill = () => {
    if (skillInput.trim() && !(localFilters.skills || []).includes(skillInput.trim())) {
      setLocalFilters({
        ...localFilters,
        skills: [...(localFilters.skills || []), skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setLocalFilters({
      ...localFilters,
      skills: (localFilters.skills || []).filter((s) => s !== skill),
    });
  };

  const handleClearAll = () => {
    const clearedFilters: Partial<FilterState> = {
      search: '',
      status: [],
      stage: [],
      location: '',
      experience: '',
      education: '',
      skills: [],
      rating: null,
      source: '',
      jobId: '',
    };
    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
  };

  const handleApply = () => {
    onChange(localFilters);
    onClose?.();
  };

  const activeFiltersCount = Object.entries(localFilters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value === null) return false;
    return value && value !== '';
  }).length;

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="filter" size={20} color="#6B7280" />
          <Text style={styles.title}>Filter Candidates</Text>
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
            placeholder="Search by name, email..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {jobs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Position</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, !localFilters.jobId && styles.chipActive]}
                  onPress={() => setLocalFilters({ ...localFilters, jobId: '' })}
                >
                  <Text style={[styles.chipText, !localFilters.jobId && styles.chipTextActive]}>
                    All Positions
                  </Text>
                </TouchableOpacity>
                {jobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    style={[styles.chip, localFilters.jobId === job.id && styles.chipActive]}
                    onPress={() => setLocalFilters({ ...localFilters, jobId: job.id })}
                  >
                    <Text style={[styles.chipText, localFilters.jobId === job.id && styles.chipTextActive]}>
                      {job.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.chipsWrap}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.chip,
                  (localFilters.status || []).includes(status.value) && {
                    backgroundColor: status.color + '20',
                    borderColor: status.color,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => toggleStatus(status.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    (localFilters.status || []).includes(status.value) && { color: status.color },
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            style={styles.input}
            value={localFilters.location || ''}
            onChangeText={(text) => setLocalFilters({ ...localFilters, location: text })}
            placeholder="City, State, or Remote"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.chipsWrap}>
            {experienceOptions.map((exp) => (
              <TouchableOpacity
                key={exp.value}
                style={[
                  styles.chip,
                  localFilters.experience === exp.value && styles.chipActive,
                ]}
                onPress={() => setLocalFilters({
                  ...localFilters,
                  experience: localFilters.experience === exp.value ? '' : exp.value,
                })}
              >
                <Text style={[
                  styles.chipText,
                  localFilters.experience === exp.value && styles.chipTextActive,
                ]}>
                  {exp.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pipeline Stage</Text>
          <View style={styles.chipsWrap}>
            {stageOptions.map((stage) => (
              <TouchableOpacity
                key={stage}
                style={[
                  styles.chip,
                  (localFilters.stage || []).includes(stage) && styles.chipActive,
                ]}
                onPress={() => toggleStage(stage)}
              >
                <Text style={[
                  styles.chipText,
                  (localFilters.stage || []).includes(stage) && styles.chipTextActive,
                ]}>
                  {stage}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.chipsWrap}>
            {educationOptions.map((edu) => (
              <TouchableOpacity
                key={edu}
                style={[
                  styles.chip,
                  localFilters.education === edu && styles.chipActive,
                ]}
                onPress={() => setLocalFilters({
                  ...localFilters,
                  education: localFilters.education === edu ? '' : edu,
                })}
              >
                <Text style={[
                  styles.chipText,
                  localFilters.education === edu && styles.chipTextActive,
                ]}>
                  {edu}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Source</Text>
          <View style={styles.chipsWrap}>
            {sourceOptions.map((src) => (
              <TouchableOpacity
                key={src}
                style={[
                  styles.chip,
                  localFilters.source === src && styles.chipActive,
                ]}
                onPress={() => setLocalFilters({
                  ...localFilters,
                  source: localFilters.source === src ? '' : src,
                })}
              >
                <Text style={[
                  styles.chipText,
                  localFilters.source === src && styles.chipTextActive,
                ]}>
                  {src}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillInputRow}>
            <TextInput
              style={styles.skillInput}
              value={skillInput}
              onChangeText={setSkillInput}
              placeholder="Add a skill..."
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={addSkill}
            />
            <TouchableOpacity style={styles.addSkillButton} onPress={addSkill}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {(localFilters.skills || []).length > 0 && (
            <View style={styles.skillsContainer}>
              {(localFilters.skills || []).map((skill) => (
                <View key={skill} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                  <TouchableOpacity onPress={() => removeSkill(skill)}>
                    <Ionicons name="close" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                onPress={() => setLocalFilters({
                  ...localFilters,
                  rating: localFilters.rating === rating ? null : rating,
                })}
                style={styles.starButton}
              >
                <Ionicons
                  name={(localFilters.rating || 0) >= rating ? 'star' : 'star-outline'}
                  size={28}
                  color={(localFilters.rating || 0) >= rating ? '#F59E0B' : '#D1D5DB'}
                />
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
  skillInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginRight: 8,
  },
  addSkillButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillTagText: {
    fontSize: 13,
    color: '#3B82F6',
    marginRight: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 4,
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
 * Generate PlacementPipeline component (React Native)
 * Horizontal scrolling pipeline for tracking candidates through stages
 */
export function generatePlacementPipeline(options: CandidatesRecruitmentOptions = {}): string {
  const { componentName = 'PlacementPipeline', endpoint = '/recruitment/candidates' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = SCREEN_WIDTH * 0.75;

interface ${componentName}Props {
  jobId?: string;
  onCandidateSelect?: (candidate: any) => void;
}

const pipelineStages = [
  { id: 'new', name: 'New Applications', color: 'blue' },
  { id: 'screening', name: 'Screening', color: 'yellow' },
  { id: 'interview', name: 'Interview', color: 'purple' },
  { id: 'assessment', name: 'Assessment', color: 'orange' },
  { id: 'offer', name: 'Offer', color: 'emerald' },
  { id: 'hired', name: 'Hired', color: 'green' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ jobId, onCandidateSelect }) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);

  const { data: candidates, isLoading, refetch } = useQuery({
    queryKey: ['pipeline-candidates', jobId],
    queryFn: async () => {
      const params = jobId ? \`?job_id=\${jobId}\` : '';
      const response = await api.get<any>('${endpoint}' + params);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.put('${endpoint}/' + id, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-candidates'] });
      setMoveModalVisible(false);
      setSelectedCandidate(null);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStageColor = (color: string): { bg: string; border: string; text: string } => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: '#DBEAFE', border: '#3B82F6', text: '#1D4ED8' },
      yellow: { bg: '#FEF9C3', border: '#F59E0B', text: '#B45309' },
      purple: { bg: '#F3E8FF', border: '#A855F7', text: '#7C3AED' },
      orange: { bg: '#FFEDD5', border: '#F97316', text: '#C2410C' },
      emerald: { bg: '#D1FAE5', border: '#10B981', text: '#047857' },
      green: { bg: '#DCFCE7', border: '#22C55E', text: '#15803D' },
    };
    return colors[color] || colors.blue;
  };

  const getCandidatesByStage = (stageId: string) =>
    candidates?.filter((c: any) => c.stage === stageId) || [];

  const handleCandidatePress = (candidate: any) => {
    onCandidateSelect?.(candidate);
  };

  const handleCandidateLongPress = (candidate: any) => {
    setSelectedCandidate(candidate);
    setMoveModalVisible(true);
  };

  const handleMoveToStage = (stageId: string) => {
    if (selectedCandidate) {
      updateStageMutation.mutate({ id: selectedCandidate.id, stage: stageId });
    }
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columnsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {pipelineStages.map((stage) => {
          const stageItems = getCandidatesByStage(stage.id);
          const stageColors = getStageColor(stage.color);

          return (
            <View key={stage.id} style={styles.column}>
              <View style={[styles.columnHeader, { backgroundColor: stageColors.bg, borderTopColor: stageColors.border }]}>
                <View style={styles.columnHeaderContent}>
                  <Text style={[styles.columnTitle, { color: stageColors.text }]}>{stage.name}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{stageItems.length}</Text>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
                {stageItems.map((candidate: any) => (
                  <TouchableOpacity
                    key={candidate.id}
                    style={styles.card}
                    onPress={() => handleCandidatePress(candidate)}
                    onLongPress={() => handleCandidateLongPress(candidate)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      {candidate.avatar ? (
                        <Image source={{ uri: candidate.avatar }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {candidate.name?.charAt(0) || 'C'}
                          </Text>
                        </View>
                      )}
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardName} numberOfLines={1}>
                          {candidate.name}
                        </Text>
                        <Text style={styles.cardPosition} numberOfLines={1}>
                          {candidate.position || candidate.job_title}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.moreButton}
                        onPress={() => handleCandidateLongPress(candidate)}
                      >
                        <Ionicons name="ellipsis-horizontal" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>

                    {candidate.rating > 0 && (
                      <View style={styles.ratingRow}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < candidate.rating ? 'star' : 'star-outline'}
                            size={14}
                            color={i < candidate.rating ? '#F59E0B' : '#D1D5DB'}
                          />
                        ))}
                      </View>
                    )}

                    <View style={styles.cardMeta}>
                      {candidate.email && (
                        <View style={styles.metaItem}>
                          <Ionicons name="mail-outline" size={12} color="#9CA3AF" />
                          <Text style={styles.metaText} numberOfLines={1}>
                            {candidate.email.length > 18
                              ? candidate.email.slice(0, 18) + '...'
                              : candidate.email}
                          </Text>
                        </View>
                      )}
                      {candidate.location && (
                        <View style={styles.metaItem}>
                          <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                          <Text style={styles.metaText}>{candidate.location}</Text>
                        </View>
                      )}
                    </View>

                    {candidate.skills && candidate.skills.length > 0 && (
                      <View style={styles.skillsRow}>
                        {candidate.skills.slice(0, 3).map((skill: string, i: number) => (
                          <View key={i} style={styles.skillBadge}>
                            <Text style={styles.skillText}>{skill}</Text>
                          </View>
                        ))}
                        {candidate.skills.length > 3 && (
                          <Text style={styles.moreSkills}>
                            +{candidate.skills.length - 3}
                          </Text>
                        )}
                      </View>
                    )}

                    <View style={styles.cardActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="eye-outline" size={14} color="#6B7280" />
                        <Text style={styles.actionText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                        <Text style={styles.actionText}>Schedule</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="chatbubble-outline" size={14} color="#6B7280" />
                        <Text style={styles.actionText}>Note</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}

                {stageItems.length === 0 && (
                  <View style={styles.emptyColumn}>
                    <Ionicons name="person-outline" size={32} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No candidates</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={moveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMoveModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMoveModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move to Stage</Text>
            {pipelineStages.map((stage) => {
              const stageColors = getStageColor(stage.color);
              const isCurrentStage = selectedCandidate?.stage === stage.id;

              return (
                <TouchableOpacity
                  key={stage.id}
                  style={[
                    styles.modalOption,
                    isCurrentStage && styles.modalOptionCurrent,
                  ]}
                  onPress={() => handleMoveToStage(stage.id)}
                  disabled={isCurrentStage || updateStageMutation.isPending}
                >
                  <View style={[styles.stageDot, { backgroundColor: stageColors.border }]} />
                  <Text style={[
                    styles.modalOptionText,
                    isCurrentStage && styles.modalOptionTextCurrent,
                  ]}>
                    {stage.name}
                  </Text>
                  {isCurrentStage && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setMoveModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  columnsContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  column: {
    width: COLUMN_WIDTH,
    marginHorizontal: 6,
    maxHeight: '100%',
  },
  columnHeader: {
    borderTopWidth: 4,
    borderRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  columnHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  cardsContainer: {
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 8,
    maxHeight: 500,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  cardPosition: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  moreButton: {
    padding: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cardMeta: {
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    alignItems: 'center',
  },
  skillBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 11,
    color: '#6B7280',
  },
  moreSkills: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  emptyColumn: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalOptionCurrent: {
    backgroundColor: '#EFF6FF',
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  modalOptionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  modalOptionTextCurrent: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  modalCancel: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCancelText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

/**
 * Generate InterviewSchedule component (React Native)
 * Calendar-based interview scheduling interface
 */
export function generateInterviewSchedule(options: CandidatesRecruitmentOptions = {}): string {
  const { componentName = 'InterviewSchedule', endpoint = '/recruitment/interviews' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
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
  candidateId?: string;
  jobId?: string;
  onAddInterview?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ candidateId, jobId, onAddInterview }) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: interviews, isLoading, refetch } = useQuery({
    queryKey: ['interviews', currentDate.toISOString(), candidateId, jobId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (candidateId) params.append('candidate_id', candidateId);
      if (jobId) params.append('job_id', jobId);
      params.append('month', (currentDate.getMonth() + 1).toString());
      params.append('year', currentDate.getFullYear().toString());
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const cancelInterviewMutation = useMutation({
    mutationFn: (id: string) => api.delete(\`${endpoint}/\${id}\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const interviewTypeConfig: Record<string, { icon: string; color: string; bg: string }> = {
    video: { icon: 'videocam', color: '#3B82F6', bg: '#DBEAFE' },
    phone: { icon: 'call', color: '#10B981', bg: '#D1FAE5' },
    onsite: { icon: 'business', color: '#A855F7', bg: '#F3E8FF' },
    panel: { icon: 'people', color: '#F97316', bg: '#FFEDD5' },
  };

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    scheduled: { color: '#3B82F6', bg: '#DBEAFE', label: 'Scheduled' },
    confirmed: { color: '#10B981', bg: '#D1FAE5', label: 'Confirmed' },
    completed: { color: '#6B7280', bg: '#F3F4F6', label: 'Completed' },
    cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled' },
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getInterviewsForDate = (date: Date) => {
    return (interviews || []).filter((interview: any) => {
      const interviewDate = new Date(interview.scheduled_at || interview.date);
      return interviewDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  const handleCancelInterview = (interview: any) => {
    Alert.alert(
      'Cancel Interview',
      'Are you sure you want to cancel this interview?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelInterviewMutation.mutate(interview.id),
        },
      ]
    );
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
        <View style={styles.headerTitle}>
          <Ionicons name="calendar" size={20} color="#6B7280" />
          <Text style={styles.title}>Interview Schedule</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddInterview}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth('prev')}>
          <Ionicons name="chevron-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth('next')}>
          <Ionicons name="chevron-forward" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        <View style={styles.weekDaysRow}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            const dayInterviews = getInterviewsForDate(day);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);
            const isSelected = selectedDate?.toDateString() === day.toDateString();

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !isCurrentMonthDay && styles.dayCellOutside,
                  isTodayDay && styles.dayCellToday,
                  isSelected && styles.dayCellSelected,
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text style={[
                  styles.dayNumber,
                  !isCurrentMonthDay && styles.dayNumberOutside,
                  isTodayDay && styles.dayNumberToday,
                ]}>
                  {day.getDate()}
                </Text>
                {dayInterviews.length > 0 && (
                  <View style={styles.interviewDots}>
                    {dayInterviews.slice(0, 3).map((interview: any, i: number) => {
                      const typeConfig = interviewTypeConfig[interview.type] || interviewTypeConfig.video;
                      return (
                        <View
                          key={i}
                          style={[styles.interviewDot, { backgroundColor: typeConfig.color }]}
                        />
                      );
                    })}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedDate && getInterviewsForDate(selectedDate).length > 0 && (
          <View style={styles.selectedDateInterviews}>
            <Text style={styles.selectedDateTitle}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            {getInterviewsForDate(selectedDate).map((interview: any) => {
              const typeConfig = interviewTypeConfig[interview.type] || interviewTypeConfig.video;
              const status = statusConfig[interview.status] || statusConfig.scheduled;

              return (
                <View key={interview.id} style={styles.interviewCard}>
                  <View style={styles.interviewHeader}>
                    <View style={[styles.typeIcon, { backgroundColor: typeConfig.bg }]}>
                      <Ionicons name={typeConfig.icon as any} size={20} color={typeConfig.color} />
                    </View>
                    <View style={styles.interviewInfo}>
                      <Text style={styles.interviewCandidate}>
                        {interview.candidate_name}
                      </Text>
                      <View style={styles.interviewMeta}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.interviewTime}>
                          {interview.time || '10:00 AM'}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                          <Text style={[styles.statusText, { color: status.color }]}>
                            {status.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.interviewActions}>
                    {interview.status === 'scheduled' && (
                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => handleCancelInterview(interview)}
                      >
                        <Ionicons name="close-circle-outline" size={22} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
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
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  weekDaysRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  dayCellOutside: {
    opacity: 0.3,
  },
  dayCellToday: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dayNumberOutside: {
    color: '#9CA3AF',
  },
  dayNumberToday: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  interviewDots: {
    flexDirection: 'row',
    marginTop: 4,
  },
  interviewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  selectedDateInterviews: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  selectedDateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  interviewCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  interviewHeader: {
    flexDirection: 'row',
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  interviewInfo: {
    flex: 1,
  },
  interviewCandidate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  interviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interviewTime: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  interviewActions: {
    justifyContent: 'center',
  },
  actionIconButton: {
    padding: 4,
  },
});

export default ${componentName};
`;
}
