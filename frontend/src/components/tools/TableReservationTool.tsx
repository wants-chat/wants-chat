'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  UtensilsCrossed,
  Plus,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  UserPlus,
  ClipboardList,
  Timer,
  Eye,
  Star,
  Ban,
  RefreshCw,
  Grid3X3,
  List,
  Sun,
  Moon,
  Wine,
  TreePine,
  Home,
  MessageSquare,
  Bell,
  History,
  TrendingUp,
  ArrowUpDown,
  MoreVertical,
  Sparkles,
  Loader2
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '@/hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface TableReservationToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Table {
  id: string;
  number: number;
  capacity: number;
  location: 'indoor' | 'outdoor' | 'bar';
  shape: 'round' | 'square' | 'rectangle';
  isActive: boolean;
  notes: string;
}

interface GuestPreferences {
  dietaryRestrictions: string[];
  seatingPreference: 'indoor' | 'outdoor' | 'bar' | 'no-preference';
  specialOccasion: string;
  vipStatus: boolean;
  notes: string;
}

interface Reservation {
  id: string;
  tableId: string | null;
  date: string;
  time: string;
  duration: number; // in minutes
  partySize: number;
  guestName: string;
  phone: string;
  email: string;
  specialRequests: string;
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  preferences: GuestPreferences;
  createdAt: string;
  confirmedAt: string | null;
  seatedAt: string | null;
  completedAt: string | null;
}

interface WaitlistEntry {
  id: string;
  guestName: string;
  phone: string;
  partySize: number;
  estimatedWait: number; // in minutes
  addedAt: string;
  notes: string;
  notified: boolean;
  status: 'waiting' | 'seated' | 'left' | 'cancelled';
}

interface TimeSlotConfig {
  interval: 15 | 30 | 60;
  openTime: string;
  closeTime: string;
  turnTime: number; // default turn time in minutes
}

interface NoShowRecord {
  guestName: string;
  phone: string;
  email: string;
  count: number;
  lastNoShow: string;
}

type ViewMode = 'tables' | 'reservations' | 'waitlist' | 'overview' | 'settings';
type OverviewPeriod = 'daily' | 'weekly';

const STORAGE_KEY = 'table-reservation-data';

const DEFAULT_TIME_CONFIG: TimeSlotConfig = {
  interval: 30,
  openTime: '11:00',
  closeTime: '22:00',
  turnTime: 90
};

const LOCATION_ICONS = {
  indoor: Home,
  outdoor: TreePine,
  bar: Wine
};

const LOCATION_LABELS = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  bar: 'Bar'
};

const STATUS_COLORS = {
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  seated: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'no-show': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
};

