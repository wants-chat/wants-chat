/**
 * Recruitment Client Component Generators (React Native)
 *
 * Generates components for client/company profile management
 * in recruitment agency applications.
 */

export interface ClientRecruitmentOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate ClientProfileRecruitment component (React Native)
 * Detailed client profile view with company info, contacts, and placement history
 */
export function generateClientProfileRecruitment(options: ClientRecruitmentOptions = {}): string {
  const { componentName = 'ClientProfileRecruitment', endpoint = '/recruitment/clients' } = options;

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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  clientId: string;
  onAddJob?: () => void;
  onAddContact?: () => void;
  onAddNote?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  clientId,
  onAddJob,
  onAddContact,
  onAddNote,
}) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'contacts' | 'placements' | 'notes'>('overview');

  const { data: client, isLoading, refetch } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}\`);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => api.put(\`${endpoint}/\${clientId}/favorite\`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    active: { color: '#10B981', bg: '#D1FAE5', label: 'Active Client' },
    prospect: { color: '#3B82F6', bg: '#DBEAFE', label: 'Prospect' },
    inactive: { color: '#6B7280', bg: '#F3F4F6', label: 'Inactive' },
    churned: { color: '#EF4444', bg: '#FEE2E2', label: 'Churned' },
  };

  const openWebsite = (url: string) => {
    if (url) {
      Linking.openURL(url.startsWith('http') ? url : \`https://\${url}\`);
    }
  };

  const openEmail = (email: string) => {
    if (email) {
      Linking.openURL(\`mailto:\${email}\`);
    }
  };

  const openPhone = (phone: string) => {
    if (phone) {
      Linking.openURL(\`tel:\${phone}\`);
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
      <View style={styles.emptyContainer}>
        <Ionicons name="business-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Client not found</Text>
      </View>
    );
  }

  const status = statusConfig[client.status] || statusConfig.active;
  const contacts = client.contacts || [];

  const stats = [
    { label: 'Active Jobs', value: client.active_jobs_count || 0, icon: 'briefcase', color: '#3B82F6' },
    { label: 'Placements', value: client.placements_count || 0, icon: 'checkmark-circle', color: '#10B981' },
    { label: 'In Pipeline', value: client.pipeline_count || 0, icon: 'time', color: '#F59E0B' },
    { label: 'Revenue', value: '$' + ((client.total_revenue || 0) / 1000).toFixed(0) + 'k', icon: 'cash', color: '#10B981' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'jobs', label: 'Jobs', count: client.active_jobs_count },
    { id: 'contacts', label: 'Contacts', count: contacts.length },
    { id: 'placements', label: 'Placements', count: client.placements_count },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGradient} />
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavoriteMutation.mutate()}
            >
              <Ionicons
                name={client.is_favorite ? 'star' : 'star-outline'}
                size={22}
                color={client.is_favorite ? '#F59E0B' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.logoContainer}>
            {client.logo ? (
              <Image source={{ uri: client.logo }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="business" size={32} color="#6B7280" />
              </View>
            )}
          </View>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.clientIndustry}>{client.industry}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </View>

      {/* Meta Info */}
      <View style={styles.metaSection}>
        {client.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{client.location}</Text>
          </View>
        )}
        {client.website && (
          <TouchableOpacity style={styles.metaItem} onPress={() => openWebsite(client.website)}>
            <Ionicons name="globe-outline" size={16} color="#3B82F6" />
            <Text style={[styles.metaText, styles.metaLink]}>Website</Text>
          </TouchableOpacity>
        )}
        {client.company_size && (
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{client.company_size} employees</Text>
          </View>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onAddJob}>
          <Ionicons name="briefcase-outline" size={18} color="#3B82F6" />
          <Text style={styles.actionText}>Add Job</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onAddContact}>
          <Ionicons name="person-add-outline" size={18} color="#3B82F6" />
          <Text style={styles.actionText}>Add Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onAddNote}>
          <Ionicons name="document-text-outline" size={18} color="#3B82F6" />
          <Text style={styles.actionText}>Add Note</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.count !== undefined && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'overview' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>
                {client.description || 'No description available.'}
              </Text>
              {client.specializations && client.specializations.length > 0 && (
                <View style={styles.tagsContainer}>
                  {client.specializations.map((spec: string, i: number) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>{spec}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contract Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fee Structure</Text>
                <Text style={styles.detailValue}>{client.fee_structure || 'Standard'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fee Percentage</Text>
                <Text style={styles.detailValue}>{client.fee_percentage || 20}%</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Terms</Text>
                <Text style={styles.detailValue}>{client.payment_terms || 'Net 30'}</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === 'jobs' && (
          <View style={styles.section}>
            {(client.jobs || []).length > 0 ? (
              (client.jobs || []).map((job: any) => (
                <View key={job.id} style={styles.listCard}>
                  <View style={styles.listCardIcon}>
                    <Ionicons name="briefcase" size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.listCardContent}>
                    <Text style={styles.listCardTitle}>{job.title}</Text>
                    <Text style={styles.listCardSubtitle}>
                      {job.location} - {job.type}
                    </Text>
                  </View>
                  <View style={styles.listCardMeta}>
                    <Text style={styles.listCardCount}>{job.applicants_count || 0}</Text>
                    <Text style={styles.listCardCountLabel}>applicants</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Ionicons name="briefcase-outline" size={40} color="#D1D5DB" />
                <Text style={styles.emptySectionText}>No active jobs</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'contacts' && (
          <View style={styles.section}>
            {contacts.length > 0 ? (
              contacts.map((contact: any) => (
                <View key={contact.id} style={styles.contactCard}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>
                      {contact.name?.charAt(0) || 'C'}
                    </Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <View style={styles.contactNameRow}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      {contact.is_primary && (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>Primary</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.contactTitle}>{contact.title}</Text>
                    <View style={styles.contactActions}>
                      {contact.email && (
                        <TouchableOpacity
                          style={styles.contactAction}
                          onPress={() => openEmail(contact.email)}
                        >
                          <Ionicons name="mail-outline" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                      )}
                      {contact.phone && (
                        <TouchableOpacity
                          style={styles.contactAction}
                          onPress={() => openPhone(contact.phone)}
                        >
                          <Ionicons name="call-outline" size={16} color="#10B981" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Ionicons name="people-outline" size={40} color="#D1D5DB" />
                <Text style={styles.emptySectionText}>No contacts added</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'placements' && (
          <View style={styles.section}>
            {(client.placements || []).length > 0 ? (
              (client.placements || []).map((placement: any) => (
                <View key={placement.id} style={styles.listCard}>
                  <View style={[styles.listCardIcon, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="ribbon" size={20} color="#10B981" />
                  </View>
                  <View style={styles.listCardContent}>
                    <Text style={styles.listCardTitle}>{placement.candidate_name}</Text>
                    <Text style={styles.listCardSubtitle}>{placement.position}</Text>
                  </View>
                  <View style={styles.listCardMeta}>
                    <Text style={[styles.listCardCount, { color: '#10B981' }]}>
                      {'$'}{((placement.fee || 0) / 1000).toFixed(0)}k
                    </Text>
                    <Text style={styles.listCardCountLabel}>{placement.date}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Ionicons name="ribbon-outline" size={40} color="#D1D5DB" />
                <Text style={styles.emptySectionText}>No placements yet</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'notes' && (
          <View style={styles.section}>
            {(client.notes || []).length > 0 ? (
              (client.notes || []).map((note: any) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteAuthor}>{note.author}</Text>
                    <Text style={styles.noteDate}>{note.date}</Text>
                  </View>
                  <Text style={styles.noteContent}>{note.content}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Ionicons name="document-text-outline" size={40} color="#D1D5DB" />
                <Text style={styles.emptySectionText}>No notes yet</Text>
              </View>
            )}
          </View>
        )}
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  headerGradient: {
    height: 100,
    backgroundColor: '#3B82F6',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: -50,
  },
  headerTop: {
    position: 'absolute',
    top: -60,
    right: 16,
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  clientName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  clientIndustry: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  metaLink: {
    color: '#3B82F6',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  statCard: {
    width: '25%',
    alignItems: 'center',
    padding: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 6,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  tabBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listCardContent: {
    flex: 1,
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  listCardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  listCardMeta: {
    alignItems: 'flex-end',
  },
  listCardCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  listCardCountLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  primaryBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3B82F6',
  },
  contactTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  contactAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  noteDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noteContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySectionText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});

export default ${componentName};
`;
}
