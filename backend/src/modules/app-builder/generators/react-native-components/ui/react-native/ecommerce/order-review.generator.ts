/**
 * React Native Order Review Generator
 * Generates an order review/summary component for checkout
 */

export function generateRNOrderReview(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';`,
  ];

  const code = `${imports.join('\n')}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderReviewProps {
  orderData?: any;
  items?: OrderItem[];
  subtotal?: number;
  tax?: number;
  shipping?: number;
  total?: number;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  [key: string]: any;
}

export default function OrderReview({
  orderData: propData,
  items: propItems = [],
  subtotal: propSubtotal = 0,
  tax: propTax = 0,
  shipping: propShipping = 0,
  total: propTotal = 0,
  shippingAddress: propShippingAddress
}: OrderReviewProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/orders\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data?.[0] || result));
      } catch (err) {
        console.error('Failed to fetch order data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const items = data.items || propItems;
  const subtotal = data.subtotal ?? propSubtotal;
  const tax = data.tax ?? propTax;
  const shipping = data.shipping ?? propShipping;
  const total = data.total ?? propTotal;
  const shippingAddress = data.shippingAddress || propShippingAddress;

  const formatPrice = (price: number) => \`$\${price.toFixed(2)}\`;

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/60' }}
            style={styles.itemImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          </View>
          <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
        </View>
      ))}

      {shippingAddress && (
        <>
          <Text style={[styles.sectionTitle, styles.marginTop]}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{shippingAddress.name}</Text>
            <Text style={styles.addressText}>{shippingAddress.street}</Text>
            <Text style={styles.addressText}>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
            </Text>
          </View>
        </>
      )}

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>{formatPrice(shipping)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  marginTop: {
    marginTop: 24,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    alignSelf: 'center',
  },
  addressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
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
    color: '#3b82f6',
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
