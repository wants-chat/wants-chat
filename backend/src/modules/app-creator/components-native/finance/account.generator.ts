/**
 * Account Component Generators (React Native)
 *
 * Generates financial account overview, account cards, and transaction list components.
 * Uses View, Text, FlatList, and ScrollView for layouts.
 */

export interface AccountOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAccountOverview(options: AccountOptions = {}): string {
  const { componentName = 'AccountOverview', endpoint = '/accounts' } = options;

  return `import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface AccountOverviewData {
  total_balance?: number;
  income?: number;
  expenses?: number;
  savings?: number;
  credit_used?: number;
  investments?: number;
}

const { width: screenWidth } = Dimensions.get('window');

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity: animatedValue }]}>
      <View style={styles.statCardContent}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: overview, isLoading, refetch } = useQuery({
    queryKey: ['account-overview'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/overview');
      return response?.data || response || {};
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#8B5CF6"
          colors={['#8B5CF6']}
        />
      }
    >
      {/* Hero Balance Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Balance</Text>
        <Text style={styles.heroBalance}>
          \${(overview?.total_balance || 0).toLocaleString()}
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <Ionicons name="trending-up" size={16} color="#10B981" />
            <Text style={styles.heroStatText}>
              \${(overview?.income || 0).toLocaleString()} income
            </Text>
          </View>
          <View style={styles.heroStatItem}>
            <Ionicons name="trending-down" size={16} color="#EF4444" />
            <Text style={styles.heroStatText}>
              \${(overview?.expenses || 0).toLocaleString()} expenses
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Savings"
          value={\`\$\${(overview?.savings || 0).toLocaleString()}\`}
          icon="wallet"
          color="#10B981"
        />
        <StatCard
          label="Credit Used"
          value={\`\$\${(overview?.credit_used || 0).toLocaleString()}\`}
          icon="card"
          color="#3B82F6"
        />
        <StatCard
          label="Investments"
          value={\`\$\${(overview?.investments || 0).toLocaleString()}\`}
          icon="pie-chart"
          color="#8B5CF6"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  heroBalance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroStatText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: (screenWidth - 44) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statInfo: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});

export default ${componentName};
`;
}

export function generateAccountCards(options: AccountOptions = {}): string {
  const { componentName = 'AccountCards', endpoint = '/accounts' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  account_number?: string;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 32;

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: accounts, isLoading, refetch } = useQuery({
    queryKey: ['accounts'],
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

  const getAccountIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type?.toLowerCase()) {
      case 'credit': return 'card';
      case 'savings': return 'wallet';
      default: return 'business';
    }
  };

  const getAccountColors = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'credit': return { start: '#EF4444', end: '#EC4899' };
      case 'savings': return { start: '#10B981', end: '#059669' };
      default: return { start: '#3B82F6', end: '#6366F1' };
    }
  };

  const renderAccountCard = useCallback(({ item }: { item: Account }) => {
    const colors = getAccountColors(item.type);
    const icon = getAccountIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.accountCard, { backgroundColor: colors.start }]}
        onPress={() => navigation.navigate('AccountDetail' as never, { id: item.id } as never)}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <Ionicons name={icon} size={32} color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.cardType}>{item.type?.toUpperCase()}</Text>
        </View>
        <Text style={styles.cardBalance}>
          \${(item.balance || 0).toLocaleString()}
        </Text>
        <Text style={styles.cardName}>{item.name}</Text>
        {item.account_number && (
          <Text style={styles.cardNumber}>
            **** {item.account_number.slice(-4)}
          </Text>
        )}
      </TouchableOpacity>
    );
  }, [navigation]);

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
        <Text style={styles.title}>Accounts</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#8B5CF6" />
          <Text style={styles.addButtonText}>Add Account</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={accounts || []}
        renderItem={renderAccountCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No accounts found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  accountCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardType: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
  },
  cardBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyContainer: {
    width: CARD_WIDTH,
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

export function generateTransactionList(options: AccountOptions = {}): string {
  const { componentName = 'TransactionList', endpoint = '/transactions' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Transaction {
  id: string;
  description?: string;
  merchant?: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category?: string;
  date: string;
}

interface ${componentName}Props {
  accountId?: string;
}

type FilterType = 'all' | 'income' | 'expense' | 'transfer';

const ${componentName}: React.FC<${componentName}Props> = ({ accountId }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['transactions', accountId, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (accountId) params.append('account_id', accountId);
      if (filter !== 'all') params.append('type', filter);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredTransactions = transactions?.filter((tx: Transaction) =>
    tx.description?.toLowerCase().includes(search.toLowerCase()) ||
    tx.merchant?.toLowerCase().includes(search.toLowerCase())
  );

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'income', label: 'Income' },
    { key: 'expense', label: 'Expense' },
    { key: 'transfer', label: 'Transfer' },
  ];

  const renderTransaction = useCallback(({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={[
        styles.transactionIcon,
        item.type === 'income' ? styles.incomeIcon : styles.expenseIcon
      ]}>
        <Ionicons
          name={item.type === 'income' ? 'arrow-down-outline' : 'arrow-up-outline'}
          size={20}
          color={item.type === 'income' ? '#10B981' : '#EF4444'}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionName} numberOfLines={1}>
          {item.description || item.merchant || 'Transaction'}
        </Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
      </View>
      <View style={styles.transactionAmountContainer}>
        <Text style={[
          styles.transactionAmount,
          item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
        ]}>
          {item.type === 'income' ? '+' : '-'}\${Math.abs(item.amount).toLocaleString()}
        </Text>
        <Text style={styles.transactionDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  ), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.downloadButton}>
          <Ionicons name="download-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterTab,
              filter === option.key && styles.filterTabActive
            ]}
            onPress={() => setFilter(option.key)}
          >
            <Text style={[
              styles.filterTabText,
              filter === option.key && styles.filterTabTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions || []}
        renderItem={renderTransaction}
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
            <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No transactions found</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  downloadButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#8B5CF6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: '#D1FAE5',
  },
  expenseIcon: {
    backgroundColor: '#FEE2E2',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 13,
    color: '#6B7280',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: '#111827',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
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
