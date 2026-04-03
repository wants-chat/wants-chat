/**
 * Product Grid Generator for React Native App Creator
 *
 * Generates product grid components with:
 * - FlatList with numColumns=2 for products
 * - TouchableOpacity for product cards
 * - Image, Text, rating stars
 * - Add to cart functionality
 * - Navigation to product detail
 */

import { snakeCase, pascalCase, camelCase } from 'change-case';
import pluralize from 'pluralize';

export interface ProductGridOptions {
  entity?: string;
  title?: string;
  showAddToCart?: boolean;
  showRatings?: boolean;
  columns?: 2 | 3;
  limit?: number;
  detailScreen?: string;
  filterByCategory?: boolean;
}

/**
 * Generate a product grid component for React Native
 */
export function generateProductGrid(options: ProductGridOptions = {}): string {
  const {
    entity = 'product',
    title = 'Products',
    showAddToCart = true,
    showRatings = true,
    columns = 2,
    limit,
    detailScreen = 'ProductDetail',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = `${pascalCase(entity)}Grid`;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { showToast } from '@/lib/toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * (${columns} + 1)) / ${columns};

interface ${componentName}Props {
  data?: any[];
  title?: string;
  onProductPress?: (product: any) => void;
  onAddToCart?: (product: any) => void;
  limit?: number;
  showAddToCart?: boolean;
  showRatings?: boolean;
  categoryId?: string;
  style?: any;
}

interface ProductCardProps {
  product: any;
  onPress: () => void;
  onAddToCart?: () => void;
  showAddToCart: boolean;
  showRatings: boolean;
}

const StarRating: React.FC<{ rating: number; reviewCount?: number }> = ({ rating, reviewCount }) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalf = (rating || 0) % 1 >= 0.5;

  return (
    <View style={styles.ratingContainer}>
      <View style={styles.starsRow}>
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return <Ionicons key={i} name="star" size={14} color="#FBBF24" />;
          }
          if (i === fullStars && hasHalf) {
            return <Ionicons key={i} name="star-half" size={14} color="#FBBF24" />;
          }
          return <Ionicons key={i} name="star-outline" size={14} color="#D1D5DB" />;
        })}
      </View>
      {reviewCount !== undefined && (
        <Text style={styles.reviewCount}>({reviewCount})</Text>
      )}
    </View>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  showAddToCart,
  showRatings,
}) => {
  const productId = product.id || product._id;
  const name = product.name || product.title || 'Untitled';
  const price = product.price;
  const originalPrice = product.original_price || product.compare_at_price;
  const image = getProductImage(product);
  const rating = product.rating || product.average_rating;
  const reviewCount = product.review_count || product.reviews_count;
  const isOnSale = originalPrice && price < originalPrice;

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
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="cube-outline" size={40} color="#9CA3AF" />
          </View>
        )}
        {isOnSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>

        {showRatings && rating !== undefined && (
          <StarRating rating={rating} reviewCount={reviewCount} />
        )}

        <View style={styles.priceRow}>
          {originalPrice && originalPrice > price && (
            <Text style={styles.originalPrice}>
              \${parseFloat(originalPrice).toFixed(2)}
            </Text>
          )}
          <Text style={styles.price}>
            \${price ? parseFloat(price).toFixed(2) : '0.00'}
          </Text>
        </View>

        {showAddToCart && (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onAddToCart?.();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getProductImage = (product: any): string => {
  if (product.image_url) return product.image_url;
  if (product.image) return product.image;
  if (product.images) {
    if (Array.isArray(product.images)) return product.images[0] || '';
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        return Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        return product.images;
      }
    }
  }
  return '';
};

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  title = '${title}',
  onProductPress,
  onAddToCart,
  limit${limit ? ` = ${limit}` : ''},
  showAddToCart = ${showAddToCart},
  showRatings = ${showRatings},
  categoryId,
  style,
}) => {
  const navigation = useNavigation();
  const { addToCart } = useCart();

  // Build API endpoint - filter by category if categoryId provided
  const endpoint = categoryId
    ? \`/categories/\${categoryId}/products\`
    : '/${tableName}';

  // Fetch data from API if no props provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: categoryId ? ['${tableName}', 'category', categoryId] : ['${tableName}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>(endpoint);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch ${tableName}:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  // Use prop data or fetched data
  let products = propData && propData.length > 0 ? propData : (fetchedData || []);
  if (limit && products.length > limit) {
    products = products.slice(0, limit);
  }

  const handleProductPress = useCallback((product: any) => {
    if (onProductPress) {
      onProductPress(product);
    } else {
      const productId = product.id || product._id;
      navigation.navigate('${detailScreen}' as never, { id: productId } as never);
    }
  }, [onProductPress, navigation]);

  const handleAddToCart = useCallback((product: any) => {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    // Default cart functionality
    try {
      addToCart({
        productId: product.id,
        name: product.name || product.title,
        price: product.price,
        quantity: 1,
        image: getProductImage(product),
      });
      showToast('success', 'Added to cart!');
    } catch (error) {
      showToast('error', 'Failed to add to cart');
    }
  }, [onAddToCart, addToCart]);

  const renderProduct = useCallback(({ item }: { item: any }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onAddToCart={() => handleAddToCart(item)}
      showAddToCart={showAddToCart}
      showRatings={showRatings}
    />
  ), [handleProductPress, handleAddToCart, showAddToCart, showRatings]);

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
        <Text style={styles.errorText}>Failed to load products.</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No products found</Text>
        <Text style={styles.emptySubtitle}>Check back later for new products.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {title && (
        <Text style={styles.sectionTitle}>{title}</Text>
      )}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        numColumns={${columns}}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
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
    height: CARD_WIDTH * 0.85,
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
 * Generate a featured products section for React Native
 */
export function generateFeaturedProducts(options: ProductGridOptions = {}): string {
  return generateProductGrid({
    ...options,
    title: options.title || 'Featured Products',
    limit: options.limit || 4,
    columns: 2,
  });
}
