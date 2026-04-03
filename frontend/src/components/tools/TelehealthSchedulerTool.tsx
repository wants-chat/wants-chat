'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Video,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  Clock,
  Phone,
  Mail,
  Link,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Activity,
  Monitor,
  Shield,
  Copy,
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  FileText,
  Stethoscope,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

interface TelehealthProvider {
  id: string;
  name: string;
  title: string;
  specialty: string;
  email: string;
  defaultPlatform: 'zoom' | 'teams' | 'doxy' | 'custom';
  availableSlots: AvailabilitySlot[];
  states: string[];
  status: 'available' | 'busy' | 'offline';
}

interface WaitingRoomEntry {
  id: string;
  visitId: string;
  patientName: string;
  joinedAt: string;
  status: 'waiting' | 'admitted' | 'left';
  waitTimeMinutes: number;
}

interface TelehealthVisit {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  providerId: string;
  providerName: string;
  visitType: 'new-patient' | 'follow-up' | 'consultation' | 'urgent' | 'mental-health';
  scheduledDateTime: string;
  duration: number;
  platform: 'zoom' | 'teams' | 'doxy' | 'custom';
  meetingLink: string;
  meetingId?: string;
  passcode?: string;
  status: 'scheduled' | 'waiting-room' | 'in-progress' | 'completed' | 'no-show' | 'cancelled';
  chiefComplaint: string;
  notes: string;
  techCheckCompleted: boolean;
  consentSigned: boolean;
  waitingRoomEntry?: WaitingRoomEntry;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface TelehealthSchedulerToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'telehealth-scheduler';

const visitColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'providerName', header: 'Provider', type: 'string' },
  { key: 'visitType', header: 'Visit Type', type: 'string' },
  { key: 'scheduledDateTime', header: 'Scheduled', type: 'date' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'platform', header: 'Platform', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'techCheckCompleted', header: 'Tech Check', type: 'boolean' },
  { key: 'consentSigned', header: 'Consent', type: 'boolean' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewVisit = (): TelehealthVisit => ({
  id: crypto.randomUUID(),
  patientId: crypto.randomUUID(),
  patientName: '',
  patientEmail: '',
  patientPhone: '',
  providerId: '',
  providerName: '',
  visitType: 'follow-up',
  scheduledDateTime: new Date().toISOString().slice(0, 16),
  duration: 30,
  platform: 'zoom',
  meetingLink: '',
  meetingId: '',
  passcode: '',
  status: 'scheduled',
  chiefComplaint: '',
  notes: '',
  techCheckCompleted: false,
  consentSigned: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const visitTypes = [
  { value: 'new-patient', label: 'New Patient', icon: User },
  { value: 'follow-up', label: 'Follow-up', icon: RefreshCw },
  { value: 'consultation', label: 'Consultation', icon: Stethoscope },
  { value: 'urgent', label: 'Urgent', icon: AlertCircle },
  { value: 'mental-health', label: 'Mental Health', icon: Activity },
];

const visitStatuses = [
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'waiting-room', label: 'Waiting Room', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'no-show', label: 'No Show', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
];

const platforms = [
  { value: 'zoom', label: 'Zoom', color: '#2D8CFF' },
  { value: 'teams', label: 'Microsoft Teams', color: '#6264A7' },
  { value: 'doxy', label: 'Doxy.me', color: '#00A0E3' },
  { value: 'custom', label: 'Custom Link', color: '#6B7280' },
];

const durationOptions = [15, 20, 30, 45, 60, 90];

const sampleProviders: TelehealthProvider[] = [
  { id: '1', name: 'Dr. Sarah Johnson', title: 'MD', specialty: 'Internal Medicine', email: 'sarah.johnson@clinic.com', defaultPlatform: 'zoom', availableSlots: [], states: ['NY', 'NJ', 'CT'], status: 'available' },
  { id: '2', name: 'Dr. Michael Chen', title: 'DO', specialty: 'Family Medicine', email: 'michael.chen@clinic.com', defaultPlatform: 'teams', availableSlots: [], states: ['CA', 'NV', 'AZ'], status: 'available' },
  { id: '3', name: 'Dr. Emily Martinez', title: 'PhD', specialty: 'Clinical Psychology', email: 'emily.martinez@clinic.com', defaultPlatform: 'doxy', availableSlots: [], states: ['TX', 'OK', 'NM'], status: 'busy' },
  { id: '4', name: 'Dr. Robert Williams', title: 'MD', specialty: 'Psychiatry', email: 'robert.williams@clinic.com', defaultPlatform: 'zoom', availableSlots: [], states: ['FL', 'GA', 'SC'], status: 'available' },
];

const generateMeetingLink = (platform: string): { link: string; meetingId: string; passcode: string } => {
  const randomId = Math.random().toString(36).substring(2, 12);
  const passcode = Math.random().toString(36).substring(2, 8);

  switch (platform) {
    case 'zoom':
      return {
        link: `https://zoom.us/j/${randomId}`,
        meetingId: randomId,
        passcode: passcode,
      };
    case 'teams':
      return {
        link: `https://teams.microsoft.com/l/meetup-join/${randomId}`,
        meetingId: randomId,
        passcode: '',
      };
    case 'doxy':
      return {
        link: `https://doxy.me/${randomId}`,
        meetingId: randomId,
        passcode: '',
      };
    default:
      return {
        link: '',
        meetingId: '',
        passcode: '',
      };
  }
};

export const TelehealthSchedulerTool: React.FC<TelehealthSchedulerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: visits,
    addItem: addVisit,
    updateItem: updateVisit,
    deleteItem: deleteVisit,
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
  } = useToolData<TelehealthVisit>(TOOL_ID, [], visitColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVisitType, setFilterVisitType] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'waiting-room'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showWaitingRoomModal, setShowWaitingRoomModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<TelehealthVisit | null>(null);
  const [editingVisit, setEditingVisit] = useState<TelehealthVisit | null>(null);
  const [formData, setFormData] = useState<TelehealthVisit>(createNewVisit());
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayVisits = visits.filter(v => new Date(v.scheduledDateTime).toDateString() === today);
    const waitingRoom = visits.filter(v => v.status === 'waiting-room');
    const inProgress = visits.filter(v => v.status === 'in-progress');
    const completed = visits.filter(v => v.status === 'completed');
    const noShows = visits.filter(v => v.status === 'no-show');

    const totalCompleted = completed.length + noShows.length;
    const noShowRate = totalCompleted > 0 ? ((noShows.length / totalCompleted) * 100).toFixed(1) : '0.0';

    // Calculate average wait time for waiting room entries
    const waitTimes = waitingRoom.map(v => {
      if (v.waitingRoomEntry) {
        const joinedAt = new Date(v.waitingRoomEntry.joinedAt);
        const now = new Date();
        return Math.floor((now.getTime() - joinedAt.getTime()) / 60000);
      }
      return 0;
    });
    const avgWaitTime = waitTimes.length > 0 ? Math.floor(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;

    return {
      total: visits.length,
      todayVisits: todayVisits.length,
      waitingRoom: waitingRoom.length,
      inProgress: inProgress.length,
      completed: completed.length,
      noShowRate: parseFloat(noShowRate),
      avgWaitTime,
    };
  }, [visits]);

  // Filtered visits
  const filteredVisits = useMemo(() => {
    const today = new Date().toDateString();

    return visits.filter(visit => {
      // Tab filters
      if (activeTab === 'today' && new Date(visit.scheduledDateTime).toDateString() !== today) {
        return false;
      }
      if (activeTab === 'waiting-room' && visit.status !== 'waiting-room') {
        return false;
      }

      // Search filter
      const matchesSearch = searchQuery === '' ||
        visit.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.patientEmail.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = filterStatus === '' || visit.status === filterStatus;

      // Visit type filter
      const matchesVisitType = filterVisitType === '' || visit.visitType === filterVisitType;

      // Platform filter
      const matchesPlatform = filterPlatform === '' || visit.platform === filterPlatform;

      return matchesSearch && matchesStatus && matchesVisitType && matchesPlatform;
    }).sort((a, b) => new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime());
  }, [visits, searchQuery, filterStatus, filterVisitType, filterPlatform, activeTab]);

  const handleSave = () => {
    if (editingVisit) {
      updateVisit(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addVisit({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingVisit(null);
    setFormData(createNewVisit());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this visit?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteVisit(id);
      if (selectedVisit?.id === id) setSelectedVisit(null);
    }
  };

  const openEditModal = (visit: TelehealthVisit) => {
    setEditingVisit(visit);
    setFormData(visit);
    setShowModal(true);
  };

  const handleGenerateMeetingLink = () => {
    const { link, meetingId, passcode } = generateMeetingLink(formData.platform);
    setFormData({
      ...formData,
      meetingLink: link,
      meetingId,
      passcode,
    });
  };

  const handleProviderChange = (providerId: string) => {
    const provider = sampleProviders.find(p => p.id === providerId);
    if (provider) {
      setFormData({
        ...formData,
        providerId: provider.id,
        providerName: `${provider.name}, ${provider.title}`,
        platform: provider.defaultPlatform,
      });
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleStartVisit = (visit: TelehealthVisit) => {
    updateVisit(visit.id, {
      ...visit,
      status: 'in-progress',
      actualStartTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleEndVisit = (visit: TelehealthVisit) => {
    updateVisit(visit.id, {
      ...visit,
      status: 'completed',
      actualEndTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleMoveToWaitingRoom = (visit: TelehealthVisit) => {
    updateVisit(visit.id, {
      ...visit,
      status: 'waiting-room',
      waitingRoomEntry: {
        id: crypto.randomUUID(),
        visitId: visit.id,
        patientName: visit.patientName,
        joinedAt: new Date().toISOString(),
        status: 'waiting',
        waitTimeMinutes: 0,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAdmitFromWaitingRoom = (visit: TelehealthVisit) => {
    updateVisit(visit.id, {
      ...visit,
      status: 'in-progress',
      actualStartTime: new Date().toISOString(),
      waitingRoomEntry: visit.waitingRoomEntry ? {
        ...visit.waitingRoomEntry,
        status: 'admitted',
      } : undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleMarkNoShow = (visit: TelehealthVisit) => {
    updateVisit(visit.id, {
      ...visit,
      status: 'no-show',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCancelVisit = async (visit: TelehealthVisit) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to cancel this visit?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      updateVisit(visit.id, {
        ...visit,
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'waiting-room': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in-progress': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'no-show': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getVisitTypeIcon = (type: string) => {
    const typeConfig = visitTypes.find(t => t.value === type);
    return typeConfig?.icon || Video;
  };

  const getPlatformColor = (platform: string) => {
    const platformConfig = platforms.find(p => p.value === platform);
    return platformConfig?.color || '#6B7280';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getWaitTime = (joinedAt: string) => {
    const joined = new Date(joinedAt);
    const now = new Date();
    const minutes = Math.floor((now.getTime() - joined.getTime()) / 60000);
    if (minutes < 1) return 'Just joined';
    if (minutes === 1) return '1 min';
    return `${minutes} mins`;
  };

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg transition-colors font-medium ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
      : theme === 'dark'
        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
            <Video className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.telehealthScheduler.telehealthScheduler', 'Telehealth Scheduler')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.telehealthScheduler.scheduleAndManageVirtualVisits', 'Schedule and manage virtual visits')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="telehealth-scheduler" toolName="Telehealth Scheduler" />

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
            onExportCSV={() => exportCSV({ filename: 'telehealth-visits' })}
            onExportExcel={() => exportExcel({ filename: 'telehealth-visits' })}
            onExportJSON={() => exportJSON({ filename: 'telehealth-visits' })}
            onExportPDF={() => exportPDF({ filename: 'telehealth-visits', title: 'Telehealth Visits' })}
            onPrint={() => print('Telehealth Visits')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={visits.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewVisit()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.telehealthScheduler.scheduleVisit', 'Schedule Visit')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.telehealthScheduler.today', 'Today')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.todayVisits}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Users className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.telehealthScheduler.waiting', 'Waiting')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.waitingRoom}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Video className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.telehealthScheduler.inProgress', 'In Progress')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.telehealthScheduler.completed', 'Completed')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.telehealthScheduler.noShowRate', 'No-Show Rate')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.noShowRate}%</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.telehealthScheduler.avgWait', 'Avg Wait')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.avgWaitTime}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('all')} className={tabClass(activeTab === 'all')}>
          All Visits ({visits.length})
        </button>
        <button onClick={() => setActiveTab('today')} className={tabClass(activeTab === 'today')}>
          Today ({stats.todayVisits})
        </button>
        <button onClick={() => setActiveTab('waiting-room')} className={tabClass(activeTab === 'waiting-room')}>
          Waiting Room ({stats.waitingRoom})
        </button>
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
              placeholder={t('tools.telehealthScheduler.searchPatientProviderOrEmail', 'Search patient, provider, or email...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.telehealthScheduler.allStatus', 'All Status')}</option>
            {visitStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterVisitType} onChange={(e) => setFilterVisitType(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.telehealthScheduler.allTypes', 'All Types')}</option>
            {visitTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.telehealthScheduler.allPlatforms', 'All Platforms')}</option>
            {platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visit List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.telehealthScheduler.visits', 'Visits')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.telehealthScheduler.noVisitsScheduled', 'No visits scheduled')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredVisits.map(visit => {
                  const TypeIcon = getVisitTypeIcon(visit.visitType);
                  return (
                    <div
                      key={visit.id}
                      onClick={() => setSelectedVisit(visit)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedVisit?.id === visit.id
                          ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <TypeIcon className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div>
                            <p className="font-medium">{visit.patientName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {visit.providerName}
                            </p>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {formatDateTime(visit.scheduledDateTime)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(visit.status)}`}>
                                {visitStatuses.find(s => s.value === visit.status)?.label || visit.status}
                              </span>
                              {visit.status === 'waiting-room' && visit.waitingRoomEntry && (
                                <span className="text-xs text-yellow-400">
                                  {getWaitTime(visit.waitingRoomEntry.joinedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(visit); }} className="p-1.5 hover:bg-gray-600 rounded">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(visit.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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
          {selectedVisit ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedVisit.patientName}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedVisit.status)}`}>
                        {visitStatuses.find(s => s.value === selectedVisit.status)?.label || selectedVisit.status}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {visitTypes.find(t => t.value === selectedVisit.visitType)?.label || selectedVisit.visitType} with {selectedVisit.providerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedVisit.status === 'scheduled' && (
                      <>
                        <button onClick={() => handleMoveToWaitingRoom(selectedVisit)} className={buttonSecondary}>
                          <Users className="w-4 h-4" /> To Waiting Room
                        </button>
                        <button onClick={() => handleCancelVisit(selectedVisit)} className="px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {selectedVisit.status === 'waiting-room' && (
                      <>
                        <button onClick={() => handleAdmitFromWaitingRoom(selectedVisit)} className={buttonPrimary}>
                          <Play className="w-4 h-4" /> Start Visit
                        </button>
                        <button onClick={() => handleMarkNoShow(selectedVisit)} className="px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                          {t('tools.telehealthScheduler.noShow', 'No Show')}
                        </button>
                      </>
                    )}
                    {selectedVisit.status === 'in-progress' && (
                      <button onClick={() => handleEndVisit(selectedVisit)} className={buttonPrimary}>
                        <Pause className="w-4 h-4" /> End Visit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Visit Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.telehealthScheduler.scheduled', 'Scheduled')}</p>
                    <p className="font-medium">{formatDateTime(selectedVisit.scheduledDateTime)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.telehealthScheduler.duration', 'Duration')}</p>
                    <p className="font-medium">{selectedVisit.duration} minutes</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.telehealthScheduler.platform', 'Platform')}</p>
                    <p className="font-medium capitalize" style={{ color: getPlatformColor(selectedVisit.platform) }}>
                      {platforms.find(p => p.value === selectedVisit.platform)?.label || selectedVisit.platform}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.telehealthScheduler.visitType', 'Visit Type')}</p>
                    <p className="font-medium capitalize">{visitTypes.find(t => t.value === selectedVisit.visitType)?.label}</p>
                  </div>
                </div>

                {/* Patient Contact Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-500" />
                    {t('tools.telehealthScheduler.patientInformation2', 'Patient Information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">{t('tools.telehealthScheduler.email', 'Email')}</p>
                        <p className="font-medium">{selectedVisit.patientEmail || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">{t('tools.telehealthScheduler.phone', 'Phone')}</p>
                        <p className="font-medium">{selectedVisit.patientPhone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meeting Link */}
                {selectedVisit.meetingLink && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Link className="w-4 h-4 text-cyan-500" />
                      {t('tools.telehealthScheduler.meetingDetails', 'Meeting Details')}
                    </h3>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">{t('tools.telehealthScheduler.meetingLink', 'Meeting Link')}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyLink(selectedVisit.meetingLink)}
                            className={`p-1.5 rounded hover:bg-gray-600 ${copiedLink === selectedVisit.meetingLink ? 'text-green-400' : 'text-gray-400'}`}
                          >
                            {copiedLink === selectedVisit.meetingLink ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <a
                            href={selectedVisit.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-gray-600 text-gray-400"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      <p className="font-mono text-sm break-all">{selectedVisit.meetingLink}</p>
                      {selectedVisit.meetingId && (
                        <div className="mt-3 flex gap-4">
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.telehealthScheduler.meetingId', 'Meeting ID')}</p>
                            <p className="font-medium">{selectedVisit.meetingId}</p>
                          </div>
                          {selectedVisit.passcode && (
                            <div>
                              <p className="text-xs text-gray-400">{t('tools.telehealthScheduler.passcode', 'Passcode')}</p>
                              <p className="font-medium">{selectedVisit.passcode}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tech Check & Consent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{t('tools.telehealthScheduler.techCheck', 'Tech Check')}</span>
                      </div>
                      {selectedVisit.techCheckCompleted ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <AlertCircle className="w-4 h-4" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{t('tools.telehealthScheduler.consentForm', 'Consent Form')}</span>
                      </div>
                      {selectedVisit.consentSigned ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" /> Signed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <AlertCircle className="w-4 h-4" /> Not Signed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chief Complaint */}
                {selectedVisit.chiefComplaint && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-500" />
                      {t('tools.telehealthScheduler.chiefComplaint2', 'Chief Complaint')}
                    </h3>
                    <p className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      {selectedVisit.chiefComplaint}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {selectedVisit.notes && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-500" />
                      {t('tools.telehealthScheduler.notes2', 'Notes')}
                    </h3>
                    <p className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      {selectedVisit.notes}
                    </p>
                  </div>
                )}

                {/* Visit Timeline */}
                {(selectedVisit.actualStartTime || selectedVisit.actualEndTime) && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-500" />
                      {t('tools.telehealthScheduler.visitTimeline', 'Visit Timeline')}
                    </h3>
                    <div className="space-y-2">
                      {selectedVisit.waitingRoomEntry && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">Joined waiting room at {formatTime(selectedVisit.waitingRoomEntry.joinedAt)}</span>
                        </div>
                      )}
                      {selectedVisit.actualStartTime && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Visit started at {formatTime(selectedVisit.actualStartTime)}</span>
                        </div>
                      )}
                      {selectedVisit.actualEndTime && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          <span className="text-sm">Visit ended at {formatTime(selectedVisit.actualEndTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Video className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.telehealthScheduler.selectAVisit', 'Select a visit')}</p>
              <p className="text-sm">{t('tools.telehealthScheduler.chooseAVisitToView', 'Choose a visit to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingVisit ? t('tools.telehealthScheduler.editVisit', 'Edit Visit') : t('tools.telehealthScheduler.scheduleVisit2', 'Schedule Visit')}</h2>
              <button onClick={() => { setShowModal(false); setEditingVisit(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t('tools.telehealthScheduler.patientInformation', 'Patient Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.telehealthScheduler.patientName', 'Patient Name *')}</label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.telehealthScheduler.enterPatientName', 'Enter patient name')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.telehealthScheduler.patientEmail', 'Patient Email')}</label>
                    <input
                      type="email"
                      value={formData.patientEmail}
                      onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.telehealthScheduler.patientEmailCom', 'patient@email.com')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.telehealthScheduler.patientPhone', 'Patient Phone')}</label>
                    <input
                      type="tel"
                      value={formData.patientPhone}
                      onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                      className={inputClass}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.telehealthScheduler.provider', 'Provider *')}</label>
                    <select
                      value={formData.providerId}
                      onChange={(e) => handleProviderChange(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">{t('tools.telehealthScheduler.selectProvider', 'Select Provider')}</option>
                      {sampleProviders.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}, {p.title} - {p.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Visit Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t('tools.telehealthScheduler.visitDetails', 'Visit Details')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.telehealthScheduler.visitType2', 'Visit Type')}</label>
                    <select
                      value={formData.visitType}
                      onChange={(e) => setFormData({ ...formData, visitType: e.target.value as TelehealthVisit['visitType'] })}
                      className={inputClass}
                    >
                      {visitTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.telehealthScheduler.dateTime', 'Date & Time *')}</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledDateTime}
                      onChange={(e) => setFormData({ ...formData, scheduledDateTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.telehealthScheduler.duration2', 'Duration')}</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className={inputClass}
                    >
                      {durationOptions.map(d => <option key={d} value={d}>{d} minutes</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.telehealthScheduler.platform2', 'Platform')}</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value as TelehealthVisit['platform'] })}
                      className={inputClass}
                    >
                      {platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Meeting Link */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{t('tools.telehealthScheduler.meetingLink2', 'Meeting Link')}</h3>
                  <button
                    type="button"
                    onClick={handleGenerateMeetingLink}
                    className={buttonSecondary}
                  >
                    <RefreshCw className="w-4 h-4" /> Generate Link
                  </button>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.telehealthScheduler.meetingUrl', 'Meeting URL')}</label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.telehealthScheduler.https', 'https://...')}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.telehealthScheduler.meetingIdOptional', 'Meeting ID (optional)')}</label>
                    <input
                      type="text"
                      value={formData.meetingId || ''}
                      onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.telehealthScheduler.passcodeOptional', 'Passcode (optional)')}</label>
                    <input
                      type="text"
                      value={formData.passcode || ''}
                      onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t('tools.telehealthScheduler.clinicalInformation', 'Clinical Information')}</h3>
                <div>
                  <label className={labelClass}>{t('tools.telehealthScheduler.chiefComplaint', 'Chief Complaint')}</label>
                  <textarea
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                    className={inputClass}
                    rows={2}
                    placeholder={t('tools.telehealthScheduler.reasonForVisit', 'Reason for visit...')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.telehealthScheduler.notes', 'Notes')}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={inputClass}
                    rows={2}
                    placeholder={t('tools.telehealthScheduler.additionalNotes', 'Additional notes...')}
                  />
                </div>
              </div>

              {/* Pre-visit Checklist */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t('tools.telehealthScheduler.preVisitChecklist', 'Pre-visit Checklist')}</h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.techCheckCompleted}
                      onChange={(e) => setFormData({ ...formData, techCheckCompleted: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>{t('tools.telehealthScheduler.techCheckCompleted', 'Tech Check Completed')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentSigned}
                      onChange={(e) => setFormData({ ...formData, consentSigned: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>{t('tools.telehealthScheduler.consentFormSigned', 'Consent Form Signed')}</span>
                  </label>
                </div>
              </div>

              {/* Status (for editing) */}
              {editingVisit && (
                <div>
                  <label className={labelClass}>{t('tools.telehealthScheduler.status', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TelehealthVisit['status'] })}
                    className={inputClass}
                  >
                    {visitStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              )}

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingVisit(null); }} className={buttonSecondary}>
                  {t('tools.telehealthScheduler.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!formData.patientName || !formData.providerId}
                  className={buttonPrimary}
                >
                  <Save className="w-4 h-4" /> {editingVisit ? t('tools.telehealthScheduler.update', 'Update') : t('tools.telehealthScheduler.schedule', 'Schedule')} Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.telehealthScheduler.aboutTelehealthScheduler', 'About Telehealth Scheduler')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Schedule and manage telehealth virtual visits with video link generation and visit tracking.
          Features include waiting room management, tech check tracking, consent management, and
          comprehensive visit statistics including no-show rates and average wait times.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default TelehealthSchedulerTool;
