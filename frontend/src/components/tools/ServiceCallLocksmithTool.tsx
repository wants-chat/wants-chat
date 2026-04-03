'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Key,
  MapPin,
  Phone,
  User,
  Clock,
  DollarSign,
  FileText,
  AlertTriangle,
  Wrench,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Timer,
  Navigation,
  Package,
  ClipboardList,
  RefreshCw,
  Loader2,
  Calendar,
  Home,
  Car,
  Building2,
  Lock,
  Unlock,
  PhoneCall,
  Mail,
  MessageSquare
} from 'lucide-react';

// Types
type ServiceType = 'lockout' | 'rekey' | 'install' | 'repair' | 'master_key' | 'high_security' | 'duplicate';
type PropertyType = 'residential' | 'commercial' | 'automotive' | 'industrial';
type CallStatus = 'new' | 'assigned' | 'en_route' | 'on_site' | 'completed' | 'cancelled' | 'follow_up';
type Priority = 'low' | 'normal' | 'high' | 'emergency';

interface ServiceCall {
  id: string;
  callNumber: string;
  createdAt: string;
  updatedAt: string;
  scheduledDate: string;
  scheduledTime: string;

  // Customer Info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  preferredContact: 'phone' | 'email' | 'text';

  // Service Details
  serviceType: ServiceType;
  propertyType: PropertyType;
  priority: Priority;
  description: string;

  // Location Details
  serviceAddress: string;
  accessInstructions?: string;
  gateCode?: string;

  // Assignment
  technicianId?: string;
  technicianName?: string;
  estimatedArrival?: string;

  // Status & Tracking
  status: CallStatus;
  dispatchedAt?: string;
  arrivedAt?: string;
  completedAt?: string;

  // Pricing
  estimatedCost: number;
  actualCost: number;
  laborHours: number;
  partsUsed: string[];

  // Notes
  customerNotes?: string;
  technicianNotes?: string;
  followUpRequired: boolean;
  followUpDate?: string;

  // Invoice
  invoiceNumber?: string;
  invoiced: boolean;
  paid: boolean;
  paymentMethod?: string;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  available: boolean;
  currentLocation?: string;
  specialties: ServiceType[];
}

// Service type configurations
const SERVICE_TYPES: { type: ServiceType; label: string; basePrice: number; icon: React.ReactNode }[] = [
  { type: 'lockout', label: 'Lock Out', basePrice: 75, icon: <Unlock className="w-4 h-4" /> },
  { type: 'rekey', label: 'Rekey', basePrice: 85, icon: <Key className="w-4 h-4" /> },
  { type: 'install', label: 'Lock Installation', basePrice: 150, icon: <Lock className="w-4 h-4" /> },
  { type: 'repair', label: 'Lock Repair', basePrice: 95, icon: <Wrench className="w-4 h-4" /> },
  { type: 'master_key', label: 'Master Key System', basePrice: 200, icon: <Key className="w-4 h-4" /> },
  { type: 'high_security', label: 'High Security Lock', basePrice: 300, icon: <Lock className="w-4 h-4" /> },
  { type: 'duplicate', label: 'Key Duplication', basePrice: 15, icon: <Key className="w-4 h-4" /> },
];

const PROPERTY_TYPES: { type: PropertyType; label: string; icon: React.ReactNode }[] = [
  { type: 'residential', label: 'Residential', icon: <Home className="w-4 h-4" /> },
  { type: 'commercial', label: 'Commercial', icon: <Building2 className="w-4 h-4" /> },
  { type: 'automotive', label: 'Automotive', icon: <Car className="w-4 h-4" /> },
  { type: 'industrial', label: 'Industrial', icon: <Building2 className="w-4 h-4" /> },
];

