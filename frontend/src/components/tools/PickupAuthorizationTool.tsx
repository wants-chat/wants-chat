'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';
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
import {
  UserCheck,
  Users,
  Phone,
  Mail,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Camera,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  History,
  Baby,
  Sparkles,
} from 'lucide-react';

interface PickupAuthorizationToolProps {
  uiConfig?: UIConfig;
}

// Types
interface AuthorizedPerson {
  id: string;
  childId: string;
  childName: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  photoUrl?: string;
  idType: 'drivers-license' | 'passport' | 'state-id' | 'other';
  idNumber?: string;
  idExpiryDate?: string;
  isPrimary: boolean;
  isEmergencyOnly: boolean;
  restrictions?: string;
  addedBy: string;
  addedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  status: 'active' | 'pending' | 'suspended' | 'revoked';
  notes?: string;
}

interface PickupLog {
  id: string;
  childId: string;
  childName: string;
  authorizedPersonId: string;
  authorizedPersonName: string;
  relationship: string;
  pickupTime: string;
  pickupDate: string;
  verifiedBy: string;
  idChecked: boolean;
  codeVerified: boolean;
  photoMatched: boolean;
  notes?: string;
  flagged: boolean;
  flagReason?: string;
}

interface PickupCode {
  id: string;
  childId: string;
  childName: string;
  code: string;
  validFrom: string;
  validUntil: string;
  singleUse: boolean;
  usedAt?: string;
  usedBy?: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'used' | 'expired' | 'revoked';
  notes?: string;
}

// Column configurations for export
const authorizedPersonColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'childName', header: 'Child', type: 'string' },
  { key: 'name', header: 'Authorized Person', type: 'string' },
  { key: 'relationship', header: 'Relationship', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

const pickupLogColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'childName', header: 'Child', type: 'string' },
  { key: 'authorizedPersonName', header: 'Picked Up By', type: 'string' },
  { key: 'pickupDate', header: 'Date', type: 'date' },
  { key: 'pickupTime', header: 'Time', type: 'string' },
  { key: 'verifiedBy', header: 'Verified By', type: 'string' },
];

// Constants
const RELATIONSHIPS = [
  'Mother', 'Father', 'Stepmother', 'Stepfather', 'Grandmother', 'Grandfather',
  'Aunt', 'Uncle', 'Sibling', 'Nanny/Babysitter', 'Family Friend', 'Neighbor', 'Other',
];

