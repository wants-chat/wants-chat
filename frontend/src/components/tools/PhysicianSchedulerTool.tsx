'use client';

import React, { useState, useMemo } from 'react';
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
  UserCheck,
  Stethoscope,
  MapPin,
  Phone,
  Video,
  Building,
  Users,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentId?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  patientPhone: string;
  appointmentType: 'new-patient' | 'follow-up' | 'urgent' | 'procedure' | 'consultation' | 'telehealth';
  visitReason: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'no-show' | 'cancelled' | 'rescheduled';
  notes: string;
  room: string;
  isRecurring: boolean;
  recurringPattern?: string;
}

interface PhysicianSchedule {
  id: string;
  physicianName: string;
  physicianId: string;
  specialty: string;
  department: string;
  location: string;
  date: string;
  dayOfWeek: string;
  workingHours: {
    start: string;
    end: string;
  };
  breakTimes: {
    start: string;
    end: string;
    label: string;
  }[];
  appointments: Appointment[];
  availableSlots: number;
  bookedSlots: number;
  totalPatients: number;
  status: 'available' | 'fully-booked' | 'partial' | 'off' | 'on-call';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PhysicianSchedulerToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'physician-scheduler';

const scheduleColumns: ColumnConfig[] = [
  { key: 'physicianName', header: 'Physician', type: 'string' },
  { key: 'specialty', header: 'Specialty', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'totalPatients', header: 'Patients', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
];

const createNewSchedule = (): PhysicianSchedule => ({
  id: crypto.randomUUID(),
  physicianName: '',
  physicianId: '',
  specialty: '',
  department: '',
  location: '',
  date: new Date().toISOString().split('T')[0],
  dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  workingHours: {
    start: '08:00',
    end: '17:00',
  },
  breakTimes: [
    { start: '12:00', end: '13:00', label: 'Lunch' }
  ],
  appointments: [],
  availableSlots: 16,
  bookedSlots: 0,
  totalPatients: 0,
  status: 'available',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewAppointment = (): Appointment => ({
  id: crypto.randomUUID(),
  patientName: '',
  patientId: '',
  patientPhone: '',
  appointmentType: 'follow-up',
  visitReason: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '09:30',
  duration: 30,
  status: 'scheduled',
  notes: '',
  room: '',
  isRecurring: false,
});

const SPECIALTIES = [
  'Family Medicine',
  'Internal Medicine',
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
];

const APPOINTMENT_TYPES = [
  { value: 'new-patient', label: 'New Patient', duration: 60 },
  { value: 'follow-up', label: 'Follow-up', duration: 30 },
  { value: 'urgent', label: 'Urgent', duration: 30 },
  { value: 'procedure', label: 'Procedure', duration: 60 },
  { value: 'consultation', label: 'Consultation', duration: 45 },
  { value: 'telehealth', label: 'Telehealth', duration: 30 },
];

export const PhysicianSchedulerTool: React.FC<PhysicianSchedulerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: schedules,
    add: addSchedule,
    update: updateSchedule,
    remove: removeSchedule,
    isLoading,
    isSyncing,
    lastSynced,
    error,
  } = useToolData<PhysicianSchedule>(TOOL_ID);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<PhysicianSchedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PhysicianSchedule | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');

  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      const matchesSearch =
        schedule.physicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
      const matchesSpecialty = specialtyFilter === 'all' || schedule.specialty === specialtyFilter;
      const matchesDate = !dateFilter || schedule.date === dateFilter;
      return matchesSearch && matchesStatus && matchesSpecialty && matchesDate;
    });
  }, [schedules, searchTerm, statusFilter, specialtyFilter, dateFilter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = schedules.filter(s => s.date === today);
    const totalAppointments = todaySchedules.reduce((sum, s) => sum + s.appointments.length, 0);
    const completedToday = todaySchedules.reduce((sum, s) =>
      sum + s.appointments.filter(a => a.status === 'completed').length, 0);
    const noShows = todaySchedules.reduce((sum, s) =>
      sum + s.appointments.filter(a => a.status === 'no-show').length, 0);

    return {
      totalSchedules: schedules.length,
      todayAppointments: totalAppointments,
      completedToday,
      noShows,
      availablePhysicians: todaySchedules.filter(s => s.status === 'available' || s.status === 'partial').length,
    };
  }, [schedules]);

  const handleSaveSchedule = () => {
    if (!editingSchedule) return;

    const scheduleToSave = {
      ...editingSchedule,
      dayOfWeek: new Date(editingSchedule.date).toLocaleDateString('en-US', { weekday: 'long' }),
      updatedAt: new Date().toISOString(),
    };

    if (schedules.find(s => s.id === scheduleToSave.id)) {
      updateSchedule(scheduleToSave);
    } else {
      addSchedule(scheduleToSave);
    }
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const handleSaveAppointment = () => {
    if (!editingAppointment || !selectedSchedule) return;

    const updatedAppointments = selectedSchedule.appointments.find(a => a.id === editingAppointment.id)
      ? selectedSchedule.appointments.map(a => a.id === editingAppointment.id ? editingAppointment : a)
      : [...selectedSchedule.appointments, editingAppointment];

    const updatedSchedule = {
      ...selectedSchedule,
      appointments: updatedAppointments,
      bookedSlots: updatedAppointments.length,
      totalPatients: new Set(updatedAppointments.map(a => a.patientId)).size,
      status: updatedAppointments.length >= selectedSchedule.availableSlots ? 'fully-booked' :
              updatedAppointments.length > 0 ? 'partial' : 'available' as const,
      updatedAt: new Date().toISOString(),
    };

    updateSchedule(updatedSchedule);
    setSelectedSchedule(updatedSchedule);
    setIsAppointmentModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDeleteSchedule = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Schedule',
      message: 'Are you sure you want to delete this schedule?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      removeSchedule(id);
      if (selectedSchedule?.id === id) {
        setSelectedSchedule(null);
      }
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!selectedSchedule) return;

    const confirmed = await confirm({
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment?',
      confirmText: 'Cancel Appointment',
      cancelText: 'Keep',
      variant: 'danger',
    });
    if (!confirmed) return;

    const updatedAppointments = selectedSchedule.appointments.filter(a => a.id !== appointmentId);
    const updatedSchedule = {
      ...selectedSchedule,
      appointments: updatedAppointments,
      bookedSlots: updatedAppointments.length,
      totalPatients: new Set(updatedAppointments.map(a => a.patientId)).size,
      status: updatedAppointments.length >= selectedSchedule.availableSlots ? 'fully-booked' :
              updatedAppointments.length > 0 ? 'partial' : 'available' as const,
      updatedAt: new Date().toISOString(),
    };

    updateSchedule(updatedSchedule);
    setSelectedSchedule(updatedSchedule);
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: Appointment['status']) => {
    if (!selectedSchedule) return;

    const updatedAppointments = selectedSchedule.appointments.map(a =>
      a.id === appointmentId ? { ...a, status: newStatus } : a
    );
    const updatedSchedule = {
      ...selectedSchedule,
      appointments: updatedAppointments,
      updatedAt: new Date().toISOString(),
    };

    updateSchedule(updatedSchedule);
    setSelectedSchedule(updatedSchedule);
  };

  const getStatusColor = (status: PhysicianSchedule['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'fully-booked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'off': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'on-call': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getAppointmentStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'confirmed': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'checked-in': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'no-show': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'rescheduled': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getAppointmentTypeIcon = (type: Appointment['appointmentType']) => {
    switch (type) {
      case 'new-patient': return <UserCheck className="h-4 w-4" />;
      case 'follow-up': return <User className="h-4 w-4" />;
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      case 'procedure': return <Stethoscope className="h-4 w-4" />;
      case 'consultation': return <Users className="h-4 w-4" />;
      case 'telehealth': return <Video className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.physicianScheduler.physicianScheduler', 'Physician Scheduler')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.physicianScheduler.managePhysicianSchedulesAndAppointments', 'Manage physician schedules and appointments')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="physician-scheduler" toolName="Physician Scheduler" />

            <SyncStatus isSyncing={isSyncing} lastSynced={lastSynced} error={error} />
            <ExportDropdown
              data={schedules}
              columns={scheduleColumns}
              filename="physician-schedules"
            />
            <button
              onClick={() => {
                setEditingSchedule(createNewSchedule());
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('tools.physicianScheduler.addSchedule', 'Add Schedule')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.physicianScheduler.totalSchedules', 'Total Schedules')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalSchedules}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.physicianScheduler.todaySAppts', 'Today\'s Appts')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.todayAppointments}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.physicianScheduler.completed', 'Completed')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.completedToday}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.physicianScheduler.noShows', 'No-Shows')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.noShows}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-purple-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.physicianScheduler.availableToday', 'Available Today')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.availablePhysicians}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-3`}>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={t('tools.physicianScheduler.searchPhysicians', 'Search physicians...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">{t('tools.physicianScheduler.allSpecialties', 'All Specialties')}</option>
            {SPECIALTIES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">{t('tools.physicianScheduler.allStatus', 'All Status')}</option>
            <option value="available">{t('tools.physicianScheduler.available', 'Available')}</option>
            <option value="partial">{t('tools.physicianScheduler.partiallyBooked', 'Partially Booked')}</option>
            <option value="fully-booked">{t('tools.physicianScheduler.fullyBooked', 'Fully Booked')}</option>
            <option value="off">{t('tools.physicianScheduler.dayOff', 'Day Off')}</option>
            <option value="on-call">{t('tools.physicianScheduler.onCall', 'On Call')}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-280px)]">
        {/* Schedule List */}
        <div className={`w-1/3 border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto`}>
          {filteredSchedules.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.physicianScheduler.noSchedulesFound', 'No schedules found')}</p>
            </div>
          ) : (
            filteredSchedules.map(schedule => (
              <div
                key={schedule.id}
                onClick={() => setSelectedSchedule(schedule)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                } ${
                  selectedSchedule?.id === schedule.id
                    ? isDark ? 'bg-gray-700' : 'bg-blue-50'
                    : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                      <Stethoscope className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {schedule.physicianName || 'Unnamed Physician'}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {schedule.specialty}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                    {schedule.status.replace('-', ' ')}
                  </span>
                </div>
                <div className={`mt-3 flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(schedule.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {schedule.workingHours.start} - {schedule.workingHours.end}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {schedule.appointments.length} appts
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Schedule Detail */}
        <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {selectedSchedule ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Stethoscope className={`h-8 w-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Dr. {selectedSchedule.physicianName}
                    </h2>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedSchedule.specialty} - {selectedSchedule.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingAppointment(createNewAppointment());
                      setIsAppointmentModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                    {t('tools.physicianScheduler.bookAppointment', 'Book Appointment')}
                  </button>
                  <button
                    onClick={() => {
                      setEditingSchedule(selectedSchedule);
                      setIsModalOpen(true);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  >
                    <Edit2 className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(selectedSchedule.id)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Schedule Info */}
              <div className={`grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.physicianScheduler.date', 'Date')}</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(selectedSchedule.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.physicianScheduler.workingHours', 'Working Hours')}</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedSchedule.workingHours.start} - {selectedSchedule.workingHours.end}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.physicianScheduler.location', 'Location')}</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedSchedule.location || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Appointments */}
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Appointments ({selectedSchedule.appointments.length})
              </h3>

              {selectedSchedule.appointments.length === 0 ? (
                <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <Clock className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.physicianScheduler.noAppointmentsScheduled', 'No appointments scheduled')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSchedule.appointments
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(appointment => (
                    <div
                      key={appointment.id}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            {getAppointmentTypeIcon(appointment.appointmentType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {appointment.patientName}
                              </h4>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getAppointmentStatusColor(appointment.status)}`}>
                                {appointment.status.replace('-', ' ')}
                              </span>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {appointment.visitReason}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                          {appointment.room && (
                            <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                              Room {appointment.room}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {appointment.status === 'scheduled' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          >
                            {t('tools.physicianScheduler.confirm', 'Confirm')}
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'checked-in')}
                            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            {t('tools.physicianScheduler.checkIn', 'Check In')}
                          </button>
                        )}
                        {appointment.status === 'checked-in' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'in-progress')}
                            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                          >
                            {t('tools.physicianScheduler.startVisit', 'Start Visit')}
                          </button>
                        )}
                        {appointment.status === 'in-progress' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            {t('tools.physicianScheduler.complete', 'Complete')}
                          </button>
                        )}
                        {['scheduled', 'confirmed'].includes(appointment.status) && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'no-show')}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              {t('tools.physicianScheduler.noShow', 'No Show')}
                            </button>
                            <button
                              onClick={() => {
                                setEditingAppointment(appointment);
                                setIsAppointmentModalOpen(true);
                              }}
                              className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                              <Edit2 className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedSchedule.notes && (
                <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.physicianScheduler.notes', 'Notes')}</h4>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{selectedSchedule.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`flex items-center justify-center h-full ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>{t('tools.physicianScheduler.selectAScheduleToView', 'Select a schedule to view details')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && editingSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {schedules.find(s => s.id === editingSchedule.id) ? t('tools.physicianScheduler.editSchedule', 'Edit Schedule') : t('tools.physicianScheduler.createSchedule', 'Create Schedule')}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.physicianName', 'Physician Name *')}
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.physicianName}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, physicianName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.physicianScheduler.drJohnSmith', 'Dr. John Smith')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.physicianId', 'Physician ID')}
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.physicianId}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, physicianId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.physicianScheduler.phy001', 'PHY-001')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.specialty', 'Specialty *')}
                  </label>
                  <select
                    value={editingSchedule.specialty}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, specialty: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.physicianScheduler.selectSpecialty', 'Select specialty')}</option>
                    {SPECIALTIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.department', 'Department')}
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.department}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, department: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.physicianScheduler.mainHospital', 'Main Hospital')}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.physicianScheduler.location2', 'Location')}
                </label>
                <input
                  type="text"
                  value={editingSchedule.location}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, location: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.physicianScheduler.buildingARoom205', 'Building A, Room 205')}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.date2', 'Date *')}
                  </label>
                  <input
                    type="date"
                    value={editingSchedule.date}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.startTime', 'Start Time')}
                  </label>
                  <input
                    type="time"
                    value={editingSchedule.workingHours.start}
                    onChange={(e) => setEditingSchedule({
                      ...editingSchedule,
                      workingHours: { ...editingSchedule.workingHours, start: e.target.value }
                    })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.endTime', 'End Time')}
                  </label>
                  <input
                    type="time"
                    value={editingSchedule.workingHours.end}
                    onChange={(e) => setEditingSchedule({
                      ...editingSchedule,
                      workingHours: { ...editingSchedule.workingHours, end: e.target.value }
                    })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.status', 'Status')}
                  </label>
                  <select
                    value={editingSchedule.status}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, status: e.target.value as PhysicianSchedule['status'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="available">{t('tools.physicianScheduler.available2', 'Available')}</option>
                    <option value="partial">{t('tools.physicianScheduler.partiallyBooked2', 'Partially Booked')}</option>
                    <option value="fully-booked">{t('tools.physicianScheduler.fullyBooked2', 'Fully Booked')}</option>
                    <option value="off">{t('tools.physicianScheduler.dayOff2', 'Day Off')}</option>
                    <option value="on-call">{t('tools.physicianScheduler.onCall2', 'On Call')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.availableSlots', 'Available Slots')}
                  </label>
                  <input
                    type="number"
                    value={editingSchedule.availableSlots}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, availableSlots: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.physicianScheduler.notes2', 'Notes')}
                </label>
                <textarea
                  value={editingSchedule.notes}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.physicianScheduler.additionalNotes', 'Additional notes...')}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.physicianScheduler.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={!editingSchedule.physicianName || !editingSchedule.specialty || !editingSchedule.date}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {t('tools.physicianScheduler.saveSchedule', 'Save Schedule')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {isAppointmentModalOpen && editingAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedSchedule?.appointments.find(a => a.id === editingAppointment.id) ? t('tools.physicianScheduler.editAppointment', 'Edit Appointment') : t('tools.physicianScheduler.bookAppointment2', 'Book Appointment')}
              </h2>
              <button onClick={() => setIsAppointmentModalOpen(false)}>
                <X className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.patientName', 'Patient Name *')}
                  </label>
                  <input
                    type="text"
                    value={editingAppointment.patientName}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.physicianScheduler.johnDoe', 'John Doe')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.patientId', 'Patient ID')}
                  </label>
                  <input
                    type="text"
                    value={editingAppointment.patientId}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.physicianScheduler.pat001', 'PAT-001')}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.physicianScheduler.phoneNumber', 'Phone Number')}
                </label>
                <input
                  type="tel"
                  value={editingAppointment.patientPhone}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, patientPhone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.appointmentType', 'Appointment Type *')}
                  </label>
                  <select
                    value={editingAppointment.appointmentType}
                    onChange={(e) => {
                      const type = APPOINTMENT_TYPES.find(t => t.value === e.target.value);
                      setEditingAppointment({
                        ...editingAppointment,
                        appointmentType: e.target.value as Appointment['appointmentType'],
                        duration: type?.duration || 30
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {APPOINTMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label} ({type.duration} min)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.room', 'Room')}
                  </label>
                  <input
                    type="text"
                    value={editingAppointment.room}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, room: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="101"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.physicianScheduler.visitReason', 'Visit Reason *')}
                </label>
                <input
                  type="text"
                  value={editingAppointment.visitReason}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, visitReason: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.physicianScheduler.annualCheckupFollowUpVisit', 'Annual checkup, follow-up visit, etc.')}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.date3', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={editingAppointment.date}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.startTime2', 'Start Time')}
                  </label>
                  <input
                    type="time"
                    value={editingAppointment.startTime}
                    onChange={(e) => {
                      const start = e.target.value;
                      const [hours, minutes] = start.split(':').map(Number);
                      const endDate = new Date();
                      endDate.setHours(hours, minutes + editingAppointment.duration);
                      const end = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
                      setEditingAppointment({ ...editingAppointment, startTime: start, endTime: end });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.physicianScheduler.durationMin', 'Duration (min)')}
                  </label>
                  <input
                    type="number"
                    value={editingAppointment.duration}
                    onChange={(e) => {
                      const duration = parseInt(e.target.value) || 30;
                      const [hours, minutes] = editingAppointment.startTime.split(':').map(Number);
                      const endDate = new Date();
                      endDate.setHours(hours, minutes + duration);
                      const end = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
                      setEditingAppointment({ ...editingAppointment, duration, endTime: end });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.physicianScheduler.notes3', 'Notes')}
                </label>
                <textarea
                  value={editingAppointment.notes}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.physicianScheduler.additionalNotes2', 'Additional notes...')}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setIsAppointmentModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.physicianScheduler.cancel2', 'Cancel')}
              </button>
              <button
                onClick={handleSaveAppointment}
                disabled={!editingAppointment.patientName || !editingAppointment.visitReason}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {t('tools.physicianScheduler.saveAppointment', 'Save Appointment')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default PhysicianSchedulerTool;
