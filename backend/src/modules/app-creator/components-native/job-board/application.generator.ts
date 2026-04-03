/**
 * Application Component Generators for React Native
 *
 * Provides generators for React Native job application components:
 * - Application Form for submitting job applications
 * - Application List showing user's job applications
 * - Candidate Profile for managing user profile
 */

export interface ApplicationOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate an application form component for React Native
 */
export function generateApplicationForm(options: ApplicationOptions = {}): string {
  const { componentName = 'ApplicationForm', endpoint = '/applications' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '@/lib/api';

type RouteParams = {
  ApplicationForm: { jobId: string };
};

interface FormData {
  name: string;
  email: string;
  phone: string;
  resume_url: string;
  linkedin_url: string;
  portfolio_url: string;
  cover_letter: string;
}

interface ${componentName}Props {
  jobId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ jobId: propJobId }) => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ApplicationForm'>>();
  const jobId = propJobId || route.params?.jobId;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    resume_url: '',
    linkedin_url: '',
    portfolio_url: '',
    cover_letter: '',
  });
  const [resumeFile, setResumeFile] = useState<{
    name: string;
    uri: string;
    type: string;
  } | null>(null);

  const submitApplication = useMutation({
    mutationFn: async (data: FormData) => {
      const formDataToSend: any = { ...data, job_id: jobId };
      // In a real app, you would handle file upload here
      return api.post('${endpoint}', formDataToSend);
    },
    onSuccess: () => {
      Alert.alert('Success', 'Application submitted successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Applications' as never) },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    },
  });

  const handlePickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setResumeFile({
          name: file.name,
          uri: file.uri,
          type: file.mimeType || 'application/pdf',
        });
      }
    } catch (error) {
      console.error('Document picker error:', error);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    submitApplication.mutate(formData);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Apply for this Position</Text>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text style={styles.label}>Full Name *</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="mail-outline" size={16} color="#6B7280" />
              <Text style={styles.label}>Email *</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text style={styles.label}>Phone</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="(555) 123-4567"
            placeholderTextColor="#9CA3AF"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="cloud-upload-outline" size={16} color="#6B7280" />
            <Text style={styles.label}>Resume *</Text>
          </View>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickResume}
            activeOpacity={0.7}
          >
            <Ionicons name="document-attach-outline" size={32} color="#9CA3AF" />
            {resumeFile ? (
              <Text style={styles.uploadedFileName}>{resumeFile.name}</Text>
            ) : (
              <>
                <Text style={styles.uploadText}>Tap to upload resume</Text>
                <Text style={styles.uploadSubtext}>PDF, DOC, DOCX (max 5MB)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-linkedin" size={16} color="#6B7280" />
              <Text style={styles.label}>LinkedIn URL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="linkedin.com/in/..."
              placeholderTextColor="#9CA3AF"
              value={formData.linkedin_url}
              onChangeText={(text) => updateField('linkedin_url', text)}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="link-outline" size={16} color="#6B7280" />
              <Text style={styles.label}>Portfolio URL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="yourportfolio.com"
              placeholderTextColor="#9CA3AF"
              value={formData.portfolio_url}
              onChangeText={(text) => updateField('portfolio_url', text)}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="document-text-outline" size={16} color="#6B7280" />
            <Text style={styles.label}>Cover Letter</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us why you're a great fit for this role..."
            placeholderTextColor="#9CA3AF"
            value={formData.cover_letter}
            onChangeText={(text) => updateField('cover_letter', text)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            submitApplication.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitApplication.isPending}
          activeOpacity={0.7}
        >
          {submitApplication.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Application</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#9CA3AF",
    marginTop: 4,
  },
  uploadedFileName: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

/**
 * Generate an application list component for React Native
 */
export function generateApplicationList(options: ApplicationOptions = {}): string {
  const { componentName = 'ApplicationList', endpoint = '/applications' } = options;

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
  style?: any;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  submitted: { bg: '#DBEAFE', text: '#1E40AF' },
  reviewing: { bg: '#FEF3C7', text: '#92400E' },
  interview: { bg: '#F3E8FF', text: '#6B21A8' },
  offered: { bg: '#DCFCE7', text: '#166534' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

interface ApplicationCardProps {
  application: any;
  onPress: () => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onPress }) => {
  const status = application.status || 'submitted';
  const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.submitted;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {application.company_logo ? (
          <Image
            source={{ uri: application.company_logo }}
            style={styles.companyLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.companyLogoPlaceholder}>
            <Ionicons name="business-outline" size={24} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {application.job_title}
          </Text>
          <Text style={styles.companyName}>{application.company_name}</Text>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text style={styles.dateText}>
              Applied {new Date(application.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({ style }) => {
  const navigation = useNavigation();

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleApplicationPress = useCallback((application: any) => {
    navigation.navigate('ApplicationDetail' as never, { id: application.id } as never);
  }, [navigation]);

  const renderApplication = useCallback(({ item }: { item: any }) => (
    <ApplicationCard
      application={item}
      onPress={() => handleApplicationPress(item)}
    />
  ), [handleApplicationPress]);

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
        <Text style={styles.errorText}>Failed to load applications.</Text>
      </View>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No applications yet</Text>
        <Text style={styles.emptySubtitle}>Start applying for jobs to track them here</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Applications</Text>
      </View>
      <FlatList
        data={applications}
        renderItem={renderApplication}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  companyLogoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  companyName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}

/**
 * Generate a candidate profile component for React Native
 */
export function generateCandidateProfile(options: ApplicationOptions = {}): string {
  const { componentName = 'CandidateProfile', endpoint = '/profile' } = options;

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  style?: any;
}

interface ProfileData {
  name: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  skills: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({ style }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data: ProfileData) => api.put('${endpoint}', data),
    onSuccess: () => {
      Alert.alert('Success', 'Profile updated!');
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      setIsEditing(false);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update profile');
    },
  });

  const handleSave = () => {
    if (formData) {
      updateProfile.mutate(formData);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const addSkill = () => {
    Alert.prompt(
      'Add Skill',
      'Enter a new skill',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (skill) => {
            if (skill && formData) {
              setFormData({
                ...formData,
                skills: [...(formData.skills || []), skill],
              });
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const removeSkill = (index: number) => {
    if (formData) {
      setFormData({
        ...formData,
        skills: formData.skills.filter((_, i) => i !== index),
      });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        {isEditing ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={18} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {/* Avatar and Name */}
        <View style={styles.profileSection}>
          {formData?.avatar_url ? (
            <Image
              source={{ uri: formData.avatar_url }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-outline" size={40} color="#9CA3AF" />
            </View>
          )}
          {isEditing ? (
            <View style={styles.nameEditSection}>
              <TextInput
                style={styles.nameInput}
                value={formData?.name || ''}
                onChangeText={(text) =>
                  setFormData((prev) => prev && { ...prev, name: text })
                }
                placeholder="Your name"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={styles.titleInput}
                value={formData?.title || ''}
                onChangeText={(text) =>
                  setFormData((prev) => prev && { ...prev, title: text })
                }
                placeholder="Your title (e.g. Software Engineer)"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          ) : (
            <View style={styles.nameSection}>
              <Text style={styles.name}>{profile?.name}</Text>
              {profile?.title && <Text style={styles.title}>{profile.title}</Text>}
            </View>
          )}
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {(formData?.skills || []).map((skill: string, index: number) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
                {isEditing && (
                  <TouchableOpacity
                    onPress={() => removeSkill(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={14} color="#3B82F6" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {isEditing && (
              <TouchableOpacity
                style={styles.addSkillButton}
                onPress={addSkill}
              >
                <Ionicons name="add" size={14} color="#6B7280" />
                <Text style={styles.addSkillText}>Add Skill</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {isEditing ? (
            <TextInput
              style={styles.bioInput}
              value={formData?.bio || ''}
              onChangeText={(text) =>
                setFormData((prev) => prev && { ...prev, bio: text })
              }
              placeholder="Tell employers about yourself..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.bioText}>
              {profile?.bio || 'No bio added yet'}
            </Text>
          )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
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
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameSection: {
    flex: 1,
  },
  nameEditSection: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  title: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 2,
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DBEAFE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  skillText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  addSkillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addSkillText: {
    fontSize: 14,
    color: '#6B7280',
  },
  bioInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    minHeight: 100,
  },
  bioText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
});

export default ${componentName};
`;
}
