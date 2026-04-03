'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  User,
  DollarSign,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Home,
  Car,
  GraduationCap,
  Building2,
  CreditCard,
  Percent,
  Calculator,
  TrendingUp,
  Users,
  Phone,
  Mail,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface LoanOriginationToolProps {
  uiConfig?: UIConfig;
}

// Types
type LoanType = 'mortgage' | 'auto' | 'personal' | 'business' | 'student' | 'heloc';
type LoanStatus = 'application' | 'processing' | 'underwriting' | 'approved' | 'denied' | 'funded' | 'withdrawn';

interface LoanApplication {
  id: string;
  loanNumber: string;
  loanType: LoanType;
  status: LoanStatus;
  // Borrower info
  borrowerFirstName: string;
  borrowerLastName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  borrowerSSN: string;
  borrowerDOB: string;
  // Co-borrower
  hasCoBorrower: boolean;
  coBorrowerName?: string;
  // Loan details
  requestedAmount: number;
  approvedAmount?: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment?: number;
  purpose: string;
  // Property (for mortgage/HELOC)
  propertyAddress?: string;
  propertyValue?: number;
  loanToValue?: number;
  // Income & Employment
  annualIncome: number;
  employerName: string;
  employmentYears: number;
  debtToIncome: number;
  // Credit
  creditScore: number;
  // Processing
  loanOfficer: string;
  processor?: string;
  underwriter?: string;
  applicationDate: string;
  decisionDate?: string;
  fundingDate?: string;
  // Documents
  documentsReceived: string[];
  documentsRequired: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const LOAN_TYPES: { value: LoanType; label: string; icon: React.ReactNode; maxTerm: number }[] = [
  { value: 'mortgage', label: 'Mortgage', icon: <Home className="w-4 h-4" />, maxTerm: 360 },
  { value: 'auto', label: 'Auto Loan', icon: <Car className="w-4 h-4" />, maxTerm: 84 },
  { value: 'personal', label: 'Personal Loan', icon: <User className="w-4 h-4" />, maxTerm: 60 },
  { value: 'business', label: 'Business Loan', icon: <Briefcase className="w-4 h-4" />, maxTerm: 120 },
  { value: 'student', label: 'Student Loan', icon: <GraduationCap className="w-4 h-4" />, maxTerm: 240 },
  { value: 'heloc', label: 'HELOC', icon: <Building2 className="w-4 h-4" />, maxTerm: 240 },
];

const STATUS_CONFIG: Record<LoanStatus, { label: string; color: string; icon: React.ReactNode }> = {
  application: { label: 'Application', color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-4 h-4" /> },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" /> },
  underwriting: { label: 'Underwriting', color: 'bg-purple-100 text-purple-800', icon: <Eye className="w-4 h-4" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
  denied: { label: 'Denied', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
  funded: { label: 'Funded', color: 'bg-emerald-100 text-emerald-800', icon: <DollarSign className="w-4 h-4" /> },
  withdrawn: { label: 'Withdrawn', color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle className="w-4 h-4" /> },
};

const REQUIRED_DOCUMENTS = [
  'Government ID',
  'Pay Stubs (2 months)',
  'W-2 Forms (2 years)',
  'Tax Returns (2 years)',
  'Bank Statements (2 months)',
  'Employment Verification',
  'Credit Report Authorization',
];

// Column configuration
const LOAN_COLUMNS: ColumnConfig[] = [
  { key: 'loanNumber', header: 'Loan #', type: 'string' },
  { key: 'loanType', header: 'Type', type: 'string' },
  { key: 'borrowerName', header: 'Borrower', type: 'string' },
  { key: 'requestedAmount', header: 'Amount', type: 'currency' },
  { key: 'interestRate', header: 'Rate %', type: 'number' },
  { key: 'termMonths', header: 'Term', type: 'number' },
  { key: 'creditScore', header: 'Credit', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'applicationDate', header: 'Applied', type: 'date' },
];

// Helpers
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateLoanNumber = () => `LN-${Date.now().toString().slice(-8)}`;

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

const calculateMonthlyPayment = (principal: number, annualRate: number, months: number): number => {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
};

const getInitialFormState = (): Partial<LoanApplication> => ({
  loanType: 'personal',
  status: 'application',
  borrowerFirstName: '',
  borrowerLastName: '',
  borrowerEmail: '',
  borrowerPhone: '',
  borrowerSSN: '',
  borrowerDOB: '',
  hasCoBorrower: false,
  requestedAmount: 0,
  interestRate: 0,
  termMonths: 36,
  purpose: '',
  annualIncome: 0,
  employerName: '',
  employmentYears: 0,
  debtToIncome: 0,
  creditScore: 700,
  loanOfficer: '',
  documentsReceived: [],
  documentsRequired: [...REQUIRED_DOCUMENTS],
  notes: '',
});

export const LoanOriginationTool: React.FC<LoanOriginationToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const {
    data: loans,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
  } = useToolData<LoanApplication>('loan-origination', [], LOAN_COLUMNS);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'new' | 'analytics'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LoanApplication>>(getInitialFormState());

  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const matchesSearch =
        loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.borrowerFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.borrowerLastName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
      const matchesType = filterType === 'all' || loan.loanType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [loans, searchTerm, filterStatus, filterType]);

  const analytics = useMemo(() => {
    const total = loans.length;
    const totalRequested = loans.reduce((sum, l) => sum + l.requestedAmount, 0);
    const funded = loans.filter(l => l.status === 'funded');
    const totalFunded = funded.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
    const avgRate = loans.length > 0 ? loans.reduce((sum, l) => sum + l.interestRate, 0) / loans.length : 0;
    const avgCredit = loans.length > 0 ? loans.reduce((sum, l) => sum + l.creditScore, 0) / loans.length : 0;
    const approvalRate = loans.length > 0 ? (loans.filter(l => l.status === 'approved' || l.status === 'funded').length / loans.length) * 100 : 0;

    return { total, totalRequested, totalFunded, avgRate, avgCredit, approvalRate, fundedCount: funded.length };
  }, [loans]);

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const monthlyPayment = calculateMonthlyPayment(
      formData.requestedAmount || 0,
      formData.interestRate || 0,
      formData.termMonths || 36
    );

    if (editingId) {
      updateItem(editingId, { ...formData, monthlyPayment, updatedAt: now });
      setEditingId(null);
    } else {
      const newLoan: LoanApplication = {
        ...formData as LoanApplication,
        id: generateId(),
        loanNumber: generateLoanNumber(),
        monthlyPayment,
        applicationDate: now,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newLoan);
    }

    setFormData(getInitialFormState());
    setActiveTab('pipeline');
  };

