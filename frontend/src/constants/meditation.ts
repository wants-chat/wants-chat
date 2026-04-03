// Valid session types as per backend API
export const MEDITATION_SESSION_TYPES = {
  MINDFULNESS: 'mindfulness',
  BREATHING: 'breathing',
  BODY_SCAN: 'body_scan',
  LOVING_KINDNESS: 'loving_kindness',
  WALKING: 'walking',
  VISUALIZATION: 'visualization',
  MANTRA: 'mantra',
  ZEN: 'zen',
  GUIDED: 'guided',
  UNGUIDED: 'unguided',
  SLEEP: 'sleep',
  FOCUS: 'focus',
  STRESS_RELIEF: 'stress_relief'
} as const;

export type MeditationSessionType = typeof MEDITATION_SESSION_TYPES[keyof typeof MEDITATION_SESSION_TYPES];

// Valid environments
export const MEDITATION_ENVIRONMENTS = {
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor',
  BEDROOM: 'bedroom',
  LIVING_ROOM: 'living_room',
  OFFICE: 'office',
  NATURE: 'nature',
  MEDITATION_ROOM: 'meditation_room'
} as const;

export type MeditationEnvironment = typeof MEDITATION_ENVIRONMENTS[keyof typeof MEDITATION_ENVIRONMENTS];

// Valid difficulty levels
export const MEDITATION_DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
} as const;

export type MeditationDifficultyLevel = typeof MEDITATION_DIFFICULTY_LEVELS[keyof typeof MEDITATION_DIFFICULTY_LEVELS];

// Category to session type mapping - includes all seeded category slugs
export const CATEGORY_TO_SESSION_TYPE: { [key: string]: MeditationSessionType } = {
  // Seeded category slugs (from seed-meditation-data.ts)
  'morning': MEDITATION_SESSION_TYPES.MINDFULNESS,
  'after-work': MEDITATION_SESSION_TYPES.STRESS_RELIEF,
  'sleep': MEDITATION_SESSION_TYPES.SLEEP,
  'stress-relief': MEDITATION_SESSION_TYPES.STRESS_RELIEF,
  'focus': MEDITATION_SESSION_TYPES.FOCUS,
  'anxiety-relief': MEDITATION_SESSION_TYPES.STRESS_RELIEF,
  'gratitude': MEDITATION_SESSION_TYPES.LOVING_KINDNESS,
  'self-love': MEDITATION_SESSION_TYPES.LOVING_KINDNESS,
  'breathing': MEDITATION_SESSION_TYPES.BREATHING,
  'body-scan': MEDITATION_SESSION_TYPES.BODY_SCAN,
  // Legacy backend category slugs
  'sleep-better': MEDITATION_SESSION_TYPES.SLEEP,
  'focus-concentration': MEDITATION_SESSION_TYPES.FOCUS,
  'anxiety-calm': MEDITATION_SESSION_TYPES.STRESS_RELIEF,
  'mindfulness-presence': MEDITATION_SESSION_TYPES.MINDFULNESS,
  'energy-boost': MEDITATION_SESSION_TYPES.BREATHING,
  'emotional-balance': MEDITATION_SESSION_TYPES.LOVING_KINDNESS,
  'quick-reset': MEDITATION_SESSION_TYPES.BREATHING,
  // Default for guided audio sessions
  'guided': MEDITATION_SESSION_TYPES.GUIDED,
  'meditation': MEDITATION_SESSION_TYPES.MINDFULNESS,
  // Quick sessions
  'quick': MEDITATION_SESSION_TYPES.MINDFULNESS,
  'quick-session': MEDITATION_SESSION_TYPES.MINDFULNESS
};

// Helper function to get valid session type
export const getValidSessionType = (category: string | undefined): MeditationSessionType => {
  return CATEGORY_TO_SESSION_TYPE[category || ''] || MEDITATION_SESSION_TYPES.MINDFULNESS;
};