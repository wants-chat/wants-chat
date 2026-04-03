'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  X,
  RefreshCw,
  Clock,
  User,
  Users,
  Bed,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface ReservationToolProps {
  uiConfig?: UIConfig;
}

interface Reservation {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  partySize: number;
  reservationType: ReservationType;
  roomType?: string;
  tableNumber?: string;
  checkInDate: string;
  checkOutDate?: string;
  arrivalTime?: string;
  specialRequests: string;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  depositAmount: number;
  totalAmount: number;
  confirmationNumber: string;
  source: ReservationSource;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

type ReservationType = 'hotel' | 'restaurant' | 'event' | 'spa';
type ReservationStatus = 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';
type ReservationSource = 'direct' | 'phone' | 'website' | 'ota' | 'walk-in' | 'referral';

const RESERVATION_TYPES: { value: ReservationType; label: string }[] = [
  { value: 'hotel', label: 'Hotel Room' },
  { value: 'restaurant', label: 'Restaurant Table' },
  { value: 'event', label: 'Event Space' },
  { value: 'spa', label: 'Spa Service' },
];

const RESERVATION_STATUSES: { value: ReservationStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'checked-in', label: 'Checked In', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'no-show', label: 'No Show', color: 'orange' },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'partial', label: 'Partial', color: 'blue' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'refunded', label: 'Refunded', color: 'red' },
];

const RESERVATION_SOURCES: { value: ReservationSource; label: string }[] = [
  { value: 'direct', label: 'Direct' },
  { value: 'phone', label: 'Phone' },
  { value: 'website', label: 'Website' },
  { value: 'ota', label: 'OTA' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'referral', label: 'Referral' },
];

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Penthouse', 'Family Room'];

