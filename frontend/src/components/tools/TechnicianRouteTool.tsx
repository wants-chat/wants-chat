'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  MapPin,
  Navigation,
  Clock,
  User,
  Truck,
  Calendar,
  Phone,
  Plus,
  Trash2,
  GripVertical,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Settings,
  Filter,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Route,
  Home,
  Wrench,
  Timer,
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

interface TechnicianRouteToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type StopStatus = 'pending' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'skipped';
type Priority = 'emergency' | 'high' | 'normal' | 'low';

interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleId: string;
  homeAddress: string;
  specialties: string[];
  status: 'available' | 'on_route' | 'on_job' | 'off_duty';
  currentLocation: string;
  createdAt: string;
}

interface RouteStop {
  id: string;
  technicianId: string;
  routeDate: string;
  order: number;
  customerName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  serviceType: string;
  priority: Priority;
  status: StopStatus;
  scheduledTime: string;
  estimatedDuration: number; // minutes
  actualArrival: string;
  actualDeparture: string;
  notes: string;
  jobDescription: string;
  createdAt: string;
}

interface DailyRoute {
  id: string;
  technicianId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalStops: number;
  completedStops: number;
  totalMiles: number;
  status: 'planned' | 'active' | 'completed';
  notes: string;
  createdAt: string;
}

// Constants
const STOP_STATUSES: { status: StopStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'en_route', label: 'En Route' },
  { status: 'arrived', label: 'Arrived' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'completed', label: 'Completed' },
  { status: 'skipped', label: 'Skipped' },
];

const PRIORITIES: { priority: Priority; label: string }[] = [
  { priority: 'emergency', label: 'Emergency' },
  { priority: 'high', label: 'High' },
  { priority: 'normal', label: 'Normal' },
  { priority: 'low', label: 'Low' },
];

const SERVICE_TYPES = [
  'HVAC Repair',
  'HVAC Maintenance',
  'Plumbing Repair',
  'Plumbing Installation',
  'Electrical Repair',
  'Appliance Service',
  'Inspection',
  'Emergency Service',
];

const DEFAULT_TECHNICIANS: Technician[] = [
  {
    id: 'tech-1',
    name: 'John Smith',
    phone: '555-0101',
    email: 'john@example.com',
    vehicleId: 'VAN-001',
    homeAddress: '123 Main St',
    specialties: ['HVAC', 'Plumbing'],
    status: 'available',
    currentLocation: 'Office',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tech-2',
    name: 'Mike Johnson',
    phone: '555-0102',
    email: 'mike@example.com',
    vehicleId: 'VAN-002',
    homeAddress: '456 Oak Ave',
    specialties: ['HVAC'],
    status: 'on_route',
    currentLocation: 'En Route to 789 Pine St',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tech-3',
    name: 'Sarah Davis',
    phone: '555-0103',
    email: 'sarah@example.com',
    vehicleId: 'VAN-003',
    homeAddress: '789 Elm Blvd',
    specialties: ['Electrical', 'Appliance'],
    status: 'on_job',
    currentLocation: '321 Maple Dr',
    createdAt: new Date().toISOString(),
  },
];

