import { 
  MeditationSession, 
  MeditationCategory, 
  BreathingExercise, 
  MeditationCourse, 
  SleepStory, 
  AmbientSound 
} from '../types/meditation';

export const meditationCategories: MeditationCategory[] = [
  {
    id: 'stress-relief',
    name: 'Stress Relief',
    description: 'Quick stress-busting sessions for immediate calm',
    icon: '🌊',
    color: 'blue',
    sessionCount: 24
  },
  {
    id: 'sleep',
    name: 'Sleep & Relaxation',
    description: 'Bedtime meditations and deep relaxation',
    icon: '🌙',
    color: 'purple',
    sessionCount: 18
  },
  {
    id: 'focus',
    name: 'Focus & Concentration',
    description: 'Enhance productivity and mental clarity',
    icon: '🎯',
    color: 'green',
    sessionCount: 20
  },
  {
    id: 'anxiety',
    name: 'Anxiety Management',
    description: 'Calming techniques for worry reduction',
    icon: '🕊️',
    color: 'teal',
    sessionCount: 16
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Present moment awareness practices',
    icon: '🧘',
    color: 'orange',
    sessionCount: 30
  },
  {
    id: 'breathing',
    name: 'Breathing Exercises',
    description: 'Guided breathing patterns and techniques',
    icon: '💨',
    color: 'cyan',
    sessionCount: 12
  },
  {
    id: 'body-scan',
    name: 'Body Scan',
    description: 'Progressive muscle relaxation and tension release',
    icon: '🤲',
    color: 'pink',
    sessionCount: 14
  },
  {
    id: 'loving-kindness',
    name: 'Loving Kindness',
    description: 'Compassion meditation and self-love practices',
    icon: '💖',
    color: 'rose',
    sessionCount: 10
  }
];

export const meditationSessions: MeditationSession[] = [
  // Stress Relief Sessions
  {
    id: 'stress-1',
    title: '5-Minute Stress Reset',
    description: 'Quick relief for overwhelming moments',
    category: meditationCategories[0],
    duration: 5,
    difficulty: 'beginner',
    instructor: 'Sarah Chen',
    tags: ['quick', 'workplace', 'breathing'],
    hasGuidance: true,
    hasMusic: true,
    rating: 4.8,
    totalRatings: 1247,
    isPremium: false
  },
  {
    id: 'stress-2',
    title: 'Deep Calm for Anxiety',
    description: 'Gentle guidance through anxious thoughts',
    category: meditationCategories[0],
    duration: 15,
    difficulty: 'beginner',
    instructor: 'Dr. Michael Rivers',
    tags: ['anxiety', 'grounding', 'calm'],
    hasGuidance: true,
    hasMusic: true,
    rating: 4.9,
    totalRatings: 892,
    isPremium: false
  },
  {
    id: 'stress-3',
    title: 'Tension Release Body Scan',
    description: 'Progressive muscle relaxation for physical stress',
    category: meditationCategories[0],
    duration: 20,
    difficulty: 'intermediate',
    instructor: 'Emma Williams',
    tags: ['body-scan', 'tension', 'physical'],
    hasGuidance: true,
    hasMusic: false,
    rating: 4.7,
    totalRatings: 654,
    isPremium: true
  },

  // Sleep Sessions
  {
    id: 'sleep-1',
    title: 'Evening Wind Down',
    description: 'Gentle transition from day to peaceful night',
    category: meditationCategories[1],
    duration: 10,
    difficulty: 'beginner',
    instructor: 'Luna Martinez',
    tags: ['bedtime', 'relaxation', 'gentle'],
    hasGuidance: true,
    hasMusic: true,
    rating: 4.8,
    totalRatings: 1456,
    isPremium: false
  },
  {
    id: 'sleep-2',
    title: 'Deep Sleep Body Scan',
    description: 'Progressive relaxation for restorative sleep',
    category: meditationCategories[1],
    duration: 25,
    difficulty: 'beginner',
    instructor: 'Dr. Sleep Specialist',
    tags: ['deep-sleep', 'body-scan', 'restoration'],
    hasGuidance: true,
    hasMusic: true,
    rating: 4.9,
    totalRatings: 2103,
    isPremium: true
  },

  // Focus Sessions
  {
    id: 'focus-1',
    title: 'Morning Focus Booster',
    description: 'Start your day with clarity and intention',
    category: meditationCategories[2],
    duration: 8,
    difficulty: 'beginner',
    instructor: 'Alex Thompson',
    tags: ['morning', 'productivity', 'clarity'],
    hasGuidance: true,
    hasMusic: false,
    rating: 4.6,
    totalRatings: 789,
    isPremium: false
  },
  {
    id: 'focus-2',
    title: 'Work Break Meditation',
    description: 'Quick mental reset for sustained concentration',
    category: meditationCategories[2],
    duration: 7,
    difficulty: 'beginner',
    instructor: 'Sarah Chen',
    tags: ['work', 'break', 'concentration'],
    hasGuidance: true,
    hasMusic: true,
    rating: 4.7,
    totalRatings: 1092,
    isPremium: false
  },

  // Mindfulness Sessions
  {
    id: 'mindfulness-1',
    title: 'Present Moment Awareness',
    description: 'Cultivate awareness of the here and now',
    category: meditationCategories[4],
    duration: 12,
    difficulty: 'intermediate',
    instructor: 'Zen Master Kim',
    tags: ['awareness', 'present', 'mindful'],
    hasGuidance: true,
    hasMusic: false,
    rating: 4.8,
    totalRatings: 943,
    isPremium: false
  },
  {
    id: 'mindfulness-2',
    title: 'Mindful Walking Meditation',
    description: 'Practice mindfulness while in gentle movement',
    category: meditationCategories[4],
    duration: 15,
    difficulty: 'beginner',
    instructor: 'Nature Guide Maya',
    tags: ['walking', 'movement', 'outdoor'],
    hasGuidance: true,
    hasMusic: true,
    rating: 4.5,
    totalRatings: 567,
    isPremium: true
  }
];

