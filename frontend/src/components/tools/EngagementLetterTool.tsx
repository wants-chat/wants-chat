'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Download,
  Edit,
  Calendar,
  DollarSign,
  User,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Send,
  Eye,
  Copy,
  X,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
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

interface EngagementLetterToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

interface EngagementLetter {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  engagementType: 'consulting' | 'audit' | 'tax' | 'advisory' | 'implementation' | 'custom';
  title: string;
  scope: string;
  objectives: string[];
  deliverables: string[];
  startDate: string;
  endDate: string;
  estimatedHours: number;
  hourlyRate: number;
  fixedFee: number;
  feeType: 'hourly' | 'fixed' | 'hybrid';
  paymentTerms: string;
  retainerAmount: number;
  terms: string[];
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  sentDate: string | null;
  acceptedDate: string | null;
  signedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// Constants
const ENGAGEMENT_TYPES = [
  { value: 'consulting', label: 'Management Consulting' },
  { value: 'audit', label: 'Audit & Assurance' },
  { value: 'tax', label: 'Tax Services' },
  { value: 'advisory', label: 'Financial Advisory' },
  { value: 'implementation', label: 'System Implementation' },
  { value: 'custom', label: 'Custom Engagement' },
];

const STATUS_COLORS = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: Edit },
  sent: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Send },
  accepted: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
  declined: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: X },
  expired: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: AlertCircle },
};

const DEFAULT_TERMS = [
  'All work will be performed in accordance with applicable professional standards.',
  'Client agrees to provide timely access to necessary information and personnel.',
  'This engagement letter supersedes any prior agreements or understandings.',
  'Either party may terminate this agreement with 30 days written notice.',
  'Confidential information will be protected in accordance with professional ethics.',
];

const STORAGE_KEY = 'engagement-letter-tool-data';

