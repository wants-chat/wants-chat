'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Printer,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Truck,
  PartyPopper,
  Music,
  Cake,
  Camera,
  Heart,
  MessageSquare,
  Timer,
  FileText,
  Download,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Types
interface TimelineEntry {
  id: string;
  time: string;
  endTime: string;
  activity: string;
  duration: number; // in minutes
  responsibleParty: string;
  location: string;
  category: 'setup' | 'vendor' | 'guest' | 'ceremony' | 'reception' | 'breakdown' | 'key-moment' | 'buffer' | 'other';
  notes: string;
  isKeyMoment: boolean;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  bufferTime: number; // buffer time after this activity in minutes
}

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  isEmergency: boolean;
}

interface EventDetails {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  venueAddress: string;
  client: string;
  clientPhone: string;
  clientEmail: string;
  eventType: string;
  guestCount: number;
  notes: string;
}

type TabType = 'details' | 'timeline' | 'contacts' | 'runsheet';

const defaultEventDetails: EventDetails = {
  name: '',
  date: '',
  startTime: '',
  endTime: '',
  venue: '',
  venueAddress: '',
  client: '',
  clientPhone: '',
  clientEmail: '',
  eventType: 'wedding',
  guestCount: 0,
  notes: '',
};

const categoryColors: Record<TimelineEntry['category'], string> = {
  'setup': 'bg-blue-500',
  'vendor': 'bg-purple-500',
  'guest': 'bg-green-500',
  'ceremony': 'bg-pink-500',
  'reception': 'bg-orange-500',
  'breakdown': 'bg-gray-500',
  'key-moment': 'bg-yellow-500',
  'buffer': 'bg-slate-400',
  'other': 'bg-teal-500',
};

const categoryLabels: Record<TimelineEntry['category'], string> = {
  'setup': 'Setup',
  'vendor': 'Vendor Arrival',
  'guest': 'Guest Schedule',
  'ceremony': 'Ceremony',
  'reception': 'Reception',
  'breakdown': 'Breakdown',
  'key-moment': 'Key Moment',
  'buffer': 'Buffer Time',
  'other': 'Other',
};

const categoryIcons: Record<TimelineEntry['category'], React.ReactNode> = {
  'setup': <Truck className="w-4 h-4" />,
  'vendor': <Users className="w-4 h-4" />,
  'guest': <User className="w-4 h-4" />,
  'ceremony': <Heart className="w-4 h-4" />,
  'reception': <PartyPopper className="w-4 h-4" />,
  'breakdown': <RefreshCw className="w-4 h-4" />,
  'key-moment': <Star className="w-4 h-4" />,
  'buffer': <Timer className="w-4 h-4" />,
  'other': <Calendar className="w-4 h-4" />,
};

const statusColors: Record<TimelineEntry['status'], string> = {
  'pending': 'bg-gray-400',
  'in-progress': 'bg-blue-500',
  'completed': 'bg-green-500',
  'delayed': 'bg-red-500',
};

// Column configuration for export
const TIMELINE_COLUMNS: ColumnConfig[] = [
  { key: 'time', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'activity', header: 'Activity', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'responsibleParty', header: 'Responsible Party', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'isKeyMoment', header: 'Key Moment', type: 'boolean' },
  { key: 'bufferTime', header: 'Buffer (min)', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const CONTACTS_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'role', header: 'Role', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'isEmergency', header: 'Emergency Contact', type: 'boolean' },
];

interface EventTimelineToolProps {
  uiConfig?: UIConfig;
}

