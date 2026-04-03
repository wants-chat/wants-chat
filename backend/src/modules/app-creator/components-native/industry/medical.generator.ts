/**
 * Medical Component Generators (React Native)
 *
 * Generates React Native components for medical/healthcare applications
 */

export interface MedicalOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generates PatientAppointments component
 */
export function generatePatientAppointments(options: MedicalOptions = {}): string {
  const { componentName = 'PatientAppointments', endpoint = '/appointments' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'in-person' | 'telehealth';
}

const ${componentName}: React.FC = () => {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const statusColors: Record<string, { bg: string; text: string }> = {
    'upcoming': { bg: '#DBEAFE', text: '#1E40AF' },
    'completed': { bg: '#DCFCE7', text: '#166534' },
    'cancelled': { bg: '#FEE2E2', text: '#991B1B' },
  };

  const renderAppointmentItem = useCallback(({ item }: { item: Appointment }) => {
    const statusStyle = statusColors[item.status] || statusColors['upcoming'];

    return (
      <TouchableOpacity style={styles.appointmentCard} activeOpacity={0.7}>
        <View style={styles.appointmentHeader}>
          <View style={styles.doctorInfo}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.doctorName}>{item.doctorName}</Text>
              <Text style={styles.specialty}>{item.specialty}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name={item.type === 'telehealth' ? 'videocam-outline' : 'location-outline'} size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {item.type === 'telehealth' ? 'Video Call' : item.location}
            </Text>
          </View>
        </View>

        {item.status === 'upcoming' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.rescheduleButton} activeOpacity={0.7}>
              <Text style={styles.rescheduleButtonText}>Reschedule</Text>
            </TouchableOpacity>
            {item.type === 'telehealth' && (
              <TouchableOpacity style={styles.joinButton} activeOpacity={0.7}>
                <Ionicons name="videocam" size={16} color="#FFFFFF" />
                <Text style={styles.joinButtonText}>Join Call</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }, []);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No appointments scheduled</Text>
    </View>
  ), []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      <FlatList
        data={appointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginVertical: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  specialty: {
    fontSize: 14,
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
  appointmentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  rescheduleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  rescheduleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

/**
 * Generates MedicalRecords component
 */
export function generateMedicalRecords(options: MedicalOptions = {}): string {
  const { componentName = 'MedicalRecords' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MedicalRecord {
  id: string;
  type: 'lab-result' | 'prescription' | 'visit-summary' | 'imaging';
  title: string;
  date: string;
  provider: string;
  status?: string;
}

const ${componentName}: React.FC = () => {
  const [selectedType, setSelectedType] = useState('all');

  const records: MedicalRecord[] = [
    { id: '1', type: 'lab-result', title: 'Complete Blood Count', date: '2024-01-15', provider: 'City Lab', status: 'Normal' },
    { id: '2', type: 'prescription', title: 'Medication Refill', date: '2024-01-12', provider: 'Dr. Smith' },
    { id: '3', type: 'visit-summary', title: 'Annual Physical', date: '2024-01-10', provider: 'Dr. Johnson' },
    { id: '4', type: 'imaging', title: 'X-Ray - Chest', date: '2024-01-05', provider: 'Imaging Center', status: 'Normal' },
    { id: '5', type: 'lab-result', title: 'Lipid Panel', date: '2024-01-03', provider: 'City Lab', status: 'Review Required' },
  ];

  const recordTypes = [
    { value: 'all', label: 'All', icon: 'documents-outline' },
    { value: 'lab-result', label: 'Lab Results', icon: 'flask-outline' },
    { value: 'prescription', label: 'Prescriptions', icon: 'medical-outline' },
    { value: 'visit-summary', label: 'Visits', icon: 'clipboard-outline' },
    { value: 'imaging', label: 'Imaging', icon: 'scan-outline' },
  ];

  const typeIcons: Record<string, string> = {
    'lab-result': 'flask',
    'prescription': 'medical',
    'visit-summary': 'clipboard',
    'imaging': 'scan',
  };

  const typeColors: Record<string, string> = {
    'lab-result': '#8B5CF6',
    'prescription': '#10B981',
    'visit-summary': '#3B82F6',
    'imaging': '#F59E0B',
  };

  const filteredRecords = selectedType === 'all'
    ? records
    : records.filter(r => r.type === selectedType);

  const renderRecordItem = useCallback(({ item }: { item: MedicalRecord }) => {
    const iconName = typeIcons[item.type] || 'document';
    const iconColor = typeColors[item.type] || '#6B7280';

    return (
      <TouchableOpacity style={styles.recordCard} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName as any} size={24} color={iconColor} />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>{item.title}</Text>
          <Text style={styles.recordProvider}>{item.provider}</Text>
          <View style={styles.recordMeta}>
            <Text style={styles.recordDate}>{item.date}</Text>
            {item.status && (
              <View style={[
                styles.statusBadge,
                item.status === 'Normal' ? styles.statusNormal : styles.statusReview,
              ]}>
                <Text style={[
                  styles.statusText,
                  item.status === 'Normal' ? styles.statusTextNormal : styles.statusTextReview,
                ]}>
                  {item.status}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medical Records</Text>

      {/* Type Filter */}
      <FlatList
        horizontal
        data={recordTypes}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterButton, selectedType === item.value && styles.filterButtonSelected]}
            onPress={() => setSelectedType(item.value)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon as any}
              size={16}
              color={selectedType === item.value ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[styles.filterButtonText, selectedType === item.value && styles.filterButtonTextSelected]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      />

      {/* Records List */}
      <FlatList
        data={filteredRecords}
        renderItem={renderRecordItem}
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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginVertical: 16,
  },
  filterContainer: {
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonSelected: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 16,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  recordProvider: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  recordDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusNormal: {
    backgroundColor: '#DCFCE7',
  },
  statusReview: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusTextNormal: {
    color: '#166534',
  },
  statusTextReview: {
    color: '#92400E',
  },
});

export default ${componentName};
`;
}

/**
 * Generates DoctorList component
 */
export function generateDoctorList(options: MedicalOptions = {}): string {
  const { componentName = 'DoctorList', endpoint = '/doctors' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  location: string;
  available: boolean;
  nextAvailable?: string;
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors', search, specialty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (specialty) params.append('specialty', specialty);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const specialties = ['All', 'Primary Care', 'Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics'];

  const renderDoctorItem = useCallback(({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate('DoctorDetail' as never, { doctorId: item.id } as never)}
      activeOpacity={0.7}
    >
      <View style={styles.doctorHeader}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={28} color="#3B82F6" />
          </View>
        )}
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount} reviews)</Text>
          </View>
        </View>
        <View style={[styles.availableBadge, !item.available && styles.unavailableBadge]}>
          <View style={[styles.availableDot, !item.available && styles.unavailableDot]} />
          <Text style={[styles.availableText, !item.available && styles.unavailableText]}>
            {item.available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      <View style={styles.doctorFooter}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        {item.nextAvailable && (
          <Text style={styles.nextAvailableText}>Next: {item.nextAvailable}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.bookButton} activeOpacity={0.7}>
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [navigation]);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No doctors found</Text>
    </View>
  ), []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Specialty Filter */}
      <FlatList
        horizontal
        data={specialties}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.specialtyButton,
              (item === 'All' ? !specialty : specialty === item) && styles.specialtyButtonSelected,
            ]}
            onPress={() => setSpecialty(item === 'All' ? '' : item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.specialtyButtonText,
                (item === 'All' ? !specialty : specialty === item) && styles.specialtyButtonTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.specialtyContainer}
      />

      {/* Doctor List */}
      <FlatList
        data={doctors}
        renderItem={renderDoctorItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  specialtyContainer: {
    paddingVertical: 16,
    gap: 8,
  },
  specialtyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  specialtyButtonSelected: {
    backgroundColor: '#3B82F6',
  },
  specialtyButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  specialtyButtonTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 16,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  specialty: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableBadge: {
    backgroundColor: '#FEE2E2',
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  unavailableDot: {
    backgroundColor: '#EF4444',
  },
  availableText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#166534',
  },
  unavailableText: {
    color: '#991B1B',
  },
  doctorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  nextAvailableText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

/**
 * Generates MedicationTracker component
 */
export function generateMedicationTracker(options: MedicalOptions = {}): string {
  const { componentName = 'MedicationTracker' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  taken: boolean[];
  refillDate?: string;
  instructions?: string;
}

const ${componentName}: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', times: ['8:00 AM'], taken: [false], refillDate: '2024-02-15', instructions: 'Take with food' },
    { id: '2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', times: ['8:00 AM', '8:00 PM'], taken: [true, false], refillDate: '2024-02-20' },
    { id: '3', name: 'Vitamin D', dosage: '2000 IU', frequency: 'Once daily', times: ['12:00 PM'], taken: [true], refillDate: '2024-03-01' },
  ]);

  const toggleTaken = useCallback((medId: string, timeIndex: number) => {
    setMedications(prev => prev.map(med => {
      if (med.id === medId) {
        const newTaken = [...med.taken];
        newTaken[timeIndex] = !newTaken[timeIndex];
        return { ...med, taken: newTaken };
      }
      return med;
    }));
  }, []);

  const renderMedicationItem = useCallback(({ item }: { item: Medication }) => {
    const allTaken = item.taken.every(t => t);
    const someTaken = item.taken.some(t => t);

    return (
      <View style={styles.medicationCard}>
        <View style={styles.medicationHeader}>
          <View style={[
            styles.statusIcon,
            allTaken && styles.statusIconComplete,
            someTaken && !allTaken && styles.statusIconPartial,
          ]}>
            <Ionicons
              name={allTaken ? 'checkmark-circle' : someTaken ? 'ellipse-outline' : 'medical'}
              size={24}
              color={allTaken ? '#FFFFFF' : someTaken ? '#F59E0B' : '#3B82F6'}
            />
          </View>
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>{item.name}</Text>
            <Text style={styles.dosageText}>{item.dosage} • {item.frequency}</Text>
            {item.instructions && (
              <Text style={styles.instructionsText}>{item.instructions}</Text>
            )}
          </View>
        </View>

        <View style={styles.timesContainer}>
          {item.times.map((time, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.timeSlot, item.taken[index] && styles.timeSlotTaken]}
              onPress={() => toggleTaken(item.id, index)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.taken[index] ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={item.taken[index] ? '#10B981' : '#9CA3AF'}
              />
              <Text style={[styles.timeText, item.taken[index] && styles.timeTextTaken]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {item.refillDate && (
          <View style={styles.refillContainer}>
            <Ionicons name="alert-circle-outline" size={14} color="#F59E0B" />
            <Text style={styles.refillText}>Refill by {item.refillDate}</Text>
          </View>
        )}
      </View>
    );
  }, [toggleTaken]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Medications</Text>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={medications}
        renderItem={renderMedicationItem}
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconComplete: {
    backgroundColor: '#10B981',
  },
  statusIconPartial: {
    backgroundColor: '#FEF3C7',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dosageText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  instructionsText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  timesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  timeSlotTaken: {
    backgroundColor: '#DCFCE7',
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeTextTaken: {
    color: '#166534',
  },
  refillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  refillText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

/**
 * Generates VitalStats component
 */
export function generateVitalStats(options: MedicalOptions = {}): string {
  const { componentName = 'VitalStats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VitalStat {
  label: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

const ${componentName}: React.FC = () => {
  const vitals: VitalStat[] = [
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: 'heart', color: '#EF4444', trend: 'stable', lastUpdated: 'Today, 8:00 AM' },
    { label: 'Heart Rate', value: '72', unit: 'BPM', icon: 'pulse', color: '#EC4899', trend: 'down', lastUpdated: 'Today, 8:00 AM' },
    { label: 'Blood Sugar', value: '95', unit: 'mg/dL', icon: 'water', color: '#8B5CF6', trend: 'stable', lastUpdated: 'Today, 7:30 AM' },
    { label: 'Weight', value: '165', unit: 'lbs', icon: 'fitness', color: '#10B981', trend: 'down', lastUpdated: 'Yesterday' },
    { label: 'Temperature', value: '98.6', unit: '°F', icon: 'thermometer', color: '#F59E0B', trend: 'stable', lastUpdated: 'Today, 8:00 AM' },
    { label: 'Oxygen Level', value: '98', unit: '%', icon: 'cloud', color: '#3B82F6', trend: 'stable', lastUpdated: 'Today, 8:00 AM' },
  ];

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return 'arrow-up';
    if (trend === 'down') return 'arrow-down';
    return 'remove';
  };

  const getTrendColor = (trend?: string) => {
    if (trend === 'up') return '#EF4444';
    if (trend === 'down') return '#10B981';
    return '#6B7280';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>My Vitals</Text>

      <View style={styles.grid}>
        {vitals.map((vital, index) => (
          <View key={index} style={styles.vitalCard}>
            <View style={[styles.iconContainer, { backgroundColor: vital.color + '20' }]}>
              <Ionicons name={vital.icon as any} size={24} color={vital.color} />
            </View>
            <Text style={styles.vitalLabel}>{vital.label}</Text>
            <View style={styles.valueRow}>
              <Text style={styles.vitalValue}>{vital.value}</Text>
              <Text style={styles.vitalUnit}>{vital.unit}</Text>
            </View>
            <View style={styles.trendRow}>
              <Ionicons
                name={getTrendIcon(vital.trend) as any}
                size={12}
                color={getTrendColor(vital.trend)}
              />
              <Text style={styles.lastUpdated}>{vital.lastUpdated}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginVertical: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 16,
  },
  vitalCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  vitalLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  vitalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  vitalUnit: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  lastUpdated: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}
