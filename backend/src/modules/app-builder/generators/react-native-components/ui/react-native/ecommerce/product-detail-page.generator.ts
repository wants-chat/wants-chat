/**
 * React Native Product Detail Page Generator
 * Generates a full product detail page component for React Native
 * Matches the React web implementation with ResolvedComponent support
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRNProductDetailPage = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'minimal' | 'withReviews' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
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

  const dataName = getDataPath();

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/lib/api';`;

  const variants = {
    standard: `
${commonImports}

const { width } = Dimensions.get('window');

interface ProductDetailPageProps {
  ${dataName}?: any;
  productId?: string;
  onAddToCart?: (product: any) => void;
  onToggleWishlist?: (productId: string) => void;
  [key: string]: any;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ ${dataName}, productId: propProductId, onAddToCart, onToggleWishlist }) => {
  const queryClient = useQueryClient();

  // Fetch product data if only ID is provided
  const { data: apiProduct, isLoading } = useQuery({
    queryKey: ['product', propProductId],
    queryFn: async () => {
      const response = await apiClient.get(\`/products/\${propProductId}\`);
      return response;
    },
    enabled: !${dataName} && !!propProductId,
  });

  const product = ${dataName} || apiProduct || {};

  const productId = ${getField('id')};
  const name = ${getField('name')};
  const price = ${getField('price')};
  const originalPrice = ${getField('originalPrice')};
  const description = ${getField('description')};
  const images = ${getField('images')};
  const rating = ${getField('rating')};
  const reviewCount = ${getField('reviewCount')};
  const reviews = ${getField('reviews')};
  const stockStatus = ${getField('stockStatus')};
  const stockCount = ${getField('stockCount')};
  const category = ${getField('category')};
  const brand = ${getField('brand')};
  const features = ${getField('features')};
  const variants = ${getField('variants')};

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const addToCartMutation = useMutation({
    mutationFn: async (cartItem: any) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/cart\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItem),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: (data, cartItem) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      Alert.alert('Success', \`Added \${cartItem.quantity} item(s) to cart!\`);
      if (onAddToCart) onAddToCart(cartItem);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to add to cart');
    },
  });

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  };

  // Load wishlist status from AsyncStorage
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const wishlistData = await AsyncStorage.getItem('wishlist');
        if (wishlistData) {
          const wishlist = JSON.parse(wishlistData);
          setIsInWishlist(wishlist.includes(productId));
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    };
    if (productId) {
      loadWishlist();
    }
  }, [productId]);

  // Set initial variant selection
  useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants]);

  const handleAddToCart = async () => {
    // Create cart item
    const cartItem = {
      id: \`\${productId}-\${selectedVariant?.id || 'default'}\`,
      productId,
      name: selectedVariant ? \`\${name} - \${selectedVariant.name}\` : name,
      price: selectedVariant?.price || price,
      quantity,
      image: images[0],
      variant: selectedVariant,
    };

    // Also save to AsyncStorage as fallback
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      const cart = existingCart ? JSON.parse(existingCart) : [];
      const existingItemIndex = cart.findIndex((item: any) => item.id === cartItem.id);

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push(cartItem);
      }
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('AsyncStorage error:', error);
    }

    // Make API call via mutation
    addToCartMutation.mutate(cartItem);
  };

  const handleToggleWishlist = async () => {
    try {
      const wishlistData = await AsyncStorage.getItem('wishlist');
      const wishlist = wishlistData ? JSON.parse(wishlistData) : [];

      let updatedWishlist;
      if (isInWishlist) {
        updatedWishlist = wishlist.filter((id: string) => id !== productId);
      } else {
        updatedWishlist = [...wishlist, productId];
      }

      await AsyncStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsInWishlist(!isInWishlist);

      if (onToggleWishlist) {
        onToggleWishlist(productId);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={\`star-\${i}\`} name="star" size={14} color="#fbbf24" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="star-half" name="star-half" size={14} color="#fbbf24" />);
    }
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={\`star-empty-\${i}\`} name="star-outline" size={14} color="#d1d5db" />);
    }
    return stars;
  };

  const isOutOfStock = stockStatus === 'out-of-stock';
  const isLowStock = stockStatus === 'low-stock';

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Image Gallery */}
      <View style={styles.imageSection}>
        <View style={styles.mainImageContainer}>
          <Image
            source={{ uri: images[selectedImage] || images[0] || 'https://via.placeholder.com/400' }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.wishlistButton} onPress={handleToggleWishlist}>
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={24}
              color={isInWishlist ? '#ef4444' : '#6b7280'}
            />
          </TouchableOpacity>
        </View>

        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
            {images.map((img: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[styles.thumbnail, selectedImage === index && styles.thumbnailActive]}
                onPress={() => setSelectedImage(index)}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoSection}>
        {brand && <Text style={styles.brand}>{brand}</Text>}
        <Text style={styles.name}>{name}</Text>

        {category && <Text style={styles.category}>{category}</Text>}

        {/* Rating */}
        {rating && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>{renderStars(rating)}</View>
            <Text style={styles.ratingText}>{rating}</Text>
            {reviewCount > 0 && <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>}
          </View>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(price)}</Text>
          {originalPrice && originalPrice > price && (
            <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
          )}
        </View>

        {/* Stock Status */}
        {isLowStock && stockCount > 0 && (
          <View style={styles.lowStockBadge}>
            <Ionicons name="alert-circle" size={16} color="#f59e0b" />
            <Text style={styles.lowStockText}>Only {stockCount} left in stock</Text>
          </View>
        )}

        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Features */}
        {features && features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            {features.map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Product Variants */}
        {variants && variants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>
            <View style={styles.variantsContainer}>
              {variants.map((variant: any) => (
                <TouchableOpacity
                  key={variant.id}
                  style={[
                    styles.variantChip,
                    selectedVariant?.id === variant.id && styles.variantChipSelected
                  ]}
                  onPress={() => setSelectedVariant(variant)}
                >
                  <Text style={[
                    styles.variantText,
                    selectedVariant?.id === variant.id && styles.variantTextSelected
                  ]}>
                    {variant.name}
                  </Text>
                  {variant.price && variant.price !== price && (
                    <Text style={[
                      styles.variantPrice,
                      selectedVariant?.id === variant.id && styles.variantPriceSelected
                    ]}>
                      {formatPrice(variant.price)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Customer Reviews */}
        {reviews && reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            {reviews.slice(0, 3).map((review: any, index: number) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.author || review.user_name || 'Anonymous'}</Text>
                  <View style={styles.reviewRating}>
                    <View style={styles.stars}>{renderStars(review.rating || 0)}</View>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment || review.text}</Text>
                {review.date && (
                  <Text style={styles.reviewDate}>
                    {new Date(review.date).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
            {reviews.length > 3 && (
              <TouchableOpacity style={styles.viewAllReviews}>
                <Text style={styles.viewAllReviewsText}>View all {reviews.length} reviews</Text>
                <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quantity Selector */}
        {!isOutOfStock && (
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[styles.addToCartButton, (isOutOfStock || addToCartMutation.isPending) && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={isOutOfStock || addToCartMutation.isPending}
        >
          {addToCartMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={20} color="#fff" />
              <Text style={styles.addToCartText}>
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  imageSection: {
    backgroundColor: '#f9fafb',
  },
  mainImageContainer: {
    width: width,
    height: width,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailScroll: {
    padding: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: '#3b82f6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    padding: 16,
  },
  brand: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
    gap: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 20,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  lowStockText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  outOfStockBadge: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  outOfStockText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '700',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantChip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  variantChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  variantText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  variantTextSelected: {
    color: '#fff',
  },
  variantPrice: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  variantPriceSelected: {
    color: '#e0e7ff',
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  viewAllReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  viewAllReviewsText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default ProductDetailPage;
    `,

    minimal: `
${commonImports}

interface ProductDetailPageProps {
  ${dataName}?: any;
  onAddToCart?: (product: any) => void;
  [key: string]: any;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ ${dataName}, onAddToCart }) => {
  const product = ${dataName} || {};

  const name = ${getField('name')};
  const price = ${getField('price')};
  const description = ${getField('description')};
  const image = ${getField('image')};
  const stockStatus = ${getField('stockStatus')};

  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice);
  };

  const isOutOfStock = stockStatus === 'out-of-stock';

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: image || 'https://via.placeholder.com/400' }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>{formatPrice(price)}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={16} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={16} color="#111827" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, isOutOfStock && styles.buttonDisabled]}
          onPress={() => onAddToCart && onAddToCart({ ...product, quantity })}
          disabled={isOutOfStock}
        >
          <Text style={styles.buttonText}>
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', aspectRatio: 1 },
  info: { padding: 16 },
  name: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  price: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 16 },
  description: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  qtyButton: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 16, fontWeight: '600', minWidth: 32, textAlign: 'center' },
  button: { backgroundColor: '#3b82f6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9ca3af' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ProductDetailPage;
    `,

    withReviews: `
${commonImports}

const { width } = Dimensions.get('window');

interface ProductDetailPageProps {
  ${dataName}?: any;
  [key: string]: any;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ ${dataName} }) => {
  const product = ${dataName} || {};

  const name = ${getField('name')};
  const price = ${getField('price')};
  const description = ${getField('description')};
  const images = ${getField('images')};
  const rating = ${getField('rating')};
  const reviewCount = ${getField('reviewCount')};
  const reviews = ${getField('reviews')};

  const [selectedImage, setSelectedImage] = useState(0);

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice);
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: images[selectedImage] || images[0] }}
        style={styles.mainImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>{formatPrice(price)}</Text>

        {rating && (
          <View style={styles.rating}>
            <Ionicons name="star" size={16} color="#fbbf24" />
            <Text style={styles.ratingText}>{rating}</Text>
            <Text style={styles.reviewText}>({reviewCount} reviews)</Text>
          </View>
        )}

        <Text style={styles.description}>{description}</Text>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          {reviews.map((review: any, index: number) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{review.author}</Text>
                <View style={styles.reviewRating}>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={styles.reviewRatingText}>{review.rating}</Text>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.comment}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mainImage: { width: width, height: width },
  content: { padding: 16 },
  name: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  price: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 12 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  ratingText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  reviewText: { fontSize: 14, color: '#6b7280' },
  description: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  reviewsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16 },
  reviewCard: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewAuthor: { fontSize: 14, fontWeight: '600', color: '#111827' },
  reviewRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewRatingText: { fontSize: 12, color: '#6b7280' },
  reviewDate: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  button: { backgroundColor: '#3b82f6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ProductDetailPage;
    `
  };

  const code = variants[variant] || variants.standard;
  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
      "import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';",
      "import AsyncStorage from '@react-native-async-storage/async-storage';",
      "import { apiClient } from '@/lib/api';",
    ],
  };
};
