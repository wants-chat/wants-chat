'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
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
  FileText,
  User,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  FileCheck,
  CreditCard,
  History,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';

// Types
interface BeneficiaryInfo {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'cash' | 'check' | 'card' | 'bank_transfer' | 'insurance';
  referenceNumber: string;
  notes: string;
}

interface ServiceSelection {
  id: string;
  category: string;
  item: string;
  description: string;
  price: number;
  quantity: number;
  selected: boolean;
}

interface PreNeedContract {
  id: string;
  contractNumber: string;
  status: 'active' | 'paid_in_full' | 'cancelled' | 'transferred' | 'at_need';
  createdAt: string;
  updatedAt: string;
  // Purchaser Information
  purchaser: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    socialSecurityNumber: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  // Beneficiary (if different from purchaser)
  isSelfBeneficiary: boolean;
  beneficiary: BeneficiaryInfo;
  // Contract Terms
  contractDate: string;
  planType: 'guaranteed' | 'non_guaranteed' | 'trust_funded' | 'insurance_funded';
  paymentPlan: 'single' | 'monthly' | 'quarterly' | 'annual';
  totalAmount: number;
  downPayment: number;
  monthlyPayment: number;
  paymentTermMonths: number;
  interestRate: number;
  // Financial Tracking
  totalPaid: number;
  remainingBalance: number;
  nextPaymentDate: string;
  payments: PaymentRecord[];
  // Service Selections
  serviceSelections: ServiceSelection[];
  // Additional Info
  specialInstructions: string;
  notes: string;
}

// Column configuration for export
const contractColumns: ColumnConfig[] = [
  { key: 'contractNumber', header: 'Contract #', type: 'string' },
  { key: 'purchaserName', header: 'Purchaser', type: 'string' },
  { key: 'beneficiaryName', header: 'Beneficiary', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'planType', header: 'Plan Type', type: 'string' },
  { key: 'totalAmount', header: 'Total Amount', type: 'currency' },
  { key: 'totalPaid', header: 'Total Paid', type: 'currency' },
  { key: 'remainingBalance', header: 'Balance', type: 'currency' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
  paid_in_full: { label: 'Paid in Full', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: FileCheck },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: AlertCircle },
  transferred: { label: 'Transferred', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: History },
  at_need: { label: 'At-Need', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Clock },
};

const planTypeLabels = {
  guaranteed: 'Guaranteed Price',
  non_guaranteed: 'Non-Guaranteed',
  trust_funded: 'Trust Funded',
  insurance_funded: 'Insurance Funded',
};

const paymentPlanLabels = {
  single: 'Single Payment',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

const defaultServiceSelections: ServiceSelection[] = [
  { id: '1', category: 'Professional Services', item: 'Basic Services', description: 'Funeral director services', price: 2500, quantity: 1, selected: true },
  { id: '2', category: 'Facility', item: 'Viewing Room', description: 'Use of viewing facilities', price: 500, quantity: 1, selected: true },
  { id: '3', category: 'Facility', item: 'Ceremony Room', description: 'Use of ceremony facilities', price: 600, quantity: 1, selected: true },
  { id: '4', category: 'Transportation', item: 'Transfer of Remains', description: 'Transfer to funeral home', price: 400, quantity: 1, selected: true },
  { id: '5', category: 'Transportation', item: 'Hearse', description: 'Hearse service', price: 350, quantity: 1, selected: true },
  { id: '6', category: 'Preparation', item: 'Embalming', description: 'Embalming services', price: 800, quantity: 1, selected: true },
  { id: '7', category: 'Merchandise', item: 'Casket', description: 'Standard casket selection', price: 3000, quantity: 1, selected: false },
  { id: '8', category: 'Merchandise', item: 'Vault', description: 'Outer burial container', price: 1200, quantity: 1, selected: false },
  { id: '9', category: 'Memorial', item: 'Memorial Package', description: 'Programs, cards, register book', price: 250, quantity: 1, selected: true },
];

const generateContractNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `PN-${year}-${random}`;
};

