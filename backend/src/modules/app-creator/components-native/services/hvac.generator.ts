/**
 * HVAC Service Component Generators (React Native)
 *
 * Generates components for HVAC service management:
 * - HvacStats: Dashboard statistics
 * - CustomerDetailHvac: Customer profile with equipment
 * - CustomerEquipmentHvac: Customer's HVAC equipment list
 * - ServiceCallListTodayPlumbing: Today's service calls (shared with plumbing)
 */

export interface HvacStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateHvacStats(options: HvacStatsOptions = {}): string {
  const { componentName = 'HvacStats', endpoint = '/hvac/stats' } = options;

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
    queryKey: ['hvac-stats'],
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
    { key: 'installationsScheduled', label: 'Installations Scheduled', icon: 'snow', color: '#6366F1' },
    { key: 'maintenanceContracts', label: 'Active Contracts', icon: 'people', color: '#8B5CF6' },
    { key: 'revenueToday', label: "Today's Revenue", icon: 'cash', color: '#10B981', type: 'currency' },
    { key: 'avgResponseTime', label: 'Avg Response Time', icon: 'time', color: '#F97316', suffix: ' min' },
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

export interface CustomerDetailHvacOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerDetailHvac(options: CustomerDetailHvacOptions = {}): string {
  const { componentName = 'CustomerDetailHvac', endpoint = '/hvac/customers' } = options;

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
    queryKey: ['hvac-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: equipment } = useQuery({
    queryKey: ['customer-equipment', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/equipment\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const { data: serviceHistory } = useQuery({
    queryKey: ['customer-service-history', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/services\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

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
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewServiceCall' as never, { customer: customerId } as never)}
            style={styles.scheduleButton}
          >
            <Ionicons name="calendar" size={18} color="#3B82F6" />
            <Text style={styles.scheduleButtonText}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create" size={20} color="#FFFFFF" />
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
              {customer.service_contract && (
                <View style={styles.contractBadge}>
                  <Text style={styles.contractText}>Contract</Text>
                </View>
              )}
            </View>
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="call" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{customer.phone || 'No phone'}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{customer.email || 'No email'}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="location" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{customer.address || 'No address'}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="home" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{customer.property_type || 'Residential'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{equipment?.length || 0}</Text>
            <Text style={styles.statLabel}>Equipment</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.total_service_calls || 0}</Text>
            <Text style={styles.statLabel}>Service Calls</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              \${(customer.total_spent || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>
      </View>

      {/* Equipment List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Equipment</Text>
          <TouchableOpacity>
            <Text style={styles.addText}>Add Equipment</Text>
          </TouchableOpacity>
        </View>
        {equipment && equipment.length > 0 ? (
          equipment.map((unit: any) => (
            <View key={unit.id} style={styles.equipmentItem}>
              <View style={styles.equipmentIcon}>
                <Ionicons name="thermometer" size={24} color="#6366F1" />
              </View>
              <View style={styles.equipmentInfo}>
                <Text style={styles.equipmentName}>{unit.type} - {unit.brand}</Text>
                <Text style={styles.equipmentModel}>{unit.model}</Text>
                <View style={styles.equipmentTags}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      Installed: {unit.install_date ? new Date(unit.install_date).getFullYear() : 'N/A'}
                    </Text>
                  </View>
                  {unit.warranty_expires && (
                    <View style={[
                      styles.tag,
                      new Date(unit.warranty_expires) > new Date()
                        ? styles.tagGreen
                        : styles.tagRed
                    ]}>
                      <Text style={[
                        styles.tagText,
                        new Date(unit.warranty_expires) > new Date()
                          ? styles.tagTextGreen
                          : styles.tagTextRed
                      ]}>
                        Warranty: {new Date(unit.warranty_expires).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="thermometer" size={48} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No equipment registered</Text>
          </View>
        )}
      </View>

      {/* Recent Service History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Service History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {serviceHistory && serviceHistory.length > 0 ? (
          serviceHistory.slice(0, 5).map((service: any) => (
            <View key={service.id} style={styles.serviceItem}>
              <View style={styles.serviceIcon}>
                <Ionicons name="document-text" size={20} color="#3B82F6" />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceType}>{service.service_type}</Text>
                <Text style={styles.serviceDate}>
                  {new Date(service.date).toLocaleDateString()}
                </Text>
                {service.technician && (
                  <Text style={styles.serviceTech}>Tech: {service.technician}</Text>
                )}
              </View>
              <View style={styles.serviceRight}>
                <Text style={styles.serviceCost}>\${(service.cost || 0).toLocaleString()}</Text>
                <View style={[
                  styles.serviceStatus,
                  service.status === 'completed' ? styles.statusGreen : styles.statusYellow
                ]}>
                  <Text style={[
                    styles.serviceStatusText,
                    service.status === 'completed' ? styles.statusTextGreen : styles.statusTextYellow
                  ]}>
                    {service.status}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="time" size={48} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No service history</Text>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  scheduleButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
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
    width: 72,
    height: 72,
    borderRadius: 36,
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
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  contractBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contractText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },
  contactInfo: {
    marginTop: 12,
    gap: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  addText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  equipmentItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  equipmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  equipmentModel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  equipmentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagGreen: {
    backgroundColor: '#D1FAE5',
  },
  tagRed: {
    backgroundColor: '#FEE2E2',
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
  },
  tagTextGreen: {
    color: '#065F46',
  },
  tagTextRed: {
    color: '#991B1B',
  },
  serviceItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceType: {
    fontSize: 15,
    fontWeight: '500',
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
  serviceRight: {
    alignItems: 'flex-end',
  },
  serviceCost: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  serviceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  statusGreen: {
    backgroundColor: '#D1FAE5',
  },
  statusYellow: {
    backgroundColor: '#FEF3C7',
  },
  serviceStatusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusTextGreen: {
    color: '#065F46',
  },
  statusTextYellow: {
    color: '#92400E',
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
});

export default ${componentName};
`;
}

export interface CustomerEquipmentHvacOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerEquipmentHvac(options: CustomerEquipmentHvacOptions = {}): string {
  const { componentName = 'CustomerEquipmentHvac', endpoint = '/hvac/equipment' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId }) => {
  const navigation = useNavigation();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['customer-hvac-equipment', customerId],
    queryFn: async () => {
      let url = '${endpoint}';
      if (customerId) url += \`?customer_id=\${customerId}\`;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getEquipmentIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type?.toLowerCase()) {
      case 'furnace':
      case 'heater':
        return 'flame';
      case 'ac':
      case 'air conditioner':
        return 'snow';
      case 'heat pump':
        return 'thermometer';
      case 'ventilation':
      case 'air handler':
        return 'cloudy';
      default:
        return 'settings';
    }
  };

  const getConditionStyle = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
      case 'good':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'fair':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'poor':
      case 'needs_replacement':
        return { bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const isWarrantyExpired = (date: string) => {
    if (!date) return true;
    return new Date(date) < new Date();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const conditionStyle = getConditionStyle(item.condition);
    const warrantyExpired = isWarrantyExpired(item.warranty_expires);

    return (
      <TouchableOpacity
        style={styles.equipmentItem}
        onPress={() => navigation.navigate('EquipmentDetail' as never, { id: item.id } as never)}
        activeOpacity={0.7}
      >
        <View style={styles.equipmentIcon}>
          <Ionicons name={getEquipmentIcon(item.type)} size={24} color="#6366F1" />
        </View>

        <View style={styles.equipmentContent}>
          <View style={styles.equipmentHeader}>
            <Text style={styles.equipmentName}>{item.brand} {item.model}</Text>
            <View style={[styles.conditionBadge, { backgroundColor: conditionStyle.bg }]}>
              <Text style={[styles.conditionText, { color: conditionStyle.text }]}>
                {item.condition || 'Unknown'}
              </Text>
            </View>
          </View>

          <Text style={styles.equipmentType}>
            {item.type} | Serial: {item.serial_number || 'N/A'}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                Installed: {item.install_date ? new Date(item.install_date).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>
            {item.last_service && (
              <View style={styles.metaItem}>
                <Ionicons name="settings" size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  Last: {new Date(item.last_service).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.tagsRow}>
            {item.warranty_expires && (
              <View style={[
                styles.tag,
                warrantyExpired ? styles.tagRed : styles.tagGreen
              ]}>
                <Ionicons
                  name={warrantyExpired ? 'warning' : 'checkmark-circle'}
                  size={12}
                  color={warrantyExpired ? '#991B1B' : '#065F46'}
                />
                <Text style={[
                  styles.tagText,
                  warrantyExpired ? styles.tagTextRed : styles.tagTextGreen
                ]}>
                  Warranty: {new Date(item.warranty_expires).toLocaleDateString()}
                </Text>
              </View>
            )}
            {item.maintenance_due && (
              <View style={[styles.tag, styles.tagYellow]}>
                <Ionicons name="calendar" size={12} color="#92400E" />
                <Text style={[styles.tagText, styles.tagTextYellow]}>
                  Due: {new Date(item.maintenance_due).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {item.efficiency_rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingValue}>{item.efficiency_rating}</Text>
            <Text style={styles.ratingLabel}>SEER</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HVAC Equipment</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('NewEquipment' as never)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {equipment && equipment.length > 0 ? (
        <FlatList
          data={equipment}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="thermometer" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No equipment registered</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewEquipment' as never)}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>Add first equipment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  equipmentItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  equipmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  equipmentContent: {
    flex: 1,
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  equipmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  equipmentType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  tagGreen: {
    backgroundColor: '#D1FAE5',
  },
  tagRed: {
    backgroundColor: '#FEE2E2',
  },
  tagYellow: {
    backgroundColor: '#FEF3C7',
  },
  tagText: {
    fontSize: 11,
  },
  tagTextGreen: {
    color: '#065F46',
  },
  tagTextRed: {
    color: '#991B1B',
  },
  tagTextYellow: {
    color: '#92400E',
  },
  ratingContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  ratingLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptyButton: {
    marginTop: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export interface ServiceCallListTodayPlumbingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateServiceCallListTodayPlumbing(options: ServiceCallListTodayPlumbingOptions = {}): string {
  const { componentName = 'ServiceCallListTodayPlumbing', endpoint = '/hvac/service-calls/today' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onItemClick?: (item: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onItemClick }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: serviceCalls, isLoading, refetch } = useQuery({
    queryKey: ['today-hvac-service-calls'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle' };
      case 'in_progress':
      case 'on_site':
        return { bg: '#FEF3C7', text: '#92400E', icon: 'build' };
      case 'scheduled':
      case 'en_route':
        return { bg: '#DBEAFE', text: '#1E40AF', icon: 'time' };
      case 'emergency':
        return { bg: '#FEE2E2', text: '#991B1B', icon: 'alert-circle' };
      default:
        return { bg: '#F3F4F6', text: '#374151', icon: 'time' };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'emergency':
      case 'urgent':
        return { bg: '#EF4444', text: '#FFFFFF' };
      case 'high':
        return { bg: '#F97316', text: '#FFFFFF' };
      case 'normal':
        return { bg: '#3B82F6', text: '#FFFFFF' };
      case 'low':
        return { bg: '#9CA3AF', text: '#FFFFFF' };
      default:
        return { bg: '#9CA3AF', text: '#FFFFFF' };
    }
  };

  const handleClick = (call: any) => {
    if (onItemClick) {
      onItemClick(call);
    } else {
      navigation.navigate('ServiceCallDetail' as never, { id: call.id } as never);
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    const priorityStyle = getPriorityStyle(item.priority);

    return (
      <TouchableOpacity
        style={styles.callItem}
        onPress={() => handleClick(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.statusIcon, { backgroundColor: statusStyle.bg }]}>
          <Ionicons name={statusStyle.icon as any} size={20} color={statusStyle.text} />
        </View>

        <View style={styles.callContent}>
          <View style={styles.callHeader}>
            <Text style={styles.serviceType} numberOfLines={1}>
              {item.service_type || item.issue_type}
            </Text>
            {item.priority && (
              <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
                  {item.priority}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="person" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{item.customer_name || 'Unknown'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{item.scheduled_time || item.time_slot}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
          </View>

          {item.equipment_type && (
            <View style={styles.equipmentRow}>
              <Ionicons name="thermometer" size={14} color="#6366F1" />
              <Text style={styles.equipmentText}>{item.equipment_type}</Text>
            </View>
          )}

          {item.notes && (
            <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text>
          )}
        </View>

        <View style={styles.callRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status?.replace('_', ' ')}
            </Text>
          </View>
          {item.technician && (
            <Text style={styles.techText}>Tech: {item.technician}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Service Calls</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{serviceCalls?.length || 0} calls</Text>
        </View>
      </View>

      {serviceCalls && serviceCalls.length > 0 ? (
        <FlatList
          data={serviceCalls}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No service calls scheduled for today</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E40AF',
  },
  callItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  callContent: {
    flex: 1,
  },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  serviceType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  equipmentText: {
    fontSize: 13,
    color: '#6366F1',
  },
  notes: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  callRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  techText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
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
