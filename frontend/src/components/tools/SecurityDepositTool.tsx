'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  Home,
  DollarSign,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Percent,
  Building,
  ArrowRight,
  Receipt,
  MessageSquare,
  Camera,
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
interface ConditionItem {
  id: string;
  area: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  notes: string;
  photos?: string[];
}

interface Deduction {
  id: string;
  description: string;
  amount: number;
  category: 'cleaning' | 'repair' | 'damage' | 'unpaid_rent' | 'other';
  photos?: string[];
  approved: boolean;
  disputeNotes?: string;
}

interface SecurityDeposit {
  id: string;
  // Tenant Info
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  // Property Info
  propertyAddress: string;
  unitNumber: string;
  // Deposit Details
  depositAmount: number;
  collectionDate: string;
  leaseStartDate: string;
  leaseEndDate: string;
  // Interest (if applicable)
  interestRate: number;
  accruedInterest: number;
  // Status
  status: 'held' | 'pending_inspection' | 'processing_refund' | 'refunded' | 'disputed' | 'forfeited';
  // Move-in/Move-out
  moveInCondition: ConditionItem[];
  moveOutCondition: ConditionItem[];
  moveInDate: string;
  moveOutDate: string;
  // Deductions
  deductions: Deduction[];
  totalDeductions: number;
  refundAmount: number;
  // Refund Tracking
  refundDate: string;
  refundMethod: 'check' | 'bank_transfer' | 'cash' | 'pending';
  refundCheckNumber?: string;
  // Dispute Resolution
  hasDispute: boolean;
  disputeStatus: 'none' | 'filed' | 'under_review' | 'resolved' | 'escalated';
  disputeNotes: string;
  disputeResolutionDate?: string;
  // Notes
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface SecurityDepositToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'security-deposit';

const depositColumns: ColumnConfig[] = [
  { key: 'tenantName', header: 'Tenant Name', type: 'string' },
  { key: 'propertyAddress', header: 'Property', type: 'string' },
  { key: 'depositAmount', header: 'Deposit', type: 'number' },
  { key: 'collectionDate', header: 'Collected', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'refundAmount', header: 'Refund', type: 'number' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const conditionAreas = [
  'Living Room', 'Kitchen', 'Bathroom', 'Master Bedroom', 'Bedroom 2', 'Bedroom 3',
  'Dining Room', 'Garage', 'Patio/Balcony', 'Laundry Room', 'Hallway', 'Closets',
  'Windows', 'Doors', 'Flooring', 'Walls', 'Ceiling', 'Appliances', 'HVAC', 'Plumbing',
];

const deductionCategories = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'repair', label: 'Repairs' },
  { value: 'damage', label: 'Damage' },
  { value: 'unpaid_rent', label: 'Unpaid Rent' },
  { value: 'other', label: 'Other' },
];

const createNewDeposit = (): SecurityDeposit => ({
  id: crypto.randomUUID(),
  tenantName: '',
  tenantEmail: '',
  tenantPhone: '',
  propertyAddress: '',
  unitNumber: '',
  depositAmount: 0,
  collectionDate: new Date().toISOString().split('T')[0],
  leaseStartDate: '',
  leaseEndDate: '',
  interestRate: 0,
  accruedInterest: 0,
  status: 'held',
  moveInCondition: [],
  moveOutCondition: [],
  moveInDate: '',
  moveOutDate: '',
  deductions: [],
  totalDeductions: 0,
  refundAmount: 0,
  refundDate: '',
  refundMethod: 'pending',
  hasDispute: false,
  disputeStatus: 'none',
  disputeNotes: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const SecurityDepositTool: React.FC<SecurityDepositToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: deposits,
    addItem: addDeposit,
    updateItem: updateDeposit,
    deleteItem: deleteDeposit,
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
  } = useToolData<SecurityDeposit>(TOOL_ID, [], depositColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [conditionType, setConditionType] = useState<'moveIn' | 'moveOut'>('moveIn');
  const [selectedDeposit, setSelectedDeposit] = useState<SecurityDeposit | null>(null);
  const [editingDeposit, setEditingDeposit] = useState<SecurityDeposit | null>(null);
  const [formData, setFormData] = useState<SecurityDeposit>(createNewDeposit());
  const [activeTab, setActiveTab] = useState<'details' | 'conditions' | 'deductions' | 'refund'>('details');

  const [newCondition, setNewCondition] = useState<Omit<ConditionItem, 'id'>>({
    area: '',
    condition: 'good',
    notes: '',
    photos: [],
  });

  const [newDeduction, setNewDeduction] = useState<Omit<Deduction, 'id'>>({
    description: '',
    amount: 0,
    category: 'cleaning',
    approved: false,
    photos: [],
  });

  // Statistics
  const stats = useMemo(() => {
    const held = deposits.filter(d => d.status === 'held');
    const pending = deposits.filter(d => d.status === 'pending_inspection' || d.status === 'processing_refund');
    const disputed = deposits.filter(d => d.status === 'disputed');
    const totalHeld = held.reduce((sum, d) => sum + d.depositAmount, 0);
    const totalRefunded = deposits.filter(d => d.status === 'refunded').reduce((sum, d) => sum + d.refundAmount, 0);
    return {
      total: deposits.length,
      held: held.length,
      pending: pending.length,
      disputed: disputed.length,
      totalHeld,
      totalRefunded,
    };
  }, [deposits]);

  // Filtered deposits
  const filteredDeposits = useMemo(() => {
    return deposits.filter(deposit => {
      const matchesSearch = searchQuery === '' ||
        deposit.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deposit.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || deposit.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [deposits, searchQuery, filterStatus]);

  // Calculate interest
  const calculateInterest = (deposit: SecurityDeposit): number => {
    if (deposit.interestRate <= 0 || !deposit.collectionDate) return 0;
    const startDate = new Date(deposit.collectionDate);
    const endDate = deposit.moveOutDate ? new Date(deposit.moveOutDate) : new Date();
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const yearlyInterest = (deposit.depositAmount * deposit.interestRate) / 100;
    return Number(((yearlyInterest / 365) * daysDiff).toFixed(2));
  };

  // Calculate refund amount
  const calculateRefund = (deposit: SecurityDeposit): number => {
    const interest = calculateInterest(deposit);
    const totalDeductions = deposit.deductions.reduce((sum, d) => sum + d.amount, 0);
    return Math.max(0, deposit.depositAmount + interest - totalDeductions);
  };

  const handleSave = () => {
    const interest = calculateInterest(formData);
    const totalDeductions = formData.deductions.reduce((sum, d) => sum + d.amount, 0);
    const refundAmount = Math.max(0, formData.depositAmount + interest - totalDeductions);

    const updatedData = {
      ...formData,
      accruedInterest: interest,
      totalDeductions,
      refundAmount,
      updatedAt: new Date().toISOString(),
    };

    if (editingDeposit) {
      updateDeposit(formData.id, updatedData);
    } else {
      addDeposit({ ...updatedData, createdAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingDeposit(null);
    setFormData(createNewDeposit());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this security deposit record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteDeposit(id);
      if (selectedDeposit?.id === id) setSelectedDeposit(null);
    }
  };

  const openEditModal = (deposit: SecurityDeposit) => {
    setEditingDeposit(deposit);
    setFormData(deposit);
    setShowModal(true);
  };

  const addConditionItem = () => {
    if (newCondition.area.trim()) {
      const condition: ConditionItem = { ...newCondition, id: crypto.randomUUID() };
      if (conditionType === 'moveIn') {
        setFormData({ ...formData, moveInCondition: [...formData.moveInCondition, condition] });
      } else {
        setFormData({ ...formData, moveOutCondition: [...formData.moveOutCondition, condition] });
      }
      setNewCondition({ area: '', condition: 'good', notes: '', photos: [] });
      setShowConditionModal(false);
    }
  };

  const removeConditionItem = (id: string, type: 'moveIn' | 'moveOut') => {
    if (type === 'moveIn') {
      setFormData({ ...formData, moveInCondition: formData.moveInCondition.filter(c => c.id !== id) });
    } else {
      setFormData({ ...formData, moveOutCondition: formData.moveOutCondition.filter(c => c.id !== id) });
    }
  };

  const addDeductionItem = () => {
    if (newDeduction.description.trim() && newDeduction.amount > 0) {
      const deduction: Deduction = { ...newDeduction, id: crypto.randomUUID() };
      setFormData({ ...formData, deductions: [...formData.deductions, deduction] });
      setNewDeduction({ description: '', amount: 0, category: 'cleaning', approved: false, photos: [] });
      setShowDeductionModal(false);
    }
  };

  const removeDeductionItem = (id: string) => {
    setFormData({ ...formData, deductions: formData.deductions.filter(d => d.id !== id) });
  };

  const toggleDeductionApproval = (id: string) => {
    setFormData({
      ...formData,
      deductions: formData.deductions.map(d =>
        d.id === id ? { ...d, approved: !d.approved } : d
      ),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'held': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending_inspection': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing_refund': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'refunded': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'disputed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'forfeited': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-500/20 text-green-400';
      case 'good': return 'bg-blue-500/20 text-blue-400';
      case 'fair': return 'bg-yellow-500/20 text-yellow-400';
      case 'poor': return 'bg-orange-500/20 text-orange-400';
      case 'damaged': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg font-medium transition-colors ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.securityDeposit.securityDepositTracker', 'Security Deposit Tracker')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.securityDeposit.trackAndManageRentalSecurity', 'Track and manage rental security deposits')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="security-deposit" toolName="Security Deposit" />

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
            onExportCSV={() => exportCSV({ filename: 'security-deposits' })}
            onExportExcel={() => exportExcel({ filename: 'security-deposits' })}
            onExportJSON={() => exportJSON({ filename: 'security-deposits' })}
            onExportPDF={() => exportPDF({ filename: 'security-deposits', title: 'Security Deposit Records' })}
            onPrint={() => print('Security Deposit Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={deposits.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewDeposit()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.securityDeposit.addDeposit', 'Add Deposit')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.securityDeposit.total', 'Total')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.securityDeposit.held', 'Held')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.held}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.securityDeposit.pending', 'Pending')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.securityDeposit.disputed', 'Disputed')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.disputed}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Building className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.securityDeposit.totalHeld', 'Total Held')}</p>
              <p className="text-xl font-bold text-purple-500">{formatCurrency(stats.totalHeld)}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.securityDeposit.refunded', 'Refunded')}</p>
              <p className="text-xl font-bold text-green-500">{formatCurrency(stats.totalRefunded)}</p>
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
              placeholder={t('tools.securityDeposit.searchTenantOrProperty', 'Search tenant or property...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-48`}>
            <option value="">{t('tools.securityDeposit.allStatus', 'All Status')}</option>
            <option value="held">{t('tools.securityDeposit.held2', 'Held')}</option>
            <option value="pending_inspection">{t('tools.securityDeposit.pendingInspection', 'Pending Inspection')}</option>
            <option value="processing_refund">{t('tools.securityDeposit.processingRefund', 'Processing Refund')}</option>
            <option value="refunded">{t('tools.securityDeposit.refunded2', 'Refunded')}</option>
            <option value="disputed">{t('tools.securityDeposit.disputed2', 'Disputed')}</option>
            <option value="forfeited">{t('tools.securityDeposit.forfeited', 'Forfeited')}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposit List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.securityDeposit.depositRecords', 'Deposit Records')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredDeposits.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.securityDeposit.noDepositsRecorded', 'No deposits recorded')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredDeposits.map(deposit => (
                  <div
                    key={deposit.id}
                    onClick={() => setSelectedDeposit(deposit)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedDeposit?.id === deposit.id
                        ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                        : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <User className="w-4 h-4 text-cyan-500" />
                        </div>
                        <div>
                          <p className="font-medium">{deposit.tenantName}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {deposit.propertyAddress}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-cyan-500">
                              {formatCurrency(deposit.depositAmount)}
                            </span>
                            <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(deposit.status)}`}>
                              {formatStatus(deposit.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(deposit); }} className="p-1.5 hover:bg-gray-600 rounded">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(deposit.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedDeposit ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedDeposit.tenantName}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedDeposit.status)}`}>
                        {formatStatus(selectedDeposit.status)}
                      </span>
                      {selectedDeposit.hasDispute && (
                        <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">{t('tools.securityDeposit.dispute', 'Dispute')}</span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedDeposit.propertyAddress} {selectedDeposit.unitNumber && `- Unit ${selectedDeposit.unitNumber}`}
                    </p>
                  </div>
                  <button onClick={() => openEditModal(selectedDeposit)} className={buttonSecondary}>
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Financial Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.securityDeposit.depositAmount', 'Deposit Amount')}</p>
                    <p className="text-lg font-bold text-cyan-500">{formatCurrency(selectedDeposit.depositAmount)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.securityDeposit.accruedInterest', 'Accrued Interest')}</p>
                    <p className="text-lg font-bold text-green-500">+{formatCurrency(selectedDeposit.accruedInterest)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.securityDeposit.deductions', 'Deductions')}</p>
                    <p className="text-lg font-bold text-red-500">-{formatCurrency(selectedDeposit.totalDeductions)}</p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 border-cyan-500/30 ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                    <p className="text-xs text-cyan-400">{t('tools.securityDeposit.refundAmount', 'Refund Amount')}</p>
                    <p className="text-lg font-bold text-cyan-500">{formatCurrency(selectedDeposit.refundAmount)}</p>
                  </div>
                </div>

                {/* Dates Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.securityDeposit.collected', 'Collected')}</p>
                    <p className="font-medium">{selectedDeposit.collectionDate || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.securityDeposit.moveIn', 'Move-In')}</p>
                    <p className="font-medium">{selectedDeposit.moveInDate || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.securityDeposit.moveOut', 'Move-Out')}</p>
                    <p className="font-medium">{selectedDeposit.moveOutDate || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.securityDeposit.interestRate', 'Interest Rate')}</p>
                    <p className="font-medium">{selectedDeposit.interestRate}%</p>
                  </div>
                </div>

                {/* Tenant Contact */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-500" />
                    {t('tools.securityDeposit.tenantContact', 'Tenant Contact')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">{t('tools.securityDeposit.email', 'Email')}</p>
                      <p className="font-medium">{selectedDeposit.tenantEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('tools.securityDeposit.phone', 'Phone')}</p>
                      <p className="font-medium">{selectedDeposit.tenantPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Move-in/Move-out Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-green-500" />
                      Move-In Condition ({selectedDeposit.moveInCondition.length})
                    </h3>
                    {selectedDeposit.moveInCondition.length === 0 ? (
                      <p className="text-sm text-gray-400">{t('tools.securityDeposit.noConditionsRecorded', 'No conditions recorded')}</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedDeposit.moveInCondition.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span>{item.area}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${getConditionColor(item.condition)}`}>
                              {item.condition}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-red-500 rotate-180" />
                      Move-Out Condition ({selectedDeposit.moveOutCondition.length})
                    </h3>
                    {selectedDeposit.moveOutCondition.length === 0 ? (
                      <p className="text-sm text-gray-400">{t('tools.securityDeposit.noConditionsRecorded2', 'No conditions recorded')}</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedDeposit.moveOutCondition.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span>{item.area}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${getConditionColor(item.condition)}`}>
                              {item.condition}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-orange-500" />
                    Deductions ({selectedDeposit.deductions.length})
                  </h3>
                  {selectedDeposit.deductions.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.securityDeposit.noDeductions', 'No deductions')}</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDeposit.deductions.map(deduction => (
                        <div key={deduction.id} className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div>
                            <p className="font-medium">{deduction.description}</p>
                            <p className="text-xs text-gray-400 capitalize">{deduction.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-500">-{formatCurrency(deduction.amount)}</span>
                            {deduction.approved ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dispute Info */}
                {selectedDeposit.hasDispute && (
                  <div className={`p-4 rounded-lg border border-red-500/30 ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-400">
                      <MessageSquare className="w-4 h-4" />
                      {t('tools.securityDeposit.disputeInformation', 'Dispute Information')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-gray-400">{t('tools.securityDeposit.status', 'Status')}</p>
                        <p className="font-medium capitalize">{selectedDeposit.disputeStatus.replace('_', ' ')}</p>
                      </div>
                      {selectedDeposit.disputeResolutionDate && (
                        <div>
                          <p className="text-xs text-gray-400">{t('tools.securityDeposit.resolutionDate', 'Resolution Date')}</p>
                          <p className="font-medium">{selectedDeposit.disputeResolutionDate}</p>
                        </div>
                      )}
                    </div>
                    {selectedDeposit.disputeNotes && (
                      <p className="text-sm mt-2">{selectedDeposit.disputeNotes}</p>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedDeposit.notes && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2">{t('tools.securityDeposit.notes', 'Notes')}</h3>
                    <p className="text-sm">{selectedDeposit.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <ShieldCheck className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.securityDeposit.selectADepositRecord', 'Select a deposit record')}</p>
              <p className="text-sm">{t('tools.securityDeposit.chooseADepositToView', 'Choose a deposit to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} z-10`}>
              <h2 className="text-xl font-bold">{editingDeposit ? t('tools.securityDeposit.editDeposit', 'Edit Deposit') : t('tools.securityDeposit.addDeposit2', 'Add Deposit')}</h2>
              <button onClick={() => { setShowModal(false); setEditingDeposit(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex gap-2`}>
              <button className={tabClass(activeTab === 'details')} onClick={() => setActiveTab('details')}>
                <FileText className="w-4 h-4 inline mr-2" />Details
              </button>
              <button className={tabClass(activeTab === 'conditions')} onClick={() => setActiveTab('conditions')}>
                <Camera className="w-4 h-4 inline mr-2" />Conditions
              </button>
              <button className={tabClass(activeTab === 'deductions')} onClick={() => setActiveTab('deductions')}>
                <Receipt className="w-4 h-4 inline mr-2" />Deductions
              </button>
              <button className={tabClass(activeTab === 'refund')} onClick={() => setActiveTab('refund')}>
                <DollarSign className="w-4 h-4 inline mr-2" />Refund
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.tenantName', 'Tenant Name *')}</label>
                      <input type="text" value={formData.tenantName} onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.email2', 'Email')}</label>
                      <input type="email" value={formData.tenantEmail} onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.phone2', 'Phone')}</label>
                      <input type="tel" value={formData.tenantPhone} onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className={labelClass}>{t('tools.securityDeposit.propertyAddress', 'Property Address *')}</label>
                      <input type="text" value={formData.propertyAddress} onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.unitNumber', 'Unit Number')}</label>
                      <input type="text" value={formData.unitNumber} onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.depositAmount2', 'Deposit Amount *')}</label>
                      <input type="number" value={formData.depositAmount} onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })} className={inputClass} min="0" step="0.01" />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.collectionDate', 'Collection Date')}</label>
                      <input type="date" value={formData.collectionDate} onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.interestRate2', 'Interest Rate (%)')}</label>
                      <input type="number" value={formData.interestRate} onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })} className={inputClass} min="0" step="0.01" />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.status2', 'Status')}</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                        <option value="held">{t('tools.securityDeposit.held3', 'Held')}</option>
                        <option value="pending_inspection">{t('tools.securityDeposit.pendingInspection2', 'Pending Inspection')}</option>
                        <option value="processing_refund">{t('tools.securityDeposit.processingRefund2', 'Processing Refund')}</option>
                        <option value="refunded">{t('tools.securityDeposit.refunded3', 'Refunded')}</option>
                        <option value="disputed">{t('tools.securityDeposit.disputed3', 'Disputed')}</option>
                        <option value="forfeited">{t('tools.securityDeposit.forfeited2', 'Forfeited')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.leaseStart', 'Lease Start')}</label>
                      <input type="date" value={formData.leaseStartDate} onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.leaseEnd', 'Lease End')}</label>
                      <input type="date" value={formData.leaseEndDate} onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.moveInDate', 'Move-In Date')}</label>
                      <input type="date" value={formData.moveInDate} onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.moveOutDate', 'Move-Out Date')}</label>
                      <input type="date" value={formData.moveOutDate} onChange={(e) => setFormData({ ...formData, moveOutDate: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.securityDeposit.notes2', 'Notes')}</label>
                    <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} />
                  </div>
                </>
              )}

              {/* Conditions Tab */}
              {activeTab === 'conditions' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Move-In Conditions */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-green-500" />
                          {t('tools.securityDeposit.moveInCondition', 'Move-In Condition')}
                        </h3>
                        <button onClick={() => { setConditionType('moveIn'); setShowConditionModal(true); }} className={buttonSecondary}>
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {formData.moveInCondition.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">{t('tools.securityDeposit.noConditionsRecorded3', 'No conditions recorded')}</p>
                        ) : (
                          formData.moveInCondition.map(item => (
                            <div key={item.id} className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <div>
                                <p className="font-medium">{item.area}</p>
                                <span className={`px-2 py-0.5 rounded text-xs ${getConditionColor(item.condition)}`}>
                                  {item.condition}
                                </span>
                              </div>
                              <button onClick={() => removeConditionItem(item.id, 'moveIn')} className="p-1 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Move-Out Conditions */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-red-500 rotate-180" />
                          {t('tools.securityDeposit.moveOutCondition', 'Move-Out Condition')}
                        </h3>
                        <button onClick={() => { setConditionType('moveOut'); setShowConditionModal(true); }} className={buttonSecondary}>
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {formData.moveOutCondition.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">{t('tools.securityDeposit.noConditionsRecorded4', 'No conditions recorded')}</p>
                        ) : (
                          formData.moveOutCondition.map(item => (
                            <div key={item.id} className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <div>
                                <p className="font-medium">{item.area}</p>
                                <span className={`px-2 py-0.5 rounded text-xs ${getConditionColor(item.condition)}`}>
                                  {item.condition}
                                </span>
                              </div>
                              <button onClick={() => removeConditionItem(item.id, 'moveOut')} className="p-1 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Deductions Tab */}
              {activeTab === 'deductions' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{t('tools.securityDeposit.deductions2', 'Deductions')}</h3>
                    <button onClick={() => setShowDeductionModal(true)} className={buttonSecondary}>
                      <Plus className="w-4 h-4" /> Add Deduction
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.deductions.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">{t('tools.securityDeposit.noDeductionsRecorded', 'No deductions recorded')}</p>
                    ) : (
                      formData.deductions.map(deduction => (
                        <div key={deduction.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{deduction.description}</p>
                              <p className="text-xs text-gray-400 capitalize">{deduction.category}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-red-500">-{formatCurrency(deduction.amount)}</span>
                              <button
                                onClick={() => toggleDeductionApproval(deduction.id)}
                                className={`p-2 rounded ${deduction.approved ? 'bg-green-500/20' : 'bg-gray-600'}`}
                              >
                                {deduction.approved ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                              <button onClick={() => removeDeductionItem(deduction.id)} className="p-2 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className={`mt-4 p-4 rounded-lg border-2 border-cyan-500/30 ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t('tools.securityDeposit.totalDeductions', 'Total Deductions')}</span>
                      <span className="text-xl font-bold text-red-500">
                        -{formatCurrency(formData.deductions.reduce((sum, d) => sum + d.amount, 0))}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Refund Tab */}
              {activeTab === 'refund' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.refundMethod', 'Refund Method')}</label>
                      <select value={formData.refundMethod} onChange={(e) => setFormData({ ...formData, refundMethod: e.target.value as any })} className={inputClass}>
                        <option value="pending">{t('tools.securityDeposit.pending2', 'Pending')}</option>
                        <option value="check">{t('tools.securityDeposit.check', 'Check')}</option>
                        <option value="bank_transfer">{t('tools.securityDeposit.bankTransfer', 'Bank Transfer')}</option>
                        <option value="cash">{t('tools.securityDeposit.cash', 'Cash')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.refundDate', 'Refund Date')}</label>
                      <input type="date" value={formData.refundDate} onChange={(e) => setFormData({ ...formData, refundDate: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  {formData.refundMethod === 'check' && (
                    <div>
                      <label className={labelClass}>{t('tools.securityDeposit.checkNumber', 'Check Number')}</label>
                      <input type="text" value={formData.refundCheckNumber || ''} onChange={(e) => setFormData({ ...formData, refundCheckNumber: e.target.value })} className={inputClass} />
                    </div>
                  )}

                  {/* Dispute Section */}
                  <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="hasDispute"
                        checked={formData.hasDispute}
                        onChange={(e) => setFormData({ ...formData, hasDispute: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="hasDispute" className="font-medium">{t('tools.securityDeposit.tenantHasFiledADispute', 'Tenant has filed a dispute')}</label>
                    </div>
                    {formData.hasDispute && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>{t('tools.securityDeposit.disputeStatus', 'Dispute Status')}</label>
                            <select value={formData.disputeStatus} onChange={(e) => setFormData({ ...formData, disputeStatus: e.target.value as any })} className={inputClass}>
                              <option value="filed">{t('tools.securityDeposit.filed', 'Filed')}</option>
                              <option value="under_review">{t('tools.securityDeposit.underReview', 'Under Review')}</option>
                              <option value="resolved">{t('tools.securityDeposit.resolved', 'Resolved')}</option>
                              <option value="escalated">{t('tools.securityDeposit.escalated', 'Escalated')}</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.securityDeposit.resolutionDate2', 'Resolution Date')}</label>
                            <input type="date" value={formData.disputeResolutionDate || ''} onChange={(e) => setFormData({ ...formData, disputeResolutionDate: e.target.value })} className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.securityDeposit.disputeNotes', 'Dispute Notes')}</label>
                          <textarea value={formData.disputeNotes} onChange={(e) => setFormData({ ...formData, disputeNotes: e.target.value })} className={inputClass} rows={3} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Refund Summary */}
                  <div className={`p-4 rounded-lg border-2 border-cyan-500/30 ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                    <h3 className="font-semibold mb-4">{t('tools.securityDeposit.refundCalculation', 'Refund Calculation')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t('tools.securityDeposit.originalDeposit', 'Original Deposit')}</span>
                        <span className="font-medium">{formatCurrency(formData.depositAmount)}</span>
                      </div>
                      <div className="flex justify-between text-green-500">
                        <span>+ Accrued Interest ({formData.interestRate}%)</span>
                        <span className="font-medium">+{formatCurrency(calculateInterest(formData))}</span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span>- Total Deductions</span>
                        <span className="font-medium">-{formatCurrency(formData.deductions.reduce((sum, d) => sum + d.amount, 0))}</span>
                      </div>
                      <div className={`border-t pt-2 mt-2 flex justify-between text-lg font-bold ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                        <span>{t('tools.securityDeposit.refundAmount2', 'Refund Amount')}</span>
                        <span className="text-cyan-500">{formatCurrency(calculateRefund(formData))}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingDeposit(null); }} className={buttonSecondary}>{t('tools.securityDeposit.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.tenantName || !formData.propertyAddress || formData.depositAmount <= 0} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Condition Modal */}
      {showConditionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className={`${cardClass} w-full max-w-md`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">Add {conditionType === 'moveIn' ? t('tools.securityDeposit.moveIn2', 'Move-In') : t('tools.securityDeposit.moveOut2', 'Move-Out')} Condition</h2>
              <button onClick={() => setShowConditionModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.securityDeposit.area', 'Area *')}</label>
                <select value={newCondition.area} onChange={(e) => setNewCondition({ ...newCondition, area: e.target.value })} className={inputClass}>
                  <option value="">{t('tools.securityDeposit.selectArea', 'Select area...')}</option>
                  {conditionAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.securityDeposit.condition', 'Condition')}</label>
                <select value={newCondition.condition} onChange={(e) => setNewCondition({ ...newCondition, condition: e.target.value as any })} className={inputClass}>
                  <option value="excellent">{t('tools.securityDeposit.excellent', 'Excellent')}</option>
                  <option value="good">{t('tools.securityDeposit.good', 'Good')}</option>
                  <option value="fair">{t('tools.securityDeposit.fair', 'Fair')}</option>
                  <option value="poor">{t('tools.securityDeposit.poor', 'Poor')}</option>
                  <option value="damaged">{t('tools.securityDeposit.damaged', 'Damaged')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.securityDeposit.notes3', 'Notes')}</label>
                <textarea value={newCondition.notes} onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })} className={inputClass} rows={3} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowConditionModal(false)} className={buttonSecondary}>{t('tools.securityDeposit.cancel2', 'Cancel')}</button>
                <button type="button" onClick={addConditionItem} disabled={!newCondition.area} className={buttonPrimary}>
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deduction Modal */}
      {showDeductionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className={`${cardClass} w-full max-w-md`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.securityDeposit.addDeduction', 'Add Deduction')}</h2>
              <button onClick={() => setShowDeductionModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.securityDeposit.description', 'Description *')}</label>
                <input type="text" value={newDeduction.description} onChange={(e) => setNewDeduction({ ...newDeduction, description: e.target.value })} className={inputClass} placeholder={t('tools.securityDeposit.eGWallRepairIn', 'e.g., Wall repair in living room')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.securityDeposit.amount', 'Amount *')}</label>
                  <input type="number" value={newDeduction.amount} onChange={(e) => setNewDeduction({ ...newDeduction, amount: Number(e.target.value) })} className={inputClass} min="0" step="0.01" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.securityDeposit.category', 'Category')}</label>
                  <select value={newDeduction.category} onChange={(e) => setNewDeduction({ ...newDeduction, category: e.target.value as any })} className={inputClass}>
                    {deductionCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="deductionApproved" checked={newDeduction.approved} onChange={(e) => setNewDeduction({ ...newDeduction, approved: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="deductionApproved" className={labelClass}>{t('tools.securityDeposit.preApproved', 'Pre-approved')}</label>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowDeductionModal(false)} className={buttonSecondary}>{t('tools.securityDeposit.cancel3', 'Cancel')}</button>
                <button type="button" onClick={addDeductionItem} disabled={!newDeduction.description || newDeduction.amount <= 0} className={buttonPrimary}>
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.securityDeposit.aboutSecurityDepositTracker', 'About Security Deposit Tracker')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage rental security deposits with complete tracking of tenant information, property conditions,
          deductions, interest calculations, and refund processing. Document move-in/move-out conditions,
          handle disputes, and maintain accurate financial records for each deposit.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default SecurityDepositTool;
