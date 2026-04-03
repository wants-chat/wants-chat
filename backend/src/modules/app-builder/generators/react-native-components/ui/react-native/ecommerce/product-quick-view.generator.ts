/**
 * React Native Product Quick View Generator
 * Generates a modal for quick product preview
 */

export function generateRNProductQuickView(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, Image, Modal, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
    `import { useMutation, useQueryClient } from '@tanstack/react-query';`,
  ];

  const code = `${imports.join('\n')}

const { width, height } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  description?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  category?: string;
  variants?: Array<{
    id: string;
    name: string;
    options: string[];
  }>;
}

interface ProductQuickViewProps {
  productData?: any;
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number, selectedVariants?: any) => void;
  [key: string]: any;
}

export default function ProductQuickView({
  productData: propData,
  product: propProduct,
  visible,
  onClose,
  onAddToCart
}: ProductQuickViewProps) {
  const queryClient = useQueryClient();
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const addToCartMutation = useMutation({
    mutationFn: async (data: { product: Product; quantity: number; selectedVariants: any }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/cart\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: data.product.id,
          quantity: data.quantity,
          variants: data.selectedVariants,
        }),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (onAddToCart) onAddToCart(variables.product, variables.quantity, variables.selectedVariants);
      Alert.alert('Success', 'Added to cart!');
      onClose();
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to add to cart');
    },
  });

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

  const product = propProduct || propData || fetchedData;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? 'star' : 'star-outline'}
          size={16}
          color="#FBBF24"
        />
      );
    }
    return stars;
  };

  const handleAddToCart = () => {
    if (product) {
      addToCartMutation.mutate({ product, quantity, selectedVariants });
    }
  };

  const handleVariantSelect = (variantId: string, option: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantId]: option
    }));
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading && !propProduct && !propData) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, styles.loadingContainer]}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        </View>
      </Modal>
    );
  }

  if (!product) return null;

  const images = product.images || (product.image ? [product.image] : []);
  const currentImage = images[selectedImageIndex] || 'https://via.placeholder.com/400';
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Quick View</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: currentImage }}
                style={styles.productImage}
                resizeMode="cover"
              />
              {discount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{discount}%</Text>
                </View>
              )}
              {images.length > 1 && (
                <View style={styles.imageIndicators}>
                  {images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.indicator,
                        selectedImageIndex === index && styles.indicatorActive
                      ]}
                      onPress={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.productInfo}>
              {product.category && (
                <Text style={styles.category}>{product.category}</Text>
              )}

              <Text style={styles.productName}>{product.name}</Text>

              {product.rating !== undefined && (
                <View style={styles.ratingContainer}>
                  <View style={styles.stars}>
                    {renderStars(product.rating)}
                  </View>
                  <Text style={styles.ratingText}>
                    {product.rating.toFixed(1)}
                  </Text>
                  {product.reviews !== undefined && (
                    <Text style={styles.reviewsText}>
                      ({product.reviews} reviews)
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.priceContainer}>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
                {product.originalPrice && (
                  <Text style={styles.originalPrice}>
                    {formatPrice(product.originalPrice)}
                  </Text>
                )}
              </View>

              <View style={styles.stockContainer}>
                <Ionicons
                  name={product.inStock !== false ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={product.inStock !== false ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.stockText,
                    { color: product.inStock !== false ? '#10B981' : '#EF4444' }
                  ]}
                >
                  {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                </Text>
              </View>

              {product.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.description} numberOfLines={4}>
                    {product.description}
                  </Text>
                </View>
              )}

              {product.variants && product.variants.length > 0 && (
                <View style={styles.variantsContainer}>
                  {product.variants.map((variant) => (
                    <View key={variant.id} style={styles.variantGroup}>
                      <Text style={styles.variantLabel}>{variant.name}</Text>
                      <View style={styles.variantOptions}>
                        {variant.options.map((option) => (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.variantOption,
                              selectedVariants[variant.id] === option &&
                                styles.variantOptionSelected
                            ]}
                            onPress={() => handleVariantSelect(variant.id, option)}
                          >
                            <Text
                              style={[
                                styles.variantOptionText,
                                selectedVariants[variant.id] === option &&
                                  styles.variantOptionTextSelected
                              ]}
                            >
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={decrementQuantity}
                  >
                    <Ionicons name="remove" size={20} color="#111827" />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={incrementQuantity}
                  >
                    <Ionicons name="add" size={20} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                (product.inStock === false || addToCartMutation.isPending) && styles.addToCartButtonDisabled
              ]}
              onPress={handleAddToCart}
              disabled={product.inStock === false || addToCartMutation.isPending}
            >
              {addToCartMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="cart-outline" size={20} color="#fff" />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  productImage: {
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
    borderRadius: 12,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  productInfo: {
    padding: 20,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  variantsContainer: {
    marginBottom: 20,
  },
  variantGroup: {
    marginBottom: 16,
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  variantOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  variantOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  variantOptionText: {
    fontSize: 14,
    color: '#111827',
  },
  variantOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
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
