import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dumbbell,
  Calendar,
  Timer,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Search,
  Copy,
  Check,
  Trophy,
  Target,
  Flame,
  Clock,
  GripVertical,
  BookOpen,
  FileText,
  TrendingUp,
  Award,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
type WorkoutType = 'Strength' | 'Cardio' | 'HIIT' | 'Yoga' | 'Stretching' | 'Pilates' | 'CrossFit' | 'Rest';
type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core' | 'Cardio' | 'Full Body';
type TabType = 'schedule' | 'builder' | 'library' | 'templates' | 'progress' | 'timer';

interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  restTime: number;
  notes?: string;
  muscleGroup: MuscleGroup;
}

interface Workout {
  id: string;
  name: string;
  type: WorkoutType;
  exercises: Exercise[];
  estimatedDuration: number;
  createdAt: string;
}

interface DaySchedule {
  date: string;
  workoutId: string | null;
  completed: boolean;
  completedAt?: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  workout: Workout;
  isPreMade: boolean;
}

interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

interface CompletedWorkout {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  duration: number;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
}

interface LibraryExercise {
  name: string;
  muscleGroup: MuscleGroup;
  description: string;
  isCustom?: boolean;
}

// Pre-built exercise library
const DEFAULT_EXERCISES: LibraryExercise[] = [
  // Chest
  { name: 'Bench Press', muscleGroup: 'Chest', description: 'Barbell chest press on flat bench' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', description: 'Incline bench dumbbell press' },
  { name: 'Push-ups', muscleGroup: 'Chest', description: 'Bodyweight chest exercise' },
  { name: 'Cable Flyes', muscleGroup: 'Chest', description: 'Cable crossover fly movement' },
  { name: 'Dips', muscleGroup: 'Chest', description: 'Parallel bar dips for chest' },
  // Back
  { name: 'Deadlift', muscleGroup: 'Back', description: 'Barbell deadlift from floor' },
  { name: 'Pull-ups', muscleGroup: 'Back', description: 'Bodyweight pull-up on bar' },
  { name: 'Barbell Row', muscleGroup: 'Back', description: 'Bent over barbell row' },
  { name: 'Lat Pulldown', muscleGroup: 'Back', description: 'Cable lat pulldown' },
  { name: 'Seated Cable Row', muscleGroup: 'Back', description: 'Seated cable row machine' },
  // Shoulders
  { name: 'Overhead Press', muscleGroup: 'Shoulders', description: 'Standing barbell press' },
  { name: 'Lateral Raises', muscleGroup: 'Shoulders', description: 'Dumbbell side raises' },
  { name: 'Front Raises', muscleGroup: 'Shoulders', description: 'Dumbbell front raises' },
  { name: 'Face Pulls', muscleGroup: 'Shoulders', description: 'Cable face pulls for rear delts' },
  { name: 'Arnold Press', muscleGroup: 'Shoulders', description: 'Rotating dumbbell press' },
  // Arms
  { name: 'Barbell Curl', muscleGroup: 'Arms', description: 'Standing barbell bicep curl' },
  { name: 'Tricep Pushdown', muscleGroup: 'Arms', description: 'Cable tricep pushdown' },
  { name: 'Hammer Curls', muscleGroup: 'Arms', description: 'Neutral grip dumbbell curls' },
  { name: 'Skull Crushers', muscleGroup: 'Arms', description: 'Lying tricep extension' },
  { name: 'Preacher Curls', muscleGroup: 'Arms', description: 'Preacher bench bicep curl' },
  // Legs
  { name: 'Squat', muscleGroup: 'Legs', description: 'Barbell back squat' },
  { name: 'Leg Press', muscleGroup: 'Legs', description: 'Machine leg press' },
  { name: 'Romanian Deadlift', muscleGroup: 'Legs', description: 'Stiff-leg deadlift for hamstrings' },
  { name: 'Leg Curl', muscleGroup: 'Legs', description: 'Machine hamstring curl' },
  { name: 'Calf Raises', muscleGroup: 'Legs', description: 'Standing calf raises' },
  { name: 'Lunges', muscleGroup: 'Legs', description: 'Walking or stationary lunges' },
  // Core
  { name: 'Plank', muscleGroup: 'Core', description: 'Isometric core hold' },
  { name: 'Crunches', muscleGroup: 'Core', description: 'Abdominal crunches' },
  { name: 'Russian Twists', muscleGroup: 'Core', description: 'Seated oblique rotation' },
  { name: 'Leg Raises', muscleGroup: 'Core', description: 'Hanging or lying leg raises' },
  { name: 'Mountain Climbers', muscleGroup: 'Core', description: 'Dynamic plank exercise' },
  // Cardio
  { name: 'Treadmill Run', muscleGroup: 'Cardio', description: 'Running on treadmill' },
  { name: 'Stationary Bike', muscleGroup: 'Cardio', description: 'Cycling on stationary bike' },
  { name: 'Rowing Machine', muscleGroup: 'Cardio', description: 'Rowing ergometer' },
  { name: 'Jump Rope', muscleGroup: 'Cardio', description: 'Skipping rope cardio' },
  { name: 'Burpees', muscleGroup: 'Cardio', description: 'Full body cardio exercise' },
];

// Pre-made workout templates
const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'push',
    name: 'Push Day',
    description: 'Chest, shoulders, and triceps focused workout',
    isPreMade: true,
    workout: {
      id: 'push-workout',
      name: 'Push Day',
      type: 'Strength',
      estimatedDuration: 60,
      createdAt: new Date().toISOString(),
      exercises: [
        { id: '1', name: 'Bench Press', sets: 4, reps: 8, weight: 0, restTime: 90, muscleGroup: 'Chest' },
        { id: '2', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 0, restTime: 60, muscleGroup: 'Chest' },
        { id: '3', name: 'Overhead Press', sets: 4, reps: 8, weight: 0, restTime: 90, muscleGroup: 'Shoulders' },
        { id: '4', name: 'Lateral Raises', sets: 3, reps: 15, weight: 0, restTime: 45, muscleGroup: 'Shoulders' },
        { id: '5', name: 'Tricep Pushdown', sets: 3, reps: 12, weight: 0, restTime: 45, muscleGroup: 'Arms' },
      ]
    }
  },
  {
    id: 'pull',
    name: 'Pull Day',
    description: 'Back and biceps focused workout',
    isPreMade: true,
    workout: {
      id: 'pull-workout',
      name: 'Pull Day',
      type: 'Strength',
      estimatedDuration: 60,
      createdAt: new Date().toISOString(),
      exercises: [
        { id: '1', name: 'Deadlift', sets: 4, reps: 5, weight: 0, restTime: 120, muscleGroup: 'Back' },
        { id: '2', name: 'Pull-ups', sets: 4, reps: 8, weight: 0, restTime: 90, muscleGroup: 'Back' },
        { id: '3', name: 'Barbell Row', sets: 4, reps: 8, weight: 0, restTime: 90, muscleGroup: 'Back' },
        { id: '4', name: 'Face Pulls', sets: 3, reps: 15, weight: 0, restTime: 45, muscleGroup: 'Shoulders' },
        { id: '5', name: 'Barbell Curl', sets: 3, reps: 10, weight: 0, restTime: 45, muscleGroup: 'Arms' },
      ]
    }
  },
  {
    id: 'legs',
    name: 'Leg Day',
    description: 'Quadriceps, hamstrings, and calves workout',
    isPreMade: true,
    workout: {
      id: 'legs-workout',
      name: 'Leg Day',
      type: 'Strength',
      estimatedDuration: 75,
      createdAt: new Date().toISOString(),
      exercises: [
        { id: '1', name: 'Squat', sets: 5, reps: 5, weight: 0, restTime: 120, muscleGroup: 'Legs' },
        { id: '2', name: 'Leg Press', sets: 4, reps: 10, weight: 0, restTime: 90, muscleGroup: 'Legs' },
        { id: '3', name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 0, restTime: 90, muscleGroup: 'Legs' },
        { id: '4', name: 'Leg Curl', sets: 3, reps: 12, weight: 0, restTime: 60, muscleGroup: 'Legs' },
        { id: '5', name: 'Calf Raises', sets: 4, reps: 15, weight: 0, restTime: 45, muscleGroup: 'Legs' },
      ]
    }
  },
  {
    id: 'fullbody',
    name: 'Full Body',
    description: 'Complete full body workout for all muscle groups',
    isPreMade: true,
    workout: {
      id: 'fullbody-workout',
      name: 'Full Body',
      type: 'Strength',
      estimatedDuration: 60,
      createdAt: new Date().toISOString(),
      exercises: [
        { id: '1', name: 'Squat', sets: 3, reps: 8, weight: 0, restTime: 90, muscleGroup: 'Legs' },
        { id: '2', name: 'Bench Press', sets: 3, reps: 8, weight: 0, restTime: 90, muscleGroup: 'Chest' },
        { id: '3', name: 'Barbell Row', sets: 3, reps: 8, weight: 0, restTime: 90, muscleGroup: 'Back' },
        { id: '4', name: 'Overhead Press', sets: 3, reps: 8, weight: 0, restTime: 90, muscleGroup: 'Shoulders' },
        { id: '5', name: 'Plank', sets: 3, duration: 60, restTime: 45, muscleGroup: 'Core' },
      ]
    }
  },
  {
    id: 'hiit',
    name: 'HIIT Circuit',
    description: 'High intensity interval training circuit',
    isPreMade: true,
    workout: {
      id: 'hiit-workout',
      name: 'HIIT Circuit',
      type: 'HIIT',
      estimatedDuration: 30,
      createdAt: new Date().toISOString(),
      exercises: [
        { id: '1', name: 'Burpees', sets: 4, duration: 30, restTime: 15, muscleGroup: 'Cardio' },
        { id: '2', name: 'Mountain Climbers', sets: 4, duration: 30, restTime: 15, muscleGroup: 'Core' },
        { id: '3', name: 'Jump Rope', sets: 4, duration: 60, restTime: 15, muscleGroup: 'Cardio' },
        { id: '4', name: 'Push-ups', sets: 4, reps: 15, restTime: 15, muscleGroup: 'Chest' },
        { id: '5', name: 'Squat', sets: 4, reps: 20, restTime: 15, muscleGroup: 'Legs' },
      ]
    }
  },
];

