'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Plus,
  Trash2,
  Search,
  Navigation,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Home,
  Building2,
  Route,
  Package,
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

interface RoutePickupToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
type PickupType = 'residential' | 'commercial' | 'hotel' | 'office';
type PickupStatus = 'scheduled' | 'en_route' | 'picked_up' | 'cancelled' | 'no_show';
type TimeWindow = 'morning' | 'afternoon' | 'evening' | 'anytime';

interface PickupStop {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  pickupType: PickupType;
  timeWindow: TimeWindow;
  scheduledDate: string;
  scheduledTime: string;
  estimatedBags: number;
  specialInstructions: string;
  status: PickupStatus;
  routeOrder: number;
  actualPickupTime: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryRoute {
  id: string;
  routeName: string;
  driverId: string;
  driverName: string;
  routeDate: string;
  stops: PickupStop[];
  status: 'planning' | 'active' | 'completed';
  startTime: string;
  endTime: string;
  totalMiles: number;
  createdAt: string;
}

// Constants
const PICKUP_TYPES: { type: PickupType; label: string; icon: React.ReactNode }[] = [
  { type: 'residential', label: 'Residential', icon: <Home className="w-4 h-4" /> },
  { type: 'commercial', label: 'Commercial', icon: <Building2 className="w-4 h-4" /> },
  { type: 'hotel', label: 'Hotel', icon: <Building2 className="w-4 h-4" /> },
  { type: 'office', label: 'Office', icon: <Building2 className="w-4 h-4" /> },
];

const TIME_WINDOWS: { window: TimeWindow; label: string; hours: string }[] = [
  { window: 'morning', label: 'Morning', hours: '8 AM - 12 PM' },
  { window: 'afternoon', label: 'Afternoon', hours: '12 PM - 5 PM' },
  { window: 'evening', label: 'Evening', hours: '5 PM - 8 PM' },
  { window: 'anytime', label: 'Anytime', hours: 'Flexible' },
];

const STATUS_OPTIONS: { status: PickupStatus; label: string; color: string }[] = [
  { status: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
  { status: 'en_route', label: 'En Route', color: 'bg-yellow-500' },
  { status: 'picked_up', label: 'Picked Up', color: 'bg-green-500' },
  { status: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' },
  { status: 'no_show', label: 'No Show', color: 'bg-red-500' },
];

// Column config for exports
const PICKUP_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', width: 20 },
  { key: 'address', header: 'Address', width: 30 },
  { key: 'phone', header: 'Phone', width: 15 },
  { key: 'timeWindow', header: 'Time Window', width: 12 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'scheduledDate', header: 'Date', width: 12 },
  { key: 'estimatedBags', header: 'Bags', width: 8 },
];

// Generate unique ID
const generateId = () => `pickup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function RoutePickupTool({
  uiConfig }: RoutePickupToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const isPrefilled = uiConfig?.prefillData && Object.keys(uiConfig.prefillData).length > 0;

  // Use the useToolData hook for backend sync
  const {
    data: pickups,
    addItem: addPickupToBackend,
    updateItem: updatePickupBackend,
    deleteItem: deletePickupBackend,
    isSynced: pickupsSynced,
    isSaving: pickupsSaving,
    lastSaved: pickupsLastSaved,
    syncError: pickupsSyncError,
    forceSync: forcePickupsSync,
  } = useToolData<PickupStop>('route-pickup', [], PICKUP_COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<'pickups' | 'schedule' | 'route'>('pickups');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PickupStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [showNewPickupForm, setShowNewPickupForm] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // New pickup form state
  const [newPickup, setNewPickup] = useState<Partial<PickupStop>>({
    customerName: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    pickupType: 'residential',
    timeWindow: 'morning',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '',
    estimatedBags: 1,
    specialInstructions: '',
    status: 'scheduled',
  });

  // Create new pickup
  const createPickup = () => {
    if (!newPickup.customerName || !newPickup.address || !newPickup.phone) {
      setValidationMessage('Please fill in customer name, phone, and address');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const pickup: PickupStop = {
      id: generateId(),
      customerId: generateId(),
      customerName: newPickup.customerName,
      phone: newPickup.phone || '',
      address: newPickup.address,
      city: newPickup.city || '',
      zipCode: newPickup.zipCode || '',
      pickupType: newPickup.pickupType || 'residential',
      timeWindow: newPickup.timeWindow || 'morning',
      scheduledDate: newPickup.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: newPickup.scheduledTime || '',
      estimatedBags: newPickup.estimatedBags || 1,
      specialInstructions: newPickup.specialInstructions || '',
      status: 'scheduled',
      routeOrder: pickups.filter(p => p.scheduledDate === newPickup.scheduledDate).length + 1,
      actualPickupTime: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addPickupToBackend(pickup);
    setNewPickup({
      customerName: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      pickupType: 'residential',
      timeWindow: 'morning',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '',
      estimatedBags: 1,
      specialInstructions: '',
      status: 'scheduled',
    });
    setShowNewPickupForm(false);
  };

  // Update pickup status
  const updatePickupStatus = (pickupId: string, status: PickupStatus) => {
    const updates: Partial<PickupStop> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'picked_up') {
      updates.actualPickupTime = new Date().toTimeString().slice(0, 5);
    }

    updatePickupBackend(pickupId, updates);
  };

  // Delete pickup
  const deletePickup = async (pickupId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this pickup?');
    if (confirmed) {
      deletePickupBackend(pickupId);
    }
  };

  // Move pickup in route order
  const movePickup = (pickupId: string, direction: 'up' | 'down') => {
    const pickup = pickups.find(p => p.id === pickupId);
    if (!pickup) return;

    const sameDatePickups = pickups
      .filter(p => p.scheduledDate === pickup.scheduledDate)
      .sort((a, b) => a.routeOrder - b.routeOrder);

    const currentIndex = sameDatePickups.findIndex(p => p.id === pickupId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= sameDatePickups.length) return;

    const swapPickup = sameDatePickups[newIndex];
    updatePickupBackend(pickupId, { routeOrder: swapPickup.routeOrder });
    updatePickupBackend(swapPickup.id, { routeOrder: pickup.routeOrder });
  };

  // Filtered pickups
  const filteredPickups = useMemo(() => {
    return pickups
      .filter(pickup => {
        const matchesSearch =
          searchTerm === '' ||
          pickup.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pickup.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pickup.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || pickup.status === statusFilter;
        const matchesDate = !dateFilter || pickup.scheduledDate === dateFilter;
        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => a.routeOrder - b.routeOrder);
  }, [pickups, searchTerm, statusFilter, dateFilter]);

  // Stats
  const stats = useMemo(() => {
    const todayPickups = pickups.filter(p => p.scheduledDate === new Date().toISOString().split('T')[0]);
    return {
      total: pickups.length,
      todayTotal: todayPickups.length,
      scheduled: todayPickups.filter(p => p.status === 'scheduled').length,
      enRoute: todayPickups.filter(p => p.status === 'en_route').length,
      completed: todayPickups.filter(p => p.status === 'picked_up').length,
      cancelled: todayPickups.filter(p => p.status === 'cancelled' || p.status === 'no_show').length,
      totalBags: todayPickups.reduce((sum, p) => sum + p.estimatedBags, 0),
    };
  }, [pickups]);

  // Group pickups by time window for route view
  const pickupsByTimeWindow = useMemo(() => {
    const filtered = pickups.filter(p => p.scheduledDate === dateFilter);
    return {
      morning: filtered.filter(p => p.timeWindow === 'morning').sort((a, b) => a.routeOrder - b.routeOrder),
      afternoon: filtered.filter(p => p.timeWindow === 'afternoon').sort((a, b) => a.routeOrder - b.routeOrder),
      evening: filtered.filter(p => p.timeWindow === 'evening').sort((a, b) => a.routeOrder - b.routeOrder),
      anytime: filtered.filter(p => p.timeWindow === 'anytime').sort((a, b) => a.routeOrder - b.routeOrder),
    };
  }, [pickups, dateFilter]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.routePickup.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.routePickup.routePickupScheduler', 'Route Pickup Scheduler')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.routePickup.schedulePickupsOptimizeRoutesAnd', 'Schedule pickups, optimize routes, and track deliveries')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="route-pickup" toolName="Route Pickup" />

              <SyncStatus
                isSynced={pickupsSynced}
                isSaving={pickupsSaving}
                lastSaved={pickupsLastSaved}
                syncError={pickupsSyncError}
                onForceSync={forcePickupsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(pickups, PICKUP_COLUMNS, { filename: 'route-pickups' })}
                onExportExcel={() => exportToExcel(pickups, PICKUP_COLUMNS, { filename: 'route-pickups' })}
                onExportJSON={() => exportToJSON(pickups, { filename: 'route-pickups' })}
                onExportPDF={async () => {
                  await exportToPDF(pickups, PICKUP_COLUMNS, {
                    filename: 'route-pickups',
                    title: 'Route Pickups Report',
                    subtitle: `${pickups.length} pickups`,
                  });
                }}
                onPrint={() => printData(pickups, PICKUP_COLUMNS, { title: 'Route Pickups' })}
                onCopyToClipboard={async () => await copyUtil(pickups, PICKUP_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.routePickup.todayTotal', 'Today Total')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.todayTotal}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{t('tools.routePickup.scheduled', 'Scheduled')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>{stats.scheduled}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.routePickup.enRoute', 'En Route')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>{stats.enRoute}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{t('tools.routePickup.completed', 'Completed')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>{stats.completed}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{t('tools.routePickup.cancelled', 'Cancelled')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{stats.cancelled}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{t('tools.routePickup.estBags', 'Est. Bags')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>{stats.totalBags}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>{t('tools.routePickup.allPickups', 'All Pickups')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-teal-300' : 'text-teal-700'}`}>{stats.total}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'pickups', label: 'All Pickups', icon: <Package className="w-4 h-4" /> },
              { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
              { id: 'route', label: 'Route View', icon: <Route className="w-4 h-4" /> },
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
            <button
              onClick={() => setShowNewPickupForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0D9488]/90 transition-colors ml-auto"
            >
              <Plus className="w-4 h-4" />
              {t('tools.routePickup.newPickup', 'New Pickup')}
            </button>
          </div>
        </div>

        {/* New Pickup Form Modal */}
        {showNewPickupForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.routePickup.scheduleNewPickup', 'Schedule New Pickup')}
                  </h2>
                  <button
                    onClick={() => setShowNewPickupForm(false)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <XCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.routePickup.customerName', 'Customer Name *')}
                    </label>
                    <input
                      type="text"
                      value={newPickup.customerName || ''}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, customerName: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.routePickup.johnDoe', 'John Doe')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.routePickup.phone', 'Phone *')}
                    </label>
                    <input
                      type="tel"
                      value={newPickup.phone || ''}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.routePickup.address', 'Address *')}
                    </label>
                    <input
                      type="text"
                      value={newPickup.address || ''}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, address: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.routePickup.123MainStreet', '123 Main Street')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.routePickup.city', 'City')}
                    </label>
                    <input
                      type="text"
                      value={newPickup.city || ''}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, city: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.routePickup.city2', 'City')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.routePickup.zipCode', 'ZIP Code')}
                    </label>
                    <input
                      type="text"
                      value={newPickup.zipCode || ''}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, zipCode: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="12345"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.routePickup.pickupType', 'Pickup Type')}
                    </label>
                    <select
                      value={newPickup.pickupType || 'residential'}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, pickupType: e.target.value as PickupType }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {PICKUP_TYPES.map(t => (
                        <option key={t.type} value={t.type}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.routePickup.timeWindow', 'Time Window')}
                    </label>
                    <select
                      value={newPickup.timeWindow || 'morning'}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, timeWindow: e.target.value as TimeWindow }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {TIME_WINDOWS.map(t => (
                        <option key={t.window} value={t.window}>{t.label} ({t.hours})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.routePickup.scheduledDate', 'Scheduled Date')}
                    </label>
                    <input
                      type="date"
                      value={newPickup.scheduledDate || ''}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.routePickup.estimatedBags', 'Estimated Bags')}
                    </label>
                    <input
                      type="number"
                      value={newPickup.estimatedBags || 1}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, estimatedBags: parseInt(e.target.value) || 1 }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.routePickup.specialInstructions', 'Special Instructions')}
                    </label>
                    <textarea
                      value={newPickup.specialInstructions || ''}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      rows={2}
                      placeholder={t('tools.routePickup.gateCodeLeaveAtDoor', 'Gate code, leave at door, etc.')}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowNewPickupForm(false)}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {t('tools.routePickup.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={createPickup}
                    className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0D9488]/90 transition-colors"
                  >
                    {t('tools.routePickup.schedulePickup', 'Schedule Pickup')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('tools.routePickup.searchByNameAddressOr', 'Search by name, address, or phone...')}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === 'all'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t('tools.routePickup.all', 'All')}
              </button>
              {STATUS_OPTIONS.map(status => (
                <button
                  key={status.status}
                  onClick={() => setStatusFilter(status.status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    statusFilter === status.status
                      ? `${status.color} text-white`
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Route View */}
        {activeTab === 'route' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TIME_WINDOWS.map(window => (
              <div key={window.window} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {window.label} <span className={`text-sm font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>({window.hours})</span>
                </h3>
                <div className="space-y-2">
                  {pickupsByTimeWindow[window.window].map((pickup, index) => (
                    <div
                      key={pickup.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        STATUS_OPTIONS.find(s => s.status === pickup.status)?.color || 'bg-gray-500'
                      } text-white text-sm font-bold`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {pickup.customerName}
                        </p>
                        <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {pickup.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => movePickup(pickup.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${
                            index === 0 ? 'opacity-30' : 'hover:bg-gray-600'
                          }`}
                        >
                          <Navigation className={`w-4 h-4 rotate-180 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                        <button
                          onClick={() => movePickup(pickup.id, 'down')}
                          disabled={index === pickupsByTimeWindow[window.window].length - 1}
                          className={`p-1 rounded ${
                            index === pickupsByTimeWindow[window.window].length - 1 ? 'opacity-30' : 'hover:bg-gray-600'
                          }`}
                        >
                          <Navigation className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {pickupsByTimeWindow[window.window].length === 0 && (
                    <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('tools.routePickup.noPickupsScheduled', 'No pickups scheduled')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pickups List */}
        {(activeTab === 'pickups' || activeTab === 'schedule') && (
          <div className="space-y-4">
            {filteredPickups.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
                <Truck className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.routePickup.noPickupsFound', 'No pickups found')}
                </h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {searchTerm || statusFilter !== 'all'
                    ? t('tools.routePickup.tryAdjustingYourSearchOr', 'Try adjusting your search or filters') : t('tools.routePickup.scheduleANewPickupTo', 'Schedule a new pickup to get started')}
                </p>
              </div>
            ) : (
              filteredPickups.map(pickup => (
                <div
                  key={pickup.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        STATUS_OPTIONS.find(s => s.status === pickup.status)?.color || 'bg-gray-500'
                      }`}>
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {pickup.customerName}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            STATUS_OPTIONS.find(s => s.status === pickup.status)?.color || 'bg-gray-500'
                          } text-white`}>
                            {STATUS_OPTIONS.find(s => s.status === pickup.status)?.label}
                          </span>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {pickup.address}, {pickup.city} {pickup.zipCode}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Phone className="w-4 h-4 inline mr-1" />
                          {pickup.phone}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {pickup.scheduledDate}
                          </span>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Clock className="w-4 h-4 inline mr-1" />
                            {TIME_WINDOWS.find(t => t.window === pickup.timeWindow)?.label}
                          </span>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Package className="w-4 h-4 inline mr-1" />
                            {pickup.estimatedBags} bag(s)
                          </span>
                        </div>
                        {pickup.specialInstructions && (
                          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            {pickup.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={pickup.status}
                        onChange={(e) => updatePickupStatus(pickup.id, e.target.value as PickupStatus)}
                        className={`px-3 py-1.5 rounded-lg text-sm border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status.status} value={status.status}>{status.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => deletePickup(pickup.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-40">
            <AlertCircle className="w-4 h-4" />
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
}

export default RoutePickupTool;
