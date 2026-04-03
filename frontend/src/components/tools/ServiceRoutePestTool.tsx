'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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
  Route,
  MapPin,
  Calendar,
  Clock,
  User,
  Home,
  Truck,
  Navigation,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  ArrowUpDown,
  Users,
  Bug,
  Phone,
  Mail,
  Sparkles,
} from 'lucide-react';

// Types
interface ServiceStop {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  propertyType: 'residential' | 'commercial' | 'industrial';
  serviceType: 'regular' | 'callback' | 'initial' | 'inspection' | 'emergency';
  estimatedDuration: number; // minutes
  scheduledTime: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes: string;
  pestTypes: string[];
  specialInstructions: string;
}

interface ServiceRoute {
  id: string;
  date: string;
  technicianId: string;
  technicianName: string;
  vehicleId: string;
  vehicleName: string;
  stops: ServiceStop[];
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  totalDistance: number;
  totalDuration: number;
  notes: string;
  completedStops: number;
  createdAt: string;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  available: boolean;
}

interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  type: 'truck' | 'van' | 'suv';
  available: boolean;
}

// Column configuration for exports
const ROUTE_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Route ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'vehicleName', header: 'Vehicle', type: 'string' },
  { key: 'stopsCount', header: 'Stops', type: 'number' },
  { key: 'completedStops', header: 'Completed', type: 'number' },
  { key: 'totalDistance', header: 'Distance (mi)', type: 'number' },
  { key: 'totalDuration', header: 'Duration (min)', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
];

const STOP_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'serviceType', header: 'Service Type', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'scheduledTime', header: 'Scheduled Time', type: 'string' },
  { key: 'estimatedDuration', header: 'Duration (min)', type: 'number' },
  { key: 'pestTypes', header: 'Pest Types', type: 'string' },
];

// Default data
const defaultTechnicians: Technician[] = [
  { id: '1', name: 'John Smith', phone: '555-0101', email: 'john.smith@pestcontrol.com', available: true },
  { id: '2', name: 'Sarah Johnson', phone: '555-0102', email: 'sarah.johnson@pestcontrol.com', available: true },
  { id: '3', name: 'Mike Williams', phone: '555-0103', email: 'mike.williams@pestcontrol.com', available: true },
];

const defaultVehicles: Vehicle[] = [
  { id: '1', name: 'Truck #1', licensePlate: 'PCT-001', type: 'truck', available: true },
  { id: '2', name: 'Van #2', licensePlate: 'PCT-002', type: 'van', available: true },
  { id: '3', name: 'SUV #3', licensePlate: 'PCT-003', type: 'suv', available: true },
];

const defaultRoutes: ServiceRoute[] = [];

interface ServiceRoutePestToolProps {
  uiConfig?: UIConfig;
}

