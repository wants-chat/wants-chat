/**
 * Appointment Calendar Component Generators (React Native)
 *
 * Generates appointment calendar view and booking form components.
 */

export interface AppointmentCalendarOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAppointmentCalendar(options: AppointmentCalendarOptions = {}): string {
  const { componentName = 'AppointmentCalendar', endpoint = '/appointments' } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  date?: string;
  appointment_date?: string;
  time?: string;
  appointment_time?: string;
  patient_name?: string;
  doctor_name?: string;
  reason?: string;
  status?: string;
}

interface ${componentName}Props {
  onAppointmentPress?: (appointment: Appointment) => void;
  onDateSelect?: (date: Date) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ${componentName}: React.FC<${componentName}Props> = ({
  onAppointmentPress,
  onDateSelect,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', year, month],
    queryFn: async () => {
      const response = await api.get<any>(
        \`${endpoint}?year=\${year}&month=\${month + 1}\`
      );
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const padding = Array.from({ length: firstDay }, () => null);
    return [...padding, ...days];
  }, [year, month]);

  const getAppointmentsForDay = (day: number) => {
    return (
      appointments?.filter((apt: Appointment) => {
        const aptDate = new Date(apt.date || apt.appointment_date || '');
        return (
          aptDate.getDate() === day &&
          aptDate.getMonth() === month &&
          aptDate.getFullYear() === year
        );
      }) || []
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
    const date = new Date(year, month, day);
    onDateSelect?.(date);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const hasAppointments = (day: number) => {
    return getAppointmentsForDay(day).length > 0;
  };

  const selectedAppointments = selectedDay
    ? getAppointmentsForDay(selectedDay)
    : [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => onAppointmentPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.appointmentTime}>
        <Ionicons name="time-outline" size={16} color="#3B82F6" />
        <Text style={styles.appointmentTimeText}>
          {item.time || item.appointment_time}
        </Text>
      </View>
      {item.patient_name && (
        <Text style={styles.appointmentPatient}>{item.patient_name}</Text>
      )}
      {item.doctor_name && (
        <Text style={styles.appointmentDoctor}>Dr. {item.doctor_name}</Text>
      )}
      {item.reason && (
        <Text style={styles.appointmentReason} numberOfLines={1}>
          {item.reason}
        </Text>
      )}
      {item.status && (
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'confirmed' ? '#D1FAE5' : '#FEF3C7' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'confirmed' ? '#059669' : '#D97706' }
          ]}>
            {item.status}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.monthYear}>
            {MONTH_NAMES[month]} {year}
          </Text>
          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Day Names */}
        <View style={styles.dayNamesRow}>
          {DAY_NAMES.map((name) => (
            <View key={name} style={styles.dayNameCell}>
              <Text style={styles.dayName}>{name}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.daysGrid}>
          {calendarData.map((day, index) => {
            const dayHasAppointments = day ? hasAppointments(day) : false;
            const isDayToday = day ? isToday(day) : false;
            const isSelected = day === selectedDay;

            return (
              <TouchableOpacity
                key={index}
                style={styles.dayCell}
                onPress={() => day && handleDayPress(day)}
                disabled={!day}
                activeOpacity={0.7}
              >
                {day && (
                  <View
                    style={[
                      styles.dayButton,
                      isDayToday && styles.todayButton,
                      isSelected && styles.selectedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isDayToday && styles.todayText,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {day}
                    </Text>
                    {dayHasAppointments && (
                      <View
                        style={[
                          styles.appointmentDot,
                          isSelected && styles.appointmentDotSelected,
                        ]}
                      />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Day Appointments */}
      {selectedDay && (
        <View style={styles.appointmentsSection}>
          <Text style={styles.appointmentsTitle}>
            {selectedDay} {MONTH_NAMES[month]} {year}
          </Text>
          {selectedAppointments.length > 0 ? (
            <FlatList
              data={selectedAppointments}
              renderItem={renderAppointment}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.appointmentsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noAppointments}>
              <Ionicons name="calendar-outline" size={32} color="#D1D5DB" />
              <Text style={styles.noAppointmentsText}>No appointments</Text>
            </View>
          )}
        </View>
      )}
    </View>
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
  calendarCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayButton: {
    backgroundColor: '#DBEAFE',
  },
  selectedButton: {
    backgroundColor: '#3B82F6',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  todayText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  appointmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginTop: 2,
  },
  appointmentDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  appointmentsSection: {
    flex: 1,
    marginHorizontal: 16,
  },
  appointmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  appointmentsList: {
    paddingBottom: 24,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  appointmentTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  appointmentPatient: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  appointmentDoctor: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  appointmentReason: {
    fontSize: 13,
    color: '#4B5563',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  noAppointments: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  noAppointmentsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface AppointmentFormOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAppointmentForm(options: AppointmentFormOptions = {}): string {
  const { componentName = 'AppointmentForm', endpoint = '/appointments' } = options;

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface ${componentName}Props {
  defaultDoctorId?: string;
  onSuccess?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM',
];

const ${componentName}: React.FC<${componentName}Props> = ({
  defaultDoctorId,
  onSuccess,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();

  const routeParams = route.params as { doctor_id?: string } | undefined;
  const initialDoctorId = defaultDoctorId || routeParams?.doctor_id || '';

  const [formData, setFormData] = useState({
    doctor_id: initialDoctorId,
    date: '',
    time: '',
    reason: '',
    notes: '',
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await api.get<any>('/doctors');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      Alert.alert('Success', 'Appointment scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onSuccess?.();
      navigation.goBack();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to schedule appointment. Please try again.');
    },
  });

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const padding = Array.from({ length: firstDay }, () => null);
    return [...padding, ...days];
  }, [year, month]);

  const handleDateSelect = (day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return;

    setSelectedDate(date);
    setFormData({ ...formData, date: date.toISOString().split('T')[0] });
  };

  const handleTimeSelect = (time: string) => {
    setFormData({ ...formData, time });
  };

  const handleSubmit = () => {
    if (!formData.doctor_id || !formData.date || !formData.time || !formData.reason) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }
    createMutation.mutate(formData);
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const selectedDoctor = doctors?.find((d: Doctor) => d.id === formData.doctor_id);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formCard}>
        <Text style={styles.title}>Schedule Appointment</Text>

        {/* Doctor Selection */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="person-outline" size={18} color="#374151" />
            <Text style={styles.label}>Select Doctor *</Text>
          </View>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowDoctorPicker(!showDoctorPicker)}
          >
            <Text style={selectedDoctor ? styles.selectText : styles.selectPlaceholder}>
              {selectedDoctor
                ? \`Dr. \${selectedDoctor.name} - \${selectedDoctor.specialty}\`
                : 'Choose a doctor...'}
            </Text>
            <Ionicons
              name={showDoctorPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showDoctorPicker && (
            <View style={styles.pickerOptions}>
              {doctorsLoading ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                doctors?.map((doctor: Doctor) => (
                  <TouchableOpacity
                    key={doctor.id}
                    style={[
                      styles.pickerOption,
                      formData.doctor_id === doctor.id && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, doctor_id: doctor.id });
                      setShowDoctorPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.doctor_id === doctor.id && styles.pickerOptionTextSelected,
                      ]}
                    >
                      Dr. {doctor.name}
                    </Text>
                    <Text style={styles.pickerOptionMeta}>{doctor.specialty}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Date Selection Calendar */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={18} color="#374151" />
            <Text style={styles.label}>Select Date *</Text>
          </View>

          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => setCurrentMonth(new Date(year, month - 1, 1))}
              >
                <Ionicons name="chevron-back" size={22} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {MONTH_NAMES[month]} {year}
              </Text>
              <TouchableOpacity
                onPress={() => setCurrentMonth(new Date(year, month + 1, 1))}
              >
                <Ionicons name="chevron-forward" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.dayNamesRow}>
              {DAY_NAMES.map((name) => (
                <View key={name} style={styles.dayNameCell}>
                  <Text style={styles.dayName}>{name}</Text>
                </View>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarData.map((day, index) => {
                const disabled = day ? isDateDisabled(day) : true;
                const selected = day ? isDateSelected(day) : false;

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.dayCell}
                    onPress={() => day && !disabled && handleDateSelect(day)}
                    disabled={!day || disabled}
                  >
                    {day && (
                      <View
                        style={[
                          styles.dayButton,
                          disabled && styles.dayDisabled,
                          selected && styles.daySelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            disabled && styles.dayTextDisabled,
                            selected && styles.dayTextSelected,
                          ]}
                        >
                          {day}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="time-outline" size={18} color="#374151" />
            <Text style={styles.label}>Select Time *</Text>
          </View>
          <View style={styles.timeSlotsGrid}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeSlot,
                  formData.time === slot && styles.timeSlotSelected,
                ]}
                onPress={() => handleTimeSelect(slot)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    formData.time === slot && styles.timeSlotTextSelected,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reason for Visit */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="document-text-outline" size={18} color="#374151" />
            <Text style={styles.label}>Reason for Visit *</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="e.g., Annual checkup, Follow-up visit"
            placeholderTextColor="#9CA3AF"
            value={formData.reason}
            onChangeText={(text) => setFormData({ ...formData, reason: text })}
          />
        </View>

        {/* Additional Notes */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="create-outline" size={18} color="#374151" />
            <Text style={styles.label}>Additional Notes</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any symptoms or concerns..."
            placeholderTextColor="#9CA3AF"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Schedule Appointment</Text>
            </>
          )}
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
  formCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  selectText: {
    fontSize: 15,
    color: '#111827',
  },
  selectPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  pickerOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#3B82F6',
  },
  pickerOptionMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  calendarContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayDisabled: {
    opacity: 0.4,
  },
  daySelected: {
    backgroundColor: '#3B82F6',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dayTextDisabled: {
    color: '#9CA3AF',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  timeSlotSelected: {
    backgroundColor: '#3B82F6',
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
