'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Users,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Utensils,
  MapPin,
  UserCheck,
  UserPlus,
  Send,
  Grid3X3,
  ClipboardList,
  Sparkles,
  Crown,
  Briefcase,
  User,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface EventGuestListToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  maxCapacity: number;
  tableCount: number;
  seatsPerTable: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Guest {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined' | 'maybe';
  plusOnes: number;
  dietaryRestrictions: string;
  tableAssignment: number | null;
  seatNumber: number | null;
  category: 'vip' | 'regular' | 'vendor' | 'staff';
  invitationSent: boolean;
  invitationSentAt: string | null;
  checkedIn: boolean;
  checkedInAt: string | null;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

type TabType = 'events' | 'guests' | 'seating' | 'checkin';

const RSVP_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500', icon: CheckCircle },
  { value: 'declined', label: 'Declined', color: 'bg-red-500', icon: XCircle },
  { value: 'maybe', label: 'Maybe', color: 'bg-blue-500', icon: HelpCircle },
];

const CATEGORY_OPTIONS = [
  { value: 'vip', label: 'VIP', color: 'bg-purple-500', icon: Crown },
  { value: 'regular', label: 'Regular', color: 'bg-gray-500', icon: User },
  { value: 'vendor', label: 'Vendor', color: 'bg-orange-500', icon: Briefcase },
  { value: 'staff', label: 'Staff', color: 'bg-cyan-500', icon: UserCheck },
];

const EVENTS_STORAGE_KEY = 'event-guestlist-events';

// Column configuration for exports
const GUEST_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Guest Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'rsvpStatus', header: 'RSVP Status', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'plusOnes', header: 'Plus Ones', type: 'number' },
  { key: 'tableAssignment', header: 'Table', type: 'number', format: (v) => v ? `Table ${v}` : 'Unassigned' },
  { key: 'seatNumber', header: 'Seat', type: 'number', format: (v) => v ? String(v) : '-' },
  { key: 'dietaryRestrictions', header: 'Dietary Restrictions', type: 'string' },
  { key: 'invitationSent', header: 'Invitation Sent', type: 'boolean' },
  { key: 'checkedIn', header: 'Checked In', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Column configuration for events exports
const EVENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Event Name', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'venue', header: 'Venue', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'maxCapacity', header: 'Max Capacity', type: 'number' },
  { key: 'tableCount', header: 'Tables', type: 'number' },
  { key: 'seatsPerTable', header: 'Seats/Table', type: 'number' },
];

