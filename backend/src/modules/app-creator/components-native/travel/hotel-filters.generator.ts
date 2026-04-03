/**
 * Hotel Filters Component Generator (React Native)
 *
 * Generates a filter panel for hotels with:
 * - Price range inputs
 * - Star rating selector
 * - Amenities checkboxes
 */

export interface HotelFiltersOptions {
  componentName?: string;
}

export function generateHotelFilters(options: HotelFiltersOptions = {}): string {
  const { componentName = 'HotelFilters' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Filters {
  minPrice: string;
  maxPrice: string;
  starRating: number | null;
  amenities: string[];
}

interface ${componentName}Props {
  visible?: boolean;
  onClose?: () => void;
  onFilterChange?: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
}

const AMENITIES = [
  { key: 'wifi', label: 'WiFi', icon: 'wifi' },
  { key: 'breakfast', label: 'Breakfast', icon: 'cafe' },
  { key: 'parking', label: 'Parking', icon: 'car' },
  { key: 'gym', label: 'Gym', icon: 'barbell' },
  { key: 'pool', label: 'Pool', icon: 'water' },
  { key: 'spa', label: 'Spa', icon: 'flower' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  visible = true,
  onClose,
  onFilterChange,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<Filters>({
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    starRating: initialFilters.starRating || null,
    amenities: initialFilters.amenities || [],
  });

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    setFilters({ ...filters, amenities: newAmenities });
  };

  const handleApplyFilters = () => {
    onFilterChange?.(filters);
    onClose?.();
  };

  const handleResetFilters = () => {
    const resetFilters: Filters = {
      minPrice: '',
      maxPrice: '',
      starRating: null,
      amenities: [],
    };
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  const FilterContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Ionicons name="filter" size={20} color="#111827" />
          <Text style={styles.title}>Filters</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Price Range */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cash-outline" size={18} color="#6B7280" />
          <Text style={styles.sectionTitle}>Price Range</Text>
        </View>
        <View style={styles.priceRow}>
          <View style={styles.priceInputContainer}>
            <Text style={styles.priceLabel}>Min</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="0"
              value={filters.minPrice}
              onChangeText={(text) => setFilters({ ...filters, minPrice: text })}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <Text style={styles.priceDash}>-</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.priceLabel}>Max</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="500"
              value={filters.maxPrice}
              onChangeText={(text) => setFilters({ ...filters, maxPrice: text })}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>

      {/* Star Rating */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star-outline" size={18} color="#6B7280" />
          <Text style={styles.sectionTitle}>Star Rating</Text>
        </View>
        <View style={styles.starRow}>
          {[5, 4, 3, 2, 1].map((stars) => (
            <TouchableOpacity
              key={stars}
              style={[
                styles.starButton,
                filters.starRating === stars && styles.starButtonActive,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  starRating: filters.starRating === stars ? null : stars,
                })
              }
            >
              <Text
                style={[
                  styles.starButtonText,
                  filters.starRating === stars && styles.starButtonTextActive,
                ]}
              >
                {stars}
              </Text>
              <Ionicons
                name="star"
                size={14}
                color={filters.starRating === stars ? '#FFFFFF' : '#FBBF24'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Amenities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesContainer}>
          {AMENITIES.map((amenity) => {
            const isSelected = filters.amenities.includes(amenity.key);
            return (
              <TouchableOpacity
                key={amenity.key}
                style={[styles.amenityButton, isSelected && styles.amenityButtonActive]}
                onPress={() => toggleAmenity(amenity.key)}
              >
                <Ionicons
                  name={amenity.icon as any}
                  size={18}
                  color={isSelected ? '#FFFFFF' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.amenityText,
                    isSelected && styles.amenityTextActive,
                  ]}
                >
                  {amenity.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // If used as modal
  if (onClose) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FilterContent />
          </View>
        </View>
      </Modal>
    );
  }

  // If used inline
  return (
    <View style={styles.container}>
      <FilterContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    maxHeight: '80%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  priceDash: {
    fontSize: 18,
    color: '#9CA3AF',
    marginTop: 16,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  starButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  starButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  starButtonTextActive: {
    color: '#FFFFFF',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  amenityButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  amenityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  amenityTextActive: {
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingBottom: 16,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
