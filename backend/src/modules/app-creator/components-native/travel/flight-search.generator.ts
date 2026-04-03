/**
 * Flight Search Component Generator (React Native)
 *
 * Generates a flight search form with:
 * - Round trip / One way toggle
 * - From/To airport inputs
 * - Date pickers
 * - Passenger and class selectors
 */

export interface FlightSearchOptions {
  componentName?: string;
}

export function generateFlightSearch(options: FlightSearchOptions = {}): string {
  const { componentName = 'FlightSearch' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FormData {
  from: string;
  to: string;
  departure: Date;
  return: Date;
  passengers: number;
  class: 'economy' | 'business' | 'first';
}

type TripType = 'roundtrip' | 'oneway';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [tripType, setTripType] = useState<TripType>('roundtrip');
  const [formData, setFormData] = useState<FormData>({
    from: '',
    to: '',
    departure: new Date(),
    return: new Date(Date.now() + 7 * 86400000),
    passengers: 1,
    class: 'economy',
  });
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);

  const handleSearch = () => {
    const params = {
      ...formData,
      departure: formData.departure.toISOString(),
      return: formData.return.toISOString(),
      tripType,
    };
    navigation.navigate('FlightResults' as never, params as never);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const CLASS_OPTIONS = [
    { value: 'economy', label: 'Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First Class' },
  ];

  return (
    <View style={styles.container}>
      {/* Trip Type Toggle */}
      <View style={styles.tripTypeContainer}>
        <TouchableOpacity
          style={[styles.tripTypeButton, tripType === 'roundtrip' && styles.tripTypeButtonActive]}
          onPress={() => setTripType('roundtrip')}
        >
          <Text
            style={[
              styles.tripTypeText,
              tripType === 'roundtrip' && styles.tripTypeTextActive,
            ]}
          >
            Round Trip
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tripTypeButton, tripType === 'oneway' && styles.tripTypeButtonActive]}
          onPress={() => setTripType('oneway')}
        >
          <Text
            style={[styles.tripTypeText, tripType === 'oneway' && styles.tripTypeTextActive]}
          >
            One Way
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* From / To Inputs */}
        <View style={styles.locationContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="airplane" size={20} color="#3B82F6" style={styles.planeIconFrom} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="From"
              value={formData.from}
              onChangeText={(text) => setFormData({ ...formData, from: text })}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Swap Button */}
          <TouchableOpacity
            style={styles.swapButton}
            onPress={() =>
              setFormData({ ...formData, from: formData.to, to: formData.from })
            }
          >
            <Ionicons name="swap-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="airplane" size={20} color="#3B82F6" style={styles.planeIconTo} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="To"
              value={formData.to}
              onChangeText={(text) => setFormData({ ...formData, to: text })}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={[styles.dateButton, tripType === 'oneway' && styles.dateButtonFull]}
            onPress={() => setShowDeparturePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#6B7280" />
            <View>
              <Text style={styles.dateLabel}>Departure</Text>
              <Text style={styles.dateValue}>{formatDate(formData.departure)}</Text>
            </View>
          </TouchableOpacity>

          {tripType === 'roundtrip' && (
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowReturnPicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#6B7280" />
              <View>
                <Text style={styles.dateLabel}>Return</Text>
                <Text style={styles.dateValue}>{formatDate(formData.return)}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Passengers and Class */}
        <View style={styles.optionsContainer}>
          <View style={styles.passengersContainer}>
            <Text style={styles.optionLabel}>Passengers</Text>
            <View style={styles.passengersSelector}>
              <TouchableOpacity
                style={styles.passengerButton}
                onPress={() =>
                  setFormData({
                    ...formData,
                    passengers: Math.max(1, formData.passengers - 1),
                  })
                }
              >
                <Ionicons name="remove" size={18} color="#3B82F6" />
              </TouchableOpacity>
              <View style={styles.passengerCount}>
                <Ionicons name="person" size={16} color="#6B7280" />
                <Text style={styles.passengerText}>{formData.passengers}</Text>
              </View>
              <TouchableOpacity
                style={styles.passengerButton}
                onPress={() =>
                  setFormData({
                    ...formData,
                    passengers: Math.min(9, formData.passengers + 1),
                  })
                }
              >
                <Ionicons name="add" size={18} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.classContainer}>
            <Text style={styles.optionLabel}>Class</Text>
            <View style={styles.classOptions}>
              {CLASS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.classOption,
                    formData.class === option.value && styles.classOptionActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, class: option.value as any })
                  }
                >
                  <Text
                    style={[
                      styles.classOptionText,
                      formData.class === option.value && styles.classOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>Search Flights</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Pickers */}
      {showDeparturePicker && (
        <DateTimePicker
          value={formData.departure}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDeparturePicker(false);
            if (date) setFormData({ ...formData, departure: date });
          }}
          minimumDate={new Date()}
        />
      )}
      {showReturnPicker && (
        <DateTimePicker
          value={formData.return}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowReturnPicker(false);
            if (date) setFormData({ ...formData, return: date });
          }}
          minimumDate={formData.departure}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    margin: 16,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  tripTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  tripTypeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  tripTypeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tripTypeTextActive: {
    color: '#FFFFFF',
  },
  locationContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    paddingHorizontal: 12,
    minHeight: 56,
  },
  inputIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  planeIconFrom: {
    transform: [{ rotate: '-45deg' }],
  },
  planeIconTo: {
    transform: [{ rotate: '45deg' }],
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 16,
    marginLeft: 8,
  },
  swapButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  dateButtonFull: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  passengersContainer: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  passengersSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passengerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  passengerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  classContainer: {},
  classOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  classOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  classOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  classOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  classOptionTextActive: {
    color: '#3B82F6',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
