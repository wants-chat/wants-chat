/**
 * React Native Product Grid Generator
 * Generates a flexible product grid component with API integration and cart functionality
 */

export function generateRNProductGrid(): { code: string; imports: string[] } {
  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

interface ProductGridProps {
  title?: string;
  entity?: string;
  products?: any[];
  data?: any[];
  onProductClick?: (product: any) => void;
  onItemClick?: (item: any) => void;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  columns?: number;
  [key: string]: any;
}

export default function ProductGrid({
  title,
  entity = 'products',
  products,
  data,
  onProductClick,
  onItemClick,
  onAddToCart,
  onToggleWishlist,
  columns = 2,
  ...props
}: ProductGridProps) {
  const queryClient = useQueryClient();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCartMutation = useMutation({
    mutationFn: async (product: any) => {
      const token = await AsyncStorage.getItem('auth_token');
      const userJson = await AsyncStorage.getItem('auth_user');

      if (!token || !userJson) {
        throw new Error('Please login to add items to cart');
      }

      const user = JSON.parse(userJson);
      const userId = user?.id || user?.user_id;
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';

      const response = await fetch(\`\${apiUrl}/cart_items\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify({
          user_id: userId,
          menu_item_id: product.id || product._id,
          quantity: 1,
          customizations: '',
          unit_price: (product.price || 0).toString(),
          total_price: (product.price || 0).toString()
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to add to cart');
      }
      return response.json();
    },
    onSuccess: (data, product) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (onAddToCart) onAddToCart(product.id);
      Alert.alert('Success', 'Added to cart!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to add to cart');
    },
  });

  // Check if we have prop data
  const propData = products || data;

  // Fetch data from API if no props data provided
  useEffect(() => {
    const fetchData = async () => {
      if (propData && propData.length > 0) {
        return; // Skip fetch if we have prop data
      }

      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        const items = Array.isArray(result) ? result : (result?.data || []);
        setFetchedData(items);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products');
        setFetchedData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  // Use provided data if available, otherwise use fetched data
  const sourceData = propData || fetchedData;

  // Add to cart functionality using mutation
  const handleAddToCart = (product: any) => {
    setAddingToCart(product.id);
    addToCartMutation.mutate(product, {
      onSettled: () => setAddingToCart(null),
    });
  };

  const handleToggleWishlist = async (productId: string) => {
    try {
      const newWishlist = new Set(wishlist);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      setWishlist(newWishlist);

      // Save to AsyncStorage
      await AsyncStorage.setItem('wishlist', JSON.stringify(Array.from(newWishlist)));

      if (onToggleWishlist) {
        onToggleWishlist(productId);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  const formatPrice = (priceValue: number | string) => {
    const numericPrice = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;
    if (isNaN(numericPrice)) return priceValue;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericPrice);
  };

  const getDiscount = (itemData: any) => {
    const compareAtPriceValue = itemData.compareAtPrice || itemData.compare_at_price || itemData.originalPrice;
    const itemPrice = typeof itemData.price === 'string' ? parseFloat(itemData.price) : itemData.price;

    if (!compareAtPriceValue || !itemPrice) return 0;

    const comparePriceValue = typeof compareAtPriceValue === 'string' ? parseFloat(compareAtPriceValue) : compareAtPriceValue;
    return Math.round(((comparePriceValue - itemPrice) / comparePriceValue) * 100);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={\`star-\${i}\`} name="star" size={12} color="#fbbf24" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="star-half" name="star-half" size={12} color="#fbbf24" />);
    }
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={\`star-empty-\${i}\`} name="star-outline" size={12} color="#d1d5db" />);
    }
    return stars;
  };

  const handleItemPress = (item: any) => {
    if (onItemClick) {
      onItemClick(item);
    } else if (onProductClick) {
      onProductClick(item);
    }
  };

  const handleImageError = (id: string) => {
    setFailedImages(prev => new Set(prev).add(id));
  };

  const renderProduct = ({ item }: { item: any }) => {
    const itemId = item.id || item._id || '';
    const discountPercent = getDiscount(item);
    const isInWishlist = wishlist.has(itemId);
    const itemName = item.name || item.title || '';
    const itemPrice = item.price || item.delivery_fee || 0;
    const itemImageUrl = item.cover_image || item.image_url || item.image || item.images?.[0] || '';
    const itemRating = item.rating ? parseFloat(item.rating) : 0;
    const reviewsCount = item.reviewCount || item.reviews_count || 0;
    const isItemFeatured = item.is_featured || false;
    const hasFailedImage = failedImages.has(itemId);

    // Generate fallback image URL based on item name
    const fallbackImageUrl = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(itemName || 'Item')}&size=400&background=random\`;
    // Use fallback if image failed to load OR if no valid image URL exists
    const displayImageUrl = (hasFailedImage || !itemImageUrl || itemImageUrl.trim() === '') ? fallbackImageUrl : itemImageUrl;

    return (
      <TouchableOpacity
        style={[styles.productCard, { width: (width - 48) / columns }]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: displayImageUrl }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => handleImageError(itemId)}
          />
          {(discountPercent > 0 || isItemFeatured) && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {isItemFeatured ? 'Featured' : \`-\${discountPercent}%\`}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => handleToggleWishlist(itemId)}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={20}
              color={isInWishlist ? '#ef4444' : '#6b7280'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {itemName}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(itemPrice)}</Text>
            {item.estimated_delivery_time && (
              <Text style={styles.comparePrice}>{item.estimated_delivery_time} min</Text>
            )}
          </View>

          {itemRating > 0 && (
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>{renderStars(itemRating > 10 ? itemRating / 100 : itemRating)}</View>
              <Text style={styles.reviewCount}>
                ({reviewsCount})
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              addingToCart === item.id && styles.addToCartButtonDisabled
            ]}
            onPress={() => handleAddToCart(item)}
            disabled={addingToCart === item.id}
          >
            {addingToCart === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (sourceData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>No items available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={sourceData}
        renderItem={renderProduct}
        keyExtractor={(item, index) => item.id || item._id || index.toString()}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: ITEM_WIDTH,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    minHeight: 40,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  comparePrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 4,
    minHeight: 36,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});`;

  return {
    code,
    imports: []
  };
}
