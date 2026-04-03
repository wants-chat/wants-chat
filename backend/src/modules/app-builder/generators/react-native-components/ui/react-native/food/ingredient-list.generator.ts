/**
 * React Native Ingredient List Component Generator
 *
 * Generates an ingredient list showing:
 * - Ingredients grouped by category (Vegetables, Dairy, Spices, etc.)
 * - Quantities with smart fraction formatting (½, ¼, ⅓, etc.)
 * - Serving size adjuster with multiplier
 * - Checkboxes to track progress while cooking
 */

export function generateRNIngredientList(): { code: string; imports: string[] } {
  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';

interface IngredientListProps {
  ingredients?: any;
  ingredient?: any;
  data?: any;
  entity?: string;
  servings?: number;
  onServingsChange?: (servings: number) => void;
  [key: string]: any;
}

export default function IngredientList({ ingredients, ingredient, data: propData, entity = 'ingredients', servings: initialServings = 4, onServingsChange, ...props }: IngredientListProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData || ingredients || ingredient) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData, ingredients, ingredient]);

  const sourceData = propData || fetchedData || {};
  const ingredientsData = ingredients || ingredient || sourceData || {};
  const [servings, setServings] = useState(initialServings);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toDisplayString = (value: any, fallback: string = ''): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.filter(v => v).join(', ');
    if (typeof value === 'object') {
      return value.name || value.text || value.value || JSON.stringify(value);
    }
    return fallback;
  };

  // Convert decimal to fraction
  const toFraction = (decimal: number): string => {
    const fractions: any = {
      0.125: '⅛',
      0.25: '¼',
      0.333: '⅓',
      0.375: '⅜',
      0.5: '½',
      0.625: '⅝',
      0.666: '⅔',
      0.75: '¾',
      0.875: '⅞'
    };

    const whole = Math.floor(decimal);
    const remainder = decimal - whole;

    // Find closest fraction
    let closestFraction = '';
    let minDiff = 1;
    for (const [dec, frac] of Object.entries(fractions)) {
      const diff = Math.abs(parseFloat(dec) - remainder);
      if (diff < minDiff && diff < 0.05) {
        minDiff = diff;
        closestFraction = frac as string;
      }
    }

    if (whole > 0 && closestFraction) {
      return \`\${whole} \${closestFraction}\`;
    } else if (whole > 0) {
      return String(whole);
    } else if (closestFraction) {
      return closestFraction;
    } else {
      return decimal.toFixed(2);
    }
  };

  // Mock data - in real app this comes from props
  const defaultIngredients = ingredientsData.items || [
    { id: '1', name: 'All-purpose flour', quantity: 2, unit: 'cups', category: 'Dry Goods' },
    { id: '2', name: 'Sugar', quantity: 1, unit: 'cup', category: 'Dry Goods' },
    { id: '3', name: 'Eggs', quantity: 3, unit: 'large', category: 'Dairy' },
    { id: '4', name: 'Milk', quantity: 1, unit: 'cup', category: 'Dairy' },
    { id: '5', name: 'Butter', quantity: 0.5, unit: 'cup', category: 'Dairy' },
    { id: '6', name: 'Salt', quantity: 0.5, unit: 'tsp', category: 'Spices' },
    { id: '7', name: 'Vanilla extract', quantity: 1, unit: 'tsp', category: 'Spices' },
  ];

  const baseServings = ingredientsData.baseServings || initialServings;
  const multiplier = servings / baseServings;

  const adjustQuantity = (quantity: number): string => {
    const adjusted = quantity * multiplier;
    return toFraction(adjusted);
  };

  const handleServingsChange = (delta: number) => {
    const newServings = Math.max(1, servings + delta);
    setServings(newServings);
    if (onServingsChange) {
      onServingsChange(newServings);
    }
  };

  const handleToggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  // Group ingredients by category
  const groupedIngredients = defaultIngredients.reduce((groups: any, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const categoryIcons: any = {
    'Vegetables': '🥬',
    'Fruits': '🍎',
    'Dairy': '🥛',
    'Meat': '🍖',
    'Seafood': '🐟',
    'Dry Goods': '🌾',
    'Spices': '🧂',
    'Oils': '🫒',
    'Other': '🥄'
  };

  if (loading && !propData && !ingredients && !ingredient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Servings Adjuster */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ingredients</Text>
          <Text style={styles.headerSubtitle}>
            {checkedItems.size} of {defaultIngredients.length} collected
          </Text>
        </View>

        <View style={styles.servingsControl}>
          <Text style={styles.servingsLabel}>Servings</Text>
          <View style={styles.servingsAdjuster}>
            <TouchableOpacity
              style={styles.servingsButton}
              onPress={() => handleServingsChange(-1)}
            >
              <Text style={styles.servingsButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.servingsValue}>{servings}</Text>
            <TouchableOpacity
              style={styles.servingsButton}
              onPress={() => handleServingsChange(1)}
            >
              <Text style={styles.servingsButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Ingredient List */}
      <ScrollView style={styles.scrollView}>
        {Object.keys(groupedIngredients).map((category) => (
          <View key={category} style={styles.categorySection}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{categoryIcons[category] || '🥄'}</Text>
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>

            {/* Category Items */}
            {groupedIngredients[category].map((item: any) => {
              const isChecked = checkedItems.has(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.item, isChecked && styles.itemChecked]}
                  onPress={() => handleToggleCheck(item.id)}
                  activeOpacity={0.7}
                >
                  {/* Checkbox */}
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Text style={styles.checkmark}>✓</Text>}
                  </View>

                  {/* Quantity */}
                  <View style={styles.quantityContainer}>
                    <Text style={[styles.quantity, isChecked && styles.quantityChecked]}>
                      {adjustQuantity(item.quantity)}
                    </Text>
                    <Text style={[styles.unit, isChecked && styles.unitChecked]}>
                      {item.unit}
                    </Text>
                  </View>

                  {/* Ingredient Name */}
                  <Text style={[styles.ingredientName, isChecked && styles.ingredientNameChecked]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  servingsControl: {
    alignItems: 'flex-end',
  },
  servingsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  servingsAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 4,
  },
  servingsButton: {
    width: 32,
    height: 32,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  servingsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemChecked: {
    backgroundColor: '#f9fafb',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  quantityContainer: {
    minWidth: 80,
    marginRight: 12,
  },
  quantity: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366f1',
  },
  quantityChecked: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  unit: {
    fontSize: 13,
    color: '#6b7280',
  },
  unitChecked: {
    color: '#9ca3af',
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  ingredientNameChecked: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});`;

  return {
    code,
    imports: []
  };
}
