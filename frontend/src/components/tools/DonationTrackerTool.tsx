'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Heart,
  DollarSign,
  Calendar,
  User,
  Receipt,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  TrendingUp,
  Gift,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  FileText,
  CreditCard,
  Building2,
  Tag,
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

interface DonationTrackerToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type PaymentMethod = 'credit_card' | 'check' | 'cash' | 'bank_transfer' | 'paypal' | 'crypto' | 'stock';
type DonationType = 'one_time' | 'recurring' | 'pledge' | 'in_kind';
type DonationStatus = 'completed' | 'pending' | 'failed' | 'refunded';

interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isAnonymous: boolean;
  createdAt: string;
}

interface Donation {
  id: string;
  donorId: string;
  amount: number;
  currency: string;
  donationType: DonationType;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  campaign: string;
  designation: string;
  receiptNumber: string;
  taxDeductible: boolean;
  notes: string;
  createdAt: string;
  processedAt: string;
}

interface Campaign {
  id: string;
  name: string;
  goal: number;
  raised: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Receipt {
  id: string;
  donationId: string;
  donorId: string;
  receiptNumber: string;
  amount: number;
  issuedAt: string;
  sentAt: string | null;
  taxYear: number;
}

// Constants
const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'check', label: 'Check' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'stock', label: 'Stock/Securities' },
];

const DONATION_TYPES: { value: DonationType; label: string }[] = [
  { value: 'one_time', label: 'One-Time' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'pledge', label: 'Pledge' },
  { value: 'in_kind', label: 'In-Kind' },
];

// Column configurations for exports
const DONATION_COLUMNS: ColumnConfig[] = [
  { key: 'receiptNumber', header: 'Receipt #', type: 'string' },
  { key: 'donorName', header: 'Donor', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'donationType', header: 'Type', type: 'string' },
  { key: 'paymentMethod', header: 'Payment Method', type: 'string' },
  { key: 'campaign', header: 'Campaign', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Date', type: 'date' },
];

const DONOR_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'createdAt', header: 'Date Added', type: 'date' },
];

