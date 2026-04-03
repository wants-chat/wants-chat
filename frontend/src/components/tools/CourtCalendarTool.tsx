'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Search,
  X,
  Save,
  Edit2,
  AlertCircle,
  CheckCircle,
  Bell,
  Briefcase,
  Building,
  ChevronLeft,
  ChevronRight,
  Gavel,
  FileText,
  Users,
  Timer,
  AlertTriangle,
  Filter,
  ClipboardList,
  Scale,
  CalendarCheck,
  Target,
  ListChecks,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';

// Types
interface PreparationTask {
  id: string;
  task: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  notes: string;
}

interface CourtEvent {
  id: string;
  matterId: string;
  matterName: string;
  clientName: string;
  eventType: 'hearing' | 'trial' | 'motion' | 'conference' | 'deposition' | 'mediation' | 'arbitration' | 'deadline';
  eventTitle: string;
  court: string;
  courtroom?: string;
  judge?: string;
  dateTime: string;
  endTime?: string;
  duration?: number;
  attorney: string;
  additionalStaff: string[];
  status: 'scheduled' | 'confirmed' | 'continued' | 'completed' | 'cancelled';
  preparation: PreparationTask[];
  documents: string[];
  notes: string;
  reminder: number;
  createdAt: string;
  updatedAt: string;
}

