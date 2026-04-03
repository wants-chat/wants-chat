/**
 * Entity Detail with Header Component Generator (React Native)
 *
 * Generic detail view with:
 * - Cover image/header
 * - Entity information display
 * - Flexible field rendering
 * - Works for ANY entity type (products, suppliers, warehouses, etc.)
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRNEntityDetailWithHeader = (resolved: ResolvedComponent) => {
  const { dataSource, title = 'Details' } = resolved;
  const entity = resolved.data?.entity || dataSource;
  const fields = resolved.data?.fields || [];
  const props = resolved.props || {};

  // Find key fields dynamically
  const findField = (possibleNames: string[]) => {
    for (const possibleName of possibleNames) {
      const field = fields.find(f => f.name === possibleName);
      if (field) return field.name;
    }
    return undefined;
  };

  const imageField = findField(['cover_image', 'featured_image', 'image', 'image_url', 'thumbnail', 'logo_url']);
  const titleField = findField(['title', 'name']);
  const descriptionField = findField(['description', 'bio', 'about', 'summary', 'excerpt']);
  const statusField = findField(['is_open', 'is_active', 'status', 'active']);

  // Generate field display for React Native
  const generateFieldDisplay = (field: any) => {
    const fieldName = field.name;
    const fieldType = field.type;
    const label = field.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

    // Skip fields that are shown in header or are IDs
    const skipFields = [imageField, titleField, descriptionField, 'id', 'user_id', 'created_at', 'updated_at'];
    if (skipFields.includes(fieldName)) {
      return '';
    }

    // Boolean fields
    if (fieldType === 'boolean' || fieldName.startsWith('is_')) {
      return `
            <View style={detailStyles.fieldRow}>
              <Text style={detailStyles.fieldLabel}>${label}</Text>
              <View style={[detailStyles.badge, entityData?.${fieldName} ? detailStyles.badgeSuccess : detailStyles.badgeDefault]}>
                <Text style={[detailStyles.badgeText, entityData?.${fieldName} ? detailStyles.badgeTextSuccess : detailStyles.badgeTextDefault]}>
                  {entityData?.${fieldName} ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>`;
    }

    // Number fields
    if (fieldType === 'number' || fieldName.includes('count') || fieldName.includes('price') || fieldName.includes('fee') || fieldName.includes('amount')) {
      return `
            <View style={detailStyles.fieldRow}>
              <Text style={detailStyles.fieldLabel}>${label}</Text>
              <Text style={detailStyles.fieldValue}>
                {${fieldName.includes('price') || fieldName.includes('fee') || fieldName.includes('amount') || fieldName.includes('cost')
                  ? `entityData?.currency ? \`\${entityData.currency} \${entityData.${fieldName}}\` : \`$\${entityData?.${fieldName}}\``
                  : `entityData?.${fieldName}`} || '-'}
              </Text>
            </View>`;
    }

    // Date fields
    if (fieldType === 'date' || fieldName.includes('date') || fieldName.includes('_at')) {
      return `
            <View style={detailStyles.fieldRow}>
              <Text style={detailStyles.fieldLabel}>${label}</Text>
              <Text style={detailStyles.fieldValue}>
                {entityData?.${fieldName} ? new Date(entityData.${fieldName}).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </Text>
            </View>`;
    }

    // Textarea/long text fields
    if (fieldType === 'textarea' || fieldName === 'notes' || fieldName === 'details') {
      return `
            {entityData?.${fieldName} && (
              <View style={detailStyles.textFieldContainer}>
                <Text style={detailStyles.fieldLabel}>${label}</Text>
                <Text style={detailStyles.textFieldValue}>{entityData.${fieldName}}</Text>
              </View>
            )}`;
    }

    // Default text field
    return `
            <View style={detailStyles.fieldRow}>
              <Text style={detailStyles.fieldLabel}>${label}</Text>
              <Text style={detailStyles.fieldValue}>{entityData?.${fieldName} || '-'}</Text>
            </View>`;
  };

  const fieldDisplays = fields.map(generateFieldDisplay).filter(Boolean).join('\n');

  return {
    code: `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

interface EntityDetailWithHeaderProps {
  data?: any;
  entityId?: string;
  title?: string;
  showBackButton?: boolean;
  [key: string]: any;
}

export default function EntityDetailWithHeader({
  data: propData,
  entityId,
  showBackButton = true
}: EntityDetailWithHeaderProps) {
  const navigation = useNavigation();
  const route = useRoute();
  const id = entityId || (route.params as any)?.id;

  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data if not provided via props
  useEffect(() => {
    const fetchData = async () => {
      if (propData || !id) return;
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entity}/\${id}\`);
        const result = await response.json();
        // Extract actual data from wrapper { success: true, data: {...} }
        setFetchedData(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch entity details:', err);
        setError('Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const entityData = propData || fetchedData;

  if (loading) {
    return (
      <View style={detailStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={detailStyles.errorContainer}>
        <Text style={detailStyles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!entityData) {
    return (
      <View style={detailStyles.errorContainer}>
        <Text style={detailStyles.errorText}>No data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={detailStyles.container}>
      {/* Back Button */}
      {showBackButton && (
        <TouchableOpacity
          style={detailStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={detailStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}

      {/* Header Image */}
      ${imageField ? `
      {entityData.${imageField} && (
        <Image
          source={{ uri: entityData.${imageField} }}
          style={detailStyles.headerImage}
          resizeMode="cover"
        />
      )}` : ''}

      {/* Content */}
      <View style={detailStyles.content}>
        {/* Title */}
        ${titleField ? `
        {entityData.${titleField} && (
          <Text style={detailStyles.title}>{entityData.${titleField}}</Text>
        )}` : ''}

        {/* Status Badge */}
        ${statusField ? `
        {entityData.${statusField} !== undefined && (
          <View style={[detailStyles.statusBadge, entityData.${statusField} ? detailStyles.statusActive : detailStyles.statusInactive]}>
            <Text style={detailStyles.statusText}>
              {entityData.${statusField} ? 'Active' : 'Inactive'}
            </Text>
          </View>
        )}` : ''}

        {/* Description */}
        ${descriptionField ? `
        {entityData.${descriptionField} && (
          <Text style={detailStyles.description}>{entityData.${descriptionField}}</Text>
        )}` : ''}

        {/* Details Card */}
        <View style={detailStyles.card}>
          ${fieldDisplays}
        </View>
      </View>
    </ScrollView>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  headerImage: {
    width: '100%',
    height: 200,
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    flex: 1,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    flex: 1,
  },
  textFieldContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  textFieldValue: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  badgeDefault: {
    backgroundColor: '#f3f4f6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextSuccess: {
    color: '#16a34a',
  },
  badgeTextDefault: {
    color: '#6b7280',
  },
});`,
    fileName: 'EntityDetailWithHeader.tsx',
    imports: []
  };
};
