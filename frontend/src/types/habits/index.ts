/**
 * Habit-related type definitions
 */

// Re-export types from hooks for consistency
export type {
  Habit,
  HabitCompletion,
  HabitStreak,
  HabitStats,
  CreateHabitData,
  UpdateHabitData,
  MarkHabitCompleteData
} from '../../hooks/habits/useHabits';

// UI-specific types
export interface Notification {
  id: string;
  type: 'reminder' | 'streak' | 'achievement' | 'miss';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  habitId?: string;
}

export interface HabitForm {
  name: string;
  category: string;
  description: string;
  time: string;
  reminders: string[];
  priority: 'low' | 'medium' | 'high';
  frequency: string[];
  startDate: string;
  endDate: string;
  dailyGoal: string;
  extraGoal: string;
  color: string;
  goalType: 'simple' | 'measurable';
  targetValue: string;
  targetUnit: string;
}

export type TimeRange = 'week' | 'month' | 'year';
export type HabitTab = 'dashboard' | 'calendar' | 'streaks';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type HabitPriority = 'low' | 'medium' | 'high';

export const HABIT_CATEGORIES = [
  'Wellness',
  'Learning',
  'Fitness',
  'Health',
  'Work',
  'Personal',
  'Social',
  'Finance',
  'Creativity',
  'Mindfulness'
] as const;

export const HABIT_COLORS = [
  '#47bdff', // Primary blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#f97316'  // Orange
] as const;

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

// Goal types for habits
export const GOAL_TYPES = [
  { value: 'simple', label: 'Simple', description: 'Just track completion (e.g., Did you meditate?)' },
  { value: 'measurable', label: 'Measurable', description: 'Track with a specific target (e.g., Walk 5 km)' }
] as const;

// Units for measurable goals - organized by category
export const HABIT_UNITS = {
  distance: [
    { value: 'km', label: 'Kilometers (km)' },
    { value: 'mi', label: 'Miles (mi)' },
    { value: 'm', label: 'Meters (m)' },
    { value: 'steps', label: 'Steps' }
  ],
  volume: [
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'L', label: 'Liters (L)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'cups', label: 'Cups' },
    { value: 'glasses', label: 'Glasses' }
  ],
  time: [
    { value: 'min', label: 'Minutes (min)' },
    { value: 'hr', label: 'Hours (hr)' },
    { value: 'sec', label: 'Seconds (sec)' }
  ],
  count: [
    { value: 'times', label: 'Times' },
    { value: 'reps', label: 'Reps' },
    { value: 'sets', label: 'Sets' },
    { value: 'pages', label: 'Pages' },
    { value: 'chapters', label: 'Chapters' },
    { value: 'lessons', label: 'Lessons' },
    { value: 'words', label: 'Words' }
  ],
  weight: [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'cal', label: 'Calories (cal)' }
  ]
} as const;

// Flat list of all units for easy access
export const ALL_HABIT_UNITS = [
  ...HABIT_UNITS.distance,
  ...HABIT_UNITS.volume,
  ...HABIT_UNITS.time,
  ...HABIT_UNITS.count,
  ...HABIT_UNITS.weight
] as const;