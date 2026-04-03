/**
 * Client Profile Component Generators (React Native)
 *
 * Generates client profile components for legal and law firm applications.
 */

export interface ClientOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateClientProfileLawfirm(options: ClientOptions = {}): string {
  const { componentName = 'ClientProfileLawfirm', endpoint = '/lawfirm/clients' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface PrimaryContact {
  name: string;
  title?: string;
  email: string;
  phone?: string;
}

interface LawfirmClient {
  id: string;
  name: string;
  client_type: 'individual' | 'business';
  email: string;
  phone?: string;
  avatar_url?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  primary_contact?: PrimaryContact;
  responsible_attorney?: string;
  attorney_name?: string;
  client_since?: string;
  status: 'active' | 'inactive' | 'prospect';
  billing_status?: 'current' | 'overdue' | 'hold';
  trust_balance?: number;
  outstanding_balance?: number;
  total_billed?: number;
  total_paid?: number;
  active_cases: number;
  total_cases: number;
  notes?: string;
  tags?: string[];
  conflict_check_status?: 'cleared' | 'pending' | 'conflict';
  created_at: string;
}

interface ${componentName}Props {
  clientId?: string;
  showEdit?: boolean;
  onEdit?: (client: LawfirmClient) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  clientId: propId,
  showEdit = true,
  onEdit,
  onBack,
}) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const clientId = propId || route.params?.id;

  const { data: client, isLoading, refetch } = useQuery({
    queryKey: ['lawfirm-client', clientId],
    queryFn: async () => {
      const response = await api.get<LawfirmClient>('${endpoint}/' + clientId);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (onEdit && client) {
      onEdit(client);
    } else {
      navigation.navigate('ClientEdit', { id: clientId });
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL('tel:' + phone);
    }
  };

  const handleEmail = (email?: string) => {
    if (email) {
      Linking.openURL('mailto:' + email);
    }
  };

  const getStatusColor = (status: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      active: { bg: '#DCFCE7', text: '#15803D' },
      inactive: { bg: '#F3F4F6', text: '#4B5563' },
      prospect: { bg: '#DBEAFE', text: '#1D4ED8' },
    };
    return colors[status] || { bg: '#F3F4F6', text: '#4B5563' };
  };

  const getBillingStatusColor = (status?: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      current: { bg: '#DCFCE7', text: '#15803D' },
      overdue: { bg: '#FEE2E2', text: '#DC2626' },
      hold: { bg: '#FEF9C3', text: '#A16207' },
    };
    return colors[status || ''] || { bg: '#F3F4F6', text: '#4B5563' };
  };

  const getConflictStatusIcon = (status?: string) => {
    switch (status) {
      case 'cleared':
        return { name: 'checkmark-circle', color: '#15803D' };
      case 'pending':
        return { name: 'time', color: '#F59E0B' };
      case 'conflict':
        return { name: 'alert-circle', color: '#EF4444' };
      default:
        return null;
    }
  };

