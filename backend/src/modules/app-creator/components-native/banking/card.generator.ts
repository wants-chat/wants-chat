/**
 * Banking Card Component Generators for React Native
 *
 * Generates card management components:
 * - Card Detail view with controls
 * - Card List with visual card representations
 */

export interface CardOptions {
  componentName?: string;
  endpoint?: string;
  cardDetailScreen?: string;
}

export function generateCardDetail(options: CardOptions = {}): string {
  const {
    componentName = 'CardDetail',
    endpoint = '/banking/cards',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

type RouteParams = {
  CardDetail: { id: string };
};

interface CardDetails {
  id: string;
  card_number: string;
  card_holder: string;
  type: 'debit' | 'credit' | 'prepaid';
  brand: string;
  expiry_month: string;
  expiry_year: string;
  cvv?: string;
  status: 'active' | 'frozen' | 'blocked' | 'expired';
  credit_limit?: number;
  available_credit?: number;
  current_balance?: number;
  billing_date?: number;
  minimum_payment?: number;
  rewards_points?: number;
  is_virtual?: boolean;
}

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  status: string;
  category: string;
}

function ${componentName}() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CardDetail'>>();
  const { id } = route.params;
  const queryClient = useQueryClient();

  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: card, isLoading, refetch } = useQuery({
    queryKey: ['card', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ['card-transactions', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/transactions?limit=5');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const freezeMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + id + '/freeze', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', id] });
      showToast('success', 'Card frozen successfully');
    },
    onError: () => showToast('error', 'Failed to freeze card'),
  });

  const unfreezeMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + id + '/unfreeze', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', id] });
      showToast('success', 'Card unfrozen successfully');
    },
    onError: () => showToast('error', 'Failed to unfreeze card'),
  });

  const copyToClipboard = async (text: string, type: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(type);
    showToast('success', \`\${type} copied\`);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatCardNumber = (number: string, show: boolean) => {
    if (!show) return '**** **** **** ' + number.slice(-4);
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const getCardGradient = (): [string, string] => {
    if (!card) return ['#374151', '#1F2937'];
    if (card.type === 'credit') return ['#8B5CF6', '#6366F1'];
    if (card.type === 'prepaid') return ['#F59E0B', '#D97706'];
    if (card.brand?.toLowerCase() === 'visa') return ['#3B82F6', '#1D4ED8'];
    if (card.brand?.toLowerCase() === 'mastercard') return ['#EF4444', '#DC2626'];
    return ['#374151', '#1F2937'];
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#D1FAE5', text: '#059669', icon: 'shield-checkmark', label: 'Active' };
      case 'frozen':
        return { bg: '#DBEAFE', text: '#2563EB', icon: 'snow', label: 'Frozen' };
      case 'blocked':
        return { bg: '#FEE2E2', text: '#DC2626', icon: 'lock-closed', label: 'Blocked' };
      case 'expired':
        return { bg: '#F3F4F6', text: '#6B7280', icon: 'alert-circle', label: 'Expired' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', icon: 'card', label: status };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Card not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getStatusConfig(card.status);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Details</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Ionicons
            name={statusConfig.icon as keyof typeof Ionicons.glyphMap}
            size={14}
            color={statusConfig.text}
          />
          <Text style={[styles.statusText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Card Visual */}
      <View style={styles.cardContainer}>
        <LinearGradient colors={getCardGradient()} style={styles.card}>
          {card.status === 'frozen' && (
            <View style={styles.frozenOverlay}>
              <Ionicons name="snow" size={48} color="#FFFFFF" />
              <Text style={styles.frozenText}>Card Frozen</Text>
            </View>
          )}

          <View style={styles.cardHeader}>
            {card.is_virtual && (
              <View style={styles.virtualBadge}>
                <Text style={styles.virtualText}>Virtual</Text>
              </View>
            )}
            <Text style={styles.brandText}>{card.brand?.toUpperCase()}</Text>
          </View>

          <View style={styles.cardNumberRow}>
            <Text style={styles.cardNumber}>
              {formatCardNumber(card.card_number, showCardNumber)}
            </Text>
            <TouchableOpacity onPress={() => setShowCardNumber(!showCardNumber)}>
              <Ionicons
                name={showCardNumber ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => copyToClipboard(card.card_number, 'Card number')}>
              <Ionicons
                name={copied === 'Card number' ? 'checkmark' : 'copy-outline'}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>Card Holder</Text>
              <Text style={styles.cardValue}>{card.card_holder}</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>Expires</Text>
              <Text style={styles.cardValue}>
                {card.expiry_month}/{card.expiry_year}
              </Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>CVV</Text>
              <View style={styles.cvvRow}>
                <Text style={styles.cardValue}>{showCvv ? card.cvv : '***'}</Text>
                <TouchableOpacity onPress={() => setShowCvv(!showCvv)}>
                  <Ionicons
                    name={showCvv ? 'eye-off-outline' : 'eye-outline'}
                    size={14}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        {card.status === 'frozen' ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => unfreezeMutation.mutate()}
            disabled={unfreezeMutation.isPending}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
              {unfreezeMutation.isPending ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Ionicons name="lock-open-outline" size={22} color="#3B82F6" />
              )}
            </View>
            <Text style={styles.actionLabel}>Unfreeze</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => freezeMutation.mutate()}
            disabled={freezeMutation.isPending}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
              {freezeMutation.isPending ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Ionicons name="snow-outline" size={22} color="#3B82F6" />
              )}
            </View>
            <Text style={styles.actionLabel}>Freeze</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="settings-outline" size={22} color="#8B5CF6" />
          </View>
          <Text style={styles.actionLabel}>Limits</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="keypad-outline" size={22} color="#10B981" />
          </View>
          <Text style={styles.actionLabel}>PIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="refresh-outline" size={22} color="#F59E0B" />
          </View>
          <Text style={styles.actionLabel}>Replace</Text>
        </TouchableOpacity>
      </View>

      {/* Credit Card Summary */}
      {card.type === 'credit' && (
        <View style={styles.creditSummary}>
          <Text style={styles.sectionTitle}>Credit Summary</Text>
          <View style={styles.creditGrid}>
            <View style={styles.creditItem}>
              <Text style={styles.creditLabel}>Credit Limit</Text>
              <Text style={styles.creditValue}>\${card.credit_limit?.toLocaleString()}</Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditLabel}>Available</Text>
              <Text style={[styles.creditValue, styles.creditValueGreen]}>
                \${card.available_credit?.toLocaleString()}
              </Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditLabel}>Balance</Text>
              <Text style={styles.creditValue}>\${card.current_balance?.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.utilizationSection}>
            <View style={styles.utilizationHeader}>
              <Text style={styles.utilizationLabel}>Credit Utilization</Text>
              <Text style={styles.utilizationPercent}>
                {(((card.current_balance || 0) / (card.credit_limit || 1)) * 100).toFixed(0)}%
              </Text>
            </View>
            <View style={styles.utilizationBar}>
              <View
                style={[
                  styles.utilizationFill,
                  {
                    width: \`\${Math.min(((card.current_balance || 0) / (card.credit_limit || 1)) * 100, 100)}%\`,
                    backgroundColor: ((card.current_balance || 0) / (card.credit_limit || 1)) > 0.7 ? '#EF4444' : '#10B981'
                  }
                ]}
              />
            </View>
          </View>
          {card.billing_date && (
            <View style={styles.billingInfo}>
              <View style={styles.billingItem}>
                <Text style={styles.billingLabel}>Next billing</Text>
                <Text style={styles.billingValue}>Day {card.billing_date}</Text>
              </View>
              {card.minimum_payment && (
                <View style={styles.billingItem}>
                  <Text style={styles.billingLabel}>Minimum due</Text>
                  <Text style={styles.billingValue}>\${card.minimum_payment}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {transactions && transactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {transactions.map((tx: Transaction) => (
              <View key={tx.id} style={styles.transactionItem}>
                <View style={styles.txIcon}>
                  <Ionicons name="card-outline" size={20} color="#6B7280" />
                </View>
                <View style={styles.txDetails}>
                  <Text style={styles.txMerchant} numberOfLines={1}>{tx.merchant}</Text>
                  <Text style={styles.txCategory}>{tx.category}</Text>
                </View>
                <View style={styles.txAmount}>
                  <Text style={styles.txAmountText}>-\${tx.amount.toLocaleString()}</Text>
                  <Text style={styles.txDate}>{new Date(tx.date).toLocaleDateString()}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyTx}>
            <Text style={styles.emptyTxText}>No transactions yet</Text>
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    minHeight: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  frozenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 20,
  },
  frozenText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  virtualBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  virtualText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  brandText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  cardNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  cardNumber: {
    fontSize: 18,
    fontFamily: 'Courier',
    letterSpacing: 2,
    color: '#FFFFFF',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cvvRow: {
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
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  creditSummary: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  creditGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  creditItem: {
    alignItems: 'center',
  },
  creditLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  creditValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  creditValueGreen: {
    color: '#10B981',
  },
  utilizationSection: {
    marginBottom: 16,
  },
  utilizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  utilizationLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  utilizationPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  utilizationBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 3,
  },
  billingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  billingItem: {},
  billingLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  transactionsSection: {
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
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txMerchant: {
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

export function generateCardList(options: CardOptions = {}): string {
  const {
    componentName = 'CardList',
    endpoint = '/banking/cards',
    cardDetailScreen = 'CardDetail',
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
const CARD_WIDTH = SCREEN_WIDTH - 64;

interface Card {
  id: string;
  card_number: string;
  card_holder: string;
  type: 'debit' | 'credit' | 'prepaid';
  brand: string;
  expiry_month: string;
  expiry_year: string;
  status: 'active' | 'frozen' | 'blocked' | 'expired';
  credit_limit?: number;
  current_balance?: number;
  is_virtual?: boolean;
}

function ${componentName}() {
  const navigation = useNavigation();
  const [showNumbers, setShowNumbers] = useState(false);

  const { data: cards, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['banking-cards'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#D1FAE5', text: '#059669', icon: 'shield-checkmark', label: 'Active' };
      case 'frozen':
        return { bg: '#DBEAFE', text: '#2563EB', icon: 'snow', label: 'Frozen' };
      case 'blocked':
        return { bg: '#FEE2E2', text: '#DC2626', icon: 'lock-closed', label: 'Blocked' };
      case 'expired':
        return { bg: '#F3F4F6', text: '#6B7280', icon: 'alert-circle', label: 'Expired' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', icon: 'card', label: status };
    }
  };

  const getCardGradient = (type: string, brand: string): [string, string] => {
    if (type === 'credit') return ['#8B5CF6', '#6366F1'];
    if (type === 'prepaid') return ['#F59E0B', '#D97706'];
    if (brand?.toLowerCase() === 'visa') return ['#3B82F6', '#1D4ED8'];
    if (brand?.toLowerCase() === 'mastercard') return ['#EF4444', '#DC2626'];
    return ['#374151', '#1F2937'];
  };

  const formatCardNumber = (number: string) => {
    if (!showNumbers) return '**** **** **** ' + number.slice(-4);
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleCardPress = useCallback((cardId: string) => {
    navigation.navigate('${cardDetailScreen}' as never, { id: cardId } as never);
  }, [navigation]);

  const renderCard = useCallback(({ item }: { item: Card }) => {
    const statusConfig = getStatusConfig(item.status);
    const gradientColors = getCardGradient(item.type, item.brand);

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => handleCardPress(item.id)}
        activeOpacity={0.9}
      >
        <LinearGradient colors={gradientColors} style={styles.card}>
          {item.status === 'frozen' && (
            <View style={styles.frozenOverlay}>
              <Ionicons name="snow" size={32} color="rgba(255,255,255,0.8)" />
            </View>
          )}

          <View style={styles.cardHeader}>
            <View style={styles.cardBadges}>
              {item.is_virtual && (
                <View style={styles.virtualBadge}>
                  <Text style={styles.virtualText}>Virtual</Text>
                </View>
              )}
              <View style={[styles.statusBadgeMini, { backgroundColor: statusConfig.bg }]}>
                <Text style={[styles.statusTextMini, { color: statusConfig.text }]}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>
            <Text style={styles.brandText}>{item.brand?.toUpperCase()}</Text>
          </View>

          <Text style={styles.cardNumber}>{formatCardNumber(item.card_number)}</Text>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>Card Holder</Text>
              <Text style={styles.cardValue}>{item.card_holder}</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>Expires</Text>
              <Text style={styles.cardValue}>{item.expiry_month}/{item.expiry_year}</Text>
            </View>
          </View>

          {item.type === 'credit' && item.current_balance !== undefined && (
            <View style={styles.creditInfo}>
              <View style={styles.creditRow}>
                <Text style={styles.creditLabel}>Balance</Text>
                <Text style={styles.creditValue}>\${item.current_balance.toLocaleString()}</Text>
              </View>
              {item.credit_limit && (
                <>
                  <View style={styles.creditBar}>
                    <View
                      style={[
                        styles.creditFill,
                        { width: \`\${Math.min((item.current_balance / item.credit_limit) * 100, 100)}%\` }
                      ]}
                    />
                  </View>
                  <Text style={styles.creditLimit}>\${item.credit_limit.toLocaleString()} limit</Text>
                </>
              )}
            </View>
          )}
        </LinearGradient>

        <View style={styles.cardMeta}>
          <Text style={styles.cardType}>{item.type} Card</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [showNumbers, handleCardPress]);

  const keyExtractor = useCallback((item: Card) => item.id, []);

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
          <Text style={styles.headerTitle}>Cards</Text>
          <Text style={styles.headerSubtitle}>Manage your cards</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowNumbers(!showNumbers)}
          >
            <Ionicons
              name={showNumbers ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Card</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cards List */}
      <FlatList
        data={cards}
        renderItem={renderCard}
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
            <Ionicons name="card-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No cards yet</Text>
            <Text style={styles.emptySubtitle}>Add a debit or credit card</Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Add Card</Text>
            </TouchableOpacity>
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    minHeight: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  frozenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  virtualBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  virtualText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusBadgeMini: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusTextMini: {
    fontSize: 11,
    fontWeight: '600',
  },
  brandText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  cardNumber: {
    fontSize: 16,
    fontFamily: 'Courier',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  creditInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  creditLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  creditValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  creditBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  creditFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  creditLimit: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 12,
  },
  cardType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  moreButton: {
    padding: 4,
  },
  emptyContainer: {
    paddingVertical: 64,
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
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}
