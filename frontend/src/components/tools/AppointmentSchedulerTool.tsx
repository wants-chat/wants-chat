'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  FileText,
  Repeat,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface AppointmentSchedulerToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Appointment {
  id: string;
  title: string;
  customerId: string;
  customerName?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recurringEndDate?: string;
  reminders: boolean;
  reminderMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

type ViewMode = 'week' | 'day';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-cyan-500', icon: CheckCircle },
  { value: 'completed', label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
  { value: 'no-show', label: 'No-Show', color: 'bg-orange-500', icon: AlertCircle },
];

const RECURRING_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const REMINDER_OPTIONS = [
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'customerName', header: 'Client', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'isRecurring', header: 'Recurring', type: 'boolean' },
  { key: 'recurringPattern', header: 'Recurring Pattern', type: 'string' },
  { key: 'reminders', header: 'Reminders', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

export const AppointmentSchedulerTool: React.FC<AppointmentSchedulerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: appointments,
    setData: setAppointments,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Appointment>('appointment-scheduler', [], COLUMNS);

  // Additional state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Appointment>>({
    title: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    notes: '',
    status: 'scheduled',
    isRecurring: false,
    recurringPattern: 'weekly',
    recurringEndDate: '',
    reminders: true,
    reminderMinutes: 30,
  });

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description || params.client) {
        setFormData(prev => ({
          ...prev,
          title: params.title || prev.title,
          notes: params.description || prev.notes,
          customerName: params.client,
          location: params.location || prev.location,
        }));
        setShowModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Date helpers
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  // Navigation
  const navigatePrev = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = searchQuery === '' ||
        apt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchQuery, statusFilter]);

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: string) => {
    return filteredAppointments.filter(apt => apt.date === date);
  };

  // Get appointments for a specific hour on a date
  const getAppointmentsForHour = (date: string, hour: number) => {
    return filteredAppointments.filter(apt => {
      if (apt.date !== date) return false;
      const startHour = parseInt(apt.startTime.split(':')[0]);
      return startHour === hour;
    });
  };

  // Today's appointments
  const todaysAppointments = useMemo(() => {
    const today = formatDate(new Date());
    return filteredAppointments
      .filter(apt => apt.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [filteredAppointments]);

  // CRUD Operations
  const handleSave = () => {
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      return;
    }

    const customerName = formData.customerId
      ? customers.find(c => c.id === formData.customerId)?.name
      : formData.customerName;

    if (editingAppointment) {
      // Update existing appointment
      updateItem(editingAppointment.id, {
        title: formData.title || '',
        customerId: formData.customerId || '',
        customerName,
        date: formData.date || '',
        startTime: formData.startTime || '09:00',
        endTime: formData.endTime || '10:00',
        location: formData.location || '',
        notes: formData.notes || '',
        status: formData.status || 'scheduled',
        isRecurring: formData.isRecurring || false,
        recurringPattern: formData.recurringPattern,
        recurringEndDate: formData.recurringEndDate,
        reminders: formData.reminders || false,
        reminderMinutes: formData.reminderMinutes,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new appointment
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        title: formData.title || '',
        customerId: formData.customerId || '',
        customerName,
        date: formData.date || '',
        startTime: formData.startTime || '09:00',
        endTime: formData.endTime || '10:00',
        location: formData.location || '',
        notes: formData.notes || '',
        status: formData.status || 'scheduled',
        isRecurring: formData.isRecurring || false,
        recurringPattern: formData.recurringPattern,
        recurringEndDate: formData.recurringEndDate,
        reminders: formData.reminders || false,
        reminderMinutes: formData.reminderMinutes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addItem(newAppointment);
    }

    resetForm();
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Appointment',
      message: 'Are you sure you want to delete this appointment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      ...appointment,
      customerName: appointment.customerName,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      customerId: '',
      date: formatDate(selectedDate),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      notes: '',
      status: 'scheduled',
      isRecurring: false,
      recurringPattern: 'weekly',
      recurringEndDate: '',
      reminders: true,
      reminderMinutes: 30,
    });
    setEditingAppointment(null);
    setShowModal(false);
    setIsPrefilled(false);
  };

  const openNewAppointment = (date?: Date, hour?: number) => {
    const targetDate = date || selectedDate;
    const startHour = hour !== undefined ? hour : 9;
    setFormData({
      ...formData,
      date: formatDate(targetDate),
      startTime: `${startHour.toString().padStart(2, '0')}:00`,
      endTime: `${(startHour + 1).toString().padStart(2, '0')}:00`,
    });
    setEditingAppointment(null);
    setShowModal(true);
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string; small?: boolean }> = ({ status, small }) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white ${statusConfig.color} ${small ? 'text-xs' : 'text-sm'}`}>
        <Icon className={small ? 'w-3 h-3' : 'w-4 h-4'} />
        {statusConfig.label}
      </span>
    );
  };

  // Render appointment card
  const renderAppointmentCard = (apt: Appointment, compact: boolean = false) => {
    return (
      <div
        key={apt.id}
        className={`p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
          isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-white border-gray-200 hover:bg-gray-50'
        } ${compact ? 'text-xs' : ''}`}
        onClick={() => handleEdit(apt)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {apt.title}
            </p>
            {apt.customerName && (
              <p className={`text-sm truncate flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <User className="w-3 h-3" />
                {apt.customerName}
              </p>
            )}
            <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="w-3 h-3" />
              {apt.startTime} - {apt.endTime}
            </p>
            {apt.location && !compact && (
              <p className={`text-sm truncate flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <MapPin className="w-3 h-3" />
                {apt.location}
              </p>
            )}
          </div>
          <StatusBadge status={apt.status} small={compact} />
        </div>
        {apt.isRecurring && (
          <div className={`mt-1 flex items-center gap-1 text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
            <Repeat className="w-3 h-3" />
            {apt.recurringPattern}
          </div>
        )}
        {apt.reminders && (
          <div className={`mt-1 flex items-center gap-1 text-xs ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
            <Bell className="w-3 h-3" />
            {t('tools.appointmentScheduler.reminderSet', 'Reminder set')}
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span className="text-sm text-cyan-500 font-medium">{t('tools.appointmentScheduler.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.appointmentScheduler.appointmentScheduler', 'Appointment Scheduler')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.appointmentScheduler.manageYourAppointmentsAndBookings', 'Manage your appointments and bookings')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Sync Status */}
              <WidgetEmbedButton toolSlug="appointment-scheduler" toolName="Appointment Scheduler" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />

              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.appointmentScheduler.searchAppointments', 'Search appointments...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                  } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
              >
                <option value="all">{t('tools.appointmentScheduler.allStatus', 'All Status')}</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {/* Export Options */}
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'appointments' })}
                onExportExcel={() => exportExcel({ filename: 'appointments' })}
                onExportJSON={() => exportJSON({ filename: 'appointments' })}
                onExportPDF={() => exportPDF({
                  filename: 'appointments',
                  title: 'Appointments',
                  subtitle: `Total: ${filteredAppointments.length} appointments`,
                })}
                onPrint={() => print('Appointments')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                theme={isDark ? 'dark' : 'light'}
              />

              {/* New Appointment Button */}
              <button
                onClick={() => openNewAppointment()}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-medium flex items-center gap-2 hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-5 h-5" />
                {t('tools.appointmentScheduler.newAppointment', 'New Appointment')}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Today's Summary */}
          <div className={`lg:col-span-1 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Clock className="w-5 h-5 text-cyan-500" />
              {t('tools.appointmentScheduler.todaySAppointments', 'Today\'s Appointments')}
            </h2>
            <div className="space-y-3">
              {todaysAppointments.length === 0 ? (
                <p className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('tools.appointmentScheduler.noAppointmentsToday', 'No appointments today')}
                </p>
              ) : (
                todaysAppointments.map(apt => renderAppointmentCard(apt, true))
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.appointmentScheduler.thisWeek', 'This Week')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="text-2xl font-bold text-cyan-500">
                    {filteredAppointments.filter(a => {
                      const aptDate = new Date(a.date);
                      return weekDates.some(d => formatDate(d) === formatDate(aptDate));
                    }).length}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appointmentScheduler.total', 'Total')}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="text-2xl font-bold text-green-500">
                    {filteredAppointments.filter(a => a.status === 'confirmed').length}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.appointmentScheduler.confirmed', 'Confirmed')}</p>
                </div>
              </div>
            </div>

            {/* Reminder Concept */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-sm font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Bell className="w-4 h-4" />
                {t('tools.appointmentScheduler.reminders', 'Reminders')}
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.appointmentScheduler.setRemindersForAppointmentsTo', 'Set reminders for appointments to receive notifications before scheduled times.')}
              </p>
            </div>
          </div>

          {/* Calendar View */}
          <div className={`lg:col-span-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={navigatePrev}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={navigateNext}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {viewMode === 'week'
                    ? `${weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                    : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.appointmentScheduler.today', 'Today')}
                </button>
                <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-1.5 text-sm font-medium ${
                      viewMode === 'day'
                        ? 'bg-cyan-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('tools.appointmentScheduler.day', 'Day')}
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1.5 text-sm font-medium ${
                      viewMode === 'week'
                        ? 'bg-cyan-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('tools.appointmentScheduler.week', 'Week')}
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            {viewMode === 'week' ? (
              <div className="overflow-x-auto">
                {/* Week Header */}
                <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
                  <div className={`p-2 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.appointmentScheduler.time', 'Time')}
                  </div>
                  {weekDates.map((date, idx) => (
                    <div
                      key={idx}
                      className={`p-2 text-center cursor-pointer ${
                        isToday(date)
                          ? 'bg-cyan-500/10'
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedDate(date);
                        setViewMode('day');
                      }}
                    >
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className={`text-lg font-semibold ${
                        isToday(date)
                          ? 'text-cyan-500'
                          : isDark
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="max-h-[600px] overflow-y-auto">
                  {HOURS.filter(h => h >= 6 && h <= 22).map(hour => (
                    <div key={hour} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700/50">
                      <div className={`p-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                      {weekDates.map((date, idx) => {
                        const dayAppointments = getAppointmentsForHour(formatDate(date), hour);
                        return (
                          <div
                            key={idx}
                            className={`p-1 min-h-[60px] border-l border-gray-100 dark:border-gray-700/50 cursor-pointer ${
                              isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => openNewAppointment(date, hour)}
                          >
                            {dayAppointments.map(apt => (
                              <div
                                key={apt.id}
                                className={`p-1 mb-1 rounded text-xs cursor-pointer ${
                                  apt.status === 'cancelled'
                                    ? 'bg-red-500/20 text-red-400 line-through'
                                    : apt.status === 'completed'
                                    ? 'bg-green-500/20 text-green-400'
                                    : apt.status === 'confirmed'
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(apt);
                                }}
                              >
                                <p className="font-medium truncate">{apt.title}</p>
                                <p className="truncate">{apt.startTime}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Day View */
              <div className="max-h-[600px] overflow-y-auto">
                {HOURS.filter(h => h >= 6 && h <= 22).map(hour => {
                  const hourAppointments = getAppointmentsForHour(formatDate(selectedDate), hour);
                  return (
                    <div
                      key={hour}
                      className={`flex border-b border-gray-100 dark:border-gray-700/50 min-h-[80px] cursor-pointer ${
                        isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => openNewAppointment(selectedDate, hour)}
                    >
                      <div className={`w-20 p-3 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                      <div className="flex-1 p-2 space-y-2">
                        {hourAppointments.map(apt => renderAppointmentCard(apt))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingAppointment ? t('tools.appointmentScheduler.editAppointment', 'Edit Appointment') : t('tools.appointmentScheduler.newAppointment2', 'New Appointment')}
                  </h2>
                  <button
                    onClick={resetForm}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appointmentScheduler.title', 'Title *')}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('tools.appointmentScheduler.appointmentTitle', 'Appointment title')}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                    } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                  />
                </div>

                {/* Customer Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appointmentScheduler.clientCustomer', 'Client/Customer')}
                  </label>
                  {customers.length > 0 ? (
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    >
                      <option value="">{t('tools.appointmentScheduler.selectACustomer', 'Select a customer...')}</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.customerName || ''}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder={t('tools.appointmentScheduler.enterCustomerName', 'Enter customer name')}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.appointmentScheduler.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.appointmentScheduler.startTime', 'Start Time *')}
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.appointmentScheduler.endTime', 'End Time *')}
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appointmentScheduler.location', 'Location')}
                  </label>
                  <div className="relative">
                    <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder={t('tools.appointmentScheduler.enterLocation', 'Enter location')}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appointmentScheduler.status', 'Status')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(status => (
                      <button
                        key={status.value}
                        onClick={() => setFormData({ ...formData, status: status.value as Appointment['status'] })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                          formData.status === status.value
                            ? `${status.color} text-white`
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <status.icon className="w-4 h-4" />
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.appointmentScheduler.notes', 'Notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('tools.appointmentScheduler.addNotes', 'Add notes...')}
                    rows={3}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                    } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none`}
                  />
                </div>

                {/* Recurring */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="recurring" className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Repeat className="w-4 h-4" />
                      {t('tools.appointmentScheduler.recurringAppointment', 'Recurring Appointment')}
                    </label>
                  </div>
                  {formData.isRecurring && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.appointmentScheduler.repeat', 'Repeat')}
                        </label>
                        <select
                          value={formData.recurringPattern}
                          onChange={(e) => setFormData({ ...formData, recurringPattern: e.target.value as Appointment['recurringPattern'] })}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDark
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-200 text-gray-900'
                          }`}
                        >
                          {RECURRING_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.appointmentScheduler.endDate', 'End Date')}
                        </label>
                        <input
                          type="date"
                          value={formData.recurringEndDate}
                          onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDark
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-200 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Reminders */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="reminders"
                      checked={formData.reminders}
                      onChange={(e) => setFormData({ ...formData, reminders: e.target.checked })}
                      className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="reminders" className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Bell className="w-4 h-4" />
                      {t('tools.appointmentScheduler.setReminder', 'Set Reminder')}
                    </label>
                  </div>
                  {formData.reminders && (
                    <select
                      value={formData.reminderMinutes}
                      onChange={(e) => setFormData({ ...formData, reminderMinutes: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDark
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    >
                      {REMINDER_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                {editingAppointment && (
                  <button
                    onClick={() => handleDelete(editingAppointment.id)}
                    className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                <div className={`flex items-center gap-3 ${!editingAppointment ? 'ml-auto' : ''}`}>
                  <button
                    onClick={resetForm}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.appointmentScheduler.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.title || !formData.date || !formData.startTime || !formData.endTime}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-medium flex items-center gap-2 hover:from-cyan-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {editingAppointment ? t('tools.appointmentScheduler.update', 'Update') : t('tools.appointmentScheduler.create', 'Create')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default AppointmentSchedulerTool;
