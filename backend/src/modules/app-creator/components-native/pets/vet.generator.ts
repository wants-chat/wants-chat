/**
 * Veterinary Component Generators (React Native)
 *
 * Generates components for veterinary clinics:
 * - PetProfile: Complete pet medical profile for vet context
 * - OwnerProfile: Pet owner profile with their pets
 */

export interface PetProfileVetOptions {
  componentName?: string;
  endpoint?: string;
}

export interface OwnerProfileOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate PetProfile component for veterinary context (React Native)
 */
export function generatePetProfile(options: PetProfileVetOptions = {}): string {
  const {
    componentName = 'PetProfile',
    endpoint = '/vet/pets',
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Vaccination {
  id: string;
  name: string;
  date: string;
  expiry_date?: string;
  batch_number?: string;
  administered_by?: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  type: 'checkup' | 'surgery' | 'illness' | 'injury' | 'emergency' | 'dental' | 'lab_work';
  diagnosis: string;
  treatment: string;
  notes?: string;
  doctor_name: string;
  follow_up_date?: string;
}

interface VetPetData {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'reptile' | 'other';
  breed: string;
  age: number;
  date_of_birth?: string;
  weight?: number;
  size?: 'small' | 'medium' | 'large';
  color: string;
  gender: 'male' | 'female';
  avatar_url?: string;
  microchip_id?: string;
  is_neutered?: boolean;
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  current_medications?: {
    name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string;
    notes?: string;
  }[];
  vaccinations?: Vaccination[];
  medical_history?: MedicalRecord[];
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  insurance?: {
    provider: string;
    policy_number: string;
    coverage_type?: string;
    expires_at?: string;
  };
  dietary_notes?: string;
  behavioral_notes?: string;
  special_handling?: string;
  last_visit?: string;
  next_appointment?: string;
}

interface ${componentName}Props {
  petId?: string;
}

const visitTypeConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  checkup: { color: '#2563EB', bgColor: '#DBEAFE', label: 'Checkup' },
  surgery: { color: '#DC2626', bgColor: '#FEE2E2', label: 'Surgery' },
  illness: { color: '#EA580C', bgColor: '#FFEDD5', label: 'Illness' },
  injury: { color: '#D97706', bgColor: '#FEF3C7', label: 'Injury' },
  emergency: { color: '#7C3AED', bgColor: '#EDE9FE', label: 'Emergency' },
  dental: { color: '#059669', bgColor: '#D1FAE5', label: 'Dental' },
  lab_work: { color: '#4F46E5', bgColor: '#E0E7FF', label: 'Lab Work' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ petId: propPetId }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const routePetId = (route.params as { id?: string })?.id;
  const petId = propPetId || routePetId;

  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [showAllVaccinations, setShowAllVaccinations] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const { data: pet, isLoading } = useQuery({
    queryKey: ['vet-pet', petId],
    queryFn: async () => {
      const response = await api.get<VetPetData>('${endpoint}/' + petId);
      return response?.data || response;
    },
    enabled: !!petId,
  });

  const handlePhonePress = (phone: string) => {
    Linking.openURL('tel:' + phone);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL('mailto:' + email);
  };

  const isVaccinationExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isVaccinationExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry > new Date();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Pet not found</Text>
      </View>
    );
  }

  const displayedVaccinations = showAllVaccinations
    ? pet.vaccinations
    : pet.vaccinations?.slice(0, 5);

  const displayedHistory = showAllHistory
    ? pet.medical_history
    : pet.medical_history?.slice(0, 5);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Pet Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.petHeaderRow}>
          {pet.avatar_url ? (
            <Image source={{ uri: pet.avatar_url }} style={styles.petAvatar} />
          ) : (
            <View style={styles.petAvatarPlaceholder}>
              <Ionicons name="paw" size={48} color="#3B82F6" />
            </View>
          )}
          <View style={styles.petHeaderInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.petName}>{pet.name}</Text>
              <View style={[
                styles.genderBadge,
                { backgroundColor: pet.gender === 'male' ? '#DBEAFE' : '#FCE7F3' }
              ]}>
                <Text style={[
                  styles.genderText,
                  { color: pet.gender === 'male' ? '#1D4ED8' : '#DB2777' }
                ]}>
                  {pet.gender}
                </Text>
              </View>
              {pet.is_neutered && (
                <View style={styles.neuteredBadge}>
                  <Text style={styles.neuteredText}>
                    {pet.gender === 'male' ? 'Neutered' : 'Spayed'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.petBreed}>{pet.breed}</Text>
            <View style={styles.petMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  {pet.age} years
                  {pet.date_of_birth && ' (' + new Date(pet.date_of_birth).toLocaleDateString() + ')'}
                </Text>
              </View>
              {pet.weight && (
                <View style={styles.metaItem}>
                  <Ionicons name="fitness-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{pet.weight} lbs</Text>
                </View>
              )}
              {pet.blood_type && (
                <Text style={styles.metaText}>Blood Type: {pet.blood_type}</Text>
              )}
            </View>
            {pet.microchip_id && (
              <Text style={styles.microchipText}>Microchip: {pet.microchip_id}</Text>
            )}
          </View>
        </View>

        {/* Appointment Info */}
        {pet.next_appointment && (
          <View style={styles.appointmentBox}>
            <View style={styles.appointmentHeader}>
              <Ionicons name="time-outline" size={16} color="#059669" />
              <Text style={styles.appointmentLabel}>Next Appointment</Text>
            </View>
            <Text style={styles.appointmentDate}>
              {new Date(pet.next_appointment).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}
        {pet.last_visit && (
          <Text style={styles.lastVisitText}>
            Last visit: {new Date(pet.last_visit).toLocaleDateString()}
          </Text>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('NewAppointment' as never, { petId } as never)}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>New Appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('EditPet' as never, { id: petId } as never)}
          >
            <Ionicons name="create-outline" size={18} color="#374151" />
            <Text style={styles.secondaryButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Critical Info Alert */}
      {(pet.allergies?.length || pet.chronic_conditions?.length || pet.special_handling) && (
        <View style={styles.criticalInfoCard}>
          {pet.allergies && pet.allergies.length > 0 && (
            <View style={styles.criticalSection}>
              <View style={styles.criticalHeader}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.criticalTitle}>Allergies</Text>
              </View>
              <View style={styles.tagList}>
                {pet.allergies.map((allergy, i) => (
                  <View key={i} style={styles.allergyTag}>
                    <Text style={styles.allergyTagText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {pet.chronic_conditions && pet.chronic_conditions.length > 0 && (
            <View style={styles.criticalSection}>
              <View style={styles.criticalHeader}>
                <Ionicons name="heart" size={16} color="#EA580C" />
                <Text style={styles.criticalTitleOrange}>Chronic Conditions</Text>
              </View>
              <View style={styles.tagList}>
                {pet.chronic_conditions.map((condition, i) => (
                  <View key={i} style={styles.conditionTag}>
                    <Text style={styles.conditionTagText}>{condition}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {pet.special_handling && (
            <View style={styles.criticalSection}>
              <View style={styles.criticalHeader}>
                <Ionicons name="warning" size={16} color="#DC2626" />
                <Text style={styles.criticalTitle}>Special Handling</Text>
              </View>
              <Text style={styles.specialHandlingText}>{pet.special_handling}</Text>
            </View>
          )}
        </View>
      )}

      {/* Vaccinations */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="medkit" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Vaccinations</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewVaccination' as never, { petId } as never)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {pet.vaccinations && pet.vaccinations.length > 0 ? (
          <>
            {displayedVaccinations?.map((vax) => {
              const expired = isVaccinationExpired(vax.expiry_date);
              const expiringSoon = isVaccinationExpiringSoon(vax.expiry_date);

              return (
                <View
                  key={vax.id}
                  style={[
                    styles.vaccinationItem,
                    expired && styles.vaccinationExpired,
                    expiringSoon && !expired && styles.vaccinationExpiringSoon,
                  ]}
                >
                  <View style={styles.vaccinationInfo}>
                    <Text style={styles.vaccinationName}>{vax.name}</Text>
                    <Text style={styles.vaccinationDate}>
                      Given: {new Date(vax.date).toLocaleDateString()}
                    </Text>
                    {vax.expiry_date && (
                      <Text style={styles.vaccinationExpiry}>
                        Expires: {new Date(vax.expiry_date).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  {vax.expiry_date && (
                    <View style={[
                      styles.vaccinationStatus,
                      {
                        backgroundColor: expired ? '#FEE2E2' :
                          expiringSoon ? '#FEF3C7' : '#D1FAE5'
                      }
                    ]}>
                      <Text style={[
                        styles.vaccinationStatusText,
                        {
                          color: expired ? '#DC2626' :
                            expiringSoon ? '#D97706' : '#059669'
                        }
                      ]}>
                        {expired ? 'Expired' : expiringSoon ? 'Expiring' : 'Valid'}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
            {pet.vaccinations.length > 5 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllVaccinations(!showAllVaccinations)}
              >
                <Text style={styles.showMoreText}>
                  {showAllVaccinations ? 'Show Less' : 'Show All (' + pet.vaccinations.length + ')'}
                </Text>
                <Ionicons
                  name={showAllVaccinations ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#3B82F6"
                />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.emptyListText}>No vaccinations recorded</Text>
        )}
      </View>

      {/* Current Medications */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flask" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Current Medications</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewMedication' as never, { petId } as never)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

        {pet.current_medications && pet.current_medications.length > 0 ? (
          pet.current_medications.map((med, i) => (
            <View key={i} style={styles.medicationItem}>
              <Text style={styles.medicationName}>{med.name}</Text>
              <Text style={styles.medicationDosage}>{med.dosage} - {med.frequency}</Text>
              <Text style={styles.medicationDates}>
                Started: {new Date(med.start_date).toLocaleDateString()}
                {med.end_date && ' - Ends: ' + new Date(med.end_date).toLocaleDateString()}
              </Text>
              {med.notes && <Text style={styles.medicationNotes}>{med.notes}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.emptyListText}>No current medications</Text>
        )}
      </View>

      {/* Medical History */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="document-text" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Medical History</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewRecord' as never, { petId } as never)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {pet.medical_history && pet.medical_history.length > 0 ? (
          <>
            {displayedHistory?.map((record) => {
              const typeConfig = visitTypeConfig[record.type] || visitTypeConfig.checkup;
              const isExpanded = expandedRecordId === record.id;

              return (
                <TouchableOpacity
                  key={record.id}
                  style={styles.recordItem}
                  onPress={() => setExpandedRecordId(isExpanded ? null : record.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.recordHeader}>
                    <View style={[styles.recordTypeBadge, { backgroundColor: typeConfig.bgColor }]}>
                      <Text style={[styles.recordTypeText, { color: typeConfig.color }]}>
                        {typeConfig.label}
                      </Text>
                    </View>
                    <Text style={styles.recordDate}>
                      {new Date(record.date).toLocaleDateString()}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#6B7280"
                    />
                  </View>
                  <Text style={styles.recordDiagnosis}>{record.diagnosis}</Text>
                  <Text style={styles.recordDoctor}>Dr. {record.doctor_name}</Text>

                  {isExpanded && (
                    <View style={styles.recordExpandedContent}>
                      <View style={styles.recordDetailGroup}>
                        <Text style={styles.recordDetailLabel}>Treatment</Text>
                        <Text style={styles.recordDetailText}>{record.treatment}</Text>
                      </View>
                      {record.notes && (
                        <View style={styles.recordDetailGroup}>
                          <Text style={styles.recordDetailLabel}>Notes</Text>
                          <Text style={styles.recordDetailText}>{record.notes}</Text>
                        </View>
                      )}
                      {record.follow_up_date && (
                        <View style={styles.followUpBox}>
                          <Text style={styles.followUpText}>
                            Follow-up: {new Date(record.follow_up_date).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            {pet.medical_history.length > 5 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllHistory(!showAllHistory)}
              >
                <Text style={styles.showMoreText}>
                  {showAllHistory ? 'Show Less' : 'Show All (' + pet.medical_history.length + ')'}
                </Text>
                <Ionicons
                  name={showAllHistory ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#3B82F6"
                />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.emptyListText}>No medical history recorded</Text>
        )}
      </View>

      {/* Owner Information */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="person" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Owner Information</Text>
        </View>
        <Text style={styles.ownerName}>{pet.owner.name}</Text>
        <TouchableOpacity style={styles.contactRow} onPress={() => handleEmailPress(pet.owner.email)}>
          <Ionicons name="mail-outline" size={16} color="#6B7280" />
          <Text style={styles.contactText}>{pet.owner.email}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow} onPress={() => handlePhonePress(pet.owner.phone)}>
          <Ionicons name="call-outline" size={16} color="#6B7280" />
          <Text style={styles.contactText}>{pet.owner.phone}</Text>
        </TouchableOpacity>
        {pet.owner.address && (
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.contactText}>{pet.owner.address}</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate('OwnerProfile' as never, { id: pet.owner.id } as never)}
        >
          <Text style={styles.viewOwnerLink}>View owner profile</Text>
        </TouchableOpacity>
      </View>

      {/* Insurance */}
      {pet.insurance && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Insurance</Text>
          </View>
          <Text style={styles.insuranceProvider}>{pet.insurance.provider}</Text>
          <Text style={styles.insurancePolicy}>Policy: {pet.insurance.policy_number}</Text>
          {pet.insurance.coverage_type && (
            <Text style={styles.insuranceDetail}>Coverage: {pet.insurance.coverage_type}</Text>
          )}
          {pet.insurance.expires_at && (
            <Text style={styles.insuranceDetail}>
              Expires: {new Date(pet.insurance.expires_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Additional Notes */}
      {(pet.dietary_notes || pet.behavioral_notes) && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          {pet.dietary_notes && (
            <View style={styles.noteGroup}>
              <Text style={styles.noteLabel}>Dietary Notes</Text>
              <Text style={styles.noteText}>{pet.dietary_notes}</Text>
            </View>
          )}
          {pet.behavioral_notes && (
            <View style={styles.noteGroup}>
              <Text style={styles.noteLabel}>Behavioral Notes</Text>
              <Text style={styles.noteText}>{pet.behavioral_notes}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.bottomPadding} />
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
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerCard: {
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
  petHeaderRow: {
    flexDirection: 'row',
    gap: 16,
  },
  petAvatar: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  petAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petHeaderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  petName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  genderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genderText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  neuteredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  neuteredText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  petBreed: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  petMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  microchipText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  appointmentBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  appointmentLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#059669',
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  lastVisitText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  criticalInfoCard: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  criticalSection: {
    marginBottom: 12,
  },
  criticalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  criticalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  criticalTitleOrange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EA580C',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  allergyTagText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  conditionTag: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionTagText: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: '500',
  },
  specialHandlingText: {
    fontSize: 13,
    color: '#DC2626',
  },
  sectionCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  vaccinationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  vaccinationExpired: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  vaccinationExpiringSoon: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  vaccinationInfo: {
    flex: 1,
  },
  vaccinationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  vaccinationDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  vaccinationExpiry: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  vaccinationStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vaccinationStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  medicationItem: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  medicationDosage: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4,
  },
  medicationDates: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  medicationNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  recordItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recordTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordTypeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  recordDate: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  recordDiagnosis: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  recordDoctor: {
    fontSize: 12,
    color: '#6B7280',
  },
  recordExpandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  recordDetailGroup: {
    marginBottom: 8,
  },
  recordDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  recordDetailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  followUpBox: {
    backgroundColor: '#DBEAFE',
    padding: 10,
    borderRadius: 8,
  },
  followUpText: {
    fontSize: 13,
    color: '#1D4ED8',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
  emptyListText: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 16,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
  },
  viewOwnerLink: {
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 8,
  },
  insuranceProvider: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginTop: 12,
  },
  insurancePolicy: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4,
  },
  insuranceDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  noteGroup: {
    marginTop: 12,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: '#6B7280',
  },
  bottomPadding: {
    height: 24,
  },
});

export default ${componentName};
`;
}

/**
 * Generate OwnerProfile component (React Native)
 */
export function generateOwnerProfile(options: OwnerProfileOptions = {}): string {
  const {
    componentName = 'OwnerProfile',
    endpoint = '/vet/owners',
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface PetSummary {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  avatar_url?: string;
  last_visit?: string;
  next_appointment?: string;
  has_overdue_vaccinations?: boolean;
  active_conditions?: string[];
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  pet_name: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  pet_name: string;
  type: string;
  doctor: string;
}

interface OwnerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  avatar_url?: string;
  date_joined?: string;
  preferred_contact?: 'email' | 'phone' | 'text';
  notes?: string;
  pets: PetSummary[];
  payment_method?: {
    type: 'card' | 'bank';
    last4: string;
    brand?: string;
  };
  outstanding_balance?: number;
  total_spent?: number;
  visit_count?: number;
  recent_invoices?: Invoice[];
  upcoming_appointments?: Appointment[];
}

interface ${componentName}Props {
  ownerId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ ownerId: propOwnerId }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const routeOwnerId = (route.params as { id?: string })?.id;
  const ownerId = propOwnerId || routeOwnerId;

  const [activeTab, setActiveTab] = useState<'pets' | 'appointments' | 'billing'>('pets');

  const { data: owner, isLoading } = useQuery({
    queryKey: ['vet-owner', ownerId],
    queryFn: async () => {
      const response = await api.get<OwnerData>('${endpoint}/' + ownerId);
      return response?.data || response;
    },
    enabled: !!ownerId,
  });

  const handlePhonePress = (phone: string) => {
    Linking.openURL('tel:' + phone);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL('mailto:' + email);
  };

  const getInvoiceStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      paid: { bg: '#D1FAE5', text: '#059669' },
      pending: { bg: '#FEF3C7', text: '#D97706' },
      overdue: { bg: '#FEE2E2', text: '#DC2626' },
    };
    return colors[status] || colors.pending;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!owner) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Owner not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Owner Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.ownerHeaderRow}>
          {owner.avatar_url ? (
            <Image source={{ uri: owner.avatar_url }} style={styles.ownerAvatar} />
          ) : (
            <View style={styles.ownerAvatarPlaceholder}>
              <Ionicons name="person" size={40} color="#3B82F6" />
            </View>
          )}
          <View style={styles.ownerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.ownerName}>{owner.name}</Text>
              {owner.preferred_contact && (
                <View style={styles.preferredBadge}>
                  <Text style={styles.preferredText}>Prefers {owner.preferred_contact}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.contactItem} onPress={() => handleEmailPress(owner.email)}>
              <Ionicons name="mail-outline" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{owner.email}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => handlePhonePress(owner.phone)}>
              <Ionicons name="call-outline" size={16} color="#6B7280" />
              <Text style={styles.contactText}>
                {owner.phone}
                {owner.alternate_phone && ' / ' + owner.alternate_phone}
              </Text>
            </TouchableOpacity>

            {owner.address && (
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.contactText}>
                  {owner.address}
                  {owner.city && ', ' + owner.city}
                  {owner.state && ', ' + owner.state}
                  {owner.zip && ' ' + owner.zip}
                </Text>
              </View>
            )}

            {owner.date_joined && (
              <Text style={styles.joinedText}>
                Client since {new Date(owner.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{owner.pets.length}</Text>
            <Text style={styles.statLabel}>Pets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{owner.visit_count || 0}</Text>
            <Text style={styles.statLabel}>Visits</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ${owner.total_spent ? (owner.total_spent / 1000).toFixed(1) + 'k' : '0'}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Outstanding Balance Alert */}
        {owner.outstanding_balance && owner.outstanding_balance > 0 && (
          <View style={styles.balanceAlert}>
            <View style={styles.balanceInfo}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.balanceText}>
                Outstanding balance: <Text style={styles.balanceAmount}>${owner.outstanding_balance.toFixed(2)}</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.collectButton}>
              <Text style={styles.collectButtonText}>Collect</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('NewAppointment' as never, { ownerId } as never)}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>New Appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('NewPet' as never, { ownerId } as never)}
          >
            <Ionicons name="paw-outline" size={18} color="#374151" />
            <Text style={styles.secondaryButtonText}>Add Pet</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['pets', 'appointments', 'billing'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'pets' && (
        <View style={styles.tabContent}>
          {owner.pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={styles.petCard}
              onPress={() => navigation.navigate('PetProfile' as never, { id: pet.id } as never)}
            >
              <View style={styles.petInfoRow}>
                {pet.avatar_url ? (
                  <Image source={{ uri: pet.avatar_url }} style={styles.petAvatar} />
                ) : (
                  <View style={styles.petAvatarPlaceholder}>
                    <Ionicons name="paw" size={24} color="#3B82F6" />
                  </View>
                )}
                <View style={styles.petDetails}>
                  <View style={styles.petNameRow}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    {pet.has_overdue_vaccinations && (
                      <Ionicons name="alert-circle" size={14} color="#DC2626" />
                    )}
                  </View>
                  <Text style={styles.petBreed}>{pet.breed}</Text>
                  <Text style={styles.petAge}>{pet.age} years old</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>

              {pet.active_conditions && pet.active_conditions.length > 0 && (
                <View style={styles.conditionsList}>
                  {pet.active_conditions.map((condition, i) => (
                    <View key={i} style={styles.conditionTag}>
                      <Text style={styles.conditionTagText}>{condition}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.petFooter}>
                {pet.last_visit && (
                  <Text style={styles.petFooterText}>
                    Last visit: {new Date(pet.last_visit).toLocaleDateString()}
                  </Text>
                )}
                {pet.next_appointment && (
                  <Text style={styles.petFooterLink}>
                    Next: {new Date(pet.next_appointment).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeTab === 'appointments' && (
        <View style={styles.tabContent}>
          {owner.upcoming_appointments && owner.upcoming_appointments.length > 0 ? (
            owner.upcoming_appointments.map((apt) => (
              <TouchableOpacity
                key={apt.id}
                style={styles.appointmentCard}
                onPress={() => navigation.navigate('AppointmentDetail' as never, { id: apt.id } as never)}
              >
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentPet}>{apt.pet_name}</Text>
                  <Text style={styles.appointmentType}>{apt.type} with Dr. {apt.doctor}</Text>
                </View>
                <View style={styles.appointmentDateTime}>
                  <Text style={styles.appointmentDate}>
                    {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.appointmentTime}>{apt.time}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyTabContent}>
              <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyTabText}>No upcoming appointments</Text>
            </View>
          )}
        </View>
      )}

      {activeTab === 'billing' && (
        <View style={styles.tabContent}>
          {/* Payment Method */}
          {owner.payment_method && (
            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Ionicons name="card-outline" size={20} color="#374151" />
                <Text style={styles.paymentTitle}>Payment Method</Text>
              </View>
              <View style={styles.paymentInfo}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="card" size={24} color="#6B7280" />
                </View>
                <View>
                  <Text style={styles.paymentMethod}>
                    {owner.payment_method.brand || 'Card'} ending in {owner.payment_method.last4}
                  </Text>
                  <Text style={styles.paymentType}>{owner.payment_method.type}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Recent Invoices */}
          <View style={styles.invoicesCard}>
            <View style={styles.invoicesHeader}>
              <View style={styles.invoicesHeaderLeft}>
                <Ionicons name="document-text-outline" size={20} color="#374151" />
                <Text style={styles.invoicesTitle}>Recent Invoices</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {owner.recent_invoices && owner.recent_invoices.length > 0 ? (
              owner.recent_invoices.map((invoice) => {
                const statusColors = getInvoiceStatusColor(invoice.status);
                return (
                  <TouchableOpacity
                    key={invoice.id}
                    style={styles.invoiceItem}
                    onPress={() => navigation.navigate('InvoiceDetail' as never, { id: invoice.id } as never)}
                  >
                    <View style={styles.invoiceInfo}>
                      <Text style={styles.invoiceDate}>
                        {new Date(invoice.date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.invoicePet}>{invoice.pet_name}</Text>
                    </View>
                    <View style={styles.invoiceRight}>
                      <Text style={styles.invoiceAmount}>${invoice.amount.toFixed(2)}</Text>
                      <View style={[styles.invoiceStatus, { backgroundColor: statusColors.bg }]}>
                        <Text style={[styles.invoiceStatusText, { color: statusColors.text }]}>
                          {invoice.status}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyTabContent}>
                <Ionicons name="receipt-outline" size={40} color="#D1D5DB" />
                <Text style={styles.emptyTabText}>No invoices found</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Notes */}
      {owner.notes && (
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{owner.notes}</Text>
        </View>
      )}

      <View style={styles.bottomPadding} />
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
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerCard: {
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
  ownerHeaderRow: {
    flexDirection: 'row',
    gap: 16,
  },
  ownerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  ownerAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ownerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  preferredBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  preferredText: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  joinedText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  balanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 8,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  balanceText: {
    fontSize: 13,
    color: '#DC2626',
  },
  balanceAmount: {
    fontWeight: '600',
  },
  collectButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  collectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  petInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  petAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  petAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDetails: {
    flex: 1,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  petBreed: {
    fontSize: 13,
    color: '#6B7280',
  },
  petAge: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  conditionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  conditionTag: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conditionTagText: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '500',
  },
  petFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  petFooterText: {
    fontSize: 11,
    color: '#6B7280',
  },
  petFooterLink: {
    fontSize: 11,
    color: '#3B82F6',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentPet: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  appointmentType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  appointmentDateTime: {
    alignItems: 'flex-end',
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  appointmentTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyTabContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTabText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethod: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  paymentType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  invoicesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  invoicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  invoicesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invoicesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 13,
    color: '#3B82F6',
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  invoicePet: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  invoiceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  invoiceStatusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 24,
  },
});

export default ${componentName};
`;
}
