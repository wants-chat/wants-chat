'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Search,
  Edit2,
  CreditCard,
  History,
  Star,
  Gift,
  Tag,
  Package,
  Sparkles,
  Award,
  TrendingUp,
  Clock,
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

interface CustomerAccountDryCleanToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';
type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'account' | 'mobile_pay';
type CustomerStatus = 'active' | 'inactive' | 'suspended';

interface CustomerPreferences {
  preferredPickupDay: string;
  preferredPickupTime: string;
  starchPreference: 'none' | 'light' | 'medium' | 'heavy';
  hangerPreference: 'wire' | 'plastic' | 'wood';
  foldingPreference: boolean;
  specialInstructions: string;
}

interface LoyaltyInfo {
  pointsBalance: number;
  totalPointsEarned: number;
  pointsRedeemed: number;
  tier: CustomerTier;
  memberSince: string;
  lastTierUpgrade: string;
}

interface CustomerAccount {
  id: string;
  accountNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: CustomerStatus;
  preferences: CustomerPreferences;
  loyalty: LoyaltyInfo;
  defaultPaymentMethod: PaymentMethod;
  accountBalance: number;
  creditLimit: number;
  totalSpent: number;
  visitCount: number;
  averageOrderValue: number;
  lastVisit: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Constants
const TIER_BENEFITS: { tier: CustomerTier; label: string; discount: number; color: string; pointsRequired: number }[] = [
  { tier: 'bronze', label: 'Bronze', discount: 0, color: 'bg-orange-700', pointsRequired: 0 },
  { tier: 'silver', label: 'Silver', discount: 5, color: 'bg-gray-400', pointsRequired: 500 },
  { tier: 'gold', label: 'Gold', discount: 10, color: 'bg-yellow-500', pointsRequired: 1500 },
  { tier: 'platinum', label: 'Platinum', discount: 15, color: 'bg-purple-500', pointsRequired: 5000 },
  { tier: 'vip', label: 'VIP', discount: 20, color: 'bg-red-500', pointsRequired: 10000 },
];

const STATUS_OPTIONS: { status: CustomerStatus; label: string; color: string }[] = [
  { status: 'active', label: 'Active', color: 'bg-green-500' },
  { status: 'inactive', label: 'Inactive', color: 'bg-gray-500' },
  { status: 'suspended', label: 'Suspended', color: 'bg-red-500' },
];

const PAYMENT_METHODS: { method: PaymentMethod; label: string }[] = [
  { method: 'cash', label: 'Cash' },
  { method: 'credit_card', label: 'Credit Card' },
  { method: 'debit_card', label: 'Debit Card' },
  { method: 'account', label: 'On Account' },
  { method: 'mobile_pay', label: 'Mobile Payment' },
];

// Column config for exports
const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'accountNumber', header: 'Account #', width: 12 },
  { key: 'firstName', header: 'First Name', width: 15 },
  { key: 'lastName', header: 'Last Name', width: 15 },
  { key: 'phone', header: 'Phone', width: 15 },
  { key: 'email', header: 'Email', width: 25 },
  { key: 'status', header: 'Status', width: 10 },
  { key: 'totalSpent', header: 'Total Spent', width: 12, format: (v) => `$${Number(v).toFixed(2)}` },
  { key: 'visitCount', header: 'Visits', width: 8 },
];

