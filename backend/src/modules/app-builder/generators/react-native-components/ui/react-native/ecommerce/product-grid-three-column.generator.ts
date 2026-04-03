/**
 * React Native Product Grid Three Column Generator
 * Generates a 3-column product grid component for React Native that accepts props
 */

export function generateRNProductGridThreeColumn(): { code: string; imports: string[] } {
  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getVariantStyles, DesignVariant, ColorScheme } from '@/lib/design-variants';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with 16px padding on sides and 8px gaps

interface ProductGridThreeColumnProps {
  title?: string;
  entity?: string;
  data?: any[];
  onItemClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function ProductGridThreeColumn({
  title = 'All Products',
  entity = 'products',
  data: propData,
  onItemClick,
  onReadMore,
  variant = 'minimal',
  colorScheme = 'blue',
  ...props
}: ProductGridThreeColumnProps) {
  const queryClient = useQueryClient();
  const { colors, modifiers } = getVariantStyles(variant, colorScheme);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCartMutation = useMutation({
    mutationFn: async (item: any) => {
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
          menu_item_id: item.id || item._id,
          quantity: 1,
          customizations: '',
          unit_price: (item.price || 0).toString(),
          total_price: (item.price || 0).toString()
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to add to cart');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      Alert.alert('Success', 'Added to cart!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to add to cart');
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
        setFetchedData(Array.isArray(result) ? result : (result?.data || []));
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const data = propData && propData.length > 0 ? propData : fetchedData;

  // Debug: Log the data structure
  console.log('[ProductGrid] Received data:', {
    dataLength: data.length,
    firstItem: data[0],
    dataType: typeof data,
    isArray: Array.isArray(data)
  });

  const handleAddToCart = (item: any) => {
    setAddingToCart(item.id);
    addToCartMutation.mutate(item, {
      onSettled: () => setAddingToCart(null),
    });
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

  const handleItemPress = (item: any) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleImageError = (id: string) => {
    console.log('[ProductGrid] Image failed to load for item:', id);
    setFailedImages(prev => new Set(prev).add(id));
  };

  const renderProduct = ({ item }: { item: any }) => {
    const itemId = item.id || item._id || '';
    const discountPercent = getDiscount(item);
    const itemName = item.name || item.title || '';
    const itemPrice = item.price || item.delivery_fee || 0;
    const itemImage = item.cover_image || item.image_url || item.images?.[0] || '';
    const itemRating = item.rating ? parseFloat(item.rating) : 0;
    const isItemFeatured = item.is_featured || false;
    const hasFailedImage = failedImages.has(itemId);

    // Debug logging
    console.log('[ProductGrid] Item:', {
      id: itemId,
      name: itemName,
      cover_image: item.cover_image,
      image_url: item.image_url,
      itemImage: itemImage,
      hasFailedImage: hasFailedImage
    });

    // Generate fallback image URL based on item name
    const fallbackImageUrl = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(itemName || 'Item')}&size=400&background=random\`;
    // Use fallback if image failed to load OR if no valid image URL exists
    const displayImageUrl = (hasFailedImage || !itemImage || itemImage.trim() === '') ? fallbackImageUrl : itemImage;

    console.log('[ProductGrid] Display URL:', displayImageUrl);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image
            key={displayImageUrl}
            source={{ uri: displayImageUrl, cache: 'force-cache' }}
            style={styles.productImage}
            resizeMode="cover"
            onError={(error) => {
              console.log('[ProductGrid] Image error:', error.nativeEvent.error, 'for URL:', displayImageUrl);
              handleImageError(itemId);
            }}
            onLoad={() => console.log('[ProductGrid] Image loaded successfully:', displayImageUrl)}
            onLoadStart={() => console.log('[ProductGrid] Image loading started:', displayImageUrl)}
            onLoadEnd={() => console.log('[ProductGrid] Image loading ended:', displayImageUrl)}
          />
          {(discountPercent > 0 || isItemFeatured) && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {isItemFeatured ? 'Featured' : \`-\${discountPercent}%\`}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {itemName}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{formatPrice(itemPrice)}</Text>
            {item.estimated_delivery_time && (
              <Text style={styles.comparePrice}>{item.estimated_delivery_time} min</Text>
            )}
          </View>
          {itemRating > 0 && (
            <Text style={styles.rating}>
              ⭐ {itemRating > 10 ? (itemRating / 100).toFixed(1) : itemRating.toFixed(1)}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.addToCartButton, addingToCart === itemId && styles.addToCartButtonDisabled]}
            onPress={(e) => {
              e.stopPropagation();
              handleAddToCart(item);
            }}
            disabled={addingToCart === itemId}
          >
            {addingToCart === itemId ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.cartIcon}>🛒</Text>
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 8,
    },
    row: {
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 16,
    },
    productCard: {
      flex: 1,
      maxWidth: ITEM_WIDTH,
      backgroundColor: colors.surface,
      borderRadius: modifiers.borderRadius,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: modifiers.shadowOffset },
      shadowOpacity: modifiers.shadowOpacity,
      shadowRadius: modifiers.shadowRadius,
      elevation: modifiers.shadowRadius,
      marginBottom: 8,
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: colors.border,
      overflow: 'hidden',
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    discountBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: colors.accent,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: modifiers.borderRadius / 2,
    },
    discountText: {
      color: colors.textOnPrimary,
      fontSize: 10,
      fontWeight: '700',
    },
    productInfo: {
      padding: 12,
    },
    productName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      minHeight: 32,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginRight: 4,
    },
    comparePrice: {
      fontSize: 11,
      color: colors.textMuted,
    },
    rating: {
      fontSize: 10,
      color: colors.textMuted,
    },
    addToCartButton: {
      marginTop: 8,
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: modifiers.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    addToCartButtonDisabled: {
      backgroundColor: colors.primaryLight,
    },
    cartIcon: {
      fontSize: 14,
      marginRight: 4,
    },
    addToCartText: {
      color: colors.textOnPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      minHeight: 200,
    },
  });

  if (loading && (!propData || propData.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No items available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={data}
        renderItem={renderProduct}
        keyExtractor={(item, index) => item.id || item._id || index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}`;

  return {
    code,
    imports: []
  };
}