export const breathingExercises: BreathingExercise[] = [
  {
    id: 'breathing-478',
    name: '4-7-8 Breathing',
    description: 'Powerful technique for relaxation and sleep',
    pattern: {
      inhale: 4,
      hold1: 7,
      exhale: 8
    },
    duration: 10,
    difficulty: 'beginner',
    benefits: ['Reduces anxiety', 'Improves sleep', 'Lowers stress'],
    instructions: [
      'Sit comfortably with your back straight',
      'Place tongue tip behind upper teeth',
      'Inhale through nose for 4 counts',
      'Hold breath for 7 counts',
      'Exhale through mouth for 8 counts',
      'Repeat the cycle 4 times'
    ]
  },
  {
    id: 'breathing-box',
    name: 'Box Breathing',
    description: 'Four-equal-sides breathing for balance',
    pattern: {
      inhale: 4,
      hold1: 4,
      exhale: 4,
      hold2: 4
    },
    duration: 15,
    difficulty: 'beginner',
    benefits: ['Improves focus', 'Reduces stress', 'Balances nervous system'],
    instructions: [
      'Sit in a comfortable position',
      'Inhale slowly for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly for 4 counts',
      'Hold empty for 4 counts',
      'Continue for 10-15 cycles'
    ]
  },
  {
    id: 'breathing-coherent',
    name: 'Coherent Breathing',
    description: '5-5 breathing pattern for heart rate variability',
    pattern: {
      inhale: 5,
      exhale: 5
    },
    duration: 20,
    difficulty: 'intermediate',
    benefits: ['Heart rate variability', 'Emotional balance', 'Stress resilience'],
    instructions: [
      'Breathe naturally through your nose',
      'Inhale slowly for 5 counts',
      'Exhale slowly for 5 counts',
      'Maintain smooth, even breaths',
      'Continue for 10-20 minutes'
    ]
  }
];

