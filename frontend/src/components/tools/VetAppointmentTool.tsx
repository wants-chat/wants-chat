'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Search,
  Filter,
  User,
  Phone,
  PawPrint,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Edit2,
  Bell,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
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
import { useTheme } from '@/contexts/ThemeContext';

interface VetAppointmentToolProps {
  uiConfig?: UIConfig;
}

// Types
type AppointmentStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
type AppointmentType = 'checkup' | 'vaccination' | 'surgery' | 'dental' | 'grooming' | 'emergency' | 'follow-up' | 'other';

interface Appointment {
  id: string;
  petName: string;
  petSpecies: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: AppointmentType;
  veterinarian: string;
  reason: string;
  notes: string;
  status: AppointmentStatus;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

// Constants
const APPOINTMENT_TYPES: { value: AppointmentType; label: string; duration: number; color: string }[] = [
  { value: 'checkup', label: 'Check-up', duration: 30, color: 'bg-blue-100 text-blue-800' },
  { value: 'vaccination', label: 'Vaccination', duration: 15, color: 'bg-green-100 text-green-800' },
  { value: 'surgery', label: 'Surgery', duration: 120, color: 'bg-purple-100 text-purple-800' },
  { value: 'dental', label: 'Dental', duration: 60, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'grooming', label: 'Grooming', duration: 45, color: 'bg-pink-100 text-pink-800' },
  { value: 'emergency', label: 'Emergency', duration: 60, color: 'bg-red-100 text-red-800' },
  { value: 'follow-up', label: 'Follow-up', duration: 20, color: 'bg-cyan-100 text-cyan-800' },
  { value: 'other', label: 'Other', duration: 30, color: 'bg-gray-100 text-gray-800' },
];

const STATUS_OPTIONS: { value: AppointmentStatus; label: string; color: string }[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'no-show', label: 'No Show', color: 'bg-orange-100 text-orange-800' },
];

