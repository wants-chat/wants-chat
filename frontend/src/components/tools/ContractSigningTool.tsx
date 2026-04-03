'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileSignature,
  FileText,
  User,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Send,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Copy,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Link,
  PenTool,
  ClipboardList,
  Shield,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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
import { useTheme } from '@/contexts/ThemeContext';

interface ContractSigningToolProps {
  uiConfig?: UIConfig;
}

// Types
type ContractStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'expired' | 'declined' | 'cancelled';
type ContractType = 'wedding' | 'portrait' | 'event' | 'commercial' | 'model-release' | 'property-release' | 'retainer' | 'custom';

interface ContractClause {
  id: string;
  title: string;
  content: string;
  isRequired: boolean;
  order: number;
}

interface Signatory {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'photographer' | 'witness' | 'other';
  signedAt: string | null;
  ipAddress: string | null;
}

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: ContractType;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  eventDate: string;
  eventLocation: string;
  sessionType: string;
  packageName: string;
  packagePrice: number;
  depositAmount: number;
  depositDue: string;
  balanceDue: string;
  paymentTerms: string;
  deliverables: string;
  copyrightTerms: string;
  cancellationPolicy: string;
  clauses: ContractClause[];
  signatories: Signatory[];
  status: ContractStatus;
  sentAt: string | null;
  viewedAt: string | null;
  signedAt: string | null;
  expiresAt: string;
  signatureLink: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  clauses: ContractClause[];
  isDefault: boolean;
  createdAt: string;
}

// Constants
const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'wedding', label: 'Wedding Photography' },
  { value: 'portrait', label: 'Portrait Session' },
  { value: 'event', label: 'Event Coverage' },
  { value: 'commercial', label: 'Commercial/Product' },
  { value: 'model-release', label: 'Model Release' },
  { value: 'property-release', label: 'Property Release' },
  { value: 'retainer', label: 'Retainer Agreement' },
  { value: 'custom', label: 'Custom Contract' },
];

const STATUS_COLORS: Record<ContractStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
  sent: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  viewed: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  signed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  expired: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
  declined: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  cancelled: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
};

const DEFAULT_CLAUSES: ContractClause[] = [
  {
    id: '1',
    title: 'Services',
    content: 'The Photographer agrees to provide photography services as described in this agreement for the date, time, and location specified above.',
    isRequired: true,
    order: 1,
  },
  {
    id: '2',
    title: 'Payment Terms',
    content: 'Client agrees to pay the deposit upon signing this contract to reserve the date. The balance is due as specified in the payment schedule.',
    isRequired: true,
    order: 2,
  },
  {
    id: '3',
    title: 'Copyright & Usage',
    content: 'All photographs created under this agreement are copyrighted by the Photographer. Client receives a personal use license for the delivered images.',
    isRequired: true,
    order: 3,
  },
  {
    id: '4',
    title: 'Cancellation Policy',
    content: 'In the event of cancellation, the deposit is non-refundable. Cancellations within 30 days of the event date forfeit 50% of the total package price.',
    isRequired: true,
    order: 4,
  },
  {
    id: '5',
    title: 'Liability',
    content: 'While the Photographer takes every precaution, liability for any claims is limited to the total amount paid for services.',
    isRequired: true,
    order: 5,
  },
];

