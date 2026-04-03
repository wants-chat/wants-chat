import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Calendar, Clock, DollarSign, Plus, Trash2, Sparkles, Loader2, Edit2, Users, Music2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface StudioSession {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  sessionType: 'recording' | 'mixing' | 'mastering' | 'podcast' | 'voiceover' | 'rehearsal';
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  engineerRequired: boolean;
  equipmentNeeded: string[];
  hourlyRate: number;
  deposit: number;
  depositPaid: boolean;
  notes: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
}

const sessionTypes: { value: StudioSession['sessionType']; label: string }[] = [
  { value: 'recording', label: 'Recording Session' },
  { value: 'mixing', label: 'Mixing Session' },
  { value: 'mastering', label: 'Mastering Session' },
  { value: 'podcast', label: 'Podcast Recording' },
  { value: 'voiceover', label: 'Voice Over' },
  { value: 'rehearsal', label: 'Rehearsal' },
];

const rooms = [
  { name: 'Studio A - Live Room', rate: 100 },
  { name: 'Studio B - Control Room', rate: 85 },
  { name: 'Vocal Booth', rate: 60 },
  { name: 'Podcast Suite', rate: 50 },
  { name: 'Mixing Suite', rate: 75 },
  { name: 'Mastering Room', rate: 90 },
];

const equipment = [
  'Neumann U87', 'SM7B', 'Pro Tools HD', 'SSL Console', 'Drum Kit', 'Backline Amps',
  'Grand Piano', 'Outboard Gear', 'Additional Mics', 'Video Recording'
];

const COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'sessionType', header: 'Session Type', type: 'string' },
  { key: 'roomName', header: 'Room', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'duration', header: 'Duration (hrs)', type: 'number' },
  { key: 'hourlyRate', header: 'Rate ($/hr)', type: 'currency' },
  { key: 'deposit', header: 'Deposit', type: 'currency' },
  { key: 'depositPaid', header: 'Deposit Paid', type: 'boolean' },
  { key: 'engineerRequired', header: 'Engineer', type: 'boolean' },
  { key: 'status', header: 'Status', type: 'string' },
];

interface StudioBookingToolProps {
  uiConfig?: UIConfig;
}

