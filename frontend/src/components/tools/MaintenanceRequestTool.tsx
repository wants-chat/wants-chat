'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Calendar,
  Clock,
  User,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  DollarSign,
  FileText,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface MaintenanceRequest {
  id: string;
  propertyAddress: string;
  unitNumber?: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'landscaping' | 'other';
  priority: 'emergency' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  vendorName?: string;
  vendorPhone?: string;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: string;
  completedDate?: string;
  tenantAvailability?: string;
  accessInstructions?: string;
  photos: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnConfig[] = [
  { key: 'propertyAddress', header: 'Property', type: 'string' },
  { key: 'tenantName', header: 'Tenant', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'title', header: 'Issue', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'estimatedCost', header: 'Est. Cost', type: 'currency' },
  { key: 'createdAt', header: 'Submitted', type: 'date' },
];

const CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing', color: 'text-blue-500 bg-blue-500/10' },
  { value: 'electrical', label: 'Electrical', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'hvac', label: 'HVAC', color: 'text-cyan-500 bg-cyan-500/10' },
  { value: 'appliance', label: 'Appliance', color: 'text-purple-500 bg-purple-500/10' },
  { value: 'structural', label: 'Structural', color: 'text-red-500 bg-red-500/10' },
  { value: 'pest', label: 'Pest Control', color: 'text-orange-500 bg-orange-500/10' },
  { value: 'landscaping', label: 'Landscaping', color: 'text-green-500 bg-green-500/10' },
  { value: 'other', label: 'Other', color: 'text-gray-500 bg-gray-500/10' },
];

const PRIORITIES = [
  { value: 'emergency', label: 'Emergency', color: 'text-red-500 bg-red-500/10' },
  { value: 'high', label: 'High', color: 'text-orange-500 bg-orange-500/10' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'low', label: 'Low', color: 'text-blue-500 bg-blue-500/10' },
];