// Column configurations for exports
const CONTRACT_COLUMNS: ColumnConfig[] = [
  { key: 'contractNumber', header: 'Contract #', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'packagePrice', header: 'Amount', type: 'currency' },
  { key: 'eventDate', header: 'Event Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'sentAt', header: 'Sent', type: 'date' },
  { key: 'signedAt', header: 'Signed', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const generateContractNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CTR-${year}${month}-${random}`;
};

const generateSignatureLink = () => {
  return `https://sign.example.com/${generateId()}`;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDefaultExpiryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14); // 14 days to sign
  return date.toISOString().split('T')[0];
};

// Main Component
export const ContractSigningTool: React.FC<ContractSigningToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: contracts,
    addItem: addContract,
    updateItem: updateContract,
    deleteItem: deleteContract,
    isSynced: contractsSynced,
    isSaving: contractsSaving,
    lastSaved: contractsLastSaved,
    syncError: contractsSyncError,
    forceSync: forceContractsSync,
  } = useToolData<Contract>('photography-contracts', [], CONTRACT_COLUMNS);

  const {
    data: templates,
    addItem: addTemplate,
    updateItem: updateTemplate,
    deleteItem: deleteTemplate,
  } = useToolData<ContractTemplate>('contract-templates', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'contracts' | 'create' | 'templates'>('contracts');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // New contract form state
  const [newContract, setNewContract] = useState<Partial<Contract>>({
    title: '',
    type: 'portrait',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    eventDate: new Date().toISOString().split('T')[0],
    eventLocation: '',
    sessionType: '',
    packageName: '',
    packagePrice: 0,
    depositAmount: 0,
    depositDue: new Date().toISOString().split('T')[0],
    balanceDue: '',
    paymentTerms: 'Deposit due upon signing. Balance due on or before the event date.',
    deliverables: '',
    copyrightTerms: 'All images are copyrighted by the photographer. Client receives personal use license.',
    cancellationPolicy: 'Deposit is non-refundable. Cancellations within 30 days forfeit 50% of total.',
    clauses: [...DEFAULT_CLAUSES],
    signatories: [],
    status: 'draft',
    expiresAt: getDefaultExpiryDate(),
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.clientName || params.type) {
        setNewContract({
          ...newContract,
          title: params.title || '',
          type: params.type || 'portrait',
          clientName: params.clientName || '',
          clientEmail: params.clientEmail || '',
          eventDate: params.eventDate || new Date().toISOString().split('T')[0],
          packagePrice: params.packagePrice || 0,
        });
        setActiveTab('create');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = searchTerm === '' ||
        contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
      const matchesType = filterType === 'all' || contract.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [contracts, searchTerm, filterStatus, filterType]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const pendingSigning = contracts.filter(c => c.status === 'sent' || c.status === 'viewed');
    const signedValue = contracts
      .filter(c => c.status === 'signed')
      .reduce((sum, c) => sum + c.packagePrice, 0);

    return {
      totalContracts: contracts.length,
      drafts: contracts.filter(c => c.status === 'draft').length,
      pending: pendingSigning.length,
      signed: contracts.filter(c => c.status === 'signed').length,
      signedValue,
      expiring: contracts.filter(c => {
        const expiryDate = new Date(c.expiresAt);
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        return (c.status === 'sent' || c.status === 'viewed') && expiryDate <= threeDaysFromNow;
      }).length,
    };
  }, [contracts]);

  // Create contract
  const handleCreateContract = () => {
    if (!newContract.clientName || !newContract.clientEmail) {
      setValidationMessage('Please enter client name and email');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (!newContract.title) {
      setValidationMessage('Please enter a contract title');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const contract: Contract = {
      id: generateId(),
      contractNumber: generateContractNumber(),
      title: newContract.title || '',
      type: newContract.type as ContractType || 'portrait',
      clientId: generateId(),
      clientName: newContract.clientName || '',
      clientEmail: newContract.clientEmail || '',
      clientPhone: newContract.clientPhone || '',
      clientAddress: newContract.clientAddress || '',
      eventDate: newContract.eventDate || new Date().toISOString().split('T')[0],
      eventLocation: newContract.eventLocation || '',
      sessionType: newContract.sessionType || '',
      packageName: newContract.packageName || '',
      packagePrice: newContract.packagePrice || 0,
      depositAmount: newContract.depositAmount || 0,
      depositDue: newContract.depositDue || new Date().toISOString().split('T')[0],
      balanceDue: newContract.balanceDue || 'Due on event date',
      paymentTerms: newContract.paymentTerms || '',
      deliverables: newContract.deliverables || '',
      copyrightTerms: newContract.copyrightTerms || '',
      cancellationPolicy: newContract.cancellationPolicy || '',
      clauses: newContract.clauses || [...DEFAULT_CLAUSES],
      signatories: [
        {
          id: generateId(),
          name: newContract.clientName || '',
          email: newContract.clientEmail || '',
          phone: newContract.clientPhone || '',
          role: 'client',
          signedAt: null,
          ipAddress: null,
        },
      ],
      status: 'draft',
      sentAt: null,
      viewedAt: null,
      signedAt: null,
      expiresAt: newContract.expiresAt || getDefaultExpiryDate(),
      signatureLink: generateSignatureLink(),
      notes: newContract.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addContract(contract);
    resetContractForm();
    setActiveTab('contracts');
  };

  // Send contract
  const sendContract = (contractId: string) => {
    updateContract(contractId, {
      status: 'sent',
      sentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  // Copy signature link
  const copySignatureLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Mark as signed (for demo purposes)
  const markAsSigned = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    updateContract(contractId, {
      status: 'signed',
      signedAt: new Date().toISOString(),
      signatories: contract.signatories.map(s => ({
        ...s,
        signedAt: new Date().toISOString(),
        ipAddress: '192.168.1.1', // Demo IP
      })),
      updatedAt: new Date().toISOString(),
    });
  };

  // Reset form
  const resetContractForm = () => {
    setNewContract({
      title: '',
      type: 'portrait',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      eventDate: new Date().toISOString().split('T')[0],
      eventLocation: '',
      sessionType: '',
      packageName: '',
      packagePrice: 0,
      depositAmount: 0,
      depositDue: new Date().toISOString().split('T')[0],
      balanceDue: '',
      paymentTerms: 'Deposit due upon signing. Balance due on or before the event date.',
      deliverables: '',
      copyrightTerms: 'All images are copyrighted by the photographer. Client receives personal use license.',
      cancellationPolicy: 'Deposit is non-refundable. Cancellations within 30 days forfeit 50% of total.',
      clauses: [...DEFAULT_CLAUSES],
      signatories: [],
      status: 'draft',
      expiresAt: getDefaultExpiryDate(),
      notes: '',
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.contractSigning.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <FileSignature className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.contractSigning.contractManager', 'Contract Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.contractSigning.createSendAndTrackPhotography', 'Create, send, and track photography contracts')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="contract-signing" toolName="Contract Signing" />

              <SyncStatus
                isSynced={contractsSynced}
                isSaving={contractsSaving}
                lastSaved={contractsLastSaved}
                syncError={contractsSyncError}
                onForceSync={forceContractsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredContracts, CONTRACT_COLUMNS, 'contracts')}
                onExportExcel={() => exportToExcel(filteredContracts, CONTRACT_COLUMNS, 'contracts')}
                onExportJSON={() => exportToJSON(filteredContracts, 'contracts')}
                onExportPDF={() => exportToPDF(filteredContracts, CONTRACT_COLUMNS, 'Photography Contracts', 'contracts')}
                onCopy={() => copyUtil(filteredContracts, CONTRACT_COLUMNS)}
                onPrint={() => printData(filteredContracts, CONTRACT_COLUMNS, 'Photography Contracts')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.totalContracts', 'Total Contracts')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalContracts}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.drafts', 'Drafts')}</p>
              <p className={`text-2xl font-bold text-gray-500`}>{stats.drafts}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.awaitingSignature', 'Awaiting Signature')}</p>
              <p className={`text-2xl font-bold text-yellow-500`}>{stats.pending}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.signed', 'Signed')}</p>
              <p className={`text-2xl font-bold text-green-500`}>{stats.signed}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.signedValue', 'Signed Value')}</p>
              <p className={`text-2xl font-bold text-blue-500`}>{formatCurrency(stats.signedValue)}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.expiringSoon', 'Expiring Soon')}</p>
              <p className={`text-2xl font-bold text-orange-500`}>{stats.expiring}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['contracts', 'create', 'templates'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`flex-1 px-4 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-[#0D9488] text-[#0D9488]'
                    : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'create' ? 'Create Contract' : tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Contracts Tab */}
            {activeTab === 'contracts' && (
              <div>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <input
                    type="text"
                    placeholder={t('tools.contractSigning.searchContracts', 'Search contracts...')}
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
                    <option value="all">{t('tools.contractSigning.allStatus', 'All Status')}</option>
                    <option value="draft">{t('tools.contractSigning.draft', 'Draft')}</option>
                    <option value="sent">{t('tools.contractSigning.sent', 'Sent')}</option>
                    <option value="viewed">{t('tools.contractSigning.viewed', 'Viewed')}</option>
                    <option value="signed">{t('tools.contractSigning.signed2', 'Signed')}</option>
                    <option value="expired">{t('tools.contractSigning.expired', 'Expired')}</option>
                    <option value="declined">{t('tools.contractSigning.declined', 'Declined')}</option>
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="all">{t('tools.contractSigning.allTypes', 'All Types')}</option>
                    {CONTRACT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Contracts List */}
                <div className="space-y-4">
                  {filteredContracts.length === 0 ? (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.contractSigning.noContractsFoundCreateYour', 'No contracts found. Create your first contract!')}</p>
                    </div>
                  ) : (
                    filteredContracts.map((contract) => (
                      <div
                        key={contract.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${STATUS_COLORS[contract.status].bg}`}>
                              <FileSignature className={`w-5 h-5 ${STATUS_COLORS[contract.status].text}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {contract.title}
                                </h3>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {contract.contractNumber}
                                </span>
                              </div>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {contract.clientName} - {CONTRACT_TYPES.find(t => t.value === contract.type)?.label}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(contract.eventDate)}
                                </span>
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <DollarSign className="w-4 h-4" />
                                  {formatCurrency(contract.packagePrice)}
                                </span>
                                {contract.status === 'sent' && (
                                  <span className={`flex items-center gap-1 text-yellow-500`}>
                                    <Clock className="w-4 h-4" />
                                    Expires {formatDate(contract.expiresAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs capitalize ${STATUS_COLORS[contract.status].bg} ${STATUS_COLORS[contract.status].text}`}>
                              {contract.status}
                            </span>
                            {contract.status === 'draft' && (
                              <button
                                onClick={() => sendContract(contract.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-[#0D9488] text-white rounded text-sm hover:bg-[#0D9488]/90"
                              >
                                <Send className="w-4 h-4" />
                                {t('tools.contractSigning.send', 'Send')}
                              </button>
                            )}
                            {(contract.status === 'sent' || contract.status === 'viewed') && (
                              <>
                                <button
                                  onClick={() => copySignatureLink(contract.signatureLink)}
                                  className={`flex items-center gap-1 px-3 py-1 rounded text-sm border ${
                                    theme === 'dark' ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'
                                  }`}
                                >
                                  {copiedLink === contract.signatureLink ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      {t('tools.contractSigning.copied', 'Copied')}
                                    </>
                                  ) : (
                                    <>
                                      <Link className="w-4 h-4" />
                                      {t('tools.contractSigning.copyLink', 'Copy Link')}
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => markAsSigned(contract.id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  <PenTool className="w-4 h-4" />
                                  {t('tools.contractSigning.markSigned', 'Mark Signed')}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setSelectedContract(contract)}
                              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Delete Contract',
                                  message: 'Are you sure you want to delete this contract? This action cannot be undone.',
                                  confirmText: 'Delete',
                                  cancelText: 'Cancel',
                                  variant: 'danger',
                                });
                                if (confirmed) {
                                  deleteContract(contract.id);
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

            {/* Create Contract Tab */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                {/* Contract Info */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.contractSigning.contractDetails', 'Contract Details')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.contractTitle', 'Contract Title *')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('tools.contractSigning.eGSmithWeddingPhotography', 'e.g., Smith Wedding Photography')}
                        value={newContract.title}
                        onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.contractType', 'Contract Type')}
                      </label>
                      <select
                        value={newContract.type}
                        onChange={(e) => setNewContract({ ...newContract, type: e.target.value as ContractType })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      >
                        {CONTRACT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.contractSigning.clientInformation', 'Client Information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.clientName', 'Client Name *')}
                      </label>
                      <input
                        type="text"
                        value={newContract.clientName}
                        onChange={(e) => setNewContract({ ...newContract, clientName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.email2', 'Email *')}
                      </label>
                      <input
                        type="email"
                        value={newContract.clientEmail}
                        onChange={(e) => setNewContract({ ...newContract, clientEmail: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.phone', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        value={newContract.clientPhone}
                        onChange={(e) => setNewContract({ ...newContract, clientPhone: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Event Info */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.contractSigning.eventDetails', 'Event Details')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.eventDate', 'Event Date')}
                      </label>
                      <input
                        type="date"
                        value={newContract.eventDate}
                        onChange={(e) => setNewContract({ ...newContract, eventDate: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.eventLocation', 'Event Location')}
                      </label>
                      <input
                        type="text"
                        value={newContract.eventLocation}
                        onChange={(e) => setNewContract({ ...newContract, eventLocation: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.contractSigning.paymentDetails', 'Payment Details')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.packageName', 'Package Name')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('tools.contractSigning.eGPremiumPackage', 'e.g., Premium Package')}
                        value={newContract.packageName}
                        onChange={(e) => setNewContract({ ...newContract, packageName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.packagePrice', 'Package Price')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newContract.packagePrice}
                        onChange={(e) => setNewContract({ ...newContract, packagePrice: parseFloat(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.depositAmount', 'Deposit Amount')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newContract.depositAmount}
                        onChange={(e) => setNewContract({ ...newContract, depositAmount: parseFloat(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.depositDueDate', 'Deposit Due Date')}
                      </label>
                      <input
                        type="date"
                        value={newContract.depositDue}
                        onChange={(e) => setNewContract({ ...newContract, depositDue: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.contractSigning.termsConditions', 'Terms & Conditions')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.deliverables', 'Deliverables')}
                      </label>
                      <textarea
                        rows={2}
                        placeholder={t('tools.contractSigning.eG500EditedImages', 'e.g., 500+ edited images, online gallery, USB delivery...')}
                        value={newContract.deliverables}
                        onChange={(e) => setNewContract({ ...newContract, deliverables: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.contractSigning.additionalNotes', 'Additional Notes')}
                      </label>
                      <textarea
                        rows={3}
                        value={newContract.notes}
                        onChange={(e) => setNewContract({ ...newContract, notes: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={resetContractForm}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.contractSigning.clear', 'Clear')}
                  </button>
                  <button
                    onClick={handleCreateContract}
                    className="px-6 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.contractSigning.createContract', 'Create Contract')}
                  </button>
                </div>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.contractSigning.contractTemplatesComingSoon', 'Contract templates coming soon')}</p>
                <p className="text-sm mt-2">{t('tools.contractSigning.createAndSaveReusableContract', 'Create and save reusable contract templates')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contract Detail Modal */}
        {selectedContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedContract.title}
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedContract.contractNumber}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                {/* Client Info */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractSigning.client', 'Client')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.name', 'Name')}</p>
                      <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedContract.clientName}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.email', 'Email')}</p>
                      <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedContract.clientEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Event Info */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractSigning.event', 'Event')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.date', 'Date')}</p>
                      <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatDate(selectedContract.eventDate)}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.location', 'Location')}</p>
                      <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedContract.eventLocation || 'TBD'}</p>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractSigning.payment', 'Payment')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.package', 'Package')}</p>
                      <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedContract.packageName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.total', 'Total')}</p>
                      <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(selectedContract.packagePrice)}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.contractSigning.deposit', 'Deposit')}</p>
                      <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(selectedContract.depositAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Signature Status */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.contractSigning.signatureStatus', 'Signature Status')}</h3>
                  {selectedContract.signatories.map((signatory) => (
                    <div key={signatory.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{signatory.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          {signatory.role}
                        </span>
                      </div>
                      {signatory.signedAt ? (
                        <span className="flex items-center gap-1 text-green-500 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Signed {formatDate(signatory.signedAt)}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-500 text-sm">
                          <Clock className="w-4 h-4" />
                          {t('tools.contractSigning.pending', 'Pending')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedContract(null)}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {t('tools.contractSigning.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-40">
            <AlertCircle className="w-5 h-5" />
            <span>{validationMessage}</span>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ContractSigningTool;
