export type WorkoutLocation = 'gym' | 'home';

export interface WorkoutPreferences {
  equipment: string[];
  workoutTypes: string[];
  duration: 'short' | 'moderate' | 'extended';
  intensity: 'low' | 'moderate' | 'high';
  restTimes: {
    strength: number;
    cardio: number;
  };
}

export interface LocationData {
  location: WorkoutLocation;
  timestamp: string;
  workoutPreferences: WorkoutPreferences;
}

export const getWorkoutLocation = (): WorkoutLocation | null => {
  return localStorage.getItem('workoutLocation') as WorkoutLocation | null;
};

export const getLocationPreferences = (location: WorkoutLocation): WorkoutPreferences => {
  if (location === 'gym') {
    return {
      equipment: ['barbell', 'dumbbells', 'machines', 'cables'],
      workoutTypes: ['strength', 'powerlifting', 'bodybuilding'],
      duration: 'extended', // 60-90 minutes
      intensity: 'high',
      restTimes: { strength: 180, cardio: 60 } // longer rest at gym
    };
  } else {
    return {
      equipment: ['bodyweight', 'resistance_bands', 'light_weights'],
      workoutTypes: ['bodyweight', 'cardio', 'yoga', 'hiit'],
      duration: 'moderate', // 30-45 minutes  
      intensity: 'moderate',
      restTimes: { strength: 90, cardio: 45 } // shorter rest at home
    };
  }
};

export const getCurrentLocationData = (): LocationData | null => {
  const location = getWorkoutLocation();
  if (!location) return null;

  const savedData = localStorage.getItem(`${location}WorkoutData`);
  if (savedData) {
    return JSON.parse(savedData);
  }

  // Return default data if none saved
  return {
    location,
    timestamp: new Date().toISOString(),
    workoutPreferences: getLocationPreferences(location)
  };
};

export const filterWorkoutsByLocation = (workouts: any[], location: WorkoutLocation) => {
  const preferences = getLocationPreferences(location);
  
  return workouts.filter(workout => {
    // Filter based on workout type compatibility
    if (workout.category && preferences.workoutTypes.includes(workout.category)) {
      return true;
    }
    
    // Filter based on equipment requirements
    if (workout.equipment && workout.equipment.some((eq: string) => preferences.equipment.includes(eq))) {
      return true;
    }
    
    // Default inclusion for generic workouts
    return !workout.equipment || workout.equipment.length === 0;
  });
};

export const adjustWorkoutForLocation = (workout: any, location: WorkoutLocation) => {
  const preferences = getLocationPreferences(location);
  
  return {
    ...workout,
    duration: getDurationForLocation(workout.duration, preferences.duration),
    restTimes: preferences.restTimes,
    intensity: preferences.intensity,
    suggestedEquipment: preferences.equipment
  };
};

const getDurationForLocation = (originalDuration: number, locationDuration: string): number => {
  switch (locationDuration) {
    case 'short':
      return Math.min(originalDuration, 30);
    case 'moderate':
      return Math.min(originalDuration, 45);
    case 'extended':
      return Math.max(originalDuration, 60);
    default:
      return originalDuration;
  }
};

// Hook for components to listen to location changes
export const useWorkoutLocationListener = (callback: (location: WorkoutLocation, preferences: WorkoutPreferences) => void) => {
  const handleLocationChange = (event: CustomEvent) => {
    callback(event.detail.location, event.detail.preferences);
  };

  window.addEventListener('workoutLocationChanged', handleLocationChange as EventListener);
  
  return () => {
    window.removeEventListener('workoutLocationChanged', handleLocationChange as EventListener);
  };
};