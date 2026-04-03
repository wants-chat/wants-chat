'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Plus,
  Trash2,
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  PawPrint,
  X,
  Edit2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Bed,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface PetBoardingToolProps {
  uiConfig?: UIConfig;
}

// Types
type ReservationStatus = 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
type PetSize = 'small' | 'medium' | 'large' | 'extra-large';
type RoomType = 'standard' | 'deluxe' | 'suite' | 'outdoor-run';

interface Reservation {
  id: string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  petSize: PetSize;
  petAge: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  roomType: RoomType;
  roomNumber: string;
  specialNeeds: string;
  feedingInstructions: string;
  medications: string;
  vetInfo: string;
  status: ReservationStatus;
  dailyRate: number;
  totalCost: number;
  deposit: number;
  depositPaid: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Room {
  id: string;
  number: string;
  type: RoomType;
  size: PetSize[];
  dailyRate: number;
  isAvailable: boolean;
  features: string[];
}

// Constants
const ROOM_TYPES: { value: RoomType; label: string; baseRate: number }[] = [
  { value: 'standard', label: 'Standard Kennel', baseRate: 35 },
  { value: 'deluxe', label: 'Deluxe Kennel', baseRate: 50 },
  { value: 'suite', label: 'Private Suite', baseRate: 75 },
  { value: 'outdoor-run', label: 'Outdoor Run', baseRate: 45 },
];

const SIZE_OPTIONS: { value: PetSize; label: string; multiplier: number }[] = [
  { value: 'small', label: 'Small (under 20 lbs)', multiplier: 1 },
  { value: 'medium', label: 'Medium (20-50 lbs)', multiplier: 1.15 },
  { value: 'large', label: 'Large (50-90 lbs)', multiplier: 1.3 },
  { value: 'extra-large', label: 'Extra Large (90+ lbs)', multiplier: 1.5 },
];

const STATUS_OPTIONS: { value: ReservationStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'checked-in', label: 'Checked In', color: 'bg-green-100 text-green-800' },
  { value: 'checked-out', label: 'Checked Out', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const DEFAULT_ROOMS: Room[] = [
  { id: '1', number: 'K1', type: 'standard', size: ['small', 'medium'], dailyRate: 35, isAvailable: true, features: ['Climate controlled'] },
  { id: '2', number: 'K2', type: 'standard', size: ['small', 'medium'], dailyRate: 35, isAvailable: true, features: ['Climate controlled'] },
  { id: '3', number: 'K3', type: 'standard', size: ['medium', 'large'], dailyRate: 35, isAvailable: true, features: ['Climate controlled'] },
  { id: '4', number: 'D1', type: 'deluxe', size: ['small', 'medium', 'large'], dailyRate: 50, isAvailable: true, features: ['Climate controlled', 'Webcam'] },
  { id: '5', number: 'D2', type: 'deluxe', size: ['medium', 'large'], dailyRate: 50, isAvailable: true, features: ['Climate controlled', 'Webcam'] },
  { id: '6', number: 'S1', type: 'suite', size: ['small', 'medium', 'large', 'extra-large'], dailyRate: 75, isAvailable: true, features: ['Climate controlled', 'Webcam', 'Private play area', 'TV'] },
  { id: '7', number: 'S2', type: 'suite', size: ['medium', 'large', 'extra-large'], dailyRate: 75, isAvailable: true, features: ['Climate controlled', 'Webcam', 'Private play area', 'TV'] },
  { id: '8', number: 'R1', type: 'outdoor-run', size: ['medium', 'large', 'extra-large'], dailyRate: 45, isAvailable: true, features: ['Outdoor access', 'Large run area'] },
];

// Column configurations for exports
const RESERVATION_COLUMNS: ColumnConfig[] = [
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'petSpecies', header: 'Species', type: 'string' },
  { key: 'ownerName', header: 'Owner', type: 'string' },
  { key: 'ownerPhone', header: 'Phone', type: 'string' },
  { key: 'checkInDate', header: 'Check-In', type: 'date' },
  { key: 'checkOutDate', header: 'Check-Out', type: 'date' },
  { key: 'roomType', header: 'Room Type', type: 'string' },
  { key: 'roomNumber', header: 'Room #', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'totalCost', header: 'Total', type: 'currency' },
  { key: 'depositPaid', header: 'Deposit Paid', type: 'boolean' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const calculateNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const calculateCost = (roomType: RoomType, petSize: PetSize, nights: number): number => {
  const room = ROOM_TYPES.find(r => r.value === roomType);
  const size = SIZE_OPTIONS.find(s => s.value === petSize);
  if (!room || !size) return 0;
  return Math.round(room.baseRate * size.multiplier * nights * 100) / 100;
};

// Main Component
export const PetBoardingTool: React.FC<PetBoardingToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hook for backend sync
  const {
    data: reservations,
    addItem: addReservationToBackend,
    updateItem: updateReservationBackend,
    deleteItem: deleteReservationBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Reservation>('pet-boarding', [], RESERVATION_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'reservations' | 'calendar' | 'rooms'>('reservations');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Form state
  const [newReservation, setNewReservation] = useState<Partial<Reservation>>({
    petName: '',
    petSpecies: 'dog',
    petBreed: '',
    petSize: 'medium',
    petAge: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    emergencyContact: '',
    emergencyPhone: '',
    checkInDate: '',
    checkInTime: '14:00',
    checkOutDate: '',
    checkOutTime: '11:00',
    roomType: 'standard',
    roomNumber: '',
    specialNeeds: '',
    feedingInstructions: '',
    medications: '',
    vetInfo: '',
    status: 'pending',
    dailyRate: 35,
    totalCost: 0,
    deposit: 0,
    depositPaid: false,
    notes: '',
  });

  // Calculate pricing when form changes
  const updatePricing = (updates: Partial<Reservation>) => {
    const merged = { ...newReservation, ...updates };
    const nights = calculateNights(merged.checkInDate || '', merged.checkOutDate || '');
    const total = calculateCost(merged.roomType as RoomType, merged.petSize as PetSize, nights);
    const deposit = Math.round(total * 0.25 * 100) / 100;

    setNewReservation({
      ...merged,
      totalCost: total,
      deposit,
    });
  };

  // Add reservation
  const addReservation = () => {
    if (!newReservation.petName || !newReservation.ownerName || !newReservation.checkInDate || !newReservation.checkOutDate) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const reservation: Reservation = {
      id: editingReservation?.id || generateId(),
      petName: newReservation.petName || '',
      petSpecies: newReservation.petSpecies || 'dog',
      petBreed: newReservation.petBreed || '',
      petSize: (newReservation.petSize as PetSize) || 'medium',
      petAge: newReservation.petAge || '',
      ownerName: newReservation.ownerName || '',
      ownerPhone: newReservation.ownerPhone || '',
      ownerEmail: newReservation.ownerEmail || '',
      emergencyContact: newReservation.emergencyContact || '',
      emergencyPhone: newReservation.emergencyPhone || '',
      checkInDate: newReservation.checkInDate || '',
      checkInTime: newReservation.checkInTime || '14:00',
      checkOutDate: newReservation.checkOutDate || '',
      checkOutTime: newReservation.checkOutTime || '11:00',
      roomType: (newReservation.roomType as RoomType) || 'standard',
      roomNumber: newReservation.roomNumber || '',
      specialNeeds: newReservation.specialNeeds || '',
      feedingInstructions: newReservation.feedingInstructions || '',
      medications: newReservation.medications || '',
      vetInfo: newReservation.vetInfo || '',
      status: (newReservation.status as ReservationStatus) || 'pending',
      dailyRate: newReservation.dailyRate || 35,
      totalCost: newReservation.totalCost || 0,
      deposit: newReservation.deposit || 0,
      depositPaid: newReservation.depositPaid || false,
      notes: newReservation.notes || '',
      createdAt: editingReservation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingReservation) {
      updateReservationBackend(reservation.id, reservation);
    } else {
      addReservationToBackend(reservation);
    }

    resetForm();
  };

  const resetForm = () => {
    setNewReservation({
      petName: '',
      petSpecies: 'dog',
      petBreed: '',
      petSize: 'medium',
      petAge: '',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      emergencyContact: '',
      emergencyPhone: '',
      checkInDate: '',
      checkInTime: '14:00',
      checkOutDate: '',
      checkOutTime: '11:00',
      roomType: 'standard',
      roomNumber: '',
      specialNeeds: '',
      feedingInstructions: '',
      medications: '',
      vetInfo: '',
      status: 'pending',
      dailyRate: 35,
      totalCost: 0,
      deposit: 0,
      depositPaid: false,
      notes: '',
    });
    setEditingReservation(null);
    setShowForm(false);
  };

  // Edit reservation
  const editReservation = (reservation: Reservation) => {
    setNewReservation(reservation);
    setEditingReservation(reservation);
    setShowForm(true);
  };

  // Update status
  const updateStatus = (id: string, status: ReservationStatus) => {
    updateReservationBackend(id, { status, updatedAt: new Date().toISOString() });
  };

  // Delete reservation
  const deleteReservation = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this reservation?');
    if (confirmed) {
      deleteReservationBackend(id);
    }
  };

  // Check in/out
  const checkIn = (id: string) => {
    updateStatus(id, 'checked-in');
  };

  const checkOut = (id: string) => {
    updateStatus(id, 'checked-out');
  };

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const matchesSearch =
        searchTerm === '' ||
        res.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());
  }, [reservations, searchTerm, statusFilter]);

