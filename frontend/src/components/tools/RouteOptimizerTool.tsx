'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Navigation,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Clock,
  Fuel,
  DollarSign,
  Truck,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Route,
  Target,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Map,
  Settings,
  Play,
  Pause,
  RotateCcw,
  GripVertical,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface Stop {
  id: string;
  order: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: 'pickup' | 'delivery' | 'fuel' | 'rest' | 'checkpoint';
  scheduledTime: string;
  timeWindow: string;
  estimatedArrival?: string;
  actualArrival?: string;
  dwellTime: number;
  priority: 'low' | 'normal' | 'high';
  notes: string;
  completed: boolean;
}

interface DeliveryRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  status: 'planning' | 'optimizing' | 'ready' | 'in-progress' | 'completed' | 'cancelled';
  date: string;
  driverName: string;
  driverPhone: string;
  vehicleId: string;
  vehicleType: string;
  stops: Stop[];
  totalDistance: number;
  totalTime: number;
  estimatedFuelCost: number;
  fuelEfficiency: number;
  startLocation: string;
  endLocation: string;
  returnToStart: boolean;
  optimizationGoal: 'distance' | 'time' | 'fuel' | 'balanced';
  avoidTolls: boolean;
  avoidHighways: boolean;
  maxDrivingHours: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'routes' | 'optimizer' | 'analytics' | 'settings';

