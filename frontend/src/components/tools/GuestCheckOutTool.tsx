'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserMinus,
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
  DollarSign,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface GuestCheckOutToolProps {
  uiConfig?: UIConfig;
}

interface CheckOut {
  id: string;
  reservationId: string;
  guestName: string;
  roomNumber: string;
  checkOutDate: string;
  checkOutTime: string;
  roomCharges: number;
  minibarCharges: number;
  restaurantCharges: number;
  otherCharges: number;
  totalAmount: number;
  depositPaid: number;
  balanceDue: number;
  paymentMethod: string;
  status: CheckOutStatus;
  keyCardReturned: boolean;
  roomCondition: RoomCondition;
  damages: string;
  processedBy: string;
  notes: string;
  createdAt: string;
}

type CheckOutStatus = 'pending' | 'in-progress' | 'completed' | 'disputed';
type RoomCondition = 'excellent' | 'good' | 'fair' | 'damaged';

const CHECK_OUT_STATUSES: { value: CheckOutStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'disputed', label: 'Disputed', color: 'red' },
];

const ROOM_CONDITIONS: { value: RoomCondition; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'damaged', label: 'Damaged' },
];

const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Cash', 'Corporate Account', 'Pre-paid'];

const checkOutColumns: ColumnConfig[] = [
  { key: 'id', header: 'Check-Out ID', type: 'string' },
  { key: 'guestName', header: 'Guest Name', type: 'string' },
  { key: 'roomNumber', header: 'Room', type: 'string' },
  { key: 'checkOutDate', header: 'Date', type: 'date' },
  { key: 'checkOutTime', header: 'Time', type: 'string' },
  { key: 'totalAmount', header: 'Total', type: 'currency' },
  { key: 'balanceDue', header: 'Balance', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'roomCondition', header: 'Condition', type: 'string' },
];

