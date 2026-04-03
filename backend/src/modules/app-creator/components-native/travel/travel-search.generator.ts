/**
 * Travel Search Component Generator (React Native)
 *
 * Generates a search form for flights and hotels with:
 * - Toggle between flights and hotels
 * - Location inputs, date pickers, guest selector
 * - Navigation to search results
 */

export interface TravelSearchOptions {
  componentName?: string;
}

export function generateTravelSearch(options: TravelSearchOptions = {}): string {
  const { componentName = 'TravelSearch' } = options;

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
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [searchType, setSearchType] = useState<'flights' | 'hotels'>('flights');
  const [formData, setFormData] = useState<FormData>({
    from: '',
    to: '',
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000),
    guests: 1,
  });
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const handleSearch = () => {
    const params = {
      ...formData,
      checkIn: formData.checkIn.toISOString(),
      checkOut: formData.checkOut.toISOString(),
      searchType,
    };

    if (searchType === 'flights') {
      navigation.navigate('FlightResults' as never, params as never);
    } else {
      navigation.navigate('HotelResults' as never, params as never);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Type Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, searchType === 'flights' && styles.toggleButtonActive]}
          onPress={() => setSearchType('flights')}
        >
          <Ionicons
            name="airplane"
            size={20}
            color={searchType === 'flights' ? '#FFFFFF' : '#6B7280'}
          />
          <Text style={[styles.toggleText, searchType === 'flights' && styles.toggleTextActive]}>
            Flights
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, searchType === 'hotels' && styles.toggleButtonActive]}
          onPress={() => setSearchType('hotels')}
        >
          <Ionicons
            name="bed"
            size={20}
            color={searchType === 'hotels' ? '#FFFFFF' : '#6B7280'}
          />
          <Text style={[styles.toggleText, searchType === 'hotels' && styles.toggleTextActive]}>
            Hotels
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* From Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="location" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={searchType === 'flights' ? 'From' : 'Destination'}
            value={formData.from}
            onChangeText={(text) => setFormData({ ...formData, from: text })}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* To Input (Flights only) */}
        {searchType === 'flights' && (
          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="To"
              value={formData.to}
              onChangeText={(text) => setFormData({ ...formData, to: text })}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* Date Inputs */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={[styles.inputContainer, styles.dateInput]}
            onPress={() => setShowCheckInPicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#6B7280" style={styles.inputIcon} />
            <Text style={styles.dateText}>{formatDate(formData.checkIn)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.inputContainer, styles.dateInput]}
            onPress={() => setShowCheckOutPicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#6B7280" style={styles.inputIcon} />
            <Text style={styles.dateText}>{formatDate(formData.checkOut)}</Text>
          </TouchableOpacity>
        </View>

        {/* Guests Selector */}
        <View style={styles.inputContainer}>
          <Ionicons name="people" size={20} color="#6B7280" style={styles.inputIcon} />
          <View style={styles.guestsSelector}>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
            >
              <Ionicons name="remove" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <Text style={styles.guestCount}>
              {formData.guests} Guest{formData.guests > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => setFormData({ ...formData, guests: Math.min(6, formData.guests + 1) })}
            >
              <Ionicons name="add" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Pickers */}
      {showCheckInPicker && (
        <DateTimePicker
          value={formData.checkIn}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowCheckInPicker(false);
            if (date) setFormData({ ...formData, checkIn: date });
          }}
          minimumDate={new Date()}
        />
      )}
      {showCheckOutPicker && (
        <DateTimePicker
          value={formData.checkOut}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowCheckOutPicker(false);
            if (date) setFormData({ ...formData, checkOut: date });
          }}
          minimumDate={formData.checkIn}
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
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  toggleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    paddingHorizontal: 12,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 14,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 14,
  },
  guestsSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
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