const ID_TYPES = [
  { value: 'drivers-license', label: "Driver's License" },
  { value: 'passport', label: 'Passport' },
  { value: 'state-id', label: 'State ID' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'pending', label: 'Pending Verification', color: 'yellow' },
  { value: 'suspended', label: 'Suspended', color: 'orange' },
  { value: 'revoked', label: 'Revoked', color: 'red' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const generatePickupCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

type TabType = 'authorized' | 'pickup-logs' | 'codes';

export const PickupAuthorizationTool: React.FC<PickupAuthorizationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('authorized');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterChild, setFilterChild] = useState<string>('all');
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<AuthorizedPerson | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: authorizedPersons,
    addItem: addPerson,
    updateItem: updatePerson,
    deleteItem: deletePerson,
    isSynced: personsSynced,
    isSaving: personsSaving,
    lastSaved: personsLastSaved,
    syncError: personsSyncError,
    forceSync: forcePersonsSync,
  } = useToolData<AuthorizedPerson>('daycare-authorized-pickups', [], authorizedPersonColumns);

  const {
    data: pickupLogs,
    addItem: addPickupLog,
  } = useToolData<PickupLog>('daycare-pickup-logs', [], pickupLogColumns);

  const {
    data: pickupCodes,
    addItem: addPickupCode,
    updateItem: updatePickupCode,
  } = useToolData<PickupCode>('daycare-pickup-codes', [], [
    { key: 'code', header: 'Code', type: 'string' },
    { key: 'childName', header: 'Child', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
  ]);

  // Form states
  const [personForm, setPersonForm] = useState<Partial<AuthorizedPerson>>({
    relationship: 'Mother',
    idType: 'drivers-license',
    isPrimary: false,
    isEmergencyOnly: false,
    status: 'pending',
  });

  const [codeForm, setCodeForm] = useState<Partial<PickupCode>>({
    singleUse: true,
  });

  const [logForm, setLogForm] = useState<Partial<PickupLog>>({
    idChecked: false,
    codeVerified: false,
    photoMatched: false,
    flagged: false,
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.childName) setPersonForm(prev => ({ ...prev, childName: params.childName }));
      if (params.personName) setPersonForm(prev => ({ ...prev, name: params.personName }));
      setShowPersonModal(true);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Get unique children for filter
  const uniqueChildren = useMemo(() => {
    const children = new Set<string>();
    authorizedPersons.forEach(p => children.add(p.childName));
    return Array.from(children).sort();
  }, [authorizedPersons]);

  // Filtered authorized persons
  const filteredPersons = useMemo(() => {
    return authorizedPersons.filter((person) => {
      const matchesSearch =
        searchTerm === '' ||
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.childName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || person.status === filterStatus;
      const matchesChild = filterChild === 'all' || person.childName === filterChild;
      return matchesSearch && matchesStatus && matchesChild;
    });
  }, [authorizedPersons, searchTerm, filterStatus, filterChild]);

  // Today's pickups
  const todaysPickups = useMemo(() => {
    return pickupLogs.filter(log => log.pickupDate === selectedDate);
  }, [pickupLogs, selectedDate]);

  // Active codes
  const activeCodes = useMemo(() => {
    const now = new Date();
    return pickupCodes.filter(code => {
      if (code.status !== 'active') return false;
      const validUntil = new Date(code.validUntil);
      return validUntil > now;
    });
  }, [pickupCodes]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalAuthorized: authorizedPersons.filter(p => p.status === 'active').length,
      pendingVerification: authorizedPersons.filter(p => p.status === 'pending').length,
      todaysPickups: todaysPickups.length,
      flaggedPickups: todaysPickups.filter(p => p.flagged).length,
      activeCodes: activeCodes.length,
    };
  }, [authorizedPersons, todaysPickups, activeCodes]);

  // Save authorized person
  const savePerson = () => {
    if (!personForm.childName || !personForm.name || !personForm.phone) {
      setValidationMessage('Please fill in child name, authorized person name, and phone number');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const person: AuthorizedPerson = {
      id: editingPerson?.id || generateId(),
      childId: editingPerson?.childId || generateId(),
      childName: personForm.childName || '',
      name: personForm.name || '',
      relationship: personForm.relationship || 'Other',
      phone: personForm.phone || '',
      email: personForm.email,
      address: personForm.address,
      photoUrl: personForm.photoUrl,
      idType: personForm.idType || 'drivers-license',
      idNumber: personForm.idNumber,
      idExpiryDate: personForm.idExpiryDate,
      isPrimary: personForm.isPrimary || false,
      isEmergencyOnly: personForm.isEmergencyOnly || false,
      restrictions: personForm.restrictions,
      addedBy: 'Staff',
      addedAt: editingPerson?.addedAt || now,
      verifiedBy: personForm.status === 'active' ? 'Staff' : undefined,
      verifiedAt: personForm.status === 'active' ? now : undefined,
      status: personForm.status || 'pending',
      notes: personForm.notes,
    };

    if (editingPerson) {
      updatePerson(editingPerson.id, person);
    } else {
      addPerson(person);
    }

    resetPersonForm();
  };

  // Generate pickup code
  const generateCode = () => {
    if (!codeForm.childName) {
      setValidationMessage('Please select a child');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setHours(validUntil.getHours() + 24); // Valid for 24 hours by default

    const code: PickupCode = {
      id: generateId(),
      childId: generateId(),
      childName: codeForm.childName || '',
      code: generatePickupCode(),
      validFrom: codeForm.validFrom || now.toISOString(),
      validUntil: codeForm.validUntil || validUntil.toISOString(),
      singleUse: codeForm.singleUse ?? true,
      createdBy: 'Staff',
      createdAt: now.toISOString(),
      status: 'active',
      notes: codeForm.notes,
    };

    addPickupCode(code);
    resetCodeForm();
  };

  // Log a pickup
  const logPickup = () => {
    if (!logForm.childName || !logForm.authorizedPersonId) {
      setValidationMessage('Please select child and authorized person');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const person = authorizedPersons.find(p => p.id === logForm.authorizedPersonId);
    if (!person) {
      setValidationMessage('Authorized person not found');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date();
    const log: PickupLog = {
      id: generateId(),
      childId: person.childId,
      childName: logForm.childName || '',
      authorizedPersonId: person.id,
      authorizedPersonName: person.name,
      relationship: person.relationship,
      pickupTime: now.toTimeString().slice(0, 5),
      pickupDate: now.toISOString().split('T')[0],
      verifiedBy: 'Staff',
      idChecked: logForm.idChecked || false,
      codeVerified: logForm.codeVerified || false,
      photoMatched: logForm.photoMatched || false,
      notes: logForm.notes,
      flagged: logForm.flagged || false,
      flagReason: logForm.flagReason,
    };

    addPickupLog(log);
    resetLogForm();
  };

  // Verify person (change status to active)
  const verifyPerson = (personId: string) => {
    const person = authorizedPersons.find(p => p.id === personId);
    if (person) {
      const now = new Date().toISOString();
      updatePerson(personId, {
        ...person,
        status: 'active',
        verifiedBy: 'Staff',
        verifiedAt: now,
      });
    }
  };

  // Suspend person
  const suspendPerson = async (personId: string) => {
    const person = authorizedPersons.find(p => p.id === personId);
    if (person) {
      const confirmed = await confirm({
        title: 'Confirm Suspension',
        message: 'Are you sure you want to suspend this authorization?',
        confirmText: 'Suspend',
        cancelText: 'Cancel',
        variant: 'danger',
      });
      if (confirmed) {
        updatePerson(personId, { ...person, status: 'suspended' });
      }
    }
  };

  // Revoke code
  const revokeCode = async (codeId: string) => {
    const code = pickupCodes.find(c => c.id === codeId);
    if (code) {
      const confirmed = await confirm({
        title: 'Confirm Revocation',
        message: 'Are you sure you want to revoke this code?',
        confirmText: 'Revoke',
        cancelText: 'Cancel',
        variant: 'danger',
      });
      if (confirmed) {
        updatePickupCode(codeId, { ...code, status: 'revoked' });
      }
    }
  };

  // Reset forms
  const resetPersonForm = () => {
    setPersonForm({
      relationship: 'Mother',
      idType: 'drivers-license',
      isPrimary: false,
      isEmergencyOnly: false,
      status: 'pending',
    });
    setEditingPerson(null);
    setShowPersonModal(false);
  };

  const resetCodeForm = () => {
    setCodeForm({ singleUse: true });
    setShowCodeModal(false);
  };

  const resetLogForm = () => {
    setLogForm({
      idChecked: false,
      codeVerified: false,
      photoMatched: false,
      flagged: false,
    });
    setShowLogModal(false);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    switch (option?.color) {
      case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'orange': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'red': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  const tabClass = (active: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    active
      ? 'bg-[#0D9488] text-white'
      : theme === 'dark'
        ? 'text-gray-400 hover:bg-gray-700'
        : 'text-gray-600 hover:bg-gray-100'
  }`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.pickupAuthorization.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pickupAuthorization.pickupAuthorizationManager', 'Pickup Authorization Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.pickupAuthorization.manageAuthorizedPickupsAndVerify', 'Manage authorized pickups and verify identities')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="pickup-authorization" toolName="Pickup Authorization" />

              <SyncStatus
                isSynced={personsSynced}
                isSaving={personsSaving}
                lastSaved={personsLastSaved}
                syncError={personsSyncError}
                onForceSync={forcePersonsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(authorizedPersons, authorizedPersonColumns, 'authorized-pickups')}
                onExportExcel={() => exportToExcel(authorizedPersons, authorizedPersonColumns, 'authorized-pickups')}
                onExportJSON={() => exportToJSON(authorizedPersons, 'authorized-pickups')}
                onExportPDF={() => exportToPDF(authorizedPersons, authorizedPersonColumns, 'Authorized Pickups')}
                onCopy={() => copyUtil(authorizedPersons, authorizedPersonColumns)}
                onPrint={() => printData(authorizedPersons, authorizedPersonColumns, 'Authorized Pickups')}
                theme={theme}
              />
              <button
                onClick={() => setShowLogModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <History className="w-4 h-4" />
                {t('tools.pickupAuthorization.logPickup', 'Log Pickup')}
              </button>
              <button
                onClick={() => setShowPersonModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.pickupAuthorization.addAuthorizedPerson', 'Add Authorized Person')}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pickupAuthorization.totalAuthorized', 'Total Authorized')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalAuthorized}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.pickupAuthorization.pendingVerification', 'Pending Verification')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.pendingVerification}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{t('tools.pickupAuthorization.todaySPickups', 'Today\'s Pickups')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{stats.todaysPickups}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{t('tools.pickupAuthorization.flagged', 'Flagged')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{stats.flaggedPickups}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{t('tools.pickupAuthorization.activeCodes', 'Active Codes')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{stats.activeCodes}</p>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveTab('authorized')} className={tabClass(activeTab === 'authorized')}>
                <Users className="w-4 h-4 inline mr-2" />
                {t('tools.pickupAuthorization.authorizedPersons', 'Authorized Persons')}
              </button>
              <button onClick={() => setActiveTab('pickup-logs')} className={tabClass(activeTab === 'pickup-logs')}>
                <History className="w-4 h-4 inline mr-2" />
                {t('tools.pickupAuthorization.pickupLogs', 'Pickup Logs')}
              </button>
              <button onClick={() => setActiveTab('codes')} className={tabClass(activeTab === 'codes')}>
                <Lock className="w-4 h-4 inline mr-2" />
                {t('tools.pickupAuthorization.pickupCodes', 'Pickup Codes')}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative min-w-[200px]">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.pickupAuthorization.search', 'Search...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <select
                value={filterChild}
                onChange={(e) => setFilterChild(e.target.value)}
                className={inputClass}
                style={{ width: 'auto' }}
              >
                <option value="all">{t('tools.pickupAuthorization.allChildren', 'All Children')}</option>
                {uniqueChildren.map(child => (
                  <option key={child} value={child}>{child}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={inputClass}
                style={{ width: 'auto' }}
              >
                <option value="all">{t('tools.pickupAuthorization.allStatus', 'All Status')}</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Authorized Persons Tab */}
        {activeTab === 'authorized' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
            {filteredPersons.length === 0 ? (
              <div className="p-12 text-center">
                <Users className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pickupAuthorization.noAuthorizedPersonsFound', 'No Authorized Persons Found')}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.pickupAuthorization.addAuthorizedPersonsToManage', 'Add authorized persons to manage child pickups.')}
                </p>
                <button
                  onClick={() => setShowPersonModal(true)}
                  className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.pickupAuthorization.addFirstPerson', 'Add First Person')}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPersons.map((person) => (
                  <div key={person.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          person.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' :
                          person.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <UserCheck className={`w-6 h-6 ${
                            person.status === 'active' ? 'text-green-600' :
                            person.status === 'pending' ? 'text-yellow-600' :
                            'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {person.name}
                            </h3>
                            {person.isPrimary && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {t('tools.pickupAuthorization.primary', 'Primary')}
                              </span>
                            )}
                            {person.isEmergencyOnly && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                {t('tools.pickupAuthorization.emergencyOnly', 'Emergency Only')}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(person.status)}`}>
                              {STATUS_OPTIONS.find(s => s.value === person.status)?.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Baby className="w-3 h-3 inline mr-1" />
                              {person.childName}
                            </span>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {person.relationship}
                            </span>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Phone className="w-3 h-3 inline mr-1" />
                              {person.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {person.status === 'pending' && (
                          <button
                            onClick={() => verifyPerson(person.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                          >
                            <CheckCircle className="w-3 h-3" />
                            {t('tools.pickupAuthorization.verify', 'Verify')}
                          </button>
                        )}
                        {person.status === 'active' && (
                          <button
                            onClick={() => suspendPerson(person.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50"
                          >
                            <XCircle className="w-3 h-3" />
                            {t('tools.pickupAuthorization.suspend', 'Suspend')}
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === person.id ? null : person.id)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          {expandedId === person.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setPersonForm(person);
                            setEditingPerson(person);
                            setShowPersonModal(true);
                          }}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Confirm Deletion',
                              message: 'Are you sure you want to delete this authorization?',
                              confirmText: 'Delete',
                              cancelText: 'Cancel',
                              variant: 'danger',
                            });
                            if (confirmed) {
                              deletePerson(person.id);
                            }
                          }}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === person.id && (
                      <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('tools.pickupAuthorization.contactInformation', 'Contact Information')}
                            </h4>
                            <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <p><Phone className="w-3 h-3 inline mr-2" />{person.phone}</p>
                              {person.email && <p><Mail className="w-3 h-3 inline mr-2" />{person.email}</p>}
                              {person.address && <p>{person.address}</p>}
                            </div>
                          </div>
                          <div>
                            <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('tools.pickupAuthorization.identification', 'Identification')}
                            </h4>
                            <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <p>Type: {ID_TYPES.find(t => t.value === person.idType)?.label}</p>
                              {person.idNumber && <p>ID #: {person.idNumber}</p>}
                              {person.idExpiryDate && <p>Expires: {formatDate(person.idExpiryDate)}</p>}
                            </div>
                          </div>
                          <div>
                            <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('tools.pickupAuthorization.authorizationDetails', 'Authorization Details')}
                            </h4>
                            <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <p>Added: {formatDateTime(person.addedAt)}</p>
                              {person.verifiedAt && <p>Verified: {formatDateTime(person.verifiedAt)}</p>}
                              {person.restrictions && <p className="text-orange-500">Restrictions: {person.restrictions}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pickup Logs Tab */}
        {activeTab === 'pickup-logs' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
            <div className={`p-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pickupAuthorization.pickupLogs2', 'Pickup Logs')}
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={inputClass}
                  style={{ width: 'auto' }}
                />
              </div>
              <button
                onClick={() => setShowLogModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.pickupAuthorization.logPickup2', 'Log Pickup')}
              </button>
            </div>

            {todaysPickups.length === 0 ? (
              <div className="p-12 text-center">
                <History className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  No Pickups for {formatDate(selectedDate)}
                </h3>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {todaysPickups.map((log) => (
                  <div key={log.id} className={`p-4 ${log.flagged ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          log.flagged
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-green-100 dark:bg-green-900/30'
                        }`}>
                          {log.flagged ? (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {log.childName}
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Picked up by {log.authorizedPersonName} ({log.relationship}) at {formatTime(log.pickupTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {log.idChecked && (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                              <Shield className="w-3 h-3" /> ID
                            </span>
                          )}
                          {log.photoMatched && (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                              <Camera className="w-3 h-3" /> Photo
                            </span>
                          )}
                          {log.codeVerified && (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                              <Lock className="w-3 h-3" /> Code
                            </span>
                          )}
                        </div>
                        {log.flagged && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            {log.flagReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pickup Codes Tab */}
        {activeTab === 'codes' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
            <div className={`p-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pickupAuthorization.pickupCodes2', 'Pickup Codes')}
              </h3>
              <button
                onClick={() => setShowCodeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.pickupAuthorization.generateCode', 'Generate Code')}
              </button>
            </div>

            {pickupCodes.length === 0 ? (
              <div className="p-12 text-center">
                <Lock className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pickupAuthorization.noPickupCodes', 'No Pickup Codes')}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.pickupAuthorization.generateTemporaryCodesForAuthorized', 'Generate temporary codes for authorized pickups.')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pickupCodes.map((code) => (
                  <div key={code.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold ${
                          code.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : code.status === 'used'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {code.status === 'active' ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {code.code}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(code.status)}`}>
                              {code.status}
                            </span>
                            {code.singleUse && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                {t('tools.pickupAuthorization.singleUse', 'Single Use')}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {code.childName} | Valid until: {formatDateTime(code.validUntil)}
                          </p>
                        </div>
                      </div>
                      {code.status === 'active' && (
                        <button
                          onClick={() => revokeCode(code.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          <XCircle className="w-3 h-3" />
                          {t('tools.pickupAuthorization.revoke', 'Revoke')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Person Modal */}
        {showPersonModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingPerson ? t('tools.pickupAuthorization.editAuthorizedPerson', 'Edit Authorized Person') : t('tools.pickupAuthorization.addAuthorizedPerson2', 'Add Authorized Person')}
                </h2>
                <button
                  onClick={resetPersonForm}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pickupAuthorization.childName', 'Child Name *')}</label>
                    <input
                      type="text"
                      value={personForm.childName || ''}
                      onChange={(e) => setPersonForm(prev => ({ ...prev, childName: e.target.value }))}
                      className={inputClass}
                      placeholder={t('tools.pickupAuthorization.childSName', 'Child\'s name')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pickupAuthorization.authorizedPersonName', 'Authorized Person Name *')}</label>
                    <input
                      type="text"
                      value={personForm.name || ''}
                      onChange={(e) => setPersonForm(prev => ({ ...prev, name: e.target.value }))}
                      className={inputClass}
                      placeholder={t('tools.pickupAuthorization.fullName', 'Full name')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pickupAuthorization.relationship', 'Relationship')}</label>
                    <select
                      value={personForm.relationship || 'Mother'}
                      onChange={(e) => setPersonForm(prev => ({ ...prev, relationship: e.target.value }))}
                      className={inputClass}
                    >
                      {RELATIONSHIPS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pickupAuthorization.phoneNumber', 'Phone Number *')}</label>
                    <input
                      type="tel"
                      value={personForm.phone || ''}
                      onChange={(e) => setPersonForm(prev => ({ ...prev, phone: e.target.value }))}
                      className={inputClass}
                      placeholder={t('tools.pickupAuthorization.phoneNumber2', 'Phone number')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pickupAuthorization.email', 'Email')}</label>
                    <input
                      type="email"
                      value={personForm.email || ''}
                      onChange={(e) => setPersonForm(prev => ({ ...prev, email: e.target.value }))}
                      className={inputClass}
                      placeholder={t('tools.pickupAuthorization.emailAddress', 'Email address')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pickupAuthorization.idType', 'ID Type')}</label>
                    <select
                      value={personForm.idType || 'drivers-license'}
                      onChange={(e) => setPersonForm(prev => ({ ...prev, idType: e.target.value as any }))}
                      className={inputClass}
                    >
                      {ID_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.pickupAuthorization.idNumber', 'ID Number')}</label>
                    <input
                      type="text"
                      value={personForm.idNumber || ''}
                      onChange={(e) => setPersonForm(prev => ({ ...prev, idNumber: e.target.value }))}
                      className={inputClass}
                      placeholder={t('tools.pickupAuthorization.idNumberOptional', 'ID number (optional)')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.pickupAuthorization.idExpiryDate', 'ID Expiry Date')}</label>
                    <input
                      type="date"
                      value={personForm.idExpiryDate || ''}
                      onChange={(e) => setPersonForm(prev => ({ ...prev, idExpiryDate: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={personForm.isPrimary || false}
                      onChange={(e) => setPersonForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.pickupAuthorization.primaryPickup', 'Primary Pickup')}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={personForm.isEmergencyOnly || false}
                      onChange={(e) => setPersonForm(prev => ({ ...prev, isEmergencyOnly: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.pickupAuthorization.emergencyOnly2', 'Emergency Only')}
                    </span>
                  </label>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.pickupAuthorization.restrictions', 'Restrictions')}</label>
                  <textarea
                    value={personForm.restrictions || ''}
                    onChange={(e) => setPersonForm(prev => ({ ...prev, restrictions: e.target.value }))}
                    rows={2}
                    className={inputClass}
                    placeholder={t('tools.pickupAuthorization.anyPickupRestrictionsEG', 'Any pickup restrictions (e.g., weekdays only)...')}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t('tools.pickupAuthorization.notes', 'Notes')}</label>
                  <textarea
                    value={personForm.notes || ''}
                    onChange={(e) => setPersonForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className={inputClass}
                    placeholder={t('tools.pickupAuthorization.additionalNotes', 'Additional notes...')}
                  />
                </div>
              </div>

              <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={resetPersonForm}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.pickupAuthorization.cancel', 'Cancel')}
                </button>
                <button
                  onClick={savePerson}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingPerson ? t('tools.pickupAuthorization.update', 'Update') : t('tools.pickupAuthorization.add', 'Add')} Person
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Code Modal */}
        {showCodeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`flex items-center justify-between p-4 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pickupAuthorization.generatePickupCode', 'Generate Pickup Code')}
                </h2>
                <button
                  onClick={resetCodeForm}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.pickupAuthorization.childName2', 'Child Name *')}</label>
                  <select
                    value={codeForm.childName || ''}
                    onChange={(e) => setCodeForm(prev => ({ ...prev, childName: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">{t('tools.pickupAuthorization.selectChild', 'Select child')}</option>
                    {uniqueChildren.map(child => (
                      <option key={child} value={child}>{child}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.pickupAuthorization.validUntil', 'Valid Until')}</label>
                  <input
                    type="datetime-local"
                    value={codeForm.validUntil || ''}
                    onChange={(e) => setCodeForm(prev => ({ ...prev, validUntil: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={codeForm.singleUse ?? true}
                    onChange={(e) => setCodeForm(prev => ({ ...prev, singleUse: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pickupAuthorization.singleUseOnly', 'Single Use Only')}
                  </span>
                </label>

                <div>
                  <label className={labelClass}>{t('tools.pickupAuthorization.notes2', 'Notes')}</label>
                  <textarea
                    value={codeForm.notes || ''}
                    onChange={(e) => setCodeForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className={inputClass}
                    placeholder={t('tools.pickupAuthorization.eGForGrandmotherS', 'e.g., For grandmother\'s pickup on Friday')}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-3 p-4 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={resetCodeForm}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.pickupAuthorization.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={generateCode}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  {t('tools.pickupAuthorization.generateCode2', 'Generate Code')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Log Pickup Modal */}
        {showLogModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`flex items-center justify-between p-4 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pickupAuthorization.logPickup3', 'Log Pickup')}
                </h2>
                <button
                  onClick={resetLogForm}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.pickupAuthorization.child', 'Child *')}</label>
                  <select
                    value={logForm.childName || ''}
                    onChange={(e) => setLogForm(prev => ({ ...prev, childName: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">{t('tools.pickupAuthorization.selectChild2', 'Select child')}</option>
                    {uniqueChildren.map(child => (
                      <option key={child} value={child}>{child}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.pickupAuthorization.pickedUpBy', 'Picked Up By *')}</label>
                  <select
                    value={logForm.authorizedPersonId || ''}
                    onChange={(e) => setLogForm(prev => ({ ...prev, authorizedPersonId: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">{t('tools.pickupAuthorization.selectPerson', 'Select person')}</option>
                    {authorizedPersons
                      .filter(p => p.status === 'active' && (!logForm.childName || p.childName === logForm.childName))
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={logForm.idChecked || false}
                      onChange={(e) => setLogForm(prev => ({ ...prev, idChecked: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.pickupAuthorization.idChecked', 'ID Checked')}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={logForm.photoMatched || false}
                      onChange={(e) => setLogForm(prev => ({ ...prev, photoMatched: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.pickupAuthorization.photoMatched', 'Photo Matched')}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={logForm.codeVerified || false}
                      onChange={(e) => setLogForm(prev => ({ ...prev, codeVerified: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.pickupAuthorization.codeVerified', 'Code Verified')}
                    </span>
                  </label>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={logForm.flagged || false}
                    onChange={(e) => setLogForm(prev => ({ ...prev, flagged: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className={`text-sm text-red-500 font-medium`}>
                    {t('tools.pickupAuthorization.flagThisPickup', 'Flag This Pickup')}
                  </span>
                </label>

                {logForm.flagged && (
                  <div>
                    <label className={labelClass}>{t('tools.pickupAuthorization.flagReason', 'Flag Reason')}</label>
                    <input
                      type="text"
                      value={logForm.flagReason || ''}
                      onChange={(e) => setLogForm(prev => ({ ...prev, flagReason: e.target.value }))}
                      className={inputClass}
                      placeholder={t('tools.pickupAuthorization.reasonForFlagging', 'Reason for flagging')}
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>{t('tools.pickupAuthorization.notes3', 'Notes')}</label>
                  <textarea
                    value={logForm.notes || ''}
                    onChange={(e) => setLogForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className={inputClass}
                    placeholder={t('tools.pickupAuthorization.additionalNotes2', 'Additional notes...')}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-3 p-4 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={resetLogForm}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.pickupAuthorization.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={logPickup}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('tools.pickupAuthorization.logPickup4', 'Log Pickup')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{validationMessage}</span>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default PickupAuthorizationTool;
