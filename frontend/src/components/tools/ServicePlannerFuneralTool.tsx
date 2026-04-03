'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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
  Calendar,
  Clock,
  MapPin,
  Users,
  Music,
  FileText,
  Package,
  Flower2,
  Car,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  GripVertical,
  Copy,
  Printer,
  Sparkles,
} from 'lucide-react';

// Types
interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  activity: string;
  location: string;
  notes: string;
}

interface ServiceVendor {
  id: string;
  type: 'florist' | 'caterer' | 'musician' | 'photographer' | 'transport' | 'other';
  name: string;
  contact: string;
  phone: string;
  email: string;
  cost: number;
  confirmed: boolean;
  notes: string;
}

interface ServiceItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  cost: number;
  included: boolean;
  notes: string;
}

interface ServiceEvent {
  id: string;
  type: 'visitation' | 'funeral' | 'memorial' | 'burial' | 'cremation' | 'reception' | 'wake' | 'graveside';
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  capacity: number;
  expectedAttendees: number;
  confirmed: boolean;
  timeline: TimeSlot[];
  notes: string;
}

interface FuneralServicePlan {
  id: string;
  caseNumber: string;
  deceasedName: string;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
  events: ServiceEvent[];
  vendors: ServiceVendor[];
  serviceItems: ServiceItem[];
  specialRequests: string;
  religiousRequirements: string;
  totalBudget: number;
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed';
}

