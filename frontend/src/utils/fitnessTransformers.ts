/**
 * Fitness Module Transformers
 * Converts between snake_case (backend) and camelCase (frontend) for fitness data
 */

import {
  transformKeysToCamel,
  transformKeysToSnake,
  transformPaginatedResponse,
  transformSingleResponse,
  prepareForBackend,
} from './caseTransformers';

import type {
  UserFitnessProfile,
  FitnessStats,
  FitnessGoal,
  Workout,
  WorkoutPlan,
  Exercise,
  Achievement,
  WorkoutReminder,
  ProgressEntry,
  PersonalRecord,
  TodayWorkout,
  TodayWorkoutsResponse,
  CurrentWorkoutSession,
} from '../types/fitness';

// ============================================================================
// Fitness Profile Transformers
// ============================================================================

/**
 * Transform fitness profile from backend (snake_case) to frontend (camelCase)
 */
export function transformFitnessProfileFromBackend(profile: any): UserFitnessProfile {
  if (!profile) return profile;

  return {
    id: profile.id,
    userId: profile.user_id || profile.userId,
    name: profile.name,
    profileImage: profile.profile_image || profile.profileImage,
    gender: profile.gender,
    age: profile.age,
    height: profile.height,
    weight: profile.weight,
    activityLevel: profile.activity_level || profile.activityLevel,
    fitnessGoal: profile.fitness_goal || profile.fitnessGoal,
    targetWeight: profile.target_weight || profile.targetWeight,
    workoutLocation: profile.workout_location || profile.workoutLocation,
    points: profile.points || 0,
    achievements: profile.achievements || [],
    createdAt: profile.created_at || profile.createdAt,
    updatedAt: profile.updated_at || profile.updatedAt,
  };
}

/**
 * Transform fitness profile to backend (snake_case)
 */
export function transformFitnessProfileToBackend(profile: Partial<UserFitnessProfile>): any {
  if (!profile) return profile;

  const transformed: any = {};

  if (profile.name !== undefined) transformed.name = profile.name;
  if (profile.profileImage !== undefined) transformed.profile_image = profile.profileImage;
  if (profile.gender !== undefined) transformed.gender = profile.gender;
  if (profile.age !== undefined) transformed.age = profile.age;
  if (profile.height !== undefined) transformed.height = profile.height;
  if (profile.weight !== undefined) transformed.weight = profile.weight;
  if (profile.activityLevel !== undefined) transformed.activity_level = profile.activityLevel;
  if (profile.fitnessGoal !== undefined) transformed.fitness_goal = profile.fitnessGoal;
  if (profile.targetWeight !== undefined) transformed.target_weight = profile.targetWeight;
  if (profile.workoutLocation !== undefined) transformed.workout_location = profile.workoutLocation;

  return transformed;
}

// ============================================================================
// Workout Plan Transformers
// ============================================================================

/**
 * Transform workout plan from backend to frontend
 */
export function transformWorkoutPlanFromBackend(plan: any): WorkoutPlan {
  if (!plan) return plan;

  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    workouts: (plan.workouts || []).map((w: any) => transformWorkoutFromBackend(w)),
    createdAt: plan.created_at || plan.createdAt,
    updatedAt: plan.updated_at || plan.updatedAt,
  };
}

/**
 * Transform workout from backend to frontend
 */
export function transformWorkoutFromBackend(workout: any): Workout {
  if (!workout) return workout;

  return {
    id: workout.id,
    name: workout.name,
    date: workout.date,
    exercises: (workout.exercises || []).map((e: any) => ({
      exerciseId: e.exercise_id || e.exerciseId,
      sets: e.sets || [],
      notes: e.notes,
    })),
    duration: workout.duration || workout.estimated_duration,
    notes: workout.notes || workout.description,
  };
}

/**
 * Transform workout plan to backend
 */
export function transformWorkoutPlanToBackend(plan: Partial<WorkoutPlan>): any {
  if (!plan) return plan;

  return prepareForBackend({
    name: plan.name,
    description: plan.description,
    workouts: plan.workouts,
  });
}

// ============================================================================
// Today's Workout Transformers
// ============================================================================

/**
 * Transform today's workouts response from backend
 */
export function transformTodayWorkoutsFromBackend(response: any): TodayWorkoutsResponse {
  if (!response) return response;

  return {
    date: response.date,
    totalPlans: response.total_plans || response.totalPlans || 0,
    workouts: (response.workouts || []).map((w: any) => transformTodayWorkoutFromBackend(w)),
    totalExercises: response.total_exercises || response.totalExercises || 0,
    totalDuration: response.total_duration || response.totalDuration || 0,
  };
}

