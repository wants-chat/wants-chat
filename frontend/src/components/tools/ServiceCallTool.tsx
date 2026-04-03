'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Phone,
  MapPin,
  Clock,
  User,
  Wrench,
  AlertCircle,
  CheckCircle,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  Truck,
  Home,
  Thermometer,
  Droplets,
  Zap,
  MessageSquare,
  DollarSign,
  FileText,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface ServiceCallToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ServiceType = 'plumbing' | 'hvac' | 'electrical' | 'appliance' | 'general';
type Priority = 'emergency' | 'high' | 'normal' | 'low';
type CallStatus = 'new' | 'scheduled' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
  createdAt: string;
}

interface ServiceCall {
  id: string;
  customerId: string;
  serviceType: ServiceType;
  priority: Priority;
  status: CallStatus;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  technicianId: string;
  estimatedDuration: number; // in minutes
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes: string;
  createdAt: string;
  completedAt: string;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  specialties: ServiceType[];
  available: boolean;
}

// Constants
const SERVICE_TYPES: { type: ServiceType; label: string; icon: React.ReactNode }[] = [
  { type: 'plumbing', label: 'Plumbing', icon: <Droplets className="w-4 h-4" /> },
  { type: 'hvac', label: 'HVAC', icon: <Thermometer className="w-4 h-4" /> },
  { type: 'electrical', label: 'Electrical', icon: <Zap className="w-4 h-4" /> },
  { type: 'appliance', label: 'Appliance', icon: <Home className="w-4 h-4" /> },
  { type: 'general', label: 'General', icon: <Wrench className="w-4 h-4" /> },
];

const PRIORITIES: { priority: Priority; label: string; color: string }[] = [
  { priority: 'emergency', label: 'Emergency', color: 'red' },
  { priority: 'high', label: 'High', color: 'orange' },
  { priority: 'normal', label: 'Normal', color: 'blue' },
  { priority: 'low', label: 'Low', color: 'gray' },
];

const STATUSES: { status: CallStatus; label: string }[] = [
  { status: 'new', label: 'New' },
  { status: 'scheduled', label: 'Scheduled' },
  { status: 'dispatched', label: 'Dispatched' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'completed', label: 'Completed' },
  { status: 'cancelled', label: 'Cancelled' },
];

const DEFAULT_TECHNICIANS: Technician[] = [
  { id: 'tech-1', name: 'John Smith', phone: '555-0101', specialties: ['plumbing', 'general'], available: true },
  { id: 'tech-2', name: 'Mike Johnson', phone: '555-0102', specialties: ['hvac'], available: true },
  { id: 'tech-3', name: 'Dave Wilson', phone: '555-0103', specialties: ['electrical', 'appliance'], available: true },
  { id: 'tech-4', name: 'Tom Brown', phone: '555-0104', specialties: ['plumbing', 'hvac', 'general'], available: false },
];

