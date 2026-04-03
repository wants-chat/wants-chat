/**
 * Insurance Customer Component Generators (React Native)
 *
 * Generates customer profile and document list components.
 * Uses View, Text, FlatList, ScrollView, and TouchableOpacity for layouts.
 */

export interface CustomerOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfile(options: CustomerOptions = {}): string {
  const { componentName = 'CustomerProfile', endpoint = '/customers' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
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

interface Customer {
  id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  avatar_url?: string;
  created_at: string;
  policies: Array<{
    id: string;
    policy_number: string;
    type: string;
    status: string;
    premium: number;
    end_date: string;
  }>;
  claims: Array<{
    id: string;
    claim_number: string;
    status: string;
    amount_claimed: number;
    created_at: string;
  }>;
  total_premium: number;
  total_coverage: number;
  active_policies_count: number;
  pending_claims_count: number;
}

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return { color: '#10B981', bgColor: '#D1FAE5' };
      case 'pending':
        return { color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'expired':
      case 'rejected':
        return { color: '#EF4444', bgColor: '#FEE2E2' };
      default:
        return { color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const handlePhonePress = () => {
    if (customer?.phone) {
      Linking.openURL('tel:' + customer.phone);
    }
  };

  const handleEmailPress = () => {
    if (customer?.email) {
      Linking.openURL('mailto:' + customer.email);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Customer not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {customer.avatar_url ? (
              <Image source={{ uri: customer.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#8B5CF6" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.customerName}>
              {customer.first_name} {customer.last_name}
            </Text>
            <Text style={styles.customerNumber}>Customer #{customer.customer_number}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditCustomer' as never, { id } as never)}
          >
            <Ionicons name="create-outline" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" />
            <Text style={styles.contactText}>{customer.email}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
            <Ionicons name="call-outline" size={18} color="#6B7280" />
            <Text style={styles.contactText}>{customer.phone}</Text>
          </TouchableOpacity>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <Text style={styles.contactText}>{customer.address}</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.contactText}>DOB: {formatDate(customer.date_of_birth)}</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="shield" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{customer.active_policies_count || 0}</Text>
          <Text style={styles.statLabel}>Active Policies</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="cash" size={20} color="#10B981" />
          </View>
          <Text style={styles.statValue}>\${(customer.total_coverage || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Coverage</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="wallet" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.statValue}>\${(customer.total_premium || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Monthly Premium</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.statValue}>{customer.pending_claims_count || 0}</Text>
          <Text style={styles.statLabel}>Pending Claims</Text>
        </View>
      </View>

      {/* Policies Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="shield-outline" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Policies</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewPolicy' as never, { customerId: id } as never)}
          >
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {customer.policies && customer.policies.length > 0 ? (
          customer.policies.map((policy) => {
            const statusColors = getStatusColor(policy.status);
            return (
              <TouchableOpacity
                key={policy.id}
                style={styles.listItem}
                onPress={() => navigation.navigate('PolicyDetail' as never, { id: policy.id } as never)}
              >
                <View style={styles.listItemIcon}>
                  <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{policy.policy_number}</Text>
                  <Text style={styles.listItemSubtitle}>{policy.type} Insurance</Text>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={styles.listItemAmount}>\${policy.premium}/mo</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors.bgColor }]}>
                    <Text style={[styles.statusText, { color: statusColors.color }]}>
                      {policy.status}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="shield-outline" size={40} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No policies found</Text>
          </View>
        )}
      </View>

      {/* Recent Claims Section */}
      <View style={[styles.sectionCard, { marginBottom: 24 }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="document-text-outline" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Recent Claims</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ClaimsList' as never, { customerId: id } as never)}
          >
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

        {customer.claims && customer.claims.length > 0 ? (
          customer.claims.slice(0, 5).map((claim) => {
            const statusColors = getStatusColor(claim.status);
            return (
              <TouchableOpacity
                key={claim.id}
                style={styles.listItem}
                onPress={() => navigation.navigate('ClaimDetail' as never, { id: claim.id } as never)}
              >
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>#{claim.claim_number}</Text>
                  <Text style={styles.listItemSubtitle}>{formatDate(claim.created_at)}</Text>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={styles.listItemAmount}>\${claim.amount_claimed?.toLocaleString()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors.bgColor }]}>
                    <Text style={[styles.statusText, { color: statusColors.color }]}>
                      {claim.status}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="document-text-outline" size={40} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No claims found</Text>
          </View>
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileCard: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: '#EDE9FE',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  customerNumber: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  listItemRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  listItemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySectionText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateDocumentList(options: CustomerOptions = {}): string {
  const { componentName = 'DocumentList', endpoint = '/documents' } = options;

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
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import * as DocumentPicker from 'expo-document-picker';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  url: string;
  uploaded_at: string;
  policy_number?: string;
  claim_number?: string;
}

interface ${componentName}Props {
  customerId?: string;
  policyId?: string;
  claimId?: string;
}

type CategoryFilter = 'all' | 'identity' | 'policy' | 'claim' | 'medical' | 'financial' | 'other';

const ${componentName}: React.FC<${componentName}Props> = ({ customerId, policyId, claimId }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['documents', customerId, policyId, claimId, category, searchTerm],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (customerId) params.append('customer_id', customerId);
      if (policyId) params.append('policy_id', policyId);
      if (claimId) params.append('claim_id', claimId);
      if (category !== 'all') params.append('category', category);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post('${endpoint}', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      Alert.alert('Success', 'Document uploaded successfully');
      setUploadModalVisible(false);
      setSelectedFile(null);
      setUploadCategory('');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to upload document');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => api.delete('${endpoint}/' + documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      Alert.alert('Success', 'Document deleted');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete document');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getFileIcon = (type: string): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    if (type.includes('image')) return { name: 'image', color: '#3B82F6' };
    if (type.includes('pdf')) return { name: 'document-text', color: '#EF4444' };
    if (type.includes('spreadsheet') || type.includes('excel')) return { name: 'grid', color: '#10B981' };
    return { name: 'document', color: '#6B7280' };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });

      if (!result.canceled) {
        setSelectedFile(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = () => {
    if (!selectedFile || selectedFile.canceled || !uploadCategory) return;

    const formData = new FormData();
    const file = selectedFile.assets[0];
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as any);
    formData.append('category', uploadCategory);
    if (customerId) formData.append('customer_id', customerId);
    if (policyId) formData.append('policy_id', policyId);
    if (claimId) formData.append('claim_id', claimId);

    uploadMutation.mutate(formData);
  };

  const handleDeleteDocument = (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(documentId) },
      ]
    );
  };

  const handleViewDocument = (url: string) => {
    Linking.openURL(url);
  };

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'identity', label: 'Identity' },
    { key: 'policy', label: 'Policy' },
    { key: 'claim', label: 'Claim' },
    { key: 'medical', label: 'Medical' },
    { key: 'financial', label: 'Financial' },
    { key: 'other', label: 'Other' },
  ];

  const renderDocument = useCallback(({ item }: { item: Document }) => {
    const fileIcon = getFileIcon(item.type);

    return (
      <View style={styles.documentItem}>
        <View style={[styles.documentIcon, { backgroundColor: fileIcon.color + '20' }]}>
          <Ionicons name={fileIcon.name} size={20} color={fileIcon.color} />
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.documentMeta}>
            <Text style={styles.documentSize}>{formatFileSize(item.size)}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.documentDate}>
              {new Date(item.uploaded_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.documentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewDocument(item.url)}
          >
            <Ionicons name="eye-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteDocument(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setUploadModalVisible(true)}
        >
          <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                category === item.key && styles.filterTabActive,
              ]}
              onPress={() => setCategory(item.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  category === item.key && styles.filterTabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Documents List */}
      <FlatList
        data={documents || []}
        renderItem={renderDocument}
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
            <Ionicons name="folder-open-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No documents</Text>
            <Text style={styles.emptySubtitle}>Upload your first document to get started</Text>
            <TouchableOpacity
              style={styles.emptyUploadButton}
              onPress={() => setUploadModalVisible(true)}
            >
              <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
              <Text style={styles.emptyUploadButtonText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Category Selection */}
            <Text style={styles.modalLabel}>Category *</Text>
            <View style={styles.modalCategoryGrid}>
              {categories.slice(1).map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.modalCategoryOption,
                    uploadCategory === cat.key && styles.modalCategoryOptionSelected,
                  ]}
                  onPress={() => setUploadCategory(cat.key)}
                >
                  <Text
                    style={[
                      styles.modalCategoryText,
                      uploadCategory === cat.key && styles.modalCategoryTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* File Picker */}
            <Text style={styles.modalLabel}>File *</Text>
            <TouchableOpacity style={styles.filePicker} onPress={handlePickDocument}>
              {selectedFile && !selectedFile.canceled ? (
                <View style={styles.selectedFileRow}>
                  <Ionicons name="document" size={24} color="#8B5CF6" />
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFile.assets[0].name}
                  </Text>
                </View>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.filePickerText}>Tap to select a file</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setUploadModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalUploadButton,
                  (!selectedFile || selectedFile.canceled || !uploadCategory) && styles.modalUploadButtonDisabled,
                ]}
                onPress={handleUpload}
                disabled={!selectedFile || selectedFile.canceled || !uploadCategory || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                    <Text style={styles.modalUploadText}>Upload</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  uploadButton: {
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
    paddingHorizontal: 14,
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
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  documentDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyUploadButtonText: {
    fontSize: 14,
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
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  modalCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  modalCategoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalCategoryOptionSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  modalCategoryText: {
    fontSize: 14,
    color: '#374151',
  },
  modalCategoryTextSelected: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  filePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  filePickerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  selectedFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  modalUploadButton: {
    flex: 2,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  modalUploadButtonDisabled: {
    opacity: 0.5,
  },
  modalUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
