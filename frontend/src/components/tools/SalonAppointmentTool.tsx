'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  AlertCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Scissors,
  DollarSign,
  Bell,
  RefreshCw,
  CheckCircle,
  XCircle,
  UserCheck,
  CalendarDays,
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
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalonAppointmentToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  stylistId: string;
  stylistName: string;
  services: string[];
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

// Constants
const STYLISTS = [
  { id: 'stylist-1', name: 'Sarah Johnson', specialties: ['Hair Coloring', 'Highlights'] },
  { id: 'stylist-2', name: 'Mike Chen', specialties: ['Haircuts', 'Beard Trimming'] },
  { id: 'stylist-3', name: 'Emma Davis', specialties: ['Nails', 'Spa Treatments'] },
  { id: 'stylist-4', name: 'Lisa Park', specialties: ['Skincare', 'Makeup'] },
];

const SERVICES = [
  { id: 'haircut', name: 'Haircut', duration: 30, price: 35 },
  { id: 'coloring', name: 'Hair Coloring', duration: 90, price: 85 },
  { id: 'highlights', name: 'Highlights', duration: 120, price: 120 },
  { id: 'blowout', name: 'Blowout', duration: 45, price: 45 },
  { id: 'manicure', name: 'Manicure', duration: 30, price: 25 },
  { id: 'pedicure', name: 'Pedicure', duration: 45, price: 40 },
  { id: 'facial', name: 'Facial', duration: 60, price: 75 },
  { id: 'massage', name: 'Massage', duration: 60, price: 90 },
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30',
];

// Column configuration for exports
const APPOINTMENT_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client Name', type: 'string' },
  { key: 'clientPhone', header: 'Phone', type: 'string' },
  { key: 'clientEmail', header: 'Email', type: 'string' },
  { key: 'stylistName', header: 'Stylist', type: 'string' },
  { key: 'services', header: 'Services', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const addMinutesToTime = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
};

