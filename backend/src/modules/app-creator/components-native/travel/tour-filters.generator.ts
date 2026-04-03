/**
 * Tour Filters Component Generator (React Native)
 *
 * Generates a filter panel for tours with:
 * - Destination selector
 * - Duration filter
 * - Price range
 * - Group size filter
 */

export interface TourFiltersOptions {
  componentName?: string;
}

export function generateTourFilters(options: TourFiltersOptions = {}): string {
  const { componentName = 'TourFilters' } = options;

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
  destination: string;
  duration: string;
  minPrice: string;
  maxPrice: string;
  groupSize: string;
}

interface ${componentName}Props {
  visible?: boolean;
  onClose?: () => void;
  onFilterChange?: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
}

const DURATIONS = ['Any Duration', '1-3 Days', '4-7 Days', '8-14 Days', '15+ Days'];
const GROUP_SIZES = ['Any Size', 'Small (1-10)', 'Medium (11-20)', 'Large (20+)'];

const ${componentName}: React.FC<${componentName}Props> = ({
  visible = true,
  onClose,
  onFilterChange,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<Filters>({
    destination: initialFilters.destination || '',
    duration: initialFilters.duration || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    groupSize: initialFilters.groupSize || '',
  });

  const handleApplyFilters = () => {
    onFilterChange?.(filters);
    onClose?.();
  };

  const handleResetFilters = () => {
    const resetFilters: Filters = {
      destination: '',
      duration: '',
      minPrice: '',
      maxPrice: '',
      groupSize: '',
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
          <Text style={styles.title}>Filter Tours</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Destination */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={18} color="#6B7280" />
          <Text style={styles.sectionTitle}>Destination</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search destinations..."
            value={filters.destination}
            onChangeText={(text) => setFilters({ ...filters, destination: text })}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={18} color="#6B7280" />
          <Text style={styles.sectionTitle}>Duration</Text>
        </View>
        <View style={styles.optionsContainer}>
          {DURATIONS.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.optionButton,
                filters.duration === duration && styles.optionButtonActive,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  duration: duration === 'Any Duration' ? '' : duration,
                })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  filters.duration === duration && styles.optionTextActive,
                ]}
              >
                {duration}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
              placeholder="5000"
              value={filters.maxPrice}
              onChangeText={(text) => setFilters({ ...filters, maxPrice: text })}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>

      {/* Group Size */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people-outline" size={18} color="#6B7280" />
          <Text style={styles.sectionTitle}>Group Size</Text>
        </View>
        <View style={styles.optionsContainer}>
          {GROUP_SIZES.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.optionButton,
                filters.groupSize === size && styles.optionButtonActive,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  groupSize: size === 'Any Size' ? '' : size,
                })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  filters.groupSize === size && styles.optionTextActive,
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
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
    maxHeight: '85%',
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
  },
  inputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionTextActive: {
    color: '#FFFFFF',
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
