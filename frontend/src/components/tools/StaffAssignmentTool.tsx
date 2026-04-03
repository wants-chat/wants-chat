'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  Plus,
  Trash2,
  Save,
  Edit2,
  Search,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
  AlertCircle,
  X,
  UserPlus,
  CalendarCheck,
  DollarSign,
  Award,
  Sparkles,
  FileText,
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

interface StaffAssignmentToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type StaffRole = 'chef' | 'sous-chef' | 'line-cook' | 'server' | 'bartender' | 'host' | 'busser' | 'manager' | 'dishwasher' | 'driver';
type ShiftType = 'morning' | 'afternoon' | 'evening' | 'full-day' | 'custom';
type AssignmentStatus = 'scheduled' | 'confirmed' | 'checked-in' | 'completed' | 'no-show' | 'cancelled';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: StaffRole[];
  primaryRole: StaffRole;
  hourlyRate: number;
  certifications: string[];
  availability: string[];
  rating: number;
  totalEvents: number;
  isActive: boolean;
  emergencyContact: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: string;
  name: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  guestCount: number;
  eventType: string;
  notes: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
}

interface StaffAssignment {
  id: string;
  eventId: string;
  eventName: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  shiftType: ShiftType;
  shiftStart: string;
  shiftEnd: string;
  hourlyRate: number;
  estimatedHours: number;
  estimatedPay: number;
  status: AssignmentStatus;
  checkInTime?: string;
  checkOutTime?: string;
  actualHours?: number;
  actualPay?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const STAFF_ROLES: { role: StaffRole; label: string; color: string }[] = [
  { role: 'chef', label: 'Head Chef', color: 'bg-red-100 text-red-700' },
  { role: 'sous-chef', label: 'Sous Chef', color: 'bg-orange-100 text-orange-700' },
  { role: 'line-cook', label: 'Line Cook', color: 'bg-yellow-100 text-yellow-700' },
  { role: 'server', label: 'Server', color: 'bg-blue-100 text-blue-700' },
  { role: 'bartender', label: 'Bartender', color: 'bg-purple-100 text-purple-700' },
  { role: 'host', label: 'Host/Hostess', color: 'bg-pink-100 text-pink-700' },
  { role: 'busser', label: 'Busser', color: 'bg-green-100 text-green-700' },
  { role: 'manager', label: 'Event Manager', color: 'bg-indigo-100 text-indigo-700' },
  { role: 'dishwasher', label: 'Dishwasher', color: 'bg-gray-100 text-gray-700' },
  { role: 'driver', label: 'Driver', color: 'bg-cyan-100 text-cyan-700' },
];

const SHIFT_TYPES: { type: ShiftType; label: string; defaultStart: string; defaultEnd: string }[] = [
  { type: 'morning', label: 'Morning Shift', defaultStart: '06:00', defaultEnd: '14:00' },
  { type: 'afternoon', label: 'Afternoon Shift', defaultStart: '14:00', defaultEnd: '22:00' },
  { type: 'evening', label: 'Evening Shift', defaultStart: '17:00', defaultEnd: '01:00' },
  { type: 'full-day', label: 'Full Day', defaultStart: '08:00', defaultEnd: '20:00' },
  { type: 'custom', label: 'Custom', defaultStart: '00:00', defaultEnd: '00:00' },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Column configurations
const STAFF_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'primaryRole', header: 'Primary Role', type: 'string' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'totalEvents', header: 'Total Events', type: 'number' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
];

const ASSIGNMENT_COLUMNS: ColumnConfig[] = [
  { key: 'eventName', header: 'Event', type: 'string' },
  { key: 'staffName', header: 'Staff', type: 'string' },
  { key: 'role', header: 'Role', type: 'string' },
  { key: 'shiftStart', header: 'Shift Start', type: 'string' },
  { key: 'shiftEnd', header: 'Shift End', type: 'string' },
  { key: 'estimatedHours', header: 'Est. Hours', type: 'number' },
  { key: 'estimatedPay', header: 'Est. Pay', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const EVENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Event Name', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'guestCount', header: 'Guests', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const calculateHours = (start: string, end: string) => {
  const startParts = start.split(':').map(Number);
  const endParts = end.split(':').map(Number);
  let startMinutes = startParts[0] * 60 + startParts[1];
  let endMinutes = endParts[0] * 60 + endParts[1];
  if (endMinutes < startMinutes) endMinutes += 24 * 60; // Handle overnight shifts
  return (endMinutes - startMinutes) / 60;
};

// Main Component
export const StaffAssignmentTool: React.FC<StaffAssignmentToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: staffMembers,
    addItem: addStaffToBackend,
    updateItem: updateStaffBackend,
    deleteItem: deleteStaffBackend,
    isSynced: staffSynced,
    isSaving: staffSaving,
    lastSaved: staffLastSaved,
    syncError: staffSyncError,
    forceSync: forceStaffSync,
  } = useToolData<StaffMember>('catering-staff', [], STAFF_COLUMNS);

