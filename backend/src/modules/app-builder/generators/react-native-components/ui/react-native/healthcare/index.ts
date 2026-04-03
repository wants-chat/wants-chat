/**
 * Healthcare Component Generators for React Native
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Appointment Booking Form
export function generateRNAppointmentBookingForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface AppointmentBookingFormProps {
  doctors: Doctor[];
  availableSlots: TimeSlot[];
  onBook?: (data: any) => void;
  onSuccess?: (data: any) => void;
}

export default function AppointmentBookingForm({ doctors, availableSlots, onBook, onSuccess }: AppointmentBookingFormProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [reason, setReason] = useState('');
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'video'>('in-person');
  const queryClient = useQueryClient();

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/appointments\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to book appointment');
      }
      return response.json();
    },
    onSuccess: (responseData) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      Alert.alert('Success', 'Appointment booked successfully!', [
        { text: 'OK', onPress: () => onSuccess?.(responseData) }
      ]);
      // Reset form
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedSlot('');
      setReason('');
      setAppointmentType('in-person');
    },
    onError: (error: any) => {
      Alert.alert('Booking Failed', error?.message || 'Unable to book appointment. Please try again.');
    },
  });

  const handleBook = () => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor');
      return;
    }
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    const bookingData = {
      doctor_id: selectedDoctor,
      date: selectedDate,
      slot_id: selectedSlot,
      reason,
      type: appointmentType
    };

    // Call optional callback
    onBook?.(bookingData);

    // Submit via mutation
    bookingMutation.mutate(bookingData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Select Doctor</Text>
      <FlatList
        data={doctors}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.doctorCard, selectedDoctor === item.id && styles.doctorCardSelected]}
            onPress={() => setSelectedDoctor(item.id)}
          >
            <View style={styles.doctorAvatar}>
              <Ionicons name="person" size={24} color={selectedDoctor === item.id ? '#fff' : '#6b7280'} />
            </View>
            <Text style={[styles.doctorName, selectedDoctor === item.id && styles.textSelected]}>{item.name}</Text>
            <Text style={[styles.doctorSpecialty, selectedDoctor === item.id && styles.textSelectedLight]}>{item.specialty}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.doctorsList}
      />

      <Text style={styles.sectionTitle}>Appointment Type</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, appointmentType === 'in-person' && styles.typeBtnActive]}
          onPress={() => setAppointmentType('in-person')}
        >
          <Ionicons name="location" size={20} color={appointmentType === 'in-person' ? '#fff' : '#6b7280'} />
          <Text style={[styles.typeText, appointmentType === 'in-person' && styles.typeTextActive]}>In-Person</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, appointmentType === 'video' && styles.typeBtnActive]}
          onPress={() => setAppointmentType('video')}
        >
          <Ionicons name="videocam" size={20} color={appointmentType === 'video' ? '#fff' : '#6b7280'} />
          <Text style={[styles.typeText, appointmentType === 'video' && styles.typeTextActive]}>Video Call</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Select Date</Text>
      <View style={styles.dateInput}>
        <Ionicons name="calendar" size={20} color="#6b7280" />
        <TextInput
          style={styles.input}
          placeholder="Select date"
          value={selectedDate}
          onChangeText={setSelectedDate}
        />
      </View>

      <Text style={styles.sectionTitle}>Available Time Slots</Text>
      <View style={styles.slotsGrid}>
        {availableSlots.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.slotBtn,
              !slot.available && styles.slotBtnDisabled,
              selectedSlot === slot.id && styles.slotBtnSelected
            ]}
            onPress={() => slot.available && setSelectedSlot(slot.id)}
            disabled={!slot.available}
          >
            <Text style={[
              styles.slotText,
              !slot.available && styles.slotTextDisabled,
              selectedSlot === slot.id && styles.slotTextSelected
            ]}>{slot.time}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Reason for Visit</Text>
      <TextInput
        style={styles.reasonInput}
        placeholder="Describe your symptoms or reason for visit..."
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.bookBtn, bookingMutation.isPending && styles.bookBtnDisabled]}
        onPress={handleBook}
        disabled={bookingMutation.isPending}
      >
        {bookingMutation.isPending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  bookBtnDisabled: { backgroundColor: '#93c5fd' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12, marginTop: 8 },
  doctorsList: { paddingRight: 16 },
  doctorCard: { width: 120, backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginRight: 12, alignItems: 'center' },
  doctorCardSelected: { backgroundColor: '#3b82f6' },
  doctorAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  doctorName: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'center' },
  doctorSpecialty: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  textSelected: { color: '#fff' },
  textSelectedLight: { color: 'rgba(255,255,255,0.8)' },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', paddingVertical: 14, borderRadius: 12, gap: 8 },
  typeBtnActive: { backgroundColor: '#3b82f6' },
  typeText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  typeTextActive: { color: '#fff' },
  dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#111827' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f9fafb', minWidth: 80, alignItems: 'center' },
  slotBtnDisabled: { backgroundColor: '#f3f4f6', opacity: 0.5 },
  slotBtnSelected: { backgroundColor: '#3b82f6' },
  slotText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  slotTextDisabled: { color: '#9ca3af' },
  slotTextSelected: { color: '#fff' },
  reasonInput: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, fontSize: 16, color: '#111827', minHeight: 100 },
  bookBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 32 },
  bookBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: [
      "import React, { useState } from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';",
      "import { useMutation, useQueryClient } from '@tanstack/react-query';",
    ],
  };
}

// Patient Dashboard
export function generateRNPatientDashboard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: 'in-person' | 'video';
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose?: string;
}

interface PatientDashboardProps {
  patientName: string;
  upcomingAppointments: Appointment[];
  medications: Medication[];
  healthScore?: number;
  onScheduleAppointment?: () => void;
  onViewRecords?: () => void;
}

export default function PatientDashboard({
  patientName,
  upcomingAppointments,
  medications,
  healthScore = 85,
  onScheduleAppointment,
  onViewRecords
}: PatientDashboardProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{patientName}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.healthScoreCard}>
        <View style={styles.healthScoreContent}>
          <Text style={styles.healthScoreLabel}>Health Score</Text>
          <Text style={styles.healthScoreValue}>{healthScore}</Text>
          <Text style={styles.healthScoreSubtext}>Good condition</Text>
        </View>
        <View style={styles.healthScoreCircle}>
          <View style={[styles.healthScoreFill, { height: \`\${healthScore}%\` }]} />
          <Ionicons name="heart" size={32} color="#fff" style={styles.heartIcon} />
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onScheduleAppointment}>
          <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="calendar" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.actionText}>Book{'\n'}Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onViewRecords}>
          <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="document-text" size={24} color="#d97706" />
          </View>
          <Text style={styles.actionText}>Medical{'\n'}Records</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="medkit" size={24} color="#16a34a" />
          </View>
          <Text style={styles.actionText}>My{'\n'}Medications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <View style={[styles.actionIcon, { backgroundColor: '#fce7f3' }]}>
            <Ionicons name="fitness" size={24} color="#db2777" />
          </View>
          <Text style={styles.actionText}>Health{'\n'}Vitals</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {upcomingAppointments.slice(0, 2).map((apt) => (
          <View key={apt.id} style={styles.appointmentCard}>
            <View style={styles.appointmentIcon}>
              <Ionicons name={apt.type === 'video' ? 'videocam' : 'person'} size={24} color="#3b82f6" />
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentDoctor}>{apt.doctor}</Text>
              <Text style={styles.appointmentSpecialty}>{apt.specialty}</Text>
              <View style={styles.appointmentTimeRow}>
                <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                <Text style={styles.appointmentTime}>{apt.date} at {apt.time}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.appointmentAction}>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Medications</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {medications.slice(0, 3).map((med) => (
          <View key={med.id} style={styles.medicationCard}>
            <View style={styles.medicationIcon}>
              <Ionicons name="medical" size={20} color="#10b981" />
            </View>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{med.name}</Text>
              <Text style={styles.medicationDosage}>{med.dosage} • {med.frequency}</Text>
            </View>
            {med.nextDose && (
              <View style={styles.nextDose}>
                <Text style={styles.nextDoseText}>{med.nextDose}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20 },
  greeting: { fontSize: 14, color: '#6b7280' },
  name: { fontSize: 24, fontWeight: '700', color: '#111827' },
  notificationBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  healthScoreCard: { flexDirection: 'row', backgroundColor: '#3b82f6', margin: 16, borderRadius: 20, padding: 20, overflow: 'hidden' },
  healthScoreContent: { flex: 1 },
  healthScoreLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  healthScoreValue: { fontSize: 48, fontWeight: '700', color: '#fff', marginVertical: 4 },
  healthScoreSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  healthScoreCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'center' },
  healthScoreFill: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.3)' },
  heartIcon: { position: 'absolute', top: '50%', marginTop: -16 },
  quickActions: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  actionBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center' },
  actionIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionText: { fontSize: 12, color: '#374151', textAlign: 'center', lineHeight: 16 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  seeAll: { fontSize: 14, color: '#3b82f6', fontWeight: '500' },
  appointmentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  appointmentIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  appointmentInfo: { flex: 1 },
  appointmentDoctor: { fontSize: 16, fontWeight: '600', color: '#111827' },
  appointmentSpecialty: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  appointmentTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  appointmentTime: { fontSize: 12, color: '#6b7280' },
  appointmentAction: { padding: 8 },
  medicationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  medicationIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  medicationInfo: { flex: 1 },
  medicationName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  medicationDosage: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  nextDose: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  nextDoseText: { fontSize: 12, fontWeight: '500', color: '#d97706' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';"],
  };
}

// Medication Tracker
export function generateRNMedicationTracker(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  color?: string;
  taken?: { [time: string]: boolean };
}

interface MedicationTrackerProps {
  medications: Medication[];
  date: string;
  onMarkTaken?: (medicationId: string, time: string) => void;
  onAddMedication?: () => void;
}

export default function MedicationTracker({ medications, date, onMarkTaken, onAddMedication }: MedicationTrackerProps) {
  const allTimes = [...new Set(medications.flatMap(m => m.times))].sort();

  const getMedicationsForTime = (time: string) => medications.filter(m => m.times.includes(time));

  const getProgress = () => {
    let total = 0;
    let taken = 0;
    medications.forEach(m => {
      m.times.forEach(t => {
        total++;
        if (m.taken?.[t]) taken++;
      });
    });
    return total > 0 ? (taken / total) * 100 : 0;
  };

  const progress = getProgress();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.date}>{date}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAddMedication}>
          <Ionicons name="add" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Daily Progress</Text>
          <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
        </View>
      </View>

      {allTimes.map((time) => {
        const meds = getMedicationsForTime(time);
        if (meds.length === 0) return null;

        return (
          <View key={time} style={styles.timeSection}>
            <View style={styles.timeHeader}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text style={styles.timeLabel}>{time}</Text>
            </View>
            {meds.map((med) => {
              const isTaken = med.taken?.[time];
              return (
                <View key={med.id} style={styles.medicationCard}>
                  <View style={[styles.medicationDot, { backgroundColor: med.color || '#3b82f6' }]} />
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{med.name}</Text>
                    <Text style={styles.medicationDosage}>{med.dosage}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.takeBtn, isTaken && styles.takeBtnTaken]}
                    onPress={() => onMarkTaken?.(med.id, time)}
                  >
                    {isTaken ? (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    ) : (
                      <Text style={styles.takeBtnText}>Take</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        );
      })}

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Your Medications</Text>
        {medications.map((med) => (
          <View key={med.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: med.color || '#3b82f6' }]} />
            <View style={styles.legendInfo}>
              <Text style={styles.legendName}>{med.name}</Text>
              <Text style={styles.legendFrequency}>{med.frequency}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  date: { fontSize: 20, fontWeight: '700', color: '#111827' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  progressCard: { backgroundColor: '#fff', margin: 16, marginTop: 0, borderRadius: 16, padding: 16 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressLabel: { fontSize: 14, color: '#6b7280' },
  progressValue: { fontSize: 20, fontWeight: '700', color: '#111827' },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 },
  progressFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 4 },
  timeSection: { paddingHorizontal: 16, marginBottom: 20 },
  timeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  timeLabel: { fontSize: 16, fontWeight: '600', color: '#374151' },
  medicationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8 },
  medicationDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  medicationInfo: { flex: 1 },
  medicationName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  medicationDosage: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  takeBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  takeBtnTaken: { backgroundColor: '#10b981' },
  takeBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  legend: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16 },
  legendTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  legendInfo: { flex: 1 },
  legendName: { fontSize: 14, fontWeight: '500', color: '#111827' },
  legendFrequency: { fontSize: 12, color: '#6b7280' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';"],
  };
}

// Health Vitals Card
export function generateRNHealthVitalsCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Vital {
  id: string;
  name: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'critical';
}

interface HealthVitalsCardProps {
  vitals: Vital[];
  lastUpdated?: string;
  onVitalPress?: (vital: Vital) => void;
  onAddReading?: () => void;
}

export default function HealthVitalsCard({ vitals, lastUpdated, onVitalPress, onAddReading }: HealthVitalsCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#10b981';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Health Vitals</Text>
          {lastUpdated && <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAddReading}>
          <Ionicons name="add" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.vitalsGrid}>
        {vitals.map((vital) => (
          <TouchableOpacity
            key={vital.id}
            style={styles.vitalItem}
            onPress={() => onVitalPress?.(vital)}
          >
            <View style={[styles.vitalIcon, { backgroundColor: vital.color + '20' }]}>
              <Ionicons name={vital.icon as any} size={24} color={vital.color} />
            </View>
            <Text style={styles.vitalName}>{vital.name}</Text>
            <View style={styles.vitalValueRow}>
              <Text style={styles.vitalValue}>{vital.value}</Text>
              <Text style={styles.vitalUnit}>{vital.unit}</Text>
            </View>
            <View style={styles.vitalStatusRow}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(vital.status) }]} />
              {vital.trend && (
                <Ionicons
                  name={getTrendIcon(vital.trend) as any}
                  size={14}
                  color={vital.trend === 'up' ? '#10b981' : vital.trend === 'down' ? '#ef4444' : '#6b7280'}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  lastUpdated: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  vitalItem: { width: '47%', backgroundColor: '#f9fafb', borderRadius: 16, padding: 16 },
  vitalIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  vitalName: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  vitalValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  vitalValue: { fontSize: 24, fontWeight: '700', color: '#111827' },
  vitalUnit: { fontSize: 12, color: '#9ca3af' },
  vitalStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';"],
  };
}

// ============================================================================
// MISSING HEALTHCARE GENERATORS - Placeholders
// ============================================================================

// Patient Card Generator
export function generateRNPatientCard(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PatientCardProps {
  name?: string;
  age?: number;
  gender?: string;
  avatarUrl?: string;
  patientId?: string;
  lastVisit?: string;
  onPress?: () => void;
}

export default function PatientCard({
  name = 'John Doe',
  age = 35,
  gender = 'Male',
  avatarUrl = 'https://via.placeholder.com/60',
  patientId = 'P-12345',
  lastVisit = 'Jan 15, 2024',
  onPress,
}: PatientCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.details}>{age} yrs • {gender}</Text>
        <Text style={styles.patientId}>ID: {patientId}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.lastVisitLabel}>Last Visit</Text>
        <Text style={styles.lastVisit}>{lastVisit}</Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  details: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  patientId: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  right: { alignItems: 'flex-end' },
  lastVisitLabel: { fontSize: 12, color: '#9ca3af' },
  lastVisit: { fontSize: 14, fontWeight: '500', color: '#374151', marginTop: 2 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Appointment Scheduler Generator
export function generateRNAppointmentScheduler(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AppointmentSchedulerProps {
  doctorName?: string;
  specialty?: string;
  selectedDate?: string;
  timeSlots?: TimeSlot[];
  onTimeSelect?: (time: string) => void;
  onConfirm?: () => void;
}

export default function AppointmentScheduler({
  doctorName = 'Dr. Smith',
  specialty = 'General Physician',
  selectedDate = 'January 20, 2024',
  timeSlots = [
    { time: '9:00 AM', available: true },
    { time: '10:00 AM', available: false },
    { time: '11:00 AM', available: true },
    { time: '2:00 PM', available: true },
    { time: '3:00 PM', available: true },
  ],
  onTimeSelect,
  onConfirm,
}: AppointmentSchedulerProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onTimeSelect?.(time);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.doctorName}>{doctorName}</Text>
        <Text style={styles.specialty}>{specialty}</Text>
      </View>
      <Text style={styles.dateLabel}>{selectedDate}</Text>
      <Text style={styles.sectionTitle}>Available Time Slots</Text>
      <View style={styles.slotsGrid}>
        {timeSlots.map((slot, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.slot,
              !slot.available && styles.slotUnavailable,
              selectedTime === slot.time && styles.slotSelected,
            ]}
            disabled={!slot.available}
            onPress={() => handleTimeSelect(slot.time)}
          >
            <Text style={[
              styles.slotText,
              !slot.available && styles.slotTextUnavailable,
              selectedTime === slot.time && styles.slotTextSelected,
            ]}>{slot.time}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.confirmBtn, !selectedTime && styles.confirmBtnDisabled]}
        disabled={!selectedTime}
        onPress={onConfirm}
      >
        <Text style={styles.confirmText}>Confirm Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  doctorName: { fontSize: 20, fontWeight: '700', color: '#111827' },
  specialty: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  dateLabel: { fontSize: 16, fontWeight: '600', color: '#374151', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  slotUnavailable: { backgroundColor: '#f3f4f6', borderColor: '#f3f4f6' },
  slotSelected: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  slotText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  slotTextUnavailable: { color: '#9ca3af' },
  slotTextSelected: { color: '#fff' },
  confirmBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  confirmBtnDisabled: { backgroundColor: '#d1d5db' },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Medical Record View Generator
export function generateRNMedicalRecordView(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MedicalRecord {
  id: string;
  type: string;
  date: string;
  doctor: string;
  notes: string;
}

interface MedicalRecordViewProps {
  patientName?: string;
  records?: MedicalRecord[];
  onRecordPress?: (id: string) => void;
  onAddRecord?: () => void;
}

export default function MedicalRecordView({
  patientName = 'John Doe',
  records = [],
  onRecordPress,
  onAddRecord,
}: MedicalRecordViewProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Records</Text>
        <Text style={styles.subtitle}>{patientName}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAddRecord}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Add Record</Text>
        </TouchableOpacity>
      </View>
      {records.map((record) => (
        <TouchableOpacity key={record.id} style={styles.recordCard} onPress={() => onRecordPress?.(record.id)}>
          <View style={styles.recordHeader}>
            <View style={styles.recordIcon}>
              <Ionicons name="document-text" size={20} color="#3b82f6" />
            </View>
            <View style={styles.recordInfo}>
              <Text style={styles.recordType}>{record.type}</Text>
              <Text style={styles.recordDate}>{record.date}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
          <Text style={styles.recordDoctor}>Dr. {record.doctor}</Text>
          <Text style={styles.recordNotes} numberOfLines={2}>{record.notes}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', padding: 20, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignSelf: 'flex-start', marginTop: 16 },
  addText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  recordCard: { backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  recordHeader: { flexDirection: 'row', alignItems: 'center' },
  recordIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  recordInfo: { flex: 1, marginLeft: 12 },
  recordType: { fontSize: 16, fontWeight: '600', color: '#111827' },
  recordDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  recordDoctor: { fontSize: 14, color: '#374151', marginTop: 12 },
  recordNotes: { fontSize: 14, color: '#6b7280', marginTop: 4, lineHeight: 20 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Prescription List Generator
export function generateRNPrescriptionList(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  status: 'active' | 'completed' | 'refill';
}

interface PrescriptionListProps {
  prescriptions?: Prescription[];
  onPrescriptionPress?: (id: string) => void;
  onRefillPress?: (id: string) => void;
}

export default function PrescriptionList({
  prescriptions = [],
  onPrescriptionPress,
  onRefillPress,
}: PrescriptionListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#6b7280';
      case 'refill': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderItem = ({ item }: { item: Prescription }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPrescriptionPress?.(item.id)}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={20} color="#3b82f6" />
        </View>
        <View style={styles.info}>
          <Text style={styles.medication}>{item.medication}</Text>
          <Text style={styles.dosage}>{item.dosage} • {item.frequency}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.duration}>Duration: {item.duration}</Text>
        <Text style={styles.prescribedBy}>By Dr. {item.prescribedBy}</Text>
      </View>
      {item.status === 'refill' && (
        <TouchableOpacity style={styles.refillBtn} onPress={() => onRefillPress?.(item.id)}>
          <Text style={styles.refillText}>Request Refill</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={prescriptions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      ListHeaderComponent={<Text style={styles.title}>Prescriptions</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  header: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 12 },
  medication: { fontSize: 16, fontWeight: '600', color: '#111827' },
  dosage: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  details: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  duration: { fontSize: 14, color: '#374151' },
  prescribedBy: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  refillBtn: { backgroundColor: '#fef3c7', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  refillText: { color: '#d97706', fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}
