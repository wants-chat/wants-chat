import { UserFitnessProfile, Exercise, WorkoutPlan, Workout, WorkoutExercise, PlanDuration } from '../types/fitness';

interface WorkoutTemplate {
  name: string;
  description: string;
  focusAreas: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: 'none' | 'basic' | 'full';
  targetGoals: string[];
  workoutsPerWeek: number;
  exerciseCategories: string[];
}

const workoutTemplates: WorkoutTemplate[] = [
  {
    name: 'Beginner Full Body',
    description: 'Perfect for fitness newcomers. Focus on fundamental movements.',
    focusAreas: ['full-body', 'strength', 'endurance'],
    difficulty: 'beginner',
    equipment: 'basic',
    targetGoals: ['improve_fitness', 'maintain'],
    workoutsPerWeek: 3,
    exerciseCategories: ['strength', 'cardio']
  },
  {
    name: 'Weight Loss Accelerator',
    description: 'High-intensity workouts designed to burn calories and shed pounds.',
    focusAreas: ['cardio', 'metabolic', 'full-body'],
    difficulty: 'intermediate',
    equipment: 'basic',
    targetGoals: ['lose_weight'],
    workoutsPerWeek: 5,
    exerciseCategories: ['cardio', 'strength']
  },
  {
    name: 'Muscle Building Program',
    description: 'Progressive overload training for maximum muscle growth.',
    focusAreas: ['strength', 'hypertrophy'],
    difficulty: 'intermediate',
    equipment: 'full',
    targetGoals: ['gain_muscle'],
    workoutsPerWeek: 4,
    exerciseCategories: ['strength']
  },
  {
    name: 'Home Warrior',
    description: 'No equipment needed. Build strength using bodyweight exercises.',
    focusAreas: ['full-body', 'functional', 'flexibility'],
    difficulty: 'beginner',
    equipment: 'none',
    targetGoals: ['improve_fitness', 'maintain', 'lose_weight'],
    workoutsPerWeek: 4,
    exerciseCategories: ['strength', 'cardio', 'flexibility']
  },
  {
    name: 'Athletic Performance',
    description: 'Improve speed, agility, and overall athletic capability.',
    focusAreas: ['power', 'agility', 'endurance'],
    difficulty: 'advanced',
    equipment: 'full',
    targetGoals: ['improve_fitness'],
    workoutsPerWeek: 5,
    exerciseCategories: ['strength', 'cardio', 'sports']
  },
  {
    name: 'Lean & Toned',
    description: 'Combination of strength and cardio for a lean physique.',
    focusAreas: ['toning', 'endurance', 'flexibility'],
    difficulty: 'intermediate',
    equipment: 'basic',
    targetGoals: ['lose_weight', 'improve_fitness'],
    workoutsPerWeek: 4,
    exerciseCategories: ['strength', 'cardio', 'flexibility']
  }
];

