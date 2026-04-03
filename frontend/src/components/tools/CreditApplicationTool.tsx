'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
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
  ChevronDown,
  ChevronUp,
  Building2,
  Percent,
  TrendingUp,
  Phone,
  Mail,
  Shield,
  Star,
  Target,
  BarChart3,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface CreditApplicationToolProps {
  uiConfig?: UIConfig;
}

type CreditProduct = 'credit_card' | 'line_of_credit' | 'overdraft' | 'business_credit';
type ApplicationStatus = 'submitted' | 'reviewing' | 'approved' | 'declined' | 'pending_docs' | 'expired';

interface CreditApplication {
  id: string;
  applicationNumber: string;
  productType: CreditProduct;
  status: ApplicationStatus;
  // Applicant
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  // Financial
  annualIncome: number;
  monthlyHousingPayment: number;
  employmentStatus: string;
  employer: string;
  yearsEmployed: number;
  // Credit request
  requestedLimit: number;
  approvedLimit?: number;
  interestRate?: number;
  annualFee?: number;
  // Credit profile
  creditScore: number;
  creditHistory: 'excellent' | 'good' | 'fair' | 'poor';
  existingDebt: number;
  bankruptcyHistory: boolean;
  // Processing
  submittedAt: string;
  decisionAt?: string;
  decisionReason?: string;
  expiresAt?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const CREDIT_PRODUCTS: { value: CreditProduct; label: string; icon: React.ReactNode }[] = [
  { value: 'credit_card', label: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> },
  { value: 'line_of_credit', label: 'Line of Credit', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'overdraft', label: 'Overdraft Protection', icon: <Shield className="w-4 h-4" /> },
  { value: 'business_credit', label: 'Business Credit', icon: <Building2 className="w-4 h-4" /> },
];

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: <FileText className="w-4 h-4" /> },
  reviewing: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
  pending_docs: { label: 'Pending Documents', color: 'bg-orange-100 text-orange-800', icon: <AlertCircle className="w-4 h-4" /> },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-4 h-4" /> },
};