export const meditationCourses: MeditationCourse[] = [
  {
    id: 'course-stress-7day',
    title: '7-Day Stress Relief Course',
    description: 'Master stress management techniques in one week',
    instructor: 'Dr. Michael Rivers',
    totalLessons: 7,
    estimatedDuration: '7 days',
    difficulty: 'beginner',
    category: 'Stress Relief',
    isPremium: false,
    completionCertificate: true,
    lessons: [
      {
        id: 'lesson-1',
        courseId: 'course-stress-7day',
        title: 'Understanding Stress',
        description: 'Learn about stress and its effects on the body',
        duration: 10,
        dayNumber: 1,
        completed: false,
        unlocked: true
      },
      {
        id: 'lesson-2',
        courseId: 'course-stress-7day',
        title: 'Breath Awareness',
        description: 'Master basic breathing techniques for instant calm',
        duration: 12,
        dayNumber: 2,
        completed: false,
        unlocked: false
      }
      // Additional lessons would be added here
    ]
  },
  {
    id: 'course-mindfulness-21day',
    title: '21-Day Mindfulness Foundation',
    description: 'Build a solid foundation for daily mindfulness practice',
    instructor: 'Zen Master Kim',
    totalLessons: 21,
    estimatedDuration: '3 weeks',
    difficulty: 'beginner',
    category: 'Mindfulness',
    isPremium: true,
    completionCertificate: true,
    lessons: []
  }
];

export const sleepStories: SleepStory[] = [
  {
    id: 'story-1',
    title: 'The Enchanted Forest',
    description: 'A peaceful journey through a magical woodland',
    narrator: 'Emma Williams',
    duration: 45,
    category: 'fantasy',
    rating: 4.9,
    totalRatings: 1834,
    isPremium: false
  },
  {
    id: 'story-2',
    title: 'Ocean Waves at Sunset',
    description: 'Drift off to the gentle sounds of the seaside',
    narrator: 'Luna Martinez',
    duration: 30,
    category: 'nature',
    rating: 4.8,
    totalRatings: 1267,
    isPremium: true
  }
];

export const ambientSounds: AmbientSound[] = [
  {
    id: 'sound-rain',
    name: 'Gentle Rain',
    audioUrl: '/sounds/rain.mp3',
    icon: '🌧️',
    category: 'nature',
    volume: 0.5,
    isPlaying: false
  },
  {
    id: 'sound-ocean',
    name: 'Ocean Waves',
    audioUrl: '/sounds/ocean.mp3',
    icon: '🌊',
    category: 'nature',
    volume: 0.5,
    isPlaying: false
  },
  {
    id: 'sound-forest',
    name: 'Forest Sounds',
    audioUrl: '/sounds/forest.mp3',
    icon: '🌲',
    category: 'nature',
    volume: 0.5,
    isPlaying: false
  },
  {
    id: 'sound-white-noise',
    name: 'White Noise',
    audioUrl: '/sounds/white-noise.mp3',
    icon: '📻',
    category: 'white-noise',
    volume: 0.5,
    isPlaying: false
  },
  {
    id: 'sound-binaural',
    name: 'Alpha Waves',
    audioUrl: '/sounds/alpha-waves.mp3',
    icon: '🧠',
    category: 'binaural',
    volume: 0.5,
    isPlaying: false
  }
];

export const getMeditationSessionById = (id: string): MeditationSession | undefined => {
  return meditationSessions.find(session => session.id === id);
};

export const getMeditationSessionsByCategory = (categoryId: string): MeditationSession[] => {
  return meditationSessions.filter(session => session.category.id === categoryId);
};

export const getMeditationSessionsByDuration = (minDuration: number, maxDuration: number): MeditationSession[] => {
  return meditationSessions.filter(session => 
    session.duration >= minDuration && session.duration <= maxDuration
  );
};

export const getFeaturedSessions = (): MeditationSession[] => {
  return meditationSessions
    .filter(session => session.rating >= 4.7)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
};

export const getRecommendedSessions = (preferences?: string[]): MeditationSession[] => {
  if (!preferences || preferences.length === 0) {
    return getFeaturedSessions();
  }

  return meditationSessions
    .filter(session => 
      preferences.some(pref => 
        session.category.id === pref || 
        session.tags.includes(pref)
      )
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);
};