// Column configuration for export
const servicePlanColumns: ColumnConfig[] = [
  { key: 'caseNumber', header: 'Case #', type: 'string' },
  { key: 'deceasedName', header: 'Deceased Name', type: 'string' },
  { key: 'contactName', header: 'Contact', type: 'string' },
  { key: 'eventsCount', header: 'Events', type: 'number' },
  { key: 'totalBudget', header: 'Total Budget', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const eventTypes = {
  visitation: { label: 'Visitation/Viewing', icon: Users, color: 'bg-blue-100 text-blue-800' },
  funeral: { label: 'Funeral Service', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  memorial: { label: 'Memorial Service', icon: Calendar, color: 'bg-indigo-100 text-indigo-800' },
  burial: { label: 'Burial/Interment', icon: MapPin, color: 'bg-green-100 text-green-800' },
  cremation: { label: 'Cremation', icon: Package, color: 'bg-orange-100 text-orange-800' },
  reception: { label: 'Reception/Repast', icon: Users, color: 'bg-pink-100 text-pink-800' },
  wake: { label: 'Wake', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  graveside: { label: 'Graveside Service', icon: MapPin, color: 'bg-teal-100 text-teal-800' },
};

const vendorTypes = {
  florist: { label: 'Florist', icon: Flower2 },
  caterer: { label: 'Caterer', icon: Package },
  musician: { label: 'Musician', icon: Music },
  photographer: { label: 'Photographer', icon: FileText },
  transport: { label: 'Transport', icon: Car },
  other: { label: 'Other', icon: Package },
};

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  completed: { label: 'Completed', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
};

const createEmptyPlan = (): FuneralServicePlan => ({
  id: crypto.randomUUID(),
  caseNumber: `SP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
  deceasedName: '',
  contactName: '',
  contactPhone: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  events: [],
  vendors: [],
  serviceItems: [],
  specialRequests: '',
  religiousRequirements: '',
  totalBudget: 0,
  status: 'draft',
});

const createEmptyEvent = (): ServiceEvent => ({
  id: crypto.randomUUID(),
  type: 'funeral',
  name: '',
  date: '',
  startTime: '',
  endTime: '',
  venue: '',
  address: '',
  capacity: 0,
  expectedAttendees: 0,
  confirmed: false,
  timeline: [],
  notes: '',
});

interface ServicePlannerFuneralToolProps {
  uiConfig?: UIConfig;
}

export const ServicePlannerFuneralTool: React.FC<ServicePlannerFuneralToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'vendors' | 'items' | 'timeline'>('overview');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Initialize useToolData hook for backend persistence
  const {
    data: plans,
    updateItem,
    addItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<FuneralServicePlan>(
    'funeral-service-planner',
    [],
    servicePlanColumns,
    { autoSave: true }
  );

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.deceasedName || params.name || params.text) {
        const newPlan = createEmptyPlan();
        newPlan.deceasedName = params.deceasedName || params.name || params.text || '';
        if (params.contactName) newPlan.contactName = params.contactName;
        if (params.phone) newPlan.contactPhone = params.phone;
        addItem(newPlan);
        setSelectedPlanId(newPlan.id);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  // Plan operations
  const handleCreatePlan = () => {
    const newPlan = createEmptyPlan();
    addItem(newPlan);
    setSelectedPlanId(newPlan.id);
  };

  const handleUpdatePlan = (updates: Partial<FuneralServicePlan>) => {
    if (!selectedPlan) return;
    updateItem(selectedPlan.id, { ...selectedPlan, ...updates, updatedAt: new Date().toISOString() });
  };

  const handleDeletePlan = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this service plan?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
      if (selectedPlanId === id) setSelectedPlanId(null);
    }
  };

  // Event operations
  const handleAddEvent = (event: ServiceEvent) => {
    if (!selectedPlan) return;
    handleUpdatePlan({ events: [...selectedPlan.events, event] });
    setShowEventForm(false);
  };

  const handleUpdateEvent = (eventId: string, updates: Partial<ServiceEvent>) => {
    if (!selectedPlan) return;
    handleUpdatePlan({
      events: selectedPlan.events.map(e =>
        e.id === eventId ? { ...e, ...updates } : e
      ),
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!selectedPlan) return;
    handleUpdatePlan({ events: selectedPlan.events.filter(e => e.id !== eventId) });
  };

  // Vendor operations
  const handleAddVendor = (vendor: ServiceVendor) => {
    if (!selectedPlan) return;
    handleUpdatePlan({ vendors: [...selectedPlan.vendors, vendor] });
    setShowVendorForm(false);
  };

  const handleUpdateVendor = (vendorId: string, updates: Partial<ServiceVendor>) => {
    if (!selectedPlan) return;
    handleUpdatePlan({
      vendors: selectedPlan.vendors.map(v =>
        v.id === vendorId ? { ...v, ...updates } : v
      ),
    });
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (!selectedPlan) return;
    handleUpdatePlan({ vendors: selectedPlan.vendors.filter(v => v.id !== vendorId) });
  };

  // Timeline slot operations
  const handleAddTimeSlot = (eventId: string, slot: TimeSlot) => {
    if (!selectedPlan) return;
    handleUpdatePlan({
      events: selectedPlan.events.map(e =>
        e.id === eventId ? { ...e, timeline: [...e.timeline, slot] } : e
      ),
    });
  };

  const handleDeleteTimeSlot = (eventId: string, slotId: string) => {
    if (!selectedPlan) return;
    handleUpdatePlan({
      events: selectedPlan.events.map(e =>
        e.id === eventId
          ? { ...e, timeline: e.timeline.filter(s => s.id !== slotId) }
          : e
      ),
    });
  };

  // Calculate totals
  const totalVendorCosts = selectedPlan?.vendors.reduce((sum, v) => sum + v.cost, 0) || 0;
  const totalItemCosts = selectedPlan?.serviceItems.filter(i => i.included).reduce((sum, i) => sum + (i.cost * i.quantity), 0) || 0;
  const grandTotal = totalVendorCosts + totalItemCosts;

  // Export data
  const getExportData = () => {
    return plans.map(p => ({
      caseNumber: p.caseNumber,
      deceasedName: p.deceasedName,
      contactName: p.contactName,
      eventsCount: p.events.length,
      totalBudget: p.totalBudget,
      status: statusConfig[p.status].label,
      createdAt: p.createdAt,
    }));
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    return `${h > 12 ? h - 12 : h}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-7 h-7 text-indigo-500" />
              Funeral Service Planner
              {isPrefilled && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-filled
                </span>
              )}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.servicePlannerFuneral.planAndCoordinateFuneralServices', 'Plan and coordinate funeral services, events, and vendors')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="service-planner-funeral" toolName="Service Planner Funeral" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              data={getExportData()}
              columns={servicePlanColumns}
              filename="funeral-service-plans"
              onExportCSV={() => exportToCSV(getExportData(), servicePlanColumns, 'funeral-service-plans')}
              onExportExcel={() => exportToExcel(getExportData(), servicePlanColumns, 'funeral-service-plans')}
              onExportJSON={() => exportToJSON(getExportData(), 'funeral-service-plans')}
              onExportPDF={() => exportToPDF(getExportData(), servicePlanColumns, 'funeral-service-plans', 'Service Plans')}
              onCopy={() => copyUtil(getExportData(), servicePlanColumns)}
              onPrint={() => printData(getExportData(), servicePlanColumns, 'Service Plans')}
            />
            <button
              onClick={handleCreatePlan}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              {t('tools.servicePlannerFuneral.newPlan', 'New Plan')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Plans List */}
          <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold">Service Plans ({plans.length})</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {plans.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('tools.servicePlannerFuneral.noServicePlans', 'No service plans')}</p>
                  <button onClick={handleCreatePlan} className="mt-2 text-indigo-600 hover:underline text-sm">
                    {t('tools.servicePlannerFuneral.createYourFirstPlan', 'Create your first plan')}
                  </button>
                </div>
              ) : (
                plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedPlanId === plan.id
                        ? theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-50'
                        : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{plan.caseNumber}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {plan.deceasedName || 'Unnamed'}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusConfig[plan.status].color}`}>
                        {statusConfig[plan.status].label}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {plan.events.length} events
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Plan Details */}
          <div className={`lg:col-span-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {selectedPlan ? (
              <>
                {/* Plan Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">{selectedPlan.caseNumber}</h2>
                        <select
                          value={selectedPlan.status}
                          onChange={(e) => handleUpdatePlan({ status: e.target.value as FuneralServicePlan['status'] })}
                          className={`text-sm px-2 py-1 rounded border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        >
                          {Object.entries(statusConfig).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <input
                          type="text"
                          placeholder={t('tools.servicePlannerFuneral.deceasedName', 'Deceased Name')}
                          value={selectedPlan.deceasedName}
                          onChange={(e) => handleUpdatePlan({ deceasedName: e.target.value })}
                          className={`flex-1 px-3 py-1.5 text-sm rounded border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder={t('tools.servicePlannerFuneral.contactName', 'Contact Name')}
                          value={selectedPlan.contactName}
                          onChange={(e) => handleUpdatePlan({ contactName: e.target.value })}
                          className={`flex-1 px-3 py-1.5 text-sm rounded border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                        <input
                          type="tel"
                          placeholder={t('tools.servicePlannerFuneral.contactPhone', 'Contact Phone')}
                          value={selectedPlan.contactPhone}
                          onChange={(e) => handleUpdatePlan({ contactPhone: e.target.value })}
                          className={`w-40 px-3 py-1.5 text-sm rounded border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePlan(selectedPlan.id)}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex overflow-x-auto">
                    {(['overview', 'events', 'vendors', 'items', 'timeline'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                          activeTab === tab
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-4 max-h-[500px] overflow-y-auto">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <p className="text-sm text-gray-500">{t('tools.servicePlannerFuneral.events', 'Events')}</p>
                          <p className="text-2xl font-bold">{selectedPlan.events.length}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <p className="text-sm text-gray-500">{t('tools.servicePlannerFuneral.vendors', 'Vendors')}</p>
                          <p className="text-2xl font-bold">{selectedPlan.vendors.length}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <p className="text-sm text-gray-500">{t('tools.servicePlannerFuneral.vendorCosts', 'Vendor Costs')}</p>
                          <p className="text-2xl font-bold">{formatCurrency(totalVendorCosts)}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <p className="text-sm text-gray-500">{t('tools.servicePlannerFuneral.total', 'Total')}</p>
                          <p className="text-2xl font-bold">{formatCurrency(grandTotal)}</p>
                        </div>
                      </div>

                      {/* Special Requirements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">{t('tools.servicePlannerFuneral.specialRequests', 'Special Requests')}</label>
                          <textarea
                            value={selectedPlan.specialRequests}
                            onChange={(e) => handleUpdatePlan({ specialRequests: e.target.value })}
                            placeholder={t('tools.servicePlannerFuneral.anySpecialRequestsOrRequirements', 'Any special requests or requirements...')}
                            className={`w-full px-3 py-2 rounded-lg border resize-none ${
                              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                            rows={4}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">{t('tools.servicePlannerFuneral.religiousCulturalRequirements', 'Religious/Cultural Requirements')}</label>
                          <textarea
                            value={selectedPlan.religiousRequirements}
                            onChange={(e) => handleUpdatePlan({ religiousRequirements: e.target.value })}
                            placeholder={t('tools.servicePlannerFuneral.religiousOrCulturalRequirements', 'Religious or cultural requirements...')}
                            className={`w-full px-3 py-2 rounded-lg border resize-none ${
                              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                            rows={4}
                          />
                        </div>
                      </div>

                      {/* Upcoming Events Summary */}
                      {selectedPlan.events.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-3">{t('tools.servicePlannerFuneral.scheduledEvents', 'Scheduled Events')}</h3>
                          <div className="space-y-2">
                            {selectedPlan.events.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={`p-3 rounded-lg flex items-center justify-between ${
                                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-1 text-xs rounded ${eventTypes[event.type].color}`}>
                                    {eventTypes[event.type].label}
                                  </span>
                                  <span>{event.name || event.type}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}{' '}
                                  {event.startTime && formatTime(event.startTime)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'events' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Events ({selectedPlan.events.length})</h3>
                        <button
                          onClick={() => setShowEventForm(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          <Plus className="w-4 h-4" /> Add Event
                        </button>
                      </div>

                      {showEventForm && (
                        <EventForm
                          onSubmit={(event) => handleAddEvent(event)}
                          onCancel={() => setShowEventForm(false)}
                          theme={theme}
                        />
                      )}

                      <div className="space-y-3">
                        {selectedPlan.events.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">{t('tools.servicePlannerFuneral.noEventsScheduled', 'No events scheduled')}</p>
                        ) : (
                          selectedPlan.events.map((event) => (
                            <div
                              key={event.id}
                              className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                            >
                              <div
                                className="p-4 flex justify-between items-start cursor-pointer"
                                onClick={() => setExpandedEvents(prev => {
                                  const next = new Set(prev);
                                  next.has(event.id) ? next.delete(event.id) : next.add(event.id);
                                  return next;
                                })}
                              >
                                <div className="flex items-start gap-3">
                                  <span className={`px-2 py-1 text-xs rounded ${eventTypes[event.type].color}`}>
                                    {eventTypes[event.type].label}
                                  </span>
                                  <div>
                                    <p className="font-medium">{event.name || eventTypes[event.type].label}</p>
                                    <p className="text-sm text-gray-500">
                                      {event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'}
                                      {event.startTime && ` at ${formatTime(event.startTime)}`}
                                    </p>
                                    {event.venue && (
                                      <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {event.venue}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {event.confirmed ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                                  )}
                                  {expandedEvents.has(event.id) ? (
                                    <ChevronUp className="w-5 h-5" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5" />
                                  )}
                                </div>
                              </div>
                              {expandedEvents.has(event.id) && (
                                <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600 pt-3">
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.date', 'Date')}</label>
                                      <input
                                        type="date"
                                        value={event.date}
                                        onChange={(e) => handleUpdateEvent(event.id, { date: e.target.value })}
                                        className={`w-full mt-1 px-2 py-1 text-sm rounded border ${
                                          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                        }`}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <div className="flex-1">
                                        <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.start', 'Start')}</label>
                                        <input
                                          type="time"
                                          value={event.startTime}
                                          onChange={(e) => handleUpdateEvent(event.id, { startTime: e.target.value })}
                                          className={`w-full mt-1 px-2 py-1 text-sm rounded border ${
                                            theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                          }`}
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.end', 'End')}</label>
                                        <input
                                          type="time"
                                          value={event.endTime}
                                          onChange={(e) => handleUpdateEvent(event.id, { endTime: e.target.value })}
                                          className={`w-full mt-1 px-2 py-1 text-sm rounded border ${
                                            theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                          }`}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.venue', 'Venue')}</label>
                                      <input
                                        type="text"
                                        value={event.venue}
                                        onChange={(e) => handleUpdateEvent(event.id, { venue: e.target.value })}
                                        className={`w-full mt-1 px-2 py-1 text-sm rounded border ${
                                          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                        }`}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.expectedAttendees', 'Expected Attendees')}</label>
                                      <input
                                        type="number"
                                        value={event.expectedAttendees}
                                        onChange={(e) => handleUpdateEvent(event.id, { expectedAttendees: parseInt(e.target.value) || 0 })}
                                        className={`w-full mt-1 px-2 py-1 text-sm rounded border ${
                                          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                        }`}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdateEvent(event.id, { confirmed: !event.confirmed })}
                                      className={`px-3 py-1.5 text-xs rounded ${
                                        event.confirmed
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                          : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                      }`}
                                    >
                                      {event.confirmed ? t('tools.servicePlannerFuneral.confirmed2', 'Confirmed') : t('tools.servicePlannerFuneral.markConfirmed', 'Mark Confirmed')}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEvent(event.id)}
                                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'vendors' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Vendors ({selectedPlan.vendors.length})</h3>
                        <button
                          onClick={() => setShowVendorForm(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          <Plus className="w-4 h-4" /> Add Vendor
                        </button>
                      </div>

                      {showVendorForm && (
                        <VendorForm
                          onSubmit={(vendor) => handleAddVendor(vendor)}
                          onCancel={() => setShowVendorForm(false)}
                          theme={theme}
                        />
                      )}

                      <div className="space-y-2">
                        {selectedPlan.vendors.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">{t('tools.servicePlannerFuneral.noVendorsAdded', 'No vendors added')}</p>
                        ) : (
                          selectedPlan.vendors.map((vendor) => (
                            <div
                              key={vendor.id}
                              className={`p-4 rounded-lg border flex justify-between items-center ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                                  {React.createElement(vendorTypes[vendor.type].icon, { className: 'w-5 h-5' })}
                                </span>
                                <div>
                                  <p className="font-medium">{vendor.name}</p>
                                  <p className="text-sm text-gray-500">{vendorTypes[vendor.type].label}</p>
                                  <p className="text-sm text-gray-500">{vendor.phone}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(vendor.cost)}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {vendor.confirmed ? (
                                    <span className="text-xs text-green-600">{t('tools.servicePlannerFuneral.confirmed', 'Confirmed')}</span>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateVendor(vendor.id, { confirmed: true })}
                                      className="text-xs text-indigo-600 hover:underline"
                                    >
                                      {t('tools.servicePlannerFuneral.confirm', 'Confirm')}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteVendor(vendor.id)}
                                    className="text-xs text-red-600 hover:underline"
                                  >
                                    {t('tools.servicePlannerFuneral.remove', 'Remove')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {selectedPlan.vendors.length > 0 && (
                        <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="flex justify-between">
                            <span className="font-medium">{t('tools.servicePlannerFuneral.totalVendorCosts', 'Total Vendor Costs')}</span>
                            <span className="font-bold">{formatCurrency(totalVendorCosts)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'items' && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('tools.servicePlannerFuneral.serviceItemsManagementComingSoon', 'Service items management coming soon')}</p>
                    </div>
                  )}

                  {activeTab === 'timeline' && (
                    <div>
                      <h3 className="font-medium mb-4">{t('tools.servicePlannerFuneral.dayOfTimeline', 'Day-of Timeline')}</h3>
                      {selectedPlan.events.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">{t('tools.servicePlannerFuneral.addEventsFirstToCreate', 'Add events first to create a timeline')}</p>
                      ) : (
                        <div className="space-y-6">
                          {selectedPlan.events.map((event) => (
                            <div key={event.id}>
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-1 text-xs rounded ${eventTypes[event.type].color}`}>
                                  {eventTypes[event.type].label}
                                </span>
                                <span className="font-medium">{event.name || event.type}</span>
                                <span className="text-sm text-gray-500">
                                  {event.date ? new Date(event.date).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <div className="ml-4 border-l-2 border-gray-300 dark:border-gray-600 pl-4 space-y-2">
                                {event.timeline.length === 0 ? (
                                  <p className="text-sm text-gray-500">{t('tools.servicePlannerFuneral.noTimelineItems', 'No timeline items')}</p>
                                ) : (
                                  event.timeline.map((slot) => (
                                    <div
                                      key={slot.id}
                                      className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                                    >
                                      <div className="flex justify-between">
                                        <div>
                                          <p className="font-medium">{slot.activity}</p>
                                          <p className="text-sm text-gray-500">{slot.location}</p>
                                        </div>
                                        <div className="text-sm">
                                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                                <button
                                  onClick={() => {
                                    const newSlot: TimeSlot = {
                                      id: crypto.randomUUID(),
                                      startTime: '',
                                      endTime: '',
                                      activity: '',
                                      location: '',
                                      notes: '',
                                    };
                                    handleAddTimeSlot(event.id, newSlot);
                                  }}
                                  className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add timeline item
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t('tools.servicePlannerFuneral.selectAServicePlan', 'Select a service plan')}</p>
                <p className="text-sm mt-1">{t('tools.servicePlannerFuneral.orCreateANewOne', 'or create a new one to get started')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

// Event Form Component
const EventForm: React.FC<{
  onSubmit: (event: ServiceEvent) => void;
  onCancel: () => void;
  theme: string;
}> = ({ onSubmit, onCancel, theme }) => {
  const { t } = useTranslation();
  const [event, setEvent] = useState<ServiceEvent>(createEmptyEvent());

  return (
    <div className={`p-4 mb-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <h4 className="font-medium mb-3">{t('tools.servicePlannerFuneral.newEvent', 'New Event')}</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.eventType', 'Event Type')}</label>
          <select
            value={event.type}
            onChange={(e) => setEvent({ ...event, type: e.target.value as ServiceEvent['type'] })}
            className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
          >
            {Object.entries(eventTypes).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.eventNameOptional', 'Event Name (Optional)')}</label>
          <input
            type="text"
            value={event.name}
            onChange={(e) => setEvent({ ...event, name: e.target.value })}
            placeholder={t('tools.servicePlannerFuneral.customName', 'Custom name')}
            className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.date2', 'Date')}</label>
          <input
            type="date"
            value={event.date}
            onChange={(e) => setEvent({ ...event, date: e.target.value })}
            className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.startTime', 'Start Time')}</label>
            <input
              type="time"
              value={event.startTime}
              onChange={(e) => setEvent({ ...event, startTime: e.target.value })}
              className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.endTime', 'End Time')}</label>
            <input
              type="time"
              value={event.endTime}
              onChange={(e) => setEvent({ ...event, endTime: e.target.value })}
              className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.venue2', 'Venue')}</label>
          <input
            type="text"
            value={event.venue}
            onChange={(e) => setEvent({ ...event, venue: e.target.value })}
            placeholder={t('tools.servicePlannerFuneral.venueName', 'Venue name')}
            className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500">{t('tools.servicePlannerFuneral.cancel', 'Cancel')}</button>
        <button
          onClick={() => onSubmit(event)}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {t('tools.servicePlannerFuneral.addEvent', 'Add Event')}
        </button>
      </div>
    </div>
  );
};

// Vendor Form Component
const VendorForm: React.FC<{
  onSubmit: (vendor: ServiceVendor) => void;
  onCancel: () => void;
  theme: string;
}> = ({ onSubmit, onCancel, theme }) => {
  const { t } = useTranslation();
  const [vendor, setVendor] = useState<ServiceVendor>({
    id: crypto.randomUUID(),
    type: 'florist',
    name: '',
    contact: '',
    phone: '',
    email: '',
    cost: 0,
    confirmed: false,
    notes: '',
  });

  return (
    <div className={`p-4 mb-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <h4 className="font-medium mb-3">{t('tools.servicePlannerFuneral.newVendor', 'New Vendor')}</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.vendorType', 'Vendor Type')}</label>
          <select
            value={vendor.type}
            onChange={(e) => setVendor({ ...vendor, type: e.target.value as ServiceVendor['type'] })}
            className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
          >
            {Object.entries(vendorTypes).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.businessName', 'Business Name')}</label>
          <input
            type="text"
            value={vendor.name}
            onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
            className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.contactPerson', 'Contact Person')}</label>
          <input
            type="text"
            value={vendor.contact}
            onChange={(e) => setVendor({ ...vendor, contact: e.target.value })}
            className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.phone', 'Phone')}</label>
          <input
            type="tel"
            value={vendor.phone}
            onChange={(e) => setVendor({ ...vendor, phone: e.target.value })}
            className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.email', 'Email')}</label>
          <input
            type="email"
            value={vendor.email}
            onChange={(e) => setVendor({ ...vendor, email: e.target.value })}
            className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.servicePlannerFuneral.cost', 'Cost')}</label>
          <input
            type="number"
            value={vendor.cost}
            onChange={(e) => setVendor({ ...vendor, cost: parseFloat(e.target.value) || 0 })}
            className={`w-full mt-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500">{t('tools.servicePlannerFuneral.cancel2', 'Cancel')}</button>
        <button
          onClick={() => vendor.name && onSubmit(vendor)}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {t('tools.servicePlannerFuneral.addVendor', 'Add Vendor')}
        </button>
      </div>
    </div>
  );
};

export default ServicePlannerFuneralTool;