  const formatCurrency = (value: number): string => {
    return '$' + value.toLocaleString();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Client not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColors = getStatusColor(client.status);
  const billingColors = getBillingStatusColor(client.billing_status);
  const conflictIcon = getConflictStatusIcon(client.conflict_check_status);
  const fullAddress = [client.address, client.city, client.state, client.zip_code, client.country]
    .filter(Boolean)
    .join(', ');

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        {showEdit && (
          <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
            <Text style={styles.headerEditText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {client.avatar_url ? (
            <Image source={{ uri: client.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              {client.client_type === 'business' ? (
                <Ionicons name="business" size={40} color="#FFFFFF" />
              ) : (
                <Text style={styles.avatarInitials}>
                  {client.name?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {client.status.toUpperCase()}
            </Text>
          </View>
          {client.billing_status && (
            <View style={[styles.statusBadge, { backgroundColor: billingColors.bg }]}>
              <Text style={[styles.statusText, { color: billingColors.text }]}>
                Billing: {client.billing_status}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{client.name}</Text>

        {client.company_name && (
          <View style={styles.companyRow}>
            <Ionicons name="business-outline" size={16} color="#6B7280" />
            <Text style={styles.companyName}>{client.company_name}</Text>
          </View>
        )}

        <Text style={styles.clientType}>{client.client_type} Client</Text>

        {conflictIcon && (
          <View style={styles.conflictRow}>
            <Ionicons name={conflictIcon.name as any} size={16} color={conflictIcon.color} />
            <Text style={[styles.conflictText, { color: conflictIcon.color }]}>
              Conflict: {client.conflict_check_status}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, !client.phone && styles.actionButtonDisabled]}
          onPress={() => handleCall(client.phone)}
          disabled={!client.phone}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="call" size={20} color="#15803D" />
          </View>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, !client.email && styles.actionButtonDisabled]}
          onPress={() => handleEmail(client.email)}
          disabled={!client.email}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="mail" size={20} color="#1D4ED8" />
          </View>
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('NewCase', { clientId })}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="briefcase" size={20} color="#7C3AED" />
          </View>
          <Text style={styles.actionText}>New Case</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{client.active_cases}</Text>
          <Text style={styles.statLabel}>Active Cases</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{client.total_cases}</Text>
          <Text style={styles.statLabel}>Total Cases</Text>
        </View>
        {client.trust_balance !== undefined && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {formatCurrency(client.trust_balance)}
              </Text>
              <Text style={styles.statLabel}>Trust</Text>
            </View>
          </>
        )}
        {client.outstanding_balance !== undefined && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  { color: client.outstanding_balance > 0 ? '#EF4444' : '#111827' },
                ]}
              >
                {formatCurrency(client.outstanding_balance)}
              </Text>
              <Text style={styles.statLabel}>Outstanding</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        {client.email && (
          <TouchableOpacity style={styles.infoRow} onPress={() => handleEmail(client.email)}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{client.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {client.phone && (
          <TouchableOpacity style={styles.infoRow} onPress={() => handleCall(client.phone)}>
            <View style={styles.infoIcon}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{client.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {fullAddress && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{fullAddress}</Text>
            </View>
          </View>
        )}

        {client.client_since && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Client Since</Text>
              <Text style={styles.infoValue}>
                {new Date(client.client_since).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </View>

      {client.primary_contact && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Primary Contact</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactName}>{client.primary_contact.name}</Text>
            {client.primary_contact.title && (
              <Text style={styles.contactTitle}>{client.primary_contact.title}</Text>
            )}
            <TouchableOpacity
              style={styles.contactAction}
              onPress={() => handleEmail(client.primary_contact?.email)}
            >
              <Ionicons name="mail-outline" size={16} color="#3B82F6" />
              <Text style={styles.contactActionText}>{client.primary_contact.email}</Text>
            </TouchableOpacity>
            {client.primary_contact.phone && (
              <TouchableOpacity
                style={styles.contactAction}
                onPress={() => handleCall(client.primary_contact?.phone)}
              >
                <Ionicons name="call-outline" size={16} color="#3B82F6" />
                <Text style={styles.contactActionText}>{client.primary_contact.phone}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {client.attorney_name && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Responsible Attorney</Text>
          <TouchableOpacity
            style={styles.attorneyCard}
            onPress={() => navigation.navigate('AttorneyDetail', { id: client.responsible_attorney })}
          >
            <View style={styles.attorneyAvatar}>
              <Ionicons name="person" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.attorneyName}>{client.attorney_name}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Billing Summary</Text>
        <View style={styles.billingGrid}>
          <View style={styles.billingItem}>
            <Text style={styles.billingLabel}>Total Billed</Text>
            <Text style={styles.billingValue}>
              {formatCurrency(client.total_billed || 0)}
            </Text>
          </View>
          <View style={styles.billingItem}>
            <Text style={styles.billingLabel}>Total Paid</Text>
            <Text style={[styles.billingValue, { color: '#10B981' }]}>
              {formatCurrency(client.total_paid || 0)}
            </Text>
          </View>
          <View style={[styles.billingItem, styles.billingItemFull]}>
            <Text style={styles.billingLabel}>Outstanding Balance</Text>
            <Text
              style={[
                styles.billingValue,
                { color: (client.outstanding_balance || 0) > 0 ? '#EF4444' : '#111827' },
              ]}
            >
              {formatCurrency(client.outstanding_balance || 0)}
            </Text>
          </View>
        </View>
      </View>

      {client.tags && client.tags.length > 0 && (
        <View style={styles.tagsSection}>
          {client.tags.map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {client.notes && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{client.notes}</Text>
        </View>
      )}

      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('NewCase', { clientId })}
          >
            <Ionicons name="briefcase-outline" size={20} color="#3B82F6" />
            <Text style={styles.quickActionText}>New Case</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('NewInvoice', { clientId })}
          >
            <Ionicons name="receipt-outline" size={20} color="#10B981" />
            <Text style={styles.quickActionText}>New Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('ClientDocuments', { clientId })}
          >
            <Ionicons name="document-text-outline" size={20} color="#6B7280" />
            <Text style={styles.quickActionText}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('ClientCases', { clientId })}
          >
            <Ionicons name="folder-outline" size={20} color="#6B7280" />
            <Text style={styles.quickActionText}>View Cases</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 4,
  },
  headerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  headerEditText: {
    marginLeft: 4,
    color: '#3B82F6',
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  companyName: {
    fontSize: 16,
    color: '#6B7280',
  },
  clientType: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  conflictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 6,
  },
  conflictText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 40,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
  },
  contactCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contactTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  contactAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  contactActionText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  attorneyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  attorneyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attorneyName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  billingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  billingItem: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  billingItemFull: {
    width: '100%',
  },
  billingLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  billingValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#4B5563',
  },
  notesText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  quickActionsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickAction: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default ${componentName};
`;
}

export function generateClientProfileLegal(options: ClientOptions = {}): string {
  const { componentName = 'ClientProfileLegal', endpoint = '/clients' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface LegalClient {
  id: string;
  name: string;
  client_type: 'individual' | 'business';
  email: string;
  phone?: string;
  avatar_url?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string;
  emergency_contact?: EmergencyContact;
  preferred_language?: string;
  communication_preference?: 'email' | 'phone' | 'mail';
  active_cases: number;
  total_cases: number;
  notes?: string;
  created_at: string;
}

interface ${componentName}Props {
  clientId?: string;
  showEdit?: boolean;
  onEdit?: (client: LegalClient) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  clientId: propId,
  showEdit = true,
  onEdit,
  onBack,
}) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const clientId = propId || route.params?.id;

  const { data: client, isLoading, refetch } = useQuery({
    queryKey: ['legal-client', clientId],
    queryFn: async () => {
      const response = await api.get<LegalClient>('${endpoint}/' + clientId);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (onEdit && client) {
      onEdit(client);
    } else {
      navigation.navigate('ClientEdit', { id: clientId });
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL('tel:' + phone);
    }
  };

  const handleEmail = (email?: string) => {
    if (email) {
      Linking.openURL('mailto:' + email);
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Client not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fullAddress = [client.address, client.city, client.state, client.zip_code]
    .filter(Boolean)
    .join(', ');

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        {showEdit && (
          <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
            <Text style={styles.headerEditText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {client.avatar_url ? (
            <Image source={{ uri: client.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              {client.client_type === 'business' ? (
                <Ionicons name="business" size={32} color="#FFFFFF" />
              ) : (
                <Text style={styles.avatarInitials}>
                  {client.name?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          )}
        </View>

        <Text style={styles.name}>{client.name}</Text>

        {client.company_name && (
          <View style={styles.companyRow}>
            <Ionicons name="business-outline" size={16} color="#6B7280" />
            <Text style={styles.companyName}>{client.company_name}</Text>
          </View>
        )}

        <Text style={styles.clientType}>{client.client_type} Client</Text>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, !client.phone && styles.actionButtonDisabled]}
          onPress={() => handleCall(client.phone)}
          disabled={!client.phone}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="call" size={20} color="#15803D" />
          </View>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, !client.email && styles.actionButtonDisabled]}
          onPress={() => handleEmail(client.email)}
          disabled={!client.email}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="mail" size={20} color="#1D4ED8" />
          </View>
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{client.active_cases}</Text>
          <Text style={styles.statLabel}>Active Cases</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{client.total_cases}</Text>
          <Text style={styles.statLabel}>Total Cases</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        {client.email && (
          <TouchableOpacity style={styles.infoRow} onPress={() => handleEmail(client.email)}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{client.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {client.phone && (
          <TouchableOpacity style={styles.infoRow} onPress={() => handleCall(client.phone)}>
            <View style={styles.infoIcon}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{client.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {fullAddress && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{fullAddress}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        {client.date_of_birth && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {new Date(client.date_of_birth).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {client.preferred_language && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="language-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Preferred Language</Text>
              <Text style={styles.infoValue}>{client.preferred_language}</Text>
            </View>
          </View>
        )}

        {client.communication_preference && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Communication Preference</Text>
              <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
                {client.communication_preference}
              </Text>
            </View>
          </View>
        )}
      </View>

      {client.emergency_contact && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyName}>{client.emergency_contact.name}</Text>
            <Text style={styles.emergencyRelation}>{client.emergency_contact.relationship}</Text>
            <TouchableOpacity
              style={styles.emergencyAction}
              onPress={() => handleCall(client.emergency_contact?.phone)}
            >
              <Ionicons name="call-outline" size={16} color="#3B82F6" />
              <Text style={styles.emergencyPhone}>{client.emergency_contact.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionPrimary}
            onPress={() => navigation.navigate('NewCase', { clientId })}
          >
            <Ionicons name="briefcase" size={20} color="#FFFFFF" />
            <Text style={styles.quickActionPrimaryText}>Open New Case</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionSecondary}
            onPress={() => navigation.navigate('ClientCases', { clientId })}
          >
            <Ionicons name="folder-outline" size={20} color="#374151" />
            <Text style={styles.quickActionSecondaryText}>View Cases</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionSecondary}
            onPress={() => navigation.navigate('ClientDocuments', { clientId })}
          >
            <Ionicons name="document-text-outline" size={20} color="#374151" />
            <Text style={styles.quickActionSecondaryText}>Documents</Text>
          </TouchableOpacity>
        </View>
      </View>

      {client.notes && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{client.notes}</Text>
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 4,
  },
  headerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  headerEditText: {
    marginLeft: 4,
    color: '#3B82F6',
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  companyName: {
    fontSize: 16,
    color: '#6B7280',
  },
  clientType: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 40,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
  },
  emergencyCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emergencyRelation: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  emergencyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  emergencyPhone: {
    fontSize: 14,
    color: '#3B82F6',
  },
  quickActionsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingBottom: 16,
  },
  quickActionsRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    gap: 10,
  },
  quickActionPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    gap: 10,
  },
  quickActionSecondaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  notesText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default ${componentName};
`;
}
