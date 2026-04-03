/**
 * Gallery Component Generators for React Native Creative/Design Apps
 *
 * Generates gallery-related components including:
 * - GalleryStats - Stats dashboard for gallery metrics
 * - SalesStatsGallery - Sales statistics for art galleries
 * - ArtworkFilters - Filter components for artwork
 * - PhotoGallery - Photo gallery grid with modal viewer
 */

export interface GalleryGeneratorOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate GalleryStats component for React Native
 */
export function generateGalleryStats(options: GalleryGeneratorOptions = {}): string {
  const {
    componentName = 'GalleryStats',
    endpoint = '/gallery/stats',
    queryKey = 'gallery-stats',
  } = options;

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  galleryId?: string;
  style?: any;
}

interface StatConfig {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  format?: 'number' | 'currency' | 'percentage';
}

const statsConfig: StatConfig[] = [
  { key: 'totalArtworks', label: 'Total Artworks', icon: 'images-outline', color: '#2563EB', bgColor: '#DBEAFE' },
  { key: 'totalViews', label: 'Total Views', icon: 'eye-outline', color: '#7C3AED', bgColor: '#EDE9FE' },
  { key: 'totalLikes', label: 'Total Likes', icon: 'heart-outline', color: '#EC4899', bgColor: '#FCE7F3' },
  { key: 'totalRevenue', label: 'Total Revenue', icon: 'cash-outline', color: '#059669', bgColor: '#D1FAE5', format: 'currency' },
  { key: 'totalCollectors', label: 'Collectors', icon: 'people-outline', color: '#4F46E5', bgColor: '#E0E7FF' },
  { key: 'averageRating', label: 'Average Rating', icon: 'star-outline', color: '#D97706', bgColor: '#FEF3C7' },
  { key: 'totalSales', label: 'Total Sales', icon: 'cart-outline', color: '#10B981', bgColor: '#D1FAE5' },
  { key: 'conversionRate', label: 'Conversion Rate', icon: 'trending-up-outline', color: '#F97316', bgColor: '#FFEDD5', format: 'percentage' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ galleryId, style }) => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', galleryId],
    queryFn: async () => {
      const url = galleryId ? '${endpoint}?gallery_id=' + galleryId : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response || {};
    },
  });

  const formatValue = (value: any, format?: string) => {
    if (value === undefined || value === null) return '-';
    if (format === 'currency') return '$' + Number(value).toLocaleString();
    if (format === 'percentage') return Number(value).toFixed(1) + '%';
    return Number(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={styles.errorText}>Failed to load gallery statistics</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statsConfig.map((stat) => {
          const value = stats?.[stat.key];
          const change = stats?.[stat.key + 'Change'];

          return (
            <View key={stat.key} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                {change !== undefined && (
                  <View style={styles.changeContainer}>
                    <Ionicons
                      name={change >= 0 ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={change >= 0 ? '#059669' : '#DC2626'}
                    />
                    <Text style={[styles.changeText, { color: change >= 0 ? '#059669' : '#DC2626' }]}>
                      {Math.abs(change)}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.statValue}>{formatValue(value, stat.format)}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
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
    minHeight: 200,
  },
  errorContainer: {
    padding: 24,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    margin: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generate SalesStatsGallery component for React Native
 */
export function generateSalesStatsGallery(options: GalleryGeneratorOptions = {}): string {
  const {
    componentName = 'SalesStatsGallery',
    endpoint = '/gallery/sales-stats',
    queryKey = 'gallery-sales-stats',
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  artistId?: string;
  style?: any;
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All Time' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ artistId, style }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['${queryKey}', artistId, timeRange],
    queryFn: async () => {
      let url = '${endpoint}?period=' + timeRange;
      if (artistId) url += '&artist_id=' + artistId;
      const response = await api.get<any>(url);
      return response?.data || response || {};
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const stats = [
    {
      label: 'Total Sales',
      value: '$' + (salesData?.totalSales || 0).toLocaleString(),
      change: salesData?.salesChange,
      icon: 'cash-outline' as const,
      color: '#059669',
      bgColor: '#D1FAE5',
    },
    {
      label: 'Orders',
      value: (salesData?.totalOrders || 0).toLocaleString(),
      change: salesData?.ordersChange,
      icon: 'cart-outline' as const,
      color: '#2563EB',
      bgColor: '#DBEAFE',
    },
    {
      label: 'Artworks Sold',
      value: (salesData?.artworksSold || 0).toLocaleString(),
      change: salesData?.artworksSoldChange,
      icon: 'cube-outline' as const,
      color: '#7C3AED',
      bgColor: '#EDE9FE',
    },
    {
      label: 'Avg. Order Value',
      value: '$' + (salesData?.avgOrderValue || 0).toLocaleString(),
      change: salesData?.avgOrderChange,
      icon: 'card-outline' as const,
      color: '#F97316',
      bgColor: '#FFEDD5',
    },
  ];

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sales Overview</Text>
          <Text style={styles.subtitle}>Track your gallery sales performance</Text>
        </View>
      </View>

      {/* Time Range Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timeRangeContainer}
        contentContainerStyle={styles.timeRangeContent}
      >
        {timeRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timeRangeButton,
              timeRange === option.value && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange(option.value)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === option.value && styles.timeRangeTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            {stat.change !== undefined && (
              <View style={styles.statChange}>
                <Ionicons
                  name={stat.change >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={12}
                  color={stat.change >= 0 ? '#059669' : '#DC2626'}
                />
                <Text
                  style={[
                    styles.statChangeText,
                    { color: stat.change >= 0 ? '#059669' : '#DC2626' },
                  ]}
                >
                  {Math.abs(stat.change)}% vs last period
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Recent Transactions */}
      {salesData?.recentTransactions && salesData.recentTransactions.length > 0 && (
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {salesData.recentTransactions.slice(0, 5).map((tx: any, index: number) => (
            <View key={tx.id || index} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={styles.transactionImage}>
                  {tx.artwork_image ? (
                    <Image source={{ uri: tx.artwork_image }} style={styles.txImage} />
                  ) : (
                    <Ionicons name="cube-outline" size={20} color="#9CA3AF" />
                  )}
                </View>
                <View>
                  <Text style={styles.transactionTitle}>{tx.artwork_title || 'Artwork'}</Text>
                  <Text style={styles.transactionBuyer}>{tx.buyer_name || 'Anonymous'}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={styles.transactionAmount}>
                  \${tx.amount?.toLocaleString() || 0}
                </Text>
                <Text style={styles.transactionDate}>
                  {tx.date ? new Date(tx.date).toLocaleDateString() : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
    minHeight: 200,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  timeRangeContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  timeRangeContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: '#7C3AED',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  statChangeText: {
    fontSize: 12,
  },
  transactionsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  txImage: {
    width: '100%',
    height: '100%',
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  transactionBuyer: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generate ArtworkFilters component for React Native
 */
export function generateArtworkFilters(options: GalleryGeneratorOptions = {}): string {
  const {
    componentName = 'ArtworkFilters',
    endpoint = '/artworks/categories',
    queryKey = 'artwork-categories',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface FilterValues {
  search: string;
  category: string;
  medium: string;
  style: string;
  priceMin: string;
  priceMax: string;
  availability: string;
  sortBy: string;
}

interface ${componentName}Props {
  onChange?: (filters: FilterValues) => void;
  onApply?: (filters: FilterValues) => void;
  style?: any;
}

const initialFilters: FilterValues = {
  search: '',
  category: '',
  medium: '',
  style: '',
  priceMin: '',
  priceMax: '',
  availability: '',
  sortBy: 'newest',
};

const mediums = [
  'Oil Paint', 'Acrylic', 'Watercolor', 'Digital Art', 'Photography',
  'Mixed Media', 'Charcoal', 'Pastel', 'Ink', 'Sculpture', 'Print',
];

const artStyles = [
  'Abstract', 'Realism', 'Impressionism', 'Contemporary', 'Modern',
  'Pop Art', 'Minimalist', 'Surrealism', 'Expressionism', 'Portrait',
];

const availabilityOptions = [
  { value: '', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
  { value: 'reserved', label: 'Reserved' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  onChange,
  onApply,
  style,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch {
        return [];
      }
    },
  });

  const updateFilter = useCallback((name: keyof FilterValues, value: string) => {
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onChange?.(updated);
  }, [filters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    onChange?.(initialFilters);
    onApply?.(initialFilters);
  }, [onChange, onApply]);

  const handleApply = useCallback(() => {
    onApply?.(filters);
    setShowFiltersModal(false);
  }, [filters, onApply]);

  const activeFiltersCount = [
    filters.category,
    filters.medium,
    filters.style,
    filters.priceMin,
    filters.priceMax,
    filters.availability,
  ].filter(Boolean).length;

  return (
    <View style={[styles.container, style]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search artworks, artists..."
            placeholderTextColor="#9CA3AF"
            value={filters.search}
            onChangeText={(text) => updateFilter('search', text)}
          />
          {filters.search ? (
            <TouchableOpacity onPress={() => updateFilter('search', '')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFiltersModal(true)}
        >
          <Ionicons name="options-outline" size={20} color="#7C3AED" />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickFilters}
        contentContainerStyle={styles.quickFiltersContent}
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.quickFilterChip,
              filters.sortBy === option.value && styles.quickFilterChipActive,
            ]}
            onPress={() => updateFilter('sortBy', option.value)}
          >
            <Text
              style={[
                styles.quickFilterText,
                filters.sortBy === option.value && styles.quickFilterTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Category */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  <TouchableOpacity
                    style={[styles.chip, !filters.category && styles.chipActive]}
                    onPress={() => updateFilter('category', '')}
                  >
                    <Text style={[styles.chipText, !filters.category && styles.chipTextActive]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  {categories.map((cat: any) => (
                    <TouchableOpacity
                      key={cat.id || cat.value}
                      style={[
                        styles.chip,
                        filters.category === (cat.id || cat.value) && styles.chipActive,
                      ]}
                      onPress={() => updateFilter('category', cat.id || cat.value)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.category === (cat.id || cat.value) && styles.chipTextActive,
                        ]}
                      >
                        {cat.name || cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Medium */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Medium</Text>
              <View style={styles.chipContainerWrap}>
                {mediums.map((medium) => (
                  <TouchableOpacity
                    key={medium}
                    style={[
                      styles.chip,
                      filters.medium === medium.toLowerCase().replace(' ', '_') && styles.chipActive,
                    ]}
                    onPress={() =>
                      updateFilter(
                        'medium',
                        filters.medium === medium.toLowerCase().replace(' ', '_')
                          ? ''
                          : medium.toLowerCase().replace(' ', '_')
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.medium === medium.toLowerCase().replace(' ', '_') &&
                          styles.chipTextActive,
                      ]}
                    >
                      {medium}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Style */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Style</Text>
              <View style={styles.chipContainerWrap}>
                {artStyles.map((artStyle) => (
                  <TouchableOpacity
                    key={artStyle}
                    style={[
                      styles.chip,
                      filters.style === artStyle.toLowerCase().replace(' ', '_') && styles.chipActive,
                    ]}
                    onPress={() =>
                      updateFilter(
                        'style',
                        filters.style === artStyle.toLowerCase().replace(' ', '_')
                          ? ''
                          : artStyle.toLowerCase().replace(' ', '_')
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.style === artStyle.toLowerCase().replace(' ', '_') &&
                          styles.chipTextActive,
                      ]}
                    >
                      {artStyle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={filters.priceMin}
                  onChangeText={(text) => updateFilter('priceMin', text)}
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={filters.priceMax}
                  onChangeText={(text) => updateFilter('priceMax', text)}
                />
              </View>
            </View>

            {/* Availability */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Availability</Text>
              <View style={styles.chipContainer}>
                {availabilityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.chip,
                      filters.availability === option.value && styles.chipActive,
                    ]}
                    onPress={() => updateFilter('availability', option.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.availability === option.value && styles.chipTextActive,
                      ]}
                    >
                      {option.label}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickFilters: {
    paddingBottom: 16,
  },
  quickFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  quickFilterChipActive: {
    backgroundColor: '#7C3AED',
  },
  quickFilterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  clearText: {
    fontSize: 14,
    color: '#7C3AED',
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
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chipContainerWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  priceSeparator: {
    color: '#9CA3AF',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
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

/**
 * Generate PhotoGallery component for React Native
 */
export function generatePhotoGallery(options: GalleryGeneratorOptions = {}): string {
  const {
    componentName = 'PhotoGallery',
    endpoint = '/photos',
    queryKey = 'photos',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 2;
const IMAGE_SIZE = (SCREEN_WIDTH - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

interface Photo {
  id: string;
  url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  likes?: number;
  downloads?: number;
}

interface ${componentName}Props {
  albumId?: string;
  columns?: 2 | 3 | 4;
  style?: any;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  albumId,
  columns = 3,
  style,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: photos, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', albumId],
    queryFn: async () => {
      const url = '${endpoint}' + (albumId ? '?album_id=' + albumId : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const imageSize = (SCREEN_WIDTH - GAP * (columns + 1)) / columns;

  const openLightbox = useCallback((photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const goNext = useCallback(() => {
    if (!photos || photos.length === 0) return;
    const nextIndex = (currentIndex + 1) % photos.length;
    setCurrentIndex(nextIndex);
    setSelectedPhoto(photos[nextIndex]);
  }, [photos, currentIndex]);

  const goPrev = useCallback(() => {
    if (!photos || photos.length === 0) return;
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setCurrentIndex(prevIndex);
    setSelectedPhoto(photos[prevIndex]);
  }, [photos, currentIndex]);

  const renderPhoto = useCallback(
    ({ item, index }: { item: Photo; index: number }) => (
      <TouchableOpacity
        style={[styles.photoItem, { width: imageSize, height: imageSize }]}
        onPress={() => openLightbox(item, index)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.thumbnail_url || item.url }}
          style={styles.photoImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    ),
    [imageSize, openLightbox]
  );

  const keyExtractor = useCallback((item: Photo) => item.id, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
        <Text style={styles.errorText}>Failed to load photos</Text>
      </View>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="images-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyText}>No photos found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Photos Count */}
      <View style={styles.header}>
        <Text style={styles.countText}>{photos.length} photos</Text>
      </View>

      {/* Photo Grid */}
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={keyExtractor}
        numColumns={columns}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Lightbox Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={closeLightbox}
      >
        <SafeAreaView style={styles.lightboxContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={closeLightbox}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Navigation Buttons */}
          {photos.length > 1 && (
            <>
              <TouchableOpacity style={styles.navButtonLeft} onPress={goPrev}>
                <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButtonRight} onPress={goNext}>
                <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}

          {/* Main Image */}
          {selectedPhoto && (
            <View style={styles.lightboxContent}>
              <Image
                source={{ uri: selectedPhoto.url }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
              {(selectedPhoto.title || selectedPhoto.description) && (
                <View style={styles.lightboxInfo}>
                  {selectedPhoto.title && (
                    <Text style={styles.lightboxTitle}>{selectedPhoto.title}</Text>
                  )}
                  {selectedPhoto.description && (
                    <Text style={styles.lightboxDescription}>{selectedPhoto.description}</Text>
                  )}
                </View>
              )}
              <View style={styles.lightboxActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.actionText}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="download-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.actionText}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Counter */}
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {photos.length}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  countText: {
    fontSize: 14,
    color: '#6B7280',
  },
  gridContent: {
    padding: GAP / 2,
  },
  photoItem: {
    margin: GAP / 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#DC2626',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  navButtonLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -24,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  navButtonRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -24,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  lightboxContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  lightboxImage: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.6,
  },
  lightboxInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  lightboxTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  lightboxDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 8,
  },
  lightboxActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  counter: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default ${componentName};
`;
}
