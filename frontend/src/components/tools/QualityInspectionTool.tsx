'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Camera,
  BarChart3,
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
interface InspectionCheckpoint {
  id: string;
  checkpoint_name: string;
  specification: string;
  actual_value?: string;
  min_value?: number;
  max_value?: number;
  result: 'pass' | 'fail' | 'pending';
  notes?: string;
}

interface QualityInspection {
  id: string;
  inspection_number: string;
  work_order_ref?: string;
  product_name: string;
  product_code: string;
  batch_number: string;
  inspection_type: 'incoming' | 'in-process' | 'final' | 'audit';
  status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'on-hold';
  inspector: string;
  inspection_date: string;
  checkpoints: InspectionCheckpoint[];
  defects_found: number;
  sample_size: number;
  accepted_qty: number;
  rejected_qty: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface QualityInspectionToolProps {
  uiConfig?: any;
}

// Status configurations
const inspectionStatuses = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'gray' },
  { value: 'in-progress', label: 'In Progress', icon: FileText, color: 'blue' },
  { value: 'passed', label: 'Passed', icon: CheckCircle2, color: 'green' },
  { value: 'failed', label: 'Failed', icon: XCircle, color: 'red' },
  { value: 'on-hold', label: 'On Hold', icon: AlertTriangle, color: 'yellow' },
];

const inspectionTypes = [
  { value: 'incoming', label: 'Incoming Inspection' },
  { value: 'in-process', label: 'In-Process Inspection' },
  { value: 'final', label: 'Final Inspection' },
  { value: 'audit', label: 'Quality Audit' },
];

// Column configuration for exports
const inspectionColumns: ColumnConfig[] = [
  { key: 'inspection_number', header: 'Inspection #', type: 'string' },
  { key: 'product_name', header: 'Product', type: 'string' },
  { key: 'product_code', header: 'Code', type: 'string' },
  { key: 'batch_number', header: 'Batch #', type: 'string' },
  { key: 'inspection_type', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'inspector', header: 'Inspector', type: 'string' },
  { key: 'inspection_date', header: 'Date', type: 'date' },
  { key: 'sample_size', header: 'Sample Size', type: 'number' },
  { key: 'accepted_qty', header: 'Accepted', type: 'number' },
  { key: 'rejected_qty', header: 'Rejected', type: 'number' },
  { key: 'defects_found', header: 'Defects', type: 'number' },
];

// Generate sample data
const generateSampleData = (): QualityInspection[] => {
  return [
    {
      id: 'qi-001',
      inspection_number: 'QI-2024-001',
      work_order_ref: 'WO-2024-001',
      product_name: 'Precision Bearing',
      product_code: 'PB-5000',
      batch_number: 'BATCH-20240115-001',
      inspection_type: 'final',
      status: 'passed',
      inspector: 'Mike Quality',
      inspection_date: new Date().toISOString().split('T')[0],
      checkpoints: [
        { id: 'cp-001', checkpoint_name: 'Outer Diameter', specification: '50.00mm +/- 0.02', actual_value: '50.01mm', min_value: 49.98, max_value: 50.02, result: 'pass' },
        { id: 'cp-002', checkpoint_name: 'Inner Diameter', specification: '30.00mm +/- 0.01', actual_value: '30.00mm', min_value: 29.99, max_value: 30.01, result: 'pass' },
        { id: 'cp-003', checkpoint_name: 'Surface Finish', specification: 'Ra 0.8 max', actual_value: 'Ra 0.6', result: 'pass' },
      ],
      defects_found: 0,
      sample_size: 100,
      accepted_qty: 100,
      rejected_qty: 0,
      notes: 'All units meet specifications',
      created_at: new Date().toISOString(),
    },
    {
      id: 'qi-002',
      inspection_number: 'QI-2024-002',
      product_name: 'Steel Shaft',
      product_code: 'SS-3000',
      batch_number: 'BATCH-20240115-002',
      inspection_type: 'incoming',
      status: 'failed',
      inspector: 'Sarah Inspector',
      inspection_date: new Date().toISOString().split('T')[0],
      checkpoints: [
        { id: 'cp-004', checkpoint_name: 'Length', specification: '200mm +/- 0.5', actual_value: '200.2mm', min_value: 199.5, max_value: 200.5, result: 'pass' },
        { id: 'cp-005', checkpoint_name: 'Hardness', specification: '58-62 HRC', actual_value: '55 HRC', min_value: 58, max_value: 62, result: 'fail', notes: 'Below minimum hardness' },
      ],
      defects_found: 15,
      sample_size: 50,
      accepted_qty: 35,
      rejected_qty: 15,
      notes: 'Supplier notified of hardness issues',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'qi-003',
      inspection_number: 'QI-2024-003',
      product_name: 'Electronic PCB',
      product_code: 'PCB-2000',
      batch_number: 'BATCH-20240115-003',
      inspection_type: 'in-process',
      status: 'in-progress',
      inspector: 'Tom Checker',
      inspection_date: new Date().toISOString().split('T')[0],
      checkpoints: [
        { id: 'cp-006', checkpoint_name: 'Solder Quality', specification: 'IPC Class 3', result: 'pending' },
        { id: 'cp-007', checkpoint_name: 'Component Placement', specification: '+/- 0.1mm', result: 'pending' },
      ],
      defects_found: 0,
      sample_size: 200,
      accepted_qty: 0,
      rejected_qty: 0,
      created_at: new Date().toISOString(),
    },
  ];
};

