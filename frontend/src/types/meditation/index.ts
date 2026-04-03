export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  category: MeditationCategory;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  audioUrl?: string;
  imageUrl?: string;
  tags: string[];
  hasGuidance: boolean;
  hasMusic: boolean;
  rating: number;
  totalRatings: number;
  isPremium: boolean;
  isDownloaded?: boolean;
}

export interface MeditationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sessionCount: number;
}

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  pattern: {
    inhale: number;
    hold1?: number;
    exhale: number;
    hold2?: number;
  };
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  instructions: string[];
}

export interface MeditationProgress {
  id: string;
  userId: string;
  sessionId: string;
  date: string;
  duration: number; // actual duration completed
  completed: boolean;
  moodBefore?: number; // 1-10 scale
  moodAfter?: number; // 1-10 scale
  notes?: string;
  rating?: number;
}

export interface MeditationStreak {
  current: number;
  longest: number;
  lastMeditationDate: string;
  totalSessions: number;
  totalMinutes: number;
}

export interface MeditationCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  totalLessons: number;
  estimatedDuration: string; // e.g., "7 days", "3 weeks"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  imageUrl?: string;
  lessons: MeditationLesson[];
  isPremium: boolean;
  completionCertificate: boolean;
}

export interface MeditationLesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: number;
  dayNumber: number;
  audioUrl?: string;
  completed: boolean;
  unlocked: boolean;
}

export interface SleepStory {
  id: string;
  title: string;
  description: string;
  narrator: string;
  duration: number;
  audioUrl?: string;
  imageUrl?: string;
  category: 'nature' | 'fantasy' | 'journey' | 'historical';
  rating: number;
  totalRatings: number;
  isPremium: boolean;
}

export interface AmbientSound {
  id: string;
  name: string;
  audioUrl: string;
  icon: string;
  category: 'nature' | 'white-noise' | 'binaural';
  volume: number;
  isPlaying: boolean;
}

export interface MeditationPreferences {
  preferredDuration: number[];
  favoriteCategories: string[];
  preferredInstructor: string;
  reminderTime?: string;
  reminderDays: boolean[];
  ambientSoundVolume: number;
  voiceVolume: number;
  enableHapticFeedback: boolean;
  autoStartNextSession: boolean;
  showMoodTracking: boolean;
}

export interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  favoriteCategory: string;
  currentStreak: number;
  longestStreak: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  minutesThisWeek: number;
  minutesThisMonth: number;
  moodImprovement: number; // average mood change
  consistencyScore: number; // percentage of days with meditation
}

export interface MeditationGoal {
  id: string;
  type: 'daily-minutes' | 'streak' | 'sessions-per-week' | 'complete-course';
  target: number;
  current: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  completed: boolean;
}

export interface MeditationTimer {
  duration: number;
  elapsed: number;
  isRunning: boolean;
  isPaused: boolean;
  hasStarted: boolean;
  intervalBells: boolean;
  bellInterval: number; // in minutes
}

export interface MoodEntry {
  id: string;
  date: string;
  beforeMeditation?: number;
  afterMeditation?: number;
  notes?: string;
  sessionId?: string;
}