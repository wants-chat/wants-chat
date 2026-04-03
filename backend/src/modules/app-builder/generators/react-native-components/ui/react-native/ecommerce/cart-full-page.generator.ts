/**
 * React Native Cart Full Page Generator
 * Generates a full page shopping cart component for React Native
 */

export const generateRNCartFullPage = () => {
  const code = `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images?: string[];
  maxQuantity?: number;
}

interface CartFullPageProps {
  cartData?: any;
  [key: string]: any;
}

// Default cart data fallback
const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: '1',
    productId: '1',
    name: 'Wireless Headphones',
    price: 79.99,
    quantity: 1,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'],
    maxQuantity: 5
  },
  {
    id: '2',
    productId: '2',
    name: 'Smart Watch',
    price: 199.99,
    quantity: 2,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'],
    maxQuantity: 3
  },
];

const CartFullPage: React.FC<CartFullPageProps> = ({ cartData: propData }) => {
  const queryClient = useQueryClient();
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/cart/\${itemId}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error('Failed to update quantity');
      return { itemId, quantity };
    },
    onSuccess: ({ itemId, quantity }) => {
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setUpdatingItemId(null);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to update quantity');
      setUpdatingItemId(null);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/cart/\${itemId}\`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove item');
      return itemId;
    },
    onSuccess: (itemId) => {
      setItems(prev => prev.filter((item: any) => item.id !== itemId));
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to remove item');
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/orders\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
          total: subtotal + shipping + tax,
        }),
      });
      if (!response.ok) throw new Error('Checkout failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      Alert.alert('Success', \`Order #\${data.id || data.orderId || 'created'} placed successfully!\`);
      setItems([]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Checkout failed');
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (propData) {
        setItems(propData.items || propData || DEFAULT_CART_ITEMS);
        return;
      }
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/cart\`);
        const result = await response.json();
        const cartItems = result?.items || (Array.isArray(result) ? result : null) || DEFAULT_CART_ITEMS;
        setItems(cartItems);
        setFetchedData(result);
      } catch (err) {
        console.error('Failed to fetch cart data:', err);
        setItems(DEFAULT_CART_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            onPress: () => handleRemoveItem(item.id),
            style: 'destructive'
          }
        ]
      );
      return;
    }
    if (item.maxQuantity && newQuantity > item.maxQuantity) {
      Alert.alert('Maximum Quantity', \`Only \${item.maxQuantity} available in stock\`);
      return;
    }
    setUpdatingItemId(item.id);
    updateQuantityMutation.mutate({ itemId: item.id, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleCheckout = () => {
    Alert.alert(
      'Checkout',
      'Proceed to checkout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => checkoutMutation.mutate()
        }
      ]
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Add some products to get started!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Shopping Cart ({items.length} items)</Text>

        {items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image
              source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>

              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={[styles.quantityButton, updatingItemId === item.id && styles.quantityButtonDisabled]}
                  onPress={() => handleQuantityChange(item, -1)}
                  disabled={updatingItemId === item.id}
                >
                  {updatingItemId === item.id ? (
                    <ActivityIndicator size="small" color="#111827" />
                  ) : (
                    <Text style={styles.quantityButtonText}>−</Text>
                  )}
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={[styles.quantityButton, updatingItemId === item.id && styles.quantityButtonDisabled]}
                  onPress={() => handleQuantityChange(item, 1)}
                  disabled={updatingItemId === item.id}
                >
                  {updatingItemId === item.id ? (
                    <ActivityIndicator size="small" color="#111827" />
                  ) : (
                    <Text style={styles.quantityButtonText}>+</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.itemRight}>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Remove Item',
                    \`Remove \${item.name} from cart?\`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        onPress: () => handleRemoveItem(item.id),
                        style: 'destructive'
                      }
                    ]
                  );
                }}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.itemTotal}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, checkoutMutation.isPending && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={checkoutMutation.isPending}
        >
          {checkoutMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  itemsList: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    padding: 16,
    paddingBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 20,
    color: '#EF4444',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  checkoutButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
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

export default CartFullPage;`;

  return { code, imports: [] };
};
