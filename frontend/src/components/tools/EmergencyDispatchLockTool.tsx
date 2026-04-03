'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  AlertTriangle,
  Phone,
  MapPin,
  User,
  Clock,
  Car,
  Home,
  Building2,
  Key,
  Lock,
  Plus,
  Trash2,
  Edit,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Navigation,
  Radio,
  Loader2,
  Siren,
  Timer,
  PhoneCall,
  PhoneOff,
  Send,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Activity,
  Zap,
  Volume2
} from 'lucide-react';

// Types
type EmergencyType = 'lockout_residential' | 'lockout_commercial' | 'lockout_automotive' | 'broken_key' | 'burglary_repair' | 'safe_lockout' | 'other';
type DispatchStatus = 'received' | 'dispatching' | 'assigned' | 'en_route' | 'on_scene' | 'completed' | 'cancelled';
type TechnicianStatus = 'available' | 'on_call' | 'busy' | 'offline';

interface EmergencyCall {
  id: string;
  callId: string;
  receivedAt: string;
  updatedAt: string;

  // Caller Info
  callerName: string;
  callerPhone: string;
  callbackPhone?: string;
  callerRelation?: string;

  // Location
  address: string;
  city: string;
  zipCode: string;
  crossStreet?: string;
  gpsCoordinates?: { lat: number; lng: number };
  locationNotes?: string;

  // Emergency Details
  emergencyType: EmergencyType;
  description: string;
  vehicleInfo?: {
    make: string;
    model: string;
    year: string;
    color: string;
    licensePlate: string;
  };

  // Priority & Status
  priority: 'critical' | 'high' | 'normal';
  status: DispatchStatus;
  escalated: boolean;

  // Dispatch
  dispatchedAt?: string;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  eta?: string;
  arrivedAt?: string;
  completedAt?: string;

  // Billing
  estimatedCost?: number;
  actualCost?: number;
  paymentCollected: boolean;
  paymentMethod?: string;

  // Notes
  dispatchNotes?: string;
  technicianNotes?: string;
  resolutionNotes?: string;

  // Call Recording
  callDuration?: number;
  callRecordingId?: string;
}

interface DispatchTechnician {
  id: string;
  name: string;
  phone: string;
  status: TechnicianStatus;
  currentLocation?: string;
  lastUpdateTime?: string;
  activeCallId?: string;
  specialties: EmergencyType[];
  vehicleInfo?: string;
  rating: number;
  completedToday: number;
  avgResponseTime: number; // in minutes
}

// Emergency type configurations
const EMERGENCY_TYPES: { type: EmergencyType; label: string; icon: React.ReactNode; priority: 'critical' | 'high' | 'normal'; baseRate: number }[] = [
  { type: 'lockout_residential', label: 'Residential Lockout', icon: <Home className="w-4 h-4" />, priority: 'high', baseRate: 85 },
  { type: 'lockout_commercial', label: 'Commercial Lockout', icon: <Building2 className="w-4 h-4" />, priority: 'high', baseRate: 125 },
  { type: 'lockout_automotive', label: 'Auto Lockout', icon: <Car className="w-4 h-4" />, priority: 'high', baseRate: 75 },
  { type: 'broken_key', label: 'Broken Key Extraction', icon: <Key className="w-4 h-4" />, priority: 'normal', baseRate: 95 },
  { type: 'burglary_repair', label: 'Burglary Damage Repair', icon: <AlertTriangle className="w-4 h-4" />, priority: 'critical', baseRate: 200 },
  { type: 'safe_lockout', label: 'Safe Lockout', icon: <Lock className="w-4 h-4" />, priority: 'normal', baseRate: 150 },
  { type: 'other', label: 'Other Emergency', icon: <Siren className="w-4 h-4" />, priority: 'normal', baseRate: 85 },
];

