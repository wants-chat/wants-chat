'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Calendar,
  Star,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  Briefcase,
  Shield,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface SubcontractorToolProps {
  uiConfig?: UIConfig;
}

// Types
type SubcontractorStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'preferred';
type TradeType = 'electrical' | 'plumbing' | 'hvac' | 'concrete' | 'framing' | 'roofing' | 'drywall' | 'painting' | 'flooring' | 'landscaping' | 'demolition' | 'excavation' | 'masonry' | 'steel' | 'glazing' | 'fire-protection' | 'general';

interface Insurance {
  type: string;
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  expirationDate: string;
}

interface License {
  type: string;
  number: string;
  state: string;
  expirationDate: string;
}

interface Contract {
  id: string;
  projectName: string;
  contractAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending' | 'cancelled';
}

interface PerformanceReview {
  id: string;
  projectName: string;
  date: string;
  qualityRating: number;
  timelinessRating: number;
  safetyRating: number;
  communicationRating: number;
  overallRating: number;
  notes: string;
}

interface Subcontractor {
  id: string;
  companyName: string;
  trade: TradeType;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website: string;
  taxId: string;
  status: SubcontractorStatus;
  insurance: Insurance[];
  licenses: License[];
  contracts: Contract[];
  performanceReviews: PerformanceReview[];
  averageRating: number;
  totalContractValue: number;
  prequalified: boolean;
  minorityOwned: boolean;
  womenOwned: boolean;
  veteranOwned: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const TRADES: { type: TradeType; label: string }[] = [
  { type: 'electrical', label: 'Electrical' },
  { type: 'plumbing', label: 'Plumbing' },
  { type: 'hvac', label: 'HVAC' },
  { type: 'concrete', label: 'Concrete' },
  { type: 'framing', label: 'Framing/Carpentry' },
  { type: 'roofing', label: 'Roofing' },
  { type: 'drywall', label: 'Drywall' },
  { type: 'painting', label: 'Painting' },
  { type: 'flooring', label: 'Flooring' },
  { type: 'landscaping', label: 'Landscaping' },
  { type: 'demolition', label: 'Demolition' },
  { type: 'excavation', label: 'Excavation/Sitework' },
  { type: 'masonry', label: 'Masonry' },
  { type: 'steel', label: 'Structural Steel' },
  { type: 'glazing', label: 'Glazing/Windows' },
  { type: 'fire-protection', label: 'Fire Protection' },
  { type: 'general', label: 'General' },
];

const STATUS_OPTIONS: { status: SubcontractorStatus; label: string; color: string }[] = [
  { status: 'active', label: 'Active', color: 'green' },
  { status: 'preferred', label: 'Preferred', color: 'blue' },
  { status: 'pending', label: 'Pending', color: 'yellow' },
  { status: 'inactive', label: 'Inactive', color: 'gray' },
  { status: 'suspended', label: 'Suspended', color: 'red' },
];

const INSURANCE_TYPES = [
  'General Liability',
  'Workers Compensation',
  'Auto Liability',
  'Umbrella/Excess',
  'Professional Liability',
  'Builders Risk',
];

// Column configuration for exports
const SUBCONTRACTOR_COLUMNS: ColumnConfig[] = [
  { key: 'companyName', header: 'Company', type: 'string' },
  { key: 'trade', header: 'Trade', type: 'string' },
  { key: 'contactName', header: 'Contact', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'averageRating', header: 'Rating', type: 'number' },
  { key: 'totalContractValue', header: 'Total Contract Value', type: 'currency' },
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
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status: SubcontractorStatus, isDark: boolean) => {
  const colors = {
    active: isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700',
    preferred: isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700',
    pending: isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
    inactive: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700',
    suspended: isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700',
  };
  return colors[status];
};

const renderStars = (rating: number, isDark: boolean) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`w-4 h-4 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : isDark ? 'text-gray-600' : 'text-gray-300'}`}
      />
    );
  }
  return <div className="flex gap-0.5">{stars}</div>;
};

