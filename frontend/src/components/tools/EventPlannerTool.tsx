'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Save,
  Clock,
  Users,
  Search,
  Filter,
  X,
  MapPin,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  PartyPopper,
  Music,
  Utensils,
  Camera,
  Mic,
  Gift,
  Heart,
  Briefcase,
  GraduationCap,
  Baby,
  Cake,
  Star,
  BarChart3,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface EventPlannerToolProps {
  uiConfig?: UIConfig;
}

// TypeScript interfaces
interface Event {
  id: string;
  name: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  expectedGuests: number;
  confirmedGuests: number;
  budget: number;
  spentAmount: number;
  status: EventStatus;
  description: string;
  notes: string;
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
}

interface Task {
  id: string;
  eventId: string;
  title: string;
  category: TaskCategory;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  notes: string;
  createdAt: string;
}

type EventType = 'wedding' | 'corporate' | 'birthday' | 'conference' | 'party' | 'graduation' | 'baby-shower' | 'anniversary' | 'fundraiser' | 'other';
type EventStatus = 'planning' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
type TaskCategory = 'venue' | 'catering' | 'decoration' | 'entertainment' | 'photography' | 'transportation' | 'invitations' | 'other';
type TabType = 'events' | 'tasks' | 'calendar' | 'analytics';

const EVENT_TYPES: { value: EventType; label: string; icon: React.ReactNode }[] = [
  { value: 'wedding', label: 'Wedding', icon: <Heart className="w-4 h-4" /> },
  { value: 'corporate', label: 'Corporate', icon: <Briefcase className="w-4 h-4" /> },
  { value: 'birthday', label: 'Birthday', icon: <Cake className="w-4 h-4" /> },
  { value: 'conference', label: 'Conference', icon: <Mic className="w-4 h-4" /> },
  { value: 'party', label: 'Party', icon: <PartyPopper className="w-4 h-4" /> },
  { value: 'graduation', label: 'Graduation', icon: <GraduationCap className="w-4 h-4" /> },
  { value: 'baby-shower', label: 'Baby Shower', icon: <Baby className="w-4 h-4" /> },
  { value: 'anniversary', label: 'Anniversary', icon: <Gift className="w-4 h-4" /> },
  { value: 'fundraiser', label: 'Fundraiser', icon: <Star className="w-4 h-4" /> },
  { value: 'other', label: 'Other', icon: <Calendar className="w-4 h-4" /> },
];

const EVENT_STATUSES: { value: EventStatus; label: string; color: string }[] = [
  { value: 'planning', label: 'Planning', color: 'blue' },
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'in-progress', label: 'In Progress', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const TASK_CATEGORIES: { value: TaskCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'venue', label: 'Venue', icon: <MapPin className="w-4 h-4" /> },
  { value: 'catering', label: 'Catering', icon: <Utensils className="w-4 h-4" /> },
  { value: 'decoration', label: 'Decoration', icon: <PartyPopper className="w-4 h-4" /> },
  { value: 'entertainment', label: 'Entertainment', icon: <Music className="w-4 h-4" /> },
  { value: 'photography', label: 'Photography', icon: <Camera className="w-4 h-4" /> },
  { value: 'transportation', label: 'Transportation', icon: <MapPin className="w-4 h-4" /> },
  { value: 'invitations', label: 'Invitations', icon: <Gift className="w-4 h-4" /> },
  { value: 'other', label: 'Other', icon: <Star className="w-4 h-4" /> },
];

