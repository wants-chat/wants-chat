'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileCheck,
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
  Clock,
  AlertTriangle,
  FileText,
  Camera,
  Ruler,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ExportDropdown from '../ui/ExportDropdown';
import SyncStatus from '../ui/SyncStatus';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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
interface FAIMeasurement {
  id: string;
  characteristic: string;
  specification: string;
  tolerance: string;
  measured_value: string;
  result: 'pass' | 'fail' | 'pending';
  instrument_used?: string;
  notes?: string;
}

interface FirstArticleInspection {
  id: string;
  fai_number: string;
  work_order_ref: string;
  part_number: string;
  part_name: string;
  revision: string;
  drawing_number: string;
  customer?: string;
  status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'conditional';
  inspector: string;
  inspection_date: string;
  measurements: FAIMeasurement[];
  overall_result: 'pass' | 'fail' | 'pending';
  approval_signature?: string;
  approval_date?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface FirstArticleInspectionToolProps {
  uiConfig?: any;
}

// Status configurations
const faiStatuses = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'conditional', label: 'Conditional', color: 'yellow' },
];

// Column configuration for exports
const faiColumns: ColumnConfig[] = [
  { key: 'fai_number', header: 'FAI #', type: 'string' },
  { key: 'work_order_ref', header: 'Work Order', type: 'string' },
  { key: 'part_number', header: 'Part #', type: 'string' },
  { key: 'part_name', header: 'Part Name', type: 'string' },
  { key: 'revision', header: 'Rev', type: 'string' },
  { key: 'drawing_number', header: 'Drawing #', type: 'string' },
  { key: 'customer', header: 'Customer', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'inspector', header: 'Inspector', type: 'string' },
  { key: 'inspection_date', header: 'Date', type: 'date' },
  { key: 'overall_result', header: 'Result', type: 'string' },
];

// Generate sample data
const generateSampleData = (): FirstArticleInspection[] => {
  return [
    {
      id: 'fai-001',
      fai_number: 'FAI-2024-001',
      work_order_ref: 'WO-2024-0123',
      part_number: 'BRKT-5000-A',
      part_name: 'Mounting Bracket Assembly',
      revision: 'C',
      drawing_number: 'DWG-BRKT-5000',
      customer: 'Acme Industries',
      status: 'approved',
      inspector: 'John Quality',
      inspection_date: new Date().toISOString().split('T')[0],
      measurements: [
        { id: 'm-001', characteristic: 'Overall Length', specification: '150.00mm', tolerance: '+/- 0.10', measured_value: '150.02mm', result: 'pass', instrument_used: 'Caliper #CAL-001' },
        { id: 'm-002', characteristic: 'Hole Diameter', specification: '12.00mm', tolerance: '+/- 0.05', measured_value: '12.03mm', result: 'pass', instrument_used: 'Pin Gauge Set' },
        { id: 'm-003', characteristic: 'Surface Finish', specification: 'Ra 1.6 max', tolerance: 'N/A', measured_value: 'Ra 1.2', result: 'pass', instrument_used: 'Profilometer #PRO-001' },
      ],
      overall_result: 'pass',
      approval_signature: 'M. Smith',
      approval_date: new Date().toISOString().split('T')[0],
      notes: 'First production run approved',
      created_at: new Date().toISOString(),
    },
    {
      id: 'fai-002',
      fai_number: 'FAI-2024-002',
      work_order_ref: 'WO-2024-0124',
      part_number: 'SHAFT-3000-B',
      part_name: 'Drive Shaft',
      revision: 'A',
      drawing_number: 'DWG-SHAFT-3000',
      customer: 'Tech Corp',
      status: 'rejected',
      inspector: 'Sarah Inspector',
      inspection_date: new Date().toISOString().split('T')[0],
      measurements: [
        { id: 'm-004', characteristic: 'Shaft Diameter', specification: '25.00mm', tolerance: '+/- 0.02', measured_value: '25.05mm', result: 'fail', instrument_used: 'Micrometer #MIC-002', notes: 'Out of tolerance' },
        { id: 'm-005', characteristic: 'Length', specification: '200.00mm', tolerance: '+/- 0.50', measured_value: '200.15mm', result: 'pass', instrument_used: 'Caliper #CAL-002' },
      ],
      overall_result: 'fail',
      notes: 'Shaft diameter out of tolerance - rework required',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'fai-003',
      fai_number: 'FAI-2024-003',
      work_order_ref: 'WO-2024-0125',
      part_number: 'HSNG-4000-C',
      part_name: 'Motor Housing',
      revision: 'B',
      drawing_number: 'DWG-HSNG-4000',
      status: 'in-progress',
      inspector: 'Tom Checker',
      inspection_date: new Date().toISOString().split('T')[0],
      measurements: [
        { id: 'm-006', characteristic: 'Bore Diameter', specification: '80.00mm', tolerance: 'H7', measured_value: '', result: 'pending', instrument_used: 'CMM' },
      ],
      overall_result: 'pending',
      created_at: new Date().toISOString(),
    },
  ];
};