const STATUSES = [
  { value: 'submitted', label: 'Submitted', color: 'text-gray-500 bg-gray-500/10' },
  { value: 'assigned', label: 'Assigned', color: 'text-blue-500 bg-blue-500/10' },
  { value: 'in_progress', label: 'In Progress', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'completed', label: 'Completed', color: 'text-green-500 bg-green-500/10' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-500 bg-red-500/10' },
];

export const MaintenanceRequestTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: requests,
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
  } = useToolData<MaintenanceRequest>('maintenance-request', [], columns);

  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [form, setForm] = useState<Partial<MaintenanceRequest>>({
    propertyAddress: '',
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    category: 'other',
    priority: 'medium',
    title: '',
    description: '',
    status: 'submitted',
    photos: [],
  });

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = !searchQuery ||
        req.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || req.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    }).sort((a, b) => {
      const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [requests, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: requests.length,
    open: requests.filter(r => ['submitted', 'assigned', 'in_progress'].includes(r.status)).length,
    emergency: requests.filter(r => r.priority === 'emergency' && r.status !== 'completed').length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalCost: requests.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.actualCost || 0), 0),
  }), [requests]);

  const handleSubmit = () => {
    if (!form.propertyAddress || !form.tenantName || !form.title) return;

    const now = new Date().toISOString();
    if (editingRequest) {
      updateItem(editingRequest.id, { ...form, updatedAt: now });
    } else {
      const newRequest: MaintenanceRequest = {
        id: `mr-${Date.now()}`,
        propertyAddress: form.propertyAddress || '',
        unitNumber: form.unitNumber,
        tenantName: form.tenantName || '',
        tenantEmail: form.tenantEmail || '',
        tenantPhone: form.tenantPhone || '',
        category: form.category || 'other',
        priority: form.priority || 'medium',
        title: form.title || '',
        description: form.description || '',
        status: 'submitted',
        assignedTo: form.assignedTo,
        vendorName: form.vendorName,
        vendorPhone: form.vendorPhone,
        estimatedCost: form.estimatedCost,
        scheduledDate: form.scheduledDate,
        tenantAvailability: form.tenantAvailability,
        accessInstructions: form.accessInstructions,
        photos: form.photos || [],
        notes: form.notes,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newRequest);
    }
    resetForm();
    setShowModal(false);
    setEditingRequest(null);
  };

  const handleStatusChange = (id: string, status: MaintenanceRequest['status']) => {
    const now = new Date().toISOString();
    updateItem(id, {
      status,
      completedDate: status === 'completed' ? now : undefined,
      updatedAt: now,
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Request',
      message: 'Are you sure you want to delete this request? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const resetForm = () => {
    setForm({
      propertyAddress: '',
      tenantName: '',
      tenantEmail: '',
      tenantPhone: '',
      category: 'other',
      priority: 'medium',
      title: '',
      description: '',
      status: 'submitted',
      photos: [],
    });
  };

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                  <Wrench className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.maintenanceRequest.maintenanceRequests', 'Maintenance Requests')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.maintenanceRequest.trackAndManageTenantMaintenance', 'Track and manage tenant maintenance requests')}
                  </p>
                </div>
              </div>
              <WidgetEmbedButton toolSlug="maintenance-request" toolName="Maintenance Request" />

              <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.maintenanceRequest.totalRequests', 'Total Requests')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.maintenanceRequest.open', 'Open')}</p>
            <p className="text-2xl font-bold text-amber-500">{stats.open}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.maintenanceRequest.emergency', 'Emergency')}</p>
            <p className="text-2xl font-bold text-red-500">{stats.emergency}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.maintenanceRequest.completed', 'Completed')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.maintenanceRequest.totalCost', 'Total Cost')}</p>
            <p className="text-2xl font-bold text-orange-500">${stats.totalCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={cardClass}>
          <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder={t('tools.maintenanceRequest.searchRequests', 'Search requests...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-10 w-64`} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.maintenanceRequest.allStatus', 'All Status')}</option>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.maintenanceRequest.allPriority', 'All Priority')}</option>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.maintenanceRequest.allCategories', 'All Categories')}</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'maintenance-requests' })}
                onExportExcel={() => exportExcel({ filename: 'maintenance-requests' })}
                onExportJSON={() => exportJSON({ filename: 'maintenance-requests' })}
                onExportPDF={async () => { await exportPDF({ filename: 'maintenance-requests', title: 'Maintenance Requests' }); }}
                onPrint={() => print('Maintenance Requests')}
                onCopyToClipboard={() => copyToClipboard()}
                disabled={requests.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={() => setShowModal(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" />
                {t('tools.maintenanceRequest.newRequest', 'New Request')}
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map(request => {
            const statusInfo = STATUSES.find(s => s.value === request.status);
            const priorityInfo = PRIORITIES.find(p => p.value === request.priority);
            const categoryInfo = CATEGORIES.find(c => c.value === request.category);

            return (
              <div key={request.id} className={`${cardClass} p-4 ${request.priority === 'emergency' && request.status !== 'completed' ? 'ring-2 ring-red-500' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${priorityInfo?.color}`}>
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{request.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityInfo?.color}`}>{priorityInfo?.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryInfo?.color}`}>{categoryInfo?.label}</span>
                      </div>
                      <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{request.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Building className="w-4 h-4" />
                          {request.propertyAddress}{request.unitNumber && ` - Unit ${request.unitNumber}`}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <User className="w-4 h-4" />
                          {request.tenantName}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Calendar className="w-4 h-4" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                        {request.estimatedCost && (
                          <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <DollarSign className="w-4 h-4" />
                            Est: ${request.estimatedCost}
                          </span>
                        )}
                        {request.vendorName && (
                          <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <User className="w-4 h-4" />
                            Vendor: {request.vendorName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'submitted' && (
                      <button onClick={() => handleStatusChange(request.id, 'assigned')} className="px-3 py-1.5 text-sm rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                        {t('tools.maintenanceRequest.assign', 'Assign')}
                      </button>
                    )}
                    {request.status === 'assigned' && (
                      <button onClick={() => handleStatusChange(request.id, 'in_progress')} className="px-3 py-1.5 text-sm rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                        {t('tools.maintenanceRequest.start', 'Start')}
                      </button>
                    )}
                    {request.status === 'in_progress' && (
                      <button onClick={() => handleStatusChange(request.id, 'completed')} className="px-3 py-1.5 text-sm rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {t('tools.maintenanceRequest.complete', 'Complete')}
                      </button>
                    )}
                    <button
                      onClick={() => { setEditingRequest(request); setForm(request); setShowModal(true); }}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    <button onClick={() => handleDelete(request.id)} className="p-2 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRequests.length === 0 && (
          <div className={`${cardClass} text-center py-12`}>
            <Wrench className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.maintenanceRequest.noMaintenanceRequests', 'No maintenance requests')}</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.maintenanceRequest.createANewMaintenanceRequest', 'Create a new maintenance request')}</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingRequest ? t('tools.maintenanceRequest.editRequest', 'Edit Request') : t('tools.maintenanceRequest.newMaintenanceRequest', 'New Maintenance Request')}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingRequest(null); resetForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>{t('tools.maintenanceRequest.propertyAddress', 'Property Address *')}</label>
                    <input type="text" value={form.propertyAddress || ''} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.maintenanceRequest.unitNumber', 'Unit Number')}</label>
                    <input type="text" value={form.unitNumber || ''} onChange={(e) => setForm({ ...form, unitNumber: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.maintenanceRequest.tenantName', 'Tenant Name *')}</label>
                    <input type="text" value={form.tenantName || ''} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.maintenanceRequest.tenantEmail', 'Tenant Email')}</label>
                    <input type="email" value={form.tenantEmail || ''} onChange={(e) => setForm({ ...form, tenantEmail: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.maintenanceRequest.tenantPhone', 'Tenant Phone')}</label>
                    <input type="tel" value={form.tenantPhone || ''} onChange={(e) => setForm({ ...form, tenantPhone: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.maintenanceRequest.category', 'Category')}</label>
                    <select value={form.category || 'other'} onChange={(e) => setForm({ ...form, category: e.target.value as MaintenanceRequest['category'] })} className={inputClass}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.maintenanceRequest.priority', 'Priority')}</label>
                    <select value={form.priority || 'medium'} onChange={(e) => setForm({ ...form, priority: e.target.value as MaintenanceRequest['priority'] })} className={inputClass}>
                      {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.maintenanceRequest.issueTitle', 'Issue Title *')}</label>
                  <input type="text" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('tools.maintenanceRequest.briefDescriptionOfTheIssue', 'Brief description of the issue')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.maintenanceRequest.description', 'Description')}</label>
                  <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder={t('tools.maintenanceRequest.detailedDescriptionOfTheMaintenance', 'Detailed description of the maintenance issue')} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.maintenanceRequest.vendorName', 'Vendor Name')}</label>
                    <input type="text" value={form.vendorName || ''} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.maintenanceRequest.vendorPhone', 'Vendor Phone')}</label>
                    <input type="tel" value={form.vendorPhone || ''} onChange={(e) => setForm({ ...form, vendorPhone: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.maintenanceRequest.estimatedCost', 'Estimated Cost ($)')}</label>
                    <input type="number" value={form.estimatedCost || ''} onChange={(e) => setForm({ ...form, estimatedCost: parseFloat(e.target.value) || undefined })} min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.maintenanceRequest.scheduledDate', 'Scheduled Date')}</label>
                    <input type="date" value={form.scheduledDate || ''} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.maintenanceRequest.tenantAvailability', 'Tenant Availability')}</label>
                  <input type="text" value={form.tenantAvailability || ''} onChange={(e) => setForm({ ...form, tenantAvailability: e.target.value })} placeholder={t('tools.maintenanceRequest.eGWeekdays9am5pm', 'e.g., Weekdays 9am-5pm')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.maintenanceRequest.accessInstructions', 'Access Instructions')}</label>
                  <textarea value={form.accessInstructions || ''} onChange={(e) => setForm({ ...form, accessInstructions: e.target.value })} rows={2} placeholder={t('tools.maintenanceRequest.howToAccessTheProperty', 'How to access the property/unit')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.maintenanceRequest.notes', 'Notes')}</label>
                  <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputClass} />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => { setShowModal(false); setEditingRequest(null); resetForm(); }} className={buttonSecondary}>{t('tools.maintenanceRequest.cancel', 'Cancel')}</button>
                <button onClick={handleSubmit} disabled={!form.propertyAddress || !form.tenantName || !form.title} className={`${buttonPrimary} disabled:opacity-50`}>
                  <Save className="w-4 h-4" />
                  {editingRequest ? t('tools.maintenanceRequest.update', 'Update') : t('tools.maintenanceRequest.submit', 'Submit')} Request
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

export default MaintenanceRequestTool;
