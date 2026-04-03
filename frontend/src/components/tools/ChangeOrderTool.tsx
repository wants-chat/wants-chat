'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileEdit,
  Plus,
  Trash2,
  Save,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Edit2,
  X,
  TrendingUp,
  TrendingDown,
  Send,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface ChangeOrderToolProps {
  uiConfig?: UIConfig;
}

// Types
type ChangeOrderStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'executed';
type ChangeType = 'addition' | 'deletion' | 'modification' | 'time_extension';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  laborHours: number;
  laborCost: number;
}

interface ChangeOrder {
  id: string;
  coNumber: string;
  projectName: string;
  projectNumber: string;
  contractNumber: string;
  title: string;
  description: string;
  reason: string;
  changeType: ChangeType;
  requestedBy: string;
  requestDate: string;
  approvedBy: string;
  approvalDate: string;
  status: ChangeOrderStatus;
  lineItems: LineItem[];
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overhead: number;
  overheadPercent: number;
  profit: number;
  profitPercent: number;
  totalCost: number;
  scheduleImpact: number;
  originalContractAmount: number;
  previousChanges: number;
  newContractAmount: number;
  attachments: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const STATUS_CONFIG: Record<ChangeOrderStatus, { color: string; label: string }> = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
  submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
  under_review: { color: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
  approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  executed: { color: 'bg-purple-100 text-purple-800', label: 'Executed' },
};

const CHANGE_TYPES: { value: ChangeType; label: string }[] = [
  { value: 'addition', label: 'Addition to Scope' },
  { value: 'deletion', label: 'Deletion from Scope' },
  { value: 'modification', label: 'Modification' },
  { value: 'time_extension', label: 'Time Extension' },
];

const UNITS = ['ea', 'lf', 'sf', 'sy', 'cy', 'hr', 'day', 'ls', 'lot'];

// Column configuration
const CO_COLUMNS: ColumnConfig[] = [
  { key: 'coNumber', header: 'CO #', type: 'string' },
  { key: 'projectName', header: 'Project', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'totalCost', header: 'Amount', type: 'currency' },
  { key: 'scheduleImpact', header: 'Days Impact', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'requestDate', header: 'Requested', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  const prefix = amount < 0 ? '-' : '';
  return prefix + new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));
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
export const ChangeOrderTool: React.FC<ChangeOrderToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const {
    data: changeOrders,
    addItem: addChangeOrder,
    updateItem: updateChangeOrder,
    deleteItem: deleteChangeOrder,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
  } = useToolData<ChangeOrder>('change-orders', [], CO_COLUMNS);

  // UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingCO, setEditingCO] = useState<ChangeOrder | null>(null);

