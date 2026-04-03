import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Calendar, Clock, DollarSign, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Booking {
  id: string;
  client: string;
  project: string;
  room: string;
  date: string;
  startTime: string;
  duration: number;
  hourlyRate: number;
  engineer: boolean;
  status: 'upcoming' | 'in-progress' | 'completed';
}

const rooms = ['Studio A (Large)', 'Studio B (Medium)', 'Vocal Booth', 'Mixing Room', 'Podcast Room'];

const COLUMNS: ColumnConfig[] = [
  { key: 'client', header: 'Client', type: 'string' },
  { key: 'project', header: 'Project', type: 'string' },
  { key: 'room', header: 'Room', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'duration', header: 'Duration (hrs)', type: 'number' },
  { key: 'hourlyRate', header: 'Hourly Rate ($)', type: 'currency' },
  { key: 'engineer', header: 'Engineer Included', type: 'boolean' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'total', header: 'Total ($)', type: 'currency' },
];

interface RecordingStudioToolProps {
  uiConfig?: UIConfig;
}

export const RecordingStudioTool: React.FC<RecordingStudioToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client: '', project: '', room: rooms[0], date: '', startTime: '10:00', duration: 4, hourlyRate: 75, engineer: true,
  });

  // Use the useToolData hook for backend persistence
  const {
    data: bookings,
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
  } = useToolData<Booking>('recording-studio', [], COLUMNS);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.room && rooms.includes(params.room)) {
        setFormData(prev => ({ ...prev, room: params.room as string }));
        hasChanges = true;
      }
      if (params.duration) {
        setFormData(prev => ({ ...prev, duration: params.duration as number }));
        hasChanges = true;
      }
      if (params.hourlyRate) {
        setFormData(prev => ({ ...prev, hourlyRate: params.hourlyRate as number }));
        hasChanges = true;
      }
      if (params.client) {
        setFormData(prev => ({ ...prev, client: params.client as string }));
        hasChanges = true;
      }
      if (params.project) {
        setFormData(prev => ({ ...prev, project: params.project as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addBooking = () => {
    const newBooking: Booking = { id: Date.now().toString(), ...formData, status: 'upcoming' };
    addItem(newBooking);
    setShowForm(false);
    setFormData({ client: '', project: '', room: rooms[0], date: '', startTime: '10:00', duration: 4, hourlyRate: 75, engineer: true });
  };

  const updateStatus = (id: string, status: Booking['status']) => {
    updateItem(id, { status });
  };

  const handleDeleteBooking = (id: string) => deleteItem(id);

  const totalBookings = bookings.length;
  const upcomingHours = bookings.filter(b => b.status !== 'completed').reduce((sum, b) => sum + b.duration, 0);
  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.duration * b.hourlyRate, 0);

  const inputClass = `w-full p-3 rounded-lg border ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#0D9488]`;
  const cardClass = `p-4 rounded-lg ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`;

  const statusColors = {
    upcoming: 'bg-blue-500/10 text-blue-500',
    'in-progress': 'bg-yellow-500/10 text-yellow-500',
    completed: 'bg-green-500/10 text-green-500',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] mb-4">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.recordingStudio.recordingStudio', 'Recording Studio')}</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.recordingStudio.manageStudioBookingsAndSessions', 'Manage studio bookings and sessions')}</p>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.recordingStudio.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-[#0D9488]/10 rounded-lg"><Calendar className="w-6 h-6 text-[#0D9488]" /></div>
          <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recordingStudio.bookings', 'Bookings')}</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalBookings}</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-purple-500/10 rounded-lg"><Clock className="w-6 h-6 text-purple-500" /></div>
          <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recordingStudio.upcomingHours', 'Upcoming Hours')}</p>
            <p className="text-xl font-bold text-purple-500">{upcomingHours}h</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-green-500/10 rounded-lg"><DollarSign className="w-6 h-6 text-green-500" /></div>
          <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recordingStudio.revenue', 'Revenue')}</p>
            <p className="text-xl font-bold text-green-500">${totalRevenue}</p></div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <WidgetEmbedButton toolSlug="recording-studio" toolName="Recording Studio" />

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
          onExportCSV={() => exportCSV({ filename: 'recording-studio-bookings' })}
          onExportExcel={() => exportExcel({ filename: 'recording-studio-bookings' })}
          onExportJSON={() => exportJSON({ filename: 'recording-studio-bookings' })}
          onExportPDF={() => exportPDF({
            filename: 'recording-studio-bookings',
            title: 'Recording Studio Bookings',
            subtitle: `${totalBookings} booking(s) - $${totalRevenue} revenue`
          })}
          onPrint={() => print('Recording Studio Bookings')}
          onCopyToClipboard={() => copyToClipboard('tab')}
          onImportCSV={async (file) => { await importCSV(file); }}
          onImportJSON={async (file) => { await importJSON(file); }}
          theme={isDark ? 'dark' : 'light'}
          disabled={bookings.length === 0}
        />
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]">
          <Plus className="w-5 h-5" />New Booking
        </button>
      </div>

      {showForm && (
        <div className={cardClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder={t('tools.recordingStudio.clientName', 'Client Name')} value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })} className={inputClass} />
            <input type="text" placeholder={t('tools.recordingStudio.projectName', 'Project Name')} value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })} className={inputClass} />
            <select value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} className={inputClass}>
              {rooms.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputClass} />
            <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className={inputClass} />
            <input type="number" placeholder={t('tools.recordingStudio.durationHours', 'Duration (hours)')} value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} className={inputClass} />
            <input type="number" placeholder={t('tools.recordingStudio.hourlyRate', 'Hourly Rate ($)')} value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })} className={inputClass} />
            <label className="flex items-center gap-2 p-3">
              <input type="checkbox" checked={formData.engineer}
                onChange={(e) => setFormData({ ...formData, engineer: e.target.checked })}
                className="w-5 h-5 rounded text-[#0D9488]" />
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.recordingStudio.includeEngineer25Hr', 'Include Engineer (+$25/hr)')}</span>
            </label>
          </div>
          <button onClick={addBooking} disabled={!formData.client || !formData.date}
            className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg disabled:opacity-50">{t('tools.recordingStudio.saveBooking', 'Save Booking')}</button>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map(b => (
          <div key={b.id} className={cardClass}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{b.client}</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {b.project} • {b.room}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {b.date} at {b.startTime} • {b.duration}h {b.engineer && '+ Engineer'}
                </p>
              </div>
              <button onClick={() => handleDeleteBooking(b.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                <Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[b.status]}`}>{b.status}</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#0D9488]">
                  ${b.duration * b.hourlyRate + (b.engineer ? b.duration * 25 : 0)}
                </span>
                <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value as Booking['status'])}
                  className={`text-sm p-1 rounded border ${isDark ? 'bg-[#252525] border-[#333] text-white' : 'bg-white border-gray-300'}`}>
                  <option value="upcoming">{t('tools.recordingStudio.upcoming', 'Upcoming')}</option>
                  <option value="in-progress">{t('tools.recordingStudio.inProgress', 'In Progress')}</option>
                  <option value="completed">{t('tools.recordingStudio.completed', 'Completed')}</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordingStudioTool;
