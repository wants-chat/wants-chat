'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HardHat,
  Plus,
  Trash2,
  Save,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  User,
  TrendingUp,
  Percent,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Copy,
  Edit2,
  X,
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

interface ProjectEstimateToolProps {
  uiConfig?: UIConfig;
}

// Types
type ProjectStatus = 'draft' | 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';

interface LineItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  laborHours: number;
  laborRate: number;
  laborCost: number;
  notes: string;
}

interface ProjectEstimate {
  id: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectAddress: string;
  projectType: string;
  estimateDate: string;
  validUntil: string;
  status: ProjectStatus;
  lineItems: LineItem[];
  subtotalMaterials: number;
  subtotalLabor: number;
  overhead: number;
  overheadPercent: number;
  profit: number;
  profitPercent: number;
  contingency: number;
  contingencyPercent: number;
  totalEstimate: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const PROJECT_TYPES = [
  'New Construction',
  'Renovation',
  'Addition',
  'Remodel',
  'Commercial Build-Out',
  'Industrial',
  'Infrastructure',
  'Landscaping',
  'Demolition',
  'Other',
];

const CATEGORIES = [
  'Site Work',
  'Foundation',
  'Framing',
  'Roofing',
  'Exterior',
  'Windows & Doors',
  'Insulation',
  'Drywall',
  'Flooring',
  'Painting',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Finishes',
  'Fixtures',
  'Appliances',
  'Landscaping',
  'Permits & Fees',
  'Miscellaneous',
];

const UNITS = ['ea', 'sf', 'lf', 'sy', 'cy', 'hr', 'day', 'lot', 'gal', 'lb'];

const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
};

