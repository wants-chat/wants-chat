/**
 * Patient Profile Component Generators (React Native)
 *
 * Generates patient profile card with avatar, vitals display,
 * and medical history timeline using FlatList.
 */

export interface PatientProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePatientProfile(options: PatientProfileOptions = {}): string {
  const { componentName = 'PatientProfile', endpoint = '/patients' } = options;

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
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Patient not found</Text>
      </View>
    );
  }

  const handlePhonePress = () => {
    if (patient.phone) {
      Linking.openURL('tel:' + patient.phone);
    }
  };

  const handleEmailPress = () => {
    if (patient.email) {
      Linking.openURL('mailto:' + patient.email);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Patient Info Card */}
      <View style={styles.profileCard}>
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            {patient.avatar_url ? (
              <Image source={{ uri: patient.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#3B82F6" />
              </View>
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientId}>
              Patient ID: {patient.patient_id || patient.id}
            </Text>
            {patient.date_of_birth && (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  DOB: {formatDate(patient.date_of_birth)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          {patient.email && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <Ionicons name="mail-outline" size={18} color="#6B7280" />
              <Text style={styles.contactText}>{patient.email}</Text>
            </TouchableOpacity>
          )}
          {patient.phone && (
            <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
              <Ionicons name="call-outline" size={18} color="#6B7280" />
              <Text style={styles.contactText}>{patient.phone}</Text>
            </TouchableOpacity>
          )}
          {patient.address && (
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text style={styles.contactText}>{patient.address}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Vitals Section */}
      {patient.vitals && (
        <View style={styles.vitalsCard}>
          <Text style={styles.sectionTitle}>Current Vitals</Text>
          <View style={styles.vitalsGrid}>
            {patient.vitals.blood_pressure && (
              <View style={styles.vitalItem}>
                <Ionicons name="heart-outline" size={24} color="#EF4444" />
                <Text style={styles.vitalValue}>{patient.vitals.blood_pressure}</Text>
                <Text style={styles.vitalLabel}>Blood Pressure</Text>
              </View>
            )}
            {patient.vitals.heart_rate && (
              <View style={styles.vitalItem}>
                <Ionicons name="pulse-outline" size={24} color="#F59E0B" />
                <Text style={styles.vitalValue}>{patient.vitals.heart_rate} bpm</Text>
                <Text style={styles.vitalLabel}>Heart Rate</Text>
              </View>
            )}
            {patient.vitals.temperature && (
              <View style={styles.vitalItem}>
                <Ionicons name="thermometer-outline" size={24} color="#10B981" />
                <Text style={styles.vitalValue}>{patient.vitals.temperature}</Text>
                <Text style={styles.vitalLabel}>Temperature</Text>
              </View>
            )}
            {patient.vitals.weight && (
              <View style={styles.vitalItem}>
                <Ionicons name="fitness-outline" size={24} color="#3B82F6" />
                <Text style={styles.vitalValue}>{patient.vitals.weight}</Text>
                <Text style={styles.vitalLabel}>Weight</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Allergies Alert */}
      {patient.allergies && patient.allergies.length > 0 && (
        <View style={styles.allergiesCard}>
          <View style={styles.allergiesHeader}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.allergiesTitle}>Allergies</Text>
          </View>
          <View style={styles.allergiesList}>
            {patient.allergies.map((allergy: string, index: number) => (
              <View key={index} style={styles.allergyTag}>
                <Text style={styles.allergyText}>{allergy}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Emergency Contact */}
      {patient.emergency_contact && (
        <View style={styles.emergencyCard}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <Text style={styles.emergencyName}>{patient.emergency_contact.name}</Text>
          <Text style={styles.emergencyMeta}>{patient.emergency_contact.phone}</Text>
          <Text style={styles.emergencyMeta}>{patient.emergency_contact.relationship}</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#DBEAFE',
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
  headerInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
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
  },
  vitalsCard: {
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalItem: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  allergiesCard: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  allergiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  allergiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allergyText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  emergencyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emergencyName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  emergencyMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface MedicalHistoryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMedicalHistory(options: MedicalHistoryOptions = {}): string {
  const { componentName = 'MedicalHistory', endpoint = '/medical-history' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface MedicalRecord {
  id: string;
  diagnosis?: string;
  title?: string;
  type?: string;
  description?: string;
  date?: string;
  created_at?: string;
  doctor_name?: string;
  prescriptions?: Array<{ name: string } | string>;
}

interface ${componentName}Props {
  patientId?: string;
  onRecordPress?: (record: MedicalRecord) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ patientId, onRecordPress }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const routePatientId = (route.params as { id?: string })?.id;
  const id = patientId || routePatientId;

  const { data: records, isLoading } = useQuery({
    queryKey: ['medical-history', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?patient_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'surgery':
        return 'medical';
      case 'lab':
        return 'flask';
      case 'imaging':
        return 'scan';
      case 'prescription':
        return 'medkit';
      default:
        return 'document-text';
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'surgery':
        return '#DC2626';
      case 'lab':
        return '#7C3AED';
      case 'imaging':
        return '#0EA5E9';
      case 'prescription':
        return '#10B981';
      default:
        return '#3B82F6';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const renderRecord = ({ item, index }: { item: MedicalRecord; index: number }) => {
    const isLast = index === (records?.length || 0) - 1;
    const typeColor = getTypeColor(item.type);

    return (
      <TouchableOpacity
        style={styles.recordItem}
        onPress={() => onRecordPress?.(item)}
        activeOpacity={0.7}
      >
        {/* Timeline */}
        <View style={styles.timeline}>
          <View style={[styles.timelineDot, { backgroundColor: typeColor }]}>
            <Ionicons name={getTypeIcon(item.type) as any} size={14} color="#FFFFFF" />
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        {/* Content */}
        <View style={styles.recordContent}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>{item.diagnosis || item.title}</Text>
            <Text style={styles.recordDate}>
              {formatDate(item.date || item.created_at || '')}
            </Text>
          </View>

          {item.type && (
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
              <Text style={[styles.typeText, { color: typeColor }]}>{item.type}</Text>
            </View>
          )}

          {item.description && (
            <Text style={styles.recordDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          {item.doctor_name && (
            <View style={styles.doctorRow}>
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text style={styles.doctorName}>Dr. {item.doctor_name}</Text>
            </View>
          )}

          {item.prescriptions && item.prescriptions.length > 0 && (
            <View style={styles.prescriptionsList}>
              {item.prescriptions.map((rx, i) => (
                <View key={i} style={styles.prescriptionTag}>
                  <Ionicons name="medkit-outline" size={12} color="#059669" />
                  <Text style={styles.prescriptionText}>
                    {typeof rx === 'string' ? rx : rx.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No medical records found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical History</Text>
      </View>
      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
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
  },
  recordItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timeline: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: 4,
  },
  recordContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  recordDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recordDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 13,
    color: '#6B7280',
  },
  prescriptionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  prescriptionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prescriptionText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
