// Fitness types
export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sports';
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
}

export interface WorkoutSet {
  reps: number;
  weight?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  restTime?: number; // in seconds
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  date: Date;
  exercises: WorkoutExercise[];
  duration: number; // in minutes
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  workouts: Workout[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FitnessGoal {
  id: string;
  type: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness';
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  createdAt: Date;
}

export interface FitnessStats {
  totalWorkouts: number;
  totalExercises: number;
  totalWeight: number; // in kg
  totalDuration: number; // in minutes
  currentStreak: number; // in days
  longestStreak: number; // in days
}

// User fitness profile types
export interface UserFitnessProfile {
  id: string;
  userId: string;
  name?: string;
  profileImage?: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number; // in cm
  weight: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_fitness';
  targetWeight?: number;
  workoutLocation: 'gym' | 'home' | 'both';
  points?: number;
  achievements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// BMI related types
export interface BMIData {
  value: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  date: Date;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  iconUrl?: string;
  category: string;
  criteria: {
    type: string;
    workoutCount?: number;
    [key: string]: any;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended properties for UI
  icon?: string;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
}

// Reminder types
export interface WorkoutReminder {
  id: string;
  userId: string;
  time: string; // HH:MM format
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  message?: string;
}

export interface Reminder {
  id: string;
  type: 'workout' | 'progress' | 'achievement' | 'streak' | 'missed';
  title: string;
  message: string;
  time: string; // ISO date string
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
}

// Workout plan durations
export type PlanDuration = 7 | 15 | 30 | 90 | 180;

// Exercise database entry
export interface ExerciseDBEntry extends Exercise {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  imageUrl?: string;
  targetMuscles: string[];
  secondaryMuscles?: string[];
  steps: string[];
  tips?: string[];
}

// Workout session (active workout)
export interface WorkoutSession {
  id: string;
  workoutId: string;
  startTime: Date;
  endTime?: Date;
  exercises: CompletedExercise[];
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

export interface CompletedExercise {
  exerciseId: string;
  sets: CompletedSet[];
  startTime: Date;
  endTime?: Date;
}

export interface CompletedSet extends WorkoutSet {
  completed: boolean;
  completedAt?: Date;
}

// Progress tracking
export interface ProgressEntry {
  id: string;
  userId: string;
  date: Date;
  weight?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
    calves?: number;
  };
  photos?: string[];
}

// Personal records
export interface PersonalRecord {
  exerciseId: string;
  value: number;
  unit: string;
  date: Date;
  type: 'weight' | 'reps' | 'time' | 'distance';
}

// API Response Types for Workout Plans
export interface WorkoutPlanApiResponse {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration: number;
  workouts: WorkoutDayApiResponse[];
  createdAt: string;
  updatedAt: string;
  // Legacy
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutDayApiResponse {
  day: number;
  name: string;
  exercises: WorkoutExerciseApiResponse[];
}

export interface WorkoutExerciseApiResponse {
  exerciseId: string;
  exerciseName: string;
  muscleGroups: string[];
  category: string;
  equipment: string;
  sets: WorkoutSetApiResponse[];
}

export interface WorkoutSetApiResponse {
  reps: number;
  weight: number;
}

export interface PaginatedWorkoutPlanResponse {
  data: WorkoutPlanApiResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  // Legacy
  total_pages?: number;
}

// API Request Types for Creating Workout Plans
export interface CreateWorkoutRequest {
  name: string;
  description: string;
  duration: number;
  difficulty: number; // 1-5 scale
  goal: string; // e.g., 'muscle_building'
  planType?: 'gym' | 'home'; // Plan type based on workout location
  workouts: CreateWorkoutDay[];
  metadata: any;
  // Legacy
  plan_type?: 'gym' | 'home';
}

export interface CreateWorkoutDay {
  day: number;
  name: string;
  description?: string;
  exercises: CreateWorkoutExercise[];
  estimatedDuration: number;
  // Legacy
  estimated_duration?: number;
}

export interface CreateWorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
  notes?: string;
  // Legacy
  exercise_id?: string;
  rest_time?: number;
}

export interface CreateWorkoutSet {
  reps: number;
  weight: number;
}

// API Query Parameters
export interface GetWorkoutsParams {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: string;
}

// Fitness Profile API Types
export interface CreateFitnessProfileRequest {
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_fitness';
  targetWeight?: number;
  workoutLocation: 'gym' | 'home' | 'both';
}

export interface UpdateFitnessProfileRequest {
  gender?: 'male' | 'female' | 'other';
  age?: number;
  height?: number;
  weight?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_fitness';
  targetWeight?: number;
  workoutLocation?: 'gym' | 'home' | 'both';
}

export interface FitnessProfileApiResponse {
  id: string;
  userId: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_fitness';
  targetWeight?: number;
  workoutLocation: 'gym' | 'home' | 'both';
  points: number;
  achievements: string[];
  bmi: {
    value: number;
    category: 'underweight' | 'normal' | 'overweight' | 'obese';
  };
  createdAt: string;
  updatedAt: string;
  // Legacy
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Today's Workouts API Types
export interface TodayWorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  notes: string;
  // Legacy
  exercise_id?: string;
  rest_time?: number;
}

export interface TodayWorkout {
  planId: string;
  planName: string;
  currentDay: number;
  totalDays: number;
  workoutName: string;
  workoutDescription: string;
  estimatedDuration: number;
  exercises: TodayWorkoutExercise[];
  daysSinceStarted: number;
  startedAt: string;
  // Legacy
  plan_id?: string;
  plan_name?: string;
  current_day?: number;
  total_days?: number;
  workout_name?: string;
  workout_description?: string;
  estimated_duration?: number;
  days_since_started?: number;
  started_at?: string;
}

export interface TodayWorkoutsResponse {
  date: string;
  totalPlans: number;
  workouts: TodayWorkout[];
  totalExercises: number;
  totalDuration: number;
  // Legacy
  total_plans?: number;
  total_exercises?: number;
  total_duration?: number;
}

// Workout Session API Types (for real-time workout tracking)
export interface WorkoutSessionExercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface CurrentWorkoutSession {
  id: string;
  userId: string;
  name: string;
  date: string;
  exercises: WorkoutSessionExercise[];
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned: number;
  personalRecords: number;
  notes: string;
  weightRecorded: number;
  bodyFatPercentage: number;
  restingHeartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  mood: 'poor' | 'average' | 'good' | 'excellent';
  energyLevel: 'low' | 'medium' | 'high';
  sleepHours: number;
  waterIntake: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutSessionRequest {
  name: string;
  date: string;
  exercises: WorkoutSessionExercise[];
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned: number;
  personalRecords: number;
  notes: string;
  weightRecorded: number;
  bodyFatPercentage: number;
  restingHeartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  mood: 'poor' | 'average' | 'good' | 'excellent';
  energyLevel: 'low' | 'medium' | 'high';
  sleepHours: number;
  waterIntake: number;
}