'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Truck,
  MapPin,
  Phone,
  Clock,
  User,
  Car,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Navigation,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Zap,
  Timer,
  Settings,
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

interface TowDispatchToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type DispatchStatus = 'pending' | 'dispatched' | 'en_route' | 'on_scene' | 'towing' | 'completed' | 'cancelled';
type TowType = 'flatbed' | 'wheel_lift' | 'integrated' | 'rotator' | 'motorcycle';
type ServiceType = 'tow' | 'jumpstart' | 'lockout' | 'tire_change' | 'fuel_delivery' | 'winch_out';
type Priority = 'normal' | 'urgent' | 'emergency';

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  truckId: string;
  status: 'available' | 'on_call' | 'off_duty' | 'busy';
  currentLocation?: string;
}

interface TowTruck {
  id: string;
  unitNumber: string;
  type: TowType;
  licensePlate: string;
  capacity: number;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  currentMileage: number;
}

interface DispatchCall {
  id: string;
  callNumber: string;
  callerName: string;
  callerPhone: string;
  serviceType: ServiceType;
  priority: Priority;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehicleLicensePlate: string;
  vehicleVin?: string;
  driverId?: string;
  truckId?: string;
  status: DispatchStatus;
  notes: string;
  estimatedArrival?: string;
  dispatchedAt?: string;
  completedAt?: string;
  mileage?: number;
  price?: number;
  paymentMethod?: string;
  createdAt: string;
}

// Constants
const SERVICE_TYPES: { type: ServiceType; label: string; icon: React.ReactNode }[] = [
  { type: 'tow', label: 'Tow', icon: <Truck className="w-4 h-4" /> },
  { type: 'jumpstart', label: 'Jump Start', icon: <Zap className="w-4 h-4" /> },
  { type: 'lockout', label: 'Lockout', icon: <Car className="w-4 h-4" /> },
  { type: 'tire_change', label: 'Tire Change', icon: <Settings className="w-4 h-4" /> },
  { type: 'fuel_delivery', label: 'Fuel Delivery', icon: <Car className="w-4 h-4" /> },
  { type: 'winch_out', label: 'Winch Out', icon: <Truck className="w-4 h-4" /> },
];

const TOW_TYPES: { type: TowType; label: string }[] = [
  { type: 'flatbed', label: 'Flatbed' },
  { type: 'wheel_lift', label: 'Wheel Lift' },
  { type: 'integrated', label: 'Integrated' },
  { type: 'rotator', label: 'Heavy Duty Rotator' },
  { type: 'motorcycle', label: 'Motorcycle Carrier' },
];

const PRIORITIES: { priority: Priority; label: string; color: string }[] = [
  { priority: 'normal', label: 'Normal', color: 'bg-blue-500' },
  { priority: 'urgent', label: 'Urgent', color: 'bg-yellow-500' },
  { priority: 'emergency', label: 'Emergency', color: 'bg-red-500' },
];

