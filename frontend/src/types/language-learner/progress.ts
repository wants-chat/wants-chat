export interface LearningProgress {
  userId: string;
  overallLevel: number;
  totalXp: number;
  weeklyXp: WeeklyXpData[];
  monthlyXp: MonthlyXpData[];
  streakData: StreakProgress;
  skillProgress: SkillProgressData[];
  lessonProgress: LessonProgressData[];
  vocabularyProgress: VocabularyProgressData;
  grammarProgress: GrammarProgressData;
  pronunciationProgress: PronunciationProgressData;
  dailyGoalProgress: DailyGoalProgress;
  achievements: AchievementProgress[];
  statistics: LearningStatistics;
  weakAreas: WeakArea[];
  strengthAreas: StrengthArea[];
  nextReviews: ReviewItem[];
  lastUpdated: Date;
}

export interface WeeklyXpData {
  week: string; // YYYY-WW format
  xp: number;
  goalMet: boolean;
  daysActive: number;
}

export interface MonthlyXpData {
  month: string; // YYYY-MM format
  xp: number;
  lessonsCompleted: number;
  vocabularyLearned: number;
}

export interface StreakProgress {
  currentStreak: number;
  longestStreak: number;
  streakGoal: number;
  lastActiveDate: Date;
  streakFreezesUsed: number;
  streakFreezesAvailable: number;
  perfectDays: number; // days where goal was exceeded
}

export interface SkillProgressData {
  skillId: string;
  skillName: string;
  level: number;
  currentXp: number;
  requiredXp: number;
  crownLevel: CrownLevel;
  strength: number; // 0-1, for spaced repetition
  lastPracticedDate: Date;
  nextReviewDate: Date;
  lessonsCompleted: number;
  totalLessons: number;
  accuracy: number;
  timeSpent: number; // minutes
  mastered: boolean;
}

export interface LessonProgressData {
  lessonId: string;
  skillId: string;
  completed: boolean;
  accuracy: number;
  bestScore: number;
  attempts: number;
  timeSpent: number; // minutes
  lastAttemptDate: Date;
  exerciseResults: ExerciseProgressData[];
}

export interface ExerciseProgressData {
  exerciseId: string;
  type: string;
  completed: boolean;
  accuracy: number;
  averageTime: number; // seconds
  attempts: number;
  lastCorrectDate?: Date;
}

export interface VocabularyProgressData {
  totalWordsLearned: number;
  wordsInProgress: number;
  wordsMastered: number;
  newWordsThisWeek: number;
  reviewWordsToday: number;
  vocabularyStrength: VocabularyStrengthData[];
  difficultWords: DifficultWord[];
  masteredWords: MasteredWord[];
}

export interface VocabularyStrengthData {
  wordId: string;
  word: string;
  strength: number; // 0-1
  lastReviewDate: Date;
  nextReviewDate: Date;
  correctAnswers: number;
  totalAttempts: number;
  streak: number;
}

export interface DifficultWord {
  wordId: string;
  word: string;
  translation: string;
  incorrectAttempts: number;
  lastMistakeDate: Date;
  commonMistakes: string[];
}

export interface MasteredWord {
  wordId: string;
  word: string;
  translation: string;
  masteredDate: Date;
  timesToMastery: number;
  finalStrength: number;
}

export interface GrammarProgressData {
  rulesLearned: number;
  rulesMastered: number;
  grammarAccuracy: number;
  grammarRuleProgress: GrammarRuleProgress[];
  commonGrammarMistakes: GrammarMistake[];
}

export interface GrammarRuleProgress {
  ruleId: string;
  ruleName: string;
  level: GrammarMasteryLevel;
  accuracy: number;
  practiceCount: number;
  lastPracticedDate: Date;
  examples: string[];
}

export interface GrammarMistake {
  ruleId: string;
  mistakeType: string;
  frequency: number;
  lastOccurrence: Date;
  corrections: string[];
}

export interface PronunciationProgressData {
  overallScore: number;
  phonemeProgress: PhonemeProgress[];
  difficultSounds: DifficultSound[];
  pronunciationStreak: number;
  totalRecordings: number;
  averageAccuracy: number;
}

export interface PhonemeProgress {
  phoneme: string;
  ipa: string;
  accuracy: number;
  attempts: number;
  lastPracticedDate: Date;
  improvements: string[];
}

export interface DifficultSound {
  phoneme: string;
  ipa: string;
  accuracy: number;
  issueDescription: string;
  practiceRecommendations: string[];
}

export interface DailyGoalProgress {
  goalMinutes: number;
  todayMinutes: number;
  weekStreak: number;
  goalsMet: DailyGoalRecord[];
  averageDailyMinutes: number;
  bestDay: DailyGoalRecord;
}

export interface DailyGoalRecord {
  date: Date;
  minutesCompleted: number;
  goalMet: boolean;
  xpEarned: number;
  lessonsCompleted: number;
}

export interface AchievementProgress {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: Date;
  category: string;
  rarity: string;
}

export interface LearningStatistics {
  totalTimeSpent: number; // minutes
  lessonsCompleted: number;
  exercisesCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  overallAccuracy: number;
  favoriteSkill: string;
  fastestImprovement: string;
  mostDifficultSkill: string;
  studyStreak: number;
  xpPerHour: number;
  averageSessionLength: number; // minutes
  bestAccuracyStreak: number;
}

export interface WeakArea {
  skillId: string;
  skillName: string;
  weakness: WeaknessType;
  accuracy: number;
  lastPracticed: Date;
  recommendedPractice: string[];
  priority: WeaknessPriority;
}

export interface StrengthArea {
  skillId: string;
  skillName: string;
  strength: StrengthType;
  accuracy: number;
  consistency: number;
  masteryLevel: number;
}

export interface ReviewItem {
  id: string;
  type: ReviewType;
  content: string;
  dueDate: Date;
  priority: ReviewPriority;
  estimatedTime: number; // minutes
}

export type CrownLevel = 'bronze' | 'silver' | 'gold' | 'legendary';

export type GrammarMasteryLevel = 'learning' | 'practicing' | 'familiar' | 'mastered';

export type WeaknessType = 'accuracy' | 'speed' | 'consistency' | 'retention';

export type WeaknessPriority = 'low' | 'medium' | 'high' | 'critical';

export type StrengthType = 'accuracy' | 'speed' | 'consistency' | 'mastery';

export type ReviewType = 'vocabulary' | 'grammar' | 'skill' | 'lesson';

export type ReviewPriority = 'low' | 'medium' | 'high' | 'urgent';