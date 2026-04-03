'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DoorOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  X,
  RefreshCw,
  Bed,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface RoomStatusToolProps {
  uiConfig?: UIConfig;
}

interface RoomStatus {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  status: RoomStatusType;
  cleanStatus: CleanStatus;
  occupancy: OccupancyStatus;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  lastCleaned: string;
  maintenanceIssue: string;
  notes: string;
  updatedAt: string;
  createdAt: string;
}

type RoomStatusType = 'available' | 'occupied' | 'reserved' | 'out-of-order' | 'under-maintenance';
type CleanStatus = 'clean' | 'dirty' | 'inspected' | 'in-progress';
type OccupancyStatus = 'vacant' | 'occupied' | 'due-out' | 'due-in' | 'stayover';

const ROOM_STATUSES: { value: RoomStatusType; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'green' },
  { value: 'occupied', label: 'Occupied', color: 'blue' },
  { value: 'reserved', label: 'Reserved', color: 'purple' },
  { value: 'out-of-order', label: 'Out of Order', color: 'red' },
  { value: 'under-maintenance', label: 'Maintenance', color: 'orange' },
];

const CLEAN_STATUSES: { value: CleanStatus; label: string; color: string }[] = [
  { value: 'clean', label: 'Clean', color: 'green' },
  { value: 'dirty', label: 'Dirty', color: 'red' },
  { value: 'inspected', label: 'Inspected', color: 'blue' },
  { value: 'in-progress', label: 'Cleaning', color: 'yellow' },
];

const OCCUPANCY_STATUSES: { value: OccupancyStatus; label: string }[] = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'due-out', label: 'Due Out Today' },
  { value: 'due-in', label: 'Due In Today' },
  { value: 'stayover', label: 'Stayover' },
];

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Penthouse', 'Family'];

const roomColumns: ColumnConfig[] = [
  { key: 'roomNumber', header: 'Room', type: 'string' },
  { key: 'floor', header: 'Floor', type: 'number' },
  { key: 'roomType', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'cleanStatus', header: 'Clean Status', type: 'string' },
  { key: 'occupancy', header: 'Occupancy', type: 'string' },
  { key: 'guestName', header: 'Guest', type: 'string' },
  { key: 'checkOutDate', header: 'Check-Out', type: 'date' },
];

const generateSampleRooms = (): RoomStatus[] => {
  const today = new Date();
  return [
    { id: 'R-101', roomNumber: '101', floor: 1, roomType: 'Standard', status: 'available', cleanStatus: 'clean', occupancy: 'vacant', guestName: '', checkInDate: '', checkOutDate: '', lastCleaned: today.toISOString(), maintenanceIssue: '', notes: '', updatedAt: today.toISOString(), createdAt: today.toISOString() },
    { id: 'R-102', roomNumber: '102', floor: 1, roomType: 'Standard', status: 'occupied', cleanStatus: 'inspected', occupancy: 'due-out', guestName: 'Michael Brown', checkInDate: new Date(today.getTime() - 86400000).toISOString().split('T')[0], checkOutDate: today.toISOString().split('T')[0], lastCleaned: new Date(today.getTime() - 86400000).toISOString(), maintenanceIssue: '', notes: '', updatedAt: today.toISOString(), createdAt: today.toISOString() },
    { id: 'R-201', roomNumber: '201', floor: 2, roomType: 'Deluxe', status: 'occupied', cleanStatus: 'clean', occupancy: 'stayover', guestName: 'John Smith', checkInDate: today.toISOString().split('T')[0], checkOutDate: new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0], lastCleaned: today.toISOString(), maintenanceIssue: '', notes: 'VIP guest', updatedAt: today.toISOString(), createdAt: today.toISOString() },
    { id: 'R-202', roomNumber: '202', floor: 2, roomType: 'Deluxe', status: 'reserved', cleanStatus: 'dirty', occupancy: 'due-in', guestName: 'Sarah Johnson', checkInDate: today.toISOString().split('T')[0], checkOutDate: new Date(today.getTime() + 4 * 86400000).toISOString().split('T')[0], lastCleaned: new Date(today.getTime() - 2 * 86400000).toISOString(), maintenanceIssue: '', notes: '', updatedAt: today.toISOString(), createdAt: today.toISOString() },
    { id: 'R-301', roomNumber: '301', floor: 3, roomType: 'Suite', status: 'under-maintenance', cleanStatus: 'dirty', occupancy: 'vacant', guestName: '', checkInDate: '', checkOutDate: '', lastCleaned: new Date(today.getTime() - 3 * 86400000).toISOString(), maintenanceIssue: 'AC repair', notes: 'Expected completion tomorrow', updatedAt: today.toISOString(), createdAt: today.toISOString() },
    { id: 'R-305', roomNumber: '305', floor: 3, roomType: 'Suite', status: 'available', cleanStatus: 'inspected', occupancy: 'vacant', guestName: '', checkInDate: '', checkOutDate: '', lastCleaned: today.toISOString(), maintenanceIssue: '', notes: '', updatedAt: today.toISOString(), createdAt: today.toISOString() },
  ];
};

