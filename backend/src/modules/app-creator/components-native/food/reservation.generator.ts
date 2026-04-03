/**
 * Reservation Component Generator for React Native
 *
 * Generates restaurant reservation components:
 * - ReservationForm: Booking form with date/time picker
 * - RestaurantInfo: Restaurant details and hours
 */

export interface ReservationOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateReservationForm(options: ReservationOptions = {}): string {
  const { componentName = 'ReservationForm', endpoint = '/reservations' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

const TIME_SLOTS = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'
];

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, '9+'];

function ${componentName}() {
  const queryClient = useQueryClient();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(),
    time: '',
    party_size: '2',
    name: '',
    email: '',
    phone: '',
    special_requests: '',
  });

  const createReservation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', {
      ...data,
      date: data.date.toISOString().split('T')[0],
    }),
    onSuccess: () => {
      showToast('success', 'Reservation confirmed!');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setFormData({
        date: new Date(),
        time: '',
        party_size: '2',
        name: '',
        email: '',
        phone: '',
        special_requests: '',
      });
    },
    onError: () => showToast('error', 'Failed to make reservation'),
  });

  const handleSubmit = () => {
    if (!formData.time || !formData.name || !formData.phone) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    createReservation.mutate(formData);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Make a Reservation</Text>

      {/* Date Selection */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Ionicons name="calendar" size={18} color="#6B7280" />
          <Text style={styles.label}>Date *</Text>
        </View>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {formData.date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Ionicons name="time" size={18} color="#6B7280" />
          <Text style={styles.label}>Time *</Text>
        </View>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={[styles.dateButtonText, !formData.time && styles.placeholder]}>
            {formData.time || 'Select time...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Ionicons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.timeSlotsList}>
                {TIME_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeSlot,
                      formData.time === slot && styles.timeSlotSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, time: slot });
                      setShowTimePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      formData.time === slot && styles.timeSlotTextSelected,
                    ]}>
                      {slot}
                    </Text>
                    {formData.time === slot && (
                      <Ionicons name="checkmark" size={20} color="#F97316" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>

      {/* Party Size */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Ionicons name="people" size={18} color="#6B7280" />
          <Text style={styles.label}>Party Size *</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.partySizeContainer}
        >
          {PARTY_SIZES.map((size) => (
            <TouchableOpacity
              key={size.toString()}
              style={[
                styles.partySizeButton,
                formData.party_size === size.toString() && styles.partySizeButtonSelected,
              ]}
              onPress={() => setFormData({ ...formData, party_size: size.toString() })}
            >
              <Text style={[
                styles.partySizeText,
                formData.party_size === size.toString() && styles.partySizeTextSelected,
              ]}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Ionicons name="person" size={18} color="#6B7280" />
          <Text style={styles.label}>Name *</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Ionicons name="call" size={18} color="#6B7280" />
          <Text style={styles.label}>Phone *</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Ionicons name="mail" size={18} color="#6B7280" />
          <Text style={styles.label}>Email</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Ionicons name="chatbubble" size={18} color="#6B7280" />
          <Text style={styles.label}>Special Requests</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any dietary restrictions, special occasions, seating preferences..."
          value={formData.special_requests}
          onChangeText={(text) => setFormData({ ...formData, special_requests: text })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, createReservation.isPending && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={createReservation.isPending}
      >
        {createReservation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Confirm Reservation</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  partySizeContainer: {
    gap: 8,
  },
  partySizeButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#F9FAFB',
  },
  partySizeButtonSelected: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  partySizeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  partySizeTextSelected: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  timeSlotsList: {
    padding: 8,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  timeSlotSelected: {
    backgroundColor: '#FFF7ED',
  },
  timeSlotText: {
    fontSize: 16,
    color: '#374151',
  },
  timeSlotTextSelected: {
    color: '#F97316',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

export function generateRestaurantInfo(options: ReservationOptions = {}): string {
  const componentName = options.componentName || 'RestaurantInfo';

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RestaurantData {
  name?: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviews_count?: number;
  hours?: Record<string, string>;
  amenities?: string[];
  description?: string;
}

interface ${componentName}Props {
  restaurant?: RestaurantData;
}

const DEFAULT_HOURS = {
  'Mon-Thu': '11:00 AM - 10:00 PM',
  'Fri-Sat': '11:00 AM - 11:00 PM',
  'Sunday': '12:00 PM - 9:00 PM',
};

const AMENITY_ICONS: Record<string, string> = {
  'Free WiFi': 'wifi',
  'Parking': 'car',
  'Cards Accepted': 'card',
  'Outdoor Seating': 'sunny',
  'Wheelchair Accessible': 'accessibility',
  'Live Music': 'musical-notes',
};

function ${componentName}({ restaurant }: ${componentName}Props) {
  const hours = restaurant?.hours || DEFAULT_HOURS;

  const handleCall = () => {
    if (restaurant?.phone) {
      Linking.openURL(\`tel:\${restaurant.phone}\`);
    }
  };

  const handleDirections = () => {
    if (restaurant?.address) {
      const encodedAddress = encodeURIComponent(restaurant.address);
      Linking.openURL(\`maps://?q=\${encodedAddress}\`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {restaurant?.name && (
        <Text style={styles.name}>{restaurant.name}</Text>
      )}

      {restaurant?.rating && (
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(restaurant.rating!) ? 'star' : 'star-outline'}
                size={20}
                color={i < Math.floor(restaurant.rating!) ? '#FBBF24' : '#D1D5DB'}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>{restaurant.rating}</Text>
          {restaurant.reviews_count && (
            <Text style={styles.reviewCount}>({restaurant.reviews_count} reviews)</Text>
          )}
        </View>
      )}

      {restaurant?.description && (
        <Text style={styles.description}>{restaurant.description}</Text>
      )}

      <View style={styles.infoSection}>
        {restaurant?.address && (
          <TouchableOpacity style={styles.infoRow} onPress={handleDirections}>
            <Ionicons name="location" size={20} color="#6B7280" />
            <Text style={styles.infoText}>{restaurant.address}</Text>
            <Ionicons name="navigate" size={18} color="#3B82F6" />
          </TouchableOpacity>
        )}
        {restaurant?.phone && (
          <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#6B7280" />
            <Text style={[styles.infoText, styles.linkText]}>{restaurant.phone}</Text>
            <Ionicons name="chevron-forward" size={18} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Hours</Text>
        </View>
        <View style={styles.hoursList}>
          {Object.entries(hours).map(([day, time]) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{day}</Text>
              <Text style={styles.hoursTime}>{time}</Text>
            </View>
          ))}
        </View>
      </View>

      {restaurant?.amenities && restaurant.amenities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {restaurant.amenities.map((amenity) => (
              <View key={amenity} style={styles.amenityBadge}>
                <Ionicons
                  name={(AMENITY_ICONS[amenity] || 'checkmark-circle') as any}
                  size={16}
                  color="#6B7280"
                />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  linkText: {
    color: '#3B82F6',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  hoursList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hoursDay: {
    fontSize: 14,
    color: '#6B7280',
  },
  hoursTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  amenityText: {
    fontSize: 13,
    color: '#374151',
  },
});

export default ${componentName};
`;
}
