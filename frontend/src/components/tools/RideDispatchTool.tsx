'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  Car,
  MapPin,
  Clock,
  User,
  Phone,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  AlertTriangle,
  Navigation,
  Sparkles,
  Filter,
  Activity,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Timer,
  RefreshCw,
} from 'lucide-react';

// Types
interface Ride {
  id: string;
  bookingId: string;
  passengerName: string;
  passengerPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  status: 'pending' | 'assigned' | 'en-route' | 'picked-up' | 'completed' | 'cancelled' | 'no-show';
  priority: 'normal' | 'high' | 'vip';
  vehicleType: 'sedan' | 'suv' | 'luxury' | 'van' | 'limo';
  estimatedFare: number;
  actualFare: number | null;
  driverId: string | null;
  driverName: string | null;
  vehicleId: string | null;
  notes: string;
  passengers: number;
  createdAt: string;
  updatedAt: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleType: 'sedan' | 'suv' | 'luxury' | 'van' | 'limo';
  status: 'available' | 'on-ride' | 'offline' | 'break';
  currentLocation: string;
  rating: number;
  ridesCompleted: number;
}

type TabType = 'dispatch' | 'drivers' | 'history';

// Column configurations for export
const rideColumns: ColumnConfig[] = [
  { key: 'bookingId', header: 'Booking ID', type: 'string' },
  { key: 'passengerName', header: 'Passenger', type: 'string' },
  { key: 'passengerPhone', header: 'Phone', type: 'string' },
  { key: 'pickupLocation', header: 'Pickup', type: 'string' },
  { key: 'dropoffLocation', header: 'Drop-off', type: 'string' },
  { key: 'pickupTime', header: 'Pickup Time', type: 'datetime' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'vehicleType', header: 'Vehicle Type', type: 'string' },
  { key: 'estimatedFare', header: 'Est. Fare', type: 'currency' },
  { key: 'actualFare', header: 'Actual Fare', type: 'currency' },
  { key: 'driverName', header: 'Driver', type: 'string' },
  { key: 'passengers', header: 'Passengers', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const driverColumns: ColumnConfig[] = [
  { key: 'name', header: 'Driver Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'vehiclePlate', header: 'Vehicle Plate', type: 'string' },
  { key: 'vehicleType', header: 'Vehicle Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'currentLocation', header: 'Current Location', type: 'string' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'ridesCompleted', header: 'Rides Completed', type: 'number' },
];

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'van', label: 'Van' },
  { value: 'limo', label: 'Limousine' },
];

const RIDE_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'assigned', label: 'Assigned', color: 'blue' },
  { value: 'en-route', label: 'En Route', color: 'indigo' },
  { value: 'picked-up', label: 'Picked Up', color: 'purple' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'no-show', label: 'No Show', color: 'gray' },
];

const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High Priority' },
  { value: 'vip', label: 'VIP' },
];