const DISPATCH_STATUSES: { status: DispatchStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Pending', color: 'bg-gray-500' },
  { status: 'dispatched', label: 'Dispatched', color: 'bg-blue-500' },
  { status: 'en_route', label: 'En Route', color: 'bg-purple-500' },
  { status: 'on_scene', label: 'On Scene', color: 'bg-orange-500' },
  { status: 'towing', label: 'Towing', color: 'bg-yellow-500' },
  { status: 'completed', label: 'Completed', color: 'bg-green-500' },
  { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

// Column configuration for exports
const DISPATCH_COLUMNS: ColumnConfig[] = [
  { key: 'callNumber', header: 'Call #', type: 'string' },
  { key: 'callerName', header: 'Caller', type: 'string' },
  { key: 'callerPhone', header: 'Phone', type: 'string' },
  { key: 'serviceType', header: 'Service', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'pickupLocation', header: 'Pickup', type: 'string' },
  { key: 'dropoffLocation', header: 'Dropoff', type: 'string' },
  { key: 'vehicleMake', header: 'Make', type: 'string' },
  { key: 'vehicleModel', header: 'Model', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const DRIVER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'licenseNumber', header: 'License #', type: 'string' },
  { key: 'truckId', header: 'Truck ID', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

const TRUCK_COLUMNS: ColumnConfig[] = [
  { key: 'unitNumber', header: 'Unit #', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'licensePlate', header: 'License Plate', type: 'string' },
  { key: 'capacity', header: 'Capacity (lbs)', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'currentMileage', header: 'Mileage', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateCallNumber = () => `TOW-${Date.now().toString().slice(-6)}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Default data
const DEFAULT_DRIVERS: Driver[] = [
  { id: 'd1', name: 'John Smith', phone: '(555) 123-4567', licenseNumber: 'DL123456', truckId: 't1', status: 'available' },
  { id: 'd2', name: 'Mike Johnson', phone: '(555) 234-5678', licenseNumber: 'DL234567', truckId: 't2', status: 'available' },
  { id: 'd3', name: 'Dave Wilson', phone: '(555) 345-6789', licenseNumber: 'DL345678', truckId: 't3', status: 'on_call' },
];

const DEFAULT_TRUCKS: TowTruck[] = [
  { id: 't1', unitNumber: 'TT-001', type: 'flatbed', licensePlate: 'TOW-1234', capacity: 10000, status: 'available', currentMileage: 45230 },
  { id: 't2', unitNumber: 'TT-002', type: 'wheel_lift', licensePlate: 'TOW-2345', capacity: 6000, status: 'available', currentMileage: 38450 },
  { id: 't3', unitNumber: 'TT-003', type: 'integrated', licensePlate: 'TOW-3456', capacity: 12000, status: 'in_use', currentMileage: 52100 },
];

// Main Component
export const TowDispatchTool: React.FC<TowDispatchToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: dispatches,
    addItem: addDispatchToBackend,
    updateItem: updateDispatchBackend,
    deleteItem: deleteDispatchBackend,
    isSynced: dispatchesSynced,
    isSaving: dispatchesSaving,
    lastSaved: dispatchesLastSaved,
    syncError: dispatchesSyncError,
    forceSync: forceDispatchesSync,
  } = useToolData<DispatchCall>('tow-dispatches', [], DISPATCH_COLUMNS);

  const {
    data: drivers,
    addItem: addDriverToBackend,
    updateItem: updateDriverBackend,
    deleteItem: deleteDriverBackend,
    isSynced: driversSynced,
  } = useToolData<Driver>('tow-drivers', DEFAULT_DRIVERS, DRIVER_COLUMNS);

  const {
    data: trucks,
    addItem: addTruckToBackend,
    updateItem: updateTruckBackend,
    deleteItem: deleteTruckBackend,
    isSynced: trucksSynced,
  } = useToolData<TowTruck>('tow-trucks', DEFAULT_TRUCKS, TRUCK_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'dispatch' | 'active' | 'drivers' | 'trucks' | 'history'>('dispatch');
  const [showNewCallForm, setShowNewCallForm] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchCall | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);

  // New call form state
  const [newCall, setNewCall] = useState<Partial<DispatchCall>>({
    callerName: '',
    callerPhone: '',
    serviceType: 'tow',
    priority: 'normal',
    pickupLocation: '',
    dropoffLocation: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehicleLicensePlate: '',
    notes: '',
  });

  // Calculate stats
  const stats = useMemo(() => {
    const activeDispatches = dispatches.filter(d => !['completed', 'cancelled'].includes(d.status));
    const todayDispatches = dispatches.filter(d => {
      const today = new Date().toDateString();
      return new Date(d.createdAt).toDateString() === today;
    });
    const completedToday = todayDispatches.filter(d => d.status === 'completed');
    const totalRevenue = completedToday.reduce((sum, d) => sum + (d.price || 0), 0);
    const availableDrivers = drivers.filter(d => d.status === 'available').length;
    const availableTrucks = trucks.filter(t => t.status === 'available').length;

    return {
      activeCount: activeDispatches.length,
      todayCount: todayDispatches.length,
      completedToday: completedToday.length,
      totalRevenue,
      availableDrivers,
      availableTrucks,
    };
  }, [dispatches, drivers, trucks]);

  // Filter dispatches
  const filteredDispatches = useMemo(() => {
    return dispatches.filter(d => {
      const matchesSearch =
        d.callNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.callerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.vehicleLicensePlate.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || d.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [dispatches, searchTerm, filterStatus, filterPriority]);

  // Active dispatches (not completed or cancelled)
  const activeDispatches = useMemo(() => {
    return dispatches.filter(d => !['completed', 'cancelled'].includes(d.status));
  }, [dispatches]);

  // Create new dispatch call
  const createDispatch = () => {
    if (!newCall.callerName || !newCall.callerPhone || !newCall.pickupLocation) {
      setValidationMessage('Please fill in required fields (Caller Name, Phone, Pickup Location)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const dispatch: DispatchCall = {
      id: generateId(),
      callNumber: generateCallNumber(),
      callerName: newCall.callerName || '',
      callerPhone: newCall.callerPhone || '',
      serviceType: newCall.serviceType || 'tow',
      priority: newCall.priority || 'normal',
      pickupLocation: newCall.pickupLocation || '',
      dropoffLocation: newCall.dropoffLocation || '',
      vehicleMake: newCall.vehicleMake || '',
      vehicleModel: newCall.vehicleModel || '',
      vehicleYear: newCall.vehicleYear || '',
      vehicleColor: newCall.vehicleColor || '',
      vehicleLicensePlate: newCall.vehicleLicensePlate || '',
      notes: newCall.notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    addDispatchToBackend(dispatch);
    setNewCall({
      callerName: '',
      callerPhone: '',
      serviceType: 'tow',
      priority: 'normal',
      pickupLocation: '',
      dropoffLocation: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      vehicleLicensePlate: '',
      notes: '',
    });
    setShowNewCallForm(false);
  };

  // Assign driver and truck to dispatch
  const assignDispatch = (dispatchId: string, driverId: string, truckId: string) => {
    updateDispatchBackend(dispatchId, {
      driverId,
      truckId,
      status: 'dispatched',
      dispatchedAt: new Date().toISOString(),
    });
    updateDriverBackend(driverId, { status: 'busy' });
    updateTruckBackend(truckId, { status: 'in_use' });
  };

  // Update dispatch status
  const updateStatus = (dispatchId: string, status: DispatchStatus) => {
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (!dispatch) return;

    const updates: Partial<DispatchCall> = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
      // Free up driver and truck
      if (dispatch.driverId) {
        updateDriverBackend(dispatch.driverId, { status: 'available' });
      }
      if (dispatch.truckId) {
        updateTruckBackend(dispatch.truckId, { status: 'available' });
      }
    }
    updateDispatchBackend(dispatchId, updates);
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const exportData = filteredDispatches.map(d => ({
      ...d,
      driverName: drivers.find(dr => dr.id === d.driverId)?.name || '',
      truckNumber: trucks.find(t => t.id === d.truckId)?.unitNumber || '',
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, DISPATCH_COLUMNS, { filename: 'tow-dispatches' });
        break;
      case 'excel':
        exportToExcel(exportData, DISPATCH_COLUMNS, { filename: 'tow-dispatches' });
        break;
      case 'json':
        exportToJSON(exportData, DISPATCH_COLUMNS, { filename: 'tow-dispatches' });
        break;
      case 'pdf':
        exportToPDF(exportData, DISPATCH_COLUMNS, { filename: 'tow-dispatches', title: 'Tow Dispatch Report' });
        break;
    }
  };

  const getStatusBadge = (status: DispatchStatus) => {
    const statusInfo = DISPATCH_STATUSES.find(s => s.status === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${statusInfo?.color || 'bg-gray-500'}`}>
        {statusInfo?.label || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: Priority) => {
    const priorityInfo = PRIORITIES.find(p => p.priority === priority);
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${priorityInfo?.color || 'bg-gray-500'}`}>
        {priorityInfo?.label || priority}
      </span>
    );
  };

  return (
    <>
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">{t('tools.towDispatch.towDispatch', 'Tow Dispatch')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="tow-dispatch" toolName="Tow Dispatch" />

            <SyncStatus
              isSynced={dispatchesSynced}
              isSaving={dispatchesSaving}
              lastSaved={dispatchesLastSaved}
              error={dispatchesSyncError}
              onRetry={forceDispatchesSync}
            />
            <ExportDropdown
              onExport={handleExport}
              onCopy={() => copyUtil(filteredDispatches, 'csv')}
              onPrint={() => printData(filteredDispatches, DISPATCH_COLUMNS, 'Tow Dispatch Report')}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.towDispatch.activeCalls', 'Active Calls')}</div>
            <div className="text-2xl font-bold text-orange-600">{stats.activeCount}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.towDispatch.todaySCalls', 'Today\'s Calls')}</div>
            <div className="text-2xl font-bold">{stats.todayCount}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.towDispatch.completed', 'Completed')}</div>
            <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.towDispatch.revenue', 'Revenue')}</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.towDispatch.availableDrivers', 'Available Drivers')}</div>
            <div className="text-2xl font-bold text-blue-600">{stats.availableDrivers}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.towDispatch.availableTrucks', 'Available Trucks')}</div>
            <div className="text-2xl font-bold text-blue-600">{stats.availableTrucks}</div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-4">
        <div className="flex gap-4">
          {[
            { id: 'dispatch', label: 'New Dispatch', icon: Plus },
            { id: 'active', label: 'Active Calls', icon: AlertTriangle },
            { id: 'drivers', label: 'Drivers', icon: User },
            { id: 'trucks', label: 'Trucks', icon: Truck },
            { id: 'history', label: 'History', icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'active' && stats.activeCount > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.activeCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* New Dispatch Tab */}
        {activeTab === 'dispatch' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                {t('tools.towDispatch.createNewDispatch', 'Create New Dispatch')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Caller Info */}
                <div className="space-y-4 md:col-span-1">
                  <h3 className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4" /> Caller Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.callerName', 'Caller Name *')}</label>
                    <input
                      type="text"
                      value={newCall.callerName}
                      onChange={(e) => setNewCall({ ...newCall, callerName: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.towDispatch.enterCallerName', 'Enter caller name')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.phone', 'Phone *')}</label>
                    <input
                      type="tel"
                      value={newCall.callerPhone}
                      onChange={(e) => setNewCall({ ...newCall, callerPhone: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.serviceType', 'Service Type')}</label>
                    <select
                      value={newCall.serviceType}
                      onChange={(e) => setNewCall({ ...newCall, serviceType: e.target.value as ServiceType })}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {SERVICE_TYPES.map(st => (
                        <option key={st.type} value={st.type}>{st.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.priority', 'Priority')}</label>
                    <select
                      value={newCall.priority}
                      onChange={(e) => setNewCall({ ...newCall, priority: e.target.value as Priority })}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {PRIORITIES.map(p => (
                        <option key={p.priority} value={p.priority}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location Info */}
                <div className="space-y-4 md:col-span-1">
                  <h3 className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location
                  </h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.pickupLocation', 'Pickup Location *')}</label>
                    <input
                      type="text"
                      value={newCall.pickupLocation}
                      onChange={(e) => setNewCall({ ...newCall, pickupLocation: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.towDispatch.enterPickupAddress', 'Enter pickup address')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.dropoffLocation', 'Dropoff Location')}</label>
                    <input
                      type="text"
                      value={newCall.dropoffLocation}
                      onChange={(e) => setNewCall({ ...newCall, dropoffLocation: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.towDispatch.enterDropoffAddress', 'Enter dropoff address')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.notes', 'Notes')}</label>
                    <textarea
                      value={newCall.notes}
                      onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      rows={3}
                      placeholder={t('tools.towDispatch.additionalNotes', 'Additional notes...')}
                    />
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-4 md:col-span-1">
                  <h3 className="font-medium flex items-center gap-2">
                    <Car className="w-4 h-4" /> Vehicle Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.year', 'Year')}</label>
                      <input
                        type="text"
                        value={newCall.vehicleYear}
                        onChange={(e) => setNewCall({ ...newCall, vehicleYear: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.color', 'Color')}</label>
                      <input
                        type="text"
                        value={newCall.vehicleColor}
                        onChange={(e) => setNewCall({ ...newCall, vehicleColor: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder={t('tools.towDispatch.black', 'Black')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.make', 'Make')}</label>
                    <input
                      type="text"
                      value={newCall.vehicleMake}
                      onChange={(e) => setNewCall({ ...newCall, vehicleMake: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.towDispatch.toyota', 'Toyota')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.model', 'Model')}</label>
                    <input
                      type="text"
                      value={newCall.vehicleModel}
                      onChange={(e) => setNewCall({ ...newCall, vehicleModel: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.towDispatch.camry', 'Camry')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.towDispatch.licensePlate', 'License Plate')}</label>
                    <input
                      type="text"
                      value={newCall.vehicleLicensePlate}
                      onChange={(e) => setNewCall({ ...newCall, vehicleLicensePlate: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.towDispatch.abc1234', 'ABC-1234')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setNewCall({
                    callerName: '',
                    callerPhone: '',
                    serviceType: 'tow',
                    priority: 'normal',
                    pickupLocation: '',
                    dropoffLocation: '',
                    vehicleMake: '',
                    vehicleModel: '',
                    vehicleYear: '',
                    vehicleColor: '',
                    vehicleLicensePlate: '',
                    notes: '',
                  })}
                  className="px-4 py-2 border rounded-md hover:bg-muted"
                >
                  {t('tools.towDispatch.clear', 'Clear')}
                </button>
                <button
                  onClick={createDispatch}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.towDispatch.createDispatch', 'Create Dispatch')}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Calls Tab */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeDispatches.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">{t('tools.towDispatch.noActiveCalls', 'No Active Calls')}</h3>
                <p className="text-muted-foreground">{t('tools.towDispatch.allDispatchesHaveBeenCompleted', 'All dispatches have been completed.')}</p>
              </Card>
            ) : (
              activeDispatches.map(dispatch => (
                <Card key={dispatch.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-bold">{dispatch.callNumber}</span>
                        {getStatusBadge(dispatch.status)}
                        {getPriorityBadge(dispatch.priority)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">{t('tools.towDispatch.caller', 'Caller')}</div>
                          <div className="font-medium">{dispatch.callerName}</div>
                          <div>{dispatch.callerPhone}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">{t('tools.towDispatch.vehicle', 'Vehicle')}</div>
                          <div className="font-medium">
                            {dispatch.vehicleYear} {dispatch.vehicleMake} {dispatch.vehicleModel}
                          </div>
                          <div>{dispatch.vehicleColor} - {dispatch.vehicleLicensePlate}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">{t('tools.towDispatch.location', 'Location')}</div>
                          <div className="font-medium">{dispatch.pickupLocation}</div>
                          {dispatch.dropoffLocation && (
                            <div className="text-sm">To: {dispatch.dropoffLocation}</div>
                          )}
                        </div>
                      </div>

                      {/* Driver Assignment */}
                      {dispatch.status === 'pending' && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <div className="text-sm font-medium mb-2">{t('tools.towDispatch.assignDriverTruck', 'Assign Driver & Truck')}</div>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 p-2 border rounded-md bg-background text-sm"
                              defaultValue=""
                              onChange={(e) => {
                                const driverId = e.target.value;
                                const driver = drivers.find(d => d.id === driverId);
                                if (driver && driver.truckId) {
                                  assignDispatch(dispatch.id, driverId, driver.truckId);
                                }
                              }}
                            >
                              <option value="">{t('tools.towDispatch.selectDriver', 'Select Driver')}</option>
                              {drivers.filter(d => d.status === 'available').map(d => (
                                <option key={d.id} value={d.id}>
                                  {d.name} - {trucks.find(t => t.id === d.truckId)?.unitNumber}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Status Actions */}
                      {dispatch.status !== 'pending' && dispatch.status !== 'completed' && (
                        <div className="mt-4 flex gap-2">
                          {dispatch.status === 'dispatched' && (
                            <button
                              onClick={() => updateStatus(dispatch.id, 'en_route')}
                              className="px-3 py-1 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600"
                            >
                              {t('tools.towDispatch.markEnRoute', 'Mark En Route')}
                            </button>
                          )}
                          {dispatch.status === 'en_route' && (
                            <button
                              onClick={() => updateStatus(dispatch.id, 'on_scene')}
                              className="px-3 py-1 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
                            >
                              {t('tools.towDispatch.onScene', 'On Scene')}
                            </button>
                          )}
                          {dispatch.status === 'on_scene' && (
                            <button
                              onClick={() => updateStatus(dispatch.id, 'towing')}
                              className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                            >
                              {t('tools.towDispatch.startTowing', 'Start Towing')}
                            </button>
                          )}
                          {dispatch.status === 'towing' && (
                            <button
                              onClick={() => updateStatus(dispatch.id, 'completed')}
                              className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                              {t('tools.towDispatch.complete', 'Complete')}
                            </button>
                          )}
                          <button
                            onClick={() => updateStatus(dispatch.id, 'cancelled')}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            {t('tools.towDispatch.cancel', 'Cancel')}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {formatDate(dispatch.createdAt)}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('tools.towDispatch.drivers', 'Drivers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">{t('tools.towDispatch.name', 'Name')}</th>
                      <th className="text-left p-3">{t('tools.towDispatch.phone2', 'Phone')}</th>
                      <th className="text-left p-3">{t('tools.towDispatch.license', 'License #')}</th>
                      <th className="text-left p-3">{t('tools.towDispatch.truck', 'Truck')}</th>
                      <th className="text-left p-3">{t('tools.towDispatch.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(driver => (
                      <tr key={driver.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{driver.name}</td>
                        <td className="p-3">{driver.phone}</td>
                        <td className="p-3 font-mono">{driver.licenseNumber}</td>
                        <td className="p-3">{trucks.find(t => t.id === driver.truckId)?.unitNumber}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs text-white ${
                            driver.status === 'available' ? 'bg-green-500' :
                            driver.status === 'busy' ? 'bg-orange-500' :
                            driver.status === 'on_call' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}>
                            {driver.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trucks Tab */}
        {activeTab === 'trucks' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                {t('tools.towDispatch.towTrucks', 'Tow Trucks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">{t('tools.towDispatch.unit', 'Unit #')}</th>
                      <th className="text-left p-3">{t('tools.towDispatch.type', 'Type')}</th>
                      <th className="text-left p-3">{t('tools.towDispatch.licensePlate2', 'License Plate')}</th>
                      <th className="text-left p-3">{t('tools.towDispatch.capacity', 'Capacity')}</th>
                      <th className="text-left p-3">{t('tools.towDispatch.mileage', 'Mileage')}</th>
                      <th className="text-left p-3">{t('tools.towDispatch.status2', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map(truck => (
                      <tr key={truck.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono font-bold">{truck.unitNumber}</td>
                        <td className="p-3">{TOW_TYPES.find(t => t.type === truck.type)?.label}</td>
                        <td className="p-3 font-mono">{truck.licensePlate}</td>
                        <td className="p-3">{truck.capacity.toLocaleString()} lbs</td>
                        <td className="p-3">{truck.currentMileage.toLocaleString()} mi</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs text-white ${
                            truck.status === 'available' ? 'bg-green-500' :
                            truck.status === 'in_use' ? 'bg-blue-500' :
                            truck.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {truck.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                  placeholder={t('tools.towDispatch.searchByCallCallerLocation', 'Search by call #, caller, location, plate...')}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded-md bg-background"
              >
                <option value="all">{t('tools.towDispatch.allStatus', 'All Status')}</option>
                {DISPATCH_STATUSES.map(s => (
                  <option key={s.status} value={s.status}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Dispatch List */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">{t('tools.towDispatch.call', 'Call #')}</th>
                        <th className="text-left p-3">{t('tools.towDispatch.service', 'Service')}</th>
                        <th className="text-left p-3">{t('tools.towDispatch.caller2', 'Caller')}</th>
                        <th className="text-left p-3">{t('tools.towDispatch.vehicle2', 'Vehicle')}</th>
                        <th className="text-left p-3">{t('tools.towDispatch.location2', 'Location')}</th>
                        <th className="text-left p-3">{t('tools.towDispatch.status3', 'Status')}</th>
                        <th className="text-left p-3">{t('tools.towDispatch.price', 'Price')}</th>
                        <th className="text-left p-3">{t('tools.towDispatch.date', 'Date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDispatches.map(dispatch => (
                        <tr key={dispatch.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-mono font-bold">{dispatch.callNumber}</td>
                          <td className="p-3">
                            {SERVICE_TYPES.find(s => s.type === dispatch.serviceType)?.label}
                          </td>
                          <td className="p-3">
                            <div>{dispatch.callerName}</div>
                            <div className="text-xs text-muted-foreground">{dispatch.callerPhone}</div>
                          </td>
                          <td className="p-3">
                            <div>{dispatch.vehicleYear} {dispatch.vehicleMake} {dispatch.vehicleModel}</div>
                            <div className="text-xs text-muted-foreground">{dispatch.vehicleLicensePlate}</div>
                          </td>
                          <td className="p-3 max-w-[200px] truncate">{dispatch.pickupLocation}</td>
                          <td className="p-3">{getStatusBadge(dispatch.status)}</td>
                          <td className="p-3">{dispatch.price ? formatCurrency(dispatch.price) : '-'}</td>
                          <td className="p-3 text-sm text-muted-foreground">{formatDate(dispatch.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
};

export default TowDispatchTool;
