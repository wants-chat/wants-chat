'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Key,
  Calendar,
  Clock,
  Users,
  DollarSign,
  UserCheck,
  CheckSquare,
  Wrench,
  TrendingUp,
  Camera,
  Gift,
  Building,
  FileText,
  BarChart3,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Puzzle,
  Timer,
  Star,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Types
interface Room {
  id: string;
  name: string;
  theme: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  capacity: { min: number; max: number };
  duration: number; // in minutes
  basePrice: number;
  isActive: boolean;
  successRate: number;
  totalPlays: number;
  successfulEscapes: number;
}

interface TimeSlot {
  id: string;
  roomId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  dayOfWeek: number; // 0-6
}

interface Booking {
  id: string;
  roomId: string;
  date: string;
  timeSlotId: string;
  groupSize: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  gameMasterId?: string;
  waiverSigned: boolean;
  isCorporate: boolean;
  corporateName?: string;
  notes?: string;
  wasSuccessful?: boolean;
}

interface GameMaster {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedRooms: string[];
  isActive: boolean;
}

interface ResetChecklistItem {
  id: string;
  roomId: string;
  task: string;
  isCompleted: boolean;
  order: number;
}

interface MaintenanceLog {
  id: string;
  roomId: string;
  propName: string;
  issueType: 'broken' | 'worn' | 'missing' | 'maintenance';
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  reportedDate: string;
  resolvedDate?: string;
  cost?: number;
}

interface GiftCertificate {
  id: string;
  code: string;
  amount: number;
  balance: number;
  purchasedBy: string;
  purchasedDate: string;
  expirationDate: string;
  isRedeemed: boolean;
  redeemedDate?: string;
  bookingId?: string;
}

interface TeamPhoto {
  id: string;
  bookingId: string;
  roomId: string;
  date: string;
  customerName: string;
  photoUrl?: string;
  status: 'pending' | 'taken' | 'sent';
}

type TabType = 'rooms' | 'bookings' | 'schedule' | 'staff' | 'checklist' | 'maintenance' | 'analytics' | 'photos' | 'certificates' | 'waivers';

// Combined data structure for backend sync
interface EscapeRoomData {
  id: string;
  rooms: Room[];
  bookings: Booking[];
  timeSlots: TimeSlot[];
  gameMasters: GameMaster[];
  checklistItems: ResetChecklistItem[];
  maintenanceLogs: MaintenanceLog[];
  giftCertificates: GiftCertificate[];
  teamPhotos: TeamPhoto[];
}

// Column config for exports (used by useToolData hook)
const DATA_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
];

const difficultyColors = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-orange-500',
  Expert: 'bg-red-500',
};

const defaultTimeSlots = [
  { start: '10:00', end: '11:00' },
  { start: '11:30', end: '12:30' },
  { start: '13:00', end: '14:00' },
  { start: '14:30', end: '15:30' },
  { start: '16:00', end: '17:00' },
  { start: '17:30', end: '18:30' },
  { start: '19:00', end: '20:00' },
  { start: '20:30', end: '21:30' },
];

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Export column configurations
const ROOMS_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Room Name', type: 'string' },
  { key: 'theme', header: 'Theme', type: 'string' },
  { key: 'difficulty', header: 'Difficulty', type: 'string' },
  { key: 'capacityMin', header: 'Min Capacity', type: 'number' },
  { key: 'capacityMax', header: 'Max Capacity', type: 'number' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'basePrice', header: 'Base Price', type: 'currency' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
  { key: 'successRate', header: 'Success Rate (%)', type: 'number' },
  { key: 'totalPlays', header: 'Total Plays', type: 'number' },
];

const BOOKINGS_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'roomName', header: 'Room', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'groupSize', header: 'Group Size', type: 'number' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'isCorporate', header: 'Corporate', type: 'boolean' },
  { key: 'waiverSigned', header: 'Waiver Signed', type: 'boolean' },
];

const STAFF_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'assignedRoomNames', header: 'Assigned Rooms', type: 'string' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
];

const MAINTENANCE_COLUMNS: ColumnConfig[] = [
  { key: 'roomName', header: 'Room', type: 'string' },
  { key: 'propName', header: 'Prop Name', type: 'string' },
  { key: 'issueType', header: 'Issue Type', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'reportedDate', header: 'Reported Date', type: 'date' },
  { key: 'resolvedDate', header: 'Resolved Date', type: 'date' },
  { key: 'cost', header: 'Cost', type: 'currency' },
];

const CERTIFICATES_COLUMNS: ColumnConfig[] = [
  { key: 'code', header: 'Code', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'balance', header: 'Balance', type: 'currency' },
  { key: 'purchasedBy', header: 'Purchased By', type: 'string' },
  { key: 'purchasedDate', header: 'Purchased Date', type: 'date' },
  { key: 'expirationDate', header: 'Expiration Date', type: 'date' },
  { key: 'isRedeemed', header: 'Redeemed', type: 'boolean' },
];

interface EscapeRoomBusinessToolProps {
  uiConfig?: UIConfig;
}

// Default empty data structure
const defaultEscapeRoomData: EscapeRoomData[] = [{
  id: 'escape-room-data',
  rooms: [],
  bookings: [],
  timeSlots: [],
  gameMasters: [],
  checklistItems: [],
  maintenanceLogs: [],
  giftCertificates: [],
  teamPhotos: [],
}];

