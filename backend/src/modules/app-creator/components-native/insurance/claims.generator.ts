/**
 * Insurance Claims Component Generators (React Native)
 *
 * Generates claims list, claims stats, claim form, and claim timeline components.
 * Uses View, Text, FlatList, ScrollView, and TouchableOpacity for layouts.
 */

export interface ClaimsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateClaimsList(options: ClaimsOptions = {}): string {
  const { componentName = 'ClaimsList', endpoint = '/claims' } = options;

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
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Claim {
  id: string;
  claim_number: string;
  policy_number: string;
  type: string;
  status: string;
  amount_claimed: number;
  amount_approved: number;
  incident_date: string;
  filed_date: string;
  description: string;
  claimant_name: string;
}

type StatusFilter = 'all' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: claims, isLoading, refetch } = useQuery({
    queryKey: ['claims', status, searchTerm],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusConfig = (claimStatus: string) => {
    switch (claimStatus?.toLowerCase()) {
      case 'approved':
        return { icon: 'checkmark-circle', color: '#10B981', bgColor: '#D1FAE5' };
      case 'pending':
        return { icon: 'time', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'under_review':
        return { icon: 'alert-circle', color: '#3B82F6', bgColor: '#DBEAFE' };
      case 'rejected':
        return { icon: 'close-circle', color: '#EF4444', bgColor: '#FEE2E2' };
      case 'paid':
        return { icon: 'cash', color: '#8B5CF6', bgColor: '#EDE9FE' };
      default:
        return { icon: 'document-text', color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'under_review', label: 'Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'paid', label: 'Paid' },
  ];

  const renderClaim = useCallback(({ item }: { item: Claim }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={styles.claimCard}
        onPress={() => navigation.navigate('ClaimDetail' as never, { id: item.id } as never)}
        activeOpacity={0.7}
      >
        <View style={styles.claimHeader}>
          <View style={styles.claimNumberRow}>
            <Text style={styles.claimNumber}>#{item.claim_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {item.status?.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <Text style={styles.claimDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <View style={styles.claimMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="document-text-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>Policy: {item.policy_number}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {new Date(item.incident_date).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.claimAmounts}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Claimed</Text>
            <Text style={styles.amountValue}>
              \${item.amount_claimed?.toLocaleString()}
            </Text>
          </View>
          {item.amount_approved > 0 && (
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Approved</Text>
              <Text style={[styles.amountValue, styles.approvedAmount]}>
                \${item.amount_approved?.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search claims..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <TouchableOpacity
          style={styles.newClaimButton}
          onPress={() => navigation.navigate('ClaimForm' as never)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={statusFilters}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                status === item.key && styles.filterTabActive,
              ]}
              onPress={() => setStatus(item.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  status === item.key && styles.filterTabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Claims List */}
      <FlatList
        data={claims || []}
        renderItem={renderClaim}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No claims found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  newClaimButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
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
    padding: 16,
    gap: 12,
  },
  claimCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  claimHeader: {
    marginBottom: 12,
  },
  claimNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  claimNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  claimDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  claimMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  claimAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountItem: {
    alignItems: 'flex-start',
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  approvedAmount: {
    color: '#10B981',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateClaimsStats(options: ClaimsOptions = {}): string {
  const { componentName = 'ClaimsStats', endpoint = '/claims/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ClaimsStatsData {
  total_claims: number;
  pending_claims: number;
  approved_claims: number;
  rejected_claims: number;
  total_claimed: number;
  total_paid: number;
  average_processing_time: number;
  approval_rate: number;
  claims_this_month: number;
  claims_last_month: number;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['claims-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const claimsTrend = (stats?.claims_this_month || 0) > (stats?.claims_last_month || 0);
  const trendPercentage = stats?.claims_last_month > 0
    ? Math.round(((stats.claims_this_month - stats.claims_last_month) / stats.claims_last_month) * 100)
    : 0;

  const statCards = [
    {
      label: 'Total Claims',
      value: stats?.total_claims || 0,
      icon: 'document-text',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      label: 'Pending',
      value: stats?.pending_claims || 0,
      icon: 'time',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      label: 'Approved',
      value: stats?.approved_claims || 0,
      icon: 'checkmark-circle',
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      label: 'Rejected',
      value: stats?.rejected_claims || 0,
      icon: 'close-circle',
      color: '#EF4444',
      bgColor: '#FEE2E2',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            {stat.label === 'Total Claims' && trendPercentage !== 0 && (
              <View style={styles.trendContainer}>
                <Ionicons
                  name={claimsTrend ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={claimsTrend ? '#EF4444' : '#10B981'}
                />
                <Text style={[styles.trendText, { color: claimsTrend ? '#EF4444' : '#10B981' }]}>
                  {Math.abs(trendPercentage)}%
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Financial Stats */}
      <View style={styles.financialCard}>
        <View style={styles.financialRow}>
          <View style={styles.financialItem}>
            <View style={[styles.financialIconContainer, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="cash-outline" size={20} color="#8B5CF6" />
            </View>
            <View>
              <Text style={styles.financialLabel}>Total Claimed</Text>
              <Text style={styles.financialValue}>
                \${(stats?.total_claimed || 0).toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.financialItem}>
            <View style={[styles.financialIconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
            </View>
            <View>
              <Text style={styles.financialLabel}>Total Paid</Text>
              <Text style={[styles.financialValue, { color: '#10B981' }]}>
                \${(stats?.total_paid || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Approval Rate Card */}
      <View style={styles.rateCard}>
        <View style={styles.rateHeader}>
          <View style={[styles.rateIconContainer, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="trending-up" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.rateLabel}>Approval Rate</Text>
        </View>
        <Text style={styles.rateValue}>{stats?.approval_rate || 0}%</Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: \`\${stats?.approval_rate || 0}%\` }]}
          />
        </View>
      </View>

      {/* Processing Time Card */}
      <View style={styles.processingCard}>
        <View style={styles.processingHeader}>
          <View style={[styles.processingIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.processingLabel}>Avg. Processing Time</Text>
        </View>
        <Text style={styles.processingValue}>{stats?.average_processing_time || 0} days</Text>
        <Text style={styles.processingSubtext}>From filing to resolution</Text>
      </View>

      {/* High Pending Alert */}
      {(stats?.pending_claims || 0) > 5 && (
        <View style={styles.alertCard}>
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>High Pending Claims</Text>
            <Text style={styles.alertText}>
              There are {stats.pending_claims} claims awaiting review. Consider prioritizing claim processing.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '500',
  },
  financialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  financialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  financialValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  rateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  rateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  rateValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  processingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  processingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  processingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  processingSubtext: {
    fontSize: 13,
    color: '#6B7280',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
  },
});

export default ${componentName};
`;
}

export function generateClaimForm(options: ClaimsOptions = {}): string {
  const { componentName = 'ClaimForm', endpoint = '/claims' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ClaimFormData {
  policy_id: string;
  type: string;
  incident_date: string;
  incident_location: string;
  description: string;
  amount_claimed: string;
  witnesses: string;
  police_report_number: string;
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<ClaimFormData>({
    policy_id: '',
    type: '',
    incident_date: '',
    incident_location: '',
    description: '',
    amount_claimed: '',
    witnesses: '',
    police_report_number: '',
  });

  const { data: policies } = useQuery({
    queryKey: ['user-policies'],
    queryFn: async () => {
      const response = await api.get<any>('/policies?status=active');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('${endpoint}', data);
    },
    onSuccess: () => {
      Alert.alert('Success', 'Claim filed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to file claim. Please try again.');
    },
  });

  const handleInputChange = (field: keyof ClaimFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.policy_id || !formData.type || !formData.incident_date || !formData.description || !formData.amount_claimed) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    mutation.mutate({
      ...formData,
      amount_claimed: parseFloat(formData.amount_claimed) || 0,
    });
  };

  const claimTypes = [
    { value: 'accident', label: 'Accident' },
    { value: 'theft', label: 'Theft' },
    { value: 'damage', label: 'Property Damage' },
    { value: 'medical', label: 'Medical Expense' },
    { value: 'liability', label: 'Liability' },
    { value: 'natural_disaster', label: 'Natural Disaster' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="document-text" size={24} color="#8B5CF6" />
        <Text style={styles.headerTitle}>File Insurance Claim</Text>
      </View>

      {/* Policy Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Select Policy *</Text>
        <View style={styles.pickerContainer}>
          {policies?.map((policy: any) => (
            <TouchableOpacity
              key={policy.id}
              style={[
                styles.policyOption,
                formData.policy_id === policy.id && styles.policyOptionSelected,
              ]}
              onPress={() => handleInputChange('policy_id', policy.id)}
            >
              <Text style={[
                styles.policyOptionText,
                formData.policy_id === policy.id && styles.policyOptionTextSelected,
              ]}>
                {policy.policy_number} - {policy.type}
              </Text>
              {formData.policy_id === policy.id && (
                <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Claim Type */}
      <View style={styles.section}>
        <Text style={styles.label}>Claim Type *</Text>
        <View style={styles.typeGrid}>
          {claimTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeOption,
                formData.type === type.value && styles.typeOptionSelected,
              ]}
              onPress={() => handleInputChange('type', type.value)}
            >
              <Text style={[
                styles.typeOptionText,
                formData.type === type.value && styles.typeOptionTextSelected,
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Incident Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Incident Date *</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            value={formData.incident_date}
            onChangeText={(value) => handleInputChange('incident_date', value)}
          />
        </View>
      </View>

      {/* Amount Claimed */}
      <View style={styles.section}>
        <Text style={styles.label}>Amount Claimed *</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="cash-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
            value={formData.amount_claimed}
            onChangeText={(value) => handleInputChange('amount_claimed', value)}
          />
        </View>
      </View>

      {/* Incident Location */}
      <View style={styles.section}>
        <Text style={styles.label}>Incident Location *</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="Address or location of incident"
            placeholderTextColor="#9CA3AF"
            value={formData.incident_location}
            onChangeText={(value) => handleInputChange('incident_location', value)}
          />
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Provide a detailed description of what happened..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
        />
      </View>

      {/* Witnesses */}
      <View style={styles.section}>
        <Text style={styles.label}>Witnesses (if any)</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="people-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="Names and contact info"
            placeholderTextColor="#9CA3AF"
            value={formData.witnesses}
            onChangeText={(value) => handleInputChange('witnesses', value)}
          />
        </View>
      </View>

      {/* Police Report */}
      <View style={styles.section}>
        <Text style={styles.label}>Police Report # (if applicable)</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="shield-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="Report number"
            placeholderTextColor="#9CA3AF"
            value={formData.police_report_number}
            onChangeText={(value) => handleInputChange('police_report_number', value)}
          />
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="alert-circle" size={20} color="#F59E0B" />
        <View style={styles.disclaimerContent}>
          <Text style={styles.disclaimerTitle}>Important Notice</Text>
          <Text style={styles.disclaimerText}>
            By submitting this claim, you certify that all information provided is true and accurate.
            False claims may result in policy cancellation and legal action.
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, mutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Claim</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
  },
  pickerContainer: {
    gap: 8,
  },
  policyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  policyOptionSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  policyOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  policyOptionTextSelected: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeOptionSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  typeOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generateClaimTimeline(options: ClaimsOptions = {}): string {
  const { componentName = 'ClaimTimeline', endpoint = '/claims' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  user_name?: string;
  metadata?: Record<string, any>;
}

interface ${componentName}Props {
  claimId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ claimId }) => {
  const route = useRoute();
  const routeClaimId = (route.params as { id?: string })?.id;
  const id = claimId || routeClaimId;

  const { data: timeline, isLoading } = useQuery({
    queryKey: ['claim-timeline', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/timeline');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
  });

  const getEventConfig = (type: string) => {
    switch (type) {
      case 'filed':
        return { icon: 'document-text', color: '#3B82F6', bgColor: '#DBEAFE' };
      case 'document_uploaded':
        return { icon: 'cloud-upload', color: '#8B5CF6', bgColor: '#EDE9FE' };
      case 'under_review':
        return { icon: 'time', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'info_requested':
        return { icon: 'alert-circle', color: '#F97316', bgColor: '#FED7AA' };
      case 'approved':
        return { icon: 'checkmark-circle', color: '#10B981', bgColor: '#D1FAE5' };
      case 'rejected':
        return { icon: 'close-circle', color: '#EF4444', bgColor: '#FEE2E2' };
      case 'payment_processed':
        return { icon: 'cash', color: '#10B981', bgColor: '#D1FAE5' };
      case 'comment':
        return { icon: 'chatbubble', color: '#6B7280', bgColor: '#F3F4F6' };
      default:
        return { icon: 'time', color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const renderTimelineEvent = ({ item, index }: { item: TimelineEvent; index: number }) => {
    const config = getEventConfig(item.type);
    const isLast = index === (timeline?.length || 0) - 1;

    return (
      <View style={styles.eventItem}>
        {/* Timeline */}
        <View style={styles.timelineColumn}>
          <View style={[styles.eventDot, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon as any} size={16} color={config.color} />
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        {/* Content */}
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDescription}>{item.description}</Text>

          <View style={styles.eventMeta}>
            <Text style={styles.eventDate}>{formatDate(item.created_at)}</Text>
            {item.user_name && (
              <View style={styles.userRow}>
                <Ionicons name="person-outline" size={12} color="#6B7280" />
                <Text style={styles.userName}>{item.user_name}</Text>
              </View>
            )}
          </View>

          {item.metadata?.amount && (
            <View style={styles.amountBadge}>
              <Ionicons name="cash-outline" size={14} color="#10B981" />
              <Text style={styles.amountText}>
                \${item.metadata.amount.toLocaleString()}
              </Text>
            </View>
          )}

          {item.metadata?.reason && (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>{item.metadata.reason}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Claim Timeline</Text>
      </View>

      <FlatList
        data={timeline || []}
        renderItem={renderTimelineEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No timeline events yet</Text>
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
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 36,
    marginRight: 12,
  },
  eventDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  eventContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  eventDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 12,
    color: '#6B7280',
  },
  amountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
  },
  reasonBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
