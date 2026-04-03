'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Lock,
  Unlock,
  Key,
  User,
  UserPlus,
  Users,
  Building2,
  DoorOpen,
  DoorClosed,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Clock,
  Calendar,
  Shield,
  CreditCard,
  Fingerprint,
  QrCode,
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

interface AccessControlToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type AccessLevel = 'guest' | 'employee' | 'manager' | 'admin' | 'security';
type CredentialType = 'keycard' | 'pin' | 'biometric' | 'mobile' | 'temporary';
type AccessStatus = 'active' | 'suspended' | 'expired' | 'revoked';
type AccessLogType = 'entry' | 'exit' | 'denied' | 'tailgating' | 'alarm';

interface AccessZone {
  id: string;
  name: string;
  description: string;
  requiredLevel: AccessLevel;
  isRestricted: boolean;
  maxOccupancy: number;
  currentOccupancy: number;
}

interface AccessCredential {
  id: string;
  holderId: string;
  holderName: string;
  holderType: 'employee' | 'contractor' | 'visitor' | 'temporary';
  credentialType: CredentialType;
  credentialNumber: string;
  accessLevel: AccessLevel;
  status: AccessStatus;
  zones: string[]; // zone IDs
  validFrom: string;
  validUntil: string;
  issueDate: string;
  lastUsed: string;
  notes: string;
}

interface AccessLog {
  id: string;
  credentialId: string;
  holderName: string;
  zoneId: string;
  zoneName: string;
  type: AccessLogType;
  timestamp: string;
  method: CredentialType;
  granted: boolean;
  reason: string;
}

// Column definitions for exports
const CREDENTIAL_COLUMNS: ColumnConfig[] = [
  { key: 'holderName', header: 'Name' },
  { key: 'holderType', header: 'Type' },
  { key: 'credentialNumber', header: 'Credential #' },
  { key: 'credentialType', header: 'Method' },
  { key: 'accessLevel', header: 'Level' },
  { key: 'status', header: 'Status' },
  { key: 'validUntil', header: 'Valid Until' },
];

const ACCESS_LOG_COLUMNS: ColumnConfig[] = [
  { key: 'timestamp', header: 'Time' },
  { key: 'holderName', header: 'Name' },
  { key: 'zoneName', header: 'Zone' },
  { key: 'type', header: 'Type' },
  { key: 'granted', header: 'Granted' },
  { key: 'method', header: 'Method' },
  { key: 'reason', header: 'Reason' },
];