export const EscapeRoomBusinessTool = ({ uiConfig }: EscapeRoomBusinessToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('rooms');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: escapeRoomDataArray,
    setData: setEscapeRoomDataArray,
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
  } = useToolData<EscapeRoomData>('escape-room-business', defaultEscapeRoomData, DATA_COLUMNS);

  // Extract the data from the wrapper array
  const escapeRoomData = escapeRoomDataArray[0] || defaultEscapeRoomData[0];

  // Helper to update the data wrapper
  const updateData = useCallback((updater: (data: EscapeRoomData) => EscapeRoomData) => {
    setEscapeRoomDataArray(prev => {
      const current = prev[0] || defaultEscapeRoomData[0];
      return [updater(current)];
    });
  }, [setEscapeRoomDataArray]);

  // Derived state from the combined data structure
  const rooms = escapeRoomData.rooms;
  const bookings = escapeRoomData.bookings;
  const timeSlots = escapeRoomData.timeSlots;
  const gameMasters = escapeRoomData.gameMasters;
  const checklistItems = escapeRoomData.checklistItems;
  const maintenanceLogs = escapeRoomData.maintenanceLogs;
  const giftCertificates = escapeRoomData.giftCertificates;
  const teamPhotos = escapeRoomData.teamPhotos;

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

      if (params.tab && ['rooms', 'bookings', 'schedule', 'staff', 'checklist', 'maintenance', 'analytics', 'photos', 'certificates', 'waivers'].includes(params.tab)) {
        setActiveTab(params.tab);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Setters that update the combined data structure
  const setRooms = useCallback((updater: Room[] | ((prev: Room[]) => Room[])) => {
    updateData(data => ({
      ...data,
      rooms: typeof updater === 'function' ? updater(data.rooms) : updater,
    }));
  }, [updateData]);

  const setBookings = useCallback((updater: Booking[] | ((prev: Booking[]) => Booking[])) => {
    updateData(data => ({
      ...data,
      bookings: typeof updater === 'function' ? updater(data.bookings) : updater,
    }));
  }, [updateData]);

  const setTimeSlots = useCallback((updater: TimeSlot[] | ((prev: TimeSlot[]) => TimeSlot[])) => {
    updateData(data => ({
      ...data,
      timeSlots: typeof updater === 'function' ? updater(data.timeSlots) : updater,
    }));
  }, [updateData]);

  const setGameMasters = useCallback((updater: GameMaster[] | ((prev: GameMaster[]) => GameMaster[])) => {
    updateData(data => ({
      ...data,
      gameMasters: typeof updater === 'function' ? updater(data.gameMasters) : updater,
    }));
  }, [updateData]);

  const setChecklistItems = useCallback((updater: ResetChecklistItem[] | ((prev: ResetChecklistItem[]) => ResetChecklistItem[])) => {
    updateData(data => ({
      ...data,
      checklistItems: typeof updater === 'function' ? updater(data.checklistItems) : updater,
    }));
  }, [updateData]);

  const setMaintenanceLogs = useCallback((updater: MaintenanceLog[] | ((prev: MaintenanceLog[]) => MaintenanceLog[])) => {
    updateData(data => ({
      ...data,
      maintenanceLogs: typeof updater === 'function' ? updater(data.maintenanceLogs) : updater,
    }));
  }, [updateData]);

  const setGiftCertificates = useCallback((updater: GiftCertificate[] | ((prev: GiftCertificate[]) => GiftCertificate[])) => {
    updateData(data => ({
      ...data,
      giftCertificates: typeof updater === 'function' ? updater(data.giftCertificates) : updater,
    }));
  }, [updateData]);

  const setTeamPhotos = useCallback((updater: TeamPhoto[] | ((prev: TeamPhoto[]) => TeamPhoto[])) => {
    updateData(data => ({
      ...data,
      teamPhotos: typeof updater === 'function' ? updater(data.teamPhotos) : updater,
    }));
  }, [updateData]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Form states
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<GameMaster | null>(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const revenueByRoom: Record<string, number> = {};
    const bookingsByRoom: Record<string, number> = {};
    const successByRoom: Record<string, { total: number; successful: number }> = {};

    bookings.forEach(booking => {
      if (booking.status === 'completed') {
        revenueByRoom[booking.roomId] = (revenueByRoom[booking.roomId] || 0) + booking.totalPrice;
        bookingsByRoom[booking.roomId] = (bookingsByRoom[booking.roomId] || 0) + 1;

        if (!successByRoom[booking.roomId]) {
          successByRoom[booking.roomId] = { total: 0, successful: 0 };
        }
        successByRoom[booking.roomId].total += 1;
        if (booking.wasSuccessful) {
          successByRoom[booking.roomId].successful += 1;
        }
      }
    });

    const pendingWaivers = bookings.filter(b => b.status === 'confirmed' && !b.waiverSigned).length;
    const pendingMaintenance = maintenanceLogs.filter(m => m.status !== 'resolved').length;
    const activeGiftCerts = giftCertificates.filter(g => !g.isRedeemed && new Date(g.expirationDate) > new Date());
    const totalGiftCertValue = activeGiftCerts.reduce((sum, g) => sum + g.balance, 0);

    return {
      totalRevenue,
      revenueByRoom,
      bookingsByRoom,
      successByRoom,
      pendingWaivers,
      pendingMaintenance,
      activeGiftCerts: activeGiftCerts.length,
      totalGiftCertValue,
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      corporateBookings: bookings.filter(b => b.isCorporate).length,
    };
  }, [bookings, maintenanceLogs, giftCertificates]);

  // Get export data based on active tab
  const getExportData = () => {
    const roomMap = new Map(rooms.map(r => [r.id, r.name]));

    switch (activeTab) {
      case 'rooms':
        return {
          data: rooms.map(r => ({
            ...r,
            capacityMin: r.capacity.min,
            capacityMax: r.capacity.max,
          })),
          columns: ROOMS_COLUMNS,
          filename: 'escape_room_rooms',
        };
      case 'bookings':
        return {
          data: bookings.map(b => ({
            ...b,
            roomName: roomMap.get(b.roomId) || 'Unknown',
          })),
          columns: BOOKINGS_COLUMNS,
          filename: 'escape_room_bookings',
        };
      case 'staff':
        return {
          data: gameMasters.map(gm => ({
            ...gm,
            assignedRoomNames: gm.assignedRooms.map(rid => roomMap.get(rid) || 'Unknown').join(', '),
          })),
          columns: STAFF_COLUMNS,
          filename: 'escape_room_staff',
        };
      case 'maintenance':
        return {
          data: maintenanceLogs.map(m => ({
            ...m,
            roomName: roomMap.get(m.roomId) || 'Unknown',
          })),
          columns: MAINTENANCE_COLUMNS,
          filename: 'escape_room_maintenance',
        };
      case 'certificates':
        return {
          data: giftCertificates,
          columns: CERTIFICATES_COLUMNS,
          filename: 'escape_room_certificates',
        };
      default:
        return {
          data: rooms.map(r => ({
            ...r,
            capacityMin: r.capacity.min,
            capacityMax: r.capacity.max,
          })),
          columns: ROOMS_COLUMNS,
          filename: 'escape_room_data',
        };
    }
  };

  const handleExportCSV = () => {
    const { data, columns, filename } = getExportData();
    exportToCSV(data as Record<string, any>[], columns, { filename });
  };

  const handleExportExcel = () => {
    const { data, columns, filename } = getExportData();
    exportToExcel(data as Record<string, any>[], columns, { filename });
  };

  const handleExportJSON = () => {
    const { data, filename } = getExportData();
    exportToJSON(data as Record<string, any>[], { filename });
  };

  const handleExportPDF = async () => {
    const { data, columns, filename } = getExportData();
    await exportToPDF(data as Record<string, any>[], columns, { filename, title: `Escape Room - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const { data, columns } = getExportData();
    return await copyUtil(data as Record<string, any>[], columns);
  };

  const handlePrint = () => {
    const { data, columns } = getExportData();
    printData(data as Record<string, any>[], columns, { title: `Escape Room - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` });
  };

  // Room Form
  const RoomForm = () => {
    const [formData, setFormData] = useState<Partial<Room>>(
      editingRoom || {
        name: '',
        theme: '',
        difficulty: 'Medium',
        capacity: { min: 2, max: 8 },
        duration: 60,
        basePrice: 30,
        isActive: true,
        successRate: 0,
        totalPlays: 0,
        successfulEscapes: 0,
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingRoom) {
        setRooms(rooms.map(r => (r.id === editingRoom.id ? { ...editingRoom, ...formData } as Room : r)));
      } else {
        const newRoom: Room = {
          id: generateId(),
          name: formData.name || '',
          theme: formData.theme || '',
          difficulty: formData.difficulty || 'Medium',
          capacity: formData.capacity || { min: 2, max: 8 },
          duration: formData.duration || 60,
          basePrice: formData.basePrice || 30,
          isActive: formData.isActive !== false,
          successRate: 0,
          totalPlays: 0,
          successfulEscapes: 0,
        };
        setRooms([...rooms, newRoom]);

        // Generate default time slots for the new room
        const newTimeSlots: TimeSlot[] = [];
        for (let day = 0; day < 7; day++) {
          defaultTimeSlots.forEach((slot, idx) => {
            newTimeSlots.push({
              id: generateId() + idx + day,
              roomId: newRoom.id,
              startTime: slot.start,
              endTime: slot.end,
              isAvailable: true,
              dayOfWeek: day,
            });
          });
        }
        setTimeSlots([...timeSlots, ...newTimeSlots]);
      }
      setShowRoomForm(false);
      setEditingRoom(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-lg rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {editingRoom ? t('tools.escapeRoomBusiness.editRoom', 'Edit Room') : t('tools.escapeRoomBusiness.addNewRoom', 'Add New Room')}
            </h3>
            <button onClick={() => { setShowRoomForm(false); setEditingRoom(null); }}>
              <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.roomName', 'Room Name *')}
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                placeholder={t('tools.escapeRoomBusiness.eGTheHauntedMansion', 'e.g., The Haunted Mansion')}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.theme', 'Theme *')}
              </label>
              <input
                type="text"
                required
                value={formData.theme || ''}
                onChange={e => setFormData({ ...formData, theme: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                placeholder={t('tools.escapeRoomBusiness.eGHorrorMysteryAdventure', 'e.g., Horror, Mystery, Adventure')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.escapeRoomBusiness.difficulty', 'Difficulty')}
                </label>
                <select
                  value={formData.difficulty || 'Medium'}
                  onChange={e => setFormData({ ...formData, difficulty: e.target.value as Room['difficulty'] })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="Easy">{t('tools.escapeRoomBusiness.easy', 'Easy')}</option>
                  <option value="Medium">{t('tools.escapeRoomBusiness.medium', 'Medium')}</option>
                  <option value="Hard">{t('tools.escapeRoomBusiness.hard', 'Hard')}</option>
                  <option value="Expert">{t('tools.escapeRoomBusiness.expert', 'Expert')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.escapeRoomBusiness.durationMin', 'Duration (min)')}
                </label>
                <input
                  type="number"
                  min="30"
                  max="180"
                  value={formData.duration || 60}
                  onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.escapeRoomBusiness.minCapacity', 'Min Capacity')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity?.min || 2}
                  onChange={e => setFormData({ ...formData, capacity: { ...formData.capacity!, min: parseInt(e.target.value) } })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.escapeRoomBusiness.maxCapacity', 'Max Capacity')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity?.max || 8}
                  onChange={e => setFormData({ ...formData, capacity: { ...formData.capacity!, max: parseInt(e.target.value) } })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.basePricePerPerson', 'Base Price (per person)')}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice || 30}
                onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive !== false}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
              />
              <label htmlFor="isActive" className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.roomIsActiveAndAvailable', 'Room is active and available for booking')}
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowRoomForm(false); setEditingRoom(null); }}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.escapeRoomBusiness.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
              >
                {editingRoom ? t('tools.escapeRoomBusiness.updateRoom', 'Update Room') : t('tools.escapeRoomBusiness.addRoom2', 'Add Room')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Booking Form
  const BookingForm = () => {
    const [formData, setFormData] = useState<Partial<Booking>>(
      editingBooking || {
        roomId: rooms[0]?.id || '',
        date: selectedDate,
        timeSlotId: '',
        groupSize: 2,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        totalPrice: 0,
        status: 'pending',
        waiverSigned: false,
        isCorporate: false,
      }
    );

    const selectedRoomData = rooms.find(r => r.id === formData.roomId);
    const availableSlots = timeSlots.filter(
      ts => ts.roomId === formData.roomId &&
      ts.isAvailable &&
      ts.dayOfWeek === new Date(formData.date || selectedDate).getDay()
    );

    const calculatePrice = () => {
      if (!selectedRoomData || !formData.groupSize) return 0;
      let price = selectedRoomData.basePrice * formData.groupSize;
      if (formData.isCorporate) {
        price *= 0.9; // 10% corporate discount
      }
      return price;
    };

    useEffect(() => {
      setFormData(prev => ({ ...prev, totalPrice: calculatePrice() }));
    }, [formData.roomId, formData.groupSize, formData.isCorporate]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingBooking) {
        setBookings(bookings.map(b => (b.id === editingBooking.id ? { ...editingBooking, ...formData } as Booking : b)));
      } else {
        const newBooking: Booking = {
          id: generateId(),
          roomId: formData.roomId || '',
          date: formData.date || selectedDate,
          timeSlotId: formData.timeSlotId || '',
          groupSize: formData.groupSize || 2,
          customerName: formData.customerName || '',
          customerEmail: formData.customerEmail || '',
          customerPhone: formData.customerPhone || '',
          totalPrice: calculatePrice(),
          status: 'pending',
          waiverSigned: false,
          isCorporate: formData.isCorporate || false,
          corporateName: formData.corporateName,
          notes: formData.notes,
        };
        setBookings([...bookings, newBooking]);

        // Create team photo placeholder
        setTeamPhotos([...teamPhotos, {
          id: generateId(),
          bookingId: newBooking.id,
          roomId: newBooking.roomId,
          date: newBooking.date,
          customerName: newBooking.customerName,
          status: 'pending',
        }]);
      }
      setShowBookingForm(false);
      setEditingBooking(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className={`w-full max-w-lg rounded-lg p-6 my-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {editingBooking ? t('tools.escapeRoomBusiness.editBooking', 'Edit Booking') : t('tools.escapeRoomBusiness.newBooking2', 'New Booking')}
            </h3>
            <button onClick={() => { setShowBookingForm(false); setEditingBooking(null); }}>
              <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.room', 'Room *')}
              </label>
              <select
                required
                value={formData.roomId || ''}
                onChange={e => setFormData({ ...formData, roomId: e.target.value, timeSlotId: '' })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="">{t('tools.escapeRoomBusiness.selectARoom', 'Select a room')}</option>
                {rooms.filter(r => r.isActive).map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.escapeRoomBusiness.date', 'Date *')}
                </label>
                <input
                  type="date"
                  required
                  value={formData.date || selectedDate}
                  onChange={e => setFormData({ ...formData, date: e.target.value, timeSlotId: '' })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.escapeRoomBusiness.timeSlot', 'Time Slot *')}
                </label>
                <select
                  required
                  value={formData.timeSlotId || ''}
                  onChange={e => setFormData({ ...formData, timeSlotId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="">{t('tools.escapeRoomBusiness.selectTime', 'Select time')}</option>
                  {availableSlots.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      {slot.startTime} - {slot.endTime}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Group Size * {selectedRoomData && `(${selectedRoomData.capacity.min}-${selectedRoomData.capacity.max})`}
              </label>
              <input
                type="number"
                required
                min={selectedRoomData?.capacity.min || 1}
                max={selectedRoomData?.capacity.max || 20}
                value={formData.groupSize || 2}
                onChange={e => setFormData({ ...formData, groupSize: parseInt(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.customerName', 'Customer Name *')}
              </label>
              <input
                type="text"
                required
                value={formData.customerName || ''}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.escapeRoomBusiness.email', 'Email *')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail || ''}
                  onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.escapeRoomBusiness.phone', 'Phone *')}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone || ''}
                  onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCorporate"
                checked={formData.isCorporate || false}
                onChange={e => setFormData({ ...formData, isCorporate: e.target.checked })}
                className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
              />
              <label htmlFor="isCorporate" className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.corporateBooking10Discount', 'Corporate Booking (10% discount)')}
              </label>
            </div>
            {formData.isCorporate && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.escapeRoomBusiness.companyName', 'Company Name')}
                </label>
                <input
                  type="text"
                  value={formData.corporateName || ''}
                  onChange={e => setFormData({ ...formData, corporateName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            )}
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.notes', 'Notes')}
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.escapeRoomBusiness.totalPrice', 'Total Price:')}</span>
                <span className="text-xl font-bold text-[#0D9488]">${calculatePrice().toFixed(2)}</span>
              </div>
              {formData.isCorporate && (
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.escapeRoomBusiness.includes10CorporateDiscount', 'Includes 10% corporate discount')}
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowBookingForm(false); setEditingBooking(null); }}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.escapeRoomBusiness.cancel2', 'Cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
              >
                {editingBooking ? t('tools.escapeRoomBusiness.updateBooking', 'Update Booking') : t('tools.escapeRoomBusiness.createBooking', 'Create Booking')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Staff Form
  const StaffForm = () => {
    const [formData, setFormData] = useState<Partial<GameMaster>>(
      editingStaff || {
        name: '',
        email: '',
        phone: '',
        assignedRooms: [],
        isActive: true,
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingStaff) {
        setGameMasters(gameMasters.map(g => (g.id === editingStaff.id ? { ...editingStaff, ...formData } as GameMaster : g)));
      } else {
        const newStaff: GameMaster = {
          id: generateId(),
          name: formData.name || '',
          email: formData.email || '',
          phone: formData.phone || '',
          assignedRooms: formData.assignedRooms || [],
          isActive: formData.isActive !== false,
        };
        setGameMasters([...gameMasters, newStaff]);
      }
      setShowStaffForm(false);
      setEditingStaff(null);
    };

    const toggleRoomAssignment = (roomId: string) => {
      const current = formData.assignedRooms || [];
      if (current.includes(roomId)) {
        setFormData({ ...formData, assignedRooms: current.filter(id => id !== roomId) });
      } else {
        setFormData({ ...formData, assignedRooms: [...current, roomId] });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-lg rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {editingStaff ? t('tools.escapeRoomBusiness.editGameMaster', 'Edit Game Master') : t('tools.escapeRoomBusiness.addGameMaster2', 'Add Game Master')}
            </h3>
            <button onClick={() => { setShowStaffForm(false); setEditingStaff(null); }}>
              <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.name', 'Name *')}
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.escapeRoomBusiness.email2', 'Email *')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.escapeRoomBusiness.phone2', 'Phone *')}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.assignedRooms', 'Assigned Rooms')}
              </label>
              <div className="space-y-2">
                {rooms.map(room => (
                  <div key={room.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`room-${room.id}`}
                      checked={formData.assignedRooms?.includes(room.id) || false}
                      onChange={() => toggleRoomAssignment(room.id)}
                      className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                    />
                    <label htmlFor={`room-${room.id}`} className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {room.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="staffActive"
                checked={formData.isActive !== false}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
              />
              <label htmlFor="staffActive" className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.currentlyActive', 'Currently active')}
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowStaffForm(false); setEditingStaff(null); }}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.escapeRoomBusiness.cancel3', 'Cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
              >
                {editingStaff ? t('tools.escapeRoomBusiness.updateStaff', 'Update Staff') : t('tools.escapeRoomBusiness.addStaff', 'Add Staff')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Maintenance Form
  const MaintenanceForm = () => {
    const [formData, setFormData] = useState<Partial<MaintenanceLog>>({
      roomId: rooms[0]?.id || '',
      propName: '',
      issueType: 'broken',
      description: '',
      status: 'pending',
      reportedDate: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newLog: MaintenanceLog = {
        id: generateId(),
        roomId: formData.roomId || '',
        propName: formData.propName || '',
        issueType: formData.issueType || 'broken',
        description: formData.description || '',
        status: 'pending',
        reportedDate: formData.reportedDate || new Date().toISOString().split('T')[0],
      };
      setMaintenanceLogs([...maintenanceLogs, newLog]);
      setShowMaintenanceForm(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-lg rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.escapeRoomBusiness.reportMaintenanceIssue', 'Report Maintenance Issue')}
            </h3>
            <button onClick={() => setShowMaintenanceForm(false)}>
              <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.room2', 'Room *')}
              </label>
              <select
                required
                value={formData.roomId || ''}
                onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.propPuzzleName', 'Prop/Puzzle Name *')}
              </label>
              <input
                type="text"
                required
                value={formData.propName || ''}
                onChange={e => setFormData({ ...formData, propName: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                placeholder={t('tools.escapeRoomBusiness.eGCipherLockUv', 'e.g., Cipher Lock, UV Light, Hidden Panel')}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.issueType', 'Issue Type')}
              </label>
              <select
                value={formData.issueType || 'broken'}
                onChange={e => setFormData({ ...formData, issueType: e.target.value as MaintenanceLog['issueType'] })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="broken">{t('tools.escapeRoomBusiness.broken', 'Broken')}</option>
                <option value="worn">{t('tools.escapeRoomBusiness.wornDamaged', 'Worn/Damaged')}</option>
                <option value="missing">{t('tools.escapeRoomBusiness.missing', 'Missing')}</option>
                <option value="maintenance">{t('tools.escapeRoomBusiness.needsMaintenance', 'Needs Maintenance')}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.description', 'Description *')}
              </label>
              <textarea
                required
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMaintenanceForm(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.escapeRoomBusiness.cancel4', 'Cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
              >
                {t('tools.escapeRoomBusiness.reportIssue', 'Report Issue')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Gift Certificate Form
  const CertificateForm = () => {
    const [formData, setFormData] = useState({
      amount: 100,
      purchasedBy: '',
      expirationMonths: 12,
    });

    const generateCode = () => {
      return 'GC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + formData.expirationMonths);

      const newCert: GiftCertificate = {
        id: generateId(),
        code: generateCode(),
        amount: formData.amount,
        balance: formData.amount,
        purchasedBy: formData.purchasedBy,
        purchasedDate: new Date().toISOString().split('T')[0],
        expirationDate: expirationDate.toISOString().split('T')[0],
        isRedeemed: false,
      };
      setGiftCertificates([...giftCertificates, newCert]);
      setShowCertificateForm(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-md rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.escapeRoomBusiness.createGiftCertificate', 'Create Gift Certificate')}
            </h3>
            <button onClick={() => setShowCertificateForm(false)}>
              <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.amount', 'Amount *')}
              </label>
              <input
                type="number"
                required
                min="10"
                step="5"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.purchasedBy', 'Purchased By *')}
              </label>
              <input
                type="text"
                required
                value={formData.purchasedBy}
                onChange={e => setFormData({ ...formData, purchasedBy: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.escapeRoomBusiness.validForMonths', 'Valid For (months)')}
              </label>
              <select
                value={formData.expirationMonths}
                onChange={e => setFormData({ ...formData, expirationMonths: parseInt(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCertificateForm(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.escapeRoomBusiness.cancel5', 'Cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
              >
                {t('tools.escapeRoomBusiness.createCertificate', 'Create Certificate')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Tab content renderers
  const renderRoomsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.escapeRoomBusiness.roomInventory', 'Room Inventory')}
        </h3>
        <button
          onClick={() => setShowRoomForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
        >
          <Plus className="w-4 h-4" />
          {t('tools.escapeRoomBusiness.addRoom', 'Add Room')}
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <Puzzle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('tools.escapeRoomBusiness.noRoomsAddedYetAdd', 'No rooms added yet. Add your first escape room!')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map(room => (
            <Card key={room.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {room.name}
                    </CardTitle>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {room.theme}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium text-white rounded ${difficultyColors[room.difficulty]}`}>
                    {room.difficulty}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      <Users className="w-4 h-4 inline mr-1" />
                      {t('tools.escapeRoomBusiness.capacity', 'Capacity')}
                    </span>
                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      {room.capacity.min}-{room.capacity.max} players
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      <Timer className="w-4 h-4 inline mr-1" />
                      {t('tools.escapeRoomBusiness.duration', 'Duration')}
                    </span>
                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      {room.duration} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      {t('tools.escapeRoomBusiness.price', 'Price')}
                    </span>
                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      ${room.basePrice}/person
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      <Star className="w-4 h-4 inline mr-1" />
                      {t('tools.escapeRoomBusiness.successRate', 'Success Rate')}
                    </span>
                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      {room.totalPlays > 0 ? Math.round((room.successfulEscapes / room.totalPlays) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <span className={`flex items-center gap-1 text-xs ${room.isActive ? 'text-green-500' : 'text-red-500'}`}>
                      {room.isActive ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {room.isActive ? t('tools.escapeRoomBusiness.active', 'Active') : t('tools.escapeRoomBusiness.inactive', 'Inactive')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => { setEditingRoom(room); setShowRoomForm(true); }}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Edit2 className="w-3 h-3 inline mr-1" />
                    {t('tools.escapeRoomBusiness.edit', 'Edit')}
                  </button>
                  <button
                    onClick={() => setRooms(rooms.filter(r => r.id !== room.id))}
                    className="px-3 py-1.5 text-sm rounded-lg bg-red-500/10 text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderBookingsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.escapeRoomBusiness.bookings', 'Bookings')}
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
          >
            <Plus className="w-4 h-4" />
            {t('tools.escapeRoomBusiness.newBooking', 'New Booking')}
          </button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('tools.escapeRoomBusiness.noBookingsYetCreateYour', 'No bookings yet. Create your first booking!')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings
            .filter(b => !selectedDate || b.date === selectedDate)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(booking => {
              const room = rooms.find(r => r.id === booking.roomId);
              const slot = timeSlots.find(ts => ts.id === booking.timeSlotId);
              const gameMaster = gameMasters.find(gm => gm.id === booking.gameMasterId);

              return (
                <div
                  key={booking.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {booking.customerName}
                        </h4>
                        {booking.isCorporate && (
                          <span className="px-2 py-0.5 text-xs bg-purple-500/10 text-purple-500 rounded">
                            {t('tools.escapeRoomBusiness.corporate', 'Corporate')}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          booking.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          booking.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500' :
                          booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {room?.name || 'Unknown Room'} | {booking.date} {slot ? `${slot.startTime}-${slot.endTime}` : ''}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {booking.groupSize} players | ${booking.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!booking.waiverSigned && booking.status !== 'cancelled' && (
                        <span className="flex items-center gap-1 text-xs text-orange-500">
                          <AlertCircle className="w-3 h-3" />
                          {t('tools.escapeRoomBusiness.waiverPending', 'Waiver pending')}
                        </span>
                      )}
                      <select
                        value={booking.status}
                        onChange={e => {
                          const newStatus = e.target.value as Booking['status'];
                          setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));
                          if (newStatus === 'completed' && room) {
                            // Update room stats
                            setRooms(rooms.map(r => r.id === room.id ? {
                              ...r,
                              totalPlays: r.totalPlays + 1,
                            } : r));
                          }
                        }}
                        className={`px-2 py-1 text-sm rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="pending">{t('tools.escapeRoomBusiness.pending', 'Pending')}</option>
                        <option value="confirmed">{t('tools.escapeRoomBusiness.confirmed', 'Confirmed')}</option>
                        <option value="completed">{t('tools.escapeRoomBusiness.completed', 'Completed')}</option>
                        <option value="cancelled">{t('tools.escapeRoomBusiness.cancelled', 'Cancelled')}</option>
                      </select>
                      <select
                        value={booking.gameMasterId || ''}
                        onChange={e => setBookings(bookings.map(b => b.id === booking.id ? { ...b, gameMasterId: e.target.value } : b))}
                        className={`px-2 py-1 text-sm rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">{t('tools.escapeRoomBusiness.assignGm', 'Assign GM')}</option>
                        {gameMasters.filter(gm => gm.isActive).map(gm => (
                          <option key={gm.id} value={gm.id}>{gm.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {booking.status === 'completed' && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={booking.wasSuccessful || false}
                          onChange={e => {
                            const wasSuccessful = e.target.checked;
                            setBookings(bookings.map(b => b.id === booking.id ? { ...b, wasSuccessful } : b));
                            if (room) {
                              setRooms(rooms.map(r => r.id === room.id ? {
                                ...r,
                                successfulEscapes: wasSuccessful ? r.successfulEscapes + 1 : Math.max(0, r.successfulEscapes - 1),
                              } : r));
                            }
                          }}
                          className="w-4 h-4 text-[#0D9488] rounded"
                        />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          {t('tools.escapeRoomBusiness.successfulEscape', 'Successful escape')}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={booking.waiverSigned}
                          onChange={e => setBookings(bookings.map(b => b.id === booking.id ? { ...b, waiverSigned: e.target.checked } : b))}
                          className="w-4 h-4 text-[#0D9488] rounded"
                        />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          {t('tools.escapeRoomBusiness.waiverSigned', 'Waiver signed')}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );

  const renderScheduleTab = () => {
    const selectedDaySlots = timeSlots.filter(
      ts => ts.roomId === (selectedRoom || rooms[0]?.id) && ts.dayOfWeek === new Date(selectedDate).getDay()
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.escapeRoomBusiness.timeSlotSchedule', 'Time Slot Schedule')}
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={selectedRoom || rooms[0]?.id || ''}
              onChange={e => setSelectedRoom(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {daysOfWeek[new Date(selectedDate).getDay()]} - {new Date(selectedDate).toLocaleDateString()}
          </h4>
          {selectedDaySlots.length === 0 ? (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              {t('tools.escapeRoomBusiness.noTimeSlotsConfiguredFor', 'No time slots configured for this room. Add a room to generate default slots.')}
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {selectedDaySlots.map(slot => {
                const hasBooking = bookings.some(
                  b => b.timeSlotId === slot.id && b.date === selectedDate && b.status !== 'cancelled'
                );
                return (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-lg border text-center ${
                      hasBooking
                        ? 'bg-red-500/10 border-red-500/30 text-red-500'
                        : slot.isAvailable
                        ? theme === 'dark'
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : 'bg-green-50 border-green-200 text-green-600'
                        : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-400'
                        : 'bg-gray-100 border-gray-200 text-gray-500'
                    }`}
                  >
                    <div className="font-medium">{slot.startTime} - {slot.endTime}</div>
                    <div className="text-xs mt-1">
                      {hasBooking ? 'Booked' : slot.isAvailable ? t('tools.escapeRoomBusiness.available', 'Available') : t('tools.escapeRoomBusiness.blocked', 'Blocked')}
                    </div>
                    {!hasBooking && (
                      <button
                        onClick={() => {
                          setTimeSlots(timeSlots.map(ts =>
                            ts.id === slot.id ? { ...ts, isAvailable: !ts.isAvailable } : ts
                          ));
                        }}
                        className="text-xs mt-2 underline"
                      >
                        {slot.isAvailable ? 'Block' : t('tools.escapeRoomBusiness.unblock', 'Unblock')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStaffTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.escapeRoomBusiness.gameMasters', 'Game Masters')}
        </h3>
        <button
          onClick={() => setShowStaffForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
        >
          <Plus className="w-4 h-4" />
          {t('tools.escapeRoomBusiness.addGameMaster', 'Add Game Master')}
        </button>
      </div>

      {gameMasters.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('tools.escapeRoomBusiness.noGameMastersAddedYet', 'No game masters added yet.')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gameMasters.map(gm => (
            <Card key={gm.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {gm.name}
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {gm.email}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {gm.phone}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${gm.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                    {gm.isActive ? t('tools.escapeRoomBusiness.active2', 'Active') : t('tools.escapeRoomBusiness.inactive2', 'Inactive')}
                  </span>
                </div>
                <div className="mt-3">
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.escapeRoomBusiness.assignedRooms2', 'Assigned Rooms:')}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {gm.assignedRooms.map(roomId => {
                      const room = rooms.find(r => r.id === roomId);
                      return room ? (
                        <span key={roomId} className="px-2 py-0.5 text-xs bg-[#0D9488]/10 text-[#0D9488] rounded">
                          {room.name}
                        </span>
                      ) : null;
                    })}
                    {gm.assignedRooms.length === 0 && (
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {t('tools.escapeRoomBusiness.noneAssigned', 'None assigned')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => { setEditingStaff(gm); setShowStaffForm(true); }}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Edit2 className="w-3 h-3 inline mr-1" />
                    {t('tools.escapeRoomBusiness.edit2', 'Edit')}
                  </button>
                  <button
                    onClick={() => setGameMasters(gameMasters.filter(g => g.id !== gm.id))}
                    className="px-3 py-1.5 text-sm rounded-lg bg-red-500/10 text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderChecklistTab = () => {
    const addChecklistItem = (roomId: string, task: string) => {
      const roomItems = checklistItems.filter(ci => ci.roomId === roomId);
      const newItem: ResetChecklistItem = {
        id: generateId(),
        roomId,
        task,
        isCompleted: false,
        order: roomItems.length + 1,
      };
      setChecklistItems([...checklistItems, newItem]);
    };

    const [newTask, setNewTask] = useState('');
    const [taskRoom, setTaskRoom] = useState(rooms[0]?.id || '');

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.escapeRoomBusiness.roomResetChecklists', 'Room Reset Checklists')}
          </h3>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.escapeRoomBusiness.addChecklistItem', 'Add Checklist Item')}
          </h4>
          <div className="flex gap-3 flex-wrap">
            <select
              value={taskRoom}
              onChange={e => setTaskRoom(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder={t('tools.escapeRoomBusiness.taskDescription', 'Task description...')}
              className={`flex-1 min-w-48 px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <button
              onClick={() => {
                if (newTask.trim() && taskRoom) {
                  addChecklistItem(taskRoom, newTask.trim());
                  setNewTask('');
                }
              }}
              className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
            >
              {t('tools.escapeRoomBusiness.addTask', 'Add Task')}
            </button>
          </div>
        </div>

        {rooms.map(room => {
          const roomChecklist = checklistItems
            .filter(ci => ci.roomId === room.id)
            .sort((a, b) => a.order - b.order);
          const completedCount = roomChecklist.filter(ci => ci.isCompleted).length;

          return (
            <Card key={room.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {room.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {completedCount}/{roomChecklist.length} completed
                    </span>
                    <button
                      onClick={() => {
                        setChecklistItems(checklistItems.map(ci =>
                          ci.roomId === room.id ? { ...ci, isCompleted: false } : ci
                        ));
                      }}
                      className="text-xs text-[#0D9488] hover:underline"
                    >
                      {t('tools.escapeRoomBusiness.resetAll', 'Reset All')}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {roomChecklist.length === 0 ? (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.escapeRoomBusiness.noChecklistItemsAddTasks', 'No checklist items. Add tasks above.')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {roomChecklist.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-2 rounded ${
                          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={e => {
                            setChecklistItems(checklistItems.map(ci =>
                              ci.id === item.id ? { ...ci, isCompleted: e.target.checked } : ci
                            ));
                          }}
                          className="w-4 h-4 text-[#0D9488] rounded"
                        />
                        <span className={`flex-1 ${
                          item.isCompleted
                            ? 'line-through opacity-50'
                            : theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          {item.task}
                        </span>
                        <button
                          onClick={() => setChecklistItems(checklistItems.filter(ci => ci.id !== item.id))}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderMaintenanceTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.escapeRoomBusiness.propPuzzleMaintenanceLog', 'Prop/Puzzle Maintenance Log')}
        </h3>
        <button
          onClick={() => setShowMaintenanceForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
        >
          <Plus className="w-4 h-4" />
          {t('tools.escapeRoomBusiness.reportIssue2', 'Report Issue')}
        </button>
      </div>

      {maintenanceLogs.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('tools.escapeRoomBusiness.noMaintenanceIssuesReportedEverything', 'No maintenance issues reported. Everything is working great!')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {maintenanceLogs
            .sort((a, b) => {
              if (a.status === 'resolved' && b.status !== 'resolved') return 1;
              if (a.status !== 'resolved' && b.status === 'resolved') return -1;
              return new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime();
            })
            .map(log => {
              const room = rooms.find(r => r.id === log.roomId);
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {log.propName}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          log.issueType === 'broken' ? 'bg-red-500/10 text-red-500' :
                          log.issueType === 'worn' ? 'bg-orange-500/10 text-orange-500' :
                          log.issueType === 'missing' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {log.issueType}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {room?.name || 'Unknown Room'} | Reported: {log.reportedDate}
                      </p>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {log.description}
                      </p>
                    </div>
                    <select
                      value={log.status}
                      onChange={e => {
                        const newStatus = e.target.value as MaintenanceLog['status'];
                        setMaintenanceLogs(maintenanceLogs.map(m =>
                          m.id === log.id ? {
                            ...m,
                            status: newStatus,
                            resolvedDate: newStatus === 'resolved' ? new Date().toISOString().split('T')[0] : undefined,
                          } : m
                        ));
                      }}
                      className={`px-2 py-1 text-sm rounded border ${
                        log.status === 'resolved'
                          ? 'bg-green-500/10 border-green-500/30 text-green-500'
                          : log.status === 'in-progress'
                          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                          : theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="pending">{t('tools.escapeRoomBusiness.pending2', 'Pending')}</option>
                      <option value="in-progress">{t('tools.escapeRoomBusiness.inProgress', 'In Progress')}</option>
                      <option value="resolved">{t('tools.escapeRoomBusiness.resolved', 'Resolved')}</option>
                    </select>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.escapeRoomBusiness.businessAnalytics', 'Business Analytics')}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.escapeRoomBusiness.totalRevenue', 'Total Revenue')}</p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.escapeRoomBusiness.totalBookings', 'Total Bookings')}</p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalBookings}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Building className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.escapeRoomBusiness.corporateBookings', 'Corporate Bookings')}</p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.corporateBookings}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.escapeRoomBusiness.pendingWaivers', 'Pending Waivers')}</p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.pendingWaivers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            {t('tools.escapeRoomBusiness.revenueByRoom', 'Revenue by Room')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              {t('tools.escapeRoomBusiness.addRoomsToSeeRevenue', 'Add rooms to see revenue breakdown.')}
            </p>
          ) : (
            <div className="space-y-4">
              {rooms.map(room => {
                const revenue = analytics.revenueByRoom[room.id] || 0;
                const bookingCount = analytics.bookingsByRoom[room.id] || 0;
                const successData = analytics.successByRoom[room.id] || { total: 0, successful: 0 };
                const successRate = successData.total > 0 ? Math.round((successData.successful / successData.total) * 100) : 0;
                const maxRevenue = Math.max(...Object.values(analytics.revenueByRoom), 1);
                const percentage = (revenue / maxRevenue) * 100;

                return (
                  <div key={room.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                        {room.name}
                      </span>
                      <div className="text-right">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${revenue.toFixed(2)}
                        </span>
                        <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({bookingCount} bookings, {successRate}% success)
                        </span>
                      </div>
                    </div>
                    <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full bg-[#0D9488]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              {t('tools.escapeRoomBusiness.giftCertificates', 'Gift Certificates')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.escapeRoomBusiness.activeCertificates', 'Active Certificates')}</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{analytics.activeGiftCerts}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.escapeRoomBusiness.outstandingValue', 'Outstanding Value')}</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${analytics.totalGiftCertValue.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              {t('tools.escapeRoomBusiness.maintenanceStatus', 'Maintenance Status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.escapeRoomBusiness.pendingIssues', 'Pending Issues')}</span>
                <span className={analytics.pendingMaintenance > 0 ? 'text-orange-500' : theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {analytics.pendingMaintenance}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.escapeRoomBusiness.totalLogged', 'Total Logged')}</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{maintenanceLogs.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPhotosTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.escapeRoomBusiness.teamPhotos', 'Team Photos')}
        </h3>
      </div>

      <div className={`p-6 rounded-lg border-2 border-dashed text-center ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
      }`}>
        <Camera className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
        <h4 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.escapeRoomBusiness.photoUploadComingSoon', 'Photo Upload Coming Soon')}
        </h4>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('tools.escapeRoomBusiness.thisIsAPlaceholderFor', 'This is a placeholder for team photo management. Photos will be linked to completed bookings.')}
        </p>
      </div>

      {teamPhotos.length > 0 && (
        <div className="space-y-3">
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.escapeRoomBusiness.photoQueue', 'Photo Queue')}
          </h4>
          {teamPhotos.map(photo => {
            const room = rooms.find(r => r.id === photo.roomId);
            return (
              <div
                key={photo.id}
                className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {photo.customerName}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {room?.name} | {photo.date}
                    </p>
                  </div>
                  <select
                    value={photo.status}
                    onChange={e => setTeamPhotos(teamPhotos.map(p =>
                      p.id === photo.id ? { ...p, status: e.target.value as TeamPhoto['status'] } : p
                    ))}
                    className={`px-2 py-1 text-sm rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="pending">{t('tools.escapeRoomBusiness.pending3', 'Pending')}</option>
                    <option value="taken">{t('tools.escapeRoomBusiness.taken', 'Taken')}</option>
                    <option value="sent">{t('tools.escapeRoomBusiness.sent', 'Sent')}</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCertificatesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.escapeRoomBusiness.giftCertificates2', 'Gift Certificates')}
        </h3>
        <button
          onClick={() => setShowCertificateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
        >
          <Plus className="w-4 h-4" />
          {t('tools.escapeRoomBusiness.createCertificate2', 'Create Certificate')}
        </button>
      </div>

      {giftCertificates.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('tools.escapeRoomBusiness.noGiftCertificatesCreatedYet', 'No gift certificates created yet.')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {giftCertificates.map(cert => (
            <div
              key={cert.id}
              className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <code className={`px-2 py-1 rounded text-sm font-mono ${
                      theme === 'dark' ? t('tools.escapeRoomBusiness.bgGray700Text0d9488', 'bg-gray-700 text-[#0D9488]') : t('tools.escapeRoomBusiness.bgGray100Text0d9488', 'bg-gray-100 text-[#0D9488]')
                    }`}>
                      {cert.code}
                    </code>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      cert.isRedeemed
                        ? 'bg-gray-500/10 text-gray-500'
                        : new Date(cert.expirationDate) < new Date()
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-green-500/10 text-green-500'
                    }`}>
                      {cert.isRedeemed ? 'Redeemed' : new Date(cert.expirationDate) < new Date() ? t('tools.escapeRoomBusiness.expired', 'Expired') : t('tools.escapeRoomBusiness.active3', 'Active')}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Purchased by: {cert.purchasedBy} on {cert.purchasedDate}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Expires: {cert.expirationDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${cert.balance.toFixed(2)}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    of ${cert.amount.toFixed(2)}
                  </p>
                  {!cert.isRedeemed && new Date(cert.expirationDate) > new Date() && (
                    <button
                      onClick={() => {
                        setGiftCertificates(giftCertificates.map(c =>
                          c.id === cert.id ? { ...c, isRedeemed: true, redeemedDate: new Date().toISOString().split('T')[0], balance: 0 } : c
                        ));
                      }}
                      className="text-xs text-[#0D9488] hover:underline mt-1"
                    >
                      {t('tools.escapeRoomBusiness.markRedeemed', 'Mark Redeemed')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWaiversTab = () => {
    const pendingWaivers = bookings.filter(b => !b.waiverSigned && b.status !== 'cancelled');
    const signedWaivers = bookings.filter(b => b.waiverSigned);

    return (
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.escapeRoomBusiness.waiverTracking', 'Waiver Tracking')}
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-base flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Pending Waivers ({pendingWaivers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingWaivers.length === 0 ? (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.escapeRoomBusiness.allWaiversSigned', 'All waivers signed!')}
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pendingWaivers.map(booking => {
                    const room = rooms.find(r => r.id === booking.roomId);
                    return (
                      <div
                        key={booking.id}
                        className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {booking.customerName}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {room?.name} | {booking.date}
                            </p>
                          </div>
                          <button
                            onClick={() => setBookings(bookings.map(b =>
                              b.id === booking.id ? { ...b, waiverSigned: true } : b
                            ))}
                            className="text-xs px-2 py-1 bg-[#0D9488] text-white rounded hover:bg-[#0F766E]"
                          >
                            {t('tools.escapeRoomBusiness.markSigned', 'Mark Signed')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-base flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <CheckCircle className="w-4 h-4 text-green-500" />
                Signed Waivers ({signedWaivers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {signedWaivers.length === 0 ? (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.escapeRoomBusiness.noSignedWaiversYet', 'No signed waivers yet.')}
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {signedWaivers.slice(0, 10).map(booking => {
                    const room = rooms.find(r => r.id === booking.roomId);
                    return (
                      <div
                        key={booking.id}
                        className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {booking.customerName}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {room?.name} | {booking.date}
                        </p>
                      </div>
                    );
                  })}
                  {signedWaivers.length > 10 && (
                    <p className={`text-xs text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      +{signedWaivers.length - 10} more
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'rooms', label: 'Rooms', icon: <Key className="w-4 h-4" /> },
    { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Clock className="w-4 h-4" /> },
    { id: 'staff', label: 'Staff', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'checklist', label: 'Checklist', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'photos', label: 'Photos', icon: <Camera className="w-4 h-4" /> },
    { id: 'certificates', label: 'Certificates', icon: <Gift className="w-4 h-4" /> },
    { id: 'waivers', label: 'Waivers', icon: <FileText className="w-4 h-4" /> },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className={`max-w-6xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.escapeRoomBusiness.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Puzzle className="w-6 h-6 text-[#0D9488]" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.escapeRoomBusiness.escapeRoomBusinessManager', 'Escape Room Business Manager')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.escapeRoomBusiness.manageRoomsBookingsStaffAnd', 'Manage rooms, bookings, staff, and operations')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="escape-room-business" toolName="Escape Room Business" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme === 'dark' ? 'dark' : 'light'}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onCopyToClipboard={handleCopyToClipboard}
            onPrint={handlePrint}
            showImport={false}
            theme={theme}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-[#0D9488] shadow-sm'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        {activeTab === 'rooms' && renderRoomsTab()}
        {activeTab === 'bookings' && renderBookingsTab()}
        {activeTab === 'schedule' && renderScheduleTab()}
        {activeTab === 'staff' && renderStaffTab()}
        {activeTab === 'checklist' && renderChecklistTab()}
        {activeTab === 'maintenance' && renderMaintenanceTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'photos' && renderPhotosTab()}
        {activeTab === 'certificates' && renderCertificatesTab()}
        {activeTab === 'waivers' && renderWaiversTab()}
      </div>

      {/* Modals */}
      {showRoomForm && <RoomForm />}
      {showBookingForm && <BookingForm />}
      {showStaffForm && <StaffForm />}
      {showMaintenanceForm && <MaintenanceForm />}
      {showCertificateForm && <CertificateForm />}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.escapeRoomBusiness.aboutEscapeRoomBusinessManager', 'About Escape Room Business Manager')}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          A comprehensive tool for managing your escape room business. Track room inventory, manage bookings and time slots,
          assign game masters, maintain reset checklists, log prop/puzzle maintenance, monitor success rates, manage team photos,
          handle gift certificates, track corporate events, and monitor waiver compliance. Your data is automatically synced to the cloud
          when you are signed in, with local storage as a fallback for offline access.
        </p>
      </div>
    </div>
  );
};

export default EscapeRoomBusinessTool;
