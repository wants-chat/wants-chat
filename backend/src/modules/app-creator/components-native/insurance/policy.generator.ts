/**
 * Insurance Policy Component Generators (React Native)
 *
 * Generates policy list, policy detail, policy filters, and policy form components.
 * Uses View, Text, FlatList, ScrollView, and TouchableOpacity for layouts.
 */

export interface PolicyOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePolicyList(options: PolicyOptions = {}): string {
  const { componentName = 'PolicyList', endpoint = '/policies' } = options;

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

interface Policy {
  id: string;
  policy_number: string;
  type: string;
  status: string;
  holder_name: string;
  coverage_amount: number;
  premium: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

type StatusFilter = 'all' | 'active' | 'pending' | 'expired' | 'cancelled';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: policies, isLoading, refetch } = useQuery({
    queryKey: ['policies', status, searchTerm],
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

  const getStatusColor = (policyStatus: string) => {
    switch (policyStatus?.toLowerCase()) {
      case 'active':
        return { color: '#10B981', bgColor: '#D1FAE5' };
      case 'pending':
        return { color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'expired':
        return { color: '#EF4444', bgColor: '#FEE2E2' };
      case 'cancelled':
        return { color: '#6B7280', bgColor: '#F3F4F6' };
      default:
        return { color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const getPolicyTypeIcon = (type: string): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (type?.toLowerCase()) {
      case 'health':
        return { name: 'heart', color: '#EF4444' };
      case 'auto':
        return { name: 'car', color: '#3B82F6' };
      case 'home':
        return { name: 'home', color: '#8B5CF6' };
      case 'life':
        return { name: 'person', color: '#10B981' };
      default:
        return { name: 'shield', color: '#6B7280' };
    }
  };

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'expired', label: 'Expired' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderPolicy = useCallback(({ item }: { item: Policy }) => {
    const statusColors = getStatusColor(item.status);
    const typeIcon = getPolicyTypeIcon(item.type);

    return (
      <TouchableOpacity
        style={styles.policyCard}
        onPress={() => navigation.navigate('PolicyDetail' as never, { id: item.id } as never)}
        activeOpacity={0.7}
      >
        <View style={styles.policyHeader}>
          <View style={[styles.typeIcon, { backgroundColor: typeIcon.color + '20' }]}>
            <Ionicons name={typeIcon.name} size={20} color={typeIcon.color} />
          </View>
          <View style={styles.policyInfo}>
            <Text style={styles.policyNumber}>{item.policy_number}</Text>
            <Text style={styles.policyType}>{item.type} Insurance</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bgColor }]}>
            <Text style={[styles.statusText, { color: statusColors.color }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.policyDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Holder</Text>
            <Text style={styles.detailValue}>{item.holder_name}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Coverage</Text>
            <Text style={styles.detailValue}>\${item.coverage_amount?.toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Premium</Text>
            <Text style={styles.detailValue}>\${item.premium?.toLocaleString()}/mo</Text>
          </View>
        </View>

        <View style={styles.policyFooter}>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>Expires {formatDate(item.end_date)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
            placeholder="Search policies..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('PolicyForm' as never)}
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

      {/* Policies List */}
      <FlatList
        data={policies || []}
        renderItem={renderPolicy}
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
            <Ionicons name="shield-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No policies found</Text>
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
  newButton: {
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
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  policyInfo: {
    flex: 1,
  },
  policyNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  policyType: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  policyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  policyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
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

export function generatePolicyDetail(options: PolicyOptions = {}): string {
  const { componentName = 'PolicyDetail', endpoint = '/policies' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface PolicyDetails {
  id: string;
  policy_number: string;
  type: string;
  status: string;
  holder_name: string;
  holder_email: string;
  holder_phone: string;
  holder_address: string;
  coverage_amount: number;
  deductible: number;
  premium: number;
  payment_frequency: string;
  start_date: string;
  end_date: string;
  beneficiaries: Array<{ name: string; relationship: string; percentage: number }>;
  coverage_details: Array<{ item: string; covered: boolean; limit: number }>;
  documents: Array<{ name: string; url: string; type: string }>;
  created_at: string;
  updated_at: string;
}

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const { data: policy, isLoading } = useQuery({
    queryKey: ['policy', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { icon: 'checkmark-circle', color: '#10B981', bgColor: '#D1FAE5', label: 'Active' };
      case 'pending':
        return { icon: 'time', color: '#F59E0B', bgColor: '#FEF3C7', label: 'Pending' };
      case 'expired':
        return { icon: 'alert-circle', color: '#EF4444', bgColor: '#FEE2E2', label: 'Expired' };
      default:
        return { icon: 'shield', color: '#6B7280', bgColor: '#F3F4F6', label: status };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePhonePress = () => {
    if (policy?.holder_phone) {
      Linking.openURL('tel:' + policy.holder_phone);
    }
  };

  const handleEmailPress = () => {
    if (policy?.holder_email) {
      Linking.openURL('mailto:' + policy.holder_email);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!policy) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Policy not found</Text>
      </View>
    );
  }

  const statusConfig = getStatusConfig(policy.status);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={[styles.policyIcon, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="shield" size={32} color="#8B5CF6" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.policyNumber}>{policy.policy_number}</Text>
            <Text style={styles.policyType}>{policy.type} Insurance</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={() => navigation.navigate('EditPolicy' as never, { id } as never)}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryActionButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Policy Holder Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Policy Holder</Text>
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{policy.holder_name}</Text>
          </View>
          {policy.holder_email && (
            <TouchableOpacity style={styles.infoItem} onPress={handleEmailPress}>
              <Ionicons name="mail-outline" size={18} color="#6B7280" />
              <Text style={[styles.infoText, styles.linkText]}>{policy.holder_email}</Text>
            </TouchableOpacity>
          )}
          {policy.holder_phone && (
            <TouchableOpacity style={styles.infoItem} onPress={handlePhonePress}>
              <Ionicons name="call-outline" size={18} color="#6B7280" />
              <Text style={[styles.infoText, styles.linkText]}>{policy.holder_phone}</Text>
            </TouchableOpacity>
          )}
          {policy.holder_address && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text style={styles.infoText}>{policy.holder_address}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Policy Details Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Policy Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Coverage Amount</Text>
            <Text style={styles.detailValue}>\${policy.coverage_amount?.toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Deductible</Text>
            <Text style={styles.detailValue}>\${policy.deductible?.toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Premium</Text>
            <Text style={styles.detailValue}>
              \${policy.premium?.toLocaleString()}/{policy.payment_frequency || 'month'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Date</Text>
            <Text style={styles.detailValue}>{formatDate(policy.start_date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>End Date</Text>
            <Text style={styles.detailValue}>{formatDate(policy.end_date)}</Text>
          </View>
        </View>
      </View>

      {/* Coverage Details Section */}
      {policy.coverage_details && policy.coverage_details.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Coverage Details</Text>
          <View style={styles.coverageList}>
            {policy.coverage_details.map((item: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.coverageItem,
                  item.covered ? styles.coverageItemCovered : styles.coverageItemNotCovered,
                ]}
              >
                <View style={styles.coverageInfo}>
                  <Ionicons
                    name={item.covered ? 'checkmark-circle' : 'alert-circle'}
                    size={18}
                    color={item.covered ? '#10B981' : '#9CA3AF'}
                  />
                  <Text style={[styles.coverageText, !item.covered && styles.coverageTextMuted]}>
                    {item.item}
                  </Text>
                </View>
                {item.limit > 0 && (
                  <Text style={styles.coverageLimit}>Up to \${item.limit.toLocaleString()}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Beneficiaries Section */}
      {policy.beneficiaries && policy.beneficiaries.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Beneficiaries</Text>
          <View style={styles.beneficiariesList}>
            {policy.beneficiaries.map((beneficiary: any, index: number) => (
              <View key={index} style={styles.beneficiaryItem}>
                <View style={styles.beneficiaryInfo}>
                  <Text style={styles.beneficiaryName}>{beneficiary.name}</Text>
                  <Text style={styles.beneficiaryRelation}>{beneficiary.relationship}</Text>
                </View>
                <Text style={styles.beneficiaryPercentage}>{beneficiary.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Documents Section */}
      {policy.documents && policy.documents.length > 0 && (
        <View style={[styles.sectionCard, { marginBottom: 24 }]}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <View style={styles.documentsList}>
            {policy.documents.map((doc: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.documentItem}
                onPress={() => Linking.openURL(doc.url)}
              >
                <View style={styles.documentIcon}>
                  <Ionicons name="document-text" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                  <Text style={styles.documentType}>{doc.type}</Text>
                </View>
                <Ionicons name="download-outline" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  policyIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  policyNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  policyType: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  primaryActionButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  linkText: {
    color: '#3B82F6',
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  coverageList: {
    gap: 8,
  },
  coverageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  coverageItemCovered: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  coverageItemNotCovered: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coverageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  coverageText: {
    fontSize: 14,
    color: '#111827',
  },
  coverageTextMuted: {
    color: '#6B7280',
  },
  coverageLimit: {
    fontSize: 13,
    color: '#6B7280',
  },
  beneficiariesList: {
    gap: 12,
  },
  beneficiaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  beneficiaryInfo: {
    flex: 1,
  },
  beneficiaryName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  beneficiaryRelation: {
    fontSize: 13,
    color: '#6B7280',
  },
  beneficiaryPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  documentsList: {
    gap: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  documentType: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generatePolicyFilters(options: PolicyOptions = {}): string {
  const { componentName = 'PolicyFilters' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PolicyFilterValues {
  type?: string;
  status?: string;
  minCoverage?: number;
  maxCoverage?: number;
  minPremium?: number;
  maxPremium?: number;
  expiringWithin?: number;
}

interface ${componentName}Props {
  onFilterChange: (filters: PolicyFilterValues) => void;
  initialFilters?: PolicyFilterValues;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<PolicyFilterValues>(initialFilters);

  const policyTypes = ['health', 'auto', 'home', 'life', 'business', 'travel'];
  const statusOptions = ['active', 'pending', 'expired', 'cancelled'];
  const expiryOptions = [
    { value: 30, label: '30 days' },
    { value: 60, label: '60 days' },
    { value: 90, label: '90 days' },
    { value: 180, label: '6 months' },
  ];

  const handleFilterChange = (key: keyof PolicyFilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
    setIsOpen(false);
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilterCount > 0 && styles.filterButtonActive,
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Ionicons
          name="filter"
          size={18}
          color={activeFilterCount > 0 ? '#8B5CF6' : '#6B7280'}
        />
        <Text
          style={[
            styles.filterButtonText,
            activeFilterCount > 0 && styles.filterButtonTextActive,
          ]}
        >
          Filters
        </Text>
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Policies</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Policy Type */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Policy Type</Text>
                <View style={styles.optionsGrid}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      !filters.type && styles.optionButtonActive,
                    ]}
                    onPress={() => handleFilterChange('type', undefined)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        !filters.type && styles.optionTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {policyTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        filters.type === type && styles.optionButtonActive,
                      ]}
                      onPress={() => handleFilterChange('type', type)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.type === type && styles.optionTextActive,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Status */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Status</Text>
                <View style={styles.optionsGrid}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      !filters.status && styles.optionButtonActive,
                    ]}
                    onPress={() => handleFilterChange('status', undefined)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        !filters.status && styles.optionTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {statusOptions.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.optionButton,
                        filters.status === status && styles.optionButtonActive,
                      ]}
                      onPress={() => handleFilterChange('status', status)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.status === status && styles.optionTextActive,
                        ]}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Coverage Amount Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Coverage Amount</Text>
                <View style={styles.rangeInputs}>
                  <View style={styles.rangeInputContainer}>
                    <Text style={styles.rangeLabel}>Min</Text>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={filters.minCoverage?.toString() || ''}
                      onChangeText={(value) =>
                        handleFilterChange('minCoverage', value ? Number(value) : undefined)
                      }
                    />
                  </View>
                  <Text style={styles.rangeSeparator}>-</Text>
                  <View style={styles.rangeInputContainer}>
                    <Text style={styles.rangeLabel}>Max</Text>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder="Any"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={filters.maxCoverage?.toString() || ''}
                      onChangeText={(value) =>
                        handleFilterChange('maxCoverage', value ? Number(value) : undefined)
                      }
                    />
                  </View>
                </View>
              </View>

              {/* Monthly Premium Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Monthly Premium</Text>
                <View style={styles.rangeInputs}>
                  <View style={styles.rangeInputContainer}>
                    <Text style={styles.rangeLabel}>Min</Text>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={filters.minPremium?.toString() || ''}
                      onChangeText={(value) =>
                        handleFilterChange('minPremium', value ? Number(value) : undefined)
                      }
                    />
                  </View>
                  <Text style={styles.rangeSeparator}>-</Text>
                  <View style={styles.rangeInputContainer}>
                    <Text style={styles.rangeLabel}>Max</Text>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder="Any"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={filters.maxPremium?.toString() || ''}
                      onChangeText={(value) =>
                        handleFilterChange('maxPremium', value ? Number(value) : undefined)
                      }
                    />
                  </View>
                </View>
              </View>

              {/* Expiring Within */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Expiring Within</Text>
                <View style={styles.optionsGrid}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      !filters.expiringWithin && styles.optionButtonActive,
                    ]}
                    onPress={() => handleFilterChange('expiringWithin', undefined)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        !filters.expiringWithin && styles.optionTextActive,
                      ]}
                    >
                      Any
                    </Text>
                  </TouchableOpacity>
                  {expiryOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        filters.expiringWithin === option.value && styles.optionButtonActive,
                      ]}
                      onPress={() => handleFilterChange('expiringWithin', option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.expiringWithin === option.value && styles.optionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  filterButtonActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  filterButtonTextActive: {
    color: '#8B5CF6',
  },
  badge: {
    backgroundColor: '#8B5CF6',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalBody: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  optionTextActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeInputContainer: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  rangeInput: {
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rangeSeparator: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 20,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generatePolicyForm(options: PolicyOptions = {}): string {
  const { componentName = 'PolicyForm', endpoint = '/policies' } = options;

  return `import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface PolicyFormData {
  type: string;
  holder_name: string;
  holder_email: string;
  holder_phone: string;
  holder_address: string;
  coverage_amount: string;
  deductible: string;
  premium: string;
  payment_frequency: string;
  start_date: string;
  end_date: string;
}

interface Beneficiary {
  name: string;
  relationship: string;
  percentage: string;
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const routeId = (route.params as { id?: string })?.id;
  const isEditing = Boolean(routeId);

  const [formData, setFormData] = useState<PolicyFormData>({
    type: 'health',
    holder_name: '',
    holder_email: '',
    holder_phone: '',
    holder_address: '',
    coverage_amount: '',
    deductible: '',
    premium: '',
    payment_frequency: 'monthly',
    start_date: '',
    end_date: '',
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const { isLoading: isLoadingPolicy } = useQuery({
    queryKey: ['policy', routeId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + routeId);
      const policy = response?.data || response;
      if (policy) {
        setFormData({
          type: policy.type || 'health',
          holder_name: policy.holder_name || '',
          holder_email: policy.holder_email || '',
          holder_phone: policy.holder_phone || '',
          holder_address: policy.holder_address || '',
          coverage_amount: policy.coverage_amount?.toString() || '',
          deductible: policy.deductible?.toString() || '',
          premium: policy.premium?.toString() || '',
          payment_frequency: policy.payment_frequency || 'monthly',
          start_date: policy.start_date?.split('T')[0] || '',
          end_date: policy.end_date?.split('T')[0] || '',
        });
        setBeneficiaries(
          (policy.beneficiaries || []).map((b: any) => ({
            ...b,
            percentage: b.percentage?.toString() || '',
          }))
        );
      }
      return policy;
    },
    enabled: isEditing,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEditing ? api.put('${endpoint}/' + routeId, data) : api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      Alert.alert('Success', isEditing ? 'Policy updated!' : 'Policy created!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save policy');
    },
  });

  const handleInputChange = (field: keyof PolicyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { name: '', relationship: '', percentage: '' }]);
  };

  const updateBeneficiary = (index: number, field: keyof Beneficiary, value: string) => {
    const updated = [...beneficiaries];
    updated[index] = { ...updated[index], [field]: value };
    setBeneficiaries(updated);
  };

  const removeBeneficiary = (index: number) => {
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.holder_name || !formData.coverage_amount || !formData.premium) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    mutation.mutate({
      ...formData,
      coverage_amount: parseFloat(formData.coverage_amount) || 0,
      deductible: parseFloat(formData.deductible) || 0,
      premium: parseFloat(formData.premium) || 0,
      beneficiaries: beneficiaries.map((b) => ({
        ...b,
        percentage: parseFloat(b.percentage) || 0,
      })),
    });
  };

  const policyTypes = ['health', 'auto', 'home', 'life', 'business', 'travel'];
  const frequencyOptions = ['monthly', 'quarterly', 'annually'];

  if (isEditing && isLoadingPolicy) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Policy Type */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield" size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>
            {isEditing ? 'Edit Policy' : 'New Insurance Policy'}
          </Text>
        </View>

        <Text style={styles.label}>Policy Type *</Text>
        <View style={styles.typeGrid}>
          {policyTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeOption,
                formData.type === type && styles.typeOptionSelected,
              ]}
              onPress={() => handleInputChange('type', type)}
            >
              <Text
                style={[
                  styles.typeOptionText,
                  formData.type === type && styles.typeOptionTextSelected,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Payment Frequency</Text>
        <View style={styles.frequencyRow}>
          {frequencyOptions.map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.frequencyOption,
                formData.payment_frequency === freq && styles.frequencyOptionSelected,
              ]}
              onPress={() => handleInputChange('payment_frequency', freq)}
            >
              <Text
                style={[
                  styles.frequencyText,
                  formData.payment_frequency === freq && styles.frequencyTextSelected,
                ]}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Policy Holder */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color="#6B7280" />
          <Text style={styles.sectionSubtitle}>Policy Holder</Text>
        </View>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          placeholderTextColor="#9CA3AF"
          value={formData.holder_name}
          onChangeText={(value) => handleInputChange('holder_name', value)}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.holder_email}
          onChangeText={(value) => handleInputChange('holder_email', value)}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="(000) 000-0000"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          value={formData.holder_phone}
          onChangeText={(value) => handleInputChange('holder_phone', value)}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter address"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          value={formData.holder_address}
          onChangeText={(value) => handleInputChange('holder_address', value)}
        />
      </View>

      {/* Financial Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cash-outline" size={20} color="#6B7280" />
          <Text style={styles.sectionSubtitle}>Financial Details</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Coverage Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              value={formData.coverage_amount}
              onChangeText={(value) => handleInputChange('coverage_amount', value)}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Deductible</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              value={formData.deductible}
              onChangeText={(value) => handleInputChange('deductible', value)}
            />
          </View>
        </View>

        <Text style={styles.label}>Premium *</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          value={formData.premium}
          onChangeText={(value) => handleInputChange('premium', value)}
        />
      </View>

      {/* Policy Period */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          <Text style={styles.sectionSubtitle}>Policy Period</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Start Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={formData.start_date}
              onChangeText={(value) => handleInputChange('start_date', value)}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>End Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={formData.end_date}
              onChangeText={(value) => handleInputChange('end_date', value)}
            />
          </View>
        </View>
      </View>

      {/* Beneficiaries */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderWithAction}>
          <Text style={styles.sectionSubtitle}>Beneficiaries</Text>
          <TouchableOpacity style={styles.addButton} onPress={addBeneficiary}>
            <Ionicons name="add" size={18} color="#8B5CF6" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {beneficiaries.length > 0 ? (
          beneficiaries.map((beneficiary, index) => (
            <View key={index} style={styles.beneficiaryCard}>
              <View style={styles.beneficiaryRow}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Name"
                  placeholderTextColor="#9CA3AF"
                  value={beneficiary.name}
                  onChangeText={(value) => updateBeneficiary(index, 'name', value)}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeBeneficiary(index)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <View style={styles.beneficiaryRow}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Relationship"
                  placeholderTextColor="#9CA3AF"
                  value={beneficiary.relationship}
                  onChangeText={(value) => updateBeneficiary(index, 'relationship', value)}
                />
                <TextInput
                  style={[styles.input, styles.percentInput]}
                  placeholder="%"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={beneficiary.percentage}
                  onChangeText={(value) => updateBeneficiary(index, 'percentage', value)}
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No beneficiaries added</Text>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
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
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Update Policy' : 'Create Policy'}
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
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
  frequencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  frequencyOptionSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  frequencyText: {
    fontSize: 14,
    color: '#374151',
  },
  frequencyTextSelected: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  flex1: {
    flex: 1,
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
  beneficiaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  beneficiaryRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  removeButton: {
    width: 44,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentInput: {
    width: 70,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFFFFF',
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
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
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
