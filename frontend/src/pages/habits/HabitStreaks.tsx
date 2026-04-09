// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Moon, Sun, ChevronLeft, TrendingUp, Award, Calendar, X, CheckCircle as CheckCircleIcon, Bell } from 'lucide-react';
import Icon from '@mdi/react';
import { mdiBell } from '@mdi/js';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard, StatCard, ChartCard } from '../../components/ui/GlassCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { NotificationDropdown } from '../../components/habits';
import type { Notification, TimeRange } from '../../types/habits';
import { useHabits, useHabit, useHabitCompletions, type Habit } from '../../hooks/habits/useHabits';
import {
  BarChart,
  LocalFireDepartment,
  EmojiEvents,
  CheckCircle,
  Timeline,
  CalendarMonth,
  Assessment,
  TrendingUp as TrendingUpIcon,
  Close,
  Warning as AlertCircle
} from '@mui/icons-material';
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

// Using types from '../../types/habits'

// Extend Habit type to include completedDates and stats for streaks tracking
interface HabitWithStats extends Habit {
  completedDates: string[];
  totalDays: number;
  completedCount: number;
}

const HabitStreaks: React.FC = () => {
  const navigate = useNavigate();
  const { habitId } = useParams();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { data: habitsData, loading: habitsLoading, error: habitsError } = useHabits({ is_active: true });
  const { data: selectedHabitData, loading: habitLoading, error: habitError } = useHabit(habitId || null);
  const { data: completionsData } = useHabitCompletions(habitId || '', {
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<HabitWithStats | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Process habits data from API
    if (habitsData?.data && Array.isArray(habitsData.data)) {
      const habitsArray = habitsData.data as Habit[];
      const habitsWithStats = habitsArray.map((h: Habit) => {
        const startDate = new Date(h.created_at || Date.now());
        const today = new Date();
        const totalDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const completedDates = getCompletedDatesPlaceholder();
        return {
          ...h,
          totalDays,
          completedDates,
          completedCount: h.total_completions || completedDates.length
        } as HabitWithStats;
      });
      setHabits(habitsWithStats);
    }
  }, [habitsData]);

  useEffect(() => {
    // If specific habit ID is provided, select it
    if (habitId && selectedHabitData) {
      const startDate = new Date(selectedHabitData.created_at || Date.now());
      const today = new Date();
      const totalDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const completedDates = (completionsData?.data && Array.isArray(completionsData.data))
        ? completionsData.data.map((c: any) => c.completed_date)
        : getCompletedDatesPlaceholder();
      
      setSelectedHabit({
        ...selectedHabitData,
        totalDays,
        completedDates,
        completedCount: selectedHabitData.total_completions || completedDates.length
      } as HabitWithStats);
    } else if (habits.length > 0 && !selectedHabit && !habitId) {
      setSelectedHabit(habits[0]);
    }
  }, [habitId, selectedHabitData, completionsData, habits]);

  // Initialize notifications - data should come from API
  useEffect(() => {
    setNotifications([]);
  }, []);

  // Handle clicks outside of notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get completed dates - returns empty array as placeholder when API data is not available
  const getCompletedDatesPlaceholder = () => {
    return [];
  };

  // Notification functions
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const formatNotificationTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getChartData = (habit: HabitWithStats) => {
    if (!habit.completedDates) return null;

    const today = new Date();
    let labels: string[] = [];
    let data: number[] = [];

    if (timeRange === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        data.push(habit.completedDates.includes(dateStr) ? 1 : 0);
      }
    } else if (timeRange === 'month') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        labels.push(date.getDate().toString());
        data.push(habit.completedDates.includes(dateStr) ? 1 : 0);
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
        labels.push(monthStr);
        
        // Count completions in this month
        const monthCompletions = habit.completedDates.filter(d => {
          const dateObj = new Date(d);
          return dateObj.getMonth() === date.getMonth() && 
                 dateObj.getFullYear() === date.getFullYear();
        }).length;
        
        data.push(monthCompletions);
      }
    }

    return { labels, data };
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

  const getSuccessRate = (habit: HabitWithStats) => {
    if (!habit.totalDays || habit.totalDays === 0) return 0;
    return Math.round((habit.completedCount / habit.totalDays) * 100);
  };

  const getAchievementBadges = (habit: HabitWithStats) => {
    const badges = [];
    
    if (habit.current_streak >= 7) badges.push({ name: 'Week Warrior', icon: '🗓️', color: 'bg-blue-500' });
    if (habit.current_streak >= 30) badges.push({ name: 'Monthly Master', icon: '📅', color: 'bg-purple-500' });
    if (habit.current_streak >= 100) badges.push({ name: 'Century Champion', icon: '💯', color: 'bg-yellow-500' });
    if (habit.completedCount >= 50) badges.push({ name: 'Consistent', icon: '⭐', color: 'bg-green-500' });
    if (getSuccessRate(habit) >= 80) badges.push({ name: 'High Achiever', icon: '🏆', color: 'bg-orange-500' });
    
    return badges;
  };

  // Show loading state while fetching data
  if (habitsLoading || (habitId && habitLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading habit streaks...</p>
        </div>
      </div>
    );
  }

  // Show error state if failed to fetch
  if (habitsError || habitError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to load habits</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{habitsError || habitError || 'Unable to fetch habit data'}</p>
          <Button onClick={() => navigate('/habit-planner')} className="rounded-xl">
            Back to Habit Planner
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <div className="relative z-10">
      <header className="bg-white/10 backdrop-blur-xl shadow-sm border-b border-white/20">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/habit-planner')}
                className="mr-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <BarChart className="h-6 w-6 text-teal-400" />
              <span className="text-xl font-semibold text-white">
                Habit Streaks & Analytics
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="View notifications"
                  className="relative"
                >
                  <Icon path={mdiBell} size={0.8} />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="fixed inset-0 z-50" onClick={() => setShowNotifications(false)}>
                    <div className="absolute top-16 right-4 w-80" onClick={(e) => e.stopPropagation()}>
                      <Card className="p-0 bg-card border shadow-lg">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                          <div className="flex items-center gap-2">
                            <Icon path={mdiBell} size={0.8} style={{ color: 'rgb(71, 189, 255)' }} />
                            <h3 className="font-semibold text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {notifications.length > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={markAllNotificationsAsRead}
                                className="text-xs h-6 px-2"
                              >
                                Mark all read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowNotifications(false)}
                              className="h-6 w-6 p-0"
                            >
                              <Close className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Notification List */}
                        <div className="max-h-[400px] overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b hover:bg-muted/50 transition-colors ${
                                  !notification.isRead ? 'bg-primary/5' : ''
                                }`}
                              >
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-sm text-foreground">
                                        {notification.title}
                                      </h4>
                                      {notification.priority === 'high' && (
                                        <Badge variant="destructive" className="text-xs h-4">
                                          High
                                        </Badge>
                                      )}
                                      {notification.type === 'reminder' && <Bell className="h-3 w-3 text-blue-500" />}
                                      {notification.type === 'streak' && <LocalFireDepartment className="h-3 w-3 text-orange-500" />}
                                      {notification.type === 'achievement' && <EmojiEvents className="h-3 w-3 text-yellow-500" />}
                                      {notification.type === 'miss' && <AlertCircle className="h-3 w-3 text-red-500" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">
                                        {formatNotificationTime(notification.timestamp)}
                                      </span>
                                      <div className="flex gap-1">
                                        {!notification.isRead && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => markNotificationAsRead(notification.id)}
                                            className="h-5 px-2 text-xs"
                                          >
                                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                                            Read
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => dismissNotification(notification.id)}
                                          className="h-5 px-2 text-xs hover:text-destructive"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center">
                              <Icon path={mdiBell} size={1.5} className="text-muted-foreground/50 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground">No notifications</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div className="p-3 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllNotifications}
                              className="w-full text-xs hover:text-destructive"
                            >
                              Clear all notifications
                            </Button>
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Habit Selector */}
        {!habitId && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Select a Habit</h2>
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
                      <h3 className="font-semibold text-white">
                        {habit.name}
                      </h3>
                    </div>
                    <LocalFireDepartment className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Current Streak</span>
                      <span className="font-medium text-white">{habit.current_streak} days</span>
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
        )}

        {/* Analytics Dashboard */}
        {(selectedHabit || habitId) && selectedHabit && (
          <>
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Current Streak"
                value={`${selectedHabit.current_streak}`}
                subtitle="days"
                icon={<LocalFireDepartment className="h-8 w-8" />}
                color="from-orange-500 to-red-500"
              />

              <StatCard
                title="Longest Streak"
                value={`${selectedHabit.best_streak || 0}`}
                subtitle="days"
                icon={<EmojiEvents className="h-8 w-8" />}
                color="from-emerald-500 to-teal-500"
              />

              <StatCard
                title="Total Completed"
                value={`${selectedHabit.completedCount}`}
                subtitle="times"
                icon={<CheckCircle className="h-8 w-8" />}
                color="from-blue-500 to-cyan-500"
              />

              <StatCard
                title="Success Rate"
                value={`${getSuccessRate(selectedHabit)}%`}
                subtitle={<Progress value={getSuccessRate(selectedHabit)} className="mt-2 bg-white/20" />}
                icon={<TrendingUpIcon className="h-8 w-8" />}
                color="from-purple-500 to-pink-500"
              />
            </div>

            {/* Time Range Selector */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedHabit.name} Analytics
              </h2>
              <div className="flex gap-2">
                {(['week', 'month', 'year'] as const).map(range => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    onClick={() => setTimeRange(range)}
                    className={`rounded-xl capitalize ${
                      timeRange === range
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0'
                        : 'bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Completion Chart */}
              <ChartCard
                title="Completion Trend"
                subtitle={`Your habit completion over ${timeRange === 'week' ? 'the last week' : timeRange === 'month' ? 'the last month' : 'the last year'}`}
              >
                  {getChartData(selectedHabit) && (
                    <Line
                      data={{
                        labels: getChartData(selectedHabit)!.labels,
                        datasets: [{
                          label: 'Completions',
                          data: getChartData(selectedHabit)!.data,
                          borderColor: selectedHabit.color,
                          backgroundColor: selectedHabit.color + '20',
                          fill: true,
                          tension: 0.4
                        }]
                      }}
                      options={lineChartOptions}
                    />
                  )}
              </ChartCard>

              {/* Activity Distribution */}
              <ChartCard
                title="Activity Distribution"
                subtitle="Completion frequency analysis"
              >
                  {getChartData(selectedHabit) && (
                    <Bar
                      data={{
                        labels: getChartData(selectedHabit)!.labels.slice(-7),
                        datasets: [{
                          label: 'Completions',
                          data: getChartData(selectedHabit)!.data.slice(-7),
                          backgroundColor: selectedHabit.color + '80',
                          borderColor: selectedHabit.color,
                          borderWidth: 2
                        }]
                      }}
                      options={barChartOptions}
                    />
                  )}
              </ChartCard>
            </div>

            {/* Achievements */}
            <GlassCard className="mb-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-teal-400" />
                  Achievements
                </h3>
                <p className="text-sm text-white/60 mt-1">Badges earned for this habit</p>
              </div>
              <div>
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
              </div>
            </GlassCard>

            {/* Completion Calendar Heatmap */}
            <GlassCard>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CalendarMonth className="h-5 w-5 text-teal-400" />
                  Completion Heatmap
                </h3>
                <p className="text-sm text-white/60 mt-1">Visual representation of your habit consistency</p>
              </div>
              <div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (34 - i));
                    const dateStr = date.toISOString().split('T')[0];
                    const isCompleted = selectedHabit.completedDates?.includes(dateStr);
                    
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-white/10'
                        }`}
                        title={date.toLocaleDateString()}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded" />
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/10 rounded" />
                    <span>Missed</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </>
        )}
      </main>
      </div>
    </div>
  );
};

export default HabitStreaks;