const ROUTE_STATUSES: { value: DeliveryRoute['status']; label: string; color: string }[] = [
  { value: 'planning', label: 'Planning', color: 'gray' },
  { value: 'optimizing', label: 'Optimizing', color: 'yellow' },
  { value: 'ready', label: 'Ready', color: 'blue' },
  { value: 'in-progress', label: 'In Progress', color: 'purple' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const STOP_TYPES: { value: Stop['type']; label: string; icon: string }[] = [
  { value: 'pickup', label: 'Pickup', icon: 'package' },
  { value: 'delivery', label: 'Delivery', icon: 'map-pin' },
  { value: 'fuel', label: 'Fuel Stop', icon: 'fuel' },
  { value: 'rest', label: 'Rest Stop', icon: 'coffee' },
  { value: 'checkpoint', label: 'Checkpoint', icon: 'flag' },
];

const OPTIMIZATION_GOALS: { value: DeliveryRoute['optimizationGoal']; label: string; description: string }[] = [
  { value: 'distance', label: 'Shortest Distance', description: 'Minimize total miles driven' },
  { value: 'time', label: 'Fastest Route', description: 'Minimize total driving time' },
  { value: 'fuel', label: 'Fuel Efficient', description: 'Minimize fuel consumption' },
  { value: 'balanced', label: 'Balanced', description: 'Balance time, distance, and cost' },
];

const VEHICLE_TYPES = ['Dry Van', 'Reefer', 'Flatbed', 'Box Truck', 'Sprinter Van', 'Pickup Truck'];

// Column configuration for exports
const ROUTE_COLUMNS: ColumnConfig[] = [
  { key: 'routeNumber', header: 'Route #', type: 'string' },
  { key: 'routeName', header: 'Route Name', type: 'string' },
  { key: 'status', header: 'Status', type: 'string', format: (value) => ROUTE_STATUSES.find(s => s.value === value)?.label || value },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'driverName', header: 'Driver', type: 'string' },
  { key: 'vehicleType', header: 'Vehicle', type: 'string' },
  { key: 'totalDistance', header: 'Distance (mi)', type: 'number' },
  { key: 'totalTime', header: 'Time (hrs)', type: 'number' },
  { key: 'estimatedFuelCost', header: 'Fuel Cost', type: 'currency' },
  { key: 'startLocation', header: 'Start', type: 'string' },
  { key: 'endLocation', header: 'End', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Sample data
const generateSampleData = (): DeliveryRoute[] => [
  {
    id: '1',
    routeNumber: 'RT-2025-0001',
    routeName: 'Phoenix Metro Daily',
    status: 'in-progress',
    date: '2025-01-02',
    driverName: 'John Smith',
    driverPhone: '+1 (555) 123-4567',
    vehicleId: 'VH-101',
    vehicleType: 'Box Truck',
    stops: [
      { id: '1', order: 1, name: 'Warehouse A', address: '123 Industrial Blvd', city: 'Phoenix', state: 'AZ', zip: '85001', type: 'pickup', scheduledTime: '06:00', timeWindow: '06:00-08:00', estimatedArrival: '06:00', dwellTime: 30, priority: 'high', notes: 'Load all priority items first', completed: true },
      { id: '2', order: 2, name: 'Customer 1 - ABC Corp', address: '456 Commerce St', city: 'Tempe', state: 'AZ', zip: '85281', type: 'delivery', scheduledTime: '08:30', timeWindow: '08:00-10:00', estimatedArrival: '08:25', dwellTime: 15, priority: 'normal', notes: 'Dock door 3', completed: true },
      { id: '3', order: 3, name: 'Customer 2 - XYZ Inc', address: '789 Main Ave', city: 'Mesa', state: 'AZ', zip: '85201', type: 'delivery', scheduledTime: '10:00', timeWindow: '09:00-11:00', estimatedArrival: '09:45', dwellTime: 20, priority: 'high', notes: 'Call 30 min before arrival', completed: false },
      { id: '4', order: 4, name: 'Quick Fuel Stop', address: '101 Highway 60', city: 'Apache Junction', state: 'AZ', zip: '85120', type: 'fuel', scheduledTime: '11:00', timeWindow: '', dwellTime: 15, priority: 'low', notes: '', completed: false },
      { id: '5', order: 5, name: 'Customer 3 - 123 Store', address: '202 Retail Plaza', city: 'Gilbert', state: 'AZ', zip: '85295', type: 'delivery', scheduledTime: '12:30', timeWindow: '12:00-14:00', estimatedArrival: '12:15', dwellTime: 25, priority: 'normal', notes: 'Rear entrance only', completed: false },
    ],
    totalDistance: 78,
    totalTime: 5.5,
    estimatedFuelCost: 42.50,
    fuelEfficiency: 8.5,
    startLocation: 'Phoenix, AZ',
    endLocation: 'Phoenix, AZ',
    returnToStart: true,
    optimizationGoal: 'balanced',
    avoidTolls: false,
    avoidHighways: false,
    maxDrivingHours: 11,
    notes: 'Standard metro route - all regular customers',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    routeNumber: 'RT-2025-0002',
    routeName: 'Tucson Express',
    status: 'ready',
    date: '2025-01-03',
    driverName: 'Sarah Davis',
    driverPhone: '+1 (555) 234-5678',
    vehicleId: 'VH-105',
    vehicleType: 'Dry Van',
    stops: [
      { id: '1', order: 1, name: 'Distribution Center', address: '500 Logistics Way', city: 'Phoenix', state: 'AZ', zip: '85043', type: 'pickup', scheduledTime: '05:00', timeWindow: '05:00-06:00', dwellTime: 45, priority: 'high', notes: 'Priority freight', completed: false },
      { id: '2', order: 2, name: 'Tucson Hub', address: '800 Commerce Dr', city: 'Tucson', state: 'AZ', zip: '85701', type: 'delivery', scheduledTime: '08:00', timeWindow: '07:30-09:30', dwellTime: 60, priority: 'high', notes: 'Time-critical delivery', completed: false },
    ],
    totalDistance: 220,
    totalTime: 4.0,
    estimatedFuelCost: 85.00,
    fuelEfficiency: 7.2,
    startLocation: 'Phoenix, AZ',
    endLocation: 'Tucson, AZ',
    returnToStart: false,
    optimizationGoal: 'time',
    avoidTolls: true,
    avoidHighways: false,
    maxDrivingHours: 11,
    notes: 'Express run to Tucson',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const emptyRoute: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> = {
  routeNumber: '',
  routeName: '',
  status: 'planning',
  date: new Date().toISOString().split('T')[0],
  driverName: '',
  driverPhone: '',
  vehicleId: '',
  vehicleType: '',
  stops: [],
  totalDistance: 0,
  totalTime: 0,
  estimatedFuelCost: 0,
  fuelEfficiency: 8,
  startLocation: '',
  endLocation: '',
  returnToStart: true,
  optimizationGoal: 'balanced',
  avoidTolls: false,
  avoidHighways: false,
  maxDrivingHours: 11,
  notes: '',
};

const emptyStop: Omit<Stop, 'id' | 'order'> = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  type: 'delivery',
  scheduledTime: '',
  timeWindow: '',
  dwellTime: 15,
  priority: 'normal',
  notes: '',
  completed: false,
};

export default function RouteOptimizerTool() {
  const { t } = useTranslation();
  const {
    data: routes,
    isLoading,
    syncState,
    addItem,
    updateItem,
    deleteItem,
    refresh,
  } = useToolData<DeliveryRoute>('route-optimizer', generateSampleData);

  const [activeTab, setActiveTab] = useState<TabType>('routes');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<DeliveryRoute | null>(null);
  const [formData, setFormData] = useState<Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'>>(emptyRoute);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [newStop, setNewStop] = useState<Omit<Stop, 'id' | 'order'>>(emptyStop);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchesSearch =
        route.routeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.driverName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [routes, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalRoutes = routes.length;
    const activeRoutes = routes.filter((r) => r.status === 'in-progress').length;
    const totalDistance = routes.reduce((sum, r) => sum + r.totalDistance, 0);
    const totalFuelCost = routes.reduce((sum, r) => sum + r.estimatedFuelCost, 0);
    const avgStops = routes.length > 0
      ? Math.round(routes.reduce((sum, r) => sum + r.stops.length, 0) / routes.length)
      : 0;
    return { totalRoutes, activeRoutes, totalDistance, totalFuelCost, avgStops };
  }, [routes]);

  const handleSubmit = async () => {
    const now = new Date().toISOString();
    if (editingRoute) {
      await updateItem(editingRoute.id, { ...formData, updatedAt: now });
    } else {
      await addItem({
        ...formData,
        id: `route-${Date.now()}`,
        routeNumber: formData.routeNumber || `RT-${new Date().getFullYear()}-${String(routes.length + 1).padStart(4, '0')}`,
        createdAt: now,
        updatedAt: now,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyRoute);
    setEditingRoute(null);
    setIsFormOpen(false);
    setNewStop(emptyStop);
  };

  const handleEdit = (route: DeliveryRoute) => {
    setEditingRoute(route);
    setFormData({ ...route });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Route',
      message: 'Are you sure you want to delete this route?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteItem(id);
    }
  };

  const addStopToRoute = () => {
    if (!newStop.name || !newStop.address) return;
    const stop: Stop = {
      ...newStop,
      id: `stop-${Date.now()}`,
      order: formData.stops.length + 1,
    };
    setFormData({
      ...formData,
      stops: [...formData.stops, stop],
    });
    setNewStop(emptyStop);
  };

  const removeStopFromRoute = (stopId: string) => {
    const newStops = formData.stops
      .filter((s) => s.id !== stopId)
      .map((s, idx) => ({ ...s, order: idx + 1 }));
    setFormData({ ...formData, stops: newStops });
  };

  const moveStop = (stopId: string, direction: 'up' | 'down') => {
    const idx = formData.stops.findIndex((s) => s.id === stopId);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === formData.stops.length - 1)) {
      return;
    }
    const newStops = [...formData.stops];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newStops[idx], newStops[swapIdx]] = [newStops[swapIdx], newStops[idx]];
    setFormData({
      ...formData,
      stops: newStops.map((s, i) => ({ ...s, order: i + 1 })),
    });
  };

  const optimizeRoute = async () => {
    setIsOptimizing(true);
    // Simulate optimization delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Simple optimization: just reorder by priority then by city
    const sortedStops = [...formData.stops].sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    setFormData({
      ...formData,
      stops: sortedStops.map((s, i) => ({ ...s, order: i + 1 })),
      status: 'ready',
    });
    setIsOptimizing(false);
  };

  const getStatusColor = (status: DeliveryRoute['status']) => {
    const s = ROUTE_STATUSES.find((st) => st.value === status);
    return s?.color || 'gray';
  };

  const selectedRoute = selectedRouteId ? routes.find((r) => r.id === selectedRouteId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Navigation className="w-7 h-7 text-blue-600" />
            {t('tools.routeOptimizer.routeOptimizer', 'Route Optimizer')}
          </h1>
          <p className="text-gray-600 mt-1">{t('tools.routeOptimizer.planAndOptimizeDeliveryRoutes', 'Plan and optimize delivery routes')}</p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="route-optimizer" toolName="Route Optimizer" />

          <SyncStatus state={syncState} onRetry={refresh} />
          <ExportDropdown
            data={filteredRoutes}
            filename="route-optimizer"
            columns={ROUTE_COLUMNS}
          />
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.routeOptimizer.newRoute', 'New Route')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Route className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.routeOptimizer.totalRoutes', 'Total Routes')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalRoutes}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.routeOptimizer.active', 'Active')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeRoutes}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Navigation className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.routeOptimizer.totalMiles', 'Total Miles')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalDistance.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Fuel className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.routeOptimizer.fuelCost', 'Fuel Cost')}</p>
              <p className="text-xl font-bold text-gray-900">${stats.totalFuelCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <MapPin className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.routeOptimizer.avgStops', 'Avg Stops')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.avgStops}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {(['routes', 'optimizer', 'analytics', 'settings'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'routes' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.routeOptimizer.searchRoutes', 'Search routes...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">{t('tools.routeOptimizer.allStatuses', 'All Statuses')}</option>
            {ROUTE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Routes List */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          {filteredRoutes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Route className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t('tools.routeOptimizer.noRoutesFound', 'No routes found')}</h3>
              <p className="text-gray-500 mt-1">{t('tools.routeOptimizer.createANewRouteTo', 'Create a new route to get started')}</p>
            </div>
          ) : (
            filteredRoutes.map((route) => (
              <div
                key={route.id}
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer transition-all ${
                  selectedRouteId === route.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRouteId(selectedRouteId === route.id ? null : route.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{route.routeNumber}</span>
                        <span className="text-sm text-gray-500">{route.routeName}</span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(route.status)}-100 text-${getStatusColor(route.status)}-700`}
                      >
                        {ROUTE_STATUSES.find((s) => s.value === route.status)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{route.totalDistance} mi</p>
                        <p className="text-sm text-gray-500">{route.totalTime} hrs</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(route);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(route.id);
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {route.startLocation}
                    </div>
                    <ArrowRight className="w-4 h-4" />
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {route.endLocation}
                    </div>
                    <span className="text-gray-400">|</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {route.date}
                    </div>
                    <span className="text-gray-400">|</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {route.stops.length} stops
                    </div>
                    <span className="text-gray-400">|</span>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      ${route.estimatedFuelCost.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Expanded Stop Details */}
                {selectedRouteId === route.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{t('tools.routeOptimizer.routeStops', 'Route Stops')}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Driver: {route.driverName}</span>
                        <span>|</span>
                        <span>Vehicle: {route.vehicleType}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {route.stops.map((stop, idx) => (
                        <div
                          key={stop.id}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            stop.completed ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                            {stop.order}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{stop.name}</p>
                              <span
                                className={`px-1.5 py-0.5 text-xs rounded ${
                                  stop.type === 'pickup'
                                    ? 'bg-blue-100 text-blue-700'
                                    : stop.type === 'delivery'
                                    ? 'bg-green-100 text-green-700'
                                    : stop.type === 'fuel'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {STOP_TYPES.find((t) => t.value === stop.type)?.label}
                              </span>
                              {stop.completed && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {stop.address}, {stop.city}, {stop.state} {stop.zip}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>Time: {stop.scheduledTime}</span>
                              {stop.timeWindow && <span>Window: {stop.timeWindow}</span>}
                              <span>Dwell: {stop.dwellTime} min</span>
                            </div>
                          </div>
                          {idx < route.stops.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                    {route.notes && (
                      <p className="mt-4 text-sm text-gray-500">
                        <span className="font-medium">{t('tools.routeOptimizer.notes', 'Notes:')}</span> {route.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Optimizer Tab */}
      {activeTab === 'optimizer' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            {t('tools.routeOptimizer.routeOptimizationEngine', 'Route Optimization Engine')}
          </h3>
          <p className="text-gray-600 mb-6">{t('tools.routeOptimizer.selectARouteAndChoose', 'Select a route and choose optimization parameters')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.selectRoute', 'Select Route')}</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">{t('tools.routeOptimizer.chooseARoute', 'Choose a route...')}</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.routeNumber} - {r.routeName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.routeOptimizer.optimizationGoal', 'Optimization Goal')}</label>
                <div className="space-y-2">
                  {OPTIMIZATION_GOALS.map((goal) => (
                    <label key={goal.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="goal" value={goal.value} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{goal.label}</p>
                        <p className="text-sm text-gray-500">{goal.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">{t('tools.routeOptimizer.constraints', 'Constraints')}</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">{t('tools.routeOptimizer.avoidTollRoads', 'Avoid toll roads')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">{t('tools.routeOptimizer.avoidHighways', 'Avoid highways')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">{t('tools.routeOptimizer.respectTimeWindows', 'Respect time windows')}</span>
                  </label>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Zap className="w-5 h-5" />
                {t('tools.routeOptimizer.optimizeRoute', 'Optimize Route')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            {t('tools.routeOptimizer.routeAnalytics', 'Route Analytics')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.routeOptimizer.totalDistanceThisMonth', 'Total Distance This Month')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDistance.toLocaleString()} mi</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.routeOptimizer.totalFuelCost', 'Total Fuel Cost')}</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalFuelCost.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.routeOptimizer.averageStopsPerRoute', 'Average Stops per Route')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgStops}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            {t('tools.routeOptimizer.routeSettings', 'Route Settings')}
          </h3>
          <p className="text-gray-600">{t('tools.routeOptimizer.configureDefaultOptimizationSettingsAnd', 'Configure default optimization settings and preferences...')}</p>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRoute ? t('tools.routeOptimizer.editRoute', 'Edit Route') : t('tools.routeOptimizer.newRoute2', 'New Route')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.routeNumber', 'Route Number')}</label>
                  <input
                    type="text"
                    value={formData.routeNumber}
                    onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })}
                    placeholder={t('tools.routeOptimizer.autoGenerated', 'Auto-generated')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.routeName', 'Route Name')}</label>
                  <input
                    type="text"
                    value={formData.routeName}
                    onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.date', 'Date')}</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.status', 'Status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DeliveryRoute['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {ROUTE_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Driver & Vehicle */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.driverName', 'Driver Name')}</label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.driverPhone', 'Driver Phone')}</label>
                  <input
                    type="tel"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.vehicleId', 'Vehicle ID')}</label>
                  <input
                    type="text"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.vehicleType', 'Vehicle Type')}</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('tools.routeOptimizer.selectType', 'Select type')}</option>
                    {VEHICLE_TYPES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.startLocation', 'Start Location')}</label>
                  <input
                    type="text"
                    value={formData.startLocation}
                    onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.endLocation', 'End Location')}</label>
                  <input
                    type="text"
                    value={formData.endLocation}
                    onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Route Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.distanceMi', 'Distance (mi)')}</label>
                  <input
                    type="number"
                    value={formData.totalDistance}
                    onChange={(e) => setFormData({ ...formData, totalDistance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.timeHrs', 'Time (hrs)')}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.totalTime}
                    onChange={(e) => setFormData({ ...formData, totalTime: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.fuelCost2', 'Fuel Cost ($)')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.estimatedFuelCost}
                    onChange={(e) => setFormData({ ...formData, estimatedFuelCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.mpg', 'MPG')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fuelEfficiency}
                    onChange={(e) => setFormData({ ...formData, fuelEfficiency: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.maxHours', 'Max Hours')}</label>
                  <input
                    type="number"
                    value={formData.maxDrivingHours}
                    onChange={(e) => setFormData({ ...formData, maxDrivingHours: parseInt(e.target.value) || 11 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Stops */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Route Stops ({formData.stops.length})</h3>
                  {formData.stops.length > 1 && (
                    <button
                      onClick={optimizeRoute}
                      disabled={isOptimizing}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                    >
                      {isOptimizing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          {t('tools.routeOptimizer.optimizing', 'Optimizing...')}
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          {t('tools.routeOptimizer.optimizeOrder', 'Optimize Order')}
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Current Stops */}
                <div className="space-y-2 mb-4">
                  {formData.stops.map((stop, idx) => (
                    <div key={stop.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                        {stop.order}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{stop.name}</p>
                        <p className="text-sm text-gray-500">{stop.city}, {stop.state}</p>
                      </div>
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                        {STOP_TYPES.find((t) => t.value === stop.type)?.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveStop(stop.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveStop(stop.id, 'down')}
                          disabled={idx === formData.stops.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeStopFromRoute(stop.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Stop */}
                <div className="p-3 border border-dashed border-gray-300 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder={t('tools.routeOptimizer.stopName', 'Stop Name')}
                        value={newStop.name}
                        onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder={t('tools.routeOptimizer.address', 'Address')}
                      value={newStop.address}
                      onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder={t('tools.routeOptimizer.city', 'City')}
                      value={newStop.city}
                      onChange={(e) => setNewStop({ ...newStop, city: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newStop.type}
                      onChange={(e) => setNewStop({ ...newStop, type: e.target.value as Stop['type'] })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {STOP_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={addStopToRoute}
                      disabled={!newStop.name || !newStop.address}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {t('tools.routeOptimizer.addStop', 'Add Stop')}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder={t('tools.routeOptimizer.state', 'State')}
                      value={newStop.state}
                      onChange={(e) => setNewStop({ ...newStop, state: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder={t('tools.routeOptimizer.zip', 'ZIP')}
                      value={newStop.zip}
                      onChange={(e) => setNewStop({ ...newStop, zip: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="time"
                      placeholder={t('tools.routeOptimizer.time', 'Time')}
                      value={newStop.scheduledTime}
                      onChange={(e) => setNewStop({ ...newStop, scheduledTime: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder={t('tools.routeOptimizer.dwellMin', 'Dwell (min)')}
                      value={newStop.dwellTime}
                      onChange={(e) => setNewStop({ ...newStop, dwellTime: parseInt(e.target.value) || 15 })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Options & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.returnToStart}
                        onChange={(e) => setFormData({ ...formData, returnToStart: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{t('tools.routeOptimizer.returnToStartLocation', 'Return to start location')}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.avoidTolls}
                        onChange={(e) => setFormData({ ...formData, avoidTolls: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{t('tools.routeOptimizer.avoidTollRoads2', 'Avoid toll roads')}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.avoidHighways}
                        onChange={(e) => setFormData({ ...formData, avoidHighways: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{t('tools.routeOptimizer.avoidHighways2', 'Avoid highways')}</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.routeOptimizer.notes2', 'Notes')}</label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('tools.routeOptimizer.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                {editingRoute ? t('tools.routeOptimizer.updateRoute', 'Update Route') : t('tools.routeOptimizer.createRoute', 'Create Route')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}

export { RouteOptimizerTool };
