/**
 * Doctor Grid Component Generators (React Native)
 *
 * Generates doctor grid cards, doctor profile, and schedule components.
 */

export interface DoctorGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDoctorGrid(options: DoctorGridOptions = {}): string {
  const { componentName = 'DoctorGrid', endpoint = '/doctors' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar_url?: string;
  rating?: number;
  reviews_count?: number;
  location?: string;
  available?: boolean;
  experience_years?: number;
}

interface ${componentName}Props {
  specialty?: string;
  title?: string;
  onDoctorPress?: (doctor: Doctor) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  specialty,
  title = 'Doctors',
  onDoctorPress,
}) => {
  const navigation = useNavigation();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors', specialty],
    queryFn: async () => {
      const url = specialty
        ? '${endpoint}?specialty=' + encodeURIComponent(specialty)
        : '${endpoint}';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleDoctorPress = (doctor: Doctor) => {
    if (onDoctorPress) {
      onDoctorPress(doctor);
    } else {
      navigation.navigate('DoctorProfile' as never, { id: doctor.id } as never);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const renderDoctor = ({ item: doctor }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => handleDoctorPress(doctor)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {doctor.avatar_url ? (
            <Image source={{ uri: doctor.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={28} color="#3B82F6" />
            </View>
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
        </View>
      </View>

      {doctor.rating && (
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingValue}>{doctor.rating.toFixed(1)}</Text>
          {doctor.reviews_count && (
            <Text style={styles.reviewsCount}>({doctor.reviews_count} reviews)</Text>
          )}
        </View>
      )}

      {doctor.experience_years && (
        <View style={styles.metaRow}>
          <Ionicons name="briefcase-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{doctor.experience_years} years experience</Text>
        </View>
      )}

      {doctor.location && (
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{doctor.location}</Text>
        </View>
      )}

      {doctor.available && (
        <View style={styles.availableBadge}>
          <Ionicons name="calendar-outline" size={14} color="#059669" />
          <Text style={styles.availableText}>Available today</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No doctors found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={doctors}
        renderItem={renderDoctor}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginVertical: 16,
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  doctorCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  specialty: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewsCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  availableText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface DoctorProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDoctorProfile(options: DoctorProfileOptions = {}): string {
  const { componentName = 'DoctorProfile', endpoint = '/doctors' } = options;

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
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar_url?: string;
  rating?: number;
  reviews_count?: number;
  location?: string;
  email?: string;
  phone?: string;
  experience_years?: number;
  qualifications?: string;
  bio?: string;
  available?: boolean;
}

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const handleBookAppointment = () => {
    navigation.navigate('AppointmentForm' as never, { doctor_id: id } as never);
  };

  const handlePhonePress = () => {
    if (doctor?.phone) {
      Linking.openURL('tel:' + doctor.phone);
    }
  };

  const handleEmailPress = () => {
    if (doctor?.email) {
      Linking.openURL('mailto:' + doctor.email);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Doctor not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {doctor.avatar_url ? (
              <Image source={{ uri: doctor.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#FFFFFF" />
              </View>
            )}
          </View>
          <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>

          {doctor.rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#FCD34D" />
              <Text style={styles.ratingValue}>{doctor.rating.toFixed(1)}</Text>
              {doctor.reviews_count && (
                <Text style={styles.reviewsCount}>({doctor.reviews_count} reviews)</Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoSection}>
        {/* Contact Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <View style={styles.infoList}>
            {doctor.email && (
              <TouchableOpacity style={styles.infoRow} onPress={handleEmailPress}>
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{doctor.email}</Text>
              </TouchableOpacity>
            )}
            {doctor.phone && (
              <TouchableOpacity style={styles.infoRow} onPress={handlePhonePress}>
                <Ionicons name="call-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{doctor.phone}</Text>
              </TouchableOpacity>
            )}
            {doctor.location && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{doctor.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Experience */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Experience</Text>
          <View style={styles.infoList}>
            {doctor.experience_years && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{doctor.experience_years} years experience</Text>
              </View>
            )}
            {doctor.qualifications && (
              <View style={styles.infoRow}>
                <Ionicons name="ribbon-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{doctor.qualifications}</Text>
              </View>
            )}
          </View>
        </View>

        {/* About */}
        {doctor.bio && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.bioText}>{doctor.bio}</Text>
          </View>
        )}

        {/* Availability */}
        {doctor.available && (
          <View style={styles.availabilityCard}>
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
            <View>
              <Text style={styles.availabilityTitle}>Available for Appointments</Text>
              <Text style={styles.availabilityMeta}>Book your visit today</Text>
            </View>
          </View>
        )}
      </View>

      {/* Book Appointment Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
          <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
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
  headerGradient: {
    backgroundColor: '#3B82F6',
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewsCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  infoSection: {
    padding: 16,
    marginTop: -16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoList: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  bioText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  availabilityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  availabilityMeta: {
    fontSize: 13,
    color: '#10B981',
    marginTop: 2,
  },
  bottomSection: {
    padding: 16,
    paddingBottom: 32,
  },
  bookButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export interface DoctorScheduleOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDoctorSchedule(options: DoctorScheduleOptions = {}): string {
  const { componentName = 'DoctorSchedule', endpoint = '/schedules' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ScheduleDay {
  day: string;
  available?: boolean;
  start_time?: string;
  end_time?: string;
}

interface DoctorScheduleProps {
  doctorId?: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ${componentName}: React.FC<DoctorScheduleProps> = ({ doctorId }) => {
  const route = useRoute();
  const routeDoctorId = (route.params as { id?: string })?.id;
  const id = doctorId || routeDoctorId;

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?doctor_id=' + id);
      return response?.data || response;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const getScheduleForDay = (day: string): ScheduleDay | null => {
    if (!schedule) return null;

    // Handle object-style schedule (e.g., { monday: { start_time, end_time } })
    if (schedule[day.toLowerCase()]) {
      const daySchedule = schedule[day.toLowerCase()];
      return {
        day,
        available: daySchedule.available !== false,
        start_time: daySchedule.start_time,
        end_time: daySchedule.end_time,
      };
    }

    // Handle array-style schedule
    if (Array.isArray(schedule)) {
      const found = schedule.find((s: ScheduleDay) => s.day === day);
      return found || null;
    }

    return null;
  };

  const renderDayItem = ({ item: day }: { item: string }) => {
    const daySchedule = getScheduleForDay(day);
    const isAvailable = daySchedule && daySchedule.available !== false;
    const startTime = daySchedule?.start_time || '9:00 AM';
    const endTime = daySchedule?.end_time || '5:00 PM';

    return (
      <View style={styles.dayCard}>
        <View style={styles.dayInfo}>
          <Text style={styles.dayName}>{day}</Text>
        </View>
        {isAvailable ? (
          <View style={styles.availableRow}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text style={styles.availableTime}>
              {startTime} - {endTime}
            </Text>
          </View>
        ) : (
          <View style={styles.closedRow}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={22} color="#374151" />
        <Text style={styles.title}>Working Hours</Text>
      </View>
      <FlatList
        data={DAYS_OF_WEEK}
        renderItem={renderDayItem}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    paddingVertical: 4,
  },
  dayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availableTime: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  closedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closedText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}
