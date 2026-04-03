'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  Mail,
  Phone,
  Shield,
  Activity,
  Clock,
  MessageSquare,
  UserPlus,
  Bell,
  Settings,
  Eye,
  Check,
  AlertCircle,
  Lock,
  Unlock,
  Send,
  Archive,
  Users,
  ChevronDown,
  ChevronRight,
  RefreshCw,
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
interface ProxyAccess {
  id: string;
  proxyName: string;
  relationship: string;
  email: string;
  accessLevel: 'full' | 'limited' | 'view-only';
  grantedDate: string;
  expirationDate?: string;
  status: 'active' | 'expired' | 'revoked';
}

interface PortalPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  labResultsNotification: boolean;
  messageAlerts: boolean;
  preferredLanguage: string;
}

interface PortalMessage {
  id: string;
  subject: string;
  messageType: 'general' | 'appointment' | 'prescription' | 'lab-results' | 'billing';
  fromPatient: boolean;
  senderName: string;
  recipientName: string;
  sentDate: string;
  readDate?: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'normal' | 'urgent';
  content: string;
}

interface AccessRequest {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  requestDate: string;
  verificationType: 'email' | 'in-person' | 'phone';
  verifiedBy?: string;
  status: 'pending' | 'approved' | 'denied';
  notes: string;
}

interface PortalAccount {
  id: string;
  patientId: string;
  patientName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  accountCreated: string;
  lastLogin?: string;
  loginCount: number;
  status: 'active' | 'pending' | 'locked' | 'deactivated';
  proxyAccess: ProxyAccess[];
  preferences: PortalPreferences;
  messages: PortalMessage[];
}

interface PatientPortalToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'patient-portal';

const accountColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'lastLogin', header: 'Last Login', type: 'date' },
  { key: 'loginCount', header: 'Login Count', type: 'number' },
  { key: 'accountCreated', header: 'Created', type: 'date' },
];

const createDefaultPreferences = (): PortalPreferences => ({
  emailNotifications: true,
  smsNotifications: false,
  appointmentReminders: true,
  labResultsNotification: true,
  messageAlerts: true,
  preferredLanguage: 'English',
});

const createNewAccount = (): PortalAccount => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  accountCreated: new Date().toISOString(),
  lastLogin: undefined,
  loginCount: 0,
  status: 'pending',
  proxyAccess: [],
  preferences: createDefaultPreferences(),
  messages: [],
});

const createNewAccessRequest = (): AccessRequest => ({
  id: crypto.randomUUID(),
  patientName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  requestDate: new Date().toISOString(),
  verificationType: 'email',
  verifiedBy: undefined,
  status: 'pending',
  notes: '',
});

const createNewProxyAccess = (): ProxyAccess => ({
  id: crypto.randomUUID(),
  proxyName: '',
  relationship: '',
  email: '',
  accessLevel: 'view-only',
  grantedDate: new Date().toISOString().split('T')[0],
  expirationDate: undefined,
  status: 'active',
});

const createNewMessage = (): Omit<PortalMessage, 'id'> => ({
  subject: '',
  messageType: 'general',
  fromPatient: false,
  senderName: 'Medical Staff',
  recipientName: '',
  sentDate: new Date().toISOString(),
  readDate: undefined,
  status: 'unread',
  priority: 'normal',
  content: '',
});

const messageTypes = [
  { value: 'general', label: 'General Inquiry', icon: MessageSquare },
  { value: 'appointment', label: 'Appointment', icon: Calendar },
  { value: 'prescription', label: 'Prescription', icon: Shield },
  { value: 'lab-results', label: 'Lab Results', icon: Activity },
  { value: 'billing', label: 'Billing', icon: Mail },
];

const relationships = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Guardian', 'Caregiver', 'Other'
];

const languages = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Vietnamese', 'Arabic', 'Portuguese'
];

type TabType = 'accounts' | 'requests' | 'messages';