  const handleEdit = (loan: LoanApplication) => {
    setFormData(loan);
    setEditingId(loan.id);
    setActiveTab('new');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Loan Application',
      message: 'Are you sure you want to delete this loan application? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: LoanStatus) => {
    const updates: Partial<LoanApplication> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'approved' || newStatus === 'denied') {
      updates.decisionDate = new Date().toISOString();
    }
    if (newStatus === 'funded') {
      updates.fundingDate = new Date().toISOString();
    }
    updateItem(id, updates);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('tools.loanOrigination.loanOrigination', 'Loan Origination')}</h1>
              <p className="text-gray-500 text-sm">{t('tools.loanOrigination.processAndTrackLoanApplications', 'Process and track loan applications')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="loan-origination" toolName="Loan Origination" />

            <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} />
            <ExportDropdown
              onExportCSV={exportCSV}
              onExportExcel={exportExcel}
              onExportJSON={exportJSON}
              onExportPDF={exportPDF}
              onPrint={print}
              onCopyToClipboard={copyToClipboard}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'pipeline', label: 'Loan Pipeline', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'new', label: 'New Application', icon: <Plus className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <Calculator className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('tools.loanOrigination.searchLoans', 'Search loans...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">{t('tools.loanOrigination.allStatuses', 'All Statuses')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">{t('tools.loanOrigination.allTypes', 'All Types')}</option>
              {LOAN_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Loan List */}
          <div className="space-y-3">
            {filteredLoans.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tools.loanOrigination.noLoansFound', 'No loans found')}</h3>
                <button
                  onClick={() => setActiveTab('new')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.loanOrigination.newApplication', 'New Application')}
                </button>
              </div>
            ) : (
              filteredLoans.map(loan => (
                <div key={loan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(expandedId === loan.id ? null : loan.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          {LOAN_TYPES.find(t => t.value === loan.loanType)?.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{loan.loanNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[loan.status].color}`}>
                              {STATUS_CONFIG[loan.status].label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {loan.borrowerFirstName} {loan.borrowerLastName} - {LOAN_TYPES.find(t => t.value === loan.loanType)?.label}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{formatCurrency(loan.requestedAmount)}</div>
                          <div className="text-xs text-gray-500">{loan.interestRate}% / {loan.termMonths}mo</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Credit: {loan.creditScore}</div>
                          <div className="text-xs text-gray-500">{formatDate(loan.applicationDate)}</div>
                        </div>
                        {expandedId === loan.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {expandedId === loan.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.loanOrigination.borrower', 'Borrower')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{loan.borrowerEmail}</div>
                            <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{loan.borrowerPhone}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.loanOrigination.employment', 'Employment')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>{loan.employerName}</div>
                            <div>{loan.employmentYears} years</div>
                            <div>Income: {formatCurrency(loan.annualIncome)}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.loanOrigination.loanDetails', 'Loan Details')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Monthly: {loan.monthlyPayment ? formatCurrency(loan.monthlyPayment) : 'N/A'}</div>
                            <div>DTI: {loan.debtToIncome}%</div>
                            <div>Purpose: {loan.purpose}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.loanOrigination.processing', 'Processing')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Officer: {loan.loanOfficer}</div>
                            {loan.processor && <div>Processor: {loan.processor}</div>}
                            {loan.underwriter && <div>Underwriter: {loan.underwriter}</div>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{t('tools.loanOrigination.status', 'Status:')}</span>
                          <select
                            value={loan.status}
                            onChange={(e) => handleStatusChange(loan.id, e.target.value as LoanStatus)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(loan)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(loan.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* New Application Tab */}
      {activeTab === 'new' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{editingId ? t('tools.loanOrigination.editLoan', 'Edit Loan') : t('tools.loanOrigination.newLoanApplication', 'New Loan Application')}</h2>

          <div className="space-y-6">
            {/* Loan Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.loanOrigination.loanType', 'Loan Type')}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LOAN_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, loanType: type.value })}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      formData.loanType === type.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${formData.loanType === type.value ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      {type.icon}
                    </div>
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Borrower Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.firstName', 'First Name')}</label>
                <input
                  type="text"
                  value={formData.borrowerFirstName || ''}
                  onChange={(e) => setFormData({ ...formData, borrowerFirstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.lastName', 'Last Name')}</label>
                <input
                  type="text"
                  value={formData.borrowerLastName || ''}
                  onChange={(e) => setFormData({ ...formData, borrowerLastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.email', 'Email')}</label>
                <input
                  type="email"
                  value={formData.borrowerEmail || ''}
                  onChange={(e) => setFormData({ ...formData, borrowerEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.phone', 'Phone')}</label>
                <input
                  type="tel"
                  value={formData.borrowerPhone || ''}
                  onChange={(e) => setFormData({ ...formData, borrowerPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Loan Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.requestedAmount', 'Requested Amount')}</label>
                <input
                  type="number"
                  value={formData.requestedAmount || ''}
                  onChange={(e) => setFormData({ ...formData, requestedAmount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.interestRate', 'Interest Rate (%)')}</label>
                <input
                  type="number"
                  step="0.125"
                  value={formData.interestRate || ''}
                  onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.termMonths', 'Term (Months)')}</label>
                <input
                  type="number"
                  value={formData.termMonths || ''}
                  onChange={(e) => setFormData({ ...formData, termMonths: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Employment & Income */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.employerName', 'Employer Name')}</label>
                <input
                  type="text"
                  value={formData.employerName || ''}
                  onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.yearsEmployed', 'Years Employed')}</label>
                <input
                  type="number"
                  value={formData.employmentYears || ''}
                  onChange={(e) => setFormData({ ...formData, employmentYears: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.annualIncome', 'Annual Income')}</label>
                <input
                  type="number"
                  value={formData.annualIncome || ''}
                  onChange={(e) => setFormData({ ...formData, annualIncome: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Credit & DTI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.creditScore', 'Credit Score')}</label>
                <input
                  type="number"
                  value={formData.creditScore || ''}
                  onChange={(e) => setFormData({ ...formData, creditScore: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.debtToIncome', 'Debt-to-Income (%)')}</label>
                <input
                  type="number"
                  value={formData.debtToIncome || ''}
                  onChange={(e) => setFormData({ ...formData, debtToIncome: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.loanOfficer', 'Loan Officer')}</label>
                <input
                  type="text"
                  value={formData.loanOfficer || ''}
                  onChange={(e) => setFormData({ ...formData, loanOfficer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.loanPurpose', 'Loan Purpose')}</label>
              <input
                type="text"
                value={formData.purpose || ''}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.loanOrigination.notes', 'Notes')}</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => { setFormData(getInitialFormState()); setEditingId(null); }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t('tools.loanOrigination.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                <Save className="w-4 h-4" />
                {editingId ? t('tools.loanOrigination.update', 'Update') : t('tools.loanOrigination.submit', 'Submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.loanOrigination.totalApplications', 'Total Applications')}</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.loanOrigination.totalRequested', 'Total Requested')}</div>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(analytics.totalRequested)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.loanOrigination.totalFunded', 'Total Funded')}</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalFunded)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.loanOrigination.approvalRate', 'Approval Rate')}</div>
              <div className="text-2xl font-bold text-blue-600">{analytics.approvalRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.loanOrigination.pipelineByStatus', 'Pipeline by Status')}</h3>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const count = loans.filter(l => l.status === key).length;
                  const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={`w-24 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="w-10 text-right text-sm font-medium">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.loanOrigination.keyMetrics', 'Key Metrics')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{t('tools.loanOrigination.averageInterestRate', 'Average Interest Rate')}</span>
                  <span className="font-bold text-gray-900">{analytics.avgRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{t('tools.loanOrigination.averageCreditScore', 'Average Credit Score')}</span>
                  <span className="font-bold text-gray-900">{Math.round(analytics.avgCredit)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{t('tools.loanOrigination.loansFunded', 'Loans Funded')}</span>
                  <span className="font-bold text-green-600">{analytics.fundedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default LoanOriginationTool;
