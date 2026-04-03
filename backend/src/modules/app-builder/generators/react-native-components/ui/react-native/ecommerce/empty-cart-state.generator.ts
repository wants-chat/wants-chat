/**
 * React Native Empty Cart State Generator
 * Generates an empty cart state component
 */

export function generateRNEmptyCartState(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface EmptyCartStateProps {
  cartData?: any;
  onContinueShopping?: () => void;
  [key: string]: any;
}

export default function EmptyCartState({ cartData: propData, onContinueShopping }: EmptyCartStateProps) {
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
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch cart data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="cart-outline" size={80} color="#d1d5db" />
      </View>
      <Text style={styles.title}>Your cart is empty</Text>
      <Text style={styles.subtitle}>
        Looks like you haven't added anything to your cart yet
      </Text>
      {onContinueShopping && (
        <TouchableOpacity style={styles.button} onPress={onContinueShopping}>
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
