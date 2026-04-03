import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { WorkoutSounds } from '../../lib/sounds';
import { useTodayWorkouts } from '../../hooks/fitness/useTodayWorkouts';
import { useCurrentWorkoutSession } from '../../hooks/fitness/useCurrentWorkoutSession';
import { useWorkoutSessionActions } from '../../hooks/fitness/useWorkoutSessionActions';
import { useMultipleExerciseDetails } from '../../hooks/fitness/useExerciseDetails';
import { createInitialWorkoutSession, updateWorkoutSessionWithExercise, restoreSessionState } from '../../utils/workoutSessionHelpers';
import { CurrentWorkoutSession } from '../../types/fitness';
import { toast } from '../../components/ui/sonner';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationModal from '../../components/ui/confirmation-modal';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  CheckCircle, 
  Timer, 
  Clock,
  Home,
  Volume2,
  VolumeX,
  FastForward
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime: number;
  instructions: string[];
  targetMuscles: string[];
  animation: string; // This would be a GIF URL in a real app
}

interface WorkoutSession {
  id: string;
  name: string;
  exercises: Exercise[];
  totalDuration: number;
}

interface SetProgress {
  exerciseId: string;
  setNumber: number;
  completed: boolean;
  actualReps?: number;
  actualWeight?: number;
}

interface FormattedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  instructions: string[];
  targetMuscles: string[];
  animation: string;
}

