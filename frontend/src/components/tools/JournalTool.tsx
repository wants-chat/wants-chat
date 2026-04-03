import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string;
  is_private: boolean;
  entry_date: string;
  created_at: string;
}

interface JournalToolProps {
  uiConfig?: UIConfig;
}

const moodOptions = [
  { value: 'excellent', label: 'Excellent 🌟', color: '#10B981' },
  { value: 'good', label: 'Good 😊', color: '#3B82F6' },
  { value: 'neutral', label: 'Neutral 😐', color: '#F59E0B' },
  { value: 'sad', label: 'Sad 😢', color: '#EF4444' },
  { value: 'stressed', label: 'Stressed 😰', color: '#8B5CF6' },
];

// Column configuration for exports
const journalColumns: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'content', header: 'Content', type: 'string' },
  { key: 'mood', header: 'Mood', type: 'string' },
  { key: 'tags', header: 'Tags', type: 'string' },
  { key: 'is_private', header: 'Private', type: 'boolean' },
  { key: 'entry_date', header: 'Date', type: 'date' },
];

export const JournalTool: React.FC<JournalToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for journal entries with backend sync
  const {
    data: entries,
    addItem,
    updateItem,
    deleteItem,
    isLoading: loading,
    isSaving: saving,
    isSynced,
    syncError,
    lastSaved,
    forceSync,
    exportCSV: exportEntriesCSV,
    exportExcel: exportEntriesExcel,
    exportJSON: exportEntriesJSON,
    exportPDF: exportEntriesPDF,
    print: printEntries,
    copyToClipboard: copyEntriesToClipboard,
  } = useToolData<JournalEntry>(
    'journal-tool',
    [],
    journalColumns
  );

  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: '',
    is_private: true,
    entry_date: new Date().toISOString().split('T')[0],
  });

  // Filtered entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = !filterMood || entry.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  // Sort entries by date (newest first)
  const sortedEntries = [...filteredEntries].sort((a, b) =>
    new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );

  // Open modal for new entry
  const handleAddNew = () => {
    setEditingEntry(null);
    setFormData({
      title: '',
      content: '',
      mood: 'neutral',
      tags: '',
      is_private: true,
      entry_date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || 'neutral',
      tags: entry.tags || '',
      is_private: entry.is_private,
      entry_date: entry.entry_date.split('T')[0],
    });
    setShowModal(true);
  };

  // Save entry
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setError(null);

      const entryData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        mood: formData.mood,
        tags: formData.tags.trim() || undefined,
        is_private: formData.is_private,
        entry_date: formData.entry_date,
      };

      if (editingEntry) {
        // Update existing entry
        updateItem(editingEntry.id, entryData);
      } else {
        // Add new entry with generated ID
        const newEntry: JournalEntry = {
          ...entryData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
        };
        addItem(newEntry);
      }

      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    }
  };

  // Delete entry
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Entry',
      message: 'Are you sure you want to delete this entry? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        deleteItem(id);
      } catch (err: any) {
        setError(err.message || 'Failed to delete entry');
      }
    }
  };

  // Get mood emoji and label
  const getMoodDisplay = (mood?: string) => {
    const option = moodOptions.find((m) => m.value === mood);
    return option ? option.label : 'Neutral 😐';
  };

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.journal.journal', 'Journal')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.journal.keepTrackOfYourThoughts', 'Keep track of your thoughts and experiences')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`px-6 py-4 border-b flex items-center justify-between flex-wrap gap-4 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Search className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder={t('tools.journal.searchEntries', 'Search entries...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'}`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">{t('tools.journal.filters', 'Filters')}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <WidgetEmbedButton toolSlug="journal" toolName="Journal" />


          <SyncStatus
            isSynced={isSynced}
            isSaving={saving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />

          <ExportDropdown
            onExportCSV={() => exportEntriesCSV({ filename: 'journal-entries' })}
            onExportExcel={() => exportEntriesExcel({ filename: 'journal-entries' })}
            onExportJSON={() => exportEntriesJSON({ filename: 'journal-entries' })}
            onExportPDF={() => exportEntriesPDF({ filename: 'journal-entries', title: 'Journal Entries' })}
            onPrint={() => printEntries('Journal Entries')}
            onCopyToClipboard={() => copyEntriesToClipboard('csv')}
            disabled={entries.length === 0}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tools.journal.newEntry', 'New Entry')}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`px-6 py-3 border-b flex items-center gap-4 ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-100 bg-gray-50'}`}>
          <select
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            className={`px-3 py-2 rounded-lg border outline-none transition-colors text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-900'}`}
          >
            <option value="">{t('tools.journal.allMoods', 'All Moods')}</option>
            {moodOptions.map((mood) => (
              <option key={mood.value} value={mood.value}>
                {mood.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          </div>
        ) : sortedEntries.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.journal.noJournalEntriesYetCreate', 'No journal entries yet. Create your first entry!')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border transition-colors ${isDark ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {entry.title}
                      </h4>
                      {entry.is_private && (
                        <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                          {t('tools.journal.private', 'Private')}
                        </span>
                      )}
                    </div>

                    <p className={`text-sm mb-3 line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {entry.content}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#0D9488]" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </span>
                      </div>

                      {entry.mood && (
                        <span className="text-xs">{getMoodDisplay(entry.mood)}</span>
                      )}

                      {entry.tags && (
                        <div className="flex items-center gap-1.5">
                          {entry.tags.split(',').slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                            >
                              {tag.trim()}
                            </span>
                          ))}
                          {entry.tags.split(',').length > 2 && (
                            <span className={`text-xs px-2 py-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              +{entry.tags.split(',').length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(entry)}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/20 text-gray-400 hover:text-red-400' : 'hover:bg-red-100 text-gray-500 hover:text-red-600'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Modal Header */}
            <div className={`sticky top-0 flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
              <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingEntry ? t('tools.journal.editEntry', 'Edit Entry') : t('tools.journal.newJournalEntry', 'New Journal Entry')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {error && (
                <div className={`p-4 rounded-lg border flex items-start gap-3 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className={isDark ? 'text-red-400' : 'text-red-700'}>{error}</p>
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.journal.title', 'Title')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('tools.journal.entryTitle', 'Entry title...')}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${isDark ? t('tools.journal.bgGray700BorderGray', 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]') : t('tools.journal.bgWhiteBorderGray200', 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]')}`}
                />
              </div>

              {/* Content Input */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.journal.content', 'Content')}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t('tools.journal.writeYourThoughts', 'Write your thoughts...')}
                  rows={6}
                  className={`w-full px-4 py-3 rounded-xl border outline-none resize-none transition-colors ${isDark ? t('tools.journal.bgGray700BorderGray2', 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]') : t('tools.journal.bgWhiteBorderGray2002', 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]')}`}
                />
              </div>

              {/* Mood & Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mood Selection */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.journal.mood', 'Mood')}
                  </label>
                  <select
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${isDark ? t('tools.journal.bgGray700BorderGray3', 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]') : t('tools.journal.bgWhiteBorderGray2003', 'bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]')}`}
                  >
                    {moodOptions.map((mood) => (
                      <option key={mood.value} value={mood.value}>
                        {mood.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.journal.date', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={formData.entry_date}
                    onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${isDark ? t('tools.journal.bgGray700BorderGray4', 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]') : t('tools.journal.bgWhiteBorderGray2004', 'bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]')}`}
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.journal.tagsCommaSeparated', 'Tags (comma-separated)')}
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder={t('tools.journal.personalWorkHealth', 'personal, work, health...')}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${isDark ? t('tools.journal.bgGray700BorderGray5', 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]') : t('tools.journal.bgWhiteBorderGray2005', 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]')}`}
                />
              </div>

              {/* Private Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={formData.is_private}
                  onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="is_private" className={`text-sm font-medium cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.journal.keepThisEntryPrivate', 'Keep this entry private')}
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              >
                {t('tools.journal.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('tools.journal.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('tools.journal.saveEntry', 'Save Entry')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalTool;
