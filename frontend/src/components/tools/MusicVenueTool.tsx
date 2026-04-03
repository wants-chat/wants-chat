import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Calendar, Users, DollarSign, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Event {
  id: string;
  artist: string;
  genre: string;
  date: string;
  time: string;
  ticketPrice: number;
  capacity: number;
  ticketsSold: number;
  status: 'upcoming' | 'on-sale' | 'sold-out' | 'completed';
}

const genres = ['Rock', 'Pop', 'Jazz', 'Classical', 'Electronic', 'Hip-Hop', 'Country', 'R&B', 'Folk', 'Metal'];

const COLUMNS: ColumnConfig[] = [
  { key: 'artist', header: 'Artist/Band', type: 'string' },
  { key: 'genre', header: 'Genre', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'ticketPrice', header: 'Ticket Price', type: 'currency' },
  { key: 'capacity', header: 'Capacity', type: 'number' },
  { key: 'ticketsSold', header: 'Tickets Sold', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
];

interface MusicVenueToolProps {
  uiConfig?: UIConfig;
}

export const MusicVenueTool: React.FC<MusicVenueToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    artist: '', genre: 'Rock', date: '', time: '20:00', ticketPrice: 25, capacity: 500,
  });

  // Use the useToolData hook for backend persistence
  const {
    data: events,
    setData: setEvents,
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
  } = useToolData<Event>('music-venue', [], COLUMNS);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.genre && genres.includes(params.genre)) {
        setFormData(prev => ({ ...prev, genre: params.genre as string }));
        hasChanges = true;
      }
      if (params.ticketPrice) {
        setFormData(prev => ({ ...prev, ticketPrice: params.ticketPrice as number }));
        hasChanges = true;
      }
      if (params.capacity) {
        setFormData(prev => ({ ...prev, capacity: params.capacity as number }));
        hasChanges = true;
      }
      if (params.artist) {
        setFormData(prev => ({ ...prev, artist: params.artist as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleAddEvent = () => {
    const newEvent: Event = { id: Date.now().toString(), ...formData, ticketsSold: 0, status: 'upcoming' };
    addItem(newEvent);
    setShowForm(false);
    setFormData({ artist: '', genre: 'Rock', date: '', time: '20:00', ticketPrice: 25, capacity: 500 });
  };

  const sellTickets = (id: string, count: number) => {
    const event = events.find(e => e.id === id);
    if (event) {
      const newSold = Math.min(event.ticketsSold + count, event.capacity);
      updateItem(id, {
        ticketsSold: newSold,
        status: newSold >= event.capacity ? 'sold-out' : 'on-sale'
      });
    }
  };

  const handleDeleteEvent = (id: string) => deleteItem(id);

  const totalRevenue = events.reduce((sum, e) => sum + e.ticketsSold * e.ticketPrice, 0);
  const totalTicketsSold = events.reduce((sum, e) => sum + e.ticketsSold, 0);

  const inputClass = `w-full p-3 rounded-lg border ${
    isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:ring-2 focus:ring-[#0D9488]`;

  const cardClass = `p-4 rounded-lg ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`;

  const statusColors = {
    upcoming: 'bg-blue-500/10 text-blue-500',
    'on-sale': 'bg-green-500/10 text-green-500',
    'sold-out': 'bg-red-500/10 text-red-500',
    completed: 'bg-gray-500/10 text-gray-500',
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
          <Music className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.musicVenue.musicVenueManager', 'Music Venue Manager')}
        </h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          {t('tools.musicVenue.manageEventsTicketsAndVenue', 'Manage events, tickets, and venue bookings')}
        </p>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.musicVenue.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-[#0D9488]/10 rounded-lg"><Calendar className="w-6 h-6 text-[#0D9488]" /></div>
          <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.musicVenue.totalEvents', 'Total Events')}</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{events.length}</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-purple-500/10 rounded-lg"><Users className="w-6 h-6 text-purple-500" /></div>
          <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.musicVenue.ticketsSold', 'Tickets Sold')}</p>
            <p className="text-xl font-bold text-purple-500">{totalTicketsSold}</p></div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 bg-green-500/10 rounded-lg"><DollarSign className="w-6 h-6 text-green-500" /></div>
          <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.musicVenue.revenue', 'Revenue')}</p>
            <p className="text-xl font-bold text-green-500">${totalRevenue.toLocaleString()}</p></div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <WidgetEmbedButton toolSlug="music-venue" toolName="Music Venue" />

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
          onExportCSV={() => exportCSV({ filename: 'music_venue_events' })}
          onExportExcel={() => exportExcel({ filename: 'music_venue_events' })}
          onExportJSON={() => exportJSON({ filename: 'music_venue_events' })}
          onExportPDF={() => exportPDF({ filename: 'music_venue_events', title: 'Music Venue Events' })}
          onPrint={() => print('Music Venue Events')}
          onCopyToClipboard={() => copyToClipboard('tab')}
          onImportCSV={async (file) => { await importCSV(file); }}
          onImportJSON={async (file) => { await importJSON(file); }}
          disabled={events.length === 0}
          theme={isDark ? 'dark' : 'light'}
        />
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276]">
          <Plus className="w-5 h-5" />Add Event
        </button>
      </div>

      {showForm && (
        <div className={cardClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder={t('tools.musicVenue.artistBandName', 'Artist/Band Name')} value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })} className={inputClass} />
            <select value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} className={inputClass}>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputClass} />
            <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className={inputClass} />
            <input type="number" placeholder={t('tools.musicVenue.ticketPrice', 'Ticket Price ($)')} value={formData.ticketPrice}
              onChange={(e) => setFormData({ ...formData, ticketPrice: parseFloat(e.target.value) })} className={inputClass} />
            <input type="number" placeholder={t('tools.musicVenue.capacity', 'Capacity')} value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} className={inputClass} />
          </div>
          <button onClick={handleAddEvent} disabled={!formData.artist || !formData.date}
            className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50">{t('tools.musicVenue.saveEvent', 'Save Event')}</button>
        </div>
      )}

      <div className="space-y-4">
        {events.map(e => (
          <div key={e.id} className={cardClass}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{e.artist}</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {e.genre} • {e.date} at {e.time}
                </p>
              </div>
              <button onClick={() => handleDeleteEvent(e.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                <Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[e.status]}`}>{e.status}</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {e.ticketsSold}/{e.capacity} tickets
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0D9488]">${e.ticketPrice}</span>
                <button onClick={() => sellTickets(e.id, 10)} disabled={e.ticketsSold >= e.capacity}
                  className="text-sm px-3 py-1 bg-[#0D9488] text-white rounded hover:bg-[#0B8276] disabled:opacity-50">
                  {t('tools.musicVenue.10Tickets', '+10 Tickets')}
                </button>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-[#0D9488] h-2 rounded-full" style={{ width: `${(e.ticketsSold / e.capacity) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && !showForm && (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('tools.musicVenue.noEventsYetAddYour', 'No events yet. Add your first event to start managing your venue!')}</p>
        </div>
      )}
    </div>
  );
};

export default MusicVenueTool;
