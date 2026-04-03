'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Plus, Trash2, Edit2, Save, X, Search, Star, Archive } from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { UIConfig } from '../ContextualUI';

interface ReadingItem {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'reading' | 'completed' | 'want-to-read' | 'archived';
  rating?: number;
  progress?: number;
  notes?: string;
  dateAdded: string;
  dateCompleted?: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'all' | 'reading' | 'completed' | 'want-to-read' | 'archived';

// Column configuration for export
const readingListColumns: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'author', header: 'Author', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'progress', header: 'Progress %', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'dateAdded', header: 'Date Added', type: 'date' },
  { key: 'dateCompleted', header: 'Date Completed', type: 'date' },
];

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Mystery', 'Romance', 'Self-Help', 'Business', 'Other'];
const STATUS_OPTIONS = [
  { value: 'reading', label: 'Currently Reading', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'want-to-read', label: 'Want to Read', color: 'purple' },
  { value: 'archived', label: 'Archived', color: 'gray' },
];

// Generate sample data
const generateSampleData = (): ReadingItem[] => {
  const now = new Date().toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'book-1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      category: 'Fiction',
      status: 'completed',
      rating: 5,
      progress: 100,
      notes: 'Classic American literature, excellent writing style',
      dateAdded: twoWeeksAgo,
      dateCompleted: now,
      createdAt: twoWeeksAgo,
      updatedAt: now,
    },
    {
      id: 'book-2',
      title: 'Atomic Habits',
      author: 'James Clear',
      category: 'Self-Help',
      status: 'reading',
      rating: 4,
      progress: 45,
      notes: 'Great practical advice on building habits',
      dateAdded: twoWeeksAgo,
      createdAt: twoWeeksAgo,
      updatedAt: now,
    },
    {
      id: 'book-3',
      title: 'Dune',
      author: 'Frank Herbert',
      category: 'Science',
      status: 'want-to-read',
      notes: 'Epic sci-fi novel, highly recommended',
      dateAdded: now,
      createdAt: now,
      updatedAt: now,
    },
  ];
};

interface ReadingListToolProps {
  uiConfig?: UIConfig;
}

