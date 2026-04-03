export interface LanguageLearnerUser {
  id: string;
  targetLanguage: string;
  nativeLanguage: string;
  learningPurpose: LearningPurpose;
  dailyGoal: number; // minutes
  proficiencyLevel: ProficiencyLevel;
  learningStyle: LearningStyle[];
  streak: StreakData;
  xp: number;
  hearts: number;
  maxHearts: number;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  progress: UserProgress;
  achievements: Achievement[];
}

export interface StreakData {
  current: number;
  longest: number;
  lastActiveDate: Date;
  freezeCount: number;
  streakGoal: number;
}

export interface UserPreferences {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:MM format
  reminderDays: number[]; // 0-6 (Sunday-Saturday)
  speechRecognitionEnabled: boolean;
  listeningExercisesEnabled: boolean;
  speakingExercisesEnabled: boolean;
  darkModeEnabled: boolean;
  autoplayAudio: boolean;
  showHints: boolean;
}

export interface UserProgress {
  overallLevel: number;
  completedLessons: string[];
  skillProgress: SkillProgress[];
  weeklyXp: number[];
  monthlyXp: number[];
  timeSpentLearning: number; // total minutes
  vocabularySize: number;
  accuracy: AccuracyStats;
  lastActiveDate: Date;
}

export interface SkillProgress {
  skillId: string;
  level: number;
  xp: number;
  maxXp: number;
  crownLevel: CrownLevel;
  strength: number; // 0-1 (for spaced repetition)
  lastPracticedDate: Date;
  mastered: boolean;
}

export interface AccuracyStats {
  overall: number;
  multipleChoice: number;
  translation: number;
  listening: number;
  speaking: number;
  matching: number;
  fillBlank: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  unlockedAt: Date;
  progress: number;
  maxProgress: number;
  rarity: AchievementRarity;
}

export type LearningPurpose = 
  | 'travel' 
  | 'business' 
  | 'education' 
  | 'family' 
  | 'hobby' 
  | 'brain-training';

export type ProficiencyLevel = 
  | 'beginner' 
  | 'elementary' 
  | 'intermediate' 
  | 'advanced';

export type LearningStyle = 
  | 'visual' 
  | 'audio' 
  | 'interactive' 
  | 'reading' 
  | 'writing';

export type CrownLevel = 
  | 'bronze' 
  | 'silver' 
  | 'gold' 
  | 'legendary';

export type AchievementCategory = 
  | 'streak' 
  | 'xp' 
  | 'lesson' 
  | 'skill' 
  | 'vocabulary' 
  | 'accuracy' 
  | 'social';

export type AchievementRarity = 
  | 'common' 
  | 'uncommon' 
  | 'rare' 
  | 'epic' 
  | 'legendary';