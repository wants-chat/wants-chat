'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Video,
  User,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  Edit2,
  Save,
  X,
  FileText,
  Users,
  Phone,
  Mail,
  Building,
  Camera,
  Mic,
  AlertTriangle,
  CheckSquare,
  BookOpen,
  Briefcase,
  ClipboardList,
  DollarSign,
  ExternalLink,
  Filter,
  Gavel,
  Layers,
  MessageSquare,
  PlayCircle,
  Scale,
  Send,
  Settings,
  Timer,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';

interface DepositionSchedulerToolProps {
  uiConfig?: UIConfig;
}

// Types
interface CourtReporter {
  name: string;
  company: string;
  phone: string;
  email: string;
  confirmed: boolean;
}

interface PrepSession {
  id: string;
  date: string;
  duration: number;
  attorney: string;
  notes: string;
}

interface DepoPrep {
  prepSessions: PrepSession[];
  outlineCompleted: boolean;
  exhibitsReady: boolean;
  subpoenaServed?: boolean;
  subpoenaServedDate?: string;
}

interface Exhibit {
  id: string;
  number: string;
  description: string;
  markedAt?: string;
}

interface TranscriptInfo {
  ordered: boolean;
  orderedDate?: string;
  receivedDate?: string;
  pages?: number;
  cost?: number;
  expedited: boolean;
}

