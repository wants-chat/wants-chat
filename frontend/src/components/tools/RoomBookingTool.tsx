'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Save,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Download,
  RefreshCw,
  BarChart3,
  Wifi,
  Tv,
  Coffee,
  Projector,
  Phone,
  Monitor,
  Printer,
  Wind,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import api from '../../lib/api';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData, { type UseToolDataReturn } from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface RoomBookingToolProps {
  uiConfig?: UIConfig;
}

// TypeScript interfaces
interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  amenities: string[];
  hourlyRate: number;
  dailyRate: number;
  floor: string;
  building: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

interface Booking {
  id: string;
  roomId: string;
  guestName: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: BookingStatus;
  notes: string;
  totalAmount: number;
  createdAt: string;
}

type RoomType = 'meeting-room' | 'conference-hall' | 'hotel-room' | 'office' | 'studio';
type BookingStatus = 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
type TabType = 'rooms' | 'bookings' | 'calendar' | 'reports';

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'meeting-room', label: 'Meeting Room' },
  { value: 'conference-hall', label: 'Conference Hall' },
  { value: 'hotel-room', label: 'Hotel Room' },
  { value: 'office', label: 'Office' },
  { value: 'studio', label: 'Studio' },
];

const BOOKING_STATUSES: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'checked-in', label: 'Checked In', color: 'green' },
  { value: 'checked-out', label: 'Checked Out', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'tv', label: 'TV/Display', icon: Tv },
  { id: 'coffee', label: 'Coffee/Tea', icon: Coffee },
  { id: 'projector', label: 'Projector', icon: Projector },
  { id: 'phone', label: 'Conference Phone', icon: Phone },
  { id: 'whiteboard', label: 'Whiteboard', icon: Monitor },
  { id: 'printer', label: 'Printer', icon: Printer },
  { id: 'ac', label: 'Air Conditioning', icon: Wind },
];