// Column configurations for exports
const ROUTE_STOP_COLUMNS: ColumnConfig[] = [
  { key: 'order', header: 'Stop #', type: 'number' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'serviceType', header: 'Service Type', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'scheduledTime', header: 'Scheduled', type: 'string' },
  { key: 'estimatedDuration', header: 'Est. Duration (min)', type: 'number' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  return timeString;
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

// Main Component
export const TechnicianRouteTool: React.FC<TechnicianRouteToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: routeStops,
    addItem: addRouteStopToBackend,
    updateItem: updateRouteStopBackend,
    deleteItem: deleteRouteStopBackend,
    isSynced: routeStopsSynced,
    isSaving: routeStopsSaving,
    lastSaved: routeStopsLastSaved,
    forceSync: forceRouteStopsSync,
  } = useToolData<RouteStop>('technician-route-stops', [], ROUTE_STOP_COLUMNS);

  const {
    data: dailyRoutes,
    addItem: addDailyRouteToBackend,
    updateItem: updateDailyRouteBackend,
    deleteItem: deleteDailyRouteBackend,
    isSynced: dailyRoutesSynced,
    isSaving: dailyRoutesSaving,
    lastSaved: dailyRoutesLastSaved,
    forceSync: forceDailyRoutesSync,
  } = useToolData<DailyRoute>('technician-daily-routes', [], []);

  // Local UI State
  const [technicians] = useState<Technician[]>(DEFAULT_TECHNICIANS);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>(technicians[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [showAddStopForm, setShowAddStopForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'route' | 'team' | 'overview'>('route');
  const [draggedStopId, setDraggedStopId] = useState<string | null>(null);

  // New stop form state
  const [newStop, setNewStop] = useState<Partial<RouteStop>>({
    customerName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    serviceType: SERVICE_TYPES[0],
    priority: 'normal',
    scheduledTime: '',
    estimatedDuration: 60,
    jobDescription: '',
    notes: '',
  });

  // Get stops for selected technician and date
  const technicianStops = useMemo(() => {
    return routeStops
      .filter((stop) => stop.technicianId === selectedTechnicianId && stop.routeDate === selectedDate)
      .sort((a, b) => a.order - b.order);
  }, [routeStops, selectedTechnicianId, selectedDate]);

  // Calculate route stats
  const routeStats = useMemo(() => {
    const totalStops = technicianStops.length;
    const completed = technicianStops.filter((s) => s.status === 'completed').length;
    const inProgress = technicianStops.filter((s) => s.status === 'in_progress').length;
    const remaining = technicianStops.filter((s) => !['completed', 'skipped'].includes(s.status)).length;
    const totalDuration = technicianStops.reduce((sum, s) => sum + s.estimatedDuration, 0);

    return {
      totalStops,
      completed,
      inProgress,
      remaining,
      totalDuration,
      progress: totalStops > 0 ? Math.round((completed / totalStops) * 100) : 0,
    };
  }, [technicianStops]);

  // Team overview stats
  const teamStats = useMemo(() => {
    const todayStops = routeStops.filter((s) => s.routeDate === getTodayDate());
    const totalJobs = todayStops.length;
    const completedJobs = todayStops.filter((s) => s.status === 'completed').length;
    const inProgressJobs = todayStops.filter((s) => s.status === 'in_progress').length;
    const emergencies = todayStops.filter((s) => s.priority === 'emergency' && s.status !== 'completed').length;

    return {
      totalJobs,
      completedJobs,
      inProgressJobs,
      emergencies,
    };
  }, [routeStops]);

  // Add new stop
  const addStop = () => {
    if (!newStop.customerName || !newStop.address) {
      setValidationMessage('Please fill in customer name and address');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const stop: RouteStop = {
      id: generateId(),
      technicianId: selectedTechnicianId,
      routeDate: selectedDate,
      order: technicianStops.length + 1,
      customerName: newStop.customerName || '',
      address: newStop.address || '',
      city: newStop.city || '',
      state: newStop.state || '',
      zipCode: newStop.zipCode || '',
      phone: newStop.phone || '',
      serviceType: newStop.serviceType || SERVICE_TYPES[0],
      priority: newStop.priority || 'normal',
      status: 'pending',
      scheduledTime: newStop.scheduledTime || '',
      estimatedDuration: newStop.estimatedDuration || 60,
      actualArrival: '',
      actualDeparture: '',
      notes: newStop.notes || '',
      jobDescription: newStop.jobDescription || '',
      createdAt: new Date().toISOString(),
    };

    addRouteStopToBackend(stop);
    setShowAddStopForm(false);
    setNewStop({
      customerName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      serviceType: SERVICE_TYPES[0],
      priority: 'normal',
      scheduledTime: '',
      estimatedDuration: 60,
      jobDescription: '',
      notes: '',
    });
  };

  // Update stop status
  const updateStopStatus = (stopId: string, newStatus: StopStatus) => {
    const updates: Partial<RouteStop> = { status: newStatus };
    const now = new Date().toISOString();

    if (newStatus === 'arrived') {
      updates.actualArrival = now;
    } else if (newStatus === 'completed') {
      updates.actualDeparture = now;
    }

    updateRouteStopBackend(stopId, updates);
  };

  // Move stop up/down in order
  const moveStop = (stopId: string, direction: 'up' | 'down') => {
    const stopIndex = technicianStops.findIndex((s) => s.id === stopId);
    if (stopIndex === -1) return;

    const newIndex = direction === 'up' ? stopIndex - 1 : stopIndex + 1;
    if (newIndex < 0 || newIndex >= technicianStops.length) return;

    // Swap orders
    const currentStop = technicianStops[stopIndex];
    const swapStop = technicianStops[newIndex];

    updateRouteStopBackend(currentStop.id, { order: swapStop.order });
    updateRouteStopBackend(swapStop.id, { order: currentStop.order });
  };

  // Delete stop
  const deleteStop = async (stopId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to remove this stop?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteRouteStopBackend(stopId);
    // Re-order remaining stops
    const remainingStops = technicianStops.filter((s) => s.id !== stopId);
    remainingStops.forEach((stop, index) => {
      if (stop.order !== index + 1) {
        updateRouteStopBackend(stop.id, { order: index + 1 });
      }
    });
  };

  // Optimize route (simple sort by priority then scheduled time)
  const optimizeRoute = () => {
    const sorted = [...technicianStops]
      .filter((s) => s.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { emergency: 0, high: 1, normal: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
      });

    sorted.forEach((stop, index) => {
      updateRouteStopBackend(stop.id, { order: index + 1 });
    });
  };

  // Get status color
  const getStatusColor = (status: StopStatus) => {
    switch (status) {
      case 'pending':
        return theme === 'dark' ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700';
      case 'en_route':
        return theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'arrived':
        return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return theme === 'dark' ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700';
      case 'completed':
        return theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
      case 'skipped':
        return theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
      default:
        return theme === 'dark' ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
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

  // Get technician status color
  const getTechnicianStatusColor = (status: Technician['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'on_route':
        return 'bg-blue-500';
      case 'on_job':
        return 'bg-orange-500';
      case 'off_duty':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Export handlers
  const handleExport = async (format: string) => {
    const exportData = technicianStops.map((stop) => {
      const technician = technicians.find((t) => t.id === stop.technicianId);
      return {
        ...stop,
        technicianName: technician?.name || 'Unknown',
      };
    });

    switch (format) {
      case 'csv':
        exportToCSV(exportData, ROUTE_STOP_COLUMNS, 'technician-route');
        break;
      case 'excel':
        await exportToExcel(exportData, ROUTE_STOP_COLUMNS, 'technician-route');
        break;
      case 'json':
        exportToJSON(exportData, 'technician-route');
        break;
      case 'pdf':
        await exportToPDF(exportData, ROUTE_STOP_COLUMNS, 'Technician Route');
        break;
      case 'copy':
        await copyUtil(exportData, ROUTE_STOP_COLUMNS);
        break;
      case 'print':
        printData(exportData, ROUTE_STOP_COLUMNS, 'Technician Route');
        break;
    }
  };

  const selectedTechnician = technicians.find((t) => t.id === selectedTechnicianId);

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.technicianRoute.technicianRoutePlanning', 'Technician Route Planning')}
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.technicianRoute.planAndOptimizeDailyService', 'Plan and optimize daily service routes')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="technician-route" toolName="Technician Route" />

          <SyncStatus
            isSynced={routeStopsSynced && dailyRoutesSynced}
            isSaving={routeStopsSaving || dailyRoutesSaving}
            lastSaved={routeStopsLastSaved}
            onForceSync={() => {
              forceRouteStopsSync();
              forceDailyRoutesSync();
            }}
          />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Team Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Truck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {teamStats.totalJobs}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.technicianRoute.totalJobsToday', 'Total Jobs Today')}</p>
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
                  {teamStats.completedJobs}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.technicianRoute.completed', 'Completed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Wrench className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {teamStats.inProgressJobs}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.technicianRoute.inProgress', 'In Progress')}</p>
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
                  {teamStats.emergencies}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.technicianRoute.emergencies', 'Emergencies')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'route', label: 'Route Planner', icon: <Route className="w-4 h-4" /> },
          { id: 'team', label: 'Team View', icon: <User className="w-4 h-4" /> },
          { id: 'overview', label: 'Daily Overview', icon: <Calendar className="w-4 h-4" /> },
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

      {/* Route Planner Tab */}
      {activeTab === 'route' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Technician & Date Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {t('tools.technicianRoute.routeSettings', 'Route Settings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.technicianRoute.technician', 'Technician')}
                  </label>
                  <select
                    value={selectedTechnicianId}
                    onChange={(e) => setSelectedTechnicianId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.technicianRoute.date', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Route Summary */}
            {selectedTechnician && (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <div className={`w-3 h-3 rounded-full ${getTechnicianStatusColor(selectedTechnician.status)}`} />
                    {selectedTechnician.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{selectedTechnician.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{selectedTechnician.vehicleId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{selectedTechnician.currentLocation}</span>
                  </div>
                  <div className={`pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.technicianRoute.progress', 'Progress')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {routeStats.completed}/{routeStats.totalStops} stops
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-[#0D9488]"
                        style={{ width: `${routeStats.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.technicianRoute.estDuration', 'Est. Duration')}</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {Math.floor(routeStats.totalDuration / 60)}h {routeStats.totalDuration % 60}m
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <button
                onClick={() => setShowAddStopForm(true)}
                className="w-full py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.technicianRoute.addStop', 'Add Stop')}
              </button>
              <button
                onClick={optimizeRoute}
                disabled={technicianStops.length < 2}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${
                  technicianStops.length >= 2
                    ? theme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {t('tools.technicianRoute.optimizeRoute', 'Optimize Route')}
              </button>
            </div>
          </div>

          {/* Route Stops List */}
          <div className="lg:col-span-3">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span>Route for {formatDate(selectedDate)}</span>
                  <span className={`text-sm font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {technicianStops.length} stops
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {technicianStops.length > 0 ? (
                  <div className="space-y-3">
                    {technicianStops.map((stop, index) => (
                      <div
                        key={stop.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Stop Number */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            stop.status === 'completed' ? 'bg-green-500' : t('tools.technicianRoute.bg0d9488', 'bg-[#0D9488]')
                          }`}>
                            {stop.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              stop.order
                            )}
                          </div>

                          {/* Stop Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {stop.customerName}
                              </h3>
                              <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(stop.priority)}`}>
                                {stop.priority}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(stop.status)}`}>
                                {STOP_STATUSES.find((s) => s.status === stop.status)?.label}
                              </span>
                            </div>
                            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {stop.serviceType}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <MapPin className="w-3 h-3" />
                                {stop.address}, {stop.city}
                              </span>
                              {stop.scheduledTime && (
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <Clock className="w-3 h-3" />
                                  {formatTime(stop.scheduledTime)}
                                </span>
                              )}
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Timer className="w-3 h-3" />
                                {stop.estimatedDuration} min
                              </span>
                              {stop.phone && (
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <Phone className="w-3 h-3" />
                                  {stop.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {stop.status !== 'completed' && stop.status !== 'skipped' && (
                              <select
                                value={stop.status}
                                onChange={(e) => updateStopStatus(stop.id, e.target.value as StopStatus)}
                                className={`px-2 py-1 text-xs rounded border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-1 focus:ring-[#0D9488]`}
                              >
                                {STOP_STATUSES.map((s) => (
                                  <option key={s.status} value={s.status}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            )}
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => moveStop(stop.id, 'up')}
                                disabled={index === 0}
                                className={`p-1 rounded ${
                                  index === 0
                                    ? 'opacity-30 cursor-not-allowed'
                                    : theme === 'dark'
                                    ? 'hover:bg-gray-600'
                                    : 'hover:bg-gray-200'
                                }`}
                              >
                                <ArrowUp className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                              </button>
                              <button
                                onClick={() => moveStop(stop.id, 'down')}
                                disabled={index === technicianStops.length - 1}
                                className={`p-1 rounded ${
                                  index === technicianStops.length - 1
                                    ? 'opacity-30 cursor-not-allowed'
                                    : theme === 'dark'
                                    ? 'hover:bg-gray-600'
                                    : 'hover:bg-gray-200'
                                }`}
                              >
                                <ArrowDown className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                              </button>
                            </div>
                            <button
                              onClick={() => deleteStop(stop.id)}
                              className={`p-1 rounded ${
                                theme === 'dark' ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-200 text-red-500'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Route className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.technicianRoute.noStopsPlannedForThis', 'No stops planned for this date. Add stops to create a route!')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Team View Tab */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicians.map((tech) => {
            const techStops = routeStops.filter((s) => s.technicianId === tech.id && s.routeDate === getTodayDate());
            const completed = techStops.filter((s) => s.status === 'completed').length;
            const currentStop = techStops.find((s) => s.status === 'in_progress' || s.status === 'arrived');

            return (
              <Card
                key={tech.id}
                className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getTechnicianStatusColor(tech.status)}`}>
                      {tech.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {tech.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {tech.status.replace('_', ' ')}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tech.vehicleId}
                    </span>
                  </div>

                  {currentStop && (
                    <div className={`p-3 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.technicianRoute.currentJob', 'Current Job')}
                      </p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {currentStop.customerName}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {currentStop.address}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.technicianRoute.todaySProgress', 'Today\'s Progress')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {completed}/{techStops.length}
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-[#0D9488]"
                        style={{ width: `${techStops.length > 0 ? (completed / techStops.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <a
                      href={`tel:${tech.phone}`}
                      className={`flex-1 py-2 rounded-lg text-center text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Phone className="w-4 h-4 inline mr-1" />
                      {t('tools.technicianRoute.call', 'Call')}
                    </a>
                    <button
                      onClick={() => {
                        setSelectedTechnicianId(tech.id);
                        setActiveTab('route');
                      }}
                      className="flex-1 py-2 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0F766E]"
                    >
                      {t('tools.technicianRoute.viewRoute', 'View Route')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Daily Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.technicianRoute.date2', 'Date:')}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          {technicians.map((tech) => {
            const techStops = routeStops
              .filter((s) => s.technicianId === tech.id && s.routeDate === selectedDate)
              .sort((a, b) => a.order - b.order);

            if (techStops.length === 0) return null;

            return (
              <Card
                key={tech.id}
                className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              >
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <div className={`w-3 h-3 rounded-full ${getTechnicianStatusColor(tech.status)}`} />
                    {tech.name} - {techStops.length} stops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`text-left py-2 px-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            #
                          </th>
                          <th className={`text-left py-2 px-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('tools.technicianRoute.customer', 'Customer')}
                          </th>
                          <th className={`text-left py-2 px-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('tools.technicianRoute.address', 'Address')}
                          </th>
                          <th className={`text-left py-2 px-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('tools.technicianRoute.time', 'Time')}
                          </th>
                          <th className={`text-left py-2 px-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('tools.technicianRoute.service', 'Service')}
                          </th>
                          <th className={`text-left py-2 px-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('tools.technicianRoute.status', 'Status')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {techStops.map((stop) => (
                          <tr
                            key={stop.id}
                            className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                          >
                            <td className={`py-2 px-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {stop.order}
                            </td>
                            <td className={`py-2 px-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {stop.customerName}
                            </td>
                            <td className={`py-2 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {stop.address}, {stop.city}
                            </td>
                            <td className={`py-2 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {stop.scheduledTime || '-'}
                            </td>
                            <td className={`py-2 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {stop.serviceType}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(stop.status)}`}>
                                {STOP_STATUSES.find((s) => s.status === stop.status)?.label}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Stop Modal */}
      {showAddStopForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span>{t('tools.technicianRoute.addRouteStop', 'Add Route Stop')}</span>
                <button onClick={() => setShowAddStopForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.technicianRoute.customerName', 'Customer Name *')}
                  </label>
                  <input
                    type="text"
                    value={newStop.customerName}
                    onChange={(e) => setNewStop({ ...newStop, customerName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.technicianRoute.address2', 'Address *')}
                  </label>
                  <input
                    type="text"
                    value={newStop.address}
                    onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
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
                      {t('tools.technicianRoute.city', 'City')}
                    </label>
                    <input
                      type="text"
                      value={newStop.city}
                      onChange={(e) => setNewStop({ ...newStop, city: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.technicianRoute.state', 'State')}
                    </label>
                    <input
                      type="text"
                      value={newStop.state}
                      onChange={(e) => setNewStop({ ...newStop, state: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.technicianRoute.zip', 'Zip')}
                    </label>
                    <input
                      type="text"
                      value={newStop.zipCode}
                      onChange={(e) => setNewStop({ ...newStop, zipCode: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.technicianRoute.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={newStop.phone}
                      onChange={(e) => setNewStop({ ...newStop, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.technicianRoute.scheduledTime', 'Scheduled Time')}
                    </label>
                    <input
                      type="time"
                      value={newStop.scheduledTime}
                      onChange={(e) => setNewStop({ ...newStop, scheduledTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.technicianRoute.serviceType', 'Service Type')}
                    </label>
                    <select
                      value={newStop.serviceType}
                      onChange={(e) => setNewStop({ ...newStop, serviceType: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {SERVICE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.technicianRoute.priority', 'Priority')}
                    </label>
                    <select
                      value={newStop.priority}
                      onChange={(e) => setNewStop({ ...newStop, priority: e.target.value as Priority })}
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
                    {t('tools.technicianRoute.estimatedDurationMinutes', 'Estimated Duration (minutes)')}
                  </label>
                  <input
                    type="number"
                    value={newStop.estimatedDuration}
                    onChange={(e) => setNewStop({ ...newStop, estimatedDuration: parseInt(e.target.value) || 60 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.technicianRoute.jobDescription', 'Job Description')}
                  </label>
                  <textarea
                    value={newStop.jobDescription}
                    onChange={(e) => setNewStop({ ...newStop, jobDescription: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowAddStopForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.technicianRoute.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addStop}
                    className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  >
                    {t('tools.technicianRoute.addStop2', 'Add Stop')}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default TechnicianRouteTool;
