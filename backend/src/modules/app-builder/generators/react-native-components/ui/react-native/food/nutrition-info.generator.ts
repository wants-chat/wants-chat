/**
 * React Native Nutrition Info Component Generator
 *
 * Generates a comprehensive nutrition facts display showing:
 * - Calorie count with visual prominence
 * - Macronutrients (Protein, Carbs, Fat) with progress bars
 * - Daily value percentages
 * - Vitamins and minerals
 * - Health badges (Low Calorie, High Protein, etc.)
 * - FDA-style nutrition label
 */

export function generateRNNutritionInfo(): { code: string; imports: string[] } {
  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

interface NutritionInfoProps {
  nutrition?: any;
  nutritionInfo?: any;
  data?: any;
  entity?: string;
  servings?: number;
  [key: string]: any;
}

export default function NutritionInfo({ nutrition, nutritionInfo, data: propData, entity = 'nutrition', servings = 1, ...props }: NutritionInfoProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData || nutrition || nutritionInfo) return;
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
  }, [entity, propData, nutrition, nutritionInfo]);

  const sourceData = propData || fetchedData || {};
  const nutritionData = nutrition || nutritionInfo || sourceData || {};

  const toNumber = (value: any, fallback: number = 0): number => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || fallback;
    return fallback;
  };

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

  // Extract nutrition values
  const calories = toNumber(nutritionData.calories, 350);
  const protein = toNumber(nutritionData.protein, 25);
  const carbs = toNumber(nutritionData.carbs || nutritionData.carbohydrates, 45);
  const fat = toNumber(nutritionData.fat || nutritionData.total_fat, 12);
  const fiber = toNumber(nutritionData.fiber || nutritionData.dietary_fiber, 5);
  const sugar = toNumber(nutritionData.sugar, 8);
  const sodium = toNumber(nutritionData.sodium, 450);
  const cholesterol = toNumber(nutritionData.cholesterol, 35);
  const saturatedFat = toNumber(nutritionData.saturated_fat, 4);

  // Vitamins and minerals (% daily value)
  const vitaminA = toNumber(nutritionData.vitamin_a, 15);
  const vitaminC = toNumber(nutritionData.vitamin_c, 20);
  const calcium = toNumber(nutritionData.calcium, 10);
  const iron = toNumber(nutritionData.iron, 8);

  // Calculate daily value percentages (based on 2000 calorie diet)
  const dailyValues = {
    fat: Math.round((fat / 78) * 100),
    saturatedFat: Math.round((saturatedFat / 20) * 100),
    cholesterol: Math.round((cholesterol / 300) * 100),
    sodium: Math.round((sodium / 2300) * 100),
    carbs: Math.round((carbs / 275) * 100),
    fiber: Math.round((fiber / 28) * 100),
    sugar: Math.round((sugar / 50) * 100),
    protein: Math.round((protein / 50) * 100),
  };

  // Determine health badges
  const badges = [];
  if (calories < 200) badges.push({ label: 'Low Calorie', color: '#10b981' });
  if (protein > 20) badges.push({ label: 'High Protein', color: '#8b5cf6' });
  if (fat < 10) badges.push({ label: 'Low Fat', color: '#3b82f6' });
  if (fiber > 5) badges.push({ label: 'High Fiber', color: '#f59e0b' });

  const getMacroColor = (macro: string): string => {
    switch (macro) {
      case 'protein': return '#8b5cf6';
      case 'carbs': return '#f59e0b';
      case 'fat': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getDVColor = (percentage: number): string => {
    if (percentage >= 20) return '#ef4444'; // Red - High
    if (percentage >= 10) return '#f59e0b'; // Orange - Medium
    return '#10b981'; // Green - Low
  };

  if (loading && !propData && !nutrition && !nutritionInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Calories Section */}
      <View style={styles.caloriesSection}>
        <View style={styles.caloriesHeader}>
          <Text style={styles.caloriesLabel}>Calories</Text>
          <Text style={styles.servingsText}>per serving</Text>
        </View>
        <Text style={styles.caloriesValue}>{calories}</Text>
        <Text style={styles.caloriesSubtext}>kcal</Text>

        {/* Health Badges */}
        {badges.length > 0 && (
          <View style={styles.badgesContainer}>
            {badges.map((badge, index) => (
              <View key={index} style={[styles.badge, { backgroundColor: badge.color }]}>
                <Text style={styles.badgeText}>{badge.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Macronutrients Section */}
      <View style={styles.macrosSection}>
        <Text style={styles.sectionTitle}>Macronutrients</Text>

        {/* Protein */}
        <View style={styles.macroItem}>
          <View style={styles.macroHeader}>
            <Text style={styles.macroIcon}>💪</Text>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{protein}g</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: \`\${Math.min(dailyValues.protein, 100)}%\`,
                  backgroundColor: getMacroColor('protein')
                }
              ]}
            />
          </View>
          <Text style={styles.dvText}>{dailyValues.protein}% Daily Value</Text>
        </View>

        {/* Carbs */}
        <View style={styles.macroItem}>
          <View style={styles.macroHeader}>
            <Text style={styles.macroIcon}>🌾</Text>
            <Text style={styles.macroLabel}>Carbohydrates</Text>
            <Text style={styles.macroValue}>{carbs}g</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: \`\${Math.min(dailyValues.carbs, 100)}%\`,
                  backgroundColor: getMacroColor('carbs')
                }
              ]}
            />
          </View>
          <Text style={styles.dvText}>{dailyValues.carbs}% Daily Value</Text>
        </View>

        {/* Fat */}
        <View style={styles.macroItem}>
          <View style={styles.macroHeader}>
            <Text style={styles.macroIcon}>🫒</Text>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>{fat}g</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: \`\${Math.min(dailyValues.fat, 100)}%\`,
                  backgroundColor: getMacroColor('fat')
                }
              ]}
            />
          </View>
          <Text style={styles.dvText}>{dailyValues.fat}% Daily Value</Text>
        </View>
      </View>

      {/* Nutrition Facts Label */}
      <View style={styles.labelSection}>
        <Text style={styles.labelTitle}>Nutrition Facts</Text>
        <View style={styles.labelDivider} />

        {/* Detailed Breakdown */}
        <View style={styles.labelRow}>
          <Text style={styles.labelItem}>Dietary Fiber {fiber}g</Text>
          <Text style={[styles.labelDV, { color: getDVColor(dailyValues.fiber) }]}>
            {dailyValues.fiber}%
          </Text>
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.labelItem}>Total Sugars {sugar}g</Text>
          <Text style={[styles.labelDV, { color: getDVColor(dailyValues.sugar) }]}>
            {dailyValues.sugar}%
          </Text>
        </View>

        <View style={styles.labelDivider} />

        <View style={styles.labelRow}>
          <Text style={styles.labelItem}>Saturated Fat {saturatedFat}g</Text>
          <Text style={[styles.labelDV, { color: getDVColor(dailyValues.saturatedFat) }]}>
            {dailyValues.saturatedFat}%
          </Text>
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.labelItem}>Cholesterol {cholesterol}mg</Text>
          <Text style={[styles.labelDV, { color: getDVColor(dailyValues.cholesterol) }]}>
            {dailyValues.cholesterol}%
          </Text>
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.labelItem}>Sodium {sodium}mg</Text>
          <Text style={[styles.labelDV, { color: getDVColor(dailyValues.sodium) }]}>
            {dailyValues.sodium}%
          </Text>
        </View>

        <View style={styles.labelDivider} />

        {/* Vitamins & Minerals */}
        <Text style={styles.vitaminsTitle}>Vitamins & Minerals</Text>
        <View style={styles.vitaminsGrid}>
          <View style={styles.vitaminItem}>
            <Text style={styles.vitaminLabel}>Vitamin A</Text>
            <Text style={styles.vitaminValue}>{vitaminA}%</Text>
          </View>
          <View style={styles.vitaminItem}>
            <Text style={styles.vitaminLabel}>Vitamin C</Text>
            <Text style={styles.vitaminValue}>{vitaminC}%</Text>
          </View>
          <View style={styles.vitaminItem}>
            <Text style={styles.vitaminLabel}>Calcium</Text>
            <Text style={styles.vitaminValue}>{calcium}%</Text>
          </View>
          <View style={styles.vitaminItem}>
            <Text style={styles.vitaminLabel}>Iron</Text>
            <Text style={styles.vitaminValue}>{iron}%</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          * Percent Daily Values are based on a 2,000 calorie diet.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  caloriesSection: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  caloriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  caloriesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  servingsText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  caloriesValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#6366f1',
  },
  caloriesSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: -8,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  macrosSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  macroItem: {
    marginBottom: 20,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  macroLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  dvText: {
    fontSize: 12,
    color: '#6b7280',
  },
  labelSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  labelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  labelDivider: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginVertical: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  labelItem: {
    fontSize: 14,
    color: '#374151',
  },
  labelDV: {
    fontSize: 14,
    fontWeight: '600',
  },
  vitaminsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 12,
  },
  vitaminsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitaminItem: {
    width: '47%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  vitaminLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  vitaminValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366f1',
  },
  disclaimer: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 16,
    fontStyle: 'italic',
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
