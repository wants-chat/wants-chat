/**
 * Banking Transfer Component Generators for React Native
 *
 * Generates transfer-related components:
 * - Transfer Form for sending money
 * - Transfer History list
 * - Beneficiary List management
 */

export interface TransferOptions {
  componentName?: string;
  endpoint?: string;
  transferDetailScreen?: string;
  beneficiaryDetailScreen?: string;
}

export function generateTransferForm(options: TransferOptions = {}): string {
  const {
    componentName = 'TransferForm',
    endpoint = '/banking/transfers',
  } = options;

  return `import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  account_number: string;
}

interface Beneficiary {
  id: string;
  name: string;
  bank_name?: string;
  account_number: string;
  is_favorite?: boolean;
}

type TransferType = 'internal' | 'external' | 'beneficiary';

function ${componentName}() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [transferType, setTransferType] = useState<TransferType>('internal');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['transfer-accounts'],
    queryFn: async () => {
      const response = await api.get<any>('/banking/accounts');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: beneficiaries } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const response = await api.get<any>('/banking/beneficiaries');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: transferType === 'beneficiary',
  });

  const transferMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-history'] });
      showToast('success', 'Transfer initiated successfully!');
      navigation.goBack();
    },
    onError: () => showToast('error', 'Transfer failed. Please try again.'),
  });

  useEffect(() => {
    if (accounts && accounts.length > 0 && !fromAccountId) {
      setFromAccountId(accounts[0].id);
    }
  }, [accounts, fromAccountId]);

  const fromAccount = accounts?.find((a: Account) => a.id === fromAccountId);
  const transferAmount = parseFloat(amount) || 0;
  const insufficientFunds = fromAccount && transferAmount > fromAccount.balance;
  const sameAccount = transferType === 'internal' && fromAccountId === toAccountId && fromAccountId !== '';

  const handleSubmit = () => {
    if (insufficientFunds) {
      Alert.alert('Error', 'Insufficient funds');
      return;
    }

    if (sameAccount) {
      Alert.alert('Error', 'Cannot transfer to the same account');
      return;
    }

    transferMutation.mutate({
      type: transferType,
      from_account_id: fromAccountId,
      to_account_id: transferType === 'internal' ? toAccountId : undefined,
      beneficiary_id: transferType === 'beneficiary' ? beneficiaryId : undefined,
      amount: transferAmount,
      description,
      is_recurring: isRecurring,
      frequency: isRecurring ? frequency : undefined,
    });
  };

  const getAvailableToAccounts = () => {
    return accounts?.filter((a: Account) => a.id !== fromAccountId) || [];
  };

  const quickAmounts = [50, 100, 250, 500];

  if (accountsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transfer Money</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Transfer Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, transferType === 'internal' && styles.typeButtonActive]}
            onPress={() => setTransferType('internal')}
          >
            <Ionicons
              name="swap-horizontal"
              size={18}
              color={transferType === 'internal' ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[
              styles.typeButtonText,
              transferType === 'internal' && styles.typeButtonTextActive
            ]}>
              Between
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, transferType === 'beneficiary' && styles.typeButtonActive]}
            onPress={() => setTransferType('beneficiary')}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={transferType === 'beneficiary' ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[
              styles.typeButtonText,
              transferType === 'beneficiary' && styles.typeButtonTextActive
            ]}>
              Beneficiary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, transferType === 'external' && styles.typeButtonActive]}
            onPress={() => setTransferType('external')}
          >
            <Ionicons
              name="business-outline"
              size={18}
              color={transferType === 'external' ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[
              styles.typeButtonText,
              transferType === 'external' && styles.typeButtonTextActive
            ]}>
              External
            </Text>
          </TouchableOpacity>
        </View>

        {/* From Account */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>From Account</Text>
          <View style={styles.accountList}>
            {accounts?.map((account: Account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountOption,
                  fromAccountId === account.id && styles.accountOptionActive
                ]}
                onPress={() => setFromAccountId(account.id)}
              >
                <View style={styles.accountIcon}>
                  <Ionicons name="wallet-outline" size={20} color="#6B7280" />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountNumber}>**** {account.account_number.slice(-4)}</Text>
                </View>
                <View style={styles.accountBalance}>
                  <Text style={styles.accountBalanceText}>\${account.balance.toLocaleString()}</Text>
                </View>
                {fromAccountId === account.id && (
                  <Ionicons name="checkmark-circle" size={22} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Arrow Indicator */}
        <View style={styles.arrowContainer}>
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-down" size={24} color="#3B82F6" />
          </View>
        </View>

        {/* To Account / Beneficiary */}
        <View style={styles.section}>
          {transferType === 'internal' && (
            <>
              <Text style={styles.sectionLabel}>To Account</Text>
              <View style={styles.accountList}>
                {getAvailableToAccounts().map((account: Account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountOption,
                      toAccountId === account.id && styles.accountOptionActiveGreen
                    ]}
                    onPress={() => setToAccountId(account.id)}
                  >
                    <View style={styles.accountIcon}>
                      <Ionicons name="wallet-outline" size={20} color="#6B7280" />
                    </View>
                    <View style={styles.accountDetails}>
                      <Text style={styles.accountName}>{account.name}</Text>
                      <Text style={styles.accountNumber}>**** {account.account_number.slice(-4)}</Text>
                    </View>
                    {toAccountId === account.id && (
                      <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
                {getAvailableToAccounts().length === 0 && (
                  <Text style={styles.emptyText}>No other accounts available</Text>
                )}
              </View>
            </>
          )}

          {transferType === 'beneficiary' && (
            <>
              <Text style={styles.sectionLabel}>Select Beneficiary</Text>
              <View style={styles.accountList}>
                {beneficiaries?.map((beneficiary: Beneficiary) => (
                  <TouchableOpacity
                    key={beneficiary.id}
                    style={[
                      styles.accountOption,
                      beneficiaryId === beneficiary.id && styles.accountOptionActiveGreen
                    ]}
                    onPress={() => setBeneficiaryId(beneficiary.id)}
                  >
                    <View style={styles.beneficiaryAvatar}>
                      <Text style={styles.beneficiaryInitial}>
                        {beneficiary.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.accountDetails}>
                      <Text style={styles.accountName}>{beneficiary.name}</Text>
                      <Text style={styles.accountNumber}>
                        {beneficiary.bank_name} * **** {beneficiary.account_number.slice(-4)}
                      </Text>
                    </View>
                    {beneficiaryId === beneficiary.id && (
                      <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
                {(!beneficiaries || beneficiaries.length === 0) && (
                  <View style={styles.emptyBeneficiary}>
                    <Text style={styles.emptyText}>No beneficiaries saved</Text>
                    <TouchableOpacity>
                      <Text style={styles.addBeneficiaryLink}>Add a beneficiary</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}

          {transferType === 'external' && (
            <>
              <Text style={styles.sectionLabel}>Recipient Details</Text>
              <View style={styles.externalForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Recipient Name"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Bank Name"
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="Account Number"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="Routing Number"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Amount</Text>
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
              <Text style={styles.errorMessageText}>
                Insufficient funds. Available: \${fromAccount?.balance.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.quickAmounts}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>\${quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="What's this transfer for?"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Recurring */}
        <TouchableOpacity
          style={styles.recurringToggle}
          onPress={() => setIsRecurring(!isRecurring)}
        >
          <View style={[styles.checkbox, isRecurring && styles.checkboxActive]}>
            {isRecurring && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.recurringLabel}>Make this a recurring transfer</Text>
        </TouchableOpacity>

        {isRecurring && (
          <View style={styles.frequencyOptions}>
            {['weekly', 'biweekly', 'monthly', 'quarterly'].map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyChip,
                  frequency === freq && styles.frequencyChipActive
                ]}
                onPress={() => setFrequency(freq)}
              >
                <Text style={[
                  styles.frequencyChipText,
                  frequency === freq && styles.frequencyChipTextActive
                ]}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (transferMutation.isPending ||
              insufficientFunds ||
              transferAmount <= 0 ||
              !fromAccountId ||
              (transferType === 'internal' && !toAccountId) ||
              (transferType === 'beneficiary' && !beneficiaryId)) &&
            styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={
            transferMutation.isPending ||
            insufficientFunds ||
            transferAmount <= 0 ||
            !fromAccountId ||
            (transferType === 'internal' && !toAccountId) ||
            (transferType === 'beneficiary' && !beneficiaryId)
          }
        >
          {transferMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>
                Transfer \${transferAmount.toLocaleString()}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  typeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  accountList: {
    gap: 10,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  accountOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  accountOptionActiveGreen: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  accountNumber: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  accountBalance: {
    marginRight: 12,
  },
  accountBalanceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  beneficiaryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  beneficiaryInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  emptyBeneficiary: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  addBeneficiaryLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginTop: 8,
  },
  externalForm: {
    gap: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: -4,
    zIndex: 10,
  },
  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F9FAFB',
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
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 16,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  errorMessageText: {
    fontSize: 13,
    color: '#DC2626',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  recurringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
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
  recurringLabel: {
    fontSize: 14,
    color: '#374151',
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  frequencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  frequencyChipActive: {
    backgroundColor: '#3B82F6',
  },
  frequencyChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  frequencyChipTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 14,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generateTransferHistory(options: TransferOptions = {}): string {
  const {
    componentName = 'TransferHistory',
    endpoint = '/banking/transfers',
    transferDetailScreen = 'TransferDetail',
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

interface Transfer {
  id: string;
  type: 'internal' | 'external' | 'incoming';
  from_account_name?: string;
  to_account_name?: string;
  beneficiary_name?: string;
  amount: number;
  currency: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  completed_at?: string;
  reference_number?: string;
}

function ${componentName}() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: transfers, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['transfer-history', statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      const response = await api.get<any>('${endpoint}?' + params.toString());
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredTransfers = transfers?.filter((transfer: Transfer) => {
    const searchLower = search.toLowerCase();
    return (
      transfer.to_account_name?.toLowerCase().includes(searchLower) ||
      transfer.from_account_name?.toLowerCase().includes(searchLower) ||
      transfer.beneficiary_name?.toLowerCase().includes(searchLower) ||
      transfer.description?.toLowerCase().includes(searchLower) ||
      transfer.reference_number?.toLowerCase().includes(searchLower)
    );
  });

  const totalSent = filteredTransfers?.filter((t: Transfer) => t.type !== 'incoming' && t.status === 'completed')
    .reduce((sum: number, t: Transfer) => sum + t.amount, 0) || 0;
  const totalReceived = filteredTransfers?.filter((t: Transfer) => t.type === 'incoming' && t.status === 'completed')
    .reduce((sum: number, t: Transfer) => sum + t.amount, 0) || 0;

  const getTransferIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return { name: 'arrow-down', color: '#10B981', bg: '#D1FAE5' };
      case 'internal':
        return { name: 'swap-horizontal', color: '#3B82F6', bg: '#DBEAFE' };
      default:
        return { name: 'arrow-up', color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706', icon: 'time' };
      case 'failed':
        return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' };
      case 'cancelled':
        return { bg: '#F3F4F6', text: '#6B7280', icon: 'close-circle' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', icon: 'time' };
    }
  };

  const handleTransferPress = useCallback((transferId: string) => {
    navigation.navigate('${transferDetailScreen}' as never, { id: transferId } as never);
  }, [navigation]);

  const renderTransfer = useCallback(({ item }: { item: Transfer }) => {
    const iconConfig = getTransferIcon(item.type);
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={styles.transferItem}
        onPress={() => handleTransferPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.transferIcon, { backgroundColor: iconConfig.bg }]}>
          <Ionicons
            name={iconConfig.name as keyof typeof Ionicons.glyphMap}
            size={20}
            color={iconConfig.color}
          />
        </View>
        <View style={styles.transferDetails}>
          <Text style={styles.transferRecipient} numberOfLines={1}>
            {item.type === 'incoming' ? (
              <>From: {item.from_account_name || 'External'}</>
            ) : item.type === 'internal' ? (
              <>To: {item.to_account_name}</>
            ) : (
              <>To: {item.beneficiary_name || item.to_account_name}</>
            )}
          </Text>
          <View style={styles.transferMeta}>
            <Text style={styles.transferType}>{item.type}</Text>
            {item.reference_number && (
              <>
                <Text style={styles.metaDot}>*</Text>
                <Text style={styles.transferRef}>Ref: {item.reference_number.slice(-6)}</Text>
              </>
            )}
          </View>
        </View>
        <View style={styles.transferRight}>
          <Text style={[
            styles.transferAmount,
            item.type === 'incoming' && styles.transferAmountGreen
          ]}>
            {item.type === 'incoming' ? '+' : '-'}\${item.amount.toLocaleString()}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Ionicons
              name={statusConfig.icon as keyof typeof Ionicons.glyphMap}
              size={12}
              color={statusConfig.text}
            />
            <Text style={[styles.statusText, { color: statusConfig.text }]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.transferDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleTransferPress]);

  const keyExtractor = useCallback((item: Transfer) => item.id, []);

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
          <Text style={styles.headerTitle}>Transfer History</Text>
          <Text style={styles.headerSubtitle}>View and track transfers</Text>
        </View>
        <TouchableOpacity
          style={styles.newTransferButton}
          onPress={() => navigation.navigate('TransferForm' as never)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.newTransferText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="arrow-up" size={18} color="#DC2626" />
          </View>
          <View>
            <Text style={styles.statLabel}>Total Sent</Text>
            <Text style={styles.statValue}>\${totalSent.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="arrow-down" size={18} color="#10B981" />
          </View>
          <View>
            <Text style={styles.statLabel}>Received</Text>
            <Text style={styles.statValue}>\${totalReceived.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transfers..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filters */}
      <FlatList
        data={['all', 'internal', 'external', 'incoming']}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, typeFilter === item && styles.filterChipActive]}
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

      {/* Transfer List */}
      <FlatList
        data={filteredTransfers}
        renderItem={renderTransfer}
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
            <Ionicons name="swap-horizontal" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No transfers found</Text>
            <Text style={styles.emptySubtitle}>Your history will appear here</Text>
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
  newTransferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newTransferText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
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
  transferItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transferIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transferDetails: {
    flex: 1,
  },
  transferRecipient: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  transferMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  transferType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  metaDot: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 6,
  },
  transferRef: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transferRight: {
    alignItems: 'flex-end',
  },
  transferAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  transferAmountGreen: {
    color: '#10B981',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  transferDate: {
    fontSize: 11,
    color: '#9CA3AF',
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

export function generateBeneficiaryList(options: TransferOptions = {}): string {
  const {
    componentName = 'BeneficiaryList',
    endpoint = '/banking/beneficiaries',
    beneficiaryDetailScreen = 'BeneficiaryEdit',
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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface Beneficiary {
  id: string;
  name: string;
  nickname?: string;
  bank_name: string;
  account_number: string;
  routing_number?: string;
  account_type: 'checking' | 'savings';
  is_favorite: boolean;
  last_transfer_date?: string;
  total_transferred?: number;
}

function ${componentName}() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { data: beneficiaries, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      showToast('success', 'Beneficiary removed');
    },
    onError: () => showToast('error', 'Failed to remove'),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => api.put('${endpoint}/' + id + '/favorite', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Remove Beneficiary',
      \`Are you sure you want to remove \${name}?\`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  const filteredBeneficiaries = beneficiaries?.filter((b: Beneficiary) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.nickname?.toLowerCase().includes(search.toLowerCase()) ||
      b.bank_name.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || b.is_favorite;
    return matchesSearch && matchesFavorite;
  });

  const sortedBeneficiaries = filteredBeneficiaries?.sort((a: Beneficiary, b: Beneficiary) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return 0;
  });

  const handleBeneficiaryPress = useCallback((beneficiaryId: string) => {
    navigation.navigate('${beneficiaryDetailScreen}' as never, { id: beneficiaryId } as never);
  }, [navigation]);

  const renderBeneficiary = useCallback(({ item }: { item: Beneficiary }) => (
    <View style={styles.beneficiaryItem}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        {item.is_favorite && (
          <View style={styles.favoriteBadge}>
            <Ionicons name="star" size={10} color="#F59E0B" />
          </View>
        )}
      </View>

      <View style={styles.beneficiaryDetails}>
        <View style={styles.nameRow}>
          <Text style={styles.beneficiaryName} numberOfLines={1}>{item.name}</Text>
          {item.nickname && (
            <Text style={styles.nickname}>({item.nickname})</Text>
          )}
        </View>
        <View style={styles.beneficiaryMeta}>
          <Ionicons name="business-outline" size={14} color="#9CA3AF" />
          <Text style={styles.bankName}>{item.bank_name}</Text>
          <Text style={styles.metaDot}>*</Text>
          <Text style={styles.accountType}>{item.account_type}</Text>
          <Text style={styles.metaDot}>*</Text>
          <Text style={styles.accountNumber}>**** {item.account_number.slice(-4)}</Text>
        </View>
        {item.last_transfer_date && (
          <Text style={styles.lastTransfer}>
            Last transfer: {new Date(item.last_transfer_date).toLocaleDateString()}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => navigation.navigate('TransferForm' as never, { beneficiaryId: item.id } as never)}
        >
          <Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" />
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => toggleFavoriteMutation.mutate(item.id)}
        >
          <Ionicons
            name={item.is_favorite ? 'star' : 'star-outline'}
            size={20}
            color={item.is_favorite ? '#F59E0B' : '#9CA3AF'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleBeneficiaryPress(item.id)}
        >
          <Ionicons name="create-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  ), [handleBeneficiaryPress, navigation, toggleFavoriteMutation]);

  const keyExtractor = useCallback((item: Beneficiary) => item.id, []);

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
          <Text style={styles.headerTitle}>Beneficiaries</Text>
          <Text style={styles.headerSubtitle}>Saved recipients</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.toolbarRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search beneficiaries..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={[styles.favoriteFilter, showFavoritesOnly && styles.favoriteFilterActive]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Ionicons
            name={showFavoritesOnly ? 'star' : 'star-outline'}
            size={18}
            color={showFavoritesOnly ? '#F59E0B' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      {/* Beneficiary List */}
      <FlatList
        data={sortedBeneficiaries}
        renderItem={renderBeneficiary}
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
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No beneficiaries</Text>
            <Text style={styles.emptySubtitle}>Add recipients for quick transfers</Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Add Beneficiary</Text>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  toolbarRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  favoriteFilter: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  favoriteFilterActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  beneficiaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
  },
  favoriteBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  beneficiaryDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  beneficiaryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  nickname: {
    fontSize: 13,
    color: '#6B7280',
  },
  beneficiaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  bankName: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaDot: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  accountType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  accountNumber: {
    fontSize: 12,
    color: '#6B7280',
  },
  lastTransfer: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 4,
  },
  sendButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  iconButton: {
    padding: 8,
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
