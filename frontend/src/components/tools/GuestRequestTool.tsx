'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  X,
  RefreshCw,
  Clock,
  Bed,
  User,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface GuestRequestToolProps {
  uiConfig?: UIConfig;
}

interface GuestRequest {
  id: string;
  roomNumber: string;
  guestName: string;
  requestType: RequestType;
  category: RequestCategory;
  description: string;
  priority: Priority;
  status: RequestStatus;
  requestedAt: string;
  assignedTo: string;
  completedAt: string;
  estimatedTime: number;
  notes: string;
  createdAt: string;
}

type RequestType = 'amenity' | 'housekeeping' | 'maintenance' | 'room-service' | 'concierge' | 'transport' | 'other';
type RequestCategory = 'towels' | 'pillows' | 'toiletries' | 'cleaning' | 'repair' | 'food' | 'info' | 'taxi' | 'other';
type Priority = 'urgent' | 'high' | 'normal' | 'low';
type RequestStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';

const REQUEST_TYPES: { value: RequestType; label: string }[] = [
  { value: 'amenity', label: 'Amenity Request' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'room-service', label: 'Room Service' },
  { value: 'concierge', label: 'Concierge' },
  { value: 'transport', label: 'Transportation' },
  { value: 'other', label: 'Other' },
];

const REQUEST_CATEGORIES: { value: RequestCategory; label: string }[] = [
  { value: 'towels', label: 'Towels' },
  { value: 'pillows', label: 'Pillows/Bedding' },
  { value: 'toiletries', label: 'Toiletries' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'repair', label: 'Repair' },
  { value: 'food', label: 'Food/Beverage' },
  { value: 'info', label: 'Information' },
  { value: 'taxi', label: 'Taxi/Transport' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'red' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'low', label: 'Low', color: 'gray' },
];

const REQUEST_STATUSES: { value: RequestStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'on-hold', label: 'On Hold', color: 'orange' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
];

const requestColumns: ColumnConfig[] = [
  { key: 'id', header: 'Request ID', type: 'string' },
  { key: 'roomNumber', header: 'Room', type: 'string' },
  { key: 'guestName', header: 'Guest', type: 'string' },
  { key: 'requestType', header: 'Type', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'requestedAt', header: 'Requested', type: 'string' },
];

const generateSampleRequests = (): GuestRequest[] => {
  const now = new Date();
  return [
    {
      id: 'REQ-001',
      roomNumber: '201',
      guestName: 'John Smith',
      requestType: 'amenity',
      category: 'towels',
      description: 'Extra towels needed',
      priority: 'normal',
      status: 'pending',
      requestedAt: now.toISOString(),
      assignedTo: '',
      completedAt: '',
      estimatedTime: 15,
      notes: '',
      createdAt: now.toISOString(),
    },
    {
      id: 'REQ-002',
      roomNumber: '305',
      guestName: 'Sarah Johnson',
      requestType: 'maintenance',
      category: 'repair',
      description: 'AC not cooling properly',
      priority: 'high',
      status: 'in-progress',
      requestedAt: new Date(now.getTime() - 3600000).toISOString(),
      assignedTo: 'Mike - Maintenance',
      completedAt: '',
      estimatedTime: 45,
      notes: 'Technician en route',
      createdAt: now.toISOString(),
    },
    {
      id: 'REQ-003',
      roomNumber: '102',
      guestName: 'Michael Brown',
      requestType: 'room-service',
      category: 'food',
      description: 'Breakfast order - Continental',
      priority: 'normal',
      status: 'completed',
      requestedAt: new Date(now.getTime() - 7200000).toISOString(),
      assignedTo: 'Room Service Team',
      completedAt: new Date(now.getTime() - 5400000).toISOString(),
      estimatedTime: 30,
      notes: 'Delivered on time',
      createdAt: now.toISOString(),
    },
  ];
};