export const PatientPortalTool: React.FC<PatientPortalToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: accounts,
    addItem: addAccount,
    updateItem: updateAccount,
    deleteItem: deleteAccount,
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
  } = useToolData<PortalAccount>(TOOL_ID, [], accountColumns);

  // Local state for access requests (separate storage)
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMessageType, setFilterMessageType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showProxyModal, setShowProxyModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PortalAccount | null>(null);
  const [editingAccount, setEditingAccount] = useState<PortalAccount | null>(null);
  const [formData, setFormData] = useState<PortalAccount>(createNewAccount());
  const [proxyFormData, setProxyFormData] = useState<ProxyAccess>(createNewProxyAccess());
  const [messageFormData, setMessageFormData] = useState<Omit<PortalMessage, 'id'>>(createNewMessage());
  const [requestFormData, setRequestFormData] = useState<AccessRequest>(createNewAccessRequest());
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Statistics
  const stats = useMemo(() => {
    const active = accounts.filter(a => a.status === 'active').length;
    const pending = accounts.filter(a => a.status === 'pending').length;
    const locked = accounts.filter(a => a.status === 'locked').length;
    const pendingRequests = accessRequests.filter(r => r.status === 'pending').length;

    let totalMessages = 0;
    let unreadMessages = 0;
    accounts.forEach(acc => {
      totalMessages += acc.messages.length;
      unreadMessages += acc.messages.filter(m => m.status === 'unread').length;
    });

    return {
      total: accounts.length,
      active,
      pending,
      locked,
      pendingRequests,
      totalMessages,
      unreadMessages,
    };
  }, [accounts, accessRequests]);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = searchQuery === '' ||
        account.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.patientId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || account.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [accounts, searchQuery, filterStatus]);

  // All messages across accounts
  const allMessages = useMemo(() => {
    const messages: (PortalMessage & { accountId: string; patientName: string })[] = [];
    accounts.forEach(acc => {
      acc.messages.forEach(msg => {
        messages.push({ ...msg, accountId: acc.id, patientName: acc.patientName });
      });
    });
    return messages.sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
  }, [accounts]);

  // Filtered messages
  const filteredMessages = useMemo(() => {
    return allMessages.filter(msg => {
      const matchesSearch = searchQuery === '' ||
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.patientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterMessageType === '' || msg.messageType === filterMessageType;
      return matchesSearch && matchesType;
    });
  }, [allMessages, searchQuery, filterMessageType]);

  // Filtered access requests
  const filteredRequests = useMemo(() => {
    return accessRequests.filter(req => {
      const matchesSearch = searchQuery === '' ||
        req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || req.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [accessRequests, searchQuery, filterStatus]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.patientName) errors.patientName = 'Patient name is required';
    if (!formData.email) errors.email = 'Email is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAccount = () => {
    if (!validateForm()) return;
    if (editingAccount) {
      updateAccount(formData.id, formData);
    } else {
      addAccount(formData);
    }
    setShowModal(false);
    setEditingAccount(null);
    setFormData(createNewAccount());
    setFormErrors({});
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Account',
      message: 'Are you sure you want to delete this portal account?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteAccount(id);
      if (selectedAccount?.id === id) setSelectedAccount(null);
    }
  };

  const openEditModal = (account: PortalAccount) => {
    setEditingAccount(account);
    setFormData(account);
    setShowModal(true);
  };

  const toggleAccountStatus = (account: PortalAccount) => {
    const newStatus = account.status === 'active' ? 'locked' :
                      account.status === 'locked' ? 'active' :
                      account.status === 'pending' ? 'active' : 'deactivated';
    updateAccount(account.id, { status: newStatus });
    if (selectedAccount?.id === account.id) {
      setSelectedAccount({ ...account, status: newStatus });
    }
  };

  const addProxyAccess = () => {
    if (selectedAccount && proxyFormData.proxyName && proxyFormData.email) {
      const updated = {
        ...selectedAccount,
        proxyAccess: [...selectedAccount.proxyAccess, proxyFormData],
      };
      updateAccount(selectedAccount.id, updated);
      setSelectedAccount(updated);
      setShowProxyModal(false);
      setProxyFormData(createNewProxyAccess());
    }
  };

  const removeProxyAccess = (proxyId: string) => {
    if (selectedAccount) {
      const updated = {
        ...selectedAccount,
        proxyAccess: selectedAccount.proxyAccess.filter(p => p.id !== proxyId),
      };
      updateAccount(selectedAccount.id, updated);
      setSelectedAccount(updated);
    }
  };

  const sendMessage = () => {
    if (selectedAccount && messageFormData.subject && messageFormData.content) {
      const newMessage: PortalMessage = {
        ...messageFormData,
        id: crypto.randomUUID(),
        recipientName: selectedAccount.patientName,
        sentDate: new Date().toISOString(),
      };
      const updated = {
        ...selectedAccount,
        messages: [...selectedAccount.messages, newMessage],
      };
      updateAccount(selectedAccount.id, updated);
      setSelectedAccount(updated);
      setShowMessageModal(false);
      setMessageFormData(createNewMessage());
    }
  };

  const markMessageAsRead = (accountId: string, messageId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      const updatedMessages = account.messages.map(m =>
        m.id === messageId ? { ...m, status: 'read' as const, readDate: new Date().toISOString() } : m
      );
      updateAccount(accountId, { messages: updatedMessages });
    }
  };

  const archiveMessage = (accountId: string, messageId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      const updatedMessages = account.messages.map(m =>
        m.id === messageId ? { ...m, status: 'archived' as const } : m
      );
      updateAccount(accountId, { messages: updatedMessages });
    }
  };

  const handleAccessRequest = (requestId: string, approved: boolean, verifiedBy: string = '') => {
    const request = accessRequests.find(r => r.id === requestId);
    if (request) {
      if (approved) {
        // Create new account from request
        const newAccount: PortalAccount = {
          id: crypto.randomUUID(),
          patientId: `PAT-${Date.now()}`,
          patientName: request.patientName,
          email: request.email,
          phone: request.phone,
          dateOfBirth: request.dateOfBirth,
          accountCreated: new Date().toISOString(),
          lastLogin: undefined,
          loginCount: 0,
          status: 'active',
          proxyAccess: [],
          preferences: createDefaultPreferences(),
          messages: [],
        };
        addAccount(newAccount);
      }
      setAccessRequests(prev =>
        prev.map(r =>
          r.id === requestId
            ? { ...r, status: approved ? 'approved' : 'denied', verifiedBy }
            : r
        )
      );
    }
  };

  const submitAccessRequest = () => {
    if (requestFormData.patientName && requestFormData.email) {
      setAccessRequests(prev => [...prev, { ...requestFormData, id: crypto.randomUUID() }]);
      setShowRequestModal(false);
      setRequestFormData(createNewAccessRequest());
    }
  };

  const savePreferences = () => {
    if (selectedAccount) {
      updateAccount(selectedAccount.id, { preferences: selectedAccount.preferences });
      setShowPreferencesModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'locked': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'deactivated': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'denied': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'unread': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'read': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'replied': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'archived': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    const typeConfig = messageTypes.find(t => t.value === type);
    return typeConfig?.icon || MessageSquare;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const tabClass = (active: boolean) => `px-4 py-2 rounded-lg font-medium transition-colors ${
    active
      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white'
      : theme === 'dark'
        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <LayoutDashboard className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.patientPortal.patientPortalManager', 'Patient Portal Manager')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.patientPortal.managePatientPortalAccountsAnd', 'Manage patient portal accounts and communications')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="patient-portal" toolName="Patient Portal" />

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
            onExportCSV={() => exportCSV({ filename: 'patient-portal' })}
            onExportExcel={() => exportExcel({ filename: 'patient-portal' })}
            onExportJSON={() => exportJSON({ filename: 'patient-portal' })}
            onExportPDF={() => exportPDF({ filename: 'patient-portal', title: 'Patient Portal Accounts' })}
            onPrint={() => print('Patient Portal Accounts')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={accounts.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button
            onClick={() => { setFormData(createNewAccount()); setShowModal(true); }}
            className={buttonPrimary}
          >
            <Plus className="w-4 h-4" />
            {t('tools.patientPortal.addAccount', 'Add Account')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Users className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientPortal.total', 'Total')}</p>
              <p className="text-xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientPortal.active', 'Active')}</p>
              <p className="text-xl font-bold text-green-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientPortal.pending', 'Pending')}</p>
              <p className="text-xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Lock className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientPortal.locked', 'Locked')}</p>
              <p className="text-xl font-bold text-red-500">{stats.locked}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <UserPlus className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientPortal.requests', 'Requests')}</p>
              <p className="text-xl font-bold text-orange-500">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientPortal.messages', 'Messages')}</p>
              <p className="text-xl font-bold text-blue-500">{stats.totalMessages}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientPortal.unread', 'Unread')}</p>
              <p className="text-xl font-bold text-purple-500">{stats.unreadMessages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('accounts')} className={tabClass(activeTab === 'accounts')}>
          <Users className="w-4 h-4 inline mr-2" />
          {t('tools.patientPortal.accounts', 'Accounts')}
        </button>
        <button onClick={() => setActiveTab('requests')} className={tabClass(activeTab === 'requests')}>
          <UserPlus className="w-4 h-4 inline mr-2" />
          Access Requests
          {stats.pendingRequests > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{stats.pendingRequests}</span>
          )}
        </button>
        <button onClick={() => setActiveTab('messages')} className={tabClass(activeTab === 'messages')}>
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Messages
          {stats.unreadMessages > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-cyan-500 text-white rounded-full">{stats.unreadMessages}</span>
          )}
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
              placeholder={activeTab === 'messages' ? "Search messages..." : "Search accounts..."}
              className={`${inputClass} pl-10`}
            />
          </div>
          {activeTab === 'messages' ? (
            <select
              value={filterMessageType}
              onChange={(e) => setFilterMessageType(e.target.value)}
              className={`${inputClass} w-full sm:w-48`}
            >
              <option value="">{t('tools.patientPortal.allMessageTypes', 'All Message Types')}</option>
              {messageTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          ) : (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`${inputClass} w-full sm:w-40`}
            >
              <option value="">{t('tools.patientPortal.allStatus', 'All Status')}</option>
              {activeTab === 'accounts' ? (
                <>
                  <option value="active">{t('tools.patientPortal.active2', 'Active')}</option>
                  <option value="pending">{t('tools.patientPortal.pending2', 'Pending')}</option>
                  <option value="locked">{t('tools.patientPortal.locked2', 'Locked')}</option>
                  <option value="deactivated">{t('tools.patientPortal.deactivated', 'Deactivated')}</option>
                </>
              ) : (
                <>
                  <option value="pending">{t('tools.patientPortal.pending3', 'Pending')}</option>
                  <option value="approved">{t('tools.patientPortal.approved', 'Approved')}</option>
                  <option value="denied">{t('tools.patientPortal.denied', 'Denied')}</option>
                </>
              )}
            </select>
          )}
          {activeTab === 'requests' && (
            <button
              onClick={() => setShowRequestModal(true)}
              className={buttonSecondary}
            >
              <Plus className="w-4 h-4" />
              {t('tools.patientPortal.newRequest', 'New Request')}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account List */}
          <div className={`${cardClass} lg:col-span-1`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-lg font-semibold">{t('tools.patientPortal.portalAccounts', 'Portal Accounts')}</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.patientPortal.noAccountsFound', 'No accounts found')}</p>
                </div>
              ) : (
                <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredAccounts.map(account => (
                    <div
                      key={account.id}
                      onClick={() => setSelectedAccount(account)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedAccount?.id === account.id
                          ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <User className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div>
                            <p className="font-medium">{account.patientName}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {account.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(account.status)}`}>
                                {account.status}
                              </span>
                              {account.messages.filter(m => m.status === 'unread').length > 0 && (
                                <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded">
                                  {account.messages.filter(m => m.status === 'unread').length} unread
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(account); }}
                            className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(account.id); }}
                            className="p-1.5 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className={`${cardClass} lg:col-span-2`}>
            {selectedAccount ? (
              <div>
                <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">{selectedAccount.patientName}</h2>
                        <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedAccount.status)}`}>
                          {selectedAccount.status}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Patient ID: {selectedAccount.patientId}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAccountStatus(selectedAccount)}
                        className={buttonSecondary}
                      >
                        {selectedAccount.status === 'locked' ? (
                          <><Unlock className="w-4 h-4" /> {t('tools.patientPortal.unlock', 'Unlock')}</>
                        ) : selectedAccount.status === 'active' ? (
                          <><Lock className="w-4 h-4" /> {t('tools.patientPortal.lock', 'Lock')}</>
                        ) : (
                          <><Check className="w-4 h-4" /> {t('tools.patientPortal.activate', 'Activate')}</>
                        )}
                      </button>
                      <button
                        onClick={() => setShowMessageModal(true)}
                        className={buttonPrimary}
                      >
                        <Send className="w-4 h-4" /> Send Message
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Account Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {t('tools.patientPortal.email', 'Email')}</p>
                      <p className="font-medium text-sm truncate">{selectedAccount.email}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {t('tools.patientPortal.phone', 'Phone')}</p>
                      <p className="font-medium text-sm">{selectedAccount.phone || 'N/A'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {t('tools.patientPortal.dob', 'DOB')}</p>
                      <p className="font-medium text-sm">{formatDate(selectedAccount.dateOfBirth)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Activity className="w-3 h-3" /> {t('tools.patientPortal.logins', 'Logins')}</p>
                      <p className="font-medium text-sm">{selectedAccount.loginCount}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.patientPortal.accountCreated', 'Account Created')}</p>
                      <p className="font-medium text-sm">{formatDateTime(selectedAccount.accountCreated)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.patientPortal.lastLogin', 'Last Login')}</p>
                      <p className="font-medium text-sm">{selectedAccount.lastLogin ? formatDateTime(selectedAccount.lastLogin) : 'Never'}</p>
                    </div>
                  </div>

                  {/* Preferences Section */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Settings className="w-4 h-4 text-cyan-500" />
                        {t('tools.patientPortal.portalPreferences', 'Portal Preferences')}
                      </h3>
                      <button
                        onClick={() => setShowPreferencesModal(true)}
                        className={`text-sm ${theme === 'dark' ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}
                      >
                        {t('tools.patientPortal.edit', 'Edit')}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        {selectedAccount.preferences.emailNotifications ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        Email Notifications
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedAccount.preferences.smsNotifications ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        SMS Notifications
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedAccount.preferences.appointmentReminders ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        Appointment Reminders
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedAccount.preferences.labResultsNotification ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        Lab Results
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedAccount.preferences.messageAlerts ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        Message Alerts
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{t('tools.patientPortal.language', 'Language:')}</span>
                        {selectedAccount.preferences.preferredLanguage}
                      </div>
                    </div>
                  </div>

                  {/* Proxy Access Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-500" />
                        Proxy Access ({selectedAccount.proxyAccess.length})
                      </h3>
                      <button
                        onClick={() => setShowProxyModal(true)}
                        className={buttonSecondary}
                      >
                        <Plus className="w-4 h-4" /> Add Proxy
                      </button>
                    </div>
                    {selectedAccount.proxyAccess.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.patientPortal.noProxyAccessGranted', 'No proxy access granted')}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedAccount.proxyAccess.map(proxy => (
                          <div
                            key={proxy.id}
                            className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                          >
                            <div>
                              <p className="font-medium">{proxy.proxyName}</p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {proxy.relationship} - {proxy.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs rounded ${
                                  proxy.accessLevel === 'full' ? 'bg-green-500/20 text-green-400' :
                                  proxy.accessLevel === 'limited' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {proxy.accessLevel}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(proxy.status)}`}>
                                  {proxy.status}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeProxyAccess(proxy.id)}
                              className="p-1.5 hover:bg-red-500/20 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Messages Section */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-cyan-500" />
                      Messages ({selectedAccount.messages.length})
                    </h3>
                    {selectedAccount.messages.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.patientPortal.noMessages2', 'No messages')}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {[...selectedAccount.messages].reverse().slice(0, 5).map(msg => {
                          const TypeIcon = getMessageTypeIcon(msg.messageType);
                          const isExpanded = expandedMessages.has(msg.id);
                          return (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                            >
                              <div
                                className="flex items-start justify-between cursor-pointer"
                                onClick={() => {
                                  const newExpanded = new Set(expandedMessages);
                                  if (isExpanded) {
                                    newExpanded.delete(msg.id);
                                  } else {
                                    newExpanded.add(msg.id);
                                  }
                                  setExpandedMessages(newExpanded);
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  <TypeIcon className={`w-4 h-4 mt-0.5 ${msg.status === 'unread' ? 'text-cyan-500' : 'text-gray-400'}`} />
                                  <div>
                                    <p className={`font-medium ${msg.status === 'unread' ? '' : 'text-gray-400'}`}>
                                      {msg.subject}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {msg.fromPatient ? t('tools.patientPortal.fromPatient', 'From patient') : t('tools.patientPortal.toPatient', 'To patient')} - {formatDateTime(msg.sentDate)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(msg.status)}`}>
                                    {msg.status}
                                  </span>
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-gray-600">
                                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                  <div className="flex gap-2 mt-3">
                                    {msg.status === 'unread' && (
                                      <button
                                        onClick={() => markMessageAsRead(selectedAccount.id, msg.id)}
                                        className="text-xs text-cyan-400 hover:text-cyan-300"
                                      >
                                        {t('tools.patientPortal.markAsRead', 'Mark as Read')}
                                      </button>
                                    )}
                                    {msg.status !== 'archived' && (
                                      <button
                                        onClick={() => archiveMessage(selectedAccount.id, msg.id)}
                                        className="text-xs text-gray-400 hover:text-gray-300"
                                      >
                                        {t('tools.patientPortal.archive', 'Archive')}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <User className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">{t('tools.patientPortal.selectAnAccount', 'Select an account')}</p>
                <p className="text-sm">{t('tools.patientPortal.chooseAnAccountToView', 'Choose an account to view details')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Access Requests Tab */}
      {activeTab === 'requests' && (
        <div className={cardClass}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.patientPortal.accessRequests', 'Access Requests')}</h2>
          </div>
          {filteredRequests.length === 0 ? (
            <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.patientPortal.noAccessRequests', 'No access requests')}</p>
            </div>
          ) : (
            <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredRequests.map(request => (
                <div key={request.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{request.patientName}</p>
                        <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {request.email} | {request.phone}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        DOB: {formatDate(request.dateOfBirth)} | Requested: {formatDateTime(request.requestDate)}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Verification: {request.verificationType}
                        {request.verifiedBy && ` - Verified by: ${request.verifiedBy}`}
                      </p>
                      {request.notes && (
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Notes: {request.notes}
                        </p>
                      )}
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccessRequest(request.id, true, 'Admin')}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleAccessRequest(request.id, false, 'Admin')}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm flex items-center gap-1"
                        >
                          <X className="w-4 h-4" /> Deny
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className={cardClass}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.patientPortal.allMessages', 'All Messages')}</h2>
          </div>
          {filteredMessages.length === 0 ? (
            <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.patientPortal.noMessages', 'No messages')}</p>
            </div>
          ) : (
            <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredMessages.map(msg => {
                const TypeIcon = getMessageTypeIcon(msg.messageType);
                const isExpanded = expandedMessages.has(msg.id);
                return (
                  <div key={msg.id} className="p-4">
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => {
                        const newExpanded = new Set(expandedMessages);
                        if (isExpanded) {
                          newExpanded.delete(msg.id);
                        } else {
                          newExpanded.add(msg.id);
                        }
                        setExpandedMessages(newExpanded);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <TypeIcon className={`w-4 h-4 ${msg.status === 'unread' ? 'text-cyan-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className={`font-medium ${msg.status === 'unread' ? '' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {msg.subject}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {msg.patientName} - {msg.fromPatient ? t('tools.patientPortal.fromPatient2', 'From patient') : t('tools.patientPortal.toPatient2', 'To patient')}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatDateTime(msg.sentDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {msg.priority === 'urgent' && (
                          <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">{t('tools.patientPortal.urgent', 'Urgent')}</span>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(msg.status)}`}>
                          {msg.status}
                        </span>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <div className="flex gap-2 mt-3">
                          {msg.status === 'unread' && (
                            <button
                              onClick={() => markMessageAsRead(msg.accountId, msg.id)}
                              className="text-xs text-cyan-400 hover:text-cyan-300"
                            >
                              {t('tools.patientPortal.markAsRead2', 'Mark as Read')}
                            </button>
                          )}
                          {msg.status !== 'archived' && (
                            <button
                              onClick={() => archiveMessage(msg.accountId, msg.id)}
                              className="text-xs text-gray-400 hover:text-gray-300"
                            >
                              {t('tools.patientPortal.archive2', 'Archive')}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingAccount ? t('tools.patientPortal.editAccount', 'Edit Account') : t('tools.patientPortal.addAccount2', 'Add Account')}</h2>
              <button onClick={() => { setShowModal(false); setEditingAccount(null); setFormErrors({}); }} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientPortal.patientName', 'Patient Name *')}</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => { setFormData({ ...formData, patientName: e.target.value }); setFormErrors(prev => ({ ...prev, patientName: '' })); }}
                    className={`${inputClass} ${formErrors.patientName ? 'border-red-500' : ''}`}
                    placeholder={t('tools.patientPortal.fullName', 'Full name')}
                  />
                  {formErrors.patientName && <p className="text-red-500 text-xs mt-1">{formErrors.patientName}</p>}
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientPortal.patientId', 'Patient ID')}</label>
                  <input
                    type="text"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.patientPortal.pat001', 'PAT-001')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientPortal.email2', 'Email *')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFormErrors(prev => ({ ...prev, email: '' })); }}
                    className={`${inputClass} ${formErrors.email ? 'border-red-500' : ''}`}
                    placeholder={t('tools.patientPortal.patientEmailCom', 'patient@email.com')}
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientPortal.phone2', 'Phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientPortal.dateOfBirth', 'Date of Birth')}</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientPortal.status', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="pending">{t('tools.patientPortal.pending4', 'Pending')}</option>
                    <option value="active">{t('tools.patientPortal.active3', 'Active')}</option>
                    <option value="locked">{t('tools.patientPortal.locked3', 'Locked')}</option>
                    <option value="deactivated">{t('tools.patientPortal.deactivated2', 'Deactivated')}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingAccount(null); setFormErrors({}); }}
                  className={buttonSecondary}
                >
                  {t('tools.patientPortal.cancel5', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAccount}
                  className={buttonPrimary}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Proxy Modal */}
      {showProxyModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.patientPortal.addProxyAccess', 'Add Proxy Access')}</h2>
              <button onClick={() => setShowProxyModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.patientPortal.proxyName', 'Proxy Name *')}</label>
                <input
                  type="text"
                  value={proxyFormData.proxyName}
                  onChange={(e) => setProxyFormData({ ...proxyFormData, proxyName: e.target.value })}
                  className={inputClass}
                  placeholder={t('tools.patientPortal.fullName2', 'Full name')}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientPortal.relationship', 'Relationship *')}</label>
                <select
                  value={proxyFormData.relationship}
                  onChange={(e) => setProxyFormData({ ...proxyFormData, relationship: e.target.value })}
                  className={inputClass}
                >
                  <option value="">{t('tools.patientPortal.selectRelationship', 'Select relationship')}</option>
                  {relationships.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientPortal.email3', 'Email *')}</label>
                <input
                  type="email"
                  value={proxyFormData.email}
                  onChange={(e) => setProxyFormData({ ...proxyFormData, email: e.target.value })}
                  className={inputClass}
                  placeholder={t('tools.patientPortal.proxyEmailCom', 'proxy@email.com')}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientPortal.accessLevel', 'Access Level')}</label>
                <select
                  value={proxyFormData.accessLevel}
                  onChange={(e) => setProxyFormData({ ...proxyFormData, accessLevel: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="view-only">{t('tools.patientPortal.viewOnly', 'View Only')}</option>
                  <option value="limited">{t('tools.patientPortal.limited', 'Limited')}</option>
                  <option value="full">{t('tools.patientPortal.fullAccess', 'Full Access')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientPortal.expirationDateOptional', 'Expiration Date (Optional)')}</label>
                <input
                  type="date"
                  value={proxyFormData.expirationDate || ''}
                  onChange={(e) => setProxyFormData({ ...proxyFormData, expirationDate: e.target.value || undefined })}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => setShowProxyModal(false)} className={buttonSecondary}>{t('tools.patientPortal.cancel', 'Cancel')}</button>
                <button
                  onClick={addProxyAccess}
                  disabled={!proxyFormData.proxyName || !proxyFormData.email || !proxyFormData.relationship}
                  className={buttonPrimary}
                >
                  <Plus className="w-4 h-4" /> Add Proxy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">Send Message to {selectedAccount.patientName}</h2>
              <button onClick={() => setShowMessageModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.patientPortal.subject', 'Subject *')}</label>
                <input
                  type="text"
                  value={messageFormData.subject}
                  onChange={(e) => setMessageFormData({ ...messageFormData, subject: e.target.value })}
                  className={inputClass}
                  placeholder={t('tools.patientPortal.messageSubject', 'Message subject')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.patientPortal.messageType', 'Message Type')}</label>
                  <select
                    value={messageFormData.messageType}
                    onChange={(e) => setMessageFormData({ ...messageFormData, messageType: e.target.value as any })}
                    className={inputClass}
                  >
                    {messageTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.patientPortal.priority', 'Priority')}</label>
                  <select
                    value={messageFormData.priority}
                    onChange={(e) => setMessageFormData({ ...messageFormData, priority: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="normal">{t('tools.patientPortal.normal', 'Normal')}</option>
                    <option value="urgent">{t('tools.patientPortal.urgent2', 'Urgent')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientPortal.message', 'Message *')}</label>
                <textarea
                  value={messageFormData.content}
                  onChange={(e) => setMessageFormData({ ...messageFormData, content: e.target.value })}
                  className={inputClass}
                  rows={5}
                  placeholder={t('tools.patientPortal.enterYourMessage', 'Enter your message...')}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => setShowMessageModal(false)} className={buttonSecondary}>{t('tools.patientPortal.cancel2', 'Cancel')}</button>
                <button
                  onClick={sendMessage}
                  disabled={!messageFormData.subject || !messageFormData.content}
                  className={buttonPrimary}
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Access Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.patientPortal.newAccessRequest', 'New Access Request')}</h2>
              <button onClick={() => setShowRequestModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.patientPortal.patientName2', 'Patient Name *')}</label>
                <input
                  type="text"
                  value={requestFormData.patientName}
                  onChange={(e) => setRequestFormData({ ...requestFormData, patientName: e.target.value })}
                  className={inputClass}
                  placeholder={t('tools.patientPortal.fullName3', 'Full name')}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientPortal.email4', 'Email *')}</label>
                <input
                  type="email"
                  value={requestFormData.email}
                  onChange={(e) => setRequestFormData({ ...requestFormData, email: e.target.value })}
                  className={inputClass}
                  placeholder={t('tools.patientPortal.patientEmailCom2', 'patient@email.com')}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientPortal.phone3', 'Phone')}</label>
                <input
                  type="tel"
                  value={requestFormData.phone}
                  onChange={(e) => setRequestFormData({ ...requestFormData, phone: e.target.value })}
                  className={inputClass}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientPortal.dateOfBirth2', 'Date of Birth')}</label>
                <input
                  type="date"
                  value={requestFormData.dateOfBirth}
                  onChange={(e) => setRequestFormData({ ...requestFormData, dateOfBirth: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientPortal.verificationType', 'Verification Type')}</label>
                <select
                  value={requestFormData.verificationType}
                  onChange={(e) => setRequestFormData({ ...requestFormData, verificationType: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="email">{t('tools.patientPortal.emailVerification', 'Email Verification')}</option>
                  <option value="phone">{t('tools.patientPortal.phoneVerification', 'Phone Verification')}</option>
                  <option value="in-person">{t('tools.patientPortal.inPersonVerification', 'In-Person Verification')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientPortal.notes', 'Notes')}</label>
                <textarea
                  value={requestFormData.notes}
                  onChange={(e) => setRequestFormData({ ...requestFormData, notes: e.target.value })}
                  className={inputClass}
                  rows={3}
                  placeholder={t('tools.patientPortal.additionalNotes', 'Additional notes...')}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => setShowRequestModal(false)} className={buttonSecondary}>{t('tools.patientPortal.cancel3', 'Cancel')}</button>
                <button
                  onClick={submitAccessRequest}
                  disabled={!requestFormData.patientName || !requestFormData.email}
                  className={buttonPrimary}
                >
                  <Plus className="w-4 h-4" /> Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferencesModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.patientPortal.editPreferences', 'Edit Preferences')}</h2>
              <button onClick={() => setShowPreferencesModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAccount.preferences.emailNotifications}
                    onChange={(e) => setSelectedAccount({
                      ...selectedAccount,
                      preferences: { ...selectedAccount.preferences, emailNotifications: e.target.checked }
                    })}
                    className="w-4 h-4 rounded"
                  />
                  <span>{t('tools.patientPortal.emailNotifications', 'Email Notifications')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAccount.preferences.smsNotifications}
                    onChange={(e) => setSelectedAccount({
                      ...selectedAccount,
                      preferences: { ...selectedAccount.preferences, smsNotifications: e.target.checked }
                    })}
                    className="w-4 h-4 rounded"
                  />
                  <span>{t('tools.patientPortal.smsNotifications', 'SMS Notifications')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAccount.preferences.appointmentReminders}
                    onChange={(e) => setSelectedAccount({
                      ...selectedAccount,
                      preferences: { ...selectedAccount.preferences, appointmentReminders: e.target.checked }
                    })}
                    className="w-4 h-4 rounded"
                  />
                  <span>{t('tools.patientPortal.appointmentReminders', 'Appointment Reminders')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAccount.preferences.labResultsNotification}
                    onChange={(e) => setSelectedAccount({
                      ...selectedAccount,
                      preferences: { ...selectedAccount.preferences, labResultsNotification: e.target.checked }
                    })}
                    className="w-4 h-4 rounded"
                  />
                  <span>{t('tools.patientPortal.labResultsNotifications', 'Lab Results Notifications')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAccount.preferences.messageAlerts}
                    onChange={(e) => setSelectedAccount({
                      ...selectedAccount,
                      preferences: { ...selectedAccount.preferences, messageAlerts: e.target.checked }
                    })}
                    className="w-4 h-4 rounded"
                  />
                  <span>{t('tools.patientPortal.messageAlerts', 'Message Alerts')}</span>
                </label>
              </div>
              <div>
                <label className={labelClass}>{t('tools.patientPortal.preferredLanguage', 'Preferred Language')}</label>
                <select
                  value={selectedAccount.preferences.preferredLanguage}
                  onChange={(e) => setSelectedAccount({
                    ...selectedAccount,
                    preferences: { ...selectedAccount.preferences, preferredLanguage: e.target.value }
                  })}
                  className={inputClass}
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => setShowPreferencesModal(false)} className={buttonSecondary}>{t('tools.patientPortal.cancel4', 'Cancel')}</button>
                <button onClick={savePreferences} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.patientPortal.aboutPatientPortalManager', 'About Patient Portal Manager')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage patient portal accounts, process access requests, track messages, and configure notification preferences.
          Grant proxy access to family members or caregivers, monitor login activity, and maintain secure patient communications.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default PatientPortalTool;