// Column configuration for export functionality
const RESERVATION_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'guestName', header: 'Guest Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'partySize', header: 'Party Size', type: 'number' },
  { key: 'tableId', header: 'Table ID', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'specialRequests', header: 'Special Requests', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

export function TableReservationTool({ uiConfig }: TableReservationToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Hook for managing reservation data with backend sync
  const {
    data: reservations,
    addItem: addReservationItem,
    updateItem: updateReservationItem,
    deleteItem: deleteReservationItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Reservation>('table-reservations', [], RESERVATION_COLUMNS);

  // Local state for tables and other data
  const [tables, setTables] = useState<Table[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [noShowRecords, setNoShowRecords] = useState<NoShowRecord[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [timeConfig, setTimeConfig] = useState<TimeSlotConfig>(DEFAULT_TIME_CONFIG);

  const [viewMode, setViewMode] = useState<ViewMode>('tables');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [overviewPeriod, setOverviewPeriod] = useState<OverviewPeriod>('daily');

  const [showTableModal, setShowTableModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [tableView, setTableView] = useState<'grid' | 'list'>('grid');

  // Load non-synced data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTables(data.tables || []);
        setWaitlist(data.waitlist || []);
        setNoShowRecords(data.noShowRecords || []);
        setTimeConfig(data.timeConfig || DEFAULT_TIME_CONFIG);
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }
  }, []);

  // Save non-synced data to localStorage
  useEffect(() => {
    const data = { tables, waitlist, noShowRecords, timeConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [tables, waitlist, noShowRecords, timeConfig]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description || params.people) {
        // For table reservation tool, prefill just shows the indicator
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Generate time slots based on config
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const [openHour, openMin] = timeConfig.openTime.split(':').map(Number);
    const [closeHour, closeMin] = timeConfig.closeTime.split(':').map(Number);

    let currentMinutes = openHour * 60 + openMin;
    const endMinutes = closeHour * 60 + closeMin;

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
      currentMinutes += timeConfig.interval;
    }

    return slots;
  }, [timeConfig]);

  // Get reservations for selected date
  const dateReservations = useMemo(() => {
    return reservations.filter(r => r.date === selectedDate);
  }, [reservations, selectedDate]);

  // Filter reservations
  const filteredReservations = useMemo(() => {
    return dateReservations.filter(r => {
      const matchesSearch = searchQuery === '' ||
        r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dateReservations, searchQuery, statusFilter]);

  // Filter tables
  const filteredTables = useMemo(() => {
    return tables.filter(t => {
      const matchesLocation = locationFilter === 'all' || t.location === locationFilter;
      return matchesLocation && t.isActive;
    });
  }, [tables, locationFilter]);

  // Get table availability for a time slot
  const getTableAvailability = (tableId: string, date: string, time: string) => {
    const tableReservations = reservations.filter(r =>
      r.tableId === tableId &&
      r.date === date &&
      r.status !== 'cancelled' &&
      r.status !== 'no-show'
    );

    const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);

    for (const res of tableReservations) {
      const resStart = parseInt(res.time.split(':')[0]) * 60 + parseInt(res.time.split(':')[1]);
      const resEnd = resStart + res.duration;

      if (timeMinutes >= resStart && timeMinutes < resEnd) {
        return { available: false, reservation: res };
      }
    }

    return { available: true, reservation: null };
  };

  // Calculate stats
  const stats = useMemo(() => {
    const todayReservations = dateReservations.filter(r => r.status !== 'cancelled');
    const confirmed = todayReservations.filter(r => r.status === 'confirmed').length;
    const seated = todayReservations.filter(r => r.status === 'seated').length;
    const completed = todayReservations.filter(r => r.status === 'completed').length;
    const noShows = todayReservations.filter(r => r.status === 'no-show').length;
    const totalGuests = todayReservations.reduce((sum, r) => sum + r.partySize, 0);
    const activeWaitlist = waitlist.filter(w => w.status === 'waiting').length;
    const totalCapacity = tables.filter(t => t.isActive).reduce((sum, t) => sum + t.capacity, 0);

    return {
      totalReservations: todayReservations.length,
      confirmed,
      seated,
      completed,
      noShows,
      totalGuests,
      activeWaitlist,
      totalCapacity,
      availableTables: tables.filter(t => t.isActive).length
    };
  }, [dateReservations, waitlist, tables]);

  // Weekly overview data
  const weeklyData = useMemo(() => {
    const days: { date: string; label: string; reservations: number; guests: number }[] = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayReservations = reservations.filter(r => r.date === dateStr && r.status !== 'cancelled');

      days.push({
        date: dateStr,
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        reservations: dayReservations.length,
        guests: dayReservations.reduce((sum, r) => sum + r.partySize, 0)
      });
    }

    return days;
  }, [selectedDate, reservations]);

  // Handlers
  const handleAddTable = (tableData: Omit<Table, 'id'>) => {
    const newTable: Table = {
      ...tableData,
      id: `table-${Date.now()}`
    };
    setTables([...tables, newTable]);
    setShowTableModal(false);
    setEditingTable(null);
  };

  const handleUpdateTable = (tableData: Omit<Table, 'id'>) => {
    if (!editingTable) return;
    setTables(tables.map(t => t.id === editingTable.id ? { ...tableData, id: t.id } : t));
    setShowTableModal(false);
    setEditingTable(null);
  };

  const handleDeleteTable = async (tableId: string) => {
    const confirmed = await confirm({
      title: 'Delete Table',
      message: 'Are you sure you want to delete this table? All associated reservations will be unassigned.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      setTables(tables.filter(t => t.id !== tableId));
      // Unassign all reservations from this table
      reservations.forEach(r => {
        if (r.tableId === tableId) {
          updateReservationItem(r.id, { tableId: null });
        }
      });
    }
  };

  const handleAddReservation = (resData: Omit<Reservation, 'id' | 'createdAt' | 'confirmedAt' | 'seatedAt' | 'completedAt'>) => {
    const newReservation: Reservation = {
      ...resData,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
      confirmedAt: resData.status === 'confirmed' ? new Date().toISOString() : null,
      seatedAt: null,
      completedAt: null
    };
    addReservationItem(newReservation);
    setShowReservationModal(false);
    setEditingReservation(null);
    setSelectedTable(null);
    setSelectedTimeSlot(null);
  };

  const handleUpdateReservation = (resData: Omit<Reservation, 'id' | 'createdAt' | 'confirmedAt' | 'seatedAt' | 'completedAt'>) => {
    if (!editingReservation) return;
    updateReservationItem(editingReservation.id, {
      ...resData,
      createdAt: editingReservation.createdAt,
      confirmedAt: editingReservation.confirmedAt,
      seatedAt: editingReservation.seatedAt,
      completedAt: editingReservation.completedAt
    });
    setShowReservationModal(false);
    setEditingReservation(null);
  };

  const handleUpdateReservationStatus = (resId: string, status: Reservation['status']) => {
    const reservation = reservations.find(r => r.id === resId);
    if (!reservation) return;

    const updates: Partial<Reservation> = { status };

    if (status === 'confirmed' && !reservation.confirmedAt) {
      updates.confirmedAt = new Date().toISOString();
    } else if (status === 'seated') {
      updates.seatedAt = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    } else if (status === 'no-show') {
      // Track no-show
      const existing = noShowRecords.find(n => n.phone === reservation.phone || n.email === reservation.email);
      if (existing) {
        setNoShowRecords(noShowRecords.map(n =>
          (n.phone === reservation.phone || n.email === reservation.email)
            ? { ...n, count: n.count + 1, lastNoShow: new Date().toISOString() }
            : n
        ));
      } else {
        setNoShowRecords([...noShowRecords, {
          guestName: reservation.guestName,
          phone: reservation.phone,
          email: reservation.email,
          count: 1,
          lastNoShow: new Date().toISOString()
        }]);
      }
    }

    updateReservationItem(resId, updates);
  };

  const handleDeleteReservation = async (resId: string) => {
    const confirmed = await confirm({
      title: 'Delete Reservation',
      message: 'Are you sure you want to delete this reservation?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteReservationItem(resId);
    }
  };

  const handleAddToWaitlist = (entry: Omit<WaitlistEntry, 'id' | 'addedAt' | 'notified' | 'status'>) => {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: `wait-${Date.now()}`,
      addedAt: new Date().toISOString(),
      notified: false,
      status: 'waiting'
    };
    setWaitlist([...waitlist, newEntry]);
    setShowWaitlistModal(false);
  };

  const handleUpdateWaitlistStatus = (entryId: string, status: WaitlistEntry['status']) => {
    setWaitlist(waitlist.map(w => w.id === entryId ? { ...w, status } : w));
  };

  const handleNotifyWaitlist = (entryId: string) => {
    setWaitlist(waitlist.map(w => w.id === entryId ? { ...w, notified: true } : w));
  };

  const handleRemoveFromWaitlist = (entryId: string) => {
    setWaitlist(waitlist.filter(w => w.id !== entryId));
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, mins] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const getNoShowWarning = (phone: string, email: string) => {
    return noShowRecords.find(n => n.phone === phone || n.email === email);
  };

  // Export handlers using hook methods
  const handleExportCSV = () => {
    exportCSV({ filename: `reservations-${selectedDate}` });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: `reservations-${selectedDate}` });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: `reservations-${selectedDate}` });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: `reservations-${selectedDate}`,
      title: `Reservations - ${formatDate(selectedDate)}`,
      subtitle: `${filteredReservations.length} reservation(s)`,
    });
  };

  const handlePrint = () => {
    print(`Reservations - ${formatDate(selectedDate)}`);
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    return await copyToClipboard('tab');
  };

  const handleImportCSV = async (file: File) => {
    await importCSV(file);
  };

  const handleImportJSON = async (file: File) => {
    await importJSON(file);
  };

  const handleForceSync = async () => {
    await forceSync();
  };

  // Table Form Modal
  const TableFormModal = () => {
    const [formData, setFormData] = useState<Omit<Table, 'id'>>({
      number: editingTable?.number || (tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1),
      capacity: editingTable?.capacity || 4,
      location: editingTable?.location || 'indoor',
      shape: editingTable?.shape || 'square',
      isActive: editingTable?.isActive ?? true,
      notes: editingTable?.notes || ''
    });

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingTable ? t('tools.tableReservation.editTable', 'Edit Table') : t('tools.tableReservation.addNewTable', 'Add New Table')}
              </h2>
              <button
                onClick={() => { setShowTableModal(false); setEditingTable(null); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.tableNumber', 'Table Number')}
                  </label>
                  <input
                    type="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.capacity', 'Capacity')}
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.tableReservation.location', 'Location')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['indoor', 'outdoor', 'bar'] as const).map((loc) => {
                    const Icon = LOCATION_ICONS[loc];
                    return (
                      <button
                        key={loc}
                        onClick={() => setFormData({ ...formData, location: loc })}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                          formData.location === loc
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${formData.location === loc ? 'text-orange-500' : 'text-gray-500'}`} />
                        <span className={`text-xs ${formData.location === loc ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {LOCATION_LABELS[loc]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.tableReservation.tableShape', 'Table Shape')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['round', 'square', 'rectangle'] as const).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setFormData({ ...formData, shape })}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                        formData.shape === shape
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 border-2 ${
                        formData.shape === shape ? 'border-orange-500' : 'border-gray-400'
                      } ${shape === 'round' ? 'rounded-full' : shape === 'square' ? 'rounded' : 'rounded w-8'}`} />
                      <span className={`text-xs capitalize ${formData.shape === shape ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {shape}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.tableReservation.notes', 'Notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder={t('tools.tableReservation.eGNearWindowWheelchair', 'e.g., Near window, wheelchair accessible...')}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                  {t('tools.tableReservation.tableIsActiveAndAvailable', 'Table is active and available for reservations')}
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowTableModal(false); setEditingTable(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('tools.tableReservation.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => editingTable ? handleUpdateTable(formData) : handleAddTable(formData)}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                {editingTable ? t('tools.tableReservation.update', 'Update') : t('tools.tableReservation.add', 'Add')} Table
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Reservation Form Modal
  const ReservationFormModal = () => {
    const [formData, setFormData] = useState<Omit<Reservation, 'id' | 'createdAt' | 'confirmedAt' | 'seatedAt' | 'completedAt'>>({
      tableId: editingReservation?.tableId || selectedTable?.id || null,
      date: editingReservation?.date || selectedDate,
      time: editingReservation?.time || selectedTimeSlot || '18:00',
      duration: editingReservation?.duration || timeConfig.turnTime,
      partySize: editingReservation?.partySize || 2,
      guestName: editingReservation?.guestName || '',
      phone: editingReservation?.phone || '',
      email: editingReservation?.email || '',
      specialRequests: editingReservation?.specialRequests || '',
      status: editingReservation?.status || 'confirmed',
      preferences: editingReservation?.preferences || {
        dietaryRestrictions: [],
        seatingPreference: 'no-preference',
        specialOccasion: '',
        vipStatus: false,
        notes: ''
      }
    });

    const noShowWarning = formData.phone || formData.email
      ? getNoShowWarning(formData.phone, formData.email)
      : null;

    const availableTables = tables.filter(t => {
      if (!t.isActive) return false;
      if (t.capacity < formData.partySize) return false;
      if (editingReservation?.tableId === t.id) return true;
      const { available } = getTableAvailability(t.id, formData.date, formData.time);
      return available;
    });

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingReservation ? t('tools.tableReservation.editReservation', 'Edit Reservation') : t('tools.tableReservation.newReservation2', 'New Reservation')}
              </h2>
              <button
                onClick={() => { setShowReservationModal(false); setEditingReservation(null); setSelectedTable(null); setSelectedTimeSlot(null); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {noShowWarning && (
              <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">{t('tools.tableReservation.noShowHistoryDetected', 'No-Show History Detected')}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-300">
                    This guest has {noShowWarning.count} previous no-show(s). Last: {new Date(noShowWarning.lastNoShow).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.date', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.time', 'Time')}
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{formatTime(slot)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Party Size and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.partySize', 'Party Size')}
                  </label>
                  <input
                    type="number"
                    value={formData.partySize}
                    onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.durationMinutes', 'Duration (minutes)')}
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="150">2.5 hours</option>
                    <option value="180">3 hours</option>
                  </select>
                </div>
              </div>

              {/* Table Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.tableReservation.tableAssignment', 'Table Assignment')}
                </label>
                <select
                  value={formData.tableId || ''}
                  onChange={(e) => setFormData({ ...formData, tableId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('tools.tableReservation.assignLater', 'Assign later')}</option>
                  {availableTables.map(table => (
                    <option key={table.id} value={table.id}>
                      Table {table.number} - {LOCATION_LABELS[table.location]} (seats {table.capacity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.tableReservation.guestName', 'Guest Name *')}
                </label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tableReservation.fullName', 'Full name')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.phone', 'Phone *')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('tools.tableReservation.guestEmailCom', 'guest@email.com')}
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.tableReservation.specialRequests', 'Special Requests')}
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder={t('tools.tableReservation.birthdayCelebrationHighChairNeeded', 'Birthday celebration, high chair needed, allergies...')}
                />
              </div>

              {/* Guest Preferences */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('tools.tableReservation.guestPreferences', 'Guest Preferences')}</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('tools.tableReservation.seatingPreference', 'Seating Preference')}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['no-preference', 'indoor', 'outdoor', 'bar'] as const).map((pref) => (
                        <button
                          key={pref}
                          onClick={() => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, seatingPreference: pref }
                          })}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            formData.preferences.seatingPreference === pref
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                              : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {pref === 'no-preference' ? 'Any' : LOCATION_LABELS[pref as keyof typeof LOCATION_LABELS]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('tools.tableReservation.specialOccasion', 'Special Occasion')}
                    </label>
                    <input
                      type="text"
                      value={formData.preferences.specialOccasion}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, specialOccasion: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder={t('tools.tableReservation.birthdayAnniversaryEtc', 'Birthday, Anniversary, etc.')}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="vipStatus"
                      checked={formData.preferences.vipStatus}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, vipStatus: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="vipStatus" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {t('tools.tableReservation.vipGuest', 'VIP Guest')}
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('tools.tableReservation.guestNotes', 'Guest Notes')}
                    </label>
                    <textarea
                      value={formData.preferences.notes}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, notes: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      rows={2}
                      placeholder={t('tools.tableReservation.regularCustomerNotesPreferencesEtc', 'Regular customer notes, preferences, etc.')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowReservationModal(false); setEditingReservation(null); setSelectedTable(null); setSelectedTimeSlot(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('tools.tableReservation.cancel2', 'Cancel')}
              </button>
              <button
                onClick={() => editingReservation ? handleUpdateReservation(formData) : handleAddReservation(formData)}
                disabled={!formData.guestName || !formData.phone}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingReservation ? t('tools.tableReservation.update2', 'Update') : t('tools.tableReservation.create', 'Create')} Reservation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Waitlist Form Modal
  const WaitlistFormModal = () => {
    const [formData, setFormData] = useState({
      guestName: '',
      phone: '',
      partySize: 2,
      estimatedWait: 30,
      notes: ''
    });

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('tools.tableReservation.addToWaitlist', 'Add to Waitlist')}
              </h2>
              <button
                onClick={() => setShowWaitlistModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.tableReservation.guestName2', 'Guest Name *')}
                </label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tableReservation.fullName2', 'Full name')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.tableReservation.phone2', 'Phone *')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.partySize2', 'Party Size')}
                  </label>
                  <input
                    type="number"
                    value={formData.partySize}
                    onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.estWaitMin', 'Est. Wait (min)')}
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedWait}
                    onChange={(e) => setFormData({ ...formData, estimatedWait: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="5"
                    step="5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.tableReservation.notes2', 'Notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder={t('tools.tableReservation.specialRequestsOrNotes', 'Special requests or notes...')}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWaitlistModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('tools.tableReservation.cancel3', 'Cancel')}
              </button>
              <button
                onClick={() => handleAddToWaitlist(formData)}
                disabled={!formData.guestName || !formData.phone}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('tools.tableReservation.addToWaitlist2', 'Add to Waitlist')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Table Card Component
  const TableCard = ({ table }: { table: Table }) => {
    const LocationIcon = LOCATION_ICONS[table.location];
    const tableReservations = dateReservations.filter(r => r.tableId === table.id && r.status !== 'cancelled' && r.status !== 'no-show');
    const currentReservation = tableReservations.find(r => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      if (table.id && selectedDate === today) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const resStart = parseInt(r.time.split(':')[0]) * 60 + parseInt(r.time.split(':')[1]);
        const resEnd = resStart + r.duration;
        return currentMinutes >= resStart && currentMinutes < resEnd;
      }
      return false;
    });

    return (
      <div
        className={`p-4 rounded-xl border-2 transition-all ${
          currentReservation
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              table.shape === 'round' ? 'rounded-full' : ''
            } ${currentReservation ? 'bg-green-500' : 'bg-orange-500'}`}>
              <span className="text-white font-bold">{table.number}</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <LocationIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{LOCATION_LABELS[table.location]}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users className="w-3 h-3" />
                <span>{table.capacity} seats</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setEditingTable(table); setShowTableModal(true); }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => handleDeleteTable(table.id)}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {currentReservation ? (
          <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-gray-900 dark:text-white">{currentReservation.guestName}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[currentReservation.status]}`}>
                {currentReservation.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatTime(currentReservation.time)} - {currentReservation.partySize} guests
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {tableReservations.length > 0 ? (
              <span>{tableReservations.length} reservation(s) today</span>
            ) : (
              <span>{t('tools.tableReservation.available', 'Available')}</span>
            )}
          </div>
        )}

        {table.notes && (
          <p className="text-xs text-gray-500 mt-2 truncate">{table.notes}</p>
        )}
      </div>
    );
  };

  // Reservation Card Component
  const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const table = tables.find(t => t.id === reservation.tableId);
    const noShowWarning = getNoShowWarning(reservation.phone, reservation.email);

    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{reservation.guestName}</h3>
              {reservation.preferences.vipStatus && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
              {noShowWarning && noShowWarning.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded">
                  {noShowWarning.count} no-show(s)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(reservation.time)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {reservation.partySize}
              </span>
              <span className="flex items-center gap-1">
                <Timer className="w-4 h-4" />
                {reservation.duration}m
              </span>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[reservation.status]}`}>
            {reservation.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4" />
            {reservation.phone}
          </div>
          {reservation.email && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 truncate">
              <Mail className="w-4 h-4" />
              {reservation.email}
            </div>
          )}
        </div>

        {table && (
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <MapPin className="w-4 h-4" />
            Table {table.number} ({LOCATION_LABELS[table.location]})
          </div>
        )}

        {reservation.specialRequests && (
          <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-400 mb-3">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            {reservation.specialRequests}
          </div>
        )}

        {reservation.preferences.specialOccasion && (
          <div className="text-sm text-purple-600 dark:text-purple-400 mb-3">
            🎉 {reservation.preferences.specialOccasion}
          </div>
        )}

        <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          {reservation.status === 'confirmed' && (
            <>
              <button
                onClick={() => handleUpdateReservationStatus(reservation.id, 'seated')}
                className="flex-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" /> Seat
              </button>
              <button
                onClick={() => handleUpdateReservationStatus(reservation.id, 'no-show')}
                className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
              >
                <Ban className="w-4 h-4" />
              </button>
            </>
          )}
          {reservation.status === 'seated' && (
            <button
              onClick={() => handleUpdateReservationStatus(reservation.id, 'completed')}
              className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> Complete
            </button>
          )}
          <button
            onClick={() => { setEditingReservation(reservation); setShowReservationModal(true); }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => handleDeleteReservation(reservation.id)}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    );
  };

  // Waitlist Entry Component
  const WaitlistEntryCard = ({ entry }: { entry: WaitlistEntry }) => {
    const waitTime = Math.floor((Date.now() - new Date(entry.addedAt).getTime()) / 60000);

    return (
      <div className={`p-4 rounded-xl border ${
        entry.status === 'waiting'
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50 opacity-60'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{entry.guestName}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {entry.partySize}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {entry.phone}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${waitTime > entry.estimatedWait ? 'text-red-500' : 'text-green-500'}`}>
              {waitTime}m / {entry.estimatedWait}m
            </div>
            <div className="text-xs text-gray-500">{t('tools.tableReservation.waitTime', 'wait time')}</div>
          </div>
        </div>

        {entry.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{entry.notes}</p>
        )}

        {entry.status === 'waiting' && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleUpdateWaitlistStatus(entry.id, 'seated')}
              className="flex-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> Seat
            </button>
            {!entry.notified && (
              <button
                onClick={() => handleNotifyWaitlist(entry.id)}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                title={t('tools.tableReservation.markAsNotified', 'Mark as notified')}
              >
                <Bell className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleUpdateWaitlistStatus(entry.id, 'left')}
              className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
            >
              {t('tools.tableReservation.left', 'Left')}
            </button>
            <button
              onClick={() => handleRemoveFromWaitlist(entry.id)}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Availability Grid
  const AvailabilityGrid = () => {
    const activeTables = tables.filter(t => t.isActive);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white dark:bg-gray-800 z-10 p-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                {t('tools.tableReservation.time2', 'Time')}
              </th>
              {activeTables.map(table => (
                <th key={table.id} className="p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 min-w-[80px]">
                  <div>T{table.number}</div>
                  <div className="text-xs text-gray-500">{table.capacity}p</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <tr key={slot} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="sticky left-0 bg-white dark:bg-gray-800 z-10 p-2 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  {formatTime(slot)}
                </td>
                {activeTables.map(table => {
                  const { available, reservation } = getTableAvailability(table.id, selectedDate, slot);
                  return (
                    <td
                      key={`${table.id}-${slot}`}
                      className={`p-1 text-center border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
                        available
                          ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                      onClick={() => {
                        if (available) {
                          setSelectedTable(table);
                          setSelectedTimeSlot(slot);
                          setShowReservationModal(true);
                        } else if (reservation) {
                          setEditingReservation(reservation);
                          setShowReservationModal(true);
                        }
                      }}
                      title={available ? 'Click to book' : reservation?.guestName}
                    >
                      {available ? (
                        <Plus className="w-4 h-4 text-green-500 mx-auto opacity-0 hover:opacity-100" />
                      ) : (
                        <div className="text-xs text-red-600 dark:text-red-400 truncate px-1">
                          {reservation?.guestName.split(' ')[0]}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-gray-500 dark:text-gray-400">{t('tools.tableReservation.loadingReservations', 'Loading reservations...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.tableReservation.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tools.tableReservation.tableReservations', 'Table Reservations')}</h1>
                <p className="text-sm text-gray-500">{t('tools.tableReservation.manageYourRestaurantFloor', 'Manage your restaurant floor')}</p>
              </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDateChange('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-w-[200px] text-center">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-gray-900 dark:text-white font-medium cursor-pointer"
                />
              </div>
              <button
                onClick={() => handleDateChange('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-2 text-sm text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
              >
                {t('tools.tableReservation.today', 'Today')}
              </button>
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                onImportCSV={handleImportCSV}
                onImportJSON={handleImportJSON}
                disabled={reservations.length === 0}
                theme={theme === 'dark' ? 'dark' : 'light'}
              />
              <WidgetEmbedButton toolSlug="table-reservation" toolName="Table Reservation" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={handleForceSync}
                theme={theme === 'dark' ? 'dark' : 'light'}
                showLabel={true}
                size="md"
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto">
            {[
              { id: 'tables', label: 'Tables', icon: Grid3X3 },
              { id: 'reservations', label: 'Reservations', icon: Calendar },
              { id: 'waitlist', label: 'Waitlist', icon: ClipboardList, badge: stats.activeWaitlist },
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Filter }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  viewMode === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-white/20 rounded-full">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.tableReservation.totalToday', 'Total Today')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReservations}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.tableReservation.confirmed', 'Confirmed')}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.tableReservation.seated', 'Seated')}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.seated}</p>
                </div>
                <Check className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.tableReservation.totalGuests', 'Total Guests')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGuests}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.tableReservation.waitlist', 'Waitlist')}</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.activeWaitlist}</p>
                </div>
                <ClipboardList className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.tableReservation.noShows', 'No-Shows')}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.noShows}</p>
                </div>
                <Ban className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables View */}
        {viewMode === 'tables' && (
          <div className="space-y-6">
            {/* Table Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">{t('tools.tableReservation.allLocations', 'All Locations')}</option>
                  <option value="indoor">{t('tools.tableReservation.indoor', 'Indoor')}</option>
                  <option value="outdoor">{t('tools.tableReservation.outdoor', 'Outdoor')}</option>
                  <option value="bar">{t('tools.tableReservation.bar', 'Bar')}</option>
                </select>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setTableView('grid')}
                    className={`p-2 ${tableView === 'grid' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTableView('list')}
                    className={`p-2 ${tableView === 'list' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowTableModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Plus className="w-4 h-4" />
                {t('tools.tableReservation.addTable', 'Add Table')}
              </button>
            </div>

            {/* Tables Grid/List */}
            {filteredTables.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-12 text-center">
                  <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('tools.tableReservation.noTablesYet', 'No Tables Yet')}</h3>
                  <p className="text-gray-500 mb-4">{t('tools.tableReservation.setUpYourRestaurantFloor', 'Set up your restaurant floor by adding tables')}</p>
                  <button
                    onClick={() => setShowTableModal(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {t('tools.tableReservation.addFirstTable', 'Add First Table')}
                  </button>
                </CardContent>
              </Card>
            ) : (
              <div className={tableView === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
                {filteredTables.map(table => (
                  <TableCard key={table.id} table={table} />
                ))}
              </div>
            )}

            {/* Availability Grid */}
            {tables.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Availability Grid - {formatDate(selectedDate)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AvailabilityGrid />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Reservations View */}
        {viewMode === 'reservations' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('tools.tableReservation.searchByNamePhoneOr', 'Search by name, phone, or email...')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">{t('tools.tableReservation.allStatus', 'All Status')}</option>
                  <option value="confirmed">{t('tools.tableReservation.confirmed2', 'Confirmed')}</option>
                  <option value="seated">{t('tools.tableReservation.seated2', 'Seated')}</option>
                  <option value="completed">{t('tools.tableReservation.completed', 'Completed')}</option>
                  <option value="cancelled">{t('tools.tableReservation.cancelled', 'Cancelled')}</option>
                  <option value="no-show">{t('tools.tableReservation.noShow', 'No-Show')}</option>
                </select>
              </div>
              <button
                onClick={() => setShowReservationModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Plus className="w-4 h-4" />
                {t('tools.tableReservation.newReservation', 'New Reservation')}
              </button>
            </div>

            {/* Reservations List */}
            {filteredReservations.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('tools.tableReservation.noReservations', 'No Reservations')}</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No reservations match your filters'
                      : `No reservations for ${formatDate(selectedDate)}`}
                  </p>
                  <button
                    onClick={() => setShowReservationModal(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {t('tools.tableReservation.createReservation', 'Create Reservation')}
                  </button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReservations
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(reservation => (
                    <ReservationCard key={reservation.id} reservation={reservation} />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Waitlist View */}
        {viewMode === 'waitlist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('tools.tableReservation.currentWaitlist', 'Current Waitlist')}</h2>
              <button
                onClick={() => setShowWaitlistModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <UserPlus className="w-4 h-4" />
                {t('tools.tableReservation.addToWaitlist3', 'Add to Waitlist')}
              </button>
            </div>

            {waitlist.filter(w => w.status === 'waiting').length === 0 ? (
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-12 text-center">
                  <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('tools.tableReservation.waitlistEmpty', 'Waitlist Empty')}</h3>
                  <p className="text-gray-500 mb-4">{t('tools.tableReservation.noGuestsCurrentlyWaiting', 'No guests currently waiting')}</p>
                  <button
                    onClick={() => setShowWaitlistModal(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {t('tools.tableReservation.addGuest', 'Add Guest')}
                  </button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {waitlist
                  .filter(w => w.status === 'waiting')
                  .sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime())
                  .map(entry => (
                    <WaitlistEntryCard key={entry.id} entry={entry} />
                  ))}
              </div>
            )}

            {/* Past Waitlist */}
            {waitlist.filter(w => w.status !== 'waiting').length > 0 && (
              <div className="mt-8">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  {t('tools.tableReservation.pastWaitlistEntries', 'Past Waitlist Entries')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {waitlist
                    .filter(w => w.status !== 'waiting')
                    .slice(0, 6)
                    .map(entry => (
                      <WaitlistEntryCard key={entry.id} entry={entry} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Overview View */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOverviewPeriod('daily')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  overviewPeriod === 'daily'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {t('tools.tableReservation.daily', 'Daily')}
              </button>
              <button
                onClick={() => setOverviewPeriod('weekly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  overviewPeriod === 'weekly'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {t('tools.tableReservation.weekly', 'Weekly')}
              </button>
            </div>

            {overviewPeriod === 'daily' && (
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Daily Timeline - {formatDate(selectedDate)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {timeSlots.map(slot => {
                      const slotReservations = dateReservations.filter(r =>
                        r.time === slot && r.status !== 'cancelled'
                      );
                      return (
                        <div key={slot} className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                          <div className="w-20 text-sm font-medium text-gray-600 dark:text-gray-400">
                            {formatTime(slot)}
                          </div>
                          <div className="flex-1 flex flex-wrap gap-2">
                            {slotReservations.length > 0 ? (
                              slotReservations.map(res => (
                                <div
                                  key={res.id}
                                  className={`px-3 py-1 rounded-full text-xs ${STATUS_COLORS[res.status]}`}
                                >
                                  {res.guestName} ({res.partySize})
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {overviewPeriod === 'weekly' && (
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>{t('tools.tableReservation.weeklyOverview', 'Weekly Overview')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {weeklyData.map(day => (
                      <button
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        className={`p-4 rounded-lg border-2 text-center transition-colors ${
                          day.date === selectedDate
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">{day.label.split(' ')[0]}</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{day.reservations}</div>
                        <div className="text-xs text-gray-500">{day.guests} guests</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No-Show Records */}
            {noShowRecords.length > 0 && (
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    {t('tools.tableReservation.noShowHistory', 'No-Show History')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {noShowRecords
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 10)
                      .map((record, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{record.guestName}</div>
                            <div className="text-sm text-gray-500">{record.phone} - {record.email}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600">{record.count}</div>
                            <div className="text-xs text-gray-500">no-shows</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Settings View */}
        {viewMode === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>{t('tools.tableReservation.timeSlotConfiguration', 'Time Slot Configuration')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.tableReservation.openingTime', 'Opening Time')}
                    </label>
                    <input
                      type="time"
                      value={timeConfig.openTime}
                      onChange={(e) => setTimeConfig({ ...timeConfig, openTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.tableReservation.closingTime', 'Closing Time')}
                    </label>
                    <input
                      type="time"
                      value={timeConfig.closeTime}
                      onChange={(e) => setTimeConfig({ ...timeConfig, closeTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.timeSlotInterval', 'Time Slot Interval')}
                  </label>
                  <div className="flex gap-2">
                    {([15, 30, 60] as const).map(interval => (
                      <button
                        key={interval}
                        onClick={() => setTimeConfig({ ...timeConfig, interval })}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                          timeConfig.interval === interval
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {interval} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.tableReservation.defaultTurnTimeMinutes', 'Default Turn Time (minutes)')}
                  </label>
                  <input
                    type="number"
                    value={timeConfig.turnTime}
                    onChange={(e) => setTimeConfig({ ...timeConfig, turnTime: parseInt(e.target.value) || 90 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="30"
                    max="240"
                    step="15"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('tools.tableReservation.averageDiningDurationForReservations', 'Average dining duration for reservations')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>{t('tools.tableReservation.restaurantSummary', 'Restaurant Summary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{tables.length}</div>
                    <div className="text-sm text-gray-500">{t('tools.tableReservation.totalTables', 'Total Tables')}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCapacity}</div>
                    <div className="text-sm text-gray-500">{t('tools.tableReservation.totalCapacity', 'Total Capacity')}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {tables.filter(t => t.location === 'indoor').length}
                    </div>
                    <div className="text-sm text-gray-500">{t('tools.tableReservation.indoorTables', 'Indoor Tables')}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {tables.filter(t => t.location === 'outdoor').length}
                    </div>
                    <div className="text-sm text-gray-500">{t('tools.tableReservation.outdoorTables', 'Outdoor Tables')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>{t('tools.tableReservation.dataManagement', 'Data Management')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: 'Clear No-Show Records',
                      message: 'Are you sure you want to clear all no-show records?',
                      confirmText: 'Clear',
                      cancelText: 'Cancel',
                      variant: 'warning'
                    });
                    if (confirmed) {
                      setNoShowRecords([]);
                    }
                  }}
                  className="w-full px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  {t('tools.tableReservation.clearNoShowRecords', 'Clear No-Show Records')}
                </button>
                <button
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: 'Clear Past Reservations',
                      message: 'Are you sure you want to clear all past reservations? Active reservations will be kept.',
                      confirmText: 'Clear',
                      cancelText: 'Cancel',
                      variant: 'danger'
                    });
                    if (confirmed) {
                      // Delete completed, cancelled, and no-show reservations
                      reservations.forEach(r => {
                        if (r.status === 'completed' || r.status === 'cancelled' || r.status === 'no-show') {
                          deleteReservationItem(r.id);
                        }
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {t('tools.tableReservation.clearPastReservations', 'Clear Past Reservations')}
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      {showTableModal && <TableFormModal />}
      {showReservationModal && <ReservationFormModal />}
      {showWaitlistModal && <WaitlistFormModal />}
      <ConfirmDialog />
    </div>
  );
}

export default TableReservationTool;
