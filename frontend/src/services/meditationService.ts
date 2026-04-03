/**
 * Meditation Service
 * Handles all meditation and mental health related API calls
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';

export interface MeditationSession {
  id: string;
  userId: string;
  type: 'guided' | 'unguided' | 'breathing' | 'body_scan' | 'loving_kindness' | 'visualization' | 'movement';
  title?: string;
  description?: string;
  duration: number; // in seconds
  actualDuration?: number; // in seconds (completed)
  audioUrl?: string;
  instructions?: string[];
  completed: boolean;
  rating?: number; // 1-5 scale
  notes?: string;
  startedAt: Date;
  completedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface MeditationProgram {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // total program duration in days
  sessionsCount: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  sessions: ProgramSession[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramSession {
  id: string;
  programId: string;
  day: number;
  title: string;
  description?: string;
  type: string;
  duration: number;
  audioUrl?: string;
  instructions?: string[];
  isRequired: boolean;
}

export interface UserProgram {
  id: string;
  userId: string;
  programId: string;
  program: MeditationProgram;
  startDate: Date;
  currentDay: number;
  completedSessions: string[]; // session IDs
  isActive: boolean;
  completedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface MentalHealthLog {
  id: string;
  userId: string;
  date: Date;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  stress: number; // 1-10 scale
  anxiety?: number; // 1-10 scale
  sleep: number; // 1-10 scale
  focus?: number; // 1-10 scale
  gratitude?: string[];
  notes?: string;
  triggers?: string[];
  activities?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MindfulnessReminder {
  id: string;
  userId: string;
  type: 'meditation' | 'breathing' | 'gratitude' | 'mindful_moment' | 'body_check';
  title: string;
  description?: string;
  time: string; // HH:mm format
  days: number[]; // 0-6, Sunday = 0
  isActive: boolean;
  sound?: string;
  vibration?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeditationStats {
  totalSessions: number;
  totalDuration: number; // in seconds
  averageSessionDuration: number;
  currentStreak: number;
  longestStreak: number;
  favoriteTypes: Array<{ type: string; count: number; totalDuration: number }>;
  weeklyProgress: Array<{
    week: string;
    sessions: number;
    duration: number;
    averageMood?: number;
  }>;
  monthlyMoodTrends: Array<{
    month: string;
    averageMood: number;
    averageStress: number;
    averageEnergy: number;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
  }>;
  // Enhanced stats from new API
  level?: number;
  xp?: number;
  nextLevelXp?: number;
  insights?: string[];
  preferredTimeOfDay?: string;
  moodImprovementByType?: { [key: string]: number };
}

export interface MeditationCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sessionCount: number;
}

export interface FeaturedSession {
  duration: number;
  title: string;
  audioUrl: string;
}

export interface FeaturedSubOption {
  id: string;
  name: string;
  description: string;
  sessions: FeaturedSession[];
}

export interface FeaturedCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  subOptions: FeaturedSubOption[];
}

export interface AudioContent {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  durationSeconds: number;
  durationMinutes: number;
  type: string;
  narrator?: string;
  category: string;
  tags: string[];
  language: string;
  isPremium: boolean;
}

export interface AmbientSound {
  id: string;
  name: string;
  fileUrl: string;
  icon: string;
  category: string;
  defaultVolume: number;
}

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  technique: 'box' | '4_7_8' | 'coherent' | 'bellows' | 'alternate_nostril' | 'custom';
  pattern: {
    inhale: number;
    holdAfterInhale?: number;
    exhale: number;
    holdAfterExhale?: number;
    cycles: number;
  };
  duration: number; // in seconds
  instructions: string[];
  benefits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface QueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: string;
  completed?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

class MeditationService {
  /**
   * Get user's meditation sessions
   */
  async getMeditationSessions(params?: QueryParams & {
    startDate?: string;
    endDate?: string;
    sessionType?: string;
    completed?: boolean;
    search?: string;
  }): Promise<{ data: MeditationSession[]; total: number; page: number; limit: number }> {
    try {
      // Map frontend params to backend API params
      const validParams: any = {};
      if (params) {
        // Pagination params
        if (params.page !== undefined) validParams.page = params.page;
        if (params.limit !== undefined) validParams.limit = params.limit;
        
        // Sort order - backend expects 'sort_order' not separate 'sort' and 'order'
        if (params.order !== undefined) {
          validParams.sort_order = params.order; // 'asc' or 'desc'
        }
        
        // Skip date filtering - we'll filter in the frontend to avoid API issues
        // The API seems to have issues with date parameters, so we fetch all and filter client-side
        
        // Session type filtering
        if (params.sessionType) validParams.session_type = params.sessionType;
        
        // Search might map to notes or tags in the backend
        if (params.search) validParams.search = params.search;
      }
      
      const response = await api.getMeditationSessions(validParams);
      // Handle legacy response format (sessions array) and new format (data array)
      if ('sessions' in response && !('data' in response)) {
        return {
          data: response.sessions,
          total: response.total || response.sessions.length,
          page: params?.page || 1,
          limit: params?.limit || 10
        };
      }
      
      // Transform snake_case API response to camelCase TypeScript interface
      const transformedData = (response.data || response).map((session: any) => ({
        id: session.id,
        userId: session.user_id || session.userId,
        type: session.session_type || session.type || 'guided',
        title: session.title || session.notes?.replace(' session', '') || 'Meditation Session',
        description: session.description,
        duration: session.duration_minutes ? session.duration_minutes * 60 : (session.duration || 0),
        actualDuration: session.actual_duration_minutes ? session.actual_duration_minutes * 60 : session.actualDuration,
        audioUrl: session.audio_url || session.audioUrl,
        instructions: session.instructions,
        completed: session.session_status === 'completed' || session.completion_status === 'completed' || session.completed || !!session.completed_at,
        rating: session.completion_rating || session.rating,
        notes: session.notes,
        startedAt: session.started_at || session.startedAt || new Date(),
        completedAt: session.completed_at || session.completedAt,
        createdAt: session.created_at || session.createdAt || new Date().toISOString(),
        updatedAt: session.updated_at || session.updatedAt || new Date().toISOString(),
        // Add mood fields that were missing
        mood_before: session.mood_before,
        mood_after: session.mood_after
      }));
      
      return {
        data: transformedData,
        total: response.total || transformedData.length,
        page: response.page || params?.page || 1,
        limit: response.limit || params?.limit || 10
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_SESSIONS_FETCH_FAILED'
      );
    }
  }


  /**
   * Get meditation session by ID
   */
  async getMeditationSession(id: string): Promise<MeditationSession> {
    try {
      return await api.request(`/meditation/sessions/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_SESSION_FETCH_FAILED'
      );
    }
  }

  /**
   * Create/log a meditation session
   */
  async createMeditationSession(sessionData: Omit<MeditationSession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<MeditationSession> {
    try {
      return await api.createMeditationSession(sessionData);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_SESSION_CREATE_FAILED'
      );
    }
  }

  /**
   * Update meditation session
   */
  async updateMeditationSession(id: string, sessionData: Partial<MeditationSession>): Promise<MeditationSession> {
    try {
      return await api.request(`/meditation/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_SESSION_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete meditation session
   */
  async deleteMeditationSession(id: string): Promise<void> {
    try {
      await api.request(`/meditation/sessions/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_SESSION_DELETE_FAILED'
      );
    }
  }

  /**
   * Get available meditation programs
   */
  async getMeditationPrograms(params?: QueryParams & { category?: string; difficulty?: string }): Promise<{ data: MeditationProgram[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.request(`/meditation/programs${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      // Handle legacy response format (programs array) and new format (data array)
      if ('programs' in response && !('data' in response)) {
        return {
          data: response.programs,
          total: response.total || response.programs.length,
          page: params?.page || 1,
          limit: params?.limit || 10
        };
      }
      return response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_PROGRAMS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get meditation program by ID
   */
  async getMeditationProgram(id: string): Promise<MeditationProgram> {
    try {
      return await api.request(`/meditation/programs/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_PROGRAM_FETCH_FAILED'
      );
    }
  }

  /**
   * Get user's enrolled programs
   */
  async getUserPrograms(params?: QueryParams): Promise<{ data: UserProgram[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.request(`/meditation/user-programs${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      // Handle legacy response format (programs array) and new format (data array)
      if ('programs' in response && !('data' in response)) {
        return {
          data: response.programs,
          total: response.total || response.programs.length,
          page: params?.page || 1,
          limit: params?.limit || 10
        };
      }
      return response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_PROGRAMS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get user's enrolled programs from /meditation/programs/enrolled endpoint
   */
  async getEnrolledPrograms(): Promise<any[]> {
    try {
      const response = await api.request('/meditation/programs/enrolled');
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.programs && Array.isArray(response.programs)) {
        return response.programs;
      }
      return [];
    } catch (error) {
      console.error('Error fetching enrolled programs:', error);
      return [];
    }
  }

  /**
   * Get meditation audio sessions
   */
  async getMeditationAudio(params?: { limit?: number; page?: number }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    try {
      const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      const response = await api.request(`/meditation/audio${queryParams}`);
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        return response;
      } else if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: params?.limit || 10
        };
      }
      return {
        data: [],
        total: 0,
        page: 1,
        limit: params?.limit || 10
      };
    } catch (error) {
      console.error('Error fetching meditation audio:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: params?.limit || 10
      };
    }
  }

  /**
   * Enroll in a meditation program
   */
  async enrollInProgram(programId: string): Promise<UserProgram> {
    try {
      return await api.request('/meditation/user-programs', {
        method: 'POST',
        body: JSON.stringify({ programId }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRAM_ENROLLMENT_FAILED'
      );
    }
  }

  /**
   * Enroll current user in a meditation program using the specific endpoint
   */
  async enrollInMeditationProgram(programId: string): Promise<{ enrollment: any; program: any; message: string }> {
    try {
      return await api.request(`/meditation/programs/${programId}/enroll`, {
        method: 'POST',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRAM_ENROLLMENT_FAILED'
      );
    }
  }

  /**
   * Get detailed information about a specific program session
   */
  async getProgramSessionById(programId: string, sessionId: string): Promise<{
    id: string;
    program_id: string;
    session_number: number;
    title: string;
    description: string;
    duration_minutes: number;
    audio: any;
    is_locked: boolean;
    can_access: boolean;
    instructions: string;
    focus_points: string[];
    user_completed: boolean;
    next_session_id: string | null;
  }> {
    try {
      return await api.request(`/meditation/programs/${programId}/sessions/${sessionId}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRAM_SESSION_DETAIL_FAILED'
      );
    }
  }

  /**
   * Update user program progress
   */
  async updateUserProgram(id: string, progressData: Partial<UserProgram>): Promise<UserProgram> {
    try {
      return await api.request(`/meditation/user-programs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(progressData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'USER_PROGRAM_UPDATE_FAILED'
      );
    }
  }

  /**
   * Complete a program session
   */
  async completeSessionInProgram(userProgramId: string, sessionId: string, sessionData: Partial<MeditationSession>): Promise<{ userProgram: UserProgram; session: MeditationSession }> {
    try {
      return await api.request(`/meditation/user-programs/${userProgramId}/sessions/${sessionId}/complete`, {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRAM_SESSION_COMPLETE_FAILED'
      );
    }
  }

  /**
   * Get mental health logs
   */
  async getMentalHealthLogs(params?: QueryParams): Promise<{ data: MentalHealthLog[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.getMentalHealthLogs(params);
      // Handle legacy response format (logs array) and new format (data array)
      if ('logs' in response && !('data' in response)) {
        return {
          data: response.logs,
          total: response.total || response.logs.length,
          page: params?.page || 1,
          limit: params?.limit || 10
        };
      }
      return response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MENTAL_HEALTH_LOGS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create mental health log entry
   */
  async createMentalHealthLog(logData: Omit<MentalHealthLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<MentalHealthLog> {
    try {
      return await api.createMentalHealthLog(logData);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MENTAL_HEALTH_LOG_CREATE_FAILED'
      );
    }
  }

  /**
   * Update mental health log
   */
  async updateMentalHealthLog(id: string, logData: Partial<MentalHealthLog>): Promise<MentalHealthLog> {
    try {
      return await api.request(`/meditation/mental-health-logs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(logData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MENTAL_HEALTH_LOG_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete mental health log
   */
  async deleteMentalHealthLog(id: string): Promise<void> {
    try {
      await api.request(`/meditation/mental-health-logs/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MENTAL_HEALTH_LOG_DELETE_FAILED'
      );
    }
  }

  /**
   * Get mindfulness reminders
   */
  async getMindfulnessReminders(): Promise<MindfulnessReminder[]> {
    try {
      const response = await api.request('/meditation/reminders');
      return response.reminders || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MINDFULNESS_REMINDERS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create mindfulness reminder
   */
  async createMindfulnessReminder(reminderData: Omit<MindfulnessReminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<MindfulnessReminder> {
    try {
      return await api.request('/meditation/reminders', {
        method: 'POST',
        body: JSON.stringify(reminderData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MINDFULNESS_REMINDER_CREATE_FAILED'
      );
    }
  }

  /**
   * Update mindfulness reminder
   */
  async updateMindfulnessReminder(id: string, reminderData: Partial<MindfulnessReminder>): Promise<MindfulnessReminder> {
    try {
      return await api.request(`/meditation/reminders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reminderData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MINDFULNESS_REMINDER_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete mindfulness reminder
   */
  async deleteMindfulnessReminder(id: string): Promise<void> {
    try {
      await api.request(`/meditation/reminders/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MINDFULNESS_REMINDER_DELETE_FAILED'
      );
    }
  }


  /**
   * Get breathing exercises
   */
  async getBreathingExercises(): Promise<BreathingExercise[]> {
    try {
      const response = await api.request('/meditation/breathing-exercises');
      return response.exercises || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BREATHING_EXERCISES_FETCH_FAILED'
      );
    }
  }

  /**
   * Get breathing exercise by ID
   */
  async getBreathingExercise(id: string): Promise<BreathingExercise> {
    try {
      return await api.request(`/meditation/breathing-exercises/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BREATHING_EXERCISE_FETCH_FAILED'
      );
    }
  }

  /**
   * Create custom breathing exercise
   */
  async createBreathingExercise(exerciseData: Omit<BreathingExercise, 'id'>): Promise<BreathingExercise> {
    try {
      return await api.request('/meditation/breathing-exercises', {
        method: 'POST',
        body: JSON.stringify(exerciseData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BREATHING_EXERCISE_CREATE_FAILED'
      );
    }
  }

  /**
   * Get meditation recommendations based on user data
   */
  async getMeditationRecommendations(): Promise<{
    recommendedPrograms: MeditationProgram[];
    suggestedSessions: Array<{ type: string; duration: number; title: string }>;
    breathingExercises: BreathingExercise[];
  }> {
    try {
      return await api.request('/meditation/recommendations');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_RECOMMENDATIONS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get meditation categories with detailed info
   */
  async getMeditationCategories(): Promise<MeditationCategory[]> {
    try {
      return await api.request('/meditation/categories/detailed');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_CATEGORIES_FETCH_FAILED'
      );
    }
  }

  /**
   * Get audio by ID
   */
  async getAudioById(id: string): Promise<any> {
    try {
      const response = await api.request(`/meditation/audio/${id}`);
      // Handle both direct response and response.data formats
      if (response && response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'AUDIO_FETCH_BY_ID_FAILED'
      );
    }
  }

  /**
   * Seed default meditation categories (admin function)
   * Note: This requires admin privileges
   */
  async seedMeditationCategories(): Promise<{ message: string; categories: MeditationCategory[] }> {
    try {
      return await api.request('/admin/meditation/seed-categories', {
        method: 'POST'
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_CATEGORIES_SEED_FAILED'
      );
    }
  }

  /**
   * Get featured meditation content for dynamic sessions
   */
  async getFeaturedMeditations(): Promise<{ categories: FeaturedCategory[] }> {
    try {
      return await api.request('/meditation/featured');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FEATURED_MEDITATIONS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get audio library content
   */
  async getAudioLibrary(params?: { category?: string; type?: string }): Promise<AudioContent[]> {
    try {
      const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await api.request(`/meditation/audio${queryParams}`);
      
      let audioData = [];
      
      // Handle paginated response format
      if (response && response.data && Array.isArray(response.data)) {
        audioData = response.data;
      }
      // Fallback to direct array if API returns array directly
      else if (Array.isArray(response)) {
        audioData = response;
      }
      
      // Check if the audio URLs are real S3 URLs or example/placeholder URLs
      const hasRealUrls = audioData.some((audio: any) => 
        audio.file_url && 
        (audio.file_url.includes('s3.amazonaws.com') || 
         audio.file_url.includes('s3.us-east-1.amazonaws.com') ||
         audio.file_url.includes('appatonce.s3'))
      );
      
      if (!hasRealUrls && audioData.length > 0) {
        console.warn('Audio library contains example URLs. Using test audio for development.');
        
        // Import test audio dynamically
        const { mapTestAudioToMeditation } = await import('../constants/testAudio');
        const testAudio = mapTestAudioToMeditation();
        
        // Replace example URLs with test audio and transform to interface format
        return audioData.map((audio: any, index: number) => ({
          id: audio.id,
          title: audio.title,
          description: audio.description,
          fileUrl: testAudio[index % testAudio.length].file_url,
          durationSeconds: audio.duration_seconds || testAudio[index % testAudio.length].duration_seconds,
          durationMinutes: Math.round((audio.duration_seconds || testAudio[index % testAudio.length].duration_seconds) / 60),
          type: audio.type || 'meditation',
          narrator: audio.narrator,
          category: audio.category,
          tags: audio.tags || [],
          language: audio.language || 'en',
          isPremium: audio.is_premium || false,
          originalUrl: audio.file_url, // Keep original for debugging
          isTestAudio: true
        } as any));
      }
      
      // Log that we found real URLs
      if (hasRealUrls) {
        console.log('Found real S3 audio URLs in the backend response');
      }
      
      // Transform API response to match AudioContent interface
      return audioData.map((audio: any): AudioContent => ({
        id: audio.id,
        title: audio.title,
        description: audio.description,
        fileUrl: audio.file_url,
        durationSeconds: audio.duration_seconds || 0,
        durationMinutes: Math.round((audio.duration_seconds || 0) / 60),
        type: audio.type || 'meditation',
        narrator: audio.narrator,
        category: audio.category,
        tags: audio.tags || [],
        language: audio.language || 'en',
        isPremium: audio.is_premium || false
      }));
    } catch (error) {
      console.error('Failed to fetch audio library:', error);
      
      // Return test audio as fallback
      try {
        const { mapTestAudioToMeditation } = await import('../constants/testAudio');
        const testAudioData = mapTestAudioToMeditation();

        // Transform test audio data to match AudioContent interface
        return testAudioData.map((audio: any): AudioContent => ({
          id: audio.id,
          title: audio.title,
          description: audio.description,
          fileUrl: audio.file_url,
          durationSeconds: audio.duration_seconds || 0,
          durationMinutes: Math.round((audio.duration_seconds || 0) / 60),
          type: audio.type || 'meditation',
          narrator: audio.narrator,
          category: audio.category,
          tags: audio.tags || [],
          language: audio.language || 'en',
          isPremium: audio.is_premium || false
        }));
      } catch (importError) {
        console.error('Failed to load test audio:', importError);
        return [];
      }
    }
  }

  /**
   * Get ambient sounds
   */
  async getAmbientSounds(): Promise<AmbientSound[]> {
    try {
      return await api.request('/meditation/ambient-sounds');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'AMBIENT_SOUNDS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get enhanced statistics with XP and achievements
   */
  async getEnhancedStats(timeframe?: string): Promise<MeditationStats> {
    try {
      const params = timeframe ? `?timeframe=${timeframe}` : '';
      return await api.request(`/meditation/stats/enhanced${params}`);
    } catch (error) {
      // Return default stats instead of throwing
      console.warn('Failed to fetch enhanced stats, returning defaults:', error);
      return {
        totalSessions: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageSessionDuration: 0,
        completionRate: 0,
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        favoriteTypes: [],
        weeklyProgress: [],
        monthlyMoodTrends: [],
        achievements: []
      } as MeditationStats;
    }
  }

  /**
   * Get meditation programs/series
   */
  async getPrograms(filters?: { category?: string; difficulty?: string }): Promise<any[]> {
    try {
      const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
      const response = await api.request(`/meditation/programs${queryParams}`);
      // Handle the expected response format with data array and pagination
      if (response && response.data && Array.isArray(response.data)) {
        // Map the API response to match the frontend format
        return response.data.map((program: any) => ({
          id: program.id,
          name: program.name,
          description: program.description,
          instructor: program.instructor,
          difficulty: program.difficulty,
          durationDays: program.duration_days,
          sessionsCount: program.sessions_count,
          category: program.category,
          imageUrl: program.image_url,
          tags: program.tags || [],
          isPremium: program.is_premium,
          isActive: program.is_active,
          createdAt: program.created_at
        }));
      }
      // Fallback for other response formats
      if (Array.isArray(response)) {
        return response;
      }
      if (response && response.programs && Array.isArray(response.programs)) {
        return response.programs;
      }
      // If response format is unexpected, return empty array
      console.warn('Unexpected programs response format:', response);
      return [];
    } catch (error) {
      // Don't throw, return empty array to allow page to show empty state
      console.error('Failed to fetch programs:', error);
      return [];
    }
  }

  /**
   * Get meditation program by ID with proper mapping
   */
  async getProgramById(id: string): Promise<any> {
    try {
      const response = await api.request(`/meditation/programs/${id}`);
      
      // If response has expected format, map it
      if (response) {
        return {
          id: response.id,
          name: response.name,
          title: response.name, // For backward compatibility
          description: response.description,
          instructor: response.instructor,
          difficulty: response.difficulty,
          durationDays: response.duration_days || response.durationDays,
          sessionsCount: response.sessions_count || response.sessionsCount,
          category: response.category,
          imageUrl: response.image_url || response.imageUrl,
          tags: response.tags || [],
          isPremium: response.is_premium !== undefined ? response.is_premium : response.isPremium,
          isActive: response.is_active !== undefined ? response.is_active : response.isActive,
          createdAt: response.created_at || response.createdAt,
          sessions_detail: response.sessions || [] // Map sessions if available
        };
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch program by ID:', error);
      return null;
    }
  }

  /**
   * Create sessions under a program
   */
  async createProgramSessions(programId: string, sessions: Array<{
    title: string;
    description?: string;
    day_number: number;
    duration_minutes: number;
    session_type?: string;
    audio_url?: string;
    instructions?: string[];
    is_locked?: boolean;
  }>): Promise<{
    program: {
      id: string;
      name: string;
      is_sequential: boolean;
    };
    sessions: Array<{
      id: string;
      program_id: string;
      title: string;
      description?: string;
      day_number: number;
      duration_minutes: number;
      session_type?: string;
      audio_url?: string;
      instructions?: string[];
      is_locked: boolean;
      created_at: string;
    }>;
    total_sessions: number;
    completed_count: number;
  }> {
    try {
      return await api.request(`/meditation/programs/${programId}/sessions`, {
        method: 'POST',
        body: JSON.stringify({ sessions }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRAM_SESSIONS_CREATE_FAILED'
      );
    }
  }

  /**
   * Get program sessions
   */
  async getProgramSessions(programId: string): Promise<{
    program: {
      id: string;
      name: string;
      is_sequential: boolean;
    };
    sessions: Array<{
      id: string;
      program_id: string;
      title: string;
      description?: string;
      day_number: number;
      duration_minutes: number;
      session_type?: string;
      audio_url?: string;
      instructions?: string[];
      is_locked: boolean;
      is_completed?: boolean;
      completed_at?: string;
      created_at: string;
    }>;
    total_sessions: number;
    completed_count: number;
  }> {
    try {
      return await api.request(`/meditation/programs/${programId}/sessions`);
    } catch (error) {
      console.error('Failed to fetch program sessions:', error);
      // Return empty structure as fallback
      return {
        program: {
          id: programId,
          name: 'Unknown Program',
          is_sequential: false
        },
        sessions: [],
        total_sessions: 0,
        completed_count: 0
      };
    }
  }

  /**
   * Start a meditation session with new API format
   */
  async startMeditationSession(sessionData: {
    session_type: string;
    duration_minutes: number;
    mood_before?: number;
    guided_audio_id?: string;
    title?: string;
    notes?: string;
    technique?: string;
    environment?: string;
    difficulty_level?: string;
    background_sounds?: string[];
    tags?: string[];
  }): Promise<MeditationSession> {
    try {
      return await api.request('/meditation/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_SESSION_START_FAILED'
      );
    }
  }

  /**
   * Complete a meditation session with enhanced data
   */
  async completeMeditationSession(sessionId: string, completionData: {
    mood_after?: number;
    actual_duration_minutes?: number;
    completion_rating?: number;
    distractions?: string[];
    insights?: string;
  }): Promise<MeditationSession> {
    try {
      return await api.request(`/meditation/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(completionData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_SESSION_COMPLETE_FAILED'
      );
    }
  }


  /**
   * Get a specific program session details
   */
  async getProgramSession(programId: string, sessionId: string): Promise<any> {
    try {
      return await api.request(`/meditation/programs/${programId}/sessions/${sessionId}`);
    } catch (error) {
      console.error('Failed to fetch program session:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRAM_SESSION_FETCH_FAILED'
      );
    }
  }

  /**
   * Complete a program session
   */
  async completeProgramSession(programId: string, sessionId: string, data: {
    duration_seconds: number;
    mood_before: number;
    mood_after: number;
    rating: number;
    notes?: string;
  }): Promise<any> {
    try {
      return await api.request(`/meditation/programs/${programId}/sessions/${sessionId}/complete`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to complete program session:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRAM_SESSION_COMPLETE_FAILED'
      );
    }
  }


  /**
   * Get meditation statistics for the current user
   */
  async getMeditationStats(params?: {
    timeframe?: 'week' | 'month' | 'year' | 'all';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalSessions: number;
    totalMinutes: number;
    averageMood: number;
    currentStreak: number;
    completedSessions: number;
    averageSessionDuration: number;
    favoriteTimeOfDay: string;
    mostUsedTechnique: string;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.timeframe) queryParams.append('timeframe', params.timeframe);
      if (params?.startDate) queryParams.append('start_date', params.startDate);
      if (params?.endDate) queryParams.append('end_date', params.endDate);

      const url = `/meditation/stats/enhanced${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await api.request(url);
      
      // Map the API response to our expected format
      return {
        totalSessions: response.total_sessions || 0,
        totalMinutes: response.total_minutes || 0,
        averageMood: response.average_mood_improvement || 0,
        currentStreak: response.current_streak || 0,
        completedSessions: response.total_sessions || 0, // Assuming all are completed based on API
        averageSessionDuration: response.average_session_length || 0,
        favoriteTimeOfDay: response.preferredTimeOfDay || 'Morning',
        mostUsedTechnique: response.most_used_technique || 'Breathing'
      };
    } catch (error) {
      console.error('Failed to fetch meditation stats:', error);
      // Return default stats if API fails
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageMood: 0,
        currentStreak: 0,
        completedSessions: 0,
        averageSessionDuration: 0,
        favoriteTimeOfDay: 'Morning',
        mostUsedTechnique: 'Breathing'
      };
    }
  }

  /**
   * Get meditation streak information
   */
  async getMeditationStreak(): Promise<{
    currentStreak: number;
    longestStreak: number;
    lastMeditationDate?: string;
    isStreakAtRisk: boolean;
    daysSinceLastMeditation: number;
  }> {
    try {
      const response = await api.request('/meditation/streak');
      return {
        currentStreak: response.current_streak || 0,
        longestStreak: response.longest_streak || 0,
        lastMeditationDate: response.last_meditation_date,
        isStreakAtRisk: response.is_streak_at_risk || false,
        daysSinceLastMeditation: response.days_since_last_meditation || 0
      };
    } catch (error) {
      console.error('Failed to fetch meditation streak:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastMeditationDate: undefined,
        isStreakAtRisk: false,
        daysSinceLastMeditation: 0
      };
    }
  }

  /**
   * Get meditation goals
   */
  async getMeditationGoals(): Promise<Array<{
    id: string;
    user_id: string;
    goal_type: string;
    target_value: number;
    target_unit: string;
    time_period: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    progress: number;
    created_at: string;
  }>> {
    try {
      const response = await api.request('/meditation/goals');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch meditation goals:', error);
      return [];
    }
  }

}

export const meditationService = new MeditationService();