'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Waves,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Navigation,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Truck,
  Route,
  Home,
  ArrowUpDown,
  Play,
  Pause,
  RotateCcw,
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

interface PoolServiceRouteToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type StopStatus = 'pending' | 'in-progress' | 'completed' | 'skipped' | 'rescheduled';
type RouteStatus = 'not-started' | 'in-progress' | 'completed' | 'paused';
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface RouteStop {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  poolType: 'residential' | 'commercial' | 'spa' | 'community';
  estimatedDuration: number; // in minutes
  status: StopStatus;
  notes: string;
  completedAt?: string;
  arrivalTime?: string;
  departureTime?: string;
  order: number;
}

interface ServiceRoute {
  id: string;
  name: string;
  dayOfWeek: DayOfWeek;
  assignedTechnician: string;
  technicianPhone: string;
  stops: string[]; // Array of stop IDs
  status: RouteStatus;
  startTime: string;
  endTime?: string;
  totalDistance?: number; // in miles
  date: string;
  notes: string;
  createdAt: string;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  available: boolean;
  vehicleId: string;
}

// Constants
const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const STOP_STATUS_COLORS: Record<StopStatus, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  skipped: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  rescheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const ROUTE_STATUS_COLORS: Record<RouteStatus, string> = {
  'not-started': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const POOL_TYPE_LABELS: Record<string, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  spa: 'Spa/Hot Tub',
  community: 'Community Pool',
};

// Column configuration for exports
const ROUTE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Route Name', type: 'string' },
  { key: 'dayOfWeek', header: 'Day', type: 'string' },
  { key: 'assignedTechnician', header: 'Technician', type: 'string' },
  { key: 'stopCount', header: 'Stops', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
];

