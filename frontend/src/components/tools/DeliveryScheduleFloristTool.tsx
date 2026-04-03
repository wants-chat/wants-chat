'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Truck,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Route,
  Navigation,
  Package,
  Flower2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  Sparkles,
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

interface DeliveryScheduleFloristToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
type DeliveryStatus = 'scheduled' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
type DeliveryPriority = 'normal' | 'rush' | 'same-day';
type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'specific';

interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  zipCode: string;
  deliveryDate: string;
  timeSlot: TimeSlot;
  specificTime?: string;
  priority: DeliveryPriority;
  status: DeliveryStatus;
  driverId?: string;
  driverName?: string;
  items: string;
  specialInstructions: string;
  signature?: string;
  deliveredAt?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  available: boolean;
  currentDeliveries: number;
}

// Constants
const TIME_SLOTS: { value: TimeSlot; label: string; range: string }[] = [
  { value: 'morning', label: 'Morning', range: '8:00 AM - 12:00 PM' },
  { value: 'afternoon', label: 'Afternoon', range: '12:00 PM - 5:00 PM' },
  { value: 'evening', label: 'Evening', range: '5:00 PM - 8:00 PM' },
  { value: 'specific', label: 'Specific Time', range: 'Custom' },
];

const DELIVERY_STATUSES: { value: DeliveryStatus; label: string; color: string }[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'in_transit', label: 'In Transit', color: 'yellow' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
];

const PRIORITIES: { value: DeliveryPriority; label: string; surcharge: number }[] = [
  { value: 'normal', label: 'Normal', surcharge: 0 },
  { value: 'rush', label: 'Rush (2-4 hours)', surcharge: 15 },
  { value: 'same-day', label: 'Same Day', surcharge: 10 },
];

const DEFAULT_DRIVERS: Driver[] = [
  { id: 'driver-1', name: 'John Smith', phone: '(555) 123-4567', vehicle: 'Van #1', available: true, currentDeliveries: 3 },
  { id: 'driver-2', name: 'Sarah Johnson', phone: '(555) 234-5678', vehicle: 'Van #2', available: true, currentDeliveries: 2 },
  { id: 'driver-3', name: 'Mike Davis', phone: '(555) 345-6789', vehicle: 'Car #1', available: false, currentDeliveries: 5 },
];

