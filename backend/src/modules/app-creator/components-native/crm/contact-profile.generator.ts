/**
 * Contact/Company Profile Component Generators (React Native)
 *
 * Generates profile cards and detail views for contacts, companies, and deals.
 * Features: Contact detail with actions, company info card, deal cards with value/stage.
 */

export interface ContactProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateContactProfile(options: ContactProfileOptions = {}): string {
  const { componentName = 'ContactProfile', endpoint = '/contacts' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  contactId?: string;
  onEdit?: (contact: any) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ contactId: propId, onEdit, onBack }) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const contactId = propId || route.params?.id;

  const { data: contact, isLoading, refetch } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + contactId);
      return response?.data || response;
    },
    enabled: !!contactId,
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
    if (onEdit && contact) {
      onEdit(contact);
    } else {
      navigation.navigate('ContactEdit', { id: contactId });
    }
  };

  const handleCall = () => {
    if (contact?.phone) {
      Linking.openURL('tel:' + contact.phone);
    }
  };

  const handleEmail = () => {
    if (contact?.email) {
      Linking.openURL('mailto:' + contact.email);
    }
  };

  const handleSMS = () => {
    if (contact?.phone) {
      Linking.openURL('sms:' + contact.phone);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      active: { bg: '#DCFCE7', text: '#15803D' },
      inactive: { bg: '#F3F4F6', text: '#4B5563' },
      lead: { bg: '#FEF9C3', text: '#A16207' },
      customer: { bg: '#DBEAFE', text: '#1D4ED8' },
    };
    return colors[status?.toLowerCase()] || { bg: '#F3F4F6', text: '#4B5563' };
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!contact) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Contact not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fullName = contact.name || \`\${contact.first_name || ''} \${contact.last_name || ''}\`.trim() || 'Unknown';
  const statusColors = getStatusColor(contact.status);

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
        <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#3B82F6" />
          <Text style={styles.headerEditText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {contact.avatar_url ? (
            <Image source={{ uri: contact.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(fullName)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{fullName}</Text>
        {contact.title && <Text style={styles.title}>{contact.title}</Text>}
        {contact.company_name && (
          <View style={styles.companyRow}>
            <Ionicons name="business-outline" size={14} color="#6B7280" />
            <Text style={styles.companyName}>{contact.company_name}</Text>
          </View>
        )}
        {contact.status && (
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {contact.status}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, !contact.phone && styles.actionButtonDisabled]}
          onPress={handleCall}
          disabled={!contact.phone}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="call" size={20} color="#15803D" />
          </View>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, !contact.email && styles.actionButtonDisabled]}
          onPress={handleEmail}
          disabled={!contact.email}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="mail" size={20} color="#1D4ED8" />
          </View>
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, !contact.phone && styles.actionButtonDisabled]}
          onPress={handleSMS}
          disabled={!contact.phone}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="chatbubble" size={20} color="#B45309" />
          </View>
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        {contact.email && (
          <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{contact.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {contact.phone && (
          <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
            <View style={styles.infoIcon}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{contact.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {(contact.address || contact.city || contact.country) && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {[contact.address, contact.city, contact.country].filter(Boolean).join(', ')}
              </Text>
            </View>
          </View>
        )}
      </View>

      {contact.created_at && (
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
            <Text style={styles.metaText}>
              Added {new Date(contact.created_at).toLocaleDateString()}
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
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  companyName: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
  metaSection: {
    padding: 16,
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 6,
  },
});

export default ${componentName};
`;
}