const VETERINARIANS = [
  'Dr. Smith',
  'Dr. Johnson',
  'Dr. Williams',
  'Dr. Brown',
  'Dr. Davis',
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

// Column configurations for exports
const APPOINTMENT_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'petName', header: 'Pet', type: 'string' },
  { key: 'petSpecies', header: 'Species', type: 'string' },
  { key: 'ownerName', header: 'Owner', type: 'string' },
  { key: 'ownerPhone', header: 'Phone', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'veterinarian', header: 'Veterinarian', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'reason', header: 'Reason', type: 'string' },
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

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${minutes} ${ampm}`;
};

const getWeekDates = (date: Date): Date[] => {
  const week: Date[] = [];
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    week.push(day);
  }
  return week;
};

// Main Component
export const VetAppointmentTool: React.FC<VetAppointmentToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: appointments,
    addItem: addAppointmentToBackend,
    updateItem: updateAppointmentBackend,
    deleteItem: deleteAppointmentBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Appointment>('vet-appointments', [], APPOINTMENT_COLUMNS);

  // Local UI State
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'list'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form state
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    petName: '',
    petSpecies: 'dog',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    type: 'checkup',
    veterinarian: VETERINARIANS[0],
    reason: '',
    notes: '',
    status: 'scheduled',
    reminderSent: false,
  });

  // Add appointment
  const addAppointment = () => {
    if (!newAppointment.petName || !newAppointment.ownerName || !newAppointment.date || !newAppointment.time) {
      setValidationMessage('Please fill in required fields (Pet Name, Owner Name, Date, Time)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const appointment: Appointment = {
      id: editingAppointment?.id || generateId(),
      petName: newAppointment.petName || '',
      petSpecies: newAppointment.petSpecies || 'dog',
      ownerName: newAppointment.ownerName || '',
      ownerPhone: newAppointment.ownerPhone || '',
      ownerEmail: newAppointment.ownerEmail || '',
      date: newAppointment.date || '',
      time: newAppointment.time || '',
      duration: newAppointment.duration || 30,
      type: (newAppointment.type as AppointmentType) || 'checkup',
      veterinarian: newAppointment.veterinarian || VETERINARIANS[0],
      reason: newAppointment.reason || '',
      notes: newAppointment.notes || '',
      status: (newAppointment.status as AppointmentStatus) || 'scheduled',
      reminderSent: newAppointment.reminderSent || false,
      createdAt: editingAppointment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingAppointment) {
      updateAppointmentBackend(appointment.id, appointment);
    } else {
      addAppointmentToBackend(appointment);
    }

    resetForm();
  };

  const resetForm = () => {
    setNewAppointment({
      petName: '',
      petSpecies: 'dog',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 30,
      type: 'checkup',
      veterinarian: VETERINARIANS[0],
      reason: '',
      notes: '',
      status: 'scheduled',
      reminderSent: false,
    });
    setEditingAppointment(null);
    setShowForm(false);
  };

  // Edit appointment
  const editAppointment = (appointment: Appointment) => {
    setNewAppointment(appointment);
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  // Update status
  const updateStatus = (id: string, status: AppointmentStatus) => {
    updateAppointmentBackend(id, { status, updatedAt: new Date().toISOString() });
  };

  // Delete appointment
  const deleteAppointment = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this appointment?');
    if (confirmed) {
      deleteAppointmentBackend(id);
    }
  };

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments
      .filter(a => a.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  // Filtered appointments (for list view)
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch =
        searchTerm === '' ||
        apt.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.veterinarian.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      const matchesType = typeFilter === 'all' || apt.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
    });
  }, [appointments, searchTerm, statusFilter, typeFilter]);

  // Today's appointments
  const todaysAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(a => a.date === today && a.status !== 'cancelled');
  }, [appointments]);

  // Upcoming appointments (next 7 days)
  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return appointments.filter(a => {
      const aptDate = new Date(a.date);
      return aptDate >= today && aptDate <= nextWeek && a.status !== 'cancelled' && a.status !== 'completed';
    });
  }, [appointments]);

  // Week dates for week view
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  // Get type color
  const getTypeColor = (type: AppointmentType) => {
    return APPOINTMENT_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
  };

  // Get status color
  const getStatusColor = (status: AppointmentStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.vetAppointment.veterinaryAppointments', 'Veterinary Appointments')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.vetAppointment.scheduleAndManagePetAppointments', 'Schedule and manage pet appointments')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="vet-appointment" toolName="Vet Appointment" />

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
                onExportCSV={() => exportToCSV(appointments, APPOINTMENT_COLUMNS, { filename: 'vet-appointments' })}
                onExportExcel={() => exportToExcel(appointments, APPOINTMENT_COLUMNS, { filename: 'vet-appointments' })}
                onExportJSON={() => exportToJSON(appointments, { filename: 'vet-appointments' })}
                onExportPDF={async () => {
                  await exportToPDF(appointments, APPOINTMENT_COLUMNS, {
                    filename: 'vet-appointments',
                    title: 'Veterinary Appointments',
                    subtitle: `${appointments.length} appointments`,
                  });
                }}
                onPrint={() => printData(appointments, APPOINTMENT_COLUMNS, { title: 'Veterinary Appointments' })}
                onCopyToClipboard={async () => await copyUtil(appointments, APPOINTMENT_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* View Mode Toggle & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {['day', 'week', 'list'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as typeof viewMode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.vetAppointment.newAppointment', 'New Appointment')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{todaysAppointments.length}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetAppointment.today', 'Today')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {appointments.filter(a => a.status === 'confirmed').length}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetAppointment.confirmed', 'Confirmed')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{upcomingAppointments.length}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetAppointment.thisWeek', 'This Week')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {appointments.filter(a => a.type === 'emergency' && a.status !== 'completed').length}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetAppointment.emergencies', 'Emergencies')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View (Day/Week) */}
        {(viewMode === 'day' || viewMode === 'week') && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateDate('prev')}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              <div className="text-center">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {viewMode === 'week'
                    ? `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`
                    : formatDate(selectedDate)
                  }
                </h2>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="text-sm text-[#0D9488] hover:underline"
                >
                  {t('tools.vetAppointment.today2', 'Today')}
                </button>
              </div>
              <button
                onClick={() => navigateDate('next')}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Day View */}
            {viewMode === 'day' && (
              <div className="space-y-2">
                {TIME_SLOTS.map(slot => {
                  const slotAppointments = getAppointmentsForDate(selectedDate).filter(a => a.time === slot);
                  return (
                    <div key={slot} className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} py-2`}>
                      <div className={`w-20 flex-shrink-0 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatTime(slot)}
                      </div>
                      <div className="flex-1 min-h-[40px]">
                        {slotAppointments.map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => editAppointment(apt)}
                            className={`${getTypeColor(apt.type)} rounded p-2 mb-1 cursor-pointer hover:opacity-80`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{apt.petName}</p>
                                <p className="text-xs">{apt.ownerName} - {apt.veterinarian}</p>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(apt.status)}`}>
                                {apt.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Week Header */}
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    <div className="w-16"></div>
                    {weekDates.map((date, i) => (
                      <div
                        key={i}
                        className={`text-center py-2 rounded ${
                          date.toDateString() === new Date().toDateString()
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <p className="text-xs">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</p>
                        <p className="font-bold">{date.getDate()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-1">
                    {TIME_SLOTS.filter((_, i) => i % 2 === 0).map(slot => (
                      <div key={slot} className="grid grid-cols-8 gap-1">
                        <div className={`w-16 text-xs py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatTime(slot)}
                        </div>
                        {weekDates.map((date, i) => {
                          const dateAppointments = getAppointmentsForDate(date).filter(a => a.time === slot);
                          return (
                            <div
                              key={i}
                              className={`min-h-[50px] rounded border ${
                                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                              } p-1`}
                            >
                              {dateAppointments.map(apt => (
                                <div
                                  key={apt.id}
                                  onClick={() => editAppointment(apt)}
                                  className={`${getTypeColor(apt.type)} text-xs p-1 rounded mb-1 cursor-pointer truncate`}
                                >
                                  {apt.petName}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.vetAppointment.searchAppointments', 'Search appointments...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.vetAppointment.allStatuses', 'All Statuses')}</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.vetAppointment.allTypes', 'All Types')}</option>
                {APPOINTMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Appointments List */}
            <div className="space-y-3">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vetAppointment.noAppointmentsFound', 'No appointments found')}</p>
                </div>
              ) : (
                filteredAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {new Date(apt.date).getDate()}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {apt.petName}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(apt.type)}`}>
                              {apt.type}
                            </span>
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatTime(apt.time)} ({apt.duration} min) | {apt.veterinarian}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            <User className="w-3 h-3 inline mr-1" />
                            {apt.ownerName}
                            {apt.ownerPhone && (
                              <span className="ml-2">
                                <Phone className="w-3 h-3 inline mr-1" />
                                {apt.ownerPhone}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={apt.status}
                          onChange={(e) => updateStatus(apt.id, e.target.value as AppointmentStatus)}
                          className={`text-xs px-2 py-1 rounded border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => editAppointment(apt)}
                          className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                        <button
                          onClick={() => deleteAppointment(apt.id)}
                          className="p-2 rounded hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {apt.reason && (
                      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>{t('tools.vetAppointment.reason', 'Reason:')}</strong> {apt.reason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Appointment Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {editingAppointment ? t('tools.vetAppointment.editAppointment', 'Edit Appointment') : t('tools.vetAppointment.newAppointment2', 'New Appointment')}
                  </h2>
                  <button onClick={resetForm} className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Pet & Owner Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('tools.vetAppointment.petName', 'Pet Name *')}
                      value={newAppointment.petName}
                      onChange={(e) => setNewAppointment({ ...newAppointment, petName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <select
                      value={newAppointment.petSpecies}
                      onChange={(e) => setNewAppointment({ ...newAppointment, petSpecies: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="dog">{t('tools.vetAppointment.dog', 'Dog')}</option>
                      <option value="cat">{t('tools.vetAppointment.cat', 'Cat')}</option>
                      <option value="bird">{t('tools.vetAppointment.bird', 'Bird')}</option>
                      <option value="rabbit">{t('tools.vetAppointment.rabbit', 'Rabbit')}</option>
                      <option value="other">{t('tools.vetAppointment.other', 'Other')}</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder={t('tools.vetAppointment.ownerName', 'Owner Name *')}
                    value={newAppointment.ownerName}
                    onChange={(e) => setNewAppointment({ ...newAppointment, ownerName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="tel"
                      placeholder={t('tools.vetAppointment.phone', 'Phone')}
                      value={newAppointment.ownerPhone}
                      onChange={(e) => setNewAppointment({ ...newAppointment, ownerPhone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <input
                      type="email"
                      placeholder={t('tools.vetAppointment.email', 'Email')}
                      value={newAppointment.ownerEmail}
                      onChange={(e) => setNewAppointment({ ...newAppointment, ownerEmail: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <select
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {TIME_SLOTS.map(slot => (
                        <option key={slot} value={slot}>{formatTime(slot)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Type & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newAppointment.type}
                      onChange={(e) => {
                        const type = e.target.value as AppointmentType;
                        const typeInfo = APPOINTMENT_TYPES.find(t => t.value === type);
                        setNewAppointment({
                          ...newAppointment,
                          type,
                          duration: typeInfo?.duration || 30,
                        });
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {APPOINTMENT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder={t('tools.vetAppointment.durationMin', 'Duration (min)')}
                      value={newAppointment.duration}
                      onChange={(e) => setNewAppointment({ ...newAppointment, duration: parseInt(e.target.value) || 30 })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>

                  {/* Veterinarian */}
                  <select
                    value={newAppointment.veterinarian}
                    onChange={(e) => setNewAppointment({ ...newAppointment, veterinarian: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    {VETERINARIANS.map(vet => (
                      <option key={vet} value={vet}>{vet}</option>
                    ))}
                  </select>

                  {/* Reason & Notes */}
                  <input
                    type="text"
                    placeholder={t('tools.vetAppointment.reasonForVisit', 'Reason for visit')}
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <textarea
                    placeholder={t('tools.vetAppointment.additionalNotes', 'Additional notes')}
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />

                  {/* Status (for editing) */}
                  {editingAppointment && (
                    <select
                      value={newAppointment.status}
                      onChange={(e) => setNewAppointment({ ...newAppointment, status: e.target.value as AppointmentStatus })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={addAppointment}
                    className="w-full py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors"
                  >
                    {editingAppointment ? t('tools.vetAppointment.updateAppointment', 'Update Appointment') : t('tools.vetAppointment.scheduleAppointment', 'Schedule Appointment')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VetAppointmentTool;