interface Deadline {
  id: string;
  matterId: string;
  matterName: string;
  deadlineType: 'filing' | 'response' | 'discovery' | 'motion' | 'appeal' | 'statute-of-limitations' | 'other';
  description: string;
  dueDate: string;
  triggerDate?: string;
  calculationRule?: string;
  assignedTo: string;
  status: 'pending' | 'completed' | 'extended' | 'missed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

interface CourtCalendarToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'court-calendar';

// Column configuration for exports
const eventColumns: ColumnConfig[] = [
  { key: 'eventTitle', header: 'Event Title', type: 'string' },
  { key: 'eventType', header: 'Event Type', type: 'string' },
  { key: 'matterId', header: 'Matter ID', type: 'string' },
  { key: 'matterName', header: 'Matter Name', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'court', header: 'Court', type: 'string' },
  { key: 'courtroom', header: 'Courtroom', type: 'string' },
  { key: 'judge', header: 'Judge', type: 'string' },
  { key: 'dateTime', header: 'Date/Time', type: 'date' },
  { key: 'attorney', header: 'Attorney', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Constants
const EVENT_TYPES = [
  { value: 'hearing', label: 'Hearing', icon: Gavel, color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
  { value: 'trial', label: 'Trial', icon: Scale, color: 'bg-red-500/20 text-red-600 border-red-500/30' },
  { value: 'motion', label: 'Motion', icon: FileText, color: 'bg-purple-500/20 text-purple-600 border-purple-500/30' },
  { value: 'conference', label: 'Conference', icon: Users, color: 'bg-green-500/20 text-green-600 border-green-500/30' },
  { value: 'deposition', label: 'Deposition', icon: ClipboardList, color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' },
  { value: 'mediation', label: 'Mediation', icon: Users, color: 'bg-teal-500/20 text-teal-600 border-teal-500/30' },
  { value: 'arbitration', label: 'Arbitration', icon: Scale, color: 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30' },
  { value: 'deadline', label: 'Deadline', icon: AlertCircle, color: 'bg-orange-500/20 text-orange-600 border-orange-500/30' },
];

const DEADLINE_TYPES = [
  { value: 'filing', label: 'Filing Deadline' },
  { value: 'response', label: 'Response Due' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'motion', label: 'Motion Deadline' },
  { value: 'appeal', label: 'Appeal Deadline' },
  { value: 'statute-of-limitations', label: 'Statute of Limitations' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500/20 text-blue-600' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500/20 text-green-600' },
  { value: 'continued', label: 'Continued', color: 'bg-yellow-500/20 text-yellow-600' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500/20 text-gray-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-600' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-500/20 text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-600' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-600' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500/20 text-red-600' },
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'No Reminder' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
  { value: 2880, label: '2 days before' },
  { value: 10080, label: '1 week before' },
];

// Helper functions
const createNewEvent = (): CourtEvent => ({
  id: crypto.randomUUID(),
  matterId: '',
  matterName: '',
  clientName: '',
  eventType: 'hearing',
  eventTitle: '',
  court: '',
  courtroom: '',
  judge: '',
  dateTime: new Date().toISOString().slice(0, 16),
  endTime: '',
  duration: 60,
  attorney: '',
  additionalStaff: [],
  status: 'scheduled',
  preparation: [],
  documents: [],
  notes: '',
  reminder: 1440,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewDeadline = (): Deadline => ({
  id: crypto.randomUUID(),
  matterId: '',
  matterName: '',
  deadlineType: 'filing',
  description: '',
  dueDate: new Date().toISOString().split('T')[0],
  triggerDate: '',
  calculationRule: '',
  assignedTo: '',
  status: 'pending',
  priority: 'medium',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewTask = (): PreparationTask => ({
  id: crypto.randomUUID(),
  task: '',
  assignedTo: '',
  dueDate: new Date().toISOString().split('T')[0],
  completed: false,
  notes: '',
});

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getDaysUntil = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const CourtCalendarTool: React.FC<CourtCalendarToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Combined data structure for events and deadlines
  interface CombinedData {
    events: CourtEvent[];
    deadlines: Deadline[];
  }

  const {
    data: combinedData,
    setData: setCombinedData,
    addItem,
    updateItem,
    deleteItem,
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
  } = useToolData<CombinedData & { id: string }>(
    TOOL_ID,
    [{ id: 'data', events: [], deadlines: [] }],
    eventColumns
  );

  // Extract events and deadlines from combined data
  const dataContainer = combinedData[0] || { id: 'data', events: [], deadlines: [] };
  const events: CourtEvent[] = dataContainer.events || [];
  const deadlines: Deadline[] = dataContainer.deadlines || [];

  // Update functions for events and deadlines
  const updateEvents = (newEvents: CourtEvent[]) => {
    updateItem('data', { events: newEvents, deadlines });
  };

  const updateDeadlines = (newDeadlines: Deadline[]) => {
    updateItem('data', { events, deadlines: newDeadlines });
  };

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.eventType && EVENT_TYPES.find(et => et.value === params.eventType)) {
        setFilterType(params.eventType);
        hasChanges = true;
      }
      if (params.tab && ['calendar', 'events', 'deadlines', 'tasks'].includes(params.tab)) {
        setActiveTab(params.tab);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // State
  const [activeTab, setActiveTab] = useState<'calendar' | 'events' | 'deadlines' | 'tasks'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CourtEvent | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [editingEvent, setEditingEvent] = useState<CourtEvent | null>(null);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [eventForm, setEventForm] = useState<CourtEvent>(createNewEvent());
  const [deadlineForm, setDeadlineForm] = useState<Deadline>(createNewDeadline());
  const [newStaff, setNewStaff] = useState('');
  const [newDocument, setNewDocument] = useState('');
  const [newTask, setNewTask] = useState<PreparationTask>(createNewTask());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const eventsThisWeek = events.filter(e => {
      const eventDate = new Date(e.dateTime);
      return eventDate >= today && eventDate <= nextWeek && e.status !== 'cancelled';
    });

    const upcomingDeadlines = deadlines.filter(d => {
      const deadlineDate = new Date(d.dueDate);
      return deadlineDate >= today && d.status === 'pending';
    });

    const criticalDeadlines = deadlines.filter(d => d.priority === 'critical' && d.status === 'pending');

    const courtBreakdown = events.reduce((acc, e) => {
      if (e.court) {
        acc[e.court] = (acc[e.court] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: events.length,
      eventsThisWeek: eventsThisWeek.length,
      totalDeadlines: deadlines.length,
      upcomingDeadlines: upcomingDeadlines.length,
      criticalDeadlines: criticalDeadlines.length,
      courtBreakdown,
    };
  }, [events, deadlines]);

  // Filtered data
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchQuery === '' ||
        event.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.matterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.matterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.court.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === '' || event.eventType === filterType;
      const matchesStatus = filterStatus === '' || event.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [events, searchQuery, filterType, filterStatus]);

  const filteredDeadlines = useMemo(() => {
    return deadlines.filter(deadline => {
      const matchesSearch = searchQuery === '' ||
        deadline.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deadline.matterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deadline.matterName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === '' || deadline.deadlineType === filterType;
      const matchesStatus = filterStatus === '' || deadline.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [deadlines, searchQuery, filterType, filterStatus]);

  // Calendar data
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: { date: Date; events: CourtEvent[]; deadlines: Deadline[]; isCurrentMonth: boolean }[] = [];
    const current = new Date(startDate);

    while (current <= lastDay || days.length % 7 !== 0) {
      const dateStr = current.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.dateTime.split('T')[0] === dateStr);
      const dayDeadlines = deadlines.filter(d => d.dueDate === dateStr);
      days.push({
        date: new Date(current),
        events: dayEvents,
        deadlines: dayDeadlines,
        isCurrentMonth: current.getMonth() === month,
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentMonth, events, deadlines]);

  // Conflict detection
  const checkConflicts = (event: CourtEvent): CourtEvent[] => {
    const eventStart = new Date(event.dateTime).getTime();
    const eventEnd = event.endTime ? new Date(event.endTime).getTime() : eventStart + (event.duration || 60) * 60 * 1000;

    return events.filter(e => {
      if (e.id === event.id || e.status === 'cancelled') return false;
      const otherStart = new Date(e.dateTime).getTime();
      const otherEnd = e.endTime ? new Date(e.endTime).getTime() : otherStart + (e.duration || 60) * 60 * 1000;
      return (eventStart < otherEnd && eventEnd > otherStart) && e.attorney === event.attorney;
    });
  };

  // Event handlers
  const handleSaveEvent = async () => {
    if (!eventForm.eventTitle || !eventForm.dateTime || !eventForm.matterId) {
      setValidationMessage('Please fill in required fields (Title, Date/Time, Matter ID)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const conflicts = checkConflicts(eventForm);
    if (conflicts.length > 0) {
      const proceed = await confirm({
        title: 'Conflict Detected',
        message: `Conflict detected with ${conflicts.length} event(s). Do you want to proceed?`,
        confirmText: 'Proceed',
        cancelText: 'Cancel',
        variant: 'warning',
      });
      if (!proceed) return;
    }

    if (editingEvent) {
      const updatedEvents = events.map(e =>
        e.id === editingEvent.id ? { ...eventForm, updatedAt: new Date().toISOString() } : e
      );
      updateEvents(updatedEvents);
    } else {
      updateEvents([...events, { ...eventForm, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    }

    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm(createNewEvent());
  };

  const handleDeleteEvent = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      updateEvents(events.filter(e => e.id !== id));
      if (selectedEvent?.id === id) setSelectedEvent(null);
    }
  };

  const handleSaveDeadline = () => {
    if (!deadlineForm.description || !deadlineForm.dueDate || !deadlineForm.matterId) {
      setValidationMessage('Please fill in required fields (Description, Due Date, Matter ID)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingDeadline) {
      const updatedDeadlines = deadlines.map(d =>
        d.id === editingDeadline.id ? { ...deadlineForm, updatedAt: new Date().toISOString() } : d
      );
      updateDeadlines(updatedDeadlines);
    } else {
      updateDeadlines([...deadlines, { ...deadlineForm, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    }

    setShowDeadlineModal(false);
    setEditingDeadline(null);
    setDeadlineForm(createNewDeadline());
  };

  const handleDeleteDeadline = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Deadline',
      message: 'Are you sure you want to delete this deadline?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      updateDeadlines(deadlines.filter(d => d.id !== id));
      if (selectedDeadline?.id === id) setSelectedDeadline(null);
    }
  };

  const openEditEvent = (event: CourtEvent) => {
    setEditingEvent(event);
    setEventForm(event);
    setShowEventModal(true);
  };

  const openEditDeadline = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setDeadlineForm(deadline);
    setShowDeadlineModal(true);
  };

  const addStaff = () => {
    if (newStaff.trim() && !eventForm.additionalStaff.includes(newStaff.trim())) {
      setEventForm({ ...eventForm, additionalStaff: [...eventForm.additionalStaff, newStaff.trim()] });
      setNewStaff('');
    }
  };

  const removeStaff = (staff: string) => {
    setEventForm({ ...eventForm, additionalStaff: eventForm.additionalStaff.filter(s => s !== staff) });
  };

  const addDocument = () => {
    if (newDocument.trim() && !eventForm.documents.includes(newDocument.trim())) {
      setEventForm({ ...eventForm, documents: [...eventForm.documents, newDocument.trim()] });
      setNewDocument('');
    }
  };

  const removeDocument = (doc: string) => {
    setEventForm({ ...eventForm, documents: eventForm.documents.filter(d => d !== doc) });
  };

  const addPreparationTask = () => {
    if (newTask.task.trim()) {
      setEventForm({ ...eventForm, preparation: [...eventForm.preparation, { ...newTask, id: crypto.randomUUID() }] });
      setNewTask(createNewTask());
    }
  };

  const toggleTaskComplete = (eventId: string, taskId: string) => {
    const updatedEvents = events.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          preparation: e.preparation.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
          updatedAt: new Date().toISOString(),
        };
      }
      return e;
    });
    updateEvents(updatedEvents);
  };

  const getEventTypeConfig = (type: string) => EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0];
  const getStatusConfig = (status: string) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  const getPriorityConfig = (priority: string) => PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabClass = (active: boolean) => `flex-1 py-3 px-4 text-center font-medium transition-colors ${
    active
      ? 'text-cyan-600 border-b-2 border-cyan-600'
      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl">
            <Gavel className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.courtCalendar.courtCalendar', 'Court Calendar')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.courtCalendar.manageCourtDatesHearingsAnd', 'Manage court dates, hearings, and legal deadlines')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="court-calendar" toolName="Court Calendar" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme as 'light' | 'dark'}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'court-calendar' })}
            onExportExcel={() => exportExcel({ filename: 'court-calendar' })}
            onExportJSON={() => exportJSON({ filename: 'court-calendar' })}
            onExportPDF={() => exportPDF({ filename: 'court-calendar', title: 'Court Calendar' })}
            onPrint={() => print('Court Calendar')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={events.length === 0 && deadlines.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button
            onClick={() => {
              setEventForm(createNewEvent());
              setEditingEvent(null);
              setShowEventModal(true);
            }}
            className={buttonPrimary}
          >
            <Plus className="w-4 h-4" />
            {t('tools.courtCalendar.addEvent', 'Add Event')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.courtCalendar.totalEvents', 'Total Events')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.totalEvents}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <CalendarCheck className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.courtCalendar.thisWeek', 'This Week')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.eventsThisWeek}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Timer className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.courtCalendar.deadlines', 'Deadlines')}</p>
              <p className="text-2xl font-bold text-orange-500">{stats.upcomingDeadlines}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.courtCalendar.critical', 'Critical')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.criticalDeadlines}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Building className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.courtCalendar.courts', 'Courts')}</p>
              <p className="text-2xl font-bold text-purple-500">{Object.keys(stats.courtBreakdown).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${cardClass} mb-6`}>
        <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <button onClick={() => setActiveTab('events')} className={tabClass(activeTab === 'events')}>
            <Gavel className="w-4 h-4 inline mr-2" />
            {t('tools.courtCalendar.events', 'Events')}
          </button>
          <button onClick={() => setActiveTab('calendar')} className={tabClass(activeTab === 'calendar')}>
            <Calendar className="w-4 h-4 inline mr-2" />
            {t('tools.courtCalendar.calendar', 'Calendar')}
          </button>
          <button onClick={() => setActiveTab('deadlines')} className={tabClass(activeTab === 'deadlines')}>
            <AlertCircle className="w-4 h-4 inline mr-2" />
            {t('tools.courtCalendar.deadlines2', 'Deadlines')}
          </button>
          <button onClick={() => setActiveTab('tasks')} className={tabClass(activeTab === 'tasks')}>
            <ListChecks className="w-4 h-4 inline mr-2" />
            {t('tools.courtCalendar.prepTasks', 'Prep Tasks')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.courtCalendar.searchEventsMattersCourts', 'Search events, matters, courts...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.courtCalendar.allTypes', 'All Types')}</option>
            {activeTab === 'deadlines'
              ? DEADLINE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)
              : EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.courtCalendar.allStatus', 'All Status')}</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {activeTab === 'deadlines' && (
            <button
              onClick={() => {
                setDeadlineForm(createNewDeadline());
                setEditingDeadline(null);
                setShowDeadlineModal(true);
              }}
              className={buttonSecondary}
            >
              <Plus className="w-4 h-4" />
              {t('tools.courtCalendar.addDeadline', 'Add Deadline')}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Panel */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">
              {activeTab === 'events' && 'Court Events'}
              {activeTab === 'calendar' && 'Events This Month'}
              {activeTab === 'deadlines' && 'Legal Deadlines'}
              {activeTab === 'tasks' && 'Preparation Tasks'}
            </h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : activeTab === 'events' || activeTab === 'calendar' ? (
              filteredEvents.length === 0 ? (
                <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.courtCalendar.noEventsScheduled', 'No events scheduled')}</p>
                </div>
              ) : (
                <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredEvents.map(event => {
                    const typeConfig = getEventTypeConfig(event.eventType);
                    const daysUntil = getDaysUntil(event.dateTime);
                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedEvent?.id === event.id
                            ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                            : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <typeConfig.icon className="w-4 h-4 text-cyan-500" />
                            </div>
                            <div>
                              <p className="font-medium">{event.eventTitle}</p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {event.matterName} - {event.clientName}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                  {formatDateTime(event.dateTime)}
                                </span>
                              </div>
                              {daysUntil >= 0 && daysUntil <= 7 && (
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                                  daysUntil === 0 ? 'bg-red-500/20 text-red-500' :
                                  daysUntil <= 3 ? 'bg-orange-500/20 text-orange-500' :
                                  'bg-yellow-500/20 text-yellow-500'
                                }`}>
                                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); openEditEvent(event); }} className="p-1.5 hover:bg-gray-600 rounded">
                              <Edit2 className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : activeTab === 'deadlines' ? (
              filteredDeadlines.length === 0 ? (
                <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.courtCalendar.noDeadlinesSet', 'No deadlines set')}</p>
                </div>
              ) : (
                <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredDeadlines.map(deadline => {
                    const priorityConfig = getPriorityConfig(deadline.priority);
                    const daysUntil = getDaysUntil(deadline.dueDate);
                    return (
                      <div
                        key={deadline.id}
                        onClick={() => setSelectedDeadline(deadline)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedDeadline?.id === deadline.id
                            ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                            : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{deadline.description}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {deadline.matterName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 text-xs rounded border ${priorityConfig.color}`}>
                                {priorityConfig.label}
                              </span>
                              <span className={`text-xs ${
                                daysUntil < 0 ? 'text-red-500' :
                                daysUntil <= 3 ? 'text-orange-500' : 'text-gray-400'
                              }`}>
                                {daysUntil < 0 ? `Overdue by ${Math.abs(daysUntil)} days` :
                                 daysUntil === 0 ? 'Due Today' :
                                 `Due in ${daysUntil} days`}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); openEditDeadline(deadline); }} className="p-1.5 hover:bg-gray-600 rounded">
                              <Edit2 className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteDeadline(deadline.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              // Prep Tasks Tab
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {events.filter(e => e.preparation.length > 0).map(event => (
                  <div key={event.id} className="p-4">
                    <p className="font-medium mb-2">{event.eventTitle}</p>
                    <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDateTime(event.dateTime)}
                    </p>
                    {event.preparation.map(task => (
                      <div key={task.id} className={`flex items-center gap-2 p-2 rounded mb-1 ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <button
                          onClick={() => toggleTaskComplete(event.id, task.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            task.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'
                          }`}
                        >
                          {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
                        </button>
                        <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.task}</span>
                      </div>
                    ))}
                  </div>
                ))}
                {events.filter(e => e.preparation.length > 0).length === 0 && (
                  <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.courtCalendar.noPreparationTasks', 'No preparation tasks')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {activeTab === 'calendar' ? (
            <div className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className={`text-center text-sm font-medium py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, idx) => {
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={idx}
                      className={`min-h-[100px] border p-1 rounded ${
                        day.isCurrentMonth
                          ? theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          : theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'
                      } ${isToday ? 'ring-2 ring-cyan-500' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        day.isCurrentMonth
                          ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                          : theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {day.date.getDate()}
                      </div>
                      {day.events.slice(0, 2).map(event => {
                        const typeConfig = getEventTypeConfig(event.eventType);
                        return (
                          <div
                            key={event.id}
                            className={`text-xs p-1 mb-1 rounded truncate cursor-pointer border ${typeConfig.color}`}
                            onClick={() => setSelectedEvent(event)}
                          >
                            {event.eventTitle}
                          </div>
                        );
                      })}
                      {day.deadlines.slice(0, 1).map(deadline => (
                        <div
                          key={deadline.id}
                          className="text-xs p-1 mb-1 rounded truncate cursor-pointer bg-orange-500/20 text-orange-600 border border-orange-500/30"
                          onClick={() => setSelectedDeadline(deadline)}
                        >
                          {deadline.description}
                        </div>
                      ))}
                      {(day.events.length > 2 || day.deadlines.length > 1) && (
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          +{day.events.length - 2 + Math.max(0, day.deadlines.length - 1)} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : selectedEvent ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedEvent.eventTitle}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getEventTypeConfig(selectedEvent.eventType).color}`}>
                        {getEventTypeConfig(selectedEvent.eventType).label}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusConfig(selectedEvent.status).color}`}>
                        {getStatusConfig(selectedEvent.status).label}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedEvent.matterId} - {selectedEvent.matterName}
                    </p>
                  </div>
                  <button onClick={() => openEditEvent(selectedEvent)} className={buttonSecondary}>
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Event Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.courtCalendar.dateTime', 'Date & Time')}</p>
                    <p className="font-medium">{formatDateTime(selectedEvent.dateTime)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.courtCalendar.court', 'Court')}</p>
                    <p className="font-medium">{selectedEvent.court || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.courtCalendar.courtroom', 'Courtroom')}</p>
                    <p className="font-medium">{selectedEvent.courtroom || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.courtCalendar.judge', 'Judge')}</p>
                    <p className="font-medium">{selectedEvent.judge || 'N/A'}</p>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-500" />
                    {t('tools.courtCalendar.participants', 'Participants')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.courtCalendar.client', 'Client')}</p>
                      <p className="font-medium">{selectedEvent.clientName || 'N/A'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400">{t('tools.courtCalendar.attorney', 'Attorney')}</p>
                      <p className="font-medium">{selectedEvent.attorney || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedEvent.additionalStaff.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 mb-1">{t('tools.courtCalendar.additionalStaff', 'Additional Staff')}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.additionalStaff.map((staff, i) => (
                          <span key={i} className={`px-2 py-1 text-sm rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            {staff}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Documents */}
                {selectedEvent.documents.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-500" />
                      {t('tools.courtCalendar.documents2', 'Documents')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.documents.map((doc, i) => (
                        <span key={i} className={`px-3 py-1 text-sm rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preparation Tasks */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-cyan-500" />
                    Preparation Tasks ({selectedEvent.preparation.filter(t => t.completed).length}/{selectedEvent.preparation.length})
                  </h3>
                  {selectedEvent.preparation.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.courtCalendar.noPreparationTasks2', 'No preparation tasks')}</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedEvent.preparation.map(task => (
                        <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <button
                            onClick={() => toggleTaskComplete(selectedEvent.id, task.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              task.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'
                            }`}
                          >
                            {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
                          </button>
                          <div className="flex-1">
                            <p className={task.completed ? 'line-through text-gray-500' : ''}>{task.task}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {task.assignedTo} - Due: {formatDate(task.dueDate)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedEvent.notes && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2">{t('tools.courtCalendar.notes', 'Notes')}</h3>
                    <p className="text-sm">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : selectedDeadline ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedDeadline.description}</h2>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedDeadline.matterId} - {selectedDeadline.matterName}
                    </p>
                  </div>
                  <button onClick={() => openEditDeadline(selectedDeadline)} className={buttonSecondary}>
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.courtCalendar.dueDate', 'Due Date')}</p>
                    <p className="font-medium">{formatDate(selectedDeadline.dueDate)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.courtCalendar.type', 'Type')}</p>
                    <p className="font-medium">{DEADLINE_TYPES.find(t => t.value === selectedDeadline.deadlineType)?.label}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.courtCalendar.priority', 'Priority')}</p>
                    <span className={`px-2 py-0.5 text-xs rounded ${getPriorityConfig(selectedDeadline.priority).color}`}>
                      {getPriorityConfig(selectedDeadline.priority).label}
                    </span>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.courtCalendar.assignedTo', 'Assigned To')}</p>
                    <p className="font-medium">{selectedDeadline.assignedTo || 'N/A'}</p>
                  </div>
                </div>

                {selectedDeadline.triggerDate && (
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.courtCalendar.triggerDate', 'Trigger Date')}</p>
                    <p className="font-medium">{formatDate(selectedDeadline.triggerDate)}</p>
                  </div>
                )}

                {selectedDeadline.calculationRule && (
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.courtCalendar.calculationRule', 'Calculation Rule')}</p>
                    <p className="font-medium">{selectedDeadline.calculationRule}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.courtCalendar.selectAnItem', 'Select an item')}</p>
              <p className="text-sm">{t('tools.courtCalendar.chooseAnEventOrDeadline', 'Choose an event or deadline to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingEvent ? t('tools.courtCalendar.editEvent', 'Edit Event') : t('tools.courtCalendar.addCourtEvent', 'Add Court Event')}</h2>
              <button onClick={() => { setShowEventModal(false); setEditingEvent(null); }} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.courtCalendar.eventTitle', 'Event Title *')}</label>
                  <input type="text" value={eventForm.eventTitle} onChange={(e) => setEventForm({ ...eventForm, eventTitle: e.target.value })} className={inputClass} placeholder={t('tools.courtCalendar.eGMotionHearing', 'e.g., Motion Hearing')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.eventType', 'Event Type')}</label>
                  <select value={eventForm.eventType} onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value as any })} className={inputClass}>
                    {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.status', 'Status')}</label>
                  <select value={eventForm.status} onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as any })} className={inputClass}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.matterId', 'Matter ID *')}</label>
                  <input type="text" value={eventForm.matterId} onChange={(e) => setEventForm({ ...eventForm, matterId: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.matterName', 'Matter Name')}</label>
                  <input type="text" value={eventForm.matterName} onChange={(e) => setEventForm({ ...eventForm, matterName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.clientName', 'Client Name')}</label>
                  <input type="text" value={eventForm.clientName} onChange={(e) => setEventForm({ ...eventForm, clientName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.dateTime2', 'Date & Time *')}</label>
                  <input type="datetime-local" value={eventForm.dateTime} onChange={(e) => setEventForm({ ...eventForm, dateTime: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.durationMinutes', 'Duration (minutes)')}</label>
                  <input type="number" value={eventForm.duration} onChange={(e) => setEventForm({ ...eventForm, duration: parseInt(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.court2', 'Court')}</label>
                  <input type="text" value={eventForm.court} onChange={(e) => setEventForm({ ...eventForm, court: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.courtroom2', 'Courtroom')}</label>
                  <input type="text" value={eventForm.courtroom} onChange={(e) => setEventForm({ ...eventForm, courtroom: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.judge2', 'Judge')}</label>
                  <input type="text" value={eventForm.judge} onChange={(e) => setEventForm({ ...eventForm, judge: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.attorney2', 'Attorney')}</label>
                  <input type="text" value={eventForm.attorney} onChange={(e) => setEventForm({ ...eventForm, attorney: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.reminder', 'Reminder')}</label>
                  <select value={eventForm.reminder} onChange={(e) => setEventForm({ ...eventForm, reminder: parseInt(e.target.value) })} className={inputClass}>
                    {REMINDER_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Additional Staff */}
              <div>
                <label className={labelClass}>{t('tools.courtCalendar.additionalStaff2', 'Additional Staff')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newStaff} onChange={(e) => setNewStaff(e.target.value)} placeholder={t('tools.courtCalendar.addStaffMember', 'Add staff member')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStaff())} />
                  <button type="button" onClick={addStaff} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {eventForm.additionalStaff.map((staff, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      {staff} <button onClick={() => removeStaff(staff)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <label className={labelClass}>{t('tools.courtCalendar.documents', 'Documents')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newDocument} onChange={(e) => setNewDocument(e.target.value)} placeholder={t('tools.courtCalendar.addDocument', 'Add document')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())} />
                  <button type="button" onClick={addDocument} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {eventForm.documents.map((doc, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      {doc} <button onClick={() => removeDocument(doc)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Preparation Tasks */}
              <div>
                <label className={labelClass}>{t('tools.courtCalendar.preparationTasks', 'Preparation Tasks')}</label>
                <div className={`p-4 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input type="text" value={newTask.task} onChange={(e) => setNewTask({ ...newTask, task: e.target.value })} placeholder={t('tools.courtCalendar.taskDescription', 'Task description')} className={inputClass} />
                    <input type="text" value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })} placeholder={t('tools.courtCalendar.assignedTo3', 'Assigned to')} className={inputClass} />
                    <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className={inputClass} />
                  </div>
                  <button type="button" onClick={addPreparationTask} className={buttonSecondary}><Plus className="w-4 h-4" /> {t('tools.courtCalendar.addTask', 'Add Task')}</button>
                </div>
                <div className="space-y-2">
                  {eventForm.preparation.map((task, i) => (
                    <div key={task.id} className={`flex items-center justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div>
                        <p className="text-sm">{task.task}</p>
                        <p className="text-xs text-gray-400">{task.assignedTo} - {task.dueDate}</p>
                      </div>
                      <button onClick={() => setEventForm({ ...eventForm, preparation: eventForm.preparation.filter((_, idx) => idx !== i) })} className="text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.courtCalendar.notes2', 'Notes')}</label>
                <textarea value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })} className={inputClass} rows={3} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowEventModal(false); setEditingEvent(null); }} className={buttonSecondary}>{t('tools.courtCalendar.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSaveEvent} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> {editingEvent ? t('tools.courtCalendar.update', 'Update') : t('tools.courtCalendar.save', 'Save')} Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deadline Modal */}
      {showDeadlineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingDeadline ? t('tools.courtCalendar.editDeadline', 'Edit Deadline') : t('tools.courtCalendar.addDeadline2', 'Add Deadline')}</h2>
              <button onClick={() => { setShowDeadlineModal(false); setEditingDeadline(null); }} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.courtCalendar.description', 'Description *')}</label>
                <input type="text" value={deadlineForm.description} onChange={(e) => setDeadlineForm({ ...deadlineForm, description: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.matterId2', 'Matter ID *')}</label>
                  <input type="text" value={deadlineForm.matterId} onChange={(e) => setDeadlineForm({ ...deadlineForm, matterId: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.matterName2', 'Matter Name')}</label>
                  <input type="text" value={deadlineForm.matterName} onChange={(e) => setDeadlineForm({ ...deadlineForm, matterName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.deadlineType', 'Deadline Type')}</label>
                  <select value={deadlineForm.deadlineType} onChange={(e) => setDeadlineForm({ ...deadlineForm, deadlineType: e.target.value as any })} className={inputClass}>
                    {DEADLINE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.dueDate2', 'Due Date *')}</label>
                  <input type="date" value={deadlineForm.dueDate} onChange={(e) => setDeadlineForm({ ...deadlineForm, dueDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.priority2', 'Priority')}</label>
                  <select value={deadlineForm.priority} onChange={(e) => setDeadlineForm({ ...deadlineForm, priority: e.target.value as any })} className={inputClass}>
                    {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.assignedTo2', 'Assigned To')}</label>
                  <input type="text" value={deadlineForm.assignedTo} onChange={(e) => setDeadlineForm({ ...deadlineForm, assignedTo: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.triggerDate2', 'Trigger Date')}</label>
                  <input type="date" value={deadlineForm.triggerDate} onChange={(e) => setDeadlineForm({ ...deadlineForm, triggerDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.courtCalendar.status2', 'Status')}</label>
                  <select value={deadlineForm.status} onChange={(e) => setDeadlineForm({ ...deadlineForm, status: e.target.value as any })} className={inputClass}>
                    <option value="pending">{t('tools.courtCalendar.pending', 'Pending')}</option>
                    <option value="completed">{t('tools.courtCalendar.completed', 'Completed')}</option>
                    <option value="extended">{t('tools.courtCalendar.extended', 'Extended')}</option>
                    <option value="missed">{t('tools.courtCalendar.missed', 'Missed')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.courtCalendar.calculationRule2', 'Calculation Rule')}</label>
                <input type="text" value={deadlineForm.calculationRule} onChange={(e) => setDeadlineForm({ ...deadlineForm, calculationRule: e.target.value })} className={inputClass} placeholder={t('tools.courtCalendar.eG30DaysFrom', 'e.g., 30 days from service')} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowDeadlineModal(false); setEditingDeadline(null); }} className={buttonSecondary}>{t('tools.courtCalendar.cancel2', 'Cancel')}</button>
                <button type="button" onClick={handleSaveDeadline} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> {editingDeadline ? t('tools.courtCalendar.update2', 'Update') : t('tools.courtCalendar.save2', 'Save')} Deadline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.courtCalendar.aboutCourtCalendar', 'About Court Calendar')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage court dates, hearings, trials, depositions, and legal deadlines. Track preparation tasks,
          assign staff, monitor conflicts, and never miss a critical deadline. Export your calendar data
          for reporting and stay synchronized across devices.
        </p>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-300">
          <AlertCircle className="w-5 h-5" />
          <span>{validationMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CourtCalendarTool;