export interface CompanyProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCompanyProfile(options: CompanyProfileOptions = {}): string {
  const { componentName = 'CompanyProfile', endpoint = '/companies' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  companyId?: string;
  onEdit?: (company: any) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ companyId: propId, onEdit, onBack }) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const companyId = propId || route.params?.id;

  const { data: company, isLoading, refetch } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + companyId);
      return response?.data || response;
    },
    enabled: !!companyId,
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
    if (onEdit && company) {
      onEdit(company);
    } else {
      navigation.navigate('CompanyEdit', { id: companyId });
    }
  };

  const handleWebsite = () => {
    if (company?.website) {
      const url = company.website.startsWith('http')
        ? company.website
        : 'https://' + company.website;
      Linking.openURL(url);
    }
  };

  const handlePhone = () => {
    if (company?.phone) {
      Linking.openURL('tel:' + company.phone);
    }
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) {
      return '$' + (value / 1000000000).toFixed(1) + 'B';
    }
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return '$' + (value / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toLocaleString();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="business-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Company not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#3B82F6" />
          <Text style={styles.headerEditText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.logoContainer}>
          {company.logo_url ? (
            <Image source={{ uri: company.logo_url }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoInitial}>
                {(company.name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{company.name}</Text>
        {company.industry && (
          <View style={styles.industryBadge}>
            <Text style={styles.industryText}>{company.industry}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsSection}>
        {company.employees && (
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={20} color="#6B7280" />
            <Text style={styles.statValue}>{company.employees.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Employees</Text>
          </View>
        )}
        {company.revenue && (
          <View style={styles.statItem}>
            <Ionicons name="cash-outline" size={20} color="#6B7280" />
            <Text style={styles.statValue}>{formatCurrency(company.revenue)}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        )}
        {company.deals_count !== undefined && (
          <View style={styles.statItem}>
            <Ionicons name="briefcase-outline" size={20} color="#6B7280" />
            <Text style={styles.statValue}>{company.deals_count}</Text>
            <Text style={styles.statLabel}>Deals</Text>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Company Information</Text>

        {company.website && (
          <TouchableOpacity style={styles.infoRow} onPress={handleWebsite}>
            <View style={styles.infoIcon}>
              <Ionicons name="globe-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Website</Text>
              <Text style={styles.infoValueLink}>{company.website}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#3B82F6" />
          </TouchableOpacity>
        )}

        {company.phone && (
          <TouchableOpacity style={styles.infoRow} onPress={handlePhone}>
            <View style={styles.infoIcon}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{company.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {(company.address || company.city || company.country) && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {[company.address, company.city, company.country].filter(Boolean).join(', ')}
              </Text>
            </View>
          </View>
        )}
      </View>

      {company.description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>{company.description}</Text>
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  industryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  industryText: {
    fontSize: 13,
    color: '#4B5563',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
  infoValueLink: {
    fontSize: 15,
    color: '#3B82F6',
  },
  descriptionSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingBottom: 16,
  },
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});

export default ${componentName};
`;
}

export interface DealCardOptions {
  componentName?: string;
}

export function generateDealCard(options: DealCardOptions = {}): string {
  const componentName = options.componentName || 'DealCard';

  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Deal {
  id: string;
  name?: string;
  title?: string;
  value?: number;
  stage?: string;
  status?: string;
  contact_name?: string;
  company_name?: string;
  expected_close_date?: string;
  created_at?: string;
  probability?: number;
}

interface ${componentName}Props {
  deal: Deal;
  onPress?: () => void;
  onLongPress?: () => void;
  compact?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  deal,
  onPress,
  onLongPress,
  compact = false,
}) => {
  const getStageColor = (stage: string): { bg: string; text: string; border: string } => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      lead: { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
      qualified: { bg: '#DBEAFE', text: '#1D4ED8', border: '#3B82F6' },
      proposal: { bg: '#FEF9C3', text: '#A16207', border: '#F59E0B' },
      negotiation: { bg: '#FFEDD5', text: '#C2410C', border: '#F97316' },
      closed: { bg: '#DCFCE7', text: '#15803D', border: '#22C55E' },
      won: { bg: '#DCFCE7', text: '#15803D', border: '#22C55E' },
      lost: { bg: '#FEE2E2', text: '#DC2626', border: '#EF4444' },
    };
    return colors[stage?.toLowerCase()] || colors.lead;
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return '$' + (value / 1000).toFixed(0) + 'K';
    }
    return '$' + value.toLocaleString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return Math.abs(diffDays) + 'd overdue';
    }
    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Tomorrow';
    }
    if (diffDays <= 7) {
      return diffDays + ' days';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stage = deal.stage || deal.status || 'lead';
  const stageColors = getStageColor(stage);

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <View style={[styles.compactStageIndicator, { backgroundColor: stageColors.border }]} />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {deal.name || deal.title}
          </Text>
          {deal.value !== undefined && (
            <Text style={styles.compactValue}>{formatCurrency(deal.value)}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.dealTitle} numberOfLines={2}>
          {deal.name || deal.title}
        </Text>
        <View style={[styles.stageBadge, { backgroundColor: stageColors.bg }]}>
          <Text style={[styles.stageText, { color: stageColors.text }]}>
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </Text>
        </View>
      </View>

      {deal.value !== undefined && deal.value > 0 && (
        <View style={styles.valueRow}>
          <Ionicons name="cash-outline" size={16} color="#059669" />
          <Text style={styles.valueText}>{formatCurrency(deal.value)}</Text>
          {deal.probability !== undefined && (
            <Text style={styles.probabilityText}>({deal.probability}%)</Text>
          )}
        </View>
      )}

      <View style={styles.metaContainer}>
        {deal.contact_name && (
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>{deal.contact_name}</Text>
          </View>
        )}

        {deal.company_name && (
          <View style={styles.metaRow}>
            <Ionicons name="business-outline" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>{deal.company_name}</Text>
          </View>
        )}

        {deal.expected_close_date && (
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>
              Close: {formatDate(deal.expected_close_date)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 6,
  },
  probabilityText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  metaContainer: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  compactStageIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  compactValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}