// Sample exercise database
const exerciseDatabase: Exercise[] = [
  // Strength - Beginner
  { id: 'squat', name: 'Bodyweight Squat', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: 'none' },
  { id: 'pushup', name: 'Push-up', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'none' },
  { id: 'lunge', name: 'Forward Lunge', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: 'none' },
  { id: 'plank', name: 'Plank', category: 'strength', muscleGroups: ['core'], equipment: 'none' },
  
  // Strength - Intermediate/Advanced
  { id: 'bench-press', name: 'Barbell Bench Press', category: 'strength', muscleGroups: ['chest', 'triceps'], equipment: 'barbell' },
  { id: 'deadlift', name: 'Deadlift', category: 'strength', muscleGroups: ['back', 'glutes', 'hamstrings'], equipment: 'barbell' },
  { id: 'shoulder-press', name: 'Overhead Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'barbell' },
  { id: 'row', name: 'Bent-Over Row', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'barbell' },
  
  // Cardio
  { id: 'jumping-jacks', name: 'Jumping Jacks', category: 'cardio', muscleGroups: ['full-body'], equipment: 'none' },
  { id: 'burpees', name: 'Burpees', category: 'cardio', muscleGroups: ['full-body'], equipment: 'none' },
  { id: 'mountain-climbers', name: 'Mountain Climbers', category: 'cardio', muscleGroups: ['core', 'legs'], equipment: 'none' },
  { id: 'high-knees', name: 'High Knees', category: 'cardio', muscleGroups: ['legs', 'core'], equipment: 'none' },
  
  // Flexibility
  { id: 'hamstring-stretch', name: 'Hamstring Stretch', category: 'flexibility', muscleGroups: ['hamstrings'], equipment: 'none' },
  { id: 'quad-stretch', name: 'Quad Stretch', category: 'flexibility', muscleGroups: ['quadriceps'], equipment: 'none' },
  { id: 'shoulder-stretch', name: 'Shoulder Stretch', category: 'flexibility', muscleGroups: ['shoulders'], equipment: 'none' }
];

export function calculateFitnessLevel(profile: UserFitnessProfile): 'beginner' | 'intermediate' | 'advanced' {
  // Safety check for profile
  if (!profile || !profile.activityLevel) {
    return 'beginner';
  }

  const { activityLevel, age } = profile;
  
  if (activityLevel === 'sedentary' || activityLevel === 'light') {
    return 'beginner';
  } else if (activityLevel === 'moderate') {
    return 'intermediate';
  } else {
    return 'advanced';
  }
}

export function getRecommendedWorkoutPlans(profile: UserFitnessProfile): WorkoutTemplate[] {
  // Safety check for profile
  if (!profile || !profile.fitnessGoal) {
    return workoutTemplates.slice(0, 3);
  }

  const fitnessLevel = calculateFitnessLevel(profile);
  const isHome = profile.workoutLocation === 'home';
  
  return workoutTemplates.filter(template => {
    // Filter by fitness level
    if (fitnessLevel === 'beginner' && template.difficulty === 'advanced') return false;
    if (fitnessLevel === 'advanced' && template.difficulty === 'beginner') return false;
    
    // Filter by goal
    if (!template.targetGoals.includes(profile.fitnessGoal)) return false;
    
    // Filter by equipment availability
    if (isHome && template.equipment === 'full') return false;
    
    return true;
  }).sort((a, b) => {
    // Prioritize exact goal matches
    const aExactMatch = a.targetGoals[0] === profile.fitnessGoal ? 1 : 0;
    const bExactMatch = b.targetGoals[0] === profile.fitnessGoal ? 1 : 0;
    return bExactMatch - aExactMatch;
  });
}

export function generateWorkoutPlan(
  template: WorkoutTemplate,
  profile: UserFitnessProfile,
  duration: PlanDuration
): WorkoutPlan {
  const workouts: Workout[] = [];
  const totalWorkouts = Math.floor((duration / 7) * template.workoutsPerWeek);
  
  // Filter exercises based on equipment availability
  const availableExercises = exerciseDatabase.filter(exercise => {
    if (profile.workoutLocation === 'home' && exercise.equipment && exercise.equipment !== 'none') {
      return false;
    }
    return template.exerciseCategories.includes(exercise.category);
  });
  
  // Generate workouts
  for (let i = 0; i < totalWorkouts; i++) {
    const workoutDay = Math.floor(i / template.workoutsPerWeek) * 7 + (i % template.workoutsPerWeek) + 1;
    
    const exercises: WorkoutExercise[] = [];
    
    // Add exercises based on template focus
    if (template.focusAreas.includes('full-body')) {
      // Full body workout - mix of upper, lower, and core
      const upperBody = availableExercises.filter(e => 
        e.muscleGroups.some(mg => ['chest', 'back', 'shoulders', 'triceps', 'biceps'].includes(mg))
      );
      const lowerBody = availableExercises.filter(e => 
        e.muscleGroups.some(mg => ['quadriceps', 'hamstrings', 'glutes', 'calves'].includes(mg))
      );
      const core = availableExercises.filter(e => 
        e.muscleGroups.includes('core')
      );
      
      // Add 2-3 exercises from each category
      if (upperBody.length > 0) {
        for (let j = 0; j < Math.min(2, upperBody.length); j++) {
          exercises.push({
            exerciseId: upperBody[j].id,
            sets: generateSets(profile, template.difficulty),
            notes: `Focus on form and controlled movement`
          });
        }
      }
      
      if (lowerBody.length > 0) {
        for (let j = 0; j < Math.min(2, lowerBody.length); j++) {
          exercises.push({
            exerciseId: lowerBody[j].id,
            sets: generateSets(profile, template.difficulty),
            notes: `Keep core engaged throughout`
          });
        }
      }
      
      if (core.length > 0) {
        exercises.push({
          exerciseId: core[0].id,
          sets: generateCoreSets(template.difficulty),
          notes: `Maintain proper form`
        });
      }
    } else {
      // Targeted workout - focus on specific areas
      const targetExercises = availableExercises.slice(0, 5);
      targetExercises.forEach(exercise => {
        exercises.push({
          exerciseId: exercise.id,
          sets: generateSets(profile, template.difficulty),
          notes: getExerciseNotes(exercise, profile)
        });
      });
    }
    
    // Add cardio if weight loss is the goal
    if (profile.fitnessGoal === 'lose_weight') {
      const cardioExercises = availableExercises.filter(e => e.category === 'cardio');
      if (cardioExercises.length > 0) {
        exercises.push({
          exerciseId: cardioExercises[0].id,
          sets: [{ duration: 300, reps: 0 }], // 5 minutes
          notes: 'Maintain steady pace'
        });
      }
    }
    
    workouts.push({
      id: `workout-${i + 1}`,
      name: `Day ${workoutDay} - ${template.focusAreas[0]} Focus`,
      date: new Date(Date.now() + workoutDay * 24 * 60 * 60 * 1000),
      exercises,
      duration: calculateWorkoutDuration(exercises),
      notes: `${template.name} - Week ${Math.floor(i / template.workoutsPerWeek) + 1}`
    });
  }
  
  return {
    id: `plan-${Date.now()}`,
    name: `${template.name} - ${duration} Day Program`,
    description: `${template.description} Customized for your ${profile.fitnessGoal?.replace('_', ' ') || 'fitness'} goal.`,
    workouts,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function generateSets(profile: UserFitnessProfile, difficulty: string) {
  const baseReps = difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 12 : 15;
  const sets = difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 4 : 5;
  
  return Array(sets).fill(null).map((_, index) => ({
    reps: baseReps,
    weight: 0, // User can customize
    restTime: difficulty === 'beginner' ? 60 : 45
  }));
}

function generateCoreSets(difficulty: string) {
  const duration = difficulty === 'beginner' ? 30 : difficulty === 'intermediate' ? 45 : 60;
  const sets = difficulty === 'beginner' ? 3 : 4;
  
  return Array(sets).fill(null).map(() => ({
    reps: 0,
    duration,
    restTime: 30
  }));
}

function getExerciseNotes(exercise: Exercise, profile: UserFitnessProfile): string {
  if (exercise.category === 'strength') {
    return profile.fitnessGoal === 'gain_muscle' 
      ? 'Focus on progressive overload - increase weight when you can complete all sets'
      : 'Focus on proper form and controlled movements';
  }
  if (exercise.category === 'cardio') {
    return 'Maintain steady pace, adjust intensity as needed';
  }
  return 'Focus on proper form and breathing';
}

function calculateWorkoutDuration(exercises: WorkoutExercise[]): number {
  let totalMinutes = 5; // Warm-up
  
  exercises.forEach(exercise => {
    const setsCount = exercise.sets.length;
    const restTime = exercise.sets[0]?.restTime || 45;
    const exerciseTime = exercise.sets[0]?.duration 
      ? (exercise.sets[0].duration / 60) * setsCount
      : 2 * setsCount; // Assume 2 minutes per set for strength exercises
    
    totalMinutes += exerciseTime + (restTime * (setsCount - 1) / 60);
  });
  
  totalMinutes += 5; // Cool-down
  
  return Math.round(totalMinutes);
}

export { workoutTemplates, exerciseDatabase };