const WORKOUT_TYPES: WorkoutType[] = ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Stretching', 'Pilates', 'CrossFit', 'Rest'];
const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body'];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Column configuration for workouts (for sync and export)
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Workout Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'exerciseCount', header: 'Exercises', type: 'number' },
  { key: 'estimatedDuration', header: 'Duration (min)', type: 'number' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Column configuration for workout exports (flattened with exercises)
const WORKOUT_COLUMNS: ColumnConfig[] = [
  { key: 'workoutName', header: 'Workout', type: 'string' },
  { key: 'workoutType', header: 'Type', type: 'string' },
  { key: 'exerciseName', header: 'Exercise', type: 'string' },
  { key: 'muscleGroup', header: 'Muscle Group', type: 'string' },
  { key: 'sets', header: 'Sets', type: 'number' },
  { key: 'reps', header: 'Reps', type: 'number' },
  { key: 'weight', header: 'Weight (lbs)', type: 'number' },
  { key: 'duration', header: 'Duration (sec)', type: 'number' },
  { key: 'restTime', header: 'Rest Time (sec)', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Column configuration for completed workouts export
const COMPLETED_COLUMNS: ColumnConfig[] = [
  { key: 'workoutName', header: 'Workout', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'exerciseCount', header: 'Exercises', type: 'number' },
  { key: 'totalSets', header: 'Total Sets', type: 'number' },
  { key: 'totalReps', header: 'Total Reps', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 9);

const getWeekDates = (weekOffset: number): Date[] => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getWorkoutTypeColor = (type: WorkoutType): string => {
  const colors: Record<WorkoutType, string> = {
    Strength: '#ef4444',
    Cardio: '#3b82f6',
    HIIT: '#f59e0b',
    Yoga: '#8b5cf6',
    Stretching: '#10b981',
    Pilates: '#ec4899',
    CrossFit: '#f97316',
    Rest: '#6b7280',
  };
  return colors[type];
};

interface WorkoutPlannerToolProps {
  uiConfig?: UIConfig;
}

export const WorkoutPlannerTool: React.FC<WorkoutPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [weekOffset, setWeekOffset] = useState(0);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence of workouts
  const {
    data: workouts,
    setData: setWorkouts,
    addItem: addWorkout,
    updateItem: updateWorkout,
    deleteItem: deleteWorkoutItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Workout>('workout-planner', [], COLUMNS);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.formData) {
        if (params.formData.workoutName) setNewWorkoutName(params.formData.workoutName);
        if (params.formData.workoutType) setNewWorkoutType(params.formData.workoutType as WorkoutType);
        if (params.formData.activeTab) setActiveTab(params.formData.activeTab as TabType);
        setIsPrefilled(true);
      }
      if (params.text || params.content) {
        setNewWorkoutName(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    const saved = localStorage.getItem('workout-planner-schedule');
    return saved ? JSON.parse(saved) : [];
  });

  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => {
    const saved = localStorage.getItem('workout-planner-templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const [customExercises, setCustomExercises] = useState<LibraryExercise[]>(() => {
    const saved = localStorage.getItem('workout-planner-custom-exercises');
    return saved ? JSON.parse(saved) : [];
  });

  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => {
    const saved = localStorage.getItem('workout-planner-prs');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>(() => {
    const saved = localStorage.getItem('workout-planner-completed');
    return saved ? JSON.parse(saved) : [];
  });

  // Workout Builder state
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutType, setNewWorkoutType] = useState<WorkoutType>('Strength');

  // Exercise Library state
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'All'>('All');
  const [showAddCustomExercise, setShowAddCustomExercise] = useState(false);
  const [newCustomExercise, setNewCustomExercise] = useState({ name: '', muscleGroup: 'Chest' as MuscleGroup, description: '' });

  // Timer state
  const [timerMode, setTimerMode] = useState<'rest' | 'workout' | 'interval'>('rest');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInitial, setTimerInitial] = useState(60);
  const [intervalWork, setIntervalWork] = useState(30);
  const [intervalRest, setIntervalRest] = useState(10);
  const [intervalRounds, setIntervalRounds] = useState(8);
  const [currentIntervalRound, setCurrentIntervalRound] = useState(1);
  const [isIntervalWork, setIsIntervalWork] = useState(true);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Assign workout to day modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Save to localStorage (for non-workout data that doesn't use useToolData)
  // Note: workouts are handled by useToolData hook with backend sync

  useEffect(() => {
    localStorage.setItem('workout-planner-schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('workout-planner-templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('workout-planner-custom-exercises', JSON.stringify(customExercises));
  }, [customExercises]);

  useEffect(() => {
    localStorage.setItem('workout-planner-prs', JSON.stringify(personalRecords));
  }, [personalRecords]);

  useEffect(() => {
    localStorage.setItem('workout-planner-completed', JSON.stringify(completedWorkouts));
  }, [completedWorkouts]);

  // Prepare flattened export data (all exercises with workout info)
  const workoutExportData = useMemo(() => {
    const data: Record<string, any>[] = [];
    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        data.push({
          workoutName: workout.name,
          workoutType: workout.type,
          exerciseName: exercise.name,
          muscleGroup: exercise.muscleGroup,
          sets: exercise.sets || 0,
          reps: exercise.reps || 0,
          weight: exercise.weight || 0,
          duration: exercise.duration || 0,
          restTime: exercise.restTime,
          notes: exercise.notes || '',
        });
      });
    });
    return data;
  }, [workouts]);

  // Prepare completed workouts export data
  const completedExportData = useMemo(() => {
    return completedWorkouts.map((cw) => ({
      workoutName: cw.workoutName,
      date: cw.date,
      duration: cw.duration,
      exerciseCount: cw.exercises.length,
      totalSets: cw.exercises.reduce((acc, e) => acc + e.sets, 0),
      totalReps: cw.exercises.reduce((acc, e) => acc + (e.sets * e.reps), 0),
    }));
  }, [completedWorkouts]);

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSx+zPPTgjMGHm7A7+OZSA0PVKno77BdGAg+l9z0xnMpBSh5yPDajzwIDly47+mjUBELTKXk8LdmHwU2jtLzzHwvByd3xvDglEQKElyx6OypVxMLTKjm871rJAU5kdLy0H0xByJ0w/DglkUKE2Cy6vGpVxINS6ro9L1sJQU5ktPy0n4yByN1xPDhmEcLEl+y6/KqWhQMTqzo9L1tJgU6ktT00H4xByN0w/DglkUKEV6x6O6oVRMNTavm9L1sJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/Dg';
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            playSound();
            if (timerMode === 'interval') {
              if (isIntervalWork) {
                setIsIntervalWork(false);
                return intervalRest;
              } else {
                if (currentIntervalRound < intervalRounds) {
                  setCurrentIntervalRound(r => r + 1);
                  setIsIntervalWork(true);
                  return intervalWork;
                } else {
                  setTimerRunning(false);
                  setCurrentIntervalRound(1);
                  setIsIntervalWork(true);
                  return 0;
                }
              }
            }
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerMode, isIntervalWork, currentIntervalRound, intervalRounds, intervalWork, intervalRest]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  // Week dates
  const weekDates = getWeekDates(weekOffset);

  // Get schedule for a date
  const getScheduleForDate = (date: string): DaySchedule | undefined => {
    return schedule.find(s => s.date === date);
  };

  // Get workout by ID
  const getWorkoutById = (id: string): Workout | undefined => {
    return workouts.find(w => w.id === id);
  };

  // Assign workout to date
  const assignWorkoutToDate = (date: string, workoutId: string | null) => {
    const existing = schedule.findIndex(s => s.date === date);
    if (existing >= 0) {
      const updated = [...schedule];
      updated[existing] = { ...updated[existing], workoutId, completed: false };
      setSchedule(updated);
    } else {
      setSchedule([...schedule, { date, workoutId, completed: false }]);
    }
    setShowAssignModal(false);
    setSelectedDate(null);
  };

  // Mark workout as complete
  const markWorkoutComplete = (date: string) => {
    const daySchedule = getScheduleForDate(date);
    if (daySchedule && daySchedule.workoutId) {
      const workout = getWorkoutById(daySchedule.workoutId);
      if (workout) {
        // Update schedule
        const updated = schedule.map(s =>
          s.date === date ? { ...s, completed: true, completedAt: new Date().toISOString() } : s
        );
        setSchedule(updated);

        // Add to completed workouts
        const completed: CompletedWorkout = {
          id: generateId(),
          workoutId: workout.id,
          workoutName: workout.name,
          date: new Date().toISOString(),
          duration: workout.estimatedDuration,
          exercises: workout.exercises.map(e => ({
            name: e.name,
            sets: e.sets || 0,
            reps: e.reps || 0,
            weight: e.weight || 0,
          })),
        };
        setCompletedWorkouts([...completedWorkouts, completed]);

        // Update PRs
        workout.exercises.forEach(exercise => {
          if (exercise.weight && exercise.reps) {
            const existingPR = personalRecords.find(pr => pr.exerciseName === exercise.name);
            if (!existingPR || exercise.weight > existingPR.weight) {
              const newPRs = personalRecords.filter(pr => pr.exerciseName !== exercise.name);
              newPRs.push({
                exerciseName: exercise.name,
                weight: exercise.weight,
                reps: exercise.reps,
                date: new Date().toISOString(),
              });
              setPersonalRecords(newPRs);
            }
          }
        });
      }
    }
  };

  // Create new workout
  const createWorkout = () => {
    if (!newWorkoutName.trim()) return;
    const newWorkout: Workout = {
      id: generateId(),
      name: newWorkoutName,
      type: newWorkoutType,
      exercises: [],
      estimatedDuration: 0,
      createdAt: new Date().toISOString(),
    };
    addWorkout(newWorkout);
    setEditingWorkout(newWorkout);
    setNewWorkoutName('');
  };

  // Add exercise to workout
  const addExerciseToWorkout = (exercise: LibraryExercise) => {
    if (!editingWorkout) return;
    const newExercise: Exercise = {
      id: generateId(),
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
    };
    const updatedExercises = [...editingWorkout.exercises, newExercise];
    const updated = {
      ...editingWorkout,
      exercises: updatedExercises,
      estimatedDuration: updatedExercises.length * 5,
    };
    setEditingWorkout(updated);
    updateWorkout(editingWorkout.id, { exercises: updatedExercises, estimatedDuration: updatedExercises.length * 5 });
  };

  // Update exercise in workout
  const updateExercise = (exerciseId: string, field: keyof Exercise, value: number | string) => {
    if (!editingWorkout) return;
    const updatedExercises = editingWorkout.exercises.map(e =>
      e.id === exerciseId ? { ...e, [field]: value } : e
    );
    const updated = {
      ...editingWorkout,
      exercises: updatedExercises,
    };
    setEditingWorkout(updated);
    updateWorkout(editingWorkout.id, { exercises: updatedExercises });
  };

  // Remove exercise from workout
  const removeExercise = (exerciseId: string) => {
    if (!editingWorkout) return;
    const updatedExercises = editingWorkout.exercises.filter(e => e.id !== exerciseId);
    const updated = {
      ...editingWorkout,
      exercises: updatedExercises,
    };
    setEditingWorkout(updated);
    updateWorkout(editingWorkout.id, { exercises: updatedExercises });
  };

  // Move exercise in workout
  const moveExercise = (fromIndex: number, toIndex: number) => {
    if (!editingWorkout) return;
    const exercises = [...editingWorkout.exercises];
    const [moved] = exercises.splice(fromIndex, 1);
    exercises.splice(toIndex, 0, moved);
    const updated = { ...editingWorkout, exercises };
    setEditingWorkout(updated);
    updateWorkout(editingWorkout.id, { exercises });
  };

  // Delete workout
  const deleteWorkout = (workoutId: string) => {
    setWorkouts(workouts.filter(w => w.id !== workoutId));
    if (editingWorkout?.id === workoutId) {
      setEditingWorkout(null);
    }
    // Remove from schedule
    setSchedule(schedule.map(s => s.workoutId === workoutId ? { ...s, workoutId: null } : s));
  };

  // Save workout as template
  const saveAsTemplate = (workout: Workout) => {
    const template: WorkoutTemplate = {
      id: generateId(),
      name: workout.name,
      description: `Custom ${workout.type} workout`,
      workout: { ...workout, id: generateId() },
      isPreMade: false,
    };
    setTemplates([...templates, template]);
  };

  // Apply template
  const applyTemplate = (template: WorkoutTemplate) => {
    const newWorkout: Workout = {
      ...template.workout,
      id: generateId(),
      createdAt: new Date().toISOString(),
      exercises: template.workout.exercises.map(e => ({ ...e, id: generateId() })),
    };
    setWorkouts([...workouts, newWorkout]);
    setEditingWorkout(newWorkout);
    setActiveTab('builder');
  };

  // Delete template
  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  // Add custom exercise
  const addCustomExercise = () => {
    if (!newCustomExercise.name.trim()) return;
    setCustomExercises([...customExercises, { ...newCustomExercise, isCustom: true }]);
    setNewCustomExercise({ name: '', muscleGroup: 'Chest', description: '' });
    setShowAddCustomExercise(false);
  };

  // Filter exercises
  const allExercises = [...DEFAULT_EXERCISES, ...customExercises];
  const filteredExercises = allExercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesGroup = selectedMuscleGroup === 'All' || e.muscleGroup === selectedMuscleGroup;
    return matchesSearch && matchesGroup;
  });

  // Weekly stats
  const weeklyWorkouts = completedWorkouts.filter(cw => {
    const cwDate = new Date(cw.date);
    const startOfWeek = weekDates[0];
    const endOfWeek = weekDates[6];
    return cwDate >= startOfWeek && cwDate <= endOfWeek;
  });

  // Render tabs
  const renderTabs = () => (
    <div className={`flex flex-wrap gap-2 mb-6 p-1 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
      {[
        { id: 'schedule' as TabType, icon: Calendar, label: 'Schedule' },
        { id: 'builder' as TabType, icon: Dumbbell, label: 'Builder' },
        { id: 'library' as TabType, icon: BookOpen, label: 'Library' },
        { id: 'templates' as TabType, icon: FileText, label: 'Templates' },
        { id: 'progress' as TabType, icon: TrendingUp, label: 'Progress' },
        { id: 'timer' as TabType, icon: Timer, label: 'Timer' },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-[#0D9488] text-white'
              : theme === 'dark'
              ? 'text-gray-300 hover:bg-gray-600'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  // Render Weekly Schedule
  const renderSchedule = () => (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h3>
          {weekOffset === 0 && (
            <span className="text-xs text-[#0D9488]">{t('tools.workoutPlanner.thisWeek', 'This Week')}</span>
          )}
        </div>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, index) => {
          const dateStr = formatDate(date);
          const daySchedule = getScheduleForDate(dateStr);
          const workout = daySchedule?.workoutId ? getWorkoutById(daySchedule.workoutId) : null;
          const isToday = formatDate(new Date()) === dateStr;

          return (
            <div
              key={dateStr}
              className={`p-3 rounded-lg border-2 transition-all min-h-[120px] ${
                isToday
                  ? 'border-[#0D9488]'
                  : theme === 'dark'
                  ? 'border-gray-700'
                  : 'border-gray-200'
              } ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="text-center mb-2">
                <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {DAYS_OF_WEEK[index]}
                </div>
                <div className={`text-lg font-bold ${isToday ? 'text-[#0D9488]' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
              </div>

              {workout ? (
                <div
                  className="p-2 rounded text-center text-xs cursor-pointer"
                  style={{ backgroundColor: `${getWorkoutTypeColor(workout.type)}20` }}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setShowAssignModal(true);
                  }}
                >
                  <div className="font-medium truncate" style={{ color: getWorkoutTypeColor(workout.type) }}>
                    {workout.name}
                  </div>
                  {daySchedule?.completed && (
                    <Check className="w-4 h-4 mx-auto mt-1 text-green-500" />
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setShowAssignModal(true);
                  }}
                  className={`w-full p-2 rounded text-xs ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                  }`}
                >
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              )}

              {workout && !daySchedule?.completed && (
                <button
                  onClick={() => markWorkoutComplete(dateStr)}
                  className="w-full mt-2 p-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded"
                >
                  {t('tools.workoutPlanner.complete', 'Complete')}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.workoutPlanner.weeklySummary', 'Weekly Summary')}
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[#0D9488]">{weeklyWorkouts.length}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.workoutPlanner.workouts', 'Workouts')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0D9488]">
              {weeklyWorkouts.reduce((acc, w) => acc + w.duration, 0)}
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.workoutPlanner.minutes', 'Minutes')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0D9488]">
              {weeklyWorkouts.reduce((acc, w) => acc + w.exercises.length, 0)}
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.workoutPlanner.exercises', 'Exercises')}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Workout Builder
  const renderBuilder = () => (
    <div className="space-y-6">
      {/* Create New Workout */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.workoutPlanner.createNewWorkout', 'Create New Workout')}
        </h4>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={newWorkoutName}
            onChange={(e) => setNewWorkoutName(e.target.value)}
            placeholder={t('tools.workoutPlanner.workoutName', 'Workout name')}
            className={`flex-1 min-w-[200px] px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <select
            value={newWorkoutType}
            onChange={(e) => setNewWorkoutType(e.target.value as WorkoutType)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-600 border-gray-500 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {WORKOUT_TYPES.filter(t => t !== 'Rest').map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button
            onClick={createWorkout}
            disabled={!newWorkoutName.trim()}
            className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {t('tools.workoutPlanner.create', 'Create')}
          </button>
        </div>
      </div>

      {/* Workout List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workouts.map(workout => (
          <div
            key={workout.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              editingWorkout?.id === workout.id
                ? 'border-[#0D9488]'
                : theme === 'dark'
                ? 'border-gray-700 hover:border-gray-600'
                : 'border-gray-200 hover:border-gray-300'
            } ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}
            onClick={() => setEditingWorkout(workout)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h5 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {workout.name}
                </h5>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: `${getWorkoutTypeColor(workout.type)}20`, color: getWorkoutTypeColor(workout.type) }}
                  >
                    {workout.type}
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {workout.exercises.length} exercises
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveAsTemplate(workout);
                  }}
                  className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  title={t('tools.workoutPlanner.saveAsTemplate', 'Save as template')}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWorkout(workout.id);
                  }}
                  className={`p-1.5 rounded text-red-500 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Exercise Editor */}
      {editingWorkout && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Editing: {editingWorkout.name}
            </h4>
            <button
              onClick={() => setEditingWorkout(null)}
              className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add from Library */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.workoutPlanner.quickAddExercise', 'Quick Add Exercise')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_EXERCISES.slice(0, 8).map(ex => (
                <button
                  key={ex.name}
                  onClick={() => addExerciseToWorkout(ex)}
                  className={`text-xs px-3 py-1.5 rounded-full ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  + {ex.name}
                </button>
              ))}
              <button
                onClick={() => setActiveTab('library')}
                className="text-xs px-3 py-1.5 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white"
              >
                {t('tools.workoutPlanner.browseAll', 'Browse All')}
              </button>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            {editingWorkout.exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => index > 0 && moveExercise(index, index - 1)}
                      disabled={index === 0}
                      className={`p-0.5 rounded ${index === 0 ? 'opacity-30' : 'hover:bg-gray-500'}`}
                    >
                      <ChevronLeft className="w-4 h-4 rotate-90" />
                    </button>
                    <button
                      onClick={() => index < editingWorkout.exercises.length - 1 && moveExercise(index, index + 1)}
                      disabled={index === editingWorkout.exercises.length - 1}
                      className={`p-0.5 rounded ${index === editingWorkout.exercises.length - 1 ? 'opacity-30' : 'hover:bg-gray-500'}`}
                    >
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </button>
                  </div>
                  <GripVertical className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {exercise.name}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {exercise.muscleGroup}
                    </div>
                  </div>
                  <button
                    onClick={() => removeExercise(exercise.id)}
                    className="p-1.5 rounded text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workoutPlanner.sets', 'Sets')}</label>
                    <input
                      type="number"
                      value={exercise.sets || ''}
                      onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                      className={`w-full px-2 py-1 text-sm rounded border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-500 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workoutPlanner.reps', 'Reps')}</label>
                    <input
                      type="number"
                      value={exercise.reps || ''}
                      onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                      className={`w-full px-2 py-1 text-sm rounded border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-500 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workoutPlanner.weightLbs', 'Weight (lbs)')}</label>
                    <input
                      type="number"
                      value={exercise.weight || ''}
                      onChange={(e) => updateExercise(exercise.id, 'weight', parseInt(e.target.value) || 0)}
                      className={`w-full px-2 py-1 text-sm rounded border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-500 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workoutPlanner.restSec', 'Rest (sec)')}</label>
                    <input
                      type="number"
                      value={exercise.restTime}
                      onChange={(e) => updateExercise(exercise.id, 'restTime', parseInt(e.target.value) || 0)}
                      className={`w-full px-2 py-1 text-sm rounded border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-500 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    value={exercise.notes || ''}
                    onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                    placeholder={t('tools.workoutPlanner.notesOptional', 'Notes (optional)')}
                    className={`w-full px-2 py-1 text-sm rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {editingWorkout.exercises.length === 0 && (
            <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('tools.workoutPlanner.noExercisesAddedYet', 'No exercises added yet')}</p>
              <p className="text-sm">{t('tools.workoutPlanner.addExercisesFromTheQuick', 'Add exercises from the quick add above or browse the library')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render Exercise Library
  const renderLibrary = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            value={exerciseSearch}
            onChange={(e) => setExerciseSearch(e.target.value)}
            placeholder={t('tools.workoutPlanner.searchExercises', 'Search exercises...')}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        <select
          value={selectedMuscleGroup}
          onChange={(e) => setSelectedMuscleGroup(e.target.value as MuscleGroup | 'All')}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="All">{t('tools.workoutPlanner.allMuscleGroups', 'All Muscle Groups')}</option>
          {MUSCLE_GROUPS.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
        <button
          onClick={() => setShowAddCustomExercise(true)}
          className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('tools.workoutPlanner.addCustom', 'Add Custom')}
        </button>
      </div>

      {/* Add Custom Exercise Modal */}
      {showAddCustomExercise && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.workoutPlanner.addCustomExercise', 'Add Custom Exercise')}
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              value={newCustomExercise.name}
              onChange={(e) => setNewCustomExercise({ ...newCustomExercise, name: e.target.value })}
              placeholder={t('tools.workoutPlanner.exerciseName', 'Exercise name')}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <select
              value={newCustomExercise.muscleGroup}
              onChange={(e) => setNewCustomExercise({ ...newCustomExercise, muscleGroup: e.target.value as MuscleGroup })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {MUSCLE_GROUPS.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <input
              type="text"
              value={newCustomExercise.description}
              onChange={(e) => setNewCustomExercise({ ...newCustomExercise, description: e.target.value })}
              placeholder={t('tools.workoutPlanner.descriptionOptional', 'Description (optional)')}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <div className="flex gap-2">
              <button
                onClick={addCustomExercise}
                className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
              >
                {t('tools.workoutPlanner.addExercise', 'Add Exercise')}
              </button>
              <button
                onClick={() => setShowAddCustomExercise(false)}
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {t('tools.workoutPlanner.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredExercises.map((exercise, index) => (
          <div
            key={`${exercise.name}-${index}`}
            className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {exercise.name}
                  {exercise.isCustom && (
                    <span className="ml-2 text-xs text-[#0D9488]">(Custom)</span>
                  )}
                </h5>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}>
                  {exercise.muscleGroup}
                </span>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {exercise.description}
                </p>
              </div>
            </div>
            {editingWorkout && (
              <button
                onClick={() => addExerciseToWorkout(exercise)}
                className="w-full mt-3 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm rounded-lg flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('tools.workoutPlanner.addToWorkout', 'Add to Workout')}
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('tools.workoutPlanner.noExercisesFound', 'No exercises found')}</p>
        </div>
      )}
    </div>
  );

  // Render Templates
  const renderTemplates = () => (
    <div className="space-y-6">
      {/* Pre-made Templates */}
      <div>
        <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.workoutPlanner.preMadeTemplates', 'Pre-made Templates')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.filter(t => t.isPreMade).map(template => (
            <div
              key={template.id}
              className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h5 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {template.name}
                  </h5>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${getWorkoutTypeColor(template.workout.type)}20`, color: getWorkoutTypeColor(template.workout.type) }}
                  >
                    {template.workout.type}
                  </span>
                </div>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {template.workout.exercises.length} exercises
                </span>
              </div>
              <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {template.description}
              </p>
              <button
                onClick={() => applyTemplate(template)}
                className="w-full px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm"
              >
                {t('tools.workoutPlanner.useTemplate', 'Use Template')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      {templates.filter(t => !t.isPreMade).length > 0 && (
        <div>
          <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.workoutPlanner.myTemplates', 'My Templates')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.filter(t => !t.isPreMade).map(template => (
              <div
                key={template.id}
                className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {template.name}
                    </h5>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${getWorkoutTypeColor(template.workout.type)}20`, color: getWorkoutTypeColor(template.workout.type) }}
                    >
                      {template.workout.type}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-1.5 rounded text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {template.description}
                </p>
                <button
                  onClick={() => applyTemplate(template)}
                  className="w-full px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm"
                >
                  {t('tools.workoutPlanner.useTemplate2', 'Use Template')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Progress
  const renderProgress = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0D9488]/20">
              <Flame className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0D9488]">{completedWorkouts.length}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workoutPlanner.totalWorkouts', 'Total Workouts')}</div>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {completedWorkouts.reduce((acc, w) => acc + w.duration, 0)}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workoutPlanner.totalMinutes', 'Total Minutes')}</div>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">
                {completedWorkouts.reduce((acc, w) => acc + w.exercises.length, 0)}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workoutPlanner.exercisesDone', 'Exercises Done')}</div>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">{personalRecords.length}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.workoutPlanner.personalRecords', 'Personal Records')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Records */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h4 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Award className="w-5 h-5 text-yellow-500" />
          {t('tools.workoutPlanner.personalRecords2', 'Personal Records')}
        </h4>
        {personalRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {personalRecords.map((pr, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
              >
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {pr.exerciseName}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-[#0D9488]">{pr.weight} lbs</span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    x {pr.reps} reps
                  </span>
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(pr.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t('tools.workoutPlanner.noPersonalRecordsYet', 'No personal records yet')}</p>
            <p className="text-sm">{t('tools.workoutPlanner.completeWorkoutsWithWeightsTo', 'Complete workouts with weights to track PRs')}</p>
          </div>
        )}
      </div>

      {/* Recent Workouts */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.workoutPlanner.recentWorkouts', 'Recent Workouts')}
        </h4>
        {completedWorkouts.length > 0 ? (
          <div className="space-y-3">
            {completedWorkouts.slice(-10).reverse().map(workout => (
              <div
                key={workout.id}
                className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {workout.workoutName}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {workout.exercises.length} exercises - {workout.duration} min
                    </div>
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(workout.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t('tools.workoutPlanner.noWorkoutsCompletedYet', 'No workouts completed yet')}</p>
            <p className="text-sm">{t('tools.workoutPlanner.completeAScheduledWorkoutTo', 'Complete a scheduled workout to see progress')}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render Timer
  const renderTimer = () => (
    <div className="space-y-6">
      {/* Timer Mode Selection */}
      <div className="flex gap-2">
        {[
          { id: 'rest' as const, label: 'Rest Timer' },
          { id: 'workout' as const, label: 'Workout Timer' },
          { id: 'interval' as const, label: 'Interval Timer' },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => {
              setTimerMode(mode.id);
              setTimerRunning(false);
              if (mode.id === 'interval') {
                setTimerSeconds(intervalWork);
                setCurrentIntervalRound(1);
                setIsIntervalWork(true);
              } else {
                setTimerSeconds(timerInitial);
              }
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              timerMode === mode.id
                ? 'bg-[#0D9488] text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className={`text-center py-12 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
        {timerMode === 'interval' && (
          <div className="mb-4">
            <span className={`text-lg font-medium px-4 py-1 rounded-full ${
              isIntervalWork ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
            }`}>
              {isIntervalWork ? t('tools.workoutPlanner.work', 'WORK') : t('tools.workoutPlanner.rest', 'REST')} - Round {currentIntervalRound}/{intervalRounds}
            </span>
          </div>
        )}
        <div className={`text-7xl font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {formatTime(timerSeconds)}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setTimerRunning(!timerRunning)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
            timerRunning
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : t('tools.workoutPlanner.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
          }`}
        >
          {timerRunning ? (
            <>
              <Pause className="w-5 h-5" />
              {t('tools.workoutPlanner.pause', 'Pause')}
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {t('tools.workoutPlanner.start', 'Start')}
            </>
          )}
        </button>
        <button
          onClick={() => {
            setTimerRunning(false);
            if (timerMode === 'interval') {
              setTimerSeconds(intervalWork);
              setCurrentIntervalRound(1);
              setIsIntervalWork(true);
            } else {
              setTimerSeconds(timerInitial);
            }
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          {t('tools.workoutPlanner.reset', 'Reset')}
        </button>
      </div>

      {/* Timer Settings */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.workoutPlanner.timerSettings', 'Timer Settings')}
        </h4>
        {timerMode !== 'interval' ? (
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.workoutPlanner.durationSeconds', 'Duration (seconds)')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {[30, 45, 60, 90, 120, 180].map(sec => (
                <button
                  key={sec}
                  onClick={() => {
                    setTimerInitial(sec);
                    setTimerSeconds(sec);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    timerInitial === sec
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutPlanner.workSeconds', 'Work (seconds)')}
              </label>
              <input
                type="number"
                value={intervalWork}
                onChange={(e) => setIntervalWork(parseInt(e.target.value) || 30)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutPlanner.restSeconds', 'Rest (seconds)')}
              </label>
              <input
                type="number"
                value={intervalRest}
                onChange={(e) => setIntervalRest(parseInt(e.target.value) || 10)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutPlanner.rounds', 'Rounds')}
              </label>
              <input
                type="number"
                value={intervalRounds}
                onChange={(e) => setIntervalRounds(parseInt(e.target.value) || 8)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0D9488] rounded-lg">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.workoutPlanner.workoutPlanner', 'Workout Planner')}
          </h2>
        </div>
        <ExportDropdown
          onExportCSV={() => exportToCSV(workoutExportData, WORKOUT_COLUMNS, { filename: 'workout-planner' })}
          onExportExcel={() => exportToExcel(workoutExportData, WORKOUT_COLUMNS, { filename: 'workout-planner' })}
          onExportJSON={() => exportToJSON(workouts, { filename: 'workout-planner' })}
          onExportPDF={() => exportToPDF(workoutExportData, WORKOUT_COLUMNS, {
            filename: 'workout-planner',
            title: 'Workout Planner Report',
            subtitle: `${workouts.length} workouts | ${completedWorkouts.length} completed`
          })}
          onPrint={() => printData(workoutExportData, WORKOUT_COLUMNS, { title: 'Workout Planner Report' })}
          onCopyToClipboard={() => copyUtil(workoutExportData, WORKOUT_COLUMNS)}
          disabled={workoutExportData.length === 0}
          showImport={false}
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
      </div>

      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.workoutPlanner.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
        </div>
      )}

      {/* Tabs */}
      {renderTabs()}

      {/* Tab Content */}
      {activeTab === 'schedule' && renderSchedule()}
      {activeTab === 'builder' && renderBuilder()}
      {activeTab === 'library' && renderLibrary()}
      {activeTab === 'templates' && renderTemplates()}
      {activeTab === 'progress' && renderProgress()}
      {activeTab === 'timer' && renderTimer()}

      {/* Assign Workout Modal */}
      {showAssignModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Assign Workout - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedDate(null);
                }}
                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <button
                onClick={() => assignWorkoutToDate(selectedDate, null)}
                className={`w-full p-3 rounded-lg text-left ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.workoutPlanner.restDay', 'Rest Day')}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.workoutPlanner.noWorkoutScheduled', 'No workout scheduled')}
                </div>
              </button>
              {workouts.map(workout => (
                <button
                  key={workout.id}
                  onClick={() => assignWorkoutToDate(selectedDate, workout.id)}
                  className={`w-full p-3 rounded-lg text-left ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {workout.name}
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${getWorkoutTypeColor(workout.type)}20`, color: getWorkoutTypeColor(workout.type) }}
                    >
                      {workout.type}
                    </span>
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {workout.exercises.length} exercises - ~{workout.estimatedDuration} min
                  </div>
                </button>
              ))}
              {workouts.length === 0 && (
                <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>{t('tools.workoutPlanner.noWorkoutsCreatedYet', 'No workouts created yet')}</p>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedDate(null);
                      setActiveTab('builder');
                    }}
                    className="text-[#0D9488] hover:underline text-sm mt-2"
                  >
                    {t('tools.workoutPlanner.createAWorkout', 'Create a workout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlannerTool;
