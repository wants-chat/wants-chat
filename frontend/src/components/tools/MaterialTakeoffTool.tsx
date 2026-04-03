'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  Plus,
  Trash2,
  Save,
  DollarSign,
  Layers,
  FileText,
  Building2,
  Ruler,
  Scale,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Copy,
  Edit2,
  X,
  Calculator,
  Download,
  Upload,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface MaterialTakeoffToolProps {
  uiConfig?: UIConfig;
}

// Types
interface MaterialItem {
  id: string;
  category: string;
  materialName: string;
  specification: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  wastePercent: number;
  adjustedQuantity: number;
  supplier: string;
  leadTime: string;
  notes: string;
}

interface MaterialTakeoff {
  id: string;
  projectName: string;
  projectNumber: string;
  location: string;
  preparedBy: string;
  date: string;
  phase: string;
  status: 'draft' | 'review' | 'approved' | 'ordered' | 'received';
  items: MaterialItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  shippingCost: number;
  totalCost: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const MATERIAL_CATEGORIES = [
  'Concrete & Masonry',
  'Steel & Metal',
  'Wood & Lumber',
  'Roofing',
  'Insulation',
  'Drywall & Plaster',
  'Flooring',
  'Doors & Windows',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Paint & Finishes',
  'Hardware',
  'Fasteners',
  'Safety Equipment',
  'Landscaping',
  'Miscellaneous',
];

const UNITS = [
  { value: 'ea', label: 'Each' },
  { value: 'lf', label: 'Linear Feet' },
  { value: 'sf', label: 'Square Feet' },
  { value: 'sy', label: 'Square Yards' },
  { value: 'cy', label: 'Cubic Yards' },
  { value: 'cf', label: 'Cubic Feet' },
  { value: 'ton', label: 'Tons' },
  { value: 'lb', label: 'Pounds' },
  { value: 'gal', label: 'Gallons' },
  { value: 'bag', label: 'Bags' },
  { value: 'roll', label: 'Rolls' },
  { value: 'box', label: 'Boxes' },
  { value: 'bundle', label: 'Bundles' },
  { value: 'sheet', label: 'Sheets' },
  { value: 'pallet', label: 'Pallets' },
];

const STATUS_CONFIG = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
  review: { color: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
  approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
  ordered: { color: 'bg-blue-100 text-blue-800', label: 'Ordered' },
  received: { color: 'bg-purple-100 text-purple-800', label: 'Received' },
};

// Column configuration
const TAKEOFF_COLUMNS: ColumnConfig[] = [
  { key: 'projectName', header: 'Project', type: 'string' },
  { key: 'projectNumber', header: 'Project #', type: 'string' },
  { key: 'phase', header: 'Phase', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'totalCost', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
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
export const MaterialTakeoffTool: React.FC<MaterialTakeoffToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const {
    data: takeoffs,
    addItem: addTakeoff,
    updateItem: updateTakeoff,
    deleteItem: deleteTakeoff,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
  } = useToolData<MaterialTakeoff>('material-takeoffs', [], TAKEOFF_COLUMNS);

  // UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTakeoff, setEditingTakeoff] = useState<MaterialTakeoff | null>(null);

  // New Takeoff State
  const [newTakeoff, setNewTakeoff] = useState<Partial<MaterialTakeoff>>({
    projectName: '',
    projectNumber: '',
    location: '',
    preparedBy: '',
    date: new Date().toISOString().split('T')[0],
    phase: 'Phase 1',
    status: 'draft',
    items: [],
    taxPercent: 8.25,
    shippingCost: 0,
    notes: '',
  });

  // Calculate totals
  const calculateTotals = (takeoff: Partial<MaterialTakeoff>): Partial<MaterialTakeoff> => {
    const items = takeoff.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0);
    const taxAmount = subtotal * ((takeoff.taxPercent || 0) / 100);
    const totalCost = subtotal + taxAmount + (takeoff.shippingCost || 0);

    return {
      ...takeoff,
      subtotal,
      taxAmount,
      totalCost,
    };
  };

  // Add material item
  const addMaterialItem = (takeoff: Partial<MaterialTakeoff>, setTakeoff: Function) => {
    const newItem: MaterialItem = {
      id: generateId(),
      category: 'Miscellaneous',
      materialName: '',
      specification: '',
      quantity: 0,
      unit: 'ea',
      unitCost: 0,
      totalCost: 0,
      wastePercent: 10,
      adjustedQuantity: 0,
      supplier: '',
      leadTime: '',
      notes: '',
    };
    const updatedItems = [...(takeoff.items || []), newItem];
    setTakeoff(calculateTotals({ ...takeoff, items: updatedItems }));
  };

  // Update material item
  const updateMaterialItem = (
    takeoff: Partial<MaterialTakeoff>,
    setTakeoff: Function,
    itemId: string,
    field: keyof MaterialItem,
    value: any
  ) => {
    const updatedItems = (takeoff.items || []).map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        // Recalculate
        updated.adjustedQuantity = updated.quantity * (1 + updated.wastePercent / 100);
        updated.totalCost = updated.adjustedQuantity * updated.unitCost;
        return updated;
      }
      return item;
    });
    setTakeoff(calculateTotals({ ...takeoff, items: updatedItems }));
  };

  // Remove material item
  const removeMaterialItem = (takeoff: Partial<MaterialTakeoff>, setTakeoff: Function, itemId: string) => {
    const updatedItems = (takeoff.items || []).filter(item => item.id !== itemId);
    setTakeoff(calculateTotals({ ...takeoff, items: updatedItems }));
  };

  // Save takeoff
  const handleSave = () => {
    const calculated = calculateTotals(newTakeoff);
    const takeoff: MaterialTakeoff = {
      id: generateId(),
      projectName: calculated.projectName || '',
      projectNumber: calculated.projectNumber || '',
      location: calculated.location || '',
      preparedBy: calculated.preparedBy || '',
      date: calculated.date || new Date().toISOString().split('T')[0],
      phase: calculated.phase || 'Phase 1',
      status: calculated.status || 'draft',
      items: calculated.items || [],
      subtotal: calculated.subtotal || 0,
      taxPercent: calculated.taxPercent || 0,
      taxAmount: calculated.taxAmount || 0,
      shippingCost: calculated.shippingCost || 0,
      totalCost: calculated.totalCost || 0,
      notes: calculated.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addTakeoff(takeoff);
    setNewTakeoff({
      projectName: '',
      projectNumber: '',
      location: '',
      preparedBy: '',
      date: new Date().toISOString().split('T')[0],
      phase: 'Phase 1',
      status: 'draft',
      items: [],
      taxPercent: 8.25,
      shippingCost: 0,
      notes: '',
    });
    setActiveTab('list');
  };

  // Update takeoff
  const handleUpdate = () => {
    if (!editingTakeoff) return;
    const calculated = calculateTotals(editingTakeoff);
    updateTakeoff(editingTakeoff.id, {
      ...calculated,
      updatedAt: new Date().toISOString(),
    } as Partial<MaterialTakeoff>);
    setEditingTakeoff(null);
    setActiveTab('list');
  };

  // Duplicate takeoff
  const duplicateTakeoff = (takeoff: MaterialTakeoff) => {
    const duplicate: MaterialTakeoff = {
      ...takeoff,
      id: generateId(),
      projectName: `${takeoff.projectName} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addTakeoff(duplicate);
  };

  // Filter takeoffs
  const filteredTakeoffs = useMemo(() => {
    return takeoffs.filter(takeoff => {
      const matchesSearch =
        takeoff.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        takeoff.projectNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || takeoff.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [takeoffs, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    totalTakeoffs: takeoffs.length,
    totalValue: takeoffs.reduce((sum, t) => sum + t.totalCost, 0),
    pendingOrders: takeoffs.filter(t => t.status === 'approved').length,
    totalItems: takeoffs.reduce((sum, t) => sum + t.items.length, 0),
  }), [takeoffs]);

  // Handle export
  const handleExport = async (format: string) => {
    switch (format) {
      case 'csv':
        exportCSV({ filename: 'material-takeoffs' });
        break;
      case 'excel':
        exportExcel({ filename: 'material-takeoffs' });
        break;
      case 'json':
        exportJSON({ filename: 'material-takeoffs' });
        break;
      case 'pdf':
        await exportPDF({ filename: 'material-takeoffs', title: 'Material Takeoffs' });
        break;
    }
  };

  // Render material items editor
  const renderItemsEditor = (takeoff: Partial<MaterialTakeoff>, setTakeoff: Function) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Materials</h3>
        <button
          onClick={() => addMaterialItem(takeoff, setTakeoff)}
          className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Material
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-gray-600">Category</th>
              <th className="px-3 py-2 text-left text-gray-600">Material</th>
              <th className="px-3 py-2 text-left text-gray-600">Specification</th>
              <th className="px-3 py-2 text-right text-gray-600">Qty</th>
              <th className="px-3 py-2 text-left text-gray-600">Unit</th>
              <th className="px-3 py-2 text-right text-gray-600">Waste %</th>
              <th className="px-3 py-2 text-right text-gray-600">Adj. Qty</th>
              <th className="px-3 py-2 text-right text-gray-600">Unit Cost</th>
              <th className="px-3 py-2 text-right text-gray-600">Total</th>
              <th className="px-3 py-2 text-center text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(takeoff.items || []).map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <select
                    value={item.category}
                    onChange={e => updateMaterialItem(takeoff, setTakeoff, item.id, 'category', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {MATERIAL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.materialName}
                    onChange={e => updateMaterialItem(takeoff, setTakeoff, item.id, 'materialName', e.target.value)}
                    placeholder="Material name"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.specification}
                    onChange={e => updateMaterialItem(takeoff, setTakeoff, item.id, 'specification', e.target.value)}
                    placeholder="Specs"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateMaterialItem(takeoff, setTakeoff, item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.unit}
                    onChange={e => updateMaterialItem(takeoff, setTakeoff, item.id, 'unit', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {UNITS.map(u => (
                      <option key={u.value} value={u.value}>{u.value}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.wastePercent}
                    onChange={e => updateMaterialItem(takeoff, setTakeoff, item.id, 'wastePercent', parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium text-gray-900">
                  {item.adjustedQuantity.toFixed(2)}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.unitCost}
                    onChange={e => updateMaterialItem(takeoff, setTakeoff, item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium text-teal-600">
                  {formatCurrency(item.totalCost)}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => removeMaterialItem(takeoff, setTakeoff, item.id)}
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

      {(takeoff.items || []).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No materials added. Click "Add Material" to start your takeoff.
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
            <Package className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('tools.materialTakeoff.materialTakeoff', 'Material Takeoff')}</h1>
            <p className="text-gray-500">{t('tools.materialTakeoff.calculateMaterialsNeededForConstruction', 'Calculate materials needed for construction')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="material-takeoff" toolName="Material Takeoff" />

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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.materialTakeoff.totalTakeoffs', 'Total Takeoffs')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalTakeoffs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.materialTakeoff.totalValue', 'Total Value')}</p>
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
              <p className="text-sm text-gray-500">{t('tools.materialTakeoff.pendingOrders', 'Pending Orders')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.materialTakeoff.totalItems', 'Total Items')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalItems}</p>
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
          {t('tools.materialTakeoff.allTakeoffs', 'All Takeoffs')}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'create'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('tools.materialTakeoff.newTakeoff', 'New Takeoff')}
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
                placeholder={t('tools.materialTakeoff.searchTakeoffs', 'Search takeoffs...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">{t('tools.materialTakeoff.allStatus', 'All Status')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {filteredTakeoffs.map(takeoff => (
              <div
                key={takeoff.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === takeoff.id ? null : takeoff.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Package className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{takeoff.projectName}</h3>
                        <p className="text-sm text-gray-500">{takeoff.projectNumber} - {takeoff.phase}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(takeoff.totalCost)}</p>
                        <p className="text-sm text-gray-500">{takeoff.items.length} items</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[takeoff.status].color}`}>
                        {STATUS_CONFIG[takeoff.status].label}
                      </span>
                      {expandedId === takeoff.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === takeoff.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.materialTakeoff.preparedBy', 'Prepared By')}</p>
                        <p className="font-medium">{takeoff.preparedBy || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.materialTakeoff.date', 'Date')}</p>
                        <p className="font-medium">{formatDate(takeoff.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.materialTakeoff.subtotal', 'Subtotal')}</p>
                        <p className="font-medium">{formatCurrency(takeoff.subtotal)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.materialTakeoff.taxShipping', 'Tax + Shipping')}</p>
                        <p className="font-medium">{formatCurrency(takeoff.taxAmount + takeoff.shippingCost)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTakeoff(takeoff);
                          setActiveTab('edit');
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('tools.materialTakeoff.edit', 'Edit')}
                      </button>
                      <button
                        onClick={() => duplicateTakeoff(takeoff)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        {t('tools.materialTakeoff.duplicate', 'Duplicate')}
                      </button>
                      <button
                        onClick={() => deleteTakeoff(takeoff.id)}
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

            {filteredTakeoffs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">{t('tools.materialTakeoff.noTakeoffsFound', 'No takeoffs found')}</h3>
                <p className="text-gray-500 mt-1">{t('tools.materialTakeoff.createYourFirstMaterialTakeoff', 'Create your first material takeoff')}</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {t('tools.materialTakeoff.createTakeoff', 'Create Takeoff')}
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
              {activeTab === 'create' ? t('tools.materialTakeoff.newMaterialTakeoff', 'New Material Takeoff') : t('tools.materialTakeoff.editMaterialTakeoff', 'Edit Material Takeoff')}
            </h2>
            <button
              onClick={() => {
                setActiveTab('list');
                setEditingTakeoff(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.materialTakeoff.projectName', 'Project Name')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingTakeoff?.projectName : newTakeoff.projectName}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingTakeoff({ ...editingTakeoff!, projectName: e.target.value })
                    : setNewTakeoff({ ...newTakeoff, projectName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.materialTakeoff.projectNumber', 'Project Number')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingTakeoff?.projectNumber : newTakeoff.projectNumber}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingTakeoff({ ...editingTakeoff!, projectNumber: e.target.value })
                    : setNewTakeoff({ ...newTakeoff, projectNumber: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.materialTakeoff.phase', 'Phase')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingTakeoff?.phase : newTakeoff.phase}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingTakeoff({ ...editingTakeoff!, phase: e.target.value })
                    : setNewTakeoff({ ...newTakeoff, phase: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.materialTakeoff.preparedBy2', 'Prepared By')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingTakeoff?.preparedBy : newTakeoff.preparedBy}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingTakeoff({ ...editingTakeoff!, preparedBy: e.target.value })
                    : setNewTakeoff({ ...newTakeoff, preparedBy: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.materialTakeoff.date2', 'Date')}</label>
              <input
                type="date"
                value={activeTab === 'edit' ? editingTakeoff?.date : newTakeoff.date}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingTakeoff({ ...editingTakeoff!, date: e.target.value })
                    : setNewTakeoff({ ...newTakeoff, date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.materialTakeoff.status', 'Status')}</label>
              <select
                value={activeTab === 'edit' ? editingTakeoff?.status : newTakeoff.status}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingTakeoff({ ...editingTakeoff!, status: e.target.value as any })
                    : setNewTakeoff({ ...newTakeoff, status: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          {renderItemsEditor(
            activeTab === 'edit' ? editingTakeoff! : newTakeoff,
            activeTab === 'edit' ? setEditingTakeoff : setNewTakeoff
          )}

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.materialTakeoff.tax', 'Tax %')}</label>
              <input
                type="number"
                value={activeTab === 'edit' ? editingTakeoff?.taxPercent : newTakeoff.taxPercent}
                onChange={e => {
                  const value = parseFloat(e.target.value) || 0;
                  if (activeTab === 'edit') {
                    setEditingTakeoff(calculateTotals({ ...editingTakeoff!, taxPercent: value }) as MaterialTakeoff);
                  } else {
                    setNewTakeoff(calculateTotals({ ...newTakeoff, taxPercent: value }));
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.materialTakeoff.shippingCost', 'Shipping Cost')}</label>
              <input
                type="number"
                value={activeTab === 'edit' ? editingTakeoff?.shippingCost : newTakeoff.shippingCost}
                onChange={e => {
                  const value = parseFloat(e.target.value) || 0;
                  if (activeTab === 'edit') {
                    setEditingTakeoff(calculateTotals({ ...editingTakeoff!, shippingCost: value }) as MaterialTakeoff);
                  } else {
                    setNewTakeoff(calculateTotals({ ...newTakeoff, shippingCost: value }));
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tools.materialTakeoff.subtotal2', 'Subtotal')}</span>
                <span className="font-medium">
                  {formatCurrency(activeTab === 'edit' ? editingTakeoff?.subtotal || 0 : newTakeoff.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tools.materialTakeoff.tax2', 'Tax')}</span>
                <span className="font-medium">
                  {formatCurrency(activeTab === 'edit' ? editingTakeoff?.taxAmount || 0 : newTakeoff.taxAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tools.materialTakeoff.shipping', 'Shipping')}</span>
                <span className="font-medium">
                  {formatCurrency(activeTab === 'edit' ? editingTakeoff?.shippingCost || 0 : newTakeoff.shippingCost || 0)}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">{t('tools.materialTakeoff.total', 'Total')}</span>
                  <span className="font-bold text-teal-600 text-xl">
                    {formatCurrency(activeTab === 'edit' ? editingTakeoff?.totalCost || 0 : newTakeoff.totalCost || 0)}
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
                setEditingTakeoff(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t('tools.materialTakeoff.cancel', 'Cancel')}
            </button>
            <button
              onClick={activeTab === 'edit' ? handleUpdate : handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <Save className="w-4 h-4" />
              {activeTab === 'edit' ? t('tools.materialTakeoff.update', 'Update') : t('tools.materialTakeoff.save', 'Save')} Takeoff
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialTakeoffTool;
