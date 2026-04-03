import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Calendar, TrendingUp, Plus, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData, { type UseToolDataReturn } from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  note: string;
  tags: string[];
}

interface MoodTrackerToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for export
const moodEntryColumns: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'mood', header: 'Mood (1-5)', type: 'number' },
  { key: 'moodLabel', header: 'Mood Label', type: 'string' },
  { key: 'note', header: 'Note', type: 'string' },
  { key: 'tags', header: 'Tags', type: 'string', format: (value) => Array.isArray(value) ? value.join(', ') : String(value || '') },
];

export const MoodTrackerTool: React.FC<MoodTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMonth, setViewMonth] = useState(new Date());

  const defaultEntries: MoodEntry[] = [
    { id: '1', date: '2024-12-26', mood: 4, note: 'Great productive day!', tags: ['work', 'exercise'] },
    { id: '2', date: '2024-12-25', mood: 5, note: 'Amazing holiday with family', tags: ['family', 'holiday'] },
    { id: '3', date: '2024-12-24', mood: 3, note: 'Regular day, nothing special', tags: ['work'] },
    { id: '4', date: '2024-12-23', mood: 2, note: 'Feeling stressed about deadlines', tags: ['work', 'stress'] },
    { id: '5', date: '2024-12-22', mood: 4, note: 'Nice weekend relaxation', tags: ['relaxation'] },
  ];

  const {
    data: entries,
    addItem,
    updateItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print: printData,
  } = useToolData<MoodEntry>('mood-tracker', defaultEntries, moodEntryColumns);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setNote(params.text || params.content || '');
        setIsPrefilled(true);
      } else if (params.numbers && params.numbers.length > 0) {
        const moodValue = Math.min(5, Math.max(1, params.numbers[0]));
        setSelectedMood(moodValue);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const moods = [
    { value: 1, emoji: '😢', label: 'Awful', color: '#ef4444' },
    { value: 2, emoji: '😔', label: 'Bad', color: '#f97316' },
    { value: 3, emoji: '😐', label: 'Okay', color: '#eab308' },
    { value: 4, emoji: '😊', label: 'Good', color: '#22c55e' },
    { value: 5, emoji: '🤩', label: 'Great', color: '#3b82f6' },
  ];

  // Prepare export data with mood labels (for backward compatibility with export functions)
  const exportData = useMemo(() => {
    return entries.map(entry => ({
      ...entry,
      moodLabel: moods.find(m => m.value === entry.mood)?.label || 'Unknown',
    }));
  }, [entries]);

  const tags = ['work', 'exercise', 'family', 'friends', 'relaxation', 'stress', 'travel', 'health', 'hobby', 'holiday'];

  const today = new Date().toISOString().split('T')[0];

  const todayEntry = entries.find(e => e.date === today);

  const logMood = () => {
    if (todayEntry) {
      updateItem(todayEntry.id, { mood: selectedMood, note, tags: selectedTags });
    } else {
      addItem({ id: Date.now().toString(), date: today, mood: selectedMood, note, tags: selectedTags });
    }
    setNote('');
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const stats = useMemo(() => {
    if (entries.length === 0) return { average: 0, trend: 0, mostFrequent: 3, bestDay: '', worstDay: '' };

    const avg = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
    const recent = entries.slice(0, 7);
    const older = entries.slice(7, 14);
    const recentAvg = recent.reduce((sum, e) => sum + e.mood, 0) / (recent.length || 1);
    const olderAvg = older.length > 0 ? older.reduce((sum, e) => sum + e.mood, 0) / older.length : recentAvg;

    const moodCounts: Record<number, number> = {};
    entries.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });
    const mostFrequent = parseInt(Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '3');

    const sorted = [...entries].sort((a, b) => b.mood - a.mood);

    return {
      average: avg,
      trend: recentAvg - olderAvg,
      mostFrequent,
      bestDay: sorted[0]?.date || '',
      worstDay: sorted[sorted.length - 1]?.date || '',
    };
  }, [entries]);

  const getMonthDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add padding for days before the 1st
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [viewMonth]);

  const getMoodForDate = (date: Date): MoodEntry | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.find(e => e.date === dateStr);
  };

  const navigateMonth = (delta: number) => {
    const newDate = new Date(viewMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewMonth(newDate);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg"><Heart className="w-5 h-5 text-pink-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.moodTracker.moodTracker', 'Mood Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.moodTracker.trackHowYouFeelEach', 'Track how you feel each day')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPrefilled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="text-xs text-[#0D9488] font-medium">{t('tools.moodTracker.prefilled', 'Prefilled')}</span>
              </div>
            )}
            <WidgetEmbedButton toolSlug="mood-tracker" toolName="Mood Tracker" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'mood-tracker' })}
              onExportExcel={() => exportExcel({ filename: 'mood-tracker' })}
              onExportJSON={() => exportJSON({ filename: 'mood-tracker' })}
              onExportPDF={() => exportPDF({ filename: 'mood-tracker', title: 'Mood Tracker Report' })}
              onPrint={() => printData('Mood Tracker Report')}
              onCopyToClipboard={() => copyToClipboard('csv')}
              disabled={entries.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-2xl">{moods.find(m => m.value === Math.round(stats.average))?.emoji || '😐'}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.moodTracker.average', 'Average')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className={`w-5 h-5 ${stats.trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-lg font-bold ${stats.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}
              </span>
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.moodTracker.trend', 'Trend')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{entries.length}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.moodTracker.entries', 'Entries')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-2xl">{moods.find(m => m.value === stats.mostFrequent)?.emoji}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.moodTracker.mostCommon', 'Most Common')}</div>
          </div>
        </div>

        {/* Log Today's Mood */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {todayEntry ? 'Update Today\'s Mood' : 'How are you feeling today?'}
          </h4>

          {/* Mood Selection */}
          <div className="flex justify-center gap-3 mb-4">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  selectedMood === mood.value
                    ? 'scale-110 ring-2 ring-offset-2'
                    : 'opacity-60 hover:opacity-100'
                } ${isDark ? 'ring-offset-gray-800' : 'ring-offset-gray-50'}`}
                style={{
                  backgroundColor: selectedMood === mood.value ? mood.color + '20' : 'transparent',
                  ringColor: mood.color
                }}
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{mood.label}</span>
              </button>
            ))}
          </div>

          {/* Note */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('tools.moodTracker.addANoteAboutYour', 'Add a note about your day...')}
            className={`w-full px-4 py-2 rounded-lg border resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            rows={2}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs ${
                  selectedTags.includes(tag)
                    ? 'bg-pink-500 text-white'
                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <button
            onClick={logMood}
            className="w-full mt-4 py-2 bg-pink-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-pink-600"
          >
            <Plus className="w-4 h-4" /> {todayEntry ? t('tools.moodTracker.updateEntry', 'Update Entry') : t('tools.moodTracker.logMood', 'Log Mood')}
          </button>
        </div>

        {/* Calendar View */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateMonth(-1)} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button onClick={() => navigateMonth(1)} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className={isDark ? 'text-gray-500' : 'text-gray-400'}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getMonthDays.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} />;
              const entry = getMoodForDate(date);
              const mood = entry ? moods.find(m => m.value === entry.mood) : null;
              const isToday = date.toISOString().split('T')[0] === today;

              return (
                <div
                  key={date.toISOString()}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                    isToday ? 'ring-2 ring-pink-500' : ''
                  } ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                  style={{ backgroundColor: mood ? mood.color + '30' : undefined }}
                  title={entry?.note || ''}
                >
                  {mood ? (
                    <span className="text-lg">{mood.emoji}</span>
                  ) : (
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{date.getDate()}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Entries */}
        <div className="space-y-2">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.moodTracker.recentEntries', 'Recent Entries')}</h4>
          {entries.slice(0, 5).map((entry) => {
            const mood = moods.find(m => m.value === entry.mood);
            return (
              <div key={entry.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mood?.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{mood?.label}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {entry.note && <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{entry.note}</p>}
                    {entry.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {entry.tags.map((tag) => (
                          <span key={tag} className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoodTrackerTool;
