'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bed,
  Plus,
  Trash2,
  Edit2,
  Save,
  Calendar,
  Clock,
  Users,
  Search,
  X,
  DollarSign,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface RoomReservationToolProps {
  uiConfig?: UIConfig;
}

interface Reservation {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  roomNumber: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  totalAmount: number;
  depositPaid: number;
  specialRequests: string;
  createdAt: string;
}

type RoomType = 'standard' | 'deluxe' | 'suite' | 'penthouse' | 'family';
type ReservationStatus = 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show';

const ROOM_TYPES: { value: RoomType; label: string; rate: number }[] = [
  { value: 'standard', label: 'Standard Room', rate: 99 },
  { value: 'deluxe', label: 'Deluxe Room', rate: 149 },
  { value: 'suite', label: 'Suite', rate: 249 },
  { value: 'penthouse', label: 'Penthouse', rate: 499 },
  { value: 'family', label: 'Family Room', rate: 179 },
];

const RESERVATION_STATUSES: { value: ReservationStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'checked-in', label: 'Checked In', color: 'green' },
  { value: 'checked-out', label: 'Checked Out', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'no-show', label: 'No Show', color: 'orange' },
];

const reservationColumns: ColumnConfig[] = [
  { key: 'id', header: 'Reservation ID', type: 'string' },
  { key: 'guestName', header: 'Guest Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'roomNumber', header: 'Room', type: 'string' },
  { key: 'roomType', header: 'Room Type', type: 'string' },
  { key: 'checkInDate', header: 'Check-In', type: 'date' },
  { key: 'checkOutDate', header: 'Check-Out', type: 'date' },
  { key: 'adults', header: 'Adults', type: 'number' },
  { key: 'children', header: 'Children', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'totalAmount', header: 'Total', type: 'currency' },
  { key: 'depositPaid', header: 'Deposit', type: 'currency' },
];

const generateSampleReservations = (): Reservation[] => {
  const today = new Date();
  return [
    {
      id: 'RES-001',
      guestName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 555-0101',
      roomNumber: '201',
      roomType: 'deluxe',
      checkInDate: today.toISOString().split('T')[0],
      checkOutDate: new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0],
      adults: 2,
      children: 0,
      status: 'confirmed',
      totalAmount: 447,
      depositPaid: 149,
      specialRequests: 'Late check-in around 10 PM',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'RES-002',
      guestName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 555-0102',
      roomNumber: '305',
      roomType: 'suite',
      checkInDate: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
      checkOutDate: new Date(today.getTime() + 4 * 86400000).toISOString().split('T')[0],
      adults: 2,
      children: 1,
      status: 'pending',
      totalAmount: 747,
      depositPaid: 249,
      specialRequests: 'Crib needed for infant',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'RES-003',
      guestName: 'Michael Brown',
      email: 'mbrown@email.com',
      phone: '+1 555-0103',
      roomNumber: '102',
      roomType: 'standard',
      checkInDate: new Date(today.getTime() - 86400000).toISOString().split('T')[0],
      checkOutDate: today.toISOString().split('T')[0],
      adults: 1,
      children: 0,
      status: 'checked-in',
      totalAmount: 99,
      depositPaid: 99,
      specialRequests: '',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const RoomReservationTool: React.FC<RoomReservationToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const reservationsData = useToolData<Reservation>(
    'room-reservations',
    generateSampleReservations(),
    reservationColumns,
    { autoSave: true }
  );

  const reservations = reservationsData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | ''>('');
  const [filterDate, setFilterDate] = useState('');

  const [newReservation, setNewReservation] = useState<Partial<Reservation>>({
    guestName: '',
    email: '',
    phone: '',
    roomNumber: '',
    roomType: 'standard',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    adults: 1,
    children: 0,
    status: 'pending',
    depositPaid: 0,
    specialRequests: '',
  });

  const calculateTotal = (checkIn: string, checkOut: string, roomType: RoomType): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const rate = ROOM_TYPES.find(r => r.value === roomType)?.rate || 99;
    return nights * rate;
  };

  const handleAddReservation = () => {
    if (!newReservation.guestName || !newReservation.roomNumber) return;

    const total = calculateTotal(
      newReservation.checkInDate!,
      newReservation.checkOutDate!,
      newReservation.roomType as RoomType
    );

    const reservation: Reservation = {
      id: `RES-${Date.now().toString().slice(-6)}`,
      guestName: newReservation.guestName || '',
      email: newReservation.email || '',
      phone: newReservation.phone || '',
      roomNumber: newReservation.roomNumber || '',
      roomType: newReservation.roomType as RoomType || 'standard',
      checkInDate: newReservation.checkInDate || new Date().toISOString().split('T')[0],
      checkOutDate: newReservation.checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      adults: newReservation.adults || 1,
      children: newReservation.children || 0,
      status: newReservation.status as ReservationStatus || 'pending',
      totalAmount: total,
      depositPaid: newReservation.depositPaid || 0,
      specialRequests: newReservation.specialRequests || '',
      createdAt: new Date().toISOString(),
    };

    reservationsData.addItem(reservation);
    setNewReservation({
      guestName: '',
      email: '',
      phone: '',
      roomNumber: '',
      roomType: 'standard',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      adults: 1,
      children: 0,
      status: 'pending',
      depositPaid: 0,
      specialRequests: '',
    });
    setShowForm(false);
  };

  const handleUpdateReservation = () => {
    if (!editingReservation) return;

    const total = calculateTotal(
      editingReservation.checkInDate,
      editingReservation.checkOutDate,
      editingReservation.roomType
    );

    reservationsData.updateItem(editingReservation.id, {
      ...editingReservation,
      totalAmount: total,
    });
    setEditingReservation(null);
  };

  const handleDeleteReservation = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Reservation',
      message: 'Are you sure you want to delete this reservation?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      reservationsData.deleteItem(id);
    }
  };

  const handleStatusChange = (id: string, status: ReservationStatus) => {
    reservationsData.updateItem(id, { status });
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset Reservations',
      message: 'Reset all reservations to sample data?',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      reservationsData.resetToDefault(generateSampleReservations());
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!res.guestName.toLowerCase().includes(q) &&
            !res.roomNumber.toLowerCase().includes(q) &&
            !res.email.toLowerCase().includes(q)) return false;
      }
      if (filterStatus && res.status !== filterStatus) return false;
      if (filterDate && res.checkInDate !== filterDate) return false;
      return true;
    });
  }, [reservations, searchQuery, filterStatus, filterDate]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: reservations.length,
      checkingInToday: reservations.filter(r => r.checkInDate === today && r.status === 'confirmed').length,
      checkingOutToday: reservations.filter(r => r.checkOutDate === today && r.status === 'checked-in').length,
      pending: reservations.filter(r => r.status === 'pending').length,
    };
  }, [reservations]);

  const inputClass = `w-full px-4 py-2.5 border ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;

  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const getStatusColor = (status: ReservationStatus) => {
    const colors: Record<string, string> = {
      pending: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      confirmed: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      'checked-in': isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      'checked-out': isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600',
      cancelled: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
      'no-show': isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
    };
    return colors[status] || colors.pending;
  };

  const renderForm = (reservation: Partial<Reservation>, isEditing = false) => {
    const setData = isEditing
      ? (updates: Partial<Reservation>) => setEditingReservation({ ...editingReservation!, ...updates })
      : (updates: Partial<Reservation>) => setNewReservation({ ...newReservation, ...updates });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomReservation.guestName', 'Guest Name *')}
            </label>
            <input
              type="text"
              value={reservation.guestName || ''}
              onChange={(e) => setData({ guestName: e.target.value })}
              placeholder={t('tools.roomReservation.fullName', 'Full name')}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomReservation.roomNumber', 'Room Number *')}
            </label>
            <input
              type="text"
              value={reservation.roomNumber || ''}
              onChange={(e) => setData({ roomNumber: e.target.value })}
              placeholder="e.g., 201"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomReservation.email', 'Email')}
            </label>
            <input
              type="email"
              value={reservation.email || ''}
              onChange={(e) => setData({ email: e.target.value })}
              placeholder={t('tools.roomReservation.emailExampleCom', 'email@example.com')}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomReservation.phone', 'Phone')}
            </label>
            <input
              type="tel"
              value={reservation.phone || ''}
              onChange={(e) => setData({ phone: e.target.value })}
              placeholder="+1 555-0100"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomReservation.roomType', 'Room Type')}
            </label>
            <select
              value={reservation.roomType || 'standard'}
              onChange={(e) => setData({ roomType: e.target.value as RoomType })}
              className={inputClass}
            >
              {ROOM_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} (${type.rate}/night)
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomReservation.checkInDate', 'Check-In Date')}
            </label>
            <input
              type="date"
              value={reservation.checkInDate || ''}
              onChange={(e) => setData({ checkInDate: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomReservation.checkOutDate', 'Check-Out Date')}
            </label>
            <input
              type="date"
              value={reservation.checkOutDate || ''}
              onChange={(e) => setData({ checkOutDate: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomReservation.adults', 'Adults')}
            </label>
            <input
              type="number"
              value={reservation.adults || 1}
              onChange={(e) => setData({ adults: parseInt(e.target.value) || 1 })}
              min="1"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomReservation.children', 'Children')}
            </label>
            <input
              type="number"
              value={reservation.children || 0}
              onChange={(e) => setData({ children: parseInt(e.target.value) || 0 })}
              min="0"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomReservation.depositPaid', 'Deposit Paid ($)')}
            </label>
            <input
              type="number"
              value={reservation.depositPaid || 0}
              onChange={(e) => setData({ depositPaid: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.roomReservation.status', 'Status')}
            </label>
            <select
              value={reservation.status || 'pending'}
              onChange={(e) => setData({ status: e.target.value as ReservationStatus })}
              className={inputClass}
            >
              {RESERVATION_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.roomReservation.specialRequests', 'Special Requests')}
          </label>
          <textarea
            value={reservation.specialRequests || ''}
            onChange={(e) => setData({ specialRequests: e.target.value })}
            placeholder={t('tools.roomReservation.anySpecialRequestsOrNotes', 'Any special requests or notes...')}
            rows={2}
            className={inputClass}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                <Bed className="w-6 h-6 text-[#0D9488]" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.roomReservation.roomReservation', 'Room Reservation')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.roomReservation.manageHotelRoomReservations', 'Manage hotel room reservations')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="room-reservation" toolName="Room Reservation" />

              <SyncStatus
                isSynced={reservationsData.isSynced}
                isSaving={reservationsData.isSaving}
                lastSaved={reservationsData.lastSaved}
                syncError={reservationsData.syncError}
                onForceSync={() => reservationsData.forceSync()}
                theme={isDark ? 'dark' : 'light'}
                showLabel={true}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => reservationsData.exportCSV({ filename: 'room-reservations' })}
                onExportExcel={() => reservationsData.exportExcel({ filename: 'room-reservations' })}
                onExportJSON={() => reservationsData.exportJSON({ filename: 'room-reservations' })}
                onExportPDF={() => reservationsData.exportPDF({ filename: 'room-reservations', title: 'Room Reservations' })}
                onPrint={() => reservationsData.print('Room Reservations')}
                onCopyToClipboard={() => reservationsData.copyToClipboard('tab')}
                theme={isDark ? 'dark' : 'light'}
              />
              <button
                onClick={handleReset}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-red-500 ${
                  isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {t('tools.roomReservation.reset', 'Reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cardClass}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomReservation.totalReservations', 'Total Reservations')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={cardClass}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomReservation.checkInsToday', 'Check-Ins Today')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.checkingInToday}</p>
          </div>
          <div className={cardClass}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomReservation.checkOutsToday', 'Check-Outs Today')}</p>
            <p className="text-2xl font-bold text-blue-500">{stats.checkingOutToday}</p>
          </div>
          <div className={cardClass}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomReservation.pending', 'Pending')}</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tools.roomReservation.searchReservations', 'Search reservations...')}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ReservationStatus | '')}
            className={`${inputClass} w-auto`}
          >
            <option value="">{t('tools.roomReservation.allStatuses', 'All Statuses')}</option>
            {RESERVATION_STATUSES.map(status => (
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
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('tools.roomReservation.newReservation', 'New Reservation')}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.roomReservation.newReservation2', 'New Reservation')}
              </h3>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            {renderForm(newReservation)}
            <button
              onClick={handleAddReservation}
              disabled={!newReservation.guestName || !newReservation.roomNumber}
              className="mt-4 w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('tools.roomReservation.createReservation', 'Create Reservation')}
            </button>
          </div>
        )}

        {/* Edit Form */}
        {editingReservation && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.roomReservation.editReservation', 'Edit Reservation')}
              </h3>
              <button onClick={() => setEditingReservation(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            {renderForm(editingReservation, true)}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUpdateReservation}
                className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {t('tools.roomReservation.saveChanges', 'Save Changes')}
              </button>
              <button
                onClick={() => setEditingReservation(null)}
                className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.roomReservation.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Reservations List */}
        <div className="space-y-3">
          {filteredReservations.map(res => (
            <div key={res.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{res.guestName}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(res.status)}`}>
                      {RESERVATION_STATUSES.find(s => s.value === res.status)?.label}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{res.id}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Bed className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        Room {res.roomNumber} - {ROOM_TYPES.find(t => t.value === res.roomType)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(res.checkInDate).toLocaleDateString()} - {new Date(res.checkOutDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {res.adults} Adults, {res.children} Children
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className="text-[#0D9488] font-medium">${res.totalAmount}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        (${res.depositPaid} paid)
                      </span>
                    </div>
                  </div>
                  {res.specialRequests && (
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Note: {res.specialRequests}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {res.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'confirmed')}
                      className="p-2 rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                      title={t('tools.roomReservation.confirm', 'Confirm')}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'checked-in')}
                      className="p-2 rounded-lg text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20"
                      title={t('tools.roomReservation.checkIn', 'Check In')}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingReservation(res)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                  <button
                    onClick={() => handleDeleteReservation(res.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReservations.length === 0 && (
          <div className={`text-center py-12 ${cardClass}`}>
            <Bed className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {t('tools.roomReservation.noReservationsFoundCreateYour', 'No reservations found. Create your first reservation to get started.')}
            </p>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default RoomReservationTool;
