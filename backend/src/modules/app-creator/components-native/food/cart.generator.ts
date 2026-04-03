/**
 * Food Cart Component Generator for React Native
 *
 * Generates food ordering cart component with:
 * - FlatList for cart items
 * - Quantity controls
 * - Order summary
 * - Checkout navigation
 */

export interface FoodCartOptions {
  componentName?: string;
  checkoutScreen?: string;
  menuScreen?: string;
  showSpecialInstructions?: boolean;
}

export function generateFoodCart(options: FoodCartOptions = {}): string {
  const {
    componentName = 'FoodCart',
    checkoutScreen = 'Checkout',
    menuScreen = 'Menu',
    showSpecialInstructions = true,
  } = options;

  return `import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';
import { showToast } from '@/lib/toast';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  specialInstructions?: string;
}

function ${componentName}() {
  const navigation = useNavigation();
  const { items, updateQuantity, removeFromCart, updateItemInstructions } = useCart();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');

  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    const item = items.find(i => i.productId === productId);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      updateQuantity(productId, newQty);
    }
  }, [items, updateQuantity]);

  const handleRemoveItem = useCallback((productId: string) => {
    Alert.alert(
      'Remove Item',
      'Remove this item from your order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeFromCart(productId);
            showToast('success', 'Item removed');
          },
        },
      ]
    );
  }, [removeFromCart]);

  const handleSaveInstructions = (productId: string) => {
    updateItemInstructions?.(productId, instructions);
    setEditingItem(null);
    setInstructions('');
    showToast('success', 'Instructions saved');
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.08;
  const deliveryFee = subtotal > 30 ? 0 : 4.99;
  const total = subtotal + tax + deliveryFee;

  const renderItem = useCallback(({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemRow}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="restaurant-outline" size={24} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemPrice}>\${(item.price || 0).toFixed(2)}</Text>
          {item.specialInstructions && (
            <Text style={styles.itemInstructions} numberOfLines={1}>
              Note: {item.specialInstructions}
            </Text>
          )}
        </View>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.productId, -1)}
          >
            <Ionicons name="remove" size={16} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.productId, 1)}
          >
            <Ionicons name="add" size={16} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemActions}>
        ${showSpecialInstructions ? `<TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setEditingItem(item.productId);
            setInstructions(item.specialInstructions || '');
          }}
        >
          <Ionicons name="create-outline" size={16} color="#6B7280" />
          <Text style={styles.actionText}>Add Note</Text>
        </TouchableOpacity>` : ''}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRemoveItem(item.productId)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Remove</Text>
        </TouchableOpacity>
      </View>
      {editingItem === item.productId && (
        <View style={styles.instructionsContainer}>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Special instructions (allergies, preferences...)"
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />
          <View style={styles.instructionsActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditingItem(null)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSaveInstructions(item.productId)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  ), [handleUpdateQuantity, handleRemoveItem, editingItem, instructions]);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="fast-food-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add delicious items from the menu</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('${menuScreen}' as never)}
        >
          <Text style={styles.browseButtonText}>Browse Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Order</Text>
        <Text style={styles.itemCount}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>\${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>\${tax.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={styles.summaryValue}>
            {deliveryFee === 0 ? 'Free' : '\\$' + deliveryFee.toFixed(2)}
          </Text>
        </View>
        {deliveryFee > 0 && (
          <Text style={styles.freeDeliveryHint}>
            Add \${(30 - subtotal).toFixed(2)} more for free delivery
          </Text>
        )}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>\${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('${checkoutScreen}' as never)}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
  },
  itemInstructions: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    minWidth: 24,
    textAlign: 'center',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  instructionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  instructionsActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#F97316',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  freeDeliveryHint: {
    fontSize: 12,
    color: '#F97316',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#F97316',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}