export const ReadingListTool: React.FC<ReadingListToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const defaultData = generateSampleData();

  // Use useToolData hook for backend sync
  const {
    data: readingList,
    addItem,
    updateItem,
    deleteItem,
    isLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    clearData,
  } = useToolData<ReadingItem>('reading-list', defaultData, readingListColumns, {
    autoSave: true,
    autoSaveDelay: 1500,
  });

  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state for new/editing item
  const [formData, setFormData] = useState<Partial<ReadingItem>>({
    title: '',
    author: '',
    category: CATEGORIES[0],
    status: 'want-to-read',
    rating: undefined,
    progress: 0,
    notes: '',
  });

  // Confirm dialog hook
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Filter items by tab and search
  const filteredItems = useMemo(() => {
    let filtered = readingList;

    // Filter by tab
    if (selectedTab !== 'all') {
      filtered = filtered.filter(item => item.status === selectedTab);
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(term) ||
          item.author.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [readingList, selectedTab, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: readingList.length,
      reading: readingList.filter(i => i.status === 'reading').length,
      completed: readingList.filter(i => i.status === 'completed').length,
      wantToRead: readingList.filter(i => i.status === 'want-to-read').length,
      archived: readingList.filter(i => i.status === 'archived').length,
      averageRating: readingList
        .filter(i => i.rating)
        .reduce((sum, i) => sum + (i.rating || 0), 0) / readingList.filter(i => i.rating).length || 0,
    };
  }, [readingList]);

  const handleAddItem = () => {
    if (!formData.title?.trim() || !formData.author?.trim()) {
      return;
    }

    const newItem: ReadingItem = {
      id: `book-${Date.now()}`,
      title: formData.title,
      author: formData.author,
      category: formData.category || CATEGORIES[0],
      status: (formData.status as ReadingItem['status']) || 'want-to-read',
      rating: formData.rating,
      progress: formData.progress || 0,
      notes: formData.notes || '',
      dateAdded: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(newItem);
    resetForm();
  };

  const handleUpdateItem = (id: string) => {
    const updates: Partial<ReadingItem> = {
      title: formData.title,
      author: formData.author,
      category: formData.category,
      status: formData.status as ReadingItem['status'],
      rating: formData.rating,
      progress: formData.progress,
      notes: formData.notes,
      updatedAt: new Date().toISOString(),
    };

    if (formData.status === 'completed' && !formData.dateCompleted) {
      updates.dateCompleted = new Date().toISOString();
    }

    updateItem(id, updates);
    resetForm();
  };

  const handleEditStart = (item: ReadingItem) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDeleteItem = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Book',
      message: 'Are you sure you want to delete this book? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      category: CATEGORIES[0],
      status: 'want-to-read',
      rating: undefined,
      progress: 0,
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status: ReadingItem['status']) => {
    const option = STATUS_OPTIONS.find(o => o.value === status);
    return option?.color || 'gray';
  };

  const getStatusLabel = (status: ReadingItem['status']) => {
    const option = STATUS_OPTIONS.find(o => o.value === status);
    return option?.label || status;
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">{t('tools.readingList.loadingReadingList', 'Loading reading list...')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <ConfirmDialog />
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-amber-50/30 dark:from-gray-800 dark:to-amber-900/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.readingList.readingList', 'Reading List')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.readingList.trackYourBooksAndReading', 'Track your books and reading progress')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="reading-list" toolName="Reading List" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme="light"
              showLabel={true}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-100 dark:border-blue-800">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">{t('tools.readingList.totalBooks', 'Total Books')}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center border border-amber-100 dark:border-amber-800">
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.reading}</div>
            <div className="text-xs text-amber-600 dark:text-amber-400">{t('tools.readingList.currentlyReading', 'Currently Reading')}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-100 dark:border-green-800">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
            <div className="text-xs text-green-600 dark:text-green-400">{t('tools.readingList.completed', 'Completed')}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center border border-purple-100 dark:border-purple-800">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.wantToRead}</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">{t('tools.readingList.wantToRead', 'Want to Read')}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center border border-yellow-100 dark:border-yellow-800">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.averageRating.toFixed(1)}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">{t('tools.readingList.avgRating', 'Avg Rating')}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.readingList.searchByTitleAuthorOr', 'Search by title, author, or category...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <ExportDropdown
              data={filteredItems}
              filename="reading-list"
              onExportCSV={() => exportCSV()}
              onExportExcel={() => exportExcel()}
              onExportJSON={() => exportJSON()}
              theme="light"
            />
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              {t('tools.readingList.addBook', 'Add Book')}
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.readingList.title', 'Title')}
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('tools.readingList.bookTitle', 'Book title')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-gray-900 dark:text-white dark:bg-gray-600 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.readingList.author', 'Author')}
                </label>
                <input
                  type="text"
                  value={formData.author || ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder={t('tools.readingList.authorName', 'Author name')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-gray-900 dark:text-white dark:bg-gray-600 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.readingList.category', 'Category')}
                </label>
                <select
                  value={formData.category || CATEGORIES[0]}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-gray-900 dark:text-white dark:bg-gray-600"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.readingList.status', 'Status')}
                </label>
                <select
                  value={formData.status || 'want-to-read'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ReadingItem['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-gray-900 dark:text-white dark:bg-gray-600"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.readingList.rating15', 'Rating (1-5)')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={formData.rating || ''}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder={t('tools.readingList.rating', 'Rating')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-gray-900 dark:text-white dark:bg-gray-600 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.readingList.progress', 'Progress (%)')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress || 0}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-gray-900 dark:text-white dark:bg-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tools.readingList.notes', 'Notes')}
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('tools.readingList.yourThoughtsAboutThisBook', 'Your thoughts about this book...')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none text-gray-900 dark:text-white dark:bg-gray-600 placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => editingId ? handleUpdateItem(editingId) : handleAddItem()}
                disabled={!formData.title?.trim() || !formData.author?.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
              >
                <Save className="w-4 h-4" />
                {editingId ? t('tools.readingList.updateBook', 'Update Book') : t('tools.readingList.addBook2', 'Add Book')}
              </button>
              <button
                onClick={resetForm}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
                {t('tools.readingList.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {(['all', 'reading', 'completed', 'want-to-read', 'archived'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap border-b-2 transition-all ${
                selectedTab === tab
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'all' ? 'All Books' : getStatusLabel(tab as ReadingItem['status'])}
            </button>
          ))}
        </div>

        {/* Reading List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-16 h-16 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">{t('tools.readingList.noBooksFound', 'No books found')}</p>
            <p className="text-sm">
              {searchTerm ? t('tools.readingList.tryAdjustingYourSearch', 'Try adjusting your search') : t('tools.readingList.addYourFirstBookTo', 'Add your first book to get started')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    {item.rating && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(Math.round(item.rating))].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    by {item.author}
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[getStatusColor(item.status)]}`}>
                      {getStatusLabel(item.status)}
                    </span>
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                      {item.category}
                    </span>
                    {item.progress !== undefined && item.progress > 0 && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {item.progress}% read
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                      {item.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditStart(item)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors"
                    title={t('tools.readingList.edit', 'Edit')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ReadingListTool;