export const RoomStatusTool: React.FC<RoomStatusToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const roomsData = useToolData<RoomStatus>(
    'room-statuses',
    generateSampleRooms(),
    roomColumns,
    { autoSave: true }
  );

  const rooms = roomsData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<RoomStatusType | ''>('');
  const [filterClean, setFilterClean] = useState<CleanStatus | ''>('');
  const [filterFloor, setFilterFloor] = useState<string>('');

  const [newRoom, setNewRoom] = useState<Partial<RoomStatus>>({
    roomNumber: '',
    floor: 1,
    roomType: 'Standard',
    status: 'available',
    cleanStatus: 'clean',
    occupancy: 'vacant',
    guestName: '',
    checkInDate: '',
    checkOutDate: '',
    maintenanceIssue: '',
    notes: '',
  });

  const handleAddRoom = () => {
    if (!newRoom.roomNumber) return;
    const room: RoomStatus = {
      id: `R-${newRoom.roomNumber}`,
      roomNumber: newRoom.roomNumber || '',
      floor: newRoom.floor || 1,
      roomType: newRoom.roomType || 'Standard',
      status: newRoom.status as RoomStatusType || 'available',
      cleanStatus: newRoom.cleanStatus as CleanStatus || 'clean',
      occupancy: newRoom.occupancy as OccupancyStatus || 'vacant',
      guestName: newRoom.guestName || '',
      checkInDate: newRoom.checkInDate || '',
      checkOutDate: newRoom.checkOutDate || '',
      lastCleaned: new Date().toISOString(),
      maintenanceIssue: newRoom.maintenanceIssue || '',
      notes: newRoom.notes || '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    roomsData.addItem(room);
    setNewRoom({ roomNumber: '', floor: 1, roomType: 'Standard', status: 'available', cleanStatus: 'clean', occupancy: 'vacant', guestName: '', checkInDate: '', checkOutDate: '', maintenanceIssue: '', notes: '' });
    setShowForm(false);
  };

  const handleUpdateRoom = () => {
    if (!editingRoom) return;
    roomsData.updateItem(editingRoom.id, { ...editingRoom, updatedAt: new Date().toISOString() });
    setEditingRoom(null);
  };

  const handleDeleteRoom = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Delete this room?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) roomsData.deleteItem(id);
  };

  const handleQuickStatusChange = (id: string, status: RoomStatusType) => {
    roomsData.updateItem(id, { status, updatedAt: new Date().toISOString() });
  };

  const handleQuickCleanChange = (id: string, cleanStatus: CleanStatus) => {
    const updates: Partial<RoomStatus> = { cleanStatus, updatedAt: new Date().toISOString() };
    if (cleanStatus === 'clean' || cleanStatus === 'inspected') {
      updates.lastCleaned = new Date().toISOString();
    }
    roomsData.updateItem(id, updates);
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Confirm Reset',
      message: 'Reset all rooms to sample data?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) roomsData.resetToDefault(generateSampleRooms());
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.roomNumber.toLowerCase().includes(q) && !r.guestName.toLowerCase().includes(q)) return false;
      }
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterClean && r.cleanStatus !== filterClean) return false;
      if (filterFloor && r.floor !== parseInt(filterFloor)) return false;
      return true;
    });
  }, [rooms, searchQuery, filterStatus, filterClean, filterFloor]);

  const stats = useMemo(() => {
    return {
      total: rooms.length,
      available: rooms.filter(r => r.status === 'available' && r.cleanStatus !== 'dirty').length,
      occupied: rooms.filter(r => r.status === 'occupied').length,
      dirty: rooms.filter(r => r.cleanStatus === 'dirty').length,
      maintenance: rooms.filter(r => r.status === 'under-maintenance' || r.status === 'out-of-order').length,
    };
  }, [rooms]);

  const floors = useMemo(() => [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b), [rooms]);

  const inputClass = `w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;
  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const getStatusColor = (status: RoomStatusType) => {
    const colors: Record<string, string> = {
      available: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      occupied: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      reserved: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700',
      'out-of-order': isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
      'under-maintenance': isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
    };
    return colors[status] || colors.available;
  };

  const getCleanColor = (status: CleanStatus) => {
    const colors: Record<string, string> = {
      clean: 'text-green-500',
      dirty: 'text-red-500',
      inspected: 'text-blue-500',
      'in-progress': 'text-yellow-500',
    };
    return colors[status] || colors.clean;
  };

  const renderForm = (room: Partial<RoomStatus>, isEditing = false) => {
    const setData = isEditing
      ? (updates: Partial<RoomStatus>) => setEditingRoom({ ...editingRoom!, ...updates })
      : (updates: Partial<RoomStatus>) => setNewRoom({ ...newRoom, ...updates });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roomStatus.roomNumber', 'Room Number *')}</label>
            <input type="text" value={room.roomNumber || ''} onChange={(e) => setData({ roomNumber: e.target.value })} placeholder="e.g., 201" className={inputClass} disabled={isEditing} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roomStatus.floor', 'Floor')}</label>
            <input type="number" value={room.floor || 1} onChange={(e) => setData({ floor: parseInt(e.target.value) || 1 })} min="1" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roomStatus.roomType', 'Room Type')}</label>
            <select value={room.roomType || 'Standard'} onChange={(e) => setData({ roomType: e.target.value })} className={inputClass}>
              {ROOM_TYPES.map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roomStatus.status', 'Status')}</label>
            <select value={room.status || 'available'} onChange={(e) => setData({ status: e.target.value as RoomStatusType })} className={inputClass}>
              {ROOM_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roomStatus.cleanStatus', 'Clean Status')}</label>
            <select value={room.cleanStatus || 'clean'} onChange={(e) => setData({ cleanStatus: e.target.value as CleanStatus })} className={inputClass}>
              {CLEAN_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roomStatus.occupancy', 'Occupancy')}</label>
            <select value={room.occupancy || 'vacant'} onChange={(e) => setData({ occupancy: e.target.value as OccupancyStatus })} className={inputClass}>
              {OCCUPANCY_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roomStatus.guestName', 'Guest Name')}</label>
            <input type="text" value={room.guestName || ''} onChange={(e) => setData({ guestName: e.target.value })} placeholder={t('tools.roomStatus.optional', 'Optional')} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roomStatus.maintenanceIssue', 'Maintenance Issue')}</label>
            <input type="text" value={room.maintenanceIssue || ''} onChange={(e) => setData({ maintenanceIssue: e.target.value })} placeholder={t('tools.roomStatus.ifAny', 'If any')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.roomStatus.notes', 'Notes')}</label>
            <input type="text" value={room.notes || ''} onChange={(e) => setData({ notes: e.target.value })} placeholder={t('tools.roomStatus.additionalNotes', 'Additional notes')} className={inputClass} />
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
              <div className="p-3 bg-[#0D9488]/10 rounded-xl"><DoorOpen className="w-6 h-6 text-[#0D9488]" /></div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roomStatus.roomStatus', 'Room Status')}</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomStatus.realTimeRoomStatusTracker', 'Real-time room status tracker')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="room-status" toolName="Room Status" />

              <SyncStatus isSynced={roomsData.isSynced} isSaving={roomsData.isSaving} lastSaved={roomsData.lastSaved} syncError={roomsData.syncError} onForceSync={() => roomsData.forceSync()} theme={isDark ? 'dark' : 'light'} showLabel={true} size="sm" />
              <ExportDropdown onExportCSV={() => roomsData.exportCSV({ filename: 'room-status' })} onExportExcel={() => roomsData.exportExcel({ filename: 'room-status' })} onExportJSON={() => roomsData.exportJSON({ filename: 'room-status' })} onExportPDF={() => roomsData.exportPDF({ filename: 'room-status', title: 'Room Status' })} onPrint={() => roomsData.print('Room Status')} onCopyToClipboard={() => roomsData.copyToClipboard('tab')} theme={isDark ? 'dark' : 'light'} />
              <button onClick={handleReset} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}><RefreshCw className="w-4 h-4" />{t('tools.roomStatus.reset', 'Reset')}</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomStatus.totalRooms', 'Total Rooms')}</p><p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomStatus.available', 'Available')}</p><p className="text-2xl font-bold text-green-500">{stats.available}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomStatus.occupied', 'Occupied')}</p><p className="text-2xl font-bold text-blue-500">{stats.occupied}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomStatus.dirty', 'Dirty')}</p><p className="text-2xl font-bold text-red-500">{stats.dirty}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roomStatus.maintenance', 'Maintenance')}</p><p className="text-2xl font-bold text-orange-500">{stats.maintenance}</p></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('tools.roomStatus.searchRooms', 'Search rooms...')} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.roomStatus.allFloors', 'All Floors')}</option>
            {floors.map(f => (<option key={f} value={f}>Floor {f}</option>))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as RoomStatusType | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.roomStatus.allStatuses', 'All Statuses')}</option>
            {ROOM_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <select value={filterClean} onChange={(e) => setFilterClean(e.target.value as CleanStatus | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.roomStatus.allCleanStatus', 'All Clean Status')}</option>
            {CLEAN_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2"><Plus className="w-5 h-5" />{t('tools.roomStatus.addRoom', 'Add Room')}</button>
        </div>

        {/* Forms */}
        {showForm && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roomStatus.addRoom2', 'Add Room')}</h3>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(newRoom)}
            <button onClick={handleAddRoom} disabled={!newRoom.roomNumber} className="mt-4 w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"><Plus className="w-5 h-5" />{t('tools.roomStatus.addRoom3', 'Add Room')}</button>
          </div>
        )}

        {editingRoom && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Room {editingRoom.roomNumber}</h3>
              <button onClick={() => setEditingRoom(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(editingRoom, true)}
            <div className="flex gap-3 mt-4">
              <button onClick={handleUpdateRoom} className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"><Save className="w-5 h-5" />{t('tools.roomStatus.save', 'Save')}</button>
              <button onClick={() => setEditingRoom(null)} className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('tools.roomStatus.cancel', 'Cancel')}</button>
            </div>
          </div>
        )}

        {/* Room Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredRooms.map(room => (
            <div key={room.id} className={`${cardClass} cursor-pointer hover:shadow-lg transition-shadow`} onClick={() => setEditingRoom(room)}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{room.roomNumber}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(room.status)}`}>{ROOM_STATUSES.find(s => s.value === room.status)?.label}</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{room.roomType}</p>
                <p className={getCleanColor(room.cleanStatus)}>{CLEAN_STATUSES.find(s => s.value === room.cleanStatus)?.label}</p>
                {room.guestName && <p className={`flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}><User className="w-3 h-3" />{room.guestName}</p>}
                {room.maintenanceIssue && <p className="text-orange-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{room.maintenanceIssue}</p>}
              </div>
            </div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className={`text-center py-12 ${cardClass}`}>
            <DoorOpen className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.roomStatus.noRoomsFoundMatchingYour', 'No rooms found matching your filters.')}</p>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default RoomStatusTool;
