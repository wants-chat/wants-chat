'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  Calendar,
  ClipboardList,
  BarChart3,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  CalendarDays,
  Sparkles,
  Info,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import api from '../../lib/api';

// ============ INTERFACES ============
interface AttendanceTrackerToolProps {
  uiConfig?: UIConfig;
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  group: string;
  joinDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface AttendanceRecord {
  id: string;
  memberId: string;
  eventId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  createdAt: string;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  group?: string;
  location?: string;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
}

interface AttendanceData {
  members: Member[];
  records: AttendanceRecord[];
  events: Event[];
}

type ActiveTab = 'members' | 'attendance' | 'events' | 'reports';
type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

// Column configurations for exports
const MEMBER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'group', header: 'Group', type: 'string' },
  { key: 'joinDate', header: 'Join Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
];

const EVENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Event Name', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'group', header: 'Group', type: 'string' },
];

const ATTENDANCE_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'memberName', header: 'Member', type: 'string' },
  { key: 'eventName', header: 'Event', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'checkInTime', header: 'Check In', type: 'string' },
  { key: 'checkOutTime', header: 'Check Out', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Column configuration for hook (attendance records)
const ATTENDANCE_RECORDS_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'memberId', header: 'Member ID', type: 'string' },
  { key: 'eventId', header: 'Event ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'checkInTime', header: 'Check In', type: 'string' },
  { key: 'checkOutTime', header: 'Check Out', type: 'string' },
];

// ============ HELPER FUNCTIONS ============
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const getCurrentDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const STORAGE_KEY = 'attendance-tracker-data';

const GROUPS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Operations', 'Design', 'Finance', 'Support'];

const STATUS_COLORS: Record<AttendanceStatus, { bg: string; text: string; darkBg: string; darkText: string }> = {
  present: { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/30', darkText: 'text-green-400' },
  absent: { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'bg-red-900/30', darkText: 'text-red-400' },
  late: { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'bg-amber-900/30', darkText: 'text-amber-400' },
  excused: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'bg-blue-900/30', darkText: 'text-blue-400' },
};

const STATUS_ICONS: Record<AttendanceStatus, React.ReactNode> = {
  present: <CheckCircle className="w-4 h-4" />,
  absent: <XCircle className="w-4 h-4" />,
  late: <Clock className="w-4 h-4" />,
  excused: <AlertCircle className="w-4 h-4" />,
};

// ============ SAMPLE DATA GENERATOR ============
const generateSampleData = (): AttendanceData => {
  const members: Member[] = [
    { id: generateId(), name: 'John Smith', email: 'john.smith@example.com', phone: '555-0101', group: 'Engineering', joinDate: '2024-01-15', status: 'active', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '555-0102', group: 'Marketing', joinDate: '2024-02-20', status: 'active', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'Mike Davis', email: 'mike.d@example.com', phone: '555-0103', group: 'Sales', joinDate: '2024-03-10', status: 'active', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'Emily Chen', email: 'emily.c@example.com', phone: '555-0104', group: 'Engineering', joinDate: '2024-01-25', status: 'active', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'David Wilson', email: 'david.w@example.com', phone: '555-0105', group: 'HR', joinDate: '2024-04-01', status: 'active', createdAt: new Date().toISOString() },
  ];

  const events: Event[] = [
    { id: generateId(), name: 'Team Standup', description: 'Daily standup meeting', date: getCurrentDate(), startTime: '09:00', endTime: '09:30', group: 'Engineering', location: 'Room A', isRecurring: true, recurringType: 'daily', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'Weekly Review', description: 'Weekly progress review', date: getCurrentDate(), startTime: '14:00', endTime: '15:00', location: 'Main Hall', isRecurring: true, recurringType: 'weekly', createdAt: new Date().toISOString() },
    { id: generateId(), name: 'Training Session', description: 'New employee training', date: getCurrentDate(), startTime: '10:00', endTime: '12:00', group: 'HR', location: 'Training Room', isRecurring: false, createdAt: new Date().toISOString() },
  ];

  const records: AttendanceRecord[] = [];
  const statuses: AttendanceStatus[] = ['present', 'present', 'present', 'late', 'absent', 'excused'];

  members.forEach((member) => {
    events.forEach((event) => {
      if (!event.group || event.group === member.group) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        records.push({
          id: generateId(),
          memberId: member.id,
          eventId: event.id,
          date: event.date,
          status,
          checkInTime: status !== 'absent' ? (status === 'late' ? '09:15' : event.startTime) : undefined,
          checkOutTime: status !== 'absent' ? event.endTime : undefined,
          createdAt: new Date().toISOString(),
        });
      }
    });
  });

  return { members, records, events };
};

