'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  Stethoscope,
  AlertCircle,
  Check,
  X,
  Bell,
  RefreshCw,
  Building,
  ClipboardList,
  Trash2,
  Edit3,
  Search,
  Filter,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  List,
  Loader2,
} from 'lucide-react';

// Types
type AppointmentType = 'consultation' | 'follow-up' | 'procedure' | 'physical';
type AppointmentStatus = 'scheduled' | 'confirmed' | 'checked-in' | 'completed' | 'no-show' | 'cancelled';
type CalendarView = 'day' | 'week' | 'month';
type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  color: string;
  workingDays: number[]; // 0-6, Sunday-Saturday
  workingHours: { start: string; end: string };
  breakTime?: { start: string; end: string };
}

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  equipment: string[];
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  roomId?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
  recurrence: RecurrencePattern;
  recurrenceEndDate?: string;
  reminders: {
    email: boolean;
    sms: boolean;
    daysBefore: number[];
  };
  createdAt: string;
}

interface WaitlistEntry {
  id: string;
  patientId: string;
  providerId: string;
  preferredType: AppointmentType;
  preferredDays: number[];
  preferredTimeRange: { start: string; end: string };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  addedAt: string;
}

const APPOINTMENT_TYPES: Record<AppointmentType, { label: string; defaultDuration: number; color: string }> = {
  consultation: { label: 'Consultation', defaultDuration: 30, color: '#3B82F6' },
  'follow-up': { label: 'Follow-up', defaultDuration: 15, color: '#10B981' },
  procedure: { label: 'Procedure', defaultDuration: 60, color: '#F59E0B' },
  physical: { label: 'Physical Exam', defaultDuration: 45, color: '#8B5CF6' },
};

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bgColor: string }> = {
  scheduled: { label: 'Scheduled', color: '#3B82F6', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  confirmed: { label: 'Confirmed', color: '#10B981', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  'checked-in': { label: 'Checked In', color: '#8B5CF6', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  completed: { label: 'Completed', color: '#6B7280', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
  'no-show': { label: 'No Show', color: '#EF4444', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  cancelled: { label: 'Cancelled', color: '#F59E0B', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
};

// Column configuration for exports
const APPOINTMENT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'patientId', header: 'Patient ID', type: 'string' },
  { key: 'providerId', header: 'Provider ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'roomId', header: 'Room ID', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'recurrence', header: 'Recurrence', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

const getTimeSlots = (start: string, end: string, interval: number = 15): string[] => {
  const slots: string[] = [];
  let current = start;
  while (current < end) {
    slots.push(current);
    current = addMinutes(current, interval);
  }
  return slots;
};

const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const getWeekDays = (date: Date): Date[] => {
  const days: Date[] = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  return days;
};

const isTimeSlotAvailable = (
  date: string,
  startTime: string,
  endTime: string,
  providerId: string,
  roomId: string | undefined,
  appointments: Appointment[],
  excludeAppointmentId?: string
): { available: boolean; reason?: string } => {
  const conflictingAppointments = appointments.filter((apt) => {
    if (apt.id === excludeAppointmentId) return false;
    if (apt.date !== date) return false;
    if (apt.status === 'cancelled') return false;

    // Check time overlap
    const aptStart = apt.startTime;
    const aptEnd = apt.endTime;
    const hasTimeOverlap = startTime < aptEnd && endTime > aptStart;

    if (!hasTimeOverlap) return false;

    // Check provider conflict
    if (apt.providerId === providerId) return true;

    // Check room conflict
    if (roomId && apt.roomId === roomId) return true;

    return false;
  });

  if (conflictingAppointments.length > 0) {
    const conflict = conflictingAppointments[0];
    if (conflict.providerId === providerId) {
      return { available: false, reason: 'Provider already has an appointment at this time' };
    }
    if (roomId && conflict.roomId === roomId) {
      return { available: false, reason: 'Room is already booked at this time' };
    }
  }

  return { available: true };
};

// Default data
const defaultProviders: Provider[] = [
  {
    id: 'prov-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'General Practice',
    email: 'sarah.johnson@clinic.com',
    phone: '(555) 123-4567',
    color: '#3B82F6',
    workingDays: [1, 2, 3, 4, 5],
    workingHours: { start: '09:00', end: '17:00' },
    breakTime: { start: '12:00', end: '13:00' },
  },
  {
    id: 'prov-2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    email: 'michael.chen@clinic.com',
    phone: '(555) 234-5678',
    color: '#10B981',
    workingDays: [1, 2, 3, 4, 5],
    workingHours: { start: '08:00', end: '16:00' },
    breakTime: { start: '12:00', end: '12:30' },
  },
  {
    id: 'prov-3',
    name: 'Dr. Emily Davis',
    specialty: 'Pediatrics',
    email: 'emily.davis@clinic.com',
    phone: '(555) 345-6789',
    color: '#8B5CF6',
    workingDays: [1, 2, 4, 5],
    workingHours: { start: '10:00', end: '18:00' },
  },
];

const defaultRooms: Room[] = [
  { id: 'room-1', name: 'Exam Room 1', type: 'Examination', capacity: 3, equipment: ['Exam Table', 'Blood Pressure Monitor'] },
  { id: 'room-2', name: 'Exam Room 2', type: 'Examination', capacity: 3, equipment: ['Exam Table', 'Scale'] },
  { id: 'room-3', name: 'Procedure Room', type: 'Procedure', capacity: 5, equipment: ['Surgical Table', 'IV Stand', 'Monitor'] },
  { id: 'room-4', name: 'Consultation Room', type: 'Consultation', capacity: 4, equipment: ['Desk', 'Chairs'] },
];

const defaultPatients: Patient[] = [
  {
    id: 'pat-1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 111-2222',
    dateOfBirth: '1985-03-15',
    address: '123 Main St, Anytown, ST 12345',
    insuranceProvider: 'Blue Cross',
    insuranceNumber: 'BC123456789',
  },
  {
    id: 'pat-2',
    name: 'Mary Johnson',
    email: 'mary.johnson@email.com',
    phone: '(555) 222-3333',
    dateOfBirth: '1990-07-22',
    address: '456 Oak Ave, Somewhere, ST 67890',
    insuranceProvider: 'Aetna',
    insuranceNumber: 'AE987654321',
  },
  {
    id: 'pat-3',
    name: 'Robert Williams',
    email: 'robert.williams@email.com',
    phone: '(555) 333-4444',
    dateOfBirth: '1978-11-08',
    address: '789 Pine Rd, Elsewhere, ST 11223',
  },
];

interface MedicalSchedulerToolProps {
  uiConfig?: UIConfig;
}

export const MedicalSchedulerTool = ({ uiConfig }: MedicalSchedulerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence of appointments
  const {
    data: appointments,
    setData: setAppointments,
    addItem: addAppointment,
    updateItem: updateAppointment,
    deleteItem: deleteAppointmentItem,
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
  } = useToolData<Appointment>('medical-scheduler', [], APPOINTMENT_COLUMNS);

  // State
  const [providers, setProviders] = useState<Provider[]>(defaultProviders);
  const [rooms, setRooms] = useState<Room[]>(defaultRooms);
  const [patients, setPatients] = useState<Patient[]>(defaultPatients);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'calendar' | 'appointments' | 'waitlist' | 'providers' | 'patients'>('calendar');

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Date can be prefilled
      if (params.dates && params.dates.length > 0) {
        setSelectedDate(new Date(params.dates[0]));
        setIsPrefilled(true);
      }
      // Open booking modal if text/notes provided
      if (params.texts && params.texts.length > 0) {
        setShowBookingModal(true);
        setIsPrefilled(true);
      }
      // Search query from notes
      if (params.notes) {
        setSearchQuery(params.notes);
        setActiveTab('patients');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    patientId: '',
    providerId: '',
    roomId: '',
    type: 'consultation' as AppointmentType,
    date: formatDate(new Date()),
    startTime: '09:00',
    duration: 30,
    notes: '',
    recurrence: 'none' as RecurrencePattern,
    recurrenceEndDate: '',
    reminders: {
      email: true,
      sms: false,
      daysBefore: [1],
    },
  });

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    insuranceProvider: '',
    insuranceNumber: '',
  });

  // Note: Appointments are now persisted via useToolData hook
  // Other data (providers, rooms, patients, waitlist) uses localStorage for now

  // Computed values
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (selectedProvider !== 'all' && apt.providerId !== selectedProvider) return false;
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
      if (searchQuery) {
        const patient = patients.find((p) => p.id === apt.patientId);
        const provider = providers.find((p) => p.id === apt.providerId);
        const query = searchQuery.toLowerCase();
        if (
          !patient?.name.toLowerCase().includes(query) &&
          !provider?.name.toLowerCase().includes(query) &&
          !apt.notes?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [appointments, selectedProvider, statusFilter, searchQuery, patients, providers]);

  const appointmentsForDate = useMemo(() => {
    const dateStr = formatDate(selectedDate);
    return filteredAppointments.filter((apt) => apt.date === dateStr);
  }, [filteredAppointments, selectedDate]);

  const dailySummary = useMemo(() => {
    const dateStr = formatDate(selectedDate);
    const dayAppointments = appointments.filter((apt) => apt.date === dateStr);
    return {
      total: dayAppointments.length,
      scheduled: dayAppointments.filter((a) => a.status === 'scheduled').length,
      confirmed: dayAppointments.filter((a) => a.status === 'confirmed').length,
      checkedIn: dayAppointments.filter((a) => a.status === 'checked-in').length,
      completed: dayAppointments.filter((a) => a.status === 'completed').length,
      noShow: dayAppointments.filter((a) => a.status === 'no-show').length,
      cancelled: dayAppointments.filter((a) => a.status === 'cancelled').length,
    };
  }, [appointments, selectedDate]);

  // Handlers
  const handleBookAppointment = () => {
    const endTime = addMinutes(bookingForm.startTime, bookingForm.duration);

    // Check for double booking
    const availability = isTimeSlotAvailable(
      bookingForm.date,
      bookingForm.startTime,
      endTime,
      bookingForm.providerId,
      bookingForm.roomId || undefined,
      appointments,
      editingAppointment?.id
    );

    if (!availability.available) {
      setValidationMessage(`Cannot book appointment: ${availability.reason}`);
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingAppointment) {
      updateAppointment(editingAppointment.id, {
        ...bookingForm,
        endTime,
        roomId: bookingForm.roomId || undefined,
      });
    } else {
      const newAppointment: Appointment = {
        id: generateId(),
        patientId: bookingForm.patientId,
        providerId: bookingForm.providerId,
        roomId: bookingForm.roomId || undefined,
        type: bookingForm.type,
        status: 'scheduled',
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        endTime,
        duration: bookingForm.duration,
        notes: bookingForm.notes,
        recurrence: bookingForm.recurrence,
        recurrenceEndDate: bookingForm.recurrenceEndDate || undefined,
        reminders: bookingForm.reminders,
        createdAt: new Date().toISOString(),
      };

      // Create recurring appointments if needed
      if (bookingForm.recurrence !== 'none' && bookingForm.recurrenceEndDate) {
        const recurringAppointments: Appointment[] = [newAppointment];
        let currentDate = new Date(bookingForm.date);
        const endDate = new Date(bookingForm.recurrenceEndDate);

        while (currentDate < endDate) {
          switch (bookingForm.recurrence) {
            case 'daily':
              currentDate.setDate(currentDate.getDate() + 1);
              break;
            case 'weekly':
              currentDate.setDate(currentDate.getDate() + 7);
              break;
            case 'biweekly':
              currentDate.setDate(currentDate.getDate() + 14);
              break;
            case 'monthly':
              currentDate.setMonth(currentDate.getMonth() + 1);
              break;
          }

          if (currentDate <= endDate) {
            const recurrenceAvailability = isTimeSlotAvailable(
              formatDate(currentDate),
              bookingForm.startTime,
              endTime,
              bookingForm.providerId,
              bookingForm.roomId || undefined,
              [...appointments, ...recurringAppointments]
            );

            if (recurrenceAvailability.available) {
              recurringAppointments.push({
                ...newAppointment,
                id: generateId(),
                date: formatDate(currentDate),
                createdAt: new Date().toISOString(),
              });
            }
          }
        }

        // Add all recurring appointments
        recurringAppointments.forEach((apt) => addAppointment(apt));
      } else {
        addAppointment(newAppointment);
      }
    }

    resetBookingForm();
    setShowBookingModal(false);
    setEditingAppointment(null);
  };

  const handleUpdateStatus = (appointmentId: string, newStatus: AppointmentStatus) => {
    updateAppointment(appointmentId, { status: newStatus });
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this appointment?');
    if (confirmed) {
      deleteAppointmentItem(appointmentId);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setBookingForm({
      patientId: appointment.patientId,
      providerId: appointment.providerId,
      roomId: appointment.roomId || '',
      type: appointment.type,
      date: appointment.date,
      startTime: appointment.startTime,
      duration: appointment.duration,
      notes: appointment.notes || '',
      recurrence: appointment.recurrence,
      recurrenceEndDate: appointment.recurrenceEndDate || '',
      reminders: appointment.reminders,
    });
    setShowBookingModal(true);
  };

  const handleSavePatient = () => {
    if (editingPatient) {
      setPatients((prev) =>
        prev.map((p) => (p.id === editingPatient.id ? { ...p, ...patientForm } : p))
      );
    } else {
      setPatients((prev) => [...prev, { ...patientForm, id: generateId() }]);
    }
    resetPatientForm();
    setShowPatientModal(false);
    setEditingPatient(null);
  };

  const handleAddToWaitlist = (patientId: string, providerId: string, type: AppointmentType) => {
    const entry: WaitlistEntry = {
      id: generateId(),
      patientId,
      providerId,
      preferredType: type,
      preferredDays: [1, 2, 3, 4, 5],
      preferredTimeRange: { start: '09:00', end: '17:00' },
      priority: 'medium',
      addedAt: new Date().toISOString(),
    };
    setWaitlist((prev) => [...prev, entry]);
  };

  const handleRemoveFromWaitlist = (entryId: string) => {
    setWaitlist((prev) => prev.filter((e) => e.id !== entryId));
  };

  const resetBookingForm = () => {
    setBookingForm({
      patientId: '',
      providerId: '',
      roomId: '',
      type: 'consultation',
      date: formatDate(new Date()),
      startTime: '09:00',
      duration: 30,
      notes: '',
      recurrence: 'none',
      recurrenceEndDate: '',
      reminders: { email: true, sms: false, daysBefore: [1] },
    });
  };

  const resetPatientForm = () => {
    setPatientForm({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      insuranceProvider: '',
      insuranceNumber: '',
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    switch (calendarView) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    setSelectedDate(newDate);
  };

  // Render functions
  const renderCalendarHeader = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigateDate('prev')}
          className={`p-2 rounded-lg ${
            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {calendarView === 'month'
            ? selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : calendarView === 'week'
            ? `Week of ${getWeekDays(selectedDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getWeekDays(selectedDate)[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        <button
          onClick={() => navigateDate('next')}
          className={`p-2 rounded-lg ${
            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSelectedDate(new Date())}
          className={`px-3 py-1 text-sm rounded-lg ${
            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Today
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className={`flex rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
          {(['day', 'week', 'month'] as CalendarView[]).map((view) => (
            <button
              key={view}
              onClick={() => setCalendarView(view)}
              className={`px-3 py-1.5 text-sm font-medium capitalize ${
                calendarView === view
                  ? 'bg-[#0D9488] text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {view === 'day' && <CalendarDays className="w-4 h-4 inline mr-1" />}
              {view === 'week' && <CalendarRange className="w-4 h-4 inline mr-1" />}
              {view === 'month' && <LayoutGrid className="w-4 h-4 inline mr-1" />}
              {view}
            </button>
          ))}
        </div>

        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className={`px-3 py-1.5 rounded-lg border text-sm ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-700'
          }`}
        >
          <option value="all">All Providers</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderDayView = () => {
    const timeSlots = getTimeSlots('08:00', '18:00', 30);
    const dayAppointments = appointmentsForDate;

    return (
      <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`grid grid-cols-[80px_1fr] ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {timeSlots.map((time) => {
            const slotAppointments = dayAppointments.filter(
              (apt) => apt.startTime <= time && apt.endTime > time
            );

            return (
              <div key={time} className="contents">
                <div
                  className={`p-2 text-xs text-right border-r border-b ${
                    theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {formatTime(time)}
                </div>
                <div
                  className={`p-1 min-h-[60px] border-b ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  {slotAppointments
                    .filter((apt) => apt.startTime === time)
                    .map((apt) => {
                      const patient = patients.find((p) => p.id === apt.patientId);
                      const provider = providers.find((p) => p.id === apt.providerId);
                      const typeConfig = APPOINTMENT_TYPES[apt.type];
                      const statusConfig = STATUS_CONFIG[apt.status];

                      return (
                        <div
                          key={apt.id}
                          onClick={() => handleEditAppointment(apt)}
                          className={`p-2 rounded-lg mb-1 cursor-pointer border-l-4 ${statusConfig.bgColor}`}
                          style={{ borderLeftColor: typeConfig.color }}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {patient?.name || 'Unknown Patient'}
                            </span>
                            <span
                              className="px-2 py-0.5 text-xs rounded-full"
                              style={{ backgroundColor: statusConfig.color, color: 'white' }}
                            >
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatTime(apt.startTime)} - {formatTime(apt.endTime)} | {provider?.name} | {typeConfig.label}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(selectedDate);
    const timeSlots = getTimeSlots('08:00', '18:00', 60);

    return (
      <div className={`rounded-lg border overflow-x-auto ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`grid grid-cols-[80px_repeat(7,1fr)] min-w-[900px] ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Header */}
          <div className={`p-2 border-b border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
          {weekDays.map((day) => {
            const isToday = formatDate(day) === formatDate(new Date());
            return (
              <div
                key={day.toISOString()}
                className={`p-2 text-center border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${
                  isToday ? 'bg-[#0D9488]/10' : ''
                }`}
              >
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    isToday ? 'text-[#0D9488]' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}

          {/* Time slots */}
          {timeSlots.map((time) => (
            <div key={time} className="contents">
              <div
                className={`p-2 text-xs text-right border-r border-b ${
                  theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
                }`}
              >
                {formatTime(time)}
              </div>
              {weekDays.map((day) => {
                const dateStr = formatDate(day);
                const slotAppointments = filteredAppointments.filter(
                  (apt) => apt.date === dateStr && apt.startTime <= time && apt.endTime > time
                );

                return (
                  <div
                    key={`${dateStr}-${time}`}
                    className={`p-1 min-h-[60px] border-b ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    {slotAppointments
                      .filter((apt) => apt.startTime === time)
                      .map((apt) => {
                        const patient = patients.find((p) => p.id === apt.patientId);
                        const typeConfig = APPOINTMENT_TYPES[apt.type];

                        return (
                          <div
                            key={apt.id}
                            onClick={() => handleEditAppointment(apt)}
                            className="p-1 rounded text-xs cursor-pointer truncate"
                            style={{ backgroundColor: typeConfig.color, color: 'white' }}
                          >
                            {patient?.name || 'Unknown'}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const days = getDaysInMonth(year, month);
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const paddingDays = Array(firstDayOfWeek).fill(null);

    return (
      <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`grid grid-cols-7 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className={`p-2 text-center text-sm font-medium border-b ${
                theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}

          {/* Padding */}
          {paddingDays.map((_, i) => (
            <div
              key={`padding-${i}`}
              className={`p-2 min-h-[100px] border-b border-r ${
                theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
              }`}
            />
          ))}

          {/* Days */}
          {days.map((day) => {
            const dateStr = formatDate(day);
            const dayAppointments = filteredAppointments.filter((apt) => apt.date === dateStr);
            const isToday = dateStr === formatDate(new Date());
            const isSelected = dateStr === formatDate(selectedDate);

            return (
              <div
                key={dateStr}
                onClick={() => {
                  setSelectedDate(day);
                  setCalendarView('day');
                }}
                className={`p-2 min-h-[100px] border-b border-r cursor-pointer ${
                  theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                } ${isSelected ? 'ring-2 ring-[#0D9488] ring-inset' : ''}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? 'w-7 h-7 rounded-full bg-[#0D9488] text-white flex items-center justify-center'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => {
                    const typeConfig = APPOINTMENT_TYPES[apt.type];
                    return (
                      <div
                        key={apt.id}
                        className="text-xs p-1 rounded truncate"
                        style={{ backgroundColor: typeConfig.color, color: 'white' }}
                      >
                        {formatTime(apt.startTime)}
                      </div>
                    );
                  })}
                  {dayAppointments.length > 3 && (
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDailySummary = () => (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Daily Summary - {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
          <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{dailySummary.total}</div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalScheduler.total', 'Total')}</div>
        </div>
        <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
          <div className="text-lg font-bold text-blue-500">{dailySummary.scheduled}</div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalScheduler.scheduled', 'Scheduled')}</div>
        </div>
        <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'}`}>
          <div className="text-lg font-bold text-green-500">{dailySummary.confirmed}</div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalScheduler.confirmed', 'Confirmed')}</div>
        </div>
        <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
          <div className="text-lg font-bold text-purple-500">{dailySummary.checkedIn}</div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalScheduler.checkedIn', 'Checked In')}</div>
        </div>
        <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
          <div className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{dailySummary.completed}</div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalScheduler.completed', 'Completed')}</div>
        </div>
        <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'}`}>
          <div className="text-lg font-bold text-red-500">{dailySummary.noShow}</div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalScheduler.noShow', 'No Show')}</div>
        </div>
        <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
          <div className="text-lg font-bold text-yellow-500">{dailySummary.cancelled}</div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalScheduler.cancelled', 'Cancelled')}</div>
        </div>
      </div>
    </div>
  );

  const renderAppointmentsList = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={t('tools.medicalScheduler.searchPatientsProvidersNotes', 'Search patients, providers, notes...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-700'
          }`}
        >
          <option value="all">{t('tools.medicalScheduler.allStatuses', 'All Statuses')}</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredAppointments.length === 0 ? (
          <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.medicalScheduler.noAppointmentsFound', 'No appointments found')}
          </div>
        ) : (
          filteredAppointments
            .sort((a, b) => {
              const dateCompare = a.date.localeCompare(b.date);
              if (dateCompare !== 0) return dateCompare;
              return a.startTime.localeCompare(b.startTime);
            })
            .map((apt) => {
              const patient = patients.find((p) => p.id === apt.patientId);
              const provider = providers.find((p) => p.id === apt.providerId);
              const room = rooms.find((r) => r.id === apt.roomId);
              const typeConfig = APPOINTMENT_TYPES[apt.type];
              const statusConfig = STATUS_CONFIG[apt.status];

              return (
                <div
                  key={apt.id}
                  className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-1 h-16 rounded-full flex-shrink-0"
                        style={{ backgroundColor: typeConfig.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {patient?.name || 'Unknown Patient'}
                          </span>
                          <span
                            className="px-2 py-0.5 text-xs rounded-full"
                            style={{ backgroundColor: statusConfig.color, color: 'white' }}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} |{' '}
                          {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="inline-flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" /> {provider?.name}
                          </span>
                          {room && (
                            <span className="inline-flex items-center gap-1 ml-3">
                              <Building className="w-3 h-3" /> {room.name}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 ml-3">
                            <ClipboardList className="w-3 h-3" /> {typeConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {apt.status === 'scheduled' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                          className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50"
                          title={t('tools.medicalScheduler.confirm', 'Confirm')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'checked-in')}
                          className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                          title={t('tools.medicalScheduler.checkIn', 'Check In')}
                        >
                          <User className="w-4 h-4" />
                        </button>
                      )}
                      {apt.status === 'checked-in' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'completed')}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                          title={t('tools.medicalScheduler.complete', 'Complete')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'no-show')}
                          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50"
                          title={t('tools.medicalScheduler.markNoShow', 'Mark No Show')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditAppointment(apt)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        title={t('tools.medicalScheduler.edit', 'Edit')}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(apt.id)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
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
    </div>
  );

  const renderWaitlist = () => (
    <div className="space-y-4">
      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {t('tools.medicalScheduler.patientsWaitingForAvailableAppointment', 'Patients waiting for available appointment slots')}
      </div>

      {waitlist.length === 0 ? (
        <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('tools.medicalScheduler.noPatientsOnWaitlist', 'No patients on waitlist')}
        </div>
      ) : (
        <div className="space-y-2">
          {waitlist.map((entry) => {
            const patient = patients.find((p) => p.id === entry.patientId);
            const provider = providers.find((p) => p.id === entry.providerId);
            const typeConfig = APPOINTMENT_TYPES[entry.preferredType];

            return (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {patient?.name || 'Unknown Patient'}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Prefers: {provider?.name} | {typeConfig.label} | {formatTime(entry.preferredTimeRange.start)} -{' '}
                      {formatTime(entry.preferredTimeRange.end)}
                    </div>
                    <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Added: {new Date(entry.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        entry.priority === 'urgent'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                          : entry.priority === 'high'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                          : entry.priority === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {entry.priority}
                    </span>
                    <button
                      onClick={() => {
                        setBookingForm((prev) => ({
                          ...prev,
                          patientId: entry.patientId,
                          providerId: entry.providerId,
                          type: entry.preferredType,
                        }));
                        setShowBookingModal(true);
                      }}
                      className="p-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                      title={t('tools.medicalScheduler.bookAppointment2', 'Book Appointment')}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveFromWaitlist(entry.id)}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                      title={t('tools.medicalScheduler.removeFromWaitlist', 'Remove from waitlist')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderProviders = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: provider.color }}
            >
              {provider.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{provider.name}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{provider.specialty}</div>
              <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {provider.email}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {provider.phone}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTime(provider.workingHours.start)} - {formatTime(provider.workingHours.end)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-4">
      <button
        onClick={() => {
          resetPatientForm();
          setEditingPatient(null);
          setShowPatientModal(true);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
      >
        <Plus className="w-4 h-4" /> Add Patient
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{patient.name}</div>
                <div className={`text-sm space-y-1 mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {patient.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {patient.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {patient.address}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBookingForm((prev) => ({ ...prev, patientId: patient.id }));
                    setShowBookingModal(true);
                  }}
                  className="p-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  title={t('tools.medicalScheduler.bookAppointment3', 'Book Appointment')}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingPatient(patient);
                    setPatientForm({
                      name: patient.name,
                      email: patient.email,
                      phone: patient.phone,
                      dateOfBirth: patient.dateOfBirth,
                      address: patient.address,
                      insuranceProvider: patient.insuranceProvider || '',
                      insuranceNumber: patient.insuranceNumber || '',
                    });
                    setShowPatientModal(true);
                  }}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  title={t('tools.medicalScheduler.edit2', 'Edit')}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookingModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {editingAppointment ? t('tools.medicalScheduler.editAppointment', 'Edit Appointment') : t('tools.medicalScheduler.bookNewAppointment', 'Book New Appointment')}
            </h3>
            <button
              onClick={() => {
                setShowBookingModal(false);
                setEditingAppointment(null);
                resetBookingForm();
              }}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Patient */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.medicalScheduler.patient', 'Patient *')}
            </label>
            <select
              value={bookingForm.patientId}
              onChange={(e) => setBookingForm((prev) => ({ ...prev, patientId: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            >
              <option value="">{t('tools.medicalScheduler.selectPatient', 'Select Patient')}</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Provider */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.medicalScheduler.provider', 'Provider *')}
            </label>
            <select
              value={bookingForm.providerId}
              onChange={(e) => setBookingForm((prev) => ({ ...prev, providerId: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            >
              <option value="">{t('tools.medicalScheduler.selectProvider', 'Select Provider')}</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} - {provider.specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.medicalScheduler.roomOptional', 'Room (Optional)')}
            </label>
            <select
              value={bookingForm.roomId}
              onChange={(e) => setBookingForm((prev) => ({ ...prev, roomId: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            >
              <option value="">{t('tools.medicalScheduler.noRoomAssignment', 'No Room Assignment')}</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.type}
                </option>
              ))}
            </select>
          </div>

          {/* Type & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.medicalScheduler.appointmentType', 'Appointment Type *')}
              </label>
              <select
                value={bookingForm.type}
                onChange={(e) => {
                  const type = e.target.value as AppointmentType;
                  setBookingForm((prev) => ({
                    ...prev,
                    type,
                    duration: APPOINTMENT_TYPES[type].defaultDuration,
                  }));
                }}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {Object.entries(APPOINTMENT_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label} ({config.defaultDuration} min)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.medicalScheduler.durationMinutes', 'Duration (minutes)')}
              </label>
              <input
                type="number"
                min={15}
                step={15}
                value={bookingForm.duration}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.medicalScheduler.date', 'Date *')}
              </label>
              <input
                type="date"
                value={bookingForm.date}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, date: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.medicalScheduler.startTime', 'Start Time *')}
              </label>
              <input
                type="time"
                value={bookingForm.startTime}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, startTime: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.medicalScheduler.recurrence', 'Recurrence')}
              </label>
              <select
                value={bookingForm.recurrence}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, recurrence: e.target.value as RecurrencePattern }))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="none">{t('tools.medicalScheduler.noRecurrence', 'No Recurrence')}</option>
                <option value="daily">{t('tools.medicalScheduler.daily', 'Daily')}</option>
                <option value="weekly">{t('tools.medicalScheduler.weekly', 'Weekly')}</option>
                <option value="biweekly">{t('tools.medicalScheduler.biWeekly', 'Bi-weekly')}</option>
                <option value="monthly">{t('tools.medicalScheduler.monthly', 'Monthly')}</option>
              </select>
            </div>
            {bookingForm.recurrence !== 'none' && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.medicalScheduler.endDate', 'End Date')}
                </label>
                <input
                  type="date"
                  value={bookingForm.recurrenceEndDate}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, recurrenceEndDate: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            )}
          </div>

          {/* Reminders */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.medicalScheduler.reminders', 'Reminders')}
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingForm.reminders.email}
                  onChange={(e) =>
                    setBookingForm((prev) => ({
                      ...prev,
                      reminders: { ...prev.reminders, email: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.medicalScheduler.email', 'Email')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingForm.reminders.sms}
                  onChange={(e) =>
                    setBookingForm((prev) => ({
                      ...prev,
                      reminders: { ...prev.reminders, sms: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.medicalScheduler.sms', 'SMS')}</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.medicalScheduler.notes', 'Notes')}
            </label>
            <textarea
              value={bookingForm.notes}
              onChange={(e) => setBookingForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              placeholder={t('tools.medicalScheduler.additionalNotesOrSpecialInstructions', 'Additional notes or special instructions...')}
            />
          </div>
        </div>

        <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
          <button
            onClick={() => {
              setShowBookingModal(false);
              setEditingAppointment(null);
              resetBookingForm();
            }}
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.medicalScheduler.cancel', 'Cancel')}
          </button>
          <button
            onClick={handleBookAppointment}
            disabled={!bookingForm.patientId || !bookingForm.providerId}
            className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingAppointment ? t('tools.medicalScheduler.updateAppointment', 'Update Appointment') : t('tools.medicalScheduler.bookAppointment', 'Book Appointment')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPatientModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {editingPatient ? t('tools.medicalScheduler.editPatient', 'Edit Patient') : t('tools.medicalScheduler.addNewPatient', 'Add New Patient')}
            </h3>
            <button
              onClick={() => {
                setShowPatientModal(false);
                setEditingPatient(null);
                resetPatientForm();
              }}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.medicalScheduler.fullName', 'Full Name *')}
            </label>
            <input
              type="text"
              value={patientForm.name}
              onChange={(e) => setPatientForm((prev) => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.medicalScheduler.email2', 'Email *')}
              </label>
              <input
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, email: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.medicalScheduler.phone', 'Phone *')}
              </label>
              <input
                type="tel"
                value={patientForm.phone}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, phone: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.medicalScheduler.dateOfBirth', 'Date of Birth *')}
            </label>
            <input
              type="date"
              value={patientForm.dateOfBirth}
              onChange={(e) => setPatientForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.medicalScheduler.address', 'Address')}
            </label>
            <input
              type="text"
              value={patientForm.address}
              onChange={(e) => setPatientForm((prev) => ({ ...prev, address: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.medicalScheduler.insuranceProvider', 'Insurance Provider')}
              </label>
              <input
                type="text"
                value={patientForm.insuranceProvider}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, insuranceProvider: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.medicalScheduler.insuranceNumber', 'Insurance Number')}
              </label>
              <input
                type="text"
                value={patientForm.insuranceNumber}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, insuranceNumber: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>
        </div>

        <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
          <button
            onClick={() => {
              setShowPatientModal(false);
              setEditingPatient(null);
              resetPatientForm();
            }}
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.medicalScheduler.cancel2', 'Cancel')}
          </button>
          <button
            onClick={handleSavePatient}
            disabled={!patientForm.name || !patientForm.email || !patientForm.phone || !patientForm.dateOfBirth}
            className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingPatient ? t('tools.medicalScheduler.updatePatient', 'Update Patient') : t('tools.medicalScheduler.addPatient', 'Add Patient')}
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0D9488] rounded-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.medicalScheduler.medicalScheduler', 'Medical Scheduler')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.medicalScheduler.manageAppointmentsProvidersAndPatients', 'Manage appointments, providers, and patients')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="medical-scheduler" toolName="Medical Scheduler" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'medical-appointments' })}
            onExportExcel={() => exportExcel({ filename: 'medical-appointments' })}
            onExportJSON={() => exportJSON({ filename: 'medical-appointments' })}
            onExportPDF={() => exportPDF({
              filename: 'medical-appointments',
              title: 'Medical Appointments',
              subtitle: `Total: ${appointments.length} appointments`,
            })}
            onPrint={() => print('Medical Appointments')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={theme}
          />

          <button
            onClick={() => {
              resetBookingForm();
              setEditingAppointment(null);
              setShowBookingModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
          >
            <Plus className="w-4 h-4" /> New Appointment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 mb-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} overflow-x-auto`}>
        {[
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'appointments', label: 'Appointments', icon: ClipboardList },
          { id: 'waitlist', label: 'Waitlist', icon: Users },
          { id: 'providers', label: 'Providers', icon: Stethoscope },
          { id: 'patients', label: 'Patients', icon: User },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0D9488] text-white'
                : theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-600'
                : 'text-gray-600 hover:bg-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'waitlist' && waitlist.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                {waitlist.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'calendar' && (
          <>
            {renderCalendarHeader()}
            {renderDailySummary()}
            <div className="mt-4">
              {calendarView === 'day' && renderDayView()}
              {calendarView === 'week' && renderWeekView()}
              {calendarView === 'month' && renderMonthView()}
            </div>
          </>
        )}

        {activeTab === 'appointments' && renderAppointmentsList()}
        {activeTab === 'waitlist' && renderWaitlist()}
        {activeTab === 'providers' && renderProviders()}
        {activeTab === 'patients' && renderPatients()}
      </div>

      {/* Modals */}
      {showBookingModal && renderBookingModal()}
      {showPatientModal && renderPatientModal()}
      <ConfirmDialog />

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default MedicalSchedulerTool;
