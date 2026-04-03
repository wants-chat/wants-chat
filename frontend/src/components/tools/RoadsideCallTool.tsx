'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Phone,
  MapPin,
  Clock,
  User,
  Car,
  Zap,
  Key,
  Fuel,
  Settings,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Plus,
  Search,
  Timer,
  DollarSign,
  Truck,
  Wrench,
  Battery,
  Shield,
  X,
  MessageSquare,
  Calendar,
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

interface RoadsideCallToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ServiceType = 'battery_jump' | 'tire_change' | 'lockout' | 'fuel_delivery' | 'winch_out' | 'minor_repair' | 'tow';
type CallStatus = 'pending' | 'assigned' | 'en_route' | 'on_scene' | 'in_progress' | 'completed' | 'cancelled';
type MembershipType = 'basic' | 'plus' | 'premium' | 'non_member';

interface RoadsideCall {
  id: string;
  callNumber: string;
  callerName: string;
  callerPhone: string;
  memberNumber?: string;
  membershipType: MembershipType;
  serviceType: ServiceType;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehicleLicensePlate: string;
  location: string;
  locationDetails: string;
  latitude?: number;
  longitude?: number;
  technicianId?: string;
  technicianName?: string;
  status: CallStatus;
  priority: 'normal' | 'urgent' | 'emergency';
  eta?: string;
  notes: string;
  symptoms: string;
  serviceNotes?: string;
  partsUsed: string[];
  laborMinutes?: number;
  totalCharge?: number;
  covered: boolean;
  memberCharge?: number;
  dispatchedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  specialties: ServiceType[];
  status: 'available' | 'busy' | 'off_duty';
  currentLocation?: string;
  callsToday: number;
}

// Constants
const SERVICE_TYPES: { type: ServiceType; label: string; icon: React.ReactNode; avgTime: number; basePrice: number }[] = [
  { type: 'battery_jump', label: 'Battery Jump', icon: <Battery className="w-4 h-4" />, avgTime: 15, basePrice: 75 },
  { type: 'tire_change', label: 'Flat Tire', icon: <Settings className="w-4 h-4" />, avgTime: 30, basePrice: 85 },
  { type: 'lockout', label: 'Lockout', icon: <Key className="w-4 h-4" />, avgTime: 20, basePrice: 65 },
  { type: 'fuel_delivery', label: 'Fuel Delivery', icon: <Fuel className="w-4 h-4" />, avgTime: 25, basePrice: 95 },
  { type: 'winch_out', label: 'Winch Out', icon: <Truck className="w-4 h-4" />, avgTime: 45, basePrice: 150 },
  { type: 'minor_repair', label: 'Minor Repair', icon: <Wrench className="w-4 h-4" />, avgTime: 45, basePrice: 125 },
  { type: 'tow', label: 'Tow Required', icon: <Truck className="w-4 h-4" />, avgTime: 60, basePrice: 175 },
];

const MEMBERSHIP_TYPES: { type: MembershipType; label: string; coveredServices: number; discount: number }[] = [
  { type: 'premium', label: 'Premium Member', coveredServices: 5, discount: 100 },
  { type: 'plus', label: 'Plus Member', coveredServices: 3, discount: 50 },
  { type: 'basic', label: 'Basic Member', coveredServices: 1, discount: 25 },
  { type: 'non_member', label: 'Non-Member', coveredServices: 0, discount: 0 },
];