// Generate unique ID
const generateId = () => `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateAccountNumber = () => `DC${Date.now().toString().slice(-8)}`;

export function CustomerAccountDryCleanTool({ uiConfig }: CustomerAccountDryCleanToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const isPrefilled = uiConfig?.prefillData && Object.keys(uiConfig.prefillData).length > 0;

  // Use the useToolData hook for backend sync
  const {
    data: customers,
    addItem: addCustomerToBackend,
    updateItem: updateCustomerBackend,
    deleteItem: deleteCustomerBackend,
    isSynced: customersSynced,
    isSaving: customersSaving,
    lastSaved: customersLastSaved,
    syncError: customersSyncError,
    forceSync: forceCustomersSync,
  } = useToolData<CustomerAccount>('customer-account-dryclean', [], CUSTOMER_COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<'customers' | 'new' | 'loyalty'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<CustomerTier | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);

  // New customer form state
  const [newCustomer, setNewCustomer] = useState<Partial<CustomerAccount>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    status: 'active',
    defaultPaymentMethod: 'credit_card',
    accountBalance: 0,
    creditLimit: 500,
    notes: '',
    tags: [],
    preferences: {
      preferredPickupDay: '',
      preferredPickupTime: '',
      starchPreference: 'none',
      hangerPreference: 'plastic',
      foldingPreference: false,
      specialInstructions: '',
    },
  });

  // Create new customer
  const createCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone) {
      setValidationMessage('Please enter first name, last name, and phone number');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const customer: CustomerAccount = {
      id: generateId(),
      accountNumber: generateAccountNumber(),
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email || '',
      phone: newCustomer.phone,
      alternatePhone: newCustomer.alternatePhone || '',
      address: newCustomer.address || '',
      city: newCustomer.city || '',
      state: newCustomer.state || '',
      zipCode: newCustomer.zipCode || '',
      status: 'active',
      preferences: newCustomer.preferences || {
        preferredPickupDay: '',
        preferredPickupTime: '',
        starchPreference: 'none',
        hangerPreference: 'plastic',
        foldingPreference: false,
        specialInstructions: '',
      },
      loyalty: {
        pointsBalance: 0,
        totalPointsEarned: 0,
        pointsRedeemed: 0,
        tier: 'bronze',
        memberSince: new Date().toISOString().split('T')[0],
        lastTierUpgrade: '',
      },
      defaultPaymentMethod: newCustomer.defaultPaymentMethod || 'credit_card',
      accountBalance: newCustomer.accountBalance || 0,
      creditLimit: newCustomer.creditLimit || 500,
      totalSpent: 0,
      visitCount: 0,
      averageOrderValue: 0,
      lastVisit: '',
      notes: newCustomer.notes || '',
      tags: newCustomer.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addCustomerToBackend(customer);
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      status: 'active',
      defaultPaymentMethod: 'credit_card',
      accountBalance: 0,
      creditLimit: 500,
      notes: '',
      tags: [],
      preferences: {
        preferredPickupDay: '',
        preferredPickupTime: '',
        starchPreference: 'none',
        hangerPreference: 'plastic',
        foldingPreference: false,
        specialInstructions: '',
      },
    });
    setActiveTab('customers');
  };

  // Update customer status
  const updateCustomerStatus = (customerId: string, status: CustomerStatus) => {
    updateCustomerBackend(customerId, {
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add points to customer
  const addPoints = (customerId: string, points: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newPointsBalance = customer.loyalty.pointsBalance + points;
    const newTotalPointsEarned = customer.loyalty.totalPointsEarned + points;

    // Check for tier upgrade
    let newTier = customer.loyalty.tier;
    for (const tierInfo of [...TIER_BENEFITS].reverse()) {
      if (newTotalPointsEarned >= tierInfo.pointsRequired) {
        newTier = tierInfo.tier;
        break;
      }
    }

    updateCustomerBackend(customerId, {
      loyalty: {
        ...customer.loyalty,
        pointsBalance: newPointsBalance,
        totalPointsEarned: newTotalPointsEarned,
        tier: newTier,
        lastTierUpgrade: newTier !== customer.loyalty.tier ? new Date().toISOString().split('T')[0] : customer.loyalty.lastTierUpgrade,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Redeem points
  const redeemPoints = (customerId: string, points: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || customer.loyalty.pointsBalance < points) {
      setValidationMessage('Insufficient points balance');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    updateCustomerBackend(customerId, {
      loyalty: {
        ...customer.loyalty,
        pointsBalance: customer.loyalty.pointsBalance - points,
        pointsRedeemed: customer.loyalty.pointsRedeemed + points,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete customer
  const deleteCustomer = async (customerId: string) => {
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer account?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteCustomerBackend(customerId);
    }
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch =
        searchTerm === '' ||
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = tierFilter === 'all' || customer.loyalty.tier === tierFilter;
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [customers, searchTerm, tierFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const active = customers.filter(c => c.status === 'active').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgOrderValue = customers.length > 0
      ? customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length
      : 0;
    const tierCounts = TIER_BENEFITS.reduce((acc, tier) => {
      acc[tier.tier] = customers.filter(c => c.loyalty.tier === tier.tier).length;
      return acc;
    }, {} as Record<CustomerTier, number>);

    return {
      total: customers.length,
      active,
      totalRevenue,
      avgOrderValue,
      tierCounts,
      topCustomers: [...customers]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5),
    };
  }, [customers]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.customerAccountDryClean.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.customerAccountDryClean.customerAccounts', 'Customer Accounts')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.customerAccountDryClean.manageCustomerProfilesPreferencesAnd', 'Manage customer profiles, preferences, and loyalty programs')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="customer-account-dry-clean" toolName="Customer Account Dry Clean" />

              <SyncStatus
                isSynced={customersSynced}
                isSaving={customersSaving}
                lastSaved={customersLastSaved}
                syncError={customersSyncError}
                onForceSync={forceCustomersSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(customers, CUSTOMER_COLUMNS, { filename: 'customer-accounts' })}
                onExportExcel={() => exportToExcel(customers, CUSTOMER_COLUMNS, { filename: 'customer-accounts' })}
                onExportJSON={() => exportToJSON(customers, { filename: 'customer-accounts' })}
                onExportPDF={async () => {
                  await exportToPDF(customers, CUSTOMER_COLUMNS, {
                    filename: 'customer-accounts',
                    title: 'Customer Accounts Report',
                    subtitle: `${customers.length} customers`,
                  });
                }}
                onPrint={() => printData(customers, CUSTOMER_COLUMNS, { title: 'Customer Accounts' })}
                onCopyToClipboard={async () => await copyUtil(customers, CUSTOMER_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerAccountDryClean.totalCustomers', 'Total Customers')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{t('tools.customerAccountDryClean.active', 'Active')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>{stats.active}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>{t('tools.customerAccountDryClean.totalRevenue', 'Total Revenue')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-teal-300' : 'text-teal-700'}`}>${stats.totalRevenue.toFixed(0)}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{t('tools.customerAccountDryClean.avgOrder', 'Avg Order')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>${stats.avgOrderValue.toFixed(2)}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.customerAccountDryClean.goldMembers', 'Gold+ Members')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                {(stats.tierCounts.gold || 0) + (stats.tierCounts.platinum || 0) + (stats.tierCounts.vip || 0)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{t('tools.customerAccountDryClean.vipMembers', 'VIP Members')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{stats.tierCounts.vip || 0}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'customers', label: 'All Customers', icon: <Users className="w-4 h-4" /> },
              { id: 'new', label: 'New Customer', icon: <Plus className="w-4 h-4" /> },
              { id: 'loyalty', label: 'Loyalty Program', icon: <Award className="w-4 h-4" /> },
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

        {/* New Customer Tab */}
        {activeTab === 'new' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.customerAccountDryClean.createNewCustomerAccount', 'Create New Customer Account')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.firstName', 'First Name *')}
                </label>
                <input
                  type="text"
                  value={newCustomer.firstName || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.customerAccountDryClean.firstName2', 'First name')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.lastName', 'Last Name *')}
                </label>
                <input
                  type="text"
                  value={newCustomer.lastName || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.customerAccountDryClean.lastName2', 'Last name')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.phone', 'Phone *')}
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.email', 'Email')}
                </label>
                <input
                  type="email"
                  value={newCustomer.email || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.customerAccountDryClean.emailExampleCom', 'email@example.com')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.alternatePhone', 'Alternate Phone')}
                </label>
                <input
                  type="tel"
                  value={newCustomer.alternatePhone || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, alternatePhone: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="(555) 987-6543"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.defaultPayment', 'Default Payment')}
                </label>
                <select
                  value={newCustomer.defaultPaymentMethod || 'credit_card'}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, defaultPaymentMethod: e.target.value as PaymentMethod }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {PAYMENT_METHODS.map(p => (
                    <option key={p.method} value={p.method}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.address', 'Address')}
                </label>
                <input
                  type="text"
                  value={newCustomer.address || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.customerAccountDryClean.123MainStreet', '123 Main Street')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.city', 'City')}
                </label>
                <input
                  type="text"
                  value={newCustomer.city || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, city: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.customerAccountDryClean.city2', 'City')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.zipCode', 'ZIP Code')}
                </label>
                <input
                  type="text"
                  value={newCustomer.zipCode || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, zipCode: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="12345"
                />
              </div>
            </div>

            {/* Preferences */}
            <h3 className={`text-sm font-semibold mt-6 mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.customerAccountDryClean.preferences', 'Preferences')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.starchPreference', 'Starch Preference')}
                </label>
                <select
                  value={newCustomer.preferences?.starchPreference || 'none'}
                  onChange={(e) => setNewCustomer(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences!, starchPreference: e.target.value as any }
                  }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="none">{t('tools.customerAccountDryClean.noStarch', 'No Starch')}</option>
                  <option value="light">{t('tools.customerAccountDryClean.light', 'Light')}</option>
                  <option value="medium">{t('tools.customerAccountDryClean.medium', 'Medium')}</option>
                  <option value="heavy">{t('tools.customerAccountDryClean.heavy', 'Heavy')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.hangerPreference', 'Hanger Preference')}
                </label>
                <select
                  value={newCustomer.preferences?.hangerPreference || 'plastic'}
                  onChange={(e) => setNewCustomer(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences!, hangerPreference: e.target.value as any }
                  }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="wire">{t('tools.customerAccountDryClean.wire', 'Wire')}</option>
                  <option value="plastic">{t('tools.customerAccountDryClean.plastic', 'Plastic')}</option>
                  <option value="wood">{t('tools.customerAccountDryClean.wood', 'Wood')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerAccountDryClean.creditLimit', 'Credit Limit')}
                </label>
                <input
                  type="number"
                  value={newCustomer.creditLimit || 500}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) || 500 }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  min="0"
                  step="100"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCustomer.preferences?.foldingPreference || false}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences!, foldingPreference: e.target.checked }
                    }))}
                    className="w-5 h-5 rounded"
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerAccountDryClean.preferFolded', 'Prefer Folded')}
                  </span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.customerAccountDryClean.notes', 'Notes')}
              </label>
              <textarea
                value={newCustomer.notes || ''}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                rows={2}
                placeholder={t('tools.customerAccountDryClean.additionalNotesAboutThisCustomer', 'Additional notes about this customer...')}
              />
            </div>

            <button
              onClick={createCustomer}
              className="w-full py-3 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0D9488]/90 transition-colors"
            >
              {t('tools.customerAccountDryClean.createCustomerAccount', 'Create Customer Account')}
            </button>
          </div>
        )}

        {/* Loyalty Program Tab */}
        {activeTab === 'loyalty' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Tier Benefits */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.customerAccountDryClean.loyaltyTierBenefits', 'Loyalty Tier Benefits')}
              </h2>
              <div className="space-y-3">
                {TIER_BENEFITS.map(tier => (
                  <div
                    key={tier.tier}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${tier.color} flex items-center justify-center`}>
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {tier.label}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {tier.pointsRequired.toLocaleString()} points required
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {tier.discount}% OFF
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {stats.tierCounts[tier.tier] || 0} members
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Customers */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.customerAccountDryClean.topCustomers', 'Top Customers')}
              </h2>
              <div className="space-y-3">
                {stats.topCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-700' : 'bg-gray-600'
                      } text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {customer.visitCount} visits
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${customer.totalSpent.toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        TIER_BENEFITS.find(t => t.tier === customer.loyalty.tier)?.color || 'bg-gray-500'
                      } text-white`}>
                        {TIER_BENEFITS.find(t => t.tier === customer.loyalty.tier)?.label}
                      </span>
                    </div>
                  </div>
                ))}
                {stats.topCustomers.length === 0 && (
                  <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('tools.customerAccountDryClean.noCustomersYet', 'No customers yet')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customers List Tab */}
        {activeTab === 'customers' && (
          <>
            {/* Filters */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('tools.customerAccountDryClean.searchByNameAccountPhone', 'Search by name, account #, phone, or email...')}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value as CustomerTier | 'all')}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.customerAccountDryClean.allTiers', 'All Tiers')}</option>
                    {TIER_BENEFITS.map(t => (
                      <option key={t.tier} value={t.tier}>{t.label}</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'all')}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.customerAccountDryClean.allStatuses', 'All Statuses')}</option>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.status} value={s.status}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center col-span-full`}>
                  <Users className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.customerAccountDryClean.noCustomersFound', 'No customers found')}
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {searchTerm || tierFilter !== 'all' || statusFilter !== 'all'
                      ? t('tools.customerAccountDryClean.tryAdjustingYourSearchOr', 'Try adjusting your search or filters') : t('tools.customerAccountDryClean.createANewCustomerAccount', 'Create a new customer account to get started')}
                  </p>
                </div>
              ) : (
                filteredCustomers.map(customer => (
                  <div
                    key={customer.id}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${
                          TIER_BENEFITS.find(t => t.tier === customer.loyalty.tier)?.color || 'bg-gray-500'
                        } flex items-center justify-center text-white font-bold`}>
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {customer.firstName} {customer.lastName}
                          </h3>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            #{customer.accountNumber}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        STATUS_OPTIONS.find(s => s.status === customer.status)?.color || 'bg-gray-500'
                      } text-white`}>
                        {STATUS_OPTIONS.find(s => s.status === customer.status)?.label}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Phone className="w-4 h-4" /> {customer.phone}
                      </p>
                      {customer.email && (
                        <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          <Mail className="w-4 h-4" /> {customer.email}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerAccountDryClean.visits', 'Visits')}</p>
                        <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{customer.visitCount}</p>
                      </div>
                      <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerAccountDryClean.spent', 'Spent')}</p>
                        <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${customer.totalSpent.toFixed(0)}</p>
                      </div>
                      <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerAccountDryClean.points', 'Points')}</p>
                        <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{customer.loyalty.pointsBalance}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          TIER_BENEFITS.find(t => t.tier === customer.loyalty.tier)?.color || 'bg-gray-500'
                        } text-white`}>
                          {TIER_BENEFITS.find(t => t.tier === customer.loyalty.tier)?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateCustomerStatus(customer.id, customer.status === 'active' ? 'inactive' : 'active')}
                          className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
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
}

export default CustomerAccountDryCleanTool;
