// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Plus, Calendar, Target, TrendingUp, Award, Bell, Filter, Search, X, CheckCircle as CheckCircleIcon, CalendarDays, BarChart3, ChevronLeft, ChevronRight, Edit, Trash2, LayoutGrid, List } from 'lucide-react';
import Header from '../../components/landing/Header';
import HabitCalendar from './HabitCalendar';
import { useTheme } from '../../contexts/ThemeContext';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard, StatCard, ChartCard } from '../../components/ui/GlassCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
import { useAuth } from '../../contexts/AuthContext';
import {
  useHabits,
  useMarkHabitComplete,
  useUnmarkHabitComplete,
  useDeleteHabit,
  useCreateHabit,
  useUpdateHabit,
  useHabitCategories,
  useUserHabitStatistics,
  useHabitCompletions,
  useIndividualHabitAnalytics,
  useHabitsWithCompletions
} from '../../hooks/habits/useHabits';
import { useTodayHabits } from '../../hooks/habits/useTodayHabits';
import { toast } from '../../components/ui/sonner';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationModal from '../../components/ui/confirmation-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { HabitHeader, HabitStats, HabitGrid, CategoryFilter, NotificationDropdown, HabitDashboardStats } from '../../components/habits';
import { HabitCard } from '../../components/habits/HabitCard';
import type { Notification, HabitTab, TimeRange, Habit } from '../../types/habits';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Timer,
  Flag,
  Today,
  CalendarMonth,
  Repeat,
  LocalFireDepartment,
  EmojiEvents,
  TrendingUp as TrendingUpIcon,
  Close,
  Warning as AlertCircle,
  Event,
  Timeline,
  Assessment
} from '@mui/icons-material';

// Types are imported from '../../types/habits'

