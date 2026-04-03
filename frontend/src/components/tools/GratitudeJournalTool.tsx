import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Plus, Sparkles, Calendar, ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface GratitudeEntry {
  id: string;
  date: string;
  items: string[];
  reflection: string;
  mood: number;
}

interface GratitudeJournalToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

// Column configuration for useToolData hook and exports
const COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'mood', header: 'Mood (1-5)', type: 'number' },
  { key: 'items', header: 'Gratitudes', type: 'string', format: (value) => Array.isArray(value) ? value.join('; ') : String(value || '') },
  { key: 'reflection', header: 'Reflection', type: 'string' },
];

export const GratitudeJournalTool: React.FC<GratitudeJournalToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Default gratitude entries
  const defaultEntries: GratitudeEntry[] = [
    {
      id: '1',
      date: '2024-12-26',
      items: ['Family time during holidays', 'Good health', 'Productive workday'],
      reflection: 'Feeling blessed for the little moments that make life special.',
      mood: 5,
    },
    {
      id: '2',
      date: '2024-12-25',
      items: ['Christmas celebration', 'Delicious food', 'Gift of giving'],
      reflection: 'The joy of sharing moments with loved ones.',
      mood: 5,
    },
    {
      id: '3',
      date: '2024-12-24',
      items: ['Quiet evening', 'Good book', 'Cozy weather'],
      reflection: 'Sometimes the simple things are the most meaningful.',
      mood: 4,
    },
  ];

  // Use hook for gratitude entry data persistence with backend sync
  const {
    data: entries,
    addItem: addEntry,
    updateItem: updateEntry,
    deleteItem: deleteEntry,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<GratitudeEntry>('gratitude-journal', defaultEntries, COLUMNS);

  // Apply prefill data
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.items && Array.isArray(prefillData.params.items)) {
        setNewItems(prefillData.params.items);
      }
      if (prefillData.params.reflection) setNewReflection(prefillData.params.reflection);
      if (prefillData.params.mood) setNewMood(parseInt(prefillData.params.mood));
      setIsPrefilled(true);
    }
  }, [prefillData]);

  const [newItems, setNewItems] = useState<string[]>(['', '', '']);
  const [newReflection, setNewReflection] = useState('');
  const [newMood, setNewMood] = useState(4);
  const [viewMode, setViewMode] = useState<'today' | 'history'>('today');
  const [historyMonth, setHistoryMonth] = useState(new Date());

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find((e) => e.date === today);

  const prompts = [
    'What made you smile today?',
    'Who are you grateful for?',
    'What simple pleasure did you enjoy?',
    'What challenge taught you something?',
    'What beauty did you notice today?',
    'What are you looking forward to?',
    'What memory are you thankful for?',
    'What ability do you appreciate having?',
  ];

  const [currentPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);

  const moods = [
    { value: 1, emoji: '😔', label: 'Struggling' },
    { value: 2, emoji: '😐', label: 'Okay' },
    { value: 3, emoji: '🙂', label: 'Good' },
    { value: 4, emoji: '😊', label: 'Happy' },
    { value: 5, emoji: '🤩', label: 'Wonderful' },
  ];

  // Calculate stats for export subtitle
  const { completedEntries, totalGratitudesCount } = useMemo(() => {
    return {
      completedEntries: entries.length,
      totalGratitudesCount: entries.reduce((sum, e) => sum + e.items.length, 0),
    };
  }, [entries]);

  const updateNewItem = (index: number, value: string) => {
    const updated = [...newItems];
    updated[index] = value;
    setNewItems(updated);
  };

  const saveEntry = () => {
    const filledItems = newItems.filter((item) => item.trim());
    if (filledItems.length === 0) return;

    if (todayEntry) {
      updateEntry(todayEntry.id, {
        items: filledItems,
        reflection: newReflection,
        mood: newMood,
      });
    } else {
      addEntry({
        id: Date.now().toString(),
        date: today,
        items: filledItems,
        reflection: newReflection,
        mood: newMood,
      });
    }

    setNewItems(['', '', '']);
    setNewReflection('');
    setNewMood(4);
  };

  const stats = useMemo(() => {
    const streak = (() => {
      let count = 0;
      const sortedDates = [...new Set(entries.map((e) => e.date))].sort().reverse();
      let checkDate = new Date();

      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (sortedDates.includes(dateStr)) {
          count++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      return count;
    })();

    const totalGratitudes = entries.reduce((sum, e) => sum + e.items.length, 0);
    const avgMood = entries.length > 0 ? entries.reduce((sum, e) => sum + e.mood, 0) / entries.length : 0;

    return { streak, totalEntries: entries.length, totalGratitudes, avgMood };
  }, [entries]);

  const getMonthDays = useMemo(() => {
    const year = historyMonth.getFullYear();
    const month = historyMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [historyMonth]);

  const getEntryForDate = (date: Date): GratitudeEntry | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.find((e) => e.date === dateStr);
  };

  const navigateMonth = (delta: number) => {
    const newDate = new Date(historyMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setHistoryMonth(newDate);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-rose-900/20' : 'bg-gradient-to-r from-white to-rose-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg"><Heart className="w-5 h-5 text-rose-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gratitudeJournal.gratitudeJournal', 'Gratitude Journal')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gratitudeJournal.cultivateThankfulnessDaily', 'Cultivate thankfulness daily')}</p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="gratitude-journal" toolName="Gratitude Journal" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'gratitude-journal' })}
            onExportExcel={() => exportExcel({ filename: 'gratitude-journal' })}
            onExportJSON={() => exportJSON({ filename: 'gratitude-journal' })}
            onExportPDF={() => exportPDF({
              filename: 'gratitude-journal',
              title: 'Gratitude Journal Report',
              subtitle: `${completedEntries} entries with ${totalGratitudesCount} gratitudes`
            })}
            onPrint={() => print('Gratitude Journal')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className={`mx-6 mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{t('tools.gratitudeJournal.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-2xl font-bold text-rose-500">{stats.streak}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gratitudeJournal.dayStreak', 'Day Streak')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalEntries}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gratitudeJournal.entries', 'Entries')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalGratitudes}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gratitudeJournal.gratitudes', 'Gratitudes')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-2xl">{moods.find((m) => m.value === Math.round(stats.avgMood))?.emoji || '🙂'}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gratitudeJournal.avgMood', 'Avg Mood')}</div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('today')}
            className={`flex-1 py-2 rounded-lg ${viewMode === 'today' ? 'bg-rose-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.gratitudeJournal.todaySEntry', 'Today\'s Entry')}
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`flex-1 py-2 rounded-lg ${viewMode === 'history' ? 'bg-rose-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.gratitudeJournal.history', 'History')}
          </button>
        </div>

        {viewMode === 'today' ? (
          <>
            {/* Prompt */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-rose-900/20 border-rose-800' : 'bg-rose-50 border-rose-200'} border`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <span className={`font-medium ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{currentPrompt}</span>
              </div>
            </div>

            {/* New Entry Form */}
            <div className="space-y-4">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {todayEntry ? 'Update Today\'s Entry' : 'What are you grateful for today?'}
              </h4>

              {newItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isDark ? 'bg-rose-900/50 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateNewItem(idx, e.target.value)}
                    placeholder={`Gratitude #${idx + 1}...`}
                    className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              ))}

              <button
                onClick={() => setNewItems([...newItems, ''])}
                className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Plus className="w-4 h-4" /> Add another
              </button>

              <textarea
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
                placeholder={t('tools.gratitudeJournal.reflectionOrNotesOptional', 'Reflection or notes (optional)...')}
                className={`w-full px-4 py-2 rounded-lg border resize-none ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                rows={2}
              />

              {/* Mood */}
              <div className="flex items-center gap-4">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.gratitudeJournal.howDoYouFeel', 'How do you feel?')}</span>
                <div className="flex gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setNewMood(mood.value)}
                      className={`p-2 rounded-lg text-xl transition-transform ${newMood === mood.value ? 'scale-125 bg-rose-500/20' : 'opacity-60 hover:opacity-100'}`}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={saveEntry}
                className="w-full py-3 bg-rose-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-rose-600"
              >
                <Heart className="w-5 h-5" /> {todayEntry ? t('tools.gratitudeJournal.updateEntry', 'Update Entry') : t('tools.gratitudeJournal.saveEntry', 'Save Entry')}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Calendar View */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigateMonth(-1)} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {historyMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
                  const entry = getEntryForDate(date);
                  const isToday = date.toISOString().split('T')[0] === today;

                  return (
                    <div
                      key={date.toISOString()}
                      className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                        isToday ? 'ring-2 ring-rose-500' : ''
                      } ${entry ? 'bg-rose-500/20' : isDark ? 'bg-gray-700' : 'bg-white'}`}
                      title={entry ? `${entry.items.length} gratitudes` : ''}
                    >
                      {entry ? (
                        <span className="text-rose-500">❤️</span>
                      ) : (
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{date.getDate()}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Past Entries */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {entries
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 10)
                .map((entry) => (
                  <div key={entry.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{moods.find((m) => m.value === entry.mood)?.emoji}</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <button onClick={() => deleteEntry(entry.id)} className="p-1 opacity-50 hover:opacity-100" title={t('tools.gratitudeJournal.deleteEntry', 'Delete entry')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <ul className={`list-disc list-inside text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {entry.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    {entry.reflection && (
                      <p className={`text-sm mt-2 italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        "{entry.reflection}"
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GratitudeJournalTool;
