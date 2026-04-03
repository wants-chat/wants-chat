/**
 * Florist Component Generator for React Native
 *
 * Generates florist-specific components:
 * - FloristStats: Dashboard stats for florist operations
 * - FlowerGrid: Flower products grid
 * - ArrangementList: Floral arrangements list
 */

export interface FloristOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate florist stats dashboard component
 */
export function generateFloristStats(options: FloristOptions = {}): string {
  const { componentName = 'FloristStats', endpoint = '/florist/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const STATS_CONFIG = [
  { key: 'todaySales', label: "Today's Sales", icon: 'cash', color: '#16A34A', type: 'currency' },
  { key: 'ordersToday', label: "Today's Orders", icon: 'receipt', color: '#3B82F6', type: 'number' },
  { key: 'deliveriesToday', label: 'Deliveries Today', icon: 'car', color: '#8B5CF6', type: 'number' },
  { key: 'upcomingEvents', label: 'Event Orders', icon: 'calendar', color: '#F59E0B', type: 'number' },
  { key: 'lowStockFlowers', label: 'Low Stock', icon: 'alert-circle', color: '#EF4444', type: 'number' },
  { key: 'subscriptions', label: 'Subscriptions', icon: 'repeat', color: '#EC4899', type: 'number' },
];

function ${componentName}() {
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['florist-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch florist stats:', err);
        return {};
      }
    },
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    return Number(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Florist Dashboard</Text>
        <View style={styles.dateRow}>
          <Ionicons name="flower" size={16} color="#EC4899" />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {STATS_CONFIG.map((stat) => {
          const value = stats[stat.key];
          const change = stats[stat.key + 'Change'];

          return (
            <View key={stat.key} style={styles.statCard}>
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{formatValue(value, stat.type)}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {change !== undefined && (
                <View style={styles.changeRow}>
                  <Ionicons
                    name={change >= 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={change >= 0 ? '#16A34A' : '#EF4444'}
                  />
                  <Text style={[
                    styles.changeText,
                    { color: change >= 0 ? '#16A34A' : '#EF4444' },
                  ]}>
                    {Math.abs(change)}%
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate flower products grid component
 */
export function generateFlowerGrid(options: FloristOptions = {}): string {
  const { componentName = 'FlowerGrid', endpoint = '/florist/products' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface FlowerProduct {
  id: string;
  name: string;
  price: number;
  sale_price?: number;
  image_url?: string;
  category?: string;
  color?: string;
  availability?: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_new?: boolean;
  is_bestseller?: boolean;
  rating?: number;
}

interface ${componentName}Props {
  category?: string;
  onAddToCart?: (product: FlowerProduct) => void;
}

function ${componentName}({ category, onAddToCart }: ${componentName}Props) {
  const navigation = useNavigation();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['florist-products', category],
    queryFn: async () => {
      try {
        const url = category
          ? '${endpoint}?category=' + encodeURIComponent(category)
          : '${endpoint}';
        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  const getAvailabilityStyle = (availability?: string) => {
    switch (availability) {
      case 'in_stock':
        return { bg: '#DCFCE7', text: '#16A34A', label: 'In Stock' };
      case 'low_stock':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Low Stock' };
      case 'out_of_stock':
        return { bg: '#FEE2E2', text: '#DC2626', label: 'Out of Stock' };
      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: FlowerProduct }) => {
    const availability = getAvailabilityStyle(item.availability);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail' as never, { id: item.id } as never)}
      >
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="flower" size={32} color="#EC4899" />
            </View>
          )}
          <View style={styles.badges}>
            {item.is_new && (
              <View style={styles.newBadge}>
                <Text style={styles.badgeText}>New</Text>
              </View>
            )}
            {item.is_bestseller && (
              <View style={styles.bestsellerBadge}>
                <Text style={styles.badgeText}>Best</Text>
              </View>
            )}
          </View>
          {item.color && (
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          {item.category && (
            <Text style={styles.category}>{item.category}</Text>
          )}
          <View style={styles.priceRow}>
            {item.sale_price && item.sale_price < item.price ? (
              <>
                <Text style={styles.salePrice}>\${item.sale_price.toFixed(2)}</Text>
                <Text style={styles.originalPrice}>\${item.price.toFixed(2)}</Text>
              </>
            ) : (
              <Text style={styles.price}>\${(item.price || 0).toFixed(2)}</Text>
            )}
            {item.rating && (
              <View style={styles.rating}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>
          {availability && (
            <View style={[styles.availabilityBadge, { backgroundColor: availability.bg }]}>
              <Text style={[styles.availabilityText, { color: availability.text }]}>
                {availability.label}
              </Text>
            </View>
          )}
          {onAddToCart && item.availability !== 'out_of_stock' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAddToCart(item)}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="flower-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No products found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
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
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  placeholderImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badges: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  newBadge: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bestsellerBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  colorDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EC4899',
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16A34A',
  },
  originalPrice: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  availabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EC4899',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

/**
 * Generate floral arrangements list component
 */
export function generateArrangementList(options: FloristOptions = {}): string {
  const { componentName = 'ArrangementList', endpoint = '/florist/arrangements' } = options;

  return `import React from 'react';
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

interface Arrangement {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  occasion?: string;
  size?: 'small' | 'medium' | 'large';
  flower_count?: number;
  is_customizable?: boolean;
  rating?: number;
  reviews_count?: number;
}

interface ${componentName}Props {
  occasion?: string;
  onSelectArrangement?: (arrangement: Arrangement) => void;
}

function ${componentName}({ occasion, onSelectArrangement }: ${componentName}Props) {
  const navigation = useNavigation();

  const { data: arrangements = [], isLoading } = useQuery({
    queryKey: ['florist-arrangements', occasion],
    queryFn: async () => {
      try {
        const url = occasion
          ? '${endpoint}?occasion=' + encodeURIComponent(occasion)
          : '${endpoint}';
        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch arrangements:', err);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  const getSizeLabel = (size?: string) => {
    switch (size) {
      case 'small': return 'Small';
      case 'medium': return 'Medium';
      case 'large': return 'Large';
      default: return null;
    }
  };

  const renderItem = ({ item }: { item: Arrangement }) => (
    <TouchableOpacity
      style={styles.arrangementCard}
      onPress={() => onSelectArrangement ? onSelectArrangement(item) : navigation.navigate('ArrangementDetail' as never, { id: item.id } as never)}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.arrangementImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="flower" size={40} color="#EC4899" />
          </View>
        )}
        {item.is_customizable && (
          <View style={styles.customizableBadge}>
            <Ionicons name="color-palette" size={12} color="#FFFFFF" />
            <Text style={styles.customizableBadgeText}>Customizable</Text>
          </View>
        )}
      </View>
      <View style={styles.arrangementInfo}>
        <Text style={styles.arrangementName}>{item.name}</Text>
        {item.occasion && (
          <Text style={styles.occasion}>{item.occasion}</Text>
        )}
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.detailsRow}>
          {item.size && (
            <View style={styles.sizeBadge}>
              <Text style={styles.sizeText}>{getSizeLabel(item.size)}</Text>
            </View>
          )}
          {item.flower_count && (
            <View style={styles.flowerCountBadge}>
              <Ionicons name="flower-outline" size={12} color="#6B7280" />
              <Text style={styles.flowerCountText}>{item.flower_count} stems</Text>
            </View>
          )}
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>\${(item.price || 0).toFixed(2)}</Text>
          {item.rating && (
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>{item.rating}</Text>
              {item.reviews_count && (
                <Text style={styles.reviewsText}>({item.reviews_count})</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (arrangements.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="flower-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No arrangements found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={arrangements}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  arrangementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  arrangementImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customizableBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  customizableBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  arrangementInfo: {
    padding: 16,
  },
  arrangementName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  occasion: {
    fontSize: 13,
    color: '#EC4899',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  sizeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sizeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  flowerCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  flowerCountText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EC4899',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}
