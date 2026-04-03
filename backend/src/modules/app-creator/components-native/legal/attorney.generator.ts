/**
 * Attorney Profile Component Generators (React Native)
 *
 * Generates attorney profile and detail components for law firm applications.
 */

export interface AttorneyOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAttorneyProfile(options: AttorneyOptions = {}): string {
  const { componentName = 'AttorneyProfile', endpoint = '/attorneys' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Education {
  institution: string;
  degree: string;
  year: number;
}

interface Award {
  title: string;
  year: number;
}

interface Publication {
  title: string;
  publication: string;
  year: number;
}

interface Attorney {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  title: string;
  bar_number?: string;
  admitted_date?: string;
  practice_areas: string[];
  education: Education[];
  experience_years: number;
  bio?: string;
  specializations?: string[];
  languages?: string[];
  office_location?: string;
  linkedin_url?: string;
  active_cases_count?: number;
  total_cases?: number;
  win_rate?: number;
  hourly_rate?: number;
  is_partner?: boolean;
  joined_date?: string;
  awards?: Award[];
  publications?: Publication[];
}

interface ${componentName}Props {
  attorneyId?: string;
  showEdit?: boolean;
  onEdit?: (attorney: Attorney) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  attorneyId: propId,
  showEdit = true,
  onEdit,
  onBack,
}) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const attorneyId = propId || route.params?.id;

  const { data: attorney, isLoading, refetch } = useQuery({
    queryKey: ['attorney', attorneyId],
    queryFn: async () => {
      const response = await api.get<Attorney>('${endpoint}/' + attorneyId);
      return response?.data || response;
    },
    enabled: !!attorneyId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (onEdit && attorney) {
      onEdit(attorney);
    } else {
      navigation.navigate('AttorneyEdit', { id: attorneyId });
    }
  };

  const handleCall = () => {
    if (attorney?.phone) {
      Linking.openURL('tel:' + attorney.phone);
    }
  };

  const handleEmail = () => {
    if (attorney?.email) {
      Linking.openURL('mailto:' + attorney.email);
    }
  };

  const handleLinkedIn = () => {
    if (attorney?.linkedin_url) {
      Linking.openURL(attorney.linkedin_url);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!attorney) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Attorney not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        {showEdit && (
          <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
            <Text style={styles.headerEditText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {attorney.avatar_url ? (
            <Image source={{ uri: attorney.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(attorney.name)}</Text>
            </View>
          )}
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.name}>{attorney.name}</Text>
          {attorney.is_partner && (
            <View style={styles.partnerBadge}>
              <Text style={styles.partnerText}>Partner</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{attorney.title}</Text>

        {attorney.bar_number && (
          <Text style={styles.barNumber}>Bar #: {attorney.bar_number}</Text>
        )}

        {attorney.win_rate !== undefined && (
          <View style={styles.winRateContainer}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.winRateText}>{attorney.win_rate.toFixed(1)}% Win Rate</Text>
          </View>
        )}

        {attorney.practice_areas && attorney.practice_areas.length > 0 && (
          <View style={styles.practiceAreasContainer}>
            {attorney.practice_areas.map((area, index) => (
              <View key={index} style={styles.practiceAreaBadge}>
                <Text style={styles.practiceAreaText}>{area}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, !attorney.phone && styles.actionButtonDisabled]}
          onPress={handleCall}
          disabled={!attorney.phone}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="call" size={20} color="#15803D" />
          </View>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, !attorney.email && styles.actionButtonDisabled]}
          onPress={handleEmail}
          disabled={!attorney.email}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="mail" size={20} color="#1D4ED8" />
          </View>
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, !attorney.linkedin_url && styles.actionButtonDisabled]}
          onPress={handleLinkedIn}
          disabled={!attorney.linkedin_url}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="logo-linkedin" size={20} color="#7C3AED" />
          </View>
          <Text style={styles.actionText}>LinkedIn</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{attorney.experience_years || 0}</Text>
          <Text style={styles.statLabel}>Years Exp.</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{attorney.active_cases_count || 0}</Text>
          <Text style={styles.statLabel}>Active Cases</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{attorney.total_cases || 0}</Text>
          <Text style={styles.statLabel}>Total Cases</Text>
        </View>
        {attorney.hourly_rate && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>\${attorney.hourly_rate}</Text>
              <Text style={styles.statLabel}>Per Hour</Text>
            </View>
          </>
        )}
      </View>

      {attorney.bio && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{attorney.bio}</Text>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        {attorney.email && (
          <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{attorney.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {attorney.phone && (
          <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
            <View style={styles.infoIcon}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{attorney.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {attorney.office_location && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Office</Text>
              <Text style={styles.infoValue}>{attorney.office_location}</Text>
            </View>
          </View>
        )}
      </View>

      {attorney.education && attorney.education.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Education</Text>
          {attorney.education.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <View style={styles.educationDot} />
              <View style={styles.educationContent}>
                <Text style={styles.educationDegree}>{edu.degree}</Text>
                <Text style={styles.educationInstitution}>{edu.institution}</Text>
                <Text style={styles.educationYear}>{edu.year}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {attorney.specializations && attorney.specializations.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.tagsContainer}>
            {attorney.specializations.map((spec, index) => (
              <View key={index} style={styles.specializationBadge}>
                <Text style={styles.specializationText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {attorney.languages && attorney.languages.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.tagsContainer}>
            {attorney.languages.map((lang, index) => (
              <View key={index} style={styles.languageBadge}>
                <Text style={styles.languageText}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {attorney.awards && attorney.awards.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Awards & Recognition</Text>
          {attorney.awards.map((award, index) => (
            <View key={index} style={styles.awardItem}>
              <View style={[styles.awardDot, { backgroundColor: '#F59E0B' }]} />
              <View style={styles.awardContent}>
                <Text style={styles.awardTitle}>{award.title}</Text>
                <Text style={styles.awardYear}>{award.year}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {attorney.publications && attorney.publications.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Publications</Text>
          {attorney.publications.map((pub, index) => (
            <View key={index} style={styles.publicationItem}>
              <View style={styles.publicationIcon}>
                <Ionicons name="document-text-outline" size={20} color="#6366F1" />
              </View>
              <View style={styles.publicationContent}>
                <Text style={styles.publicationTitle}>{pub.title}</Text>
                <Text style={styles.publicationSource}>{pub.publication}</Text>
                <Text style={styles.publicationYear}>{pub.year}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bottomSpacing} />
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
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 4,
  },
  headerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  headerEditText: {
    marginLeft: 4,
    color: '#3B82F6',
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  partnerBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  partnerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  title: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  barNumber: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  winRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
  },
  winRateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B45309',
    marginLeft: 6,
  },
  practiceAreasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  practiceAreaBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  practiceAreaText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bioText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 40,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
  },
  educationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  educationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginTop: 6,
    marginRight: 12,
  },
  educationContent: {
    flex: 1,
  },
  educationDegree: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  educationInstitution: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  educationYear: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  specializationBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specializationText: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '500',
  },
  languageBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  languageText: {
    fontSize: 13,
    color: '#15803D',
    fontWeight: '500',
  },
  awardItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  awardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  awardContent: {
    flex: 1,
  },
  awardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  awardYear: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  publicationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  publicationIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  publicationContent: {
    flex: 1,
  },
  publicationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  publicationSource: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  publicationYear: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default ${componentName};
`;
}