// Main Component
export const SubcontractorTool: React.FC<SubcontractorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: subcontractors,
    addItem: addSubcontractorToBackend,
    updateItem: updateSubcontractorBackend,
    deleteItem: deleteSubcontractorBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
  } = useToolData<Subcontractor>('subcontractors', [], SUBCONTRACTOR_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedSubcontractorId, setSelectedSubcontractorId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrade, setFilterTrade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedSubcontractorId, setExpandedSubcontractorId] = useState<string | null>(null);
  const [activeFormSection, setActiveFormSection] = useState<string>('basic');

  // Form state
  const [formData, setFormData] = useState<Partial<Subcontractor>>({
    companyName: '',
    trade: 'general',
    contactName: '',
    contactTitle: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    taxId: '',
    status: 'pending',
    insurance: [],
    licenses: [],
    contracts: [],
    performanceReviews: [],
    averageRating: 0,
    totalContractValue: 0,
    prequalified: false,
    minorityOwned: false,
    womenOwned: false,
    veteranOwned: false,
    notes: '',
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      setFormData((prev) => ({
        ...prev,
        companyName: params.companyName || params.company || '',
        contactName: params.contactName || params.contact || '',
        trade: params.trade || 'general',
        phone: params.phone || '',
        email: params.email || '',
      }));
      setActiveTab('create');
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  // Add insurance
  const addInsurance = () => {
    const insurance: Insurance = {
      type: 'General Liability',
      provider: '',
      policyNumber: '',
      coverageAmount: 1000000,
      expirationDate: '',
    };
    setFormData((prev) => ({
      ...prev,
      insurance: [...(prev.insurance || []), insurance],
    }));
  };

  // Add license
  const addLicense = () => {
    const license: License = {
      type: 'Contractor License',
      number: '',
      state: '',
      expirationDate: '',
    };
    setFormData((prev) => ({
      ...prev,
      licenses: [...(prev.licenses || []), license],
    }));
  };

  // Add performance review
  const addPerformanceReview = () => {
    const review: PerformanceReview = {
      id: generateId(),
      projectName: '',
      date: new Date().toISOString().split('T')[0],
      qualityRating: 3,
      timelinessRating: 3,
      safetyRating: 3,
      communicationRating: 3,
      overallRating: 3,
      notes: '',
    };
    setFormData((prev) => ({
      ...prev,
      performanceReviews: [...(prev.performanceReviews || []), review],
    }));
  };

  // Calculate average rating
  const calculateAverageRating = (reviews: PerformanceReview[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.overallRating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  // Calculate total contract value
  const calculateTotalContractValue = (contracts: Contract[]) => {
    return contracts.reduce((sum, c) => sum + c.contractAmount, 0);
  };

  // Save subcontractor
  const saveSubcontractor = () => {
    if (!formData.companyName || !formData.contactName) {
      setValidationMessage('Please fill in required fields (Company Name, Contact Name)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const avgRating = calculateAverageRating(formData.performanceReviews || []);
    const totalValue = calculateTotalContractValue(formData.contracts || []);

    const subcontractor: Subcontractor = {
      id: selectedSubcontractorId || generateId(),
      companyName: formData.companyName || '',
      trade: formData.trade || 'general',
      contactName: formData.contactName || '',
      contactTitle: formData.contactTitle || '',
      email: formData.email || '',
      phone: formData.phone || '',
      alternatePhone: formData.alternatePhone || '',
      address: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
      zipCode: formData.zipCode || '',
      website: formData.website || '',
      taxId: formData.taxId || '',
      status: formData.status || 'pending',
      insurance: formData.insurance || [],
      licenses: formData.licenses || [],
      contracts: formData.contracts || [],
      performanceReviews: formData.performanceReviews || [],
      averageRating: avgRating,
      totalContractValue: totalValue,
      prequalified: formData.prequalified || false,
      minorityOwned: formData.minorityOwned || false,
      womenOwned: formData.womenOwned || false,
      veteranOwned: formData.veteranOwned || false,
      notes: formData.notes || '',
      createdAt: selectedSubcontractorId ? subcontractors.find((s) => s.id === selectedSubcontractorId)?.createdAt || now : now,
      updatedAt: now,
    };

    if (selectedSubcontractorId) {
      updateSubcontractorBackend(selectedSubcontractorId, subcontractor);
    } else {
      addSubcontractorToBackend(subcontractor);
    }

    resetForm();
    setActiveTab('list');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      companyName: '',
      trade: 'general',
      contactName: '',
      contactTitle: '',
      email: '',
      phone: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      website: '',
      taxId: '',
      status: 'pending',
      insurance: [],
      licenses: [],
      contracts: [],
      performanceReviews: [],
      averageRating: 0,
      totalContractValue: 0,
      prequalified: false,
      minorityOwned: false,
      womenOwned: false,
      veteranOwned: false,
      notes: '',
    });
    setSelectedSubcontractorId(null);
    setIsPrefilled(false);
    setActiveFormSection('basic');
  };

  // Edit subcontractor
  const editSubcontractor = (sub: Subcontractor) => {
    setFormData(sub);
    setSelectedSubcontractorId(sub.id);
    setActiveTab('create');
  };

  // Delete subcontractor
  const deleteSubcontractor = async (subId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this subcontractor?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteSubcontractorBackend(subId);
  };

  // Filtered subcontractors
  const filteredSubcontractors = useMemo(() => {
    return subcontractors.filter((sub) => {
      const matchesSearch =
        searchTerm === '' ||
        sub.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.contactName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTrade = filterTrade === 'all' || sub.trade === filterTrade;
      const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
      return matchesSearch && matchesTrade && matchesStatus;
    });
  }, [subcontractors, searchTerm, filterTrade, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const activeCount = subcontractors.filter((s) => s.status === 'active' || s.status === 'preferred').length;
    const pendingCount = subcontractors.filter((s) => s.status === 'pending').length;
    const totalValue = subcontractors.reduce((sum, s) => sum + s.totalContractValue, 0);
    const avgRating = subcontractors.length > 0
      ? subcontractors.reduce((sum, s) => sum + s.averageRating, 0) / subcontractors.length
      : 0;
    const expiringInsurance = subcontractors.filter((s) => {
      return s.insurance.some((i) => {
        const expDate = new Date(i.expirationDate);
        const thirtyDays = new Date();
        thirtyDays.setDate(thirtyDays.getDate() + 30);
        return expDate <= thirtyDays && expDate >= new Date();
      });
    }).length;

    return {
      total: subcontractors.length,
      active: activeCount,
      pending: pendingCount,
      totalValue,
      avgRating: Math.round(avgRating * 10) / 10,
      expiringInsurance,
    };
  }, [subcontractors]);

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const cardBorder = isDark ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';

  return (
    <>
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.subcontractor.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${cardBg} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary}`}>
                  {t('tools.subcontractor.subcontractorManagement', 'Subcontractor Management')}
                </h1>
                <p className={`text-sm ${textSecondary}`}>
                  {t('tools.subcontractor.manageSubcontractorsTrackComplianceAnd', 'Manage subcontractors, track compliance, and monitor performance')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="subcontractor" toolName="Subcontractor" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportCSV()}
                onExportExcel={() => exportExcel()}
                onExportJSON={() => exportJSON()}
                onExportPDF={() => exportPDF({ title: 'Subcontractors' })}
                onCopyToClipboard={() => copyToClipboard()}
                onPrint={() => print('Subcontractors')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span className={`text-xs ${textSecondary}`}>{t('tools.subcontractor.total', 'Total')}</span>
              </div>
              <p className={`text-xl font-bold ${textPrimary}`}>{stats.total}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className={`text-xs ${textSecondary}`}>{t('tools.subcontractor.active', 'Active')}</span>
              </div>
              <p className={`text-xl font-bold ${textPrimary}`}>{stats.active}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className={`text-xs ${textSecondary}`}>{t('tools.subcontractor.pending', 'Pending')}</span>
              </div>
              <p className={`text-xl font-bold ${textPrimary}`}>{stats.pending}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className={`text-xs ${textSecondary}`}>{t('tools.subcontractor.avgRating', 'Avg Rating')}</span>
              </div>
              <p className={`text-xl font-bold ${textPrimary}`}>{stats.avgRating}/5</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className={`text-xs ${textSecondary}`}>{t('tools.subcontractor.contractValue', 'Contract Value')}</span>
              </div>
              <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className={`text-xs ${textSecondary}`}>{t('tools.subcontractor.expiringIns', 'Expiring Ins.')}</span>
              </div>
              <p className={`text-xl font-bold ${stats.expiringInsurance > 0 ? 'text-red-500' : textPrimary}`}>
                {stats.expiringInsurance}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-700 pb-3">
            {[
              { id: 'list', label: 'All Subcontractors', icon: Users },
              { id: 'create', label: selectedSubcontractorId ? t('tools.subcontractor.edit2', 'Edit') : t('tools.subcontractor.addNew', 'Add New'), icon: Plus },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  if (id === 'create' && !selectedSubcontractorId) resetForm();
                  setActiveTab(id as any);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-[#0D9488] text-white'
                    : `${textSecondary} hover:bg-gray-700`
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <input
                    type="text"
                    placeholder={t('tools.subcontractor.searchSubcontractors', 'Search subcontractors...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  />
                </div>
              </div>
              <select
                value={filterTrade}
                onChange={(e) => setFilterTrade(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
              >
                <option value="all">{t('tools.subcontractor.allTrades', 'All Trades')}</option>
                {TRADES.map((t) => (
                  <option key={t.type} value={t.type}>{t.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
              >
                <option value="all">{t('tools.subcontractor.allStatus', 'All Status')}</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.status} value={s.status}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Subcontractors List */}
            <div className="space-y-4">
              {filteredSubcontractors.length === 0 ? (
                <div className={`text-center py-12 ${textSecondary}`}>
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.subcontractor.noSubcontractorsFoundAddYour', 'No subcontractors found. Add your first subcontractor.')}</p>
                </div>
              ) : (
                filteredSubcontractors.map((sub) => (
                  <div key={sub.id} className={`border ${cardBorder} rounded-lg overflow-hidden`}>
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setExpandedSubcontractorId(expandedSubcontractorId === sub.id ? null : sub.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {expandedSubcontractorId === sub.id ? (
                              <ChevronUp className={`w-5 h-5 ${textSecondary}`} />
                            ) : (
                              <ChevronDown className={`w-5 h-5 ${textSecondary}`} />
                            )}
                            <Building2 className={`w-5 h-5 ${textSecondary}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold ${textPrimary}`}>{sub.companyName}</h3>
                              {sub.prequalified && (
                                <Award className="w-4 h-4 text-green-500" title={t('tools.subcontractor.prequalified2', 'Prequalified')} />
                              )}
                            </div>
                            <p className={`text-sm ${textSecondary}`}>
                              {TRADES.find((t) => t.type === sub.trade)?.label} | {sub.contactName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {renderStars(sub.averageRating, isDark)}
                            <p className={`text-sm ${textSecondary}`}>{formatCurrency(sub.totalContractValue)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status, isDark)}`}>
                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedSubcontractorId === sub.id && (
                      <div className={`border-t ${cardBorder} p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.subcontractor.phone', 'Phone')}</p>
                            <p className={`font-medium ${textPrimary}`}>{sub.phone || '-'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.subcontractor.email', 'Email')}</p>
                            <p className={`font-medium ${textPrimary}`}>{sub.email || '-'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.subcontractor.location', 'Location')}</p>
                            <p className={`font-medium ${textPrimary}`}>{sub.city}, {sub.state}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.subcontractor.contracts', 'Contracts')}</p>
                            <p className={`font-medium ${textPrimary}`}>{sub.contracts.length}</p>
                          </div>
                        </div>

                        {/* Certifications */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {sub.minorityOwned && (
                            <span className={`px-2 py-1 rounded-full text-xs ${isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                              {t('tools.subcontractor.minorityOwned', 'Minority Owned')}
                            </span>
                          )}
                          {sub.womenOwned && (
                            <span className={`px-2 py-1 rounded-full text-xs ${isDark ? 'bg-pink-900 text-pink-300' : 'bg-pink-100 text-pink-700'}`}>
                              {t('tools.subcontractor.womenOwned', 'Women Owned')}
                            </span>
                          )}
                          {sub.veteranOwned && (
                            <span className={`px-2 py-1 rounded-full text-xs ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                              {t('tools.subcontractor.veteranOwned', 'Veteran Owned')}
                            </span>
                          )}
                        </div>

                        {/* Insurance Status */}
                        {sub.insurance.length > 0 && (
                          <div className="mb-4">
                            <p className={`text-sm font-medium ${textPrimary} mb-2`}>{t('tools.subcontractor.insurance', 'Insurance:')}</p>
                            <div className="flex flex-wrap gap-2">
                              {sub.insurance.map((ins, idx) => {
                                const isExpired = new Date(ins.expirationDate) < new Date();
                                const isExpiringSoon = new Date(ins.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                                return (
                                  <span
                                    key={idx}
                                    className={`px-2 py-1 rounded text-xs ${
                                      isExpired
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                        : isExpiringSoon
                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    }`}
                                  >
                                    {ins.type}: {formatDate(ins.expirationDate)}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => editSubcontractor(sub)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                            {t('tools.subcontractor.edit', 'Edit')}
                          </button>
                          <button
                            onClick={() => {
                              updateSubcontractorBackend(sub.id, {
                                status: sub.status === 'active' ? 'inactive' : 'active'
                              });
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                              sub.status === 'active'
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {sub.status === 'active' ? t('tools.subcontractor.deactivate', 'Deactivate') : t('tools.subcontractor.activate', 'Activate')}
                          </button>
                          <button
                            onClick={() => deleteSubcontractor(sub.id)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Tab */}
        {activeTab === 'create' && (
          <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold ${textPrimary} mb-6`}>
              {selectedSubcontractorId ? t('tools.subcontractor.editSubcontractor', 'Edit Subcontractor') : t('tools.subcontractor.addNewSubcontractor', 'Add New Subcontractor')}
            </h2>

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'basic', label: 'Basic Info', icon: Building2 },
                { id: 'contact', label: 'Contact', icon: Phone },
                { id: 'compliance', label: 'Compliance', icon: Shield },
                { id: 'performance', label: 'Performance', icon: Star },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveFormSection(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFormSection === id
                      ? 'bg-[#0D9488] text-white'
                      : `${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Basic Info Section */}
            {activeFormSection === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.companyName', 'Company Name *')}</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.trade', 'Trade')}</label>
                    <select
                      value={formData.trade}
                      onChange={(e) => setFormData((prev) => ({ ...prev, trade: e.target.value as TradeType }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    >
                      {TRADES.map((t) => (
                        <option key={t.type} value={t.type}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.status', 'Status')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as SubcontractorStatus }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.status} value={s.status}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.website', 'Website')}</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                      placeholder={t('tools.subcontractor.https', 'https://')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.taxIdEin', 'Tax ID (EIN)')}</label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, taxId: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                      placeholder={t('tools.subcontractor.xxXxxxxxx', 'XX-XXXXXXX')}
                    />
                  </div>
                </div>

                {/* Certifications */}
                <div className="flex flex-wrap gap-4">
                  <label className={`flex items-center gap-2 ${textPrimary}`}>
                    <input
                      type="checkbox"
                      checked={formData.prequalified}
                      onChange={(e) => setFormData((prev) => ({ ...prev, prequalified: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    {t('tools.subcontractor.prequalified', 'Prequalified')}
                  </label>
                  <label className={`flex items-center gap-2 ${textPrimary}`}>
                    <input
                      type="checkbox"
                      checked={formData.minorityOwned}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minorityOwned: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    {t('tools.subcontractor.minorityOwned2', 'Minority Owned')}
                  </label>
                  <label className={`flex items-center gap-2 ${textPrimary}`}>
                    <input
                      type="checkbox"
                      checked={formData.womenOwned}
                      onChange={(e) => setFormData((prev) => ({ ...prev, womenOwned: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    {t('tools.subcontractor.womenOwned2', 'Women Owned')}
                  </label>
                  <label className={`flex items-center gap-2 ${textPrimary}`}>
                    <input
                      type="checkbox"
                      checked={formData.veteranOwned}
                      onChange={(e) => setFormData((prev) => ({ ...prev, veteranOwned: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    {t('tools.subcontractor.veteranOwned2', 'Veteran Owned')}
                  </label>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.notes', 'Notes')}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeFormSection === 'contact' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.contactName', 'Contact Name *')}</label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.title', 'Title')}</label>
                    <input
                      type="text"
                      value={formData.contactTitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contactTitle: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.email2', 'Email')}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.phone2', 'Phone')}</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.address', 'Address')}</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.city', 'City')}</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.state', 'State')}</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.zip', 'ZIP')}</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Section */}
            {activeFormSection === 'compliance' && (
              <div className="space-y-6">
                {/* Insurance */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.subcontractor.insurance2', 'Insurance')}</h3>
                    <button
                      onClick={addInsurance}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0B7C72]"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.subcontractor.addInsurance', 'Add Insurance')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.insurance || []).map((ins, idx) => (
                      <div key={idx} className={`grid grid-cols-5 gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <select
                          value={ins.type}
                          onChange={(e) => {
                            const updated = [...(formData.insurance || [])];
                            updated[idx] = { ...ins, type: e.target.value };
                            setFormData((prev) => ({ ...prev, insurance: updated }));
                          }}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        >
                          {INSURANCE_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder={t('tools.subcontractor.provider', 'Provider')}
                          value={ins.provider}
                          onChange={(e) => {
                            const updated = [...(formData.insurance || [])];
                            updated[idx] = { ...ins, provider: e.target.value };
                            setFormData((prev) => ({ ...prev, insurance: updated }));
                          }}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        />
                        <input
                          type="number"
                          placeholder={t('tools.subcontractor.coverage', 'Coverage $')}
                          value={ins.coverageAmount}
                          onChange={(e) => {
                            const updated = [...(formData.insurance || [])];
                            updated[idx] = { ...ins, coverageAmount: Number(e.target.value) };
                            setFormData((prev) => ({ ...prev, insurance: updated }));
                          }}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        />
                        <input
                          type="date"
                          value={ins.expirationDate}
                          onChange={(e) => {
                            const updated = [...(formData.insurance || [])];
                            updated[idx] = { ...ins, expirationDate: e.target.value };
                            setFormData((prev) => ({ ...prev, insurance: updated }));
                          }}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        />
                        <button
                          onClick={() => {
                            const updated = (formData.insurance || []).filter((_, i) => i !== idx);
                            setFormData((prev) => ({ ...prev, insurance: updated }));
                          }}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Licenses */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.subcontractor.licenses', 'Licenses')}</h3>
                    <button
                      onClick={addLicense}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0B7C72]"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.subcontractor.addLicense', 'Add License')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.licenses || []).map((lic, idx) => (
                      <div key={idx} className={`grid grid-cols-5 gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <input
                          type="text"
                          placeholder={t('tools.subcontractor.licenseType', 'License Type')}
                          value={lic.type}
                          onChange={(e) => {
                            const updated = [...(formData.licenses || [])];
                            updated[idx] = { ...lic, type: e.target.value };
                            setFormData((prev) => ({ ...prev, licenses: updated }));
                          }}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        />
                        <input
                          type="text"
                          placeholder="Number"
                          value={lic.number}
                          onChange={(e) => {
                            const updated = [...(formData.licenses || [])];
                            updated[idx] = { ...lic, number: e.target.value };
                            setFormData((prev) => ({ ...prev, licenses: updated }));
                          }}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        />
                        <input
                          type="text"
                          placeholder={t('tools.subcontractor.state2', 'State')}
                          value={lic.state}
                          onChange={(e) => {
                            const updated = [...(formData.licenses || [])];
                            updated[idx] = { ...lic, state: e.target.value };
                            setFormData((prev) => ({ ...prev, licenses: updated }));
                          }}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        />
                        <input
                          type="date"
                          value={lic.expirationDate}
                          onChange={(e) => {
                            const updated = [...(formData.licenses || [])];
                            updated[idx] = { ...lic, expirationDate: e.target.value };
                            setFormData((prev) => ({ ...prev, licenses: updated }));
                          }}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        />
                        <button
                          onClick={() => {
                            const updated = (formData.licenses || []).filter((_, i) => i !== idx);
                            setFormData((prev) => ({ ...prev, licenses: updated }));
                          }}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Section */}
            {activeFormSection === 'performance' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.subcontractor.performanceReviews', 'Performance Reviews')}</h3>
                  <button
                    onClick={addPerformanceReview}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0B7C72]"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.subcontractor.addReview', 'Add Review')}
                  </button>
                </div>
                <div className="space-y-4">
                  {(formData.performanceReviews || []).map((review, idx) => (
                    <div key={review.id} className={`p-4 rounded-lg border ${cardBorder}`}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.project', 'Project')}</label>
                          <input
                            type="text"
                            value={review.projectName}
                            onChange={(e) => {
                              const updated = [...(formData.performanceReviews || [])];
                              updated[idx] = { ...review, projectName: e.target.value };
                              setFormData((prev) => ({ ...prev, performanceReviews: updated }));
                            }}
                            className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.date', 'Date')}</label>
                          <input
                            type="date"
                            value={review.date}
                            onChange={(e) => {
                              const updated = [...(formData.performanceReviews || [])];
                              updated[idx] = { ...review, date: e.target.value };
                              setFormData((prev) => ({ ...prev, performanceReviews: updated }));
                            }}
                            className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.overallRating', 'Overall Rating')}</label>
                          <select
                            value={review.overallRating}
                            onChange={(e) => {
                              const updated = [...(formData.performanceReviews || [])];
                              updated[idx] = { ...review, overallRating: Number(e.target.value) };
                              setFormData((prev) => ({ ...prev, performanceReviews: updated }));
                            }}
                            className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => {
                              const updated = (formData.performanceReviews || []).filter((r) => r.id !== review.id);
                              setFormData((prev) => ({ ...prev, performanceReviews: updated }));
                            }}
                            className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.subcontractor.notes2', 'Notes')}</label>
                        <textarea
                          value={review.notes}
                          onChange={(e) => {
                            const updated = [...(formData.performanceReviews || [])];
                            updated[idx] = { ...review, notes: e.target.value };
                            setFormData((prev) => ({ ...prev, performanceReviews: updated }));
                          }}
                          className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={saveSubcontractor}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0D9488] text-white font-medium hover:bg-[#0B7C72]"
              >
                <Save className="w-5 h-5" />
                {selectedSubcontractorId ? t('tools.subcontractor.update', 'Update') : t('tools.subcontractor.save', 'Save')} Subcontractor
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('list');
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border ${cardBorder} ${textSecondary} font-medium hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X className="w-5 h-5" />
                {t('tools.subcontractor.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default SubcontractorTool;
