/**
 * Destination Filters Component Generator (React Native)
 *
 * Generates a filter panel for destinations with:
 * - Search input
 * - Region, budget, rating filters
 * - Apply filters button
 */

export interface DestinationFiltersOptions {
  componentName?: string;
}

export function generateDestinationFilters(options: DestinationFiltersOptions = {}): string {
  const { componentName = 'DestinationFilters' } = options;

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
  search: string;
  region: string;
  budget: string;
  rating: string;
}

interface ${componentName}Props {
  visible?: boolean;
  onClose?: () => void;
  onFilterChange?: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
}

const REGIONS = ['All Regions', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania'];
const BUDGETS = ['Any Budget', 'Budget', 'Mid-Range', 'Luxury'];
const RATINGS = ['Any Rating', '4+ Stars', '3+ Stars'];

const ${componentName}: React.FC<${componentName}Props> = ({
  visible = true,
  onClose,
  onFilterChange,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<Filters>({
    search: initialFilters.search || '',
    region: initialFilters.region || '',
    budget: initialFilters.budget || '',
    rating: initialFilters.rating || '',
  });

  const handleApplyFilters = () => {
    onFilterChange?.(filters);
    onClose?.();
  };

  const handleResetFilters = () => {
    const resetFilters: Filters = { search: '', region: '', budget: '', rating: '' };
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

      {/* Search Input */}
      <View style={styles.section}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations..."
            value={filters.search}
            onChangeText={(text) => setFilters({ ...filters, search: text })}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Region Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Region</Text>
        <View style={styles.optionsContainer}>
          {REGIONS.map((region) => (
            <TouchableOpacity
              key={region}
              style={[
                styles.optionButton,
                filters.region === region && styles.optionButtonActive,
              ]}
              onPress={() => setFilters({ ...filters, region: region === 'All Regions' ? '' : region })}
            >
              <Text
                style={[
                  styles.optionText,
                  filters.region === region && styles.optionTextActive,
                ]}
              >
                {region}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Budget Filter */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cash-outline" size={18} color="#6B7280" />
          <Text style={styles.sectionTitle}>Budget</Text>
        </View>
        <View style={styles.optionsContainer}>
          {BUDGETS.map((budget) => (
            <TouchableOpacity
              key={budget}
              style={[
                styles.optionButton,
                filters.budget === budget && styles.optionButtonActive,
              ]}
              onPress={() => setFilters({ ...filters, budget: budget === 'Any Budget' ? '' : budget })}
            >
              <Text
                style={[
                  styles.optionText,
                  filters.budget === budget && styles.optionTextActive,
                ]}
              >
                {budget}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Rating Filter */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star-outline" size={18} color="#6B7280" />
          <Text style={styles.sectionTitle}>Rating</Text>
        </View>
        <View style={styles.optionsContainer}>
          {RATINGS.map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.optionButton,
                filters.rating === rating && styles.optionButtonActive,
              ]}
              onPress={() => setFilters({ ...filters, rating: rating === 'Any Rating' ? '' : rating })}
            >
              <Text
                style={[
                  styles.optionText,
                  filters.rating === rating && styles.optionTextActive,
                ]}
              >
                {rating}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
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
