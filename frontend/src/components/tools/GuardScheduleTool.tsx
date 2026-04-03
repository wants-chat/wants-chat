'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Calendar,
  Clock,
  User,
  MapPin,
  Plus,
  Trash2,
  Save,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  Sparkles,
  X,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface GuardScheduleToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
interface Guard {
  id: string;
  name: string;
  badge: string;
  phone: string;
  email: string;
  certification: string;
  status: 'active' | 'inactive' | 'on-leave';
  createdAt: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  type: 'building' | 'site' | 'gate' | 'patrol-route';
  requiredGuards: number;
}

interface Shift {
  id: string;
  guardId: string;
  locationId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'missed' | 'cancelled';
  notes: string;
  createdAt: string;
}

// Column definitions for exports
const GUARD_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name' },
  { key: 'badge', header: 'Badge' },
  { key: 'phone', header: 'Phone' },
  { key: 'email', header: 'Email' },
  { key: 'certification', header: 'Certification' },
  { key: 'status', header: 'Status' },
];

const SHIFT_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date' },
  { key: 'guardName', header: 'Guard' },
  { key: 'locationName', header: 'Location' },
  { key: 'startTime', header: 'Start' },
  { key: 'endTime', header: 'End' },
  { key: 'status', header: 'Status' },
  { key: 'notes', header: 'Notes' },
];

