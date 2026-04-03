'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Check,
  X,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Send,
  UserCheck,
  UserX,
  HelpCircle,
  MapPin,
  Calendar,
  MessageSquare,
  Utensils,
  Baby,
  Accessibility,
  BarChart3,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';

// Interfaces
interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rsvpStatus: RSVPStatus;
  category: GuestCategory;
  tableNumber: string;
  plusOne: boolean;
  plusOneName: string;
  dietaryRestrictions: string[];
  specialNeeds: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  invitationSent: boolean;
  invitationSentDate: string;
  responseDate: string;
  notes: string;
  eventId: string;
  createdAt: string;
}

interface GuestGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  guestCount: number;
  createdAt: string;
}

// Types
type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';
type GuestCategory = 'family' | 'friends' | 'colleagues' | 'vip' | 'plus-one' | 'other';
type TabType = 'guests' | 'groups' | 'analytics';

// Constants
const RSVP_STATUSES: { value: RSVPStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow', icon: <Clock className="w-4 h-4" /> },
  { value: 'confirmed', label: 'Confirmed', color: 'green', icon: <Check className="w-4 h-4" /> },
  { value: 'declined', label: 'Declined', color: 'red', icon: <X className="w-4 h-4" /> },
  { value: 'maybe', label: 'Maybe', color: 'blue', icon: <HelpCircle className="w-4 h-4" /> },
];

const GUEST_CATEGORIES: { value: GuestCategory; label: string }[] = [
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' },
  { value: 'colleagues', label: 'Colleagues' },
  { value: 'vip', label: 'VIP' },
  { value: 'plus-one', label: 'Plus One' },
  { value: 'other', label: 'Other' },
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut Allergy',
  'Shellfish Allergy',
  'Kosher',
  'Halal',
  'No Pork',
  'No Beef',
];

const GROUP_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

// Column configurations for export
const guestColumns: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name' },
  { key: 'lastName', header: 'Last Name' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'rsvpStatus', header: 'RSVP Status' },
  { key: 'category', header: 'Category' },
  { key: 'tableNumber', header: 'Table #' },
  { key: 'plusOne', header: 'Plus One', transform: (v: boolean) => v ? 'Yes' : 'No' },
  { key: 'plusOneName', header: 'Plus One Name' },
  { key: 'dietaryRestrictions', header: 'Dietary Restrictions', transform: (v: string[]) => v.join(', ') },
  { key: 'specialNeeds', header: 'Special Needs' },
  { key: 'address', header: 'Address' },
  { key: 'city', header: 'City' },
  { key: 'state', header: 'State' },
  { key: 'zipCode', header: 'Zip Code' },
  { key: 'invitationSent', header: 'Invitation Sent', transform: (v: boolean) => v ? 'Yes' : 'No' },
  { key: 'invitationSentDate', header: 'Sent Date' },
  { key: 'responseDate', header: 'Response Date' },
  { key: 'notes', header: 'Notes' },
];

const groupColumns: ColumnConfig[] = [
  { key: 'name', header: 'Group Name' },
  { key: 'description', header: 'Description' },
  { key: 'guestCount', header: 'Guest Count' },
  { key: 'createdAt', header: 'Created' },
];

// Sample data generators
const generateSampleGuests = (): Guest[] => [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    rsvpStatus: 'confirmed',
    category: 'family',
    tableNumber: '1',
    plusOne: true,
    plusOneName: 'Jane Smith',
    dietaryRestrictions: [],
    specialNeeds: '',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    invitationSent: true,
    invitationSentDate: '2024-01-15',
    responseDate: '2024-01-20',
    notes: 'Uncle of the bride',
    eventId: 'event-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 234-5678',
    rsvpStatus: 'pending',
    category: 'friends',
    tableNumber: '',
    plusOne: false,
    plusOneName: '',
    dietaryRestrictions: ['Vegetarian'],
    specialNeeds: '',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    invitationSent: true,
    invitationSentDate: '2024-01-15',
    responseDate: '',
    notes: 'College roommate',
    eventId: 'event-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.b@company.com',
    phone: '(555) 345-6789',
    rsvpStatus: 'declined',
    category: 'colleagues',
    tableNumber: '',
    plusOne: false,
    plusOneName: '',
    dietaryRestrictions: [],
    specialNeeds: '',
    address: '789 Business Blvd',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    invitationSent: true,
    invitationSentDate: '2024-01-15',
    responseDate: '2024-01-22',
    notes: 'Has conflict with another event',
    eventId: 'event-1',
    createdAt: new Date().toISOString(),
  },
];

