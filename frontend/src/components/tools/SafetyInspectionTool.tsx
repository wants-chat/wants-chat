'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  Edit2,
  X,
  Camera,
  AlertCircle,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface SafetyInspectionToolProps {
  uiConfig?: UIConfig;
}

// Types
type InspectionStatus = 'pass' | 'fail' | 'partial' | 'na';
type OverallStatus = 'passed' | 'failed' | 'needs_attention' | 'pending';
type Priority = 'critical' | 'high' | 'medium' | 'low';

interface InspectionItem {
  id: string;
  category: string;
  item: string;
  status: InspectionStatus;
  notes: string;
  correctionRequired: boolean;
  correctionDueDate: string;
  correctionCompleted: boolean;
}

interface SafetyInspection {
  id: string;
  projectName: string;
  projectNumber: string;
  inspectionDate: string;
  inspectorName: string;
  inspectorTitle: string;
  superintendent: string;
  location: string;
  inspectionType: string;
  items: InspectionItem[];
  passCount: number;
  failCount: number;
  overallStatus: OverallStatus;
  priority: Priority;
  findings: string;
  recommendations: string;
  followUpDate: string;
  photos: string[];
  signatures: {
    inspector: string;
    superintendent: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Constants
const INSPECTION_TYPES = [
  'Weekly Safety Inspection',
  'Pre-Task Planning',
  'Equipment Inspection',
  'Fall Protection',
  'Scaffold Inspection',
  'Excavation/Trenching',
  'Electrical Safety',
  'Fire Prevention',
  'Housekeeping',
  'PPE Compliance',
  'Incident Investigation',
  'OSHA Compliance',
];

const SAFETY_CATEGORIES = {
  'Personal Protective Equipment': [
    'Hard hats worn properly',
    'Safety glasses/goggles in use',
    'High-visibility vests worn',
    'Steel-toed boots worn',
    'Hearing protection where required',
    'Gloves appropriate for task',
    'Fall protection harnesses inspected',
  ],
  'Housekeeping': [
    'Work areas clean and orderly',
    'Walkways clear of obstructions',
    'Materials properly stored',
    'Debris removed regularly',
    'Proper waste disposal',
    'Spill kits available',
  ],
  'Fall Protection': [
    'Guardrails in place',
    'Floor holes covered',
    'Ladders properly secured',
    'Scaffolding inspected',
    'Personal fall arrest systems used',
    'Safety nets where required',
  ],
  'Electrical Safety': [
    'GFCI protection in use',
    'Extension cords in good condition',
    'Proper lockout/tagout procedures',
    'Electrical panels accessible',
    'Temporary lighting adequate',
    'No exposed wiring',
  ],
  'Fire Prevention': [
    'Fire extinguishers accessible',
    'Hot work permits obtained',
    'Flammables properly stored',
    'Emergency exits marked',
    'No smoking compliance',
    'Fire watch assigned when needed',
  ],
  'Equipment & Tools': [
    'Tools in good condition',
    'Guards in place on equipment',
    'Pre-operation checks completed',
    'Proper training verified',
    'Maintenance logs current',
    'Safety devices functional',
  ],
  'Excavation & Trenching': [
    'Competent person on site',
    'Soil classification done',
    'Proper sloping/shoring',
    'Egress provided',
    'Spoils set back properly',
    'Utilities located and marked',
  ],
};

const STATUS_CONFIG: Record<OverallStatus, { color: string; label: string }> = {
  passed: { color: 'bg-green-100 text-green-800', label: 'Passed' },
  failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
  needs_attention: { color: 'bg-yellow-100 text-yellow-800', label: 'Needs Attention' },
  pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
};

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string }> = {
  critical: { color: 'bg-red-100 text-red-800', label: 'Critical' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  low: { color: 'bg-green-100 text-green-800', label: 'Low' },
};

const ITEM_STATUS_CONFIG: Record<InspectionStatus, { color: string; icon: any; label: string }> = {
  pass: { color: 'text-green-600', icon: CheckCircle, label: 'Pass' },
  fail: { color: 'text-red-600', icon: XCircle, label: 'Fail' },
  partial: { color: 'text-yellow-600', icon: AlertCircle, label: 'Partial' },
  na: { color: 'text-gray-400', icon: Clock, label: 'N/A' },
};

// Column configuration
const INSPECTION_COLUMNS: ColumnConfig[] = [
  { key: 'projectName', header: 'Project', type: 'string' },
  { key: 'inspectionDate', header: 'Date', type: 'date' },
  { key: 'inspectorName', header: 'Inspector', type: 'string' },
  { key: 'inspectionType', header: 'Type', type: 'string' },
  { key: 'passCount', header: 'Pass', type: 'number' },
  { key: 'failCount', header: 'Fail', type: 'number' },
  { key: 'overallStatus', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const SafetyInspectionTool: React.FC<SafetyInspectionToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const {
    data: inspections,
    addItem: addInspection,
    updateItem: updateInspection,
    deleteItem: deleteInspection,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
  } = useToolData<SafetyInspection>('safety-inspections', [], INSPECTION_COLUMNS);

  // UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingInspection, setEditingInspection] = useState<SafetyInspection | null>(null);

  // Initialize inspection items from template
  const initializeItems = (): InspectionItem[] => {
    const items: InspectionItem[] = [];
    Object.entries(SAFETY_CATEGORIES).forEach(([category, categoryItems]) => {
      categoryItems.forEach(item => {
        items.push({
          id: generateId(),
          category,
          item,
          status: 'na',
          notes: '',
          correctionRequired: false,
          correctionDueDate: '',
          correctionCompleted: false,
        });
      });
    });
    return items;
  };

  // New Inspection State
  const [newInspection, setNewInspection] = useState<Partial<SafetyInspection>>({
    projectName: '',
    projectNumber: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: '',
    inspectorTitle: '',
    superintendent: '',
    location: '',
    inspectionType: 'Weekly Safety Inspection',
    items: initializeItems(),
    passCount: 0,
    failCount: 0,
    overallStatus: 'pending',
    priority: 'medium',
    findings: '',
    recommendations: '',
    followUpDate: '',
    photos: [],
    signatures: { inspector: '', superintendent: '' },
  });

  // Calculate counts and status
  const calculateStatus = (items: InspectionItem[]): { passCount: number; failCount: number; overallStatus: OverallStatus } => {
    const passCount = items.filter(i => i.status === 'pass').length;
    const failCount = items.filter(i => i.status === 'fail').length;
    const partialCount = items.filter(i => i.status === 'partial').length;

    let overallStatus: OverallStatus = 'pending';
    if (failCount > 0) {
      overallStatus = 'failed';
    } else if (partialCount > 0) {
      overallStatus = 'needs_attention';
    } else if (passCount > 0) {
      overallStatus = 'passed';
    }

    return { passCount, failCount, overallStatus };
  };

  // Update item status
  const updateItemStatus = (inspection: Partial<SafetyInspection>, setInspection: Function, itemId: string, status: InspectionStatus) => {
    const updatedItems = (inspection.items || []).map(item =>
      item.id === itemId ? { ...item, status, correctionRequired: status === 'fail' } : item
    );
    const counts = calculateStatus(updatedItems);
    setInspection({ ...inspection, items: updatedItems, ...counts });
  };

  // Save inspection
  const handleSave = () => {
    const counts = calculateStatus(newInspection.items || []);
    const inspection: SafetyInspection = {
      id: generateId(),
      projectName: newInspection.projectName || '',
      projectNumber: newInspection.projectNumber || '',
      inspectionDate: newInspection.inspectionDate || new Date().toISOString().split('T')[0],
      inspectorName: newInspection.inspectorName || '',
      inspectorTitle: newInspection.inspectorTitle || '',
      superintendent: newInspection.superintendent || '',
      location: newInspection.location || '',
      inspectionType: newInspection.inspectionType || 'Weekly Safety Inspection',
      items: newInspection.items || [],
      passCount: counts.passCount,
      failCount: counts.failCount,
      overallStatus: counts.overallStatus,
      priority: newInspection.priority || 'medium',
      findings: newInspection.findings || '',
      recommendations: newInspection.recommendations || '',
      followUpDate: newInspection.followUpDate || '',
      photos: newInspection.photos || [],
      signatures: newInspection.signatures || { inspector: '', superintendent: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addInspection(inspection);
    setNewInspection({
      projectName: '',
      projectNumber: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectorName: '',
      inspectorTitle: '',
      superintendent: '',
      location: '',
      inspectionType: 'Weekly Safety Inspection',
      items: initializeItems(),
      passCount: 0,
      failCount: 0,
      overallStatus: 'pending',
      priority: 'medium',
      findings: '',
      recommendations: '',
    });
    setActiveTab('list');
  };

  // Update inspection
  const handleUpdate = () => {
    if (!editingInspection) return;
    const counts = calculateStatus(editingInspection.items || []);
    updateInspection(editingInspection.id, {
      ...editingInspection,
      ...counts,
      updatedAt: new Date().toISOString(),
    });
    setEditingInspection(null);
    setActiveTab('list');
  };

  // Filter inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      const matchesSearch =
        inspection.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.inspectorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || inspection.overallStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [inspections, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    totalInspections: inspections.length,
    passedCount: inspections.filter(i => i.overallStatus === 'passed').length,
    failedCount: inspections.filter(i => i.overallStatus === 'failed').length,
    pendingCorrections: inspections.reduce((sum, i) =>
      sum + i.items.filter(item => item.correctionRequired && !item.correctionCompleted).length, 0
    ),
  }), [inspections]);

  // Handle export
  const handleExport = async (format: string) => {
    switch (format) {
      case 'csv': exportCSV({ filename: 'safety-inspections' }); break;
      case 'excel': exportExcel({ filename: 'safety-inspections' }); break;
      case 'json': exportJSON({ filename: 'safety-inspections' }); break;
      case 'pdf': await exportPDF({ filename: 'safety-inspections', title: 'Safety Inspections' }); break;
    }
  };

  // Group items by category
  const groupItemsByCategory = (items: InspectionItem[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, InspectionItem[]>);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('tools.safetyInspection.safetyInspection', 'Safety Inspection')}</h1>
            <p className="text-gray-500">{t('tools.safetyInspection.jobSiteSafetyInspectionChecklists', 'Job site safety inspection checklists')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="safety-inspection" toolName="Safety Inspection" />

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
              <p className="text-sm text-gray-500">{t('tools.safetyInspection.totalInspections', 'Total Inspections')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalInspections}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.safetyInspection.passed', 'Passed')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.passedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.safetyInspection.failed', 'Failed')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.failedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.safetyInspection.pendingCorrections', 'Pending Corrections')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingCorrections}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'list' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('tools.safetyInspection.allInspections', 'All Inspections')}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'create' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('tools.safetyInspection.newInspection', 'New Inspection')}
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
                placeholder={t('tools.safetyInspection.searchInspections', 'Search inspections...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">{t('tools.safetyInspection.allStatus', 'All Status')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {filteredInspections.map(inspection => (
              <div key={inspection.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === inspection.id ? null : inspection.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{inspection.projectName}</h3>
                        <p className="text-sm text-gray-500">{inspection.inspectionType} - {formatDate(inspection.inspectionDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          {inspection.passCount}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          {inspection.failCount}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[inspection.overallStatus].color}`}>
                        {STATUS_CONFIG[inspection.overallStatus].label}
                      </span>
                      {expandedId === inspection.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === inspection.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.safetyInspection.inspector', 'Inspector')}</p>
                        <p className="font-medium">{inspection.inspectorName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.safetyInspection.location', 'Location')}</p>
                        <p className="font-medium">{inspection.location || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.safetyInspection.priority', 'Priority')}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[inspection.priority].color}`}>
                          {PRIORITY_CONFIG[inspection.priority].label}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.safetyInspection.followUp', 'Follow Up')}</p>
                        <p className="font-medium">{formatDate(inspection.followUpDate) || '-'}</p>
                      </div>
                    </div>

                    {inspection.findings && (
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.safetyInspection.findings', 'Findings')}</p>
                        <p className="text-sm text-gray-700">{inspection.findings}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingInspection(inspection);
                          setActiveTab('edit');
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('tools.safetyInspection.edit', 'Edit')}
                      </button>
                      <button
                        onClick={() => deleteInspection(inspection.id)}
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

            {filteredInspections.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">{t('tools.safetyInspection.noInspectionsFound', 'No inspections found')}</h3>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {t('tools.safetyInspection.createInspection', 'Create Inspection')}
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
              {activeTab === 'create' ? t('tools.safetyInspection.newSafetyInspection', 'New Safety Inspection') : t('tools.safetyInspection.editInspection', 'Edit Inspection')}
            </h2>
            <button
              onClick={() => { setActiveTab('list'); setEditingInspection(null); }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.safetyInspection.projectName', 'Project Name')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingInspection?.projectName : newInspection.projectName}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingInspection({ ...editingInspection!, projectName: e.target.value })
                    : setNewInspection({ ...newInspection, projectName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.safetyInspection.inspectionDate', 'Inspection Date')}</label>
              <input
                type="date"
                value={activeTab === 'edit' ? editingInspection?.inspectionDate : newInspection.inspectionDate}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingInspection({ ...editingInspection!, inspectionDate: e.target.value })
                    : setNewInspection({ ...newInspection, inspectionDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.safetyInspection.inspectionType', 'Inspection Type')}</label>
              <select
                value={activeTab === 'edit' ? editingInspection?.inspectionType : newInspection.inspectionType}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingInspection({ ...editingInspection!, inspectionType: e.target.value })
                    : setNewInspection({ ...newInspection, inspectionType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {INSPECTION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.safetyInspection.inspectorName', 'Inspector Name')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingInspection?.inspectorName : newInspection.inspectorName}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingInspection({ ...editingInspection!, inspectorName: e.target.value })
                    : setNewInspection({ ...newInspection, inspectorName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.safetyInspection.location2', 'Location')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingInspection?.location : newInspection.location}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingInspection({ ...editingInspection!, location: e.target.value })
                    : setNewInspection({ ...newInspection, location: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.safetyInspection.priority2', 'Priority')}</label>
              <select
                value={activeTab === 'edit' ? editingInspection?.priority : newInspection.priority}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingInspection({ ...editingInspection!, priority: e.target.value as Priority })
                    : setNewInspection({ ...newInspection, priority: e.target.value as Priority })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-900">{t('tools.safetyInspection.safetyChecklist', 'Safety Checklist')}</h3>
            {Object.entries(groupItemsByCategory(activeTab === 'edit' ? editingInspection?.items || [] : newInspection.items || [])).map(([category, items]) => (
              <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-medium text-gray-700">{category}</div>
                <div className="divide-y divide-gray-100">
                  {items.map(item => {
                    const StatusIcon = ITEM_STATUS_CONFIG[item.status].icon;
                    return (
                      <div key={item.id} className="p-3 flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.item}</span>
                        <div className="flex items-center gap-2">
                          {(['pass', 'fail', 'partial', 'na'] as InspectionStatus[]).map(status => {
                            const config = ITEM_STATUS_CONFIG[status];
                            const Icon = config.icon;
                            return (
                              <button
                                key={status}
                                onClick={() => updateItemStatus(
                                  activeTab === 'edit' ? editingInspection! : newInspection,
                                  activeTab === 'edit' ? setEditingInspection : setNewInspection,
                                  item.id,
                                  status
                                )}
                                className={`p-1.5 rounded-full transition-colors ${
                                  item.status === status
                                    ? `${config.color} bg-gray-100`
                                    : 'text-gray-300 hover:text-gray-400'
                                }`}
                                title={config.label}
                              >
                                <Icon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Findings and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.safetyInspection.findings2', 'Findings')}</label>
              <textarea
                value={activeTab === 'edit' ? editingInspection?.findings : newInspection.findings}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingInspection({ ...editingInspection!, findings: e.target.value })
                    : setNewInspection({ ...newInspection, findings: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={t('tools.safetyInspection.documentAnySafetyConcernsOr', 'Document any safety concerns or violations...')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.safetyInspection.recommendations', 'Recommendations')}</label>
              <textarea
                value={activeTab === 'edit' ? editingInspection?.recommendations : newInspection.recommendations}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingInspection({ ...editingInspection!, recommendations: e.target.value })
                    : setNewInspection({ ...newInspection, recommendations: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={t('tools.safetyInspection.correctiveActionsRecommended', 'Corrective actions recommended...')}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">{activeTab === 'edit' ? editingInspection?.passCount : newInspection.passCount || 0} Pass</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium">{activeTab === 'edit' ? editingInspection?.failCount : newInspection.failCount || 0} Fail</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[activeTab === 'edit' ? editingInspection?.overallStatus || 'pending' : newInspection.overallStatus || 'pending'].color}`}>
              {STATUS_CONFIG[activeTab === 'edit' ? editingInspection?.overallStatus || 'pending' : newInspection.overallStatus || 'pending'].label}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setActiveTab('list'); setEditingInspection(null); }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t('tools.safetyInspection.cancel', 'Cancel')}
            </button>
            <button
              onClick={activeTab === 'edit' ? handleUpdate : handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <Save className="w-4 h-4" />
              {activeTab === 'edit' ? t('tools.safetyInspection.update', 'Update') : t('tools.safetyInspection.save', 'Save')} Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyInspectionTool;