export const StudioBookingTool: React.FC<StudioBookingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const emptyForm: Omit<StudioSession, 'id' | 'createdAt'> = {
    clientName: '',
    email: '',
    phone: '',
    sessionType: 'recording',
    roomName: rooms[0].name,
    date: '',
    startTime: '10:00',
    endTime: '14:00',
    duration: 4,
    engineerRequired: true,
    equipmentNeeded: [],
    hourlyRate: rooms[0].rate,
    deposit: 100,
    depositPaid: false,
    notes: '',
    status: 'pending',
  };

  const [formData, setFormData] = useState(emptyForm);

  const {
    data: sessions,
    addItem,
    updateItem,
    deleteItem,
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
  } = useToolData<StudioSession>('studio-booking', [], COLUMNS);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.clientName || params.client) {
        setFormData(prev => ({ ...prev, clientName: (params.clientName || params.client) as string }));
        hasChanges = true;
      }
      if (params.email) {
        setFormData(prev => ({ ...prev, email: params.email as string }));
        hasChanges = true;
      }
      if (params.phone) {
        setFormData(prev => ({ ...prev, phone: params.phone as string }));
        hasChanges = true;
      }
      if (params.sessionType) {
        setFormData(prev => ({ ...prev, sessionType: params.sessionType as StudioSession['sessionType'] }));
        hasChanges = true;
      }
      if (params.room || params.roomName) {
        const roomName = (params.room || params.roomName) as string;
        const room = rooms.find(r => r.name.toLowerCase().includes(roomName.toLowerCase()));
        if (room) {
          setFormData(prev => ({ ...prev, roomName: room.name, hourlyRate: room.rate }));
          hasChanges = true;
        }
      }
      if (params.date) {
        setFormData(prev => ({ ...prev, date: params.date as string }));
        hasChanges = true;
      }
      if (params.duration) {
        setFormData(prev => ({ ...prev, duration: params.duration as number }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
        setShowForm(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateDuration = (start: string, end: string): number => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return Math.max(0, (endMinutes - startMinutes) / 60);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const newFormData = { ...formData, [field]: value };
    newFormData.duration = calculateDuration(
      field === 'startTime' ? value : formData.startTime,
      field === 'endTime' ? value : formData.endTime
    );
    setFormData(newFormData);
  };

  const handleRoomChange = (roomName: string) => {
    const room = rooms.find(r => r.name === roomName);
    setFormData({ ...formData, roomName, hourlyRate: room?.rate || formData.hourlyRate });
  };

  const handleEquipmentToggle = (item: string) => {
    const current = formData.equipmentNeeded;
    const updated = current.includes(item)
      ? current.filter(e => e !== item)
      : [...current, item];
    setFormData({ ...formData, equipmentNeeded: updated });
  };

  const saveSession = () => {
    if (!formData.clientName || !formData.date) return;

    if (editingId) {
      updateItem(editingId, formData);
      setEditingId(null);
    } else {
      const newSession: StudioSession = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      addItem(newSession);
    }
    setShowForm(false);
    setFormData(emptyForm);
  };

  const handleEdit = (session: StudioSession) => {
    setFormData({
      clientName: session.clientName,
      email: session.email,
      phone: session.phone,
      sessionType: session.sessionType,
      roomName: session.roomName,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      engineerRequired: session.engineerRequired,
      equipmentNeeded: session.equipmentNeeded,
      hourlyRate: session.hourlyRate,
      deposit: session.deposit,
      depositPaid: session.depositPaid,
      notes: session.notes,
      status: session.status,
    });
    setEditingId(session.id);
    setShowForm(true);
  };

  const getSessionTotal = (session: StudioSession): number => {
    const engineerFee = session.engineerRequired ? session.duration * 35 : 0;
    return session.duration * session.hourlyRate + engineerFee;
  };

  const filteredSessions = sessions.filter(s => {
    const matchesFilter = filter === 'all' || s.status === filter;
    const matchesSearch = searchTerm === '' ||
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roomName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: sessions.length,
    confirmed: sessions.filter(s => s.status === 'confirmed').length,
    pending: sessions.filter(s => s.status === 'pending').length,
    revenue: sessions.filter(s => s.status === 'completed').reduce((sum, s) => sum + getSessionTotal(s), 0),
    upcomingHours: sessions.filter(s => ['confirmed', 'pending'].includes(s.status)).reduce((sum, s) => sum + s.duration, 0),
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'in-progress': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    completed: 'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const inputClass = `w-full p-3 rounded-lg border ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;
  const cardClass = `p-4 rounded-xl border ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'} shadow-sm`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.studioBooking.studioBooking', 'Studio Booking')}</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.studioBooking.manageStudioSessionReservations', 'Manage studio session reservations')}</p>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.studioBooking.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Calendar className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studioBooking.total', 'Total')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studioBooking.confirmed', 'Confirmed')}</p>
              <p className="text-xl font-bold text-blue-500">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studioBooking.pending', 'Pending')}</p>
              <p className="text-xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Music2 className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studioBooking.upcomingHrs', 'Upcoming Hrs')}</p>
              <p className="text-xl font-bold text-purple-500">{stats.upcomingHours}h</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studioBooking.revenue', 'Revenue')}</p>
              <p className="text-xl font-bold text-green-500">${stats.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t('tools.studioBooking.searchClientsOrRooms', 'Search clients or rooms...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('tools.studioBooking.allStatus', 'All Status')}</option>
            <option value="pending">{t('tools.studioBooking.pending2', 'Pending')}</option>
            <option value="confirmed">{t('tools.studioBooking.confirmed2', 'Confirmed')}</option>
            <option value="in-progress">{t('tools.studioBooking.inProgress', 'In Progress')}</option>
            <option value="completed">{t('tools.studioBooking.completed', 'Completed')}</option>
            <option value="cancelled">{t('tools.studioBooking.cancelled', 'Cancelled')}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="studio-booking" toolName="Studio Booking" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'studio-bookings' })}
            onExportExcel={() => exportExcel({ filename: 'studio-bookings' })}
            onExportJSON={() => exportJSON({ filename: 'studio-bookings' })}
            onExportPDF={() => exportPDF({
              filename: 'studio-bookings',
              title: 'Studio Bookings',
              subtitle: `${stats.total} sessions - $${stats.revenue} revenue`
            })}
            onPrint={() => print('Studio Bookings')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={isDark ? 'dark' : 'light'}
            disabled={sessions.length === 0}
          />
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.studioBooking.newBooking', 'New Booking')}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className={cardClass}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? t('tools.studioBooking.editSession', 'Edit Session') : t('tools.studioBooking.newSession', 'New Session')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.studioBooking.clientName', 'Client Name *')}</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className={inputClass}
                placeholder={t('tools.studioBooking.clientOrBandName', 'Client or band name')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.studioBooking.email', 'Email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                placeholder={t('tools.studioBooking.clientEmailCom', 'client@email.com')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.studioBooking.phone', 'Phone')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.studioBooking.sessionType', 'Session Type')}</label>
              <select
                value={formData.sessionType}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value as StudioSession['sessionType'] })}
                className={inputClass}
              >
                {sessionTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.studioBooking.room', 'Room')}</label>
              <select
                value={formData.roomName}
                onChange={(e) => handleRoomChange(e.target.value)}
                className={inputClass}
              >
                {rooms.map(r => (
                  <option key={r.name} value={r.name}>{r.name} (${r.rate}/hr)</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.studioBooking.date', 'Date *')}</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.studioBooking.startTime', 'Start Time')}</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.studioBooking.endTime', 'End Time')}</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Duration: {formData.duration}h</label>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-[#252525]' : 'bg-gray-100'}`}>
                <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${formData.duration * formData.hourlyRate + (formData.engineerRequired ? formData.duration * 35 : 0)} total
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.studioBooking.depositAmount', 'Deposit Amount')}</label>
              <input
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.studioBooking.status', 'Status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StudioSession['status'] })}
                className={inputClass}
              >
                <option value="pending">{t('tools.studioBooking.pending3', 'Pending')}</option>
                <option value="confirmed">{t('tools.studioBooking.confirmed3', 'Confirmed')}</option>
                <option value="in-progress">{t('tools.studioBooking.inProgress2', 'In Progress')}</option>
                <option value="completed">{t('tools.studioBooking.completed2', 'Completed')}</option>
                <option value="cancelled">{t('tools.studioBooking.cancelled2', 'Cancelled')}</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.engineerRequired}
                  onChange={(e) => setFormData({ ...formData, engineerRequired: e.target.checked })}
                  className="w-5 h-5 rounded text-[#0D9488]"
                />
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.studioBooking.engineer35Hr', 'Engineer (+$35/hr)')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.depositPaid}
                  onChange={(e) => setFormData({ ...formData, depositPaid: e.target.checked })}
                  className="w-5 h-5 rounded text-[#0D9488]"
                />
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.studioBooking.depositPaid', 'Deposit Paid')}</span>
              </label>
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="mt-4">
            <label className={labelClass}>{t('tools.studioBooking.equipmentNeeded', 'Equipment Needed')}</label>
            <div className="flex flex-wrap gap-2">
              {equipment.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleEquipmentToggle(item)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.equipmentNeeded.includes(item)
                      ? 'bg-[#0D9488] text-white'
                      : isDark ? 'bg-[#252525] text-gray-300 hover:bg-[#333]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className={labelClass}>{t('tools.studioBooking.notes', 'Notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`${inputClass} h-20 resize-none`}
              placeholder={t('tools.studioBooking.sessionNotesSpecialRequests', 'Session notes, special requests...')}
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={saveSession}
              disabled={!formData.clientName || !formData.date}
              className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? t('tools.studioBooking.updateSession', 'Update Session') : t('tools.studioBooking.saveSession', 'Save Session')}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }}
              className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#252525] text-white hover:bg-[#333]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {t('tools.studioBooking.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className={`${cardClass} text-center py-12`}>
            <Building2 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.studioBooking.noBookingsFound', 'No bookings found')}</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-[#0D9488] hover:underline"
            >
              {t('tools.studioBooking.createYourFirstBooking', 'Create your first booking')}
            </button>
          </div>
        ) : (
          filteredSessions.map(session => (
            <div key={session.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {session.clientName}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[session.status]}`}>
                      {session.status}
                    </span>
                    {!session.depositPaid && session.status !== 'cancelled' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                        {t('tools.studioBooking.depositDue', 'Deposit Due')}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {sessionTypes.find(t => t.value === session.sessionType)?.label} • {session.roomName}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {session.date} • {session.startTime} - {session.endTime} ({session.duration}h)
                    {session.engineerRequired && ' • + Engineer'}
                  </p>
                  {session.equipmentNeeded.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {session.equipmentNeeded.map(eq => (
                        <span key={eq} className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-[#252525] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {eq}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#0D9488]">
                    ${getSessionTotal(session)}
                  </span>
                  <button
                    onClick={() => handleEdit(session)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-100'}`}
                  >
                    <Edit2 className="w-4 h-4 text-[#0D9488]" />
                  </button>
                  <button
                    onClick={() => deleteItem(session.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudioBookingTool;
