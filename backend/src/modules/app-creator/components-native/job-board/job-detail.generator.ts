/**
 * Job Detail Component Generators for React Native
 *
 * Provides generators for React Native job detail components:
 * - Job Detail screen with full job information
 * - Apply Card component for job application CTA
 */

export interface JobDetailOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate a job detail screen component for React Native
 */
export function generateJobDetail(options: JobDetailOptions = {}): string {
  const { componentName = 'JobDetail', endpoint = '/jobs' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

type RouteParams = {
  JobDetail: { id: string };
};

interface ${componentName}Props {
  jobId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ jobId: propJobId }) => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'JobDetail'>>();
  const jobId = propJobId || route.params?.id;

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${jobId}\`);
      return response?.data || response;
    },
    enabled: !!jobId,
  });

  const handleApply = useCallback(() => {
    navigation.navigate('JobApplication' as never, { jobId } as never);
  }, [navigation, jobId]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: \`Check out this job: \${job?.title} at \${job?.company_name}\`,
        title: job?.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [job]);

  const handleBookmark = useCallback(() => {
    // TODO: Implement bookmark functionality
    console.log('Bookmark job:', jobId);
  }, [jobId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Job not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#3B82F6" />
            <Text style={styles.headerBackText}>Back to Jobs</Text>
          </TouchableOpacity>

          <View style={styles.jobHeader}>
            <View style={styles.companySection}>
              {job.company_logo ? (
                <Image
                  source={{ uri: job.company_logo }}
                  style={styles.companyLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.companyLogoPlaceholder}>
                  <Ionicons name="business-outline" size={32} color="#9CA3AF" />
                </View>
              )}
              <View style={styles.titleSection}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.companyName}>{job.company_name}</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
                <Ionicons name="bookmark-outline" size={24} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Meta Info */}
          <View style={styles.metaRow}>
            {job.location && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{job.location}</Text>
              </View>
            )}
            {job.type && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{job.type}</Text>
              </View>
            )}
            {job.salary_range && (
              <View style={styles.metaItem}>
                <Ionicons name="cash-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{job.salary_range}</Text>
              </View>
            )}
            {job.posted_at && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>Posted {job.posted_at}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {job.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </View>
        )}

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {job.requirements.map((req: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listItemText}>{req}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Responsibilities</Text>
            {job.responsibilities.map((resp: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listItemText}>{resp}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            <View style={styles.tagsContainer}>
              {job.benefits.map((benefit: string, index: number) => (
                <View key={index} style={styles.benefitTag}>
                  <Text style={styles.benefitTagText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.tagsContainer}>
              {job.skills.map((skill: string, index: number) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
          activeOpacity={0.7}
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerBackText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 4,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  companySection: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  companyLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginTop: 8,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benefitTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  benefitTagText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  skillTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skillTagText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
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

/**
 * Generate an apply card component for React Native
 */
export function generateApplyCard(options: JobDetailOptions = {}): string {
  const componentName = options.componentName || 'ApplyCard';

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Job {
  id: string;
  title: string;
  company_name: string;
  company_logo?: string;
  location?: string;
  type?: string;
  salary_range?: string;
  deadline?: string;
}

interface ${componentName}Props {
  job: Job;
  onApply?: () => void;
  style?: any;
}

const ${componentName}: React.FC<${componentName}Props> = ({ job, onApply, style }) => {
  const navigation = useNavigation();

  const handleApply = () => {
    if (onApply) {
      onApply();
    } else {
      navigation.navigate('JobApplication' as never, { jobId: job.id } as never);
    }
  };

  return (
    <View style={[styles.container, style]}>
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
        <View style={styles.titleSection}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={styles.companyName}>{job.company_name}</Text>
        </View>
      </View>

      <View style={styles.metaList}>
        {job.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{job.location}</Text>
          </View>
        )}
        {job.type && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{job.type}</Text>
          </View>
        )}
        {job.salary_range && (
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{job.salary_range}</Text>
          </View>
        )}
      </View>

      {job.deadline && (
        <View style={styles.deadlineContainer}>
          <Ionicons name="alert-circle-outline" size={16} color="#EA580C" />
          <Text style={styles.deadlineText}>
            Apply by: {new Date(job.deadline).toLocaleDateString()}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.applyButton}
        onPress={handleApply}
        activeOpacity={0.7}
      >
        <Ionicons name="send-outline" size={18} color="#FFFFFF" />
        <Text style={styles.applyButtonText}>Apply Now</Text>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  companyInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  titleSection: {
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
  metaList: {
    gap: 8,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#4B5563',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  deadlineText: {
    fontSize: 14,
    color: '#EA580C',
    fontWeight: '500',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
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