// Column configurations for export
const eventColumns: ColumnConfig[] = [
  { key: 'id', header: 'Event ID', type: 'string' },
  { key: 'name', header: 'Event Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'venue', header: 'Venue', type: 'string' },
  { key: 'expectedGuests', header: 'Expected Guests', type: 'number' },
  { key: 'budget', header: 'Budget', type: 'currency' },
  { key: 'spentAmount', header: 'Spent', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'organizer', header: 'Organizer', type: 'string' },
];

const taskColumns: ColumnConfig[] = [
  { key: 'id', header: 'Task ID', type: 'string' },
  { key: 'title', header: 'Task', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Generate sample data
const generateSampleEvents = (): Event[] => {
  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  return [
    {
      id: 'event-1',
      name: 'Smith & Johnson Wedding',
      type: 'wedding',
      date: nextMonth.toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '23:00',
      venue: 'Grand Ballroom',
      address: '123 Event Center Way, City',
      expectedGuests: 150,
      confirmedGuests: 120,
      budget: 25000,
      spentAmount: 18500,
      status: 'confirmed',
      description: 'Beautiful garden wedding ceremony followed by indoor reception',
      notes: 'Bride allergic to lilies',
      organizer: 'Sarah Events',
      contactEmail: 'sarah@events.com',
      contactPhone: '+1 555-0101',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'event-2',
      name: 'Annual Tech Conference 2024',
      type: 'conference',
      date: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '18:00',
      venue: 'Convention Center',
      address: '456 Tech Blvd, Downtown',
      expectedGuests: 500,
      confirmedGuests: 350,
      budget: 75000,
      spentAmount: 42000,
      status: 'planning',
      description: 'Two-day technology conference with keynote speakers',
      notes: 'Need AV equipment and live streaming setup',
      organizer: 'TechEvents Inc',
      contactEmail: 'events@techevents.com',
      contactPhone: '+1 555-0102',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'event-3',
      name: 'Emily\'s 30th Birthday',
      type: 'birthday',
      date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '19:00',
      endTime: '01:00',
      venue: 'Skyline Rooftop',
      address: '789 High Rise Ave',
      expectedGuests: 50,
      confirmedGuests: 42,
      budget: 5000,
      spentAmount: 3200,
      status: 'confirmed',
      description: 'Surprise birthday party with rooftop views',
      notes: 'Theme: Great Gatsby',
      organizer: 'John Smith',
      contactEmail: 'john@email.com',
      contactPhone: '+1 555-0103',
      createdAt: new Date().toISOString(),
    },
  ];
};

const generateSampleTasks = (): Task[] => [
  {
    id: 'task-1',
    eventId: 'event-1',
    title: 'Confirm catering menu',
    category: 'catering',
    assignedTo: 'Sarah',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    status: 'in-progress',
    notes: 'Waiting for dietary requirements from guests',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    eventId: 'event-1',
    title: 'Book photographer',
    category: 'photography',
    assignedTo: 'Mike',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    status: 'completed',
    notes: 'Studio XYZ confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    eventId: 'event-2',
    title: 'Setup registration system',
    category: 'other',
    assignedTo: 'Tech Team',
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    status: 'pending',
    notes: 'Use Eventbrite integration',
    createdAt: new Date().toISOString(),
  },
];

export const EventPlannerTool: React.FC<EventPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize hooks for events and tasks with backend sync
  const eventsData = useToolData<Event>(
    'event-planner-events',
    generateSampleEvents(),
    eventColumns,
    { autoSave: true }
  );

  const tasksData = useToolData<Task>(
    'event-planner-tasks',
    generateSampleTasks(),
    taskColumns,
    { autoSave: true }
  );

  // Use data from hooks
  const events = eventsData.data;
  const tasks = tasksData.data;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EventType | ''>('');
  const [filterStatus, setFilterStatus] = useState<EventStatus | ''>('');

  // New event form
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    name: '',
    type: 'party',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '18:00',
    venue: '',
    address: '',
    expectedGuests: 50,
    confirmedGuests: 0,
    budget: 0,
    spentAmount: 0,
    status: 'planning',
    description: '',
    notes: '',
    organizer: '',
    contactEmail: '',
    contactPhone: '',
  });

  // New task form
  const [newTask, setNewTask] = useState<Partial<Task>>({
    eventId: '',
    title: '',
    category: 'other',
    assignedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'pending',
    notes: '',
  });

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description || params.eventName) {
        setNewEvent(prev => ({
          ...prev,
          name: params.eventName || params.title || prev.name,
          description: params.description || prev.description,
          venue: params.venue || prev.venue,
          expectedGuests: params.guestCount || prev.expectedGuests,
          budget: params.budget || prev.budget,
          date: params.date || prev.date,
        }));
        setShowEventForm(true);
        setActiveTab('events');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchQuery === '' ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === '' || event.type === filterType;
      const matchesStatus = filterStatus === '' || event.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, searchQuery, filterType, filterStatus]);

  // Event tasks
  const eventTasks = useMemo(() => {
    if (!selectedEventId) return tasks;
    return tasks.filter(task => task.eventId === selectedEventId);
  }, [tasks, selectedEventId]);

  // Analytics
  const analytics = useMemo(() => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter(e => e.status === 'planning' || e.status === 'confirmed').length;
    const totalBudget = events.reduce((sum, e) => sum + e.budget, 0);
    const totalSpent = events.reduce((sum, e) => sum + e.spentAmount, 0);
    const totalGuests = events.reduce((sum, e) => sum + e.expectedGuests, 0);
    const confirmedGuests = events.reduce((sum, e) => sum + e.confirmedGuests, 0);
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    return {
      totalEvents,
      upcomingEvents,
      totalBudget,
      totalSpent,
      budgetRemaining: totalBudget - totalSpent,
      totalGuests,
      confirmedGuests,
      pendingTasks,
      completedTasks,
      taskCompletionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
    };
  }, [events, tasks]);

  // CRUD handlers for Events
  const handleAddEvent = () => {
    if (!newEvent.name) return;

    const event: Event = {
      id: `event-${Date.now()}`,
      name: newEvent.name || '',
      type: (newEvent.type as EventType) || 'party',
      date: newEvent.date || new Date().toISOString().split('T')[0],
      startTime: newEvent.startTime || '10:00',
      endTime: newEvent.endTime || '18:00',
      venue: newEvent.venue || '',
      address: newEvent.address || '',
      expectedGuests: newEvent.expectedGuests || 0,
      confirmedGuests: newEvent.confirmedGuests || 0,
      budget: newEvent.budget || 0,
      spentAmount: newEvent.spentAmount || 0,
      status: (newEvent.status as EventStatus) || 'planning',
      description: newEvent.description || '',
      notes: newEvent.notes || '',
      organizer: newEvent.organizer || '',
      contactEmail: newEvent.contactEmail || '',
      contactPhone: newEvent.contactPhone || '',
      createdAt: new Date().toISOString(),
    };

    eventsData.addItem(event);
    setNewEvent({
      name: '',
      type: 'party',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '18:00',
      venue: '',
      address: '',
      expectedGuests: 50,
      confirmedGuests: 0,
      budget: 0,
      spentAmount: 0,
      status: 'planning',
      description: '',
      notes: '',
      organizer: '',
      contactEmail: '',
      contactPhone: '',
    });
    setShowEventForm(false);
    setIsPrefilled(false);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent) return;
    eventsData.updateItem(editingEvent.id, editingEvent);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event? All associated tasks will also be deleted.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      eventsData.deleteItem(id);
      // Delete associated tasks
      tasks.forEach(task => {
        if (task.eventId === id) {
          tasksData.deleteItem(task.id);
        }
      });
    }
  };

  // CRUD handlers for Tasks
  const handleAddTask = () => {
    if (!newTask.title || !newTask.eventId) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      eventId: newTask.eventId,
      title: newTask.title || '',
      category: (newTask.category as TaskCategory) || 'other',
      assignedTo: newTask.assignedTo || '',
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
      priority: newTask.priority as 'low' | 'medium' | 'high' || 'medium',
      status: newTask.status as 'pending' | 'in-progress' | 'completed' || 'pending',
      notes: newTask.notes || '',
      createdAt: new Date().toISOString(),
    };

    tasksData.addItem(task);
    setNewTask({
      eventId: selectedEventId || '',
      title: '',
      category: 'other',
      assignedTo: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'pending',
      notes: '',
    });
    setShowTaskForm(false);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    tasksData.updateItem(editingTask.id, editingTask);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      tasksData.deleteItem(id);
    }
  };

  const getStatusColor = (status: EventStatus) => {
    const colors = {
      planning: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      confirmed: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
      'in-progress': isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
      completed: isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-800',
      cancelled: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.planning;
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    const colors = {
      low: isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-800',
      medium: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
      high: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
    };
    return colors[priority];
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.eventPlanner.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.eventPlanner.eventPlanner', 'Event Planner')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.eventPlanner.planAndManageEventsTasks', 'Plan and manage events, tasks, and schedules')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="event-planner" toolName="Event Planner" />

              <SyncStatus
                isSynced={eventsData.isSynced}
                isSaving={eventsData.isSaving}
                lastSaved={eventsData.lastSaved}
                syncError={eventsData.syncError}
                onForceSync={eventsData.forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => eventsData.exportCSV({ filename: 'events' })}
                onExportExcel={() => eventsData.exportExcel({ filename: 'events' })}
                onExportJSON={() => eventsData.exportJSON({ filename: 'events' })}
                onExportPDF={() => eventsData.exportPDF({ filename: 'events', title: 'Events Report' })}
                onPrint={() => eventsData.print('Events')}
                onCopyToClipboard={() => eventsData.copyToClipboard('tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
              { id: 'tasks', label: 'Tasks', icon: <CheckCircle2 className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
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
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder={t('tools.eventPlanner.searchEvents', 'Search events...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as EventType | '')}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.eventPlanner.allTypes', 'All Types')}</option>
                  {EVENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as EventStatus | '')}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.eventPlanner.allStatus', 'All Status')}</option>
                  {EVENT_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.eventPlanner.addEvent', 'Add Event')}
                </button>
              </div>
            </div>

            {/* Events List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {EVENT_TYPES.find(t => t.value === event.type)?.icon}
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {event.name}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                      {EVENT_STATUSES.find(s => s.value === event.status)?.label}
                    </span>
                  </div>

                  <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()} | {event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.confirmedGuests}/{event.expectedGuests} guests confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>${event.spentAmount.toLocaleString()} / ${event.budget.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className="mt-3">
                    <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full rounded-full ${
                          event.spentAmount > event.budget ? 'bg-red-500' : t('tools.eventPlanner.bg0d9488', 'bg-[#0D9488]')
                        }`}
                        style={{ width: `${Math.min((event.spentAmount / event.budget) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedEventId(event.id);
                        setActiveTab('tasks');
                      }}
                      className={`flex-1 px-3 py-1.5 rounded text-sm ${
                        isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t('tools.eventPlanner.viewTasks', 'View Tasks')}
                    </button>
                    <button
                      onClick={() => setEditingEvent(event)}
                      className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.eventPlanner.noEventsFoundCreateYour', 'No events found. Create your first event!')}</p>
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.eventPlanner.allEvents', 'All Events')}</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>{event.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    setNewTask(prev => ({ ...prev, eventId: selectedEventId }));
                    setShowTaskForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.eventPlanner.addTask', 'Add Task')}
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {eventTasks.map(task => {
                const event = events.find(e => e.id === task.eventId);
                return (
                  <div
                    key={task.id}
                    className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() => {
                            tasksData.updateItem(task.id, {
                              status: task.status === 'completed' ? 'pending' : 'completed'
                            });
                          }}
                          className="w-5 h-5 rounded"
                        />
                        <div>
                          <h4 className={`font-medium ${
                            task.status === 'completed'
                              ? 'line-through text-gray-500'
                              : isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h4>
                          <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span>{event?.name}</span>
                            <span>|</span>
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            <span>|</span>
                            <span>{task.assignedTo || 'Unassigned'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          TASK_CATEGORIES.find(c => c.value === task.category)
                            ? isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            : ''
                        }`}>
                          {TASK_CATEGORIES.find(c => c.value === task.category)?.label}
                        </span>
                        <button
                          onClick={() => setEditingTask(task)}
                          className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {eventTasks.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.eventPlanner.noTasksFoundAddA', 'No tasks found. Add a task to get started!')}</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-[#0D9488]" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eventPlanner.totalEvents', 'Total Events')}</span>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalEvents}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {analytics.upcomingEvents} upcoming
              </p>
            </div>

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eventPlanner.totalBudget', 'Total Budget')}</span>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${analytics.totalBudget.toLocaleString()}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                ${analytics.budgetRemaining.toLocaleString()} remaining
              </p>
            </div>

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eventPlanner.totalGuests', 'Total Guests')}</span>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalGuests}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {analytics.confirmedGuests} confirmed
              </p>
            </div>

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eventPlanner.taskProgress', 'Task Progress')}</span>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.taskCompletionRate}%
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {analytics.completedTasks}/{analytics.completedTasks + analytics.pendingTasks} completed
              </p>
            </div>
          </div>
        )}

        {/* Event Form Modal */}
        {(showEventForm || editingEvent) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingEvent ? t('tools.eventPlanner.editEvent', 'Edit Event') : t('tools.eventPlanner.addNewEvent', 'Add New Event')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEventForm(false);
                      setEditingEvent(null);
                      setIsPrefilled(false);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.eventName', 'Event Name *')}
                    </label>
                    <input
                      type="text"
                      value={editingEvent?.name || newEvent.name}
                      onChange={(e) => editingEvent
                        ? setEditingEvent({ ...editingEvent, name: e.target.value })
                        : setNewEvent({ ...newEvent, name: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.eventType', 'Event Type')}
                    </label>
                    <select
                      value={editingEvent?.type || newEvent.type}
                      onChange={(e) => editingEvent
                        ? setEditingEvent({ ...editingEvent, type: e.target.value as EventType })
                        : setNewEvent({ ...newEvent, type: e.target.value as EventType })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {EVENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.status', 'Status')}
                    </label>
                    <select
                      value={editingEvent?.status || newEvent.status}
                      onChange={(e) => editingEvent
                        ? setEditingEvent({ ...editingEvent, status: e.target.value as EventStatus })
                        : setNewEvent({ ...newEvent, status: e.target.value as EventStatus })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {EVENT_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.date', 'Date')}
                    </label>
                    <input
                      type="date"
                      value={editingEvent?.date || newEvent.date}
                      onChange={(e) => editingEvent
                        ? setEditingEvent({ ...editingEvent, date: e.target.value })
                        : setNewEvent({ ...newEvent, date: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.eventPlanner.startTime', 'Start Time')}
                      </label>
                      <input
                        type="time"
                        value={editingEvent?.startTime || newEvent.startTime}
                        onChange={(e) => editingEvent
                          ? setEditingEvent({ ...editingEvent, startTime: e.target.value })
                          : setNewEvent({ ...newEvent, startTime: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.eventPlanner.endTime', 'End Time')}
                      </label>
                      <input
                        type="time"
                        value={editingEvent?.endTime || newEvent.endTime}
                        onChange={(e) => editingEvent
                          ? setEditingEvent({ ...editingEvent, endTime: e.target.value })
                          : setNewEvent({ ...newEvent, endTime: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.venue', 'Venue')}
                    </label>
                    <input
                      type="text"
                      value={editingEvent?.venue || newEvent.venue}
                      onChange={(e) => editingEvent
                        ? setEditingEvent({ ...editingEvent, venue: e.target.value })
                        : setNewEvent({ ...newEvent, venue: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.address', 'Address')}
                    </label>
                    <input
                      type="text"
                      value={editingEvent?.address || newEvent.address}
                      onChange={(e) => editingEvent
                        ? setEditingEvent({ ...editingEvent, address: e.target.value })
                        : setNewEvent({ ...newEvent, address: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.expectedGuests', 'Expected Guests')}
                    </label>
                    <input
                      type="number"
                      value={editingEvent?.expectedGuests || newEvent.expectedGuests}
                      onChange={(e) => editingEvent
                        ? setEditingEvent({ ...editingEvent, expectedGuests: parseInt(e.target.value) || 0 })
                        : setNewEvent({ ...newEvent, expectedGuests: parseInt(e.target.value) || 0 })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.budget', 'Budget ($)')}
                    </label>
                    <input
                      type="number"
                      value={editingEvent?.budget || newEvent.budget}
                      onChange={(e) => editingEvent
                        ? setEditingEvent({ ...editingEvent, budget: parseFloat(e.target.value) || 0 })
                        : setNewEvent({ ...newEvent, budget: parseFloat(e.target.value) || 0 })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.organizer', 'Organizer')}
                    </label>
                    <input
                      type="text"
                      value={editingEvent?.organizer || newEvent.organizer}
                      onChange={(e) => editingEvent
                        ? setEditingEvent({ ...editingEvent, organizer: e.target.value })
                        : setNewEvent({ ...newEvent, organizer: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.contactEmail', 'Contact Email')}
                    </label>
                    <input
                      type="email"
                      value={editingEvent?.contactEmail || newEvent.contactEmail}
                      onChange={(e) => editingEvent
                        ? setEditingEvent({ ...editingEvent, contactEmail: e.target.value })
                        : setNewEvent({ ...newEvent, contactEmail: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.description', 'Description')}
                    </label>
                    <textarea
                      value={editingEvent?.description || newEvent.description}
                      onChange={(e) => editingEvent
                        ? setEditingEvent({ ...editingEvent, description: e.target.value })
                        : setNewEvent({ ...newEvent, description: e.target.value })
                      }
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEventForm(false);
                      setEditingEvent(null);
                      setIsPrefilled(false);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.eventPlanner.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {editingEvent ? t('tools.eventPlanner.saveChanges', 'Save Changes') : t('tools.eventPlanner.createEvent', 'Create Event')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Form Modal */}
        {(showTaskForm || editingTask) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingTask ? t('tools.eventPlanner.editTask', 'Edit Task') : t('tools.eventPlanner.addNewTask', 'Add New Task')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowTaskForm(false);
                      setEditingTask(null);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.event', 'Event *')}
                    </label>
                    <select
                      value={editingTask?.eventId || newTask.eventId}
                      onChange={(e) => editingTask
                        ? setEditingTask({ ...editingTask, eventId: e.target.value })
                        : setNewTask({ ...newTask, eventId: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.eventPlanner.selectEvent', 'Select Event')}</option>
                      {events.map(event => (
                        <option key={event.id} value={event.id}>{event.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.taskTitle', 'Task Title *')}
                    </label>
                    <input
                      type="text"
                      value={editingTask?.title || newTask.title}
                      onChange={(e) => editingTask
                        ? setEditingTask({ ...editingTask, title: e.target.value })
                        : setNewTask({ ...newTask, title: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.eventPlanner.category', 'Category')}
                      </label>
                      <select
                        value={editingTask?.category || newTask.category}
                        onChange={(e) => editingTask
                          ? setEditingTask({ ...editingTask, category: e.target.value as TaskCategory })
                          : setNewTask({ ...newTask, category: e.target.value as TaskCategory })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {TASK_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.eventPlanner.priority', 'Priority')}
                      </label>
                      <select
                        value={editingTask?.priority || newTask.priority}
                        onChange={(e) => editingTask
                          ? setEditingTask({ ...editingTask, priority: e.target.value as 'low' | 'medium' | 'high' })
                          : setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="low">{t('tools.eventPlanner.low', 'Low')}</option>
                        <option value="medium">{t('tools.eventPlanner.medium', 'Medium')}</option>
                        <option value="high">{t('tools.eventPlanner.high', 'High')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.eventPlanner.assignedTo', 'Assigned To')}
                      </label>
                      <input
                        type="text"
                        value={editingTask?.assignedTo || newTask.assignedTo}
                        onChange={(e) => editingTask
                          ? setEditingTask({ ...editingTask, assignedTo: e.target.value })
                          : setNewTask({ ...newTask, assignedTo: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.eventPlanner.dueDate', 'Due Date')}
                      </label>
                      <input
                        type="date"
                        value={editingTask?.dueDate || newTask.dueDate}
                        onChange={(e) => editingTask
                          ? setEditingTask({ ...editingTask, dueDate: e.target.value })
                          : setNewTask({ ...newTask, dueDate: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventPlanner.notes', 'Notes')}
                    </label>
                    <textarea
                      value={editingTask?.notes || newTask.notes}
                      onChange={(e) => editingTask
                        ? setEditingTask({ ...editingTask, notes: e.target.value })
                        : setNewTask({ ...newTask, notes: e.target.value })
                      }
                      rows={2}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowTaskForm(false);
                      setEditingTask(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.eventPlanner.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={editingTask ? handleUpdateTask : handleAddTask}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {editingTask ? t('tools.eventPlanner.saveChanges2', 'Save Changes') : t('tools.eventPlanner.addTask2', 'Add Task')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default EventPlannerTool;
