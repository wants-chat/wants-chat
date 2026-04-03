/**
 * React Native Payment Method Generator
 * Generates a payment method selection component
 */

export function generateRNPaymentMethod(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

interface PaymentMethodProps {
  paymentData?: any;
  methods?: PaymentMethod[];
  onSelectMethod?: (methodId: string) => void;
  [key: string]: any;
}

const DEFAULT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'card', description: 'Visa, Mastercard, Amex' },
  { id: 'paypal', name: 'PayPal', icon: 'logo-paypal', description: 'Pay with PayPal' },
  { id: 'apple', name: 'Apple Pay', icon: 'logo-apple', description: 'Pay with Apple Pay' },
  { id: 'google', name: 'Google Pay', icon: 'logo-google', description: 'Pay with Google Pay' },
];

export default function PaymentMethodComponent({
  paymentData: propData,
  methods: propMethods = DEFAULT_METHODS,
  onSelectMethod
}: PaymentMethodProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('card');

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/payment-methods\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch payment methods:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData;
  const methods = data?.methods || (Array.isArray(data) ? data : null) || propMethods;

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const handleSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    onSelectMethod?.(methodId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>
      {methods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            selectedMethod === method.id && styles.methodCardActive
          ]}
          onPress={() => handleSelect(method.id)}
        >
          <View style={styles.methodIcon}>
            <Ionicons
              name={method.icon as any}
              size={32}
              color={selectedMethod === method.id ? '#3b82f6' : '#6b7280'}
            />
          </View>
          <View style={styles.methodInfo}>
            <Text style={[
              styles.methodName,
              selectedMethod === method.id && styles.methodNameActive
            ]}>
              {method.name}
            </Text>
            {method.description && (
              <Text style={styles.methodDescription}>{method.description}</Text>
            )}
          </View>
          <Ionicons
            name={selectedMethod === method.id ? 'checkmark-circle' : 'radio-button-off'}
            size={24}
            color={selectedMethod === method.id ? '#3b82f6' : '#d1d5db'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  methodNameActive: {
    color: '#111827',
  },
  methodDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
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