  const {
    data: events,
    addItem: addEventToBackend,
    updateItem: updateEventBackend,
    deleteItem: deleteEventBackend,
    isSynced: eventsSynced,
    isSaving: eventsSaving,
    lastSaved: eventsLastSaved,
    syncError: eventsSyncError,
    forceSync: forceEventsSync,
  } = useToolData<Event>('catering-events', [], EVENT_COLUMNS);

  const {
    data: assignments,
    addItem: addAssignmentToBackend,
    updateItem: updateAssignmentBackend,
    deleteItem: deleteAssignmentBackend,
    isSynced: assignmentsSynced,
    isSaving: assignmentsSaving,
    lastSaved: assignmentsLastSaved,
    syncError: assignmentsSyncError,
    forceSync: forceAssignmentsSync,
  } = useToolData<StaffAssignment>('catering-assignments', [], ASSIGNMENT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'assignments' | 'staff' | 'events'>('assignments');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<StaffAssignment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterEventId, setFilterEventId] = useState<string>('all');

  // Staff form state
  const [staffForm, setStaffForm] = useState<Partial<StaffMember>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roles: [],
    primaryRole: 'server',
    hourlyRate: 20,
    certifications: [],
    availability: [],
    rating: 5,
    totalEvents: 0,
    isActive: true,
    emergencyContact: '',
    notes: '',
  });

  // Event form state
  const [eventForm, setEventForm] = useState<Partial<Event>>({
    name: '',
    clientName: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    guestCount: 50,
    eventType: '',
    notes: '',
    status: 'upcoming',
  });

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState<Partial<StaffAssignment>>({
    eventId: '',
    staffId: '',
    role: 'server',
    shiftType: 'full-day',
    shiftStart: '08:00',
    shiftEnd: '20:00',
    notes: '',
    status: 'scheduled',
  });

  const [certificationInput, setCertificationInput] = useState('');

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.eventName || params.eventDate) {
        setEventForm(prev => ({
          ...prev,
          name: params.eventName || '',
          date: params.eventDate || '',
          clientName: params.client || '',
          guestCount: params.guestCount || 50,
          location: params.eventLocation || '',
        }));
        setShowEventForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate assignment pay
  const calculateAssignmentPay = (staffId: string, shiftStart: string, shiftEnd: string) => {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff) return { hours: 0, pay: 0 };
    const hours = calculateHours(shiftStart, shiftEnd);
    return { hours, pay: hours * staff.hourlyRate };
  };

  // Save staff member
  const saveStaff = () => {
    if (!staffForm.firstName || !staffForm.lastName || !staffForm.email) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const staff: StaffMember = {
      id: editingStaff?.id || generateId(),
      firstName: staffForm.firstName || '',
      lastName: staffForm.lastName || '',
      email: staffForm.email || '',
      phone: staffForm.phone || '',
      roles: staffForm.roles || [],
      primaryRole: staffForm.primaryRole as StaffRole,
      hourlyRate: staffForm.hourlyRate || 20,
      certifications: staffForm.certifications || [],
      availability: staffForm.availability || [],
      rating: staffForm.rating || 5,
      totalEvents: editingStaff?.totalEvents || 0,
      isActive: staffForm.isActive ?? true,
      emergencyContact: staffForm.emergencyContact || '',
      notes: staffForm.notes || '',
      createdAt: editingStaff?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingStaff) {
      updateStaffBackend(staff.id, staff);
    } else {
      addStaffToBackend(staff);
    }

    resetStaffForm();
  };

  // Reset staff form
  const resetStaffForm = () => {
    setShowStaffForm(false);
    setEditingStaff(null);
    setStaffForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roles: [],
      primaryRole: 'server',
      hourlyRate: 20,
      certifications: [],
      availability: [],
      rating: 5,
      totalEvents: 0,
      isActive: true,
      emergencyContact: '',
      notes: '',
    });
    setCertificationInput('');
  };

  // Save event
  const saveEvent = () => {
    if (!eventForm.name || !eventForm.date) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const event: Event = {
      id: editingEvent?.id || generateId(),
      name: eventForm.name || '',
      clientName: eventForm.clientName || '',
      date: eventForm.date || '',
      startTime: eventForm.startTime || '',
      endTime: eventForm.endTime || '',
      location: eventForm.location || '',
      guestCount: eventForm.guestCount || 50,
      eventType: eventForm.eventType || '',
      notes: eventForm.notes || '',
      status: eventForm.status as Event['status'] || 'upcoming',
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
    };

    if (editingEvent) {
      updateEventBackend(event.id, event);
    } else {
      addEventToBackend(event);
    }

    resetEventForm();
  };

  // Reset event form
  const resetEventForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setEventForm({
      name: '',
      clientName: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      guestCount: 50,
      eventType: '',
      notes: '',
      status: 'upcoming',
    });
  };

  // Save assignment
  const saveAssignment = () => {
    if (!assignmentForm.eventId || !assignmentForm.staffId) {
      setValidationMessage('Please select an event and staff member');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const event = events.find(e => e.id === assignmentForm.eventId);
    const staff = staffMembers.find(s => s.id === assignmentForm.staffId);
    const payInfo = calculateAssignmentPay(
      assignmentForm.staffId,
      assignmentForm.shiftStart || '08:00',
      assignmentForm.shiftEnd || '20:00'
    );

    const assignment: StaffAssignment = {
      id: editingAssignment?.id || generateId(),
      eventId: assignmentForm.eventId,
      eventName: event?.name || '',
      staffId: assignmentForm.staffId,
      staffName: staff ? `${staff.firstName} ${staff.lastName}` : '',
      role: assignmentForm.role as StaffRole,
      shiftType: assignmentForm.shiftType as ShiftType,
      shiftStart: assignmentForm.shiftStart || '08:00',
      shiftEnd: assignmentForm.shiftEnd || '20:00',
      hourlyRate: staff?.hourlyRate || 20,
      estimatedHours: payInfo.hours,
      estimatedPay: payInfo.pay,
      status: assignmentForm.status as AssignmentStatus || 'scheduled',
      notes: assignmentForm.notes || '',
      createdAt: editingAssignment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingAssignment) {
      updateAssignmentBackend(assignment.id, assignment);
    } else {
      addAssignmentToBackend(assignment);
    }

    resetAssignmentForm();
  };

  // Reset assignment form
  const resetAssignmentForm = () => {
    setShowAssignmentForm(false);
    setEditingAssignment(null);
    setAssignmentForm({
      eventId: '',
      staffId: '',
      role: 'server',
      shiftType: 'full-day',
      shiftStart: '08:00',
      shiftEnd: '20:00',
      notes: '',
      status: 'scheduled',
    });
  };

  // Update assignment status
  const updateAssignmentStatus = (id: string, status: AssignmentStatus) => {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      const updates: Partial<StaffAssignment> = { status, updatedAt: new Date().toISOString() };
      if (status === 'checked-in') {
        updates.checkInTime = new Date().toISOString();
      } else if (status === 'completed') {
        updates.checkOutTime = new Date().toISOString();
      }
      updateAssignmentBackend(id, updates);
    }
  };

  // Toggle role in staff form
  const toggleRole = (role: StaffRole) => {
    const roles = staffForm.roles || [];
    if (roles.includes(role)) {
      setStaffForm({ ...staffForm, roles: roles.filter(r => r !== role) });
    } else {
      setStaffForm({ ...staffForm, roles: [...roles, role] });
    }
  };

  // Toggle availability
  const toggleAvailability = (day: string) => {
    const availability = staffForm.availability || [];
    if (availability.includes(day)) {
      setStaffForm({ ...staffForm, availability: availability.filter(d => d !== day) });
    } else {
      setStaffForm({ ...staffForm, availability: [...availability, day] });
    }
  };

  // Add certification
  const addCertification = () => {
    if (certificationInput.trim()) {
      setStaffForm({
        ...staffForm,
        certifications: [...(staffForm.certifications || []), certificationInput.trim()],
      });
      setCertificationInput('');
    }
  };

  // Filtered data
  const filteredStaff = useMemo(() => {
    return staffMembers.filter(staff => {
      const matchesSearch = searchTerm === '' ||
        `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || staff.primaryRole === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [staffMembers, searchTerm, filterRole]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = searchTerm === '' ||
        assignment.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.eventName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEvent = filterEventId === 'all' || assignment.eventId === filterEventId;
      return matchesSearch && matchesEvent;
    });
  }, [assignments, searchTerm, filterEventId]);

  // Stats
  const stats = useMemo(() => {
    const activeStaff = staffMembers.filter(s => s.isActive).length;
    const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
    const pendingAssignments = assignments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
    const totalEstimatedPay = assignments.reduce((sum, a) => sum + a.estimatedPay, 0);
    return { activeStaff, upcomingEvents, pendingAssignments, totalEstimatedPay };
  }, [staffMembers, events, assignments]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.staffAssignment.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.staffAssignment.staffAssignmentTool', 'Staff Assignment Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.staffAssignment.manageCateringStaffAndEvent', 'Manage catering staff and event assignments')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="staff-assignment" toolName="Staff Assignment" />

              <SyncStatus
                isSynced={staffSynced && eventsSynced && assignmentsSynced}
                isSaving={staffSaving || eventsSaving || assignmentsSaving}
                lastSaved={staffLastSaved || eventsLastSaved || assignmentsLastSaved}
                syncError={staffSyncError || eventsSyncError || assignmentsSyncError}
                onForceSync={() => { forceStaffSync(); forceEventsSync(); forceAssignmentsSync(); }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(assignments, ASSIGNMENT_COLUMNS, { filename: 'staff-assignments' })}
                onExportExcel={() => exportToExcel(assignments, ASSIGNMENT_COLUMNS, { filename: 'staff-assignments' })}
                onExportJSON={() => exportToJSON(assignments, { filename: 'staff-assignments' })}
                onExportPDF={async () => {
                  await exportToPDF(assignments, ASSIGNMENT_COLUMNS, {
                    filename: 'staff-assignments',
                    title: 'Staff Assignments Report',
                  });
                }}
                onPrint={() => printData(assignments, ASSIGNMENT_COLUMNS, { title: 'Staff Assignments' })}
                onCopyToClipboard={async () => await copyUtil(assignments, ASSIGNMENT_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.staffAssignment.activeStaff', 'Active Staff')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.activeStaff}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.staffAssignment.upcomingEvents', 'Upcoming Events')}</p>
              <p className={`text-2xl font-bold text-blue-500`}>{stats.upcomingEvents}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.staffAssignment.pendingAssignments', 'Pending Assignments')}</p>
              <p className={`text-2xl font-bold text-yellow-500`}>{stats.pendingAssignments}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.staffAssignment.estLaborCost', 'Est. Labor Cost')}</p>
              <p className={`text-2xl font-bold text-[#0D9488]`}>{formatCurrency(stats.totalEstimatedPay)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'assignments', label: 'Assignments', icon: <CalendarCheck className="w-4 h-4" /> },
              { id: 'staff', label: 'Staff Directory', icon: <Users className="w-4 h-4" /> },
              { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.staffAssignment.searchAssignments', 'Search assignments...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <select
                  value={filterEventId}
                  onChange={(e) => setFilterEventId(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="all">{t('tools.staffAssignment.allEvents', 'All Events')}</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowAssignmentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.staffAssignment.newAssignment', 'New Assignment')}
              </button>
            </div>

            {/* Assignment Form Modal */}
            {showAssignmentForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {editingAssignment ? t('tools.staffAssignment.editAssignment', 'Edit Assignment') : t('tools.staffAssignment.createAssignment', 'Create Assignment')}
                      </h2>
                      <button onClick={resetAssignmentForm} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.event', 'Event *')}</label>
                        <select
                          value={assignmentForm.eventId}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, eventId: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                          <option value="">{t('tools.staffAssignment.selectEvent', 'Select event...')}</option>
                          {events.filter(e => e.status === 'upcoming').map(event => (
                            <option key={event.id} value={event.id}>{event.name} - {formatDate(event.date)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.staffMember', 'Staff Member *')}</label>
                        <select
                          value={assignmentForm.staffId}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, staffId: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                          <option value="">{t('tools.staffAssignment.selectStaff', 'Select staff...')}</option>
                          {staffMembers.filter(s => s.isActive).map(staff => (
                            <option key={staff.id} value={staff.id}>
                              {staff.firstName} {staff.lastName} ({STAFF_ROLES.find(r => r.role === staff.primaryRole)?.label})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.role', 'Role')}</label>
                        <select
                          value={assignmentForm.role}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, role: e.target.value as StaffRole })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                          {STAFF_ROLES.map(role => (
                            <option key={role.role} value={role.role}>{role.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.shiftStart', 'Shift Start')}</label>
                          <input
                            type="time"
                            value={assignmentForm.shiftStart}
                            onChange={(e) => setAssignmentForm({ ...assignmentForm, shiftStart: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.shiftEnd', 'Shift End')}</label>
                          <input
                            type="time"
                            value={assignmentForm.shiftEnd}
                            onChange={(e) => setAssignmentForm({ ...assignmentForm, shiftEnd: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.notes', 'Notes')}</label>
                        <textarea
                          value={assignmentForm.notes}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                          rows={2}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>

                      {assignmentForm.staffId && assignmentForm.shiftStart && assignmentForm.shiftEnd && (
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.staffAssignment.estimatedPay', 'Estimated Pay')}</p>
                          <p className="text-lg font-bold text-[#0D9488]">
                            {formatCurrency(calculateAssignmentPay(assignmentForm.staffId, assignmentForm.shiftStart, assignmentForm.shiftEnd).pay)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={resetAssignmentForm} className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        {t('tools.staffAssignment.cancel', 'Cancel')}
                      </button>
                      <button onClick={saveAssignment} className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90">
                        <Save className="w-4 h-4" />
                        {editingAssignment ? t('tools.staffAssignment.update', 'Update') : t('tools.staffAssignment.create', 'Create')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assignments List */}
            <div className="space-y-4">
              {filteredAssignments.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.staffAssignment.noAssignmentsFoundCreateYour', 'No assignments found. Create your first assignment!')}</p>
                </div>
              ) : (
                filteredAssignments.map(assignment => (
                  <div key={assignment.id} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{assignment.staffName}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {assignment.eventName}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          STAFF_ROLES.find(r => r.role === assignment.role)?.color
                        }`}>
                          {STAFF_ROLES.find(r => r.role === assignment.role)?.label}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          assignment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          assignment.status === 'checked-in' ? 'bg-blue-100 text-blue-700' :
                          assignment.status === 'confirmed' ? 'bg-purple-100 text-purple-700' :
                          assignment.status === 'no-show' ? 'bg-red-100 text-red-700' :
                          assignment.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {assignment.shiftStart} - {assignment.shiftEnd}
                          </p>
                          <p className="font-semibold text-[#0D9488]">{formatCurrency(assignment.estimatedPay)}</p>
                        </div>
                        <div className="flex gap-1">
                          {assignment.status === 'scheduled' && (
                            <button
                              onClick={() => updateAssignmentStatus(assignment.id, 'confirmed')}
                              className="p-1 text-green-500 hover:bg-green-100 rounded"
                              title={t('tools.staffAssignment.confirm', 'Confirm')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {assignment.status === 'confirmed' && (
                            <button
                              onClick={() => updateAssignmentStatus(assignment.id, 'checked-in')}
                              className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                              title={t('tools.staffAssignment.checkIn', 'Check In')}
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteAssignmentBackend(assignment.id)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.staffAssignment.searchStaff', 'Search staff...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="all">{t('tools.staffAssignment.allRoles', 'All Roles')}</option>
                  {STAFF_ROLES.map(role => (
                    <option key={role.role} value={role.role}>{role.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowStaffForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <UserPlus className="w-4 h-4" />
                {t('tools.staffAssignment.addStaff', 'Add Staff')}
              </button>
            </div>

            {/* Staff Form Modal */}
            {showStaffForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {editingStaff ? t('tools.staffAssignment.editStaff', 'Edit Staff') : t('tools.staffAssignment.addStaffMember', 'Add Staff Member')}
                      </h2>
                      <button onClick={resetStaffForm} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.firstName', 'First Name *')}</label>
                          <input
                            type="text"
                            value={staffForm.firstName}
                            onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.lastName', 'Last Name *')}</label>
                          <input
                            type="text"
                            value={staffForm.lastName}
                            onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.email', 'Email *')}</label>
                          <input
                            type="email"
                            value={staffForm.email}
                            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.phone', 'Phone')}</label>
                          <input
                            type="tel"
                            value={staffForm.phone}
                            onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.primaryRole', 'Primary Role')}</label>
                          <select
                            value={staffForm.primaryRole}
                            onChange={(e) => setStaffForm({ ...staffForm, primaryRole: e.target.value as StaffRole })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          >
                            {STAFF_ROLES.map(role => (
                              <option key={role.role} value={role.role}>{role.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.hourlyRate', 'Hourly Rate')}</label>
                          <input
                            type="number"
                            value={staffForm.hourlyRate}
                            onChange={(e) => setStaffForm({ ...staffForm, hourlyRate: parseFloat(e.target.value) || 0 })}
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.additionalRoles', 'Additional Roles')}</label>
                        <div className="flex flex-wrap gap-2">
                          {STAFF_ROLES.map(({ role, label, color }) => (
                            <button
                              key={role}
                              onClick={() => toggleRole(role)}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                staffForm.roles?.includes(role)
                                  ? color
                                  : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.availability', 'Availability')}</label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS_OF_WEEK.map(day => (
                            <button
                              key={day}
                              onClick={() => toggleAvailability(day)}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                staffForm.availability?.includes(day)
                                  ? 'bg-green-100 text-green-700'
                                  : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {day.substring(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.certifications', 'Certifications')}</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={certificationInput}
                            onChange={(e) => setCertificationInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                            placeholder={t('tools.staffAssignment.addCertification', 'Add certification...')}
                            className={`flex-1 px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                          <button onClick={addCertification} className="px-4 py-2 bg-[#0D9488] text-white rounded-lg">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {staffForm.certifications?.map((cert, idx) => (
                            <span key={idx} className="px-2 py-1 rounded text-sm flex items-center gap-1 bg-blue-100 text-blue-700">
                              <Award className="w-3 h-3" />
                              {cert}
                              <button onClick={() => setStaffForm({ ...staffForm, certifications: staffForm.certifications?.filter((_, i) => i !== idx) })}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={staffForm.isActive}
                            onChange={(e) => setStaffForm({ ...staffForm, isActive: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                          />
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.staffAssignment.active', 'Active')}</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={resetStaffForm} className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        {t('tools.staffAssignment.cancel2', 'Cancel')}
                      </button>
                      <button onClick={saveStaff} className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90">
                        <Save className="w-4 h-4" />
                        {editingStaff ? t('tools.staffAssignment.update2', 'Update') : t('tools.staffAssignment.addStaff2', 'Add Staff')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map(staff => (
                <div key={staff.id} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} ${!staff.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {staff.firstName} {staff.lastName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${STAFF_ROLES.find(r => r.role === staff.primaryRole)?.color}`}>
                        {STAFF_ROLES.find(r => r.role === staff.primaryRole)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{staff.rating}</span>
                    </div>
                  </div>
                  <div className={`text-sm space-y-1 mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {staff.email}</p>
                    <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {staff.phone}</p>
                    <p className="flex items-center gap-2"><DollarSign className="w-3 h-3" /> {formatCurrency(staff.hourlyRate)}/hr</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {staff.totalEvents} events
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingStaff(staff); setStaffForm({ ...staff }); setShowStaffForm(true); }}
                        className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteStaffBackend(staff.id)}
                        className="p-1 rounded hover:bg-red-100 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.staffAssignment.events', 'Events')}</h2>
              <button
                onClick={() => setShowEventForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.staffAssignment.addEvent', 'Add Event')}
              </button>
            </div>

            {/* Event Form Modal */}
            {showEventForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {editingEvent ? t('tools.staffAssignment.editEvent', 'Edit Event') : t('tools.staffAssignment.addEvent2', 'Add Event')}
                      </h2>
                      <button onClick={resetEventForm} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.eventName', 'Event Name *')}</label>
                        <input
                          type="text"
                          value={eventForm.name}
                          onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.clientName', 'Client Name')}</label>
                        <input
                          type="text"
                          value={eventForm.clientName}
                          onChange={(e) => setEventForm({ ...eventForm, clientName: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.date', 'Date *')}</label>
                          <input
                            type="date"
                            value={eventForm.date}
                            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.guestCount', 'Guest Count')}</label>
                          <input
                            type="number"
                            value={eventForm.guestCount}
                            onChange={(e) => setEventForm({ ...eventForm, guestCount: parseInt(e.target.value) || 0 })}
                            min="1"
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.staffAssignment.location', 'Location')}</label>
                        <input
                          type="text"
                          value={eventForm.location}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={resetEventForm} className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        {t('tools.staffAssignment.cancel3', 'Cancel')}
                      </button>
                      <button onClick={saveEvent} className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90">
                        <Save className="w-4 h-4" />
                        {editingEvent ? t('tools.staffAssignment.update3', 'Update') : t('tools.staffAssignment.addEvent3', 'Add Event')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Events List */}
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.staffAssignment.noEventsYetAddYour', 'No events yet. Add your first event!')}</p>
                </div>
              ) : (
                events.map(event => (
                  <div key={event.id} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{event.name}</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {event.clientName} | {formatDate(event.date)} | {event.guestCount} guests
                        </p>
                        {event.location && (
                          <p className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            <MapPin className="w-3 h-3" /> {event.location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.status === 'completed' ? 'bg-green-100 text-green-700' :
                          event.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        <button
                          onClick={() => { setEditingEvent(event); setEventForm({ ...event }); setShowEventForm(true); }}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEventBackend(event.id)}
                          className="p-1 rounded hover:bg-red-100 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{validationMessage}</span>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default StaffAssignmentTool;