const reservationColumns: ColumnConfig[] = [
  { key: 'id', header: 'Reservation ID', type: 'string' },
  { key: 'confirmationNumber', header: 'Confirmation #', type: 'string' },
  { key: 'guestName', header: 'Guest Name', type: 'string' },
  { key: 'guestEmail', header: 'Email', type: 'string' },
  { key: 'guestPhone', header: 'Phone', type: 'string' },
  { key: 'reservationType', header: 'Type', type: 'string' },
  { key: 'partySize', header: 'Party Size', type: 'number' },
  { key: 'checkInDate', header: 'Check-In Date', type: 'date' },
  { key: 'checkOutDate', header: 'Check-Out Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'paymentStatus', header: 'Payment', type: 'string' },
  { key: 'totalAmount', header: 'Total', type: 'currency' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const generateSampleReservations = (): Reservation[] => {
  const today = new Date();
  return [
    {
      id: 'RES-001',
      guestName: 'James Williams',
      guestEmail: 'jwilliams@email.com',
      guestPhone: '(555) 123-4567',
      partySize: 2,
      reservationType: 'hotel',
      roomType: 'Deluxe',
      checkInDate: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
      checkOutDate: new Date(today.getTime() + 4 * 86400000).toISOString().split('T')[0],
      specialRequests: 'High floor, quiet room',
      status: 'confirmed',
      paymentStatus: 'partial',
      depositAmount: 200,
      totalAmount: 800,
      confirmationNumber: 'CNF-2024-001',
      source: 'website',
      notes: 'Returning guest - VIP treatment',
      createdAt: new Date(today.getTime() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'RES-002',
      guestName: 'Maria Garcia',
      guestEmail: 'mgarcia@email.com',
      guestPhone: '(555) 234-5678',
      partySize: 4,
      reservationType: 'restaurant',
      tableNumber: 'T-12',
      checkInDate: today.toISOString().split('T')[0],
      arrivalTime: '19:00',
      specialRequests: 'Anniversary dinner, need cake',
      status: 'confirmed',
      paymentStatus: 'pending',
      depositAmount: 0,
      totalAmount: 0,
      confirmationNumber: 'CNF-2024-002',
      source: 'phone',
      notes: 'Celebrating 10th anniversary',
      createdAt: new Date(today.getTime() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'RES-003',
      guestName: 'Robert Johnson',
      guestEmail: 'rjohnson@corp.com',
      guestPhone: '(555) 345-6789',
      partySize: 50,
      reservationType: 'event',
      checkInDate: new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0],
      arrivalTime: '10:00',
      specialRequests: 'Corporate meeting, AV equipment needed',
      status: 'pending',
      paymentStatus: 'pending',
      depositAmount: 0,
      totalAmount: 5000,
      confirmationNumber: 'CNF-2024-003',
      source: 'direct',
      notes: 'Full day booking with catering',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'RES-004',
      guestName: 'Lisa Chen',
      guestEmail: 'lchen@email.com',
      guestPhone: '(555) 456-7890',
      partySize: 1,
      reservationType: 'spa',
      checkInDate: new Date(today.getTime() + 2 * 86400000).toISOString().split('T')[0],
      arrivalTime: '14:00',
      specialRequests: 'Full body massage, aromatherapy',
      status: 'confirmed',
      paymentStatus: 'paid',
      depositAmount: 150,
      totalAmount: 150,
      confirmationNumber: 'CNF-2024-004',
      source: 'website',
      notes: '',
      createdAt: new Date(today.getTime() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

export const ReservationTool: React.FC<ReservationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const reservationData = useToolData<Reservation>(
    'reservations',
    generateSampleReservations(),
    reservationColumns,
    { autoSave: true }
  );

  const reservations = reservationData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ReservationType | ''>('');
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | ''>('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const [newReservation, setNewReservation] = useState<Partial<Reservation>>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    partySize: 1,
    reservationType: 'hotel',
    roomType: 'Standard',
    checkInDate: '',
    checkOutDate: '',
    arrivalTime: '',
    specialRequests: '',
    status: 'pending',
    paymentStatus: 'pending',
    depositAmount: 0,
    totalAmount: 0,
    source: 'direct',
    notes: '',
  });

  const generateConfirmationNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CNF-${year}-${random}`;
  };

  const handleAddReservation = () => {
    if (!newReservation.guestName || !newReservation.checkInDate) return;

    const reservation: Reservation = {
      id: `RES-${Date.now().toString().slice(-6)}`,
      guestName: newReservation.guestName || '',
      guestEmail: newReservation.guestEmail || '',
      guestPhone: newReservation.guestPhone || '',
      partySize: newReservation.partySize || 1,
      reservationType: newReservation.reservationType as ReservationType || 'hotel',
      roomType: newReservation.roomType,
      tableNumber: newReservation.tableNumber,
      checkInDate: newReservation.checkInDate || '',
      checkOutDate: newReservation.checkOutDate,
      arrivalTime: newReservation.arrivalTime,
      specialRequests: newReservation.specialRequests || '',
      status: 'pending',
      paymentStatus: 'pending',
      depositAmount: newReservation.depositAmount || 0,
      totalAmount: newReservation.totalAmount || 0,
      confirmationNumber: generateConfirmationNumber(),
      source: newReservation.source as ReservationSource || 'direct',
      notes: newReservation.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reservationData.addItem(reservation);
    resetNewReservation();
    setShowForm(false);
  };

  const handleUpdateReservation = () => {
    if (!editingReservation) return;
    reservationData.updateItem(editingReservation.id, {
      ...editingReservation,
      updatedAt: new Date().toISOString(),
    });
    setEditingReservation(null);
  };

  const handleDeleteReservation = (id: string) => {
    reservationData.deleteItem(id);
    if (selectedReservation?.id === id) setSelectedReservation(null);
  };

  const resetNewReservation = () => {
    setNewReservation({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      partySize: 1,
      reservationType: 'hotel',
      roomType: 'Standard',
      checkInDate: '',
      checkOutDate: '',
      arrivalTime: '',
      specialRequests: '',
      status: 'pending',
      paymentStatus: 'pending',
      depositAmount: 0,
      totalAmount: 0,
      source: 'direct',
      notes: '',
    });
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const matchesSearch = !searchQuery ||
        res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.confirmationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filterType || res.reservationType === filterType;
      const matchesStatus = !filterStatus || res.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reservations, searchQuery, filterType, filterStatus]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: reservations.length,
      todayArrivals: reservations.filter(r => r.checkInDate === today).length,
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
    };
  }, [reservations]);

  const getStatusColor = (status: ReservationStatus) => {
    const statusObj = RESERVATION_STATUSES.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      blue: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
      green: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      gray: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
      red: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
      orange: isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800',
    };
    return colors[statusObj?.color || 'gray'];
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    const statusObj = PAYMENT_STATUSES.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      blue: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
      green: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      red: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
    };
    return colors[statusObj?.color || 'gray'];
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-7 h-7 text-blue-500" />
              {t('tools.reservation.reservationManagement', 'Reservation Management')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.reservation.manageHotelRestaurantEventAnd', 'Manage hotel, restaurant, event, and spa reservations')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="reservation" toolName="Reservation" />

            <SyncStatus
              isSynced={reservationData.isSynced}
              isSaving={reservationData.isSaving}
              lastSaved={reservationData.lastSaved}
              syncError={reservationData.syncError}
              onForceSync={reservationData.forceSync}
            />
            <ExportDropdown
              onExportCSV={() => reservationData.exportCSV()}
              onExportExcel={() => reservationData.exportExcel()}
              onExportJSON={() => reservationData.exportJSON()}
              onExportPDF={() => reservationData.exportPDF()}
              onCopy={() => reservationData.copyToClipboard()}
              onPrint={() => reservationData.print('Reservations')}
            />
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.reservation.newReservation', 'New Reservation')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.reservation.totalReservations', 'Total Reservations')}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.reservation.todaySArrivals', 'Today\'s Arrivals')}</p>
            <p className="text-2xl font-bold text-blue-500">{stats.todayArrivals}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.reservation.pending', 'Pending')}</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.reservation.confirmed', 'Confirmed')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.confirmed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.reservation.searchByGuestNameConfirmation', 'Search by guest name, confirmation #, or email...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ReservationType | '')}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">{t('tools.reservation.allTypes', 'All Types')}</option>
              {RESERVATION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ReservationStatus | '')}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">{t('tools.reservation.allStatuses', 'All Statuses')}</option>
              {RESERVATION_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reservations List */}
        <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('tools.reservation.guest', 'Guest')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('tools.reservation.type', 'Type')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('tools.reservation.date', 'Date')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('tools.reservation.party', 'Party')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('tools.reservation.status', 'Status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('tools.reservation.payment', 'Payment')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('tools.reservation.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer`}
                    onClick={() => setSelectedReservation(reservation)}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium">{reservation.guestName}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {reservation.confirmationNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="capitalize">{reservation.reservationType}</span>
                      {reservation.roomType && (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {reservation.roomType}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p>{new Date(reservation.checkInDate).toLocaleDateString()}</p>
                      {reservation.arrivalTime && (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {reservation.arrivalTime}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {reservation.partySize}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                        {RESERVATION_STATUSES.find(s => s.value === reservation.status)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                        {PAYMENT_STATUSES.find(s => s.value === reservation.paymentStatus)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEditingReservation(reservation)}
                          className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReservation(reservation.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredReservations.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.reservation.noReservationsFound', 'No reservations found')}</p>
            </div>
          )}
        </div>

        {/* New/Edit Reservation Modal */}
        {(showForm || editingReservation) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingReservation ? t('tools.reservation.editReservation', 'Edit Reservation') : t('tools.reservation.newReservation2', 'New Reservation')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingReservation(null);
                    resetNewReservation();
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('tools.reservation.guestName', 'Guest Name *')}</label>
                  <input
                    type="text"
                    value={editingReservation?.guestName || newReservation.guestName}
                    onChange={(e) => editingReservation
                      ? setEditingReservation({...editingReservation, guestName: e.target.value})
                      : setNewReservation({...newReservation, guestName: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.reservation.email', 'Email')}</label>
                  <input
                    type="email"
                    value={editingReservation?.guestEmail || newReservation.guestEmail}
                    onChange={(e) => editingReservation
                      ? setEditingReservation({...editingReservation, guestEmail: e.target.value})
                      : setNewReservation({...newReservation, guestEmail: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.reservation.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={editingReservation?.guestPhone || newReservation.guestPhone}
                    onChange={(e) => editingReservation
                      ? setEditingReservation({...editingReservation, guestPhone: e.target.value})
                      : setNewReservation({...newReservation, guestPhone: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.reservation.reservationType', 'Reservation Type')}</label>
                  <select
                    value={editingReservation?.reservationType || newReservation.reservationType}
                    onChange={(e) => editingReservation
                      ? setEditingReservation({...editingReservation, reservationType: e.target.value as ReservationType})
                      : setNewReservation({...newReservation, reservationType: e.target.value as ReservationType})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {RESERVATION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.reservation.partySize', 'Party Size')}</label>
                  <input
                    type="number"
                    min="1"
                    value={editingReservation?.partySize || newReservation.partySize}
                    onChange={(e) => editingReservation
                      ? setEditingReservation({...editingReservation, partySize: parseInt(e.target.value)})
                      : setNewReservation({...newReservation, partySize: parseInt(e.target.value)})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.reservation.checkInDate', 'Check-In Date *')}</label>
                  <input
                    type="date"
                    value={editingReservation?.checkInDate || newReservation.checkInDate}
                    onChange={(e) => editingReservation
                      ? setEditingReservation({...editingReservation, checkInDate: e.target.value})
                      : setNewReservation({...newReservation, checkInDate: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.reservation.checkOutDate', 'Check-Out Date')}</label>
                  <input
                    type="date"
                    value={editingReservation?.checkOutDate || newReservation.checkOutDate}
                    onChange={(e) => editingReservation
                      ? setEditingReservation({...editingReservation, checkOutDate: e.target.value})
                      : setNewReservation({...newReservation, checkOutDate: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.reservation.source', 'Source')}</label>
                  <select
                    value={editingReservation?.source || newReservation.source}
                    onChange={(e) => editingReservation
                      ? setEditingReservation({...editingReservation, source: e.target.value as ReservationSource})
                      : setNewReservation({...newReservation, source: e.target.value as ReservationSource})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {RESERVATION_SOURCES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.reservation.totalAmount', 'Total Amount')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingReservation?.totalAmount || newReservation.totalAmount}
                    onChange={(e) => editingReservation
                      ? setEditingReservation({...editingReservation, totalAmount: parseFloat(e.target.value)})
                      : setNewReservation({...newReservation, totalAmount: parseFloat(e.target.value)})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {editingReservation && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.reservation.status2', 'Status')}</label>
                      <select
                        value={editingReservation.status}
                        onChange={(e) => setEditingReservation({...editingReservation, status: e.target.value as ReservationStatus})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {RESERVATION_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('tools.reservation.paymentStatus', 'Payment Status')}</label>
                      <select
                        value={editingReservation.paymentStatus}
                        onChange={(e) => setEditingReservation({...editingReservation, paymentStatus: e.target.value as PaymentStatus})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {PAYMENT_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('tools.reservation.specialRequests', 'Special Requests')}</label>
                  <textarea
                    rows={3}
                    value={editingReservation?.specialRequests || newReservation.specialRequests}
                    onChange={(e) => editingReservation
                      ? setEditingReservation({...editingReservation, specialRequests: e.target.value})
                      : setNewReservation({...newReservation, specialRequests: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('tools.reservation.notes', 'Notes')}</label>
                  <textarea
                    rows={2}
                    value={editingReservation?.notes || newReservation.notes}
                    onChange={(e) => editingReservation
                      ? setEditingReservation({...editingReservation, notes: e.target.value})
                      : setNewReservation({...newReservation, notes: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingReservation(null);
                    resetNewReservation();
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.reservation.cancel', 'Cancel')}
                </button>
                <button
                  onClick={editingReservation ? handleUpdateReservation : handleAddReservation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingReservation ? t('tools.reservation.update', 'Update') : t('tools.reservation.create', 'Create')} Reservation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationTool;
