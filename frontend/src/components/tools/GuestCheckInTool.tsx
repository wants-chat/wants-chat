'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserPlus,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  X,
  RefreshCw,
  Clock,
  Bed,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface GuestCheckInToolProps {
  uiConfig?: UIConfig;
}

interface CheckIn {
  id: string;
  reservationId: string;
  guestName: string;
  email: string;
  phone: string;
  roomNumber: string;
  checkInTime: string;
  checkInDate: string;
  expectedCheckOut: string;
  idType: string;
  idNumber: string;
  paymentMethod: string;
  depositAmount: number;
  keyCardNumber: string;
  vehiclePlate: string;
  specialInstructions: string;
  status: CheckInStatus;
  processedBy: string;
  createdAt: string;
}

type CheckInStatus = 'pending' | 'in-progress' | 'completed' | 'issue';

const CHECK_IN_STATUSES: { value: CheckInStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'issue', label: 'Issue', color: 'red' },
];

const ID_TYPES = ['Passport', 'Driver License', 'National ID', 'State ID', 'Military ID'];
const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Cash', 'Corporate Account', 'Pre-paid'];

const checkInColumns: ColumnConfig[] = [
  { key: 'id', header: 'Check-In ID', type: 'string' },
  { key: 'reservationId', header: 'Reservation', type: 'string' },
  { key: 'guestName', header: 'Guest Name', type: 'string' },
  { key: 'roomNumber', header: 'Room', type: 'string' },
  { key: 'checkInDate', header: 'Date', type: 'date' },
  { key: 'checkInTime', header: 'Time', type: 'string' },
  { key: 'expectedCheckOut', header: 'Check-Out', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'keyCardNumber', header: 'Key Card', type: 'string' },
  { key: 'processedBy', header: 'Processed By', type: 'string' },
];

