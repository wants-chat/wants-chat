import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Plus, Check, X, Calendar, Trophy, Trash2, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface HabitStreakToolProps {
  uiConfig?: UIConfig;
}

interface Habit {
  id: string;
  name: string;
  color: string;
  completedDates: string[];
}

// Column configuration for export
const habitColumns: ColumnConfig[] = [
  { key: 'name', header: 'Habit Name', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'currentStreak', header: 'Current Streak', type: 'number' },
  { key: 'longestStreak', header: 'Longest Streak', type: 'number' },
  { key: 'totalCompletions', header: 'Total Completions', type: 'number' },
  { key: 'completedDates', header: 'Completed Dates', type: 'string', format: (value) => Array.isArray(value) ? value.join(', ') : String(value || '') },
];

export const HabitStreakTool: React.FC<HabitStreakToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [viewDate, setViewDate] = useState(new Date());

  // Default habits data
  const defaultHabits: Habit[] = [
    { id: '1', name: 'Exercise', color: '#ef4444', completedDates: ['2024-12-24', '2024-12-25', '2024-12-26'] },
    { id: '2', name: 'Read 30 min', color: '#3b82f6', completedDates: ['2024-12-23', '2024-12-24', '2024-12-25', '2024-12-26'] },
    { id: '3', name: 'Meditate', color: '#8b5cf6', completedDates: ['2024-12-26'] },
  ];

  // Initialize useToolData hook
  const {
    data: habits,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
  } = useToolData<Habit>('habit-streak', defaultHabits, habitColumns);

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        setNewHabitName(params.content);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const today = new Date().toISOString().split('T')[0];

  const getDateStr = (date: Date): string => date.toISOString().split('T')[0];

  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    const sorted = [...completedDates].sort().reverse();
    let streak = 0;
    let checkDate = new Date();

    // Check if today or yesterday was completed to start the streak
    const todayStr = getDateStr(checkDate);
    const yesterdayStr = getDateStr(new Date(checkDate.getTime() - 86400000));

    if (!sorted.includes(todayStr) && !sorted.includes(yesterdayStr)) {
      return 0;
    }

    // If today isn't completed but yesterday was, start from yesterday
    if (!sorted.includes(todayStr)) {
      checkDate = new Date(checkDate.getTime() - 86400000);
    }

    for (let i = 0; i < 365; i++) {
      const dateStr = getDateStr(checkDate);
      if (sorted.includes(dateStr)) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
    return streak;
  };

  const getLongestStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    const sorted = [...completedDates].sort();
    let longest = 1;
    let current = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diffDays = Math.floor((curr.getTime() - prev.getTime()) / 86400000);

      if (diffDays === 1) {
        current++;
        longest = Math.max(longest, current);
      } else if (diffDays > 1) {
        current = 1;
      }
    }
    return longest;
  };

  const getWeekDates = useMemo(() => {
    const dates: Date[] = [];
    const start = new Date(viewDate);
    start.setDate(start.getDate() - start.getDay());
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(start.getTime() + i * 86400000));
    }
    return dates;
  }, [viewDate]);

  const toggleHabitDate = (habitId: string, dateStr: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const completed = habit.completedDates.includes(dateStr);
    const newCompletedDates = completed
      ? habit.completedDates.filter(d => d !== dateStr)
      : [...habit.completedDates, dateStr];

    updateItem(habitId, { completedDates: newCompletedDates });
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    addItem({
      id: Date.now().toString(),
      name: newHabitName,
      color: colors[habits.length % colors.length],
      completedDates: [],
    });
    setNewHabitName('');
  };

  const removeHabit = (id: string) => {
    deleteItem(id);
  };

  const weekOffset = (weeks: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + weeks * 7);
    setViewDate(newDate);
  };

  const overallStats = useMemo(() => {
    const allStreaks = habits.map(h => calculateStreak(h.completedDates));
    const todayCompleted = habits.filter(h => h.completedDates.includes(today)).length;
    return {
      totalHabits: habits.length,
      completedToday: todayCompleted,
      longestActiveStreak: Math.max(...allStreaks, 0),
      perfectDays: habits.length > 0 ? habits.reduce((count, h) => {
        return count + h.completedDates.filter(d =>
          habits.every(other => other.completedDates.includes(d))
        ).length;
      }, 0) / habits.length : 0,
    };
  }, [habits, today]);

  // Note: Export data formatting is now handled by useToolData hook
  // using the habitColumns configuration defined at the top

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg"><Flame className="w-5 h-5 text-orange-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.habitStreak.habitStreakTracker', 'Habit Streak Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.habitStreak.trackYourDailyHabitsAnd', 'Track your daily habits and build streaks')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPrefilled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="text-xs text-[#0D9488] font-medium">{t('tools.habitStreak.prefilled', 'Prefilled')}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="habit-streak" toolName="Habit Streak" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'habit-streaks' })}
                onExportExcel={() => exportExcel({ filename: 'habit-streaks' })}
                onExportJSON={() => exportJSON({ filename: 'habit-streaks' })}
                onExportPDF={() => exportPDF({ filename: 'habit-streaks', title: 'Habit Streak Tracker Report' })}
                onPrint={() => {}}
                onCopyToClipboard={() => {}}
                disabled={habits.length === 0}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{overallStats.totalHabits}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.habitStreak.habits', 'Habits')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold text-green-500`}>{overallStats.completedToday}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.habitStreak.today', 'Today')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold text-orange-500`}>{overallStats.longestActiveStreak}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.habitStreak.bestStreak', 'Best Streak')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold text-purple-500`}>{Math.floor(overallStats.perfectDays)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.habitStreak.perfectDays', 'Perfect Days')}</div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => weekOffset(-1)}
            className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.habitStreak.prev', '← Prev')}
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {getWeekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {getWeekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <button
            onClick={() => weekOffset(1)}
            className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.habitStreak.next', 'Next →')}
          </button>
        </div>

        {/* Habit Grid */}
        <div className="space-y-2">
          {/* Header Row */}
          <div className="grid grid-cols-10 gap-2 text-xs text-center">
            <div className="col-span-3"></div>
            {getWeekDates.map((date) => (
              <div key={date.toISOString()} className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={getDateStr(date) === today ? 'text-orange-500 font-bold' : ''}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Habits */}
          {habits.map((habit) => {
            const streak = calculateStreak(habit.completedDates);
            const longest = getLongestStreak(habit.completedDates);
            return (
              <div key={habit.id} className={`grid grid-cols-10 gap-2 items-center p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }}></div>
                  <div className="flex-1 truncate">
                    <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{habit.name}</div>
                    <div className="flex items-center gap-1 text-xs">
                      <Flame className={`w-3 h-3 ${streak > 0 ? 'text-orange-500' : isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      <span className={streak > 0 ? 'text-orange-500' : isDark ? 'text-gray-500' : 'text-gray-400'}>{streak}</span>
                      <Trophy className={`w-3 h-3 ml-2 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`} />
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{longest}</span>
                    </div>
                  </div>
                  <button onClick={() => removeHabit(habit.id)} className="p-1 opacity-50 hover:opacity-100">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                {getWeekDates.map((date) => {
                  const dateStr = getDateStr(date);
                  const isCompleted = habit.completedDates.includes(dateStr);
                  const isFuture = date > new Date();
                  return (
                    <button
                      key={dateStr}
                      onClick={() => !isFuture && toggleHabitDate(habit.id, dateStr)}
                      disabled={isFuture}
                      className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center transition-all ${
                        isFuture
                          ? isDark ? 'bg-gray-700 opacity-30' : 'bg-gray-200 opacity-30'
                          : isCompleted
                          ? 'text-white scale-100'
                          : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      style={{ backgroundColor: isCompleted && !isFuture ? habit.color : undefined }}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : !isFuture && <X className="w-4 h-4 opacity-30" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Add Habit */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder={t('tools.habitStreak.newHabitName', 'New habit name...')}
            className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <button
            onClick={addHabit}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.habitStreak.tip', 'Tip:')}</strong> Click on any day to mark a habit as complete. Build streaks by completing habits consistently!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HabitStreakTool;
