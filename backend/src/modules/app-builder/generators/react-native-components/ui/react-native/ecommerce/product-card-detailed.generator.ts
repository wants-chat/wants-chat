/**
 * React Native Product Card Detailed Generator
 * Generates a detailed product card component for React Native
 */

export const generateRNProductCardDetailed = () => {
  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  inventoryQuantity?: number;
  category?: string;
  brand?: string;
}

// Mock products with real images and detailed info
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Noise-Cancelling Headphones',
    description: 'Experience superior sound quality with active noise cancellation, 30-hour battery life, and premium comfort for all-day listening.',
    price: 79.99,
    compareAtPrice: 99.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'],
    rating: 4.5,
    reviewCount: 1247,
    inStock: true,
    inventoryQuantity: 15,
    category: 'Electronics',
    brand: 'AudioTech'
  },
  {
    id: '2',
    name: 'Smart Watch Pro - Fitness & Health Tracker',
    description: 'Track your fitness goals with advanced health monitoring, GPS, water resistance, and 7-day battery life. Perfect for active lifestyles.',
    price: 299.99,
    compareAtPrice: 399.99,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'],
    rating: 4.8,
    reviewCount: 892,
    inStock: true,
    inventoryQuantity: 8,
    category: 'Wearables',
    brand: 'TechFit'
  },
  {
    id: '3',
    name: 'Professional Laptop Backpack with USB Port',
    description: 'Durable, water-resistant backpack with dedicated laptop compartment, USB charging port, and anti-theft design. Perfect for travel and work.',
    price: 49.99,
    compareAtPrice: 69.99,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop'],
    rating: 4.3,
    reviewCount: 543,
    inStock: true,
    inventoryQuantity: 32,
    category: 'Accessories',
    brand: 'TravelPro'
  },
];

interface ProductCardDetailedProps {
  data?: Product[];
  entity?: string;
  [key: string]: any;
}

const ProductCardDetailed: React.FC<ProductCardDetailedProps> = ({
  data: propData,
  entity = 'products',
}) => {
  const queryClient = useQueryClient();
  const [fetchedData, setFetchedData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      setAddingProductId(product.id);
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/cart\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1, name: product.name, price: product.price }),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: (data, product) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      Alert.alert('Added to Cart', \`\${product.name} has been added to your cart!\`);
      setAddingProductId(null);
    },
    onError: (error: any, product) => {
      Alert.alert('Error', error?.message || 'Failed to add to cart');
      setAddingProductId(null);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (propData && propData.length > 0) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        const data = Array.isArray(result) ? result : (result?.data || []);
        setFetchedData(data.length > 0 ? data : MOCK_PRODUCTS);
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
        setFetchedData(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const products = propData && propData.length > 0 ? propData : (fetchedData.length > 0 ? fetchedData : MOCK_PRODUCTS);

  const handleProductPress = (product: Product) => {
    Alert.alert('Product Details', \`View full details for \${product.name}\`);
  };

  const handleAddToCart = (product: Product) => {
    addToCartMutation.mutate(product);
  };

  const handleAddToWishlist = (product: Product) => {
    Alert.alert('Added to Wishlist', \`\${product.name} has been saved to your wishlist!\`);
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderProduct = (product: Product) => {
    const discount = product.compareAtPrice
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        key={product.id}
        style={styles.card}
        onPress={() => handleProductPress(product)}
        activeOpacity={0.95}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images?.[0] || 'https://via.placeholder.com/400' }}
            style={styles.image}
            resizeMode="cover"
          />
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}% OFF</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={(e) => {
              e.stopPropagation();
              handleAddToWishlist(product);
            }}
          >
            <Text style={styles.wishlistIcon}>♡</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {product.category && (
            <Text style={styles.category}>{product.category}</Text>
          )}

          <Text style={styles.name}>{product.name}</Text>

          {product.description && (
            <Text style={styles.description} numberOfLines={3}>
              {product.description}
            </Text>
          )}

          {product.brand && (
            <Text style={styles.brand}>by {product.brand}</Text>
          )}

          <View style={styles.ratingRow}>
            {product.rating && (
              <>
                <Text style={styles.ratingText}>⭐ {product.rating.toFixed(1)}</Text>
                {product.reviewCount && (
                  <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
                )}
              </>
            )}
          </View>

          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              {product.compareAtPrice && (
                <Text style={styles.comparePrice}>
                  {formatPrice(product.compareAtPrice)}
                </Text>
              )}
            </View>
            {discount > 0 && (
              <Text style={styles.savings}>
                Save {formatPrice(product.compareAtPrice! - product.price)}
              </Text>
            )}
          </View>

          <View style={styles.stockInfo}>
            {product.inStock ? (
              <>
                <View style={styles.inStockDot} />
                <Text style={styles.inStockText}>
                  In Stock
                  {product.inventoryQuantity && product.inventoryQuantity < 10 &&
                    \` - Only \${product.inventoryQuantity} left!\`
                  }
                </Text>
              </>
            ) : (
              <>
                <View style={styles.outOfStockDot} />
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </>
            )}
          </View>

          {product.inStock && (
            <TouchableOpacity
              style={[styles.addToCartButton, addingProductId === product.id && styles.addToCartButtonDisabled]}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              disabled={addingProductId === product.id}
            >
              {addingProductId === product.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.addToCartText}>🛒 Add to Cart</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && (!propData || propData.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Premium Products</Text>
      {products.map(product => renderProduct(product))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  wishlistButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wishlistIcon: {
    fontSize: 24,
    color: '#EF4444',
  },
  content: {
    padding: 16,
  },
  category: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  comparePrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  savings: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inStockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  inStockText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  outOfStockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  outOfStockText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});

export default ProductCardDetailed;`;

  return { code, imports: [] };
};
