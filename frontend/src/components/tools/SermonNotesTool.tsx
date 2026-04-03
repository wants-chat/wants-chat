'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Calendar,
  FileText,
  Tag,
  Clock,
  Copy,
  CheckCircle,
  Archive,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';

interface SermonNotesToolProps {
  uiConfig?: UIConfig;
}

interface Sermon {
  id: string;
  title: string;
  seriesName: string;
  scripture: string;
  date: string;
  speaker: string;
  status: 'draft' | 'ready' | 'delivered' | 'archived';
  duration: number;
  introduction: string;
  mainPoints: SermonPoint[];
  conclusion: string;
  applicationPoints: string[];
  illustrations: string[];
  quotes: Quote[];
  notes: string;
  tags: string[];
  audioUrl: string;
  videoUrl: string;
  handoutUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface SermonPoint {
  id: string;
  title: string;
  content: string;
  scripture: string;
  subPoints: string[];
}

interface Quote {
  id: string;
  text: string;
  author: string;
  source: string;
}

interface SermonSeries {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  sermonIds: string[];
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

type TabType = 'sermons' | 'series' | 'templates' | 'archive';
type StatusFilter = 'all' | 'draft' | 'ready' | 'delivered' | 'archived';

const sermonColumns: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'seriesName', header: 'Series', type: 'string' },
  { key: 'scripture', header: 'Scripture', type: 'string' },
  { key: 'speaker', header: 'Speaker', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
];

const defaultSermons: Sermon[] = [];
const defaultSeries: SermonSeries[] = [];

export const SermonNotesTool: React.FC<SermonNotesToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const sermonsToolData = useToolData<Sermon>('sermon-notes', defaultSermons, sermonColumns);
  const seriesToolData = useToolData<SermonSeries>('sermon-series', defaultSeries, []);

  const sermons = sermonsToolData.data;
  const series = seriesToolData.data;

  const [activeTab, setActiveTab] = useState<TabType>('sermons');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [showSermonModal, setShowSermonModal] = useState(false);
  const [showSeriesModal, setShowSeriesModal] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [editingSeries, setEditingSeries] = useState<SermonSeries | null>(null);
  const [viewingSermon, setViewingSermon] = useState<Sermon | null>(null);

  const [sermonForm, setSermonForm] = useState<Partial<Sermon>>({
    title: '',
    seriesName: '',
    scripture: '',
    date: new Date().toISOString().split('T')[0],
    speaker: '',
    status: 'draft',
    duration: 30,
    introduction: '',
    mainPoints: [],
    conclusion: '',
    applicationPoints: [],
    illustrations: [],
    quotes: [],
    notes: '',
    tags: [],
    audioUrl: '',
    videoUrl: '',
    handoutUrl: '',
  });

