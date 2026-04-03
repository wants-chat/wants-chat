/**
 * Meditation Module Transformers
 * Converts between snake_case (backend) and camelCase (frontend) for meditation data
 */

import {
  transformKeysToCamel,
  transformKeysToSnake,
  transformPaginatedResponse,
  transformSingleResponse,
  prepareForBackend,
} from './caseTransformers';

import type {
  MeditationSession,
  MeditationCategory,
  BreathingExercise,
  MeditationProgress,
  MeditationStreak,
  MeditationCourse,
  MeditationLesson,
  SleepStory,
  AmbientSound,
  MeditationPreferences,
  MeditationStats,
  MeditationGoal,
  MoodEntry,
} from '../types/meditation';

// ============================================================================
// Meditation Session Transformers
// ============================================================================

/**
 * Transform meditation session from backend (snake_case) to frontend (camelCase)
 */
export function transformMeditationSessionFromBackend(session: any): MeditationSession {
  if (!session) return session;

  return {
    id: session.id,
    title: session.title,
    description: session.description,
    category: session.category,
    duration: session.duration,
    difficulty: session.difficulty,
    instructor: session.instructor,
    audioUrl: session.audio_url || session.audioUrl,
    imageUrl: session.image_url || session.imageUrl,
    tags: session.tags || [],
    hasGuidance: session.has_guidance ?? session.hasGuidance ?? false,
    hasMusic: session.has_music ?? session.hasMusic ?? false,
    rating: session.rating || 0,
    totalRatings: session.total_ratings || session.totalRatings || 0,
    isPremium: session.is_premium ?? session.isPremium ?? false,
    isDownloaded: session.is_downloaded ?? session.isDownloaded ?? false,
  };
}

/**
 * Transform meditation session to backend (snake_case)
 */
export function transformMeditationSessionToBackend(session: Partial<MeditationSession>): any {
  if (!session) return session;

  return prepareForBackend({
    title: session.title,
    description: session.description,
    category: session.category,
    duration: session.duration,
    difficulty: session.difficulty,
    instructor: session.instructor,
    audioUrl: session.audioUrl,
    imageUrl: session.imageUrl,
    tags: session.tags,
    hasGuidance: session.hasGuidance,
    hasMusic: session.hasMusic,
    isPremium: session.isPremium,
  });
}

// ============================================================================
// Meditation Category Transformers
// ============================================================================

/**
 * Transform meditation category from backend
 */
export function transformMeditationCategoryFromBackend(category: any): MeditationCategory {
  if (!category) return category;

  return {
    id: category.id,
    name: category.name,
    description: category.description,
    icon: category.icon,
    color: category.color,
    sessionCount: category.session_count || category.sessionCount || 0,
  };
}

// ============================================================================
// Breathing Exercise Transformers
// ============================================================================

/**
 * Transform breathing exercise from backend
 */
export function transformBreathingExerciseFromBackend(exercise: any): BreathingExercise {
  if (!exercise) return exercise;

  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    pattern: {
      inhale: exercise.pattern?.inhale || 0,
      hold1: exercise.pattern?.hold1 || exercise.pattern?.hold_1,
      exhale: exercise.pattern?.exhale || 0,
      hold2: exercise.pattern?.hold2 || exercise.pattern?.hold_2,
    },
    duration: exercise.duration,
    difficulty: exercise.difficulty,
    benefits: exercise.benefits || [],
    instructions: exercise.instructions || [],
  };
}

// ============================================================================
// Meditation Progress Transformers
// ============================================================================

/**
 * Transform meditation progress from backend
 */
export function transformMeditationProgressFromBackend(progress: any): MeditationProgress {
  if (!progress) return progress;

  return {
    id: progress.id,
    userId: progress.user_id || progress.userId,
    sessionId: progress.session_id || progress.sessionId,
    date: progress.date,
    duration: progress.duration,
    completed: progress.completed ?? false,
    moodBefore: progress.mood_before ?? progress.moodBefore,
    moodAfter: progress.mood_after ?? progress.moodAfter,
    notes: progress.notes,
    rating: progress.rating,
  };
}

/**
 * Transform meditation progress to backend
 */
export function transformMeditationProgressToBackend(progress: Partial<MeditationProgress>): any {
  if (!progress) return progress;

  return prepareForBackend({
    sessionId: progress.sessionId,
    date: progress.date,
    duration: progress.duration,
    completed: progress.completed,
    moodBefore: progress.moodBefore,
    moodAfter: progress.moodAfter,
    notes: progress.notes,
    rating: progress.rating,
  });
}

// ============================================================================
// Meditation Streak Transformers
// ============================================================================

/**
 * Transform meditation streak from backend
 */
export function transformMeditationStreakFromBackend(streak: any): MeditationStreak {
  if (!streak) return streak;

  return {
    current: streak.current || 0,
    longest: streak.longest || 0,
    lastMeditationDate: streak.last_meditation_date || streak.lastMeditationDate || '',
    totalSessions: streak.total_sessions || streak.totalSessions || 0,
    totalMinutes: streak.total_minutes || streak.totalMinutes || 0,
  };
}