// Generate unique ID
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const FirstArticleInspectionTool: React.FC<FirstArticleInspectionToolProps> = ({ uiConfig }) => {
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
  } = useToolData<FirstArticleInspection>('first-article-inspection', generateSampleData(), faiColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFAI, setSelectedFAI] = useState<FirstArticleInspection | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [editingFAI, setEditingFAI] = useState<FirstArticleInspection | null>(null);
  const [editingMeasurement, setEditingMeasurement] = useState<FAIMeasurement | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fai_number: '',
    work_order_ref: '',
    part_number: '',
    part_name: '',
    revision: '',
    drawing_number: '',
    customer: '',
    status: 'pending' as FirstArticleInspection['status'],
    inspector: '',
    inspection_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [measurementFormData, setMeasurementFormData] = useState({
    characteristic: '',
    specification: '',
    tolerance: '',
    measured_value: '',
    result: 'pending' as FAIMeasurement['result'],
    instrument_used: '',
    notes: '',
  });

  // Filter inspections
  const filteredInspections = inspections.filter(fai => {
    const matchesSearch = !searchQuery ||
      fai.fai_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fai.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fai.part_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || fai.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: inspections.length,
    approved: inspections.filter(f => f.status === 'approved').length,
    rejected: inspections.filter(f => f.status === 'rejected').length,
    pending: inspections.filter(f => f.status === 'pending' || f.status === 'in-progress').length,
    approvalRate: inspections.length > 0
      ? Math.round((inspections.filter(f => f.status === 'approved').length / inspections.length) * 100)
      : 0,
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingFAI) {
        updateItem(editingFAI.id, {
          ...formData,
          updated_at: new Date().toISOString(),
        });
      } else {
        const newFAI: FirstArticleInspection = {
          id: generateId('fai'),
          ...formData,
          measurements: [],
          overall_result: 'pending',
          created_at: new Date().toISOString(),
        };
        addItem(newFAI);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving FAI:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle measurement submit
  const handleMeasurementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFAI) return;
    setSaving(true);

    try {
      let updatedMeasurements: FAIMeasurement[];

      if (editingMeasurement) {
        updatedMeasurements = selectedFAI.measurements.map(m =>
          m.id === editingMeasurement.id ? { ...m, ...measurementFormData } : m
        );
      } else {
        const newMeasurement: FAIMeasurement = {
          id: generateId('m'),
          ...measurementFormData,
        };
        updatedMeasurements = [...selectedFAI.measurements, newMeasurement];
      }

      // Calculate overall result
      const hasFails = updatedMeasurements.some(m => m.result === 'fail');
      const allPass = updatedMeasurements.length > 0 && updatedMeasurements.every(m => m.result === 'pass');
      const overallResult = hasFails ? 'fail' : allPass ? 'pass' : 'pending';

      updateItem(selectedFAI.id, {
        measurements: updatedMeasurements,
        overall_result: overallResult,
        status: hasFails ? 'rejected' : allPass ? 'approved' : selectedFAI.status,
        updated_at: new Date().toISOString(),
      });

      // Update selected FAI
      setSelectedFAI({
        ...selectedFAI,
        measurements: updatedMeasurements,
        overall_result: overallResult,
      });

      setShowMeasurementModal(false);
      resetMeasurementForm();
    } catch (error) {
      console.error('Error saving measurement:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fai_number: '',
      work_order_ref: '',
      part_number: '',
      part_name: '',
      revision: '',
      drawing_number: '',
      customer: '',
      status: 'pending',
      inspector: '',
      inspection_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setEditingFAI(null);
  };

  const resetMeasurementForm = () => {
    setMeasurementFormData({
      characteristic: '',
      specification: '',
      tolerance: '',
      measured_value: '',
      result: 'pending',
      instrument_used: '',
      notes: '',
    });
    setEditingMeasurement(null);
  };

  const openEditModal = (fai: FirstArticleInspection) => {
    setEditingFAI(fai);
    setFormData({
      fai_number: fai.fai_number,
      work_order_ref: fai.work_order_ref,
      part_number: fai.part_number,
      part_name: fai.part_name,
      revision: fai.revision,
      drawing_number: fai.drawing_number,
      customer: fai.customer || '',
      status: fai.status,
      inspector: fai.inspector,
      inspection_date: fai.inspection_date,
      notes: fai.notes || '',
    });
    setShowModal(true);
  };

  const openEditMeasurementModal = (measurement: FAIMeasurement) => {
    setEditingMeasurement(measurement);
    setMeasurementFormData({
      characteristic: measurement.characteristic,
      specification: measurement.specification,
      tolerance: measurement.tolerance,
      measured_value: measurement.measured_value,
      result: measurement.result,
      instrument_used: measurement.instrument_used || '',
      notes: measurement.notes || '',
    });
    setShowMeasurementModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this FAI? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
      if (selectedFAI?.id === id) {
        setSelectedFAI(null);
      }
    }
  };

  const handleDeleteMeasurement = async (measurementId: string) => {
    if (!selectedFAI) return;

    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Delete this measurement?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    const updatedMeasurements = selectedFAI.measurements.filter(m => m.id !== measurementId);
    const hasFails = updatedMeasurements.some(m => m.result === 'fail');
    const allPass = updatedMeasurements.length > 0 && updatedMeasurements.every(m => m.result === 'pass');
    const overallResult = hasFails ? 'fail' : allPass ? 'pass' : 'pending';

    updateItem(selectedFAI.id, {
      measurements: updatedMeasurements,
      overall_result: overallResult,
      updated_at: new Date().toISOString(),
    });

    setSelectedFAI({
      ...selectedFAI,
      measurements: updatedMeasurements,
      overall_result: overallResult,
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-500/20 text-gray-400',
      'in-progress': 'bg-blue-500/20 text-blue-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      conditional: 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[status] || colors.pending;
  };

  const getResultColor = (result: string) => {
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'} rounded-xl`}>
              <FileCheck className={`w-8 h-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.firstArticleInspection.firstArticleInspection', 'First Article Inspection')}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.firstArticleInspection.faiDocumentationAndTracking', 'FAI documentation and tracking')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <WidgetEmbedButton toolSlug="first-article-inspection" toolName="First Article Inspection" />

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
              onExportCSV={() => exportToCSV(inspections, faiColumns, { filename: 'first-article-inspections' })}
              onExportExcel={() => exportToExcel(inspections, faiColumns, { filename: 'first-article-inspections' })}
              onExportJSON={() => exportToJSON(inspections, { filename: 'first-article-inspections' })}
              onExportPDF={() => exportToPDF(inspections, faiColumns, { filename: 'first-article-inspections', title: 'First Article Inspection Report' })}
              onPrint={() => printData(inspections, faiColumns, { title: 'First Article Inspection Report' })}
              onCopyToClipboard={() => copyUtil(inspections, faiColumns)}
              disabled={inspections.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.firstArticleInspection.newFai', 'New FAI')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.firstArticleInspection.totalFais', 'Total FAIs')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.firstArticleInspection.approved', 'Approved')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.approved}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.firstArticleInspection.rejected', 'Rejected')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.rejected}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.firstArticleInspection.pending', 'Pending')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pending}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-5 h-5 text-purple-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.firstArticleInspection.approvalRate', 'Approval Rate')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.approvalRate}%</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.firstArticleInspection.searchFais', 'Search FAIs...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              <option value="">{t('tools.firstArticleInspection.allStatus', 'All Status')}</option>
              {faiStatuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAI List */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.fai', 'FAI #')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.part', 'Part')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.status', 'Status')}</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.result', 'Result')}</th>
                      <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredInspections.map((fai) => (
                      <tr
                        key={fai.id}
                        className={`cursor-pointer ${selectedFAI?.id === fai.id ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : (isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')}`}
                        onClick={() => setSelectedFAI(fai)}
                      >
                        <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{fai.fai_number}</td>
                        <td className="px-4 py-3">
                          <div className={isDark ? 'text-white' : 'text-gray-900'}>{fai.part_name}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{fai.part_number} Rev {fai.revision}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fai.status)}`}>
                            {faiStatuses.find(s => s.value === fai.status)?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${getResultColor(fai.overall_result)}`}>
                            {fai.overall_result.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openEditModal(fai)}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(fai.id)}
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
                          <FileCheck className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.firstArticleInspection.noFaisFound', 'No FAIs found')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FAI Details Panel */}
          <div className="lg:col-span-1">
            {selectedFAI ? (
              <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm p-4 space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedFAI.fai_number}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFAI.status)}`}>
                    {faiStatuses.find(s => s.value === selectedFAI.status)?.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    <span className="font-medium">{t('tools.firstArticleInspection.part2', 'Part:')}</span> {selectedFAI.part_name}
                  </div>
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    <span className="font-medium">{t('tools.firstArticleInspection.part3', 'Part #:')}</span> {selectedFAI.part_number} Rev {selectedFAI.revision}
                  </div>
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    <span className="font-medium">{t('tools.firstArticleInspection.drawing', 'Drawing:')}</span> {selectedFAI.drawing_number}
                  </div>
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    <span className="font-medium">{t('tools.firstArticleInspection.inspector', 'Inspector:')}</span> {selectedFAI.inspector}
                  </div>
                </div>

                <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.firstArticleInspection.measurements', 'Measurements')}</h4>
                    <button
                      onClick={() => {
                        resetMeasurementForm();
                        setShowMeasurementModal(true);
                      }}
                      className="px-2 py-1 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded"
                    >
                      {t('tools.firstArticleInspection.add', 'Add')}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedFAI.measurements.map((m) => (
                      <div key={m.id} className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{m.characteristic}</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-medium ${getResultColor(m.result)}`}>
                              {m.result.toUpperCase()}
                            </span>
                            <button
                              onClick={() => openEditMeasurementModal(m)}
                              className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Edit2 className="w-3 h-3 text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteMeasurement(m.id)}
                              className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Spec: {m.specification} {m.tolerance}
                        </div>
                        {m.measured_value && (
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Measured: {m.measured_value}
                          </div>
                        )}
                      </div>
                    ))}
                    {selectedFAI.measurements.length === 0 && (
                      <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.firstArticleInspection.noMeasurementsAddedYet', 'No measurements added yet')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm p-8 text-center`}>
                <FileCheck className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.firstArticleInspection.selectAnFaiToView', 'Select an FAI to view details')}</p>
              </div>
            )}
          </div>
        </div>

        {/* FAI Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingFAI ? t('tools.firstArticleInspection.editFai', 'Edit FAI') : t('tools.firstArticleInspection.newFai2', 'New FAI')}
                </h2>
                <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.faiNumber', 'FAI Number *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.fai_number}
                      onChange={(e) => setFormData({ ...formData, fai_number: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder={t('tools.firstArticleInspection.fai2024001', 'FAI-2024-001')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.workOrderRef', 'Work Order Ref *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.work_order_ref}
                      onChange={(e) => setFormData({ ...formData, work_order_ref: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.partNumber', 'Part Number *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.part_number}
                      onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.partName', 'Part Name *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.part_name}
                      onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.revision', 'Revision *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.revision}
                      onChange={(e) => setFormData({ ...formData, revision: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.drawingNumber', 'Drawing Number *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.drawing_number}
                      onChange={(e) => setFormData({ ...formData, drawing_number: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.customer', 'Customer')}</label>
                    <input
                      type="text"
                      value={formData.customer}
                      onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.status2', 'Status')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as FirstArticleInspection['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {faiStatuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.inspector2', 'Inspector *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.inspector}
                      onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.inspectionDate', 'Inspection Date *')}</label>
                    <input
                      type="date"
                      required
                      value={formData.inspection_date}
                      onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.notes', 'Notes')}</label>
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
                    {t('tools.firstArticleInspection.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingFAI ? t('tools.firstArticleInspection.update', 'Update') : t('tools.firstArticleInspection.create', 'Create')} FAI
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Measurement Modal */}
        {showMeasurementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-lg rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingMeasurement ? t('tools.firstArticleInspection.editMeasurement', 'Edit Measurement') : t('tools.firstArticleInspection.addMeasurement', 'Add Measurement')}
                </h2>
                <button onClick={() => setShowMeasurementModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMeasurementSubmit} className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.characteristic', 'Characteristic *')}</label>
                  <input
                    type="text"
                    required
                    value={measurementFormData.characteristic}
                    onChange={(e) => setMeasurementFormData({ ...measurementFormData, characteristic: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder={t('tools.firstArticleInspection.eGOverallLength', 'e.g., Overall Length')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.specification', 'Specification *')}</label>
                    <input
                      type="text"
                      required
                      value={measurementFormData.specification}
                      onChange={(e) => setMeasurementFormData({ ...measurementFormData, specification: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder={t('tools.firstArticleInspection.eG15000mm', 'e.g., 150.00mm')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.tolerance', 'Tolerance')}</label>
                    <input
                      type="text"
                      value={measurementFormData.tolerance}
                      onChange={(e) => setMeasurementFormData({ ...measurementFormData, tolerance: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="e.g., +/- 0.10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.measuredValue', 'Measured Value')}</label>
                    <input
                      type="text"
                      value={measurementFormData.measured_value}
                      onChange={(e) => setMeasurementFormData({ ...measurementFormData, measured_value: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.result2', 'Result')}</label>
                    <select
                      value={measurementFormData.result}
                      onChange={(e) => setMeasurementFormData({ ...measurementFormData, result: e.target.value as FAIMeasurement['result'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="pending">{t('tools.firstArticleInspection.pending2', 'Pending')}</option>
                      <option value="pass">{t('tools.firstArticleInspection.pass', 'Pass')}</option>
                      <option value="fail">{t('tools.firstArticleInspection.fail', 'Fail')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.instrumentUsed', 'Instrument Used')}</label>
                  <input
                    type="text"
                    value={measurementFormData.instrument_used}
                    onChange={(e) => setMeasurementFormData({ ...measurementFormData, instrument_used: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.firstArticleInspection.notes2', 'Notes')}</label>
                  <textarea
                    rows={2}
                    value={measurementFormData.notes}
                    onChange={(e) => setMeasurementFormData({ ...measurementFormData, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMeasurementModal(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    {t('tools.firstArticleInspection.cancel2', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingMeasurement ? t('tools.firstArticleInspection.update2', 'Update') : t('tools.firstArticleInspection.add2', 'Add')} Measurement
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

export default FirstArticleInspectionTool;