const generateSampleCheckOuts = (): CheckOut[] => {
  const today = new Date();
  return [
    {
      id: 'CHO-001',
      reservationId: 'RES-001',
      guestName: 'John Smith',
      roomNumber: '201',
      checkOutDate: today.toISOString().split('T')[0],
      checkOutTime: '11:00',
      roomCharges: 447,
      minibarCharges: 45,
      restaurantCharges: 120,
      otherCharges: 0,
      totalAmount: 612,
      depositPaid: 149,
      balanceDue: 463,
      paymentMethod: 'Credit Card',
      status: 'completed',
      keyCardReturned: true,
      roomCondition: 'excellent',
      damages: '',
      processedBy: 'Front Desk - Maria',
      notes: 'Guest requested receipt via email',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'CHO-002',
      reservationId: 'RES-003',
      guestName: 'Michael Brown',
      roomNumber: '102',
      checkOutDate: today.toISOString().split('T')[0],
      checkOutTime: '10:30',
      roomCharges: 99,
      minibarCharges: 0,
      restaurantCharges: 0,
      otherCharges: 0,
      totalAmount: 99,
      depositPaid: 99,
      balanceDue: 0,
      paymentMethod: 'Pre-paid',
      status: 'in-progress',
      keyCardReturned: false,
      roomCondition: 'good',
      damages: '',
      processedBy: 'Front Desk - James',
      notes: '',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const GuestCheckOutTool: React.FC<GuestCheckOutToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const checkOutsData = useToolData<CheckOut>(
    'guest-check-outs',
    generateSampleCheckOuts(),
    checkOutColumns,
    { autoSave: true }
  );

  const checkOuts = checkOutsData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingCheckOut, setEditingCheckOut] = useState<CheckOut | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<CheckOutStatus | ''>('');

  const [newCheckOut, setNewCheckOut] = useState<Partial<CheckOut>>({
    reservationId: '',
    guestName: '',
    roomNumber: '',
    checkOutDate: new Date().toISOString().split('T')[0],
    checkOutTime: new Date().toTimeString().slice(0, 5),
    roomCharges: 0,
    minibarCharges: 0,
    restaurantCharges: 0,
    otherCharges: 0,
    depositPaid: 0,
    paymentMethod: 'Credit Card',
    status: 'pending',
    keyCardReturned: false,
    roomCondition: 'good',
    damages: '',
    processedBy: '',
    notes: '',
  });

  const calculateTotals = (checkOut: Partial<CheckOut>) => {
    const total = (checkOut.roomCharges || 0) + (checkOut.minibarCharges || 0) +
                  (checkOut.restaurantCharges || 0) + (checkOut.otherCharges || 0);
    const balance = total - (checkOut.depositPaid || 0);
    return { totalAmount: total, balanceDue: balance };
  };

  const handleAddCheckOut = () => {
    if (!newCheckOut.guestName || !newCheckOut.roomNumber) return;

    const totals = calculateTotals(newCheckOut);
    const checkOut: CheckOut = {
      id: `CHO-${Date.now().toString().slice(-6)}`,
      reservationId: newCheckOut.reservationId || '',
      guestName: newCheckOut.guestName || '',
      roomNumber: newCheckOut.roomNumber || '',
      checkOutDate: newCheckOut.checkOutDate || new Date().toISOString().split('T')[0],
      checkOutTime: newCheckOut.checkOutTime || new Date().toTimeString().slice(0, 5),
      roomCharges: newCheckOut.roomCharges || 0,
      minibarCharges: newCheckOut.minibarCharges || 0,
      restaurantCharges: newCheckOut.restaurantCharges || 0,
      otherCharges: newCheckOut.otherCharges || 0,
      totalAmount: totals.totalAmount,
      depositPaid: newCheckOut.depositPaid || 0,
      balanceDue: totals.balanceDue,
      paymentMethod: newCheckOut.paymentMethod || 'Credit Card',
      status: newCheckOut.status as CheckOutStatus || 'pending',
      keyCardReturned: newCheckOut.keyCardReturned || false,
      roomCondition: newCheckOut.roomCondition as RoomCondition || 'good',
      damages: newCheckOut.damages || '',
      processedBy: newCheckOut.processedBy || '',
      notes: newCheckOut.notes || '',
      createdAt: new Date().toISOString(),
    };

    checkOutsData.addItem(checkOut);
    setNewCheckOut({
      reservationId: '',
      guestName: '',
      roomNumber: '',
      checkOutDate: new Date().toISOString().split('T')[0],
      checkOutTime: new Date().toTimeString().slice(0, 5),
      roomCharges: 0,
      minibarCharges: 0,
      restaurantCharges: 0,
      otherCharges: 0,
      depositPaid: 0,
      paymentMethod: 'Credit Card',
      status: 'pending',
      keyCardReturned: false,
      roomCondition: 'good',
      damages: '',
      processedBy: '',
      notes: '',
    });
    setShowForm(false);
  };

  const handleUpdateCheckOut = () => {
    if (!editingCheckOut) return;
    const totals = calculateTotals(editingCheckOut);
    checkOutsData.updateItem(editingCheckOut.id, { ...editingCheckOut, ...totals });
    setEditingCheckOut(null);
  };

  const handleDeleteCheckOut = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Check-Out',
      message: 'Are you sure you want to delete this check-out record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      checkOutsData.deleteItem(id);
    }
  };

  const handleStatusChange = (id: string, status: CheckOutStatus) => {
    checkOutsData.updateItem(id, { status });
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset Check-Out Records',
      message: 'Reset all check-out records to sample data?',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      checkOutsData.resetToDefault(generateSampleCheckOuts());
    }
  };

  const filteredCheckOuts = useMemo(() => {
    return checkOuts.filter(c => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!c.guestName.toLowerCase().includes(q) && !c.roomNumber.toLowerCase().includes(q)) return false;
      }
      if (filterStatus && c.status !== filterStatus) return false;
      return true;
    });
  }, [checkOuts, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayCheckOuts = checkOuts.filter(c => c.checkOutDate === today);
    return {
      todayCount: todayCheckOuts.length,
      completed: checkOuts.filter(c => c.status === 'completed').length,
      todayRevenue: todayCheckOuts.reduce((sum, c) => sum + c.totalAmount, 0),
      pendingBalance: checkOuts.filter(c => c.status !== 'completed').reduce((sum, c) => sum + c.balanceDue, 0),
    };
  }, [checkOuts]);

  const inputClass = `w-full px-4 py-2.5 border ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;

  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const getStatusColor = (status: CheckOutStatus) => {
    const colors: Record<string, string> = {
      pending: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      'in-progress': isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      completed: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      disputed: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.pending;
  };

  const renderForm = (checkOut: Partial<CheckOut>, isEditing = false) => {
    const setData = isEditing
      ? (updates: Partial<CheckOut>) => setEditingCheckOut({ ...editingCheckOut!, ...updates })
      : (updates: Partial<CheckOut>) => setNewCheckOut({ ...newCheckOut, ...updates });

    const totals = calculateTotals(checkOut);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Guest Name *</label>
            <input type="text" value={checkOut.guestName || ''} onChange={(e) => setData({ guestName: e.target.value })} placeholder="Full name" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Room Number *</label>
            <input type="text" value={checkOut.roomNumber || ''} onChange={(e) => setData({ roomNumber: e.target.value })} placeholder="e.g., 201" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reservation ID</label>
            <input type="text" value={checkOut.reservationId || ''} onChange={(e) => setData({ reservationId: e.target.value })} placeholder="e.g., RES-001" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Room Charges ($)</label>
            <input type="number" value={checkOut.roomCharges || 0} onChange={(e) => setData({ roomCharges: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Minibar ($)</label>
            <input type="number" value={checkOut.minibarCharges || 0} onChange={(e) => setData({ minibarCharges: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Restaurant ($)</label>
            <input type="number" value={checkOut.restaurantCharges || 0} onChange={(e) => setData({ restaurantCharges: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Other ($)</label>
            <input type="number" value={checkOut.otherCharges || 0} onChange={(e) => setData({ otherCharges: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${totals.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Deposit</p>
              <p className="text-xl font-bold text-green-500">${(checkOut.depositPaid || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Balance Due</p>
              <p className={`text-xl font-bold ${totals.balanceDue > 0 ? 'text-red-500' : 'text-green-500'}`}>${totals.balanceDue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Deposit Paid ($)</label>
            <input type="number" value={checkOut.depositPaid || 0} onChange={(e) => setData({ depositPaid: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Payment Method</label>
            <select value={checkOut.paymentMethod || 'Credit Card'} onChange={(e) => setData({ paymentMethod: e.target.value })} className={inputClass}>
              {PAYMENT_METHODS.map(method => (<option key={method} value={method}>{method}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Room Condition</label>
            <select value={checkOut.roomCondition || 'good'} onChange={(e) => setData({ roomCondition: e.target.value as RoomCondition })} className={inputClass}>
              {ROOM_CONDITIONS.map(cond => (<option key={cond.value} value={cond.value}>{cond.label}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
            <select value={checkOut.status || 'pending'} onChange={(e) => setData({ status: e.target.value as CheckOutStatus })} className={inputClass}>
              {CHECK_OUT_STATUSES.map(status => (<option key={status.value} value={status.value}>{status.label}</option>))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={checkOut.keyCardReturned || false} onChange={(e) => setData({ keyCardReturned: e.target.checked })} className="w-4 h-4 text-[#0D9488] rounded" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Key Card Returned</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Processed By</label>
            <input type="text" value={checkOut.processedBy || ''} onChange={(e) => setData({ processedBy: e.target.value })} placeholder="Staff name" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Notes</label>
            <input type="text" value={checkOut.notes || ''} onChange={(e) => setData({ notes: e.target.value })} placeholder="Additional notes" className={inputClass} />
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
                <UserMinus className="w-6 h-6 text-[#0D9488]" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestCheckOut.title')}</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestCheckOut.description')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="guest-check-out" toolName="Guest Check Out" />

              <SyncStatus isSynced={checkOutsData.isSynced} isSaving={checkOutsData.isSaving} lastSaved={checkOutsData.lastSaved} syncError={checkOutsData.syncError} onForceSync={() => checkOutsData.forceSync()} theme={isDark ? 'dark' : 'light'} showLabel={true} size="sm" />
              <ExportDropdown onExportCSV={() => checkOutsData.exportCSV({ filename: 'guest-check-outs' })} onExportExcel={() => checkOutsData.exportExcel({ filename: 'guest-check-outs' })} onExportJSON={() => checkOutsData.exportJSON({ filename: 'guest-check-outs' })} onExportPDF={() => checkOutsData.exportPDF({ filename: 'guest-check-outs', title: 'Guest Check-Outs' })} onPrint={() => checkOutsData.print('Guest Check-Outs')} onCopyToClipboard={() => checkOutsData.copyToClipboard('tab')} theme={isDark ? 'dark' : 'light'} />
              <button onClick={handleReset} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}>
                <RefreshCw className="w-4 h-4" />{t('tools.guestCheckOut.reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestCheckOut.stats.todayCheckOuts')}</p><p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.todayCount}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestCheckOut.stats.completed')}</p><p className="text-2xl font-bold text-green-500">{stats.completed}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestCheckOut.stats.todayRevenue')}</p><p className="text-2xl font-bold text-[#0D9488]">${stats.todayRevenue.toFixed(0)}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestCheckOut.stats.pendingBalance')}</p><p className="text-2xl font-bold text-orange-500">${stats.pendingBalance.toFixed(0)}</p></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('tools.guestCheckOut.searchPlaceholder')} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as CheckOutStatus | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.guestCheckOut.allStatuses')}</option>
            {CHECK_OUT_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2">
            <Plus className="w-5 h-5" />{t('tools.guestCheckOut.newCheckOut')}
          </button>
        </div>

        {/* Forms */}
        {showForm && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestCheckOut.newCheckOut')}</h3>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(newCheckOut)}
            <button onClick={handleAddCheckOut} disabled={!newCheckOut.guestName || !newCheckOut.roomNumber} className="mt-4 w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />{t('tools.guestCheckOut.processCheckOut')}
            </button>
          </div>
        )}

        {editingCheckOut && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestCheckOut.editCheckOut')}</h3>
              <button onClick={() => setEditingCheckOut(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(editingCheckOut, true)}
            <div className="flex gap-3 mt-4">
              <button onClick={handleUpdateCheckOut} className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"><Save className="w-5 h-5" />{t('tools.guestCheckOut.save')}</button>
              <button onClick={() => setEditingCheckOut(null)} className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('tools.guestCheckOut.cancel')}</button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {filteredCheckOuts.map(c => (
            <div key={c.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{c.guestName}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(c.status)}`}>{CHECK_OUT_STATUSES.find(s => s.value === c.status)?.label}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2"><Bed className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Room {c.roomNumber}</span></div>
                    <div className="flex items-center gap-2"><Clock className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{c.checkOutTime}</span></div>
                    <div className="flex items-center gap-2"><DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className="text-[#0D9488] font-medium">${c.totalAmount}</span></div>
                    <div className="flex items-center gap-2"><FileText className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={`${c.balanceDue > 0 ? 'text-red-500' : 'text-green-500'} font-medium`}>Balance: ${c.balanceDue}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {c.status === 'in-progress' && (<button onClick={() => handleStatusChange(c.id, 'completed')} className="p-2 rounded-lg text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20"><CheckCircle className="w-4 h-4" /></button>)}
                  <button onClick={() => setEditingCheckOut(c)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
                  <button onClick={() => handleDeleteCheckOut(c.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCheckOuts.length === 0 && (
          <div className={`text-center py-12 ${cardClass}`}>
            <UserMinus className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.guestCheckOut.noRecordsFound')}</p>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default GuestCheckOutTool;