const STATUS_CONFIG: Record<DispatchStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  received: { label: 'Received', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: <Phone className="w-4 h-4" /> },
  dispatching: { label: 'Dispatching', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: <Radio className="w-4 h-4" /> },
  assigned: { label: 'Assigned', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: <User className="w-4 h-4" /> },
  en_route: { label: 'En Route', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: <Navigation className="w-4 h-4" /> },
  on_scene: { label: 'On Scene', color: 'text-cyan-600', bgColor: 'bg-cyan-100', icon: <MapPin className="w-4 h-4" /> },
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100', icon: <X className="w-4 h-4" /> },
};

const PRIORITY_CONFIG = {
  critical: { label: 'CRITICAL', color: 'text-red-600', bgColor: 'bg-red-100', border: 'border-red-500' },
  high: { label: 'HIGH', color: 'text-orange-600', bgColor: 'bg-orange-100', border: 'border-orange-500' },
  normal: { label: 'Normal', color: 'text-blue-600', bgColor: 'bg-blue-100', border: 'border-blue-500' },
};

// Default technicians
const DEFAULT_TECHNICIANS: DispatchTechnician[] = [
  { id: '1', name: 'John Smith', phone: '555-0101', status: 'available', currentLocation: 'Downtown', specialties: ['lockout_residential', 'lockout_automotive', 'broken_key'], rating: 4.9, completedToday: 5, avgResponseTime: 18 },
  { id: '2', name: 'Mike Johnson', phone: '555-0102', status: 'on_call', currentLocation: 'North Side', specialties: ['lockout_commercial', 'burglary_repair', 'safe_lockout'], rating: 4.7, completedToday: 3, avgResponseTime: 22 },
  { id: '3', name: 'Sarah Davis', phone: '555-0103', status: 'busy', currentLocation: 'West End', activeCallId: 'EM-123', specialties: ['lockout_residential', 'lockout_automotive'], rating: 4.8, completedToday: 4, avgResponseTime: 15 },
  { id: '4', name: 'Tom Wilson', phone: '555-0104', status: 'available', currentLocation: 'South District', specialties: ['lockout_commercial', 'lockout_residential', 'burglary_repair'], rating: 4.6, completedToday: 6, avgResponseTime: 20 },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateCallId = () => `EM-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getElapsedTime = (dateString: string) => {
  const elapsed = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(elapsed / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
};

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'callId', header: 'Call ID', type: 'string' },
  { key: 'receivedAt', header: 'Received', type: 'date' },
  { key: 'callerName', header: 'Caller Name', type: 'string' },
  { key: 'callerPhone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'emergencyType', header: 'Type', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'eta', header: 'ETA', type: 'string' },
  { key: 'estimatedCost', header: 'Est. Cost', type: 'currency' },
  { key: 'actualCost', header: 'Actual Cost', type: 'currency' },
  { key: 'completedAt', header: 'Completed', type: 'date' },
];

interface EmergencyDispatchLockToolProps {
  uiConfig?: UIConfig;
}

export function EmergencyDispatchLockTool({ uiConfig }: EmergencyDispatchLockToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: emergencyCalls,
    setData: setEmergencyCalls,
    addItem: addEmergencyCall,
    updateItem: updateEmergencyCall,
    deleteItem: deleteEmergencyCall,
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
  } = useToolData<EmergencyCall>('emergency-dispatch-lock', [], COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<'dispatch' | 'new' | 'technicians' | 'history' | 'reports'>('dispatch');
  const [technicians, setTechnicians] = useState<DispatchTechnician[]>(DEFAULT_TECHNICIANS);
  const [selectedCall, setSelectedCall] = useState<EmergencyCall | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DispatchStatus | 'active' | 'all'>('active');
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // Form state for new call
  const [newCall, setNewCall] = useState<Partial<EmergencyCall>>({
    emergencyType: 'lockout_residential',
    priority: 'high',
    status: 'received',
    paymentCollected: false,
    escalated: false,
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.callerName || params.phone || params.address) {
        setNewCall({
          ...newCall,
          callerName: params.callerName || params.customerName || '',
          callerPhone: params.phone || '',
          address: params.address || '',
          description: params.notes || params.description || '',
        });
        setActiveTab('new');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Update estimated cost when type changes
  useEffect(() => {
    const typeConfig = EMERGENCY_TYPES.find(t => t.type === newCall.emergencyType);
    if (typeConfig) {
      setNewCall(prev => ({
        ...prev,
        priority: prev.priority || typeConfig.priority,
        estimatedCost: typeConfig.baseRate,
      }));
    }
  }, [newCall.emergencyType]);

  // Active and filtered calls
  const activeCalls = useMemo(() => {
    return emergencyCalls.filter(call =>
      !['completed', 'cancelled'].includes(call.status)
    ).sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { critical: 0, high: 1, normal: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then by time received
      return new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime();
    });
  }, [emergencyCalls]);

  const filteredCalls = useMemo(() => {
    let calls = emergencyCalls;

    if (statusFilter === 'active') {
      calls = calls.filter(c => !['completed', 'cancelled'].includes(c.status));
    } else if (statusFilter !== 'all') {
      calls = calls.filter(c => c.status === statusFilter);
    }

    if (searchQuery) {
      calls = calls.filter(c =>
        c.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.callerPhone.includes(searchQuery) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.callId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return calls.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }, [emergencyCalls, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayCalls = emergencyCalls.filter(c => new Date(c.receivedAt) >= today);
    const completedToday = todayCalls.filter(c => c.status === 'completed');
    const availableTechs = technicians.filter(t => t.status === 'available');

    const avgResponseTime = completedToday.length > 0
      ? completedToday.reduce((sum, c) => {
          if (c.arrivedAt && c.dispatchedAt) {
            return sum + (new Date(c.arrivedAt).getTime() - new Date(c.dispatchedAt).getTime());
          }
          return sum;
        }, 0) / completedToday.length / 60000
      : 0;

    const revenue = completedToday.reduce((sum, c) => sum + (c.actualCost || 0), 0);

    return {
      activeNow: activeCalls.length,
      todayTotal: todayCalls.length,
      completedToday: completedToday.length,
      availableTechs: availableTechs.length,
      avgResponseTime: Math.round(avgResponseTime),
      revenue,
      criticalCount: activeCalls.filter(c => c.priority === 'critical').length,
    };
  }, [emergencyCalls, activeCalls, technicians]);

  // Create new emergency call
  const createEmergencyCall = () => {
    if (!newCall.callerName || !newCall.callerPhone || !newCall.address) {
      setValidationMessage('Please fill in required fields: Caller Name, Phone, and Address');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const call: EmergencyCall = {
      id: generateId(),
      callId: generateCallId(),
      receivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      callerName: newCall.callerName || '',
      callerPhone: newCall.callerPhone || '',
      callbackPhone: newCall.callbackPhone,
      callerRelation: newCall.callerRelation,
      address: newCall.address || '',
      city: newCall.city || '',
      zipCode: newCall.zipCode || '',
      crossStreet: newCall.crossStreet,
      locationNotes: newCall.locationNotes,
      emergencyType: newCall.emergencyType || 'lockout_residential',
      description: newCall.description || '',
      vehicleInfo: newCall.vehicleInfo,
      priority: newCall.priority || 'high',
      status: 'received',
      escalated: false,
      estimatedCost: newCall.estimatedCost,
      paymentCollected: false,
      dispatchNotes: newCall.dispatchNotes,
    };

    addEmergencyCall(call);
    resetForm();
    setActiveTab('dispatch');
  };

  // Reset form
  const resetForm = () => {
    setNewCall({
      emergencyType: 'lockout_residential',
      priority: 'high',
      status: 'received',
      paymentCollected: false,
      escalated: false,
    });
  };

  // Dispatch technician
  const dispatchTechnician = (callId: string, technicianId: string, eta: string) => {
    const tech = technicians.find(t => t.id === technicianId);
    if (!tech) return;

    updateEmergencyCall(callId, {
      status: 'assigned',
      technicianId,
      technicianName: tech.name,
      technicianPhone: tech.phone,
      dispatchedAt: new Date().toISOString(),
      eta,
      updatedAt: new Date().toISOString(),
    });

    // Update technician status
    setTechnicians(prev => prev.map(t =>
      t.id === technicianId
        ? { ...t, status: 'busy' as TechnicianStatus, activeCallId: callId }
        : t
    ));

    setShowDispatchModal(false);
    setSelectedCall(null);
  };

  // Update call status
  const updateStatus = (callId: string, status: DispatchStatus) => {
    const updates: Partial<EmergencyCall> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'en_route') {
      // Already dispatched
    } else if (status === 'on_scene') {
      updates.arrivedAt = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
      // Free up technician
      const call = emergencyCalls.find(c => c.id === callId);
      if (call?.technicianId) {
        setTechnicians(prev => prev.map(t =>
          t.id === call.technicianId
            ? { ...t, status: 'available' as TechnicianStatus, activeCallId: undefined, completedToday: t.completedToday + 1 }
            : t
        ));
      }
    }

    updateEmergencyCall(callId, updates);
  };

  // Card styles
  const cardClass = isDark
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const inputClass = isDark
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  return (
    <div className={`min-h-screen p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Siren className="w-6 h-6 text-red-500" />
              {t('tools.emergencyDispatchLock.emergencyDispatch', 'Emergency Dispatch')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.emergencyDispatchLock.247EmergencyLocksmithDispatch', '24/7 emergency locksmith dispatch management')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="emergency-dispatch-lock" toolName="Emergency Dispatch Lock" />

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

        {/* Live Stats Banner */}
        <div className={`mb-6 p-4 rounded-lg ${stats.criticalCount > 0 ? 'bg-red-900/20 border border-red-500' : 'bg-green-900/20 border border-green-500'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Activity className={`w-5 h-5 ${stats.criticalCount > 0 ? 'text-red-500 animate-pulse' : 'text-green-500'}`} />
                <span className="font-medium">{t('tools.emergencyDispatchLock.liveStatus', 'Live Status:')}</span>
              </div>
              <div>
                <span className="text-2xl font-bold">{stats.activeNow}</span>
                <span className="text-sm text-gray-400 ml-1">{t('tools.emergencyDispatchLock.activeCalls', 'Active Calls')}</span>
              </div>
              {stats.criticalCount > 0 && (
                <div className="flex items-center gap-1 text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-bold">{stats.criticalCount} Critical</span>
                </div>
              )}
              <div>
                <span className="text-lg font-bold text-green-500">{stats.availableTechs}</span>
                <span className="text-sm text-gray-400 ml-1">{t('tools.emergencyDispatchLock.techsAvailable', 'Techs Available')}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('new')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium animate-pulse"
            >
              <PhoneCall className="w-4 h-4 inline mr-2" />
              {t('tools.emergencyDispatchLock.newEmergencyCall', 'New Emergency Call')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.emergencyDispatchLock.todaySCalls', 'Today\'s Calls')}</p>
                  <p className="text-xl font-bold">{stats.todayTotal}</p>
                </div>
                <Phone className="w-6 h-6 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.emergencyDispatchLock.activeNow', 'Active Now')}</p>
                  <p className="text-xl font-bold text-orange-500">{stats.activeNow}</p>
                </div>
                <Radio className="w-6 h-6 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.emergencyDispatchLock.completed', 'Completed')}</p>
                  <p className="text-xl font-bold text-green-500">{stats.completedToday}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.emergencyDispatchLock.avgResponse', 'Avg Response')}</p>
                  <p className="text-xl font-bold">{stats.avgResponseTime} min</p>
                </div>
                <Timer className="w-6 h-6 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.emergencyDispatchLock.techsReady', 'Techs Ready')}</p>
                  <p className="text-xl font-bold text-green-500">{stats.availableTechs}</p>
                </div>
                <User className="w-6 h-6 text-cyan-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.emergencyDispatchLock.revenue', 'Revenue')}</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(stats.revenue)}</p>
                </div>
                <BarChart3 className="w-6 h-6 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['dispatch', 'new', 'technicians', 'history', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-red-600 text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'dispatch' && <Radio className="w-4 h-4 inline mr-2" />}
              {tab === 'new' && <Plus className="w-4 h-4 inline mr-2" />}
              {tab === 'technicians' && <User className="w-4 h-4 inline mr-2" />}
              {tab === 'history' && <Clock className="w-4 h-4 inline mr-2" />}
              {tab === 'reports' && <BarChart3 className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'dispatch' && stats.activeNow > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.activeNow}</span>
              )}
            </button>
          ))}
        </div>

        {/* Dispatch Board Tab */}
        {activeTab === 'dispatch' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              </div>
            ) : activeCalls.length === 0 ? (
              <Card className={cardClass}>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.emergencyDispatchLock.noActiveEmergencyCalls', 'No active emergency calls')}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{t('tools.emergencyDispatchLock.allTechniciansAreAvailable', 'All technicians are available')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeCalls.map(call => {
                  const typeConfig = EMERGENCY_TYPES.find(t => t.type === call.emergencyType);
                  const priorityConfig = PRIORITY_CONFIG[call.priority];
                  const statusConfig = STATUS_CONFIG[call.status];

                  return (
                    <Card
                      key={call.id}
                      className={`${cardClass} border-l-4 ${priorityConfig.border} ${call.priority === 'critical' ? 'animate-pulse' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm font-bold">{call.callId}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                                {priorityConfig.label}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.color}`}>
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {getElapsedTime(call.receivedAt)} ago
                              </span>
                            </div>

                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center gap-1">
                                {typeConfig?.icon}
                                <span className="font-medium">{typeConfig?.label}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>{call.callerName}</span>
                                <span className="text-gray-400">|</span>
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{call.callerPhone}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                  {call.address}{call.city && `, ${call.city}`}
                                </span>
                              </div>
                            </div>

                            {call.technicianName && (
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                <Navigation className="w-4 h-4 text-green-500" />
                                <span className="text-green-500 font-medium">{call.technicianName}</span>
                                {call.eta && (
                                  <span className="text-gray-400">- ETA: {call.eta}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {call.estimatedCost && (
                              <div className="text-right mr-4">
                                <p className="text-sm text-gray-400">{t('tools.emergencyDispatchLock.estCost', 'Est. Cost')}</p>
                                <p className="font-bold">{formatCurrency(call.estimatedCost)}</p>
                              </div>
                            )}

                            {call.status === 'received' && (
                              <button
                                onClick={() => {
                                  setSelectedCall(call);
                                  setShowDispatchModal(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                <Send className="w-4 h-4 inline mr-1" />
                                {t('tools.emergencyDispatchLock.dispatch', 'Dispatch')}
                              </button>
                            )}

                            {call.status === 'assigned' && (
                              <button
                                onClick={() => updateStatus(call.id, 'en_route')}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                              >
                                <Navigation className="w-4 h-4 inline mr-1" />
                                {t('tools.emergencyDispatchLock.enRoute', 'En Route')}
                              </button>
                            )}

                            {call.status === 'en_route' && (
                              <button
                                onClick={() => updateStatus(call.id, 'on_scene')}
                                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                              >
                                <MapPin className="w-4 h-4 inline mr-1" />
                                {t('tools.emergencyDispatchLock.onScene', 'On Scene')}
                              </button>
                            )}

                            {call.status === 'on_scene' && (
                              <button
                                onClick={() => updateStatus(call.id, 'completed')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                {t('tools.emergencyDispatchLock.complete', 'Complete')}
                              </button>
                            )}

                            <button
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Cancel Call',
                                  message: 'Cancel this call?',
                                  confirmText: 'Yes, Cancel',
                                  cancelText: 'No',
                                  variant: 'danger'
                                });
                                if (confirmed) {
                                  updateStatus(call.id, 'cancelled');
                                }
                              }}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* New Call Tab */}
        {activeTab === 'new' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <PhoneCall className="w-5 h-5" />
                {t('tools.emergencyDispatchLock.newEmergencyCall2', 'New Emergency Call')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Caller Information */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.emergencyDispatchLock.callerInformation', 'Caller Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.emergencyDispatchLock.callerName', 'Caller Name *')}</label>
                    <input
                      type="text"
                      value={newCall.callerName || ''}
                      onChange={(e) => setNewCall({ ...newCall, callerName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.emergencyDispatchLock.callerPhone', 'Caller Phone *')}</label>
                    <input
                      type="tel"
                      value={newCall.callerPhone || ''}
                      onChange={(e) => setNewCall({ ...newCall, callerPhone: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.emergencyDispatchLock.callbackPhone', 'Callback Phone')}</label>
                    <input
                      type="tel"
                      value={newCall.callbackPhone || ''}
                      onChange={(e) => setNewCall({ ...newCall, callbackPhone: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.emergencyDispatchLock.location', 'Location')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">{t('tools.emergencyDispatchLock.address', 'Address *')}</label>
                    <input
                      type="text"
                      value={newCall.address || ''}
                      onChange={(e) => setNewCall({ ...newCall, address: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.emergencyDispatchLock.crossStreet', 'Cross Street')}</label>
                    <input
                      type="text"
                      value={newCall.crossStreet || ''}
                      onChange={(e) => setNewCall({ ...newCall, crossStreet: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.emergencyDispatchLock.city', 'City')}</label>
                    <input
                      type="text"
                      value={newCall.city || ''}
                      onChange={(e) => setNewCall({ ...newCall, city: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.emergencyDispatchLock.zipCode', 'ZIP Code')}</label>
                    <input
                      type="text"
                      value={newCall.zipCode || ''}
                      onChange={(e) => setNewCall({ ...newCall, zipCode: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.emergencyDispatchLock.locationNotes', 'Location Notes')}</label>
                    <input
                      type="text"
                      value={newCall.locationNotes || ''}
                      onChange={(e) => setNewCall({ ...newCall, locationNotes: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder={t('tools.emergencyDispatchLock.gateCodeAptEtc', 'Gate code, apt #, etc.')}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Type */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.emergencyDispatchLock.emergencyType', 'Emergency Type')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {EMERGENCY_TYPES.map(type => (
                    <button
                      key={type.type}
                      onClick={() => setNewCall({ ...newCall, emergencyType: type.type })}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        newCall.emergencyType === type.type
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {type.icon}
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                      <p className="text-xs text-gray-400">{formatCurrency(type.baseRate)} base</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.emergencyDispatchLock.priorityLevel', 'Priority Level')}</h3>
                <div className="flex gap-3">
                  {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                    <button
                      key={priority}
                      onClick={() => setNewCall({ ...newCall, priority: priority as any })}
                      className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                        newCall.priority === priority
                          ? `${config.border} ${config.bgColor}`
                          : isDark ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    >
                      <span className={`font-bold ${config.color}`}>{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.emergencyDispatchLock.description', 'Description')}</label>
                <textarea
                  value={newCall.description || ''}
                  onChange={(e) => setNewCall({ ...newCall, description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                  placeholder={t('tools.emergencyDispatchLock.describeTheEmergencySituation', 'Describe the emergency situation...')}
                />
              </div>

              {/* Estimated Cost */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <span className="font-medium">{t('tools.emergencyDispatchLock.estimatedCost', 'Estimated Cost:')}</span>
                <span className="text-2xl font-bold text-red-600">{formatCurrency(newCall.estimatedCost || 0)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={createEmergencyCall}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  <Siren className="w-4 h-4 inline mr-2" />
                  {t('tools.emergencyDispatchLock.createEmergencyCall', 'Create Emergency Call')}
                </button>
                <button
                  onClick={resetForm}
                  className={`px-6 py-3 rounded-lg font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {t('tools.emergencyDispatchLock.reset', 'Reset')}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technicians Tab */}
        {activeTab === 'technicians' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map(tech => {
              const statusColors = {
                available: 'bg-green-100 text-green-700 border-green-500',
                on_call: 'bg-blue-100 text-blue-700 border-blue-500',
                busy: 'bg-orange-100 text-orange-700 border-orange-500',
                offline: 'bg-gray-100 text-gray-700 border-gray-500',
              };

              return (
                <Card key={tech.id} className={`${cardClass} border-l-4 ${statusColors[tech.status].split(' ')[2]}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold">{tech.name}</h3>
                        <p className="text-sm text-gray-400">{tech.phone}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[tech.status]}`}>
                        {tech.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      {tech.currentLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{tech.currentLocation}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {tech.completedToday} today
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-4 h-4 text-blue-500" />
                          {tech.avgResponseTime}m avg
                        </span>
                      </div>

                      {tech.activeCallId && (
                        <p className="text-orange-500 font-medium">On Call: {tech.activeCallId}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t('tools.emergencyDispatchLock.callHistory', 'Call History')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.emergencyDispatchLock.searchCalls', 'Search calls...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className={`px-4 py-2 rounded-lg border ${inputClass}`}
                >
                  <option value="all">{t('tools.emergencyDispatchLock.allStatus', 'All Status')}</option>
                  <option value="active">{t('tools.emergencyDispatchLock.activeOnly', 'Active Only')}</option>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <option key={status} value={status}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {filteredCalls.map(call => (
                  <div
                    key={call.id}
                    className={`p-3 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-sm font-bold">{call.callId}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span>{call.callerName}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span className="text-sm">{EMERGENCY_TYPES.find(t => t.type === call.emergencyType)?.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG[call.status].bgColor} ${STATUS_CONFIG[call.status].color}`}>
                          {STATUS_CONFIG[call.status].label}
                        </span>
                        <span className="text-sm text-gray-400">{formatDate(call.receivedAt)}</span>
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
                <BarChart3 className="w-5 h-5" />
                {t('tools.emergencyDispatchLock.dispatchReports', 'Dispatch Reports')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-4">{t('tools.emergencyDispatchLock.callsByType', 'Calls by Type')}</h4>
                  {EMERGENCY_TYPES.map(type => {
                    const count = emergencyCalls.filter(c => c.emergencyType === type.type).length;
                    if (count === 0) return null;
                    return (
                      <div key={type.type} className="flex justify-between py-2 border-b border-gray-600/20 last:border-0">
                        <span className="flex items-center gap-2">{type.icon} {type.label}</span>
                        <span className="font-mono">{count}</span>
                      </div>
                    );
                  })}
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-4">{t('tools.emergencyDispatchLock.callsByStatus', 'Calls by Status')}</h4>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const count = emergencyCalls.filter(c => c.status === status).length;
                    return (
                      <div key={status} className="flex justify-between py-2 border-b border-gray-600/20 last:border-0">
                        <span className={`flex items-center gap-2 ${config.color}`}>{config.icon} {config.label}</span>
                        <span className="font-mono">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dispatch Modal */}
        {showDispatchModal && selectedCall && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className={`${cardClass} w-full max-w-lg`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Dispatch Technician
                  <button onClick={() => setShowDispatchModal(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="font-medium">{selectedCall.callId}</p>
                  <p className="text-sm">{selectedCall.callerName} - {selectedCall.address}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('tools.emergencyDispatchLock.selectTechnician', 'Select Technician')}</label>
                  <div className="space-y-2">
                    {technicians.filter(t => t.status === 'available' || t.status === 'on_call').map(tech => (
                      <button
                        key={tech.id}
                        onClick={() => dispatchTechnician(selectedCall.id, tech.id, '20 min')}
                        className={`w-full p-3 rounded-lg border text-left hover:border-blue-500 transition-colors ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{tech.name}</p>
                            <p className="text-sm text-gray-400">{tech.currentLocation} - ~{tech.avgResponseTime} min response</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
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
    </div>
  );
}

export default EmergencyDispatchLockTool;
