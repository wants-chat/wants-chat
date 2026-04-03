/**
 * React Native Product Card Compact Generator
 * Generates a compact product card component with multiple variants
 * Variants: minimal, featured, quick
 * Matches React web catalog implementation
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateRNProductCardCompact(
  resolved: ResolvedComponent,
  variant: 'minimal' | 'featured' | 'quick' = 'minimal'
): { code: string; imports: string[] } {
  const formatPriceFunction = `
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  };`;

  const getRatingStarsFunction = `
  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={12} color="#fbbf24" />);
    }
    return stars;
  };`;

  const variants = {
    minimal: () => {
      const imports = [
        `import React, { useState, useEffect } from 'react';`,
        `import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native';`,
        `import { Ionicons } from '@expo/vector-icons';`,
        `import { useMutation, useQueryClient } from '@tanstack/react-query';`,
      ];

      const code = `${imports.join('\n')}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  stockStatus?: 'in-stock' | 'out-of-stock' | 'low-stock';
  badge?: string;
}

interface ProductCardCompactProps {
  productsData?: any;
  products?: Product[];
  data?: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  addToCartText?: string;
  outOfStockText?: string;
  [key: string]: any;
}

export default function ProductCardCompact({
  productsData: propData,
  products: propProducts,
  data,
  onProductClick,
  onAddToCart,
  addToCartText = 'Add',
  outOfStockText = 'Out of Stock'
}: ProductCardCompactProps) {
  const queryClient = useQueryClient();
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\\\`\\\${apiUrl}/cart\\\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: (data, product) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (onAddToCart) onAddToCart(product);
      Alert.alert('Success', 'Added to cart!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to add to cart');
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (propData || propProducts || data) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\\\`\\\${apiUrl}/products\\\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || []));
      } catch (err) {
        console.error('Failed to fetch products data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sourceData = propProducts || data || (propData?.products || propData) || fetchedData || [];

  if (loading && !propData && !propProducts && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
${formatPriceFunction}

  const handleProductClick = (product: Product) => {
    onProductClick?.(product);
  };

  const addToCart = (product: Product) => {
    if (product.stockStatus !== 'out-of-stock') {
      addToCartMutation.mutate(product);
    }
  };

  const renderProduct = ({ item: product }: { item: Product }) => {
    const isOutOfStock = product.stockStatus === 'out-of-stock';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProductClick(product)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {product.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          )}
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/150' }}
            style={styles.image}
            resizeMode="cover"
          />
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>{outOfStockText}</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>

          {product.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#fbbf24" />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          )}

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.addButton, (isOutOfStock || addToCartMutation.isPending) && styles.addButtonDisabled]}
            onPress={() => addToCart(product)}
            disabled={isOutOfStock || addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="add" size={12} color="#fff" />
                <Text style={styles.addButtonText}>{addToCartText}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={sourceData}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
    minHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 10,
    color: '#6b7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 10,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    borderRadius: 4,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});`;

      return { code, imports };
    },

    featured: () => {
      const imports = [
        `import React, { useState, useEffect } from 'react';`,
        `import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native';`,
        `import { Ionicons } from '@expo/vector-icons';`,
        `import { useMutation, useQueryClient } from '@tanstack/react-query';`,
      ];

      const code = `${imports.join('\n')}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 2;

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  stockStatus?: 'in-stock' | 'out-of-stock' | 'low-stock';
  stockCount?: number;
  badge?: string;
  discount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface ProductCardCompactProps {
  productsData?: any;
  products?: Product[];
  data?: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  addToCartText?: string;
  outOfStockText?: string;
  lowStockText?: string;
  newText?: string;
  [key: string]: any;
}

export default function ProductCardCompact({
  productsData: propData,
  products: propProducts,
  data,
  onProductClick,
  onAddToCart,
  addToCartText = 'Add to Cart',
  outOfStockText = 'Out of Stock',
  lowStockText = 'Only',
  newText = 'NEW'
}: ProductCardCompactProps) {
  const queryClient = useQueryClient();
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\\\`\\\${apiUrl}/cart\\\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: (data, product) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (onAddToCart) onAddToCart(product);
      Alert.alert('Success', 'Added to cart!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to add to cart');
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (propData || propProducts || data) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\\\`\\\${apiUrl}/products\\\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || []));
      } catch (err) {
        console.error('Failed to fetch products data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sourceData = propProducts || data || (propData?.products || propData) || fetchedData || [];

  if (loading && !propData && !propProducts && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
${formatPriceFunction}
${getRatingStarsFunction}

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const renderProduct = ({ item: product }: { item: Product }) => {
    const isOutOfStock = product.stockStatus === 'out-of-stock';
    const isLowStock = product.stockStatus === 'low-stock';
    const isInWishlist = wishlist.includes(product.id);

    return (
      <TouchableOpacity
        style={[styles.card, product.isFeatured && styles.featuredCard]}
        onPress={() => onProductClick?.(product)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <View style={styles.badgesLeft}>
            {product.isNew && (
              <View style={[styles.badge, styles.badgeGreen]}>
                <Text style={styles.badgeText}>{newText}</Text>
              </View>
            )}
            {product.badge && (
              <View style={[styles.badge, styles.badgeRed]}>
                <Text style={styles.badgeText}>{product.badge}</Text>
              </View>
            )}
            {product.discount && (
              <View style={[styles.badge, styles.badgeOrange]}>
                <Text style={styles.badgeText}>-{product.discount}%</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => toggleWishlist(product.id)}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={12}
              color={isInWishlist ? '#ef4444' : '#6b7280'}
            />
          </TouchableOpacity>

          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/180' }}
            style={styles.image}
            resizeMode="cover"
          />

          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>{outOfStockText}</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>

          {product.rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>{getRatingStars(product.rating)}</View>
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            )}
          </View>

          {isLowStock && product.stockCount && product.stockCount > 0 && (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>
                {lowStockText}: {product.stockCount}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.addButton, (isOutOfStock || addToCartMutation.isPending) && styles.addButtonDisabled]}
            onPress={() => addToCartMutation.mutate(product)}
            disabled={isOutOfStock || addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={12} color="#fff" />
                <Text style={styles.addButtonText}>{addToCartText}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={sourceData}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgesLeft: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 10,
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeGreen: {
    backgroundColor: '#10b981',
  },
  badgeRed: {
    backgroundColor: '#ef4444',
  },
  badgeOrange: {
    backgroundColor: '#f97316',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  wishlistButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    minHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  priceRow: {
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 10,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  lowStockBadge: {
    backgroundColor: '#fed7aa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  lowStockText: {
    fontSize: 10,
    color: '#c2410c',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});`;

      return { code, imports };
    },

    quick: () => {
      const imports = [
        `import React, { useState, useEffect } from 'react';`,
        `import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native';`,
        `import { Ionicons } from '@expo/vector-icons';`,
        `import { useMutation, useQueryClient } from '@tanstack/react-query';`,
      ];

      const code = `${imports.join('\n')}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  stockStatus?: 'in-stock' | 'out-of-stock' | 'low-stock';
  badge?: string;
  discount?: number;
}

interface ProductCardCompactProps {
  productsData?: any;
  products?: Product[];
  data?: Product[];
  onProductClick?: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  quickAddText?: string;
  outOfStockText?: string;
  [key: string]: any;
}

export default function ProductCardCompact({
  productsData: propData,
  products: propProducts,
  data,
  onProductClick,
  onQuickAdd,
  onQuickView,
  quickAddText = 'Quick Add',
  outOfStockText = 'Out of Stock'
}: ProductCardCompactProps) {
  const queryClient = useQueryClient();
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState<string | null>(null);

  const quickAddMutation = useMutation({
    mutationFn: async (product: Product) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\\\`\\\${apiUrl}/cart\\\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: (data, product) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (onQuickAdd) onQuickAdd(product);
      Alert.alert('Success', 'Added to cart!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to add to cart');
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (propData || propProducts || data) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\\\`\\\${apiUrl}/products\\\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || []));
      } catch (err) {
        console.error('Failed to fetch products data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sourceData = propProducts || data || (propData?.products || propData) || fetchedData || [];

  if (loading && !propData && !propProducts && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
${formatPriceFunction}

  const renderProduct = ({ item: product }: { item: Product }) => {
    const isOutOfStock = product.stockStatus === 'out-of-stock';
    const showQuickActions = showActions === product.id;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onProductClick?.(product)}
        onLongPress={() => setShowActions(showActions === product.id ? null : product.id)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {product.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          )}

          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/160' }}
            style={styles.image}
            resizeMode="cover"
          />

          {!isOutOfStock && showQuickActions && (
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickButton, quickAddMutation.isPending && styles.quickButtonDisabled]}
                onPress={() => quickAddMutation.mutate(product)}
                disabled={quickAddMutation.isPending}
              >
                {quickAddMutation.isPending ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : (
                  <>
                    <Ionicons name="cart-outline" size={12} color="#111827" />
                    <Text style={styles.quickButtonText}>{quickAddText}</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButtonIcon}
                onPress={() => onQuickView?.(product)}
              >
                <Ionicons name="eye-outline" size={12} color="#111827" />
              </TouchableOpacity>
            </View>
          )}

          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>{outOfStockText}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              {product.originalPrice && product.originalPrice > product.price && (
                <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
              )}
            </View>

            {product.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
            )}
          </View>

          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>Save {product.discount}%</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={sourceData}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  quickActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  quickButtonDisabled: {
    opacity: 0.7,
  },
  quickButtonText: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  quickButtonIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
    minHeight: 32,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 10,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    color: '#6b7280',
  },
  discountBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 10,
    color: '#065f46',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});`;

      return { code, imports };
    }
  };

  return variants[variant]();
}
