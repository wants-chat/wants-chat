'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Save,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Video,
  Stethoscope,
  FileText,
  Bell,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface MedicalAppointment {
  id: string;
  patientName: string;
  patientId: string;
  patientPhone: string;
  patientEmail: string;
  dateOfBirth: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime: string;
  duration: number;
  appointmentType: 'new-patient' | 'follow-up' | 'urgent' | 'procedure' | 'consultation' | 'telehealth' | 'annual-checkup' | 'specialist';
  visitReason: string;
  physician: string;
  department: string;
  location: string;
  room: string;
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'no-show' | 'cancelled' | 'rescheduled';
  insuranceVerified: boolean;
  copayAmount: number;
  copayCollected: boolean;
  reminderSent: boolean;
  specialInstructions: string;
  notes: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
  createdAt: string;
  updatedAt: string;
}

interface AppointmentSchedulerMedicalToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'appointment-scheduler-medical';

const appointmentColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'appointmentDate', header: 'Date', type: 'date' },
  { key: 'appointmentTime', header: 'Time', type: 'string' },
  { key: 'appointmentType', header: 'Type', type: 'string' },
  { key: 'physician', header: 'Physician', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
];

const createNewAppointment = (): MedicalAppointment => ({
  id: crypto.randomUUID(),
  patientName: '',
  patientId: '',
  patientPhone: '',
  patientEmail: '',
  dateOfBirth: '',
  appointmentDate: new Date().toISOString().split('T')[0],
  appointmentTime: '09:00',
  endTime: '09:30',
  duration: 30,
  appointmentType: 'follow-up',
  visitReason: '',
  physician: '',
  department: '',
  location: '',
  room: '',
  status: 'scheduled',
  insuranceVerified: false,
  copayAmount: 0,
  copayCollected: false,
  reminderSent: false,
  specialInstructions: '',
  notes: '',
  isRecurring: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const APPOINTMENT_TYPES = [
  { value: 'new-patient', label: 'New Patient', duration: 60, color: 'bg-purple-500' },
  { value: 'follow-up', label: 'Follow-up', duration: 30, color: 'bg-blue-500' },
  { value: 'urgent', label: 'Urgent Care', duration: 30, color: 'bg-red-500' },
  { value: 'procedure', label: 'Procedure', duration: 60, color: 'bg-orange-500' },
  { value: 'consultation', label: 'Consultation', duration: 45, color: 'bg-teal-500' },
  { value: 'telehealth', label: 'Telehealth', duration: 30, color: 'bg-green-500' },
  { value: 'annual-checkup', label: 'Annual Checkup', duration: 45, color: 'bg-indigo-500' },
  { value: 'specialist', label: 'Specialist Visit', duration: 45, color: 'bg-pink-500' },
];

const DEPARTMENTS = [
  'Primary Care',
  'Internal Medicine',
  'Family Medicine',
  'Pediatrics',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'Oncology',
  'Psychiatry',
  'OB/GYN',
  'Urology',
  'Gastroenterology',
  'Pulmonology',
  'Endocrinology',
  'Rheumatology',
  'Ophthalmology',
  'ENT',
];

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  'checked-in': { label: 'Checked In', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  'no-show': { label: 'No Show', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
  rescheduled: { label: 'Rescheduled', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
};

export const AppointmentSchedulerMedicalTool: React.FC<AppointmentSchedulerMedicalToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: appointments,
    addItem: addAppointment,
    updateItem: updateAppointment,
    deleteItem: deleteAppointment,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<MedicalAppointment>(TOOL_ID, [], appointmentColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<MedicalAppointment | null>(null);
  const [formData, setFormData] = useState<MedicalAppointment>(createNewAppointment());
  const [activeView, setActiveView] = useState<'list' | 'calendar' | 'day'>('list');

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.appointmentDate === today);
    return {
      total: appointments.length,
      todayTotal: todayAppointments.length,
      confirmed: todayAppointments.filter(a => a.status === 'confirmed').length,
      checkedIn: todayAppointments.filter(a => a.status === 'checked-in').length,
      inProgress: todayAppointments.filter(a => a.status === 'in-progress').length,
      completed: todayAppointments.filter(a => a.status === 'completed').length,
      noShow: todayAppointments.filter(a => a.status === 'no-show').length,
    };
  }, [appointments]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = searchQuery === '' ||
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.physician.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientId.includes(searchQuery);
      const matchesStatus = filterStatus === '' || apt.status === filterStatus;
      const matchesDepartment = filterDepartment === '' || apt.department === filterDepartment;
      const matchesDate = activeView !== 'day' || apt.appointmentDate === selectedDate;
      return matchesSearch && matchesStatus && matchesDepartment && matchesDate;
    }).sort((a, b) => {
      const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
      if (dateCompare !== 0) return dateCompare;
      return a.appointmentTime.localeCompare(b.appointmentTime);
    });
  }, [appointments, searchQuery, filterStatus, filterDepartment, selectedDate, activeView]);

  // Get appointments for a specific date (for calendar view)
  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(a => a.appointmentDate === date);
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: { date: string; isCurrentMonth: boolean; appointments: number }[] = [];

    // Add days from previous month
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({
        date: d.toISOString().split('T')[0],
        isCurrentMonth: false,
        appointments: getAppointmentsForDate(d.toISOString().split('T')[0]).length,
      });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d.toISOString().split('T')[0],
        isCurrentMonth: true,
        appointments: getAppointmentsForDate(d.toISOString().split('T')[0]).length,
      });
    }

    // Add days from next month
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d.toISOString().split('T')[0],
        isCurrentMonth: false,
        appointments: getAppointmentsForDate(d.toISOString().split('T')[0]).length,
      });
    }

    return days;
  }, [selectedDate, appointments]);

  const handleSave = () => {
    const typeConfig = APPOINTMENT_TYPES.find(t => t.value === formData.appointmentType);
    const duration = typeConfig?.duration || 30;
    const [hours, minutes] = formData.appointmentTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + duration);
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    const updatedData = {
      ...formData,
      duration,
      endTime,
      updatedAt: new Date().toISOString(),
    };

    if (editingAppointment) {
      updateAppointment(updatedData.id, updatedData);
    } else {
      addAppointment({ ...updatedData, createdAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingAppointment(null);
    setFormData(createNewAppointment());
  };

  const handleEdit = (apt: MedicalAppointment) => {
    setEditingAppointment(apt);
    setFormData(apt);
    setShowModal(true);
  };

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Appointment',
      message: 'Are you sure you want to delete this appointment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteAppointment(id);
    }
  }, [confirm, deleteAppointment]);

  const handleStatusChange = (id: string, newStatus: MedicalAppointment['status']) => {
    updateAppointment(id, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    current.setMonth(current.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D9488] mx-auto mb-4"></div>
          <p>{t('tools.appointmentSchedulerMedical.loadingAppointments', 'Loading appointments...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.appointmentSchedulerMedical.medicalAppointmentScheduler', 'Medical Appointment Scheduler')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.appointmentSchedulerMedical.scheduleAndManagePatientAppointments', 'Schedule and manage patient appointments')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="appointment-scheduler-medical" toolName="Appointment Scheduler Medical" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'medical-appointments' })}
                onExportExcel={() => exportExcel({ filename: 'medical-appointments' })}
                onExportJSON={() => exportJSON({ filename: 'medical-appointments' })}
                onExportPDF={() => exportPDF({
                  filename: 'medical-appointments',
                  title: 'Medical Appointments Report',
                  subtitle: `${appointments.length} appointments`,
                  orientation: 'landscape',
                })}
                onPrint={() => print('Medical Appointments Report')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                disabled={appointments.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button
                onClick={() => {
                  setFormData(createNewAppointment());
                  setEditingAppointment(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C7C] text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('tools.appointmentSchedulerMedical.newAppointment', 'New Appointment')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appointmentSchedulerMedical.total', 'Total')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appointmentSchedulerMedical.today', 'Today')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.todayTotal}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appointmentSchedulerMedical.confirmed', 'Confirmed')}</p>
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appointmentSchedulerMedical.checkedIn', 'Checked In')}</p>
            <p className="text-2xl font-bold text-teal-600">{stats.checkedIn}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appointmentSchedulerMedical.inProgress', 'In Progress')}</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appointmentSchedulerMedical.completed', 'Completed')}</p>
            <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.appointmentSchedulerMedical.noShow', 'No Show')}</p>
            <p className="text-2xl font-bold text-red-600">{stats.noShow}</p>
          </div>
        </div>

        {/* View Tabs & Filters */}
        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* View Tabs */}
            <div className="flex gap-2">
              {(['list', 'calendar', 'day'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    activeView === view
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {view === 'day' ? 'Day View' : view}
                </button>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-1 gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.appointmentSchedulerMedical.searchPatientsPhysicians', 'Search patients, physicians...')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="">{t('tools.appointmentSchedulerMedical.allStatuses', 'All Statuses')}</option>
                {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                value={filterDepartment}
                onChange={e => setFilterDepartment(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="">{t('tools.appointmentSchedulerMedical.allDepartments', 'All Departments')}</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => navigateMonth('prev')} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => navigateMonth('next')} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={`text-center py-2 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const isToday = day.date === new Date().toISOString().split('T')[0];
                const isSelected = day.date === selectedDate;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setActiveView('day');
                    }}
                    className={`p-2 text-center rounded-lg transition-colors ${
                      !day.isCurrentMonth
                        ? isDark ? 'text-gray-600' : 'text-gray-400'
                        : isSelected
                        ? 'bg-[#0D9488] text-white'
                        : isToday
                        ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                        : isDark ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <span className="block">{new Date(day.date).getDate()}</span>
                    {day.appointments > 0 && (
                      <span className={`text-xs ${isSelected ? 'text-white/80' : t('tools.appointmentSchedulerMedical.text0d9488', 'text-[#0D9488]')}`}>
                        {day.appointments}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Day View Navigation */}
        {activeView === 'day' && (
          <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <button onClick={() => navigateDay('prev')} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
              </div>
              <button onClick={() => navigateDay('next')} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Appointment List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className={`p-12 text-center rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.appointmentSchedulerMedical.noAppointmentsFound', 'No appointments found')}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {activeView === 'day' ? t('tools.appointmentSchedulerMedical.noAppointmentsScheduledForThis', 'No appointments scheduled for this date') : t('tools.appointmentSchedulerMedical.scheduleYourFirstAppointment', 'Schedule your first appointment')}
              </p>
            </div>
          ) : (
            filteredAppointments.map(apt => {
              const typeConfig = APPOINTMENT_TYPES.find(t => t.value === apt.appointmentType);
              const statusConfig = STATUS_CONFIG[apt.status];
              return (
                <div
                  key={apt.id}
                  className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Patient & Time Info */}
                    <div className="flex items-start gap-4">
                      <div className={`w-1 h-16 rounded-full ${typeConfig?.color || 'bg-gray-400'}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {apt.patientName}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className={`flex flex-wrap gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(apt.appointmentDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {apt.appointmentTime} - {apt.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Stethoscope className="w-4 h-4" />
                            {apt.physician || 'No physician assigned'}
                          </span>
                          {apt.appointmentType === 'telehealth' && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Video className="w-4 h-4" />
                              {t('tools.appointmentSchedulerMedical.telehealth', 'Telehealth')}
                            </span>
                          )}
                        </div>
                        <div className={`flex flex-wrap gap-4 text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          <span>{typeConfig?.label || apt.appointmentType}</span>
                          <span>{apt.department || 'No department'}</span>
                          {apt.room && <span>Room: {apt.room}</span>}
                        </div>
                        {apt.visitReason && (
                          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <strong>{t('tools.appointmentSchedulerMedical.reason', 'Reason:')}</strong> {apt.visitReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      {/* Quick Status Update Buttons */}
                      {apt.status === 'scheduled' && (
                        <button
                          onClick={() => handleStatusChange(apt.id, 'confirmed')}
                          className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          {t('tools.appointmentSchedulerMedical.confirm', 'Confirm')}
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(apt.id, 'checked-in')}
                          className="px-3 py-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                        >
                          {t('tools.appointmentSchedulerMedical.checkIn', 'Check In')}
                        </button>
                      )}
                      {apt.status === 'checked-in' && (
                        <button
                          onClick={() => handleStatusChange(apt.id, 'in-progress')}
                          className="px-3 py-1.5 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                        >
                          {t('tools.appointmentSchedulerMedical.start', 'Start')}
                        </button>
                      )}
                      {apt.status === 'in-progress' && (
                        <button
                          onClick={() => handleStatusChange(apt.id, 'completed')}
                          className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                          {t('tools.appointmentSchedulerMedical.complete', 'Complete')}
                        </button>
                      )}

                      <button
                        onClick={() => handleEdit(apt)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title={t('tools.appointmentSchedulerMedical.edit', 'Edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`sticky top-0 p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex items-center justify-between`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingAppointment ? t('tools.appointmentSchedulerMedical.editAppointment', 'Edit Appointment') : t('tools.appointmentSchedulerMedical.newAppointment2', 'New Appointment')}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingAppointment(null);
                    setFormData(createNewAppointment());
                  }}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Patient Information */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.appointmentSchedulerMedical.patientInformation', 'Patient Information')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.patientName', 'Patient Name *')}
                      </label>
                      <input
                        type="text"
                        value={formData.patientName}
                        onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        placeholder={t('tools.appointmentSchedulerMedical.enterPatientName', 'Enter patient name')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.patientId', 'Patient ID')}
                      </label>
                      <input
                        type="text"
                        value={formData.patientId}
                        onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        placeholder={t('tools.appointmentSchedulerMedical.patientId2', 'Patient ID')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.phone', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        value={formData.patientPhone}
                        onChange={e => setFormData({ ...formData, patientPhone: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        placeholder={t('tools.appointmentSchedulerMedical.phoneNumber', 'Phone number')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.email', 'Email')}
                      </label>
                      <input
                        type="email"
                        value={formData.patientEmail}
                        onChange={e => setFormData({ ...formData, patientEmail: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        placeholder={t('tools.appointmentSchedulerMedical.emailAddress', 'Email address')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.dateOfBirth', 'Date of Birth')}
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.appointmentSchedulerMedical.appointmentDetails', 'Appointment Details')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.date', 'Date *')}
                      </label>
                      <input
                        type="date"
                        value={formData.appointmentDate}
                        onChange={e => setFormData({ ...formData, appointmentDate: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.time', 'Time *')}
                      </label>
                      <input
                        type="time"
                        value={formData.appointmentTime}
                        onChange={e => setFormData({ ...formData, appointmentTime: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.appointmentType', 'Appointment Type *')}
                      </label>
                      <select
                        value={formData.appointmentType}
                        onChange={e => setFormData({ ...formData, appointmentType: e.target.value as MedicalAppointment['appointmentType'] })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {APPOINTMENT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label} ({type.duration} min)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.status', 'Status')}
                      </label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as MedicalAppointment['status'] })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.physician', 'Physician')}
                      </label>
                      <input
                        type="text"
                        value={formData.physician}
                        onChange={e => setFormData({ ...formData, physician: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        placeholder={t('tools.appointmentSchedulerMedical.physicianName', 'Physician name')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.department', 'Department')}
                      </label>
                      <select
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="">{t('tools.appointmentSchedulerMedical.selectDepartment', 'Select department')}</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.location', 'Location')}
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        placeholder={t('tools.appointmentSchedulerMedical.clinicOfficeLocation', 'Clinic/Office location')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.room', 'Room')}
                      </label>
                      <input
                        type="text"
                        value={formData.room}
                        onChange={e => setFormData({ ...formData, room: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        placeholder={t('tools.appointmentSchedulerMedical.roomNumber', 'Room number')}
                      />
                    </div>
                  </div>
                </div>

                {/* Visit Information */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.appointmentSchedulerMedical.visitInformation', 'Visit Information')}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.reasonForVisit', 'Reason for Visit')}
                      </label>
                      <textarea
                        value={formData.visitReason}
                        onChange={e => setFormData({ ...formData, visitReason: e.target.value })}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        placeholder={t('tools.appointmentSchedulerMedical.describeTheReasonForThis', 'Describe the reason for this visit')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.specialInstructions', 'Special Instructions')}
                      </label>
                      <textarea
                        value={formData.specialInstructions}
                        onChange={e => setFormData({ ...formData, specialInstructions: e.target.value })}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        placeholder={t('tools.appointmentSchedulerMedical.fastingRequiredBringMedicationsEtc', 'Fasting required, bring medications, etc.')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.notes', 'Notes')}
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        placeholder={t('tools.appointmentSchedulerMedical.additionalNotes', 'Additional notes')}
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance & Payment */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.appointmentSchedulerMedical.insurancePayment', 'Insurance & Payment')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="insuranceVerified"
                        checked={formData.insuranceVerified}
                        onChange={e => setFormData({ ...formData, insuranceVerified: e.target.checked })}
                        className="w-4 h-4 rounded accent-[#0D9488]"
                      />
                      <label htmlFor="insuranceVerified" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.insuranceVerified', 'Insurance Verified')}
                      </label>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.copayAmount', 'Copay Amount')}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.copayAmount}
                        onChange={e => setFormData({ ...formData, copayAmount: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="copayCollected"
                        checked={formData.copayCollected}
                        onChange={e => setFormData({ ...formData, copayCollected: e.target.checked })}
                        className="w-4 h-4 rounded accent-[#0D9488]"
                      />
                      <label htmlFor="copayCollected" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.appointmentSchedulerMedical.copayCollected', 'Copay Collected')}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Recurring */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="w-4 h-4 rounded accent-[#0D9488]"
                    />
                    <label htmlFor="isRecurring" className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.appointmentSchedulerMedical.recurringAppointment', 'Recurring Appointment')}
                    </label>
                    {formData.isRecurring && (
                      <select
                        value={formData.recurringFrequency || 'monthly'}
                        onChange={e => setFormData({ ...formData, recurringFrequency: e.target.value as MedicalAppointment['recurringFrequency'] })}
                        className={`px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="weekly">{t('tools.appointmentSchedulerMedical.weekly', 'Weekly')}</option>
                        <option value="bi-weekly">{t('tools.appointmentSchedulerMedical.biWeekly', 'Bi-weekly')}</option>
                        <option value="monthly">{t('tools.appointmentSchedulerMedical.monthly', 'Monthly')}</option>
                        <option value="quarterly">{t('tools.appointmentSchedulerMedical.quarterly', 'Quarterly')}</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className={`sticky bottom-0 p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex gap-3`}>
                <button
                  onClick={handleSave}
                  disabled={!formData.patientName || !formData.appointmentDate}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C7C] disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {editingAppointment ? t('tools.appointmentSchedulerMedical.updateAppointment', 'Update Appointment') : t('tools.appointmentSchedulerMedical.scheduleAppointment', 'Schedule Appointment')}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingAppointment(null);
                    setFormData(createNewAppointment());
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.appointmentSchedulerMedical.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default AppointmentSchedulerMedicalTool;