const WorkoutSession: React.FC = () => {
  const navigate = useNavigate();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [setProgress, setSetProgress] = useState<SetProgress[]>([]);
  const [actualReps, setActualReps] = useState<number>(0);
  const [actualWeight, setActualWeight] = useState<number>(0);
  const [soundsEnabled, setSoundsEnabled] = useState(() => WorkoutSounds.getSoundsEnabled());
  const [error, setError] = useState<string | null>(null);
  
  // Get profile from localStorage to enable the hook
  const [profile] = useState(() => {
    const savedProfile = localStorage.getItem('fitnessProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  
  // Fetch today's workouts using the hook
  const { data: todayWorkouts, loading: todayWorkoutsLoading } = useTodayWorkouts(!!profile);
  
  // Fetch current workout session
  const { data: currentWorkoutSession, loading: sessionLoading, error: sessionError } = useCurrentWorkoutSession(!!profile);
  
  // Workout session actions
  const { createSession, updateSession, completeSession, isCreating, isUpdating } = useWorkoutSessionActions();
  
  // Track the active workout session
  const [activeSession, setActiveSession] = useState<CurrentWorkoutSession | null>(null);
  
  // Track if showing completed workout modal
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  // Confirmation modal hook
  const confirmation = useConfirmation();

  // Workout data - should come from props/context/API
  const [workout] = useState<WorkoutSession>({
    id: '',
    name: '',
    totalDuration: 0,
    exercises: []
  });

  // Helper function to merge exercises with the same name
  const mergeExercisesByName = (exercises: any[]) => {
    const exerciseMap = new Map();
    
    exercises.forEach(exercise => {
      const name = exercise.name;
      if (exerciseMap.has(name)) {
        // Merge with existing exercise - sum the sets
        const existing = exerciseMap.get(name);
        exerciseMap.set(name, {
          ...existing,
          sets: existing.sets + exercise.sets,
          // Keep other properties from the first occurrence
        });
      } else {
        // First occurrence of this exercise name
        exerciseMap.set(name, { ...exercise });
      }
    });
    
    return Array.from(exerciseMap.values());
  };

  // Get all exercises from today's workouts, and merge duplicates
  const rawExercises = todayWorkouts && todayWorkouts.workouts.length > 0
    ? todayWorkouts.workouts.flatMap(workout => workout.exercises)
    : [];

  const allExercises = mergeExercisesByName(rawExercises);

  // Get all unique exercise IDs to fetch details
  const exerciseIds = allExercises.map(ex => 'exercise_id' in ex ? ex.exercise_id : ex.id);

  // Fetch exercise details for all exercises
  const { exercises: exerciseDetailsMap, loading: exerciseDetailsLoading } = useMultipleExerciseDetails(
    exerciseIds,
    allExercises.length > 0
  );
  
  // Current exercise from API data
  const currentExercise = allExercises[currentExerciseIndex];

  // Get exercise details for current exercise
  const currentExerciseId = currentExercise ? ('exercise_id' in currentExercise ? currentExercise.exercise_id : currentExercise.id) : null;
  const currentExerciseDetails = currentExerciseId ? exerciseDetailsMap.get(currentExerciseId) : null;

  // Debug logging
  console.log('Current Exercise ID:', currentExerciseId);
  console.log('Exercise Details Map:', exerciseDetailsMap);
  console.log('Current Exercise Details:', currentExerciseDetails);
  console.log('Video URL from details:', currentExerciseDetails?.video_url);

  // Helper function to get the best exercise name
  const getExerciseName = (exercise: any, details: any): string => {
    // Priority: 1. Details from DB, 2. Stored name (if not "Unknown Exercise"), 3. Fallback
    if (details?.name) return details.name;
    if (exercise?.name && exercise.name !== 'Unknown Exercise') return exercise.name;
    return 'Exercise';
  };

  // Convert the exercise format to match expected format
  const currentExerciseFormatted: FormattedExercise = currentExercise && todayWorkouts && todayWorkouts.workouts.length > 0
    ? {
        id: ('exercise_id' in currentExercise ? currentExercise.exercise_id?.toString() : currentExercise.id) || currentExercise.name,
        name: getExerciseName(currentExercise, currentExerciseDetails),
        sets: currentExercise.sets,
        reps: currentExercise.reps,
        weight: currentExercise.weight || 0,
        restTime: ('rest_time' in currentExercise ? currentExercise.rest_time : 90), // Use API rest time or default
        instructions: currentExerciseDetails?.instructions || ('instructions' in currentExercise ? currentExercise.instructions : []) || [],
        targetMuscles: currentExerciseDetails?.muscle_groups || ('target_muscles' in currentExercise ? (currentExercise.target_muscles as string[]) : 'targetMuscles' in currentExercise ? (currentExercise.targetMuscles as string[]) : []) || [],
        animation: currentExerciseDetails?.video_url || ('video_url' in currentExercise ? currentExercise.video_url : '') || '/workout-content/1.mp4'
      }
    : currentExercise ? {
        id: ('id' in currentExercise ? currentExercise.id : currentExercise.name),
        name: getExerciseName(currentExercise, currentExerciseDetails),
        sets: currentExercise.sets,
        reps: currentExercise.reps,
        weight: currentExercise.weight || 0,
        restTime: ('restTime' in currentExercise ? currentExercise.restTime : 90),
        instructions: currentExerciseDetails?.instructions || ('instructions' in currentExercise ? (currentExercise.instructions as string[]) : []) || [],
        targetMuscles: currentExerciseDetails?.muscle_groups || ('targetMuscles' in currentExercise ? (currentExercise.targetMuscles as string[]) : []) || [],
        animation: currentExerciseDetails?.video_url || ('video_url' in currentExercise ? currentExercise.video_url : '') || '/workout-content/1.mp4'
      } : {
        id: '',
        name: 'No exercise',
        sets: 0,
        reps: 0,
        weight: 0,
        restTime: 90,
        instructions: [],
        targetMuscles: [],
        animation: '/workout-content/1.mp4'
      };
  
  const totalSets = allExercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSets = setProgress.filter(p => p.completed).length;
  const workoutProgress = (completedSets / totalSets) * 100;

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (!isPaused) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
        
        if (isResting && restTimer > 0) {
          setRestTimer(prev => {
            const newValue = prev - 1;
            // Play countdown sound for last 3 seconds
            if (newValue === 3 || newValue === 2 || newValue === 1) {
              WorkoutSounds.playCountdownSound();
            }
            return newValue;
          });
        } else if (isResting && restTimer === 0) {
          setIsResting(false);
          WorkoutSounds.playRestEndSound();
          // Play whistle sound for next set
          setTimeout(() => WorkoutSounds.playStartSound(), 300);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPaused, isResting, restTimer]);

  // Initialize current exercise values
  useEffect(() => {
    setActualReps(currentExerciseFormatted.reps);
    setActualWeight(currentExerciseFormatted.weight || 0);
  }, [currentExerciseFormatted]);

  // Play whistle sound when starting first exercise
  useEffect(() => {
    const timer = setTimeout(() => {
      WorkoutSounds.playStartSound();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle workout session initialization
  useEffect(() => {
    const initializeWorkoutSession = async () => {
      if (!todayWorkouts || !profile) return;
      
      try {
        if (currentWorkoutSession && !activeSession) {
          // Check if session is already completed
          if (currentWorkoutSession.completed) {
            console.log('Workout session already completed, showing confirmation modal');
            setShowCompletedModal(true);
            return;
          }
          
          // Use existing session and restore state
          console.log('Using existing workout session:', currentWorkoutSession);
          setActiveSession(currentWorkoutSession);
          
          // Restore session state (completed exercises, current index, timer)
          const restoredState = restoreSessionState(currentWorkoutSession, allExercises);
          console.log('Restoring session state:', restoredState);
          
          setSetProgress(restoredState.setProgress);
          setCurrentExerciseIndex(restoredState.currentExerciseIndex);
          setWorkoutTimer(restoredState.workoutTimer);
          
        } else if (!currentWorkoutSession && !activeSession && !sessionError) {
          // Create new session only if no session exists and we haven't already created one
          console.log('Creating new workout session from today\'s workouts');
          const initialSessionData = createInitialWorkoutSession(todayWorkouts);
          const newSession = await createSession(initialSessionData);
          setActiveSession(newSession);
        }
      } catch (error) {
        console.error('Error initializing workout session:', error);
      }
    };

    // Only initialize if we have today's workouts and are not currently loading or creating
    if (todayWorkouts && todayWorkouts.workouts.length > 0 && !sessionLoading && !isCreating) {
      initializeWorkoutSession();
    }
  }, [todayWorkouts, currentWorkoutSession, sessionLoading, isCreating, profile, activeSession, sessionError, createSession, allExercises, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completeSet = async () => {
    // Clear any previous errors
    setError(null);

    WorkoutSounds.playEndSound();
    
    const newProgress: SetProgress = {
      exerciseId: currentExerciseFormatted.id,
      setNumber: currentSet,
      completed: true,
      actualReps,
      actualWeight
    };

    if (currentSet < currentExerciseFormatted.sets) {
      // For regular sets (not exercise completion), just update local state
      setSetProgress(prev => [...prev, newProgress]);
      setIsResting(true);
      setRestTimer(currentExerciseFormatted.restTime);
      setCurrentSet(prev => prev + 1);
      WorkoutSounds.playRestStartSound();
    } else {
      // Exercise completed - update session with completed exercise (API call required)
      if (activeSession) {
        try {
          const updatedSessionData = updateWorkoutSessionWithExercise(
            {
              name: activeSession.name,
              date: activeSession.date,
              exercises: activeSession.exercises,
              duration: Math.floor(workoutTimer / 60), // Convert to minutes
              intensity: activeSession.intensity,
              caloriesBurned: activeSession.caloriesBurned,
              personalRecords: activeSession.personalRecords,
              notes: activeSession.notes,
              weightRecorded: activeSession.weightRecorded,
              bodyFatPercentage: activeSession.bodyFatPercentage,
              restingHeartRate: activeSession.restingHeartRate,
              bloodPressure: activeSession.bloodPressure,
              mood: activeSession.mood,
              energyLevel: activeSession.energyLevel,
              sleepHours: activeSession.sleepHours,
              waterIntake: activeSession.waterIntake
            },
            currentExerciseFormatted.name,
            currentExerciseFormatted.sets,
            actualReps,
            actualWeight
          );
          
          console.log('Updating session with completed exercise:', updatedSessionData);
          console.log('Current session ID before update:', activeSession.id);
          const updatedSession = await updateSession(activeSession.id, updatedSessionData);
          console.log('Updated session received from API:', updatedSession);
          console.log('Updated session ID:', updatedSession?.id);
          
          // Ensure the session ID is preserved
          if (updatedSession && updatedSession.id) {
            setActiveSession(updatedSession);
          } else {
            console.error('Updated session missing ID, keeping existing session');
            setActiveSession({
              ...activeSession,
              ...updatedSession,
              id: activeSession.id // Preserve the original session ID
            });
          }
          
          // Only update progress and move to next exercise AFTER successful API call
          setSetProgress(prev => [...prev, newProgress]);
          nextExercise();
          
        } catch (error: any) {
          console.error('Error updating workout session:', error);
          
          // Extract error message from API response
          let errorMessage = 'Failed to save exercise progress. Please try again.';
          if (error?.message) {
            if (typeof error.message === 'string') {
              errorMessage = error.message;
            } else if (Array.isArray(error.message)) {
              errorMessage = error.message.join(', ');
            }
          }
          
          setError(errorMessage);
          toast.error(`Failed to save exercise progress: ${errorMessage}`);
          // Don't update progress or move to next exercise if API call fails
        }
      }
    }
  };

  const nextExercise = () => {
    if (currentExerciseIndex < allExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
      setRestTimer(0);
      // Play whistle sound for new exercise
      setTimeout(() => WorkoutSounds.playStartSound(), 500);
    } else {
      // Workout complete
      handleCompleteWorkout();
    }
  };

  const handleSkipExercise = async () => {
    const confirmed = await confirmation.showConfirmation({
      title: 'Skip Exercise',
      message: `Are you sure you want to skip "${currentExerciseFormatted.name}"? This exercise won't be marked as completed.`,
      confirmText: 'Skip Exercise',
      cancelText: 'Continue Exercise',
      variant: 'default'
    });

    if (confirmed) {
      nextExercise();
      toast.info(`Skipped "${currentExerciseFormatted.name}"`);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setCurrentSet(1);
      setIsResting(false);
      setRestTimer(0);
    }
  };

  const handleCompleteWorkout = async () => {
    const confirmed = await confirmation.showConfirmation({
      title: 'Complete Workout',
      message: 'Are you sure you want to complete this workout? Your progress will be saved and you\'ll be taken to the dashboard.',
      confirmText: 'Complete Workout',
      cancelText: 'Continue Working Out',
      variant: 'default'
    });

    if (confirmed) {
      completeWorkout();
    }
  };

  const completeWorkout = async () => {
    WorkoutSounds.playWorkoutCompleteSound();

    if (activeSession) {
      try {
        console.log('Completing workout session:', activeSession.id);
        await completeSession(activeSession.id);
        toast.success('Workout Complete! Great job! 🎉');
        navigate('/fitness/dashboard');
      } catch (error) {
        console.error('Error completing workout session:', error);
        // Still show success message and navigate, as the workout was functionally completed
        toast.success('Workout Complete! Great job! 🎉');
        toast.warning('Note: There was an issue saving the final state, but your progress has been tracked');
        navigate('/fitness/dashboard');
      }
    } else {
      // Fallback if no active session
      toast.success('Workout Complete! Great job! 🎉');
      navigate('/fitness/dashboard');
    }
  };

  const skipRestTime = () => {
    setIsResting(false);
    setRestTimer(0);
    WorkoutSounds.playRestEndSound();
    // Play whistle for next set
    setTimeout(() => WorkoutSounds.playStartSound(), 300);
  };

  const toggleSounds = () => {
    const newValue = !soundsEnabled;
    setSoundsEnabled(newValue);
    WorkoutSounds.setSoundsEnabled(newValue);
  };

  const getCompletedSetsForExercise = (exerciseId: string) => {
    return setProgress.filter(p => p.exerciseId === exerciseId && p.completed).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {activeSession 
              ? activeSession.name
              : todayWorkouts && todayWorkouts.workouts.length > 0 
              ? `Today's Workouts` 
              : workout.name}
          </h1>
          <p className="text-muted-foreground">
            {todayWorkoutsLoading
              ? 'Loading workouts...'
              : sessionLoading
              ? 'Loading session...'
              : isCreating
              ? 'Creating session...'
              : allExercises.length > 0
              ? `Exercise ${currentExerciseIndex + 1} of ${allExercises.length}`
              : 'No exercises available'
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-mono text-lg">{formatTime(workoutTimer)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSounds}
            title={soundsEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/fitness/dashboard')}
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Workout Progress</span>
          <span className="text-sm text-muted-foreground">{completedSets}/{totalSets} sets</span>
        </div>
        <Progress value={workoutProgress} className="h-2" />
      </Card>

      {/* Rest Timer */}
      {isResting && (
        <Card className="p-6 bg-primary/10 border-primary/20">
          <div className="text-center">
            <Timer className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="text-xl font-bold text-foreground mb-1">Rest Time</h3>
            <div className="text-3xl font-mono font-bold text-primary mb-2">
              {formatTime(restTimer)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Next: Set {currentSet} of {currentExerciseFormatted.name}
            </p>
            <Button
              onClick={skipRestTime}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <FastForward className="h-4 w-4" />
              Skip Rest
            </Button>
          </div>
        </Card>
      )}

      {/* Main Exercise Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercise Animation/Demo */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Exercise Demo</h3>
          
          {/* Exercise Video Demo */}
          <div className="bg-secondary/20 rounded-lg p-4 mb-4">
            {exerciseDetailsLoading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading exercise video...</p>
                </div>
              </div>
            ) : currentExerciseFormatted.animation ? (
              <video
                key={currentExerciseFormatted.id}
                className="w-full h-auto max-h-[300px] object-contain rounded-lg"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              >
                <source src={currentExerciseFormatted.animation} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">No video available for this exercise</p>
              </div>
            )}
            
            {/* Exercise Info Overlay */}
            <div className="mt-3 text-center">
              <p className="text-lg font-semibold text-foreground mb-2">{currentExerciseFormatted.name}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {currentExerciseFormatted.targetMuscles.map((muscle: string) => (
                  <Badge key={muscle} variant="secondary" className="text-xs capitalize">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="font-medium mb-2">Instructions</h4>
            <ul className="space-y-2">
              {currentExerciseFormatted.instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Exercise Tracking */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Current Set Info */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {currentExerciseFormatted.name}
              </h2>
              <div className="text-xl font-semibold text-primary">
                Set {currentSet} of {currentExerciseFormatted.sets}
              </div>
            </div>

            {/* Target vs Actual */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Target</p>
                <p className="text-2xl font-bold text-foreground">
                  {currentExerciseFormatted.reps}
                </p>
                <p className="text-xs text-muted-foreground">reps</p>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Weight</p>
                <p className="text-2xl font-bold text-foreground">
                  {currentExerciseFormatted.weight || 0}
                </p>
                <p className="text-xs text-muted-foreground">kg</p>
              </div>
            </div>

            {/* Actual Performance Input */}
            <div className="space-y-4">
              <h4 className="font-medium">Record Your Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Actual Reps
                  </label>
                  <Input
                    type="number"
                    value={actualReps}
                    onChange={(e) => setActualReps(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Actual Weight (kg)
                  </label>
                  <Input
                    type="number"
                    value={actualWeight}
                    onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Set Progress Indicators */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Set Progress</h4>
                <span className="text-sm text-muted-foreground">
                  {getCompletedSetsForExercise(currentExerciseFormatted.id)}/{currentExerciseFormatted.sets} completed
                </span>
              </div>
              <div className="max-h-24 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: currentExerciseFormatted.sets }, (_, i) => {
                    const setNumber = i + 1;
                    const isCompleted = getCompletedSetsForExercise(currentExerciseFormatted.id) >= setNumber;
                    const isCurrent = setNumber === currentSet;

                    return (
                      <div
                        key={setNumber}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium border-2 flex-shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : isCurrent
                            ? 'bg-primary text-white border-primary'
                            : 'bg-background text-muted-foreground border-border'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : setNumber}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-destructive text-sm font-medium">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="mt-2 h-6 text-xs text-destructive hover:text-destructive/80"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isResting && (
                <Button
                  onClick={completeSet}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 h-12 text-lg"
                  disabled={isPaused || isUpdating}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {isUpdating ? 'Saving...' : 'Complete Set'}
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={previousExercise}
                  disabled={currentExerciseIndex === 0}
                  className="flex-1"
                >
                  <SkipBack className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkipExercise}
                  className="flex-1"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip Exercise
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Exercise List */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Workout Overview</h3>
        <div className="space-y-2">
          {todayWorkoutsLoading ? (
            // Show loading state
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-sm text-muted-foreground">Loading today's workouts...</span>
            </div>
          ) : todayWorkouts && todayWorkouts.workouts.length > 0 ? (
            // Show merged exercises (combining exercises with same names)
            allExercises.map((exercise, index) => {
              const exerciseId = 'exercise_id' in exercise ? exercise.exercise_id?.toString() : exercise.id;
              const completedSets = getCompletedSetsForExercise(exerciseId);
              const isCurrent = index === currentExerciseIndex;
              // Get exercise details from the map for proper name
              const exerciseDetails = exerciseId ? exerciseDetailsMap.get(exerciseId) : null;
              const displayName = getExerciseName(exercise, exerciseDetails);

              return (
                <div
                  key={exerciseId}
                  className={`p-3 rounded-lg border ${
                    isCurrent
                      ? 'bg-primary/10 border-primary/20'
                      : completedSets === exercise.sets
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                      : 'bg-secondary/10 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        completedSets === exercise.sets
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-primary text-white'
                          : 'bg-background text-muted-foreground border border-border'
                      }`}>
                        {completedSets === exercise.sets ? '✓' : index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className={`font-medium ${
                        completedSets === exercise.sets ? 'text-emerald-600' : 'text-muted-foreground'
                      }`}>
                        {completedSets}/{exercise.sets}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Fallback when no today's workouts
            allExercises.map((exercise, index) => {
              const exerciseId = exercise.id || exercise.name;
              const completedSets = getCompletedSetsForExercise(exerciseId);
              const isCurrent = index === currentExerciseIndex;
              
              return (
                <div
                  key={exerciseId}
                  className={`p-3 rounded-lg border ${
                    isCurrent
                      ? 'bg-primary/10 border-primary/20'
                      : completedSets === exercise.sets
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                      : 'bg-secondary/10 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        completedSets === exercise.sets
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-primary text-white'
                          : 'bg-background text-muted-foreground border border-border'
                      }`}>
                        {completedSets === exercise.sets ? '✓' : index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.weight && ` @ ${exercise.weight}kg`}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className={`font-medium ${
                        completedSets === exercise.sets ? 'text-emerald-600' : 'text-muted-foreground'
                      }`}>
                        {completedSets}/{exercise.sets}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Completed Workout Modal */}
      {showCompletedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Workout Already Completed! 🎉
              </h2>
              <p className="text-muted-foreground mb-6">
                You have already completed today's workout session. Great job on staying consistent with your fitness goals!
              </p>
              <Button 
                onClick={() => navigate('/fitness/dashboard')}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </div>
  );
};

export default WorkoutSession;