// Column configuration for exports
const SERVICE_CALL_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'serviceType', header: 'Service Type', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'scheduledTime', header: 'Scheduled Time', type: 'string' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'estimatedDuration', header: 'Est. Duration (min)', type: 'number' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'zipCode', header: 'Zip Code', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Main Component
export const ServiceCallTool: React.FC<ServiceCallToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: customers,
    addItem: addCustomerToBackend,
    updateItem: updateCustomerBackend,
    deleteItem: deleteCustomerBackend,
    isSynced: customersSynced,
    isSaving: customersSaving,
    lastSaved: customersLastSaved,
    syncError: customersSyncError,
    forceSync: forceCustomersSync,
  } = useToolData<Customer>('service-call-customers', [], CUSTOMER_COLUMNS);

  const {
    data: serviceCalls,
    addItem: addServiceCallToBackend,
    updateItem: updateServiceCallBackend,
    deleteItem: deleteServiceCallBackend,
    isSynced: serviceCallsSynced,
    isSaving: serviceCallsSaving,
    lastSaved: serviceCallsLastSaved,
    syncError: serviceCallsSyncError,
    forceSync: forceServiceCallsSync,
  } = useToolData<ServiceCall>('service-calls', [], SERVICE_CALL_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'calls' | 'customers' | 'dispatch'>('calls');
  const [showNewCallForm, setShowNewCallForm] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterServiceType, setFilterServiceType] = useState<string>('all');
  const [technicians] = useState<Technician[]>(DEFAULT_TECHNICIANS);

  // New service call form state
  const [newCall, setNewCall] = useState<Partial<ServiceCall>>({
    serviceType: 'plumbing',
    priority: 'normal',
    status: 'new',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    technicianId: '',
    estimatedDuration: 60,
    laborCost: 0,
    partsCost: 0,
    notes: '',
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // New customer form state
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });

  // Filtered service calls
  const filteredCalls = useMemo(() => {
    return serviceCalls.filter((call) => {
      const customer = customers.find((c) => c.id === call.customerId);
      const matchesSearch =
        searchTerm === '' ||
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || call.status === filterStatus;
      const matchesType = filterServiceType === 'all' || call.serviceType === filterServiceType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [serviceCalls, customers, searchTerm, filterStatus, filterServiceType]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysCalls = serviceCalls.filter((c) => c.scheduledDate === today);
    const openCalls = serviceCalls.filter((c) => !['completed', 'cancelled'].includes(c.status));
    const emergencyCalls = serviceCalls.filter((c) => c.priority === 'emergency' && c.status !== 'completed');
    const completedToday = serviceCalls.filter((c) => c.completedAt?.startsWith(today));

    return {
      todaysCalls: todaysCalls.length,
      openCalls: openCalls.length,
      emergencyCalls: emergencyCalls.length,
      completedToday: completedToday.length,
    };
  }, [serviceCalls]);

  // Add new customer
  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      setValidationMessage('Please fill in required fields (Name, Phone)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const customer: Customer = {
      id: generateId(),
      name: newCustomer.name || '',
      phone: newCustomer.phone || '',
      email: newCustomer.email || '',
      address: newCustomer.address || '',
      city: newCustomer.city || '',
      state: newCustomer.state || '',
      zipCode: newCustomer.zipCode || '',
      notes: newCustomer.notes || '',
      createdAt: new Date().toISOString(),
    };

    addCustomerToBackend(customer);
    setSelectedCustomerId(customer.id);
    setShowNewCustomerForm(false);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
    });
  };

  // Add new service call
  const addServiceCall = () => {
    if (!selectedCustomerId || !newCall.description) {
      setValidationMessage('Please select a customer and enter a description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const totalCost = (newCall.laborCost || 0) + (newCall.partsCost || 0);

    const call: ServiceCall = {
      id: generateId(),
      customerId: selectedCustomerId,
      serviceType: newCall.serviceType || 'general',
      priority: newCall.priority || 'normal',
      status: newCall.status || 'new',
      description: newCall.description || '',
      scheduledDate: newCall.scheduledDate || '',
      scheduledTime: newCall.scheduledTime || '',
      technicianId: newCall.technicianId || '',
      estimatedDuration: newCall.estimatedDuration || 60,
      laborCost: newCall.laborCost || 0,
      partsCost: newCall.partsCost || 0,
      totalCost,
      notes: newCall.notes || '',
      createdAt: new Date().toISOString(),
      completedAt: '',
    };

    addServiceCallToBackend(call);
    setShowNewCallForm(false);
    setNewCall({
      serviceType: 'plumbing',
      priority: 'normal',
      status: 'new',
      description: '',
      scheduledDate: '',
      scheduledTime: '',
      technicianId: '',
      estimatedDuration: 60,
      laborCost: 0,
      partsCost: 0,
      notes: '',
    });
    setSelectedCustomerId('');
  };

  // Update service call status
  const updateCallStatus = (callId: string, newStatus: CallStatus) => {
    const updates: Partial<ServiceCall> = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    updateServiceCallBackend(callId, updates);
  };

  // Dispatch technician
  const dispatchTechnician = (callId: string, technicianId: string) => {
    updateServiceCallBackend(callId, {
      technicianId,
      status: 'dispatched',
    });
  };

  // Delete service call
  const deleteCall = async (callId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this service call?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteServiceCallBackend(callId);
  };

  // Get priority color
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'normal':
        return 'bg-blue-500 text-white';
      case 'low':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Get status color
  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'new':
        return theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'scheduled':
        return theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700';
      case 'dispatched':
        return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return theme === 'dark' ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700';
      case 'completed':
        return theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
      case 'cancelled':
        return theme === 'dark' ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700';
      default:
        return theme === 'dark' ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  // Export handlers
  const handleExport = async (format: string) => {
    const exportData = filteredCalls.map((call) => {
      const customer = customers.find((c) => c.id === call.customerId);
      const technician = technicians.find((t) => t.id === call.technicianId);
      return {
        ...call,
        customerName: customer?.name || 'Unknown',
        technicianName: technician?.name || 'Unassigned',
      };
    });

    switch (format) {
      case 'csv':
        exportToCSV(exportData, SERVICE_CALL_COLUMNS, 'service-calls');
        break;
      case 'excel':
        await exportToExcel(exportData, SERVICE_CALL_COLUMNS, 'service-calls');
        break;
      case 'json':
        exportToJSON(exportData, 'service-calls');
        break;
      case 'pdf':
        await exportToPDF(exportData, SERVICE_CALL_COLUMNS, 'Service Calls Report');
        break;
      case 'copy':
        await copyUtil(exportData, SERVICE_CALL_COLUMNS);
        break;
      case 'print':
        printData(exportData, SERVICE_CALL_COLUMNS, 'Service Calls Report');
        break;
    }
  };

  return (
    <>
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.serviceCall.serviceCallDispatch', 'Service Call Dispatch')}
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.serviceCall.manageServiceCallsAndDispatch', 'Manage service calls and dispatch technicians')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="service-call" toolName="Service Call" />

          <SyncStatus
            isSynced={serviceCallsSynced && customersSynced}
            isSaving={serviceCallsSaving || customersSaving}
            lastSaved={serviceCallsLastSaved}
            onForceSync={() => {
              forceServiceCallsSync();
              forceCustomersSync();
            }}
          />
          <ExportDropdown onExport={handleExport} />
          <button
            onClick={() => setShowNewCallForm(true)}
            className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('tools.serviceCall.newCall', 'New Call')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.todaysCalls}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceCall.todaySCalls', 'Today\'s Calls')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.openCalls}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceCall.openCalls', 'Open Calls')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.emergencyCalls}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceCall.emergencies', 'Emergencies')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.completedToday}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceCall.completedToday', 'Completed Today')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'calls', label: 'Service Calls', icon: <Phone className="w-4 h-4" /> },
          { id: 'customers', label: 'Customers', icon: <User className="w-4 h-4" /> },
          { id: 'dispatch', label: 'Dispatch Board', icon: <Truck className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0D9488] text-white'
                : theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Service Calls Tab */}
      {activeTab === 'calls' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.serviceCall.searchCalls', 'Search calls...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.serviceCall.allStatuses', 'All Statuses')}</option>
                  {STATUSES.map((s) => (
                    <option key={s.status} value={s.status}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterServiceType}
                  onChange={(e) => setFilterServiceType(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.serviceCall.allTypes', 'All Types')}</option>
                  {SERVICE_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Service Calls List */}
          <div className="space-y-3">
            {filteredCalls.length > 0 ? (
              filteredCalls.map((call) => {
                const customer = customers.find((c) => c.id === call.customerId);
                const technician = technicians.find((t) => t.id === call.technicianId);
                const serviceType = SERVICE_TYPES.find((t) => t.type === call.serviceType);

                return (
                  <Card
                    key={call.id}
                    className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-lg ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            }`}
                          >
                            {serviceType?.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {customer?.name || 'Unknown Customer'}
                              </h3>
                              <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(call.priority)}`}>
                                {call.priority}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(call.status)}`}>
                                {STATUSES.find((s) => s.status === call.status)?.label}
                              </span>
                            </div>
                            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {call.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <MapPin className="w-3 h-3" />
                                {customer?.address}, {customer?.city}
                              </span>
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Calendar className="w-3 h-3" />
                                {formatDate(call.scheduledDate)} {call.scheduledTime}
                              </span>
                              {technician && (
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <User className="w-3 h-3" />
                                  {technician.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {call.status !== 'completed' && call.status !== 'cancelled' && (
                            <select
                              value={call.status}
                              onChange={(e) => updateCallStatus(call.id, e.target.value as CallStatus)}
                              className={`px-3 py-1.5 text-sm rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            >
                              {STATUSES.map((s) => (
                                <option key={s.status} value={s.status}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            onClick={() => deleteCall(call.id)}
                            className={`p-2 rounded-lg ${
                              theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-12 text-center">
                  <Phone className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.serviceCall.noServiceCallsFoundCreate', 'No service calls found. Create your first service call!')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span>Customers ({customers.length})</span>
                  <button
                    onClick={() => setShowNewCustomerForm(true)}
                    className="p-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCustomerId === customer.id
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <p
                        className={`font-medium ${
                          selectedCustomerId === customer.id
                            ? 'text-white'
                            : theme === 'dark'
                            ? 'text-white'
                            : 'text-gray-900'
                        }`}
                      >
                        {customer.name}
                      </p>
                      <p
                        className={`text-sm ${
                          selectedCustomerId === customer.id
                            ? 'text-white/70'
                            : theme === 'dark'
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {customer.phone}
                      </p>
                    </div>
                  ))}
                  {customers.length === 0 && (
                    <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.serviceCall.noCustomersYet', 'No customers yet.')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            {selectedCustomerId ? (
              (() => {
                const customer = customers.find((c) => c.id === selectedCustomerId);
                if (!customer) return null;
                const customerCalls = serviceCalls.filter((c) => c.customerId === selectedCustomerId);
                return (
                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                    <CardHeader>
                      <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {t('tools.serviceCall.customerDetails', 'Customer Details')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceCall.name', 'Name')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {customer.name}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceCall.phone', 'Phone')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {customer.phone}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceCall.email', 'Email')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {customer.email || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceCall.address', 'Address')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {customer.address}, {customer.city}, {customer.state} {customer.zipCode}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Service History ({customerCalls.length})
                        </h4>
                        <div className="space-y-2">
                          {customerCalls.map((call) => (
                            <div
                              key={call.id}
                              className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {call.description}
                                  </p>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {formatDate(call.scheduledDate)}
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(call.status)}`}>
                                  {STATUSES.find((s) => s.status === call.status)?.label}
                                </span>
                              </div>
                            </div>
                          ))}
                          {customerCalls.length === 0 && (
                            <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {t('tools.serviceCall.noServiceHistory', 'No service history')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()
            ) : (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-12 text-center">
                  <User className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.serviceCall.selectACustomerToView', 'Select a customer to view details')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Dispatch Board Tab */}
      {activeTab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {technicians.map((tech) => {
            const techCalls = serviceCalls.filter(
              (c) => c.technicianId === tech.id && !['completed', 'cancelled'].includes(c.status)
            );
            return (
              <Card
                key={tech.id}
                className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              >
                <CardHeader className="pb-2">
                  <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-base">{tech.name}</span>
                    <span
                      className={`w-3 h-3 rounded-full ${tech.available ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                  </CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {tech.specialties.map((s) => (
                      <span
                        key={s}
                        className={`text-xs px-2 py-0.5 rounded ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {techCalls.map((call) => {
                      const customer = customers.find((c) => c.id === call.customerId);
                      return (
                        <div
                          key={call.id}
                          className={`p-2 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {customer?.name}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {call.scheduledTime} - {call.description.substring(0, 30)}...
                          </p>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(call.status)}`}>
                            {STATUSES.find((s) => s.status === call.status)?.label}
                          </span>
                        </div>
                      );
                    })}
                    {techCalls.length === 0 && (
                      <p className={`text-center py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.serviceCall.noActiveCalls', 'No active calls')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Service Call Modal */}
      {showNewCallForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span>{t('tools.serviceCall.newServiceCall', 'New Service Call')}</span>
                <button onClick={() => setShowNewCallForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceCall.customer', 'Customer *')}
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.serviceCall.selectCustomer', 'Select Customer')}</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceCall.serviceType', 'Service Type')}
                    </label>
                    <select
                      value={newCall.serviceType}
                      onChange={(e) => setNewCall({ ...newCall, serviceType: e.target.value as ServiceType })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {SERVICE_TYPES.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceCall.priority', 'Priority')}
                    </label>
                    <select
                      value={newCall.priority}
                      onChange={(e) => setNewCall({ ...newCall, priority: e.target.value as Priority })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.priority} value={p.priority}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceCall.description', 'Description *')}
                  </label>
                  <textarea
                    value={newCall.description}
                    onChange={(e) => setNewCall({ ...newCall, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.serviceCall.describeTheIssue', 'Describe the issue...')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceCall.scheduledDate', 'Scheduled Date')}
                    </label>
                    <input
                      type="date"
                      value={newCall.scheduledDate}
                      onChange={(e) => setNewCall({ ...newCall, scheduledDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceCall.scheduledTime', 'Scheduled Time')}
                    </label>
                    <input
                      type="time"
                      value={newCall.scheduledTime}
                      onChange={(e) => setNewCall({ ...newCall, scheduledTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceCall.assignTechnician', 'Assign Technician')}
                  </label>
                  <select
                    value={newCall.technicianId}
                    onChange={(e) => setNewCall({ ...newCall, technicianId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.serviceCall.unassigned', 'Unassigned')}</option>
                    {technicians.filter((t) => t.available).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialties.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceCall.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newCall.notes}
                    onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.serviceCall.additionalNotes', 'Additional notes...')}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowNewCallForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.serviceCall.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addServiceCall}
                    className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  >
                    {t('tools.serviceCall.createServiceCall', 'Create Service Call')}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span>{t('tools.serviceCall.newCustomer', 'New Customer')}</span>
                <button onClick={() => setShowNewCustomerForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceCall.name2', 'Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceCall.phone2', 'Phone *')}
                    </label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceCall.email2', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceCall.address2', 'Address')}
                  </label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceCall.city', 'City')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.city}
                      onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceCall.state', 'State')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.state}
                      onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceCall.zipCode', 'Zip Code')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.zipCode}
                      onChange={(e) => setNewCustomer({ ...newCustomer, zipCode: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowNewCustomerForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.serviceCall.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addCustomer}
                    className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  >
                    {t('tools.serviceCall.addCustomer', 'Add Customer')}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default ServiceCallTool;
