'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Truck,
  User,
  Shield,
  Star,
  CheckCircle,
  XCircle,
  Coffee,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
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

// Types
interface CrewMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'driver' | 'mover' | 'packer' | 'supervisor' | 'lead';
  licenseClass: string;
  licenseExpiry: string;
  hireDate: string;
  hourlyRate: number;
  overtimeRate: number;
  certifications: string[];
  skills: string[];
  emergencyContact: string;
  emergencyPhone: string;
  status: 'active' | 'on_leave' | 'terminated';
  notes: string;
  createdAt: string;
}

interface Shift {
  id: string;
  crewMemberId: string;
  jobId: string;
  jobName: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  hoursWorked: number;
  overtimeHours: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  checkInTime: string | null;
  checkOutTime: string | null;
  location: string;
  notes: string;
  createdAt: string;
}

interface TimeOffRequest {
  id: string;
  crewMemberId: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'bereavement' | 'unpaid';
  status: 'pending' | 'approved' | 'denied';
  reason: string;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
}

interface AvailabilitySlot {
  id: string;
  crewMemberId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Column configurations
const crewColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'role', header: 'Role', type: 'string' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'hireDate', header: 'Hire Date', type: 'date' },
];

const shiftColumns: ColumnConfig[] = [
  { key: 'id', header: 'Shift ID', type: 'string' },
  { key: 'crewMemberId', header: 'Crew Member', type: 'string' },
  { key: 'jobName', header: 'Job', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start', type: 'string' },
  { key: 'endTime', header: 'End', type: 'string' },
  { key: 'hoursWorked', header: 'Hours', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
];

const ROLES = ['driver', 'mover', 'packer', 'supervisor', 'lead'] as const;
const CERTIFICATIONS = ['CDL Class A', 'CDL Class B', 'Forklift', 'DOT Medical', 'OSHA Safety', 'First Aid', 'Hazmat'];
const SKILLS = ['Heavy Lifting', 'Piano Moving', 'Art Handling', 'Antiques', 'Electronics', 'Packing', 'Driving', 'Customer Service'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const calculateHoursWorked = (start: string, end: string, breakMins: number) => {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  const totalMins = endMins - startMins - breakMins;
  return Math.max(0, totalMins / 60);
};

const getWeekDates = (date: Date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

interface CrewScheduleToolProps {
  uiConfig?: UIConfig;
}

export const CrewScheduleTool: React.FC<CrewScheduleToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: crewMembers,
    addItem: addCrewMember,
    updateItem: updateCrewMember,
    deleteItem: deleteCrewMember,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<CrewMember>('moving-crew', [], crewColumns);

  const {
    data: shifts,
    addItem: addShift,
    updateItem: updateShift,
    deleteItem: deleteShift,
  } = useToolData<Shift>('crew-shifts', [], shiftColumns);

  const {
    data: timeOffRequests,
    addItem: addTimeOff,
    updateItem: updateTimeOff,
    deleteItem: deleteTimeOff,
  } = useToolData<TimeOffRequest>('crew-time-off', [], []);

  // UI State
  const [activeTab, setActiveTab] = useState<'schedule' | 'crew' | 'time-off'>('schedule');
  const [showCrewForm, setShowCrewForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [showTimeOffForm, setShowTimeOffForm] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedCrewId, setExpandedCrewId] = useState<string | null>(null);

  // Form states
  const [crewForm, setCrewForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'mover' as typeof ROLES[number],
    licenseClass: '',
    licenseExpiry: '',
    hireDate: '',
    hourlyRate: 18,
    overtimeRate: 27,
    certifications: [] as string[],
    skills: [] as string[],
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  });

  const [shiftForm, setShiftForm] = useState({
    crewMemberId: '',
    jobId: '',
    jobName: '',
    date: '',
    startTime: '08:00',
    endTime: '17:00',
    breakDuration: 30,
    location: '',
    notes: '',
  });

  const [timeOffForm, setTimeOffForm] = useState({
    crewMemberId: '',
    startDate: '',
    endDate: '',
    type: 'vacation' as TimeOffRequest['type'],
    reason: '',
  });

  // Get week dates
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  // Filter crew members
  const filteredCrew = useMemo(() => {
    return crewMembers.filter((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || member.role === filterRole;
      const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [crewMembers, searchTerm, filterRole, filterStatus]);

  // Get shifts for a specific date
  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter((s) => s.date === dateStr);
  };

  // Get shifts for a crew member on a specific date
  const getCrewShiftsForDate = (crewId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter((s) => s.crewMemberId === crewId && s.date === dateStr);
  };

  // Check if crew member is on time off
  const isOnTimeOff = (crewId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return timeOffRequests.some(
      (r) => r.crewMemberId === crewId && r.status === 'approved' && r.startDate <= dateStr && r.endDate >= dateStr
    );
  };

  // Calculate stats
  const stats = useMemo(() => {
    const activeCrew = crewMembers.filter((c) => c.status === 'active').length;
    const onLeaveCrew = crewMembers.filter((c) => c.status === 'on_leave').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayShifts = shifts.filter((s) => s.date === todayStr);
    const scheduledToday = todayShifts.filter((s) => s.status === 'scheduled' || s.status === 'confirmed').length;
    const inProgress = todayShifts.filter((s) => s.status === 'in_progress').length;
    const weekShifts = shifts.filter((s) => weekDates.some((d) => d.toISOString().split('T')[0] === s.date));
    const totalHoursThisWeek = weekShifts.reduce((sum, s) => sum + s.hoursWorked, 0);
    const pendingTimeOff = timeOffRequests.filter((r) => r.status === 'pending').length;

    return { activeCrew, onLeaveCrew, scheduledToday, inProgress, totalHoursThisWeek, pendingTimeOff };
  }, [crewMembers, shifts, timeOffRequests, weekDates]);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.crewName || params.employee) {
        setCrewForm((prev) => ({
          ...prev,
          firstName: params.firstName || '',
          lastName: params.lastName || params.crewName || '',
          email: params.email || '',
          phone: params.phone || '',
        }));
        setActiveTab('crew');
        setShowCrewForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add crew member
  const handleAddCrew = () => {
    if (!crewForm.firstName || !crewForm.lastName) {
      setValidationMessage('Please enter crew member name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newCrew: CrewMember = {
      id: editingCrew?.id || generateId(),
      ...crewForm,
      status: editingCrew?.status || 'active',
      createdAt: editingCrew?.createdAt || new Date().toISOString(),
    };

    if (editingCrew) {
      updateCrewMember(editingCrew.id, newCrew);
    } else {
      addCrewMember(newCrew);
    }

    resetCrewForm();
  };

  // Add shift
  const handleAddShift = () => {
    if (!shiftForm.crewMemberId || !shiftForm.date) {
      setValidationMessage('Please select crew member and date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const hoursWorked = calculateHoursWorked(shiftForm.startTime, shiftForm.endTime, shiftForm.breakDuration);
    const overtimeHours = Math.max(0, hoursWorked - 8);

    const newShift: Shift = {
      id: editingShift?.id || generateId(),
      crewMemberId: shiftForm.crewMemberId,
      jobId: shiftForm.jobId,
      jobName: shiftForm.jobName || 'General',
      date: shiftForm.date,
      startTime: shiftForm.startTime,
      endTime: shiftForm.endTime,
      breakDuration: shiftForm.breakDuration,
      hoursWorked,
      overtimeHours,
      status: editingShift?.status || 'scheduled',
      checkInTime: editingShift?.checkInTime || null,
      checkOutTime: editingShift?.checkOutTime || null,
      location: shiftForm.location,
      notes: shiftForm.notes,
      createdAt: editingShift?.createdAt || new Date().toISOString(),
    };

    if (editingShift) {
      updateShift(editingShift.id, newShift);
    } else {
      addShift(newShift);
    }

    resetShiftForm();
  };

  // Add time off request
  const handleAddTimeOff = () => {
    if (!timeOffForm.crewMemberId || !timeOffForm.startDate || !timeOffForm.endDate) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newTimeOff: TimeOffRequest = {
      id: generateId(),
      crewMemberId: timeOffForm.crewMemberId,
      startDate: timeOffForm.startDate,
      endDate: timeOffForm.endDate,
      type: timeOffForm.type,
      status: 'pending',
      reason: timeOffForm.reason,
      approvedBy: null,
      approvedAt: null,
      createdAt: new Date().toISOString(),
    };

    addTimeOff(newTimeOff);
    resetTimeOffForm();
  };

  // Approve/Deny time off
  const handleTimeOffDecision = (id: string, approved: boolean) => {
    updateTimeOff(id, {
      status: approved ? 'approved' : 'denied',
      approvedBy: 'Manager',
      approvedAt: new Date().toISOString(),
    });
  };

  // Check in/out
  const handleCheckIn = (shiftId: string) => {
    updateShift(shiftId, {
      status: 'in_progress',
      checkInTime: new Date().toTimeString().substring(0, 5),
    });
  };

  const handleCheckOut = (shiftId: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    const checkOutTime = new Date().toTimeString().substring(0, 5);
    const actualHours = shift.checkInTime ? calculateHoursWorked(shift.checkInTime, checkOutTime, shift.breakDuration) : shift.hoursWorked;

    updateShift(shiftId, {
      status: 'completed',
      checkOutTime,
      hoursWorked: actualHours,
      overtimeHours: Math.max(0, actualHours - 8),
    });
  };

  // Reset forms
  const resetCrewForm = () => {
    setCrewForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'mover',
      licenseClass: '',
      licenseExpiry: '',
      hireDate: '',
      hourlyRate: 18,
      overtimeRate: 27,
      certifications: [],
      skills: [],
      emergencyContact: '',
      emergencyPhone: '',
      notes: '',
    });
    setEditingCrew(null);
    setShowCrewForm(false);
  };

  const resetShiftForm = () => {
    setShiftForm({
      crewMemberId: '',
      jobId: '',
      jobName: '',
      date: '',
      startTime: '08:00',
      endTime: '17:00',
      breakDuration: 30,
      location: '',
      notes: '',
    });
    setEditingShift(null);
    setShowShiftForm(false);
  };

  const resetTimeOffForm = () => {
    setTimeOffForm({
      crewMemberId: '',
      startDate: '',
      endDate: '',
      type: 'vacation',
      reason: '',
    });
    setShowTimeOffForm(false);
  };

  // Navigation
  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  // Export handlers
  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'pdf' | 'clipboard' | 'print') => {
    const exportData = activeTab === 'crew' ? filteredCrew : shifts;
    const columns = activeTab === 'crew' ? crewColumns : shiftColumns;
    const title = activeTab === 'crew' ? 'Crew Members' : 'Shift Schedule';
    const filename = activeTab === 'crew' ? 'crew-members' : 'shift-schedule';

    switch (format) {
      case 'csv':
        exportToCSV(exportData, columns, filename);
        break;
      case 'excel':
        exportToExcel(exportData, columns, filename);
        break;
      case 'json':
        exportToJSON(exportData, filename);
        break;
      case 'pdf':
        exportToPDF(exportData, columns, title, filename);
        break;
      case 'clipboard':
        await copyUtil(exportData, columns);
        break;
      case 'print':
        printData(exportData, columns, title);
        break;
    }
  };

  const getCrewName = (crewId: string) => {
    const crew = crewMembers.find((c) => c.id === crewId);
    return crew ? `${crew.firstName} ${crew.lastName}` : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'scheduled':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'cancelled':
      case 'no_show':
      case 'denied':
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'on_leave':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'supervisor':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'lead':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'driver':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'packer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'mover':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tools.crewSchedule.crewScheduleManager', 'Crew Schedule Manager')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.crewSchedule.scheduleAndManageMovingCrew', 'Schedule and manage moving crew shifts')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="crew-schedule" toolName="Crew Schedule" />

          <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} error={syncError} onForceSync={forceSync} />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeCrew}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.crewSchedule.activeCrew', 'Active Crew')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.onLeaveCrew}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.crewSchedule.onLeave', 'On Leave')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.scheduledToday}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.crewSchedule.scheduledToday', 'Scheduled Today')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.inProgress}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.crewSchedule.inProgress', 'In Progress')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalHoursThisWeek.toFixed(1)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.crewSchedule.hoursThisWeek', 'Hours This Week')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingTimeOff}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.crewSchedule.pendingPto', 'Pending PTO')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['schedule', 'crew', 'time-off'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 dark:text-white" />
              </button>
              <span className="text-lg font-semibold dark:text-white">
                {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
              </span>
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 dark:text-white" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {t('tools.crewSchedule.today', 'Today')}
              </button>
            </div>
            <button
              onClick={() => setShowShiftForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.crewSchedule.addShift', 'Add Shift')}
            </button>
          </div>

          {/* Shift Form */}
          {showShiftForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingShift ? t('tools.crewSchedule.editShift', 'Edit Shift') : t('tools.crewSchedule.addNewShift', 'Add New Shift')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.crewSchedule.crewMember', 'Crew Member *')}</label>
                    <select
                      value={shiftForm.crewMemberId}
                      onChange={(e) => setShiftForm({ ...shiftForm, crewMemberId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">{t('tools.crewSchedule.selectCrewMember', 'Select Crew Member')}</option>
                      {crewMembers
                        .filter((c) => c.status === 'active')
                        .map((crew) => (
                          <option key={crew.id} value={crew.id}>
                            {crew.firstName} {crew.lastName} ({crew.role})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.crewSchedule.date', 'Date *')}</label>
                    <input
                      type="date"
                      value={shiftForm.date}
                      onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.crewSchedule.jobName', 'Job Name')}</label>
                    <input
                      type="text"
                      value={shiftForm.jobName}
                      onChange={(e) => setShiftForm({ ...shiftForm, jobName: e.target.value })}
                      placeholder={t('tools.crewSchedule.eGSmithResidenceMove', 'e.g., Smith Residence Move')}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.crewSchedule.startTime', 'Start Time')}</label>
                    <input
                      type="time"
                      value={shiftForm.startTime}
                      onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.crewSchedule.endTime', 'End Time')}</label>
                    <input
                      type="time"
                      value={shiftForm.endTime}
                      onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.crewSchedule.breakMins', 'Break (mins)')}</label>
                    <input
                      type="number"
                      value={shiftForm.breakDuration}
                      onChange={(e) => setShiftForm({ ...shiftForm, breakDuration: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.crewSchedule.location', 'Location')}</label>
                    <input
                      type="text"
                      value={shiftForm.location}
                      onChange={(e) => setShiftForm({ ...shiftForm, location: e.target.value })}
                      placeholder={t('tools.crewSchedule.address', 'Address')}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddShift}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingShift ? t('tools.crewSchedule.updateShift', 'Update Shift') : t('tools.crewSchedule.addShift2', 'Add Shift')}
                  </button>
                  <button
                    onClick={resetShiftForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    {t('tools.crewSchedule.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly Schedule Grid */}
          <Card>
            <CardContent className="p-4 overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b dark:border-gray-600 dark:text-white">{t('tools.crewSchedule.crewMember2', 'Crew Member')}</th>
                    {weekDates.map((date, i) => (
                      <th
                        key={i}
                        className={`text-center p-2 border-b dark:border-gray-600 dark:text-white ${
                          date.toDateString() === new Date().toDateString() ? 'bg-indigo-50 dark:bg-indigo-900' : ''
                        }`}
                      >
                        <div className="text-xs text-gray-500 dark:text-gray-400">{DAYS_OF_WEEK[i].substring(0, 3)}</div>
                        <div className="font-semibold">{date.getDate()}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {crewMembers.filter((c) => c.status === 'active').map((crew) => (
                    <tr key={crew.id} className="border-b dark:border-gray-600">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium dark:text-white">
                            {crew.firstName} {crew.lastName}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleColor(crew.role)}`}>{crew.role}</span>
                        </div>
                      </td>
                      {weekDates.map((date, i) => {
                        const dayShifts = getCrewShiftsForDate(crew.id, date);
                        const onTimeOff = isOnTimeOff(crew.id, date);
                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                          <td
                            key={i}
                            className={`p-1 text-center border-l dark:border-gray-600 ${
                              isToday ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                            }`}
                          >
                            {onTimeOff ? (
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 rounded">
                                {t('tools.crewSchedule.pto', 'PTO')}
                              </span>
                            ) : dayShifts.length > 0 ? (
                              <div className="space-y-1">
                                {dayShifts.map((shift) => (
                                  <div
                                    key={shift.id}
                                    className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(shift.status)}`}
                                    onClick={() => {
                                      setEditingShift(shift);
                                      setShiftForm({
                                        crewMemberId: shift.crewMemberId,
                                        jobId: shift.jobId,
                                        jobName: shift.jobName,
                                        date: shift.date,
                                        startTime: shift.startTime,
                                        endTime: shift.endTime,
                                        breakDuration: shift.breakDuration,
                                        location: shift.location,
                                        notes: shift.notes,
                                      });
                                      setShowShiftForm(true);
                                    }}
                                  >
                                    <div>
                                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                    </div>
                                    <div className="truncate">{shift.jobName}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setShiftForm({
                                    ...shiftForm,
                                    crewMemberId: crew.id,
                                    date: date.toISOString().split('T')[0],
                                  });
                                  setShowShiftForm(true);
                                }}
                                className="text-gray-300 hover:text-indigo-500 dark:text-gray-600 dark:hover:text-indigo-400"
                              >
                                <Plus className="w-4 h-4 mx-auto" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Today's Shifts */}
          <Card>
            <CardHeader>
              <CardTitle>{t('tools.crewSchedule.todaySShifts', 'Today\'s Shifts')}</CardTitle>
            </CardHeader>
            <CardContent>
              {getShiftsForDate(new Date()).length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('tools.crewSchedule.noShiftsScheduledForToday', 'No shifts scheduled for today')}</p>
              ) : (
                <div className="space-y-2">
                  {getShiftsForDate(new Date()).map((shift) => (
                    <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
                      <div>
                        <p className="font-medium dark:text-white">{getCrewName(shift.crewMemberId)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {shift.jobName} | {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(shift.status)}`}>{shift.status.replace('_', ' ')}</span>
                        {shift.status === 'scheduled' && (
                          <button
                            onClick={() => handleCheckIn(shift.id)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            {t('tools.crewSchedule.checkIn', 'Check In')}
                          </button>
                        )}
                        {shift.status === 'in_progress' && (
                          <button
                            onClick={() => handleCheckOut(shift.id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            {t('tools.crewSchedule.checkOut', 'Check Out')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Crew Tab */}
      {activeTab === 'crew' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder={t('tools.crewSchedule.searchCrew', 'Search crew...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="all">{t('tools.crewSchedule.allRoles', 'All Roles')}</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="all">{t('tools.crewSchedule.allStatus', 'All Status')}</option>
                <option value="active">{t('tools.crewSchedule.active', 'Active')}</option>
                <option value="on_leave">{t('tools.crewSchedule.onLeave2', 'On Leave')}</option>
                <option value="terminated">{t('tools.crewSchedule.terminated', 'Terminated')}</option>
              </select>
            </div>
            <button
              onClick={() => setShowCrewForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.crewSchedule.addCrewMember', 'Add Crew Member')}
            </button>
          </div>

          {/* Crew Form */}
          {showCrewForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingCrew ? t('tools.crewSchedule.editCrewMember', 'Edit Crew Member') : t('tools.crewSchedule.addNewCrewMember', 'Add New Crew Member')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.crewSchedule.firstName', 'First Name *')}
                    value={crewForm.firstName}
                    onChange={(e) => setCrewForm({ ...crewForm, firstName: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('tools.crewSchedule.lastName', 'Last Name *')}
                    value={crewForm.lastName}
                    onChange={(e) => setCrewForm({ ...crewForm, lastName: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="email"
                    placeholder={t('tools.crewSchedule.email', 'Email')}
                    value={crewForm.email}
                    onChange={(e) => setCrewForm({ ...crewForm, email: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="tel"
                    placeholder={t('tools.crewSchedule.phone', 'Phone')}
                    value={crewForm.phone}
                    onChange={(e) => setCrewForm({ ...crewForm, phone: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <select
                    value={crewForm.role}
                    onChange={(e) => setCrewForm({ ...crewForm, role: e.target.value as any })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder={t('tools.crewSchedule.hourlyRate', 'Hourly Rate')}
                    value={crewForm.hourlyRate}
                    onChange={(e) => setCrewForm({ ...crewForm, hourlyRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder={t('tools.crewSchedule.otRate', 'OT Rate')}
                    value={crewForm.overtimeRate}
                    onChange={(e) => setCrewForm({ ...crewForm, overtimeRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="date"
                    placeholder={t('tools.crewSchedule.hireDate', 'Hire Date')}
                    value={crewForm.hireDate}
                    onChange={(e) => setCrewForm({ ...crewForm, hireDate: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.crewSchedule.licenseClass', 'License Class')}
                    value={crewForm.licenseClass}
                    onChange={(e) => setCrewForm({ ...crewForm, licenseClass: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="date"
                    placeholder={t('tools.crewSchedule.licenseExpiry', 'License Expiry')}
                    value={crewForm.licenseExpiry}
                    onChange={(e) => setCrewForm({ ...crewForm, licenseExpiry: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('tools.crewSchedule.emergencyContact', 'Emergency Contact')}
                    value={crewForm.emergencyContact}
                    onChange={(e) => setCrewForm({ ...crewForm, emergencyContact: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="tel"
                    placeholder={t('tools.crewSchedule.emergencyPhone', 'Emergency Phone')}
                    value={crewForm.emergencyPhone}
                    onChange={(e) => setCrewForm({ ...crewForm, emergencyPhone: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCrew}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingCrew ? t('tools.crewSchedule.update', 'Update') : t('tools.crewSchedule.addCrewMember2', 'Add Crew Member')}
                  </button>
                  <button
                    onClick={resetCrewForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    {t('tools.crewSchedule.cancel2', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Crew List */}
          {filteredCrew.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.crewSchedule.noCrewMembersFoundAdd', 'No crew members found. Add your first crew member to get started.')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredCrew.map((crew) => (
                <Card key={crew.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold dark:text-white">
                              {crew.firstName} {crew.lastName}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleColor(crew.role)}`}>{crew.role}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(crew.status)}`}>{crew.status}</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {crew.email} | {crew.phone}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Rate: {formatCurrency(crew.hourlyRate)}/hr | OT: {formatCurrency(crew.overtimeRate)}/hr
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCrew(crew);
                            setCrewForm({
                              firstName: crew.firstName,
                              lastName: crew.lastName,
                              email: crew.email,
                              phone: crew.phone,
                              role: crew.role,
                              licenseClass: crew.licenseClass,
                              licenseExpiry: crew.licenseExpiry,
                              hireDate: crew.hireDate,
                              hourlyRate: crew.hourlyRate,
                              overtimeRate: crew.overtimeRate,
                              certifications: crew.certifications,
                              skills: crew.skills,
                              emergencyContact: crew.emergencyContact,
                              emergencyPhone: crew.emergencyPhone,
                              notes: crew.notes,
                            });
                            setShowCrewForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCrewMember(crew.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Time Off Tab */}
      {activeTab === 'time-off' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowTimeOffForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.crewSchedule.requestTimeOff2', 'Request Time Off')}
            </button>
          </div>

          {/* Time Off Form */}
          {showTimeOffForm && (
            <Card>
              <CardHeader>
                <CardTitle>{t('tools.crewSchedule.requestTimeOff', 'Request Time Off')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.crewSchedule.crewMember3', 'Crew Member *')}</label>
                    <select
                      value={timeOffForm.crewMemberId}
                      onChange={(e) => setTimeOffForm({ ...timeOffForm, crewMemberId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">{t('tools.crewSchedule.selectCrewMember2', 'Select Crew Member')}</option>
                      {crewMembers.map((crew) => (
                        <option key={crew.id} value={crew.id}>
                          {crew.firstName} {crew.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.crewSchedule.type', 'Type')}</label>
                    <select
                      value={timeOffForm.type}
                      onChange={(e) => setTimeOffForm({ ...timeOffForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="vacation">{t('tools.crewSchedule.vacation', 'Vacation')}</option>
                      <option value="sick">{t('tools.crewSchedule.sick', 'Sick')}</option>
                      <option value="personal">{t('tools.crewSchedule.personal', 'Personal')}</option>
                      <option value="bereavement">{t('tools.crewSchedule.bereavement', 'Bereavement')}</option>
                      <option value="unpaid">{t('tools.crewSchedule.unpaid', 'Unpaid')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.crewSchedule.startDate', 'Start Date *')}</label>
                    <input
                      type="date"
                      value={timeOffForm.startDate}
                      onChange={(e) => setTimeOffForm({ ...timeOffForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.crewSchedule.endDate', 'End Date *')}</label>
                    <input
                      type="date"
                      value={timeOffForm.endDate}
                      onChange={(e) => setTimeOffForm({ ...timeOffForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <textarea
                  placeholder={t('tools.crewSchedule.reason', 'Reason')}
                  value={timeOffForm.reason}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTimeOff}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.crewSchedule.submitRequest', 'Submit Request')}
                  </button>
                  <button
                    onClick={resetTimeOffForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    {t('tools.crewSchedule.cancel3', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Off Requests List */}
          {timeOffRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.crewSchedule.noTimeOffRequests', 'No time off requests.')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {timeOffRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold dark:text-white">{getCrewName(request.crewMemberId)}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(request.status)}`}>{request.status}</span>
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded">
                            {request.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </p>
                        {request.reason && <p className="text-sm text-gray-500 dark:text-gray-400">Reason: {request.reason}</p>}
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTimeOffDecision(request.id, true)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {t('tools.crewSchedule.approve', 'Approve')}
                          </button>
                          <button
                            onClick={() => handleTimeOffDecision(request.id, false)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            {t('tools.crewSchedule.deny', 'Deny')}
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default CrewScheduleTool;
