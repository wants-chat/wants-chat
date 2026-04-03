'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  Plus,
  Trash2,
  Save,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Image,
  Users,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
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

interface PhotoSessionToolProps {
  uiConfig?: UIConfig;
}

// Types
type SessionType = 'portrait' | 'wedding' | 'event' | 'product' | 'real-estate' | 'family' | 'maternity' | 'newborn' | 'corporate' | 'fashion';
type SessionStatus = 'inquiry' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
}

interface PhotoSession {
  id: string;
  clientId: string;
  clientName: string;
  sessionType: SessionType;
  date: string;
  startTime: string;
  duration: number; // in hours
  location: string;
  locationNotes: string;
  packageName: string;
  packagePrice: number;
  depositAmount: number;
  depositPaid: boolean;
  balanceDue: number;
  status: SessionStatus;
  specialRequests: string;
  shotList: string[];
  assistantsNeeded: number;
  equipmentNotes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const SESSION_TYPES: { type: SessionType; label: string; basePrice: number }[] = [
  { type: 'portrait', label: 'Portrait', basePrice: 200 },
  { type: 'wedding', label: 'Wedding', basePrice: 2500 },
  { type: 'event', label: 'Event', basePrice: 500 },
  { type: 'product', label: 'Product', basePrice: 300 },
  { type: 'real-estate', label: 'Real Estate', basePrice: 250 },
  { type: 'family', label: 'Family', basePrice: 350 },
  { type: 'maternity', label: 'Maternity', basePrice: 400 },
  { type: 'newborn', label: 'Newborn', basePrice: 450 },
  { type: 'corporate', label: 'Corporate', basePrice: 500 },
  { type: 'fashion', label: 'Fashion', basePrice: 800 },
];

const STATUS_COLORS: Record<SessionStatus, { bg: string; text: string; border: string }> = {
  inquiry: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-700' },
  confirmed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-700' },
  'in-progress': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-700' },
  completed: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-700' },
};

// Column configuration for exports
const SESSION_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'sessionType', header: 'Type', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Time', type: 'string' },
  { key: 'duration', header: 'Duration (hrs)', type: 'number' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'packageName', header: 'Package', type: 'string' },
  { key: 'packagePrice', header: 'Price', type: 'currency' },
  { key: 'depositAmount', header: 'Deposit', type: 'currency' },
  { key: 'depositPaid', header: 'Deposit Paid', type: 'string' },
  { key: 'balanceDue', header: 'Balance', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const PhotoSessionTool: React.FC<PhotoSessionToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: sessions,
    addItem: addSession,
    updateItem: updateSession,
    deleteItem: deleteSession,
    isSynced: sessionsSynced,
    isSaving: sessionsSaving,
    lastSaved: sessionsLastSaved,
    syncError: sessionsSyncError,
    forceSync: forceSessionsSync,
  } = useToolData<PhotoSession>('photo-sessions', [], SESSION_COLUMNS);