// Sample data generator
const generateSampleData = (): { events: Event[]; guests: Guest[] } => {
  const events: Event[] = [
    {
      id: 'evt-1',
      name: 'Annual Gala Dinner',
      date: '2025-02-14',
      time: '18:00',
      venue: 'Grand Ballroom, Luxury Hotel',
      description: 'Annual charity gala dinner with live entertainment and auction.',
      maxCapacity: 200,
      tableCount: 20,
      seatsPerTable: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt-2',
      name: 'Corporate Conference',
      date: '2025-03-20',
      time: '09:00',
      venue: 'Convention Center',
      description: 'Annual corporate conference with keynote speakers.',
      maxCapacity: 500,
      tableCount: 50,
      seatsPerTable: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const guests: Guest[] = [
    {
      id: 'gst-1',
      eventId: 'evt-1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 555-0101',
      rsvpStatus: 'confirmed',
      plusOnes: 1,
      dietaryRestrictions: 'Vegetarian',
      tableAssignment: 1,
      seatNumber: 1,
      category: 'vip',
      invitationSent: true,
      invitationSentAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
      notes: 'CEO of partner company',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'gst-2',
      eventId: 'evt-1',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+1 555-0102',
      rsvpStatus: 'confirmed',
      plusOnes: 0,
      dietaryRestrictions: '',
      tableAssignment: 1,
      seatNumber: 2,
      category: 'vip',
      invitationSent: true,
      invitationSentAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'gst-3',
      eventId: 'evt-1',
      name: 'Mike Wilson',
      email: 'mike.w@example.com',
      phone: '+1 555-0103',
      rsvpStatus: 'pending',
      plusOnes: 2,
      dietaryRestrictions: 'Gluten-free',
      tableAssignment: null,
      seatNumber: null,
      category: 'regular',
      invitationSent: true,
      invitationSentAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'gst-4',
      eventId: 'evt-1',
      name: 'Emily Brown',
      email: 'emily.b@example.com',
      phone: '+1 555-0104',
      rsvpStatus: 'maybe',
      plusOnes: 1,
      dietaryRestrictions: 'Vegan',
      tableAssignment: null,
      seatNumber: null,
      category: 'regular',
      invitationSent: false,
      invitationSentAt: null,
      checkedIn: false,
      checkedInAt: null,
      notes: 'Waiting for confirmation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'gst-5',
      eventId: 'evt-1',
      name: 'Catering Co.',
      email: 'contact@catering.com',
      phone: '+1 555-0105',
      rsvpStatus: 'confirmed',
      plusOnes: 5,
      dietaryRestrictions: '',
      tableAssignment: null,
      seatNumber: null,
      category: 'vendor',
      invitationSent: true,
      invitationSentAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
      notes: 'Main catering service',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { events, guests };
};

export const EventGuestListTool: React.FC<EventGuestListToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use useToolData hook for guests with backend sync
  const {
    data: guests,
    setData: setGuests,
    addItem: addGuest,
    updateItem: updateGuest,
    deleteItem: deleteGuestItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading: isGuestsLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Guest>('event-guestlist', [], GUEST_COLUMNS);

  // State for events (kept separate for now - can be migrated to useToolData later)
  const [events, setEvents] = useState<Event[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Combined loading state
  const isLoading = isGuestsLoading || isEventsLoading;

  // Form states
  const [eventFormData, setEventFormData] = useState<Partial<Event>>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    venue: '',
    description: '',
    maxCapacity: 100,
    tableCount: 10,
    seatsPerTable: 10,
  });

  const [guestFormData, setGuestFormData] = useState<Partial<Guest>>({
    name: '',
    email: '',
    phone: '',
    rsvpStatus: 'pending',
    plusOnes: 0,
    dietaryRestrictions: '',
    tableAssignment: null,
    seatNumber: null,
    category: 'regular',
    invitationSent: false,
    checkedIn: false,
    notes: '',
  });

  // Load events data (guests are handled by useToolData hook)
  useEffect(() => {
    loadEventsData();
  }, []);

  // Initialize sample data for guests if empty (after loading completes)
  useEffect(() => {
    if (!isGuestsLoading && guests.length === 0 && events.length > 0) {
      // Generate sample guests for existing events
      const sampleData = generateSampleData();
      // Only add guests that belong to existing events
      const sampleGuests = sampleData.guests.filter(g =>
        events.some(e => e.id === g.eventId)
      );
      if (sampleGuests.length > 0) {
        setGuests(sampleGuests);
      }
    }
  }, [isGuestsLoading, guests.length, events.length]);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description) {
        setEventFormData(prev => ({
          ...prev,
          name: params.title || prev.name,
          description: params.description || prev.description,
          venue: params.location || prev.venue,
        }));
        setShowEventModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Save events to localStorage
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    }
  }, [events]);

  const loadEventsData = async () => {
    setIsEventsLoading(true);
    try {
      // Try API first for events
      const eventsRes = await api.get('/events/guestlist/events').catch(() => null);

      if (eventsRes?.data) {
        setEvents(eventsRes.data);
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
        if (saved) {
          setEvents(JSON.parse(saved));
        } else {
          // Load sample events if nothing exists
          const sample = generateSampleData();
          setEvents(sample.events);
          localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(sample.events));
        }
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) {
        setEvents(JSON.parse(saved));
      } else {
        const sample = generateSampleData();
        setEvents(sample.events);
      }
    } finally {
      setIsEventsLoading(false);
    }
  };

  // Selected event
  const selectedEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Filter guests
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      if (selectedEventId && guest.eventId !== selectedEventId) return false;

      const matchesSearch = searchQuery === '' ||
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.phone.includes(searchQuery);

      const matchesRsvp = rsvpFilter === 'all' || guest.rsvpStatus === rsvpFilter;
      const matchesCategory = categoryFilter === 'all' || guest.category === categoryFilter;
      const matchesTable = tableFilter === 'all' ||
        (tableFilter === 'unassigned' && guest.tableAssignment === null) ||
        guest.tableAssignment?.toString() === tableFilter;

      return matchesSearch && matchesRsvp && matchesCategory && matchesTable;
    });
  }, [guests, selectedEventId, searchQuery, rsvpFilter, categoryFilter, tableFilter]);

  // Stats for selected event
  const eventStats = useMemo(() => {
    const eventGuests = guests.filter(g => g.eventId === selectedEventId);
    const confirmed = eventGuests.filter(g => g.rsvpStatus === 'confirmed');
    const totalAttendees = confirmed.reduce((sum, g) => sum + 1 + g.plusOnes, 0);
    const checkedIn = eventGuests.filter(g => g.checkedIn);
    const invitationsSent = eventGuests.filter(g => g.invitationSent);

    return {
      totalGuests: eventGuests.length,
      confirmed: confirmed.length,
      pending: eventGuests.filter(g => g.rsvpStatus === 'pending').length,
      declined: eventGuests.filter(g => g.rsvpStatus === 'declined').length,
      maybe: eventGuests.filter(g => g.rsvpStatus === 'maybe').length,
      totalAttendees,
      checkedIn: checkedIn.length,
      invitationsSent: invitationsSent.length,
    };
  }, [guests, selectedEventId]);

  // Table assignments for seating view
  const tableAssignments = useMemo(() => {
    if (!selectedEvent) return [];
    const tables: { tableNumber: number; guests: Guest[] }[] = [];
    for (let i = 1; i <= selectedEvent.tableCount; i++) {
      tables.push({
        tableNumber: i,
        guests: guests.filter(g => g.eventId === selectedEventId && g.tableAssignment === i),
      });
    }
    return tables;
  }, [guests, selectedEvent, selectedEventId]);


  // CRUD Operations - Events
  const handleSaveEvent = async () => {
    if (!eventFormData.name || !eventFormData.date) return;

    const eventData: Event = {
      id: editingEvent?.id || `evt-${Date.now()}`,
      name: eventFormData.name || '',
      date: eventFormData.date || '',
      time: eventFormData.time || '18:00',
      venue: eventFormData.venue || '',
      description: eventFormData.description || '',
      maxCapacity: eventFormData.maxCapacity || 100,
      tableCount: eventFormData.tableCount || 10,
      seatsPerTable: eventFormData.seatsPerTable || 10,
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingEvent) {
        await api.put(`/events/guestlist/events/${editingEvent.id}`, eventData).catch(() => null);
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? eventData : e));
      } else {
        const response = await api.post('/events/guestlist/events', eventData).catch(() => null);
        const newEvent = response?.data || eventData;
        setEvents(prev => [...prev, newEvent]);
        setSelectedEventId(newEvent.id);
      }
    } catch (error) {
      console.error('Save event failed:', error);
      if (editingEvent) {
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? eventData : e));
      } else {
        setEvents(prev => [...prev, eventData]);
        setSelectedEventId(eventData.id);
      }
    }

    resetEventForm();
  };

  const handleDeleteEvent = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event and all its guests?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      await api.delete(`/events/guestlist/events/${id}`).catch(() => null);
    } catch (error) {
      console.error('Delete event failed:', error);
    }

    setEvents(prev => prev.filter(e => e.id !== id));
    setGuests(prev => prev.filter(g => g.eventId !== id));
    if (selectedEventId === id) setSelectedEventId(null);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventFormData({ ...event });
    setShowEventModal(true);
  };

  const resetEventForm = () => {
    setEventFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      time: '18:00',
      venue: '',
      description: '',
      maxCapacity: 100,
      tableCount: 10,
      seatsPerTable: 10,
    });
    setEditingEvent(null);
    setShowEventModal(false);
    setIsPrefilled(false);
  };

  // CRUD Operations - Guests (using useToolData hook)
  const handleSaveGuest = () => {
    if (!guestFormData.name || !selectedEventId) return;

    if (editingGuest) {
      // Update existing guest
      updateGuest(editingGuest.id, {
        name: guestFormData.name || '',
        email: guestFormData.email || '',
        phone: guestFormData.phone || '',
        rsvpStatus: guestFormData.rsvpStatus || 'pending',
        plusOnes: guestFormData.plusOnes || 0,
        dietaryRestrictions: guestFormData.dietaryRestrictions || '',
        tableAssignment: guestFormData.tableAssignment || null,
        seatNumber: guestFormData.seatNumber || null,
        category: guestFormData.category || 'regular',
        invitationSent: guestFormData.invitationSent || false,
        invitationSentAt: guestFormData.invitationSent ? new Date().toISOString() : null,
        checkedIn: guestFormData.checkedIn || false,
        checkedInAt: guestFormData.checkedIn ? new Date().toISOString() : null,
        notes: guestFormData.notes || '',
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Add new guest
      const newGuest: Guest = {
        id: `gst-${Date.now()}`,
        eventId: selectedEventId,
        name: guestFormData.name || '',
        email: guestFormData.email || '',
        phone: guestFormData.phone || '',
        rsvpStatus: guestFormData.rsvpStatus || 'pending',
        plusOnes: guestFormData.plusOnes || 0,
        dietaryRestrictions: guestFormData.dietaryRestrictions || '',
        tableAssignment: guestFormData.tableAssignment || null,
        seatNumber: guestFormData.seatNumber || null,
        category: guestFormData.category || 'regular',
        invitationSent: guestFormData.invitationSent || false,
        invitationSentAt: guestFormData.invitationSent ? new Date().toISOString() : null,
        checkedIn: guestFormData.checkedIn || false,
        checkedInAt: guestFormData.checkedIn ? new Date().toISOString() : null,
        notes: guestFormData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addGuest(newGuest);
    }

    resetGuestForm();
  };

  const handleDeleteGuest = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Guest',
      message: 'Are you sure you want to delete this guest?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (!confirmed) return;
    deleteGuestItem(id);
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setGuestFormData({ ...guest });
    setShowGuestModal(true);
  };

  const resetGuestForm = () => {
    setGuestFormData({
      name: '',
      email: '',
      phone: '',
      rsvpStatus: 'pending',
      plusOnes: 0,
      dietaryRestrictions: '',
      tableAssignment: null,
      seatNumber: null,
      category: 'regular',
      invitationSent: false,
      checkedIn: false,
      notes: '',
    });
    setEditingGuest(null);
    setShowGuestModal(false);
  };

  // Quick actions (using useToolData hook)
  const handleSendInvitation = (guestId: string) => {
    updateGuest(guestId, {
      invitationSent: true,
      invitationSentAt: new Date().toISOString(),
    });
  };

  const handleCheckIn = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (guest) {
      updateGuest(guestId, {
        checkedIn: !guest.checkedIn,
        checkedInAt: !guest.checkedIn ? new Date().toISOString() : null,
      });
    }
  };

  const handleAssignTable = (guestId: string, tableNumber: number | null) => {
    updateGuest(guestId, {
      tableAssignment: tableNumber,
      updatedAt: new Date().toISOString(),
    });
  };

  // Status badge component
  const RsvpBadge: React.FC<{ status: string; small?: boolean }> = ({ status, small }) => {
    const statusConfig = RSVP_STATUS_OPTIONS.find(s => s.value === status) || RSVP_STATUS_OPTIONS[0];
    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white ${statusConfig.color} ${small ? 'text-xs' : 'text-sm'}`}>
        <Icon className={small ? 'w-3 h-3' : 'w-4 h-4'} />
        {statusConfig.label}
      </span>
    );
  };

  const CategoryBadge: React.FC<{ category: string; small?: boolean }> = ({ category, small }) => {
    const categoryConfig = CATEGORY_OPTIONS.find(c => c.value === category) || CATEGORY_OPTIONS[1];
    const Icon = categoryConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white ${categoryConfig.color} ${small ? 'text-xs' : 'text-sm'}`}>
        <Icon className={small ? 'w-3 h-3' : 'w-4 h-4'} />
        {categoryConfig.label}
      </span>
    );
  };

  // Tab content renderers
  const renderEventsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map(event => (
        <div
          key={event.id}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedEventId === event.id
              ? 'border-cyan-500 ring-2 ring-cyan-500/20'
              : isDark
              ? 'border-gray-700 hover:border-gray-600'
              : 'border-gray-200 hover:border-gray-300'
          } ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          onClick={() => setSelectedEventId(event.id)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {event.name}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })} at {event.time}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                className="p-1.5 rounded-lg hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          <p className={`text-sm flex items-center gap-1 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <MapPin className="w-4 h-4" />
            {event.venue || 'No venue set'}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.capacity', 'Capacity')}</p>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.maxCapacity}</p>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.tables', 'Tables')}</p>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.tableCount}</p>
            </div>
          </div>

          {event.description && (
            <p className={`text-sm mt-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {event.description}
            </p>
          )}
        </div>
      ))}

      {/* Add Event Card */}
      <button
        onClick={() => setShowEventModal(true)}
        className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center min-h-[200px] transition-all ${
          isDark
            ? 'border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800/50'
            : 'border-gray-200 hover:border-cyan-500/50 hover:bg-gray-50'
        }`}
      >
        <Plus className={`w-8 h-8 mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.createEvent', 'Create Event')}</span>
      </button>
    </div>
  );

  const renderGuestsTab = () => (
    <div className="space-y-4">
      {/* Guest list header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={t('tools.eventGuestList.searchGuests', 'Search guests...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
            } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
          />
        </div>

        <select
          value={rsvpFilter}
          onChange={(e) => setRsvpFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
        >
          <option value="all">{t('tools.eventGuestList.allRsvp', 'All RSVP')}</option>
          {RSVP_STATUS_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
        >
          <option value="all">{t('tools.eventGuestList.allCategories', 'All Categories')}</option>
          {CATEGORY_OPTIONS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowGuestModal(true)}
          disabled={!selectedEventId}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-medium flex items-center gap-2 hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-5 h-5" />
          {t('tools.eventGuestList.addGuest', 'Add Guest')}
        </button>
      </div>

      {/* Guests table */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventGuestList.guest', 'Guest')}</th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventGuestList.contact', 'Contact')}</th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventGuestList.rsvp', 'RSVP')}</th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventGuestList.category', 'Category')}</th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Table</th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventGuestList.plusOnes', 'Plus Ones')}</th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventGuestList.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'bg-gray-900' : 'bg-white'}>
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-4 py-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {selectedEventId ? t('tools.eventGuestList.noGuestsFound', 'No guests found') : t('tools.eventGuestList.selectAnEventToView', 'Select an event to view guests')}
                  </td>
                </tr>
              ) : (
                filteredGuests.map(guest => (
                  <tr
                    key={guest.id}
                    className={`border-t ${isDark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{guest.name}</p>
                        {guest.dietaryRestrictions && (
                          <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                            <Utensils className="w-3 h-3" />
                            {guest.dietaryRestrictions}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {guest.email && (
                          <p className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {guest.email}
                          </p>
                        )}
                        {guest.phone && (
                          <p className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {guest.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RsvpBadge status={guest.rsvpStatus} small />
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={guest.category} small />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {guest.tableAssignment ? `Table ${guest.tableAssignment}` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {guest.plusOnes}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!guest.invitationSent && (
                          <button
                            onClick={() => handleSendInvitation(guest.id)}
                            className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            title={t('tools.eventGuestList.sendInvitation', 'Send invitation')}
                          >
                            <Send className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditGuest(guest)}
                          className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSeatingTab = () => (
    <div className="space-y-4">
      {!selectedEvent ? (
        <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {t('tools.eventGuestList.selectAnEventToManage', 'Select an event to manage seating')}
        </div>
      ) : (
        <>
          {/* Unassigned guests */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Unassigned Guests ({guests.filter(g => g.eventId === selectedEventId && g.tableAssignment === null).length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {guests
                .filter(g => g.eventId === selectedEventId && g.tableAssignment === null)
                .map(guest => (
                  <div
                    key={guest.id}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{guest.name}</span>
                    <select
                      value=""
                      onChange={(e) => handleAssignTable(guest.id, parseInt(e.target.value) || null)}
                      className={`text-xs px-2 py-1 rounded border ${
                        isDark
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.eventGuestList.assignTable', 'Assign table')}</option>
                      {Array.from({ length: selectedEvent.tableCount }, (_, i) => i + 1).map(t => (
                        <option key={t} value={t}>Table {t}</option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          </div>

          {/* Tables grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tableAssignments.map(table => (
              <div
                key={table.tableNumber}
                className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Table {table.tableNumber}
                  </h4>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {table.guests.length}/{selectedEvent.seatsPerTable}
                  </span>
                </div>
                <div className="space-y-2">
                  {table.guests.map(guest => (
                    <div
                      key={guest.id}
                      className={`p-2 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={guest.category} small />
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{guest.name}</span>
                      </div>
                      <button
                        onClick={() => handleAssignTable(guest.id, null)}
                        className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                  {table.guests.length === 0 && (
                    <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('tools.eventGuestList.noGuestsAssigned', 'No guests assigned')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderCheckInTab = () => (
    <div className="space-y-4">
      {!selectedEvent ? (
        <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {t('tools.eventGuestList.selectAnEventToManage2', 'Select an event to manage check-ins')}
        </div>
      ) : (
        <>
          {/* Check-in stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.totalExpected', 'Total Expected')}</p>
              <p className="text-2xl font-bold text-cyan-500">{eventStats.totalAttendees}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.checkedIn', 'Checked In')}</p>
              <p className="text-2xl font-bold text-green-500">{eventStats.checkedIn}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.pending', 'Pending')}</p>
              <p className="text-2xl font-bold text-yellow-500">{eventStats.confirmed - eventStats.checkedIn}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.checkInRate', 'Check-in Rate')}</p>
              <p className="text-2xl font-bold text-purple-500">
                {eventStats.confirmed > 0 ? Math.round((eventStats.checkedIn / eventStats.confirmed) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Search for check-in */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={t('tools.eventGuestList.searchGuestToCheckIn', 'Search guest to check in...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
            />
          </div>

          {/* Guest check-in list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuests
              .filter(g => g.rsvpStatus === 'confirmed')
              .map(guest => (
                <div
                  key={guest.id}
                  className={`p-4 rounded-xl border transition-all ${
                    guest.checkedIn
                      ? 'border-green-500 bg-green-500/10'
                      : isDark
                      ? 'border-gray-700 bg-gray-800'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{guest.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CategoryBadge category={guest.category} small />
                        {guest.tableAssignment && (
                          <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            Table {guest.tableAssignment}
                          </span>
                        )}
                      </div>
                    </div>
                    {guest.checkedIn && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>

                  {guest.plusOnes > 0 && (
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      +{guest.plusOnes} guest{guest.plusOnes > 1 ? 's' : ''}
                    </p>
                  )}

                  {guest.dietaryRestrictions && (
                    <p className={`text-sm flex items-center gap-1 mb-3 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                      <Utensils className="w-4 h-4" />
                      {guest.dietaryRestrictions}
                    </p>
                  )}

                  <button
                    onClick={() => handleCheckIn(guest.id)}
                    className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                      guest.checkedIn
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600'
                    }`}
                  >
                    {guest.checkedIn ? (
                      <>
                        <XCircle className="w-5 h-5" />
                        {t('tools.eventGuestList.undoCheckIn', 'Undo Check-in')}
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5" />
                        {t('tools.eventGuestList.checkIn', 'Check In')}
                      </>
                    )}
                  </button>

                  {guest.checkedIn && guest.checkedInAt && (
                    <p className={`text-xs text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Checked in at {new Date(guest.checkedInAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.loadingGuestList', 'Loading guest list...')}</p>
        </div>
      </div>
    );
  }

  // Main component return
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span className="text-sm text-cyan-500 font-medium">{t('tools.eventGuestList.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.eventGuestList.eventGuestList', 'Event Guest List')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.eventGuestList.manageEventsGuestsSeatingAnd', 'Manage events, guests, seating and check-ins')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sync Status */}
              <WidgetEmbedButton toolSlug="event-guest-list" toolName="Event Guest List" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              {selectedEvent && (
                <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.selectedEvent', 'Selected Event')}</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedEvent.name}</p>
                </div>
              )}
              {filteredGuests.length > 0 && (
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'event-guest-list' })}
                  onExportExcel={() => exportExcel({ filename: 'event-guest-list' })}
                  onExportJSON={() => exportJSON({ filename: 'event-guest-list' })}
                  onExportPDF={async () => {
                    await exportPDF({
                      filename: 'event-guest-list',
                      title: selectedEvent ? `${selectedEvent.name} - Guest List` : 'Event Guest List',
                      subtitle: `${filteredGuests.length} guest${filteredGuests.length !== 1 ? 's' : ''}`,
                    });
                  }}
                  onPrint={() => print(selectedEvent ? `${selectedEvent.name} - Guest List` : 'Event Guest List')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                />
              )}
            </div>
          </div>
        </div>

        {/* Stats Bar (when event selected) */}
        {selectedEventId && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.totalGuests', 'Total Guests')}</p>
              <p className="text-2xl font-bold text-cyan-500">{eventStats.totalGuests}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.confirmed', 'Confirmed')}</p>
              <p className="text-2xl font-bold text-green-500">{eventStats.confirmed}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.pending2', 'Pending')}</p>
              <p className="text-2xl font-bold text-yellow-500">{eventStats.pending}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.maybe', 'Maybe')}</p>
              <p className="text-2xl font-bold text-blue-500">{eventStats.maybe}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.declined', 'Declined')}</p>
              <p className="text-2xl font-bold text-red-500">{eventStats.declined}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventGuestList.invitationsSent', 'Invitations Sent')}</p>
              <p className="text-2xl font-bold text-purple-500">{eventStats.invitationsSent}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className={`p-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'} flex gap-1`}>
          {[
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'guests', label: 'Guests', icon: Users },
            { id: 'seating', label: 'Seating', icon: Grid3X3 },
            { id: 'checkin', label: 'Check-in', icon: ClipboardList },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/20'
                  : isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          {activeTab === 'events' && renderEventsTab()}
          {activeTab === 'guests' && renderGuestsTab()}
          {activeTab === 'seating' && renderSeatingTab()}
          {activeTab === 'checkin' && renderCheckInTab()}
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingEvent ? t('tools.eventGuestList.editEvent', 'Edit Event') : t('tools.eventGuestList.createEvent2', 'Create Event')}
                  </h2>
                  <button
                    onClick={resetEventForm}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Event Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.eventGuestList.eventName', 'Event Name *')}
                  </label>
                  <input
                    type="text"
                    value={eventFormData.name}
                    onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
                    placeholder={t('tools.eventGuestList.enterEventName', 'Enter event name')}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                    } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventGuestList.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={eventFormData.date}
                      onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventGuestList.time', 'Time')}
                    </label>
                    <input
                      type="time"
                      value={eventFormData.time}
                      onChange={(e) => setEventFormData({ ...eventFormData, time: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.eventGuestList.venue', 'Venue')}
                  </label>
                  <div className="relative">
                    <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={eventFormData.venue}
                      onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                      placeholder={t('tools.eventGuestList.enterVenue', 'Enter venue')}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                </div>

                {/* Capacity Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventGuestList.maxCapacity', 'Max Capacity')}
                    </label>
                    <input
                      type="number"
                      value={eventFormData.maxCapacity}
                      onChange={(e) => setEventFormData({ ...eventFormData, maxCapacity: parseInt(e.target.value) || 0 })}
                      min="1"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventGuestList.numberOfTables', 'Number of Tables')}
                    </label>
                    <input
                      type="number"
                      value={eventFormData.tableCount}
                      onChange={(e) => setEventFormData({ ...eventFormData, tableCount: parseInt(e.target.value) || 0 })}
                      min="1"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventGuestList.seatsPerTable', 'Seats per Table')}
                    </label>
                    <input
                      type="number"
                      value={eventFormData.seatsPerTable}
                      onChange={(e) => setEventFormData({ ...eventFormData, seatsPerTable: parseInt(e.target.value) || 0 })}
                      min="1"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.eventGuestList.description', 'Description')}
                  </label>
                  <textarea
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                    placeholder={t('tools.eventGuestList.eventDescription', 'Event description...')}
                    rows={3}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                    } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none`}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                {editingEvent && (
                  <button
                    onClick={() => handleDeleteEvent(editingEvent.id)}
                    className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                <div className={`flex items-center gap-3 ${!editingEvent ? 'ml-auto' : ''}`}>
                  <button
                    onClick={resetEventForm}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.eventGuestList.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    disabled={!eventFormData.name || !eventFormData.date}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-medium flex items-center gap-2 hover:from-cyan-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {editingEvent ? t('tools.eventGuestList.update', 'Update') : t('tools.eventGuestList.create', 'Create')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest Modal */}
        {showGuestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingGuest ? t('tools.eventGuestList.editGuest', 'Edit Guest') : t('tools.eventGuestList.addGuest2', 'Add Guest')}
                  </h2>
                  <button
                    onClick={resetGuestForm}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Guest Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.eventGuestList.guestName', 'Guest Name *')}
                  </label>
                  <input
                    type="text"
                    value={guestFormData.name}
                    onChange={(e) => setGuestFormData({ ...guestFormData, name: e.target.value })}
                    placeholder={t('tools.eventGuestList.enterGuestName', 'Enter guest name')}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                    } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventGuestList.email', 'Email')}
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="email"
                        value={guestFormData.email}
                        onChange={(e) => setGuestFormData({ ...guestFormData, email: e.target.value })}
                        placeholder={t('tools.eventGuestList.emailExampleCom', 'email@example.com')}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                            : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                        } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventGuestList.phone', 'Phone')}
                    </label>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="tel"
                        value={guestFormData.phone}
                        onChange={(e) => setGuestFormData({ ...guestFormData, phone: e.target.value })}
                        placeholder="+1 555-0100"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                            : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                        } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                      />
                    </div>
                  </div>
                </div>

                {/* RSVP Status */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.eventGuestList.rsvpStatus', 'RSVP Status')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RSVP_STATUS_OPTIONS.map(status => (
                      <button
                        key={status.value}
                        onClick={() => setGuestFormData({ ...guestFormData, rsvpStatus: status.value as Guest['rsvpStatus'] })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                          guestFormData.rsvpStatus === status.value
                            ? `${status.color} text-white`
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <status.icon className="w-4 h-4" />
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.eventGuestList.category2', 'Category')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map(category => (
                      <button
                        key={category.value}
                        onClick={() => setGuestFormData({ ...guestFormData, category: category.value as Guest['category'] })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                          guestFormData.category === category.value
                            ? `${category.color} text-white`
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <category.icon className="w-4 h-4" />
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plus Ones and Table */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventGuestList.plusOnes2', 'Plus Ones')}
                    </label>
                    <input
                      type="number"
                      value={guestFormData.plusOnes}
                      onChange={(e) => setGuestFormData({ ...guestFormData, plusOnes: parseInt(e.target.value) || 0 })}
                      min="0"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventGuestList.tableAssignment', 'Table Assignment')}
                    </label>
                    <select
                      value={guestFormData.tableAssignment || ''}
                      onChange={(e) => setGuestFormData({ ...guestFormData, tableAssignment: parseInt(e.target.value) || null })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    >
                      <option value="">{t('tools.eventGuestList.unassigned', 'Unassigned')}</option>
                      {selectedEvent && Array.from({ length: selectedEvent.tableCount }, (_, i) => i + 1).map(t => (
                        <option key={t} value={t}>Table {t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.eventGuestList.seatNumber', 'Seat Number')}
                    </label>
                    <input
                      type="number"
                      value={guestFormData.seatNumber || ''}
                      onChange={(e) => setGuestFormData({ ...guestFormData, seatNumber: parseInt(e.target.value) || null })}
                      min="1"
                      placeholder={t('tools.eventGuestList.optional', 'Optional')}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.eventGuestList.dietaryRestrictions', 'Dietary Restrictions')}
                  </label>
                  <div className="relative">
                    <Utensils className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={guestFormData.dietaryRestrictions}
                      onChange={(e) => setGuestFormData({ ...guestFormData, dietaryRestrictions: e.target.value })}
                      placeholder={t('tools.eventGuestList.eGVegetarianGlutenFree', 'e.g., Vegetarian, Gluten-free, Nut allergy')}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                </div>

                {/* Flags */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={guestFormData.invitationSent}
                        onChange={(e) => setGuestFormData({ ...guestFormData, invitationSent: e.target.checked })}
                        className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.eventGuestList.invitationSent', 'Invitation Sent')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={guestFormData.checkedIn}
                        onChange={(e) => setGuestFormData({ ...guestFormData, checkedIn: e.target.checked })}
                        className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.eventGuestList.checkedIn2', 'Checked In')}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.eventGuestList.notes', 'Notes')}
                  </label>
                  <textarea
                    value={guestFormData.notes}
                    onChange={(e) => setGuestFormData({ ...guestFormData, notes: e.target.value })}
                    placeholder={t('tools.eventGuestList.additionalNotes', 'Additional notes...')}
                    rows={2}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                    } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none`}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                {editingGuest && (
                  <button
                    onClick={() => handleDeleteGuest(editingGuest.id)}
                    className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                <div className={`flex items-center gap-3 ${!editingGuest ? 'ml-auto' : ''}`}>
                  <button
                    onClick={resetGuestForm}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.eventGuestList.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSaveGuest}
                    disabled={!guestFormData.name}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-medium flex items-center gap-2 hover:from-cyan-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {editingGuest ? t('tools.eventGuestList.update2', 'Update') : t('tools.eventGuestList.add', 'Add')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default EventGuestListTool;
