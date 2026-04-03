/**
 * React Native Cart Summary Sidebar Generator
 * Generates a cart summary component for React Native
 */

export const generateRNCartSummarySidebar = () => {
  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface CartSummaryProps {
  cartData?: any;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  onCheckout?: () => void;
  itemCount?: number;
  [key: string]: any;
}

const CartSummarySidebar: React.FC<CartSummaryProps> = ({
  cartData: propData,
  subtotal: propSubtotal = 0,
  shipping: propShipping = 0,
  tax: propTax = 0,
  discount: propDiscount = 0,
  onCheckout,
  itemCount: propItemCount = 0
}) => {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/cart\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data?.[0] || result));
      } catch (err) {
        console.error('Failed to fetch cart data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const subtotal = data.subtotal ?? propSubtotal;
  const shipping = data.shipping ?? propShipping;
  const tax = data.tax ?? propTax;
  const discount = data.discount ?? propDiscount;
  const itemCount = data.itemCount ?? propItemCount;

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

  const total = subtotal + shipping + tax - discount;
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>

      {itemCount > 0 && (
        <Text style={styles.itemCount}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
      )}

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>{formatPrice(subtotal)}</Text>
      </View>

      {shipping > 0 ? (
        <View style={styles.row}>
          <Text style={styles.label}>Shipping</Text>
          <Text style={styles.value}>{formatPrice(shipping)}</Text>
        </View>
      ) : subtotal > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Shipping</Text>
          <Text style={styles.freeShipping}>FREE</Text>
        </View>
      )}

      {remainingForFreeShipping > 0 && subtotal > 0 && (
        <View style={styles.freeShippingBanner}>
          <Text style={styles.freeShippingText}>
            Add {formatPrice(remainingForFreeShipping)} more for FREE shipping! 🚚
          </Text>
        </View>
      )}

      {tax > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Tax</Text>
          <Text style={styles.value}>{formatPrice(tax)}</Text>
        </View>
      )}

      {discount > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Discount</Text>
          <Text style={styles.discount}>-{formatPrice(discount)}</Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
      </View>

      {onCheckout && (
        <TouchableOpacity
          style={[styles.checkoutButton, subtotal === 0 && styles.checkoutButtonDisabled]}
          onPress={onCheckout}
          disabled={subtotal === 0}
        >
          <Text style={styles.checkoutButtonText}>
            {subtotal === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.securityBadges}>
        <Text style={styles.securityText}>🔒 Secure Checkout</Text>
        <Text style={styles.securitySubtext}>SSL Encrypted • Safe & Secure</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#6B7280',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  freeShipping: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  discount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  freeShippingBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  freeShippingText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 16,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  securityBadges: {
    alignItems: 'center',
  },
  securityText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  securitySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});

export default CartSummarySidebar;`;

  return { code, imports: [] };
};
