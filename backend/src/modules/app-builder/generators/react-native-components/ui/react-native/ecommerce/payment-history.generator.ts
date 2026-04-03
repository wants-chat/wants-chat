/**
 * React Native Payment History Generator
 * Generates a list of payment transactions
 */

export function generateRNPaymentHistory(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface Payment {
  id: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: string;
}

interface PaymentHistoryProps {
  payments?: Payment[];
  data?: Payment[];
  entity?: string;
  onPaymentPress?: (payment: Payment) => void;
  [key: string]: any;
}

export default function PaymentHistory({
  payments,
  data,
  entity = 'payments',
  onPaymentPress
}: PaymentHistoryProps) {
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propData = payments || data;

  useEffect(() => {
    const fetchData = async () => {
      if (propData && propData.length > 0) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || []));
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData;
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      case 'refunded':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#ECFDF5';
      case 'pending':
        return '#FEF3C7';
      case 'failed':
        return '#FEE2E2';
      case 'refunded':
        return '#F3F4F6';
      default:
        return '#F3F4F6';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower.includes('card') || methodLower.includes('credit') || methodLower.includes('debit')) {
      return 'card-outline';
    }
    if (methodLower.includes('paypal')) {
      return 'logo-paypal';
    }
    if (methodLower.includes('bank')) {
      return 'business-outline';
    }
    if (methodLower.includes('wallet')) {
      return 'wallet-outline';
    }
    return 'cash-outline';
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => onPaymentPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getPaymentMethodIcon(item.method)}
            size={24}
            color="#3B82F6"
          />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.invoiceNumber}>Invoice #{item.invoiceNumber}</Text>
          <Text style={styles.paymentDate}>{formatDate(item.date)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusBgColor(item.status) }
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.paymentFooter}>
        <View style={styles.methodContainer}>
          <Ionicons name="card-outline" size={16} color="#6B7280" />
          <Text style={styles.method}>{item.method}</Text>
        </View>
        <Text style={styles.amount}>{formatPrice(item.amount)}</Text>
      </View>

      <View style={styles.viewDetailsContainer}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Payment History</Text>
      <Text style={styles.emptyText}>
        Your payment transactions will appear here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment History</Text>
        <Text style={styles.subtitle}>
          {sourceData.length} {sourceData.length === 1 ? 'transaction' : 'transactions'}
        </Text>
      </View>

      <FlatList
        data={sourceData}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 12,
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  method: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
  },
});`;

  return { code, imports };
}