  const {
    data: clients,
    addItem: addClient,
    updateItem: updateClient,
    deleteItem: deleteClient,
  } = useToolData<Client>('photo-clients', [], CLIENT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'sessions' | 'clients' | 'calendar'>('sessions');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingSession, setEditingSession] = useState<PhotoSession | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [newSession, setNewSession] = useState<Partial<PhotoSession>>({
    sessionType: 'portrait',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    duration: 2,
    location: '',
    locationNotes: '',
    packageName: 'Standard Package',
    packagePrice: 200,
    depositAmount: 100,
    depositPaid: false,
    balanceDue: 100,
    status: 'inquiry',
    specialRequests: '',
    shotList: [],
    assistantsNeeded: 0,
    equipmentNotes: '',
  });

  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.clientName || params.sessionType || params.date) {
        setNewSession({
          ...newSession,
          clientName: params.clientName || '',
          sessionType: params.sessionType || 'portrait',
          date: params.date || new Date().toISOString().split('T')[0],
          location: params.location || '',
        });
        setShowSessionForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate balance when price or deposit changes
  useEffect(() => {
    const price = newSession.packagePrice || 0;
    const deposit = newSession.depositAmount || 0;
    setNewSession(prev => ({
      ...prev,
      balanceDue: price - (prev.depositPaid ? deposit : 0),
    }));
  }, [newSession.packagePrice, newSession.depositAmount, newSession.depositPaid]);

  // Add session
  const handleAddSession = () => {
    if (!newSession.clientId && !newSession.clientName) {
      setValidationMessage('Please select or enter a client');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const session: PhotoSession = {
      id: generateId(),
      clientId: newSession.clientId || '',
      clientName: newSession.clientName || clients.find(c => c.id === newSession.clientId)?.name || '',
      sessionType: newSession.sessionType as SessionType,
      date: newSession.date || new Date().toISOString().split('T')[0],
      startTime: newSession.startTime || '10:00',
      duration: newSession.duration || 2,
      location: newSession.location || '',
      locationNotes: newSession.locationNotes || '',
      packageName: newSession.packageName || 'Standard Package',
      packagePrice: newSession.packagePrice || 200,
      depositAmount: newSession.depositAmount || 100,
      depositPaid: newSession.depositPaid || false,
      balanceDue: newSession.balanceDue || 100,
      status: newSession.status as SessionStatus || 'inquiry',
      specialRequests: newSession.specialRequests || '',
      shotList: newSession.shotList || [],
      assistantsNeeded: newSession.assistantsNeeded || 0,
      equipmentNotes: newSession.equipmentNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addSession(session);
    setShowSessionForm(false);
    resetSessionForm();
  };

  // Update session
  const handleUpdateSession = () => {
    if (!editingSession) return;

    updateSession(editingSession.id, {
      ...editingSession,
      updatedAt: new Date().toISOString(),
    });
    setEditingSession(null);
  };

  // Add client
  const handleAddClient = () => {
    if (!newClient.name || !newClient.email) {
      setValidationMessage('Please enter client name and email');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const client: Client = {
      id: generateId(),
      name: newClient.name || '',
      email: newClient.email || '',
      phone: newClient.phone || '',
      address: newClient.address || '',
      notes: newClient.notes || '',
      createdAt: new Date().toISOString(),
    };

    addClient(client);
    setShowClientForm(false);
    setNewClient({ name: '', email: '', phone: '', address: '', notes: '' });
  };

  // Reset form
  const resetSessionForm = () => {
    setNewSession({
      sessionType: 'portrait',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      duration: 2,
      location: '',
      locationNotes: '',
      packageName: 'Standard Package',
      packagePrice: 200,
      depositAmount: 100,
      depositPaid: false,
      balanceDue: 100,
      status: 'inquiry',
      specialRequests: '',
      shotList: [],
      assistantsNeeded: 0,
      equipmentNotes: '',
    });
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = searchTerm === '' ||
        session.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
      const matchesType = filterType === 'all' || session.sessionType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sessions, searchTerm, filterStatus, filterType]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
    });

    return {
      totalSessions: sessions.length,
      upcomingSessions: sessions.filter(s => new Date(s.date) >= now && s.status !== 'cancelled').length,
      thisMonthRevenue: thisMonth.reduce((sum, s) => sum + s.packagePrice, 0),
      pendingDeposits: sessions.filter(s => !s.depositPaid && s.status !== 'cancelled').length,
      completedThisMonth: thisMonth.filter(s => s.status === 'completed').length,
    };
  }, [sessions]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.photoSession.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.photoSession.photoSessionBooking', 'Photo Session Booking')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.photoSession.managePhotoSessionsClientsAnd', 'Manage photo sessions, clients, and bookings')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="photo-session" toolName="Photo Session" />

              <SyncStatus
                isSynced={sessionsSynced}
                isSaving={sessionsSaving}
                lastSaved={sessionsLastSaved}
                syncError={sessionsSyncError}
                onForceSync={forceSessionsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredSessions, SESSION_COLUMNS, 'photo-sessions')}
                onExportExcel={() => exportToExcel(filteredSessions, SESSION_COLUMNS, 'photo-sessions')}
                onExportJSON={() => exportToJSON(filteredSessions, 'photo-sessions')}
                onExportPDF={() => exportToPDF(filteredSessions, SESSION_COLUMNS, 'Photo Sessions Report', 'photo-sessions')}
                onCopy={() => copyUtil(filteredSessions, SESSION_COLUMNS)}
                onPrint={() => printData(filteredSessions, SESSION_COLUMNS, 'Photo Sessions Report')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoSession.totalSessions', 'Total Sessions')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalSessions}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoSession.upcoming', 'Upcoming')}</p>
              <p className={`text-2xl font-bold text-blue-500`}>{stats.upcomingSessions}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoSession.thisMonthRevenue', 'This Month Revenue')}</p>
              <p className={`text-2xl font-bold text-green-500`}>{formatCurrency(stats.thisMonthRevenue)}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoSession.pendingDeposits', 'Pending Deposits')}</p>
              <p className={`text-2xl font-bold text-yellow-500`}>{stats.pendingDeposits}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoSession.completedThisMonth', 'Completed This Month')}</p>
              <p className={`text-2xl font-bold text-purple-500`}>{stats.completedThisMonth}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['sessions', 'clients', 'calendar'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`flex-1 px-4 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-[#0D9488] text-[#0D9488]'
                    : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div>
                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <button
                    onClick={() => setShowSessionForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.photoSession.newSession', 'New Session')}
                  </button>
                  <input
                    type="text"
                    placeholder={t('tools.photoSession.searchSessions', 'Search sessions...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="all">{t('tools.photoSession.allStatus', 'All Status')}</option>
                    <option value="inquiry">{t('tools.photoSession.inquiry', 'Inquiry')}</option>
                    <option value="confirmed">{t('tools.photoSession.confirmed', 'Confirmed')}</option>
                    <option value="in-progress">{t('tools.photoSession.inProgress', 'In Progress')}</option>
                    <option value="completed">{t('tools.photoSession.completed', 'Completed')}</option>
                    <option value="cancelled">{t('tools.photoSession.cancelled', 'Cancelled')}</option>
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="all">{t('tools.photoSession.allTypes', 'All Types')}</option>
                    {SESSION_TYPES.map(t => (
                      <option key={t.type} value={t.type}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                  {filteredSessions.length === 0 ? (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.photoSession.noSessionsFoundCreateYour', 'No sessions found. Create your first photo session!')}</p>
                    </div>
                  ) : (
                    filteredSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${STATUS_COLORS[session.status].bg}`}>
                              <Camera className={`w-5 h-5 ${STATUS_COLORS[session.status].text}`} />
                            </div>
                            <div>
                              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {session.clientName}
                              </h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {SESSION_TYPES.find(t => t.type === session.sessionType)?.label} Session
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(session.date)}
                                </span>
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Clock className="w-4 h-4" />
                                  {session.startTime} ({session.duration}h)
                                </span>
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <MapPin className="w-4 h-4" />
                                  {session.location || 'TBD'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(session.packagePrice)}
                              </p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                session.depositPaid
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }`}>
                                {session.depositPaid ? 'Deposit Paid' : `Due: ${formatCurrency(session.depositAmount)}`}
                              </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs capitalize ${STATUS_COLORS[session.status].bg} ${STATUS_COLORS[session.status].text}`}>
                              {session.status.replace('-', ' ')}
                            </span>
                            <button
                              onClick={() => setEditingSession(session)}
                              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Delete Session',
                                  message: 'Delete this session?',
                                  confirmText: 'Delete',
                                  cancelText: 'Cancel',
                                  variant: 'danger'
                                });
                                if (confirmed) {
                                  deleteSession(session.id);
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-500"
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
            )}

            {/* Clients Tab */}
            {activeTab === 'clients' && (
              <div>
                <div className="flex justify-between mb-6">
                  <button
                    onClick={() => setShowClientForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.photoSession.addClient', 'Add Client')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {client.name}
                          </h3>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2 space-y-1`}>
                            <p className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {client.email}
                            </p>
                            {client.phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {client.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Delete Client',
                              message: 'Delete this client?',
                              confirmText: 'Delete',
                              cancelText: 'Cancel',
                              variant: 'danger'
                            });
                            if (confirmed) {
                              deleteClient(client.id);
                            }
                          }}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {sessions.filter(s => s.clientId === client.id).length} sessions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.photoSession.calendarViewComingSoon', 'Calendar view coming soon')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Session Form Modal */}
        {(showSessionForm || editingSession) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } p-6`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingSession ? t('tools.photoSession.editSession', 'Edit Session') : t('tools.photoSession.newPhotoSession', 'New Photo Session')}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.photoSession.client', 'Client')}
                    </label>
                    <select
                      value={editingSession?.clientId || newSession.clientId || ''}
                      onChange={(e) => {
                        const client = clients.find(c => c.id === e.target.value);
                        if (editingSession) {
                          setEditingSession({ ...editingSession, clientId: e.target.value, clientName: client?.name || '' });
                        } else {
                          setNewSession({ ...newSession, clientId: e.target.value, clientName: client?.name || '' });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="">{t('tools.photoSession.selectClient', 'Select Client')}</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.photoSession.sessionType', 'Session Type')}
                    </label>
                    <select
                      value={editingSession?.sessionType || newSession.sessionType}
                      onChange={(e) => {
                        const type = SESSION_TYPES.find(t => t.type === e.target.value);
                        if (editingSession) {
                          setEditingSession({ ...editingSession, sessionType: e.target.value as SessionType, packagePrice: type?.basePrice || 200 });
                        } else {
                          setNewSession({ ...newSession, sessionType: e.target.value as SessionType, packagePrice: type?.basePrice || 200 });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      {SESSION_TYPES.map(t => (
                        <option key={t.type} value={t.type}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.photoSession.date', 'Date')}
                    </label>
                    <input
                      type="date"
                      value={editingSession?.date || newSession.date}
                      onChange={(e) => {
                        if (editingSession) {
                          setEditingSession({ ...editingSession, date: e.target.value });
                        } else {
                          setNewSession({ ...newSession, date: e.target.value });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.photoSession.time', 'Time')}
                    </label>
                    <input
                      type="time"
                      value={editingSession?.startTime || newSession.startTime}
                      onChange={(e) => {
                        if (editingSession) {
                          setEditingSession({ ...editingSession, startTime: e.target.value });
                        } else {
                          setNewSession({ ...newSession, startTime: e.target.value });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.photoSession.durationHours', 'Duration (hours)')}
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={editingSession?.duration || newSession.duration}
                      onChange={(e) => {
                        if (editingSession) {
                          setEditingSession({ ...editingSession, duration: parseFloat(e.target.value) });
                        } else {
                          setNewSession({ ...newSession, duration: parseFloat(e.target.value) });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.photoSession.location', 'Location')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('tools.photoSession.studioOutdoorLocationOrClient', 'Studio, outdoor location, or client address')}
                    value={editingSession?.location || newSession.location}
                    onChange={(e) => {
                      if (editingSession) {
                        setEditingSession({ ...editingSession, location: e.target.value });
                      } else {
                        setNewSession({ ...newSession, location: e.target.value });
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.photoSession.packagePrice', 'Package Price')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingSession?.packagePrice || newSession.packagePrice}
                      onChange={(e) => {
                        if (editingSession) {
                          setEditingSession({ ...editingSession, packagePrice: parseFloat(e.target.value) });
                        } else {
                          setNewSession({ ...newSession, packagePrice: parseFloat(e.target.value) });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.photoSession.depositAmount', 'Deposit Amount')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingSession?.depositAmount || newSession.depositAmount}
                      onChange={(e) => {
                        if (editingSession) {
                          setEditingSession({ ...editingSession, depositAmount: parseFloat(e.target.value) });
                        } else {
                          setNewSession({ ...newSession, depositAmount: parseFloat(e.target.value) });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.photoSession.status', 'Status')}
                    </label>
                    <select
                      value={editingSession?.status || newSession.status}
                      onChange={(e) => {
                        if (editingSession) {
                          setEditingSession({ ...editingSession, status: e.target.value as SessionStatus });
                        } else {
                          setNewSession({ ...newSession, status: e.target.value as SessionStatus });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="inquiry">{t('tools.photoSession.inquiry2', 'Inquiry')}</option>
                      <option value="confirmed">{t('tools.photoSession.confirmed2', 'Confirmed')}</option>
                      <option value="in-progress">{t('tools.photoSession.inProgress2', 'In Progress')}</option>
                      <option value="completed">{t('tools.photoSession.completed2', 'Completed')}</option>
                      <option value="cancelled">{t('tools.photoSession.cancelled2', 'Cancelled')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="depositPaid"
                    checked={editingSession?.depositPaid || newSession.depositPaid}
                    onChange={(e) => {
                      if (editingSession) {
                        setEditingSession({ ...editingSession, depositPaid: e.target.checked });
                      } else {
                        setNewSession({ ...newSession, depositPaid: e.target.checked });
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="depositPaid" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.photoSession.depositPaid', 'Deposit Paid')}
                  </label>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.photoSession.specialRequests', 'Special Requests')}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={t('tools.photoSession.anySpecialRequestsOrNotes', 'Any special requests or notes...')}
                    value={editingSession?.specialRequests || newSession.specialRequests}
                    onChange={(e) => {
                      if (editingSession) {
                        setEditingSession({ ...editingSession, specialRequests: e.target.value });
                      } else {
                        setNewSession({ ...newSession, specialRequests: e.target.value });
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowSessionForm(false);
                    setEditingSession(null);
                    resetSessionForm();
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.photoSession.cancel', 'Cancel')}
                </button>
                <button
                  onClick={editingSession ? handleUpdateSession : handleAddSession}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {editingSession ? t('tools.photoSession.updateSession', 'Update Session') : t('tools.photoSession.createSession', 'Create Session')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client Form Modal */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } p-6`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.photoSession.addNewClient', 'Add New Client')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.photoSession.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.photoSession.email', 'Email *')}
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.photoSession.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.photoSession.address', 'Address')}
                  </label>
                  <input
                    type="text"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.photoSession.notes', 'Notes')}
                  </label>
                  <textarea
                    rows={3}
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowClientForm(false);
                    setNewClient({ name: '', email: '', phone: '', address: '', notes: '' });
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.photoSession.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddClient}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {t('tools.photoSession.addClient2', 'Add Client')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default PhotoSessionTool;