const generateSampleCheckIns = (): CheckIn[] => {
  const today = new Date();
  return [
    {
      id: 'CHK-001',
      reservationId: 'RES-001',
      guestName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 555-0101',
      roomNumber: '201',
      checkInTime: '14:30',
      checkInDate: today.toISOString().split('T')[0],
      expectedCheckOut: new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0],
      idType: 'Passport',
      idNumber: 'P1234567',
      paymentMethod: 'Credit Card',
      depositAmount: 200,
      keyCardNumber: 'KC-2010',
      vehiclePlate: 'ABC-1234',
      specialInstructions: 'VIP guest - room upgrade provided',
      status: 'completed',
      processedBy: 'Front Desk - Maria',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'CHK-002',
      reservationId: 'RES-002',
      guestName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 555-0102',
      roomNumber: '305',
      checkInTime: '15:00',
      checkInDate: today.toISOString().split('T')[0],
      expectedCheckOut: new Date(today.getTime() + 4 * 86400000).toISOString().split('T')[0],
      idType: 'Driver License',
      idNumber: 'DL789456',
      paymentMethod: 'Corporate Account',
      depositAmount: 0,
      keyCardNumber: 'KC-3050',
      vehiclePlate: '',
      specialInstructions: '',
      status: 'in-progress',
      processedBy: 'Front Desk - James',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const GuestCheckInTool: React.FC<GuestCheckInToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const checkInsData = useToolData<CheckIn>(
    'guest-check-ins',
    generateSampleCheckIns(),
    checkInColumns,
    { autoSave: true }
  );

  const checkIns = checkInsData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<CheckInStatus | ''>('');

  const [newCheckIn, setNewCheckIn] = useState<Partial<CheckIn>>({
    reservationId: '',
    guestName: '',
    email: '',
    phone: '',
    roomNumber: '',
    checkInTime: new Date().toTimeString().slice(0, 5),
    checkInDate: new Date().toISOString().split('T')[0],
    expectedCheckOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    idType: 'Passport',
    idNumber: '',
    paymentMethod: 'Credit Card',
    depositAmount: 0,
    keyCardNumber: '',
    vehiclePlate: '',
    specialInstructions: '',
    status: 'pending',
    processedBy: '',
  });

  const handleAddCheckIn = () => {
    if (!newCheckIn.guestName || !newCheckIn.roomNumber) return;

    const checkIn: CheckIn = {
      id: `CHK-${Date.now().toString().slice(-6)}`,
      reservationId: newCheckIn.reservationId || '',
      guestName: newCheckIn.guestName || '',
      email: newCheckIn.email || '',
      phone: newCheckIn.phone || '',
      roomNumber: newCheckIn.roomNumber || '',
      checkInTime: newCheckIn.checkInTime || new Date().toTimeString().slice(0, 5),
      checkInDate: newCheckIn.checkInDate || new Date().toISOString().split('T')[0],
      expectedCheckOut: newCheckIn.expectedCheckOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      idType: newCheckIn.idType || 'Passport',
      idNumber: newCheckIn.idNumber || '',
      paymentMethod: newCheckIn.paymentMethod || 'Credit Card',
      depositAmount: newCheckIn.depositAmount || 0,
      keyCardNumber: newCheckIn.keyCardNumber || `KC-${newCheckIn.roomNumber}0`,
      vehiclePlate: newCheckIn.vehiclePlate || '',
      specialInstructions: newCheckIn.specialInstructions || '',
      status: newCheckIn.status as CheckInStatus || 'pending',
      processedBy: newCheckIn.processedBy || '',
      createdAt: new Date().toISOString(),
    };

    checkInsData.addItem(checkIn);
    setNewCheckIn({
      reservationId: '',
      guestName: '',
      email: '',
      phone: '',
      roomNumber: '',
      checkInTime: new Date().toTimeString().slice(0, 5),
      checkInDate: new Date().toISOString().split('T')[0],
      expectedCheckOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      idType: 'Passport',
      idNumber: '',
      paymentMethod: 'Credit Card',
      depositAmount: 0,
      keyCardNumber: '',
      vehiclePlate: '',
      specialInstructions: '',
      status: 'pending',
      processedBy: '',
    });
    setShowForm(false);
  };

  const handleUpdateCheckIn = () => {
    if (!editingCheckIn) return;
    checkInsData.updateItem(editingCheckIn.id, editingCheckIn);
    setEditingCheckIn(null);
  };

  const handleDeleteCheckIn = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Check-In',
      message: 'Are you sure you want to delete this check-in record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      checkInsData.deleteItem(id);
    }
  };

  const handleStatusChange = (id: string, status: CheckInStatus) => {
    checkInsData.updateItem(id, { status });
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset Data',
      message: 'Reset all check-in records to sample data? This will replace all existing records.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      checkInsData.resetToDefault(generateSampleCheckIns());
    }
  };

  const filteredCheckIns = useMemo(() => {
    return checkIns.filter(c => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!c.guestName.toLowerCase().includes(q) &&
            !c.roomNumber.toLowerCase().includes(q) &&
            !c.reservationId.toLowerCase().includes(q)) return false;
      }
      if (filterStatus && c.status !== filterStatus) return false;
      return true;
    });
  }, [checkIns, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      todayCheckIns: checkIns.filter(c => c.checkInDate === today).length,
      completed: checkIns.filter(c => c.status === 'completed').length,
      inProgress: checkIns.filter(c => c.status === 'in-progress').length,
      issues: checkIns.filter(c => c.status === 'issue').length,
    };
  }, [checkIns]);

  const inputClass = `w-full px-4 py-2.5 border ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;

  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const getStatusColor = (status: CheckInStatus) => {
    const colors: Record<string, string> = {
      pending: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      'in-progress': isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      completed: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      issue: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.pending;
  };

  const renderForm = (checkIn: Partial<CheckIn>, isEditing = false) => {
    const setData = isEditing
      ? (updates: Partial<CheckIn>) => setEditingCheckIn({ ...editingCheckIn!, ...updates })
      : (updates: Partial<CheckIn>) => setNewCheckIn({ ...newCheckIn, ...updates });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.guestName', 'Guest Name *')}
            </label>
            <input
              type="text"
              value={checkIn.guestName || ''}
              onChange={(e) => setData({ guestName: e.target.value })}
              placeholder={t('tools.guestCheckIn.fullName', 'Full name')}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.roomNumber', 'Room Number *')}
            </label>
            <input
              type="text"
              value={checkIn.roomNumber || ''}
              onChange={(e) => setData({ roomNumber: e.target.value })}
              placeholder="e.g., 201"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.reservationId', 'Reservation ID')}
            </label>
            <input
              type="text"
              value={checkIn.reservationId || ''}
              onChange={(e) => setData({ reservationId: e.target.value })}
              placeholder={t('tools.guestCheckIn.eGRes001', 'e.g., RES-001')}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.checkInDate', 'Check-In Date')}
            </label>
            <input
              type="date"
              value={checkIn.checkInDate || ''}
              onChange={(e) => setData({ checkInDate: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.checkInTime', 'Check-In Time')}
            </label>
            <input
              type="time"
              value={checkIn.checkInTime || ''}
              onChange={(e) => setData({ checkInTime: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.expectedCheckOut', 'Expected Check-Out')}
            </label>
            <input
              type="date"
              value={checkIn.expectedCheckOut || ''}
              onChange={(e) => setData({ expectedCheckOut: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.idType', 'ID Type')}
            </label>
            <select
              value={checkIn.idType || 'Passport'}
              onChange={(e) => setData({ idType: e.target.value })}
              className={inputClass}
            >
              {ID_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.idNumber', 'ID Number')}
            </label>
            <input
              type="text"
              value={checkIn.idNumber || ''}
              onChange={(e) => setData({ idNumber: e.target.value })}
              placeholder={t('tools.guestCheckIn.idNumber2', 'ID number')}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.paymentMethod', 'Payment Method')}
            </label>
            <select
              value={checkIn.paymentMethod || 'Credit Card'}
              onChange={(e) => setData({ paymentMethod: e.target.value })}
              className={inputClass}
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.deposit', 'Deposit ($)')}
            </label>
            <input
              type="number"
              value={checkIn.depositAmount || 0}
              onChange={(e) => setData({ depositAmount: parseFloat(e.target.value) || 0 })}
              min="0"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.keyCard', 'Key Card #')}
            </label>
            <input
              type="text"
              value={checkIn.keyCardNumber || ''}
              onChange={(e) => setData({ keyCardNumber: e.target.value })}
              placeholder={t('tools.guestCheckIn.kcXxxx', 'KC-XXXX')}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.vehiclePlate', 'Vehicle Plate')}
            </label>
            <input
              type="text"
              value={checkIn.vehiclePlate || ''}
              onChange={(e) => setData({ vehiclePlate: e.target.value })}
              placeholder={t('tools.guestCheckIn.optional', 'Optional')}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.status', 'Status')}
            </label>
            <select
              value={checkIn.status || 'pending'}
              onChange={(e) => setData({ status: e.target.value as CheckInStatus })}
              className={inputClass}
            >
              {CHECK_IN_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.processedBy', 'Processed By')}
            </label>
            <input
              type="text"
              value={checkIn.processedBy || ''}
              onChange={(e) => setData({ processedBy: e.target.value })}
              placeholder={t('tools.guestCheckIn.staffName', 'Staff name')}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.guestCheckIn.specialInstructions', 'Special Instructions')}
            </label>
            <input
              type="text"
              value={checkIn.specialInstructions || ''}
              onChange={(e) => setData({ specialInstructions: e.target.value })}
              placeholder={t('tools.guestCheckIn.anySpecialNotes', 'Any special notes...')}
              className={inputClass}
            />
          </div>
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
                <UserPlus className="w-6 h-6 text-[#0D9488]" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.guestCheckIn.guestCheckIn', 'Guest Check-In')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.guestCheckIn.manageGuestCheckInProcess', 'Manage guest check-in process')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="guest-check-in" toolName="Guest Check In" />

              <SyncStatus
                isSynced={checkInsData.isSynced}
                isSaving={checkInsData.isSaving}
                lastSaved={checkInsData.lastSaved}
                syncError={checkInsData.syncError}
                onForceSync={() => checkInsData.forceSync()}
                theme={isDark ? 'dark' : 'light'}
                showLabel={true}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => checkInsData.exportCSV({ filename: 'guest-check-ins' })}
                onExportExcel={() => checkInsData.exportExcel({ filename: 'guest-check-ins' })}
                onExportJSON={() => checkInsData.exportJSON({ filename: 'guest-check-ins' })}
                onExportPDF={() => checkInsData.exportPDF({ filename: 'guest-check-ins', title: 'Guest Check-Ins' })}
                onPrint={() => checkInsData.print('Guest Check-Ins')}
                onCopyToClipboard={() => checkInsData.copyToClipboard('tab')}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={handleReset} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}>
                <RefreshCw className="w-4 h-4" />
                {t('tools.guestCheckIn.reset', 'Reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cardClass}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestCheckIn.todaySCheckIns', 'Today\'s Check-Ins')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.todayCheckIns}</p>
          </div>
          <div className={cardClass}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestCheckIn.completed', 'Completed')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
          </div>
          <div className={cardClass}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestCheckIn.inProgress', 'In Progress')}</p>
            <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
          </div>
          <div className={cardClass}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestCheckIn.issues', 'Issues')}</p>
            <p className="text-2xl font-bold text-red-500">{stats.issues}</p>
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
                placeholder={t('tools.guestCheckIn.searchCheckIns', 'Search check-ins...')}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as CheckInStatus | '')}
            className={`${inputClass} w-auto`}
          >
            <option value="">{t('tools.guestCheckIn.allStatuses', 'All Statuses')}</option>
            {CHECK_IN_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('tools.guestCheckIn.newCheckIn2', 'New Check-In')}
          </button>
        </div>

        {/* Forms */}
        {showForm && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestCheckIn.newCheckIn', 'New Check-In')}</h3>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            {renderForm(newCheckIn)}
            <button
              onClick={handleAddCheckIn}
              disabled={!newCheckIn.guestName || !newCheckIn.roomNumber}
              className="mt-4 w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('tools.guestCheckIn.processCheckIn', 'Process Check-In')}
            </button>
          </div>
        )}

        {editingCheckIn && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestCheckIn.editCheckIn', 'Edit Check-In')}</h3>
              <button onClick={() => setEditingCheckIn(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            {renderForm(editingCheckIn, true)}
            <div className="flex gap-3 mt-4">
              <button onClick={handleUpdateCheckIn} className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                {t('tools.guestCheckIn.saveChanges', 'Save Changes')}
              </button>
              <button onClick={() => setEditingCheckIn(null)} className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                {t('tools.guestCheckIn.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Check-In List */}
        <div className="space-y-3">
          {filteredCheckIns.map(c => (
            <div key={c.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{c.guestName}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(c.status)}`}>
                      {CHECK_IN_STATUSES.find(s => s.value === c.status)?.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Bed className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Room {c.roomNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{c.checkInTime} on {new Date(c.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{c.paymentMethod}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Key: {c.keyCardNumber}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {c.status === 'in-progress' && (
                    <button onClick={() => handleStatusChange(c.id, 'completed')} className="p-2 rounded-lg text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20" title={t('tools.guestCheckIn.complete', 'Complete')}>
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setEditingCheckIn(c)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                  <button onClick={() => handleDeleteCheckIn(c.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCheckIns.length === 0 && (
          <div className={`text-center py-12 ${cardClass}`}>
            <UserPlus className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.guestCheckIn.noCheckInRecordsFound', 'No check-in records found.')}</p>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default GuestCheckInTool;