export const GuestRequestTool: React.FC<GuestRequestToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const requestsData = useToolData<GuestRequest>(
    'guest-requests',
    generateSampleRequests(),
    requestColumns,
    { autoSave: true }
  );

  const requests = requestsData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<GuestRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | ''>('');
  const [filterType, setFilterType] = useState<RequestType | ''>('');

  const [newRequest, setNewRequest] = useState<Partial<GuestRequest>>({
    roomNumber: '',
    guestName: '',
    requestType: 'amenity',
    category: 'other',
    description: '',
    priority: 'normal',
    estimatedTime: 15,
    notes: '',
  });

  const handleAddRequest = () => {
    if (!newRequest.roomNumber || !newRequest.description) return;
    const request: GuestRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      roomNumber: newRequest.roomNumber || '',
      guestName: newRequest.guestName || '',
      requestType: newRequest.requestType as RequestType || 'other',
      category: newRequest.category as RequestCategory || 'other',
      description: newRequest.description || '',
      priority: newRequest.priority as Priority || 'normal',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      assignedTo: '',
      completedAt: '',
      estimatedTime: newRequest.estimatedTime || 15,
      notes: newRequest.notes || '',
      createdAt: new Date().toISOString(),
    };
    requestsData.addItem(request);
    setNewRequest({
      roomNumber: '',
      guestName: '',
      requestType: 'amenity',
      category: 'other',
      description: '',
      priority: 'normal',
      estimatedTime: 15,
      notes: '',
    });
    setShowForm(false);
  };

  const handleUpdateRequest = () => {
    if (!editingRequest) return;
    requestsData.updateItem(editingRequest.id, editingRequest);
    setEditingRequest(null);
  };

  const handleDeleteRequest = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Request',
      message: 'Are you sure you want to delete this request? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) requestsData.deleteItem(id);
  };

  const handleStatusChange = (id: string, status: RequestStatus) => {
    const updates: Partial<GuestRequest> = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    requestsData.updateItem(id, updates);
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset Requests',
      message: 'Are you sure you want to reset all requests to sample data? This action cannot be undone.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) requestsData.resetToDefault(generateSampleRequests());
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.roomNumber.toLowerCase().includes(q) &&
            !r.guestName.toLowerCase().includes(q) &&
            !r.description.toLowerCase().includes(q)) return false;
      }
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterType && r.requestType !== filterType) return false;
      return true;
    });
  }, [requests, searchQuery, filterStatus, filterType]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      inProgress: requests.filter(r => r.status === 'in-progress').length,
      completed: requests.filter(r => r.status === 'completed').length,
    };
  }, [requests]);

  const inputClass = `w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;
  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const getStatusColor = (status: RequestStatus) => {
    const colors: Record<string, string> = {
      pending: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      'in-progress': isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      completed: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      'on-hold': isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
      cancelled: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600',
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: Priority) => {
    const colors: Record<string, string> = {
      urgent: 'text-red-500',
      high: 'text-orange-500',
      normal: 'text-blue-500',
      low: 'text-gray-500',
    };
    return colors[priority] || colors.normal;
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderForm = (request: Partial<GuestRequest>, isEditing = false) => {
    const setData = isEditing
      ? (updates: Partial<GuestRequest>) => setEditingRequest({ ...editingRequest!, ...updates })
      : (updates: Partial<GuestRequest>) => setNewRequest({ ...newRequest, ...updates });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.guestRequest.roomNumber', 'Room Number *')}</label>
            <input type="text" value={request.roomNumber || ''} onChange={(e) => setData({ roomNumber: e.target.value })} placeholder="e.g., 201" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.guestRequest.guestName', 'Guest Name')}</label>
            <input type="text" value={request.guestName || ''} onChange={(e) => setData({ guestName: e.target.value })} placeholder={t('tools.guestRequest.guestName2', 'Guest name')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.guestRequest.requestType', 'Request Type')}</label>
            <select value={request.requestType || 'amenity'} onChange={(e) => setData({ requestType: e.target.value as RequestType })} className={inputClass}>
              {REQUEST_TYPES.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.guestRequest.category', 'Category')}</label>
            <select value={request.category || 'other'} onChange={(e) => setData({ category: e.target.value as RequestCategory })} className={inputClass}>
              {REQUEST_CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.guestRequest.priority', 'Priority')}</label>
            <select value={request.priority || 'normal'} onChange={(e) => setData({ priority: e.target.value as Priority })} className={inputClass}>
              {PRIORITIES.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.guestRequest.estTimeMin', 'Est. Time (min)')}</label>
            <input type="number" value={request.estimatedTime || 15} onChange={(e) => setData({ estimatedTime: parseInt(e.target.value) || 15 })} min="5" className={inputClass} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.guestRequest.description', 'Description *')}</label>
          <textarea value={request.description || ''} onChange={(e) => setData({ description: e.target.value })} placeholder={t('tools.guestRequest.describeTheRequest', 'Describe the request...')} rows={2} className={inputClass} />
        </div>

        {isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.guestRequest.assignedTo', 'Assigned To')}</label>
              <input type="text" value={request.assignedTo || ''} onChange={(e) => setData({ assignedTo: e.target.value })} placeholder={t('tools.guestRequest.staffName', 'Staff name')} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.guestRequest.status', 'Status')}</label>
              <select value={request.status || 'pending'} onChange={(e) => setData({ status: e.target.value as RequestStatus })} className={inputClass}>
                {REQUEST_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
              </select>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.guestRequest.notes', 'Notes')}</label>
          <input type="text" value={request.notes || ''} onChange={(e) => setData({ notes: e.target.value })} placeholder={t('tools.guestRequest.additionalNotes', 'Additional notes')} className={inputClass} />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488]/10 rounded-xl"><Bell className="w-6 h-6 text-[#0D9488]" /></div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestRequest.guestRequests', 'Guest Requests')}</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestRequest.manageGuestServiceRequests', 'Manage guest service requests')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="guest-request" toolName="Guest Request" />

              <SyncStatus isSynced={requestsData.isSynced} isSaving={requestsData.isSaving} lastSaved={requestsData.lastSaved} syncError={requestsData.syncError} onForceSync={() => requestsData.forceSync()} theme={isDark ? 'dark' : 'light'} showLabel={true} size="sm" />
              <ExportDropdown onExportCSV={() => requestsData.exportCSV({ filename: 'guest-requests' })} onExportExcel={() => requestsData.exportExcel({ filename: 'guest-requests' })} onExportJSON={() => requestsData.exportJSON({ filename: 'guest-requests' })} onExportPDF={() => requestsData.exportPDF({ filename: 'guest-requests', title: 'Guest Requests' })} onPrint={() => requestsData.print('Guest Requests')} onCopyToClipboard={() => requestsData.copyToClipboard('tab')} theme={isDark ? 'dark' : 'light'} />
              <button onClick={handleReset} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}><RefreshCw className="w-4 h-4" />{t('tools.guestRequest.reset', 'Reset')}</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestRequest.totalRequests', 'Total Requests')}</p><p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestRequest.pending', 'Pending')}</p><p className="text-2xl font-bold text-yellow-500">{stats.pending}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestRequest.inProgress', 'In Progress')}</p><p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestRequest.completed', 'Completed')}</p><p className="text-2xl font-bold text-green-500">{stats.completed}</p></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('tools.guestRequest.searchRequests', 'Search requests...')} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as RequestType | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.guestRequest.allTypes', 'All Types')}</option>
            {REQUEST_TYPES.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as RequestStatus | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.guestRequest.allStatuses', 'All Statuses')}</option>
            {REQUEST_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2"><Plus className="w-5 h-5" />{t('tools.guestRequest.newRequest', 'New Request')}</button>
        </div>

        {/* Forms */}
        {showForm && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestRequest.newRequest2', 'New Request')}</h3>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(newRequest)}
            <button onClick={handleAddRequest} disabled={!newRequest.roomNumber || !newRequest.description} className="mt-4 w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"><Plus className="w-5 h-5" />{t('tools.guestRequest.createRequest', 'Create Request')}</button>
          </div>
        )}

        {editingRequest && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestRequest.editRequest', 'Edit Request')}</h3>
              <button onClick={() => setEditingRequest(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(editingRequest, true)}
            <div className="flex gap-3 mt-4">
              <button onClick={handleUpdateRequest} className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"><Save className="w-5 h-5" />{t('tools.guestRequest.save', 'Save')}</button>
              <button onClick={() => setEditingRequest(null)} className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('tools.guestRequest.cancel', 'Cancel')}</button>
            </div>
          </div>
        )}

        {/* Request List */}
        <div className="space-y-3">
          {filteredRequests.map(request => (
            <div key={request.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Room {request.roomNumber}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(request.status)}`}>{REQUEST_STATUSES.find(s => s.value === request.status)?.label}</span>
                    <span className={`text-xs font-medium ${getPriorityColor(request.priority)}`}>{PRIORITIES.find(p => p.value === request.priority)?.label}</span>
                  </div>
                  <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{request.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2"><Bell className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{REQUEST_TYPES.find(t => t.value === request.requestType)?.label}</span></div>
                    <div className="flex items-center gap-2"><Clock className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{formatTime(request.requestedAt)}</span></div>
                    {request.assignedTo && <div className="flex items-center gap-2"><User className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{request.assignedTo}</span></div>}
                    {request.guestName && <div className="flex items-center gap-2"><User className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{request.guestName}</span></div>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {request.status === 'pending' && (<button onClick={() => handleStatusChange(request.id, 'in-progress')} className="p-2 rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20" title={t('tools.guestRequest.start', 'Start')}><Clock className="w-4 h-4" /></button>)}
                  {request.status === 'in-progress' && (<button onClick={() => handleStatusChange(request.id, 'completed')} className="p-2 rounded-lg text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20" title={t('tools.guestRequest.complete', 'Complete')}><CheckCircle className="w-4 h-4" /></button>)}
                  <button onClick={() => setEditingRequest(request)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
                  <button onClick={() => handleDeleteRequest(request.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className={`text-center py-12 ${cardClass}`}>
            <Bell className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.guestRequest.noRequestsFound', 'No requests found.')}</p>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default GuestRequestTool;
