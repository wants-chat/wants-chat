'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Gem,
  Plus,
  Trash2,
  Save,
  Search,
  Filter,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Camera,
  Scale,
  Tag,
  Clock,
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

interface AppraisalToolProps {
  uiConfig?: UIConfig;
}

// Types
type AppraisalPurpose = 'insurance' | 'estate' | 'resale' | 'donation' | 'collateral' | 'divorce' | 'other';
type AppraisalStatus = 'pending' | 'in_progress' | 'completed' | 'delivered';

interface Appraisal {
  id: string;
  appraisalNumber: string;
  customerId: string;
  purpose: AppraisalPurpose;
  status: AppraisalStatus;
  itemDescription: string;
  itemType: string;
  metal: string;
  metalWeight: number;
  metalPurity: string;
  stones: StoneDetail[];
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  age: string;
  origin: string;
  retailValue: number;
  replacementValue: number;
  fairMarketValue: number;
  liquidationValue: number;
  appraisalFee: number;
  feePaid: boolean;
  photos: string[];
  notes: string;
  appraisedBy: string;
  requestDate: string;
  completedDate: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

interface StoneDetail {
  id: string;
  type: string;
  shape: string;
  caratWeight: number;
  color: string;
  clarity: string;
  cut: string;
  treatment: string;
  certification: string;
  estimatedValue: number;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

// Constants
const PURPOSE_OPTIONS: { purpose: AppraisalPurpose; label: string }[] = [
  { purpose: 'insurance', label: 'Insurance' },
  { purpose: 'estate', label: 'Estate/Probate' },
  { purpose: 'resale', label: 'Resale/Consignment' },
  { purpose: 'donation', label: 'Charitable Donation' },
  { purpose: 'collateral', label: 'Collateral/Loan' },
  { purpose: 'divorce', label: 'Divorce/Legal' },
  { purpose: 'other', label: 'Other' },
];

const STATUS_OPTIONS: { status: AppraisalStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Pending', color: 'bg-blue-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { status: 'completed', label: 'Completed', color: 'bg-green-500' },
  { status: 'delivered', label: 'Delivered', color: 'bg-gray-500' },
];

const STONE_SHAPES = ['Round', 'Princess', 'Oval', 'Emerald', 'Pear', 'Marquise', 'Cushion', 'Radiant', 'Asscher', 'Heart', 'Trillion', 'Baguette', 'Other'];
const STONE_TYPES = ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Opal', 'Pearl', 'Amethyst', 'Aquamarine', 'Topaz', 'Garnet', 'Turquoise', 'Other'];
const CLARITY_GRADES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3', 'N/A'];
const COLOR_GRADES = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N-Z', 'Fancy Color', 'N/A'];

// Column configurations for exports
const APPRAISAL_COLUMNS: ColumnConfig[] = [
  { key: 'appraisalNumber', header: 'Appraisal #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'itemDescription', header: 'Item', type: 'string' },
  { key: 'purpose', header: 'Purpose', type: 'string' },
  { key: 'retailValue', header: 'Retail Value', type: 'currency' },
  { key: 'replacementValue', header: 'Replacement Value', type: 'currency' },
  { key: 'appraisalFee', header: 'Fee', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'requestDate', header: 'Request Date', type: 'date' },
  { key: 'completedDate', header: 'Completed', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateAppraisalNumber = () => `APR-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const AppraisalTool: React.FC<AppraisalToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hooks for backend sync
  const {
    data: appraisals,
    addItem: addAppraisalToBackend,
    updateItem: updateAppraisalBackend,
    deleteItem: deleteAppraisalBackend,
    isSynced: appraisalsSynced,
    isSaving: appraisalsSaving,
    lastSaved: appraisalsLastSaved,
    syncError: appraisalsSyncError,
    forceSync: forceAppraisalsSync,
  } = useToolData<Appraisal>('jewelry-appraisals', [], APPRAISAL_COLUMNS);

  const {
    data: customers,
    addItem: addCustomerToBackend,
    deleteItem: deleteCustomerBackend,
  } = useToolData<Customer>('appraisal-customers', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'appraisals' | 'customers'>('appraisals');
  const [showAppraisalForm, setShowAppraisalForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingAppraisal, setEditingAppraisal] = useState<Appraisal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedAppraisalId, setExpandedAppraisalId] = useState<string | null>(null);
  const [showStoneModal, setShowStoneModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Confirm dialog hook
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // New appraisal form state
  const [newAppraisal, setNewAppraisal] = useState<Partial<Appraisal>>({
    customerId: '',
    purpose: 'insurance',
    itemDescription: '',
    itemType: '',
    metal: '',
    metalWeight: 0,
    metalPurity: '',
    stones: [],
    condition: 'good',
    age: '',
    origin: '',
    retailValue: 0,
    replacementValue: 0,
    fairMarketValue: 0,
    liquidationValue: 0,
    appraisalFee: 75,
    appraisedBy: '',
    notes: '',
  });

  // New stone state
  const [newStone, setNewStone] = useState<Partial<StoneDetail>>({
    type: 'Diamond',
    shape: 'Round',
    caratWeight: 0,
    color: 'G',
    clarity: 'VS1',
    cut: 'Excellent',
    treatment: 'None',
    certification: '',
    estimatedValue: 0,
  });

  // New customer form state
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  // Add stone to appraisal
  const addStone = () => {
    const stone: StoneDetail = {
      id: generateId(),
      type: newStone.type || 'Diamond',
      shape: newStone.shape || 'Round',
      caratWeight: newStone.caratWeight || 0,
      color: newStone.color || '',
      clarity: newStone.clarity || '',
      cut: newStone.cut || '',
      treatment: newStone.treatment || 'None',
      certification: newStone.certification || '',
      estimatedValue: newStone.estimatedValue || 0,
    };

    setNewAppraisal({
      ...newAppraisal,
      stones: [...(newAppraisal.stones || []), stone],
    });

    setNewStone({
      type: 'Diamond',
      shape: 'Round',
      caratWeight: 0,
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      treatment: 'None',
      certification: '',
      estimatedValue: 0,
    });
    setShowStoneModal(false);
  };

  // Remove stone from appraisal
  const removeStone = (stoneId: string) => {
    setNewAppraisal({
      ...newAppraisal,
      stones: (newAppraisal.stones || []).filter((s) => s.id !== stoneId),
    });
  };

  // Add new appraisal
  const addAppraisal = () => {
    if (!newAppraisal.customerId || !newAppraisal.itemDescription) {
      setValidationMessage('Please select a customer and enter item description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const appraisal: Appraisal = {
      id: generateId(),
      appraisalNumber: generateAppraisalNumber(),
      customerId: newAppraisal.customerId || '',
      purpose: newAppraisal.purpose || 'insurance',
      status: 'pending',
      itemDescription: newAppraisal.itemDescription || '',
      itemType: newAppraisal.itemType || '',
      metal: newAppraisal.metal || '',
      metalWeight: newAppraisal.metalWeight || 0,
      metalPurity: newAppraisal.metalPurity || '',
      stones: newAppraisal.stones || [],
      condition: newAppraisal.condition || 'good',
      age: newAppraisal.age || '',
      origin: newAppraisal.origin || '',
      retailValue: newAppraisal.retailValue || 0,
      replacementValue: newAppraisal.replacementValue || 0,
      fairMarketValue: newAppraisal.fairMarketValue || 0,
      liquidationValue: newAppraisal.liquidationValue || 0,
      appraisalFee: newAppraisal.appraisalFee || 75,
      feePaid: false,
      photos: [],
      notes: newAppraisal.notes || '',
      appraisedBy: newAppraisal.appraisedBy || '',
      requestDate: new Date().toISOString(),
      completedDate: '',
      validUntil: validUntil.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addAppraisalToBackend(appraisal);
    setShowAppraisalForm(false);
    resetAppraisalForm();
  };

  // Update appraisal
  const updateAppraisal = () => {
    if (!editingAppraisal) return;

    const updates = {
      ...editingAppraisal,
      updatedAt: new Date().toISOString(),
    };

    if (editingAppraisal.status === 'completed' && !editingAppraisal.completedDate) {
      updates.completedDate = new Date().toISOString();
    }

    updateAppraisalBackend(editingAppraisal.id, updates);
    setEditingAppraisal(null);
  };

  // Delete appraisal
  const deleteAppraisal = async (appraisalId: string) => {
    const confirmed = await confirm({
      title: 'Delete Appraisal',
      message: 'Are you sure you want to delete this appraisal? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteAppraisalBackend(appraisalId);
    }
  };

  // Add new customer
  const addCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName) {
      setValidationMessage('Please enter customer first and last name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const customer: Customer = {
      id: generateId(),
      firstName: newCustomer.firstName || '',
      lastName: newCustomer.lastName || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      address: newCustomer.address || '',
      createdAt: new Date().toISOString(),
    };

    addCustomerToBackend(customer);
    setShowCustomerForm(false);
    setNewCustomer({ firstName: '', lastName: '', email: '', phone: '', address: '' });
  };

  // Delete customer
  const deleteCustomer = async (customerId: string) => {
    const hasAppraisals = appraisals.some((a) => a.customerId === customerId);
    if (hasAppraisals) {
      setValidationMessage('Cannot delete customer with existing appraisals');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteCustomerBackend(customerId);
    }
  };

  // Reset appraisal form
  const resetAppraisalForm = () => {
    setNewAppraisal({
      customerId: '',
      purpose: 'insurance',
      itemDescription: '',
      itemType: '',
      metal: '',
      metalWeight: 0,
      metalPurity: '',
      stones: [],
      condition: 'good',
      age: '',
      origin: '',
      retailValue: 0,
      replacementValue: 0,
      fairMarketValue: 0,
      liquidationValue: 0,
      appraisalFee: 75,
      appraisedBy: '',
      notes: '',
    });
  };

  // Get customer name
  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
  };

  // Filtered appraisals
  const filteredAppraisals = useMemo(() => {
    return appraisals.filter((appraisal) => {
      const customer = customers.find((c) => c.id === appraisal.customerId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';
      const matchesSearch =
        searchTerm === '' ||
        customerName.includes(searchTerm.toLowerCase()) ||
        appraisal.appraisalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appraisal.itemDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || appraisal.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [appraisals, customers, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const pending = appraisals.filter((a) => a.status === 'pending').length;
    const completed = appraisals.filter((a) => a.status === 'completed' || a.status === 'delivered').length;
    const totalValue = appraisals.reduce((sum, a) => sum + a.retailValue, 0);
    const totalFees = appraisals.reduce((sum, a) => sum + (a.feePaid ? a.appraisalFee : 0), 0);
    const pendingFees = appraisals.reduce((sum, a) => sum + (!a.feePaid ? a.appraisalFee : 0), 0);

    return { pending, completed, totalValue, totalFees, pendingFees };
  }, [appraisals]);

  return (
    <>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
        {validationMessage}
      </div>
    )}
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.appraisal.jewelryAppraisalTool', 'Jewelry Appraisal Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.appraisal.professionalJewelryAppraisalsForInsurance', 'Professional jewelry appraisals for insurance, estate, and resale')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="appraisal" toolName="Appraisal" />

              <SyncStatus
                isSynced={appraisalsSynced}
                isSaving={appraisalsSaving}
                lastSaved={appraisalsLastSaved}
                syncError={appraisalsSyncError}
                onForceSync={forceAppraisalsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = appraisals.map((a) => ({
                    ...a,
                    customerName: getCustomerName(a.customerId),
                  }));
                  exportToCSV(exportData, APPRAISAL_COLUMNS, { filename: 'jewelry-appraisals' });
                }}
                onExportExcel={() => {
                  const exportData = appraisals.map((a) => ({
                    ...a,
                    customerName: getCustomerName(a.customerId),
                  }));
                  exportToExcel(exportData, APPRAISAL_COLUMNS, { filename: 'jewelry-appraisals' });
                }}
                onExportJSON={() => {
                  const exportData = appraisals.map((a) => ({
                    ...a,
                    customerName: getCustomerName(a.customerId),
                  }));
                  exportToJSON(exportData, { filename: 'jewelry-appraisals' });
                }}
                onExportPDF={async () => {
                  const exportData = appraisals.map((a) => ({
                    ...a,
                    customerName: getCustomerName(a.customerId),
                  }));
                  await exportToPDF(exportData, APPRAISAL_COLUMNS, {
                    filename: 'jewelry-appraisals',
                    title: 'Jewelry Appraisals Report',
                    subtitle: `${appraisals.length} total appraisals`,
                  });
                }}
                onPrint={() => {
                  const exportData = appraisals.map((a) => ({
                    ...a,
                    customerName: getCustomerName(a.customerId),
                  }));
                  printData(exportData, APPRAISAL_COLUMNS, { title: 'Jewelry Appraisals' });
                }}
                onCopyToClipboard={async () => {
                  const exportData = appraisals.map((a) => ({
                    ...a,
                    customerName: getCustomerName(a.customerId),
                  }));
                  return await copyUtil(exportData, APPRAISAL_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'appraisals', label: 'Appraisals', icon: <FileText className="w-4 h-4" /> },
              { id: 'customers', label: 'Customers', icon: <User className="w-4 h-4" /> },
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appraisal.pending', 'Pending')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appraisal.completed', 'Completed')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.completed}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appraisal.totalValue', 'Total Value')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <Gem className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appraisal.feesCollected', 'Fees Collected')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.totalFees)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#0D9488]" />
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appraisal.pendingFees', 'Pending Fees')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.pendingFees)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Appraisals Tab */}
        {activeTab === 'appraisals' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.appraisal.searchAppraisals', 'Search appraisals...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                >
                  <option value="all">{t('tools.appraisal.allStatus', 'All Status')}</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.status} value={opt.status}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowAppraisalForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.appraisal.newAppraisal2', 'New Appraisal')}
              </button>
            </div>

            {/* Appraisals List */}
            <div className="space-y-4">
              {filteredAppraisals.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Gem className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.appraisal.noAppraisalsFound', 'No appraisals found')}</p>
                </div>
              ) : (
                filteredAppraisals.map((appraisal) => (
                  <div
                    key={appraisal.id}
                    className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {appraisal.appraisalNumber}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full text-white ${
                              STATUS_OPTIONS.find((s) => s.status === appraisal.status)?.color || 'bg-gray-500'
                            }`}>
                              {STATUS_OPTIONS.find((s) => s.status === appraisal.status)?.label}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {PURPOSE_OPTIONS.find((p) => p.purpose === appraisal.purpose)?.label}
                            </span>
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getCustomerName(appraisal.customerId)} - {appraisal.itemDescription}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(appraisal.retailValue)}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.appraisal.retailValue', 'Retail Value')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedAppraisalId(expandedAppraisalId === appraisal.id ? null : appraisal.id)}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            {expandedAppraisalId === appraisal.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setEditingAppraisal(appraisal)}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => deleteAppraisal(appraisal.id)}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedAppraisalId === appraisal.id && (
                      <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appraisal.metal', 'Metal')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {appraisal.metal} {appraisal.metalPurity}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appraisal.weight', 'Weight')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {appraisal.metalWeight}g
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appraisal.condition', 'Condition')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} capitalize`}>
                              {appraisal.condition}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appraisal.requestDate', 'Request Date')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatDate(appraisal.requestDate)}
                            </p>
                          </div>
                        </div>