// Helper function to generate unique IDs
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateCredentialNumber = () => `AC${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;

const ACCESS_LEVELS: { value: AccessLevel; label: string; color: string }[] = [
  { value: 'guest', label: 'Guest', color: 'bg-gray-500' },
  { value: 'employee', label: 'Employee', color: 'bg-blue-500' },
  { value: 'manager', label: 'Manager', color: 'bg-green-500' },
  { value: 'admin', label: 'Admin', color: 'bg-purple-500' },
  { value: 'security', label: 'Security', color: 'bg-red-500' },
];

const CREDENTIAL_TYPES: { value: CredentialType; label: string; icon: React.ReactNode }[] = [
  { value: 'keycard', label: 'Key Card', icon: <CreditCard className="w-4 h-4" /> },
  { value: 'pin', label: 'PIN Code', icon: <Key className="w-4 h-4" /> },
  { value: 'biometric', label: 'Biometric', icon: <Fingerprint className="w-4 h-4" /> },
  { value: 'mobile', label: 'Mobile App', icon: <QrCode className="w-4 h-4" /> },
  { value: 'temporary', label: 'Temporary', icon: <Clock className="w-4 h-4" /> },
];

export function AccessControlTool({ uiConfig }: AccessControlToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use useToolData hook for backend sync
  const {
    data: zones,
    addItem: addZoneToBackend,
    updateItem: updateZoneBackend,
    deleteItem: deleteZoneBackend,
  } = useToolData<AccessZone>('access-zones', [], []);

  const {
    data: credentials,
    addItem: addCredentialToBackend,
    updateItem: updateCredentialBackend,
    deleteItem: deleteCredentialBackend,
    isSynced: credentialsSynced,
    isSaving: credentialsSaving,
    lastSaved: credentialsLastSaved,
    syncError: credentialsSyncError,
    forceSync: forceCredentialsSync,
  } = useToolData<AccessCredential>('access-credentials', [], CREDENTIAL_COLUMNS);

  const {
    data: accessLogs,
    addItem: addAccessLogToBackend,
    isSynced: logsSynced,
    isSaving: logsSaving,
    lastSaved: logsLastSaved,
    syncError: logsSyncError,
    forceSync: forceLogsSync,
  } = useToolData<AccessLog>('access-logs', [], ACCESS_LOG_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'credentials' | 'zones' | 'logs'>('credentials');
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState<AccessCredential | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<AccessCredential | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  // New credential form state
  const [newCredential, setNewCredential] = useState<Partial<AccessCredential>>({
    holderName: '',
    holderType: 'employee',
    credentialType: 'keycard',
    accessLevel: 'employee',
    status: 'active',
    zones: [],
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    notes: '',
  });

  // New zone form state
  const [newZone, setNewZone] = useState<Partial<AccessZone>>({
    name: '',
    description: '',
    requiredLevel: 'employee',
    isRestricted: false,
    maxOccupancy: 50,
    currentOccupancy: 0,
  });
  const [zoneErrors, setZoneErrors] = useState<Record<string, string>>({});

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery editing - restore all saved form fields
      if (params.isEditFromGallery) {
        setNewCredential({
          holderName: params.holderName || '',
          holderType: params.holderType || 'employee',
          credentialType: params.credentialType || 'keycard',
          accessLevel: params.accessLevel || 'employee',
          status: params.status || 'active',
          zones: params.zones || [],
          validFrom: params.validFrom || new Date().toISOString().split('T')[0],
          validUntil: params.validUntil || '',
          notes: params.notes || '',
        });
        setShowCredentialForm(true);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else if (params.holderName || params.name) {
        // Regular prefill from AI
        setNewCredential({
          ...newCredential,
          holderName: params.holderName || params.name || '',
          credentialType: (params.credentialType as CredentialType) || 'keycard',
          accessLevel: (params.accessLevel as AccessLevel) || 'employee',
        });
        setShowCredentialForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add credential
  const addCredential = () => {
    if (!newCredential.holderName) {
      setValidationMessage('Please enter holder name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const credential: AccessCredential = {
      id: generateId(),
      holderId: generateId(),
      holderName: newCredential.holderName || '',
      holderType: newCredential.holderType as AccessCredential['holderType'] || 'employee',
      credentialType: newCredential.credentialType as CredentialType || 'keycard',
      credentialNumber: generateCredentialNumber(),
      accessLevel: newCredential.accessLevel as AccessLevel || 'employee',
      status: 'active',
      zones: newCredential.zones || [],
      validFrom: newCredential.validFrom || new Date().toISOString(),
      validUntil: newCredential.validUntil || '',
      issueDate: new Date().toISOString(),
      lastUsed: '',
      notes: newCredential.notes || '',
    };

    if (editingCredential) {
      updateCredentialBackend(editingCredential.id, {
        ...credential,
        id: editingCredential.id,
        credentialNumber: editingCredential.credentialNumber,
        issueDate: editingCredential.issueDate,
      });
    } else {
      addCredentialToBackend(credential);
    }

    // Call onSaveCallback if this is a gallery edit
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback({
        toolId: 'access-control',
        holderName: newCredential.holderName,
        holderType: newCredential.holderType,
        credentialType: newCredential.credentialType,
        accessLevel: newCredential.accessLevel,
        status: newCredential.status,
        zones: newCredential.zones,
        validFrom: newCredential.validFrom,
        validUntil: newCredential.validUntil,
        notes: newCredential.notes,
      });
    }

    resetCredentialForm();
  };

  // Reset credential form
  const resetCredentialForm = () => {
    setShowCredentialForm(false);
    setEditingCredential(null);
    setNewCredential({
      holderName: '',
      holderType: 'employee',
      credentialType: 'keycard',
      accessLevel: 'employee',
      status: 'active',
      zones: [],
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      notes: '',
    });
  };

  // Edit credential
  const editCredential = (credential: AccessCredential) => {
    setEditingCredential(credential);
    setNewCredential({
      ...credential,
      validFrom: credential.validFrom.split('T')[0],
      validUntil: credential.validUntil ? credential.validUntil.split('T')[0] : '',
    });
    setShowCredentialForm(true);
  };

  // Update credential status
  const updateCredentialStatus = (credentialId: string, status: AccessStatus) => {
    updateCredentialBackend(credentialId, { status });
  };

  // Validate zone form
  const validateZone = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newZone.name) errors.name = 'Zone name is required';
    setZoneErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add zone
  const addZone = () => {
    if (!validateZone()) return;

    const zone: AccessZone = {
      id: generateId(),
      name: newZone.name || '',
      description: newZone.description || '',
      requiredLevel: newZone.requiredLevel as AccessLevel || 'employee',
      isRestricted: newZone.isRestricted || false,
      maxOccupancy: newZone.maxOccupancy || 50,
      currentOccupancy: 0,
    };

    addZoneToBackend(zone);
    setShowZoneForm(false);
    setZoneErrors({});
    setNewZone({
      name: '',
      description: '',
      requiredLevel: 'employee',
      isRestricted: false,
      maxOccupancy: 50,
      currentOccupancy: 0,
    });
  };

  // Simulate access attempt
  const simulateAccess = (credential: AccessCredential, zoneId: string, type: 'entry' | 'exit') => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;

    const levelOrder: AccessLevel[] = ['guest', 'employee', 'manager', 'admin', 'security'];
    const credentialLevelIndex = levelOrder.indexOf(credential.accessLevel);
    const zoneLevelIndex = levelOrder.indexOf(zone.requiredLevel);

    const hasZoneAccess = credential.zones.includes(zoneId) || credential.accessLevel === 'admin' || credential.accessLevel === 'security';
    const hasLevelAccess = credentialLevelIndex >= zoneLevelIndex;
    const isActive = credential.status === 'active';
    const isValid = !credential.validUntil || new Date(credential.validUntil) >= new Date();

    const granted = hasZoneAccess && hasLevelAccess && isActive && isValid;

    let reason = '';
    if (!isActive) reason = 'Credential suspended';
    else if (!isValid) reason = 'Credential expired';
    else if (!hasLevelAccess) reason = 'Insufficient access level';
    else if (!hasZoneAccess) reason = 'Zone not authorized';

    const log: AccessLog = {
      id: generateId(),
      credentialId: credential.id,
      holderName: credential.holderName,
      zoneId,
      zoneName: zone.name,
      type: granted ? type : 'denied',
      timestamp: new Date().toISOString(),
      method: credential.credentialType,
      granted,
      reason: granted ? 'Access granted' : reason,
    };

    addAccessLogToBackend(log);

    // Update credential last used
    if (granted) {
      updateCredentialBackend(credential.id, { lastUsed: new Date().toISOString() });
    }
  };

  // Toggle zone access for credential
  const toggleZoneAccess = (zoneId: string) => {
    const currentZones = newCredential.zones || [];
    if (currentZones.includes(zoneId)) {
      setNewCredential({
        ...newCredential,
        zones: currentZones.filter((z) => z !== zoneId),
      });
    } else {
      setNewCredential({
        ...newCredential,
        zones: [...currentZones, zoneId],
      });
    }
  };

  // Get filtered credentials
  const filteredCredentials = useMemo(() => {
    return credentials.filter((credential) => {
      const matchesSearch =
        searchTerm === '' ||
        credential.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credential.credentialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || credential.status === filterStatus;
      const matchesLevel = filterLevel === 'all' || credential.accessLevel === filterLevel;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [credentials, searchTerm, filterStatus, filterLevel]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalCredentials: credentials.length,
      active: credentials.filter((c) => c.status === 'active').length,
      suspended: credentials.filter((c) => c.status === 'suspended').length,
      expired: credentials.filter((c) => c.status === 'expired' || (c.validUntil && new Date(c.validUntil) < new Date())).length,
      todayAccess: accessLogs.filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
      deniedToday: accessLogs.filter((l) => l.type === 'denied' && new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
    };
  }, [credentials, accessLogs]);

  // Prepare export data
  const getExportData = () => {
    if (activeTab === 'credentials') {
      return filteredCredentials.map((c) => ({
        ...c,
        validUntil: c.validUntil ? new Date(c.validUntil).toLocaleDateString() : 'No expiry',
      }));
    }
    return accessLogs.map((l) => ({
      ...l,
      timestamp: new Date(l.timestamp).toLocaleString(),
      granted: l.granted ? 'Yes' : 'No',
    }));
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.accessControl.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.accessControl.accessControlTool', 'Access Control Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.accessControl.manageAccessCredentialsAndZone', 'Manage access credentials and zone permissions')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="access-control" toolName="Access Control" />

              <SyncStatus
                isSynced={credentialsSynced && logsSynced}
                isSaving={credentialsSaving || logsSaving}
                lastSaved={credentialsLastSaved || logsLastSaved}
                syncError={credentialsSyncError || logsSyncError}
                onForceSync={() => {
                  forceCredentialsSync();
                  forceLogsSync();
                }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(getExportData(), activeTab === 'credentials' ? CREDENTIAL_COLUMNS : ACCESS_LOG_COLUMNS, activeTab)}
                onExportExcel={() => exportToExcel(getExportData(), activeTab === 'credentials' ? CREDENTIAL_COLUMNS : ACCESS_LOG_COLUMNS, activeTab)}
                onExportJSON={() => exportToJSON(getExportData(), activeTab)}
                onExportPDF={() => exportToPDF(getExportData(), activeTab === 'credentials' ? CREDENTIAL_COLUMNS : ACCESS_LOG_COLUMNS, activeTab === 'credentials' ? t('tools.accessControl.accessCredentials', 'Access Credentials') : t('tools.accessControl.accessLogs', 'Access Logs'))}
                onCopy={() => copyUtil(getExportData(), activeTab === 'credentials' ? CREDENTIAL_COLUMNS : ACCESS_LOG_COLUMNS)}
                onPrint={() => printData(getExportData(), activeTab === 'credentials' ? CREDENTIAL_COLUMNS : ACCESS_LOG_COLUMNS, activeTab === 'credentials' ? t('tools.accessControl.accessCredentials2', 'Access Credentials') : t('tools.accessControl.accessLogs2', 'Access Logs'))}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            {[
              { label: 'Total Credentials', value: stats.totalCredentials, color: 'bg-blue-500' },
              { label: 'Active', value: stats.active, color: 'bg-green-500' },
              { label: 'Suspended', value: stats.suspended, color: 'bg-yellow-500' },
              { label: 'Expired', value: stats.expired, color: 'bg-red-500' },
              { label: 'Today Access', value: stats.todayAccess, color: 'bg-purple-500' },
              { label: 'Denied Today', value: stats.deniedToday, color: 'bg-orange-500' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}
              >
                <div className={`w-2 h-2 rounded-full ${stat.color} mb-1`} />
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
            {(['credentials', 'zones', 'logs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-purple-500 border-b-2 border-purple-500'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.accessControl.searchCredentials', 'Search credentials...')}
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
                  <option value="all">{t('tools.accessControl.allStatus', 'All Status')}</option>
                  <option value="active">{t('tools.accessControl.active', 'Active')}</option>
                  <option value="suspended">{t('tools.accessControl.suspended', 'Suspended')}</option>
                  <option value="expired">{t('tools.accessControl.expired', 'Expired')}</option>
                  <option value="revoked">{t('tools.accessControl.revoked', 'Revoked')}</option>
                </select>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.accessControl.allLevels', 'All Levels')}</option>
                  {ACCESS_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCredentialForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('tools.accessControl.newCredential', 'New Credential')}
                </button>
              </div>
            </div>

            {/* Credentials Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCredentials.map((credential) => (
                <div
                  key={credential.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-full">
                        <User className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {credential.holderName}
                        </div>
                        <div className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {credential.credentialNumber}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        credential.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : credential.status === 'suspended'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {credential.status}
                    </span>
                  </div>

                  <div className={`text-sm space-y-1 mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-2">
                      {CREDENTIAL_TYPES.find((t) => t.value === credential.credentialType)?.icon}
                      <span className="capitalize">{credential.credentialType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          ACCESS_LEVELS.find((l) => l.value === credential.accessLevel)?.color
                        } text-white`}
                      >
                        {credential.accessLevel}
                      </span>
                    </div>
                    {credential.validUntil && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Expires: {new Date(credential.validUntil).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{credential.zones.length} zones</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => editCredential(credential)}
                      className={`flex-1 py-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}
                    >
                      {t('tools.accessControl.edit', 'Edit')}
                    </button>
                    <button
                      onClick={() =>
                        updateCredentialStatus(
                          credential.id,
                          credential.status === 'active' ? 'suspended' : 'active'
                        )
                      }
                      className={`flex-1 py-1 text-sm ${
                        credential.status === 'active' ? 'text-yellow-500' : 'text-green-500'
                      } hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}
                    >
                      {credential.status === 'active' ? t('tools.accessControl.suspend', 'Suspend') : t('tools.accessControl.activate', 'Activate')}
                    </button>
                    <button
                      onClick={() => deleteCredentialBackend(credential.id)}
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

        {/* Zones Tab */}
        {activeTab === 'zones' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Access Zones ({zones.length})
              </h2>
              <button
                onClick={() => setShowZoneForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.accessControl.addZone', 'Add Zone')}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${zone.isRestricted ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                        {zone.isRestricted ? (
                          <Lock className={`w-5 h-5 ${zone.isRestricted ? 'text-red-500' : 'text-green-500'}`} />
                        ) : (
                          <Unlock className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {zone.name}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Level: {zone.requiredLevel}
                        </div>
                      </div>
                    </div>
                    {zone.isRestricted && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                        {t('tools.accessControl.restricted', 'Restricted')}
                      </span>
                    )}
                  </div>
                  {zone.description && (
                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {zone.description}
                    </p>
                  )}
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Users className="w-3 h-3 inline mr-1" />
                    Occupancy: {zone.currentOccupancy}/{zone.maxOccupancy}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => deleteZoneBackend(zone.id)}
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

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
            {accessLogs.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.accessControl.noAccessLogsYet', 'No access logs yet')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.accessControl.time', 'Time')}
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.accessControl.name', 'Name')}
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.accessControl.zone', 'Zone')}
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.accessControl.type', 'Type')}
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.accessControl.status', 'Status')}
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.accessControl.reason', 'Reason')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {accessLogs.slice(0, 50).map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {log.holderName}
                        </td>
                        <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {log.zoneName}
                        </td>
                        <td className={`px-4 py-3 text-sm capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {log.type}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              log.granted
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {log.granted ? t('tools.accessControl.granted', 'Granted') : t('tools.accessControl.denied', 'Denied')}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {log.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Credential Modal */}
        {showCredentialForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl my-8`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingCredential ? t('tools.accessControl.editCredential', 'Edit Credential') : t('tools.accessControl.newAccessCredential', 'New Access Credential')}
                </h3>
                <button onClick={resetCredentialForm}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.accessControl.holderName', 'Holder Name *')}
                  </label>
                  <input
                    type="text"
                    value={newCredential.holderName}
                    onChange={(e) => setNewCredential({ ...newCredential, holderName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.accessControl.holderType', 'Holder Type')}
                    </label>
                    <select
                      value={newCredential.holderType}
                      onChange={(e) => setNewCredential({ ...newCredential, holderType: e.target.value as AccessCredential['holderType'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="employee">{t('tools.accessControl.employee', 'Employee')}</option>
                      <option value="contractor">{t('tools.accessControl.contractor', 'Contractor')}</option>
                      <option value="visitor">{t('tools.accessControl.visitor', 'Visitor')}</option>
                      <option value="temporary">{t('tools.accessControl.temporary', 'Temporary')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.accessControl.credentialType', 'Credential Type')}
                    </label>
                    <select
                      value={newCredential.credentialType}
                      onChange={(e) => setNewCredential({ ...newCredential, credentialType: e.target.value as CredentialType })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {CREDENTIAL_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.accessControl.accessLevel', 'Access Level')}
                  </label>
                  <select
                    value={newCredential.accessLevel}
                    onChange={(e) => setNewCredential({ ...newCredential, accessLevel: e.target.value as AccessLevel })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {ACCESS_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.accessControl.validFrom', 'Valid From')}
                    </label>
                    <input
                      type="date"
                      value={newCredential.validFrom}
                      onChange={(e) => setNewCredential({ ...newCredential, validFrom: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.accessControl.validUntil', 'Valid Until')}
                    </label>
                    <input
                      type="date"
                      value={newCredential.validUntil}
                      onChange={(e) => setNewCredential({ ...newCredential, validUntil: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                {/* Zone Access */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.accessControl.zoneAccess', 'Zone Access')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {zones.map((zone) => (
                      <label
                        key={zone.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                          newCredential.zones?.includes(zone.id)
                            ? 'bg-purple-100 dark:bg-purple-900/30'
                            : theme === 'dark'
                            ? 'bg-gray-700'
                            : 'bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={newCredential.zones?.includes(zone.id)}
                          onChange={() => toggleZoneAccess(zone.id)}
                          className="w-4 h-4 text-purple-500 rounded"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {zone.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.accessControl.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newCredential.notes}
                    onChange={(e) => setNewCredential({ ...newCredential, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={resetCredentialForm}
                  className={`flex-1 py-2 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.accessControl.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addCredential}
                  className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  {editingCredential ? t('tools.accessControl.update', 'Update') : t('tools.accessControl.create', 'Create')} Credential
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Zone Modal */}
        {showZoneForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.accessControl.addAccessZone', 'Add Access Zone')}
                </h3>
                <button onClick={() => { setShowZoneForm(false); setZoneErrors({}); }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.accessControl.zoneName', 'Zone Name *')}
                  </label>
                  <input
                    type="text"
                    value={newZone.name}
                    onChange={(e) => { setNewZone({ ...newZone, name: e.target.value }); setZoneErrors(prev => ({ ...prev, name: '' })); }}
                    placeholder={t('tools.accessControl.eGMainLobby', 'e.g., Main Lobby')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      zoneErrors.name ? 'border-red-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                    } ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                  />
                  {zoneErrors.name && <p className="text-red-500 text-xs mt-1">{zoneErrors.name}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.accessControl.description', 'Description')}
                  </label>
                  <textarea
                    value={newZone.description}
                    onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.accessControl.requiredAccessLevel', 'Required Access Level')}
                  </label>
                  <select
                    value={newZone.requiredLevel}
                    onChange={(e) => setNewZone({ ...newZone, requiredLevel: e.target.value as AccessLevel })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {ACCESS_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.accessControl.maxOccupancy', 'Max Occupancy')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newZone.maxOccupancy}
                    onChange={(e) => setNewZone({ ...newZone, maxOccupancy: parseInt(e.target.value) || 50 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newZone.isRestricted}
                    onChange={(e) => setNewZone({ ...newZone, isRestricted: e.target.checked })}
                    className="w-4 h-4 text-purple-500 rounded"
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.accessControl.restrictedArea', 'Restricted Area')}
                  </span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowZoneForm(false); setZoneErrors({}); }}
                  className={`flex-1 py-2 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.accessControl.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addZone}
                  className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  {t('tools.accessControl.addZone2', 'Add Zone')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{validationMessage}</span>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
}

export default AccessControlTool;
