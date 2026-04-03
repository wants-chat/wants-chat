/**
 * Complete Language Learning API Service
 * Provides comprehensive API endpoints for the language learning module
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';

// ==============================================
// BASE TYPES AND INTERFACES
// ==============================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  completed_count?: number;
}

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ==============================================
// VOCABULARY TYPES
// ==============================================

export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  definition?: string;
  pronunciation?: string;
  part_of_speech?: string;
  difficulty?: string;
  category?: string;
  language_code: string;
  examples?: Array<{
    sentence: string;
    translation: string;
  }>;
  synonyms?: string[];
  antonyms?: string[];
  mastery: number;
  is_completed: boolean;
  times_reviewed: number;
  created_at: string;
  updated_at: string;

  // Legacy fields for backward compatibility
  user_id?: string;
  language?: string;
  translation_language?: string;
  word_type?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection' | 'pronoun' | 'phrase';
  phonetic?: string;
  example_sentence?: string;
  example_translation?: string;
  audio_url?: string;
  image_url?: string;
  difficulty_level?: number;
  frequency?: number;
  last_reviewed?: string;
  learned?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CreateVocabularyRequest {
  word: string;
  translation: string;
  language_code: string;
  translation_language: string;
  word_type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection' | 'pronoun' | 'phrase';
  phonetic?: string;
  definition?: string;
  example_sentence?: string;
  example_translation?: string;
  audio_url?: string;
  image_url?: string;
  category?: string;
  difficulty_level?: number;
  frequency?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface VocabularyQueryParams extends BaseQueryParams {
  language_code?: string;
  search?: string;
  category?: string;
  difficulty?: string; // 'easy', 'medium', 'hard'
  difficulty_level?: number; // Legacy support
}

// ==============================================
// EXERCISE TYPES
// ==============================================

export interface Exercise {
  id: string;
  user_id: string;
  unit_id?: string;
  lesson_id?: string;
  title: string;
  question: string;
  type: 'multiple_choice' | 'fill_in_blank' | 'translation' | 'listening' | 'speaking' | 'matching' | 'ordering' | 'true_false';
  order_index: number;
  language_code?: string;
  content: Record<string, any>;
  options?: string[] | null;
  correct_answer: Record<string, any>;
  explanation?: string;
  hints?: string[];
  points: number;
  difficulty_level: number;
  audio_url?: string;
  image_url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  navigation?: {
    next_exercise_id?: string;
    previous_exercise_id?: string;
  };
  user_progress: {
    status: 'not_attempted' | 'in_progress' | 'completed';
    is_correct?: boolean | null;
    user_answer?: Record<string, any> | null;
    attempts_count: number;
    points_earned: number;
    completed_at?: string | null;
  };
}

export interface SubmitExerciseRequest {
  user_id: string;
  answer: Record<string, any>;
  time_spent?: number;
}

export interface SubmitExerciseResponse {
  is_correct: boolean;
  points_earned: number;
  explanation?: string;
  correct_answer: Record<string, any>;
  user_answer: Record<string, any>;
  attempts_count: number;
  progress: {
    exercise_completed: boolean;
    unit_progress_percentage: number;
    lesson_progress_percentage: number;
  };
  next_exercise?: {
    id: string;
    title: string;
  };
}

// ==============================================
// PROGRESS TYPES
// ==============================================

export interface UserProgress {
  user_id: string;
  language_code: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  lessons_completed: number;
  exercises_completed: number;
  words_learned: number;
  study_time_minutes: number;
  level: number;
  badges_earned: string[];
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface ComprehensiveUserProgress {
  user_id: string;
  overall_progress: {
    total_lessons: number;
    completed_lessons: number;
    in_progress_lessons: number;
    total_units: number;
    completed_units: number;
    total_exercises: number;
    completed_exercises: number;
    total_points_earned: number;
    total_time_spent: number;
    accuracy_rate: number;
    streak_days: number;
  };
  lessons_progress: {
    lesson_id: string;
    title: string;
    status: string;
    progress_percentage: number;
    completed_at: string | null;
    units_progress: {
      unit_id: string;
      title: string;
      status: string;
      progress_percentage: number;
      exercises_progress: {
        exercise_id: string;
        type: string;
        title: string;
        status: string;
        is_correct: boolean;
        attempts_count: number;
        points_earned: number;
        completed_at: string;
      }[];
    }[];
  }[];
}

export interface LessonProgressResponse {
  lesson_progress: {
    lesson_id: string;
    user_id: string;
    status: string;
    progress_percentage: number;
    started_at?: string;
    total_time_spent: number;
    units_completed: number;
    total_units: number;
    exercises_completed: number;
    total_exercises: number;
    points_earned: number;
    max_possible_points: number;
  };
  units_progress: {
    unit_id: string;
    title: string;
    status: string;
    progress_percentage: number;
    exercises_progress: {
      exercise_id: string;
      type: string;
      title: string;
      status: string;
      is_correct: boolean;
      attempts_count: number;
      points_earned: number;
      completed_at: string;
    }[];
  }[];
}

export interface UnitProgress {
  unit_id: string;
  user_id: string;
  progress_percentage: number;
  exercises_completed: number;
  total_exercises: number;
  lessons_completed: number;
  total_lessons: number;
  xp_earned: number;
  time_spent_minutes: number;
  completed_at?: string;
  last_accessed: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressSyncRequest {
  activities: {
    type: 'lesson_started' | 'lesson_completed' | 'exercise_completed' | 'vocabulary_learned';
    lesson_id?: string;
    unit_id?: string;
    exercise_id?: string;
    vocabulary_id?: string;
    xp_earned: number;
    time_spent_minutes: number;
    timestamp: string;
  }[];
}

// ==============================================
// ACHIEVEMENTS TYPES
// ==============================================

export interface Achievement {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  description: string;
  icon_url?: string;
  criteria: Record<string, any>;
  progress: number;
  target: number;
  unlocked: boolean;
  unlocked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SimpleAchievement {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  points: number;
  unlocked: boolean;
  progress?: number;
  current?: number;
  target?: number;
  unlocked_at?: string;
}

// ==============================================
// ANALYTICS TYPES
// ==============================================

export interface UserAnalytics {
  user_id: string;
  language_code: string;
  daily_streak: number;
  weekly_xp: number[];
  monthly_xp: number;
  accuracy_rate: number;
  study_consistency: number;
  favorite_study_time: string;
  total_study_sessions: number;
  average_session_length: number;
  words_per_day: number;
  improvement_rate: number;
  weakest_skills: string[];
  strongest_skills: string[];
  upcoming_goals: {
    type: string;
    target: number;
    current: number;
    deadline: string;
  }[];
}

export interface LearningAnalytics {
  period: string;
  study_time: {
    total_minutes: number;
    average_per_day: number;
    daily_breakdown: {
      date: string;
      xp: number;
      exercises_completed: number;
      minutes?: number;
    }[];
  };
  performance: {
    accuracy_rate: number;
    improvement_rate: number;
    strongest_skills: string[];
    areas_for_improvement: string[];
  };
  progress_trends: {
    exercises_per_day: number;
    units_completed: number;
    lessons_completed: number;
    points_per_day: number;
  };
}

// ==============================================
// UNIT START/COMPLETE TYPES
// ==============================================

export interface UnitStartRequest {
  language_code: string;
  difficulty_level?: string;
  estimated_duration?: number;
}

export interface UnitStartResponse {
  session_id: string;
  unit_id: string;
  started_at: string;
  estimated_completion_time: string;
}

export interface UnitCompleteRequest {
  session_id: string;
  xp_earned: number;
  exercises_completed: number;
  accuracy_rate: number;
  time_spent_minutes: number;
}

export interface UnitCompleteResponse {
  unit_id: string;
  completed_at: string;
  total_xp_earned: number;
  performance_rating: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  achievements_unlocked: Achievement[];
  next_recommended_unit?: {
    id: string;
    title: string;
    difficulty: string;
  };
}

export interface AnswerOption {
  text: string;
  is_correct: boolean;
  audio_url?: string;
}

export interface CreateExerciseRequest {
  lesson_id?: string;
  question: string;
  type: 'multiple_choice' | 'fill_in_blank' | 'translation' | 'listening' | 'speaking' | 'matching' | 'ordering' | 'true_false';
  language_code: string;
  answers: AnswerOption[];
  explanation?: string;
  hints?: string[];
  points?: number;
  audio_url?: string;
  image_url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ExerciseQueryParams extends BaseQueryParams {
  language_code?: string;
  type?: string;
  lesson_id?: string;
  unit_id?: string;
  user_id?: string;
  difficulty_level?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  include_answers?: boolean;
  search?: string;
}

export interface UnitExercisesResponse {
  data: Exercise[];
  total: number;
  unit_info: {
    id: string;
    title: string;
    total_exercises: number;
  };
  user_unit_progress: {
    completed_exercises: number;
    total_points: number;
    max_possible_points: number;
  };
}

// ==============================================
// STORY TYPES
// ==============================================

export interface Story {
  id: string;
  user_id: string;
  title: string;
  author: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language_code: string;
  category: 'fiction' | 'non_fiction' | 'news' | 'daily_life' | 'culture' | 'history' | 'science' | 'business' | 'travel' | 'education';
  estimated_time: number;
  words_count: number;
  difficulty: number;
  thumbnail?: string;
  preview?: string;
  content: StoryContent[];
  vocabulary?: StoryVocabulary[];
  is_completed: boolean;
  completion_rate: number;
  rating?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StoryContent {
  type: 'text' | 'dialogue' | 'question' | 'vocabulary_highlight';
  text: string;
  translation?: string;
  audio_url?: string;
  metadata?: Record<string, any>;
}

export interface StoryVocabulary {
  word: string;
  translation: string;
  definition?: string;
  audio_url?: string;
}

export interface CreateStoryRequest {
  title: string;
  author: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language_code: string;
  category: 'fiction' | 'non_fiction' | 'news' | 'daily_life' | 'culture' | 'history' | 'science' | 'business' | 'travel' | 'education';
  estimated_time: number;
  words_count: number;
  difficulty: number;
  thumbnail?: string;
  preview?: string;
  content: StoryContent[];
  vocabulary?: StoryVocabulary[];
  rating?: number;
  metadata?: Record<string, any>;
}

export interface StoryQueryParams extends BaseQueryParams {
  language_code?: string;
  level?: string;
  category?: string;
  difficulty?: number;
  search?: string;
  is_completed?: boolean;
  min_rating?: number;
  max_time?: number;
}

// ==============================================
// STUDY SESSION TYPES
// ==============================================

export interface StudySession {
  id: string;
  user_id: string;
  session_type: 'lesson' | 'vocabulary' | 'story' | 'practice' | 'review' | 'exam';
  language_code: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  exercises_completed: number;
  accuracy_rate?: number;
  xp_earned: number;
  hearts_lost: number;
  session_data?: Record<string, any>;
  created_at: string;
}

export interface CreateStudySessionRequest {
  session_type: 'lesson' | 'vocabulary' | 'story' | 'practice' | 'review' | 'exam';
  language_code: string;
  start_time?: string;
  session_data?: Record<string, any>;
}

export interface UpdateStudySessionRequest {
  end_time?: string;
  duration_minutes?: number;
  exercises_completed?: number;
  accuracy_rate?: number;
  xp_earned?: number;
  hearts_lost?: number;
  session_data?: Record<string, any>;
}

export interface StudySessionQueryParams extends BaseQueryParams {
  language_code?: string;
  session_type?: string;
  start_date?: string;
  end_date?: string;
}

// ==============================================
// PROGRESS TYPES
// ==============================================

export interface Progress {
  id: string;
  user_id: string;
  activity_type: string;
  language_code: string;
  lesson_id?: string;
  exercise_id?: string;
  vocabulary_id?: string;
  story_id?: string;
  points_earned: number;
  accuracy?: number;
  time_spent?: number;
  completed: boolean;
  mistakes?: string[];
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UpdateProgressRequest {
  activity_type: 'lesson_completed' | 'exercise_completed' | 'vocabulary_learned' | 'story_completed' | 'study_session_completed' | 'streak_maintained' | 'achievement_unlocked';
  language_code: string;
  lesson_id?: string;
  exercise_id?: string;
  vocabulary_id?: string;
  story_id?: string;
  points_earned?: number;
  accuracy?: number;
  time_spent?: number;
  completed?: boolean;
  mistakes?: string[];
  metadata?: Record<string, any>;
}

export interface ProgressQueryParams extends BaseQueryParams {
  language_code?: string;
  start_date?: string;
  end_date?: string;
  activity_types?: string[];
}

// ==============================================
// LETTERS TYPES
// ==============================================

export interface Letter {
  id: string;
  language: string;
  languageCode: string;
  letter: string;
  type: 'vowel' | 'consonant';
  pronunciation: string | null;
  examples: string[] | null;
  audioUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LettersResponse {
  letters: Letter[];
  totalCount: number;
}

export interface LettersQueryParams {
  languageCode: string;
  type?: 'vowel' | 'consonant';
}

// ==============================================
// PHONEMES TYPES
// ==============================================

export interface Phoneme {
  id: string;
  symbol: string;
  ipa: string;
  description: string;
  examples: string[];
  audioUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'vowel' | 'consonant';
  position: string;
  manner: string;
}

export interface PhonemesResponse {
  phonemes: Phoneme[];
  totalCount: number;
}

export interface PhonemesQueryParams {
  languageCode: string;
  category?: 'vowel' | 'consonant';
}

// ==============================================
// MINIMAL PAIRS TYPES
// ==============================================

export interface MinimalPair {
  id: string;
  pair: string[];
  phoneme: string;
  description: string;
}

export interface MinimalPairsResponse {
  minimalPairs: MinimalPair[];
}

export interface MinimalPairsQueryParams {
  languageCode: string;
}

// ==============================================
// TEXT-TO-SPEECH (TTS) TYPES
// ==============================================

export type TTSVoice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer';
export type TTSFormat = 'mp3' | 'opus' | 'aac' | 'flac';

export interface TTSRequest {
  text: string;
  language: string;
  voice?: TTSVoice;
  format?: TTSFormat;
  speed?: number;
  instructions?: string;
}

export interface TTSResponse {
  audioUrl: string;
  duration?: number;
  jobId?: string;
  status?: string;
}

export interface TTSJobStatusResponse {
  success: boolean;
  status: string;
  audioUrl?: string;
  error?: string;
}

export interface TTSVoiceInfo {
  id: string;
  name: string;
  gender?: string;
}

export interface AvailableVoicesResponse {
  voices: TTSVoiceInfo[];
}

// ==============================================
// PRONUNCIATION ANALYSIS TYPES
// ==============================================

export interface PronunciationAnalysisResult {
  success: boolean;
  score: number;
  transcription?: string;
  expected_text: string;
  feedback: string;
  overall_feedback?: string;
  phoneme_id?: string;
  phoneme_feedback?: {
    phoneme_id: string;
    accuracy: number;
    suggestions: string[];
  };
}

// ==============================================
// LEADERBOARD TYPES
// ==============================================

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  language_code: string;
  total_xp: number;
  weekly_xp: number;
  monthly_xp: number;
  current_streak: number;
  best_streak: number;
  lessons_completed: number;
  achievements_count: number;
  rank_position?: number;
  last_active: string;
  created_at: string;
  updated_at: string;
  rank?: number;
}

export interface SimpleLeaderboardEntry {
  user_id: string;
  username: string;
  total_points: number;
  current_streak: number;
  rank: number;
  profile_image?: string | null;
  language_code?: string;
  lessons_completed?: number;
  achievements_count?: number;
}

export interface LeaderboardQueryParams extends BaseQueryParams {
  language_code?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

// ==============================================
// LANGUAGE API SERVICE CLASS
// ==============================================

class LanguageApiService {
  
  // ==============================================
  // VOCABULARY ENDPOINTS
  // ==============================================

  async getVocabulary(params?: VocabularyQueryParams): Promise<PaginatedResponse<VocabularyWord>> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const response = await api.request(`/language/vocabulary-list${queryString ? `?${queryString}` : ''}`);
      return this.formatPaginatedResponse(response);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VOCABULARY_FETCH_FAILED'
      );
    }
  }

  async getVocabularyCategories(languageCode?: string): Promise<{ categories: string[] }> {
    try {
      const queryString = languageCode ? `?language_code=${languageCode}` : '';
      return await api.request(`/language/vocabulary/categories${queryString}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CATEGORIES_FETCH_FAILED'
      );
    }
  }

  async getVocabularyById(id: string): Promise<VocabularyWord> {
    try {
      return await api.request(`/language/vocabulary/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VOCABULARY_FETCH_FAILED'
      );
    }
  }

  async createVocabulary(vocabularyData: CreateVocabularyRequest): Promise<VocabularyWord> {
    try {
      return await api.request('/language/vocabulary', {
        method: 'POST',
        body: JSON.stringify(vocabularyData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VOCABULARY_CREATE_FAILED'
      );
    }
  }

  async updateVocabulary(id: string, vocabularyData: Partial<CreateVocabularyRequest>): Promise<VocabularyWord> {
    try {
      return await api.request(`/language/vocabulary/${id}`, {
        method: 'PUT',
        body: JSON.stringify(vocabularyData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VOCABULARY_UPDATE_FAILED'
      );
    }
  }

  async deleteVocabulary(id: string): Promise<void> {
    try {
      await api.request(`/language/vocabulary/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VOCABULARY_DELETE_FAILED'
      );
    }
  }

  async completeVocabulary(id: string, isCompleted: boolean): Promise<VocabularyWord> {
    try {
      return await api.request(`/language/vocabulary/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ is_completed: isCompleted }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VOCABULARY_COMPLETE_FAILED'
      );
    }
  }

  // ==============================================
  // EXERCISE ENDPOINTS
  // ==============================================

  async getExercises(params?: ExerciseQueryParams): Promise<any> {
    try {
      // Filter out undefined values to avoid sending them to the API
      const cleanParams: Record<string, any> = {};
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleanParams[key] = value;
          }
        });
      }
      
      const queryString = Object.keys(cleanParams).length > 0 ? new URLSearchParams(cleanParams as any).toString() : '';
      console.log('getExercises clean params:', cleanParams, 'queryString:', queryString); // Debug logging
      
      const response = await api.request(`/language/exercises${queryString ? `?${queryString}` : ''}`);
      console.log('getExercises API Response:', response); // Debug logging
      return response; // Return response directly to preserve user_unit_progress
    } catch (error) {
      console.error('getExercises API Error:', error); // Debug logging
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXERCISES_FETCH_FAILED'
      );
    }
  }

  async createExercise(exerciseData: CreateExerciseRequest): Promise<Exercise> {
    try {
      return await api.request('/language/exercises', {
        method: 'POST',
        body: JSON.stringify(exerciseData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXERCISE_CREATE_FAILED'
      );
    }
  }

  async getUnitExercises(unitId: string, params?: Omit<ExerciseQueryParams, 'unit_id'>): Promise<UnitExercisesResponse> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const response = await api.request(`/language/units/${unitId}/exercises${queryString ? `?${queryString}` : ''}`);

      return {
        data: response.data || [],
        total: response.total || 0,
        unit_info: response.unit_info || { id: unitId, title: '', total_exercises: 0 },
        user_unit_progress: response.user_unit_progress || { completed_exercises: 0, total_points: 0, max_possible_points: 0 }
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'UNIT_EXERCISES_FETCH_FAILED'
      );
    }
  }

  async getLessonUnits(lessonId: string, params?: { user_id?: string; include_locked?: boolean; include_exercises?: boolean; sort_by?: string; sort_order?: string }): Promise<any> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const response = await api.request(`/language/lessons/${lessonId}/units${queryString ? `?${queryString}` : ''}`);

      return {
        data: response.data || [],
        total: response.total || 0,
        lesson_info: response.lesson_info || { id: lessonId, title: '', total_units: 0 }
      };
    } catch (error) {
      console.error('Failed to fetch lesson units:', error);
      throw new ApiErrorResponse(
        `Failed to fetch units for lesson ${lessonId}`,
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LESSON_UNITS_FETCH_FAILED'
      );
    }
  }

  async getExerciseById(exerciseId: string, params?: Omit<ExerciseQueryParams, 'exercise_id'>): Promise<Exercise> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const response = await api.request(`/language/exercises/${exerciseId}${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXERCISE_FETCH_FAILED'
      );
    }
  }

  async submitExercise(exerciseId: string, submissionData: SubmitExerciseRequest): Promise<SubmitExerciseResponse> {
    try {
      const response = await api.request(`/language/exercises/${exerciseId}/submit`, {
        method: 'POST',
        body: JSON.stringify(submissionData),
      });
      return response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXERCISE_SUBMIT_FAILED'
      );
    }
  }

  // ==============================================
  // PROGRESS ENDPOINTS
  // ==============================================

  async getUserProgress(userId: string): Promise<UserProgress> {
    try {
      return await api.request(`/language/users/${userId}/progress`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_PROGRESS_FETCH_FAILED'
      );
    }
  }

  async getComprehensiveUserProgress(
    userId: string,
    params?: {
      lesson_id?: string;
      include_details?: boolean;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<ComprehensiveUserProgress> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      return await api.request(`/language/users/${userId}/progress${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'COMPREHENSIVE_USER_PROGRESS_FETCH_FAILED'
      );
    }
  }

  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgressResponse> {
    try {
      return await api.request(`/language/users/${userId}/lessons/${lessonId}/progress`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LESSON_PROGRESS_FETCH_FAILED'
      );
    }
  }

  async getUnitProgress(userId: string, unitId: string): Promise<UnitProgress> {
    try {
      return await api.request(`/language/users/${userId}/units/${unitId}/progress`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'UNIT_PROGRESS_FETCH_FAILED'
      );
    }
  }

  async syncProgress(userId: string, syncData: ProgressSyncRequest): Promise<{ success: boolean; synced_activities: number }> {
    try {
      return await api.request(`/language/users/${userId}/progress/sync`, {
        method: 'POST',
        body: JSON.stringify(syncData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRESS_SYNC_FAILED'
      );
    }
  }

  // ==============================================
  // ACHIEVEMENTS ENDPOINTS
  // ==============================================

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      return await api.request(`/language/users/${userId}/achievements`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ACHIEVEMENTS_FETCH_FAILED'
      );
    }
  }

  async getAchievements(params?: {
    language_code?: string;
  }): Promise<SimpleAchievement[]> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const response = await api.request(`/language/achievements${queryString ? `?${queryString}` : ''}`);
      return response; // This endpoint returns an array directly
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ACHIEVEMENTS_FETCH_FAILED'
      );
    }
  }

  // ==============================================
  // ANALYTICS ENDPOINTS
  // ==============================================

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      return await api.request(`/language/users/${userId}/analytics`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ANALYTICS_FETCH_FAILED'
      );
    }
  }

  async getLearningAnalytics(
    userId: string,
    params?: {
      period?: string;
      lesson_id?: string;
    }
  ): Promise<LearningAnalytics> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      return await api.request(`/language/users/${userId}/analytics${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LEARNING_ANALYTICS_FETCH_FAILED'
      );
    }
  }

  // ==============================================
  // UNIT START/COMPLETE ENDPOINTS
  // ==============================================

  async startUnit(userId: string, unitId: string, startData: UnitStartRequest): Promise<UnitStartResponse> {
    try {
      return await api.request(`/language/users/${userId}/units/${unitId}/start`, {
        method: 'POST',
        body: JSON.stringify(startData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'UNIT_START_FAILED'
      );
    }
  }

  async completeUnit(userId: string, unitId: string, completeData: UnitCompleteRequest): Promise<UnitCompleteResponse> {
    try {
      return await api.request(`/language/users/${userId}/units/${unitId}/complete`, {
        method: 'POST',
        body: JSON.stringify(completeData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'UNIT_COMPLETE_FAILED'
      );
    }
  }

  // ==============================================
  // STORY ENDPOINTS
  // ==============================================

  async getStories(params?: StoryQueryParams): Promise<PaginatedResponse<Story>> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const response = await api.request(`/language/stories${queryString ? `?${queryString}` : ''}`);
      return this.formatPaginatedResponse(response);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'STORIES_FETCH_FAILED'
      );
    }
  }

  async getStoryById(id: string): Promise<Story> {
    try {
      return await api.request(`/language/stories/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'STORY_FETCH_FAILED'
      );
    }
  }

  async createStory(storyData: CreateStoryRequest): Promise<Story> {
    try {
      return await api.request('/language/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'STORY_CREATE_FAILED'
      );
    }
  }

  async updateStory(id: string, storyData: Partial<CreateStoryRequest>): Promise<Story> {
    try {
      return await api.request(`/language/stories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(storyData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'STORY_UPDATE_FAILED'
      );
    }
  }

  async deleteStory(id: string): Promise<void> {
    try {
      await api.request(`/language/stories/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'STORY_DELETE_FAILED'
      );
    }
  }

  async completeStory(id: string, completionRate?: number): Promise<Story> {
    try {
      return await api.request(`/language/stories/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ completion_rate: completionRate }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'STORY_COMPLETE_FAILED'
      );
    }
  }

  // ==============================================
  // STUDY SESSION ENDPOINTS
  // ==============================================

  async startStudySession(sessionData: CreateStudySessionRequest): Promise<StudySession> {
    try {
      return await api.request('/language/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SESSION_START_FAILED'
      );
    }
  }

  async updateStudySession(id: string, sessionData: UpdateStudySessionRequest): Promise<StudySession> {
    try {
      return await api.request(`/language/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SESSION_UPDATE_FAILED'
      );
    }
  }

  async completeStudySession(id: string, sessionData: UpdateStudySessionRequest): Promise<StudySession> {
    try {
      return await api.request(`/language/sessions/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SESSION_COMPLETE_FAILED'
      );
    }
  }

  async getStudySessions(params?: StudySessionQueryParams): Promise<PaginatedResponse<StudySession>> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const response = await api.request(`/language/sessions${queryString ? `?${queryString}` : ''}`);
      return this.formatPaginatedResponse(response);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SESSIONS_FETCH_FAILED'
      );
    }
  }

  // ==============================================
  // PROGRESS ENDPOINTS
  // ==============================================

  async updateProgress(progressData: UpdateProgressRequest): Promise<Progress> {
    try {
      return await api.request('/language/progress', {
        method: 'POST',
        body: JSON.stringify(progressData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRESS_UPDATE_FAILED'
      );
    }
  }

  async getProgress(params?: ProgressQueryParams): Promise<PaginatedResponse<Progress>> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const response = await api.request(`/language/progress${queryString ? `?${queryString}` : ''}`);
      return this.formatPaginatedResponse(response);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRESS_FETCH_FAILED'
      );
    }
  }

  // ==============================================
  // LETTERS ENDPOINTS
  // ==============================================

  async getLetters(params: LettersQueryParams): Promise<LettersResponse> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const response = await api.request(`/language-learner/letters?${queryString}`);
      return {
        letters: response.data?.letters || [],
        totalCount: response.data?.totalCount || 0
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LETTERS_FETCH_FAILED'
      );
    }
  }

  // ==============================================
  // PHONEMES ENDPOINTS
  // ==============================================

  async getPhonemes(params: PhonemesQueryParams): Promise<PhonemesResponse> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const response = await api.request(`/language-learner/phonemes?${queryString}`);
      return {
        phonemes: response.data?.phonemes || [],
        totalCount: response.data?.totalCount || 0
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PHONEMES_FETCH_FAILED'
      );
    }
  }

  // ==============================================
  // MINIMAL PAIRS ENDPOINTS
  // ==============================================

  async getMinimalPairs(params: MinimalPairsQueryParams): Promise<MinimalPairsResponse> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const response = await api.request(`/language-learner/minimal-pairs?${queryString}`);
      return {
        minimalPairs: response.data?.minimalPairs || []
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MINIMAL_PAIRS_FETCH_FAILED'
      );
    }
  }

  // ==============================================
  // LEADERBOARD ENDPOINTS
  // ==============================================

  async getGlobalLeaderboard(params?: LeaderboardQueryParams): Promise<PaginatedResponse<LeaderboardEntry>> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const response = await api.request(`/language/leaderboard/global${queryString ? `?${queryString}` : ''}`);
      return this.formatPaginatedResponse(response);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LEADERBOARD_FETCH_FAILED'
      );
    }
  }

  async getLeaderboard(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    language_code?: string;
    period?: 'weekly' | 'monthly' | 'all-time';
  }): Promise<SimpleLeaderboardEntry[]> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const response = await api.request(`/language/leaderboard${queryString ? `?${queryString}` : ''}`);
      return response; // This endpoint returns an array directly
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LEADERBOARD_FETCH_FAILED'
      );
    }
  }

  async getUserLeaderboardPosition(languageCode?: string): Promise<LeaderboardEntry> {
    try {
      const queryString = languageCode ? `?language_code=${languageCode}` : '';
      return await api.request(`/language/leaderboard/user${queryString}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_POSITION_FETCH_FAILED'
      );
    }
  }

  // ==============================================
  // TEXT-TO-SPEECH (TTS) ENDPOINTS
  // ==============================================

  /**
   * Convert text to speech using AI TTS
   * @param request TTS request with text, language, and optional voice/format settings
   * @returns TTS response with audio URL or job ID for async processing
   */
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    try {
      const response = await api.request('/language-learner/tts', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return response.data || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TTS_FAILED'
      );
    }
  }

  /**
   * Check TTS job status for async processing
   * @param jobId The job ID to check
   * @returns Job status with audio URL when complete
   */
  async getTTSJobStatus(jobId: string): Promise<TTSJobStatusResponse> {
    try {
      const response = await api.request(`/language-learner/tts/status/${jobId}`);
      return response.data || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TTS_STATUS_FAILED'
      );
    }
  }

  /**
   * Get available TTS voices
   * @returns List of available voices
   */
  async getAvailableVoices(): Promise<AvailableVoicesResponse> {
    try {
      const response = await api.request('/language-learner/tts/voices');
      return response.data || response;
    } catch (error) {
      // Return default voices on error
      return {
        voices: [
          { id: 'alloy', name: 'Alloy', gender: 'neutral' },
          { id: 'ash', name: 'Ash', gender: 'neutral' },
          { id: 'coral', name: 'Coral', gender: 'neutral' },
          { id: 'echo', name: 'Echo', gender: 'male' },
          { id: 'nova', name: 'Nova', gender: 'female' },
          { id: 'onyx', name: 'Onyx', gender: 'male' },
          { id: 'shimmer', name: 'Shimmer', gender: 'female' },
        ],
      };
    }
  }

  /**
   * Helper function to play TTS audio with fallback to browser Speech Synthesis
   * @param text Text to speak
   * @param language Language code (e.g., 'spanish', 'english')
   * @param options Optional TTS settings
   * @returns Promise that resolves when audio starts playing
   */
  async playTTS(
    text: string,
    language: string,
    options?: { voice?: TTSVoice; speed?: number }
  ): Promise<{ audioUrl?: string; usedFallback: boolean }> {
    try {
      // Try API TTS first
      const response = await this.textToSpeech({
        text,
        language,
        voice: options?.voice,
        speed: options?.speed,
      });

      // If we got a direct audio URL, return it
      if (response.audioUrl) {
        return { audioUrl: response.audioUrl, usedFallback: false };
      }

      // If async job, poll for completion
      if (response.jobId) {
        const maxAttempts = 30;
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const status = await this.getTTSJobStatus(response.jobId!);
          if (status.audioUrl) {
            return { audioUrl: status.audioUrl, usedFallback: false };
          }
          if (status.status === 'failed') {
            throw new Error(status.error || 'TTS job failed');
          }
        }
        throw new Error('TTS job timed out');
      }

      throw new Error('No audio URL received');
    } catch (error) {
      console.warn('API TTS failed, using fallback:', error);
      return { usedFallback: true };
    }
  }

  // ==============================================
  // PRONUNCIATION ANALYSIS ENDPOINTS
  // ==============================================

  /**
   * Analyze pronunciation from audio recording
   * @param audioBlob Recorded audio blob
   * @param expectedText Text the user was supposed to pronounce
   * @param language Language code (e.g., 'spanish', 'english')
   * @param phonemeId Optional phoneme ID being practiced
   * @returns Pronunciation analysis result with score and feedback
   */
  async analyzePronunciation(
    audioBlob: Blob,
    expectedText: string,
    language: string,
    phonemeId?: string
  ): Promise<PronunciationAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('expectedText', expectedText);
      formData.append('language', language);
      if (phonemeId) {
        formData.append('phonemeId', phonemeId);
      }

      // Use centralized API client - it handles FormData correctly without setting Content-Type
      const result = await api.request('/language-learner/pronunciation/analyze', {
        method: 'POST',
        body: formData,
      });

      return result.data || result;
    } catch (error) {
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PRONUNCIATION_ANALYSIS_FAILED'
      );
    }
  }

  // ==============================================
  // UTILITY METHODS
  // ==============================================

  private formatPaginatedResponse<T>(response: any): PaginatedResponse<T> {
    if (response?.data) {
      return {
        data: response.data,
        total: response.total || response.data.length,
        page: response.page || 1,
        limit: response.limit || 20,
        total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.limit || 20)),
        completed_count: response.completed_count
      };
    }

    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        page: 1,
        limit: response.length,
        total_pages: 1
      };
    }

    return {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      total_pages: 0
    };
  }
}

export const languageApiService = new LanguageApiService();