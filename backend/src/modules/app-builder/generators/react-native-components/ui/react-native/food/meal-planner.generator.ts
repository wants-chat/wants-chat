/**
 * React Native Meal Planner Component Generator
 *
 * Generates a weekly meal planning calendar showing:
 * - Week navigation (previous/next week)
 * - Day headers with dates
 * - Meal slots for Breakfast, Lunch, Dinner, Snack
 * - Add meal functionality
 * - Weekly stats (calories, meals planned)
 */

export function generateRNMealPlanner(): { code: string; imports: string[] } {
  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MealPlannerProps {
  mealPlan?: any;
  mealPlans?: any;
  data?: any;
  entity?: string;
  onAddMeal?: (day: string, mealType: string) => void;
  onMealPress?: (meal: any) => void;
  [key: string]: any;
}

export default function MealPlanner({ mealPlan, mealPlans, data, entity = 'meal-plans', onAddMeal, onMealPress, ...props }: MealPlannerProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const propData = mealPlan || mealPlans || data;

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const planData = propData || fetchedData || {};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

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

  // Get week dates
  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + (offset * 7);
    const monday = new Date(today.setDate(diff));

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        fullDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
        date: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        fullDate: date.toISOString().split('T')[0],
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    return weekDates;
  };

  const weekDates = getWeekDates(currentWeekOffset);
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  // Mock meals data - in real app this would come from props
  const meals = planData.meals || {};

  const getMealsForDayAndType = (dateStr: string, mealType: string) => {
    return meals[dateStr]?.[mealType.toLowerCase()] || [];
  };

  const totalPlannedMeals = Object.values(meals).reduce((sum: number, day: any) => {
    return sum + Object.values(day).reduce((daySum: number, meals: any) => {
      return daySum + (Array.isArray(meals) ? meals.length : 0);
    }, 0);
  }, 0);

  const estimatedCalories = totalPlannedMeals * 450; // Rough estimate

  const handlePreviousWeek = () => {
    setCurrentWeekOffset(currentWeekOffset - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset(currentWeekOffset + 1);
  };

  const handleAddMeal = (dateStr: string, mealType: string) => {
    if (onAddMeal) {
      onAddMeal(dateStr, mealType);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Meal Planner</Text>
            <Text style={styles.headerSubtitle}>Plan your weekly meals</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Text style={styles.statValue}>{totalPlannedMeals}</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statValue}>{estimatedCalories}</Text>
              <Text style={styles.statLabel}>kcal</Text>
            </View>
          </View>
        </View>

        {/* Week Navigation */}
        <View style={styles.weekNav}>
          <TouchableOpacity style={styles.navButton} onPress={handlePreviousWeek}>
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.weekInfo}>
            <Text style={styles.weekText}>
              {weekDates[0].month} {weekDates[0].date} - {weekDates[6].month} {weekDates[6].date}
            </Text>
            {currentWeekOffset === 0 && (
              <Text style={styles.currentWeekBadge}>This Week</Text>
            )}
          </View>
          <TouchableOpacity style={styles.navButton} onPress={handleNextWeek}>
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.calendarContainer}>
          {/* Day Headers */}
          <View style={styles.dayHeadersRow}>
            <View style={styles.mealTypeColumn} />
            {weekDates.map((day) => (
              <View
                key={day.fullDate}
                style={[
                  styles.dayHeader,
                  day.isToday && styles.dayHeaderToday
                ]}
              >
                <Text style={[styles.dayName, day.isToday && styles.dayNameToday]}>
                  {day.day}
                </Text>
                <Text style={[styles.dayDate, day.isToday && styles.dayDateToday]}>
                  {day.date}
                </Text>
              </View>
            ))}
          </View>

          {/* Meal Rows */}
          {mealTypes.map((mealType) => (
            <View key={mealType} style={styles.mealRow}>
              <View style={styles.mealTypeLabel}>
                <Text style={styles.mealTypeIcon}>
                  {mealType === 'Breakfast' ? '🌅' :
                   mealType === 'Lunch' ? '🌞' :
                   mealType === 'Dinner' ? '🌙' : '🍪'}
                </Text>
                <Text style={styles.mealTypeText}>{mealType}</Text>
              </View>
              {weekDates.map((day) => {
                const dayMeals = getMealsForDayAndType(day.fullDate, mealType);
                return (
                  <TouchableOpacity
                    key={\`\${day.fullDate}-\${mealType}\`}
                    style={[
                      styles.mealSlot,
                      day.isToday && styles.mealSlotToday
                    ]}
                    onPress={() => handleAddMeal(day.fullDate, mealType)}
                  >
                    {dayMeals.length > 0 ? (
                      dayMeals.map((meal: any, idx: number) => (
                        <View key={idx} style={styles.mealItem}>
                          <Text style={styles.mealName} numberOfLines={2}>
                            {toDisplayString(meal.name || meal.title, 'Meal')}
                          </Text>
                          {meal.calories && (
                            <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptySlot}>
                        <Text style={styles.addMealIcon}>+</Text>
                        <Text style={styles.addMealText}>Add meal</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 36,
    height: 36,
    backgroundColor: '#6366f1',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  currentWeekBadge: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    padding: 16,
  },
  dayHeadersRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  mealTypeColumn: {
    width: 100,
  },
  dayHeader: {
    width: 140,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  dayHeaderToday: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  dayNameToday: {
    color: '#6366f1',
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  dayDateToday: {
    color: '#6366f1',
  },
  mealRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  mealTypeLabel: {
    width: 100,
    justifyContent: 'center',
    paddingRight: 8,
  },
  mealTypeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  mealTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  mealSlot: {
    width: 140,
    minHeight: 100,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  mealSlotToday: {
    borderColor: '#c7d2fe',
  },
  mealItem: {
    marginBottom: 8,
  },
  mealName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 11,
    color: '#6b7280',
  },
  emptySlot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMealIcon: {
    fontSize: 24,
    color: '#9ca3af',
    marginBottom: 4,
  },
  addMealText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
  },
});`;

  return {
    code,
    imports: []
  };
}