const STOP_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'poolType', header: 'Pool Type', type: 'string' },
  { key: 'estimatedDuration', header: 'Est. Duration (min)', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'order', header: 'Order', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getTodayDayOfWeek = (): DayOfWeek => {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

// Main Component
export const PoolServiceRouteTool: React.FC<PoolServiceRouteToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hooks for backend sync
  const {
    data: routes,
    addItem: addRouteToBackend,
    updateItem: updateRouteBackend,
    deleteItem: deleteRouteBackend,
    isSynced: routesSynced,
    isSaving: routesSaving,
    lastSaved: routesLastSaved,
    syncError: routesSyncError,
    forceSync: forceRoutesSync,
  } = useToolData<ServiceRoute>('pool-service-routes', [], ROUTE_COLUMNS);

  const {
    data: stops,
    addItem: addStopToBackend,
    updateItem: updateStopBackend,
    deleteItem: deleteStopBackend,
    isSynced: stopsSynced,
    isSaving: stopsSaving,
    lastSaved: stopsLastSaved,
    syncError: stopsSyncError,
    forceSync: forceStopsSync,
  } = useToolData<RouteStop>('pool-service-stops', [], STOP_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'routes' | 'stops' | 'today'>('routes');
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showStopForm, setShowStopForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<ServiceRoute | null>(null);
  const [editingStop, setEditingStop] = useState<RouteStop | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Technicians (could be synced separately)
  const [technicians] = useState<Technician[]>([
    { id: '1', name: 'John Smith', phone: '555-0101', email: 'john@poolservice.com', available: true, vehicleId: 'V001' },
    { id: '2', name: 'Mike Johnson', phone: '555-0102', email: 'mike@poolservice.com', available: true, vehicleId: 'V002' },
    { id: '3', name: 'Sarah Williams', phone: '555-0103', email: 'sarah@poolservice.com', available: false, vehicleId: 'V003' },
  ]);

  // Form states
  const [newRoute, setNewRoute] = useState<Partial<ServiceRoute>>({
    name: '',
    dayOfWeek: 'monday',
    assignedTechnician: '',
    technicianPhone: '',
    stops: [],
    status: 'not-started',
    startTime: '08:00',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [newStop, setNewStop] = useState<Partial<RouteStop>>({
    customerId: '',
    customerName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    poolType: 'residential',
    estimatedDuration: 30,
    status: 'pending',
    notes: '',
    order: 1,
  });

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const matchesSearch = searchTerm === '' ||
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.assignedTechnician.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDay = filterDay === 'all' || route.dayOfWeek === filterDay;
      const matchesStatus = filterStatus === 'all' || route.status === filterStatus;
      return matchesSearch && matchesDay && matchesStatus;
    });
  }, [routes, searchTerm, filterDay, filterStatus]);

  // Today's routes
  const todaysRoutes = useMemo(() => {
    const today = getTodayDayOfWeek();
    const todayDate = new Date().toISOString().split('T')[0];
    return routes.filter(r => r.dayOfWeek === today || r.date === todayDate);
  }, [routes]);

  // Get stops for a route
  const getRouteStops = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (!route) return [];
    return stops
      .filter(s => route.stops.includes(s.id))
      .sort((a, b) => a.order - b.order);
  };

  // Dashboard stats
  const stats = useMemo(() => {
    const today = getTodayDayOfWeek();
    const todayRoutes = routes.filter(r => r.dayOfWeek === today);
    const completedStops = stops.filter(s => s.status === 'completed');
    const totalEstimatedTime = stops.reduce((sum, s) => sum + s.estimatedDuration, 0);

    return {
      todaysRoutes: todayRoutes.length,
      totalRoutes: routes.length,
      totalStops: stops.length,
      completedStops: completedStops.length,
      totalEstimatedTime: Math.round(totalEstimatedTime / 60), // hours
      availableTechs: technicians.filter(t => t.available).length,
    };
  }, [routes, stops, technicians]);

  // Add route
  const handleAddRoute = () => {
    if (!newRoute.name || !newRoute.assignedTechnician) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const tech = technicians.find(t => t.name === newRoute.assignedTechnician);
    const route: ServiceRoute = {
      id: generateId(),
      name: newRoute.name || '',
      dayOfWeek: newRoute.dayOfWeek || 'monday',
      assignedTechnician: newRoute.assignedTechnician || '',
      technicianPhone: tech?.phone || '',
      stops: [],
      status: 'not-started',
      startTime: newRoute.startTime || '08:00',
      date: newRoute.date || new Date().toISOString().split('T')[0],
      notes: newRoute.notes || '',
      createdAt: new Date().toISOString(),
    };

    addRouteToBackend(route);
    setShowRouteForm(false);
    resetRouteForm();
  };

  // Add stop
  const handleAddStop = () => {
    if (!newStop.customerName || !newStop.address) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const stop: RouteStop = {
      id: generateId(),
      customerId: newStop.customerId || generateId(),
      customerName: newStop.customerName || '',
      address: newStop.address || '',
      city: newStop.city || '',
      state: newStop.state || '',
      zipCode: newStop.zipCode || '',
      phone: newStop.phone || '',
      poolType: newStop.poolType || 'residential',
      estimatedDuration: newStop.estimatedDuration || 30,
      status: 'pending',
      notes: newStop.notes || '',
      order: stops.length + 1,
    };

    addStopToBackend(stop);

    // If a route is selected, add this stop to that route
    if (selectedRouteId) {
      const route = routes.find(r => r.id === selectedRouteId);
      if (route) {
        updateRouteBackend(selectedRouteId, {
          stops: [...route.stops, stop.id],
        });
      }
    }

    setShowStopForm(false);
    resetStopForm();
  };

  // Update route status
  const updateRouteStatus = (routeId: string, status: RouteStatus) => {
    const updates: Partial<ServiceRoute> = { status };
    if (status === 'completed') {
      updates.endTime = new Date().toISOString();
    }
    updateRouteBackend(routeId, updates);
  };

  // Update stop status
  const updateStopStatus = (stopId: string, status: StopStatus) => {
    const updates: Partial<RouteStop> = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
      updates.departureTime = new Date().toTimeString().split(' ')[0].slice(0, 5);
    } else if (status === 'in-progress') {
      updates.arrivalTime = new Date().toTimeString().split(' ')[0].slice(0, 5);
    }
    updateStopBackend(stopId, updates);
  };

  // Reorder stops
  const moveStop = (stopId: string, direction: 'up' | 'down', routeId: string) => {
    const routeStops = getRouteStops(routeId);
    const stopIndex = routeStops.findIndex(s => s.id === stopId);
    if (stopIndex === -1) return;

    const newIndex = direction === 'up' ? stopIndex - 1 : stopIndex + 1;
    if (newIndex < 0 || newIndex >= routeStops.length) return;

    // Swap orders
    const currentStop = routeStops[stopIndex];
    const swapStop = routeStops[newIndex];

    updateStopBackend(currentStop.id, { order: swapStop.order });
    updateStopBackend(swapStop.id, { order: currentStop.order });
  };

  // Delete route
  const handleDeleteRoute = async (routeId: string) => {
    const confirmed = await confirm({
      title: 'Delete Route',
      message: 'Are you sure you want to delete this route?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteRouteBackend(routeId);
    }
  };

  // Delete stop
  const handleDeleteStop = async (stopId: string) => {
    const confirmed = await confirm({
      title: 'Remove Stop',
      message: 'Are you sure you want to remove this stop?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      // Remove from any routes
      routes.forEach(route => {
        if (route.stops.includes(stopId)) {
          updateRouteBackend(route.id, {
            stops: route.stops.filter(id => id !== stopId),
          });
        }
      });
      deleteStopBackend(stopId);
    }
  };

  // Reset forms
  const resetRouteForm = () => {
    setNewRoute({
      name: '',
      dayOfWeek: 'monday',
      assignedTechnician: '',
      technicianPhone: '',
      stops: [],
      status: 'not-started',
      startTime: '08:00',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const resetStopForm = () => {
    setNewStop({
      customerId: '',
      customerName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      poolType: 'residential',
      estimatedDuration: 30,
      status: 'pending',
      notes: '',
      order: stops.length + 1,
    });
  };

  // Export data with customer names
  const getExportData = () => {
    return routes.map(r => ({
      ...r,
      stopCount: r.stops.length,
      dayOfWeek: DAY_LABELS[r.dayOfWeek],
    }));
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500 rounded-lg">
                <Route className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.poolServiceRoute.poolServiceRoutes', 'Pool Service Routes')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.poolServiceRoute.planAndOptimizeServiceRoutes', 'Plan and optimize service routes for pool technicians')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="pool-service-route" toolName="Pool Service Route" />

              <SyncStatus
                isSynced={routesSynced && stopsSynced}
                isSaving={routesSaving || stopsSaving}
                lastSaved={routesLastSaved || stopsLastSaved}
                syncError={routesSyncError || stopsSyncError}
                onForceSync={() => { forceRoutesSync(); forceStopsSync(); }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(getExportData(), ROUTE_COLUMNS, { filename: 'pool-service-routes' })}
                onExportExcel={() => exportToExcel(getExportData(), ROUTE_COLUMNS, { filename: 'pool-service-routes' })}
                onExportJSON={() => exportToJSON(getExportData(), { filename: 'pool-service-routes' })}
                onExportPDF={async () => {
                  await exportToPDF(getExportData(), ROUTE_COLUMNS, {
                    filename: 'pool-service-routes',
                    title: 'Pool Service Routes',
                    subtitle: `${routes.length} routes | ${stops.length} stops`,
                  });
                }}
                onPrint={() => printData(getExportData(), ROUTE_COLUMNS, { title: 'Pool Service Routes' })}
                onCopyToClipboard={async () => copyUtil(getExportData(), ROUTE_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'routes', label: 'All Routes', icon: <Route className="w-4 h-4" /> },
              { id: 'stops', label: 'Stops', icon: <MapPin className="w-4 h-4" /> },
              { id: 'today', label: "Today's Routes", icon: <Calendar className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-white'
                    : theme === 'dark'
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

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Today's Routes", value: stats.todaysRoutes, icon: <Calendar className="w-5 h-5" />, color: 'bg-blue-500' },
            { label: 'Total Routes', value: stats.totalRoutes, icon: <Route className="w-5 h-5" />, color: 'bg-cyan-500' },
            { label: 'Total Stops', value: stats.totalStops, icon: <MapPin className="w-5 h-5" />, color: 'bg-green-500' },
            { label: 'Completed', value: stats.completedStops, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-emerald-500' },
            { label: 'Est. Hours', value: stats.totalEstimatedTime, icon: <Clock className="w-5 h-5" />, color: 'bg-purple-500' },
            { label: 'Available Techs', value: stats.availableTechs, icon: <User className="w-5 h-5" />, color: 'bg-orange-500' },
          ].map((stat, idx) => (
            <div key={idx} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <span className="text-white">{stat.icon}</span>
                </div>
                <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </span>
              </div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Routes Tab */}
        {activeTab === 'routes' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.poolServiceRoute.searchRoutesOrTechnicians', 'Search routes or technicians...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.poolServiceRoute.allDays', 'All Days')}</option>
                {Object.entries(DAY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowRouteForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('tools.poolServiceRoute.addRoute', 'Add Route')}
              </button>
            </div>

            {/* Routes List */}
            <div className="space-y-4">
              {filteredRoutes.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Route className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.poolServiceRoute.noRoutesFoundCreateYour', 'No routes found. Create your first route to get started.')}</p>
                </div>
              ) : (
                filteredRoutes.map((route) => {
                  const routeStops = getRouteStops(route.id);
                  const completedCount = routeStops.filter(s => s.status === 'completed').length;
                  const totalDuration = routeStops.reduce((sum, s) => sum + s.estimatedDuration, 0);

                  return (
                    <div
                      key={route.id}
                      className={`border rounded-lg p-4 ${
                        theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {route.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROUTE_STATUS_COLORS[route.status]}`}>
                              {route.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                {DAY_LABELS[route.dayOfWeek]}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                {route.assignedTechnician}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                {completedCount}/{routeStops.length} stops
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                ~{Math.round(totalDuration / 60)} hrs
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {route.status === 'not-started' && (
                            <button
                              onClick={() => updateRouteStatus(route.id, 'in-progress')}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                              title={t('tools.poolServiceRoute.startRoute', 'Start Route')}
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {route.status === 'in-progress' && (
                            <>
                              <button
                                onClick={() => updateRouteStatus(route.id, 'paused')}
                                className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                title={t('tools.poolServiceRoute.pauseRoute', 'Pause Route')}
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateRouteStatus(route.id, 'completed')}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                title={t('tools.poolServiceRoute.completeRoute', 'Complete Route')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {route.status === 'paused' && (
                            <button
                              onClick={() => updateRouteStatus(route.id, 'in-progress')}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                              title={t('tools.poolServiceRoute.resumeRoute', 'Resume Route')}
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedRouteId(selectedRouteId === route.id ? null : route.id)}
                            className={`p-2 rounded-lg ${
                              theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title={t('tools.poolServiceRoute.viewStops', 'View Stops')}
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(route.id)}
                            className={`p-2 rounded-lg ${
                              theme === 'dark'
                                ? 'bg-gray-700 text-red-400 hover:bg-gray-600'
                                : 'bg-gray-100 text-red-600 hover:bg-gray-200'
                            }`}
                            title={t('tools.poolServiceRoute.deleteRoute', 'Delete Route')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Stops View */}
                      {selectedRouteId === route.id && (
                        <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {t('tools.poolServiceRoute.routeStops', 'Route Stops')}
                            </h4>
                            <button
                              onClick={() => setShowStopForm(true)}
                              className="flex items-center gap-1 text-sm px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                            >
                              <Plus className="w-4 h-4" />
                              {t('tools.poolServiceRoute.addStop', 'Add Stop')}
                            </button>
                          </div>
                          {routeStops.length === 0 ? (
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {t('tools.poolServiceRoute.noStopsInThisRoute', 'No stops in this route yet.')}
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {routeStops.map((stop, idx) => (
                                <div
                                  key={stop.id}
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      stop.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                                    }`}>
                                      {idx + 1}
                                    </span>
                                    <div>
                                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {stop.customerName}
                                      </p>
                                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {stop.address}, {stop.city}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${STOP_STATUS_COLORS[stop.status]}`}>
                                      {stop.status}
                                    </span>
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {stop.estimatedDuration}min
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => moveStop(stop.id, 'up', route.id)}
                                        disabled={idx === 0}
                                        className={`p-1 rounded ${idx === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                      >
                                        <ArrowUpDown className="w-4 h-4" />
                                      </button>
                                      {stop.status !== 'completed' && (
                                        <button
                                          onClick={() => updateStopStatus(stop.id, 'completed')}
                                          className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteStop(stop.id)}
                                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Stops Tab */}
        {activeTab === 'stops' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.poolServiceRoute.allServiceStops', 'All Service Stops')}
              </h2>
              <button
                onClick={() => setShowStopForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
              >
                <Plus className="w-5 h-5" />
                {t('tools.poolServiceRoute.addStop2', 'Add Stop')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.poolServiceRoute.customer', 'Customer')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.poolServiceRoute.address', 'Address')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.poolServiceRoute.poolType', 'Pool Type')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.poolServiceRoute.duration', 'Duration')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.poolServiceRoute.status', 'Status')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.poolServiceRoute.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stops.map((stop) => (
                    <tr key={stop.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stop.customerName}</td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{stop.address}, {stop.city}</td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{POOL_TYPE_LABELS[stop.poolType]}</td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{stop.estimatedDuration} min</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${STOP_STATUS_COLORS[stop.status]}`}>
                          {stop.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteStop(stop.id)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Today's Routes Tab */}
        {activeTab === 'today' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Today's Routes ({DAY_LABELS[getTodayDayOfWeek()]})
            </h2>

            {todaysRoutes.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.poolServiceRoute.noRoutesScheduledForToday', 'No routes scheduled for today.')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {todaysRoutes.map((route) => {
                  const routeStops = getRouteStops(route.id);
                  return (
                    <div key={route.id} className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {route.name}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {route.assignedTechnician} | Start: {formatTime(route.startTime)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROUTE_STATUS_COLORS[route.status]}`}>
                          {route.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {routeStops.map((stop, idx) => (
                          <div
                            key={stop.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                stop.status === 'completed'
                                  ? 'bg-green-500 text-white'
                                  : stop.status === 'in-progress'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}>
                                {stop.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                              </span>
                              <div>
                                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {stop.customerName}
                                </p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {stop.address}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {stop.arrivalTime && (
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Arrived: {formatTime(stop.arrivalTime)}
                                </span>
                              )}
                              {stop.status === 'pending' && (
                                <button
                                  onClick={() => updateStopStatus(stop.id, 'in-progress')}
                                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                >
                                  {t('tools.poolServiceRoute.arrive', 'Arrive')}
                                </button>
                              )}
                              {stop.status === 'in-progress' && (
                                <button
                                  onClick={() => updateStopStatus(stop.id, 'completed')}
                                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                >
                                  {t('tools.poolServiceRoute.complete', 'Complete')}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Add Route Modal */}
        {showRouteForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.poolServiceRoute.createNewRoute', 'Create New Route')}
                </h3>
                <button onClick={() => setShowRouteForm(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.poolServiceRoute.routeName', 'Route Name *')}
                  </label>
                  <input
                    type="text"
                    value={newRoute.name}
                    onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.poolServiceRoute.eGMondayNorthRoute', 'e.g., Monday North Route')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.poolServiceRoute.dayOfWeek', 'Day of Week')}
                    </label>
                    <select
                      value={newRoute.dayOfWeek}
                      onChange={(e) => setNewRoute({ ...newRoute, dayOfWeek: e.target.value as DayOfWeek })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {Object.entries(DAY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.poolServiceRoute.startTime', 'Start Time')}
                    </label>
                    <input
                      type="time"
                      value={newRoute.startTime}
                      onChange={(e) => setNewRoute({ ...newRoute, startTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.poolServiceRoute.assignedTechnician', 'Assigned Technician *')}
                  </label>
                  <select
                    value={newRoute.assignedTechnician}
                    onChange={(e) => setNewRoute({ ...newRoute, assignedTechnician: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.poolServiceRoute.selectTechnician', 'Select technician...')}</option>
                    {technicians.filter(t => t.available).map((tech) => (
                      <option key={tech.id} value={tech.name}>{tech.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.poolServiceRoute.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newRoute.notes}
                    onChange={(e) => setNewRoute({ ...newRoute, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.poolServiceRoute.additionalRouteNotes', 'Additional route notes...')}
                  />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowRouteForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.poolServiceRoute.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddRoute}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  {t('tools.poolServiceRoute.createRoute', 'Create Route')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Stop Modal */}
        {showStopForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.poolServiceRoute.addServiceStop', 'Add Service Stop')}
                </h3>
                <button onClick={() => setShowStopForm(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.poolServiceRoute.customerName', 'Customer Name *')}
                  </label>
                  <input
                    type="text"
                    value={newStop.customerName}
                    onChange={(e) => setNewStop({ ...newStop, customerName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.poolServiceRoute.customerName2', 'Customer name')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.poolServiceRoute.address2', 'Address *')}
                  </label>
                  <input
                    type="text"
                    value={newStop.address}
                    onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.poolServiceRoute.streetAddress', 'Street address')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.poolServiceRoute.city', 'City')}
                    </label>
                    <input
                      type="text"
                      value={newStop.city}
                      onChange={(e) => setNewStop({ ...newStop, city: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.poolServiceRoute.state', 'State')}
                    </label>
                    <input
                      type="text"
                      value={newStop.state}
                      onChange={(e) => setNewStop({ ...newStop, state: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.poolServiceRoute.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={newStop.phone}
                      onChange={(e) => setNewStop({ ...newStop, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.poolServiceRoute.poolType2', 'Pool Type')}
                    </label>
                    <select
                      value={newStop.poolType}
                      onChange={(e) => setNewStop({ ...newStop, poolType: e.target.value as RouteStop['poolType'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {Object.entries(POOL_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.poolServiceRoute.estimatedDurationMinutes', 'Estimated Duration (minutes)')}
                  </label>
                  <input
                    type="number"
                    value={newStop.estimatedDuration}
                    onChange={(e) => setNewStop({ ...newStop, estimatedDuration: parseInt(e.target.value) || 30 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="15"
                    step="15"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.poolServiceRoute.notes2', 'Notes')}
                  </label>
                  <textarea
                    value={newStop.notes}
                    onChange={(e) => setNewStop({ ...newStop, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.poolServiceRoute.gateCodeSpecialInstructionsEtc', 'Gate code, special instructions, etc.')}
                  />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowStopForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.poolServiceRoute.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddStop}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  {t('tools.poolServiceRoute.addStop3', 'Add Stop')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <AlertCircle className="w-5 h-5" />
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default PoolServiceRouteTool;
