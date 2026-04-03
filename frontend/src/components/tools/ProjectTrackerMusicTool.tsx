import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, FolderOpen, Clock, CheckCircle2, Plus, Trash2, Sparkles, Loader2, Edit2, Play, Pause, Calendar, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Track {
  id: string;
  name: string;
  status: 'idea' | 'recording' | 'mixing' | 'mastering' | 'complete';
  duration: string;
  bpm: number;
  key: string;
  notes: string;
}

interface MusicProject {
  id: string;
  title: string;
  artist: string;
  genre: string;
  projectType: 'album' | 'ep' | 'single' | 'compilation' | 'soundtrack' | 'demo';
  clientName: string;
  clientEmail: string;
  producer: string;
  engineer: string;
  startDate: string;
  deadline: string;
  budget: number;
  spent: number;
  tracks: Track[];
  status: 'planning' | 'pre-production' | 'recording' | 'mixing' | 'mastering' | 'complete' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  createdAt: string;
}

const projectTypes = [
  { value: 'album', label: 'Full Album' },
  { value: 'ep', label: 'EP' },
  { value: 'single', label: 'Single' },
  { value: 'compilation', label: 'Compilation' },
  { value: 'soundtrack', label: 'Soundtrack' },
  { value: 'demo', label: 'Demo' },
];

const genres = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Country', 'Jazz', 'Classical',
  'Indie', 'Metal', 'Folk', 'Reggae', 'Latin', 'Soul', 'Blues', 'Punk', 'Other'
];

const COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Project Title', type: 'string' },
  { key: 'artist', header: 'Artist', type: 'string' },
  { key: 'genre', header: 'Genre', type: 'string' },
  { key: 'projectType', header: 'Type', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'producer', header: 'Producer', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'deadline', header: 'Deadline', type: 'date' },
  { key: 'budget', header: 'Budget', type: 'currency' },
  { key: 'spent', header: 'Spent', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'trackCount', header: 'Tracks', type: 'number' },
];

interface ProjectTrackerMusicToolProps {
  uiConfig?: UIConfig;
}

