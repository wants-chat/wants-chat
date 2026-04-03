'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Palette,
  Ruler,
  FileText,
  Download,
  Star,
  RefreshCw,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
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

interface AppointmentTattooToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
type ServiceType = 'tattoo' | 'piercing' | 'touch_up' | 'consultation' | 'cover_up' | 'removal';

interface TattooAppointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  artistId: string;
  artistName: string;
  serviceType: ServiceType;
  designDescription: string;
  bodyPlacement: string;
  estimatedSize: string;
  estimatedHours: number;
  hourlyRate: number;
  depositAmount: number;
  depositPaid: boolean;
  totalEstimate: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string;
  referralSource: string;
  isFirstTime: boolean;
  consentFormSigned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Artist {
  id: string;
  name: string;
  specialty: string;
  hourlyRate: number;
  available: boolean;
}

// Constants
const SERVICE_TYPES: { type: ServiceType; label: string; icon: React.ReactNode }[] = [
  { type: 'tattoo', label: 'New Tattoo', icon: <Palette className="w-4 h-4" /> },
  { type: 'piercing', label: 'Piercing', icon: <Star className="w-4 h-4" /> },
  { type: 'touch_up', label: 'Touch Up', icon: <Edit className="w-4 h-4" /> },
  { type: 'consultation', label: 'Consultation', icon: <FileText className="w-4 h-4" /> },
  { type: 'cover_up', label: 'Cover Up', icon: <Palette className="w-4 h-4" /> },
  { type: 'removal', label: 'Removal', icon: <XCircle className="w-4 h-4" /> },
];

