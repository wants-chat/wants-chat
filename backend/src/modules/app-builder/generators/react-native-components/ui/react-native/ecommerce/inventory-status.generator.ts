/**
 * React Native Inventory Status Generator
 * Generates an inventory status component showing product availability
 */

export function generateRNInventoryStatus(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
    `import { useMutation, useQueryClient } from '@tanstack/react-query';`,
  ];

  const code = `${imports.join('\n')}

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'coming_soon' | 'pre_order';
  stockCount: number;
  lowStockThreshold?: number;
  restockDate?: string;
  releaseDate?: string;
}

interface InventoryStatusProps {
  inventoryData?: any;
  products?: Product[];
  inStockText?: string;
  lowStockText?: string;
  outOfStockText?: string;
  comingSoonText?: string;
  preOrderText?: string;
  addToCartText?: string;
  notifyMeText?: string;
  restockAlertText?: string;
  emailPlaceholder?: string;
  onAddToCart?: (product: Product) => void;
  onNotify?: (product: Product, email: string) => void;
  [key: string]: any;
}

export default function InventoryStatus({
  inventoryData: propData,
  products: propProducts = [],
  inStockText = 'In Stock',
  lowStockText = 'Low Stock',
  outOfStockText = 'Out of Stock',
  comingSoonText = 'Coming Soon',
  preOrderText = 'Pre-Order',
  addToCartText = 'Add to Cart',
  notifyMeText = 'Notify Me',
  restockAlertText = 'Get Restock Alert',
  emailPlaceholder = 'Enter your email',
  onAddToCart,
  onNotify
}: InventoryStatusProps) {
  const queryClient = useQueryClient();
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [addingProductId, setAddingProductId] = useState<string | number | null>(null);

  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/cart\`, {
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
      setAddingProductId(null);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to add to cart');
      setAddingProductId(null);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (propData || propProducts.length > 0) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/products\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || []));
      } catch (err) {
        console.error('Failed to fetch inventory data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData;
  const products = propProducts.length > 0 ? propProducts : (data?.products || (Array.isArray(data) ? data : []));

  if (loading && !propData && propProducts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const configs: any = {
      in_stock: { text: inStockText, icon: 'checkmark-circle', color: '#10b981' },
      low_stock: { text: lowStockText, icon: 'alert-circle', color: '#f97316' },
      out_of_stock: { text: outOfStockText, icon: 'close-circle', color: '#ef4444' },
      coming_soon: { text: comingSoonText, icon: 'time', color: '#3b82f6' },
      pre_order: { text: preOrderText, icon: 'calendar', color: '#8b5cf6' },
    };

    const config = configs[status] || configs.in_stock;

    return (
      <View style={[styles.statusBadge, { backgroundColor: \`\${config.color}15\` }]}>
        <Ionicons name={config.icon as any} size={14} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
      </View>
    );
  };

  const getStockPercentage = (stockCount: number, lowStockThreshold: number = 10) => {
    const maxStock = lowStockThreshold * 4;
    return Math.min((stockCount / maxStock) * 100, 100);
  };

  const getStockBarColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return '#10b981';
      case 'low_stock':
        return '#f97316';
      default:
        return '#d1d5db';
    }
  };

  const handleAddToCart = (product: Product) => {
    setAddingProductId(product.id);
    addToCartMutation.mutate(product);
  };

  const handleNotify = (product: Product) => {
    setSelectedProduct(product);
    setShowNotificationModal(true);
  };

  const submitNotification = () => {
    if (selectedProduct && notificationEmail) {
      onNotify?.(selectedProduct, notificationEmail);
      setShowNotificationModal(false);
      setNotificationEmail('');
      setSelectedProduct(null);
    }
  };

  const renderProduct = ({ item: product }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.statusBadgeContainer}>
          {getStatusBadge(product.status)}
        </View>
      </View>

      <View style={styles.productContent}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>

        {/* In Stock */}
        {product.status === 'in_stock' && (
          <View style={styles.statusSection}>
            <View style={styles.stockInfo}>
              <Text style={styles.stockLabel}>Availability</Text>
              <Text style={styles.stockValue}>{product.stockCount} units</Text>
            </View>
            <View style={styles.stockBar}>
              <View
                style={[
                  styles.stockBarFill,
                  {
                    width: \`\${getStockPercentage(product.stockCount, product.lowStockThreshold)}%\`,
                    backgroundColor: getStockBarColor(product.status)
                  }
                ]}
              />
            </View>
            <TouchableOpacity
              style={[styles.addToCartButton, addingProductId === product.id && styles.addToCartButtonDisabled]}
              onPress={() => handleAddToCart(product)}
              disabled={addingProductId === product.id}
            >
              {addingProductId === product.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="cart" size={18} color="#fff" />
                  <Text style={styles.addToCartText}>{addToCartText}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Low Stock */}
        {product.status === 'low_stock' && (
          <View style={styles.statusSection}>
            <Text style={styles.lowStockWarning}>
              Only {product.stockCount} left!
            </Text>
            <View style={styles.stockBar}>
              <View
                style={[
                  styles.stockBarFill,
                  {
                    width: \`\${getStockPercentage(product.stockCount, product.lowStockThreshold)}%\`,
                    backgroundColor: getStockBarColor(product.status)
                  }
                ]}
              />
            </View>
            <TouchableOpacity
              style={[styles.addToCartButton, addingProductId === product.id && styles.addToCartButtonDisabled]}
              onPress={() => handleAddToCart(product)}
              disabled={addingProductId === product.id}
            >
              {addingProductId === product.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="cart" size={18} color="#fff" />
                  <Text style={styles.addToCartText}>{addToCartText}</Text>
                </>
              )}
          </View>
        )}

        {/* Out of Stock */}
        {product.status === 'out_of_stock' && (
          <View style={styles.statusSection}>
            {product.restockDate && (
              <Text style={styles.restockText}>
                Expected restock: {formatDate(product.restockDate)}
              </Text>
            )}
            <TouchableOpacity
              style={styles.notifyButton}
              onPress={() => handleNotify(product)}
            >
              <Ionicons name="notifications" size={18} color="#3b82f6" />
              <Text style={styles.notifyButtonText}>{restockAlertText}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Coming Soon */}
        {product.status === 'coming_soon' && (
          <View style={styles.statusSection}>
            {product.releaseDate && (
              <Text style={styles.releaseText}>
                Available from: {formatDate(product.releaseDate)}
              </Text>
            )}
            <TouchableOpacity
              style={styles.notifyButton}
              onPress={() => handleNotify(product)}
            >
              <Ionicons name="notifications" size={18} color="#3b82f6" />
              <Text style={styles.notifyButtonText}>{notifyMeText}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pre-Order */}
        {product.status === 'pre_order' && (
          <View style={styles.statusSection}>
            {product.releaseDate && (
              <Text style={styles.releaseText}>
                Ships on: {formatDate(product.releaseDate)}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.preOrderButton, addingProductId === product.id && styles.preOrderButtonDisabled]}
              onPress={() => handleAddToCart(product)}
              disabled={addingProductId === product.id}
            >
              {addingProductId === product.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="calendar" size={18} color="#fff" />
                  <Text style={styles.preOrderText}>Pre-Order Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Notification Modal */}
      <Modal
        visible={showNotificationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Get Notified</Text>
            <Text style={styles.modalSubtitle}>
              We'll email you when {selectedProduct?.name} is back in stock
            </Text>

            <TextInput
              style={styles.emailInput}
              placeholder={emailPlaceholder}
              value={notificationEmail}
              onChangeText={setNotificationEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowNotificationModal(false);
                  setNotificationEmail('');
                  setSelectedProduct(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitNotification}
              >
                <Text style={styles.submitButtonText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productContent: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statusSection: {
    marginTop: 8,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  stockBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  stockBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  lowStockWarning: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
    marginBottom: 12,
  },
  restockText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  releaseText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  addToCartButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 8,
  },
  notifyButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  preOrderButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  preOrderButtonDisabled: {
    backgroundColor: '#c4b5fd',
  },
  preOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
