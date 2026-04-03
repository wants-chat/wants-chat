/**
 * Language Learner Hooks - Complete React Query Integration
 * Central export for all language learning hooks
 */

// Existing lesson hooks
export * from './useLessons';

// New comprehensive hooks
export * from './useVocabulary';
export * from './useExercises';
export * from './useStories';
export * from './useStudySessions';
export * from './useProgress';
export * from './useLeaderboard';

// New comprehensive hooks
export * from './useUserProgress';
export * from './useAchievements';
export * from './useAnalytics';
export * from './useUnitActions';

// Re-export types for convenience
export type {
  VocabularyWord,
  CreateVocabularyRequest,
  VocabularyQueryParams,
  Exercise,
  ExerciseQueryParams,
  UnitExercisesResponse,
  Story,
  CreateStoryRequest,
  StoryQueryParams,
  StudySession,
  CreateStudySessionRequest,
  UpdateStudySessionRequest,
  StudySessionQueryParams,
  Progress,
  UpdateProgressRequest,
  ProgressQueryParams,
  LeaderboardEntry,
  LeaderboardQueryParams,
  PaginatedResponse,
  // New types
  UserProgress,
  LessonProgressResponse,
  UnitProgress,
  ProgressSyncRequest,
  Achievement,
  UserAnalytics,
  UnitStartRequest,
  UnitStartResponse,
  UnitCompleteRequest,
  UnitCompleteResponse,
  SubmitExerciseRequest,
  SubmitExerciseResponse,
} from '../../services/languageApi';