/**
 * Booking Wizard Component Generator (React Native)
 *
 * Generates a multi-step booking wizard with service selection,
 * date/time picker, and confirmation.
 */

export interface BookingWizardOptions {
  componentName?: string;
  endpoint?: string;
  steps?: string[];
}

export function generateBookingWizard(options: BookingWizardOptions = {}): string {
  const {
    componentName = 'BookingWizard',
    endpoint = '/appointments',
    steps = ['Service', 'Date & Time', 'Details', 'Confirm'],
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '@/lib/api';

interface Service {
  id: string;
  name: string;
  duration?: number;
  price?: number;
}

interface BookingData {
  service_id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const STEPS = ${JSON.stringify(steps)};

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM',
];

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [booking, setBooking] = useState<BookingData>({
    service_id: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await api.get<any>('/services');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createBooking = useMutation({
    mutationFn: (data: BookingData) => api.post('${endpoint}', data),
    onSuccess: () => {
      Alert.alert('Success', 'Booking confirmed!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    },
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      createBooking.mutate(booking);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!booking.service_id;
      case 1:
        return !!booking.date && !!booking.time;
      case 2:
        return !!booking.name && !!booking.email;
      default:
        return true;
    }
  };

  const selectedService = services?.find((s: Service) => s.id === booking.service_id);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBooking({ ...booking, date: selectedDate.toISOString().split('T')[0] });
    }
  };

  const renderProgressSteps = () => (
    <View style={styles.progressContainer}>
      {STEPS.map((step, index) => (
        <View key={step} style={styles.stepWrapper}>
          <View
            style={[
              styles.stepCircle,
              index <= currentStep && styles.stepCircleActive,
            ]}
          >
            {index < currentStep ? (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  index <= currentStep && styles.stepNumberActive,
                ]}
              >
                {index + 1}
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              index <= currentStep && styles.stepLabelActive,
            ]}
            numberOfLines={1}
          >
            {step}
          </Text>
          {index < STEPS.length - 1 && (
            <View
              style={[
                styles.stepLine,
                index < currentStep && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderServiceStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select a Service</Text>
      {servicesLoading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <View style={styles.serviceList}>
          {services?.map((service: Service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceOption,
                booking.service_id === service.id && styles.serviceOptionSelected,
              ]}
              onPress={() => setBooking({ ...booking, service_id: service.id })}
              activeOpacity={0.7}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radio,
                    booking.service_id === service.id && styles.radioSelected,
                  ]}
                >
                  {booking.service_id === service.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  {service.duration && (
                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                  )}
                </View>
              </View>
              {service.price !== undefined && (
                <Text style={styles.servicePrice}>\${service.price}</Text>
              )}
            </TouchableOpacity>
          )) || (
            <Text style={styles.emptyText}>No services available</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderDateTimeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose Date & Time</Text>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.inputLabel}>Date</Text>
        </View>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={booking.date ? styles.dateText : styles.datePlaceholder}>
            {booking.date || 'Select date...'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={booking.date ? new Date(booking.date) : new Date()}
            mode="date"
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.inputLabel}>Time</Text>
        </View>
        <View style={styles.timeSlotGrid}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.timeSlot,
                booking.time === slot && styles.timeSlotSelected,
              ]}
              onPress={() => setBooking({ ...booking, time: slot })}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  booking.time === slot && styles.timeSlotTextSelected,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Your Details</Text>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <Text style={styles.inputLabel}>Name *</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor="#9CA3AF"
          value={booking.name}
          onChangeText={(text) => setBooking({ ...booking, name: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor="#9CA3AF"
          value={booking.email}
          onChangeText={(text) => setBooking({ ...booking, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="(555) 123-4567"
          placeholderTextColor="#9CA3AF"
          value={booking.phone}
          onChangeText={(text) => setBooking({ ...booking, phone: text })}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any special requests..."
          placeholderTextColor="#9CA3AF"
          value={booking.notes}
          onChangeText={(text) => setBooking({ ...booking, notes: text })}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirm Booking</Text>

      <View style={styles.confirmCard}>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Service:</Text>
          <Text style={styles.confirmValue}>{selectedService?.name}</Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Date:</Text>
          <Text style={styles.confirmValue}>{booking.date}</Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Time:</Text>
          <Text style={styles.confirmValue}>{booking.time}</Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Name:</Text>
          <Text style={styles.confirmValue}>{booking.name}</Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Email:</Text>
          <Text style={styles.confirmValue}>{booking.email}</Text>
        </View>
        {selectedService?.price !== undefined && (
          <View style={[styles.confirmRow, styles.totalRow]}>
            <Text style={styles.confirmLabel}>Total:</Text>
            <Text style={styles.totalValue}>\${selectedService.price}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderServiceStep();
      case 1:
        return renderDateTimeStep();
      case 2:
        return renderDetailsStep();
      case 3:
        return renderConfirmStep();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProgressSteps()}
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={handleBack}
          disabled={currentStep === 0}
        >
          <Text
            style={[
              styles.backButtonText,
              currentStep === 0 && styles.buttonTextDisabled,
            ]}
          >
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            (!canProceed() || createBooking.isPending) && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed() || createBooking.isPending}
        >
          {createBooking.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === STEPS.length - 1 ? 'Confirm Booking' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#3B82F6',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#111827',
    fontWeight: '500',
  },
  stepLine: {
    position: 'absolute',
    top: 16,
    right: -20,
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  stepLineActive: {
    backgroundColor: '#3B82F6',
  },
  stepContent: {
    flex: 1,
    minHeight: 300,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  serviceList: {
    gap: 12,
  },
  serviceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  serviceOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  timeSlotGrid: {
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
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  confirmCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 4,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
});

export default ${componentName};
`;
}
