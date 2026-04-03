/**
 * Sleep tracking type definitions
 */

// Enums/Types
export type NoiseLevel = 'silent' | 'quiet' | 'moderate' | 'loud';
export type LightLevel = 'dark' | 'dim' | 'moderate' | 'bright';
export type TemperatureComfort = 'cold' | 'cool' | 'comfortable' | 'warm' | 'hot';
export type MoodBefore = 'relaxed' | 'anxious' | 'tired' | 'energetic' | 'stressed' | 'neutral';
export type MoodAfter = 'refreshed' | 'tired' | 'groggy' | 'energetic' | 'neutral';
export type SoundType = 'gentle' | 'nature' | 'classic' | 'energetic';
export type NotificationType = 'push' | 'silent' | 'sound';
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

// Sleep Disturbance
export interface SleepDisturbance {
  time: string;
  reason: string;
  duration?: number;
}

// Sleep Log
export interface SleepLog {
  id: string;
  userId: string;
  sleepDate: string;
  bedtime: string;
  wakeTime: string;
  sleepLatencyMinutes?: number;
  actualSleepMinutes?: number;
  timeInBedMinutes?: number;
  qualityScore?: number;
  efficiencyPercentage?: number;
  disturbances?: SleepDisturbance[];
  wokeUpCount?: number;
  noiseLevel?: NoiseLevel;
  lightLevel?: LightLevel;
  temperatureComfort?: TemperatureComfort;
  environmentScore?: number;
  moodBefore?: MoodBefore;
  moodAfter?: MoodAfter;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSleepLogRequest {
  sleepDate: string;
  bedtime: string;
  wakeTime: string;
  sleepLatencyMinutes?: number;
  actualSleepMinutes?: number;
  timeInBedMinutes?: number;
  wokeUpCount?: number;
  disturbances?: SleepDisturbance[];
  noiseLevel?: NoiseLevel;
  lightLevel?: LightLevel;
  temperatureComfort?: TemperatureComfort;
  moodBefore?: MoodBefore;
  moodAfter?: MoodAfter;
  notes?: string;
  tags?: string[];
}

export interface UpdateSleepLogRequest extends Partial<CreateSleepLogRequest> {}

export interface SleepLogQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  minQuality?: number;
  maxQuality?: number;
  sortBy?: 'sleepDate' | 'qualityScore' | 'actualSleepMinutes' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Sleep Goals
export interface SleepGoal {
  id: string;
  userId: string;
  targetDurationMinutes: number;
  targetBedtime?: string;
  targetWakeTime?: string;
  targetQualityScore: number;
  targetEfficiency: number;
  weekdaySchedule?: Record<string, any>;
  weekendSchedule?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSleepGoalRequest {
  targetDurationMinutes?: number;
  targetBedtime?: string;
  targetWakeTime?: string;
  targetQualityScore?: number;
  targetEfficiency?: number;
  weekdaySchedule?: Record<string, any>;
  weekendSchedule?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateSleepGoalRequest extends Partial<CreateSleepGoalRequest> {}

export interface SleepGoalProgress {
  currentAverageDuration: number;
  targetDuration: number;
  durationProgress: number;
  currentAverageQuality: number;
  targetQuality: number;
  qualityProgress: number;
  currentAverageEfficiency: number;
  targetEfficiency: number;
  efficiencyProgress: number;
  daysLogged: number;
  targetDays: number;
  streakDays: number;
}

// Sleep Alarms
export interface SleepAlarm {
  id: string;
  userId: string;
  name?: string;
  wakeWindowStart: string;
  wakeWindowEnd: string;
  optimalWakeTime?: string;
  daysActive: DayOfWeek[];
  isSmartAlarm: boolean;
  gradualVolume: boolean;
  snoozeEnabled: boolean;
  snoozeDurationMinutes: number;
  maxSnoozes: number;
  soundType: SoundType;
  vibrationEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSleepAlarmRequest {
  name?: string;
  wakeWindowStart: string;
  wakeWindowEnd: string;
  daysActive?: DayOfWeek[];
  isSmartAlarm?: boolean;
  gradualVolume?: boolean;
  snoozeEnabled?: boolean;
  snoozeDurationMinutes?: number;
  maxSnoozes?: number;
  soundType?: SoundType;
  vibrationEnabled?: boolean;
  isActive?: boolean;
}

export interface UpdateSleepAlarmRequest extends Partial<CreateSleepAlarmRequest> {}

export interface OptimalWakeTime {
  optimalWakeTime: string;
  cycles: number;
  sleepDurationMinutes: number;
  sleepDurationFormatted: string;
  alternativeWakeTimes: string[];
}

// Bedtime Reminders
export interface BedtimeReminder {
  id: string;
  userId: string;
  name?: string;
  reminderTime: string;
  advanceNoticeMinutes: number;
  daysActive: DayOfWeek[];
  windDownSuggestions: string[];
  notificationType: NotificationType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBedtimeReminderRequest {
  name?: string;
  reminderTime: string;
  advanceNoticeMinutes?: number;
  daysActive?: DayOfWeek[];
  windDownSuggestions?: string[];
  notificationType?: NotificationType;
  isActive?: boolean;
}

export interface UpdateBedtimeReminderRequest extends Partial<CreateBedtimeReminderRequest> {}

// Sleep Summary
export interface DailyTrend {
  date: string;
  qualityScore: number;
  duration: number;
}

export interface SleepSummary {
  totalLogs: number;
  averageSleepMinutes: number;
  averageQualityScore: number;
  averageEfficiency: number;
  averageWakeUps: number;
  bestSleepDuration: number;
  bestQualityScore: number;
  worstSleepDuration: number;
  worstQualityScore: number;
  moodDistribution: Record<string, number>;
  dailyTrends: DailyTrend[];
}

export interface SleepSummaryQueryParams {
  period?: 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

// API Responses
export interface PaginatedSleepLogs {
  data: SleepLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Utility types for quality score colors
export function getQualityScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

export function getQualityScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

export function formatSleepDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
