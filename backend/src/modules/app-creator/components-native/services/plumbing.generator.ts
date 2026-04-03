/**
 * Plumbing Service Component Generators (React Native)
 *
 * Generates components for plumbing service management:
 * - PlumbingStats: Dashboard statistics
 * - CustomerDetailPlumbing: Customer profile with service history
 */

export interface PlumbingStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePlumbingStats(options: PlumbingStatsOptions = {}): string {
  const { componentName = 'PlumbingStats', endpoint = '/plumbing/stats' } = options;

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

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['plumbing-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
  });

  const statCards = [
    { key: 'todayCalls', label: "Today's Service Calls", icon: 'calendar', color: '#3B82F6' },
    { key: 'activeJobs', label: 'Active Jobs', icon: 'build', color: '#F59E0B' },
    { key: 'completedToday', label: 'Completed Today', icon: 'checkmark-circle', color: '#10B981' },
    { key: 'emergencyCalls', label: 'Emergency Calls', icon: 'warning', color: '#EF4444' },
    { key: 'residentialJobs', label: 'Residential Jobs', icon: 'home', color: '#6366F1' },
    { key: 'activeCustomers', label: 'Active Customers', icon: 'people', color: '#8B5CF6' },
    { key: 'revenueToday', label: "Today's Revenue", icon: 'cash', color: '#10B981', type: 'currency' },
    { key: 'avgJobDuration', label: 'Avg Job Duration', icon: 'time', color: '#F97316', suffix: ' hrs' },
  ];

  const formatValue = (value: any, type?: string, suffix?: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    return Number(value).toLocaleString() + (suffix || '');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statCards.map((stat) => (
          <View key={stat.key} style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.value}>
              {formatValue(stats?.[stat.key], stat.type, stat.suffix)}
            </Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    width: '50%',
    padding: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface CustomerDetailPlumbingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerDetailPlumbing(options: CustomerDetailPlumbingOptions = {}): string {
  const { componentName = 'CustomerDetailPlumbing', endpoint = '/plumbing/customers' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const customerId = propId || (route.params as any)?.id;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['plumbing-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: serviceHistory } = useQuery({
    queryKey: ['plumbing-customer-services', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/services\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const { data: activeIssues } = useQuery({
    queryKey: ['plumbing-customer-issues', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/issues\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const getServiceStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'in_progress':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'scheduled':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewServiceCall' as never, { customerId } as never)}
            style={styles.scheduleButton}
          >
            <Ionicons name="calendar" size={18} color="#3B82F6" />
            <Text style={styles.scheduleButtonText}>Schedule Service</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditCustomer' as never, { id: customerId } as never)}
            style={styles.editButton}
          >
            <Ionicons name="create" size={18} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer Info Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#3B82F6" />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{customer.name}</Text>
              {customer.priority_customer && (
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>Priority</Text>
                </View>
              )}
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{customer.phone || 'No phone'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{customer.email || 'No email'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{customer.address || 'No address'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="home" size={16} color="#6B7280" />
              <Text style={styles.contactText}>
                {customer.property_type || 'Residential'} | {customer.property_age || 'Unknown'} yrs old
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.total_service_calls || 0}</Text>
            <Text style={styles.statLabel}>Service Calls</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeIssues?.length || 0}</Text>
            <Text style={styles.statLabel}>Active Issues</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              \${(customer.total_spent || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {customer.last_service ? new Date(customer.last_service).toLocaleDateString() : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Last Service</Text>
          </View>
        </View>
      </View>

      {/* Active Issues */}
      {activeIssues && activeIssues.length > 0 && (
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.alertTitle}>Active Issues</Text>
          </View>
          {activeIssues.map((issue: any) => {
            const statusStyle = getServiceStatusStyle(issue.status);
            return (
              <View key={issue.id} style={styles.issueItem}>
                <View style={styles.issueInfo}>
                  <Text style={styles.issueType}>{issue.issue_type || issue.description}</Text>
                  <Text style={styles.issueDate}>
                    Reported: {new Date(issue.reported_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {issue.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Property Details */}
      {customer.property_details && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.propertyGrid}>
            {customer.property_details.bathrooms && (
              <View style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>Bathrooms</Text>
                <Text style={styles.propertyValue}>{customer.property_details.bathrooms}</Text>
              </View>
            )}
            {customer.property_details.water_heater_type && (
              <View style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>Water Heater</Text>
                <Text style={styles.propertyValue}>{customer.property_details.water_heater_type}</Text>
              </View>
            )}
            {customer.property_details.pipe_material && (
              <View style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>Pipe Material</Text>
                <Text style={styles.propertyValue}>{customer.property_details.pipe_material}</Text>
              </View>
            )}
            {customer.property_details.sewer_type && (
              <View style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>Sewer Type</Text>
                <Text style={styles.propertyValue}>{customer.property_details.sewer_type}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Service History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Service History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {serviceHistory && serviceHistory.length > 0 ? (
          serviceHistory.slice(0, 5).map((service: any) => {
            const statusStyle = getServiceStatusStyle(service.status);
            return (
              <View key={service.id} style={styles.serviceItem}>
                <View style={[
                  styles.serviceIcon,
                  { backgroundColor: service.status === 'completed' ? '#D1FAE5' : '#DBEAFE' }
                ]}>
                  {service.status === 'completed' ? (
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  ) : (
                    <Ionicons name="water" size={20} color="#3B82F6" />
                  )}
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceType}>{service.service_type}</Text>
                  <Text style={styles.serviceDate}>
                    {new Date(service.date).toLocaleDateString()}
                  </Text>
                  {service.technician && (
                    <Text style={styles.serviceTech}>Tech: {service.technician}</Text>
                  )}
                  {service.notes && (
                    <Text style={styles.serviceNotes} numberOfLines={1}>{service.notes}</Text>
                  )}
                </View>
                <View style={styles.serviceRight}>
                  <Text style={styles.serviceCost}>\${(service.cost || 0).toLocaleString()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {service.status}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="time" size={48} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No service history</Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {customer.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{customer.notes}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 6,
  },
  scheduleButtonText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  priorityBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#92400E',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#FFFBEB',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  issueInfo: {
    flex: 1,
  },
  issueType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  issueDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  propertyItem: {
    width: '50%',
    marginBottom: 12,
  },
  propertyLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  propertyValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginTop: 2,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  serviceDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  serviceTech: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  serviceNotes: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  serviceRight: {
    alignItems: 'flex-end',
  },
  serviceCost: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
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
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default ${componentName};
`;
}
