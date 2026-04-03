'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
} from '../../lib/toolDataUtils';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Wrench,
  Plus,
  Trash2,
  Save,
  Edit3,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Navigation,
  Truck,
  Timer,
  Award,
  Sparkles,
  Filter,
  Search,
  MoreVertical,
  Mail,
  Star,
  Users,
  Settings,
} from 'lucide-react';

// Types
interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  certifications: string[];
  serviceArea: string;
  maxJobsPerDay: number;
  color: string;
  isActive: boolean;
  rating: number;
  completedJobs: number;
  createdAt: string;
}

interface Appointment {
  id: string;
  technicianId: string;
  technicianName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  applianceType: string;
  brand: string;
  issueDescription: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'en-route' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  estimatedTravel: number;
  createdAt: string;
  updatedAt: string;
}

interface TimeOff {
  id: string;
  technicianId: string;
  startDate: string;
  endDate: string;
  reason: string;
  approved: boolean;
}

// Constants
const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const SPECIALTIES = [
  'Refrigeration',
  'HVAC',
  'Washers/Dryers',
  'Dishwashers',
  'Ovens/Ranges',
  'Microwaves',
  'Ice Makers',
  'Water Heaters',
  'Garbage Disposals',
  'General Appliances',
  'Electronics/Control Boards',
];

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'en-route', label: 'En Route', color: 'purple' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'no-show', label: 'No Show', color: 'gray' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const TECH_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

const APPLIANCE_TYPES = [
  'Refrigerator',
  'Washing Machine',
  'Dryer',
  'Dishwasher',
  'Oven/Range',
  'Microwave',
  'Air Conditioner',
  'Freezer',
  'Ice Maker',
  'Water Heater',
  'HVAC System',
  'Other',
];

// Column configurations
const TECH_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'serviceArea', header: 'Service Area', type: 'string' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'completedJobs', header: 'Completed Jobs', type: 'number' },
  { key: 'createdAt', header: 'Joined', type: 'date' },
];