export const EventTimelineTool: React.FC<EventTimelineToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [eventDetails, setEventDetails] = useState<EventDetails>(defaultEventDetails);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use the useToolData hook for timeline entries (backend persistence)
  const {
    data: timelineEntries,
    setData: setTimelineEntries,
    addItem: addTimelineEntry,
    updateItem: updateTimelineEntry,
    deleteItem: deleteTimelineEntry,
    exportCSV: exportTimelineCSV,
    exportExcel: exportTimelineExcel,
    exportJSON: exportTimelineJSON,
    exportPDF: exportTimelinePDF,
    importCSV: importTimelineCSV,
    importJSON: importTimelineJSON,
    copyToClipboard: copyTimelineToClipboard,
    print: printTimeline,
    isLoading: isTimelineLoading,
    isSaving: isTimelineSaving,
    isSynced: isTimelineSynced,
    lastSaved: timelineLastSaved,
    syncError: timelineSyncError,
    forceSync: forceTimelineSync,
  } = useToolData<TimelineEntry>('event-timeline-entries', [], TIMELINE_COLUMNS);

  // Use the useToolData hook for contacts (backend persistence)
  const {
    data: contacts,
    setData: setContacts,
    addItem: addContactItem,
    updateItem: updateContactItem,
    deleteItem: deleteContactItem,
    exportCSV: exportContactsCSV,
    exportExcel: exportContactsExcel,
    exportJSON: exportContactsJSON,
    exportPDF: exportContactsPDF,
    importCSV: importContactsCSV,
    importJSON: importContactsJSON,
    isLoading: isContactsLoading,
    isSaving: isContactsSaving,
    isSynced: isContactsSynced,
    lastSaved: contactsLastSaved,
    syncError: contactsSyncError,
    forceSync: forceContactsSync,
  } = useToolData<Contact>('event-timeline-contacts', [], CONTACTS_COLUMNS);

  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Combined loading and sync states
  const isLoading = isTimelineLoading || isContactsLoading;
  const isSaving = isTimelineSaving || isContactsSaving;
  const isSynced = isTimelineSynced && isContactsSynced;
  const lastSaved = timelineLastSaved || contactsLastSaved;
  const syncError = timelineSyncError || contactsSyncError;

  const forceSync = useCallback(async () => {
    await Promise.all([forceTimelineSync(), forceContactsSync()]);
  }, [forceTimelineSync, forceContactsSync]);

  // New entry form state
  const [newEntry, setNewEntry] = useState<Partial<TimelineEntry>>({
    time: '',
    endTime: '',
    activity: '',
    duration: 30,
    responsibleParty: '',
    location: '',
    category: 'other',
    notes: '',
    isKeyMoment: false,
    status: 'pending',
    bufferTime: 0,
  });

  // New contact form state
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    role: '',
    phone: '',
    email: '',
    isEmergency: false,
  });

  // Save event details to localStorage (separate from timeline and contacts)
  useEffect(() => {
    localStorage.setItem('event-timeline-details', JSON.stringify(eventDetails));
  }, [eventDetails]);

  // Load event details from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('event-timeline-details');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setEventDetails(data);
      } catch (e) {
        console.error('Failed to load event details:', e);
      }
    }
  }, []);

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.eventName) {
        setEventDetails(prev => ({ ...prev, eventName: params.eventName as string }));
        hasChanges = true;
      }
      if (params.date) {
        setEventDetails(prev => ({ ...prev, date: params.date as string }));
        hasChanges = true;
      }
      if (params.venue) {
        setEventDetails(prev => ({ ...prev, venue: params.venue as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Real-time clock update when tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const sortedEntries = useMemo(() => {
    return [...timelineEntries].sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return a.time.localeCompare(b.time);
    });
  }, [timelineEntries]);

  const filteredEntries = useMemo(() => {
    if (filterCategory === 'all') return sortedEntries;
    return sortedEntries.filter(entry => entry.category === filterCategory);
  }, [sortedEntries, filterCategory]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, TimelineEntry[]> = {};
    filteredEntries.forEach(entry => {
      if (!groups[entry.category]) {
        groups[entry.category] = [];
      }
      groups[entry.category].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  const emergencyContacts = useMemo(() => {
    return contacts.filter(c => c.isEmergency);
  }, [contacts]);

  const regularContacts = useMemo(() => {
    return contacts.filter(c => !c.isEmergency);
  }, [contacts]);

  const getCurrentActivityIndex = () => {
    if (!isTracking) return -1;
    const now = currentTime;
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      if (entry.time <= currentTimeStr && entry.endTime >= currentTimeStr) {
        return i;
      }
    }
    return -1;
  };

  // Event handlers
  const handleAddEntry = () => {
    if (!newEntry.time || !newEntry.activity) {
      setValidationMessage('Please fill in time and activity');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const entry: TimelineEntry = {
      id: generateId(),
      time: newEntry.time || '',
      endTime: calculateEndTime(newEntry.time || '', newEntry.duration || 30),
      activity: newEntry.activity || '',
      duration: newEntry.duration || 30,
      responsibleParty: newEntry.responsibleParty || '',
      location: newEntry.location || '',
      category: newEntry.category || 'other',
      notes: newEntry.notes || '',
      isKeyMoment: newEntry.isKeyMoment || false,
      status: 'pending',
      bufferTime: newEntry.bufferTime || 0,
    };

    addTimelineEntry(entry);
    setNewEntry({
      time: '',
      endTime: '',
      activity: '',
      duration: 30,
      responsibleParty: '',
      location: '',
      category: 'other',
      notes: '',
      isKeyMoment: false,
      status: 'pending',
      bufferTime: 0,
    });
    setShowAddEntry(false);
  };

  const handleUpdateEntry = (id: string, updates: Partial<TimelineEntry>) => {
    const entry = timelineEntries.find(e => e.id === id);
    if (entry) {
      const newEndTime = updates.time || updates.duration
        ? calculateEndTime(updates.time || entry.time, updates.duration || entry.duration)
        : entry.endTime;
      updateTimelineEntry(id, { ...updates, endTime: newEndTime });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Timeline Entry',
      message: 'Are you sure you want to delete this timeline entry?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteTimelineEntry(id);
    }
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      setValidationMessage('Please fill in name and phone number');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const contact: Contact = {
      id: generateId(),
      name: newContact.name || '',
      role: newContact.role || '',
      phone: newContact.phone || '',
      email: newContact.email || '',
      isEmergency: newContact.isEmergency || false,
    };

    addContactItem(contact);
    setNewContact({
      name: '',
      role: '',
      phone: '',
      email: '',
      isEmergency: false,
    });
    setShowAddContact(false);
  };

  const handleUpdateContact = (id: string, updates: Partial<Contact>) => {
    updateContactItem(id, updates);
  };

  const handleDeleteContact = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Contact',
      message: 'Are you sure you want to delete this contact?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteContactItem(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const data = { eventDetails, timelineEntries, contacts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventDetails.name || 'event'}-runsheet.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: 'Clear All Data',
      message: 'Are you sure you want to clear all data? This cannot be undone.',
      confirmText: 'Clear',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      setEventDetails(defaultEventDetails);
      setTimelineEntries([]);
      setContacts([]);
      localStorage.removeItem('event-timeline-details');
    }
  };

  const toggleCategoryExpand = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Export handlers using the hook's export functions
  const getExportFilename = () => {
    const eventName = eventDetails.name || 'event-timeline';
    return eventName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  };

  const handleExportCSV = () => {
    exportTimelineCSV({ filename: getExportFilename() });
  };

  const handleExportExcel = () => {
    exportTimelineExcel({ filename: getExportFilename() });
  };

  const handleExportJSONData = () => {
    exportTimelineJSON({ filename: getExportFilename() });
  };

  const handleExportPDF = async () => {
    await exportTimelinePDF({
      filename: getExportFilename(),
      title: eventDetails.name || 'Event Timeline',
      subtitle: eventDetails.date ? `Event Date: ${new Date(eventDetails.date).toLocaleDateString()}` : undefined,
      orientation: 'landscape',
    });
  };

  const handlePrintTimeline = () => {
    printTimeline(eventDetails.name || 'Event Timeline');
  };

  const handleCopyToClipboard = async () => {
    return await copyTimelineToClipboard('tab');
  };

  // Render functions
  const renderEventDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.eventTimeline.eventName', 'Event Name *')}
          </label>
          <input
            type="text"
            value={eventDetails.name}
            onChange={(e) => setEventDetails({ ...eventDetails, name: e.target.value })}
            placeholder={t('tools.eventTimeline.eGSmithWedding', 'e.g., Smith Wedding')}
            className={`w-full px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.eventTimeline.eventType', 'Event Type')}
          </label>
          <select
            value={eventDetails.eventType}
            onChange={(e) => setEventDetails({ ...eventDetails, eventType: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          >
            <option value="wedding">{t('tools.eventTimeline.wedding', 'Wedding')}</option>
            <option value="corporate">{t('tools.eventTimeline.corporateEvent', 'Corporate Event')}</option>
            <option value="birthday">{t('tools.eventTimeline.birthdayParty', 'Birthday Party')}</option>
            <option value="conference">{t('tools.eventTimeline.conference', 'Conference')}</option>
            <option value="gala">{t('tools.eventTimeline.gala', 'Gala')}</option>
            <option value="concert">{t('tools.eventTimeline.concert', 'Concert')}</option>
            <option value="other">{t('tools.eventTimeline.other', 'Other')}</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.eventTimeline.eventDate', 'Event Date *')}
          </label>
          <input
            type="date"
            value={eventDetails.date}
            onChange={(e) => setEventDetails({ ...eventDetails, date: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.eventTimeline.guestCount', 'Guest Count')}
          </label>
          <input
            type="number"
            value={eventDetails.guestCount || ''}
            onChange={(e) => setEventDetails({ ...eventDetails, guestCount: parseInt(e.target.value) || 0 })}
            placeholder={t('tools.eventTimeline.expectedGuests', 'Expected guests')}
            min="0"
            className={`w-full px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.eventTimeline.startTime', 'Start Time')}
          </label>
          <input
            type="time"
            value={eventDetails.startTime}
            onChange={(e) => setEventDetails({ ...eventDetails, startTime: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.eventTimeline.endTime', 'End Time')}
          </label>
          <input
            type="time"
            value={eventDetails.endTime}
            onChange={(e) => setEventDetails({ ...eventDetails, endTime: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>
      </div>

      <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.eventTimeline.venueInformation', 'Venue Information')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.eventTimeline.venueName', 'Venue Name')}
            </label>
            <input
              type="text"
              value={eventDetails.venue}
              onChange={(e) => setEventDetails({ ...eventDetails, venue: e.target.value })}
              placeholder={t('tools.eventTimeline.eGGrandBallroom', 'e.g., Grand Ballroom')}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.eventTimeline.venueAddress', 'Venue Address')}
            </label>
            <input
              type="text"
              value={eventDetails.venueAddress}
              onChange={(e) => setEventDetails({ ...eventDetails, venueAddress: e.target.value })}
              placeholder={t('tools.eventTimeline.fullAddress', 'Full address')}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        </div>
      </div>

      <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.eventTimeline.clientInformation', 'Client Information')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.eventTimeline.clientName', 'Client Name')}
            </label>
            <input
              type="text"
              value={eventDetails.client}
              onChange={(e) => setEventDetails({ ...eventDetails, client: e.target.value })}
              placeholder={t('tools.eventTimeline.clientName2', 'Client name')}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.eventTimeline.clientPhone', 'Client Phone')}
            </label>
            <input
              type="tel"
              value={eventDetails.clientPhone}
              onChange={(e) => setEventDetails({ ...eventDetails, clientPhone: e.target.value })}
              placeholder={t('tools.eventTimeline.phoneNumber', 'Phone number')}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.eventTimeline.clientEmail', 'Client Email')}
            </label>
            <input
              type="email"
              value={eventDetails.clientEmail}
              onChange={(e) => setEventDetails({ ...eventDetails, clientEmail: e.target.value })}
              placeholder={t('tools.eventTimeline.emailAddress', 'Email address')}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        </div>
      </div>

      <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('tools.eventTimeline.generalNotes', 'General Notes')}
        </label>
        <textarea
          value={eventDetails.notes}
          onChange={(e) => setEventDetails({ ...eventDetails, notes: e.target.value })}
          placeholder={t('tools.eventTimeline.anyAdditionalNotesAboutThe', 'Any additional notes about the event...')}
          rows={4}
          className={`w-full px-4 py-3 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
        />
      </div>
    </div>
  );

  const renderTimelineEntry = (entry: TimelineEntry) => {
    const isEditing = editingEntryId === entry.id;
    const currentActivityIdx = getCurrentActivityIndex();
    const entryIndex = sortedEntries.findIndex(e => e.id === entry.id);
    const isCurrent = isTracking && entryIndex === currentActivityIdx;

    return (
      <div
        key={entry.id}
        className={`p-4 rounded-lg border-l-4 ${
          isCurrent
            ? 'border-l-blue-500 ring-2 ring-blue-500/50'
            : entry.isKeyMoment
            ? 'border-l-yellow-500'
            : `border-l-transparent`
        } ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} ${
          entry.status === 'completed' ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${categoryColors[entry.category]} text-white`}>
              {categoryIcons[entry.category]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(entry.time)} - {formatTime(entry.endTime)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[entry.category]} text-white`}>
                  {categoryLabels[entry.category]}
                </span>
                {entry.isKeyMoment && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              {isEditing ? (
                <div className="space-y-3 mt-2">
                  <input
                    type="text"
                    value={entry.activity}
                    onChange={(e) => handleUpdateEntry(entry.id, { activity: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.eventTimeline.activity3', 'Activity')}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={entry.time}
                      onChange={(e) => handleUpdateEntry(entry.id, { time: e.target.value })}
                      className={`px-3 py-2 rounded border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <input
                      type="number"
                      value={entry.duration}
                      onChange={(e) => handleUpdateEntry(entry.id, { duration: parseInt(e.target.value) || 0 })}
                      className={`px-3 py-2 rounded border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.eventTimeline.durationMin', 'Duration (min)')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={entry.responsibleParty}
                      onChange={(e) => handleUpdateEntry(entry.id, { responsibleParty: e.target.value })}
                      className={`px-3 py-2 rounded border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.eventTimeline.responsibleParty2', 'Responsible party')}
                    />
                    <input
                      type="text"
                      value={entry.location}
                      onChange={(e) => handleUpdateEntry(entry.id, { location: e.target.value })}
                      className={`px-3 py-2 rounded border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.eventTimeline.location3', 'Location')}
                    />
                  </div>
                  <select
                    value={entry.category}
                    onChange={(e) => handleUpdateEntry(entry.id, { category: e.target.value as TimelineEntry['category'] })}
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <textarea
                    value={entry.notes}
                    onChange={(e) => handleUpdateEntry(entry.id, { notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.eventTimeline.notes3', 'Notes')}
                    rows={2}
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entry.isKeyMoment}
                        onChange={(e) => handleUpdateEntry(entry.id, { isKeyMoment: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.eventTimeline.keyMoment', 'Key Moment')}
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.eventTimeline.buffer', 'Buffer:')}
                      </label>
                      <input
                        type="number"
                        value={entry.bufferTime}
                        onChange={(e) => handleUpdateEntry(entry.id, { bufferTime: parseInt(e.target.value) || 0 })}
                        className={`w-16 px-2 py-1 rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="min"
                        min="0"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>min</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {entry.activity}
                  </h4>
                  <div className={`text-sm mt-1 space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {entry.duration} minutes
                      {entry.bufferTime > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          +{entry.bufferTime}min buffer
                        </span>
                      )}
                    </p>
                    {entry.responsibleParty && (
                      <p className="flex items-center gap-2">
                        <User className="w-3 h-3" /> {entry.responsibleParty}
                      </p>
                    )}
                    {entry.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> {entry.location}
                      </p>
                    )}
                    {entry.notes && (
                      <p className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" /> {entry.notes}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <select
              value={entry.status}
              onChange={(e) => handleUpdateEntry(entry.id, { status: e.target.value as TimelineEntry['status'] })}
              className={`text-xs px-2 py-1 rounded border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="pending">{t('tools.eventTimeline.pending', 'Pending')}</option>
              <option value="in-progress">{t('tools.eventTimeline.inProgress', 'In Progress')}</option>
              <option value="completed">{t('tools.eventTimeline.completed', 'Completed')}</option>
              <option value="delayed">{t('tools.eventTimeline.delayed', 'Delayed')}</option>
            </select>
            <div className={`w-3 h-3 rounded-full ${statusColors[entry.status]}`} title={entry.status} />

            {/* Edit/Save button */}
            <button
              onClick={() => setEditingEntryId(isEditing ? null : entry.id)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-600 text-gray-400'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </button>

            {/* Delete button */}
            <button
              onClick={() => handleDeleteEntry(entry.id).catch(console.error)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-red-900/50 text-red-400'
                  : 'hover:bg-red-100 text-red-600'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTimeline = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTracking(!isTracking)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isTracking
                ? 'bg-red-500 hover:bg-red-600 text-white' : t('tools.eventTimeline.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
            }`}
          >
            {isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isTracking ? t('tools.eventTimeline.stopTracking', 'Stop Tracking') : t('tools.eventTimeline.startTracking', 'Start Tracking')}
          </button>
          {isTracking && (
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Current time: {currentTime.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">{t('tools.eventTimeline.allCategories', 'All Categories')}</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAddEntry(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tools.eventTimeline.addEntry', 'Add Entry')}
          </button>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.eventTimeline.addTimelineEntry', 'Add Timeline Entry')}
            </h3>
            <button
              onClick={() => setShowAddEntry(false)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventTimeline.startTime2', 'Start Time *')}
                </label>
                <input
                  type="time"
                  value={newEntry.time}
                  onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventTimeline.durationMinutes', 'Duration (minutes) *')}
                </label>
                <input
                  type="number"
                  value={newEntry.duration}
                  onChange={(e) => setNewEntry({ ...newEntry, duration: parseInt(e.target.value) || 0 })}
                  min="1"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.eventTimeline.activity', 'Activity *')}
              </label>
              <input
                type="text"
                value={newEntry.activity}
                onChange={(e) => setNewEntry({ ...newEntry, activity: e.target.value })}
                placeholder={t('tools.eventTimeline.eGBrideArrivalFirst', 'e.g., Bride arrival, First dance, Cake cutting')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventTimeline.category', 'Category')}
                </label>
                <select
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value as TimelineEntry['category'] })}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventTimeline.responsibleParty', 'Responsible Party')}
                </label>
                <input
                  type="text"
                  value={newEntry.responsibleParty}
                  onChange={(e) => setNewEntry({ ...newEntry, responsibleParty: e.target.value })}
                  placeholder={t('tools.eventTimeline.eGDjPhotographerCaterer', 'e.g., DJ, Photographer, Caterer')}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventTimeline.location', 'Location')}
                </label>
                <input
                  type="text"
                  value={newEntry.location}
                  onChange={(e) => setNewEntry({ ...newEntry, location: e.target.value })}
                  placeholder={t('tools.eventTimeline.eGMainHallGarden', 'e.g., Main Hall, Garden, Kitchen')}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventTimeline.bufferTimeAfterMinutes', 'Buffer Time After (minutes)')}
                </label>
                <input
                  type="number"
                  value={newEntry.bufferTime}
                  onChange={(e) => setNewEntry({ ...newEntry, bufferTime: parseInt(e.target.value) || 0 })}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.eventTimeline.notes', 'Notes')}
              </label>
              <textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                placeholder={t('tools.eventTimeline.anyAdditionalNotes', 'Any additional notes...')}
                rows={2}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEntry.isKeyMoment}
                  onChange={(e) => setNewEntry({ ...newEntry, isKeyMoment: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventTimeline.markAsKeyMomentSpeeches', 'Mark as Key Moment (speeches, first dance, cake cutting, etc.)')}
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddEntry}
                className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {t('tools.eventTimeline.addEntry2', 'Add Entry')}
              </button>
              <button
                onClick={() => setShowAddEntry(false)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.eventTimeline.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Entries */}
      {filteredEntries.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">{t('tools.eventTimeline.noTimelineEntriesYet', 'No timeline entries yet')}</p>
          <p className="text-sm mt-2">{t('tools.eventTimeline.clickAddEntryToCreate', 'Click "Add Entry" to create your event timeline')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map(entry => renderTimelineEntry(entry))}
        </div>
      )}
    </div>
  );

  const renderContactCard = (contact: Contact) => {
    const isEditing = editingContactId === contact.id;

    return (
      <div
        key={contact.id}
        className={`p-4 rounded-lg ${
          contact.isEmergency
            ? theme === 'dark'
              ? 'bg-red-900/30 border border-red-700'
              : 'bg-red-50 border border-red-200'
            : theme === 'dark'
            ? 'bg-gray-700'
            : 'bg-gray-50'
        }`}
      >
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={contact.name}
              onChange={(e) => handleUpdateContact(contact.id, { name: e.target.value })}
              className={`w-full px-3 py-2 rounded border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={t('tools.eventTimeline.name3', 'Name')}
            />
            <input
              type="text"
              value={contact.role}
              onChange={(e) => handleUpdateContact(contact.id, { role: e.target.value })}
              className={`w-full px-3 py-2 rounded border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={t('tools.eventTimeline.role3', 'Role')}
            />
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => handleUpdateContact(contact.id, { phone: e.target.value })}
              className={`w-full px-3 py-2 rounded border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={t('tools.eventTimeline.phone3', 'Phone')}
            />
            <input
              type="email"
              value={contact.email}
              onChange={(e) => handleUpdateContact(contact.id, { email: e.target.value })}
              className={`w-full px-3 py-2 rounded border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={t('tools.eventTimeline.email3', 'Email')}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contact.isEmergency}
                onChange={(e) => handleUpdateContact(contact.id, { isEmergency: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.eventTimeline.emergencyContact', 'Emergency Contact')}
              </span>
            </label>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {contact.name}
                </h4>
                {contact.isEmergency && (
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500 text-white">{t('tools.eventTimeline.emergency', 'Emergency')}</span>
                )}
              </div>
              {contact.role && (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {contact.role}
                </p>
              )}
              <div className={`text-sm mt-2 space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-[#0D9488]">
                  <Phone className="w-3 h-3" /> {contact.phone}
                </a>
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-[#0D9488]">
                    <Mail className="w-3 h-3" /> {contact.email}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingContactId(isEditing ? null : contact.id)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-600 text-gray-400'
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleDeleteContact(contact.id).catch(console.error)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-red-900/50 text-red-400'
                    : 'hover:bg-red-100 text-red-600'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContacts = () => (
    <div className="space-y-6">
      {/* Add Contact Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddContact(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('tools.eventTimeline.addContact', 'Add Contact')}
        </button>
      </div>

      {/* Add Contact Form */}
      {showAddContact && (
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.eventTimeline.addContact2', 'Add Contact')}
            </h3>
            <button
              onClick={() => setShowAddContact(false)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventTimeline.name', 'Name *')}
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder={t('tools.eventTimeline.contactName', 'Contact name')}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventTimeline.role', 'Role')}
                </label>
                <input
                  type="text"
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  placeholder={t('tools.eventTimeline.eGDjPhotographerCaterer2', 'e.g., DJ, Photographer, Caterer')}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventTimeline.phone', 'Phone *')}
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder={t('tools.eventTimeline.phoneNumber2', 'Phone number')}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventTimeline.email', 'Email')}
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder={t('tools.eventTimeline.emailAddress2', 'Email address')}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newContact.isEmergency}
                onChange={(e) => setNewContact({ ...newContact, isEmergency: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.eventTimeline.emergencyContact2', 'Emergency Contact')}
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleAddContact}
                className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {t('tools.eventTimeline.addContact3', 'Add Contact')}
              </button>
              <button
                onClick={() => setShowAddContact(false)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.eventTimeline.cancel2', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <AlertCircle className="w-5 h-5 text-red-500" />
            {t('tools.eventTimeline.emergencyContacts', 'Emergency Contacts')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map(contact => renderContactCard(contact))}
          </div>
        </div>
      )}

      {/* Regular Contacts */}
      {regularContacts.length > 0 && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Users className="w-5 h-5" />
            {t('tools.eventTimeline.dayOfContacts', 'Day-of Contacts')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regularContacts.map(contact => renderContactCard(contact))}
          </div>
        </div>
      )}

      {contacts.length === 0 && (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">{t('tools.eventTimeline.noContactsAddedYet', 'No contacts added yet')}</p>
          <p className="text-sm mt-2">{t('tools.eventTimeline.clickAddContactToAdd', 'Click "Add Contact" to add vendors and emergency contacts')}</p>
        </div>
      )}
    </div>
  );

  const renderRunsheet = () => (
    <div className="space-y-6 print:space-y-4">
      {/* Print Header */}
      <div className={`print:block ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-lg print:bg-white print:border print:border-gray-300`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
              {eventDetails.name || 'Event Runsheet'}
            </h2>
            <div className={`mt-2 space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} print:text-gray-700`}>
              {eventDetails.date && (
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(eventDetails.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
              {eventDetails.startTime && eventDetails.endTime && (
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatTime(eventDetails.startTime)} - {formatTime(eventDetails.endTime)}
                </p>
              )}
              {eventDetails.venue && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {eventDetails.venue}
                  {eventDetails.venueAddress && ` - ${eventDetails.venueAddress}`}
                </p>
              )}
              {eventDetails.guestCount > 0 && (
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {eventDetails.guestCount} expected guests
                </p>
              )}
            </div>
          </div>
          <div className="print:hidden flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              {t('tools.eventTimeline.print', 'Print')}
            </button>
            <button
              onClick={handleExportJSON}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Download className="w-4 h-4" />
              {t('tools.eventTimeline.export', 'Export')}
            </button>
          </div>
        </div>

        {/* Client info */}
        {eventDetails.client && (
          <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} print:border-gray-400`}>
            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
              Client: {eventDetails.client}
            </p>
            {(eventDetails.clientPhone || eventDetails.clientEmail) && (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} print:text-gray-700`}>
                {eventDetails.clientPhone && <span className="mr-4">{eventDetails.clientPhone}</span>}
                {eventDetails.clientEmail && <span>{eventDetails.clientEmail}</span>}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <div className={`${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'} p-4 rounded-lg print:bg-white print:border print:border-red-300`}>
          <h3 className={`font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
            <AlertCircle className="w-4 h-4 text-red-500" />
            {t('tools.eventTimeline.emergencyContacts2', 'Emergency Contacts')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {emergencyContacts.map(contact => (
              <div key={contact.id} className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} print:text-gray-700`}>
                <span className="font-medium">{contact.name}</span>
                {contact.role && <span> ({contact.role})</span>}
                : {contact.phone}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
          {t('tools.eventTimeline.eventTimeline', 'Event Timeline')}
        </h3>
        <div className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} print:border-gray-400`}>
          <table className="w-full">
            <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} print:bg-gray-100`}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                  {t('tools.eventTimeline.time', 'Time')}
                </th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                  {t('tools.eventTimeline.activity2', 'Activity')}
                </th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                  {t('tools.eventTimeline.duration', 'Duration')}
                </th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                  {t('tools.eventTimeline.responsible', 'Responsible')}
                </th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                  {t('tools.eventTimeline.location2', 'Location')}
                </th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black print:hidden`}>
                  {t('tools.eventTimeline.notes2', 'Notes')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`${
                    index % 2 === 0
                      ? theme === 'dark'
                        ? 'bg-gray-800'
                        : 'bg-white'
                      : theme === 'dark'
                      ? 'bg-gray-700/50'
                      : 'bg-gray-50'
                  } print:bg-white ${entry.isKeyMoment ? 'print:font-semibold' : ''}`}
                >
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                    <div className="flex items-center gap-1">
                      {entry.isKeyMoment && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                      {formatTime(entry.time)} - {formatTime(entry.endTime)}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                    {entry.activity}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${categoryColors[entry.category]} text-white print:bg-gray-200 print:text-gray-700`}>
                      {categoryLabels[entry.category]}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} print:text-gray-700`}>
                    {entry.duration}min
                    {entry.bufferTime > 0 && <span className="text-xs"> (+{entry.bufferTime})</span>}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} print:text-gray-700`}>
                    {entry.responsibleParty || '-'}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} print:text-gray-700`}>
                    {entry.location || '-'}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} print:text-gray-700 print:hidden`}>
                    {entry.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Contacts */}
      {contacts.length > 0 && (
        <div className="print:break-before-page">
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
            {t('tools.eventTimeline.contactList', 'Contact List')}
          </h3>
          <div className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} print:border-gray-400`}>
            <table className="w-full">
              <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} print:bg-gray-100`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                    {t('tools.eventTimeline.name2', 'Name')}
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                    {t('tools.eventTimeline.role2', 'Role')}
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                    {t('tools.eventTimeline.phone2', 'Phone')}
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                    {t('tools.eventTimeline.email2', 'Email')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr
                    key={contact.id}
                    className={`${
                      contact.isEmergency
                        ? theme === 'dark'
                          ? 'bg-red-900/30'
                          : 'bg-red-50'
                        : index % 2 === 0
                        ? theme === 'dark'
                          ? 'bg-gray-800'
                          : 'bg-white'
                        : theme === 'dark'
                        ? 'bg-gray-700/50'
                        : 'bg-gray-50'
                    } print:bg-white`}
                  >
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
                      {contact.name}
                      {contact.isEmergency && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-500 text-white">{t('tools.eventTimeline.emergency2', 'Emergency')}</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} print:text-gray-700`}>
                      {contact.role || '-'}
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} print:text-gray-700`}>
                      {contact.phone}
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} print:text-gray-700`}>
                      {contact.email || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      {eventDetails.notes && (
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg print:bg-white print:border print:border-gray-300`}>
          <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} print:text-black`}>
            {t('tools.eventTimeline.generalNotes2', 'General Notes')}
          </h3>
          <p className={`text-sm whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} print:text-gray-700`}>
            {eventDetails.notes}
          </p>
        </div>
      )}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="max-w-6xl mx-auto">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 flex items-center justify-center h-64`}>
            <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          </div>
        </div>
      </div>
    );
  }

  // Main return
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4 print:bg-white print:py-0`}>
      <div className="max-w-6xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 print:shadow-none print:p-0`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.eventTimeline.eventTimeline2', 'Event Timeline')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.eventTimeline.dayOfRunsheetAndEvent', 'Day-of runsheet and event planning')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="event-timeline" toolName="Event Timeline" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSONData}
                onExportPDF={handleExportPDF}
                onPrint={handlePrintTimeline}
                onCopyToClipboard={handleCopyToClipboard}
                onImportCSV={async (file) => { await importTimelineCSV(file); }}
                onImportJSON={async (file) => { await importTimelineJSON(file); }}
                disabled={sortedEntries.length === 0}
                theme={theme}
              />
              <button
                onClick={() => handleClearAll().catch(console.error)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-red-900/50 text-red-400 hover:bg-red-900'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                {t('tools.eventTimeline.clearAll', 'Clear All')}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 print:hidden">
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'details', label: 'Event Details', icon: <FileText className="w-4 h-4" /> },
                { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
                { id: 'contacts', label: 'Contacts', icon: <Users className="w-4 h-4" /> },
                { id: 'runsheet', label: 'Runsheet', icon: <Printer className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-[#0D9488] text-[#0D9488]'
                      : theme === 'dark'
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="print:block">
            {activeTab === 'details' && renderEventDetails()}
            {activeTab === 'timeline' && renderTimeline()}
            {activeTab === 'contacts' && renderContacts()}
            {activeTab === 'runsheet' && renderRunsheet()}
          </div>

          {/* Validation Toast */}
          {validationMessage && (
            <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white bg-red-500 z-50 animate-fade-in`}>
              {validationMessage}
            </div>
          )}

          {/* Confirm Dialog */}
          <ConfirmDialog />
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:break-before-page {
            break-before: page;
          }
        }
      `}</style>
    </div>
  );
};

export default EventTimelineTool;
