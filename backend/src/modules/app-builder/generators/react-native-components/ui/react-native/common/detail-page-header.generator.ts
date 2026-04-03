import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

/**
 * React Native Detail Page Header Generator
 * Generates a header component for detail pages with back navigation,
 * title, and action buttons
 */
export const generateRNDetailPageHeader = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'minimal' | 'with-image' = 'standard'
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

  // Extract entity name from dataSource for API endpoint
  const getEntityName = () => {
    if (!dataSource || dataSource.trim() === '') return 'items';
    const parts = dataSource.split('.');
    return parts[0] || 'items';
  };

  const dataName = getDataPath();
  const entityName = getEntityName();

  const variants = {
    standard: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DetailPageHeaderProps {
  ${dataName}?: any;
  id?: string;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showShareButton?: boolean;
  displayFields?: string[];
  [key: string]: any;
}

export default function DetailPageHeader({
  ${dataName}: propData,
  id,
  title,
  subtitle,
  onBack,
  onEdit,
  onDelete,
  onShare,
  showEditButton = true,
  showDeleteButton = false,
  showShareButton = false,
  displayFields = [],
}: DetailPageHeaderProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const endpoint = id ? \`\${apiUrl}/${entityName}/\${id}\` : \`\${apiUrl}/${entityName}\`;
        const response = await fetch(endpoint);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const item = propData || fetchedData;

  // Extract title from data if not provided
  const displayTitle = title || item?.title || item?.name || item?.description || 'Details';
  const displaySubtitle = subtitle || item?.subtitle || item?.category?.name || '';

  // Format field value for display
  const formatValue = (value: any, key: string): string => {
    if (value === null || value === undefined) return 'N/A';

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    if (typeof value === 'number') {
      if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price')) {
        return \`$\${value.toFixed(2)}\`;
      }
      return value.toString();
    }

    if (typeof value === 'string') {
      // Check if it's a date string
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        } catch (e) {
          return value;
        }
      }
      return value;
    }

    if (typeof value === 'object' && value.name) {
      return value.name;
    }

    return JSON.stringify(value);
  };

  // Format field label
  const formatLabel = (field: string): string => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading && !propData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with navigation */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            {showShareButton && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onShare}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={22} color="#6b7280" />
              </TouchableOpacity>
            )}
            {showEditButton && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onEdit}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={22} color="#6b7280" />
              </TouchableOpacity>
            )}
            {showDeleteButton && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onDelete}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Title section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{displayTitle}</Text>
          {displaySubtitle && (
            <Text style={styles.subtitle}>{displaySubtitle}</Text>
          )}
        </View>

        {/* Details section */}
        {item && displayFields.length > 0 && (
          <ScrollView style={styles.detailsSection}>
            {displayFields.map((field, index) => {
              const value = item[field];
              if (value === undefined) return null;

              return (
                <View key={index} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{formatLabel(field)}</Text>
                  <Text style={styles.detailValue}>{formatValue(value, field)}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});
`,
    minimal: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MinimalDetailPageHeaderProps {
  ${dataName}?: any;
  id?: string;
  title?: string;
  onBack?: () => void;
  onEdit?: () => void;
  [key: string]: any;
}

export default function MinimalDetailPageHeader({
  ${dataName}: propData,
  id,
  title,
  onBack,
  onEdit,
}: MinimalDetailPageHeaderProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const endpoint = id ? \`\${apiUrl}/${entityName}/\${id}\` : \`\${apiUrl}/${entityName}\`;
        const response = await fetch(endpoint);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const item = propData || fetchedData;
  const displayTitle = title || item?.title || item?.name || 'Details';

  if (loading && !propData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {displayTitle}
        </Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={22} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: 56,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
`,
    'with-image': `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DetailPageHeaderWithImageProps {
  ${dataName}?: any;
  id?: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  displayFields?: string[];
  [key: string]: any;
}

export default function DetailPageHeaderWithImage({
  ${dataName}: propData,
  id,
  title,
  subtitle,
  imageUrl,
  onBack,
  onEdit,
  onDelete,
  showEditButton = true,
  showDeleteButton = false,
  displayFields = [],
}: DetailPageHeaderWithImageProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const endpoint = id ? \`\${apiUrl}/${entityName}/\${id}\` : \`\${apiUrl}/${entityName}\`;
        const response = await fetch(endpoint);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const item = propData || fetchedData;

  const displayTitle = title || item?.title || item?.name || 'Details';
  const displaySubtitle = subtitle || item?.subtitle || item?.category?.name || '';
  const displayImage = imageUrl || item?.image || item?.imageUrl || item?.thumbnail;

  const formatValue = (value: any, key: string): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price')) {
        return \`$\${value.toFixed(2)}\`;
      }
      return value.toString();
    }
    if (typeof value === 'string') {
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        } catch (e) {
          return value;
        }
      }
      return value;
    }
    if (typeof value === 'object' && value.name) {
      return value.name;
    }
    return JSON.stringify(value);
  };

  const formatLabel = (field: string): string => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading && !propData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Fixed header with navigation */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            {showEditButton && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onEdit}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={22} color="#fff" />
              </TouchableOpacity>
            )}
            {showDeleteButton && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onDelete}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={22} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero image section */}
        {displayImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: displayImage }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Title section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{displayTitle}</Text>
          {displaySubtitle && (
            <Text style={styles.subtitle}>{displaySubtitle}</Text>
          )}
        </View>

        {/* Details section */}
        {item && displayFields.length > 0 && (
          <ScrollView style={styles.detailsSection}>
            {displayFields.map((field, index) => {
              const value = item[field];
              if (value === undefined) return null;

              return (
                <View key={index} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{formatLabel(field)}</Text>
                  <Text style={styles.detailValue}>{formatValue(value, field)}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    marginLeft: 8,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
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
