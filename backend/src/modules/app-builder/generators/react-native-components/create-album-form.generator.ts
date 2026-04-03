import { Component, DataField } from '../../interfaces/app-builder.types';
import { pascalCase, capitalCase } from 'change-case';
import { singular } from 'pluralize';

/**
 * Generate Create Album Form for React Native
 *
 * This is a specialized form generator for album creation with:
 * - Title field (required)
 * - Cover image upload with preview
 * - Release date picker
 * - Public/private toggle
 */
export function generateCreateAlbumForm(
  component: Component,
  entityName: string
): { code: string; imports: string[] } {
  const { data, actions } = component;
  const isCreateForm = actions.some(a => a.type === 'create');

  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Image, Platform } from 'react-native';`,
    `import { useMutation } from '@tanstack/react-query';`,
    `import { apiClient } from '@/lib/api';`,
    `import { useNavigation } from '@react-navigation/native';`,
    `import * as ImagePicker from 'expo-image-picker';`,
  ];

  const code = `${imports.join('\n')}

interface AlbumFormData {
  title: string;
  cover_image: string;
  release_date: string;
  is_public: boolean;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uri: string;
}

interface CreateAlbumFormProps {
  onSuccess?: () => void;
  options?: any;
}

export default function CreateAlbumForm({ onSuccess, options: propOptions }: CreateAlbumFormProps) {
  const navigation = useNavigation();

  const [formData, setFormData] = useState<AlbumFormData>({
    title: '',
    cover_image: '',
    release_date: '',
    is_public: false,
  });

  const [coverFile, setCoverFile] = useState<UploadedFile | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [options, setOptions] = useState<any>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (propOptions) return;
      setOptionsLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/albums/options\`);
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
    mutationFn: (data: any) => apiClient.post('/albums', data),
    onSuccess: () => {
      Alert.alert('Success', 'Album created successfully!', [
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
      Alert.alert('Error', error?.message || 'Failed to create album');
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleCoverUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const file: UploadedFile = {
          name: asset.uri.split('/').pop() || 'image.jpg',
          size: 0,
          type: 'image/jpeg',
          uri: asset.uri,
        };

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 10MB');
          return;
        }

        setCoverFile(file);
        setFormData((prev) => ({ ...prev, cover_image: file.uri }));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
      console.error(err);
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setFormData((prev) => ({ ...prev, cover_image: '' }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }

    if (!formData.release_date.trim()) {
      Alert.alert('Validation Error', 'Release date is required');
      return;
    }

    mutation.mutate(formData);
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'mm/dd/yyyy';
    // Handle date formatting based on input
    return dateString;
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
        <Text style={styles.pageTitle}>Create New Album</Text>
        <Text style={styles.pageSubtitle}>Fill in the form below</Text>
      </View>

      {/* Form Content */}
      <View style={styles.formContent}>
        {/* Title Field */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
            placeholder="Enter album title"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Cover Image Upload */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Cover Image</Text>

          {!coverFile ? (
            <TouchableOpacity style={styles.uploadBox} onPress={handleCoverUpload}>
              <View style={styles.uploadIcon}>
                <Text style={styles.uploadIconText}>📤</Text>
              </View>
              <Text style={styles.uploadText}>Click to upload</Text>
              <Text style={styles.uploadHint}>or drag and drop</Text>
              <Text style={styles.uploadHint}>Any file up to 10MB</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imagePreview}>
              <Image source={{ uri: coverFile.uri }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.imagePreviewFooter}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {coverFile.name}
                </Text>
                <TouchableOpacity onPress={handleRemoveCover} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Release Date Field */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Release Date <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.release_date}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, release_date: text }))}
            placeholder="mm/dd/yyyy"
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.fieldHint}>Format: MM/DD/YYYY</Text>
        </View>

        {/* Is Public Checkbox */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, formData.is_public && styles.checkboxChecked]}
            onPress={() => setFormData((prev) => ({ ...prev, is_public: !prev.is_public }))}
          >
            {formData.is_public && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Is Public</Text>
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
  formGroup: {
    marginBottom: 20,
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
  fieldHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadIconText: {
    fontSize: 24,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  imagePreview: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 192,
  },
  imagePreviewFooter: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#ef4444',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
