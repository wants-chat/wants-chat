/**
 * Google Analytics 4 Integration
 *
 * This utility provides GA4 tracking functions for Wants Chat.
 * It only tracks when GA_MEASUREMENT_ID is configured in production.
 */

// Get GA4 Measurement ID from environment
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Check if analytics is enabled
const isAnalyticsEnabled = (): boolean => {
  return Boolean(GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX');
};

// Google Analytics global object (gtag)
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Initialize Google Analytics
 * Call this once when the app starts
 */
export const initializeAnalytics = (): void => {
  if (!isAnalyticsEnabled()) {
    if (import.meta.env.DEV) console.log('[Analytics] GA4 not configured - tracking disabled');
    return;
  }

  // gtag is loaded via script tag in index.html
  if (import.meta.env.DEV) console.log('[Analytics] GA4 initialized');
};

/**
 * Track page views
 * Call this on route changes
 */
export const trackPageView = (page_path: string, page_title?: string): void => {
  if (!isAnalyticsEnabled() || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path,
    page_title: page_title || document.title,
  });
};

/**
 * Track custom events
 * Use this for user interactions like button clicks, form submissions, etc.
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
): void => {
  if (!isAnalyticsEnabled() || !window.gtag) return;

  window.gtag('event', eventName, eventParams);
};

/**
 * Track user sign-up conversions
 */
export const trackSignUp = (method: 'email' | 'google' | 'github' = 'email'): void => {
  trackEvent('sign_up', {
    method,
  });
};

/**
 * Track user login
 */
export const trackLogin = (method: 'email' | 'google' | 'github' = 'email'): void => {
  trackEvent('login', {
    method,
  });
};

/**
 * Track app/module usage
 */
export const trackAppUsed = (appName: string): void => {
  trackEvent('app_used', {
    app_name: appName,
    event_category: 'engagement',
  });
};

/**
 * Track workout completed
 */
export const trackWorkoutCompleted = (workoutType: string, duration: number): void => {
  trackEvent('workout_completed', {
    workout_type: workoutType,
    duration_minutes: duration,
    event_category: 'fitness',
  });
};

/**
 * Track meditation session
 */
export const trackMeditationSession = (duration: number, programName?: string): void => {
  trackEvent('meditation_completed', {
    duration_minutes: duration,
    program_name: programName,
    event_category: 'wellness',
  });
};

/**
 * Track meal logged
 */
export const trackMealLogged = (mealType: string, calories?: number): void => {
  trackEvent('meal_logged', {
    meal_type: mealType,
    calories,
    event_category: 'nutrition',
  });
};

/**
 * Track expense added
 */
export const trackExpenseAdded = (category: string, amount: number, currency: string): void => {
  trackEvent('expense_added', {
    expense_category: category,
    amount,
    currency,
    event_category: 'finance',
  });
};

/**
 * Track habit completed
 */
export const trackHabitCompleted = (habitName: string, streak: number): void => {
  trackEvent('habit_completed', {
    habit_name: habitName,
    current_streak: streak,
    event_category: 'habits',
  });
};

/**
 * Track travel plan created
 */
export const trackTravelPlanCreated = (destination: string): void => {
  trackEvent('travel_plan_created', {
    destination,
    event_category: 'travel',
  });
};

/**
 * Track blog post published
 */
export const trackBlogPostPublished = (): void => {
  trackEvent('blog_post_published', {
    event_category: 'content',
  });
};

/**
 * Track language lesson completed
 */
export const trackLanguageLessonCompleted = (language: string, lessonType: string): void => {
  trackEvent('language_lesson_completed', {
    language,
    lesson_type: lessonType,
    event_category: 'learning',
  });
};

/**
 * Track recipe saved
 */
export const trackRecipeSaved = (cuisineType?: string): void => {
  trackEvent('recipe_saved', {
    cuisine_type: cuisineType,
    event_category: 'recipes',
  });
};

/**
 * Track todo completed
 */
export const trackTodoCompleted = (category?: string): void => {
  trackEvent('todo_completed', {
    task_category: category,
    event_category: 'productivity',
  });
};

/**
 * Track subscription/plan selection
 */
export const trackPlanSelected = (plan: string, billing: 'monthly' | 'yearly'): void => {
  trackEvent('select_plan', {
    plan_name: plan,
    billing_cycle: billing,
    event_category: 'conversion',
  });
};

/**
 * Track feature usage
 */
export const trackFeatureUsed = (feature: string): void => {
  trackEvent('feature_used', {
    feature_name: feature,
    event_category: 'engagement',
  });
};

/**
 * Track file uploads
 */
export const trackFileUpload = (fileType: string, fileSize: number): void => {
  trackEvent('file_upload', {
    file_type: fileType,
    file_size: fileSize,
    event_category: 'engagement',
  });
};

/**
 * Track search queries
 */
export const trackSearch = (searchTerm: string, resultsCount: number): void => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    event_category: 'engagement',
  });
};

/**
 * Track errors for monitoring
 */
export const trackError = (errorMessage: string, errorLocation: string): void => {
  trackEvent('exception', {
    description: errorMessage,
    fatal: false,
    location: errorLocation,
  });
};

/**
 * Track outbound link clicks
 */
export const trackOutboundLink = (url: string, label?: string): void => {
  trackEvent('click', {
    event_category: 'outbound',
    event_label: label || url,
    value: url,
  });
};

/**
 * Track CTA button clicks
 */
export const trackCTAClick = (ctaName: string, location: string): void => {
  trackEvent('cta_click', {
    cta_name: ctaName,
    page_location: location,
    event_category: 'engagement',
  });
};

/**
 * Set user properties (for logged-in users)
 */
export const setUserProperties = (properties: Record<string, unknown>): void => {
  if (!isAnalyticsEnabled() || !window.gtag) return;

  window.gtag('set', 'user_properties', properties);
};

/**
 * Set user ID (for logged-in users)
 */
export const setUserId = (userId: string): void => {
  if (!isAnalyticsEnabled() || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_id: userId,
  });
};

export default {
  initializeAnalytics,
  trackPageView,
  trackEvent,
  trackSignUp,
  trackLogin,
  trackAppUsed,
  trackWorkoutCompleted,
  trackMeditationSession,
  trackMealLogged,
  trackExpenseAdded,
  trackHabitCompleted,
  trackTravelPlanCreated,
  trackBlogPostPublished,
  trackLanguageLessonCompleted,
  trackRecipeSaved,
  trackTodoCompleted,
  trackPlanSelected,
  trackFeatureUsed,
  trackFileUpload,
  trackSearch,
  trackError,
  trackOutboundLink,
  trackCTAClick,
  setUserProperties,
  setUserId,
};