/**
 * Transform single today workout from backend
 */
export function transformTodayWorkoutFromBackend(workout: any): TodayWorkout {
  if (!workout) return workout;

  return {
    plan_id: workout.plan_id || workout.planId,
    plan_name: workout.plan_name || workout.planName,
    current_day: workout.current_day || workout.currentDay,
    total_days: workout.total_days || workout.totalDays,
    workout_name: workout.workout_name || workout.workoutName,
    workout_description: workout.workout_description || workout.workoutDescription,
    estimated_duration: workout.estimated_duration || workout.estimatedDuration,
    exercises: (workout.exercises || []).map((e: any) => ({
      exercise_id: e.exercise_id || e.exerciseId,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight,
      rest_time: e.rest_time || e.restTime,
      notes: e.notes,
    })),
    days_since_started: workout.days_since_started || workout.daysSinceStarted,
    started_at: workout.started_at || workout.startedAt,
  };
}

// ============================================================================
// Fitness Stats Transformers
// ============================================================================

/**
 * Transform fitness stats from backend
 */
export function transformFitnessStatsFromBackend(stats: any): FitnessStats {
  if (!stats) return stats;

  return {
    totalWorkouts: stats.total_workouts || stats.totalWorkouts || 0,
    totalExercises: stats.total_exercises || stats.totalExercises || 0,
    totalWeight: stats.total_weight || stats.totalWeight || 0,
    totalDuration: stats.total_duration || stats.totalDuration || 0,
    currentStreak: stats.current_streak || stats.currentStreak || 0,
    longestStreak: stats.longest_streak || stats.longestStreak || 0,
  };
}

// ============================================================================
// Fitness Goal Transformers
// ============================================================================

/**
 * Transform fitness goal from backend
 */
export function transformFitnessGoalFromBackend(goal: any): FitnessGoal {
  if (!goal) return goal;

  return {
    id: goal.id,
    type: goal.type,
    target: goal.target,
    current: goal.current,
    unit: goal.unit,
    deadline: goal.deadline,
    createdAt: goal.created_at || goal.createdAt,
  };
}

/**
 * Transform fitness goal to backend
 */
export function transformFitnessGoalToBackend(goal: Partial<FitnessGoal>): any {
  if (!goal) return goal;

  return prepareForBackend({
    type: goal.type,
    target: goal.target,
    current: goal.current,
    unit: goal.unit,
    deadline: goal.deadline,
  });
}

// ============================================================================
// Exercise Transformers
// ============================================================================

/**
 * Transform exercise from backend
 */
export function transformExerciseFromBackend(exercise: any): Exercise {
  if (!exercise) return exercise;

  return {
    id: exercise.id,
    name: exercise.name,
    category: exercise.category,
    muscleGroups: exercise.muscle_groups || exercise.muscleGroups || [],
    equipment: exercise.equipment,
    instructions: exercise.instructions,
  };
}

// ============================================================================
// Achievement Transformers
// ============================================================================

/**
 * Transform achievement from backend
 */
export function transformAchievementFromBackend(achievement: any): Achievement {
  if (!achievement) return achievement;

  return {
    id: achievement.id,
    name: achievement.name,
    description: achievement.description,
    points: achievement.points,
    iconUrl: achievement.icon_url || achievement.iconUrl,
    category: achievement.category,
    criteria: achievement.criteria,
    isActive: achievement.is_active ?? achievement.isActive ?? true,
    createdAt: achievement.created_at || achievement.createdAt,
    updatedAt: achievement.updated_at || achievement.updatedAt,
    icon: achievement.icon,
    unlockedAt: achievement.unlocked_at || achievement.unlockedAt,
    progress: achievement.progress,
    target: achievement.target,
  };
}

// ============================================================================
// Progress Entry Transformers
// ============================================================================

/**
 * Transform progress entry from backend
 */
export function transformProgressEntryFromBackend(entry: any): ProgressEntry {
  if (!entry) return entry;

  return {
    id: entry.id,
    userId: entry.user_id || entry.userId,
    date: entry.date,
    weight: entry.weight,
    bodyFat: entry.body_fat || entry.bodyFat,
    measurements: entry.measurements ? {
      chest: entry.measurements.chest,
      waist: entry.measurements.waist,
      hips: entry.measurements.hips,
      biceps: entry.measurements.biceps,
      thighs: entry.measurements.thighs,
      calves: entry.measurements.calves,
    } : undefined,
    photos: entry.photos,
  };
}

/**
 * Transform progress entry to backend
 */
