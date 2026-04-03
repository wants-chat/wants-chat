'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Clock,
  Calendar,
  Award,
  Heart,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  User,
  Star,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface VolunteerManagerToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  skills: string[];
  availability: string;
  emergencyContact: string;
  emergencyPhone: string;
  startDate: string;
  status: 'active' | 'inactive' | 'pending';
  backgroundCheckStatus: 'pending' | 'approved' | 'expired' | 'not_required';
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

interface VolunteerHours {
  id: string;
  volunteerId: string;
  eventId?: string;
  eventName: string;
  date: string;
  hours: number;
  description: string;
  createdAt?: string;
}

interface VolunteerEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  volunteersNeeded: number;
  assignedVolunteers: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt?: string;
}

interface VolunteerAward {
  id: string;
  volunteerId: string;
  title: string;
  description: string;
  dateAwarded: string;
}

type TabType = 'volunteers' | 'hours' | 'events' | 'awards';
type StatusFilter = 'all' | 'active' | 'inactive' | 'pending';

const SKILLS_OPTIONS = [
  'Administrative',
  'Event Planning',
  'Fundraising',
  'Marketing',
  'Social Media',
  'Teaching',
  'Mentoring',
  'Healthcare',
  'Legal',
  'IT/Technical',
  'Construction',
  'Driving',
  'Cooking',
  'Photography',
  'Translation',
  'Customer Service',
  'Other',
];

const AVAILABILITY_OPTIONS = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Weekend Evenings',
  'Flexible',
  'On-Call',
];