export const ProjectTrackerMusicTool: React.FC<ProjectTrackerMusicToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const emptyTrack: Track = {
    id: '',
    name: '',
    status: 'idea',
    duration: '',
    bpm: 120,
    key: 'C Major',
    notes: '',
  };

  const emptyForm: Omit<MusicProject, 'id' | 'createdAt'> = {
    title: '',
    artist: '',
    genre: 'Pop',
    projectType: 'album',
    clientName: '',
    clientEmail: '',
    producer: '',
    engineer: '',
    startDate: '',
    deadline: '',
    budget: 0,
    spent: 0,
    tracks: [],
    status: 'planning',
    priority: 'medium',
    notes: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [newTrack, setNewTrack] = useState(emptyTrack);

  const {
    data: projects,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<MusicProject>('music-project-tracker', [], COLUMNS);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.title || params.projectTitle) {
        setFormData(prev => ({ ...prev, title: (params.title || params.projectTitle) as string }));
        hasChanges = true;
      }
      if (params.artist) {
        setFormData(prev => ({ ...prev, artist: params.artist as string }));
        hasChanges = true;
      }
      if (params.genre) {
        setFormData(prev => ({ ...prev, genre: params.genre as string }));
        hasChanges = true;
      }
      if (params.projectType) {
        setFormData(prev => ({ ...prev, projectType: params.projectType as MusicProject['projectType'] }));
        hasChanges = true;
      }
      if (params.clientName || params.client) {
        setFormData(prev => ({ ...prev, clientName: (params.clientName || params.client) as string }));
        hasChanges = true;
      }
      if (params.budget) {
        setFormData(prev => ({ ...prev, budget: params.budget as number }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
        setShowForm(true);
      }
    }
  }, [uiConfig?.params]);

  const addTrack = () => {
    if (!newTrack.name) return;
    const track: Track = { ...newTrack, id: Date.now().toString() };
    setFormData({ ...formData, tracks: [...formData.tracks, track] });
    setNewTrack(emptyTrack);
  };

  const removeTrack = (trackId: string) => {
    setFormData({ ...formData, tracks: formData.tracks.filter(t => t.id !== trackId) });
  };

  const saveProject = () => {
    if (!formData.title || !formData.artist) return;

    if (editingId) {
      updateItem(editingId, formData);
      setEditingId(null);
    } else {
      const newProject: MusicProject = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      addItem(newProject);
    }
    setShowForm(false);
    setFormData(emptyForm);
  };

  const handleEdit = (project: MusicProject) => {
    setFormData({
      title: project.title,
      artist: project.artist,
      genre: project.genre,
      projectType: project.projectType,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      producer: project.producer,
      engineer: project.engineer,
      startDate: project.startDate,
      deadline: project.deadline,
      budget: project.budget,
      spent: project.spent,
      tracks: project.tracks,
      status: project.status,
      priority: project.priority,
      notes: project.notes,
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const updateTrackStatus = (projectId: string, trackId: string, status: Track['status']) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const updatedTracks = project.tracks.map(t => t.id === trackId ? { ...t, status } : t);
    updateItem(projectId, { tracks: updatedTracks });
  };

  const getProjectProgress = (project: MusicProject): number => {
    if (project.tracks.length === 0) return 0;
    const completed = project.tracks.filter(t => t.status === 'complete').length;
    return Math.round((completed / project.tracks.length) * 100);
  };

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch = searchTerm === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => !['complete', 'on-hold'].includes(p.status)).length,
    complete: projects.filter(p => p.status === 'complete').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
    totalTracks: projects.reduce((sum, p) => sum + p.tracks.length, 0),
  };

  const statusColors: Record<string, string> = {
    planning: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    'pre-production': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    recording: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    mixing: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    mastering: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    complete: 'bg-green-500/10 text-green-500 border-green-500/20',
    'on-hold': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  const priorityColors: Record<string, string> = {
    low: 'text-gray-500',
    medium: 'text-blue-500',
    high: 'text-orange-500',
    urgent: 'text-red-500',
  };

  const trackStatusColors: Record<string, string> = {
    idea: 'bg-gray-500/20 text-gray-400',
    recording: 'bg-purple-500/20 text-purple-400',
    mixing: 'bg-orange-500/20 text-orange-400',
    mastering: 'bg-pink-500/20 text-pink-400',
    complete: 'bg-green-500/20 text-green-400',
  };

  const inputClass = `w-full p-3 rounded-lg border ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;
  const cardClass = `p-4 rounded-xl border ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'} shadow-sm`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  const expandedProject = selectedProject ? projects.find(p => p.id === selectedProject) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] mb-4">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.projectTrackerMusic.musicProjectTracker', 'Music Project Tracker')}</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.projectTrackerMusic.trackAlbumsEpsAndRecording', 'Track albums, EPs, and recording projects')}</p>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.projectTrackerMusic.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <FolderOpen className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.projectTrackerMusic.total', 'Total')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Play className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.projectTrackerMusic.active', 'Active')}</p>
              <p className="text-xl font-bold text-purple-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.projectTrackerMusic.complete', 'Complete')}</p>
              <p className="text-xl font-bold text-green-500">{stats.complete}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Music className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.projectTrackerMusic.tracks', 'Tracks')}</p>
              <p className="text-xl font-bold text-blue-500">{stats.totalTracks}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.projectTrackerMusic.budget', 'Budget')}</p>
              <p className="text-xl font-bold text-orange-500">${stats.totalBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Users className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.projectTrackerMusic.spent', 'Spent')}</p>
              <p className="text-xl font-bold text-pink-500">${stats.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t('tools.projectTrackerMusic.searchProjects', 'Search projects...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('tools.projectTrackerMusic.allStatus', 'All Status')}</option>
            <option value="planning">{t('tools.projectTrackerMusic.planning', 'Planning')}</option>
            <option value="pre-production">{t('tools.projectTrackerMusic.preProduction', 'Pre-Production')}</option>
            <option value="recording">{t('tools.projectTrackerMusic.recording', 'Recording')}</option>
            <option value="mixing">{t('tools.projectTrackerMusic.mixing', 'Mixing')}</option>
            <option value="mastering">{t('tools.projectTrackerMusic.mastering', 'Mastering')}</option>
            <option value="complete">{t('tools.projectTrackerMusic.complete2', 'Complete')}</option>
            <option value="on-hold">{t('tools.projectTrackerMusic.onHold', 'On Hold')}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="project-tracker-music" toolName="Project Tracker Music" />

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
            onExportCSV={() => exportCSV({ filename: 'music-projects' })}
            onExportExcel={() => exportExcel({ filename: 'music-projects' })}
            onExportJSON={() => exportJSON({ filename: 'music-projects' })}
            onExportPDF={() => exportPDF({
              filename: 'music-projects',
              title: 'Music Projects',
              subtitle: `${stats.total} projects - ${stats.totalTracks} tracks`
            })}
            onPrint={() => print('Music Projects')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={isDark ? 'dark' : 'light'}
            disabled={projects.length === 0}
          />
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.projectTrackerMusic.newProject', 'New Project')}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className={cardClass}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? t('tools.projectTrackerMusic.editProject', 'Edit Project') : t('tools.projectTrackerMusic.newProject2', 'New Project')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.projectTitle', 'Project Title *')}</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClass}
                placeholder={t('tools.projectTrackerMusic.albumOrProjectName', 'Album or project name')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.artist', 'Artist *')}</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className={inputClass}
                placeholder={t('tools.projectTrackerMusic.artistOrBandName', 'Artist or band name')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.genre', 'Genre')}</label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className={inputClass}
              >
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.projectType', 'Project Type')}</label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value as MusicProject['projectType'] })}
                className={inputClass}
              >
                {projectTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.clientName', 'Client Name')}</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className={inputClass}
                placeholder={t('tools.projectTrackerMusic.labelOrClient', 'Label or client')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.clientEmail', 'Client Email')}</label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className={inputClass}
                placeholder={t('tools.projectTrackerMusic.clientEmailCom', 'client@email.com')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.producer', 'Producer')}</label>
              <input
                type="text"
                value={formData.producer}
                onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.engineer', 'Engineer')}</label>
              <input
                type="text"
                value={formData.engineer}
                onChange={(e) => setFormData({ ...formData, engineer: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.startDate', 'Start Date')}</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.deadline', 'Deadline')}</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.budget2', 'Budget ($)')}</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.spent2', 'Spent ($)')}</label>
              <input
                type="number"
                value={formData.spent}
                onChange={(e) => setFormData({ ...formData, spent: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.status', 'Status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MusicProject['status'] })}
                className={inputClass}
              >
                <option value="planning">{t('tools.projectTrackerMusic.planning2', 'Planning')}</option>
                <option value="pre-production">{t('tools.projectTrackerMusic.preProduction2', 'Pre-Production')}</option>
                <option value="recording">{t('tools.projectTrackerMusic.recording2', 'Recording')}</option>
                <option value="mixing">{t('tools.projectTrackerMusic.mixing2', 'Mixing')}</option>
                <option value="mastering">{t('tools.projectTrackerMusic.mastering2', 'Mastering')}</option>
                <option value="complete">{t('tools.projectTrackerMusic.complete3', 'Complete')}</option>
                <option value="on-hold">{t('tools.projectTrackerMusic.onHold2', 'On Hold')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.projectTrackerMusic.priority', 'Priority')}</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as MusicProject['priority'] })}
                className={inputClass}
              >
                <option value="low">{t('tools.projectTrackerMusic.low', 'Low')}</option>
                <option value="medium">{t('tools.projectTrackerMusic.medium', 'Medium')}</option>
                <option value="high">{t('tools.projectTrackerMusic.high', 'High')}</option>
                <option value="urgent">{t('tools.projectTrackerMusic.urgent', 'Urgent')}</option>
              </select>
            </div>
          </div>

          {/* Track List */}
          <div className="mt-6">
            <label className={labelClass}>Tracks ({formData.tracks.length})</label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
              <input
                type="text"
                placeholder={t('tools.projectTrackerMusic.trackName', 'Track name')}
                value={newTrack.name}
                onChange={(e) => setNewTrack({ ...newTrack, name: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder={t('tools.projectTrackerMusic.durationEG345', 'Duration (e.g., 3:45)')}
                value={newTrack.duration}
                onChange={(e) => setNewTrack({ ...newTrack, duration: e.target.value })}
                className={inputClass}
              />
              <input
                type="number"
                placeholder={t('tools.projectTrackerMusic.bpm', 'BPM')}
                value={newTrack.bpm}
                onChange={(e) => setNewTrack({ ...newTrack, bpm: parseInt(e.target.value) || 120 })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder={t('tools.projectTrackerMusic.keyEGCMajor', 'Key (e.g., C Major)')}
                value={newTrack.key}
                onChange={(e) => setNewTrack({ ...newTrack, key: e.target.value })}
                className={inputClass}
              />
              <button
                onClick={addTrack}
                disabled={!newTrack.name}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.tracks.length > 0 && (
              <div className="space-y-2 mt-4">
                {formData.tracks.map((track, index) => (
                  <div key={track.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-[#252525]' : 'bg-gray-50'}`}>
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{index + 1}</span>
                    <span className={`flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{track.name}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{track.duration}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{track.bpm} BPM</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{track.key}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${trackStatusColors[track.status]}`}>{track.status}</span>
                    <button onClick={() => removeTrack(track.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className={labelClass}>{t('tools.projectTrackerMusic.notes', 'Notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`${inputClass} h-20 resize-none`}
              placeholder={t('tools.projectTrackerMusic.projectNotes', 'Project notes...')}
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={saveProject}
              disabled={!formData.title || !formData.artist}
              className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? t('tools.projectTrackerMusic.updateProject', 'Update Project') : t('tools.projectTrackerMusic.saveProject', 'Save Project')}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }}
              className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#252525] text-white hover:bg-[#333]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {t('tools.projectTrackerMusic.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className={`${cardClass} text-center py-12`}>
            <Music className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.projectTrackerMusic.noProjectsFound', 'No projects found')}</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-[#0D9488] hover:underline"
            >
              {t('tools.projectTrackerMusic.createYourFirstProject', 'Create your first project')}
            </button>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {project.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                    <span className={`text-xs font-medium ${priorityColors[project.priority]}`}>
                      {project.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {project.artist} • {project.genre} • {projectTypes.find(t => t.value === project.projectType)?.label}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {project.tracks.length} tracks • {project.producer && `Producer: ${project.producer}`}
                  </p>
                  {project.deadline && (
                    <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Calendar className="w-3 h-3" /> Deadline: {project.deadline}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.projectTrackerMusic.progress', 'Progress')}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{getProjectProgress(project)}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-[#252525]' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full bg-[#0D9488] transition-all"
                        style={{ width: `${getProjectProgress(project)}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget Info */}
                  {project.budget > 0 && (
                    <div className="mt-2 flex items-center gap-4">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Budget: ${project.budget.toLocaleString()}
                      </span>
                      <span className={`text-sm ${project.spent > project.budget ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Spent: ${project.spent.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Expandable Tracks */}
                  {selectedProject === project.id && project.tracks.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h5 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.projectTrackerMusic.trackList', 'Track List')}</h5>
                      {project.tracks.map((track, idx) => (
                        <div key={track.id} className={`flex items-center gap-3 p-2 rounded ${isDark ? 'bg-[#252525]' : 'bg-gray-50'}`}>
                          <span className={`w-6 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{idx + 1}</span>
                          <span className={`flex-1 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{track.name}</span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{track.duration}</span>
                          <select
                            value={track.status}
                            onChange={(e) => updateTrackStatus(project.id, track.id, e.target.value as Track['status'])}
                            className={`text-xs p-1 rounded ${isDark ? 'bg-[#333] border-[#444] text-white' : 'bg-white border-gray-200'}`}
                          >
                            <option value="idea">{t('tools.projectTrackerMusic.idea', 'Idea')}</option>
                            <option value="recording">{t('tools.projectTrackerMusic.recording3', 'Recording')}</option>
                            <option value="mixing">{t('tools.projectTrackerMusic.mixing3', 'Mixing')}</option>
                            <option value="mastering">{t('tools.projectTrackerMusic.mastering3', 'Mastering')}</option>
                            <option value="complete">{t('tools.projectTrackerMusic.complete4', 'Complete')}</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-100'}`}
                  >
                    {selectedProject === project.id ? <Pause className="w-4 h-4 text-[#0D9488]" /> : <Play className="w-4 h-4 text-[#0D9488]" />}
                  </button>
                  <button
                    onClick={() => handleEdit(project)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-100'}`}
                  >
                    <Edit2 className="w-4 h-4 text-[#0D9488]" />
                  </button>
                  <button
                    onClick={() => deleteItem(project.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectTrackerMusicTool;