const CREDIT_COLUMNS: ColumnConfig[] = [
  { key: 'applicationNumber', header: 'Application #', type: 'string' },
  { key: 'productType', header: 'Product', type: 'string' },
  { key: 'applicantName', header: 'Applicant', type: 'string' },
  { key: 'requestedLimit', header: 'Requested', type: 'currency' },
  { key: 'approvedLimit', header: 'Approved', type: 'currency' },
  { key: 'creditScore', header: 'Credit Score', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'submittedAt', header: 'Submitted', type: 'date' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateAppNumber = () => `CRD-${Date.now().toString().slice(-8)}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getCreditScoreColor = (score: number) => {
  if (score >= 750) return 'text-green-600 bg-green-50';
  if (score >= 670) return 'text-blue-600 bg-blue-50';
  if (score >= 580) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

const getInitialFormState = (): Partial<CreditApplication> => ({
  productType: 'credit_card',
  status: 'submitted',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  ssn: '',
  annualIncome: 0,
  monthlyHousingPayment: 0,
  employmentStatus: 'employed',
  employer: '',
  yearsEmployed: 0,
  requestedLimit: 0,
  creditScore: 700,
  creditHistory: 'good',
  existingDebt: 0,
  bankruptcyHistory: false,
  notes: '',
});

export const CreditApplicationTool: React.FC<CreditApplicationToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: applications,
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
  } = useToolData<CreditApplication>('credit-application', [], CREDIT_COLUMNS);

  const [activeTab, setActiveTab] = useState<'applications' | 'new' | 'analytics'>('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreditApplication>>(getInitialFormState());

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.productType && CREDIT_PRODUCTS.find(cp => cp.value === params.productType)) {
        setFormData(prev => ({ ...prev, productType: params.productType }));
        hasChanges = true;
      }
      if (params.status) {
        setFilterStatus(params.status);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch =
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      const matchesProduct = filterProduct === 'all' || app.productType === filterProduct;
      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [applications, searchTerm, filterStatus, filterProduct]);

  const analytics = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter(a => a.status === 'approved');
    const declined = applications.filter(a => a.status === 'declined');
    const pending = applications.filter(a => ['submitted', 'reviewing', 'pending_docs'].includes(a.status));
    const totalApproved = approved.reduce((sum, a) => sum + (a.approvedLimit || 0), 0);
    const avgCreditScore = total > 0 ? applications.reduce((sum, a) => sum + a.creditScore, 0) / total : 0;
    const approvalRate = total > 0 ? (approved.length / total) * 100 : 0;

    return {
      total,
      approvedCount: approved.length,
      declinedCount: declined.length,
      pendingCount: pending.length,
      totalApproved,
      avgCreditScore,
      approvalRate,
    };
  }, [applications]);

  const handleSubmit = () => {
    const now = new Date().toISOString();
    if (editingId) {
      updateItem(editingId, { ...formData, updatedAt: now });
      setEditingId(null);
    } else {
      const newApp: CreditApplication = {
        ...formData as CreditApplication,
        id: generateId(),
        applicationNumber: generateAppNumber(),
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newApp);
    }
    setFormData(getInitialFormState());
    setActiveTab('applications');
  };

  const handleEdit = (app: CreditApplication) => {
    setFormData(app);
    setEditingId(app.id);
    setActiveTab('new');
  };

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Application',
      message: 'Are you sure you want to delete this application? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  }, [confirm, deleteItem]);

  const handleStatusChange = (id: string, newStatus: ApplicationStatus, reason?: string) => {
    const updates: Partial<CreditApplication> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'approved' || newStatus === 'declined') {
      updates.decisionAt = new Date().toISOString();
      if (reason) updates.decisionReason = reason;
    }
    updateItem(id, updates);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('tools.creditApplication.creditApplicationTracker', 'Credit Application Tracker')}</h1>
              <p className="text-gray-500 text-sm">{t('tools.creditApplication.manageCreditProductApplications', 'Manage credit product applications')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="credit-application" toolName="Credit Application" />

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

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'applications', label: 'Applications', icon: <FileText className="w-4 h-4" /> },
            { id: 'new', label: 'New Application', icon: <Plus className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('tools.creditApplication.searchApplications', 'Search applications...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.creditApplication.allStatuses', 'All Statuses')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.creditApplication.allProducts', 'All Products')}</option>
              {CREDIT_PRODUCTS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tools.creditApplication.noApplicationsFound', 'No applications found')}</h3>
                <button onClick={() => setActiveTab('new')} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                  <Plus className="w-4 h-4" />
                  {t('tools.creditApplication.newApplication', 'New Application')}
                </button>
              </div>
            ) : (
              filteredApplications.map(app => (
                <div key={app.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          {CREDIT_PRODUCTS.find(p => p.value === app.productType)?.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{app.applicationNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[app.status].color}`}>
                              {STATUS_CONFIG[app.status].label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">{app.firstName} {app.lastName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{formatCurrency(app.requestedLimit)}</div>
                          <div className="text-xs text-gray-500">{t('tools.creditApplication.requested', 'Requested')}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getCreditScoreColor(app.creditScore)}`}>
                          {app.creditScore}
                        </div>
                        {expandedId === app.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {expandedId === app.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.creditApplication.contact', 'Contact')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{app.email}</div>
                            <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{app.phone}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.creditApplication.financial', 'Financial')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Income: {formatCurrency(app.annualIncome)}/yr</div>
                            <div>Housing: {formatCurrency(app.monthlyHousingPayment)}/mo</div>
                            <div>Debt: {formatCurrency(app.existingDebt)}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.creditApplication.employment', 'Employment')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>{app.employer}</div>
                            <div>{app.yearsEmployed} years</div>
                            <div className="capitalize">{app.employmentStatus}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.creditApplication.decision', 'Decision')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            {app.approvedLimit && <div>Approved: {formatCurrency(app.approvedLimit)}</div>}
                            {app.interestRate && <div>Rate: {app.interestRate}%</div>}
                            {app.decisionAt && <div>Date: {formatDate(app.decisionAt)}</div>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{t('tools.creditApplication.status', 'Status:')}</span>
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(app)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(app.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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

      {activeTab === 'new' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{editingId ? t('tools.creditApplication.editApplication', 'Edit Application') : t('tools.creditApplication.newCreditApplication', 'New Credit Application')}</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.creditApplication.creditProduct', 'Credit Product')}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CREDIT_PRODUCTS.map(product => (
                  <button
                    key={product.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, productType: product.value })}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      formData.productType === product.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${formData.productType === product.value ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      {product.icon}
                    </div>
                    <span className="font-medium text-gray-900">{product.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.creditApplication.firstName', 'First Name')}</label>
                <input type="text" value={formData.firstName || ''} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.creditApplication.lastName', 'Last Name')}</label>
                <input type="text" value={formData.lastName || ''} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.creditApplication.email', 'Email')}</label>
                <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.creditApplication.phone', 'Phone')}</label>
                <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.creditApplication.requestedCreditLimit', 'Requested Credit Limit')}</label>
                <input type="number" value={formData.requestedLimit || ''} onChange={(e) => setFormData({ ...formData, requestedLimit: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.creditApplication.annualIncome', 'Annual Income')}</label>
                <input type="number" value={formData.annualIncome || ''} onChange={(e) => setFormData({ ...formData, annualIncome: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.creditApplication.creditScore', 'Credit Score')}</label>
                <input type="number" value={formData.creditScore || ''} onChange={(e) => setFormData({ ...formData, creditScore: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.creditApplication.employer', 'Employer')}</label>
                <input type="text" value={formData.employer || ''} onChange={(e) => setFormData({ ...formData, employer: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.creditApplication.yearsEmployed', 'Years Employed')}</label>
                <input type="number" value={formData.yearsEmployed || ''} onChange={(e) => setFormData({ ...formData, yearsEmployed: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.creditApplication.existingDebt', 'Existing Debt')}</label>
                <input type="number" value={formData.existingDebt || ''} onChange={(e) => setFormData({ ...formData, existingDebt: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.creditApplication.notes', 'Notes')}</label>
              <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button onClick={() => { setFormData(getInitialFormState()); setEditingId(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('tools.creditApplication.cancel', 'Cancel')}</button>
              <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                <Save className="w-4 h-4" />
                {editingId ? t('tools.creditApplication.update', 'Update') : t('tools.creditApplication.submit', 'Submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.creditApplication.totalApplications', 'Total Applications')}</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.creditApplication.approved', 'Approved')}</div>
              <div className="text-2xl font-bold text-green-600">{analytics.approvedCount}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.creditApplication.totalCreditApproved', 'Total Credit Approved')}</div>
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(analytics.totalApproved)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.creditApplication.approvalRate', 'Approval Rate')}</div>
              <div className="text-2xl font-bold text-blue-600">{analytics.approvalRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.creditApplication.byStatus', 'By Status')}</h3>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const count = applications.filter(a => a.status === key).length;
                  const pct = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={`w-28 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-10 text-right text-sm font-medium">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.creditApplication.keyMetrics', 'Key Metrics')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{t('tools.creditApplication.averageCreditScore', 'Average Credit Score')}</span>
                  <span className="font-bold text-gray-900">{Math.round(analytics.avgCreditScore)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{t('tools.creditApplication.pendingReview', 'Pending Review')}</span>
                  <span className="font-bold text-yellow-600">{analytics.pendingCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{t('tools.creditApplication.declined', 'Declined')}</span>
                  <span className="font-bold text-red-600">{analytics.declinedCount}</span>
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

export default CreditApplicationTool;