const createEmptyContract = (): PreNeedContract => ({
  id: crypto.randomUUID(),
  contractNumber: generateContractNumber(),
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  purchaser: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    socialSecurityNumber: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  },
  isSelfBeneficiary: true,
  beneficiary: {
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
  },
  contractDate: new Date().toISOString().split('T')[0],
  planType: 'guaranteed',
  paymentPlan: 'monthly',
  totalAmount: 0,
  downPayment: 0,
  monthlyPayment: 0,
  paymentTermMonths: 60,
  interestRate: 0,
  totalPaid: 0,
  remainingBalance: 0,
  nextPaymentDate: '',
  payments: [],
  serviceSelections: defaultServiceSelections.map(s => ({ ...s, id: crypto.randomUUID() })),
  specialInstructions: '',
  notes: '',
});

interface PreNeedContractToolProps {
  uiConfig?: UIConfig;
}

export const PreNeedContractTool: React.FC<PreNeedContractToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'details' | 'services' | 'payments' | 'documents'>('details');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Initialize useToolData hook for backend persistence
  const {
    data: contracts,
    updateItem,
    addItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<PreNeedContract>(
    'pre-need-contracts',
    [],
    contractColumns,
    { autoSave: true }
  );

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.firstName || params.lastName || params.name) {
        const newContract = createEmptyContract();
        if (params.name) {
          const nameParts = params.name.split(' ');
          newContract.purchaser.firstName = nameParts[0] || '';
          newContract.purchaser.lastName = nameParts.slice(1).join(' ') || '';
        } else {
          newContract.purchaser.firstName = params.firstName || '';
          newContract.purchaser.lastName = params.lastName || '';
        }
        if (params.phone) newContract.purchaser.phone = params.phone;
        if (params.email) newContract.purchaser.email = params.email;
        addItem(newContract);
        setSelectedContractId(newContract.id);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesSearch = searchTerm === '' ||
        c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${c.purchaser.firstName} ${c.purchaser.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchTerm, statusFilter]);

  const selectedContract = contracts.find(c => c.id === selectedContractId);

  // Contract operations
  const handleCreateContract = () => {
    const newContract = createEmptyContract();
    addItem(newContract);
    setSelectedContractId(newContract.id);
  };

  const handleUpdateContract = (updates: Partial<PreNeedContract>) => {
    if (!selectedContract) return;
    updateItem(selectedContract.id, { ...selectedContract, ...updates, updatedAt: new Date().toISOString() });
  };

  const handleDeleteContract = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Contract',
      message: 'Are you sure you want to delete this contract?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
      if (selectedContractId === id) setSelectedContractId(null);
    }
  };

  // Calculate service total
  const calculateServiceTotal = (services: ServiceSelection[]) => {
    return services.filter(s => s.selected).reduce((sum, s) => sum + (s.price * s.quantity), 0);
  };

  // Update service selection
  const handleToggleService = (serviceId: string) => {
    if (!selectedContract) return;
    const updatedServices = selectedContract.serviceSelections.map(s =>
      s.id === serviceId ? { ...s, selected: !s.selected } : s
    );
    const newTotal = calculateServiceTotal(updatedServices);
    handleUpdateContract({
      serviceSelections: updatedServices,
      totalAmount: newTotal,
      remainingBalance: newTotal - selectedContract.totalPaid,
    });
  };

  // Add payment
  const handleAddPayment = (payment: Omit<PaymentRecord, 'id'>) => {
    if (!selectedContract) return;
    const newPayment: PaymentRecord = { ...payment, id: crypto.randomUUID() };
    const newTotalPaid = selectedContract.totalPaid + payment.amount;
    const newBalance = selectedContract.totalAmount - newTotalPaid;
    handleUpdateContract({
      payments: [...selectedContract.payments, newPayment],
      totalPaid: newTotalPaid,
      remainingBalance: newBalance,
      status: newBalance <= 0 ? 'paid_in_full' : selectedContract.status,
    });
    setShowPaymentForm(false);
  };

  // Export data
  const getExportData = () => {
    return contracts.map(c => ({
      contractNumber: c.contractNumber,
      purchaserName: `${c.purchaser.firstName} ${c.purchaser.lastName}`.trim(),
      beneficiaryName: c.isSelfBeneficiary ? 'Self' : c.beneficiary.name,
      status: statusConfig[c.status].label,
      planType: planTypeLabels[c.planType],
      totalAmount: c.totalAmount,
      totalPaid: c.totalPaid,
      remainingBalance: c.remainingBalance,
      createdAt: c.createdAt,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-7 h-7 text-emerald-500" />
              Pre-Need Contract Management
              {isPrefilled && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-filled
                </span>
              )}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.preNeedContract.managePreNeedFuneralContracts', 'Manage pre-need funeral contracts and payment plans')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="pre-need-contract" toolName="Pre Need Contract" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              data={getExportData()}
              columns={contractColumns}
              filename="pre-need-contracts"
              onExportCSV={() => exportToCSV(getExportData(), contractColumns, 'pre-need-contracts')}
              onExportExcel={() => exportToExcel(getExportData(), contractColumns, 'pre-need-contracts')}
              onExportJSON={() => exportToJSON(getExportData(), 'pre-need-contracts')}
              onExportPDF={() => exportToPDF(getExportData(), contractColumns, 'pre-need-contracts', 'Pre-Need Contracts')}
              onCopy={() => copyUtil(getExportData(), contractColumns)}
              onPrint={() => printData(getExportData(), contractColumns, 'Pre-Need Contracts')}
            />
            <button
              onClick={handleCreateContract}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              {t('tools.preNeedContract.newContract', 'New Contract')}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-gray-500">{t('tools.preNeedContract.totalContracts', 'Total Contracts')}</p>
            <p className="text-2xl font-bold">{contracts.length}</p>
          </div>
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-gray-500">{t('tools.preNeedContract.active', 'Active')}</p>
            <p className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-gray-500">{t('tools.preNeedContract.totalValue', 'Total Value')}</p>
            <p className="text-2xl font-bold">
              {formatCurrency(contracts.reduce((sum, c) => sum + c.totalAmount, 0))}
            </p>
          </div>
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-gray-500">{t('tools.preNeedContract.outstanding', 'Outstanding')}</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(contracts.reduce((sum, c) => sum + c.remainingBalance, 0))}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.preNeedContract.searchByContractNumberOr', 'Search by contract number or name...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
              }`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">{t('tools.preNeedContract.allStatuses', 'All Statuses')}</option>
            {Object.entries(statusConfig).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contracts List */}
          <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold">Contracts ({filteredContracts.length})</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredContracts.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('tools.preNeedContract.noContractsFound', 'No contracts found')}</p>
                </div>
              ) : (
                filteredContracts.map((contract) => (
                  <div
                    key={contract.id}
                    onClick={() => setSelectedContractId(contract.id)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedContractId === contract.id
                        ? theme === 'dark' ? 'bg-emerald-900/20' : 'bg-emerald-50'
                        : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{contract.contractNumber}</p>
                        <p className="text-sm text-gray-500">
                          {contract.purchaser.firstName} {contract.purchaser.lastName || 'Unknown'}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusConfig[contract.status].color}`}>
                        {statusConfig[contract.status].label}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500">{planTypeLabels[contract.planType]}</span>
                      <span className="font-medium">{formatCurrency(contract.totalAmount)}</span>
                    </div>
                    {contract.remainingBalance > 0 && (
                      <div className="mt-1 text-xs text-orange-600">
                        Balance: {formatCurrency(contract.remainingBalance)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contract Details */}
          <div className={`lg:col-span-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {selectedContract ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg">{selectedContract.contractNumber}</h2>
                    <p className="text-sm text-gray-500">{planTypeLabels[selectedContract.planType]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedContract.status}
                      onChange={(e) => handleUpdateContract({ status: e.target.value as PreNeedContract['status'] })}
                      className={`text-sm px-3 py-1.5 rounded border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      {Object.entries(statusConfig).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDeleteContract(selectedContract.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex">
                    {(['details', 'services', 'payments', 'documents'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                          activeTab === tab
                            ? 'border-emerald-500 text-emerald-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 max-h-[500px] overflow-y-auto">
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {/* Purchaser Information */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" /> Purchaser Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.preNeedContract.firstName', 'First Name')}</label>
                            <input
                              type="text"
                              value={selectedContract.purchaser.firstName}
                              onChange={(e) => handleUpdateContract({
                                purchaser: { ...selectedContract.purchaser, firstName: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.preNeedContract.lastName', 'Last Name')}</label>
                            <input
                              type="text"
                              value={selectedContract.purchaser.lastName}
                              onChange={(e) => handleUpdateContract({
                                purchaser: { ...selectedContract.purchaser, lastName: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.preNeedContract.dateOfBirth', 'Date of Birth')}</label>
                            <input
                              type="date"
                              value={selectedContract.purchaser.dateOfBirth}
                              onChange={(e) => handleUpdateContract({
                                purchaser: { ...selectedContract.purchaser, dateOfBirth: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.preNeedContract.phone', 'Phone')}</label>
                            <input
                              type="tel"
                              value={selectedContract.purchaser.phone}
                              onChange={(e) => handleUpdateContract({
                                purchaser: { ...selectedContract.purchaser, phone: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.preNeedContract.email', 'Email')}</label>
                            <input
                              type="email"
                              value={selectedContract.purchaser.email}
                              onChange={(e) => handleUpdateContract({
                                purchaser: { ...selectedContract.purchaser, email: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.preNeedContract.address', 'Address')}</label>
                            <input
                              type="text"
                              value={selectedContract.purchaser.address}
                              onChange={(e) => handleUpdateContract({
                                purchaser: { ...selectedContract.purchaser, address: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Beneficiary */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium flex items-center gap-2">
                            <User className="w-4 h-4" /> Beneficiary
                          </h3>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedContract.isSelfBeneficiary}
                              onChange={(e) => handleUpdateContract({ isSelfBeneficiary: e.target.checked })}
                              className="rounded"
                            />
                            {t('tools.preNeedContract.sameAsPurchaser', 'Same as purchaser')}
                          </label>
                        </div>
                        {!selectedContract.isSelfBeneficiary && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-500 mb-1">{t('tools.preNeedContract.name', 'Name')}</label>
                              <input
                                type="text"
                                value={selectedContract.beneficiary.name}
                                onChange={(e) => handleUpdateContract({
                                  beneficiary: { ...selectedContract.beneficiary, name: e.target.value }
                                })}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500 mb-1">{t('tools.preNeedContract.relationship', 'Relationship')}</label>
                              <input
                                type="text"
                                value={selectedContract.beneficiary.relationship}
                                onChange={(e) => handleUpdateContract({
                                  beneficiary: { ...selectedContract.beneficiary, relationship: e.target.value }
                                })}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contract Terms */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Contract Terms
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.preNeedContract.planType', 'Plan Type')}</label>
                            <select
                              value={selectedContract.planType}
                              onChange={(e) => handleUpdateContract({ planType: e.target.value as PreNeedContract['planType'] })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            >
                              {Object.entries(planTypeLabels).map(([key, val]) => (
                                <option key={key} value={key}>{val}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.preNeedContract.paymentPlan', 'Payment Plan')}</label>
                            <select
                              value={selectedContract.paymentPlan}
                              onChange={(e) => handleUpdateContract({ paymentPlan: e.target.value as PreNeedContract['paymentPlan'] })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            >
                              {Object.entries(paymentPlanLabels).map(([key, val]) => (
                                <option key={key} value={key}>{val}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.preNeedContract.termMonths', 'Term (Months)')}</label>
                            <input
                              type="number"
                              value={selectedContract.paymentTermMonths}
                              onChange={(e) => handleUpdateContract({ paymentTermMonths: parseInt(e.target.value) || 0 })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" /> Financial Summary
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <p className="text-sm text-gray-500">{t('tools.preNeedContract.totalAmount', 'Total Amount')}</p>
                            <p className="text-xl font-bold">{formatCurrency(selectedContract.totalAmount)}</p>
                          </div>
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <p className="text-sm text-gray-500">{t('tools.preNeedContract.totalPaid', 'Total Paid')}</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(selectedContract.totalPaid)}</p>
                          </div>
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <p className="text-sm text-gray-500">{t('tools.preNeedContract.remaining', 'Remaining')}</p>
                            <p className={`text-xl font-bold ${selectedContract.remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                              {formatCurrency(selectedContract.remainingBalance)}
                            </p>
                          </div>
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <p className="text-sm text-gray-500">{t('tools.preNeedContract.monthlyPayment', 'Monthly Payment')}</p>
                            <p className="text-xl font-bold">{formatCurrency(selectedContract.monthlyPayment)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'services' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">{t('tools.preNeedContract.serviceSelections', 'Service Selections')}</h3>
                        <p className="text-sm">
                          Total: <span className="font-bold">{formatCurrency(calculateServiceTotal(selectedContract.serviceSelections))}</span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(
                          selectedContract.serviceSelections.reduce((acc, s) => {
                            if (!acc[s.category]) acc[s.category] = [];
                            acc[s.category].push(s);
                            return acc;
                          }, {} as Record<string, ServiceSelection[]>)
                        ).map(([category, services]) => (
                          <div key={category} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <h4 className="font-medium text-sm mb-2">{category}</h4>
                            <div className="space-y-2">
                              {services.map((service) => (
                                <div key={service.id} className="flex items-center justify-between">
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={service.selected}
                                      onChange={() => handleToggleService(service.id)}
                                      className="rounded"
                                    />
                                    <span className={!service.selected ? 'text-gray-400' : ''}>{service.item}</span>
                                  </label>
                                  <span className={`text-sm ${!service.selected ? 'text-gray-400' : ''}`}>
                                    {formatCurrency(service.price)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'payments' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Payment History ({selectedContract.payments.length})</h3>
                        <button
                          onClick={() => setShowPaymentForm(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                          <Plus className="w-4 h-4" /> Record Payment
                        </button>
                      </div>

                      {showPaymentForm && (
                        <PaymentForm
                          onSubmit={handleAddPayment}
                          onCancel={() => setShowPaymentForm(false)}
                          theme={theme}
                        />
                      )}

                      <div className="space-y-2">
                        {selectedContract.payments.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">{t('tools.preNeedContract.noPaymentsRecorded', 'No payments recorded')}</p>
                        ) : (
                          selectedContract.payments.map((payment) => (
                            <div
                              key={payment.id}
                              className={`p-3 rounded-lg border flex justify-between items-center ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div>
                                <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(payment.date)} - {payment.method.replace('_', ' ').toUpperCase()}
                                </p>
                                {payment.referenceNumber && (
                                  <p className="text-xs text-gray-400">Ref: {payment.referenceNumber}</p>
                                )}
                              </div>
                              <CreditCard className="w-5 h-5 text-gray-400" />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('tools.preNeedContract.documentManagementComingSoon', 'Document management coming soon')}</p>
                      <div className="flex justify-center gap-2 mt-4">
                        <button className="px-4 py-2 text-sm border rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Download className="w-4 h-4" /> Download Contract
                        </button>
                        <button className="px-4 py-2 text-sm border rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Printer className="w-4 h-4" /> Print Contract
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t('tools.preNeedContract.selectAContractToView', 'Select a contract to view details')}</p>
                <p className="text-sm mt-1">{t('tools.preNeedContract.orCreateANewContract', 'or create a new contract to get started')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

// Payment Form Component
const PaymentForm: React.FC<{
  onSubmit: (payment: Omit<PaymentRecord, 'id'>) => void;
  onCancel: () => void;
  theme: string;
}> = ({ onSubmit, onCancel, theme }) => {
  const [payment, setPayment] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    method: 'check' as PaymentRecord['method'],
    referenceNumber: '',
    notes: '',
  });

  return (
    <div className={`p-4 mb-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <h4 className="font-medium mb-3">{t('tools.preNeedContract.recordPayment', 'Record Payment')}</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">{t('tools.preNeedContract.date', 'Date')}</label>
          <input
            type="date"
            value={payment.date}
            onChange={(e) => setPayment({ ...payment, date: e.target.value })}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.preNeedContract.amount', 'Amount')}</label>
          <input
            type="number"
            value={payment.amount}
            onChange={(e) => setPayment({ ...payment, amount: parseFloat(e.target.value) || 0 })}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.preNeedContract.method', 'Method')}</label>
          <select
            value={payment.method}
            onChange={(e) => setPayment({ ...payment, method: e.target.value as PaymentRecord['method'] })}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          >
            <option value="cash">{t('tools.preNeedContract.cash', 'Cash')}</option>
            <option value="check">{t('tools.preNeedContract.check', 'Check')}</option>
            <option value="card">{t('tools.preNeedContract.card', 'Card')}</option>
            <option value="bank_transfer">{t('tools.preNeedContract.bankTransfer', 'Bank Transfer')}</option>
            <option value="insurance">{t('tools.preNeedContract.insurance', 'Insurance')}</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.preNeedContract.reference', 'Reference #')}</label>
          <input
            type="text"
            value={payment.referenceNumber}
            onChange={(e) => setPayment({ ...payment, referenceNumber: e.target.value })}
            placeholder={t('tools.preNeedContract.checkConfirmationEtc', 'Check #, confirmation, etc.')}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500">{t('tools.preNeedContract.cancel', 'Cancel')}</button>
        <button
          onClick={() => payment.amount > 0 && onSubmit(payment)}
          className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          {t('tools.preNeedContract.recordPayment2', 'Record Payment')}
        </button>
      </div>
    </div>
  );
};

export default PreNeedContractTool;