const APPT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Time', type: 'string' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'customerAddress', header: 'Address', type: 'string' },
  { key: 'applianceType', header: 'Appliance', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const createEmptyTechnician = (): Technician => ({
  id: generateId(),
  name: '',
  email: '',
  phone: '',
  specialties: [],
  certifications: [],
  serviceArea: '',
  maxJobsPerDay: 6,
  color: TECH_COLORS[Math.floor(Math.random() * TECH_COLORS.length)],
  isActive: true,
  rating: 5.0,
  completedJobs: 0,
  createdAt: new Date().toISOString(),
});

const createEmptyAppointment = (): Appointment => ({
  id: generateId(),
  technicianId: '',
  technicianName: '',
  customerId: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerAddress: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '10:00',
  duration: 60,
  applianceType: '',
  brand: '',
  issueDescription: '',
  priority: 'medium',
  status: 'scheduled',
  notes: '',
  estimatedTravel: 15,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

interface TechScheduleApplianceToolProps {
  uiConfig?: UIConfig;
}

export const TechScheduleApplianceTool = ({ uiConfig }: TechScheduleApplianceToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for technicians
  const {
    data: technicians,
    addItem: addTech,
    updateItem: updateTech,
    deleteItem: deleteTech,
    isSaving: techSaving,
    isSynced: techSynced,
    lastSaved: techLastSaved,
    syncError: techSyncError,
    forceSync: forceTechSync,
  } = useToolData<Technician>('appliance-technicians', [], TECH_COLUMNS);

  // Use the useToolData hook for appointments
  const {
    data: appointments,
    addItem: addAppt,
    updateItem: updateAppt,
    deleteItem: deleteAppt,
    isSaving: apptSaving,
    isSynced: apptSynced,
    lastSaved: apptLastSaved,
    syncError: apptSyncError,
    forceSync: forceApptSync,
  } = useToolData<Appointment>('appliance-appointments', [], APPT_COLUMNS);

  const [activeTab, setActiveTab] = useState<'calendar' | 'technicians' | 'add-appointment' | 'edit-appointment' | 'add-tech'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedTechFilter, setSelectedTechFilter] = useState<string>('all');
  const [currentAppointment, setCurrentAppointment] = useState<Appointment>(createEmptyAppointment());
  const [currentTech, setCurrentTech] = useState<Technician>(createEmptyTechnician());
  const [showTechForm, setShowTechForm] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        customerName?: string;
        customerPhone?: string;
        customerAddress?: string;
        applianceType?: string;
        date?: string;
      };
      if (params.customerName || params.applianceType || params.date) {
        const newAppt = createEmptyAppointment();
        if (params.customerName) newAppt.customerName = params.customerName;
        if (params.customerPhone) newAppt.customerPhone = params.customerPhone;
        if (params.customerAddress) newAppt.customerAddress = params.customerAddress;
        if (params.applianceType) newAppt.applianceType = params.applianceType;
        if (params.date) newAppt.date = params.date;
        setCurrentAppointment(newAppt);
        setActiveTab('add-appointment');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isPrefilled]);

  // Get appointments for current day/week
  const filteredAppointments = useMemo(() => {
    const dateStr = currentDate.toISOString().split('T')[0];
    let filtered = appointments;

    if (viewMode === 'day') {
      filtered = filtered.filter((a) => a.date === dateStr);
    } else {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      filtered = filtered.filter((a) => {
        const apptDate = new Date(a.date);
        return apptDate >= weekStart && apptDate <= weekEnd;
      });
    }

    if (selectedTechFilter !== 'all') {
      filtered = filtered.filter((a) => a.technicianId === selectedTechFilter);
    }

    return filtered;
  }, [appointments, currentDate, viewMode, selectedTechFilter]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter((a) => a.date === today);
    const scheduled = todayAppts.filter((a) => a.status === 'scheduled').length;
    const inProgress = todayAppts.filter((a) => ['en-route', 'in-progress'].includes(a.status)).length;
    const completed = todayAppts.filter((a) => a.status === 'completed').length;
    const activeTechs = technicians.filter((t) => t.isActive).length;
    return { todayTotal: todayAppts.length, scheduled, inProgress, completed, activeTechs };
  }, [appointments, technicians]);

  // Navigation handlers
  const goToToday = () => setCurrentDate(new Date());
  const goToPrev = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - (viewMode === 'week' ? 7 : 1));
    setCurrentDate(newDate);
  };
  const goToNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (viewMode === 'week' ? 7 : 1));
    setCurrentDate(newDate);
  };

  // Handlers
  const handleSaveAppointment = () => {
    const tech = technicians.find((t) => t.id === currentAppointment.technicianId);
    const updatedAppt = {
      ...currentAppointment,
      technicianName: tech?.name || '',
      updatedAt: new Date().toISOString(),
    };

    const existing = appointments.find((a) => a.id === currentAppointment.id);
    if (existing) {
      updateAppt(currentAppointment.id, updatedAppt);
    } else {
      addAppt(updatedAppt);
    }

    setCurrentAppointment(createEmptyAppointment());
    setActiveTab('calendar');
  };

  const handleEditAppointment = (appt: Appointment) => {
    setCurrentAppointment(appt);
    setActiveTab('edit-appointment');
  };

  const handleDeleteAppointment = async (apptId: string) => {
    const confirmed = await confirm({
      title: 'Delete Appointment',
      message: 'Are you sure you want to delete this appointment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteAppt(apptId);
    }
  };

  const handleUpdateStatus = (apptId: string, status: Appointment['status']) => {
    const appt = appointments.find((a) => a.id === apptId);
    if (appt) {
      updateAppt(apptId, { ...appt, status, updatedAt: new Date().toISOString() });
      if (status === 'completed') {
        const tech = technicians.find((t) => t.id === appt.technicianId);
        if (tech) {
          updateTech(tech.id, { ...tech, completedJobs: tech.completedJobs + 1 });
        }
      }
    }
  };

  const handleSaveTechnician = () => {
    const existing = technicians.find((t) => t.id === currentTech.id);
    if (existing) {
      updateTech(currentTech.id, currentTech);
    } else {
      addTech(currentTech);
    }
    setCurrentTech(createEmptyTechnician());
    setShowTechForm(false);
  };

  const handleEditTechnician = (tech: Technician) => {
    setCurrentTech(tech);
    setShowTechForm(true);
  };

  const handleDeleteTechnician = async (techId: string) => {
    const confirmed = await confirm({
      title: 'Delete Technician',
      message: 'Are you sure you want to delete this technician?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteTech(techId);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    const specs = currentTech.specialties.includes(specialty)
      ? currentTech.specialties.filter((s) => s !== specialty)
      : [...currentTech.specialties, specialty];
    setCurrentTech({ ...currentTech, specialties: specs });
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      scheduled: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200',
      'en-route': isDark ? 'bg-purple-900/30 text-purple-400 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200',
      'in-progress': isDark ? 'bg-orange-900/30 text-orange-400 border-orange-700' : 'bg-orange-100 text-orange-800 border-orange-200',
      completed: isDark ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-800 border-green-200',
      cancelled: isDark ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-800 border-red-200',
      'no-show': isDark ? 'bg-gray-900/30 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colorMap[status] || colorMap.scheduled;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.techScheduleAppliance.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.techScheduleAppliance.technicianScheduling', 'Technician Scheduling')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.techScheduleAppliance.scheduleAndManageTechnicianAppointments', 'Schedule and manage technician appointments')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WidgetEmbedButton toolSlug="tech-schedule-appliance" toolName="Tech Schedule Appliance" />

                <SyncStatus
                  isSynced={techSynced && apptSynced}
                  isSaving={techSaving || apptSaving}
                  lastSaved={techLastSaved || apptLastSaved}
                  syncError={techSyncError || apptSyncError}
                  onForceSync={() => {
                    forceTechSync();
                    forceApptSync();
                  }}
                  theme={theme}
                  showLabel={true}
                  size="md"
                />
                <ExportDropdown
                  onExportCSV={() => exportToCSV(appointments, APPT_COLUMNS, { filename: 'appointments' })}
                  onExportExcel={() => exportToExcel(appointments, APPT_COLUMNS, { filename: 'appointments' })}
                  onExportJSON={() => exportToJSON(appointments, { filename: 'appointments' })}
                  onExportPDF={async () =>
                    await exportToPDF(appointments, APPT_COLUMNS, {
                      filename: 'appointments',
                      title: 'Technician Appointments',
                      subtitle: `${appointments.length} appointments`,
                    })
                  }
                  onPrint={() => printData(appointments, APPT_COLUMNS, { title: 'Appointments' })}
                  onCopyToClipboard={async () => await copyUtil(appointments, APPT_COLUMNS, 'tab')}
                  showImport={false}
                  theme={theme}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {[
            { label: "Today's Jobs", value: stats.todayTotal, icon: <Calendar className="w-5 h-5" /> },
            { label: 'Scheduled', value: stats.scheduled, icon: <Clock className="w-5 h-5 text-blue-500" /> },
            { label: 'In Progress', value: stats.inProgress, icon: <Wrench className="w-5 h-5 text-orange-500" /> },
            { label: 'Completed', value: stats.completed, icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
            { label: 'Active Techs', value: stats.activeTechs, icon: <Users className="w-5 h-5 text-purple-500" /> },
          ].map((stat) => (
            <Card key={stat.label} className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {stat.icon}
                  <div>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6">
          {[
            { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
            { id: 'technicians', label: 'Technicians', icon: <Users className="w-4 h-4" /> },
            { id: 'add-appointment', label: 'New Appointment', icon: <Plus className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'add-appointment') {
                  setCurrentAppointment(createEmptyAppointment());
                }
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id || (activeTab === 'edit-appointment' && tab.id === 'add-appointment')
                  ? 'bg-[#0D9488] text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <Card className={`mt-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-6">
              {/* Calendar Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <button onClick={goToPrev} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={goToToday} className="px-3 py-1 rounded-lg bg-[#0D9488] text-white text-sm">
                    {t('tools.techScheduleAppliance.today', 'Today')}
                  </button>
                  <button onClick={goToNext} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <h2 className={`ml-4 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(currentDate)}
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={selectedTechFilter}
                    onChange={(e) => setSelectedTechFilter(e.target.value)}
                    className={inputClass}
                    style={{ width: 'auto' }}
                  >
                    <option value="all">{t('tools.techScheduleAppliance.allTechnicians', 'All Technicians')}</option>
                    {technicians.filter((t) => t.isActive).map((tech) => (
                      <option key={tech.id} value={tech.id}>{tech.name}</option>
                    ))}
                  </select>
                  <div className="flex rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('day')}
                      className={`px-3 py-1 ${viewMode === 'day' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {t('tools.techScheduleAppliance.day', 'Day')}
                    </button>
                    <button
                      onClick={() => setViewMode('week')}
                      className={`px-3 py-1 ${viewMode === 'week' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {t('tools.techScheduleAppliance.week', 'Week')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Appointments List */}
              {filteredAppointments.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.techScheduleAppliance.noAppointmentsScheduled', 'No appointments scheduled')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments
                    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
                    .map((appt) => {
                      const tech = technicians.find((t) => t.id === appt.technicianId);
                      return (
                        <div
                          key={appt.id}
                          className={`p-4 rounded-lg border-l-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                          style={{ borderLeftColor: tech?.color || '#0D9488' }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {appt.startTime} - {appt.endTime}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appt.status)}`}>
                                  {STATUS_OPTIONS.find((s) => s.value === appt.status)?.label}
                                </span>
                                {appt.priority === 'urgent' && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
                                    {t('tools.techScheduleAppliance.urgent', 'Urgent')}
                                  </span>
                                )}
                              </div>
                              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {appt.customerName}
                              </h3>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {appt.customerAddress}
                              </p>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Wrench className="w-3 h-3 inline mr-1" />
                                {appt.applianceType} {appt.brand && `(${appt.brand})`} - {appt.issueDescription.substring(0, 50)}...
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  <User className="w-3 h-3" />
                                  {appt.technicianName || 'Unassigned'}
                                </span>
                                <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  <Timer className="w-3 h-3" />
                                  {appt.duration} min
                                </span>
                                <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  <Navigation className="w-3 h-3" />
                                  ~{appt.estimatedTravel} min travel
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                                <select
                                  value={appt.status}
                                  onChange={(e) => handleUpdateStatus(appt.id, e.target.value as Appointment['status'])}
                                  className={`${inputClass} text-sm py-1 w-auto`}
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                  ))}
                                </select>
                              )}
                              <button
                                onClick={() => handleEditAppointment(appt)}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAppointment(appt.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-red-500"
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
            </CardContent>
          </Card>
        )}

        {/* Technicians View */}
        {activeTab === 'technicians' && (
          <Card className={`mt-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.techScheduleAppliance.technicianRoster', 'Technician Roster')}</h2>
                <button
                  onClick={() => {
                    setCurrentTech(createEmptyTechnician());
                    setShowTechForm(true);
                  }}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.techScheduleAppliance.addTechnician', 'Add Technician')}
                </button>
              </div>

              {technicians.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.techScheduleAppliance.noTechniciansAdded', 'No technicians added')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {technicians.map((tech) => (
                    <div
                      key={tech.id}
                      className={`p-4 rounded-lg border-l-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                      style={{ borderLeftColor: tech.color }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{tech.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            tech.isActive
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-gray-500/20 text-gray-500'
                          }`}>
                            {tech.isActive ? t('tools.techScheduleAppliance.active2', 'Active') : t('tools.techScheduleAppliance.inactive', 'Inactive')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{tech.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Phone className="w-3 h-3 inline mr-1" />
                        {tech.phone}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Mail className="w-3 h-3 inline mr-1" />
                        {tech.email}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {tech.serviceArea}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tech.specialties.slice(0, 3).map((spec) => (
                          <span key={spec} className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                            {spec}
                          </span>
                        ))}
                        {tech.specialties.length > 3 && (
                          <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                            +{tech.specialties.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {tech.completedJobs} jobs completed
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditTechnician(tech)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTechnician(tech.id)}
                            className="p-1 rounded hover:bg-red-500/20 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Technician Form Modal */}
        {showTechForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowTechForm(false)} />
            <Card className={`relative w-full max-w-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                  {currentTech.name ? t('tools.techScheduleAppliance.editTechnician', 'Edit Technician') : t('tools.techScheduleAppliance.addTechnician2', 'Add Technician')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className={labelClass}>{t('tools.techScheduleAppliance.name', 'Name *')}</label>
                  <input
                    type="text"
                    value={currentTech.name}
                    onChange={(e) => setCurrentTech({ ...currentTech, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.techScheduleAppliance.email', 'Email')}</label>
                    <input
                      type="email"
                      value={currentTech.email}
                      onChange={(e) => setCurrentTech({ ...currentTech, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.techScheduleAppliance.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={currentTech.phone}
                      onChange={(e) => setCurrentTech({ ...currentTech, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.techScheduleAppliance.serviceArea', 'Service Area')}</label>
                  <input
                    type="text"
                    value={currentTech.serviceArea}
                    onChange={(e) => setCurrentTech({ ...currentTech, serviceArea: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.techScheduleAppliance.eGDowntownNorthSide', 'e.g., Downtown, North Side')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.techScheduleAppliance.maxJobsPerDay', 'Max Jobs Per Day')}</label>
                  <input
                    type="number"
                    value={currentTech.maxJobsPerDay}
                    onChange={(e) => setCurrentTech({ ...currentTech, maxJobsPerDay: parseInt(e.target.value) || 6 })}
                    className={inputClass}
                    min="1"
                    max="12"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.techScheduleAppliance.specialties', 'Specialties')}</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SPECIALTIES.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => toggleSpecialty(spec)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          currentTech.specialties.includes(spec)
                            ? 'bg-[#0D9488] text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.techScheduleAppliance.color', 'Color')}</label>
                  <div className="flex gap-2 mt-2">
                    {TECH_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCurrentTech({ ...currentTech, color })}
                        className={`w-8 h-8 rounded-full border-2 ${currentTech.color === color ? 'border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentTech.isActive}
                    onChange={(e) => setCurrentTech({ ...currentTech, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#0D9488]"
                  />
                  <label className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.techScheduleAppliance.active', 'Active')}</label>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveTechnician}
                    disabled={!currentTech.name}
                    className="flex-1 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:opacity-50"
                  >
                    {t('tools.techScheduleAppliance.save', 'Save')}
                  </button>
                  <button
                    onClick={() => setShowTechForm(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {t('tools.techScheduleAppliance.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add/Edit Appointment Form */}
        {(activeTab === 'add-appointment' || activeTab === 'edit-appointment') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Customer & Appliance Info */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.techScheduleAppliance.customerServiceDetails', 'Customer & Service Details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.techScheduleAppliance.customerName', 'Customer Name *')}</label>
                    <input
                      type="text"
                      value={currentAppointment.customerName}
                      onChange={(e) => setCurrentAppointment({ ...currentAppointment, customerName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.techScheduleAppliance.phone2', 'Phone *')}</label>
                    <input
                      type="tel"
                      value={currentAppointment.customerPhone}
                      onChange={(e) => setCurrentAppointment({ ...currentAppointment, customerPhone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.techScheduleAppliance.email2', 'Email')}</label>
                  <input
                    type="email"
                    value={currentAppointment.customerEmail}
                    onChange={(e) => setCurrentAppointment({ ...currentAppointment, customerEmail: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.techScheduleAppliance.serviceAddress', 'Service Address *')}</label>
                  <input
                    type="text"
                    value={currentAppointment.customerAddress}
                    onChange={(e) => setCurrentAppointment({ ...currentAppointment, customerAddress: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.techScheduleAppliance.applianceType', 'Appliance Type *')}</label>
                    <select
                      value={currentAppointment.applianceType}
                      onChange={(e) => setCurrentAppointment({ ...currentAppointment, applianceType: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.techScheduleAppliance.select', 'Select...')}</option>
                      {APPLIANCE_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.techScheduleAppliance.brand', 'Brand')}</label>
                    <input
                      type="text"
                      value={currentAppointment.brand}
                      onChange={(e) => setCurrentAppointment({ ...currentAppointment, brand: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.techScheduleAppliance.issueDescription', 'Issue Description *')}</label>
                  <textarea
                    value={currentAppointment.issueDescription}
                    onChange={(e) => setCurrentAppointment({ ...currentAppointment, issueDescription: e.target.value })}
                    className={`${inputClass} min-h-20`}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.techScheduleAppliance.priority', 'Priority')}</label>
                  <select
                    value={currentAppointment.priority}
                    onChange={(e) => setCurrentAppointment({ ...currentAppointment, priority: e.target.value as Appointment['priority'] })}
                    className={inputClass}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <div className="space-y-6">
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.techScheduleAppliance.scheduling', 'Scheduling')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.techScheduleAppliance.assignTechnician', 'Assign Technician *')}</label>
                    <select
                      value={currentAppointment.technicianId}
                      onChange={(e) => setCurrentAppointment({ ...currentAppointment, technicianId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.techScheduleAppliance.selectTechnician', 'Select technician...')}</option>
                      {technicians.filter((t) => t.isActive).map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} ({tech.specialties.join(', ')})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.techScheduleAppliance.date', 'Date *')}</label>
                      <input
                        type="date"
                        value={currentAppointment.date}
                        onChange={(e) => setCurrentAppointment({ ...currentAppointment, date: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.techScheduleAppliance.startTime', 'Start Time *')}</label>
                      <select
                        value={currentAppointment.startTime}
                        onChange={(e) => {
                          const start = e.target.value;
                          const duration = currentAppointment.duration;
                          const [h, m] = start.split(':').map(Number);
                          const endMin = h * 60 + m + duration;
                          const endH = Math.floor(endMin / 60);
                          const endM = endMin % 60;
                          const end = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                          setCurrentAppointment({ ...currentAppointment, startTime: start, endTime: end });
                        }}
                        className={inputClass}
                      >
                        {TIME_SLOTS.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.techScheduleAppliance.durationMinutes', 'Duration (minutes)')}</label>
                      <input
                        type="number"
                        value={currentAppointment.duration}
                        onChange={(e) => {
                          const duration = parseInt(e.target.value) || 60;
                          const [h, m] = currentAppointment.startTime.split(':').map(Number);
                          const endMin = h * 60 + m + duration;
                          const endH = Math.floor(endMin / 60);
                          const endM = endMin % 60;
                          const end = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                          setCurrentAppointment({ ...currentAppointment, duration, endTime: end });
                        }}
                        className={inputClass}
                        min="15"
                        step="15"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.techScheduleAppliance.estTravelMinutes', 'Est. Travel (minutes)')}</label>
                      <input
                        type="number"
                        value={currentAppointment.estimatedTravel}
                        onChange={(e) => setCurrentAppointment({ ...currentAppointment, estimatedTravel: parseInt(e.target.value) || 0 })}
                        className={inputClass}
                        min="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.techScheduleAppliance.notes', 'Notes')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={currentAppointment.notes}
                    onChange={(e) => setCurrentAppointment({ ...currentAppointment, notes: e.target.value })}
                    className={`${inputClass} min-h-24`}
                    placeholder={t('tools.techScheduleAppliance.additionalNotesForTheTechnician', 'Additional notes for the technician...')}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveAppointment}
                  disabled={!currentAppointment.customerName || !currentAppointment.technicianId || !currentAppointment.applianceType}
                  className="flex-1 px-4 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {activeTab === 'add-appointment' ? t('tools.techScheduleAppliance.scheduleAppointment', 'Schedule Appointment') : t('tools.techScheduleAppliance.saveChanges', 'Save Changes')}
                </button>
                <button
                  onClick={() => {
                    setCurrentAppointment(createEmptyAppointment());
                    setActiveTab('calendar');
                  }}
                  className={`px-4 py-3 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('tools.techScheduleAppliance.cancel2', 'Cancel')}
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

export default TechScheduleApplianceTool;
