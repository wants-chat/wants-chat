/**
 * Auto Repair Service Component Generators (React Native)
 *
 * Generates components for auto repair shop management:
 * - AutorepairStats: Dashboard statistics
 * - CustomerProfileAutorepair: Customer details with vehicle history
 * - VehicleProfile: Vehicle details and service records
 * - VehicleHistory: Vehicle service history timeline
 * - ServiceCallListToday: Today's service appointments
 * - RepairListPending: Pending repair jobs
 */

export interface AutorepairStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAutorepairStats(options: AutorepairStatsOptions = {}): string {
  const { componentName = 'AutorepairStats', endpoint = '/autorepair/stats' } = options;

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
    queryKey: ['autorepair-stats'],
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
    { key: 'todayAppointments', label: "Today's Appointments", icon: 'time', color: '#3B82F6' },
    { key: 'activeRepairs', label: 'Active Repairs', icon: 'build', color: '#F59E0B' },
    { key: 'completedToday', label: 'Completed Today', icon: 'checkmark-circle', color: '#10B981' },
    { key: 'pendingEstimates', label: 'Pending Estimates', icon: 'warning', color: '#F97316' },
    { key: 'totalCustomers', label: 'Total Customers', icon: 'people', color: '#8B5CF6' },
    { key: 'vehiclesInShop', label: 'Vehicles in Shop', icon: 'car', color: '#6366F1' },
    { key: 'revenueToday', label: "Today's Revenue", icon: 'cash', color: '#10B981', type: 'currency' },
    { key: 'avgRepairTime', label: 'Avg Repair Time', icon: 'trending-up', color: '#EF4444', suffix: ' hrs' },
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

export interface CustomerProfileAutorepairOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileAutorepair(options: CustomerProfileAutorepairOptions = {}): string {
  const { componentName = 'CustomerProfileAutorepair', endpoint = '/autorepair/customers' } = options;

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
    queryKey: ['autorepair-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: vehicles } = useQuery({
    queryKey: ['customer-vehicles', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/vehicles\`);
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
        <TouchableOpacity
          onPress={() => navigation.navigate('EditCustomer' as never, { id: customerId } as never)}
          style={styles.editButton}
        >
          <Ionicons name="create" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Customer Info Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#3B82F6" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{customer.name}</Text>
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
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.total_visits || 0}</Text>
            <Text style={styles.statLabel}>Total Visits</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{vehicles?.length || 0}</Text>
            <Text style={styles.statLabel}>Vehicles</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              \${(customer.total_spent || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>
      </View>

      {/* Vehicles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vehicles</Text>
          <TouchableOpacity>
            <Text style={styles.addText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>
        {vehicles && vehicles.length > 0 ? (
          vehicles.map((vehicle: any) => (
            <TouchableOpacity
              key={vehicle.id}
              style={styles.vehicleItem}
              onPress={() => navigation.navigate('VehicleDetail' as never, { id: vehicle.id } as never)}
            >
              <View style={styles.vehicleIcon}>
                <Ionicons name="car" size={24} color="#6366F1" />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
                <Text style={styles.vehicleDetails}>
                  {vehicle.license_plate} | VIN: {vehicle.vin?.slice(-6) || 'N/A'}
                </Text>
              </View>
              <View style={styles.vehicleStats}>
                <Text style={styles.vehicleMileage}>{vehicle.mileage?.toLocaleString() || 0} mi</Text>
                <Text style={styles.vehicleServices}>{vehicle.service_count || 0} services</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="car" size={48} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No vehicles registered</Text>
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
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
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
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
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  vehicleDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  vehicleStats: {
    alignItems: 'flex-end',
  },
  vehicleMileage: {
    fontSize: 14,
    color: '#6B7280',
  },
  vehicleServices: {
    fontSize: 12,
    color: '#9CA3AF',
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

export interface VehicleProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateVehicleProfile(options: VehicleProfileOptions = {}): string {
  const { componentName = 'VehicleProfile', endpoint = '/autorepair/vehicles' } = options;

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
  vehicleId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ vehicleId: propId }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const vehicleId = propId || (route.params as any)?.id;

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${vehicleId}\`);
      return response?.data || response;
    },
    enabled: !!vehicleId,
  });

  const { data: serviceHistory } = useQuery({
    queryKey: ['vehicle-services', vehicleId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${vehicleId}/services\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!vehicleId,
  });

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'in_service':
        return { bg: '#FEF3C7', text: '#92400E' };
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

  if (!vehicle) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Vehicle not found</Text>
      </View>
    );
  }

  const statusStyle = getStatusStyle(vehicle.status);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle Info Card */}
      <View style={styles.card}>
        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="car" size={48} color="#6366F1" />
          </View>
          <View style={styles.vehicleInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.vehicleTitle}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Text>
              {vehicle.status && (
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {vehicle.status}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.vehicleTrim}>{vehicle.trim || vehicle.variant || ''}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="card" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{vehicle.license_plate || 'No plate'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="speedometer" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{vehicle.mileage?.toLocaleString() || 0} miles</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="person" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{vehicle.owner_name || 'Unknown owner'}</Text>
          </View>
        </View>

        {/* VIN & Details */}
        <View style={styles.specsSection}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>VIN</Text>
            <Text style={styles.specValue}>{vehicle.vin || 'Not provided'}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Engine</Text>
            <Text style={styles.specValue}>{vehicle.engine || 'N/A'}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Transmission</Text>
            <Text style={styles.specValue}>{vehicle.transmission || 'N/A'}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Color</Text>
            <Text style={styles.specValue}>{vehicle.color || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Service History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Service History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {serviceHistory && serviceHistory.length > 0 ? (
          serviceHistory.slice(0, 5).map((service: any) => (
            <View key={service.id} style={styles.serviceItem}>
              <View style={[
                styles.serviceIcon,
                { backgroundColor: service.status === 'completed' ? '#D1FAE5' : '#FEF3C7' }
              ]}>
                <Ionicons
                  name={service.status === 'completed' ? 'checkmark-circle' : 'build'}
                  size={20}
                  color={service.status === 'completed' ? '#10B981' : '#F59E0B'}
                />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceType}>{service.service_type || service.description}</Text>
                <Text style={styles.serviceDate}>
                  {new Date(service.date || service.created_at).toLocaleDateString()}
                </Text>
                {service.technician && (
                  <Text style={styles.serviceTech}>Tech: {service.technician}</Text>
                )}
              </View>
              <View style={styles.serviceStats}>
                <Text style={styles.serviceCost}>\${(service.cost || 0).toLocaleString()}</Text>
                <Text style={styles.serviceMileage}>{service.mileage?.toLocaleString() || 0} mi</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="build" size={48} color="#D1D5DB" />
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
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
  vehicleHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  vehicleIcon: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  vehicleTrim: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  detailsGrid: {
    marginTop: 16,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  specsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specItem: {
    width: '50%',
    marginBottom: 12,
  },
  specLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
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
  serviceStats: {
    alignItems: 'flex-end',
  },
  serviceCost: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  serviceMileage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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

export interface VehicleHistoryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateVehicleHistory(options: VehicleHistoryOptions = {}): string {
  const { componentName = 'VehicleHistory', endpoint = '/autorepair/vehicles' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  vehicleId?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ vehicleId: propId, limit }) => {
  const route = useRoute();
  const vehicleId = propId || (route.params as any)?.id;

  const { data: history, isLoading } = useQuery({
    queryKey: ['vehicle-history', vehicleId, limit],
    queryFn: async () => {
      let url = \`${endpoint}/\${vehicleId}/history\`;
      if (limit) url += \`?limit=\${limit}\`;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!vehicleId,
  });

  const getStatusIcon = (status: string): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { name: 'checkmark-circle', color: '#10B981' };
      case 'in_progress':
        return { name: 'build', color: '#F59E0B' };
      case 'pending':
        return { name: 'time', color: '#F97316' };
      case 'issue':
        return { name: 'warning', color: '#EF4444' };
      default:
        return { name: 'document-text', color: '#6B7280' };
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#D1FAE5';
      case 'in_progress':
        return '#FEF3C7';
      case 'pending':
        return '#FFEDD5';
      case 'issue':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const statusIcon = getStatusIcon(item.status);
    const isLast = index === (history?.length || 0) - 1;

    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[styles.dot, { backgroundColor: getStatusBgColor(item.status), borderColor: statusIcon.color }]}>
            <Ionicons name={statusIcon.name} size={16} color={statusIcon.color} />
          </View>
          {!isLast && <View style={styles.line} />}
        </View>
        <View style={styles.timelineContent}>
          <View style={styles.contentCard}>
            <View style={styles.contentHeader}>
              <Text style={styles.serviceType}>{item.service_type || item.title || 'Service'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
                <Text style={[styles.statusText, { color: statusIcon.color }]}>
                  {item.status || 'Unknown'}
                </Text>
              </View>
            </View>
            <Text style={styles.serviceDate}>
              {new Date(item.date || item.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            {item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}
            <View style={styles.metaRow}>
              {item.cost !== undefined && (
                <View style={styles.metaItem}>
                  <Ionicons name="cash" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>\${Number(item.cost).toLocaleString()}</Text>
                </View>
              )}
              {item.mileage && (
                <View style={styles.metaItem}>
                  <Ionicons name="speedometer" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{item.mileage.toLocaleString()} mi</Text>
                </View>
              )}
              {item.technician && (
                <Text style={styles.metaText}>Tech: {item.technician}</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Service History Timeline</Text>
      {history && history.length > 0 ? (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || String(index)}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="build" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No service history available</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  contentCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  serviceDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
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

export interface ServiceCallListTodayOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateServiceCallListToday(options: ServiceCallListTodayOptions = {}): string {
  const { componentName = 'ServiceCallListToday', endpoint = '/autorepair/appointments/today' } = options;

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

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['today-appointments'],
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
        return { bg: '#FEF3C7', text: '#92400E', icon: 'build' };
      case 'waiting':
        return { bg: '#DBEAFE', text: '#1E40AF', icon: 'time' };
      case 'delayed':
        return { bg: '#FEE2E2', text: '#991B1B', icon: 'alert-circle' };
      default:
        return { bg: '#F3F4F6', text: '#374151', icon: 'time' };
    }
  };

  const handleItemClick = (appointment: any) => {
    if (onItemClick) {
      onItemClick(appointment);
    } else {
      navigation.navigate('AppointmentDetail' as never, { id: appointment.id } as never);
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.appointmentItem}
        onPress={() => handleItemClick(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.statusIcon, { backgroundColor: statusStyle.bg }]}>
          <Ionicons name={statusStyle.icon as any} size={20} color={statusStyle.text} />
        </View>
        <View style={styles.appointmentContent}>
          <View style={styles.appointmentHeader}>
            <Text style={styles.serviceType} numberOfLines={1}>
              {item.service_type || item.description}
            </Text>
            <Text style={styles.timeText}>{item.scheduled_time || item.time}</Text>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="person" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{item.customer_name || 'Unknown'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="car" size={14} color="#6B7280" />
              <Text style={styles.detailText}>
                {item.vehicle_year} {item.vehicle_make} {item.vehicle_model}
              </Text>
            </View>
          </View>
          {item.notes && (
            <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {item.status}
          </Text>
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
          <Text style={styles.countText}>{appointments?.length || 0} appointments</Text>
        </View>
      </View>
      {appointments && appointments.length > 0 ? (
        <FlatList
          data={appointments}
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
          <Text style={styles.emptyText}>No appointments scheduled for today</Text>
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
  appointmentItem: {
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
  appointmentContent: {
    flex: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailsRow: {
    marginTop: 8,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  notes: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
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

export interface RepairListPendingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateRepairListPending(options: RepairListPendingOptions = {}): string {
  const { componentName = 'RepairListPending', endpoint = '/autorepair/repairs/pending' } = options;

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
  limit?: number;
  onItemClick?: (item: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit, onItemClick }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: repairs, isLoading, refetch } = useQuery({
    queryKey: ['pending-repairs', limit],
    queryFn: async () => {
      let url = '${endpoint}';
      if (limit) url += \`?limit=\${limit}\`;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'medium':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'low':
        return { bg: '#D1FAE5', text: '#065F46' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const handleClick = (repair: any) => {
    if (onItemClick) {
      onItemClick(repair);
    } else {
      navigation.navigate('RepairDetail' as never, { id: repair.id } as never);
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const priorityStyle = getPriorityStyle(item.priority);

    return (
      <TouchableOpacity
        style={styles.repairItem}
        onPress={() => handleClick(item)}
        activeOpacity={0.7}
      >
        <View style={styles.repairIcon}>
          <Ionicons name="build" size={24} color="#F97316" />
        </View>
        <View style={styles.repairContent}>
          <View style={styles.repairHeader}>
            <Text style={styles.repairType} numberOfLines={1}>
              {item.repair_type || item.description}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
              <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
                {item.priority || 'Normal'}
              </Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="car" size={14} color="#6B7280" />
              <Text style={styles.detailText}>
                {item.vehicle_info || \`\${item.vehicle_year} \${item.vehicle_make} \${item.vehicle_model}\`}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="person" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{item.customer_name}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color="#6B7280" />
              <Text style={styles.metaText}>Est. {item.estimated_hours || '?'} hrs</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash" size={14} color="#10B981" />
              <Text style={[styles.metaText, { color: '#10B981' }]}>
                \${(item.estimated_cost || 0).toLocaleString()}
              </Text>
            </View>
            {item.waiting_for_parts && (
              <View style={styles.metaItem}>
                <Ionicons name="warning" size={14} color="#F59E0B" />
                <Text style={[styles.metaText, { color: '#F59E0B' }]}>Waiting for parts</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
        <Text style={styles.title}>Pending Repairs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllRepairs' as never)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {repairs && repairs.length > 0 ? (
        <FlatList
          data={repairs}
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
          <Ionicons name="build" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No pending repairs</Text>
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
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  repairItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  repairIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  repairContent: {
    flex: 1,
  },
  repairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repairType: {
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
    marginTop: 6,
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
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