// Column configuration for exports
const ESTIMATE_COLUMNS: ColumnConfig[] = [
  { key: 'projectName', header: 'Project Name', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'projectType', header: 'Type', type: 'string' },
  { key: 'estimateDate', header: 'Estimate Date', type: 'date' },
  { key: 'subtotalMaterials', header: 'Materials', type: 'currency' },
  { key: 'subtotalLabor', header: 'Labor', type: 'currency' },
  { key: 'totalEstimate', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const ProjectEstimateTool: React.FC<ProjectEstimateToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  // useToolData hook for backend sync
  const {
    data: estimates,
    addItem: addEstimate,
    updateItem: updateEstimate,
    deleteItem: deleteEstimate,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
  } = useToolData<ProjectEstimate>('project-estimates', [], ESTIMATE_COLUMNS);

  // UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedEstimateId, setExpandedEstimateId] = useState<string | null>(null);
  const [editingEstimate, setEditingEstimate] = useState<ProjectEstimate | null>(null);

  // New Estimate Form State
  const [newEstimate, setNewEstimate] = useState<Partial<ProjectEstimate>>({
    projectName: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectAddress: '',
    projectType: 'New Construction',
    estimateDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    lineItems: [],
    overheadPercent: 10,
    profitPercent: 15,
    contingencyPercent: 5,
    notes: '',
  });

  // Calculate totals
  const calculateTotals = (estimate: Partial<ProjectEstimate>): Partial<ProjectEstimate> => {
    const lineItems = estimate.lineItems || [];
    const subtotalMaterials = lineItems.reduce((sum, item) => sum + item.totalCost, 0);
    const subtotalLabor = lineItems.reduce((sum, item) => sum + item.laborCost, 0);
    const subtotal = subtotalMaterials + subtotalLabor;
    const overhead = subtotal * ((estimate.overheadPercent || 0) / 100);
    const profit = subtotal * ((estimate.profitPercent || 0) / 100);
    const contingency = subtotal * ((estimate.contingencyPercent || 0) / 100);
    const totalEstimate = subtotal + overhead + profit + contingency;

    return {
      ...estimate,
      subtotalMaterials,
      subtotalLabor,
      overhead,
      profit,
      contingency,
      totalEstimate,
    };
  };

  // Add line item
  const addLineItem = (estimate: Partial<ProjectEstimate>, setEstimate: Function) => {
    const newItem: LineItem = {
      id: generateId(),
      category: 'Miscellaneous',
      description: '',
      quantity: 1,
      unit: 'ea',
      unitCost: 0,
      totalCost: 0,
      laborHours: 0,
      laborRate: 75,
      laborCost: 0,
      notes: '',
    };
    const updatedLineItems = [...(estimate.lineItems || []), newItem];
    setEstimate(calculateTotals({ ...estimate, lineItems: updatedLineItems }));
  };

  // Update line item
  const updateLineItem = (
    estimate: Partial<ProjectEstimate>,
    setEstimate: Function,
    itemId: string,
    field: keyof LineItem,
    value: any
  ) => {
    const updatedLineItems = (estimate.lineItems || []).map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        // Recalculate totals
        updated.totalCost = updated.quantity * updated.unitCost;
        updated.laborCost = updated.laborHours * updated.laborRate;
        return updated;
      }
      return item;
    });
    setEstimate(calculateTotals({ ...estimate, lineItems: updatedLineItems }));
  };

  // Remove line item
  const removeLineItem = (estimate: Partial<ProjectEstimate>, setEstimate: Function, itemId: string) => {
    const updatedLineItems = (estimate.lineItems || []).filter(item => item.id !== itemId);
    setEstimate(calculateTotals({ ...estimate, lineItems: updatedLineItems }));
  };

  // Save new estimate
  const handleSaveEstimate = () => {
    const calculated = calculateTotals(newEstimate);
    const estimate: ProjectEstimate = {
      id: generateId(),
      projectName: calculated.projectName || '',
      clientName: calculated.clientName || '',
      clientEmail: calculated.clientEmail || '',
      clientPhone: calculated.clientPhone || '',
      projectAddress: calculated.projectAddress || '',
      projectType: calculated.projectType || 'New Construction',
      estimateDate: calculated.estimateDate || new Date().toISOString().split('T')[0],
      validUntil: calculated.validUntil || '',
      status: calculated.status || 'draft',
      lineItems: calculated.lineItems || [],
      subtotalMaterials: calculated.subtotalMaterials || 0,
      subtotalLabor: calculated.subtotalLabor || 0,
      overhead: calculated.overhead || 0,
      overheadPercent: calculated.overheadPercent || 10,
      profit: calculated.profit || 0,
      profitPercent: calculated.profitPercent || 15,
      contingency: calculated.contingency || 0,
      contingencyPercent: calculated.contingencyPercent || 5,
      totalEstimate: calculated.totalEstimate || 0,
      notes: calculated.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addEstimate(estimate);
    setNewEstimate({
      projectName: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      projectAddress: '',
      projectType: 'New Construction',
      estimateDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      lineItems: [],
      overheadPercent: 10,
      profitPercent: 15,
      contingencyPercent: 5,
      notes: '',
    });
    setActiveTab('list');
  };

  // Update existing estimate
  const handleUpdateEstimate = () => {
    if (!editingEstimate) return;
    const calculated = calculateTotals(editingEstimate);
    updateEstimate(editingEstimate.id, {
      ...calculated,
      updatedAt: new Date().toISOString(),
    } as Partial<ProjectEstimate>);
    setEditingEstimate(null);
    setActiveTab('list');
  };

  // Duplicate estimate
  const duplicateEstimate = (estimate: ProjectEstimate) => {
    const duplicate: ProjectEstimate = {
      ...estimate,
      id: generateId(),
      projectName: `${estimate.projectName} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addEstimate(duplicate);
  };

  // Filter estimates
  const filteredEstimates = useMemo(() => {
    return estimates.filter(estimate => {
      const matchesSearch =
        estimate.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || estimate.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [estimates, searchTerm, filterStatus]);

  // Calculate summary stats
  const stats = useMemo(() => {
    return {
      totalEstimates: estimates.length,
      totalValue: estimates.reduce((sum, e) => sum + e.totalEstimate, 0),
      pendingValue: estimates
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + e.totalEstimate, 0),
      approvedValue: estimates
        .filter(e => e.status === 'approved' || e.status === 'in_progress')
        .reduce((sum, e) => sum + e.totalEstimate, 0),
    };
  }, [estimates]);

  // Handle export
  const handleExport = async (format: string) => {
    switch (format) {
      case 'csv':
        exportCSV({ filename: 'project-estimates' });
        break;
      case 'excel':
        exportExcel({ filename: 'project-estimates' });
        break;
      case 'json':
        exportJSON({ filename: 'project-estimates' });
        break;
      case 'pdf':
        await exportPDF({ filename: 'project-estimates', title: 'Project Estimates' });
        break;
    }
  };

  // Render line items editor
  const renderLineItemsEditor = (
    estimate: Partial<ProjectEstimate>,
    setEstimate: Function
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
        <button
          onClick={() => addLineItem(estimate, setEstimate)}
          className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-gray-600">Category</th>
              <th className="px-3 py-2 text-left text-gray-600">Description</th>
              <th className="px-3 py-2 text-right text-gray-600">Qty</th>
              <th className="px-3 py-2 text-left text-gray-600">Unit</th>
              <th className="px-3 py-2 text-right text-gray-600">Unit Cost</th>
              <th className="px-3 py-2 text-right text-gray-600">Material Total</th>
              <th className="px-3 py-2 text-right text-gray-600">Labor Hrs</th>
              <th className="px-3 py-2 text-right text-gray-600">Labor Rate</th>
              <th className="px-3 py-2 text-right text-gray-600">Labor Total</th>
              <th className="px-3 py-2 text-center text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(estimate.lineItems || []).map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <select
                    value={item.category}
                    onChange={e => updateLineItem(estimate, setEstimate, item.id, 'category', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateLineItem(estimate, setEstimate, item.id, 'description', e.target.value)}
                    placeholder="Description"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateLineItem(estimate, setEstimate, item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.unit}
                    onChange={e => updateLineItem(estimate, setEstimate, item.id, 'unit', e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.unitCost}
                    onChange={e => updateLineItem(estimate, setEstimate, item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(item.totalCost)}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.laborHours}
                    onChange={e => updateLineItem(estimate, setEstimate, item.id, 'laborHours', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.laborRate}
                    onChange={e => updateLineItem(estimate, setEstimate, item.id, 'laborRate', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(item.laborCost)}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => removeLineItem(estimate, setEstimate, item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(estimate.lineItems || []).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No line items yet. Click "Add Item" to start building your estimate.
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <HardHat className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('tools.projectEstimate.projectEstimate', 'Project Estimate')}</h1>
            <p className="text-gray-500">{t('tools.projectEstimate.constructionProjectCostEstimation', 'Construction project cost estimation')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="project-estimate" toolName="Project Estimate" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onSync={forceSync}
          />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.projectEstimate.totalEstimates', 'Total Estimates')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalEstimates}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.projectEstimate.totalValue', 'Total Value')}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.projectEstimate.pending', 'Pending')}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.pendingValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.projectEstimate.approved', 'Approved')}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.approvedValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'list'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('tools.projectEstimate.allEstimates', 'All Estimates')}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'create'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('tools.projectEstimate.newEstimate', 'New Estimate')}
        </button>
      </div>

      {/* List View */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.projectEstimate.searchProjects', 'Search projects...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">{t('tools.projectEstimate.allStatus', 'All Status')}</option>
              <option value="draft">{t('tools.projectEstimate.draft', 'Draft')}</option>
              <option value="pending">{t('tools.projectEstimate.pending2', 'Pending')}</option>
              <option value="approved">{t('tools.projectEstimate.approved2', 'Approved')}</option>
              <option value="in_progress">{t('tools.projectEstimate.inProgress', 'In Progress')}</option>
              <option value="completed">{t('tools.projectEstimate.completed', 'Completed')}</option>
              <option value="rejected">{t('tools.projectEstimate.rejected', 'Rejected')}</option>
            </select>
          </div>

          {/* Estimates List */}
          <div className="space-y-4">
            {filteredEstimates.map(estimate => (
              <div
                key={estimate.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedEstimateId(expandedEstimateId === estimate.id ? null : estimate.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{estimate.projectName}</h3>
                        <p className="text-sm text-gray-500">{estimate.clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(estimate.totalEstimate)}</p>
                        <p className="text-sm text-gray-500">{formatDate(estimate.estimateDate)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[estimate.status]}`}>
                        {estimate.status.replace('_', ' ')}
                      </span>
                      {expandedEstimateId === estimate.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedEstimateId === estimate.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.projectEstimate.projectType', 'Project Type')}</p>
                        <p className="font-medium">{estimate.projectType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.projectEstimate.validUntil', 'Valid Until')}</p>
                        <p className="font-medium">{formatDate(estimate.validUntil)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.projectEstimate.materials', 'Materials')}</p>
                        <p className="font-medium">{formatCurrency(estimate.subtotalMaterials)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.projectEstimate.labor', 'Labor')}</p>
                        <p className="font-medium">{formatCurrency(estimate.subtotalLabor)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingEstimate(estimate);
                          setActiveTab('edit');
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('tools.projectEstimate.edit', 'Edit')}
                      </button>
                      <button
                        onClick={() => duplicateEstimate(estimate)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        {t('tools.projectEstimate.duplicate', 'Duplicate')}
                      </button>
                      <button
                        onClick={() => deleteEstimate(estimate.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredEstimates.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">{t('tools.projectEstimate.noEstimatesFound', 'No estimates found')}</h3>
                <p className="text-gray-500 mt-1">{t('tools.projectEstimate.createYourFirstEstimateTo', 'Create your first estimate to get started')}</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  {t('tools.projectEstimate.createEstimate', 'Create Estimate')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit View */}
      {(activeTab === 'create' || activeTab === 'edit') && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'create' ? t('tools.projectEstimate.newProjectEstimate', 'New Project Estimate') : t('tools.projectEstimate.editProjectEstimate', 'Edit Project Estimate')}
            </h2>
            <button
              onClick={() => {
                setActiveTab('list');
                setEditingEstimate(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.projectEstimate.projectName', 'Project Name')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingEstimate?.projectName : newEstimate.projectName}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingEstimate({ ...editingEstimate!, projectName: e.target.value })
                    : setNewEstimate({ ...newEstimate, projectName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder={t('tools.projectEstimate.enterProjectName', 'Enter project name')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.projectEstimate.projectType2', 'Project Type')}</label>
              <select
                value={activeTab === 'edit' ? editingEstimate?.projectType : newEstimate.projectType}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingEstimate({ ...editingEstimate!, projectType: e.target.value })
                    : setNewEstimate({ ...newEstimate, projectType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {PROJECT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.projectEstimate.clientName', 'Client Name')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingEstimate?.clientName : newEstimate.clientName}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingEstimate({ ...editingEstimate!, clientName: e.target.value })
                    : setNewEstimate({ ...newEstimate, clientName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder={t('tools.projectEstimate.enterClientName', 'Enter client name')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.projectEstimate.clientEmail', 'Client Email')}</label>
              <input
                type="email"
                value={activeTab === 'edit' ? editingEstimate?.clientEmail : newEstimate.clientEmail}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingEstimate({ ...editingEstimate!, clientEmail: e.target.value })
                    : setNewEstimate({ ...newEstimate, clientEmail: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder={t('tools.projectEstimate.emailExampleCom', 'email@example.com')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.projectEstimate.estimateDate', 'Estimate Date')}</label>
              <input
                type="date"
                value={activeTab === 'edit' ? editingEstimate?.estimateDate : newEstimate.estimateDate}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingEstimate({ ...editingEstimate!, estimateDate: e.target.value })
                    : setNewEstimate({ ...newEstimate, estimateDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.projectEstimate.validUntil2', 'Valid Until')}</label>
              <input
                type="date"
                value={activeTab === 'edit' ? editingEstimate?.validUntil : newEstimate.validUntil}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingEstimate({ ...editingEstimate!, validUntil: e.target.value })
                    : setNewEstimate({ ...newEstimate, validUntil: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.projectEstimate.projectAddress', 'Project Address')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingEstimate?.projectAddress : newEstimate.projectAddress}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingEstimate({ ...editingEstimate!, projectAddress: e.target.value })
                    : setNewEstimate({ ...newEstimate, projectAddress: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder={t('tools.projectEstimate.enterProjectAddress', 'Enter project address')}
              />
            </div>
          </div>

          {/* Line Items */}
          {renderLineItemsEditor(
            activeTab === 'edit' ? editingEstimate! : newEstimate,
            activeTab === 'edit' ? setEditingEstimate : setNewEstimate
          )}

          {/* Markups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.projectEstimate.overhead', 'Overhead %')}</label>
              <input
                type="number"
                value={activeTab === 'edit' ? editingEstimate?.overheadPercent : newEstimate.overheadPercent}
                onChange={e => {
                  const value = parseFloat(e.target.value) || 0;
                  if (activeTab === 'edit') {
                    setEditingEstimate(calculateTotals({ ...editingEstimate!, overheadPercent: value }) as ProjectEstimate);
                  } else {
                    setNewEstimate(calculateTotals({ ...newEstimate, overheadPercent: value }));
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.projectEstimate.profit', 'Profit %')}</label>
              <input
                type="number"
                value={activeTab === 'edit' ? editingEstimate?.profitPercent : newEstimate.profitPercent}
                onChange={e => {
                  const value = parseFloat(e.target.value) || 0;
                  if (activeTab === 'edit') {
                    setEditingEstimate(calculateTotals({ ...editingEstimate!, profitPercent: value }) as ProjectEstimate);
                  } else {
                    setNewEstimate(calculateTotals({ ...newEstimate, profitPercent: value }));
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.projectEstimate.contingency', 'Contingency %')}</label>
              <input
                type="number"
                value={activeTab === 'edit' ? editingEstimate?.contingencyPercent : newEstimate.contingencyPercent}
                onChange={e => {
                  const value = parseFloat(e.target.value) || 0;
                  if (activeTab === 'edit') {
                    setEditingEstimate(calculateTotals({ ...editingEstimate!, contingencyPercent: value }) as ProjectEstimate);
                  } else {
                    setNewEstimate(calculateTotals({ ...newEstimate, contingencyPercent: value }));
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">{t('tools.projectEstimate.estimateSummary', 'Estimate Summary')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tools.projectEstimate.materialsSubtotal', 'Materials Subtotal')}</span>
                <span className="font-medium">
                  {formatCurrency(
                    activeTab === 'edit'
                      ? editingEstimate?.subtotalMaterials || 0
                      : newEstimate.subtotalMaterials || 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tools.projectEstimate.laborSubtotal', 'Labor Subtotal')}</span>
                <span className="font-medium">
                  {formatCurrency(
                    activeTab === 'edit'
                      ? editingEstimate?.subtotalLabor || 0
                      : newEstimate.subtotalLabor || 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tools.projectEstimate.overhead2', 'Overhead')}</span>
                <span className="font-medium">
                  {formatCurrency(
                    activeTab === 'edit' ? editingEstimate?.overhead || 0 : newEstimate.overhead || 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tools.projectEstimate.profit2', 'Profit')}</span>
                <span className="font-medium">
                  {formatCurrency(
                    activeTab === 'edit' ? editingEstimate?.profit || 0 : newEstimate.profit || 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tools.projectEstimate.contingency2', 'Contingency')}</span>
                <span className="font-medium">
                  {formatCurrency(
                    activeTab === 'edit'
                      ? editingEstimate?.contingency || 0
                      : newEstimate.contingency || 0
                  )}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">{t('tools.projectEstimate.totalEstimate', 'Total Estimate')}</span>
                  <span className="font-bold text-teal-600 text-xl">
                    {formatCurrency(
                      activeTab === 'edit'
                        ? editingEstimate?.totalEstimate || 0
                        : newEstimate.totalEstimate || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setActiveTab('list');
                setEditingEstimate(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('tools.projectEstimate.cancel', 'Cancel')}
            </button>
            <button
              onClick={activeTab === 'edit' ? handleUpdateEstimate : handleSaveEstimate}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {activeTab === 'edit' ? t('tools.projectEstimate.updateEstimate', 'Update Estimate') : t('tools.projectEstimate.saveEstimate', 'Save Estimate')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectEstimateTool;