interface Deposition {
  id: string;
  matterId: string;
  matterName: string;
  deponentName: string;
  deponentType: 'party' | 'witness' | 'expert' | 'corporate-representative';
  scheduledDate: string;
  startTime: string;
  estimatedDuration: number;
  location: string;
  locationType: 'in-person' | 'video' | 'hybrid';
  videoPlatform?: string;
  courtReporter: CourtReporter;
  videographer?: string;
  examiningAttorney: string;
  defendingAttorney?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  preparation: DepoPrep;
  exhibits: Exhibit[];
  transcript?: TranscriptInfo;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const TOOL_ID = 'deposition-scheduler';

const depositionColumns: ColumnConfig[] = [
  { key: 'matterName', header: 'Matter', type: 'string' },
  { key: 'deponentName', header: 'Deponent', type: 'string' },
  { key: 'deponentType', header: 'Type', type: 'string' },
  { key: 'scheduledDate', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Time', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'examiningAttorney', header: 'Examining Attorney', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewDeposition = (): Deposition => ({
  id: crypto.randomUUID(),
  matterId: '',
  matterName: '',
  deponentName: '',
  deponentType: 'witness',
  scheduledDate: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  estimatedDuration: 4,
  location: '',
  locationType: 'in-person',
  videoPlatform: '',
  courtReporter: {
    name: '',
    company: '',
    phone: '',
    email: '',
    confirmed: false,
  },
  videographer: '',
  examiningAttorney: '',
  defendingAttorney: '',
  status: 'scheduled',
  preparation: {
    prepSessions: [],
    outlineCompleted: false,
    exhibitsReady: false,
    subpoenaServed: false,
    subpoenaServedDate: '',
  },
  exhibits: [],
  transcript: {
    ordered: false,
    orderedDate: '',
    receivedDate: '',
    pages: 0,
    cost: 0,
    expedited: false,
  },
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const deponentTypes = [
  { value: 'party', label: 'Party', icon: User },
  { value: 'witness', label: 'Fact Witness', icon: Users },
  { value: 'expert', label: 'Expert Witness', icon: BookOpen },
  { value: 'corporate-representative', label: 'Corporate Rep (30(b)(6))', icon: Building },
];

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
];

const locationTypes = [
  { value: 'in-person', label: 'In-Person', icon: Building },
  { value: 'video', label: 'Video Conference', icon: Video },
  { value: 'hybrid', label: 'Hybrid', icon: Layers },
];

const videoPlatforms = ['Zoom', 'Teams', 'WebEx', 'Google Meet', 'GoToMeeting', 'Other'];

export const DepositionSchedulerTool: React.FC<DepositionSchedulerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: depositions,
    addItem: addDeposition,
    updateItem: updateDeposition,
    deleteItem: deleteDeposition,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Deposition>(TOOL_ID, [], depositionColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMatter, setFilterMatter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [showExhibitModal, setShowExhibitModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [selectedDeposition, setSelectedDeposition] = useState<Deposition | null>(null);
  const [editingDeposition, setEditingDeposition] = useState<Deposition | null>(null);
  const [formData, setFormData] = useState<Deposition>(createNewDeposition());
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');

  const [newPrepSession, setNewPrepSession] = useState<Omit<PrepSession, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    attorney: '',
    notes: '',
  });

  const [newExhibit, setNewExhibit] = useState<Omit<Exhibit, 'id'>>({
    number: '',
    description: '',
    markedAt: '',
  });

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonth = depositions.filter(d => {
      const date = new Date(d.scheduledDate);
      return date >= startOfMonth && date <= endOfMonth;
    });

    const upcoming = depositions.filter(d =>
      new Date(d.scheduledDate) >= now &&
      (d.status === 'scheduled' || d.status === 'confirmed')
    );

    const pendingTranscripts = depositions.filter(d =>
      d.status === 'completed' &&
      d.transcript &&
      d.transcript.ordered &&
      !d.transcript.receivedDate
    );

    const matterCounts: Record<string, number> = {};
    depositions.forEach(d => {
      matterCounts[d.matterName] = (matterCounts[d.matterName] || 0) + 1;
    });

    return {
      total: depositions.length,
      thisMonth: thisMonth.length,
      upcoming: upcoming.length,
      pendingTranscripts: pendingTranscripts.length,
      byMatter: matterCounts,
    };
  }, [depositions]);

  // Unique matters for filtering
  const uniqueMatters = useMemo(() => {
    const matters = [...new Set(depositions.map(d => d.matterName))].filter(Boolean);
    return matters.sort();
  }, [depositions]);

  // Filtered depositions
  const filteredDepositions = useMemo(() => {
    return depositions.filter(deposition => {
      const matchesSearch = searchQuery === '' ||
        deposition.deponentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deposition.matterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deposition.examiningAttorney.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || deposition.status === filterStatus;
      const matchesMatter = filterMatter === '' || deposition.matterName === filterMatter;
      return matchesSearch && matchesStatus && matchesMatter;
    }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [depositions, searchQuery, filterStatus, filterMatter]);

  const handleSave = () => {
    if (editingDeposition) {
      updateDeposition(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addDeposition({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingDeposition(null);
    setFormData(createNewDeposition());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Deposition',
      message: 'Are you sure you want to delete this deposition? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteDeposition(id);
      if (selectedDeposition?.id === id) setSelectedDeposition(null);
    }
  };

  const openEditModal = (deposition: Deposition) => {
    setEditingDeposition(deposition);
    setFormData(deposition);
    setShowModal(true);
  };

  const addPrepSession = () => {
    if (selectedDeposition && newPrepSession.attorney.trim()) {
      const session: PrepSession = { ...newPrepSession, id: crypto.randomUUID() };
      const updated = {
        ...selectedDeposition,
        preparation: {
          ...selectedDeposition.preparation,
          prepSessions: [...selectedDeposition.preparation.prepSessions, session],
        },
        updatedAt: new Date().toISOString(),
      };
      updateDeposition(selectedDeposition.id, updated);
      setSelectedDeposition(updated);
      setShowPrepModal(false);
      setNewPrepSession({ date: new Date().toISOString().split('T')[0], duration: 60, attorney: '', notes: '' });
    }
  };

  const addExhibit = () => {
    if (selectedDeposition && newExhibit.number.trim()) {
      const exhibit: Exhibit = { ...newExhibit, id: crypto.randomUUID() };
      const updated = {
        ...selectedDeposition,
        exhibits: [...selectedDeposition.exhibits, exhibit],
        updatedAt: new Date().toISOString(),
      };
      updateDeposition(selectedDeposition.id, updated);
      setSelectedDeposition(updated);
      setShowExhibitModal(false);
      setNewExhibit({ number: '', description: '', markedAt: '' });
    }
  };

  const updateTranscript = (transcriptData: Partial<TranscriptInfo>) => {
    if (selectedDeposition) {
      const updated = {
        ...selectedDeposition,
        transcript: { ...selectedDeposition.transcript, ...transcriptData } as TranscriptInfo,
        updatedAt: new Date().toISOString(),
      };
      updateDeposition(selectedDeposition.id, updated);
      setSelectedDeposition(updated);
    }
  };

  const updatePreparation = (prepData: Partial<DepoPrep>) => {
    if (selectedDeposition) {
      const updated = {
        ...selectedDeposition,
        preparation: { ...selectedDeposition.preparation, ...prepData },
        updatedAt: new Date().toISOString(),
      };
      updateDeposition(selectedDeposition.id, updated);
      setSelectedDeposition(updated);
    }
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = deponentTypes.find(t => t.value === type);
    return typeConfig?.icon || User;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-purple-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl">
            <Gavel className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.depositionScheduler.depositionScheduler', 'Deposition Scheduler')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.depositionScheduler.scheduleAndManageDepositionsWitness', 'Schedule and manage depositions, witness prep, and transcripts')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="deposition-scheduler" toolName="Deposition Scheduler" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme as 'light' | 'dark'}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'deposition-scheduler' })}
            onExportExcel={() => exportExcel({ filename: 'deposition-scheduler' })}
            onExportJSON={() => exportJSON({ filename: 'deposition-scheduler' })}
            onExportPDF={() => exportPDF({ filename: 'deposition-scheduler', title: 'Deposition Records' })}
            onPrint={() => print('Deposition Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={depositions.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewDeposition()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.depositionScheduler.scheduleDeposition', 'Schedule Deposition')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.depositionScheduler.thisMonth', 'This Month')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.thisMonth}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.depositionScheduler.upcoming', 'Upcoming')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.upcoming}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.depositionScheduler.pendingTranscripts', 'Pending Transcripts')}</p>
              <p className="text-2xl font-bold text-orange-500">{stats.pendingTranscripts}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.depositionScheduler.total', 'Total')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.depositionScheduler.searchDeponentMatterOrAttorney', 'Search deponent, matter, or attorney...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.depositionScheduler.allStatuses', 'All Statuses')}</option>
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterMatter} onChange={(e) => setFilterMatter(e.target.value)} className={`${inputClass} w-full sm:w-48`}>
            <option value="">{t('tools.depositionScheduler.allMatters', 'All Matters')}</option>
            {uniqueMatters.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposition List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.depositionScheduler.depositions', 'Depositions')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredDepositions.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Gavel className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.depositionScheduler.noDepositionsScheduled', 'No depositions scheduled')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredDepositions.map(deposition => {
                  const TypeIcon = getTypeIcon(deposition.deponentType);
                  return (
                    <div
                      key={deposition.id}
                      onClick={() => setSelectedDeposition(deposition)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedDeposition?.id === deposition.id
                          ? 'bg-purple-500/10 border-l-4 border-purple-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <TypeIcon className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-medium">{deposition.deponentName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {deposition.matterName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(deposition.status)}`}>
                                {statusOptions.find(s => s.value === deposition.status)?.label}
                              </span>
                            </div>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {formatDate(deposition.scheduledDate)} at {formatTime(deposition.startTime)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(deposition); }} className="p-1.5 hover:bg-gray-600 rounded">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(deposition.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedDeposition ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedDeposition.deponentName}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedDeposition.status)}`}>
                        {statusOptions.find(s => s.value === selectedDeposition.status)?.label}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {deponentTypes.find(t => t.value === selectedDeposition.deponentType)?.label} | {selectedDeposition.matterName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowPrepModal(true)} className={buttonSecondary}>
                      <ClipboardList className="w-4 h-4" /> Prep Session
                    </button>
                    <button onClick={() => setShowExhibitModal(true)} className={buttonSecondary}>
                      <FileText className="w-4 h-4" /> Add Exhibit
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Scheduling Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.depositionScheduler.date', 'Date')}</p>
                    <p className="font-medium">{formatDate(selectedDeposition.scheduledDate)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.depositionScheduler.time', 'Time')}</p>
                    <p className="font-medium">{formatTime(selectedDeposition.startTime)} ({selectedDeposition.estimatedDuration}h)</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.depositionScheduler.location', 'Location')}</p>
                    <p className="font-medium capitalize">{selectedDeposition.locationType}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.depositionScheduler.examiningAttorney', 'Examining Attorney')}</p>
                    <p className="font-medium">{selectedDeposition.examiningAttorney || 'N/A'}</p>
                  </div>
                </div>

                {/* Location Details */}
                {selectedDeposition.location && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      {t('tools.depositionScheduler.location2', 'Location')}
                    </h3>
                    <p className="text-sm">{selectedDeposition.location}</p>
                    {selectedDeposition.videoPlatform && (
                      <p className="text-sm mt-1">
                        <span className="text-gray-400">{t('tools.depositionScheduler.platform', 'Platform:')}</span> {selectedDeposition.videoPlatform}
                      </p>
                    )}
                  </div>
                )}

                {/* Court Reporter */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-purple-500" />
                    Court Reporter
                    {selectedDeposition.courtReporter.confirmed && (
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">{t('tools.depositionScheduler.confirmed', 'Confirmed')}</span>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">{t('tools.depositionScheduler.name', 'Name:')}</span> {selectedDeposition.courtReporter.name || 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-400">{t('tools.depositionScheduler.company', 'Company:')}</span> {selectedDeposition.courtReporter.company || 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-400">{t('tools.depositionScheduler.phone', 'Phone:')}</span> {selectedDeposition.courtReporter.phone || 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-400">{t('tools.depositionScheduler.email', 'Email:')}</span> {selectedDeposition.courtReporter.email || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Preparation Status */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-purple-500" />
                    {t('tools.depositionScheduler.preparationStatus', 'Preparation Status')}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDeposition.preparation.outlineCompleted}
                        onChange={(e) => updatePreparation({ outlineCompleted: e.target.checked })}
                        className="w-4 h-4 rounded text-purple-600"
                      />
                      <span className="text-sm">{t('tools.depositionScheduler.outlineCompleted', 'Outline Completed')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDeposition.preparation.exhibitsReady}
                        onChange={(e) => updatePreparation({ exhibitsReady: e.target.checked })}
                        className="w-4 h-4 rounded text-purple-600"
                      />
                      <span className="text-sm">{t('tools.depositionScheduler.exhibitsReady', 'Exhibits Ready')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDeposition.preparation.subpoenaServed || false}
                        onChange={(e) => updatePreparation({ subpoenaServed: e.target.checked })}
                        className="w-4 h-4 rounded text-purple-600"
                      />
                      <span className="text-sm">{t('tools.depositionScheduler.subpoenaServed', 'Subpoena Served')}</span>
                    </label>
                  </div>
                </div>

                {/* Prep Sessions */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    Preparation Sessions ({selectedDeposition.preparation.prepSessions.length})
                  </h3>
                  {selectedDeposition.preparation.prepSessions.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.depositionScheduler.noPrepSessionsScheduled', 'No prep sessions scheduled')}</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDeposition.preparation.prepSessions.map(session => (
                        <div key={session.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{formatDate(session.date)}</span>
                            <span className="text-sm text-gray-400">{session.duration} min with {session.attorney}</span>
                          </div>
                          {session.notes && <p className="text-sm text-gray-400">{session.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exhibits */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    Exhibits ({selectedDeposition.exhibits.length})
                  </h3>
                  {selectedDeposition.exhibits.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.depositionScheduler.noExhibitsAdded', 'No exhibits added')}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedDeposition.exhibits.map(exhibit => (
                        <div key={exhibit.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Ex. {exhibit.number}</span>
                            {exhibit.markedAt && (
                              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">{t('tools.depositionScheduler.marked', 'Marked')}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{exhibit.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Transcript */}
                <div className={`p-4 rounded-lg border ${selectedDeposition.transcript?.ordered ? 'border-purple-500/30 bg-purple-500/10' : theme === 'dark' ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    {t('tools.depositionScheduler.transcript', 'Transcript')}
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDeposition.transcript?.ordered || false}
                        onChange={(e) => updateTranscript({ ordered: e.target.checked, orderedDate: e.target.checked ? new Date().toISOString().split('T')[0] : '' })}
                        className="w-4 h-4 rounded text-purple-600"
                      />
                      <span className="text-sm">{t('tools.depositionScheduler.ordered', 'Ordered')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDeposition.transcript?.expedited || false}
                        onChange={(e) => updateTranscript({ expedited: e.target.checked })}
                        className="w-4 h-4 rounded text-purple-600"
                      />
                      <span className="text-sm">{t('tools.depositionScheduler.expedited', 'Expedited')}</span>
                    </label>
                  </div>
                  {selectedDeposition.transcript?.ordered && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">{t('tools.depositionScheduler.ordered2', 'Ordered:')}</span> {selectedDeposition.transcript.orderedDate || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-400">{t('tools.depositionScheduler.received', 'Received:')}</span> {selectedDeposition.transcript.receivedDate || 'Pending'}
                      </div>
                      <div>
                        <span className="text-gray-400">{t('tools.depositionScheduler.pages', 'Pages:')}</span> {selectedDeposition.transcript.pages || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-400">{t('tools.depositionScheduler.cost', 'Cost:')}</span> ${selectedDeposition.transcript.cost?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  )}
                  {selectedDeposition.transcript?.ordered && !selectedDeposition.transcript.receivedDate && (
                    <button
                      onClick={() => setShowTranscriptModal(true)}
                      className={`mt-3 ${buttonSecondary}`}
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Received
                    </button>
                  )}
                </div>

                {/* Notes */}
                {selectedDeposition.notes && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2">{t('tools.depositionScheduler.notes', 'Notes')}</h3>
                    <p className="text-sm">{selectedDeposition.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Gavel className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.depositionScheduler.selectADeposition', 'Select a deposition')}</p>
              <p className="text-sm">{t('tools.depositionScheduler.chooseADepositionToView', 'Choose a deposition to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingDeposition ? t('tools.depositionScheduler.editDeposition', 'Edit Deposition') : t('tools.depositionScheduler.scheduleDeposition2', 'Schedule Deposition')}</h2>
              <button onClick={() => { setShowModal(false); setEditingDeposition(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Matter Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-500" />
                  {t('tools.depositionScheduler.matterInformation', 'Matter Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.matterId', 'Matter ID')}</label>
                    <input type="text" value={formData.matterId} onChange={(e) => setFormData({ ...formData, matterId: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.matterName', 'Matter Name *')}</label>
                    <input type="text" value={formData.matterName} onChange={(e) => setFormData({ ...formData, matterName: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Deponent Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-500" />
                  {t('tools.depositionScheduler.deponentInformation', 'Deponent Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.deponentName', 'Deponent Name *')}</label>
                    <input type="text" value={formData.deponentName} onChange={(e) => setFormData({ ...formData, deponentName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.deponentType', 'Deponent Type')}</label>
                    <select value={formData.deponentType} onChange={(e) => setFormData({ ...formData, deponentType: e.target.value as any })} className={inputClass}>
                      {deponentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  {t('tools.depositionScheduler.scheduling', 'Scheduling')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.date2', 'Date *')}</label>
                    <input type="date" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.startTime', 'Start Time')}</label>
                    <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.durationHours', 'Duration (hours)')}</label>
                    <input type="number" min="1" max="12" value={formData.estimatedDuration} onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 4 })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.status', 'Status')}</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                      {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  {t('tools.depositionScheduler.location3', 'Location')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.locationType', 'Location Type')}</label>
                    <select value={formData.locationType} onChange={(e) => setFormData({ ...formData, locationType: e.target.value as any })} className={inputClass}>
                      {locationTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.depositionScheduler.addressLocation', 'Address / Location')}</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputClass} />
                  </div>
                </div>
                {(formData.locationType === 'video' || formData.locationType === 'hybrid') && (
                  <div className="mt-4">
                    <label className={labelClass}>{t('tools.depositionScheduler.videoPlatform', 'Video Platform')}</label>
                    <select value={formData.videoPlatform || ''} onChange={(e) => setFormData({ ...formData, videoPlatform: e.target.value })} className={inputClass}>
                      <option value="">{t('tools.depositionScheduler.selectPlatform', 'Select Platform')}</option>
                      {videoPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Attorneys */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-500" />
                  {t('tools.depositionScheduler.attorneys', 'Attorneys')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.examiningAttorney2', 'Examining Attorney')}</label>
                    <input type="text" value={formData.examiningAttorney} onChange={(e) => setFormData({ ...formData, examiningAttorney: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.defendingAttorney', 'Defending Attorney')}</label>
                    <input type="text" value={formData.defendingAttorney || ''} onChange={(e) => setFormData({ ...formData, defendingAttorney: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Court Reporter */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-500" />
                  {t('tools.depositionScheduler.courtReporter', 'Court Reporter')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.name2', 'Name')}</label>
                    <input type="text" value={formData.courtReporter.name} onChange={(e) => setFormData({ ...formData, courtReporter: { ...formData.courtReporter, name: e.target.value } })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.company2', 'Company')}</label>
                    <input type="text" value={formData.courtReporter.company} onChange={(e) => setFormData({ ...formData, courtReporter: { ...formData.courtReporter, company: e.target.value } })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.phone2', 'Phone')}</label>
                    <input type="tel" value={formData.courtReporter.phone} onChange={(e) => setFormData({ ...formData, courtReporter: { ...formData.courtReporter, phone: e.target.value } })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.depositionScheduler.email2', 'Email')}</label>
                    <input type="email" value={formData.courtReporter.email} onChange={(e) => setFormData({ ...formData, courtReporter: { ...formData.courtReporter, email: e.target.value } })} className={inputClass} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.courtReporter.confirmed} onChange={(e) => setFormData({ ...formData, courtReporter: { ...formData.courtReporter, confirmed: e.target.checked } })} className="w-4 h-4 rounded text-purple-600" />
                    <span className="text-sm">{t('tools.depositionScheduler.confirmed2', 'Confirmed')}</span>
                  </label>
                </div>
              </div>

              {/* Videographer */}
              <div>
                <label className={labelClass}>{t('tools.depositionScheduler.videographer', 'Videographer')}</label>
                <input type="text" value={formData.videographer || ''} onChange={(e) => setFormData({ ...formData, videographer: e.target.value })} className={inputClass} />
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('tools.depositionScheduler.notes2', 'Notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingDeposition(null); }} className={buttonSecondary}>{t('tools.depositionScheduler.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.deponentName || !formData.matterName || !formData.scheduledDate} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prep Session Modal */}
      {showPrepModal && selectedDeposition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.depositionScheduler.addPrepSession', 'Add Prep Session')}</h2>
              <button onClick={() => setShowPrepModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.depositionScheduler.date3', 'Date')}</label>
                  <input type="date" value={newPrepSession.date} onChange={(e) => setNewPrepSession({ ...newPrepSession, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.depositionScheduler.durationMinutes', 'Duration (minutes)')}</label>
                  <input type="number" min="15" value={newPrepSession.duration} onChange={(e) => setNewPrepSession({ ...newPrepSession, duration: parseInt(e.target.value) || 60 })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.depositionScheduler.attorney', 'Attorney')}</label>
                <input type="text" value={newPrepSession.attorney} onChange={(e) => setNewPrepSession({ ...newPrepSession, attorney: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.depositionScheduler.notes3', 'Notes')}</label>
                <textarea value={newPrepSession.notes} onChange={(e) => setNewPrepSession({ ...newPrepSession, notes: e.target.value })} className={inputClass} rows={3} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowPrepModal(false)} className={buttonSecondary}>{t('tools.depositionScheduler.cancel2', 'Cancel')}</button>
                <button type="button" onClick={addPrepSession} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.depositionScheduler.addSession', 'Add Session')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exhibit Modal */}
      {showExhibitModal && selectedDeposition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.depositionScheduler.addExhibit', 'Add Exhibit')}</h2>
              <button onClick={() => setShowExhibitModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.depositionScheduler.exhibitNumber', 'Exhibit Number')}</label>
                  <input type="text" value={newExhibit.number} onChange={(e) => setNewExhibit({ ...newExhibit, number: e.target.value })} className={inputClass} placeholder="e.g., 1, A, P-1" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.depositionScheduler.markedAtTime', 'Marked At (time)')}</label>
                  <input type="time" value={newExhibit.markedAt || ''} onChange={(e) => setNewExhibit({ ...newExhibit, markedAt: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.depositionScheduler.description', 'Description')}</label>
                <textarea value={newExhibit.description} onChange={(e) => setNewExhibit({ ...newExhibit, description: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowExhibitModal(false)} className={buttonSecondary}>{t('tools.depositionScheduler.cancel3', 'Cancel')}</button>
                <button type="button" onClick={addExhibit} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.depositionScheduler.addExhibit2', 'Add Exhibit')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Received Modal */}
      {showTranscriptModal && selectedDeposition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.depositionScheduler.markTranscriptReceived', 'Mark Transcript Received')}</h2>
              <button onClick={() => setShowTranscriptModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.depositionScheduler.receivedDate', 'Received Date')}</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} id="transcriptReceivedDate" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.depositionScheduler.pages2', 'Pages')}</label>
                  <input type="number" min="1" defaultValue={selectedDeposition.transcript?.pages || ''} id="transcriptPages" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.depositionScheduler.cost2', 'Cost ($)')}</label>
                <input type="number" min="0" step="0.01" defaultValue={selectedDeposition.transcript?.cost || ''} id="transcriptCost" className={inputClass} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowTranscriptModal(false)} className={buttonSecondary}>{t('tools.depositionScheduler.cancel4', 'Cancel')}</button>
                <button
                  type="button"
                  onClick={() => {
                    const receivedDate = (document.getElementById('transcriptReceivedDate') as HTMLInputElement).value;
                    const pages = parseInt((document.getElementById('transcriptPages') as HTMLInputElement).value) || 0;
                    const cost = parseFloat((document.getElementById('transcriptCost') as HTMLInputElement).value) || 0;
                    updateTranscript({ receivedDate, pages, cost });
                    setShowTranscriptModal(false);
                  }}
                  className={buttonPrimary}
                >
                  <CheckCircle className="w-4 h-4" /> Confirm Received
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.depositionScheduler.aboutDepositionScheduler', 'About Deposition Scheduler')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Schedule and manage depositions with comprehensive witness preparation tracking, court reporter coordination,
          exhibit management, and transcript ordering. Track preparation sessions, mark exhibits during depositions,
          and monitor transcript status from order to delivery.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default DepositionSchedulerTool;
