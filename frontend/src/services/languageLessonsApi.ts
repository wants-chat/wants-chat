/**
 * Language Lessons API Service Layer
 * Implements API endpoints for language learning lessons
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';

// Lesson interfaces
export interface Lesson {
  id: string;
  user_id: string;
  title: string;
  description: string;
  language_code: string;
  source_language: string;
  skill: 'speaking' | 'listening' | 'reading' | 'writing';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  content: ContentItem[];
  tags: string[];
  is_published: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  type: 'text' | 'audio' | 'image' | 'exercise';
  data: Record<string, any>;
  order: number;
}

export interface CreateLessonRequest {
  title: string;
  description: string;
  language_code: string;
  source_language: string;
  skill: 'speaking' | 'listening' | 'reading' | 'writing';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  content: ContentItem[];
  tags: string[];
  is_published: boolean;
  metadata: Record<string, any>;
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {}

// API Response types
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
}

export interface QueryParams {
  page?: number;
  limit?: number;
  language_code?: string;
  skill?: string;
  difficulty?: string;
  search?: string;
  tags?: string;
}

class LanguageLessonsApiService {
  /**
   * Get all lessons with optional filtering
   */
  async getLessons(params?: QueryParams): Promise<PaginatedResponse<Lesson>> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const response = await api.request(`/language/lessons${queryString ? `?${queryString}` : ''}`);
      
      // Handle different response formats
      if (response?.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.limit || 20))
        };
      }
      
      // Fallback for array response
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
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LESSONS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(id: string): Promise<Lesson> {
    try {
      const result = await api.request(`/language/lessons/${id}`);
      return result;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LESSON_FETCH_FAILED'
      );
    }
  }

  /**
   * Create new lesson
   */
  async createLesson(lessonData: CreateLessonRequest): Promise<Lesson> {
    try {
      return await api.request('/language/lessons', {
        method: 'POST',
        body: JSON.stringify(lessonData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LESSON_CREATE_FAILED'
      );
    }
  }

  /**
   * Update existing lesson
   */
  async updateLesson(id: string, lessonData: UpdateLessonRequest): Promise<Lesson> {
    try {
      return await api.request(`/language/lessons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(lessonData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LESSON_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete lesson
   */
  async deleteLesson(id: string): Promise<void> {
    try {
      await api.request(`/language/lessons/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'LESSON_DELETE_FAILED'
      );
    }
  }

  /**
   * Get lessons by language
   */
  async getLessonsByLanguage(languageCode: string, params?: Omit<QueryParams, 'language_code'>): Promise<PaginatedResponse<Lesson>> {
    return this.getLessons({ ...params, language_code: languageCode });
  }

  /**
   * Get lessons by skill type
   */
  async getLessonsBySkill(skill: string, params?: Omit<QueryParams, 'skill'>): Promise<PaginatedResponse<Lesson>> {
    return this.getLessons({ ...params, skill });
  }

  /**
   * Get lessons by difficulty
   */
  async getLessonsByDifficulty(difficulty: string, params?: Omit<QueryParams, 'difficulty'>): Promise<PaginatedResponse<Lesson>> {
    return this.getLessons({ ...params, difficulty });
  }
}

// Transform onboarding data to lesson creation request
export const transformOnboardingToLesson = (onboardingData: any): CreateLessonRequest => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'nl', name: 'Dutch' }
  ];

  const targetLanguage = languages.find(l => l.code === onboardingData.targetLanguage);
  const primarySkill = mapLearningStylesToSkill(onboardingData.learningStyles);

  return {
    title: `Introduction to ${targetLanguage?.name || 'Language'} - ${onboardingData.proficiencyLevel} Level`,
    description: `Learn ${targetLanguage?.name || 'your target language'} basics focused on ${onboardingData.purpose} goals`,
    language_code: onboardingData.targetLanguage,
    source_language: onboardingData.nativeLanguage,
    skill: primarySkill,
    difficulty: mapProficiencyToDifficulty(onboardingData.proficiencyLevel),
    duration_minutes: onboardingData.dailyGoal,
    content: generateInitialLessonContent(onboardingData),
    tags: [
      onboardingData.purpose,
      onboardingData.proficiencyLevel,
      ...onboardingData.learningStyles,
      'onboarding',
      'starter'
    ],
    is_published: true,
    metadata: {
      generated_from_onboarding: true,
      onboarding_preferences: onboardingData,
      created_at: new Date().toISOString()
    }
  };
};

// Helper functions
function mapLearningStylesToSkill(styles: string[]): 'speaking' | 'listening' | 'reading' | 'writing' {
  // Priority order based on effectiveness
  if (styles.includes('audio')) return 'speaking';
  if (styles.includes('interactive')) return 'speaking';  
  if (styles.includes('visual')) return 'reading';
  if (styles.includes('writing')) return 'writing';
  if (styles.includes('reading')) return 'reading';
  return 'speaking'; // Default
}

function mapProficiencyToDifficulty(proficiency: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (proficiency) {
    case 'beginner':
    case 'some-phrases':
      return 'beginner';
    case 'intermediate':
      return 'intermediate';
    case 'advanced':
      return 'advanced';
    default:
      return 'beginner';
  }
}

function generateInitialLessonContent(onboardingData: any): ContentItem[] {
  const languages = {
    'es': 'Spanish',
    'fr': 'French', 
    'de': 'German',
    'it': 'Italian',
    'ja': 'Japanese',
    'pt': 'Portuguese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch'
  };

  const targetLanguageName = languages[onboardingData.targetLanguage as keyof typeof languages] || 'Language';

  return [
    {
      type: 'text',
      data: {
        text: `Welcome to your first ${targetLanguageName} lesson!`,
        translation: `¡Bienvenido a tu primera lección de ${targetLanguageName}!`,
        notes: `This lesson is customized for your ${onboardingData.purpose} goals and ${onboardingData.proficiencyLevel} level.`
      },
      order: 1
    }
  ];
}

export const languageLessonsApiService = new LanguageLessonsApiService();