  // Today's activity
  const todaysActivity = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const checkIns = reservations.filter(r => r.checkInDate === today && r.status !== 'cancelled');
    const checkOuts = reservations.filter(r => r.checkOutDate === today && r.status === 'checked-in');
    const currentGuests = reservations.filter(r => r.status === 'checked-in');
    return { checkIns, checkOuts, currentGuests };
  }, [reservations]);

  // Room availability
  const roomAvailability = useMemo(() => {
    const occupied = new Set(
      reservations
        .filter(r => r.status === 'checked-in')
        .map(r => r.roomNumber)
    );
    return DEFAULT_ROOMS.map(room => ({
      ...room,
      isAvailable: !occupied.has(room.number),
    }));
  }, [reservations]);

  // Get status color
  const getStatusColor = (status: ReservationStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.petBoarding.petBoardingReservations', 'Pet Boarding Reservations')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.petBoarding.manageBoardingReservationsAndRoom', 'Manage boarding reservations and room assignments')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="pet-boarding" toolName="Pet Boarding" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(reservations, RESERVATION_COLUMNS, { filename: 'pet-boarding' })}
                onExportExcel={() => exportToExcel(reservations, RESERVATION_COLUMNS, { filename: 'pet-boarding' })}
                onExportJSON={() => exportToJSON(reservations, { filename: 'pet-boarding' })}
                onExportPDF={async () => {
                  await exportToPDF(reservations, RESERVATION_COLUMNS, {
                    filename: 'pet-boarding',
                    title: 'Pet Boarding Reservations',
                    subtitle: `${reservations.length} reservations`,
                  });
                }}
                onPrint={() => printData(reservations, RESERVATION_COLUMNS, { title: 'Pet Boarding Reservations' })}
                onCopyToClipboard={async () => await copyUtil(reservations, RESERVATION_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'reservations', label: 'Reservations', icon: <CalendarDays className="w-4 h-4" /> },
              { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
              { id: 'rooms', label: 'Rooms', icon: <Bed className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.petBoarding.searchReservations', 'Search reservations...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.petBoarding.allStatuses', 'All Statuses')}</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.petBoarding.newReservation', 'New Reservation')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <PawPrint className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {todaysActivity.currentGuests.length}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petBoarding.currentGuests', 'Current Guests')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {todaysActivity.checkIns.length}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petBoarding.checkInsToday', 'Check-ins Today')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {todaysActivity.checkOuts.length}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petBoarding.checkOutsToday', 'Check-outs Today')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bed className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {roomAvailability.filter(r => r.isAvailable).length}/{roomAvailability.length}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petBoarding.roomsAvailable', 'Rooms Available')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="space-y-3">
            {filteredReservations.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow`}>
                <CalendarDays className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petBoarding.noReservationsFound', 'No reservations found')}</p>
              </div>
            ) : (
              filteredReservations.map(res => (
                <div key={res.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === res.id ? null : res.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          res.status === 'checked-in' ? 'bg-green-100' :
                          res.status === 'confirmed' ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          <PawPrint className={`w-6 h-6 ${
                            res.status === 'checked-in' ? 'text-green-600' :
                            res.status === 'confirmed' ? 'text-blue-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {res.petName}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(res.status)}`}>
                              {res.status.replace('-', ' ')}
                            </span>
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {res.petBreed || res.petSpecies} | {SIZE_OPTIONS.find(s => s.value === res.petSize)?.label.split(' ')[0]}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            {formatDate(res.checkInDate)} - {formatDate(res.checkOutDate)} |
                            Room {res.roomNumber || 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${res.totalCost.toFixed(2)}
                          </p>
                          <p className={`text-xs ${res.depositPaid ? 'text-green-600' : 'text-red-600'}`}>
                            {res.depositPaid ? t('tools.petBoarding.depositPaid', 'Deposit Paid') : t('tools.petBoarding.depositDue', 'Deposit Due: $') + res.deposit.toFixed(2)}
                          </p>
                        </div>
                        {expandedId === res.id ? (
                          <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        ) : (
                          <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedId === res.id && (
                    <div className={`px-4 pb-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petBoarding.ownerInformation', 'Owner Information')}</h4>
                          <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <p><User className="w-4 h-4 inline mr-2" />{res.ownerName}</p>
                            <p><Phone className="w-4 h-4 inline mr-2" />{res.ownerPhone || 'N/A'}</p>
                            <p><Mail className="w-4 h-4 inline mr-2" />{res.ownerEmail || 'N/A'}</p>
                            {res.emergencyContact && (
                              <p className="mt-2">
                                <AlertCircle className="w-4 h-4 inline mr-2" />
                                Emergency: {res.emergencyContact} - {res.emergencyPhone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petBoarding.careInstructions', 'Care Instructions')}</h4>
                          <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {res.feedingInstructions && <p><strong>{t('tools.petBoarding.feeding', 'Feeding:')}</strong> {res.feedingInstructions}</p>}
                            {res.medications && <p><strong>{t('tools.petBoarding.medications', 'Medications:')}</strong> {res.medications}</p>}
                            {res.specialNeeds && <p><strong>{t('tools.petBoarding.specialNeeds', 'Special Needs:')}</strong> {res.specialNeeds}</p>}
                            {res.vetInfo && <p><strong>{t('tools.petBoarding.vetInfo', 'Vet Info:')}</strong> {res.vetInfo}</p>}
                            {res.notes && <p><strong>{t('tools.petBoarding.notes', 'Notes:')}</strong> {res.notes}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => checkIn(res.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" /> Check In
                          </button>
                        )}
                        {res.status === 'checked-in' && (
                          <button
                            onClick={() => checkOut(res.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            <CheckCircle className="w-4 h-4" /> Check Out
                          </button>
                        )}
                        <button
                          onClick={() => editReservation(res)}
                          className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
                            theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => deleteReservation(res.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomAvailability.map(room => {
              const currentGuest = reservations.find(r => r.roomNumber === room.number && r.status === 'checked-in');
              return (
                <div
                  key={room.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 border-l-4 ${
                    room.isAvailable ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Room {room.number}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {ROOM_TYPES.find(t => t.value === room.type)?.label}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {room.isAvailable ? t('tools.petBoarding.available', 'Available') : t('tools.petBoarding.occupied', 'Occupied')}
                    </span>
                  </div>
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${room.dailyRate}/night
                  </p>
                  <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    <p>Sizes: {room.size.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</p>
                    <p>Features: {room.features.join(', ')}</p>
                  </div>
                  {currentGuest && (
                    <div className={`mt-3 p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {currentGuest.petName}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Check-out: {formatDate(currentGuest.checkOutDate)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Calendar Tab - Simple view */}
        {activeTab === 'calendar' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.petBoarding.upcomingReservations', 'Upcoming Reservations')}
            </h3>
            <div className="space-y-2">
              {reservations
                .filter(r => new Date(r.checkInDate) >= new Date() && r.status !== 'cancelled' && r.status !== 'checked-out')
                .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())
                .slice(0, 10)
                .map(res => (
                  <div key={res.id} className={`flex items-center justify-between p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {res.petName}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatDate(res.checkInDate)} - {formatDate(res.checkOutDate)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(res.status)}`}>
                      {res.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Add/Edit Reservation Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {editingReservation ? t('tools.petBoarding.editReservation', 'Edit Reservation') : t('tools.petBoarding.newReservation2', 'New Reservation')}
                  </h2>
                  <button onClick={resetForm} className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Pet Info */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petBoarding.petInformation', 'Pet Information')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder={t('tools.petBoarding.petName', 'Pet Name *')}
                        value={newReservation.petName}
                        onChange={(e) => setNewReservation({ ...newReservation, petName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <select
                        value={newReservation.petSpecies}
                        onChange={(e) => setNewReservation({ ...newReservation, petSpecies: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="dog">{t('tools.petBoarding.dog', 'Dog')}</option>
                        <option value="cat">{t('tools.petBoarding.cat', 'Cat')}</option>
                        <option value="other">{t('tools.petBoarding.other', 'Other')}</option>
                      </select>
                      <input
                        type="text"
                        placeholder={t('tools.petBoarding.breed', 'Breed')}
                        value={newReservation.petBreed}
                        onChange={(e) => setNewReservation({ ...newReservation, petBreed: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <select
                        value={newReservation.petSize}
                        onChange={(e) => updatePricing({ petSize: e.target.value as PetSize })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        {SIZE_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petBoarding.ownerInformation2', 'Owner Information')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder={t('tools.petBoarding.ownerName', 'Owner Name *')}
                        value={newReservation.ownerName}
                        onChange={(e) => setNewReservation({ ...newReservation, ownerName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <input
                        type="tel"
                        placeholder={t('tools.petBoarding.phone', 'Phone')}
                        value={newReservation.ownerPhone}
                        onChange={(e) => setNewReservation({ ...newReservation, ownerPhone: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <input
                        type="email"
                        placeholder={t('tools.petBoarding.email', 'Email')}
                        value={newReservation.ownerEmail}
                        onChange={(e) => setNewReservation({ ...newReservation, ownerEmail: e.target.value })}
                        className={`col-span-2 w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.petBoarding.emergencyContact', 'Emergency Contact')}
                        value={newReservation.emergencyContact}
                        onChange={(e) => setNewReservation({ ...newReservation, emergencyContact: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <input
                        type="tel"
                        placeholder={t('tools.petBoarding.emergencyPhone', 'Emergency Phone')}
                        value={newReservation.emergencyPhone}
                        onChange={(e) => setNewReservation({ ...newReservation, emergencyPhone: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petBoarding.reservationDetails', 'Reservation Details')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petBoarding.checkInDate', 'Check-In Date *')}</label>
                        <input
                          type="date"
                          value={newReservation.checkInDate}
                          onChange={(e) => updatePricing({ checkInDate: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petBoarding.checkOutDate', 'Check-Out Date *')}</label>
                        <input
                          type="date"
                          value={newReservation.checkOutDate}
                          onChange={(e) => updatePricing({ checkOutDate: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <select
                        value={newReservation.roomType}
                        onChange={(e) => updatePricing({ roomType: e.target.value as RoomType })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        {ROOM_TYPES.map(r => (
                          <option key={r.value} value={r.value}>{r.label} (${r.baseRate}/night)</option>
                        ))}
                      </select>
                      <select
                        value={newReservation.roomNumber}
                        onChange={(e) => setNewReservation({ ...newReservation, roomNumber: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="">{t('tools.petBoarding.selectRoom', 'Select Room')}</option>
                        {roomAvailability
                          .filter(r => r.type === newReservation.roomType && r.isAvailable)
                          .map(r => (
                            <option key={r.id} value={r.number}>Room {r.number}</option>
                          ))}
                      </select>
                    </div>

                    {/* Pricing Summary */}
                    {newReservation.checkInDate && newReservation.checkOutDate && (
                      <div className={`mt-4 p-3 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {calculateNights(newReservation.checkInDate, newReservation.checkOutDate)} nights
                          </span>
                          <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${newReservation.totalCost?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {t('tools.petBoarding.deposit25', 'Deposit (25%)')}
                          </span>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            ${newReservation.deposit?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Care Instructions */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petBoarding.careInstructions2', 'Care Instructions')}</h3>
                    <div className="space-y-3">
                      <textarea
                        placeholder={t('tools.petBoarding.feedingInstructions', 'Feeding Instructions')}
                        value={newReservation.feedingInstructions}
                        onChange={(e) => setNewReservation({ ...newReservation, feedingInstructions: e.target.value })}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <textarea
                        placeholder={t('tools.petBoarding.medicationsIfAny', 'Medications (if any)')}
                        value={newReservation.medications}
                        onChange={(e) => setNewReservation({ ...newReservation, medications: e.target.value })}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <textarea
                        placeholder={t('tools.petBoarding.specialNeedsOrNotes', 'Special Needs or Notes')}
                        value={newReservation.specialNeeds}
                        onChange={(e) => setNewReservation({ ...newReservation, specialNeeds: e.target.value })}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={addReservation}
                    className="w-full py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors font-medium"
                  >
                    {editingReservation ? t('tools.petBoarding.updateReservation', 'Update Reservation') : t('tools.petBoarding.createReservation', 'Create Reservation')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {validationMessage && (
          <div className="fixed bottom-4 left-4 right-4 md:right-auto md:left-4 md:w-96 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-40">
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default PetBoardingTool;
