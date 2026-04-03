import { MeditationProgress, MeditationStreak, MeditationStats, MoodEntry } from '../types/meditation';

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculateStreak = (progressEntries: MeditationProgress[]): MeditationStreak => {
  const sortedEntries = progressEntries
    .filter(entry => entry.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedEntries.length === 0) {
    return {
      current: 0,
      longest: 0,
      lastMeditationDate: '',
      totalSessions: 0,
      totalMinutes: 0
    };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date();
  const uniqueDates = new Set<string>();

  // Get unique meditation dates
  sortedEntries.forEach(entry => {
    uniqueDates.add(entry.date.split('T')[0]); // Get just the date part
  });

  const sortedDates = Array.from(uniqueDates).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Calculate current streak
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (date.toDateString() === expectedDate.toDateString()) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  tempStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const previousDate = new Date(sortedDates[i - 1]);
    const diffTime = previousDate.getTime() - currentDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  const totalMinutes = sortedEntries.reduce((sum, entry) => sum + entry.duration, 0);

  return {
    current: currentStreak,
    longest: longestStreak,
    lastMeditationDate: sortedEntries[0]?.date || '',
    totalSessions: sortedEntries.length,
    totalMinutes
  };
};

export const calculateMeditationStats = (progressEntries: MeditationProgress[]): MeditationStats => {
  const completedEntries = progressEntries.filter(entry => entry.completed);
  const totalSessions = completedEntries.length;
  const totalMinutes = completedEntries.reduce((sum, entry) => sum + entry.duration, 0);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const sessionsThisWeek = completedEntries.filter(
    entry => new Date(entry.date) >= weekAgo
  ).length;

  const sessionsThisMonth = completedEntries.filter(
    entry => new Date(entry.date) >= monthAgo
  ).length;

  const minutesThisWeek = completedEntries
    .filter(entry => new Date(entry.date) >= weekAgo)
    .reduce((sum, entry) => sum + entry.duration, 0);

  const minutesThisMonth = completedEntries
    .filter(entry => new Date(entry.date) >= monthAgo)
    .reduce((sum, entry) => sum + entry.duration, 0);

  const entriesWithMood = completedEntries.filter(
    entry => entry.moodBefore && entry.moodAfter
  );

  const moodImprovement = entriesWithMood.length > 0
    ? entriesWithMood.reduce((sum, entry) => 
        sum + ((entry.moodAfter || 0) - (entry.moodBefore || 0)), 0
      ) / entriesWithMood.length
    : 0;

  // Calculate consistency (days with meditation in the last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  });

  const meditationDays = new Set(
    completedEntries
      .filter(entry => new Date(entry.date) >= monthAgo)
      .map(entry => new Date(entry.date).toDateString())
  );

  const consistencyScore = (meditationDays.size / last30Days.length) * 100;

  const streak = calculateStreak(progressEntries);

  // Find favorite category (would need to be implemented based on session data)
  const favoriteCategory = 'Mindfulness'; // Placeholder

  return {
    totalSessions,
    totalMinutes,
    averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
    favoriteCategory,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    sessionsThisWeek,
    sessionsThisMonth,
    minutesThisWeek,
    minutesThisMonth,
    moodImprovement: Math.round(moodImprovement * 10) / 10,
    consistencyScore: Math.round(consistencyScore)
  };
};

export const getDailyRecommendation = (): string => {
  const recommendations = [
    "Start your morning with 5 minutes of mindful breathing",
    "Take a meditation break between meetings today",
    "Try a walking meditation during your lunch break",
    "End your day with a gratitude meditation",
    "Practice loving-kindness meditation for inner peace",
    "Use box breathing to center yourself",
    "Try a body scan to release physical tension",
    "Practice mindful eating during your next meal",
    "Take three deep breaths before starting any task",
    "Set an intention for your day through meditation"
  ];

  const today = new Date();
  const index = today.getDate() % recommendations.length;
  return recommendations[index];
};

export const getMotivationalQuote = (): { quote: string; author: string } => {
  const quotes = [
    {
      quote: "Meditation is not evasion; it is a serene encounter with reality.",
      author: "Thích Nhất Hạnh"
    },
    {
      quote: "The present moment is the only time over which we have dominion.",
      author: "Thích Nhất Hạnh"
    },
    {
      quote: "Wherever you are, be there totally.",
      author: "Eckhart Tolle"
    },
    {
      quote: "Meditation is the ultimate mobile device; you can use it anywhere, anytime, unobtrusively.",
      author: "Sharon Salzberg"
    },
    {
      quote: "Peace comes from within. Do not seek it without.",
      author: "Buddha"
    },
    {
      quote: "The mind is everything. What you think you become.",
      author: "Buddha"
    },
    {
      quote: "In the midst of winter, I found there was, within me, an invincible summer.",
      author: "Albert Camus"
    }
  ];

  const today = new Date();
  const index = today.getDate() % quotes.length;
  return quotes[index];
};

export const calculateMoodTrend = (moodEntries: MoodEntry[]): 'improving' | 'stable' | 'declining' => {
  if (moodEntries.length < 5) return 'stable';

  const recentEntries = moodEntries
    .filter(entry => entry.afterMeditation)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  if (recentEntries.length < 3) return 'stable';

  const recent = recentEntries.slice(0, 3).reduce((sum, entry) => sum + (entry.afterMeditation || 0), 0) / 3;
  const older = recentEntries.slice(3).reduce((sum, entry) => sum + (entry.afterMeditation || 0), 0) / (recentEntries.length - 3);

  const difference = recent - older;
  
  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
};

export const generateProgressInsight = (stats: MeditationStats): string => {
  const insights = [];

  if (stats.currentStreak >= 7) {
    insights.push(`Amazing! You've meditated for ${stats.currentStreak} days straight.`);
  } else if (stats.currentStreak >= 3) {
    insights.push(`Great job! You're building a consistent habit with ${stats.currentStreak} days in a row.`);
  }

  if (stats.moodImprovement > 1) {
    insights.push(`Your meditation practice is boosting your mood by an average of ${stats.moodImprovement} points.`);
  }

  if (stats.consistencyScore >= 80) {
    insights.push(`Excellent consistency! You've meditated on ${stats.consistencyScore}% of days this month.`);
  }

  if (stats.averageSessionLength >= 15) {
    insights.push(`You're building focus with an average session length of ${stats.averageSessionLength} minutes.`);
  }

  if (insights.length === 0) {
    insights.push("Keep going! Every meditation session contributes to your wellbeing.");
  }

  // Return the first insight (most relevant based on stats)
  return insights[0];
};

export const createMeditationReminder = (time: string, days: boolean[]): string => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const activeDays = days
    .map((active, index) => active ? dayNames[index] : null)
    .filter(Boolean);

  if (activeDays.length === 7) {
    return `Daily meditation reminder set for ${time}`;
  } else if (activeDays.length === 0) {
    return 'No meditation reminders set';
  } else {
    return `Meditation reminder set for ${activeDays.join(', ')} at ${time}`;
  }
};

export const getBreathingPatternTiming = (pattern: { inhale: number; hold1?: number; exhale: number; hold2?: number }) => {
  const { inhale, hold1, exhale, hold2 } = pattern;
  const totalCycleDuration = inhale + (hold1 || 0) + exhale + (hold2 || 0);
  
  return {
    totalCycleDuration,
    phases: [
      { name: 'Inhale', duration: inhale, type: 'inhale' },
      ...(hold1 ? [{ name: 'Hold', duration: hold1, type: 'hold' }] : []),
      { name: 'Exhale', duration: exhale, type: 'exhale' },
      ...(hold2 ? [{ name: 'Hold', duration: hold2, type: 'hold' }] : [])
    ]
  };
};