// Habit Streaks content component
const HabitStreaksContent: React.FC<{ habits: Habit[] }> = ({ habits }) => {
  const { theme } = useTheme();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(habits[0] || null);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // Fetch analytics for the selected habit
  const { data: analytics, loading: analyticsLoading } = useIndividualHabitAnalytics(
    selectedHabit?.id || null,
    timeRange
  );

  // Fetch month analytics for the heatmap (always show last 30 days)
  const { data: heatmapAnalytics } = useIndividualHabitAnalytics(
    selectedHabit?.id || null,
    'month'
  );

  useEffect(() => {
    if (habits.length > 0 && !selectedHabit) {
      setSelectedHabit(habits[0]);
    }
  }, [habits.length]);

  // Generate heatmap data from analytics API or fallback
  const getHeatmapData = () => {
    // The API response may have data in different locations depending on the CamelCaseInterceptor
    // Try multiple paths to find the completion trend data
    const completionTrend =
      heatmapAnalytics?.completionTrend ??
      heatmapAnalytics?.completion_trend ??
      heatmapAnalytics?.data?.completionTrend ??
      heatmapAnalytics?.data?.completion_trend;

    // If analytics returned valid trend data with any completions, use it directly
    if (completionTrend && Array.isArray(completionTrend) && completionTrend.length > 0) {
      const hasAnyCompletions = completionTrend.some((item: any) => item.completions > 0);
      if (hasAnyCompletions) {
        return completionTrend;
      }
    }

    // Fallback: Generate heatmap for last 30 days using streak data
    // Use the habit's current streak to show completed days at the END (most recent)
    const habitCurrentStreak = selectedHabit?.currentStreak ?? selectedHabit?.current_streak ?? 0;

    const days = [];
    const today = new Date();

    // Build array from oldest (29 days ago) to newest (today)
    // Index 0 = oldest, Index 29 = today
    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().split('T')[0];

      // If the habit has a current streak, mark the most recent days as completed
      // dayOffset=0 is today, dayOffset=1 is yesterday, etc.
      // If streak=3, mark today (0), yesterday (1), day before (2) as completed
      let completions = 0;
      if (habitCurrentStreak > 0 && dayOffset < habitCurrentStreak) {
        completions = 1;
      }

      days.push({
        date: dateStr,
        completions
      });
    }

    return days;
  };

  const getChartData = () => {
    // Try multiple paths to find the completion trend data
    const completionTrend =
      analytics?.completionTrend ??
      analytics?.completion_trend ??
      analytics?.data?.completionTrend ??
      analytics?.data?.completion_trend;

    if (!completionTrend || !Array.isArray(completionTrend) || completionTrend.length === 0) {
      return null;
    }

    const labels: string[] = [];
    const data: number[] = [];

    if (timeRange === 'week' || timeRange === 'month') {
      // For week and month, use daily trend
      completionTrend.forEach((item: any) => {
        if (timeRange === 'week') {
          labels.push(item.day || new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }));
        } else {
          // For month, show date number
          const date = new Date(item.date);
          labels.push(date.getDate().toString());
        }
        data.push(item.completions || 0);
      });
    } else {
      // For year, use monthly trend
      completionTrend.forEach((item: any) => {
        labels.push(item.label || item.month);
        data.push(item.completions || 0);
      });
    }

    return labels.length > 0 ? { labels, data } : null;
  };

  const getActivityData = () => {
    // Try multiple paths to find the activity distribution data
    const activityDistribution =
      analytics?.activityDistribution ??
      analytics?.activity_distribution ??
      analytics?.data?.activityDistribution ??
      analytics?.data?.activity_distribution;

    if (!activityDistribution || !Array.isArray(activityDistribution) || activityDistribution.length === 0) {
      return null;
    }

    const labels: string[] = [];
    const data: number[] = [];

    if (timeRange === 'week') {
      // Show distribution by day of week
      activityDistribution.forEach((item: any) => {
        if (item.day) {
          labels.push(item.day.substring(0, 3)); // "Mon", "Tue", etc.
          data.push(item.completions || 0);
        }
      });
    } else if (timeRange === 'month') {
      // Show distribution by week
      activityDistribution.forEach((item: any) => {
        if (item.week) {
          labels.push(item.week);
          data.push(item.completions || 0);
        }
      });
    } else {
      // Show distribution by month
      activityDistribution.forEach((item: any) => {
        if (item.month) {
          labels.push(item.month.substring(0, 3)); // "Jan", "Feb", etc.
          data.push(item.completions || 0);
        }
      });
    }

    return labels.length > 0 ? { labels, data } : null;
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        }
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        },
        grid: {
          display: false
        }
      }
    }
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        }
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        },
        grid: {
          display: false
        }
      }
    }
  };

  const getSuccessRate = (habit: any) => {
    if (!habit) return 0;
    const createdAt = habit.createdAt ?? habit.created_at;
    const startDate = new Date(createdAt);
    const today = new Date();
    const totalDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (totalDays === 0) return 0;
    const totalCompletions = habit.totalCompletions ?? habit.total_completions ?? 0;
    return Math.round((totalCompletions / totalDays) * 100);
  };

  const getAchievementBadges = (habit: any) => {
    const badges = [];
    const currentStreak = habit.currentStreak ?? habit.current_streak ?? 0;
    const totalCompletions = habit.totalCompletions ?? habit.total_completions ?? 0;

    // First completion badge
    if (totalCompletions >= 1) badges.push({ name: 'First Step', icon: '🌱', color: 'bg-green-500' });
    // Streak badges
    if (currentStreak >= 3) badges.push({ name: '3-Day Streak', icon: '🔥', color: 'bg-orange-400' });
    if (currentStreak >= 7) badges.push({ name: 'Week Warrior', icon: '🗓️', color: 'bg-blue-500' });
    if (currentStreak >= 30) badges.push({ name: 'Monthly Master', icon: '📅', color: 'bg-purple-500' });
    if (currentStreak >= 100) badges.push({ name: 'Century Champion', icon: '💯', color: 'bg-yellow-500' });
    // Completion count badges
    if (totalCompletions >= 5) badges.push({ name: 'Getting Started', icon: '⭐', color: 'bg-cyan-500' });
    if (totalCompletions >= 10) badges.push({ name: 'Dedicated', icon: '💪', color: 'bg-indigo-500' });
    if (totalCompletions >= 50) badges.push({ name: 'Consistent', icon: '🏅', color: 'bg-amber-500' });
    // Success rate badge
    if (getSuccessRate(habit) >= 80) badges.push({ name: 'High Achiever', icon: '🏆', color: 'bg-orange-500' });

    return badges;
  };

  return (
    <div className="space-y-8">
      {/* Habit Selector */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Select a Habit for Detailed Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map(habit => (
            <GlassCard
              key={habit.id}
              onClick={() => setSelectedHabit(habit)}
              className={`cursor-pointer ${
                selectedHabit?.id === habit.id ? 'ring-2 ring-teal-400' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <h4 className="font-semibold text-white">
                    {habit.name}
                  </h4>
                </div>
                <LocalFireDepartment className="h-5 w-5 text-orange-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Current Streak</span>
                  <span className="font-medium text-white">{habit.current_streak || 0} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Success Rate</span>
                  <span className="font-medium text-white">{getSuccessRate(habit)}%</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Analytics Dashboard */}
      {selectedHabit && (
        <>
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4" style={{ borderLeftColor: selectedHabit.color }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Current Streak</p>
                    <p className="text-3xl font-bold text-white">
                      {selectedHabit.currentStreak ?? selectedHabit.current_streak ?? 0}
                    </p>
                    <p className="text-xs text-white/40 mt-1">days</p>
                  </div>
                  <LocalFireDepartment className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Longest Streak</p>
                    <p className="text-3xl font-bold text-white">
                      {selectedHabit.bestStreak ?? selectedHabit.best_streak ?? 0}
                    </p>
                    <p className="text-xs text-white/40 mt-1">days</p>
                  </div>
                  <EmojiEvents className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Times Completed</p>
                    <p className="text-3xl font-bold text-white">
                      {selectedHabit.totalCompletions ?? selectedHabit.total_completions ?? 0}
                    </p>
                    <p className="text-xs text-white/40 mt-1">for this habit</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Success Rate</p>
                    <p className="text-3xl font-bold text-white">
                      {getSuccessRate(selectedHabit)}%
                    </p>
                    <Progress
                      value={getSuccessRate(selectedHabit)}
                      className="mt-2"
                    />
                  </div>
                  <TrendingUpIcon className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Range Selector */}
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              {selectedHabit.name} Analytics
            </h3>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map(range => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  onClick={() => setTimeRange(range)}
                  className={`rounded-xl capitalize ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completion Chart */}
            <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Timeline className="h-5 w-5 text-teal-400" />
                  Completion Trend
                </CardTitle>
                <CardDescription className="text-white/60">
                  Your habit completion over {timeRange === 'week' ? 'the last week' : timeRange === 'month' ? 'the last month' : 'the last year'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                  </div>
                ) : getChartData() ? (
                  <Line
                    data={{
                      labels: getChartData()!.labels,
                      datasets: [{
                        label: 'Completions',
                        data: getChartData()!.data,
                        borderColor: selectedHabit.color,
                        backgroundColor: selectedHabit.color + '20',
                        fill: true,
                        tension: 0.4
                      }]
                    }}
                    options={lineChartOptions}
                  />
                ) : (
                  <div className="text-center py-8 text-white/40">No data available</div>
                )}
              </CardContent>
            </Card>

            {/* Activity Distribution */}
            <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Assessment className="h-5 w-5 text-teal-400" />
                  Activity Distribution
                </CardTitle>
                <CardDescription className="text-white/60">
                  Completion frequency analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                  </div>
                ) : getActivityData() ? (
                  <Bar
                    data={{
                      labels: getActivityData()!.labels,
                      datasets: [{
                        label: 'Completions',
                        data: getActivityData()!.data,
                        backgroundColor: selectedHabit.color + '80',
                        borderColor: selectedHabit.color,
                        borderWidth: 2
                      }]
                    }}
                    options={barChartOptions}
                  />
                ) : (
                  <div className="text-center py-8 text-white/40">No data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Award className="h-5 w-5 text-teal-400" />
                Achievements
              </CardTitle>
              <CardDescription className="text-white/60">
                Badges earned for this habit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {getAchievementBadges(selectedHabit).map((badge, index) => (
                  <div
                    key={index}
                    className={`${badge.color} text-white px-4 py-3 rounded-xl flex items-center gap-2`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="font-medium">{badge.name}</span>
                  </div>
                ))}
                {getAchievementBadges(selectedHabit).length === 0 && (
                  <p className="text-white/60">
                    Keep going! Achievements will appear as you progress.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Completion Calendar Heatmap */}
          <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CalendarMonth className="h-5 w-5 text-teal-400" />
                Completion Heatmap
              </CardTitle>
              <CardDescription className="text-white/60">
                Visual representation of your habit consistency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-1">
                    {getHeatmapData().map((item: any, index: number) => {
                      const isCompleted = item.completions > 0;
                      const date = new Date(item.date);

                      return (
                        <div
                          key={index}
                          className={`aspect-square rounded ${
                            isCompleted
                              ? 'bg-teal-500'
                              : 'bg-white/10'
                          }`}
                          title={`${date.toLocaleDateString()}: ${item.completions} completion(s)`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-teal-500 rounded" />
                        <span>Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white/10 rounded" />
                        <span>Missed</span>
                      </div>
                    </div>
                    <p className="text-xs text-white/40">
                      Last {getHeatmapData().length} days
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// Calendar content component with real API data
const HabitCalendarContent: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [calendarDays, setCalendarDays] = useState<any[]>([]);

  // Calculate start and end dates for the calendar view
  const { startDateStr, endDateStr } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);

    // Adjust to start from Monday
    const startDayOfWeek = startDate.getDay();
    const daysToSubtract = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Adjust to end on Sunday
    const endDayOfWeek = endDate.getDay();
    const daysToAdd = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
    endDate.setDate(endDate.getDate() + daysToAdd);

    return {
      startDateStr: startDate.toISOString().split('T')[0],
      endDateStr: endDate.toISOString().split('T')[0]
    };
  }, [currentDate]);

  // Fetch habits with completions for the current month view
  const { habits, completionsByHabitAndDate, loading } = useHabitsWithCompletions(startDateStr, endDateStr);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, habits, completionsByHabitAndDate]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);

    // Adjust to start from Monday
    const startDayOfWeek = startDate.getDay();
    const daysToSubtract = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Adjust to end on Sunday
    const endDayOfWeek = endDate.getDay();
    const daysToAdd = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
    endDate.setDate(endDate.getDate() + daysToAdd);

    const days: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDay = new Date(d);

      // Find habits scheduled for this day
      const dayHabits = habits.filter(habit => isDateInHabitRange(currentDay, habit));

      days.push({
        date: new Date(currentDay),
        habits: dayHabits,
        isToday: currentDay.getTime() === today.getTime(),
        isCurrentMonth: currentDay.getMonth() === month
      });
    }

    setCalendarDays(days);
  };

  const isDateInHabitRange = (date: Date, habit: any) => {
    const habitStart = new Date(habit.start_date || habit.created_at || Date.now());
    habitStart.setHours(0, 0, 0, 0);

    if (date < habitStart) return false;

    if (habit.end_date) {
      const habitEnd = new Date(habit.end_date);
      habitEnd.setHours(0, 0, 0, 0);
      if (date > habitEnd) return false;
    }

    // Check frequency type (use camelCase with fallback to snake_case)
    const frequencyType = habit.frequencyType ?? habit.frequency_type;
    const weeklyDays = habit.weeklyDays ?? habit.weekly_days;
    const monthlyDay = habit.monthlyDay ?? habit.monthly_day;

    if (frequencyType === 'daily') {
      return true;
    } else if (frequencyType === 'weekly' && weeklyDays) {
      const dayOfWeek = date.getDay();
      return weeklyDays[dayOfWeek] === 1;
    } else if (frequencyType === 'monthly' && monthlyDay) {
      return date.getDate() === monthlyDay;
    }

    return true;
  };

  const isHabitCompleted = (habit: any, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const completionDates = completionsByHabitAndDate.get(habit.id);
    return completionDates?.has(dateStr) || false;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getCompletionRate = (day: any) => {
    if (day.habits.length === 0) return 0;
    const completed = day.habits.filter((h: any) => isHabitCompleted(h, day.date)).length;
    return Math.round((completed / day.habits.length) * 100);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendar Section */}
      <div className="lg:col-span-2">
        <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-2xl font-bold text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDate(new Date());
                }}
                className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Today className="h-4 w-4 mr-2" />
                Today
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-semibold text-white/60 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const completionRate = getCompletionRate(day);
                const isSelected = selectedDate?.toDateString() === day.date.toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`min-h-[100px] p-2 rounded-xl border cursor-pointer transition-all ${
                      day.isToday
                        ? 'border-teal-400 bg-teal-500/20'
                        : isSelected
                        ? 'border-teal-400/50 bg-teal-500/10'
                        : day.isCurrentMonth
                        ? 'border-white/20 hover:border-teal-400/30 bg-white/5'
                        : 'border-white/10 opacity-50 bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-medium ${
                        day.isToday
                          ? 'text-teal-300'
                          : day.isCurrentMonth
                          ? 'text-white'
                          : 'text-white/40'
                      }`}>
                        {day.date.getDate()}
                      </span>
                      {day.habits.length > 0 && (
                        <Badge
                          variant={completionRate === 100 ? 'default' : 'secondary'}
                          className={`text-xs h-5 ${completionRate === 100 ? 'bg-gradient-to-r from-teal-500 to-cyan-500' : 'bg-white/10 text-white/70'}`}
                        >
                          {completionRate}%
                        </Badge>
                      )}
                    </div>

                    {/* Habit Dots */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {day.habits.slice(0, 4).map((habit: any, hIdx: number) => (
                        <div
                          key={hIdx}
                          className={`w-2 h-2 rounded-full ${
                            isHabitCompleted(habit, day.date) ? 'ring-2 ring-white/50' : 'opacity-50'
                          }`}
                          style={{ backgroundColor: habit.color }}
                          title={habit.name}
                        />
                      ))}
                      {day.habits.length > 4 && (
                        <span className="text-xs text-white/40">+{day.habits.length - 4}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Day Details */}
      <div className='sticky top-4'>
        <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Event className="h-5 w-5 text-teal-400" />
              {selectedDate ? (
                <>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </>
              ) : 'Select a Date'}
            </CardTitle>
            <CardDescription className="text-white/60">
              {selectedDate && calendarDays.find(d => d.date.toDateString() === selectedDate.toDateString())?.habits.length || 0} habits scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate && (
              <div className="space-y-3">
                {calendarDays
                  .find(d => d.date.toDateString() === selectedDate.toDateString())
                  ?.habits.map((habit: any) => {
                    const isCompleted = isHabitCompleted(habit, selectedDate);
                    return (
                      <div
                        key={habit.id}
                        className="p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: habit.color }}
                              />
                              <h4 className="font-medium text-white">
                                {habit.name}
                              </h4>
                            </div>
                            <p className="text-sm text-white/60">
                              {habit.reminderTime ?? habit.reminder_time ?? 'No time set'} • {habit.category || 'Uncategorized'}
                            </p>
                            <p className="text-xs text-white/40 mt-1">
                              Target: {habit.targetValue ?? habit.target_value ?? habit.targetCount ?? habit.target_count ?? 1} {habit.targetUnit ?? habit.target_unit ?? 'times'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={isCompleted ? 'text-emerald-400' : 'text-white/40 hover:text-white'}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <RadioButtonUnchecked className="h-6 w-6" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                {(!calendarDays.find(d => d.date.toDateString() === selectedDate.toDateString())?.habits.length) && (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60">
                      No habits scheduled for this day
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const HabitPlanner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  // Use the today habits hook for managing habits and completions
  const {
    habits,
    completedToday,
    completionsByHabit,
    progressByHabit,
    toggleHabitCompletion: toggleHabit,
    updateHabitProgress,
    loading,
    error,
    refetch: refetchHabits
  } = useTodayHabits();
  
  // Fetch user statistics
  const { data: userStats } = useUserHabitStatistics();
  
  // Fetch available categories
  const { data: categories } = useHabitCategories();
  
  const deleteHabitMutation = useDeleteHabit();
  
  // Get initial tab from URL params, default to 'dashboard'
  const getInitialTab = (): HabitTab => {
    const tab = searchParams.get('tab');
    const validTabs: HabitTab[] = ['dashboard', 'calendar', 'streaks'];
    return validTabs.includes(tab as HabitTab) ? tab as HabitTab : 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState<HabitTab>(getInitialTab());
  
  // Function to change tab and update URL
  const changeTab = (tab: HabitTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Sync tab with URL changes (browser back/forward)
  useEffect(() => {
    const currentTab = getInitialTab();
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list view like Habitify

  // Mutation hook for quick inline updates
  const updateHabitMutation = useUpdateHabit();

  // Confirmation modal hook
  const confirmation = useConfirmation();

  // Use categories from API, add 'all' option at the beginning
  const categoryOptions = ['all', ...(categories || [])];
  
  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (habit.description && habit.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || habit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Use the toggleHabit function from useTodayHabits hook with toast feedback
  const toggleHabitCompletion = async (habitId: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      const isCompleted = completedToday.includes(habitId);

      await toggleHabit(habitId);

      if (habit) {
        if (isCompleted) {
          toast.info(`"${habit.name}" marked as incomplete`);
        } else {
          toast.success(`"${habit.name}" completed! 🎉`);
        }
      }
    } catch (error) {
      console.error('Failed to toggle habit completion:', error);
      toast.error('Failed to update habit. Please try again.');
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Habit',
      message: `Are you sure you want to delete "${habit?.name || 'this habit'}"? This action cannot be undone and all progress will be lost.`,
      confirmText: 'Delete Habit',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (confirmed) {
      try {
        await deleteHabitMutation.mutate(habitId);
        // Refetch habits after deletion
        await refetchHabits();
        toast.success('Habit deleted successfully!');
      } catch (error) {
        console.error('Failed to delete habit:', error);
        toast.error('Failed to delete habit. Please try again.');
      }
    }
  };

  // Quick inline update handler for habit name
  const handleQuickUpdate = async (habitId: string, data: { name?: string }) => {
    try {
      await updateHabitMutation.mutate({ id: habitId, ...data });
      await refetchHabits();
      toast.success('Habit updated!');
    } catch (error) {
      console.error('Failed to update habit:', error);
      toast.error('Failed to update habit. Please try again.');
      throw error; // Re-throw so HabitCard can handle it
    }
  };

  // Handler for updating progress on measurable habits
  const handleProgressUpdate = async (habitId: string, value: number) => {
    try {
      await updateHabitProgress(habitId, value);
      const habit = habits.find(h => h.id === habitId);
      const habitTargetValue = habit?.targetValue ?? habit?.target_value;
      if (habit && habitTargetValue && value >= habitTargetValue) {
        toast.success(`"${habit.name}" completed! 🎉`);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress. Please try again.');
      throw error;
    }
  };

  // Notification functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-white/60 bg-white/10';
    }
  };

  const todayProgress = completedToday.length;
  const totalHabitsToday = habits.filter(h => {
    // For now, count all daily habits as today's habits
    // You can add more sophisticated logic based on frequency
    const frequencyType = h.frequencyType ?? h.frequency_type;
    return frequencyType === 'daily';
  }).length;

  // Calculate total completions across all habits
  const totalAllTimeCompletions = habits.reduce((sum, h) => {
    return sum + (h.totalCompletions ?? h.total_completions ?? 0);
  }, 0);
  const progressPercentage = totalHabitsToday > 0 ? (todayProgress / totalHabitsToday) * 100 : 0;

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <div className="relative z-10">
      <Header />

      {/* Navigation Tabs */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => changeTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'border-teal-400 text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                <Target className="h-4 w-4" />
                Dashboard
              </button>
              <button
                onClick={() => changeTab('calendar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'calendar'
                    ? 'border-teal-400 text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                Calendar View
              </button>
              <button
                onClick={() => changeTab('streaks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'streaks'
                    ? 'border-teal-400 text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Streaks & Stats
              </button>
            </div>
            <Button
              onClick={() => navigate('/habit-planner/add')}
              className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Habit
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
            <span className="ml-4 text-lg text-white">Loading habits...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <X className="h-5 w-5 text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-red-300">Error loading habits</h4>
                <p className="text-sm text-red-400/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Not Authenticated */}
        {!isAuthenticated && (
          <Card className="rounded-2xl p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex flex-col items-center">
              <Target className="h-16 w-16 text-white/20 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Please log in
              </h3>
              <p className="text-white/60 mb-6">
                You need to be logged in to access your habits.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              >
                Go to Login
              </Button>
            </div>
          </Card>
        )}

        {/* Dashboard Tab */}
        {/* Show loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
              <p className="text-white/60">Loading habits...</p>
            </div>
          </div>
        )}

        {/* Show error state */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400">Error loading habits: {error}</p>
          </div>
        )}
        
        {/* Show dashboard when loaded */}
        {activeTab === 'dashboard' && isAuthenticated && !loading && (
          <>
        {/* Header Section */}
        <div className="mb-8 p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Build Better Habits 🎯
          </h1>
          <p className="text-lg text-white/60">
            Track your daily habits and build consistency for a better life
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Progress"
            value={`${todayProgress}/${totalHabitsToday}`}
            icon={<Today className="h-6 w-6" />}
            color="from-teal-500 to-cyan-500"
            subtitle={<Progress value={progressPercentage} className="mt-2 bg-white/20" />}
          />

          <StatCard
            title="Active Habits"
            value={habits.length}
            icon={<CheckCircle className="h-6 w-6" />}
            color="from-emerald-500 to-teal-500"
          />

          <StatCard
            title="Best Streak"
            value={`${Math.max(...habits.map(h => h.bestStreak ?? h.best_streak ?? 0), 0)} days`}
            icon={<LocalFireDepartment className="h-6 w-6" />}
            color="from-orange-500 to-red-500"
          />

          <StatCard
            title="All-Time Completions"
            value={totalAllTimeCompletions}
            icon={<EmojiEvents className="h-6 w-6" />}
            color="from-purple-500 to-pink-500"
            subtitle="across all habits"
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-3 w-full justify-end mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search habits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl text-white"
          >
            {categoryOptions.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900">
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          {/* View Toggle */}
          <div className="flex rounded-xl border border-white/20 overflow-hidden bg-white/10 backdrop-blur-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Habits Grid */}
        {filteredHabits.length === 0 ? (
          <Card className="rounded-2xl p-8 text-center bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex flex-col items-center justify-center">
              <Target className="h-12 w-12 text-white/20 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No habits yet
              </h3>
              <p className="text-white/60 mb-4">
                {habits.length === 0
                  ? "Start building better habits by creating your first one!"
                  : `No habits match your current filters. Total habits: ${habits.length}`}
              </p>
              <Button
                onClick={() => navigate('/habit-planner/add')}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Habit
              </Button>
            </div>
          </Card>
        ) : (
          viewMode === 'list' ? (
            /* List View - Habitify style */
            <div className="space-y-0">
              {filteredHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={completedToday.includes(habit.id)}
                  currentProgress={progressByHabit.get(habit.id) || 0}
                  todayCompletion={completionsByHabit.get(habit.id) || null}
                  onToggleComplete={(habitId, isCompleted) => toggleHabitCompletion(habitId)}
                  onUpdateProgress={handleProgressUpdate}
                  onEdit={(habitId) => navigate(`/habit-planner/edit/${habitId}`)}
                  onDelete={(habitId) => handleDeleteHabit(habitId)}
                  onQuickUpdate={handleQuickUpdate}
                  compact={true}
                />
              ))}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={completedToday.includes(habit.id)}
                  currentProgress={progressByHabit.get(habit.id) || 0}
                  todayCompletion={completionsByHabit.get(habit.id) || null}
                  onToggleComplete={(habitId, isCompleted) => toggleHabitCompletion(habitId)}
                  onUpdateProgress={handleProgressUpdate}
                  onEdit={(habitId) => navigate(`/habit-planner/edit/${habitId}`)}
                  onDelete={(habitId) => handleDeleteHabit(habitId)}
                  onQuickUpdate={handleQuickUpdate}
                  compact={false}
                />
              ))}
            </div>
          )
        )}

        {isAuthenticated && !loading && !error && filteredHabits.length === 0 && habits.length > 0 && (
          <Card className="rounded-2xl p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex flex-col items-center">
              <Target className="h-16 w-16 text-white/20 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No habits found
              </h3>
              <p className="text-white/60 mb-6">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start building better habits today!'}
              </p>
              <Button
                onClick={() => navigate('/habit-planner/add')}
                className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Habit
              </Button>
            </div>
          </Card>
        )}
          </>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && isAuthenticated && !loading && (
          <div className="space-y-6">
            <HabitCalendarContent />
          </div>
        )}

        {/* Streaks & Stats Tab */}
        {activeTab === 'streaks' && isAuthenticated && !loading && (
          <HabitStreaksContent habits={habits} />
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
      </div>
    </div>
  );
};

export default HabitPlanner;