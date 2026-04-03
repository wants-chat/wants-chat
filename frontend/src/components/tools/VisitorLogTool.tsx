'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Building2,
  Phone,
  Mail,
  Car,
  CreditCard,
  Camera,
  FileText,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  LogIn,
  LogOut,
  QrCode,
  Printer,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface VisitorLogToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type VisitorType = 'guest' | 'contractor' | 'vendor' | 'delivery' | 'interview' | 'vip' | 'other';
type VisitStatus = 'pre-registered' | 'checked-in' | 'checked-out' | 'denied' | 'no-show' | 'cancelled';
type IDType = 'drivers-license' | 'passport' | 'state-id' | 'employee-badge' | 'other';

interface Host {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
}

interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  visitorType: VisitorType;
  idType: IDType;
  idNumber: string;
  vehiclePlate: string;
  photo: string;
  createdAt: string;
}

interface Visit {
  id: string;
  visitorId: string;
  hostId: string;
  purpose: string;
  status: VisitStatus;
  scheduledDate: string;
  scheduledTime: string;
  checkInTime: string;
  checkOutTime: string;
  badgeNumber: string;
  escortRequired: boolean;
  ndaSigned: boolean;
  notes: string;
  createdAt: string;
}

// Column definitions for exports
const VISIT_COLUMNS: ColumnConfig[] = [
  { key: 'visitorName', header: 'Visitor' },
  { key: 'company', header: 'Company' },
  { key: 'hostName', header: 'Host' },
  { key: 'purpose', header: 'Purpose' },
  { key: 'status', header: 'Status' },
  { key: 'scheduledDate', header: 'Date' },
  { key: 'checkInTime', header: 'Check In' },
  { key: 'checkOutTime', header: 'Check Out' },
  { key: 'badgeNumber', header: 'Badge' },
];

