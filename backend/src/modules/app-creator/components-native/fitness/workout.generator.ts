/**
 * Workout Component Generator (React Native)
 *
 * Generates workout tracking components including stats, history, logging form, and progress charts.
 * Features: Stats cards, FlatList for workout history, form with exercise entries, progress visualization.
 */

export interface WorkoutOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateWorkoutStats(options: WorkoutOptions = {}): string {
  const { componentName = 'WorkoutStats', endpoint = '/workout-stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface StatsData {
  calories_burned?: number;
  total_time?: string;
  workouts_count?: number;
  streak?: number;
}

interface StatItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['workout-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const statItems: StatItem[] = [
    {
      icon: 'flame-outline',
      label: 'Calories Burned',
      value: stats?.calories_burned || 0,
      color: '#F97316',
      bgColor: '#FFF7ED',
    },
    {
      icon: 'time-outline',
      label: 'Total Time',
      value: stats?.total_time || '0h',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      icon: 'fitness-outline',
      label: 'Workouts',
      value: stats?.workouts_count || 0,
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
    {
      icon: 'trending-up-outline',
      label: 'Current Streak',
      value: (stats?.streak || 0) + ' days',
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
    },
  ];

  return (
    <View style={styles.container}>
      {statItems.map((stat, i) => (
        <View key={i} style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
            <Ionicons name={stat.icon} size={20} color={stat.color} />
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateWorkoutList(options: WorkoutOptions = {}): string {
  const { componentName = 'WorkoutList', endpoint = '/workouts' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Workout {
  id: string;
  name?: string;
  type?: string;
  date?: string;
  created_at?: string;
  duration?: number;
  calories_burned?: number;
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: workouts, isLoading, refetch } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleAddWorkout = () => {
    navigation.navigate('WorkoutForm' as never);
  };

  const handleWorkoutPress = (workout: Workout) => {
    navigation.navigate('WorkoutDetail' as never, { workoutId: workout.id } as never);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  const renderWorkoutItem = useCallback(({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.workoutItem}
      onPress={() => handleWorkoutPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.workoutIcon}>
        <Ionicons name="barbell-outline" size={24} color="#F97316" />
      </View>
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutName}>{item.name || item.type}</Text>
        <Text style={styles.workoutDate}>
          {formatDate(item.date || item.created_at)}
        </Text>
      </View>
      <View style={styles.workoutStats}>
        {item.duration && (
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{item.duration} min</Text>
          </View>
        )}
        {item.calories_burned && (
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={14} color="#F97316" />
            <Text style={styles.statTextHighlight}>{item.calories_burned} cal</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  ), []);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="barbell-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No workouts logged yet</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleAddWorkout}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyButtonText}>Log Your First Workout</Text>
      </TouchableOpacity>
    </View>
  ), []);

  const keyExtractor = useCallback((item: Workout) => item.id, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Workouts</Text>
        <TouchableOpacity onPress={handleAddWorkout} activeOpacity={0.7}>
          <Text style={styles.addButton}>+ Add Workout</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F97316"
            colors={['#F97316']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  workoutStats: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statTextHighlight: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

export function generateWorkoutForm(options: WorkoutOptions = {}): string {
  const { componentName = 'WorkoutForm', endpoint = '/workouts' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

interface FormData {
  name: string;
  type: string;
  duration: string;
  calories_burned: string;
  notes: string;
  exercises: Exercise[];
}

const workoutTypes = [
  'Strength',
  'Cardio',
  'HIIT',
  'Yoga',
  'Pilates',
  'CrossFit',
  'Swimming',
  'Running',
  'Cycling',
  'Other',
];

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    duration: '',
    calories_burned: '',
    notes: '',
    exercises: [{ name: '', sets: '', reps: '', weight: '' }],
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('${endpoint}', data),
    onSuccess: () => {
      showToast('success', 'Workout logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout-stats'] });
      navigation.goBack();
    },
    onError: () => {
      showToast('error', 'Failed to log workout');
    },
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: '', reps: '', weight: '' }],
    }));
  };

  const removeExercise = (index: number) => {
    if (formData.exercises.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.exercises];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, exercises: updated };
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation', 'Please enter a workout name');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Log Workout</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Workout Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="e.g., Morning Strength Training"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.type}
              onValueChange={(value) => updateField('type', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select type..." value="" />
              {workoutTypes.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>
              <Ionicons name="time-outline" size={14} color="#6B7280" /> Duration (min)
            </Text>
            <TextInput
              style={styles.input}
              value={formData.duration}
              onChangeText={(value) => updateField('duration', value)}
              placeholder="60"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>
              <Ionicons name="flame-outline" size={14} color="#6B7280" /> Calories
            </Text>
            <TextInput
              style={styles.input}
              value={formData.calories_burned}
              onChangeText={(value) => updateField('calories_burned', value)}
              placeholder="500"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.exercisesSection}>
          <View style={styles.exercisesHeader}>
            <Text style={styles.label}>Exercises</Text>
            <TouchableOpacity onPress={addExercise} activeOpacity={0.7}>
              <View style={styles.addExerciseButton}>
                <Ionicons name="add" size={16} color="#3B82F6" />
                <Text style={styles.addExerciseText}>Add Exercise</Text>
              </View>
            </TouchableOpacity>
          </View>

          {formData.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseRow}>
              <TextInput
                style={[styles.input, styles.exerciseNameInput]}
                value={exercise.name}
                onChangeText={(value) => updateExercise(index, 'name', value)}
                placeholder="Exercise name"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={[styles.input, styles.exerciseSmallInput]}
                value={exercise.sets}
                onChangeText={(value) => updateExercise(index, 'sets', value)}
                placeholder="Sets"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.exerciseSmallInput]}
                value={exercise.reps}
                onChangeText={(value) => updateExercise(index, 'reps', value)}
                placeholder="Reps"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.exerciseSmallInput]}
                value={exercise.weight}
                onChangeText={(value) => updateExercise(index, 'weight', value)}
                placeholder="Weight"
                placeholderTextColor="#9CA3AF"
              />
              {formData.exercises.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeExercise(index)}
                  activeOpacity={0.7}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => updateField('notes', value)}
            placeholder="How did the workout feel?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
          activeOpacity={0.7}
        >
          {createMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="barbell-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Log Workout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

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
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  exercisesSection: {
    marginBottom: 20,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addExerciseText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  exerciseNameInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
  },
  exerciseSmallInput: {
    width: 55,
    padding: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#FDBA74',
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

export function generateProgressCharts(options: WorkoutOptions = {}): string {
  const { componentName = 'ProgressCharts', endpoint = '/progress' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ProgressData {
  weight?: number;
  previous_weight?: number;
  weight_goal?: number;
  body_fat?: number;
  previous_body_fat?: number;
  body_fat_goal?: number;
  muscle_mass?: number;
  previous_muscle_mass?: number;
  muscle_goal?: number;
}

interface Metric {
  label: string;
  current: number | undefined;
  previous: number | undefined;
  unit: string;
  goal: number | undefined;
}

const ${componentName}: React.FC = () => {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const metrics: Metric[] = [
    {
      label: 'Weight',
      current: progress?.weight,
      previous: progress?.previous_weight,
      unit: 'lbs',
      goal: progress?.weight_goal,
    },
    {
      label: 'Body Fat',
      current: progress?.body_fat,
      previous: progress?.previous_body_fat,
      unit: '%',
      goal: progress?.body_fat_goal,
    },
    {
      label: 'Muscle Mass',
      current: progress?.muscle_mass,
      previous: progress?.previous_muscle_mass,
      unit: 'lbs',
      goal: progress?.muscle_goal,
    },
  ];

  const calculateChange = (current?: number, previous?: number): number => {
    if (current === undefined || previous === undefined) return 0;
    return current - previous;
  };

  const calculateProgress = (current?: number, goal?: number): number => {
    if (current === undefined || goal === undefined || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={20} color="#111827" />
        <Text style={styles.headerTitle}>Progress Tracking</Text>
      </View>

      {metrics.map((metric, i) => {
        const change = calculateChange(metric.current, metric.previous);
        const progressPercent = calculateProgress(metric.current, metric.goal);

        return (
          <View key={i} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>
                  {metric.current !== undefined ? metric.current : '-'} {metric.unit}
                </Text>
                {change !== 0 && (
                  <View style={[styles.changeBadge, change > 0 ? styles.changeBadgeUp : styles.changeBadgeDown]}>
                    <Ionicons
                      name={change > 0 ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={change > 0 ? '#EF4444' : '#10B981'}
                    />
                    <Text style={[styles.changeText, change > 0 ? styles.changeTextUp : styles.changeTextDown]}>
                      {Math.abs(change).toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {metric.goal !== undefined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: progressPercent + '%' }]}
                  />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabel}>
                    Current: {metric.current ?? '-'} {metric.unit}
                  </Text>
                  <Text style={styles.progressLabel}>
                    Goal: {metric.goal} {metric.unit}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  metricCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeBadgeUp: {
    backgroundColor: '#FEE2E2',
  },
  changeBadgeDown: {
    backgroundColor: '#D1FAE5',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  changeTextUp: {
    color: '#EF4444',
  },
  changeTextDown: {
    color: '#10B981',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
