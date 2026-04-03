/**
 * Property Grid Generator for React Native App Creator
 *
 * Generates property grid components with:
 * - FlatList with numColumns=2 for property listings
 * - TouchableOpacity for property cards
 * - Image, price, beds/baths, sqft display
 * - Filter chips for property type and price range
 * - Navigation to property detail
 */

export interface PropertyGridOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
  columns?: 2 | 3;
  limit?: number;
  detailScreen?: string;
  showFilters?: boolean;
}

/**
 * Generate a property grid component for React Native
 */
export function generatePropertyGrid(options: PropertyGridOptions = {}): string {
  const {
    componentName = 'PropertyGrid',
    endpoint = '/properties',
    title = 'Properties',
    columns = 2,
    limit,
    detailScreen = 'PropertyDetail',
    showFilters = true,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * (${columns} + 1)) / ${columns};

interface ${componentName}Props {
  data?: any[];
  title?: string;
  onPropertyPress?: (property: any) => void;
  limit?: number;
  filters?: any;
  showFilters?: boolean;
  style?: any;
}

interface PropertyCardProps {
  property: any;
  onPress: () => void;
  onFavorite?: () => void;
}

const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return '$' + (price / 1000000).toFixed(1) + 'M';
  }
  if (price >= 1000) {
    return '$' + (price / 1000).toFixed(0) + 'K';
  }
  return '$' + price.toLocaleString();
};