// Column configuration for exports
const LETTER_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'companyName', header: 'Company', type: 'string' },
  { key: 'engagementType', header: 'Type', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'totalFee', header: 'Total Fee', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Contact Name', type: 'string' },
  { key: 'company', header: 'Company', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
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
export const EngagementLetterTool: React.FC<EngagementLetterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: letters,
    addItem: addLetterToBackend,
    updateItem: updateLetterBackend,
    deleteItem: deleteLetterBackend,
    isSynced: lettersSynced,
    isSaving: lettersSaving,
    lastSaved: lettersLastSaved,
    syncError: lettersSyncError,
    forceSync: forceLettersSync,
  } = useToolData<EngagementLetter>('engagement-letters', [], LETTER_COLUMNS);

  const {
    data: clients,
    addItem: addClientToBackend,
    updateItem: updateClientBackend,
    deleteItem: deleteClientBackend,
  } = useToolData<Client>('engagement-clients', [], CLIENT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'letters' | 'clients' | 'templates'>('letters');
  const [showLetterForm, setShowLetterForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<EngagementLetter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [previewMode, setPreviewMode] = useState(false);

  // New letter form state
  const [newLetter, setNewLetter] = useState<Partial<EngagementLetter>>({
    clientId: '',
    engagementType: 'consulting',
    title: '',
    scope: '',
    objectives: [''],
    deliverables: [''],
    startDate: '',
    endDate: '',
    estimatedHours: 0,
    hourlyRate: 0,
    fixedFee: 0,
    feeType: 'hourly',
    paymentTerms: 'Net 30',
    retainerAmount: 0,
    terms: [...DEFAULT_TERMS],
    status: 'draft',
  });

  // New client form state
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.client || params.company) {
        setNewClient({
          ...newClient,
          name: params.client || '',
          company: params.company || '',
          email: params.email || '',
          phone: params.phone || '',
        });
        setShowClientForm(true);
        setIsPrefilled(true);
      }
      if (params.engagementType) {
        setNewLetter({
          ...newLetter,
          engagementType: params.engagementType,
          title: params.title || '',
        });
      }
    }
  }, [uiConfig?.params]);

  // Add new letter
  const addLetter = () => {
    if (!newLetter.clientId || !newLetter.title) {
      setValidationMessage('Please select a client and enter a title');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const client = clients.find((c) => c.id === newLetter.clientId);
    const letter: EngagementLetter = {
      id: generateId(),
      clientId: newLetter.clientId || '',
      clientName: client?.name || '',
      companyName: client?.company || '',
      engagementType: newLetter.engagementType || 'consulting',
      title: newLetter.title || '',
      scope: newLetter.scope || '',
      objectives: (newLetter.objectives || []).filter((o) => o.trim()),
      deliverables: (newLetter.deliverables || []).filter((d) => d.trim()),
      startDate: newLetter.startDate || '',
      endDate: newLetter.endDate || '',
      estimatedHours: newLetter.estimatedHours || 0,
      hourlyRate: newLetter.hourlyRate || 0,
      fixedFee: newLetter.fixedFee || 0,
      feeType: newLetter.feeType || 'hourly',
      paymentTerms: newLetter.paymentTerms || 'Net 30',
      retainerAmount: newLetter.retainerAmount || 0,
      terms: newLetter.terms || DEFAULT_TERMS,
      status: 'draft',
      sentDate: null,
      acceptedDate: null,
      signedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addLetterToBackend(letter);
    setShowLetterForm(false);
    resetLetterForm();
  };

  // Reset letter form
  const resetLetterForm = () => {
    setNewLetter({
      clientId: '',
      engagementType: 'consulting',
      title: '',
      scope: '',
      objectives: [''],
      deliverables: [''],
      startDate: '',
      endDate: '',
      estimatedHours: 0,
      hourlyRate: 0,
      fixedFee: 0,
      feeType: 'hourly',
      paymentTerms: 'Net 30',
      retainerAmount: 0,
      terms: [...DEFAULT_TERMS],
      status: 'draft',
    });
  };

  // Add new client
  const addClient = () => {
    if (!newClient.name || !newClient.company) {
      setValidationMessage('Please enter client name and company');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const client: Client = {
      id: generateId(),
      name: newClient.name || '',
      company: newClient.company || '',
      email: newClient.email || '',
      phone: newClient.phone || '',
      address: newClient.address || '',
    };

    addClientToBackend(client);
    setShowClientForm(false);
    setNewClient({ name: '', company: '', email: '', phone: '', address: '' });
  };

  // Delete letter
  const deleteLetter = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Engagement Letter',
      message: 'Are you sure you want to delete this engagement letter?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteLetterBackend(id);
    }
  };

  // Delete client
  const deleteClient = async (id: string) => {
    const hasLetters = letters.some((l) => l.clientId === id);
    if (hasLetters) {
      setValidationMessage('Cannot delete client with existing engagement letters');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    const confirmed = await confirm({
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteClientBackend(id);
    }
  };

  // Update letter status
  const updateLetterStatus = (letterId: string, status: EngagementLetter['status']) => {
    const updates: Partial<EngagementLetter> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (status === 'sent') {
      updates.sentDate = new Date().toISOString();
    }
    if (status === 'accepted') {
      updates.acceptedDate = new Date().toISOString();
    }
    updateLetterBackend(letterId, updates);
  };

  // Calculate total fee
  const calculateTotalFee = (letter: EngagementLetter) => {
    if (letter.feeType === 'fixed') {
      return letter.fixedFee;
    } else if (letter.feeType === 'hourly') {
      return letter.estimatedHours * letter.hourlyRate;
    } else {
      return letter.fixedFee + letter.estimatedHours * letter.hourlyRate;
    }
  };

  // Filtered letters
  const filteredLetters = useMemo(() => {
    return letters.filter((letter) => {
      const matchesSearch =
        searchTerm === '' ||
        letter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        letter.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        letter.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || letter.status === filterStatus;
      const matchesType = filterType === 'all' || letter.engagementType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [letters, searchTerm, filterStatus, filterType]);

  // Stats
  const stats = useMemo(() => {
    const total = letters.length;
    const draft = letters.filter((l) => l.status === 'draft').length;
    const sent = letters.filter((l) => l.status === 'sent').length;
    const accepted = letters.filter((l) => l.status === 'accepted').length;
    const totalValue = letters
      .filter((l) => l.status === 'accepted')
      .reduce((sum, l) => sum + calculateTotalFee(l), 0);
    return { total, draft, sent, accepted, totalValue };
  }, [letters]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.engagementLetter.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.engagementLetter.engagementLetterManager', 'Engagement Letter Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.engagementLetter.createAndManageProfessionalEngagement', 'Create and manage professional engagement letters')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="engagement-letter" toolName="Engagement Letter" />

              <SyncStatus
                isSynced={lettersSynced}
                isSaving={lettersSaving}
                lastSaved={lettersLastSaved}
                syncError={lettersSyncError}
                onForceSync={forceLettersSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = letters.map((l) => ({
                    ...l,
                    totalFee: calculateTotalFee(l),
                  }));
                  exportToCSV(exportData, LETTER_COLUMNS, { filename: 'engagement-letters' });
                }}
                onExportExcel={() => {
                  const exportData = letters.map((l) => ({
                    ...l,
                    totalFee: calculateTotalFee(l),
                  }));
                  exportToExcel(exportData, LETTER_COLUMNS, { filename: 'engagement-letters' });
                }}
                onExportJSON={() => {
                  exportToJSON(letters, { filename: 'engagement-letters' });
                }}
                onExportPDF={async () => {
                  const exportData = letters.map((l) => ({
                    ...l,
                    totalFee: calculateTotalFee(l),
                  }));
                  await exportToPDF(exportData, LETTER_COLUMNS, {
                    filename: 'engagement-letters',
                    title: 'Engagement Letters Report',
                    subtitle: `${letters.length} letters | ${formatCurrency(stats.totalValue)} accepted value`,
                  });
                }}
                onPrint={() => {
                  const exportData = letters.map((l) => ({
                    ...l,
                    totalFee: calculateTotalFee(l),
                  }));
                  printData(exportData, LETTER_COLUMNS, { title: 'Engagement Letters' });
                }}
                onCopyToClipboard={async () => {
                  const exportData = letters.map((l) => ({
                    ...l,
                    totalFee: calculateTotalFee(l),
                  }));
                  return await copyUtil(exportData, LETTER_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.engagementLetter.totalLetters', 'Total Letters')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.engagementLetter.drafts', 'Drafts')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.draft}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.engagementLetter.sent', 'Sent')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.sent}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.engagementLetter.accepted', 'Accepted')}</p>
              <p className={`text-2xl font-bold text-green-600`}>{stats.accepted}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.engagementLetter.acceptedValue', 'Accepted Value')}</p>
              <p className={`text-2xl font-bold text-[#0D9488]`}>{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'letters', label: 'Engagement Letters', icon: <FileText className="w-4 h-4" /> },
              { id: 'clients', label: 'Clients', icon: <User className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Letters Tab */}
        {activeTab === 'letters' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.engagementLetter.searchLetters', 'Search letters...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                  />
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
                  <option value="all">{t('tools.engagementLetter.allStatus', 'All Status')}</option>
                  <option value="draft">{t('tools.engagementLetter.draft', 'Draft')}</option>
                  <option value="sent">{t('tools.engagementLetter.sent2', 'Sent')}</option>
                  <option value="accepted">{t('tools.engagementLetter.accepted2', 'Accepted')}</option>
                  <option value="declined">{t('tools.engagementLetter.declined', 'Declined')}</option>
                  <option value="expired">{t('tools.engagementLetter.expired', 'Expired')}</option>
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
                  <option value="all">{t('tools.engagementLetter.allTypes', 'All Types')}</option>
                  {ENGAGEMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowLetterForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.engagementLetter.newEngagementLetter', 'New Engagement Letter')}
              </button>
            </div>

            {/* Letters List */}
            <div className="space-y-4">
              {filteredLetters.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.engagementLetter.noEngagementLettersFound', 'No engagement letters found')}</p>
                  <button
                    onClick={() => setShowLetterForm(true)}
                    className="mt-4 text-[#0D9488] hover:underline"
                  >
                    {t('tools.engagementLetter.createYourFirstEngagementLetter', 'Create your first engagement letter')}
                  </button>
                </div>
              ) : (
                filteredLetters.map((letter) => {
                  const StatusIcon = STATUS_COLORS[letter.status].icon;
                  return (
                    <div
                      key={letter.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {letter.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${STATUS_COLORS[letter.status].bg} ${STATUS_COLORS[letter.status].text}`}>
                              <StatusIcon className="w-3 h-3" />
                              {letter.status.charAt(0).toUpperCase() + letter.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Building2 className="w-4 h-4" />
                              {letter.companyName}
                            </span>
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <User className="w-4 h-4" />
                              {letter.clientName}
                            </span>
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Calendar className="w-4 h-4" />
                              {formatDate(letter.startDate)} - {formatDate(letter.endDate)}
                            </span>
                            <span className={`flex items-center gap-1 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(calculateTotalFee(letter))}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {letter.status === 'draft' && (
                            <button
                              onClick={() => updateLetterStatus(letter.id, 'sent')}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title={t('tools.engagementLetter.markAsSent', 'Mark as Sent')}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {letter.status === 'sent' && (
                            <button
                              onClick={() => updateLetterStatus(letter.id, 'accepted')}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title={t('tools.engagementLetter.markAsAccepted', 'Mark as Accepted')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedLetter(letter)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                            title={t('tools.engagementLetter.viewDetails', 'View Details')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteLetter(letter.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Clients ({clients.length})
              </h2>
              <button
                onClick={() => setShowClientForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.engagementLetter.addClient', 'Add Client')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {client.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {client.company}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteClient(client.id)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {client.email && <p>{client.email}</p>}
                    {client.phone && <p>{client.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Letter Form Modal */}
        {showLetterForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.engagementLetter.newEngagementLetter2', 'New Engagement Letter')}
                  </h2>
                  <button onClick={() => setShowLetterForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.engagementLetter.client2', 'Client *')}
                  </label>
                  <select
                    value={newLetter.clientId}
                    onChange={(e) => setNewLetter({ ...newLetter, clientId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.engagementLetter.selectClient', 'Select client...')}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.company} - {client.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.engagementLetter.engagementType', 'Engagement Type *')}
                    </label>
                    <select
                      value={newLetter.engagementType}
                      onChange={(e) => setNewLetter({ ...newLetter, engagementType: e.target.value as EngagementLetter['engagementType'] })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {ENGAGEMENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.engagementLetter.title', 'Title *')}
                    </label>
                    <input
                      type="text"
                      value={newLetter.title}
                      onChange={(e) => setNewLetter({ ...newLetter, title: e.target.value })}
                      placeholder={t('tools.engagementLetter.eGQ12024Financial', 'e.g., Q1 2024 Financial Audit')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.engagementLetter.scopeOfWork2', 'Scope of Work')}
                  </label>
                  <textarea
                    value={newLetter.scope}
                    onChange={(e) => setNewLetter({ ...newLetter, scope: e.target.value })}
                    rows={3}
                    placeholder={t('tools.engagementLetter.describeTheScopeOfThe', 'Describe the scope of the engagement...')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.engagementLetter.startDate', 'Start Date')}
                    </label>
                    <input
                      type="date"
                      value={newLetter.startDate}
                      onChange={(e) => setNewLetter({ ...newLetter, startDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.engagementLetter.endDate', 'End Date')}
                    </label>
                    <input
                      type="date"
                      value={newLetter.endDate}
                      onChange={(e) => setNewLetter({ ...newLetter, endDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.engagementLetter.feeStructure', 'Fee Structure')}
                  </label>
                  <div className="flex gap-4 mb-2">
                    {['hourly', 'fixed', 'hybrid'].map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="feeType"
                          value={type}
                          checked={newLetter.feeType === type}
                          onChange={(e) => setNewLetter({ ...newLetter, feeType: e.target.value as 'hourly' | 'fixed' | 'hybrid' })}
                          className="text-[#0D9488]"
                        />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {(newLetter.feeType === 'hourly' || newLetter.feeType === 'hybrid') && (
                      <>
                        <div>
                          <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.engagementLetter.estimatedHours', 'Estimated Hours')}
                          </label>
                          <input
                            type="number"
                            value={newLetter.estimatedHours}
                            onChange={(e) => setNewLetter({ ...newLetter, estimatedHours: parseFloat(e.target.value) || 0 })}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.engagementLetter.hourlyRate', 'Hourly Rate ($)')}
                          </label>
                          <input
                            type="number"
                            value={newLetter.hourlyRate}
                            onChange={(e) => setNewLetter({ ...newLetter, hourlyRate: parseFloat(e.target.value) || 0 })}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </>
                    )}
                    {(newLetter.feeType === 'fixed' || newLetter.feeType === 'hybrid') && (
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.engagementLetter.fixedFee', 'Fixed Fee ($)')}
                        </label>
                        <input
                          type="number"
                          value={newLetter.fixedFee}
                          onChange={(e) => setNewLetter({ ...newLetter, fixedFee: parseFloat(e.target.value) || 0 })}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowLetterForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.engagementLetter.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addLetter}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.engagementLetter.createLetter', 'Create Letter')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Client Form Modal */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.engagementLetter.addClient2', 'Add Client')}
                  </h2>
                  <button onClick={() => setShowClientForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.engagementLetter.contactName', 'Contact Name *')}
                  </label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.engagementLetter.company', 'Company *')}
                  </label>
                  <input
                    type="text"
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.engagementLetter.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.engagementLetter.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowClientForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.engagementLetter.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addClient}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.engagementLetter.addClient3', 'Add Client')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Letter Detail Modal */}
        {selectedLetter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedLetter.title}
                  </h2>
                  <button onClick={() => setSelectedLetter(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.engagementLetter.client', 'Client')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedLetter.clientName} ({selectedLetter.companyName})
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.engagementLetter.status', 'Status')}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedLetter.status].bg} ${STATUS_COLORS[selectedLetter.status].text}`}>
                      {selectedLetter.status.charAt(0).toUpperCase() + selectedLetter.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.engagementLetter.engagementPeriod', 'Engagement Period')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedLetter.startDate)} - {formatDate(selectedLetter.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.engagementLetter.totalFee', 'Total Fee')}</p>
                    <p className={`font-medium text-[#0D9488]`}>
                      {formatCurrency(calculateTotalFee(selectedLetter))}
                    </p>
                  </div>
                </div>
                {selectedLetter.scope && (
                  <div>
                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.engagementLetter.scopeOfWork', 'Scope of Work')}</p>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{selectedLetter.scope}</p>
                  </div>
                )}
                {selectedLetter.objectives.length > 0 && (
                  <div>
                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.engagementLetter.objectives', 'Objectives')}</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedLetter.objectives.map((obj, i) => (
                        <li key={i} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedLetter.deliverables.length > 0 && (
                  <div>
                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.engagementLetter.deliverables', 'Deliverables')}</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedLetter.deliverables.map((del, i) => (
                        <li key={i} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{del}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.engagementLetter.close', 'Close')}
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

export default EngagementLetterTool;
