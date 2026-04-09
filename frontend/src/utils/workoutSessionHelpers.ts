// @ts-nocheck
/**
 * Helper functions for workout session management
 */

import { CreateWorkoutSessionRequest, TodayWorkout, CurrentWorkoutSession } from '../types/fitness';

interface SetProgress {
  exerciseId: string;
  setNumber: number;
  completed: boolean;
  actualReps?: number;
  actualWeight?: number;
}

/**
 * Generate default health metrics for workout session
 * User should update these with actual values during/after workout
 */
export const generateDefaultHealthMetrics = () => ({
  intensity: 'medium' as const,
  caloriesBurned: 0, // User should enter actual value
  personalRecords: 0,
  notes: '',
  weightRecorded: undefined,
  bodyFatPercentage: undefined,
  restingHeartRate: undefined,
  bloodPressure: undefined,
  mood: 'good' as const,
  energyLevel: 'medium' as const,
  sleepHours: undefined,
  waterIntake: undefined
});

/**
 * Create initial workout session data from today's workouts
 */
export const createInitialWorkoutSession = (todayWorkouts: { workouts: TodayWorkout[] }): CreateWorkoutSessionRequest => {
  const workoutNames = todayWorkouts.workouts.map(w => w.workout_name);
  const name = workoutNames.join(' + ');
  
  // Calculate estimated duration from all workouts
  const totalDuration = todayWorkouts.workouts.reduce((sum, w) => sum + w.estimated_duration, 0);
  
  // Generate default health metrics (user can update during workout)
  const healthMetrics = generateDefaultHealthMetrics();
  
  return {
    name,
    date: new Date().toISOString(),
    exercises: [], // Initially empty - will be populated as exercises are completed
    duration: totalDuration,
    ...healthMetrics
  };
};

/**
 * Update workout session with completed exercise
 */
export const updateWorkoutSessionWithExercise = (
  currentSession: CreateWorkoutSessionRequest,
  exerciseName: string,
  sets: number,
  reps: number,
  weight: number
): CreateWorkoutSessionRequest => {
  // Check if exercise already exists
  const existingExerciseIndex = currentSession.exercises.findIndex(ex => ex.name === exerciseName);
  
  if (existingExerciseIndex >= 0) {
    // Update existing exercise
    const updatedExercises = [...currentSession.exercises];
    updatedExercises[existingExerciseIndex] = {
      name: exerciseName,
      sets,
      reps,
      weight
    };
    
    return {
      ...currentSession,
      exercises: updatedExercises
    };
  } else {
    // Add new exercise
    return {
      ...currentSession,
      exercises: [
        ...currentSession.exercises,
        {
          name: exerciseName,
          sets,
          reps,
          weight
        }
      ]
    };
  }
};

/**
 * Restore session state from current workout session
 */
export const restoreSessionState = (
  session: CurrentWorkoutSession,
  allExercises: Array<{ name: string; sets: number; exercise_id?: string; id?: string }>
) => {
  const completedExerciseNames = session.exercises.map(ex => ex.name);
  const setProgress: SetProgress[] = [];
  let currentExerciseIndex = 0;
  
  // Generate set progress for completed exercises
  allExercises.forEach((exercise, exerciseIndex) => {
    const isCompleted = completedExerciseNames.includes(exercise.name);
    const exerciseId = exercise.exercise_id?.toString() || exercise.id || exercise.name;
    
    if (isCompleted) {
      // Mark all sets as completed for this exercise
      for (let setNumber = 1; setNumber <= exercise.sets; setNumber++) {
        const completedExercise = session.exercises.find(ex => ex.name === exercise.name);
        setProgress.push({
          exerciseId,
          setNumber,
          completed: true,
          actualReps: completedExercise?.reps,
          actualWeight: completedExercise?.weight
        });
      }
    } else if (currentExerciseIndex === 0) {
      // This is the first non-completed exercise, set it as current
      currentExerciseIndex = exerciseIndex;
    }
  });

  // If all exercises are completed, set to last exercise
  if (setProgress.length === allExercises.reduce((sum, ex) => sum + ex.sets, 0)) {
    currentExerciseIndex = allExercises.length - 1;
  }

  return {
    setProgress,
    currentExerciseIndex,
    workoutTimer: session.duration * 60 // Convert minutes to seconds
  };
};