// Generate unique ID
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const QualityInspectionTool: React.FC<QualityInspectionToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use tool data hook for backend sync
  const {
    data: inspections,
    setData: setInspections,
    isLoading: loading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
  } = useToolData<QualityInspection>('quality-inspection', generateSampleData(), inspectionColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<QualityInspection | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingInspection, setEditingInspection] = useState<QualityInspection | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    inspection_number: '',
    work_order_ref: '',
    product_name: '',
    product_code: '',
    batch_number: '',
    inspection_type: 'incoming' as QualityInspection['inspection_type'],
    status: 'pending' as QualityInspection['status'],
    inspector: '',
    inspection_date: new Date().toISOString().split('T')[0],
    sample_size: 0,
    accepted_qty: 0,
    rejected_qty: 0,
    defects_found: 0,
    notes: '',
  });

  // Filter inspections
  const filteredInspections = inspections.filter(insp => {
    const matchesSearch = !searchQuery ||
      insp.inspection_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insp.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insp.batch_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || insp.status === filterStatus;
    const matchesType = !filterType || insp.inspection_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Stats
  const stats = {
    total: inspections.length,
    passed: inspections.filter(i => i.status === 'passed').length,
    failed: inspections.filter(i => i.status === 'failed').length,
    pending: inspections.filter(i => i.status === 'pending' || i.status === 'in-progress').length,
    passRate: inspections.length > 0
      ? Math.round((inspections.filter(i => i.status === 'passed').length / inspections.length) * 100)
      : 0,
    totalDefects: inspections.reduce((sum, i) => sum + i.defects_found, 0),
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingInspection) {
        updateItem(editingInspection.id, {
          ...formData,
          updated_at: new Date().toISOString(),
        });
      } else {
        const newInspection: QualityInspection = {
          id: generateId('qi'),
          ...formData,
          checkpoints: [],
          created_at: new Date().toISOString(),
        };
        addItem(newInspection);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving inspection:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      inspection_number: '',
      work_order_ref: '',
      product_name: '',
      product_code: '',
      batch_number: '',
      inspection_type: 'incoming',
      status: 'pending',
      inspector: '',
      inspection_date: new Date().toISOString().split('T')[0],
      sample_size: 0,
      accepted_qty: 0,
      rejected_qty: 0,
      defects_found: 0,
      notes: '',
    });
    setEditingInspection(null);
  };

  const openEditModal = (inspection: QualityInspection) => {
    setEditingInspection(inspection);
    setFormData({
      inspection_number: inspection.inspection_number,
      work_order_ref: inspection.work_order_ref || '',
      product_name: inspection.product_name,
      product_code: inspection.product_code,
      batch_number: inspection.batch_number,
      inspection_type: inspection.inspection_type,
      status: inspection.status,
      inspector: inspection.inspector,
      inspection_date: inspection.inspection_date,
      sample_size: inspection.sample_size,
      accepted_qty: inspection.accepted_qty,
      rejected_qty: inspection.rejected_qty,
      defects_found: inspection.defects_found,
      notes: inspection.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Inspection',
      message: 'Are you sure you want to delete this inspection?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
      if (selectedInspection?.id === id) {
        setSelectedInspection(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-500/20 text-gray-400',
      'in-progress': 'bg-blue-500/20 text-blue-400',
      passed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      'on-hold': 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[status] || colors.pending;
  };

  const getCheckpointResultColor = (result: string) => {
    const colors: Record<string, string> = {
      pass: 'text-green-400',
      fail: 'text-red-400',
      pending: 'text-gray-400',
    };
    return colors[result] || colors.pending;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${isDark ? 'bg-green-500/20' : 'bg-green-100'} rounded-xl`}>
              <ClipboardCheck className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.qualityInspection.qualityInspection', 'Quality Inspection')}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.qualityInspection.trackQualityInspectionsAndRecords', 'Track quality inspections and records')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <WidgetEmbedButton toolSlug="quality-inspection" toolName="Quality Inspection" />

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
              onExportCSV={() => exportToCSV(inspections, inspectionColumns, { filename: 'quality-inspections' })}
              onExportExcel={() => exportToExcel(inspections, inspectionColumns, { filename: 'quality-inspections' })}
              onExportJSON={() => exportToJSON(inspections, { filename: 'quality-inspections' })}
              onExportPDF={() => exportToPDF(inspections, inspectionColumns, { filename: 'quality-inspections', title: 'Quality Inspections Report' })}
              onPrint={() => printData(inspections, inspectionColumns, { title: 'Quality Inspections Report' })}
              onCopyToClipboard={() => copyUtil(inspections, inspectionColumns)}
              disabled={inspections.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.qualityInspection.newInspection', 'New Inspection')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityInspection.total', 'Total')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityInspection.passed', 'Passed')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.passed}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityInspection.failed', 'Failed')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.failed}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityInspection.pending', 'Pending')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pending}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityInspection.passRate', 'Pass Rate')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.passRate}%</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityInspection.defects', 'Defects')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalDefects}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.qualityInspection.searchInspections', 'Search inspections...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="">{t('tools.qualityInspection.allStatuses', 'All Statuses')}</option>
                {inspectionStatuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="">{t('tools.qualityInspection.allTypes', 'All Types')}</option>
                {inspectionTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inspections List */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.inspection', 'Inspection #')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.product', 'Product')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.type', 'Type')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.status', 'Status')}</th>
                      <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredInspections.map((inspection) => (
                      <tr
                        key={inspection.id}
                        className={`cursor-pointer ${selectedInspection?.id === inspection.id ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : (isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')}`}
                        onClick={() => setSelectedInspection(inspection)}
                      >
                        <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{inspection.inspection_number}</td>
                        <td className="px-4 py-3">
                          <div className={isDark ? 'text-white' : 'text-gray-900'}>{inspection.product_name}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{inspection.batch_number}</div>
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {inspectionTypes.find(t => t.value === inspection.inspection_type)?.label}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                            {inspectionStatuses.find(s => s.value === inspection.status)?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openEditModal(inspection)}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(inspection.id)}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredInspections.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          <ClipboardCheck className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.qualityInspection.noInspectionsFound', 'No inspections found')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Inspection Details Panel */}
          <div className="lg:col-span-1">
            {selectedInspection ? (
              <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm p-4 space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInspection.inspection_number}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInspection.status)}`}>
                    {inspectionStatuses.find(s => s.value === selectedInspection.status)?.label}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-medium">{t('tools.qualityInspection.product2', 'Product:')}</span> {selectedInspection.product_name}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-medium">{t('tools.qualityInspection.batch', 'Batch:')}</span> {selectedInspection.batch_number}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-medium">{t('tools.qualityInspection.inspector', 'Inspector:')}</span> {selectedInspection.inspector}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-medium">{t('tools.qualityInspection.date', 'Date:')}</span> {new Date(selectedInspection.inspection_date).toLocaleDateString()}
                  </div>
                </div>

                <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.sampleResults', 'Sample Results')}</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInspection.sample_size}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityInspection.sample', 'Sample')}</div>
                    </div>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                      <div className="text-lg font-bold text-green-500">{selectedInspection.accepted_qty}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityInspection.accepted', 'Accepted')}</div>
                    </div>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                      <div className="text-lg font-bold text-red-500">{selectedInspection.rejected_qty}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityInspection.rejected', 'Rejected')}</div>
                    </div>
                  </div>
                </div>

                {selectedInspection.checkpoints.length > 0 && (
                  <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.checkpoints', 'Checkpoints')}</h4>
                    <div className="space-y-2">
                      {selectedInspection.checkpoints.map((cp) => (
                        <div key={cp.id} className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{cp.checkpoint_name}</span>
                            <span className={`text-sm font-medium ${getCheckpointResultColor(cp.result)}`}>
                              {cp.result.toUpperCase()}
                            </span>
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Spec: {cp.specification}
                          </div>
                          {cp.actual_value && (
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Actual: {cp.actual_value}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedInspection.notes && (
                  <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.notes', 'Notes')}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedInspection.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm p-8 text-center`}>
                <ClipboardCheck className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.qualityInspection.selectAnInspectionToView', 'Select an inspection to view details')}</p>
              </div>
            )}
          </div>
        </div>

        <ConfirmDialog />

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingInspection ? t('tools.qualityInspection.editInspection', 'Edit Inspection') : t('tools.qualityInspection.newInspection2', 'New Inspection')}
                </h2>
                <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.inspection2', 'Inspection # *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.inspection_number}
                      onChange={(e) => setFormData({ ...formData, inspection_number: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder={t('tools.qualityInspection.qi2024001', 'QI-2024-001')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.workOrderRef', 'Work Order Ref')}</label>
                    <input
                      type="text"
                      value={formData.work_order_ref}
                      onChange={(e) => setFormData({ ...formData, work_order_ref: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.productName', 'Product Name *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.productCode', 'Product Code *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.product_code}
                      onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.batchNumber', 'Batch Number *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.batch_number}
                      onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.inspector2', 'Inspector *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.inspector}
                      onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.inspectionType', 'Inspection Type')}</label>
                    <select
                      value={formData.inspection_type}
                      onChange={(e) => setFormData({ ...formData, inspection_type: e.target.value as QualityInspection['inspection_type'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {inspectionTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.status2', 'Status')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as QualityInspection['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {inspectionStatuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.inspectionDate', 'Inspection Date *')}</label>
                    <input
                      type="date"
                      required
                      value={formData.inspection_date}
                      onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.sampleSize', 'Sample Size')}</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.sample_size}
                      onChange={(e) => setFormData({ ...formData, sample_size: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.acceptedQty', 'Accepted Qty')}</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.accepted_qty}
                      onChange={(e) => setFormData({ ...formData, accepted_qty: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.rejectedQty', 'Rejected Qty')}</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.rejected_qty}
                      onChange={(e) => setFormData({ ...formData, rejected_qty: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.defectsFound', 'Defects Found')}</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.defects_found}
                      onChange={(e) => setFormData({ ...formData, defects_found: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityInspection.notes2', 'Notes')}</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    {t('tools.qualityInspection.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingInspection ? t('tools.qualityInspection.update', 'Update') : t('tools.qualityInspection.create', 'Create')} Inspection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityInspectionTool;
