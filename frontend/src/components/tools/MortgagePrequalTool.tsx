'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Save,
  TrendingUp,
  Percent,
  Calculator,
  CreditCard,
  PiggyBank,
  AlertCircle,
  CheckCircle,
  Info,
  Building,
  BarChart3,
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
interface MortgagePrequal {
  id: string;
  name: string;
  annualIncome: number;
  monthlyDebts: number;
  creditScore: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  loanTerm: number; // years
  estimatedInterestRate: number;
  propertyTaxRate: number; // annual percentage
  homeInsurance: number; // monthly
  hoaFees: number; // monthly
  maxHomePrice: number;
  maxLoanAmount: number;
  estimatedMonthlyPayment: number;
  frontEndDTI: number;
  backEndDTI: number;
  qualificationStatus: 'excellent' | 'good' | 'marginal' | 'needs-improvement';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface MortgagePrequalToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'mortgage-prequal';

const mortgageColumns: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'annualIncome', header: 'Annual Income', type: 'number' },
  { key: 'creditScore', header: 'Credit Score', type: 'number' },
  { key: 'maxHomePrice', header: 'Max Home Price', type: 'number' },
  { key: 'estimatedMonthlyPayment', header: 'Monthly Payment', type: 'number' },
  { key: 'qualificationStatus', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const calculateMortgageDetails = (
  annualIncome: number,
  monthlyDebts: number,
  creditScore: number,
  downPaymentAmount: number,
  loanTerm: number,
  estimatedInterestRate: number,
  propertyTaxRate: number,
  homeInsurance: number,
  hoaFees: number
): Partial<MortgagePrequal> => {
  const monthlyIncome = annualIncome / 12;

  // DTI limits based on credit score
  let maxFrontEndDTI = 0.28;
  let maxBackEndDTI = 0.36;

  if (creditScore >= 740) {
    maxFrontEndDTI = 0.31;
    maxBackEndDTI = 0.43;
  } else if (creditScore >= 700) {
    maxFrontEndDTI = 0.29;
    maxBackEndDTI = 0.41;
  } else if (creditScore >= 660) {
    maxFrontEndDTI = 0.28;
    maxBackEndDTI = 0.38;
  }

  // Maximum housing payment based on front-end DTI
  const maxHousingPayment = monthlyIncome * maxFrontEndDTI;

  // Maximum total debt payments based on back-end DTI
  const maxTotalDebtPayment = monthlyIncome * maxBackEndDTI;
  const availableForHousing = maxTotalDebtPayment - monthlyDebts;

  // Use the lower of the two limits
  const effectiveMaxHousingPayment = Math.min(maxHousingPayment, availableForHousing);

  // Subtract non-mortgage housing costs to get max P&I + PMI
  const maxPrincipalInterest = effectiveMaxHousingPayment - homeInsurance - hoaFees;

  // Calculate max loan amount using payment formula (solving for principal)
  const monthlyRate = estimatedInterestRate / 100 / 12;
  const numPayments = loanTerm * 12;

  let maxLoanAmount = 0;
  if (monthlyRate > 0) {
    // Account for property tax and PMI in payment calculation
    const estimatedPropertyTaxMonthly = (maxPrincipalInterest * 0.1); // Rough estimate for iteration
    const availableForPrincipalInterest = maxPrincipalInterest - estimatedPropertyTaxMonthly;

    maxLoanAmount = availableForPrincipalInterest *
      ((Math.pow(1 + monthlyRate, numPayments) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)));
  }

  // Ensure loan amount is positive
  maxLoanAmount = Math.max(0, maxLoanAmount);

  // Calculate max home price based on down payment
  const downPaymentPercent = downPaymentAmount > 0 && maxLoanAmount > 0
    ? (downPaymentAmount / (maxLoanAmount + downPaymentAmount)) * 100
    : 20;

  const maxHomePrice = maxLoanAmount + downPaymentAmount;

  // Calculate estimated monthly payment for max home price
  let monthlyPrincipalInterest = 0;
  if (monthlyRate > 0 && maxLoanAmount > 0) {
    monthlyPrincipalInterest = maxLoanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  const monthlyPropertyTax = (maxHomePrice * propertyTaxRate / 100) / 12;

  // PMI if down payment < 20%
  const pmiRate = downPaymentPercent < 20 ? 0.005 : 0;
  const monthlyPMI = (maxLoanAmount * pmiRate) / 12;

  const estimatedMonthlyPayment = monthlyPrincipalInterest + monthlyPropertyTax +
    homeInsurance + hoaFees + monthlyPMI;

  // Calculate actual DTI ratios
  const frontEndDTI = monthlyIncome > 0
    ? (estimatedMonthlyPayment / monthlyIncome) * 100
    : 0;
  const backEndDTI = monthlyIncome > 0
    ? ((estimatedMonthlyPayment + monthlyDebts) / monthlyIncome) * 100
    : 0;

  // Determine qualification status
  let qualificationStatus: MortgagePrequal['qualificationStatus'] = 'needs-improvement';
  if (creditScore >= 740 && backEndDTI <= 36 && downPaymentPercent >= 20) {
    qualificationStatus = 'excellent';
  } else if (creditScore >= 680 && backEndDTI <= 43 && downPaymentPercent >= 10) {
    qualificationStatus = 'good';
  } else if (creditScore >= 620 && backEndDTI <= 50) {
    qualificationStatus = 'marginal';
  }

  return {
    maxHomePrice: Math.round(maxHomePrice),
    maxLoanAmount: Math.round(maxLoanAmount),
    estimatedMonthlyPayment: Math.round(estimatedMonthlyPayment),
    downPaymentPercent: Math.round(downPaymentPercent * 10) / 10,
    frontEndDTI: Math.round(frontEndDTI * 10) / 10,
    backEndDTI: Math.round(backEndDTI * 10) / 10,
    qualificationStatus,
  };
};

const createNewPrequal = (): MortgagePrequal => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: '',
    annualIncome: 0,
    monthlyDebts: 0,
    creditScore: 700,
    downPaymentAmount: 0,
    downPaymentPercent: 20,
    loanTerm: 30,
    estimatedInterestRate: 7.0,
    propertyTaxRate: 1.2,
    homeInsurance: 150,
    hoaFees: 0,
    maxHomePrice: 0,
    maxLoanAmount: 0,
    estimatedMonthlyPayment: 0,
    frontEndDTI: 0,
    backEndDTI: 0,
    qualificationStatus: 'needs-improvement',
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
};

