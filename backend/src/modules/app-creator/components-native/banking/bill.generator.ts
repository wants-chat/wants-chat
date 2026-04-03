/**
 * Banking Bill Component Generators for React Native
 *
 * Generates bill payment components:
 * - Bill List with status indicators
 * - Bill Payment Form with account selection
 */

export interface BillOptions {
  componentName?: string;
  endpoint?: string;
  billDetailScreen?: string;
}

export function generateBillList(options: BillOptions = {}): string {
  const {
    componentName = 'BillList',
    endpoint = '/banking/bills',
    billDetailScreen = 'BillPayment',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Bill {
  id: string;
  payee: string;
  category: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'scheduled';
  is_recurring: boolean;
  frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  auto_pay?: boolean;
  account_id?: string;
  last_paid?: string;
}

const statusFilters = ['all', 'pending', 'overdue', 'scheduled', 'paid'];

function ${componentName}() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: bills, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['banking-bills', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? '?status=' + statusFilter : '';
      const response = await api.get<any>('${endpoint}' + params);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredBills = bills?.filter((bill: Bill) =>
    bill.payee.toLowerCase().includes(search.toLowerCase()) ||
    bill.category.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      utilities: 'flash-outline',
      rent: 'home-outline',
      phone: 'call-outline',
      internet: 'wifi-outline',
      credit_card: 'card-outline',
      water: 'water-outline',
      gas: 'flame-outline',
    };
    return icons[category?.toLowerCase()] || 'receipt-outline';
  };

  const getStatusConfig = (status: string, dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    switch (status) {
      case 'paid':
        return { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle', label: 'Paid' };
      case 'overdue':
        return { bg: '#FEE2E2', text: '#DC2626', icon: 'alert-circle', label: 'Overdue' };
      case 'scheduled':
        return { bg: '#DBEAFE', text: '#2563EB', icon: 'time', label: 'Scheduled' };
      default:
        if (daysUntilDue <= 3 && daysUntilDue >= 0) {
          return { bg: '#FEF3C7', text: '#D97706', icon: 'alert-circle', label: 'Due Soon' };
        }
        return { bg: '#F3F4F6', text: '#6B7280', icon: 'time', label: 'Pending' };
    }
  };

  const formatDueDate = (date: string) => {
    const due = new Date(date);
    const today = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    if (daysUntilDue < 0) return \`\${Math.abs(daysUntilDue)} days overdue\`;
    if (daysUntilDue <= 7) return \`Due in \${daysUntilDue} days\`;
    return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate summary stats
  const totalDue = filteredBills?.filter((b: Bill) => b.status !== 'paid')
    .reduce((sum: number, b: Bill) => sum + b.amount, 0) || 0;
  const overdueBills = filteredBills?.filter((b: Bill) => b.status === 'overdue').length || 0;
  const autoPayCount = bills?.filter((b: Bill) => b.auto_pay).length || 0;

  const handleBillPress = useCallback((billId: string) => {
    navigation.navigate('${billDetailScreen}' as never, { id: billId } as never);
  }, [navigation]);

  const renderBill = useCallback(({ item }: { item: Bill }) => {
    const iconName = getCategoryIcon(item.category);
    const statusConfig = getStatusConfig(item.status, item.due_date);

    return (
      <View style={styles.billItem}>
        <View style={styles.billIcon}>
          <Ionicons name={iconName} size={24} color="#6B7280" />
        </View>
        <View style={styles.billDetails}>
          <View style={styles.billNameRow}>
            <Text style={styles.billName} numberOfLines={1}>{item.payee}</Text>
            {item.is_recurring && (
              <View style={styles.recurringBadge}>
                <Text style={styles.recurringText}>{item.frequency}</Text>
              </View>
            )}
            {item.auto_pay && (
              <View style={styles.autoPayBadge}>
                <Text style={styles.autoPayText}>Auto-pay</Text>
              </View>
            )}
          </View>
          <View style={styles.billMeta}>
            <Text style={styles.billCategory}>{item.category.replace('_', ' ')}</Text>
            <Text style={styles.metaDot}>*</Text>
            <Text style={[
              styles.billDueDate,
              item.status === 'overdue' && styles.overdueDueDate
            ]}>
              {formatDueDate(item.due_date)}
            </Text>
          </View>
        </View>
        <View style={styles.billRight}>
          <Text style={styles.billAmount}>\${item.amount.toLocaleString()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Ionicons
              name={statusConfig.icon as keyof typeof Ionicons.glyphMap}
              size={12}
              color={statusConfig.text}
            />
            <Text style={[styles.statusText, { color: statusConfig.text }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
        {item.status !== 'paid' && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => handleBillPress(item.id)}
          >
            <Text style={styles.payButtonText}>Pay</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    );
  }, [handleBillPress]);

  const keyExtractor = useCallback((item: Bill) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Bills & Payments</Text>
          <Text style={styles.headerSubtitle}>Manage your recurring bills</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Bill</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Due</Text>
          <Text style={styles.summaryValue}>\${totalDue.toLocaleString()}</Text>
          <Text style={styles.summaryMeta}>
            {filteredBills?.filter((b: Bill) => b.status === 'pending').length || 0} upcoming
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Overdue</Text>
          <Text style={[styles.summaryValue, overdueBills > 0 && styles.overdueValue]}>
            {overdueBills} bills
          </Text>
          {overdueBills > 0 && (
            <Text style={styles.summaryMetaWarning}>Requires attention</Text>
          )}
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Auto-Pay</Text>
          <Text style={[styles.summaryValue, styles.autoPayValue]}>{autoPayCount}</Text>
          <Text style={styles.summaryMeta}>Automatic payments</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bills..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <FlatList
        data={statusFilters}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              statusFilter === item && styles.filterChipActive
            ]}
            onPress={() => setStatusFilter(item)}
          >
            <Text style={[
              styles.filterChipText,
              statusFilter === item && styles.filterChipTextActive
            ]}>
              {item === 'all' ? 'All Status' : item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
      />

      {/* Bills List */}
      <FlatList
        data={filteredBills}
        renderItem={renderBill}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No bills found</Text>
            <Text style={styles.emptySubtitle}>Add a bill to start tracking</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  overdueValue: {
    color: '#DC2626',
  },
  autoPayValue: {
    color: '#10B981',
  },
  summaryMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  summaryMetaWarning: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterChips: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  billIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billDetails: {
    flex: 1,
  },
  billNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  recurringBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recurringText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '600',
  },
  autoPayBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  autoPayText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  billMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  billCategory: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  metaDot: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 6,
  },
  billDueDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  overdueDueDate: {
    color: '#DC2626',
    fontWeight: '500',
  },
  billRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  payButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    marginRight: 8,
  },
  payButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateBillPaymentForm(options: BillOptions = {}): string {
  const {
    componentName = 'BillPaymentForm',
    endpoint = '/banking/bills',
  } = options;

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

type RouteParams = {
  BillPayment: { id: string };
};

interface Bill {
  id: string;
  payee: string;
  category: string;
  amount: number;
  due_date: string;
  account_number?: string;
}

interface PaymentAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  account_number: string;
}

function ${componentName}() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'BillPayment'>>();
  const { id } = route.params;
  const queryClient = useQueryClient();

  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [scheduleRecurring, setScheduleRecurring] = useState(false);

  const { data: bill, isLoading: billLoading } = useQuery({
    queryKey: ['bill', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['payment-accounts'],
    queryFn: async () => {
      const response = await api.get<any>('/banking/accounts');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}/' + id + '/pay', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banking-bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill', id] });
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
      showToast('success', 'Payment successful!');
      navigation.goBack();
    },
    onError: () => showToast('error', 'Payment failed. Please try again.'),
  });

  useEffect(() => {
    if (bill) {
      setAmount(bill.amount.toString());
    }
  }, [bill]);

  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccountId) {
      const primaryAccount = accounts.find((a: PaymentAccount) => a.type === 'checking') || accounts[0];
      setSelectedAccountId(primaryAccount.id);
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount = accounts?.find((a: PaymentAccount) => a.id === selectedAccountId);
  const paymentAmount = parseFloat(amount) || 0;
  const insufficientFunds = selectedAccount && paymentAmount > selectedAccount.balance;

  const handleSubmit = () => {
    if (insufficientFunds) {
      Alert.alert('Error', 'Insufficient funds in selected account');
      return;
    }
    paymentMutation.mutate({
      account_id: selectedAccountId,
      amount: paymentAmount,
      payment_date: paymentDate,
      memo,
      schedule_recurring: scheduleRecurring,
    });
  };

  if (billLoading || accountsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!bill) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Bill not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pay Bill</Text>
          <Text style={styles.headerSubtitle}>{bill.payee}</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      {/* Bill Summary */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={styles.billSummary}
      >
        <View style={styles.billSummaryRow}>
          <View>
            <Text style={styles.billLabel}>Payee</Text>
            <Text style={styles.billPayee}>{bill.payee}</Text>
            {bill.account_number && (
              <Text style={styles.billAccountNumber}>
                Account: **** {bill.account_number.slice(-4)}
              </Text>
            )}
          </View>
          <View style={styles.billAmountSection}>
            <Text style={styles.billLabel}>Amount Due</Text>
            <Text style={styles.billAmountDue}>\${bill.amount.toLocaleString()}</Text>
            <View style={styles.dueDateRow}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.billDueDate}>
                Due {new Date(bill.due_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Payment Form */}
      <View style={styles.form}>
        {/* From Account */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Pay From</Text>
          <View style={styles.accountList}>
            {accounts?.map((account: PaymentAccount) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountOption,
                  selectedAccountId === account.id && styles.accountOptionActive
                ]}
                onPress={() => setSelectedAccountId(account.id)}
              >
                <View style={styles.accountOptionIcon}>
                  <Ionicons
                    name={account.type === 'checking' ? 'business-outline' : 'wallet-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </View>
                <View style={styles.accountOptionDetails}>
                  <Text style={styles.accountOptionName}>{account.name}</Text>
                  <Text style={styles.accountOptionNumber}>
                    **** {account.account_number.slice(-4)}
                  </Text>
                </View>
                <View style={styles.accountOptionBalance}>
                  <Text style={styles.accountOptionBalanceText}>
                    \${account.balance.toLocaleString()}
                  </Text>
                  <Text style={styles.accountOptionBalanceLabel}>Available</Text>
                </View>
                {selectedAccountId === account.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Payment Amount</Text>
          <View style={[
            styles.amountInputContainer,
            insufficientFunds && styles.amountInputError
          ]}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          {insufficientFunds && (
            <View style={styles.errorMessage}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorMessageText}>Insufficient funds</Text>
            </View>
          )}
          <View style={styles.quickAmounts}>
            <TouchableOpacity
              style={styles.quickAmountButton}
              onPress={() => setAmount(bill.amount.toString())}
            >
              <Text style={styles.quickAmountText}>Full Amount</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAmountButton}
              onPress={() => setAmount((bill.amount / 2).toFixed(2))}
            >
              <Text style={styles.quickAmountText}>Half</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Memo */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Memo (Optional)</Text>
          <TextInput
            style={styles.memoInput}
            value={memo}
            onChangeText={setMemo}
            placeholder="Add a note for this payment"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Auto-Pay Option */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setScheduleRecurring(!scheduleRecurring)}
        >
          <View style={[styles.checkbox, scheduleRecurring && styles.checkboxActive]}>
            {scheduleRecurring && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Set up automatic payments</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (paymentMutation.isPending || insufficientFunds || paymentAmount <= 0) &&
            styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={paymentMutation.isPending || insufficientFunds || paymentAmount <= 0}
        >
          {paymentMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                Pay \${paymentAmount.toLocaleString()}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  billSummary: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  billSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  billPayee: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  billAccountNumber: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  billAmountSection: {
    alignItems: 'flex-end',
  },
  billAmountDue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  billDueDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  accountList: {
    gap: 12,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  accountOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  accountOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountOptionDetails: {
    flex: 1,
  },
  accountOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  accountOptionNumber: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  accountOptionBalance: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  accountOptionBalanceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  accountOptionBalanceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  amountInputError: {
    borderColor: '#DC2626',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 16,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  errorMessageText: {
    fontSize: 13,
    color: '#DC2626',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  quickAmountText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  memoInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