const getStatusColor = (status: Appointment['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'no-show': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Sample data
const sampleAppointments: Appointment[] = [
  {
    id: generateId(),
    clientName: 'Emily Johnson',
    clientPhone: '(555) 123-4567',
    clientEmail: 'emily@example.com',
    stylistId: 'stylist-1',
    stylistName: 'Sarah Johnson',
    services: ['Hair Coloring', 'Blowout'],
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:15',
    duration: 135,
    totalPrice: 130,
    status: 'confirmed',
    notes: 'Prefers warm tones',
    reminderSent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    clientName: 'Michael Brown',
    clientPhone: '(555) 234-5678',
    clientEmail: 'michael@example.com',
    stylistId: 'stylist-2',
    stylistName: 'Mike Chen',
    services: ['Haircut'],
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '14:30',
    duration: 30,
    totalPrice: 35,
    status: 'scheduled',
    notes: '',
    reminderSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Main Component
export const SalonAppointmentTool: React.FC<SalonAppointmentToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hook for backend sync
  const {
    data: appointments,
    addItem: addAppointment,
    updateItem: updateAppointment,
    deleteItem: deleteAppointment,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Appointment>('salon-appointments', sampleAppointments, APPOINTMENT_COLUMNS);

  // Local UI state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'list'>('day');
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStylist, setFilterStylist] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    stylistId: '',
    services: [] as string[],
    date: selectedDate,
    startTime: '09:00',
    notes: '',
  });

  // Calculate end time and total price based on selected services
  const selectedServicesData = useMemo(() => {
    const services = SERVICES.filter(s => formData.services.includes(s.name));
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
    const endTime = addMinutesToTime(formData.startTime, totalDuration);
    return { totalDuration, totalPrice, endTime };
  }, [formData.services, formData.startTime]);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.stylistName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
      const matchesStylist = filterStylist === 'all' || apt.stylistId === filterStylist;
      const matchesDate = viewMode === 'list' || apt.date === selectedDate;
      return matchesSearch && matchesStatus && matchesStylist && matchesDate;
    });
  }, [appointments, searchTerm, filterStatus, filterStylist, selectedDate, viewMode]);

  // Today's stats
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayApts = appointments.filter(apt => apt.date === today);
    return {
      total: todayApts.length,
      confirmed: todayApts.filter(apt => apt.status === 'confirmed').length,
      completed: todayApts.filter(apt => apt.status === 'completed').length,
      revenue: todayApts.filter(apt => apt.status === 'completed').reduce((sum, apt) => sum + apt.totalPrice, 0),
    };
  }, [appointments]);

  // Handle form submission
  const handleSubmit = () => {
    const stylist = STYLISTS.find(s => s.id === formData.stylistId);
    if (!stylist || formData.services.length === 0) return;

    const now = new Date().toISOString();
    const appointmentData: Appointment = {
      id: editingAppointment?.id || generateId(),
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientEmail: formData.clientEmail,
      stylistId: formData.stylistId,
      stylistName: stylist.name,
      services: formData.services,
      date: formData.date,
      startTime: formData.startTime,
      endTime: selectedServicesData.endTime,
      duration: selectedServicesData.totalDuration,
      totalPrice: selectedServicesData.totalPrice,
      status: 'scheduled',
      notes: formData.notes,
      reminderSent: false,
      createdAt: editingAppointment?.createdAt || now,
      updatedAt: now,
    };

    if (editingAppointment) {
      updateAppointment(appointmentData);
    } else {
      addAppointment(appointmentData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      stylistId: '',
      services: [],
      date: selectedDate,
      startTime: '09:00',
      notes: '',
    });
    setShowForm(false);
    setEditingAppointment(null);
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData({
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      clientEmail: appointment.clientEmail,
      stylistId: appointment.stylistId,
      services: appointment.services,
      date: appointment.date,
      startTime: appointment.startTime,
      notes: appointment.notes,
    });
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleStatusChange = (appointment: Appointment, newStatus: Appointment['status']) => {
    updateAppointment({ ...appointment, status: newStatus, updatedAt: new Date().toISOString() });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const exportData = filteredAppointments.map(apt => ({
      ...apt,
      services: apt.services.join(', '),
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, APPOINTMENT_COLUMNS, 'salon-appointments');
        break;
      case 'excel':
        exportToExcel(exportData, APPOINTMENT_COLUMNS, 'salon-appointments');
        break;
      case 'json':
        exportToJSON(exportData, 'salon-appointments');
        break;
      case 'pdf':
        exportToPDF(exportData, APPOINTMENT_COLUMNS, 'Salon Appointments');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              {t('tools.salonAppointment.salonAppointments', 'Salon Appointments')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.salonAppointment.manageAndScheduleSalonAppointments', 'Manage and schedule salon appointments')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="salon-appointment" toolName="Salon Appointment" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown onExport={handleExport} />
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.salonAppointment.newAppointment', 'New Appointment')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.salonAppointment.todaySAppointments', 'Today\'s Appointments')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{todayStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.salonAppointment.confirmed', 'Confirmed')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{todayStats.confirmed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.salonAppointment.completed', 'Completed')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{todayStats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.salonAppointment.todaySRevenue', 'Today\'s Revenue')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(todayStats.revenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  onClick={() => navigateDate('next')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.salonAppointment.searchClientsOrStylists', 'Search clients or stylists...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Filters */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">{t('tools.salonAppointment.allStatus', 'All Status')}</option>
                <option value="scheduled">{t('tools.salonAppointment.scheduled', 'Scheduled')}</option>
                <option value="confirmed">{t('tools.salonAppointment.confirmed2', 'Confirmed')}</option>
                <option value="in-progress">{t('tools.salonAppointment.inProgress', 'In Progress')}</option>
                <option value="completed">{t('tools.salonAppointment.completed2', 'Completed')}</option>
                <option value="cancelled">{t('tools.salonAppointment.cancelled', 'Cancelled')}</option>
                <option value="no-show">{t('tools.salonAppointment.noShow', 'No Show')}</option>
              </select>

              <select
                value={filterStylist}
                onChange={(e) => setFilterStylist(e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">{t('tools.salonAppointment.allStylists', 'All Stylists')}</option>
                {STYLISTS.map(stylist => (
                  <option key={stylist.id} value={stylist.id}>{stylist.name}</option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex items-center border rounded-lg dark:border-gray-600">
                {(['day', 'list'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-2 text-sm capitalize ${
                      viewMode === mode
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } ${mode === 'day' ? 'rounded-l-lg' : 'rounded-r-lg'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {viewMode === 'list' ? 'All Appointments' : `Appointments for ${formatDate(selectedDate)}`}
              </span>
              <span className="text-sm font-normal text-gray-500">
                {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.salonAppointment.noAppointmentsFound', 'No appointments found')}</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-purple-600 hover:text-purple-700"
                >
                  {t('tools.salonAppointment.scheduleANewAppointment', 'Schedule a new appointment')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {formatTime(appointment.startTime)}
                          </span>
                          <span className="text-xs text-gray-500">{appointment.duration} min</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{appointment.clientName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            with {appointment.stylistName}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {appointment.services.map(service => (
                              <span
                                key={service}
                                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                          {viewMode === 'list' && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(appointment.date)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status.replace('-', ' ')}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(appointment.totalPrice)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(appointment)}
                            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {appointment.status === 'scheduled' && (
                            <button
                              onClick={() => handleStatusChange(appointment, 'confirmed')}
                              className="p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              title={t('tools.salonAppointment.confirm', 'Confirm')}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(appointment, 'in-progress')}
                              className="p-2 text-gray-500 hover:text-yellow-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              title={t('tools.salonAppointment.start', 'Start')}
                            >
                              <Scissors className="w-4 h-4" />
                            </button>
                          )}
                          {appointment.status === 'in-progress' && (
                            <button
                              onClick={() => handleStatusChange(appointment, 'completed')}
                              className="p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              title={t('tools.salonAppointment.complete', 'Complete')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteAppointment(appointment.id)}
                            className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {appointment.notes && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 pl-[76px]">
                        Note: {appointment.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingAppointment ? t('tools.salonAppointment.editAppointment', 'Edit Appointment') : t('tools.salonAppointment.newAppointment2', 'New Appointment')}</span>
                  <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.salonAppointment.clientName', 'Client Name *')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={t('tools.salonAppointment.enterClientName', 'Enter client name')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.salonAppointment.phone', 'Phone')}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.salonAppointment.email', 'Email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={t('tools.salonAppointment.emailExampleCom', 'email@example.com')}
                      />
                    </div>
                  </div>
                </div>

                {/* Stylist Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.salonAppointment.stylist', 'Stylist *')}
                  </label>
                  <select
                    value={formData.stylistId}
                    onChange={(e) => setFormData({ ...formData, stylistId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{t('tools.salonAppointment.selectAStylist', 'Select a stylist')}</option>
                    {STYLISTS.map(stylist => (
                      <option key={stylist.id} value={stylist.id}>
                        {stylist.name} - {stylist.specialties.join(', ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Services Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.salonAppointment.services', 'Services *')}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SERVICES.map(service => (
                      <label
                        key={service.id}
                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                          formData.services.includes(service.name)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, services: [...formData.services, service.name] });
                            } else {
                              setFormData({ ...formData, services: formData.services.filter(s => s !== service.name) });
                            }
                          }}
                          className="hidden"
                        />
                        <div className="text-xs">
                          <p className="font-medium">{service.name}</p>
                          <p className="text-gray-500">{service.duration}min - {formatCurrency(service.price)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.salonAppointment.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.salonAppointment.startTime', 'Start Time *')}
                    </label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>{formatTime(time)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Summary */}
                {formData.services.length > 0 && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.salonAppointment.duration', 'Duration')}</p>
                        <p className="font-medium">{selectedServicesData.totalDuration} minutes</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.salonAppointment.endTime', 'End Time')}</p>
                        <p className="font-medium">{formatTime(selectedServicesData.endTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.salonAppointment.total', 'Total')}</p>
                        <p className="font-bold text-purple-600">{formatCurrency(selectedServicesData.totalPrice)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.salonAppointment.notes', 'Notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                    placeholder={t('tools.salonAppointment.anySpecialRequestsOrNotes', 'Any special requests or notes...')}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('tools.salonAppointment.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.clientName || !formData.stylistId || formData.services.length === 0}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingAppointment ? t('tools.salonAppointment.updateAppointment', 'Update Appointment') : t('tools.salonAppointment.scheduleAppointment', 'Schedule Appointment')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonAppointmentTool;
