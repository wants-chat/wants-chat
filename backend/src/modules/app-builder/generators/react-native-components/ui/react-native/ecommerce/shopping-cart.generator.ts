/**
 * React Native Shopping Cart Generator
 * Generates a shopping cart component with AsyncStorage integration
 */

export function generateRNShoppingCart(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
    `import AsyncStorage from '@react-native-async-storage/async-storage';`,
    `import { useFocusEffect } from '@react-navigation/native';`,
    `import { useMutation, useQueryClient } from '@tanstack/react-query';`,
  ];

  const code = `${imports.join('\n')}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  maxQuantity?: number;
}

interface ShoppingCartProps {
  onCheckout?: () => void;
  onContinueShopping?: () => void;
  [key: string]: any;
}

export default function ShoppingCart({
  onCheckout,
  onContinueShopping
}: ShoppingCartProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, newQuantity }: { itemId: string; newQuantity: number }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/cart/\${itemId}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!response.ok) throw new Error('Failed to update quantity');
      return { itemId, newQuantity };
    },
    onSuccess: ({ itemId, newQuantity }) => {
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to update quantity');
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
      Alert.alert('Success', 'Item removed from cart');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to remove item');
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/cart\`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to clear cart');
      await AsyncStorage.removeItem('cart');
      return true;
    },
    onSuccess: () => {
      setItems([]);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      Alert.alert('Success', 'Cart cleared');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to clear cart');
    },
  });

  // Load cart from AsyncStorage
  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        setItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Reload cart when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCart();
    }, [])
  );

  // Save cart to AsyncStorage
  const saveCart = async (updatedItems: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
      setItems(updatedItems);
    } catch (error) {
      console.error('Error saving cart:', error);
      Alert.alert('Error', 'Failed to update cart');
    }
  };

  // Update item quantity
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (updating || updateQuantityMutation.isPending) return;

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const maxQty = item.maxQuantity || 99;
    const finalQuantity = Math.max(1, Math.min(newQuantity, maxQty));

    setUpdating(true);
    updateQuantityMutation.mutate({ itemId, newQuantity: finalQuantity }, {
      onSettled: () => setUpdating(false),
    });

    // Also update AsyncStorage as fallback
    try {
      const updatedItems = items.map(i =>
        i.id === itemId ? { ...i, quantity: finalQuantity } : i
      );
      await AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }
  };

  // Remove item from cart
  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeItemMutation.mutate(itemId);
            // Also update AsyncStorage as fallback
            const updatedItems = items.filter((item: any) => item.id !== itemId);
            AsyncStorage.setItem('cart', JSON.stringify(updatedItems)).catch(console.error);
          }
        }
      ]
    );
  };

  // Clear entire cart
  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearCartMutation.mutate();
          }
        }
      ]
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const formatPrice = (price: number) => \`$\${price.toFixed(2)}\`;

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/80' }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
        <Text style={styles.itemSubtotal}>
          Subtotal: {formatPrice(item.price * item.quantity)}
        </Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, updating && styles.quantityButtonDisabled]}
            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
            disabled={updating || item.quantity <= 1}
          >
            <Ionicons name="remove" size={16} color={item.quantity <= 1 ? '#d1d5db' : '#374151'} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, updating && styles.quantityButtonDisabled]}
            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
            disabled={updating}
          >
            <Ionicons name="add" size={16} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart ({items.length})</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={onContinueShopping}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (10%)</Text>
              <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  clearButton: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
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
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemSubtotal: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  removeButton: {
    padding: 8,
  },
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  checkoutButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  shopButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});`;

  return { code, imports };
}
