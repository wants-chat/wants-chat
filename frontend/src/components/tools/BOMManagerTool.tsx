'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  ChevronRight,
  Package,
  Hash,
  DollarSign,
  Copy,
  FileText,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import ExportDropdown from '../ui/ExportDropdown';
import SyncStatus from '../ui/SyncStatus';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Interfaces
interface BOMComponent {
  id: string;
  component_name: string;
  part_number: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  lead_time_days: number;
  supplier?: string;
  notes?: string;
}

interface BillOfMaterials {
  id: string;
  bom_number: string;
  product_name: string;
  product_code: string;
  revision: string;
  status: 'draft' | 'active' | 'obsolete';
  components: BOMComponent[];
  total_cost: number;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

interface BOMManagerToolProps {
  uiConfig?: any;
}

// Column configuration for exports
const bomColumns: ColumnConfig[] = [
  { key: 'bom_number', header: 'BOM #', type: 'string' },
  { key: 'product_name', header: 'Product', type: 'string' },
  { key: 'product_code', header: 'Code', type: 'string' },
  { key: 'revision', header: 'Revision', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'component_count', header: 'Components', type: 'number' },
  { key: 'total_cost', header: 'Total Cost', type: 'currency' },
  { key: 'created_by', header: 'Created By', type: 'string' },
  { key: 'created_at', header: 'Created', type: 'date' },
];

// Generate sample data
const generateSampleData = (): BillOfMaterials[] => {
  return [
    {
      id: 'bom-001',
      bom_number: 'BOM-2024-001',
      product_name: 'Electric Motor Assembly',
      product_code: 'EMA-5000',
      revision: 'A',
      status: 'active',
      components: [
        { id: 'c-001', component_name: 'Motor Housing', part_number: 'MH-100', quantity: 1, unit: 'pcs', unit_cost: 45.00, total_cost: 45.00, lead_time_days: 7, supplier: 'MetalCast Inc.' },
        { id: 'c-002', component_name: 'Stator Core', part_number: 'SC-200', quantity: 1, unit: 'pcs', unit_cost: 120.00, total_cost: 120.00, lead_time_days: 14, supplier: 'ElectroParts' },
        { id: 'c-003', component_name: 'Rotor Assembly', part_number: 'RA-300', quantity: 1, unit: 'pcs', unit_cost: 85.00, total_cost: 85.00, lead_time_days: 10, supplier: 'ElectroParts' },
        { id: 'c-004', component_name: 'Bearing Set', part_number: 'BS-400', quantity: 2, unit: 'sets', unit_cost: 25.00, total_cost: 50.00, lead_time_days: 5, supplier: 'BearingWorld' },
        { id: 'c-005', component_name: 'Copper Wire', part_number: 'CW-500', quantity: 50, unit: 'm', unit_cost: 2.50, total_cost: 125.00, lead_time_days: 3, supplier: 'CopperSource' },
      ],
      total_cost: 425.00,
      created_by: 'John Engineer',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bom-002',
      bom_number: 'BOM-2024-002',
      product_name: 'Control Panel Unit',
      product_code: 'CPU-3000',
      revision: 'B',
      status: 'active',
      components: [
        { id: 'c-006', component_name: 'Enclosure Box', part_number: 'EB-100', quantity: 1, unit: 'pcs', unit_cost: 65.00, total_cost: 65.00, lead_time_days: 10 },
        { id: 'c-007', component_name: 'PLC Module', part_number: 'PLC-200', quantity: 1, unit: 'pcs', unit_cost: 450.00, total_cost: 450.00, lead_time_days: 21 },
        { id: 'c-008', component_name: 'Terminal Blocks', part_number: 'TB-300', quantity: 20, unit: 'pcs', unit_cost: 3.50, total_cost: 70.00, lead_time_days: 5 },
      ],
      total_cost: 585.00,
      created_by: 'Sarah Designer',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

// Generate unique ID
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const BOMManagerTool: React.FC<BOMManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use tool data hook for backend sync
  const {
    data: boms,
    setData: setBoms,
    isLoading: loading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
  } = useToolData<BillOfMaterials>('bom-manager', generateSampleData(), bomColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [expandedBoms, setExpandedBoms] = useState<Set<string>>(new Set());

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [editingBom, setEditingBom] = useState<BillOfMaterials | null>(null);
  const [editingComponent, setEditingComponent] = useState<BOMComponent | null>(null);
  const [selectedBomId, setSelectedBomId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [bomFormData, setBomFormData] = useState({
    bom_number: '',
    product_name: '',
    product_code: '',
    revision: 'A',
    status: 'draft' as BillOfMaterials['status'],
    created_by: '',
  });

  const [componentFormData, setComponentFormData] = useState({
    component_name: '',
    part_number: '',
    quantity: 1,
    unit: 'pcs',
    unit_cost: 0,
    lead_time_days: 0,
    supplier: '',
    notes: '',
  });

  // Filter BOMs
  const filteredBoms = boms.filter(bom => {
    const matchesSearch = !searchQuery ||
      bom.bom_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bom.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bom.product_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || bom.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: boms.length,
    active: boms.filter(b => b.status === 'active').length,
    draft: boms.filter(b => b.status === 'draft').length,
    totalComponents: boms.reduce((sum, b) => sum + b.components.length, 0),
    totalValue: boms.reduce((sum, b) => sum + b.total_cost, 0),
  };

  // Toggle expanded BOM
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedBoms);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedBoms(newExpanded);
  };

  // Handle BOM form submit
  const handleBomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingBom) {
        updateItem(editingBom.id, {
          ...bomFormData,
          updated_at: new Date().toISOString(),
        });
      } else {
        const newBom: BillOfMaterials = {
          id: generateId('bom'),
          ...bomFormData,
          components: [],
          total_cost: 0,
          created_at: new Date().toISOString(),
        };
        addItem(newBom);
      }

      setShowModal(false);
      resetBomForm();
    } catch (error) {
      console.error('Error saving BOM:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle component form submit
  const handleComponentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBomId) return;
    setSaving(true);

    try {
      const bom = boms.find(b => b.id === selectedBomId);
      if (!bom) return;

      let updatedComponents: BOMComponent[];
      const totalCost = componentFormData.quantity * componentFormData.unit_cost;

      if (editingComponent) {
        updatedComponents = bom.components.map(c =>
          c.id === editingComponent.id
            ? { ...c, ...componentFormData, total_cost: totalCost }
            : c
        );
      } else {
        const newComponent: BOMComponent = {
          id: generateId('comp'),
          ...componentFormData,
          total_cost: totalCost,
        };
        updatedComponents = [...bom.components, newComponent];
      }

      const newTotalCost = updatedComponents.reduce((sum, c) => sum + c.total_cost, 0);

      updateItem(selectedBomId, {
        components: updatedComponents,
        total_cost: newTotalCost,
        updated_at: new Date().toISOString(),
      });

      setShowComponentModal(false);
      resetComponentForm();
    } catch (error) {
      console.error('Error saving component:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetBomForm = () => {
    setBomFormData({
      bom_number: '',
      product_name: '',
      product_code: '',
      revision: 'A',
      status: 'draft',
      created_by: '',
    });
    setEditingBom(null);
  };

  const resetComponentForm = () => {
    setComponentFormData({
      component_name: '',
      part_number: '',
      quantity: 1,
      unit: 'pcs',
      unit_cost: 0,
      lead_time_days: 0,
      supplier: '',
      notes: '',
    });
    setEditingComponent(null);
  };

  const openEditBomModal = (bom: BillOfMaterials) => {
    setEditingBom(bom);
    setBomFormData({
      bom_number: bom.bom_number,
      product_name: bom.product_name,
      product_code: bom.product_code,
      revision: bom.revision,
      status: bom.status,
      created_by: bom.created_by,
    });
    setShowModal(true);
  };

  const openAddComponentModal = (bomId: string) => {
    setSelectedBomId(bomId);
    resetComponentForm();
    setShowComponentModal(true);
  };

  const openEditComponentModal = (bomId: string, component: BOMComponent) => {
    setSelectedBomId(bomId);
    setEditingComponent(component);
    setComponentFormData({
      component_name: component.component_name,
      part_number: component.part_number,
      quantity: component.quantity,
      unit: component.unit,
      unit_cost: component.unit_cost,
      lead_time_days: component.lead_time_days,
      supplier: component.supplier || '',
      notes: component.notes || '',
    });
    setShowComponentModal(true);
  };

  const handleDeleteBom = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete BOM',
      message: 'Are you sure you want to delete this BOM?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleDeleteComponent = async (bomId: string, componentId: string) => {
    const confirmed = await confirm({
      title: 'Delete Component',
      message: 'Are you sure you want to delete this component?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      const bom = boms.find(b => b.id === bomId);
      if (!bom) return;

      const updatedComponents = bom.components.filter(c => c.id !== componentId);
      const newTotalCost = updatedComponents.reduce((sum, c) => sum + c.total_cost, 0);

      updateItem(bomId, {
        components: updatedComponents,
        total_cost: newTotalCost,
        updated_at: new Date().toISOString(),
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      active: 'bg-green-500/20 text-green-400',
      obsolete: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'} rounded-xl`}>
              <Layers className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bOMManager.bomManager', 'BOM Manager')}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.bOMManager.billOfMaterialsManagement', 'Bill of Materials management')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <WidgetEmbedButton toolSlug="b-o-m-manager" toolName="B O M Manager" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="md"
            />
            <ExportDropdown
              onExportCSV={() => exportToCSV(boms.map(b => ({ ...b, component_count: b.components.length })), bomColumns, { filename: 'bill-of-materials' })}
              onExportExcel={() => exportToExcel(boms.map(b => ({ ...b, component_count: b.components.length })), bomColumns, { filename: 'bill-of-materials' })}
              onExportJSON={() => exportToJSON(boms, { filename: 'bill-of-materials' })}
              onExportPDF={() => exportToPDF(boms.map(b => ({ ...b, component_count: b.components.length })), bomColumns, { filename: 'bill-of-materials', title: 'Bill of Materials' })}
              onPrint={() => printData(boms.map(b => ({ ...b, component_count: b.components.length })), bomColumns, { title: 'Bill of Materials' })}
              onCopyToClipboard={() => copyUtil(boms.map(b => ({ ...b, component_count: b.components.length })), bomColumns)}
              disabled={boms.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => {
                resetBomForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.bOMManager.newBom', 'New BOM')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.bOMManager.totalBoms', 'Total BOMs')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.bOMManager.active', 'Active')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.active}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Edit2 className="w-5 h-5 text-gray-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.bOMManager.drafts', 'Drafts')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.draft}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.bOMManager.components', 'Components')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalComponents}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.bOMManager.totalValue', 'Total Value')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.bOMManager.searchBoms', 'Search BOMs...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              <option value="">{t('tools.bOMManager.allStatus', 'All Status')}</option>
              <option value="draft">{t('tools.bOMManager.draft', 'Draft')}</option>
              <option value="active">{t('tools.bOMManager.active2', 'Active')}</option>
              <option value="obsolete">{t('tools.bOMManager.obsolete', 'Obsolete')}</option>
            </select>
          </div>
        </div>

        {/* BOM List */}
        <div className="space-y-4">
          {filteredBoms.map((bom) => (
            <div key={bom.id} className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm overflow-hidden`}>
              {/* BOM Header */}
              <div
                className={`p-4 flex items-center justify-between cursor-pointer ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                onClick={() => toggleExpanded(bom.id)}
              >
                <div className="flex items-center gap-4">
                  <ChevronRight className={`w-5 h-5 transition-transform ${expandedBoms.has(bom.id) ? 'rotate-90' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{bom.bom_number}</span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Rev {bom.revision}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bom.status)}`}>
                        {bom.status}
                      </span>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {bom.product_name} ({bom.product_code})
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{bom.components.length} components</div>
                    <div className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>${bom.total_cost.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditBomModal(bom)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteBom(bom.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Components Table */}
              {expandedBoms.has(bom.id) && (
                <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bOMManager.components2', 'Components')}</h3>
                      <button
                        onClick={() => openAddComponentModal(bom.id)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.bOMManager.addComponent', 'Add Component')}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th className={`px-3 py-2 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.part', 'Part #')}</th>
                            <th className={`px-3 py-2 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.component', 'Component')}</th>
                            <th className={`px-3 py-2 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.qty', 'Qty')}</th>
                            <th className={`px-3 py-2 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.unitCost', 'Unit Cost')}</th>
                            <th className={`px-3 py-2 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.total', 'Total')}</th>
                            <th className={`px-3 py-2 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.leadTime', 'Lead Time')}</th>
                            <th className={`px-3 py-2 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.actions', 'Actions')}</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {bom.components.map((comp) => (
                            <tr key={comp.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                              <td className={`px-3 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{comp.part_number}</td>
                              <td className={`px-3 py-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <div>{comp.component_name}</div>
                                {comp.supplier && <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{comp.supplier}</div>}
                              </td>
                              <td className={`px-3 py-2 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{comp.quantity} {comp.unit}</td>
                              <td className={`px-3 py-2 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>${comp.unit_cost.toFixed(2)}</td>
                              <td className={`px-3 py-2 text-sm text-right font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>${comp.total_cost.toFixed(2)}</td>
                              <td className={`px-3 py-2 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{comp.lead_time_days}d</td>
                              <td className="px-3 py-2 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => openEditComponentModal(bom.id, comp)}
                                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                                  >
                                    <Edit2 className="w-3 h-3 text-blue-500" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComponent(bom.id, comp.id)}
                                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                                  >
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {bom.components.length === 0 && (
                            <tr>
                              <td colSpan={7} className={`px-3 py-8 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t('tools.bOMManager.noComponentsAddedYet', 'No components added yet')}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredBoms.length === 0 && (
            <div className={`p-8 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm text-center`}>
              <Layers className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bOMManager.noBillsOfMaterialsFound', 'No bills of materials found')}</p>
            </div>
          )}
        </div>

        {/* BOM Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-lg rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingBom ? t('tools.bOMManager.editBom', 'Edit BOM') : t('tools.bOMManager.newBom2', 'New BOM')}
                </h2>
                <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBomSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.bomNumber', 'BOM Number *')}</label>
                    <input
                      type="text"
                      required
                      value={bomFormData.bom_number}
                      onChange={(e) => setBomFormData({ ...bomFormData, bom_number: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder={t('tools.bOMManager.bom2024001', 'BOM-2024-001')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.revision', 'Revision')}</label>
                    <input
                      type="text"
                      value={bomFormData.revision}
                      onChange={(e) => setBomFormData({ ...bomFormData, revision: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="A"
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.productName', 'Product Name *')}</label>
                  <input
                    type="text"
                    required
                    value={bomFormData.product_name}
                    onChange={(e) => setBomFormData({ ...bomFormData, product_name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.productCode', 'Product Code *')}</label>
                    <input
                      type="text"
                      required
                      value={bomFormData.product_code}
                      onChange={(e) => setBomFormData({ ...bomFormData, product_code: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.status', 'Status')}</label>
                    <select
                      value={bomFormData.status}
                      onChange={(e) => setBomFormData({ ...bomFormData, status: e.target.value as BillOfMaterials['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="draft">{t('tools.bOMManager.draft2', 'Draft')}</option>
                      <option value="active">{t('tools.bOMManager.active3', 'Active')}</option>
                      <option value="obsolete">{t('tools.bOMManager.obsolete2', 'Obsolete')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.createdBy', 'Created By')}</label>
                  <input
                    type="text"
                    value={bomFormData.created_by}
                    onChange={(e) => setBomFormData({ ...bomFormData, created_by: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    {t('tools.bOMManager.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingBom ? t('tools.bOMManager.update', 'Update') : t('tools.bOMManager.create', 'Create')} BOM
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Component Modal */}
        {showComponentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-lg rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingComponent ? t('tools.bOMManager.editComponent', 'Edit Component') : t('tools.bOMManager.addComponent2', 'Add Component')}
                </h2>
                <button onClick={() => setShowComponentModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleComponentSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.partNumber', 'Part Number *')}</label>
                    <input
                      type="text"
                      required
                      value={componentFormData.part_number}
                      onChange={(e) => setComponentFormData({ ...componentFormData, part_number: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.componentName', 'Component Name *')}</label>
                    <input
                      type="text"
                      required
                      value={componentFormData.component_name}
                      onChange={(e) => setComponentFormData({ ...componentFormData, component_name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.quantity', 'Quantity *')}</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={componentFormData.quantity}
                      onChange={(e) => setComponentFormData({ ...componentFormData, quantity: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.unit', 'Unit')}</label>
                    <select
                      value={componentFormData.unit}
                      onChange={(e) => setComponentFormData({ ...componentFormData, unit: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="pcs">{t('tools.bOMManager.pieces', 'Pieces')}</option>
                      <option value="sets">{t('tools.bOMManager.sets', 'Sets')}</option>
                      <option value="kg">{t('tools.bOMManager.kilograms', 'Kilograms')}</option>
                      <option value="m">{t('tools.bOMManager.meters', 'Meters')}</option>
                      <option value="l">{t('tools.bOMManager.liters', 'Liters')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.unitCost2', 'Unit Cost *')}</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={componentFormData.unit_cost}
                      onChange={(e) => setComponentFormData({ ...componentFormData, unit_cost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.supplier', 'Supplier')}</label>
                    <input
                      type="text"
                      value={componentFormData.supplier}
                      onChange={(e) => setComponentFormData({ ...componentFormData, supplier: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.leadTimeDays', 'Lead Time (days)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={componentFormData.lead_time_days}
                      onChange={(e) => setComponentFormData({ ...componentFormData, lead_time_days: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bOMManager.notes', 'Notes')}</label>
                  <textarea
                    rows={2}
                    value={componentFormData.notes}
                    onChange={(e) => setComponentFormData({ ...componentFormData, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowComponentModal(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    {t('tools.bOMManager.cancel2', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingComponent ? t('tools.bOMManager.update2', 'Update') : t('tools.bOMManager.add', 'Add')} Component
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default BOMManagerTool;