const generateSampleGroups = (): GuestGroup[] => [
  {
    id: '1',
    name: 'Bride\'s Family',
    description: 'Immediate and extended family of the bride',
    color: '#3B82F6',
    guestCount: 25,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Groom\'s Family',
    description: 'Immediate and extended family of the groom',
    color: '#10B981',
    guestCount: 22,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Work Friends',
    description: 'Colleagues from work',
    color: '#F59E0B',
    guestCount: 15,
    createdAt: new Date().toISOString(),
  },
];

interface UIConfig {
  params?: {
    guestName?: string;
    email?: string;
    phone?: string;
    category?: GuestCategory;
    eventName?: string;
    rsvpStatus?: RSVPStatus;
    tableNumber?: string;
    dietaryRestrictions?: string[];
  };
}

interface GuestListToolProps {
  uiConfig?: UIConfig;
}

export function GuestListTool({ uiConfig }: GuestListToolProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<TabType>('guests');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RSVPStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<GuestCategory | 'all'>('all');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editingGroup, setEditingGroup] = useState<GuestGroup | null>(null);

  // Use useToolData for guests
  const {
    data: guests,
    setData: setGuests,
    addItem: addGuest,
    updateItem: updateGuest,
    deleteItem: deleteGuest,
    exportCSV: exportGuestsCSV,
    exportExcel: exportGuestsExcel,
    exportJSON: exportGuestsJSON,
    exportPDF: exportGuestsPDF,
    isSynced: guestsSynced,
    isSaving: guestsSaving,
    lastSaved: guestsLastSaved,
    syncError: guestsSyncError,
  } = useToolData<Guest>({
    toolId: 'guest-list-guests',
    initialData: generateSampleGuests(),
    columns: guestColumns,
  });

  // Use useToolData for groups
  const {
    data: groups,
    setData: setGroups,
    addItem: addGroup,
    updateItem: updateGroup,
    deleteItem: deleteGroup,
    exportCSV: exportGroupsCSV,
    exportExcel: exportGroupsExcel,
    exportJSON: exportGroupsJSON,
    exportPDF: exportGroupsPDF,
    isSynced: groupsSynced,
    isSaving: groupsSaving,
    lastSaved: groupsLastSaved,
    syncError: groupsSyncError,
  } = useToolData<GuestGroup>({
    toolId: 'guest-list-groups',
    initialData: generateSampleGroups(),
    columns: groupColumns,
  });

  // Form state for guest
  const [guestForm, setGuestForm] = useState<Partial<Guest>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    rsvpStatus: 'pending',
    category: 'friends',
    tableNumber: '',
    plusOne: false,
    plusOneName: '',
    dietaryRestrictions: [],
    specialNeeds: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    invitationSent: false,
    invitationSentDate: '',
    responseDate: '',
    notes: '',
    eventId: '',
  });

  // Form state for group
  const [groupForm, setGroupForm] = useState<Partial<GuestGroup>>({
    name: '',
    description: '',
    color: GROUP_COLORS[0],
    guestCount: 0,
  });

  // Handle prefill from uiConfig
  React.useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      const nameParts = params.guestName?.split(' ') || [];
      setGuestForm(prev => ({
        ...prev,
        firstName: nameParts[0] || prev.firstName,
        lastName: nameParts.slice(1).join(' ') || prev.lastName,
        email: params.email || prev.email,
        phone: params.phone || prev.phone,
        category: params.category || prev.category,
        rsvpStatus: params.rsvpStatus || prev.rsvpStatus,
        tableNumber: params.tableNumber || prev.tableNumber,
        dietaryRestrictions: params.dietaryRestrictions || prev.dietaryRestrictions,
      }));
      if (params.guestName || params.email) {
        setShowGuestModal(true);
      }
    }
  }, [uiConfig]);

  // Filter guests
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      const matchesSearch =
        `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.phone.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || guest.rsvpStatus === statusFilter;
      const matchesCategory = categoryFilter === 'all' || guest.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [guests, searchQuery, statusFilter, categoryFilter]);

  // Analytics
  const analytics = useMemo(() => {
    const totalGuests = guests.length;
    const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed').length;
    const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined').length;
    const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending').length;
    const maybeGuests = guests.filter(g => g.rsvpStatus === 'maybe').length;

    const plusOnes = guests.filter(g => g.plusOne).length;
    const invitationsSent = guests.filter(g => g.invitationSent).length;

    const categoryBreakdown = GUEST_CATEGORIES.map(cat => ({
      category: cat.label,
      count: guests.filter(g => g.category === cat.value).length,
    }));

    const dietaryBreakdown = DIETARY_OPTIONS.map(diet => ({
      restriction: diet,
      count: guests.filter(g => g.dietaryRestrictions.includes(diet)).length,
    })).filter(d => d.count > 0);

    const totalAttending = confirmedGuests + plusOnes;
    const responseRate = totalGuests > 0 ? ((confirmedGuests + declinedGuests) / totalGuests) * 100 : 0;

    return {
      totalGuests,
      confirmedGuests,
      declinedGuests,
      pendingGuests,
      maybeGuests,
      plusOnes,
      invitationsSent,
      totalAttending,
      responseRate,
      categoryBreakdown,
      dietaryBreakdown,
    };
  }, [guests]);

  // Handlers
  const handleSaveGuest = () => {
    if (!guestForm.firstName || !guestForm.lastName) return;

    if (editingGuest) {
      updateGuest(editingGuest.id, guestForm);
    } else {
      const newGuest: Guest = {
        id: Date.now().toString(),
        firstName: guestForm.firstName || '',
        lastName: guestForm.lastName || '',
        email: guestForm.email || '',
        phone: guestForm.phone || '',
        rsvpStatus: guestForm.rsvpStatus || 'pending',
        category: guestForm.category || 'friends',
        tableNumber: guestForm.tableNumber || '',
        plusOne: guestForm.plusOne || false,
        plusOneName: guestForm.plusOneName || '',
        dietaryRestrictions: guestForm.dietaryRestrictions || [],
        specialNeeds: guestForm.specialNeeds || '',
        address: guestForm.address || '',
        city: guestForm.city || '',
        state: guestForm.state || '',
        zipCode: guestForm.zipCode || '',
        invitationSent: guestForm.invitationSent || false,
        invitationSentDate: guestForm.invitationSentDate || '',
        responseDate: guestForm.responseDate || '',
        notes: guestForm.notes || '',
        eventId: guestForm.eventId || '',
        createdAt: new Date().toISOString(),
      };
      addGuest(newGuest);
    }

    resetGuestForm();
  };

  const handleSaveGroup = () => {
    if (!groupForm.name) return;

    if (editingGroup) {
      updateGroup(editingGroup.id, groupForm);
    } else {
      const newGroup: GuestGroup = {
        id: Date.now().toString(),
        name: groupForm.name || '',
        description: groupForm.description || '',
        color: groupForm.color || GROUP_COLORS[0],
        guestCount: groupForm.guestCount || 0,
        createdAt: new Date().toISOString(),
      };
      addGroup(newGroup);
    }

    resetGroupForm();
  };

  const resetGuestForm = () => {
    setGuestForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      rsvpStatus: 'pending',
      category: 'friends',
      tableNumber: '',
      plusOne: false,
      plusOneName: '',
      dietaryRestrictions: [],
      specialNeeds: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      invitationSent: false,
      invitationSentDate: '',
      responseDate: '',
      notes: '',
      eventId: '',
    });
    setEditingGuest(null);
    setShowGuestModal(false);
  };

  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      description: '',
      color: GROUP_COLORS[0],
      guestCount: 0,
    });
    setEditingGroup(null);
    setShowGroupModal(false);
  };

  const handleEditGuest = (guest: Guest) => {
    setGuestForm(guest);
    setEditingGuest(guest);
    setShowGuestModal(true);
  };

  const handleEditGroup = (group: GuestGroup) => {
    setGroupForm(group);
    setEditingGroup(group);
    setShowGroupModal(true);
  };

  const handleDeleteGuest = async (id: string) => {
    const confirmed = await confirm({
      title: 'Remove Guest',
      message: 'Are you sure you want to remove this guest?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteGuest(id);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Group',
      message: 'Are you sure you want to delete this group?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteGroup(id);
    }
  };

  const handleUpdateRSVP = (guestId: string, status: RSVPStatus) => {
    updateGuest(guestId, {
      rsvpStatus: status,
      responseDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleSendInvitation = (guestId: string) => {
    updateGuest(guestId, {
      invitationSent: true,
      invitationSentDate: new Date().toISOString().split('T')[0],
    });
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const current = guestForm.dietaryRestrictions || [];
    if (current.includes(restriction)) {
      setGuestForm(prev => ({
        ...prev,
        dietaryRestrictions: current.filter(r => r !== restriction),
      }));
    } else {
      setGuestForm(prev => ({
        ...prev,
        dietaryRestrictions: [...current, restriction],
      }));
    }
  };

  const getRSVPColor = (status: RSVPStatus) => {
    const statusInfo = RSVP_STATUSES.find(s => s.value === status);
    return statusInfo?.color || 'gray';
  };

  const getRSVPIcon = (status: RSVPStatus) => {
    const statusInfo = RSVP_STATUSES.find(s => s.value === status);
    return statusInfo?.icon || <Clock className="w-4 h-4" />;
  };

  // Render tabs
  const tabs = [
    { id: 'guests' as TabType, label: 'Guests', icon: <Users className="w-4 h-4" /> },
    { id: 'groups' as TabType, label: 'Groups', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'analytics' as TabType, label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                <Users className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.guestList.guestListManager', 'Guest List Manager')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.guestList.manageYourEventGuestsAnd', 'Manage your event guests and RSVPs')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="guest-list" toolName="Guest List" />

              <SyncStatus
                isSynced={guestsSynced && groupsSynced}
                isSaving={guestsSaving || groupsSaving}
                lastSaved={guestsLastSaved || groupsLastSaved}
                error={guestsSyncError || groupsSyncError}
              />
              <ExportDropdown
                onExportCSV={activeTab === 'guests' ? exportGuestsCSV : exportGroupsCSV}
                onExportExcel={activeTab === 'guests' ? exportGuestsExcel : exportGroupsExcel}
                onExportJSON={activeTab === 'guests' ? exportGuestsJSON : exportGroupsJSON}
                onExportPDF={activeTab === 'guests' ? exportGuestsPDF : exportGroupsPDF}
              />
              <button
                onClick={() => activeTab === 'guests' ? setShowGuestModal(true) : setShowGroupModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {activeTab === 'guests' ? t('tools.guestList.addGuest', 'Add Guest') : t('tools.guestList.addGroup', 'Add Group')}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : isDark
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                    <Users className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.totalGuests}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestList.totalGuests', 'Total Guests')}</p>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
                    <UserCheck className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.confirmedGuests}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestList.confirmed', 'Confirmed')}</p>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
                    <Clock className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.pendingGuests}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestList.pending', 'Pending')}</p>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                    <TrendingUp className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.responseRate.toFixed(0)}%
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestList.responseRate', 'Response Rate')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-6`}>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder={t('tools.guestList.searchGuests', 'Search guests...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as RSVPStatus | 'all')}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="all">{t('tools.guestList.allStatus', 'All Status')}</option>
                  {RSVP_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as GuestCategory | 'all')}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="all">{t('tools.guestList.allCategories', 'All Categories')}</option>
                  {GUEST_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guest List */}
            <div className="space-y-3">
              <AnimatePresence>
                {filteredGuests.map((guest) => (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {guest.firstName[0]}{guest.lastName[0]}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {guest.firstName} {guest.lastName}
                            {guest.plusOne && (
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                              }`}>
                                +1
                              </span>
                            )}
                          </h3>
                          <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {guest.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {guest.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {GUEST_CATEGORIES.find(c => c.value === guest.category)?.label}
                        </span>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          getRSVPColor(guest.rsvpStatus) === 'green'
                            ? isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'
                            : getRSVPColor(guest.rsvpStatus) === 'red'
                            ? isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'
                            : getRSVPColor(guest.rsvpStatus) === 'yellow'
                            ? isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                            : isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {getRSVPIcon(guest.rsvpStatus)}
                          <span className="ml-1">{RSVP_STATUSES.find(s => s.value === guest.rsvpStatus)?.label}</span>
                        </div>
                        {guest.tableNumber && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            Table {guest.tableNumber}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          {!guest.invitationSent && (
                            <button
                              onClick={() => handleSendInvitation(guest.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                              }`}
                              title={t('tools.guestList.sendInvitation', 'Send Invitation')}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditGuest(guest)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {(guest.dietaryRestrictions.length > 0 || guest.specialNeeds || guest.plusOneName) && (
                      <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex flex-wrap gap-2">
                          {guest.dietaryRestrictions.map((diet, idx) => (
                            <span
                              key={idx}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                isDark ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-600'
                              }`}
                            >
                              <Utensils className="w-3 h-3" />
                              {diet}
                            </span>
                          ))}
                          {guest.specialNeeds && (
                            <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                              isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                            }`}>
                              <Accessibility className="w-3 h-3" />
                              {guest.specialNeeds}
                            </span>
                          )}
                          {guest.plusOneName && (
                            <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                              isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'
                            }`}>
                              <UserPlus className="w-3 h-3" />
                              +1: {guest.plusOneName}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredGuests.length === 0 && (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.guestList.noGuestsFound', 'No guests found')}</p>
                  <p className="text-sm mt-1">{t('tools.guestList.addGuestsOrAdjustYour', 'Add guests or adjust your filters')}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {group.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditGroup(group)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {group.description}
                </p>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Users className="w-4 h-4" />
                  <span>{group.guestCount} guests</span>
                </div>
              </motion.div>
            ))}

            {groups.length === 0 && (
              <div className={`col-span-full text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.guestList.noGroupsCreatedYet', 'No groups created yet')}</p>
                <p className="text-sm mt-1">{t('tools.guestList.createGroupsToOrganizeYour', 'Create groups to organize your guests')}</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* RSVP Overview */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.guestList.rsvpOverview', 'RSVP Overview')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.totalGuests}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestList.totalInvited', 'Total Invited')}</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {analytics.confirmedGuests}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-green-400/70' : 'text-green-600/70'}`}>{t('tools.guestList.confirmed2', 'Confirmed')}</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {analytics.pendingGuests}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-yellow-400/70' : 'text-yellow-600/70'}`}>{t('tools.guestList.pending2', 'Pending')}</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {analytics.declinedGuests}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-red-400/70' : 'text-red-600/70'}`}>{t('tools.guestList.declined', 'Declined')}</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {analytics.maybeGuests}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-blue-400/70' : 'text-blue-600/70'}`}>{t('tools.guestList.maybe', 'Maybe')}</p>
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.guestList.expectedAttendance', 'Expected Attendance')}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.guestList.confirmedGuests', 'Confirmed Guests')}</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.confirmedGuests}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.guestList.plusOnes', 'Plus Ones')}</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analytics.plusOnes}
                    </span>
                  </div>
                  <div className={`flex justify-between items-center pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestList.totalAttending', 'Total Attending')}</span>
                    <span className={`text-xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      {analytics.totalAttending}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.guestList.categoryBreakdown', 'Category Breakdown')}
                </h3>
                <div className="space-y-3">
                  {analytics.categoryBreakdown.filter(c => c.count > 0).map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {cat.category}
                          </span>
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {cat.count}
                          </span>
                        </div>
                        <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-full rounded-full bg-purple-500"
                            style={{ width: `${(cat.count / analytics.totalGuests) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dietary Restrictions */}
            {analytics.dietaryBreakdown.length > 0 && (
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.guestList.dietaryRestrictions', 'Dietary Restrictions')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {analytics.dietaryBreakdown.map((diet, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        isDark ? 'bg-orange-900/30' : 'bg-orange-50'
                      }`}
                    >
                      <Utensils className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                      <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>
                        {diet.restriction}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {diet.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invitation Status */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.guestList.invitationStatus', 'Invitation Status')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <Send className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    <div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {analytics.invitationsSent}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestList.invitationsSent', 'Invitations Sent')}</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <Clock className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    <div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {analytics.totalGuests - analytics.invitationsSent}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestList.notYetSent', 'Not Yet Sent')}</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <TrendingUp className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    <div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {analytics.responseRate.toFixed(0)}%
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestList.responseRate2', 'Response Rate')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guest Modal */}
      <AnimatePresence>
        {showGuestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => resetGuestForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-xl`}
            >
              <div className={`sticky top-0 p-6 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingGuest ? t('tools.guestList.editGuest', 'Edit Guest') : t('tools.guestList.addNewGuest', 'Add New Guest')}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guestList.basicInformation', 'Basic Information')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.guestList.firstName', 'First Name *')}
                      </label>
                      <input
                        type="text"
                        value={guestForm.firstName || ''}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.guestList.lastName', 'Last Name *')}
                      </label>
                      <input
                        type="text"
                        value={guestForm.lastName || ''}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.guestList.email', 'Email')}
                      </label>
                      <input
                        type="email"
                        value={guestForm.email || ''}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.guestList.phone', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        value={guestForm.phone || ''}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, phone: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>
                  </div>
                </div>

                {/* Category & RSVP */}
                <div>
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guestList.categoryRsvp', 'Category & RSVP')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.guestList.category', 'Category')}
                      </label>
                      <select
                        value={guestForm.category || 'friends'}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, category: e.target.value as GuestCategory }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-purple-500`}
                      >
                        {GUEST_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.guestList.rsvpStatus', 'RSVP Status')}
                      </label>
                      <select
                        value={guestForm.rsvpStatus || 'pending'}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, rsvpStatus: e.target.value as RSVPStatus }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-purple-500`}
                      >
                        {RSVP_STATUSES.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.guestList.tableNumber', 'Table Number')}
                      </label>
                      <input
                        type="text"
                        value={guestForm.tableNumber || ''}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, tableNumber: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>
                  </div>
                </div>

                {/* Plus One */}
                <div>
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guestList.plusOne', 'Plus One')}
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={guestForm.plusOne || false}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, plusOne: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.guestList.hasPlusOne', 'Has Plus One')}</span>
                    </label>
                    {guestForm.plusOne && (
                      <input
                        type="text"
                        placeholder={t('tools.guestList.plusOneName', 'Plus One Name')}
                        value={guestForm.plusOneName || ''}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, plusOneName: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-purple-500`}
                      />
                    )}
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guestList.dietaryRestrictions2', 'Dietary Restrictions')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((diet) => (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => toggleDietaryRestriction(diet)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          (guestForm.dietaryRestrictions || []).includes(diet)
                            ? 'bg-orange-500 text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {diet}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Needs */}
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.guestList.specialNeedsAccessibility', 'Special Needs / Accessibility')}
                  </label>
                  <input
                    type="text"
                    value={guestForm.specialNeeds || ''}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, specialNeeds: e.target.value }))}
                    placeholder={t('tools.guestList.eGWheelchairAccessHearing', 'e.g., Wheelchair access, hearing assistance')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:ring-2 focus:ring-purple-500`}
                  />
                </div>

                {/* Address */}
                <div>
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.guestList.addressForInvitations', 'Address (for invitations)')}
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={t('tools.guestList.streetAddress', 'Street Address')}
                      value={guestForm.address || ''}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, address: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      } focus:ring-2 focus:ring-purple-500`}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder={t('tools.guestList.city', 'City')}
                        value={guestForm.city || ''}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, city: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        } focus:ring-2 focus:ring-purple-500`}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.guestList.state', 'State')}
                        value={guestForm.state || ''}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, state: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        } focus:ring-2 focus:ring-purple-500`}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.guestList.zip', 'ZIP')}
                        value={guestForm.zipCode || ''}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, zipCode: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        } focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.guestList.notes', 'Notes')}
                  </label>
                  <textarea
                    value={guestForm.notes || ''}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-purple-500`}
                  />
                </div>
              </div>
              <div className={`sticky bottom-0 p-6 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={resetGuestForm}
                    className={`px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.guestList.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSaveGuest}
                    disabled={!guestForm.firstName || !guestForm.lastName}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingGuest ? t('tools.guestList.updateGuest', 'Update Guest') : t('tools.guestList.addGuest2', 'Add Guest')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Modal */}
      <AnimatePresence>
        {showGroupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => resetGroupForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-xl`}
            >
              <div className="p-6">
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingGroup ? t('tools.guestList.editGroup', 'Edit Group') : t('tools.guestList.createNewGroup', 'Create New Group')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.guestList.groupName', 'Group Name *')}
                    </label>
                    <input
                      type="text"
                      value={groupForm.name || ''}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.guestList.description', 'Description')}
                    </label>
                    <textarea
                      value={groupForm.description || ''}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.guestList.color', 'Color')}
                    </label>
                    <div className="flex gap-2">
                      {GROUP_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setGroupForm(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full transition-transform ${
                            groupForm.color === color ? 'ring-2 ring-offset-2 ring-purple-500 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={resetGroupForm}
                    className={`px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.guestList.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSaveGroup}
                    disabled={!groupForm.name}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingGroup ? t('tools.guestList.updateGroup', 'Update Group') : t('tools.guestList.createGroup', 'Create Group')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog />
    </div>
  );
}

export default GuestListTool;
