/**
 * Banking Account Component Generators for React Native
 *
 * Generates account-related components:
 * - Account Balance Cards with gradient styling
 * - Account Detail view with transaction history
 * - Account List with filtering
 */

export interface AccountOptions {
  componentName?: string;
  endpoint?: string;
  accountDetailScreen?: string;
  transferScreen?: string;
  billPayScreen?: string;
}

export function generateAccountBalanceCards(options: AccountOptions = {}): string {
  const {
    componentName = 'AccountBalanceCards',
    endpoint = '/banking/accounts',
    accountDetailScreen = 'AccountDetail',
  } = options;

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
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  account_number: string;
  is_primary?: boolean;
  change_percent?: number;
}

function ${componentName}() {
  const navigation = useNavigation();
  const [showBalances, setShowBalances] = useState(true);

  const { data: accounts, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['banking-accounts'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const totalBalance = accounts?.reduce((sum: number, acc: Account) => {
    return sum + (acc.type === 'credit' ? -acc.balance : acc.balance);
  }, 0) || 0;

  const getAccountIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'savings': return 'wallet-outline';
      case 'credit': return 'card-outline';
      case 'investment': return 'trending-up-outline';
      default: return 'cash-outline';
    }
  };

  const getAccountGradient = (type: string): [string, string] => {
    switch (type) {
      case 'savings': return ['#10B981', '#059669'];
      case 'credit': return ['#F43F5E', '#E11D48'];
      case 'investment': return ['#8B5CF6', '#7C3AED'];
      default: return ['#3B82F6', '#2563EB'];
    }
  };

  const formatBalance = (amount: number, currency: string = 'USD') => {
    if (!showBalances) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleAccountPress = useCallback((accountId: string) => {
    navigation.navigate('${accountDetailScreen}' as never, { id: accountId } as never);
  }, [navigation]);

  const renderAccount = useCallback(({ item }: { item: Account }) => {
    const gradientColors = getAccountGradient(item.type);
    const iconName = getAccountIcon(item.type);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleAccountPress(item.id)}
        style={styles.cardWrapper}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={24} color="#FFFFFF" />
            </View>
            {item.is_primary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryText}>Primary</Text>
              </View>
            )}
          </View>

          <Text style={styles.cardBalance}>
            {formatBalance(item.balance, item.currency)}
          </Text>
          <Text style={styles.cardName}>{item.name}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.cardNumber}>
              {showBalances ? \`**** \${item.account_number?.slice(-4)}\` : '**** ****'}
            </Text>
            {item.change_percent !== undefined && (
              <View style={styles.changeContainer}>
                <Ionicons
                  name={item.change_percent >= 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={item.change_percent >= 0 ? '#FFFFFF' : '#FCA5A5'}
                />
                <Text style={[
                  styles.changeText,
                  item.change_percent < 0 && styles.changeTextNegative
                ]}>
                  {Math.abs(item.change_percent)}%
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, [showBalances, handleAccountPress]);

  const keyExtractor = useCallback((item: Account) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Total Balance Header */}
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.headerCard}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerLabel}>Total Net Worth</Text>
          <TouchableOpacity
            style={styles.visibilityButton}
            onPress={() => setShowBalances(!showBalances)}
          >
            <Ionicons
              name={showBalances ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerBalance}>{formatBalance(totalBalance)}</Text>
        <View style={styles.headerStats}>
          <Ionicons name="trending-up" size={16} color="#10B981" />
          <Text style={styles.headerStatsText}>+2.5% this month</Text>
        </View>
      </LinearGradient>

      {/* Account Cards */}
      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#3B82F6"
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  visibilityButton: {
    padding: 8,
    marginRight: -8,
  },
  headerBalance: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  headerStatsText: {
    fontSize: 14,
    color: '#10B981',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cardWrapper: {
    marginRight: 12,
  },
  card: {
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cardBalance: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  changeTextNegative: {
    color: '#FCA5A5',
  },
  emptyContainer: {
    width: CARD_WIDTH,
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateAccountDetail(options: AccountOptions = {}): string {
  const {
    componentName = 'AccountDetail',
    endpoint = '/banking/accounts',
    transferScreen = 'TransferForm',
    billPayScreen = 'BillPayment',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

type RouteParams = {
  AccountDetail: { id: string };
};

interface AccountDetails {
  id: string;
  name: string;
  type: string;
  balance: number;
  available_balance: number;
  currency: string;
  account_number: string;
  routing_number?: string;
  interest_rate?: number;
  opened_date: string;
  last_activity: string;
  status: 'active' | 'inactive' | 'frozen';
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: string;
}

function ${componentName}() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'AccountDetail'>>();
  const { id } = route.params;
  const [copied, setCopied] = useState(false);

  const { data: account, isLoading: accountLoading, refetch } = useQuery({
    queryKey: ['account', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['account-transactions', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/transactions?limit=10');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const copyAccountNumber = async () => {
    if (account?.account_number) {
      await Clipboard.setStringAsync(account.account_number);
      setCopied(true);
      showToast('success', 'Account number copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account?.currency || 'USD',
    }).format(amount);
  };

  if (accountLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Account not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refetch} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{account.name}</Text>
          <Text style={styles.headerSubtitle}>{account.type} Account</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="settings-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={styles.balanceCard}
      >
        <View style={styles.balanceRow}>
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(account.balance)}</Text>
            <Text style={styles.balanceAvailable}>
              Available: {formatCurrency(account.available_balance)}
            </Text>
          </View>
          <View style={styles.accountInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Number</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyAccountNumber}
              >
                <Text style={styles.infoValue}>
                  **** {account.account_number?.slice(-4)}
                </Text>
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={16}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
            {account.routing_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Routing Number</Text>
                <Text style={styles.infoValue}>{account.routing_number}</Text>
              </View>
            )}
            {account.interest_rate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Interest Rate</Text>
                <Text style={styles.infoValue}>{account.interest_rate}% APY</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('${transferScreen}' as never)}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="arrow-up" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.actionLabel}>Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('${billPayScreen}' as never)}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="arrow-down" size={24} color="#10B981" />
          </View>
          <Text style={styles.actionLabel}>Pay Bill</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="download-outline" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.actionLabel}>Statements</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: '#F3F4F6' }]}>
            <Ionicons name="settings-outline" size={24} color="#6B7280" />
          </View>
          <Text style={styles.actionLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {txLoading ? (
          <ActivityIndicator size="small" color="#3B82F6" style={styles.txLoader} />
        ) : transactions && transactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {transactions.map((tx: Transaction) => (
              <View key={tx.id} style={styles.transactionItem}>
                <View style={[
                  styles.txIcon,
                  tx.type === 'credit' ? styles.txIconCredit : styles.txIconDebit
                ]}>
                  <Ionicons
                    name={tx.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                    size={20}
                    color={tx.type === 'credit' ? '#10B981' : '#EF4444'}
                  />
                </View>
                <View style={styles.txDetails}>
                  <Text style={styles.txDescription} numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Text style={styles.txCategory}>{tx.category}</Text>
                </View>
                <View style={styles.txAmount}>
                  <Text style={[
                    styles.txAmountText,
                    tx.type === 'credit' && styles.txAmountCredit
                  ]}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                  </Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyTx}>
            <Text style={styles.emptyTxText}>No recent transactions</Text>
          </View>
        )}
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
    textTransform: 'capitalize',
  },
  balanceCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceSection: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  balanceAvailable: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  accountInfo: {
    gap: 12,
  },
  infoRow: {
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  txLoader: {
    marginVertical: 32,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txIconCredit: {
    backgroundColor: '#D1FAE5',
  },
  txIconDebit: {
    backgroundColor: '#FEE2E2',
  },
  txDetails: {
    flex: 1,
  },
  txDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  txCategory: {
    fontSize: 13,
    color: '#6B7280',
  },
  txAmount: {
    alignItems: 'flex-end',
  },
  txAmountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  txAmountCredit: {
    color: '#10B981',
  },
  txDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyTx: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTxText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}

export function generateAccountList(options: AccountOptions = {}): string {
  const {
    componentName = 'AccountList',
    endpoint = '/banking/accounts',
    accountDetailScreen = 'AccountDetail',
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

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  account_number: string;
  institution?: string;
  status: 'active' | 'inactive' | 'frozen';
  is_primary?: boolean;
}

const accountTypes = ['all', 'checking', 'savings', 'credit', 'investment'];

function ${componentName}() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showBalances, setShowBalances] = useState(true);

  const { data: accounts, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['banking-accounts-list'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredAccounts = accounts?.filter((account: Account) => {
    const matchesSearch = account.name.toLowerCase().includes(search.toLowerCase()) ||
      account.institution?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getAccountIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'savings': return 'wallet-outline';
      case 'credit': return 'card-outline';
      case 'investment': return 'trending-up-outline';
      default: return 'cash-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#D1FAE5', text: '#059669' };
      case 'inactive': return { bg: '#F3F4F6', text: '#6B7280' };
      case 'frozen': return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (!showBalances) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleAccountPress = useCallback((accountId: string) => {
    navigation.navigate('${accountDetailScreen}' as never, { id: accountId } as never);
  }, [navigation]);

  const renderAccount = useCallback(({ item }: { item: Account }) => {
    const iconName = getAccountIcon(item.type);
    const statusColors = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.accountItem}
        onPress={() => handleAccountPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.accountIcon}>
          <Ionicons name={iconName} size={24} color="#6B7280" />
        </View>
        <View style={styles.accountDetails}>
          <View style={styles.accountNameRow}>
            <Text style={styles.accountName} numberOfLines={1}>{item.name}</Text>
            {item.is_primary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryText}>Primary</Text>
              </View>
            )}
          </View>
          <View style={styles.accountMeta}>
            <Text style={styles.accountType}>{item.type}</Text>
            {item.institution && (
              <>
                <Text style={styles.metaDot}>*</Text>
                <Text style={styles.accountInstitution}>{item.institution}</Text>
              </>
            )}
            <Text style={styles.metaDot}>*</Text>
            <Text style={styles.accountNumber}>**** {item.account_number?.slice(-4)}</Text>
          </View>
        </View>
        <View style={styles.accountRight}>
          <Text style={[
            styles.accountBalance,
            item.type === 'credit' && styles.creditBalance
          ]}>
            {item.type === 'credit' && item.balance > 0 ? '-' : ''}
            {formatCurrency(item.balance, item.currency)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [showBalances, handleAccountPress]);

  const keyExtractor = useCallback((item: Account) => item.id, []);

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
          <Text style={styles.headerTitle}>Accounts</Text>
          <Text style={styles.headerSubtitle}>Manage all your bank accounts</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowBalances(!showBalances)}
          >
            <Ionicons
              name={showBalances ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Link Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search accounts..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <FlatList
          data={accountTypes}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                typeFilter === item && styles.filterChipActive
              ]}
              onPress={() => setTypeFilter(item)}
            >
              <Text style={[
                styles.filterChipText,
                typeFilter === item && styles.filterChipTextActive
              ]}>
                {item === 'all' ? 'All Types' : item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* Account List */}
      <FlatList
        data={filteredAccounts}
        renderItem={renderAccount}
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
            <Ionicons name="wallet-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No accounts found</Text>
            <Text style={styles.emptySubtitle}>Link a bank account to get started</Text>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  filtersContainer: {
    paddingBottom: 12,
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
  accountItem: {
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
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  primaryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  accountMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  accountType: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  metaDot: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 6,
  },
  accountInstitution: {
    fontSize: 13,
    color: '#6B7280',
  },
  accountNumber: {
    fontSize: 13,
    color: '#6B7280',
  },
  accountRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  creditBalance: {
    color: '#EF4444',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
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
