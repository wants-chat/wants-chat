/**
 * React Native Category Grid Generator
 * Generates a grid of category cards
 */

export function generateRNCategoryGrid(): { code: string; imports: string[] } {
  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getVariantStyles, DesignVariant, ColorScheme } from '@/lib/design-variants';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

interface CategoryGridProps {
  title?: string;
  entity?: string;
  categories?: any[];
  data?: any[];
  onCategoryClick?: (category: any) => void;
  onItemClick?: (item: any) => void;
  columns?: number;
  showDescription?: boolean;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function CategoryGrid({
  title,
  entity = 'categories',
  categories,
  data,
  onCategoryClick,
  onItemClick,
  columns = 2,
  showDescription = true,
  variant = 'minimal',
  colorScheme = 'blue',
  ...props
}: CategoryGridProps) {
  const { colors, modifiers } = getVariantStyles(variant, colorScheme);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propData = categories || data;

  useEffect(() => {
    const fetchData = async () => {
      if (propData && propData.length > 0) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || []));
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData;

  const handleItemPress = (item: any) => {
    if (onItemClick) {
      onItemClick(item);
    } else if (onCategoryClick) {
      onCategoryClick(item);
    }
  };

  const renderCategory = ({ item }: { item: any }) => {
    const name = item.name || item.title || '';
    const imageUrl = item.cover_image || item.image_url || item.image || 'https://via.placeholder.com/200';
    const description = item.description || '';
    const count = item.product_count || item.restaurant_count || 0;

    return (
      <TouchableOpacity
        style={[styles.categoryCard, { width: (width - 48) / columns }]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <Text style={styles.categoryName}>{name}</Text>
          {count > 0 && (
            <Text style={styles.productCount}>{count} items</Text>
          )}
        </View>
        {showDescription && description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
    },
    container: {
      padding: 16,
    },
    row: {
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    categoryCard: {
      borderRadius: modifiers.borderRadius,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: modifiers.shadowOffset },
      shadowOpacity: modifiers.shadowOpacity,
      shadowRadius: modifiers.shadowRadius,
      elevation: modifiers.shadowRadius,
      marginBottom: 16,
    },
    image: {
      width: '100%',
      height: 150,
    },
    overlay: {
      position: 'absolute',
      bottom: 48,
      left: 0,
      right: 0,
      backgroundColor: colors.primary + '99', // 60% opacity
      padding: 12,
    },
    categoryName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textOnPrimary,
    },
    productCount: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
    descriptionContainer: {
      padding: 12,
    },
    description: {
      fontSize: 14,
      color: colors.textMuted,
    },
    emptyContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    errorText: {
      marginTop: 8,
      fontSize: 14,
      color: '#ef4444',
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (sourceData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No categories available</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={sourceData}
        renderItem={renderCategory}
        keyExtractor={(item, index) => item.id || item._id || index.toString()}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}`;

  return {
    code,
    imports: []
  };
}
