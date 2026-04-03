/**
 * Vehicle Component Generators (React Native)
 *
 * Generates React Native components for fleet management, transportation, and logistics
 */

export interface VehicleOptions {
  componentName?: string;
  endpoint?: string;
  primaryColor?: string;
}

/**
 * Generates VehicleFilters component
 */
export function generateVehicleFilters(options: VehicleOptions = {}): string {
  const { componentName = 'VehicleFilters' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VehicleFiltersState {
  search: string;
  type: string;
  status: string;
  location: string;
  fuelType: string;
}

interface ${componentName}Props {
  onFilterChange?: (filters: VehicleFiltersState) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<VehicleFiltersState>({
    search: '',
    type: '',
    status: '',
    location: '',
    fuelType: '',
  });

  const vehicleTypes = ['All Types', 'Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle'];
  const statuses = ['All Status', 'Available', 'In Use', 'Maintenance', 'Out of Service'];
  const locations = ['All Locations', 'Main Depot', 'North Branch', 'South Branch', 'On Route'];
  const fuelTypes = ['All Fuel Types', 'Gasoline', 'Diesel', 'Electric', 'Hybrid'];

  const handleChange = useCallback((key: keyof VehicleFiltersState, value: string) => {
    const actualValue = value.startsWith('All') ? '' : value.toLowerCase().replace(' ', '-');
    const newFilters = { ...filters, [key]: actualValue };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  const renderDropdown = (options: string[], selectedIndex: number, onSelect: (value: string) => void, placeholder: string) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{placeholder}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionPill,
              (index === 0 ? !filters[placeholder.toLowerCase() as keyof VehicleFiltersState] : option.toLowerCase().replace(' ', '-') === filters[placeholder.toLowerCase() as keyof VehicleFiltersState]) && styles.optionPillSelected,
            ]}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optionText,
              (index === 0 ? !filters[placeholder.toLowerCase() as keyof VehicleFiltersState] : option.toLowerCase().replace(' ', '-') === filters[placeholder.toLowerCase() as keyof VehicleFiltersState]) && styles.optionTextSelected,
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, plate..."
          placeholderTextColor="#9CA3AF"
          value={filters.search}
          onChangeText={(text) => handleChange('search', text)}
        />
      </View>

      {renderDropdown(vehicleTypes, 0, (v) => handleChange('type', v), 'Type')}
      {renderDropdown(statuses, 0, (v) => handleChange('status', v), 'Status')}
      {renderDropdown(fuelTypes, 0, (v) => handleChange('fuelType', v), 'Fuel')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  optionPillSelected: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

/**
 * Generates VehicleCard component
 */
export function generateVehicleCard(options: VehicleOptions = {}): string {
  const { componentName = 'VehicleCard' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    type: string;
    status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
    fuelLevel: number;
    mileage: number;
    lastService: string;
    imageUrl?: string;
    assignedDriver?: string;
  };
  onSelect?: (id: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ vehicle, onSelect }) => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    'available': { bg: '#DCFCE7', text: '#166534' },
    'in-use': { bg: '#DBEAFE', text: '#1E40AF' },
    'maintenance': { bg: '#FEF9C3', text: '#854D0E' },
    'out-of-service': { bg: '#FEE2E2', text: '#991B1B' },
  };

  const statusLabels: Record<string, string> = {
    'available': 'Available',
    'in-use': 'In Use',
    'maintenance': 'Maintenance',
    'out-of-service': 'Out of Service',
  };

  const statusStyle = statusColors[vehicle.status] || statusColors['available'];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect?.(vehicle.id)}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {vehicle.imageUrl ? (
          <Image source={{ uri: vehicle.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.vehicleEmoji}>🚗</Text>
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {statusLabels[vehicle.status]}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{vehicle.year} {vehicle.make} {vehicle.model}</Text>
        <Text style={styles.subtitle}>{vehicle.licensePlate} • {vehicle.type}</Text>

        {/* Fuel Level */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Fuel Level</Text>
          <View style={styles.fuelBarContainer}>
            <View style={[
              styles.fuelBar,
              { width: \`\${vehicle.fuelLevel}%\`, backgroundColor: vehicle.fuelLevel > 30 ? '#22C55E' : '#EF4444' }
            ]} />
          </View>
          <Text style={styles.fuelText}>{vehicle.fuelLevel}%</Text>
        </View>

        {/* Mileage */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Mileage</Text>
          <Text style={styles.metaValue}>{vehicle.mileage.toLocaleString()} mi</Text>
        </View>

        {/* Last Service */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Last Service</Text>
          <Text style={styles.metaValue}>{vehicle.lastService}</Text>
        </View>

        {/* Assigned Driver */}
        {vehicle.assignedDriver && (
          <View style={styles.driverRow}>
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Text style={styles.driverText}>{vehicle.assignedDriver}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleEmoji: {
    fontSize: 48,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: '#6B7280',
    width: 80,
  },
  metaValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  fuelBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  fuelBar: {
    height: '100%',
    borderRadius: 3,
  },
  fuelText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
    width: 36,
    textAlign: 'right',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  driverText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

/**
 * Generates VehicleDetail component
 */
export function generateVehicleDetail(options: VehicleOptions = {}): string {
  const { componentName = 'VehicleDetail', endpoint = '/vehicles' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

type RouteParams = {
  VehicleDetail: { vehicleId: string };
};

const ${componentName}: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'VehicleDetail'>>();
  const { vehicleId } = route.params;

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + vehicleId);
      return response?.data || response || {
        id: vehicleId,
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        licensePlate: 'ABC-1234',
        vin: '1HGBH41JXMN109186',
        type: 'Sedan',
        status: 'available',
        fuelLevel: 75,
        fuelType: 'Gasoline',
        mileage: 15234,
        lastService: '2024-01-05',
        nextService: '2024-04-05',
        assignedDriver: { name: 'John Smith', phone: '555-0123' },
        insurance: { provider: 'Safe Auto', policyNumber: 'POL-123456', expiry: '2024-12-31' },
        registration: { number: 'REG-789012', expiry: '2024-06-30' },
      };
    },
  });

  const statusColors: Record<string, { bg: string; text: string }> = {
    'available': { bg: '#DCFCE7', text: '#166534' },
    'in-use': { bg: '#DBEAFE', text: '#1E40AF' },
    'maintenance': { bg: '#FEF9C3', text: '#854D0E' },
    'out-of-service': { bg: '#FEE2E2', text: '#991B1B' },
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const statusStyle = statusColors[vehicle?.status] || statusColors['available'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <View style={styles.headerImage}>
        <Text style={styles.vehicleEmoji}>🚗</Text>
      </View>

      {/* Vehicle Info */}
      <View style={styles.infoCard}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>{vehicle?.year} {vehicle?.make} {vehicle?.model}</Text>
            <Text style={styles.subtitle}>{vehicle?.licensePlate} • {vehicle?.type}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {vehicle?.status?.replace('-', ' ').replace(/\\b\\w/g, (l: string) => l.toUpperCase())}
            </Text>
          </View>
        </View>
      </View>

      {/* Vehicle Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>VIN</Text>
          <Text style={styles.detailValue}>{vehicle?.vin}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fuel Type</Text>
          <Text style={styles.detailValue}>{vehicle?.fuelType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mileage</Text>
          <Text style={styles.detailValue}>{vehicle?.mileage?.toLocaleString()} mi</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fuel Level</Text>
          <View style={styles.fuelContainer}>
            <View style={styles.fuelBarContainer}>
              <View style={[
                styles.fuelBar,
                { width: \`\${vehicle?.fuelLevel}%\`, backgroundColor: vehicle?.fuelLevel > 30 ? '#22C55E' : '#EF4444' }
              ]} />
            </View>
            <Text style={styles.fuelText}>{vehicle?.fuelLevel}%</Text>
          </View>
        </View>
      </View>

      {/* Maintenance */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Maintenance</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last Service</Text>
          <Text style={styles.detailValue}>{vehicle?.lastService}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Next Service</Text>
          <Text style={styles.detailValue}>{vehicle?.nextService}</Text>
        </View>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>Schedule Maintenance</Text>
        </TouchableOpacity>
      </View>

      {/* Documents */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Documents</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Registration</Text>
          <Text style={styles.detailValue}>{vehicle?.registration?.number}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reg. Expiry</Text>
          <Text style={styles.detailValue}>{vehicle?.registration?.expiry}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Insurance</Text>
          <Text style={styles.detailValue}>{vehicle?.insurance?.provider}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ins. Expiry</Text>
          <Text style={styles.detailValue}>{vehicle?.insurance?.expiry}</Text>
        </View>
      </View>

      {/* Assigned Driver */}
      {vehicle?.assignedDriver && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Assigned Driver</Text>
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={24} color="#6B7280" />
            </View>
            <View>
              <Text style={styles.driverName}>{vehicle?.assignedDriver?.name}</Text>
              <Text style={styles.driverPhone}>{vehicle?.assignedDriver?.phone}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>Edit Vehicle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.7}>
          <Text style={styles.primaryButtonText}>View History</Text>
        </TouchableOpacity>
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
  },
  headerImage: {
    height: 200,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleEmoji: {
    fontSize: 72,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  fuelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  fuelBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  fuelBar: {
    height: '100%',
    borderRadius: 4,
  },
  fuelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    width: 36,
    textAlign: 'right',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  driverPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginBottom: 24,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

/**
 * Generates TruckSchedule component
 */
export function generateTruckSchedule(options: VehicleOptions = {}): string {
  const { componentName = 'TruckSchedule' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Schedule {
  id: string;
  truckId: string;
  truckName: string;
  driver: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  status: 'scheduled' | 'in-transit' | 'completed' | 'delayed';
  stops: number;
}

interface ${componentName}Props {
  schedules?: Schedule[];
  onSelect?: (id: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ schedules: propsSchedules, onSelect }) => {
  const schedules: Schedule[] = propsSchedules || [
    { id: '1', truckId: 'T-001', truckName: 'Truck Alpha', driver: 'John Smith', route: 'NYC - Boston', departureTime: '06:00 AM', arrivalTime: '12:00 PM', status: 'in-transit', stops: 3 },
    { id: '2', truckId: 'T-002', truckName: 'Truck Beta', driver: 'Mike Johnson', route: 'LA - San Diego', departureTime: '08:00 AM', arrivalTime: '11:00 AM', status: 'scheduled', stops: 2 },
    { id: '3', truckId: 'T-003', truckName: 'Truck Gamma', driver: 'Sarah Davis', route: 'Chicago - Detroit', departureTime: '05:00 AM', arrivalTime: '10:00 AM', status: 'completed', stops: 4 },
    { id: '4', truckId: 'T-004', truckName: 'Truck Delta', driver: 'Tom Wilson', route: 'Miami - Orlando', departureTime: '07:00 AM', arrivalTime: '11:00 AM', status: 'delayed', stops: 2 },
  ];

  const statusColors: Record<string, { bg: string; text: string }> = {
    'scheduled': { bg: '#DBEAFE', text: '#1E40AF' },
    'in-transit': { bg: '#FEF9C3', text: '#854D0E' },
    'completed': { bg: '#DCFCE7', text: '#166534' },
    'delayed': { bg: '#FEE2E2', text: '#991B1B' },
  };

  const renderScheduleItem = useCallback(({ item }: { item: Schedule }) => {
    const statusStyle = statusColors[item.status] || statusColors['scheduled'];

    return (
      <TouchableOpacity
        style={styles.scheduleCard}
        onPress={() => onSelect?.(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.scheduleHeader}>
          <View style={styles.truckInfo}>
            <Text style={styles.truckEmoji}>🚚</Text>
            <View>
              <Text style={styles.truckName}>{item.truckName}</Text>
              <Text style={styles.driverName}>Driver: {item.driver}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
            </Text>
          </View>
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.routeItem}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.routeText}>{item.route}</Text>
          </View>
          <View style={styles.routeItem}>
            <Ionicons name="time" size={14} color="#6B7280" />
            <Text style={styles.routeText}>{item.departureTime} - {item.arrivalTime}</Text>
          </View>
          <View style={styles.routeItem}>
            <Ionicons name="cube" size={14} color="#6B7280" />
            <Text style={styles.routeText}>{item.stops} stops</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [onSelect]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Truck Schedule</Text>
      </View>
      <FlatList
        data={schedules}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  scheduleCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  truckInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  truckEmoji: {
    fontSize: 28,
  },
  truckName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  driverName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  routeInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginLeft: 52,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generates FleetStats component
 */
export function generateFleetStats(options: VehicleOptions = {}): string {
  const { componentName = 'FleetStats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface StatItem {
  label: string;
  value: string;
  icon: string;
  change: string;
}

const ${componentName}: React.FC = () => {
  const stats: StatItem[] = [
    { label: 'Total Vehicles', value: '48', icon: '🚗', change: '+3 this month' },
    { label: 'Available', value: '32', icon: '✅', change: '67%' },
    { label: 'In Transit', value: '12', icon: '🛣️', change: '25%' },
    { label: 'Maintenance', value: '4', icon: '🔧', change: '8%' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {stats.map((stat, index) => (
        <View key={index} style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statChange}>{stat.change}</Text>
            </View>
            <Text style={styles.statIcon}>{stat.icon}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statIcon: {
    fontSize: 28,
  },
});

export default ${componentName};
`;
}