                        {/* Stones */}
                        {appraisal.stones.length > 0 && (
                          <div className="mb-4">
                            <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appraisal.stones', 'Stones')}</p>
                            <div className="space-y-2">
                              {appraisal.stones.map((stone) => (
                                <div key={stone.id} className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {stone.caratWeight}ct {stone.shape} {stone.type}
                                  </span>
                                  <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Color: {stone.color}, Clarity: {stone.clarity}
                                  </span>
                                  <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {formatCurrency(stone.estimatedValue)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Values */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appraisal.replacementValue', 'Replacement Value')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(appraisal.replacementValue)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appraisal.fairMarketValue', 'Fair Market Value')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(appraisal.fairMarketValue)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appraisal.liquidationValue', 'Liquidation Value')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(appraisal.liquidationValue)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appraisal.appraisalFee', 'Appraisal Fee')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(appraisal.appraisalFee)}
                              {appraisal.feePaid ? (
                                <span className="ml-2 text-xs text-green-500">{t('tools.appraisal.paid', 'Paid')}</span>
                              ) : (
                                <span className="ml-2 text-xs text-orange-500">{t('tools.appraisal.unpaid', 'Unpaid')}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {appraisal.notes && (
                          <div className="mt-4">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appraisal.notes', 'Notes')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {appraisal.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.appraisal.customers', 'Customers')}</h2>
              <button
                onClick={() => setShowCustomerForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.appraisal.addCustomer2', 'Add Customer')}
              </button>
            </div>

            <div className="space-y-4">
              {customers.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.appraisal.noCustomersFound', 'No customers found')}</p>
                </div>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {customer.firstName} {customer.lastName}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          {customer.email && (
                            <span className={`flex items-center gap-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Mail className="w-3 h-3" /> {customer.email}
                            </span>
                          )}
                          {customer.phone && (
                            <span className={`flex items-center gap-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Phone className="w-3 h-3" /> {customer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {appraisals.filter((a) => a.customerId === customer.id).length} appraisals
                        </span>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* New Appraisal Modal */}
        {showAppraisalForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.appraisal.newAppraisal', 'New Appraisal')}</h2>
                <button onClick={() => { setShowAppraisalForm(false); resetAppraisalForm(); }}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.customer', 'Customer *')}
                  </label>
                  <select
                    value={newAppraisal.customerId}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, customerId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.appraisal.selectCustomer', 'Select Customer')}</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.purpose', 'Purpose')}
                  </label>
                  <select
                    value={newAppraisal.purpose}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, purpose: e.target.value as AppraisalPurpose })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {PURPOSE_OPTIONS.map((p) => (
                      <option key={p.purpose} value={p.purpose}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.itemDescription', 'Item Description *')}
                  </label>
                  <input
                    type="text"
                    value={newAppraisal.itemDescription}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, itemDescription: e.target.value })}
                    placeholder={t('tools.appraisal.eGDiamondSolitaireEngagement', 'e.g., Diamond solitaire engagement ring')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.metalType', 'Metal Type')}
                  </label>
                  <input
                    type="text"
                    value={newAppraisal.metal}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, metal: e.target.value })}
                    placeholder={t('tools.appraisal.eGYellowGold', 'e.g., Yellow Gold')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.metalPurity', 'Metal Purity')}
                  </label>
                  <input
                    type="text"
                    value={newAppraisal.metalPurity}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, metalPurity: e.target.value })}
                    placeholder={t('tools.appraisal.eG14k18k950', 'e.g., 14K, 18K, 950 Platinum')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.metalWeightGrams', 'Metal Weight (grams)')}
                  </label>
                  <input
                    type="number"
                    value={newAppraisal.metalWeight}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, metalWeight: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.condition2', 'Condition')}
                  </label>
                  <select
                    value={newAppraisal.condition}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, condition: e.target.value as 'excellent' | 'good' | 'fair' | 'poor' })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="excellent">{t('tools.appraisal.excellent', 'Excellent')}</option>
                    <option value="good">{t('tools.appraisal.good', 'Good')}</option>
                    <option value="fair">{t('tools.appraisal.fair', 'Fair')}</option>
                    <option value="poor">{t('tools.appraisal.poor', 'Poor')}</option>
                  </select>
                </div>

                {/* Stones Section */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.appraisal.stones2', 'Stones')}
                    </label>
                    <button
                      onClick={() => setShowStoneModal(true)}
                      className="text-sm text-[#0D9488] hover:text-[#0B7C73]"
                    >
                      {t('tools.appraisal.addStone2', '+ Add Stone')}
                    </button>
                  </div>
                  {(newAppraisal.stones || []).length > 0 ? (
                    <div className="space-y-2">
                      {(newAppraisal.stones || []).map((stone) => (
                        <div key={stone.id} className={`flex items-center justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {stone.caratWeight}ct {stone.shape} {stone.type} - {formatCurrency(stone.estimatedValue)}
                          </span>
                          <button onClick={() => removeStone(stone.id)} className="text-red-500 hover:text-red-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.appraisal.noStonesAdded', 'No stones added')}</p>
                  )}
                </div>

                {/* Values */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.retailValue2', 'Retail Value')}
                  </label>
                  <input
                    type="number"
                    value={newAppraisal.retailValue}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, retailValue: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.replacementValue2', 'Replacement Value')}
                  </label>
                  <input
                    type="number"
                    value={newAppraisal.replacementValue}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, replacementValue: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.fairMarketValue2', 'Fair Market Value')}
                  </label>
                  <input
                    type="number"
                    value={newAppraisal.fairMarketValue}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, fairMarketValue: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.appraisalFee2', 'Appraisal Fee')}
                  </label>
                  <input
                    type="number"
                    value={newAppraisal.appraisalFee}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, appraisalFee: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.notes2', 'Notes')}
                  </label>
                  <textarea
                    value={newAppraisal.notes}
                    onChange={(e) => setNewAppraisal({ ...newAppraisal, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowAppraisalForm(false); resetAppraisalForm(); }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.appraisal.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addAppraisal}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
                >
                  {t('tools.appraisal.createAppraisal', 'Create Appraisal')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Stone Modal */}
        {showStoneModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.appraisal.addStone', 'Add Stone')}</h2>
                <button onClick={() => setShowStoneModal(false)}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.stoneType', 'Stone Type')}
                  </label>
                  <select
                    value={newStone.type}
                    onChange={(e) => setNewStone({ ...newStone, type: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {STONE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.shape', 'Shape')}
                  </label>
                  <select
                    value={newStone.shape}
                    onChange={(e) => setNewStone({ ...newStone, shape: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {STONE_SHAPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.caratWeight', 'Carat Weight')}
                  </label>
                  <input
                    type="number"
                    value={newStone.caratWeight}
                    onChange={(e) => setNewStone({ ...newStone, caratWeight: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.color', 'Color')}
                  </label>
                  <select
                    value={newStone.color}
                    onChange={(e) => setNewStone({ ...newStone, color: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {COLOR_GRADES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.clarity', 'Clarity')}
                  </label>
                  <select
                    value={newStone.clarity}
                    onChange={(e) => setNewStone({ ...newStone, clarity: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {CLARITY_GRADES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.estimatedValue', 'Estimated Value')}
                  </label>
                  <input
                    type="number"
                    value={newStone.estimatedValue}
                    onChange={(e) => setNewStone({ ...newStone, estimatedValue: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.certification', 'Certification')}
                  </label>
                  <input
                    type="text"
                    value={newStone.certification}
                    onChange={(e) => setNewStone({ ...newStone, certification: e.target.value })}
                    placeholder={t('tools.appraisal.eGGiaAgs', 'e.g., GIA, AGS')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowStoneModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.appraisal.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addStone}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
                >
                  {t('tools.appraisal.addStone3', 'Add Stone')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Appraisal Modal */}
        {editingAppraisal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Edit Appraisal - {editingAppraisal.appraisalNumber}
                </h2>
                <button onClick={() => setEditingAppraisal(null)}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.status', 'Status')}
                  </label>
                  <select
                    value={editingAppraisal.status}
                    onChange={(e) => setEditingAppraisal({ ...editingAppraisal, status: e.target.value as AppraisalStatus })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.status} value={opt.status}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.feePaid', 'Fee Paid')}
                  </label>
                  <select
                    value={editingAppraisal.feePaid ? 'yes' : 'no'}
                    onChange={(e) => setEditingAppraisal({ ...editingAppraisal, feePaid: e.target.value === 'yes' })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="no">{t('tools.appraisal.no', 'No')}</option>
                    <option value="yes">{t('tools.appraisal.yes', 'Yes')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.retailValue3', 'Retail Value')}
                  </label>
                  <input
                    type="number"
                    value={editingAppraisal.retailValue}
                    onChange={(e) => setEditingAppraisal({ ...editingAppraisal, retailValue: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.replacementValue3', 'Replacement Value')}
                  </label>
                  <input
                    type="number"
                    value={editingAppraisal.replacementValue}
                    onChange={(e) => setEditingAppraisal({ ...editingAppraisal, replacementValue: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.appraisedBy', 'Appraised By')}
                  </label>
                  <input
                    type="text"
                    value={editingAppraisal.appraisedBy}
                    onChange={(e) => setEditingAppraisal({ ...editingAppraisal, appraisedBy: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.notes3', 'Notes')}
                  </label>
                  <textarea
                    value={editingAppraisal.notes}
                    onChange={(e) => setEditingAppraisal({ ...editingAppraisal, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingAppraisal(null)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.appraisal.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={updateAppraisal}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
                >
                  {t('tools.appraisal.saveChanges', 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Form Modal */}
        {showCustomerForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.appraisal.addCustomer', 'Add Customer')}</h2>
                <button onClick={() => setShowCustomerForm(false)}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.appraisal.firstName', 'First Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.firstName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.appraisal.lastName', 'Last Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.lastName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appraisal.address', 'Address')}
                  </label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCustomerForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.appraisal.cancel4', 'Cancel')}
                </button>
                <button
                  onClick={addCustomer}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
                >
                  {t('tools.appraisal.addCustomer3', 'Add Customer')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AppraisalTool;
