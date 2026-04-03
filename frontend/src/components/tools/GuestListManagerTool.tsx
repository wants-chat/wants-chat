'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '@/hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  MapPin,
  Utensils,
  Gift,
  Check,
  X,
  Clock,
  Send,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Table2,
  LayoutGrid,
  FileSpreadsheet,
  Heart,
  Plus,
  Minus,
  Save,
  RefreshCw
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Types
interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  group: GuestGroup;
  rsvpStatus: RSVPStatus;
  plusOne: boolean;
  plusOneName: string;
  plusOneConfirmed: boolean;
  mealPreference: MealPreference;
  dietaryRestrictions: string[];
  tableAssignment: number | null;
  giftReceived: boolean;
  giftDescription: string;
  thankYouSent: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

type RSVPStatus = 'invited' | 'pending' | 'confirmed' | 'declined';
type GuestGroup = 'family' | 'friends' | 'work' | 'school' | 'neighbors' | 'other';
type MealPreference = 'standard' | 'vegetarian' | 'vegan' | 'pescatarian' | 'halal' | 'kosher' | 'gluten-free' | 'other';

interface GuestFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  group: GuestGroup;
  rsvpStatus: RSVPStatus;
  plusOne: boolean;
  plusOneName: string;
  plusOneConfirmed: boolean;
  mealPreference: MealPreference;
  dietaryRestrictions: string[];
  tableAssignment: number | null;
  giftReceived: boolean;
  giftDescription: string;
  thankYouSent: boolean;
  notes: string;
}

interface TableConfig {
  id: number;
  name: string;
  capacity: number;
}

// Constants
const STORAGE_KEY = 'guest-list-manager-data';

const RSVP_STATUS_CONFIG: Record<RSVPStatus, { label: string; color: string; bgColor: string }> = {
  invited: { label: 'Invited', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  pending: { label: 'Pending', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  confirmed: { label: 'Confirmed', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  declined: { label: 'Declined', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' }
};

const GROUP_CONFIG: Record<GuestGroup, { label: string; color: string }> = {
  family: { label: 'Family', color: 'text-purple-600 dark:text-purple-400' },
  friends: { label: 'Friends', color: 'text-blue-600 dark:text-blue-400' },
  work: { label: 'Work', color: 'text-green-600 dark:text-green-400' },
  school: { label: 'School', color: 'text-orange-600 dark:text-orange-400' },
  neighbors: { label: 'Neighbors', color: 'text-teal-600 dark:text-teal-400' },
  other: { label: 'Other', color: 'text-gray-600 dark:text-gray-400' }
};

const MEAL_OPTIONS: { value: MealPreference; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'other', label: 'Other' }
];

const DIETARY_RESTRICTIONS = [
  'Nut Allergy',
  'Dairy-Free',
  'Shellfish Allergy',
  'Soy-Free',
  'Egg-Free',
  'Low Sodium',
  'Diabetic-Friendly'
];

// Column configuration for exports
const GUEST_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'group', header: 'Group', type: 'string' },
  { key: 'rsvpStatus', header: 'RSVP Status', type: 'string' },
  { key: 'plusOne', header: 'Plus One', type: 'boolean' },
  { key: 'plusOneName', header: 'Plus One Name', type: 'string' },
  { key: 'mealPreference', header: 'Meal', type: 'string' },
  { key: 'tableAssignment', header: 'Table #', type: 'number' },
  { key: 'giftReceived', header: 'Gift Received', type: 'boolean' },
  { key: 'thankYouSent', header: 'Thank You Sent', type: 'boolean' },
];

// Default empty guests array
const DEFAULT_GUESTS: Guest[] = [];

const DEFAULT_FORM_DATA: GuestFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  group: 'friends',
  rsvpStatus: 'invited',
  plusOne: false,
  plusOneName: '',
  plusOneConfirmed: false,
  mealPreference: 'standard',
  dietaryRestrictions: [],
  tableAssignment: null,
  giftReceived: false,
  giftDescription: '',
  thankYouSent: false,
  notes: ''
};