const getPropertyImage = (property: any): string => {
  if (property.image_url) return property.image_url;
  if (property.image) return property.image;
  if (property.images) {
    if (Array.isArray(property.images)) return property.images[0] || '';
    if (typeof property.images === 'string') {
      try {
        const parsed = JSON.parse(property.images);
        return Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        return property.images;
      }
    }
  }
  return '';
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onFavorite,
}) => {
  const image = getPropertyImage(property);
  const price = property.price;
  const bedrooms = property.bedrooms || property.beds;
  const bathrooms = property.bathrooms || property.baths;
  const sqft = property.sqft || property.square_feet || property.area;
  const status = property.status;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'for-sale':
      case 'for_sale':
        return { backgroundColor: '#10B981', label: 'For Sale' };
      case 'for-rent':
      case 'for_rent':
        return { backgroundColor: '#3B82F6', label: 'For Rent' };
      case 'sold':
        return { backgroundColor: '#6B7280', label: 'Sold' };
      case 'pending':
        return { backgroundColor: '#F59E0B', label: 'Pending' };
      default:
        return { backgroundColor: '#6B7280', label: status };
    }
  };

  const statusInfo = status ? getStatusStyle(status) : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="home-outline" size={40} color="#9CA3AF" />
          </View>
        )}

        {statusInfo && (
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
            <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.price}>{formatPrice(price)}</Text>

        <Text style={styles.propertyTitle} numberOfLines={1}>
          {property.title || property.name || 'Property'}
        </Text>

        {property.address && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.addressText} numberOfLines={1}>
              {property.address}
            </Text>
          </View>
        )}

        <View style={styles.featuresRow}>
          {bedrooms !== undefined && (
            <View style={styles.featureItem}>
              <Ionicons name="bed-outline" size={14} color="#6B7280" />
              <Text style={styles.featureText}>{bedrooms}</Text>
            </View>
          )}
          {bathrooms !== undefined && (
            <View style={styles.featureItem}>
              <Ionicons name="water-outline" size={14} color="#6B7280" />
              <Text style={styles.featureText}>{bathrooms}</Text>
            </View>
          )}
          {sqft !== undefined && (
            <View style={styles.featureItem}>
              <Ionicons name="resize-outline" size={14} color="#6B7280" />
              <Text style={styles.featureText}>{sqft.toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  title = '${title}',
  onPropertyPress,
  limit${limit ? ` = ${limit}` : ''},
  filters: propFilters,
  showFilters = ${showFilters},
  style,
}) => {
  const navigation = useNavigation();
  const [filters, setFilters] = useState(propFilters || {});

  // Build API endpoint with filters
  const buildEndpoint = () => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    if (limit) params.append('limit', String(limit));
    const queryString = params.toString();
    return '${endpoint}' + (queryString ? '?' + queryString : '');
  };

  const { data: fetchedData, isLoading, error, refetch } = useQuery({
    queryKey: ['properties', filters, limit],
    queryFn: async () => {
      try {
        const response = await api.get<any>(buildEndpoint());
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  let properties = propData && propData.length > 0 ? propData : (fetchedData || []);
  if (limit && properties.length > limit) {
    properties = properties.slice(0, limit);
  }

  const handlePropertyPress = useCallback((property: any) => {
    if (onPropertyPress) {
      onPropertyPress(property);
    } else {
      const propertyId = property.id || property._id;
      navigation.navigate('${detailScreen}' as never, { id: propertyId } as never);
    }
  }, [onPropertyPress, navigation]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value === filters[key] ? '' : value };
    setFilters(newFilters);
  };

  const renderProperty = useCallback(({ item }: { item: any }) => (
    <PropertyCard
      property={item}
      onPress={() => handlePropertyPress(item)}
    />
  ), [handlePropertyPress]);

  const keyExtractor = useCallback((item: any) => (item.id || item._id)?.toString(), []);

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
        <Text style={styles.errorText}>Failed to load properties.</Text>
      </View>
    );
  }

  if (properties.length === 0) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="home-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No properties found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your filters.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}

      {showFilters && (
        <PropertyFiltersInline
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={keyExtractor}
        numColumns={${columns}}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

interface PropertyFiltersInlineProps {
  filters: any;
  onFilterChange: (key: string, value: string) => void;
}

const PropertyFiltersInline: React.FC<PropertyFiltersInlineProps> = ({
  filters,
  onFilterChange,
}) => {
  const propertyTypes = ['House', 'Apartment', 'Condo', 'Townhouse', 'Land'];
  const priceRanges = [
    { label: 'Under $200K', value: '0-200000' },
    { label: '$200K-$500K', value: '200000-500000' },
    { label: '$500K-$1M', value: '500000-1000000' },
    { label: '$1M+', value: '1000000-' },
  ];

  return (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsContainer}
      >
        {propertyTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterChip,
              filters.type === type.toLowerCase() && styles.filterChipActive,
            ]}
            onPress={() => onFilterChange('type', type.toLowerCase())}
          >
            <Text
              style={[
                styles.filterChipText,
                filters.type === type.toLowerCase() && styles.filterChipTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.filterDivider} />

        {priceRanges.map((range) => {
          const [min, max] = range.value.split('-');
          const isActive = filters.minPrice === min && filters.maxPrice === max;
          return (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.filterChip,
                isActive && styles.filterChipActive,
              ]}
              onPress={() => {
                if (isActive) {
                  onFilterChange('minPrice', '');
                  onFilterChange('maxPrice', '');
                } else {
                  onFilterChange('minPrice', min);
                  onFilterChange('maxPrice', max);
                }
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
    minHeight: 200,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: CARD_MARGIN,
    marginTop: 16,
    marginBottom: 12,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filterChipsContainer: {
    paddingHorizontal: CARD_MARGIN,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN / 2,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: CARD_MARGIN / 2,
    marginVertical: CARD_MARGIN / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.7,
    backgroundColor: '#F3F4F6',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#6B7280',
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
  },
});

export default ${componentName};
`;
}

/**
 * Generate a standalone property card component for React Native
 */
export function generatePropertyCard(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'PropertyCard';

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  property: any;
  onPress?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  style?: any;
}

const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return '$' + (price / 1000000).toFixed(1) + 'M';
  }
  if (price >= 1000) {
    return '$' + (price / 1000).toFixed(0) + 'K';
  }
  return '$' + price.toLocaleString();
};

const getPropertyImage = (property: any): string => {
  if (property.image_url) return property.image_url;
  if (property.image) return property.image;
  if (property.images) {
    if (Array.isArray(property.images)) return property.images[0] || '';
    if (typeof property.images === 'string') {
      try {
        const parsed = JSON.parse(property.images);
        return Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        return property.images;
      }
    }
  }
  return '';
};

const ${componentName}: React.FC<${componentName}Props> = ({
  property,
  onPress,
  onFavorite,
  isFavorite = false,
  style,
}) => {
  const image = getPropertyImage(property);
  const price = property.price;
  const bedrooms = property.bedrooms || property.beds;
  const bathrooms = property.bathrooms || property.baths;
  const sqft = property.sqft || property.square_feet || property.area;
  const status = property.status;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'for-sale':
      case 'for_sale':
        return { backgroundColor: '#10B981', label: 'For Sale' };
      case 'for-rent':
      case 'for_rent':
        return { backgroundColor: '#3B82F6', label: 'For Rent' };
      case 'sold':
        return { backgroundColor: '#6B7280', label: 'Sold' };
      case 'pending':
        return { backgroundColor: '#F59E0B', label: 'Pending' };
      default:
        return { backgroundColor: '#6B7280', label: status };
    }
  };

  const statusInfo = status ? getStatusStyle(status) : null;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="home-outline" size={48} color="#9CA3AF" />
          </View>
        )}

        {statusInfo && (
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
            <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#EF4444' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.price}>{formatPrice(price)}</Text>

        <Text style={styles.propertyTitle} numberOfLines={2}>
          {property.title || property.name || 'Property'}
        </Text>

        {property.address && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.addressText} numberOfLines={1}>
              {property.address}
            </Text>
          </View>
        )}

        <View style={styles.featuresRow}>
          {bedrooms !== undefined && (
            <View style={styles.featureItem}>
              <Ionicons name="bed-outline" size={16} color="#6B7280" />
              <Text style={styles.featureText}>{bedrooms} bd</Text>
            </View>
          )}
          {bathrooms !== undefined && (
            <View style={styles.featureItem}>
              <Ionicons name="water-outline" size={16} color="#6B7280" />
              <Text style={styles.featureText}>{bathrooms} ba</Text>
            </View>
          )}
          {sqft !== undefined && (
            <View style={styles.featureItem}>
              <Ionicons name="resize-outline" size={16} color="#6B7280" />
              <Text style={styles.featureText}>{sqft.toLocaleString()} sqft</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generate property filters component for React Native
 */
export function generatePropertyFilters(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'PropertyFilters';

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  filters: any;
  onChange: (filters: any) => void;
  onApply?: () => void;
  onReset?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  filters,
  onChange,
  onApply,
  onReset,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const propertyTypes = ['House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Commercial'];
  const statuses = ['For Sale', 'For Rent', 'Sold', 'Pending'];
  const amenities = ['Pool', 'Garage', 'Garden', 'Gym', 'Security', 'Parking', 'Balcony', 'Fireplace'];

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a: string) => a !== amenity)
      : [...current, amenity];
    onChange({ ...filters, amenities: updated });
  };

  const handleReset = () => {
    onChange({});
    onReset?.();
  };

  const handleApply = () => {
    setModalVisible(false);
    onApply?.();
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key] && (Array.isArray(filters[key]) ? filters[key].length > 0 : true)
  ).length;

  return (
    <View style={styles.container}>
      {/* Quick Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFiltersContainer}
      >
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="options-outline" size={18} color="#374151" />
          <Text style={styles.filterButtonText}>Filters</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {propertyTypes.slice(0, 4).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.chipButton,
              filters.type === type.toLowerCase() && styles.chipButtonActive,
            ]}
            onPress={() =>
              onChange({
                ...filters,
                type: filters.type === type.toLowerCase() ? '' : type.toLowerCase(),
              })
            }
          >
            <Text
              style={[
                styles.chipButtonText,
                filters.type === type.toLowerCase() && styles.chipButtonTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Property Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Property Type</Text>
              <View style={styles.chipsContainer}>
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chipButton,
                      filters.type === type.toLowerCase() && styles.chipButtonActive,
                    ]}
                    onPress={() =>
                      onChange({
                        ...filters,
                        type: filters.type === type.toLowerCase() ? '' : type.toLowerCase(),
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.chipButtonText,
                        filters.type === type.toLowerCase() && styles.chipButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.chipsContainer}>
                {statuses.map((status) => {
                  const statusValue = status.toLowerCase().replace(' ', '-');
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.chipButton,
                        filters.status === statusValue && styles.chipButtonActive,
                      ]}
                      onPress={() =>
                        onChange({
                          ...filters,
                          status: filters.status === statusValue ? '' : statusValue,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.chipButtonText,
                          filters.status === statusValue && styles.chipButtonTextActive,
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceInputsContainer}>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceInputLabel}>Min</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="$0"
                    keyboardType="numeric"
                    value={filters.minPrice || ''}
                    onChangeText={(text) => onChange({ ...filters, minPrice: text })}
                  />
                </View>
                <Text style={styles.priceDivider}>-</Text>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceInputLabel}>Max</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="No limit"
                    keyboardType="numeric"
                    value={filters.maxPrice || ''}
                    onChangeText={(text) => onChange({ ...filters, maxPrice: text })}
                  />
                </View>
              </View>
            </View>

            {/* Beds & Baths */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Bedrooms</Text>
              <View style={styles.chipsContainer}>
                {['1+', '2+', '3+', '4+', '5+'].map((beds) => (
                  <TouchableOpacity
                    key={beds}
                    style={[
                      styles.chipButton,
                      filters.bedrooms === beds.replace('+', '') && styles.chipButtonActive,
                    ]}
                    onPress={() =>
                      onChange({
                        ...filters,
                        bedrooms: filters.bedrooms === beds.replace('+', '') ? '' : beds.replace('+', ''),
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.chipButtonText,
                        filters.bedrooms === beds.replace('+', '') && styles.chipButtonTextActive,
                      ]}
                    >
                      {beds}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Bathrooms</Text>
              <View style={styles.chipsContainer}>
                {['1+', '2+', '3+', '4+'].map((baths) => (
                  <TouchableOpacity
                    key={baths}
                    style={[
                      styles.chipButton,
                      filters.bathrooms === baths.replace('+', '') && styles.chipButtonActive,
                    ]}
                    onPress={() =>
                      onChange({
                        ...filters,
                        bathrooms: filters.bathrooms === baths.replace('+', '') ? '' : baths.replace('+', ''),
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.chipButtonText,
                        filters.bathrooms === baths.replace('+', '') && styles.chipButtonTextActive,
                      ]}
                    >
                      {baths}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Amenities */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Amenities</Text>
              <View style={styles.chipsContainer}>
                {amenities.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.chipButton,
                      (filters.amenities || []).includes(amenity) && styles.chipButtonActive,
                    ]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Text
                      style={[
                        styles.chipButtonText,
                        (filters.amenities || []).includes(amenity) && styles.chipButtonTextActive,
                      ]}
                    >
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  quickFiltersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  chipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipButtonActive: {
    backgroundColor: '#3B82F6',
  },
  chipButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  chipButtonTextActive: {
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  resetText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  priceDivider: {
    fontSize: 20,
    color: '#6B7280',
    marginTop: 16,
  },
  modalFooter: {
    padding: 16,
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}
