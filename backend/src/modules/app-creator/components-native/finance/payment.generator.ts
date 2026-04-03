/**
 * Payment Component Generators (React Native)
 *
 * Generates payment form, payment methods list, and payment history components.
 * Uses secure input patterns for card details.
 */

export interface PaymentOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePaymentForm(options: PaymentOptions = {}): string {
  const { componentName = 'PaymentForm', endpoint = '/payments' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface ${componentName}Props {
  amount: number;
  description?: string;
  onSuccess?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  amount,
  description,
  onSuccess,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  const paymentMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      showToast('success', 'Payment successful!');
      onSuccess?.();
    },
    onError: () => showToast('error', 'Payment failed'),
  });

  const formatCardNumber = useCallback((value: string) => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  }, []);

  const formatExpiry = useCallback((value: string) => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  }, []);

  const handleCardNumberChange = useCallback((value: string) => {
    setCardNumber(formatCardNumber(value));
  }, [formatCardNumber]);

  const handleExpiryChange = useCallback((value: string) => {
    setExpiry(formatExpiry(value));
  }, [formatExpiry]);

  const handleCvcChange = useCallback((value: string) => {
    setCvc(value.replace(/\\D/g, '').substring(0, 4));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!cardNumber || cardNumber.replace(/\\s/g, '').length < 16) {
      showToast('error', 'Please enter a valid card number');
      return;
    }
    if (!expiry || expiry.length < 5) {
      showToast('error', 'Please enter a valid expiry date');
      return;
    }
    if (!cvc || cvc.length < 3) {
      showToast('error', 'Please enter a valid CVC');
      return;
    }
    if (!name.trim()) {
      showToast('error', 'Please enter the cardholder name');
      return;
    }

    paymentMutation.mutate({
      amount,
      card_number: cardNumber.replace(/\\s/g, ''),
      expiry,
      cvc,
      name,
    });
  }, [amount, cardNumber, expiry, cvc, name, paymentMutation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Payment Details</Text>
            <View style={styles.secureIndicator}>
              <Ionicons name="lock-closed" size={14} color="#6B7280" />
              <Text style={styles.secureText}>Secure</Text>
            </View>
          </View>

          {/* Description */}
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          {/* Amount */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount to pay</Text>
            <Text style={styles.amountValue}>\${amount.toFixed(2)}</Text>
          </View>

          {/* Card Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="card" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.inputWithIconField}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
          </View>

          {/* Expiry and CVC */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={handleExpiryChange}
                placeholder="MM/YY"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVC</Text>
              <TextInput
                style={styles.input}
                value={cvc}
                onChangeText={handleCvcChange}
                placeholder="123"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          {/* Cardholder Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              paymentMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={paymentMutation.isPending}
          >
            {paymentMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  Pay \${amount.toFixed(2)}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Security Note */}
          <Text style={styles.securityNote}>
            Your payment is secured with SSL encryption
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  secureIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secureText: {
    fontSize: 13,
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  amountContainer: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  inputWithIconField: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  securityNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ${componentName};
`;
}

export function generatePaymentMethods(options: PaymentOptions = {}): string {
  const { componentName = 'PaymentMethods', endpoint = '/payment-methods' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

const cardBrands: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
};

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: methods, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      showToast('success', 'Payment method removed');
    },
    onError: () => showToast('error', 'Failed to remove payment method'),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => api.put('${endpoint}/' + id + '/default', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      showToast('success', 'Default payment method updated');
    },
    onError: () => showToast('error', 'Failed to update default'),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    setRefreshing(false);
  }, [queryClient]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  }, [deleteMutation]);

  const handleSetDefault = useCallback((id: string) => {
    setDefaultMutation.mutate(id);
  }, [setDefaultMutation]);

  const renderPaymentMethod = useCallback(({ item }: { item: PaymentMethod }) => {
    const brandName = cardBrands[item.brand?.toLowerCase()] || 'Card';

    return (
      <View style={styles.methodItem}>
        <View style={styles.methodIcon}>
          <Ionicons name="card" size={24} color="#6B7280" />
        </View>
        <View style={styles.methodInfo}>
          <View style={styles.methodHeader}>
            <Text style={styles.methodBrand}>{brandName}</Text>
            {item.is_default && (
              <View style={styles.defaultBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.methodNumber}>**** **** **** {item.last4}</Text>
          <Text style={styles.methodExpiry}>
            Expires {item.exp_month}/{item.exp_year}
          </Text>
        </View>
        <View style={styles.methodActions}>
          {!item.is_default && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(item.id)}
            >
              <Ionicons name="star-outline" size={20} color="#F59E0B" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [handleDelete, handleSetDefault]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Methods</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#8B5CF6" />
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={methods || []}
        renderItem={renderPaymentMethod}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No payment methods saved</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  listContent: {
    padding: 16,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  methodBrand: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#059669',
  },
  methodNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  methodExpiry: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  methodActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generatePaymentHistory(options: PaymentOptions = {}): string {
  const { componentName = 'PaymentHistory', endpoint = '/payments' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Payment {
  id: string;
  description?: string;
  amount: number;
  status: string;
  created_at: string;
  method?: {
    last4: string;
  };
}

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusIcon = (status: string): {
    name: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
  } => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
      case 'completed':
        return { name: 'checkmark-circle', color: '#10B981', bgColor: '#D1FAE5' };
      case 'failed':
        return { name: 'close-circle', color: '#EF4444', bgColor: '#FEE2E2' };
      default:
        return { name: 'time', color: '#F59E0B', bgColor: '#FEF3C7' };
    }
  };

  const renderPayment = useCallback(({ item }: { item: Payment }) => {
    const statusIcon = getStatusIcon(item.status);

    return (
      <View style={styles.paymentItem}>
        <View style={[styles.statusIcon, { backgroundColor: statusIcon.bgColor }]}>
          <Ionicons name={statusIcon.name} size={20} color={statusIcon.color} />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentDescription} numberOfLines={1}>
            {item.description || 'Payment'}
          </Text>
          <View style={styles.paymentMeta}>
            <Text style={styles.paymentDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            {item.method?.last4 && (
              <>
                <Text style={styles.metaDivider}>|</Text>
                <Text style={styles.paymentCard}>**** {item.method.last4}</Text>
              </>
            )}
          </View>
        </View>
        <View style={styles.paymentRight}>
          <Text style={styles.paymentAmount}>
            \${(item.amount || 0).toLocaleString()}
          </Text>
          <Text style={[
            styles.paymentStatus,
            { color: statusIcon.color }
          ]}>
            {item.status}
          </Text>
        </View>
        <TouchableOpacity style={styles.receiptButton}>
          <Ionicons name="receipt-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    );
  }, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment History</Text>
      </View>

      <FlatList
        data={payments || []}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No payments yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 12,
  },
  paymentDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  paymentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  metaDivider: {
    fontSize: 13,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  paymentCard: {
    fontSize: 13,
    color: '#6B7280',
  },
  paymentRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  receiptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}