const STATUS_CONFIG: Record<CallStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  assigned: { label: 'Assigned', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  en_route: { label: 'En Route', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  on_site: { label: 'On Site', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100' },
  follow_up: { label: 'Follow Up', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  normal: { label: 'Normal', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  emergency: { label: 'Emergency', color: 'text-red-600', bgColor: 'bg-red-100' },
};

// Default technicians
const DEFAULT_TECHNICIANS: Technician[] = [
  { id: '1', name: 'John Smith', phone: '555-0101', available: true, specialties: ['lockout', 'rekey', 'install', 'repair'] },
  { id: '2', name: 'Mike Johnson', phone: '555-0102', available: true, specialties: ['master_key', 'high_security', 'install'] },
  { id: '3', name: 'Sarah Davis', phone: '555-0103', available: false, specialties: ['lockout', 'rekey', 'duplicate'] },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateCallNumber = () => `SC-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'callNumber', header: 'Call #', type: 'string' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'serviceAddress', header: 'Service Address', type: 'string' },
  { key: 'serviceType', header: 'Service Type', type: 'string' },
  { key: 'propertyType', header: 'Property Type', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
  { key: 'actualCost', header: 'Actual Cost', type: 'currency' },
  { key: 'invoiced', header: 'Invoiced', type: 'boolean' },
  { key: 'paid', header: 'Paid', type: 'boolean' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'completedAt', header: 'Completed', type: 'date' },
];

interface ServiceCallLocksmithToolProps {
  uiConfig?: UIConfig;
}

export function ServiceCallLocksmithTool({
  uiConfig }: ServiceCallLocksmithToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: serviceCalls,
    setData: setServiceCalls,
    addItem: addServiceCall,
    updateItem: updateServiceCall,
    deleteItem: deleteServiceCall,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ServiceCall>('service-call-locksmith', [], COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<'calls' | 'new' | 'schedule' | 'reports'>('calls');
  const [technicians] = useState<Technician[]>(DEFAULT_TECHNICIANS);
  const [selectedCall, setSelectedCall] = useState<ServiceCall | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  // Form state for new service call
  const [newCall, setNewCall] = useState<Partial<ServiceCall>>({
    serviceType: 'lockout',
    propertyType: 'residential',
    priority: 'normal',
    status: 'new',
    estimatedCost: 75,
    actualCost: 0,
    laborHours: 0,
    partsUsed: [],
    invoiced: false,
    paid: false,
    followUpRequired: false,
    preferredContact: 'phone',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.customerName || params.client || params.phone || params.address) {
        setNewCall({
          ...newCall,
          customerName: params.customerName || params.client || '',
          customerPhone: params.phone || '',
          customerEmail: params.email || '',
          serviceAddress: params.address || '',
          description: params.notes || '',
        });
        setActiveTab('new');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Update estimated cost when service type changes
  useEffect(() => {
    const serviceConfig = SERVICE_TYPES.find(s => s.type === newCall.serviceType);
    if (serviceConfig && !isEditing) {
      setNewCall(prev => ({
        ...prev,
        estimatedCost: serviceConfig.basePrice,
      }));
    }
  }, [newCall.serviceType]);

  // Filtered and sorted calls
  const filteredCalls = useMemo(() => {
    return serviceCalls
      .filter(call => {
        const matchesSearch = searchQuery === '' ||
          call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          call.callNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          call.customerPhone.includes(searchQuery) ||
          call.serviceAddress.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || call.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        // Emergency calls first, then by date
        if (a.priority === 'emergency' && b.priority !== 'emergency') return -1;
        if (b.priority === 'emergency' && a.priority !== 'emergency') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [serviceCalls, searchQuery, statusFilter, priorityFilter]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayCalls = serviceCalls.filter(c => new Date(c.createdAt).toDateString() === today);
    const completed = serviceCalls.filter(c => c.status === 'completed');
    const pending = serviceCalls.filter(c => ['new', 'assigned', 'en_route', 'on_site'].includes(c.status));
    const totalRevenue = completed.reduce((sum, c) => sum + c.actualCost, 0);
    const emergencyCalls = serviceCalls.filter(c => c.priority === 'emergency');

    return {
      todayCalls: todayCalls.length,
      pendingCalls: pending.length,
      completedCalls: completed.length,
      totalRevenue,
      emergencyCalls: emergencyCalls.length,
      avgCompletionTime: completed.length > 0
        ? completed.reduce((sum, c) => {
            if (c.completedAt && c.createdAt) {
              return sum + (new Date(c.completedAt).getTime() - new Date(c.createdAt).getTime());
            }
            return sum;
          }, 0) / completed.length / (1000 * 60 * 60) // hours
        : 0,
    };
  }, [serviceCalls]);

  // Create new service call
  const createServiceCall = () => {
    if (!newCall.customerName || !newCall.customerPhone || !newCall.serviceAddress) {
      setValidationMessage('Please fill in required fields: Customer Name, Phone, and Service Address');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const serviceCall: ServiceCall = {
      id: generateId(),
      callNumber: generateCallNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: newCall.customerName || '',
      customerPhone: newCall.customerPhone || '',
      customerEmail: newCall.customerEmail || '',
      customerAddress: newCall.customerAddress || '',
      preferredContact: newCall.preferredContact || 'phone',
      serviceType: newCall.serviceType || 'lockout',
      propertyType: newCall.propertyType || 'residential',
      priority: newCall.priority || 'normal',
      description: newCall.description || '',
      serviceAddress: newCall.serviceAddress || '',
      accessInstructions: newCall.accessInstructions,
      gateCode: newCall.gateCode,
      status: 'new',
      scheduledDate: newCall.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: newCall.scheduledTime || '09:00',
      estimatedCost: newCall.estimatedCost || 0,
      actualCost: 0,
      laborHours: 0,
      partsUsed: [],
      customerNotes: newCall.customerNotes,
      followUpRequired: false,
      invoiced: false,
      paid: false,
    };

    addServiceCall(serviceCall);
    resetForm();
    setActiveTab('calls');
  };

  // Reset form
  const resetForm = () => {
    setNewCall({
      serviceType: 'lockout',
      propertyType: 'residential',
      priority: 'normal',
      status: 'new',
      estimatedCost: 75,
      actualCost: 0,
      laborHours: 0,
      partsUsed: [],
      invoiced: false,
      paid: false,
      followUpRequired: false,
      preferredContact: 'phone',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
    });
    setIsEditing(false);
    setSelectedCall(null);
  };

  // Assign technician
  const assignTechnician = (callId: string, technicianId: string) => {
    const tech = technicians.find(t => t.id === technicianId);
    if (tech) {
      updateServiceCall(callId, {
        technicianId,
        technicianName: tech.name,
        status: 'assigned',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Update call status
  const updateStatus = (callId: string, status: CallStatus) => {
    const updates: Partial<ServiceCall> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'en_route') {
      updates.dispatchedAt = new Date().toISOString();
    } else if (status === 'on_site') {
      updates.arrivedAt = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    updateServiceCall(callId, updates);
  };

  // Complete call with billing
  const completeCall = (callId: string, actualCost: number, laborHours: number, partsUsed: string[]) => {
    updateServiceCall(callId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualCost,
      laborHours,
      partsUsed,
      updatedAt: new Date().toISOString(),
    });
  };

  // Card styles
  const cardClass = isDark
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const inputClass = isDark
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  return (
    <>
    <div className={`min-h-screen p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <PhoneCall className="w-6 h-6 text-blue-500" />
              {t('tools.serviceCallLocksmith.serviceCalls', 'Service Calls')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.serviceCallLocksmith.manageLocksmithServiceCallsAnd', 'Manage locksmith service calls and dispatch')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="service-call-locksmith" toolName="Service Call Locksmith" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              onExportCSV={exportCSV}
              onExportExcel={exportExcel}
              onExportJSON={exportJSON}
              onExportPDF={exportPDF}
              onCopy={copyToClipboard}
              onPrint={print}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.serviceCallLocksmith.todaySCalls', 'Today\'s Calls')}</p>
                  <p className="text-2xl font-bold">{stats.todayCalls}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.serviceCallLocksmith.pending', 'Pending')}</p>
                  <p className="text-2xl font-bold">{stats.pendingCalls}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.serviceCallLocksmith.completed', 'Completed')}</p>
                  <p className="text-2xl font-bold">{stats.completedCalls}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.serviceCallLocksmith.emergency', 'Emergency')}</p>
                  <p className="text-2xl font-bold text-red-500">{stats.emergencyCalls}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.serviceCallLocksmith.revenue', 'Revenue')}</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['calls', 'new', 'schedule', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'calls' && <ClipboardList className="w-4 h-4 inline mr-2" />}
              {tab === 'new' && <Plus className="w-4 h-4 inline mr-2" />}
              {tab === 'schedule' && <Calendar className="w-4 h-4 inline mr-2" />}
              {tab === 'reports' && <FileText className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Calls List Tab */}
        {activeTab === 'calls' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.serviceCallLocksmith.searchByNamePhoneAddress', 'Search by name, phone, address...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputClass}`}
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CallStatus | 'all')}
                className={`px-4 py-2 rounded-lg border ${inputClass}`}
              >
                <option value="all">{t('tools.serviceCallLocksmith.allStatuses', 'All Statuses')}</option>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <option key={status} value={status}>{config.label}</option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                className={`px-4 py-2 rounded-lg border ${inputClass}`}
              >
                <option value="all">{t('tools.serviceCallLocksmith.allPriorities', 'All Priorities')}</option>
                {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                  <option key={priority} value={priority}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Calls List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredCalls.length === 0 ? (
              <Card className={cardClass}>
                <CardContent className="p-12 text-center">
                  <PhoneCall className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.serviceCallLocksmith.noServiceCallsFound', 'No service calls found')}
                  </p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('tools.serviceCallLocksmith.createNewCall', 'Create New Call')}
                  </button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCalls.map(call => (
                  <Card key={call.id} className={`${cardClass} hover:shadow-lg transition-shadow`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-bold">{call.callNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${PRIORITY_CONFIG[call.priority].bgColor} ${PRIORITY_CONFIG[call.priority].color}`}>
                              {PRIORITY_CONFIG[call.priority].label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG[call.status].bgColor} ${STATUS_CONFIG[call.status].color}`}>
                              {STATUS_CONFIG[call.status].label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{call.customerName}</span>
                            <span className="text-gray-400">|</span>
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{call.customerPhone}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{call.serviceAddress}</span>
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Wrench className="w-4 h-4 text-gray-400" />
                              {SERVICE_TYPES.find(s => s.type === call.serviceType)?.label}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(call.scheduledDate)} @ {call.scheduledTime}
                            </span>
                            {call.technicianName && (
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4 text-gray-400" />
                                {call.technicianName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <p className="text-sm text-gray-400">{t('tools.serviceCallLocksmith.estCost', 'Est. Cost')}</p>
                            <p className="font-bold">{formatCurrency(call.estimatedCost)}</p>
                          </div>

                          {call.status === 'new' && (
                            <select
                              onChange={(e) => assignTechnician(call.id, e.target.value)}
                              className={`px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                              defaultValue=""
                            >
                              <option value="" disabled>{t('tools.serviceCallLocksmith.assignTech', 'Assign Tech')}</option>
                              {technicians.filter(t => t.available).map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name}</option>
                              ))}
                            </select>
                          )}

                          {call.status === 'assigned' && (
                            <button
                              onClick={() => updateStatus(call.id, 'en_route')}
                              className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
                            >
                              {t('tools.serviceCallLocksmith.dispatch', 'Dispatch')}
                            </button>
                          )}

                          {call.status === 'en_route' && (
                            <button
                              onClick={() => updateStatus(call.id, 'on_site')}
                              className="px-3 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"
                            >
                              {t('tools.serviceCallLocksmith.onSite', 'On Site')}
                            </button>
                          )}

                          {call.status === 'on_site' && (
                            <button
                              onClick={() => {
                                setSelectedCall(call);
                              }}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                            >
                              {t('tools.serviceCallLocksmith.complete', 'Complete')}
                            </button>
                          )}

                          <button
                            onClick={() => deleteServiceCall(call.id)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Call Tab */}
        {activeTab === 'new' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t('tools.serviceCallLocksmith.newServiceCall', 'New Service Call')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.serviceCallLocksmith.customerInformation', 'Customer Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.customerName', 'Customer Name *')}</label>
                    <input
                      type="text"
                      value={newCall.customerName || ''}
                      onChange={(e) => setNewCall({ ...newCall, customerName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder={t('tools.serviceCallLocksmith.johnDoe', 'John Doe')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.phoneNumber', 'Phone Number *')}</label>
                    <input
                      type="tel"
                      value={newCall.customerPhone || ''}
                      onChange={(e) => setNewCall({ ...newCall, customerPhone: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder="555-123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.email', 'Email')}</label>
                    <input
                      type="email"
                      value={newCall.customerEmail || ''}
                      onChange={(e) => setNewCall({ ...newCall, customerEmail: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder={t('tools.serviceCallLocksmith.johnExampleCom', 'john@example.com')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.preferredContact', 'Preferred Contact')}</label>
                    <select
                      value={newCall.preferredContact || 'phone'}
                      onChange={(e) => setNewCall({ ...newCall, preferredContact: e.target.value as 'phone' | 'email' | 'text' })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    >
                      <option value="phone">{t('tools.serviceCallLocksmith.phone', 'Phone')}</option>
                      <option value="email">{t('tools.serviceCallLocksmith.email2', 'Email')}</option>
                      <option value="text">{t('tools.serviceCallLocksmith.text', 'Text')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.serviceCallLocksmith.serviceDetails', 'Service Details')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.serviceAddress', 'Service Address *')}</label>
                    <input
                      type="text"
                      value={newCall.serviceAddress || ''}
                      onChange={(e) => setNewCall({ ...newCall, serviceAddress: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder={t('tools.serviceCallLocksmith.123MainStCityState', '123 Main St, City, State 12345')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.serviceType', 'Service Type')}</label>
                    <select
                      value={newCall.serviceType || 'lockout'}
                      onChange={(e) => setNewCall({ ...newCall, serviceType: e.target.value as ServiceType })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    >
                      {SERVICE_TYPES.map(service => (
                        <option key={service.type} value={service.type}>
                          {service.label} - {formatCurrency(service.basePrice)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.propertyType', 'Property Type')}</label>
                    <select
                      value={newCall.propertyType || 'residential'}
                      onChange={(e) => setNewCall({ ...newCall, propertyType: e.target.value as PropertyType })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    >
                      {PROPERTY_TYPES.map(prop => (
                        <option key={prop.type} value={prop.type}>{prop.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.priority', 'Priority')}</label>
                    <select
                      value={newCall.priority || 'normal'}
                      onChange={(e) => setNewCall({ ...newCall, priority: e.target.value as Priority })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    >
                      {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                        <option key={priority} value={priority}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.scheduledDate', 'Scheduled Date')}</label>
                    <input
                      type="date"
                      value={newCall.scheduledDate || ''}
                      onChange={(e) => setNewCall({ ...newCall, scheduledDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.scheduledTime', 'Scheduled Time')}</label>
                    <input
                      type="time"
                      value={newCall.scheduledTime || ''}
                      onChange={(e) => setNewCall({ ...newCall, scheduledTime: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* Access Information */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.serviceCallLocksmith.accessInformation', 'Access Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.gateCode', 'Gate Code')}</label>
                    <input
                      type="text"
                      value={newCall.gateCode || ''}
                      onChange={(e) => setNewCall({ ...newCall, gateCode: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder="#1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.accessInstructions', 'Access Instructions')}</label>
                    <input
                      type="text"
                      value={newCall.accessInstructions || ''}
                      onChange={(e) => setNewCall({ ...newCall, accessInstructions: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder={t('tools.serviceCallLocksmith.useSideEntrance', 'Use side entrance')}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.descriptionNotes', 'Description / Notes')}</label>
                <textarea
                  value={newCall.description || ''}
                  onChange={(e) => setNewCall({ ...newCall, description: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                  placeholder={t('tools.serviceCallLocksmith.describeTheIssue', 'Describe the issue...')}
                />
              </div>

              {/* Estimated Cost */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <span className="font-medium">{t('tools.serviceCallLocksmith.estimatedCost', 'Estimated Cost:')}</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(newCall.estimatedCost || 0)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={createServiceCall}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  {t('tools.serviceCallLocksmith.createServiceCall', 'Create Service Call')}
                </button>
                <button
                  onClick={resetForm}
                  className={`px-6 py-3 rounded-lg font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {t('tools.serviceCallLocksmith.reset', 'Reset')}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t('tools.serviceCallLocksmith.scheduleView', 'Schedule View')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceCalls
                  .filter(c => !['completed', 'cancelled'].includes(c.status))
                  .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                  .map(call => (
                    <div key={call.id} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{call.customerName}</p>
                          <p className="text-sm text-gray-400">
                            {formatDate(call.scheduledDate)} @ {call.scheduledTime}
                          </p>
                          <p className="text-sm text-gray-400">{call.serviceAddress}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs ${STATUS_CONFIG[call.status].bgColor} ${STATUS_CONFIG[call.status].color}`}>
                            {STATUS_CONFIG[call.status].label}
                          </span>
                          {call.technicianName && (
                            <p className="text-sm mt-1">{call.technicianName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('tools.serviceCallLocksmith.reportsAnalytics', 'Reports & Analytics')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-2">{t('tools.serviceCallLocksmith.totalCalls', 'Total Calls')}</h4>
                  <p className="text-3xl font-bold">{serviceCalls.length}</p>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-2">{t('tools.serviceCallLocksmith.completionRate', 'Completion Rate')}</h4>
                  <p className="text-3xl font-bold">
                    {serviceCalls.length > 0
                      ? Math.round((stats.completedCalls / serviceCalls.length) * 100)
                      : 0}%
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-2">{t('tools.serviceCallLocksmith.avgCompletionTime', 'Avg. Completion Time')}</h4>
                  <p className="text-3xl font-bold">{stats.avgCompletionTime.toFixed(1)} hrs</p>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-2">{t('tools.serviceCallLocksmith.totalRevenue', 'Total Revenue')}</h4>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-2">{t('tools.serviceCallLocksmith.avgJobValue', 'Avg. Job Value')}</h4>
                  <p className="text-3xl font-bold">
                    {formatCurrency(stats.completedCalls > 0 ? stats.totalRevenue / stats.completedCalls : 0)}
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-2">{t('tools.serviceCallLocksmith.emergencyCalls', 'Emergency Calls')}</h4>
                  <p className="text-3xl font-bold text-red-500">{stats.emergencyCalls}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Call Modal */}
        {selectedCall && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className={`${cardClass} w-full max-w-md`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Complete Service Call
                  <button onClick={() => setSelectedCall(null)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.actualCost', 'Actual Cost')}</label>
                  <input
                    type="number"
                    defaultValue={selectedCall.estimatedCost}
                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    id="actualCost"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.laborHours', 'Labor Hours')}</label>
                  <input
                    type="number"
                    step="0.5"
                    defaultValue={1}
                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    id="laborHours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.serviceCallLocksmith.partsUsedCommaSeparated', 'Parts Used (comma separated)')}</label>
                  <input
                    type="text"
                    placeholder={t('tools.serviceCallLocksmith.deadboltStrikePlate', 'Deadbolt, Strike plate')}
                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    id="partsUsed"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const actualCost = parseFloat((document.getElementById('actualCost') as HTMLInputElement).value);
                      const laborHours = parseFloat((document.getElementById('laborHours') as HTMLInputElement).value);
                      const partsUsed = (document.getElementById('partsUsed') as HTMLInputElement).value
                        .split(',')
                        .map(p => p.trim())
                        .filter(p => p);
                      completeCall(selectedCall.id, actualCost, laborHours, partsUsed);
                      setSelectedCall(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t('tools.serviceCallLocksmith.complete2', 'Complete')}
                  </button>
                  <button
                    onClick={() => setSelectedCall(null)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    {t('tools.serviceCallLocksmith.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
}

export default ServiceCallLocksmithTool;
