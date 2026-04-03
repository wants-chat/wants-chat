'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileSignature,
  Briefcase,
  CreditCard,
  Receipt,
  Percent,
  Wallet,
  FileEdit,
  Send,
  XCircle,
  History,
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
interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  type: 'retainer' | 'payment' | 'refund';
  method: 'check' | 'credit-card' | 'wire' | 'ach';
  reference: string;
  notes: string;
}

interface Amendment {
  id: string;
  date: string;
  description: string;
  signedDate?: string;
  effectiveDate: string;
}

interface ClientAgreement {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  matterNumber?: string;
  matterDescription: string;
  agreementType: 'hourly' | 'flat-fee' | 'contingency' | 'hybrid' | 'retainer';
  effectiveDate: string;
  expirationDate?: string;
  hourlyRate?: number;
  flatFee?: number;
  contingencyPercentage?: number;
  retainerAmount?: number;
  retainerBalance: number;
  minimumRetainer?: number;
  billingFrequency: 'monthly' | 'quarterly' | 'upon-completion' | 'milestone';
  paymentTerms: number; // days
  scopeOfWork: string[];
  exclusions: string[];
  signedDate?: string;
  signedBy?: string;
  status: 'draft' | 'sent' | 'signed' | 'active' | 'expired' | 'terminated';
  payments: PaymentRecord[];
  amendments: Amendment[];
  responsibleAttorney: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientAgreementToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'client-agreement';

const agreementColumns: ColumnConfig[] = [
  { key: 'clientName', header: 'Client Name', type: 'string' },
  { key: 'matterNumber', header: 'Matter #', type: 'string' },
  { key: 'matterDescription', header: 'Matter', type: 'string' },
  { key: 'agreementType', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'retainerBalance', header: 'Retainer Balance', type: 'number' },
  { key: 'effectiveDate', header: 'Effective Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewAgreement = (): ClientAgreement => ({
  id: crypto.randomUUID(),
  clientId: '',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  matterNumber: '',
  matterDescription: '',
  agreementType: 'hourly',
  effectiveDate: new Date().toISOString().split('T')[0],
  expirationDate: '',
  hourlyRate: 0,
  flatFee: 0,
  contingencyPercentage: 0,
  retainerAmount: 0,
  retainerBalance: 0,
  minimumRetainer: 0,
  billingFrequency: 'monthly',
  paymentTerms: 30,
  scopeOfWork: [],
  exclusions: [],
  signedDate: '',
  signedBy: '',
  status: 'draft',
  payments: [],
  amendments: [],
  responsibleAttorney: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const agreementTypes = [
  { value: 'hourly', label: 'Hourly Rate', icon: Clock, description: 'Billed based on time spent' },
  { value: 'flat-fee', label: 'Flat Fee', icon: DollarSign, description: 'Fixed price for services' },
  { value: 'contingency', label: 'Contingency', icon: Percent, description: 'Percentage of recovery' },
  { value: 'hybrid', label: 'Hybrid', icon: Receipt, description: 'Combined fee arrangement' },
  { value: 'retainer', label: 'Retainer', icon: Wallet, description: 'Ongoing retainer agreement' },
];

const billingFrequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'upon-completion', label: 'Upon Completion' },
  { value: 'milestone', label: 'Milestone-Based' },
];

const paymentMethods = [
  { value: 'check', label: 'Check' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'wire', label: 'Wire Transfer' },
  { value: 'ach', label: 'ACH' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'sent', label: 'Sent', color: 'blue' },
  { value: 'signed', label: 'Signed', color: 'purple' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'expired', label: 'Expired', color: 'orange' },
  { value: 'terminated', label: 'Terminated', color: 'red' },
];

const commonScopeItems = [
  'Legal research and analysis',
  'Document drafting and review',
  'Court filings and appearances',
  'Negotiations and settlement discussions',
  'Client communications and updates',
  'Discovery management',
  'Deposition preparation and attendance',
  'Trial preparation and representation',
  'Motion practice',
  'Expert witness coordination',
];

const commonExclusions = [
  'Appeals and post-trial motions',
  'Expert witness fees',
  'Court costs and filing fees',
  'Travel expenses',
  'Third-party service fees',
  'Investigations and private investigators',
  'Collection efforts',
  'Unrelated legal matters',
];

export const ClientAgreementTool: React.FC<ClientAgreementToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: agreements,
    addItem: addAgreement,
    updateItem: updateAgreement,
    deleteItem: deleteAgreement,
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
  } = useToolData<ClientAgreement>(TOOL_ID, [], agreementColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<ClientAgreement | null>(null);
  const [editingAgreement, setEditingAgreement] = useState<ClientAgreement | null>(null);
  const [formData, setFormData] = useState<ClientAgreement>(createNewAgreement());
  const [newScopeItem, setNewScopeItem] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'payments' | 'amendments'>('details');

  const [newPayment, setNewPayment] = useState<Omit<PaymentRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'payment',
    method: 'check',
    reference: '',
    notes: '',
  });

  const [newAmendment, setNewAmendment] = useState<Omit<Amendment, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    signedDate: '',
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  // Statistics
  const stats = useMemo(() => {
    const active = agreements.filter(a => a.status === 'active');
    const totalRetainerBalance = agreements.reduce((sum, a) => sum + (a.retainerBalance || 0), 0);
    const hourlyAgreements = agreements.filter(a => a.agreementType === 'hourly');
    const flatFeeAgreements = agreements.filter(a => a.agreementType === 'flat-fee');
    const contingencyAgreements = agreements.filter(a => a.agreementType === 'contingency');
    const expiringSoon = agreements.filter(a => {
      if (!a.expirationDate) return false;
      const expDate = new Date(a.expirationDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });
    const lowRetainer = agreements.filter(a =>
      a.minimumRetainer && a.retainerBalance < a.minimumRetainer
    );
    return {
      total: agreements.length,
      active: active.length,
      totalRetainerBalance,
      hourlyAgreements: hourlyAgreements.length,
      flatFeeAgreements: flatFeeAgreements.length,
      contingencyAgreements: contingencyAgreements.length,
      expiringSoon: expiringSoon.length,
      lowRetainer: lowRetainer.length,
    };
  }, [agreements]);

  // Filtered agreements
  const filteredAgreements = useMemo(() => {
    return agreements.filter(agreement => {
      const matchesSearch = searchQuery === '' ||
        agreement.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agreement.matterDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (agreement.matterNumber && agreement.matterNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === '' || agreement.agreementType === filterType;
      const matchesStatus = filterStatus === '' || agreement.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [agreements, searchQuery, filterType, filterStatus]);

  const handleSave = () => {
    if (editingAgreement) {
      updateAgreement(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addAgreement({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingAgreement(null);
    setFormData(createNewAgreement());
  };

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this agreement?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteAgreement(id);
      if (selectedAgreement?.id === id) setSelectedAgreement(null);
    }
  }, [confirm, deleteAgreement, selectedAgreement]);

  const openEditModal = (agreement: ClientAgreement) => {
    setEditingAgreement(agreement);
    setFormData(agreement);
    setShowModal(true);
  };

  const addScopeItem = () => {
    if (newScopeItem.trim() && !formData.scopeOfWork.includes(newScopeItem.trim())) {
      setFormData({ ...formData, scopeOfWork: [...formData.scopeOfWork, newScopeItem.trim()] });
      setNewScopeItem('');
    }
  };

  const removeScopeItem = (item: string) => {
    setFormData({ ...formData, scopeOfWork: formData.scopeOfWork.filter(s => s !== item) });
  };

  const addExclusionItem = () => {
    if (newExclusion.trim() && !formData.exclusions.includes(newExclusion.trim())) {
      setFormData({ ...formData, exclusions: [...formData.exclusions, newExclusion.trim()] });
      setNewExclusion('');
    }
  };

  const removeExclusionItem = (item: string) => {
    setFormData({ ...formData, exclusions: formData.exclusions.filter(e => e !== item) });
  };

  const savePayment = () => {
    if (selectedAgreement && newPayment.amount > 0) {
      const payment: PaymentRecord = { ...newPayment, id: crypto.randomUUID() };
      let newBalance = selectedAgreement.retainerBalance;

      if (newPayment.type === 'retainer' || newPayment.type === 'payment') {
        newBalance += newPayment.amount;
      } else if (newPayment.type === 'refund') {
        newBalance -= newPayment.amount;
      }

      const updated = {
        ...selectedAgreement,
        payments: [...selectedAgreement.payments, payment],
        retainerBalance: newBalance,
        updatedAt: new Date().toISOString()
      };
      updateAgreement(selectedAgreement.id, updated);
      setSelectedAgreement(updated);
      setShowPaymentModal(false);
      setNewPayment({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        type: 'payment',
        method: 'check',
        reference: '',
        notes: ''
      });
    }
  };

  const saveAmendment = () => {
    if (selectedAgreement && newAmendment.description.trim()) {
      const amendment: Amendment = { ...newAmendment, id: crypto.randomUUID() };
      const updated = {
        ...selectedAgreement,
        amendments: [...selectedAgreement.amendments, amendment],
        updatedAt: new Date().toISOString()
      };
      updateAgreement(selectedAgreement.id, updated);
      setSelectedAgreement(updated);
      setShowAmendmentModal(false);
      setNewAmendment({
        date: new Date().toISOString().split('T')[0],
        description: '',
        signedDate: '',
        effectiveDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  const updateStatus = (agreement: ClientAgreement, newStatus: ClientAgreement['status']) => {
    const updated = { ...agreement, status: newStatus, updatedAt: new Date().toISOString() };
    updateAgreement(agreement.id, updated);
    if (selectedAgreement?.id === agreement.id) {
      setSelectedAgreement(updated);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'sent': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'signed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expired': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'terminated': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = agreementTypes.find(t => t.value === type);
    return typeConfig?.icon || FileText;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const isRetainerLow = (agreement: ClientAgreement) => {
    return agreement.minimumRetainer && agreement.retainerBalance < agreement.minimumRetainer;
  };

  const isExpiringSoon = (agreement: ClientAgreement) => {
    if (!agreement.expirationDate) return false;
    const expDate = new Date(agreement.expirationDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
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

  const tabClass = (active: boolean) => `px-4 py-2 font-medium transition-colors rounded-lg ${
    active
      ? 'bg-cyan-500/20 text-cyan-400'
      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <FileSignature className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.clientAgreement.clientAgreementManager', 'Client Agreement Manager')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.clientAgreement.manageEngagementLettersRetainersAnd', 'Manage engagement letters, retainers, and fee arrangements')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="client-agreement" toolName="Client Agreement" />

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
            onExportCSV={() => exportCSV({ filename: 'client-agreements' })}
            onExportExcel={() => exportExcel({ filename: 'client-agreements' })}
            onExportJSON={() => exportJSON({ filename: 'client-agreements' })}
            onExportPDF={() => exportPDF({ filename: 'client-agreements', title: 'Client Agreements' })}
            onPrint={() => print('Client Agreements')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={agreements.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewAgreement()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.clientAgreement.newAgreement', 'New Agreement')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientAgreement.totalAgreements', 'Total Agreements')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientAgreement.active', 'Active')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Wallet className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientAgreement.totalRetainer', 'Total Retainer')}</p>
              <p className="text-2xl font-bold text-purple-500">{formatCurrency(stats.totalRetainerBalance)}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientAgreement.expiringSoon', 'Expiring Soon')}</p>
              <p className="text-2xl font-bold text-orange-500">{stats.expiringSoon}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agreement Type Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.clientAgreement.hourlyAgreements', 'Hourly Agreements')}</span>
            </div>
            <span className="text-xl font-bold text-blue-500">{stats.hourlyAgreements}</span>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.clientAgreement.flatFeeAgreements', 'Flat Fee Agreements')}</span>
            </div>
            <span className="text-xl font-bold text-green-500">{stats.flatFeeAgreements}</span>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Percent className="w-5 h-5 text-purple-500" />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.clientAgreement.contingency', 'Contingency')}</span>
            </div>
            <span className="text-xl font-bold text-purple-500">{stats.contingencyAgreements}</span>
          </div>
        </div>
      </div>

      {/* Low Retainer Alert */}
      {stats.lowRetainer > 0 && (
        <div className={`mb-6 p-4 rounded-lg border border-red-500/30 ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'}`}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-400 font-medium">
              {stats.lowRetainer} agreement{stats.lowRetainer > 1 ? t('tools.clientAgreement.sHave', 's have') : ' has'} retainer balance below minimum threshold
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.clientAgreement.searchClientMatterOrNumber', 'Search client, matter, or number...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`${inputClass} w-full sm:w-44`}>
            <option value="">{t('tools.clientAgreement.allTypes', 'All Types')}</option>
            {agreementTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.clientAgreement.allStatus', 'All Status')}</option>
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agreement List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.clientAgreement.agreements', 'Agreements')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredAgreements.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.clientAgreement.noAgreementsFound', 'No agreements found')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredAgreements.map(agreement => {
                  const TypeIcon = getTypeIcon(agreement.agreementType);
                  return (
                    <div
                      key={agreement.id}
                      onClick={() => { setSelectedAgreement(agreement); setActiveTab('details'); }}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedAgreement?.id === agreement.id
                          ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <TypeIcon className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{agreement.clientName}</p>
                            <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {agreement.matterNumber && `#${agreement.matterNumber} - `}{agreement.matterDescription}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(agreement.status)}`}>
                                {agreement.status}
                              </span>
                              {isRetainerLow(agreement) && (
                                <AlertCircle className="w-4 h-4 text-red-500" title={t('tools.clientAgreement.lowRetainer', 'Low retainer')} />
                              )}
                              {isExpiringSoon(agreement) && (
                                <Clock className="w-4 h-4 text-orange-500" title={t('tools.clientAgreement.expiringSoon2', 'Expiring soon')} />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(agreement); }} className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(agreement.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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
          {selectedAgreement ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedAgreement.clientName}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedAgreement.status)}`}>
                        {selectedAgreement.status}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedAgreement.matterNumber && `Matter #${selectedAgreement.matterNumber} - `}
                      {selectedAgreement.matterDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAgreement.status === 'draft' && (
                      <button
                        onClick={() => updateStatus(selectedAgreement, 'sent')}
                        className={buttonSecondary}
                      >
                        <Send className="w-4 h-4" /> Send
                      </button>
                    )}
                    {selectedAgreement.status === 'sent' && (
                      <button
                        onClick={() => updateStatus(selectedAgreement, 'signed')}
                        className={buttonSecondary}
                      >
                        <FileSignature className="w-4 h-4" /> Mark Signed
                      </button>
                    )}
                    {selectedAgreement.status === 'signed' && (
                      <button
                        onClick={() => updateStatus(selectedAgreement, 'active')}
                        className={buttonPrimary}
                      >
                        <CheckCircle className="w-4 h-4" /> Activate
                      </button>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setActiveTab('details')} className={tabClass(activeTab === 'details')}>
                    <Briefcase className="w-4 h-4 inline mr-1" /> Details
                  </button>
                  <button onClick={() => setActiveTab('payments')} className={tabClass(activeTab === 'payments')}>
                    <CreditCard className="w-4 h-4 inline mr-1" /> Payments ({selectedAgreement.payments.length})
                  </button>
                  <button onClick={() => setActiveTab('amendments')} className={tabClass(activeTab === 'amendments')}>
                    <FileEdit className="w-4 h-4 inline mr-1" /> Amendments ({selectedAgreement.amendments.length})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Agreement Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.clientAgreement.agreementType', 'Agreement Type')}</p>
                        <p className="font-medium capitalize">{selectedAgreement.agreementType.replace('-', ' ')}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.clientAgreement.billingFrequency', 'Billing Frequency')}</p>
                        <p className="font-medium capitalize">{selectedAgreement.billingFrequency.replace('-', ' ')}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.clientAgreement.effectiveDate', 'Effective Date')}</p>
                        <p className="font-medium">{selectedAgreement.effectiveDate || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.clientAgreement.expirationDate', 'Expiration Date')}</p>
                        <p className="font-medium">{selectedAgreement.expirationDate || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Fee Details */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        {t('tools.clientAgreement.feeArrangement', 'Fee Arrangement')}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedAgreement.hourlyRate && selectedAgreement.hourlyRate > 0 && (
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.clientAgreement.hourlyRate', 'Hourly Rate')}</p>
                            <p className="font-medium text-green-500">{formatCurrency(selectedAgreement.hourlyRate)}/hr</p>
                          </div>
                        )}
                        {selectedAgreement.flatFee && selectedAgreement.flatFee > 0 && (
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.clientAgreement.flatFee', 'Flat Fee')}</p>
                            <p className="font-medium text-green-500">{formatCurrency(selectedAgreement.flatFee)}</p>
                          </div>
                        )}
                        {selectedAgreement.contingencyPercentage && selectedAgreement.contingencyPercentage > 0 && (
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.clientAgreement.contingency2', 'Contingency')}</p>
                            <p className="font-medium text-purple-500">{selectedAgreement.contingencyPercentage}%</p>
                          </div>
                        )}
                        {selectedAgreement.retainerAmount && selectedAgreement.retainerAmount > 0 && (
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.clientAgreement.initialRetainer', 'Initial Retainer')}</p>
                            <p className="font-medium">{formatCurrency(selectedAgreement.retainerAmount)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Retainer Balance */}
                    <div className={`p-4 rounded-lg border ${isRetainerLow(selectedAgreement) ? 'border-red-500/30 bg-red-500/10' : theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <Wallet className={`w-4 h-4 ${isRetainerLow(selectedAgreement) ? 'text-red-500' : 'text-cyan-500'}`} />
                            {t('tools.clientAgreement.retainerBalance', 'Retainer Balance')}
                          </h3>
                          {selectedAgreement.minimumRetainer && selectedAgreement.minimumRetainer > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              Minimum required: {formatCurrency(selectedAgreement.minimumRetainer)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${isRetainerLow(selectedAgreement) ? 'text-red-500' : 'text-cyan-500'}`}>
                            {formatCurrency(selectedAgreement.retainerBalance)}
                          </p>
                          {isRetainerLow(selectedAgreement) && (
                            <p className="text-xs text-red-400 flex items-center gap-1 justify-end">
                              <AlertCircle className="w-3 h-3" /> Below minimum
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Client Contact */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-500" />
                        {t('tools.clientAgreement.clientContact', 'Client Contact')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">{t('tools.clientAgreement.email', 'Email')}</p>
                          <p className="font-medium">{selectedAgreement.clientEmail || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{t('tools.clientAgreement.phone', 'Phone')}</p>
                          <p className="font-medium">{selectedAgreement.clientPhone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{t('tools.clientAgreement.responsibleAttorney', 'Responsible Attorney')}</p>
                          <p className="font-medium">{selectedAgreement.responsibleAttorney || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Scope of Work */}
                    {selectedAgreement.scopeOfWork.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('tools.clientAgreement.scopeOfWork', 'Scope of Work')}</h3>
                        <ul className={`space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedAgreement.scopeOfWork.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Exclusions */}
                    {selectedAgreement.exclusions.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('tools.clientAgreement.exclusions', 'Exclusions')}</h3>
                        <ul className={`space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedAgreement.exclusions.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Signature Info */}
                    {selectedAgreement.signedDate && (
                      <div className={`p-4 rounded-lg border border-green-500/30 ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'}`}>
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-400">
                          <FileSignature className="w-4 h-4" />
                          {t('tools.clientAgreement.signatureInformation', 'Signature Information')}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.clientAgreement.signedDate', 'Signed Date')}</p>
                            <p className="font-medium">{selectedAgreement.signedDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">{t('tools.clientAgreement.signedBy', 'Signed By')}</p>
                            <p className="font-medium">{selectedAgreement.signedBy || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedAgreement.notes && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2">{t('tools.clientAgreement.notes', 'Notes')}</h3>
                        <p className="text-sm">{selectedAgreement.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <History className="w-4 h-4 text-cyan-500" />
                        {t('tools.clientAgreement.paymentHistory', 'Payment History')}
                      </h3>
                      <button onClick={() => setShowPaymentModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Record Payment
                      </button>
                    </div>

                    {selectedAgreement.payments.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientAgreement.noPaymentsRecorded', 'No payments recorded')}</p>
                    ) : (
                      <div className="space-y-3">
                        {[...selectedAgreement.payments].reverse().map(payment => (
                          <div key={payment.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{payment.date}</span>
                                <span className={`px-2 py-0.5 text-xs rounded ${
                                  payment.type === 'refund'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-green-500/20 text-green-400'
                                }`}>
                                  {payment.type}
                                </span>
                              </div>
                              <span className={`text-lg font-bold ${
                                payment.type === 'refund' ? 'text-red-500' : 'text-green-500'
                              }`}>
                                {payment.type === 'refund' ? '-' : '+'}{formatCurrency(payment.amount)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">{t('tools.clientAgreement.method', 'Method:')}</span>
                                <span className="capitalize">{payment.method.replace('-', ' ')}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">{t('tools.clientAgreement.reference', 'Reference:')}</span>
                                <span>{payment.reference || 'N/A'}</span>
                              </div>
                            </div>
                            {payment.notes && (
                              <p className="text-sm text-gray-400 mt-2">{payment.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'amendments' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileEdit className="w-4 h-4 text-cyan-500" />
                        {t('tools.clientAgreement.amendmentHistory', 'Amendment History')}
                      </h3>
                      <button onClick={() => setShowAmendmentModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Amendment
                      </button>
                    </div>

                    {selectedAgreement.amendments.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientAgreement.noAmendmentsRecorded', 'No amendments recorded')}</p>
                    ) : (
                      <div className="space-y-3">
                        {[...selectedAgreement.amendments].reverse().map(amendment => (
                          <div key={amendment.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Created: {amendment.date}</span>
                              {amendment.signedDate ? (
                                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">{t('tools.clientAgreement.signed', 'Signed')}</span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">{t('tools.clientAgreement.pending', 'Pending')}</span>
                              )}
                            </div>
                            <p className="text-sm mb-2">{amendment.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">{t('tools.clientAgreement.effective', 'Effective:')}</span>
                                <span>{amendment.effectiveDate}</span>
                              </div>
                              {amendment.signedDate && (
                                <div>
                                  <span className="text-gray-400">{t('tools.clientAgreement.signed2', 'Signed:')}</span>
                                  <span>{amendment.signedDate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileSignature className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.clientAgreement.selectAnAgreement', 'Select an agreement')}</p>
              <p className="text-sm">{t('tools.clientAgreement.chooseAnAgreementToView', 'Choose an agreement to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Agreement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-bold">{editingAgreement ? t('tools.clientAgreement.editAgreement', 'Edit Agreement') : t('tools.clientAgreement.newClientAgreement', 'New Client Agreement')}</h2>
              <button onClick={() => { setShowModal(false); setEditingAgreement(null); }} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Client Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-500" />
                  {t('tools.clientAgreement.clientInformation', 'Client Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.clientName', 'Client Name *')}</label>
                    <input type="text" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} className={inputClass} placeholder={t('tools.clientAgreement.clientOrCompanyName', 'Client or Company Name')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.clientId', 'Client ID')}</label>
                    <input type="text" value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className={inputClass} placeholder={t('tools.clientAgreement.optionalClientIdentifier', 'Optional client identifier')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.email2', 'Email')}</label>
                    <input type="email" value={formData.clientEmail} onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })} className={inputClass} placeholder={t('tools.clientAgreement.clientExampleCom', 'client@example.com')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.phone2', 'Phone')}</label>
                    <input type="tel" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} className={inputClass} placeholder="(555) 123-4567" />
                  </div>
                </div>
              </div>

              {/* Matter Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-500" />
                  {t('tools.clientAgreement.matterInformation', 'Matter Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.matterNumber', 'Matter Number')}</label>
                    <input type="text" value={formData.matterNumber} onChange={(e) => setFormData({ ...formData, matterNumber: e.target.value })} className={inputClass} placeholder="e.g., 2024-001" />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.responsibleAttorney2', 'Responsible Attorney')}</label>
                    <input type="text" value={formData.responsibleAttorney} onChange={(e) => setFormData({ ...formData, responsibleAttorney: e.target.value })} className={inputClass} placeholder={t('tools.clientAgreement.attorneyName', 'Attorney name')} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.clientAgreement.matterDescription', 'Matter Description *')}</label>
                    <textarea value={formData.matterDescription} onChange={(e) => setFormData({ ...formData, matterDescription: e.target.value })} className={inputClass} rows={2} placeholder={t('tools.clientAgreement.briefDescriptionOfTheLegal', 'Brief description of the legal matter')} />
                  </div>
                </div>
              </div>

              {/* Fee Arrangement */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-cyan-500" />
                  {t('tools.clientAgreement.feeArrangement2', 'Fee Arrangement')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.agreementType2', 'Agreement Type *')}</label>
                    <select value={formData.agreementType} onChange={(e) => setFormData({ ...formData, agreementType: e.target.value as ClientAgreement['agreementType'] })} className={inputClass}>
                      {agreementTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.billingFrequency2', 'Billing Frequency')}</label>
                    <select value={formData.billingFrequency} onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value as ClientAgreement['billingFrequency'] })} className={inputClass}>
                      {billingFrequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  {(formData.agreementType === 'hourly' || formData.agreementType === 'hybrid') && (
                    <div>
                      <label className={labelClass}>{t('tools.clientAgreement.hourlyRate2', 'Hourly Rate ($)')}</label>
                      <input type="number" min="0" step="0.01" value={formData.hourlyRate || ''} onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="350.00" />
                    </div>
                  )}
                  {(formData.agreementType === 'flat-fee' || formData.agreementType === 'hybrid') && (
                    <div>
                      <label className={labelClass}>{t('tools.clientAgreement.flatFee2', 'Flat Fee ($)')}</label>
                      <input type="number" min="0" step="0.01" value={formData.flatFee || ''} onChange={(e) => setFormData({ ...formData, flatFee: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="5000.00" />
                    </div>
                  )}
                  {(formData.agreementType === 'contingency' || formData.agreementType === 'hybrid') && (
                    <div>
                      <label className={labelClass}>{t('tools.clientAgreement.contingency3', 'Contingency (%)')}</label>
                      <input type="number" min="0" max="100" step="0.1" value={formData.contingencyPercentage || ''} onChange={(e) => setFormData({ ...formData, contingencyPercentage: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="33.3" />
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.initialRetainer2', 'Initial Retainer ($)')}</label>
                    <input type="number" min="0" step="0.01" value={formData.retainerAmount || ''} onChange={(e) => setFormData({ ...formData, retainerAmount: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="5000.00" />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.minimumRetainer', 'Minimum Retainer ($)')}</label>
                    <input type="number" min="0" step="0.01" value={formData.minimumRetainer || ''} onChange={(e) => setFormData({ ...formData, minimumRetainer: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="1000.00" />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.paymentTermsDays', 'Payment Terms (Days)')}</label>
                    <input type="number" min="1" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: parseInt(e.target.value) || 30 })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Dates & Status */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                  {t('tools.clientAgreement.datesStatus', 'Dates & Status')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.effectiveDate2', 'Effective Date')}</label>
                    <input type="date" value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.expirationDate2', 'Expiration Date')}</label>
                    <input type="date" value={formData.expirationDate || ''} onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.status', 'Status')}</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientAgreement['status'] })} className={inputClass}>
                      {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.clientAgreement.signedDate2', 'Signed Date')}</label>
                    <input type="date" value={formData.signedDate || ''} onChange={(e) => setFormData({ ...formData, signedDate: e.target.value })} className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.clientAgreement.signedBy2', 'Signed By')}</label>
                    <input type="text" value={formData.signedBy || ''} onChange={(e) => setFormData({ ...formData, signedBy: e.target.value })} className={inputClass} placeholder={t('tools.clientAgreement.nameOfPersonWhoSigned', 'Name of person who signed')} />
                  </div>
                </div>
              </div>

              {/* Scope of Work */}
              <div>
                <label className={labelClass}>{t('tools.clientAgreement.scopeOfWork2', 'Scope of Work')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newScopeItem} onChange={(e) => setNewScopeItem(e.target.value)} placeholder={t('tools.clientAgreement.addScopeItem', 'Add scope item')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addScopeItem())} />
                  <button type="button" onClick={addScopeItem} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonScopeItems.filter(s => !formData.scopeOfWork.includes(s)).slice(0, 5).map(s => (
                    <button key={s} type="button" onClick={() => setFormData({ ...formData, scopeOfWork: [...formData.scopeOfWork, s] })} className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      + {s}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.scopeOfWork.map((s, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                      {s} <button onClick={() => removeScopeItem(s)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              <div>
                <label className={labelClass}>{t('tools.clientAgreement.exclusions2', 'Exclusions')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)} placeholder={t('tools.clientAgreement.addExclusion', 'Add exclusion')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusionItem())} />
                  <button type="button" onClick={addExclusionItem} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonExclusions.filter(e => !formData.exclusions.includes(e)).slice(0, 5).map(e => (
                    <button key={e} type="button" onClick={() => setFormData({ ...formData, exclusions: [...formData.exclusions, e] })} className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      + {e}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.exclusions.map((e, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                      {e} <button onClick={() => removeExclusionItem(e)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('tools.clientAgreement.notes2', 'Notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} placeholder={t('tools.clientAgreement.additionalNotesAboutTheAgreement', 'Additional notes about the agreement')} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingAgreement(null); }} className={buttonSecondary}>{t('tools.clientAgreement.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.clientName || !formData.matterDescription} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save Agreement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedAgreement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.clientAgreement.recordPayment', 'Record Payment')}</h2>
              <button onClick={() => setShowPaymentModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.clientAgreement.date', 'Date')}</label>
                  <input type="date" value={newPayment.date} onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clientAgreement.amount', 'Amount ($)')}</label>
                  <input type="number" min="0" step="0.01" value={newPayment.amount || ''} onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="0.00" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clientAgreement.type', 'Type')}</label>
                  <select value={newPayment.type} onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value as PaymentRecord['type'] })} className={inputClass}>
                    <option value="retainer">{t('tools.clientAgreement.retainerDeposit', 'Retainer Deposit')}</option>
                    <option value="payment">{t('tools.clientAgreement.payment', 'Payment')}</option>
                    <option value="refund">{t('tools.clientAgreement.refund', 'Refund')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clientAgreement.method2', 'Method')}</label>
                  <select value={newPayment.method} onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as PaymentRecord['method'] })} className={inputClass}>
                    {paymentMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.clientAgreement.referenceNumber', 'Reference Number')}</label>
                <input type="text" value={newPayment.reference} onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })} className={inputClass} placeholder={t('tools.clientAgreement.checkConfirmationCodeEtc', 'Check #, confirmation code, etc.')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.clientAgreement.notes3', 'Notes')}</label>
                <textarea value={newPayment.notes} onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowPaymentModal(false)} className={buttonSecondary}>{t('tools.clientAgreement.cancel2', 'Cancel')}</button>
                <button type="button" onClick={savePayment} disabled={!newPayment.amount} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.clientAgreement.savePayment', 'Save Payment')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amendment Modal */}
      {showAmendmentModal && selectedAgreement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.clientAgreement.addAmendment', 'Add Amendment')}</h2>
              <button onClick={() => setShowAmendmentModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.clientAgreement.createdDate', 'Created Date')}</label>
                  <input type="date" value={newAmendment.date} onChange={(e) => setNewAmendment({ ...newAmendment, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.clientAgreement.effectiveDate3', 'Effective Date')}</label>
                  <input type="date" value={newAmendment.effectiveDate} onChange={(e) => setNewAmendment({ ...newAmendment, effectiveDate: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.clientAgreement.description', 'Description *')}</label>
                <textarea value={newAmendment.description} onChange={(e) => setNewAmendment({ ...newAmendment, description: e.target.value })} className={inputClass} rows={3} placeholder={t('tools.clientAgreement.describeTheAmendment', 'Describe the amendment')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.clientAgreement.signedDateIfApplicable', 'Signed Date (if applicable)')}</label>
                <input type="date" value={newAmendment.signedDate || ''} onChange={(e) => setNewAmendment({ ...newAmendment, signedDate: e.target.value })} className={inputClass} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowAmendmentModal(false)} className={buttonSecondary}>{t('tools.clientAgreement.cancel3', 'Cancel')}</button>
                <button type="button" onClick={saveAmendment} disabled={!newAmendment.description.trim()} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.clientAgreement.saveAmendment', 'Save Amendment')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.clientAgreement.aboutClientAgreementManager', 'About Client Agreement Manager')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage legal client engagement agreements, fee arrangements, and retainer tracking. Create and track hourly, flat fee,
          contingency, hybrid, and retainer agreements. Record payments, monitor retainer balances, track amendments, and
          receive alerts for expiring agreements and low retainer balances.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default ClientAgreementTool;
