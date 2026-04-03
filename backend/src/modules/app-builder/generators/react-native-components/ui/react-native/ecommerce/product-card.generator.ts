/**
 * React Native Product Card Generator
 * Generates a single product card component
 */

export function generateRNProductCard(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
    `import { useMutation, useQueryClient } from '@tanstack/react-query';`,
  ];

  const code = `${imports.join('\n')}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  description?: string;
}

interface ProductCardProps {
  productData?: any;
  product?: Product;
  onPress?: () => void;
  onAddToCart?: (productId: string) => void;
  [key: string]: any;
}

export default function ProductCard({
  productData: propData,
  product: propProduct,
  onPress,
  onAddToCart
}: ProductCardProps) {
  const queryClient = useQueryClient();
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: string; quantity: number }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/cart\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (onAddToCart) onAddToCart(product.id);
      Alert.alert('Success', 'Added to cart!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to add to cart');
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (propData || propProduct) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/products\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data?.[0] || result));
      } catch (err) {
        console.error('Failed to fetch product data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const product = propProduct || propData || fetchedData || { id: '', name: '', price: 0 };

  if (loading && !propData && !propProduct) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const formatPrice = (price: number) => \`$\${price.toFixed(2)}\`;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? 'star' : 'star-outline'}
          size={14}
          color="#fbbf24"
        />
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: product.image || 'https://via.placeholder.com/200' }}
        style={styles.image}
        resizeMode="cover"
      />

      <TouchableOpacity
        style={styles.wishlistButton}
        onPress={() => setIsInWishlist(!isInWishlist)}
      >
        <Ionicons
          name={isInWishlist ? 'heart' : 'heart-outline'}
          size={20}
          color={isInWishlist ? '#ef4444' : '#6b7280'}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {product.description && (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        )}

        {product.rating !== undefined && (
          <View style={styles.rating}>{renderStars(product.rating)}</View>
        )}

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>

          {onAddToCart && (
            <TouchableOpacity
              style={[styles.cartButton, addToCartMutation.isPending && styles.cartButtonDisabled]}
              onPress={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              {addToCartMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="cart-outline" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  wishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  cartButton: {
    backgroundColor: '#3b82f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonDisabled: {
    backgroundColor: '#93c5fd',
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
