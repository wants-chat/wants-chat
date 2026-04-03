import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

/**
 * React Native Profile Edit Form Generator
 * Generates a profile editing form component with field validation
 */
export const generateRNProfileEditForm = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'compact' | 'detailed' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const getEntityName = () => {
    if (!dataSource || dataSource.trim() === '') return 'user_profiles';
    const parts = dataSource.split('.');
    return parts[0] || 'user_profiles';
  };

  const dataName = getDataPath();
  const entityName = getEntityName();

  const variants = {
    standard: `
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface ProfileEditFormProps {
  ${dataName}?: any;
  endpoint?: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  [key: string]: any;
}

export default function ProfileEditForm({
  ${dataName}: propData,
  endpoint = '/api/v1/${entityName}',
  onSuccess,
  onCancel,
  submitButtonText = 'Save Profile',
  cancelButtonText = 'Cancel',
}: ProfileEditFormProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setFetchLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}/me\`);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

  const profile = propData || fetchedData;

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');

  // Initialize form with existing data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || profile.firstName || '');
      setLastName(profile.last_name || profile.lastName || '');
      setPhone(profile.phone || '');
      setDateOfBirth(profile.date_of_birth || profile.dateOfBirth || '');
      setGender(profile.gender || '');
    }
  }, [profile]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.put(endpoint, data),
    onSuccess: (response) => {
      Alert.alert('Success', 'Profile updated successfully');
      onSuccess?.(response.data);
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    },
  });

  const handleSubmit = () => {
    setError('');

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    const profileData: any = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    };

    if (phone.trim()) profileData.phone = phone.trim();
    if (dateOfBirth) profileData.date_of_birth = dateOfBirth;
    if (gender) profileData.gender = gender;

    updateMutation.mutate(profileData);
  };

  if (fetchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.title}>Edit Profile</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              editable={!updateMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              editable={!updateMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!updateMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              editable={!updateMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderOptions}>
              {['male', 'female', 'other', 'prefer_not_to_say'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderButton,
                    gender === option && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender(option)}
                  disabled={updateMutation.isPending}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === option && styles.genderButtonTextActive,
                    ]}
                  >
                    {option.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>{submitButtonText}</Text>
              )}
            </TouchableOpacity>

            {onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onCancel}
                disabled={updateMutation.isPending}
              >
                <Text style={styles.secondaryButtonText}>{cancelButtonText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  genderButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  genderButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonGroup: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
`,
    compact: `
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface CompactProfileEditFormProps {
  ${dataName}?: any;
  endpoint?: string;
  onSuccess?: (data: any) => void;
  [key: string]: any;
}

export default function CompactProfileEditForm({
  ${dataName}: propData,
  endpoint = '/api/v1/${entityName}',
  onSuccess,
}: CompactProfileEditFormProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setFetchLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}/me\`);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

  const profile = propData || fetchedData;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || profile.firstName || '');
      setLastName(profile.last_name || profile.lastName || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.put(endpoint, data),
    onSuccess: (response) => {
      Alert.alert('Success', 'Profile updated');
      onSuccess?.(response.data);
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
    },
  });

  const handleSubmit = () => {
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Name is required');
      return;
    }

    updateMutation.mutate({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
    });
  };

  if (fetchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        editable={!updateMutation.isPending}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        editable={!updateMutation.isPending}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!updateMutation.isPending}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});
`,
    detailed: `
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';

interface DetailedProfileEditFormProps {
  ${dataName}?: any;
  endpoint?: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  [key: string]: any;
}

export default function DetailedProfileEditForm({
  ${dataName}: propData,
  endpoint = '/api/v1/${entityName}',
  onSuccess,
  onCancel,
}: DetailedProfileEditFormProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setFetchLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}/me\`);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

  const profile = propData || fetchedData;

  const [avatar, setAvatar] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setAvatar(profile.avatar || profile.avatarUrl || '');
      setFirstName(profile.first_name || profile.firstName || '');
      setLastName(profile.last_name || profile.lastName || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setDateOfBirth(profile.date_of_birth || profile.dateOfBirth || '');
      setGender(profile.gender || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.put(endpoint, data),
    onSuccess: (response) => {
      Alert.alert('Success', 'Profile updated successfully');
      onSuccess?.(response.data);
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    },
  });

  const handleSubmit = () => {
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    const profileData: any = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date_of_birth: dateOfBirth,
      gender,
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      bio: bio.trim(),
    };

    if (avatar) profileData.avatar = avatar;

    updateMutation.mutate(profileData);
  };

  if (fetchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.title}>Edit Profile</Text>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#9ca3af" />
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.changeAvatarButton}>
              <Text style={styles.changeAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Basic Info Section */}
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!updateMutation.isPending}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!updateMutation.isPending}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!updateMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!updateMutation.isPending}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                editable={!updateMutation.isPending}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Gender</Text>
              <TextInput
                style={styles.input}
                placeholder="Gender"
                value={gender}
                onChangeText={setGender}
                editable={!updateMutation.isPending}
              />
            </View>
          </View>

          {/* Address Section */}
          <Text style={styles.sectionTitle}>Address</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main St"
              value={address}
              onChangeText={setAddress}
              editable={!updateMutation.isPending}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={city}
                onChangeText={setCity}
                editable={!updateMutation.isPending}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="Country"
                value={country}
                onChangeText={setCountry}
                editable={!updateMutation.isPending}
              />
            </View>
          </View>

          {/* Bio Section */}
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about yourself"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!updateMutation.isPending}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            {onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onCancel}
                disabled={updateMutation.isPending}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeAvatarText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  buttonGroup: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
`,
  };

  const selectedVariant = variants[variant] || variants.standard;

  return {
    code: selectedVariant.trim(),
    imports: [],
  };
};
