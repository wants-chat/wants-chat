/**
 * React Native Product Configurator Generator
 * Generates a product configuration component with options (color, size, etc.)
 */

export function generateRNProductConfigurator(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface OptionValue {
  id: string;
  label: string;
  value: string;
  color?: string;
  inStock?: boolean;
  additionalPrice?: number;
}

interface ProductOption {
  id: string;
  name: string;
  type: 'color' | 'size' | 'text' | 'dropdown';
  required?: boolean;
  values: OptionValue[];
}

interface Product {
  id: string;
  name: string;
  basePrice: number;
}

interface ProductConfiguratorProps {
  configuratorData?: any;
  product?: Product;
  options?: ProductOption[];
  selectedOptions?: Record<string, string>;
  onOptionChange?: (optionId: string, valueId: string) => void;
  [key: string]: any;
}

export default function ProductConfigurator({
  configuratorData: propData,
  product: propProduct,
  options: propOptions,
  selectedOptions: propSelectedOptions = {},
  onOptionChange
}: ProductConfiguratorProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [internalSelectedOptions, setInternalSelectedOptions] = useState<Record<string, string>>(propSelectedOptions);

  useEffect(() => {
    const fetchData = async () => {
      if (propData || propProduct) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/products\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data?.[0] || result));
      } catch (err) {
        console.error('Failed to fetch product data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const product = propProduct || data.product || { id: '1', name: 'Product', basePrice: 0 };
  const options = propOptions || data.options || [];
  const selectedOptions = Object.keys(propSelectedOptions).length > 0 ? propSelectedOptions : internalSelectedOptions;

  const handleOptionChange = (optionId: string, valueId: string) => {
    setInternalSelectedOptions(prev => ({ ...prev, [optionId]: valueId }));
    onOptionChange?.(optionId, valueId);
  };

  if (loading && !propData && !propProduct) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const calculateTotalPrice = () => {
    let total = product.basePrice;

    options.forEach(option => {
      const selectedValueId = selectedOptions[option.id];
      if (selectedValueId) {
        const selectedValue = option.values.find(v => v.id === selectedValueId);
        if (selectedValue?.additionalPrice) {
          total += selectedValue.additionalPrice;
        }
      }
    });

    return total;
  };

  const renderColorOption = (option: ProductOption) => {
    return (
      <View style={styles.optionContainer} key={option.id}>
        <View style={styles.optionHeader}>
          <Text style={styles.optionName}>
            {option.name}
            {option.required && <Text style={styles.required}> *</Text>}
          </Text>
          {selectedOptions[option.id] && (
            <Text style={styles.selectedValue}>
              {option.values.find(v => v.id === selectedOptions[option.id])?.label}
            </Text>
          )}
        </View>
        <View style={styles.colorOptionsContainer}>
          {option.values.map((value) => {
            const isSelected = selectedOptions[option.id] === value.id;
            const isAvailable = value.inStock !== false;

            return (
              <TouchableOpacity
                key={value.id}
                style={[
                  styles.colorOption,
                  isSelected && styles.colorOptionSelected,
                  !isAvailable && styles.colorOptionDisabled
                ]}
                onPress={() => isAvailable && handleOptionChange(option.id, value.id)}
                disabled={!isAvailable}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: value.color || '#e5e7eb' },
                    !isAvailable && styles.colorSwatchDisabled
                  ]}
                >
                  {!isAvailable && (
                    <View style={styles.outOfStockLine} />
                  )}
                </View>
                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark" size={16} color="#3b82f6" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSizeOption = (option: ProductOption) => {
    return (
      <View style={styles.optionContainer} key={option.id}>
        <View style={styles.optionHeader}>
          <Text style={styles.optionName}>
            {option.name}
            {option.required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
        <View style={styles.sizeOptionsContainer}>
          {option.values.map((value) => {
            const isSelected = selectedOptions[option.id] === value.id;
            const isAvailable = value.inStock !== false;

            return (
              <TouchableOpacity
                key={value.id}
                style={[
                  styles.sizeOption,
                  isSelected && styles.sizeOptionSelected,
                  !isAvailable && styles.sizeOptionDisabled
                ]}
                onPress={() => isAvailable && handleOptionChange(option.id, value.id)}
                disabled={!isAvailable}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sizeOptionText,
                    isSelected && styles.sizeOptionTextSelected,
                    !isAvailable && styles.sizeOptionTextDisabled
                  ]}
                >
                  {value.label}
                </Text>
                {value.additionalPrice && value.additionalPrice > 0 && (
                  <Text style={styles.additionalPrice}>
                    +\${value.additionalPrice.toFixed(2)}
                  </Text>
                )}
                {!isAvailable && (
                  <View style={styles.outOfStockBadge}>
                    <Text style={styles.outOfStockText}>Out</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderOption = (option: ProductOption) => {
    switch (option.type) {
      case 'color':
        return renderColorOption(option);
      case 'size':
        return renderSizeOption(option);
      default:
        return renderSizeOption(option);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Configure Your Product</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price:</Text>
          <Text style={styles.price}>\${calculateTotalPrice().toFixed(2)}</Text>
        </View>
      </View>

      {options.map(renderOption)}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Selected Configuration</Text>
        {options.map(option => {
          const selectedValueId = selectedOptions[option.id];
          const selectedValue = option.values.find(v => v.id === selectedValueId);

          return (
            <View key={option.id} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{option.name}:</Text>
              <Text style={styles.summaryValue}>
                {selectedValue ? selectedValue.label : 'Not selected'}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b82f6',
  },
  optionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  required: {
    color: '#ef4444',
  },
  selectedValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  colorOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    position: 'relative',
    padding: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#3b82f6',
  },
  colorOptionDisabled: {
    opacity: 0.4,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
    overflow: 'hidden',
  },
  colorSwatchDisabled: {
    opacity: 0.5,
  },
  outOfStockLine: {
    position: 'absolute',
    top: '50%',
    left: -5,
    right: -5,
    height: 2,
    backgroundColor: '#ef4444',
    transform: [{ rotate: '-45deg' }],
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    minWidth: 70,
    alignItems: 'center',
    position: 'relative',
  },
  sizeOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  sizeOptionDisabled: {
    opacity: 0.4,
  },
  sizeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sizeOptionTextSelected: {
    color: '#3b82f6',
  },
  sizeOptionTextDisabled: {
    color: '#9ca3af',
  },
  additionalPrice: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  summaryContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});`;

  return { code, imports };
}
