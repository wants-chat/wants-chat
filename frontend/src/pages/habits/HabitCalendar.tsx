// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Target, X, CheckCircle as CheckCircleIcon, Loader2 } from 'lucide-react';
import Icon from '@mdi/react';
import { mdiBell } from '@mdi/js';
import { useTheme } from '../../contexts/ThemeContext';
import { useTodayHabits } from '../../hooks/habits/useTodayHabits';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard, StatCard } from '../../components/ui/GlassCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { NotificationDropdown } from '../../components/habits';
import { toast } from '../../components/ui/sonner';
import { api } from '../../lib/api';
import type { Notification, Habit } from '../../types/habits';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Today,
  Event,
  LocalFireDepartment,
  TrendingUp,
  EmojiEvents,
  Close,
  Warning as AlertCircle
} from '@mui/icons-material';

// Using types from '../../types/habits'

// Extend Habit type to include completedDates for calendar tracking
interface HabitWithDates extends Habit {
  completedDates: string[];
}

// Completion data from API
interface CompletionRecord {
  id: string;
  habit_id: string;
  completed_date: string;
}

interface CalendarDay {
  date: Date;
  habits: HabitWithDates[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

const HabitCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [togglingHabits, setTogglingHabits] = useState<Set<string>>(new Set());
  const [allCompletions, setAllCompletions] = useState<Map<string, CompletionRecord[]>>(new Map());

  // Use the API hook to get habits
  const { habits: apiHabits, completedToday, toggleHabitCompletion, loading, refetch } = useTodayHabits();

  // Fetch completions for the current month
  const fetchMonthCompletions = useCallback(async () => {
    if (!apiHabits.length) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const fromDate = firstDay.toISOString().split('T')[0];
    const toDate = lastDay.toISOString().split('T')[0];

    const completionsMap = new Map<string, CompletionRecord[]>();

    for (const habit of apiHabits) {
      try {
        const data = await api.getHabitCompletions(habit.id, {
          from_date: fromDate,
          to_date: toDate
        });

        const completions = (data.completions || []).map((c: any) => ({
          id: c.id,
          habit_id: c.habit_id,
          completed_date: c.completed_date
        }));

        completionsMap.set(habit.id, completions);
      } catch (error) {
        console.error(`Failed to fetch completions for habit ${habit.id}:`, error);
      }
    }

    setAllCompletions(completionsMap);
  }, [apiHabits, currentDate]);

  // Fetch completions when month or habits change
  useEffect(() => {
    fetchMonthCompletions();
  }, [fetchMonthCompletions]);

  // Transform habits to include completedDates from API
  const habits: HabitWithDates[] = apiHabits.map(h => {
    const completions = allCompletions.get(h.id) || [];
    const completedDates = completions.map(c => c.completed_date);
    // Also include today's completions from the hook
    const todayStr = new Date().toISOString().split('T')[0];
    if (completedToday.includes(h.id) && !completedDates.includes(todayStr)) {
      completedDates.push(todayStr);
    }
    return {
      ...h,
      completedDates
    };
  });

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, habits]);

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
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDay = new Date(d);
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDay.getDay()];
      
      // Find habits scheduled for this day (use camelCase with fallback to snake_case)
      const dayHabits = habits.filter(habit => {
        const frequencyType = habit.frequencyType ?? habit.frequency_type;
        const weeklyDays = habit.weeklyDays ?? habit.weekly_days;
        const monthlyDay = habit.monthlyDay ?? habit.monthly_day;

        // For daily habits, include every day
        if (frequencyType === 'daily') {
          return isDateInHabitRange(currentDay, habit);
        }
        // For weekly habits, check if this day is included
        if (frequencyType === 'weekly' && weeklyDays) {
          const dayNumber = currentDay.getDay();
          return weeklyDays.includes(dayNumber) && isDateInHabitRange(currentDay, habit);
        }
        // For monthly habits, check if it's the right day of month
        if (frequencyType === 'monthly' && monthlyDay) {
          return currentDay.getDate() === monthlyDay && isDateInHabitRange(currentDay, habit);
        }
        return false;
      });
      
      days.push({
        date: new Date(currentDay),
        habits: dayHabits,
        isToday: currentDay.getTime() === today.getTime(),
        isCurrentMonth: currentDay.getMonth() === month
      });
    }
    
    setCalendarDays(days);
  };

  const isDateInHabitRange = (date: Date, habit: HabitWithDates) => {
    // Use created_at as start date if start_date is not set
    const startDateStr = habit.start_date || habit.created_at;
    if (!startDateStr) return true; // If no start date, assume it's active
    
    const habitStart = new Date(startDateStr);
    habitStart.setHours(0, 0, 0, 0);
    
    if (date < habitStart) return false;
    
    if (habit.end_date) {
      const habitEnd = new Date(habit.end_date);
      habitEnd.setHours(0, 0, 0, 0);
      if (date > habitEnd) return false;
    }
    
    return true;
  };

  const isHabitCompleted = (habit: HabitWithDates, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habit.completedDates.includes(dateStr);
  };

  const toggleHabitCompletionForDate = async (habitId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    // Create unique key for tracking loading state
    const toggleKey = `${habitId}-${dateStr}`;

    // Prevent multiple clicks
    if (togglingHabits.has(toggleKey)) return;

    // If it's today, use the API hook function
    if (dateStr === today) {
      toggleHabitCompletion(habitId);
      return;
    }

    // For other dates, use the API directly
    setTogglingHabits(prev => new Set(prev).add(toggleKey));

    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) {
        toast.error('Habit not found');
        return;
      }

      const isCompleted = habit.completedDates.includes(dateStr);

      if (isCompleted) {
        // Find the completion record to delete
        const completions = allCompletions.get(habitId) || [];
        const completionToDelete = completions.find(c => c.completed_date === dateStr);

        if (completionToDelete) {
          await api.unmarkHabitComplete(habitId, completionToDelete.id);
          toast.success('Habit completion removed');
        }
      } else {
        // Mark as complete for the specific date
        await api.markHabitComplete(habitId, {
          completed_at: new Date(date.setHours(12, 0, 0, 0)).toISOString()
        });
        toast.success('Habit marked as complete');
      }

      // Refresh completions data
      await fetchMonthCompletions();
      await refetch();
    } catch (error: any) {
      console.error('Failed to toggle habit completion:', error);
      toast.error(error.message || 'Failed to update habit completion');
    } finally {
      setTogglingHabits(prev => {
        const newSet = new Set(prev);
        newSet.delete(toggleKey);
        return newSet;
      });
    }
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

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getCompletionRate = (day: CalendarDay) => {
    if (day.habits.length === 0) return 0;
    const completed = day.habits.filter(h => isHabitCompleted(h, day.date)).length;
    return Math.round((completed / day.habits.length) * 100);
  };

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
              <CalendarIcon className="h-6 w-6 text-teal-400" />
              <span className="text-xl font-semibold text-white">Habit Calendar</span>
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
                                      {notification.type === 'reminder' && <CalendarIcon className="h-3 w-3 text-blue-500" />}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="mb-6">
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
                    onClick={goToToday}
                    className="rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20"
                  >
                    <Today className="h-4 w-4 mr-2" />
                    Today
                  </Button>
                </div>
              </div>
              <div>
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
                              className="text-xs h-5"
                            >
                              {completionRate}%
                            </Badge>
                          )}
                        </div>
                        
                        {/* Habit Dots */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {day.habits.slice(0, 4).map((habit, hIdx) => (
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
              </div>
            </GlassCard>
          </div>

          {/* Selected Day Details */}
          <div className='sticky top-4'>
            <GlassCard>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
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
                </h3>
                <p className="text-sm text-white/60 mt-1">
                  {selectedDate && calendarDays.find(d => d.date.toDateString() === selectedDate.toDateString())?.habits.length || 0} habits scheduled
                </p>
              </div>
              <div>
                {selectedDate && (
                  <div className="space-y-3">
                    {calendarDays
                      .find(d => d.date.toDateString() === selectedDate.toDateString())
                      ?.habits.map(habit => {
                        const isCompleted = isHabitCompleted(habit, selectedDate);
                        return (
                          <div
                            key={habit.id}
                            className="p-4 rounded-xl border border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all"
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
                                onClick={() => toggleHabitCompletionForDate(habit.id, selectedDate)}
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
              </div>
            </GlassCard>

            {/* Monthly Stats */}
            <GlassCard className="mt-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-400" />
                  Monthly Overview
                </h3>
              </div>
              <div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Total Habits</span>
                    <span className="font-semibold text-white">{habits.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Completed This Month</span>
                    <span className="font-semibold text-white">
                      {calendarDays.reduce((total, day) => {
                        if (day.isCurrentMonth) {
                          return total + day.habits.filter(h => isHabitCompleted(h, day.date)).length;
                        }
                        return total;
                      }, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Perfect Days</span>
                    <span className="font-semibold text-white">
                      {calendarDays.filter(day =>
                        day.isCurrentMonth &&
                        day.habits.length > 0 &&
                        getCompletionRate(day) === 100
                      ).length}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default HabitCalendar;