export function transformProgressEntryToBackend(entry: Partial<ProgressEntry>): any {
  if (!entry) return entry;

  return prepareForBackend({
    date: entry.date,
    weight: entry.weight,
    bodyFat: entry.bodyFat,
    measurements: entry.measurements,
    photos: entry.photos,
  });
}

// ============================================================================
// Workout Session Transformers
// ============================================================================

/**
 * Transform workout session from backend
 */
export function transformWorkoutSessionFromBackend(session: any): CurrentWorkoutSession {
  if (!session) return session;

  return {
    id: session.id,
    userId: session.user_id || session.userId,
    name: session.name,
    date: session.date,
    exercises: session.exercises || [],
    duration: session.duration,
    intensity: session.intensity,
    caloriesBurned: session.calories_burned || session.caloriesBurned,
    personalRecords: session.personal_records || session.personalRecords,
    notes: session.notes,
    weightRecorded: session.weight_recorded || session.weightRecorded,
    bodyFatPercentage: session.body_fat_percentage || session.bodyFatPercentage,
    restingHeartRate: session.resting_heart_rate || session.restingHeartRate,
    bloodPressure: session.blood_pressure || session.bloodPressure,
    mood: session.mood,
    energyLevel: session.energy_level || session.energyLevel,
    sleepHours: session.sleep_hours || session.sleepHours,
    waterIntake: session.water_intake || session.waterIntake,
    completed: session.completed,
    createdAt: session.created_at || session.createdAt,
    updatedAt: session.updated_at || session.updatedAt,
  };
}

/**
 * Transform workout session to backend
 */
export function transformWorkoutSessionToBackend(session: Partial<CurrentWorkoutSession>): any {
  if (!session) return session;

  return prepareForBackend({
    name: session.name,
    date: session.date,
    exercises: session.exercises,
    duration: session.duration,
    intensity: session.intensity,
    caloriesBurned: session.caloriesBurned,
    personalRecords: session.personalRecords,
    notes: session.notes,
    weightRecorded: session.weightRecorded,
    bodyFatPercentage: session.bodyFatPercentage,
    restingHeartRate: session.restingHeartRate,
    bloodPressure: session.bloodPressure,
    mood: session.mood,
    energyLevel: session.energyLevel,
    sleepHours: session.sleepHours,
    waterIntake: session.waterIntake,
    completed: session.completed,
  });
}

// ============================================================================
// Reminder Transformers
// ============================================================================

/**
 * Transform workout reminder from backend
 */
export function transformWorkoutReminderFromBackend(reminder: any): WorkoutReminder {
  if (!reminder) return reminder;

  return {
    id: reminder.id,
    userId: reminder.user_id || reminder.userId,
    time: reminder.time,
    days: reminder.days,
    enabled: reminder.enabled,
    message: reminder.message,
  };
}

/**
 * Transform workout reminder to backend
 */
export function transformWorkoutReminderToBackend(reminder: Partial<WorkoutReminder>): any {
  if (!reminder) return reminder;

  return prepareForBackend({
    time: reminder.time,
    days: reminder.days,
    enabled: reminder.enabled,
    message: reminder.message,
  });
}

// ============================================================================
// List Response Transformers
// ============================================================================

/**
 * Transform paginated workout plans response
 */
export function transformWorkoutPlansListResponse(response: any): {
  data: WorkoutPlan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformWorkoutPlanFromBackend),
  };
}

/**
 * Transform paginated exercises response
 */
export function transformExercisesListResponse(response: any): {
  data: Exercise[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformExerciseFromBackend),
  };
}

/**
 * Transform paginated achievements response
 */
export function transformAchievementsListResponse(response: any): {
  data: Achievement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformAchievementFromBackend),
  };
}

/**
 * Transform paginated progress entries response
 */
export function transformProgressEntriesListResponse(response: any): {
  data: ProgressEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformProgressEntryFromBackend),
  };
}

/**
 * Transform paginated workout sessions response
 */
export function transformWorkoutSessionsListResponse(response: any): {
  data: CurrentWorkoutSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformWorkoutSessionFromBackend),
  };
}

// ============================================================================
// Single Response Transformers
// ============================================================================

/**
 * Transform single fitness profile response
 */
export function transformFitnessProfileResponse(response: any): UserFitnessProfile | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformFitnessProfileFromBackend(data) : null;
}

/**
 * Transform single workout plan response
 */
export function transformWorkoutPlanResponse(response: any): WorkoutPlan | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformWorkoutPlanFromBackend(data) : null;
}

/**
 * Transform single workout session response
 */
export function transformWorkoutSessionResponse(response: any): CurrentWorkoutSession | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformWorkoutSessionFromBackend(data) : null;
}