// Column configurations for export
const bookingColumns: ColumnConfig[] = [
  { key: 'id', header: 'Booking ID', type: 'string' },
  { key: 'guestName', header: 'Guest Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'roomName', header: 'Room', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'purpose', header: 'Purpose', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'totalAmount', header: 'Amount', type: 'currency' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const roomColumns: ColumnConfig[] = [
  { key: 'id', header: 'Room ID', type: 'string' },
  { key: 'name', header: 'Room Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'capacity', header: 'Capacity', type: 'number' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'dailyRate', header: 'Daily Rate', type: 'currency' },
  { key: 'floor', header: 'Floor', type: 'string' },
  { key: 'building', header: 'Building', type: 'string' },
  { key: 'amenities', header: 'Amenities', type: 'string', format: (v) => Array.isArray(v) ? v.join(', ') : v },
];

// Generate sample data
const generateSampleRooms = (): Room[] => [
  {
    id: 'room-1',
    name: 'Executive Boardroom',
    type: 'conference-hall',
    capacity: 20,
    amenities: ['wifi', 'tv', 'projector', 'phone', 'whiteboard', 'ac'],
    hourlyRate: 150,
    dailyRate: 1000,
    floor: '10th Floor',
    building: 'Main Tower',
    description: 'Premium conference hall with panoramic city views',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-2',
    name: 'Innovation Hub',
    type: 'meeting-room',
    capacity: 8,
    amenities: ['wifi', 'tv', 'whiteboard', 'coffee', 'ac'],
    hourlyRate: 75,
    dailyRate: 450,
    floor: '5th Floor',
    building: 'Main Tower',
    description: 'Creative meeting space for brainstorming sessions',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-3',
    name: 'Suite 301',
    type: 'hotel-room',
    capacity: 2,
    amenities: ['wifi', 'tv', 'coffee', 'ac'],
    hourlyRate: 50,
    dailyRate: 200,
    floor: '3rd Floor',
    building: 'West Wing',
    description: 'Comfortable suite with king-size bed',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-4',
    name: 'Recording Studio A',
    type: 'studio',
    capacity: 5,
    amenities: ['wifi', 'ac'],
    hourlyRate: 200,
    dailyRate: 1200,
    floor: 'Basement',
    building: 'Creative Center',
    description: 'Soundproofed studio with professional equipment',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-5',
    name: 'Office 502',
    type: 'office',
    capacity: 4,
    amenities: ['wifi', 'printer', 'phone', 'ac'],
    hourlyRate: 40,
    dailyRate: 250,
    floor: '5th Floor',
    building: 'East Wing',
    description: 'Private office space for focused work',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const generateSampleBookings = (): Booking[] => {
  const today = new Date();
  return [
    {
      id: 'booking-1',
      roomId: 'room-1',
      guestName: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1 555-0101',
      date: today.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '12:00',
      purpose: 'Quarterly Board Meeting',
      status: 'confirmed',
      notes: 'Catering required for 15 people',
      totalAmount: 450,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'booking-2',
      roomId: 'room-2',
      guestName: 'Sarah Johnson',
      email: 'sarah.j@startup.io',
      phone: '+1 555-0102',
      date: today.toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '16:00',
      purpose: 'Product Design Workshop',
      status: 'checked-in',
      notes: '',
      totalAmount: 150,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'booking-3',
      roomId: 'room-3',
      guestName: 'Michael Brown',
      email: 'mbrown@email.com',
      phone: '+1 555-0103',
      date: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
      startTime: '00:00',
      endTime: '23:59',
      purpose: 'Business Trip Stay',
      status: 'pending',
      notes: 'Late check-in expected around 10 PM',
      totalAmount: 200,
      createdAt: new Date().toISOString(),
    },
  ];
};

export const RoomBookingTool: React.FC<RoomBookingToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Initialize hooks for rooms and bookings with backend sync
  const roomsData = useToolData<Room>(
    'room-booking-rooms',
    generateSampleRooms(),
    roomColumns,
    { autoSave: true }
  );

  const bookingsData = useToolData<Booking>(
    'room-booking-bookings',
    generateSampleBookings(),
    bookingColumns,
    { autoSave: true }
  );

  // Use data from hooks
  const rooms = roomsData.data;
  const bookings = bookingsData.data;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('rooms');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Form states
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoomType, setFilterRoomType] = useState<RoomType | ''>('');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | ''>('');
  const [filterDate, setFilterDate] = useState('');

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());

  // New room form
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: '',
    type: 'meeting-room',
    capacity: 1,
    amenities: [],
    hourlyRate: 0,
    dailyRate: 0,
    floor: '',
    building: '',
    description: '',
    isActive: true,
  });

  // New booking form
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    roomId: '',
    guestName: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    status: 'pending',
    notes: '',
  });

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description || params.firstName || params.lastName) {
        setNewBooking(prev => ({
          ...prev,
          guestName: params.firstName && params.lastName
            ? `${params.firstName} ${params.lastName}`
            : params.title || prev.guestName,
          purpose: params.description || prev.purpose,
          email: params.email || prev.email,
          phone: params.phone || prev.phone,
        }));
        setShowBookingForm(true);
        setActiveTab('bookings');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Check for booking conflicts
  const hasConflict = (roomId: string, date: string, startTime: string, endTime: string, excludeBookingId?: string): boolean => {
    return bookings.some(booking => {
      if (booking.roomId !== roomId) return false;
      if (booking.date !== date) return false;
      if (booking.status === 'cancelled' || booking.status === 'checked-out') return false;
      if (excludeBookingId && booking.id === excludeBookingId) return false;

      // Check time overlap
      const bookingStart = parseInt(booking.startTime.replace(':', ''));
      const bookingEnd = parseInt(booking.endTime.replace(':', ''));
      const newStart = parseInt(startTime.replace(':', ''));
      const newEnd = parseInt(endTime.replace(':', ''));

      return (newStart < bookingEnd && newEnd > bookingStart);
    });
  };

  // Calculate total amount
  const calculateAmount = (roomId: string, startTime: string, endTime: string): number => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;

    const start = parseInt(startTime.split(':')[0]) + parseInt(startTime.split(':')[1]) / 60;
    const end = parseInt(endTime.split(':')[0]) + parseInt(endTime.split(':')[1]) / 60;
    const hours = Math.max(0, end - start);

    return Math.round(room.hourlyRate * hours * 100) / 100;
  };

  // CRUD handlers for Rooms
  const handleAddRoom = async () => {
    if (!newRoom.name || !newRoom.type) return;

    const room: Room = {
      id: `room-${Date.now()}`,
      name: newRoom.name || '',
      type: newRoom.type as RoomType || 'meeting-room',
      capacity: newRoom.capacity || 1,
      amenities: newRoom.amenities || [],
      hourlyRate: newRoom.hourlyRate || 0,
      dailyRate: newRoom.dailyRate || 0,
      floor: newRoom.floor || '',
      building: newRoom.building || '',
      description: newRoom.description || '',
      imageUrl: newRoom.imageUrl,
      isActive: newRoom.isActive ?? true,
      createdAt: new Date().toISOString(),
    };

    roomsData.addItem(room);
    setNewRoom({
      name: '',
      type: 'meeting-room',
      capacity: 1,
      amenities: [],
      hourlyRate: 0,
      dailyRate: 0,
      floor: '',
      building: '',
      description: '',
      isActive: true,
    });
    setShowRoomForm(false);
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom) return;
    roomsData.updateItem(editingRoom.id, editingRoom);
    setEditingRoom(null);
  };

  const handleDeleteRoom = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this room? All associated bookings will be affected.');
    if (confirmed) {
      roomsData.deleteItem(id);
      // Also delete associated bookings
      bookings.forEach(booking => {
        if (booking.roomId === id) {
          bookingsData.deleteItem(booking.id);
        }
      });
    }
  };

  // CRUD handlers for Bookings
  const handleAddBooking = async () => {
    if (!newBooking.roomId || !newBooking.guestName || !newBooking.date) return;

    const conflict = hasConflict(
      newBooking.roomId,
      newBooking.date!,
      newBooking.startTime!,
      newBooking.endTime!
    );

    if (conflict) {
      setValidationMessage('This time slot is already booked. Please choose a different time.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const booking: Booking = {
      id: `booking-${Date.now()}`,
      roomId: newBooking.roomId,
      guestName: newBooking.guestName || '',
      email: newBooking.email || '',
      phone: newBooking.phone || '',
      date: newBooking.date || new Date().toISOString().split('T')[0],
      startTime: newBooking.startTime || '09:00',
      endTime: newBooking.endTime || '10:00',
      purpose: newBooking.purpose || '',
      status: newBooking.status as BookingStatus || 'pending',
      notes: newBooking.notes || '',
      totalAmount: calculateAmount(newBooking.roomId, newBooking.startTime!, newBooking.endTime!),
      createdAt: new Date().toISOString(),
    };

    bookingsData.addItem(booking);
    setNewBooking({
      roomId: '',
      guestName: '',
      email: '',
      phone: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      purpose: '',
      status: 'pending',
      notes: '',
    });
    setShowBookingForm(false);
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking) return;

    const conflict = hasConflict(
      editingBooking.roomId,
      editingBooking.date,
      editingBooking.startTime,
      editingBooking.endTime,
      editingBooking.id
    );

    if (conflict) {
      setValidationMessage('This time slot is already booked. Please choose a different time.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const updatedBooking = {
      ...editingBooking,
      totalAmount: calculateAmount(editingBooking.roomId, editingBooking.startTime, editingBooking.endTime),
    };

    bookingsData.updateItem(updatedBooking.id, updatedBooking);
    setEditingBooking(null);
  };

  const handleDeleteBooking = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this booking?');
    if (confirmed) {
      bookingsData.deleteItem(id);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    bookingsData.updateItem(bookingId, { status: newStatus });
  };

  // Toggle amenity
  const toggleAmenity = (amenityId: string, isEditing: boolean = false) => {
    if (isEditing && editingRoom) {
      const amenities = editingRoom.amenities.includes(amenityId)
        ? editingRoom.amenities.filter(a => a !== amenityId)
        : [...editingRoom.amenities, amenityId];
      setEditingRoom({ ...editingRoom, amenities });
    } else {
      const amenities = (newRoom.amenities || []).includes(amenityId)
        ? (newRoom.amenities || []).filter(a => a !== amenityId)
        : [...(newRoom.amenities || []), amenityId];
      setNewRoom({ ...newRoom, amenities });
    }
  };

  // Reset all data
  const handleReset = async () => {
    const confirmed = await confirm('Are you sure you want to reset all data? This will load sample data.');
    if (confirmed) {
      roomsData.resetToDefault(generateSampleRooms());
      bookingsData.resetToDefault(generateSampleBookings());
    }
  };

  // Prepare booking data with room names for export
  const exportableBookings = useMemo(() =>
    bookings.map(b => ({
      ...b,
      roomName: rooms.find(r => r.id === b.roomId)?.name || 'Unknown Room'
    })),
    [bookings, rooms]
  );

  // Export handlers using hook methods
  const handleExportCSV = () => {
    bookingsData.exportCSV({ filename: 'room-bookings' });
  };

  const handleExportExcel = () => {
    bookingsData.exportExcel({ filename: 'room-bookings' });
  };

  const handleExportJSON = () => {
    bookingsData.exportJSON({ filename: 'room-bookings-full' });
  };

  const handleExportPDF = async () => {
    await bookingsData.exportPDF({
      filename: 'room-bookings',
      title: 'Room Bookings Report',
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      orientation: 'landscape'
    });
  };

  const handlePrint = () => {
    bookingsData.print('Room Bookings Report');
  };

  const handleCopyToClipboard = async () => {
    return bookingsData.copyToClipboard('tab');
  };

  const handleImportCSV = async (file: File) => {
    const result = await bookingsData.importCSV(file);
    if (result.success) {
      setValidationMessage(`Successfully imported ${result.rowCount} bookings!`);
      setTimeout(() => setValidationMessage(null), 3000);
    } else {
      setValidationMessage('Failed to import CSV file');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleImportJSON = async (file: File) => {
    const result = await bookingsData.importJSON(file);
    if (result.success) {
      setValidationMessage('Successfully imported bookings!');
      setTimeout(() => setValidationMessage(null), 3000);
    } else {
      setValidationMessage('Failed to import JSON file');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  // Filtered data
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (searchQuery && !room.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterRoomType && room.type !== filterRoomType) return false;
      return true;
    });
  }, [rooms, searchQuery, filterRoomType]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (searchQuery) {
        const room = rooms.find(r => r.id === booking.roomId);
        const searchLower = searchQuery.toLowerCase();
        if (!booking.guestName.toLowerCase().includes(searchLower) &&
            !room?.name.toLowerCase().includes(searchLower)) return false;
      }
      if (filterStatus && booking.status !== filterStatus) return false;
      if (filterDate && booking.date !== filterDate) return false;
      return true;
    });
  }, [bookings, rooms, searchQuery, filterStatus, filterDate]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getBookingsForDate = (date: string) => {
    return bookings.filter(b => b.date === date && b.status !== 'cancelled');
  };

  // Reports calculations
  const reports = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const monthBookings = bookings.filter(b => b.date.startsWith(thisMonth));

    const totalRevenue = monthBookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const statusCounts = BOOKING_STATUSES.reduce((acc, status) => {
      acc[status.value] = bookings.filter(b => b.status === status.value).length;
      return acc;
    }, {} as Record<BookingStatus, number>);

    const roomUtilization = rooms.map(room => {
      const roomBookings = monthBookings.filter(b => b.roomId === room.id && b.status !== 'cancelled');
      const totalHours = roomBookings.reduce((sum, b) => {
        const start = parseInt(b.startTime.split(':')[0]) + parseInt(b.startTime.split(':')[1]) / 60;
        const end = parseInt(b.endTime.split(':')[0]) + parseInt(b.endTime.split(':')[1]) / 60;
        return sum + (end - start);
      }, 0);
      return {
        room,
        bookingCount: roomBookings.length,
        totalHours,
        revenue: roomBookings.reduce((sum, b) => sum + b.totalAmount, 0),
      };
    });

    return {
      totalBookings: bookings.length,
      monthlyBookings: monthBookings.length,
      totalRevenue,
      statusCounts,
      roomUtilization,
      occupancyRate: rooms.length > 0
        ? Math.round((roomUtilization.filter(r => r.bookingCount > 0).length / rooms.length) * 100)
        : 0,
    };
  }, [rooms, bookings]);

  // Styling classes
  const inputClass = `w-full px-4 py-2.5 border ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;

  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const tabClass = (tab: TabType) => `px-4 py-2 rounded-lg font-medium transition-colors ${
    activeTab === tab
      ? 'bg-[#0D9488] text-white'
      : isDark
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;

  const getStatusColor = (status: BookingStatus) => {
    const statusInfo = BOOKING_STATUSES.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      green: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      gray: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600',
      red: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    };
    return colors[statusInfo?.color || 'gray'];
  };

  const getRoomTypeBadge = (type: RoomType) => {
    const typeInfo = ROOM_TYPES.find(t => t.value === type);
    return typeInfo?.label || type;
  };

  // Render Room Form
  const renderRoomForm = (room: Partial<Room>, isEditing: boolean = false) => {
    const setRoom = isEditing
      ? (updates: Partial<Room>) => setEditingRoom({ ...editingRoom!, ...updates })
      : (updates: Partial<Room>) => setNewRoom({ ...newRoom, ...updates });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.roomName', 'Room Name *')}
            </label>
            <input
              type="text"
              value={room.name || ''}
              onChange={(e) => setRoom({ name: e.target.value })}
              placeholder={t('tools.roomBooking.eGExecutiveBoardroom', 'e.g., Executive Boardroom')}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.roomType', 'Room Type *')}
            </label>
            <select
              value={room.type || 'meeting-room'}
              onChange={(e) => setRoom({ type: e.target.value as RoomType })}
              className={inputClass}
            >
              {ROOM_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.capacity', 'Capacity')}
            </label>
            <input
              type="number"
              value={room.capacity || ''}
              onChange={(e) => setRoom({ capacity: parseInt(e.target.value) || 1 })}
              min="1"
              placeholder={t('tools.roomBooking.numberOfPeople', 'Number of people')}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.hourlyRate', 'Hourly Rate ($)')}
            </label>
            <input
              type="number"
              value={room.hourlyRate || ''}
              onChange={(e) => setRoom({ hourlyRate: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.dailyRate', 'Daily Rate ($)')}
            </label>
            <input
              type="number"
              value={room.dailyRate || ''}
              onChange={(e) => setRoom({ dailyRate: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.floor', 'Floor')}
            </label>
            <input
              type="text"
              value={room.floor || ''}
              onChange={(e) => setRoom({ floor: e.target.value })}
              placeholder={t('tools.roomBooking.eG5thFloor', 'e.g., 5th Floor')}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.building', 'Building')}
            </label>
            <input
              type="text"
              value={room.building || ''}
              onChange={(e) => setRoom({ building: e.target.value })}
              placeholder={t('tools.roomBooking.eGMainTower', 'e.g., Main Tower')}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.roomBooking.description', 'Description')}
          </label>
          <textarea
            value={room.description || ''}
            onChange={(e) => setRoom({ description: e.target.value })}
            placeholder={t('tools.roomBooking.describeTheRoom', 'Describe the room...')}
            rows={2}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.roomBooking.amenities', 'Amenities')}
          </label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((amenity) => (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id, isEditing)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                  (room.amenities || []).includes(amenity.id)
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <amenity.icon className="w-3.5 h-3.5" />
                {amenity.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={isEditing ? 'edit-active' : 'new-active'}
            checked={room.isActive ?? true}
            onChange={(e) => setRoom({ isActive: e.target.checked })}
            className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
          />
          <label
            htmlFor={isEditing ? 'edit-active' : 'new-active'}
            className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            {t('tools.roomBooking.roomIsActiveAndAvailable', 'Room is active and available for booking')}
          </label>
        </div>
      </div>
    );
  };

  // Render Booking Form
  const renderBookingForm = (booking: Partial<Booking>, isEditing: boolean = false) => {
    const setBookingData = isEditing
      ? (updates: Partial<Booking>) => setEditingBooking({ ...editingBooking!, ...updates })
      : (updates: Partial<Booking>) => setNewBooking({ ...newBooking, ...updates });

    const selectedRoom = rooms.find(r => r.id === booking.roomId);
    const estimatedAmount = booking.roomId && booking.startTime && booking.endTime
      ? calculateAmount(booking.roomId, booking.startTime, booking.endTime)
      : 0;

    const conflictDetected = booking.roomId && booking.date && booking.startTime && booking.endTime
      ? hasConflict(booking.roomId, booking.date, booking.startTime, booking.endTime, isEditing ? editingBooking?.id : undefined)
      : false;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.roomBooking.selectRoom', 'Select Room *')}
          </label>
          <select
            value={booking.roomId || ''}
            onChange={(e) => setBookingData({ roomId: e.target.value })}
            className={inputClass}
          >
            <option value="">{t('tools.roomBooking.chooseARoom', 'Choose a room...')}</option>
            {rooms.filter(r => r.isActive).map(room => (
              <option key={room.id} value={room.id}>
                {room.name} - {getRoomTypeBadge(room.type)} (Capacity: {room.capacity})
              </option>
            ))}
          </select>
        </div>

        {selectedRoom && (
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRoom.name}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedRoom.floor}, {selectedRoom.building}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#0D9488] font-medium">${selectedRoom.hourlyRate}/hour</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ${selectedRoom.dailyRate}/day
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.guestBookerName', 'Guest/Booker Name *')}
            </label>
            <input
              type="text"
              value={booking.guestName || ''}
              onChange={(e) => setBookingData({ guestName: e.target.value })}
              placeholder={t('tools.roomBooking.fullName', 'Full name')}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.email', 'Email')}
            </label>
            <input
              type="email"
              value={booking.email || ''}
              onChange={(e) => setBookingData({ email: e.target.value })}
              placeholder={t('tools.roomBooking.emailExampleCom', 'email@example.com')}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.phone', 'Phone')}
            </label>
            <input
              type="tel"
              value={booking.phone || ''}
              onChange={(e) => setBookingData({ phone: e.target.value })}
              placeholder="+1 555-0100"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.date', 'Date *')}
            </label>
            <input
              type="date"
              value={booking.date || ''}
              onChange={(e) => setBookingData({ date: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.startTime', 'Start Time *')}
            </label>
            <input
              type="time"
              value={booking.startTime || ''}
              onChange={(e) => setBookingData({ startTime: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.endTime', 'End Time *')}
            </label>
            <input
              type="time"
              value={booking.endTime || ''}
              onChange={(e) => setBookingData({ endTime: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        {conflictDetected && (
          <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>{t('tools.roomBooking.thisTimeSlotIsAlready', 'This time slot is already booked. Please choose a different time.')}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.roomBooking.purpose', 'Purpose')}
          </label>
          <input
            type="text"
            value={booking.purpose || ''}
            onChange={(e) => setBookingData({ purpose: e.target.value })}
            placeholder={t('tools.roomBooking.meetingPurposeOrEventDescription', 'Meeting purpose or event description')}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.status', 'Status')}
            </label>
            <select
              value={booking.status || 'pending'}
              onChange={(e) => setBookingData({ status: e.target.value as BookingStatus })}
              className={inputClass}
            >
              {BOOKING_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomBooking.estimatedAmount', 'Estimated Amount')}
            </label>
            <div className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <span className="text-[#0D9488] font-bold text-lg">${estimatedAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.roomBooking.notes', 'Notes')}
          </label>
          <textarea
            value={booking.notes || ''}
            onChange={(e) => setBookingData({ notes: e.target.value })}
            placeholder={t('tools.roomBooking.additionalNotesOrRequirements', 'Additional notes or requirements...')}
            rows={2}
            className={inputClass}
          />
        </div>
      </div>
    );
  };

  // Render Rooms Tab
  const renderRoomsTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.roomBooking.searchRooms', 'Search rooms...')}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
        <select
          value={filterRoomType}
          onChange={(e) => setFilterRoomType(e.target.value as RoomType | '')}
          className={`${inputClass} w-auto`}
        >
          <option value="">{t('tools.roomBooking.allTypes', 'All Types')}</option>
          {ROOM_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowRoomForm(true)}
          className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('tools.roomBooking.addRoom', 'Add Room')}
        </button>
      </div>

      {/* Add Room Form */}
      {showRoomForm && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.roomBooking.addNewRoom', 'Add New Room')}
            </h3>
            <button
              onClick={() => setShowRoomForm(false)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          {renderRoomForm(newRoom)}
          <button
            onClick={handleAddRoom}
            disabled={!newRoom.name}
            className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('tools.roomBooking.addRoom2', 'Add Room')}
          </button>
        </div>
      )}

      {/* Edit Room Form */}
      {editingRoom && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.roomBooking.editRoom', 'Edit Room')}
            </h3>
            <button
              onClick={() => setEditingRoom(null)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          {renderRoomForm(editingRoom, true)}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpdateRoom}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {t('tools.roomBooking.saveChanges', 'Save Changes')}
            </button>
            <button
              onClick={() => setEditingRoom(null)}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.roomBooking.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map(room => (
          <div key={room.id} className={`${cardClass} ${!room.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {room.name}
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                  {getRoomTypeBadge(room.type)}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingRoom(room)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {room.description || 'No description'}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Capacity: {room.capacity} people
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {room.floor}, {room.building}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className="text-[#0D9488] font-medium">
                  ${room.hourlyRate}/hr | ${room.dailyRate}/day
                </span>
              </div>
            </div>

            {room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {room.amenities.map(amenityId => {
                  const amenity = AMENITIES.find(a => a.id === amenityId);
                  return amenity ? (
                    <span
                      key={amenityId}
                      className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}
                      title={amenity.label}
                    >
                      <amenity.icon className="w-3 h-3 inline mr-1" />
                      {amenity.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            {!room.isActive && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {t('tools.roomBooking.inactive', 'Inactive')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className={`text-center py-12 ${cardClass}`}>
          <Building2 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {t('tools.roomBooking.noRoomsFoundAddYour', 'No rooms found. Add your first room to get started.')}
          </p>
        </div>
      )}
    </div>
  );

  // Render Bookings Tab
  const renderBookingsTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.roomBooking.searchBookings', 'Search bookings...')}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as BookingStatus | '')}
          className={`${inputClass} w-auto`}
        >
          <option value="">{t('tools.roomBooking.allStatuses', 'All Statuses')}</option>
          {BOOKING_STATUSES.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className={`${inputClass} w-auto`}
        />
        <button
          onClick={() => setShowBookingForm(true)}
          className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('tools.roomBooking.newBooking', 'New Booking')}
        </button>
      </div>

      {/* Add Booking Form */}
      {showBookingForm && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.roomBooking.newBooking2', 'New Booking')}
            </h3>
            <button
              onClick={() => setShowBookingForm(false)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          {renderBookingForm(newBooking)}
          <button
            onClick={handleAddBooking}
            disabled={!newBooking.roomId || !newBooking.guestName || !newBooking.date}
            className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('tools.roomBooking.createBooking', 'Create Booking')}
          </button>
        </div>
      )}

      {/* Edit Booking Form */}
      {editingBooking && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.roomBooking.editBooking', 'Edit Booking')}
            </h3>
            <button
              onClick={() => setEditingBooking(null)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          {renderBookingForm(editingBooking, true)}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpdateBooking}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {t('tools.roomBooking.saveChanges2', 'Save Changes')}
            </button>
            <button
              onClick={() => setEditingBooking(null)}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.roomBooking.cancel2', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.map(booking => {
          const room = rooms.find(r => r.id === booking.roomId);
          return (
            <div key={booking.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {booking.guestName}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                      {BOOKING_STATUSES.find(s => s.value === booking.status)?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {room?.name || 'Unknown Room'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(booking.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className="text-[#0D9488] font-medium">
                        ${booking.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {booking.purpose && (
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Purpose: {booking.purpose}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Quick Status Actions */}
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      className="p-2 rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                      title={t('tools.roomBooking.confirm', 'Confirm')}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'checked-in')}
                      className="p-2 rounded-lg text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20"
                      title={t('tools.roomBooking.checkIn', 'Check In')}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {booking.status === 'checked-in' && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'checked-out')}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={t('tools.roomBooking.checkOut', 'Check Out')}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingBooking(booking)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                  <button
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBookings.length === 0 && (
        <div className={`text-center py-12 ${cardClass}`}>
          <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {t('tools.roomBooking.noBookingsFoundCreateYour', 'No bookings found. Create your first booking to get started.')}
          </p>
        </div>
      )}
    </div>
  );

  // Render Calendar Tab
  const renderCalendarTab = () => {
    const daysInMonth = getDaysInMonth(calendarDate);
    const firstDay = getFirstDayOfMonth(calendarDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array.from({ length: firstDay }, (_, i) => i);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
          </h3>
          <button
            onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        <div className={cardClass}>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className={`text-center text-sm font-medium py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map(i => (
              <div key={`pad-${i}`} className="h-24" />
            ))}
            {days.map(day => {
              const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayBookings = getBookingsForDate(dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={day}
                  className={`h-24 p-1 rounded-lg border ${
                    isToday
                      ? 'border-[#0D9488] bg-[#0D9488]/10'
                      : isDark
                      ? 'border-gray-700 hover:bg-gray-700/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-[#0D9488]' : isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5 overflow-y-auto max-h-16">
                    {dayBookings.slice(0, 3).map(booking => {
                      const room = rooms.find(r => r.id === booking.roomId);
                      return (
                        <div
                          key={booking.id}
                          className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${getStatusColor(booking.status)}`}
                          title={`${booking.guestName} - ${room?.name} (${booking.startTime}-${booking.endTime})`}
                          onClick={() => {
                            setEditingBooking(booking);
                            setActiveTab('bookings');
                          }}
                        >
                          {booking.startTime} {room?.name}
                        </div>
                      );
                    })}
                    {dayBookings.length > 3 && (
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Reports Tab
  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0D9488]/10 rounded-xl">
              <Calendar className="w-6 h-6 text-[#0D9488]" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomBooking.totalBookings', 'Total Bookings')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {reports.totalBookings}
              </p>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomBooking.thisMonth', 'This Month')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {reports.monthlyBookings}
              </p>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomBooking.monthlyRevenue', 'Monthly Revenue')}</p>
              <p className="text-2xl font-bold text-green-500">
                ${reports.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Building2 className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomBooking.occupancyRate', 'Occupancy Rate')}</p>
              <p className="text-2xl font-bold text-purple-500">
                {reports.occupancyRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.roomBooking.bookingStatusDistribution', 'Booking Status Distribution')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {BOOKING_STATUSES.map(status => (
            <div key={status.value} className="text-center">
              <div className={`text-3xl font-bold mb-1 ${
                status.color === 'yellow' ? 'text-yellow-500' :
                status.color === 'blue' ? 'text-blue-500' :
                status.color === 'green' ? 'text-green-500' :
                status.color === 'red' ? 'text-red-500' :
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {reports.statusCounts[status.value] || 0}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {status.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Utilization */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.roomBooking.roomUtilizationThisMonth', 'Room Utilization (This Month)')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomBooking.room', 'Room')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomBooking.type', 'Type')}</th>
                <th className={`text-right py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomBooking.bookings', 'Bookings')}</th>
                <th className={`text-right py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomBooking.hours', 'Hours')}</th>
                <th className={`text-right py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomBooking.revenue', 'Revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {reports.roomUtilization.map(({ room, bookingCount, totalHours, revenue }) => (
                <tr key={room.id} className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-100'}>
                  <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {room.name}
                  </td>
                  <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getRoomTypeBadge(room.type)}
                  </td>
                  <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {bookingCount}
                  </td>
                  <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {totalHours.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-right text-[#0D9488] font-medium">
                    ${revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Validation Toast */}
        {validationMessage && (
          <div className={`px-4 py-3 rounded-xl border flex items-center gap-2 ${
            validationMessage.includes('Failed')
              ? isDark ? 'bg-red-900/30 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
              : isDark ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            {validationMessage.includes('Failed') ? (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{validationMessage}</span>
          </div>
        )}

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.roomBooking.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                <Building2 className="w-6 h-6 text-[#0D9488]" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.roomBooking.roomBookingSystem', 'Room Booking System')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.roomBooking.manageRoomsBookingsAndAvailability', 'Manage rooms, bookings, and availability')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="room-booking" toolName="Room Booking" />

              <SyncStatus
                isSynced={bookingsData.isSynced}
                isSaving={bookingsData.isSaving}
                lastSaved={bookingsData.lastSaved}
                syncError={bookingsData.syncError}
                onForceSync={() => bookingsData.forceSync()}
                theme={isDark ? 'dark' : 'light'}
                showLabel={true}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                onImportCSV={handleImportCSV}
                onImportJSON={handleImportJSON}
                theme={isDark ? 'dark' : 'light'}
              />
              <button
                onClick={handleReset}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                  isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {t('tools.roomBooking.reset', 'Reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('rooms')} className={tabClass('rooms')}>
            <Building2 className="w-4 h-4 inline mr-2" />
            Rooms ({rooms.length})
          </button>
          <button onClick={() => setActiveTab('bookings')} className={tabClass('bookings')}>
            <Calendar className="w-4 h-4 inline mr-2" />
            Bookings ({bookings.length})
          </button>
          <button onClick={() => setActiveTab('calendar')} className={tabClass('calendar')}>
            <Calendar className="w-4 h-4 inline mr-2" />
            {t('tools.roomBooking.calendar', 'Calendar')}
          </button>
          <button onClick={() => setActiveTab('reports')} className={tabClass('reports')}>
            <BarChart3 className="w-4 h-4 inline mr-2" />
            {t('tools.roomBooking.reports', 'Reports')}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'rooms' && renderRoomsTab()}
        {activeTab === 'bookings' && renderBookingsTab()}
        {activeTab === 'calendar' && renderCalendarTab()}
        {activeTab === 'reports' && renderReportsTab()}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default RoomBookingTool;
