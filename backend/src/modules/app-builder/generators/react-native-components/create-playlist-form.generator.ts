import { Component, DataField } from '../../interfaces/app-builder.types';
import { pascalCase, capitalCase } from 'change-case';
import { singular } from 'pluralize';

/**
 * Generate Create Playlist Form for React Native
 *
 * This is a specialized form generator for playlist creation with:
 * - Name field (required)
 * - Description textarea
 * - Cover image text input
 * - Public/private toggle
 */
export function generateCreatePlaylistForm(
  component: Component,
  entityName: string
): { code: string; imports: string[] } {
  const { data, actions } = component;
  const isCreateForm = actions.some(a => a.type === 'create');

  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';`,
    `import { useMutation } from '@tanstack/react-query';`,
    `import { apiClient } from '@/lib/api';`,
    `import { useNavigation } from '@react-navigation/native';`,
  ];

  const code = `${imports.join('\n')}

interface PlaylistFormData {
  name: string;
  description: string;
  cover_image: string;
  is_public: boolean;
}

interface CreatePlaylistFormProps {
  onSuccess?: () => void;
  options?: any;
}

export default function CreatePlaylistForm({ onSuccess, options: propOptions }: CreatePlaylistFormProps) {
  const navigation = useNavigation();

  const [formData, setFormData] = useState<PlaylistFormData>({
    name: '',
    description: '',
    cover_image: '',
    is_public: false,
  });

  const [options, setOptions] = useState<any>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (propOptions) return;
      setOptionsLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/playlists/options\`);
        const result = await response.json();
        setOptions(result?.data || result || {});
      } catch (err) {
        console.error('Failed to fetch options:', err);
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const formOptions = propOptions || options || {};

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/playlists', data),
    onSuccess: () => {
      Alert.alert('Success', 'Playlist created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (onSuccess) {
              onSuccess();
            } else if (navigation.canGoBack()) {
              navigation.goBack();
            }
          },
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to create playlist');
    },
  });

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Create New Playlist</Text>
        <Text style={styles.pageSubtitle}>Fill in the form below</Text>
      </View>

      {/* Form Content */}
      <View style={styles.formContent}>
        {/* Name and Description Row */}
        <View style={styles.formRow}>
          {/* Name Field */}
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              placeholder="Enter playlist name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Description Field */}
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              placeholder="Enter description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Cover Image and Is Public Row */}
        <View style={styles.formRow}>
          {/* Cover Image Field */}
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Cover Image</Text>
            <TextInput
              style={styles.input}
              value={formData.cover_image}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, cover_image: text }))}
              placeholder="Enter image URL"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Is Public Checkbox */}
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Visibility</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, formData.is_public && styles.checkboxChecked]}
                onPress={() => setFormData((prev) => ({ ...prev, is_public: !prev.is_public }))}
              >
                {formData.is_public && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Is Public</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.submitButton, mutation.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.canGoBack() && navigation.goBack()}
            disabled={mutation.isPending}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  formContent: {
    padding: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
});`;

  return { code, imports };
}