// Column configuration for volunteer data export
const VOLUNTEER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'skills', header: 'Skills', type: 'string', format: (v) => Array.isArray(v) ? v.join(', ') : String(v || '') },
  { key: 'availability', header: 'Availability', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'backgroundCheckStatus', header: 'Background Check', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'emergencyContact', header: 'Emergency Contact', type: 'string' },
  { key: 'emergencyPhone', header: 'Emergency Phone', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

export const VolunteerManagerTool: React.FC<VolunteerManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence of volunteers
  const {
    data: volunteers,
    setData: setVolunteers,
    addItem: addVolunteer,
    updateItem: updateVolunteer,
    deleteItem: deleteVolunteerItem,
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
  } = useToolData<Volunteer>('volunteer-manager', [], VOLUNTEER_COLUMNS);

  // State for other data (hours, events, awards) - stored in localStorage
  const [activeTab, setActiveTab] = useState<TabType>('volunteers');
  const [hours, setHours] = useState<VolunteerHours[]>([]);
  const [events, setEvents] = useState<VolunteerEvent[]>([]);
  const [awards, setAwards] = useState<VolunteerAward[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Modal states
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [editingEvent, setEditingEvent] = useState<VolunteerEvent | null>(null);

  // Form states
  const [volunteerForm, setVolunteerForm] = useState<Partial<Volunteer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    skills: [],
    availability: '',
    emergencyContact: '',
    emergencyPhone: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    backgroundCheckStatus: 'pending',
    notes: '',
  });

  const [hoursForm, setHoursForm] = useState<Partial<VolunteerHours>>({
    volunteerId: '',
    eventName: '',
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    description: '',
  });

  const [eventForm, setEventForm] = useState<Partial<VolunteerEvent>>({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    volunteersNeeded: 1,
    assignedVolunteers: [],
    status: 'upcoming',
  });

  const [awardForm, setAwardForm] = useState<Partial<VolunteerAward>>({
    volunteerId: '',
    title: '',
    description: '',
    dateAwarded: new Date().toISOString().split('T')[0],
  });

  // Load secondary data (hours, events, awards) from localStorage on mount
  useEffect(() => {
    const loadSecondaryData = () => {
      try {
        const savedHours = localStorage.getItem('volunteer-manager-hours');
        const savedEvents = localStorage.getItem('volunteer-manager-events');
        const savedAwards = localStorage.getItem('volunteer-manager-awards');

        if (savedHours) setHours(JSON.parse(savedHours));
        if (savedEvents) setEvents(JSON.parse(savedEvents));
        if (savedAwards) setAwards(JSON.parse(savedAwards));
      } catch (e) {
        console.error('Failed to load secondary volunteer data:', e);
      }
    };
    loadSecondaryData();
  }, []);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.firstName || params.lastName || params.email || params.phone) {
        setVolunteerForm(prev => ({
          ...prev,
          name: [params.firstName, params.lastName].filter(Boolean).join(' ') || prev.name,
          email: params.email || prev.email,
          phone: params.phone || prev.phone,
          address: params.address || prev.address,
        }));
        setShowVolunteerModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Save secondary data (hours, events, awards) to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('volunteer-manager-hours', JSON.stringify(hours));
  }, [hours]);

  useEffect(() => {
    localStorage.setItem('volunteer-manager-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('volunteer-manager-awards', JSON.stringify(awards));
  }, [awards]);

  // Computed values
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [volunteers, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const hoursThisMonth = hours
      .filter(h => new Date(h.date) >= thisMonth)
      .reduce((sum, h) => sum + h.hours, 0);

    return {
      totalVolunteers: volunteers.length,
      activeVolunteers: volunteers.filter(v => v.status === 'active').length,
      pendingVolunteers: volunteers.filter(v => v.status === 'pending').length,
      hoursThisMonth,
      totalHours: hours.reduce((sum, h) => sum + h.hours, 0),
      upcomingEvents: events.filter(e => e.status === 'upcoming').length,
      totalAwards: awards.length,
    };
  }, [volunteers, hours, events, awards]);

  // CRUD operations for Volunteers
  const handleSaveVolunteer = () => {
    if (!volunteerForm.name || !volunteerForm.email) {
      setError('Name and email are required');
      return;
    }

    if (editingVolunteer) {
      updateVolunteer(editingVolunteer.id, {
        name: volunteerForm.name || '',
        email: volunteerForm.email || '',
        phone: volunteerForm.phone || '',
        address: volunteerForm.address || '',
        skills: volunteerForm.skills || [],
        availability: volunteerForm.availability || '',
        emergencyContact: volunteerForm.emergencyContact || '',
        emergencyPhone: volunteerForm.emergencyPhone || '',
        startDate: volunteerForm.startDate || new Date().toISOString().split('T')[0],
        status: volunteerForm.status || 'pending',
        backgroundCheckStatus: volunteerForm.backgroundCheckStatus || 'pending',
        notes: volunteerForm.notes || '',
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newVolunteer: Volunteer = {
        id: `vol-${Date.now()}`,
        name: volunteerForm.name || '',
        email: volunteerForm.email || '',
        phone: volunteerForm.phone || '',
        address: volunteerForm.address || '',
        skills: volunteerForm.skills || [],
        availability: volunteerForm.availability || '',
        emergencyContact: volunteerForm.emergencyContact || '',
        emergencyPhone: volunteerForm.emergencyPhone || '',
        startDate: volunteerForm.startDate || new Date().toISOString().split('T')[0],
        status: volunteerForm.status || 'pending',
        backgroundCheckStatus: volunteerForm.backgroundCheckStatus || 'pending',
        notes: volunteerForm.notes || '',
        createdAt: new Date().toISOString(),
      };
      addVolunteer(newVolunteer);
    }
    resetVolunteerForm();
  };

  const handleDeleteVolunteer = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Volunteer',
      message: 'Are you sure you want to delete this volunteer?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    deleteVolunteerItem(id);
    // Also remove related hours and awards
    setHours(prev => prev.filter(h => h.volunteerId !== id));
    setAwards(prev => prev.filter(a => a.volunteerId !== id));
  };

  const resetVolunteerForm = () => {
    setVolunteerForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      skills: [],
      availability: '',
      emergencyContact: '',
      emergencyPhone: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      backgroundCheckStatus: 'pending',
      notes: '',
    });
    setEditingVolunteer(null);
    setShowVolunteerModal(false);
    setError(null);
  };

  // CRUD operations for Hours
  const handleSaveHours = () => {
    if (!hoursForm.volunteerId || !hoursForm.hours) {
      setError('Volunteer and hours are required');
      return;
    }

    const newHours: VolunteerHours = {
      id: `hrs-${Date.now()}`,
      volunteerId: hoursForm.volunteerId || '',
      eventId: hoursForm.eventId,
      eventName: hoursForm.eventName || '',
      date: hoursForm.date || new Date().toISOString().split('T')[0],
      hours: hoursForm.hours || 0,
      description: hoursForm.description || '',
      createdAt: new Date().toISOString(),
    };

    setHours(prev => [...prev, newHours]);

    setHoursForm({
      volunteerId: '',
      eventName: '',
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      description: '',
    });
    setShowHoursModal(false);
    setError(null);
  };

  const handleDeleteHours = (id: string) => {
    setHours(prev => prev.filter(h => h.id !== id));
  };

  // CRUD operations for Events
  const handleSaveEvent = () => {
    if (!eventForm.name || !eventForm.date) {
      setError('Event name and date are required');
      return;
    }

    if (editingEvent) {
      const updated = { ...editingEvent, ...eventForm };
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? updated as VolunteerEvent : e));
    } else {
      const newEvent: VolunteerEvent = {
        id: `evt-${Date.now()}`,
        name: eventForm.name || '',
        description: eventForm.description || '',
        date: eventForm.date || '',
        startTime: eventForm.startTime || '',
        endTime: eventForm.endTime || '',
        location: eventForm.location || '',
        volunteersNeeded: eventForm.volunteersNeeded || 1,
        assignedVolunteers: eventForm.assignedVolunteers || [],
        status: eventForm.status || 'upcoming',
        createdAt: new Date().toISOString(),
      };
      setEvents(prev => [...prev, newEvent]);
    }
    resetEventForm();
  };

  const handleDeleteEvent = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const resetEventForm = () => {
    setEventForm({
      name: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      volunteersNeeded: 1,
      assignedVolunteers: [],
      status: 'upcoming',
    });
    setEditingEvent(null);
    setShowEventModal(false);
    setError(null);
  };

  // CRUD operations for Awards
  const handleSaveAward = () => {
    if (!awardForm.volunteerId || !awardForm.title) {
      setError('Volunteer and award title are required');
      return;
    }

    const newAward: VolunteerAward = {
      id: `awd-${Date.now()}`,
      volunteerId: awardForm.volunteerId || '',
      title: awardForm.title || '',
      description: awardForm.description || '',
      dateAwarded: awardForm.dateAwarded || new Date().toISOString().split('T')[0],
    };

    setAwards(prev => [...prev, newAward]);
    setAwardForm({
      volunteerId: '',
      title: '',
      description: '',
      dateAwarded: new Date().toISOString().split('T')[0],
    });
    setShowAwardModal(false);
    setError(null);
  };

  const handleDeleteAward = (id: string) => {
    setAwards(prev => prev.filter(a => a.id !== id));
  };

  // Toggle volunteer assignment to event
  const toggleVolunteerAssignment = (eventId: string, volunteerId: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const assigned = e.assignedVolunteers.includes(volunteerId)
          ? e.assignedVolunteers.filter(id => id !== volunteerId)
          : [...e.assignedVolunteers, volunteerId];
        return { ...e, assignedVolunteers: assigned };
      }
      return e;
    }));
  };

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    setVolunteerForm(prev => ({
      ...prev,
      skills: prev.skills?.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...(prev.skills || []), skill],
    }));
  };


  // Get volunteer name by ID
  const getVolunteerName = (id: string) => {
    return volunteers.find(v => v.id === id)?.name || 'Unknown';
  };

  // Styling classes
  const inputClass = `w-full px-4 py-2.5 border rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;

  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-violet-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors font-medium ${
    isDark
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  }`;

  const buttonDanger = `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm bg-red-500/10 hover:bg-red-500/20 text-red-500`;

  const tabClass = (isActive: boolean) => `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
    isActive
      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
      : isDark
      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/10 text-green-500',
      inactive: 'bg-gray-500/10 text-gray-500',
      pending: 'bg-yellow-500/10 text-yellow-500',
      approved: 'bg-green-500/10 text-green-500',
      expired: 'bg-red-500/10 text-red-500',
      not_required: 'bg-gray-500/10 text-gray-500',
      upcoming: 'bg-blue-500/10 text-blue-500',
      ongoing: 'bg-violet-500/10 text-violet-500',
      completed: 'bg-green-500/10 text-green-500',
      cancelled: 'bg-red-500/10 text-red-500',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 rounded-xl border border-violet-500/20">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-sm text-violet-500 font-medium">{t('tools.volunteerManager.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.volunteerManager.volunteerManager', 'Volunteer Manager')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.volunteerManager.nonProfitVolunteerManagementTool', 'Non-profit volunteer management tool')}
                  </p>
                </div>
              </div>
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cardClass}>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.volunteerManager.totalVolunteers', 'Total Volunteers')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalVolunteers}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={cardClass}>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.volunteerManager.active', 'Active')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.activeVolunteers}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={cardClass}>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.volunteerManager.hoursThisMonth', 'Hours This Month')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.hoursThisMonth}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={cardClass}>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.volunteerManager.upcomingEvents', 'Upcoming Events')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.upcomingEvents}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={cardClass}>
          <div className="p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveTab('volunteers')} className={tabClass(activeTab === 'volunteers')}>
                <Users className="w-4 h-4" />
                {t('tools.volunteerManager.volunteers', 'Volunteers')}
              </button>
              <button onClick={() => setActiveTab('hours')} className={tabClass(activeTab === 'hours')}>
                <Clock className="w-4 h-4" />
                {t('tools.volunteerManager.hoursLog', 'Hours Log')}
              </button>
              <button onClick={() => setActiveTab('events')} className={tabClass(activeTab === 'events')}>
                <Calendar className="w-4 h-4" />
                {t('tools.volunteerManager.events', 'Events')}
              </button>
              <button onClick={() => setActiveTab('awards')} className={tabClass(activeTab === 'awards')}>
                <Award className="w-4 h-4" />
                {t('tools.volunteerManager.recognition', 'Recognition')}
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                {error}
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Volunteers Tab */}
            {activeTab === 'volunteers' && (
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('tools.volunteerManager.searchVolunteers', 'Search volunteers...')}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className={`${inputClass} w-full sm:w-48`}
                  >
                    <option value="all">{t('tools.volunteerManager.allStatus', 'All Status')}</option>
                    <option value="active">{t('tools.volunteerManager.active2', 'Active')}</option>
                    <option value="inactive">{t('tools.volunteerManager.inactive', 'Inactive')}</option>
                    <option value="pending">{t('tools.volunteerManager.pending', 'Pending')}</option>
                  </select>
                  <button onClick={() => setShowVolunteerModal(true)} className={buttonPrimary}>
                    <Plus className="w-4 h-4" />
                    {t('tools.volunteerManager.addVolunteer', 'Add Volunteer')}
                  </button>
                </div>

                {/* Volunteers List */}
                {filteredVolunteers.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.volunteerManager.noVolunteersFound', 'No volunteers found')}</p>
                    <p className="text-sm mt-1">{t('tools.volunteerManager.addYourFirstVolunteerTo', 'Add your first volunteer to get started')}</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredVolunteers.map((volunteer) => (
                      <div
                        key={volunteer.id}
                        className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <User className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {volunteer.name}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(volunteer.status)}`}>
                                  {volunteer.status}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(volunteer.backgroundCheckStatus)}`}>
                                  BG: {volunteer.backgroundCheckStatus.replace('_', ' ')}
                                </span>
                              </div>
                              <div className={`flex flex-wrap gap-3 mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {volunteer.email}
                                </span>
                                {volunteer.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {volunteer.phone}
                                  </span>
                                )}
                              </div>
                              {volunteer.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {volunteer.skills.slice(0, 3).map((skill) => (
                                    <span
                                      key={skill}
                                      className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {volunteer.skills.length > 3 && (
                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                      +{volunteer.skills.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingVolunteer(volunteer);
                                setVolunteerForm(volunteer);
                                setShowVolunteerModal(true);
                              }}
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteVolunteer(volunteer.id)} className={buttonDanger}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hours Tab */}
            {activeTab === 'hours' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Total Hours Logged: <span className="text-violet-500">{stats.totalHours}</span>
                    </h3>
                  </div>
                  <button onClick={() => setShowHoursModal(true)} className={buttonPrimary}>
                    <Plus className="w-4 h-4" />
                    {t('tools.volunteerManager.logHours', 'Log Hours')}
                  </button>
                </div>

                {hours.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.volunteerManager.noHoursLoggedYet', 'No hours logged yet')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.volunteerManager.volunteer', 'Volunteer')}</th>
                          <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.volunteerManager.eventActivity', 'Event/Activity')}</th>
                          <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.volunteerManager.date', 'Date')}</th>
                          <th className={`text-right py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.volunteerManager.hours', 'Hours')}</th>
                          <th className={`text-right py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.volunteerManager.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hours.map((h) => (
                          <tr key={h.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                            <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {getVolunteerName(h.volunteerId)}
                            </td>
                            <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {h.eventName || 'General'}
                            </td>
                            <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {new Date(h.date).toLocaleDateString()}
                            </td>
                            <td className={`py-3 px-4 text-right font-semibold text-violet-500`}>
                              {h.hours}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button onClick={() => handleDeleteHours(h.id)} className={buttonDanger}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => setShowEventModal(true)} className={buttonPrimary}>
                    <Plus className="w-4 h-4" />
                    {t('tools.volunteerManager.createEvent', 'Create Event')}
                  </button>
                </div>

                {events.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.volunteerManager.noEventsCreatedYet', 'No events created yet')}</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {event.name}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(event.status)}`}>
                                {event.status}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {event.description}
                            </p>
                            <div className={`flex flex-wrap gap-4 mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                              {event.startTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {event.startTime} - {event.endTime}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {event.assignedVolunteers.length}/{event.volunteersNeeded} volunteers
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingEvent(event);
                                setEventForm(event);
                                setShowEventModal(true);
                              }}
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteEvent(event.id)} className={buttonDanger}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {/* Assigned volunteers */}
                        {event.assignedVolunteers.length > 0 && (
                          <div className="mt-3 pt-3 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}">
                            <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {t('tools.volunteerManager.assignedVolunteers', 'Assigned Volunteers:')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {event.assignedVolunteers.map((vId) => (
                                <span
                                  key={vId}
                                  className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700'}`}
                                >
                                  {getVolunteerName(vId)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Awards Tab */}
            {activeTab === 'awards' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => setShowAwardModal(true)} className={buttonPrimary}>
                    <Plus className="w-4 h-4" />
                    {t('tools.volunteerManager.addRecognition2', 'Add Recognition')}
                  </button>
                </div>

                {awards.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.volunteerManager.noRecognitionAwardsYet', 'No recognition awards yet')}</p>
                    <p className="text-sm mt-1">{t('tools.volunteerManager.recognizeYourVolunteersForTheir', 'Recognize your volunteers for their contributions')}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {awards.map((award) => (
                      <div
                        key={award.id}
                        className={`p-4 rounded-xl border ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-violet-500/30' : 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg">
                              <Star className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {award.title}
                              </h4>
                              <p className={`text-sm ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                                {getVolunteerName(award.volunteerId)}
                              </p>
                              {award.description && (
                                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {award.description}
                                </p>
                              )}
                              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {new Date(award.dateAwarded).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteAward(award.id)} className={buttonDanger}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Volunteer Modal */}
        {showVolunteerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
              <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingVolunteer ? t('tools.volunteerManager.editVolunteer', 'Edit Volunteer') : t('tools.volunteerManager.addNewVolunteer', 'Add New Volunteer')}
                  </h2>
                  <button onClick={resetVolunteerForm} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.fullName', 'Full Name *')}</label>
                    <input
                      type="text"
                      value={volunteerForm.name || ''}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                      placeholder={t('tools.volunteerManager.johnDoe', 'John Doe')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.email', 'Email *')}</label>
                    <input
                      type="email"
                      value={volunteerForm.email || ''}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                      placeholder={t('tools.volunteerManager.johnExampleCom', 'john@example.com')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={volunteerForm.phone || ''}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                      placeholder="(555) 555-5555"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.startDate', 'Start Date')}</label>
                    <input
                      type="date"
                      value={volunteerForm.startDate || ''}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, startDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.address', 'Address')}</label>
                  <input
                    type="text"
                    value={volunteerForm.address || ''}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, address: e.target.value })}
                    placeholder={t('tools.volunteerManager.123MainStCityState', '123 Main St, City, State ZIP')}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.status', 'Status')}</label>
                    <select
                      value={volunteerForm.status || 'pending'}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, status: e.target.value as Volunteer['status'] })}
                      className={inputClass}
                    >
                      <option value="pending">{t('tools.volunteerManager.pending2', 'Pending')}</option>
                      <option value="active">{t('tools.volunteerManager.active3', 'Active')}</option>
                      <option value="inactive">{t('tools.volunteerManager.inactive2', 'Inactive')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.backgroundCheck', 'Background Check')}</label>
                    <select
                      value={volunteerForm.backgroundCheckStatus || 'pending'}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, backgroundCheckStatus: e.target.value as Volunteer['backgroundCheckStatus'] })}
                      className={inputClass}
                    >
                      <option value="pending">{t('tools.volunteerManager.pending3', 'Pending')}</option>
                      <option value="approved">{t('tools.volunteerManager.approved', 'Approved')}</option>
                      <option value="expired">{t('tools.volunteerManager.expired', 'Expired')}</option>
                      <option value="not_required">{t('tools.volunteerManager.notRequired', 'Not Required')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.skills', 'Skills')}</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS_OPTIONS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          volunteerForm.skills?.includes(skill)
                            ? 'bg-violet-500 text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.availability', 'Availability')}</label>
                  <select
                    value={volunteerForm.availability || ''}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, availability: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">{t('tools.volunteerManager.selectAvailability', 'Select availability...')}</option>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.emergencyContactName', 'Emergency Contact Name')}</label>
                    <input
                      type="text"
                      value={volunteerForm.emergencyContact || ''}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, emergencyContact: e.target.value })}
                      placeholder={t('tools.volunteerManager.emergencyContactName2', 'Emergency contact name')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.emergencyContactPhone', 'Emergency Contact Phone')}</label>
                    <input
                      type="tel"
                      value={volunteerForm.emergencyPhone || ''}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, emergencyPhone: e.target.value })}
                      placeholder="(555) 555-5555"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.notes', 'Notes')}</label>
                  <textarea
                    value={volunteerForm.notes || ''}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, notes: e.target.value })}
                    placeholder={t('tools.volunteerManager.anyAdditionalNotes', 'Any additional notes...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex gap-3">
                  <button onClick={handleSaveVolunteer} className={`${buttonPrimary} flex-1 justify-center`}>
                    <Save className="w-4 h-4" />
                    {editingVolunteer ? t('tools.volunteerManager.updateVolunteer', 'Update Volunteer') : t('tools.volunteerManager.addVolunteer2', 'Add Volunteer')}
                  </button>
                  <button onClick={resetVolunteerForm} className={buttonSecondary}>
                    {t('tools.volunteerManager.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hours Modal */}
        {showHoursModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-md rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
              <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.volunteerManager.logVolunteerHours', 'Log Volunteer Hours')}</h2>
                  <button onClick={() => setShowHoursModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.volunteer2', 'Volunteer *')}</label>
                  <select
                    value={hoursForm.volunteerId || ''}
                    onChange={(e) => setHoursForm({ ...hoursForm, volunteerId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">{t('tools.volunteerManager.selectVolunteer', 'Select volunteer...')}</option>
                    {volunteers.filter(v => v.status === 'active').map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.eventActivity2', 'Event/Activity')}</label>
                  <input
                    type="text"
                    value={hoursForm.eventName || ''}
                    onChange={(e) => setHoursForm({ ...hoursForm, eventName: e.target.value })}
                    placeholder={t('tools.volunteerManager.eventOrActivityName', 'Event or activity name')}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.date2', 'Date')}</label>
                    <input
                      type="date"
                      value={hoursForm.date || ''}
                      onChange={(e) => setHoursForm({ ...hoursForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.hours2', 'Hours *')}</label>
                    <input
                      type="number"
                      value={hoursForm.hours || ''}
                      onChange={(e) => setHoursForm({ ...hoursForm, hours: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                      step="0.5"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.description', 'Description')}</label>
                  <textarea
                    value={hoursForm.description || ''}
                    onChange={(e) => setHoursForm({ ...hoursForm, description: e.target.value })}
                    placeholder={t('tools.volunteerManager.whatDidTheVolunteerWork', 'What did the volunteer work on?')}
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex gap-3">
                  <button onClick={handleSaveHours} className={`${buttonPrimary} flex-1 justify-center`}>
                    <Save className="w-4 h-4" />
                    {t('tools.volunteerManager.logHours2', 'Log Hours')}
                  </button>
                  <button onClick={() => setShowHoursModal(false)} className={buttonSecondary}>
                    {t('tools.volunteerManager.cancel2', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
              <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingEvent ? t('tools.volunteerManager.editEvent', 'Edit Event') : t('tools.volunteerManager.createEvent2', 'Create Event')}
                  </h2>
                  <button onClick={resetEventForm} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.eventName', 'Event Name *')}</label>
                  <input
                    type="text"
                    value={eventForm.name || ''}
                    onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                    placeholder={t('tools.volunteerManager.communityFoodDrive', 'Community Food Drive')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.description2', 'Description')}</label>
                  <textarea
                    value={eventForm.description || ''}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder={t('tools.volunteerManager.eventDetails', 'Event details...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.date3', 'Date *')}</label>
                    <input
                      type="date"
                      value={eventForm.date || ''}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.startTime', 'Start Time')}</label>
                    <input
                      type="time"
                      value={eventForm.startTime || ''}
                      onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.endTime', 'End Time')}</label>
                    <input
                      type="time"
                      value={eventForm.endTime || ''}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.location', 'Location')}</label>
                  <input
                    type="text"
                    value={eventForm.location || ''}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder={t('tools.volunteerManager.123MainStCityState2', '123 Main St, City, State')}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.volunteersNeeded', 'Volunteers Needed')}</label>
                    <input
                      type="number"
                      value={eventForm.volunteersNeeded || 1}
                      onChange={(e) => setEventForm({ ...eventForm, volunteersNeeded: parseInt(e.target.value) || 1 })}
                      min="1"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.status2', 'Status')}</label>
                    <select
                      value={eventForm.status || 'upcoming'}
                      onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as VolunteerEvent['status'] })}
                      className={inputClass}
                    >
                      <option value="upcoming">{t('tools.volunteerManager.upcoming', 'Upcoming')}</option>
                      <option value="ongoing">{t('tools.volunteerManager.ongoing', 'Ongoing')}</option>
                      <option value="completed">{t('tools.volunteerManager.completed', 'Completed')}</option>
                      <option value="cancelled">{t('tools.volunteerManager.cancelled', 'Cancelled')}</option>
                    </select>
                  </div>
                </div>
                {editingEvent && (
                  <div>
                    <label className={labelClass}>{t('tools.volunteerManager.assignVolunteers', 'Assign Volunteers')}</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {volunteers.filter(v => v.status === 'active').map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => toggleVolunteerAssignment(editingEvent.id, v.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            eventForm.assignedVolunteers?.includes(v.id)
                              ? 'bg-violet-500 text-white'
                              : isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex gap-3">
                  <button onClick={handleSaveEvent} className={`${buttonPrimary} flex-1 justify-center`}>
                    <Save className="w-4 h-4" />
                    {editingEvent ? t('tools.volunteerManager.updateEvent', 'Update Event') : t('tools.volunteerManager.createEvent3', 'Create Event')}
                  </button>
                  <button onClick={resetEventForm} className={buttonSecondary}>
                    {t('tools.volunteerManager.cancel3', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Award Modal */}
        {showAwardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-md rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
              <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.volunteerManager.addRecognition', 'Add Recognition')}</h2>
                  <button onClick={() => setShowAwardModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.volunteer3', 'Volunteer *')}</label>
                  <select
                    value={awardForm.volunteerId || ''}
                    onChange={(e) => setAwardForm({ ...awardForm, volunteerId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">{t('tools.volunteerManager.selectVolunteer2', 'Select volunteer...')}</option>
                    {volunteers.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.awardTitle', 'Award Title *')}</label>
                  <input
                    type="text"
                    value={awardForm.title || ''}
                    onChange={(e) => setAwardForm({ ...awardForm, title: e.target.value })}
                    placeholder={t('tools.volunteerManager.volunteerOfTheMonth', 'Volunteer of the Month')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.description3', 'Description')}</label>
                  <textarea
                    value={awardForm.description || ''}
                    onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
                    placeholder={t('tools.volunteerManager.whyIsThisVolunteerBeing', 'Why is this volunteer being recognized?')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.volunteerManager.dateAwarded', 'Date Awarded')}</label>
                  <input
                    type="date"
                    value={awardForm.dateAwarded || ''}
                    onChange={(e) => setAwardForm({ ...awardForm, dateAwarded: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex gap-3">
                  <button onClick={handleSaveAward} className={`${buttonPrimary} flex-1 justify-center`}>
                    <Award className="w-4 h-4" />
                    {t('tools.volunteerManager.addRecognition3', 'Add Recognition')}
                  </button>
                  <button onClick={() => setShowAwardModal(false)} className={buttonSecondary}>
                    {t('tools.volunteerManager.cancel4', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.volunteerManager.aboutVolunteerManager', 'About Volunteer Manager')}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            A comprehensive tool for non-profit organizations to manage volunteers, track hours, schedule events, and recognize contributions.
            All data is stored locally and synced with the server when available.
          </p>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default VolunteerManagerTool;