// ============================================================================
// Meditation Course Transformers
// ============================================================================

/**
 * Transform meditation course from backend
 */
export function transformMeditationCourseFromBackend(course: any): MeditationCourse {
  if (!course) return course;

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    instructor: course.instructor,
    totalLessons: course.total_lessons || course.totalLessons || 0,
    estimatedDuration: course.estimated_duration || course.estimatedDuration || '',
    difficulty: course.difficulty,
    category: course.category,
    imageUrl: course.image_url || course.imageUrl,
    lessons: (course.lessons || []).map(transformMeditationLessonFromBackend),
    isPremium: course.is_premium ?? course.isPremium ?? false,
    completionCertificate: course.completion_certificate ?? course.completionCertificate ?? false,
  };
}

/**
 * Transform meditation lesson from backend
 */
export function transformMeditationLessonFromBackend(lesson: any): MeditationLesson {
  if (!lesson) return lesson;

  return {
    id: lesson.id,
    courseId: lesson.course_id || lesson.courseId,
    title: lesson.title,
    description: lesson.description,
    duration: lesson.duration,
    dayNumber: lesson.day_number || lesson.dayNumber,
    audioUrl: lesson.audio_url || lesson.audioUrl,
    completed: lesson.completed ?? false,
    unlocked: lesson.unlocked ?? true,
  };
}

// ============================================================================
// Sleep Story Transformers
// ============================================================================

/**
 * Transform sleep story from backend
 */
export function transformSleepStoryFromBackend(story: any): SleepStory {
  if (!story) return story;

  return {
    id: story.id,
    title: story.title,
    description: story.description,
    narrator: story.narrator,
    duration: story.duration,
    audioUrl: story.audio_url || story.audioUrl,
    imageUrl: story.image_url || story.imageUrl,
    category: story.category,
    rating: story.rating || 0,
    totalRatings: story.total_ratings || story.totalRatings || 0,
    isPremium: story.is_premium ?? story.isPremium ?? false,
  };
}

// ============================================================================
// Ambient Sound Transformers
// ============================================================================

/**
 * Transform ambient sound from backend
 */
export function transformAmbientSoundFromBackend(sound: any): AmbientSound {
  if (!sound) return sound;

  return {
    id: sound.id,
    name: sound.name,
    audioUrl: sound.audio_url || sound.audioUrl,
    icon: sound.icon,
    category: sound.category,
    volume: sound.volume ?? 0.5,
    isPlaying: sound.is_playing ?? sound.isPlaying ?? false,
  };
}

// ============================================================================
// Meditation Preferences Transformers
// ============================================================================

/**
 * Transform meditation preferences from backend
 */
export function transformMeditationPreferencesFromBackend(prefs: any): MeditationPreferences {
  if (!prefs) return prefs;

  return {
    preferredDuration: prefs.preferred_duration || prefs.preferredDuration || [],
    favoriteCategories: prefs.favorite_categories || prefs.favoriteCategories || [],
    preferredInstructor: prefs.preferred_instructor || prefs.preferredInstructor || '',
    reminderTime: prefs.reminder_time || prefs.reminderTime,
    reminderDays: prefs.reminder_days || prefs.reminderDays || [],
    ambientSoundVolume: prefs.ambient_sound_volume ?? prefs.ambientSoundVolume ?? 0.5,
    voiceVolume: prefs.voice_volume ?? prefs.voiceVolume ?? 1.0,
    enableHapticFeedback: prefs.enable_haptic_feedback ?? prefs.enableHapticFeedback ?? true,
    autoStartNextSession: prefs.auto_start_next_session ?? prefs.autoStartNextSession ?? false,
    showMoodTracking: prefs.show_mood_tracking ?? prefs.showMoodTracking ?? true,
  };
}

/**
 * Transform meditation preferences to backend
 */
export function transformMeditationPreferencesToBackend(prefs: Partial<MeditationPreferences>): any {
  if (!prefs) return prefs;

  return prepareForBackend({
    preferredDuration: prefs.preferredDuration,
    favoriteCategories: prefs.favoriteCategories,
    preferredInstructor: prefs.preferredInstructor,
    reminderTime: prefs.reminderTime,
    reminderDays: prefs.reminderDays,
    ambientSoundVolume: prefs.ambientSoundVolume,
    voiceVolume: prefs.voiceVolume,
    enableHapticFeedback: prefs.enableHapticFeedback,
    autoStartNextSession: prefs.autoStartNextSession,
    showMoodTracking: prefs.showMoodTracking,
  });
}

// ============================================================================
// Meditation Stats Transformers
// ============================================================================

/**
 * Transform meditation stats from backend
 */
