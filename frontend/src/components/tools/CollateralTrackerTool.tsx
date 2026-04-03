'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  Home,
  Car,
  Building2,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Calendar,
  MapPin,
  Shield,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  Briefcase,
  Hash,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface CollateralTrackerToolProps {
  uiConfig?: UIConfig;
}

type CollateralType = 'real_estate' | 'vehicle' | 'equipment' | 'inventory' | 'securities' | 'cash' | 'other';
type CollateralStatus = 'active' | 'released' | 'pending_release' | 'under_review' | 'foreclosure';

interface Collateral {
  id: string;
  collateralNumber: string;
  loanNumber: string;
  borrowerName: string;
  type: CollateralType;
  status: CollateralStatus;
  // Description
  description: string;
  serialNumber?: string;
  // Location (for real estate/equipment)
  address?: string;
  city?: string;
  state?: string;
  // Valuation
  originalValue: number;
  currentValue: number;
  appraisalDate: string;
  nextAppraisalDate?: string;
  // Loan details
  loanAmount: number;
  loanToValue: number;
  // Insurance
  insured: boolean;
  insurancePolicy?: string;
  insuranceExpiry?: string;
  // Lien
  lienPosition: number;
  lienHolder: string;
  perfectionDate: string;
  // Notes
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const COLLATERAL_TYPES: { value: CollateralType; label: string; icon: React.ReactNode }[] = [
  { value: 'real_estate', label: 'Real Estate', icon: <Home className="w-4 h-4" /> },
  { value: 'vehicle', label: 'Vehicle', icon: <Car className="w-4 h-4" /> },
  { value: 'equipment', label: 'Equipment', icon: <Package className="w-4 h-4" /> },
  { value: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
  { value: 'securities', label: 'Securities', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'cash', label: 'Cash/CD', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'other', label: 'Other', icon: <Briefcase className="w-4 h-4" /> },
];

const STATUS_CONFIG: Record<CollateralStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
  released: { label: 'Released', color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-4 h-4" /> },
  pending_release: { label: 'Pending Release', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: <Eye className="w-4 h-4" /> },
  foreclosure: { label: 'Foreclosure', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" /> },
};

const COLLATERAL_COLUMNS: ColumnConfig[] = [
  { key: 'collateralNumber', header: 'Collateral #', type: 'string' },
  { key: 'loanNumber', header: 'Loan #', type: 'string' },
  { key: 'borrowerName', header: 'Borrower', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'currentValue', header: 'Value', type: 'currency' },
  { key: 'loanAmount', header: 'Loan', type: 'currency' },
  { key: 'loanToValue', header: 'LTV %', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'appraisalDate', header: 'Last Appraisal', type: 'date' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateCollateralNumber = () => `COL-${Date.now().toString().slice(-8)}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getInitialFormState = (): Partial<Collateral> => ({
  loanNumber: '',
  borrowerName: '',
  type: 'real_estate',
  status: 'active',
  description: '',
  originalValue: 0,
  currentValue: 0,
  appraisalDate: '',
  loanAmount: 0,
  loanToValue: 0,
  insured: false,
  lienPosition: 1,
  lienHolder: '',
  perfectionDate: '',
  notes: '',
});

export const CollateralTrackerTool: React.FC<CollateralTrackerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: collaterals,
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
  } = useToolData<Collateral>('collateral-tracker', [], COLLATERAL_COLUMNS);

  const [activeTab, setActiveTab] = useState<'collaterals' | 'new' | 'analytics'>('collaterals');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Collateral>>(getInitialFormState());

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

      if (params.type && ['real_estate', 'vehicle', 'equipment', 'inventory', 'securities', 'cash', 'other'].includes(params.type)) {
        setFormData(prev => ({ ...prev, type: params.type }));
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

  const filteredCollaterals = useMemo(() => {
    return collaterals.filter(col => {
      const matchesSearch =
        col.collateralNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || col.status === filterStatus;
      const matchesType = filterType === 'all' || col.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [collaterals, searchTerm, filterStatus, filterType]);

  const analytics = useMemo(() => {
    const active = collaterals.filter(c => c.status === 'active');
    const totalValue = active.reduce((sum, c) => sum + c.currentValue, 0);
    const totalLoans = active.reduce((sum, c) => sum + c.loanAmount, 0);
    const avgLTV = active.length > 0 ? active.reduce((sum, c) => sum + c.loanToValue, 0) / active.length : 0;
    const uninsured = active.filter(c => !c.insured).length;
    const needsAppraisal = active.filter(c => {
      if (!c.nextAppraisalDate) return false;
      return new Date(c.nextAppraisalDate) <= new Date();
    }).length;
    const byType = COLLATERAL_TYPES.reduce((acc, type) => {
      acc[type.value] = active.filter(c => c.type === type.value).length;
      return acc;
    }, {} as Record<string, number>);

    return { totalActive: active.length, totalValue, totalLoans, avgLTV, uninsured, needsAppraisal, byType };
  }, [collaterals]);

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const ltv = formData.currentValue && formData.loanAmount
      ? Math.round((formData.loanAmount / formData.currentValue) * 100)
      : 0;

    if (editingId) {
      updateItem(editingId, { ...formData, loanToValue: ltv, updatedAt: now });
      setEditingId(null);
    } else {
      const newCollateral: Collateral = {
        ...formData as Collateral,
        id: generateId(),
        collateralNumber: generateCollateralNumber(),
        loanToValue: ltv,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newCollateral);
    }
    setFormData(getInitialFormState());
    setActiveTab('collaterals');
  };

  const handleEdit = (col: Collateral) => {
    setFormData(col);
    setEditingId(col.id);
    setActiveTab('new');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Collateral',
      message: 'Are you sure you want to delete this collateral record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) deleteItem(id);
  };

  const handleStatusChange = (id: string, newStatus: CollateralStatus) => {
    updateItem(id, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{t('tools.collateralTracker.collateralTracker', 'Collateral Tracker')}</h1>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    {isEditFromGallery ? t('tools.collateralTracker.restoredFromGallery', 'Restored from gallery') : t('tools.collateralTracker.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">{t('tools.collateralTracker.manageAndTrackLoanCollateral', 'Manage and track loan collateral')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="collateral-tracker" toolName="Collateral Tracker" />

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
            { id: 'collaterals', label: 'Collaterals', icon: <Package className="w-4 h-4" /> },
            { id: 'new', label: 'Add Collateral', icon: <Plus className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'collaterals' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('tools.collateralTracker.searchCollateral', 'Search collateral...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.collateralTracker.allStatuses', 'All Statuses')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.collateralTracker.allTypes', 'All Types')}</option>
              {COLLATERAL_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredCollaterals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tools.collateralTracker.noCollateralFound', 'No collateral found')}</h3>
                <button onClick={() => setActiveTab('new')} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                  <Plus className="w-4 h-4" />
                  {t('tools.collateralTracker.addCollateral', 'Add Collateral')}
                </button>
              </div>
            ) : (
              filteredCollaterals.map(col => {
                const valueChange = col.currentValue - col.originalValue;
                const valueChangePercent = col.originalValue > 0 ? (valueChange / col.originalValue) * 100 : 0;

                return (
                  <div key={col.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-amber-50 rounded-lg">
                            {COLLATERAL_TYPES.find(t => t.value === col.type)?.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{col.collateralNumber}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[col.status].color}`}>
                                {STATUS_CONFIG[col.status].label}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {col.borrowerName} - {col.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-medium text-gray-900">{formatCurrency(col.currentValue)}</div>
                            <div className={`flex items-center gap-1 text-xs ${valueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {valueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {valueChangePercent.toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">LTV: {col.loanToValue}%</div>
                            <div className="text-xs text-gray-500">Loan: {formatCurrency(col.loanAmount)}</div>
                          </div>
                          {col.insured ? (
                            <Shield className="w-5 h-5 text-green-500" title={t('tools.collateralTracker.insured', 'Insured')} />
                          ) : (
                            <Shield className="w-5 h-5 text-gray-300" title={t('tools.collateralTracker.notInsured', 'Not Insured')} />
                          )}
                          {expandedId === col.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {expandedId === col.id && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.collateralTracker.collateralDetails', 'Collateral Details')}</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>Type: {COLLATERAL_TYPES.find(t => t.value === col.type)?.label}</div>
                              {col.serialNumber && <div>Serial: {col.serialNumber}</div>}
                              <div>Loan #: {col.loanNumber}</div>
                            </div>
                          </div>
                          {col.address && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.collateralTracker.location', 'Location')}</h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{col.address}</div>
                                <div>{col.city}, {col.state}</div>
                              </div>
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.collateralTracker.valuation', 'Valuation')}</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>Original: {formatCurrency(col.originalValue)}</div>
                              <div>Current: {formatCurrency(col.currentValue)}</div>
                              <div>Last Appraisal: {formatDate(col.appraisalDate)}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.collateralTracker.lien', 'Lien')}</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>Position: {col.lienPosition}</div>
                              <div>Holder: {col.lienHolder}</div>
                              <div>Perfected: {formatDate(col.perfectionDate)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{t('tools.collateralTracker.status', 'Status:')}</span>
                            <select
                              value={col.status}
                              onChange={(e) => handleStatusChange(col.id, e.target.value as CollateralStatus)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                            >
                              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(col)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(col.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'new' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{editingId ? t('tools.collateralTracker.editCollateral', 'Edit Collateral') : t('tools.collateralTracker.addCollateral2', 'Add Collateral')}</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.collateralTracker.collateralType', 'Collateral Type')}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {COLLATERAL_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      formData.type === type.value ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${formData.type === type.value ? 'bg-amber-100' : 'bg-gray-100'}`}>
                      {type.icon}
                    </div>
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.collateralTracker.loanNumber', 'Loan Number')}</label>
                <input type="text" value={formData.loanNumber || ''} onChange={(e) => setFormData({ ...formData, loanNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.collateralTracker.borrowerName', 'Borrower Name')}</label>
                <input type="text" value={formData.borrowerName || ''} onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.collateralTracker.description', 'Description')}</label>
              <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.collateralTracker.originalValue', 'Original Value')}</label>
                <input type="number" value={formData.originalValue || ''} onChange={(e) => setFormData({ ...formData, originalValue: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.collateralTracker.currentValue', 'Current Value')}</label>
                <input type="number" value={formData.currentValue || ''} onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.collateralTracker.loanAmount', 'Loan Amount')}</label>
                <input type="number" value={formData.loanAmount || ''} onChange={(e) => setFormData({ ...formData, loanAmount: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.collateralTracker.appraisalDate', 'Appraisal Date')}</label>
                <input type="date" value={formData.appraisalDate || ''} onChange={(e) => setFormData({ ...formData, appraisalDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.collateralTracker.lienPosition', 'Lien Position')}</label>
                <input type="number" min="1" value={formData.lienPosition || ''} onChange={(e) => setFormData({ ...formData, lienPosition: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.collateralTracker.lienHolder', 'Lien Holder')}</label>
                <input type="text" value={formData.lienHolder || ''} onChange={(e) => setFormData({ ...formData, lienHolder: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.insured || false}
                  onChange={(e) => setFormData({ ...formData, insured: e.target.checked })}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">{t('tools.collateralTracker.collateralIsInsured', 'Collateral is insured')}</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.collateralTracker.notes', 'Notes')}</label>
              <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button onClick={() => { setFormData(getInitialFormState()); setEditingId(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('tools.collateralTracker.cancel', 'Cancel')}</button>
              <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                <Save className="w-4 h-4" />
                {editingId ? t('tools.collateralTracker.update', 'Update') : t('tools.collateralTracker.addCollateral3', 'Add Collateral')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.collateralTracker.activeCollateral', 'Active Collateral')}</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalActive}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.collateralTracker.totalValue', 'Total Value')}</div>
              <div className="text-2xl font-bold text-amber-600">{formatCurrency(analytics.totalValue)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.collateralTracker.totalLoans', 'Total Loans')}</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.totalLoans)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.collateralTracker.avgLtv', 'Avg LTV')}</div>
              <div className="text-2xl font-bold text-green-600">{analytics.avgLTV.toFixed(1)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.collateralTracker.byType', 'By Type')}</h3>
              <div className="space-y-3">
                {COLLATERAL_TYPES.map(type => {
                  const count = analytics.byType[type.value] || 0;
                  const pct = analytics.totalActive > 0 ? (count / analytics.totalActive) * 100 : 0;
                  return (
                    <div key={type.value} className="flex items-center gap-3">
                      <div className="w-24 flex items-center gap-2 text-sm text-gray-700">
                        {type.icon}
                        {type.label}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className="bg-amber-500 h-3 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-10 text-right text-sm font-medium">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.collateralTracker.alerts', 'Alerts')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-yellow-700">{t('tools.collateralTracker.uninsuredCollateral', 'Uninsured Collateral')}</span>
                  <span className="font-bold text-yellow-700">{analytics.uninsured}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-orange-700">{t('tools.collateralTracker.needsReappraisal', 'Needs Reappraisal')}</span>
                  <span className="font-bold text-orange-700">{analytics.needsAppraisal}</span>
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

export default CollateralTrackerTool;