// Column configurations for exports
const DELIVERY_COLUMNS: ColumnConfig[] = [
  { key: 'orderId', header: 'Order ID', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'recipientName', header: 'Recipient', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'deliveryDate', header: 'Date', type: 'date' },
  { key: 'timeSlot', header: 'Time Slot', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'driverName', header: 'Driver', type: 'string' },
  { key: 'items', header: 'Items', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Main Component
export const DeliveryScheduleFloristTool: React.FC<DeliveryScheduleFloristToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hook for backend sync
  const {
    data: deliveries,
    addItem: addDeliveryToBackend,
    updateItem: updateDeliveryBackend,
    deleteItem: deleteDeliveryBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Delivery>('florist-deliveries', [], DELIVERY_COLUMNS);

  // Local State
  const [drivers] = useState<Driver[]>(DEFAULT_DRIVERS);
  const [activeTab, setActiveTab] = useState<'schedule' | 'new-delivery' | 'drivers'>('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDriver, setFilterDriver] = useState<string>('all');
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  // New delivery form state
  const [newDelivery, setNewDelivery] = useState<Partial<Delivery>>({
    orderId: '',
    customerName: '',
    customerPhone: '',
    recipientName: '',
    recipientPhone: '',
    address: '',
    city: '',
    zipCode: '',
    deliveryDate: selectedDate,
    timeSlot: 'morning',
    specificTime: '',
    priority: 'normal',
    status: 'scheduled',
    driverId: '',
    driverName: '',
    items: '',
    specialInstructions: '',
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery edit mode
      if (params.isEditFromGallery) {
        if (params.newDelivery) {
          setNewDelivery(params.newDelivery);
        } else {
          setNewDelivery((prev) => ({
            ...prev,
            orderId: params.orderId || '',
            customerName: params.customerName || params.customer || '',
            customerPhone: params.customerPhone || params.phone || '',
            recipientName: params.recipientName || params.recipient || '',
            recipientPhone: params.recipientPhone || '',
            address: params.address || '',
            city: params.city || '',
            zipCode: params.zipCode || params.zip || '',
            deliveryDate: params.deliveryDate || params.date || selectedDate,
            timeSlot: params.timeSlot || 'morning',
            priority: params.priority || 'normal',
            items: params.items || params.flowers || '',
            specialInstructions: params.specialInstructions || '',
            driverId: params.driverId || '',
          }));
        }
        if (params.selectedDate) setSelectedDate(params.selectedDate);
        setActiveTab('new-delivery');
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Regular prefill from AI
        if (params.address || params.recipientName || params.customerName) {
          setNewDelivery((prev) => ({
            ...prev,
            orderId: params.orderId || '',
            customerName: params.customerName || params.customer || '',
            customerPhone: params.customerPhone || params.phone || '',
            recipientName: params.recipientName || params.recipient || '',
            recipientPhone: params.recipientPhone || '',
            address: params.address || '',
            city: params.city || '',
            zipCode: params.zipCode || params.zip || '',
            deliveryDate: params.deliveryDate || params.date || selectedDate,
            items: params.items || params.flowers || '',
          }));
          setActiveTab('new-delivery');
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params, selectedDate, isPrefilled]);

  // Submit new delivery
  const submitDelivery = () => {
    if (!newDelivery.recipientName || !newDelivery.address || !newDelivery.deliveryDate) {
      setValidationMessage('Please fill in recipient name, address, and delivery date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const driver = drivers.find((d) => d.id === newDelivery.driverId);

    const delivery: Delivery = {
      id: generateId(),
      orderId: newDelivery.orderId || generateId().toUpperCase(),
      customerName: newDelivery.customerName || '',
      customerPhone: newDelivery.customerPhone || '',
      recipientName: newDelivery.recipientName || '',
      recipientPhone: newDelivery.recipientPhone || '',
      address: newDelivery.address || '',
      city: newDelivery.city || '',
      zipCode: newDelivery.zipCode || '',
      deliveryDate: newDelivery.deliveryDate || '',
      timeSlot: newDelivery.timeSlot || 'morning',
      specificTime: newDelivery.specificTime,
      priority: newDelivery.priority || 'normal',
      status: 'scheduled',
      driverId: newDelivery.driverId,
      driverName: driver?.name,
      items: newDelivery.items || '',
      specialInstructions: newDelivery.specialInstructions || '',
      notes: newDelivery.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addDeliveryToBackend(delivery);

    // Call onSaveCallback if provided (for gallery edit mode)
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }

    // Reset form
    setNewDelivery({
      orderId: '',
      customerName: '',
      customerPhone: '',
      recipientName: '',
      recipientPhone: '',
      address: '',
      city: '',
      zipCode: '',
      deliveryDate: selectedDate,
      timeSlot: 'morning',
      specificTime: '',
      priority: 'normal',
      status: 'scheduled',
      driverId: '',
      driverName: '',
      items: '',
      specialInstructions: '',
      notes: '',
    });

    setActiveTab('schedule');
  };

  // Update delivery status
  const updateDeliveryStatus = (deliveryId: string, status: DeliveryStatus) => {
    const updates: Partial<Delivery> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'delivered') {
      updates.deliveredAt = new Date().toISOString();
    }

    updateDeliveryBackend(deliveryId, updates);
  };

  // Assign driver
  const assignDriver = (deliveryId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    updateDeliveryBackend(deliveryId, {
      driverId,
      driverName: driver?.name,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete delivery
  const deleteDelivery = async (deliveryId: string) => {
    const confirmed = await confirm({
      title: 'Delete Delivery',
      message: 'Are you sure you want to delete this delivery?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteDeliveryBackend(deliveryId);
    }
  };

  // Filtered deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
      const matchesSearch =
        searchTerm === '' ||
        delivery.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || delivery.status === filterStatus;
      const matchesDriver = filterDriver === 'all' || delivery.driverId === filterDriver;
      const matchesDate = delivery.deliveryDate === selectedDate;
      return matchesSearch && matchesStatus && matchesDriver && matchesDate;
    });
  }, [deliveries, searchTerm, filterStatus, filterDriver, selectedDate]);

  // Group deliveries by time slot
  const deliveriesByTimeSlot = useMemo(() => {
    const grouped: Record<TimeSlot, Delivery[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      specific: [],
    };

    filteredDeliveries.forEach((delivery) => {
      grouped[delivery.timeSlot].push(delivery);
    });

    return grouped;
  }, [filteredDeliveries]);

  // Statistics
  const stats = useMemo(() => {
    const todayDeliveries = deliveries.filter((d) => d.deliveryDate === selectedDate);
    const completed = todayDeliveries.filter((d) => d.status === 'delivered').length;
    const pending = todayDeliveries.filter((d) => d.status === 'scheduled' || d.status === 'in_transit').length;
    const failed = todayDeliveries.filter((d) => d.status === 'failed').length;

    return {
      total: todayDeliveries.length,
      completed,
      pending,
      failed,
      completionRate: todayDeliveries.length > 0 ? Math.round((completed / todayDeliveries.length) * 100) : 0,
    };
  }, [deliveries, selectedDate]);

  const getStatusColor = (status: DeliveryStatus) => {
    const statusConfig = DELIVERY_STATUSES.find((s) => s.value === status);
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colorMap[statusConfig?.color || 'gray'];
  };

  const getPriorityColor = (priority: DeliveryPriority) => {
    const colorMap: Record<DeliveryPriority, string> = {
      normal: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      rush: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'same-day': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colorMap[priority];
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Validation Toast */}
        {validationMessage && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-red-500/10 rounded-xl border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500 font-medium">{validationMessage}</span>
          </div>
        )}

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-pink-500 font-medium">{t('tools.deliveryScheduleFlorist.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.deliveryScheduleFlorist.deliverySchedule', 'Delivery Schedule')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.deliveryScheduleFlorist.manageFlowerDeliveriesAndRoutes', 'Manage flower deliveries and routes')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="delivery-schedule-florist" toolName="Delivery Schedule Florist" />

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
                onExportCSV={() => exportToCSV(deliveries, DELIVERY_COLUMNS, { filename: 'florist-deliveries' })}
                onExportExcel={() => exportToExcel(deliveries, DELIVERY_COLUMNS, { filename: 'florist-deliveries' })}
                onExportJSON={() => exportToJSON(deliveries, { filename: 'florist-deliveries' })}
                onExportPDF={async () => {
                  await exportToPDF(deliveries, DELIVERY_COLUMNS, {
                    filename: 'florist-deliveries',
                    title: 'Delivery Schedule',
                    subtitle: `${formatDate(selectedDate)} - ${deliveries.length} deliveries`,
                  });
                }}
                onPrint={() => printData(deliveries, DELIVERY_COLUMNS, { title: 'Delivery Schedule' })}
                onCopyToClipboard={async () => await copyUtil(deliveries, DELIVERY_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Date Selector and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} col-span-1`}>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.deliveryScheduleFlorist.deliveryDate', 'Delivery Date')}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliveryScheduleFlorist.total', 'Total')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliveryScheduleFlorist.completed', 'Completed')}</p>
              <p className={`text-2xl font-bold text-green-500`}>{stats.completed}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliveryScheduleFlorist.pending', 'Pending')}</p>
              <p className={`text-2xl font-bold text-yellow-500`}>{stats.pending}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliveryScheduleFlorist.completion', 'Completion')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.completionRate}%</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
              { id: 'new-delivery', label: 'New Delivery', icon: <Plus className="w-4 h-4" /> },
              { id: 'drivers', label: 'Drivers', icon: <User className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-500 text-white'
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

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.deliveryScheduleFlorist.searchDeliveries', 'Search deliveries...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.deliveryScheduleFlorist.allStatuses', 'All Statuses')}</option>
                {DELIVERY_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <select
                value={filterDriver}
                onChange={(e) => setFilterDriver(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.deliveryScheduleFlorist.allDrivers', 'All Drivers')}</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
              <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-700">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 shadow'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {t('tools.deliveryScheduleFlorist.list', 'List')}
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 rounded ${
                    viewMode === 'timeline'
                      ? 'bg-white dark:bg-gray-600 shadow'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {t('tools.deliveryScheduleFlorist.timeline', 'Timeline')}
                </button>
              </div>
            </div>

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <div className="space-y-6">
                {TIME_SLOTS.map((slot) => (
                  <div key={slot.value}>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {slot.label}
                      </h3>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({slot.range})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {deliveriesByTimeSlot[slot.value].length}
                      </span>
                    </div>
                    {deliveriesByTimeSlot[slot.value].length === 0 ? (
                      <div className={`text-center py-4 rounded-lg border-2 border-dashed ${
                        theme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
                      }`}>
                        {t('tools.deliveryScheduleFlorist.noDeliveriesScheduled', 'No deliveries scheduled')}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {deliveriesByTimeSlot[slot.value].map((delivery) => (
                          <DeliveryCard
                            key={delivery.id}
                            delivery={delivery}
                            theme={theme}
                            drivers={drivers}
                            onStatusChange={updateDeliveryStatus}
                            onAssignDriver={assignDriver}
                            onDelete={deleteDelivery}
                            getStatusColor={getStatusColor}
                            getPriorityColor={getPriorityColor}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredDeliveries.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.deliveryScheduleFlorist.noDeliveriesFoundForThis', 'No deliveries found for this date')}</p>
                  </div>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className={`border rounded-lg overflow-hidden ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    >
                      <div
                        className={`p-4 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                        onClick={() => setExpandedDeliveryId(expandedDeliveryId === delivery.id ? null : delivery.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <Flower2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {delivery.recipientName}
                              </h3>
                              <p className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <MapPin className="w-3 h-3" /> {delivery.address}, {delivery.city}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {TIME_SLOTS.find((s) => s.value === delivery.timeSlot)?.label}
                                {delivery.specificTime && ` - ${delivery.specificTime}`}
                              </p>
                              {delivery.driverName && (
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Driver: {delivery.driverName}
                                </p>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                              {PRIORITIES.find((p) => p.value === delivery.priority)?.label}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                              {DELIVERY_STATUSES.find((s) => s.value === delivery.status)?.label}
                            </span>
                            {expandedDeliveryId === delivery.id ? (
                              <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            ) : (
                              <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedDeliveryId === delivery.id && (
                        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliveryScheduleFlorist.orderInfo', 'Order Info')}</p>
                              <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Order: {delivery.orderId}</p>
                              <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Customer: {delivery.customerName}</p>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliveryScheduleFlorist.recipientContact', 'Recipient Contact')}</p>
                              <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <Phone className="w-4 h-4" /> {delivery.recipientPhone || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliveryScheduleFlorist.items', 'Items')}</p>
                              <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{delivery.items || 'N/A'}</p>
                            </div>
                          </div>

                          {delivery.specialInstructions && (
                            <div className="mb-4">
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliveryScheduleFlorist.specialInstructions', 'Special Instructions')}</p>
                              <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{delivery.specialInstructions}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <select
                              value={delivery.status}
                              onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value as DeliveryStatus)}
                              className={`px-3 py-1 rounded-lg text-sm border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              {DELIVERY_STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                              ))}
                            </select>
                            <select
                              value={delivery.driverId || ''}
                              onChange={(e) => assignDriver(delivery.id, e.target.value)}
                              className={`px-3 py-1 rounded-lg text-sm border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="">{t('tools.deliveryScheduleFlorist.assignDriver', 'Assign Driver')}</option>
                              {drivers.filter((d) => d.available).map((driver) => (
                                <option key={driver.id} value={driver.id}>{driver.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => deleteDelivery(delivery.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* New Delivery Tab */}
        {activeTab === 'new-delivery' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.deliveryScheduleFlorist.scheduleNewDelivery', 'Schedule New Delivery')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.deliveryScheduleFlorist.customerInformation', 'Customer Information')}
                </h3>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliveryScheduleFlorist.orderId', 'Order ID')}
                  </label>
                  <input
                    type="text"
                    value={newDelivery.orderId}
                    onChange={(e) => setNewDelivery({ ...newDelivery, orderId: e.target.value })}
                    placeholder={t('tools.deliveryScheduleFlorist.autoGeneratedIfEmpty', 'Auto-generated if empty')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliveryScheduleFlorist.customerName', 'Customer Name')}
                  </label>
                  <input
                    type="text"
                    value={newDelivery.customerName}
                    onChange={(e) => setNewDelivery({ ...newDelivery, customerName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliveryScheduleFlorist.customerPhone', 'Customer Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newDelivery.customerPhone}
                    onChange={(e) => setNewDelivery({ ...newDelivery, customerPhone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Recipient Info */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.deliveryScheduleFlorist.recipientInformation', 'Recipient Information')}
                </h3>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliveryScheduleFlorist.recipientName', 'Recipient Name *')}
                  </label>
                  <input
                    type="text"
                    value={newDelivery.recipientName}
                    onChange={(e) => setNewDelivery({ ...newDelivery, recipientName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliveryScheduleFlorist.recipientPhone', 'Recipient Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newDelivery.recipientPhone}
                    onChange={(e) => setNewDelivery({ ...newDelivery, recipientPhone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="mt-6 space-y-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.deliveryScheduleFlorist.deliveryAddress', 'Delivery Address')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliveryScheduleFlorist.streetAddress', 'Street Address *')}
                  </label>
                  <input
                    type="text"
                    value={newDelivery.address}
                    onChange={(e) => setNewDelivery({ ...newDelivery, address: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliveryScheduleFlorist.city', 'City')}
                  </label>
                  <input
                    type="text"
                    value={newDelivery.city}
                    onChange={(e) => setNewDelivery({ ...newDelivery, city: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.deliveryScheduleFlorist.zipCode', 'ZIP Code')}
                </label>
                <input
                  type="text"
                  value={newDelivery.zipCode}
                  onChange={(e) => setNewDelivery({ ...newDelivery, zipCode: e.target.value })}
                  className={`w-48 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Delivery Schedule */}
            <div className="mt-6 space-y-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.deliveryScheduleFlorist.deliverySchedule2', 'Delivery Schedule')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliveryScheduleFlorist.date', 'Date *')}
                  </label>
                  <input
                    type="date"
                    value={newDelivery.deliveryDate}
                    onChange={(e) => setNewDelivery({ ...newDelivery, deliveryDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliveryScheduleFlorist.timeSlot', 'Time Slot')}
                  </label>
                  <select
                    value={newDelivery.timeSlot}
                    onChange={(e) => setNewDelivery({ ...newDelivery, timeSlot: e.target.value as TimeSlot })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>{slot.label} ({slot.range})</option>
                    ))}
                  </select>
                </div>
                {newDelivery.timeSlot === 'specific' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.deliveryScheduleFlorist.specificTime', 'Specific Time')}
                    </label>
                    <input
                      type="time"
                      value={newDelivery.specificTime}
                      onChange={(e) => setNewDelivery({ ...newDelivery, specificTime: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliveryScheduleFlorist.priority', 'Priority')}
                  </label>
                  <select
                    value={newDelivery.priority}
                    onChange={(e) => setNewDelivery({ ...newDelivery, priority: e.target.value as DeliveryPriority })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label} {priority.surcharge > 0 && `(+$${priority.surcharge})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliveryScheduleFlorist.assignDriver2', 'Assign Driver')}
                  </label>
                  <select
                    value={newDelivery.driverId}
                    onChange={(e) => setNewDelivery({ ...newDelivery, driverId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.deliveryScheduleFlorist.unassigned', 'Unassigned')}</option>
                    {drivers.filter((d) => d.available).map((driver) => (
                      <option key={driver.id} value={driver.id}>{driver.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Items and Instructions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.deliveryScheduleFlorist.items2', 'Items')}
                </label>
                <textarea
                  value={newDelivery.items}
                  onChange={(e) => setNewDelivery({ ...newDelivery, items: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.deliveryScheduleFlorist.bouquetOfRosesCard', 'Bouquet of roses, card...')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.deliveryScheduleFlorist.specialInstructions2', 'Special Instructions')}
                </label>
                <textarea
                  value={newDelivery.specialInstructions}
                  onChange={(e) => setNewDelivery({ ...newDelivery, specialInstructions: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.deliveryScheduleFlorist.ringDoorbellLeaveAtDoor', 'Ring doorbell, leave at door...')}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={submitDelivery}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {t('tools.deliveryScheduleFlorist.scheduleDelivery', 'Schedule Delivery')}
              </button>
            </div>
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.deliveryScheduleFlorist.driverOverview', 'Driver Overview')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full ${
                      driver.available
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <User className={`w-5 h-5 ${
                        driver.available
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {driver.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {driver.vehicle}
                      </p>
                    </div>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                      driver.available
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {driver.available ? t('tools.deliveryScheduleFlorist.available', 'Available') : t('tools.deliveryScheduleFlorist.busy', 'Busy')}
                    </span>
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {driver.phone}
                    </p>
                    <p className="flex items-center gap-2 mt-1">
                      <Package className="w-4 h-4" /> {driver.currentDeliveries} active deliveries
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <ConfirmDialog />
      </div>
    </div>
  );
};

// Delivery Card Component for Timeline View
interface DeliveryCardProps {
  delivery: Delivery;
  theme: string;
  drivers: Driver[];
  onStatusChange: (id: string, status: DeliveryStatus) => void;
  onAssignDriver: (id: string, driverId: string) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: DeliveryStatus) => string;
  getPriorityColor: (priority: DeliveryPriority) => string;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({
  delivery,
  theme,
  drivers,
  onStatusChange,
  onAssignDriver,
  onDelete,
  getStatusColor,
  getPriorityColor,
}) => {
  return (
    <div className={`p-4 rounded-lg border ${
      theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {delivery.recipientName}
          </h4>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {delivery.orderId}
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(delivery.priority)}`}>
          {delivery.priority}
        </span>
      </div>
      <p className={`text-sm flex items-center gap-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        <MapPin className="w-3 h-3" /> {delivery.address}
      </p>
      {delivery.driverName && (
        <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Driver: {delivery.driverName}
        </p>
      )}
      <div className="flex items-center justify-between mt-3">
        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(delivery.status)}`}>
          {DELIVERY_STATUSES.find((s) => s.value === delivery.status)?.label}
        </span>
        <div className="flex gap-1">
          <select
            value={delivery.status}
            onChange={(e) => onStatusChange(delivery.id, e.target.value as DeliveryStatus)}
            className={`px-2 py-1 rounded text-xs border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {DELIVERY_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DeliveryScheduleFloristTool;