const creditScoreRanges = [
  { min: 800, max: 850, label: 'Exceptional', color: 'text-green-500' },
  { min: 740, max: 799, label: 'Very Good', color: 'text-emerald-500' },
  { min: 670, max: 739, label: 'Good', color: 'text-yellow-500' },
  { min: 580, max: 669, label: 'Fair', color: 'text-orange-500' },
  { min: 300, max: 579, label: 'Poor', color: 'text-red-500' },
];

const loanTerms = [
  { value: 15, label: '15 years' },
  { value: 20, label: '20 years' },
  { value: 30, label: '30 years' },
];

export const MortgagePrequalTool: React.FC<MortgagePrequalToolProps> = ({ uiConfig: _uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  // uiConfig can be used for prefilling data in the future
  void _uiConfig;

  const {
    data: prequals,
    addItem: addPrequal,
    updateItem: updatePrequal,
    deleteItem: deletePrequal,
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
  } = useToolData<MortgagePrequal>(TOOL_ID, [], mortgageColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPrequal, setSelectedPrequal] = useState<MortgagePrequal | null>(null);
  const [editingPrequal, setEditingPrequal] = useState<MortgagePrequal | null>(null);
  const [formData, setFormData] = useState<MortgagePrequal>(createNewPrequal());

  // Statistics
  const stats = useMemo(() => {
    const excellent = prequals.filter(p => p.qualificationStatus === 'excellent');
    const good = prequals.filter(p => p.qualificationStatus === 'good');
    const avgMaxHomePrice = prequals.length > 0
      ? prequals.reduce((sum, p) => sum + p.maxHomePrice, 0) / prequals.length
      : 0;
    const avgCreditScore = prequals.length > 0
      ? prequals.reduce((sum, p) => sum + p.creditScore, 0) / prequals.length
      : 0;
    const totalDownPayment = prequals.reduce((sum, p) => sum + p.downPaymentAmount, 0);

    return {
      total: prequals.length,
      excellent: excellent.length,
      good: good.length,
      avgMaxHomePrice: Math.round(avgMaxHomePrice),
      avgCreditScore: Math.round(avgCreditScore),
      totalDownPayment,
    };
  }, [prequals]);

  // Filtered prequals
  const filteredPrequals = useMemo(() => {
    return prequals.filter(prequal => {
      const matchesSearch = searchQuery === '' ||
        prequal.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || prequal.qualificationStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [prequals, searchQuery, filterStatus]);

  // Recalculate when form data changes
  const calculatedValues = useMemo(() => {
    return calculateMortgageDetails(
      formData.annualIncome,
      formData.monthlyDebts,
      formData.creditScore,
      formData.downPaymentAmount,
      formData.loanTerm,
      formData.estimatedInterestRate,
      formData.propertyTaxRate,
      formData.homeInsurance,
      formData.hoaFees
    );
  }, [formData]);

  const handleSave = () => {
    const updated = {
      ...formData,
      ...calculatedValues,
      updatedAt: new Date().toISOString(),
    };

    if (editingPrequal) {
      updatePrequal(formData.id, updated);
    } else {
      addPrequal({ ...updated, createdAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingPrequal(null);
    setFormData(createNewPrequal());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this pre-qualification?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deletePrequal(id);
      if (selectedPrequal?.id === id) setSelectedPrequal(null);
    }
  };

  const openEditModal = (prequal: MortgagePrequal) => {
    setEditingPrequal(prequal);
    setFormData(prequal);
    setShowModal(true);
  };

  const getCreditScoreInfo = (score: number) => {
    return creditScoreRanges.find(r => score >= r.min && score <= r.max) || creditScoreRanges[4];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'good': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'marginal': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'needs-improvement': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <Home className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.mortgagePrequal.mortgagePreQualification', 'Mortgage Pre-Qualification')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.mortgagePrequal.calculateAndTrackMortgagePre', 'Calculate and track mortgage pre-qualification amounts')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="mortgage-prequal" toolName="Mortgage Prequal" />

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
            onExportCSV={() => { exportCSV({ filename: 'mortgage-prequal' }); }}
            onExportExcel={() => { exportExcel({ filename: 'mortgage-prequal' }); }}
            onExportJSON={() => { exportJSON({ filename: 'mortgage-prequal' }); }}
            onExportPDF={async () => { await exportPDF({ filename: 'mortgage-prequal', title: 'Mortgage Pre-Qualifications' }); }}
            onPrint={() => { print('Mortgage Pre-Qualifications'); }}
            onCopyToClipboard={async () => { await copyToClipboard('tab'); return true; }}
            disabled={prequals.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewPrequal()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.mortgagePrequal.newPreQual', 'New Pre-Qual')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Calculator className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.total', 'Total')}</p>
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
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.excellent', 'Excellent')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.excellent}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.good', 'Good')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.good}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Building className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.avgMaxPrice', 'Avg Max Price')}</p>
              <p className="text-xl font-bold text-purple-500">{formatCurrency(stats.avgMaxHomePrice)}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.avgCredit', 'Avg Credit')}</p>
              <p className="text-2xl font-bold text-orange-500">{stats.avgCreditScore}</p>
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
              placeholder={t('tools.mortgagePrequal.searchByName', 'Search by name...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-48`}>
            <option value="">{t('tools.mortgagePrequal.allStatuses', 'All Statuses')}</option>
            <option value="excellent">{t('tools.mortgagePrequal.excellent2', 'Excellent')}</option>
            <option value="good">{t('tools.mortgagePrequal.good2', 'Good')}</option>
            <option value="marginal">{t('tools.mortgagePrequal.marginal', 'Marginal')}</option>
            <option value="needs-improvement">{t('tools.mortgagePrequal.needsImprovement', 'Needs Improvement')}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pre-Qual List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.mortgagePrequal.preQualifications', 'Pre-Qualifications')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredPrequals.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Home className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.mortgagePrequal.noPreQualificationsYet', 'No pre-qualifications yet')}</p>
                <p className="text-sm mt-1">{t('tools.mortgagePrequal.clickNewPreQualTo', 'Click "New Pre-Qual" to get started')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredPrequals.map(prequal => (
                  <div
                    key={prequal.id}
                    onClick={() => setSelectedPrequal(prequal)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedPrequal?.id === prequal.id
                        ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                        : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <Home className="w-4 h-4 text-cyan-500" />
                        </div>
                        <div>
                          <p className="font-medium">{prequal.name || 'Unnamed'}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Max: {formatCurrency(prequal.maxHomePrice)}
                          </p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded border ${getStatusColor(prequal.qualificationStatus)}`}>
                            {prequal.qualificationStatus.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(prequal); }} className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(prequal.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
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
          {selectedPrequal ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedPrequal.name || 'Pre-Qualification Details'}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedPrequal.qualificationStatus)}`}>
                        {selectedPrequal.qualificationStatus.replace('-', ' ')}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Created: {new Date(selectedPrequal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => openEditModal(selectedPrequal)} className={buttonSecondary}>
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.maxHomePrice', 'Max Home Price')}</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(selectedPrequal.maxHomePrice)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.monthlyPayment', 'Monthly Payment')}</p>
                    <p className="text-2xl font-bold text-blue-500">{formatCurrency(selectedPrequal.estimatedMonthlyPayment)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.maxLoanAmount', 'Max Loan Amount')}</p>
                    <p className="text-2xl font-bold text-purple-500">{formatCurrency(selectedPrequal.maxLoanAmount)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30' : 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.downPayment', 'Down Payment')}</p>
                    <p className="text-2xl font-bold text-orange-500">{formatCurrency(selectedPrequal.downPaymentAmount)}</p>
                    <p className="text-xs text-orange-400">({selectedPrequal.downPaymentPercent}%)</p>
                  </div>
                </div>

                {/* Income & Debt Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.annualIncome', 'Annual Income')}</p>
                    <p className="font-medium">{formatCurrency(selectedPrequal.annualIncome)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.monthlyDebts', 'Monthly Debts')}</p>
                    <p className="font-medium">{formatCurrency(selectedPrequal.monthlyDebts)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.creditScore', 'Credit Score')}</p>
                    <p className={`font-medium ${getCreditScoreInfo(selectedPrequal.creditScore).color}`}>
                      {selectedPrequal.creditScore} ({getCreditScoreInfo(selectedPrequal.creditScore).label})
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.loanTerm', 'Loan Term')}</p>
                    <p className="font-medium">{selectedPrequal.loanTerm} years</p>
                  </div>
                </div>

                {/* DTI Ratios */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-500" />
                    {t('tools.mortgagePrequal.debtToIncomeRatios', 'Debt-to-Income Ratios')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">{t('tools.mortgagePrequal.frontEndDti', 'Front-End DTI')}</span>
                        <span className={`font-bold ${selectedPrequal.frontEndDTI <= 28 ? 'text-green-500' : selectedPrequal.frontEndDTI <= 31 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {selectedPrequal.frontEndDTI}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${selectedPrequal.frontEndDTI <= 28 ? 'bg-green-500' : selectedPrequal.frontEndDTI <= 31 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(selectedPrequal.frontEndDTI, 50) * 2}%` }}
                        ></div>
                      </div>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Housing costs / Gross income (Ideal: &lt; 28%)
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">{t('tools.mortgagePrequal.backEndDti', 'Back-End DTI')}</span>
                        <span className={`font-bold ${selectedPrequal.backEndDTI <= 36 ? 'text-green-500' : selectedPrequal.backEndDTI <= 43 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {selectedPrequal.backEndDTI}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${selectedPrequal.backEndDTI <= 36 ? 'bg-green-500' : selectedPrequal.backEndDTI <= 43 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(selectedPrequal.backEndDTI, 60) * 1.67}%` }}
                        ></div>
                      </div>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total debts / Gross income (Ideal: &lt; 36%)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.interestRate', 'Interest Rate')}</p>
                    <p className="font-medium">{selectedPrequal.estimatedInterestRate}%</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.propertyTaxRate', 'Property Tax Rate')}</p>
                    <p className="font-medium">{selectedPrequal.propertyTaxRate}%</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.homeInsurance', 'Home Insurance')}</p>
                    <p className="font-medium">{formatCurrency(selectedPrequal.homeInsurance)}/mo</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mortgagePrequal.hoaFees', 'HOA Fees')}</p>
                    <p className="font-medium">{formatCurrency(selectedPrequal.hoaFees)}/mo</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedPrequal.notes && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-cyan-500" />
                      {t('tools.mortgagePrequal.notes2', 'Notes')}
                    </h3>
                    <p className="text-sm">{selectedPrequal.notes}</p>
                  </div>
                )}

                {/* Recommendations */}
                <div className={`p-4 rounded-lg ${
                  selectedPrequal.qualificationStatus === 'excellent'
                    ? theme === 'dark' ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
                    : selectedPrequal.qualificationStatus === 'needs-improvement'
                    ? theme === 'dark' ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
                    : theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    {selectedPrequal.qualificationStatus === 'excellent' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    Recommendations
                  </h3>
                  <ul className="text-sm space-y-1">
                    {selectedPrequal.creditScore < 740 && (
                      <li>{t('tools.mortgagePrequal.considerImprovingCreditScoreFor', 'Consider improving credit score for better rates')}</li>
                    )}
                    {selectedPrequal.downPaymentPercent < 20 && (
                      <li>{t('tools.mortgagePrequal.increaseDownPaymentTo20', 'Increase down payment to 20% to avoid PMI')}</li>
                    )}
                    {selectedPrequal.backEndDTI > 36 && (
                      <li>{t('tools.mortgagePrequal.reduceMonthlyDebtsToImprove', 'Reduce monthly debts to improve DTI ratio')}</li>
                    )}
                    {selectedPrequal.qualificationStatus === 'excellent' && (
                      <li>{t('tools.mortgagePrequal.excellentQualificationYouShouldHave', 'Excellent qualification! You should have competitive loan options.')}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Home className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.mortgagePrequal.selectAPreQualification', 'Select a pre-qualification')}</p>
              <p className="text-sm">{t('tools.mortgagePrequal.chooseARecordToView', 'Choose a record to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingPrequal ? t('tools.mortgagePrequal.editPreQualification', 'Edit Pre-Qualification') : t('tools.mortgagePrequal.newPreQualification', 'New Pre-Qualification')}</h2>
              <button onClick={() => { setShowModal(false); setEditingPrequal(null); }} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <label className={labelClass}>{t('tools.mortgagePrequal.nameLabel', 'Name / Label')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  placeholder={t('tools.mortgagePrequal.eGPrimaryResidenceInvestment', 'e.g., Primary Residence, Investment Property')}
                />
              </div>

              {/* Income & Debts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.mortgagePrequal.annualIncome2', 'Annual Income ($)')}</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.annualIncome || ''}
                      onChange={(e) => setFormData({ ...formData, annualIncome: parseFloat(e.target.value) || 0 })}
                      className={`${inputClass} pl-10`}
                      placeholder="75000"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.mortgagePrequal.monthlyDebts2', 'Monthly Debts ($)')}</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.monthlyDebts || ''}
                      onChange={(e) => setFormData({ ...formData, monthlyDebts: parseFloat(e.target.value) || 0 })}
                      className={`${inputClass} pl-10`}
                      placeholder="500"
                    />
                  </div>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.mortgagePrequal.carPaymentsStudentLoansCredit', 'Car payments, student loans, credit cards, etc.')}
                  </p>
                </div>
              </div>

              {/* Credit Score & Down Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.mortgagePrequal.creditScore2', 'Credit Score')}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="300"
                      max="850"
                      value={formData.creditScore}
                      onChange={(e) => setFormData({ ...formData, creditScore: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className={`w-16 text-center font-bold ${getCreditScoreInfo(formData.creditScore).color}`}>
                      {formData.creditScore}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${getCreditScoreInfo(formData.creditScore).color}`}>
                    {getCreditScoreInfo(formData.creditScore).label}
                  </p>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.mortgagePrequal.downPayment2', 'Down Payment ($)')}</label>
                  <div className="relative">
                    <PiggyBank className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.downPaymentAmount || ''}
                      onChange={(e) => setFormData({ ...formData, downPaymentAmount: parseFloat(e.target.value) || 0 })}
                      className={`${inputClass} pl-10`}
                      placeholder="50000"
                    />
                  </div>
                </div>
              </div>

              {/* Loan Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.mortgagePrequal.loanTerm2', 'Loan Term')}</label>
                  <select
                    value={formData.loanTerm}
                    onChange={(e) => setFormData({ ...formData, loanTerm: parseInt(e.target.value) })}
                    className={inputClass}
                  >
                    {loanTerms.map(term => (
                      <option key={term.value} value={term.value}>{term.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.mortgagePrequal.estimatedInterestRate', 'Estimated Interest Rate (%)')}</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.125"
                      value={formData.estimatedInterestRate || ''}
                      onChange={(e) => setFormData({ ...formData, estimatedInterestRate: parseFloat(e.target.value) || 0 })}
                      className={`${inputClass} pl-10`}
                      placeholder="7.0"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Costs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.mortgagePrequal.propertyTaxRateYear', 'Property Tax Rate (%/year)')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.propertyTaxRate || ''}
                    onChange={(e) => setFormData({ ...formData, propertyTaxRate: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                    placeholder="1.2"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.mortgagePrequal.homeInsuranceMo', 'Home Insurance ($/mo)')}</label>
                  <input
                    type="number"
                    value={formData.homeInsurance || ''}
                    onChange={(e) => setFormData({ ...formData, homeInsurance: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.mortgagePrequal.hoaFeesMo', 'HOA Fees ($/mo)')}</label>
                  <input
                    type="number"
                    value={formData.hoaFees || ''}
                    onChange={(e) => setFormData({ ...formData, hoaFees: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Live Calculation Preview */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-cyan-50 border border-cyan-200'}`}>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-cyan-500">
                  <Calculator className="w-4 h-4" />
                  {t('tools.mortgagePrequal.calculatedResults', 'Calculated Results')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.mortgagePrequal.maxHomePrice2', 'Max Home Price')}</p>
                    <p className="font-bold text-lg text-green-500">{formatCurrency(calculatedValues.maxHomePrice || 0)}</p>
                  </div>
                  <div>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.mortgagePrequal.maxLoan', 'Max Loan')}</p>
                    <p className="font-bold text-lg text-blue-500">{formatCurrency(calculatedValues.maxLoanAmount || 0)}</p>
                  </div>
                  <div>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.mortgagePrequal.monthlyPayment2', 'Monthly Payment')}</p>
                    <p className="font-bold text-lg text-purple-500">{formatCurrency(calculatedValues.estimatedMonthlyPayment || 0)}</p>
                  </div>
                  <div>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.mortgagePrequal.status', 'Status')}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded border ${getStatusColor(calculatedValues.qualificationStatus || 'needs-improvement')}`}>
                      {(calculatedValues.qualificationStatus || 'needs-improvement').replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.mortgagePrequal.frontEndDti2', 'Front-End DTI')}</p>
                    <p className={`font-medium ${(calculatedValues.frontEndDTI || 0) <= 28 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {calculatedValues.frontEndDTI || 0}%
                    </p>
                  </div>
                  <div>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.mortgagePrequal.backEndDti2', 'Back-End DTI')}</p>
                    <p className={`font-medium ${(calculatedValues.backEndDTI || 0) <= 36 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {calculatedValues.backEndDTI || 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('tools.mortgagePrequal.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={inputClass}
                  rows={3}
                  placeholder={t('tools.mortgagePrequal.anyAdditionalNotes', 'Any additional notes...')}
                />
              </div>

              {/* Actions */}
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingPrequal(null); }} className={buttonSecondary}>
                  {t('tools.mortgagePrequal.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={formData.annualIncome <= 0}
                  className={`${buttonPrimary} ${formData.annualIncome <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.mortgagePrequal.aboutMortgagePreQualification', 'About Mortgage Pre-Qualification')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          This tool helps you estimate how much home you can afford based on your income, debts, and credit score.
          It calculates your maximum home price, loan amount, monthly payment estimates, and debt-to-income ratios.
          Pre-qualification gives you a general idea of your borrowing power, but actual loan approval may vary based on
          lender requirements and a full credit review.
        </p>
        <div className={`mt-3 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <strong>{t('tools.mortgagePrequal.dtiGuidelines', 'DTI Guidelines:')}</strong> Front-end DTI (housing costs only) should be below 28%. Back-end DTI (all debts) should be below 36% for best rates.
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default MortgagePrequalTool;