export const ServiceRoutePestTool = ({
  uiConfig }: ServiceRoutePestToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use useToolData for backend sync
  const {
    data: routes,
    setData: setRoutes,
    addItem: addRoute,
    updateItem: updateRoute,
    deleteItem: deleteRoute,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ServiceRoute>('pest-service-routes', defaultRoutes, ROUTE_COLUMNS);

  // Static data
  const [technicians] = useState<Technician[]>(defaultTechnicians);
  const [vehicles] = useState<Vehicle[]>(defaultVehicles);

  // UI State
  const [activeTab, setActiveTab] = useState<'routes' | 'today' | 'planning'>('routes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [showAddStop, setShowAddStop] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<ServiceRoute | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());

  // Form states
  const [routeForm, setRouteForm] = useState<Partial<ServiceRoute>>({
    status: 'planned',
    stops: [],
    totalDistance: 0,
    totalDuration: 0,
    completedStops: 0,
  });

  const [stopForm, setStopForm] = useState<Partial<ServiceStop>>({
    serviceType: 'regular',
    priority: 'normal',
    estimatedDuration: 30,
    pestTypes: [],
  });

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.technicianName || params.date || params.customerName) {
        setIsPrefilled(true);
        if (params.date) {
          setRouteForm(prev => ({ ...prev, date: params.date }));
        }
      }
    }
  }, [uiConfig?.params]);

  // Computed values
  const todayRoutes = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return routes.filter(r => r.date === today);
  }, [routes]);

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const matchesSearch = searchTerm === '' ||
        route.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.stops.some(s => s.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || route.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [routes, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRoutesList = routes.filter(r => r.date === today);
    return {
      totalRoutes: routes.length,
      todayRoutes: todayRoutesList.length,
      inProgress: routes.filter(r => r.status === 'in-progress').length,
      completed: routes.filter(r => r.status === 'completed').length,
      totalStopsToday: todayRoutesList.reduce((sum, r) => sum + r.stops.length, 0),
      completedStopsToday: todayRoutesList.reduce((sum, r) => sum + r.completedStops, 0),
    };
  }, [routes]);

  // Handlers
  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleAddRoute = useCallback(() => {
    if (!routeForm.date || !routeForm.technicianId || !routeForm.vehicleId) {
      setValidationMessage('Please fill in required fields (Date, Technician, Vehicle)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const technician = technicians.find(t => t.id === routeForm.technicianId);
    const vehicle = vehicles.find(v => v.id === routeForm.vehicleId);

    const newRoute: ServiceRoute = {
      id: generateId(),
      date: routeForm.date || '',
      technicianId: routeForm.technicianId || '',
      technicianName: technician?.name || '',
      vehicleId: routeForm.vehicleId || '',
      vehicleName: vehicle?.name || '',
      stops: routeForm.stops || [],
      status: 'planned',
      startTime: routeForm.startTime || '08:00',
      endTime: routeForm.endTime || '17:00',
      totalDistance: 0,
      totalDuration: routeForm.stops?.reduce((sum, s) => sum + s.estimatedDuration, 0) || 0,
      notes: routeForm.notes || '',
      completedStops: 0,
      createdAt: new Date().toISOString(),
    };

    addRoute(newRoute);
    setShowAddRoute(false);
    setRouteForm({ status: 'planned', stops: [], totalDistance: 0, totalDuration: 0, completedStops: 0 });
  }, [routeForm, technicians, vehicles, addRoute]);

  const handleAddStop = useCallback(() => {
    if (!selectedRoute || !stopForm.customerName || !stopForm.address) {
      setValidationMessage('Please fill in required fields (Customer Name, Address)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newStop: ServiceStop = {
      id: generateId(),
      customerId: stopForm.customerId || generateId(),
      customerName: stopForm.customerName || '',
      address: stopForm.address || '',
      city: stopForm.city || '',
      state: stopForm.state || '',
      zip: stopForm.zip || '',
      phone: stopForm.phone || '',
      email: stopForm.email || '',
      propertyType: stopForm.propertyType || 'residential',
      serviceType: stopForm.serviceType || 'regular',
      estimatedDuration: stopForm.estimatedDuration || 30,
      scheduledTime: stopForm.scheduledTime || '',
      priority: stopForm.priority || 'normal',
      notes: stopForm.notes || '',
      pestTypes: stopForm.pestTypes || [],
      specialInstructions: stopForm.specialInstructions || '',
    };

    const updatedRoute = {
      ...selectedRoute,
      stops: [...selectedRoute.stops, newStop],
      totalDuration: selectedRoute.totalDuration + newStop.estimatedDuration,
    };

    updateRoute(selectedRoute.id, updatedRoute);
    setSelectedRoute(updatedRoute);
    setShowAddStop(false);
    setStopForm({ serviceType: 'regular', priority: 'normal', estimatedDuration: 30, pestTypes: [] });
  }, [selectedRoute, stopForm, updateRoute]);

  const handleDeleteStop = useCallback((routeId: string, stopId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (!route) return;

    const stopToRemove = route.stops.find(s => s.id === stopId);
    const updatedRoute = {
      ...route,
      stops: route.stops.filter(s => s.id !== stopId),
      totalDuration: route.totalDuration - (stopToRemove?.estimatedDuration || 0),
    };

    updateRoute(routeId, updatedRoute);
    if (selectedRoute?.id === routeId) {
      setSelectedRoute(updatedRoute);
    }
  }, [routes, selectedRoute, updateRoute]);

  const handleStartRoute = useCallback((routeId: string) => {
    updateRoute(routeId, { status: 'in-progress', startTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) });
  }, [updateRoute]);

  const handleCompleteRoute = useCallback((routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      updateRoute(routeId, {
        status: 'completed',
        endTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        completedStops: route.stops.length,
      });
    }
  }, [routes, updateRoute]);

  const handleCompleteStop = useCallback((routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route && route.completedStops < route.stops.length) {
      updateRoute(routeId, { completedStops: route.completedStops + 1 });
    }
  }, [routes, updateRoute]);

  const toggleRouteExpanded = (routeId: string) => {
    setExpandedRoutes(prev => {
      const next = new Set(prev);
      if (next.has(routeId)) {
        next.delete(routeId);
      } else {
        next.add(routeId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case 'normal': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'low': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const exportData = routes.map(r => ({
      ...r,
      stopsCount: r.stops.length,
    }));
    exportToCSV(exportData, ROUTE_COLUMNS, { filename: 'pest-service-routes' });
  };

  const handleExportExcel = () => {
    const exportData = routes.map(r => ({
      ...r,
      stopsCount: r.stops.length,
    }));
    exportToExcel(exportData, ROUTE_COLUMNS, { filename: 'pest-service-routes' });
  };

  const handleExportJSON = () => {
    exportToJSON(routes, { filename: 'pest-service-routes' });
  };

  const handleExportPDF = async () => {
    const exportData = routes.map(r => ({
      ...r,
      stopsCount: r.stops.length,
    }));
    await exportToPDF(exportData, ROUTE_COLUMNS, {
      filename: 'pest-service-routes',
      title: 'Pest Control Service Routes',
      subtitle: `${routes.length} routes | ${routes.reduce((sum, r) => sum + r.stops.length, 0)} total stops`,
    });
  };

  const handlePrint = () => {
    const exportData = routes.map(r => ({
      ...r,
      stopsCount: r.stops.length,
    }));
    printData(exportData, ROUTE_COLUMNS, { title: 'Pest Control Service Routes' });
  };

  const handleCopyToClipboard = async () => {
    const exportData = routes.map(r => ({
      ...r,
      stopsCount: r.stops.length,
    }));
    return await copyUtil(exportData, ROUTE_COLUMNS, 'tab');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.serviceRoutePest.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Route className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.serviceRoutePest.serviceRoutePlanner', 'Service Route Planner')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.serviceRoutePest.planAndManagePestControl', 'Plan and manage pest control service routes')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="service-route-pest" toolName="Service Route Pest" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalRoutes}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.serviceRoutePest.totalRoutes', 'Total Routes')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.todayRoutes}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.serviceRoutePest.todaySRoutes', 'Today\'s Routes')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-yellow-500`}>
                {stats.inProgress}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.serviceRoutePest.inProgress', 'In Progress')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-green-500`}>
                {stats.completed}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.serviceRoutePest.completed', 'Completed')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalStopsToday}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.serviceRoutePest.todaySStops', 'Today\'s Stops')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-[#0D9488]`}>
                {stats.completedStopsToday}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.serviceRoutePest.stopsDone', 'Stops Done')}</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'routes', label: 'All Routes', icon: <Route className="w-4 h-4" /> },
              { id: 'today', label: "Today's Routes", icon: <Calendar className="w-4 h-4" /> },
              { id: 'planning', label: 'Route Planning', icon: <Navigation className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
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

        {/* Search and Filter */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.serviceRoutePest.searchRoutesTechniciansCustomers', 'Search routes, technicians, customers...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            >
              <option value="all">{t('tools.serviceRoutePest.allStatus', 'All Status')}</option>
              <option value="planned">{t('tools.serviceRoutePest.planned', 'Planned')}</option>
              <option value="in-progress">{t('tools.serviceRoutePest.inProgress2', 'In Progress')}</option>
              <option value="completed">{t('tools.serviceRoutePest.completed2', 'Completed')}</option>
              <option value="cancelled">{t('tools.serviceRoutePest.cancelled', 'Cancelled')}</option>
            </select>
            <button
              onClick={() => setShowAddRoute(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('tools.serviceRoutePest.addRoute', 'Add Route')}
            </button>
          </div>
        </div>

        {/* Routes List */}
        <div className="space-y-4">
          {(activeTab === 'today' ? todayRoutes : filteredRoutes).map((route) => (
            <div
              key={route.id}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}
            >
              {/* Route Header */}
              <div
                className={`p-4 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                onClick={() => toggleRouteExpanded(route.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Truck className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatDate(route.date)}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(route.status)}`}>
                          {route.status}
                        </span>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {route.technicianName} | {route.vehicleName} | {route.stops.length} stops
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {route.completedStops}/{route.stops.length} completed
                    </span>
                    {expandedRoutes.has(route.id) ? (
                      <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedRoutes.has(route.id) && (
                <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  {/* Route Actions */}
                  <div className={`p-4 flex gap-2 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    {route.status === 'planned' && (
                      <button
                        onClick={() => handleStartRoute(route.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <Play className="w-4 h-4" />
                        {t('tools.serviceRoutePest.startRoute', 'Start Route')}
                      </button>
                    )}
                    {route.status === 'in-progress' && (
                      <>
                        <button
                          onClick={() => handleCompleteStop(route.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {t('tools.serviceRoutePest.completeStop', 'Complete Stop')}
                        </button>
                        <button
                          onClick={() => handleCompleteRoute(route.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {t('tools.serviceRoutePest.completeRoute', 'Complete Route')}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => { setSelectedRoute(route); setShowAddStop(true); }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-600 text-white hover:bg-gray-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.serviceRoutePest.addStop', 'Add Stop')}
                    </button>
                    <button
                      onClick={() => deleteRoute(route.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  {/* Stops List */}
                  <div className="p-4 space-y-3">
                    {route.stops.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.serviceRoutePest.noStopsAddedYetAdd', 'No stops added yet. Add stops to plan your route.')}
                      </div>
                    ) : (
                      route.stops.map((stop, index) => (
                        <div
                          key={stop.id}
                          className={`p-4 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {stop.customerName}
                                  </h4>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(stop.priority)}`}>
                                    {stop.priority}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    {stop.serviceType}
                                  </span>
                                </div>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {stop.address}, {stop.city}, {stop.state} {stop.zip}
                                  </div>
                                  {stop.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {stop.phone}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {stop.scheduledTime || 'Not scheduled'} ({stop.estimatedDuration} min)
                                  </span>
                                  {stop.pestTypes.length > 0 && (
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                      <Bug className="w-3 h-3 inline mr-1" />
                                      {stop.pestTypes.join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteStop(route.id, stop.id)}
                              className={`p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              } hover:text-red-600`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredRoutes.length === 0 && (
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
              <Route className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.serviceRoutePest.noRoutesFound', 'No routes found')}
              </h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.serviceRoutePest.createYourFirstServiceRoute', 'Create your first service route to get started.')}
              </p>
              <button
                onClick={() => setShowAddRoute(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-5 h-5" />
                {t('tools.serviceRoutePest.addRoute2', 'Add Route')}
              </button>
            </div>
          )}
        </div>

        {/* Add Route Modal */}
        {showAddRoute && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.serviceRoutePest.addNewRoute', 'Add New Route')}
                </h3>
                <button
                  onClick={() => setShowAddRoute(false)}
                  className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceRoutePest.date', 'Date *')}
                  </label>
                  <input
                    type="date"
                    value={routeForm.date || ''}
                    onChange={(e) => setRouteForm({ ...routeForm, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceRoutePest.technician', 'Technician *')}
                  </label>
                  <select
                    value={routeForm.technicianId || ''}
                    onChange={(e) => setRouteForm({ ...routeForm, technicianId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                  >
                    <option value="">{t('tools.serviceRoutePest.selectTechnician', 'Select Technician')}</option>
                    {technicians.filter(t => t.available).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceRoutePest.vehicle', 'Vehicle *')}
                  </label>
                  <select
                    value={routeForm.vehicleId || ''}
                    onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                  >
                    <option value="">{t('tools.serviceRoutePest.selectVehicle', 'Select Vehicle')}</option>
                    {vehicles.filter(v => v.available).map((v) => (
                      <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceRoutePest.startTime', 'Start Time')}
                    </label>
                    <input
                      type="time"
                      value={routeForm.startTime || '08:00'}
                      onChange={(e) => setRouteForm({ ...routeForm, startTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceRoutePest.endTime', 'End Time')}
                    </label>
                    <input
                      type="time"
                      value={routeForm.endTime || '17:00'}
                      onChange={(e) => setRouteForm({ ...routeForm, endTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceRoutePest.notes', 'Notes')}
                  </label>
                  <textarea
                    value={routeForm.notes || ''}
                    onChange={(e) => setRouteForm({ ...routeForm, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    placeholder={t('tools.serviceRoutePest.routeNotes', 'Route notes...')}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAddRoute(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.serviceRoutePest.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddRoute}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {t('tools.serviceRoutePest.addRoute3', 'Add Route')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Stop Modal */}
        {showAddStop && selectedRoute && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.serviceRoutePest.addStopToRoute', 'Add Stop to Route')}
                </h3>
                <button
                  onClick={() => { setShowAddStop(false); setSelectedRoute(null); }}
                  className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceRoutePest.customerName', 'Customer Name *')}
                  </label>
                  <input
                    type="text"
                    value={stopForm.customerName || ''}
                    onChange={(e) => setStopForm({ ...stopForm, customerName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    placeholder={t('tools.serviceRoutePest.enterCustomerName', 'Enter customer name')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceRoutePest.address', 'Address *')}
                  </label>
                  <input
                    type="text"
                    value={stopForm.address || ''}
                    onChange={(e) => setStopForm({ ...stopForm, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    placeholder={t('tools.serviceRoutePest.streetAddress', 'Street address')}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceRoutePest.city', 'City')}
                    </label>
                    <input
                      type="text"
                      value={stopForm.city || ''}
                      onChange={(e) => setStopForm({ ...stopForm, city: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceRoutePest.state', 'State')}
                    </label>
                    <input
                      type="text"
                      value={stopForm.state || ''}
                      onChange={(e) => setStopForm({ ...stopForm, state: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceRoutePest.zip', 'ZIP')}
                    </label>
                    <input
                      type="text"
                      value={stopForm.zip || ''}
                      onChange={(e) => setStopForm({ ...stopForm, zip: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceRoutePest.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={stopForm.phone || ''}
                      onChange={(e) => setStopForm({ ...stopForm, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceRoutePest.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={stopForm.email || ''}
                      onChange={(e) => setStopForm({ ...stopForm, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceRoutePest.serviceType', 'Service Type')}
                    </label>
                    <select
                      value={stopForm.serviceType || 'regular'}
                      onChange={(e) => setStopForm({ ...stopForm, serviceType: e.target.value as ServiceStop['serviceType'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    >
                      <option value="regular">{t('tools.serviceRoutePest.regular', 'Regular')}</option>
                      <option value="callback">{t('tools.serviceRoutePest.callback', 'Callback')}</option>
                      <option value="initial">Initial</option>
                      <option value="inspection">{t('tools.serviceRoutePest.inspection', 'Inspection')}</option>
                      <option value="emergency">{t('tools.serviceRoutePest.emergency', 'Emergency')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceRoutePest.priority', 'Priority')}
                    </label>
                    <select
                      value={stopForm.priority || 'normal'}
                      onChange={(e) => setStopForm({ ...stopForm, priority: e.target.value as ServiceStop['priority'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    >
                      <option value="low">{t('tools.serviceRoutePest.low', 'Low')}</option>
                      <option value="normal">{t('tools.serviceRoutePest.normal', 'Normal')}</option>
                      <option value="high">{t('tools.serviceRoutePest.high', 'High')}</option>
                      <option value="urgent">{t('tools.serviceRoutePest.urgent', 'Urgent')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceRoutePest.scheduledTime', 'Scheduled Time')}
                    </label>
                    <input
                      type="time"
                      value={stopForm.scheduledTime || ''}
                      onChange={(e) => setStopForm({ ...stopForm, scheduledTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.serviceRoutePest.durationMin', 'Duration (min)')}
                    </label>
                    <input
                      type="number"
                      value={stopForm.estimatedDuration || 30}
                      onChange={(e) => setStopForm({ ...stopForm, estimatedDuration: parseInt(e.target.value) || 30 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.serviceRoutePest.notes2', 'Notes')}
                  </label>
                  <textarea
                    value={stopForm.notes || ''}
                    onChange={(e) => setStopForm({ ...stopForm, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    placeholder={t('tools.serviceRoutePest.serviceNotes', 'Service notes...')}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => { setShowAddStop(false); setSelectedRoute(null); }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.serviceRoutePest.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddStop}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {t('tools.serviceRoutePest.addStop2', 'Add Stop')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {validationMessage}
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ServiceRoutePestTool;
