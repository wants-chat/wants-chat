/**
 * Cart Component Generator for React Native
 *
 * Generates a shopping cart component with:
 * - FlatList for cart items
 * - Quantity +/- buttons
 * - Remove item button/swipe
 * - Checkout navigation
 */

export interface CartOptions {
  componentName?: string;
  showImages?: boolean;
  showShipping?: boolean;
  freeShippingThreshold?: number;
  checkoutScreen?: string;
  productsScreen?: string;
  enableSwipeToDelete?: boolean;
}

export function generateCart(options: CartOptions = {}): string {
  const {
    componentName = 'Cart',
    showImages = true,
    showShipping = true,
    freeShippingThreshold = 100,
    checkoutScreen = 'Checkout',
    productsScreen = 'Products',
    enableSwipeToDelete = true,
  } = options;

  return `import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useCart } from '@/contexts/CartContext';
import { showToast } from '@/lib/toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  showImage: boolean;
  enableSwipe: boolean;
}

const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  showImage,
  enableSwipe,
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onRemove(item.productId);
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const content = (
    <View style={styles.cartItem}>
      ${showImages ? `{showImage && (
        <View style={styles.itemImageContainer}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={24} color="#9CA3AF" />
            </View>
          )}
        </View>
      )}` : ''}
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>\${(item.price || 0).toFixed(2)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.productId, -1)}
        >
          <Ionicons name="remove" size={18} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.productId, 1)}
        >
          <Ionicons name="add" size={18} color="#374151" />
        </TouchableOpacity>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>
          \${((item.price || 0) * item.quantity).toFixed(2)}
        </Text>
      </View>
      {!enableSwipe && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(item.productId)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (enableSwipe) {
    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={40}
      >
        {content}
      </Swipeable>
    );
  }

  return content;
};

function ${componentName}() {
  const navigation = useNavigation();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();

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
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeFromCart(productId);
            showToast('success', 'Item removed from cart');
          },
        },
      ]
    );
  }, [removeFromCart]);

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shipping = ${showShipping ? `subtotal < ${freeShippingThreshold} ? 9.99 : 0` : '0'};
  const total = subtotal + shipping;

  const renderItem = useCallback(({ item }: { item: CartItem }) => (
    <CartItemRow
      item={item}
      onUpdateQuantity={handleUpdateQuantity}
      onRemove={handleRemoveItem}
      showImage={${showImages}}
      enableSwipe={${enableSwipeToDelete}}
    />
  ), [handleUpdateQuantity, handleRemoveItem]);

  const keyExtractor = useCallback((item: CartItem) => item.productId, []);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some products to get started</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('${productsScreen}' as never)}
        >
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          <Text style={styles.browseButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.itemCount}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>\${subtotal.toFixed(2)}</Text>
        </View>
        ${showShipping ? `<View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? 'Free' : '\\$' + shipping.toFixed(2)}
          </Text>
        </View>` : ''}
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
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueShoppingButton}
          onPress={() => navigation.navigate('${productsScreen}' as never)}
        >
          <Text style={styles.continueShoppingText}>Continue Shopping</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginRight: 8,
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
    color: '#3B82F6',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginRight: 12,
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
  itemTotal: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  removeButton: {
    padding: 8,
    marginLeft: 4,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
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
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
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
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueShoppingButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  continueShoppingText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
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

export function generateMiniCart(options: { componentName?: string; cartScreen?: string } = {}): string {
  const componentName = options.componentName || 'MiniCart';
  const cartScreen = options.cartScreen || 'Cart';

  return `import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

function ${componentName}() {
  const navigation = useNavigation();
  const { items, removeFromCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleViewCart = () => {
    setIsVisible(false);
    navigation.navigate('${cartScreen}' as never);
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemDetails}>
          {item.quantity} x \${(item.price || 0).toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeItemButton}
        onPress={() => handleRemoveItem(item.productId)}
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => setIsVisible(true)}
      >
        <Ionicons name="cart-outline" size={24} color="#111827" />
        {itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {itemCount > 99 ? '99+' : itemCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsVisible(false)}
        />
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cart ({itemCount})</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartText}>Cart is empty</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.productId}
                style={styles.itemList}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.footer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>\${total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewCartButton}
                  onPress={handleViewCart}
                >
                  <Text style={styles.viewCartButtonText}>View Cart</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  emptyCart: {
    padding: 32,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemList: {
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 13,
    color: '#6B7280',
  },
  removeItemButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  viewCartButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}