const RECEIPT_COLUMNS: ColumnConfig[] = [
  { key: 'receiptNumber', header: 'Receipt #', type: 'string' },
  { key: 'donorName', header: 'Donor', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'taxYear', header: 'Tax Year', type: 'number' },
  { key: 'issuedAt', header: 'Issued', type: 'date' },
  { key: 'sentAt', header: 'Sent', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateReceiptNumber = () => `RCP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
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
export const DonationTrackerTool: React.FC<DonationTrackerToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: donors,
    addItem: addDonorToBackend,
    updateItem: updateDonorBackend,
    deleteItem: deleteDonorBackend,
    isSynced: donorsSynced,
    isSaving: donorsSaving,
    lastSaved: donorsLastSaved,
    syncError: donorsSyncError,
    forceSync: forceDonorsSync,
  } = useToolData<Donor>('donation-donors', [], DONOR_COLUMNS);

  const {
    data: donations,
    addItem: addDonationToBackend,
    updateItem: updateDonationBackend,
    deleteItem: deleteDonationBackend,
    isSynced: donationsSynced,
    isSaving: donationsSaving,
    lastSaved: donationsLastSaved,
    syncError: donationsSyncError,
    forceSync: forceDonationsSync,
  } = useToolData<Donation>('donation-records', [], DONATION_COLUMNS);

  const {
    data: campaigns,
    addItem: addCampaignToBackend,
    updateItem: updateCampaignBackend,
    deleteItem: deleteCampaignBackend,
  } = useToolData<Campaign>('donation-campaigns', [], []);

  const {
    data: receipts,
    addItem: addReceiptToBackend,
    updateItem: updateReceiptBackend,
    deleteItem: deleteReceiptBackend,
  } = useToolData<Receipt>('donation-receipts', [], RECEIPT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'donations' | 'donors' | 'campaigns' | 'receipts' | 'analytics'>('donations');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [selectedDonorId, setSelectedDonorId] = useState<string>('');

  // Form state
  const [newDonor, setNewDonor] = useState<Partial<Donor>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    isAnonymous: false,
  });

  const [newDonation, setNewDonation] = useState<Partial<Donation>>({
    donorId: '',
    amount: 0,
    currency: 'USD',
    donationType: 'one_time',
    paymentMethod: 'credit_card',
    status: 'completed',
    campaign: '',
    designation: '',
    taxDeductible: true,
    notes: '',
  });

  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    goal: 0,
    startDate: '',
    endDate: '',
    isActive: true,
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.donorName || params.firstName || params.lastName) {
        setNewDonor({
          ...newDonor,
          firstName: params.firstName || '',
          lastName: params.lastName || params.donorName?.split(' ').pop() || '',
          email: params.email || '',
          phone: params.phone || '',
        });
        setShowDonorForm(true);
        setIsPrefilled(true);
      }
      if (params.amount) {
        setNewDonation({
          ...newDonation,
          amount: parseFloat(params.amount) || 0,
          campaign: params.campaign || '',
        });
        setShowDonationForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add new donor
  const addDonor = () => {
    if (!newDonor.firstName || !newDonor.lastName) {
      setValidationMessage('Please enter donor name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const donor: Donor = {
      id: generateId(),
      firstName: newDonor.firstName || '',
      lastName: newDonor.lastName || '',
      email: newDonor.email || '',
      phone: newDonor.phone || '',
      address: newDonor.address || '',
      city: newDonor.city || '',
      state: newDonor.state || '',
      zipCode: newDonor.zipCode || '',
      isAnonymous: newDonor.isAnonymous || false,
      createdAt: new Date().toISOString(),
    };

    addDonorToBackend(donor);
    setSelectedDonorId(donor.id);
    setShowDonorForm(false);
    setNewDonor({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      isAnonymous: false,
    });
  };

  // Add new donation
  const addDonation = () => {
    if (!newDonation.donorId || !newDonation.amount || newDonation.amount <= 0) {
      setValidationMessage('Please select a donor and enter a valid amount');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const receiptNumber = generateReceiptNumber();
    const donation: Donation = {
      id: generateId(),
      donorId: newDonation.donorId || '',
      amount: newDonation.amount || 0,
      currency: newDonation.currency || 'USD',
      donationType: newDonation.donationType || 'one_time',
      paymentMethod: newDonation.paymentMethod || 'credit_card',
      status: newDonation.status || 'completed',
      campaign: newDonation.campaign || '',
      designation: newDonation.designation || '',
      receiptNumber,
      taxDeductible: newDonation.taxDeductible ?? true,
      notes: newDonation.notes || '',
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    };

    addDonationToBackend(donation);

    // Create receipt
    const receipt: Receipt = {
      id: generateId(),
      donationId: donation.id,
      donorId: donation.donorId,
      receiptNumber,
      amount: donation.amount,
      issuedAt: new Date().toISOString(),
      sentAt: null,
      taxYear: new Date().getFullYear(),
    };
    addReceiptToBackend(receipt);

    // Update campaign raised amount
    if (donation.campaign) {
      const campaign = campaigns.find(c => c.name === donation.campaign);
      if (campaign) {
        updateCampaignBackend(campaign.id, {
          raised: campaign.raised + donation.amount,
        });
      }
    }

    setShowDonationForm(false);
    setNewDonation({
      donorId: '',
      amount: 0,
      currency: 'USD',
      donationType: 'one_time',
      paymentMethod: 'credit_card',
      status: 'completed',
      campaign: '',
      designation: '',
      taxDeductible: true,
      notes: '',
    });
  };

  // Add new campaign
  const addCampaign = () => {
    if (!newCampaign.name || !newCampaign.goal) {
      setValidationMessage('Please enter campaign name and goal');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const campaign: Campaign = {
      id: generateId(),
      name: newCampaign.name || '',
      goal: newCampaign.goal || 0,
      raised: 0,
      startDate: newCampaign.startDate || new Date().toISOString(),
      endDate: newCampaign.endDate || '',
      isActive: newCampaign.isActive ?? true,
    };

    addCampaignToBackend(campaign);
    setShowCampaignForm(false);
    setNewCampaign({
      name: '',
      goal: 0,
      startDate: '',
      endDate: '',
      isActive: true,
    });
  };

  // Delete functions
  const deleteDonor = async (donorId: string) => {
    const confirmed = await confirm({
      title: 'Delete Donor',
      message: 'Are you sure? This will also delete all associated donations and receipts.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteDonorBackend(donorId);
      donations.filter(d => d.donorId === donorId).forEach(d => deleteDonationBackend(d.id));
      receipts.filter(r => r.donorId === donorId).forEach(r => deleteReceiptBackend(r.id));
    }
  };

  const deleteDonation = async (donationId: string) => {
    const confirmed = await confirm({
      title: 'Delete Donation',
      message: 'Are you sure you want to delete this donation?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteDonationBackend(donationId);
      receipts.filter(r => r.donationId === donationId).forEach(r => deleteReceiptBackend(r.id));
    }
  };

  // Send receipt
  const sendReceipt = (receiptId: string) => {
    updateReceiptBackend(receiptId, { sentAt: new Date().toISOString() });
  };

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalDonations = donations.reduce((sum, d) => d.status === 'completed' ? sum + d.amount : sum, 0);
    const totalDonors = donors.length;
    const avgDonation = donations.length > 0 ? totalDonations / donations.filter(d => d.status === 'completed').length : 0;
    const recurringDonors = new Set(donations.filter(d => d.donationType === 'recurring').map(d => d.donorId)).size;

    const byMonth = donations.reduce((acc, d) => {
      if (d.status !== 'completed') return acc;
      const month = new Date(d.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + d.amount;
      return acc;
    }, {} as Record<string, number>);

    const byCampaign = donations.reduce((acc, d) => {
      if (d.status !== 'completed') return acc;
      const campaign = d.campaign || 'General';
      acc[campaign] = (acc[campaign] || 0) + d.amount;
      return acc;
    }, {} as Record<string, number>);

    const byPaymentMethod = donations.reduce((acc, d) => {
      if (d.status !== 'completed') return acc;
      acc[d.paymentMethod] = (acc[d.paymentMethod] || 0) + d.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDonations,
      totalDonors,
      avgDonation,
      recurringDonors,
      byMonth,
      byCampaign,
      byPaymentMethod,
    };
  }, [donations, donors]);

  // Filtered donations
  const filteredDonations = useMemo(() => {
    return donations.filter(donation => {
      const donor = donors.find(d => d.id === donation.donorId);
      const donorName = donor ? `${donor.firstName} ${donor.lastName}`.toLowerCase() : '';
      const matchesSearch = searchTerm === '' ||
        donorName.includes(searchTerm.toLowerCase()) ||
        donation.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
      const matchesCampaign = filterCampaign === 'all' || donation.campaign === filterCampaign;
      return matchesSearch && matchesStatus && matchesCampaign;
    });
  }, [donations, donors, searchTerm, filterStatus, filterCampaign]);

  const getStatusColor = (status: DonationStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'refunded': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">{validationMessage}</p>
            </div>
          </div>
        )}

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.donationTracker.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.donationTracker.donationTracker', 'Donation Tracker')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.donationTracker.trackDonationsManageDonorsAnd', 'Track donations, manage donors, and generate receipts')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="donation-tracker" toolName="Donation Tracker" />

              <SyncStatus
                isSynced={donationsSynced}
                isSaving={donationsSaving}
                lastSaved={donationsLastSaved}
                syncError={donationsSyncError}
                onForceSync={forceDonationsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = filteredDonations.map(d => {
                    const donor = donors.find(don => don.id === d.donorId);
                    return {
                      ...d,
                      donorName: donor ? `${donor.firstName} ${donor.lastName}` : 'Anonymous',
                    };
                  });
                  exportToCSV(exportData, 'donations', DONATION_COLUMNS);
                }}
                onExportExcel={() => {
                  const exportData = filteredDonations.map(d => {
                    const donor = donors.find(don => don.id === d.donorId);
                    return {
                      ...d,
                      donorName: donor ? `${donor.firstName} ${donor.lastName}` : 'Anonymous',
                    };
                  });
                  exportToExcel(exportData, 'donations', DONATION_COLUMNS);
                }}
                onExportJSON={() => exportToJSON(filteredDonations, 'donations')}
                onExportPDF={() => {
                  const exportData = filteredDonations.map(d => {
                    const donor = donors.find(don => don.id === d.donorId);
                    return {
                      ...d,
                      donorName: donor ? `${donor.firstName} ${donor.lastName}` : 'Anonymous',
                    };
                  });
                  exportToPDF(exportData, 'Donation Report', DONATION_COLUMNS);
                }}
                onCopy={() => copyUtil(filteredDonations)}
                onPrint={() => printData(filteredDonations, 'Donations', DONATION_COLUMNS)}
                theme={theme}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.donationTracker.totalRaised', 'Total Raised')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(analytics.totalDonations)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-blue-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.donationTracker.totalDonors', 'Total Donors')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalDonors}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.donationTracker.avgDonation', 'Avg Donation')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(analytics.avgDonation)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-orange-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.donationTracker.recurringDonors', 'Recurring Donors')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.recurringDonors}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['donations', 'donors', 'campaigns', 'receipts', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-rose-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.donationTracker.searchDonations', 'Search donations...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
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
                    <option value="all">{t('tools.donationTracker.allStatus', 'All Status')}</option>
                    <option value="completed">{t('tools.donationTracker.completed', 'Completed')}</option>
                    <option value="pending">{t('tools.donationTracker.pending', 'Pending')}</option>
                    <option value="failed">{t('tools.donationTracker.failed', 'Failed')}</option>
                    <option value="refunded">{t('tools.donationTracker.refunded', 'Refunded')}</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowDonationForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.donationTracker.addDonation', 'Add Donation')}
                </button>
              </div>

              {/* Donation Form Modal */}
              {showDonationForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.donationTracker.addNewDonation', 'Add New Donation')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.donationTracker.donor', 'Donor *')}
                        </label>
                        <select
                          value={newDonation.donorId}
                          onChange={(e) => setNewDonation({ ...newDonation, donorId: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">{t('tools.donationTracker.selectDonor', 'Select donor...')}</option>
                          {donors.map((donor) => (
                            <option key={donor.id} value={donor.id}>
                              {donor.isAnonymous ? 'Anonymous' : `${donor.firstName} ${donor.lastName}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.donationTracker.amount', 'Amount *')}
                          </label>
                          <input
                            type="number"
                            value={newDonation.amount || ''}
                            onChange={(e) => setNewDonation({ ...newDonation, amount: parseFloat(e.target.value) || 0 })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.donationTracker.currency', 'Currency')}
                          </label>
                          <select
                            value={newDonation.currency}
                            onChange={(e) => setNewDonation({ ...newDonation, currency: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="USD">{t('tools.donationTracker.usd', 'USD')}</option>
                            <option value="EUR">{t('tools.donationTracker.eur', 'EUR')}</option>
                            <option value="GBP">{t('tools.donationTracker.gbp', 'GBP')}</option>
                            <option value="CAD">{t('tools.donationTracker.cad', 'CAD')}</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.donationTracker.type', 'Type')}
                          </label>
                          <select
                            value={newDonation.donationType}
                            onChange={(e) => setNewDonation({ ...newDonation, donationType: e.target.value as DonationType })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {DONATION_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.donationTracker.paymentMethod', 'Payment Method')}
                          </label>
                          <select
                            value={newDonation.paymentMethod}
                            onChange={(e) => setNewDonation({ ...newDonation, paymentMethod: e.target.value as PaymentMethod })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {PAYMENT_METHODS.map((method) => (
                              <option key={method.value} value={method.value}>{method.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.donationTracker.campaign', 'Campaign')}
                        </label>
                        <select
                          value={newDonation.campaign}
                          onChange={(e) => setNewDonation({ ...newDonation, campaign: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">{t('tools.donationTracker.generalFund', 'General Fund')}</option>
                          {campaigns.filter(c => c.isActive).map((campaign) => (
                            <option key={campaign.id} value={campaign.name}>{campaign.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.donationTracker.notes', 'Notes')}
                        </label>
                        <textarea
                          value={newDonation.notes}
                          onChange={(e) => setNewDonation({ ...newDonation, notes: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newDonation.taxDeductible}
                          onChange={(e) => setNewDonation({ ...newDonation, taxDeductible: e.target.checked })}
                          className="rounded"
                        />
                        <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.donationTracker.taxDeductible', 'Tax Deductible')}
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowDonationForm(false)}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {t('tools.donationTracker.cancel', 'Cancel')}
                      </button>
                      <button
                        onClick={addDonation}
                        className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                      >
                        {t('tools.donationTracker.addDonation2', 'Add Donation')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Donations List */}
              <div className="space-y-3">
                {filteredDonations.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.donationTracker.noDonationsFoundAddYour', 'No donations found. Add your first donation to get started.')}</p>
                  </div>
                ) : (
                  filteredDonations.map((donation) => {
                    const donor = donors.find(d => d.id === donation.donorId);
                    return (
                      <div
                        key={donation.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <DollarSign className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(donation.amount, donation.currency)}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {donor?.isAnonymous ? 'Anonymous' : `${donor?.firstName} ${donor?.lastName}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(donation.status)}`}>
                                {donation.status}
                              </span>
                              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDate(donation.createdAt)}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteDonation(donation.id)}
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {donation.campaign && (
                          <div className="mt-2 flex items-center gap-2">
                            <Tag className="w-3 h-3 text-gray-400" />
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {donation.campaign}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Donors Tab */}
          {activeTab === 'donors' && (
            <div>
              <div className="flex justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.donationTracker.searchDonors', 'Search donors...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button
                  onClick={() => setShowDonorForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.donationTracker.addDonor', 'Add Donor')}
                </button>
              </div>

              {/* Donor Form Modal */}
              {showDonorForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.donationTracker.addNewDonor', 'Add New Donor')}
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.donationTracker.firstName', 'First Name *')}
                          </label>
                          <input
                            type="text"
                            value={newDonor.firstName}
                            onChange={(e) => setNewDonor({ ...newDonor, firstName: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.donationTracker.lastName', 'Last Name *')}
                          </label>
                          <input
                            type="text"
                            value={newDonor.lastName}
                            onChange={(e) => setNewDonor({ ...newDonor, lastName: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.donationTracker.email', 'Email')}
                        </label>
                        <input
                          type="email"
                          value={newDonor.email}
                          onChange={(e) => setNewDonor({ ...newDonor, email: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.donationTracker.phone', 'Phone')}
                        </label>
                        <input
                          type="tel"
                          value={newDonor.phone}
                          onChange={(e) => setNewDonor({ ...newDonor, phone: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.donationTracker.address', 'Address')}
                        </label>
                        <input
                          type="text"
                          value={newDonor.address}
                          onChange={(e) => setNewDonor({ ...newDonor, address: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.donationTracker.city', 'City')}
                          </label>
                          <input
                            type="text"
                            value={newDonor.city}
                            onChange={(e) => setNewDonor({ ...newDonor, city: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.donationTracker.state', 'State')}
                          </label>
                          <input
                            type="text"
                            value={newDonor.state}
                            onChange={(e) => setNewDonor({ ...newDonor, state: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.donationTracker.zip', 'Zip')}
                          </label>
                          <input
                            type="text"
                            value={newDonor.zipCode}
                            onChange={(e) => setNewDonor({ ...newDonor, zipCode: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newDonor.isAnonymous}
                          onChange={(e) => setNewDonor({ ...newDonor, isAnonymous: e.target.checked })}
                          className="rounded"
                        />
                        <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.donationTracker.anonymousDonor', 'Anonymous Donor')}
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowDonorForm(false)}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {t('tools.donationTracker.cancel2', 'Cancel')}
                      </button>
                      <button
                        onClick={addDonor}
                        className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                      >
                        {t('tools.donationTracker.addDonor2', 'Add Donor')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Donors List */}
              <div className="space-y-3">
                {donors.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.donationTracker.noDonorsFoundAddYour', 'No donors found. Add your first donor to get started.')}</p>
                  </div>
                ) : (
                  donors
                    .filter(d => {
                      const name = `${d.firstName} ${d.lastName}`.toLowerCase();
                      return searchTerm === '' || name.includes(searchTerm.toLowerCase()) || d.email.toLowerCase().includes(searchTerm.toLowerCase());
                    })
                    .map((donor) => {
                      const donorDonations = donations.filter(d => d.donorId === donor.id && d.status === 'completed');
                      const totalDonated = donorDonations.reduce((sum, d) => sum + d.amount, 0);
                      return (
                        <div
                          key={donor.id}
                          className={`p-4 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                <User className="w-5 h-5 text-blue-500" />
                              </div>
                              <div>
                                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {donor.isAnonymous ? 'Anonymous Donor' : `${donor.firstName} ${donor.lastName}`}
                                </p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {donor.email || 'No email'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {formatCurrency(totalDonated)}
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {donorDonations.length} donation{donorDonations.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteDonor(donor.id)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
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

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div>
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowCampaignForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.donationTracker.addCampaign', 'Add Campaign')}
                </button>
              </div>

              {/* Campaign Form Modal */}
              {showCampaignForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.donationTracker.addNewCampaign', 'Add New Campaign')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.donationTracker.campaignName', 'Campaign Name *')}
                        </label>
                        <input
                          type="text"
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.donationTracker.goalAmount', 'Goal Amount *')}
                        </label>
                        <input
                          type="number"
                          value={newCampaign.goal || ''}
                          onChange={(e) => setNewCampaign({ ...newCampaign, goal: parseFloat(e.target.value) || 0 })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          min="0"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.donationTracker.startDate', 'Start Date')}
                          </label>
                          <input
                            type="date"
                            value={newCampaign.startDate}
                            onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.donationTracker.endDate', 'End Date')}
                          </label>
                          <input
                            type="date"
                            value={newCampaign.endDate}
                            onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowCampaignForm(false)}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {t('tools.donationTracker.cancel3', 'Cancel')}
                      </button>
                      <button
                        onClick={addCampaign}
                        className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                      >
                        {t('tools.donationTracker.addCampaign2', 'Add Campaign')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Campaigns List */}
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.donationTracker.noCampaignsFoundCreateYour', 'No campaigns found. Create your first campaign to get started.')}</p>
                  </div>
                ) : (
                  campaigns.map((campaign) => {
                    const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
                    return (
                      <div
                        key={campaign.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {campaign.name}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {campaign.startDate && formatDate(campaign.startDate)}
                              {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            campaign.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {campaign.isActive ? t('tools.donationTracker.active', 'Active') : t('tools.donationTracker.inactive', 'Inactive')}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              {formatCurrency(campaign.raised)} raised
                            </span>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              {formatCurrency(campaign.goal)} goal
                            </span>
                          </div>
                          <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <div
                              className="h-full rounded-full bg-rose-500 transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {progress.toFixed(1)}% of goal
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Receipts Tab */}
          {activeTab === 'receipts' && (
            <div>
              <div className="space-y-3">
                {receipts.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.donationTracker.noReceiptsFoundReceiptsAre', 'No receipts found. Receipts are automatically generated when donations are added.')}</p>
                  </div>
                ) : (
                  receipts.map((receipt) => {
                    const donor = donors.find(d => d.id === receipt.donorId);
                    return (
                      <div
                        key={receipt.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <FileText className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {receipt.receiptNumber}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {donor?.isAnonymous ? 'Anonymous' : `${donor?.firstName} ${donor?.lastName}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(receipt.amount)}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Tax Year: {receipt.taxYear}
                              </p>
                            </div>
                            {receipt.sentAt ? (
                              <span className="flex items-center gap-1 text-green-500 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                {t('tools.donationTracker.sent', 'Sent')}
                              </span>
                            ) : (
                              <button
                                onClick={() => sendReceipt(receipt.id)}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                              >
                                <Mail className="w-4 h-4" />
                                {t('tools.donationTracker.send', 'Send')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Campaign */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.donationTracker.donationsByCampaign', 'Donations by Campaign')}
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(analytics.byCampaign).map(([campaign, amount]) => (
                      <div key={campaign} className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{campaign}</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ))}
                    {Object.keys(analytics.byCampaign).length === 0 && (
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.donationTracker.noDataYet', 'No data yet')}</p>
                    )}
                  </div>
                </div>

                {/* By Payment Method */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.donationTracker.donationsByPaymentMethod', 'Donations by Payment Method')}
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(analytics.byPaymentMethod).map(([method, amount]) => {
                      const methodLabel = PAYMENT_METHODS.find(m => m.value === method)?.label || method;
                      return (
                        <div key={method} className="flex justify-between items-center">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{methodLabel}</span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      );
                    })}
                    {Object.keys(analytics.byPaymentMethod).length === 0 && (
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.donationTracker.noDataYet2', 'No data yet')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Monthly Trends */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.donationTracker.monthlyDonations', 'Monthly Donations')}
                </h4>
                <div className="space-y-3">
                  {Object.entries(analytics.byMonth).slice(-6).map(([month, amount]) => (
                    <div key={month} className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{month}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))}
                  {Object.keys(analytics.byMonth).length === 0 && (
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.donationTracker.noDataYet3', 'No data yet')}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default DonationTrackerTool;
