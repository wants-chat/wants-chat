/**
 * Banking Transaction Component Generators for React Native
 *
 * Generates transaction-related components:
 * - Transaction List with search and pagination
 * - Transaction Filters modal
 */

export interface TransactionOptions {
  componentName?: string;
  endpoint?: string;
  transactionDetailScreen?: string;
}

export function generateTransactionList(options: TransactionOptions = {}): string {
  const {
    componentName = 'TransactionList',
    endpoint = '/banking/transactions',
    transactionDetailScreen = 'TransactionDetail',
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
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  merchant?: string;
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  account_id: string;
  account_name?: string;
  reference_number?: string;
  balance_after?: number;
}

interface TransactionListProps {
  accountId?: string;
}

function ${componentName}({ accountId }: TransactionListProps) {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['transactions', accountId, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (accountId) params.append('account_id', accountId);
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      const response = await api.get<any>('${endpoint}?' + params.toString());
      return response;
    },
  });

  const transactions = Array.isArray(data) ? data : (data?.data || []);
  const totalPages = data?.total_pages || 1;

  const filteredTransactions = transactions.filter((tx: Transaction) => {
    const searchLower = search.toLowerCase();
    return (
      tx.description?.toLowerCase().includes(searchLower) ||
      tx.merchant?.toLowerCase().includes(searchLower) ||
      tx.category?.toLowerCase().includes(searchLower) ||
      tx.reference_number?.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      food: { bg: '#FED7AA', text: '#C2410C' },
      shopping: { bg: '#FBCFE8', text: '#BE185D' },
      transport: { bg: '#BFDBFE', text: '#1D4ED8' },
      utilities: { bg: '#FEF08A', text: '#A16207' },
      entertainment: { bg: '#E9D5FF', text: '#7C3AED' },
      health: { bg: '#FECACA', text: '#DC2626' },
      income: { bg: '#BBF7D0', text: '#15803D' },
      transfer: { bg: '#C7D2FE', text: '#4338CA' },
    };
    return colors[category?.toLowerCase()] || { bg: '#E5E7EB', text: '#6B7280' };
  };

  const exportTransactions = async () => {
    try {
      const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Status'];
      const rows = filteredTransactions.map((tx: Transaction) => [
        new Date(tx.date).toLocaleDateString(),
        tx.description || tx.merchant || '',
        tx.category,
        tx.amount,
        tx.type,
        tx.status,
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');

      await Share.share({
        message: csv,
        title: 'Transactions Export',
      });
    } catch (error) {
      showToast('error', 'Failed to export');
    }
  };

  const handleTransactionPress = useCallback((txId: string) => {
    navigation.navigate('${transactionDetailScreen}' as never, { id: txId } as never);
  }, [navigation]);

  const renderTransaction = useCallback(({ item }: { item: Transaction }) => {
    const categoryColor = getCategoryColor(item.category);

    return (
      <TouchableOpacity
        style={styles.txItem}
        onPress={() => handleTransactionPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.txRow}>
          <View style={styles.txDate}>
            <Text style={styles.txDateDay}>
              {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric' })}
            </Text>
            <Text style={styles.txDateMonth}>
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
            </Text>
          </View>

          <View style={[
            styles.txIcon,
            item.type === 'credit' ? styles.txIconCredit : styles.txIconDebit
          ]}>
            <Ionicons
              name={item.type === 'credit' ? 'arrow-down' : 'arrow-up'}
              size={18}
              color={item.type === 'credit' ? '#10B981' : '#6B7280'}
            />
          </View>

          <View style={styles.txDetails}>
            <Text style={styles.txDescription} numberOfLines={1}>
              {item.description || item.merchant}
            </Text>
            <View style={styles.txMeta}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor.bg }]}>
                <Text style={[styles.categoryText, { color: categoryColor.text }]}>
                  {item.category}
                </Text>
              </View>
              {item.reference_number && (
                <Text style={styles.txRef}>Ref: {item.reference_number.slice(-6)}</Text>
              )}
            </View>
          </View>

          <View style={styles.txAmountSection}>
            <Text style={[
              styles.txAmount,
              item.type === 'credit' && styles.txAmountCredit
            ]}>
              {item.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(item.amount), item.currency)}
            </Text>
            <View style={[
              styles.statusDot,
              item.status === 'completed' ? styles.statusCompleted :
              item.status === 'pending' ? styles.statusPending : styles.statusFailed
            ]} />
          </View>
        </View>

        {item.balance_after !== undefined && (
          <View style={styles.balanceAfter}>
            <Text style={styles.balanceAfterText}>
              Balance: {formatCurrency(item.balance_after, item.currency)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [handleTransactionPress]);

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
          onPress={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          <Ionicons name="chevron-back" size={20} color={page === 1 ? '#D1D5DB' : '#374151'} />
        </TouchableOpacity>
        <Text style={styles.pageText}>Page {page} of {totalPages}</Text>
        <TouchableOpacity
          style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]}
          onPress={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          <Ionicons name="chevron-forward" size={20} color={page === totalPages ? '#D1D5DB' : '#374151'} />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Export */}
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.exportButton} onPress={exportTransactions}>
          <Ionicons name="download-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search</Text>
          </View>
        }
        ListFooterComponent={renderPagination}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  exportButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  listContent: {
    paddingVertical: 8,
  },
  txItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txDate: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  txDateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  txDateMonth: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txIconCredit: {
    backgroundColor: '#D1FAE5',
  },
  txIconDebit: {
    backgroundColor: '#F3F4F6',
  },
  txDetails: {
    flex: 1,
  },
  txDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  txRef: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  txAmountSection: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  txAmountCredit: {
    color: '#10B981',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusCompleted: {
    backgroundColor: '#10B981',
  },
  statusPending: {
    backgroundColor: '#F59E0B',
  },
  statusFailed: {
    backgroundColor: '#EF4444',
  },
  balanceAfter: {
    marginTop: 8,
    marginLeft: 88,
  },
  balanceAfterText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  pageButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    color: '#6B7280',
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

export function generateTransactionFilters(options: TransactionOptions = {}): string {
  const {
    componentName = 'TransactionFilters',
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterState {
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  type?: 'all' | 'credit' | 'debit';
  category?: string;
  status?: 'all' | 'completed' | 'pending' | 'failed';
  accountId?: string;
}

interface Account {
  id: string;
  name: string;
}

interface ${componentName}Props {
  accounts?: Account[];
  categories?: string[];
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

const defaultCategories = [
  'Food', 'Shopping', 'Transport', 'Utilities', 'Entertainment',
  'Health', 'Income', 'Transfer', 'Other'
];

const quickDateFilters = [
  { label: 'Today', days: 0 },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: 'This month', days: -1 },
];

function ${componentName}({
  accounts = [],
  categories = defaultCategories,
  onFilterChange,
  initialFilters = {},
}: ${componentName}Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {};
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const applyQuickDate = (days: number) => {
    const today = new Date();
    let fromDate: Date;

    if (days === -1) {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (days === 0) {
      fromDate = today;
    } else {
      fromDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    }

    updateFilter('dateFrom', fromDate.toISOString().split('T')[0]);
    updateFilter('dateTo', today.toISOString().split('T')[0]);
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length;

  return (
    <>
      <TouchableOpacity
        style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
        onPress={() => setIsOpen(true)}
      >
        <Ionicons
          name="options-outline"
          size={20}
          color={activeFilterCount > 0 ? '#3B82F6' : '#6B7280'}
        />
        <Text style={[
          styles.filterButtonText,
          activeFilterCount > 0 && styles.filterButtonTextActive
        ]}>
          Filters
        </Text>
        {activeFilterCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsOpen(false)}
            >
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Date Range */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                <Text style={styles.sectionTitle}>Date Range</Text>
              </View>
              <View style={styles.dateInputs}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.inputLabel}>From</Text>
                  <TextInput
                    style={styles.input}
                    value={filters.dateFrom || ''}
                    onChangeText={(v) => updateFilter('dateFrom', v)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.inputLabel}>To</Text>
                  <TextInput
                    style={styles.input}
                    value={filters.dateTo || ''}
                    onChangeText={(v) => updateFilter('dateTo', v)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
              <View style={styles.quickDateRow}>
                {quickDateFilters.map((qf) => (
                  <TouchableOpacity
                    key={qf.label}
                    style={styles.quickDateButton}
                    onPress={() => applyQuickDate(qf.days)}
                  >
                    <Text style={styles.quickDateText}>{qf.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Amount Range */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="cash-outline" size={18} color="#6B7280" />
                <Text style={styles.sectionTitle}>Amount Range</Text>
              </View>
              <View style={styles.dateInputs}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.inputLabel}>Min</Text>
                  <View style={styles.amountInputWrapper}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={filters.minAmount || ''}
                      onChangeText={(v) => updateFilter('minAmount', v)}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.inputLabel}>Max</Text>
                  <View style={styles.amountInputWrapper}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={filters.maxAmount || ''}
                      onChangeText={(v) => updateFilter('maxAmount', v)}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Transaction Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transaction Type</Text>
              <View style={styles.typeButtons}>
                {(['all', 'credit', 'debit'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      (filters.type || 'all') === type && styles.typeButtonActive
                    ]}
                    onPress={() => updateFilter('type', type)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      (filters.type || 'all') === type && styles.typeButtonTextActive
                    ]}>
                      {type === 'all' ? 'All' : type === 'credit' ? 'Income' : 'Expense'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="pricetag-outline" size={18} color="#6B7280" />
                <Text style={styles.sectionTitle}>Category</Text>
              </View>
              <View style={styles.categoryGrid}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    !filters.category && styles.categoryChipActive
                  ]}
                  onPress={() => updateFilter('category', '')}
                >
                  <Text style={[
                    styles.categoryChipText,
                    !filters.category && styles.categoryChipTextActive
                  ]}>All</Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      filters.category === cat.toLowerCase() && styles.categoryChipActive
                    ]}
                    onPress={() => updateFilter('category', cat.toLowerCase())}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      filters.category === cat.toLowerCase() && styles.categoryChipTextActive
                    ]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.typeButtons}>
                {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusChip,
                      (filters.status || 'all') === status && styles.statusChipActive
                    ]}
                    onPress={() => updateFilter('status', status)}
                  >
                    <Text style={[
                      styles.statusChipText,
                      (filters.status || 'all') === status && styles.statusChipTextActive
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Accounts */}
            {accounts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="wallet-outline" size={18} color="#6B7280" />
                  <Text style={styles.sectionTitle}>Account</Text>
                </View>
                <View style={styles.accountsList}>
                  <TouchableOpacity
                    style={[
                      styles.accountOption,
                      !filters.accountId && styles.accountOptionActive
                    ]}
                    onPress={() => updateFilter('accountId', '')}
                  >
                    <Text style={[
                      styles.accountOptionText,
                      !filters.accountId && styles.accountOptionTextActive
                    ]}>All Accounts</Text>
                    {!filters.accountId && (
                      <Ionicons name="checkmark" size={18} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountOption,
                        filters.accountId === account.id && styles.accountOptionActive
                      ]}
                      onPress={() => updateFilter('accountId', account.id)}
                    >
                      <Text style={[
                        styles.accountOptionText,
                        filters.accountId === account.id && styles.accountOptionTextActive
                      ]}>{account.name}</Text>
                      {filters.accountId === account.id && (
                        <Ionicons name="checkmark" size={18} color="#3B82F6" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#3B82F6',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currencySymbol: {
    fontSize: 15,
    color: '#6B7280',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  quickDateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  quickDateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  statusChipActive: {
    backgroundColor: '#3B82F6',
  },
  statusChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusChipTextActive: {
    color: '#FFFFFF',
  },
  accountsList: {
    gap: 4,
  },
  accountOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
  },
  accountOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  accountOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  accountOptionTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