// Helper function to generate unique IDs
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function GuardScheduleTool({ uiConfig }: GuardScheduleToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use useToolData hook for backend sync
  const {
    data: guards,
    addItem: addGuardToBackend,
    updateItem: updateGuardBackend,
    deleteItem: deleteGuardBackend,
    isSynced: guardsSynced,
    isSaving: guardsSaving,
    lastSaved: guardsLastSaved,
    syncError: guardsSyncError,
    forceSync: forceGuardsSync,
  } = useToolData<Guard>('guard-schedule-guards', [], GUARD_COLUMNS);

  const {
    data: locations,
    addItem: addLocationToBackend,
    updateItem: updateLocationBackend,
    deleteItem: deleteLocationBackend,
  } = useToolData<Location>('guard-schedule-locations', [], []);

  const {
    data: shifts,
    addItem: addShiftToBackend,
    updateItem: updateShiftBackend,
    deleteItem: deleteShiftBackend,
    isSynced: shiftsSynced,
    isSaving: shiftsSaving,
    lastSaved: shiftsLastSaved,
    syncError: shiftsSyncError,
    forceSync: forceShiftsSync,
  } = useToolData<Shift>('guard-schedule-shifts', [], SHIFT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'schedule' | 'guards' | 'locations'>('schedule');
  const [showGuardForm, setShowGuardForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingGuard, setEditingGuard] = useState<Guard | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New guard form state
  const [newGuard, setNewGuard] = useState<Partial<Guard>>({
    name: '',
    badge: '',
    phone: '',
    email: '',
    certification: '',
    status: 'active',
  });

  // New location form state
  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    name: '',
    address: '',
    type: 'building',
    requiredGuards: 1,
  });

  // New shift form state
  const [newShift, setNewShift] = useState<Partial<Shift>>({
    guardId: '',
    locationId: '',
    date: selectedDate,
    startTime: '08:00',
    endTime: '16:00',
    status: 'scheduled',
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.guardName || params.name) {
        setNewGuard({
          ...newGuard,
          name: params.guardName || params.name || '',
          badge: params.badge || '',
          phone: params.phone || '',
          email: params.email || '',
        });
        setShowGuardForm(true);
        setActiveTab('guards');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add guard
  const addGuard = () => {
    if (!newGuard.name || !newGuard.badge) {
      setValidationMessage('Please fill in required fields (Name, Badge)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const guard: Guard = {
      id: generateId(),
      name: newGuard.name || '',
      badge: newGuard.badge || '',
      phone: newGuard.phone || '',
      email: newGuard.email || '',
      certification: newGuard.certification || '',
      status: newGuard.status as 'active' | 'inactive' | 'on-leave' || 'active',
      createdAt: new Date().toISOString(),
    };

    addGuardToBackend(guard);
    setShowGuardForm(false);
    setNewGuard({
      name: '',
      badge: '',
      phone: '',
      email: '',
      certification: '',
      status: 'active',
    });
  };

  // Delete guard
  const deleteGuard = async (guardId: string) => {
    const confirmed = await confirm({
      title: 'Delete Guard',
      message: 'Are you sure you want to delete this guard? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteGuardBackend(guardId);
      // Also delete related shifts
      shifts.forEach((s) => {
        if (s.guardId === guardId) deleteShiftBackend(s.id);
      });
    }
  };

  // Add location
  const addLocation = () => {
    if (!newLocation.name) {
      setValidationMessage('Please enter a location name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const location: Location = {
      id: generateId(),
      name: newLocation.name || '',
      address: newLocation.address || '',
      type: newLocation.type as 'building' | 'site' | 'gate' | 'patrol-route' || 'building',
      requiredGuards: newLocation.requiredGuards || 1,
    };

    addLocationToBackend(location);
    setShowLocationForm(false);
    setNewLocation({
      name: '',
      address: '',
      type: 'building',
      requiredGuards: 1,
    });
  };

  // Add shift
  const addShift = () => {
    if (!newShift.guardId || !newShift.locationId || !newShift.date) {
      setValidationMessage('Please select guard, location, and date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const shift: Shift = {
      id: generateId(),
      guardId: newShift.guardId || '',
      locationId: newShift.locationId || '',
      date: newShift.date || '',
      startTime: newShift.startTime || '08:00',
      endTime: newShift.endTime || '16:00',
      status: 'scheduled',
      notes: newShift.notes || '',
      createdAt: new Date().toISOString(),
    };

    addShiftToBackend(shift);
    setShowShiftForm(false);
    setNewShift({
      guardId: '',
      locationId: '',
      date: selectedDate,
      startTime: '08:00',
      endTime: '16:00',
      status: 'scheduled',
      notes: '',
    });
  };

  // Update shift status
  const updateShiftStatus = (shiftId: string, status: Shift['status']) => {
    updateShiftBackend(shiftId, { status });
  };

  // Get filtered shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const guard = guards.find((g) => g.id === shift.guardId);
      const location = locations.find((l) => l.id === shift.locationId);
      const matchesSearch =
        searchTerm === '' ||
        (guard?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (location?.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || shift.status === filterStatus;
      const matchesDate = shift.date === selectedDate;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [shifts, guards, locations, searchTerm, filterStatus, selectedDate]);

  // Get active guards
  const activeGuards = guards.filter((g) => g.status === 'active');

  // Schedule stats
  const scheduleStats = useMemo(() => {
    const todayShifts = shifts.filter((s) => s.date === selectedDate);
    return {
      total: todayShifts.length,
      scheduled: todayShifts.filter((s) => s.status === 'scheduled').length,
      inProgress: todayShifts.filter((s) => s.status === 'in-progress').length,
      completed: todayShifts.filter((s) => s.status === 'completed').length,
      missed: todayShifts.filter((s) => s.status === 'missed').length,
    };
  }, [shifts, selectedDate]);

  // Prepare export data
  const getExportData = () => {
    return filteredShifts.map((shift) => {
      const guard = guards.find((g) => g.id === shift.guardId);
      const location = locations.find((l) => l.id === shift.locationId);
      return {
        ...shift,
        guardName: guard?.name || 'Unknown',
        locationName: location?.name || 'Unknown',
      };
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.guardSchedule.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.guardSchedule.guardScheduleTool', 'Guard Schedule Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.guardSchedule.manageSecurityGuardSchedulesAnd', 'Manage security guard schedules and assignments')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="guard-schedule" toolName="Guard Schedule" />

              <SyncStatus
                isSynced={shiftsSynced && guardsSynced}
                isSaving={shiftsSaving || guardsSaving}
                lastSaved={shiftsLastSaved || guardsLastSaved}
                syncError={shiftsSyncError || guardsSyncError}
                onForceSync={() => {
                  forceShiftsSync();
                  forceGuardsSync();
                }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(getExportData(), SHIFT_COLUMNS, 'guard-schedule')}
                onExportExcel={() => exportToExcel(getExportData(), SHIFT_COLUMNS, 'guard-schedule')}
                onExportJSON={() => exportToJSON(getExportData(), 'guard-schedule')}
                onExportPDF={() => exportToPDF(getExportData(), SHIFT_COLUMNS, 'Guard Schedule')}
                onCopy={() => copyUtil(getExportData(), SHIFT_COLUMNS)}
                onPrint={() => printData(getExportData(), SHIFT_COLUMNS, 'Guard Schedule')}
                theme={theme}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {(['schedule', 'guards', 'locations'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-[#0D9488] border-b-2 border-[#0D9488]'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Shifts', value: scheduleStats.total, color: 'bg-blue-500' },
                { label: 'Scheduled', value: scheduleStats.scheduled, color: 'bg-yellow-500' },
                { label: 'In Progress', value: scheduleStats.inProgress, color: 'bg-green-500' },
                { label: 'Completed', value: scheduleStats.completed, color: 'bg-gray-500' },
                { label: 'Missed', value: scheduleStats.missed, color: 'bg-red-500' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}
                >
                  <div className={`w-2 h-2 rounded-full ${stat.color} mb-2`} />
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.guardSchedule.searchGuardsOrLocations', 'Search guards or locations...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.guardSchedule.allStatus', 'All Status')}</option>
                  <option value="scheduled">{t('tools.guardSchedule.scheduled', 'Scheduled')}</option>
                  <option value="in-progress">{t('tools.guardSchedule.inProgress', 'In Progress')}</option>
                  <option value="completed">{t('tools.guardSchedule.completed', 'Completed')}</option>
                  <option value="missed">{t('tools.guardSchedule.missed', 'Missed')}</option>
                  <option value="cancelled">{t('tools.guardSchedule.cancelled', 'Cancelled')}</option>
                </select>
                <button
                  onClick={() => setShowShiftForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7C] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.guardSchedule.addShift', 'Add Shift')}
                </button>
              </div>
            </div>

            {/* Shifts List */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
              {filteredShifts.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.guardSchedule.noShiftsScheduledForThis', 'No shifts scheduled for this date')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredShifts.map((shift) => {
                    const guard = guards.find((g) => g.id === shift.guardId);
                    const location = locations.find((l) => l.id === shift.locationId);
                    return (
                      <div key={shift.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                              <User className="w-5 h-5 text-[#0D9488]" />
                            </div>
                            <div>
                              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {guard?.name || 'Unknown Guard'}
                              </div>
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {location?.name || 'Unknown Location'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {shift.startTime} - {shift.endTime}
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  shift.status === 'completed'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : shift.status === 'in-progress'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    : shift.status === 'missed'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : shift.status === 'cancelled'
                                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}
                              >
                                {shift.status}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <select
                                value={shift.status}
                                onChange={(e) => updateShiftStatus(shift.id, e.target.value as Shift['status'])}
                                className={`text-sm px-2 py-1 rounded border ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="scheduled">{t('tools.guardSchedule.scheduled2', 'Scheduled')}</option>
                                <option value="in-progress">{t('tools.guardSchedule.inProgress2', 'In Progress')}</option>
                                <option value="completed">{t('tools.guardSchedule.completed2', 'Completed')}</option>
                                <option value="missed">{t('tools.guardSchedule.missed2', 'Missed')}</option>
                                <option value="cancelled">{t('tools.guardSchedule.cancelled2', 'Cancelled')}</option>
                              </select>
                              <button
                                onClick={() => deleteShiftBackend(shift.id)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {shift.notes && (
                          <div className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Note: {shift.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Guards Tab */}
        {activeTab === 'guards' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Security Guards ({guards.length})
              </h2>
              <button
                onClick={() => setShowGuardForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7C] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.guardSchedule.addGuard', 'Add Guard')}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guards.map((guard) => (
                <div
                  key={guard.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#0D9488]/10 rounded-full">
                        <User className="w-5 h-5 text-[#0D9488]" />
                      </div>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {guard.name}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Badge: {guard.badge}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        guard.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : guard.status === 'on-leave'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {guard.status}
                    </span>
                  </div>
                  <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {guard.phone && <div>Phone: {guard.phone}</div>}
                    {guard.email && <div>Email: {guard.email}</div>}
                    {guard.certification && <div>Cert: {guard.certification}</div>}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => deleteGuard(guard.id)}
                      className="flex-1 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Locations ({locations.length})
              </h2>
              <button
                onClick={() => setShowLocationForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7C] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.guardSchedule.addLocation', 'Add Location')}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#0D9488]/10 rounded-full">
                        <Building2 className="w-5 h-5 text-[#0D9488]" />
                      </div>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {location.name}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {location.type}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      {location.requiredGuards} guards
                    </span>
                  </div>
                  {location.address && (
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {location.address}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => deleteLocationBackend(location.id)}
                      className="flex-1 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Guard Modal */}
        {showGuardForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.guardSchedule.addNewGuard', 'Add New Guard')}
                </h3>
                <button onClick={() => setShowGuardForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newGuard.name}
                    onChange={(e) => setNewGuard({ ...newGuard, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.badgeNumber', 'Badge Number *')}
                  </label>
                  <input
                    type="text"
                    value={newGuard.badge}
                    onChange={(e) => setNewGuard({ ...newGuard, badge: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newGuard.phone}
                    onChange={(e) => setNewGuard({ ...newGuard, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newGuard.email}
                    onChange={(e) => setNewGuard({ ...newGuard, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.certification', 'Certification')}
                  </label>
                  <input
                    type="text"
                    value={newGuard.certification}
                    onChange={(e) => setNewGuard({ ...newGuard, certification: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.status', 'Status')}
                  </label>
                  <select
                    value={newGuard.status}
                    onChange={(e) => setNewGuard({ ...newGuard, status: e.target.value as Guard['status'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="active">{t('tools.guardSchedule.active', 'Active')}</option>
                    <option value="inactive">{t('tools.guardSchedule.inactive', 'Inactive')}</option>
                    <option value="on-leave">{t('tools.guardSchedule.onLeave', 'On Leave')}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGuardForm(false)}
                  className={`flex-1 py-2 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.guardSchedule.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addGuard}
                  className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7C]"
                >
                  {t('tools.guardSchedule.addGuard2', 'Add Guard')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Location Modal */}
        {showLocationForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.guardSchedule.addNewLocation', 'Add New Location')}
                </h3>
                <button onClick={() => setShowLocationForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.name2', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.address', 'Address')}
                  </label>
                  <input
                    type="text"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.type', 'Type')}
                  </label>
                  <select
                    value={newLocation.type}
                    onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value as Location['type'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="building">{t('tools.guardSchedule.building', 'Building')}</option>
                    <option value="site">{t('tools.guardSchedule.site', 'Site')}</option>
                    <option value="gate">{t('tools.guardSchedule.gate', 'Gate')}</option>
                    <option value="patrol-route">{t('tools.guardSchedule.patrolRoute', 'Patrol Route')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.requiredGuards', 'Required Guards')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newLocation.requiredGuards}
                    onChange={(e) => setNewLocation({ ...newLocation, requiredGuards: parseInt(e.target.value) || 1 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLocationForm(false)}
                  className={`flex-1 py-2 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.guardSchedule.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addLocation}
                  className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7C]"
                >
                  {t('tools.guardSchedule.addLocation2', 'Add Location')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Shift Modal */}
        {showShiftForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.guardSchedule.addNewShift', 'Add New Shift')}
                </h3>
                <button onClick={() => setShowShiftForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.guard', 'Guard *')}
                  </label>
                  <select
                    value={newShift.guardId}
                    onChange={(e) => setNewShift({ ...newShift, guardId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.guardSchedule.selectGuard', 'Select Guard')}</option>
                    {activeGuards.map((guard) => (
                      <option key={guard.id} value={guard.id}>
                        {guard.name} ({guard.badge})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.location', 'Location *')}
                  </label>
                  <select
                    value={newShift.locationId}
                    onChange={(e) => setNewShift({ ...newShift, locationId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.guardSchedule.selectLocation', 'Select Location')}</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.date', 'Date *')}
                  </label>
                  <input
                    type="date"
                    value={newShift.date}
                    onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.guardSchedule.startTime', 'Start Time')}
                    </label>
                    <input
                      type="time"
                      value={newShift.startTime}
                      onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.guardSchedule.endTime', 'End Time')}
                    </label>
                    <input
                      type="time"
                      value={newShift.endTime}
                      onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guardSchedule.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newShift.notes}
                    onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowShiftForm(false)}
                  className={`flex-1 py-2 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.guardSchedule.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={addShift}
                  className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7C]"
                >
                  {t('tools.guardSchedule.addShift2', 'Add Shift')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-red-500 text-white rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-bottom">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{validationMessage}</span>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
}

export default GuardScheduleTool;