  const [seriesForm, setSeriesForm] = useState<Partial<SermonSeries>>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    sermonIds: [],
    imageUrl: '',
    isActive: true,
  });

  const [newPoint, setNewPoint] = useState({ title: '', content: '', scripture: '' });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.title || params.content || params.scripture) {
        setSermonForm(prev => ({
          ...prev,
          title: params.title || params.subject || prev.title,
          scripture: params.scripture || params.verse || prev.scripture,
          introduction: params.content || params.text || prev.introduction,
          speaker: params.speaker || params.name || prev.speaker,
        }));
        setShowSermonModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredSermons = useMemo(() => {
    return sermons.filter(s => {
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesSearch = searchQuery === '' ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.scripture.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.seriesName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [sermons, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const drafts = sermons.filter(s => s.status === 'draft').length;
    const ready = sermons.filter(s => s.status === 'ready').length;
    const delivered = sermons.filter(s => s.status === 'delivered').length;
    const activeSeries = series.filter(s => s.isActive).length;

    return { drafts, ready, delivered, activeSeries, total: sermons.length };
  }, [sermons, series]);

  const handleSaveSermon = () => {
    if (!sermonForm.title) return;

    if (editingSermon) {
      sermonsToolData.updateItem(editingSermon.id, {
        ...sermonForm,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newSermon: Sermon = {
        id: `sermon-${Date.now()}`,
        title: sermonForm.title || '',
        seriesName: sermonForm.seriesName || '',
        scripture: sermonForm.scripture || '',
        date: sermonForm.date || new Date().toISOString().split('T')[0],
        speaker: sermonForm.speaker || '',
        status: sermonForm.status || 'draft',
        duration: sermonForm.duration || 30,
        introduction: sermonForm.introduction || '',
        mainPoints: sermonForm.mainPoints || [],
        conclusion: sermonForm.conclusion || '',
        applicationPoints: sermonForm.applicationPoints || [],
        illustrations: sermonForm.illustrations || [],
        quotes: sermonForm.quotes || [],
        notes: sermonForm.notes || '',
        tags: sermonForm.tags || [],
        audioUrl: sermonForm.audioUrl || '',
        videoUrl: sermonForm.videoUrl || '',
        handoutUrl: sermonForm.handoutUrl || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      sermonsToolData.addItem(newSermon);
    }

    resetSermonForm();
    setShowSermonModal(false);
    setEditingSermon(null);
  };

  const handleDeleteSermon = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Sermon',
      message: 'Are you sure you want to delete this sermon?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      sermonsToolData.deleteItem(id);
    }
  };

  const handleDuplicateSermon = (sermon: Sermon) => {
    const duplicate: Sermon = {
      ...sermon,
      id: `sermon-${Date.now()}`,
      title: `${sermon.title} (Copy)`,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sermonsToolData.addItem(duplicate);
  };

  const handleSaveSeries = () => {
    if (!seriesForm.name) return;

    if (editingSeries) {
      seriesToolData.updateItem(editingSeries.id, seriesForm);
    } else {
      const newSeries: SermonSeries = {
        id: `series-${Date.now()}`,
        name: seriesForm.name || '',
        description: seriesForm.description || '',
        startDate: seriesForm.startDate || new Date().toISOString().split('T')[0],
        endDate: seriesForm.endDate || '',
        sermonIds: [],
        imageUrl: seriesForm.imageUrl || '',
        isActive: seriesForm.isActive !== false,
        createdAt: new Date().toISOString(),
      };
      seriesToolData.addItem(newSeries);
    }

    resetSeriesForm();
    setShowSeriesModal(false);
    setEditingSeries(null);
  };

  const handleDeleteSeries = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Series',
      message: 'Are you sure you want to delete this series?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      seriesToolData.deleteItem(id);
    }
  };

  const handleAddPoint = () => {
    if (!newPoint.title) return;
    const point: SermonPoint = {
      id: `point-${Date.now()}`,
      title: newPoint.title,
      content: newPoint.content,
      scripture: newPoint.scripture,
      subPoints: [],
    };
    setSermonForm({
      ...sermonForm,
      mainPoints: [...(sermonForm.mainPoints || []), point],
    });
    setNewPoint({ title: '', content: '', scripture: '' });
  };

  const handleRemovePoint = (pointId: string) => {
    setSermonForm({
      ...sermonForm,
      mainPoints: (sermonForm.mainPoints || []).filter(p => p.id !== pointId),
    });
  };

  const handleAddTag = () => {
    if (!newTag || sermonForm.tags?.includes(newTag)) return;
    setSermonForm({
      ...sermonForm,
      tags: [...(sermonForm.tags || []), newTag],
    });
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setSermonForm({
      ...sermonForm,
      tags: (sermonForm.tags || []).filter(t => t !== tag),
    });
  };

  const resetSermonForm = () => {
    setSermonForm({
      title: '',
      seriesName: '',
      scripture: '',
      date: new Date().toISOString().split('T')[0],
      speaker: '',
      status: 'draft',
      duration: 30,
      introduction: '',
      mainPoints: [],
      conclusion: '',
      applicationPoints: [],
      illustrations: [],
      quotes: [],
      notes: '',
      tags: [],
      audioUrl: '',
      videoUrl: '',
      handoutUrl: '',
    });
    setNewPoint({ title: '', content: '', scripture: '' });
    setNewTag('');
  };

  const resetSeriesForm = () => {
    setSeriesForm({
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      sermonIds: [],
      imageUrl: '',
      isActive: true,
    });
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status: Sermon['status']) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delivered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'sermons', label: 'Sermons', icon: BookOpen },
    { id: 'series', label: 'Series', icon: FileText },
    { id: 'archive', label: 'Archive', icon: Archive },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.sermonNotes.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.sermonNotes.sermonNotesOutlines', 'Sermon Notes & Outlines')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.sermonNotes.planOrganizeAndArchiveYour', 'Plan, organize, and archive your sermons and sermon series')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="sermon-notes" toolName="Sermon Notes" />

              <SyncStatus
                isSynced={sermonsToolData.isSynced}
                isSaving={sermonsToolData.isSaving}
                lastSaved={sermonsToolData.lastSaved}
                syncError={sermonsToolData.syncError}
                onForceSync={sermonsToolData.forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(sermons, sermonColumns, { filename: 'sermons' })}
                onExportExcel={() => exportToExcel(sermons, sermonColumns, { filename: 'sermons' })}
                onExportJSON={() => exportToJSON(sermons, { filename: 'sermons' })}
                onExportPDF={async () => {
                  await exportToPDF(sermons, sermonColumns, {
                    filename: 'sermons',
                    title: 'Sermon Archive',
                    subtitle: `${sermons.length} sermons`,
                  });
                }}
                onPrint={() => printData(sermons, sermonColumns, { title: 'Sermons' })}
                onCopyToClipboard={async () => await copyUtil(sermons, sermonColumns, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sermonNotes.drafts', 'Drafts')}</p>
              <p className={`text-xl font-bold text-yellow-600`}>{stats.drafts}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sermonNotes.ready', 'Ready')}</p>
              <p className={`text-xl font-bold text-green-600`}>{stats.ready}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sermonNotes.delivered', 'Delivered')}</p>
              <p className={`text-xl font-bold text-blue-600`}>{stats.delivered}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sermonNotes.activeSeries', 'Active Series')}</p>
              <p className={`text-xl font-bold text-purple-600`}>{stats.activeSeries}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sermons Tab */}
        {(activeTab === 'sermons' || activeTab === 'archive') && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.sermonNotes.searchSermons', 'Search sermons...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">{t('tools.sermonNotes.allStatus', 'All Status')}</option>
                  <option value="draft">{t('tools.sermonNotes.drafts2', 'Drafts')}</option>
                  <option value="ready">{t('tools.sermonNotes.ready2', 'Ready')}</option>
                  <option value="delivered">{t('tools.sermonNotes.delivered2', 'Delivered')}</option>
                  <option value="archived">{t('tools.sermonNotes.archived', 'Archived')}</option>
                </select>
              </div>
              <button
                onClick={() => { resetSermonForm(); setEditingSermon(null); setShowSermonModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
              >
                <Plus className="w-4 h-4" />
                {t('tools.sermonNotes.newSermon', 'New Sermon')}
              </button>
            </div>

            <div className="space-y-4">
              {filteredSermons
                .filter(s => activeTab === 'archive' ? s.status === 'archived' : s.status !== 'archived')
                .map((sermon) => (
                <div key={sermon.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {sermon.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sermon.status)}`}>
                          {sermon.status}
                        </span>
                      </div>
                      <div className={`flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(sermon.date)}
                        </span>
                        {sermon.scripture && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {sermon.scripture}
                          </span>
                        )}
                        {sermon.seriesName && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {sermon.seriesName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {sermon.duration} min
                        </span>
                      </div>
                      {sermon.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sermon.tags.map(tag => (
                            <span key={tag} className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingSermon(sermon)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        title={t('tools.sermonNotes.view', 'View')}
                      >
                        <BookOpen className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDuplicateSermon(sermon)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        title={t('tools.sermonNotes.duplicate', 'Duplicate')}
                      >
                        <Copy className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => { setSermonForm(sermon); setEditingSermon(sermon); setShowSermonModal(true); }}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteSermon(sermon.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredSermons.filter(s => activeTab === 'archive' ? s.status === 'archived' : s.status !== 'archived').length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activeTab === 'archive' ? t('tools.sermonNotes.noArchivedSermons', 'No archived sermons') : t('tools.sermonNotes.noSermonsFoundCreateYour', 'No sermons found. Create your first sermon!')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Series Tab */}
        {activeTab === 'series' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Sermon Series ({series.length})
              </h2>
              <button
                onClick={() => { resetSeriesForm(); setEditingSeries(null); setShowSeriesModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
              >
                <Plus className="w-4 h-4" />
                {t('tools.sermonNotes.newSeries', 'New Series')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {series.map((s) => (
                <div key={s.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {s.name}
                      </h3>
                      <span className={`text-xs ${s.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        {s.isActive ? t('tools.sermonNotes.active', 'Active') : t('tools.sermonNotes.inactive', 'Inactive')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setSeriesForm(s); setEditingSeries(s); setShowSeriesModal(true); }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteSeries(s.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    {s.description || 'No description'}
                  </p>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {formatDate(s.startDate)} {s.endDate && `- ${formatDate(s.endDate)}`}
                  </div>
                  <div className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {sermons.filter(sermon => sermon.seriesName === s.name).length} sermons
                  </div>
                </div>
              ))}
            </div>
            {series.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.sermonNotes.noSermonSeriesYet', 'No sermon series yet')}
              </div>
            )}
          </div>
        )}

        {/* Sermon Modal */}
        {showSermonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingSermon ? t('tools.sermonNotes.editSermon2', 'Edit Sermon') : t('tools.sermonNotes.newSermon2', 'New Sermon')}
                </h3>
                <button onClick={() => { setShowSermonModal(false); setEditingSermon(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.title', 'Title *')}</label>
                    <input
                      type="text"
                      value={sermonForm.title || ''}
                      onChange={(e) => setSermonForm({ ...sermonForm, title: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.sermonNotes.sermonTitle', 'Sermon title')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.scripture', 'Scripture')}</label>
                    <input
                      type="text"
                      value={sermonForm.scripture || ''}
                      onChange={(e) => setSermonForm({ ...sermonForm, scripture: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.sermonNotes.eGJohn316', 'e.g., John 3:16-17')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.series', 'Series')}</label>
                    <select
                      value={sermonForm.seriesName || ''}
                      onChange={(e) => setSermonForm({ ...sermonForm, seriesName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">{t('tools.sermonNotes.noSeries', 'No series')}</option>
                      {series.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.date', 'Date')}</label>
                    <input
                      type="date"
                      value={sermonForm.date || ''}
                      onChange={(e) => setSermonForm({ ...sermonForm, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.speaker', 'Speaker')}</label>
                    <input
                      type="text"
                      value={sermonForm.speaker || ''}
                      onChange={(e) => setSermonForm({ ...sermonForm, speaker: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.status', 'Status')}</label>
                    <select
                      value={sermonForm.status || 'draft'}
                      onChange={(e) => setSermonForm({ ...sermonForm, status: e.target.value as Sermon['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="draft">{t('tools.sermonNotes.draft', 'Draft')}</option>
                      <option value="ready">{t('tools.sermonNotes.ready3', 'Ready')}</option>
                      <option value="delivered">{t('tools.sermonNotes.delivered3', 'Delivered')}</option>
                      <option value="archived">{t('tools.sermonNotes.archived2', 'Archived')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.durationMin', 'Duration (min)')}</label>
                    <input
                      type="number"
                      value={sermonForm.duration || 30}
                      onChange={(e) => setSermonForm({ ...sermonForm, duration: parseInt(e.target.value) || 30 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.introduction', 'Introduction')}</label>
                  <textarea
                    value={sermonForm.introduction || ''}
                    onChange={(e) => setSermonForm({ ...sermonForm, introduction: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.sermonNotes.openingThoughtsHookOrIntroduction', 'Opening thoughts, hook, or introduction...')}
                  />
                </div>

                {/* Main Points */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.mainPoints', 'Main Points')}</label>
                  <div className="space-y-2 mb-2">
                    {(sermonForm.mainPoints || []).map((point, index) => (
                      <div key={point.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {index + 1}. {point.title}
                            </p>
                            {point.scripture && (
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {point.scripture}
                              </p>
                            )}
                            {point.content && (
                              <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {point.content}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemovePoint(point.id)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`p-3 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={newPoint.title}
                        onChange={(e) => setNewPoint({ ...newPoint, title: e.target.value })}
                        className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        placeholder={t('tools.sermonNotes.pointTitle', 'Point title')}
                      />
                      <input
                        type="text"
                        value={newPoint.scripture}
                        onChange={(e) => setNewPoint({ ...newPoint, scripture: e.target.value })}
                        className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        placeholder={t('tools.sermonNotes.scriptureReference', 'Scripture reference')}
                      />
                    </div>
                    <textarea
                      value={newPoint.content}
                      onChange={(e) => setNewPoint({ ...newPoint, content: e.target.value })}
                      rows={2}
                      className={`w-full px-3 py-2 rounded-lg border mb-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.sermonNotes.pointContent', 'Point content...')}
                    />
                    <button
                      onClick={handleAddPoint}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                    >
                      <Plus className="w-3 h-3" />
                      {t('tools.sermonNotes.addPoint', 'Add Point')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.conclusion', 'Conclusion')}</label>
                  <textarea
                    value={sermonForm.conclusion || ''}
                    onChange={(e) => setSermonForm({ ...sermonForm, conclusion: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.sermonNotes.closingThoughtsCallToAction', 'Closing thoughts, call to action...')}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.tags', 'Tags')}</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(sermonForm.tags || []).map(tag => (
                      <span key={tag} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.sermonNotes.addTag', 'Add tag...')}
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.notes', 'Notes')}</label>
                  <textarea
                    value={sermonForm.notes || ''}
                    onChange={(e) => setSermonForm({ ...sermonForm, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.sermonNotes.additionalNotes', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowSermonModal(false); setEditingSermon(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.sermonNotes.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveSermon}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingSermon ? t('tools.sermonNotes.saveChanges', 'Save Changes') : t('tools.sermonNotes.createSermon', 'Create Sermon')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Series Modal */}
        {showSeriesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingSeries ? t('tools.sermonNotes.editSeries', 'Edit Series') : t('tools.sermonNotes.newSeries2', 'New Series')}
                </h3>
                <button onClick={() => { setShowSeriesModal(false); setEditingSeries(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.seriesName', 'Series Name *')}</label>
                  <input
                    type="text"
                    value={seriesForm.name || ''}
                    onChange={(e) => setSeriesForm({ ...seriesForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.description', 'Description')}</label>
                  <textarea
                    value={seriesForm.description || ''}
                    onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.startDate', 'Start Date')}</label>
                    <input
                      type="date"
                      value={seriesForm.startDate || ''}
                      onChange={(e) => setSeriesForm({ ...seriesForm, startDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sermonNotes.endDate', 'End Date')}</label>
                    <input
                      type="date"
                      value={seriesForm.endDate || ''}
                      onChange={(e) => setSeriesForm({ ...seriesForm, endDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="seriesActive"
                    checked={seriesForm.isActive !== false}
                    onChange={(e) => setSeriesForm({ ...seriesForm, isActive: e.target.checked })}
                    className="rounded text-[#0D9488]"
                  />
                  <label htmlFor="seriesActive" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.sermonNotes.activeSeries2', 'Active Series')}
                  </label>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowSeriesModal(false); setEditingSeries(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.sermonNotes.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveSeries}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingSeries ? t('tools.sermonNotes.saveChanges2', 'Save Changes') : t('tools.sermonNotes.createSeries', 'Create Series')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Sermon Modal */}
        {viewingSermon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {viewingSermon.title}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {viewingSermon.scripture} • {formatDate(viewingSermon.date)}
                  </p>
                </div>
                <button onClick={() => setViewingSermon(null)} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {viewingSermon.introduction && (
                  <div>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sermonNotes.introduction2', 'Introduction')}</h4>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{viewingSermon.introduction}</p>
                  </div>
                )}
                {viewingSermon.mainPoints.length > 0 && (
                  <div>
                    <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sermonNotes.mainPoints2', 'Main Points')}</h4>
                    <div className="space-y-4">
                      {viewingSermon.mainPoints.map((point, index) => (
                        <div key={point.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {index + 1}. {point.title}
                          </h5>
                          {point.scripture && (
                            <p className={`text-sm text-[#0D9488] mt-1`}>{point.scripture}</p>
                          )}
                          {point.content && (
                            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{point.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {viewingSermon.conclusion && (
                  <div>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sermonNotes.conclusion2', 'Conclusion')}</h4>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{viewingSermon.conclusion}</p>
                  </div>
                )}
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setViewingSermon(null)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.sermonNotes.close', 'Close')}
                </button>
                <button
                  onClick={() => {
                    setSermonForm(viewingSermon);
                    setEditingSermon(viewingSermon);
                    setViewingSermon(null);
                    setShowSermonModal(true);
                  }}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {t('tools.sermonNotes.editSermon', 'Edit Sermon')}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default SermonNotesTool;