export function transformMeditationStatsFromBackend(stats: any): MeditationStats {
  if (!stats) return stats;

  return {
    totalSessions: stats.total_sessions || stats.totalSessions || 0,
    totalMinutes: stats.total_minutes || stats.totalMinutes || 0,
    averageSessionLength: stats.average_session_length || stats.averageSessionLength || 0,
    favoriteCategory: stats.favorite_category || stats.favoriteCategory || '',
    currentStreak: stats.current_streak || stats.currentStreak || 0,
    longestStreak: stats.longest_streak || stats.longestStreak || 0,
    sessionsThisWeek: stats.sessions_this_week || stats.sessionsThisWeek || 0,
    sessionsThisMonth: stats.sessions_this_month || stats.sessionsThisMonth || 0,
    minutesThisWeek: stats.minutes_this_week || stats.minutesThisWeek || 0,
    minutesThisMonth: stats.minutes_this_month || stats.minutesThisMonth || 0,
    moodImprovement: stats.mood_improvement || stats.moodImprovement || 0,
    consistencyScore: stats.consistency_score || stats.consistencyScore || 0,
  };
}

// ============================================================================
// Meditation Goal Transformers
// ============================================================================

/**
 * Transform meditation goal from backend
 */
export function transformMeditationGoalFromBackend(goal: any): MeditationGoal {
  if (!goal) return goal;

  return {
    id: goal.id,
    type: goal.type,
    target: goal.target,
    current: goal.current || 0,
    startDate: goal.start_date || goal.startDate,
    endDate: goal.end_date || goal.endDate,
    isActive: goal.is_active ?? goal.isActive ?? true,
    completed: goal.completed ?? false,
  };
}

/**
 * Transform meditation goal to backend
 */
export function transformMeditationGoalToBackend(goal: Partial<MeditationGoal>): any {
  if (!goal) return goal;

  return prepareForBackend({
    type: goal.type,
    target: goal.target,
    startDate: goal.startDate,
    endDate: goal.endDate,
    isActive: goal.isActive,
  });
}

// ============================================================================
// Mood Entry Transformers
// ============================================================================

/**
 * Transform mood entry from backend
 */
export function transformMoodEntryFromBackend(entry: any): MoodEntry {
  if (!entry) return entry;

  return {
    id: entry.id,
    date: entry.date,
    beforeMeditation: entry.before_meditation ?? entry.beforeMeditation,
    afterMeditation: entry.after_meditation ?? entry.afterMeditation,
    notes: entry.notes,
    sessionId: entry.session_id || entry.sessionId,
  };
}

/**
 * Transform mood entry to backend
 */
export function transformMoodEntryToBackend(entry: Partial<MoodEntry>): any {
  if (!entry) return entry;

  return prepareForBackend({
    date: entry.date,
    beforeMeditation: entry.beforeMeditation,
    afterMeditation: entry.afterMeditation,
    notes: entry.notes,
    sessionId: entry.sessionId,
  });
}

// ============================================================================
// List Response Transformers
// ============================================================================

/**
 * Transform paginated meditation sessions response
 */
export function transformMeditationSessionsListResponse(response: any): {
  data: MeditationSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformMeditationSessionFromBackend),
  };
}

/**
 * Transform paginated meditation courses response
 */
export function transformMeditationCoursesListResponse(response: any): {
  data: MeditationCourse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformMeditationCourseFromBackend),
  };
}

/**
 * Transform paginated sleep stories response
 */
export function transformSleepStoriesListResponse(response: any): {
  data: SleepStory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformSleepStoryFromBackend),
  };
}

/**
 * Transform paginated meditation progress response
 */
export function transformMeditationProgressListResponse(response: any): {
  data: MeditationProgress[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformMeditationProgressFromBackend),
  };
}

/**
 * Transform meditation categories list response
 */
export function transformMeditationCategoriesListResponse(response: any): MeditationCategory[] {
  if (!response) return [];

  const data = Array.isArray(response) ? response : response.data || [];
  return data.map(transformMeditationCategoryFromBackend);
}

/**
 * Transform breathing exercises list response
 */
export function transformBreathingExercisesListResponse(response: any): BreathingExercise[] {
  if (!response) return [];

  const data = Array.isArray(response) ? response : response.data || [];
  return data.map(transformBreathingExerciseFromBackend);
}

/**
 * Transform ambient sounds list response
 */
export function transformAmbientSoundsListResponse(response: any): AmbientSound[] {
  if (!response) return [];

  const data = Array.isArray(response) ? response : response.data || [];
  return data.map(transformAmbientSoundFromBackend);
}

// ============================================================================
// Single Response Transformers
// ============================================================================

/**
 * Transform single meditation session response
 */
export function transformMeditationSessionResponse(response: any): MeditationSession | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformMeditationSessionFromBackend(data) : null;
}

/**
 * Transform single meditation course response
 */
export function transformMeditationCourseResponse(response: any): MeditationCourse | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformMeditationCourseFromBackend(data) : null;
}

/**
 * Transform single meditation preferences response
 */
export function transformMeditationPreferencesResponse(response: any): MeditationPreferences | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformMeditationPreferencesFromBackend(data) : null;
}

/**
 * Transform single meditation stats response
 */
export function transformMeditationStatsResponse(response: any): MeditationStats | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformMeditationStatsFromBackend(data) : null;
}