const generateId = () => `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface GuestListManagerToolProps {
  uiConfig?: UIConfig;
}

export function GuestListManagerTool({ uiConfig }: GuestListManagerToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use hook for backend sync
  const {
    data: guests,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
  } = useToolData<Guest>('guest-list-manager', DEFAULT_GUESTS, GUEST_COLUMNS);

  // Local state
  const [tables, setTables] = useState<TableConfig[]>([
    { id: 1, name: 'Table 1', capacity: 8 },
    { id: 2, name: 'Table 2', capacity: 8 },
    { id: 3, name: 'Table 3', capacity: 8 },
    { id: 4, name: 'Table 4', capacity: 8 },
    { id: 5, name: 'Table 5', capacity: 8 },
    { id: 6, name: 'Table 6', capacity: 8 },
    { id: 7, name: 'Table 7', capacity: 10 },
    { id: 8, name: 'Table 8', capacity: 10 }
  ]);
  const [formData, setFormData] = useState<GuestFormData>(DEFAULT_FORM_DATA);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<GuestGroup | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<RSVPStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'seating' | 'summary'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'group' | 'rsvpStatus' | 'tableAssignment'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedGuest, setExpandedGuest] = useState<string | null>(null);

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.guestName) {
        setFormData(prev => ({ ...prev, name: params.guestName as string }));
        hasChanges = true;
      }
      if (params.email) {
        setFormData(prev => ({ ...prev, email: params.email as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Computed values
  const filteredGuests = useMemo(() => {
    let result = [...guests];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.name.toLowerCase().includes(query) ||
        g.email.toLowerCase().includes(query) ||
        g.phone.includes(query)
      );
    }

    // Group filter
    if (filterGroup !== 'all') {
      result = result.filter(g => g.group === filterGroup);
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(g => g.rsvpStatus === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'group':
          comparison = a.group.localeCompare(b.group);
          break;
        case 'rsvpStatus':
          const statusOrder = { confirmed: 0, pending: 1, invited: 2, declined: 3 };
          comparison = statusOrder[a.rsvpStatus] - statusOrder[b.rsvpStatus];
          break;
        case 'tableAssignment':
          comparison = (a.tableAssignment || 999) - (b.tableAssignment || 999);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [guests, searchQuery, filterGroup, filterStatus, sortField, sortDirection]);

  const guestStats = useMemo(() => {
    const totalInvited = guests.length;
    const confirmed = guests.filter(g => g.rsvpStatus === 'confirmed').length;
    const declined = guests.filter(g => g.rsvpStatus === 'declined').length;
    const pending = guests.filter(g => g.rsvpStatus === 'pending' || g.rsvpStatus === 'invited').length;

    const confirmedPlusOnes = guests.filter(g => g.rsvpStatus === 'confirmed' && g.plusOne && g.plusOneConfirmed).length;
    const totalAttending = confirmed + confirmedPlusOnes;

    const giftsReceived = guests.filter(g => g.giftReceived).length;
    const thankYousSent = guests.filter(g => g.thankYouSent).length;

    const mealCounts: Record<MealPreference, number> = {
      standard: 0, vegetarian: 0, vegan: 0, pescatarian: 0,
      halal: 0, kosher: 0, 'gluten-free': 0, other: 0
    };

    guests.filter(g => g.rsvpStatus === 'confirmed').forEach(g => {
      mealCounts[g.mealPreference]++;
      if (g.plusOne && g.plusOneConfirmed) {
        mealCounts[g.mealPreference]++;
      }
    });

    return {
      totalInvited,
      confirmed,
      declined,
      pending,
      confirmedPlusOnes,
      totalAttending,
      giftsReceived,
      thankYousSent,
      mealCounts
    };
  }, [guests]);

  const tableOccupancy = useMemo(() => {
    const occupancy: Record<number, Guest[]> = {};
    tables.forEach(t => { occupancy[t.id] = []; });

    guests.forEach(g => {
      if (g.tableAssignment && occupancy[g.tableAssignment]) {
        occupancy[g.tableAssignment].push(g);
      }
    });

    return occupancy;
  }, [guests, tables]);

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setValidationMessage('Please enter a guest name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      updateItem(editingId, { ...formData, updatedAt: now });
      setEditingId(null);
    } else {
      const newGuest: Guest = {
        id: generateId(),
        ...formData,
        createdAt: now,
        updatedAt: now
      };
      addItem(newGuest);
    }

    setFormData(DEFAULT_FORM_DATA);
    setShowForm(false);
  };

  const handleEdit = (guest: Guest) => {
    setFormData({
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      address: guest.address,
      group: guest.group,
      rsvpStatus: guest.rsvpStatus,
      plusOne: guest.plusOne,
      plusOneName: guest.plusOneName,
      plusOneConfirmed: guest.plusOneConfirmed,
      mealPreference: guest.mealPreference,
      dietaryRestrictions: guest.dietaryRestrictions,
      tableAssignment: guest.tableAssignment,
      giftReceived: guest.giftReceived,
      giftDescription: guest.giftDescription,
      thankYouSent: guest.thankYouSent,
      notes: guest.notes
    });
    setEditingId(guest.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Remove Guest',
      message: 'Are you sure you want to remove this guest?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleQuickStatusChange = (id: string, status: RSVPStatus) => {
    updateItem(id, { rsvpStatus: status, updatedAt: new Date().toISOString() });
  };

  const handleToggleThankYou = (id: string) => {
    const guest = guests.find(g => g.id === id);
    if (guest) {
      updateItem(id, { thankYouSent: !guest.thankYouSent, updatedAt: new Date().toISOString() });
    }
  };

  const handleToggleGift = (id: string) => {
    const guest = guests.find(g => g.id === id);
    if (guest) {
      updateItem(id, { giftReceived: !guest.giftReceived, updatedAt: new Date().toISOString() });
    }
  };

  const handleTableAssign = (guestId: string, tableId: number | null) => {
    updateItem(guestId, { tableAssignment: tableId, updatedAt: new Date().toISOString() });
  };

  const handleExportMailMerge = () => {
    const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed');
    const headers = ['Name', 'Email', 'Address', 'Table Assignment', 'Meal Preference'];

    const rows = confirmedGuests.map(g => [
      g.name,
      g.email,
      g.address,
      g.tableAssignment ? `Table ${g.tableAssignment}` : 'TBD',
      MEAL_OPTIONS.find(m => m.value === g.mealPreference)?.label || g.mealPreference
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mail-merge-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());

        const nameIdx = headers.findIndex(h => h === 'name');
        const emailIdx = headers.findIndex(h => h === 'email');
        const phoneIdx = headers.findIndex(h => h === 'phone');
        const addressIdx = headers.findIndex(h => h === 'address');
        const groupIdx = headers.findIndex(h => h === 'group');

        if (nameIdx === -1) {
          setValidationMessage('CSV must contain a "Name" column');
          setTimeout(() => setValidationMessage(null), 3000);
          return;
        }

        const newGuests: Guest[] = [];
        const now = new Date().toISOString();

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple CSV parsing (handles quoted fields)
          const values: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          const name = values[nameIdx]?.replace(/"/g, '').trim();
          if (!name) continue;

          const groupValue = values[groupIdx]?.replace(/"/g, '').trim().toLowerCase() as GuestGroup;
          const validGroup = Object.keys(GROUP_CONFIG).includes(groupValue) ? groupValue : 'other';

          newGuests.push({
            id: generateId(),
            name,
            email: values[emailIdx]?.replace(/"/g, '').trim() || '',
            phone: values[phoneIdx]?.replace(/"/g, '').trim() || '',
            address: values[addressIdx]?.replace(/"/g, '').trim() || '',
            group: validGroup,
            rsvpStatus: 'invited',
            plusOne: false,
            plusOneName: '',
            plusOneConfirmed: false,
            mealPreference: 'standard',
            dietaryRestrictions: [],
            tableAssignment: null,
            giftReceived: false,
            giftDescription: '',
            thankYouSent: false,
            notes: '',
            createdAt: now,
            updatedAt: now
          });
        }

        if (newGuests.length > 0) {
          newGuests.forEach(guest => addItem(guest));
          setValidationMessage(`Successfully imported ${newGuests.length} guests`);
          setTimeout(() => setValidationMessage(null), 3000);
        } else {
          setValidationMessage('No valid guests found in the file');
          setTimeout(() => setValidationMessage(null), 3000);
        }
      } catch (err) {
        console.error('Import error:', err);
        setValidationMessage('Failed to import file. Please check the format.');
        setTimeout(() => setValidationMessage(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearAllData = async () => {
    const confirmed = await confirm({
      title: 'Clear All Data',
      message: 'Are you sure you want to clear all guest data? This cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      // Delete all guests one by one (hook handles backend cleanup)
      guests.forEach(guest => deleteItem(guest.id));
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className={`mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {t('tools.guestListManager.title')}
                    </CardTitle>
                    <WidgetEmbedButton toolSlug="guest-list-manager" toolName="Guest List Manager" />

                    <SyncStatus
                      isSynced={isSynced}
                      isSaving={isSaving}
                      lastSaved={lastSaved}
                      syncError={syncError}
                      onForceSync={forceSync}
                      theme={theme === 'dark' ? 'dark' : 'light'}
                      size="sm"
                    />
                  </div>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.guestListManager.description')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setFormData(DEFAULT_FORM_DATA); setEditingId(null); setShowForm(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('tools.guestListManager.addGuest')}
                </button>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}>
                  <Upload className="w-4 h-4" />
                  {t('tools.guestListManager.import')}
                  <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                </label>
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'guest-list' })}
                  onExportExcel={() => exportExcel({ filename: 'guest-list' })}
                  onExportJSON={() => exportJSON({ filename: 'guest-list' })}
                  onExportPDF={async () => {
                    await exportPDF({
                      filename: 'guest-list',
                      title: 'Guest List',
                      subtitle: `Total Guests: ${guests.length} | Confirmed: ${guestStats.confirmed}`,
                    });
                  }}
                  onPrint={() => {}}
                  onCopyToClipboard={() => {}}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {guestStats.totalInvited}
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.guestListManager.stats.totalInvited')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-green-500">{guestStats.confirmed}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.guestListManager.stats.confirmed')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-red-500">{guestStats.declined}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.guestListManager.stats.declined')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-yellow-500">{guestStats.pending}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.guestListManager.stats.pending')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-purple-500">{guestStats.confirmedPlusOnes}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.guestListManager.stats.plusOnes')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-[#0D9488]">{guestStats.totalAttending}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.guestListManager.stats.totalAttending')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-pink-500">{guestStats.giftsReceived}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.guestListManager.stats.giftsReceived')}</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-2xl font-bold text-blue-500">{guestStats.thankYousSent}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.guestListManager.stats.thankYousSent')}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'list', label: t('tools.guestListManager.tabs.guestList'), icon: Users },
            { id: 'seating', label: t('tools.guestListManager.tabs.seatingChart'), icon: Table2 },
            { id: 'summary', label: t('tools.guestListManager.tabs.summary'), icon: LayoutGrid }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#0D9488] text-white'
                  : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Guest Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <form onSubmit={handleSubmit} className="p-6">
                <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingId ? t('tools.guestListManager.editGuest') : t('tools.guestListManager.addNewGuest')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Group */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Group/Relation
                    </label>
                    <select
                      value={formData.group}
                      onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value as GuestGroup }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {Object.entries(GROUP_CONFIG).map(([value, config]) => (
                        <option key={value} value={value}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* RSVP Status */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      RSVP Status
                    </label>
                    <select
                      value={formData.rsvpStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, rsvpStatus: e.target.value as RSVPStatus }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {Object.entries(RSVP_STATUS_CONFIG).map(([value, config]) => (
                        <option key={value} value={value}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Plus One */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.plusOne}
                        onChange={(e) => setFormData(prev => ({ ...prev, plusOne: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Has Plus One
                      </span>
                    </label>
                  </div>

                  {formData.plusOne && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Plus One Name
                        </label>
                        <input
                          type="text"
                          value={formData.plusOneName}
                          onChange={(e) => setFormData(prev => ({ ...prev, plusOneName: e.target.value }))}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.plusOneConfirmed}
                            onChange={(e) => setFormData(prev => ({ ...prev, plusOneConfirmed: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                          />
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Plus One Confirmed
                          </span>
                        </label>
                      </div>
                    </>
                  )}

                  {/* Meal Preference */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Meal Preference
                    </label>
                    <select
                      value={formData.mealPreference}
                      onChange={(e) => setFormData(prev => ({ ...prev, mealPreference: e.target.value as MealPreference }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {MEAL_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Table Assignment */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Table Assignment
                    </label>
                    <select
                      value={formData.tableAssignment || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, tableAssignment: e.target.value ? parseInt(e.target.value) : null }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      <option value="">Not Assigned</option>
                      {tables.map(table => (
                        <option key={table.id} value={table.id}>{table.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Dietary Restrictions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_RESTRICTIONS.map(restriction => (
                        <label
                          key={restriction}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer text-sm transition-colors ${
                            formData.dietaryRestrictions.includes(restriction)
                              ? 'bg-[#0D9488] text-white'
                              : theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.dietaryRestrictions.includes(restriction)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, dietaryRestrictions: [...prev.dietaryRestrictions, restriction] }));
                              } else {
                                setFormData(prev => ({ ...prev, dietaryRestrictions: prev.dietaryRestrictions.filter(r => r !== restriction) }));
                              }
                            }}
                            className="hidden"
                          />
                          {restriction}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Gift Tracking */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.giftReceived}
                        onChange={(e) => setFormData(prev => ({ ...prev, giftReceived: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Gift Received
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.thankYouSent}
                        onChange={(e) => setFormData(prev => ({ ...prev, thankYouSent: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Thank You Sent
                      </span>
                    </label>
                  </div>

                  {formData.giftReceived && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Gift Description
                      </label>
                      <input
                        type="text"
                        value={formData.giftDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, giftDescription: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingId(null); setFormData(DEFAULT_FORM_DATA); }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.guestListManager.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? t('tools.guestListManager.updateGuest') : t('tools.guestListManager.addGuest')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Guest List Tab */}
        {activeTab === 'list' && (
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder={t('tools.guestListManager.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                {/* Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showFilters
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {t('tools.guestListManager.filters')}
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Export Mail Merge */}
                <button
                  onClick={handleExportMailMerge}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {t('tools.guestListManager.mailMerge')}
                </button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Group
                      </label>
                      <select
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value as GuestGroup | 'all')}
                        className={`px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="all">All Groups</option>
                        {Object.entries(GROUP_CONFIG).map(([value, config]) => (
                          <option key={value} value={value}>{config.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as RSVPStatus | 'all')}
                        className={`px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="all">All Statuses</option>
                        {Object.entries(RSVP_STATUS_CONFIG).map(([value, config]) => (
                          <option key={value} value={value}>{config.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sort By
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={sortField}
                          onChange={(e) => setSortField(e.target.value as typeof sortField)}
                          className={`px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        >
                          <option value="name">Name</option>
                          <option value="group">Group</option>
                          <option value="rsvpStatus">RSVP Status</option>
                          <option value="tableAssignment">Table</option>
                        </select>
                        <button
                          onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                          className={`px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white hover:bg-gray-500'
                              : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-100'
                          } transition-colors`}
                        >
                          {sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => { setFilterGroup('all'); setFilterStatus('all'); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent>
              {filteredGuests.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.guestListManager.noGuestsFound')}</p>
                  <p className="text-sm mt-1">{t('tools.guestListManager.noGuestsHint')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGuests.map(guest => (
                    <div
                      key={guest.id}
                      className={`rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {/* Guest Header */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedGuest(expandedGuest === guest.id ? null : guest.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            guest.rsvpStatus === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30' :
                            guest.rsvpStatus === 'declined' ? 'bg-red-100 dark:bg-red-900/30' :
                            guest.rsvpStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            <span className={`text-lg font-semibold ${
                              guest.rsvpStatus === 'confirmed' ? 'text-green-600 dark:text-green-400' :
                              guest.rsvpStatus === 'declined' ? 'text-red-600 dark:text-red-400' :
                              guest.rsvpStatus === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-blue-600 dark:text-blue-400'
                            }`}>
                              {guest.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {guest.name}
                              </span>
                              {guest.plusOne && (
                                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                  <Plus className="w-3 h-3" />1
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full ${GROUP_CONFIG[guest.group].color} ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                              }`}>
                                {GROUP_CONFIG[guest.group].label}
                              </span>
                            </div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {guest.email || guest.phone || 'No contact info'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Quick Status Badges */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${RSVP_STATUS_CONFIG[guest.rsvpStatus].bgColor} ${RSVP_STATUS_CONFIG[guest.rsvpStatus].color}`}>
                            {RSVP_STATUS_CONFIG[guest.rsvpStatus].label}
                          </span>
                          {guest.tableAssignment && (
                            <span className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                              Table {guest.tableAssignment}
                            </span>
                          )}
                          {guest.giftReceived && (
                            <Gift className="w-4 h-4 text-pink-500" />
                          )}
                          {guest.thankYouSent && (
                            <Send className="w-4 h-4 text-blue-500" />
                          )}
                          {expandedGuest === guest.id ? (
                            <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          ) : (
                            <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedGuest === guest.id && (
                        <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} p-4`}>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Contact Info */}
                            <div className="space-y-2">
                              <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Contact Information
                              </h4>
                              {guest.email && (
                                <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Mail className="w-4 h-4" />
                                  {guest.email}
                                </div>
                              )}
                              {guest.phone && (
                                <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Phone className="w-4 h-4" />
                                  {guest.phone}
                                </div>
                              )}
                              {guest.address && (
                                <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <MapPin className="w-4 h-4" />
                                  {guest.address}
                                </div>
                              )}
                            </div>

                            {/* Meal & Plus One */}
                            <div className="space-y-2">
                              <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Meal & Plus One
                              </h4>
                              <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Utensils className="w-4 h-4" />
                                {MEAL_OPTIONS.find(m => m.value === guest.mealPreference)?.label || guest.mealPreference}
                              </div>
                              {guest.dietaryRestrictions.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {guest.dietaryRestrictions.map(r => (
                                    <span key={r} className="text-xs px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {guest.plusOne && (
                                <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Heart className="w-4 h-4" />
                                  {guest.plusOneName || 'Plus One'} {guest.plusOneConfirmed && '(Confirmed)'}
                                </div>
                              )}
                            </div>

                            {/* Notes & Gift */}
                            <div className="space-y-2">
                              <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Gift & Notes
                              </h4>
                              {guest.giftReceived && (
                                <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Gift className="w-4 h-4 text-pink-500" />
                                  {guest.giftDescription || 'Gift received'}
                                </div>
                              )}
                              {guest.notes && (
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {guest.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} flex flex-wrap gap-2`}>
                            {/* RSVP Status Buttons */}
                            <div className="flex gap-1">
                              {(['confirmed', 'pending', 'declined'] as RSVPStatus[]).map(status => (
                                <button
                                  key={status}
                                  onClick={(e) => { e.stopPropagation(); handleQuickStatusChange(guest.id, status); }}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    guest.rsvpStatus === status
                                      ? `${RSVP_STATUS_CONFIG[status].bgColor} ${RSVP_STATUS_CONFIG[status].color}`
                                      : theme === 'dark'
                                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {RSVP_STATUS_CONFIG[status].label}
                                </button>
                              ))}
                            </div>

                            <div className="flex-1" />

                            {/* Gift Toggle */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleGift(guest.id); }}
                              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                guest.giftReceived
                                  ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                                  : theme === 'dark'
                                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              <Gift className="w-3 h-3" />
                              {guest.giftReceived ? 'Gift Received' : 'Mark Gift'}
                            </button>

                            {/* Thank You Toggle */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleThankYou(guest.id); }}
                              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                guest.thankYouSent
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                  : theme === 'dark'
                                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              <Send className="w-3 h-3" />
                              {guest.thankYouSent ? 'Thank You Sent' : 'Send Thank You'}
                            </button>

                            {/* Edit */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(guest); }}
                              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                theme === 'dark'
                                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>

                            {/* Delete */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(guest.id); }}
                              className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Seating Chart Tab */}
        {activeTab === 'seating' && (
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Seating Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tables.map(table => {
                  const tableGuests = tableOccupancy[table.id] || [];
                  const isFull = tableGuests.length >= table.capacity;

                  return (
                    <div
                      key={table.id}
                      className={`p-4 rounded-lg border-2 ${
                        isFull
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : tableGuests.length > 0
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                            : theme === 'dark'
                              ? 'border-gray-600 bg-gray-700'
                              : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {table.name}
                        </h3>
                        <span className={`text-sm ${
                          isFull ? 'text-green-600 dark:text-green-400' :
                          tableGuests.length > 0 ? 'text-yellow-600 dark:text-yellow-400' :
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {tableGuests.length}/{table.capacity}
                        </span>
                      </div>

                      {/* Visual table representation */}
                      <div className={`relative w-24 h-24 mx-auto mb-3 rounded-full border-4 ${
                        isFull ? 'border-green-400' :
                        tableGuests.length > 0 ? 'border-yellow-400' :
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                      } flex items-center justify-center`}>
                        <Table2 className={`w-8 h-8 ${
                          isFull ? 'text-green-500' :
                          tableGuests.length > 0 ? 'text-yellow-500' :
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        {/* Seat indicators around the table */}
                        {Array.from({ length: table.capacity }).map((_, i) => {
                          const angle = (i * 360) / table.capacity - 90;
                          const rad = angle * (Math.PI / 180);
                          const x = 50 + 42 * Math.cos(rad);
                          const y = 50 + 42 * Math.sin(rad);
                          const isOccupied = i < tableGuests.length;

                          return (
                            <div
                              key={i}
                              className={`absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                                isOccupied
                                  ? 'bg-[#0D9488]'
                                  : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                              }`}
                              style={{ left: `${x}%`, top: `${y}%` }}
                            />
                          );
                        })}
                      </div>

                      {/* Guest list for table */}
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {tableGuests.map(guest => (
                          <div
                            key={guest.id}
                            className={`flex items-center justify-between text-sm px-2 py-1 rounded ${
                              theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                            }`}
                          >
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              {guest.name}
                            </span>
                            <button
                              onClick={() => handleTableAssign(guest.id, null)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Unassigned guests dropdown */}
                      {!isFull && (
                        <div className="mt-2">
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleTableAssign(e.target.value, table.id);
                            }}
                            className={`w-full text-sm px-2 py-1 rounded border ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-1 focus:ring-[#0D9488]`}
                          >
                            <option value="">+ Add guest</option>
                            {guests
                              .filter(g => !g.tableAssignment && g.rsvpStatus === 'confirmed')
                              .map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))
                            }
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Unassigned Guests */}
              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Unassigned Confirmed Guests ({guests.filter(g => !g.tableAssignment && g.rsvpStatus === 'confirmed').length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {guests
                    .filter(g => !g.tableAssignment && g.rsvpStatus === 'confirmed')
                    .map(guest => (
                      <div
                        key={guest.id}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                          theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                        }`}
                      >
                        {guest.name}
                        {guest.plusOne && guest.plusOneConfirmed && (
                          <span className="text-xs text-[#0D9488]">+1</span>
                        )}
                      </div>
                    ))
                  }
                  {guests.filter(g => !g.tableAssignment && g.rsvpStatus === 'confirmed').length === 0 && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      All confirmed guests have been assigned to tables
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RSVP Summary */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  RSVP Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Visual bar */}
                  <div className="h-8 rounded-full overflow-hidden flex">
                    {guestStats.confirmed > 0 && (
                      <div
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(guestStats.confirmed / guestStats.totalInvited) * 100}%` }}
                      >
                        {guestStats.confirmed}
                      </div>
                    )}
                    {guestStats.pending > 0 && (
                      <div
                        className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(guestStats.pending / guestStats.totalInvited) * 100}%` }}
                      >
                        {guestStats.pending}
                      </div>
                    )}
                    {guestStats.declined > 0 && (
                      <div
                        className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(guestStats.declined / guestStats.totalInvited) * 100}%` }}
                      >
                        {guestStats.declined}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Confirmed</span>
                      </div>
                      <div className="text-2xl font-bold text-green-500">{guestStats.confirmed}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Pending</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-500">{guestStats.pending}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <X className="w-4 h-4 text-red-500" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Declined</span>
                      </div>
                      <div className="text-2xl font-bold text-red-500">{guestStats.declined}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meal Preferences */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  Meal Preferences (Confirmed Guests)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MEAL_OPTIONS.map(option => {
                    const count = guestStats.mealCounts[option.value];
                    if (count === 0) return null;

                    return (
                      <div key={option.value} className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {option.label}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className={`w-32 h-2 rounded-full overflow-hidden ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <div
                              className="h-full bg-[#0D9488]"
                              style={{ width: `${(count / guestStats.totalAttending) * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium w-8 text-right ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Group Breakdown */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  Guest Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(GROUP_CONFIG).map(([group, config]) => {
                    const count = guests.filter(g => g.group === group).length;
                    if (count === 0) return null;

                    return (
                      <div key={group} className="flex items-center justify-between">
                        <span className={config.color}>{config.label}</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Gift & Thank You Tracking */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  Gift & Thank You Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-5 h-5 text-pink-500" />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Gifts Received</span>
                    </div>
                    <div className="text-3xl font-bold text-pink-500">
                      {guestStats.giftsReceived}
                      <span className={`text-sm font-normal ml-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        / {guestStats.totalInvited}
                      </span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Send className="w-5 h-5 text-blue-500" />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Thank Yous Sent</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-500">
                      {guestStats.thankYousSent}
                      <span className={`text-sm font-normal ml-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        / {guestStats.giftsReceived}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pending Thank Yous */}
                {guestStats.giftsReceived > guestStats.thankYousSent && (
                  <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {guestStats.giftsReceived - guestStats.thankYousSent} thank you note(s) pending
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Clear Data Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={clearAllData}
            className={`text-sm flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-red-400 hover:bg-red-900/20'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>
        </div>

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg">
            {validationMessage}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
}

export default GuestListManagerTool;