const STATUS_OPTIONS: { status: AppointmentStatus; label: string; color: string }[] = [
  { status: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { status: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { status: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  { status: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  { status: 'no_show', label: 'No Show', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
];

const BODY_PLACEMENTS = [
  'Arm - Upper', 'Arm - Lower', 'Forearm', 'Wrist', 'Hand', 'Finger',
  'Shoulder', 'Back - Upper', 'Back - Lower', 'Chest', 'Ribs', 'Stomach',
  'Hip', 'Thigh', 'Calf', 'Ankle', 'Foot', 'Neck', 'Behind Ear', 'Face', 'Other',
];

const DEFAULT_ARTISTS: Artist[] = [
  { id: 'artist-1', name: 'Jake Morrison', specialty: 'Traditional/Neo-Traditional', hourlyRate: 150, available: true },
  { id: 'artist-2', name: 'Maya Chen', specialty: 'Japanese/Blackwork', hourlyRate: 175, available: true },
  { id: 'artist-3', name: 'Alex Rivera', specialty: 'Realism/Portraits', hourlyRate: 200, available: true },
  { id: 'artist-4', name: 'Sam Williams', specialty: 'Geometric/Dotwork', hourlyRate: 160, available: true },
];

// Column configuration for exports
const APPOINTMENT_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client Name', type: 'string' },
  { key: 'clientPhone', header: 'Phone', type: 'string' },
  { key: 'clientEmail', header: 'Email', type: 'string' },
  { key: 'artistName', header: 'Artist', type: 'string' },
  { key: 'serviceType', header: 'Service', type: 'string' },
  { key: 'bodyPlacement', header: 'Placement', type: 'string' },
  { key: 'appointmentDate', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'estimatedHours', header: 'Est. Hours', type: 'number' },
  { key: 'totalEstimate', header: 'Total Estimate', type: 'currency' },
  { key: 'depositAmount', header: 'Deposit', type: 'currency' },
  { key: 'depositPaid', header: 'Deposit Paid', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'consentFormSigned', header: 'Consent Signed', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Main Component
export const AppointmentTattooTool: React.FC<AppointmentTattooToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
  } = useToolData<TattooAppointment>('tattoo-appointments', [], APPOINTMENT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'add'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterArtist, setFilterArtist] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<TattooAppointment | null>(null);
  const [artists] = useState<Artist[]>(DEFAULT_ARTISTS);

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState<Partial<TattooAppointment>>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    artistId: '',
    artistName: '',
    serviceType: 'tattoo',
    designDescription: '',
    bodyPlacement: '',
    estimatedSize: '',
    estimatedHours: 2,
    hourlyRate: 150,
    depositAmount: 100,
    depositPaid: false,
    totalEstimate: 300,
    appointmentDate: selectedDate,
    startTime: '10:00',
    endTime: '12:00',
    status: 'scheduled',
    notes: '',
    referralSource: '',
    isFirstTime: true,
    consentFormSigned: false,
  });

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch =
        apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.designDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
      const matchesArtist = filterArtist === 'all' || apt.artistId === filterArtist;
      return matchesSearch && matchesStatus && matchesArtist;
    });
  }, [appointments, searchTerm, filterStatus, filterArtist]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.appointmentDate === today);
    const pendingDeposits = appointments.filter(a => !a.depositPaid && a.status !== 'cancelled').length;
    const totalRevenue = appointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + a.totalEstimate, 0);
    const unsignedConsent = appointments.filter(a => !a.consentFormSigned && a.status !== 'cancelled').length;

    return {
      todayCount: todayAppointments.length,
      pendingDeposits,
      totalRevenue,
      unsignedConsent,
    };
  }, [appointments]);

  // Handle artist selection
  const handleArtistChange = (artistId: string) => {
    const artist = artists.find(a => a.id === artistId);
    if (artist) {
      setNewAppointment(prev => ({
        ...prev,
        artistId,
        artistName: artist.name,
        hourlyRate: artist.hourlyRate,
        totalEstimate: (prev.estimatedHours || 2) * artist.hourlyRate,
      }));
    }
  };

  // Handle hours change
  const handleHoursChange = (hours: number) => {
    setNewAppointment(prev => ({
      ...prev,
      estimatedHours: hours,
      totalEstimate: hours * (prev.hourlyRate || 150),
    }));
  };

  // Save appointment
  const handleSaveAppointment = async () => {
    if (!newAppointment.clientName || !newAppointment.artistId || !newAppointment.appointmentDate) {
      return;
    }

    const now = new Date().toISOString();

    if (editingAppointment) {
      const updated: TattooAppointment = {
        ...editingAppointment,
        ...newAppointment as TattooAppointment,
        updatedAt: now,
      };
      await updateAppointmentBackend(updated);
      setEditingAppointment(null);
    } else {
      const appointment: TattooAppointment = {
        id: generateId(),
        ...newAppointment as TattooAppointment,
        createdAt: now,
        updatedAt: now,
      };
      await addAppointmentToBackend(appointment);
    }

    setShowForm(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setNewAppointment({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      artistId: '',
      artistName: '',
      serviceType: 'tattoo',
      designDescription: '',
      bodyPlacement: '',
      estimatedSize: '',
      estimatedHours: 2,
      hourlyRate: 150,
      depositAmount: 100,
      depositPaid: false,
      totalEstimate: 300,
      appointmentDate: selectedDate,
      startTime: '10:00',
      endTime: '12:00',
      status: 'scheduled',
      notes: '',
      referralSource: '',
      isFirstTime: true,
      consentFormSigned: false,
    });
  };

  // Edit appointment
  const handleEditAppointment = (appointment: TattooAppointment) => {
    setEditingAppointment(appointment);
    setNewAppointment(appointment);
    setShowForm(true);
  };

  // Delete appointment
  const handleDeleteAppointment = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Appointment',
      message: 'Are you sure you want to delete this appointment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteAppointmentBackend(id);
    }
  };

  // Update appointment status
  const handleStatusChange = async (appointment: TattooAppointment, newStatus: AppointmentStatus) => {
    const updated = { ...appointment, status: newStatus, updatedAt: new Date().toISOString() };
    await updateAppointmentBackend(updated);
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const exportData = filteredAppointments.map(apt => ({
      ...apt,
      depositPaid: apt.depositPaid ? 'Yes' : 'No',
      consentFormSigned: apt.consentFormSigned ? 'Yes' : 'No',
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, APPOINTMENT_COLUMNS, 'tattoo-appointments');
        break;
      case 'excel':
        exportToExcel(exportData, APPOINTMENT_COLUMNS, 'tattoo-appointments');
        break;
      case 'json':
        exportToJSON(exportData, 'tattoo-appointments');
        break;
      case 'pdf':
        exportToPDF(exportData, APPOINTMENT_COLUMNS, 'Tattoo Studio Appointments');
        break;
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusOption = STATUS_OPTIONS.find(s => s.status === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusOption?.color}`}>
        {statusOption?.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="w-6 h-6 text-purple-600" />
              {t('tools.appointmentTattoo.tattooAppointmentManager', 'Tattoo Appointment Manager')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.appointmentTattoo.scheduleAndManageTattooStudio', 'Schedule and manage tattoo studio appointments')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="appointment-tattoo" toolName="Appointment Tattoo" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
            />
            <ExportDropdown onExport={handleExport} />
            <button
              onClick={() => { setShowForm(true); setEditingAppointment(null); resetForm(); }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.appointmentTattoo.newAppointment', 'New Appointment')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.appointmentTattoo.todaySAppointments', 'Today\'s Appointments')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayCount}</p>
                </div>
                <Calendar className="w-10 h-10 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.appointmentTattoo.pendingDeposits', 'Pending Deposits')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingDeposits}</p>
                </div>
                <DollarSign className="w-10 h-10 text-yellow-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.appointmentTattoo.totalRevenue', 'Total Revenue')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.appointmentTattoo.unsignedConsents', 'Unsigned Consents')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unsignedConsent}</p>
                </div>
                <FileText className="w-10 h-10 text-red-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.appointmentTattoo.searchClientsArtistsOrDesigns', 'Search clients, artists, or designs...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{t('tools.appointmentTattoo.allStatus', 'All Status')}</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.status} value={s.status}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterArtist}
                onChange={(e) => setFilterArtist(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{t('tools.appointmentTattoo.allArtists', 'All Artists')}</option>
                {artists.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tools.appointmentTattoo.client', 'Client')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tools.appointmentTattoo.artist', 'Artist')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tools.appointmentTattoo.service', 'Service')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tools.appointmentTattoo.dateTime', 'Date/Time')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tools.appointmentTattoo.estimate', 'Estimate')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tools.appointmentTattoo.status', 'Status')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tools.appointmentTattoo.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        {t('tools.appointmentTattoo.noAppointmentsFoundCreateYour', 'No appointments found. Create your first appointment!')}
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map(apt => (
                      <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{apt.clientName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{apt.clientPhone}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white">{apt.artistName}</td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-gray-900 dark:text-white capitalize">{apt.serviceType.replace('_', ' ')}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{apt.bodyPlacement}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-gray-900 dark:text-white">{formatDate(apt.appointmentDate)}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{formatTime(apt.startTime)}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-gray-900 dark:text-white">{formatCurrency(apt.totalEstimate)}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {apt.depositPaid ? (
                                <span className="text-green-600">{t('tools.appointmentTattoo.depositPaid', 'Deposit paid')}</span>
                              ) : (
                                <span className="text-yellow-600">{t('tools.appointmentTattoo.depositPending', 'Deposit pending')}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={apt.status}
                            onChange={(e) => handleStatusChange(apt, e.target.value as AppointmentStatus)}
                            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s.status} value={s.status}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditAppointment(apt)}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                              title={t('tools.appointmentTattoo.edit', 'Edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(apt.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingAppointment ? t('tools.appointmentTattoo.editAppointment', 'Edit Appointment') : t('tools.appointmentTattoo.newAppointment2', 'New Appointment')}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Client Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.clientName', 'Client Name *')}</label>
                    <input
                      type="text"
                      value={newAppointment.clientName || ''}
                      onChange={(e) => setNewAppointment({ ...newAppointment, clientName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.appointmentTattoo.fullName', 'Full name')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={newAppointment.clientPhone || ''}
                      onChange={(e) => setNewAppointment({ ...newAppointment, clientPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.email', 'Email')}</label>
                    <input
                      type="email"
                      value={newAppointment.clientEmail || ''}
                      onChange={(e) => setNewAppointment({ ...newAppointment, clientEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.appointmentTattoo.emailExampleCom', 'email@example.com')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.artist2', 'Artist *')}</label>
                    <select
                      value={newAppointment.artistId || ''}
                      onChange={(e) => handleArtistChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">{t('tools.appointmentTattoo.selectArtist', 'Select artist...')}</option>
                      {artists.filter(a => a.available).map(a => (
                        <option key={a.id} value={a.id}>{a.name} - {a.specialty} ({formatCurrency(a.hourlyRate)}/hr)</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.serviceType', 'Service Type')}</label>
                    <select
                      value={newAppointment.serviceType || 'tattoo'}
                      onChange={(e) => setNewAppointment({ ...newAppointment, serviceType: e.target.value as ServiceType })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {SERVICE_TYPES.map(s => (
                        <option key={s.type} value={s.type}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.bodyPlacement', 'Body Placement')}</label>
                    <select
                      value={newAppointment.bodyPlacement || ''}
                      onChange={(e) => setNewAppointment({ ...newAppointment, bodyPlacement: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">{t('tools.appointmentTattoo.selectPlacement', 'Select placement...')}</option>
                      {BODY_PLACEMENTS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Design Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.designDescription', 'Design Description')}</label>
                  <textarea
                    value={newAppointment.designDescription || ''}
                    onChange={(e) => setNewAppointment({ ...newAppointment, designDescription: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.appointmentTattoo.describeTheTattooDesign', 'Describe the tattoo design...')}
                  />
                </div>

                {/* Date/Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.date', 'Date *')}</label>
                    <input
                      type="date"
                      value={newAppointment.appointmentDate || ''}
                      onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.startTime', 'Start Time')}</label>
                    <input
                      type="time"
                      value={newAppointment.startTime || '10:00'}
                      onChange={(e) => setNewAppointment({ ...newAppointment, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.estimatedHours', 'Estimated Hours')}</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={newAppointment.estimatedHours || 2}
                      onChange={(e) => handleHoursChange(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.totalEstimate', 'Total Estimate')}</label>
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium">
                      {formatCurrency(newAppointment.totalEstimate || 0)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.depositAmount', 'Deposit Amount')}</label>
                    <input
                      type="number"
                      value={newAppointment.depositAmount || 100}
                      onChange={(e) => setNewAppointment({ ...newAppointment, depositAmount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAppointment.depositPaid || false}
                        onChange={(e) => setNewAppointment({ ...newAppointment, depositPaid: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.appointmentTattoo.depositPaid2', 'Deposit Paid')}</span>
                    </label>
                  </div>
                </div>

                {/* Consent & First Time */}
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAppointment.isFirstTime || false}
                      onChange={(e) => setNewAppointment({ ...newAppointment, isFirstTime: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.appointmentTattoo.firstTimeClient', 'First Time Client')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAppointment.consentFormSigned || false}
                      onChange={(e) => setNewAppointment({ ...newAppointment, consentFormSigned: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.appointmentTattoo.consentFormSigned', 'Consent Form Signed')}</span>
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.appointmentTattoo.notes', 'Notes')}</label>
                  <textarea
                    value={newAppointment.notes || ''}
                    onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.appointmentTattoo.additionalNotes', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => { setShowForm(false); setEditingAppointment(null); resetForm(); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t('tools.appointmentTattoo.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveAppointment}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingAppointment ? t('tools.appointmentTattoo.updateAppointment', 'Update Appointment') : t('tools.appointmentTattoo.createAppointment', 'Create Appointment')}
                </button>
              </div>
            </div>
          </div>
        )}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default AppointmentTattooTool;