const CALL_STATUSES: { status: CallStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Pending', color: 'bg-gray-500' },
  { status: 'assigned', label: 'Assigned', color: 'bg-blue-500' },
  { status: 'en_route', label: 'En Route', color: 'bg-purple-500' },
  { status: 'on_scene', label: 'On Scene', color: 'bg-orange-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { status: 'completed', label: 'Completed', color: 'bg-green-500' },
  { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

// Column configuration for exports
const CALL_COLUMNS: ColumnConfig[] = [
  { key: 'callNumber', header: 'Call #', type: 'string' },
  { key: 'callerName', header: 'Caller', type: 'string' },
  { key: 'callerPhone', header: 'Phone', type: 'string' },
  { key: 'membershipType', header: 'Membership', type: 'string' },
  { key: 'serviceType', header: 'Service', type: 'string' },
  { key: 'vehicleMake', header: 'Make', type: 'string' },
  { key: 'vehicleModel', header: 'Model', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'totalCharge', header: 'Charge', type: 'currency' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const TECHNICIAN_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'vehicleNumber', header: 'Vehicle #', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'callsToday', header: 'Calls Today', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateCallNumber = () => `RSA-${Date.now().toString().slice(-6)}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Default technicians
const DEFAULT_TECHNICIANS: Technician[] = [
  { id: 't1', name: 'Alex Rodriguez', phone: '(555) 111-2222', vehicleNumber: 'RSA-01', specialties: ['battery_jump', 'tire_change', 'lockout'], status: 'available', callsToday: 3 },
  { id: 't2', name: 'Sarah Chen', phone: '(555) 333-4444', vehicleNumber: 'RSA-02', specialties: ['battery_jump', 'lockout', 'fuel_delivery', 'minor_repair'], status: 'available', callsToday: 5 },
  { id: 't3', name: 'Mike Thompson', phone: '(555) 555-6666', vehicleNumber: 'RSA-03', specialties: ['winch_out', 'tow', 'tire_change'], status: 'busy', callsToday: 4 },
];

// Main Component
export const RoadsideCallTool: React.FC<RoadsideCallToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: calls,
    addItem: addCallToBackend,
    updateItem: updateCallBackend,
    deleteItem: deleteCallBackend,
    isSynced: callsSynced,
    isSaving: callsSaving,
    lastSaved: callsLastSaved,
    syncError: callsSyncError,
    forceSync: forceCallsSync,
  } = useToolData<RoadsideCall>('roadside-calls', [], CALL_COLUMNS);

  const {
    data: technicians,
    addItem: addTechnicianToBackend,
    updateItem: updateTechnicianBackend,
    deleteItem: deleteTechnicianBackend,
  } = useToolData<Technician>('roadside-technicians', DEFAULT_TECHNICIANS, TECHNICIAN_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'calls' | 'new' | 'active' | 'technicians' | 'history'>('calls');
  const [showCallDetails, setShowCallDetails] = useState<RoadsideCall | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');

  // New call form state
  const [newCall, setNewCall] = useState<Partial<RoadsideCall>>({
    callerName: '',
    callerPhone: '',
    memberNumber: '',
    membershipType: 'non_member',
    serviceType: 'battery_jump',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehicleLicensePlate: '',
    location: '',
    locationDetails: '',
    priority: 'normal',
    notes: '',
    symptoms: '',
  });

  // Calculate stats
  const stats = useMemo(() => {
    const activeCalls = calls.filter(c => !['completed', 'cancelled'].includes(c.status));
    const todayCalls = calls.filter(c => {
      const today = new Date().toDateString();
      return new Date(c.createdAt).toDateString() === today;
    });
    const completedToday = todayCalls.filter(c => c.status === 'completed');
    const totalRevenue = completedToday.reduce((sum, c) => sum + (c.totalCharge || 0), 0);
    const avgResponseTime = completedToday.length > 0
      ? completedToday.reduce((sum, c) => {
          if (c.arrivedAt && c.dispatchedAt) {
            return sum + (new Date(c.arrivedAt).getTime() - new Date(c.dispatchedAt).getTime()) / 60000;
          }
          return sum;
        }, 0) / completedToday.length
      : 0;
    const availableTechs = technicians.filter(t => t.status === 'available').length;

    return {
      activeCalls: activeCalls.length,
      todayCalls: todayCalls.length,
      completedToday: completedToday.length,
      totalRevenue,
      avgResponseTime: Math.round(avgResponseTime),
      availableTechs,
    };
  }, [calls, technicians]);

  // Filter calls
  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      const matchesSearch =
        c.callNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.callerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.callerPhone.includes(searchTerm) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchesService = filterService === 'all' || c.serviceType === filterService;
      return matchesSearch && matchesStatus && matchesService;
    });
  }, [calls, searchTerm, filterStatus, filterService]);

  // Active calls
  const activeCalls = useMemo(() => {
    return calls.filter(c => !['completed', 'cancelled'].includes(c.status));
  }, [calls]);

  // Create new call
  const createCall = () => {
    if (!newCall.callerName || !newCall.callerPhone || !newCall.location) {
      setValidationMessage('Please fill in required fields (Name, Phone, Location)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const serviceInfo = SERVICE_TYPES.find(s => s.type === newCall.serviceType);
    const membershipInfo = MEMBERSHIP_TYPES.find(m => m.type === newCall.membershipType);
    const basePrice = serviceInfo?.basePrice || 75;
    const discount = membershipInfo?.discount || 0;

    const call: RoadsideCall = {
      id: generateId(),
      callNumber: generateCallNumber(),
      callerName: newCall.callerName || '',
      callerPhone: newCall.callerPhone || '',
      memberNumber: newCall.memberNumber,
      membershipType: newCall.membershipType || 'non_member',
      serviceType: newCall.serviceType || 'battery_jump',
      vehicleMake: newCall.vehicleMake || '',
      vehicleModel: newCall.vehicleModel || '',
      vehicleYear: newCall.vehicleYear || '',
      vehicleColor: newCall.vehicleColor || '',
      vehicleLicensePlate: newCall.vehicleLicensePlate || '',
      location: newCall.location || '',
      locationDetails: newCall.locationDetails || '',
      priority: newCall.priority || 'normal',
      status: 'pending',
      notes: newCall.notes || '',
      symptoms: newCall.symptoms || '',
      partsUsed: [],
      covered: membershipInfo ? membershipInfo.coveredServices > 0 : false,
      totalCharge: Math.max(0, basePrice - (basePrice * discount / 100)),
      createdAt: new Date().toISOString(),
    };

    addCallToBackend(call);
    resetForm();
    setActiveTab('active');
  };

  const resetForm = () => {
    setNewCall({
      callerName: '',
      callerPhone: '',
      memberNumber: '',
      membershipType: 'non_member',
      serviceType: 'battery_jump',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      vehicleLicensePlate: '',
      location: '',
      locationDetails: '',
      priority: 'normal',
      notes: '',
      symptoms: '',
    });
  };

  // Assign technician
  const assignTechnician = (callId: string, technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    if (!technician) return;

    updateCallBackend(callId, {
      technicianId,
      technicianName: technician.name,
      status: 'assigned',
      dispatchedAt: new Date().toISOString(),
      eta: new Date(Date.now() + 30 * 60000).toISOString(), // 30 min ETA
    });
    updateTechnicianBackend(technicianId, { status: 'busy', callsToday: technician.callsToday + 1 });
  };

  // Update call status
  const updateStatus = (callId: string, status: CallStatus) => {
    const call = calls.find(c => c.id === callId);
    if (!call) return;

    const updates: Partial<RoadsideCall> = { status };
    if (status === 'on_scene') {
      updates.arrivedAt = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
      // Free up technician
      if (call.technicianId) {
        updateTechnicianBackend(call.technicianId, { status: 'available' });
      }
    }
    updateCallBackend(callId, updates);
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    switch (format) {
      case 'csv':
        exportToCSV(filteredCalls, CALL_COLUMNS, { filename: 'roadside-calls' });
        break;
      case 'excel':
        exportToExcel(filteredCalls, CALL_COLUMNS, { filename: 'roadside-calls' });
        break;
      case 'json':
        exportToJSON(filteredCalls, CALL_COLUMNS, { filename: 'roadside-calls' });
        break;
      case 'pdf':
        exportToPDF(filteredCalls, CALL_COLUMNS, { filename: 'roadside-calls', title: 'Roadside Assistance Report' });
        break;
    }
  };

  const getStatusBadge = (status: CallStatus) => {
    const statusInfo = CALL_STATUSES.find(s => s.status === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${statusInfo?.color || 'bg-gray-500'}`}>
        {statusInfo?.label || status}
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
            <Phone className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">{t('tools.roadsideCall.roadsideAssistance', 'Roadside Assistance')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="roadside-call" toolName="Roadside Call" />

            <SyncStatus
              isSynced={callsSynced}
              isSaving={callsSaving}
              lastSaved={callsLastSaved}
              error={callsSyncError}
              onRetry={forceCallsSync}
            />
            <ExportDropdown
              onExport={handleExport}
              onCopy={() => copyUtil(filteredCalls, 'csv')}
              onPrint={() => printData(filteredCalls, CALL_COLUMNS, 'Roadside Assistance Report')}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.roadsideCall.activeCalls', 'Active Calls')}</div>
            <div className="text-2xl font-bold text-orange-600">{stats.activeCalls}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.roadsideCall.todaySCalls', 'Today\'s Calls')}</div>
            <div className="text-2xl font-bold">{stats.todayCalls}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.roadsideCall.completed', 'Completed')}</div>
            <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.roadsideCall.revenue', 'Revenue')}</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.roadsideCall.avgResponse', 'Avg Response')}</div>
            <div className="text-2xl font-bold">{stats.avgResponseTime} min</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">{t('tools.roadsideCall.availableTechs', 'Available Techs')}</div>
            <div className="text-2xl font-bold text-blue-600">{stats.availableTechs}</div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-4">
        <div className="flex gap-4">
          {[
            { id: 'new', label: 'New Call', icon: Plus },
            { id: 'active', label: 'Active', icon: AlertTriangle },
            { id: 'technicians', label: 'Technicians', icon: User },
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
              {tab.id === 'active' && stats.activeCalls > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.activeCalls}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* New Call Tab */}
        {activeTab === 'new' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                {t('tools.roadsideCall.newRoadsideCall', 'New Roadside Call')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Caller Info */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4" /> Caller Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.name', 'Name *')}</label>
                    <input
                      type="text"
                      value={newCall.callerName}
                      onChange={(e) => setNewCall({ ...newCall, callerName: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.roadsideCall.callerName', 'Caller name')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.phone', 'Phone *')}</label>
                    <input
                      type="tel"
                      value={newCall.callerPhone}
                      onChange={(e) => setNewCall({ ...newCall, callerPhone: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.member', 'Member #')}</label>
                    <input
                      type="text"
                      value={newCall.memberNumber}
                      onChange={(e) => setNewCall({ ...newCall, memberNumber: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.roadsideCall.optional', 'Optional')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.membership', 'Membership')}</label>
                    <select
                      value={newCall.membershipType}
                      onChange={(e) => setNewCall({ ...newCall, membershipType: e.target.value as MembershipType })}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {MEMBERSHIP_TYPES.map(m => (
                        <option key={m.type} value={m.type}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Service & Location */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Service & Location
                  </h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.serviceType', 'Service Type')}</label>
                    <select
                      value={newCall.serviceType}
                      onChange={(e) => setNewCall({ ...newCall, serviceType: e.target.value as ServiceType })}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {SERVICE_TYPES.map(s => (
                        <option key={s.type} value={s.type}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.location', 'Location *')}</label>
                    <input
                      type="text"
                      value={newCall.location}
                      onChange={(e) => setNewCall({ ...newCall, location: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.roadsideCall.addressOrCrossStreets', 'Address or cross streets')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.locationDetails', 'Location Details')}</label>
                    <input
                      type="text"
                      value={newCall.locationDetails}
                      onChange={(e) => setNewCall({ ...newCall, locationDetails: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.roadsideCall.parkingLotShoulderEtc', 'Parking lot, shoulder, etc.')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.priority', 'Priority')}</label>
                    <select
                      value={newCall.priority}
                      onChange={(e) => setNewCall({ ...newCall, priority: e.target.value as 'normal' | 'urgent' | 'emergency' })}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="normal">{t('tools.roadsideCall.normal', 'Normal')}</option>
                      <option value="urgent">{t('tools.roadsideCall.urgent', 'Urgent')}</option>
                      <option value="emergency">{t('tools.roadsideCall.emergency', 'Emergency')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.problemDescription', 'Problem Description')}</label>
                    <textarea
                      value={newCall.symptoms}
                      onChange={(e) => setNewCall({ ...newCall, symptoms: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      rows={2}
                      placeholder={t('tools.roadsideCall.describeTheIssue', 'Describe the issue...')}
                    />
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Car className="w-4 h-4" /> Vehicle Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.year', 'Year')}</label>
                      <input
                        type="text"
                        value={newCall.vehicleYear}
                        onChange={(e) => setNewCall({ ...newCall, vehicleYear: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.color', 'Color')}</label>
                      <input
                        type="text"
                        value={newCall.vehicleColor}
                        onChange={(e) => setNewCall({ ...newCall, vehicleColor: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                        placeholder={t('tools.roadsideCall.black', 'Black')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.make', 'Make')}</label>
                    <input
                      type="text"
                      value={newCall.vehicleMake}
                      onChange={(e) => setNewCall({ ...newCall, vehicleMake: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.roadsideCall.honda', 'Honda')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.model', 'Model')}</label>
                    <input
                      type="text"
                      value={newCall.vehicleModel}
                      onChange={(e) => setNewCall({ ...newCall, vehicleModel: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.roadsideCall.civic', 'Civic')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.licensePlate', 'License Plate')}</label>
                    <input
                      type="text"
                      value={newCall.vehicleLicensePlate}
                      onChange={(e) => setNewCall({ ...newCall, vehicleLicensePlate: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder={t('tools.roadsideCall.abc1234', 'ABC-1234')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.roadsideCall.notes', 'Notes')}</label>
                    <textarea
                      value={newCall.notes}
                      onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                      className="w-full p-2 border rounded-md bg-background"
                      rows={2}
                      placeholder={t('tools.roadsideCall.additionalNotes', 'Additional notes...')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-md hover:bg-muted"
                >
                  {t('tools.roadsideCall.clear', 'Clear')}
                </button>
                <button
                  onClick={createCall}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.roadsideCall.createCall', 'Create Call')}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Calls Tab */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeCalls.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">{t('tools.roadsideCall.noActiveCalls', 'No Active Calls')}</h3>
                <p className="text-muted-foreground">{t('tools.roadsideCall.allRoadsideCallsHaveBeen', 'All roadside calls have been handled.')}</p>
              </Card>
            ) : (
              activeCalls.map(call => (
                <Card key={call.id} className={`p-4 ${call.priority === 'emergency' ? 'border-red-500 border-2' : call.priority === 'urgent' ? 'border-yellow-500 border-2' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-bold">{call.callNumber}</span>
                        {getStatusBadge(call.status)}
                        {SERVICE_TYPES.find(s => s.type === call.serviceType)?.icon}
                        <span className="text-sm">
                          {SERVICE_TYPES.find(s => s.type === call.serviceType)?.label}
                        </span>
                        {call.priority === 'emergency' && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{t('tools.roadsideCall.emergency2', 'EMERGENCY')}</span>
                        )}
                        {call.priority === 'urgent' && (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">{t('tools.roadsideCall.urgent2', 'URGENT')}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">{t('tools.roadsideCall.caller', 'Caller')}</div>
                          <div className="font-medium">{call.callerName}</div>
                          <div>{call.callerPhone}</div>
                          {call.memberNumber && (
                            <div className="text-xs text-blue-600">Member: {call.memberNumber}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-muted-foreground">{t('tools.roadsideCall.vehicle', 'Vehicle')}</div>
                          <div className="font-medium">
                            {call.vehicleYear} {call.vehicleMake} {call.vehicleModel}
                          </div>
                          <div>{call.vehicleColor} - {call.vehicleLicensePlate}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">{t('tools.roadsideCall.location2', 'Location')}</div>
                          <div className="font-medium">{call.location}</div>
                          {call.locationDetails && (
                            <div className="text-xs">{call.locationDetails}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-muted-foreground">{t('tools.roadsideCall.technician', 'Technician')}</div>
                          {call.technicianName ? (
                            <>
                              <div className="font-medium">{call.technicianName}</div>
                              {call.eta && (
                                <div className="text-xs">ETA: {formatTime(call.eta)}</div>
                              )}
                            </>
                          ) : (
                            <div className="text-yellow-600">{t('tools.roadsideCall.notAssigned', 'Not Assigned')}</div>
                          )}
                        </div>
                      </div>

                      {call.symptoms && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <strong>{t('tools.roadsideCall.issue', 'Issue:')}</strong> {call.symptoms}
                        </div>
                      )}

                      {/* Assignment / Status Actions */}
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {call.status === 'pending' && (
                          <select
                            className="p-2 border rounded-md bg-background text-sm"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                assignTechnician(call.id, e.target.value);
                              }
                            }}
                          >
                            <option value="">{t('tools.roadsideCall.assignTechnician', 'Assign Technician...')}</option>
                            {technicians
                              .filter(t => t.status === 'available')
                              .filter(t => t.specialties.includes(call.serviceType))
                              .map(t => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({t.vehicleNumber})
                                </option>
                              ))}
                          </select>
                        )}
                        {call.status === 'assigned' && (
                          <button
                            onClick={() => updateStatus(call.id, 'en_route')}
                            className="px-3 py-1 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600"
                          >
                            {t('tools.roadsideCall.markEnRoute', 'Mark En Route')}
                          </button>
                        )}
                        {call.status === 'en_route' && (
                          <button
                            onClick={() => updateStatus(call.id, 'on_scene')}
                            className="px-3 py-1 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
                          >
                            {t('tools.roadsideCall.arrivedOnScene', 'Arrived On Scene')}
                          </button>
                        )}
                        {call.status === 'on_scene' && (
                          <button
                            onClick={() => updateStatus(call.id, 'in_progress')}
                            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                          >
                            {t('tools.roadsideCall.startService', 'Start Service')}
                          </button>
                        )}
                        {call.status === 'in_progress' && (
                          <button
                            onClick={() => updateStatus(call.id, 'completed')}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            {t('tools.roadsideCall.complete', 'Complete')}
                          </button>
                        )}
                        <button
                          onClick={() => updateStatus(call.id, 'cancelled')}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          {t('tools.roadsideCall.cancel', 'Cancel')}
                        </button>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">{formatTime(call.createdAt)}</div>
                      {call.totalCharge !== undefined && (
                        <div className="font-bold mt-1">{formatCurrency(call.totalCharge)}</div>
                      )}
                      {call.covered && (
                        <div className="text-xs text-green-600">{t('tools.roadsideCall.covered', 'Covered')}</div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Technicians Tab */}
        {activeTab === 'technicians' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('tools.roadsideCall.technicians', 'Technicians')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {technicians.map(tech => (
                  <Card key={tech.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium">{tech.name}</div>
                        <div className="text-sm text-muted-foreground">{tech.vehicleNumber}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${
                        tech.status === 'available' ? 'bg-green-500' :
                        tech.status === 'busy' ? 'bg-orange-500' : 'bg-gray-500'
                      }`}>
                        {tech.status}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {tech.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3 h-3" />
                        {tech.specialties.map(s => SERVICE_TYPES.find(st => st.type === s)?.label).join(', ')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {tech.callsToday} calls today
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                  placeholder={t('tools.roadsideCall.searchCalls', 'Search calls...')}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded-md bg-background"
              >
                <option value="all">{t('tools.roadsideCall.allStatus', 'All Status')}</option>
                {CALL_STATUSES.map(s => (
                  <option key={s.status} value={s.status}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="p-2 border rounded-md bg-background"
              >
                <option value="all">{t('tools.roadsideCall.allServices', 'All Services')}</option>
                {SERVICE_TYPES.map(s => (
                  <option key={s.type} value={s.type}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Call History Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">{t('tools.roadsideCall.call', 'Call #')}</th>
                        <th className="text-left p-3">{t('tools.roadsideCall.service', 'Service')}</th>
                        <th className="text-left p-3">{t('tools.roadsideCall.caller2', 'Caller')}</th>
                        <th className="text-left p-3">{t('tools.roadsideCall.vehicle2', 'Vehicle')}</th>
                        <th className="text-left p-3">{t('tools.roadsideCall.location3', 'Location')}</th>
                        <th className="text-left p-3">{t('tools.roadsideCall.technician2', 'Technician')}</th>
                        <th className="text-left p-3">{t('tools.roadsideCall.status', 'Status')}</th>
                        <th className="text-left p-3">{t('tools.roadsideCall.charge', 'Charge')}</th>
                        <th className="text-left p-3">{t('tools.roadsideCall.date', 'Date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCalls.map(call => (
                        <tr key={call.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-mono">{call.callNumber}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {SERVICE_TYPES.find(s => s.type === call.serviceType)?.icon}
                              {SERVICE_TYPES.find(s => s.type === call.serviceType)?.label}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>{call.callerName}</div>
                            <div className="text-xs text-muted-foreground">{call.callerPhone}</div>
                          </td>
                          <td className="p-3">
                            {call.vehicleYear} {call.vehicleMake} {call.vehicleModel}
                          </td>
                          <td className="p-3 max-w-[150px] truncate">{call.location}</td>
                          <td className="p-3">{call.technicianName || '-'}</td>
                          <td className="p-3">{getStatusBadge(call.status)}</td>
                          <td className="p-3">{call.totalCharge ? formatCurrency(call.totalCharge) : '-'}</td>
                          <td className="p-3 text-sm text-muted-foreground">{formatDateTime(call.createdAt)}</td>
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

export default RoadsideCallTool;