// Helper function to generate unique IDs
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateBadgeNumber = () => `V${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

const VISITOR_TYPES: { value: VisitorType; label: string }[] = [
  { value: 'guest', label: 'Guest' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'interview', label: 'Interview' },
  { value: 'vip', label: 'VIP' },
  { value: 'other', label: 'Other' },
];

const ID_TYPES: { value: IDType; label: string }[] = [
  { value: 'drivers-license', label: "Driver's License" },
  { value: 'passport', label: 'Passport' },
  { value: 'state-id', label: 'State ID' },
  { value: 'employee-badge', label: 'Employee Badge' },
  { value: 'other', label: 'Other' },
];

const STATUS_COLORS: Record<VisitStatus, string> = {
  'pre-registered': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'checked-in': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'checked-out': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
  denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'no-show': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
};

export function VisitorLogTool({ uiConfig }: VisitorLogToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use useToolData hook for backend sync
  const {
    data: visitors,
    addItem: addVisitorToBackend,
    updateItem: updateVisitorBackend,
    deleteItem: deleteVisitorBackend,
  } = useToolData<Visitor>('visitor-log-visitors', [], []);

  const {
    data: hosts,
    addItem: addHostToBackend,
    deleteItem: deleteHostBackend,
  } = useToolData<Host>('visitor-log-hosts', [], []);

  const {
    data: visits,
    addItem: addVisitToBackend,
    updateItem: updateVisitBackend,
    deleteItem: deleteVisitBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Visit>('visitor-log-visits', [], VISIT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'today' | 'all' | 'pre-register' | 'hosts'>('today');
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showHostForm, setShowHostForm] = useState(false);
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // New visit form state
  const [newVisit, setNewVisit] = useState<{
    visitor: Partial<Visitor>;
    visit: Partial<Visit>;
    isNewVisitor: boolean;
    selectedVisitorId: string;
  }>({
    visitor: {
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      visitorType: 'guest',
      idType: 'drivers-license',
      idNumber: '',
      vehiclePlate: '',
    },
    visit: {
      hostId: '',
      purpose: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      escortRequired: false,
      ndaSigned: false,
      notes: '',
    },
    isNewVisitor: true,
    selectedVisitorId: '',
  });

  // New host form state
  const [newHost, setNewHost] = useState<Partial<Host>>({
    name: '',
    department: '',
    email: '',
    phone: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.visitorName || params.firstName || params.name) {
        const nameParts = (params.visitorName || params.name || '').split(' ');
        setNewVisit({
          ...newVisit,
          visitor: {
            ...newVisit.visitor,
            firstName: params.firstName || nameParts[0] || '',
            lastName: params.lastName || nameParts.slice(1).join(' ') || '',
            company: params.company || '',
            email: params.email || '',
            phone: params.phone || '',
          },
          visit: {
            ...newVisit.visit,
            purpose: params.purpose || '',
          },
        });
        setShowVisitForm(true);
        setActiveTab('pre-register');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Create visit
  const createVisit = () => {
    if (newVisit.isNewVisitor && (!newVisit.visitor.firstName || !newVisit.visitor.lastName)) {
      setValidationMessage('Please enter visitor name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    if (!newVisit.isNewVisitor && !newVisit.selectedVisitorId) {
      setValidationMessage('Please select a visitor');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    if (!newVisit.visit.hostId) {
      setValidationMessage('Please select a host');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    let visitorId = newVisit.selectedVisitorId;

    // Create new visitor if needed
    if (newVisit.isNewVisitor) {
      const visitor: Visitor = {
        id: generateId(),
        firstName: newVisit.visitor.firstName || '',
        lastName: newVisit.visitor.lastName || '',
        company: newVisit.visitor.company || '',
        email: newVisit.visitor.email || '',
        phone: newVisit.visitor.phone || '',
        visitorType: newVisit.visitor.visitorType as VisitorType || 'guest',
        idType: newVisit.visitor.idType as IDType || 'drivers-license',
        idNumber: newVisit.visitor.idNumber || '',
        vehiclePlate: newVisit.visitor.vehiclePlate || '',
        photo: '',
        createdAt: new Date().toISOString(),
      };
      addVisitorToBackend(visitor);
      visitorId = visitor.id;
    }

    // Create visit
    const visit: Visit = {
      id: generateId(),
      visitorId,
      hostId: newVisit.visit.hostId || '',
      purpose: newVisit.visit.purpose || '',
      status: 'pre-registered',
      scheduledDate: newVisit.visit.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: newVisit.visit.scheduledTime || '09:00',
      checkInTime: '',
      checkOutTime: '',
      badgeNumber: '',
      escortRequired: newVisit.visit.escortRequired || false,
      ndaSigned: newVisit.visit.ndaSigned || false,
      notes: newVisit.visit.notes || '',
      createdAt: new Date().toISOString(),
    };

    addVisitToBackend(visit);
    resetVisitForm();
    setActiveTab('today');
  };

  // Reset visit form
  const resetVisitForm = () => {
    setShowVisitForm(false);
    setNewVisit({
      visitor: {
        firstName: '',
        lastName: '',
        company: '',
        email: '',
        phone: '',
        visitorType: 'guest',
        idType: 'drivers-license',
        idNumber: '',
        vehiclePlate: '',
      },
      visit: {
        hostId: '',
        purpose: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00',
        escortRequired: false,
        ndaSigned: false,
        notes: '',
      },
      isNewVisitor: true,
      selectedVisitorId: '',
    });
  };

  // Check in visitor
  const checkInVisitor = (visitId: string) => {
    const badgeNumber = generateBadgeNumber();
    updateVisitBackend(visitId, {
      status: 'checked-in',
      checkInTime: new Date().toISOString(),
      badgeNumber,
    });
  };

  // Check out visitor
  const checkOutVisitor = (visitId: string) => {
    updateVisitBackend(visitId, {
      status: 'checked-out',
      checkOutTime: new Date().toISOString(),
    });
  };

  // Add host
  const addHost = () => {
    if (!newHost.name) {
      setValidationMessage('Please enter host name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const host: Host = {
      id: generateId(),
      name: newHost.name || '',
      department: newHost.department || '',
      email: newHost.email || '',
      phone: newHost.phone || '',
    };

    addHostToBackend(host);
    setShowHostForm(false);
    setNewHost({
      name: '',
      department: '',
      email: '',
      phone: '',
    });
  };

  // Get visitor by ID
  const getVisitor = (visitorId: string) => visitors.find((v) => v.id === visitorId);
  const getHost = (hostId: string) => hosts.find((h) => h.id === hostId);

  // Get today's visits
  const todaysVisits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return visits.filter((v) => v.scheduledDate === today);
  }, [visits]);

  // Get filtered visits
  const filteredVisits = useMemo(() => {
    const visitsToFilter = activeTab === 'today' ? todaysVisits : visits;
    return visitsToFilter.filter((visit) => {
      const visitor = getVisitor(visit.visitorId);
      const host = getHost(visit.hostId);
      const matchesSearch =
        searchTerm === '' ||
        `${visitor?.firstName} ${visitor?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || visit.status === filterStatus;
      const matchesType = filterType === 'all' || visitor?.visitorType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [visits, todaysVisits, activeTab, searchTerm, filterStatus, filterType, visitors, hosts]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalToday: todaysVisits.length,
      checkedIn: todaysVisits.filter((v) => v.status === 'checked-in').length,
      preRegistered: todaysVisits.filter((v) => v.status === 'pre-registered').length,
      checkedOut: todaysVisits.filter((v) => v.status === 'checked-out').length,
      currentOnSite: todaysVisits.filter((v) => v.status === 'checked-in').length,
    };
  }, [todaysVisits]);

  // Prepare export data
  const getExportData = () => {
    return filteredVisits.map((visit) => {
      const visitor = getVisitor(visit.visitorId);
      const host = getHost(visit.hostId);
      return {
        ...visit,
        visitorName: `${visitor?.firstName} ${visitor?.lastName}`,
        company: visitor?.company || '',
        hostName: host?.name || '',
        checkInTime: visit.checkInTime ? new Date(visit.checkInTime).toLocaleTimeString() : '-',
        checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime).toLocaleTimeString() : '-',
      };
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.visitorLog.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.visitorLog.visitorLogTool', 'Visitor Log Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.visitorLog.registerAndTrackVisitorCheck', 'Register and track visitor check-ins')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="visitor-log" toolName="Visitor Log" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(getExportData(), VISIT_COLUMNS, 'visitor-log')}
                onExportExcel={() => exportToExcel(getExportData(), VISIT_COLUMNS, 'visitor-log')}
                onExportJSON={() => exportToJSON(getExportData(), 'visitor-log')}
                onExportPDF={() => exportToPDF(getExportData(), VISIT_COLUMNS, 'Visitor Log')}
                onCopy={() => copyUtil(getExportData(), VISIT_COLUMNS)}
                onPrint={() => printData(getExportData(), VISIT_COLUMNS, 'Visitor Log')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {[
              { label: 'Expected Today', value: stats.totalToday, color: 'bg-blue-500', icon: Calendar },
              { label: 'Pre-Registered', value: stats.preRegistered, color: 'bg-yellow-500', icon: Clock },
              { label: 'Checked In', value: stats.checkedIn, color: 'bg-green-500', icon: LogIn },
              { label: 'Checked Out', value: stats.checkedOut, color: 'bg-gray-500', icon: LogOut },
              { label: 'Currently On-Site', value: stats.currentOnSite, color: 'bg-indigo-500', icon: Users },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                  <stat.icon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {(['today', 'all', 'pre-register', 'hosts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-indigo-500 border-b-2 border-indigo-500'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'pre-register' ? 'Pre-Register' : tab === 'today' ? "Today's Visitors" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Today / All Visitors Tab */}
        {(activeTab === 'today' || activeTab === 'all') && (
          <div className="space-y-6">
            {/* Filters */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.visitorLog.searchVisitors', 'Search visitors...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.visitorLog.allStatus', 'All Status')}</option>
                  <option value="pre-registered">{t('tools.visitorLog.preRegistered', 'Pre-Registered')}</option>
                  <option value="checked-in">{t('tools.visitorLog.checkedIn', 'Checked In')}</option>
                  <option value="checked-out">{t('tools.visitorLog.checkedOut', 'Checked Out')}</option>
                  <option value="no-show">{t('tools.visitorLog.noShow', 'No Show')}</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.visitorLog.allTypes', 'All Types')}</option>
                  {VISITOR_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setShowVisitForm(true);
                    setActiveTab('pre-register');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('tools.visitorLog.newVisitor', 'New Visitor')}
                </button>
              </div>
            </div>

            {/* Visitors List */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
              {filteredVisits.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.visitorLog.noVisitorsFound', 'No visitors found')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredVisits.map((visit) => {
                    const visitor = getVisitor(visit.visitorId);
                    const host = getHost(visit.hostId);
                    return (
                      <div
                        key={visit.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/10 rounded-full">
                              <UserCheck className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {visitor?.firstName} {visitor?.lastName}
                                {visitor?.visitorType === 'vip' && (
                                  <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                                    {t('tools.visitorLog.vip', 'VIP')}
                                  </span>
                                )}
                              </div>
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {visitor?.company && (
                                  <span>
                                    <Building2 className="w-3 h-3 inline mr-1" />
                                    {visitor.company}
                                  </span>
                                )}
                                {host && (
                                  <span className="ml-3">
                                    Host: {host.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {visit.scheduledTime}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[visit.status]}`}>
                                {visit.status.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {visit.status === 'pre-registered' && (
                                <button
                                  onClick={() => checkInVisitor(visit.id)}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                >
                                  {t('tools.visitorLog.checkIn', 'Check In')}
                                </button>
                              )}
                              {visit.status === 'checked-in' && (
                                <>
                                  {visit.badgeNumber && (
                                    <span className={`px-2 py-1 text-xs font-mono ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded`}>
                                      Badge: {visit.badgeNumber}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => checkOutVisitor(visit.id)}
                                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                  >
                                    {t('tools.visitorLog.checkOut', 'Check Out')}
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => deleteVisitBackend(visit.id)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {visit.purpose && (
                          <div className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Purpose: {visit.purpose}
                          </div>
                        )}
                        {(visit.escortRequired || visit.ndaSigned) && (
                          <div className="mt-2 flex gap-2">
                            {visit.escortRequired && (
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded">
                                {t('tools.visitorLog.escortRequired', 'Escort Required')}
                              </span>
                            )}
                            {visit.ndaSigned && (
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded">
                                {t('tools.visitorLog.ndaSigned', 'NDA Signed')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pre-Register Tab */}
        {activeTab === 'pre-register' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.visitorLog.preRegisterAVisitor', 'Pre-Register a Visitor')}
            </h2>

            <div className="space-y-6">
              {/* Visitor Type Toggle */}
              <div className="flex gap-4">
                <button
                  onClick={() => setNewVisit({ ...newVisit, isNewVisitor: true, selectedVisitorId: '' })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    newVisit.isNewVisitor
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : theme === 'dark'
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserPlus className={`w-6 h-6 mx-auto mb-2 ${newVisit.isNewVisitor ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.visitorLog.newVisitor2', 'New Visitor')}
                  </div>
                </button>
                <button
                  onClick={() => setNewVisit({ ...newVisit, isNewVisitor: false })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    !newVisit.isNewVisitor
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : theme === 'dark'
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className={`w-6 h-6 mx-auto mb-2 ${!newVisit.isNewVisitor ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.visitorLog.returningVisitor', 'Returning Visitor')}
                  </div>
                </button>
              </div>

              {/* Visitor Details */}
              {newVisit.isNewVisitor ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.firstName', 'First Name *')}
                    </label>
                    <input
                      type="text"
                      value={newVisit.visitor.firstName}
                      onChange={(e) => setNewVisit({ ...newVisit, visitor: { ...newVisit.visitor, firstName: e.target.value } })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.lastName', 'Last Name *')}
                    </label>
                    <input
                      type="text"
                      value={newVisit.visitor.lastName}
                      onChange={(e) => setNewVisit({ ...newVisit, visitor: { ...newVisit.visitor, lastName: e.target.value } })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.company', 'Company')}
                    </label>
                    <input
                      type="text"
                      value={newVisit.visitor.company}
                      onChange={(e) => setNewVisit({ ...newVisit, visitor: { ...newVisit.visitor, company: e.target.value } })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.visitorType', 'Visitor Type')}
                    </label>
                    <select
                      value={newVisit.visitor.visitorType}
                      onChange={(e) => setNewVisit({ ...newVisit, visitor: { ...newVisit.visitor, visitorType: e.target.value as VisitorType } })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {VISITOR_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={newVisit.visitor.email}
                      onChange={(e) => setNewVisit({ ...newVisit, visitor: { ...newVisit.visitor, email: e.target.value } })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={newVisit.visitor.phone}
                      onChange={(e) => setNewVisit({ ...newVisit, visitor: { ...newVisit.visitor, phone: e.target.value } })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.visitorLog.selectVisitor', 'Select Visitor *')}
                  </label>
                  <select
                    value={newVisit.selectedVisitorId}
                    onChange={(e) => setNewVisit({ ...newVisit, selectedVisitorId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.visitorLog.selectAVisitor', 'Select a visitor')}</option>
                    {visitors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.firstName} {v.lastName} {v.company && `(${v.company})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Visit Details */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.visitorLog.visitDetails', 'Visit Details')}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.host', 'Host *')}
                    </label>
                    <select
                      value={newVisit.visit.hostId}
                      onChange={(e) => setNewVisit({ ...newVisit, visit: { ...newVisit.visit, hostId: e.target.value } })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.visitorLog.selectAHost', 'Select a host')}</option>
                      {hosts.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} {h.department && `(${h.department})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.purpose', 'Purpose')}
                    </label>
                    <input
                      type="text"
                      value={newVisit.visit.purpose}
                      onChange={(e) => setNewVisit({ ...newVisit, visit: { ...newVisit.visit, purpose: e.target.value } })}
                      placeholder={t('tools.visitorLog.eGMeetingInterviewDelivery', 'e.g., Meeting, Interview, Delivery')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.date', 'Date')}
                    </label>
                    <input
                      type="date"
                      value={newVisit.visit.scheduledDate}
                      onChange={(e) => setNewVisit({ ...newVisit, visit: { ...newVisit.visit, scheduledDate: e.target.value } })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.time', 'Time')}
                    </label>
                    <input
                      type="time"
                      value={newVisit.visit.scheduledTime}
                      onChange={(e) => setNewVisit({ ...newVisit, visit: { ...newVisit.visit, scheduledTime: e.target.value } })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newVisit.visit.escortRequired}
                      onChange={(e) => setNewVisit({ ...newVisit, visit: { ...newVisit.visit, escortRequired: e.target.checked } })}
                      className="w-4 h-4 text-indigo-500 rounded"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.escortRequired2', 'Escort Required')}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newVisit.visit.ndaSigned}
                      onChange={(e) => setNewVisit({ ...newVisit, visit: { ...newVisit.visit, ndaSigned: e.target.checked } })}
                      className="w-4 h-4 text-indigo-500 rounded"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.visitorLog.ndaRequired', 'NDA Required')}
                    </span>
                  </label>
                </div>
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.visitorLog.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newVisit.visit.notes}
                    onChange={(e) => setNewVisit({ ...newVisit, visit: { ...newVisit.visit, notes: e.target.value } })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetVisitForm}
                  className={`flex-1 py-2 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.visitorLog.cancel', 'Cancel')}
                </button>
                <button
                  onClick={createVisit}
                  className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  {t('tools.visitorLog.preRegisterVisitor', 'Pre-Register Visitor')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hosts Tab */}
        {activeTab === 'hosts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Hosts ({hosts.length})
              </h2>
              <button
                onClick={() => setShowHostForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.visitorLog.addHost', 'Add Host')}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hosts.map((host) => (
                <div
                  key={host.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-full">
                        <UserCheck className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {host.name}
                        </div>
                        {host.department && (
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {host.department}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {host.email && (
                      <div>
                        <Mail className="w-3 h-3 inline mr-1" />
                        {host.email}
                      </div>
                    )}
                    {host.phone && (
                      <div>
                        <Phone className="w-3 h-3 inline mr-1" />
                        {host.phone}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => deleteHostBackend(host.id)}
                      className="flex-1 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Host Modal */}
        {showHostForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.visitorLog.addHost2', 'Add Host')}
                </h3>
                <button onClick={() => setShowHostForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.visitorLog.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newHost.name}
                    onChange={(e) => setNewHost({ ...newHost, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.visitorLog.department', 'Department')}
                  </label>
                  <input
                    type="text"
                    value={newHost.department}
                    onChange={(e) => setNewHost({ ...newHost, department: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.visitorLog.email2', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newHost.email}
                    onChange={(e) => setNewHost({ ...newHost, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.visitorLog.phone2', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newHost.phone}
                    onChange={(e) => setNewHost({ ...newHost, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowHostForm(false)}
                  className={`flex-1 py-2 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.visitorLog.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addHost}
                  className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  {t('tools.visitorLog.addHost3', 'Add Host')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisitorLogTool;