// ============ MAIN COMPONENT ============
export const AttendanceTrackerTool: React.FC<AttendanceTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence of attendance records
  const {
    data: records,
    setData: setRecords,
    addItem: addRecord,
    updateItem: updateRecord,
    deleteItem: deleteRecord,
    exportCSV: exportRecordsCSV,
    exportExcel: exportRecordsExcel,
    exportJSON: exportRecordsJSON,
    exportPDF: exportRecordsPDF,
    copyToClipboard: copyRecordsToClipboard,
    print: printRecords,
    isLoading: isLoadingRecords,
    isSaving: isSavingRecords,
    isSynced: isRecordsSynced,
    lastSaved: recordsLastSaved,
    syncError: recordsSyncError,
    forceSync: forceRecordsSync,
  } = useToolData<AttendanceRecord>('attendance-tracker-records', [], ATTENDANCE_RECORDS_COLUMNS);

  // Local state for members and events (not synced to backend)
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // State
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('members');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | ''>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Form states
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showBulkAttendance, setShowBulkAttendance] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Member form
  const [memberForm, setMemberForm] = useState<Omit<Member, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    phone: '',
    group: 'Engineering',
    joinDate: getCurrentDate(),
    status: 'active',
  });

  // Event form
  const [eventForm, setEventForm] = useState<Omit<Event, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    date: getCurrentDate(),
    startTime: '09:00',
    endTime: '17:00',
    group: '',
    location: '',
    isRecurring: false,
    recurringType: 'weekly',
  });

  // Bulk attendance state
  const [bulkAttendanceEvent, setBulkAttendanceEvent] = useState<string>('');
  const [bulkAttendanceDate, setBulkAttendanceDate] = useState(getCurrentDate());
  const [bulkAttendanceData, setBulkAttendanceData] = useState<Record<string, AttendanceStatus>>({});

  // ============ EFFECTS ============
  // Load members and events from localStorage (local only, not synced to backend)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: AttendanceData = JSON.parse(saved);
        setMembers(data.members || []);
        setEvents(data.events || []);
      } catch {
        console.error('Failed to load attendance data');
      }
    }
  }, []);

  // Save members and events to localStorage (local only, records are synced via hook)
  useEffect(() => {
    const data: AttendanceData = { members, records, events };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [members, events]);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content || params.text) {
        // Could potentially parse member or event data from content
        setIsPrefilled(true);
      }
    }
  }, [uiConfig, isPrefilled]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.members) setMembers(params.members);
      if (params.events) setEvents(params.events);
      if (params.activeTab) setActiveTab(params.activeTab);
      if (params.searchTerm) setSearchTerm(params.searchTerm);
      if (params.filterGroup) setFilterGroup(params.filterGroup);
      if (params.filterStatus) setFilterStatus(params.filterStatus);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  // ============ COMPUTED VALUES ============
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        !searchTerm ||
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = !filterGroup || member.group === filterGroup;
      return matchesSearch && matchesGroup;
    });
  }, [members, searchTerm, filterGroup]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesStatus = !filterStatus || record.status === filterStatus;
      const matchesEvent = !selectedEventId || record.eventId === selectedEventId;
      const matchesDateFrom = !filterDateFrom || record.date >= filterDateFrom;
      const matchesDateTo = !filterDateTo || record.date <= filterDateTo;
      return matchesStatus && matchesEvent && matchesDateFrom && matchesDateTo;
    });
  }, [records, filterStatus, selectedEventId, filterDateFrom, filterDateTo]);

  const memberAttendanceRates = useMemo(() => {
    const rates: Record<string, { total: number; present: number; rate: number }> = {};
    members.forEach((member) => {
      const memberRecords = records.filter((r) => r.memberId === member.id);
      const presentCount = memberRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
      rates[member.id] = {
        total: memberRecords.length,
        present: presentCount,
        rate: memberRecords.length > 0 ? (presentCount / memberRecords.length) * 100 : 0,
      };
    });
    return rates;
  }, [members, records]);

  const overallStats = useMemo(() => {
    const totalRecords = records.length;
    const presentCount = records.filter((r) => r.status === 'present').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;
    const lateCount = records.filter((r) => r.status === 'late').length;
    const excusedCount = records.filter((r) => r.status === 'excused').length;

    return {
      totalMembers: members.filter((m) => m.status === 'active').length,
      totalEvents: events.length,
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      overallRate: totalRecords > 0 ? ((presentCount + lateCount) / totalRecords) * 100 : 0,
    };
  }, [members, records, events]);

  // ============ HANDLERS ============
  const handleAddMember = () => {
    if (!memberForm.name || !memberForm.email) return;
    const newMember: Member = {
      ...memberForm,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setMembers([...members, newMember]);
    resetMemberForm();
  };

  const handleUpdateMember = () => {
    if (!editingMember || !memberForm.name || !memberForm.email) return;
    setMembers(members.map((m) => (m.id === editingMember.id ? { ...m, ...memberForm } : m)));
    resetMemberForm();
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    setRecords(records.filter((r) => r.memberId !== id));
  };

  const resetMemberForm = () => {
    setMemberForm({ name: '', email: '', phone: '', group: 'Engineering', joinDate: getCurrentDate(), status: 'active' });
    setShowMemberForm(false);
    setEditingMember(null);
  };

  const handleAddEvent = () => {
    if (!eventForm.name || !eventForm.date) return;
    const newEvent: Event = {
      ...eventForm,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setEvents([...events, newEvent]);
    resetEventForm();
  };

  const handleUpdateEvent = () => {
    if (!editingEvent || !eventForm.name || !eventForm.date) return;
    setEvents(events.map((e) => (e.id === editingEvent.id ? { ...e, ...eventForm } : e)));
    resetEventForm();
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
    setRecords(records.filter((r) => r.eventId !== id));
  };

  const resetEventForm = () => {
    setEventForm({ name: '', description: '', date: getCurrentDate(), startTime: '09:00', endTime: '17:00', group: '', location: '', isRecurring: false, recurringType: 'weekly' });
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleMarkAttendance = (memberId: string, eventId: string, status: AttendanceStatus, date: string = getCurrentDate()) => {
    const existingRecord = records.find((r) => r.memberId === memberId && r.eventId === eventId && r.date === date);

    if (existingRecord) {
      updateRecord(existingRecord.id, {
        status,
        checkInTime: status !== 'absent' ? getCurrentTime() : undefined,
      });
    } else {
      const newRecord: AttendanceRecord = {
        id: generateId(),
        memberId,
        eventId,
        date,
        status,
        checkInTime: status !== 'absent' ? getCurrentTime() : undefined,
        checkOutTime: undefined,
        createdAt: new Date().toISOString(),
      };
      addRecord(newRecord);
    }
  };

  const handleBulkAttendance = () => {
    if (!bulkAttendanceEvent || !bulkAttendanceDate) return;

    Object.entries(bulkAttendanceData).forEach(([memberId, status]) => {
      const existingRecord = records.find(
        (r) => r.memberId === memberId && r.eventId === bulkAttendanceEvent && r.date === bulkAttendanceDate
      );

      if (existingRecord) {
        updateRecord(existingRecord.id, {
          status,
          checkInTime: status !== 'absent' ? getCurrentTime() : undefined,
        });
      } else {
        const newRecord: AttendanceRecord = {
          id: generateId(),
          memberId,
          eventId: bulkAttendanceEvent,
          date: bulkAttendanceDate,
          status,
          checkInTime: status !== 'absent' ? getCurrentTime() : undefined,
          createdAt: new Date().toISOString(),
        };
        addRecord(newRecord);
      }
    });

    setBulkAttendanceData({});
    setShowBulkAttendance(false);

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const handleExportReport = () => {
    const reportData = {
      exportDate: new Date().toISOString(),
      summary: overallStats,
      members: members.map((m) => ({
        ...m,
        attendanceRate: memberAttendanceRates[m.id]?.rate.toFixed(1) + '%',
      })),
      events,
      records: filteredRecords.map((r) => ({
        ...r,
        memberName: members.find((m) => m.id === r.memberId)?.name,
        eventName: events.find((e) => e.id === r.eventId)?.name,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${getCurrentDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSampleData = () => {
    const sampleData = generateSampleData();
    setMembers(sampleData.members);
    setEvents(sampleData.events);
    setRecords(sampleData.records);
  };

  // ============ STYLES ============
  const cardClass = `rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`;
  const inputClass = `w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500 focus:border-transparent`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors';
  const buttonSecondary = `px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`;

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  // Loading state
  if (isLoadingRecords) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  // ============ RENDER ============
  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <UserCheck className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.attendanceTracker.attendanceTracker', 'Attendance Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.attendanceTracker.trackAttendanceForYourOrganization', 'Track attendance for your organization')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="attendance-tracker" toolName="Attendance Tracker" />

            <SyncStatus
              isSynced={isRecordsSynced}
              isSaving={isSavingRecords}
              lastSaved={recordsLastSaved}
              syncError={recordsSyncError}
              onForceSync={forceRecordsSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            {members.length === 0 && (
              <button onClick={handleLoadSampleData} className="flex items-center gap-2 px-3 py-1.5 text-sm text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
                {t('tools.attendanceTracker.loadSampleData', 'Load Sample Data')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-6 py-2 bg-teal-500/10 border-b border-teal-500/20">
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className="text-sm text-teal-500 font-medium">{t('tools.attendanceTracker.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <Users className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.attendanceTracker.activeMembers', 'Active Members')}</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{overallStats.totalMembers}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CalendarDays className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.attendanceTracker.events', 'Events')}</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{overallStats.totalEvents}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.attendanceTracker.presentToday', 'Present Today')}</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{overallStats.presentCount}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.attendanceTracker.attendanceRate', 'Attendance Rate')}</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{overallStats.overallRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============ MEMBERS TAB ============ */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.attendanceTracker.searchMembers', 'Search members...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className={inputClass} style={{ width: 'auto' }}>
                <option value="">{t('tools.attendanceTracker.allGroups', 'All Groups')}</option>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ExportDropdown
                onExportCSV={() => exportToCSV(members, MEMBER_COLUMNS, { filename: 'members' })}
                onExportExcel={() => exportToExcel(members, MEMBER_COLUMNS, { filename: 'members' })}
                onExportJSON={() => exportToJSON(members, { filename: 'members' })}
                onExportPDF={async () => {
                  await exportToPDF(members, MEMBER_COLUMNS, {
                    filename: 'members',
                    title: 'Members List',
                    subtitle: `Total: ${members.length} members`,
                  });
                }}
                onPrint={() => printData(members, MEMBER_COLUMNS, { title: 'Members List' })}
                onCopyToClipboard={() => copyUtil(members, MEMBER_COLUMNS, 'tab')}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={() => { setShowMemberForm(true); setEditingMember(null); }} className={buttonPrimary}>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  {t('tools.attendanceTracker.addMember', 'Add Member')}
                </div>
              </button>
            </div>

            {/* Add/Edit Member Form */}
            {showMemberForm && (
              <div className={`${cardClass} p-4 space-y-4`}>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingMember ? t('tools.attendanceTracker.editMember', 'Edit Member') : t('tools.attendanceTracker.addNewMember', 'Add New Member')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.name', 'Name *')}</label>
                    <input
                      type="text"
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.attendanceTracker.fullName', 'Full name')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.email', 'Email *')}</label>
                    <input
                      type="email"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.attendanceTracker.emailExampleCom', 'email@example.com')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                      className={inputClass}
                      placeholder="555-0100"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.groupDepartment', 'Group/Department')}</label>
                    <select value={memberForm.group} onChange={(e) => setMemberForm({ ...memberForm, group: e.target.value })} className={inputClass}>
                      {GROUPS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.joinDate', 'Join Date')}</label>
                    <input
                      type="date"
                      value={memberForm.joinDate}
                      onChange={(e) => setMemberForm({ ...memberForm, joinDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.status', 'Status')}</label>
                    <select value={memberForm.status} onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value as 'active' | 'inactive' })} className={inputClass}>
                      <option value="active">{t('tools.attendanceTracker.active', 'Active')}</option>
                      <option value="inactive">{t('tools.attendanceTracker.inactive', 'Inactive')}</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={resetMemberForm} className={buttonSecondary}>{t('tools.attendanceTracker.cancel', 'Cancel')}</button>
                  <button onClick={editingMember ? handleUpdateMember : handleAddMember} className={buttonPrimary}>
                    {editingMember ? t('tools.attendanceTracker.update', 'Update') : t('tools.attendanceTracker.add', 'Add')} Member
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const rate = memberAttendanceRates[member.id];
                return (
                  <div key={member.id} className={`${cardClass} p-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <span className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{member.name}</h4>
                            <span className={`px-2 py-0.5 text-xs rounded ${member.status === 'active' ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700') : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')}`}>
                              {member.status}
                            </span>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{member.email}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {member.group} | Joined: {formatDate(member.joinDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm font-medium ${rate?.rate >= 80 ? 'text-green-500' : rate?.rate >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                            {rate?.rate.toFixed(1)}%
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {rate?.present}/{rate?.total} present
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setMemberForm({
                                name: member.name,
                                email: member.email,
                                phone: member.phone,
                                group: member.group,
                                joinDate: member.joinDate,
                                status: member.status,
                              });
                              setShowMemberForm(true);
                            }}
                            className={`p-2 ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'} rounded-lg transition-colors`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredMembers.length === 0 && !showMemberForm && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">{t('tools.attendanceTracker.noMembersFound', 'No members found')}</p>
                <p className="text-sm">{t('tools.attendanceTracker.addYourFirstMemberTo', 'Add your first member to get started!')}</p>
              </div>
            )}
          </div>
        )}

        {/* ============ ATTENDANCE TAB ============ */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className={inputClass} style={{ width: 'auto', minWidth: '150px' }}>
                <option value="">{t('tools.attendanceTracker.allEvents', 'All Events')}</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | '')} className={inputClass} style={{ width: 'auto' }}>
                <option value="">{t('tools.attendanceTracker.allStatus', 'All Status')}</option>
                <option value="present">{t('tools.attendanceTracker.present', 'Present')}</option>
                <option value="absent">{t('tools.attendanceTracker.absent', 'Absent')}</option>
                <option value="late">{t('tools.attendanceTracker.late', 'Late')}</option>
                <option value="excused">{t('tools.attendanceTracker.excused', 'Excused')}</option>
              </select>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className={inputClass}
                style={{ width: 'auto' }}
                placeholder={t('tools.attendanceTracker.from', 'From')}
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className={inputClass}
                style={{ width: 'auto' }}
                placeholder="To"
              />
              <button onClick={() => setShowBulkAttendance(true)} className={buttonPrimary}>
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  {t('tools.attendanceTracker.bulkMark', 'Bulk Mark')}
                </div>
              </button>
            </div>

            {/* Bulk Attendance Modal */}
            {showBulkAttendance && (
              <div className={`${cardClass} p-4 space-y-4`}>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.attendanceTracker.bulkMarkAttendance', 'Bulk Mark Attendance')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.event', 'Event *')}</label>
                    <select
                      value={bulkAttendanceEvent}
                      onChange={(e) => setBulkAttendanceEvent(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">{t('tools.attendanceTracker.selectEvent', 'Select Event')}</option>
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.date', 'Date *')}</label>
                    <input
                      type="date"
                      value={bulkAttendanceDate}
                      onChange={(e) => setBulkAttendanceDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                {bulkAttendanceEvent && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {members.filter((m) => m.status === 'active').map((member) => {
                      const selectedEvent = events.find((e) => e.id === bulkAttendanceEvent);
                      const isInGroup = !selectedEvent?.group || selectedEvent.group === member.group;
                      if (!isInGroup) return null;

                      return (
                        <div key={member.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{member.name}</span>
                          <div className="flex gap-1">
                            {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((status) => (
                              <button
                                key={status}
                                onClick={() => setBulkAttendanceData({ ...bulkAttendanceData, [member.id]: status })}
                                className={`px-3 py-1 rounded text-xs capitalize ${
                                  bulkAttendanceData[member.id] === status
                                    ? isDark
                                      ? STATUS_COLORS[status].darkBg + ' ' + STATUS_COLORS[status].darkText
                                      : STATUS_COLORS[status].bg + ' ' + STATUS_COLORS[status].text
                                    : isDark
                                    ? 'bg-gray-600 text-gray-300'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setShowBulkAttendance(false); setBulkAttendanceData({}); }} className={buttonSecondary}>
                    {t('tools.attendanceTracker.cancel3', 'Cancel')}
                  </button>
                  <button onClick={handleBulkAttendance} className={buttonPrimary} disabled={!bulkAttendanceEvent}>
                    {t('tools.attendanceTracker.saveAttendance', 'Save Attendance')}
                  </button>
                </div>
              </div>
            )}

            {/* Attendance Records */}
            <div className="space-y-2">
              {filteredRecords.map((record) => {
                const member = members.find((m) => m.id === record.memberId);
                const event = events.find((e) => e.id === record.eventId);
                const statusColor = STATUS_COLORS[record.status];

                return (
                  <div key={record.id} className={`${cardClass} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isDark ? statusColor.darkBg : statusColor.bg}`}>
                          <span className={isDark ? statusColor.darkText : statusColor.text}>{STATUS_ICONS[record.status]}</span>
                        </div>
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{member?.name || 'Unknown'}</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {event?.name || 'Unknown Event'} | {formatDate(record.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${isDark ? statusColor.darkBg + ' ' + statusColor.darkText : statusColor.bg + ' ' + statusColor.text}`}>
                            {record.status}
                          </span>
                          {record.checkInTime && (
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              In: {formatTime(record.checkInTime)}
                              {record.checkOutTime && ` | Out: ${formatTime(record.checkOutTime)}`}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredRecords.length === 0 && !showBulkAttendance && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">{t('tools.attendanceTracker.noAttendanceRecords', 'No attendance records')}</p>
                <p className="text-sm">{t('tools.attendanceTracker.useBulkMarkToRecord', 'Use bulk mark to record attendance')}</p>
              </div>
            )}
          </div>
        )}

        {/* ============ EVENTS TAB ============ */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {/* Add Event Button */}
            {!showEventForm && (
              <button
                onClick={() => { setShowEventForm(true); setEditingEvent(null); }}
                className="w-full py-3 rounded-lg border-2 border-dashed border-teal-500 text-teal-500 flex items-center justify-center gap-2 hover:bg-teal-500/10 transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('tools.attendanceTracker.addEventSession', 'Add Event/Session')}
              </button>
            )}

            {/* Add/Edit Event Form */}
            {showEventForm && (
              <div className={`${cardClass} p-4 space-y-4`}>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingEvent ? t('tools.attendanceTracker.editEvent', 'Edit Event') : t('tools.attendanceTracker.addNewEvent', 'Add New Event')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>{t('tools.attendanceTracker.eventName', 'Event Name *')}</label>
                    <input
                      type="text"
                      value={eventForm.name}
                      onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.attendanceTracker.eGTeamStandup', 'e.g., Team Standup')}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>{t('tools.attendanceTracker.description', 'Description')}</label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      className={`${inputClass} resize-none`}
                      rows={2}
                      placeholder={t('tools.attendanceTracker.eventDescription', 'Event description...')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.date2', 'Date *')}</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.startTime', 'Start Time')}</label>
                    <input
                      type="time"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.endTime', 'End Time')}</label>
                    <input
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.groupOptional', 'Group (optional)')}</label>
                    <select value={eventForm.group} onChange={(e) => setEventForm({ ...eventForm, group: e.target.value })} className={inputClass}>
                      <option value="">{t('tools.attendanceTracker.allGroups2', 'All Groups')}</option>
                      {GROUPS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.location', 'Location')}</label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.attendanceTracker.eGRoomA', 'e.g., Room A')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.attendanceTracker.recurring', 'Recurring')}</label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={eventForm.isRecurring}
                          onChange={(e) => setEventForm({ ...eventForm, isRecurring: e.target.checked })}
                          className="rounded text-teal-500"
                        />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.attendanceTracker.yes', 'Yes')}</span>
                      </label>
                      {eventForm.isRecurring && (
                        <select
                          value={eventForm.recurringType}
                          onChange={(e) => setEventForm({ ...eventForm, recurringType: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                          className={inputClass}
                          style={{ width: 'auto' }}
                        >
                          <option value="daily">{t('tools.attendanceTracker.daily', 'Daily')}</option>
                          <option value="weekly">{t('tools.attendanceTracker.weekly', 'Weekly')}</option>
                          <option value="monthly">{t('tools.attendanceTracker.monthly', 'Monthly')}</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={resetEventForm} className={buttonSecondary}>{t('tools.attendanceTracker.cancel2', 'Cancel')}</button>
                  <button onClick={editingEvent ? handleUpdateEvent : handleAddEvent} className={buttonPrimary}>
                    {editingEvent ? t('tools.attendanceTracker.update2', 'Update') : t('tools.attendanceTracker.add2', 'Add')} Event
                  </button>
                </div>
              </div>
            )}

            {/* Events List */}
            <div className="space-y-3">
              {events.map((event) => {
                const eventRecords = records.filter((r) => r.eventId === event.id);
                const presentCount = eventRecords.filter((r) => r.status === 'present' || r.status === 'late').length;

                return (
                  <div key={event.id} className={`${cardClass} p-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.name}</h4>
                            {event.isRecurring && (
                              <span className={`px-2 py-0.5 text-xs rounded ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                {event.recurringType}
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{event.description}</p>
                          )}
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatDate(event.date)} | {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            {event.location && ` | ${event.location}`}
                            {event.group && ` | ${event.group}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {presentCount}/{eventRecords.length}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>attended</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingEvent(event);
                              setEventForm({
                                name: event.name,
                                description: event.description || '',
                                date: event.date,
                                startTime: event.startTime,
                                endTime: event.endTime,
                                group: event.group || '',
                                location: event.location || '',
                                isRecurring: event.isRecurring,
                                recurringType: event.recurringType || 'weekly',
                              });
                              setShowEventForm(true);
                            }}
                            className={`p-2 ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'} rounded-lg transition-colors`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {events.length === 0 && !showEventForm && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">{t('tools.attendanceTracker.noEventsCreated', 'No events created')}</p>
                <p className="text-sm">{t('tools.attendanceTracker.addYourFirstEventTo', 'Add your first event to track attendance')}</p>
              </div>
            )}
          </div>
        )}

        {/* ============ REPORTS TAB ============ */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Export Options */}
            <div className="flex justify-end">
              <ExportDropdown
                onExportCSV={() => {
                  const enrichedRecords = filteredRecords.map(r => ({
                    ...r,
                    memberName: members.find(m => m.id === r.memberId)?.name || '',
                    eventName: events.find(e => e.id === r.eventId)?.name || '',
                  }));
                  exportToCSV(enrichedRecords, ATTENDANCE_COLUMNS, { filename: 'attendance-records' });
                }}
                onExportExcel={() => {
                  const enrichedRecords = filteredRecords.map(r => ({
                    ...r,
                    memberName: members.find(m => m.id === r.memberId)?.name || '',
                    eventName: events.find(e => e.id === r.eventId)?.name || '',
                  }));
                  exportToExcel(enrichedRecords, ATTENDANCE_COLUMNS, { filename: 'attendance-records' });
                }}
                onExportJSON={() => {
                  const reportData = {
                    exportDate: new Date().toISOString(),
                    summary: overallStats,
                    members: members.map((m) => ({
                      ...m,
                      attendanceRate: memberAttendanceRates[m.id]?.rate.toFixed(1) + '%',
                    })),
                    events,
                    records: filteredRecords.map((r) => ({
                      ...r,
                      memberName: members.find((m) => m.id === r.memberId)?.name,
                      eventName: events.find((e) => e.id === r.eventId)?.name,
                    })),
                  };
                  exportRecordsJSON({ filename: `attendance-report-${getCurrentDate()}` });
                }}
                onExportPDF={async () => {
                  const enrichedRecords = filteredRecords.map(r => ({
                    ...r,
                    memberName: members.find(m => m.id === r.memberId)?.name || '',
                    eventName: events.find(e => e.id === r.eventId)?.name || '',
                  }));
                  await exportRecordsPDF({
                    filename: 'attendance-records',
                    title: 'Attendance Report',
                    subtitle: `Total Records: ${filteredRecords.length}`,
                  });
                }}
                onPrint={() => {
                  printRecords('Attendance Report');
                }}
                onCopyToClipboard={() => {
                  copyRecordsToClipboard('tab');
                }}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>

            {/* Summary Stats */}
            <div className={`${cardClass} p-6`}>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.attendanceTracker.attendanceSummary', 'Attendance Summary')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className={`text-3xl font-bold text-green-500`}>{overallStats.presentCount}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.attendanceTracker.present2', 'Present')}</p>
                </div>
                <div>
                  <p className={`text-3xl font-bold text-red-500`}>{overallStats.absentCount}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.attendanceTracker.absent2', 'Absent')}</p>
                </div>
                <div>
                  <p className={`text-3xl font-bold text-amber-500`}>{overallStats.lateCount}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.attendanceTracker.late2', 'Late')}</p>
                </div>
                <div>
                  <p className={`text-3xl font-bold text-blue-500`}>{overallStats.excusedCount}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.attendanceTracker.excused2', 'Excused')}</p>
                </div>
              </div>
            </div>

            {/* Member Attendance Rates */}
            <div className={`${cardClass} p-6`}>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.attendanceTracker.memberAttendanceRates', 'Member Attendance Rates')}</h4>
              <div className="space-y-3">
                {members
                  .filter((m) => m.status === 'active')
                  .sort((a, b) => (memberAttendanceRates[b.id]?.rate || 0) - (memberAttendanceRates[a.id]?.rate || 0))
                  .map((member) => {
                    const rate = memberAttendanceRates[member.id];
                    const percentage = rate?.rate || 0;

                    return (
                      <div key={member.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {member.name}
                          </span>
                          <span className={`text-sm font-medium ${percentage >= 80 ? 'text-green-500' : percentage >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className={`h-full rounded-full transition-all ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
              {members.filter((m) => m.status === 'active').length === 0 && (
                <p className={`text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.attendanceTracker.noActiveMembers', 'No active members')}</p>
              )}
            </div>

            {/* Group Statistics */}
            <div className={`${cardClass} p-6`}>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.attendanceTracker.groupStatistics', 'Group Statistics')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GROUPS.map((group) => {
                  const groupMembers = members.filter((m) => m.group === group && m.status === 'active');
                  const groupRecords = records.filter((r) => groupMembers.some((m) => m.id === r.memberId));
                  const presentRecords = groupRecords.filter((r) => r.status === 'present' || r.status === 'late');
                  const rate = groupRecords.length > 0 ? (presentRecords.length / groupRecords.length) * 100 : 0;

                  if (groupMembers.length === 0) return null;

                  return (
                    <div key={group} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{group}</p>
                      <p className={`text-2xl font-bold ${rate >= 80 ? 'text-green-500' : rate >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                        {rate.toFixed(1)}%
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {groupMembers.length} members
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.attendanceTracker.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.attendanceTracker.useBulkMarkAttendanceTo', 'Use bulk mark attendance to quickly record attendance for all members')}</li>
                <li>{t('tools.attendanceTracker.groupEventsToSpecificDepartments', 'Group events to specific departments for targeted tracking')}</li>
                <li>{t('tools.attendanceTracker.exportReportsRegularlyForRecord', 'Export reports regularly for record keeping')}</li>
                <li>{t('tools.attendanceTracker.setUpRecurringEventsFor', 'Set up recurring events for regular meetings or sessions')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTrackerTool;