const generateId = () => `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Sample data
const generateSampleData = () => {
  const sampleRides: Ride[] = [
    {
      id: generateId(),
      bookingId: 'BK001',
      passengerName: 'John Smith',
      passengerPhone: '+1 (555) 123-4567',
      pickupLocation: '123 Main Street, Downtown',
      dropoffLocation: 'Airport Terminal 1',
      pickupTime: new Date(Date.now() + 30 * 60000).toISOString(),
      status: 'pending',
      priority: 'high',
      vehicleType: 'sedan',
      estimatedFare: 45.00,
      actualFare: null,
      driverId: null,
      driverName: null,
      vehicleId: null,
      notes: 'Airport pickup - flight UA123',
      passengers: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      bookingId: 'BK002',
      passengerName: 'Sarah Johnson',
      passengerPhone: '+1 (555) 234-5678',
      pickupLocation: 'Grand Hotel, 5th Avenue',
      dropoffLocation: 'Convention Center',
      pickupTime: new Date(Date.now() + 15 * 60000).toISOString(),
      status: 'assigned',
      priority: 'vip',
      vehicleType: 'luxury',
      estimatedFare: 35.00,
      actualFare: null,
      driverId: 'd1',
      driverName: 'Mike Wilson',
      vehicleId: 'v1',
      notes: 'VIP client - corporate account',
      passengers: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleDrivers: Driver[] = [
    {
      id: 'd1',
      name: 'Mike Wilson',
      phone: '+1 (555) 111-2222',
      vehicleId: 'v1',
      vehiclePlate: 'ABC-1234',
      vehicleType: 'luxury',
      status: 'on-ride',
      currentLocation: 'Downtown Area',
      rating: 4.9,
      ridesCompleted: 1250,
    },
    {
      id: 'd2',
      name: 'Emily Davis',
      phone: '+1 (555) 333-4444',
      vehicleId: 'v2',
      vehiclePlate: 'XYZ-5678',
      vehicleType: 'sedan',
      status: 'available',
      currentLocation: 'North Side',
      rating: 4.8,
      ridesCompleted: 890,
    },
    {
      id: 'd3',
      name: 'Carlos Rodriguez',
      phone: '+1 (555) 555-6666',
      vehicleId: 'v3',
      vehiclePlate: 'DEF-9012',
      vehicleType: 'suv',
      status: 'available',
      currentLocation: 'Airport Area',
      rating: 4.7,
      ridesCompleted: 650,
    },
  ];

  return { rides: sampleRides, drivers: sampleDrivers };
};

interface RideDispatchToolProps {
  uiConfig?: UIConfig;
}

export const RideDispatchTool: React.FC<RideDispatchToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<TabType>('dispatch');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddRide, setShowAddRide] = useState(false);
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showAssignDriver, setShowAssignDriver] = useState(false);

  // UseToolData hooks
  const {
    data: rides,
    addItem: addRide,
    updateItem: updateRide,
    deleteItem: deleteRide,
    isLoading: ridesLoading,
    isSaving: ridesSaving,
    isSynced: ridesSynced,
    lastSaved: ridesLastSaved,
    syncError: ridesSyncError,
    forceSync: forceRidesSync,
  } = useToolData<Ride>('ride-dispatch-rides', [], rideColumns);

  const {
    data: drivers,
    addItem: addDriver,
    updateItem: updateDriver,
    deleteItem: deleteDriver,
    isLoading: driversLoading,
  } = useToolData<Driver>('ride-dispatch-drivers', [], driverColumns);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData && Object.keys(uiConfig.prefillData).length > 0) {
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  // Load sample data if empty
  useEffect(() => {
    if (!ridesLoading && !driversLoading && rides.length === 0 && drivers.length === 0) {
      const sample = generateSampleData();
      sample.rides.forEach(r => addRide(r));
      sample.drivers.forEach(d => addDriver(d));
    }
  }, [ridesLoading, driversLoading, rides.length, drivers.length, addRide, addDriver]);

  // New ride form state
  const [newRide, setNewRide] = useState<Partial<Ride>>({
    passengerName: '',
    passengerPhone: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupTime: '',
    priority: 'normal',
    vehicleType: 'sedan',
    estimatedFare: 0,
    passengers: 1,
    notes: '',
  });

  // Filtered rides
  const filteredRides = useMemo(() => {
    return rides.filter(ride => {
      const matchesSearch =
        ride.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rides, searchTerm, statusFilter]);

  // Available drivers
  const availableDrivers = useMemo(() => {
    return drivers.filter(d => d.status === 'available');
  }, [drivers]);

  // Statistics
  const stats = useMemo(() => {
    const pending = rides.filter(r => r.status === 'pending').length;
    const inProgress = rides.filter(r => ['assigned', 'en-route', 'picked-up'].includes(r.status)).length;
    const completed = rides.filter(r => r.status === 'completed').length;
    const activeDrivers = drivers.filter(d => d.status === 'available' || d.status === 'on-ride').length;
    return { pending, inProgress, completed, activeDrivers };
  }, [rides, drivers]);

  // Handle add ride
  const handleAddRide = () => {
    if (!newRide.passengerName || !newRide.pickupLocation || !newRide.dropoffLocation) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const ride: Ride = {
      id: generateId(),
      bookingId: `BK${String(rides.length + 1).padStart(3, '0')}`,
      passengerName: newRide.passengerName || '',
      passengerPhone: newRide.passengerPhone || '',
      pickupLocation: newRide.pickupLocation || '',
      dropoffLocation: newRide.dropoffLocation || '',
      pickupTime: newRide.pickupTime || new Date().toISOString(),
      status: 'pending',
      priority: newRide.priority as Ride['priority'] || 'normal',
      vehicleType: newRide.vehicleType as Ride['vehicleType'] || 'sedan',
      estimatedFare: newRide.estimatedFare || 0,
      actualFare: null,
      driverId: null,
      driverName: null,
      vehicleId: null,
      notes: newRide.notes || '',
      passengers: newRide.passengers || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRide(ride);
    setShowAddRide(false);
    setNewRide({
      passengerName: '',
      passengerPhone: '',
      pickupLocation: '',
      dropoffLocation: '',
      pickupTime: '',
      priority: 'normal',
      vehicleType: 'sedan',
      estimatedFare: 0,
      passengers: 1,
      notes: '',
    });
  };

  // Handle assign driver
  const handleAssignDriver = (rideId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      updateRide(rideId, {
        driverId: driver.id,
        driverName: driver.name,
        vehicleId: driver.vehicleId,
        status: 'assigned',
        updatedAt: new Date().toISOString(),
      });
      updateDriver(driverId, { status: 'on-ride' });
    }
    setShowAssignDriver(false);
    setSelectedRide(null);
  };

  // Handle status update
  const handleStatusUpdate = (rideId: string, newStatus: Ride['status']) => {
    const ride = rides.find(r => r.id === rideId);
    if (ride && newStatus === 'completed' && ride.driverId) {
      updateDriver(ride.driverId, { status: 'available' });
    }
    updateRide(rideId, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  const getStatusColor = (status: string) => {
    const statusInfo = RIDE_STATUSES.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      blue: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
      indigo: isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-800',
      purple: isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800',
      green: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      red: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
      gray: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
    };
    return colors[statusInfo?.color || 'gray'];
  };

  return (
    <>
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.rideDispatch.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.rideDispatch.rideDispatch', 'Ride Dispatch')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.rideDispatch.manageAndDispatchRidesTo', 'Manage and dispatch rides to drivers in real-time')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="ride-dispatch" toolName="Ride Dispatch" />

              <SyncStatus
                isSynced={ridesSynced}
                isSaving={ridesSaving}
                lastSaved={ridesLastSaved}
                syncError={ridesSyncError}
                onForceSync={forceRidesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(rides, rideColumns, { filename: 'ride-dispatch' })}
                onExportExcel={() => exportToExcel(rides, rideColumns, { filename: 'ride-dispatch' })}
                onExportJSON={() => exportToJSON(rides, { filename: 'ride-dispatch' })}
                onExportPDF={async () => await exportToPDF(rides, rideColumns, { filename: 'ride-dispatch', title: 'Ride Dispatch Report' })}
                onPrint={() => printData(rides, rideColumns, { title: 'Ride Dispatch' })}
                onCopyToClipboard={async () => await copyUtil(rides, rideColumns, 'tab')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-yellow-500" />
                <span className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{t('tools.rideDispatch.pending', 'Pending')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.pending}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{t('tools.rideDispatch.inProgress', 'In Progress')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{stats.inProgress}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>{t('tools.rideDispatch.completed', 'Completed')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{stats.completed}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>{t('tools.rideDispatch.activeDrivers', 'Active Drivers')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{stats.activeDrivers}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'dispatch', label: 'Dispatch Queue', icon: <Navigation className="w-4 h-4" /> },
              { id: 'drivers', label: 'Drivers', icon: <Users className="w-4 h-4" /> },
              { id: 'history', label: 'Ride History', icon: <Clock className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dispatch Queue Tab */}
        {activeTab === 'dispatch' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.rideDispatch.searchRides', 'Search rides...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="all">{t('tools.rideDispatch.allStatuses', 'All Statuses')}</option>
                {RIDE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddRide(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.rideDispatch.newRide2', 'New Ride')}
              </button>
            </div>

            {/* Rides List */}
            <div className="space-y-4">
              {filteredRides.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.rideDispatch.noRidesFound', 'No rides found')}</p>
                </div>
              ) : (
                filteredRides.map((ride) => (
                  <div
                    key={ride.id}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {ride.bookingId}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ride.status)}`}>
                            {RIDE_STATUSES.find(s => s.value === ride.status)?.label}
                          </span>
                          {ride.priority !== 'normal' && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              ride.priority === 'vip'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {ride.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-[#0D9488]" />
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {ride.passengerName}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({ride.passengers} passenger{ride.passengers > 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-green-500" />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{ride.pickupLocation}</span>
                          </div>
                          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>→</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{ride.dropoffLocation}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {new Date(ride.pickupTime).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Car className="w-4 h-4 text-purple-500" />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {VEHICLE_TYPES.find(v => v.value === ride.vehicleType)?.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              ${ride.estimatedFare.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {ride.driverName && (
                          <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Assigned to: <span className="font-medium">{ride.driverName}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {ride.status === 'pending' && (
                          <button
                            onClick={() => { setSelectedRide(ride); setShowAssignDriver(true); }}
                            className="px-3 py-1.5 bg-[#0D9488] text-white rounded text-sm hover:bg-[#0F766E] transition-colors"
                          >
                            {t('tools.rideDispatch.assignDriver2', 'Assign Driver')}
                          </button>
                        )}
                        {ride.status === 'assigned' && (
                          <button
                            onClick={() => handleStatusUpdate(ride.id, 'en-route')}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            {t('tools.rideDispatch.markEnRoute', 'Mark En Route')}
                          </button>
                        )}
                        {ride.status === 'en-route' && (
                          <button
                            onClick={() => handleStatusUpdate(ride.id, 'picked-up')}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                          >
                            {t('tools.rideDispatch.markPickedUp', 'Mark Picked Up')}
                          </button>
                        )}
                        {ride.status === 'picked-up' && (
                          <button
                            onClick={() => handleStatusUpdate(ride.id, 'completed')}
                            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            {t('tools.rideDispatch.completeRide', 'Complete Ride')}
                          </button>
                        )}
                        {['pending', 'assigned'].includes(ride.status) && (
                          <button
                            onClick={() => handleStatusUpdate(ride.id, 'cancelled')}
                            className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            {t('tools.rideDispatch.cancel', 'Cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.rideDispatch.driverStatus', 'Driver Status')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{driver.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{driver.phone}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      driver.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : driver.status === 'on-ride'
                        ? 'bg-blue-100 text-blue-800'
                        : driver.status === 'break'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p>Vehicle: {driver.vehiclePlate} ({VEHICLE_TYPES.find(v => v.value === driver.vehicleType)?.label})</p>
                    <p>Location: {driver.currentLocation}</p>
                    <p>Rating: {driver.rating}/5.0 | Rides: {driver.ridesCompleted}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.rideDispatch.completedRides', 'Completed Rides')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.rideDispatch.booking', 'Booking')}</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.rideDispatch.passenger', 'Passenger')}</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.rideDispatch.route', 'Route')}</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.rideDispatch.driver', 'Driver')}</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.rideDispatch.fare', 'Fare')}</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">{t('tools.rideDispatch.status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.filter(r => ['completed', 'cancelled', 'no-show'].includes(r.status)).map((ride) => (
                    <tr key={ride.id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`py-2 px-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{ride.bookingId}</td>
                      <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{ride.passengerName}</td>
                      <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {ride.pickupLocation} → {ride.dropoffLocation}
                      </td>
                      <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{ride.driverName || '-'}</td>
                      <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        ${(ride.actualFare || ride.estimatedFare).toFixed(2)}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {RIDE_STATUSES.find(s => s.value === ride.status)?.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Ride Modal */}
        {showAddRide && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rideDispatch.newRide', 'New Ride')}</h2>
                <button onClick={() => setShowAddRide(false)}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.rideDispatch.passengerName', 'Passenger Name *')}
                  </label>
                  <input
                    type="text"
                    value={newRide.passengerName || ''}
                    onChange={(e) => setNewRide({ ...newRide, passengerName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.rideDispatch.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newRide.passengerPhone || ''}
                    onChange={(e) => setNewRide({ ...newRide, passengerPhone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.rideDispatch.pickupLocation', 'Pickup Location *')}
                  </label>
                  <input
                    type="text"
                    value={newRide.pickupLocation || ''}
                    onChange={(e) => setNewRide({ ...newRide, pickupLocation: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.rideDispatch.dropOffLocation', 'Drop-off Location *')}
                  </label>
                  <input
                    type="text"
                    value={newRide.dropoffLocation || ''}
                    onChange={(e) => setNewRide({ ...newRide, dropoffLocation: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.rideDispatch.pickupTime', 'Pickup Time')}
                    </label>
                    <input
                      type="datetime-local"
                      value={newRide.pickupTime || ''}
                      onChange={(e) => setNewRide({ ...newRide, pickupTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.rideDispatch.passengers', 'Passengers')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newRide.passengers || 1}
                      onChange={(e) => setNewRide({ ...newRide, passengers: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.rideDispatch.vehicleType', 'Vehicle Type')}
                    </label>
                    <select
                      value={newRide.vehicleType || 'sedan'}
                      onChange={(e) => setNewRide({ ...newRide, vehicleType: e.target.value as Ride['vehicleType'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {VEHICLE_TYPES.map((v) => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.rideDispatch.priority', 'Priority')}
                    </label>
                    <select
                      value={newRide.priority || 'normal'}
                      onChange={(e) => setNewRide({ ...newRide, priority: e.target.value as Ride['priority'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.rideDispatch.estimatedFare', 'Estimated Fare ($)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newRide.estimatedFare || 0}
                    onChange={(e) => setNewRide({ ...newRide, estimatedFare: parseFloat(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.rideDispatch.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newRide.notes || ''}
                    onChange={(e) => setNewRide({ ...newRide, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddRide(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.rideDispatch.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddRide}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                >
                  {t('tools.rideDispatch.addRide', 'Add Ride')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Driver Modal */}
        {showAssignDriver && selectedRide && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rideDispatch.assignDriver', 'Assign Driver')}</h2>
                <button onClick={() => { setShowAssignDriver(false); setSelectedRide(null); }}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Select an available driver for booking {selectedRide.bookingId}
              </p>
              <div className="space-y-2">
                {availableDrivers.length === 0 ? (
                  <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.rideDispatch.noDriversAvailable', 'No drivers available')}
                  </p>
                ) : (
                  availableDrivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => handleAssignDriver(selectedRide.id, driver.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{driver.name}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {driver.vehiclePlate} - {VEHICLE_TYPES.find(v => v.value === driver.vehicleType)?.label}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {driver.rating}/5.0
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {driver.currentLocation}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
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

export default RideDispatchTool;
