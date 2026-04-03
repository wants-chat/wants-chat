'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Calendar,
  Camera,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Building,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface InspectionItem {
  id: string;
  name: string;
  condition: 'good' | 'fair' | 'poor' | 'not_applicable';
  notes: string;
  photos: string[];
}

interface PropertyInspection {
  id: string;
  propertyAddress: string;
  inspectionType: 'move_in' | 'move_out' | 'routine' | 'annual' | 'emergency';
  inspectionDate: string;
  inspectorName: string;
  tenantName?: string;
  tenantPresent: boolean;
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  items: InspectionItem[];
  generalNotes: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnConfig[] = [
  { key: 'propertyAddress', header: 'Property', type: 'string' },
  { key: 'inspectionType', header: 'Type', type: 'string' },
  { key: 'inspectionDate', header: 'Date', type: 'date' },
  { key: 'inspectorName', header: 'Inspector', type: 'string' },
  { key: 'overallCondition', header: 'Condition', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

const INSPECTION_TYPES = [
  { value: 'move_in', label: 'Move-In' },
  { value: 'move_out', label: 'Move-Out' },
  { value: 'routine', label: 'Routine' },
  { value: 'annual', label: 'Annual' },
  { value: 'emergency', label: 'Emergency' },
];

const INSPECTION_STATUSES = [
  { value: 'scheduled', label: 'Scheduled', color: 'text-blue-500 bg-blue-500/10' },
  { value: 'in_progress', label: 'In Progress', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'completed', label: 'Completed', color: 'text-green-500 bg-green-500/10' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-500 bg-red-500/10' },
];

const CONDITION_OPTIONS = [
  { value: 'good', label: 'Good', color: 'text-green-500', icon: CheckCircle },
  { value: 'fair', label: 'Fair', color: 'text-amber-500', icon: AlertTriangle },
  { value: 'poor', label: 'Poor', color: 'text-red-500', icon: XCircle },
  { value: 'not_applicable', label: 'N/A', color: 'text-gray-500', icon: XCircle },
];

const DEFAULT_INSPECTION_ITEMS = [
  'Living Room - Walls & Ceiling',
  'Living Room - Flooring',
  'Living Room - Windows & Blinds',
  'Living Room - Electrical Outlets',
  'Kitchen - Appliances',
  'Kitchen - Cabinets & Counters',
  'Kitchen - Sink & Faucet',
  'Kitchen - Flooring',
  'Bathroom - Toilet',
  'Bathroom - Shower/Tub',
  'Bathroom - Sink & Vanity',
  'Bathroom - Ventilation',
  'Bedroom 1 - Walls & Ceiling',
  'Bedroom 1 - Flooring',
  'Bedroom 1 - Closet',
  'HVAC System',
  'Water Heater',
  'Smoke Detectors',
  'Carbon Monoxide Detectors',
  'Exterior - Doors',
  'Exterior - Windows',
  'Exterior - Landscaping',
];

export const PropertyInspectionTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: inspections,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    forceSync,
  } = useToolData<PropertyInspection>('property-inspection', [], columns);

  const [showModal, setShowModal] = useState(false);
  const [editingInspection, setEditingInspection] = useState<PropertyInspection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [form, setForm] = useState<Partial<PropertyInspection>>({
    propertyAddress: '',
    inspectionType: 'routine',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: '',
    tenantPresent: false,
    overallCondition: 'good',
    items: DEFAULT_INSPECTION_ITEMS.map((name, idx) => ({
      id: `item-${idx}`,
      name,
      condition: 'good' as const,
      notes: '',
      photos: [],
    })),
    generalNotes: '',
    followUpRequired: false,
    status: 'scheduled',
  });

  const filteredInspections = useMemo(() => {
    return inspections.filter(insp => {
      const matchesSearch = !searchQuery ||
        insp.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insp.inspectorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || insp.status === statusFilter;
      const matchesType = typeFilter === 'all' || insp.inspectionType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [inspections, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: inspections.length,
    scheduled: inspections.filter(i => i.status === 'scheduled').length,
    completed: inspections.filter(i => i.status === 'completed').length,
    followUp: inspections.filter(i => i.followUpRequired && i.status === 'completed').length,
  }), [inspections]);

  const handleSubmit = () => {
    if (!form.propertyAddress || !form.inspectorName) return;

    const now = new Date().toISOString();
    if (editingInspection) {
      updateItem(editingInspection.id, { ...form, updatedAt: now });
    } else {
      const newInspection: PropertyInspection = {
        id: `insp-${Date.now()}`,
        propertyAddress: form.propertyAddress || '',
        inspectionType: form.inspectionType || 'routine',
        inspectionDate: form.inspectionDate || now.split('T')[0],
        inspectorName: form.inspectorName || '',
        tenantName: form.tenantName,
        tenantPresent: form.tenantPresent || false,
        overallCondition: form.overallCondition || 'good',
        items: form.items || [],
        generalNotes: form.generalNotes || '',
        followUpRequired: form.followUpRequired || false,
        followUpNotes: form.followUpNotes,
        status: form.status || 'scheduled',
        createdAt: now,
        updatedAt: now,
      };
      addItem(newInspection);
    }
    resetForm();
    setShowModal(false);
    setEditingInspection(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this inspection?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleStatusChange = (id: string, status: PropertyInspection['status']) => {
    const now = new Date().toISOString();
    updateItem(id, {
      status,
      completedAt: status === 'completed' ? now : undefined,
      updatedAt: now,
    });
  };

  const updateInspectionItem = (itemId: string, updates: Partial<InspectionItem>) => {
    setForm({
      ...form,
      items: form.items?.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    });
  };

  const resetForm = () => {
    setForm({
      propertyAddress: '',
      inspectionType: 'routine',
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectorName: '',
      tenantPresent: false,
      overallCondition: 'good',
      items: DEFAULT_INSPECTION_ITEMS.map((name, idx) => ({
        id: `item-${idx}`,
        name,
        condition: 'good' as const,
        notes: '',
        photos: [],
      })),
      generalNotes: '',
      followUpRequired: false,
      status: 'scheduled',
    });
    setExpandedItems(new Set());
  };

  const toggleItemExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <ClipboardCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.propertyInspection.propertyInspection', 'Property Inspection')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.propertyInspection.conductAndTrackPropertyInspections', 'Conduct and track property inspections')}
                  </p>
                </div>
              </div>
              <WidgetEmbedButton toolSlug="property-inspection" toolName="Property Inspection" />

              <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: isDark ? 'text-white' : 'text-gray-900' },
            { label: 'Scheduled', value: stats.scheduled, color: 'text-blue-500' },
            { label: 'Completed', value: stats.completed, color: 'text-green-500' },
            { label: 'Follow-up Needed', value: stats.followUp, color: 'text-amber-500' },
          ].map(stat => (
            <div key={stat.label} className={`${cardClass} p-4`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={cardClass}>
          <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder={t('tools.propertyInspection.searchInspections', 'Search inspections...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-10 w-64`} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.propertyInspection.allStatus', 'All Status')}</option>
                {INSPECTION_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.propertyInspection.allTypes', 'All Types')}</option>
                {INSPECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'property-inspections' })}
                onExportExcel={() => exportExcel({ filename: 'property-inspections' })}
                onExportJSON={() => exportJSON({ filename: 'property-inspections' })}
                onExportPDF={async () => { await exportPDF({ filename: 'property-inspections', title: 'Property Inspections' }); }}
                onPrint={() => print('Property Inspections')}
                onCopyToClipboard={() => copyToClipboard()}
                disabled={inspections.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={() => setShowModal(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" />
                {t('tools.propertyInspection.newInspection', 'New Inspection')}
              </button>
            </div>
          </div>
        </div>

        {/* Inspections List */}
        <div className="space-y-4">
          {filteredInspections.map(inspection => {
            const statusInfo = INSPECTION_STATUSES.find(s => s.value === inspection.status);
            const typeInfo = INSPECTION_TYPES.find(t => t.value === inspection.inspectionType);
            const itemsWithIssues = inspection.items.filter(i => i.condition === 'poor' || i.condition === 'fair').length;

            return (
              <div key={inspection.id} className={`${cardClass} p-4`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${inspection.status === 'completed' ? 'bg-green-500/10' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <ClipboardCheck className={`w-6 h-6 ${inspection.status === 'completed' ? 'text-green-500' : 'text-orange-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{inspection.propertyAddress}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{typeInfo?.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Calendar className="w-4 h-4" />
                          {new Date(inspection.inspectionDate).toLocaleDateString()}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <User className="w-4 h-4" />
                          {inspection.inspectorName}
                        </span>
                        {itemsWithIssues > 0 && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <AlertTriangle className="w-4 h-4" />
                            {itemsWithIssues} items need attention
                          </span>
                        )}
                        {inspection.followUpRequired && (
                          <span className="flex items-center gap-1 text-red-500">
                            <Clock className="w-4 h-4" />
                            {t('tools.propertyInspection.followUpRequired2', 'Follow-up required')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {inspection.status === 'scheduled' && (
                      <button onClick={() => handleStatusChange(inspection.id, 'in_progress')} className="px-3 py-1.5 text-sm rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                        {t('tools.propertyInspection.startInspection', 'Start Inspection')}
                      </button>
                    )}
                    {inspection.status === 'in_progress' && (
                      <button onClick={() => handleStatusChange(inspection.id, 'completed')} className="px-3 py-1.5 text-sm rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {t('tools.propertyInspection.complete', 'Complete')}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingInspection(inspection);
                        setForm(inspection);
                        setShowModal(true);
                      }}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    <button onClick={() => handleDelete(inspection.id)} className="p-2 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInspections.length === 0 && (
          <div className={`${cardClass} text-center py-12`}>
            <ClipboardCheck className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyInspection.noInspectionsFound', 'No inspections found')}</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.propertyInspection.scheduleYourFirstPropertyInspection', 'Schedule your first property inspection')}</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingInspection ? t('tools.propertyInspection.editInspection', 'Edit Inspection') : t('tools.propertyInspection.newPropertyInspection', 'New Property Inspection')}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingInspection(null); resetForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>{t('tools.propertyInspection.propertyAddress', 'Property Address *')}</label>
                    <input type="text" value={form.propertyAddress || ''} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.propertyInspection.inspectionType', 'Inspection Type')}</label>
                    <select value={form.inspectionType || 'routine'} onChange={(e) => setForm({ ...form, inspectionType: e.target.value as PropertyInspection['inspectionType'] })} className={inputClass}>
                      {INSPECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.propertyInspection.inspectionDate', 'Inspection Date')}</label>
                    <input type="date" value={form.inspectionDate || ''} onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.propertyInspection.inspectorName', 'Inspector Name *')}</label>
                    <input type="text" value={form.inspectorName || ''} onChange={(e) => setForm({ ...form, inspectorName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.propertyInspection.tenantName', 'Tenant Name')}</label>
                    <input type="text" value={form.tenantName || ''} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} className={inputClass} />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" checked={form.tenantPresent || false} onChange={(e) => setForm({ ...form, tenantPresent: e.target.checked })} className="w-4 h-4 text-orange-500" />
                    <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.propertyInspection.tenantPresent', 'Tenant Present')}</label>
                  </div>
                </div>

                {/* Inspection Checklist */}
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.propertyInspection.inspectionChecklist', 'Inspection Checklist')}</h3>
                  <div className="space-y-2">
                    {form.items?.map(item => (
                      <div key={item.id} className={`border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className={`flex items-center justify-between p-3 cursor-pointer ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`} onClick={() => toggleItemExpanded(item.id)}>
                          <div className="flex items-center gap-3">
                            {expandedItems.has(item.id) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {CONDITION_OPTIONS.map(opt => {
                              const Icon = opt.icon;
                              return (
                                <button
                                  key={opt.value}
                                  onClick={(e) => { e.stopPropagation(); updateInspectionItem(item.id, { condition: opt.value as InspectionItem['condition'] }); }}
                                  className={`p-2 rounded-lg transition-colors ${item.condition === opt.value ? `${opt.color} bg-current/10` : isDark ? 'text-gray-500 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'}`}
                                >
                                  <Icon className="w-4 h-4" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {expandedItems.has(item.id) && (
                          <div className={`p-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <label className={labelClass}>{t('tools.propertyInspection.notes', 'Notes')}</label>
                            <textarea
                              value={item.notes}
                              onChange={(e) => updateInspectionItem(item.id, { notes: e.target.value })}
                              rows={2}
                              placeholder={t('tools.propertyInspection.addNotesAboutThisItem', 'Add notes about this item...')}
                              className={inputClass}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* General Notes */}
                <div>
                  <label className={labelClass}>{t('tools.propertyInspection.generalNotes', 'General Notes')}</label>
                  <textarea value={form.generalNotes || ''} onChange={(e) => setForm({ ...form, generalNotes: e.target.value })} rows={3} className={inputClass} />
                </div>

                {/* Follow-up */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form.followUpRequired || false} onChange={(e) => setForm({ ...form, followUpRequired: e.target.checked })} className="w-4 h-4 text-orange-500" />
                    <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.propertyInspection.followUpRequired', 'Follow-up Required')}</label>
                  </div>
                  {form.followUpRequired && (
                    <div className="flex-1">
                      <input type="text" value={form.followUpNotes || ''} onChange={(e) => setForm({ ...form, followUpNotes: e.target.value })} placeholder={t('tools.propertyInspection.followUpNotes', 'Follow-up notes...')} className={inputClass} />
                    </div>
                  )}
                </div>

                {/* Overall Condition */}
                <div>
                  <label className={labelClass}>{t('tools.propertyInspection.overallPropertyCondition', 'Overall Property Condition')}</label>
                  <select value={form.overallCondition || 'good'} onChange={(e) => setForm({ ...form, overallCondition: e.target.value as PropertyInspection['overallCondition'] })} className={inputClass}>
                    <option value="excellent">{t('tools.propertyInspection.excellent', 'Excellent')}</option>
                    <option value="good">{t('tools.propertyInspection.good', 'Good')}</option>
                    <option value="fair">{t('tools.propertyInspection.fair', 'Fair')}</option>
                    <option value="poor">{t('tools.propertyInspection.poor', 'Poor')}</option>
                  </select>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => { setShowModal(false); setEditingInspection(null); resetForm(); }} className={buttonSecondary}>{t('tools.propertyInspection.cancel', 'Cancel')}</button>
                <button onClick={handleSubmit} disabled={!form.propertyAddress || !form.inspectorName} className={`${buttonPrimary} disabled:opacity-50`}>
                  <Save className="w-4 h-4" />
                  {editingInspection ? t('tools.propertyInspection.update', 'Update') : t('tools.propertyInspection.save', 'Save')} Inspection
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default PropertyInspectionTool;