  // Get next CO number
  const getNextCONumber = () => {
    const maxNum = changeOrders.reduce((max, co) => {
      const num = parseInt(co.coNumber.replace('CO-', ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return `CO-${String(maxNum + 1).padStart(3, '0')}`;
  };

  // New CO State
  const [newCO, setNewCO] = useState<Partial<ChangeOrder>>({
    coNumber: '',
    projectName: '',
    projectNumber: '',
    contractNumber: '',
    title: '',
    description: '',
    reason: '',
    changeType: 'addition',
    requestedBy: '',
    requestDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    lineItems: [],
    materialCost: 0,
    laborCost: 0,
    equipmentCost: 0,
    overheadPercent: 10,
    profitPercent: 10,
    scheduleImpact: 0,
    originalContractAmount: 0,
    previousChanges: 0,
    notes: '',
  });

  // Calculate totals
  const calculateTotals = (co: Partial<ChangeOrder>): Partial<ChangeOrder> => {
    const lineItems = co.lineItems || [];
    const materialCost = lineItems.reduce((sum, item) => sum + item.totalCost, 0);
    const laborCost = lineItems.reduce((sum, item) => sum + item.laborCost, 0);
    const directCost = materialCost + laborCost + (co.equipmentCost || 0);
    const overhead = directCost * ((co.overheadPercent || 0) / 100);
    const profit = directCost * ((co.profitPercent || 0) / 100);
    const totalCost = directCost + overhead + profit;
    const newContractAmount = (co.originalContractAmount || 0) + (co.previousChanges || 0) + totalCost;

    return {
      ...co,
      materialCost,
      laborCost,
      overhead,
      profit,
      totalCost,
      newContractAmount,
    };
  };

  // Add line item
  const addLineItem = (co: Partial<ChangeOrder>, setCO: Function) => {
    const newItem: LineItem = {
      id: generateId(),
      description: '',
      quantity: 1,
      unit: 'ea',
      unitCost: 0,
      totalCost: 0,
      laborHours: 0,
      laborCost: 0,
    };
    const updatedItems = [...(co.lineItems || []), newItem];
    setCO(calculateTotals({ ...co, lineItems: updatedItems }));
  };

  // Update line item
  const updateLineItem = (co: Partial<ChangeOrder>, setCO: Function, itemId: string, field: keyof LineItem, value: any) => {
    const updatedItems = (co.lineItems || []).map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        updated.totalCost = updated.quantity * updated.unitCost;
        updated.laborCost = updated.laborHours * 75; // Default labor rate
        return updated;
      }
      return item;
    });
    setCO(calculateTotals({ ...co, lineItems: updatedItems }));
  };

  // Remove line item
  const removeLineItem = (co: Partial<ChangeOrder>, setCO: Function, itemId: string) => {
    const updatedItems = (co.lineItems || []).filter(item => item.id !== itemId);
    setCO(calculateTotals({ ...co, lineItems: updatedItems }));
  };

  // Save CO
  const handleSave = () => {
    const calculated = calculateTotals(newCO);
    const co: ChangeOrder = {
      id: generateId(),
      coNumber: getNextCONumber(),
      projectName: calculated.projectName || '',
      projectNumber: calculated.projectNumber || '',
      contractNumber: calculated.contractNumber || '',
      title: calculated.title || '',
      description: calculated.description || '',
      reason: calculated.reason || '',
      changeType: calculated.changeType || 'addition',
      requestedBy: calculated.requestedBy || '',
      requestDate: calculated.requestDate || new Date().toISOString().split('T')[0],
      approvedBy: '',
      approvalDate: '',
      status: 'draft',
      lineItems: calculated.lineItems || [],
      materialCost: calculated.materialCost || 0,
      laborCost: calculated.laborCost || 0,
      equipmentCost: calculated.equipmentCost || 0,
      overhead: calculated.overhead || 0,
      overheadPercent: calculated.overheadPercent || 10,
      profit: calculated.profit || 0,
      profitPercent: calculated.profitPercent || 10,
      totalCost: calculated.totalCost || 0,
      scheduleImpact: calculated.scheduleImpact || 0,
      originalContractAmount: calculated.originalContractAmount || 0,
      previousChanges: calculated.previousChanges || 0,
      newContractAmount: calculated.newContractAmount || 0,
      attachments: [],
      notes: calculated.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addChangeOrder(co);
    setNewCO({
      coNumber: '',
      projectName: '',
      title: '',
      changeType: 'addition',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      lineItems: [],
      overheadPercent: 10,
      profitPercent: 10,
    });
    setActiveTab('list');
  };

  // Update CO
  const handleUpdate = () => {
    if (!editingCO) return;
    const calculated = calculateTotals(editingCO);
    updateChangeOrder(editingCO.id, {
      ...calculated,
      updatedAt: new Date().toISOString(),
    } as Partial<ChangeOrder>);
    setEditingCO(null);
    setActiveTab('list');
  };

  // Filter change orders
  const filteredCOs = useMemo(() => {
    return changeOrders.filter(co => {
      const matchesSearch =
        co.coNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        co.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        co.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || co.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [changeOrders, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const approved = changeOrders.filter(co => co.status === 'approved' || co.status === 'executed');
    const pending = changeOrders.filter(co => co.status === 'submitted' || co.status === 'under_review');
    return {
      totalCOs: changeOrders.length,
      approvedValue: approved.reduce((sum, co) => sum + co.totalCost, 0),
      pendingValue: pending.reduce((sum, co) => sum + co.totalCost, 0),
      totalDaysImpact: approved.reduce((sum, co) => sum + co.scheduleImpact, 0),
    };
  }, [changeOrders]);

  // Handle export
  const handleExport = async (format: string) => {
    switch (format) {
      case 'csv': exportCSV({ filename: 'change-orders' }); break;
      case 'excel': exportExcel({ filename: 'change-orders' }); break;
      case 'json': exportJSON({ filename: 'change-orders' }); break;
      case 'pdf': await exportPDF({ filename: 'change-orders', title: 'Change Orders' }); break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <FileEdit className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('tools.changeOrder.changeOrderManagement', 'Change Order Management')}</h1>
            <p className="text-gray-500">{t('tools.changeOrder.trackAndManageConstructionChange', 'Track and manage construction change orders')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="change-order" toolName="Change Order" />

          <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onSync={forceSync} />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.changeOrder.totalChangeOrders', 'Total Change Orders')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalCOs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.changeOrder.approvedValue', 'Approved Value')}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.approvedValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.changeOrder.pendingValue', 'Pending Value')}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.pendingValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.changeOrder.scheduleImpact', 'Schedule Impact')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalDaysImpact} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'list' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t('tools.changeOrder.allChangeOrders', 'All Change Orders')}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'create' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t('tools.changeOrder.newChangeOrder', 'New Change Order')}
        </button>
      </div>

      {/* List View */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.changeOrder.searchChangeOrders', 'Search change orders...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.changeOrder.allStatus', 'All Status')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {filteredCOs.map(co => (
              <div key={co.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === co.id ? null : co.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <FileEdit className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-teal-600">{co.coNumber}</span>
                          <h3 className="font-semibold text-gray-900">{co.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{co.projectName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-bold ${co.totalCost >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {co.totalCost >= 0 ? '+' : ''}{formatCurrency(co.totalCost)}
                        </p>
                        <p className="text-sm text-gray-500">{co.scheduleImpact !== 0 ? `${co.scheduleImpact > 0 ? '+' : ''}${co.scheduleImpact} days` : 'No delay'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[co.status].color}`}>
                        {STATUS_CONFIG[co.status].label}
                      </span>
                      {expandedId === co.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {expandedId === co.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.changeOrder.changeType', 'Change Type')}</p>
                        <p className="font-medium capitalize">{co.changeType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.changeOrder.requestedBy', 'Requested By')}</p>
                        <p className="font-medium">{co.requestedBy || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.changeOrder.requestDate', 'Request Date')}</p>
                        <p className="font-medium">{formatDate(co.requestDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.changeOrder.approvalDate', 'Approval Date')}</p>
                        <p className="font-medium">{formatDate(co.approvalDate) || '-'}</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tools.changeOrder.materialCost', 'Material Cost:')}</span>
                          <span className="font-medium">{formatCurrency(co.materialCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tools.changeOrder.laborCost', 'Labor Cost:')}</span>
                          <span className="font-medium">{formatCurrency(co.laborCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tools.changeOrder.equipment', 'Equipment:')}</span>
                          <span className="font-medium">{formatCurrency(co.equipmentCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Overhead ({co.overheadPercent}%):</span>
                          <span className="font-medium">{formatCurrency(co.overhead)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Profit ({co.profitPercent}%):</span>
                          <span className="font-medium">{formatCurrency(co.profit)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>{t('tools.changeOrder.total', 'Total:')}</span>
                          <span className={co.totalCost >= 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(co.totalCost)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingCO(co); setActiveTab('edit'); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('tools.changeOrder.edit', 'Edit')}
                      </button>
                      {co.status === 'draft' && (
                        <button
                          onClick={() => updateChangeOrder(co.id, { status: 'submitted' })}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                        >
                          <Send className="w-4 h-4" />
                          {t('tools.changeOrder.submit', 'Submit')}
                        </button>
                      )}
                      {co.status === 'under_review' && (
                        <>
                          <button
                            onClick={() => updateChangeOrder(co.id, { status: 'approved', approvalDate: new Date().toISOString().split('T')[0] })}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {t('tools.changeOrder.approve', 'Approve')}
                          </button>
                          <button
                            onClick={() => updateChangeOrder(co.id, { status: 'rejected' })}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            {t('tools.changeOrder.reject', 'Reject')}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteChangeOrder(co.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredCOs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <FileEdit className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">{t('tools.changeOrder.noChangeOrdersFound', 'No change orders found')}</h3>
                <button onClick={() => setActiveTab('create')} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  {t('tools.changeOrder.createChangeOrder', 'Create Change Order')}
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
            <h2 className="text-xl font-bold text-gray-900">{activeTab === 'create' ? t('tools.changeOrder.newChangeOrder2', 'New Change Order') : t('tools.changeOrder.editChangeOrder', 'Edit Change Order')}</h2>
            <button onClick={() => { setActiveTab('list'); setEditingCO(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.changeOrder.projectName', 'Project Name')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingCO?.projectName : newCO.projectName}
                onChange={e => activeTab === 'edit' ? setEditingCO({ ...editingCO!, projectName: e.target.value }) : setNewCO({ ...newCO, projectName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.changeOrder.changeOrderTitle', 'Change Order Title')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingCO?.title : newCO.title}
                onChange={e => activeTab === 'edit' ? setEditingCO({ ...editingCO!, title: e.target.value }) : setNewCO({ ...newCO, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.changeOrder.changeType2', 'Change Type')}</label>
              <select
                value={activeTab === 'edit' ? editingCO?.changeType : newCO.changeType}
                onChange={e => activeTab === 'edit' ? setEditingCO({ ...editingCO!, changeType: e.target.value as ChangeType }) : setNewCO({ ...newCO, changeType: e.target.value as ChangeType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {CHANGE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.changeOrder.requestedBy2', 'Requested By')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingCO?.requestedBy : newCO.requestedBy}
                onChange={e => activeTab === 'edit' ? setEditingCO({ ...editingCO!, requestedBy: e.target.value }) : setNewCO({ ...newCO, requestedBy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.changeOrder.requestDate2', 'Request Date')}</label>
              <input
                type="date"
                value={activeTab === 'edit' ? editingCO?.requestDate : newCO.requestDate}
                onChange={e => activeTab === 'edit' ? setEditingCO({ ...editingCO!, requestDate: e.target.value }) : setNewCO({ ...newCO, requestDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.changeOrder.scheduleImpactDays', 'Schedule Impact (days)')}</label>
              <input
                type="number"
                value={activeTab === 'edit' ? editingCO?.scheduleImpact : newCO.scheduleImpact}
                onChange={e => activeTab === 'edit' ? setEditingCO({ ...editingCO!, scheduleImpact: parseInt(e.target.value) || 0 }) : setNewCO({ ...newCO, scheduleImpact: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.changeOrder.description', 'Description')}</label>
            <textarea
              value={activeTab === 'edit' ? editingCO?.description : newCO.description}
              onChange={e => activeTab === 'edit' ? setEditingCO({ ...editingCO!, description: e.target.value }) : setNewCO({ ...newCO, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{t('tools.changeOrder.costBreakdown', 'Cost Breakdown')}</h3>
              <button
                onClick={() => addLineItem(activeTab === 'edit' ? editingCO! : newCO, activeTab === 'edit' ? setEditingCO : setNewCO)}
                className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('tools.changeOrder.addItem', 'Add Item')}
              </button>
            </div>

            <div className="space-y-2">
              {(activeTab === 'edit' ? editingCO?.lineItems : newCO.lineItems || [])?.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateLineItem(activeTab === 'edit' ? editingCO! : newCO, activeTab === 'edit' ? setEditingCO : setNewCO, item.id, 'description', e.target.value)}
                    placeholder={t('tools.changeOrder.description2', 'Description')}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateLineItem(activeTab === 'edit' ? editingCO! : newCO, activeTab === 'edit' ? setEditingCO : setNewCO, item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm text-right"
                  />
                  <select
                    value={item.unit}
                    onChange={e => updateLineItem(activeTab === 'edit' ? editingCO! : newCO, activeTab === 'edit' ? setEditingCO : setNewCO, item.id, 'unit', e.target.value)}
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <input
                    type="number"
                    value={item.unitCost}
                    onChange={e => updateLineItem(activeTab === 'edit' ? editingCO! : newCO, activeTab === 'edit' ? setEditingCO : setNewCO, item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm text-right"
                    placeholder={t('tools.changeOrder.unitCost', 'Unit Cost')}
                  />
                  <span className="w-24 text-right font-medium">{formatCurrency(item.totalCost)}</span>
                  <button onClick={() => removeLineItem(activeTab === 'edit' ? editingCO! : newCO, activeTab === 'edit' ? setEditingCO : setNewCO, item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Markups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.changeOrder.overhead', 'Overhead %')}</label>
              <input
                type="number"
                value={activeTab === 'edit' ? editingCO?.overheadPercent : newCO.overheadPercent}
                onChange={e => {
                  const value = parseFloat(e.target.value) || 0;
                  if (activeTab === 'edit') {
                    setEditingCO(calculateTotals({ ...editingCO!, overheadPercent: value }) as ChangeOrder);
                  } else {
                    setNewCO(calculateTotals({ ...newCO, overheadPercent: value }));
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.changeOrder.profit', 'Profit %')}</label>
              <input
                type="number"
                value={activeTab === 'edit' ? editingCO?.profitPercent : newCO.profitPercent}
                onChange={e => {
                  const value = parseFloat(e.target.value) || 0;
                  if (activeTab === 'edit') {
                    setEditingCO(calculateTotals({ ...editingCO!, profitPercent: value }) as ChangeOrder);
                  } else {
                    setNewCO(calculateTotals({ ...newCO, profitPercent: value }));
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tools.changeOrder.materialCost2', 'Material Cost')}</span>
                <span className="font-medium">{formatCurrency(activeTab === 'edit' ? editingCO?.materialCost || 0 : newCO.materialCost || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tools.changeOrder.overhead2', 'Overhead')}</span>
                <span className="font-medium">{formatCurrency(activeTab === 'edit' ? editingCO?.overhead || 0 : newCO.overhead || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tools.changeOrder.profit2', 'Profit')}</span>
                <span className="font-medium">{formatCurrency(activeTab === 'edit' ? editingCO?.profit || 0 : newCO.profit || 0)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">{t('tools.changeOrder.totalChangeOrderAmount', 'Total Change Order Amount')}</span>
                  <span className="font-bold text-xl text-teal-600">{formatCurrency(activeTab === 'edit' ? editingCO?.totalCost || 0 : newCO.totalCost || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={() => { setActiveTab('list'); setEditingCO(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('tools.changeOrder.cancel', 'Cancel')}</button>
            <button onClick={activeTab === 'edit' ? handleUpdate : handleSave} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Save className="w-4 h-4" />
              {activeTab === 'edit' ? t('tools.changeOrder.update', 'Update') : t('tools.changeOrder.save', 'Save')} Change Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeOrderTool;
